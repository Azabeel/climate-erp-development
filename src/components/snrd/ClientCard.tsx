import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// ─── Mock data ─────────────────────────────────────────────────────────────

const CLIENT = {
  id: 'c-001',
  name: 'ООО «Торговый Центр Европа»',
  type: 'LEGAL_ENTITY' as const,
  inn: '7701234567',
  ogrn: '1027700345678',
  address: 'г. Москва, ул. Новый Арбат, д. 15, стр. 1',
  phone: '+7 (495) 123-45-67',
  email: 'info@tc-europa.ru',
  telegram: '@tc_europa',
  manager: 'Соколова Анна Петровна',
  status: 'VIP' as const,
  revenueYear: 847_000,
  ordersTotal: 48,
  activeObjects: 6,
  nps: 72,
};

const MONTHLY_REVENUE = [
  { month: 'Май', revenue: 58000 },
  { month: 'Июн', revenue: 72000 },
  { month: 'Июл', revenue: 65000 },
  { month: 'Авг', revenue: 81000 },
  { month: 'Сен', revenue: 74000 },
  { month: 'Окт', revenue: 69000 },
  { month: 'Ноя', revenue: 92000 },
  { month: 'Дек', revenue: 88000 },
  { month: 'Янв', revenue: 53000 },
  { month: 'Фев', revenue: 61000 },
  { month: 'Мар', revenue: 77000 },
  { month: 'Апр', revenue: 57000 },
];

const INVOICES = [
  { id: 'СЧ-2026-00089', date: '10.05.2026', amount: 28500, status: 'Оплачен' },
  { id: 'СЧ-2026-00074', date: '22.04.2026', amount: 14200, status: 'Оплачен' },
  { id: 'СЧ-2026-00061', date: '05.04.2026', amount: 8900,  status: 'В ожидании' },
  { id: 'СЧ-2026-00048', date: '18.03.2026', amount: 55000, status: 'Оплачен' },
  { id: 'СЧ-2026-00033', date: '28.02.2026', amount: 12400, status: 'Просрочен' },
  { id: 'СЧ-2026-00021', date: '10.02.2026', amount: 6300,  status: 'Оплачен' },
];

const SERVICE_PIE = [
  { name: 'Ремонт',  value: 38 },
  { name: 'ТО',      value: 29 },
  { name: 'Монтаж',  value: 21 },
  { name: 'ЗИП',     value: 12 },
];
const PIE_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899'];

const OBJECTS = [
  { id: 'o1', name: 'ТЦ Европа — Торговый зал',    address: 'ул. Новый Арбат, 15', equipment: 14, nextMaint: '20.06.2026', status: 'ok' },
  { id: 'o2', name: 'ТЦ Европа — Фуд-корт',        address: 'ул. Новый Арбат, 15', equipment: 8,  nextMaint: '15.05.2026', status: 'warn' },
  { id: 'o3', name: 'ТЦ Европа — Кинотеатр',       address: 'ул. Новый Арбат, 15', equipment: 6,  nextMaint: '10.07.2026', status: 'ok' },
  { id: 'o4', name: 'ТЦ Европа — Офисный блок А',  address: 'ул. Новый Арбат, 15', equipment: 5,  nextMaint: '02.06.2026', status: 'ok' },
  { id: 'o5', name: 'ТЦ Европа — Офисный блок Б',  address: 'ул. Новый Арбат, 15', equipment: 4,  nextMaint: '18.08.2026', status: 'ok' },
  { id: 'o6', name: 'Склад (пер. Малый Власьевский)', address: 'пер. Малый Власьевский, 7', equipment: 3, nextMaint: '30.09.2026', status: 'crit' },
];

