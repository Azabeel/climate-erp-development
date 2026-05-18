import { useState, useMemo } from 'react';
import {
  ComposedChart, Bar, Line, BarChart, PieChart, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, ZAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt  = (n: number) => n.toLocaleString('ru-RU');
const fmtK = (n: number) => `${(n / 1000).toFixed(0)} тыс.`;
const pct  = (n: number) => `${n.toFixed(1)}%`;

const PERIOD_LIST = [
  'Июн 2025', 'Июл 2025', 'Авг 2025', 'Сен 2025', 'Окт 2025', 'Ноя 2025',
  'Дек 2025', 'Янв 2026', 'Фев 2026', 'Мар 2026', 'Апр 2026', 'Май 2026',
];
const PERIOD_SHORT = [
  'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя',
  'Дек', 'Янв', 'Фев', 'Мар', 'Апр', 'Май',
];

const CURRENT_IDX = 11; // май 2026

// ─── Static data ──────────────────────────────────────────────────────────────

const REVENUE_ARR   = [2140,2380,2650,2510,2720,2847,2190,2480,2760,3020,3280,3470];
const COST_ARR      = [1510,1670,1800,1710,1850,1923,1520,1690,1820,1960,2140,2260];
const MARGIN_ARR    = REVENUE_ARR.map((r, i) => r - COST_ARR[i]);
const MARGIN_PCT_ARR= REVENUE_ARR.map((r, i) => +((MARGIN_ARR[i] / r) * 100).toFixed(1));

const chartData = PERIOD_SHORT.map((m, i) => ({
  month:     m,
  revenue:   REVENUE_ARR[i] * 1000,
  cost:      COST_ARR[i] * 1000,
  margin:    MARGIN_ARR[i] * 1000,
  marginPct: MARGIN_PCT_ARR[i],
}));

// KPI май 2026
const KPI = {
  revenue:       3_470_000,
  revenuePlan:   3_200_000,
  margin:        1_210_000,
  marginPlan:    1_120_000,
  marginPct:     34.9,
  marginPctPlan: 35.0,
  orders:        147,
  avgMargin:     8_231,
};

// Pie — структура выручки
const PIE_DATA = [
  { name: 'Ремонт',   value: 32, color: '#f59e0b' },
  { name: 'ТО',       value: 28, color: '#6366f1' },
  { name: 'Монтаж',   value: 23, color: '#10b981' },
  { name: 'ЗИП',      value: 11, color: '#ec4899' },
  { name: 'Гарантия', value:  6, color: '#94a3b8' },
];

// Топ-10 нарядов
const TOP_ORDERS = [
  { num: 'WO-2026-004812', client: 'ГК «Альфа-Сервис»',     type: 'Монтаж',   rev: 248_000, cost: 141_000, margin: 107_000, marginPct: 43.1 },
  { num: 'WO-2026-004790', client: 'ТЦ «Меркурий»',         type: 'ТО',       rev: 185_000, cost: 108_000, margin:  77_000, marginPct: 41.6 },
  { num: 'WO-2026-004835', client: 'ООО «Лидер Плюс»',      type: 'Монтаж',   rev: 320_000, cost: 192_000, margin: 128_000, marginPct: 40.0 },
  { num: 'WO-2026-004801', client: 'Иванов П.С.',            type: 'Ремонт',   rev:  94_000, cost:  57_000, margin:  37_000, marginPct: 39.4 },
  { num: 'WO-2026-004778', client: 'ЖК «Северный»',         type: 'ТО',       rev: 162_000, cost: 100_000, margin:  62_000, marginPct: 38.3 },
  { num: 'WO-2026-004856', client: 'АО «ТехноПарк»',        type: 'Монтаж',   rev: 275_000, cost: 171_000, margin: 104_000, marginPct: 37.8 },
  { num: 'WO-2026-004803', client: 'Сидоров А.К.',           type: 'Ремонт',   rev:  78_000, cost:  49_000, margin:  29_000, marginPct: 37.2 },
  { num: 'WO-2026-004822', client: 'ООО «СтройГрупп»',      type: 'ТО',       rev: 141_000, cost:  89_000, margin:  52_000, marginPct: 36.9 },
  { num: 'WO-2026-004799', client: 'ГК «Риэлти Про»',       type: 'Монтаж',   rev: 198_000, cost: 126_000, margin:  72_000, marginPct: 36.4 },
  { num: 'WO-2026-004841', client: 'Кузнецов В.Ф.',          type: 'Ремонт',   rev:  65_000, cost:  42_000, margin:  23_000, marginPct: 35.4 },
];

// По типам работ
const TYPE_DATA = [
  { type: 'Монтаж',   orders: 34, revenue: 2_140_000, cost: 1_220_000, margin: 920_000, marginPct: 43.0 },
  { type: 'ТО',       orders: 41, revenue: 1_820_000, cost: 1_085_000, margin: 735_000, marginPct: 40.4 },
  { type: 'Ремонт',   orders: 47, revenue: 2_080_000, cost: 1_310_000, margin: 770_000, marginPct: 37.0 },
  { type: 'ЗИП',      orders: 16, revenue:  720_000,  cost:  530_000,  margin: 190_000, marginPct: 26.4 },
  { type: 'Гарантия', orders:  9, revenue:  390_000,  cost:  345_000,  margin:  45_000, marginPct: 11.5 },
];

const typeBarData = TYPE_DATA.map(d => ({ type: d.type, marginPct: d.marginPct }));

// По инженерам
const ENG_DATA = [
  { name: 'Петров А.В.',   orders: 21, revenue: 720_000, margin: 265_000, marginPct: 36.8, top3: ['Монтаж 42%', 'ТО 38%', 'Ремонт 35%'] },
  { name: 'Иванов К.П.',   orders: 19, revenue: 660_000, margin: 237_000, marginPct: 35.9, top3: ['Монтаж 44%', 'ТО 36%', 'ЗИП 28%'] },
  { name: 'Сидоров М.Н.',  orders: 18, revenue: 610_000, margin: 213_000, marginPct: 34.9, top3: ['Монтаж 40%', 'Ремонт 36%', 'ТО 35%'] },
  { name: 'Козлов Р.Е.',   orders: 17, revenue: 570_000, margin: 194_000, marginPct: 34.0, top3: ['ТО 39%', 'Монтаж 38%', 'Ремонт 32%'] },
  { name: 'Новиков Д.С.',  orders: 16, revenue: 530_000, margin: 179_000, marginPct: 33.8, top3: ['Монтаж 39%', 'ТО 35%', 'Ремонт 31%'] },
  { name: 'Морозов В.А.',  orders: 15, revenue: 490_000, margin: 161_000, marginPct: 32.9, top3: ['ТО 37%', 'Ремонт 34%', 'Монтаж 32%'] },
  { name: 'Алексеев И.О.', orders: 14, revenue: 440_000, margin: 141_000, marginPct: 32.0, top3: ['ТО 36%', 'Монтаж 34%', 'ЗИП 26%'] },
  { name: 'Громов П.Г.',   orders: 12, revenue: 380_000, margin: 117_000, marginPct: 30.8, top3: ['Ремонт 33%', 'ТО 31%', 'Монтаж 30%'] },
  { name: 'Барков С.Ю.',   orders: 11, revenue: 340_000, margin:  99_000, marginPct: 29.1, top3: ['Ремонт 31%', 'ТО 30%', 'ЗИП 25%'] },
  { name: 'Волков Е.И.',   orders:  9, revenue: 295_000, margin:  82_000, marginPct: 27.8, top3: ['ТО 29%', 'Ремонт 28%', 'ЗИП 24%'] },
  { name: 'Смирнов К.А.',  orders:  8, revenue: 260_000, margin:  67_000, marginPct: 25.8, top3: ['Гарантия 18%', 'Ремонт 29%', 'ТО 27%'] },
  { name: 'Орлов Т.В.',    orders:  7, revenue: 220_000, margin:  52_000, marginPct: 23.6, top3: ['Гарантия 15%', 'Ремонт 26%', 'ТО 25%'] },
];

const engBarData = ENG_DATA.map(d => ({ name: d.name.split(' ')[0], marginPct: d.marginPct }));

// Scatter — все наряды мая (сокращённый набор)
const ORDER_TYPE_COLOR: Record<string, string> = {
  Монтаж:   '#10b981',
  ТО:       '#6366f1',
  Ремонт:   '#f59e0b',
  ЗИП:      '#ec4899',
  Гарантия: '#94a3b8',
};

const ALL_ORDERS = [
  { num: 'WO-2026-004812', client: 'ГК «Альфа-Сервис»',       type: 'Монтаж',   engineer: 'Петров А.В.',   rev: 248_000, cost: 141_000, margin: 107_000, marginPct: 43.1 },
  { num: 'WO-2026-004790', client: 'ТЦ «Меркурий»',           type: 'ТО',       engineer: 'Иванов К.П.',   rev: 185_000, cost: 108_000, margin:  77_000, marginPct: 41.6 },
  { num: 'WO-2026-004835', client: 'ООО «Лидер Плюс»',        type: 'Монтаж',   engineer: 'Иванов К.П.',   rev: 320_000, cost: 192_000, margin: 128_000, marginPct: 40.0 },
  { num: 'WO-2026-004801', client: 'Иванов П.С.',              type: 'Ремонт',   engineer: 'Сидоров М.Н.',  rev:  94_000, cost:  57_000, margin:  37_000, marginPct: 39.4 },
  { num: 'WO-2026-004778', client: 'ЖК «Северный»',           type: 'ТО',       engineer: 'Петров А.В.',   rev: 162_000, cost: 100_000, margin:  62_000, marginPct: 38.3 },
  { num: 'WO-2026-004856', client: 'АО «ТехноПарк»',          type: 'Монтаж',   engineer: 'Козлов Р.Е.',   rev: 275_000, cost: 171_000, margin: 104_000, marginPct: 37.8 },
  { num: 'WO-2026-004803', client: 'Сидоров А.К.',             type: 'Ремонт',   engineer: 'Новиков Д.С.',  rev:  78_000, cost:  49_000, margin:  29_000, marginPct: 37.2 },
  { num: 'WO-2026-004822', client: 'ООО «СтройГрупп»',        type: 'ТО',       engineer: 'Морозов В.А.',  rev: 141_000, cost:  89_000, margin:  52_000, marginPct: 36.9 },
  { num: 'WO-2026-004799', client: 'ГК «Риэлти Про»',         type: 'Монтаж',   engineer: 'Петров А.В.',   rev: 198_000, cost: 126_000, margin:  72_000, marginPct: 36.4 },
  { num: 'WO-2026-004841', client: 'Кузнецов В.Ф.',            type: 'Ремонт',   engineer: 'Алексеев И.О.', rev:  65_000, cost:  42_000, margin:  23_000, marginPct: 35.4 },
  { num: 'WO-2026-004867', client: 'ИП Смирнова О.Е.',         type: 'ТО',       engineer: 'Сидоров М.Н.',  rev:  52_000, cost:  34_000, margin:  18_000, marginPct: 34.6 },
  { num: 'WO-2026-004871', client: 'ООО «Криптон»',           type: 'Монтаж',   engineer: 'Иванов К.П.',   rev: 410_000, cost: 271_000, margin: 139_000, marginPct: 33.9 },
  { num: 'WO-2026-004880', client: 'Петрова Н.А.',             type: 'Ремонт',   engineer: 'Громов П.Г.',   rev:  48_000, cost:  32_000, margin:  16_000, marginPct: 33.3 },
  { num: 'WO-2026-004893', client: 'АО «Прогресс»',           type: 'ТО',       engineer: 'Козлов Р.Е.',   rev: 218_000, cost: 147_000, margin:  71_000, marginPct: 32.6 },
  { num: 'WO-2026-004905', client: 'ГК «СитиМолл»',           type: 'Монтаж',   engineer: 'Новиков Д.С.',  rev: 185_000, cost: 126_000, margin:  59_000, marginPct: 31.9 },
  { num: 'WO-2026-004912', client: 'Жилой комплекс «Радуга»', type: 'ТО',       engineer: 'Морозов В.А.',  rev: 124_000, cost:  85_000, margin:  39_000, marginPct: 31.5 },
  { num: 'WO-2026-004918', client: 'ИП Николаев Р.К.',         type: 'ЗИП',      engineer: 'Барков С.Ю.',   rev:  38_000, cost:  27_000, margin:  11_000, marginPct: 28.9 },
  { num: 'WO-2026-004924', client: 'ООО «МегаСтрой»',         type: 'ЗИП',      engineer: 'Алексеев И.О.', rev:  61_000, cost:  44_000, margin:  17_000, marginPct: 27.9 },
  { num: 'WO-2026-004931', client: 'Захаров Д.П.',             type: 'Ремонт',   engineer: 'Волков Е.И.',   rev:  42_000, cost:  31_000, margin:  11_000, marginPct: 26.2 },
  { num: 'WO-2026-004937', client: 'ООО «АвтоКлимат»',        type: 'ЗИП',      engineer: 'Смирнов К.А.',  rev:  55_000, cost:  41_000, margin:  14_000, marginPct: 25.5 },
  { num: 'WO-2026-004942', client: 'Торговый дом «Весна»',    type: 'Гарантия', engineer: 'Орлов Т.В.',    rev:  74_000, cost:  64_000, margin:  10_000, marginPct: 13.5 },
  { num: 'WO-2026-004948', client: 'ГК «Техноком»',           type: 'Гарантия', engineer: 'Смирнов К.А.',  rev:  58_000, cost:  51_000, margin:   7_000, marginPct: 12.1 },
  { num: 'WO-2026-004953', client: 'ИП Лебедев С.А.',          type: 'Гарантия', engineer: 'Орлов Т.В.',    rev:  39_000, cost:  35_000, margin:   4_000, marginPct: 10.3 },
];

const ENGINEERS_LIST = ['Все', ...Array.from(new Set(ALL_ORDERS.map(o => o.engineer)))];
const TYPES_LIST     = ['Все', ...Array.from(new Set(ALL_ORDERS.map(o => o.type)))];

// ─── Sub-components ───────────────────────────────────────────────────────────

function MarginBadge({ v }: { v: number }) {
  const color =
    v >= 40 ? 'bg-emerald-100 text-emerald-800' :
    v >= 35 ? 'bg-green-100 text-green-700' :
    v >= 25 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700';
  return <Badge className={`${color} font-semibold`}>{pct(v)}</Badge>;
}

function KpiCard({
  label, value, sub, trend, progress, target,
}: {
  label: string; value: string; sub?: string;
  trend?: 'up' | 'down'; progress?: number; target?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <p className="text-xs text-slate-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        {sub && <p className="text-sm text-slate-500 mt-0.5">{sub}</p>}
        {target && <p className="text-xs text-slate-400 mt-1">План: {target}</p>}
        {progress !== undefined && (
          <Progress value={progress} className="h-1.5 mt-2" />
        )}
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
            <Icon name={trend === 'up' ? 'TrendingUp' : 'TrendingDown'} size={13} />
            {trend === 'up' ? '+2.1% к апрелю' : '−0.7% к апрелю'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MarginalityReportFull() {
  const [periodIdx, setPeriodIdx] = useState(CURRENT_IDX);
  const [sortField, setSortField] = useState<'rev' | 'marginPct' | 'margin'>('marginPct');
  const [sortDir,   setSortDir]   = useState<'asc' | 'desc'>('desc');
  const [engFilter, setEngFilter] = useState('Все');
  const [typeFilter, setTypeFilter] = useState('Все');

  const period = PERIOD_LIST[periodIdx];

  const filteredOrders = useMemo(() => {
    let list = [...ALL_ORDERS];
    if (engFilter  !== 'Все') list = list.filter(o => o.engineer === engFilter);
    if (typeFilter !== 'Все') list = list.filter(o => o.type === typeFilter);
    return list.sort((a, b) => {
      const av = a[sortField], bv = b[sortField];
      return sortDir === 'desc' ? bv - av : av - bv;
    });
  }, [engFilter, typeFilter, sortField, sortDir]);

  const scatterPoints = filteredOrders.map(o => ({
    x: o.rev,
    y: o.marginPct,
    z: o.margin,
    type: o.type,
    num: o.num,
  }));

  const toggleSort = (f: typeof sortField) => {
    if (f === sortField) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortField(f); setSortDir('desc'); }
  };

  const handleExport = () => {
    toast.success('Экспорт начат', {
      description: `Файл marginality_${period.replace(' ', '_')}.xlsx формируется…`,
    });
  };

  const revPlan    = KPI.revenuePlan;
  const revFact    = KPI.revenue;
  const marginPlan = KPI.marginPlan;
  const marginFact = KPI.margin;

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Отчёт по маржинальности</h1>
          <p className="text-sm text-slate-500 mt-0.5">Анализ выручки, себестоимости и маржи по всем разрезам</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline" size="icon"
            disabled={periodIdx === 0}
            onClick={() => setPeriodIdx(i => i - 1)}
          >
            <Icon name="ChevronLeft" size={16} />
          </Button>
          <span className="text-sm font-semibold text-slate-700 w-24 text-center">{period}</span>
          <Button
            variant="outline" size="icon"
            disabled={periodIdx === PERIOD_LIST.length - 1}
            onClick={() => setPeriodIdx(i => i + 1)}
          >
            <Icon name="ChevronRight" size={16} />
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="ml-2">
            <Icon name="Download" size={14} className="mr-1.5" />
            Экспорт
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Выручка"
          value={`${fmt(revFact)} ₽`}
          sub={`${((revFact / revPlan - 1) * 100).toFixed(1)}% к плану`}
          target={`${fmt(revPlan)} ₽`}
          progress={Math.min((revFact / revPlan) * 100, 100)}
          trend="up"
        />
        <KpiCard
          label="Маржа ₽"
          value={`${fmt(marginFact)} ₽`}
          sub={`${((marginFact / marginPlan - 1) * 100).toFixed(1)}% к плану`}
          target={`${fmt(marginPlan)} ₽`}
          progress={Math.min((marginFact / marginPlan) * 100, 100)}
          trend="up"
        />
        <KpiCard
          label="Маржа %"
          value={pct(KPI.marginPct)}
          sub="Целевая: 35,0%"
          target="35,0%"
          progress={(KPI.marginPct / 35) * 100}
          trend="down"
        />
        <KpiCard
          label="Нарядов / Ср. маржа"
          value={`${KPI.orders} нар.`}
          sub={`Ср. маржа: ${fmt(KPI.avgMargin)} ₽`}
          trend="up"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="summary">
        <TabsList className="mb-4">
          <TabsTrigger value="summary">Сводка</TabsTrigger>
          <TabsTrigger value="types">По типам работ</TabsTrigger>
          <TabsTrigger value="engineers">По инженерам</TabsTrigger>
          <TabsTrigger value="details">Детали</TabsTrigger>
        </TabsList>

        {/* ── TAB: Сводка ── */}
        <TabsContent value="summary" className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-700">
                Выручка, маржа ₽ и маржа % — 12 месяцев
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={chartData} margin={{ top: 8, right: 30, bottom: 0, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tickFormatter={fmtK} tick={{ fontSize: 11 }} width={72} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={v => `${v}%`} domain={[0, 50]} tick={{ fontSize: 11 }} width={42} />
                  <Tooltip
                    formatter={(val: number, name: string) =>
                      name === 'Маржа %' ? [`${val}%`, name] : [`${fmt(val)} ₽`, name]
                    }
                  />
                  <Legend />
                  <ReferenceLine yAxisId="right" y={35} stroke="#ef4444" strokeDasharray="5 3" label={{ value: 'Цель 35%', position: 'right', fontSize: 11, fill: '#ef4444' }} />
                  <Bar yAxisId="left" dataKey="revenue" name="Выручка ₽" fill="#6366f1" fillOpacity={0.85} radius={[3,3,0,0]} />
                  <Bar yAxisId="left" dataKey="margin"  name="Маржа ₽"   fill="#10b981" fillOpacity={0.85} radius={[3,3,0,0]} />
                  <Line yAxisId="right" type="monotone" dataKey="marginPct" name="Маржа %" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Pie */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-slate-700">Структура выручки по типам, %</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={PIE_DATA} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name} ${value}%`} labelLine={false}>
                      {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v}%`, '']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {PIE_DATA.map(d => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                      <span className="w-3 h-3 rounded-sm inline-block" style={{ background: d.color }} />
                      {d.name} — {d.value}%
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top-10 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-slate-700">Топ-10 нарядов по марже</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Наряд</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead className="text-right">Выручка</TableHead>
                      <TableHead className="text-right pr-4">Маржа</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {TOP_ORDERS.map(o => (
                      <TableRow key={o.num}>
                        <TableCell className="pl-4">
                          <p className="font-mono text-xs text-slate-700">{o.num}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[130px]">{o.client}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{o.type}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm">{fmt(o.rev)} ₽</TableCell>
                        <TableCell className="text-right pr-4">
                          <MarginBadge v={o.marginPct} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── TAB: По типам работ ── */}
        <TabsContent value="types" className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-700">Маржа % по типам работ</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={typeBarData} margin={{ top: 8, right: 20, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="type" tick={{ fontSize: 13 }} />
                  <YAxis tickFormatter={v => `${v}%`} domain={[0, 50]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v}%`, 'Маржа %']} />
                  <ReferenceLine y={35} stroke="#ef4444" strokeDasharray="5 3" label={{ value: 'Цель 35%', position: 'right', fontSize: 11, fill: '#ef4444' }} />
                  <Bar dataKey="marginPct" name="Маржа %" radius={[4,4,0,0]}>
                    {typeBarData.map((entry, i) => (
                      <Cell key={i} fill={entry.marginPct >= 35 ? '#10b981' : entry.marginPct >= 25 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Тип работ</TableHead>
                    <TableHead className="text-right">Нарядов</TableHead>
                    <TableHead className="text-right">Выручка ₽</TableHead>
                    <TableHead className="text-right">Себест. ₽</TableHead>
                    <TableHead className="text-right">Маржа ₽</TableHead>
                    <TableHead className="text-right pr-4">Маржа %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {TYPE_DATA.sort((a, b) => b.marginPct - a.marginPct).map(r => (
                    <TableRow key={r.type}>
                      <TableCell className="pl-4 font-medium">{r.type}</TableCell>
                      <TableCell className="text-right text-sm">{r.orders}</TableCell>
                      <TableCell className="text-right text-sm">{fmt(r.revenue)}</TableCell>
                      <TableCell className="text-right text-sm text-slate-500">{fmt(r.cost)}</TableCell>
                      <TableCell className="text-right text-sm font-semibold">{fmt(r.margin)}</TableCell>
                      <TableCell className="text-right pr-4"><MarginBadge v={r.marginPct} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="pt-4 pb-4 flex gap-3">
              <Icon name="TrendingUp" size={20} className="text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">Самый прибыльный тип: Монтаж (43,0%)</p>
                <p className="text-xs text-emerald-700 mt-1">
                  Монтажные работы показывают наивысшую маржинальность за счёт
                  высокой доли инженерного труда в выручке и низкой удельной стоимости материалов.
                  ТО занимает второе место (40,4%) благодаря повторяемости и оптимизированным маршрутам.
                  Гарантийные работы — убыточный сегмент (11,5%): рекомендуется пересмотреть условия
                  гарантийных договоров либо увеличить нормо-час компенсации.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB: По инженерам ── */}
        <TabsContent value="engineers" className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-700">Маржа % по инженерам</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={engBarData}
                  layout="vertical"
                  margin={{ top: 4, right: 40, bottom: 0, left: 90 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" tickFormatter={v => `${v}%`} domain={[0, 50]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={88} />
                  <Tooltip formatter={(v: number) => [`${v}%`, 'Маржа %']} />
                  <ReferenceLine x={35} stroke="#ef4444" strokeDasharray="5 3" label={{ value: '35%', position: 'right', fontSize: 11, fill: '#ef4444' }} />
                  <Bar dataKey="marginPct" name="Маржа %" radius={[0,4,4,0]}>
                    {engBarData.map((entry, i) => (
                      <Cell key={i} fill={entry.marginPct >= 35 ? '#10b981' : entry.marginPct >= 28 ? '#6366f1' : '#f59e0b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Инженер</TableHead>
                    <TableHead className="text-right">Нарядов</TableHead>
                    <TableHead className="text-right">Выручка ₽</TableHead>
                    <TableHead className="text-right">Маржа %</TableHead>
                    <TableHead className="pr-4">Топ-3 услуги</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ENG_DATA.map(e => (
                    <TableRow key={e.name}>
                      <TableCell className="pl-4 font-medium text-sm">{e.name}</TableCell>
                      <TableCell className="text-right text-sm">{e.orders}</TableCell>
                      <TableCell className="text-right text-sm">{fmt(e.revenue)}</TableCell>
                      <TableCell className="text-right"><MarginBadge v={e.marginPct} /></TableCell>
                      <TableCell className="pr-4">
                        <div className="flex flex-wrap gap-1">
                          {e.top3.map(s => (
                            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB: Детали ── */}
        <TabsContent value="details" className="space-y-5">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Icon name="UserCheck" size={15} className="text-slate-400" />
              <Select value={engFilter} onValueChange={setEngFilter}>
                <SelectTrigger className="w-44 h-8 text-sm">
                  <SelectValue placeholder="Инженер" />
                </SelectTrigger>
                <SelectContent>
                  {ENGINEERS_LIST.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Layers" size={15} className="text-slate-400" />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-36 h-8 text-sm">
                  <SelectValue placeholder="Тип" />
                </SelectTrigger>
                <SelectContent>
                  {TYPES_LIST.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" variant="outline" onClick={handleExport} className="ml-auto">
              <Icon name="FileSpreadsheet" size={14} className="mr-1.5" />
              Экспорт Excel
            </Button>
          </div>

          {/* Scatter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-700">
                Выручка vs Маржа % по нарядам
                <span className="ml-2 font-normal text-slate-400 text-xs">(размер точки = маржа ₽)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <ScatterChart margin={{ top: 8, right: 20, bottom: 0, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="x" name="Выручка" tickFormatter={fmtK} tick={{ fontSize: 11 }} label={{ value: 'Выручка, тыс. ₽', position: 'insideBottom', offset: -2, fontSize: 11 }} />
                  <YAxis dataKey="y" name="Маржа %" tickFormatter={v => `${v}%`} domain={[0, 50]} tick={{ fontSize: 11 }} />
                  <ZAxis dataKey="z" range={[40, 400]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ payload }) => {
                      if (!payload?.length) return null;
                      const d = payload[0].payload as typeof scatterPoints[0];
                      return (
                        <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow text-xs space-y-1">
                          <p className="font-mono font-semibold text-slate-700">{d.num}</p>
                          <p className="text-slate-500">{d.type}</p>
                          <p>Выручка: <strong>{fmt(d.x)} ₽</strong></p>
                          <p>Маржа: <strong>{pct(d.y)}</strong></p>
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine y={35} stroke="#ef4444" strokeDasharray="5 3" label={{ value: 'Цель 35%', position: 'right', fontSize: 10, fill: '#ef4444' }} />
                  {TYPES_LIST.filter(t => t !== 'Все').map(type => {
                    const pts = scatterPoints.filter(p => p.type === type);
                    return (
                      <Scatter
                        key={type}
                        name={type}
                        data={pts}
                        fill={ORDER_TYPE_COLOR[type] ?? '#94a3b8'}
                        fillOpacity={0.75}
                      />
                    );
                  })}
                  <Legend />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-700">
                Все наряды — {filteredOrders.length} записей
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Наряд / Клиент</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Инженер</TableHead>
                    <TableHead
                      className="text-right cursor-pointer hover:text-slate-800 select-none"
                      onClick={() => toggleSort('rev')}
                    >
                      <span className="inline-flex items-center gap-1">
                        Выручка ₽
                        <Icon name={sortField === 'rev' ? (sortDir === 'desc' ? 'ChevronDown' : 'ChevronUp') : 'ChevronsUpDown'} size={13} />
                      </span>
                    </TableHead>
                    <TableHead className="text-right">Себест. ₽</TableHead>
                    <TableHead
                      className="text-right cursor-pointer hover:text-slate-800 select-none"
                      onClick={() => toggleSort('margin')}
                    >
                      <span className="inline-flex items-center gap-1">
                        Маржа ₽
                        <Icon name={sortField === 'margin' ? (sortDir === 'desc' ? 'ChevronDown' : 'ChevronUp') : 'ChevronsUpDown'} size={13} />
                      </span>
                    </TableHead>
                    <TableHead
                      className="text-right pr-4 cursor-pointer hover:text-slate-800 select-none"
                      onClick={() => toggleSort('marginPct')}
                    >
                      <span className="inline-flex items-center gap-1">
                        Маржа %
                        <Icon name={sortField === 'marginPct' ? (sortDir === 'desc' ? 'ChevronDown' : 'ChevronUp') : 'ChevronsUpDown'} size={13} />
                      </span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map(o => (
                    <TableRow key={o.num}>
                      <TableCell className="pl-4">
                        <p className="font-mono text-xs text-slate-700">{o.num}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[160px]">{o.client}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs" style={{ borderColor: ORDER_TYPE_COLOR[o.type], color: ORDER_TYPE_COLOR[o.type] }}>
                          {o.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">{o.engineer}</TableCell>
                      <TableCell className="text-right text-sm">{fmt(o.rev)}</TableCell>
                      <TableCell className="text-right text-sm text-slate-500">{fmt(o.cost)}</TableCell>
                      <TableCell className="text-right text-sm font-semibold">{fmt(o.margin)}</TableCell>
                      <TableCell className="text-right pr-4"><MarginBadge v={o.marginPct} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
