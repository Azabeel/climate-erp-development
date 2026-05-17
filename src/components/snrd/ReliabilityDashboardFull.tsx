import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ─── Моковые данные ────────────────────────────────────────────────────────────

// AreaChart: отказы по месяцам (12 мес.)
const FAILURES_BY_MONTH = [
  { month: 'Июн', sudden: 8, gradual: 5, prevented: 3 },
  { month: 'Июл', sudden: 7, gradual: 6, prevented: 4 },
  { month: 'Авг', sudden: 9, gradual: 7, prevented: 5 },
  { month: 'Сен', sudden: 6, gradual: 5, prevented: 6 },
  { month: 'Окт', sudden: 5, gradual: 4, prevented: 7 },
  { month: 'Ноя', sudden: 4, gradual: 4, prevented: 8 },
  { month: 'Дек', sudden: 6, gradual: 3, prevented: 9 },
  { month: 'Янв', sudden: 5, gradual: 3, prevented: 10 },
  { month: 'Фев', sudden: 4, gradual: 2, prevented: 11 },
  { month: 'Мар', sudden: 3, gradual: 2, prevented: 12 },
  { month: 'Апр', sudden: 4, gradual: 3, prevented: 13 },
  { month: 'Май', sudden: 3, gradual: 2, prevented: 14 },
];

// BarChart: MTBF по брендам (горизонтальный)
const BRAND_MTBF = [
  { brand: 'Daikin', mtbf: 3840 },
  { brand: 'Mitsubishi', mtbf: 3520 },
  { brand: 'Carrier', mtbf: 3100 },
  { brand: 'Gree', mtbf: 2610 },
  { brand: 'Haier', mtbf: 2280 },
  { brand: 'Midea', mtbf: 1950 },
];

// LineChart: MTBF динамика 24 мес.
const generateMTBFTrend = () => {
  const months = [
    'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя',
    'Дек', 'Янв', 'Фев', 'Мар', 'Апр', 'Май',
    'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя',
    'Дек', 'Янв', 'Фев', 'Мар', 'Апр', 'Май',
  ];
  return months.map((m, i) => ({
    month: i % 3 === 0 ? m : '',
    label: m,
    mtbf: Math.round(1900 + i * 42 + Math.sin(i * 0.6) * 80),
  }));
};
const MTBF_TREND = generateMTBFTrend();

// PieChart: причины отказов
const FAILURE_CAUSES = [
  { name: 'Износ', value: 40, color: '#ef4444' },
  { name: 'Нарушение эксплуатации', value: 25, color: '#f97316' },
  { name: 'Заводской брак', value: 15, color: '#eab308' },
  { name: 'Воздействие среды', value: 12, color: '#3b82f6' },
  { name: 'Неизвестно', value: 8, color: '#8b5cf6' },
];

// Таблица: группы риска (10 единиц)
const RISK_EQUIPMENT = [
  {
    id: 'eq01',
    name: 'Daikin VRF — ТЦ Европа',
    client: 'ТЦ «Европа»',
    age: 7.2,
    lastRepair: '12.02.2026',
    riskScore: 88,
  },
  {
    id: 'eq02',
    name: 'Gree GMV-500 — ТЦ Мираж',
    client: 'ТЦ «Мираж»',
    age: 6.5,
    lastRepair: '28.01.2026',
    riskScore: 76,
  },
  {
    id: 'eq03',
    name: 'Haier AC36CS — Склад №3',
    client: 'ООО «ХолодПром»',
    age: 5.8,
    lastRepair: '15.03.2026',
    riskScore: 71,
  },
  {
    id: 'eq04',
    name: 'Carrier 50XC — Офис Альфа',
    client: 'АО «АльфаГрупп»',
    age: 4.3,
    lastRepair: '05.04.2026',
    riskScore: 62,
  },
  {
    id: 'eq05',
    name: 'Midea MV8 — БЦ Горизонт',
    client: 'БЦ «Горизонт»',
    age: 5.1,
    lastRepair: '19.02.2026',
    riskScore: 58,
  },
  {
    id: 'eq06',
    name: 'Mitsubishi PUHY — Завод Юг',
    client: 'ООО «ЮгМаш»',
    age: 3.9,
    lastRepair: '01.04.2026',
    riskScore: 51,
  },
  {
    id: 'eq07',
    name: 'Gree GWH — ИП Смирнов',
    client: 'ИП Смирнов',
    age: 4.7,
    lastRepair: '10.03.2026',
    riskScore: 47,
  },
  {
    id: 'eq08',
    name: 'Haier AV14 — Ресторан Сезон',
    client: 'ООО «Сезон»',
    age: 3.2,
    lastRepair: '22.04.2026',
    riskScore: 41,
  },
  {
    id: 'eq09',
    name: 'Daikin RZQG — Клиника Плюс',
    client: 'ООО «МедПлюс»',
    age: 2.8,
    lastRepair: '30.04.2026',
    riskScore: 34,
  },
  {
    id: 'eq10',
    name: 'Carrier 30XA — Гостиница Север',
    client: 'ГК «СеверОтель»',
    age: 2.1,
    lastRepair: '08.05.2026',
    riskScore: 27,
  },
];

