import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner';

// ─── Types ─────────────────────────────────────────────────────────────────────

type RequestStatus =
  | 'new'
  | 'in_progress'
  | 'ordered'
  | 'in_transit'
  | 'received'
  | 'transferred';

interface RequestItem {
  id: string;
  article: string;
  name: string;
  qty: number;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  status: 'new' | 'ordered' | 'in_transit' | 'received' | 'transferred';
  category: string;
}

interface PurchaseRequest {
  id: string;
  number: string;
  workOrder: string;
  client: string;
  shortName: string;
  supplier: string;
  status: RequestStatus;
  totalCost: number;
  createdAt: string;
  items: RequestItem[];
}

// ─── Static data ───────────────────────────────────────────────────────────────


const REQUESTS: PurchaseRequest[] = [
  { id: '1', number: 'ЗИП-2026-0041', workOrder: 'WO-2026-000318', client: 'ООО «Альфа Трейд»', shortName: 'Компрессор Daikin FTXM25', supplier: 'КлиматТех', status: 'in_transit', totalCost: 28500, createdAt: '12.05.2026',
    items: [
      { id: 'i1', article: 'DK-COMP-25M', name: 'Компрессор Daikin FTXM25', qty: 1, unit: 'шт', purchasePrice: 22000, salePrice: 28600, status: 'in_transit', category: 'Компрессоры' },
      { id: 'i2', article: 'DK-VALVE-R32', name: 'Клапан расширительный R32', qty: 2, unit: 'шт', purchasePrice: 1800, salePrice: 2340, status: 'ordered', category: 'Клапаны' },
    ] },
  { id: '2', number: 'ЗИП-2026-0040', workOrder: 'WO-2026-000315', client: 'ТЦ «Меркурий»', shortName: 'Плата управления Mitsubishi', supplier: 'ТехноСнаб', status: 'ordered', totalCost: 15200, createdAt: '11.05.2026',
    items: [{ id: 'i3', article: 'MSZ-PCB-GE25', name: 'Плата управления MSZ-GE25VA', qty: 1, unit: 'шт', purchasePrice: 11800, salePrice: 15340, status: 'ordered', category: 'Электроника' }] },
  { id: '3', number: 'ЗИП-2026-0039', workOrder: 'WO-2026-000312', client: 'ИП Смирнов А.В.', shortName: 'Вентилятор наружного блока', supplier: 'АрктикПарт', status: 'received', totalCost: 6800, createdAt: '10.05.2026',
    items: [
      { id: 'i4', article: 'FAN-OUT-35W', name: 'Вентилятор наружного блока 35Вт', qty: 1, unit: 'шт', purchasePrice: 4500, salePrice: 5850, status: 'received', category: 'Вентиляторы' },
      { id: 'i5', article: 'CAP-35UF', name: 'Конденсатор пусковой 35мкФ', qty: 3, unit: 'шт', purchasePrice: 320, salePrice: 416, status: 'received', category: 'Электроника' },
    ] },
  { id: '4', number: 'ЗИП-2026-0038', workOrder: 'WO-2026-000309', client: 'Бизнес-центр «Гранит»', shortName: 'Теплообменник Samsung', supplier: 'КлиматТех', status: 'in_progress', totalCost: 42000, createdAt: '09.05.2026',
    items: [
      { id: 'i6', article: 'SAM-HX-AR12', name: 'Теплообменник испарителя AR12', qty: 1, unit: 'шт', purchasePrice: 32000, salePrice: 41600, status: 'ordered', category: 'Теплообменники' },
      { id: 'i7', article: 'SAM-COIL-GL', name: 'Уплотнительная прокладка', qty: 5, unit: 'шт', purchasePrice: 80, salePrice: 104, status: 'new', category: 'Расходники' },
    ] },
  { id: '5', number: 'ЗИП-2026-0037', workOrder: 'WO-2026-000306', client: 'Ресторан «Маяк»', shortName: 'Инверторный модуль LG', supplier: 'ПрофКлимат', status: 'transferred', totalCost: 19500, createdAt: '08.05.2026',
    items: [{ id: 'i8', article: 'LG-INV-A12', name: 'Инверторный модуль A12LHR', qty: 1, unit: 'шт', purchasePrice: 15000, salePrice: 19500, status: 'transferred', category: 'Электроника' }] },
  { id: '6', number: 'ЗИП-2026-0036', workOrder: 'WO-2026-000301', client: 'Аптека «Здоровье»', shortName: 'Дренажный насос ASPEN', supplier: 'ТехноСнаб', status: 'new', totalCost: 4200, createdAt: '07.05.2026',
    items: [{ id: 'i9', article: 'ASP-MINI-12', name: 'Дренажный насос ASPEN Mini', qty: 2, unit: 'шт', purchasePrice: 1600, salePrice: 2080, status: 'new', category: 'Насосы' }] },
  { id: '7', number: 'ЗИП-2026-0035', workOrder: 'WO-2026-000298', client: 'ООО «Логистик Про»', shortName: 'Хладагент R410A 10кг', supplier: 'АрктикПарт', status: 'received', totalCost: 8900, createdAt: '06.05.2026',
    items: [{ id: 'i10', article: 'R410A-10KG', name: 'Хладагент R410A 10кг', qty: 2, unit: 'бал.', purchasePrice: 3800, salePrice: 4940, status: 'received', category: 'Хладагенты' }] },
  { id: '8', number: 'ЗИП-2026-0034', workOrder: 'WO-2026-000295', client: 'ФитнесКлуб «Энергия»', shortName: 'Блок питания Panasonic CS-E12', supplier: 'КлиматТех', status: 'in_transit', totalCost: 11300, createdAt: '05.05.2026',
    items: [{ id: 'i11', article: 'PAN-PSU-CS12', name: 'Блок питания CS-E12', qty: 1, unit: 'шт', purchasePrice: 8700, salePrice: 11310, status: 'in_transit', category: 'Электроника' }] },
  { id: '9', number: 'ЗИП-2026-0033', workOrder: 'WO-2026-000290', client: 'Стоматология «Дент»', shortName: 'Реле давления Ranco P017-5', supplier: 'ПрофКлимат', status: 'in_progress', totalCost: 3600, createdAt: '04.05.2026',
    items: [{ id: 'i12', article: 'RNC-P017-5', name: 'Реле давления Ranco P017-5', qty: 2, unit: 'шт', purchasePrice: 1400, salePrice: 1820, status: 'ordered', category: 'Автоматика' }] },
  { id: '10', number: 'ЗИП-2026-0032', workOrder: 'WO-2026-000287', client: 'Отель «Приморский»', shortName: 'Датчик температуры NTC 10кОм', supplier: 'ТехноСнаб', status: 'ordered', totalCost: 2100, createdAt: '03.05.2026',
    items: [{ id: 'i13', article: 'NTC-10K-B', name: 'Датчик температуры NTC 10кОм', qty: 6, unit: 'шт', purchasePrice: 230, salePrice: 299, status: 'ordered', category: 'Датчики' }] },
  { id: '11', number: 'ЗИП-2026-0031', workOrder: 'WO-2026-000284', client: 'Магазин «Электра»', shortName: 'Мотор вентилятора Haier', supplier: 'АрктикПарт', status: 'new', totalCost: 5400, createdAt: '02.05.2026',
    items: [{ id: 'i14', article: 'HAI-MOT-15W', name: 'Мотор вентилятора внутр. блока', qty: 1, unit: 'шт', purchasePrice: 4150, salePrice: 5395, status: 'new', category: 'Вентиляторы' }] },
  { id: '12', number: 'ЗИП-2026-0030', workOrder: 'WO-2026-000280', client: 'Банк «Восток»', shortName: 'Фильтр-осушитель MSV 083', supplier: 'КлиматТех', status: 'transferred', totalCost: 3200, createdAt: '01.05.2026',
    items: [{ id: 'i15', article: 'MSV-FD-083', name: 'Фильтр-осушитель MSV 083', qty: 4, unit: 'шт', purchasePrice: 620, salePrice: 806, status: 'transferred', category: 'Расходники' }] },
  { id: '13', number: 'ЗИП-2026-0029', workOrder: 'WO-2026-000277', client: 'ООО «СтройГрупп»', shortName: 'Термостат Danfoss RA 2994', supplier: 'ПрофКлимат', status: 'in_transit', totalCost: 7800, createdAt: '30.04.2026',
    items: [{ id: 'i16', article: 'DAN-RA-2994', name: 'Термостат Danfoss RA 2994', qty: 3, unit: 'шт', purchasePrice: 2000, salePrice: 2600, status: 'in_transit', category: 'Автоматика' }] },
  { id: '14', number: 'ЗИП-2026-0028', workOrder: 'WO-2026-000274', client: 'Кафе «Бриз»', shortName: 'Шаровый кран 3/4 латунь', supplier: 'ТехноСнаб', status: 'received', totalCost: 1800, createdAt: '29.04.2026',
    items: [{ id: 'i17', article: 'BALL-34-BR', name: 'Шаровый кран 3/4 латунь', qty: 4, unit: 'шт', purchasePrice: 340, salePrice: 442, status: 'received', category: 'Арматура' }] },
  { id: '15', number: 'ЗИП-2026-0027', workOrder: 'WO-2026-000271', client: 'Клиника «МедПлюс»', shortName: 'Пульт ДУ Gree YAA1F', supplier: 'АрктикПарт', status: 'in_progress', totalCost: 3900, createdAt: '28.04.2026',
    items: [{ id: 'i18', article: 'GRE-RC-YAA1', name: 'Пульт ДУ Gree YAA1F', qty: 2, unit: 'шт', purchasePrice: 1500, salePrice: 1950, status: 'ordered', category: 'Электроника' }] },
];

