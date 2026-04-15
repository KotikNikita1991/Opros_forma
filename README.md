# Opros_forma (Pilot)

Статическая форма PVQ-RR для кандидата (57 вопросов) с одноразовой ссылкой `?token=...`.

## Выбранная схема (оптимум для пилота)

- **Frontend**: GitHub Pages (`*.github.io`)  
- **Backend API**: Google Apps Script (`script.google.com`)  
- **Резерв API**: Cloudflare proxy (`vacancy-app-proxy...workers.dev`)

Почему так:

- максимально быстро и бесплатно;
- не зависит от доступности `oprosforma...workers.dev` для кандидата;
- деплой из GitHub в 1 клик/автоматом.

## Что уже настроено в проекте

- Кандидат после отправки видит только: **"Спасибо! Опрос отправлен"**.
- API-клиент пробует endpoints по очереди:
  1) Google Apps Script (основной)
  2) Cloudflare proxy (резервный)
- Есть workflow для автодеплоя на GitHub Pages.

## Публикация на GitHub Pages

1. Запушьте проект в репозиторий `Opros_forma` (ветка `main`).
2. В GitHub откройте: `Settings -> Pages`.
3. В `Build and deployment` выберите `GitHub Actions`.
4. Дождитесь завершения workflow `Deploy static site to Pages`.
5. Получите URL вида:
   - `https://<username>.github.io/Opros_forma/`

## Важно: обновить базовый URL опроса в Apps Script

Письмо кандидату формируется на стороне Apps Script, поэтому базовый URL ссылки на опрос
должен указывать на GitHub Pages, например:

- `https://<username>.github.io/Opros_forma/`

Итоговая ссылка в письме:

- `https://<username>.github.io/Opros_forma/?token=<TOKEN>`

Если оставить старый `workers.dev`, у части кандидатов будет `ERR_CONNECTION_RESET`.
