const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth : {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

transporter.verify((error) => {
    if(error){
        logger.error(`Email service error: ${error.message}`)
    } else {
        logger.info(`Email service ready`);
    }
});

const sendInvoiceEmail = async (invoice, pdfStream) => {
  const mailOptions = {
    from: `"InvoiceAPI" <${process.env.SMTP_USER}>`,
    to: invoice.clientEmail,
    subject: `Invoice ${invoice.invoiceNo} from ${invoice.businessName || 'Your Vendor'}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:20px">
        <h2 style="color:#333">Invoice ${invoice.invoiceNo}</h2>
        <p>Dear <strong>${invoice.clientName}</strong>,</p>
        <p>Please find your invoice attached.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <tr style="background:#f7f7f7">
            <td style="padding:10px;border:1px solid #ddd">Invoice No</td>
            <td style="padding:10px;border:1px solid #ddd">${invoice.invoiceNo}</td>
          </tr>
          <tr>
            <td style="padding:10px;border:1px solid #ddd">Amount Due</td>
            <td style="padding:10px;border:1px solid #ddd"><strong>${invoice.currency} ${invoice.total}</strong></td>
          </tr>
          <tr style="background:#f7f7f7">
            <td style="padding:10px;border:1px solid #ddd">Due Date</td>
            <td style="padding:10px;border:1px solid #ddd">${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</td>
          </tr>
        </table>
        <p style="color:#888;font-size:12px">Thank you for your business!</p>
      </div>
    `,
    attachments: [{
      filename: `${invoice.invoiceNo}.pdf`,
      content: pdfStream,
      contentType: 'application/pdf'
    }]
  };

  await transporter.sendMail(mailOptions);
  logger.info(`Invoice email sent to ${invoice.clientEmail}`);
};

module.exports = { sendInvoiceEmail };