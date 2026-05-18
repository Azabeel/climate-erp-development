import { useState, useMemo } from 'react';
import {
  ComposedChart, Bar, Line, AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ZAxis, ReferenceLine,
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
const fmtK = (n: number) => `${(n / 1_000).toFixed(0)} тыс.`;
const pct  = (n: number, d = 1) => `${n.toFixed(d)}%`;

type AbcCat = 'A' | 'B' | 'C';
type ClientType = 'Юр.лицо' | 'Физ.лицо';

// ─── Static data ──────────────────────────────────────────────────────────────

const TOP20: {
  rank: number; name: string; type: ClientType; orders: number;
  revenue: number; pctTotal: number; abc: AbcCat; trend: number;
}[] = [
  { rank: 1,  name: 'ООО «АльфаТорг»',       type: 'Юр.лицо', orders: 48, revenue: 1_240_000, pctTotal: 7.1,  abc: 'A', trend: 12  },
  { rank: 2,  name: 'ТЦ «Меркурий»',          type: 'Юр.лицо', orders: 41, revenue: 1_085_000, pctTotal: 6.2,  abc: 'A', trend: 8   },
  { rank: 3,  name: 'АО «СтройГрупп»',        type: 'Юр.лицо', orders: 37, revenue:   940_000, pctTotal: 5.4,  abc: 'A', trend: -3  },
  { rank: 4,  name: 'ООО «ПищеКомп»',         type: 'Юр.лицо', orders: 33, revenue:   870_000, pctTotal: 5.0,  abc: 'A', trend: 22  },
  { rank: 5,  name: 'Иванов Пётр Семёнович',  type: 'Физ.лицо', orders: 29, revenue:   760_000, pctTotal: 4.4,  abc: 'A', trend: 5   },
  { rank: 6,  name: 'ООО «ТехноПарк»',        type: 'Юр.лицо', orders: 26, revenue:   690_000, pctTotal: 4.0,  abc: 'A', trend: 37  },
  { rank: 7,  name: 'ТЦ «Галактика»',         type: 'Юр.лицо', orders: 24, revenue:   630_000, pctTotal: 3.6,  abc: 'A', trend: -8  },
  { rank: 8,  name: 'АО «МеталлИнвест»',      type: 'Юр.лицо', orders: 21, revenue:   580_000, pctTotal: 3.3,  abc: 'A', trend: 14  },
  { rank: 9,  name: 'ООО «АгроСтандарт»',     type: 'Юр.лицо', orders: 19, revenue:   520_000, pctTotal: 3.0,  abc: 'A', trend: -1  },
  { rank: 10, name: 'Сидорова Анна Игоревна', type: 'Физ.лицо', orders: 18, revenue:   490_000, pctTotal: 2.8,  abc: 'A', trend: 6   },
  { rank: 11, name: 'ООО «ЛогоПро»',          type: 'Юр.лицо', orders: 16, revenue:   430_000, pctTotal: 2.5,  abc: 'B', trend: 9   },
  { rank: 12, name: 'ООО «ДарТрейд»',         type: 'Юр.лицо', orders: 14, revenue:   380_000, pctTotal: 2.2,  abc: 'B', trend: -5  },
  { rank: 13, name: 'ИП Белов Олег',           type: 'Физ.лицо', orders: 13, revenue:   340_000, pctTotal: 2.0,  abc: 'B', trend: 18  },
  { rank: 14, name: 'ООО «СтарПлюс»',         type: 'Юр.лицо', orders: 12, revenue:   310_000, pctTotal: 1.8,  abc: 'B', trend: 3   },
  { rank: 15, name: 'ТРК «Орион»',            type: 'Юр.лицо', orders: 11, revenue:   285_000, pctTotal: 1.6,  abc: 'B', trend: -14 },
  { rank: 16, name: 'ООО «КомфортДом»',       type: 'Юр.лицо', orders: 10, revenue:   260_000, pctTotal: 1.5,  abc: 'B', trend: 7   },
  { rank: 17, name: 'Козлов Виктор',           type: 'Физ.лицо', orders: 9,  revenue:   230_000, pctTotal: 1.3,  abc: 'B', trend: -2  },
  { rank: 18, name: 'ООО «Восток-Сервис»',    type: 'Юр.лицо', orders: 8,  revenue:   195_000, pctTotal: 1.1,  abc: 'C', trend: 4   },
  { rank: 19, name: 'ООО «НовоТех»',          type: 'Юр.лицо', orders: 7,  revenue:   165_000, pctTotal: 0.9,  abc: 'C', trend: -22 },
  { rank: 20, name: 'Морозова Светлана',       type: 'Физ.лицо', orders: 6,  revenue:   140_000, pctTotal: 0.8,  abc: 'C', trend: 11  },
];

// Top-15 for ComposedChart
const TOP15_CHART = TOP20.slice(0, 15).map(c => ({
  name: c.name.replace('ООО «', '').replace('»', '').replace('АО «', '').replace('ТЦ «', '').replace('ТРК «', '').slice(0, 10),
  revenue: c.revenue,
  margin: 28 + (c.rank % 4) * 3,
}));

// ABC segments
const ABC_SEGMENTS = [
  { cat: 'A' as AbcCat, clients: 63,  clientsPct: 20, revenuePct: 80, color: '#6366f1', desc: '63 клиента' },
  { cat: 'B' as AbcCat, clients: 94,  clientsPct: 30, revenuePct: 15, color: '#10b981', desc: '94 клиента' },
  { cat: 'C' as AbcCat, clients: 155, clientsPct: 50, revenuePct: 5,  color: '#f59e0b', desc: '155 клиентов' },
];

// Pareto curve (cumulative)
const PARETO: { rank: number; revShare: number; cumulative: number }[] = Array.from({ length: 20 }, (_, i) => {
  const shares = [7.1, 6.2, 5.4, 5.0, 4.4, 4.0, 3.6, 3.3, 3.0, 2.8, 2.5, 2.2, 2.0, 1.8, 1.6, 1.5, 1.3, 1.1, 0.9, 0.8];
  const cum = shares.slice(0, i + 1).reduce((a, b) => a + b, 0);
  return { rank: i + 1, revShare: shares[i], cumulative: +cum.toFixed(1) };
});

// Monthly dynamics A/B/C (stacked)
const MONTHS = ['Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек', 'Янв', 'Фев', 'Мар', 'Апр', 'Май'];
const DYNAMICS = MONTHS.map((m, i) => ({
  month: m,
  catA: Math.round((1_800 + i * 120 + (i % 3) * 80) * 1_000 / 1_000) * 1_000,
  catB: Math.round((420 + i * 20 + (i % 4) * 30) * 1_000 / 1_000) * 1_000,
  catC: Math.round((90 + i * 5 + (i % 5) * 10) * 1_000 / 1_000) * 1_000,
}));

// Growth leaders / losers
const GROWTH_LEADERS = [
  { name: 'ООО «ТехноПарк»',    pct: 37,  abs: 188_000 },
  { name: 'ООО «ПищеКомп»',     pct: 22,  abs: 156_000 },
  { name: 'ИП Белов Олег',       pct: 18,  abs: 52_000  },
  { name: 'ООО «АльфаТорг»',   pct: 12,  abs: 131_000 },
  { name: 'ООО «ЛогоПро»',      pct: 9,   abs: 35_000  },
];
const GROWTH_LOSERS = [
  { name: 'ООО «НовоТех»',      pct: -22, abs: -46_000 },
  { name: 'ТРК «Орион»',        pct: -14, abs: -46_000 },
  { name: 'ТЦ «Галактика»',     pct: -8,  abs: -55_000 },
  { name: 'АО «СтройГрупп»',   pct: -3,  abs: -28_000 },
  { name: 'Козлов Виктор',       pct: -2,  abs: -5_000  },
];

// LTV scatter
const LTV_SCATTER = TOP20.map(c => ({
  name: c.name.slice(0, 14),
  ltv: Math.round(c.revenue * (2.8 + (c.rank % 4) * 0.5)),
  frequency: c.orders,
  revenue: c.revenue,
  z: Math.round(c.revenue / 50_000),
}));

const LTV_TABLE = TOP20.slice(0, 12).map((c, i) => ({
  name: c.name,
  firstOrder: `${2022 + (i % 3)}-${String(1 + (i * 3) % 12).padStart(2, '0')}-01`,
  lastOrder: '2026-05-10',
  totalOrders: c.orders,
  ltv: Math.round(c.revenue * (2.8 + (i % 4) * 0.5)),
  ltvForecast: Math.round(c.revenue * (3.4 + (i % 4) * 0.5)),
}));

// ─── Sub-components ───────────────────────────────────────────────────────────

function AbcBadge({ cat }: { cat: AbcCat }) {
  const map: Record<AbcCat, string> = {
    A: 'bg-indigo-100 text-indigo-700',
    B: 'bg-emerald-100 text-emerald-700',
    C: 'bg-amber-100 text-amber-700',
  };
  return <Badge className={`${map[cat]} font-semibold`}>{cat}</Badge>;
}

function TrendBadge({ pct: p }: { pct: number }) {
  if (p > 0) {
    return (
      <span className="flex items-center gap-1 text-emerald-600 font-medium text-xs">
        <Icon name="TrendingUp" size={12} /> +{p}%
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-red-500 font-medium text-xs">
      <Icon name="TrendingDown" size={12} /> {p}%
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RevenueByClientFull() {
  const [period, setPeriod] = useState('month');
  const [abcFilter, setAbcFilter] = useState<'all' | AbcCat>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | ClientType>('all');

  const filteredTop = useMemo(() => {
    return TOP20.filter(c => {
      if (abcFilter !== 'all' && c.abc !== abcFilter) return false;
      if (typeFilter !== 'all' && c.type !== typeFilter) return false;
      return true;
    });
  }, [abcFilter, typeFilter]);

  const handleExport = () => {
    toast.success('Экспорт запущен', {
      description: 'Файл будет готов через несколько секунд',
    });
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Выручка по клиентам</h1>
          <p className="text-sm text-gray-500 mt-0.5">ABC-анализ, динамика, LTV — за выбранный период</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-44 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Этот месяц</SelectItem>
              <SelectItem value="quarter">Квартал</SelectItem>
              <SelectItem value="year">Год</SelectItem>
              <SelectItem value="custom">Произвольный</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Icon name="Download" size={16} />
            Экспорт
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">Всего клиентов</span>
              <Icon name="Users" size={16} className="text-indigo-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">312</p>
            <p className="text-xs text-gray-400 mt-1">в базе</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">Активных</span>
              <Icon name="UserCheck" size={16} className="text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">187</p>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <Icon name="TrendingUp" size={11} /> с нарядами за период
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">Средний чек</span>
              <Icon name="Receipt" size={16} className="text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">8 400 ₽</p>
            <p className="text-xs text-gray-400 mt-1">за наряд</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">Концентрация</span>
              <Icon name="PieChart" size={16} className="text-rose-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">42%</p>
            <p className="text-xs text-gray-400 mt-1">выручки — ТОП-10</p>
          </CardContent>
        </Card>
      </div>

      {/* ── ABC Visual ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">ABC-анализ — распределение клиентов</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ABC_SEGMENTS.map(seg => (
            <div key={seg.cat} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <AbcBadge cat={seg.cat} />
                  <span className="text-gray-700 font-medium">{seg.desc}</span>
                  <span className="text-gray-400">({seg.clientsPct}% клиентов)</span>
                </div>
                <span className="font-semibold text-gray-900">{seg.revenuePct}% выручки</span>
              </div>
              <Progress value={seg.revenuePct} className="h-3" style={{ ['--progress-color' as string]: seg.color }} />
            </div>
          ))}
          <p className="text-xs text-gray-400 pt-1">
            Принцип Парето подтверждён: 20% клиентов дают 80% выручки
          </p>
        </CardContent>
      </Card>

      {/* ── Tabs ── */}
      <Tabs defaultValue="top">
        <TabsList className="mb-4">
          <TabsTrigger value="top">Топ клиенты</TabsTrigger>
          <TabsTrigger value="abc">ABC-анализ</TabsTrigger>
          <TabsTrigger value="dynamics">Динамика</TabsTrigger>
          <TabsTrigger value="ltv">LTV</TabsTrigger>
        </TabsList>

        {/* ── Tab: Топ клиенты ── */}
        <TabsContent value="top" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-base">Топ-15: выручка и маржинальность</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={abcFilter} onValueChange={v => setAbcFilter(v as typeof abcFilter)}>
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <SelectValue placeholder="ABC" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все</SelectItem>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={v => setTypeFilter(v as typeof typeFilter)}>
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue placeholder="Тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все</SelectItem>
                      <SelectItem value="Юр.лицо">Юр.лицо</SelectItem>
                      <SelectItem value="Физ.лицо">Физ.лицо</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={TOP15_CHART} margin={{ top: 4, right: 20, bottom: 40, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" angle={-40} textAnchor="end" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis yAxisId="left" tickFormatter={v => fmtK(v)} tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" unit="%" tick={{ fontSize: 11 }} domain={[0, 50]} />
                  <Tooltip
                    formatter={(val: number, name: string) =>
                      name === 'Маржа %' ? `${val}%` : `${fmt(val)} ₽`
                    }
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" name="Выручка" fill="#6366f1" radius={[3, 3, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="margin" name="Маржа %" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Таблица топ-20 клиентов</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Клиент</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead className="text-right">Нарядов</TableHead>
                      <TableHead className="text-right">Выручка</TableHead>
                      <TableHead className="text-right">% от общей</TableHead>
                      <TableHead>ABC</TableHead>
                      <TableHead>Тренд</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTop.map(c => (
                      <TableRow key={c.rank}>
                        <TableCell className="font-bold text-gray-500">{c.rank}</TableCell>
                        <TableCell className="font-medium max-w-[180px] truncate">{c.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{c.type}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{c.orders}</TableCell>
                        <TableCell className="text-right font-semibold">{fmt(c.revenue)} ₽</TableCell>
                        <TableCell className="text-right text-gray-500">{pct(c.pctTotal)}</TableCell>
                        <TableCell><AbcBadge cat={c.abc} /></TableCell>
                        <TableCell><TrendBadge pct={c.trend} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab: ABC-анализ ── */}
        <TabsContent value="abc" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Кривая Парето — накопленная выручка</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={PARETO} margin={{ top: 4, right: 20, bottom: 10, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="rank" label={{ value: 'Клиент (ранг)', position: 'insideBottom', offset: -4, fontSize: 11 }} />
                  <YAxis yAxisId="left" tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} domain={[0, 12]} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip formatter={(val: number, name: string) => `${val}%`} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revShare" name="Доля выручки %" fill="#6366f1" radius={[2, 2, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="cumulative" name="Накопленный %" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <ReferenceLine yAxisId="right" y={80} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '80%', fill: '#ef4444', fontSize: 11 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ABC_SEGMENTS.map(seg => (
              <Card key={seg.cat} className="border-l-4" style={{ borderLeftColor: seg.color }}>
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <AbcBadge cat={seg.cat} />
                    <Icon name="Users" size={16} className="text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{seg.clients} клиентов</p>
                  <p className="text-sm text-gray-500 mt-1">{seg.clientsPct}% базы → {seg.revenuePct}% выручки</p>
                  <div className="mt-3 text-xs text-gray-600 bg-gray-50 rounded p-2">
                    {seg.cat === 'A' && '⭐ Удерживать любой ценой. Персональный менеджер, особые условия.'}
                    {seg.cat === 'B' && '📈 Развивать до категории A. Программы лояльности и up-sell.'}
                    {seg.cat === 'C' && '🔄 Автоматизировать обслуживание. Оценить рентабельность.'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Tab: Динамика ── */}
        <TabsContent value="dynamics" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Выручка по месяцам: разбивка A / B / C</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={DYNAMICS} margin={{ top: 4, right: 16, bottom: 4, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={v => fmtK(v)} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => `${fmt(v)} ₽`} />
                  <Legend />
                  <Area type="monotone" dataKey="catA" stackId="1" name="Категория A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.8} />
                  <Area type="monotone" dataKey="catB" stackId="1" name="Категория B" stroke="#10b981" fill="#10b981" fillOpacity={0.7} />
                  <Area type="monotone" dataKey="catC" stackId="1" name="Категория C" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Icon name="TrendingUp" size={16} className="text-emerald-500" />
                  Топ-5 роста за год
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {GROWTH_LEADERS.map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b last:border-0">
                    <span className="text-sm text-gray-700 truncate max-w-[180px]">{c.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">+{fmt(c.abs)} ₽</span>
                      <Badge className="bg-emerald-100 text-emerald-700 font-semibold">+{c.pct}%</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Icon name="TrendingDown" size={16} className="text-red-500" />
                  Топ-5 снижения за год
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {GROWTH_LOSERS.map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b last:border-0">
                    <span className="text-sm text-gray-700 truncate max-w-[180px]">{c.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{fmt(c.abs)} ₽</span>
                      <Badge className="bg-red-100 text-red-600 font-semibold">{c.pct}%</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab: LTV ── */}
        <TabsContent value="ltv" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Средний LTV',  value: '127 400 ₽', icon: 'TrendingUp',  color: 'text-indigo-500' },
              { label: 'Медиана LTV',  value: '45 000 ₽',  icon: 'BarChart2',   color: 'text-emerald-500' },
              { label: 'Лучший LTV',   value: '3 472 000 ₽', icon: 'Star',      color: 'text-amber-500' },
              { label: 'Клиентов <1 заказа за год', value: '64', icon: 'AlertCircle', color: 'text-rose-500' },
            ].map(kpi => (
              <Card key={kpi.label}>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name={kpi.icon as Parameters<typeof Icon>[0]['name']} size={15} className={kpi.color} />
                    <span className="text-xs text-gray-500">{kpi.label}</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">LTV vs Частота заказов (размер = выручка)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <ScatterChart margin={{ top: 4, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="frequency" name="Частота" label={{ value: 'Кол-во заказов', position: 'insideBottom', offset: -10, fontSize: 11 }} type="number" />
                  <YAxis dataKey="ltv" name="LTV" tickFormatter={v => fmtK(v)} tick={{ fontSize: 11 }} label={{ value: 'LTV, тыс.₽', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                  <ZAxis dataKey="z" range={[40, 500]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-xs">
                          <p className="font-semibold text-gray-800 mb-1">{d.name}</p>
                          <p>LTV: <strong>{fmt(d.ltv)} ₽</strong></p>
                          <p>Заказов: <strong>{d.frequency}</strong></p>
                          <p>Выручка: <strong>{fmt(d.revenue)} ₽</strong></p>
                        </div>
                      );
                    }}
                  />
                  <Scatter name="Клиенты" data={LTV_SCATTER} fill="#6366f1" fillOpacity={0.7} />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Детальная таблица LTV</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Клиент</TableHead>
                      <TableHead>Первый заказ</TableHead>
                      <TableHead>Последний заказ</TableHead>
                      <TableHead className="text-right">Всего заказов</TableHead>
                      <TableHead className="text-right">LTV факт</TableHead>
                      <TableHead className="text-right">Прогноз LTV / год</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {LTV_TABLE.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium max-w-[180px] truncate">{row.name}</TableCell>
                        <TableCell className="text-gray-500 text-xs">{row.firstOrder}</TableCell>
                        <TableCell className="text-gray-500 text-xs">{row.lastOrder}</TableCell>
                        <TableCell className="text-right">{row.totalOrders}</TableCell>
                        <TableCell className="text-right font-semibold">{fmt(row.ltv)} ₽</TableCell>
                        <TableCell className="text-right text-indigo-600 font-semibold">{fmt(row.ltvForecast)} ₽</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
