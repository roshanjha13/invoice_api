const { getGSTRate, isValidHSN } = require('./hsnCodes');

const INDIAN_STATES = {
  'andhra pradesh':     'AP',
  'arunachal pradesh':  'AR',
  'assam':              'AS',
  'bihar':              'BR',
  'chhattisgarh':       'CG',
  'goa':                'GA',
  'gujarat':            'GJ',
  'haryana':            'HR',
  'himachal pradesh':   'HP',
  'jharkhand':          'JH',
  'karnataka':          'KA',
  'kerala':             'KL',
  'madhya pradesh':     'MP',
  'maharashtra':        'MH',
  'manipur':            'MN',
  'meghalaya':          'ML',
  'mizoram':            'MZ',
  'nagaland':           'NL',
  'odisha':             'OD',
  'punjab':             'PB',
  'rajasthan':          'RJ',
  'sikkim':             'SK',
  'tamil nadu':         'TN',
  'telangana':          'TG',
  'tripura':            'TR',
  'uttar pradesh':      'UP',
  'uttarakhand':        'UK',
  'west bengal':        'WB',
  'delhi':              'DL',
  'jammu and kashmir':  'JK',
  'ladakh':             'LA',
};

// Intra/Inter state detect karo
const isInterState = (sellerState, buyerState) => {
  const seller = sellerState?.toLowerCase().trim();
  const buyer  = buyerState?.toLowerCase().trim();
  return INDIAN_STATES[seller] !== INDIAN_STATES[buyer];
};

// Item wise GST calculate karo
const calculateItemGST = (item, sellerState, buyerState) => {
  const interState = isInterState(sellerState, buyerState);
  const gstRate    = getGSTRate(item.hsnCode) ?? 18;
  const amount     = item.quantity * item.rate;
  const gstAmount  = parseFloat(((amount * gstRate) / 100).toFixed(2));

  return {
    ...item,
    amount,
    hsnCode:    item.hsnCode,
    gstRate,
    gstAmount,
    cgst:       interState ? 0 : parseFloat((gstAmount / 2).toFixed(2)),
    sgst:       interState ? 0 : parseFloat((gstAmount / 2).toFixed(2)),
    igst:       interState ? gstAmount : 0,
    totalAmount: parseFloat((amount + gstAmount).toFixed(2)),
  };
};

// Poori invoice ka GST calculate karo
const calculateInvoiceGST = (items, sellerState, buyerState) => {
  const calculatedItems = items.map(item =>
    calculateItemGST(item, sellerState, buyerState)
  );

  const subtotal   = parseFloat(calculatedItems.reduce((sum, i) => sum + i.amount, 0).toFixed(2));
  const totalCGST  = parseFloat(calculatedItems.reduce((sum, i) => sum + i.cgst, 0).toFixed(2));
  const totalSGST  = parseFloat(calculatedItems.reduce((sum, i) => sum + i.sgst, 0).toFixed(2));
  const totalIGST  = parseFloat(calculatedItems.reduce((sum, i) => sum + i.igst, 0).toFixed(2));
  const totalGST   = parseFloat((totalCGST + totalSGST + totalIGST).toFixed(2));
  const total      = parseFloat((subtotal + totalGST).toFixed(2));
  const interState = isInterState(sellerState, buyerState);

  return {
    items:       calculatedItems,
    subtotal,
    totalCGST,
    totalSGST,
    totalIGST,
    totalGST,
    total,
    interState,
  };
};

module.exports = {
  INDIAN_STATES,
  isInterState,
  calculateItemGST,
  calculateInvoiceGST,
};