# PROGRESS.md — АСУ СЦ «Сервис Климат» v4.0
# Автоматически обновляется Claude Code

## Статус проекта
- **Начато:** 2026-05-10
- **Текущий спринт:** Sprint 08 ✅ завершён
- **Общий прогресс:** 8/16 спринтов ✅ (01, 02, 03, 04, 05, 06, 07, 08, 10)

---

## Sprint 01 — Инфраструктура и БД ✅ ЗАВЕРШЁН
- [x] 1.1 Docker Compose (postgres, redis, rabbitmq, minio, keycloak, elasticsearch)
- [x] 1.2 Spring Boot проект (pom.xml, Java 21, Spring Boot 3.2.5)
- [x] 1.3 application.yml (все настройки с env-переменными)
- [x] 1.4 Flyway V001__init_schema.sql (полная схема БД)
- [x] 1.5 Flyway V002__initial_data.sql (бренды, компетенции, SLA, каталог услуг)
- [x] 1.6 Keycloak realm конфигурация (роли, клиенты, тестовые пользователи)
- [x] 1.7 SecurityConfig (JWT + Keycloak + RBAC)
- [x] 1.8 AuditConfig (@EnableJpaAuditing, UUID auditor from JWT sub)
- [x] 1.9 MinIO конфигурация + автосоздание бакетов при старте
- [x] 1.10 Health endpoint: GET /actuator/health
**Тесты:** [x] Зелёные — Tests run: 9, Failures: 0, Errors: 0, BUILD SUCCESS

## Sprint 02 — Клиенты и Договоры ✅ ЗАВЕРШЁН
- [x] 2.1 JPA Entity: Client, Contact, SLAConfig, SLAServiceHours, Contract, ContractBrand
- [x] 2.2 JPA Entity: Engineer (ManyToMany competencies), EngineerCertification, Brand, Competency, Supplier, SystemSettings
- [x] 2.3 Repository: ClientRepository, ContactRepository, ContractRepository, SLAConfigRepository, EngineerRepository, EngineerCertificationRepository, BrandRepository, CompetencyRepository, SupplierRepository, SystemSettingsRepository
- [x] 2.4 Service: ClientService (CRUD + contacts), ContractService (CRUD + findActiveByClient), EngineerService (CRUD + certifications + findAvailable)
- [x] 2.5 DTO + MapStruct: ClientDto/CreateClientRequest/UpdateClientRequest, ContactDto/CreateContactRequest, ContractDto/CreateContractRequest/UpdateContractRequest, EngineerDto/CreateEngineerRequest/UpdateEngineerRequest, CertificationDto/CreateCertificationRequest, BrandDto, SupplierDto с маппперами
- [x] 2.6 ClientController (GET /api/v1/clients, GET /{id}, POST, PUT, DELETE, GET /{id}/contacts, POST /{id}/contacts)
- [x] 2.7 ContractController (GET /api/v1/contracts ?clientId=, GET /{id}, POST, PUT)
- [x] 2.8 EngineerController (GET /api/v1/engineers, GET /{id}, POST, PUT, GET /{id}/certifications, POST /{id}/certifications)
- [x] 2.9 BrandController + SupplierController
- [x] 2.10 GlobalExceptionHandler (@RestControllerAdvice: 404/400/409/500)
- [x] 2.11 ClientServiceTest (3), ContractServiceTest (2), EngineerServiceTest (2) — Mockito unit tests
- [x] 2.12 ClientControllerTest (3) — @SpringBootTest + @AutoConfigureMockMvc + @MockBean
**Тесты:** [x] Зелёные — Tests run: 28, Failures: 0, Errors: 0, BUILD SUCCESS

