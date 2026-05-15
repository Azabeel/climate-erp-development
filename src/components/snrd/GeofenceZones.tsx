import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

// --- Types ---

type ZoneId = 'north' | 'south' | 'east' | 'west' | 'center';
type EditMode = 'view' | 'draw' | 'move';

interface ZoneEngineer {
  id: string;
  name: string;
  phone: string;
  ordersActive: number;
}

interface ServiceObject {
  id: string;
  name: string;
  address: string;
  type: string;
  slaPercent: number;
  x: number;
  y: number;
  zoneId: ZoneId;
}

interface GeofenceZone {
  id: ZoneId;
  name: string;
  label: string;
  color: string;
  fillColor: string;
  borderColor: string;
  engineers: ZoneEngineer[];
  polygon: string; // SVG points
  labelX: number;
  labelY: number;
  visible: boolean;
  ordersPerMonth: number;
  avgSlaPercent: number;
}

// --- Static Data ---

const initialZones: GeofenceZone[] = [
  {
    id: 'center',
    name: 'Центральный',
    label: 'Центр',
    color: 'red',
    fillColor: 'rgba(239,68,68,0.18)',
    borderColor: '#ef4444',
    polygon: '320,200 480,200 480,380 320,380',
    labelX: 400,
    labelY: 295,
    visible: true,
    ordersPerMonth: 47,
    avgSlaPercent: 94,
    engineers: [
      { id: 'e1', name: 'Иванов А.С.', phone: '+7 (916) 123-45-67', ordersActive: 3 },
      { id: 'e2', name: 'Смирнов Д.Н.', phone: '+7 (916) 765-43-21', ordersActive: 2 },
    ],
  },
  {
    id: 'north',
    name: 'Северный',
    label: 'Север',
    color: 'blue',
    fillColor: 'rgba(59,130,246,0.18)',
    borderColor: '#3b82f6',
    polygon: '200,30 600,30 600,210 480,210 480,200 320,200 200,200',
    labelX: 400,
    labelY: 115,
    visible: true,
    ordersPerMonth: 31,
    avgSlaPercent: 91,
    engineers: [
      { id: 'e3', name: 'Петров К.В.', phone: '+7 (916) 234-56-78', ordersActive: 4 },
      { id: 'e4', name: 'Козлов М.Р.', phone: '+7 (916) 876-54-32', ordersActive: 1 },
    ],
  },
  {
    id: 'south',
    name: 'Южный',
    label: 'Юг',
    color: 'green',
    fillColor: 'rgba(34,197,94,0.18)',
    borderColor: '#22c55e',
    polygon: '200,380 320,380 480,380 480,370 600,370 600,570 200,570',
    labelX: 400,
    labelY: 475,
    visible: true,
    ordersPerMonth: 39,
    avgSlaPercent: 88,
    engineers: [
      { id: 'e5', name: 'Волков П.А.', phone: '+7 (916) 345-67-89', ordersActive: 5 },
      { id: 'e6', name: 'Морозов С.И.', phone: '+7 (916) 987-65-43', ordersActive: 2 },
    ],
  },
  {
    id: 'west',
    name: 'Западный',
    label: 'Запад',
    color: 'purple',
    fillColor: 'rgba(168,85,247,0.18)',
    borderColor: '#a855f7',
    polygon: '30,30 200,30 200,570 30,570',
    labelX: 115,
    labelY: 300,
    visible: true,
    ordersPerMonth: 24,
    avgSlaPercent: 96,
    engineers: [
      { id: 'e7', name: 'Новиков Т.Е.', phone: '+7 (916) 456-78-90', ordersActive: 2 },
    ],
  },
  {
    id: 'east',
    name: 'Восточный',
    label: 'Восток',
    color: 'orange',
    fillColor: 'rgba(249,115,22,0.18)',
    borderColor: '#f97316',
    polygon: '600,30 770,30 770,570 600,570 600,370 600,210',
    labelX: 685,
    labelY: 300,
    visible: true,
    ordersPerMonth: 28,
    avgSlaPercent: 89,
    engineers: [
      { id: 'e8', name: 'Зайцев Л.В.', phone: '+7 (916) 567-89-01', ordersActive: 3 },
      { id: 'e9', name: 'Соколов Г.Ф.', phone: '+7 (916) 098-76-54', ordersActive: 1 },
    ],
  },
];

