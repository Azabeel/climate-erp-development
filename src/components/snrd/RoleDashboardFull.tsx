import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = 'director' | 'dispatcher' | 'engineer' | 'manager' | 'accountant';

const ROLES: { key: Role; label: string; icon: string }[] = [
  { key: 'director',   label: 'Руководитель', icon: 'Building2'   },
  { key: 'dispatcher', label: 'Диспетчер',    icon: 'Radio'        },
  { key: 'engineer',   label: 'Инженер',      icon: 'Wrench'       },
  { key: 'manager',    label: 'Менеджер',     icon: 'TrendingUp'   },
  { key: 'accountant', label: 'Бухгалтер',    icon: 'Receipt'      },
];

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// ─── Director data ────────────────────────────────────────────────────────────

const directorKpis = [
  { label: 'Выручка месяца',     value: '3 470 000 ₽', change: '+12%', positive: true,  icon: 'TrendingUp' },
  { label: 'Маржа',              value: '34.8%',         change: '+1.4%', positive: true, icon: 'Percent'   },
  { label: 'Нарядов в работе',   value: '23',            change: '+3',    positive: true,  icon: 'ClipboardList' },
  { label: 'SLA (выполнение)',   value: '94%',           change: '+2%',   positive: true,  icon: 'ShieldCheck'   },
  { label: 'Клиентов (база)',    value: '156',           change: '+8',    positive: true,  icon: 'Users'         },
  { label: 'Инженеров на линии', value: '12',            change: '−1',    positive: false, icon: 'UserCheck'     },
];

const revenueMonthly = [
  { month: 'Июн', revenue: 2.1 },
  { month: 'Июл', revenue: 2.4 },
  { month: 'Авг', revenue: 2.7 },
  { month: 'Сен', revenue: 2.5 },
  { month: 'Окт', revenue: 2.9 },
  { month: 'Ноя', revenue: 3.1 },
  { month: 'Дек', revenue: 2.8 },
  { month: 'Янв', revenue: 3.0 },
  { month: 'Фев', revenue: 3.2 },
  { month: 'Мар', revenue: 3.4 },
  { month: 'Апр', revenue: 3.1 },
  { month: 'Май', revenue: 3.47 },
];

const topEngineers = [
  { name: 'Петров А.В.',  revenue: 712000 },
  { name: 'Иванов К.С.',  revenue: 634000 },
  { name: 'Сидоров М.О.', revenue: 589000 },
  { name: 'Козлов Р.Д.',  revenue: 521000 },
  { name: 'Новиков Д.Е.', revenue: 490000 },
];

const workTypeData = [
  { name: 'Ремонт',   value: 38 },
  { name: 'ТО',       value: 27 },
  { name: 'Монтаж',  value: 20 },
  { name: 'Гарантия', value: 8  },
  { name: 'ППР',      value: 7  },
];

const lowNpsClients = [
  { name: 'ООО «СтройЛюкс»',     nps: 41, delta: -18, revenue: '240 000 ₽' },
  { name: 'ИП Громов А.С.',       nps: 37, delta: -22, revenue: '88 000 ₽'  },
  { name: 'ТЦ «Северный»',        nps: 33, delta: -29, revenue: '175 000 ₽' },
];

// ─── Dispatcher data ──────────────────────────────────────────────────────────

const dispatcherKpis = [
  { label: 'Ожидают назначения', value: '8',  alert: true,  icon: 'Clock'        },
  { label: 'В работе',           value: '23', alert: false, icon: 'Activity'     },
  { label: 'SLA на грани',       value: '3',  alert: true,  icon: 'AlertTriangle' },
  { label: 'Свободных инженеров', value: '5', alert: false, icon: 'UserCheck'    },
];

type Priority = 'EMERGENCY' | 'URGENT' | 'NORMAL';

