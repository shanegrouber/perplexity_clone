interface LoadingSpinnerProps {
	message: string;
	colorClass?: string;
}

export default function LoadingSpinner({
	message,
	colorClass = 'border-primary',
}: LoadingSpinnerProps) {
	return (
		<div className="text-center py-8">
			<div
				className={`inline-block animate-spin rounded-full h-8 w-8 border-b-2 ${colorClass}`}
			></div>
			<p className="mt-4 text-muted-foreground">{message}</p>
		</div>
	);
}
