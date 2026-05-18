import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
type ObjType = 'office' | 'warehouse' | 'mall' | 'residential' | 'industrial';
type ObjStatus = 'active' | 'warranty' | 'overdue';

interface ServiceObject {
  id: number;
  name: string;
  address: string;
  type: ObjType;
  status: ObjStatus;
  client: string;
  clientType: 'ООО' | 'ИП';
  lastTO: string;
  nextTO: string;
  nextTOStatus: 'ok' | 'soon' | 'overdue';
  sla: string;
  engineer: string;
  equipment: { model: string; status: string }[];
  x: number;
  y: number;
}

// ─── Static Data ──────────────────────────────────────────────────────────────
const OBJECTS: ServiceObject[] = [
  { id:1,  name:'БЦ «Сатурн»',          address:'ул. Тверская, 14',        type:'office',      status:'active',   client:'ООО «Импульс»',        clientType:'ООО', lastTO:'12.03.2026', nextTO:'12.06.2026', nextTOStatus:'ok',      sla:'Корпоративный', engineer:'Петров А.В.', equipment:[{model:'Daikin FTXS50',status:'OK'},{model:'Mitsubishi MSZ-LN35',status:'OK'},{model:'Panasonic CS-E18',status:'Требует ТО'}], x:450, y:200 },
  { id:2,  name:'ТЦ «Галактика»',        address:'Ленинградский пр., 80',   type:'mall',        status:'active',   client:'ООО «ТЦ Галактика»',   clientType:'ООО', lastTO:'05.04.2026', nextTO:'05.07.2026', nextTOStatus:'ok',      sla:'Договорной L1', engineer:'Иванов К.П.', equipment:[{model:'Daikin VRV-IV 22.4',status:'OK'},{model:'Daikin VRV-IV 16.0',status:'OK'},{model:'Carrier 42GQ',status:'OK'},{model:'Lennox LCC',status:'Гарантия'}], x:390, y:160 },
  { id:3,  name:'Склад «Логистик»',      address:'МКАД 62-й км',           type:'warehouse',   status:'overdue',  client:'ИП Сидоров М.Н.',      clientType:'ИП',  lastTO:'10.01.2026', nextTO:'10.04.2026', nextTOStatus:'overdue', sla:'Базовый',       engineer:'Сидоров М.Н.', equipment:[{model:'Systemair AHU-6',status:'Неисправен'},{model:'Breeze BRT-60',status:'OK'}], x:630, y:350 },
  { id:4,  name:'Офис «ЦентрБанк»',      address:'Новый Арбат, 21',         type:'office',      status:'warranty', client:'ООО «ЦентрБанк»',      clientType:'ООО', lastTO:'20.02.2026', nextTO:'20.05.2026', nextTOStatus:'soon',    sla:'Договорной L2', engineer:'Козлов Р.Е.', equipment:[{model:'Mitsubishi Heavy SRK50',status:'Гарантия'},{model:'Fujitsu ASYG14',status:'Гарантия'},{model:'LG Multi S',status:'OK'}], x:420, y:240 },
  { id:5,  name:'Завод «МеталлГрупп»',   address:'Промышленная ул., 5',     type:'industrial',  status:'active',   client:'ООО «МеталлГрупп»',    clientType:'ООО', lastTO:'01.05.2026', nextTO:'01.08.2026', nextTOStatus:'ok',      sla:'Корпоративный', engineer:'Новиков Д.С.', equipment:[{model:'Chiller Carrier 30XA',status:'OK'},{model:'AHU Rosenberg',status:'OK'},{model:'Clivet CPAN-XHE',status:'OK'},{model:'York YCAS',status:'Требует ТО'}], x:280, y:390 },
  { id:6,  name:'ЖК «Алые Паруса»',      address:'Авиационная ул., 77',     type:'residential', status:'warranty', client:'ООО «УК АлыеПаруса»',  clientType:'ООО', lastTO:'15.04.2026', nextTO:'15.07.2026', nextTOStatus:'ok',      sla:'Базовый',       engineer:'Морозов В.А.', equipment:[{model:'Daikin FTXA35',status:'Гарантия'},{model:'Daikin FTXA25',status:'Гарантия'}], x:340, y:140 },
  { id:7,  name:'ТЦ «Европейский»',       address:'Киевская пл., 2',         type:'mall',        status:'active',   client:'ООО «ТЦ Европейский»', clientType:'ООО', lastTO:'03.03.2026', nextTO:'03.06.2026', nextTOStatus:'ok',      sla:'Договорной L1', engineer:'Алексеев И.О.', equipment:[{model:'VRF Daikin VRV-IV 28',status:'OK'},{model:'VRF Daikin VRV-IV 22',status:'OK'},{model:'FCU Daikin FWD',status:'OK'}], x:395, y:255 },
  { id:8,  name:'БЦ «Олимп»',            address:'Ленинский пр., 109',      type:'office',      status:'overdue',  client:'ООО «Олимп Эстейт»',   clientType:'ООО', lastTO:'02.02.2026', nextTO:'02.05.2026', nextTOStatus:'overdue', sla:'Договорной L2', engineer:'Громов П.Г.', equipment:[{model:'Midea MV6-V450W/V2GN1',status:'OK'},{model:'Midea MSMA-18N8',status:'Неисправен'}], x:455, y:300 },
  { id:9,  name:'Склад «Хладокомбинат»', address:'Холодильная ул., 3',      type:'warehouse',   status:'active',   client:'ООО «Арктик Фуд»',     clientType:'ООО', lastTO:'18.04.2026', nextTO:'18.07.2026', nextTOStatus:'ok',      sla:'Корпоративный', engineer:'Петров А.В.', equipment:[{model:'Güntner AGHN',status:'OK'},{model:'Bitzer 4JE-22Y',status:'OK'}], x:530, y:160 },
  { id:10, name:'Офис «Газпром»',         address:'Наметкина ул., 16',       type:'office',      status:'active',   client:'ООО «Газпром СЦ»',     clientType:'ООО', lastTO:'10.04.2026', nextTO:'10.07.2026', nextTOStatus:'ok',      sla:'Договорной L1', engineer:'Иванов К.П.', equipment:[{model:'Daikin VRV-IV 22',status:'OK'},{model:'Daikin SkyAir',status:'OK'},{model:'Daikin Altherma',status:'OK'}], x:430, y:340 },
  { id:11, name:'ЖК «Квадрат»',           address:'Сходненская ул., 60',     type:'residential', status:'warranty', client:'ИП Воронов А.П.',       clientType:'ИП',  lastTO:'22.03.2026', nextTO:'22.06.2026', nextTOStatus:'ok',      sla:'Базовый',       engineer:'Сидоров М.Н.', equipment:[{model:'Haier AS12NW',status:'Гарантия'},{model:'Haier AS09NW',status:'Гарантия'}], x:310, y:170 },
  { id:12, name:'Завод «Пластик»',        address:'Производственная ул., 8', type:'industrial',  status:'overdue',  client:'ООО «Пластик Групп»',   clientType:'ООО', lastTO:'05.01.2026', nextTO:'05.04.2026', nextTOStatus:'overdue', sla:'Базовый',       engineer:'Козлов Р.Е.', equipment:[{model:'Emerson Vilter',status:'Требует ТО'},{model:'Copeland ZR',status:'OK'}], x:600, y:420 },
  { id:13, name:'БЦ «Москва-Сити»',       address:'Краснопресненская наб.', type:'office',      status:'active',   client:'ООО «Сити Менеджмент»',clientType:'ООО', lastTO:'01.05.2026', nextTO:'01.08.2026', nextTOStatus:'ok',      sla:'Договорной L2', engineer:'Новиков Д.С.', equipment:[{model:'Daikin VRV-IV 50',status:'OK'},{model:'Daikin VRV-IV 40',status:'OK'},{model:'York Chiller',status:'OK'}], x:408, y:228 },
  { id:14, name:'ТЦ «Мега Химки»',        address:'Химки, ул. Репина, 1',   type:'mall',        status:'active',   client:'ООО «Мега Ритейл»',    clientType:'ООО', lastTO:'12.04.2026', nextTO:'12.07.2026', nextTOStatus:'ok',      sla:'Договорной L1', engineer:'Морозов В.А.', equipment:[{model:'Carrier AHU',status:'OK'},{model:'Trane Chiller',status:'OK'},{model:'York FCU',status:'OK'}], x:368, y:110 },
  { id:15, name:'Склад «Рублёво»',        address:'Рублёвское ш., 104',      type:'warehouse',   status:'warranty', client:'ИП Крылов Н.А.',        clientType:'ИП',  lastTO:'29.03.2026', nextTO:'29.06.2026', nextTOStatus:'ok',      sla:'Базовый',       engineer:'Алексеев И.О.', equipment:[{model:'Polair CM107-S',status:'Гарантия'}], x:280, y:250 },
];