const pendingOrders: {
  id: string; client: string; address: string; priority: Priority; slaMin: number; type: string;
}[] = [
  { id: 'WO-2026-000351', client: 'Завод «Прибор»',       address: 'ул. Заводская, 14',    priority: 'EMERGENCY', slaMin: 12, type: 'Ремонт'    },
  { id: 'WO-2026-000352', client: 'БЦ «Горизонт»',        address: 'пр. Ленина, 44',       priority: 'URGENT',    slaMin: 47, type: 'Монтаж'    },
  { id: 'WO-2026-000353', client: 'ООО «АгроХолдинг»',    address: 'ул. Сельская, 3',      priority: 'NORMAL',    slaMin: 180, type: 'ТО'      },
  { id: 'WO-2026-000354', client: 'ТЦ «Галактика»',       address: 'Садовое кольцо, 1',    priority: 'URGENT',    slaMin: 35, type: 'Ремонт'   },
  { id: 'WO-2026-000355', client: 'ИП Смирнов А.В.',      address: 'ул. Тихая, 8',         priority: 'NORMAL',    slaMin: 240, type: 'Ремонт'  },
  { id: 'WO-2026-000356', client: 'Гипермаркет «Магнит»', address: 'пр. Победы, 88',       priority: 'URGENT',    slaMin: 62, type: 'ТО'       },
  { id: 'WO-2026-000357', client: 'Завод «Металлург»',    address: 'ул. Промышленная, 7',  priority: 'EMERGENCY', slaMin: 8,  type: 'Ремонт'   },
  { id: 'WO-2026-000358', client: 'ООО «СтройГрупп»',    address: 'ул. Советская, 21',    priority: 'NORMAL',    slaMin: 360, type: 'Монтаж'  },
];

const hourlyOrders = Array.from({ length: 24 }, (_, h) => ({
  hour: `${String(h).padStart(2, '0')}:00`,
  заявки: h < 8 ? 0 : h < 10 ? h - 6 : h < 18 ? Math.round(3 + Math.sin((h - 10) * 0.5) * 2) : Math.max(0, 20 - h),
}));

type EngineerStatus = 'online' | 'busy' | 'free';

const engineerGrid: { name: string; initials: string; status: EngineerStatus; orders: number }[] = [
  { name: 'Петров А.',   initials: 'ПА', status: 'busy',   orders: 4 },
  { name: 'Иванов К.',   initials: 'ИК', status: 'busy',   orders: 3 },
  { name: 'Сидоров М.',  initials: 'СМ', status: 'busy',   orders: 5 },
  { name: 'Козлов Р.',   initials: 'КР', status: 'free',   orders: 0 },
  { name: 'Новиков Д.',  initials: 'НД', status: 'busy',   orders: 3 },
  { name: 'Морозов В.',  initials: 'МВ', status: 'online', orders: 1 },
  { name: 'Алексеев И.', initials: 'АИ', status: 'free',   orders: 0 },
  { name: 'Громов П.',   initials: 'ГП', status: 'busy',   orders: 3 },
  { name: 'Зайцев О.',   initials: 'ЗО', status: 'online', orders: 2 },
  { name: 'Власова Е.',  initials: 'ВЕ', status: 'free',   orders: 0 },
  { name: 'Фёдоров Н.',  initials: 'ФН', status: 'busy',   orders: 2 },
  { name: 'Лебедева С.', initials: 'ЛС', status: 'free',   orders: 0 },
];

// ─── Engineer data ────────────────────────────────────────────────────────────

const engineerKpis = [
  { label: 'Нарядов сегодня', value: '4',      icon: 'ClipboardList' },
  { label: 'Выполнено',       value: '2',      icon: 'CheckCircle2'  },
  { label: 'Заработано',      value: '4 200 ₽', icon: 'Banknote'      },
  { label: 'Рейтинг',        value: '4.8 ★',   icon: 'Star'          },
];

const todayOrders = [
  { id: 'WO-2026-000340', time: '09:00–11:00', type: 'ТО',     client: 'ТЦ «Галактика»',    address: 'Садовое кольцо, 1',   status: 'Выполнен'  },
  { id: 'WO-2026-000343', time: '11:30–13:00', type: 'Ремонт', client: 'БЦ «Горизонт»',     address: 'пр. Ленина, 44',      status: 'Выполнен'  },
  { id: 'WO-2026-000347', time: '14:00–16:00', type: 'Монтаж', client: 'ООО «АгроХолдинг»', address: 'ул. Сельская, 3',     status: 'В работе'  },
  { id: 'WO-2026-000352', time: '17:00–18:30', type: 'ТО',     client: 'Завод «Прибор»',    address: 'ул. Заводская, 14',   status: 'Запланирован' },
];

