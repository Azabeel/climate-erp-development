import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Building2, Radio, TrendingUp, Wrench, DollarSign,
  AlertTriangle, FileWarning, MapPin, CheckSquare, Square,
  Clock, Star, Navigation, Phone, Mail, Users,
} from 'lucide-react';
import { toast } from 'sonner';

type Role = 'director' | 'dispatcher' | 'manager' | 'engineer' | 'finance';

const ROLES: { key: Role; label: string; icon: React.ReactNode }[] = [
  { key: 'director', label: 'Руководитель', icon: <Building2 className="w-4 h-4" /> },
  { key: 'dispatcher', label: 'Диспетчер', icon: <Radio className="w-4 h-4" /> },
  { key: 'manager', label: 'Менеджер', icon: <TrendingUp className="w-4 h-4" /> },
  { key: 'engineer', label: 'Инженер', icon: <Wrench className="w-4 h-4" /> },
  { key: 'finance', label: 'Финансист', icon: <DollarSign className="w-4 h-4" /> },
];

// ─── Director data ────────────────────────────────────────────────────────────
const directorKpis = [
  { label: 'Выручка MTD', value: '4.2 млн ₽', change: '+18%', positive: true },
  { label: 'NPS', value: '87', change: '+3', positive: true },
  { label: 'Активные заявки', value: '47', change: '+8%', positive: true },
  { label: 'Маржинальность', value: '34.2%', change: '+2.1%', positive: true },
];

const revenueMonthly = [
  { month: 'Янв', revenue: 2.8 },
  { month: 'Фев', revenue: 3.1 },
  { month: 'Мар', revenue: 3.4 },
  { month: 'Апр', revenue: 3.9 },
  { month: 'Май', revenue: 4.2 },
  { month: 'Июн', revenue: 4.5 },
];

const revenueByType = [
  { type: 'Ремонт', amount: 1.8 },
  { type: 'ТО', amount: 1.1 },
  { type: 'Монтаж', amount: 0.8 },
  { type: 'ЗИП', amount: 0.5 },
];

const topClients = [
  { name: 'ООО «АгроХолдинг»', revenue: '840 тыс ₽', orders: 12, nps: 91 },
  { name: 'ТЦ «Галактика»', revenue: '720 тыс ₽', orders: 9, nps: 88 },
  { name: 'Завод «Металлург»', revenue: '615 тыс ₽', orders: 7, nps: 85 },
  { name: 'БЦ «Олимп»', revenue: '530 тыс ₽', orders: 6, nps: 90 },
  { name: 'Гипермаркет «Магнит»', revenue: '480 тыс ₽', orders: 5, nps: 82 },
];

// ─── Dispatcher data ──────────────────────────────────────────────────────────
const dispatcherKpis = [
  { label: 'Открытых заявок', value: '23' },
  { label: 'В пути инженеров', value: '8' },
  { label: 'Свободных инженеров', value: '4' },
  { label: 'SLA под угрозой', value: '2', alert: true },
];

const liveOrders = [
  { id: 'WO-2026-000341', status: 'В пути', engineer: 'Петров А.', eta: '14:30', address: 'ул. Ленина, 45' },
  { id: 'WO-2026-000342', status: 'На объекте', engineer: 'Иванов К.', eta: '—', address: 'пр. Мира, 12' },
  { id: 'WO-2026-000343', status: 'В работе', engineer: 'Сидоров М.', eta: '—', address: 'ул. Садовая, 8' },
  { id: 'WO-2026-000344', status: 'Новая', engineer: 'Не назначен', eta: '—', address: 'ул. Гагарина, 71' },
  { id: 'WO-2026-000345', status: 'В пути', engineer: 'Козлов Р.', eta: '15:10', address: 'ул. Пушкина, 3' },
  { id: 'WO-2026-000346', status: 'Ожидание ЗИП', engineer: 'Новиков Д.', eta: '—', address: 'пр. Победы, 19' },
];

