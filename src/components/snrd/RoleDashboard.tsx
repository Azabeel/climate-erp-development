import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// ─── Role types ───────────────────────────────────────────────────────────────

type Role = 'director' | 'dispatcher' | 'manager' | 'accountant' | 'hr';

const ROLES: { key: Role; label: string; icon: string }[] = [
  { key: 'director',    label: 'Руководитель',   icon: 'Building2'    },
  { key: 'dispatcher',  label: 'Диспетчер',       icon: 'Radio'        },
  { key: 'manager',     label: 'Менеджер',         icon: 'TrendingUp'   },
  { key: 'accountant',  label: 'Бухгалтер',        icon: 'Receipt'      },
  { key: 'hr',          label: 'HR-специалист',    icon: 'Users'        },
];

// ─── Director data ────────────────────────────────────────────────────────────

const directorKpis = [
  { label: 'Выручка месяца',   value: '4 820 000 ₽',  change: '+18%',  positive: true  },
  { label: 'Маржа',            value: '34.2%',          change: '+2.1%', positive: true  },
  { label: 'NPS',              value: '87',             change: '+3',    positive: true  },
  { label: 'Нарядов (месяц)',  value: '214',            change: '+11%',  positive: true  },
];

const revenueData = [
  { month: 'Дек',  revenue: 2.8 },
  { month: 'Янв',  revenue: 3.1 },
  { month: 'Фев',  revenue: 3.4 },
  { month: 'Мар',  revenue: 3.9 },
  { month: 'Апр',  revenue: 4.2 },
  { month: 'Май',  revenue: 4.82 },
];

const workTypeData = [
  { name: 'Ремонт',    value: 38 },
  { name: 'ТО',        value: 27 },
  { name: 'Монтаж',   value: 20 },
  { name: 'Гарантия', value: 8  },
  { name: 'ППР',       value: 7  },
];

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const topEngineers = [
  { name: 'Петров А.В.',   orders: 31, revenue: '712 000 ₽', rating: 4.9 },
  { name: 'Иванов К.С.',   orders: 28, revenue: '634 000 ₽', rating: 4.8 },
  { name: 'Сидоров М.О.',  orders: 26, revenue: '589 000 ₽', rating: 4.7 },
];

const topClients = [
  { name: 'ООО «АгроХолдинг»',      revenue: '840 000 ₽', orders: 12, nps: 94 },
  { name: 'ТЦ «Галактика»',          revenue: '720 000 ₽', orders: 9,  nps: 88 },
  { name: 'Завод «Металлург»',        revenue: '615 000 ₽', orders: 7,  nps: 85 },
];

// ─── Dispatcher data ──────────────────────────────────────────────────────────

const dispatcherKpis = [
  { label: 'Открытых нарядов',       value: '47',  alert: false },
  { label: 'Нарядов сегодня',         value: '23',  alert: false },
  { label: 'Ожидают назначения',      value: '5',   alert: false },
  { label: 'SLA под угрозой',         value: '3',   alert: true  },
];

const todayWorkOrders = [
  { id: 'WO-2026-000341', client: 'ООО «АгроХолдинг»',   engineer: 'Петров А.В.',   status: 'В пути'        },
  { id: 'WO-2026-000342', client: 'ТЦ «Галактика»',       engineer: 'Иванов К.С.',   status: 'На объекте'    },
  { id: 'WO-2026-000343', client: 'Завод «Металлург»',    engineer: 'Сидоров М.О.',  status: 'В работе'      },
  { id: 'WO-2026-000344', client: 'ИП Смирнов А.В.',      engineer: 'Не назначен',   status: 'Новая'         },
  { id: 'WO-2026-000345', client: 'БЦ «Олимп»',           engineer: 'Козлов Р.Д.',   status: 'В пути'        },
  { id: 'WO-2026-000346', client: 'Гипермаркет «Магнит»', engineer: 'Новиков Д.Е.',  status: 'Ожидание ЗИП'  },
  { id: 'WO-2026-000347', client: 'ООО «СтройГрупп»',     engineer: 'Морозов В.П.',  status: 'Выполнен'      },
  { id: 'WO-2026-000348', client: 'Завод «Прибор»',       engineer: 'Алексеев И.Н.', status: 'Выполнен'      },
];

