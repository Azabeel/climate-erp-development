# CLAUDE.md — АСУ СЦ «Сервис Климат» v4.0
# Инструкция для автономной разработки

## ⚡ РЕЖИМ РАБОТЫ

Ты разрабатываешь **АСУ СЦ «Сервис Климат»** — комплексную платформу управления
авторизованным сервисным центром климатического оборудования.

### Принципы автономной работы
1. **TDD обязателен** — сначала тест, потом реализация
2. **После каждого файла** — запусти затронутые тесты
3. **При ошибке** — исправь самостоятельно, не останавливайся
4. **Один спринт = одна сессия** — доведи до зелёных тестов
5. **Фиксируй прогресс** — обновляй `PROGRESS.md` после каждого модуля
6. **Параллельная работа** — используй subagents для независимых задач
7. **Не спрашивай** — принимай технические решения самостоятельно согласно этому файлу

---

## 📊 ПРОГРЕСС СПРИНТОВ

```
[ ] Sprint 01 — Инфраструктура и БД          (2-3 дня)
[ ] Sprint 02 — Ядро: клиенты и договоры     (3-4 дня)
[ ] Sprint 03 — FSM: наряды и статусы        (4-5 дней)
[ ] Sprint 04 — SLA и уведомления            (3-4 дня)
[ ] Sprint 05 — Склад и хладагенты           (3-4 дня)
[ ] Sprint 06 — Закупки и ЗИП                (3-4 дня)
[ ] Sprint 07 — Финансы и маржинальность     (4-5 дней)
[ ] Sprint 08 — HR и зарплата                (4-5 дней)
[ ] Sprint 09 — Android MVP                  (5-7 дней)
[ ] Sprint 10 — CRM и воронка продаж         (4-5 дней)
[ ] Sprint 11 — EAM и хладагенты             (3-4 дня)
[ ] Sprint 12 — Умное планирование           (4-5 дней)
[ ] Sprint 13 — Интеграции (1С, мессенджеры) (5-7 дней)
[ ] Sprint 14 — ИИ-агенты                   (7-10 дней)
[ ] Sprint 15 — Фронтенд (React)             (5-7 дней)
[ ] Sprint 16 — Тестирование и финализация   (3-5 дней)
```

---

## 🛠 ТЕХНОЛОГИЧЕСКИЙ СТЕК

### Backend
```
Java 17 + Spring Boot 3.2
PostgreSQL 15 (основная БД)
Redis 7 (кэш + очереди)
RabbitMQ 3.12 (async messaging)
Elasticsearch 8 (поиск по мануалам)
MinIO (S3 — файлы, фото)
Keycloak 23 (авторизация, JWT)
Flyway (миграции БД)
MapStruct (маппинг DTO)
Lombok (бойлерплейт)
```

### Frontend
```
React 18 + TypeScript
Ant Design 5
Zustand (state management)
React Query (server state)
Recharts (графики)
Leaflet (карты)
```

### Mobile (Android)
```
Kotlin + Jetpack Compose
Room (локальная БД)
WorkManager (фоновая синхронизация)
Retrofit (API клиент)
Coil (загрузка изображений)
ML Kit (OCR для кодов ошибок)
```

### AI/ML
```
Self-hosted Ollama (LLM — mistral:7b или llama3:8b)
Sentence Transformers (embeddings)
LangChain4j (Java LLM framework)
```

---

## 📐 АРХИТЕКТУРА ПАКЕТОВ (Backend)

```
ru.servisklimat
├── api
│   ├── controller       REST контроллеры (@RestController)
│   ├── dto              Request/Response объекты
│   └── mapper           MapStruct маперы
├── domain
│   ├── model            JPA сущности
│   ├── repository       Spring Data JPA
│   └── service          Бизнес-логика
├── integration
│   ├── onec             1С:УНФ интеграция
│   ├── telegram         Telegram Bot API
│   ├── whatsapp         WhatsApp Business API
│   ├── avito            Avito Messenger API
│   ├── email            IMAP/SMTP
│   ├── osrm             Маршрутизация
│   └── weather          Погода (Яндекс + OWM + Gismeteo)
├── ai
│   ├── consultant       Технический ИИ-консультант
│   ├── analyst          Бизнес-аналитик
│   └── chatbot          Чат-бот на сайте
├── scheduler            Spring Scheduler задачи
├── websocket            WebSocket handlers
├── security             JWT + Keycloak
└── config               Конфигурации
```

---

## ⚙️ ПРАВИЛА КОДА (обязательны)

