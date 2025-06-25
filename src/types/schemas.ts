import { z } from 'zod';

// ExaSearchResult schema
export const ExaSearchResultSchema = z.object({
	title: z.string(),
	url: z.string().url(),
	text: z.string(),
	summary: z.string().optional(),
});
export type ExaSearchResult = z.infer<typeof ExaSearchResultSchema>;

// ActionState schema (generic)
export const ActionStateSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
	z.object({
		isSuccess: z.boolean(),
		message: z.string(),
		data: dataSchema.optional(),
	});
export type ActionState = z.infer<ReturnType<typeof ActionStateSchema<z.ZodTypeAny>>>;

// LLMResponse schema (if needed)
export const LLMResponseSchema = z.object({
	answer: z.string(),
	sources: z.array(z.string()),
});
export type LLMResponse = z.infer<typeof LLMResponseSchema>;
