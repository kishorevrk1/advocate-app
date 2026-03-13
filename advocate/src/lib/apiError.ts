/**
 * Parses API/network errors into user-friendly messages.
 */
export function parseApiError(e: any): string {
  // Network unreachable (localhost on device, server down, no WiFi)
  if (
    e?.code === 'ERR_NETWORK' ||
    e?.code === 'ECONNREFUSED' ||
    e?.message?.includes('Network Error') ||
    e?.message?.includes('ERR_NETWORK')
  ) {
    return 'Cannot reach the server. Make sure you are on the same WiFi as your computer, or the backend is deployed.'
  }

  // Timeout
  if (e?.code === 'ECONNABORTED' || e?.message?.includes('timeout')) {
    return 'Request timed out. The server is taking too long — please try again.'
  }

  // Server returned an error message
  if (e?.response?.data?.error) {
    return e.response.data.error
  }

  // HTTP status errors
  if (e?.response?.status === 429) {
    return 'Too many requests. Please wait a moment and try again.'
  }
  if (e?.response?.status === 503) {
    return 'Server is temporarily unavailable. Please try again shortly.'
  }
  if (e?.response?.status >= 500) {
    return 'Server error. Please try again in a moment.'
  }

  return e?.message || 'Something went wrong. Please try again.'
}
