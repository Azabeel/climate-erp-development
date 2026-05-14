import { useState } from 'react';
import { Phone, Mail, MapPin, Building, Star, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface Client360Props {
  clientId: string;
  clientName: string;
  onBack?: () => void;
}

const MONTHLY_REVENUE = [
  { month: 'Янв', revenue: 45000 }, { month: 'Фев', revenue: 38000 },
  { month: 'Мар', revenue: 62000 }, { month: 'Апр', revenue: 55000 },
  { month: 'Май', revenue: 71000 }, { month: 'Июн', revenue: 48000 },
];

const HEALTH_SCORE = {
  total: 82,
  engagement: 90,
  slaCompliance: 95,
  paymentScore: 85,
  usageScore: 75,
  sentimentScore: 68,
};

const RECENT_ORDERS = [
  { id: 'WO-2026-000045', date: '12.05.2026', type: 'ТО', status: 'Выполнен', amount: 8500 },
  { id: 'WO-2026-000031', date: '28.04.2026', type: 'Ремонт', status: 'Выполнен', amount: 22000 },
  { id: 'WO-2026-000018', date: '15.03.2026', type: 'ТО', status: 'Выполнен', amount: 8500 },
  { id: 'WO-2026-000007', date: '10.02.2026', type: 'Монтаж', status: 'Выполнен', amount: 45000 },
];

const EQUIPMENT_LIST = [
  { id: 'eq1', model: 'Daikin FTXB35C', location: 'Офис — кабинет директора', lastMaint: '12.05.2026', nextMaint: '12.11.2026' },
  { id: 'eq2', model: 'Mitsubishi MSZ-LN35VG', location: 'Офис — переговорная', lastMaint: '28.04.2026', nextMaint: '28.10.2026' },
  { id: 'eq3', model: 'LG S12EQ', location: 'Склад', lastMaint: '15.03.2026', nextMaint: '15.09.2026' },
];


const getHealthColor = (score: number) => score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
const getHealthBg = (score: number) => score >= 80 ? 'bg-green-50 border-green-200' : score >= 60 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';

const HealthBar = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-600">{label}</span>
      <span className={`font-semibold ${getHealthColor(value)}`}>{value}%</span>
    </div>
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${value}%` }} />
    </div>
  </div>
);

const Client360 = ({ clientId, clientName, onBack }: Client360Props) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'equipment' | 'finance'>('overview');

  const totalRevenue = MONTHLY_REVENUE.reduce((s, m) => s + m.revenue, 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft size={16} className="mr-1" /> Назад
          </Button>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Building size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{clientName || 'ООО «Альфа Технологии»'}</h2>
              <p className="text-gray-500 text-sm">ID: {clientId} · Юридическое лицо · Клиент с 2022 года</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Phone size={14} className="mr-1" /> Позвонить</Button>
          <Button variant="outline" size="sm"><Mail size={14} className="mr-1" /> Email</Button>
          <Button size="sm">Создать заявку</Button>
        </div>
      </div>

      {/* Contact info strip */}
      <div className="bg-white border border-gray-200 rounded-lg px-6 py-4 flex items-center gap-8 mb-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm">
          <Phone size={14} className="text-gray-400" />
          <span>+7 495 123-45-67</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Mail size={14} className="text-gray-400" />
          <span>info@alpha-tech.ru</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin size={14} className="text-gray-400" />
          <span>Москва, ул. Садовая, 12</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Star size={14} className="text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-medium">4.8 / 5</span>
          <span className="text-xs text-gray-500">(12 оценок)</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { id: 'overview', label: 'Обзор' },
          { id: 'orders', label: 'Наряды' },
          { id: 'equipment', label: 'Оборудование' },
          { id: 'finance', label: 'Финансы' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-3 gap-6">
          {/* KPI row */}
          <div className="col-span-3 grid grid-cols-4 gap-4">
            {[
              { label: 'Выручка за год', value: `${(totalRevenue / 1000).toFixed(0)}K ₽`, sub: '↑ 15% к прошлому году', positive: true },
              { label: 'Нарядов всего', value: '24', sub: '4 в этом году', positive: true },
              { label: 'Единиц оборудования', value: '3', sub: 'в обслуживании', positive: true },
              { label: 'NPS оценка', value: '4.8 / 5', sub: '12 отзывов', positive: true },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                <p className={`text-xs mt-1 ${kpi.positive ? 'text-green-600' : 'text-red-600'}`}>{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Health score */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Здоровье клиента</h3>
            <div className={`text-center p-4 rounded-lg border mb-4 ${getHealthBg(HEALTH_SCORE.total)}`}>
              <p className={`text-4xl font-bold ${getHealthColor(HEALTH_SCORE.total)}`}>{HEALTH_SCORE.total}</p>
              <p className="text-sm text-gray-600 mt-1">из 100 баллов</p>
              <Badge className="mt-2 bg-green-100 text-green-700 border-0">Хороший клиент</Badge>
            </div>
            <div className="space-y-3">
              <HealthBar label="Активность" value={HEALTH_SCORE.engagement} />
              <HealthBar label="Соблюдение SLA" value={HEALTH_SCORE.slaCompliance} />
              <HealthBar label="Платёжность" value={HEALTH_SCORE.paymentScore} />
              <HealthBar label="Использование" value={HEALTH_SCORE.usageScore} />
              <HealthBar label="Лояльность" value={HEALTH_SCORE.sentimentScore} />
            </div>
          </div>

          {/* Revenue chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Выручка по месяцам</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={MONTHLY_REVENUE}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${v/1000}K`} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString('ru-RU')} ₽`, 'Выручка']} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent activity */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Последние заявки</h3>
            <div className="space-y-3">
              {RECENT_ORDERS.slice(0, 4).map(order => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.id}</p>
                    <p className="text-xs text-gray-500">{order.date} · {order.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{order.amount.toLocaleString('ru-RU')} ₽</p>
                    <Badge className="bg-green-100 text-green-700 border-0 text-xs">{order.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Номер', 'Дата', 'Тип', 'Статус', 'Сумма', ''].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {RECENT_ORDERS.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">{order.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{order.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{order.type}</td>
                  <td className="px-6 py-4"><Badge className="bg-green-100 text-green-700 border-0 text-xs">{order.status}</Badge></td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.amount.toLocaleString('ru-RU')} ₽</td>
                  <td className="px-6 py-4"><Button variant="ghost" size="sm"><ChevronRight size={14} /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'equipment' && (
        <div className="space-y-4">
          {EQUIPMENT_LIST.map(eq => (
            <div key={eq.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{eq.model}</h4>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin size={12} /> {eq.location}
                  </p>
                </div>
                <Button size="sm" variant="outline">Создать ТО</Button>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Последнее ТО</p>
                  <p className="text-sm font-medium text-gray-900">{eq.lastMaint}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Следующее ТО</p>
                  <p className="text-sm font-medium text-gray-900">{eq.nextMaint}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'finance' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Динамика выручки</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={MONTHLY_REVENUE}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${v/1000}K`} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString('ru-RU')} ₽`, 'Выручка']} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Выручка за год', value: `${totalRevenue.toLocaleString('ru-RU')} ₽`, cls: 'bg-blue-50 border-blue-200' },
              { label: 'Средний чек', value: `${Math.round(totalRevenue / RECENT_ORDERS.length).toLocaleString('ru-RU')} ₽`, cls: 'bg-green-50 border-green-200' },
              { label: 'Дебиторская задолженность', value: '0 ₽', cls: 'bg-gray-50 border-gray-200' },
              { label: 'Действующий договор', value: 'До 31.12.2026', cls: 'bg-purple-50 border-purple-200' },
            ].map(s => (
              <div key={s.label} className={`border rounded-lg p-4 ${s.cls}`}>
                <p className="text-sm text-gray-600">{s.label}</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Client360;
