import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

type StockStatus = 'out' | 'critical' | 'low';
type StockType = 'Центральный' | 'Мобильный';
type MovementType = 'Приход' | 'Расход' | 'Перемещение';
type Category = 'Фильтры' | 'Хладагенты' | 'Расходники' | 'ЗИП';

interface CriticalItem {
  id: string;
  article: string;
  name: string;
  current: number;
  min: number;
  unit: string;
  warehouse: StockType;
  status: StockStatus;
  category: Category;
}

interface ControlItem {
  id: string;
  name: string;
  current: number;
  min: number;
  max: number;
  unit: string;
  turnover: number;
  lastMove: string;
}

interface Movement {
  id: string;
  date: string;
  type: MovementType;
  name: string;
  qty: number;
  unit: string;
  from: string;
  to: string;
  user: string;
}

interface NotifSetting {
  id: string;
  name: string;
  min: number;
  max: number;
  email: boolean;
}

// ─── Static data ─────────────────────────────────────────────────────────────

const CRITICAL_ITEMS: CriticalItem[] = [
  { id: 'c1',  article: 'R410A-13',     name: 'Хладагент R-410A (13.6 кг)',        current: 0,  min: 3,  unit: 'бал.', warehouse: 'Центральный', status: 'out',      category: 'Хладагенты' },
  { id: 'c2',  article: 'COMP-DAI-35',  name: 'Компрессор Daikin JT160BCBY1L',     current: 0,  min: 1,  unit: 'шт.',  warehouse: 'Центральный', status: 'out',      category: 'ЗИП' },
  { id: 'c3',  article: 'R32-12',       name: 'Хладагент R-32 (12 кг)',             current: 1,  min: 4,  unit: 'бал.', warehouse: 'Мобильный',   status: 'critical', category: 'Хладагенты' },
  { id: 'c4',  article: 'FLT-DCL-085',  name: 'Фильтр-осушитель DCL-085S',         current: 3,  min: 10, unit: 'шт.',  warehouse: 'Центральный', status: 'critical', category: 'Фильтры' },
  { id: 'c5',  article: 'PCB-MDV-D36',  name: 'Плата управления Midea MDV-D36T1',   current: 0,  min: 2,  unit: 'шт.',  warehouse: 'Центральный', status: 'out',      category: 'ЗИП' },
  { id: 'c6',  article: 'FILTR-G4-500', name: 'Фильтр G4 500×500×20',              current: 8,  min: 20, unit: 'шт.',  warehouse: 'Мобильный',   status: 'critical', category: 'Фильтры' },
  { id: 'c7',  article: 'FAN-OUT-380',  name: 'Вентилятор внешнего блока 380В',    current: 0,  min: 2,  unit: 'шт.',  warehouse: 'Центральный', status: 'out',      category: 'ЗИП' },
  { id: 'c8',  article: 'SEN-HP-16BAR', name: 'Датчик давления высокой стороны',   current: 2,  min: 5,  unit: 'шт.',  warehouse: 'Центральный', status: 'critical', category: 'ЗИП' },
  { id: 'c9',  article: 'TAPE-SELF-25', name: 'Лента самоклейка 25мм × 10м',       current: 4,  min: 15, unit: 'рул.', warehouse: 'Мобильный',   status: 'critical', category: 'Расходники' },
  { id: 'c10', article: 'R22-13',       name: 'Хладагент R-22 (13.6 кг)',           current: 2,  min: 5,  unit: 'бал.', warehouse: 'Центральный', status: 'critical', category: 'Хладагенты' },
  { id: 'c11', article: 'OIL-POE68-1L', name: 'Масло компрессорное POE 68 (1 л)',  current: 0,  min: 4,  unit: 'фл.',  warehouse: 'Центральный', status: 'out',      category: 'Расходники' },
  { id: 'c12', article: 'GLUE-ARM-310', name: 'Герметик армированный 310 мл',      current: 1,  min: 8,  unit: 'шт.',  warehouse: 'Мобильный',   status: 'critical', category: 'Расходники' },
  { id: 'c13', article: 'PCB-HAI-5611', name: 'Плата управления Haier AC-5611',    current: 1,  min: 3,  unit: 'шт.',  warehouse: 'Центральный', status: 'critical', category: 'ЗИП' },
  { id: 'c14', article: 'TXV-R410-7',   name: 'Расширительный клапан TXV R410',    current: 3,  min: 6,  unit: 'шт.',  warehouse: 'Центральный', status: 'critical', category: 'ЗИП' },
  { id: 'c15', article: 'BELT-B48',     name: 'Ремень приводной B48',              current: 3,  min: 10, unit: 'шт.',  warehouse: 'Мобильный',   status: 'critical', category: 'ЗИП' },
  { id: 'c16', article: 'CAP-RUN-30UF', name: 'Конденсатор пусковой 30 мкФ',      current: 4,  min: 8,  unit: 'шт.',  warehouse: 'Центральный', status: 'critical', category: 'ЗИП' },
  { id: 'c17', article: 'ISOL-PIPE-6',  name: 'Теплоизоляция трубная ø6 (2 м)',    current: 0,  min: 20, unit: 'шт.',  warehouse: 'Центральный', status: 'out',      category: 'Расходники' },
];

