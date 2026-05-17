import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ─── Mock data ───────────────────────────────────────────────────────────────

const CLIENT = {
  id: 'c-007',
  name: 'ООО «Торговый центр Галерея»',
  type: 'Юрлицо',
  inn: '7804123456',
  kpp: '780401001',
  ogrn: '1027800112233',
  legalAddress: 'г. Санкт-Петербург, Лиговский пр., д. 30, литера А',
  actualAddress: 'г. Санкт-Петербург, Лиговский пр., д. 30, литера А',
  contractStatus: 'Активный' as const,
  manager: 'Козлова Марина Владимировна',
  ordersTotal: 63,
  ordersActive: 4,
  revenueYear: 1_240_000,
  nps: 87,
};

const CONTACTS = [
  { name: 'Петров Алексей Дмитриевич', role: 'Технический директор', phone: '+7 (812) 334-11-22', email: 'petrov@gallery-tc.ru' },
  { name: 'Смирнова Ольга Николаевна', role: 'Главный бухгалтер', phone: '+7 (812) 334-11-33', email: 'smirnova@gallery-tc.ru' },
  { name: 'Федоров Иван Сергеевич', role: 'Инженер по эксплуатации', phone: '+7 (921) 555-77-88', email: 'fedorov@gallery-tc.ru' },
];

const MONTHLY_ORDERS = [
  { month: 'Май', orders: 4 }, { month: 'Июн', orders: 6 },
  { month: 'Июл', orders: 5 }, { month: 'Авг', orders: 8 },
  { month: 'Сен', orders: 7 }, { month: 'Окт', orders: 5 },
  { month: 'Ноя', orders: 9 }, { month: 'Дек', orders: 11 },
  { month: 'Янв', orders: 3 }, { month: 'Фев', orders: 5 },
  { month: 'Мар', orders: 6 }, { month: 'Апр', orders: 7 },
];

const HEALTH = {
  total: 82,
  items: [
    { label: 'Вовлечённость', value: 90 },
    { label: 'Соблюдение SLA', value: 95 },
    { label: 'Платёжная дисциплина', value: 85 },
    { label: 'Активность', value: 78 },
    { label: 'NPS / Удовлетворённость', value: 87 },
  ],
};

const OBJECTS = [
  { id: 'obj-1', name: 'ТЦ Галерея — Атриум (1 эт.)', address: 'Лиговский пр., 30, 1 этаж', equipment: 12, lastMaint: '14.04.2026', nextMaint: '14.10.2026' },
  { id: 'obj-2', name: 'ТЦ Галерея — Фуд-корт (3 эт.)', address: 'Лиговский пр., 30, 3 этаж', equipment: 8, lastMaint: '02.05.2026', nextMaint: '02.11.2026' },
  { id: 'obj-3', name: 'ТЦ Галерея — Кинотеатр (5 эт.)', address: 'Лиговский пр., 30, 5 этаж', equipment: 6, lastMaint: '20.03.2026', nextMaint: '20.09.2026' },
  { id: 'obj-4', name: 'Административный корпус', address: 'Лиговский пр., 32, офис', equipment: 4, lastMaint: '10.04.2026', nextMaint: '10.10.2026' },
];