const SUPPLIER_CHART_DATA = [
  { name: 'КлиматТех', sum: 85000, count: 4 },
  { name: 'ТехноСнаб', sum: 62000, count: 5 },
  { name: 'АрктикПарт', sum: 48000, count: 4 },
  { name: 'ПрофКлимат', sum: 37000, count: 3 },
  { name: 'СнабЭксперт', sum: 24000, count: 2 },
  { name: 'МегаКлимат', sum: 18000, count: 2 },
];

const MONTHLY_DYNAMICS = [
  { month: 'Дек 25', sum: 145000, count: 28 },
  { month: 'Янв 26', sum: 98000, count: 19 },
  { month: 'Фев 26', sum: 112000, count: 22 },
  { month: 'Мар 26', sum: 178000, count: 34 },
  { month: 'Апр 26', sum: 221000, count: 41 },
  { month: 'Май 26', sum: 189000, count: 36 },
];

const ALL_ITEMS: (RequestItem & { requestNumber: string; supplier: string })[] =
  REQUESTS.flatMap((r) =>
    r.items.map((item) => ({
      ...item,
      requestNumber: r.number,
      supplier: r.supplier,
    }))
  );

// ─── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  v.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });

const STATUS_LABEL: Record<RequestStatus, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  ordered: 'Заказано',
  in_transit: 'В пути',
  received: 'Получено',
  transferred: 'Передано',
};

