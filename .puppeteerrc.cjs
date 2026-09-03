const { join } = require('path');

/**
 * @type {import('puppeteer').Configuration}
 */
module.exports = {
  // Cambiar la caché de Puppeteer a una carpeta dentro del proyecto
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
