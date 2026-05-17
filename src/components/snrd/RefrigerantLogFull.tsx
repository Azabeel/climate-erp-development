import { useState, useMemo } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type OperationType = 'charge' | 'top_up' | 'recovery' | 'replacement';
type CylinderStatus = 'active' | 'inspection' | 'empty';

interface LogEntry {
  id: string;
  date: string;
  orderId: string;
  brand: string;
  model: string;
  refrigerant: string;
  operation: OperationType;
  amount: number;
  cylinderSerial: string;
  engineer: string;
}

interface Cylinder {
  serial: string;
  refrigerant: string;
  capacity: number;
  remaining: number;
  warehouse: string;
  lastMovement: string;
  status: CylinderStatus;
}

interface LeakRecord {
  equipmentId: string;
  brand: string;
  model: string;
  client: string;
  fullCharge: number;
  chargedYear: number;
  leakPercent: number;
  jan: number; feb: number; mar: number; apr: number; may: number;
}

interface ComplianceRow {
  refrigerant: string;
  charged: number;
  recovered: number;
  leak: number;
  equipment: number;
}

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const LOG_ENTRIES: LogEntry[] = [
  { id: 'RL-001', date: '15.05.2026', orderId: 'WO-2026-000412', brand: 'Daikin', model: 'FTXB35C', refrigerant: 'R-410A', operation: 'charge', amount: 1.8, cylinderSerial: 'CYL-001-2024', engineer: 'Козлов М.' },
  { id: 'RL-002', date: '14.05.2026', orderId: 'WO-2026-000408', brand: 'Mitsubishi', model: 'MSZ-LN25VGV', refrigerant: 'R-32', operation: 'top_up', amount: 0.6, cylinderSerial: 'CYL-006-2024', engineer: 'Иванов А.' },
  { id: 'RL-003', date: '13.05.2026', orderId: 'WO-2026-000403', brand: 'Gree', model: 'GMV-500WM/B', refrigerant: 'R-410A', operation: 'recovery', amount: 3.2, cylinderSerial: 'CYL-002-2024', engineer: 'Петров С.' },
  { id: 'RL-004', date: '12.05.2026', orderId: 'WO-2026-000399', brand: 'Samsung', model: 'Wind-Free AR09', refrigerant: 'R-32', operation: 'charge', amount: 1.4, cylinderSerial: 'CYL-007-2024', engineer: 'Сидоров Д.' },
  { id: 'RL-005', date: '11.05.2026', orderId: 'WO-2026-000395', brand: 'LG', model: 'Multi S MS18TQ', refrigerant: 'R-410A', operation: 'top_up', amount: 1.1, cylinderSerial: 'CYL-003-2024', engineer: 'Козлов М.' },
  { id: 'RL-006', date: '10.05.2026', orderId: 'WO-2026-000390', brand: 'Haier', model: 'AC36CS1ERA', refrigerant: 'R-22', operation: 'recovery', amount: 0.8, cylinderSerial: 'CYL-010-2022', engineer: 'Иванов А.' },
  { id: 'RL-007', date: '09.05.2026', orderId: 'WO-2026-000386', brand: 'Fujitsu', model: 'ASYG09LUCA', refrigerant: 'R-32', operation: 'charge', amount: 1.2, cylinderSerial: 'CYL-008-2024', engineer: 'Петров С.' },
  { id: 'RL-008', date: '08.05.2026', orderId: 'WO-2026-000381', brand: 'Panasonic', model: 'CS-Z25TKEW', refrigerant: 'R-32', operation: 'replacement', amount: 2.5, cylinderSerial: 'CYL-006-2024', engineer: 'Сидоров Д.' },
  { id: 'RL-009', date: '07.05.2026', orderId: 'WO-2026-000377', brand: 'Carrier', model: '42QHC009DS', refrigerant: 'R-22', operation: 'top_up', amount: 0.4, cylinderSerial: 'CYL-011-2022', engineer: 'Козлов М.' },
  { id: 'RL-010', date: '06.05.2026', orderId: 'WO-2026-000371', brand: 'Daikin', model: 'FTXF25D', refrigerant: 'R-410A', operation: 'charge', amount: 2.0, cylinderSerial: 'CYL-001-2024', engineer: 'Иванов А.' },
  { id: 'RL-011', date: '05.05.2026', orderId: 'WO-2026-000365', brand: 'Midea', model: 'MSAG-12HRN1', refrigerant: 'R-32', operation: 'charge', amount: 1.3, cylinderSerial: 'CYL-007-2024', engineer: 'Петров С.' },
  { id: 'RL-012', date: '04.05.2026', orderId: 'WO-2026-000360', brand: 'Mitsubishi', model: 'MSZ-GL25VGK', refrigerant: 'R-32', operation: 'top_up', amount: 0.9, cylinderSerial: 'CYL-008-2024', engineer: 'Сидоров Д.' },
  { id: 'RL-013', date: '03.05.2026', orderId: 'WO-2026-000354', brand: 'Gree', model: 'GWH09AAB-K6DNA1', refrigerant: 'R-32', operation: 'charge', amount: 1.6, cylinderSerial: 'CYL-006-2024', engineer: 'Козлов М.' },
  { id: 'RL-014', date: '02.05.2026', orderId: 'WO-2026-000349', brand: 'LG', model: 'S18EQ NSJ', refrigerant: 'R-410A', operation: 'recovery', amount: 2.8, cylinderSerial: 'CYL-003-2024', engineer: 'Иванов А.' },
  { id: 'RL-015', date: '01.05.2026', orderId: 'WO-2026-000344', brand: 'Haier', model: 'AS09BS4HRA', refrigerant: 'R-22', operation: 'charge', amount: 0.7, cylinderSerial: 'CYL-010-2022', engineer: 'Петров С.' },
  { id: 'RL-016', date: '30.04.2026', orderId: 'WO-2026-000338', brand: 'Daikin', model: 'FTXB50C', refrigerant: 'R-410A', operation: 'top_up', amount: 1.5, cylinderSerial: 'CYL-002-2024', engineer: 'Сидоров Д.' },
  { id: 'RL-017', date: '29.04.2026', orderId: 'WO-2026-000332', brand: 'Samsung', model: 'AR12TXHZAWK', refrigerant: 'R-32', operation: 'charge', amount: 1.1, cylinderSerial: 'CYL-007-2024', engineer: 'Козлов М.' },
  { id: 'RL-018', date: '28.04.2026', orderId: 'WO-2026-000327', brand: 'Fujitsu', model: 'ASYG12LUCA', refrigerant: 'R-32', operation: 'recovery', amount: 1.4, cylinderSerial: 'CYL-008-2024', engineer: 'Иванов А.' },
  { id: 'RL-019', date: '27.04.2026', orderId: 'WO-2026-000321', brand: 'Panasonic', model: 'CS-Z35TKEW', refrigerant: 'R-32', operation: 'replacement', amount: 1.9, cylinderSerial: 'CYL-006-2024', engineer: 'Петров С.' },
  { id: 'RL-020', date: '26.04.2026', orderId: 'WO-2026-000316', brand: 'Carrier', model: '42QHC012DS', refrigerant: 'R-407C', operation: 'top_up', amount: 1.2, cylinderSerial: 'CYL-013-2023', engineer: 'Сидоров Д.' },
];

