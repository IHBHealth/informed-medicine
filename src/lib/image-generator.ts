import { put } from "@vercel/blob";

export async function generateAndUploadImage(
  imagePrompt: string,
  slug: string,
  imageStyle: string = "medical illustration, clean, professional"
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("OPENAI_API_KEY not set, skipping image generation");
    return null;
  }

  try {
    // Call DALL-E API
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `${imageStyle}. ${imagePrompt}. No text or labels in the image.`,
        n: 1,
        size: "1792x1024",
        quality: "standard",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("DALL-E API error:", error);
      return null;
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) return null;

    // Download and upload to Vercel Blob
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();

    const { url } = await put(`articles/${slug}.png`, imageBlob, {
      access: "public",
      contentType: "image/png",
    });

    return url;
  } catch (error) {
    console.error("Image generation error:", error);
    return null;
  }
}

export async function uploadImageFromFile(
  file: Blob,
  filename: string
): Promise<string> {
  const { url } = await put(`uploads/${filename}`, file, {
    access: "public",
    contentType: file.type || "image/png",
  });
  return url;
}
