import { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface KPICard {
  label: string;
  value: string;
  sub: string;
  icon: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  color: string;
}

interface EngineerRow {
  name: string;
  orders: number;
  done: number;
  donePercent: number;
  slaPercent: number;
  avgTime: string;
  revenue: number;
}

interface ClientRow {
  name: string;
  type: 'Физ.лицо' | 'Юр.лицо';
  orders: number;
  total: number;
  lastVisit: string;
  contract: 'Активный' | 'Истёк' | 'Нет';
}

interface BrandRow {
  brand: string;
  orders: number;
  avgRepairTime: string;
  topFailure: string;
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const KPI_CARDS: KPICard[] = [
  {
    label: 'Всего нарядов',
    value: '247',
    sub: 'за выбранный период',
    icon: 'ClipboardList',
    trend: 'up',
    trendValue: '+14 vs прошлый мес.',
    color: 'text-blue-600',
  },
  {
    label: 'Выполнено',
    value: '218',
    sub: '88.3% от всех',
    icon: 'CheckCircle2',
    trend: 'up',
    trendValue: '+9 vs прошлый мес.',
    color: 'text-green-600',
  },
  {
    label: 'SLA выполнен',
    value: '94%',
    sub: '205 из 218 нарядов',
    icon: 'ShieldCheck',
    trend: 'up',
    trendValue: '+2% vs прошлый мес.',
    color: 'text-emerald-600',
  },
  {
    label: 'Среднее время',
    value: '3.2ч',
    sub: 'от открытия до закрытия',
    icon: 'Clock',
    trend: 'down',
    trendValue: '-0.4ч vs прошлый мес.',
    color: 'text-violet-600',
  },
];

// 30 дней: план vs факт
const DAILY_DATA = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const plan = 7 + Math.round(Math.sin(i * 0.4) * 2);
  const fact = plan - Math.round(Math.random() * 2) + (i % 7 === 0 ? -2 : 0);
  return {
    day: `${day < 10 ? '0' : ''}${day}.05`,
    plan: Math.max(plan, 3),
    fact: Math.max(fact, 0),
  };
});

const TYPE_DATA = [
  { name: 'Ремонт', value: 118, fill: '#3b82f6' },
  { name: 'ТО', value: 64, fill: '#10b981' },
  { name: 'Монтаж', value: 31, fill: '#8b5cf6' },
  { name: 'Гарантия', value: 22, fill: '#f59e0b' },
  { name: 'ЗНО', value: 12, fill: '#ef4444' },
];

const STATUS_DATA = [
  { name: 'Выполнено', value: 218, fill: '#10b981' },
  { name: 'В работе', value: 17, fill: '#3b82f6' },
  { name: 'Отменено', value: 7, fill: '#6b7280' },
  { name: 'Просрочено', value: 5, fill: '#ef4444' },
];

const ENGINEER_CHART_DATA = [
  { name: 'Иванов А.', orders: 42, revenue: 187400 },
  { name: 'Петров С.', orders: 38, revenue: 156200 },
  { name: 'Сидоров В.', orders: 35, revenue: 144800 },
  { name: 'Козлов Д.', orders: 30, revenue: 128600 },
  { name: 'Новиков Е.', orders: 28, revenue: 112000 },
  { name: 'Морозов И.', orders: 25, revenue: 98400 },
  { name: 'Волков Р.', orders: 22, revenue: 87200 },
  { name: 'Лебедев К.', orders: 27, revenue: 103600 },
];

const ENGINEER_TABLE: EngineerRow[] = [
  { name: 'Иванов А.С.', orders: 42, done: 40, donePercent: 95.2, slaPercent: 97, avgTime: '2.8ч', revenue: 187400 },
  { name: 'Петров С.Н.', orders: 38, done: 36, donePercent: 94.7, slaPercent: 95, avgTime: '3.1ч', revenue: 156200 },
  { name: 'Сидоров В.П.', orders: 35, done: 33, donePercent: 94.3, slaPercent: 96, avgTime: '3.4ч', revenue: 144800 },
  { name: 'Козлов Д.А.', orders: 30, done: 27, donePercent: 90.0, slaPercent: 91, avgTime: '3.6ч', revenue: 128600 },
  { name: 'Новиков Е.В.', orders: 28, done: 25, donePercent: 89.3, slaPercent: 89, avgTime: '3.9ч', revenue: 112000 },
  { name: 'Морозов И.К.', orders: 25, done: 24, donePercent: 96.0, slaPercent: 98, avgTime: '2.6ч', revenue: 98400 },
  { name: 'Волков Р.О.', orders: 22, done: 20, donePercent: 90.9, slaPercent: 92, avgTime: '3.7ч', revenue: 87200 },
  { name: 'Лебедев К.И.', orders: 27, done: 13, donePercent: 48.1, slaPercent: 88, avgTime: '4.2ч', revenue: 103600 },
];

