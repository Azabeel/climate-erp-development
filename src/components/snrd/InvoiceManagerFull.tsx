import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
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
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString('ru-RU');

// ─── Types ────────────────────────────────────────────────────────────────────
type InvoiceStatus = 'Черновик' | 'Выставлен' | 'Частично оплачен' | 'Оплачен' | 'Просрочен';
type ActStatus = 'Черновик' | 'Подписан клиентом' | 'Подписан нами' | 'Закрыт';

interface InvoiceLine { name: string; qty: number; price: number; total: number }
interface PaymentRecord { date: string; amount: number; method: string }

interface Invoice {
  id: string; client: string; order: string; issued: string; due: string;
  amount: number; vat: number; total: number; status: InvoiceStatus;
  lines: InvoiceLine[]; payments: PaymentRecord[];
}

interface Act {
  id: string; client: string; order: string; date: string;
  amount: number; status: ActStatus;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const INVOICES: Invoice[] = [
  { id: 'СФ-2026-001', client: 'ООО «АркадияТорг»',    order: 'WO-2026-000312', issued: '2026-04-02', due: '2026-04-16', amount: 48500,  vat: 8083,  total: 56583,  status: 'Оплачен',            lines: [{ name: 'ТО кондиционера Samsung', qty: 1, price: 4500, total: 4500 }, { name: 'Фреон R-410A (1.2 кг)', qty: 1, price: 960, total: 960 }, { name: 'Фильтр воздушный', qty: 2, price: 350, total: 700 }], payments: [{ date: '2026-04-14', amount: 56583, method: 'Безналичный' }] },
  { id: 'СФ-2026-002', client: 'ИП Сидоров А.В.',       order: 'WO-2026-000318', issued: '2026-04-05', due: '2026-04-19', amount: 12300,  vat: 2050,  total: 14350,  status: 'Просрочен',          lines: [{ name: 'Ремонт компрессора', qty: 1, price: 8500, total: 8500 }, { name: 'Уплотнитель', qty: 3, price: 600, total: 1800 }], payments: [] },
  { id: 'СФ-2026-003', client: 'ГУП «Горэлектротранс»', order: 'WO-2026-000325', issued: '2026-04-08', due: '2026-05-08', amount: 187000, vat: 31167, total: 218167, status: 'Частично оплачен',   lines: [{ name: 'Монтаж VRF системы Daikin', qty: 1, price: 145000, total: 145000 }, { name: 'Материалы', qty: 1, price: 42000, total: 42000 }], payments: [{ date: '2026-04-25', amount: 100000, method: 'Безналичный' }] },
  { id: 'СФ-2026-004', client: 'ЗАО «СевМаш»',          order: 'WO-2026-000331', issued: '2026-04-10', due: '2026-04-24', amount: 34200,  vat: 5700,  total: 39900,  status: 'Просрочен',          lines: [{ name: 'Замена платы управления', qty: 1, price: 22000, total: 22000 }, { name: 'Работа инженера', qty: 3, price: 4066, total: 12200 }], payments: [] },
  { id: 'СФ-2026-005', client: 'ООО «БетаРитейл»',      order: 'WO-2026-000340', issued: '2026-04-12', due: '2026-05-12', amount: 92400,  vat: 15400, total: 107800, status: 'Выставлен',          lines: [{ name: 'Плановое ТО (5 блоков)', qty: 5, price: 6500, total: 32500 }, { name: 'ЗИП по результатам ТО', qty: 1, price: 59900, total: 59900 }], payments: [] },
  { id: 'СФ-2026-006', client: 'Физлицо Петрова О.Н.', order: 'WO-2026-000347', issued: '2026-04-15', due: '2026-04-22', amount: 8900,   vat: 0,     total: 8900,   status: 'Оплачен',            lines: [{ name: 'Заправка кондиционера', qty: 1, price: 3500, total: 3500 }, { name: 'Фреон R-22 (0.8 кг)', qty: 1, price: 5400, total: 5400 }], payments: [{ date: '2026-04-18', amount: 8900, method: 'Наличные' }] },
  { id: 'СФ-2026-007', client: 'ООО «НордМаркет»',      order: 'WO-2026-000352', issued: '2026-04-17', due: '2026-05-01', amount: 156000, vat: 26000, total: 182000, status: 'Просрочен',          lines: [{ name: 'Установка чиллера Carrier', qty: 1, price: 120000, total: 120000 }, { name: 'Пуско-наладка', qty: 1, price: 36000, total: 36000 }], payments: [] },
  { id: 'СФ-2026-008', client: 'АО «ТехноСтрой»',       order: 'WO-2026-000358', issued: '2026-04-18', due: '2026-05-18', amount: 45600,  vat: 7600,  total: 53200,  status: 'Выставлен',          lines: [{ name: 'Диагностика системы вентиляции', qty: 1, price: 12000, total: 12000 }, { name: 'Замена фильтров HEPA', qty: 8, price: 4200, total: 33600 }], payments: [] },
  { id: 'СФ-2026-009', client: 'ООО «АркадияТорг»',    order: 'WO-2026-000362', issued: '2026-04-20', due: '2026-05-20', amount: 23100,  vat: 3850,  total: 26950,  status: 'Оплачен',            lines: [{ name: 'Ремонт вентилятора', qty: 1, price: 9500, total: 9500 }, { name: 'Двигатель вентилятора', qty: 1, price: 13600, total: 13600 }], payments: [{ date: '2026-05-05', amount: 26950, method: 'Безналичный' }] },
  { id: 'СФ-2026-010', client: 'ГУП «Горэлектротранс»', order: 'WO-2026-000370', issued: '2026-04-22', due: '2026-05-22', amount: 67800,  vat: 11300, total: 79100,  status: 'Выставлен',          lines: [{ name: 'Сервис VRF (3 внутр. блока)', qty: 3, price: 7500, total: 22500 }, { name: 'Замена инвертора', qty: 1, price: 45300, total: 45300 }], payments: [] },
  { id: 'СФ-2026-011', client: 'ИП Лукьянов Д.С.',      order: 'WO-2026-000375', issued: '2026-04-25', due: '2026-05-09', amount: 17500,  vat: 0,     total: 17500,  status: 'Оплачен',            lines: [{ name: 'Монтаж сплит-системы', qty: 1, price: 7500, total: 7500 }, { name: 'Оборудование Mitsubishi', qty: 1, price: 10000, total: 10000 }], payments: [{ date: '2026-05-01', amount: 17500, method: 'Карта' }] },
  { id: 'СФ-2026-012', client: 'ООО «БетаРитейл»',      order: 'WO-2026-000381', issued: '2026-04-27', due: '2026-05-27', amount: 38400,  vat: 6400,  total: 44800,  status: 'Черновик',           lines: [{ name: 'Гарантийный ремонт', qty: 1, price: 38400, total: 38400 }], payments: [] },
  { id: 'СФ-2026-013', client: 'АО «ТехноСтрой»',       order: 'WO-2026-000387', issued: '2026-05-01', due: '2026-05-31', amount: 112000, vat: 18667, total: 130667, status: 'Выставлен',          lines: [{ name: 'Монтаж приточной вентиляции', qty: 1, price: 78000, total: 78000 }, { name: 'Воздуховоды и фитинги', qty: 1, price: 34000, total: 34000 }], payments: [] },
  { id: 'СФ-2026-014', client: 'ЗАО «СевМаш»',          order: 'WO-2026-000392', issued: '2026-05-03', due: '2026-05-17', amount: 29900,  vat: 4983,  total: 34883,  status: 'Черновик',           lines: [{ name: 'Диагностика холодильной камеры', qty: 1, price: 15000, total: 15000 }, { name: 'Замена ТЭНа оттайки', qty: 2, price: 7450, total: 14900 }], payments: [] },
  { id: 'СФ-2026-015', client: 'ООО «НордМаркет»',      order: 'WO-2026-000398', issued: '2026-05-05', due: '2026-06-04', amount: 74300,  vat: 12383, total: 86683,  status: 'Выставлен',          lines: [{ name: 'ТО промышленного холодильника', qty: 1, price: 18000, total: 18000 }, { name: 'Компрессор Embraco', qty: 1, price: 56300, total: 56300 }], payments: [] },
];

const ACTS: Act[] = [
  { id: 'АКТ-2026-001', client: 'ООО «АркадияТорг»',    order: 'WO-2026-000312', date: '2026-04-01', amount: 48500,  status: 'Закрыт' },
  { id: 'АКТ-2026-002', client: 'Физлицо Петрова О.Н.', order: 'WO-2026-000347', date: '2026-04-15', amount: 8900,   status: 'Закрыт' },
  { id: 'АКТ-2026-003', client: 'ООО «АркадияТорг»',    order: 'WO-2026-000362', date: '2026-04-19', amount: 23100,  status: 'Подписан нами' },
  { id: 'АКТ-2026-004', client: 'ИП Лукьянов Д.С.',     order: 'WO-2026-000375', date: '2026-04-24', amount: 17500,  status: 'Закрыт' },
  { id: 'АКТ-2026-005', client: 'ГУП «Горэлектротранс»',order: 'WO-2026-000325', date: '2026-04-28', amount: 187000, status: 'Подписан клиентом' },
  { id: 'АКТ-2026-006', client: 'АО «ТехноСтрой»',      order: 'WO-2026-000358', date: '2026-04-30', amount: 45600,  status: 'Подписан нами' },
  { id: 'АКТ-2026-007', client: 'ИП Сидоров А.В.',      order: 'WO-2026-000318', date: '2026-05-03', amount: 12300,  status: 'Черновик' },
  { id: 'АКТ-2026-008', client: 'ООО «НордМаркет»',     order: 'WO-2026-000352', date: '2026-05-06', amount: 156000, status: 'Черновик' },
  { id: 'АКТ-2026-009', client: 'ЗАО «СевМаш»',         order: 'WO-2026-000331', date: '2026-05-08', amount: 34200,  status: 'Черновик' },
  { id: 'АКТ-2026-010', client: 'ООО «БетаРитейл»',     order: 'WO-2026-000340', date: '2026-05-10', amount: 92400,  status: 'Подписан клиентом' },
];

const AREA_DATA = [
  { month: 'Дек 25', issued: 580000, paid: 510000 },
  { month: 'Янв 26', issued: 620000, paid: 540000 },
  { month: 'Фев 26', issued: 710000, paid: 650000 },
  { month: 'Мар 26', issued: 890000, paid: 740000 },
  { month: 'Апр 26', issued: 945000, paid: 820000 },
  { month: 'Май 26', issued: 746000, paid: 410000 },
];

const STATUS_BAR_DATA = [
  { status: 'Черновик',          sum: 142200 },
  { status: 'Выставлен',         sum: 498983 },
  { status: 'Частично оплачен',  sum: 218167 },
  { status: 'Оплачен',           sum: 109733 },
  { status: 'Просрочен',         sum: 434067 },
];

const AGING_DATA = [
  { client: 'ООО «НордМаркет»',       d30: 86683,  d60: 182000, d90: 0,     d90p: 0      },
  { client: 'ГУП «Горэлектротранс»',  d30: 79100,  d60: 118167, d90: 0,     d90p: 0      },
  { client: 'АО «ТехноСтрой»',        d30: 130667, d60: 0,      d90: 53200, d90p: 0      },
  { client: 'ИП Сидоров А.В.',        d30: 0,      d60: 14350,  d90: 0,     d90p: 0      },
  { client: 'ЗАО «СевМаш»',          d30: 34883,  d60: 0,      d90: 39900, d90p: 0      },
  { client: 'ООО «БетаРитейл»',       d30: 44800,  d60: 0,      d90: 0,     d90p: 107800 },
];

const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  'Черновик':          'secondary',
  'Выставлен':         'default',
  'Частично оплачен':  'outline',
  'Оплачен':           'default',
  'Просрочен':         'destructive',
} as const;

