const AgencyService = require('./agency');
const AgencySubscriptionService = require('./agency_subscription');
const AgencySubscriptionProductService = require('./agency_subscription_product');
const StripeService = require('./stripe');
const InventoryService = require('./inventory');
const ProductMatrixService = require('./product_matrix');
const CommonService = require('./common');

module.exports = () => ({
  agency: new AgencyService(),
  agencySubscription: new AgencySubscriptionService(),
  agencySubscriptionProduct: new AgencySubscriptionProductService(),
  stripe: new StripeService(),
  inventory: new InventoryService(),
  productMatrix: new ProductMatrixService(),
  common: new CommonService(),
});
