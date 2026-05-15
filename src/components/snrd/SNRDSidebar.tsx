import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SNRDSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const SNRDSidebar = ({ activeTab, setActiveTab }: SNRDSidebarProps) => {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['works', 'directories']);
  const [collapsed, setCollapsed] = useState(false);
  const menuItems = [
    { id: 'dashboard', label: 'Главная', icon: 'LayoutDashboard' },
    { id: 'inbox', label: 'Входящие', icon: 'Inbox' },
    { id: 'notifications', label: 'Уведомления', icon: 'Bell' },
    {
      id: 'works',
      label: 'Работы',
      icon: 'ClipboardList',
      children: [
        { id: 'applications', label: 'Заявки' },
        { id: 'application-drafts', label: 'Черновики заявок' },
        { id: 'work-orders', label: 'Наряды' },
        { id: 'contracts', label: 'Подряды' },
        { id: 'work-drafts', label: 'Черновики работ' },
        { id: 'completion-acts', label: 'Акты выполненных работ' },
        { id: 'warranty-tracking', label: 'Гарантийный учёт' },
        { id: 'typed-tasks', label: 'Задачи' },
      ]
    },
    {
      id: 'workplace',
      label: 'Рабочее место',
      icon: 'MonitorSmartphone',
      children: [
        { id: 'assign-executors', label: 'Назначение исполнителей' },
        { id: 'auto-planning', label: 'Автоматическое планирование' },
        { id: 'dispatch-board', label: 'Доска диспетчера' },
        { id: 'capacity-planning', label: 'Планирование мощностей' },
      ]
    },
    {
      id: 'dashboards-group',
      label: 'Дашборды',
      icon: 'LayoutDashboard',
      children: [
        { id: 'kpi-dashboard', label: 'KPI' },
        { id: 'role-dashboard', label: 'По ролям' },
        { id: 'analytics-dashboard', label: 'Аналитика' },
        { id: 'sla-monitor', label: 'SLA Монитор' },
      ]
    },
    {
      id: 'analytics-group',
      label: 'Аналитика',
      icon: 'BarChart3',
      children: [
        { id: 'reports', label: 'Отчёты' },
        { id: 'reliability-dashboard', label: 'Надёжность оборудования' },
        { id: 'cash-flow', label: 'Прогноз денежного потока' },
        { id: 'customer-health', label: 'Здоровье клиентов' },
      ]
    },
    {
      id: 'surveys',
      label: 'Анкетирование',
      icon: 'FileText',
      children: [
        { id: 'survey-templates', label: 'Шаблоны анкет' },
        { id: 'survey-journal', label: 'Журнал анкет' },
      ]
    },
    { id: 'scheduled-maintenance', label: 'Плановое обслуживание', icon: 'CalendarClock' },
    { id: 'equipment', label: 'Оборудование (EAM)', icon: 'Wrench' },
    { id: 'refrigerant-compliance', label: 'Хладагенты', icon: 'Thermometer' },
    {
      id: 'finance-group',
      label: 'Финансы',
      icon: 'CircleDollarSign',
      children: [
        { id: 'finance', label: 'Финансовая сводка' },
        { id: 'memberships', label: 'Абонементы' },
      ]
    },
    {
      id: 'warehouse-group',
      label: 'Склад',
      icon: 'Package',
      children: [
        { id: 'warehouse', label: 'Остатки и движение' },
        { id: 'stock-alerts', label: 'Алерты остатков' },
      ]
    },
    {
      id: 'crm-group',
      label: 'CRM',
      icon: 'TrendingUp',
      children: [
        { id: 'crm', label: 'Воронка продаж' },
        { id: 'cpq', label: 'КП (Good-Better-Best)' },
      ]
    },
    { id: 'price-list', label: 'Прайс-лист', icon: 'Tags' },
    { id: 'documents', label: 'Документы', icon: 'FolderOpen' },
    {
      id: 'hr-group',
      label: 'HR',
      icon: 'UserCheck',
      children: [
        { id: 'hr', label: 'HR / Зарплата' },
        { id: 'technician-scorecard', label: 'Скорборд инженеров' },
        { id: 'lms', label: 'Учебный центр (LMS)' },
        { id: 'employee-onboarding', label: 'Онбординг' },
      ]
    },
    { id: 'workflow-builder', label: 'Автоматизации', icon: 'Zap' },
    { id: 'ai-chat', label: 'ИИ-ассистент', icon: 'Bot' },
    {
      id: 'directories',
      label: 'Справочники',
      icon: 'Book',
      children: [
        { id: 'employees', label: 'Выездные сотрудники' },
        { id: 'contractors', label: 'Подрядчики' },
        { id: 'clients', label: 'Клиенты' },
        { id: 'service-objects', label: 'Объекты обслуживания' },
        { id: 'service-types', label: 'Виды работ / услуг' },
        { id: 'sla', label: 'Соглашения SLA' },
        { id: 'territories', label: 'Территории обслуживания' },
      ]
    },
    {
      id: 'settings',
      label: 'Настройки',
      icon: 'Settings',
      children: [
        { id: 'licensing', label: 'Лицензирование' },
        { id: 'office-users', label: 'Пользователи офиса' },
        { id: 'work-groups', label: 'Рабочие группы' },
        { id: 'roles', label: 'Конструктор ролей' },
        { id: 'integrations', label: 'Интеграции' },
        { id: 'client-portal-settings', label: 'Клиентский портал' },
        { id: 'audit-log', label: 'Журнал аудита' },
        { id: 'import', label: 'Импорт данных' },
      ]
    },
  ];

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-200`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="Wind" size={24} className="text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-gray-900">HVAC ERP</h1>
              <p className="text-xs text-gray-500">Сервис Климат</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1 rounded hover:bg-gray-100"
            title={collapsed ? 'Развернуть' : 'Свернуть'}
          >
            <Icon name={collapsed ? 'ChevronRight' : 'ChevronLeft'} size={16} className="text-gray-400" />
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isExpanded = expandedGroups.includes(item.id);
            const isActive = activeTab === item.id || (item.children && item.children.some(c => c.id === activeTab));

            return (
              <div key={item.id}>
                <button
                  title={item.label}
                  onClick={() => {
                    if (item.children) {
                      if (isExpanded) {
                        setExpandedGroups(expandedGroups.filter(g => g !== item.id));
                      } else {
                        setExpandedGroups([...expandedGroups, item.id]);
                      }
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <Icon name={item.icon} size={18} />
                  <span className={collapsed ? 'hidden' : 'flex-1 text-left'}>{item.label}</span>
                  {item.children && !collapsed && (
                    <Icon name={isExpanded ? 'ChevronDown' : 'ChevronRight'} size={16} />
                  )}
                </button>
                {item.children && isExpanded && !collapsed && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => setActiveTab(child.id)}
                        className={`w-full flex items-center px-4 py-2 rounded-lg text-sm transition-all ${
                          activeTab === child.id
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t border-gray-200">
        <div className={`flex items-center gap-3 px-3 py-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Icon name="User" size={16} className="text-blue-600" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Администратор</p>
              <p className="text-xs text-gray-500">admin@hvac-erp.ru</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default SNRDSidebar;