const CYLINDERS: Cylinder[] = [
  { serial: 'CYL-001-2024', refrigerant: 'R-410A', capacity: 25.0, remaining: 22.4, warehouse: 'Центральный', lastMovement: '15.05.2026', status: 'active' },
  { serial: 'CYL-002-2024', refrigerant: 'R-410A', capacity: 25.0, remaining: 25.0, warehouse: 'Мобильный (Иванов А.)', lastMovement: '14.05.2026', status: 'active' },
  { serial: 'CYL-003-2024', refrigerant: 'R-410A', capacity: 25.0, remaining: 8.7, warehouse: 'Мобильный (Петров С.)', lastMovement: '14.05.2026', status: 'active' },
  { serial: 'CYL-004-2024', refrigerant: 'R-410A', capacity: 25.0, remaining: 0.3, warehouse: 'Центральный', lastMovement: '03.05.2026', status: 'empty' },
  { serial: 'CYL-005-2024', refrigerant: 'R-410A', capacity: 25.0, remaining: 14.2, warehouse: 'Мобильный (Козлов М.)', lastMovement: '07.05.2026', status: 'active' },
  { serial: 'CYL-006-2024', refrigerant: 'R-32', capacity: 20.0, remaining: 18.0, warehouse: 'Центральный', lastMovement: '13.05.2026', status: 'active' },
  { serial: 'CYL-007-2024', refrigerant: 'R-32', capacity: 20.0, remaining: 20.0, warehouse: 'Мобильный (Сидоров Д.)', lastMovement: '12.05.2026', status: 'active' },
  { serial: 'CYL-008-2024', refrigerant: 'R-32', capacity: 20.0, remaining: 5.1, warehouse: 'Мобильный (Козлов М.)', lastMovement: '09.05.2026', status: 'inspection' },
  { serial: 'CYL-009-2024', refrigerant: 'R-32', capacity: 20.0, remaining: 0.0, warehouse: 'Центральный', lastMovement: '02.05.2026', status: 'empty' },
  { serial: 'CYL-010-2022', refrigerant: 'R-22', capacity: 13.6, remaining: 9.8, warehouse: 'Мобильный (Иванов А.)', lastMovement: '10.05.2026', status: 'active' },
  { serial: 'CYL-011-2022', refrigerant: 'R-22', capacity: 13.6, remaining: 13.6, warehouse: 'Центральный', lastMovement: '20.04.2026', status: 'active' },
  { serial: 'CYL-012-2022', refrigerant: 'R-22', capacity: 13.6, remaining: 0.5, warehouse: 'Центральный', lastMovement: '01.05.2026', status: 'inspection' },
  { serial: 'CYL-013-2023', refrigerant: 'R-407C', capacity: 20.0, remaining: 16.3, warehouse: 'Мобильный (Сидоров Д.)', lastMovement: '26.04.2026', status: 'active' },
];

