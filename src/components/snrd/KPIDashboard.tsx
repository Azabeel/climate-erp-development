import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, DollarSign, Wrench, Users, Star, Clock, Target, AlertTriangle, CheckCircle, BarChart2 } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const MONTHLY_DATA = [
  { month: 'Дек', revenue: 3200000, orders: 178, sla: 94.1, nps: 82 },
  { month: 'Янв', revenue: 2800000, orders: 145, sla: 93.5, nps: 80 },
  { month: 'Фев', revenue: 3100000, orders: 167, sla: 94.8, nps: 83 },
  { month: 'Мар', revenue: 3400000, orders: 189, sla: 96.2, nps: 85 },
  { month: 'Апр', revenue: 3900000, orders: 203, sla: 95.8, nps: 86 },
  { month: 'Май', revenue: 4200000, orders: 218, sla: 96.5, nps: 87 },
];

const ENGINEER_DATA = [
  { name: 'Козлов М.', orders: 42, revenue: 612000, rating: 4.9, sla: 98 },
  { name: 'Петров С.', orders: 38, revenue: 541000, rating: 4.8, sla: 97 },
  { name: 'Иванов А.', orders: 35, revenue: 498000, rating: 4.7, sla: 95 },
  { name: 'Сидоров Д.', orders: 31, revenue: 443000, rating: 4.6, sla: 94 },
  { name: 'Новиков Р.', orders: 28, revenue: 401000, rating: 4.5, sla: 93 },
];

const SERVICE_BREAKDOWN = [
  { name: 'Ремонт', value: 1840000, count: 89 },
  { name: 'ТО', value: 1050000, count: 74 },
  { name: 'Монтаж', value: 820000, count: 31 },
  { name: 'ЗИП', value: 490000, count: 24 },
];

const SLA_TREND = [
  { week: 'Н-5', green: 88, yellow: 8, red: 4 },
  { week: 'Н-4', green: 90, yellow: 7, red: 3 },
  { week: 'Н-3', green: 91, yellow: 6, red: 3 },
  { week: 'Н-2', green: 93, yellow: 5, red: 2 },
  { week: 'Н-1', green: 95, yellow: 4, red: 1 },
  { week: 'Текущ.', green: 96, yellow: 3, red: 1 },
];

