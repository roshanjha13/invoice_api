/**
 * @swagger
 * /coupons/apply:
 *   post:
 *     summary: Apply coupon (check discount)
 *     tags: [Coupons]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, plan, amount]
 *             properties:
 *               code:
 *                 type: string
 *                 example: SAVE20
 *               plan:
 *                 type: string
 *                 enum: [starter, pro, enterprise]
 *               amount:
 *                 type: number
 *                 example: 999
 *     responses:
 *       200:
 *         description: Coupon applied
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                 originalAmount:
 *                   type: number
 *                 discount:
 *                   type: number
 *                 finalAmount:
 *                   type: number
 *       400:
 *         description: Invalid or expired coupon
 *       404:
 *         description: Coupon not found
 *
 * /coupons:
 *   post:
 *     summary: Create coupon (admin only)
 *     tags: [Coupons]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, type, value]
 *             properties:
 *               code:
 *                 type: string
 *                 example: SAVE20
 *               description:
 *                 type: string
 *                 example: 20% off on all plans
 *               type:
 *                 type: string
 *                 enum: [percentage, fixed]
 *               value:
 *                 type: number
 *                 example: 20
 *               maxDiscount:
 *                 type: number
 *                 example: 500
 *               minAmount:
 *                 type: number
 *                 example: 999
 *               usageLimit:
 *                 type: number
 *                 example: 100
 *               expiryDate:
 *                 type: string
 *                 format: date
 *                 example: "2027-12-31"
 *     responses:
 *       201:
 *         description: Coupon created
 *       409:
 *         description: Coupon code already exists
 *
 *   get:
 *     summary: Get all coupons (admin only)
 *     tags: [Coupons]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Coupons retrieved
 */