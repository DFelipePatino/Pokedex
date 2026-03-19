// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// 1. Add 'wasm' to source extensions so Metro can "read" the SQLite binary
config.resolver.sourceExts.push('wasm');

// 2. Add 'wasm' to asset extensions just to be safe for web bundling
config.resolver.assetExts.push('wasm');

module.exports = config;