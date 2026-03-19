const { workerData, parentPort } = require('worker_threads');
const PDFDocument = require('pdfkit');
const { PassThrough } = require('stream');

const generatePDF = (invoice) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = new PassThrough();
    const buffers = [];

    stream.on('data', (chunk) => buffers.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(buffers)));
    stream.on('error', reject);

    doc.pipe(stream);

    // ── Header ──────────────────────────
    doc.fontSize(26).font('Helvetica-Bold')
      .fillColor('#333')
      .text('INVOICE', { align: 'right' });

    doc.fontSize(10).font('Helvetica').fillColor('#666')
      .text(`Invoice No: ${invoice.invoiceNo}`, { align: 'right' })
      .text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, { align: 'right' })
      .text(`Due: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}`, { align: 'right' });

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#ddd').stroke();
    doc.moveDown();

    // ── Business Info ──────────────────────────
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#333')
      .text(invoice.businessName || 'Your Business');
    doc.fontSize(10).font('Helvetica').fillColor('#555')
      .text(invoice.businessEmail || '');

    doc.moveDown();

    // ── Bill To ──────────────────────────
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#333')
      .text('BILL TO:');
    doc.fontSize(10).font('Helvetica').fillColor('#555')
      .text(invoice.clientName)
      .text(invoice.clientEmail)
      .text(invoice.clientAddress || '');

    doc.moveDown(1.5);

    // ── Table Header ──────────────────────────
    const tableTop = doc.y;
    doc.rect(50, tableTop, 500, 22).fill('#333');
    doc.fillColor('#fff').fontSize(9).font('Helvetica-Bold')
      .text('Description', 58,  tableTop + 6, { width: 240 })
      .text('Qty',         300, tableTop + 6, { width: 60,  align: 'center' })
      .text('Rate',        360, tableTop + 6, { width: 80,  align: 'right' })
      .text('Amount',      440, tableTop + 6, { width: 100, align: 'right' });

    // ── Items ──────────────────────────
    invoice.items.forEach((item, i) => {
      const y = doc.y + 4;
      if (i % 2 === 0) doc.rect(50, y, 500, 20).fill('#f7f7f7');
      doc.fillColor('#333').fontSize(9).font('Helvetica')
        .text(item.description,                                58,  y + 5, { width: 240 })
        .text(String(item.quantity),                           300, y + 5, { width: 60,  align: 'center' })
        .text(`${invoice.currency} ${item.rate.toFixed(2)}`,   360, y + 5, { width: 80,  align: 'right' })
        .text(`${invoice.currency} ${item.amount.toFixed(2)}`, 440, y + 5, { width: 100, align: 'right' });
      doc.moveDown(0.6);
    });

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#ddd').stroke();
    doc.moveDown(0.5);

    // ── Totals ──────────────────────────
    const tx = 360;
    doc.fontSize(9).font('Helvetica').fillColor('#555')
      .text('Subtotal:', tx, doc.y, { width: 90 })
      .text(`${invoice.currency} ${invoice.subtotal?.toFixed(2)}`, tx + 90, doc.y - 11, { width: 100, align: 'right' });

    if (invoice.tax) {
      doc.moveDown(0.4)
        .text('Tax:', tx, doc.y, { width: 90 })
        .text(`${invoice.currency} ${invoice.tax.toFixed(2)}`, tx + 90, doc.y - 11, { width: 100, align: 'right' });
    }

    if (invoice.discount) {
      doc.moveDown(0.4)
        .text('Discount:', tx, doc.y, { width: 90 })
        .text(`- ${invoice.currency} ${invoice.discount.toFixed(2)}`, tx + 90, doc.y - 11, { width: 100, align: 'right' });
    }

    doc.moveDown(0.6);
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#333')
      .text('TOTAL:', tx, doc.y, { width: 90 })
      .text(`${invoice.currency} ${invoice.total?.toFixed(2)}`, tx + 90, doc.y - 13, { width: 100, align: 'right' });

    // ── Status Badge ──────────────────────────
    doc.moveDown(2);
    const statusColors = {
      paid:      '#27ae60',
      sent:      '#2980b9',
      draft:     '#95a5a6',
      overdue:   '#e74c3c',
      cancelled: '#7f8c8d'
    };
    const badgeY = doc.y;
    doc.rect(50, badgeY, 80, 22).fill(statusColors[invoice.status] || '#95a5a6');
    doc.fillColor('#fff').fontSize(9).font('Helvetica-Bold')
      .text(invoice.status.toUpperCase(), 50, badgeY + 7, { width: 80, align: 'center' });

    if (invoice.notes) {
      doc.moveDown(2).fontSize(9).fillColor('#888').font('Helvetica')
        .text(`Notes: ${invoice.notes}`);
    }

    doc.end();
  });
};

// Worker thread mein run karo
generatePDF(workerData.invoice)
  .then((buffer) => parentPort.postMessage({ success: true, buffer }))
  .catch((err) => parentPort.postMessage({ success: false, error: err.message }));