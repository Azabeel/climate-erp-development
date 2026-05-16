import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner';

// ─── Данные ────────────────────────────────────────────────────────────────────

const WEEKLY_LOAD_DATA = [
  { week: 'Нед.1', montazh: 38, remont: 42, to: 28, garantiya: 12 },
  { week: 'Нед.2', montazh: 44, remont: 38, to: 32, garantiya: 10 },
  { week: 'Нед.3', montazh: 50, remont: 45, to: 30, garantiya: 14 },
  { week: 'Нед.4', montazh: 36, remont: 40, to: 36, garantiya: 8 },
  { week: 'Нед.5', montazh: 52, remont: 48, to: 28, garantiya: 16 },
  { week: 'Нед.6', montazh: 48, remont: 36, to: 34, garantiya: 12 },
  { week: 'Нед.7', montazh: 60, remont: 42, to: 30, garantiya: 10 },
  { week: 'Нед.8', montazh: 55, remont: 50, to: 26, garantiya: 18 },
  { week: 'Нед.9', montazh: 42, remont: 38, to: 40, garantiya: 8 },
  { week: 'Нед.10', montazh: 46, remont: 44, to: 38, garantiya: 14 },
  { week: 'Нед.11', montazh: 58, remont: 40, to: 32, garantiya: 12 },
  { week: 'Нед.12', montazh: 64, remont: 52, to: 28, garantiya: 16 },
];

const SEASONAL_DATA = [
  // 2024 факт
  { month: 'Янв 24', fact: 95, forecast: null },
  { month: 'Фев 24', fact: 100, forecast: null },
  { month: 'Мар 24', fact: 118, forecast: null },
  { month: 'Апр 24', fact: 130, forecast: null },
  { month: 'Май 24', fact: 155, forecast: null },
  { month: 'Июн 24', fact: 175, forecast: null },
  { month: 'Июл 24', fact: 192, forecast: null },
  { month: 'Авг 24', fact: 188, forecast: null },
  { month: 'Сен 24', fact: 160, forecast: null },
  { month: 'Окт 24', fact: 138, forecast: null },
  { month: 'Ноя 24', fact: 145, forecast: null },
  { month: 'Дек 24', fact: 158, forecast: null },
  // 2025 факт
  { month: 'Янв 25', fact: 98, forecast: null },
  { month: 'Фев 25', fact: 105, forecast: null },
  { month: 'Мар 25', fact: 125, forecast: null },
  { month: 'Апр 25', fact: 138, forecast: null },
  { month: 'Май 25', fact: 156, forecast: null },
  // прогноз 2025
  { month: 'Июн 25', fact: null, forecast: 180 },
  { month: 'Июл 25', fact: null, forecast: 200 },
  { month: 'Авг 25', fact: null, forecast: 195 },
  { month: 'Сен 25', fact: null, forecast: 165 },
  { month: 'Окт 25', fact: null, forecast: 142 },
  { month: 'Ноя 25', fact: null, forecast: 150 },
  { month: 'Дек 25', fact: null, forecast: 162 },
];

interface WorkTypeLimitRow {
  id: number;
  type: string;
  limit: number;
  current: number;
  editing: boolean;
  editValue: string;
}

const INITIAL_LIMITS: WorkTypeLimitRow[] = [
  { id: 1, type: 'Монтаж кондиционеров', limit: 5, current: 4, editing: false, editValue: '' },
  { id: 2, type: 'Ремонт оборудования', limit: 6, current: 6, editing: false, editValue: '' },
  { id: 3, type: 'Техническое обслуживание', limit: 4, current: 3, editing: false, editValue: '' },
  { id: 4, type: 'Гарантийный ремонт', limit: 3, current: 1, editing: false, editValue: '' },
  { id: 5, type: 'Пуско-наладочные работы', limit: 2, current: 2, editing: false, editValue: '' },
  { id: 6, type: 'Аварийный выезд', limit: 2, current: 1, editing: false, editValue: '' },
];

interface Engineer {
  id: string;
  name: string;
  specialization: string;
  ordersPerWeek: number;
  hoursPerWeek: number;
  loadPercent: number;
  days: boolean[]; // пн-вс, true = занято
}

