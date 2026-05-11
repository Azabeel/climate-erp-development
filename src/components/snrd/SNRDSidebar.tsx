import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SNRDSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const SNRDSidebar = ({ activeTab, setActiveTab }: SNRDSidebarProps) => {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['works', 'directories']);
  const menuItems = [
    { id: 'dashboard', label: 'Главная', icon: 'LayoutDashboard' },
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
      ]
    },
    { 
      id: 'workplace', 
      label: 'Рабочее место', 
      icon: 'MonitorSmartphone',
      children: [
        { id: 'assign-executors', label: 'Назначение исполнителей' },
        { id: 'auto-planning', label: 'Автоматическое планирование' },
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
    { id: 'finance', label: 'Финансы', icon: 'CircleDollarSign' },
    { id: 'reports', label: 'Отчеты', icon: 'BarChart3' },
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
        { id: 'typed-tasks', label: 'Типовые задачи' },
        { id: 'sla', label: 'Соглашения об уровнях сервиса' },
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
        { id: 'import', label: 'Импорт данных' },
      ]
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
            <Icon name="Wind" size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">HVAC ERP</h1>
            <p className="text-xs text-gray-500">Сервис Климат</p>
          </div>
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
                  }`}
                >
                  <Icon name={item.icon} size={18} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.children && (
                    <Icon name={isExpanded ? 'ChevronDown' : 'ChevronRight'} size={16} />
                  )}
                </button>
                {item.children && isExpanded && (
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
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Icon name="User" size={16} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Администратор</p>
            <p className="text-xs text-gray-500">admin@hvac-erp.ru</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SNRDSidebar;
