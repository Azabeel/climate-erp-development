import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const PERIODS = ['Сегодня', 'Неделя', 'Месяц', 'Квартал', 'Год'] as const;
type Period = typeof PERIODS[number];

// ─── DATA ───────────────────────────────────────────────────────────────────

const kpiByPeriod: Record<Period, {
  created: number; closed: number; avgReaction: number; avgExecution: number;
  sla: number; revenue: number; margin: number; nps: number;
}> = {
  'Сегодня':  { created: 12, closed: 9,   avgReaction: 1.2, avgExecution: 3.4, sla: 97, revenue: 148200,  margin: 38, nps: 82 },
  'Неделя':   { created: 74, closed: 68,  avgReaction: 1.5, avgExecution: 3.8, sla: 95, revenue: 891000,  margin: 37, nps: 79 },
  'Месяц':    { created: 312, closed: 289, avgReaction: 1.8, avgExecution: 4.1, sla: 94, revenue: 3870000, margin: 36, nps: 81 },
  'Квартал':  { created: 941, closed: 878, avgReaction: 1.9, avgExecution: 4.3, sla: 93, revenue: 11200000,margin: 35, nps: 78 },
  'Год':      { created: 3820, closed: 3540, avgReaction: 2.1, avgExecution: 4.6, sla: 92, revenue: 46800000, margin: 34, nps: 76 },
};

const dailyChartData = [
  { day: '5 мая',  created: 14, closed: 11, sla: 96 },
  { day: '6 мая',  created: 9,  closed: 12, sla: 98 },
  { day: '7 мая',  created: 16, closed: 13, sla: 94 },
  { day: '8 мая',  created: 11, closed: 10, sla: 97 },
  { day: '9 мая',  created: 7,  closed: 8,  sla: 100 },
  { day: '10 мая', created: 13, closed: 11, sla: 95 },
  { day: '11 мая', created: 12, closed: 9,  sla: 97 },
];

const monthlyChartData = [
  { month: 'Июн',  created: 289, closed: 271, sla: 91 },
  { month: 'Июл',  created: 312, closed: 298, sla: 93 },
  { month: 'Авг',  created: 334, closed: 319, sla: 92 },
  { month: 'Сен',  created: 298, closed: 284, sla: 94 },
  { month: 'Окт',  created: 356, closed: 341, sla: 93 },
  { month: 'Ноя',  created: 321, closed: 308, sla: 95 },
  { month: 'Дек',  created: 278, closed: 265, sla: 96 },
  { month: 'Янв',  created: 245, closed: 231, sla: 94 },
  { month: 'Фев',  created: 267, closed: 253, sla: 95 },
  { month: 'Мар',  created: 342, closed: 328, sla: 96 },
  { month: 'Апр',  created: 318, closed: 303, sla: 94 },
  { month: 'Май',  created: 312, closed: 289, sla: 94 },
];

const engineerData = [
  { name: 'Иванов А.С.',    orders: 47, avgTime: 3.2, rating: 4.8, revenue: 287000, fuel: 14200, radar: { speed: 90, quality: 95, sla: 92, client: 96, volume: 85 } },
  { name: 'Петров В.Н.',    orders: 42, avgTime: 3.8, rating: 4.6, revenue: 261000, fuel: 12800, radar: { speed: 78, quality: 88, sla: 89, client: 92, volume: 80 } },
  { name: 'Сидоров М.П.',   orders: 51, avgTime: 3.1, rating: 4.9, revenue: 318000, fuel: 16100, radar: { speed: 94, quality: 97, sla: 96, client: 98, volume: 92 } },
  { name: 'Козлов Д.Р.',    orders: 38, avgTime: 4.2, rating: 4.4, revenue: 224000, fuel: 11200, radar: { speed: 70, quality: 82, sla: 84, client: 88, volume: 72 } },
  { name: 'Новиков О.В.',   orders: 44, avgTime: 3.6, rating: 4.7, revenue: 271000, fuel: 13500, radar: { speed: 82, quality: 91, sla: 90, client: 94, volume: 84 } },
  { name: 'Морозов Е.К.',   orders: 36, avgTime: 4.5, rating: 4.3, revenue: 198000, fuel: 9800,  radar: { speed: 65, quality: 79, sla: 80, client: 86, volume: 68 } },
  { name: 'Волков С.А.',    orders: 49, avgTime: 3.4, rating: 4.7, revenue: 304000, fuel: 15200, radar: { speed: 88, quality: 93, sla: 93, client: 95, volume: 90 } },
  { name: 'Захаров Т.И.',   orders: 33, avgTime: 5.0, rating: 4.1, revenue: 172000, fuel: 8600,  radar: { speed: 58, quality: 74, sla: 75, client: 82, volume: 62 } },
];