```java
// ✅ ДЕНЬГИ — ТОЛЬКО BigDecimal
BigDecimal price = new BigDecimal("1500.00");  // ✅
double price = 1500.0;                          // ❌ НИКОГДА

// ✅ ДАТЫ — ТОЛЬКО ZonedDateTime с timezone
ZonedDateTime now = ZonedDateTime.now(ZoneId.of("Europe/Moscow"));

// ✅ СТАТУСЫ — ТОЛЬКО Enum
enum WorkOrderStatus { NEW, ASSIGNED, EN_ROUTE, ON_SITE, ... }
String status = "NEW";  // ❌ НИКОГДА строки для статусов

// ✅ @Transactional ТОЛЬКО на сервисном слое
@Service
public class WorkOrderService {
    @Transactional  // ✅ здесь
    public void updateStatus(...) {}
}

// ✅ ПАГИНАЦИЯ везде где список > 50 элементов
Page<WorkOrderDto> findAll(Pageable pageable);

// ✅ DTO РАЗДЕЛЕНЫ от Entity
// Entity: WorkOrder.java
// DTO:    WorkOrderDto.java, CreateWorkOrderRequest.java, UpdateWorkOrderRequest.java

// ✅ АУДИТ — все изменения логируются
@EntityListeners(AuditingEntityListener.class)
public class WorkOrder {
    @CreatedDate
    private ZonedDateTime createdAt;
    @LastModifiedDate
    private ZonedDateTime updatedAt;
    @CreatedBy
    private UUID createdBy;
}
```

---

## 🗃️ КЛЮЧЕВЫЕ ENUM-Ы (используй везде)

```java
// Наряды
enum WorkOrderType    { REPAIR, MAINTENANCE, WARRANTY, CLAIM, PPR, INSTALLATION }
enum WorkOrderStatus  { NEW, ASSIGNED, EN_ROUTE, ON_SITE, IN_PROGRESS,
                        AWAITING_PARTS, READY_TO_RESUME, COMPLETED, CLOSED, CANCELLED }
enum Priority         { NORMAL, URGENT, EMERGENCY }
enum WorkOrderSource  { MANUAL, CLIENT_PORTAL, EMAIL, PPR, API, AVITO,
                        TELEGRAM, WHATSAPP, MAX, WEBSITE_CHAT, WEBSITE_FORM }

// Клиенты и CRM
enum ClientType       { INDIVIDUAL, LEGAL_ENTITY }
enum Channel          { TELEGRAM, WHATSAPP, MAX, EMAIL, SMS, PUSH, IN_APP, AVITO }
enum DealStage        { LEAD, QUALIFICATION, MEETING, PROPOSAL, NEGOTIATION,
                        CLOSED_WON, CLOSED_LOST }

// Инженеры
enum EmploymentType   { EMPLOYEE, CONTRACTOR }
enum VehicleType      { OWN_CAR, COMPANY_CAR, PUBLIC_TRANSPORT }
enum SkillLevel       { TRAINEE, BASIC, EXPERT }
enum DayStartType     { HOME, OFFICE }

// SLA
enum SLALevel         { CORPORATE, CONTRACT }
enum SLAMetric        { TTR, TTO, TTF }
enum SLAStatus        { GREEN, YELLOW, RED }

// Закупки
enum PurchaseStatus   { NEW, IN_PROGRESS, PARTIALLY_RECEIVED,
                        FULLY_RECEIVED, TRANSFERRED }
enum ItemStatus       { NEW, ORDERED, IN_TRANSIT, RECEIVED, TRANSFERRED }
enum PaymentStatus    { PENDING, PAID, REJECTED }

// Склад
enum StockLocationType { CENTRAL, MOBILE }
enum MovementType      { RECEIPT, TRANSFER, WRITE_OFF, RETURN, INVENTORY }
enum RefrigerantOp     { CHARGE, RECOVERY, TOP_UP, REPLACEMENT }

// HR
enum ScheduleType     { WORKING, DAY_OFF, VACATION, SICK, CUSTOM }
enum ExecutionType    { SEQUENTIAL, PARALLEL, REQUIRES_TWO }
```

---

## 🔑 БИЗНЕС-ПРАВИЛА (КРИТИЧЕСКИ ВАЖНЫ)

### 1. Расчёт времени наряда (Critical Path)
```
total_duration = critical_path(tasks)
  SEQUENTIAL задачи: sum(duration + modifiers)
  PARALLEL задачи: max(duration)  ← НЕ суммировать!
  REQUIRES_TWO: ищем окно где ДВА инженера свободны
  + буфер 15 мин на внутреннее перемещение
```

### 2. SLA — двухуровневая модель
```
При выборе контрагента:
  1. Найти активный договор клиента
  2. Если договоров > 1 → выбор диспетчером
  3. Из договора взять sla_config_id
  4. Если null → использовать корпоративный SLA
  5. TTR/TTO/TTF = created_at + hours (учитывая service_hours)
Мониторинг каждые 5 минут:
  remaining% <= warning_percent → YELLOW (уведомить диспетчера ОДИН РАЗ)
  remaining% <= 0 → RED (уведомить диспетчера + руководителя)
```

### 3. Себестоимость наряда
```java
costPrice =
  materials_cost    // SUM(qty * purchase_price) из stock_movements
  + refrigerant_cost // SUM(kg * purchase_price) из refrigerant_log
  + zip_cost        // SUM(purchase_price * qty) из purchase_request_items
  + labor_cost      // piece_rates + надбавки (ночные, праздник, аварийные)
  + fuel_cost       // gps_km * fuel_rate_per_km
  + overhead        // revenue * overhead_percent / 100

margin = revenue - costPrice
margin_percent = margin / revenue * 100
```

