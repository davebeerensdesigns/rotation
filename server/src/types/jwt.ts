/**
 * Interface representing the payload of a JSON Web Token (JWT).
 *
 * This payload is typically used for authentication and authorization purposes.
 *
 * @interface JwtPayload
 * @property {string} sub - Subject identifier (usually the user ID).
 * @property {string} role - The user's role or permission level.
 * @property {number} [iat] - Issued at timestamp (optional).
 * @property {number} [exp] - Expiration timestamp (optional).
 */
export interface JwtPayload {
	sub: string;
	role: string;
	iat?: number;
	exp?: number;
}