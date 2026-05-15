import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useQuery } from '@tanstack/react-query';

interface SNRDHeaderProps {
  activeTab: string;
  onCreateNew: () => void;
  onOpenCommandPalette?: () => void;
}

const tabTitles: Record<string, string> = {
  dashboard: 'Главная панель',
  applications: 'Заявки',
  'application-drafts': 'Черновики заявок',
  'work-orders': 'Наряды',
  contracts: 'Подряды',
  'work-drafts': 'Черновики работ',
  'completion-acts': 'Акты выполненных работ',
  'assign-executors': 'Назначение исполнителей',
  'auto-planning': 'Автоматическое планирование',
  'survey-templates': 'Шаблоны анкет',
  'survey-journal': 'Журнал анкет',
  'scheduled-maintenance': 'Плановое обслуживание',
  reports: 'Отчеты и аналитика',
  employees: 'Выездные сотрудники',
  contractors: 'Подрядчики',
  clients: 'Клиенты',
  'service-objects': 'Объекты обслуживания',
  'service-types': 'Виды работ и услуг',
  'typed-tasks': 'Типовые задачи',
  sla: 'Соглашения об уровнях сервиса',
  territories: 'Территории обслуживания',
  licensing: 'Лицензирование',
  finance: 'Финансы и маржинальность',
  'office-users': 'Пользователи офиса',
  'work-groups': 'Рабочие группы',
  roles: 'Конструктор ролей',
  integrations: 'Интеграции с внешними системами',
  import: 'Импорт данных',
  crm: 'CRM — Воронка продаж',
  hr: 'HR и Зарплата',
  warehouse: 'Склад и хладагенты',
  'dispatch-board': 'Доска диспетчера',
  'price-list': 'Прайс-лист',
  'kpi-dashboard': 'KPI Дашборд',
  'sla-monitor': 'SLA Монитор',
  'client-portal-settings': 'Клиентский портал',
  'stock-alerts': 'Алерты склада',
  'audit-log': 'Журнал аудита',
  'role-dashboard': 'Дашборды по ролям',
  'analytics-dashboard': 'Аналитика',
  inbox: 'Входящие сообщения',
  notifications: 'Уведомления',
  equipment: 'Оборудование (EAM)',
  memberships: 'Абонементы',
  'technician-scorecard': 'Скорборд инженеров',
  'reliability-dashboard': 'Надёжность оборудования',
  'refrigerant-compliance': 'Хладагенты — Отчётность',
  'cash-flow': 'Прогноз денежного потока',
  'warranty-tracking': 'Гарантийный учёт',
  'workflow-builder': 'Автоматизации',
  'capacity-planning': 'Планирование мощностей',
  'customer-health': 'Здоровье клиентов',
  lms: 'Учебный центр (LMS)',
  'employee-onboarding': 'Онбординг сотрудников',
  'ai-chat': 'ИИ-ассистент',
  cpq: 'Коммерческое предложение (CPQ)',
  'system-settings': 'Системные настройки',
  'iot-dashboard': 'IoT Мониторинг',
  'maintenance-planner': 'Планировщик ТО',
  'field-map': 'Карта выездов',
  'notification-templates': 'Шаблоны уведомлений',
  'work-order-detail': 'Карточка наряда',
  'financial-planning': 'Бюджет и финансовое планирование',
  'lead-scoring': 'Скоринг лидов',
  'service-object-card': 'Карточка объекта обслуживания',
  documents: 'Документы',
  'competency-matrix': 'Матрица компетенций',
  'route-optimizer': 'Оптимизация маршрутов',
  payroll: 'Расчёт зарплаты',
  'purchase-orders': 'Закупки и ЗИП',
  'onboarding-progress': 'Прогресс онбординга',
  'smart-dispatch': 'Умный диспетчер',
  'client-feedback': 'Отзывы клиентов',
  'service-calendar': 'Календарь выездов',
  'report-builder': 'Конструктор отчётов',
  'performance-dashboard': 'Эффективность команды',
  'multi-channel-inbox': 'Омни-канальный Inbox',
  'price-calculator': 'Калькулятор стоимости',
  'document-editor': 'Редактор документов',
  'equipment-qr': 'QR-коды оборудования',
  'task-manager': 'Менеджер задач',
  'stock-movement': 'Журнал движения склада',
  'contract-manager': 'Управление договорами',
};

const SNRDHeader = ({ activeTab, onCreateNew, onOpenCommandPalette }: SNRDHeaderProps) => {
  const { isFetching, isError, isSuccess } = useQuery({
    queryKey: ['health'],
    queryFn: () => fetch('/actuator/health').then(r => r.ok ? 'ok' : Promise.reject()),
    retry: false,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  const apiStatus = isFetching ? 'checking' : isSuccess ? 'online' : isError ? 'offline' : 'idle';
  const showCreateButton = [
    'applications',
    'work-orders',
    'contracts',
    'employees',
    'contractors',
    'clients',
    'service-objects',
    'service-types',
    'typed-tasks',
    'sla',
    'scheduled-maintenance',
    'survey-templates',
    'dispatch-board',
    'price-list',
  ].includes(activeTab);

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {tabTitles[activeTab] || 'HVAC ERP'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString('ru-RU', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {onOpenCommandPalette && (
            <button onClick={onOpenCommandPalette}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              title="Быстрый поиск (Ctrl+K)">
              <Icon name="Search" size={14} />
              <span>Поиск...</span>
              <kbd className="ml-1 px-1.5 py-0.5 text-xs bg-gray-100 border border-gray-200 rounded font-mono">⌘K</kbd>
            </button>
          )}
          <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border" title="Статус подключения к API">
            <span className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-green-500' : apiStatus === 'offline' ? 'bg-red-400' : 'bg-yellow-400 animate-pulse'}`} />
            <span className="text-gray-500">{apiStatus === 'online' ? 'API' : apiStatus === 'offline' ? 'Демо' : '...'}</span>
          </div>
          <Button variant="outline" size="sm">
            <Icon name="Download" size={16} className="mr-2" />
            Экспорт
          </Button>
          {showCreateButton && (
            <Button size="sm" onClick={onCreateNew}>
              <Icon name="Plus" size={16} className="mr-2" />
              Создать
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default SNRDHeader;
