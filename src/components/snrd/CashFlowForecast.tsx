import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const FORECAST_DATA = [
  { month: 'Май (факт)', income: 485000, expense: 312000, balance: 173000, cumulative: 820000 },
  { month: 'Июнь', income: 510000, expense: 325000, balance: 185000, cumulative: 1005000 },
  { month: 'Июль', income: 465000, expense: 310000, balance: 155000, cumulative: 1160000 },
  { month: 'Август', income: 420000, expense: 295000, balance: 125000, cumulative: 1285000 },
  { month: 'Сентябрь', income: 530000, expense: 340000, balance: 190000, cumulative: 1475000 },
  { month: 'Октябрь', income: 580000, expense: 360000, balance: 220000, cumulative: 1695000 },
];

const EXPENSE_BREAKDOWN = [
  { category: 'ФОТ', amount: 165000, percent: 53 },
  { category: 'Запчасти/ЗИП', amount: 72000, percent: 23 },
  { category: 'Аренда', amount: 28000, percent: 9 },
  { category: 'Транспорт/ГСМ', amount: 24000, percent: 8 },
  { category: 'Прочее', amount: 23000, percent: 7 },
];

const INCOME_SOURCES = [
  { source: 'Ремонт', amount: 248000, percent: 49 },
  { source: 'ТО / Абонементы', amount: 124000, percent: 24 },
  { source: 'Монтаж', amount: 87000, percent: 17 },
  { source: 'ЗИП (продажа)', amount: 51000, percent: 10 },
];

const formatRub = (v: number) => `${(v / 1000).toFixed(0)}K ₽`;

const CashFlowForecast = () => (
  <div className="p-8">
    <div className="flex items-center gap-3 mb-6">
      <DollarSign size={28} className="text-green-600" />
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Прогноз денежного потока</h2>
        <p className="text-gray-600 mt-0.5">Cash Flow май — октябрь 2026</p>
      </div>
    </div>

    {/* KPI */}
    <div className="grid grid-cols-4 gap-4 mb-8">
      {[
        { label: 'Текущий остаток', value: '820K ₽', icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
        { label: 'Доходы (Май)', value: '485K ₽', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
        { label: 'Расходы (Май)', value: '312K ₽', icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
        { label: 'Прибыль (Май)', value: '173K ₽', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
      ].map(kpi => (
        <div key={kpi.label} className={`rounded-lg p-4 border ${kpi.bg}`}>
          <div className="flex items-center gap-2 mb-2">
            <kpi.icon size={18} className={kpi.color} />
            <span className="text-sm text-gray-600">{kpi.label}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-2 gap-6 mb-6">
      {/* Cash flow chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Доходы и расходы по месяцам</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={FORECAST_DATA}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={formatRub} />
            <Tooltip formatter={(v: number) => [`${v.toLocaleString('ru-RU')} ₽`]} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="income" name="Доходы" fill="#10b981" radius={[3, 3, 0, 0]} />
            <Bar dataKey="expense" name="Расходы" fill="#ef4444" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cumulative balance */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Накопленный остаток</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={FORECAST_DATA}>
            <defs>
              <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={formatRub} />
            <Tooltip formatter={(v: number) => [`${v.toLocaleString('ru-RU')} ₽`, 'Остаток']} />
            <Area type="monotone" dataKey="cumulative" stroke="#3b82f6" fill="url(#balGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6">
      {/* Expense breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Структура расходов (Май)</h3>
        <div className="space-y-3">
          {EXPENSE_BREAKDOWN.map(item => (
            <div key={item.category}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">{item.category}</span>
                <span className="font-medium">{item.amount.toLocaleString('ru-RU')} ₽ <span className="text-gray-400">({item.percent}%)</span></span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-400 rounded-full" style={{ width: `${item.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Income sources */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Источники доходов (Май)</h3>
        <div className="space-y-3">
          {INCOME_SOURCES.map(item => (
            <div key={item.source}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">{item.source}</span>
                <span className="font-medium">{item.amount.toLocaleString('ru-RU')} ₽ <span className="text-gray-400">({item.percent}%)</span></span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${item.percent}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-600" />
            <p className="text-xs text-amber-700 font-medium">Прогноз: рост ТО-абонементов в октябре +15%</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default CashFlowForecast;
