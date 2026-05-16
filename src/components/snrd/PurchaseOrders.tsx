import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// ─────────────────────────── Types ───────────────────────────

type POStatus =
  | 'new'
  | 'approval'
  | 'ordered'
  | 'in_transit'
  | 'partial'
  | 'received';

type PaymentStatus = 'pending' | 'paid';

interface POLine {
  id: string;
  name: string;
  article: string;
  qty: number;
  unit: string;
  purchasePrice: number;
  markupPct: number;
  salePrice: number;
  total: number;
}

interface Supplier {
  name: string;
  phone: string;
  rating: number; // 1–5
  leadDays: number;
}

interface TrackingStep {
  label: string;
  done: boolean;
}

interface PurchaseOrder {
  id: string;
  number: string;
  date: string;
  workOrder: string;
  firstItem: string;
  linesCount: number;
  supplier: Supplier;
  amount: number;
  status: POStatus;
  deliveryDate: string;
  paymentStatus: PaymentStatus;
  trackingNumber?: string;
  tracking: TrackingStep[];
  lines: POLine[];
  overdue?: boolean;
}

// ─────────────────────────── Mock Data ───────────────────────────

const PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-01',
    number: 'PO-2026-001',
    date: '05.05.2026',
    workOrder: 'WO-2026-000038',
    firstItem: 'Компрессор Daikin JT160BCBY1E',
    linesCount: 3,
    supplier: { name: 'КлиматТехно', phone: '+7 (495) 123-45-67', rating: 5, leadDays: 5 },
    amount: 54300,
    status: 'in_transit',
    deliveryDate: '17.05.2026',
    paymentStatus: 'paid',
    trackingNumber: 'CDEK-89124567',
    tracking: [
      { label: 'Принят', done: true },
      { label: 'Сортировка', done: true },
      { label: 'В пути', done: true },
      { label: 'Доставлен', done: false },
    ],
    lines: [
      { id: 'l1', name: 'Компрессор Daikin JT160BCBY1E', article: 'COMP-DAI-35', qty: 1, unit: 'шт.', purchasePrice: 28500, markupPct: 30, salePrice: 37050, total: 28500 },
      { id: 'l2', name: 'Уплотнительное кольцо компрессора', article: 'SEAL-DAI-01', qty: 4, unit: 'шт.', purchasePrice: 180, markupPct: 50, salePrice: 270, total: 720 },
      { id: 'l3', name: 'Монтажный комплект Daikin', article: 'KIT-DAI-MNT', qty: 1, unit: 'компл.', purchasePrice: 2450, markupPct: 25, salePrice: 3062, total: 2450 },
    ],
  },
  {
    id: 'po-02',
    number: 'PO-2026-002',
    date: '06.05.2026',
    workOrder: 'WO-2026-000041',
    firstItem: 'Фреон R-410A (баллон 10 кг)',
    linesCount: 2,
    supplier: { name: 'ХладТехСнаб', phone: '+7 (812) 987-65-43', rating: 4, leadDays: 3 },
    amount: 13500,
    status: 'received',
    deliveryDate: '10.05.2026',
    paymentStatus: 'paid',
    trackingNumber: undefined,
    tracking: [
      { label: 'Принят', done: true },
      { label: 'Сортировка', done: true },
      { label: 'В пути', done: true },
      { label: 'Доставлен', done: true },
    ],
    lines: [
      { id: 'l4', name: 'Фреон R-410A (баллон 10 кг)', article: 'REF-R410A-10', qty: 3, unit: 'баллон', purchasePrice: 4200, markupPct: 20, salePrice: 5040, total: 12600 },
      { id: 'l5', name: 'Фильтр-осушитель 1/4"', article: 'DRYER-14', qty: 5, unit: 'шт.', purchasePrice: 180, markupPct: 40, salePrice: 252, total: 900 },
    ],
  },
  {
    id: 'po-03',
    number: 'PO-2026-003',
    date: '07.05.2026',
    workOrder: 'WO-2026-000051',
    firstItem: 'Плата управления Mitsubishi MSZ-LN35',
    linesCount: 1,
    supplier: { name: 'МитсубишиСервис', phone: '+7 (495) 555-11-22', rating: 5, leadDays: 7 },
    amount: 12800,
    status: 'ordered',
    deliveryDate: '20.05.2026',
    paymentStatus: 'pending',
    trackingNumber: 'SPSR-44219',
    tracking: [
      { label: 'Принят', done: true },
      { label: 'Сортировка', done: false },
      { label: 'В пути', done: false },
      { label: 'Доставлен', done: false },
    ],
    lines: [
      { id: 'l6', name: 'Плата управления Mitsubishi MSZ-LN35', article: 'BOARD-MIT-LN35', qty: 1, unit: 'шт.', purchasePrice: 12800, markupPct: 30, salePrice: 16640, total: 12800 },
    ],
  },
  {
    id: 'po-04',
    number: 'PO-2026-004',
    date: '07.05.2026',
    workOrder: 'WO-2026-000044',
    firstItem: 'Мотор вентилятора наружного блока 15W',
    linesCount: 2,
    supplier: { name: 'КлиматТехно', phone: '+7 (495) 123-45-67', rating: 5, leadDays: 5 },
    amount: 6750,
    status: 'new',
    deliveryDate: '22.05.2026',
    paymentStatus: 'pending',
    trackingNumber: undefined,
    tracking: [
      { label: 'Принят', done: false },
      { label: 'Сортировка', done: false },
      { label: 'В пути', done: false },
      { label: 'Доставлен', done: false },
    ],
    lines: [
      { id: 'l7', name: 'Мотор вентилятора наружного блока 15W', article: 'FAN-MTR-15W', qty: 3, unit: 'шт.', purchasePrice: 1450, markupPct: 40, salePrice: 2030, total: 4350 },
      { id: 'l8', name: 'Крыльчатка вентилятора ⌀300мм', article: 'FAN-BLD-300', qty: 3, unit: 'шт.', purchasePrice: 800, markupPct: 35, salePrice: 1080, total: 2400 },
    ],
  },
  {
    id: 'po-05',
    number: 'PO-2026-005',
    date: '08.05.2026',
    workOrder: 'WO-2026-000047',
    firstItem: 'HEPA-фильтр G4 для VRV-системы',
    linesCount: 4,
    supplier: { name: 'АэрофильтрПро', phone: '+7 (343) 222-33-44', rating: 3, leadDays: 10 },
    amount: 28400,
    status: 'approval',
    deliveryDate: '25.05.2026',
    paymentStatus: 'pending',
    trackingNumber: undefined,
    tracking: [
      { label: 'Принят', done: false },
      { label: 'Сортировка', done: false },
      { label: 'В пути', done: false },
      { label: 'Доставлен', done: false },
    ],
    overdue: false,
    lines: [
      { id: 'l9', name: 'HEPA-фильтр G4 600×600мм', article: 'HEPA-G4-600', qty: 6, unit: 'шт.', purchasePrice: 1800, markupPct: 25, salePrice: 2250, total: 10800 },
      { id: 'l10', name: 'HEPA-фильтр H13 500×500мм', article: 'HEPA-H13-500', qty: 4, unit: 'шт.', purchasePrice: 3200, markupPct: 25, salePrice: 4000, total: 12800 },
      { id: 'l11', name: 'Угольный фильтр 400×400мм', article: 'CARB-400', qty: 4, unit: 'шт.', purchasePrice: 650, markupPct: 30, salePrice: 845, total: 2600 },
      { id: 'l12', name: 'Рамка фильтродержатель', article: 'FRAME-400', qty: 4, unit: 'шт.', purchasePrice: 550, markupPct: 30, salePrice: 715, total: 2200 },
    ],
  },
  {
    id: 'po-06',
    number: 'PO-2026-006',
    date: '08.05.2026',
    workOrder: 'WO-2026-000049',
    firstItem: 'Медная трубка 1/4" (бухта 15 м)',
    linesCount: 3,
    supplier: { name: 'МедьПрофиль', phone: '+7 (861) 444-55-66', rating: 4, leadDays: 4 },
    amount: 9800,
    status: 'partial',
    deliveryDate: '14.05.2026',
    paymentStatus: 'paid',
    trackingNumber: 'DL-20261405-9981',
    tracking: [
      { label: 'Принят', done: true },
      { label: 'Сортировка', done: true },
      { label: 'В пути', done: true },
      { label: 'Доставлен', done: false },
    ],
    overdue: true,
    lines: [
      { id: 'l13', name: 'Медная трубка 1/4" (бухта 15 м)', article: 'CU-14-15M', qty: 5, unit: 'бухта', purchasePrice: 980, markupPct: 30, salePrice: 1274, total: 4900 },
      { id: 'l14', name: 'Медная трубка 3/8" (бухта 15 м)', article: 'CU-38-15M', qty: 3, unit: 'бухта', purchasePrice: 1250, markupPct: 30, salePrice: 1625, total: 3750 },
      { id: 'l15', name: 'Теплоизоляция каучуковая 13мм', article: 'INS-13MM', qty: 5, unit: 'м', purchasePrice: 230, markupPct: 20, salePrice: 276, total: 1150 },
    ],
  },
  {
    id: 'po-07',
    number: 'PO-2026-007',
    date: '09.05.2026',
    workOrder: 'WO-2026-000052',
    firstItem: 'Инвертор питания Daikin EKRP1AHTA',
    linesCount: 1,
    supplier: { name: 'ДайкинОфициал', phone: '+7 (495) 700-00-01', rating: 5, leadDays: 14 },
    amount: 34500,
    status: 'approval',
    deliveryDate: '30.05.2026',
    paymentStatus: 'pending',
    trackingNumber: undefined,
    tracking: [
      { label: 'Принят', done: false },
      { label: 'Сортировка', done: false },
      { label: 'В пути', done: false },
      { label: 'Доставлен', done: false },
    ],
    lines: [
      { id: 'l16', name: 'Инвертор питания Daikin EKRP1AHTA', article: 'INV-DAI-EKRP1', qty: 1, unit: 'шт.', purchasePrice: 34500, markupPct: 25, salePrice: 43125, total: 34500 },
    ],
  },
  {
    id: 'po-08',
    number: 'PO-2026-008',
    date: '09.05.2026',
    workOrder: 'WO-2026-000045',
    firstItem: 'Конденсатор пусковой 45 мкФ',
    linesCount: 2,
    supplier: { name: 'ЭлектроСнаб', phone: '+7 (383) 300-10-20', rating: 4, leadDays: 3 },
    amount: 2160,
    status: 'received',
    deliveryDate: '12.05.2026',
    paymentStatus: 'paid',
    trackingNumber: undefined,
    tracking: [
      { label: 'Принят', done: true },
      { label: 'Сортировка', done: true },
      { label: 'В пути', done: true },
      { label: 'Доставлен', done: true },
    ],
    lines: [
      { id: 'l17', name: 'Конденсатор пусковой 45 мкФ', article: 'CAP-RUN-45UF', qty: 3, unit: 'шт.', purchasePrice: 580, markupPct: 50, salePrice: 870, total: 1740 },
      { id: 'l18', name: 'Конденсатор пусковой 35 мкФ', article: 'CAP-RUN-35UF', qty: 3, unit: 'шт.', purchasePrice: 420, markupPct: 50, salePrice: 630, total: 1260 },
    ],
  },
  {
    id: 'po-09',
    number: 'PO-2026-009',
    date: '10.05.2026',
    workOrder: 'WO-2026-000053',
    firstItem: 'Фреон R-32 (баллон 10 кг)',
    linesCount: 2,
    supplier: { name: 'ФреоноСнаб', phone: '+7 (499) 877-66-55', rating: 4, leadDays: 5 },
    amount: 17600,
    status: 'ordered',
    deliveryDate: '19.05.2026',
    paymentStatus: 'pending',
    trackingNumber: 'CDEK-91200011',
    tracking: [
      { label: 'Принят', done: true },
      { label: 'Сортировка', done: true },
      { label: 'В пути', done: false },
      { label: 'Доставлен', done: false },
    ],
    lines: [
      { id: 'l19', name: 'Фреон R-32 (баллон 10 кг)', article: 'REF-R32-10', qty: 4, unit: 'баллон', purchasePrice: 4000, markupPct: 20, salePrice: 4800, total: 16000 },
      { id: 'l20', name: 'Фреон R-22 (баллон 13,6 кг)', article: 'REF-R22-13', qty: 1, unit: 'баллон', purchasePrice: 1600, markupPct: 20, salePrice: 1920, total: 1600 },
    ],
  },
  {
    id: 'po-10',
    number: 'PO-2026-010',
    date: '11.05.2026',
    workOrder: 'WO-2026-000054',
    firstItem: '4-ходовой клапан Daikin 6322510',
    linesCount: 2,
    supplier: { name: 'ДайкинОфициал', phone: '+7 (495) 700-00-01', rating: 5, leadDays: 7 },
    amount: 9400,
    status: 'in_transit',
    deliveryDate: '19.05.2026',
    paymentStatus: 'paid',
    trackingNumber: 'SPSR-78812',
    tracking: [
      { label: 'Принят', done: true },
      { label: 'Сортировка', done: true },
      { label: 'В пути', done: true },
      { label: 'Доставлен', done: false },
    ],
    lines: [
      { id: 'l21', name: '4-ходовой клапан Daikin 6322510', article: 'VALVE-4W-DAI', qty: 1, unit: 'шт.', purchasePrice: 5600, markupPct: 30, salePrice: 7280, total: 5600 },
      { id: 'l22', name: 'Катушка 4-ходового клапана', article: 'COIL-4W-DAI', qty: 2, unit: 'шт.', purchasePrice: 1900, markupPct: 30, salePrice: 2470, total: 3800 },
    ],
  },
  {
    id: 'po-11',
    number: 'PO-2026-011',
    date: '12.05.2026',
    workOrder: 'WO-2026-000055',
    firstItem: 'Термостатический расширительный вентиль',
    linesCount: 3,
    supplier: { name: 'ХладАрматура', phone: '+7 (831) 200-30-40', rating: 3, leadDays: 8 },
    amount: 18750,
    status: 'approval',
    deliveryDate: '24.05.2026',
    paymentStatus: 'pending',
    trackingNumber: undefined,
    tracking: [
      { label: 'Принят', done: false },
      { label: 'Сортировка', done: false },
      { label: 'В пути', done: false },
      { label: 'Доставлен', done: false },
    ],
    overdue: true,
    lines: [
      { id: 'l23', name: 'ТРВ Danfoss T2 (R410A)', article: 'TRV-DAN-T2', qty: 2, unit: 'шт.', purchasePrice: 4200, markupPct: 35, salePrice: 5670, total: 8400 },
      { id: 'l24', name: 'Обратный клапан 1/2"', article: 'CHECK-VALVE-12', qty: 4, unit: 'шт.', purchasePrice: 850, markupPct: 40, salePrice: 1190, total: 3400 },
      { id: 'l25', name: 'Сервисный клапан 3/8"', article: 'SRV-VALVE-38', qty: 6, unit: 'шт.', purchasePrice: 660, markupPct: 35, salePrice: 891, total: 3960 },
    ],
  },
  {
    id: 'po-12',
    number: 'PO-2026-012',
    date: '13.05.2026',
    workOrder: 'WO-2026-000056',
    firstItem: 'Плата управления Daikin BRZH10A523',
    linesCount: 2,
    supplier: { name: 'ДайкинОфициал', phone: '+7 (495) 700-00-01', rating: 5, leadDays: 10 },
    amount: 41200,
    status: 'new',
    deliveryDate: '27.05.2026',
    paymentStatus: 'pending',
    trackingNumber: undefined,
    tracking: [
      { label: 'Принят', done: false },
      { label: 'Сортировка', done: false },
      { label: 'В пути', done: false },
      { label: 'Доставлен', done: false },
    ],
    lines: [
      { id: 'l26', name: 'Плата управления Daikin BRZH10A523', article: 'BOARD-DAI-BRZ', qty: 1, unit: 'шт.', purchasePrice: 38500, markupPct: 20, salePrice: 46200, total: 38500 },
      { id: 'l27', name: 'Предохранитель 6.3A (набор 10 шт.)', article: 'FUSE-63A-10', qty: 3, unit: 'уп.', purchasePrice: 900, markupPct: 40, salePrice: 1260, total: 2700 },
    ],
  },
];

