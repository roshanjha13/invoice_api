const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const itemSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => `item_${uuidv4().replace(/-/g, '')}`
    },
    description: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    rate: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
})

const invoiceSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => `item_${uuidv4().replace(/-/g, '')}`
    },
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    invoiceNo: {
        type: String,
        unique: true,
    },
    status: {
        type: String,
        enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
        default: 'draft'
    },
    currency: {
        type: String,
        default: 'INR'
    },
    
    clientName: {
        type: String,
        required: true
    },
    clientEmail: {
        type: String,
        required: true
    },
    clientAddress: {
        type: String
    },
    
    businessName: {
        type: String
    },
    businessEmail: {
        type: String
    },
    items:[itemSchema],
    subtotal: {
        type: Number
    },
    tax: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    total: {
        type: Number
    },
    dueDate: {
        type: Date
    },
    notes: {
        type: String
    },
    pdfUrl: {
        type: String
    },
    paidAt: {
        type: Date
    },
}, { timestamps: true});

invoiceSchema.index({ userId: 1});
invoiceSchema.index({ status: 1});
invoiceSchema.index({ userId: 1, status: 1});

invoiceSchema.pre('save', async function (next) {
    if (!this.invoiceNo) {
        const count = await mongoose.model('Invoice').countDocuments( { userId: this.userId });
        this.invoiceNo = `INV-${Date.now()}-${count + 1}`
    }
    this.subtotal = this.items.reduce((sum,item)=> sum + item.amount, 0);
    this.total = this.subtotal +(this.tax || 0) - (this.discount || 0);
    next();
})

module.exports = mongoose.model('Invoice', invoiceSchema);