/**
 * Example Auth Router with Server Override
 *
 * This file demonstrates authentication endpoints that use a different server
 * than the main API routes. Perfect example for server overrides in confytome.json.
 */

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication and session management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           format: password
 *           description: User's password
 *           example: "secretpassword123"
 *         rememberMe:
 *           type: boolean
 *           description: Whether to create a long-lived session
 *           example: false
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT access token
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         refreshToken:
 *           type: string
 *           description: Refresh token for obtaining new access tokens
 *           example: "rt_abc123..."
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 12345
 *             email:
 *               type: string
 *               example: "user@example.com"
 *             name:
 *               type: string
 *               example: "John Doe"
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Token expiration time
 *           example: "2023-01-15T12:30:00Z"
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User login
 *     description: |
 *       Authenticate user with email and password.
 *       Returns an access token for subsequent API calls.
 *
 *       **Note**: This endpoint uses a different server than the main API
 *     servers:
 *       - url: http://localhost:3000
 *         description: Auth Server (no base path)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             basicLogin:
 *               summary: Basic login example
 *               description: Standard login with email and password
 *               value:
 *                 email: "user@example.com"
 *                 password: "secretpassword123"
 *                 rememberMe: false
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "INVALID_INPUT"
 *                 message:
 *                   type: string
 *                   example: "Email and password are required"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "INVALID_CREDENTIALS"
 *                 message:
 *                   type: string
 *                   example: "Invalid email or password"
 *       429:
 *         description: Too many login attempts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "RATE_LIMITED"
 *                 message:
 *                   type: string
 *                   example: "Too many login attempts. Please try again later."
 */
function login(_req, _res) {
  // Implementation here
}

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User logout
 *     description: |
 *       Logout current user and invalidate their session token.
 *       This endpoint requires authentication.
 *     servers:
 *       - url: http://localhost:3000
 *         description: Auth Server (no base path)
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logged out successfully"
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "UNAUTHORIZED"
 *                 message:
 *                   type: string
 *                   example: "Authentication required"
 *     security:
 *       - bearerAuth: []
 */
function logout(_req, _res) {
  // Implementation here
}

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh access token
 *     description: |
 *       Obtain a new access token using a valid refresh token.
 *       This extends the user's session without requiring re-authentication.
 *     servers:
 *       - url: http://localhost:3000
 *         description: Auth Server (no base path)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Valid refresh token
 *                 example: "rt_abc123..."
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid refresh token format
 *       401:
 *         description: Refresh token expired or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "INVALID_REFRESH_TOKEN"
 *                 message:
 *                   type: string
 *                   example: "Refresh token is invalid or expired"
 */
function refreshToken(_req, _res) {
  // Implementation here
}

export default {
  login,
  logout,
  refreshToken
};