const LEAK_RECORDS: LeakRecord[] = [
  { equipmentId: 'EQ-001', brand: 'Daikin', model: 'FTXB35C', client: 'ООО Альфа', fullCharge: 2.5, chargedYear: 1.8, leakPercent: 72, jan: 20, feb: 25, mar: 35, apr: 50, may: 72 },
  { equipmentId: 'EQ-002', brand: 'Gree', model: 'GMV-500WM/B', client: 'ТЦ Мираж', fullCharge: 8.0, chargedYear: 3.2, leakPercent: 40, jan: 10, feb: 15, mar: 22, apr: 30, may: 40 },
  { equipmentId: 'EQ-003', brand: 'Haier', model: 'AC36CS1ERA', client: 'ООО Берег', fullCharge: 3.0, chargedYear: 0.9, leakPercent: 30, jan: 5, feb: 8, mar: 15, apr: 22, may: 30 },
  { equipmentId: 'EQ-004', brand: 'LG', model: 'Multi S MS18TQ', client: 'ООО Гамма', fullCharge: 4.5, chargedYear: 0.9, leakPercent: 20, jan: 3, feb: 6, mar: 10, apr: 15, may: 20 },
  { equipmentId: 'EQ-005', brand: 'Carrier', model: '42QHC009DS', client: 'БЦ Форум', fullCharge: 2.2, chargedYear: 0.2, leakPercent: 9, jan: 1, feb: 2, mar: 4, apr: 6, may: 9 },
  { equipmentId: 'EQ-006', brand: 'Samsung', model: 'Wind-Free AR09', client: 'ИП Нилов', fullCharge: 1.8, chargedYear: 0.1, leakPercent: 6, jan: 0, feb: 1, mar: 2, apr: 4, may: 6 },
  { equipmentId: 'EQ-007', brand: 'Mitsubishi', model: 'MSZ-LN25VGV', client: 'ТЦ Мираж', fullCharge: 1.5, chargedYear: 0.3, leakPercent: 20, jan: 4, feb: 7, mar: 11, apr: 15, may: 20 },
];