const TYPE_LABELS: Record<ObjType, string> = { office:'Офис', warehouse:'Склад', mall:'ТЦ', residential:'Жильё', industrial:'Производство' };
const TYPE_COLORS: Record<ObjType, string> = { office:'#6366f1', warehouse:'#f97316', mall:'#a855f7', residential:'#22c55e', industrial:'#ef4444' };
const TYPE_BADGE: Record<ObjType, 'default'|'secondary'|'outline'|'destructive'> = { office:'default', warehouse:'secondary', mall:'outline', residential:'secondary', industrial:'destructive' };
const STATUS_LABELS: Record<ObjStatus, string> = { active:'Активен', warranty:'На гарантии', overdue:'Просрочен ТО' };

// ─── District Polygons (schematic Moscow) ────────────────────────────────────
const DISTRICTS = [
  { id:'cao',  label:'ЦАО',   fill:'#e5e5e5', stroke:'#c8c8c8', points:'390,200 440,180 480,210 470,260 430,275 385,250' },
  { id:'sao',  label:'САО',   fill:'#ebebeb', stroke:'#c8c8c8', points:'370,120 430,100 490,130 480,185 440,180 390,200 370,170' },
  { id:'svao', label:'СВАО',  fill:'#e8e8e8', stroke:'#c8c8c8', points:'490,130 560,100 620,140 600,200 540,215 480,185' },
  { id:'vao',  label:'ВАО',   fill:'#eeeeee', stroke:'#c8c8c8', points:'540,215 600,200 660,230 650,300 580,320 520,290 480,255' },
  { id:'yuao', label:'ЮВАО',  fill:'#e5e5e5', stroke:'#c8c8c8', points:'520,290 580,320 630,360 610,420 550,440 490,400 470,340' },
  { id:'uao',  label:'ЮАО',   fill:'#ebebeb', stroke:'#c8c8c8', points:'430,275 470,260 470,340 490,400 450,430 400,420 380,360 390,300' },
  { id:'szao', label:'СЗАО',  fill:'#e8e8e8', stroke:'#c8c8c8', points:'290,150 370,120 390,200 370,170 340,200 290,220' },
  { id:'zao',  label:'ЗАО',   fill:'#f0f0f0', stroke:'#c8c8c8', points:'290,220 340,200 390,250 385,320 340,360 280,340 260,280' },
];

