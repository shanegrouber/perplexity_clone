'use client';

import { useState, useRef } from 'react';
import { readStreamableValue } from 'ai/rsc';
import { searchExaAction } from '../../actions/exa';
import { generateOpenAIResponseAction, rewriteQueryWithContext } from '../../actions/openai';
import { ExaSearchResult } from '../types/schemas';
import { Card, CardContent } from './ui/card';
import Summary from './Summary';
import SourceList from './SourceList';
import SearchBox from './SearchBox';
import LoadingSpinner from './LoadingSpinner';

// Conversation message type
interface Message {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

interface QA {
	question: string;
	answer: string;
	sources: ExaSearchResult[];
}

export default function SearchInput() {
	const [query, setQuery] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [results, setResults] = useState<ExaSearchResult[] | { error: string } | null>(null);
	const [summary, setSummary] = useState<string>('');
	const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
	const [hasSummaryStarted, setHasSummaryStarted] = useState(false);
	const [hasAnyContentStarted, setHasAnyContentStarted] = useState(false);
	const [history, setHistory] = useState<QA[]>([]);
	const containerRef = useRef<HTMLDivElement>(null);

	// Compose OpenAI messages from history and current query
	const buildMessages = (followUpQuery: string): Message[] => {
		const messages: Message[] = [];
		// Add prior Q&A
		history.forEach((qa) => {
			messages.push({ role: 'user', content: qa.question });
			messages.push({ role: 'assistant', content: qa.answer });
		});
		// Add current user query
		messages.push({ role: 'user', content: followUpQuery });
		return messages;
	};

	const handleSearch = async () => {
		if (!query.trim()) return;
		// Reset all relevant state for a new turn
		setIsLoading(true);
		setResults(null);
		setSummary('');
		setHasSummaryStarted(false);
		setHasAnyContentStarted(false);
		// Don't block on previous turn's state

		let exaQuery = query;
		if (history.length > 0) {
			exaQuery = await rewriteQueryWithContext(history, query);
		}
		try {
			// Always run Exa, then OpenAI
			const result = await searchExaAction(exaQuery, 5);
			if (result.isSuccess && result.data) {
				setResults(result.data);
				setHasAnyContentStarted(true);
				const messages = buildMessages(query);
				// Always call generateSummary for every search, and do NOT clear results/summary until after streaming is done
				console.log('🔍 Running Exa with query:', exaQuery);
				await generateSummary(result.data, messages);
				setQuery(''); // Clear input after search
			} else {
				setResults({ error: result.message });
			}
		} catch {
			setResults({ error: 'An unexpected error occurred' });
		} finally {
			setIsLoading(false);
		}
	};

	const generateSummary = async (searchResults: ExaSearchResult[], messages: Message[]) => {
		console.log('🔍 Running OpenAI with messages:', messages);
		setIsGeneratingSummary(true);
		setHasSummaryStarted(false);
		try {
			const summaryResult = await generateOpenAIResponseAction(messages, searchResults);
			if (summaryResult.isSuccess && summaryResult.data) {
				let fullContent = '';
				try {
					for await (const chunk of readStreamableValue(summaryResult.data)) {
						if (chunk) {
							if (!hasSummaryStarted) setHasSummaryStarted(true);
							if (!hasAnyContentStarted) setHasAnyContentStarted(true);
							fullContent += chunk;
							console.log('🔍 Full content:', fullContent);
							setSummary(fullContent);
						}
					}
					// After streaming is done, add to history and clear current turn
					setHistory((prev) => [
						...prev,
						{
							question: messages[messages.length - 1].content,
							answer: fullContent,
							sources: searchResults,
						},
					]);
					setResults(null);
					setSummary('');
				} catch {
					setSummary('Error reading AI response');
				}
			} else {
				setSummary('Failed to generate AI summary');
			}
		} catch {
			setSummary('Error generating AI summary');
		} finally {
			setIsGeneratingSummary(false);
		}
	};

	// Allow follow-up: just focus the input
	const handleFollowUp = () => {
		setQuery('');
		setResults(null);
		setSummary('');
		setHasSummaryStarted(false);
		setHasAnyContentStarted(false);
		if (containerRef.current) {
			containerRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	};

	return (
		<div className="w-full max-w-4xl mx-auto space-y-6">
			{/* Sticky Search Bar */}
			<div
				ref={containerRef}
				className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-border py-4"
				style={{ marginBottom: 0 }}
			>
				<SearchBox
					query={query}
					setQuery={setQuery}
					onSearch={handleSearch}
					isLoading={isLoading}
				/>
			</div>
			{/* Current turn: loading or streaming summary/sources (always at top) */}
			{(isLoading ||
				isGeneratingSummary ||
				(results && !('error' in results) && (summary || isGeneratingSummary))) && (
				<div className="space-y-6">
					{(isLoading || isGeneratingSummary) && !hasAnyContentStarted && (
						<LoadingSpinner message="Searching..." />
					)}
					{results && !('error' in results) && (summary || isGeneratingSummary) && (
						<>
							<Summary summary={summary} />
							<SourceList sources={results} />
						</>
					)}
				</div>
			)}
			{/* Conversation history (newest to oldest) */}
			{history.length > 0 && (
				<div className="space-y-8 mb-8">
					{[...history].reverse().map((qa, idx) => (
						<div key={idx} className="space-y-2">
							<div className="font-semibold text-blue-900">Q: {qa.question}</div>
							<Summary summary={qa.answer} />
							<SourceList sources={qa.sources} />
						</div>
					))}
				</div>
			)}
			{/* Error State */}
			{results && 'error' in results && (
				<Card className="border-red-200 bg-red-50/50">
					<CardContent className="pt-6">
						<p className="text-red-800">Error: {results.error}</p>
					</CardContent>
				</Card>
			)}
			{/* Follow-up button (optional UX) */}
			{summary && !isLoading && !isGeneratingSummary && (
				<div className="text-center mt-8">
					<button
						className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
						onClick={handleFollowUp}
					>
						Ask a follow-up
					</button>
				</div>
			)}
		</div>
	);
}
