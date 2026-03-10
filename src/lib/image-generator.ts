import { put } from "@vercel/blob";

async function generateWithFlux(prompt: string): Promise<string> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error("REPLICATE_API_TOKEN not set");
  }

  const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      version: "black-forest-labs/flux-1.1-pro",
      input: {
        prompt,
        aspect_ratio: "16:9",
        output_format: "png",
        safety_tolerance: 5,
      },
    }),
  });

  if (!createResponse.ok) {
    const error = await createResponse.text();
    throw new Error(`Replicate API error: ${error}`);
  }

  let result = await createResponse.json();

  // Poll for completion
  while (result.status !== "succeeded" && result.status !== "failed") {
    await new Promise((r) => setTimeout(r, 2000));
    const pollResponse = await fetch(result.urls.get, {
      headers: { Authorization: `Bearer ${token}` },
    });
    result = await pollResponse.json();
  }

  if (result.status === "failed") {
    throw new Error(`Flux generation failed: ${result.error}`);
  }

  return Array.isArray(result.output) ? result.output[0] : result.output;
}

export async function generateAndUploadImage(
  imagePrompt: string,
  slug: string,
  imageStyle: string = "medical illustration, clean, professional"
): Promise<string | null> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    console.warn("REPLICATE_API_TOKEN not set, skipping image generation");
    return null;
  }

  try {
    const fullPrompt = `${imageStyle}. ${imagePrompt}. No text or labels in the image.`;
    const imageUrl = await generateWithFlux(fullPrompt);

    // Download and upload to Vercel Blob if available
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.blob();

      const { url } = await put(`articles/${slug}.png`, imageBlob, {
        access: "public",
        contentType: "image/png",
      });

      return url;
    }

    // Fall back to using the Replicate URL directly
    return imageUrl;
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
