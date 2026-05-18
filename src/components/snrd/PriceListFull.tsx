import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type ServiceCategory = 'Диагностика' | 'ТО' | 'Ремонт' | 'Монтаж' | 'Хладагент' | 'Гарантия';
type EquipmentType = 'Сплит' | 'VRF' | 'Чиллер' | 'Вентиляция' | 'Универсально';
type ServiceStatus = 'Активен' | 'Скрыт';

interface Service {
  id: string;
  code: string;
  name: string;
  category: ServiceCategory;
  equipment: EquipmentType;
  basePrice: number;
  urgentPrice: number;
  duration: number;
  status: ServiceStatus;
}

interface PriceHistoryEntry {
  id: string;
  date: string;
  service: string;
  oldPrice: number;
  newPrice: number;
  changedBy: string;
}

interface NewServiceForm {
  name: string;
  category: ServiceCategory | '';
  equipment: EquipmentType | '';
  basePrice: string;
  duration: string;
  description: string;
}

// ─────────────────────────────────────────────
// Static Data
// ─────────────────────────────────────────────

const INITIAL_SERVICES: Service[] = [
  { id: '1',  code: 'SRV-001', name: 'Диагностика системы',              category: 'Диагностика', equipment: 'Универсально', basePrice: 1200,  urgentPrice: 1800,  duration: 60,  status: 'Активен' },
  { id: '2',  code: 'SRV-002', name: 'Поиск утечки хладагента',          category: 'Диагностика', equipment: 'Универсально', basePrice: 2500,  urgentPrice: 3750,  duration: 90,  status: 'Активен' },
  { id: '3',  code: 'SRV-003', name: 'Диагностика VRF системы',          category: 'Диагностика', equipment: 'VRF',          basePrice: 3500,  urgentPrice: 5250,  duration: 120, status: 'Активен' },
  { id: '4',  code: 'SRV-004', name: 'Диагностика чиллера',              category: 'Диагностика', equipment: 'Чиллер',       basePrice: 5000,  urgentPrice: 7500,  duration: 180, status: 'Активен' },
  { id: '5',  code: 'SRV-005', name: 'Чистка фильтров',                  category: 'ТО',          equipment: 'Сплит',        basePrice: 800,   urgentPrice: 1200,  duration: 30,  status: 'Активен' },
  { id: '6',  code: 'SRV-006', name: 'Полное ТО сплит-системы',          category: 'ТО',          equipment: 'Сплит',        basePrice: 3500,  urgentPrice: 5250,  duration: 120, status: 'Активен' },
  { id: '7',  code: 'SRV-007', name: 'ТО внутреннего блока VRF',         category: 'ТО',          equipment: 'VRF',          basePrice: 8000,  urgentPrice: 12000, duration: 240, status: 'Активен' },
  { id: '8',  code: 'SRV-008', name: 'ТО наружного блока VRF',           category: 'ТО',          equipment: 'VRF',          basePrice: 6500,  urgentPrice: 9750,  duration: 180, status: 'Активен' },
  { id: '9',  code: 'SRV-009', name: 'ТО вентиляционной установки',      category: 'ТО',          equipment: 'Вентиляция',   basePrice: 4500,  urgentPrice: 6750,  duration: 150, status: 'Активен' },
  { id: '10', code: 'SRV-010', name: 'ТО чиллера (сезонное)',            category: 'ТО',          equipment: 'Чиллер',       basePrice: 15000, urgentPrice: 22500, duration: 480, status: 'Активен' },
  { id: '11', code: 'SRV-011', name: 'Замена компрессора',               category: 'Ремонт',      equipment: 'Сплит',        basePrice: 15000, urgentPrice: 22500, duration: 360, status: 'Активен' },
  { id: '12', code: 'SRV-012', name: 'Замена платы управления',          category: 'Ремонт',      equipment: 'Универсально', basePrice: 8000,  urgentPrice: 12000, duration: 180, status: 'Активен' },
  { id: '13', code: 'SRV-013', name: 'Пайка трубопровода',              category: 'Ремонт',      equipment: 'Универсально', basePrice: 4500,  urgentPrice: 6750,  duration: 120, status: 'Активен' },
  { id: '14', code: 'SRV-014', name: 'Замена вентилятора',              category: 'Ремонт',      equipment: 'Универсально', basePrice: 5500,  urgentPrice: 8250,  duration: 150, status: 'Активен' },
  { id: '15', code: 'SRV-015', name: 'Ремонт теплообменника',           category: 'Ремонт',      equipment: 'Чиллер',       basePrice: 25000, urgentPrice: 37500, duration: 480, status: 'Активен' },
  { id: '16', code: 'SRV-016', name: 'Замена расширительного клапана',  category: 'Ремонт',      equipment: 'VRF',          basePrice: 12000, urgentPrice: 18000, duration: 240, status: 'Активен' },
  { id: '17', code: 'SRV-017', name: 'Ремонт электрической части',      category: 'Ремонт',      equipment: 'Универсально', basePrice: 6000,  urgentPrice: 9000,  duration: 120, status: 'Активен' },
  { id: '18', code: 'SRV-018', name: 'Монтаж сплит-системы',            category: 'Монтаж',      equipment: 'Сплит',        basePrice: 12000, urgentPrice: 18000, duration: 480, status: 'Активен' },
  { id: '19', code: 'SRV-019', name: 'Монтаж внутреннего блока VRF',   category: 'Монтаж',      equipment: 'VRF',          basePrice: 18000, urgentPrice: 27000, duration: 360, status: 'Активен' },
  { id: '20', code: 'SRV-020', name: 'Монтаж наружного блока VRF',     category: 'Монтаж',      equipment: 'VRF',          basePrice: 35000, urgentPrice: 52500, duration: 720, status: 'Активен' },
  { id: '21', code: 'SRV-021', name: 'Монтаж вентиляционной установки', category: 'Монтаж',      equipment: 'Вентиляция',   basePrice: 22000, urgentPrice: 33000, duration: 600, status: 'Активен' },
  { id: '22', code: 'SRV-022', name: 'Демонтаж и монтаж чиллера',      category: 'Монтаж',      equipment: 'Чиллер',       basePrice: 55000, urgentPrice: 82500, duration: 960, status: 'Активен' },
  { id: '23', code: 'SRV-023', name: 'Заправка R-410A',                 category: 'Хладагент',   equipment: 'Универсально', basePrice: 450,   urgentPrice: 675,   duration: 30,  status: 'Активен' },
  { id: '24', code: 'SRV-024', name: 'Дозаправка хладагентом',         category: 'Хладагент',   equipment: 'Универсально', basePrice: 350,   urgentPrice: 525,   duration: 20,  status: 'Активен' },
  { id: '25', code: 'SRV-025', name: 'Утилизация хладагента',          category: 'Хладагент',   equipment: 'Универсально', basePrice: 1500,  urgentPrice: 2250,  duration: 60,  status: 'Активен' },
  { id: '26', code: 'SRV-026', name: 'Замена R-22 на R-410A',          category: 'Хладагент',   equipment: 'Сплит',        basePrice: 8500,  urgentPrice: 12750, duration: 180, status: 'Активен' },
  { id: '27', code: 'SRV-027', name: 'Гарантийная диагностика',         category: 'Гарантия',    equipment: 'Универсально', basePrice: 0,     urgentPrice: 0,     duration: 60,  status: 'Активен' },
  { id: '28', code: 'SRV-028', name: 'Гарантийный ремонт',             category: 'Гарантия',    equipment: 'Универсально', basePrice: 0,     urgentPrice: 0,     duration: 180, status: 'Активен' },
  { id: '29', code: 'SRV-029', name: 'Гарантийная замена компонентов', category: 'Гарантия',    equipment: 'Универсально', basePrice: 0,     urgentPrice: 0,     duration: 240, status: 'Скрыт'   },
  { id: '30', code: 'SRV-030', name: 'Промывка дренажной системы',     category: 'ТО',          equipment: 'Сплит',        basePrice: 1200,  urgentPrice: 1800,  duration: 45,  status: 'Активен' },
  { id: '31', code: 'SRV-031', name: 'Дезинфекция внутреннего блока',  category: 'ТО',          equipment: 'Сплит',        basePrice: 2000,  urgentPrice: 3000,  duration: 60,  status: 'Активен' },
  { id: '32', code: 'SRV-032', name: 'Замена фильтров HEPA',           category: 'ТО',          equipment: 'Вентиляция',   basePrice: 3500,  urgentPrice: 5250,  duration: 90,  status: 'Скрыт'   },
];

