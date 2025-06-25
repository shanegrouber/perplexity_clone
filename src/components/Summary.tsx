import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface SummaryProps {
	summary: string;
}

export default function Summary({ summary }: SummaryProps) {
	if (!summary) return null;
	return (
		<Card className="border-green-200 bg-green-50/50">
			<CardHeader>
				<CardTitle className="text-green-800 flex items-center gap-2">
					<div className="h-2 w-2 rounded-full bg-green-600"></div>
					Summary
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="text-foreground leading-relaxed space-y-4">
					<div dangerouslySetInnerHTML={{ __html: summary }} />
				</div>
			</CardContent>
		</Card>
	);
}
