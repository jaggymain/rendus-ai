import { inngest } from "./client";
import { prisma } from "@/lib/prisma";
import { generateImage, generateVideo } from "@/lib/fal-client";

export const processImageGeneration = inngest.createFunction(
  { id: "process-image-generation" },
  { event: "generation/image.requested" },
  async ({ event, step }) => {
    const { generationId, userId, params } = event.data;

    await step.run("update-status-processing", async () => {
      await prisma.generation.update({
        where: { id: generationId },
        data: {
          status: "PROCESSING",
          processingStartedAt: new Date(),
        },
      });
    });

    const result = await step.run("generate-image", async () => {
      return await generateImage(params);
    });

    await step.run("store-fal-request-id", async () => {
      await prisma.generation.update({
        where: { id: generationId },
        data: {
          falRequestId: result.requestId,
        },
      });
    });

    return { success: true, requestId: result.requestId };
  }
);

export const processVideoGeneration = inngest.createFunction(
  { id: "process-video-generation" },
  { event: "generation/video.requested" },
  async ({ event, step }) => {
    const { generationId, userId, params } = event.data;

    await step.run("update-status-processing", async () => {
      await prisma.generation.update({
        where: { id: generationId },
        data: {
          status: "PROCESSING",
          processingStartedAt: new Date(),
        },
      });
    });

    const result = await step.run("generate-video", async () => {
      return await generateVideo(params);
    });

    await step.run("store-fal-request-id", async () => {
      await prisma.generation.update({
        where: { id: generationId },
        data: {
          falRequestId: result.requestId,
        },
      });
    });

    return { success: true, requestId: result.requestId };
  }
);

export const functions = [
  processImageGeneration,
  processVideoGeneration,
];
