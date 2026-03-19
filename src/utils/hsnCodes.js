// Common HSN Codes with GST Rates
const HSN_CODES = {
  // IT Services
  '9983': { description: 'IT Services',           gstRate: 18 },
  '9984': { description: 'Telecom Services',       gstRate: 18 },
  '9985': { description: 'Support Services',       gstRate: 18 },
  '9982': { description: 'Legal Services',         gstRate: 18 },
  '9981': { description: 'R&D Services',           gstRate: 18 },

  // Software
  '8523': { description: 'Software Products',      gstRate: 18 },
  '9986': { description: 'Agriculture Services',   gstRate: 0  },

  // Hardware
  '8471': { description: 'Computers/Laptops',      gstRate: 18 },
  '8443': { description: 'Printers',               gstRate: 18 },
  '8517': { description: 'Mobile Phones',          gstRate: 12 },

  // Food
  '0101': { description: 'Live Animals',           gstRate: 0  },
  '1001': { description: 'Wheat',                  gstRate: 0  },
  '2106': { description: 'Food Preparations',      gstRate: 12 },
  '2202': { description: 'Beverages',              gstRate: 12 },

  // Clothing
  '6101': { description: 'Clothing < 1000',        gstRate: 5  },
  '6201': { description: 'Clothing > 1000',        gstRate: 12 },

  // Construction
  '9954': { description: 'Construction Services',  gstRate: 12 },
  '9972': { description: 'Real Estate Services',   gstRate: 18 },

  // Medical
  '3004': { description: 'Medicines',              gstRate: 5  },
  '9993': { description: 'Health Services',        gstRate: 0  },

  // Education
  '9992': { description: 'Education Services',     gstRate: 0  },

  // Transport
  '9964': { description: 'Transport Services',     gstRate: 5  },
  '9965': { description: 'Goods Transport',        gstRate: 5  },

  // Hotel/Restaurant
  '9963': { description: 'Restaurant Services',    gstRate: 5  },
  '9979': { description: 'Hotel Services < 7500',  gstRate: 12 },
};

// HSN code se GST rate lo
const getGSTRate = (hsnCode) => {
  const hsn = HSN_CODES[hsnCode];
  if (!hsn) return null;
  return hsn.gstRate;
};

// HSN code valid hai kya
const isValidHSN = (hsnCode) => {
  return !!HSN_CODES[hsnCode];
};

module.exports = { HSN_CODES, getGSTRate, isValidHSN };