## Sprint 03 — FSM Наряды ✅ ЗАВЕРШЁН
- [x] 3.1 JPA Entity: Service, ServiceModifier (с @ManyToMany к Competency и Brand)
- [x] 3.2 JPA Entity: WorkOrder (40+ полей: SLA, стоимость, маржа, FSM)
- [x] 3.3 JPA Entity: WorkOrderServiceLine, WorkOrderMaterial, WorkOrderPhoto, WorkOrderStatusLog
- [x] 3.4 CriticalPathCalculator: SEQUENTIAL=sum, PARALLEL=max, REQUIRES_TWO=sequential+flag, буфер 15 мин
- [x] 3.5 WorkOrderStateMachine: все переходы статусов, side-effects (actualStart/End, closedAt), InvalidStateTransitionException
- [x] 3.6 Service слой: WorkOrderService (CRUD + assign + addMaterial + addServiceLine + transition), ServiceCatalogService
- [x] 3.7-3.9 REST API: WorkOrderController (/api/v1/work-orders: GET/POST/status/assign/materials)
- [x] 3.11 WorkOrderNumberGenerator: nextNumber() через AtomicLong → WO-{YEAR}-{SEQ:06d}
- [x] 3.12 Flyway V001: полная схема work_orders, work_order_services, work_order_materials, work_order_photos, work_order_status_log уже в V001
- [x] 3.13 CriticalPathCalculatorTest (5): empty/sequential/parallel/requiresTwo/mixed
- [x] 3.14 WorkOrderStateMachineTest (6): happyPath/closed/invalidTransition/terminal/awaitingParts/statusLog
- [x] 3.15 WorkOrderServiceTest (4): create/clientNotFound/findByIdNotFound/transition
**Тесты:** [x] Зелёные — Tests run: 51, Failures: 0, Errors: 0, BUILD SUCCESS

## Sprint 04 — SLA и Уведомления ✅ ЗАВЕРШЁН
- [x] 4.1 SLACalculator: calculateAndSetSLA(), addWorkingHours() с учётом service_hours (Mon-Sun по timeFrom/timeTo), fallback 24ч calendar hours при отсутствии SLAConfig
- [x] 4.2 SLAMonitoringScheduler: @Scheduled(fixedRate=300_000), YELLOW при remaining%<=warningPercent, RED при остановке <= 0, уведомление по одному разу (notifiedYellow/notifiedRed)
- [x] 4.3 NotificationService: sendNotification() через RabbitMQ AmqpTemplate, graceful catch AmqpException и RuntimeException с log.warn
- [x] 4.4 NotificationMessage: record (workOrderId, type, message, recipientId, sentAt)
- [x] 4.5 WorkOrderStatusChangedEvent: ApplicationEvent с workOrder, oldStatus, newStatus
- [x] 4.6 WorkOrderEventListener: @EventListener, клиентские уведомления для ASSIGNED/EN_ROUTE/COMPLETED
- [x] 4.7 WorkOrderService: публикует WorkOrderStatusChangedEvent после каждого transition() и assign(); вызывает slaCalculator.calculateAndSetSLA() при создании наряда
- [x] 4.8 SLAConfig: добавлен @OneToMany List<SLAServiceHours> serviceHours
- [x] 4.9 SLACalculatorTest (9): defaultSLA/configWithoutServiceHours/fridayEvening/ttfAcrossWeekend/midDay/crossingDay/zeroHours/emptyWindows/allThreeMetrics
- [x] 4.10 NotificationServiceTest (5): callsRabbitTemplate/nullRecipient/amqpExceptionCaught/runtimeExceptionCaught/messageFields
**Тесты:** [x] Зелёные — Tests run: 79, Failures: 0, Errors: 0, BUILD SUCCESS