const PRICE_HISTORY: PriceHistoryEntry[] = [
  { id: '1', date: '2026-05-15', service: 'Диагностика системы',    oldPrice: 1000,  newPrice: 1200,  changedBy: 'Иванов А.В.' },
  { id: '2', date: '2026-05-10', service: 'Полное ТО сплит-системы', oldPrice: 3000, newPrice: 3500,  changedBy: 'Петрова М.С.' },
  { id: '3', date: '2026-05-03', service: 'Монтаж сплит-системы',   oldPrice: 10000, newPrice: 12000, changedBy: 'Иванов А.В.' },
  { id: '4', date: '2026-04-28', service: 'Заправка R-410A',        oldPrice: 400,   newPrice: 450,   changedBy: 'Сидоров Д.К.' },
  { id: '5', date: '2026-04-20', service: 'Замена компрессора',     oldPrice: 13000, newPrice: 15000, changedBy: 'Петрова М.С.' },
  { id: '6', date: '2026-04-15', service: 'ТО чиллера (сезонное)',  oldPrice: 12000, newPrice: 15000, changedBy: 'Иванов А.В.' },
  { id: '7', date: '2026-04-10', service: 'Пайка трубопровода',     oldPrice: 4000,  newPrice: 4500,  changedBy: 'Сидоров Д.К.' },
  { id: '8', date: '2026-03-25', service: 'Поиск утечки хладагента', oldPrice: 2000, newPrice: 2500,  changedBy: 'Петрова М.С.' },
];

