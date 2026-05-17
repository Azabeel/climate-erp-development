import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  ComposedChart,
  Bar,
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
import { toast } from 'sonner';

// ─── Моковые данные ────────────────────────────────────────────────────────────

const REVENUE_PLAN_FACT = [
  { month: 'Июн', plan: 6200, fact: 5980 },
  { month: 'Июл', plan: 6000, fact: 5750 },
  { month: 'Авг', plan: 6400, fact: 6510 },
  { month: 'Сен', plan: 7000, fact: 7240 },
  { month: 'Окт', plan: 7500, fact: 7820 },
  { month: 'Ноя', plan: 8000, fact: 8150 },
  { month: 'Дек', plan: 7800, fact: 7430 },
  { month: 'Янв', plan: 7000, fact: 6890 },
  { month: 'Фев', plan: 7300, fact: 7510 },
  { month: 'Мар', plan: 8200, fact: 8340 },
  { month: 'Апр', plan: 8800, fact: 9010 },
  { month: 'Май', plan: 9500, fact: 8720 },
];

const REVENUE_BREAKDOWN = [
  { name: 'Ремонт', value: 42, color: '#3B82F6' },
  { name: 'ТО / ППР', value: 24, color: '#10B981' },
  { name: 'Монтаж', value: 18, color: '#8B5CF6' },
  { name: 'Гарантия', value: 9, color: '#F59E0B' },
  { name: 'Прочее', value: 7, color: '#6B7280' },
];

const TOP_ENGINEERS = [
  { name: 'Козлов М.В.', orders: 7, revenue: '₽ 48 200', sla: 100 },
  { name: 'Петров С.А.', orders: 6, revenue: '₽ 41 700', sla: 100 },
  { name: 'Иванов А.Н.', orders: 5, revenue: '₽ 37 500', sla: 80 },
  { name: 'Захаров Д.О.', orders: 5, revenue: '₽ 34 900', sla: 100 },
  { name: 'Смирнов Р.Е.', orders: 4, revenue: '₽ 29 600', sla: 75 },
];

const CRITICAL_EVENTS = [
  {
    id: 1,
    type: 'sla',
    text: 'Наряд WO-2026-000487 — SLA истекает через 40 мин',
    level: 'critical',
    action: 'Назначить',
  },
  {
    id: 2,
    type: 'payment',
    text: 'Дебиторка ООО "Арктик Климат" просрочена на 18 дней (₽ 214 000)',
    level: 'warning',
    action: 'Позвонить',
  },
  {
    id: 3,
    type: 'stock',
    text: 'Остаток R-410A на складе < 5 кг — критический минимум',
    level: 'warning',
    action: 'Заказать',
  },
  {
    id: 4,
    type: 'engineer',
    text: 'Инженер Захаров Д. не вышел на связь более 2 часов',
    level: 'critical',
    action: 'Связаться',
  },
  {
    id: 5,
    type: 'plan',
    text: 'План продаж за май выполнен на 91.8% — отставание 3 дня',
    level: 'info',
    action: 'Отчёт',
  },
];

const SALES_FUNNEL = [
  { stage: 'Лиды', count: 87, amount: '₽ 3 480 000', icon: 'Users' },
  { stage: 'Квалификация', count: 54, amount: '₽ 2 160 000', icon: 'Filter' },
  { stage: 'КП отправлено', count: 31, amount: '₽ 1 550 000', icon: 'FileText' },
  { stage: 'Переговоры', count: 18, amount: '₽ 900 000', icon: 'MessageSquare' },
  { stage: 'Закрыто ✓', count: 9, amount: '₽ 520 000', icon: 'CheckCircle' },
];

// ─── Вспомогательные компоненты ────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: string;
  sub: string;
  icon: string;
  iconColor: string;
  bgColor: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  progress?: number;
}

