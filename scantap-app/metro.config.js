const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// SOLUÇÃO DEFINITIVA: Impedir que Metro processe arquivos Express do diretório pai
config.resolver = {
  ...config.resolver,
  blockList: [
    // Bloquear TODOS os arquivos do diretório pai que causam conflito
    /.*\/server\.js$/,
    /.*\/index\.js$/,
    /.*\/MVP_startup\/node_modules\/express\/.*/,
    /.*\/MVP_startup\/node_modules\/.*\.js$/,
  ],
  resolverMainFields: ['react-native', 'browser', 'main'],
  platforms: ['ios', 'android', 'native', 'web'],
};

// Limitar watchFolders APENAS ao diretório atual (scantap-app)
config.watchFolders = [__dirname];

// Resolver apenas módulos do node_modules local
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

module.exports = config;