const serviceObjects: ServiceObject[] = [
  { id: 'o1', name: 'ТЦ «Радуга»', address: 'ул. Центральная, 12', type: 'Торговый центр', slaPercent: 97, x: 370, y: 250, zoneId: 'center' },
  { id: 'o2', name: 'Офис «Альфа»', address: 'пр. Ленина, 45', type: 'Офисный центр', slaPercent: 92, x: 430, y: 330, zoneId: 'center' },
  { id: 'o3', name: 'Гостиница «Север»', address: 'ул. Полярная, 3', type: 'Гостиница', slaPercent: 88, x: 350, y: 80, zoneId: 'north' },
  { id: 'o4', name: 'Завод «Металл»', address: 'пр. Заводской, 17', type: 'Производство', slaPercent: 95, x: 520, y: 140, zoneId: 'north' },
  { id: 'o5', name: 'ТРЦ «Южный»', address: 'ул. Южная, 88', type: 'Торговый центр', slaPercent: 91, x: 380, y: 480, zoneId: 'south' },
  { id: 'o6', name: 'Склад «Логистик»', address: 'пр. Транспортный, 5', type: 'Склад', slaPercent: 85, x: 480, y: 530, zoneId: 'south' },
  { id: 'o7', name: 'БЦ «Запад»', address: 'ул. Западная, 2', type: 'Бизнес-центр', slaPercent: 99, x: 100, y: 200, zoneId: 'west' },
  { id: 'o8', name: 'Банк «Восток»', address: 'ул. Восточная, 11', type: 'Банк', slaPercent: 94, x: 660, y: 260, zoneId: 'east' },
  { id: 'o9', name: 'ТЦ «Горизонт»', address: 'ул. Новая, 34', type: 'Торговый центр', slaPercent: 87, x: 700, y: 420, zoneId: 'east' },
  { id: 'o10', name: 'Больница №5', address: 'пр. Медицинский, 9', type: 'Медицина', slaPercent: 98, x: 90, y: 420, zoneId: 'west' },
];

const COLOR_BADGE: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  orange: 'bg-orange-100 text-orange-700',
  purple: 'bg-purple-100 text-purple-700',
  red: 'bg-red-100 text-red-700',
};

const EDIT_MODE_LABELS: Record<EditMode, string> = {
  view: 'Просмотр',
  draw: 'Рисование',
  move: 'Перемещение',
};

const EDIT_MODE_ICONS: Record<EditMode, string> = {
  view: 'Layers',
  draw: 'Pen',
  move: 'Move',
};

// --- Component ---

