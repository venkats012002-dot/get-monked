import fs from "node:fs";
import path from "node:path";

const dir = path.resolve(process.cwd(), "public", "monkeys");
const out = path.join(dir, "index.json");

const files = fs
  .readdirSync(dir)
  .filter((f) => /^monke-\d+\.(png|jpg|jpeg|webp)$/i.test(f))
  .sort((a, b) => {
    const na = Number(a.match(/\d+/)![0]);
    const nb = Number(b.match(/\d+/)![0]);
    return na - nb;
  });

fs.writeFileSync(out, JSON.stringify(files));
console.log(`Wrote ${files.length} monkey filename(s) to ${path.relative(process.cwd(), out)}`);
