import { Activity, AlertTriangle, CheckCircle, TrendingDown, Wrench } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

const MTTR_DATA = [
  { month: 'Янв', mttr: 4.2 }, { month: 'Фев', mttr: 3.8 },
  { month: 'Мар', mttr: 3.5 }, { month: 'Апр', mttr: 3.1 },
  { month: 'Май', mttr: 2.9 },
];

const FAILURE_TYPES = [
  { name: 'Компрессор', value: 28, color: '#ef4444' },
  { name: 'Плата управления', value: 22, color: '#f97316' },
  { name: 'Вентилятор', value: 18, color: '#eab308' },
  { name: 'Фреон (утечка)', value: 17, color: '#3b82f6' },
  { name: 'Другое', value: 15, color: '#8b5cf6' },
];

const BRAND_RELIABILITY = [
  { brand: 'Daikin', uptime: 99.2, failures: 3 },
  { brand: 'Mitsubishi', uptime: 98.8, failures: 4 },
  { brand: 'Gree', uptime: 97.1, failures: 9 },
  { brand: 'Haier', uptime: 96.5, failures: 12 },
  { brand: 'LG', uptime: 97.8, failures: 7 },
];

const PREDICTIONS = [
  { id: 'eq1', equipment: 'Gree GMV-500 (ТЦ Мираж)', risk: 78, nextFailure: '~15 дней', action: 'Внеплановое ТО' },
  { id: 'eq2', equipment: 'Haier AC36CS (Склад)', risk: 62, nextFailure: '~30 дней', action: 'Проверить компрессор' },
  { id: 'eq3', equipment: 'LG S18EQ (ИП Смирнов)', risk: 45, nextFailure: '~45 дней', action: 'Замена фильтров' },
];

const getRiskColor = (risk: number) => risk >= 70 ? 'text-red-600 bg-red-50 border-red-200' : risk >= 50 ? 'text-yellow-600 bg-yellow-50 border-yellow-200' : 'text-green-600 bg-green-50 border-green-200';

const ReliabilityDashboard = () => (
  <div className="p-8">
    <div className="flex items-center gap-3 mb-6">
      <Activity size={28} className="text-blue-600" />
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Надёжность оборудования</h2>
        <p className="text-gray-600 mt-0.5">Аналитика отказов и предиктивное обслуживание</p>
      </div>
    </div>

    {/* KPI row */}
    <div className="grid grid-cols-4 gap-4 mb-8">
      {[
        { label: 'Средний MTTR', value: '2.9 ч', sub: '↓ 31% за 5 мес', positive: true, Icon: TrendingDown },
        { label: 'Uptime парка', value: '98.1%', sub: '↑ 0.4%', positive: true, Icon: CheckCircle },
        { label: 'Отказов/месяц', value: '12', sub: '↓ 3 к апрелю', positive: true, Icon: Wrench },
        { label: 'Предиктивных алертов', value: '3', sub: 'требуют внимания', positive: false, Icon: AlertTriangle },
      ].map(kpi => (
        <div key={kpi.label} className={`rounded-lg p-4 border ${kpi.positive ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <kpi.Icon size={18} className={kpi.positive ? 'text-green-600' : 'text-orange-600'} />
            <span className="text-sm font-medium text-gray-700">{kpi.label}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
          <p className={`text-xs mt-1 ${kpi.positive ? 'text-green-600' : 'text-orange-600'}`}>{kpi.sub}</p>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-3 gap-6 mb-6">
      {/* MTTR trend */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">MTTR (ч) — тренд</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={MTTR_DATA}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={[2, 5]} />
            <Tooltip formatter={(v: number) => [`${v} ч`, 'MTTR']} />
            <Line type="monotone" dataKey="mttr" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Failure types */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Типы отказов</h3>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={FAILURE_TYPES} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ percent }: { percent: number }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
              {FAILURE_TYPES.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Brand reliability */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Надёжность по брендам</h3>
        <div className="space-y-3">
          {BRAND_RELIABILITY.map(b => (
            <div key={b.brand}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">{b.brand}</span>
                <span className={b.uptime >= 99 ? 'text-green-600' : b.uptime >= 98 ? 'text-blue-600' : 'text-yellow-600'}>{b.uptime}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${b.uptime >= 99 ? 'bg-green-500' : b.uptime >= 98 ? 'bg-blue-500' : 'bg-yellow-500'}`} style={{ width: `${b.uptime}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Predictive alerts */}
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-4">Предиктивные алерты</h3>
      <div className="space-y-3">
        {PREDICTIONS.map(p => (
          <div key={p.id} className={`flex items-center justify-between p-4 rounded-lg border ${getRiskColor(p.risk)}`}>
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className={p.risk >= 70 ? 'text-red-500' : p.risk >= 50 ? 'text-yellow-500' : 'text-green-500'} />
              <div>
                <p className="font-medium text-gray-900">{p.equipment}</p>
                <p className="text-xs text-gray-500">Прогноз отказа: {p.nextFailure}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold">Риск: {p.risk}%</p>
                <p className="text-xs text-gray-500">{p.action}</p>
              </div>
              <button className="px-3 py-1.5 bg-white border rounded-md text-sm font-medium hover:bg-gray-50 shadow-sm">
                Создать ТО
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ReliabilityDashboard;