const ORDERS = [
  { id: 'WO-2026-000194', object: 'Торговый зал',  engineer: 'Иванов А.С.',   date: '12.05.2026', status: 'Выполнен', amount: 8500 },
  { id: 'WO-2026-000181', object: 'Фуд-корт',      engineer: 'Петров Д.В.',   date: '05.05.2026', status: 'В работе', amount: 14200 },
  { id: 'WO-2026-000165', object: 'Кинотеатр',     engineer: 'Сидоров Н.П.',  date: '28.04.2026', status: 'Выполнен', amount: 22000 },
  { id: 'WO-2026-000148', object: 'Офисный блок А', engineer: 'Иванов А.С.', date: '20.04.2026', status: 'Выполнен', amount: 5800 },
  { id: 'WO-2026-000133', object: 'Торговый зал',  engineer: 'Козлов М.Р.',   date: '12.04.2026', status: 'Выполнен', amount: 18600 },
  { id: 'WO-2026-000119', object: 'Склад',         engineer: 'Петров Д.В.',   date: '01.04.2026', status: 'Выполнен', amount: 4500 },
  { id: 'WO-2026-000104', object: 'Фуд-корт',      engineer: 'Сидоров Н.П.',  date: '22.03.2026', status: 'Выполнен', amount: 9200 },
  { id: 'WO-2026-000089', object: 'Офисный блок Б', engineer: 'Иванов А.С.', date: '15.03.2026', status: 'Выполнен', amount: 7700 },
  { id: 'WO-2026-000072', object: 'Кинотеатр',     engineer: 'Козлов М.Р.',   date: '05.03.2026', status: 'Выполнен', amount: 55000 },
  { id: 'WO-2026-000058', object: 'Торговый зал',  engineer: 'Петров Д.В.',   date: '20.02.2026', status: 'Выполнен', amount: 3200 },
];

const ORDERS_BY_MONTH = [
  { month: 'Май',  count: 5 }, { month: 'Июн', count: 3 }, { month: 'Июл', count: 6 },
  { month: 'Авг',  count: 4 }, { month: 'Сен', count: 7 }, { month: 'Окт', count: 5 },
  { month: 'Ноя',  count: 8 }, { month: 'Дек', count: 6 }, { month: 'Янв', count: 4 },
  { month: 'Фев',  count: 3 }, { month: 'Мар', count: 5 }, { month: 'Апр', count: 4 },
];

const TIMELINE = [
  { id: 't1', type: 'call',     icon: 'Phone',         date: '12.05.2026 10:15', actor: 'Соколова А.П.', text: 'Исходящий звонок — согласовали визит инженера на фуд-корт' },
  { id: 't2', type: 'order',    icon: 'ClipboardList',  date: '05.05.2026 14:30', actor: 'Система',        text: 'Создан наряд WO-2026-000181 (ТО фуд-корт)' },
  { id: 't3', type: 'whatsapp', icon: 'MessageCircle',  date: '02.05.2026 09:05', actor: 'Менеджер',       text: 'Отправлено КП на обслуживание склада' },
  { id: 't4', type: 'meeting',  icon: 'Users',          date: '28.04.2026 11:00', actor: 'Соколова А.П.', text: 'Встреча с директором ТЦ — обсуждение контракта на 2026 год' },
  { id: 't5', type: 'email',    icon: 'Mail',           date: '25.04.2026 16:42', actor: 'Клиент',         text: 'Входящее письмо — вопрос по стоимости монтажа новых блоков' },
  { id: 't6', type: 'proposal', icon: 'FileText',       date: '20.04.2026 13:00', actor: 'Соколова А.П.', text: 'Выставлено КП-2026-047 на 3 варианта (Good/Better/Best)' },
  { id: 't7', type: 'call',     icon: 'Phone',          date: '15.04.2026 09:30', actor: 'Клиент',         text: 'Входящий звонок — жалоба на шум в кондиционере торгового зала' },
  { id: 't8', type: 'invoice',  icon: 'Receipt',        date: '10.04.2026 12:00', actor: 'Система',        text: 'Выставлен счёт СЧ-2026-00074 на 14 200 ₽' },
];

const HEALTH = {
  total: 78,
  metrics: [
    { label: 'Частота нарядов',       value: 85, icon: 'ClipboardList' },
    { label: 'Своевременность оплат', value: 72, icon: 'CreditCard' },
    { label: 'NPS',                    value: 72, icon: 'Star' },
    { label: 'Длительность отношений', value: 90, icon: 'CalendarDays' },
    { label: 'Объём выручки',         value: 80, icon: 'TrendingUp' },
    { label: 'Активность контактов',   value: 68, icon: 'MessageSquare' },
  ],
  recommendations: [
    { icon: 'BellRing',   text: 'Предложить годовое ТО — срок истекает через 2 мес для фуд-корта' },
    { icon: 'AlertCircle', text: 'Просроченный счёт СЧ-2026-00033 — связаться с бухгалтером клиента' },
    { icon: 'Gift',       text: 'VIP-клиент с 3+ летней историей — рассмотреть программу лояльности' },
    { icon: 'Wrench',     text: 'Склад не обслуживался 8 мес — предложить внеплановый осмотр' },
  ],
};