// AI прогнозы отказов
const AI_PREDICTIONS = [
  {
    id: 'ai01',
    equipment: 'Daikin VRF — ТЦ Европа',
    probability: 73,
    horizon: '30 дней',
    recommendation: 'Рекомендуем ТО в течение 2 недель',
    details: 'Аномальный рост вибрации компрессора +18% за последние 4 недели',
    urgency: 'critical' as const,
  },
  {
    id: 'ai02',
    equipment: 'Gree GMV-500 — ТЦ Мираж',
    probability: 54,
    horizon: '45 дней',
    recommendation: 'Проверить дренажную систему и фильтры',
    details: 'Снижение холодопроизводительности на 12%. Возможна частичная утечка хладагента',
    urgency: 'high' as const,
  },
  {
    id: 'ai03',
    equipment: 'Carrier 50XC — Офис Альфа',
    probability: 38,
    horizon: '60 дней',
    recommendation: 'Плановая замена фильтров и ремней вентилятора',
    details: 'Ресурс расходников выработан на 82%. Отказ не критический, можно планово',
    urgency: 'medium' as const,
  },
];

// ─── Вспомогательные функции ───────────────────────────────────────────────────

const getRiskLevel = (score: number): { label: string; variant: 'destructive' | 'warning' | 'secondary' } => {
  if (score >= 70) return { label: 'Критический', variant: 'destructive' };
  if (score >= 50) return { label: 'Высокий', variant: 'warning' };
  return { label: 'Средний', variant: 'secondary' };
};

const getUrgencyColor = (urgency: 'critical' | 'high' | 'medium') => {
  if (urgency === 'critical') return 'bg-red-50 border-red-200';
  if (urgency === 'high') return 'bg-orange-50 border-orange-200';
  return 'bg-yellow-50 border-yellow-200';
};

const getUrgencyIconColor = (urgency: 'critical' | 'high' | 'medium') => {
  if (urgency === 'critical') return 'text-red-500';
  if (urgency === 'high') return 'text-orange-500';
  return 'text-yellow-500';
};

// ─── Компонент ────────────────────────────────────────────────────────────────