const slaAlerts = [
  { id: 'WO-2026-000312', client: 'ООО «АгроХолдинг»', countdown: '00:47 до нарушения' },
  { id: 'WO-2026-000298', client: 'БЦ «Олимп»', countdown: '01:12 до нарушения' },
];

const engineers = [
  { name: 'Петров А.', status: 'yellow' },
  { name: 'Иванов К.', status: 'red' },
  { name: 'Сидоров М.', status: 'red' },
  { name: 'Козлов Р.', status: 'yellow' },
  { name: 'Новиков Д.', status: 'red' },
  { name: 'Морозов В.', status: 'green' },
  { name: 'Алексеев И.', status: 'green' },
  { name: 'Громов П.', status: 'red' },
  { name: 'Лебедев С.', status: 'yellow' },
  { name: 'Зайцев О.', status: 'green' },
  { name: 'Власов Е.', status: 'green' },
  { name: 'Фёдоров Н.', status: 'red' },
];

const engineerDotColor = (s: string) =>
  s === 'green' ? 'bg-green-500' : s === 'yellow' ? 'bg-yellow-400' : 'bg-red-500';

// ─── Manager data ─────────────────────────────────────────────────────────────
const pipelineStages = [
  { stage: 'Лиды', count: 45, color: '#6366f1' },
  { stage: 'Квалификация', count: 28, color: '#8b5cf6' },
  { stage: 'Встреча', count: 15, color: '#a78bfa' },
  { stage: 'КП', count: 9, color: '#c4b5fd' },
  { stage: 'Переговоры', count: 5, color: '#ddd6fe' },
  { stage: 'Сделка', count: 3, color: '#10b981' },
];

const managerKpis = [
  { label: 'MRR', value: '1.84 млн' },
  { label: 'Конверсия', value: '6.7%' },
  { label: 'Ср. сделка', value: '612k' },
  { label: 'Pipeline', value: '8.4 млн' },
];

const topOpportunities = [
  { client: 'ООО «СтройГрупп»', stage: 'Переговоры', amount: '1.2 млн', probability: 75, close: '20.05.2026' },
  { client: 'ТЦ «Арена»', stage: 'КП', amount: '980 тыс', probability: 50, close: '25.05.2026' },
  { client: 'Завод «Прибор»', stage: 'Встреча', amount: '760 тыс', probability: 30, close: '01.06.2026' },
  { client: 'БЦ «Горизонт»', stage: 'КП', amount: '540 тыс', probability: 55, close: '28.05.2026' },
];

const todayActivities = [
  { label: 'Позвонить Иванову И.И. (ООО СтройГрупп)', type: 'call' },
  { label: 'Отправить КП в ТЦ «Арена»', type: 'email' },
  { label: 'Встреча с Заводом «Прибор» 15:00', type: 'meeting' },
  { label: 'Напомнить об оплате — БЦ «Горизонт»', type: 'call' },
  { label: 'Обновить прогноз воронки за май', type: 'email' },
];

// ─── Engineer data ────────────────────────────────────────────────────────────
const todayOrders = [
  { time: '09:00', address: 'ул. Ленина, 45', type: 'Ремонт', status: 'Выполнен' },
  { time: '11:30', address: 'пр. Мира, 12', type: 'ТО', status: 'Выполнен' },
  { time: '13:45', address: 'ул. Садовая, 8', type: 'Ремонт', status: 'В работе' },
  { time: '16:00', address: 'пр. Победы, 19', type: 'Монтаж', status: 'Предстоит' },
];

const engineerStats = [
  { label: 'Выполнено сегодня', value: '3' },
  { label: 'Рейтинг', value: '4.9 ★' },
  { label: 'Вовремя', value: '100%' },
  { label: 'Км сегодня', value: '47' },
];

