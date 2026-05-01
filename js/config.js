window.PVQ_CONFIG = {
  // Основной backend: Google Apps Script (обычно доступен без VPN).
  API_URL: 'https://script.google.com/macros/s/AKfycbzU6HL8rPlQuBqoqAR6p_Yl6lCpNQTFAHI0l0pFIIKUH6P_kcPdpcg_DsxCvE-ZjLZ23w/exec',
  // Резервные endpoints. Клиент попробует их по порядку, если основной недоступен.
  API_URL_FALLBACKS: [
    'https://vacancy-app-proxy.mcnil1991.workers.dev'
  ]
};