const weekEarnings = [
  { day: 'Пн', earned: 1800 },
  { day: 'Вт', earned: 2100 },
  { day: 'Ср', earned: 900  },
  { day: 'Чт', earned: 2400 },
  { day: 'Пт', earned: 4200 },
  { day: 'Сб', earned: 0    },
  { day: 'Вс', earned: 0    },
];

const monthKpis = [
  { label: 'Нарядов (план/факт)',  plan: 30, fact: 22, unit: 'шт.'  },
  { label: 'Выручка (план/факт)',  plan: 100, fact: 71, unit: '%'    },
  { label: 'Рейтинг клиентов',    plan: 100, fact: 96, unit: '%'    },
];

// ─── Manager data ─────────────────────────────────────────────────────────────

const managerKpis = [
  { label: 'Лидов',          value: '34', icon: 'UserPlus'  },
  { label: 'Конверсия',      value: '18%', icon: 'Percent'  },
  { label: 'КП отправлено',  value: '12', icon: 'Send'      },
  { label: 'Сделок закрыто', value: '8',  icon: 'CheckCircle2' },
];

const funnelLine = [
  { stage: 'Лид',           count: 34 },
  { stage: 'Квалификация',  count: 22 },
  { stage: 'Встреча',       count: 14 },
  { stage: 'КП',            count: 12 },
  { stage: 'Переговоры',    count: 10 },
  { stage: 'Закрыто',       count: 8  },
];

const dealsNeedAction = [
  { client: 'ООО «СтройЛюкс»',     stage: 'Переговоры',   amount: '240 000 ₽', due: 'Сегодня', urgent: true  },
  { client: 'БЦ «Арена»',           stage: 'КП',           amount: '185 000 ₽', due: 'Завтра',  urgent: true  },
  { client: 'Завод «Прибор»',       stage: 'Квалификация', amount: '320 000 ₽', due: '19.05',   urgent: false },
  { client: 'ИП Громов А.С.',       stage: 'Встреча',      amount: '68 000 ₽',  due: '20.05',   urgent: false },
  { client: 'Гипермаркет «Лента»',  stage: 'КП',           amount: '510 000 ₽', due: '22.05',   urgent: false },
];

// ─── Accountant data ──────────────────────────────────────────────────────────

const accountantKpis = [
  { label: 'Счётов к оплате',  value: '12',        color: 'text-foreground',  icon: 'FileText'   },
  { label: 'Задолженность',    value: '340 000 ₽', color: 'text-red-600',     icon: 'AlertCircle' },
  { label: 'Оплачено',         value: '1 200 000 ₽', color: 'text-green-600', icon: 'CheckCircle2' },
  { label: 'Дебиторка',       value: '180 000 ₽', color: 'text-orange-600',  icon: 'Clock'      },
];

const cashFlowData = Array.from({ length: 30 }, (_, i) => {
  const base = 60 + Math.round(Math.sin(i * 0.4) * 30);
  return {
    day: String(i + 1),
    приход: Math.max(0, base + Math.round(Math.random() * 40)),
    расход: Math.max(0, base - 20 + Math.round(Math.random() * 30)),
  };
});