const ANALYTICS_ORDERS = [
  { name: 'Диагностика системы',     orders: 142 },
  { name: 'Чистка фильтров',         orders: 118 },
  { name: 'Заправка R-410A',         orders: 97  },
  { name: 'Полное ТО сплит',         orders: 84  },
  { name: 'Монтаж сплит',            orders: 63  },
  { name: 'Замена платы управления', orders: 51  },
  { name: 'Дозаправка хладагентом',  orders: 47  },
  { name: 'Пайка трубопровода',      orders: 39  },
  { name: 'ТО VRF блока',            orders: 31  },
  { name: 'Замена компрессора',      orders: 24  },
];

const ANALYTICS_REVENUE = [
  { name: 'Монтаж наружного VRF',    avg: 35000 },
  { name: 'ТО чиллера',             avg: 15000 },
  { name: 'Замена компрессора',     avg: 15000 },
  { name: 'Монтаж сплит',           avg: 12000 },
  { name: 'ТО VRF блока',           avg: 8000  },
  { name: 'Замена платы',           avg: 8000  },
  { name: 'Пайка трубопровода',     avg: 4500  },
  { name: 'Полное ТО сплит',        avg: 3500  },
  { name: 'Диагностика системы',    avg: 1200  },
  { name: 'Чистка фильтров',        avg: 800   },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const CATEGORY_META: Record<ServiceCategory, { color: string; icon: string; bg: string }> = {
  Диагностика: { color: 'text-blue-700',   icon: 'Search',       bg: 'bg-blue-50'  },
  ТО:          { color: 'text-green-700',  icon: 'Wrench',       bg: 'bg-green-50' },
  Ремонт:      { color: 'text-orange-700', icon: 'Settings',     bg: 'bg-orange-50'},
  Монтаж:      { color: 'text-purple-700', icon: 'Construction', bg: 'bg-purple-50'},
  Хладагент:   { color: 'text-cyan-700',   icon: 'Thermometer',  bg: 'bg-cyan-50'  },
  Гарантия:    { color: 'text-rose-700',   icon: 'Shield',       bg: 'bg-rose-50'  },
};

const categoryBadgeVariant = (cat: ServiceCategory) => {
  const map: Record<ServiceCategory, string> = {
    Диагностика: 'bg-blue-100 text-blue-800',
    ТО:          'bg-green-100 text-green-800',
    Ремонт:      'bg-orange-100 text-orange-800',
    Монтаж:      'bg-purple-100 text-purple-800',
    Хладагент:   'bg-cyan-100 text-cyan-800',
    Гарантия:    'bg-rose-100 text-rose-800',
  };
  return map[cat];
};

const fmt = (n: number) =>
  n === 0 ? 'Бесплатно' : n.toLocaleString('ru-RU') + ' ₽';

const fmtDuration = (min: number) => {
  if (min < 60) return `${min} мин`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} ч ${m} мин` : `${h} ч`;
};

const priceDiff = (oldP: number, newP: number) => {
  const diff = ((newP - oldP) / oldP) * 100;
  return diff.toFixed(1);
};

const BAR_COLORS = ['#6366f1','#8b5cf6','#a78bfa','#c4b5fd','#ddd6fe','#818cf8','#4f46e5','#7c3aed','#5b21b6','#4c1d95'];

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

const EMPTY_FORM: NewServiceForm = {
  name: '',
  category: '',
  equipment: '',
  basePrice: '',
  duration: '',
  description: '',
};

export default function PriceListFull() {
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [filterEquip, setFilterEquip] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<NewServiceForm>(EMPTY_FORM);

  // ── Filtered services ──
  const filtered = useMemo(() => {
    return services.filter((s) => {
      const matchSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === 'all' || s.category === filterCat;
      const matchEquip = filterEquip === 'all' || s.equipment === filterEquip;
      const matchStatus = filterStatus === 'all' || s.status === filterStatus;
      return matchSearch && matchCat && matchEquip && matchStatus;
    });
  }, [services, search, filterCat, filterEquip, filterStatus]);

  // ── Category stats ──
  const categoryStats = useMemo(() => {
    const cats: ServiceCategory[] = ['Диагностика', 'ТО', 'Ремонт', 'Монтаж', 'Хладагент', 'Гарантия'];
    return cats.map((cat) => {
      const items = services.filter((s) => s.category === cat && s.status === 'Активен');
      const avgPrice = items.length
        ? Math.round(items.reduce((acc, i) => acc + i.basePrice, 0) / items.length)
        : 0;
      return { cat, count: items.length, avgPrice };
    });
  }, [services]);

  // ── Handlers ──
  const handleToggleStatus = (id: string) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === 'Активен' ? 'Скрыт' : 'Активен' }
          : s,
      ),
    );
    const svc = services.find((s) => s.id === id);
    const next = svc?.status === 'Активен' ? 'скрыта' : 'активирована';
    toast.success(`Услуга «${svc?.name}» ${next}`);
  };

  const handleEdit = (name: string) => {
    toast.info(`Редактирование: «${name}»`);
  };

  const handleExportPDF = () => {
    toast.success('Прайс-лист экспортирован в PDF');
  };

  const handleImport = () => {
    toast.info('Откройте файл Excel или CSV для импорта');
  };

  const handleCreateService = () => {
    if (!form.name || !form.category || !form.equipment || !form.basePrice) {
      toast.error('Заполните все обязательные поля');
      return;
    }
    const base = parseFloat(form.basePrice) || 0;
    const newSvc: Service = {
      id: String(Date.now()),
      code: `SRV-${String(services.length + 1).padStart(3, '0')}`,
      name: form.name,
      category: form.category as ServiceCategory,
      equipment: form.equipment as EquipmentType,
      basePrice: base,
      urgentPrice: Math.round(base * 1.5),
      duration: parseInt(form.duration) || 60,
      status: 'Активен',
    };
    setServices((prev) => [...prev, newSvc]);
    toast.success(`Услуга «${newSvc.name}» добавлена`);
    setForm(EMPTY_FORM);
    setAddOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Прайс-лист услуг</h1>
          <p className="text-sm text-gray-500 mt-1">
            {services.filter((s) => s.status === 'Активен').length} активных из {services.length} услуг
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImport}>
            <Icon name="Upload" className="w-4 h-4 mr-2" />
            Импорт
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Icon name="FileDown" className="w-4 h-4 mr-2" />
            Экспорт PDF
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Icon name="Plus" className="w-4 h-4 mr-2" />
            Добавить услугу
          </Button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="pricelist">
        <TabsList>
          <TabsTrigger value="pricelist">Прайс-лист</TabsTrigger>
          <TabsTrigger value="categories">Категории</TabsTrigger>
          <TabsTrigger value="history">История цен</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
        </TabsList>

        {/* ════════════════ TAB: Прайс-лист ════════════════ */}
        <TabsContent value="pricelist" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Icon name="Search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Поиск по названию или коду..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={filterCat} onValueChange={setFilterCat}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Категория" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все категории</SelectItem>
                    <SelectItem value="Ремонт">Ремонт</SelectItem>
                    <SelectItem value="ТО">ТО</SelectItem>
                    <SelectItem value="Монтаж">Монтаж</SelectItem>
                    <SelectItem value="Диагностика">Диагностика</SelectItem>
                    <SelectItem value="Гарантия">Гарантия</SelectItem>
                    <SelectItem value="Хладагент">Хладагент</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterEquip} onValueChange={setFilterEquip}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Тип оборудования" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все типы</SelectItem>
                    <SelectItem value="Сплит">Сплит</SelectItem>
                    <SelectItem value="VRF">VRF</SelectItem>
                    <SelectItem value="Чиллер">Чиллер</SelectItem>
                    <SelectItem value="Вентиляция">Вентиляция</SelectItem>
                    <SelectItem value="Универсально">Универсально</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="Активен">Активен</SelectItem>
                    <SelectItem value="Скрыт">Скрыт</SelectItem>
                  </SelectContent>
                </Select>
                {(search || filterCat !== 'all' || filterEquip !== 'all' || filterStatus !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setSearch(''); setFilterCat('all'); setFilterEquip('all'); setFilterStatus('all'); }}
                  >
                    <Icon name="X" className="w-4 h-4 mr-1" />
                    Сбросить
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Код</TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Тип оборудования</TableHead>
                    <TableHead className="text-right">Базовая цена</TableHead>
                    <TableHead className="text-right">Срочная цена</TableHead>
                    <TableHead className="text-right">Время</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="w-28">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((svc) => (
                    <TableRow key={svc.id} className={svc.status === 'Скрыт' ? 'opacity-50' : ''}>
                      <TableCell className="font-mono text-xs text-gray-500">{svc.code}</TableCell>
                      <TableCell className="font-medium">{svc.name}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${categoryBadgeVariant(svc.category)}`}>
                          {svc.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{svc.equipment}</TableCell>
                      <TableCell className="text-right font-semibold">{fmt(svc.basePrice)}</TableCell>
                      <TableCell className="text-right text-orange-600 font-medium">{fmt(svc.urgentPrice)}</TableCell>
                      <TableCell className="text-right text-sm text-gray-500">{fmtDuration(svc.duration)}</TableCell>
                      <TableCell>
                        <Badge variant={svc.status === 'Активен' ? 'default' : 'secondary'}>
                          {svc.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(svc.name)}>
                            <Icon name="Pencil" className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(svc.id)}
                            title={svc.status === 'Активен' ? 'Скрыть' : 'Показать'}
                          >
                            <Icon name={svc.status === 'Активен' ? 'EyeOff' : 'Eye'} className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-10 text-gray-400">
                        Услуги не найдены
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════════════ TAB: Категории ════════════════ */}
        <TabsContent value="categories">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryStats.map(({ cat, count, avgPrice }) => {
              const meta = CATEGORY_META[cat];
              return (
                <Card key={cat} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2.5 rounded-lg ${meta.bg}`}>
                        <Icon name={meta.icon as any} className={`w-5 h-5 ${meta.color}`} />
                      </div>
                      <Badge variant="outline">{count} услуг</Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg">{cat}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Средняя цена:{' '}
                      <span className="font-medium text-gray-800">{fmt(avgPrice)}</span>
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full"
                      onClick={() => toast.info(`Редактирование категории «${cat}»`)}
                    >
                      <Icon name="Pencil" className="w-3.5 h-3.5 mr-1.5" />
                      Редактировать категорию
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ════════════════ TAB: История цен ════════════════ */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">История изменений цен</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead>Услуга</TableHead>
                    <TableHead className="text-right">Старая цена</TableHead>
                    <TableHead className="text-right">Новая цена</TableHead>
                    <TableHead className="text-right">Изменение</TableHead>
                    <TableHead>Изменил</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PRICE_HISTORY.map((h) => {
                    const diff = parseFloat(priceDiff(h.oldPrice, h.newPrice));
                    const isUp = diff > 0;
                    return (
                      <TableRow key={h.id}>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(h.date).toLocaleDateString('ru-RU')}
                        </TableCell>
                        <TableCell className="font-medium">{h.service}</TableCell>
                        <TableCell className="text-right text-gray-400 line-through">
                          {fmt(h.oldPrice)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">{fmt(h.newPrice)}</TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                              isUp
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            <Icon name={isUp ? 'TrendingUp' : 'TrendingDown'} className="w-3 h-3" />
                            {isUp ? '+' : ''}{diff}%
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{h.changedBy}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════════════ TAB: Аналитика ════════════════ */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Топ-10 самых заказываемых услуг</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={ANALYTICS_ORDERS} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v} заказов`, 'Количество']} />
                  <Bar dataKey="orders" radius={[4, 4, 0, 0]}>
                    {ANALYTICS_ORDERS.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Средняя выручка на услугу, ₽</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  layout="vertical"
                  data={ANALYTICS_REVENUE}
                  margin={{ top: 5, right: 30, left: 140, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={135} />
                  <Tooltip formatter={(v: number) => [v.toLocaleString('ru-RU') + ' ₽', 'Средняя выручка']} />
                  <Bar dataKey="avg" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Dialog: Добавить услугу ── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Добавить услугу</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Название <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Введите название услуги"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Категория <span className="text-red-500">*</span></Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v as ServiceCategory }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Диагностика">Диагностика</SelectItem>
                    <SelectItem value="ТО">ТО</SelectItem>
                    <SelectItem value="Ремонт">Ремонт</SelectItem>
                    <SelectItem value="Монтаж">Монтаж</SelectItem>
                    <SelectItem value="Хладагент">Хладагент</SelectItem>
                    <SelectItem value="Гарантия">Гарантия</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Тип оборудования <span className="text-red-500">*</span></Label>
                <Select value={form.equipment} onValueChange={(v) => setForm((f) => ({ ...f, equipment: v as EquipmentType }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Сплит">Сплит</SelectItem>
                    <SelectItem value="VRF">VRF</SelectItem>
                    <SelectItem value="Чиллер">Чиллер</SelectItem>
                    <SelectItem value="Вентиляция">Вентиляция</SelectItem>
                    <SelectItem value="Универсально">Универсально</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Базовая цена, ₽ <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={form.basePrice}
                  onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Время выполнения, мин</Label>
                <Input
                  type="number"
                  placeholder="60"
                  value={form.duration}
                  onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Описание</Label>
              <Input
                placeholder="Краткое описание услуги"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            {form.basePrice && parseFloat(form.basePrice) > 0 && (
              <p className="text-sm text-gray-500">
                Срочная цена (×1.5):{' '}
                <span className="font-semibold text-orange-600">
                  {Math.round(parseFloat(form.basePrice) * 1.5).toLocaleString('ru-RU')} ₽
                </span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setForm(EMPTY_FORM); }}>
              Отмена
            </Button>
            <Button onClick={handleCreateService}>
              <Icon name="Plus" className="w-4 h-4 mr-1.5" />
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