const clientData = [
  { name: 'ТРЦ «Мега Парк»',     type: 'Юр. лицо',  total: 124, active: 8,  revenue: 1840000, margin: 38, lastDate: '10.05.2026', nps: 87 },
  { name: 'АО «Северсталь»',      type: 'Юр. лицо',  total: 98,  active: 5,  revenue: 1420000, margin: 41, lastDate: '09.05.2026', nps: 92 },
  { name: 'Гостиница «Азимут»',   type: 'Юр. лицо',  total: 76,  active: 3,  revenue: 980000,  margin: 35, lastDate: '08.05.2026', nps: 79 },
  { name: 'ООО «ТехноМир»',       type: 'Юр. лицо',  total: 62,  active: 4,  revenue: 754000,  margin: 36, lastDate: '11.05.2026', nps: 84 },
  { name: 'Иванов А.П.',          type: 'Физ. лицо', total: 18,  active: 1,  revenue: 89400,   margin: 45, lastDate: '07.05.2026', nps: 95 },
  { name: 'Петрова С.М.',         type: 'Физ. лицо', total: 14,  active: 0,  revenue: 62100,   margin: 48, lastDate: '03.05.2026', nps: 90 },
  { name: 'ЖК «Солнечный»',       type: 'Юр. лицо',  total: 89,  active: 6,  revenue: 1120000, margin: 33, lastDate: '10.05.2026', nps: 76 },
  { name: 'ИП Кузнецов В.Г.',     type: 'Физ. лицо', total: 31,  active: 2,  revenue: 187000,  margin: 42, lastDate: '06.05.2026', nps: 88 },
];

const clientTypeDistrib = [
  { name: 'Юридические лица', value: 68, color: '#3B82F6' },
  { name: 'Физические лица',  value: 32, color: '#10B981' },
];

const equipmentData = [
  { type: 'Сплит-системы',        count: 412, orders: 187, topFault: 'Утечка хладагента' },
  { type: 'Мульти-сплит системы', count: 84,  orders: 43,  topFault: 'Неисправность блока управления' },
  { type: 'Чиллеры',              count: 38,  orders: 29,  topFault: 'Засор фильтра-осушителя' },
  { type: 'Фанкойлы',             count: 127, orders: 62,  topFault: 'Засор теплообменника' },
  { type: 'VRV/VRF системы',      count: 56,  orders: 38,  topFault: 'Сбой контроллера' },
  { type: 'Промышленные кондиц.', count: 24,  orders: 21,  topFault: 'Износ компрессора' },
  { type: 'Вентиляция',           count: 93,  orders: 44,  topFault: 'Загрязнение фильтров' },
  { type: 'Тепловые насосы',      count: 31,  orders: 18,  topFault: 'Низкое давление в системе' },
];

const equipmentChartData = equipmentData.map(e => ({ name: e.type.split(' ')[0], orders: e.orders, count: e.count }));

