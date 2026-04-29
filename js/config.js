window.PVQ_CONFIG = {
  // Основной backend: Google Apps Script (обычно доступен без VPN).
  API_URL: 'https://script.google.com/macros/s/AKfycbySCauzCzsHLRcFmoaBBIuwPYPhlWYc7Buewn_cuCHcxRRYjCgXtTCAk86o1JV25wv8tw/exec',
  // Резервные endpoints. Клиент попробует их по порядку, если основной недоступен.
  API_URL_FALLBACKS: [
    'https://vacancy-app-proxy.mcnil1991.workers.dev'
  ]
};
