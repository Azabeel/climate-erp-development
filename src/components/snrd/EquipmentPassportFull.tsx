import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type EquipStatus = 'active' | 'maintenance' | 'decommissioned';
type WorkType = 'planned' | 'unplanned' | 'warranty';
type RefrigerantOp = 'charge' | 'top_up' | 'recovery';

interface MaintenanceRecord {
  date: string;
  type: WorkType;
  engineer: string;
  works: string;
  cost: number;
  status: 'completed' | 'in_progress';
}

interface RefrigerantEntry {
  date: string;
  op: RefrigerantOp;
  volume: number;
  engineer: string;
  cylinder: string;
  orderId: string;
}

interface Equipment {
  id: string;
  name: string;
  brand: string;
  model: string;
  serial: string;
  year: number;
  type: string;
  refrigerant: string;
  power: number;
  status: EquipStatus;
  location: string;
  address: string;
  room: string;
  installDate: string;
  lastMaintenance: string;
  nextMaintenance: string;
  totalOrders: number;
  chargeKg: number;
  maxChargeKg: number;
  leakPercent: number;
  maintenanceHistory: MaintenanceRecord[];
  refrigerantLog: RefrigerantEntry[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const EQUIPMENT_LIST: Equipment[] = [
  {
    id: 'eq-001',
    name: 'Daikin VRF — БЦ «Восток» 3 эт.',
    brand: 'Daikin',
    model: 'REYQ16T',
    serial: 'DK-2022-03-0041',
    year: 2022,
    type: 'VRF',
    refrigerant: 'R-410A',
    power: 45,
    status: 'active',
    location: 'БЦ «Восток»',
    address: 'г. Москва, ул. Академика Янгеля, 15',
    room: '3 этаж, серверная зона',
    installDate: '12.03.2022',
    lastMaintenance: '15.03.2026',
    nextMaintenance: '15.09.2026',
    totalOrders: 18,
    chargeKg: 1.8,
    maxChargeKg: 2.5,
    leakPercent: 12,
    maintenanceHistory: [
      { date: '15.03.2026', type: 'planned', engineer: 'Петров А.В.', works: 'Плановое ТО: замена фильтров, проверка давления хладагента, очистка конденсатора', cost: 8500, status: 'completed' },
      { date: '02.11.2025', type: 'unplanned', engineer: 'Смирнов К.Л.', works: 'Замена вентилятора внутреннего блока № 4', cost: 15200, status: 'completed' },
      { date: '10.09.2025', type: 'planned', engineer: 'Петров А.В.', works: 'Плановое ТО: промывка дренажных систем, диагностика', cost: 7800, status: 'completed' },
      { date: '28.04.2025', type: 'warranty', engineer: 'Иванов Д.С.', works: 'Гарантийная замена платы управления', cost: 0, status: 'completed' },
      { date: '14.03.2025', type: 'planned', engineer: 'Петров А.В.', works: 'Плановое ТО: проверка всех внутренних блоков (16 шт.)', cost: 12000, status: 'completed' },
      { date: '05.10.2024', type: 'planned', engineer: 'Козлов М.Р.', works: 'Осеннее ТО: подготовка к зимнему сезону', cost: 9200, status: 'completed' },
    ],
    refrigerantLog: [
      { date: '15.03.2026', op: 'top_up', volume: 0.3, engineer: 'Петров А.В.', cylinder: 'CYL-R410-081', orderId: 'WO-2026-001124' },
      { date: '02.11.2025', op: 'charge', volume: 0.8, engineer: 'Смирнов К.Л.', cylinder: 'CYL-R410-074', orderId: 'WO-2025-004812' },
      { date: '10.09.2025', op: 'top_up', volume: 0.2, engineer: 'Петров А.В.', cylinder: 'CYL-R410-074', orderId: 'WO-2025-003901' },
      { date: '28.04.2025', op: 'recovery', volume: 1.5, engineer: 'Иванов Д.С.', cylinder: 'CYL-R410-069', orderId: 'WO-2025-002110' },
      { date: '14.03.2025', op: 'charge', volume: 2.5, engineer: 'Петров А.В.', cylinder: 'CYL-R410-069', orderId: 'WO-2025-001440' },
    ],
  },
  {
    id: 'eq-002',
    name: 'Mitsubishi VRF — Банк «Горизонт»',
    brand: 'Mitsubishi Electric',
    model: 'PURY-P200YSKM-A',
    serial: 'ME-2021-08-022B',
    year: 2021,
    type: 'VRF',
    refrigerant: 'R-410A',
    power: 56,
    status: 'maintenance',
    location: 'Банк «Горизонт» головной офис',
    address: 'г. Москва, Ленинградский пр-т, 80',
    room: 'Этажи 1–5, все зоны',
    installDate: '20.08.2021',
    lastMaintenance: '01.04.2026',
    nextMaintenance: '01.10.2026',
    totalOrders: 27,
    chargeKg: 3.1,
    maxChargeKg: 4.0,
    leakPercent: 8,
    maintenanceHistory: [
      { date: '01.04.2026', type: 'unplanned', engineer: 'Козлов М.Р.', works: 'Диагностика и ремонт компрессора наружного блока', cost: 42000, status: 'in_progress' },
      { date: '10.02.2026', type: 'planned', engineer: 'Смирнов К.Л.', works: 'Плановое ТО зимнее: диагностика, чистка фильтров', cost: 18500, status: 'completed' },
      { date: '15.09.2025', type: 'planned', engineer: 'Козлов М.Р.', works: 'Осеннее ТО всей системы', cost: 22000, status: 'completed' },
      { date: '03.06.2025', type: 'warranty', engineer: 'Петров А.В.', works: 'Гарантийная замена платы BC-контроллера', cost: 0, status: 'completed' },
      { date: '18.03.2025', type: 'planned', engineer: 'Смирнов К.Л.', works: 'Плановое ТО весеннее', cost: 18500, status: 'completed' },
    ],
    refrigerantLog: [
      { date: '01.04.2026', op: 'recovery', volume: 2.0, engineer: 'Козлов М.Р.', cylinder: 'CYL-R410-088', orderId: 'WO-2026-001890' },
      { date: '01.04.2026', op: 'charge', volume: 2.0, engineer: 'Козлов М.Р.', cylinder: 'CYL-R410-088', orderId: 'WO-2026-001890' },
      { date: '10.02.2026', op: 'top_up', volume: 0.4, engineer: 'Смирнов К.Л.', cylinder: 'CYL-R410-081', orderId: 'WO-2026-000421' },
    ],
  },
  {
    id: 'eq-003',
    name: 'Hitachi Чиллер — ТЦ «Планета»',
    brand: 'Hitachi',
    model: 'RCUE18CD',
    serial: 'HT-2020-05-007',
    year: 2020,
    type: 'Чиллер',
    refrigerant: 'R-410A',
    power: 52,
    status: 'decommissioned',
    location: 'ТЦ «Планета»',
    address: 'г. Москва, ул. Твардовского, 8',
    room: 'Технический этаж -1',
    installDate: '05.05.2020',
    lastMaintenance: '10.01.2026',
    nextMaintenance: '—',
    totalOrders: 34,
    chargeKg: 0,
    maxChargeKg: 6.0,
    leakPercent: 0,
    maintenanceHistory: [
      { date: '10.01.2026', type: 'unplanned', engineer: 'Иванов Д.С.', works: 'Диагностика перед списанием', cost: 4500, status: 'completed' },
      { date: '05.10.2025', type: 'planned', engineer: 'Иванов Д.С.', works: 'Плановое ТО', cost: 11000, status: 'completed' },
      { date: '22.05.2025', type: 'unplanned', engineer: 'Козлов М.Р.', works: 'Ремонт насосного модуля', cost: 28000, status: 'completed' },
    ],
    refrigerantLog: [
      { date: '10.01.2026', op: 'recovery', volume: 5.2, engineer: 'Иванов Д.С.', cylinder: 'CYL-R410-079', orderId: 'WO-2026-000088' },
    ],
  },
];

// ─── Chart Data ───────────────────────────────────────────────────────────────

const ORDERS_BY_MONTH = [
  { month: 'Июн', orders: 1 },
  { month: 'Июл', orders: 0 },
  { month: 'Авг', orders: 2 },
  { month: 'Сен', orders: 1 },
  { month: 'Окт', orders: 1 },
  { month: 'Ноя', orders: 3 },
  { month: 'Дек', orders: 1 },
  { month: 'Янв', orders: 0 },
  { month: 'Фев', orders: 1 },
  { month: 'Мар', orders: 2 },
  { month: 'Апр', orders: 1 },
  { month: 'Май', orders: 4 },
];

const COST_BY_YEAR = [
  { year: '2021', cost: 14500 },
  { year: '2022', cost: 32800 },
  { year: '2023', cost: 41200 },
  { year: '2024', cost: 28600 },
  { year: '2025', cost: 53500 },
  { year: '2026', cost: 23700 },
];

const REFRIGERANT_HISTORY = [
  { month: 'Июн', kg: 2.5 },
  { month: 'Июл', kg: 2.4 },
  { month: 'Авг', kg: 2.3 },
  { month: 'Сен', kg: 2.1 },
  { month: 'Окт', kg: 2.5 },
  { month: 'Ноя', kg: 2.5 },
  { month: 'Дек', kg: 2.5 },
  { month: 'Янв', kg: 2.3 },
  { month: 'Фев', kg: 2.5 },
  { month: 'Мар', kg: 2.5 },
  { month: 'Апр', kg: 2.0 },
  { month: 'Май', kg: 1.8 },
];

const WEAR_COMPONENTS = [
  { name: 'Компрессор', percent: 67, color: 'text-orange-500' },
  { name: 'Конденсатор', percent: 45, color: 'text-yellow-500' },
  { name: 'Испаритель', percent: 32, color: 'text-green-500' },
  { name: 'Вентилятор', percent: 78, color: 'text-red-500' },
];

const DOCUMENTS = [
  { name: 'Паспорт изделия', ext: 'PDF', icon: 'FileText', size: '2.4 МБ' },
  { name: 'Руководство по монтажу', ext: 'PDF', icon: 'BookOpen', size: '8.1 МБ' },
  { name: 'Сертификат соответствия', ext: 'PDF', icon: 'Award', size: '0.8 МБ' },
  { name: 'Гарантийный талон', ext: 'PDF', icon: 'ShieldCheck', size: '0.3 МБ' },
  { name: 'Акт ТО № 1 (14.03.2025)', ext: 'PDF', icon: 'ClipboardCheck', size: '0.5 МБ' },
  { name: 'Акт ТО № 2 (10.09.2025)', ext: 'PDF', icon: 'ClipboardCheck', size: '0.5 МБ' },
  { name: 'Акт ТО № 3 (02.11.2025)', ext: 'PDF', icon: 'ClipboardCheck', size: '0.6 МБ' },
  { name: 'Акт ТО № 4 (14.03.2026)', ext: 'PDF', icon: 'ClipboardCheck', size: '0.5 МБ' },
  { name: 'Акт ТО № 5 (15.03.2026)', ext: 'PDF', icon: 'ClipboardCheck', size: '0.5 МБ' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusBadge(status: EquipStatus) {
  if (status === 'active') return <Badge className="bg-green-100 text-green-700 border-green-200">В эксплуатации</Badge>;
  if (status === 'maintenance') return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">На обслуживании</Badge>;
  return <Badge className="bg-gray-100 text-gray-600 border-gray-200">Списано</Badge>;
}

function workTypeBadge(type: WorkType) {
  if (type === 'planned') return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Плановое</Badge>;
  if (type === 'unplanned') return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Внеплановое</Badge>;
  return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Гарантийное</Badge>;
}

function refrigerantOpBadge(op: RefrigerantOp) {
  if (op === 'charge') return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Заправка</Badge>;
  if (op === 'top_up') return <Badge className="bg-green-100 text-green-700 border-green-200">Дозаправка</Badge>;
  return <Badge className="bg-gray-100 text-gray-600 border-gray-200">Утилизация</Badge>;
}

function fmtCurrency(val: number) {
  if (val === 0) return '—';
  return val.toLocaleString('ru-RU') + ' ₽';
}

function yearsInService(installDate: string) {
  const [d, m, y] = installDate.split('.').map(Number);
  const install = new Date(y, m - 1, d);
  const diff = (Date.now() - install.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  return diff.toFixed(1);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function QRPlaceholder({ serial }: { serial: string }) {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" className="rounded border border-gray-200">
      <rect width="80" height="80" fill="#f9fafb" />
      <rect x="8" y="8" width="24" height="24" rx="2" fill="none" stroke="#374151" strokeWidth="2" />
      <rect x="13" y="13" width="14" height="14" rx="1" fill="#374151" />
      <rect x="48" y="8" width="24" height="24" rx="2" fill="none" stroke="#374151" strokeWidth="2" />
      <rect x="53" y="13" width="14" height="14" rx="1" fill="#374151" />
      <rect x="8" y="48" width="24" height="24" rx="2" fill="none" stroke="#374151" strokeWidth="2" />
      <rect x="13" y="53" width="14" height="14" rx="1" fill="#374151" />
      {[48,52,56,60,64,68].map((x, i) => (
        <rect key={i} x={x} y={48 + (i % 3) * 8} width="4" height="4" fill="#374151" />
      ))}
      <text x="40" y="76" textAnchor="middle" fontSize="5" fill="#9ca3af">QR</text>
    </svg>
  );
}

function KPICard({ icon, label, value, sub }: { icon: string; label: string; value: string; sub?: string }) {
  return (
    <Card className="border border-gray-100">
      <CardContent className="p-4 flex gap-3 items-center">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          <Icon name={icon as any} size={18} className="text-blue-600" />
        </div>
        <div>
          <div className="text-xs text-gray-500">{label}</div>
          <div className="text-lg font-semibold text-gray-800">{value}</div>
          {sub && <div className="text-xs text-gray-400">{sub}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EquipmentPassportFull() {
  const [selectedId, setSelectedId] = useState<string>('eq-001');
  const eq = EQUIPMENT_LIST.find(e => e.id === selectedId) ?? EQUIPMENT_LIST[0];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Паспорт оборудования</h1>
          <p className="text-sm text-gray-500 mt-0.5">Полная информация об объекте обслуживания</p>
        </div>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="w-72">
            <SelectValue placeholder="Выберите оборудование" />
          </SelectTrigger>
          <SelectContent>
            {EQUIPMENT_LIST.map(e => (
              <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Passport Card ── */}
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <div className="flex gap-6 flex-wrap">
            {/* QR Block */}
            <div className="flex flex-col items-center gap-2">
              <QRPlaceholder serial={eq.serial} />
              <span className="text-xs text-gray-400 font-mono">{eq.serial.slice(-8)}</span>
            </div>

            {/* Title Block */}
            <div className="flex-1 min-w-52">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h2 className="text-xl font-bold text-gray-900">{eq.name}</h2>
                {statusBadge(eq.status)}
              </div>
              <div className="text-sm text-gray-500 mb-3">{eq.brand} {eq.model} · {eq.type}</div>
              <div className="text-xs font-mono text-gray-400">S/N: {eq.serial}</div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button size="sm" variant="outline" onClick={() => toast.info('Печать QR-кода…')}>
                <Icon name="QrCode" size={14} className="mr-1.5" />
                Печать QR
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.info('Экспорт паспорта…')}>
                <Icon name="Download" size={14} className="mr-1.5" />
                Экспорт PDF
              </Button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-100">
            {/* Left */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Технические данные</h3>
              {[
                { label: 'Бренд', value: eq.brand },
                { label: 'Модель', value: eq.model },
                { label: 'Серийный №', value: eq.serial },
                { label: 'Год выпуска', value: String(eq.year) },
                { label: 'Тип', value: eq.type },
                { label: 'Хладагент', value: eq.refrigerant },
                { label: 'Мощность', value: `${eq.power} кВт` },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{row.label}</span>
                  <span className="font-medium text-gray-800">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Right */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Место установки</h3>
              {[
                { label: 'Объект', value: eq.location },
                { label: 'Адрес', value: eq.address },
                { label: 'Помещение', value: eq.room },
                { label: 'Дата установки', value: eq.installDate },
                { label: 'Последнее ТО', value: eq.lastMaintenance },
                { label: 'Следующее ТО', value: eq.nextMaintenance },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{row.label}</span>
                  <span className="font-medium text-gray-800 text-right max-w-48">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Tabs ── */}
      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="history">История ТО</TabsTrigger>
          <TabsTrigger value="refrigerant">Хладагент</TabsTrigger>
          <TabsTrigger value="documents">Документы</TabsTrigger>
        </TabsList>

        {/* ══ OVERVIEW ══════════════════════════════════════════════════════════ */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          {/* KPI */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KPICard icon="Clock" label="Лет в эксплуатации" value={yearsInService(eq.installDate)} sub={`с ${eq.installDate}`} />
            <KPICard icon="Wrench" label="Нарядов всего" value={String(eq.totalOrders)} sub="за всё время" />
            <KPICard icon="CalendarCheck" label="Последнее ТО" value={eq.lastMaintenance} />
            <KPICard icon="CalendarClock" label="Следующее ТО" value={eq.nextMaintenance} />
          </div>

          {/* Orders Chart */}
          <Card className="border border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-800">Наряды по месяцам</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={ORDERS_BY_MONTH} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="orders" name="Нарядов" stroke="#3b82f6" fill="url(#ordersGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Predictive Analysis */}
          <Card className="border border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <Icon name="Brain" size={16} className="text-purple-500" />
                Предиктивный анализ износа
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {WEAR_COMPONENTS.map(c => (
                <div key={c.name} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">{c.name}</span>
                    <span className={`font-semibold ${c.color}`}>{c.percent}%</span>
                  </div>
                  <Progress value={c.percent} className="h-2" />
                </div>
              ))}
              <Button
                className="w-full mt-2"
                variant="outline"
                onClick={() => toast.success('Заявка на ТО создана')}
              >
                <Icon name="CalendarPlus" size={15} className="mr-2" />
                Запланировать ТО
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══ HISTORY ═══════════════════════════════════════════════════════════ */}
        <TabsContent value="history" className="space-y-6 mt-4">
          {/* Table */}
          <Card className="border border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-800">Записи обслуживания</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Дата', 'Тип', 'Инженер', 'Работы', 'Стоимость', 'Статус'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {eq.maintenanceHistory.map((r, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">{r.date}</td>
                      <td className="px-4 py-3">{workTypeBadge(r.type)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">{r.engineer}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs">{r.works}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-800">{fmtCurrency(r.cost)}</td>
                      <td className="px-4 py-3">
                        {r.status === 'completed'
                          ? <Badge className="bg-green-100 text-green-700 border-green-200">Выполнено</Badge>
                          : <Badge className="bg-blue-100 text-blue-700 border-blue-200">В работе</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Cost Chart */}
          <Card className="border border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-800">Затраты на обслуживание по годам, ₽</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={COST_BY_YEAR} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => (v / 1000).toFixed(0) + 'к'} />
                  <Tooltip formatter={(v: number) => [v.toLocaleString('ru-RU') + ' ₽', 'Стоимость']} />
                  <Bar dataKey="cost" name="Стоимость" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══ REFRIGERANT ═══════════════════════════════════════════════════════ */}
        <TabsContent value="refrigerant" className="space-y-6 mt-4">
          {/* Charge Status */}
          <Card className="border border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-800">Текущий заряд хладагента</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{eq.refrigerant}</span>
                <span className="font-semibold text-gray-800">
                  {eq.chargeKg} / {eq.maxChargeKg} кг
                </span>
              </div>
              <Progress value={eq.maxChargeKg > 0 ? (eq.chargeKg / eq.maxChargeKg) * 100 : 0} className="h-3" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  Заполнение: <span className="font-medium text-gray-800">
                    {eq.maxChargeKg > 0 ? Math.round((eq.chargeKg / eq.maxChargeKg) * 100) : 0}%
                  </span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500">Показатель утечки:</span>
                  <span className={`font-semibold ${eq.leakPercent < 20 ? 'text-green-600' : 'text-red-600'}`}>
                    {eq.leakPercent}%
                  </span>
                  <Icon
                    name={eq.leakPercent < 20 ? 'CheckCircle' : 'AlertCircle'}
                    size={14}
                    className={eq.leakPercent < 20 ? 'text-green-500' : 'text-red-500'}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operations Table */}
          <Card className="border border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-800">Журнал операций</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Дата', 'Тип операции', 'Объём, кг', 'Инженер', 'Баллон №', 'Наряд'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {eq.refrigerantLog.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">Операций не зафиксировано</td>
                    </tr>
                  ) : eq.refrigerantLog.map((r, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">{r.date}</td>
                      <td className="px-4 py-3">{refrigerantOpBadge(r.op)}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{r.volume}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">{r.engineer}</td>
                      <td className="px-4 py-3 font-mono text-gray-600 text-xs">{r.cylinder}</td>
                      <td className="px-4 py-3 font-mono text-blue-600 text-xs">{r.orderId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Charge History Chart */}
          <Card className="border border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-800">История заряда по месяцам, кг</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={REFRIGERANT_HISTORY} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="refGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 3]} />
                  <Tooltip formatter={(v: number) => [`${v} кг`, 'Заряд']} />
                  <Area type="monotone" dataKey="kg" name="Заряд" stroke="#10b981" fill="url(#refGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══ DOCUMENTS ═════════════════════════════════════════════════════════ */}
        <TabsContent value="documents" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">{DOCUMENTS.length} документов</p>
            <Button size="sm" onClick={() => toast.success('Откройте форму загрузки документа')}>
              <Icon name="Plus" size={14} className="mr-1.5" />
              Добавить документ
            </Button>
          </div>

          <Card className="border border-gray-100">
            <CardContent className="p-0">
              <ul className="divide-y divide-gray-50">
                {DOCUMENTS.map((doc, i) => (
                  <li key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                      <Icon name={doc.icon as any} size={16} className="text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{doc.name}</div>
                      <div className="text-xs text-gray-400">{doc.ext} · {doc.size}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="shrink-0"
                      onClick={() => toast.success(`Скачивание: ${doc.name}`)}
                    >
                      <Icon name="Download" size={14} className="mr-1.5" />
                      Скачать
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