const KpiCard = ({
  title,
  value,
  sub,
  icon,
  iconColor,
  bgColor,
  trend,
  trendLabel,
  progress,
}: KpiCardProps) => {
  const trendIcon =
    trend === 'up' ? 'TrendingUp' : trend === 'down' ? 'TrendingDown' : 'Minus';
  const trendColor =
    trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-gray-400';

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className={`p-2 rounded-lg ${bgColor}`}>
            <Icon name={icon as any} size={20} className={iconColor} />
          </div>
          {trendLabel && (
            <span className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
              <Icon name={trendIcon as any} size={12} />
              {trendLabel}
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
        {progress !== undefined && (
          <div className="mt-2">
            <Progress value={progress} className="h-1.5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface CriticalEventProps {
  event: (typeof CRITICAL_EVENTS)[0];
}

const CriticalEvent = ({ event }: CriticalEventProps) => {
  const levelConfig = {
    critical: { bg: 'bg-red-50 border-red-200', badge: 'destructive' as const, dot: 'bg-red-500' },
    warning: { bg: 'bg-amber-50 border-amber-200', badge: 'secondary' as const, dot: 'bg-amber-500' },
    info: { bg: 'bg-blue-50 border-blue-200', badge: 'secondary' as const, dot: 'bg-blue-400' },
  };
  const cfg = levelConfig[event.level as keyof typeof levelConfig];

  return (
    <div className={`flex items-start gap-3 p-2.5 rounded-lg border ${cfg.bg}`}>
      <span className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
      <p className="text-xs text-gray-700 flex-1 leading-relaxed">{event.text}</p>
      <Button
        variant="outline"
        size="sm"
        className="h-6 text-xs px-2 flex-shrink-0"
        onClick={() => toast.info(`Действие: ${event.action}`)}
      >
        {event.action}
      </Button>
    </div>
  );
};

// ─── Основной компонент ────────────────────────────────────────────────────────

const DashboardManagerFull = () => {
  const [greeting] = useState(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Доброе утро';
    if (h < 18) return 'Добрый день';
    return 'Добрый вечер';
  });

  const today = new Date().toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const quickActions = [
    { label: 'Создать наряд', icon: 'PlusCircle', color: 'text-blue-600' },
    { label: 'Добавить клиента', icon: 'UserPlus', color: 'text-green-600' },
    { label: 'Отчёт за день', icon: 'BarChart2', color: 'text-purple-600' },
    { label: 'Чат с командой', icon: 'MessageSquare', color: 'text-orange-600' },
  ];

  const customTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {typeof p.value === 'number' && p.value > 100 ? `₽ ${p.value} тыс.` : p.value}
          </p>
        ))}
      </div>
    );
  };

  const pieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.08) return null;
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 min-h-screen">

      {/* ── Приветствие ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-4 text-white shadow">
        <div>
          <h1 className="text-xl font-bold">{greeting}, Александр!</h1>
          <p className="text-blue-200 text-sm capitalize mt-0.5">{today}</p>
          <div className="flex items-center gap-2 mt-1">
            <Icon name="Cloud" size={16} className="text-blue-300" />
            <span className="text-sm text-blue-100">+18 °C · Москва · Переменная облачность</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {quickActions.map((a) => (
            <Button
              key={a.label}
              variant="secondary"
              size="sm"
              className="bg-white/15 hover:bg-white/25 text-white border-white/30 text-xs h-8"
              onClick={() => toast.success(`${a.label}: действие выполнено`)}
            >
              <Icon name={a.icon as any} size={13} className="mr-1" />
              {a.label}
            </Button>
          ))}
        </div>
      </div>

      {/* ── KPI строка 1: оперативные ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          title="Нарядов сегодня"
          value="24"
          sub="план 31 · выполнено 77%"
          icon="ClipboardList"
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
          trend="up"
          trendLabel="+3 к вчера"
          progress={77}
        />
        <KpiCard
          title="Выручка сегодня"
          value="₽ 284 500"
          sub="план ₽ 316 000 · 90%"
          icon="Banknote"
          iconColor="text-emerald-600"
          bgColor="bg-emerald-50"
          trend="up"
          trendLabel="+11% к ср."
          progress={90}
        />
        <KpiCard
          title="Инженеров на выезде"
          value="12 / 16"
          sub="4 — в офисе или на паузе"
          icon="UserCheck"
          iconColor="text-violet-600"
          bgColor="bg-violet-50"
          trend="neutral"
          trendLabel="норма"
        />
        <KpiCard
          title="SLA сегодня"
          value="94%"
          sub="2 наряда под угрозой"
          icon="Target"
          iconColor="text-amber-600"
          bgColor="bg-amber-50"
          trend="down"
          trendLabel="-2% vs норма"
          progress={94}
        />
      </div>

      {/* ── KPI строка 2: финансовые ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          title="Выручка / май"
          value="₽ 8 720 000"
          sub={`план ₽ 9 500 000 · 91.8%`}
          icon="TrendingUp"
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
          trend="up"
          trendLabel="+18% г/г"
          progress={92}
        />
        <KpiCard
          title="Маржа / май"
          value="34.0%"
          sub="цель 35% · −1 п.п."
          icon="PieChart"
          iconColor="text-green-600"
          bgColor="bg-green-50"
          trend="neutral"
          trendLabel="±0.3%"
          progress={97}
        />
        <KpiCard
          title="Дебиторка"
          value="₽ 1 340 000"
          sub="просрочено ₽ 214 000"
          icon="AlertCircle"
          iconColor="text-red-500"
          bgColor="bg-red-50"
          trend="down"
          trendLabel="+₽ 87к нед."
        />
        <KpiCard
          title="Новых клиентов / май"
          value="23"
          sub="план 28 · 82%"
          icon="UserPlus"
          iconColor="text-indigo-600"
          bgColor="bg-indigo-50"
          trend="up"
          trendLabel="+5 vs апр."
          progress={82}
        />
      </div>

      {/* ── Центральный блок: графики ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ComposedChart — план vs факт выручки */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2 px-4 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-700">
                Выручка: план vs факт (12 мес.), тыс. ₽
              </CardTitle>
              <Badge variant="secondary" className="text-xs">Июн 2025 — Май 2026</Badge>
            </div>
          </CardHeader>
          <CardContent className="px-2 pb-3">
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={REVENUE_PLAN_FACT} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="к" width={38} />
                <Tooltip content={customTooltip} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="plan" name="План" fill="#BFDBFE" radius={[3, 3, 0, 0]} barSize={14} />
                <Bar dataKey="fact" name="Факт" fill="#3B82F6" radius={[3, 3, 0, 0]} barSize={14} />
                <Line
                  type="monotone"
                  dataKey="fact"
                  name="Тренд"
                  stroke="#1D4ED8"
                  strokeWidth={2}
                  dot={false}
                  legendType="none"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* PieChart — структура выручки */}
        <Card>
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-semibold text-gray-700">
              Структура выручки
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-3">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={REVENUE_BREAKDOWN}
                  cx="50%"
                  cy="50%"
                  outerRadius={72}
                  dataKey="value"
                  labelLine={false}
                  label={pieLabel}
                >
                  {REVENUE_BREAKDOWN.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`, 'Доля']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-1">
              {REVENUE_BREAKDOWN.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-medium text-gray-800">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Нижний блок: три колонки ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Топ-5 инженеров */}
        <Card>
          <CardHeader className="pb-2 px-4 pt-4">
            <div className="flex items-center gap-2">
              <Icon name="Award" size={15} className="text-amber-500" />
              <CardTitle className="text-sm font-semibold text-gray-700">Топ инженеров сегодня</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="space-y-2">
              {TOP_ENGINEERS.map((eng, i) => (
                <div
                  key={eng.name}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span
                    className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                      i === 0
                        ? 'bg-amber-100 text-amber-700'
                        : i === 1
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-orange-50 text-orange-600'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{eng.name}</p>
                    <p className="text-[10px] text-gray-400">{eng.orders} нарядов · SLA {eng.sla}%</p>
                  </div>
                  <span className="text-xs font-semibold text-green-700 flex-shrink-0">{eng.revenue}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Критические события */}
        <Card>
          <CardHeader className="pb-2 px-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="AlertTriangle" size={15} className="text-red-500" />
                <CardTitle className="text-sm font-semibold text-gray-700">Критические события</CardTitle>
              </div>
              <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
                {CRITICAL_EVENTS.filter((e) => e.level === 'critical').length} крит.
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3 space-y-2">
            {CRITICAL_EVENTS.map((event) => (
              <CriticalEvent key={event.id} event={event} />
            ))}
          </CardContent>
        </Card>

        {/* Воронка продаж */}
        <Card>
          <CardHeader className="pb-2 px-4 pt-4">
            <div className="flex items-center gap-2">
              <Icon name="Filter" size={15} className="text-violet-500" />
              <CardTitle className="text-sm font-semibold text-gray-700">Воронка продаж / май</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="space-y-1.5">
              {SALES_FUNNEL.map((stage, i) => {
                const widthPct = Math.round(100 - i * 16);
                const isLast = i === SALES_FUNNEL.length - 1;
                return (
                  <div key={stage.stage}>
                    <div
                      className={`flex items-center justify-between px-3 py-2 rounded-md text-xs ${
                        isLast ? 'bg-green-50 border border-green-200' : 'bg-blue-50'
                      }`}
                      style={{ width: `${widthPct}%`, minWidth: '100%' }}
                    >
                      <div className="flex items-center gap-2">
                        <Icon
                          name={stage.icon as any}
                          size={12}
                          className={isLast ? 'text-green-600' : 'text-blue-500'}
                        />
                        <span className={`font-medium ${isLast ? 'text-green-700' : 'text-blue-700'}`}>
                          {stage.stage}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-800">{stage.count}</span>
                        <span className="text-gray-500 hidden sm:inline">{stage.amount}</span>
                      </div>
                    </div>
                    {i < SALES_FUNNEL.length - 1 && (
                      <div className="flex justify-center my-0.5">
                        <Icon name="ChevronDown" size={12} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Конверсия</span>
              <span className="font-semibold text-green-700">
                {((SALES_FUNNEL[4].count / SALES_FUNNEL[0].count) * 100).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardManagerFull;