### 4. Наценка на ЗИП (два варианта)
```java
// Пользователь вводит ЛИБО markup_percent ЛИБО markup_amount
if (markupPercent != null) {
    salePrice = purchasePrice.multiply(
        BigDecimal.ONE.add(markupPercent.divide(new BigDecimal("100"))));
    markupAmount = salePrice.subtract(purchasePrice);
} else if (markupAmount != null) {
    salePrice = purchasePrice.add(markupAmount);
    markupPercent = markupAmount.divide(purchasePrice, 2, HALF_UP)
                               .multiply(new BigDecimal("100"));
}
// default из system_settings.zip_default_markup = 30%
```

### 5. Журнал хладагентов (ОБЯЗАТЕЛЬНЫЙ учёт)
```
При каждой операции с хладагентом:
  - тип хладагента, кол-во кг, тип операции (CHARGE/RECOVERY/TOP_UP)
  - баллон-источник (серийный номер)
  - инженер, наряд, дата
  - расчёт показателя утечки = (заправлено за год / полный заряд) * 100%
  - при превышении порога → создать задачу на внеплановую проверку
```

### 6. Автоматические уведомления клиенту
```
ASSIGNED    → «Заявка принята. Инженер {name} приедет {date} в {time}»
EN_ROUTE    → «Инженер {name} выехал. Ожидайте ~{eta} минут»
30min_before → «Инженер будет через ~30 минут»
AWAITING_PARTS → «Заказана запчасть. Срок: {date}» (если флаг notify=true)
PARTS_READY → «Запчасть получена. Свяжемся для согласования»
COMPLETED   → «Работы выполнены. Оцените качество: {link}»
```

---

## 📋 ДЕТАЛЬНЫЕ СПРИНТЫ

---

### SPRINT 01 — Инфраструктура и БД
**Цель:** Работающий Spring Boot + полная схема БД + Docker

**Задачи:**
```
□ 1.1 Docker Compose: postgres, redis, rabbitmq, minio, keycloak, elasticsearch
□ 1.2 Spring Boot проект: pom.xml со всеми зависимостями
□ 1.3 application.yml: все настройки с env-переменными
□ 1.4 Flyway миграция V001__init_schema.sql (полная схема из docs/full-spec.md)
□ 1.5 Flyway V002__initial_data.sql (справочники: бренды, SLA, шаблоны уведомлений)
□ 1.6 Keycloak realm конфигурация: роли, клиент, users
□ 1.7 SecurityConfig: JWT + Keycloak + RBAC
□ 1.8 AuditConfig: @EnableJpaAuditing, текущий пользователь
□ 1.9 MinIO бакеты: work-order-photos, documents, manuals
□ 1.10 Health endpoint: GET /actuator/health
```

**Критерии завершения (Definition of Done):**
```bash
# Все контейнеры запущены и здоровы
docker-compose ps | grep -v Exit

# Приложение стартует
curl http://localhost:8090/actuator/health | grep '"status":"UP"'

# Схема применена
docker exec sk_postgres psql -U servisklimat -c "\dt" | grep work_orders

# Тесты проходят
mvn test -pl backend

# Нет критических предупреждений Spring
grep -v "WARN\|ERROR" backend/spring.log | tail -5
```

---

### SPRINT 02 — Ядро: Клиенты, Договоры, Сотрудники
**Цель:** Полный CRUD для основных справочников с тестами

**Задачи:**
```
□ 2.1 JPA Entity: Client, Contact, Contract, SLAConfig, SLAServiceHours
□ 2.2 JPA Entity: Engineer, EngineerCertification, EngineerCompetency
□ 2.3 JPA Entity: Brand, Competency, Supplier, SystemSettings
□ 2.4 Repository слой для всех сущностей
□ 2.5 Service слой: ClientService, ContractService, EngineerService
□ 2.6 REST API: GET/POST/PUT/DELETE /api/v1/clients
□ 2.7 REST API: GET/POST/PUT/DELETE /api/v1/contracts
□ 2.8 REST API: GET/POST/PUT /api/v1/engineers
□ 2.9 REST API: GET/POST /api/v1/engineers/{id}/certifications
□ 2.10 DTO + MapStruct маперы для всех сущностей
□ 2.11 Валидация: @Valid + кастомные исключения + GlobalExceptionHandler
□ 2.12 Unit тесты: ClientServiceTest, ContractServiceTest, EngineerServiceTest
□ 2.13 Integration тесты: ClientControllerIT (TestContainers PostgreSQL)
```

**Критерии завершения:**
```bash
mvn test -pl backend -Dtest="ClientServiceTest,ContractServiceTest,EngineerServiceTest,ClientControllerIT"
# Все зелёные

curl -X POST http://localhost:8090/api/v1/clients \
  -H "Content-Type: application/json" \
  -d '{"type":"INDIVIDUAL","name":"Иванов Иван","phone":"+79001234567"}' | grep '"id"'
```

---

### SPRINT 03 — FSM: Заявки и Наряды
**Цель:** Полный жизненный цикл наряда с расчётом времени

