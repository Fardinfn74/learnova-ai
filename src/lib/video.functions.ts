import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { checkVideoEducationalGuardrail, type GuardrailResult } from "./video-guardrail";

const VerifyVideoInputSchema = z.object({
  title: z.string().min(5).max(180),
  description: z.string().min(10).max(3000),
  category: z.string().min(2).max(60),
  targetAudience: z.string().min(2).max(60),
  tags: z.array(z.string()).max(10).optional(),
  sampleTranscriptOrOutline: z.string().max(4000).optional(),
});

export const verifyEducationalVideo = createServerFn({ method: "POST" })
  .validator((d: unknown) => VerifyVideoInputSchema.parse(d))
  .handler(async ({ data }): Promise<GuardrailResult> => {
    return await checkVideoEducationalGuardrail(data);
  });