const overduePayments = [
  { invoice: 'СЧ-0398', client: 'ООО «СтройЛюкс»',    amount: '95 000 ₽',  overdueDays: 18, status: 'Обещание оплаты' },
  { invoice: 'СЧ-0401', client: 'ИП Громов А.С.',      amount: '42 000 ₽',  overdueDays: 12, status: 'На контроле'     },
  { invoice: 'СЧ-0403', client: 'ТЦ «Северный»',       amount: '115 000 ₽', overdueDays: 9,  status: 'Претензия'      },
  { invoice: 'СЧ-0407', client: 'БЦ «Олимп»',          amount: '58 000 ₽',  overdueDays: 6,  status: 'На контроле'     },
  { invoice: 'СЧ-0410', client: 'Завод «Металлург»',   amount: '30 000 ₽',  overdueDays: 3,  status: 'Напоминание'     },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function priorityBadge(p: Priority) {
  switch (p) {
    case 'EMERGENCY': return <Badge className="bg-red-600 text-white text-xs px-1.5">Авария</Badge>;
    case 'URGENT':    return <Badge className="bg-orange-500 text-white text-xs px-1.5">Срочно</Badge>;
    default:          return <Badge variant="outline" className="text-xs px-1.5">Норма</Badge>;
  }
}

function slaColor(min: number): string {
  if (min <= 30) return 'text-red-600 font-bold';
  if (min <= 60) return 'text-orange-500 font-semibold';
  return 'text-green-600';
}

function slaLabel(min: number): string {
  if (min < 60) return `${min} мин`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}ч ${m}м` : `${h} ч`;
}

function statusBadgeVariant(status: string) {
  switch (status) {
    case 'Выполнен':     return 'bg-green-100 text-green-800 border-green-200';
    case 'В работе':     return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'В пути':       return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Ожидание ЗИП': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Просрочен':    return 'bg-red-100 text-red-800 border-red-200';
    default:             return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

function engineerStatusDot(s: EngineerStatus): string {
  if (s === 'busy')   return 'bg-orange-500';
  if (s === 'free')   return 'bg-green-500';
  return 'bg-blue-400';
}

function engineerStatusLabel(s: EngineerStatus): string {
  if (s === 'busy')   return 'Занят';
  if (s === 'free')   return 'Свободен';
  return 'Онлайн';
}

// ─── Director Dashboard ───────────────────────────────────────────────────────

function DirectorView() {
  return (
    <div className="space-y-6">
      {/* 6 KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {directorKpis.map((k) => (
          <Card key={k.label} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name={k.icon} className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground leading-tight">{k.label}</p>
              </div>
              <p className="text-xl font-bold leading-tight">{k.value}</p>
              <span className={`text-xs font-medium ${k.positive ? 'text-green-600' : 'text-red-500'}`}>
                {k.change} vs прошлый мес.
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue area chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="TrendingUp" className="w-4 h-4 text-indigo-500" />
            Динамика выручки (12 месяцев), млн ₽
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueMonthly} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGradFull" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[1.5, 'auto']} unit=" млн" width={56} />
              <Tooltip formatter={(v: number) => [`${v} млн ₽`, 'Выручка']} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                fill="url(#revGradFull)"
                strokeWidth={2}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top-5 engineers + Work types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="Award" className="w-4 h-4 text-yellow-500" />
              ТОП-5 инженеров по выручке, ₽
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topEngineers} layout="vertical" margin={{ left: 4, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}к`}
                />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={96} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString('ru-RU')} ₽`, 'Выручка']} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="PieChart" className="w-4 h-4 text-emerald-500" />
              Типы работ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={workTypeData}
                  cx="50%"
                  cy="48%"
                  outerRadius={72}
                  dataKey="value"
                  label={({ name, value }) => `${name} ${value}%`}
                  labelLine={false}
                  fontSize={10}
                >
                  {workTypeData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Low NPS clients */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="AlertTriangle" className="w-4 h-4 text-red-500" />
            Клиенты с падающим NPS — требуют внимания
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Клиент</TableHead>
                <TableHead>NPS</TableHead>
                <TableHead>Динамика</TableHead>
                <TableHead>Выручка</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowNpsClients.map((c) => (
                <TableRow key={c.name}>
                  <TableCell className="font-medium text-sm">{c.name}</TableCell>
                  <TableCell>
                    <Badge className="bg-red-100 text-red-800 border border-red-200 text-xs">
                      {c.nps}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-red-600 text-sm font-semibold">{c.delta}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.revenue}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => toast.info(`Создана задача по клиенту ${c.name}`)}
                    >
                      Создать задачу
                    </Button>
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

// ─── Dispatcher Dashboard ─────────────────────────────────────────────────────

function DispatcherView() {
  return (
    <div className="space-y-6">
      {/* 4 KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {dispatcherKpis.map((k) => (
          <Card key={k.label} className={k.alert ? 'border-red-300 bg-red-50/40' : ''}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon
                  name={k.icon}
                  className={`w-4 h-4 ${k.alert ? 'text-red-500' : 'text-muted-foreground'}`}
                />
                <p className="text-xs text-muted-foreground">{k.label}</p>
              </div>
              <p className={`text-3xl font-bold ${k.alert ? 'text-red-600' : ''}`}>{k.value}</p>
              {k.alert && (
                <span className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <Icon name="AlertCircle" className="w-3 h-3" />
                  Требует действий
                </span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 8 pending work orders */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="Clock" className="w-4 h-4 text-orange-500" />
              Ожидают назначения
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => toast.success('Открыт диспетчерский борд')}
            >
              <Icon name="LayoutDashboard" className="w-3 h-3 mr-1" />
              Диспетч. борд
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {pendingOrders.map((o) => (
            <div
              key={o.id}
              className="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm hover:bg-muted/40 transition-colors"
            >
              <span className="font-mono text-xs text-muted-foreground w-36 shrink-0">{o.id}</span>
              <span className="flex-1 truncate font-medium">{o.client}</span>
              <span className="text-xs text-muted-foreground hidden md:block w-40 shrink-0 truncate">{o.address}</span>
              <span className="text-xs text-muted-foreground w-16 shrink-0">{o.type}</span>
              <span className={`text-xs w-16 shrink-0 text-right ${slaColor(o.slaMin)}`}>
                {slaLabel(o.slaMin)}
              </span>
              {priorityBadge(o.priority)}
              <Button
                size="sm"
                className="h-7 text-xs shrink-0"
                onClick={() => toast.success(`Назначение для ${o.id} открыто`)}
              >
                Назначить
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Hourly chart + Engineer grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="BarChart2" className="w-4 h-4 text-indigo-500" />
              Заявки по часам (сегодня)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={hourlyOrders} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 9 }}
                  interval={3}
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} domain={[0, 7]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="заявки"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="Users" className="w-4 h-4 text-green-500" />
              Инженеры (12)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {engineerGrid.map((eng) => (
                <div
                  key={eng.name}
                  className="flex flex-col items-center gap-1 cursor-pointer group"
                  title={`${eng.name} — ${engineerStatusLabel(eng.status)}${eng.orders ? `, нарядов: ${eng.orders}` : ''}`}
                  onClick={() => toast.info(`${eng.name}: ${engineerStatusLabel(eng.status)}`)}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground group-hover:ring-2 ring-indigo-400 transition-all">
                      {eng.initials}
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${engineerStatusDot(eng.status)}`}
                    />
                  </div>
                  <span className="text-[10px] text-center leading-tight text-muted-foreground truncate w-full text-center">
                    {eng.name.split(' ')[0]}
                  </span>
                  {eng.orders > 0 && (
                    <span className="text-[9px] font-semibold text-orange-600">{eng.orders} нар.</span>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t flex flex-wrap gap-2 text-xs">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />Занят</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />Свободен</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />Онлайн</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Engineer Dashboard ───────────────────────────────────────────────────────

function EngineerView() {
  return (
    <div className="space-y-6">
      {/* 4 KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {engineerKpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name={k.icon} className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{k.label}</p>
              </div>
              <p className="text-2xl font-bold">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today orders list */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="CalendarDays" className="w-4 h-4 text-indigo-500" />
            Маршрутный лист на сегодня
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {todayOrders.map((o, idx) => (
            <div
              key={o.id}
              className="flex items-center gap-3 rounded-lg border px-3 py-3 text-sm hover:bg-muted/40 transition-colors"
            >
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{o.client}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Icon name="MapPin" className="w-3 h-3" />
                  {o.address}
                </div>
              </div>
              <div className="text-xs text-muted-foreground w-24 shrink-0 text-center">{o.time}</div>
              <Badge variant="outline" className="text-xs shrink-0">{o.type}</Badge>
              <Badge
                variant="outline"
                className={`text-xs shrink-0 ${statusBadgeVariant(o.status)}`}
              >
                {o.status}
              </Badge>
              {o.status === 'В работе' && (
                <Button
                  size="sm"
                  className="h-7 text-xs shrink-0"
                  onClick={() => toast.success(`Статус наряда ${o.id} обновлён`)}
                >
                  Завершить
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Week earnings + Month KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="Banknote" className="w-4 h-4 text-green-500" />
              Заработок за 7 дней, ₽
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weekEarnings} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${v / 1000}к`} width={36} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString('ru-RU')} ₽`, 'Заработок']} />
                <Bar
                  dataKey="earned"
                  radius={[4, 4, 0, 0]}
                  fill="#10b981"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="Target" className="w-4 h-4 text-orange-500" />
              KPI месяца
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-2">
            {monthKpis.map((kpi) => {
              const pct = Math.round((kpi.fact / kpi.plan) * 100);
              const barColor = pct >= 90 ? 'bg-green-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-red-500';
              return (
                <div key={kpi.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{kpi.label}</span>
                    <span className="font-semibold">
                      {kpi.fact}{kpi.unit} / {kpi.plan}{kpi.unit}
                    </span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${barColor}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-right text-muted-foreground mt-0.5">{pct}%</div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Manager Dashboard ────────────────────────────────────────────────────────

function ManagerView() {
  return (
    <div className="space-y-6">
      {/* 4 KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {managerKpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name={k.icon} className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{k.label}</p>
              </div>
              <p className="text-3xl font-bold">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Funnel line chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="Filter" className="w-4 h-4 text-indigo-500" />
            Воронка продаж (стадии → количество сделок)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={funnelLine} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} domain={[0, 40]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ r: 5, fill: '#6366f1' }}
                activeDot={{ r: 6 }}
                name="Сделок"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Deals needing action */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="Zap" className="w-4 h-4 text-yellow-500" />
            Сделки, требующие действий
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {dealsNeedAction.map((d, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:bg-muted/40 ${
                d.urgent ? 'border-orange-300 bg-orange-50/50' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <span className="font-medium">{d.client}</span>
                <span className="text-muted-foreground ml-2 text-xs">{d.stage}</span>
              </div>
              <span className="font-semibold text-sm w-28 shrink-0 text-right">{d.amount}</span>
              <Badge
                variant="outline"
                className={`text-xs shrink-0 ${
                  d.urgent
                    ? 'bg-orange-100 text-orange-800 border-orange-200'
                    : 'bg-gray-100 text-gray-700 border-gray-200'
                }`}
              >
                {d.due}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs shrink-0"
                onClick={() => toast.info(`Открыта сделка: ${d.client}`)}
              >
                Открыть
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Accountant Dashboard ─────────────────────────────────────────────────────

function AccountantView() {
  return (
    <div className="space-y-6">
      {/* 4 KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {accountantKpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name={k.icon} className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{k.label}</p>
              </div>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cash flow area chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="Activity" className="w-4 h-4 text-indigo-500" />
            Денежный поток (30 дней), тыс. ₽
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={cashFlowData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="inGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="outGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10 }}
                interval={4}
                label={{ value: 'День', position: 'insideBottomRight', offset: -4, fontSize: 10 }}
              />
              <YAxis tick={{ fontSize: 11 }} unit=" т₽" width={48} />
              <Tooltip formatter={(v: number) => [`${v} тыс. ₽`, '']} />
              <Area
                type="monotone"
                dataKey="приход"
                stroke="#10b981"
                fill="url(#inGrad)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="расход"
                stroke="#ef4444"
                fill="url(#outGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Overdue payments table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="AlertCircle" className="w-4 h-4 text-red-500" />
            Просроченные платежи
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>№ счёта</TableHead>
                <TableHead>Клиент</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Дней просрочки</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overduePayments.map((p) => (
                <TableRow key={p.invoice}>
                  <TableCell className="font-mono text-sm">{p.invoice}</TableCell>
                  <TableCell className="font-medium text-sm">{p.client}</TableCell>
                  <TableCell className="text-sm font-semibold">{p.amount}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        p.overdueDays >= 15
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : p.overdueDays >= 7
                          ? 'bg-orange-100 text-orange-800 border-orange-200'
                          : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      }`}
                    >
                      {p.overdueDays} дн.
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.status}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => toast.info(`Напоминание отправлено: ${p.client}`)}
                    >
                      Напомнить
                    </Button>
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

// ─── Main component ───────────────────────────────────────────────────────────

export default function RoleDashboardFull() {
  const [activeRole, setActiveRole] = useState<Role>('director');

  function renderView() {
    switch (activeRole) {
      case 'director':   return <DirectorView />;
      case 'dispatcher': return <DispatcherView />;
      case 'engineer':   return <EngineerView />;
      case 'manager':    return <ManagerView />;
      case 'accountant': return <AccountantView />;
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Дашборд</h1>
        <p className="text-sm text-muted-foreground">
          Персонализированная панель управления АСУ СЦ «Сервис Климат»
        </p>
      </div>

      {/* Role switcher */}
      <div className="flex flex-wrap gap-2 border-b pb-4">
        {ROLES.map((r) => (
          <Button
            key={r.key}
            variant={activeRole === r.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveRole(r.key)}
            className="flex items-center gap-2"
          >
            <Icon name={r.icon} className="w-4 h-4" />
            {r.label}
          </Button>
        ))}
      </div>

      {renderView()}
    </div>
  );
}
