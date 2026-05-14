import { useState } from 'react';
import { Plus, Edit2, Search, Crown, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

interface Subscription {
  id: string;
  clientName: string;
  plan: 'Базовый' | 'Стандарт' | 'Премиум';
  status: 'active' | 'paused' | 'cancelled';
  startDate: string;
  nextPayment: string;
  monthlyAmount: number;
  unitsCount: number;
  visitsPerYear: number;
  usedVisits: number;
}

const PLANS = [
  { name: 'Базовый', price: 2500, color: 'bg-gray-100 text-gray-700', icon: Star, features: ['1 ТО в год', 'До 2 кондиционеров', 'Email-уведомления'] },
  { name: 'Стандарт', price: 5900, color: 'bg-blue-100 text-blue-700', icon: Zap, features: ['2 ТО в год', 'До 5 кондиционеров', 'Приоритетный выезд', 'Скидка 10% на ремонт'] },
  { name: 'Премиум', price: 12900, color: 'bg-purple-100 text-purple-700', icon: Crown, features: ['4 ТО в год', 'Без ограничений', 'Аварийный выезд 24/7', 'Скидка 20% на ремонт', 'Персональный менеджер'] },
];

const SUBSCRIPTIONS: Subscription[] = [
  { id: 's1', clientName: 'ООО «Альфа Технологии»', plan: 'Премиум', status: 'active', startDate: '01.01.2026', nextPayment: '01.06.2026', monthlyAmount: 12900, unitsCount: 8, visitsPerYear: 4, usedVisits: 2 },
  { id: 's2', clientName: 'ТЦ «Мираж»', plan: 'Стандарт', status: 'active', startDate: '15.03.2026', nextPayment: '15.06.2026', monthlyAmount: 5900, unitsCount: 4, visitsPerYear: 2, usedVisits: 1 },
  { id: 's3', clientName: 'ИП Смирнов В.А.', plan: 'Базовый', status: 'active', startDate: '01.02.2026', nextPayment: '01.06.2026', monthlyAmount: 2500, unitsCount: 2, visitsPerYear: 1, usedVisits: 0 },
  { id: 's4', clientName: 'ООО «Берег»', plan: 'Стандарт', status: 'paused', startDate: '01.11.2025', nextPayment: '—', monthlyAmount: 5900, unitsCount: 3, visitsPerYear: 2, usedVisits: 2 },
  { id: 's5', clientName: 'Петров И.И.', plan: 'Базовый', status: 'active', startDate: '10.04.2026', nextPayment: '10.06.2026', monthlyAmount: 2500, unitsCount: 1, visitsPerYear: 1, usedVisits: 0 },
];

const MRR_DATA = [
  { month: 'Янв', mrr: 18000 }, { month: 'Фев', mrr: 21000 },
  { month: 'Мар', mrr: 29800 }, { month: 'Апр', mrr: 35600 },
  { month: 'Май', mrr: 39700 },
];

const getPlanIcon = (plan: string) => {
  switch (plan) {
    case 'Премиум': return <Crown size={14} className="text-purple-600" />;
    case 'Стандарт': return <Zap size={14} className="text-blue-600" />;
    default: return <Star size={14} className="text-gray-500" />;
  }
};

const getStatusBadge = (status: Subscription['status']) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-700';
    case 'paused': return 'bg-yellow-100 text-yellow-700';
    case 'cancelled': return 'bg-red-100 text-red-700';
  }
};

const getStatusLabel = (status: Subscription['status']) => {
  switch (status) {
    case 'active': return 'Активна';
    case 'paused': return 'Приостановлена';
    case 'cancelled': return 'Отменена';
  }
};

const MembershipsModule = () => {
  const [subscriptions] = useState<Subscription[]>(SUBSCRIPTIONS);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = subscriptions.filter(s =>
    s.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const mrr = subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.monthlyAmount, 0);
  const activeCount = subscriptions.filter(s => s.status === 'active').length;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Абонементы</h2>
          <p className="text-gray-600 mt-1">Управление подписками клиентов на обслуживание</p>
        </div>
        <Button onClick={() => toast.success('Форма создания абонемента')}>
          <Plus size={16} className="mr-2" /> Новый абонемент
        </Button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700 font-medium">MRR</p>
          <p className="text-2xl font-bold text-blue-900">{mrr.toLocaleString('ru-RU')} ₽</p>
          <p className="text-xs text-blue-600 mt-1">ежемесячная выручка</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700 font-medium">ARR</p>
          <p className="text-2xl font-bold text-green-900">{(mrr * 12).toLocaleString('ru-RU')} ₽</p>
          <p className="text-xs text-green-600 mt-1">прогноз на год</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-700 font-medium">Активных</p>
          <p className="text-2xl font-bold text-purple-900">{activeCount}</p>
          <p className="text-xs text-purple-600 mt-1">из {subscriptions.length} абонементов</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-700 font-medium">Рост MRR</p>
          <p className="text-2xl font-bold text-orange-900">+18%</p>
          <p className="text-xs text-orange-600 mt-1">к прошлому месяцу</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* MRR Chart */}
        <div className="col-span-2 bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Динамика MRR</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={MRR_DATA}>
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${v/1000}K`} />
              <Tooltip formatter={(v: number) => [`${v.toLocaleString('ru-RU')} ₽`, 'MRR']} />
              <Area type="monotone" dataKey="mrr" stroke="#3b82f6" fill="url(#mrrGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Plan breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Тарифы</h3>
          <div className="space-y-3">
            {PLANS.map(plan => {
              const count = subscriptions.filter(s => s.plan === plan.name && s.status === 'active').length;
              const revenue = count * plan.price;
              return (
                <div key={plan.name} className={`p-3 rounded-lg ${plan.color.replace('text-', 'border-').replace('100', '200')} border bg-opacity-50`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-semibold text-sm ${plan.color.split(' ')[1]}`}>{plan.name}</span>
                    <span className="text-xs text-gray-500">{count} клиентов</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{revenue.toLocaleString('ru-RU')} ₽/мес</p>
                  <p className="text-xs text-gray-500">{plan.price.toLocaleString('ru-RU')} ₽ × {count}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Subscriptions list */}
      <div className="mb-4">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input placeholder="Поиск клиентов..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Клиент', 'Тариф', 'Оборудование', 'Визиты', 'Следующий платёж', 'Сумма', 'Статус', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.clientName}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {getPlanIcon(s.plan)}
                    <span className="text-sm text-gray-700">{s.plan}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{s.unitsCount} ед.</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(s.usedVisits / s.visitsPerYear) * 100}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{s.usedVisits}/{s.visitsPerYear}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{s.nextPayment}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.monthlyAmount.toLocaleString('ru-RU')} ₽</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(s.status)}`}>{getStatusLabel(s.status)}</span>
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm" onClick={() => toast.info(`Редактирование: ${s.clientName}`)}><Edit2 size={14} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MembershipsModule;