const ReliabilityDashboardFull = () => {
  const [scheduledIds, setScheduledIds] = useState<Set<string>>(new Set());

  const handleScheduleMaintenance = (id: string, name: string) => {
    setScheduledIds(prev => new Set(prev).add(id));
    toast.success(`ТО запланировано: ${name}`);
  };

  const handleScheduleAll = () => {
    const ids = new Set(AI_PREDICTIONS.map(p => p.id));
    setScheduledIds(ids);
    toast.success('Все рекомендованные ТО запланированы (3 наряда)', {
      description: 'Задачи переданы диспетчеру для назначения инженеров',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon name="Activity" size={28} className="text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Надёжность оборудования</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              Аналитика отказов, MTBF/MTTR и предиктивное обслуживание
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Icon name="RefreshCw" size={14} />
          <span>Обновлено: 17.05.2026 09:00</span>
        </div>
      </div>

      {/* KPI-метрики */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Clock" size={18} className="text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Средняя MTBF</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">2 847</p>
          <p className="text-xs text-gray-500 mt-1">часов наработки на отказ</p>
          <p className="text-xs text-blue-600 mt-2 font-medium">↑ +12% за год</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Wrench" size={18} className="text-green-600" />
            <span className="text-sm font-medium text-gray-600">Среднее MTTR</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">4.2</p>
          <p className="text-xs text-gray-500 mt-1">часа среднего времени ремонта</p>
          <p className="text-xs text-green-600 mt-2 font-medium">↓ −0.8 ч за полгода</p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="CheckCircle" size={18} className="text-emerald-600" />
            <span className="text-sm font-medium text-gray-600">Коэффициент готовности</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">97.8%</p>
          <p className="text-xs text-gray-500 mt-1">среднее по всему парку</p>
          <p className="text-xs text-emerald-600 mt-2 font-medium">↑ +0.6% за квартал</p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="AlertTriangle" size={18} className="text-orange-600" />
            <span className="text-sm font-medium text-gray-600">Повторных отказов</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">8</p>
          <p className="text-xs text-gray-500 mt-1">за последние 30 дней</p>
          <p className="text-xs text-orange-600 mt-2 font-medium">↓ −3 к прошлому месяцу</p>
        </div>
      </div>

      {/* AreaChart + MTBF trend */}
      <div className="grid grid-cols-2 gap-6">
        {/* Отказы по месяцам */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-1">Отказы по месяцам</h3>
          <p className="text-xs text-gray-400 mb-4">Динамика за 12 месяцев по типам</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={FAILURES_BY_MONTH} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradSudden" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradGradual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradPrevented" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                formatter={(v: number, name: string) => {
                  const labels: Record<string, string> = {
                    sudden: 'Внезапные',
                    gradual: 'Постепенные',
                    prevented: 'Предотвращённые ТО',
                  };
                  return [v, labels[name] ?? name];
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11 }}
                formatter={(value) => {
                  const labels: Record<string, string> = {
                    sudden: 'Внезапные отказы',
                    gradual: 'Постепенные отказы',
                    prevented: 'Предотвращённые ТО',
                  };
                  return labels[value] ?? value;
                }}
              />
              <Area type="monotone" dataKey="sudden" stroke="#ef4444" strokeWidth={2} fill="url(#gradSudden)" />
              <Area type="monotone" dataKey="gradual" stroke="#f97316" strokeWidth={2} fill="url(#gradGradual)" />
              <Area type="monotone" dataKey="prevented" stroke="#22c55e" strokeWidth={2} fill="url(#gradPrevented)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* MTBF динамика 24 мес. */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-1">MTBF — динамика</h3>
          <p className="text-xs text-gray-400 mb-4">24 месяца, рост после внедрения превентивного ТО</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={MTBF_TREND} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10 }}
                tickLine={false}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                domain={[1700, 3200]}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                formatter={(v: number) => [`${v} ч`, 'MTBF']}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.label ?? ''}
              />
              <Line
                type="monotone"
                dataKey="mtbf"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BarChart надёжность по брендам + PieChart причины отказов */}
      <div className="grid grid-cols-2 gap-6">
        {/* Надёжность по брендам — горизонтальный bar */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-1">Надёжность по брендам</h3>
          <p className="text-xs text-gray-400 mb-4">MTBF (часов) для каждого производителя</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={BRAND_MTBF}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 16, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                domain={[0, 4200]}
                tickFormatter={(v) => `${v}`}
              />
              <YAxis
                type="category"
                dataKey="brand"
                tick={{ fontSize: 12, fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                width={72}
              />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                formatter={(v: number) => [`${v} ч`, 'MTBF']}
              />
              <Bar dataKey="mtbf" radius={[0, 4, 4, 0]}>
                {BRAND_MTBF.map((entry, index) => {
                  const colors = ['#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
                  return <Cell key={index} fill={colors[index % colors.length]} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Причины отказов */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-1">Причины отказов</h3>
          <p className="text-xs text-gray-400 mb-4">Распределение по категориям за 12 месяцев</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={FAILURE_CAUSES}
                cx="50%"
                cy="50%"
                outerRadius={82}
                innerRadius={40}
                dataKey="value"
                label={({ name, percent }) =>
                  `${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {FAILURE_CAUSES.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                formatter={(v: number, _: string, props: { payload?: { name: string } }) => [
                  `${v}%`,
                  props.payload?.name ?? '',
                ]}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Таблица групп риска */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Группы риска</h3>
            <p className="text-xs text-gray-400 mt-0.5">10 единиц оборудования, близких к отказу</p>
          </div>
          <Badge variant="destructive">
            <Icon name="AlertTriangle" size={12} className="mr-1" />
            3 критических
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3 font-medium">Оборудование</th>
                <th className="text-left px-4 py-3 font-medium">Клиент</th>
                <th className="text-center px-4 py-3 font-medium">Возраст, лет</th>
                <th className="text-center px-4 py-3 font-medium">Последний ремонт</th>
                <th className="text-left px-4 py-3 font-medium w-48">Risk Score</th>
                <th className="text-center px-4 py-3 font-medium">Уровень риска</th>
                <th className="text-center px-4 py-3 font-medium">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {RISK_EQUIPMENT.map((eq) => {
                const risk = getRiskLevel(eq.riskScore);
                return (
                  <tr key={eq.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900">{eq.name}</td>
                    <td className="px-4 py-3 text-gray-600">{eq.client}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{eq.age}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{eq.lastRepair}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              eq.riskScore >= 70
                                ? 'bg-red-500'
                                : eq.riskScore >= 50
                                ? 'bg-orange-500'
                                : 'bg-yellow-400'
                            }`}
                            style={{ width: `${eq.riskScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-700 w-8 text-right">
                          {eq.riskScore}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={risk.variant}>{risk.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => handleScheduleMaintenance(eq.id, eq.name)}
                      >
                        <Icon name="Calendar" size={12} className="mr-1" />
                        Запланировать ТО
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI прогноз отказов */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Brain" size={20} className="text-purple-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Прогноз отказов — ИИ-анализ</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Модель на основе данных датчиков, истории ремонтов и показателей наработки
              </p>
            </div>
          </div>
          <Button
            variant="default"
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={handleScheduleAll}
          >
            <Icon name="CalendarPlus" size={14} className="mr-1.5" />
            Запланировать всё
          </Button>
        </div>

        <div className="p-5 grid grid-cols-3 gap-4">
          {AI_PREDICTIONS.map((pred) => (
            <div
              key={pred.id}
              className={`rounded-xl border p-4 ${getUrgencyColor(pred.urgency)}`}
            >
              {/* Заголовок */}
              <div className="flex items-start gap-2 mb-3">
                <Icon
                  name="AlertCircle"
                  size={18}
                  className={`mt-0.5 flex-shrink-0 ${getUrgencyIconColor(pred.urgency)}`}
                />
                <p className="font-medium text-gray-900 text-sm leading-snug">{pred.equipment}</p>
              </div>

              {/* Вероятность */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500">Вероятность отказа</span>
                  <span
                    className={`text-sm font-bold ${
                      pred.urgency === 'critical'
                        ? 'text-red-600'
                        : pred.urgency === 'high'
                        ? 'text-orange-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {pred.probability}%
                  </span>
                </div>
                <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      pred.urgency === 'critical'
                        ? 'bg-red-500'
                        : pred.urgency === 'high'
                        ? 'bg-orange-500'
                        : 'bg-yellow-400'
                    }`}
                    style={{ width: `${pred.probability}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">в ближайшие {pred.horizon}</p>
              </div>

              {/* Детали */}
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">{pred.details}</p>

              {/* Рекомендация */}
              <div className="bg-white/70 rounded-lg px-3 py-2 mb-3">
                <p className="text-xs font-medium text-gray-700">
                  <Icon name="Lightbulb" size={11} className="inline mr-1 text-amber-500" />
                  {pred.recommendation}
                </p>
              </div>

              {/* Кнопка */}
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs bg-white/80"
                onClick={() => handleScheduleMaintenance(pred.id, pred.equipment)}
                disabled={scheduledIds.has(pred.id)}
              >
                {scheduledIds.has(pred.id) ? (
                  <>
                    <Icon name="CheckCircle" size={12} className="mr-1 text-green-600" />
                    Запланировано
                  </>
                ) : (
                  <>
                    <Icon name="Calendar" size={12} className="mr-1" />
                    Запланировать ТО
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReliabilityDashboardFull;
