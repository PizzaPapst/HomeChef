import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer-extra'; 
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { AiService } from '../ai/ai.service';

// Interface für das Rückgabe-Format unserer Fetcher
interface FetchResult {
    data: any | null; // Das JSON-LD (falls gefunden)
    htmlText: string; // Der reine Text der Seite (für die KI)
}

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  constructor(private aiService: AiService) {
    puppeteer.use(StealthPlugin());
  }

  async scrapeRecipe(url: string) {
    let result: FetchResult = { data: null, htmlText: '' };

    try {
      // --- STRATEGIE 1: AXIOS (Schnell) ---
      this.logger.log(`Versuche Axios für: ${url}`);
      result = await this.fetchWithAxios(url);

    } catch (error) {
      const isBlocked = axios.isAxiosError(error) && (error.response?.status === 403 || error.response?.status === 401);
      
      if (isBlocked) {
        // --- STRATEGIE 2: PUPPETEER (Tarnkappe) ---
        this.logger.warn(`Axios blockiert (403). Starte Puppeteer für: ${url}`);
        // Hier fangen wir Fehler ab, damit wir im Zweifel null zurückbekommen
        try {
            result = await this.fetchWithPuppeteer(url);
        } catch (pupError) {
            this.logger.error("Puppeteer komplett gescheitert", pupError);
        }
      } else {
        throw error; // Echte Netzwerkfehler (DNS etc.) werfen wir weiter
      }
    }

    // --- ANALYSE & KI FALLBACK ---

    // 1. Haben wir strukturiertes JSON-LD gefunden?
    if (result.data && (result.data.name || result.data.headline)) {
        this.logger.log('JSON-LD gefunden. Nutze Standard-Parser.');
        
        // Sicherheits-Fallback für fehlenden Namen im JSON
        if (!result.data.name) {
             result.data.name = await this.fetchTitleFromMetadata(url);
        }
        return this.mapSchemaToRecipe(result.data, url);
    }

    // 2. Kein JSON-LD? Dann fragen wir die KI mit dem Text
    if (result.htmlText && result.htmlText.length > 500) {
        this.logger.warn('Kein strukturiertes JSON-LD. Starte KI-Analyse...');
        const aiData = await this.aiService.parseRecipeFromHtml(result.htmlText);

        if (aiData && aiData.name) {
            // Die KI liefert JSON im Schema.org Format, daher können wir die gleiche Map-Funktion nutzen
            return this.mapSchemaToRecipe(aiData, url);
        }
    }

    // 3. Wenn alles fehlschlägt
    this.logger.error('Alle Strategien fehlgeschlagen. Kein Rezept extrahierbar.');
    throw new HttpException(
        'Rezept konnte nicht geladen werden (Seite blockiert oder Struktur unbekannt).', 
        HttpStatus.BAD_REQUEST
    );
  }

  // --- FETCHER METHODEN ---

  private async fetchWithAxios(url: string): Promise<FetchResult> {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      timeout: 5000
    });

    const $ = cheerio.load(data);
    const jsonLd = this.extractJsonLdFromCheerio($);
    // Wir holen uns den reinen Text vom Body für die KI (falls JSON fehlt)
    const text = $('body').text().replace(/\s+/g, ' ').trim();

    return { data: jsonLd, htmlText: text };
  }

  private async fetchWithPuppeteer(url: string): Promise<FetchResult> {
    const browser = await puppeteer.launch({ 
      headless: true, // Setze auf false zum Debuggen
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
      defaultViewport: null
    });
    
    const page = await browser.newPage();
    let jsonData = null;
    let bodyText = '';

    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
      
      // Laden & Warten
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });

      // Cookie Banner (Versuch)
      try {
        const btn = await page.$('#uc-btn-accept-banner'); // Rewe Selector
        if (btn) await btn.click();
      } catch (e) {}

      // Scrollen
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await new Promise(r => setTimeout(r, 1000));

      // 1. Versuch: JSON-LD auslesen
      jsonData = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
        for (const script of scripts) {
          try {
            const content = JSON.parse(script.innerHTML);
            const items = Array.isArray(content) ? content : [content];
            const recipe = items.find(i => 
              i['@type'] === 'Recipe' || (Array.isArray(i['@type']) && i['@type'].includes('Recipe'))
            );
            if (recipe) return recipe;
          } catch (e) { continue; }
        }
        return null;
      });

      // 2. Backup: Den sichtbaren Text der Seite holen (für die KI)
      bodyText = await page.evaluate(() => document.body.innerText);

    } catch (e) {
      this.logger.error('Puppeteer Fehler:', e);
    } finally {
      await browser.close();
    }

    return { data: jsonData, htmlText: bodyText };
  }

  // --- HELPER METHODEN ---

  private extractJsonLdFromCheerio($: cheerio.CheerioAPI) {
    let foundData = null;
    $('script[type="application/ld+json"]').each((i, el) => {
      try {
        const parsed = JSON.parse($(el).html() || '{}');
        const schema = Array.isArray(parsed) ? parsed.find(s => s['@type'] === 'Recipe') : parsed;
        if (schema && (schema['@type'] === 'Recipe' || schema['@type']?.includes('Recipe'))) {
          foundData = schema;
          return false;
        }
      } catch (e) {}
    });
    return foundData;
  }

  private async fetchTitleFromMetadata(url: string) {
      try {
          const { data } = await axios.get(url, { timeout: 3000 });
          const $ = cheerio.load(data);
          return $('title').text().split('|')[0].trim() || 'Unbekanntes Rezept';
      } catch (e) {
          return 'Unbekanntes Rezept';
      }
  }

  private mapSchemaToRecipe(data: any, originalUrl: string) {
    // Zutaten bereinigen
    const ingredients = (data.recipeIngredient || []).map(ing => {
        return { 
          name: ing.toString().replace(/\s+/g, ' ').trim(), 
          amount: '', 
          unit: '' 
        };
    });

    // Instructions normalisieren (Rekursiv)
    const rawInstructions = this.normalizeInstructions(data.recipeInstructions);
    const instructions = rawInstructions
        .map(text => this.cleanText(text))
        .filter(text => text && text.length > 5)
        .map((text, index) => ({
            step: index + 1,
            text: text
        }));

    // Zeiten
    const timeString = data.prepTime || data.totalTime || data.cookTime;

    return {
      title: data.name || 'KI-Generiertes Rezept', // Fallback
      sourceUrl: originalUrl,
      imageUrl: this.extractImageUrl(data.image),
      servings: parseInt(data.recipeYield) || 4,
      prepTime: this.parseDuration(timeString), 
      ingredients: ingredients,
      instructions: instructions
    };
  }

  private normalizeInstructions(data: any): string[] {
    if (!data) return [];
    if (Array.isArray(data)) {
        return data.reduce((acc, item) => acc.concat(this.normalizeInstructions(item)), [] as string[]);
    }
    if (typeof data === 'object') {
        if (data.itemListElement) return this.normalizeInstructions(data.itemListElement);
        if (data.text) return [data.text];
        if (data.name && data['@type'] !== 'HowToSection') return [data.name];
    }
    if (typeof data === 'string') return [data];
    return [];
  }

  private cleanText(text: string): string {
      if (!text) return '';
      return text.replace(/<[^>]*>?/gm, '').trim();
  }

  private parseDuration(isoDuration: string): number {
    if (!isoDuration || typeof isoDuration !== 'string') return 0;
    const match = isoDuration.match(/P(?:.*?T)?(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return 0;
    let minutes = 0;
    if (match[1]) minutes += parseInt(match[1]) * 60;
    if (match[2]) minutes += parseInt(match[2]);
    return minutes;
  }

  // --- Helper: Bild-URL sicher extrahieren ---
  private extractImageUrl(imageField: any): string {
    if (!imageField) return '';

    // Fall 1: Es ist direkt ein String
    if (typeof imageField === 'string') return imageField;

    // Fall 2: Es ist ein Array -> Wir nehmen das erste Element und prüfen rekursiv
    if (Array.isArray(imageField)) {
        return this.extractImageUrl(imageField[0]);
    }

    // Fall 3: Es ist ein Objekt (ImageObject) -> Wir brauchen die 'url' Eigenschaft
    if (typeof imageField === 'object' && imageField.url) {
        return imageField.url;
    }

    return '';
  }
}