const ENGINEERS: Engineer[] = [
  { id: 'e1', name: 'Козлов Михаил', specialization: 'Монтаж / ТО', ordersPerWeek: 12, hoursPerWeek: 40, loadPercent: 100, days: [true, true, true, true, true, false, false] },
  { id: 'e2', name: 'Петров Сергей', specialization: 'Ремонт', ordersPerWeek: 9, hoursPerWeek: 36, loadPercent: 90, days: [true, true, true, true, true, false, false] },
  { id: 'e3', name: 'Иванов Алексей', specialization: 'ТО / Диагностика', ordersPerWeek: 10, hoursPerWeek: 34, loadPercent: 85, days: [true, true, true, true, false, false, false] },
  { id: 'e4', name: 'Новиков Андрей', specialization: 'Монтаж', ordersPerWeek: 8, hoursPerWeek: 30, loadPercent: 75, days: [true, true, true, false, true, false, false] },
  { id: 'e5', name: 'Смирнов Павел', specialization: 'Ремонт / Гарантия', ordersPerWeek: 7, hoursPerWeek: 28, loadPercent: 70, days: [true, true, false, true, true, false, false] },
  { id: 'e6', name: 'Орлов Виктор', specialization: 'Монтаж / ТО', ordersPerWeek: 6, hoursPerWeek: 24, loadPercent: 60, days: [true, true, true, false, false, false, false] },
  { id: 'e7', name: 'Фёдоров Илья', specialization: 'Диагностика', ordersPerWeek: 5, hoursPerWeek: 20, loadPercent: 50, days: [true, false, true, false, true, false, false] },
  { id: 'e8', name: 'Зайцев Роман', specialization: 'ТО (стажёр)', ordersPerWeek: 4, hoursPerWeek: 16, loadPercent: 40, days: [true, true, false, false, false, false, false] },
];

const DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getLoadBarColor(pct: number): string {
  if (pct > 90) return 'bg-red-500';
  if (pct >= 70) return 'bg-yellow-500';
  return 'bg-green-500';
}

function getLoadTextColor(pct: number): string {
  if (pct > 90) return 'text-red-600';
  if (pct >= 70) return 'text-yellow-600';
  return 'text-green-600';
}

function bufferColor(buffer: number): string {
  if (buffer <= 10) return 'text-red-600 bg-red-50';
  if (buffer <= 30) return 'text-yellow-700 bg-yellow-50';
  return 'text-green-700 bg-green-50';
}

// ─── Кастомный тултип для stacked bar ─────────────────────────────────────────

const WeeklyTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s: number, p: any) => s + (p.value ?? 0), 0);
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 py-0.5">
          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: p.fill }} />
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-medium">{p.value} чел/ч</span>
        </div>
      ))}
      <div className="border-t border-gray-100 mt-1.5 pt-1.5 flex justify-between">
        <span className="text-gray-500">Итого:</span>
        <span className="font-bold text-gray-800">{total} чел/ч</span>
      </div>
    </div>
  );
};

const SeasonalTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      {payload.map((p: any) =>
        p.value != null ? (
          <div key={p.dataKey} className="flex items-center gap-2 py-0.5">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: p.stroke || p.fill }} />
            <span className="text-gray-600">{p.name}:</span>
            <span className="font-medium">{p.value} чел/ч</span>
          </div>
        ) : null
      )}
    </div>
  );
};

// ─── Метрика в шапке ───────────────────────────────────────────────────────────

interface MetricCardProps {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  color: string;
  bg: string;
}

