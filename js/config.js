window.PVQ_CONFIG = {
  // Основной backend: Google Apps Script (обычно доступен без VPN).
  API_URL: 'https://script.google.com/macros/s/AKfycbzFg98a0X6TvIVu-raHo0mc0J1GXieXVz3OW7CW3ZZSq8c9LKZksk6Fnuzx9K4xn6r0Qg/exec',
  // Резервные endpoints. Клиент попробует их по порядку, если основной недоступен.
  API_URL_FALLBACKS: [
    'https://vacancy-app-proxy.mcnil1991.workers.dev'
  ]
};
