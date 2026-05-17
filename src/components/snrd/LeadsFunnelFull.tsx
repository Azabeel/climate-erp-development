import { useState, useMemo } from 'react';
import {
  ComposedChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

// Types
type Stage =
  | 'NEW'
  | 'QUALIFICATION'
  | 'MEETING'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST';

type Source = 'Сайт' | 'Авито' | 'Телефон' | 'Telegram' | 'Рекомендация' | 'Email';

interface HistoryItem {
  date: string;
  action: string;
  author: string;
}

interface Lead {
  id: string;
  client: string;
  contact: string;
  amount: number;
  stage: Stage;
  manager: string;
  source: Source;
  date: string;
  comment: string;
  history: HistoryItem[];
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const STAGES: { key: Stage; label: string; color: string }[] = [
  { key: 'NEW',          label: 'Новый',       color: 'bg-slate-100 text-slate-700' },
  { key: 'QUALIFICATION', label: 'Квалификация', color: 'bg-blue-100 text-blue-700' },
  { key: 'MEETING',      label: 'Встреча',      color: 'bg-violet-100 text-violet-700' },
  { key: 'PROPOSAL',     label: 'КП',           color: 'bg-amber-100 text-amber-700' },
  { key: 'NEGOTIATION',  label: 'Переговоры',   color: 'bg-orange-100 text-orange-700' },
  { key: 'WON',          label: 'Победа',       color: 'bg-emerald-100 text-emerald-700' },
  { key: 'LOST',         label: 'Поражение',    color: 'bg-red-100 text-red-700' },
];

const MANAGERS = ['Соколова А.', 'Ковалёв Д.', 'Петрова М.', 'Захаров И.'];
const SOURCES: Source[] = ['Сайт', 'Авито', 'Телефон', 'Telegram', 'Рекомендация', 'Email'];

const INITIAL_LEADS: Lead[] = [
  {
    id: 'L001', client: 'ТЦ «Галерея»', contact: '+7 921 100-22-33',
    amount: 185000, stage: 'NEW', manager: 'Соколова А.', source: 'Сайт',
    date: '2026-05-10', comment: 'Нужно ТО 12 сплит-систем',
    history: [
      { date: '2026-05-10', action: 'Лид создан (форма на сайте)', author: 'Система' },
    ],
  },
  {
    id: 'L002', client: 'ООО «АрктикФрост»', contact: '+7 812 300-11-55',
    amount: 320000, stage: 'NEW', manager: 'Ковалёв Д.', source: 'Авито',
    date: '2026-05-12', comment: 'Монтаж VRF системы в офисе 400 м²',
    history: [
      { date: '2026-05-12', action: 'Лид создан (Авито)', author: 'Система' },
    ],
  },
  {
    id: 'L003', client: 'ИП Малинин Р.', contact: '+7 999 555-77-88',
    amount: 42000, stage: 'QUALIFICATION', manager: 'Петрова М.', source: 'Телефон',
    date: '2026-05-08', comment: 'Замена компрессора Daikin',
    history: [
      { date: '2026-05-08', action: 'Лид создан (входящий звонок)', author: 'Система' },
      { date: '2026-05-09', action: 'Квалификация выполнена — бюджет подтверждён', author: 'Петрова М.' },
    ],
  },
  {
    id: 'L004', client: 'Клиника «Медэлит»', contact: '+7 495 700-55-22',
    amount: 510000, stage: 'QUALIFICATION', manager: 'Соколова А.', source: 'Рекомендация',
    date: '2026-05-05', comment: 'Проект чистых помещений, прецизионный кондиционер',
    history: [
      { date: '2026-05-05', action: 'Лид создан (рекомендация партнёра)', author: 'Система' },
      { date: '2026-05-06', action: 'Первый контакт установлен', author: 'Соколова А.' },
    ],
  },
  {
    id: 'L005', client: 'Ресторан «Бриз»', contact: '+7 812 900-44-11',
    amount: 95000, stage: 'MEETING', manager: 'Захаров И.', source: 'Telegram',
    date: '2026-05-03', comment: 'Замена 4 кассетных блоков',
    history: [
      { date: '2026-05-03', action: 'Лид создан (Telegram)', author: 'Система' },
      { date: '2026-05-04', action: 'Квалификация — объект осмотрен', author: 'Захаров И.' },
      { date: '2026-05-07', action: 'Встреча назначена на 13 мая', author: 'Захаров И.' },
    ],
  },
  {
    id: 'L006', client: 'Отель «Северная звезда»', contact: '+7 921 222-33-44',
    amount: 780000, stage: 'MEETING', manager: 'Ковалёв Д.', source: 'Email',
    date: '2026-04-28', comment: 'Обслуживание 35 номеров + ресторан',
    history: [
      { date: '2026-04-28', action: 'Лид создан (Email)', author: 'Система' },
      { date: '2026-05-01', action: 'Встреча с управляющим состоялась', author: 'Ковалёв Д.' },
    ],
  },
  {
    id: 'L007', client: 'Завод «ПластПром»', contact: '+7 812 600-00-01',
    amount: 240000, stage: 'PROPOSAL', manager: 'Петрова М.', source: 'Сайт',
    date: '2026-04-20', comment: 'Промышленная вентиляция цеха',
    history: [
      { date: '2026-04-20', action: 'Лид создан', author: 'Система' },
      { date: '2026-04-22', action: 'Выезд на объект', author: 'Петрова М.' },
      { date: '2026-04-30', action: 'КП отправлено (вариант Better + Best)', author: 'Петрова М.' },
    ],
  },
  {
    id: 'L008', client: 'БЦ «Лидер»', contact: '+7 495 800-12-34',
    amount: 1200000, stage: 'PROPOSAL', manager: 'Соколова А.', source: 'Рекомендация',
    date: '2026-04-15', comment: 'Полная замена системы кондиционирования 6 этажей',
    history: [
      { date: '2026-04-15', action: 'Лид создан', author: 'Система' },
      { date: '2026-04-18', action: 'Проектное совещание', author: 'Соколова А.' },
      { date: '2026-05-02', action: 'КП отправлено, ожидаем ответ до 20 мая', author: 'Соколова А.' },
    ],
  },
  {
    id: 'L009', client: 'ИП Соловьёв В.', contact: '+7 999 111-22-33',
    amount: 68000, stage: 'NEGOTIATION', manager: 'Захаров И.', source: 'Авито',
    date: '2026-04-10', comment: 'Монтаж 3 сплит-систем в частном доме',
    history: [
      { date: '2026-04-10', action: 'Лид создан', author: 'Система' },
      { date: '2026-04-12', action: 'Встреча на объекте', author: 'Захаров И.' },
      { date: '2026-04-18', action: 'КП отправлено', author: 'Захаров И.' },
      { date: '2026-05-01', action: 'Переговоры — запрос скидки 10%', author: 'Захаров И.' },
    ],
  },
  {
    id: 'L010', client: 'Сеть АЗС «ТопЭнерго»', contact: '+7 812 500-00-77',
    amount: 450000, stage: 'NEGOTIATION', manager: 'Ковалёв Д.', source: 'Email',
    date: '2026-04-01', comment: 'Обслуживание 8 объектов по договору',
    history: [
      { date: '2026-04-01', action: 'Лид создан', author: 'Система' },
      { date: '2026-04-05', action: 'Встреча с директором', author: 'Ковалёв Д.' },
      { date: '2026-04-14', action: 'КП отправлено (пакетное предложение)', author: 'Ковалёв Д.' },
      { date: '2026-05-03', action: 'Переговоры — финальные условия', author: 'Ковалёв Д.' },
    ],
  },
  {
    id: 'L011', client: 'Школа №47', contact: '+7 812 300-00-12',
    amount: 320000, stage: 'WON', manager: 'Петрова М.', source: 'Сайт',
    date: '2026-03-15', comment: 'Установка 8 кассетников + монтаж',
    history: [
      { date: '2026-03-15', action: 'Лид создан', author: 'Система' },
      { date: '2026-03-20', action: 'КП отправлено', author: 'Петрова М.' },
      { date: '2026-04-01', action: 'Договор подписан', author: 'Петрова М.' },
    ],
  },
  {
    id: 'L012', client: 'Кафе «Горизонт»', contact: '+7 921 400-55-66',
    amount: 75000, stage: 'LOST', manager: 'Захаров И.', source: 'Телефон',
    date: '2026-03-20', comment: 'Проиграли по цене конкуренту',
    history: [
      { date: '2026-03-20', action: 'Лид создан', author: 'Система' },
      { date: '2026-03-25', action: 'КП отправлено', author: 'Захаров И.' },
      { date: '2026-04-05', action: 'Проигрыш — клиент выбрал другого подрядчика', author: 'Захаров И.' },
    ],
  },
];

const FUNNEL_DATA = [
  { stage: 'Новых',      count: 24, fill: '#64748b' },
  { stage: 'Квалиф.',    count: 18, fill: '#3b82f6' },
  { stage: 'Встреча',    count: 13, fill: '#8b5cf6' },
  { stage: 'КП',         count: 9,  fill: '#f59e0b' },
  { stage: 'Перегов.',   count: 6,  fill: '#f97316' },
  { stage: 'Победа',     count: 4,  fill: '#10b981' },
];

const WEEKLY_DATA = [
  { week: 'Нед 1', новые: 8, квалиф: 5, победа: 1 },
  { week: 'Нед 2', новые: 6, квалиф: 4, победа: 2 },
  { week: 'Нед 3', новые: 7, квалиф: 6, победа: 0 },
  { week: 'Нед 4', новые: 9, квалиф: 5, победа: 2 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)} млн ₽`
    : `${(n / 1000).toFixed(0)} тыс ₽`;

const stageLabel = (s: Stage) => STAGES.find(x => x.key === s)?.label ?? s;
const stageBadge = (s: Stage) => STAGES.find(x => x.key === s)?.color ?? '';

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, sub, color }: {
  icon: string; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon name={icon} className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold leading-tight">{value}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function LeadCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  return (
    <div
      className="bg-white border rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow space-y-2"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-sm leading-tight">{lead.client}</p>
        <Badge className={`text-xs shrink-0 ${stageBadge(lead.stage)}`}>
          {stageLabel(lead.stage)}
        </Badge>
      </div>
      <p className="text-base font-bold text-emerald-600">{fmt(lead.amount)}</p>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Icon name="User" className="w-3 h-3" />{lead.manager}
        </span>
        <span>{new Date(lead.date).toLocaleDateString('ru')}</span>
      </div>
      <p className="text-xs text-muted-foreground truncate">{lead.source}</p>
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DetailPanel({ lead, onClose, onStageChange }: {
  lead: Lead;
  onClose: () => void;
  onStageChange: (id: string, stage: Stage) => void;
}) {
  const nextStages = STAGES.filter(s => s.key !== lead.stage && s.key !== 'LOST');

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold text-lg truncate">{lead.client}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <Icon name="X" className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Сумма</p>
            <p className="font-bold text-emerald-600 text-base">{fmt(lead.amount)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Этап</p>
            <Badge className={stageBadge(lead.stage)}>{stageLabel(lead.stage)}</Badge>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Менеджер</p>
            <p className="font-medium">{lead.manager}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Источник</p>
            <p className="font-medium">{lead.source}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Контакт</p>
            <p className="font-medium">{lead.contact}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Дата</p>
            <p className="font-medium">{new Date(lead.date).toLocaleDateString('ru')}</p>
          </div>
        </div>

        {lead.comment && (
          <div className="bg-slate-50 rounded-lg p-3 text-sm">
            <p className="text-muted-foreground text-xs mb-1">Комментарий</p>
            <p>{lead.comment}</p>
          </div>
        )}

        <div>
          <p className="text-sm font-medium mb-2">История действий</p>
          <div className="space-y-2">
            {lead.history.map((h, i) => (
              <div key={i} className="flex gap-2 text-xs">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-1 shrink-0" />
                  {i < lead.history.length - 1 && (
                    <div className="w-px flex-1 bg-slate-200 my-1" />
                  )}
                </div>
                <div className="pb-2">
                  <p className="text-muted-foreground">{h.date} · {h.author}</p>
                  <p>{h.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Переместить на этап</p>
        <div className="flex flex-wrap gap-2">
          {nextStages.map(s => (
            <Button
              key={s.key}
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => {
                onStageChange(lead.id, s.key);
                toast.success(`Лид перемещён: ${stageLabel(s.key)}`);
              }}
            >
              {s.label}
            </Button>
          ))}
          <Button
            size="sm"
            variant="destructive"
            className="text-xs"
            onClick={() => {
              onStageChange(lead.id, 'LOST');
              toast.error('Лид отмечен как «Поражение»');
            }}
          >
            Поражение
          </Button>
        </div>
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            className="flex-1 text-xs"
            onClick={() => toast.success('КП создаётся...')}
          >
            <Icon name="FileText" className="w-3 h-3 mr-1" />Создать КП
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={() => toast.info('Откройте календарь для встречи')}
          >
            <Icon name="CalendarPlus" className="w-3 h-3 mr-1" />Встреча
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── New Lead Dialog ───────────────────────────────────────────────────────────

const EMPTY_FORM = {
  client: '', contact: '', amount: '', source: '' as Source | '',
  manager: '', comment: '',
};

function NewLeadDialog({ open, onClose, onAdd }: {
  open: boolean;
  onClose: () => void;
  onAdd: (lead: Lead) => void;
}) {
  const [form, setForm] = useState(EMPTY_FORM);

  const set = (k: keyof typeof EMPTY_FORM, v: string) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = () => {
    if (!form.client || !form.amount || !form.manager || !form.source) {
      toast.error('Заполните обязательные поля');
      return;
    }
    const lead: Lead = {
      id: `L${Date.now()}`,
      client: form.client,
      contact: form.contact,
      amount: Number(form.amount),
      stage: 'NEW',
      manager: form.manager,
      source: form.source as Source,
      date: new Date().toISOString().split('T')[0],
      comment: form.comment,
      history: [{ date: new Date().toISOString().split('T')[0], action: 'Лид создан вручную', author: form.manager }],
    };
    onAdd(lead);
    toast.success('Лид создан');
    setForm(EMPTY_FORM);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Новый лид</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Клиент *</label>
            <Input placeholder="Название компании / ФИО" value={form.client}
              onChange={e => set('client', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Контакт</label>
            <Input placeholder="+7 ..." value={form.contact}
              onChange={e => set('contact', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Сумма, ₽ *</label>
            <Input type="number" placeholder="0" value={form.amount}
              onChange={e => set('amount', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Источник *</label>
            <Select value={form.source} onValueChange={v => set('source', v)}>
              <SelectTrigger><SelectValue placeholder="Выберите источник" /></SelectTrigger>
              <SelectContent>
                {SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Менеджер *</label>
            <Select value={form.manager} onValueChange={v => set('manager', v)}>
              <SelectTrigger><SelectValue placeholder="Выберите менеджера" /></SelectTrigger>
              <SelectContent>
                {MANAGERS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Комментарий</label>
            <Input placeholder="Описание потребности..." value={form.comment}
              onChange={e => set('comment', e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSave}>Создать лид</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function LeadsFunnelFull() {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [filterManager, setFilterManager] = useState('ALL');
  const [filterSource, setFilterSource] = useState('ALL');

  const filtered = useMemo(() => leads.filter(l => {
    if (filterManager !== 'ALL' && l.manager !== filterManager) return false;
    if (filterSource !== 'ALL' && l.source !== filterSource) return false;
    return true;
  }), [leads, filterManager, filterSource]);

  const handleStageChange = (id: string, stage: Stage) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, stage } : l));
    setSelectedLead(prev => prev && prev.id === id ? { ...prev, stage } : prev);
  };

  const handleAdd = (lead: Lead) => setLeads(prev => [lead, ...prev]);

  // KPI
  const total = leads.length;
  const qualified = leads.filter(l => !['NEW'].includes(l.stage)).length;
  const active = leads.filter(l => !['WON', 'LOST'].includes(l.stage)).length;
  const won = leads.filter(l => l.stage === 'WON').length;
  const lost = leads.filter(l => l.stage === 'LOST').length;
  const wonPct = total ? Math.round((won / total) * 100) : 0;
  const qualPct = total ? Math.round((qualified / total) * 100) : 0;

  const kanbanStages = STAGES.filter(s => s.key !== 'WON' && s.key !== 'LOST');
  const closedStages = STAGES.filter(s => s.key === 'WON' || s.key === 'LOST');

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Воронка лидов / CRM</h1>
          <p className="text-muted-foreground text-sm">Управление продажами и сделками</p>
        </div>
        <Button onClick={() => setNewDialogOpen(true)}>
          <Icon name="Plus" className="w-4 h-4 mr-2" />Новый лид
        </Button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon="Users" label="Лидов всего" value={String(total)}
          sub="за всё время" color="bg-slate-100 text-slate-700" />
        <KpiCard icon="CheckCircle" label="Квалифицировано" value={`${qualPct}%`}
          sub={`${qualified} лидов`} color="bg-blue-100 text-blue-700" />
        <KpiCard icon="Activity" label="В работе" value={String(active)}
          sub="активных сделок" color="bg-violet-100 text-violet-700" />
        <KpiCard icon="TrendingUp" label="Победа / Поражение"
          value={`${won} / ${lost}`} sub={`конверсия ${wonPct}%`}
          color="bg-emerald-100 text-emerald-700" />
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={filterManager} onValueChange={setFilterManager}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Менеджер" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Все менеджеры</SelectItem>
            {MANAGERS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterSource} onValueChange={setFilterSource}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Источник" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Все источники</SelectItem>
            {SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        {(filterManager !== 'ALL' || filterSource !== 'ALL') && (
          <Button variant="ghost" size="sm" onClick={() => {
            setFilterManager('ALL'); setFilterSource('ALL');
          }}>
            <Icon name="X" className="w-3 h-3 mr-1" />Сбросить
          </Button>
        )}
      </div>

      {/* Tabs: Kanban / Analytics */}
      <Tabs defaultValue="kanban">
        <TabsList>
          <TabsTrigger value="kanban">
            <Icon name="Columns" className="w-4 h-4 mr-1" />Канбан
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <Icon name="BarChart2" className="w-4 h-4 mr-1" />Аналитика
          </TabsTrigger>
        </TabsList>

        {/* Kanban */}
        <TabsContent value="kanban" className="mt-4">
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4" style={{ minWidth: `${kanbanStages.length * 220 + 450}px` }}>
              {kanbanStages.map(s => {
                const col = filtered.filter(l => l.stage === s.key);
                return (
                  <div key={s.key} className="flex-none w-52">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-semibold text-sm">{s.label}</span>
                      <Badge variant="outline" className="text-xs">{col.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {col.map(lead => (
                        <LeadCard key={lead.id} lead={lead}
                          onClick={() => setSelectedLead(lead)} />
                      ))}
                      {col.length === 0 && (
                        <div className="border-2 border-dashed rounded-lg p-4 text-center text-xs text-muted-foreground">
                          Нет лидов
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Won / Lost columns */}
              {closedStages.map(s => {
                const col = filtered.filter(l => l.stage === s.key);
                return (
                  <div key={s.key} className="flex-none w-52">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-semibold text-sm">{s.label}</span>
                      <Badge variant="outline" className="text-xs">{col.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {col.map(lead => (
                        <LeadCard key={lead.id} lead={lead}
                          onClick={() => setSelectedLead(lead)} />
                      ))}
                      {col.length === 0 && (
                        <div className="border-2 border-dashed rounded-lg p-4 text-center text-xs text-muted-foreground">
                          Нет лидов
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Funnel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Конверсия по этапам</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <ComposedChart
                    layout="vertical"
                    data={FUNNEL_DATA}
                    margin={{ left: 60, right: 20, top: 4, bottom: 4 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="stage" tick={{ fontSize: 12 }} width={60} />
                    <Tooltip formatter={(v: number) => [`${v} лидов`, 'Кол-во']} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {FUNNEL_DATA.map((entry, i) => (
                        <rect key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weekly */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Динамика лидов по неделям</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={WEEKLY_DATA} margin={{ left: 0, right: 20, top: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="новые" stroke="#3b82f6" strokeWidth={2} dot />
                    <Line type="monotone" dataKey="квалиф" stroke="#8b5cf6" strokeWidth={2} dot />
                    <Line type="monotone" dataKey="победа" stroke="#10b981" strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Summary table */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Сводка по менеджерам</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground text-xs">
                        <th className="text-left pb-2">Менеджер</th>
                        <th className="text-right pb-2">Лидов</th>
                        <th className="text-right pb-2">В работе</th>
                        <th className="text-right pb-2">Побед</th>
                        <th className="text-right pb-2">Сумма (победа)</th>
                        <th className="text-right pb-2">Конверсия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MANAGERS.map(m => {
                        const ml = leads.filter(l => l.manager === m);
                        const mWon = ml.filter(l => l.stage === 'WON');
                        const mActive = ml.filter(l => !['WON', 'LOST'].includes(l.stage));
                        const wonSum = mWon.reduce((s, l) => s + l.amount, 0);
                        const conv = ml.length ? Math.round((mWon.length / ml.length) * 100) : 0;
                        return (
                          <tr key={m} className="border-b last:border-0">
                            <td className="py-2 font-medium">{m}</td>
                            <td className="text-right">{ml.length}</td>
                            <td className="text-right">{mActive.length}</td>
                            <td className="text-right text-emerald-600 font-medium">{mWon.length}</td>
                            <td className="text-right">{wonSum > 0 ? fmt(wonSum) : '—'}</td>
                            <td className="text-right">
                              <Badge variant="outline" className={conv >= 30 ? 'text-emerald-600' : 'text-amber-600'}>
                                {conv}%
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Panel */}
      {selectedLead && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setSelectedLead(null)}
          />
          <DetailPanel
            lead={selectedLead}
            onClose={() => setSelectedLead(null)}
            onStageChange={handleStageChange}
          />
        </>
      )}

      {/* New Lead Dialog */}
      <NewLeadDialog
        open={newDialogOpen}
        onClose={() => setNewDialogOpen(false)}
        onAdd={handleAdd}
      />
    </div>
  );
}