export default function GeofenceZones() {
  const [zones, setZones] = useState<GeofenceZone[]>(initialZones);
  const [selectedZoneId, setSelectedZoneId] = useState<ZoneId | null>(null);
  const [hoveredZoneId, setHoveredZoneId] = useState<ZoneId | null>(null);
  const [editMode, setEditMode] = useState<EditMode>('view');

  const selectedZone = zones.find((z) => z.id === selectedZoneId) ?? null;
  const zoneObjects = selectedZone
    ? serviceObjects.filter((o) => o.zoneId === selectedZone.id)
    : [];

  function toggleVisibility(id: ZoneId) {
    setZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, visible: !z.visible } : z))
    );
  }

  function handleZoneClick(id: ZoneId) {
    setSelectedZoneId((prev) => (prev === id ? null : id));
  }

  function handleAutoDistribute() {
    alert('Автоматическое распределение запущено. Алгоритм балансировки назначит зоны по загрузке инженеров.');
  }

  function handleExport() {
    alert('Экспорт геозон в формате GeoJSON подготовлен к скачиванию.');
  }

  const totalObjects = serviceObjects.length;
  const totalZones = zones.length;
  const visibleZones = zones.filter((z) => z.visible).length;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Icon name="Map" size={20} className="text-blue-600" />
          <span className="font-semibold text-gray-800 text-base">Геозоны и территории обслуживания</span>
          <span className="text-xs text-gray-400 ml-2">
            {visibleZones}/{totalZones} зон · {totalObjects} объектов
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Edit mode switcher */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(['view', 'draw', 'move'] as EditMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setEditMode(mode)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  editMode === mode
                    ? 'bg-white shadow text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon name={EDIT_MODE_ICONS[mode] as any} size={13} />
                {EDIT_MODE_LABELS[mode]}
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleAutoDistribute}>
            <Icon name="Users" size={14} />
            Авторасп.
          </Button>

          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
            <Icon name="Download" size={14} />
            Экспорт
          </Button>

          <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
            <Icon name="Plus" size={14} />
            Создать зону
          </Button>
        </div>
      </div>

      {/* Draw mode instruction banner */}
      {editMode === 'draw' && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center gap-2 text-sm text-blue-700">
          <Icon name="Pen" size={14} />
          <strong>Режим рисования:</strong> кликайте по карте, чтобы добавить точки новой геозоны. Двойной клик — закрыть контур.
        </div>
      )}
      {editMode === 'move' && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-sm text-amber-700">
          <Icon name="Move" size={14} />
          <strong>Режим перемещения:</strong> зажмите и перетащите вершину геозоны для её перемещения.
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Panel */}
        <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
          <div className="px-3 py-2 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Геозоны</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {zones.map((zone) => {
              const objCount = serviceObjects.filter((o) => o.zoneId === zone.id).length;
              const isSelected = selectedZoneId === zone.id;

              return (
                <div
                  key={zone.id}
                  onClick={() => handleZoneClick(zone.id)}
                  className={`flex items-start gap-2 px-3 py-3 cursor-pointer border-b border-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Color dot */}
                  <div
                    className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0 border-2"
                    style={{ background: zone.fillColor, borderColor: zone.borderColor }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-medium text-sm text-gray-800 truncate">{zone.name}</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleVisibility(zone.id); }}
                          className="text-gray-400 hover:text-gray-600 p-0.5 rounded"
                          title={zone.visible ? 'Скрыть' : 'Показать'}
                        >
                          <Icon name={zone.visible ? 'Eye' : 'EyeOff'} size={13} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); }}
                          className="text-gray-400 hover:text-blue-600 p-0.5 rounded"
                          title="Редактировать"
                        >
                          <Icon name="Edit" size={13} />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">
                      {zone.engineers[0]?.name}
                      {zone.engineers.length > 1 && ` +${zone.engineers.length - 1}`}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400 flex items-center gap-0.5">
                        <Icon name="Package" size={10} />
                        {objCount} объ.
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-0.5">
                        <Icon name="BarChart3" size={10} />
                        {zone.ordersPerMonth} нар/мес
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="px-3 py-3 border-t border-gray-100 bg-gray-50">
            <div className="text-xs text-gray-500 font-medium mb-1">Итого по городу</div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Нарядов/мес:</span>
              <span className="font-semibold">{zones.reduce((s, z) => s + z.ordersPerMonth, 0)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-0.5">
              <span>Ср. SLA:</span>
              <span className="font-semibold">
                {Math.round(zones.reduce((s, z) => s + z.avgSlaPercent, 0) / zones.length)}%
              </span>
            </div>
          </div>
        </div>

        {/* SVG Map */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          <div className="flex-1 overflow-hidden bg-gray-200 relative">
            <svg
              viewBox="0 0 800 600"
              className="w-full h-full"
              style={{ display: 'block' }}
            >
              {/* City background */}
              <rect x="0" y="0" width="800" height="600" fill="#e5e7eb" />

              {/* Street grid simulation */}
              {[100, 200, 300, 400, 500, 600, 700].map((x) => (
                <line key={`vl-${x}`} x1={x} y1="0" x2={x} y2="600" stroke="#d1d5db" strokeWidth="1" />
              ))}
              {[100, 200, 300, 400, 500].map((y) => (
                <line key={`hl-${y}`} x1="0" y1={y} x2="800" y2={y} stroke="#d1d5db" strokeWidth="1" />
              ))}

              {/* Main roads */}
              <line x1="400" y1="0" x2="400" y2="600" stroke="#c9cdd4" strokeWidth="3" />
              <line x1="0" y1="300" x2="800" y2="300" stroke="#c9cdd4" strokeWidth="3" />

              {/* City blocks */}
              {[
                { x: 40, y: 40, w: 120, h: 60 }, { x: 220, y: 40, w: 80, h: 50 },
                { x: 420, y: 50, w: 100, h: 40 }, { x: 620, y: 50, w: 100, h: 60 },
                { x: 40, y: 150, w: 80, h: 70 }, { x: 220, y: 220, w: 60, h: 50 },
                { x: 540, y: 220, w: 40, h: 70 }, { x: 630, y: 200, w: 80, h: 60 },
                { x: 40, y: 320, w: 100, h: 80 }, { x: 220, y: 420, w: 70, h: 90 },
                { x: 420, y: 420, w: 80, h: 60 }, { x: 540, y: 410, w: 120, h: 80 },
                { x: 640, y: 380, w: 90, h: 70 }, { x: 40, y: 480, w: 120, h: 70 },
              ].map((b, i) => (
                <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill="#d1d5db" rx="2" />
              ))}

              {/* Zone polygons */}
              {zones.map((zone) => {
                if (!zone.visible) return null;
                const isSelected = selectedZoneId === zone.id;
                const isHovered = hoveredZoneId === zone.id;

                return (
                  <g key={zone.id}>
                    <polygon
                      points={zone.polygon}
                      fill={zone.fillColor}
                      stroke={zone.borderColor}
                      strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.5}
                      strokeDasharray={editMode === 'draw' ? '6 3' : undefined}
                      style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                      onClick={() => handleZoneClick(zone.id)}
                      onMouseEnter={() => setHoveredZoneId(zone.id)}
                      onMouseLeave={() => setHoveredZoneId(null)}
                    />
                    {/* Zone label */}
                    <text
                      x={zone.labelX}
                      y={zone.labelY - 8}
                      textAnchor="middle"
                      fontSize="13"
                      fontWeight="600"
                      fill={zone.borderColor}
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {zone.name}
                    </text>
                    <text
                      x={zone.labelX}
                      y={zone.labelY + 8}
                      textAnchor="middle"
                      fontSize="10"
                      fill={zone.borderColor}
                      opacity={0.8}
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {zone.engineers[0]?.name.split(' ')[0]}
                      {zone.engineers.length > 1 ? ` +${zone.engineers.length - 1}` : ''}
                    </text>
                  </g>
                );
              })}

              {/* Service objects */}
              {serviceObjects.map((obj) => {
                const zone = zones.find((z) => z.id === obj.zoneId);
                if (!zone?.visible) return null;
                const isInSelected = selectedZoneId === obj.zoneId;

                return (
                  <g key={obj.id} style={{ cursor: 'pointer' }}>
                    <rect
                      x={obj.x - 6}
                      y={obj.y - 6}
                      width={12}
                      height={12}
                      rx="2"
                      fill={isInSelected ? zone.borderColor : '#ffffff'}
                      stroke={zone?.borderColor ?? '#6b7280'}
                      strokeWidth={isInSelected ? 2 : 1.5}
                    />
                    <title>{obj.name} — {obj.address}</title>
                  </g>
                );
              })}

              {/* Edit mode — draw cursor indicator */}
              {editMode === 'draw' && (
                <circle cx="790" cy="590" r="6" fill="#3b82f6" opacity="0.5" />
              )}
            </svg>

            {/* Legend */}
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg shadow px-3 py-2 text-xs">
              <div className="font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                <Icon name="Layers" size={12} />
                Легенда
              </div>
              <div className="flex flex-col gap-1">
                {zones.filter((z) => z.visible).map((zone) => (
                  <div key={zone.id} className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-sm border"
                      style={{ background: zone.fillColor, borderColor: zone.borderColor }}
                    />
                    <span className="text-gray-600">{zone.name}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1.5 mt-1 pt-1 border-t border-gray-100">
                  <div className="w-3 h-3 rounded-sm border border-gray-400 bg-white" />
                  <span className="text-gray-500">Объект обслуживания</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Detail Panel */}
        {selectedZone && (
          <div className="w-72 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
            {/* Zone header */}
            <div
              className="px-4 py-4 border-b"
              style={{ borderLeftWidth: 4, borderLeftColor: selectedZone.borderColor }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{selectedZone.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Геозона · {zoneObjects.length} объектов</div>
                </div>
                <button
                  onClick={() => setSelectedZoneId(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded"
                >
                  <Icon name="Square" size={14} />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-gray-800">{selectedZone.ordersPerMonth}</div>
                  <div className="text-xs text-gray-500">нарядов/мес</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <div
                    className="text-lg font-bold"
                    style={{ color: selectedZone.avgSlaPercent >= 90 ? '#16a34a' : '#d97706' }}
                  >
                    {selectedZone.avgSlaPercent}%
                  </div>
                  <div className="text-xs text-gray-500">ср. SLA</div>
                </div>
              </div>
            </div>

            {/* Engineers */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-1.5 mb-2">
                <Icon name="Users" size={14} className="text-gray-500" />
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Инженеры ({selectedZone.engineers.length})
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {selectedZone.engineers.map((eng) => (
                  <div key={eng.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-2.5 py-2">
                    <div>
                      <div className="text-sm font-medium text-gray-800">{eng.name}</div>
                      <div className="text-xs text-gray-400">{eng.phone}</div>
                    </div>
                    <div className="text-right">
                      <div
                        className="text-xs font-semibold"
                        style={{ color: eng.ordersActive > 3 ? '#dc2626' : '#16a34a' }}
                      >
                        {eng.ordersActive} активных
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Service objects */}
            <div className="px-4 py-3 flex-1">
              <div className="flex items-center gap-1.5 mb-2">
                <Icon name="MapPin" size={14} className="text-gray-500" />
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Объекты ({zoneObjects.length})
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {zoneObjects.map((obj) => (
                  <div key={obj.id} className="border border-gray-100 rounded-lg px-2.5 py-2">
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">{obj.name}</div>
                        <div className="text-xs text-gray-400 truncate">{obj.address}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{obj.type}</div>
                      </div>
                      <div
                        className="text-xs font-semibold flex-shrink-0"
                        style={{ color: obj.slaPercent >= 90 ? '#16a34a' : '#d97706' }}
                      >
                        SLA {obj.slaPercent}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs">
                <Icon name="Edit" size={12} />
                Изменить
              </Button>
              <Button variant="outline" size="sm" className="gap-1 text-xs text-red-600 hover:text-red-700 hover:border-red-300">
                <Icon name="Trash2" size={12} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
