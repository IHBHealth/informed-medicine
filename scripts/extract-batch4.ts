import fs from "fs";

const src = fs.readFileSync("scripts/batch4-articles.ts", "utf-8");

// Extract just the array portion between "const articles: Article[] = [" and the closing "];"
const startMarker = "const articles: Article[] = [";
const startIdx = src.indexOf(startMarker);
if (startIdx === -1) throw new Error("Could not find articles array start");

// Find the matching closing "];" - we need to track bracket depth
let depth = 0;
let arrayStart = startIdx + startMarker.length - 1; // position of "["
let arrayEnd = -1;
let inTemplateLiteral = false;
let inString = false;
let stringChar = "";

for (let i = arrayStart; i < src.length; i++) {
  const ch = src[i];
  const prev = i > 0 ? src[i - 1] : "";

  if (inTemplateLiteral) {
    if (ch === "`" && prev !== "\\") {
      inTemplateLiteral = false;
    }
    continue;
  }

  if (inString) {
    if (ch === stringChar && prev !== "\\") {
      inString = false;
    }
    continue;
  }

  if (ch === "`") {
    inTemplateLiteral = true;
    continue;
  }

  if (ch === '"' || ch === "'") {
    inString = true;
    stringChar = ch;
    continue;
  }

  if (ch === "[") depth++;
  if (ch === "]") {
    depth--;
    if (depth === 0) {
      arrayEnd = i + 1;
      break;
    }
  }
}

if (arrayEnd === -1) throw new Error("Could not find articles array end");

const arrayStr = src.substring(arrayStart, arrayEnd);

// eval the array - template literals and all
const articles = eval(arrayStr);

console.log(`Found ${articles.length} articles`);

const filenames = [
  "14-pesticides.json",
  "15-energy-drinks.json",
  "16-mold.json",
  "17-artificial-sweeteners.json",
  "18-lead-water.json",
];

for (let i = 0; i < articles.length; i++) {
  const a = articles[i];
  const json = JSON.stringify(
    {
      title: a.title,
      slug: a.slug,
      category: a.category,
      author: a.author,
      seoTitle: a.seoTitle,
      seoDescription: a.seoDescription,
      summary: a.summary,
      imagePrompt: a.imagePrompt,
      faqData: a.faqData,
      content: a.content,
    },
    null,
    2
  );
  fs.writeFileSync(`scripts/articles/${filenames[i]}`, json);
  console.log(`Wrote ${filenames[i]} (${a.slug})`);
}

console.log("Done!");
