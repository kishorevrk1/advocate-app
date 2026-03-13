const Purchases = {
  configure: () => {},
  getOfferings: async () => ({ current: null }),
  purchasePackage: async () => ({ customerInfo: { entitlements: { active: {} } } }),
  restorePurchases: async () => ({ entitlements: { active: {} } }),
  getCustomerInfo: async () => ({ entitlements: { active: {} } }),
}
module.exports = { default: Purchases, ...Purchases }