**Задачи:**
```
□ 3.1 JPA Entity: Service, ServiceModifier, ServiceCompetency
□ 3.2 JPA Entity: WorkOrder, WorkOrderService (позиция услуги), WorkOrderStatusLog
□ 3.3 JPA Entity: WorkOrderPhoto, WorkOrderMaterial
□ 3.4 CriticalPathCalculator: расчёт total_duration (SEQUENTIAL/PARALLEL/REQUIRES_TWO)
□ 3.5 WorkOrderStateMachine: все переходы статусов с проверками
□ 3.6 Service слой: WorkOrderService, ServiceCatalogService
□ 3.7 REST API: CRUD /api/v1/work-orders
□ 3.8 REST API: POST /api/v1/work-orders/{id}/status (смена статуса)
□ 3.9 REST API: POST /api/v1/work-orders/{id}/materials (списание материалов)
□ 3.10 REST API: POST /api/v1/work-orders/{id}/photos (загрузка фото в MinIO)
□ 3.11 Автоматический номер наряда: WO-{YEAR}-{SEQUENCE:06d}
□ 3.12 Автоматическое подтягивание SLA при выборе договора
□ 3.13 Unit тесты: CriticalPathCalculatorTest (все типы выполнения)
□ 3.14 Unit тесты: WorkOrderStateMachineTest (все переходы + невалидные)
□ 3.15 Integration тесты: WorkOrderControllerIT
```

**Критерии завершения:**
```bash
mvn test -pl backend -Dtest="CriticalPathCalculatorTest,WorkOrderStateMachineTest,WorkOrderControllerIT"

# Тест критического пути
# SEQUENTIAL(60) + PARALLEL(max(30,40)) + SEQUENTIAL(45) = 60+40+45 = 145 мин
# CriticalPathCalculatorTest.testMixedTasks() → 145

# Тест статусной машины
# NEW → ASSIGNED → EN_ROUTE → ON_SITE → IN_PROGRESS → COMPLETED ✅
# NEW → COMPLETED ❌ (InvalidStateTransitionException)
```

---

### SPRINT 04 — SLA Мониторинг и Уведомления
**Цель:** Автоматический контроль SLA + Telegram уведомления

**Задачи:**
```
□ 4.1 SLACalculator: расчёт плановых TTR/TTO/TTF с учётом service_hours
□ 4.2 SLAMonitoringScheduler: каждые 5 минут проверяет все активные наряды
□ 4.3 NotificationService: отправка через RabbitMQ
□ 4.4 TelegramAdapter: Telegram Bot API интеграция
□ 4.5 EmailAdapter: SMTP отправка (Яндекс/корпоративный)
□ 4.6 NotificationTemplateEngine: рендеринг шаблонов с переменными
□ 4.7 EventDrivenNotifications: WebApplicationEvent на каждый переход статуса
□ 4.8 Таблица notification_templates: загрузка шаблонов из БД
□ 4.9 Логирование: notification_log (sent/failed + retry)
□ 4.10 Unit тесты: SLACalculatorTest (рабочие часы, переносы через ночь)
□ 4.11 Unit тесты: NotificationTemplateEngineTest
□ 4.12 Integration тест: SLAMonitoringSchedulerIT (моки времени)
```

**Критерии завершения:**
```bash
mvn test -pl backend -Dtest="SLACalculatorTest,NotificationTemplateEngineTest"

# SLACalculatorTest должен пройти кейсы:
# - TTF 24ч, создан в 23:00 пт → плановое закрытие пн 23:00 (только раб. часы)
# - TTF 2ч, создан в 18:30 → плановое YELLOW через 1.6ч, RED через 2ч
# - Договорной SLA перекрывает корпоративный
```

---

### SPRINT 05 — Склад и Хладагенты
**Цель:** Полный складской учёт + журнал хладагентов

**Задачи:**
```
□ 5.1 JPA Entity: StockItem, StockBalance, StockMovement
□ 5.2 JPA Entity: RefrigerantType, RefrigerantCylinder, RefrigerantLog
□ 5.3 StockService: операции (приход, перемещение, списание, возврат)
□ 5.4 StockService: резервирование при создании наряда
□ 5.5 RefrigerantService: учёт баллонов, журнал операций
□ 5.6 RefrigerantLeakCalculator: расчёт показателя утечки за период
□ 5.7 LeakAlertScheduler: ежедневная проверка показателей утечек
□ 5.8 REST API: GET /api/v1/stock/balance, POST /api/v1/stock/movements
□ 5.9 REST API: CRUD /api/v1/stock/refrigerant-cylinders
□ 5.10 REST API: GET /api/v1/stock/refrigerant-log/{equipmentId}
□ 5.11 Unit тесты: StockServiceTest, RefrigerantLeakCalculatorTest
□ 5.12 Integration тест: StockMovementIT
```

**Критерии завершения:**
```bash
# Тест расчёта утечки
# Полный заряд: 2.5 кг R-410A
# Заправлено за год: 0.8 кг
# Показатель утечки: 0.8/2.5*100 = 32% → превышает норму 30% → alert
mvn test -pl backend -Dtest="RefrigerantLeakCalculatorTest" | grep "BUILD SUCCESS"
```

---

### SPRINT 06 — Закупки и ЗИП
**Цель:** Полный цикл заказа запасных частей

