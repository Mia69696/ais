// Free AI image generation via Pollinations.ai (no API key needed)
const POLLINATIONS_URL = 'https://image.pollinations.ai/prompt';

export function generateImageUrl(prompt: string, width = 1280, height = 720): string {
  const encoded = encodeURIComponent(prompt);
  return `${POLLINATIONS_URL}/${encoded}?width=${width}&height=${height}&nologo=true&enhance=true`;
}

export function generateThumbnailUrl(title: string, style = 'youtube thumbnail'): string {
  const prompt = `${style}, viral, ${title}, bold text overlay, high contrast, professional, 4K quality, eye-catching`;
  return generateImageUrl(prompt, 1280, 720);
}

export function generateVerticalThumbnail(title: string): string {
  const prompt = `viral tiktok thumbnail, ${title}, bold colors, text overlay, trendy, 9:16 aspect ratio, mobile optimized`;
  return generateImageUrl(prompt, 720, 1280);
}

export async function generateImageBlob(prompt: string, width = 1280, height = 720): Promise<string> {
  const url = generateImageUrl(prompt, width, height);
  // Return the URL directly (Pollinations serves images directly)
  return url;
}

// Generate multiple image variations
export function generateVariations(prompt: string, count = 4): string[] {
  return Array.from({ length: count }, (_, i) =>
    generateImageUrl(`${prompt}, variation ${i + 1}, unique composition`, 1280, 720)
  );
}

export default { generateImageUrl, generateThumbnailUrl, generateVerticalThumbnail, generateImageBlob, generateVariations };