const LEAK_TREND_DATA = [
  { month: 'Янв', 'Daikin FTXB35C': 20, 'Gree GMV-500': 10, 'Haier AC36CS': 5, 'LG Multi S': 3, 'Carrier 42QHC': 1 },
  { month: 'Фев', 'Daikin FTXB35C': 25, 'Gree GMV-500': 15, 'Haier AC36CS': 8, 'LG Multi S': 6, 'Carrier 42QHC': 2 },
  { month: 'Мар', 'Daikin FTXB35C': 35, 'Gree GMV-500': 22, 'Haier AC36CS': 15, 'LG Multi S': 10, 'Carrier 42QHC': 4 },
  { month: 'Апр', 'Daikin FTXB35C': 50, 'Gree GMV-500': 30, 'Haier AC36CS': 22, 'LG Multi S': 15, 'Carrier 42QHC': 6 },
  { month: 'Май', 'Daikin FTXB35C': 72, 'Gree GMV-500': 40, 'Haier AC36CS': 30, 'LG Multi S': 20, 'Carrier 42QHC': 9 },
];

const REFRIGERANT_USAGE = [
  { name: 'R-410A', заправлено: 14.7, откачано: 6.0 },
  { name: 'R-32', заправлено: 12.5, откачано: 2.8 },
  { name: 'R-22', заправлено: 1.9, откачано: 1.2 },
  { name: 'R-407C', заправлено: 1.2, откачано: 0.0 },
];

const COMPLIANCE_DATA: ComplianceRow[] = [
  { refrigerant: 'R-410A', charged: 14.7, recovered: 6.0, leak: 8.7, equipment: 12 },
  { refrigerant: 'R-32', charged: 12.5, recovered: 2.8, leak: 9.7, equipment: 9 },
  { refrigerant: 'R-22', charged: 1.9, recovered: 1.2, leak: 0.7, equipment: 4 },
  { refrigerant: 'R-407C', charged: 1.2, recovered: 0.0, leak: 1.2, equipment: 2 },
];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OPERATION_LABELS: Record<OperationType, string> = {
  charge: 'Заправка',
  top_up: 'Дозаправка',
  recovery: 'Откачка',
  replacement: 'Замена',
};

const OPERATION_COLORS: Record<OperationType, string> = {
  charge: 'bg-blue-100 text-blue-800',
  top_up: 'bg-green-100 text-green-800',
  recovery: 'bg-orange-100 text-orange-800',
  replacement: 'bg-purple-100 text-purple-800',
};

const CYLINDER_STATUS_LABELS: Record<CylinderStatus, string> = {
  active: 'В работе',
  inspection: 'На поверке',
  empty: 'Пустой',
};

const CYLINDER_STATUS_COLORS: Record<CylinderStatus, string> = {
  active: 'bg-green-100 text-green-800',
  inspection: 'bg-yellow-100 text-yellow-800',
  empty: 'bg-gray-100 text-gray-600',
};

