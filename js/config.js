window.PVQ_CONFIG = {
  // Основной backend: Google Apps Script (обычно доступен без VPN).
  API_URL: 'https://script.google.com/macros/s/AKfycbyZfC_t_qah1ttzqv73eooAsoJCPyGYH5NJbyB8gYZtxewU0dGAZQ8qg2erENJZy96GtQ/exec',
  // Резервные endpoints. Клиент попробует их по порядку, если основной недоступен.
  API_URL_FALLBACKS: [
    'https://vacancy-app-proxy.mcnil1991.workers.dev'
  ]
};