**Задачи:**
```
□ 6.1 JPA Entity: PurchaseRequest, PurchaseRequestItem, PaymentRequest
□ 6.2 PurchaseRequestService: создание из наряда, агрегация статусов позиций
□ 6.3 MarkupCalculationService: расчёт наценки (% или руб., два варианта)
□ 6.4 PurchaseStatusAggregator: статус заявки из статусов позиций
□ 6.5 TrackingService: запрос статуса доставки (СДЭК, Деловые Линии)
□ 6.6 TrackingScheduler: проверка трекинга каждые 4 часа
□ 6.7 PaymentRequestService: создание заявки на оплату бухгалтеру
□ 6.8 REST API: CRUD /api/v1/purchases
□ 6.9 REST API: PUT /api/v1/purchases/{id}/items/{itemId}
□ 6.10 REST API: POST /api/v1/purchases/{id}/items/{itemId}/payment
□ 6.11 REST API: POST /api/v1/purchases/{id}/items/{itemId}/upload-invoice
□ 6.12 Unit тесты: MarkupCalculationServiceTest, PurchaseStatusAggregatorTest
□ 6.13 Integration тест: PurchaseRequestIT
```

**Критерии завершения:**
```bash
# Тест наценки: 1500 * (1 + 30/100) = 1950
# Тест наценки руб: 1500 + 450 = 1950, markup% = 450/1500*100 = 30%
# Тест агрегации: все RECEIVED → статус FULLY_RECEIVED
mvn test -pl backend -Dtest="MarkupCalculationServiceTest,PurchaseStatusAggregatorTest"
```

---

### SPRINT 07 — Финансы и Маржинальность
**Цель:** Автоматический расчёт себестоимости и документооборот

**Задачи:**
```
□ 7.1 CostCalculationService: полная формула себестоимости (все 6 статей)
□ 7.2 InvoiceService: формирование счёта (услуги + материалы + ЗИП)
□ 7.3 ActService: формирование акта выполненных работ
□ 7.4 DocumentTemplateEngine: PDF генерация (Apache PDFBox или iText)
□ 7.5 MarginUpdateListener: пересчёт маржи при каждом событии
□ 7.6 JPA Entity: Invoice, InvoiceLine, Act
□ 7.7 REST API: GET/POST /api/v1/finance/invoices
□ 7.8 REST API: GET /api/v1/work-orders/{id}/margin
□ 7.9 REST API: GET /api/v1/analytics/margin (по клиентам/инженерам/брендам)
□ 7.10 Unit тесты: CostCalculationServiceTest (все статьи + граничные случаи)
□ 7.11 Unit тесты: InvoiceServiceTest
□ 7.12 Integration тест: MarginCalculationIT (полный цикл наряда)
```

**Критерии завершения:**
```bash
# Полный тест маржи: создать наряд → списать материалы → ЗИП → закрыть
# revenue=5000, materials=800, zip=600, labor=1200, fuel=150, overhead=500(10%)
# margin = 5000 - (800+600+1200+150+500) = 1750, margin% = 35%
mvn test -pl backend -Dtest="CostCalculationServiceTest" | grep "1750"
```

---

### SPRINT 08 — HR и Зарплата
**Цель:** Полный зарплатный модуль с мотивацией по ролям

**Задачи:**
```
□ 8.1 JPA Entity: EngineerDayLog, EngineerSchedule, PayrollPeriod
□ 8.2 JPA Entity: PieceRate, BonusRule, PayrollItem, Payslip
□ 8.3 GPSTrackAnalyzer: расчёт пробега из GPS трека
□ 8.4 PayrollCalculationService: сдельная + ГСМ + надбавки для инженеров
□ 8.5 SalesCommissionService: % от продаж для менеджеров (прогрессивная шкала)
□ 8.6 DispatcherBonusService: % за обработанные заявки
□ 8.7 ManagerKPIService: % за выполнение плана продаж
□ 8.8 PayslipService: расчётный листок с детализацией
□ 8.9 PayslipVisibilityService: управление видимостью через настройки
□ 8.10 REST API: GET /api/v1/hr/payslip/{engineerId}/{period}
□ 8.11 REST API: GET /api/v1/hr/payroll-period/{id}
□ 8.12 REST API: GET /api/v1/hr/competency-matrix
□ 8.13 Unit тесты: PayrollCalculationServiceTest, GPSTrackAnalyzerTest
□ 8.14 Integration тест: PayrollPeriodIT
```

**Критерии завершения:**
```bash
# Тест ГСМ: трек из 5 точек, суммарное расстояние = 23.4 км
# Компенсация: 23.4 * 0.12 л/км * 55 руб = 154.44 руб
mvn test -pl backend -Dtest="GPSTrackAnalyzerTest,PayrollCalculationServiceTest"
```

---

### SPRINT 09 — Android MVP
**Цель:** Рабочее мобильное приложение (offline-first)

