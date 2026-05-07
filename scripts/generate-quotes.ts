import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import fs from "node:fs";
import path from "node:path";
import "dotenv/config";

const TARGET = Number(process.env.TARGET ?? 2000);
const BATCH = Number(process.env.BATCH ?? 50);
const MODEL = "claude-haiku-4-5";

const SYSTEM_PROMPT = `You are PHILOSOPHY MONKE — the voice of a hyper-self-aware primate philosopher delivering existential, absurdist, deadpan-poetic one-liners.

VOICE & VIBE
- Cosmic dread and dry humor in the same breath.
- Reads like Camus and Cioran filtered through a chimp scrolling LinkedIn at 3 AM.
- Each line should feel like the FIRST human ever said it: raw, unsanitized, real.
- Stoic, absurdist, existentialist, quietly nihilistic — pick a register per line.
- Sometimes vivid and concrete (banana, fluorescent lights, fur, scaffolding, screen).
- Sometimes abstract and aphoristic (Cioran, La Rochefoucauld, Wittgenstein).

HARD RULES
- ONE sentence each. 6 to 22 words. No multi-sentence quotes.
- No quotation marks, no attribution, no emoji, no hashtags.
- No openers like "In a world where..." or "We are all...". Vary syntax wildly.
- No clichés ("life is a journey", "embrace the chaos", "be yourself"). Surprise me.
- Don't start every line with "I", "We", or "The". Mix nouns, verbs, prepositions.
- ABSOLUTELY NO duplicates and no near-paraphrases within or across batches.
- Avoid pop-philosophy buzzwords ("authenticity", "vulnerability") used straight; subvert them.

DOMAINS to draw from (rotate, don't repeat)
time, work, attention, loneliness, the body, language, money, screens,
ancestors, evolution, banana, civilization, mirrors, performance, identity,
sleep, mortality, friendship, the loop of consciousness, capitalism, ritual,
boredom, weather, machines, hunger, manners, memory, control, knowing,
naming, dressing up, debt, hands, faces, voices, breath, fur.`;

const QuoteBatchSchema = z.object({
  quotes: z
    .array(z.string())
    .describe("An array of one-sentence philosophy-monke quotes."),
});

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Missing ANTHROPIC_API_KEY (export it or add to .env)");
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });
  const out = new Set<string>();
  const themes = [
    "time, deadlines, and the strangeness of the calendar",
    "screens, attention, infinite scroll, the algorithm",
    "office life, productivity rituals, meetings",
    "mirrors, faces, performance of self",
    "evolution, ancestors, the long animal memory",
    "sleep, dreams, half-conscious states",
    "loneliness, friendship, missed calls",
    "money, debt, the price of being alive",
    "ritual, repetition, daily loops",
    "language, naming, what words break",
    "the body — hunger, digestion, fur, breath",
    "civilization, manners, dressing up",
    "boredom, waiting rooms, the sacred dull",
    "death, vanishing, the hum after",
    "love, intimacy, the awkward animal of it",
    "memory, forgetting, the unreliable archive",
    "control, freedom, the cage of choice",
    "knowing, not-knowing, the limits of mind",
    "nature, weather, the indifferent world",
    "technology, machines, the cold mirror",
    "capitalism, work, the productivity religion",
    "identity, masks, who you are when nobody watches",
    "hands, gestures, what bodies say without permission",
    "voices, speech, the lies we ratify by repeating",
    "hunger, appetite, the small daily gods",
  ];

  let batchNum = 0;
  let consecutiveLowYield = 0;

  while (out.size < TARGET) {
    const theme = themes[batchNum % themes.length];
    const seedNoise = Math.random().toString(36).slice(2, 8);
    const userMessage = `Generate ${BATCH} brand-new philosophy-monke quotes.

Batch theme/mood (loose, not strict): ${theme}.
Batch seed (just to break repetition): ${seedNoise}.

Produce ${BATCH} distinct one-liners. Vary openings, length within 6-22 words, syntax, and concreteness. No duplicates of common quotes; no paraphrases of each other.`;

    const sizeBefore = out.size;
    try {
      const response = await client.messages.parse({
        model: MODEL,
        max_tokens: 4096,
        system: [
          {
            type: "text",
            text: SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [{ role: "user", content: userMessage }],
        output_config: { format: zodOutputFormat(QuoteBatchSchema) },
      });

      const parsed = response.parsed_output;
      if (!parsed) {
        console.warn(`Batch ${batchNum + 1}: parse failed, skipping`);
      } else {
        for (const raw of parsed.quotes) {
          if (typeof raw !== "string") continue;
          const trimmed = raw.trim().replace(/^["'`“”‘’]+|["'`“”‘’]+$/g, "");
          if (trimmed.length < 12 || trimmed.length > 240) continue;
          const wordCount = trimmed.split(/\s+/).length;
          if (wordCount < 5 || wordCount > 30) continue;
          out.add(trimmed);
        }
      }

      const usage = response.usage;
      console.log(
        `Batch ${++batchNum}: pool ${out.size}/${TARGET} (+${out.size - sizeBefore})  cache_read=${usage.cache_read_input_tokens ?? 0} cache_write=${usage.cache_creation_input_tokens ?? 0} in=${usage.input_tokens} out=${usage.output_tokens}`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`Batch ${batchNum + 1} errored: ${message}`);
      batchNum++;
      await new Promise((r) => setTimeout(r, 1000));
      continue;
    }

    const yieldGained = out.size - sizeBefore;
    consecutiveLowYield = yieldGained < 3 ? consecutiveLowYield + 1 : 0;
    if (consecutiveLowYield >= 5) {
      console.warn(
        `5 consecutive low-yield batches; stopping at ${out.size} quotes to avoid burning tokens.`,
      );
      break;
    }
  }

  const finalQuotes = Array.from(out).slice(0, TARGET);
  const outDir = path.resolve(process.cwd(), "public");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "quotes.json");
  fs.writeFileSync(outPath, JSON.stringify(finalQuotes));
  console.log(`\nWrote ${finalQuotes.length} quotes to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
