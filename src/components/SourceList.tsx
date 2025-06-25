import { ExaSearchResult } from '../types';

interface SourceListProps {
	sources: ExaSearchResult[];
}

export default function SourceList({ sources }: SourceListProps) {
	if (!sources || sources.length === 0) return null;
	return (
		<div className="space-y-4 mt-6">
			<h3 className="text-lg font-semibold text-foreground mb-2">Sources</h3>
			<ul className="space-y-3">
				{sources.map((result, idx) => (
					<li key={idx} id={`source-${idx + 1}`} className="">
						<span className="text-sm font-medium text-muted-foreground mr-2">[{idx + 1}]</span>
						<a
							href={result.url}
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-600 hover:text-blue-800 font-medium underline"
						>
							{result.title}
						</a>
						{result.summary && (
							<div className="text-xs text-muted-foreground mt-1">{result.summary}</div>
						)}
					</li>
				))}
			</ul>
		</div>
	);
}