const engineerLoadData = [
  { name: 'Петров А.',    нарядов: 4 },
  { name: 'Иванов К.',    нарядов: 3 },
  { name: 'Сидоров М.',   нарядов: 5 },
  { name: 'Козлов Р.',    нарядов: 2 },
  { name: 'Новиков Д.',   нарядов: 3 },
  { name: 'Морозов В.',   нарядов: 1 },
  { name: 'Алексеев И.',  нарядов: 2 },
  { name: 'Громов П.',    нарядов: 3 },
];

// ─── Manager data ─────────────────────────────────────────────────────────────

const funnelData = [
  { stage: 'Лиды',          count: 84,  pct: 100 },
  { stage: 'Квалификация',  count: 56,  pct: 67  },
  { stage: 'Встреча / КП',  count: 32,  pct: 38  },
  { stage: 'Переговоры',    count: 18,  pct: 21  },
  { stage: 'Сделка',        count: 9,   pct: 11  },
];

const managerKpis = [
  { label: 'Новых лидов',        value: '84'   },
  { label: 'Конверсия',          value: '10.7%' },
  { label: 'Выполнение плана',   value: '78%'   },
];

const managerTasks = [
  { text: 'Позвонить Иванову И. (ООО «СтройГрупп»)',    priority: 'high'   },
  { text: 'Отправить КП в ТЦ «Арена»',                   priority: 'high'   },
  { text: 'Встреча с Заводом «Прибор» 15:00',             priority: 'medium' },
  { text: 'Напомнить об оплате — БЦ «Горизонт»',          priority: 'medium' },
  { text: 'Обновить прогноз воронки за май',              priority: 'low'    },
  { text: 'Оформить задачу на продление договора Магнит', priority: 'low'    },
];

// ─── Accountant data ──────────────────────────────────────────────────────────

const accountantKpis = [
  { label: 'Счета к оплате',       value: '1 240 000 ₽', color: 'text-foreground'  },
  { label: 'Просроченные',         value: '192 000 ₽',   color: 'text-red-600'     },
  { label: 'Оплачено в месяце',    value: '3 680 000 ₽', color: 'text-green-600'   },
];

const invoices = [
  { id: 'СЧ-0411', client: 'ООО «АгроХолдинг»',    amount: '184 000 ₽',  due: '10.05',  status: 'Просрочен'     },
  { id: 'СЧ-0412', client: 'ТЦ «Галактика»',        amount: '97 000 ₽',   due: '12.05',  status: 'Просрочен'     },
  { id: 'СЧ-0413', client: 'Завод «Металлург»',     amount: '215 000 ₽',  due: '15.05',  status: 'Ожидает'       },
  { id: 'СЧ-0414', client: 'БЦ «Олимп»',            amount: '63 000 ₽',   due: '16.05',  status: 'Ожидает'       },
  { id: 'СЧ-0415', client: 'ИП Смирнов А.В.',       amount: '44 000 ₽',   due: '17.05',  status: 'Ожидает'       },
  { id: 'СЧ-0416', client: 'Гипермаркет «Магнит»',  amount: '328 000 ₽',  due: '18.05',  status: 'Оплачен'       },
  { id: 'СЧ-0417', client: 'ООО «СтройГрупп»',      amount: '156 000 ₽',  due: '20.05',  status: 'Частично'      },
  { id: 'СЧ-0418', client: 'Завод «Прибор»',        amount: '82 000 ₽',   due: '22.05',  status: 'Ожидает'       },
];

// Generate 30-day receipts data
const receiptsData = Array.from({ length: 30 }, (_, i) => ({
  day: String(i + 1),
  amount: Math.round(80 + Math.random() * 240),
}));

// ─── HR data ──────────────────────────────────────────────────────────────────

const hrKpis = [
  { label: 'Сотрудников',         value: '42'  },
  { label: 'Новых в месяце',      value: '3'   },
  { label: 'На испытании',        value: '5'   },
  { label: 'Незакрытых вакансий', value: '2'   },
];

