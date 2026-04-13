/**
 * @swagger
 * /invoices:
 *   post:
 *     summary: Create invoice
 *     tags: [Invoices]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [clientName, clientEmail, clientState, sellerState, items]
 *             properties:
 *               clientName:
 *                 type: string
 *                 example: Acme Corp
 *               clientEmail:
 *                 type: string
 *                 example: acme@gmail.com
 *               clientState:
 *                 type: string
 *                 example: Maharashtra
 *               sellerState:
 *                 type: string
 *                 example: Delhi
 *               currency:
 *                 type: string
 *                 enum: [INR, USD, EUR, GBP]
 *                 example: INR
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     description:
 *                       type: string
 *                       example: Web Development
 *                     hsnCode:
 *                       type: string
 *                       example: "9983"
 *                     quantity:
 *                       type: number
 *                       example: 10
 *                     rate:
 *                       type: number
 *                       example: 2000
 *                     amount:
 *                       type: number
 *                       example: 20000
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: "2027-12-31"
 *               notes:
 *                 type: string
 *                 example: Thank you for your business
 *     responses:
 *       201:
 *         description: Invoice created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid API key
 *
 *   get:
 *     summary: Get all invoices
 *     tags: [Invoices]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, sent, paid, overdue, cancelled]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Invoices retrieved
 *
 * /invoices/{id}:
 *   get:
 *     summary: Get single invoice
 *     tags: [Invoices]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice retrieved
 *       404:
 *         description: Invoice not found
 *
 *   patch:
 *     summary: Update invoice
 *     tags: [Invoices]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice updated
 *       400:
 *         description: Only draft invoices can be edited
 *
 *   delete:
 *     summary: Delete invoice
 *     tags: [Invoices]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice deleted
 *
 * /invoices/{id}/pdf:
 *   get:
 *     summary: Download invoice PDF
 *     tags: [Invoices]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF downloaded
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *
 * /invoices/{id}/send:
 *   post:
 *     summary: Send invoice via email
 *     tags: [Invoices]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice queued for sending
 *
 * /invoices/{id}/mark-paid:
 *   patch:
 *     summary: Mark invoice as paid
 *     tags: [Invoices]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice marked as paid
 */