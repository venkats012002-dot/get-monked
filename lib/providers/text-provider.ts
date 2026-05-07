export interface TextGenerateParams {
  seed: string;
}

const FALLBACK_QUOTES = [
  "I exist, therefore I contemplate my meaninglessness.",
  "We are all just sophisticated apes pretending our meetings matter.",
  "The more evolved we become, the more we realize we're still just monkeys.",
  "Consciousness is the universe's way of experiencing its own confusion.",
];

let cache: string[] | null = null;
let inflight: Promise<string[]> | null = null;

async function loadQuotes(): Promise<string[]> {
  if (cache) return cache;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const res = await fetch("/quotes.json", { cache: "force-cache" });
      if (!res.ok) throw new Error(`quotes.json HTTP ${res.status}`);
      const data = (await res.json()) as string[];
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("quotes.json is empty or malformed");
      }
      cache = data;
      return data;
    } catch (err) {
      console.warn("Falling back to bundled quotes:", err);
      cache = FALLBACK_QUOTES;
      return FALLBACK_QUOTES;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export class TextProvider {
  static async generateQuote(_params: TextGenerateParams): Promise<string> {
    const quotes = await loadQuotes();
    await new Promise((resolve) =>
      setTimeout(resolve, 400 + Math.random() * 500),
    );
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
}
