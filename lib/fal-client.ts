import * as fal from "@fal-ai/serverless-client";

fal.config({
  credentials: process.env.FAL_KEY!,
});

export interface TextToImageParams {
  prompt: string;
  negative_prompt?: string;
  image_size?: "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9";
  num_inference_steps?: number;
  guidance_scale?: number;
  num_images?: number;
  seed?: number;
}

export interface TextToVideoParams {
  prompt: string;
  negative_prompt?: string;
  duration?: number;
  fps?: number;
  aspect_ratio?: string;
}

export async function generateImage(params: TextToImageParams) {
  const result = await fal.subscribe("fal-ai/flux-pro", {
    input: {
      prompt: params.prompt,
      negative_prompt: params.negative_prompt,
      image_size: params.image_size || "square_hd",
      num_inference_steps: params.num_inference_steps || 28,
      guidance_scale: params.guidance_scale || 3.5,
      num_images: params.num_images || 1,
      enable_safety_checker: true,
    },
    logs: true,
    onQueueUpdate: (update) => {
      console.log("Queue update:", update);
    },
  });

  return result;
}

export async function generateVideo(params: TextToVideoParams) {
  const result = await fal.subscribe("fal-ai/minimax/video-01", {
    input: {
      prompt: params.prompt,
      negative_prompt: params.negative_prompt,
    },
    logs: true,
    onQueueUpdate: (update) => {
      console.log("Queue update:", update);
    },
  });

  return result;
}