const financeData = [
  { month: 'Июн', revenue: 3240000, costs: 2124000, margin: 1116000 },
  { month: 'Июл', revenue: 3480000, costs: 2241000, margin: 1239000 },
  { month: 'Авг', revenue: 3720000, costs: 2382000, margin: 1338000 },
  { month: 'Сен', revenue: 3380000, costs: 2198000, margin: 1182000 },
  { month: 'Окт', revenue: 3890000, costs: 2512000, margin: 1378000 },
  { month: 'Ноя', revenue: 3620000, costs: 2321000, margin: 1299000 },
  { month: 'Дек', revenue: 3150000, costs: 2051000, margin: 1099000 },
  { month: 'Янв', revenue: 2870000, costs: 1892000, margin: 978000  },
  { month: 'Фев', revenue: 3120000, costs: 2014000, margin: 1106000 },
  { month: 'Мар', revenue: 3740000, costs: 2392000, margin: 1348000 },
  { month: 'Апр', revenue: 3560000, costs: 2276000, margin: 1284000 },
  { month: 'Май', revenue: 3870000, costs: 2477000, margin: 1393000 },
];

const paymentStatusData = [
  { name: 'Оплачено',         value: 68, color: '#10B981' },
  { name: 'Частично',         value: 18, color: '#F59E0B' },
  { name: 'Не оплачено',      value: 14, color: '#EF4444' },
];

const debtorsData = [
  { name: 'ЖК «Солнечный»',       debt: 284000, days: 47, lastPayment: '24.03.2026' },
  { name: 'ООО «СтройГрупп»',     debt: 198000, days: 62, lastPayment: '09.03.2026' },
  { name: 'ТЦ «Радуга»',          debt: 143000, days: 34, lastPayment: '07.04.2026' },
  { name: 'ИП Соловьёв Г.В.',     debt: 87000,  days: 28, lastPayment: '13.04.2026' },
  { name: 'ФГУП «Ремонт-Сервис»', debt: 62000,  days: 91, lastPayment: '09.02.2026' },
];