// ─── Helpers ───────────────────────────────────────────────────────────────

const fmtMoney = (v: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(v);

const invoiceStatusColor = (s: string) => {
  if (s === 'Оплачен')    return 'bg-green-100 text-green-700';
  if (s === 'В ожидании') return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

const orderStatusColor = (s: string) => {
  if (s === 'Выполнен') return 'bg-green-100 text-green-700';
  if (s === 'В работе') return 'bg-blue-100 text-blue-700';
  if (s === 'Отменён')  return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-700';
};

const objectDot = (s: string) => {
  if (s === 'ok')   return 'bg-green-500';
  if (s === 'warn') return 'bg-yellow-500';
  return 'bg-red-500';
};

const healthColor = (v: number) =>
  v >= 80 ? 'text-green-600' : v >= 60 ? 'text-yellow-600' : 'text-red-600';

const healthBarBg = (v: number) =>
  v >= 80 ? 'bg-green-500' : v >= 60 ? 'bg-yellow-500' : 'bg-red-500';

const totalHealthRing = (v: number) =>
  v >= 80 ? 'text-green-600 border-green-500' : v >= 60 ? 'text-yellow-600 border-yellow-500' : 'text-red-600 border-red-500';

const TABS = [
  { id: 'profile',       label: 'Профиль',         icon: 'User' },
  { id: 'finance',       label: 'Финансы',          icon: 'DollarSign' },
  { id: 'objects',       label: 'Объекты',          icon: 'Building2' },
  { id: 'orders',        label: 'Наряды',           icon: 'ClipboardList' },
  { id: 'comms',         label: 'Коммуникации',     icon: 'MessageSquare' },
  { id: 'health',        label: 'Здоровье клиента', icon: 'Heart' },
] as const;

type TabId = typeof TABS[number]['id'];

// ─── Sub-components ────────────────────────────────────────────────────────

function KpiCard({ label, value, icon, sub }: { label: string; value: string; icon: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
        <Icon name={icon} size={14} />
        {label}
      </div>
      <span className="text-2xl font-bold text-gray-900">{value}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

// ─── Tab: Profile ──────────────────────────────────────────────────────────

function TabProfile() {
  const initials = 'ТЦ';
  const statusColors: Record<string, string> = {
    VIP:      'bg-violet-100 text-violet-700 border-violet-300',
    Стандарт: 'bg-blue-100 text-blue-700 border-blue-300',
    Новый:    'bg-gray-100 text-gray-600 border-gray-300',
  };
  const statusLabel = CLIENT.status === 'VIP' ? 'VIP' : 'Стандарт';

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-gray-900 truncate">{CLIENT.name}</h2>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColors[statusLabel]}`}>
              {statusLabel}
            </span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Icon name="Building2" size={13} />
              {CLIENT.type === 'LEGAL_ENTITY' ? 'Юридическое лицо' : 'Физическое лицо'}
            </span>
            <span className="flex items-center gap-1">
              <Icon name="Hash" size={13} />
              ИНН {CLIENT.inn}
            </span>
            <span className="flex items-center gap-1">
              <Icon name="FileText" size={13} />
              ОГРН {CLIENT.ogrn}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <Icon name="MapPin" size={13} />
            {CLIENT.address}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={() => toast.info('Открыт редактор клиента')}>
            <Icon name="Pencil" size={14} className="mr-1" /> Редактировать
          </Button>
          <Button size="sm" onClick={() => toast.success('Звонок инициирован')}>
            <Icon name="Phone" size={14} className="mr-1" /> Позвонить
          </Button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Выручка за год"     value={fmtMoney(CLIENT.revenueYear)} icon="TrendingUp"    sub="Апр 2025 — Апр 2026" />
        <KpiCard label="Нарядов всего"      value={String(CLIENT.ordersTotal)}   icon="ClipboardList" sub="за всё время" />
        <KpiCard label="Активных объектов"  value={String(CLIENT.activeObjects)} icon="Building2"     sub="на обслуживании" />
        <KpiCard label="NPS"                value={String(CLIENT.nps)}           icon="Star"          sub="из 100" />
      </div>

      {/* Contacts */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Контакты</h3>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          {[
            { icon: 'Phone',   label: 'Телефон',    value: CLIENT.phone },
            { icon: 'Mail',    label: 'Email',       value: CLIENT.email },
            { icon: 'Send',    label: 'Telegram',    value: CLIENT.telegram },
            { icon: 'UserCircle', label: 'Менеджер', value: CLIENT.manager },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                <Icon name={icon} size={15} className="text-indigo-600" />
              </div>
              <div>
                <div className="text-xs text-gray-400">{label}</div>
                <div className="font-medium text-gray-800">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Finance ──────────────────────────────────────────────────────────

function TabFinance() {
  const paid    = INVOICES.filter(i => i.status === 'Оплачен').reduce((s, i) => s + i.amount, 0);
  const pending = INVOICES.filter(i => i.status === 'В ожидании').reduce((s, i) => s + i.amount, 0);
  const overdue = INVOICES.filter(i => i.status === 'Просрочен').reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6">
      {/* Balance cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="text-xs text-green-600 font-medium mb-1 flex items-center gap-1">
            <Icon name="CheckCircle" size={13} /> Оплачено
          </div>
          <div className="text-xl font-bold text-green-700">{fmtMoney(paid)}</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="text-xs text-yellow-600 font-medium mb-1 flex items-center gap-1">
            <Icon name="Clock" size={13} /> В ожидании
          </div>
          <div className="text-xl font-bold text-yellow-700">{fmtMoney(pending)}</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="text-xs text-red-600 font-medium mb-1 flex items-center gap-1">
            <Icon name="AlertCircle" size={13} /> Просрочено
          </div>
          <div className="text-xl font-bold text-red-700">{fmtMoney(overdue)}</div>
        </div>
      </div>

      {/* Area chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Выручка по месяцам</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={MONTHLY_REVENUE} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}к`} />
            <Tooltip formatter={(v: number) => fmtMoney(v)} />
            <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)" name="Выручка" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Invoices table */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Последние счета</h3>
          <div className="space-y-2">
            {INVOICES.map(inv => (
              <div key={inv.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                <div>
                  <div className="font-medium text-gray-800">{inv.id}</div>
                  <div className="text-xs text-gray-400">{inv.date}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-800">{fmtMoney(inv.amount)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${invoiceStatusColor(inv.status)}`}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Распределение услуг</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={SERVICE_PIE} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" nameKey="name">
                {SERVICE_PIE.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Legend iconType="circle" iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Objects ──────────────────────────────────────────────────────────

function TabObjects() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {OBJECTS.map(obj => (
        <div key={obj.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-sm leading-tight truncate">{obj.name}</h4>
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                <Icon name="MapPin" size={11} />
                {obj.address}
              </div>
            </div>
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${objectDot(obj.status)}`} />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-gray-400 mb-0.5">Оборудование</div>
              <div className="font-semibold text-gray-800">{obj.equipment} ед.</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-gray-400 mb-0.5">Следующее ТО</div>
              <div className="font-semibold text-gray-800">{obj.nextMaint}</div>
            </div>
          </div>
          <Button
            size="sm" variant="ghost"
            className="mt-3 w-full text-xs h-7"
            onClick={() => toast.info(`Открыт объект: ${obj.name}`)}
          >
            <Icon name="Eye" size={12} className="mr-1" /> Открыть объект
          </Button>
        </div>
      ))}
    </div>
  );
}

// ─── Tab: Orders ───────────────────────────────────────────────────────────

function TabOrders() {
  return (
    <div className="space-y-6">
      {/* Bar chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Наряды по месяцам</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={ORDERS_BY_MONTH} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" name="Нарядов" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Последние наряды</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs font-medium">
                <th className="px-4 py-3 text-left">Номер</th>
                <th className="px-4 py-3 text-left">Объект</th>
                <th className="px-4 py-3 text-left">Инженер</th>
                <th className="px-4 py-3 text-left">Дата</th>
                <th className="px-4 py-3 text-left">Статус</th>
                <th className="px-4 py-3 text-right">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {ORDERS.map((o, i) => (
                <tr key={o.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-4 py-2.5 font-mono text-xs text-indigo-600 font-medium">{o.id}</td>
                  <td className="px-4 py-2.5 text-gray-800">{o.object}</td>
                  <td className="px-4 py-2.5 text-gray-600">{o.engineer}</td>
                  <td className="px-4 py-2.5 text-gray-500">{o.date}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${orderStatusColor(o.status)}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-gray-800">{fmtMoney(o.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Communications ───────────────────────────────────────────────────

function TabComms() {
  const [comment, setComment] = useState('');

  const timelineColors: Record<string, string> = {
    call:     'bg-blue-100 text-blue-600',
    whatsapp: 'bg-green-100 text-green-600',
    email:    'bg-purple-100 text-purple-600',
    meeting:  'bg-orange-100 text-orange-600',
    proposal: 'bg-indigo-100 text-indigo-600',
    invoice:  'bg-gray-100 text-gray-600',
    order:    'bg-cyan-100 text-cyan-600',
  };

  return (
    <div className="space-y-6">
      {/* Next action */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
          <Icon name="CalendarClock" size={16} className="text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-amber-600 font-medium">Следующее действие</div>
          <div className="text-sm font-semibold text-amber-900">Звонок клиенту — согласование планового ТО</div>
          <div className="text-xs text-amber-600">20.05.2026 · Ответственный: Соколова А.П.</div>
        </div>
        <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100 shrink-0"
          onClick={() => toast.success('Действие выполнено')}>
          Выполнено
        </Button>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">История коммуникаций</h3>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100" />
          <div className="space-y-4">
            {TIMELINE.map(ev => (
              <div key={ev.id} className="flex gap-4 pl-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${timelineColors[ev.type] ?? 'bg-gray-100 text-gray-600'}`}>
                  <Icon name={ev.icon} size={14} />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="text-sm text-gray-800">{ev.text}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{ev.date} · {ev.actor}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick comment */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Добавить комментарий</h3>
        <div className="flex gap-3">
          <textarea
            className="flex-1 border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
            rows={2}
            placeholder="Введите заметку или комментарий..."
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
          <Button
            className="self-end"
            disabled={!comment.trim()}
            onClick={() => {
              toast.success('Комментарий добавлен');
              setComment('');
            }}
          >
            <Icon name="Send" size={14} className="mr-1" /> Сохранить
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Health ───────────────────────────────────────────────────────────

function TabHealth() {
  const score = HEALTH.total;

  return (
    <div className="space-y-6">
      {/* Score ring */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className={`w-32 h-32 rounded-full border-8 flex flex-col items-center justify-center shrink-0 ${totalHealthRing(score)}`}>
          <span className={`text-4xl font-bold ${totalHealthRing(score).split(' ')[0]}`}>{score}</span>
          <span className="text-xs text-gray-400">из 100</span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg mb-1">Здоровье клиента</h3>
          <p className="text-sm text-gray-500 mb-3">
            Комплексный показатель на основе активности, платёжности, NPS и истории взаимодействий.
          </p>
          <div className="flex items-center gap-3 text-sm">
            <Badge className="bg-violet-100 text-violet-700 border-violet-300">VIP-клиент</Badge>
            <span className="text-gray-500 flex items-center gap-1">
              <Icon name="TrendingUp" size={13} className="text-green-500" /> +3 балла за последний месяц
            </span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Детальные метрики</h3>
        <div className="grid sm:grid-cols-2 gap-5">
          {HEALTH.metrics.map(m => (
            <div key={m.label}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Icon name={m.icon} size={14} className="text-gray-400" />
                  {m.label}
                </div>
                <span className={`text-sm font-bold ${healthColor(m.value)}`}>{m.value}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${healthBarBg(m.value)}`}
                  style={{ width: `${m.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI recommendations */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
            <Icon name="Sparkles" size={13} className="text-white" />
          </div>
          <h3 className="font-semibold text-gray-900">Рекомендации ИИ</h3>
        </div>
        <div className="space-y-3">
          {HEALTH.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-indigo-50 border border-indigo-100">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                <Icon name={rec.icon} size={14} className="text-indigo-600" />
              </div>
              <p className="text-sm text-indigo-900 leading-relaxed">{rec.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Root component ─────────────────────────────────────────────────────────

export default function ClientCard() {
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Page title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Icon name="UserCircle" size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">360° Карточка клиента</h1>
            <p className="text-xs text-gray-400">{CLIENT.name}</p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <Icon name={tab.icon} size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {activeTab === 'profile' && <TabProfile />}
          {activeTab === 'finance' && <TabFinance />}
          {activeTab === 'objects' && <TabObjects />}
          {activeTab === 'orders'  && <TabOrders />}
          {activeTab === 'comms'   && <TabComms />}
          {activeTab === 'health'  && <TabHealth />}
        </div>
      </div>
    </div>
  );
}
