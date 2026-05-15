import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  LayoutDashboard, TrendingUp, Users, ShieldCheck, Download,
  AlertTriangle, Star, CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
type ReportType = 'overview' | 'revenue' | 'engineers' | 'clients' | 'sla';

const REPORTS: { key: ReportType; label: string; icon: React.ReactNode }[] = [
  { key: 'overview',  label: 'Обзор',         icon: <LayoutDashboard className="w-4 h-4" /> },
  { key: 'revenue',   label: 'Выручка',        icon: <TrendingUp className="w-4 h-4" /> },
  { key: 'engineers', label: 'Инженеры',       icon: <Users className="w-4 h-4" /> },
  { key: 'clients',   label: 'Клиенты',        icon: <Star className="w-4 h-4" /> },
  { key: 'sla',       label: 'SLA',            icon: <ShieldCheck className="w-4 h-4" /> },
];

const MONTHS_6 = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'];
const MONTHS_12 = ['Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек', 'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'];

// ─── Overview data ─────────────────────────────────────────────────────────────
const overviewKpis = [
  {
    label: 'Выручка',
    value: '4.2 млн ₽',
    change: '+18%',
    positive: true,
    spark: [2.8, 3.1, 3.4, 3.9, 4.2, 4.5],
    color: '#6366f1',
  },
  {
    label: 'Заявок выполнено',
    value: '312',
    change: '+24%',
    positive: true,
    spark: [198, 220, 245, 270, 295, 312],
    color: '#10b981',
  },
  {
    label: 'Ср. время отклика',
    value: '1.8 ч',
    change: '-12%',
    positive: true,
    spark: [2.6, 2.4, 2.2, 2.0, 1.9, 1.8],
    color: '#f59e0b',
  },
  {
    label: 'NPS',
    value: '87',
    change: '+3',
    positive: true,
    spark: [78, 80, 82, 84, 85, 87],
    color: '#ec4899',
  },
];

const monthlySummary = [
  { month: 'Янв', orders: 198, revenue: '2.8 млн', margin: 31.4, sla: 94.2 },
  { month: 'Фев', orders: 220, revenue: '3.1 млн', margin: 32.0, sla: 95.1 },
  { month: 'Мар', orders: 245, revenue: '3.4 млн', margin: 32.8, sla: 96.0 },
  { month: 'Апр', orders: 270, revenue: '3.9 млн', margin: 33.5, sla: 96.7 },
  { month: 'Май', orders: 295, revenue: '4.2 млн', margin: 34.2, sla: 97.3 },
  { month: 'Июн', orders: 312, revenue: '4.5 млн', margin: 35.1, sla: 97.8 },
];

const topIssues = [
  { title: 'Нехватка ЗИП', desc: '14 нарядов ожидают запчасти более 5 дней', color: 'border-red-300 bg-red-50', badge: 'Критично', badgeColor: 'border-red-400 text-red-700' },
  { title: 'Перегрузка инженеров', desc: '3 инженера загружены более чем на 120% норматива', color: 'border-orange-300 bg-orange-50', badge: 'Важно', badgeColor: 'border-orange-400 text-orange-700' },
  { title: 'Просроченная дебиторка', desc: '0.19 млн ₽ не оплачены более 30 дней', color: 'border-amber-300 bg-amber-50', badge: 'Внимание', badgeColor: 'border-amber-400 text-amber-700' },
];

// ─── Revenue data ─────────────────────────────────────────────────────────────
const revenueStacked = MONTHS_6.map((month, i) => ({
  month,
  Ремонт: [1.2, 1.3, 1.5, 1.6, 1.8, 1.9][i],
  ТО:     [0.7, 0.8, 0.8, 0.9, 1.1, 1.2][i],
  Монтаж: [0.5, 0.6, 0.7, 0.8, 0.8, 0.9][i],
  ЗИП:    [0.4, 0.4, 0.4, 0.6, 0.5, 0.5][i],
}));

const revenueVsTarget = MONTHS_6.map((month, i) => ({
  month,
  Факт:  [2.8, 3.1, 3.4, 3.9, 4.2, 4.5][i],
  Цель:  [3.0, 3.2, 3.5, 3.8, 4.0, 4.3][i],
}));

const revenuePie = [
  { name: 'Физ. лица',   value: 38, color: '#6366f1' },
  { name: 'Юр. лица',    value: 45, color: '#10b981' },
  { name: 'Абонемент',   value: 17, color: '#f59e0b' },
];

