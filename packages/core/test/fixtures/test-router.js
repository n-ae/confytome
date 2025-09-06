/**
 * Test Router for Jest tests
 */

const express = require('express');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TestResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Test message
 *           example: "Hello, World!"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Current timestamp
 */

/**
 * @swagger
 * /api/test:
 *   get:
 *     summary: Test endpoint
 *     description: A simple test endpoint for testing documentation generation
 *     tags:
 *       - Test
 *     responses:
 *       200:
 *         description: Successful test response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestResponse'
 *       500:
 *         description: Internal server error
 */
router.get('/test', (_req, res) => {
  res.json({
    message: 'Hello, World!',
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /api/test/{id}:
 *   get:
 *     summary: Get test by ID
 *     description: Retrieve a test item by its ID
 *     tags:
 *       - Test
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Test item ID
 *     responses:
 *       200:
 *         description: Test item found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *       404:
 *         description: Test item not found
 */
router.get('/test/:id', (req, res) => {
  res.json({
    id: req.params.id,
    name: `Test Item ${req.params.id}`
  });
});

module.exports = router;