const STATUS_COLOR: Record<RequestStatus, string> = {
  new: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-100 text-blue-700',
  ordered: 'bg-yellow-100 text-yellow-800',
  in_transit: 'bg-orange-100 text-orange-700',
  received: 'bg-green-100 text-green-700',
  transferred: 'bg-purple-100 text-purple-700',
};

const ITEM_STATUS_LABEL: Record<RequestItem['status'], string> = {
  new: 'Новая',
  ordered: 'Заказано',
  in_transit: 'В пути',
  received: 'Получено',
  transferred: 'Передано',
};

const SUPPLIERS = ['Все', 'КлиматТех', 'ТехноСнаб', 'АрктикПарт', 'ПрофКлимат'];
const WORK_ORDERS = [
  'WO-2026-000318',
  'WO-2026-000315',
  'WO-2026-000312',
  'WO-2026-000309',
];

// ─── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-5 pb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon name={icon as never} className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLOR[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

// ─── Detail Panel ──────────────────────────────────────────────────────────────

function DetailPanel({ req, onClose }: { req: PurchaseRequest; onClose: () => void }) {
  const [itemStatus, setItemStatus] = useState<RequestStatus>(req.status);

  return (
    <div className="flex flex-col h-full border-l bg-white overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <p className="font-semibold text-base">{req.number}</p>
          <p className="text-xs text-muted-foreground">{req.workOrder} · {req.client}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={req.status} />
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Поставщик:</span>
            <p className="font-medium">{req.supplier}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Создана:</span>
            <p className="font-medium">{req.createdAt}</p>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Итого:</span>
            <p className="font-semibold text-green-700">{fmt(req.totalCost)}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold mb-2">Позиции заявки</p>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-2">Артикул / Наименование</th>
                  <th className="text-right p-2">Кол-во</th>
                  <th className="text-right p-2">Цена</th>
                  <th className="text-center p-2">Статус</th>
                </tr>
              </thead>
              <tbody>
                {req.items.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-muted/30">
                    <td className="p-2">
                      <p className="text-muted-foreground">{item.article}</p>
                      <p>{item.name}</p>
                    </td>
                    <td className="p-2 text-right">{item.qty} {item.unit}</td>
                    <td className="p-2 text-right">{fmt(item.purchasePrice)}</td>
                    <td className="p-2 text-center">
                      <span className="text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {ITEM_STATUS_LABEL[item.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">Обновить статус</p>
          <div className="flex gap-2">
            <Select
              value={itemStatus}
              onValueChange={(v) => setItemStatus(v as RequestStatus)}
            >
              <SelectTrigger className="flex-1 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(STATUS_LABEL) as RequestStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={() => toast.success(`Статус заявки ${req.number} обновлён`)}
            >
              Сохранить
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 border-t space-y-2">
        <Button
          className="w-full"
          onClick={() =>
            toast.success(`Заявка ${req.number} отправлена поставщику ${req.supplier}`)
          }
        >
          <Icon name="Send" className="w-4 h-4 mr-2" />
          Заказать у поставщика
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() =>
            toast.success(`Заявка на оплату по ${req.number} создана`)
          }
        >
          <Icon name="CreditCard" className="w-4 h-4 mr-2" />
          Создать заявку на оплату
        </Button>
      </div>
    </div>
  );
}