const MetricCard = ({ icon, label, value, sub, color, bg }: MetricCardProps) => (
  <div className={`rounded-xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm ${bg}`}>
    <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${color}`}>
      <Icon name={icon} size={22} className="text-white" />
    </div>
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ─── Компонент ─────────────────────────────────────────────────────────────────

const CapacityPlanningFull = () => {
  const [limits, setLimits] = useState<WorkTypeLimitRow[]>(INITIAL_LIMITS);

  const startEdit = (id: number) => {
    setLimits(prev =>
      prev.map(r => r.id === id ? { ...r, editing: true, editValue: String(r.limit) } : r)
    );
  };

  const saveEdit = (id: number) => {
    setLimits(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        const parsed = parseInt(r.editValue, 10);
        if (isNaN(parsed) || parsed < 1) {
          toast.error('Введите корректное число (≥ 1)');
          return { ...r, editing: false };
        }
        return { ...r, limit: parsed, editing: false };
      })
    );
    toast.success('Лимит обновлён');
  };

  const cancelEdit = (id: number) => {
    setLimits(prev => prev.map(r => r.id === id ? { ...r, editing: false } : r));
  };

  const handleAiRec = (text: string) => {
    toast.success(`Рекомендация принята: ${text}`);
  };

  return (
    <div className="p-8 space-y-8">
      {/* ── Заголовок ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <Icon name="BarChart3" size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Планирование мощностей</h1>
            <p className="text-sm text-gray-500 mt-0.5">Расширенный анализ загрузки и прогноз · май 2025</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.success('Отчёт экспортирован')}>
          <Icon name="Download" size={15} />
          Экспорт
        </Button>
      </div>

      {/* ── 4 метрики ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          icon="Users"
          label="Доступно"
          value="192 чел/дн"
          sub="в текущем месяце"
          color="bg-blue-500"
          bg="bg-blue-50/40"
        />
        <MetricCard
          icon="Activity"
          label="Загружено"
          value="156 (81%)"
          sub="из 192 чел/дней"
          color="bg-orange-500"
          bg="bg-orange-50/40"
        />
        <MetricCard
          icon="CalendarCheck"
          label="Свободно"
          value="36 чел/дн"
          sub="доступный резерв"
          color="bg-green-500"
          bg="bg-green-50/40"
        />
        <MetricCard
          icon="TrendingUp"
          label="Прогноз след. месяц"
          value="89%"
          sub="на основе воронки CRM"
          color="bg-violet-500"
          bg="bg-violet-50/40"
        />
      </div>

      {/* ── Таблица инженеров ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Icon name="UserCheck" size={18} className="text-blue-600" />
          <h2 className="font-semibold text-gray-800">Загрузка инженеров</h2>
          <Badge variant="secondary" className="ml-auto text-xs">{ENGINEERS.length} инженеров</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Инженер</th>
                <th className="text-left px-4 py-3 font-medium">Специализация</th>
                <th className="text-center px-4 py-3 font-medium">Нарядов/нед.</th>
                <th className="text-center px-4 py-3 font-medium">Часов/нед.</th>
                <th className="text-left px-4 py-3 font-medium w-44">Загрузка</th>
                <th className="text-center px-4 py-3 font-medium">Пн–Вс</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ENGINEERS.map(eng => (
                <tr key={eng.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs">
                        {eng.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <span className="font-medium text-gray-800">{eng.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">{eng.specialization}</td>
                  <td className="px-4 py-3.5 text-center font-medium text-gray-700">{eng.ordersPerWeek}</td>
                  <td className="px-4 py-3.5 text-center font-medium text-gray-700">{eng.hoursPerWeek}ч</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${getLoadBarColor(eng.loadPercent)}`}
                          style={{ width: `${Math.min(eng.loadPercent, 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-semibold w-9 text-right ${getLoadTextColor(eng.loadPercent)}`}>
                        {eng.loadPercent}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1">
                      {eng.days.map((busy, i) => (
                        <div key={i} className="flex flex-col items-center gap-0.5">
                          <span className="text-[9px] text-gray-400 leading-none">{DAY_LABELS[i]}</span>
                          <div
                            className={`w-4 h-4 rounded-sm border ${
                              busy
                                ? 'bg-blue-500 border-blue-600'
                                : 'bg-gray-100 border-gray-200'
                            }`}
                            title={`${DAY_LABELS[i]}: ${busy ? 'занят' : 'свободен'}`}
                          />
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Stacked BarChart загрузки по неделям ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Icon name="BarChart2" size={18} className="text-blue-600" />
          <h2 className="font-semibold text-gray-800">Загрузка по неделям (12 недель)</h2>
          <span className="text-xs text-gray-400 ml-auto">чел/ч · красная линия = предел 192</span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={WEEKLY_LOAD_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
            <Tooltip content={<WeeklyTooltip />} />
            <Legend
              formatter={(val) => {
                const labels: Record<string, string> = { montazh: 'Монтаж', remont: 'Ремонт', to: 'ТО', garantiya: 'Гарантия' };
                return labels[val as string] ?? val;
              }}
              iconType="square"
              wrapperStyle={{ fontSize: 12 }}
            />
            <ReferenceLine y={192} stroke="#ef4444" strokeDasharray="6 3" strokeWidth={2} label={{ value: 'Макс. 192', position: 'right', fontSize: 11, fill: '#ef4444' }} />
            <Bar dataKey="montazh" name="montazh" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
            <Bar dataKey="remont" name="remont" stackId="a" fill="#f59e0b" />
            <Bar dataKey="to" name="to" stackId="a" fill="#10b981" />
            <Bar dataKey="garantiya" name="garantiya" stackId="a" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── AreaChart сезонной динамики ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Icon name="TrendingUp" size={18} className="text-violet-600" />
          <h2 className="font-semibold text-gray-800">Сезонная динамика загрузки</h2>
          <span className="text-xs text-gray-400 ml-auto">2024 факт + прогноз до дек 2025</span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={SEASONAL_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradFact" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#9ca3af" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7280' }} interval={1} angle={-30} textAnchor="end" height={42} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} domain={[60, 220]} />
            <Tooltip content={<SeasonalTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine y={192} stroke="#ef4444" strokeDasharray="5 3" strokeWidth={1.5} label={{ value: 'Предел', position: 'right', fontSize: 10, fill: '#ef4444' }} />
            <Area
              type="monotone"
              dataKey="fact"
              name="Факт"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="url(#gradFact)"
              connectNulls={false}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Area
              type="monotone"
              dataKey="forecast"
              name="Прогноз"
              stroke="#9ca3af"
              strokeWidth={2}
              strokeDasharray="6 4"
              fill="url(#gradForecast)"
              connectNulls={false}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Таблица лимитов ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Icon name="Sliders" size={18} className="text-gray-600" />
          <h2 className="font-semibold text-gray-800">Лимиты по типам работ</h2>
          <span className="text-xs text-gray-400 ml-auto">Одновременно в работе</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
            <tr>
              <th className="text-left px-6 py-3 font-medium">Тип работы</th>
              <th className="text-center px-4 py-3 font-medium">Лимит инженеров</th>
              <th className="text-center px-4 py-3 font-medium">Текущее</th>
              <th className="text-center px-4 py-3 font-medium">Буфер</th>
              <th className="text-center px-4 py-3 font-medium">Действие</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {limits.map(row => {
              const buffer = Math.round(((row.limit - row.current) / row.limit) * 100);
              return (
                <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-3.5 font-medium text-gray-800">{row.type}</td>
                  <td className="px-4 py-3.5 text-center">
                    {row.editing ? (
                      <input
                        type="number"
                        min={1}
                        value={row.editValue}
                        onChange={e =>
                          setLimits(prev =>
                            prev.map(r => r.id === row.id ? { ...r, editValue: e.target.value } : r)
                          )
                        }
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveEdit(row.id);
                          if (e.key === 'Escape') cancelEdit(row.id);
                        }}
                        className="w-16 text-center border border-blue-400 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    ) : (
                      <span className="font-semibold text-gray-700">{row.limit}</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`font-semibold ${row.current >= row.limit ? 'text-red-600' : 'text-gray-700'}`}>
                      {row.current}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${bufferColor(buffer)}`}>
                      {buffer}%
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {row.editing ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <Button size="sm" variant="default" className="h-7 px-3 text-xs" onClick={() => saveEdit(row.id)}>
                          Сохранить
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => cancelEdit(row.id)}>
                          Отмена
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" className="h-7 px-3 text-xs gap-1" onClick={() => startEdit(row.id)}>
                        <Icon name="Pencil" size={11} />
                        Изменить
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── ИИ-рекомендации ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <Icon name="Sparkles" size={15} className="text-white" />
          </div>
          <h2 className="font-semibold text-gray-800">Рекомендации ИИ</h2>
          <Badge className="ml-auto bg-violet-100 text-violet-700 border-0 text-xs">Модель обновлена сегодня</Badge>
        </div>
        <div className="space-y-3">
          {/* Рекомендация 1 */}
          <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-50 border border-blue-100">
            <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
              <Icon name="UserPlus" size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">Нанять 2 монтажника к июлю</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Прогноз загрузки 200 чел/ч в июле превышает предел на 4%. Два новых монтажника снизят риск перегрузки
                и обеспечат буфер в 8%.
              </p>
            </div>
            <Button size="sm" variant="outline" className="shrink-0 h-8 px-3 text-xs" onClick={() => handleAiRec('Нанять 2 монтажника')}>
              Принять
            </Button>
          </div>
          {/* Рекомендация 2 */}
          <div className="flex items-start gap-4 p-4 rounded-lg bg-amber-50 border border-amber-100">
            <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
              <Icon name="RefreshCcw" size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">Перевести Козлова на ТО</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Козлов М. загружен на 100% монтажными работами, при этом ТО не закрывается вовремя.
                Перевод на ТО высвободит 2 слота под срочные монтажи.
              </p>
            </div>
            <Button size="sm" variant="outline" className="shrink-0 h-8 px-3 text-xs" onClick={() => handleAiRec('Перевести Козлова на ТО')}>
              Принять
            </Button>
          </div>
          {/* Рекомендация 3 */}
          <div className="flex items-start gap-4 p-4 rounded-lg bg-green-50 border border-green-100">
            <div className="w-9 h-9 rounded-lg bg-green-500 flex items-center justify-center shrink-0">
              <Icon name="ExternalLink" size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">Аутсорс 15% ремонтов</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Передача 15% несложных ремонтов партнёрской организации позволит сэкономить ~22 чел/ч в месяц и
                сосредоточить штатных инженеров на высокомаржинальных монтажах.
              </p>
            </div>
            <Button size="sm" variant="outline" className="shrink-0 h-8 px-3 text-xs" onClick={() => handleAiRec('Аутсорс 15% ремонтов')}>
              Принять
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapacityPlanningFull;