const ALL_ITEMS: ControlItem[] = [
  { id: 'i1',  name: 'Хладагент R-410A (13.6 кг)',       current: 0,   min: 3,   max: 12,  unit: 'бал.', turnover: 8,  lastMove: '15.05.2026' },
  { id: 'i2',  name: 'Хладагент R-32 (12 кг)',            current: 1,   min: 4,   max: 15,  unit: 'бал.', turnover: 10, lastMove: '14.05.2026' },
  { id: 'i3',  name: 'Фильтр G4 500×500×20',              current: 8,   min: 20,  max: 60,  unit: 'шт.',  turnover: 14, lastMove: '13.05.2026' },
  { id: 'i4',  name: 'Фильтр-осушитель DCL-085S',         current: 3,   min: 10,  max: 30,  unit: 'шт.',  turnover: 12, lastMove: '16.05.2026' },
  { id: 'i5',  name: 'Компрессор Daikin JT160BCBY1L',     current: 0,   min: 1,   max: 3,   unit: 'шт.',  turnover: 45, lastMove: '02.05.2026' },
  { id: 'i6',  name: 'Вентилятор внешнего блока 380В',   current: 0,   min: 2,   max: 5,   unit: 'шт.',  turnover: 30, lastMove: '04.05.2026' },
  { id: 'i7',  name: 'Плата управления Midea MDV-D36T1',  current: 0,   min: 2,   max: 6,   unit: 'шт.',  turnover: 25, lastMove: '07.05.2026' },
  { id: 'i8',  name: 'Датчик давления высокой стороны',  current: 2,   min: 5,   max: 15,  unit: 'шт.',  turnover: 18, lastMove: '15.05.2026' },
  { id: 'i9',  name: 'Масло компрессорное POE 68 (1 л)', current: 0,   min: 4,   max: 12,  unit: 'фл.',  turnover: 15, lastMove: '10.05.2026' },
  { id: 'i10', name: 'Лента самоклейка 25мм × 10м',       current: 4,   min: 15,  max: 50,  unit: 'рул.', turnover: 7,  lastMove: '16.05.2026' },
  { id: 'i11', name: 'Теплоизоляция трубная ø6 (2 м)',    current: 0,   min: 20,  max: 80,  unit: 'шт.',  turnover: 9,  lastMove: '08.05.2026' },
  { id: 'i12', name: 'Конденсатор пусковой 30 мкФ',      current: 4,   min: 8,   max: 20,  unit: 'шт.',  turnover: 22, lastMove: '14.05.2026' },
  { id: 'i13', name: 'Хладагент R-22 (13.6 кг)',          current: 2,   min: 5,   max: 18,  unit: 'бал.', turnover: 20, lastMove: '12.05.2026' },
  { id: 'i14', name: 'Расширительный клапан TXV R410',   current: 3,   min: 6,   max: 15,  unit: 'шт.',  turnover: 28, lastMove: '11.05.2026' },
  { id: 'i15', name: 'Ремень приводной B48',              current: 3,   min: 10,  max: 30,  unit: 'шт.',  turnover: 16, lastMove: '13.05.2026' },
  { id: 'i16', name: 'Медная труба ø12 (бухта 15 м)',     current: 12,  min: 5,   max: 20,  unit: 'бух.', turnover: 11, lastMove: '16.05.2026' },
  { id: 'i17', name: 'Контактор 3P 25А 230В',            current: 5,   min: 10,  max: 25,  unit: 'шт.',  turnover: 19, lastMove: '15.05.2026' },
  { id: 'i18', name: 'Пресс-фитинг ø28 (т-образный)',    current: 6,   min: 15,  max: 40,  unit: 'шт.',  turnover: 13, lastMove: '14.05.2026' },
  { id: 'i19', name: 'Герметик армированный 310 мл',     current: 1,   min: 8,   max: 24,  unit: 'шт.',  turnover: 10, lastMove: '16.05.2026' },
  { id: 'i20', name: 'Датчик температуры NTC 10k',        current: 14,  min: 15,  max: 40,  unit: 'шт.',  turnover: 17, lastMove: '16.05.2026' },
];

