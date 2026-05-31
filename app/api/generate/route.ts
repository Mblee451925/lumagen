import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { prompt, model, steps, cfg, ar, seed } = await req.json();

  const modelMap: Record<string, string> = {
    "chroma": "fal-ai/flux/dev",
    "flux-dev": "fal-ai/flux/dev",
    "flux-schnell": "fal-ai/flux/schnell",
    "qwen2": "fal-ai/flux/dev",
    "juggernaut": "fal-ai/flux/dev",
    "pony": "fal-ai/flux/dev",
    "dreamshaper": "fal-ai/flux/dev",
  };

  const sizeMap: Record<string, { width: number; height: number }> = {
    "1:1":  { width: 1024, height: 1024 },
    "16:9": { width: 1280, height: 720 },
    "9:16": { width: 720,  height: 1280 },
    "4:3":  { width: 1024, height: 768 },
  };

  const falModel = modelMap[model] || "fal-ai/flux/dev";
  const size = sizeMap[ar] || { width: 1024, height: 1024 };

  const response = await fetch(`https://fal.run/${falModel}`, {
    method: "POST",
    headers: {
      "Authorization": `Key ${process.env.FAL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      image_size: size,
      num_inference_steps: steps,
      guidance_scale: cfg,
      seed: seed,
      num_images: 1,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return NextResponse.json({ error }, { status: 500 });
  }

  const data = await response.json();
  return NextResponse.json({ imageUrl: data.images?.[0]?.url });
}
