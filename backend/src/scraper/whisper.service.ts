import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as childProcess from 'child_process';
import ffmpegPath from 'ffmpeg-static';

@Injectable()
export class WhisperService {
    private readonly logger = new Logger(WhisperService.name);
    private pipeline: any = null;
    private isInitializing = false;

    private async getPipeline() {
        if (this.pipeline) return this.pipeline;

        if (this.isInitializing) {
            while (this.isInitializing) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            return this.pipeline;
        }

        this.isInitializing = true;
        try {
            this.logger.log('🔄 Lade Whisper-Modell (onnx-community/whisper-base)...');
            this.logger.log('   Erster Start: Download ~150MB, danach gecacht.');

            const { pipeline, env } = await import('@huggingface/transformers');

            // Cache-Pfad setzen (für Docker-Volume)
            env.cacheDir = process.env.HF_MODEL_CACHE || path.join(process.cwd(), 'data', 'whisper-models');

            this.pipeline = await pipeline(
                'automatic-speech-recognition',
                'onnx-community/whisper-base',
                { dtype: 'q8' },
            );

            this.logger.log('✅ Whisper-Modell erfolgreich geladen!');
        } finally {
            this.isInitializing = false;
        }

        return this.pipeline;
    }

    /**
     * Konvertiert eine Audiodatei zu 16kHz mono Float32-Rohdaten via ffmpeg.
     * AudioContext ist in Node.js nicht verfügbar — daher diese Methode.
     */
    private async decodeAudioToFloat32(audioFilePath: string): Promise<Float32Array> {
        const rawOutputPath = audioFilePath.replace(/\.[^/.]+$/, '.raw');
        const ffmpeg = ffmpegPath || 'ffmpeg';

        await new Promise<void>((resolve, reject) => {
            const proc = childProcess.spawn(ffmpeg, [
                '-i', audioFilePath,
                '-ar', '16000',   // 16kHz — Whisper erwartet 16kHz
                '-ac', '1',       // Mono
                '-f', 'f32le',    // 32-bit Float Little-Endian
                '-y',             // Überschreiben
                rawOutputPath,
            ]);

            proc.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`ffmpeg Konvertierung fehlgeschlagen (Exit ${code})`));
            });
            proc.on('error', reject);
        });

        const rawBuffer = fs.readFileSync(rawOutputPath);
        fs.unlinkSync(rawOutputPath); // Aufräumen

        // Bytes → Float32Array
        return new Float32Array(
            rawBuffer.buffer,
            rawBuffer.byteOffset,
            rawBuffer.byteLength / 4,
        );
    }

    /**
     * Transkribiert eine Audio-Datei auf Deutsch.
     * Gibt null zurück wenn ein Fehler auftritt (kein Hard-Fail).
     */
    async transcribe(audioFilePath: string): Promise<string | null> {
        try {
            this.logger.log(`🎙️ Starte Transkription: ${audioFilePath}`);
            const startTime = Date.now();

            this.logger.log('   Dekodiere Audio via ffmpeg (16kHz, mono, Float32)...');
            const audioData = await this.decodeAudioToFloat32(audioFilePath);
            this.logger.log(`   Audio dekodiert: ${audioData.length} Samples (${(audioData.length / 16000).toFixed(1)}s)`);

            const transcriber = await this.getPipeline();
            const result = await transcriber(audioData, {
                language: 'de',
                task: 'transcribe',
                chunk_length_s: 30,
                return_timestamps: false,
            });

            const transcript = Array.isArray(result)
                ? result.map((r: any) => r.text).join(' ')
                : (result as any).text || '';

            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            this.logger.log(`✅ Transkription abgeschlossen (${duration}s): "${transcript.substring(0, 150)}..."`);
            return transcript;
        } catch (error: any) {
            this.logger.error(`❌ Transkription fehlgeschlagen: ${error.message}`);
            return null;
        }
    }

    /**
     * Prüft ob eine Beschreibung ausreichende Rezeptinfos enthält (Zutaten UND Schritte).
     * Gibt true zurück wenn Transkription NÖTIG ist.
     */
    static needsTranscription(description: string): boolean {
        if (!description || description.length < 300) return true;

        const lowerDesc = description.toLowerCase();

        // Zutaten-Kennzeichen
        const hasIngredients =
            lowerDesc.includes('zutaten') ||
            lowerDesc.includes(' g ') ||
            lowerDesc.includes(' ml ') ||
            lowerDesc.includes(' el ') ||
            lowerDesc.includes(' tl ') ||
            lowerDesc.includes('gramm') ||
            /\d+\s*(g|ml|kg|l)\b/.test(lowerDesc);

        // Zubereitungs-Kennzeichen
        const cookingVerbs = ['kochen', 'backen', 'vermischen', 'verrühren', 'erhitzen',
            'geben', 'schneiden', 'braten', 'dünsten', 'garen', 'rühren',
            'hinzufügen', 'zubereitung', 'schritt', 'dann', 'anschließend',
            'danach', 'zuerst', 'zunächst'];

        const verbMatches = cookingVerbs.filter(verb => lowerDesc.includes(verb)).length;
        const hasInstructions = verbMatches >= 3;

        return !(hasIngredients && hasInstructions);
    }
}
