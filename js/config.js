window.PVQ_CONFIG = {
  // Основной backend: Google Apps Script (обычно доступен без VPN).
  API_URL: 'https://script.google.com/macros/s/AKfycbwZA6uYQTRGk4OziTXxizHm2_S_tX7hmWE00SgbzTLB9fGn6UZpxo9OSIJ0sWJ8c8zqag/exec',
  // Резервные endpoints. Клиент попробует их по порядку, если основной недоступен.
  API_URL_FALLBACKS: [
    'https://vacancy-app-proxy.mcnil1991.workers.dev'
  ]
};