// Analytics mock data
const MONTHLY_DATA = [
  { month: 'Июн\'25', amount: 124000, orders: 8 },
  { month: 'Июл\'25', amount: 98000, orders: 6 },
  { month: 'Авг\'25', amount: 156000, orders: 11 },
  { month: 'Сен\'25', amount: 187000, orders: 13 },
  { month: 'Окт\'25', amount: 211000, orders: 15 },
  { month: 'Ноя\'25', amount: 178000, orders: 12 },
  { month: 'Дек\'25', amount: 243000, orders: 18 },
  { month: 'Янв\'26', amount: 132000, orders: 9 },
  { month: 'Фев\'26', amount: 198000, orders: 14 },
  { month: 'Мар\'26', amount: 267000, orders: 19 },
  { month: 'Апр\'26', amount: 312000, orders: 22 },
  { month: 'Май\'26', amount: 248960, orders: 17 },
];

const TOP_SUPPLIERS = [
  { name: 'ДайкинОфициал', orders: 28, amount: 1247000, rating: 5 },
  { name: 'КлиматТехно', orders: 21, amount: 892000, rating: 5 },
  { name: 'МитсубишиСервис', orders: 17, amount: 654000, rating: 5 },
  { name: 'ХладТехСнаб', orders: 14, amount: 423000, rating: 4 },
  { name: 'ЭлектроСнаб', orders: 12, amount: 318000, rating: 4 },
];

