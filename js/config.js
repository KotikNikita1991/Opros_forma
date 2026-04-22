window.PVQ_CONFIG = {
  // Основной backend: Google Apps Script (обычно доступен без VPN).
  API_URL: 'https://script.google.com/macros/s/AKfycbw7auhv_YALBiENojcJA34H-F6e7LutUIccL4YsPrw4pVo01Wg67S39DZdK242hFatZuQ/exec',
  // Резервные endpoints. Клиент попробует их по порядку, если основной недоступен.
  API_URL_FALLBACKS: [
    'https://vacancy-app-proxy.mcnil1991.workers.dev'
  ]
};