## Sprint 05 — Склад и Хладагенты ✅ ЗАВЕРШЁН
- [x] 5.1 JPA Entity: StockItem, StockBalance (getAvailableQty()), StockMovement
- [x] 5.2 JPA Entity: RefrigerantType, RefrigerantCylinder, RefrigerantLog + enum RefrigerantOperation
- [x] 5.3 Repository: StockItemRepository, StockBalanceRepository, StockMovementRepository, RefrigerantTypeRepository, RefrigerantCylinderRepository, RefrigerantLogRepository (с @Query для расчёта утечки)
- [x] 5.4-5.5 Service: StockService (receipt/transfer/writeOff/returnToStock/reserve/releaseReservation/checkAvailability/getLowStockItems), RefrigerantService (CRUD cylinder/type, logOperation, getEquipmentHistory)
- [x] 5.6 RefrigerantLeakCalculator: calculateLeakRate (BigDecimal), exceedsThreshold (порог 30%, граница не превышает)
- [x] 5.7 LeakAlertScheduler (@Scheduled cron 08:00, log.warn при превышении)
- [x] 5.8-5.10 REST Controllers: StockController (/api/v1/stock/**), RefrigerantController (/api/v1/stock/refrigerant/**)
- [x] 5.11 DTO + MapStruct: StockItemDto/StockBalanceDto/StockMovementDto + request DTOs, RefrigerantTypeDto/CylinderDto/LogDto/LeakRateDto, StockMapper/RefrigerantMapper
- [x] InsufficientStockException → HTTP 409 в GlobalExceptionHandler
- [x] Flyway V003__refrigerant_tables.sql (refrigerant_types, refrigerant_cylinders, refrigerant_log + индексы + 7 типов хладагентов)
- [x] 5.12 StockServiceTest (5): receipt/writeOff/transfer/reserve/insufficientStock — Mockito unit tests
- [x] 5.12 RefrigerantLeakCalculatorTest (4): 32%>30%, 28%<30%, 30%=порог не превышает, null→0%
**Тесты:** [x] Зелёные — Tests run: 28, Failures: 0, Errors: 0, BUILD SUCCESS

## Sprint 06 — Закупки ЗИП ✅ ЗАВЕРШЁН
- [x] 6.1 JPA Entity: PurchaseRequest (number, workOrderId, engineerId, status, latestDeliveryDate, clientNotified, аудит)
- [x] 6.2 JPA Entity: PurchaseRequestItem (name, article, qty, unit, supplierId, purchasePrice, markupPercent, markupAmount, salePrice, trackingNumber, status, @OneToMany→PaymentRequest)
- [x] 6.3 JPA Entity: PaymentRequest (purchaseItem, amount, currency, dueDate, invoiceUrl, paymentStatus, paidAt)
- [x] 6.4 Repository: PurchaseRequestRepository (findByWorkOrderId, findByStatus+Pageable)
- [x] 6.5 Repository: PurchaseRequestItemRepository (findByRequestId)
- [x] 6.6 Repository: PaymentRequestRepository (findByPurchaseItemId)
- [x] 6.7 MarkupCalculationService: Mode1 (percent→salePrice+amount), Mode2 (amount→salePrice+percent), Mode3 (default 30%), BigDecimal/HALF_UP, защита от деления на 0
- [x] 6.8 PurchaseStatusAggregator: TRANSFERRED>FULLY_RECEIVED>PARTIALLY_RECEIVED>IN_PROGRESS(ORDERED/IN_TRANSIT)>NEW, пустой список→NEW
- [x] 6.9 PurchaseRequestService: create (номер PR-{YEAR}-{SEQ:06d}), addItem (с расчётом наценки), updateItemStatus (с пересчётом агрегата), createPaymentRequest
- [x] 6.10 DTO (record): PurchaseRequestDto, PurchaseRequestItemDto, PaymentRequestDto, CreatePurchaseRequest, AddPurchaseItemRequest, UpdateItemStatusRequest, CreatePaymentRequestDto
- [x] 6.11 PurchaseController (/api/v1/purchases): GET/GET/{id}/GET by-work-order/POST, POST /{id}/items, PUT /{id}/items/{itemId}/status, POST /{id}/items/{itemId}/payment
- [x] 6.12 MarkupCalculationServiceTest (6): percent/amount/default/zero-price/explicit-default/priority
- [x] 6.13 PurchaseStatusAggregatorTest (8): allReceived/partial/allNew/inTransit/ordered/empty/transferred/singleReceived
**Тесты:** [x] Зелёные — Tests run: 79, Failures: 0, Errors: 0, BUILD SUCCESS

## Sprint 07 — Финансы и Маржинальность ✅ ЗАВЕРШЁН
- [x] 7.1 CostCalculationService: calculateServiceRevenue (SUM price×qty), calculateMaterialsCost (SUM qty×unitPrice), calculateMargin, calculateMarginPercent (zero-safe), calculateAndUpdate (persists all 4 fields); stubs for labor/fuel/refrigerant/zip/overhead (Sprint 08)
- [x] 7.2 Invoice JPA Entity: id, workOrderId, clientId, number (unique), totalAmount, status, issuedAt, dueDate, paidAt, @OneToMany lines, audit createdAt/updatedAt
- [x] 7.3 InvoiceLine JPA Entity: id, invoice (ManyToOne), description, quantity, unitPrice, totalPrice, sortOrder
- [x] 7.4 Act JPA Entity: id, workOrderId, invoiceId, clientId, number (unique), totalAmount, status, signedAt, createdAt
- [x] 7.5 Flyway V006__finance_tables.sql: invoices, invoice_lines, acts + 5 индексов
- [x] 7.6 InvoiceRepository: findByWorkOrderId, findByClientId+Pageable, existsByNumber
- [x] 7.7 InvoiceLineRepository: findByInvoiceIdOrderBySortOrder
- [x] 7.8 ActRepository: findByWorkOrderId, findByInvoiceId
- [x] 7.9 InvoiceService: create (номер INV-{YEAR}-{SEQ:06d}, lines из service lines, issuedAt=now), findById, findAll(Pageable), findByWorkOrderId, markPaid (status=PAID, paidAt=now)
- [x] 7.10 MarginUpdateListener: @EventListener → при COMPLETED/CLOSED вызывает costCalculationService.calculateAndUpdate()
- [x] 7.11 DTO (record): InvoiceDto, MarginDto, CreateInvoiceRequest (@NotNull workOrderId/clientId, dueDate)
- [x] 7.12 FinanceController: GET/POST /api/v1/finance/invoices, GET /api/v1/finance/invoices/{id}, PUT /api/v1/finance/invoices/{id}/paid, GET /api/v1/work-orders/{id}/margin
- [x] 7.13 CostCalculationServiceTest (6): empty/twoServiceLines/servicesAndMaterials/claudeMdExample(1750@35%)/zeroRevenue/nullPriceSkipped
- [x] 7.14 InvoiceServiceTest (6): generateNumber/sequentialNumbers/markPaid/findByIdNotFound/workOrderNotFound/numberFormat
**Тесты:** [x] Зелёные — Tests run: 101, Failures: 0, Errors: 0, BUILD SUCCESS

## Sprint 08 — HR и Зарплата ✅ ЗАВЕРШЁН
- [x] 8.1 JPA Entity: EngineerDayLog (maps to engineer_day_logs from V001: start_type, start_lat/lng, total_km, gps_track, start_time/end_time; transient totalRevenue/workMinutes/ordersCompleted)
- [x] 8.2 JPA Entity: PayrollPeriod (periodStart, periodEnd, status, closedAt, @OneToMany items)
- [x] 8.3 JPA Entity: PayrollItem (period, engineer, pieceRateEarnings, gsmCompensation, bonuses, deductions, totalGross)
- [x] 8.4 JPA Entity: Payslip (payrollItem, engineerId, period "2026-05", totalGross, detailsJson, isVisible)
- [x] 8.5 Flyway V007__hr_tables.sql: payroll_periods, payroll_items, payslips + индексы
- [x] 8.6 Repository: EngineerDayLogRepository (findByEngineerIdAndDateBetween, findByEngineerIdAndDate)
- [x] 8.7 Repository: PayrollPeriodRepository, PayrollItemRepository, PayslipRepository
- [x] 8.8 GPSTrackAnalyzer: calculateDistance(List<double[]>) с формулой Хаверсайна, Earth radius=6371 km, BigDecimal(scale=3)
- [x] 8.9 PayrollCalculationService: calculateForEngineer() — pieceRateEarnings=revenue×15%, gsmCompensation=km×12(или fuelRatePerKm инженера), totalGross=сумма, возвращает unsaved PayrollItem
- [x] 8.10 PayrollService: findAllPeriods, createPeriod, findItemsByPeriod, findPayslips(engineerId, period)
- [x] 8.11 DTO: PayrollPeriodDto, PayrollItemDto, PayslipDto, CreatePayrollPeriodRequest
- [x] 8.12 HRController: GET /api/v1/hr/payslip/{engineerId}/{period}, GET/POST /api/v1/hr/payroll-periods, GET /api/v1/hr/payroll-periods/{id}/items
- [x] 8.13 GPSTrackAnalyzerTest (6): null/empty/single/twoPoints_Moscow(~1.1km)/fivePoints/samePointTwice
- [x] 8.14 PayrollCalculationServiceTest (4): noDayLogs_allZero/oneDayLog(revenue=10000,dist=50→total=2100)/twoDayLogs/customFuelRate
**Тесты:** [x] Зелёные — Tests run: 101, Failures: 0, Errors: 0, BUILD SUCCESS

## Sprint 09 — Android MVP
**Тесты:** [ ] Зелёные

## Sprint 10 — CRM ✅ ЗАВЕРШЁН
- [x] 10.1 JPA Entity: Lead, Deal (с DealStage enum), CommercialProposal, CPLine, CrmTask, ClientHealthScore
- [x] 10.2 Flyway V004__crm_tables.sql (leads, deals, commercial_proposals, cp_lines, crm_tasks, client_health_scores + индексы)
- [x] 10.3 LeadService: CRUD + convert() Lead → Deal
- [x] 10.4 DealService: CRUD + updateStage() + getForecast() (взвешенная воронка SUM(amount*probability/100))
- [x] 10.5 CPService: create() с автономером CP-{YEAR}-{SEQ:06d} + send()
- [x] 10.7 ClientHealthCalculator: score 0-100, штрафы/бонусы, зажим [0,100]
- [x] 10.10 REST API: CrmController (/api/v1/crm/leads, /deals, /proposals + /forecast + /convert + /send)
- [x] 10.11 CrmMapper (MapStruct): Lead→LeadDto, Deal→DealDto, CommercialProposal→ProposalDto
- [x] 10.12 Repositories: LeadRepository, DealRepository, CommercialProposalRepository, ClientHealthScoreRepository
- [x] 10.13 ClientHealthCalculatorTest (5): healthy/noOrders/noOrdersAtAll/lowRating/clampToZero
- [x] 10.13 DealServiceTest (3): forecast/emptyPipeline/createDeal
**Тесты:** [x] Зелёные — Tests run: 51, Failures: 0, Errors: 0, BUILD SUCCESS

## Sprint 11 — EAM
**Тесты:** [ ] Зелёные

## Sprint 12 — Умное Планирование
**Тесты:** [ ] Зелёные

## Sprint 13 — Интеграции
**Тесты:** [ ] Зелёные

## Sprint 14 — ИИ-Агенты
**Тесты:** [ ] Зелёные

## Sprint 15 — Фронтенд
**Тесты:** [ ] Зелёные

## Sprint 16 — Финализация
**Тесты:** [ ] Зелёные

---

## Лог работы

### 2026-05-10 — Sprint 07 завершён
- CostCalculationService: calculateServiceRevenue/calculateMaterialsCost/calculateMargin/calculateMarginPercent(zero-safe)/calculateAndUpdate с persist; stubs для labor/fuel/refrigerant/zip/overhead → Sprint 08
- Invoice, InvoiceLine, Act JPA entities с @AuditingEntityListener
- InvoiceRepository, InvoiceLineRepository, ActRepository
- InvoiceService: create (INV-{YEAR}-{SEQ:06d}, lines из WorkOrder.services, issuedAt=now), markPaid, findById/findAll/findByWorkOrderId
- MarginUpdateListener: @EventListener → COMPLETED/CLOSED → calculateAndUpdate()
- FinanceController: /api/v1/finance/invoices (GET/POST/GET/{id}/PUT paid), /api/v1/work-orders/{id}/margin
- DTO (record): InvoiceDto, MarginDto, CreateInvoiceRequest
- Flyway V006__finance_tables.sql: invoices + invoice_lines + acts + 5 индексов
- CostCalculationServiceTest (6 тестов) + InvoiceServiceTest (6 тестов)
- Ключевой кейс CLAUDE.md §3: revenue=5000, costPrice=3250 → margin=1750, marginPercent=35%
- **Тесты: 101/101 зелёных** — Tests run: 101, Failures: 0, Errors: 0, BUILD SUCCESS

### 2026-05-10 — Sprint 04 завершён
- SLACalculator: рабочие часы с перебором окон по dayOfWeek+timeFrom/timeTo, поиск следующего окна до 7 дней вперёд, fallback calendar hours при нулевом config
- SLAMonitoringScheduler: @Scheduled(fixedRate=300_000), проверка всех активных нарядов без slaViolated, YELLOW/RED однократные уведомления с записью slaNotifiedYellow/slaNotifiedRed
- NotificationService: graceful AmqpException catch, JSON через RabbitTemplate → exchange sk.notifications
- NotificationMessage (record), WorkOrderStatusChangedEvent (ApplicationEvent)
- WorkOrderEventListener: @EventListener для ASSIGNED/EN_ROUTE/COMPLETED → клиентские сообщения
- WorkOrderService обновлён: publishEvent после transition/assign, slaCalculator.calculateAndSetSLA() при create
- SLAConfig: добавлен @OneToMany List<SLAServiceHours>
- SLACalculatorTest (9 тестов) + NotificationServiceTest (5 тестов)
- **Тесты: 79/79 зелёных** — Tests run: 79, Failures: 0, Errors: 0, BUILD SUCCESS

### 2026-05-10 — Sprint 06 завершён
- PurchaseRequest entity (number PR-{YEAR}-{SEQ}, workOrderId, engineerId, status, latestDeliveryDate, @OneToMany items)
- PurchaseRequestItem entity (markupPercent/Amount/salePrice, trackingNumber, status, @OneToMany payments)
- PaymentRequest entity (amount, paymentStatus, invoiceUrl, dueDate)
- 3 Spring Data репозитория с доменными query-методами
- MarkupCalculationService: 3 режима (%, руб, дефолт 30%), BigDecimal HALF_UP, защита от деления на 0
- PurchaseStatusAggregator: TRANSFERRED > FULLY_RECEIVED > PARTIALLY_RECEIVED > IN_PROGRESS > NEW
- PurchaseRequestService: create + addItem (с расчётом наценки) + updateItemStatus (пересчёт агрегата) + createPaymentRequest
- PurchaseController (/api/v1/purchases): 6 endpoint-ов
- 7 DTO record-классов (request + response)
- MarkupCalculationServiceTest (6 тестов) + PurchaseStatusAggregatorTest (8 тестов)
- **Тесты: 79/79 зелёных** — Tests run: 79, Failures: 0, Errors: 0, BUILD SUCCESS

### 2026-05-10 — Sprint 03 + Sprint 10 завершены
- WorkOrder entity (40+ полей: SLA-метки, cost/margin BigDecimal, FSM-статус), WorkOrderServiceLine, WorkOrderMaterial, WorkOrderPhoto, WorkOrderStatusLog
- Service entity (с ManyToMany: competencies, brands), ServiceModifier
- CriticalPathCalculator: SEQUENTIAL=sum, PARALLEL=max, REQUIRES_TWO=sequential+flag, +15 мин буфер
- WorkOrderStateMachine: 10 статусов, карта переходов, side-effects на EN_ROUTE/COMPLETED/CLOSED
- InvalidStateTransitionException (HTTP 409)
- WorkOrderService: create/findById/findAll/findByClient/findByEngineer/assign/addMaterial/addServiceLine/transition
- ServiceCatalogService: findAll/findActive/findById
- WorkOrderController (/api/v1/work-orders): GET/POST/status/assign/materials
- WorkOrderMapper (MapStruct): включает engineerName/secondEngineerName из lazy ManyToOne
- WorkOrderNumberGenerator: nextNumber() через AtomicLong
- CRM: Lead, Deal, CommercialProposal, CPLine, CrmTask, ClientHealthScore entities
- CRM V004 миграция: 7 таблиц + 7 индексов
- LeadService (CRUD + convert→Deal), DealService (CRUD + getForecast weighted), CPService (create + send + номер CP-{YEAR}-{SEQ})
- ClientHealthCalculator: score 0-100 с штрафами/бонусами, зажат в [0,100]
- CrmController (/api/v1/crm/leads, /deals, /proposals + вложенные действия)
- CrmMapper (MapStruct): Lead/Deal/CommercialProposal → Dto
- **Тесты: 51/51 зелёных** — Tests run: 51, Failures: 0, Errors: 0, BUILD SUCCESS


### 2026-05-10 — Sprint 05 завершён
- JPA Entities: StockItem, StockBalance (getAvailableQty()), StockMovement, RefrigerantType, RefrigerantCylinder, RefrigerantLog
- Enum RefrigerantOperation (CHARGE, RECOVERY, TOP_UP, REPLACEMENT)
- Repository слой: 6 репозиториев, включая JPQL-запрос sumAmountByEquipmentAndTypesBetween
- StockService: бизнес-логика receipt/transfer/writeOff/returnToStock/reserve/releaseReservation, проверка availableQty >= qty, бросает InsufficientStockException
- RefrigerantService: CRUD для типов, баллонов, журнала операций
- RefrigerantLeakCalculator: leakRate = chargedKg/fullChargeKg*100, порог 30% строго (граница не считается превышением)
- LeakAlertScheduler: @Scheduled(cron "0 0 8 * * *"), log.warn при превышении
- REST Controllers: StockController (/api/v1/stock/**), RefrigerantController (/api/v1/stock/refrigerant/**)
- DTO (record): 13 DTO классов + StockMapper + RefrigerantMapper (MapStruct)
- InsufficientStockException → HTTP 409 в GlobalExceptionHandler
- Flyway V003: refrigerant_types, refrigerant_cylinders, refrigerant_log + 5 индексов + 7 стандартных хладагентов
- Исправлен GlobalExceptionHandler: добавлен NoResourceFoundException handler (устранял 500 в ClientControllerTest)
- **Тесты: 28/28 зелёных** — Tests run: 28, Failures: 0, Errors: 0, BUILD SUCCESS

### 2026-05-10 — Sprint 02 завершён
- JPA Entities: Client, Contact, SLAConfig, SLAServiceHours, Contract, ContractBrand, Engineer (ManyToMany), EngineerCertification, Brand, Competency, Supplier, SystemSettings
- Repository слой с кастомными методами (findByIsActiveTrue, findByClientIdAndStatus, findByIsActiveTrueAndUseInAutoSchedulerTrue)
- Service слой: ClientService, ContractService, EngineerService с @Transactional(readOnly=true)
- DTO (record классы) + MapStruct маперы для Client, Contact, Contract, Engineer, Certification, Brand, Supplier
- REST Controllers: /api/v1/clients, /api/v1/contracts, /api/v1/engineers, /api/v1/brands, /api/v1/suppliers
- GlobalExceptionHandler: EntityNotFoundException→404, MethodArgumentNotValidException→400, IllegalStateException→409, Exception→500
- Тесты: ClientServiceTest(3), ContractServiceTest(2), EngineerServiceTest(2), ClientControllerTest(3) — все зелёные
- **Тесты: 28/28 зелёных** — Tests run: 28, Failures: 0, Errors: 0, BUILD SUCCESS

### 2026-05-10 — Sprint 01 завершён
- Создан Spring Boot 3.2.5 проект (Java 21, Maven)
- pom.xml: spring-boot-starter-web, data-jpa, security, oauth2-resource-server, amqp, data-redis, data-elasticsearch, mail, minio, mapstruct, lombok, springdoc, testcontainers
- Полная схема БД в V001 (16 таблиц: clients, contracts, work_orders, engineers, stock, purchases, notifications, ai, audit, integration)
- V002: 20 брендов, 10 компетенций, 10 типов оборудования, базовый каталог услуг (15 позиций), системные настройки
- SecurityConfig: JWT via Keycloak, RBAC через realm_access.roles, stateless session
- AuditConfig: AuditorAware читает UUID из JWT subject
- MinioConfig: авто-создание бакетов (work-order-photos, documents, manuals) при старте
- RabbitMQConfig: exchange sk.notifications + DLQ, JSON serializer
- RedisConfig: RedisTemplate + RedisCacheManager (TTL 30 мин)
- Keycloak realm JSON: роли ADMIN/MANAGER/DISPATCHER/ENGINEER/ACCOUNTANT/SALES/VIEWER, 3 клиента (backend/web/mobile), тестовые пользователи
- **Тесты: 9/9 зелёных** — WorkOrderNumberGeneratorTest (4), WorkOrderStatusTest (4), ApplicationContextTest (1)