**Задачи:**
```
□ 9.1 Проект Android: build.gradle.kts со всеми зависимостями
□ 9.2 Room DB: WorkOrderEntity, StockItemEntity, StockBalanceEntity, PendingActionEntity
□ 9.3 Repository слой: WorkOrderRepository (Room + Remote)
□ 9.4 SyncWorker: WorkManager — синхронизация при появлении сети
□ 9.5 Retrofit API клиент: WorkOrderApi, StockApi, AuthApi
□ 9.6 Keycloak авторизация: PKCE OAuth2 flow
□ 9.7 Screen: DayStartScreen (выбор старта + запрос GPS)
□ 9.8 Screen: OrderListScreen (список нарядов + карта маршрута)
□ 9.9 Screen: OrderDetailScreen (детали + смена статусов + кнопки)
□ 9.10 Screen: MaterialsScreen (список + добавление + сканирование)
□ 9.11 Screen: PhotoScreen (обязательные фото до/после)
□ 9.12 Screen: ZIPRequestScreen (форма заявки на ЗИП)
□ 9.13 Screen: PayslipScreen (расчётный листок)
□ 9.14 GPS трекинг: ForegroundService с LocationManager
□ 9.15 Barcode сканирование: ML Kit BarcodeScanning
□ 9.16 Unit тесты: SyncWorkerTest, GPSTrackerTest
□ 9.17 UI тесты: OrderListScreenTest (Compose testing)
```

**Критерии завершения:**
```bash
# Сборка без ошибок
./gradlew assembleDebug -p mobile | grep "BUILD SUCCESSFUL"

# Тесты
./gradlew test -p mobile | grep "BUILD SUCCESSFUL"

# Проверка offline: отключить сеть → создать действие → включить сеть → синхронизация
```

---

### SPRINT 10 — CRM и Воронка Продаж
**Цель:** Полный CRM с воронкой, КП и автоматизацией

**Задачи:**
```
□ 10.1 JPA Entity: Lead, Deal, CommercialProposal, CPLine, Task
□ 10.2 JPA Entity: ClientHealthScore (расчётная метрика)
□ 10.3 LeadService: создание лидов из всех источников
□ 10.4 DealService: воронка продаж, стадии, плановые сроки
□ 10.5 CPService: формирование КП (Good-Better-Best варианты)
□ 10.6 CPPdfGenerator: PDF в фирменном стиле (шаблон загружается из MinIO)
□ 10.7 ClientHealthCalculator: расчёт показателя «здоровья клиента»
□ 10.8 CRMAutomationEngine: триггеры (follow-up, win-back, ТО предложения)
□ 10.9 PipelineForecastService: прогноз выполнения плана по воронке
□ 10.10 REST API: CRUD /api/v1/crm/leads, /deals, /proposals
□ 10.11 REST API: POST /api/v1/crm/proposals/{id}/send
□ 10.12 CRM Automation Scheduler: ежедневный запуск триггеров
□ 10.13 Unit тесты: ClientHealthCalculatorTest, CPServiceTest
□ 10.14 Integration тест: DealPipelineIT
```

---

### SPRINT 11 — EAM и Хладагенты (расширенный)
**Цель:** Управление оборудованием + полный учёт хладагентов

**Задачи:**
```
□ 11.1 JPA Entity: ServiceLocation, Equipment, EquipmentType, EquipmentPhoto
□ 11.2 JPA Entity: MaintenancePlan, MaintenancePlanItem
□ 11.3 QRCodeService: генерация QR для оборудования (ZXing)
□ 11.4 AssetHistoryService: хронология всех событий по оборудованию
□ 11.5 FailurePredictionService: LightGBM модель предиктивного ТО
□ 11.6 RefrigerantComplianceReporter: отчёт для Росприроднадзора
□ 11.7 PPRGenerationScheduler: автогенерация нарядов по плану ТО
□ 11.8 REST API: CRUD /api/v1/equipment
□ 11.9 REST API: GET /api/v1/equipment/{id}/history
□ 11.10 REST API: GET /api/v1/equipment/{id}/qr
□ 11.11 REST API: GET /api/v1/refrigerant/compliance-report
□ 11.12 Unit тесты: QRCodeServiceTest, RefrigerantLeakCalculatorTest
```

---

### SPRINT 12 — Умное Планирование
**Цель:** Алгоритм скоринга + Dispatch Board

**Задачи:**
```
□ 12.1 OSRMClient: запросы к OSRM API для расчёта времени в пути
□ 12.2 PlanningScoreCalculator: скоринг (SLA 40% + гео 30% + загрузка 20% + серт 10%)
□ 12.3 PlanningService: поиск топ-3 вариантов для наряда
□ 12.4 PlanningService: учёт REQUIRES_TWO инженеров (поиск пар)
□ 12.5 ContinuousReOptimizer: фоновый пересмотр расписания каждые 15 мин
□ 12.6 RevenueScoringService: приоритет коммерчески сильных инженеров
□ 12.7 CapacityPlanningService: лимиты по типам работ
□ 12.8 WeatherService: агрегация из 3 источников (Яндекс + OWM + Gismeteo)
□ 12.9 WeatherRiskAnalyzer: ИИ-рекомендации по типу работ + погоде
□ 12.10 WeatherRescheduleAdvisor: предложение переноса при критической погоде
□ 12.11 REST API: POST /api/v1/planning/suggest
□ 12.12 REST API: POST /api/v1/planning/assign
□ 12.13 WebSocket: /ws/schedule (обновления диаграммы Ганта)
□ 12.14 WebSocket: /ws/tracking (GPS позиции инженеров)
□ 12.15 Unit тесты: PlanningScoreCalculatorTest, WeatherRiskAnalyzerTest
□ 12.16 Integration тест: PlanningServiceIT (мок OSRM)
```

