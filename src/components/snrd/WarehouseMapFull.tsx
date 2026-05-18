import { useState, useMemo } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Cell,
} from 'recharts';

// ─── Типы ─────────────────────────────────────────────────────────────────────

type CellStatus = 'free' | 'occupied' | 'reserved' | 'defect';
type ZoneKey = 'A' | 'B' | 'V' | 'G';

interface CellItem {
  id: string;
  zone: ZoneKey;
  row: number;
  cell: number;
  status: CellStatus;
  sku?: string;
  name?: string;
  qty?: number;
  unit?: string;
}

interface Movement {
  date: string;
  type: string;
  qty: number;
  user: string;
}

interface ZoneInfo {
  key: ZoneKey;
  label: string;
  description: string;
  total: number;
  occupied: number;
  color: string;
  bgColor: string;
}

// ─── Статические данные ────────────────────────────────────────────────────────

const ZONES: ZoneInfo[] = [
  { key: 'A', label: 'Зона А', description: 'Хладагенты и газы', total: 6, occupied: 5, color: '#3b82f6', bgColor: '#eff6ff' },
  { key: 'B', label: 'Зона Б', description: 'Запчасти и компоненты', total: 8, occupied: 6, color: '#10b981', bgColor: '#f0fdf4' },
  { key: 'V', label: 'Зона В', description: 'Расходные материалы', total: 6, occupied: 4, color: '#f59e0b', bgColor: '#fffbeb' },
  { key: 'G', label: 'Зона Г', description: 'Инструменты и оборудование', total: 4, occupied: 2, color: '#8b5cf6', bgColor: '#f5f3ff' },
];

const CELL_MOVEMENTS: Record<string, Movement[]> = {
  'A-1-1': [
    { date: '17.05.2026', type: 'Поступление', qty: 4, user: 'Иванов И.И.' },
    { date: '15.05.2026', type: 'Списание', qty: 2, user: 'Петров А.С.' },
    { date: '10.05.2026', type: 'Инвентаризация', qty: 6, user: 'Сидоров В.П.' },
  ],
  'B-2-3': [
    { date: '16.05.2026', type: 'Поступление', qty: 1, user: 'Козлов М.Н.' },
    { date: '12.05.2026', type: 'Резервирование', qty: 1, user: 'Иванов И.И.' },
    { date: '08.05.2026', type: 'Поступление', qty: 2, user: 'Петров А.С.' },
  ],
};

const DEFAULT_MOVEMENTS: Movement[] = [
  { date: '14.05.2026', type: 'Поступление', qty: 5, user: 'Иванов И.И.' },
  { date: '11.05.2026', type: 'Перемещение', qty: 3, user: 'Петров А.С.' },
  { date: '07.05.2026', type: 'Списание', qty: 1, user: 'Козлов М.Н.' },
];

// ─── Генерация ячеек склада ────────────────────────────────────────────────────

