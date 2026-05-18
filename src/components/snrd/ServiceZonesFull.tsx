import { useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

// --- Types ---

type ZoneId = 'z1' | 'z2' | 'z3' | 'z4' | 'z5' | 'z6' | 'z7' | 'z8';
type LayerKey = 'zones' | 'engineers' | 'clients';

interface ZoneEngineer {
  id: string;
  name: string;
  initials: string;
  color: string;
  x: number;
  y: number;
}

interface ServiceZone {
  id: ZoneId;
  name: string;
  color: string;
  fillColor: string;
  districts: string[];
  engineerCount: number;
  clientCount: number;
  ordersMonth: number;
  polygon: string;
  labelX: number;
  labelY: number;
  engineers: ZoneEngineer[];
}

interface ClientDot {
  id: string;
  x: number;
  y: number;
  zoneId: ZoneId;
}

// --- Static Data ---

const ZONES: ServiceZone[] = [
  {
    id: 'z1',
    name: 'Северный',
    color: '#3b82f6',
    fillColor: 'rgba(59,130,246,0.25)',
    districts: ['Дмитровский', 'Тимирязевский', 'Ховрино'],
    engineerCount: 3,
    clientCount: 48,
    ordersMonth: 62,
    polygon: '200,20 420,20 420,160 280,200 180,180',
    labelX: 300,
    labelY: 100,
    engineers: [
      { id: 'e1', name: 'Алексей Петров', initials: 'АП', color: '#3b82f6', x: 270, y: 80 },
      { id: 'e2', name: 'Дмитрий Кузнецов', initials: 'ДК', color: '#1d4ed8', x: 340, y: 60 },
      { id: 'e3', name: 'Сергей Волков', initials: 'СВ', color: '#60a5fa', x: 390, y: 120 },
    ],
  },
  {
    id: 'z2',
    name: 'Северо-Восточный',
    color: '#8b5cf6',
    fillColor: 'rgba(139,92,246,0.25)',
    districts: ['Бабушкинский', 'Медведково', 'Лосиноостровский'],
    engineerCount: 2,
    clientCount: 39,
    ordersMonth: 47,
    polygon: '420,20 600,20 620,180 420,160',
    labelX: 510,
    labelY: 90,
    engineers: [
      { id: 'e4', name: 'Иван Смирнов', initials: 'ИС', color: '#8b5cf6', x: 480, y: 70 },
      { id: 'e5', name: 'Николай Фёдоров', initials: 'НФ', color: '#7c3aed', x: 560, y: 130 },
    ],
  },
  {
    id: 'z3',
    name: 'Восточный',
    color: '#f59e0b',
    fillColor: 'rgba(245,158,11,0.25)',
    districts: ['Перово', 'Новогиреево', 'Косино-Ухтомский'],
    engineerCount: 2,
    clientCount: 41,
    ordersMonth: 53,
    polygon: '620,180 640,360 500,380 460,220 420,160',
    labelX: 545,
    labelY: 270,
    engineers: [
      { id: 'e6', name: 'Андрей Попов', initials: 'АП', color: '#f59e0b', x: 590, y: 250 },
      { id: 'e7', name: 'Виктор Лебедев', initials: 'ВЛ', color: '#d97706', x: 610, y: 320 },
    ],
  },
  {
    id: 'z4',
    name: 'Юго-Восточный',
    color: '#ef4444',
    fillColor: 'rgba(239,68,68,0.25)',
    districts: ['Люблино', 'Марьино', 'Капотня'],
    engineerCount: 2,
    clientCount: 35,
    ordersMonth: 44,
    polygon: '500,380 640,360 620,520 440,540 420,420',
    labelX: 530,
    labelY: 450,
    engineers: [
      { id: 'e8', name: 'Павел Козлов', initials: 'ПК', color: '#ef4444', x: 560, y: 430 },
      { id: 'e9', name: 'Роман Новиков', initials: 'РН', color: '#dc2626', x: 580, y: 490 },
    ],
  },
  {
    id: 'z5',
    name: 'Южный',
    color: '#10b981',
    fillColor: 'rgba(16,185,129,0.25)',
    districts: ['Царицыно', 'Орехово-Борисово', 'Бирюлёво'],
    engineerCount: 2,
    clientCount: 37,
    ordersMonth: 49,
    polygon: '240,540 420,420 440,540 320,580 200,560',
    labelX: 330,
    labelY: 500,
    engineers: [
      { id: 'e10', name: 'Максим Соколов', initials: 'МС', color: '#10b981', x: 340, y: 490 },
      { id: 'e11', name: 'Евгений Морозов', initials: 'ЕМ', color: '#059669', x: 400, y: 530 },
    ],
  },
  {
    id: 'z6',
    name: 'Юго-Западный',
    color: '#f97316',
    fillColor: 'rgba(249,115,22,0.25)',
    districts: ['Чертаново', 'Зябликово', 'Нагатино'],
    engineerCount: 2,
    clientCount: 32,
    ordersMonth: 38,
    polygon: '140,380 240,540 200,560 100,500 80,380',
    labelX: 155,
    labelY: 470,
    engineers: [
      { id: 'e12', name: 'Олег Васильев', initials: 'ОВ', color: '#f97316', x: 140, y: 450 },
      { id: 'e13', name: 'Артём Захаров', initials: 'АЗ', color: '#ea580c', x: 170, y: 510 },
    ],
  },
  {
    id: 'z7',
    name: 'Западный',
    color: '#06b6d4',
    fillColor: 'rgba(6,182,212,0.25)',
    districts: ['Кунцево', 'Можайский', 'Солнцево'],
    engineerCount: 2,
    clientCount: 44,
    ordersMonth: 58,
    polygon: '80,200 180,180 280,200 240,380 140,380 80,380',
    labelX: 165,
    labelY: 290,
    engineers: [
      { id: 'e14', name: 'Константин Яковлев', initials: 'КЯ', color: '#06b6d4', x: 120, y: 280 },
      { id: 'e15', name: 'Михаил Сорокин', initials: 'МС', color: '#0891b2', x: 170, y: 340 },
    ],
  },
  {
    id: 'z8',
    name: 'Центральный',
    color: '#ec4899',
    fillColor: 'rgba(236,72,153,0.25)',
    districts: ['Арбат', 'Пресненский', 'Тверской', 'Замоскворечье'],
    engineerCount: 1,
    clientCount: 36,
    ordersMonth: 51,
    polygon: '280,200 420,160 460,220 420,420 240,380',
    labelX: 355,
    labelY: 295,
    engineers: [
      { id: 'e16', name: 'Вячеслав Титов', initials: 'ВТ', color: '#ec4899', x: 360, y: 290 },
    ],
  },
];

const CLIENT_DOTS: ClientDot[] = [
  { id: 'c1', x: 255, y: 55, zoneId: 'z1' }, { id: 'c2', x: 300, y: 90, zoneId: 'z1' },
  { id: 'c3', x: 370, y: 75, zoneId: 'z1' }, { id: 'c4', x: 320, y: 140, zoneId: 'z1' },
  { id: 'c5', x: 400, y: 45, zoneId: 'z1' }, { id: 'c6', x: 245, y: 130, zoneId: 'z1' },
  { id: 'c7', x: 455, y: 60, zoneId: 'z2' }, { id: 'c8', x: 510, y: 45, zoneId: 'z2' },
  { id: 'c9', x: 555, y: 80, zoneId: 'z2' }, { id: 'c10', x: 590, y: 50, zoneId: 'z2' },
  { id: 'c11', x: 475, y: 130, zoneId: 'z2' }, { id: 'c12', x: 540, y: 155, zoneId: 'z2' },
  { id: 'c13', x: 465, y: 200, zoneId: 'z3' }, { id: 'c14', x: 530, y: 220, zoneId: 'z3' },
  { id: 'c15', x: 590, y: 200, zoneId: 'z3' }, { id: 'c16', x: 625, y: 270, zoneId: 'z3' },
  { id: 'c17', x: 490, y: 300, zoneId: 'z3' }, { id: 'c18', x: 615, y: 330, zoneId: 'z3' },
  { id: 'c19', x: 510, y: 400, zoneId: 'z4' }, { id: 'c20', x: 570, y: 420, zoneId: 'z4' },
  { id: 'c21', x: 600, y: 470, zoneId: 'z4' }, { id: 'c22', x: 545, y: 500, zoneId: 'z4' },
  { id: 'c23', x: 470, y: 460, zoneId: 'z4' }, { id: 'c24', x: 610, y: 390, zoneId: 'z4' },
  { id: 'c25', x: 290, y: 460, zoneId: 'z5' }, { id: 'c26', x: 350, y: 480, zoneId: 'z5' },
  { id: 'c27', x: 400, y: 500, zoneId: 'z5' }, { id: 'c28', x: 320, y: 530, zoneId: 'z5' },
  { id: 'c29', x: 260, y: 510, zoneId: 'z5' }, { id: 'c30', x: 380, y: 545, zoneId: 'z5' },
  { id: 'c31', x: 125, y: 415, zoneId: 'z6' }, { id: 'c32', x: 165, y: 465, zoneId: 'z6' },
  { id: 'c33', x: 200, y: 500, zoneId: 'z6' }, { id: 'c34', x: 150, y: 510, zoneId: 'z6' },
  { id: 'c35', x: 110, y: 470, zoneId: 'z6' }, { id: 'c36', x: 190, y: 430, zoneId: 'z6' },
  { id: 'c37', x: 110, y: 240, zoneId: 'z7' }, { id: 'c38', x: 145, y: 290, zoneId: 'z7' },
  { id: 'c39', x: 200, y: 310, zoneId: 'z7' }, { id: 'c40', x: 160, y: 350, zoneId: 'z7' },
  { id: 'c41', x: 215, y: 245, zoneId: 'z7' }, { id: 'c42', x: 95, y: 310, zoneId: 'z7' },
  { id: 'c43', x: 320, y: 230, zoneId: 'z8' }, { id: 'c44', x: 370, y: 260, zoneId: 'z8' },
  { id: 'c45', x: 400, y: 330, zoneId: 'z8' }, { id: 'c46', x: 340, y: 370, zoneId: 'z8' },
  { id: 'c47', x: 310, y: 290, zoneId: 'z8' }, { id: 'c48', x: 430, y: 360, zoneId: 'z8' },
];

const WORKLOAD_DATA = [
  { day: 'Пн', orders: 14 }, { day: 'Вт', orders: 18 }, { day: 'Ср', orders: 22 },
  { day: 'Чт', orders: 16 }, { day: 'Пт', orders: 20 }, { day: 'Сб', orders: 9 }, { day: 'Вс', orders: 4 },
];

const WORK_TYPES_DATA = [
  { name: 'Ремонт', value: 42, color: '#3b82f6' },
  { name: 'ТО', value: 28, color: '#10b981' },
  { name: 'Монтаж', value: 18, color: '#f59e0b' },
  { name: 'Гарантия', value: 12, color: '#8b5cf6' },
];

// --- Main Component ---

export default function ServiceZonesFull() {
  const [zones] = useState<ServiceZone[]>(ZONES);
  const [selectedZoneId, setSelectedZoneId] = useState<ZoneId | null>(null);
  const [hoveredZoneId, setHoveredZoneId] = useState<ZoneId | null>(null);
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({ zones: true, engineers: true, clients: true });
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ServiceZone | null>(null);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneDistricts, setNewZoneDistricts] = useState('');
  const [newZoneColor, setNewZoneColor] = useState('#6366f1');

  const selectedZone = zones.find(z => z.id === selectedZoneId) ?? null;

  const toggleLayer = (layer: LayerKey) =>
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));

  const handleZoneClick = (zoneId: ZoneId) =>
    setSelectedZoneId(prev => (prev === zoneId ? null : zoneId));

  const handleEditZone = (zone: ServiceZone) => {
    setEditingZone(zone);
    setEditDialogOpen(true);
  };

  const handleAddZone = () => {
    if (!newZoneName.trim()) {
      toast.error('Введите название зоны');
      return;
    }
    toast.success(`Зона «${newZoneName}» создана`);
    setNewZoneName('');
    setNewZoneDistricts('');
    setAddDialogOpen(false);
  };

  const handleRedistribute = () => {
    toast.success('Запрос на перераспределение отправлен диспетчеру');
  };

  const kpiList = [
    { label: 'Зон всего', value: '8', icon: 'Map' },
    { label: 'Инженеров', value: '16', icon: 'Users' },
    { label: 'Клиентов', value: '312', icon: 'Building2' },
    { label: 'Покрытие', value: '94%', icon: 'CheckCircle' },
  ];

  return (
    <div className="flex h-full bg-gray-50">
      {/* Left Panel */}
      <div className="w-72 flex-shrink-0 border-r bg-white flex flex-col overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-base text-gray-900 mb-3">Зоны обслуживания</h2>
          <div className="grid grid-cols-2 gap-2">
            {kpiList.map(kpi => (
              <div key={kpi.label} className="bg-gray-50 rounded-lg p-2 flex flex-col gap-0.5">
                <div className="flex items-center gap-1 text-gray-500">
                  <Icon name={kpi.icon as any} size={12} />
                  <span className="text-xs">{kpi.label}</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{kpi.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {zones.map(zone => (
            <div
              key={zone.id}
              className={`rounded-lg border p-3 cursor-pointer transition-all ${
                selectedZoneId === zone.id
                  ? 'border-blue-400 bg-blue-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
              }`}
              onClick={() => handleZoneClick(zone.id)}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: zone.color }} />
                  <span className="text-sm font-medium text-gray-900">{zone.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-1.5 text-xs"
                  onClick={e => { e.stopPropagation(); handleEditZone(zone); }}
                >
                  <Icon name="Pencil" size={11} />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mb-2 leading-relaxed">{zone.districts.join(', ')}</p>
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Icon name="Users" size={11} />
                  {zone.engineerCount} инж.
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Building2" size={11} />
                  {zone.clientCount} кл.
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t">
          <Button className="w-full" size="sm" onClick={() => setAddDialogOpen(true)}>
            <Icon name="Plus" size={14} className="mr-1.5" />
            Добавить зону
          </Button>
        </div>
      </div>

      {/* Center — SVG Map */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-3 border-b bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(['zones', 'engineers', 'clients'] as LayerKey[]).map(layer => {
              const labels: Record<LayerKey, string> = { zones: 'Зоны', engineers: 'Инженеры', clients: 'Клиенты' };
              return (
                <Button
                  key={layer}
                  variant={layers[layer] ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => toggleLayer(layer)}
                >
                  {labels[layer]}
                </Button>
              );
            })}
          </div>
          <span className="text-xs text-gray-500">Москва и МО · {zones.reduce((a, z) => a + z.clientCount, 0)} клиентов</span>
        </div>

        <div className="flex-1 p-4 overflow-hidden">
          <div className="h-full rounded-xl border bg-white shadow-sm overflow-hidden relative">
            <svg viewBox="0 0 800 600" className="w-full h-full" style={{ background: '#f8fafc' }}>
              {/* Grid lines */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="800" height="600" fill="url(#grid)" />

              {/* Zone polygons */}
              {layers.zones && zones.map(zone => (
                <polygon
                  key={zone.id}
                  points={zone.polygon}
                  fill={zone.fillColor}
                  stroke={zone.color}
                  strokeWidth={selectedZoneId === zone.id || hoveredZoneId === zone.id ? 2.5 : 1.5}
                  strokeDasharray={selectedZoneId === zone.id ? undefined : '6,3'}
                  opacity={selectedZoneId && selectedZoneId !== zone.id ? 0.5 : 1}
                  style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                  onClick={() => handleZoneClick(zone.id)}
                  onMouseEnter={() => setHoveredZoneId(zone.id)}
                  onMouseLeave={() => setHoveredZoneId(null)}
                />
              ))}

              {/* Zone labels */}
              {layers.zones && zones.map(zone => (
                <text
                  key={`lbl-${zone.id}`}
                  x={zone.labelX}
                  y={zone.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill={zone.color}
                  opacity={selectedZoneId && selectedZoneId !== zone.id ? 0.4 : 0.85}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {zone.name}
                </text>
              ))}

              {/* Client dots */}
              {layers.clients && CLIENT_DOTS.map(dot => {
                const zone = zones.find(z => z.id === dot.zoneId);
                const dimmed = selectedZoneId && selectedZoneId !== dot.zoneId;
                return (
                  <circle
                    key={dot.id}
                    cx={dot.x}
                    cy={dot.y}
                    r={3.5}
                    fill={zone?.color ?? '#6b7280'}
                    opacity={dimmed ? 0.2 : 0.75}
                    stroke="white"
                    strokeWidth={0.8}
                  />
                );
              })}

              {/* Engineer markers */}
              {layers.engineers && zones.map(zone =>
                zone.engineers.map(eng => {
                  const dimmed = selectedZoneId && selectedZoneId !== zone.id;
                  return (
                    <g key={eng.id} opacity={dimmed ? 0.2 : 1}>
                      <circle cx={eng.x} cy={eng.y} r={14} fill={eng.color} stroke="white" strokeWidth={2} />
                      <text
                        x={eng.x}
                        y={eng.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="8"
                        fontWeight="700"
                        fill="white"
                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                      >
                        {eng.initials}
                      </text>
                    </g>
                  );
                })
              )}

              {/* Legend */}
              <g transform="translate(16, 520)">
                <rect x={0} y={0} width={200} height={70} rx={6} fill="white" fillOpacity={0.92} stroke="#e2e8f0" strokeWidth={1} />
                <text x={8} y={16} fontSize="9" fontWeight="600" fill="#374151">Легенда зон</text>
                {zones.slice(0, 4).map((z, i) => (
                  <g key={z.id} transform={`translate(8, ${26 + i * 10})`}>
                    <rect width={8} height={8} rx={2} fill={z.color} />
                    <text x={12} y={7} fontSize="8" fill="#4b5563">{z.name}</text>
                  </g>
                ))}
                {zones.slice(4).map((z, i) => (
                  <g key={z.id} transform={`translate(104, ${26 + i * 10})`}>
                    <rect width={8} height={8} rx={2} fill={z.color} />
                    <text x={12} y={7} fontSize="8" fill="#4b5563">{z.name}</text>
                  </g>
                ))}
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-64 flex-shrink-0 border-l bg-white flex flex-col overflow-hidden">
        {selectedZone ? (
          <>
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedZone.color }} />
                <h3 className="font-semibold text-sm text-gray-900">{selectedZone.name}</h3>
              </div>
              <p className="text-xs text-gray-500">{selectedZone.districts.join(', ')}</p>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{selectedZone.engineerCount}</div>
                  <div className="text-xs text-gray-500">Инж.</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{selectedZone.clientCount}</div>
                  <div className="text-xs text-gray-500">Клиент.</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{selectedZone.ordersMonth}</div>
                  <div className="text-xs text-gray-500">Нарядов</div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {/* Engineers list */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Инженеры</p>
                <div className="space-y-1.5">
                  {selectedZone.engineers.map(eng => (
                    <div key={eng.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: eng.color }}
                      >
                        {eng.initials}
                      </div>
                      <span className="text-xs text-gray-800 leading-tight">{eng.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workload bar chart */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Нагрузка по дням</p>
                <ResponsiveContainer width="100%" height={90}>
                  <BarChart data={WORKLOAD_DATA} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                    <XAxis dataKey="day" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 11, padding: '4px 8px' }}
                      formatter={(v: number) => [v, 'Нарядов']}
                    />
                    <Bar dataKey="orders" fill={selectedZone.color} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Work types pie chart */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Типы работ</p>
                <ResponsiveContainer width="100%" height={110}>
                  <PieChart>
                    <Pie
                      data={WORK_TYPES_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={28}
                      outerRadius={46}
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {WORK_TYPES_DATA.map(entry => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ fontSize: 11, padding: '4px 8px' }}
                      formatter={(v: number) => [`${v}%`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1 mt-1">
                  {WORK_TYPES_DATA.map(item => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-gray-600">{item.name}</span>
                      </div>
                      <span className="text-xs font-medium text-gray-800">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 border-t">
              <Button variant="outline" size="sm" className="w-full text-xs" onClick={handleRedistribute}>
                <Icon name="ArrowRightLeft" size={13} className="mr-1.5" />
                Перераспределить инженера
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Icon name="Map" size={24} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">Выберите зону</p>
            <p className="text-xs text-gray-400 mt-1">Нажмите на зону на карте или в списке</p>
          </div>
        )}
      </div>

      {/* Add Zone Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Добавить зону обслуживания</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Название зоны</label>
              <Input
                placeholder="Северо-Западный"
                value={newZoneName}
                onChange={e => setNewZoneName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Районы (через запятую)</label>
              <Input
                placeholder="Строгино, Митино, Тушино"
                value={newZoneDistricts}
                onChange={e => setNewZoneDistricts(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Цвет зоны</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={newZoneColor}
                  onChange={e => setNewZoneColor(e.target.value)}
                  className="w-10 h-10 rounded border cursor-pointer"
                />
                <Select defaultValue="none">
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Назначить инженера" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Не назначать —</SelectItem>
                    <SelectItem value="e1">Алексей Петров</SelectItem>
                    <SelectItem value="e2">Дмитрий Кузнецов</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleAddZone}>Создать зону</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Zone Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать зону: {editingZone?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Название зоны</label>
              <Input defaultValue={editingZone?.name} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Районы</label>
              <Input defaultValue={editingZone?.districts.join(', ')} />
            </div>
            {editingZone && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Инженеры в зоне</label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs py-1">Имя</TableHead>
                      <TableHead className="text-xs py-1 text-right">Действие</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editingZone.engineers.map(eng => (
                      <TableRow key={eng.id}>
                        <TableCell className="text-xs py-1.5">{eng.name}</TableCell>
                        <TableCell className="py-1.5 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-red-500 hover:text-red-700"
                            onClick={() => toast.info(`${eng.name} будет переназначен`)}
                          >
                            Убрать
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Отмена</Button>
            <Button onClick={() => { toast.success('Зона обновлена'); setEditDialogOpen(false); }}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