const formatMoney = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)} млн ₽`
    : `${(n / 1000).toFixed(0)} тыс ₽`;

// ─── KPI CARD ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string; value: string; icon: string;
  color: string; bg: string; sub?: string;
}
const KpiCard = ({ title, value, icon, color, bg, sub }: KpiCardProps) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 truncate mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0 ml-2`}>
          <Icon name={icon} size={20} className={color} />
        </div>
      </div>
    </CardContent>
  </Card>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const Reports = () => {
  const [period, setPeriod] = useState<Period>('Месяц');
  const [clientSearch, setClientSearch] = useState('');
  const [selectedEngineer, setSelectedEngineer] = useState(0);

  const kpi = kpiByPeriod[period];
  const chartData = period === 'Сегодня' || period === 'Неделя' ? dailyChartData : monthlyChartData;
  const xKey = period === 'Сегодня' || period === 'Неделя' ? 'day' : 'month';

  const filteredClients = clientData.filter(c =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const eng = engineerData[selectedEngineer];
  const radarData = eng
    ? Object.entries(eng.radar).map(([k, v]) => ({
        subject: { speed: 'Скорость', quality: 'Качество', sla: 'SLA', client: 'Клиенты', volume: 'Объём' }[k] ?? k,
        value: v,
      }))
    : [];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Аналитика и отчёты</h2>
          <p className="text-sm text-gray-500">Сводная статистика по работе сервисного центра</p>
        </div>
        <Button variant="outline" size="sm">
          <Icon name="Download" size={16} className="mr-2" />
          Экспорт
        </Button>
      </div>

      <Tabs defaultValue="summary">
        <TabsList className="flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="summary">Сводка</TabsTrigger>
          <TabsTrigger value="engineers">По инженерам</TabsTrigger>
          <TabsTrigger value="clients">По клиентам</TabsTrigger>
          <TabsTrigger value="equipment">По оборудованию</TabsTrigger>
          <TabsTrigger value="finance">Финансы</TabsTrigger>
        </TabsList>

        {/* ── TAB 1: СВОДКА ─────────────────────────────────────────────── */}
        <TabsContent value="summary" className="space-y-4 mt-4">
          {/* Period selector */}
          <div className="flex gap-2 flex-wrap">
            {PERIODS.map(p => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod(p)}
              >
                {p}
              </Button>
            ))}
          </div>

          {/* KPI grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard title="Заявок создано"          value={kpi.created.toLocaleString('ru')}   icon="ClipboardList" color="text-blue-600"   bg="bg-blue-50"   />
            <KpiCard title="Нарядов закрыто"         value={kpi.closed.toLocaleString('ru')}    icon="CheckCircle"   color="text-green-600"  bg="bg-green-50"  />
            <KpiCard title="Ср. время реакции"       value={`${kpi.avgReaction} ч`}             icon="Clock"         color="text-amber-600"  bg="bg-amber-50"  sub="с момента создания" />
            <KpiCard title="Ср. время выполнения"    value={`${kpi.avgExecution} ч`}            icon="Timer"         color="text-orange-600" bg="bg-orange-50" />
            <KpiCard title="SLA соблюдено"           value={`${kpi.sla}%`}                      icon="Target"        color="text-purple-600" bg="bg-purple-50" />
            <KpiCard title="Выручка"                 value={formatMoney(kpi.revenue)}           icon="TrendingUp"    color="text-indigo-600" bg="bg-indigo-50" />
            <KpiCard title="Маржа"                   value={`${kpi.margin}%`}                   icon="Percent"       color="text-teal-600"   bg="bg-teal-50"   />
            <KpiCard title="NPS клиентов"            value={kpi.nps.toString()}                 icon="Star"          color="text-yellow-600" bg="bg-yellow-50" />
          </div>

          {/* Bar chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Заявки: создано vs выполнено</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="created" name="Создано"   fill="#3B82F6" radius={[4,4,0,0]} />
                  <Bar dataKey="closed"  name="Выполнено" fill="#10B981" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* SLA line chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">SLA соблюдение, %</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
                  <YAxis domain={[85, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v}%`, 'SLA']} />
                  <Line type="monotone" dataKey="sla" name="SLA %" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 2: ПО ИНЖЕНЕРАМ ───────────────────────────────────────── */}
        <TabsContent value="engineers" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Table */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Показатели инженеров за месяц</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Инженер</TableHead>
                      <TableHead className="text-right">Нарядов</TableHead>
                      <TableHead className="text-right">Ср. время (ч)</TableHead>
                      <TableHead className="text-right">Рейтинг</TableHead>
                      <TableHead className="text-right">Выручка</TableHead>
                      <TableHead className="text-right">ГСМ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {engineerData.map((eng, i) => (
                      <TableRow
                        key={eng.name}
                        className={`cursor-pointer ${selectedEngineer === i ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                        onClick={() => setSelectedEngineer(i)}
                      >
                        <TableCell className="font-medium">{eng.name}</TableCell>
                        <TableCell className="text-right">{eng.orders}</TableCell>
                        <TableCell className="text-right">{eng.avgTime}</TableCell>
                        <TableCell className="text-right">
                          <span className="text-yellow-600 font-medium">★ {eng.rating}</span>
                        </TableCell>
                        <TableCell className="text-right">{eng.revenue.toLocaleString('ru')} ₽</TableCell>
                        <TableCell className="text-right">{eng.fuel.toLocaleString('ru')} ₽</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Bar chart top engineers */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Выручка по инженерам, ₽</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={engineerData.map(e => ({ name: e.name.split(' ')[0], revenue: e.revenue }))} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}к`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} />
                    <Tooltip formatter={(v: number) => [`${v.toLocaleString('ru')} ₽`, 'Выручка']} />
                    <Bar dataKey="revenue" fill="#6366F1" radius={[0,4,4,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Radar chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  Профиль эффективности: {engineerData[selectedEngineer]?.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar name="Балл" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── TAB 3: ПО КЛИЕНТАМ ────────────────────────────────────────── */}
        <TabsContent value="clients" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Клиенты</CardTitle>
                  <Input
                    placeholder="Поиск клиента..."
                    value={clientSearch}
                    onChange={e => setClientSearch(e.target.value)}
                    className="h-8 w-48 text-sm"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Клиент</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead className="text-right">Заявок</TableHead>
                      <TableHead className="text-right">Активных</TableHead>
                      <TableHead className="text-right">Выручка</TableHead>
                      <TableHead className="text-right">Маржа%</TableHead>
                      <TableHead className="text-right">NPS</TableHead>
                      <TableHead>Последняя</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map(c => (
                      <TableRow key={c.name} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-sm">{c.name}</TableCell>
                        <TableCell>
                          <Badge variant={c.type === 'Юр. лицо' ? 'default' : 'secondary'} className="text-xs">
                            {c.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{c.total}</TableCell>
                        <TableCell className="text-right">
                          {c.active > 0 ? <span className="text-blue-600 font-medium">{c.active}</span> : '—'}
                        </TableCell>
                        <TableCell className="text-right text-sm">{c.revenue.toLocaleString('ru')} ₽</TableCell>
                        <TableCell className="text-right">
                          <span className={c.margin >= 40 ? 'text-green-600' : 'text-gray-700'}>{c.margin}%</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={c.nps >= 85 ? 'text-green-600 font-medium' : 'text-amber-600'}>{c.nps}</span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">{c.lastDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pie chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Распределение по типу</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={clientTypeDistrib} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                      {clientTypeDistrib.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v}%`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── TAB 4: ПО ОБОРУДОВАНИЮ ────────────────────────────────────── */}
        <TabsContent value="equipment" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Типы оборудования — статистика заявок</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Тип оборудования</TableHead>
                      <TableHead className="text-right">Объектов</TableHead>
                      <TableHead className="text-right">Заявок за период</TableHead>
                      <TableHead>Самая частая неисправность</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {equipmentData.map(eq => (
                      <TableRow key={eq.type} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{eq.type}</TableCell>
                        <TableCell className="text-right">{eq.count}</TableCell>
                        <TableCell className="text-right">{eq.orders}</TableCell>
                        <TableCell className="text-sm text-gray-600">{eq.topFault}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Заявки по типам оборудования</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={equipmentChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="orders" name="Заявок"   fill="#EF4444" radius={[4,4,0,0]} />
                    <Bar dataKey="count"  name="Объектов" fill="#3B82F6" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── TAB 5: ФИНАНСЫ ────────────────────────────────────────────── */}
        <TabsContent value="finance" className="space-y-4 mt-4">
          {/* Area chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Выручка и себестоимость по месяцам, ₽</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={financeData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="costsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="marginGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString('ru')} ₽`, '']} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" name="Выручка"       stroke="#3B82F6" fill="url(#revGrad)"    strokeWidth={2} />
                  <Area type="monotone" dataKey="costs"   name="Себестоимость" stroke="#EF4444" fill="url(#costsGrad)"  strokeWidth={2} />
                  <Area type="monotone" dataKey="margin"  name="Маржа"         stroke="#10B981" fill="url(#marginGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Payment donut */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Статус оплаты заявок</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie data={paymentStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value">
                      {paymentStatusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v}%`, '']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {paymentStatusData.map(d => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: d.color }} />
                      <span className="text-sm text-gray-700">{d.name}</span>
                      <span className="text-sm font-bold ml-auto">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Debtors */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Топ должники</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Клиент</TableHead>
                      <TableHead className="text-right">Долг</TableHead>
                      <TableHead className="text-right">Дней</TableHead>
                      <TableHead>Посл. оплата</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {debtorsData.map(d => (
                      <TableRow key={d.name} className="hover:bg-gray-50">
                        <TableCell className="text-sm font-medium">{d.name}</TableCell>
                        <TableCell className="text-right text-red-600 font-medium text-sm">
                          {d.debt.toLocaleString('ru')} ₽
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={d.days > 60 ? 'destructive' : 'secondary'} className="text-xs">
                            {d.days}д
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">{d.lastPayment}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