// ─── Finance data ─────────────────────────────────────────────────────────────
const financeKpis = [
  { label: 'Дебиторка', value: '1.24 млн', color: 'text-blue-600' },
  { label: 'Кредиторка', value: '0.38 млн', color: 'text-orange-600' },
  { label: 'Остаток', value: '2.87 млн', color: 'text-green-600' },
  { label: 'Просрочено', value: '0.19 млн', color: 'text-red-600' },
];

const incomeExpenseData = [
  { month: 'Янв', income: 2.8, expense: 1.9 },
  { month: 'Фев', income: 3.1, expense: 2.0 },
  { month: 'Мар', income: 3.4, expense: 2.2 },
  { month: 'Апр', income: 3.9, expense: 2.5 },
  { month: 'Май', income: 4.2, expense: 2.7 },
  { month: 'Июн', income: 4.5, expense: 2.9 },
];

const overdueInvoices = [
  { client: 'ООО «Регион-Сервис»', amount: '84 тыс ₽', days: 32, status: 'Критично' },
  { client: 'ИП Смирнов А.В.', amount: '47 тыс ₽', days: 18, status: 'Просрочено' },
  { client: 'ТЦ «Полюс»', amount: '61 тыс ₽', days: 12, status: 'Просрочено' },
];

const upcomingPayments = [
  { date: '16.05', description: 'Поставщик «Климат-Опт»', amount: '120 тыс ₽' },
  { date: '17.05', description: 'Аренда склада', amount: '45 тыс ₽' },
  { date: '18.05', description: 'Зарплата (аванс)', amount: '310 тыс ₽' },
  { date: '20.05', description: 'ООО «Инструмент-Плюс»', amount: '88 тыс ₽' },
  { date: '22.05', description: 'Налоги (аванс)', amount: '195 тыс ₽' },
  { date: '23.05', description: 'Поставщик «АрктикТех»', amount: '67 тыс ₽' },
  { date: '23.05', description: 'Страховые взносы', amount: '142 тыс ₽' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const orderStatusColor = (s: string) => {
  if (s === 'В пути') return 'bg-yellow-100 text-yellow-800';
  if (s === 'На объекте' || s === 'В работе') return 'bg-blue-100 text-blue-800';
  if (s === 'Выполнен') return 'bg-green-100 text-green-800';
  if (s === 'Ожидание ЗИП') return 'bg-orange-100 text-orange-800';
  return 'bg-gray-100 text-gray-700';
};

// ─── Sub-views ────────────────────────────────────────────────────────────────
function DirectorView() {
  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {directorKpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground">{k.label}</p>
              <p className="text-2xl font-bold mt-1">{k.value}</p>
              <span className={`text-xs font-medium ${k.positive ? 'text-green-600' : 'text-red-500'}`}>
                {k.change} vs прошлый месяц
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Выручка по месяцам, млн ₽</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueMonthly}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [`${v} млн ₽`, 'Выручка']} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Выручка по типу услуг, млн ₽</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [`${v} млн ₽`, 'Выручка']} />
                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top clients */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Топ-5 клиентов</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Клиент</TableHead>
                <TableHead>Выручка</TableHead>
                <TableHead>Заявок</TableHead>
                <TableHead>NPS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topClients.map((c) => (
                <TableRow key={c.name}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.revenue}</TableCell>
                  <TableCell>{c.orders}</TableCell>
                  <TableCell>
                    <Badge variant={c.nps >= 88 ? 'default' : 'secondary'}>{c.nps}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Alerts */}
      <div className="space-y-2">
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">2 нарушения SLA</p>
            <p className="text-sm text-red-700">WO-2026-000312 (ООО «АгроХолдинг») и WO-2026-000298 (БЦ «Олимп») вышли за рамки SLA.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <FileWarning className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Договор истекает через 14 дней</p>
            <p className="text-sm text-amber-700">Договор с ТЦ «Галактика» (№ДО-2024-0087) истекает 29.05.2026. Рекомендуется продление.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DispatcherView() {
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {dispatcherKpis.map((k) => (
          <Card key={k.label} className={k.alert ? 'border-red-300' : ''}>
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground">{k.label}</p>
              <p className={`text-3xl font-bold mt-1 ${k.alert ? 'text-red-600' : ''}`}>{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Live orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Активные заявки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {liveOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <span className="font-mono text-xs text-muted-foreground w-32">{o.id}</span>
                <span className="flex-1 truncate px-2">{o.address}</span>
                <span className="text-muted-foreground w-28 text-center">{o.engineer}</span>
                {o.eta !== '—' && (
                  <span className="flex items-center gap-1 text-blue-600 w-16">
                    <Clock className="w-3 h-3" />{o.eta}
                  </span>
                )}
                <Badge className={`ml-2 ${orderStatusColor(o.status)}`} variant="outline">
                  {o.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Map placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Карта</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center rounded-xl bg-gray-100 h-48 gap-2 text-gray-500">
              <MapPin className="w-8 h-8 text-gray-400" />
              <span className="text-sm font-medium">Карта инженеров</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SLA alerts + engineer grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> SLA под угрозой
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {slaAlerts.map((a) => (
              <div key={a.id} className="rounded-lg border border-red-200 bg-red-50 p-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">{a.id}</span>
                  <span className="text-red-700 font-mono text-sm font-bold">{a.countdown}</span>
                </div>
                <p className="text-xs text-red-600 mt-1">{a.client}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" /> Инженеры
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {engineers.map((e) => (
                <div key={e.name} className="flex items-center gap-2 text-sm">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${engineerDotColor(e.status)}`} />
                  <span>{e.name}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500" />Свободен</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />В пути</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" />Занят</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ManagerView() {
  const [done, setDone] = useState<boolean[]>(todayActivities.map(() => false));

  const toggleActivity = (i: number) => {
    setDone((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      if (!next[i]) return next;
      toast.success('Задача выполнена', { description: todayActivities[i].label });
      return next;
    });
  };

  const activityIcon = (type: string) => {
    if (type === 'call') return <Phone className="w-4 h-4 text-blue-500" />;
    if (type === 'email') return <Mail className="w-4 h-4 text-purple-500" />;
    return <Users className="w-4 h-4 text-green-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Воронка продаж</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {pipelineStages.map((s) => (
              <div key={s.stage} className="flex items-center gap-3">
                <span className="w-28 text-sm text-right text-muted-foreground">{s.stage}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-7 relative">
                  <div
                    className="h-7 rounded-full flex items-center justify-end pr-3"
                    style={{
                      width: `${(s.count / 45) * 100}%`,
                      backgroundColor: s.color,
                      minWidth: '3rem',
                    }}
                  >
                    <span className="text-white text-xs font-bold">{s.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Manager KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {managerKpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground">{k.label}</p>
              <p className="text-2xl font-bold mt-1">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Топ сделки</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Стадия</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Вер-ть</TableHead>
                  <TableHead>Дата</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topOpportunities.map((o) => (
                  <TableRow key={o.client}>
                    <TableCell className="text-sm font-medium">{o.client}</TableCell>
                    <TableCell><Badge variant="outline">{o.stage}</Badge></TableCell>
                    <TableCell className="text-sm">{o.amount}</TableCell>
                    <TableCell className="text-sm">{o.probability}%</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{o.close}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Today's activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Задачи на сегодня</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayActivities.map((a, i) => (
              <button
                key={a.label}
                onClick={() => toggleActivity(i)}
                className="flex items-start gap-3 w-full text-left rounded-lg hover:bg-gray-50 p-2 transition-colors"
              >
                {done[i]
                  ? <CheckSquare className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  : <Square className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />}
                {activityIcon(a.type)}
                <span className={`text-sm ${done[i] ? 'line-through text-muted-foreground' : ''}`}>{a.label}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EngineerView() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {engineerStats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Маршрут на сегодня</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative pl-6 space-y-0">
            {todayOrders.map((o, i) => (
              <div key={i} className="relative pb-6 last:pb-0">
                <div className="absolute left-[-1.1rem] top-1 w-3 h-3 rounded-full border-2 border-white bg-blue-500" />
                {i < todayOrders.length - 1 && (
                  <div className="absolute left-[-0.65rem] top-4 bottom-0 w-px bg-gray-200" />
                )}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-muted-foreground w-12">{o.time}</span>
                  <span className="text-sm font-medium">{o.address}</span>
                  <Badge variant="outline" className="text-xs">{o.type}</Badge>
                  <Badge className={`text-xs ${orderStatusColor(o.status)}`} variant="outline">{o.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Current order */}
        <Card className="border-blue-300 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-base text-blue-800">Текущий наряд — WO-2026-000343</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <span>ул. Садовая, 8 — ТЦ «Ромашка», 3-й этаж, техпомещение</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Оборудование: </span>
              <span className="font-medium">Daikin FTXB25C (Split, R-410A, 2.5 кВт)</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Описание: </span>
              <span>Не охлаждает. Подозрение на утечку хладагента. Проверить давление.</span>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                className="flex-1 rounded-lg bg-blue-600 text-white py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
                onClick={() => toast.success('Статус обновлён', { description: 'Прибытие зафиксировано' })}
              >
                Прибыл
              </button>
              <button
                className="flex-1 rounded-lg bg-green-600 text-white py-2 text-sm font-medium hover:bg-green-700 transition-colors"
                onClick={() => toast.success('Наряд завершён', { description: 'WO-2026-000343 закрыт' })}
              >
                Завершить
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Next order */}
        <Card className="border-dashed border-gray-300">
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground flex items-center gap-2">
              <Navigation className="w-4 h-4" /> Следующий — 16:00
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <span>пр. Победы, 19 — Жилой дом, кв. 47</span>
            </div>
            <div>
              <span className="text-muted-foreground">Тип: </span>
              <span>Монтаж кондиционера</span>
            </div>
            <div>
              <span className="text-muted-foreground">Клиент: </span>
              <span>Громов Павел Андреевич</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-muted-foreground text-xs">Постоянный клиент — 3 заявки</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FinanceView() {
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {financeKpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground">{k.label}</p>
              <p className={`text-2xl font-bold mt-1 ${k.color}`}>{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Доходы vs Расходы, млн ₽</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={incomeExpenseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => [`${v} млн ₽`]} />
              <Bar dataKey="income" name="Доход" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Расход" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Overdue invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-red-600">Просроченная дебиторка</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Дней</TableHead>
                  <TableHead>Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdueInvoices.map((inv) => (
                  <TableRow key={inv.client}>
                    <TableCell className="text-sm font-medium">{inv.client}</TableCell>
                    <TableCell className="text-sm">{inv.amount}</TableCell>
                    <TableCell className="text-sm font-mono">{inv.days}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={inv.status === 'Критично' ? 'border-red-400 text-red-700' : 'border-orange-400 text-orange-700'}
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Payment calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Платёжный календарь — 7 дней</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingPayments.map((p, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-2.5 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground w-12">{p.date}</span>
                  <span>{p.description}</span>
                </div>
                <span className="font-semibold text-red-600 shrink-0">{p.amount}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function RoleDashboard() {
  const [activeRole, setActiveRole] = useState<Role>('director');

  const renderView = () => {
    switch (activeRole) {
      case 'director': return <DirectorView />;
      case 'dispatcher': return <DispatcherView />;
      case 'manager': return <ManagerView />;
      case 'engineer': return <EngineerView />;
      case 'finance': return <FinanceView />;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Дашборд</h1>
        <p className="text-muted-foreground text-sm">Персонализированная панель управления</p>
      </div>

      {/* Role tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-4">
        {ROLES.map((r) => (
          <button
            key={r.key}
            onClick={() => setActiveRole(r.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${activeRole === r.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            {r.icon}
            {r.label}
          </button>
        ))}
      </div>

      {renderView()}
    </div>
  );
}