const LINE_COLORS = ['#ef4444', '#f97316', '#22c55e', '#3b82f6', '#8b5cf6'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function leakBadgeColor(pct: number): string {
  if (pct > 30) return 'bg-red-100 text-red-800';
  if (pct >= 15) return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-800';
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function KpiCard({ icon, label, value, sub, color }: {
  icon: string; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-start gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon name={icon} size={20} />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// AddEntryDialog
// ---------------------------------------------------------------------------

function AddEntryDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({
    date: '', orderId: '', brand: '', model: '',
    refrigerant: '', operation: '', amount: '', cylinderSerial: '', engineer: '',
  });

  const handleSave = () => {
    if (!form.date || !form.orderId || !form.operation || !form.amount) {
      toast.error('Заполните обязательные поля');
      return;
    }
    toast.success('Запись добавлена в журнал');
    onClose();
  };

  const field = (label: string, key: keyof typeof form, placeholder?: string) => (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
      <Input
        placeholder={placeholder ?? label}
        value={form[key]}
        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Добавить запись в журнал</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-2">
          {field('Дата *', 'date', 'дд.мм.гггг')}
          {field('Номер наряда *', 'orderId', 'WO-2026-000000')}
          {field('Бренд', 'brand', 'Daikin')}
          {field('Модель', 'model', 'FTXB35C')}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Хладагент</label>
            <Select onValueChange={(v) => setForm((p) => ({ ...p, refrigerant: v }))}>
              <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
              <SelectContent>
                {['R-410A', 'R-32', 'R-22', 'R-407C'].map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Тип операции *</label>
            <Select onValueChange={(v) => setForm((p) => ({ ...p, operation: v }))}>
              <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
              <SelectContent>
                {(Object.entries(OPERATION_LABELS) as [OperationType, string][]).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {field('Количество (кг) *', 'amount', '0.0')}
          {field('Серийный № баллона', 'cylinderSerial', 'CYL-001-2024')}
          {field('Инженер', 'engineer', 'Иванов А.')}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSave}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Tab: Journal
// ---------------------------------------------------------------------------

function TabJournal() {
  const [opFilter, setOpFilter] = useState('all');
  const [refrigerantFilter, setRefrigerantFilter] = useState('all');
  const [engineerFilter, setEngineerFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const refrigerants = useMemo(() => Array.from(new Set(LOG_ENTRIES.map((e) => e.refrigerant))), []);
  const engineers = useMemo(() => Array.from(new Set(LOG_ENTRIES.map((e) => e.engineer))), []);

  const filtered = useMemo(() => LOG_ENTRIES.filter((e) => {
    if (opFilter !== 'all' && e.operation !== opFilter) return false;
    if (refrigerantFilter !== 'all' && e.refrigerant !== refrigerantFilter) return false;
    if (engineerFilter !== 'all' && e.engineer !== engineerFilter) return false;
    if (search && !`${e.brand} ${e.model} ${e.orderId} ${e.engineer}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [opFilter, refrigerantFilter, engineerFilter, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          className="w-56"
          placeholder="Поиск по оборудованию, наряду..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={opFilter} onValueChange={setOpFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все операции</SelectItem>
            {(Object.entries(OPERATION_LABELS) as [OperationType, string][]).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={refrigerantFilter} onValueChange={setRefrigerantFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все хладагенты</SelectItem>
            {refrigerants.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={engineerFilter} onValueChange={setEngineerFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все инженеры</SelectItem>
            {engineers.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <Button onClick={() => setDialogOpen(true)}>
            <Icon name="Plus" size={16} className="mr-1" /> Добавить запись
          </Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Дата', 'Наряд', 'Оборудование', 'Хладагент', 'Операция', 'Кол-во (кг)', 'Баллон', 'Инженер'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{e.date}</td>
                  <td className="px-4 py-3 font-mono text-blue-600">{e.orderId}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{e.brand}</p>
                    <p className="text-xs text-gray-400">{e.model}</p>
                  </td>
                  <td className="px-4 py-3 font-medium">{e.refrigerant}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${OPERATION_COLORS[e.operation]}`}>
                      {OPERATION_LABELS[e.operation]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{e.amount.toFixed(1)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{e.cylinderSerial}</td>
                  <td className="px-4 py-3">{e.engineer}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              <Icon name="SearchX" size={36} className="mx-auto mb-2 opacity-40" />
              <p>Записи не найдены</p>
            </div>
          )}
        </div>
      </Card>

      <AddEntryDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Cylinders
// ---------------------------------------------------------------------------

function TabCylinders() {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Серийный №', 'Хладагент', 'Ёмкость (кг)', 'Остаток (кг)', 'Заполнение', 'Склад/Местонахождение', 'Последнее движение', 'Статус'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {CYLINDERS.map((c) => {
              const pct = c.capacity > 0 ? Math.round((c.remaining / c.capacity) * 100) : 0;
              return (
                <tr key={c.serial} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{c.serial}</td>
                  <td className="px-4 py-3 font-semibold">{c.refrigerant}</td>
                  <td className="px-4 py-3 text-center">{c.capacity.toFixed(1)}</td>
                  <td className="px-4 py-3 text-center font-semibold">{c.remaining.toFixed(1)}</td>
                  <td className="px-4 py-3 min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <Progress value={pct} className="h-2 flex-1" />
                      <span className="text-xs text-gray-500 w-8">{pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.warehouse}</td>
                  <td className="px-4 py-3 text-gray-500">{c.lastMovement}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${CYLINDER_STATUS_COLORS[c.status]}`}>
                      {CYLINDER_STATUS_LABELS[c.status]}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Tab: Leak Analytics
// ---------------------------------------------------------------------------

function TabLeakAnalytics() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Показатель утечки: топ-5 оборудования (по месяцам)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={LEAK_TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} unit="%" />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {['Daikin FTXB35C', 'Gree GMV-500', 'Haier AC36CS', 'LG Multi S', 'Carrier 42QHC'].map((key, i) => (
                  <Line key={key} type="monotone" dataKey={key} stroke={LINE_COLORS[i]} strokeWidth={2} dot={{ r: 3 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Расход хладагента по типам (кг)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={REFRIGERANT_USAGE} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} unit=" кг" />
                <Tooltip formatter={(v: number) => `${v} кг`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="заправлено" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="откачано" fill="#f97316" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Показатель утечки по оборудованию</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Оборудование', 'Клиент', 'Полный заряд (кг)', 'Заправлено за год (кг)', 'Показатель утечки'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {LEAK_RECORDS.map((r) => (
                <tr key={r.equipmentId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{r.brand}</p>
                    <p className="text-xs text-gray-400">{r.model}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.client}</td>
                  <td className="px-4 py-3 text-center">{r.fullCharge.toFixed(1)}</td>
                  <td className="px-4 py-3 text-center">{r.chargedYear.toFixed(1)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${leakBadgeColor(r.leakPercent)}`}>
                        {r.leakPercent}%
                      </span>
                      {r.leakPercent > 30 && <Icon name="AlertTriangle" size={14} className="text-red-500" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Compliance Report
// ---------------------------------------------------------------------------

function TabCompliance() {
  const [period, setPeriod] = useState('2026');
  const [org, setOrg] = useState('ООО «Сервис Климат»');
  const [responsible, setResponsible] = useState('Иванова Е.В.');

  const handleGenerate = () => {
    if (!period || !org || !responsible) {
      toast.error('Заполните все поля формы');
      return;
    }
    toast.success(`Отчёт Росприроднадзор за ${period} сформирован и готов к выгрузке`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="FileText" size={16} className="text-blue-600" />
            Параметры отчёта
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Период (год)</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['2026', '2025', '2024'].map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Организация</label>
              <Input value={org} onChange={(e) => setOrg(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Ответственный</label>
              <Input value={responsible} onChange={(e) => setResponsible(e.target.value)} />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleGenerate}>
              <Icon name="Download" size={16} className="mr-1" /> Сформировать отчёт
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Превью данных для отчёта — суммарно по типам хладагентов</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Тип хладагента', 'Заправлено (кг)', 'Откачано (кг)', 'Расчётные утечки (кг)', 'Единиц оборудования'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {COMPLIANCE_DATA.map((row) => (
                <tr key={row.refrigerant} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold">{row.refrigerant}</td>
                  <td className="px-4 py-3 text-blue-700 font-medium">{row.charged.toFixed(1)}</td>
                  <td className="px-4 py-3 text-orange-700 font-medium">{row.recovered.toFixed(1)}</td>
                  <td className="px-4 py-3 text-red-600 font-medium">{row.leak.toFixed(1)}</td>
                  <td className="px-4 py-3">{row.equipment}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-semibold">
                <td className="px-4 py-3">Итого</td>
                <td className="px-4 py-3 text-blue-700">{COMPLIANCE_DATA.reduce((s, r) => s + r.charged, 0).toFixed(1)}</td>
                <td className="px-4 py-3 text-orange-700">{COMPLIANCE_DATA.reduce((s, r) => s + r.recovered, 0).toFixed(1)}</td>
                <td className="px-4 py-3 text-red-600">{COMPLIANCE_DATA.reduce((s, r) => s + r.leak, 0).toFixed(1)}</td>
                <td className="px-4 py-3">{COMPLIANCE_DATA.reduce((s, r) => s + r.equipment, 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function RefrigerantLogFull() {
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [activeTab, setActiveTab] = useState('journal');

  const criticalLeaks = LEAK_RECORDS.filter((r) => r.leakPercent > 30);
  const showAlert = criticalLeaks.length > 0 && !alertDismissed;

  const totalChargedMonth = LOG_ENTRIES.reduce((s, e) => {
    if (['charge', 'top_up', 'replacement'].includes(e.operation)) return s + e.amount;
    return s;
  }, 0);

  const leaksDetected = LEAK_RECORDS.filter((r) => r.leakPercent > 30).length;
  const needsCheck = LEAK_RECORDS.filter((r) => r.leakPercent >= 15).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Журнал хладагентов</h1>
          <p className="text-sm text-gray-500 mt-0.5">Учёт операций, баллонов и аналитика утечек</p>
        </div>
        <Badge className="bg-blue-100 text-blue-800 text-sm px-3 py-1">
          <Icon name="Snowflake" size={14} className="mr-1 inline" />
          Хладагенты
        </Badge>
      </div>

      {/* Alert banner */}
      {showAlert && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <Icon name="AlertTriangle" size={20} className="text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">
              Обнаружено оборудование с критическим показателем утечки (&gt;30%): {criticalLeaks.length} ед.
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              {criticalLeaks.map((r) => `${r.brand} ${r.model} — ${r.leakPercent}%`).join(' · ')}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100"
            onClick={() => setActiveTab('analytics')}
          >
            Просмотреть
          </Button>
          <button
            onClick={() => setAlertDismissed(true)}
            className="text-red-400 hover:text-red-600 ml-1"
          >
            <Icon name="X" size={16} />
          </button>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard icon="BookOpen" label="Записей в журнале" value={234} sub="всего за период" color="bg-blue-100 text-blue-600" />
        <KpiCard icon="Droplets" label="Заправлено за месяц" value={`${totalChargedMonth.toFixed(1)} кг`} sub="заправка + дозаправка" color="bg-cyan-100 text-cyan-600" />
        <KpiCard icon="AlertTriangle" label="Утечек выявлено" value={leaksDetected} sub="показатель >30%" color="bg-red-100 text-red-600" />
        <KpiCard icon="ClipboardCheck" label="Требует проверки" value={needsCheck} sub="показатель ≥15%" color="bg-yellow-100 text-yellow-600" />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="journal">Журнал операций</TabsTrigger>
          <TabsTrigger value="cylinders">Баллоны</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика утечек</TabsTrigger>
          <TabsTrigger value="compliance">Отчёт Росприроднадзор</TabsTrigger>
        </TabsList>

        <TabsContent value="journal"><TabJournal /></TabsContent>
        <TabsContent value="cylinders"><TabCylinders /></TabsContent>
        <TabsContent value="analytics"><TabLeakAnalytics /></TabsContent>
        <TabsContent value="compliance"><TabCompliance /></TabsContent>
      </Tabs>
    </div>
  );
}
