import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search } from 'lucide-react';

interface SearchBoxProps {
	query: string;
	setQuery: (q: string) => void;
	onSearch: () => void;
	isLoading: boolean;
}

export default function SearchBox({ query, setQuery, onSearch, isLoading }: SearchBoxProps) {
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') onSearch();
	};
	return (
		<div className="relative">
			<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				type="text"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder="Ask me anything..."
				className="pl-10 pr-24 h-12 text-lg"
				disabled={isLoading}
			/>
			<Button
				onClick={onSearch}
				disabled={isLoading || !query.trim()}
				className="absolute right-2 top-1/2 -translate-y-1/2 h-8"
				size="sm"
			>
				{isLoading ? 'Searching...' : 'Search'}
			</Button>
		</div>
	);
}
