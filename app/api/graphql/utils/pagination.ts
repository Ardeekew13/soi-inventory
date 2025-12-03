export interface PaginationListArgs {
	limit?: number;
	skip?: number;
	search?: string;
}

export function applyPaginationArgs(args: { limit?: number; skip?: number }) {
	const limit = Math.min(args.limit ?? 10, 100);
	const skip = args.skip ?? 0;
	return { limit, skip };
}