const DISTRICT_LABELS = [
  { label:'ЦАО',  x:428, y:230 }, { label:'САО',   x:428, y:148 },
  { label:'СВАО', x:548, y:162 }, { label:'ВАО',   x:578, y:262 },
  { label:'ЮВАО', x:548, y:368 }, { label:'ЮАО',   x:432, y:368 },
  { label:'ЗАО',  x:318, y:290 }, { label:'СЗАО',  x:328, y:185 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function nextTOBadge(status: ServiceObject['nextTOStatus']) {
  if (status === 'ok') return <Badge className="bg-green-100 text-green-700 text-xs">В срок</Badge>;
  if (status === 'soon') return <Badge className="bg-yellow-100 text-yellow-700 text-xs">Скоро</Badge>;
  return <Badge className="bg-red-100 text-red-700 text-xs">Просрочено</Badge>;
}

function statusBadge(s: ObjStatus) {
  const map = { active:'bg-green-100 text-green-700', warranty:'bg-blue-100 text-blue-700', overdue:'bg-red-100 text-red-700' };
  return <Badge className={`${map[s]} text-xs`}>{STATUS_LABELS[s]}</Badge>;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ObjectsMapFull() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; obj: ServiceObject } | null>(null);

  const filtered = useMemo(() => OBJECTS.filter(o => {
    const matchSearch = search === '' || o.name.toLowerCase().includes(search.toLowerCase()) || o.address.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || o.type === typeFilter;
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  }), [search, typeFilter, statusFilter]);

  const selected = OBJECTS.find(o => o.id === selectedId) ?? null;

  const typeCounts = useMemo(() => {
    const c: Record<ObjType, number> = { office:0, warehouse:0, mall:0, residential:0, industrial:0 };
    OBJECTS.forEach(o => c[o.type]++);
    return c;
  }, []);

  const handleMarkerClick = (obj: ServiceObject) => {
    setSelectedId(prev => prev === obj.id ? null : obj.id);
  };

  const handleMarkerHover = (e: React.MouseEvent<SVGCircleElement>, obj: ServiceObject) => {
    const rect = (e.target as SVGCircleElement).closest('svg')!.getBoundingClientRect();
    setHoveredId(obj.id);
    setTooltip({ x: obj.x, y: obj.y, obj });
  };

  const handleMarkerLeave = () => {
    setHoveredId(null);
    setTooltip(null);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 mr-2">
          <Icon name="Map" className="text-indigo-600" size={20} />
          <span className="font-semibold text-gray-800 text-base">Карта объектов</span>
        </div>
        <div className="relative flex-1 min-w-48 max-w-72">
          <Icon name="Search" className="absolute left-2.5 top-2.5 text-gray-400" size={15} />
          <Input
            placeholder="Поиск объекта или адреса..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44 h-9 text-sm"><SelectValue placeholder="Тип объекта" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все типы</SelectItem>
            <SelectItem value="office">Офисы</SelectItem>
            <SelectItem value="warehouse">Склады</SelectItem>
            <SelectItem value="mall">ТЦ</SelectItem>
            <SelectItem value="residential">Жильё</SelectItem>
            <SelectItem value="industrial">Производство</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 h-9 text-sm"><SelectValue placeholder="Статус" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="active">Активен</SelectItem>
            <SelectItem value="warranty">На гарантии</SelectItem>
            <SelectItem value="overdue">Просрочен ТО</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto text-xs text-gray-500">
          Показано: <span className="font-semibold text-gray-700">{filtered.length}</span> из {OBJECTS.length}
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-64 bg-white border-r flex flex-col shrink-0">
          {/* Counters */}
          <div className="p-3 border-b space-y-2">
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-xs text-gray-600">Всего объектов</span>
              <span className="font-bold text-gray-800">247</span>
            </div>
            <div className="flex items-center justify-between bg-yellow-50 rounded-lg px-3 py-2">
              <span className="text-xs text-yellow-700">Требует ТО</span>
              <span className="font-bold text-yellow-800">34</span>
            </div>
            <div className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
              <span className="text-xs text-blue-700">На гарантии</span>
              <span className="font-bold text-blue-800">89</span>
            </div>
          </div>

          {/* Objects list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="p-4 text-center text-xs text-gray-400">Объекты не найдены</div>
            )}
            {filtered.map(obj => (
              <button
                key={obj.id}
                onClick={() => handleMarkerClick(obj)}
                className={`w-full text-left px-3 py-2.5 border-b border-gray-100 hover:bg-indigo-50 transition-colors ${selectedId === obj.id ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : ''}`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-semibold text-gray-800 truncate mr-1">{obj.name}</span>
                  <span
                    className="inline-block w-2 h-2 rounded-full shrink-0"
                    style={{ background: TYPE_COLORS[obj.type] }}
                  />
                </div>
                <div className="text-xs text-gray-500 truncate mb-1">{obj.address}</div>
                <div className="flex items-center gap-1">
                  <Badge variant={TYPE_BADGE[obj.type]} className="text-xs py-0 px-1.5">{TYPE_LABELS[obj.type]}</Badge>
                  {statusBadge(obj.status)}
                </div>
                <div className="text-xs text-gray-400 mt-1">ТО: {obj.lastTO}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Map center */}
        <div className="flex-1 relative overflow-hidden bg-gray-100">
          <svg
            viewBox="0 0 900 600"
            className="w-full h-full"
            style={{ display:'block' }}
          >
            {/* Background */}
            <rect width="900" height="600" fill="#f4f4f4" />

            {/* Grid */}
            {Array.from({ length: 18 }, (_, i) => (
              <line key={`vg${i}`} x1={i * 50} y1={0} x2={i * 50} y2={600} stroke="#e8e8e8" strokeWidth="0.5" />
            ))}
            {Array.from({ length: 12 }, (_, i) => (
              <line key={`hg${i}`} x1={0} y1={i * 50} x2={900} y2={i * 50} stroke="#e8e8e8" strokeWidth="0.5" />
            ))}

            {/* Districts */}
            {DISTRICTS.map(d => (
              <polygon
                key={d.id}
                points={d.points}
                fill={d.fill}
                stroke={d.stroke}
                strokeWidth="1"
              />
            ))}

            {/* TTK — inner ring */}
            <ellipse cx="450" cy="240" rx="80" ry="70" fill="none" stroke="#c0c0c0" strokeWidth="2" strokeDasharray="6,3" />

            {/* MKAD — outer ring */}
            <ellipse cx="450" cy="270" rx="220" ry="185" fill="none" stroke="#a0a0a0" strokeWidth="2.5" strokeDasharray="8,4" />

            {/* Road lines */}
            <line x1="450" y1="85" x2="450" y2="455" stroke="#d0d0d0" strokeWidth="1.5" />
            <line x1="230" y1="270" x2="670" y2="270" stroke="#d0d0d0" strokeWidth="1.5" />
            <line x1="270" y1="130" x2="630" y2="410" stroke="#d0d0d0" strokeWidth="1" />
            <line x1="630" y1="130" x2="270" y2="410" stroke="#d0d0d0" strokeWidth="1" />

            {/* MKAD/TTK labels */}
            <text x="670" y="270" fontSize="9" fill="#888" fontFamily="sans-serif">МКАД</text>
            <text x="530" y="175" fontSize="8" fill="#aaa" fontFamily="sans-serif">ТТК</text>

            {/* District labels */}
            {DISTRICT_LABELS.map(dl => (
              <text key={dl.label} x={dl.x} y={dl.y} textAnchor="middle" fontSize="9" fill="#b0b0b0" fontFamily="sans-serif" fontWeight="500">{dl.label}</text>
            ))}

            {/* Object markers */}
            {OBJECTS.map(obj => {
              const isSelected = selectedId === obj.id;
              const isHovered = hoveredId === obj.id;
              const isFiltered = !filtered.find(f => f.id === obj.id);
              const r = isSelected ? 12 : isHovered ? 11 : 9;
              const color = TYPE_COLORS[obj.type];
              return (
                <g key={obj.id} style={{ cursor: 'pointer' }} onClick={() => handleMarkerClick(obj)}>
                  {isSelected && (
                    <circle cx={obj.x} cy={obj.y} r={20} fill="none" stroke={color} strokeWidth="2.5" opacity="0.5" />
                  )}
                  <circle
                    cx={obj.x}
                    cy={obj.y}
                    r={r}
                    fill={isFiltered ? '#cccccc' : color}
                    stroke="white"
                    strokeWidth="2"
                    opacity={isFiltered ? 0.35 : 1}
                    onMouseEnter={e => !isFiltered && handleMarkerHover(e as any, obj)}
                    onMouseLeave={handleMarkerLeave}
                  />
                  {obj.status === 'overdue' && !isFiltered && (
                    <circle cx={obj.x + 7} cy={obj.y - 7} r={4} fill="#ef4444" stroke="white" strokeWidth="1" />
                  )}
                  {isSelected && (
                    <text x={obj.x} y={obj.y + 3} textAnchor="middle" fontSize="8" fill="white" fontFamily="sans-serif" fontWeight="700" pointerEvents="none">✓</text>
                  )}
                </g>
              );
            })}

            {/* Cluster example — SVAO has dense area */}
            <g style={{ cursor: 'pointer' }} onClick={() => toast.info('Кластер: 12 объектов в СВАО')}>
              <circle cx={580} cy={130} r={16} fill="#6366f1" stroke="white" strokeWidth="2" opacity="0.85" />
              <text x={580} y={134} textAnchor="middle" fontSize="10" fill="white" fontFamily="sans-serif" fontWeight="700">12</text>
            </g>

            {/* Tooltip */}
            {tooltip && (
              <g>
                <rect
                  x={tooltip.x + 15}
                  y={tooltip.y - 30}
                  width={160}
                  height={46}
                  rx={6}
                  fill="rgba(30,30,40,0.92)"
                />
                <text x={tooltip.x + 23} y={tooltip.y - 14} fontSize="10" fill="white" fontFamily="sans-serif" fontWeight="600">{tooltip.obj.name}</text>
                <text x={tooltip.x + 23} y={tooltip.y + 4} fontSize="9" fill="#ccc" fontFamily="sans-serif">{tooltip.obj.address}</text>
              </g>
            )}

            {/* Legend */}
            {(Object.keys(TYPE_COLORS) as ObjType[]).map((t, i) => (
              <g key={t}>
                <circle cx={720 + (i % 3) * 54} cy={540 + Math.floor(i / 3) * 18} r={5} fill={TYPE_COLORS[t]} />
                <text x={730 + (i % 3) * 54} y={544 + Math.floor(i / 3) * 18} fontSize="9" fill="#555" fontFamily="sans-serif">{TYPE_LABELS[t]}</text>
              </g>
            ))}
          </svg>
        </div>

        {/* Right panel */}
        {selected && (
          <div className="w-72 bg-white border-l flex flex-col shrink-0 overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-800 text-sm leading-tight mr-2">{selected.name}</h3>
                <button onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600 shrink-0 mt-0.5">
                  <Icon name="X" size={15} />
                </button>
              </div>
              <div className="flex items-center gap-1.5 mb-2">
                <Badge variant={TYPE_BADGE[selected.type]} className="text-xs">{TYPE_LABELS[selected.type]}</Badge>
                {statusBadge(selected.status)}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Icon name="MapPin" size={13} className="text-gray-400 shrink-0" />
                <span>{selected.address}</span>
              </div>
            </div>

            {/* Client */}
            <div className="px-4 py-3 border-b">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Клиент</div>
              <div className="text-sm font-medium text-gray-800">{selected.clientType} {selected.client.replace(/^ООО |^ИП /, '')}</div>
              <button
                onClick={() => toast.info(`Открытие карточки клиента: ${selected.client}`)}
                className="text-xs text-indigo-600 hover:text-indigo-800 underline mt-1 flex items-center gap-1"
              >
                <Icon name="ExternalLink" size={11} />
                Открыть карточку клиента
              </button>
            </div>

            {/* Equipment */}
            <div className="px-4 py-3 border-b">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Оборудование</div>
              <div className="space-y-1.5">
                {selected.equipment.map((eq, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs text-gray-700 truncate mr-2">{eq.model}</span>
                    <span className={`text-xs shrink-0 font-medium ${eq.status === 'OK' ? 'text-green-600' : eq.status === 'Гарантия' ? 'text-blue-600' : 'text-red-600'}`}>
                      {eq.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* TO info */}
            <div className="px-4 py-3 border-b">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Техническое обслуживание</div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Последнее ТО</span>
                  <span className="font-medium text-gray-700">{selected.lastTO}</span>
                </div>
                <div className="flex justify-between text-xs items-center">
                  <span className="text-gray-500">Следующее ТО</span>
                  <span className="font-medium text-gray-700 mr-1">{selected.nextTO}</span>
                </div>
                <div className="flex justify-end">{nextTOBadge(selected.nextTOStatus)}</div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Инженер</span>
                  <span className="font-medium text-gray-700">{selected.engineer}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">SLA</span>
                  <span className="font-medium text-indigo-600">{selected.sla}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 py-3 space-y-2">
              <Button
                size="sm"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8"
                onClick={() => toast.success(`Наряд создан для объекта «${selected.name}»`)}
              >
                <Icon name="Plus" size={13} className="mr-1.5" />
                Создать наряд
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs h-8"
                onClick={() => toast.success(`Плановое ТО запланировано для «${selected.name}»`)}
              >
                <Icon name="CalendarCheck" size={13} className="mr-1.5" />
                Запланировать ТО
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="bg-white border-t px-4 py-2 flex gap-3 overflow-x-auto shrink-0">
        {(Object.keys(TYPE_LABELS) as ObjType[]).map(t => (
          <Card key={t} className="shrink-0 min-w-36 shadow-none border">
            <CardContent className="px-3 py-2 flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: TYPE_COLORS[t] }}
              />
              <div>
                <div className="text-xs text-gray-500">{TYPE_LABELS[t]}</div>
                <div className="font-bold text-gray-800 text-sm">{typeCounts[t]}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
