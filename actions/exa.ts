'use server';

import Exa from 'exa-js';
import { ExaSearchResultSchema, ExaSearchResult } from '../src/types/schemas';

const exa = new Exa(process.env.EXA_API_KEY);

interface ActionState<T> {
	isSuccess: boolean;
	message: string;
	data?: T;
}

/**
 * Search Exa for content based on user query and (optionally) conversation history
 */
export async function searchExaAction(
	userQuery: string,
	numResults: number = 5
): Promise<ActionState<ExaSearchResult[]>> {
	try {
		// For now, just use the latest query. In the future, you could use history to augment the query.
		const exaResponse = await exa.searchAndContents(userQuery, {
			type: 'neural',
			useAutoprompt: true,
			numResults,
			text: true,
			livecrawl: 'always',
			summary: true,
		});

		// Validate and format results
		const formattedResults = exaResponse.results.map((r: any) => ({
			title: r.title || 'Untitled',
			url: r.url,
			text: r.text || '',
			summary: r.summary || '',
		}));

		const parseResult = ExaSearchResultSchema.array().safeParse(formattedResults);
		if (!parseResult.success) {
			return {
				isSuccess: false,
				message: 'Invalid Exa search result format',
			};
		}

		return {
			isSuccess: true,
			message: 'Search results retrieved successfully',
			data: parseResult.data,
		};
	} catch (error) {
		console.error('Error searching Exa:', error);
		return {
			isSuccess: false,
			message: `Failed to search Exa: ${error instanceof Error ? error.message : 'Unknown error'}`,
		};
	}
}