// ─── New Request Dialog ────────────────────────────────────────────────────────

function NewRequestDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    workOrder: '',
    supplier: '',
    name: '',
    qty: '',
    price: '',
    comment: '',
  });

  const handleSubmit = () => {
    if (!form.workOrder || !form.name || !form.qty) {
      toast.error('Заполните обязательные поля');
      return;
    }
    toast.success('Заявка на ЗИП создана успешно');
    onClose();
    setForm({ workOrder: '', supplier: '', name: '', qty: '', price: '', comment: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Новая заявка на ЗИП</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <label className="text-sm font-medium mb-1 block">Наряд *</label>
            <Select value={form.workOrder} onValueChange={(v) => setForm({ ...form, workOrder: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите наряд" />
              </SelectTrigger>
              <SelectContent>
                {WORK_ORDERS.map((wo) => (
                  <SelectItem key={wo} value={wo}>{wo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Поставщик</label>
            <Select value={form.supplier} onValueChange={(v) => setForm({ ...form, supplier: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите поставщика" />
              </SelectTrigger>
              <SelectContent>
                {SUPPLIERS.filter((s) => s !== 'Все').map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Наименование *</label>
            <Input
              placeholder="Наименование запчасти / материала"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Кол-во *</label>
              <Input
                type="number"
                placeholder="1"
                value={form.qty}
                onChange={(e) => setForm({ ...form, qty: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Цена (₽)</label>
              <Input
                type="number"
                placeholder="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Комментарий</label>
            <Input
              placeholder="Дополнительные сведения..."
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
            />
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

// ─── Main Component ────────────────────────────────────────────────────────────

export default function PurchaseOrderFull() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSupplier, setFilterSupplier] = useState('Все');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemFilterStatus, setItemFilterStatus] = useState('all');
  const [itemFilterCategory, setItemFilterCategory] = useState('Все');

  const selectedReq = REQUESTS.find((r) => r.id === selectedId) ?? null;

  const filtered = REQUESTS.filter((r) => {
    const matchSearch =
      !search ||
      r.number.toLowerCase().includes(search.toLowerCase()) ||
      r.client.toLowerCase().includes(search.toLowerCase()) ||
      r.shortName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchSupplier = filterSupplier === 'Все' || r.supplier === filterSupplier;
    return matchSearch && matchStatus && matchSupplier;
  });

  const inWork = REQUESTS.filter((r) =>
    ['new', 'in_progress', 'ordered'].includes(r.status)
  ).length;
  const inTransit = REQUESTS.filter((r) => r.status === 'in_transit').length;
  const approvalCount = REQUESTS.filter((r) => r.status === 'in_progress').length;
  const totalSum = REQUESTS.reduce((acc, r) => acc + r.totalCost, 0);

  const categories = ['Все', ...Array.from(new Set(ALL_ITEMS.map((i) => i.category)))];

  const filteredItems = ALL_ITEMS.filter((item) => {
    const matchStatus = itemFilterStatus === 'all' || item.status === itemFilterStatus;
    const matchCat = itemFilterCategory === 'Все' || item.category === itemFilterCategory;
    return matchStatus && matchCat;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-white flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Закупки / Заявки на ЗИП</h1>
          <p className="text-sm text-muted-foreground">Управление запасными частями и материалами</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Icon name="Plus" className="w-4 h-4 mr-2" />
          Новая заявка
        </Button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4">
        <KpiCard label="Заявок в работе" value={String(inWork)} icon="ClipboardList" color="bg-blue-500" />
        <KpiCard label="На согласовании" value={String(approvalCount)} icon="Clock" color="bg-yellow-500" />
        <KpiCard label="Ожидают поставки" value={String(inTransit)} icon="Truck" color="bg-orange-500" />
        <KpiCard label="Сумма (всего)" value={fmt(totalSum)} icon="Wallet" color="bg-green-600" />
      </div>

      {/* Tabs */}
      <div className="flex-1 px-6 pb-6 min-h-0">
        <Tabs defaultValue="requests" className="h-full flex flex-col">
          <TabsList className="mb-4 w-fit">
            <TabsTrigger value="requests">Заявки</TabsTrigger>
            <TabsTrigger value="items">Позиции</TabsTrigger>
            <TabsTrigger value="analytics">Аналитика</TabsTrigger>
          </TabsList>

          {/* ── Tab: Заявки ── */}
          <TabsContent value="requests" className="flex-1 flex gap-4 min-h-0">
            <div className={`flex flex-col flex-1 min-w-0 ${selectedReq ? 'max-w-[60%]' : ''}`}>
              {/* Filters */}
              <div className="flex gap-3 mb-3">
                <div className="relative flex-1 max-w-sm">
                  <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Поиск по №, клиенту, наименованию..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    {(Object.keys(STATUS_LABEL) as RequestStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterSupplier} onValueChange={setFilterSupplier}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPLIERS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <Card className="flex-1 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>№ Заявки</TableHead>
                      <TableHead>Наряд</TableHead>
                      <TableHead>Клиент</TableHead>
                      <TableHead>Наименование</TableHead>
                      <TableHead>Поставщик</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead className="text-right">Стоимость</TableHead>
                      <TableHead>Дата</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((req) => (
                      <TableRow
                        key={req.id}
                        className={`cursor-pointer hover:bg-muted/50 ${selectedId === req.id ? 'bg-blue-50' : ''}`}
                        onClick={() => setSelectedId(selectedId === req.id ? null : req.id)}
                      >
                        <TableCell className="font-mono text-xs font-medium">{req.number}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{req.workOrder}</TableCell>
                        <TableCell className="text-sm max-w-[140px] truncate">{req.client}</TableCell>
                        <TableCell className="text-sm max-w-[140px] truncate">{req.shortName}</TableCell>
                        <TableCell className="text-sm">{req.supplier}</TableCell>
                        <TableCell><StatusBadge status={req.status} /></TableCell>
                        <TableCell className="text-right font-medium">{fmt(req.totalCost)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{req.createdAt}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Icon name="ChevronRight" className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                          Заявки не найдены
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>

            {/* Detail panel */}
            {selectedReq && (
              <div className="w-[40%] flex-shrink-0 rounded-lg border overflow-hidden">
                <DetailPanel req={selectedReq} onClose={() => setSelectedId(null)} />
              </div>
            )}
          </TabsContent>

          {/* ── Tab: Позиции ── */}
          <TabsContent value="items" className="flex-1 flex flex-col min-h-0">
            <div className="flex gap-3 mb-3">
              <Select value={itemFilterStatus} onValueChange={setItemFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Статус позиции" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  {(Object.keys(ITEM_STATUS_LABEL) as RequestItem['status'][]).map((s) => (
                    <SelectItem key={s} value={s}>{ITEM_STATUS_LABEL[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={itemFilterCategory} onValueChange={setItemFilterCategory}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="ml-auto text-sm text-muted-foreground self-center">
                {filteredItems.length} позиций
              </span>
            </div>
            <Card className="flex-1 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Артикул</TableHead>
                    <TableHead>Наименование</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Заявка</TableHead>
                    <TableHead>Поставщик</TableHead>
                    <TableHead className="text-right">Кол-во</TableHead>
                    <TableHead className="text-right">Цена закупки</TableHead>
                    <TableHead className="text-right">Цена продажи</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/40">
                      <TableCell className="font-mono text-xs">{item.article}</TableCell>
                      <TableCell className="text-sm">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{item.category}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.requestNumber}</TableCell>
                      <TableCell className="text-sm">{item.supplier}</TableCell>
                      <TableCell className="text-right">{item.qty} {item.unit}</TableCell>
                      <TableCell className="text-right text-sm">{fmt(item.purchasePrice)}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{fmt(item.salePrice)}</TableCell>
                      <TableCell>
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                          {ITEM_STATUS_LABEL[item.status]}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* ── Tab: Аналитика ── */}
          <TabsContent value="analytics" className="flex-1 grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Закупки по поставщикам (топ-6)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={SUPPLIER_CHART_DATA} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}к`} />
                    <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v: number) => fmt(v)} />
                    <Bar dataKey="sum" name="Сумма" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Динамика закупок за 6 месяцев</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={MONTHLY_DYNAMICS}>
                    <defs>
                      <linearGradient id="gradSum" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tickFormatter={(v) => `${(v / 1000).toFixed(0)}к`} />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip formatter={(v: number, name: string) => name === 'Сумма' ? fmt(v) : v} />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="sum" name="Сумма" stroke="#3b82f6" fill="url(#gradSum)" strokeWidth={2} />
                    <Area yAxisId="right" type="monotone" dataKey="count" name="Кол-во заявок" stroke="#10b981" fill="url(#gradCount)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <NewRequestDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