const TIMELINE = [
  { id: 1, date: '16.05.2026', type: 'order', icon: 'Wrench', color: 'text-blue-600', text: 'Создан наряд WO-2026-000091 — Аварийный ремонт VRF', amount: null },
  { id: 2, date: '14.05.2026', type: 'call', icon: 'Phone', color: 'text-green-600', text: 'Входящий звонок от Федорова И.С. — сообщил о неисправности', amount: null },
  { id: 3, date: '10.05.2026', type: 'payment', icon: 'CircleDollarSign', color: 'text-emerald-600', text: 'Оплачен счёт СЧ-2026-00078', amount: 42_500 },
  { id: 4, date: '05.05.2026', type: 'order', icon: 'CheckCircle', color: 'text-teal-600', text: 'Закрыт наряд WO-2026-000078 — Плановое ТО, атриум', amount: 18_000 },
  { id: 5, date: '22.04.2026', type: 'order', icon: 'Wrench', color: 'text-blue-600', text: 'Создан наряд WO-2026-000078 — Плановое ТО (12 ед.)', amount: null },
  { id: 6, date: '15.04.2026', type: 'contract', icon: 'FileText', color: 'text-purple-600', text: 'Подписано доп. соглашение №3 к договору ДОГ-2024-0031', amount: null },
  { id: 7, date: '01.04.2026', type: 'payment', icon: 'CircleDollarSign', color: 'text-emerald-600', text: 'Оплачен счёт СЧ-2026-00061', amount: 8_900 },
  { id: 8, date: '20.03.2026', type: 'order', icon: 'CheckCircle', color: 'text-teal-600', text: 'Закрыт наряд WO-2026-000055 — ТО кинотеатр', amount: 12_500 },
  { id: 9, date: '01.03.2026', type: 'contract', icon: 'Handshake', color: 'text-indigo-600', text: 'Пролонгирован договор технического обслуживания на 2026 год', amount: null },
  { id: 10, date: '15.02.2026', type: 'nps', icon: 'Star', color: 'text-yellow-500', text: 'Оставлен NPS отзыв — оценка 9/10 («Очень доволен сервисом»)', amount: null },
];

const INVOICES = [
  { id: 'СЧ-2026-00091', date: '16.05.2026', amount: 0, status: 'Выставляется', desc: 'Аварийный ремонт VRF' },
  { id: 'СЧ-2026-00083', date: '05.05.2026', amount: 18_000, status: 'Оплачен', desc: 'Плановое ТО, апрель' },
  { id: 'СЧ-2026-00078', date: '25.04.2026', amount: 42_500, status: 'Оплачен', desc: 'Ремонт VRF система, фуд-корт' },
  { id: 'СЧ-2026-00061', date: '05.04.2026', amount: 8_900, status: 'Просрочен', desc: 'Замена фильтров' },
  { id: 'СЧ-2026-00048', date: '18.03.2026', amount: 12_500, status: 'Оплачен', desc: 'ТО кинотеатр' },
];

const QUARTERLY_REVENUE = [
  { quarter: 'Q2 2025', revenue: 285_000 },
  { quarter: 'Q3 2025', revenue: 320_000 },
  { quarter: 'Q4 2025', revenue: 410_000 },
  { quarter: 'Q1 2026', revenue: 225_000 },
];

const DOCUMENTS = [
  { id: 'doc-1', name: 'Договор ТО № ДОГ-2024-0031', date: '01.03.2024', type: 'Договор', size: '1.2 МБ' },
  { id: 'doc-2', name: 'Доп. соглашение №1 к ДОГ-2024-0031', date: '01.09.2024', type: 'Доп. соглашение', size: '340 КБ' },
  { id: 'doc-3', name: 'Доп. соглашение №2 к ДОГ-2024-0031', date: '01.03.2025', type: 'Доп. соглашение', size: '380 КБ' },
  { id: 'doc-4', name: 'Доп. соглашение №3 к ДОГ-2024-0031', date: '15.04.2026', type: 'Доп. соглашение', size: '295 КБ' },
  { id: 'doc-5', name: 'Акт выполненных работ №АКТ-2026-00055', date: '20.03.2026', type: 'Акт', size: '210 КБ' },
  { id: 'doc-6', name: 'Акт выполненных работ №АКТ-2026-00078', date: '05.05.2026', type: 'Акт', size: '230 КБ' },
];