const ACT_STATUS_COLORS: Record<ActStatus, string> = {
  'Черновик':           'secondary',
  'Подписан клиентом':  'outline',
  'Подписан нами':      'default',
  'Закрыт':            'default',
} as const;

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ title, value, sub, icon, color }: {
  title: string; value: string | number; sub?: string;
  icon: string; color: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon name={icon as any} size={20} className="text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Invoice Detail Panel ─────────────────────────────────────────────────────
function InvoiceDetail({ inv, onClose }: { inv: Invoice; onClose: () => void }) {
  return (
    <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base">{inv.id} — {inv.client}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <Icon name="X" size={16} />
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div><span className="text-muted-foreground">Наряд:</span> <span className="font-medium">{inv.order}</span></div>
        <div><span className="text-muted-foreground">Выставлен:</span> <span className="font-medium">{inv.issued}</span></div>
        <div><span className="text-muted-foreground">Срок оплаты:</span> <span className="font-medium">{inv.due}</span></div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Позиция</TableHead>
            <TableHead className="text-right">Кол-во</TableHead>
            <TableHead className="text-right">Цена, ₽</TableHead>
            <TableHead className="text-right">Сумма, ₽</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inv.lines.map((l, i) => (
            <TableRow key={i}>
              <TableCell>{l.name}</TableCell>
              <TableCell className="text-right">{l.qty}</TableCell>
              <TableCell className="text-right">{fmt(l.price)}</TableCell>
              <TableCell className="text-right">{fmt(l.total)}</TableCell>
            </TableRow>
          ))}
          <TableRow className="font-medium bg-muted/50">
            <TableCell colSpan={3}>Без НДС</TableCell>
            <TableCell className="text-right">{fmt(inv.amount)}</TableCell>
          </TableRow>
          {inv.vat > 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-muted-foreground">НДС 20%</TableCell>
              <TableCell className="text-right text-muted-foreground">{fmt(inv.vat)}</TableCell>
            </TableRow>
          )}
          <TableRow className="font-bold">
            <TableCell colSpan={3}>Итого к оплате</TableCell>
            <TableCell className="text-right">{fmt(inv.total)} ₽</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      {inv.payments.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-1">История оплат</p>
          {inv.payments.map((p, i) => (
            <div key={i} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
              <span className="text-muted-foreground">{p.date} · {p.method}</span>
              <span className="font-medium text-green-600">+{fmt(p.amount)} ₽</span>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" onClick={() => toast.success(`Счёт ${inv.id} отправлен клиенту`)}>
          <Icon name="Send" size={14} className="mr-1" /> Отправить клиенту
        </Button>
        <Button size="sm" variant="outline" onClick={() => toast.success(`PDF счёта ${inv.id} скачивается`)}>
          <Icon name="Download" size={14} className="mr-1" /> Скачать PDF
        </Button>
        {inv.status !== 'Оплачен' && (
          <Button size="sm" variant="secondary" onClick={() => toast.success(`Счёт ${inv.id} отмечен как оплаченный`)}>
            <Icon name="CheckCircle" size={14} className="mr-1" /> Отметить оплаченным
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Create Invoice Dialog ─────────────────────────────────────────────────────
interface NewLine { name: string; qty: string; price: string }

function CreateInvoiceDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [client, setClient] = useState('');
  const [order, setOrder] = useState('');
  const [discount, setDiscount] = useState('');
  const [lines, setLines] = useState<NewLine[]>([{ name: '', qty: '1', price: '' }]);

  const addLine = () => setLines(prev => [...prev, { name: '', qty: '1', price: '' }]);
  const removeLine = (i: number) => setLines(prev => prev.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: keyof NewLine, value: string) =>
    setLines(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l));

  const subtotal = lines.reduce((s, l) => s + (parseFloat(l.qty) || 0) * (parseFloat(l.price) || 0), 0);
  const disc = (parseFloat(discount) || 0) / 100;
  const total = subtotal * (1 - disc);

  const handleSubmit = () => {
    if (!client) { toast.error('Укажите клиента'); return; }
    toast.success(`Счёт создан для "${client}" на сумму ${fmt(Math.round(total))} ₽`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создать счёт</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Клиент</label>
              <Input placeholder="Наименование клиента" value={client} onChange={e => setClient(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Наряд</label>
              <Input placeholder="WO-2026-..." value={order} onChange={e => setOrder(e.target.value)} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Позиции счёта</p>
              <Button size="sm" variant="outline" onClick={addLine}>
                <Icon name="Plus" size={14} className="mr-1" /> Добавить
              </Button>
            </div>
            <div className="space-y-2">
              {lines.map((l, i) => (
                <div key={i} className="grid grid-cols-[1fr_80px_110px_36px] gap-2 items-center">
                  <Input placeholder="Наименование" value={l.name} onChange={e => updateLine(i, 'name', e.target.value)} />
                  <Input type="number" placeholder="Кол" value={l.qty} onChange={e => updateLine(i, 'qty', e.target.value)} />
                  <Input type="number" placeholder="Цена, ₽" value={l.price} onChange={e => updateLine(i, 'price', e.target.value)} />
                  <Button size="icon" variant="ghost" onClick={() => removeLine(i)} disabled={lines.length === 1}>
                    <Icon name="Trash2" size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 items-end">
            <div className="space-y-1">
              <label className="text-sm font-medium">Скидка, %</label>
              <Input type="number" placeholder="0" value={discount} onChange={e => setDiscount(e.target.value)} />
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Сумма: {fmt(Math.round(subtotal))} ₽</p>
              <p className="text-base font-bold">Итого: {fmt(Math.round(total))} ₽</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSubmit}>Создать счёт</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function InvoiceManagerFull() {
  const [activeTab, setActiveTab] = useState('invoices');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterClient, setFilterClient] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);

  const pendingSum = INVOICES
    .filter(i => i.status === 'Выставлен' || i.status === 'Частично оплачен')
    .reduce((s, i) => s + i.total, 0);

  const filteredInvoices = INVOICES.filter(inv => {
    const matchStatus = filterStatus === 'all' || inv.status === filterStatus;
    const matchClient = !filterClient || inv.client.toLowerCase().includes(filterClient.toLowerCase());
    return matchStatus && matchClient;
  });

  return (
    <div className="space-y-5 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Управление счетами и актами</h1>
          <p className="text-sm text-muted-foreground">Документооборот, оплаты, дебиторка</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Icon name="Plus" size={16} className="mr-2" /> Создать счёт
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard title="Счетов выставлено" value={84} sub="за текущий месяц" icon="FileText" color="bg-blue-500" />
        <KpiCard title="Оплачено" value={67} sub="79.8% от выставленных" icon="CheckCircle" color="bg-green-500" />
        <KpiCard title="Просрочено" value={8} sub="требуют внимания" icon="AlertTriangle" color="bg-red-500" />
        <KpiCard title="Ожидает оплаты" value={`${fmt(Math.round(pendingSum / 1000))} тыс. ₽`} sub="Выставлен + Частично" icon="Clock" color="bg-amber-500" />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="invoices">Счета</TabsTrigger>
          <TabsTrigger value="acts">Акты</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
        </TabsList>

        {/* ── Invoices tab ── */}
        <TabsContent value="invoices" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <Input
              placeholder="Поиск по клиенту..."
              className="w-56"
              value={filterClient}
              onChange={e => setFilterClient(e.target.value)}
            />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="Черновик">Черновик</SelectItem>
                <SelectItem value="Выставлен">Выставлен</SelectItem>
                <SelectItem value="Частично оплачен">Частично оплачен</SelectItem>
                <SelectItem value="Оплачен">Оплачен</SelectItem>
                <SelectItem value="Просрочен">Просрочен</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Период" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Весь период</SelectItem>
                <SelectItem value="month">Текущий месяц</SelectItem>
                <SelectItem value="quarter">Квартал</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>№ счёта</TableHead>
                    <TableHead>Клиент</TableHead>
                    <TableHead>Наряд</TableHead>
                    <TableHead>Выставлен</TableHead>
                    <TableHead>Срок оплаты</TableHead>
                    <TableHead className="text-right">Сумма, ₽</TableHead>
                    <TableHead className="text-right">НДС, ₽</TableHead>
                    <TableHead className="text-right">Итого, ₽</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map(inv => (
                    <TableRow
                      key={inv.id}
                      className={`cursor-pointer hover:bg-muted/50 transition-colors ${inv.status === 'Просрочен' ? 'bg-red-50 dark:bg-red-950/20' : ''}`}
                      onClick={() => setSelectedInvoice(selectedInvoice?.id === inv.id ? null : inv)}
                    >
                      <TableCell className="font-medium text-sm">{inv.id}</TableCell>
                      <TableCell className="text-sm max-w-[160px] truncate">{inv.client}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{inv.order}</TableCell>
                      <TableCell className="text-sm">{inv.issued}</TableCell>
                      <TableCell className={`text-sm ${inv.status === 'Просрочен' ? 'text-red-600 font-medium' : ''}`}>{inv.due}</TableCell>
                      <TableCell className="text-right text-sm">{fmt(inv.amount)}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">{inv.vat > 0 ? fmt(inv.vat) : '—'}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{fmt(inv.total)}</TableCell>
                      <TableCell>
                        <Badge variant={INVOICE_STATUS_COLORS[inv.status] as any}
                          className={inv.status === 'Оплачен' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}>
                          {inv.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {selectedInvoice && (
            <InvoiceDetail inv={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
          )}
        </TabsContent>

        {/* ── Acts tab ── */}
        <TabsContent value="acts" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>№ акта</TableHead>
                    <TableHead>Клиент</TableHead>
                    <TableHead>Наряд</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead className="text-right">Сумма, ₽</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ACTS.map(act => (
                    <TableRow key={act.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium text-sm">{act.id}</TableCell>
                      <TableCell className="text-sm max-w-[180px] truncate">{act.client}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{act.order}</TableCell>
                      <TableCell className="text-sm">{act.date}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{fmt(act.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={ACT_STATUS_COLORS[act.status] as any}
                          className={act.status === 'Закрыт' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}>
                          {act.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => toast.success(`Акт ${act.id} скачивается`)}>
                            <Icon name="Download" size={13} className="mr-1" /> Скачать
                          </Button>
                          {act.status === 'Черновик' && (
                            <Button size="sm" variant="secondary" onClick={() => toast.success(`Акт ${act.id} отправлен на подпись`)}>
                              <Icon name="Send" size={13} className="mr-1" /> На подпись
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Analytics tab ── */}
        <TabsContent value="analytics" className="space-y-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Area chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Выставлено vs Оплачено (6 мес)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={AREA_DATA} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradIssued" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradPaid" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}к`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => `${fmt(v)} ₽`} />
                    <Legend />
                    <Area type="monotone" dataKey="issued" name="Выставлено" stroke="#6366f1" fill="url(#gradIssued)" strokeWidth={2} />
                    <Area type="monotone" dataKey="paid"   name="Оплачено"  stroke="#10b981" fill="url(#gradPaid)"   strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar chart by status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Сумма по статусам счетов</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={STATUS_BAR_DATA} margin={{ top: 4, right: 8, left: 8, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="status" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" interval={0} />
                    <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}к`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => `${fmt(v)} ₽`} />
                    <Bar dataKey="sum" name="Сумма, ₽" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Aging analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Aging-анализ дебиторской задолженности</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Клиент</TableHead>
                    <TableHead className="text-right">0–30 дней, ₽</TableHead>
                    <TableHead className="text-right">31–60 дней, ₽</TableHead>
                    <TableHead className="text-right">61–90 дней, ₽</TableHead>
                    <TableHead className="text-right">&gt;90 дней, ₽</TableHead>
                    <TableHead className="text-right font-semibold">Итого, ₽</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {AGING_DATA.map(row => {
                    const total = row.d30 + row.d60 + row.d90 + row.d90p;
                    return (
                      <TableRow key={row.client} className="hover:bg-muted/40">
                        <TableCell className="text-sm">{row.client}</TableCell>
                        <TableCell className="text-right text-sm">{row.d30 ? fmt(row.d30) : '—'}</TableCell>
                        <TableCell className={`text-right text-sm ${row.d60 ? 'text-amber-600' : ''}`}>{row.d60 ? fmt(row.d60) : '—'}</TableCell>
                        <TableCell className={`text-right text-sm ${row.d90 ? 'text-orange-600' : ''}`}>{row.d90 ? fmt(row.d90) : '—'}</TableCell>
                        <TableCell className={`text-right text-sm ${row.d90p ? 'text-red-600 font-medium' : ''}`}>{row.d90p ? fmt(row.d90p) : '—'}</TableCell>
                        <TableCell className="text-right text-sm font-semibold">{fmt(total)}</TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell>Итого</TableCell>
                    <TableCell className="text-right">{fmt(AGING_DATA.reduce((s, r) => s + r.d30, 0))}</TableCell>
                    <TableCell className="text-right text-amber-600">{fmt(AGING_DATA.reduce((s, r) => s + r.d60, 0))}</TableCell>
                    <TableCell className="text-right text-orange-600">{fmt(AGING_DATA.reduce((s, r) => s + r.d90, 0))}</TableCell>
                    <TableCell className="text-right text-red-600">{fmt(AGING_DATA.reduce((s, r) => s + r.d90p, 0))}</TableCell>
                    <TableCell className="text-right">{fmt(AGING_DATA.reduce((s, r) => s + r.d30 + r.d60 + r.d90 + r.d90p, 0))}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateInvoiceDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
