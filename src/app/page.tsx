import SearchInput from '../components/SearchInput';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function Home() {
	return (
		<main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
			<div className="container mx-auto px-4 py-16">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
						Perplexity Clone
					</h1>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
						Ask me anything and I&apos;ll search the web to find the most relevant information for
						you.
					</p>
				</div>

				{/* Search Interface */}
				<Card className="max-w-4xl mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
					<CardHeader className="text-center pb-4">
						<CardTitle className="text-2xl font-semibold text-foreground">Web Search</CardTitle>
					</CardHeader>
					<CardContent className="p-6">
						<SearchInput />
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
