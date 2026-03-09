import Anthropic from "@anthropic-ai/sdk";
import { SITE_NAME, SITE_URL } from "./utils";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GeneratedArticle {
  title: string;
  slug: string;
  summary: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  readTime: number;
  faqs: Array<{ question: string; answer: string }>;
  imagePrompt: string;
}

interface GenerationResult {
  article: GeneratedArticle;
  tokensUsed: number;
}

export async function generateArticle(
  topicName: string,
  category: string,
  promptTemplate: string,
  wordCount: number = 1200,
  model: string = "claude-sonnet-4-5-20250514"
): Promise<GenerationResult> {
  const systemPrompt = `You are an expert medical content writer for ${SITE_NAME}, a trusted health information website.
You write evidence-based, accessible health articles that are optimized for both search engines and AI citation.

CONTENT RULES:
- Write in a clear, authoritative but accessible tone
- Include a medical disclaimer where appropriate
- Use specific data, statistics, and research references where possible
- Every article must start with a clear, definition-style opening sentence (for AI discoverability)
- Use proper H2 and H3 heading hierarchy (output as HTML)
- Include practical, actionable advice
- Target reading level: educated general audience

SEO RULES:
- The SEO title should be under 60 characters and include the primary keyword
- The meta description should be 150-160 characters
- Include natural keyword usage throughout

OUTPUT FORMAT:
You MUST respond with valid JSON only, no other text. Use this exact structure:
{
  "title": "Article Title Here",
  "slug": "article-title-here",
  "summary": "150-160 character meta description",
  "content": "<p>Full HTML article content...</p>",
  "seoTitle": "SEO Title Under 60 Chars",
  "seoDescription": "150-160 character description for search engines",
  "readTime": 6,
  "faqs": [
    {"question": "Common question about the topic?", "answer": "Concise, informative answer."},
    {"question": "Another relevant question?", "answer": "Another clear answer."},
    {"question": "Third question?", "answer": "Third answer."}
  ],
  "imagePrompt": "A prompt for generating a relevant medical/health illustration"
}`;

  const userPrompt = promptTemplate
    ? promptTemplate.replace("{topic}", topicName).replace("{wordCount}", String(wordCount))
    : `Write a ${wordCount}-word health article about: ${topicName}

Category: ${category}

The article should be comprehensive, evidence-based, and include practical advice.
Generate 3-5 FAQ questions with answers that people commonly ask about this topic.
Suggest an image prompt for a professional medical illustration related to this article.`;

  const response = await anthropic.messages.create({
    model,
    max_tokens: 4096,
    messages: [
      { role: "user", content: userPrompt },
    ],
    system: systemPrompt,
  });

  const textContent = response.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text content in AI response");
  }

  const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

  // Parse the JSON response
  let parsed: GeneratedArticle;
  try {
    // Try to extract JSON from the response (handle potential markdown code blocks)
    let jsonStr = textContent.text.trim();
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error(`Failed to parse AI response as JSON: ${e}`);
  }

  return {
    article: parsed,
    tokensUsed,
  };
}

export function estimateCost(tokensUsed: number, model: string, imageGenerated: boolean): string {
  // Approximate costs per 1M tokens (as of 2025)
  const costs: Record<string, number> = {
    "claude-sonnet-4-5-20250514": 6.0, // $3 input + $15 output averaged
    "claude-opus-4-6": 30.0,
    "claude-haiku-4-5-20251001": 1.0,
  };

  const costPer1M = costs[model] || 6.0;
  let totalCost = (tokensUsed / 1_000_000) * costPer1M;

  if (imageGenerated) {
    totalCost += 0.04; // DALL-E 3 standard cost
  }

  return totalCost.toFixed(4);
}