const MOVEMENTS: Movement[] = [
  { id: 'm1',  date: '16.05.2026 09:14', type: 'Приход',      name: 'Хладагент R-410A (13.6 кг)',      qty: 5,  unit: 'бал.', from: 'Поставщик ХладоСнаб',   to: 'Центральный склад',  user: 'Захаров Е.' },
  { id: 'm2',  date: '16.05.2026 10:32', type: 'Расход',      name: 'Фильтр G4 500×500×20',            qty: 4,  unit: 'шт.',  from: 'Центральный склад',     to: 'Наряд WO-2026-000418', user: 'Козлов А.' },
  { id: 'm3',  date: '16.05.2026 11:05', type: 'Перемещение', name: 'Масло компрессорное POE 68',      qty: 2,  unit: 'фл.',  from: 'Центральный склад',     to: 'Мобильный склад М2',  user: 'Диспетчер' },
  { id: 'm4',  date: '16.05.2026 12:41', type: 'Расход',      name: 'Лента самоклейка 25мм',           qty: 3,  unit: 'рул.', from: 'Мобильный склад М1',   to: 'Наряд WO-2026-000421', user: 'Петров С.' },
  { id: 'm5',  date: '15.05.2026 08:50', type: 'Приход',      name: 'Фильтр-осушитель DCL-085S',       qty: 10, unit: 'шт.',  from: 'Поставщик Danfoss',      to: 'Центральный склад',  user: 'Захаров Е.' },
  { id: 'm6',  date: '15.05.2026 10:15', type: 'Расход',      name: 'Датчик давления высокой стороны', qty: 2,  unit: 'шт.',  from: 'Центральный склад',     to: 'Наряд WO-2026-000414', user: 'Иванов Д.' },
  { id: 'm7',  date: '15.05.2026 14:22', type: 'Расход',      name: 'Конденсатор пусковой 30 мкФ',    qty: 1,  unit: 'шт.',  from: 'Центральный склад',     to: 'Наряд WO-2026-000410', user: 'Козлов А.' },
  { id: 'm8',  date: '14.05.2026 09:00', type: 'Приход',      name: 'Хладагент R-32 (12 кг)',          qty: 8,  unit: 'бал.', from: 'Поставщик ХладоСнаб',   to: 'Центральный склад',  user: 'Захаров Е.' },
  { id: 'm9',  date: '14.05.2026 11:30', type: 'Расход',      name: 'Контактор 3P 25А 230В',          qty: 2,  unit: 'шт.',  from: 'Центральный склад',     to: 'Наряд WO-2026-000408', user: 'Сидоров Н.' },
  { id: 'm10', date: '14.05.2026 15:45', type: 'Перемещение', name: 'Ремень приводной B48',            qty: 5,  unit: 'шт.',  from: 'Центральный склад',     to: 'Мобильный склад М3',  user: 'Диспетчер' },
  { id: 'm11', date: '13.05.2026 09:30', type: 'Расход',      name: 'Медная труба ø12 (бухта 15 м)',  qty: 1,  unit: 'бух.', from: 'Центральный склад',     to: 'Наряд WO-2026-000405', user: 'Иванов Д.' },
  { id: 'm12', date: '13.05.2026 13:00', type: 'Приход',      name: 'Пресс-фитинг ø28 (т-образный)', qty: 15, unit: 'шт.',  from: 'Поставщик МеталлКлимат', to: 'Центральный склад',  user: 'Захаров Е.' },
];

