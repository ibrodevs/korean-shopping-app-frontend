# Backend Requirements (Django REST Framework)

## 1. Цель
Документ описывает требования к backend для текущего frontend-приложения. Backend должен заменить локальные mock/AsyncStorage данные и обеспечить реальную работу каталога, авторизации, корзины, избранного, заказов и логистики "Корея -> склады в Бишкеке".

## 2. Общие требования
- Стек: `Django + Django REST Framework`.
- Версионирование API: `/api/v1/...`.
- Формат: `application/json`.
- Валюта: `KGS (сом)`.
- Часовой пояс сервера и бизнес-логики: `Asia/Bishkek`.
- Все даты в ответах: ISO 8601 (`createdAt`, `updatedAt`, `etaAt` и т.д.).
- Идентификаторы: UUID (предпочтительно) либо стабильные строковые ID.

## 3. Авторизация и доступ

### 3.1 Auth
Нужно реализовать:
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout` (если используется refresh blacklist)
- `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/me`

Рекомендуется JWT (`simplejwt`):
- `access` (короткий TTL)
- `refresh` (длинный TTL)

### 3.2 Политика доступа
С учетом текущего UX фронта:
- до входа/регистрации пользователь не должен получать доступ к основным данным приложения (каталог/корзина/заказы).
- auth endpoints публичные.
- остальные бизнес endpoints защищены (`IsAuthenticated`).

## 4. Доменные сущности (минимум)

### 4.1 User
- `id`
- `name`
- `email` (unique)
- `password_hash`
- timestamps

### 4.2 Category
- `id`
- `title`
- `iconName`
- `isActive`
- `sortOrder`

### 4.3 Product
- `id`
- `title`
- `brand`
- `price` (int, в сомах)
- `oldPrice` (nullable)
- `rating` (decimal)
- `reviewCount` (int)
- `images` (array URL)
- `tags` (array строк)
- `categoryId`
- `isNew` (bool)
- `isSale` (bool)
- `stockStatus`: `in_stock | low_stock | out_of_stock`
- `availableSizes` (array, опционально)
- `availableColors` (array, опционально)
- `isActive`
- timestamps

### 4.4 Warehouse (Бишкек)
- `id`
- `label` (например: `Bishkek Warehouse #1`)
- `address`
- `contactPhone`
- `isActive`

### 4.5 ArrivalWindow
- `id`
- `warehouseId`
- `label` (например: `Next arrival: Tue, 18:00 - 21:00`)
- `startAt`
- `endAt`
- `capacity` (опционально)
- `isActive`

### 4.6 Cart / CartItem
- `Cart`: `id`, `userId`, timestamps
- `CartItem`:
  - `id`
  - `cartId`
  - `productId`
  - `qty`
  - `selectedSize` (nullable)
  - `selectedColor` (nullable)

Уникальность позиции: `(cartId, productId, selectedSize, selectedColor)`.

### 4.7 Favorite
- `id`
- `userId`
- `productId`
- unique `(userId, productId)`

### 4.8 Coupon
- `code` (unique, например `SAVE5`, `BEAUTY10`)
- `type` (`percent`)
- `value` (5, 10)
- `maxDiscount` (5000, 10000)
- `isActive`
- `validFrom`, `validTo`
- ограничения по категориям (опционально)

### 4.9 Order / OrderItem
- `Order`:
  - `id`
  - `userId`
  - `status`: `processing | shipped | delivered | cancelled`
  - `warehouseId`
  - `arrivalWindowId`
  - `paymentMethod`
  - `couponCode` (nullable)
  - `subtotal`
  - `discount`
  - `importFee` (на фронте сейчас используется поле deliveryFee)
  - `total`
  - `createdAt`, `updatedAt`
- `OrderItem`:
  - `id`
  - `orderId`
  - `productId`
  - `qty`
  - `price` (snapshot на момент заказа)
  - `selectedSize`, `selectedColor` (nullable)

Важно для совместимости с текущим фронтом:
- либо отдавать поле `deliveryFee`,
- либо фронт переводится на `importFee`.

## 5. API Endpoints

## 5.1 Catalog
- `GET /api/v1/categories`
- `GET /api/v1/products`
- `GET /api/v1/products/{id}`

Поддержать query-параметры для списка `products`:
- `search` (по `title`, `brand`, `tags`)
- `categoryId`
- `minPrice`, `maxPrice`
- `ratingMin`
- `inStockOnly` (exclude `out_of_stock`)
- `saleOnly`
- `tags` (массив/повторяемый param)
- `sort`: `popular | newest | price_asc | price_desc`
- пагинация: `page`, `pageSize`

