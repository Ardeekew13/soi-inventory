export const successResponse = <T>(
	message: string,
	data?: T
): { success: boolean; message: string; data: T | null } => ({
	success: true,
	message,
	data: data ?? null,
});

export const errorResponse = (
	message: string
): { success: boolean; message: string; data: null } => ({
	success: false,
	message,
	data: null,
});
