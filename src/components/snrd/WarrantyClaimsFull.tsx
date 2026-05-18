import { useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type ClaimStatus = 'Новое' | 'На рассмотрении' | 'Принято' | 'Отклонено' | 'Компенсировано';

interface HistoryEvent {
  date: string;
  author: string;
  text: string;
}

interface Claim {
  id: string;
  date: string;
  client: string;
  equipment: string;
  manufacturer: string;
  defect: string;
  status: ClaimStatus;
  compensation: number | null;
  history: HistoryEvent[];
  decisionNote: string;
  docs: string[];
}

interface ManufacturerRow {
  name: string;
  total: number;
  accepted: number;
  rejected: number;
  avgDays: number;
  compensation: number;
}

interface NewClaimForm {
  client: string;
  equipment: string;
  serial: string;
  defect: string;
  manufacturer: string;
  installDate: string;
  failureDate: string;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const CLAIMS: Claim[] = [
  {
    id: 'WC-2025-001', date: '12.01.2025', client: 'ООО «Альфа Технолоджис»',
    equipment: 'Daikin FTXB35C', manufacturer: 'Daikin',
    defect: 'Утечка хладагента из внутреннего блока', status: 'Компенсировано',
    compensation: 18500,
    history: [
      { date: '12.01.2025', author: 'Диспетчер', text: 'Обращение создано, направлено производителю' },
      { date: '19.01.2025', author: 'Daikin Russia', text: 'Получено, назначен технический эксперт' },
      { date: '28.01.2025', author: 'Daikin Russia', text: 'Признан заводской брак. Компенсация одобрена' },
    ],
    decisionNote: 'Заводской дефект сварного шва испарителя. Компенсация перечислена.',
    docs: ['Акт дефектовки.pdf', 'Фото неисправности.zip', 'Решение Daikin.pdf'],
  },
  {
    id: 'WC-2025-002', date: '18.01.2025', client: 'ИП Смирнова Е.В.',
    equipment: 'Mitsubishi Electric MSZ-LN25VGR', manufacturer: 'Mitsubishi Electric',
    defect: 'Шум компрессора, вибрация выше нормы', status: 'Принято',
    compensation: 22000,
    history: [
      { date: '18.01.2025', author: 'Инженер Карпов', text: 'Зафиксирован шум, снят видеозапись' },
      { date: '24.01.2025', author: 'ME Service', text: 'Запрошены дополнительные фото монтажа' },
      { date: '05.02.2025', author: 'ME Service', text: 'Брак компрессора подтверждён. Замена одобрена' },
    ],
    decisionNote: 'Производственный дефект компрессора серии LN 2024 года. Замена одобрена.',
    docs: ['Видео шума.mp4', 'Акт осмотра.pdf'],
  },
  {
    id: 'WC-2025-003', date: '25.01.2025', client: 'ТЦ «Галактика»',
    equipment: 'Daikin RZQSG100L8Y1', manufacturer: 'Daikin',
    defect: 'Не включается наружный блок, ошибка E7', status: 'На рассмотрении',
    compensation: null,
    history: [
      { date: '25.01.2025', author: 'Диспетчер', text: 'Создано обращение по ошибке E7' },
      { date: '31.01.2025', author: 'Daikin Russia', text: 'Запрошена история обслуживания и коды ошибок' },
      { date: '07.02.2025', author: 'Менеджер', text: 'Документы направлены производителю, ожидаем ответа' },
    ],
    decisionNote: '',
    docs: ['Лог ошибок.txt', 'История ТО.pdf'],
  },
  {
    id: 'WC-2025-004', date: '02.02.2025', client: 'ООО «БизнесПарк»',
    equipment: 'LG ARNU18GSJC4', manufacturer: 'LG',
    defect: 'Не охлаждает при +35°C, давление ниже нормы', status: 'Отклонено',
    compensation: null,
    history: [
      { date: '02.02.2025', author: 'Инженер Волков', text: 'Обращение направлено. Нарушен температурный режим' },
      { date: '10.02.2025', author: 'LG Electronics', text: 'Запрошены условия эксплуатации' },
      { date: '18.02.2025', author: 'LG Electronics', text: 'В гарантии отказано: нарушение условий эксплуатации' },
    ],
    decisionNote: 'Отказ: эксплуатация при температуре выше допустимой +43°C, не предусмотренной спецификацией.',
    docs: ['Отказ LG.pdf', 'Акт осмотра.pdf'],
  },
  {
    id: 'WC-2025-005', date: '10.02.2025', client: 'Клиника «МедиаЦентр»',
    equipment: 'Panasonic CS-Z25TKEW', manufacturer: 'Panasonic',
    defect: 'Замерзает испаритель при работе в режиме тепла', status: 'Принято',
    compensation: 15800,
    history: [
      { date: '10.02.2025', author: 'Диспетчер', text: 'Получена жалоба на обмерзание' },
      { date: '17.02.2025', author: 'Panasonic', text: 'Дистанционная диагностика проведена' },
      { date: '24.02.2025', author: 'Panasonic', text: 'Дефект платы управления. Замена одобрена' },
    ],
    decisionNote: 'Заводской дефект платы управления. Бесплатная замена платы и выезд инженера.',
    docs: ['Диагностика Panasonic.pdf'],
  },
  {
    id: 'WC-2025-006', date: '15.02.2025', client: 'ООО «РитейлГрупп»',
    equipment: 'Mitsubishi Heavy SRK35ZSX-S', manufacturer: 'Mitsubishi Heavy',
    defect: 'Течь конденсата через внутренний блок', status: 'На рассмотрении',
    compensation: null,
    history: [
      { date: '15.02.2025', author: 'Инженер Кузнецов', text: 'Зафиксирована течь, фото направлены' },
      { date: '22.02.2025', author: 'MH Service', text: 'Получено, ожидаем осмотра представителя' },
      { date: '01.03.2025', author: 'MH Service', text: 'Осмотр назначен на 10.03.2025' },
    ],
    decisionNote: '',
    docs: ['Фото течи.zip'],
  },
  {
    id: 'WC-2025-007', date: '20.02.2025', client: 'Сеть магазинов «ТехноДом»',
    equipment: 'Daikin VRV RYYQ16T7Y1B', manufacturer: 'Daikin',
    defect: 'Остановка системы VRV, ошибка A1-00', status: 'Компенсировано',
    compensation: 47200,
    history: [
      { date: '20.02.2025', author: 'Диспетчер', text: 'Экстренное обращение: остановка системы VRV' },
      { date: '22.02.2025', author: 'Daikin Russia', text: 'Срочный выезд сервисного инженера Daikin' },
      { date: '28.02.2025', author: 'Daikin Russia', text: 'Замена инвертора. Компенсация за простой одобрена' },
    ],
    decisionNote: 'Заводской брак инвертора. Компенсация включает стоимость детали и простой.',
    docs: ['Коды ошибок.pdf', 'Акт замены.pdf', 'Компенсация.pdf'],
  },
  {
    id: 'WC-2025-008', date: '01.03.2025', client: 'Отель «Премьер»',
    equipment: 'LG ARNU36GTJC2', manufacturer: 'LG',
    defect: 'Не работает режим вентиляции', status: 'Новое',
    compensation: null,
    history: [
      { date: '01.03.2025', author: 'Менеджер', text: 'Обращение создано, направлено производителю' },
    ],
    decisionNote: '',
    docs: ['Описание проблемы.docx'],
  },
];

const MANUFACTURER_ROWS: ManufacturerRow[] = [
  { name: 'Daikin', total: 28, accepted: 23, rejected: 3, avgDays: 18, compensation: 198400 },
  { name: 'Mitsubishi Electric', total: 21, accepted: 17, rejected: 2, avgDays: 21, compensation: 142000 },
  { name: 'Panasonic', total: 15, accepted: 12, rejected: 2, avgDays: 25, compensation: 87600 },
  { name: 'Mitsubishi Heavy', total: 12, accepted: 8, rejected: 3, avgDays: 29, compensation: 54200 },
  { name: 'LG', total: 13, accepted: 7, rejected: 6, avgDays: 34, compensation: 41800 },
];

const MONTHLY_DATA = [
  { month: 'Янв', count: 12 }, { month: 'Фев', count: 18 }, { month: 'Мар', count: 9 },
  { month: 'Апр', count: 7 }, { month: 'Май', count: 14 }, { month: 'Июн', count: 11 },
  { month: 'Июл', count: 6 }, { month: 'Авг', count: 8 }, { month: 'Сен', count: 5 },
  { month: 'Окт', count: 0 }, { month: 'Ноя', count: 0 }, { month: 'Дек', count: 0 },
];

const PIE_DATA = MANUFACTURER_ROWS.map((m) => ({ name: m.name, value: m.total }));
const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

const TOP_DEFECTS = [
  { defect: 'Утечка хладагента', count: 24 },
  { defect: 'Неисправность компрессора', count: 18 },
  { defect: 'Дефект платы управления', count: 15 },
  { defect: 'Обмерзание испарителя', count: 12 },
  { defect: 'Течь конденсата', count: 9 },
];

const ACCEPTANCE_BAR = MANUFACTURER_ROWS.map((m) => ({
  name: m.name,
  percent: Math.round((m.accepted / m.total) * 100),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<ClaimStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'Новое': 'secondary',
  'На рассмотрении': 'outline',
  'Принято': 'default',
  'Отклонено': 'destructive',
  'Компенсировано': 'default',
};

const STATUS_COLOR: Record<ClaimStatus, string> = {
  'Новое': 'bg-slate-100 text-slate-700',
  'На рассмотрении': 'bg-amber-100 text-amber-700',
  'Принято': 'bg-emerald-100 text-emerald-700',
  'Отклонено': 'bg-red-100 text-red-700',
  'Компенсировано': 'bg-blue-100 text-blue-700',
};

function fmt(n: number) {
  return n.toLocaleString('ru-RU') + ' ₽';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, sub, color }: {
  icon: string; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex gap-3 items-start">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon name={icon as any} size={18} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function ClaimDetailPanel({ claim, onClose }: { claim: Claim; onClose: () => void }) {
  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-background border-l shadow-xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <p className="font-semibold">{claim.id}</p>
          <p className="text-xs text-muted-foreground">{claim.client}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <Icon name="X" size={16} />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Оборудование</p>
          <p className="font-medium">{claim.equipment}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Неисправность</p>
          <p className="text-sm">{claim.defect}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Статус:</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[claim.status]}`}>
            {claim.status}
          </span>
        </div>
        {claim.compensation && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Компенсация</p>
            <p className="font-semibold text-emerald-600">{fmt(claim.compensation)}</p>
          </div>
        )}
        {claim.decisionNote && (
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs font-medium mb-1">Решение производителя</p>
            <p className="text-xs text-muted-foreground">{claim.decisionNote}</p>
          </div>
        )}
        <div>
          <p className="text-xs font-medium mb-2">История переписки</p>
          <div className="space-y-3">
            {claim.history.map((ev, i) => (
              <div key={i} className="flex gap-2">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1" />
                  {i < claim.history.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                </div>
                <div className="pb-3">
                  <p className="text-xs font-medium">{ev.author} · {ev.date}</p>
                  <p className="text-xs text-muted-foreground">{ev.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {claim.docs.length > 0 && (
          <div>
            <p className="text-xs font-medium mb-2">Документы</p>
            <div className="space-y-1">
              {claim.docs.map((doc, i) => (
                <div key={i} className="flex items-center gap-2 text-xs p-2 bg-muted rounded cursor-pointer hover:bg-muted/80">
                  <Icon name="FileText" size={12} />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const EMPTY_FORM: NewClaimForm = {
  client: '', equipment: '', serial: '', defect: '',
  manufacturer: '', installDate: '', failureDate: '',
};

export default function WarrantyClaimsFull() {
  const [period, setPeriod] = useState('2025');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<NewClaimForm>(EMPTY_FORM);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMfr, setFilterMfr] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  const filtered = CLAIMS.filter((c) => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (filterMfr !== 'all' && c.manufacturer !== filterMfr) return false;
    if (search && !c.client.toLowerCase().includes(search.toLowerCase()) &&
      !c.id.toLowerCase().includes(search.toLowerCase()) &&
      !c.equipment.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function handleCreate() {
    if (!form.client || !form.equipment || !form.defect || !form.manufacturer) {
      toast.error('Заполните обязательные поля');
      return;
    }
    toast.success('Гарантийное обращение создано');
    setDialogOpen(false);
    setForm(EMPTY_FORM);
  }

  const manufacturers = Array.from(new Set(CLAIMS.map((c) => c.manufacturer)));

  return (
    <div className="space-y-4 p-4 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Гарантийные обращения</h1>
          <p className="text-sm text-muted-foreground">Учёт и контроль гарантийных случаев с производителями</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025 год</SelectItem>
              <SelectItem value="2024">2024 год</SelectItem>
              <SelectItem value="2023">2023 год</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setDialogOpen(true)}>
            <Icon name="Plus" size={16} className="mr-1" />
            Новое гарантийное обращение
          </Button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-3">
        <KpiCard icon="FileText" label="Всего обращений" value="89"
          sub="за выбранный период" color="bg-blue-100 text-blue-600" />
        <KpiCard icon="ShieldCheck" label="Принято производителем" value="67"
          sub="75% от общего числа" color="bg-emerald-100 text-emerald-600" />
        <KpiCard icon="ShieldX" label="Отклонено" value="12"
          sub="13% от общего числа" color="bg-red-100 text-red-600" />
        <KpiCard icon="Wallet" label="Компенсация ожидается" value="127 400 ₽"
          sub="10 открытых обращений" color="bg-amber-100 text-amber-600" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="claims">
        <TabsList>
          <TabsTrigger value="claims">Обращения</TabsTrigger>
          <TabsTrigger value="manufacturers">По производителям</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
        </TabsList>

        {/* Tab: Claims */}
        <TabsContent value="claims" className="space-y-3">
          <div className="flex gap-2">
            <Input placeholder="Поиск по номеру, клиенту, оборудованию..."
              value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-64" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="Новое">Новое</SelectItem>
                <SelectItem value="На рассмотрении">На рассмотрении</SelectItem>
                <SelectItem value="Принято">Принято</SelectItem>
                <SelectItem value="Отклонено">Отклонено</SelectItem>
                <SelectItem value="Компенсировано">Компенсировано</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterMfr} onValueChange={setFilterMfr}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Производитель" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все производители</SelectItem>
                {manufacturers.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">№</TableHead>
                  <TableHead className="w-24">Дата</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Оборудование</TableHead>
                  <TableHead className="w-36">Производитель</TableHead>
                  <TableHead>Неисправность</TableHead>
                  <TableHead className="w-36">Статус</TableHead>
                  <TableHead className="w-28 text-right">Компенсация</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedClaim(c)}>
                    <TableCell className="font-mono text-xs">{c.id}</TableCell>
                    <TableCell className="text-xs">{c.date}</TableCell>
                    <TableCell className="text-xs max-w-[140px] truncate">{c.client}</TableCell>
                    <TableCell className="text-xs">{c.equipment}</TableCell>
                    <TableCell className="text-xs">{c.manufacturer}</TableCell>
                    <TableCell className="text-xs max-w-[160px] truncate">{c.defect}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${STATUS_COLOR[c.status]}`}>
                        {c.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-xs font-medium">
                      {c.compensation ? fmt(c.compensation) : '—'}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedClaim(c); }}>
                        <Icon name="ChevronRight" size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Tab: Manufacturers */}
        <TabsContent value="manufacturers" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">% принятия по производителям</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={ACCEPTANCE_BAR} layout="vertical" margin={{ left: 40 }}>
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={10} />
                    <YAxis type="category" dataKey="name" fontSize={10} width={100} />
                    <Tooltip formatter={(v) => [`${v}%`, '% принятия']} />
                    <Bar dataKey="percent" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Топ по % принятия</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[...MANUFACTURER_ROWS]
                  .sort((a, b) => (b.accepted / b.total) - (a.accepted / a.total))
                  .map((m, i) => {
                    const pct = Math.round((m.accepted / m.total) * 100);
                    const color = pct >= 80 ? 'bg-emerald-100 text-emerald-700'
                      : pct >= 60 ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700';
                    return (
                      <div key={m.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                          <span className="text-sm font-medium">{m.name}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${color}`}>{pct}%</span>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Производитель</TableHead>
                  <TableHead className="text-right">Обращений</TableHead>
                  <TableHead className="text-right">Принято</TableHead>
                  <TableHead className="text-right">Отклонено</TableHead>
                  <TableHead className="text-right">% принятия</TableHead>
                  <TableHead className="text-right">Среднее время, дн.</TableHead>
                  <TableHead className="text-right">Компенсация</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MANUFACTURER_ROWS.map((m) => {
                  const pct = Math.round((m.accepted / m.total) * 100);
                  return (
                    <TableRow key={m.name}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell className="text-right">{m.total}</TableCell>
                      <TableCell className="text-right text-emerald-600 font-medium">{m.accepted}</TableCell>
                      <TableCell className="text-right text-red-600 font-medium">{m.rejected}</TableCell>
                      <TableCell className="text-right">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${pct >= 80 ? 'bg-emerald-100 text-emerald-700' : pct >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {pct}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{m.avgDays}</TableCell>
                      <TableCell className="text-right font-medium">{fmt(m.compensation)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Tab: Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Card className="col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Обращения по месяцам</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={MONTHLY_DATA}>
                    <XAxis dataKey="month" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" name="Обращений" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">По производителям</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={PIE_DATA} cx="50%" cy="50%" outerRadius={70}
                      dataKey="value" nameKey="name" fontSize={10}>
                      {PIE_DATA.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Средний срок рассмотрения</p>
                  <p className="text-2xl font-bold">23 дня</p>
                  <p className="text-xs text-muted-foreground">по всем производителям</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Общая компенсация за год</p>
                  <p className="text-2xl font-bold text-emerald-600">485 000 ₽</p>
                  <p className="text-xs text-muted-foreground">принято + компенсировано</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Топ-5 типичных неисправностей</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {TOP_DEFECTS.map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                      <span className="text-sm">{d.defect}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">{d.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Panel */}
      {selectedClaim && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelectedClaim(null)} />
          <ClaimDetailPanel claim={selectedClaim} onClose={() => setSelectedClaim(null)} />
        </>
      )}

      {/* Dialog: New Claim */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Новое гарантийное обращение</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Клиент *</label>
              <Input placeholder="Название организации или ФИО"
                value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Оборудование *</label>
              <Input placeholder="Марка и модель оборудования"
                value={form.equipment} onChange={(e) => setForm({ ...form, equipment: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Серийный номер</label>
              <Input placeholder="S/N оборудования"
                value={form.serial} onChange={(e) => setForm({ ...form, serial: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Производитель *</label>
              <Select value={form.manufacturer} onValueChange={(v) => setForm({ ...form, manufacturer: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите производителя" />
                </SelectTrigger>
                <SelectContent>
                  {manufacturers.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Описание неисправности *</label>
              <Input placeholder="Опишите проблему подробно"
                value={form.defect} onChange={(e) => setForm({ ...form, defect: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Дата монтажа</label>
                <Input type="date" value={form.installDate}
                  onChange={(e) => setForm({ ...form, installDate: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Дата неисправности</label>
                <Input type="date" value={form.failureDate}
                  onChange={(e) => setForm({ ...form, failureDate: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); setForm(EMPTY_FORM); }}>
              Отмена
            </Button>
            <Button onClick={handleCreate}>
              <Icon name="Plus" size={14} className="mr-1" />
              Создать обращение
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
