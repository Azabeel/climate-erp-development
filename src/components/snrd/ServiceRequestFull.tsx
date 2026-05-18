import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────────────────────────────

type Channel = 'phone' | 'email' | 'telegram' | 'whatsapp' | 'avito' | 'website';
type Priority = 'low' | 'normal' | 'urgent' | 'emergency';
type RequestType = 'Ремонт' | 'ТО' | 'Гарантия' | 'Монтаж' | 'ППР' | 'Рекламация' | 'Консультация';
type KanbanStatus = 'assigned' | 'en_route' | 'on_site';

interface ServiceRequest {
  id: string;
  num: string;
  client: string;
  type: RequestType;
  channel: Channel;
  description: string;
  priority: Priority;
  createdAt: string;
}

interface ActiveOrder {
  id: string;
  num: string;
  client: string;
  type: RequestType;
  engineer: string;
  address: string;
  status: KanbanStatus;
  slaTotal: number;
  slaUsed: number;
  slaDeadline: string;
}

interface CompletedOrder {
  id: string;
  num: string;
  client: string;
  engineer: string;
  type: RequestType;
  duration: string;
  rating: number;
  amount: number;
  completedAt: string;
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const INCOMING: ServiceRequest[] = [
  { id: '1', num: 'WO-2024-000341', client: 'ООО «АвтоГрупп»', type: 'Ремонт', channel: 'phone', description: 'Кондиционер не охлаждает, слышен посторонний шум', priority: 'urgent', createdAt: '09:14' },
  { id: '2', num: 'WO-2024-000342', client: 'Иванова Марина', type: 'ТО', channel: 'telegram', description: 'Плановое техническое обслуживание 3 блоков', priority: 'normal', createdAt: '09:31' },
  { id: '3', num: 'WO-2024-000343', client: 'ТРЦ «Галерея»', type: 'Гарантия', channel: 'email', description: 'Утечка фреона, гарантийный случай', priority: 'emergency', createdAt: '10:02' },
  { id: '4', num: 'WO-2024-000344', client: 'ИП Коновалов', type: 'Монтаж', channel: 'avito', description: 'Монтаж сплит-системы Daikin 12000 BTU', priority: 'normal', createdAt: '10:18' },
  { id: '5', num: 'WO-2024-000345', client: 'Петров Сергей', type: 'Ремонт', channel: 'website', description: 'Не работает пульт, ошибка E1', priority: 'low', createdAt: '10:45' },
  { id: '6', num: 'WO-2024-000346', client: 'ООО «МедЦентр»', type: 'ППР', channel: 'email', description: 'Плановое ТО по договору №114-2024', priority: 'normal', createdAt: '11:00' },
  { id: '7', num: 'WO-2024-000347', client: 'Смирнова Ольга', type: 'Консультация', channel: 'whatsapp', description: 'Выбор и расчёт мощности для квартиры 65 м²', priority: 'low', createdAt: '11:22' },
];

const ACTIVE_ORDERS: ActiveOrder[] = [
  { id: '1', num: 'WO-2024-000335', client: 'Завод «Техмаш»', type: 'Ремонт', engineer: 'Карпов А.И.', address: 'ул. Индустриальная, 14', status: 'on_site', slaTotal: 480, slaUsed: 390, slaDeadline: '15:30' },
  { id: '2', num: 'WO-2024-000337', client: 'Кузнецов Дмитрий', type: 'ТО', engineer: 'Новиков С.П.', address: 'пр. Ленина, 88, кв. 12', status: 'en_route', slaTotal: 240, slaUsed: 80, slaDeadline: '14:00' },
  { id: '3', num: 'WO-2024-000338', client: 'ООО «Ресторан Юг»', type: 'Монтаж', engineer: 'Фомин В.Е.', address: 'ул. Садовая, 5', status: 'assigned', slaTotal: 600, slaUsed: 60, slaDeadline: '17:00' },
  { id: '4', num: 'WO-2024-000339', client: 'БЦ «Горизонт»', type: 'ППР', engineer: 'Степанов Р.А.', address: 'пл. Советская, 1', status: 'en_route', slaTotal: 360, slaUsed: 200, slaDeadline: '16:00' },
  { id: '5', num: 'WO-2024-000340', client: 'Морозова Татьяна', type: 'Гарантия', engineer: 'Карпов А.И.', address: 'ул. Мира, 33, кв. 4', status: 'assigned', slaTotal: 480, slaUsed: 30, slaDeadline: '18:00' },
];

const COMPLETED: CompletedOrder[] = [
  { id: '1', num: 'WO-2024-000328', client: 'Алексеев Петр', engineer: 'Карпов А.И.', type: 'Ремонт', duration: '1ч 45мин', rating: 5, amount: 4800, completedAt: '08:50' },
  { id: '2', num: 'WO-2024-000329', client: 'ООО «Лесмаш»', engineer: 'Новиков С.П.', type: 'ТО', duration: '2ч 10мин', rating: 4, amount: 3200, completedAt: '09:15' },
  { id: '3', num: 'WO-2024-000330', client: 'Медведева Ирина', engineer: 'Фомин В.Е.', type: 'Монтаж', duration: '3ч 00мин', rating: 5, amount: 8500, completedAt: '10:30' },
  { id: '4', num: 'WO-2024-000331', client: 'ИП Зайцев', engineer: 'Степанов Р.А.', type: 'Ремонт', duration: '0ч 55мин', rating: 4, amount: 2400, completedAt: '11:05' },
  { id: '5', num: 'WO-2024-000332', client: 'Школа №14', engineer: 'Карпов А.И.', type: 'ППР', duration: '4ч 20мин', rating: 5, amount: 12000, completedAt: '12:40' },
  { id: '6', num: 'WO-2024-000333', client: 'Волков Андрей', engineer: 'Новиков С.П.', type: 'Гарантия', duration: '1ч 15мин', rating: 3, amount: 0, completedAt: '13:10' },
  { id: '7', num: 'WO-2024-000334', client: 'ООО «СтройДом»', engineer: 'Фомин В.Е.', type: 'Монтаж', duration: '5ч 00мин', rating: 5, amount: 18000, completedAt: '14:00' },
];

const HOURLY_DATA = [
  { hour: '08:00', count: 3 }, { hour: '09:00', count: 7 }, { hour: '10:00', count: 12 },
  { hour: '11:00', count: 18 }, { hour: '12:00', count: 15 }, { hour: '13:00', count: 9 },
  { hour: '14:00', count: 22 }, { hour: '15:00', count: 19 }, { hour: '16:00', count: 14 },
  { hour: '17:00', count: 11 }, { hour: '18:00', count: 6 }, { hour: '19:00', count: 2 },
];

const CHANNEL_DATA = [
  { name: 'Телефон', value: 35, color: '#6366f1' },
  { name: 'Email', value: 20, color: '#8b5cf6' },
  { name: 'Telegram', value: 15, color: '#0ea5e9' },
  { name: 'Avito', value: 12, color: '#f59e0b' },
  { name: 'Сайт', value: 10, color: '#10b981' },
  { name: 'WhatsApp', value: 8, color: '#22c55e' },
];

const WORK_TYPE_DATA = [
  { type: 'Ремонт', count: 98 }, { type: 'ТО', count: 74 }, { type: 'Монтаж', count: 61 },
  { type: 'ППР', count: 42 }, { type: 'Гарантия', count: 33 }, { type: 'Рекламация', count: 21 },
  { type: 'Консультация', count: 13 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PRIORITY_LABELS: Record<Priority, string> = { low: 'Низкий', normal: 'Обычный', urgent: 'Срочный', emergency: 'Аварийный' };
const PRIORITY_COLORS: Record<Priority, string> = { low: 'secondary', normal: 'outline', urgent: 'default', emergency: 'destructive' };

const CHANNEL_ICON: Record<Channel, string> = {
  phone: 'Phone', email: 'Mail', telegram: 'Send', whatsapp: 'MessageCircle', avito: 'ShoppingBag', website: 'Globe',
};
const CHANNEL_COLOR: Record<Channel, string> = {
  phone: 'text-blue-500', email: 'text-slate-500', telegram: 'text-sky-500',
  whatsapp: 'text-green-500', avito: 'text-yellow-500', website: 'text-purple-500',
};
const CHANNEL_LABEL: Record<Channel, string> = {
  phone: 'Телефон', email: 'Email', telegram: 'Telegram', whatsapp: 'WhatsApp', avito: 'Avito', website: 'Сайт',
};

const KANBAN_LABEL: Record<KanbanStatus, string> = { assigned: 'Назначена', en_route: 'Выехал', on_site: 'На месте' };
const KANBAN_COLOR: Record<KanbanStatus, string> = { assigned: 'bg-slate-100', en_route: 'bg-blue-50', on_site: 'bg-green-50' };

function slaPercent(used: number, total: number) { return Math.min(100, Math.round((used / total) * 100)); }
function slaColor(pct: number) {
  if (pct >= 90) return 'bg-red-500';
  if (pct >= 70) return 'bg-yellow-400';
  return 'bg-green-500';
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Icon key={s} name="Star" size={13} className={s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </span>
  );
}

// ─── KPI Cards ────────────────────────────────────────────────────────────────

function KpiCards() {
  const kpis = [
    { label: 'Всего заявок', value: '342', icon: 'FileText', color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Открытых', value: '47', icon: 'Clock', color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Среднее время обработки', value: '2.4 ч', icon: 'Timer', color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Выполнено сегодня', value: '12', icon: 'CheckCircle', color: 'text-green-500', bg: 'bg-green-50' },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {kpis.map(k => (
        <Card key={k.label} className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`${k.bg} rounded-xl p-2.5`}>
              <Icon name={k.icon} size={20} className={k.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{k.value}</p>
              <p className="text-xs text-gray-500 leading-tight">{k.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── New Request Dialog ───────────────────────────────────────────────────────

function NewRequestDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [client, setClient] = useState('');
  const [workType, setWorkType] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState('');

  function handleSubmit() {
    if (!client || !workType || !priority || !channel) {
      toast.error('Заполните обязательные поля');
      return;
    }
    toast.success(`Заявка создана для клиента «${client}»`);
    onClose();
    setClient(''); setWorkType(''); setDescription(''); setPriority(''); setPhone(''); setChannel('');
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Новая заявка</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Клиент *</label>
            <Input placeholder="ФИО или название организации" value={client} onChange={e => setClient(e.target.value)} />
            {client.length > 1 && (
              <p className="text-xs text-gray-400 mt-1 pl-1">Подсказка: ООО «АвтоГрупп», Иванова Марина, ИП Коновалов…</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Тип работ *</label>
            <Select value={workType} onValueChange={setWorkType}>
              <SelectTrigger><SelectValue placeholder="Выберите тип" /></SelectTrigger>
              <SelectContent>
                {['Ремонт', 'ТО', 'Гарантия', 'Монтаж', 'ППР', 'Рекламация', 'Консультация'].map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Описание</label>
            <Input placeholder="Кратко опишите проблему или задачу" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Приоритет *</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue placeholder="Приоритет" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Низкий</SelectItem>
                  <SelectItem value="normal">Обычный</SelectItem>
                  <SelectItem value="urgent">Срочный</SelectItem>
                  <SelectItem value="emergency">Аварийный</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Канал *</label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger><SelectValue placeholder="Канал" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Телефон</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="avito">Avito</SelectItem>
                  <SelectItem value="website">Сайт</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Контактный телефон</label>
            <Input placeholder="+7 (___) ___-__-__" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSubmit}>Создать заявку</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Incoming Tab ─────────────────────────────────────────────────────────────

function IncomingTab() {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'priority' | 'createdAt'>('priority');

  const PRIORITY_ORDER: Record<Priority, number> = { emergency: 0, urgent: 1, normal: 2, low: 3 };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return INCOMING
      .filter(r => r.client.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
      .sort((a, b) => sortField === 'priority'
        ? PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
        : a.createdAt.localeCompare(b.createdAt));
  }, [search, sortField]);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input className="pl-9" placeholder="Поиск по клиенту или описанию…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={sortField} onValueChange={v => setSortField(v as typeof sortField)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">По приоритету</SelectItem>
            <SelectItem value="createdAt">По времени</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['№', 'Клиент', 'Тип', 'Канал', 'Описание', 'Приоритет', 'Поступила', 'Действия'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.id} className={`border-b last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                <td className="px-3 py-2.5 font-mono text-xs text-gray-500 whitespace-nowrap">{r.num.slice(-6)}</td>
                <td className="px-3 py-2.5 font-medium whitespace-nowrap">{r.client}</td>
                <td className="px-3 py-2.5">
                  <Badge variant="outline" className="text-xs whitespace-nowrap">{r.type}</Badge>
                </td>
                <td className="px-3 py-2.5">
                  <span title={CHANNEL_LABEL[r.channel]}>
                    <Icon name={CHANNEL_ICON[r.channel]} size={16} className={CHANNEL_COLOR[r.channel]} />
                  </span>
                </td>
                <td className="px-3 py-2.5 text-gray-600 max-w-[220px]">
                  <span className="block truncate">{r.description}</span>
                </td>
                <td className="px-3 py-2.5">
                  <Badge variant={PRIORITY_COLORS[r.priority] as any} className="text-xs whitespace-nowrap">
                    {PRIORITY_LABELS[r.priority]}
                  </Badge>
                </td>
                <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{r.createdAt}</td>
                <td className="px-3 py-2.5">
                  <div className="flex gap-1">
                    <Button size="sm" variant="default" className="text-xs h-7 px-2 whitespace-nowrap"
                      onClick={() => toast.success(`Заявка ${r.num.slice(-6)} принята в работу`)}>
                      Принять
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-7 px-2 whitespace-nowrap"
                      onClick={() => toast.info(`Открыто назначение инженера для заявки ${r.num.slice(-6)}`)}>
                      Назначить
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── In-Work Tab (Kanban) ─────────────────────────────────────────────────────

function InWorkTab() {
  const columns: KanbanStatus[] = ['assigned', 'en_route', 'on_site'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map(col => {
        const orders = ACTIVE_ORDERS.filter(o => o.status === col);
        return (
          <div key={col}>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-semibold text-sm text-gray-700">{KANBAN_LABEL[col]}</span>
              <Badge variant="secondary" className="text-xs">{orders.length}</Badge>
            </div>
            <div className="space-y-3">
              {orders.map(o => {
                const pct = slaPercent(o.slaUsed, o.slaTotal);
                return (
                  <div key={o.id} className={`rounded-xl border p-3 ${KANBAN_COLOR[col]} space-y-2`}>
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs text-gray-400">{o.num.slice(-6)}</span>
                      <Badge variant="outline" className="text-xs">{o.type}</Badge>
                    </div>
                    <p className="font-semibold text-sm leading-tight">{o.client}</p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Icon name="User" size={12} />
                      <span>{o.engineer}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Icon name="MapPin" size={12} />
                      <span className="truncate">{o.address}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">SLA до {o.slaDeadline}</span>
                        <span className={pct >= 90 ? 'text-red-500 font-semibold' : pct >= 70 ? 'text-yellow-600' : 'text-green-600'}>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${slaColor(pct)}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="w-full h-7 text-xs"
                      onClick={() => toast.info(`Обновление статуса для ${o.num.slice(-6)}`)}>
                      Обновить статус
                    </Button>
                  </div>
                );
              })}
              {orders.length === 0 && (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-gray-400">Нет заявок</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Completed Tab ────────────────────────────────────────────────────────────

function CompletedTab() {
  const [period, setPeriod] = useState<'today' | 'week'>('today');
  const data = period === 'today' ? COMPLETED : COMPLETED;

  const totalRevenue = data.reduce((s, r) => s + r.amount, 0);
  const avgRating = (data.reduce((s, r) => s + r.rating, 0) / data.length).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Select value={period} onValueChange={v => setPeriod(v as typeof period)}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Сегодня</SelectItem>
            <SelectItem value="week">Неделя</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-4 text-sm">
          <span className="text-gray-500">Средняя оценка: <strong className="text-gray-800">{avgRating} / 5</strong></span>
          <span className="text-gray-500">Выручка: <strong className="text-green-600">{totalRevenue.toLocaleString('ru-RU')} ₽</strong></span>
        </div>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['№', 'Клиент', 'Инженер', 'Тип', 'Длительность', 'Оценка', 'Сумма ₽', 'Время'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={r.id} className={`border-b last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                <td className="px-3 py-2.5 font-mono text-xs text-gray-500">{r.num.slice(-6)}</td>
                <td className="px-3 py-2.5 font-medium whitespace-nowrap">{r.client}</td>
                <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{r.engineer}</td>
                <td className="px-3 py-2.5"><Badge variant="outline" className="text-xs">{r.type}</Badge></td>
                <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{r.duration}</td>
                <td className="px-3 py-2.5"><StarRating rating={r.rating} /></td>
                <td className="px-3 py-2.5 font-medium text-right whitespace-nowrap">
                  {r.amount > 0 ? `${r.amount.toLocaleString('ru-RU')} ₽` : <span className="text-gray-400">—</span>}
                </td>
                <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{r.completedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────

function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'FCR', value: '78%', sub: 'First Call Resolution', icon: 'PhoneCall', color: 'text-indigo-500', bg: 'bg-indigo-50' },
          { label: 'CSI', value: '4.6 / 5', sub: 'Индекс удовлетворённости', icon: 'Star', color: 'text-yellow-500', bg: 'bg-yellow-50' },
          { label: 'SLA выполн.', value: '94%', sub: 'За последние 30 дней', icon: 'ShieldCheck', color: 'text-green-500', bg: 'bg-green-50' },
          { label: 'Повторных', value: '8%', sub: 'Повторные обращения', icon: 'RefreshCw', color: 'text-rose-500', bg: 'bg-rose-50' },
        ].map(m => (
          <Card key={m.label} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`${m.bg} rounded-xl p-2`}>
                <Icon name={m.icon} size={18} className={m.color} />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{m.value}</p>
                <p className="text-xs text-gray-500">{m.label} — {m.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Заявки по часам (тепловая картина дня)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={HOURLY_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#6366f1" fill="#e0e7ff" name="Заявок" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Каналы обращений</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={CHANNEL_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={2}>
                  {CHANNEL_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {CHANNEL_DATA.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: d.color }} />
                    <span className="text-gray-600">{d.name}</span>
                  </div>
                  <span className="font-medium text-gray-800">{d.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Топ-7 типов работ</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={WORK_TYPE_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="type" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" name="Заявок" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ServiceRequestFull() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('today');
  const [statusFilter, setStatusFilter] = useState('all');

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Заявки</h1>
          <p className="text-sm text-gray-500 mt-0.5">Управление входящими заявками от клиентов</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Сегодня</SelectItem>
              <SelectItem value="week">Неделя</SelectItem>
              <SelectItem value="month">Месяц</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="new">Новые</SelectItem>
              <SelectItem value="active">В работе</SelectItem>
              <SelectItem value="done">Выполнено</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Icon name="Plus" size={16} />
            Новая заявка
          </Button>
        </div>
      </div>

      <KpiCards />

      <Tabs defaultValue="incoming">
        <TabsList className="mb-4">
          <TabsTrigger value="incoming" className="gap-1.5">
            <Icon name="Inbox" size={14} />
            Входящие
            <Badge variant="secondary" className="ml-1 text-xs px-1.5">{INCOMING.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="inwork" className="gap-1.5">
            <Icon name="Wrench" size={14} />
            В работе
            <Badge variant="secondary" className="ml-1 text-xs px-1.5">{ACTIVE_ORDERS.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1.5">
            <Icon name="CheckCircle" size={14} />
            Выполнено
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5">
            <Icon name="BarChart2" size={14} />
            Аналитика
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incoming"><IncomingTab /></TabsContent>
        <TabsContent value="inwork"><InWorkTab /></TabsContent>
        <TabsContent value="completed"><CompletedTab /></TabsContent>
        <TabsContent value="analytics"><AnalyticsTab /></TabsContent>
      </Tabs>

      <NewRequestDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