const TASKS = [
  { id: 't-1', title: 'Согласовать дату следующего ТО атриума', priority: 'Высокий', assignee: 'Козлова М.В.', due: '20.05.2026', status: 'Открыта' },
  { id: 't-2', title: 'Выставить счёт за аварийный ремонт WO-2026-000091', priority: 'Высокий', assignee: 'Козлова М.В.', due: '18.05.2026', status: 'Открыта' },
  { id: 't-3', title: 'Отправить КП на расширение договора (2 новых объекта)', priority: 'Средний', assignee: 'Иванов С.Р.', due: '25.05.2026', status: 'В работе' },
  { id: 't-4', title: 'Напомнить об оплате просроченного счёта СЧ-2026-00061', priority: 'Средний', assignee: 'Козлова М.В.', due: '17.05.2026', status: 'Открыта' },
  { id: 't-5', title: 'Подготовить отчёт по хладагентам за Q1 2026', priority: 'Низкий', assignee: 'Петров А.Д.', due: '31.05.2026', status: 'Открыта' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(n);

const healthColor = (v: number) =>
  v >= 80 ? 'bg-green-500' : v >= 60 ? 'bg-yellow-500' : 'bg-red-500';

const invoiceStatusVariant = (s: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (s === 'Оплачен') return 'default';
  if (s === 'Просрочен') return 'destructive';
  return 'secondary';
};

const priorityVariant = (p: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (p === 'Высокий') return 'destructive';
  if (p === 'Средний') return 'secondary';
  return 'outline';
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const KPICard = ({ label, value, sub, iconName }: { label: string; value: string; sub?: string; iconName: string }) => (
  <Card>
    <CardContent className="p-4 flex items-center gap-3">
      <div className="p-2 bg-blue-50 rounded-lg">
        <Icon name={iconName} size={20} className="text-blue-600" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </CardContent>
  </Card>
);

const HealthRow = ({ label, value }: { label: string; value: number }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold">{value}%</span>
    </div>
    <Progress value={value} className="h-2" indicatorClassName={healthColor(value)} />
  </div>
);

// ─── Tab: Обзор ───────────────────────────────────────────────────────────────

const TabOverview = () => (
  <div className="space-y-5">
    {/* Реквизиты */}
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon name="Building2" size={16} className="text-gray-500" />
          Реквизиты
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
        <div className="flex gap-2"><span className="text-gray-500 w-28 shrink-0">ИНН</span><span className="font-medium">{CLIENT.inn}</span></div>
        <div className="flex gap-2"><span className="text-gray-500 w-28 shrink-0">КПП</span><span className="font-medium">{CLIENT.kpp}</span></div>
        <div className="flex gap-2"><span className="text-gray-500 w-28 shrink-0">ОГРН</span><span className="font-medium">{CLIENT.ogrn}</span></div>
        <div className="flex gap-2"><span className="text-gray-500 w-28 shrink-0">Менеджер</span><span className="font-medium">{CLIENT.manager}</span></div>
        <div className="flex gap-2 sm:col-span-2"><span className="text-gray-500 w-28 shrink-0">Юр. адрес</span><span className="font-medium">{CLIENT.legalAddress}</span></div>
      </CardContent>
    </Card>

    {/* Контактные лица */}
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon name="Users" size={16} className="text-gray-500" />
          Контактные лица
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {CONTACTS.map((c) => (
          <div key={c.email} className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                {c.name.split(' ').slice(0, 2).map((w) => w[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{c.name}</p>
              <p className="text-xs text-gray-500">{c.role}</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm">{c.phone}</p>
              <p className="text-xs text-gray-400">{c.email}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>

    {/* KPI */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <KPICard label="Нарядов всего" value={String(CLIENT.ordersTotal)} iconName="ClipboardList" />
      <KPICard label="Активных нарядов" value={String(CLIENT.ordersActive)} iconName="Loader" />
      <KPICard label="Выручка за год" value={`${fmt(CLIENT.revenueYear)} ₽`} iconName="TrendingUp" />
      <KPICard label="NPS оценка" value={`${CLIENT.nps} / 100`} sub="Отлично" iconName="Star" />
    </div>

    {/* Активность по месяцам */}
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon name="BarChart2" size={16} className="text-gray-500" />
          Активность (наряды) по месяцам
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={MONTHLY_ORDERS} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Area type="monotone" dataKey="orders" stroke="#3b82f6" fill="url(#ordersGrad)" strokeWidth={2} name="Нарядов" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>

    {/* Health Score */}
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon name="HeartPulse" size={16} className="text-gray-500" />
          Здоровье клиента (Client Health Score)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-green-100 border-4 border-green-400 flex items-center justify-center">
            <span className="text-xl font-bold text-green-700">{HEALTH.total}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-green-700">Отличный клиент</p>
            <p className="text-xs text-gray-500">из 100 возможных баллов</p>
          </div>
        </div>
        <div className="space-y-2">
          {HEALTH.items.map((item) => (
            <HealthRow key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// ─── Tab: Объекты ────────────────────────────────────────────────────────────

const TabObjects = () => (
  <div className="space-y-3">
    {OBJECTS.map((obj) => (
      <Card key={obj.id}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg mt-0.5">
                <Icon name="Building" size={18} className="text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">{obj.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{obj.address}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Icon name="Cpu" size={12} />
                    {obj.equipment} ед. оборудования
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="CalendarCheck" size={12} />
                    Последнее ТО: {obj.lastMaint}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="CalendarClock" size={12} />
                    Следующее ТО: {obj.nextMaint}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="shrink-0 text-xs">
              <Icon name="Eye" size={13} className="mr-1" />
              Детали
            </Button>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// ─── Tab: История ────────────────────────────────────────────────────────────

const TabHistory = () => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-base flex items-center gap-2">
        <Icon name="History" size={16} className="text-gray-500" />
        Последние события
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" />
        <div className="space-y-5">
          {TIMELINE.map((ev) => (
            <div key={ev.id} className="flex gap-4 relative">
              <div className={`w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shrink-0 z-10 ${ev.color}`}>
                <Icon name={ev.icon} size={16} />
              </div>
              <div className="flex-1 pb-1">
                <p className="text-sm">{ev.text}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">{ev.date}</span>
                  {ev.amount !== null && (
                    <span className="text-xs font-semibold text-emerald-600">
                      {fmt(ev.amount)} ₽
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

// ─── Tab: Финансы ─────────────────────────────────────────────────────────────

const TabFinance = () => (
  <div className="space-y-5">
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon name="Receipt" size={16} className="text-gray-500" />
          Счета
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-500 text-xs">
                <th className="text-left pb-2 font-medium">Номер</th>
                <th className="text-left pb-2 font-medium">Дата</th>
                <th className="text-left pb-2 font-medium">Описание</th>
                <th className="text-right pb-2 font-medium">Сумма</th>
                <th className="text-left pb-2 font-medium pl-3">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {INVOICES.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="py-2.5 font-mono text-xs">{inv.id}</td>
                  <td className="py-2.5 text-gray-600">{inv.date}</td>
                  <td className="py-2.5 text-gray-700">{inv.desc}</td>
                  <td className="py-2.5 text-right font-semibold">
                    {inv.amount ? `${fmt(inv.amount)} ₽` : '—'}
                  </td>
                  <td className="py-2.5 pl-3">
                    <Badge variant={invoiceStatusVariant(inv.status)} className="text-xs">
                      {inv.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon name="BarChart3" size={16} className="text-gray-500" />
          Выручка по кварталам
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={QUARTERLY_REVENUE} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => [`${fmt(v)} ₽`, 'Выручка']} />
            <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Выручка" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  </div>
);

// ─── Tab: Документы ───────────────────────────────────────────────────────────

const DOC_TYPE_ICON: Record<string, string> = {
  'Договор': 'FileContract',
  'Доп. соглашение': 'FilePlus',
  'Акт': 'FileCheck',
};

const TabDocuments = () => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-base flex items-center gap-2">
        <Icon name="FolderOpen" size={16} className="text-gray-500" />
        Документы
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      {DOCUMENTS.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div className="p-2 bg-blue-50 rounded-lg shrink-0">
            <Icon name={DOC_TYPE_ICON[doc.type] ?? 'File'} size={18} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{doc.name}</p>
            <p className="text-xs text-gray-400">{doc.type} · {doc.date} · {doc.size}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={() => toast.success(`Загрузка: ${doc.name}`)}
          >
            <Icon name="Download" size={15} className="mr-1" />
            Скачать
          </Button>
        </div>
      ))}
    </CardContent>
  </Card>
);

// ─── Tab: Задачи ──────────────────────────────────────────────────────────────

const TASK_STATUS_COLOR: Record<string, string> = {
  'Открыта': 'text-gray-500 bg-gray-50',
  'В работе': 'text-blue-600 bg-blue-50',
};

const TabTasks = () => (
  <div className="space-y-3">
    {TASKS.map((task) => (
      <Card key={task.id}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 p-1.5 rounded-md ${TASK_STATUS_COLOR[task.status] ?? 'text-gray-500 bg-gray-50'}`}>
              <Icon name="CheckSquare" size={15} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{task.title}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <Badge variant={priorityVariant(task.priority)} className="text-xs">{task.priority}</Badge>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Icon name="User" size={11} />
                  {task.assignee}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Icon name="Calendar" size={11} />
                  до {task.due}
                </span>
              </div>
            </div>
            <Badge variant="outline" className="text-xs shrink-0">{task.status}</Badge>
          </div>
        </CardContent>
      </Card>
    ))}
    <Button variant="outline" className="w-full text-sm">
      <Icon name="Plus" size={15} className="mr-2" />
      Добавить задачу
    </Button>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

export default function ClientCard360Full() {
  const [activeTab, setActiveTab] = useState('overview');

  const handleCall = () => toast.info(`Звоним: ${CONTACTS[0].phone}`);
  const handleChat = () => toast.info('Открываем чат в Inbox...');
  const handleNewOrder = () => toast.success('Переход к созданию наряда...');
  const handleEdit = () => toast.info('Редактирование карточки клиента...');

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* ── Шапка ── */}
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Аватар */}
              <Avatar className="h-16 w-16 shrink-0">
                <AvatarFallback className="bg-blue-600 text-white text-xl font-bold">ТГ</AvatarFallback>
              </Avatar>

              {/* Инфо */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-gray-900">{CLIENT.name}</h1>
                  <Badge variant="secondary">{CLIENT.type}</Badge>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    <Icon name="ShieldCheck" size={12} className="mr-1" />
                    {CLIENT.contractStatus} договор
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Icon name="UserCircle" size={14} />
                    {CLIENT.manager}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="MapPin" size={14} />
                    Санкт-Петербург
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="Building2" size={14} />
                    ИНН {CLIENT.inn}
                  </span>
                </div>
              </div>

              {/* Кнопки */}
              <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                <Button size="sm" onClick={handleNewOrder}>
                  <Icon name="Plus" size={14} className="mr-1.5" />
                  Создать наряд
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCall}>
                    <Icon name="Phone" size={14} className="mr-1.5" />
                    Позвонить
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleChat}>
                    <Icon name="MessageSquare" size={14} className="mr-1.5" />
                    В чат
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleEdit}>
                    <Icon name="Pencil" size={14} />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Вкладки ── */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap gap-1 h-auto">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="objects">Объекты</TabsTrigger>
            <TabsTrigger value="history">История</TabsTrigger>
            <TabsTrigger value="finance">Финансы</TabsTrigger>
            <TabsTrigger value="documents">Документы</TabsTrigger>
            <TabsTrigger value="tasks">Задачи</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <TabOverview />
          </TabsContent>

          <TabsContent value="objects" className="mt-4">
            <TabObjects />
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <TabHistory />
          </TabsContent>

          <TabsContent value="finance" className="mt-4">
            <TabFinance />
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <TabDocuments />
          </TabsContent>

          <TabsContent value="tasks" className="mt-4">
            <TabTasks />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
