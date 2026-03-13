const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const config = getDefaultConfig(__dirname)

// Stub native-only packages when bundling for web
const webStubs = {
  'react-native-purchases': path.resolve(__dirname, 'src/stubs/react-native-purchases.js'),
  'react-native-html-to-pdf': path.resolve(__dirname, 'src/stubs/react-native-html-to-pdf.js'),
  'react-native-share': path.resolve(__dirname, 'src/stubs/react-native-share.js'),
  'react-native-document-picker': path.resolve(__dirname, 'src/stubs/react-native-document-picker.js'),
  'mixpanel-react-native': path.resolve(__dirname, 'src/stubs/mixpanel-react-native.js'),
  'react-native-svg': path.resolve(__dirname, 'src/stubs/react-native-svg.js'),
}

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && webStubs[moduleName]) {
    return { filePath: webStubs[moduleName], type: 'sourceFile' }
  }
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