**Критерии завершения:**
```bash
# Тест скоринга:
# Вариант A: SLA_ok=1.0, travel=5km/max10km, load=3/max5, cert=1.0
# score = (1.0*40) + ((1-0.5)*30) + ((1-0.6)*20) + (1.0*10) = 40+15+8+10 = 73
mvn test -pl backend -Dtest="PlanningScoreCalculatorTest"
```

---

### SPRINT 13 — Интеграции
**Цель:** 1С, мессенджеры, Avito, IP-телефония

**Задачи:**
```
□ 13.1 OneCIntegrationService: REST клиент для 1С:УНФ Odata API
□ 13.2 OneCSync Scheduler: синхронизация справочников раз в час
□ 13.3 OneCDocumentSender: передача документов в 1С при закрытии наряда
□ 13.4 IntegrationLog: логирование всех запросов/ответов + retry
□ 13.5 TelegramBotService: входящие сообщения → Inbox
□ 13.6 WhatsAppService: WhatsApp Business API клиент
□ 13.7 AvitoService: Avito Messenger API (мультиаккаунт)
□ 13.8 EmailPollingService: IMAP polling каждые 2 мин → Inbox
□ 13.9 InboxService: единая очередь входящих из всех каналов
□ 13.10 CallBookingService: IP-телефония webhook → карточка клиента
□ 13.11 DeliveryTrackingService: СДЭК + Деловые Линии + Почта России
□ 13.12 EDOService: Диадок/СБИС отправка документов
□ 13.13 Unit тесты: OneCMapperTest, InboxServiceTest
□ 13.14 Integration тест: OneCIntegrationIT (WireMock)
```

---

### SPRINT 14 — ИИ-Агенты
**Цель:** Технический консультант + Бизнес-аналитик + Чат-бот

**Задачи:**
```
□ 14.1 Ollama настройка: pull mistral:7b, создание системного промпта
□ 14.2 RAGService: Elasticsearch индексация мануалов + семантический поиск
□ 14.3 DocumentIndexer: загрузка и векторизация PDF мануалов
□ 14.4 TechConsultantAgent: LangChain4j + RAG + история кейсов
□ 14.5 ErrorCodeService: база кодов ошибок + поиск
□ 14.6 OCRService: ML Kit / Tesseract для распознавания кодов ошибок
□ 14.7 PreWorkBriefGenerator: автоматический брифинг при назначении
□ 14.8 BusinessAnalystAgent: SQL-tool + chart-tool + PDF-report-tool
□ 14.9 AnalystScheduler: утренний дайджест, алерты, недельные отчёты
□ 14.10 EmployeeEfficiencyAnalyst: расчёт балла из 10 с диаграммами
□ 14.11 ChatbotService: ИИ-бот на сайте (WebSocket + прайс-лист + расписание)
□ 14.12 ChatbotLearningService: анализ необработанных запросов + обновление базы
□ 14.13 ModelFineTuningScheduler: ежеквартальный цикл дообучения
□ 14.14 REST API: POST /api/v1/ai/consultant/chat
□ 14.15 REST API: POST /api/v1/ai/analyst/chat
□ 14.16 REST API: POST /api/v1/ai/error-lookup
□ 14.17 WebSocket: /ws/chatbot (чат на сайте)
□ 14.18 Unit тесты: RAGServiceTest, PreWorkBriefGeneratorTest
```

---

### SPRINT 15 — Фронтенд (React)
**Цель:** Полный веб-интерфейс системы

**Задачи:**
```
□ 15.1 Vite проект: React 18 + TypeScript + Ant Design 5 + Zustand + React Query
□ 15.2 Роутинг: React Router 6, protected routes, role-based access
□ 15.3 Collapsible Sidebar: аккордеон, два режима, алерты-строки, роли
□ 15.4 Dashboard: дашборды по ролям (руководитель/диспетчер/менеджер)
□ 15.5 Inbox: омниканальный центр входящих (все каналы + чат)
□ 15.6 Work Orders: список + карточка + Kanban + Ганта
□ 15.7 Dispatch Board: drag-and-drop Ганта (react-dnd + react-big-calendar)
□ 15.8 Work Order Detail: все вкладки (SLA, погода, ИИ-прогноз, документы)
□ 15.9 CRM: лиды, воронка (kanban), КП с Good-Better-Best
□ 15.10 Clients: 360° карточка клиента
□ 15.11 Stock: остатки, движение, хладагенты
□ 15.12 Finance: счета, маржинальность, дашборд
□ 15.13 HR: матрица компетенций, зарплата, балл эффективности (диаграммы)
□ 15.14 Analytics: дашборды + конструктор отчётов
□ 15.15 Settings: все разделы настроек
□ 15.16 Unit тесты: component tests (React Testing Library)
□ 15.17 E2E тест: Playwright — создание наряда + назначение + закрытие
```