function buildCells(): CellItem[] {
  const cells: CellItem[] = [];

  const zoneA: Array<Partial<CellItem>> = [
    { sku: 'SKU-001', name: 'Фреон R-410A', qty: 12, unit: 'бал', status: 'occupied' },
    { sku: 'SKU-002', name: 'Фреон R-32', qty: 8, unit: 'бал', status: 'occupied' },
    { sku: 'SKU-004', name: 'Фреон R-407C', qty: 4, unit: 'бал', status: 'occupied' },
    { status: 'free' },
    { sku: 'SKU-003', name: 'Фреон R-22', qty: 2, unit: 'бал', status: 'reserved' },
    { status: 'free' },
  ];
  for (let r = 1; r <= 2; r++) {
    for (let c = 1; c <= 3; c++) {
      const idx = (r - 1) * 3 + (c - 1);
      cells.push({ id: `A-${r}-${c}`, zone: 'A', row: r, cell: c, ...zoneA[idx] } as CellItem);
    }
  }

  const zoneB: Array<Partial<CellItem>> = [
    { sku: 'SKU-008', name: 'Комп. Mitsubishi FH-035', qty: 1, unit: 'шт', status: 'reserved' },
    { sku: 'SKU-010', name: 'Плата управления Daikin', qty: 2, unit: 'шт', status: 'occupied' },
    { sku: 'SKU-011', name: 'Плата инвертора Mitsubishi', qty: 3, unit: 'шт', status: 'occupied' },
    { sku: 'SKU-012', name: 'Теплообменник Haier AS18', qty: 1, unit: 'шт', status: 'occupied' },
    { status: 'free' },
    { sku: 'SKU-009', name: 'Комп. Daikin 2YC45RXAD', qty: 0, unit: 'шт', status: 'defect' },
    { status: 'free' },
    { status: 'occupied', sku: 'SKU-020', name: 'Капилляр. трубка набор', qty: 10, unit: 'шт' },
  ];
  for (let r = 1; r <= 2; r++) {
    for (let c = 1; c <= 4; c++) {
      const idx = (r - 1) * 4 + (c - 1);
      cells.push({ id: `B-${r}-${c}`, zone: 'B', row: r, cell: c, ...zoneB[idx] } as CellItem);
    }
  }

  const zoneV: Array<Partial<CellItem>> = [
    { sku: 'SKU-013', name: 'Медная трубка 1/4"', qty: 150, unit: 'м', status: 'occupied' },
    { sku: 'SKU-014', name: 'Медная трубка 3/8"', qty: 120, unit: 'м', status: 'occupied' },
    { sku: 'SKU-005', name: 'Фильтр-осушитель 1/4"', qty: 48, unit: 'шт', status: 'occupied' },
    { sku: 'SKU-006', name: 'Фильтр-осушитель 3/8"', qty: 32, unit: 'шт', status: 'occupied' },
    { status: 'free' },
    { status: 'free' },
  ];
  for (let r = 1; r <= 2; r++) {
    for (let c = 1; c <= 3; c++) {
      const idx = (r - 1) * 3 + (c - 1);
      cells.push({ id: `V-${r}-${c}`, zone: 'V', row: r, cell: c, ...zoneV[idx] } as CellItem);
    }
  }

  const zoneG: Array<Partial<CellItem>> = [
    { sku: 'SKU-017', name: 'Манометрический коллектор', qty: 3, unit: 'шт', status: 'occupied' },
    { status: 'free' },
    { sku: 'SKU-018', name: 'Течеискатель электрон.', qty: 2, unit: 'шт', status: 'occupied' },
    { status: 'free' },
  ];
  for (let r = 1; r <= 2; r++) {
    for (let c = 1; c <= 2; c++) {
      const idx = (r - 1) * 2 + (c - 1);
      cells.push({ id: `G-${r}-${c}`, zone: 'G', row: r, cell: c, ...zoneG[idx] } as CellItem);
    }
  }

  return cells;
}

const ALL_CELLS = buildCells();

// ─── Цвета ячеек ──────────────────────────────────────────────────────────────

const CELL_COLORS: Record<CellStatus, string> = {
  free: '#d1fae5',
  occupied: '#bfdbfe',
  reserved: '#fef08a',
  defect: '#fecaca',
};

const CELL_STROKE: Record<CellStatus, string> = {
  free: '#6ee7b7',
  occupied: '#60a5fa',
  reserved: '#fbbf24',
  defect: '#f87171',
};

// ─── Иконки статуса движения ──────────────────────────────────────────────────

const movementIcon: Record<string, string> = {
  Поступление: 'ArrowDownCircle',
  Списание: 'ArrowUpCircle',
  Перемещение: 'ArrowRightCircle',
  Резервирование: 'Lock',
  Инвентаризация: 'ClipboardList',
};

// ─── Данные для BarChart статистики ───────────────────────────────────────────

const STATS_DATA = [
  { zone: 'Зона А', total: 6, occupied: 5, free: 1, fill: '#3b82f6' },
  { zone: 'Зона Б', total: 8, occupied: 6, free: 2, fill: '#10b981' },
  { zone: 'Зона В', total: 6, occupied: 4, free: 2, fill: '#f59e0b' },
  { zone: 'Зона Г', total: 4, occupied: 2, free: 2, fill: '#8b5cf6' },
];

// ─── Вспомогательные компоненты ───────────────────────────────────────────────

function StatusBadge({ status }: { status: CellStatus }) {
  const map: Record<CellStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    free: { label: 'Свободно', variant: 'outline' },
    occupied: { label: 'Занято', variant: 'default' },
    reserved: { label: 'Резерв', variant: 'secondary' },
    defect: { label: 'Брак', variant: 'destructive' },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
  );
}

