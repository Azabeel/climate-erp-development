import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
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
  ResponsiveContainer,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

type ClientStatus = 'Выполнено' | 'Запланировано' | 'Не контактировали';

interface ClientRow {
  id: string;
  client: string;
  objects: number;
  equipment: number;
  status: ClientStatus;
  date: string;
  engineer: string;
}

interface MailingRecord {
  id: string;
  date: string;
  channel: string;
  sent: number;
  opened: number;
  registered: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WEEKLY_DATA = [
  { week: 'Нед 1 (апр)', plan: 18, fact: 16 },
  { week: 'Нед 2 (апр)', plan: 22, fact: 21 },
  { week: 'Нед 3 (апр)', plan: 25, fact: 24 },
  { week: 'Нед 4 (апр)', plan: 28, fact: 25 },
  { week: 'Нед 1 (май)', plan: 32, fact: 30 },
  { week: 'Нед 2 (май)', plan: 35, fact: 32 },
  { week: 'Нед 3 (май)', plan: 38, fact: 35 },
  { week: 'Нед 4 (май)', plan: 36, fact: 4 },
];

const ENGINEER_LOAD = [
  { name: 'Алексей К.', count: 41 },
  { name: 'Сергей В.', count: 38 },
  { name: 'Михаил Н.', count: 35 },
  { name: 'Дмитрий П.', count: 33 },
  { name: 'Иван С.', count: 27 },
  { name: 'Роман Т.', count: 21 },
];

const CLIENTS: ClientRow[] = [
  { id: '1',  client: 'ООО «АльфаТрейд»',      objects: 3, equipment: 12, status: 'Выполнено',         date: '14.04.2026', engineer: 'Алексей К.' },
  { id: '2',  client: 'ТЦ «Меридиан»',           objects: 1, equipment: 24, status: 'Выполнено',         date: '18.04.2026', engineer: 'Сергей В.' },
  { id: '3',  client: 'Ресторан «Вкус Лета»',    objects: 1, equipment: 6,  status: 'Выполнено',         date: '22.04.2026', engineer: 'Михаил Н.' },
  { id: '4',  client: 'ООО «БетаМедиа»',         objects: 2, equipment: 9,  status: 'Выполнено',         date: '25.04.2026', engineer: 'Алексей К.' },
  { id: '5',  client: 'Клиника «Здоровье+»',     objects: 2, equipment: 14, status: 'Выполнено',         date: '28.04.2026', engineer: 'Дмитрий П.' },
  { id: '6',  client: 'БЦ «Ориент»',             objects: 1, equipment: 30, status: 'Выполнено',         date: '02.05.2026', engineer: 'Сергей В.' },
  { id: '7',  client: 'ИП Соколова М.В.',        objects: 1, equipment: 3,  status: 'Выполнено',         date: '05.05.2026', engineer: 'Иван С.' },
  { id: '8',  client: 'Гостиница «Космос»',      objects: 4, equipment: 48, status: 'Запланировано',     date: '19.05.2026', engineer: 'Михаил Н.' },
  { id: '9',  client: 'ООО «Гамма Сервис»',      objects: 2, equipment: 7,  status: 'Запланировано',     date: '20.05.2026', engineer: 'Алексей К.' },
  { id: '10', client: 'Фитнес-клуб «Атлант»',   objects: 1, equipment: 10, status: 'Запланировано',     date: '21.05.2026', engineer: 'Роман Т.' },
  { id: '11', client: 'Супермаркет «Монетка»',   objects: 2, equipment: 16, status: 'Запланировано',     date: '22.05.2026', engineer: 'Дмитрий П.' },
  { id: '12', client: 'ООО «ДельтаЛогист»',      objects: 1, equipment: 5,  status: 'Запланировано',     date: '23.05.2026', engineer: 'Сергей В.' },
  { id: '13', client: 'Офисный центр «Марс»',    objects: 3, equipment: 22, status: 'Запланировано',     date: '26.05.2026', engineer: 'Алексей К.' },
  { id: '14', client: 'ИП Ковалёв А.П.',         objects: 1, equipment: 2,  status: 'Запланировано',     date: '27.05.2026', engineer: 'Иван С.' },
  { id: '15', client: 'ООО «ЭпсилонТех»',        objects: 2, equipment: 8,  status: 'Не контактировали', date: '—',          engineer: '—' },
  { id: '16', client: 'Детский сад №47',          objects: 1, equipment: 4,  status: 'Не контактировали', date: '—',          engineer: '—' },
  { id: '17', client: 'ООО «ЗетаПром»',          objects: 2, equipment: 11, status: 'Не контактировали', date: '—',          engineer: '—' },
  { id: '18', client: 'Аптека «Фармация»',        objects: 1, equipment: 3,  status: 'Не контактировали', date: '—',          engineer: '—' },
  { id: '19', client: 'ТЦ «Солнечный»',           objects: 1, equipment: 18, status: 'Не контактировали', date: '—',          engineer: '—' },
  { id: '20', client: 'ООО «ИотаСтрой»',         objects: 3, equipment: 9,  status: 'Не контактировали', date: '—',          engineer: '—' },
];

// Weeks: may week 1–4, june week 1–4
const WEEKS = ['Май W1', 'Май W2', 'Май W3', 'Май W4', 'Июн W1', 'Июн W2', 'Июн W3', 'Июн W4'];

const SCHEDULE_DATA: { engineer: string; loads: number[] }[] = [
  { engineer: 'Алексей К.', loads: [8, 9, 7, 8, 6, 5, 4, 3] },
  { engineer: 'Сергей В.',  loads: [7, 8, 9, 7, 5, 3, 2, 2] },
  { engineer: 'Михаил Н.',  loads: [6, 7, 8, 6, 5, 4, 3, 2] },
  { engineer: 'Дмитрий П.', loads: [5, 6, 7, 8, 4, 3, 2, 2] },
  { engineer: 'Иван С.',    loads: [4, 5, 5, 6, 3, 2, 1, 1] },
  { engineer: 'Роман Т.',   loads: [3, 4, 4, 5, 2, 1, 1, 1] },
];

const MAILING_HISTORY: MailingRecord[] = [
  { id: '1', date: '01.04.2026', channel: 'SMS',      sent: 95,  opened: 95,  registered: 68 },
  { id: '2', date: '10.04.2026', channel: 'Email',    sent: 112, opened: 87,  registered: 71 },
  { id: '3', date: '25.04.2026', channel: 'WhatsApp', sent: 40,  opened: 38,  registered: 28 },
];

const DEFAULT_SMS_TEMPLATE =
  'Уважаемый {name}, приглашаем вас на сезонное техническое обслуживание кондиционеров к лету 2026. ' +
  'Запишитесь удобным способом: позвоните +7 (800) 000-00-00 или ответьте на это сообщение. ' +
  'Сервис Климат — ваше оборудование под контролем.';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusBadge(status: ClientStatus) {
  if (status === 'Выполнено')         return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Выполнено</Badge>;
  if (status === 'Запланировано')      return <Badge className="bg-sky-100 text-sky-700 border-sky-200">Запланировано</Badge>;
  return                                      <Badge className="bg-slate-100 text-slate-600 border-slate-200">Не контактировали</Badge>;
}

function heatCell(value: number): string {
  if (value === 0) return 'bg-slate-50 text-slate-400';
  if (value <= 4)  return 'bg-emerald-100 text-emerald-800';
  if (value <= 7)  return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SeasonalPlanningFull() {
  const [statusFilter, setStatusFilter] = useState<string>('Все');
  const [smsText, setSmsText]           = useState(DEFAULT_SMS_TEMPLATE);
  const [activeTab, setActiveTab]       = useState('overview');

  const filteredClients = statusFilter === 'Все'
    ? CLIENTS
    : CLIENTS.filter(c => c.status === statusFilter);

  const weekTotals = WEEKS.map((_, wi) =>
    SCHEDULE_DATA.reduce((sum, eng) => sum + eng.loads[wi], 0)
  );

  function handleSchedule(client: string) {
    toast.success(`Запланировано ТО для «${client}»`, {
      description: 'Откроется форма создания наряда',
    });
  }

  function handleCall(client: string) {
    toast.info(`Звонок клиенту «${client}»`, {
      description: 'Набор номера через IP-телефонию…',
    });
  }

  function handleSendMailing() {
    const count = CLIENTS.filter(c => c.status === 'Не контактировали').length;
    toast.success(`Рассылка запущена для ${count} получателей`, {
      description: 'SMS отправляются через шлюз МТС',
    });
  }

  return (
    <div className="p-6 space-y-6">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Сезонное планирование ТО</h1>
          <p className="text-sm text-slate-500 mt-0.5">Лето 2026 · Апрель — Июнь</p>
        </div>
        <Badge className="bg-sky-100 text-sky-700 border-sky-200 text-sm px-3 py-1">
          <Icon name="Sun" className="w-4 h-4 mr-1.5 inline-block" />
          Текущий сезон: Лето 2026
        </Badge>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Охвачено клиентов</p>
            <p className="text-3xl font-bold text-slate-900">78%</p>
            <Progress value={78} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">ТО запланировано</p>
            <p className="text-3xl font-bold text-sky-600">234</p>
            <p className="text-xs text-slate-400 mt-1">нарядов в очереди</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Выполнено</p>
            <p className="text-3xl font-bold text-emerald-600">187</p>
            <Progress value={80} className="mt-2 h-1.5 [&>div]:bg-emerald-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Осталось</p>
            <p className="text-3xl font-bold text-amber-600">47</p>
            <p className="text-xs text-slate-400 mt-1">до конца сезона</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="clients">Клиенты</TabsTrigger>
          <TabsTrigger value="schedule">Расписание</TabsTrigger>
          <TabsTrigger value="mailings">Рассылки</TabsTrigger>
        </TabsList>

        {/* ══ ОБЗОР ══════════════════════════════════════════════════════ */}
        <TabsContent value="overview" className="space-y-6">
          {/* Area chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Выполнение сезонного ТО по неделям</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={WEEKLY_DATA} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradPlan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradFact" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="plan" name="План" stroke="#6366f1" fill="url(#gradPlan)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="fact" name="Факт" stroke="#10b981" fill="url(#gradFact)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status progress bars */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Статус клиентов по ТО</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Выполнено',          value: 187, total: 234, color: '[&>div]:bg-emerald-500' },
                  { label: 'Запланировано',       value: 47,  total: 234, color: '[&>div]:bg-sky-500' },
                  { label: 'Без ТО (новые)',      value: 28,  total: 234, color: '[&>div]:bg-amber-400' },
                  { label: 'Отказались',          value: 6,   total: 234, color: '[&>div]:bg-red-400' },
                ].map(row => (
                  <div key={row.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700">{row.label}</span>
                      <span className="text-slate-500 font-medium">{row.value} / {row.total}</span>
                    </div>
                    <Progress value={Math.round(row.value / row.total * 100)} className={`h-2 ${row.color}`} />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Engineer load bar chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Нагрузка на инженеров</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={ENGINEER_LOAD} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={84} />
                    <Tooltip />
                    <Bar dataKey="count" name="Кол-во ТО" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Service type cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: 'Wind',          label: 'Промывка фильтров',    count: 178, color: 'text-sky-600',     bg: 'bg-sky-50' },
              { icon: 'Droplets',      label: 'Заправка хладагентом', count: 54,  color: 'text-blue-600',    bg: 'bg-blue-50' },
              { icon: 'Search',        label: 'Диагностика системы',  count: 112, color: 'text-violet-600',  bg: 'bg-violet-50' },
              { icon: 'Thermometer',   label: 'Чистка теплообменника',count: 93,  color: 'text-amber-600',   bg: 'bg-amber-50' },
            ].map(card => (
              <Card key={card.label}>
                <CardContent className="pt-5">
                  <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                    <Icon name={card.icon as any} className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{card.count}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-tight">{card.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ══ КЛИЕНТЫ ════════════════════════════════════════════════════ */}
        <TabsContent value="clients" className="space-y-4">
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Фильтр по статусу" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Все">Все статусы</SelectItem>
                <SelectItem value="Выполнено">Выполнено</SelectItem>
                <SelectItem value="Запланировано">Запланировано</SelectItem>
                <SelectItem value="Не контактировали">Не контактировали</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-slate-500">{filteredClients.length} записей</span>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Клиент</TableHead>
                  <TableHead className="text-center">Объектов</TableHead>
                  <TableHead className="text-center">Оборудования</TableHead>
                  <TableHead>Статус ТО</TableHead>
                  <TableHead>Дата ТО</TableHead>
                  <TableHead>Инженер</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map(row => (
                  <TableRow key={row.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-sm">{row.client}</TableCell>
                    <TableCell className="text-center text-sm">{row.objects}</TableCell>
                    <TableCell className="text-center text-sm">{row.equipment}</TableCell>
                    <TableCell>{statusBadge(row.status)}</TableCell>
                    <TableCell className="text-sm text-slate-600">{row.date}</TableCell>
                    <TableCell className="text-sm text-slate-600">{row.engineer}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs px-2"
                          onClick={() => handleSchedule(row.client)}
                        >
                          <Icon name="CalendarPlus" className="w-3 h-3 mr-1" />
                          Запланировать
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs px-2"
                          onClick={() => handleCall(row.client)}
                        >
                          <Icon name="Phone" className="w-3 h-3 mr-1" />
                          Позвонить
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ══ РАСПИСАНИЕ ═════════════════════════════════════════════════ */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Тепловая карта нагрузки инженеров (май–июнь 2026)</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                <span className="inline-block w-3 h-3 rounded bg-emerald-200 mr-1 align-middle" />1–4 ТО
                <span className="inline-block w-3 h-3 rounded bg-yellow-200 mx-1 ml-3 align-middle" />5–7 ТО
                <span className="inline-block w-3 h-3 rounded bg-red-200 mx-1 ml-3 align-middle" />8+ ТО
              </p>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm border-separate border-spacing-1">
                <thead>
                  <tr>
                    <th className="text-left text-xs text-slate-500 font-medium pb-2 pr-3 w-28">Инженер</th>
                    {WEEKS.map(w => (
                      <th key={w} className="text-center text-xs text-slate-500 font-medium pb-2 min-w-[72px]">{w}</th>
                    ))}
                    <th className="text-center text-xs text-slate-500 font-medium pb-2 pl-2">Итого</th>
                  </tr>
                </thead>
                <tbody>
                  {SCHEDULE_DATA.map(row => {
                    const total = row.loads.reduce((s, v) => s + v, 0);
                    return (
                      <tr key={row.engineer}>
                        <td className="text-xs font-medium text-slate-700 pr-3 py-0.5 whitespace-nowrap">{row.engineer}</td>
                        {row.loads.map((v, wi) => (
                          <td key={wi} className="py-0.5">
                            <div className={`rounded text-center font-semibold py-1.5 text-xs ${heatCell(v)}`}>
                              {v > 0 ? v : '—'}
                            </div>
                          </td>
                        ))}
                        <td className="text-center text-xs font-bold text-slate-700 pl-2">{total}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="text-xs text-slate-500 font-semibold pt-2">Итого по неделям</td>
                    {weekTotals.map((total, wi) => (
                      <td key={wi} className="text-center text-xs font-bold text-slate-800 pt-2">{total}</td>
                    ))}
                    <td className="text-center text-xs font-bold text-slate-900 pt-2">
                      {weekTotals.reduce((s, v) => s + v, 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══ РАССЫЛКИ ═══════════════════════════════════════════════════ */}
        <TabsContent value="mailings" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Отправлено',  value: 247, icon: 'Send',       color: 'text-slate-700',   bg: 'bg-slate-100' },
              { label: 'Открыто',     value: 198, icon: 'MailOpen',   color: 'text-sky-700',     bg: 'bg-sky-100'   },
              { label: 'Записалось',  value: 167, icon: 'UserCheck',  color: 'text-emerald-700', bg: 'bg-emerald-100' },
            ].map(s => (
              <Card key={s.label}>
                <CardContent className="pt-5 flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                    <Icon name={s.icon as any} className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                    <p className="text-xs text-slate-500">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* SMS template editor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Шаблон SMS-рассылки</CardTitle>
              <p className="text-xs text-slate-500">
                Доступные переменные: <code className="bg-slate-100 px-1 rounded">{'{name}'}</code>,{' '}
                <code className="bg-slate-100 px-1 rounded">{'{date}'}</code>,{' '}
                <code className="bg-slate-100 px-1 rounded">{'{phone}'}</code>
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                value={smsText}
                onChange={e => setSmsText(e.target.value)}
                rows={5}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800
                           placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{smsText.length} символов</span>
                <Button
                  onClick={handleSendMailing}
                  className="bg-sky-600 hover:bg-sky-700 text-white"
                >
                  <Icon name="Send" className="w-4 h-4 mr-2" />
                  Запустить рассылку
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mailing history */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">История рассылок</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Дата</TableHead>
                  <TableHead>Канал</TableHead>
                  <TableHead className="text-center">Отправлено</TableHead>
                  <TableHead className="text-center">Открыто</TableHead>
                  <TableHead className="text-center">Записалось</TableHead>
                  <TableHead className="text-center">Конверсия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MAILING_HISTORY.map(rec => (
                  <TableRow key={rec.id} className="hover:bg-slate-50">
                    <TableCell className="text-sm">{rec.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{rec.channel}</Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm">{rec.sent}</TableCell>
                    <TableCell className="text-center text-sm">{rec.opened}</TableCell>
                    <TableCell className="text-center text-sm">{rec.registered}</TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                        {Math.round(rec.registered / rec.sent * 100)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