---

### SPRINT 16 — Тестирование и Финализация
**Цель:** Все тесты зелёные, готово к развёртыванию

**Задачи:**
```
□ 16.1 Нагрузочное тестирование: Gatling — 50 concurrent users
□ 16.2 Security тестирование: OWASP ZAP сканирование
□ 16.3 Integration тесты: полный happy-path (создание → назначение → ЗИП → закрытие)
□ 16.4 Docker образы: backend + frontend + mobile (AAB)
□ 16.5 docker-compose.prod.yml: production конфигурация
□ 16.6 PROGRESS.md: финальный отчёт о разработке
□ 16.7 API документация: SpringDoc OpenAPI → swagger-ui.html
□ 16.8 README.md: полная инструкция по развёртыванию
```

**Критерии завершения:**
```bash
# Все тесты зелёные
mvn test -pl backend | grep "Tests run:"  # 0 failures, 0 errors
./gradlew test -p mobile | grep "BUILD SUCCESSFUL"
cd frontend && npm test | grep "PASS"

# Нагрузочное тестирование
# P95 response time < 300ms при 50 concurrent users

# Сборка docker образов
docker build -t servisklimat-backend:1.0 ./backend
docker build -t servisklimat-frontend:1.0 ./frontend
```

---

## 🤖 ИСПОЛЬЗОВАНИЕ SUBAGENTS

Для параллельной разработки используй subagents:

```
# Запустить параллельную разработку спринтов 7 и 9
# (финансы и Android независимы друг от друга)

"Запусти два subagent-а параллельно:
 Agent 1: выполни Sprint 07 (Финансы) из CLAUDE.md
 Agent 2: выполни Sprint 09 (Android MVP) из CLAUDE.md
 После завершения обоих — обнови PROGRESS.md"
```

---

## 🪝 HOOKS (автоматические действия)

Файл `.claude/hooks.json` подключает:
- После каждого `.java` файла → `mvn spotless:check`
- После каждого коммита → `mvn test -pl backend`
- После каждого `.kt` файла → `./gradlew ktlintCheck`
- После каждого `.tsx` файла → `npm run lint`

---

## 🧪 КОМАНДЫ ДЛЯ ТЕСТИРОВАНИЯ

```bash
# Backend — все тесты
mvn test -pl backend

# Backend — конкретный класс
mvn test -pl backend -Dtest="WorkOrderServiceTest"

# Backend — coverage report
mvn test jacoco:report -pl backend
# Открыть: backend/target/site/jacoco/index.html

# Android
./gradlew test -p mobile
./gradlew connectedAndroidTest -p mobile  # на устройстве

# Frontend
cd frontend && npm test
cd frontend && npm run test:e2e  # Playwright

# Все вместе
mvn test -pl backend && ./gradlew test -p mobile && cd frontend && npm test
```

---

## 📁 СТРУКТУРА ФАЙЛОВ

```
servis-klimat/
├── CLAUDE.md                 ← этот файл
├── PROGRESS.md               ← автоматически обновляется
├── docker-compose.dev.yml    ← локальные зависимости
├── docker-compose.prod.yml   ← production
├── .claude/
│   ├── agents/               ← subagent определения
│   │   ├── backend-agent.md
│   │   ├── frontend-agent.md
│   │   └── mobile-agent.md
│   ├── skills/               ← reusable workflows
│   │   ├── create-entity/
│   │   ├── create-rest-api/
│   │   └── run-tests/
│   └── hooks.json            ← автоматические действия
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/java/ru/servisklimat/
│       └── test/java/ru/servisklimat/
├── mobile/                   ← Android (Kotlin)
├── frontend/                 ← React + TypeScript
└── docs/
    ├── full-spec.md          ← схема БД
    ├── planning-algorithm.md ← алгоритм планирования
    └── openapi.yaml          ← API спецификация
```

---

## ⚡ БЫСТРЫЕ КОМАНДЫ

```bash
# Старт всего окружения
docker-compose -f docker-compose.dev.yml up -d

# Проверить статус
docker-compose -f docker-compose.dev.yml ps

# Запустить backend
cd backend && mvn spring-boot:run

# Запустить frontend
cd frontend && npm run dev

# Текущий спринт
cat PROGRESS.md | grep "\[ \]" | head -1

# Проверить покрытие тестами
mvn test jacoco:report -pl backend && echo "Coverage: $(grep -m1 'Total' backend/target/site/jacoco/index.html | grep -o '[0-9]*%' | head-1)"
```

---

## 🚀 ПЕРВАЯ КОМАНДА ДЛЯ СТАРТА

После прочтения этого файла начни с:

```
"Прочитай CLAUDE.md полностью. Запусти docker-compose.dev.yml.
 Выполни Sprint 01 полностью: создай Spring Boot проект,
 примени Flyway миграцию V001 из docs/full-spec.md,
 убедись что приложение стартует и все тесты Sprint 01 зелёные.
 Обнови PROGRESS.md. Не останавливайся на ошибках — исправляй сам."
```
