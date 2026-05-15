import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  bg: string;
  category: 'order' | 'client' | 'dispatch' | 'finance' | 'hr';
  shortcut?: string;
}

const ACTIONS: QuickAction[] = [
  { id: 'new-app', label: 'Новая заявка', description: 'Создать заявку на обслуживание', icon: 'ClipboardList', color: 'text-blue-600', bg: 'bg-blue-50 hover:bg-blue-100', category: 'order', shortcut: 'N' },
  { id: 'new-order', label: 'Новый наряд', description: 'Создать наряд на работу', icon: 'Wrench', color: 'text-green-600', bg: 'bg-green-50 hover:bg-green-100', category: 'order' },
  { id: 'assign', label: 'Назначить инженера', description: 'Подобрать исполнителя для заявки', icon: 'UserCheck', color: 'text-purple-600', bg: 'bg-purple-50 hover:bg-purple-100', category: 'dispatch' },
  { id: 'new-client', label: 'Новый клиент', description: 'Добавить клиента в базу', icon: 'UserPlus', color: 'text-indigo-600', bg: 'bg-indigo-50 hover:bg-indigo-100', category: 'client' },
  { id: 'invoice', label: 'Выставить счёт', description: 'Создать счёт на оплату', icon: 'FileText', color: 'text-yellow-600', bg: 'bg-yellow-50 hover:bg-yellow-100', category: 'finance' },
  { id: 'purchase', label: 'Заказать ЗИП', description: 'Создать заявку на закупку', icon: 'Package', color: 'text-orange-600', bg: 'bg-orange-50 hover:bg-orange-100', category: 'order' },
  { id: 'cp', label: 'Сформировать КП', description: 'Good-Better-Best предложение', icon: 'DollarSign', color: 'text-green-700', bg: 'bg-green-50 hover:bg-green-100', category: 'finance' },
  { id: 'report', label: 'Быстрый отчёт', description: 'Сформировать отчёт за период', icon: 'BarChart3', color: 'text-blue-700', bg: 'bg-blue-50 hover:bg-blue-100', category: 'finance' },
  { id: 'maintenance', label: 'Плановое ТО', description: 'Создать наряд на плановое ТО', icon: 'Calendar', color: 'text-teal-600', bg: 'bg-teal-50 hover:bg-teal-100', category: 'order' },
  { id: 'sms', label: 'Уведомить клиента', description: 'Отправить SMS или Telegram', icon: 'Send', color: 'text-cyan-600', bg: 'bg-cyan-50 hover:bg-cyan-100', category: 'client' },
  { id: 'payroll', label: 'Расчёт зарплаты', description: 'Запустить расчёт за период', icon: 'Calculator', color: 'text-pink-600', bg: 'bg-pink-50 hover:bg-pink-100', category: 'hr' },
  { id: 'stock-check', label: 'Инвентаризация', description: 'Начать пересчёт остатков', icon: 'ClipboardCheck', color: 'text-amber-600', bg: 'bg-amber-50 hover:bg-amber-100', category: 'order' },
];

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  time: string;
  user: string;
  icon: string;
  color: string;
}

const RECENT: RecentActivity[] = [
  { id: 'A1', type: 'Наряд создан', description: 'WO-2026-000413 — ТЦ «Европа», ремонт VRF', time: '5 мин назад', user: 'Сидорова А.', icon: 'Plus', color: 'text-blue-500' },
  { id: 'A2', type: 'Инженер назначен', description: 'Петров А.В. → WO-2026-000412', time: '12 мин назад', user: 'Белова Н.', icon: 'UserCheck', color: 'text-green-500' },
  { id: 'A3', type: 'Наряд выполнен', description: 'WO-2026-000410 закрыт, оценка 5/5', time: '34 мин назад', user: 'Петров А.В.', icon: 'CheckCircle', color: 'text-green-600' },
  { id: 'A4', type: 'Закупка создана', description: 'PO-2026-091 — Компрессор Daikin', time: '1 час назад', user: 'Козлов Д.', icon: 'Package', color: 'text-orange-500' },
  { id: 'A5', type: 'Новый клиент', description: 'Зарегистрирован ИП Сергеев В.П.', time: '2 часа назад', user: 'Белова Н.', icon: 'UserPlus', color: 'text-purple-500' },
  { id: 'A6', type: 'SLA нарушен', description: 'WO-2026-000408 превысил TTF', time: '2.5 часа назад', user: 'Система', icon: 'AlertTriangle', color: 'text-red-500' },
];

const categoryLabels: Record<string, string> = {
  all: 'Все', order: 'Заявки/Наряды', client: 'Клиенты', dispatch: 'Диспетчеризация', finance: 'Финансы', hr: 'HR',
};

const QuickActions = () => {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = ACTIONS.filter(a => {
    if (filter !== 'all' && a.category !== filter) return false;
    if (searchQuery && !a.label.toLowerCase().includes(searchQuery.toLowerCase()) && !a.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleAction = (action: QuickAction) => {
    toast.success(`Переход к: ${action.label}`);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Быстрые действия</h2>
          <p className="text-sm text-gray-500 mt-0.5">Часто используемые операции в одном месте</p>
        </div>
      </div>

      {/* Фильтры + Поиск */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-64">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Поиск действия..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${filter === key ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Сетка действий */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {filtered.map(action => (
          <button
            key={action.id}
            onClick={() => handleAction(action)}
            className={`flex flex-col items-start p-4 rounded-xl border border-gray-200 text-left transition-all hover:shadow-sm hover:border-gray-300 ${action.bg}`}
          >
            <div className={`w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center mb-3`}>
              <Icon name={action.icon} size={20} className={action.color} />
            </div>
            <p className={`text-sm font-semibold ${action.color} mb-0.5`}>{action.label}</p>
            <p className="text-xs text-gray-500 leading-tight">{action.description}</p>
            {action.shortcut && (
              <kbd className="mt-2 text-xs px-1.5 py-0.5 bg-white border border-gray-200 rounded font-mono text-gray-400">
                Alt+{action.shortcut}
              </kbd>
            )}
          </button>
        ))}
      </div>

      {/* Последняя активность */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Последняя активность</h3>
          <button className="text-xs text-blue-600 hover:underline">Смотреть всё</button>
        </div>
        <div className="divide-y divide-gray-50">
          {RECENT.map(activity => (
            <div key={activity.id} className="flex items-center gap-3 p-3.5 hover:bg-gray-50 transition-colors">
              <div className={`w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0`}>
                <Icon name={activity.icon} size={14} className={activity.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-700">{activity.type}</span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-500">{activity.user}</span>
                </div>
                <p className="text-xs text-gray-600 truncate">{activity.description}</p>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