const engineerPlanFact = [
  { name: 'Петров А.',   план: 30, факт: 31 },
  { name: 'Иванов К.',   план: 28, факт: 28 },
  { name: 'Сидоров М.',  план: 28, факт: 26 },
  { name: 'Козлов Р.',   план: 25, факт: 22 },
  { name: 'Новиков Д.',  план: 25, факт: 24 },
  { name: 'Морозов В.',  план: 20, факт: 18 },
  { name: 'Алексеев И.', план: 20, факт: 21 },
  { name: 'Громов П.',   план: 22, факт: 19 },
];

const probationEmployees = [
  { name: 'Зайцев О.С.',      role: 'Инженер',    start: '17.03.2026', end: '16.06.2026', daysLeft: 32 },
  { name: 'Власова Е.К.',     role: 'Диспетчер',  start: '01.04.2026', end: '30.06.2026', daysLeft: 46 },
  { name: 'Фёдоров Н.А.',     role: 'Инженер',    start: '14.04.2026', end: '13.07.2026', daysLeft: 59 },
  { name: 'Лебедева С.И.',    role: 'Бухгалтер',  start: '05.05.2026', end: '04.08.2026', daysLeft: 81 },
  { name: 'Громова Т.В.',     role: 'Менеджер',   start: '12.05.2026', end: '11.08.2026', daysLeft: 88 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'В пути':        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'На объекте':
    case 'В работе':      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Выполнен':
    case 'Оплачен':       return 'bg-green-100 text-green-800 border-green-200';
    case 'Ожидание ЗИП':
    case 'Частично':      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Просрочен':
    case 'Новая':         return 'bg-red-100 text-red-800 border-red-200';
    default:              return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

function priorityColor(p: string): string {
  if (p === 'high')   return 'bg-red-100 text-red-700 border-red-200';
  if (p === 'medium') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return 'bg-gray-100 text-gray-600 border-gray-200';
}

function priorityLabel(p: string): string {
  if (p === 'high')   return 'Высокий';
  if (p === 'medium') return 'Средний';
  return 'Низкий';
}

// ─── Director Dashboard ───────────────────────────────────────────────────────

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Выручка за 6 месяцев, млн ₽</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[2, 'auto']} />
                <Tooltip formatter={(v: number) => [`${v} млн ₽`, 'Выручка']} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  fill="url(#revGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Распределение по типам работ</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={workTypeData}
                  cx="50%"
                  cy="45%"
                  outerRadius={75}
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

      {/* Top engineers + top clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="Award" className="w-4 h-4 text-yellow-500" />
              Топ-3 инженера
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Инженер</TableHead>
                  <TableHead>Нарядов</TableHead>
                  <TableHead>Выручка</TableHead>
                  <TableHead>Рейтинг</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topEngineers.map((e) => (
                  <TableRow key={e.name}>
                    <TableCell className="font-medium text-sm">{e.name}</TableCell>
                    <TableCell className="text-sm">{e.orders}</TableCell>
                    <TableCell className="text-sm">{e.revenue}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">★ {e.rating}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="Building" className="w-4 h-4 text-indigo-500" />
              Топ-3 клиента
            </CardTitle>
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
                    <TableCell className="font-medium text-sm">{c.name}</TableCell>
                    <TableCell className="text-sm">{c.revenue}</TableCell>
                    <TableCell className="text-sm">{c.orders}</TableCell>
                    <TableCell>
                      <Badge variant={c.nps >= 90 ? 'default' : 'secondary'}>{c.nps}</Badge>
                    </TableCell>
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

// ─── Dispatcher Dashboard ─────────────────────────────────────────────────────

function DispatcherView() {
  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {dispatcherKpis.map((k) => (
          <Card key={k.label} className={k.alert ? 'border-red-300' : ''}>
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground">{k.label}</p>
              <p className={`text-3xl font-bold mt-1 ${k.alert ? 'text-red-600' : ''}`}>{k.value}</p>
              {k.alert && (
                <span className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <Icon name="AlertTriangle" className="w-3 h-3" />
                  Требует внимания
                </span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today orders list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Наряды на сегодня</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {todayWorkOrders.map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between rounded-lg border p-3 text-sm gap-3"
            >
              <span className="font-mono text-xs text-muted-foreground w-36 shrink-0">{o.id}</span>
              <span className="flex-1 truncate">{o.client}</span>
              <span className="text-muted-foreground w-32 shrink-0 text-center">{o.engineer}</span>
              <Badge
                variant="outline"
                className={`shrink-0 text-xs ${statusBadgeClass(o.status)}`}
              >
                {o.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Engineer load bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Загрузка инженеров (нарядов сегодня)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={engineerLoadData} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} domain={[0, 6]} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={90} />
              <Tooltip />
              <Bar dataKey="нарядов" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Manager Dashboard ────────────────────────────────────────────────────────

function ManagerView() {
  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        {managerKpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground">{k.label}</p>
              <p className="text-2xl font-bold mt-1">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sales funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Воронка продаж</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {funnelData.map((s, idx) => (
              <div key={s.stage} className="flex items-center gap-4">
                <span className="w-36 text-sm text-right text-muted-foreground shrink-0">
                  {s.stage}
                </span>
                <div className="flex-1 bg-muted rounded-full h-8 relative overflow-hidden">
                  <div
                    className="h-8 rounded-full flex items-center justify-end pr-3 transition-all"
                    style={{
                      width: `${s.pct}%`,
                      backgroundColor: PIE_COLORS[idx % PIE_COLORS.length],
                      minWidth: '3.5rem',
                    }}
                  >
                    <span className="text-white text-xs font-bold">{s.count}</span>
                  </div>
                </div>
                <span className="w-10 text-xs text-muted-foreground text-right">{s.pct}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tasks today */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="ListChecks" className="w-4 h-4" />
            Задачи на сегодня
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {managerTasks.map((t, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border p-3 gap-3"
            >
              <div className="flex items-center gap-3">
                <Icon name="Circle" className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm">{t.text}</span>
              </div>
              <Badge
                variant="outline"
                className={`shrink-0 text-xs ${priorityColor(t.priority)}`}
              >
                {priorityLabel(t.priority)}
              </Badge>
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
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {accountantKpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground">{k.label}</p>
              <p className={`text-2xl font-bold mt-1 ${k.color}`}>{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Invoices table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Счета</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>№ счёта</TableHead>
                <TableHead>Клиент</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Срок оплаты</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-sm">{inv.id}</TableCell>
                  <TableCell className="font-medium text-sm">{inv.client}</TableCell>
                  <TableCell className="text-sm">{inv.amount}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{inv.due}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs ${statusBadgeClass(inv.status)}`}
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

      {/* Receipts line chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Поступления за 30 дней, тыс. ₽</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={receiptsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10 }}
                interval={4}
                label={{ value: 'День', position: 'insideBottomRight', offset: -5, fontSize: 11 }}
              />
              <YAxis tick={{ fontSize: 11 }} unit=" тыс" width={55} />
              <Tooltip formatter={(v: number) => [`${v} тыс. ₽`, 'Поступления']} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── HR Dashboard ─────────────────────────────────────────────────────────────

function HRView() {
  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {hrKpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground">{k.label}</p>
              <p className="text-3xl font-bold mt-1">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plan vs Fact bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">План / Факт нарядов по инженерам (месяц)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={engineerPlanFact} margin={{ left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 35]} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="план" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="факт"  fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Probation table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="Clock" className="w-4 h-4 text-orange-500" />
            Испытательный срок
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Сотрудник</TableHead>
                <TableHead>Должность</TableHead>
                <TableHead>Начало</TableHead>
                <TableHead>Окончание</TableHead>
                <TableHead>Осталось дней</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {probationEmployees.map((e) => (
                <TableRow key={e.name}>
                  <TableCell className="font-medium text-sm">{e.name}</TableCell>
                  <TableCell className="text-sm">{e.role}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{e.start}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{e.end}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        e.daysLeft <= 30
                          ? 'border-red-300 text-red-700 bg-red-50'
                          : e.daysLeft <= 60
                          ? 'border-yellow-300 text-yellow-700 bg-yellow-50'
                          : 'border-green-300 text-green-700 bg-green-50'
                      }
                    >
                      {e.daysLeft} дн.
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

// ─── Main component ───────────────────────────────────────────────────────────

export default function RoleDashboard() {
  const [activeRole, setActiveRole] = useState<Role>('director');

  function renderView() {
    switch (activeRole) {
      case 'director':   return <DirectorView />;
      case 'dispatcher': return <DispatcherView />;
      case 'manager':    return <ManagerView />;
      case 'accountant': return <AccountantView />;
      case 'hr':         return <HRView />;
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
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
