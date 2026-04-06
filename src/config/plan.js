const PLANS = {
  free: {
    name:          'Free',
    price:         0,
    currency:      'INR',
    invoiceLimit:  50,
    rateLimit:     10,
    trialDays:     0,
    features: [
      '50 invoices/month',
      'PDF generation',
      'Email delivery',
      'Basic analytics',
    ]
  },
  starter: {
    name:             'Starter',
    price:            999,
    currency:         'INR',
    razorpayPlanId:   process.env.RAZORPAY_PLAN_STARTER,
    invoiceLimit:     500,
    rateLimit:        60,
    trialDays:        14,
    features: [
      '500 invoices/month',
      'PDF generation',
      'Email delivery',
      'Advanced analytics',
      'CSV export',
      'Webhook support',
    ]
  },
  pro: {
    name:             'Pro',
    price:            2999,
    currency:         'INR',
    razorpayPlanId:   process.env.RAZORPAY_PLAN_PRO,
    invoiceLimit:     -1,
    rateLimit:        300,
    trialDays:        14,
    features: [
      'Unlimited invoices',
      'PDF generation',
      'Email delivery',
      'Advanced analytics',
      'CSV + GST export',
      'Webhook support',
      'Priority support',
      'Custom branding',
    ]
  },
  enterprise: {
    name:           'Enterprise',
    price:          0,
    currency:       'INR',
    invoiceLimit:   -1,
    rateLimit:      1000,
    trialDays:      30,
    features: [
      'Everything in Pro',
      'Custom pricing',
      'Dedicated support',
      'SLA guarantee',
      'Custom integrations',
    ]
  }
};

const getPlan = (planName) => PLANS[planName] || PLANS.free;
const isValidPlan = (planName) => Object.keys(PLANS).includes(planName);

module.exports = { PLANS, getPlan, isValidPlan };