// ─── Основной компонент ────────────────────────────────────────────────────────

export default function WarehouseMapFull() {
  const [search, setSearch] = useState('');
  const [selectedCell, setSelectedCell] = useState<CellItem | null>(null);
  const [activeTab, setActiveTab] = useState('map');

  const highlightedCells = useMemo(() => {
    if (!search.trim()) return new Set<string>();
    const q = search.trim().toLowerCase();
    return new Set(
      ALL_CELLS
        .filter(c => c.sku?.toLowerCase().includes(q) || c.name?.toLowerCase().includes(q))
        .map(c => c.id)
    );
  }, [search]);

  const movements = selectedCell
    ? CELL_MOVEMENTS[selectedCell.id] ?? DEFAULT_MOVEMENTS
    : [];

  function handleOptimize() {
    toast.success('Задача оптимизации поставлена в очередь', {
      description: 'Алгоритм пересчитает расстановку и предложит план перестановок',
    });
  }

  function handleMove() {
    if (!selectedCell) return;
    toast.info(`Перемещение ячейки ${selectedCell.id}`, {
      description: 'Выберите целевую ячейку на карте или введите адрес вручную',
    });
  }

  function handleInventory() {
    if (!selectedCell) return;
    toast.success(`Инвентаризация ячейки ${selectedCell.id} запланирована`, {
      description: 'Задание добавлено в список инвентаризаций на сегодня',
    });
  }

  // ─── Рендер SVG ячейки ──────────────────────────────────────────────────────

  function renderCells(
    zone: ZoneKey,
    startX: number,
    startY: number,
    cols: number,
    rows: number,
    cellW: number,
    cellH: number,
    gap: number
  ) {
    const zoneCells = ALL_CELLS.filter(c => c.zone === zone);
    return zoneCells.map(c => {
      const col = c.cell - 1;
      const row = c.row - 1;
      const x = startX + col * (cellW + gap);
      const y = startY + row * (cellH + gap);
      const isHighlighted = highlightedCells.has(c.id);
      const isSelected = selectedCell?.id === c.id;
      const fill = isHighlighted ? '#fde68a' : CELL_COLORS[c.status];
      const stroke = isSelected ? '#1d4ed8' : isHighlighted ? '#d97706' : CELL_STROKE[c.status];
      const strokeWidth = isSelected || isHighlighted ? 2.5 : 1;

      return (
        <g key={c.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedCell(c)}>
          <rect
            x={x} y={y}
            width={cellW} height={cellH}
            rx={4}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          {isSelected && (
            <rect x={x - 1} y={y - 1} width={cellW + 2} height={cellH + 2} rx={5} fill="none" stroke="#1d4ed8" strokeWidth={1.5} strokeDasharray="4 2" />
          )}
          <text x={x + cellW / 2} y={y + cellH / 2 - 5} textAnchor="middle" fontSize={8} fill="#374151" fontWeight="500">
            {zone}{c.row}-{c.cell}
          </text>
          {c.sku && (
            <text x={x + cellW / 2} y={y + cellH / 2 + 6} textAnchor="middle" fontSize={7} fill="#6b7280">
              {c.sku}
            </text>
          )}
        </g>
      );
    });
  }

  // ─── JSX ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-50 min-h-screen">

      {/* KPI */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Стеллажей', value: '24', icon: 'LayoutGrid', color: 'text-blue-600' },
          { label: 'Занятость', value: '73%', icon: 'BarChart2', color: 'text-green-600' },
          { label: 'Позиций', value: '847', icon: 'Package', color: 'text-amber-600' },
          { label: 'Зон', value: '4', icon: 'Map', color: 'text-purple-600' },
        ].map(k => (
          <Card key={k.label} className="py-3">
            <CardContent className="p-0 px-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gray-100 ${k.color}`}>
                <Icon name={k.icon as any} size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{k.label}</p>
                <p className="text-xl font-bold text-gray-800">{k.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="mb-3">
          <TabsTrigger value="map">
            <Icon name="Map" size={14} className="mr-1" />Карта
          </TabsTrigger>
          <TabsTrigger value="stats">
            <Icon name="BarChart2" size={14} className="mr-1" />Статистика
          </TabsTrigger>
        </TabsList>

        {/* ── TAB: КАРТА ── */}
        <TabsContent value="map" className="mt-0">
          <div className="flex gap-3">

            {/* Левая панель */}
            <div className="w-64 flex flex-col gap-3 shrink-0">

              {/* Поиск */}
              <Card>
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Icon name="Search" size={14} />Поиск по артикулу
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  <Input
                    placeholder="Например: SKU-001"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="text-sm h-8"
                  />
                  {search && (
                    <p className="text-xs text-gray-500 mt-1.5">
                      Найдено: {highlightedCells.size} ячеек
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Зоны */}
              <Card>
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Icon name="Layers" size={14} />Зоны склада
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 flex flex-col gap-3">
                  {ZONES.map(z => {
                    const pct = Math.round((z.occupied / z.total) * 100);
                    return (
                      <div key={z.key}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium" style={{ color: z.color }}>{z.label}</span>
                          <span className="text-xs text-gray-400">{pct}%</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">{z.description}</p>
                        <ProgressBar value={pct} color={z.color} />
                        <p className="text-xs text-gray-400 mt-0.5">{z.occupied}/{z.total} ячеек</p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Легенда */}
              <Card>
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Icon name="Info" size={14} />Легенда
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 flex flex-col gap-1.5">
                  {(Object.entries(CELL_COLORS) as [CellStatus, string][]).map(([status, color]) => {
                    const labels: Record<CellStatus, string> = {
                      free: 'Свободно',
                      occupied: 'Занято',
                      reserved: 'Резерв',
                      defect: 'Брак',
                    };
                    return (
                      <div key={status} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-sm border" style={{ backgroundColor: color, borderColor: CELL_STROKE[status] }} />
                        <span className="text-xs text-gray-600">{labels[status]}</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Оптимизация */}
              <Button variant="outline" size="sm" onClick={handleOptimize} className="w-full text-xs">
                <Icon name="Sparkles" size={13} className="mr-1.5" />
                Оптимизировать расстановку
              </Button>
            </div>

            {/* Центр — SVG */}
            <Card className="flex-1 overflow-hidden">
              <CardContent className="p-3">
                <svg
                  viewBox="0 0 800 600"
                  className="w-full border rounded-lg bg-white"
                  style={{ maxHeight: 520 }}
                >
                  {/* Фон */}
                  <rect x={0} y={0} width={800} height={600} fill="#f8fafc" rx={8} />

                  {/* Зона А — хладагенты (левый верх, синий фон) */}
                  <rect x={30} y={60} width={220} height={200} rx={8} fill="#eff6ff" stroke="#bfdbfe" strokeWidth={1.5} />
                  <text x={140} y={52} textAnchor="middle" fontSize={12} fontWeight="700" fill="#1d4ed8">ЗОНА А</text>
                  <text x={140} y={64} textAnchor="middle" fontSize={9} fill="#3b82f6">Хладагенты</text>
                  {/* Рамка зоны хол. хранения */}
                  <rect x={36} y={68} width={208} height={186} rx={5} fill="none" stroke="#93c5fd" strokeWidth={2} strokeDasharray="6 3" />
                  <text x={52} y={82} fontSize={8} fill="#93c5fd">❄ Зона холодного хранения</text>
                  {renderCells('A', 50, 90, 3, 2, 55, 60, 8)}

                  {/* Зона Б — запчасти (правый верх, зелёный фон) */}
                  <rect x={290} y={60} width={300} height={200} rx={8} fill="#f0fdf4" stroke="#bbf7d0" strokeWidth={1.5} />
                  <text x={440} y={52} textAnchor="middle" fontSize={12} fontWeight="700" fill="#059669">ЗОНА Б</text>
                  <text x={440} y={64} textAnchor="middle" fontSize={9} fill="#10b981">Запчасти и компоненты</text>
                  {renderCells('B', 305, 80, 4, 2, 60, 60, 8)}

                  {/* Зона В — расходники (левый низ, жёлтый фон) */}
                  <rect x={30} y={300} width={220} height={200} rx={8} fill="#fffbeb" stroke="#fde68a" strokeWidth={1.5} />
                  <text x={140} y={292} textAnchor="middle" fontSize={12} fontWeight="700" fill="#d97706">ЗОНА В</text>
                  <text x={140} y={304} textAnchor="middle" fontSize={9} fill="#f59e0b">Расходные материалы</text>
                  {renderCells('V', 50, 320, 3, 2, 55, 60, 8)}

                  {/* Зона Г — инструменты (правый низ, фиолетовый фон) */}
                  <rect x={290} y={300} width={200} height={200} rx={8} fill="#f5f3ff" stroke="#ddd6fe" strokeWidth={1.5} />
                  <text x={390} y={292} textAnchor="middle" fontSize={12} fontWeight="700" fill="#7c3aed">ЗОНА Г</text>
                  <text x={390} y={304} textAnchor="middle" fontSize={9} fill="#8b5cf6">Инструменты</text>
                  {renderCells('G', 310, 320, 2, 2, 70, 60, 8)}

                  {/* Зона входа/выхода */}
                  <rect x={540} y={300} width={230} height={200} rx={8} fill="#fafafa" stroke="#e5e7eb" strokeWidth={1.5} strokeDasharray="5 3" />
                  <text x={655} y={292} textAnchor="middle" fontSize={11} fontWeight="600" fill="#6b7280">ЗОНА ПРИЁМКИ</text>

                  {/* Стрелка — вход */}
                  <defs>
                    <marker id="arrowBlue" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                      <path d="M0,0 L8,4 L0,8 Z" fill="#3b82f6" />
                    </marker>
                    <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                      <path d="M0,0 L8,4 L0,8 Z" fill="#10b981" />
                    </marker>
                  </defs>
                  <line x1={620} y1={540} x2={620} y2={510} stroke="#3b82f6" strokeWidth={2.5} markerEnd="url(#arrowBlue)" />
                  <text x={620} y={555} textAnchor="middle" fontSize={10} fill="#3b82f6" fontWeight="600">ВХОД</text>
                  <line x1={680} y1={510} x2={680} y2={540} stroke="#10b981" strokeWidth={2.5} markerEnd="url(#arrowGreen)" />
                  <text x={680} y={555} textAnchor="middle" fontSize={10} fill="#10b981" fontWeight="600">ВЫХОД</text>

                  {/* Коридор центральный */}
                  <rect x={255} y={60} width={28} height={440} rx={4} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth={1} />
                  <text
                    x={269} y={290}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#94a3b8"
                    fontWeight="500"
                    transform="rotate(-90, 269, 290)"
                  >
                    ЦЕНТРАЛЬНЫЙ КОРИДОР
                  </text>

                  {/* Легенда внизу */}
                  {(['free', 'occupied', 'reserved', 'defect'] as CellStatus[]).map((s, i) => {
                    const labels: Record<CellStatus, string> = { free: 'Свободно', occupied: 'Занято', reserved: 'Резерв', defect: 'Брак' };
                    return (
                      <g key={s}>
                        <rect x={30 + i * 110} y={570} width={14} height={14} rx={3} fill={CELL_COLORS[s]} stroke={CELL_STROKE[s]} strokeWidth={1} />
                        <text x={48 + i * 110} y={581} fontSize={9} fill="#6b7280">{labels[s]}</text>
                      </g>
                    );
                  })}
                </svg>
              </CardContent>
            </Card>

            {/* Правая панель */}
            <div className="w-56 flex flex-col gap-3 shrink-0">
              {selectedCell ? (
                <>
                  <Card>
                    <CardHeader className="pb-2 pt-3 px-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Icon name="MapPin" size={14} />Ячейка
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Адрес</span>
                        <span className="text-xs font-mono font-bold text-gray-800">{selectedCell.id}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Зона</span>
                        <span className="text-xs text-gray-700">
                          {ZONES.find(z => z.key === selectedCell.zone)?.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Ряд / Ячейка</span>
                        <span className="text-xs text-gray-700">{selectedCell.row} / {selectedCell.cell}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Статус</span>
                        <StatusBadge status={selectedCell.status} />
                      </div>
                    </CardContent>
                  </Card>

                  {selectedCell.sku && (
                    <Card>
                      <CardHeader className="pb-2 pt-3 px-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Icon name="Package" size={14} />Содержимое
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-3 pb-3 flex flex-col gap-1.5">
                        <p className="text-xs font-mono text-blue-600">{selectedCell.sku}</p>
                        <p className="text-xs text-gray-700 leading-tight">{selectedCell.name}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Icon name="Hash" size={11} className="text-gray-400" />
                          <span className="text-xs font-bold">{selectedCell.qty}</span>
                          <span className="text-xs text-gray-500">{selectedCell.unit}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader className="pb-2 pt-3 px-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Icon name="History" size={14} />Движения
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 flex flex-col gap-2">
                      {movements.map((m, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Icon name={(movementIcon[m.type] ?? 'Circle') as any} size={12} className="text-gray-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-gray-700">{m.type} {m.qty} ед.</p>
                            <p className="text-xs text-gray-400">{m.date} · {m.user}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <div className="flex flex-col gap-2">
                    <Button size="sm" variant="outline" onClick={handleMove} className="w-full text-xs">
                      <Icon name="ArrowRightLeft" size={12} className="mr-1.5" />Перенести
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleInventory} className="w-full text-xs">
                      <Icon name="ClipboardList" size={12} className="mr-1.5" />Инвентаризировать
                    </Button>
                  </div>
                </>
              ) : (
                <Card className="h-full">
                  <CardContent className="flex flex-col items-center justify-center h-48 p-4 text-center">
                    <Icon name="MousePointerClick" size={28} className="text-gray-300 mb-2" />
                    <p className="text-xs text-gray-400">Кликните на ячейку карты для просмотра информации</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── TAB: СТАТИСТИКА ── */}
        <TabsContent value="stats" className="mt-0">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Icon name="BarChart2" size={14} />Загрузка по зонам
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={STATS_DATA} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="zone" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="occupied" name="Занято" radius={[4, 4, 0, 0]}>
                      {STATS_DATA.map((d, i) => (
                        <Cell key={i} fill={d.fill} />
                      ))}
                    </Bar>
                    <Bar dataKey="free" name="Свободно" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Icon name="PieChart" size={14} />Распределение статусов
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3 mt-2">
                  {(
                    [
                      { status: 'occupied' as CellStatus, label: 'Занято', count: ALL_CELLS.filter(c => c.status === 'occupied').length },
                      { status: 'free' as CellStatus, label: 'Свободно', count: ALL_CELLS.filter(c => c.status === 'free').length },
                      { status: 'reserved' as CellStatus, label: 'Резерв', count: ALL_CELLS.filter(c => c.status === 'reserved').length },
                      { status: 'defect' as CellStatus, label: 'Брак', count: ALL_CELLS.filter(c => c.status === 'defect').length },
                    ]
                  ).map(row => {
                    const total = ALL_CELLS.length;
                    const pct = Math.round((row.count / total) * 100);
                    return (
                      <div key={row.status}>
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: CELL_COLORS[row.status] }} />
                            <span className="text-xs text-gray-600">{row.label}</span>
                          </div>
                          <span className="text-xs font-semibold text-gray-700">{row.count} ячеек ({pct}%)</span>
                        </div>
                        <ProgressBar value={pct} color={CELL_STROKE[row.status]} />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Icon name="TrendingUp" size={14} />Сводка по зонам
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 text-gray-500 font-medium">Зона</th>
                        <th className="text-left py-2 pr-4 text-gray-500 font-medium">Описание</th>
                        <th className="text-right py-2 pr-4 text-gray-500 font-medium">Всего</th>
                        <th className="text-right py-2 pr-4 text-gray-500 font-medium">Занято</th>
                        <th className="text-right py-2 pr-4 text-gray-500 font-medium">Свободно</th>
                        <th className="text-right py-2 text-gray-500 font-medium">Загрузка</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ZONES.map(z => {
                        const pct = Math.round((z.occupied / z.total) * 100);
                        return (
                          <tr key={z.key} className="border-b last:border-0">
                            <td className="py-2 pr-4">
                              <span className="font-semibold" style={{ color: z.color }}>{z.label}</span>
                            </td>
                            <td className="py-2 pr-4 text-gray-500">{z.description}</td>
                            <td className="py-2 pr-4 text-right text-gray-700">{z.total}</td>
                            <td className="py-2 pr-4 text-right text-gray-700">{z.occupied}</td>
                            <td className="py-2 pr-4 text-right text-gray-700">{z.total - z.occupied}</td>
                            <td className="py-2 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16">
                                  <ProgressBar value={pct} color={z.color} />
                                </div>
                                <span className="font-semibold" style={{ color: z.color }}>{pct}%</span>
                              </div>
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
    </div>
  );
}
