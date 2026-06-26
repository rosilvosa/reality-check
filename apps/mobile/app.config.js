export default {
  expo: {
    name: 'Reality Check',
    slug: 'reality-check',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#08080f',
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.ronsilv.realitycheck',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#08080f',
      },
      package: 'com.ronsilv.realitycheck',
      permissions: ['CAMERA', 'READ_CONTACTS', 'CALL_PHONE', 'RECEIVE_BOOT_COMPLETED', 'VIBRATE'],
    },
    plugins: [
      'expo-notifications',
      ['expo-camera', { cameraPermission: 'Allow Reality Check to scan barcodes.' }],
      ['expo-local-authentication', { faceIDPermission: 'Allow Reality Check to use Face ID.' }],
    ],
    extra: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
    },
  },
}