## 5.2 Search / recent searches
Вариант A (как сейчас фронт): recent хранит клиент.

Вариант B (рекомендуется):
- `GET /api/v1/search/recent`
- `POST /api/v1/search/recent`
- `DELETE /api/v1/search/recent/{term}`
- `DELETE /api/v1/search/recent`

## 5.3 Favorites
- `GET /api/v1/favorites`
- `POST /api/v1/favorites` (body: `productId`)
- `DELETE /api/v1/favorites/{productId}`

## 5.4 Cart
- `GET /api/v1/cart`
- `POST /api/v1/cart/items`
- `PATCH /api/v1/cart/items/{itemId}` (qty)
- `DELETE /api/v1/cart/items/{itemId}`
- `DELETE /api/v1/cart/items` (clear)

Ответ `GET /cart` должен включать:
- items
- subtotal
- discount
- importFee (или deliveryFee для совместимости)
- total
- validation flags (например, `hasOutOfStock`)

## 5.5 Checkout / Orders
- `GET /api/v1/warehouses`
- `GET /api/v1/warehouses/{id}/arrival-windows`
- `GET /api/v1/payment-methods`
- `POST /api/v1/coupons/validate`
- `POST /api/v1/orders`
- `GET /api/v1/orders`
- `GET /api/v1/orders/{id}`

`POST /orders` принимает:
- `warehouseId`
- `arrivalWindowId`
- `paymentMethod`
- `couponCode` (optional)
- `items` (если checkout не из серверной корзины)

Или оформляет заказ напрямую из текущей корзины пользователя (предпочтительно).

## 6. Бизнес-правила (обязательно)
- Нельзя добавить в корзину `out_of_stock` товар.
- Нельзя оформить заказ, если в корзине есть `out_of_stock`.
- Цена и скидка рассчитываются на backend, frontend только отображает.
- Правила купонов:
  - `SAVE5` = `5%`, максимум `5000` сом.
  - `BEAUTY10` = `10%`, максимум `10000` сом.
- Стоимость импорта (сейчас логика фронта):
  - `3000` сом,
  - `0` при `subtotal >= 50000` сом.
- В заказ сохраняется snapshot цен и выбранных опций (`size/color`).

## 7. Формат ответов (контракт)
Рекомендуется унифицировать:
- успешный ответ:
  - `{ "data": ... }`
- ошибка:
  - `{ "error": { "code": "...", "message": "...", "fields": {...} } }`

HTTP коды:
- `200/201` успешные
- `400` валидация
- `401` не авторизован
- `403` запрещено
- `404` не найдено
- `409` конфликт (например, состояние заказа)

## 8. Админ-панель и контент-управление
Нужно через Django Admin:
- CRUD категорий
- CRUD товаров
- управление остатками/статусом наличия
- CRUD складов Бишкек
- расписания поставок (arrival windows)
- купоны
- просмотр заказов и смена статусов

## 9. Нефункциональные требования
- Пагинация на списках товаров и заказов.
- Индексы БД:
  - `Product(categoryId, isActive)`
  - полнотекст/триграмма по `title/brand/tags`
  - `Order(userId, createdAt)`
- Логи аудита по смене статусов заказа.
- Rate limit для auth endpoints.
- CORS для мобильного клиента.

## 10. Рекомендуемый порядок реализации (MVP)
1. Auth (JWT) + `me`.
2. Catalog: categories/products + filters/sort/search.
3. Favorites.
4. Cart + server-side totals.
5. Warehouses + arrival windows (Бишкек).
6. Checkout + orders.
7. Coupons + валидация.
8. Admin flows + hardening.

## 11. Что фронт ожидает уже сейчас
- Поля товара как в текущих TS-моделях (`id`, `title`, `brand`, `price`, `oldPrice`, `rating`, `reviewCount`, `images`, `tags`, `categoryId`, `isNew`, `isSale`, `stockStatus`).
- Статусы заказа: `processing`, `shipped`, `delivered`, `cancelled`.
- Заказы с позициями, total, discount и fee полем (в текущем коде: `deliveryFee`).
- Фильтры каталога: цена, рейтинг, теги, in-stock-only, sale-only, сортировки.

---
Если нужно, следующим шагом могу подготовить второй документ: `OPENAPI_YAML` (черновик спецификации endpoint-ов с request/response примерами).