const CLIENT_TABLE: ClientRow[] = [
  { name: 'ООО «АрктикСтрой»', type: 'Юр.лицо', orders: 24, total: 312400, lastVisit: '14.05.2026', contract: 'Активный' },
  { name: 'ЗАО «ТехноХолод»', type: 'Юр.лицо', orders: 19, total: 248700, lastVisit: '12.05.2026', contract: 'Активный' },
  { name: 'Иванов Пётр А.', type: 'Физ.лицо', orders: 15, total: 87600, lastVisit: '10.05.2026', contract: 'Нет' },
  { name: 'ООО «КлиматГрупп»', type: 'Юр.лицо', orders: 14, total: 196200, lastVisit: '08.05.2026', contract: 'Активный' },
  { name: 'ИП Смирнова Е.В.', type: 'Физ.лицо', orders: 13, total: 74300, lastVisit: '15.05.2026', contract: 'Нет' },
  { name: 'АО «ФудРетейл»', type: 'Юр.лицо', orders: 12, total: 178900, lastVisit: '11.05.2026', contract: 'Активный' },
  { name: 'Петрова Наталья М.', type: 'Физ.лицо', orders: 11, total: 62100, lastVisit: '07.05.2026', contract: 'Нет' },
  { name: 'ООО «БизнесЦентр»', type: 'Юр.лицо', orders: 10, total: 134500, lastVisit: '13.05.2026', contract: 'Истёк' },
  { name: 'Козлов Виктор Д.', type: 'Физ.лицо', orders: 9, total: 48200, lastVisit: '06.05.2026', contract: 'Нет' },
  { name: 'ООО «МегаОфис»', type: 'Юр.лицо', orders: 9, total: 112300, lastVisit: '09.05.2026', contract: 'Активный' },
  { name: 'ЗАО «СтройИнвест»', type: 'Юр.лицо', orders: 8, total: 98700, lastVisit: '05.05.2026', contract: 'Истёк' },
  { name: 'Морозова Ирина Б.', type: 'Физ.лицо', orders: 7, total: 39400, lastVisit: '04.05.2026', contract: 'Нет' },
  { name: 'ИП Волков Р.О.', type: 'Физ.лицо', orders: 7, total: 43600, lastVisit: '03.05.2026', contract: 'Нет' },
  { name: 'ООО «АрсеналТрейд»', type: 'Юр.лицо', orders: 6, total: 76800, lastVisit: '02.05.2026', contract: 'Активный' },
  { name: 'Лебедева Татьяна А.', type: 'Физ.лицо', orders: 6, total: 34200, lastVisit: '01.05.2026', contract: 'Нет' },
];

const BRAND_CHART_DATA = [
  { brand: 'Daikin', value: 68 },
  { brand: 'Mitsubishi', value: 54 },
  { brand: 'LG', value: 48 },
  { brand: 'Gree', value: 36 },
  { brand: 'Haier', value: 25 },
  { brand: 'Midea', value: 16 },
];

const BRAND_TABLE: BrandRow[] = [
  { brand: 'Daikin', orders: 68, avgRepairTime: '2.9ч', topFailure: 'Утечка хладагента' },
  { brand: 'Mitsubishi Electric', orders: 54, avgRepairTime: '3.1ч', topFailure: 'Ошибка платы управления' },
  { brand: 'LG', orders: 48, avgRepairTime: '2.7ч', topFailure: 'Засор дренажа' },
  { brand: 'Gree', orders: 36, avgRepairTime: '3.5ч', topFailure: 'Неисправность компрессора' },
  { brand: 'Haier', orders: 25, avgRepairTime: '3.2ч', topFailure: 'Сбой инвертора' },
  { brand: 'Midea', orders: 16, avgRepairTime: '2.8ч', topFailure: 'Загрязнение фильтров' },
];

const ENGINEERS = [
  'Все инженеры',
  'Иванов А.С.',
  'Петров С.Н.',
  'Сидоров В.П.',
  'Козлов Д.А.',
  'Новиков Е.В.',
  'Морозов И.К.',
  'Волков Р.О.',
  'Лебедев К.И.',
];

const CHART_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

// ─── Helper Components ────────────────────────────────────────────────────────

function SlaPercentBadge({ value }: { value: number }) {
  const color =
    value >= 95 ? 'bg-green-100 text-green-700' :
    value >= 90 ? 'bg-yellow-100 text-yellow-700' :
    'bg-red-100 text-red-700';
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>{value}%</span>;
}