const formatMoney = (v: number) => {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)} млн ₽`;
  if (v >= 1000) return `${(v / 1000).toFixed(0)}k ₽`;
  return `${v} ₽`;
};

const KPICard = ({ label, value, prev, icon: Icon, color }: { label: string; value: string; prev: string; icon: React.ElementType; color: string }) => {
  const isPositive = prev.startsWith('+');
  const isNeutral = prev === '0' || prev === '';
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
        {!isNeutral && (
          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {prev}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
};

const PERIODS = ['7 дней', '30 дней', '90 дней', '12 мес'];

const KPIDashboard = () => {
  const [period, setPeriod] = useState('30 дней');
  const [tab, setTab] = useState<'overview' | 'revenue' | 'sla' | 'engineers'>('overview');

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart2 size={28} className="text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">KPI Дашборд</h2>
            <p className="text-gray-500 text-sm">Ключевые показатели эффективности</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${period === p ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {(['overview', 'revenue', 'sla', 'engineers'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>
            {t === 'overview' ? 'Обзор' : t === 'revenue' ? 'Выручка' : t === 'sla' ? 'SLA' : 'Инженеры'}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard label="Выручка (май)" value="4.2 млн ₽" prev="+18%" icon={DollarSign} color="bg-blue-50 text-blue-600" />
            <KPICard label="Нарядов выполнено" value="218" prev="+8%" icon={Wrench} color="bg-green-50 text-green-600" />
            <KPICard label="Активных клиентов" value="147" prev="+5%" icon={Users} color="bg-purple-50 text-purple-600" />
            <KPICard label="NPS" value="87" prev="+2 пт" icon={Star} color="bg-yellow-50 text-yellow-600" />
            <KPICard label="Средн. время реакции" value="1.8 ч" prev="-0.3 ч" icon={Clock} color="bg-orange-50 text-orange-600" />
            <KPICard label="SLA соответствие" value="96.5%" prev="+0.7%" icon={Target} color="bg-teal-50 text-teal-600" />
            <KPICard label="SLA нарушений" value="8" prev="-3" icon={AlertTriangle} color="bg-red-50 text-red-600" />
            <KPICard label="Маржинальность" value="34.2%" prev="+2.1%" icon={CheckCircle} color="bg-indigo-50 text-indigo-600" />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Динамика выручки</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={MONTHLY_DATA}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(v: number) => [formatMoney(v), 'Выручка']} />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">По видам услуг</h3>
              <div className="space-y-4">
                {SERVICE_BREAKDOWN.map(s => {
                  const total = SERVICE_BREAKDOWN.reduce((sum, x) => sum + x.value, 0);
                  const pct = Math.round(s.value / total * 100);
                  return (
                    <div key={s.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{s.name}</span>
                        <span className="font-medium text-gray-900">{formatMoney(s.value)}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{s.count} нарядов · {pct}%</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'revenue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Выручка по месяцам</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={MONTHLY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(v: number) => [formatMoney(v), 'Выручка']} />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Нарядов по месяцам</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={MONTHLY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <ReferenceLine y={200} stroke="#f97316" strokeDasharray="4 4" label={{ value: 'План', position: 'right', fontSize: 11 }} />
                  <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Нарядов" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Детализация по видам услуг (май 2026)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-500 font-medium">Вид услуги</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Нарядов</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Выручка</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Средний чек</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Маржа</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Ремонт', orders: 89, revenue: 1840000, margin: 38 },
                    { name: 'ТО', orders: 74, revenue: 1050000, margin: 42 },
                    { name: 'Монтаж', orders: 31, revenue: 820000, margin: 28 },
                    { name: 'ЗИП', orders: 24, revenue: 490000, margin: 22 },
                  ].map(row => (
                    <tr key={row.name} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-900">{row.name}</td>
                      <td className="py-3 text-right text-gray-700">{row.orders}</td>
                      <td className="py-3 text-right font-medium text-gray-900">{formatMoney(row.revenue)}</td>
                      <td className="py-3 text-right text-gray-700">{formatMoney(Math.round(row.revenue / row.orders))}</td>
                      <td className="py-3 text-right">
                        <span className={`font-medium ${row.margin >= 35 ? 'text-green-600' : row.margin >= 25 ? 'text-blue-600' : 'text-yellow-600'}`}>
                          {row.margin}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'sla' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'SLA в норме (зел.)', value: '96%', sub: '209 нарядов', color: 'bg-green-50 border-green-200 text-green-700' },
              { label: 'Предупреждение (жёлт.)', value: '3%', sub: '7 нарядов', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
              { label: 'Нарушение (красн.)', value: '1%', sub: '2 наряда', color: 'bg-red-50 border-red-200 text-red-700' },
            ].map(c => (
              <div key={c.label} className={`border rounded-xl p-5 ${c.color}`}>
                <p className="text-sm font-medium mb-1">{c.label}</p>
                <p className="text-3xl font-bold">{c.value}</p>
                <p className="text-sm mt-1 opacity-70">{c.sub}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Тренд SLA по неделям</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={SLA_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="green" fill="#22c55e" name="В норме %" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="yellow" fill="#f59e0b" name="Предупреж. %" stackId="a" />
                <Bar dataKey="red" fill="#ef4444" name="Нарушение %" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">SLA по инженерам (май 2026)</h3>
            <div className="space-y-3">
              {ENGINEER_DATA.map(e => (
                <div key={e.name} className="flex items-center gap-4">
                  <span className="w-28 text-sm text-gray-700 shrink-0">{e.name}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full">
                    <div className={`h-2 rounded-full ${e.sla >= 97 ? 'bg-green-500' : e.sla >= 94 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                      style={{ width: `${e.sla}%` }} />
                  </div>
                  <span className={`text-sm font-medium w-14 text-right ${e.sla >= 97 ? 'text-green-600' : e.sla >= 94 ? 'text-blue-600' : 'text-yellow-600'}`}>
                    {e.sla}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'engineers' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Рейтинг инженеров (май 2026)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ENGINEER_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                <Tooltip formatter={(v: number) => [formatMoney(v), 'Выручка']} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} name="Выручка" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm overflow-x-auto">
            <h3 className="font-semibold text-gray-900 mb-4">Детальная статистика</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-500 font-medium">Инженер</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Нарядов</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Выручка</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Средн. чек</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Рейтинг</th>
                  <th className="text-right py-2 text-gray-500 font-medium">SLA</th>
                </tr>
              </thead>
              <tbody>
                {ENGINEER_DATA.map((e, idx) => (
                  <tr key={e.name} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-400' : 'bg-gray-200 text-gray-600'}`}>
                          {idx + 1}
                        </span>
                        <span className="font-medium text-gray-900">{e.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right text-gray-700">{e.orders}</td>
                    <td className="py-3 text-right font-medium text-gray-900">{formatMoney(e.revenue)}</td>
                    <td className="py-3 text-right text-gray-700">{formatMoney(Math.round(e.revenue / e.orders))}</td>
                    <td className="py-3 text-right">
                      <span className="text-yellow-600 font-medium">★ {e.rating}</span>
                    </td>
                    <td className="py-3 text-right">
                      <span className={`font-medium ${e.sla >= 97 ? 'text-green-600' : 'text-blue-600'}`}>{e.sla}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default KPIDashboard;