const topRevenueClients = [
  { name: 'ООО «АгроХолдинг»',   revenue: '840 тыс ₽', orders: 12, margin: '36%' },
  { name: 'ТЦ «Галактика»',      revenue: '720 тыс ₽', orders: 9,  margin: '33%' },
  { name: 'Завод «Металлург»',    revenue: '615 тыс ₽', orders: 7,  margin: '35%' },
  { name: 'БЦ «Олимп»',          revenue: '530 тыс ₽', orders: 6,  margin: '38%' },
  { name: 'Гипермаркет «Магнит»', revenue: '480 тыс ₽', orders: 5,  margin: '31%' },
  { name: 'ООО «СтройГрупп»',    revenue: '420 тыс ₽', orders: 8,  margin: '29%' },
  { name: 'ТЦ «Арена»',          revenue: '390 тыс ₽', orders: 4,  margin: '34%' },
  { name: 'Завод «Прибор»',       revenue: '360 тыс ₽', orders: 5,  margin: '32%' },
  { name: 'БЦ «Горизонт»',       revenue: '320 тыс ₽', orders: 3,  margin: '37%' },
  { name: 'ООО «РегионСервис»',  revenue: '290 тыс ₽', orders: 6,  margin: '28%' },
];

// ─── Engineers data ───────────────────────────────────────────────────────────
const engineerOrders = [
  { name: 'Петров А.',   orders: 52 },
  { name: 'Иванов К.',   orders: 48 },
  { name: 'Сидоров М.',  orders: 45 },
  { name: 'Козлов Р.',   orders: 41 },
  { name: 'Новиков Д.',  orders: 38 },
  { name: 'Морозов В.',  orders: 35 },
  { name: 'Алексеев И.', orders: 32 },
  { name: 'Громов П.',   orders: 28 },
];

const engineerStats = [
  { name: 'Петров А.',   score: 9.4, orders: 52, revenue: '520 тыс', rating: 4.9, sla: '98%' },
  { name: 'Иванов К.',   score: 8.9, orders: 48, revenue: '480 тыс', rating: 4.8, sla: '97%' },
  { name: 'Сидоров М.',  score: 8.5, orders: 45, revenue: '445 тыс', rating: 4.7, sla: '96%' },
  { name: 'Козлов Р.',   score: 8.1, orders: 41, revenue: '410 тыс', rating: 4.8, sla: '95%' },
  { name: 'Новиков Д.',  score: 7.8, orders: 38, revenue: '380 тыс', rating: 4.6, sla: '94%' },
  { name: 'Морозов В.',  score: 7.4, orders: 35, revenue: '350 тыс', rating: 4.5, sla: '93%' },
  { name: 'Алексеев И.', score: 7.1, orders: 32, revenue: '320 тыс', rating: 4.7, sla: '92%' },
  { name: 'Громов П.',   score: 6.8, orders: 28, revenue: '280 тыс', rating: 4.4, sla: '90%' },
];

const radarMetrics = ['Скорость', 'Качество', 'SLA', 'Выручка', 'Клиенты'];
const radarData = radarMetrics.map((metric, i) => ({
  metric,
  'Петров А.':  [95, 92, 98, 88, 94][i],
  'Иванов К.':  [88, 95, 97, 92, 90][i],
  'Сидоров М.': [82, 88, 96, 85, 87][i],
}));

// ─── Clients data ─────────────────────────────────────────────────────────────
const cohortMonths = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'];
const cohortData = [
  { cohort: 'Янв 25', m0: 100, m1: 82, m2: 74, m3: 68, m4: 63, m5: 60 },
  { cohort: 'Фев 25', m0: 100, m1: 85, m2: 76, m3: 71, m4: 66, m5: null },
  { cohort: 'Мар 25', m0: 100, m1: 80, m2: 72, m3: 68, m4: null, m5: null },
  { cohort: 'Апр 25', m0: 100, m1: 84, m2: 77, m3: null, m4: null, m5: null },
  { cohort: 'Май 25', m0: 100, m1: 87, m2: null, m3: null, m4: null, m5: null },
  { cohort: 'Июн 25', m0: 100, m1: null, m2: null, m3: null, m4: null, m5: null },
];

const newChurned = MONTHS_6.map((month, i) => ({
  month,
  Новые:      [24, 31, 28, 35, 29, 42][i],
  Отток:      [8, 6, 9, 7, 5, 4][i],
}));

