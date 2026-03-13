import AsyncStorage from '@react-native-async-storage/async-storage'

export type Country = 'IN' | 'US' | 'OTHER'

const KEY = 'advocate_country'

export async function getCountry(): Promise<Country> {
  const stored = await AsyncStorage.getItem(KEY)
  return (stored as Country) || 'US'
}

export async function setCountry(country: Country): Promise<void> {
  await AsyncStorage.setItem(KEY, country)
}

export const COUNTRY_FLAGS: Record<Country, string> = {
  IN:    '🇮🇳',
  US:    '🇺🇸',
  OTHER: '🌍',
}

export const COUNTRY_NAMES: Record<Country, string> = {
  IN:    'India',
  US:    'USA',
  OTHER: 'Global',
}
