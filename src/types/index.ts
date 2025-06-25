export interface ExaSearchResult {
	title: string;
	url: string;
	text: string;
	summary?: string;
}

export interface ActionState<T> {
	isSuccess: boolean;
	message: string;
	data?: T;
}
