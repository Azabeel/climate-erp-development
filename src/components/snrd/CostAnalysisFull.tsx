import { useState } from 'react';
import {
  BarChart, Bar, ComposedChart, PieChart, Pie, Cell,
  ScatterChart, Scatter, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, LabelList,
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

// ─── Types ───────────────────────────────────────────────────────────────────

interface WorkOrder {
  id: string;
  num: string;
  client: string;
  type: string;
  revenue: number;
  cost: number;
  margin: number;
  marginPct: number;
}

interface Engineer {
  name: string;
  orders: number;
  revenue: number;
  avgMarginPct: number;
  trend: 'up' | 'down' | 'flat';
}

interface BrandRow {
  brand: string;
  orders: number;
  avgRevenue: number;
  avgCost: number;
  avgMarginPct: number;
}

interface CostItem {
  label: string;
  amount: number;
  typical: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const WORK_ORDERS: WorkOrder[] = [
  { id: 'WO-2026-000142', num: '142', client: 'ООО «АгроХолдинг»',   type: 'Ремонт',        revenue: 12400, cost: 7900,  margin: 4500, marginPct: 36.3 },
  { id: 'WO-2026-000141', num: '141', client: 'ТЦ «Галактика»',       type: 'ТО',            revenue: 8200,  cost: 5700,  margin: 2500, marginPct: 30.5 },
  { id: 'WO-2026-000140', num: '140', client: 'Завод «Металлург»',     type: 'Ремонт',        revenue: 18500, cost: 11200, margin: 7300, marginPct: 39.5 },
  { id: 'WO-2026-000139', num: '139', client: 'БЦ «Олимп»',           type: 'Монтаж',        revenue: 24000, cost: 16100, margin: 7900, marginPct: 32.9 },
  { id: 'WO-2026-000138', num: '138', client: 'ИП Смирнов А.В.',       type: 'Ремонт',        revenue: 3800,  cost: 3950,  margin: -150, marginPct: -3.9 },
  { id: 'WO-2026-000137', num: '137', client: 'ООО «СтройГрупп»',     type: 'Гарантия',      revenue: 2100,  cost: 2450,  margin: -350, marginPct: -16.7 },
  { id: 'WO-2026-000136', num: '136', client: 'Школа №34',            type: 'ТО',            revenue: 6500,  cost: 4200,  margin: 2300, marginPct: 35.4 },
  { id: 'WO-2026-000135', num: '135', client: 'ООО «АгроХолдинг»',   type: 'Ремонт',        revenue: 9100,  cost: 5900,  margin: 3200, marginPct: 35.2 },
  { id: 'WO-2026-000134', num: '134', client: 'Гостиница «Маяк»',     type: 'Монтаж',        revenue: 31500, cost: 20400, margin: 11100, marginPct: 35.2 },
  { id: 'WO-2026-000133', num: '133', client: 'ТЦ «Галактика»',       type: 'Ремонт',        revenue: 7300,  cost: 4850,  margin: 2450, marginPct: 33.6 },
  { id: 'WO-2026-000132', num: '132', client: 'ЖК «Северный»',        type: 'Монтаж',        revenue: 19800, cost: 13600, margin: 6200, marginPct: 31.3 },
  { id: 'WO-2026-000131', num: '131', client: 'ИП Козлов Д.С.',        type: 'Ремонт',        revenue: 4200,  cost: 4320,  margin: -120, marginPct: -2.9 },
  { id: 'WO-2026-000130', num: '130', client: 'Завод «Металлург»',     type: 'ТО',            revenue: 11000, cost: 7100,  margin: 3900, marginPct: 35.5 },
  { id: 'WO-2026-000129', num: '129', client: 'БЦ «Олимп»',           type: 'Ремонт',        revenue: 5600,  cost: 3700,  margin: 1900, marginPct: 33.9 },
  { id: 'WO-2026-000128', num: '128', client: 'Школа №34',            type: 'Аварийный',     revenue: 8900,  cost: 5400,  margin: 3500, marginPct: 39.3 },
];

// Last 20 orders for ComposedChart (subset + generated)
const CHART_ORDERS = [
  ...WORK_ORDERS.slice(0, 15).map(o => ({ num: o.num, revenue: o.revenue, cost: o.cost, marginPct: +o.marginPct.toFixed(1) })),
  { num: '127', revenue: 7600,  cost: 4900,  marginPct: 35.5 },
  { num: '126', revenue: 14200, cost: 9300,  marginPct: 34.5 },
  { num: '125', revenue: 5100,  cost: 3450,  marginPct: 32.4 },
  { num: '124', revenue: 22000, cost: 14800, marginPct: 32.7 },
  { num: '123', revenue: 3500,  cost: 2400,  marginPct: 31.4 },
].slice(0, 20);

const ENGINEERS: Engineer[] = [
  { name: 'Петров А.И.',    orders: 42, revenue: 312400, avgMarginPct: 38.4, trend: 'up'   },
  { name: 'Сидоров В.К.',   orders: 38, revenue: 284600, avgMarginPct: 35.1, trend: 'up'   },
  { name: 'Козлов Д.С.',    orders: 31, revenue: 198700, avgMarginPct: 29.8, trend: 'down' },
  { name: 'Иванов М.Л.',    orders: 45, revenue: 356200, avgMarginPct: 33.7, trend: 'flat' },
  { name: 'Новиков Р.Е.',   orders: 27, revenue: 167300, avgMarginPct: 31.2, trend: 'up'   },
  { name: 'Фёдоров П.А.',   orders: 35, revenue: 241500, avgMarginPct: 36.9, trend: 'up'   },
  { name: 'Морозов С.В.',   orders: 22, revenue: 134800, avgMarginPct: 27.4, trend: 'down' },
  { name: 'Волков Н.И.',    orders: 29, revenue: 189600, avgMarginPct: 32.5, trend: 'flat' },
];

const SCATTER_DATA = ENGINEERS.map(e => ({
  name: e.name,
  x: e.orders,
  y: e.avgMarginPct,
}));

const BRANDS: BrandRow[] = [
  { brand: 'Daikin',     orders: 68, avgRevenue: 14200, avgCost: 9100,  avgMarginPct: 35.9 },
  { brand: 'Mitsubishi', orders: 54, avgRevenue: 12800, avgCost: 8300,  avgMarginPct: 35.2 },
  { brand: 'Gree',       orders: 47, avgRevenue: 7400,  avgCost: 5100,  avgMarginPct: 31.1 },
  { brand: 'Haier',      orders: 41, avgRevenue: 6900,  avgCost: 4950,  avgMarginPct: 28.3 },
  { brand: 'Samsung',    orders: 36, avgRevenue: 8100,  avgCost: 5600,  avgMarginPct: 30.9 },
  { brand: 'LG',         orders: 33, avgRevenue: 7600,  avgCost: 5250,  avgMarginPct: 30.9 },
  { brand: 'Ballu',      orders: 29, avgRevenue: 4900,  avgCost: 3650,  avgMarginPct: 25.5 },
  { brand: 'AUX',        orders: 22, avgRevenue: 5200,  avgCost: 3800,  avgMarginPct: 26.9 },
];

const BRAND_COST_CHART = BRANDS.map(b => ({
  brand: b.brand,
  avgCost: b.avgCost,
  avgRevenue: b.avgRevenue,
}));

const COST_PIE = [
  { name: 'ФОТ',        value: 38, color: '#6366f1' },
  { name: 'ЗИП',        value: 27, color: '#10b981' },
  { name: 'Материалы',  value: 15, color: '#f59e0b' },
  { name: 'ГСМ',        value: 8,  color: '#ec4899' },
  { name: 'Накладные',  value: 12, color: '#94a3b8' },
];

const DETAIL_ORDERS = WORK_ORDERS.slice(0, 10).map(o => o.id);

const DETAIL_COST_MAP: Record<string, CostItem[]> = {
  'WO-2026-000142': [
    { label: 'Услуги (работы)',  amount: 3800, typical: 3200 },
    { label: 'Материалы',        amount: 1200, typical: 1100 },
    { label: 'ЗИП',              amount: 1500, typical: 1800 },
    { label: 'ФОТ',              amount: 2600, typical: 2900 },
    { label: 'ГСМ',              amount: 380,  typical: 320  },
    { label: 'Накладные',        amount: 790,  typical: 680  },
  ],
  'WO-2026-000141': [
    { label: 'Услуги (работы)',  amount: 1900, typical: 2000 },
    { label: 'Материалы',        amount: 680,  typical: 750  },
    { label: 'ЗИП',              amount: 1100, typical: 900  },
    { label: 'ФОТ',              amount: 1400, typical: 1600 },
    { label: 'ГСМ',              amount: 220,  typical: 240  },
    { label: 'Накладные',        amount: 400,  typical: 360  },
  ],
  'WO-2026-000140': [
    { label: 'Услуги (работы)',  amount: 3600, typical: 3200 },
    { label: 'Материалы',        amount: 2100, typical: 1900 },
    { label: 'ЗИП',              amount: 3200, typical: 2800 },
    { label: 'ФОТ',              amount: 4200, typical: 3600 },
    { label: 'ГСМ',              amount: 550,  typical: 480  },
    { label: 'Накладные',        amount: 1120, typical: 980  },
  ],
};

// Default detail data for orders without specific breakdown
function defaultDetail(wo: WorkOrder): CostItem[] {
  const c = wo.cost;
  return [
    { label: 'Услуги (работы)',  amount: Math.round(c * 0.165), typical: Math.round(c * 0.16) },
    { label: 'Материалы',        amount: Math.round(c * 0.145), typical: Math.round(c * 0.15) },
    { label: 'ЗИП',              amount: Math.round(c * 0.265), typical: Math.round(c * 0.27) },
    { label: 'ФОТ',              amount: Math.round(c * 0.38),  typical: Math.round(c * 0.38) },
    { label: 'ГСМ',              amount: Math.round(c * 0.08),  typical: Math.round(c * 0.08) },
    { label: 'Накладные',        amount: Math.round(c * 0.12),  typical: Math.round(c * 0.12) },
  ];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString('ru-RU') + ' ₽';
}

function marginBadge(pct: number) {
  if (pct >= 35) return <Badge className="bg-emerald-100 text-emerald-700 border-0">{pct.toFixed(1)}%</Badge>;
  if (pct >= 25) return <Badge className="bg-amber-100 text-amber-700 border-0">{pct.toFixed(1)}%</Badge>;
  return <Badge className="bg-red-100 text-red-700 border-0">{pct.toFixed(1)}%</Badge>;
}

const PALETTE = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#94a3b8', '#3b82f6', '#ef4444', '#8b5cf6'];

// ─── KPI Cards ────────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, sub, iconColor }: {
  icon: string; label: string; value: string; sub?: string; iconColor?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-slate-100 ${iconColor ?? 'text-slate-600'}`}>
          <Icon name={icon as any} size={18} />
        </div>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-xl font-bold text-slate-800 mt-0.5">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Tab: По нарядам ──────────────────────────────────────────────────────────

function TabOrders() {
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700">
            Выручка / Себестоимость / Маржа% — последние 20 нарядов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={CHART_ORDERS} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="num" tick={{ fontSize: 11 }} tickFormatter={v => `#${v}`} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}к`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} domain={[-20, 50]} />
              <Tooltip
                formatter={(value: number, name: string) =>
                  name === 'marginPct' ? [`${value}%`, 'Маржа%'] : [fmt(value), name === 'revenue' ? 'Выручка' : 'Себестоимость']}
                labelFormatter={v => `Наряд #${v}`}
              />
              <Legend formatter={v => v === 'revenue' ? 'Выручка' : v === 'cost' ? 'Себестоимость' : 'Маржа%'} />
              <ReferenceLine yAxisId="right" y={0} stroke="#ef4444" strokeDasharray="4 2" />
              <Bar yAxisId="left" dataKey="revenue" fill="#6366f1" opacity={0.85} radius={[3, 3, 0, 0]} />
              <Bar yAxisId="left" dataKey="cost"    fill="#f59e0b" opacity={0.75} radius={[3, 3, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="marginPct" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700">Таблица нарядов</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs">№ наряда</TableHead>
                <TableHead className="text-xs">Клиент</TableHead>
                <TableHead className="text-xs">Тип</TableHead>
                <TableHead className="text-xs text-right">Выручка</TableHead>
                <TableHead className="text-xs text-right">Себестоимость</TableHead>
                <TableHead className="text-xs text-right">Маржа ₽</TableHead>
                <TableHead className="text-xs text-center">Маржа%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {WORK_ORDERS.map(wo => (
                <TableRow key={wo.id} className="text-xs hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-600">WO-{wo.num}</TableCell>
                  <TableCell className="max-w-[160px] truncate">{wo.client}</TableCell>
                  <TableCell>{wo.type}</TableCell>
                  <TableCell className="text-right font-medium">{fmt(wo.revenue)}</TableCell>
                  <TableCell className="text-right text-slate-500">{fmt(wo.cost)}</TableCell>
                  <TableCell className={`text-right font-semibold ${wo.margin < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {wo.margin < 0 ? '−' : '+'}{fmt(Math.abs(wo.margin))}
                  </TableCell>
                  <TableCell className="text-center">{marginBadge(wo.marginPct)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Tab: По инженерам ────────────────────────────────────────────────────────

function TabEngineers() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Средняя маржа% по инженерам</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ENGINEERS} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 45]} tickFormatter={v => `${v}%`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                <Tooltip formatter={(v: number) => [`${v}%`, 'Маржа%']} />
                <ReferenceLine x={30} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: 'норма 30%', fill: '#f59e0b', fontSize: 10 }} />
                <Bar dataKey="avgMarginPct" radius={[0, 4, 4, 0]}>
                  {ENGINEERS.map((e, i) => (
                    <Cell key={i} fill={e.avgMarginPct >= 35 ? '#10b981' : e.avgMarginPct >= 30 ? '#6366f1' : '#ef4444'} />
                  ))}
                  <LabelList dataKey="avgMarginPct" position="right" formatter={(v: number) => `${v}%`} style={{ fontSize: 11 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Нарядов vs Средняя маржа%</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" dataKey="x" name="Нарядов" tick={{ fontSize: 11 }} label={{ value: 'Нарядов', position: 'insideBottom', offset: -2, fontSize: 10 }} />
                <YAxis type="number" dataKey="y" name="Маржа%" tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} domain={[24, 42]} />
                <ReferenceLine y={30} stroke="#f59e0b" strokeDasharray="4 2" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (!payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border border-slate-200 rounded p-2 text-xs shadow">
                        <p className="font-semibold">{d.name}</p>
                        <p>Нарядов: {d.x}</p>
                        <p>Маржа%: {d.y}%</p>
                      </div>
                    );
                  }}
                />
                <Scatter data={SCATTER_DATA} fill="#6366f1" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700">Инженеры — сводная таблица</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs">Инженер</TableHead>
                <TableHead className="text-xs text-center">Нарядов</TableHead>
                <TableHead className="text-xs text-right">Выручка</TableHead>
                <TableHead className="text-xs text-center">Ср. маржа%</TableHead>
                <TableHead className="text-xs text-center">Тренд</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ENGINEERS.map(e => (
                <TableRow key={e.name} className="text-xs hover:bg-slate-50">
                  <TableCell className="font-medium">{e.name}</TableCell>
                  <TableCell className="text-center">{e.orders}</TableCell>
                  <TableCell className="text-right">{fmt(e.revenue)}</TableCell>
                  <TableCell className="text-center">{marginBadge(e.avgMarginPct)}</TableCell>
                  <TableCell className="text-center">
                    {e.trend === 'up'   && <span className="text-emerald-600 font-bold">↑</span>}
                    {e.trend === 'down' && <span className="text-red-500 font-bold">↓</span>}
                    {e.trend === 'flat' && <span className="text-slate-400 font-bold">→</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Tab: По брендам ──────────────────────────────────────────────────────────

function TabBrands() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Ср. выручка / себестоимость по брендам</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={BRAND_COST_CHART} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}к`} />
                <YAxis type="category" dataKey="brand" tick={{ fontSize: 11 }} width={70} />
                <Tooltip formatter={(v: number, n: string) => [fmt(v), n === 'avgRevenue' ? 'Выручка' : 'Себестоимость']} />
                <Legend formatter={v => v === 'avgRevenue' ? 'Выручка' : 'Себестоимость'} />
                <Bar dataKey="avgRevenue" fill="#6366f1" opacity={0.85} radius={[0, 3, 3, 0]} />
                <Bar dataKey="avgCost"    fill="#f59e0b" opacity={0.8}  radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Структура себестоимости (типовая)</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={COST_PIE}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name} ${value}%`}
                  labelLine={false}
                >
                  {COST_PIE.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700">Бренды — сводная таблица</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs">Бренд</TableHead>
                <TableHead className="text-xs text-center">Нарядов</TableHead>
                <TableHead className="text-xs text-right">Ср. выручка</TableHead>
                <TableHead className="text-xs text-right">Ср. себестоимость</TableHead>
                <TableHead className="text-xs text-center">Ср. маржа%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {BRANDS.map(b => (
                <TableRow key={b.brand} className="text-xs hover:bg-slate-50">
                  <TableCell className="font-semibold">{b.brand}</TableCell>
                  <TableCell className="text-center">{b.orders}</TableCell>
                  <TableCell className="text-right">{fmt(b.avgRevenue)}</TableCell>
                  <TableCell className="text-right text-slate-500">{fmt(b.avgCost)}</TableCell>
                  <TableCell className="text-center">{marginBadge(b.avgMarginPct)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Tab: Детализация ─────────────────────────────────────────────────────────

function TabDetail() {
  const [selectedId, setSelectedId] = useState(DETAIL_ORDERS[0]);

  const wo = WORK_ORDERS.find(o => o.id === selectedId)!;
  const items: CostItem[] = DETAIL_COST_MAP[selectedId] ?? defaultDetail(wo);
  const totalCost = items.reduce((s, i) => s + i.amount, 0);
  const totalTypical = items.reduce((s, i) => s + i.typical, 0);

  const pieData = items.map((item, i) => ({
    name: item.label,
    value: item.amount,
    color: PALETTE[i],
  }));

  function handleExport() {
    toast.success(`Экспорт завершён`, {
      description: `Детализация по ${selectedId} сохранена в Excel`,
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600 font-medium">Выберите наряд:</span>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DETAIL_ORDERS.map(id => (
                <SelectItem key={id} value={id}>{id}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
          <Icon name="Download" size={14} />
          Экспорт
        </Button>
      </div>

      {wo && (
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-slate-500">Клиент</p>
            <p className="font-semibold mt-0.5">{wo.client}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-slate-500">Выручка / Себестоимость</p>
            <p className="font-semibold mt-0.5">{fmt(wo.revenue)} / {fmt(wo.cost)}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-slate-500">Маржа</p>
            <p className={`font-semibold mt-0.5 ${wo.margin < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {fmt(wo.margin)} ({wo.marginPct.toFixed(1)}%)
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Структура затрат</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-xs">Статья</TableHead>
                  <TableHead className="text-xs text-right">Сумма</TableHead>
                  <TableHead className="text-xs text-right">% от с/с</TableHead>
                  <TableHead className="text-xs text-right">Типовое</TableHead>
                  <TableHead className="text-xs text-right">Δ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, i) => {
                  const pct = ((item.amount / totalCost) * 100).toFixed(1);
                  const delta = item.amount - item.typical;
                  return (
                    <TableRow key={i} className="text-xs hover:bg-slate-50">
                      <TableCell>
                        <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: PALETTE[i] }} />
                        {item.label}
                      </TableCell>
                      <TableCell className="text-right font-medium">{fmt(item.amount)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Progress value={+pct} className="w-12 h-1.5" />
                          <span>{pct}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-slate-400">{fmt(item.typical)}</TableCell>
                      <TableCell className={`text-right font-semibold ${delta > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                        {delta > 0 ? '+' : ''}{fmt(delta)}
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="text-xs bg-slate-50 font-semibold">
                  <TableCell>Итого себестоимость</TableCell>
                  <TableCell className="text-right">{fmt(totalCost)}</TableCell>
                  <TableCell className="text-right">100%</TableCell>
                  <TableCell className="text-right text-slate-400">{fmt(totalTypical)}</TableCell>
                  <TableCell className={`text-right ${totalCost - totalTypical > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                    {totalCost - totalTypical > 0 ? '+' : ''}{fmt(totalCost - totalTypical)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Распределение затрат</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number, n: string) => [fmt(v), n]} />
                <Legend
                  formatter={(v) => <span className="text-xs">{v}</span>}
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CostAnalysisFull() {
  const bestEngineer = [...ENGINEERS].sort((a, b) => b.avgMarginPct - a.avgMarginPct)[0];
  const noMarginCount = WORK_ORDERS.filter(o => o.marginPct <= 0).length;

  return (
    <div className="space-y-5 p-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Анализ себестоимости нарядов</h1>
          <p className="text-sm text-slate-500 mt-0.5">Маржинальность по нарядам, инженерам и брендам</p>
        </div>
        <Badge variant="outline" className="text-slate-500 border-slate-300 text-xs">
          <Icon name="Calendar" size={12} className="mr-1" />
          Май 2026
        </Badge>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          icon="TrendingDown"
          label="Средняя себестоимость"
          value="4 200 ₽"
          sub="−3.1% к прошлому месяцу"
          iconColor="text-indigo-600"
        />
        <KpiCard
          icon="Percent"
          label="Средняя маржа"
          value="34%"
          sub="+1.2 пп к прошлому месяцу"
          iconColor="text-emerald-600"
        />
        <KpiCard
          icon="AlertTriangle"
          label="Нарядов без маржи"
          value={String(noMarginCount)}
          sub="требуют анализа причин"
          iconColor="text-red-500"
        />
        <KpiCard
          icon="Award"
          label="Лучший по марже"
          value={bestEngineer.name}
          sub={`${bestEngineer.avgMarginPct}% средняя маржа`}
          iconColor="text-amber-500"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders">
        <TabsList className="bg-white border border-slate-200">
          <TabsTrigger value="orders"   className="text-xs">По нарядам</TabsTrigger>
          <TabsTrigger value="engineers" className="text-xs">По инженерам</TabsTrigger>
          <TabsTrigger value="brands"   className="text-xs">По брендам</TabsTrigger>
          <TabsTrigger value="detail"   className="text-xs">Детализация</TabsTrigger>
        </TabsList>

        <TabsContent value="orders"    className="mt-4"><TabOrders    /></TabsContent>
        <TabsContent value="engineers" className="mt-4"><TabEngineers /></TabsContent>
        <TabsContent value="brands"    className="mt-4"><TabBrands    /></TabsContent>
        <TabsContent value="detail"    className="mt-4"><TabDetail    /></TabsContent>
      </Tabs>
    </div>
  );
}
