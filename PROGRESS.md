# PROGRESS.md — АСУ СЦ «Сервис Климат» v4.0
# Автоматически обновляется Claude Code

## Статус проекта
- **Начато:** 2026-05-10
- **Текущий спринт:** Sprint 04 + Sprint 06
- **Общий прогресс:** 7/16 спринтов ✅

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

## Sprint 04 — SLA и Уведомления
**Тесты:** [ ] Зелёные

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

## Sprint 06 — Закупки ЗИП
**Тесты:** [ ] Зелёные

## Sprint 07 — Финансы
**Тесты:** [ ] Зелёные

## Sprint 08 — HR и Зарплата
**Тесты:** [ ] Зелёные

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
