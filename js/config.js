window.PVQ_CONFIG = {
  // Основной backend: Google Apps Script (обычно доступен без VPN).
  API_URL: 'https://script.google.com/macros/s/AKfycbxGUZXC8z0rbL0yZ4__YnpXEa-ssV57Ht6ZEXJRxgBX0p54E_e3dw9YvyhIPfO-mxgwbQ/exec',
  // Резервные endpoints. Клиент попробует их по порядку, если основной недоступен.
  API_URL_FALLBACKS: [
    'https://vacancy-app-proxy.mcnil1991.workers.dev'
  ]
};
