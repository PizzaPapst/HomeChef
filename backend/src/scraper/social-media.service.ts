import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import youtubedl from 'youtube-dl-exec';
import ffmpegPath from 'ffmpeg-static';
import { WhisperService } from './whisper.service';

@Injectable()
export class SocialMediaService {
    private readonly logger = new Logger(SocialMediaService.name);

    constructor(private readonly whisperService: WhisperService) { }

    async downloadAndProcess(url: string): Promise<{
        title: string;
        description: string;
        imageUrl: string | null;
        transcript: string | null;
    }> {
        try {
            this.logger.log(`[1/3] Starte Metadaten-Download für: ${url}`);

            const isTikTok = url.includes('tiktok.com') || url.includes('vm.tiktok.com');

            const commonOptions: any = {
                dumpSingleJson: true,
                noCheckCertificates: true,
                noWarnings: true,
            };

            if (isTikTok) {
                commonOptions.addHeader = [
                    'referer:https://www.tiktok.com/',
                    'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                ];
            } else {
                commonOptions.addHeader = [
                    'referer:youtube.com',
                    'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                ];
            }

            const output = await youtubedl(url, commonOptions) as any;

            const title = output.title || 'Social Media Video';
            const description = output.description || '';
            const imageUrl = output.thumbnail || null;

            this.logger.log(`[2/3] Metadaten extrahiert:`);
            this.logger.log(`  Titel: "${title}"`);
            this.logger.log(`  Beschreibung (${description.length} Zeichen): "${description.substring(0, 300)}..."`);

            // Prüfen ob Transkription nötig ist
            const needsTranscript = WhisperService.needsTranscription(description);
            this.logger.log(`  Transkription nötig: ${needsTranscript ? 'JA 🎙️' : 'NEIN ✅ (Beschreibung ausreichend)'}`);

            let transcript: string | null = null;

            if (needsTranscript) {
                transcript = await this.downloadAudioAndTranscribe(url, isTikTok, commonOptions.addHeader);
            }

            return { title, description, imageUrl, transcript };
        } catch (error: any) {
            this.logger.error(`Fehler beim Verarbeiten der URL: ${url}`);
            this.logger.error(`  Fehler: ${error.message}`);
            if (error.stderr) this.logger.error(`  Stderr: ${error.stderr}`);
            throw error;
        }
    }

    private async downloadAudioAndTranscribe(
        url: string,
        isTikTok: boolean,
        addHeader: string[],
    ): Promise<string | null> {
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'homechef-'));
        const outputPath = path.join(tempDir, 'audio.mp3');

        try {
            this.logger.log(`[3/3] Lade Audio herunter für Transkription: ${outputPath}`);

            await youtubedl(url, {
                extractAudio: true,
                audioFormat: 'mp3',
                output: outputPath,
                noCheckCertificates: true,
                noWarnings: true,
                ffmpegLocation: ffmpegPath || undefined,
                addHeader,
            });

            if (!fs.existsSync(outputPath)) {
                const files = fs.readdirSync(tempDir);
                this.logger.warn(`  Audio nicht gefunden. Dateien in temp: ${files.join(', ')}`);
                return null;
            }

            const audioSize = fs.statSync(outputPath).size;
            this.logger.log(`  Audio heruntergeladen (${Math.round(audioSize / 1024)} KB). Starte Whisper...`);

            const transcript = await this.whisperService.transcribe(outputPath);
            return transcript;
        } finally {
            // Temporäre Dateien aufräumen
            try {
                if (fs.existsSync(tempDir)) {
                    fs.rmSync(tempDir, { recursive: true, force: true });
                    this.logger.log(`  Temp-Verzeichnis aufgeräumt.`);
                }
            } catch (e: any) {
                this.logger.warn(`  Cleanup fehlgeschlagen: ${e.message}`);
            }
        }
    }
}
