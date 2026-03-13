import Purchases, { PurchasesPackage } from 'react-native-purchases'
import Constants from 'expo-constants'

// RevenueCat native SDK doesn't work in Expo Go — skip silently
const isExpoGo = Constants.appOwnership === 'expo'

export const initializePurchases = (userId?: string) => {
  if (isExpoGo) return
  const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_KEY
  if (!apiKey) return
  try {
    Purchases.configure({ apiKey, appUserID: userId })
  } catch (_e) {
    // ignore — running in environment without native store
  }
}

export const getOfferings = async () => {
  if (isExpoGo) return null
  try {
    const offerings = await Purchases.getOfferings()
    return offerings.current
  } catch (_e) {
    return null
  }
}

export const purchasePackage = async (pkg: PurchasesPackage): Promise<boolean> => {
  if (isExpoGo) return false
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg)
    return customerInfo.entitlements.active['pro'] !== undefined
  } catch (e: any) {
    if (e.userCancelled) return false
    throw e
  }
}

export const restorePurchases = async (): Promise<boolean> => {
  if (isExpoGo) return false
  try {
    const customerInfo = await Purchases.restorePurchases()
    return customerInfo.entitlements.active['pro'] !== undefined
  } catch (_e) {
    return false
  }
}

export const checkProStatus = async (): Promise<boolean> => {
  if (isExpoGo) return false
  try {
    const customerInfo = await Purchases.getCustomerInfo()
    return customerInfo.entitlements.active['pro'] !== undefined
  } catch (_e) {
    return false
  }
}
