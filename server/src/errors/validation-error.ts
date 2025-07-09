export class ValidationError extends Error {
	details?: unknown;
	
	constructor(
		message: string = 'Validation failed',
		details?: unknown
	) {
		super(message);
		this.name = 'ValidationError';
		this.details = details;
	}
}