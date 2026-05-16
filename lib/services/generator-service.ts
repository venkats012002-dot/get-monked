import type { GenerateRequest, GenerationResult } from "../types";
import { ImageProvider } from "../providers/image-provider";
import { TextProvider } from "../providers/text-provider";

const COMPOSITE_SIZE = 1024;

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Image failed to load"));
    img.src = url;
  });
  return img;
}

export class GeneratorService {
  static async generate(request: GenerateRequest): Promise<GenerationResult> {
    try {
      const imagePrompt = ImageProvider.buildPrompt();
      const [imageUrl, quote] = await Promise.all([
        ImageProvider.generateImage({ prompt: imagePrompt, size: "1024x1024" }),
        TextProvider.generateQuote({ seed: request.seed }),
      ]);
      return {
        id: request.seed,
        imageUrl,
        quote,
        alt: ImageProvider.generateAlt(),
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Generation failed:", error);
      throw new Error("Failed to generate content. Please try again.");
    }
  }

  static generateSeed(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  static async buildCompositeBlob(
    generation: GenerationResult,
  ): Promise<Blob> {
    const canvas = document.createElement("canvas");
    canvas.width = COMPOSITE_SIZE;
    canvas.height = COMPOSITE_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");

    const img = await loadImage(generation.imageUrl);
    const scale = Math.max(
      COMPOSITE_SIZE / img.width,
      COMPOSITE_SIZE / img.height,
    );
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    ctx.drawImage(
      img,
      (COMPOSITE_SIZE - drawW) / 2,
      (COMPOSITE_SIZE - drawH) / 2,
      drawW,
      drawH,
    );

    const maxTextWidth = COMPOSITE_SIZE * 0.9;
    let fontSize = 68;
    let lines: string[] = [];
    while (fontSize >= 40) {
      ctx.font = `bold ${fontSize}px "PT Serif", Georgia, serif`;
      lines = wrapLines(ctx, generation.quote, maxTextWidth);
      if (lines.length <= 4) break;
      fontSize -= 4;
    }

    const lineHeight = fontSize * 1.2;
    const bottomPadding = 80;
    const totalTextHeight = lineHeight * lines.length;
    let y =
      COMPOSITE_SIZE -
      bottomPadding -
      totalTextHeight +
      lineHeight * 0.85;

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.lineJoin = "round";
    ctx.miterLimit = 2;
    ctx.lineWidth = Math.max(6, fontSize / 10);
    ctx.strokeStyle = "#000";
    ctx.fillStyle = "#fff";

    for (const line of lines) {
      ctx.strokeText(line, COMPOSITE_SIZE / 2, y);
      ctx.fillText(line, COMPOSITE_SIZE / 2, y);
      y += lineHeight;
    }

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) reject(new Error("Failed to create blob"));
        else resolve(blob);
      }, "image/png");
    });
  }

  static async downloadComposite(generation: GenerationResult): Promise<void> {
    const blob = await this.buildCompositeBlob(generation);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monke-${generation.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static async shareGeneration(generation: GenerationResult): Promise<void> {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Get Monké-d",
          text: generation.quote,
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    }
  }
}
