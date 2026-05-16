export interface ImageGenerateParams {
  prompt: string;
  size: "1024x1024";
}

const FALLBACK_IMAGES = Array.from({ length: 16 }, (_, i) => `monke-${i + 1}.png`);

let cache: string[] | null = null;
let inflight: Promise<string[]> | null = null;

async function loadManifest(): Promise<string[]> {
  if (cache) return cache;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const res = await fetch("/monkeys/index.json", { cache: "force-cache" });
      if (!res.ok) throw new Error(`monkeys/index.json HTTP ${res.status}`);
      const data = (await res.json()) as string[];
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("monkeys/index.json is empty or malformed");
      }
      cache = data;
      return data;
    } catch (err) {
      console.warn("Falling back to bundled monkey list:", err);
      cache = FALLBACK_IMAGES;
      return FALLBACK_IMAGES;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export class ImageProvider {
  static buildPrompt(): string {
    return "contemplative monkey, classical portrait";
  }

  static async generateImage(_params: ImageGenerateParams): Promise<string> {
    const files = await loadManifest();
    await new Promise((resolve) =>
      setTimeout(resolve, 600 + Math.random() * 600),
    );
    const pick = files[Math.floor(Math.random() * files.length)];
    return `/monkeys/${pick}`;
  }

  static generateAlt(): string {
    return "A contemplative monkey portrait paired with an existential quote";
  }
}