const WORK_ORDERS_LIST = [
  'WO-2026-000038', 'WO-2026-000041', 'WO-2026-000044',
  'WO-2026-000047', 'WO-2026-000049', 'WO-2026-000051',
  'WO-2026-000052', 'WO-2026-000053', 'WO-2026-000054',
  'WO-2026-000055', 'WO-2026-000056',
];

const SUPPLIERS_LIST = [
  'КлиматТехно', 'ХладТехСнаб', 'МитсубишиСервис', 'ДайкинОфициал',
  'ЭлектроСнаб', 'АэрофильтрПро', 'МедьПрофиль', 'ФреоноСнаб',
  'ХладАрматура', 'ХладАрматура',
];

// ─────────────────────────── Status Config ───────────────────────────

const STATUS_CFG: Record<POStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; color: string }> = {
  new: { label: 'Новая', variant: 'secondary', color: 'text-gray-600 bg-gray-100' },
  approval: { label: 'На согласовании', variant: 'outline', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  ordered: { label: 'Заказана', variant: 'default', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  in_transit: { label: 'В пути', variant: 'default', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  partial: { label: 'Частично получена', variant: 'outline', color: 'text-orange-700 bg-orange-50 border-orange-200' },
  received: { label: 'Получена', variant: 'default', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
};

// ─────────────────────────── Helpers ───────────────────────────

const fmt = (n: number) => n.toLocaleString('ru-RU');

const StarRating = ({ rating }: { rating: number }) => (
  <span className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Icon key={i} name="Star" size={12}
        className={i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
    ))}
  </span>
);

// ─────────────────────────── New Order Modal ───────────────────────────

interface NewOrderModalProps { onClose: () => void; onSave: (po: PurchaseOrder) => void; }

interface NewLine { name: string; article: string; qty: number; unit: string; purchasePrice: string; markupPct: number; }

const emptyLine = (): NewLine => ({ name: '', article: '', qty: 1, unit: 'шт.', purchasePrice: '', markupPct: 30 });

const NewOrderModal = ({ onClose, onSave }: NewOrderModalProps) => {
  const [workOrder, setWorkOrder] = useState(WORK_ORDERS_LIST[0]);
  const [supplier, setSupplier] = useState(SUPPLIERS_LIST[0]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [lines, setLines] = useState<NewLine[]>([emptyLine()]);

  const updateLine = (idx: number, field: keyof NewLine, value: string | number) => {
    setLines(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));
  };

  const handleSave = () => {
    const validLines = lines.filter(l => l.name && l.purchasePrice);
    if (!validLines.length) { toast.error('Добавьте хотя бы одну позицию'); return; }
    if (!deliveryDate) { toast.error('Укажите срок поставки'); return; }

    const now = new Date();
    const dateStr = now.toLocaleDateString('ru-RU');
    const seqNum = String(Date.now()).slice(-3);

    const poLines: POLine[] = validLines.map((l, i) => {
      const pp = parseFloat(l.purchasePrice) || 0;
      const sp = pp * (1 + l.markupPct / 100);
      return { id: `new-l${i}`, name: l.name, article: l.article || '—', qty: l.qty, unit: l.unit, purchasePrice: pp, markupPct: l.markupPct, salePrice: sp, total: pp * l.qty };
    });

    const total = poLines.reduce((s, l) => s + l.total, 0);
    const supplierObj = { name: supplier, phone: '—', rating: 4, leadDays: 5 };

    const po: PurchaseOrder = {
      id: `po-new-${seqNum}`,
      number: `PO-2026-${seqNum}`,
      date: dateStr,
      workOrder,
      firstItem: poLines[0].name,
      linesCount: poLines.length,
      supplier: supplierObj,
      amount: total,
      status: 'new',
      deliveryDate,
      paymentStatus: 'pending',
      tracking: [
        { label: 'Принят', done: false },
        { label: 'Сортировка', done: false },
        { label: 'В пути', done: false },
        { label: 'Доставлен', done: false },
      ],
      lines: poLines,
    };
    onSave(po);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Новая заявка на закупку</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Header fields */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Связанный наряд</label>
              <select value={workOrder} onChange={e => setWorkOrder(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                {WORK_ORDERS_LIST.map(wo => <option key={wo}>{wo}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Поставщик</label>
              <select value={supplier} onChange={e => setSupplier(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                {SUPPLIERS_LIST.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Срок поставки</label>
              <Input type="text" placeholder="дд.мм.гггг" value={deliveryDate}
                onChange={e => setDeliveryDate(e.target.value)} />
            </div>
          </div>

          {/* Lines */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-600">Позиции заявки</label>
              <Button size="sm" variant="outline" onClick={() => setLines(prev => [...prev, emptyLine()])}>
                <Icon name="Plus" size={12} className="mr-1" /> Добавить строку
              </Button>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 text-gray-500 font-medium w-1/3">Наименование</th>
                    <th className="text-left px-3 py-2 text-gray-500 font-medium">Артикул</th>
                    <th className="text-left px-3 py-2 text-gray-500 font-medium">Кол-во</th>
                    <th className="text-left px-3 py-2 text-gray-500 font-medium">Ед.</th>
                    <th className="text-left px-3 py-2 text-gray-500 font-medium">Цена закуп.</th>
                    <th className="text-left px-3 py-2 text-gray-500 font-medium">Наценка %</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lines.map((line, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-1.5">
                        <input className="w-full border-0 bg-transparent text-xs focus:outline-none"
                          placeholder="Наименование"
                          value={line.name} onChange={e => updateLine(idx, 'name', e.target.value)} />
                      </td>
                      <td className="px-3 py-1.5">
                        <input className="w-full border-0 bg-transparent text-xs focus:outline-none"
                          placeholder="SKU"
                          value={line.article} onChange={e => updateLine(idx, 'article', e.target.value)} />
                      </td>
                      <td className="px-3 py-1.5">
                        <input type="number" min={1} className="w-14 border-0 bg-transparent text-xs focus:outline-none"
                          value={line.qty} onChange={e => updateLine(idx, 'qty', +e.target.value)} />
                      </td>
                      <td className="px-3 py-1.5">
                        <input className="w-12 border-0 bg-transparent text-xs focus:outline-none"
                          value={line.unit} onChange={e => updateLine(idx, 'unit', e.target.value)} />
                      </td>
                      <td className="px-3 py-1.5">
                        <input type="number" className="w-20 border-0 bg-transparent text-xs focus:outline-none"
                          placeholder="0.00"
                          value={line.purchasePrice} onChange={e => updateLine(idx, 'purchasePrice', e.target.value)} />
                      </td>
                      <td className="px-3 py-1.5">
                        <input type="number" className="w-14 border-0 bg-transparent text-xs focus:outline-none"
                          value={line.markupPct} onChange={e => updateLine(idx, 'markupPct', +e.target.value)} />
                      </td>
                      <td className="px-3 py-1.5">
                        {lines.length > 1 && (
                          <button onClick={() => setLines(prev => prev.filter((_, i) => i !== idx))}
                            className="text-gray-400 hover:text-red-500">
                            <Icon name="Trash2" size={12} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total preview */}
          {lines.some(l => l.purchasePrice) && (
            <div className="text-right text-sm text-gray-600">
              Сумма закупки:{' '}
              <strong className="text-gray-900">
                {fmt(lines.reduce((s, l) => s + (parseFloat(l.purchasePrice) || 0) * l.qty, 0))} ₽
              </strong>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200">
          <Button onClick={handleSave}>
            <Icon name="Save" size={14} className="mr-2" /> Создать заявку
          </Button>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────── Detail Panel ───────────────────────────

const DetailPanel = ({ po, onClose, onMarkPaid }: { po: PurchaseOrder; onClose: () => void; onMarkPaid: (id: string) => void; }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg mt-1 mb-4 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span className="font-bold text-gray-900">{po.number}</span>
          <span className="text-gray-400 text-sm">·</span>
          <span className="text-sm text-gray-600">{po.workOrder}</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <Icon name="X" size={16} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 p-5">
        {/* Lines table */}
        <div className="col-span-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Позиции заявки</p>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2 text-gray-400 font-medium text-xs">Наименование</th>
                <th className="text-left px-3 py-2 text-gray-400 font-medium text-xs">Артикул</th>
                <th className="text-center px-3 py-2 text-gray-400 font-medium text-xs">Кол-во</th>
                <th className="text-right px-3 py-2 text-gray-400 font-medium text-xs">Цена закуп.</th>
                <th className="text-center px-3 py-2 text-gray-400 font-medium text-xs">Наценка</th>
                <th className="text-right px-3 py-2 text-gray-400 font-medium text-xs">Цена прод.</th>
                <th className="text-right px-3 py-2 text-gray-400 font-medium text-xs">Сумма</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {po.lines.map(line => (
                <tr key={line.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium text-gray-800 text-xs">{line.name}</td>
                  <td className="px-3 py-2 text-gray-500 text-xs font-mono">{line.article}</td>
                  <td className="px-3 py-2 text-center text-gray-700 text-xs">{line.qty} {line.unit}</td>
                  <td className="px-3 py-2 text-right text-gray-700 text-xs">{fmt(line.purchasePrice)} ₽</td>
                  <td className="px-3 py-2 text-center text-xs">
                    <span className="text-emerald-600 font-medium">+{line.markupPct}%</span>
                  </td>
                  <td className="px-3 py-2 text-right text-gray-900 text-xs font-medium">{fmt(line.salePrice)} ₽</td>
                  <td className="px-3 py-2 text-right text-gray-900 text-xs font-semibold">{fmt(line.total)} ₽</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-gray-200">
              <tr className="bg-gray-50">
                <td colSpan={6} className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Итого закупка:</td>
                <td className="px-3 py-2 text-right text-sm font-bold text-gray-900">{fmt(po.amount)} ₽</td>
              </tr>
            </tfoot>
          </table>

          {/* Tracking */}
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Трекинг доставки</p>
            {po.trackingNumber && (
              <p className="text-xs text-gray-500 mb-2">Трек-номер: <strong className="text-gray-800 font-mono">{po.trackingNumber}</strong></p>
            )}
            <div className="flex items-center gap-0">
              {po.tracking.map((step, idx) => (
                <div key={idx} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                      ${step.done ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                      {step.done ? <Icon name="Check" size={12} /> : idx + 1}
                    </div>
                    <span className={`text-xs mt-1 whitespace-nowrap ${step.done ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < po.tracking.length - 1 && (
                    <div className={`flex-1 h-0.5 mb-4 ${po.tracking[idx + 1].done ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Supplier + Payment */}
        <div className="space-y-4">
          {/* Supplier card */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Поставщик</p>
            <p className="font-semibold text-gray-900 text-sm mb-1">{po.supplier.name}</p>
            <StarRating rating={po.supplier.rating} />
            <div className="mt-2 space-y-1 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Icon name="Phone" size={11} className="text-gray-400" />
                <span>{po.supplier.phone}</span>
              </div>
              <div className="flex items-center gap-1">
                <Icon name="Clock" size={11} className="text-gray-400" />
                <span>Срок поставки: {po.supplier.leadDays} дн.</span>
              </div>
              <div className="flex items-center gap-1">
                <Icon name="Calendar" size={11} className="text-gray-400" />
                <span>Плановая: {po.deliveryDate}</span>
              </div>
            </div>
          </div>

          {/* Payment status */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Оплата</p>
            <div className="flex items-center gap-2 mb-3">
              {po.paymentStatus === 'paid' ? (
                <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-medium">
                  <Icon name="CheckCircle" size={12} /> Оплачено
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full text-xs font-medium">
                  <Icon name="Clock" size={12} /> Ожидает оплаты
                </span>
              )}
            </div>
            <p className="text-lg font-bold text-gray-900 mb-3">{fmt(po.amount)} ₽</p>
            {po.paymentStatus === 'pending' && (
              <Button size="sm" className="w-full" onClick={() => onMarkPaid(po.id)}>
                <Icon name="CreditCard" size={12} className="mr-2" /> Отметить оплаченным
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────── Main Component ───────────────────────────

const PurchaseOrders = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>(PURCHASE_ORDERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<POStatus | 'all'>('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // ── Computed metrics ──
  const inProgress = orders.filter(o => ['new', 'ordered', 'in_transit', 'partial'].includes(o.status)).length;
  const onApproval = orders.filter(o => o.status === 'approval').length;
  const awaitingDelivery = orders.filter(o => ['ordered', 'in_transit', 'partial'].includes(o.status)).length;
  const totalInOrder = orders
    .filter(o => !['received'].includes(o.status))
    .reduce((s, o) => s + o.amount, 0);
  const overdueCount = orders.filter(o => o.overdue).length;

  // ── Filtered list ──
  const filtered = orders.filter(o => {
    const matchSearch =
      !search ||
      o.number.toLowerCase().includes(search.toLowerCase()) ||
      o.firstItem.toLowerCase().includes(search.toLowerCase()) ||
      o.workOrder.toLowerCase().includes(search.toLowerCase()) ||
      o.supplier.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const toggleExpand = (id: string) => setExpandedId(prev => prev === id ? null : id);

  const handleMarkPaid = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, paymentStatus: 'paid' } : o));
    toast.success('Оплата отмечена');
  };

  const handleApprove = (id: string) => {
    setOrders(prev => prev.map(o =>
      o.id === id && o.status === 'approval' ? { ...o, status: 'ordered' } : o
    ));
    const po = orders.find(o => o.id === id);
    toast.success(`${po?.number} согласована и отправлена поставщику`);
  };

  const handleNewOrder = (po: PurchaseOrder) => {
    setOrders(prev => [po, ...prev]);
    setShowNewModal(false);
    toast.success(`${po.number} создана`);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Icon name="ShoppingCart" size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Закупки и ЗИП</h1>
            <p className="text-sm text-gray-500">Управление заявками на запасные части</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAnalytics(p => !p)}>
            <Icon name="BarChart2" size={14} className="mr-2" />
            {showAnalytics ? 'Скрыть аналитику' : 'Аналитика'}
          </Button>
          <Button size="sm" onClick={() => setShowNewModal(true)}>
            <Icon name="Plus" size={14} className="mr-2" /> Новая заявка
          </Button>
        </div>
      </div>

      {/* ── 5 Metric Cards ── */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {/* Card 1 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="Layers" size={16} className="text-blue-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Заявок в работе</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{inProgress}</p>
          <p className="text-xs text-gray-400 mt-1">новые + в пути</p>
        </div>
        {/* Card 2 */}
        <div className="bg-white border border-amber-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Icon name="ClipboardCheck" size={16} className="text-amber-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">На согласовании</span>
          </div>
          <p className="text-3xl font-bold text-amber-600">{onApproval}</p>
          <p className="text-xs text-gray-400 mt-1">ожидают подтверждения</p>
        </div>
        {/* Card 3 */}
        <div className="bg-white border border-indigo-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Icon name="Truck" size={16} className="text-indigo-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Ожидают поставки</span>
          </div>
          <p className="text-3xl font-bold text-indigo-600">{awaitingDelivery}</p>
          <p className="text-xs text-gray-400 mt-1">заказано + в пути</p>
        </div>
        {/* Card 4 */}
        <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Icon name="Banknote" size={16} className="text-emerald-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Сумма в заказе</span>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{fmt(totalInOrder)} ₽</p>
          <p className="text-xs text-gray-400 mt-1">без полученных</p>
        </div>
        {/* Card 5 — overdue red */}
        <div className={`bg-white rounded-2xl p-4 shadow-sm ${overdueCount > 0 ? 'border border-red-300 bg-red-50' : 'border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${overdueCount > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
              <Icon name="AlertTriangle" size={16} className={overdueCount > 0 ? 'text-red-600' : 'text-gray-400'} />
            </div>
            <span className="text-xs text-gray-500 font-medium">Просрочено</span>
          </div>
          <p className={`text-3xl font-bold ${overdueCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>{overdueCount}</p>
          <p className="text-xs text-gray-400 mt-1">нарушение сроков</p>
        </div>
      </div>

      {/* Analytics Panel */}
      {showAnalytics && (
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="col-span-3 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-4">Закупки по месяцам (сумма, ₽)</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={MONTHLY_DATA} margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [`${fmt(v)} ₽`, 'Сумма']} />
                <Legend />
                <Bar dataKey="amount" name="Сумма закупок" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="col-span-2 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-4">Топ-5 поставщиков</p>
            <div className="space-y-3">
              {TOP_SUPPLIERS.map((s, i) => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold text-gray-800 truncate">{s.name}</span>
                      <StarRating rating={s.rating} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{s.orders} заказов</span>
                      <span className="text-xs font-medium text-gray-700">{fmt(s.amount)} ₽</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
                      <div className="bg-blue-500 h-1 rounded-full"
                        style={{ width: `${(s.amount / TOP_SUPPLIERS[0].amount) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Поиск по номеру, описанию, нарядам, поставщику..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as POStatus | 'all')}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 min-w-[180px]"
          >
            <option value="all">Все статусы</option>
            {Object.entries(STATUS_CFG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
          <select
            value={periodFilter}
            onChange={e => setPeriodFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 min-w-[140px]"
          >
            <option value="all">Весь период</option>
            <option value="today">Сегодня</option>
            <option value="week">Эта неделя</option>
            <option value="month">Этот месяц</option>
          </select>
          {(search || statusFilter !== 'all') && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStatusFilter('all'); }}>
              <Icon name="X" size={13} className="mr-1" /> Сбросить
            </Button>
          )}
          <span className="text-xs text-gray-400 whitespace-nowrap">{filtered.length} из {orders.length}</span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">Номер / Дата</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">Наряд</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">Первая позиция</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">Позиций</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">Поставщик</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">Сумма</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">Статус</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">Поставка</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(po => {
              const isExpanded = expandedId === po.id;
              const cfg = STATUS_CFG[po.status];
              return (
                <>
                  <tr
                    key={po.id}
                    className={`transition-colors ${isExpanded ? 'bg-blue-50' : 'hover:bg-gray-50'} ${po.overdue ? 'border-l-4 border-l-red-400' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{po.number}</p>
                      <p className="text-xs text-gray-400">{po.date}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-blue-600 text-sm font-medium">{po.workOrder}</span>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="text-gray-800 text-sm truncate">{po.firstItem}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-gray-600 font-medium">{po.linesCount}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700 text-sm">{po.supplier.name}</p>
                      <StarRating rating={po.supplier.rating} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-semibold text-gray-900">{fmt(po.amount)} ₽</p>
                      {po.paymentStatus === 'paid' ? (
                        <span className="text-xs text-emerald-600 flex items-center gap-0.5 justify-end">
                          <Icon name="CheckCircle" size={10} /> оплачено
                        </span>
                      ) : (
                        <span className="text-xs text-amber-500">ожидает оплаты</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <p className={`text-xs font-medium ${po.overdue ? 'text-red-600' : 'text-gray-700'}`}>
                        {po.overdue && <Icon name="AlertTriangle" size={10} className="inline mr-0.5" />}
                        {po.deliveryDate}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          size="sm"
                          variant={isExpanded ? 'default' : 'outline'}
                          onClick={() => toggleExpand(po.id)}
                          className="text-xs"
                        >
                          <Icon name={isExpanded ? 'ChevronUp' : 'Eye'} size={12} className="mr-1" />
                          {isExpanded ? 'Скрыть' : 'Просмотр'}
                        </Button>
                        {po.status === 'approval' && (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(po.id)}
                            className="text-xs bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Icon name="Check" size={12} className="mr-1" /> Согласовать
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${po.id}-detail`}>
                      <td colSpan={9} className="px-4 pb-2">
                        <DetailPanel
                          po={po}
                          onClose={() => setExpandedId(null)}
                          onMarkPaid={handleMarkPaid}
                        />
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Icon name="PackageSearch" size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Заявки не найдены</p>
            <p className="text-gray-400 text-sm mt-1">Попробуйте изменить параметры фильтра</p>
          </div>
        )}
      </div>

      {/* New Order Modal */}
      {showNewModal && (
        <NewOrderModal
          onClose={() => setShowNewModal(false)}
          onSave={handleNewOrder}
        />
      )}
    </div>
  );
};

export default PurchaseOrders;