const topClientsHealth = [
  { name: 'ООО «АгроХолдинг»',    revenue: '840 тыс', health: 92, badge: 'Отлично' },
  { name: 'ТЦ «Галактика»',       revenue: '720 тыс', health: 85, badge: 'Хорошо' },
  { name: 'Завод «Металлург»',     revenue: '615 тыс', health: 78, badge: 'Хорошо' },
  { name: 'БЦ «Олимп»',           revenue: '530 тыс', health: 91, badge: 'Отлично' },
  { name: 'Гипермаркет «Магнит»',  revenue: '480 тыс', health: 64, badge: 'Риск' },
];

// ─── SLA data ─────────────────────────────────────────────────────────────────
const slaCompliance = MONTHS_12.map((month, i) => ({
  month,
  SLA: [91.2, 92.4, 91.8, 93.0, 93.7, 94.1, 94.8, 95.2, 95.7, 96.1, 96.8, 97.3][i],
}));

const slaBreachTypes = [
  { type: 'TTR (время реакции)', breaches: 18 },
  { type: 'TTO (выезд)',         breaches: 11 },
  { type: 'TTF (закрытие)',       breaches: 27 },
];

const slaWorstClients = [
  { client: 'ООО «РегионСервис»',  breaches: 8, contract: 'Договорной', level: 'Красный' },
  { client: 'ИП Смирнов А.В.',     breaches: 5, contract: 'Корпоративный', level: 'Жёлтый' },
  { client: 'ТЦ «Полюс»',          breaches: 4, contract: 'Корпоративный', level: 'Жёлтый' },
  { client: 'Завод «Прибор»',      breaches: 3, contract: 'Договорной', level: 'Жёлтый' },
];