const AREA_DATA = [
  { day: '10.05', income: 12, outcome: 8  },
  { day: '11.05', income: 5,  outcome: 14 },
  { day: '12.05', income: 18, outcome: 7  },
  { day: '13.05', income: 3,  outcome: 11 },
  { day: '14.05', income: 22, outcome: 6  },
  { day: '15.05', income: 9,  outcome: 13 },
  { day: '16.05', income: 7,  outcome: 5  },
];

const BAR_DATA = [
  { range: '0–25%',   count: 9  },
  { range: '25–50%',  count: 5  },
  { range: '50–75%',  count: 4  },
  { range: '75–100%', count: 2  },
];

const INITIAL_NOTIF: NotifSetting[] = [
  { id: 'n1',  name: 'Хладагент R-410A (13.6 кг)',       min: 3,  max: 12, email: true  },
  { id: 'n2',  name: 'Хладагент R-32 (12 кг)',            min: 4,  max: 15, email: true  },
  { id: 'n3',  name: 'Фильтр G4 500×500×20',              min: 20, max: 60, email: false },
  { id: 'n4',  name: 'Фильтр-осушитель DCL-085S',         min: 10, max: 30, email: true  },
  { id: 'n5',  name: 'Компрессор Daikin JT160BCBY1L',     min: 1,  max: 3,  email: false },
  { id: 'n6',  name: 'Вентилятор внешнего блока 380В',   min: 2,  max: 5,  email: true  },
  { id: 'n7',  name: 'Масло компрессорное POE 68 (1 л)', min: 4,  max: 12, email: false },
  { id: 'n8',  name: 'Датчик давления высокой стороны',  min: 5,  max: 15, email: true  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusLabel = (s: StockStatus) => {
  if (s === 'out')      return 'Нет в наличии';
  if (s === 'critical') return 'Критичный';
  return 'Заканчивается';
};

const statusBadgeClass = (s: StockStatus) => {
  if (s === 'out')      return 'bg-red-100 text-red-700 border-red-200';
  if (s === 'critical') return 'bg-orange-100 text-orange-700 border-orange-200';
  return 'bg-yellow-100 text-yellow-700 border-yellow-200';
};

const movementBadgeClass = (t: MovementType) => {
  if (t === 'Приход')      return 'bg-green-100 text-green-700 border-green-200';
  if (t === 'Расход')      return 'bg-red-100 text-red-700 border-red-200';
  return 'bg-blue-100 text-blue-700 border-blue-200';
};

const levelPercent = (current: number, min: number, max: number) => {
  if (max <= 0) return 0;
  return Math.min(100, Math.round((current / max) * 100));
};

const levelColor = (pct: number) => {
  if (pct === 0)   return 'bg-red-500';
  if (pct < 25)    return 'bg-orange-400';
  if (pct < 50)    return 'bg-yellow-400';
  return 'bg-green-500';
};

const CATEGORIES: Category[] = ['Фильтры', 'Хладагенты', 'Расходники', 'ЗИП'];

// ─── Component ───────────────────────────────────────────────────────────────

const StockAlertsFull = () => {
  const [controlSearch, setControlSearch] = useState('');
  const [controlWarehouse, setControlWarehouse] = useState('all');
  const [critCategory, setCritCategory] = useState<Category | 'all'>('all');
  const [movePeriod, setMovePeriod] = useState('week');
  const [notifSettings, setNotifSettings] = useState<NotifSetting[]>(INITIAL_NOTIF);
  const [notifEmail, setNotifEmail] = useState('dispatcher@servisklimat.ru');
  const [checkFreq, setCheckFreq] = useState('60');

  const criticalCount = CRITICAL_ITEMS.filter(i => i.status === 'out' || i.status === 'critical').length;

  const filteredCritical = CRITICAL_ITEMS.filter(item => {
    return critCategory === 'all' || item.category === critCategory;
  }).sort((a, b) => {
    const order = { out: 0, critical: 1, low: 2 };
    return order[a.status] - order[b.status];
  });

  const filteredControl = ALL_ITEMS.filter(item => {
    const matchSearch = !controlSearch || item.name.toLowerCase().includes(controlSearch.toLowerCase());
    const matchWh = controlWarehouse === 'all' || true; // all items available in both
    return matchSearch && matchWh;
  });

  const incomeTotal = MOVEMENTS.filter(m => m.type === 'Приход').reduce((s, m) => s + m.qty, 0);
  const outcomeTotal = MOVEMENTS.filter(m => m.type === 'Расход').reduce((s, m) => s + m.qty, 0);

  const handleNotifMinChange = (id: string, val: string) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 0) return;
    setNotifSettings(prev => prev.map(n => n.id === id ? { ...n, min: num } : n));
  };

  const handleNotifMaxChange = (id: string, val: string) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 0) return;
    setNotifSettings(prev => prev.map(n => n.id === id ? { ...n, max: num } : n));
  };

  const handleEmailToggle = (id: string) => {
    setNotifSettings(prev => prev.map(n => n.id === id ? { ...n, email: !n.email } : n));
  };

  return (
    <div className="p-6 space-y-5 bg-gray-50 min-h-screen">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <Icon name="PackageSearch" size={20} className="text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Контроль остатков</h1>
            <p className="text-sm text-gray-500">АСУ СЦ «Сервис Климат» — складской учёт и уведомления</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => toast.success('Заявка на пополнение создана и передана снабженцу')}
          >
            <Icon name="ShoppingCart" size={15} className="mr-2" />
            Создать заявку на пополнение
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.info('Настройки уведомлений открыты на вкладке «Настройки»')}
          >
            <Icon name="Bell" size={15} className="mr-2" />
            Настроить уведомления
          </Button>
        </div>
      </div>

      {/* ── Alert banner ── */}
      {criticalCount > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <Icon name="AlertTriangle" size={18} className="text-red-600 shrink-0" />
          <p className="text-sm font-medium text-red-700">
            {criticalCount} позиц{criticalCount === 1 ? 'ия' : criticalCount < 5 ? 'ии' : 'ий'} на критическом уровне — требуется пополнение
          </p>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto border-red-300 text-red-700 hover:bg-red-100 shrink-0"
            onClick={() => toast.success('Заявки на пополнение по всем критичным позициям созданы')}
          >
            Пополнить все
          </Button>
        </div>
      )}

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon="ShieldAlert" label="Критичных позиций" value="17" color="red" />
        <KpiCard icon="Clock" label="Заканчивается (1–7 дн.)" value="34" color="orange" />
        <KpiCard icon="ClipboardList" label="Заявок в очереди" value="8" color="blue" />
        <KpiCard icon="RefreshCw" label="Оборачиваемость склада" value="23 дн." color="green" />
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="critical">
        <TabsList className="bg-white border border-gray-200 rounded-xl p-1 gap-1">
          <TabsTrigger value="critical" className="data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg text-sm">
            Критичные
          </TabsTrigger>
          <TabsTrigger value="control" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg text-sm">
            Контроль
          </TabsTrigger>
          <TabsTrigger value="movement" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg text-sm">
            Движение
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white rounded-lg text-sm">
            Настройки
          </TabsTrigger>
        </TabsList>

        {/* ── Tab: Критичные ── */}
        <TabsContent value="critical" className="mt-4 space-y-4">
          {/* Category filter */}
          <div className="flex gap-2 flex-wrap">
            {(['all', ...CATEGORIES] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setCritCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                  critCategory === cat
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat === 'all' ? 'Все категории' : cat}
              </button>
            ))}
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Артикул</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Наименование</th>
                      <th className="text-center px-3 py-3 text-gray-500 font-medium">Остаток</th>
                      <th className="text-center px-3 py-3 text-gray-500 font-medium">Мин.</th>
                      <th className="text-center px-3 py-3 text-gray-500 font-medium">Ед.</th>
                      <th className="text-center px-3 py-3 text-gray-500 font-medium">Склад</th>
                      <th className="text-center px-3 py-3 text-gray-500 font-medium">Статус</th>
                      <th className="text-right px-4 py-3 text-gray-500 font-medium">Действие</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCritical.map(item => (
                      <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${item.status === 'out' ? 'bg-red-50/40' : 'bg-orange-50/20'}`}>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.article}</td>
                        <td className="px-4 py-3 font-medium text-gray-900 max-w-xs">{item.name}</td>
                        <td className="px-3 py-3 text-center">
                          <span className={`font-bold text-base ${item.status === 'out' ? 'text-red-600' : 'text-orange-600'}`}>
                            {item.current}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center text-gray-500">{item.min}</td>
                        <td className="px-3 py-3 text-center text-gray-500 text-xs">{item.unit}</td>
                        <td className="px-3 py-3 text-center">
                          <Badge className={`text-xs ${item.warehouse === 'Центральный' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-purple-100 text-purple-700 border-purple-200'}`}>
                            {item.warehouse}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <Badge className={`text-xs ${statusBadgeClass(item.status)}`}>
                            {statusLabel(item.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant={item.status === 'out' ? 'default' : 'outline'}
                            className="h-7 text-xs px-2"
                            onClick={() => toast.success(`Заявка на «${item.name}» создана`)}
                          >
                            <Icon name="ShoppingCart" size={12} className="mr-1" />
                            Заказать
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredCritical.length === 0 && (
                <div className="py-14 text-center text-gray-400">
                  <Icon name="PackageCheck" size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Нет критичных позиций по выбранной категории</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab: Контроль ── */}
        <TabsContent value="control" className="mt-4 space-y-4">
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Поиск по наименованию…"
                className="pl-9 h-9 text-sm"
                value={controlSearch}
                onChange={e => setControlSearch(e.target.value)}
              />
            </div>
            <Select value={controlWarehouse} onValueChange={setControlWarehouse}>
              <SelectTrigger className="w-44 h-9">
                <SelectValue placeholder="Склад" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все склады</SelectItem>
                <SelectItem value="central">Центральный</SelectItem>
                <SelectItem value="mobile">Мобильный</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Table */}
            <Card className="lg:col-span-2 overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">Наименование</th>
                        <th className="text-center px-3 py-3 text-gray-500 font-medium">Ост./Мин./Макс.</th>
                        <th className="text-left px-3 py-3 text-gray-500 font-medium w-28">Уровень</th>
                        <th className="text-center px-3 py-3 text-gray-500 font-medium">Оборот</th>
                        <th className="text-center px-3 py-3 text-gray-500 font-medium">Движение</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredControl.map(item => {
                        const pct = levelPercent(item.current, item.min, item.max);
                        return (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-2.5 font-medium text-gray-800 text-xs leading-tight max-w-[200px]">
                              {item.name}
                              <span className="block text-gray-400 font-normal">{item.unit}</span>
                            </td>
                            <td className="px-3 py-2.5 text-center text-xs text-gray-600">
                              <span className={`font-bold ${pct === 0 ? 'text-red-600' : pct < 25 ? 'text-orange-600' : 'text-gray-800'}`}>
                                {item.current}
                              </span>
                              <span className="text-gray-400"> / {item.min} / {item.max}</span>
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-1.5">
                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${levelColor(pct)}`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-400 w-7 text-right shrink-0">{pct}%</span>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-center text-xs text-gray-600">{item.turnover} дн.</td>
                            <td className="px-3 py-2.5 text-center text-xs text-gray-400">{item.lastMove}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Bar chart */}
            <Card>
              <CardContent className="pt-5">
                <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Icon name="BarChart2" size={15} className="text-gray-400" />
                  Распределение по уровню
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={BAR_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="range" tick={{ fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                      formatter={(v: number) => [v, 'Позиций']}
                    />
                    <Bar dataKey="count" name="Позиций" radius={[4, 4, 0, 0]}
                      fill="#3b82f6"
                    />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-3 space-y-1.5">
                  {BAR_DATA.map(d => (
                    <div key={d.range} className="flex items-center justify-between text-xs text-gray-500">
                      <span>{d.range}</span>
                      <span className="font-semibold text-gray-700">{d.count} поз.</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab: Движение ── */}
        <TabsContent value="movement" className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <Select value={movePeriod} onValueChange={setMovePeriod}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Сегодня</SelectItem>
                <SelectItem value="week">Неделя</SelectItem>
                <SelectItem value="month">Месяц</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-500">
              {movePeriod === 'today' ? '16.05.2026' : movePeriod === 'week' ? '10.05 – 16.05.2026' : 'Май 2026'}
            </span>
          </div>

          {/* Area chart */}
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">Приход vs Расход</p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={AREA_DATA} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="gradIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="income" name="Приход" stroke="#22c55e" strokeWidth={2} fill="url(#gradIn)" dot={false} />
                  <Area type="monotone" dataKey="outcome" name="Расход" stroke="#ef4444" strokeWidth={2} fill="url(#gradOut)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Icon name="TrendingUp" size={12} className="text-green-500" /> Приход
                </p>
                <p className="text-2xl font-bold text-green-600">+{incomeTotal} шт.</p>
                <p className="text-xs text-gray-400 mt-0.5">≈ 184 700 ₽</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Icon name="TrendingDown" size={12} className="text-red-500" /> Расход
                </p>
                <p className="text-2xl font-bold text-red-600">−{outcomeTotal} шт.</p>
                <p className="text-xs text-gray-400 mt-0.5">≈ 127 300 ₽</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Icon name="Scale" size={12} className="text-blue-500" /> Сальдо
                </p>
                <p className="text-2xl font-bold text-blue-600">+{incomeTotal - outcomeTotal} шт.</p>
                <p className="text-xs text-gray-400 mt-0.5">≈ +57 400 ₽</p>
              </CardContent>
            </Card>
          </div>

          {/* Movement table */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Дата</th>
                      <th className="text-center px-3 py-3 text-gray-500 font-medium">Тип</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Наименование</th>
                      <th className="text-center px-3 py-3 text-gray-500 font-medium">Кол-во</th>
                      <th className="text-left px-3 py-3 text-gray-500 font-medium">Откуда</th>
                      <th className="text-left px-3 py-3 text-gray-500 font-medium">Куда</th>
                      <th className="text-left px-3 py-3 text-gray-500 font-medium">Пользователь</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {MOVEMENTS.map(m => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">{m.date}</td>
                        <td className="px-3 py-2.5 text-center">
                          <Badge className={`text-xs ${movementBadgeClass(m.type)}`}>{m.type}</Badge>
                        </td>
                        <td className="px-4 py-2.5 text-gray-800 max-w-[200px] text-xs">{m.name}</td>
                        <td className="px-3 py-2.5 text-center font-semibold text-gray-700">
                          {m.type === 'Расход' ? '−' : '+'}{m.qty} {m.unit}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">{m.from}</td>
                        <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">{m.to}</td>
                        <td className="px-3 py-2.5 text-xs text-gray-600">{m.user}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab: Настройки ── */}
        <TabsContent value="settings" className="mt-4 space-y-4">
          {/* Global settings */}
          <Card>
            <CardContent className="pt-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Icon name="Settings2" size={15} className="text-gray-400" />
                Глобальные настройки уведомлений
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Email получателя уведомлений</label>
                  <Input
                    type="email"
                    value={notifEmail}
                    onChange={e => setNotifEmail(e.target.value)}
                    className="h-9 text-sm"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Частота проверки (минуты)</label>
                  <Select value={checkFreq} onValueChange={setCheckFreq}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">Каждые 15 минут</SelectItem>
                      <SelectItem value="30">Каждые 30 минут</SelectItem>
                      <SelectItem value="60">Каждый час</SelectItem>
                      <SelectItem value="360">Каждые 6 часов</SelectItem>
                      <SelectItem value="1440">Раз в сутки</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Per-item settings */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Icon name="BellRing" size={15} className="text-gray-400" />
                  Настройки по позициям
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Наименование</th>
                      <th className="text-center px-3 py-3 text-gray-500 font-medium">Мин. остаток</th>
                      <th className="text-center px-3 py-3 text-gray-500 font-medium">Макс. остаток</th>
                      <th className="text-center px-3 py-3 text-gray-500 font-medium">Email уведомления</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {notifSettings.map(n => (
                      <tr key={n.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800 text-xs max-w-xs">{n.name}</td>
                        <td className="px-3 py-3 text-center">
                          <Input
                            type="number"
                            min={0}
                            value={n.min}
                            onChange={e => handleNotifMinChange(n.id, e.target.value)}
                            className="w-20 h-8 text-center text-sm mx-auto"
                          />
                        </td>
                        <td className="px-3 py-3 text-center">
                          <Input
                            type="number"
                            min={0}
                            value={n.max}
                            onChange={e => handleNotifMaxChange(n.id, e.target.value)}
                            className="w-20 h-8 text-center text-sm mx-auto"
                          />
                        </td>
                        <td className="px-3 py-3 text-center">
                          <div
                            onClick={() => handleEmailToggle(n.id)}
                            className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors mx-auto ${n.email ? 'bg-blue-600' : 'bg-gray-200'}`}
                          >
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${n.email ? 'translate-x-5' : 'translate-x-0.5'}`} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={() => toast.success('Настройки уведомлений успешно сохранены')}
            >
              <Icon name="Save" size={15} className="mr-2" />
              Сохранить настройки
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ─── KpiCard ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  icon: string;
  label: string;
  value: string;
  color: 'red' | 'orange' | 'blue' | 'green';
}

const KPI_COLORS: Record<KpiCardProps['color'], { bg: string; iconBg: string; icon: string; value: string }> = {
  red:    { bg: 'bg-red-50 border-red-200',    iconBg: 'bg-red-100',    icon: 'text-red-600',    value: 'text-red-700'    },
  orange: { bg: 'bg-orange-50 border-orange-200', iconBg: 'bg-orange-100', icon: 'text-orange-600', value: 'text-orange-700' },
  blue:   { bg: 'bg-blue-50 border-blue-200',   iconBg: 'bg-blue-100',   icon: 'text-blue-600',   value: 'text-blue-700'   },
  green:  { bg: 'bg-green-50 border-green-200', iconBg: 'bg-green-100',  icon: 'text-green-600',  value: 'text-green-700'  },
};

const KpiCard = ({ icon, label, value, color }: KpiCardProps) => {
  const c = KPI_COLORS[color];
  return (
    <div className={`border rounded-xl p-4 flex items-center gap-3 ${c.bg}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${c.iconBg}`}>
        <Icon name={icon} size={20} className={c.icon} />
      </div>
      <div>
        <p className={`text-2xl font-bold leading-none ${c.value}`}>{value}</p>
        <p className="text-xs text-gray-500 mt-1 leading-tight">{label}</p>
      </div>
    </div>
  );
};

export default StockAlertsFull;
