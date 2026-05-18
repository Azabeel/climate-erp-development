import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

type EventType = 'order_created' | 'order_closed' | 'call' | 'email' | 'meeting' | 'payment' | 'complaint' | 'proposal';
type DocType = 'contract' | 'act' | 'invoice' | 'proposal';
type Channel = 'Телефон' | 'Email' | 'Telegram' | 'WhatsApp';

interface TimelineEvent {
  id: string;
  date: string;
  type: EventType;
  title: string;
  description: string;
  manager: string;
  amount?: number;
}

interface WorkOrder {
  id: string;
  number: string;
  date: string;
  type: string;
  object: string;
  status: string;
  statusColor: 'default' | 'secondary' | 'destructive' | 'outline';
  amount: number;
  nps: number | null;
}

interface Document {
  id: string;
  type: DocType;
  name: string;
  date: string;
  amount?: number;
  icon: string;
}

interface Communication {
  id: string;
  channel: Channel;
  date: string;
  direction: string;
  duration?: string;
  size?: string;
  summary: string;
  manager: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const TIMELINE_EVENTS: TimelineEvent[] = [
  { id: 'e1',  date: '15.05.2026', type: 'order_closed',  title: 'Наряд WO-2026-000312 закрыт',         description: 'Замена компрессора Daikin VRV, объект «Офис Центральный»', manager: 'Козлова М.В.', amount: 87500 },
  { id: 'e2',  date: '14.05.2026', type: 'call',          title: 'Входящий звонок',                      description: 'Уточнение статуса по текущему наряду, длительность 4 мин', manager: 'Козлова М.В.' },
  { id: 'e3',  date: '10.05.2026', type: 'order_created', title: 'Наряд WO-2026-000298 создан',          description: 'Плановое ТО 4 сплит-систем, объект «Склад №2»', manager: 'Смирнов П.А.', amount: 32000 },
  { id: 'e4',  date: '05.05.2026', type: 'payment',       title: 'Оплата счёта СЧ-2026-0287',            description: 'Поступление оплаты за ремонт чиллера', manager: 'Бухгалтерия', amount: 156000 },
  { id: 'e5',  date: '28.04.2026', type: 'proposal',      title: 'КП №КП-2026-045 отправлено',           description: 'Договор на обслуживание 12 объектов, сезон 2026–2027', manager: 'Козлова М.В.', amount: 480000 },
  { id: 'e6',  date: '22.04.2026', type: 'meeting',       title: 'Встреча в офисе клиента',              description: 'Обсуждение условий нового договора на обслуживание', manager: 'Козлова М.В.' },
  { id: 'e7',  date: '18.04.2026', type: 'order_closed',  title: 'Наряд WO-2026-000254 закрыт',         description: 'Заправка хладагента R-410A, 3 сплит-системы', manager: 'Смирнов П.А.', amount: 18500 },
  { id: 'e8',  date: '15.04.2026', type: 'complaint',     title: 'Жалоба зарегистрирована',              description: 'Задержка выезда инженера на 2 часа сверх SLA', manager: 'Козлова М.В.' },
  { id: 'e9',  date: '10.04.2026', type: 'email',         title: 'Исходящий email',                      description: 'Отправка акта выполненных работ за март', manager: 'Козлова М.В.' },
  { id: 'e10', date: '01.04.2026', type: 'order_created', title: 'Наряд WO-2026-000231 создан',          description: 'Аварийный выезд: не работает кондиционер в серверной', manager: 'Смирнов П.А.', amount: 24000 },
  { id: 'e11', date: '25.03.2026', type: 'payment',       title: 'Оплата счёта СЧ-2026-0198',            description: 'Поступление авансового платежа по договору ТО', manager: 'Бухгалтерия', amount: 240000 },
  { id: 'e12', date: '18.03.2026', type: 'order_closed',  title: 'Наряд WO-2026-000198 закрыт',         description: 'Монтаж 2 кассетных кондиционеров Mitsubishi', manager: 'Смирнов П.А.', amount: 95000 },
  { id: 'e13', date: '10.03.2026', type: 'call',          title: 'Исходящий звонок',                     description: 'Согласование даты монтажа, длительность 7 мин', manager: 'Козлова М.В.' },
  { id: 'e14', date: '03.03.2026', type: 'order_created', title: 'Наряд WO-2026-000176 создан',          description: 'Монтаж 2 кассетных кондиционеров, объект «Переговорная»', manager: 'Козлова М.В.', amount: 95000 },
  { id: 'e15', date: '25.02.2026', type: 'proposal',      title: 'КП №КП-2026-031 отправлено',           description: 'Монтаж кассетных блоков — 3 варианта (Good/Better/Best)', manager: 'Козлова М.В.', amount: 112000 },
  { id: 'e16', date: '20.02.2026', type: 'meeting',       title: 'Видеозвонок с техдиректором',          description: 'Обсуждение расширения системы кондиционирования', manager: 'Козлова М.В.' },
  { id: 'e17', date: '12.02.2026', type: 'order_closed',  title: 'Наряд WO-2026-000134 закрыт',         description: 'Диагностика и замена фильтров, 8 блоков', manager: 'Смирнов П.А.', amount: 22000 },
  { id: 'e18', date: '05.02.2026', type: 'email',         title: 'Входящий email',                       description: 'Запрос на диагностику оборудования в феврале', manager: 'Козлова М.В.' },
  { id: 'e19', date: '30.01.2026', type: 'payment',       title: 'Оплата счёта СЧ-2026-0089',            description: 'Оплата работ за январь', manager: 'Бухгалтерия', amount: 45000 },
  { id: 'e20', date: '15.01.2026', type: 'order_created', title: 'Наряд WO-2026-000098 создан',          description: 'Плановое ТО по договору, зимний осмотр всех объектов', manager: 'Смирнов П.А.', amount: 45000 },
];

const WORK_ORDERS: WorkOrder[] = [
  { id: 'wo1',  number: 'WO-2026-000312', date: '08.05.2026', type: 'Ремонт',        object: 'Офис Центральный',  status: 'Закрыт',       statusColor: 'secondary',    amount: 87500, nps: 10 },
  { id: 'wo2',  number: 'WO-2026-000298', date: '10.05.2026', type: 'ТО',            object: 'Склад №2',          status: 'В работе',     statusColor: 'default',      amount: 32000, nps: null },
  { id: 'wo3',  number: 'WO-2026-000254', date: '15.04.2026', type: 'Заправка',      object: 'Торговый зал',      status: 'Закрыт',       statusColor: 'secondary',    amount: 18500, nps: 9 },
  { id: 'wo4',  number: 'WO-2026-000231', date: '01.04.2026', type: 'Аварийный',     object: 'Серверная',         status: 'Закрыт',       statusColor: 'secondary',    amount: 24000, nps: 8 },
  { id: 'wo5',  number: 'WO-2026-000198', date: '05.03.2026', type: 'Монтаж',        object: 'Переговорная',      status: 'Закрыт',       statusColor: 'secondary',    amount: 95000, nps: 10 },
  { id: 'wo6',  number: 'WO-2026-000176', date: '03.03.2026', type: 'Монтаж',        object: 'Переговорная',      status: 'Закрыт',       statusColor: 'secondary',    amount: 95000, nps: 10 },
  { id: 'wo7',  number: 'WO-2026-000134', date: '12.02.2026', type: 'ТО',            object: 'Все объекты',       status: 'Закрыт',       statusColor: 'secondary',    amount: 22000, nps: 9 },
  { id: 'wo8',  number: 'WO-2026-000098', date: '15.01.2026', type: 'ТО',            object: 'Все объекты',       status: 'Закрыт',       statusColor: 'secondary',    amount: 45000, nps: 9 },
  { id: 'wo9',  number: 'WO-2025-001187', date: '18.11.2025', type: 'Ремонт',        object: 'Склад №1',          status: 'Закрыт',       statusColor: 'secondary',    amount: 67000, nps: 8 },
  { id: 'wo10', number: 'WO-2025-001054', date: '02.10.2025', type: 'ТО',            object: 'Все объекты',       status: 'Закрыт',       statusColor: 'secondary',    amount: 48000, nps: 10 },
];

const QUARTERLY_REVENUE = [
  { quarter: 'Q2 2024', revenue: 95000 },
  { quarter: 'Q3 2024', revenue: 142000 },
  { quarter: 'Q4 2024', revenue: 218000 },
  { quarter: 'Q1 2025', revenue: 87000 },
  { quarter: 'Q2 2025', revenue: 156000 },
  { quarter: 'Q3 2025', revenue: 203000 },
  { quarter: 'Q4 2025', revenue: 312000 },
  { quarter: 'Q1 2026', revenue: 269000 },
];

const DOCUMENTS: Document[] = [
  { id: 'd1', type: 'contract', name: 'Договор №2024-ООО-047 (ТО 2024–2025)', date: '01.04.2024', amount: 480000, icon: 'FileText' },
  { id: 'd2', type: 'contract', name: 'Договор №2026-ООО-012 (ТО 2026–2027)', date: '01.04.2026', amount: 520000, icon: 'FileText' },
  { id: 'd3', type: 'act',      name: 'Акт №АВР-2026-0312 за апрель 2026',    date: '30.04.2026', amount: 87500,  icon: 'ClipboardCheck' },
  { id: 'd4', type: 'act',      name: 'Акт №АВР-2026-0254 за март 2026',      date: '31.03.2026', amount: 113500, icon: 'ClipboardCheck' },
  { id: 'd5', type: 'invoice',  name: 'Счёт №СЧ-2026-0287 (чиллер)',          date: '01.05.2026', amount: 156000, icon: 'Receipt' },
  { id: 'd6', type: 'invoice',  name: 'Счёт №СЧ-2026-0198 (аванс ТО)',        date: '20.03.2026', amount: 240000, icon: 'Receipt' },
  { id: 'd7', type: 'proposal', name: 'КП №КП-2026-045 (договор ТО)',          date: '28.04.2026', amount: 480000, icon: 'FileSpreadsheet' },
  { id: 'd8', type: 'proposal', name: 'КП №КП-2026-031 (монтаж кассет)',       date: '25.02.2026', amount: 112000, icon: 'FileSpreadsheet' },
];

const COMMUNICATIONS: Communication[] = [
  { id: 'cm1',  channel: 'Телефон',  date: '14.05.2026', direction: 'Входящий',  duration: '4 мин',   summary: 'Уточнение статуса по наряду WO-2026-000298',        manager: 'Козлова М.В.' },
  { id: 'cm2',  channel: 'Email',    date: '09.05.2026', direction: 'Исходящий', size: '148 КБ',      summary: 'Отправка акта АВР-2026-0312 и счёта СЧ-2026-0287',  manager: 'Козлова М.В.' },
  { id: 'cm3',  channel: 'Telegram', date: '05.05.2026', direction: 'Исходящий',                      summary: 'Уведомление об оплате счёта и подтверждение записи',  manager: 'Автоматически' },
  { id: 'cm4',  channel: 'Телефон',  date: '10.03.2026', direction: 'Исходящий', duration: '7 мин',   summary: 'Согласование даты монтажа кассетных блоков',         manager: 'Козлова М.В.' },
  { id: 'cm5',  channel: 'Email',    date: '05.02.2026', direction: 'Входящий',  size: '32 КБ',       summary: 'Запрос на диагностику оборудования в феврале',       manager: 'Козлова М.В.' },
  { id: 'cm6',  channel: 'WhatsApp', date: '28.01.2026', direction: 'Исходящий',                      summary: 'Напоминание о плановом ТО и согласование даты',      manager: 'Автоматически' },
  { id: 'cm7',  channel: 'Телефон',  date: '20.01.2026', direction: 'Входящий',  duration: '12 мин',  summary: 'Аварийная заявка: не работает кондиционер в офисе',  manager: 'Смирнов П.А.' },
  { id: 'cm8',  channel: 'Email',    date: '05.01.2026', direction: 'Исходящий', size: '215 КБ',      summary: 'Новогоднее поздравление и план ТО на I квартал 2026', manager: 'Козлова М.В.' },
];

const MONTHLY_ANALYTICS = [
  { month: 'Май 25', orders: 4, revenue: 52000 },
  { month: 'Июн 25', orders: 5, revenue: 68000 },
  { month: 'Июл 25', orders: 3, revenue: 41000 },
  { month: 'Авг 25', orders: 6, revenue: 93000 },
  { month: 'Сен 25', orders: 5, revenue: 71000 },
  { month: 'Окт 25', orders: 7, revenue: 115000 },
  { month: 'Ноя 25', orders: 8, revenue: 134000 },
  { month: 'Дек 25', orders: 9, revenue: 180000 },
  { month: 'Янв 26', orders: 3, revenue: 45000 },
  { month: 'Фев 26', orders: 5, revenue: 68000 },
  { month: 'Мар 26', orders: 7, revenue: 113500 },
  { month: 'Апр 26', orders: 6, revenue: 87500 },
];

const NPS_HISTORY = [
  { period: 'Q3 2024', nps: 8.5 }, { period: 'Q4 2024', nps: 8.8 },
  { period: 'Q1 2025', nps: 8.6 }, { period: 'Q2 2025', nps: 9.0 },
  { period: 'Q3 2025', nps: 9.1 }, { period: 'Q4 2025', nps: 9.3 },
  { period: 'Q1 2026', nps: 9.2 },
];

const EVENT_LABELS: Record<EventType, { label: string; color: string; icon: string; dot: string }> = {
  order_created: { label: 'Наряд создан',    color: 'bg-blue-100 text-blue-700',    icon: 'PlusCircle',   dot: 'bg-blue-500' },
  order_closed:  { label: 'Наряд закрыт',    color: 'bg-green-100 text-green-700',  icon: 'CheckCircle',  dot: 'bg-green-500' },
  call:          { label: 'Звонок',          color: 'bg-purple-100 text-purple-700', icon: 'Phone',        dot: 'bg-purple-500' },
  email:         { label: 'Email',           color: 'bg-sky-100 text-sky-700',      icon: 'Mail',         dot: 'bg-sky-500' },
  meeting:       { label: 'Встреча',         color: 'bg-orange-100 text-orange-700', icon: 'Users',        dot: 'bg-orange-500' },
  payment:       { label: 'Платёж',          color: 'bg-emerald-100 text-emerald-700', icon: 'Banknote',   dot: 'bg-emerald-500' },
  complaint:     { label: 'Жалоба',          color: 'bg-red-100 text-red-700',      icon: 'AlertTriangle', dot: 'bg-red-500' },
  proposal:      { label: 'КП отправлено',   color: 'bg-yellow-100 text-yellow-700', icon: 'FileCheck',   dot: 'bg-yellow-500' },
};

const CHANNEL_COLORS: Record<Channel, string> = {
  Телефон:  'bg-purple-100 text-purple-700',
  Email:    'bg-sky-100 text-sky-700',
  Telegram: 'bg-blue-100 text-blue-700',
  WhatsApp: 'bg-green-100 text-green-700',
};

const DOC_TYPE_LABELS: Record<DocType, string> = {
  contract: 'Договор', act: 'Акт', invoice: 'Счёт', proposal: 'КП',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function KPICard({ title, value, icon, sub }: { title: string; value: string; icon: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold leading-tight">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div className="p-2 rounded-lg bg-muted">
            <Icon name={icon} size={18} className="text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Add Event Dialog ─────────────────────────────────────────────────────────

interface AddEventDialogProps {
  open: boolean;
  onClose: () => void;
}

function AddEventDialog({ open, onClose }: AddEventDialogProps) {
  const [form, setForm] = useState({ type: '', date: '', description: '', manager: '' });

  const handleSave = () => {
    if (!form.type || !form.date || !form.description) {
      toast.error('Заполните все обязательные поля');
      return;
    }
    toast.success('Событие добавлено в историю');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Добавить событие</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium mb-1 block">Тип события *</label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue placeholder="Выберите тип" /></SelectTrigger>
              <SelectContent>
                {Object.entries(EVENT_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Дата *</label>
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Описание *</label>
            <Input placeholder="Краткое описание события" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Менеджер</label>
            <Input placeholder="ФИО менеджера" value={form.manager}
              onChange={(e) => setForm({ ...form, manager: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSave}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Timeline Tab ─────────────────────────────────────────────────────────────

function TimelineTab() {
  const [filter, setFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = filter === 'all'
    ? TIMELINE_EVENTS
    : TIMELINE_EVENTS.filter((e) => e.type === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Все события" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все события</SelectItem>
            {Object.entries(EVENT_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Icon name="Plus" size={14} className="mr-1" /> Добавить событие
        </Button>
      </div>

      <div className="relative pl-6">
        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-border" />
        <div className="space-y-4">
          {filtered.map((ev) => {
            const meta = EVENT_LABELS[ev.type];
            return (
              <div key={ev.id} className="relative">
                <div className={`absolute -left-4 top-1.5 w-3 h-3 rounded-full border-2 border-white ${meta.dot}`} />
                <Card className="ml-2">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <div className={`mt-0.5 p-1 rounded ${meta.color} shrink-0`}>
                          <Icon name={meta.icon} size={13} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-tight">{ev.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{ev.description}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs text-muted-foreground">{ev.date}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{ev.manager}</span>
                          </div>
                        </div>
                      </div>
                      {ev.amount != null && (
                        <span className="text-sm font-semibold text-green-700 shrink-0">
                          {ev.amount.toLocaleString('ru-RU')} ₽
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      <AddEventDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}

// ─── Work Orders Tab ──────────────────────────────────────────────────────────

function WorkOrdersTab() {
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Выручка по кварталам</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={QUARTERLY_REVENUE}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}к`} />
              <Tooltip formatter={(v: number) => [`${v.toLocaleString('ru-RU')} ₽`, 'Выручка']} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 px-0 pb-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  {['Номер', 'Дата', 'Тип', 'Объект', 'Статус', 'Сумма ₽', 'NPS'].map((h) => (
                    <th key={h} className="text-left py-2 px-4 text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {WORK_ORDERS.map((wo) => (
                  <tr key={wo.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="py-2 px-4 font-mono text-xs text-blue-600">{wo.number}</td>
                    <td className="py-2 px-4 text-xs text-muted-foreground">{wo.date}</td>
                    <td className="py-2 px-4">{wo.type}</td>
                    <td className="py-2 px-4 text-xs text-muted-foreground">{wo.object}</td>
                    <td className="py-2 px-4">
                      <Badge variant={wo.statusColor} className="text-xs">{wo.status}</Badge>
                    </td>
                    <td className="py-2 px-4 font-medium">{wo.amount.toLocaleString('ru-RU')}</td>
                    <td className="py-2 px-4">
                      {wo.nps != null ? (
                        <span className={`font-semibold ${wo.nps >= 9 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {wo.nps}
                        </span>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Documents Tab ────────────────────────────────────────────────────────────

function DocumentsTab() {
  return (
    <Card>
      <CardContent className="pt-4 px-0 pb-0">
        <div className="divide-y">
          {DOCUMENTS.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20">
              <div className="p-2 rounded-lg bg-muted shrink-0">
                <Icon name={doc.icon} size={16} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-xs py-0">{DOC_TYPE_LABELS[doc.type]}</Badge>
                  <span className="text-xs text-muted-foreground">{doc.date}</span>
                  {doc.amount != null && (
                    <span className="text-xs text-muted-foreground">
                      {doc.amount.toLocaleString('ru-RU')} ₽
                    </span>
                  )}
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => toast.success(`Загрузка: ${doc.name}`)}>
                <Icon name="Download" size={15} />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Communications Tab ───────────────────────────────────────────────────────

function CommunicationsTab() {
  return (
    <Card>
      <CardContent className="pt-4 px-0 pb-0">
        <div className="divide-y">
          {COMMUNICATIONS.map((cm) => (
            <div key={cm.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/20">
              <div className="p-2 rounded-lg bg-muted shrink-0 mt-0.5">
                <Icon
                  name={cm.channel === 'Телефон' ? 'Phone' : cm.channel === 'Email' ? 'Mail' : 'MessageCircle'}
                  size={15} className="text-muted-foreground"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`text-xs py-0 ${CHANNEL_COLORS[cm.channel]}`}>{cm.channel}</Badge>
                  <span className="text-xs text-muted-foreground">{cm.direction}</span>
                  {cm.duration && <span className="text-xs text-muted-foreground">· {cm.duration}</span>}
                  {cm.size && <span className="text-xs text-muted-foreground">· {cm.size}</span>}
                </div>
                <p className="text-sm mt-1 leading-snug">{cm.summary}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{cm.date}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{cm.manager}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────

function AnalyticsTab() {
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Наряды и выручка по месяцам</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={MONTHLY_ANALYTICS} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}к`} />
              <Tooltip
                formatter={(v: number, name: string) =>
                  name === 'orders' ? [v, 'Нарядов'] : [`${v.toLocaleString('ru-RU')} ₽`, 'Выручка']}
              />
              <Legend formatter={(v) => (v === 'orders' ? 'Нарядов' : 'Выручка')} />
              <Bar yAxisId="left" dataKey="orders" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar yAxisId="right" dataKey="revenue" fill="#10b981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground mb-1">Средний чек</p>
            <p className="text-2xl font-bold">26 383 ₽</p>
            <p className="text-xs text-green-600 mt-0.5">↑ 8.4% к прошлому году</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground mb-1">Частота обращений</p>
            <p className="text-2xl font-bold">3.9 / мес</p>
            <p className="text-xs text-muted-foreground mt-0.5">за последние 12 мес</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground mb-1">Жалобы / нарядов</p>
            <p className="text-2xl font-bold">2.1%</p>
            <p className="text-xs text-green-600 mt-0.5">Ниже среднего (3.8%)</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">История NPS</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={NPS_HISTORY}>
              <defs>
                <linearGradient id="npsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="period" tick={{ fontSize: 10 }} />
              <YAxis domain={[7, 10]} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => [v, 'NPS']} />
              <Area type="monotone" dataKey="nps" stroke="#10b981" fill="url(#npsGrad)" strokeWidth={2} dot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Здоровье клиента</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-muted-foreground">Общий балл</span>
            <span className="text-2xl font-bold text-green-600">85 / 100</span>
          </div>
          <Progress value={85} className="h-3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {[
              { label: 'Вовлечённость',         value: 92 },
              { label: 'Соблюдение SLA',         value: 88 },
              { label: 'Платёжная дисциплина',   value: 95 },
              { label: 'Активность',             value: 80 },
              { label: 'Лояльность (NPS)',        value: 92 },
              { label: 'Жалобы (инверс.)',        value: 78 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value}%</span>
                </div>
                <Progress value={item.value} className="h-1.5" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ClientHistoryFull() {
  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">

      {/* Header */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14 shrink-0">
                <AvatarFallback className="text-lg font-bold bg-blue-100 text-blue-700">ОР</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold">ООО «Ромашка»</h1>
                  <Badge className="bg-blue-100 text-blue-700 text-xs">Юр. лицо</Badge>
                  <Badge className="bg-green-100 text-green-700 text-xs">Договор активен</Badge>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Icon name="Phone" size={13} /> +7 (495) 123-45-67
                  </span>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Icon name="Mail" size={13} /> info@romashka.ru
                  </span>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Icon name="User" size={13} /> Козлова М.В.
                  </span>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Icon name="Calendar" size={13} /> Клиент с 12.04.2022
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" variant="outline" onClick={() => toast.info('Инициирован звонок')}>
                <Icon name="Phone" size={14} className="mr-1" /> Позвонить
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.info('Открыт чат')}>
                <Icon name="MessageCircle" size={14} className="mr-1" /> Написать
              </Button>
              <Button size="sm" onClick={() => toast.success('Создание наряда...')}>
                <Icon name="PlusCircle" size={14} className="mr-1" /> Создать наряд
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Всего нарядов"     value="47"           icon="ClipboardList" sub="4 активных" />
        <KPICard title="Сумма заказов"     value="1 240 000 ₽"  icon="TrendingUp"   sub="за всё время" />
        <KPICard title="NPS"               value="9.2"          icon="Star"         sub="из 10 баллов" />
        <KPICard title="Последний контакт" value="3 дня назад"  icon="Clock"        sub="14.05.2026" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="timeline">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="orders">Наряды</TabsTrigger>
          <TabsTrigger value="documents">Документы</TabsTrigger>
          <TabsTrigger value="communications">Коммуникации</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline"       className="mt-4"><TimelineTab /></TabsContent>
        <TabsContent value="orders"         className="mt-4"><WorkOrdersTab /></TabsContent>
        <TabsContent value="documents"      className="mt-4"><DocumentsTab /></TabsContent>
        <TabsContent value="communications" className="mt-4"><CommunicationsTab /></TabsContent>
        <TabsContent value="analytics"      className="mt-4"><AnalyticsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
