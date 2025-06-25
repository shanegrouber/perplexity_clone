'use server';

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createStreamableValue, StreamableValue } from 'ai/rsc';
import { ExaSearchResult } from '../src/types/schemas';

interface Message {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

interface ActionState<T> {
	isSuccess: boolean;
	message: string;
	data?: T;
}

/**
 * Rewrite a follow-up query as a standalone search query using OpenAI and conversation history
 */
export async function rewriteQueryWithContext(
	history: { question: string; answer: string }[],
	latestQuery: string
): Promise<string> {
	const prompt = `Given the following conversation, rewrite the last user question as a standalone search query. Only return the rewritten query, nothing else.\n\n${history
		.map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`)
		.join('\n')}\nQ: ${latestQuery}\nStandalone search query:`;

	const { textStream } = streamText({
		model: openai('gpt-4o'),
		system:
			'You are a helpful assistant that rewrites follow-up questions as standalone search queries.',
		messages: [{ role: 'user', content: prompt }],
	});

	let rewritten = '';
	for await (const chunk of textStream) {
		rewritten += chunk;
	}
	return rewritten.trim();
}

/**
 * Generate OpenAI response with streaming based on search results and chat history
 */
export async function generateOpenAIResponseAction(
	messages: Message[],
	sources: ExaSearchResult[]
): Promise<ActionState<StreamableValue<unknown, unknown>>> {
	try {
		const stream = createStreamableValue();

		// Compose the system prompt with sources
		const systemPrompt = `
You are a helpful assistant that summarizes search results into concise, readable bullet points or paragraphs.

Your responsibilities:
- For each major topic or article, write a **separate paragraph**
- You MUST rely on the provided sources where possible.
- Use **clear headings** or **numbered entries** (e.g. 1., 2., etc.)
- Always include inline HTML-compatible citations using: <sup><strong><a href="#source-1">[1]</a></strong></sup>
- Do NOT combine multiple topics into a single paragraph
- Return markdown-compatible HTML (e.g. <p>, <strong>, etc.)
Wrap each entry in <p> tags like this: <p><strong>Topic</strong>: Content...<sup>...</sup></p><p>...</p>

Respond in this format:
1. <strong>Headline</strong>: Summary sentence...<sup>...</sup>
2. <strong>Headline</strong>: Another summary...<sup>...</sup>

### SOURCES:
${sources
	.map(
		(r, i) =>
			`[${i + 1}] ${r.title}\nURL: ${r.url}\nSummary: ${r.summary || ''}\nContent: ${r.text}\n`
	)
	.join('\n')}

Today's date is ${new Date().toLocaleDateString('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric',
		})}.
`;

		// Insert/replace the first system message
		const chatMessages: Message[] = [
			{ role: 'system', content: systemPrompt },
			...messages.filter((m) => m.role !== 'system'),
		];

		(async () => {
			const { textStream } = streamText({
				model: openai('gpt-4o'),
				system: systemPrompt, // for OpenAI API compatibility
				messages: chatMessages,
			});

			for await (const chunk of textStream) {
				stream.update(chunk);
			}

			stream.done();
		})();

		return {
			isSuccess: true,
			message: 'OpenAI response generated successfully',
			data: stream.value,
		};
	} catch (error) {
		console.error('Error generating OpenAI response:', error);
		return {
			isSuccess: false,
			message: `Failed to generate OpenAI response: ${
				error instanceof Error ? error.message : 'Unknown error'
			}`,
		};
	}
}
