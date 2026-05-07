import type { GenerateRequest, GenerationResult } from "../types";
import { ImageProvider } from "../providers/image-provider";
import { TextProvider } from "../providers/text-provider";

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

  static async downloadComposite(generation: GenerationResult): Promise<void> {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");

    const padding = 40;
    const imageSize = 1024;
    const textHeight = 120;
    canvas.width = imageSize + padding * 2;
    canvas.height = imageSize + textHeight + padding * 3;

    ctx.fillStyle = "#EFE4C4";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = generation.imageUrl;
    });
    ctx.drawImage(img, padding, padding, imageSize, imageSize);

    const textY = imageSize + padding * 2;
    ctx.fillStyle = "#1a1a1a";
    ctx.font = '20px "PT Serif", Georgia, serif';
    ctx.textAlign = "center";

    const words = generation.quote.split(" ");
    const maxWidth = imageSize;
    let line = "";
    let lineY = textY + 30;
    for (const word of words) {
      const testLine = line + word + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line !== "") {
        ctx.fillText(line.trim(), canvas.width / 2, lineY);
        line = word + " ";
        lineY += 30;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), canvas.width / 2, lineY);

    ctx.font = '14px "PT Serif", Georgia, serif';
    ctx.fillStyle = "#666";
    ctx.textAlign = "right";
    ctx.fillText("Get Monké-d", canvas.width - padding, canvas.height - padding / 2);

    await new Promise<void>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve();
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `monke-${generation.id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        resolve();
      }, "image/png");
    });
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
