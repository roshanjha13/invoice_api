const GST_RATES = {
    ZERO:        0,
    FIVE:        5,
    TWELVE:      12,
    EIGHTEEN:    18,
    TWENTYEIGHT: 28,
}

const calculateGST = (amount, gstRate) => {
    const gstAmount = (amount * gstRate) / 100;
    const totalAmount = amount + gstAmount;

    return {
        baseAmount:     parseInt(amount.toFixed(2)),
        gstRate:        gstRate,
        gstAmount:      parseFloat(gstAmount.toFixed(2)),
        totalAmount:    parseFloat(totalAmount.toFixed(2)),
    };
};

const calculateIntraStateGST = (amount, gstRate) => {
    const gst = calculateGST(amount,gstRate);
    const totalAmount = amount + gstAmount;

    return {
        baseAmount:     parseInt(amount.toFixed(2)),
        gstRate:        gstRate,
        gstAmount:      parseFloat(gstAmount.toFixed(2)),
        totalAmount:    parseFloat(totalAmount.toFixed(2)),
    };
};

const calculateIntraStateGST1 = (amount, gstRate) => {
    const gst = calculateGST(amount,gstRate);
    const totalAmount = amount + gstAmount;

    return {
        baseAmount:     parseInt(amount.toFixed(2)),
        gstRate:        gstRate,
        gstAmount:      parseFloat(gstAmount.toFixed(2)),
        totalAmount:    parseFloat(totalAmount.toFixed(2)),
    };
};