const engineerNames = ['Петров', 'Иванов', 'Сидоров', 'Козлов', 'Новиков', 'Морозов'];
const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const slaHeatmap: number[][] = [
  [0, 1, 0, 2, 0, 1],
  [1, 0, 2, 1, 0, 0],
  [0, 2, 1, 0, 1, 2],
  [1, 0, 0, 1, 0, 0],
  [2, 1, 0, 0, 1, 0],
  [0, 0, 1, 2, 0, 1],
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function heatColor(val: number | null): string {
  if (val === null) return 'bg-gray-100 text-gray-300';
  if (val === 0) return 'bg-green-100 text-green-800';
  if (val === 1) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

function cohortColor(val: number | null): string {
  if (val === null) return 'bg-gray-100 text-gray-400';
  if (val >= 80) return 'bg-emerald-500 text-white';
  if (val >= 65) return 'bg-emerald-300 text-emerald-900';
  if (val >= 50) return 'bg-yellow-200 text-yellow-900';
  return 'bg-red-200 text-red-900';
}

function healthBadgeColor(badge: string): string {
  if (badge === 'Отлично') return 'border-green-400 text-green-700';
  if (badge === 'Хорошо')  return 'border-blue-400 text-blue-700';
  return 'border-red-400 text-red-700';
}

function slaLevelColor(level: string): string {
  if (level === 'Красный') return 'border-red-400 text-red-700';
  return 'border-amber-400 text-amber-700';
}

// Tiny sparkline component
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const sparkData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={48}>
      <LineChart data={sparkData}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Sub-views ────────────────────────────────────────────────────────────────
function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* KPI cards with sparklines */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {overviewKpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="pt-4 pb-2">
              <p className="text-sm text-muted-foreground">{k.label}</p>
              <p className="text-2xl font-bold mt-1">{k.value}</p>
              <span className={`text-xs font-medium ${k.positive ? 'text-green-600' : 'text-red-500'}`}>
                {k.change} к прошлому периоду
              </span>
              <Sparkline data={k.spark} color={k.color} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly summary table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Помесячная сводка</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Месяц</TableHead>
                <TableHead className="text-right">Заявок</TableHead>
                <TableHead className="text-right">Выручка</TableHead>
                <TableHead className="text-right">Маржа, %</TableHead>
                <TableHead className="text-right">SLA, %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlySummary.map((row) => (
                <TableRow key={row.month}>
                  <TableCell className="font-medium">{row.month} 2026</TableCell>
                  <TableCell className="text-right">{row.orders}</TableCell>
                  <TableCell className="text-right">{row.revenue}</TableCell>
                  <TableCell className="text-right">
                    <span className={row.margin >= 34 ? 'text-green-700 font-semibold' : ''}>
                      {row.margin}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={row.sla >= 97 ? 'text-green-700 font-semibold' : row.sla < 95 ? 'text-red-600' : ''}>
                      {row.sla}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top 3 issues */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
          Ключевые проблемы месяца
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topIssues.map((issue, i) => (
            <div key={i} className={`rounded-xl border p-4 ${issue.color}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold">{issue.title}</p>
                <Badge variant="outline" className={`text-xs shrink-0 ${issue.badgeColor}`}>
                  {issue.badge}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{issue.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RevenueTab() {
  return (
    <div className="space-y-6">
      {/* Stacked BarChart by service type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Выручка по типам услуг, млн ₽ (стек)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueStacked}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => [`${v} млн ₽`]} />
              <Legend />
              <Bar dataKey="Ремонт"  stackId="a" fill="#6366f1" />
              <Bar dataKey="ТО"      stackId="a" fill="#10b981" />
              <Bar dataKey="Монтаж"  stackId="a" fill="#f59e0b" />
              <Bar dataKey="ЗИП"     stackId="a" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue vs Target LineChart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Факт vs план, млн ₽</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueVsTarget}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => [`${v} млн ₽`]} />
              <Legend />
              <Line type="monotone" dataKey="Факт" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Цель" stroke="#94a3b8" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie by client type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Выручка по типу клиента</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center gap-8">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={revenuePie}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {revenuePie.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}%`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {revenuePie.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-semibold ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top 10 clients table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Топ-10 клиентов по выручке</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead className="text-right">Выручка</TableHead>
                  <TableHead className="text-right">Заявок</TableHead>
                  <TableHead className="text-right">Маржа</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topRevenueClients.map((c, i) => (
                  <TableRow key={c.name}>
                    <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                    <TableCell className="text-sm font-medium">{c.name}</TableCell>
                    <TableCell className="text-right text-sm">{c.revenue}</TableCell>
                    <TableCell className="text-right text-sm">{c.orders}</TableCell>
                    <TableCell className="text-right text-sm text-green-700 font-medium">{c.margin}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EngineersTab() {
  return (
    <div className="space-y-6">
      {/* Orders per engineer BarChart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Выполнено заявок — топ 8 инженеров</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={engineerOrders} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={90} />
              <Tooltip />
              <Bar dataKey="orders" name="Заявок" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Efficiency score table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Показатели эффективности</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Инженер</TableHead>
                <TableHead className="text-right">Балл (из 10)</TableHead>
                <TableHead className="text-right">Заявок</TableHead>
                <TableHead className="text-right">Выручка</TableHead>
                <TableHead className="text-right">Рейтинг</TableHead>
                <TableHead className="text-right">SLA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {engineerStats.map((e) => (
                <TableRow key={e.name}>
                  <TableCell className="font-medium text-sm">{e.name}</TableCell>
                  <TableCell className="text-right">
                    <span className={`font-bold ${e.score >= 9 ? 'text-green-700' : e.score >= 8 ? 'text-blue-700' : 'text-orange-600'}`}>
                      {e.score}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-sm">{e.orders}</TableCell>
                  <TableCell className="text-right text-sm">{e.revenue}</TableCell>
                  <TableCell className="text-right text-sm flex items-center justify-end gap-1">
                    <span className="text-yellow-500">★</span>{e.rating}
                  </TableCell>
                  <TableCell className="text-right text-sm">{e.sla}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* RadarChart top 3 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Сравнение топ-3 инженеров (5 метрик)</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="Петров А."  dataKey="Петров А."  stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="Иванов К."  dataKey="Иванов К."  stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="Сидоров М." dataKey="Сидоров М." stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={2} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function ClientsTab() {
  return (
    <div className="space-y-6">
      {/* Cohort retention heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Когортный анализ удержания клиентов (%)</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left text-muted-foreground font-medium w-20">Когорта</th>
                {cohortMonths.map((m) => (
                  <th key={m} className="p-2 text-center text-muted-foreground font-medium">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cohortData.map((row) => {
                const vals = [row.m0, row.m1, row.m2, row.m3, row.m4, row.m5];
                return (
                  <tr key={row.cohort}>
                    <td className="p-2 font-medium text-muted-foreground">{row.cohort}</td>
                    {vals.map((v, j) => (
                      <td key={j} className="p-1">
                        <div className={`rounded px-2 py-2 text-center font-semibold ${cohortColor(v)}`}>
                          {v !== null ? `${v}%` : '—'}
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> ≥80%</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-300 inline-block" /> ≥65%</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-200 inline-block" /> ≥50%</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-200 inline-block" /> &lt;50%</span>
          </div>
        </CardContent>
      </Card>

      {/* New vs churned BarChart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Новые vs ушедшие клиенты по месяцам</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={newChurned}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Новые"  fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Отток"  fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top clients with health score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ключевые клиенты — индекс здоровья</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Клиент</TableHead>
                <TableHead className="text-right">Выручка</TableHead>
                <TableHead className="text-right">Балл</TableHead>
                <TableHead className="text-right">Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topClientsHealth.map((c) => (
                <TableRow key={c.name}>
                  <TableCell className="font-medium text-sm">{c.name}</TableCell>
                  <TableCell className="text-right text-sm">{c.revenue}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${c.health >= 85 ? 'bg-green-500' : c.health >= 70 ? 'bg-blue-500' : 'bg-red-500'}`}
                          style={{ width: `${c.health}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold">{c.health}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className={`text-xs ${healthBadgeColor(c.badge)}`}>
                      {c.badge}
                    </Badge>
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

function SLATab() {
  return (
    <div className="space-y-6">
      {/* SLA compliance trend LineChart 12 months */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Соблюдение SLA — тренд 12 месяцев, %</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={slaCompliance}>
              <defs>
                <linearGradient id="slaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis domain={[88, 100]} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => [`${v}%`, 'SLA']} />
              <Area
                type="monotone"
                dataKey="SLA"
                stroke="#10b981"
                fill="url(#slaGrad)"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Breach count by type BarChart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Нарушений по типу SLA-метрики</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={slaBreachTypes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="breaches" name="Нарушений" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Worst SLA performers table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-4 h-4" /> Клиенты с наибольшим числом нарушений
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Клиент</TableHead>
                  <TableHead className="text-right">Нарушений</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead>Уровень</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slaWorstClients.map((c) => (
                  <TableRow key={c.client}>
                    <TableCell className="text-sm font-medium">{c.client}</TableCell>
                    <TableCell className="text-right text-sm font-bold text-red-600">{c.breaches}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.contract}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${slaLevelColor(c.level)}`}>
                        {c.level}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap: engineer × day-of-week breach frequency */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Тепловая карта нарушений: инженер × день недели</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left text-muted-foreground font-medium w-24">Инженер</th>
                {daysOfWeek.map((d) => (
                  <th key={d} className="p-2 text-center text-muted-foreground font-medium">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {engineerNames.map((name, ri) => (
                <tr key={name}>
                  <td className="p-2 font-medium text-muted-foreground">{name}</td>
                  {slaHeatmap[ri].map((val, ci) => (
                    <td key={ci} className="p-1">
                      <div className={`rounded px-2 py-2 text-center font-semibold ${heatColor(val)}`}>
                        {val}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-100 border border-green-300 inline-block" /> 0 — норма</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300 inline-block" /> 1 — предупреждение</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" /> 2+ — критично</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const [activeReport, setActiveReport] = useState<ReportType>('overview');

  const renderTab = () => {
    switch (activeReport) {
      case 'overview':  return <OverviewTab />;
      case 'revenue':   return <RevenueTab />;
      case 'engineers': return <EngineersTab />;
      case 'clients':   return <ClientsTab />;
      case 'sla':       return <SLATab />;
    }
  };

  const handleExport = () => {
    const reportLabels: Record<ReportType, string> = {
      overview:  'Обзор',
      revenue:   'Выручка',
      engineers: 'Инженеры',
      clients:   'Клиенты',
      sla:       'SLA',
    };
    toast.success('Экспорт запущен', {
      description: `Отчёт «${reportLabels[activeReport]}» будет готов через несколько секунд`,
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Аналитика</h1>
          <p className="text-muted-foreground text-sm">Комплексные отчёты и KPI — Май 2026</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          Экспорт
        </button>
      </div>

      {/* Report tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-4">
        {REPORTS.map((r) => (
          <button
            key={r.key}
            onClick={() => setActiveReport(r.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${activeReport === r.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            {r.icon}
            {r.label}
          </button>
        ))}
      </div>

      {/* Active tab content */}
      {renderTab()}

      {/* Footer note */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
        Данные обновлены: сегодня в 08:00 · Период: 01.01.2026 — 15.05.2026
      </div>
    </div>
  );
}
