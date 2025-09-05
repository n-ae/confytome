/**
 * Example API Router with JSDoc Comments
 * 
 * This file demonstrates how to write JSDoc comments for API documentation generation.
 * Copy this file and modify it to match your actual API endpoints.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - email
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           description: Unique user identifier
 *           example: 12345
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "john.doe@example.com"
 *         name:
 *           type: string
 *           description: User's full name
 *           example: "John Doe"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *           example: "2023-01-15T10:30:00Z"
 *         isActive:
 *           type: boolean
 *           description: Whether the user account is active
 *           example: true
 *     
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error code
 *           example: "USER_NOT_FOUND"
 *         message:
 *           type: string
 *           description: Human-readable error message
 *           example: "The requested user could not be found"
 *         details:
 *           type: object
 *           description: Additional error details
 *           example: {}
 * 
 *   parameters:
 *     UserId:
 *       name: id
 *       in: path
 *       required: true
 *       schema:
 *         type: integer
 *         format: int64
 *       description: The unique identifier of the user
 *       example: 12345
 */

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User management operations
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users
 *     description: |
 *       Retrieve a paginated list of all users in the system.
 *       This endpoint supports pagination and returns user information
 *       including their current status and creation date.
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination (starts from 1)
 *         example: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *         example: 20
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *         description: Search term to filter users by name or email
 *         example: "john"
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 total:
 *                   type: integer
 *                   description: Total number of users
 *                   example: 150
 *                 page:
 *                   type: integer
 *                   description: Current page number
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   description: Number of users per page
 *                   example: 20
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - bearerAuth: []
 */
function getAllUsers(req, res) {
  // Implementation here
}

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags:
 *       - Users
 *     summary: Create a new user
 *     description: |
 *       Create a new user account with the provided information.
 *       The email address must be unique in the system.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address (must be unique)
 *                 example: "alice.johnson@example.com"
 *               name:
 *                 type: string
 *                 description: User's full name
 *                 example: "Alice Johnson"
 *           examples:
 *             createUser:
 *               summary: Create user example
 *               description: Example for creating a new user
 *               value:
 *                 email: "alice.johnson@example.com"
 *                 name: "Alice Johnson"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email address already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - bearerAuth: []
 */
function createUser(req, res) {
  // Implementation here
}

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user by ID
 *     description: |
 *       Retrieve detailed information about a specific user by their unique ID.
 *       Returns complete user profile including metadata.
 *     parameters:
 *       - $ref: '#/components/parameters/UserId'
 *     responses:
 *       200:
 *         description: User found and returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid user ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - bearerAuth: []
 */
function getUserById(req, res) {
  // Implementation here
}

module.exports = {
  getAllUsers,
  createUser,
  getUserById
};