function ContractBadge({ status }: { status: ClientRow['contract'] }) {
  const map = {
    'Активный': 'bg-green-100 text-green-700',
    'Истёк': 'bg-red-100 text-red-700',
    'Нет': 'bg-gray-100 text-gray-600',
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[status]}`}>{status}</span>;
}

function TrendIcon({ trend, value }: { trend: KPICard['trend']; value: string }) {
  if (trend === 'up') return <span className="text-green-600 text-xs flex items-center gap-1"><Icon name="TrendingUp" size={12} />{value}</span>;
  if (trend === 'down') return <span className="text-emerald-600 text-xs flex items-center gap-1"><Icon name="TrendingDown" size={12} />{value}</span>;
  return <span className="text-gray-500 text-xs">{value}</span>;
}

// ─── Tabs Content ─────────────────────────────────────────────────────────────

function TabOverall() {
  return (
    <div className="space-y-6">
      {/* AreaChart: план vs факт */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Наряды по дням (план vs факт)</CardTitle>
          <CardDescription>Май 2026 · 30 дней</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={DAILY_DATA} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradPlan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradFact" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={4} />
              <YAxis tick={{ fontSize: 11 }} width={28} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="plan" name="План" stroke="#3b82f6" fill="url(#gradPlan)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="fact" name="Факт" stroke="#10b981" fill="url(#gradFact)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BarChart: по типам */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Наряды по типам</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={TYPE_DATA} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} width={30} />
                <Tooltip />
                <Bar dataKey="value" name="Нарядов" radius={[4, 4, 0, 0]}>
                  {TYPE_DATA.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* PieChart: по статусам */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Распределение по статусу</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={STATUS_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {STATUS_DATA.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} нарядов`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-1 justify-center">
              {STATUS_DATA.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: s.fill }} />
                  {s.name} <span className="font-medium text-gray-800">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TabEngineers() {
  return (
    <div className="space-y-6">
      {/* ComposedChart: нарядов + выручка */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Нагрузка и выручка по инженерам</CardTitle>
          <CardDescription>Нарядов (столбцы) · Выручка ₽ (линия)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={ENGINEER_CHART_DATA} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} width={30} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} width={64} tickFormatter={(v) => `${(v / 1000).toFixed(0)}к`} />
              <Tooltip formatter={(v, name) => name === 'revenue' ? [`${Number(v).toLocaleString('ru')} ₽`, 'Выручка'] : [v, 'Нарядов']} />
              <Legend />
              <Bar yAxisId="left" dataKey="orders" name="Нарядов" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="revenue" name="Выручка" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Таблица инженеров */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Показатели по инженерам</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="pl-4">Инженер</TableHead>
                <TableHead className="text-center">Нарядов</TableHead>
                <TableHead className="text-center">Выполнено</TableHead>
                <TableHead className="text-center">SLA%</TableHead>
                <TableHead className="text-center">Ср. время</TableHead>
                <TableHead className="text-right pr-4">Выручка</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ENGINEER_TABLE.map((row) => (
                <TableRow key={row.name} className="hover:bg-gray-50">
                  <TableCell className="pl-4 font-medium">{row.name}</TableCell>
                  <TableCell className="text-center">{row.orders}</TableCell>
                  <TableCell className="text-center">
                    {row.done} <span className="text-gray-400 text-xs">({row.donePercent}%)</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <SlaPercentBadge value={row.slaPercent} />
                  </TableCell>
                  <TableCell className="text-center">{row.avgTime}</TableCell>
                  <TableCell className="text-right pr-4 font-medium">
                    {row.revenue.toLocaleString('ru')} ₽
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

function TabClients() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Топ-15 клиентов по количеству нарядов</CardTitle>
        <CardDescription>Май 2026</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="pl-4 w-8">#</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead className="text-center">Тип</TableHead>
              <TableHead className="text-center">Нарядов</TableHead>
              <TableHead className="text-right">Сумма</TableHead>
              <TableHead className="text-center">Последний визит</TableHead>
              <TableHead className="text-center pr-4">Договор</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {CLIENT_TABLE.map((row, idx) => (
              <TableRow key={row.name} className="hover:bg-gray-50">
                <TableCell className="pl-4 text-gray-400 text-sm">{idx + 1}</TableCell>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={row.type === 'Юр.лицо' ? 'default' : 'secondary'} className="text-xs">
                    {row.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">{row.orders}</TableCell>
                <TableCell className="text-right font-medium">
                  {row.total.toLocaleString('ru')} ₽
                </TableCell>
                <TableCell className="text-center text-sm text-gray-600">{row.lastVisit}</TableCell>
                <TableCell className="text-center pr-4">
                  <ContractBadge status={row.contract} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TabBrands() {
  return (
    <div className="space-y-6">
      {/* Horizontal BarChart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Наряды по брендам</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={BRAND_CHART_DATA}
              layout="vertical"
              margin={{ top: 4, right: 24, left: 60, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="brand" tick={{ fontSize: 12 }} width={60} />
              <Tooltip formatter={(v) => [`${v} нарядов`]} />
              <Bar dataKey="value" name="Нарядов" radius={[0, 4, 4, 0]}>
                {BRAND_CHART_DATA.map((_, idx) => (
                  <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Таблица по брендам */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Детализация по брендам</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="pl-4">Бренд</TableHead>
                <TableHead className="text-center">Нарядов</TableHead>
                <TableHead className="text-center">Ср. время ремонта</TableHead>
                <TableHead className="pr-4">Частая поломка</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {BRAND_TABLE.map((row, idx) => (
                <TableRow key={row.brand} className="hover:bg-gray-50">
                  <TableCell className="pl-4 font-medium flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ background: CHART_COLORS[idx % CHART_COLORS.length] }}
                    />
                    {row.brand}
                  </TableCell>
                  <TableCell className="text-center">{row.orders}</TableCell>
                  <TableCell className="text-center">{row.avgRepairTime}</TableCell>
                  <TableCell className="pr-4 text-gray-600 text-sm">{row.topFailure}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WorkOrderReportFull() {
  const [period, setPeriod] = useState('month');
  const [engineer, setEngineer] = useState('all');
  const [orderType, setOrderType] = useState('all');
  const [search, setSearch] = useState('');

  function handleExportExcel() {
    toast.success('Экспорт Excel запущен', {
      description: 'Файл будет готов через несколько секунд и скачается автоматически.',
    });
  }

  function handleExportPDF() {
    toast.success('Экспорт PDF запущен', {
      description: 'Генерация отчёта займёт несколько секунд.',
    });
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 min-h-screen">
      {/* ── Header ── */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <Icon name="ClipboardList" size={18} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 leading-tight">Отчёты по нарядам</h1>
              <p className="text-xs text-gray-500">Аналитика и статистика выполненных работ</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-36">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Период" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Эта неделя</SelectItem>
                  <SelectItem value="month">Этот месяц</SelectItem>
                  <SelectItem value="quarter">Квартал</SelectItem>
                  <SelectItem value="year">Год</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-40">
              <Select value={engineer} onValueChange={setEngineer}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Инженер" />
                </SelectTrigger>
                <SelectContent>
                  {ENGINEERS.map((e) => (
                    <SelectItem key={e} value={e === 'Все инженеры' ? 'all' : e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-40">
              <Select value={orderType} onValueChange={setOrderType}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Тип наряда" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  <SelectItem value="repair">Ремонт</SelectItem>
                  <SelectItem value="maintenance">ТО</SelectItem>
                  <SelectItem value="installation">Монтаж</SelectItem>
                  <SelectItem value="warranty">Гарантия</SelectItem>
                  <SelectItem value="zno">ЗНО</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Icon name="Search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                className="h-8 pl-8 w-40 text-sm"
                placeholder="Поиск..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={handleExportExcel}>
              <Icon name="FileSpreadsheet" size={14} />
              Excel
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={handleExportPDF}>
              <Icon name="FileText" size={14} />
              PDF
            </Button>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="px-6 pt-5 pb-2 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((kpi) => (
          <Card key={kpi.label} className="border shadow-sm">
            <CardContent className="pt-4 pb-4 px-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
                  <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Icon name={kpi.icon as any} size={17} className="text-gray-500" />
                </div>
              </div>
              <div className="mt-2">
                <TrendIcon trend={kpi.trend} value={kpi.trendValue} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="px-6 pb-6 flex-1">
        <Tabs defaultValue="overall" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overall" className="gap-1.5">
              <Icon name="LayoutDashboard" size={14} />
              Общий
            </TabsTrigger>
            <TabsTrigger value="engineers" className="gap-1.5">
              <Icon name="HardHat" size={14} />
              По инженерам
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-1.5">
              <Icon name="Users" size={14} />
              По клиентам
            </TabsTrigger>
            <TabsTrigger value="brands" className="gap-1.5">
              <Icon name="Tag" size={14} />
              По брендам
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overall">
            <TabOverall />
          </TabsContent>
          <TabsContent value="engineers">
            <TabEngineers />
          </TabsContent>
          <TabsContent value="clients">
            <TabClients />
          </TabsContent>
          <TabsContent value="brands">
            <TabBrands />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
