window.PVQ_CONFIG = {
  // Основной backend: Google Apps Script (обычно доступен без VPN).
  API_URL: 'https://script.google.com/macros/s/AKfycbzJlvrImV6FQ0qg68wQMoJq0NSGJ3KCF_yi8kRjSCXfDtCtG9eE3tnGZ2jJ_3q_bP2maQ/exec',
  // Резервные endpoints. Клиент попробует их по порядку, если основной недоступен.
  API_URL_FALLBACKS: [
    'https://vacancy-app-proxy.mcnil1991.workers.dev'
  ]
};
