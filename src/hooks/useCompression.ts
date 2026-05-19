import { useState } from 'react';
import imageCompression from 'browser-image-compression';

export interface CompressionSettings {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  forumMode?: boolean;
}

export interface CompressionResult {
  originalFile: File;
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  savings: number;
  originalUrl: string;
  compressedUrl: string;
}

export const useCompression = () => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [results, setResults] = useState<CompressionResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const compressImage = async (file: File, settings: CompressionSettings) => {
    // Keep internal for single file logic but we'll use a new batch function
    try {
      let compressedBlob: Blob;

      if (settings.forumMode) {
        const targetSize = 10 * 1024;
        let quality = 0.8;
        let scale = 1.0;
        let currentBlob: Blob = file;
        const img = await imageCompression.drawFileInCanvas(file);
        const [canvas] = img;

        while (true) {
          const tempCanvas = document.createElement('canvas');
          const ctx = tempCanvas.getContext('2d')!;
          tempCanvas.width = canvas.width * scale;
          tempCanvas.height = canvas.height * scale;
          ctx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
          currentBlob = await new Promise((resolve) => {
            tempCanvas.toBlob((b) => resolve(b!), 'image/jpeg', quality);
          });
          if (currentBlob.size < targetSize) break;
          if (quality > 0.2) quality -= 0.1;
          else { scale *= 0.9; quality = 0.8; }
          if (scale < 0.05) break;
        }
        compressedBlob = currentBlob;
      } else {
        compressedBlob = await imageCompression(file, {
          maxSizeMB: settings.maxSizeMB,
          maxWidthOrHeight: settings.maxWidthOrHeight,
          useWebWorker: settings.useWebWorker,
        });
      }

      const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
      return {
        originalFile: file,
        compressedFile,
        originalSize: file.size,
        compressedSize: compressedFile.size,
        savings: ((file.size - compressedFile.size) / file.size) * 100,
        originalUrl: URL.createObjectURL(file),
        compressedUrl: URL.createObjectURL(compressedFile),
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const compressImages = async (files: File[], settings: CompressionSettings) => {
    setIsCompressing(true);
    setError(null);
    const newResults: CompressionResult[] = [];
    
    try {
      for (const file of files) {
        const res = await compressImage(file, settings);
        newResults.push(res);
      }
      setResults(newResults);
    } catch (err) {
      setError('errorCompression');
    } finally {
      setIsCompressing(false);
    }
  };

  const reset = () => {
    results.forEach(res => {
      URL.revokeObjectURL(res.originalUrl);
      URL.revokeObjectURL(res.compressedUrl);
    });
    setResults([]);
    setError(null);
  };

  return { compressImages, isCompressing, results, error, reset };
};
