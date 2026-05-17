import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Cylinder {
  serial: string;
  refrigerant: 'R410A' | 'R32' | 'R22';
  currentWeight: number;
  initialWeight: number;
  engineer: string;
  lastOperation: string;
  status: 'full' | 'in_use' | 'empty';
}

interface LogEntry {
  date: string;
  engineer: string;
  equipment: string;
  client: string;
  operation: 'charge' | 'top_up' | 'recovery' | 'replacement';
  refrigerant: string;
  amount: number;
  cylinderSerial: string;
}

interface LeakRecord {
  equipment: string;
  client: string;
  fullCharge: number;
  chargedYear: number;
  leakPercent: number;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const CYLINDERS: Cylinder[] = [
  { serial: 'CYL-001-2024', refrigerant: 'R410A', currentWeight: 22.4, initialWeight: 25.0, engineer: 'Козлов М.', lastOperation: '12.05.2026', status: 'in_use' },
  { serial: 'CYL-002-2024', refrigerant: 'R410A', currentWeight: 25.0, initialWeight: 25.0, engineer: 'Иванов А.', lastOperation: '01.05.2026', status: 'full' },
  { serial: 'CYL-003-2024', refrigerant: 'R410A', currentWeight: 8.7, initialWeight: 25.0, engineer: 'Петров С.', lastOperation: '10.05.2026', status: 'in_use' },
  { serial: 'CYL-004-2024', refrigerant: 'R410A', currentWeight: 0.3, initialWeight: 25.0, engineer: 'Сидоров Д.', lastOperation: '03.05.2026', status: 'empty' },
  { serial: 'CYL-005-2024', refrigerant: 'R410A', currentWeight: 14.2, initialWeight: 25.0, engineer: 'Козлов М.', lastOperation: '07.05.2026', status: 'in_use' },
  { serial: 'CYL-006-2024', refrigerant: 'R32', currentWeight: 18.0, initialWeight: 20.0, engineer: 'Иванов А.', lastOperation: '09.05.2026', status: 'in_use' },
  { serial: 'CYL-007-2024', refrigerant: 'R32', currentWeight: 20.0, initialWeight: 20.0, engineer: 'Петров С.', lastOperation: '28.04.2026', status: 'full' },
  { serial: 'CYL-008-2024', refrigerant: 'R32', currentWeight: 5.1, initialWeight: 20.0, engineer: 'Сидоров Д.', lastOperation: '06.05.2026', status: 'in_use' },
  { serial: 'CYL-009-2024', refrigerant: 'R32', currentWeight: 0.0, initialWeight: 20.0, engineer: 'Козлов М.', lastOperation: '02.05.2026', status: 'empty' },
  { serial: 'CYL-010-2022', refrigerant: 'R22', currentWeight: 9.8, initialWeight: 13.6, engineer: 'Иванов А.', lastOperation: '05.05.2026', status: 'in_use' },
  { serial: 'CYL-011-2022', refrigerant: 'R22', currentWeight: 13.6, initialWeight: 13.6, engineer: 'Петров С.', lastOperation: '20.04.2026', status: 'full' },
  { serial: 'CYL-012-2022', refrigerant: 'R22', currentWeight: 0.5, initialWeight: 13.6, engineer: 'Сидоров Д.', lastOperation: '01.05.2026', status: 'empty' },
];

const LOG_ENTRIES: LogEntry[] = [
  { date: '12.05.2026', engineer: 'Козлов М.', equipment: 'Daikin FTXB35C', client: 'ООО Альфа', operation: 'charge', refrigerant: 'R410A', amount: 1.8, cylinderSerial: 'CYL-001-2024' },
  { date: '10.05.2026', engineer: 'Петров С.', equipment: 'Gree GMV-500', client: 'ТЦ Мираж', operation: 'top_up', refrigerant: 'R410A', amount: 2.1, cylinderSerial: 'CYL-003-2024' },
  { date: '09.05.2026', engineer: 'Иванов А.', equipment: 'Mitsubishi MSZ-LN25', client: 'ТЦ Мираж', operation: 'recovery', refrigerant: 'R32', amount: 1.2, cylinderSerial: 'CYL-006-2024' },
  { date: '08.05.2026', engineer: 'Петров С.', equipment: 'Gree GMV-500', client: 'ТЦ Мираж', operation: 'charge', refrigerant: 'R32', amount: 4.1, cylinderSerial: 'CYL-007-2024' },
  { date: '07.05.2026', engineer: 'Козлов М.', equipment: 'LG Multi S', client: 'ООО Гамма', operation: 'top_up', refrigerant: 'R410A', amount: 0.9, cylinderSerial: 'CYL-005-2024' },
  { date: '06.05.2026', engineer: 'Сидоров Д.', equipment: 'Samsung Wind-Free', client: 'ИП Нилов', operation: 'charge', refrigerant: 'R32', amount: 1.6, cylinderSerial: 'CYL-008-2024' },
  { date: '05.05.2026', engineer: 'Иванов А.', equipment: 'Haier AC36CS', client: 'ООО Берег', operation: 'recovery', refrigerant: 'R22', amount: 0.4, cylinderSerial: 'CYL-010-2022' },
  { date: '03.05.2026', engineer: 'Сидоров Д.', equipment: 'Fujitsu ASYG09', client: 'ЖК Садовый', operation: 'charge', refrigerant: 'R410A', amount: 1.4, cylinderSerial: 'CYL-004-2024' },
  { date: '02.05.2026', engineer: 'Козлов М.', equipment: 'Midea MSAG-12', client: 'ТЦ Орион', operation: 'replacement', refrigerant: 'R32', amount: 1.1, cylinderSerial: 'CYL-009-2024' },
  { date: '01.05.2026', engineer: 'Сидоров Д.', equipment: 'Haier AS09BS4HRA', client: 'ООО Берег', operation: 'top_up', refrigerant: 'R22', amount: 0.8, cylinderSerial: 'CYL-012-2022' },
  { date: '28.04.2026', engineer: 'Иванов А.', equipment: 'Mitsubishi MSZ-LN35', client: 'ТЦ Мираж', operation: 'charge', refrigerant: 'R32', amount: 2.4, cylinderSerial: 'CYL-007-2024' },
  { date: '25.04.2026', engineer: 'Петров С.', equipment: 'Daikin FTXF25D', client: 'ИП Смирнов', operation: 'top_up', refrigerant: 'R410A', amount: 0.6, cylinderSerial: 'CYL-002-2024' },
  { date: '22.04.2026', engineer: 'Козлов М.', equipment: 'Panasonic CS-Z25TKEW', client: 'ООО Альфа', operation: 'charge', refrigerant: 'R32', amount: 1.7, cylinderSerial: 'CYL-006-2024' },
  { date: '20.04.2026', engineer: 'Иванов А.', equipment: 'Carrier 42QHC009DS', client: 'БЦ Форум', operation: 'recovery', refrigerant: 'R22', amount: 1.1, cylinderSerial: 'CYL-011-2022' },
  { date: '18.04.2026', engineer: 'Сидоров Д.', equipment: 'LG S18EQ', client: 'ИП Смирнов', operation: 'charge', refrigerant: 'R410A', amount: 1.6, cylinderSerial: 'CYL-005-2024' },
  { date: '15.04.2026', engineer: 'Петров С.', equipment: 'Gree GWH09AAB', client: 'Частный клиент', operation: 'top_up', refrigerant: 'R32', amount: 0.7, cylinderSerial: 'CYL-008-2024' },
  { date: '12.04.2026', engineer: 'Козлов М.', equipment: 'Ballu BSE-12HN1', client: 'ООО Гамма', operation: 'charge', refrigerant: 'R32', amount: 1.1, cylinderSerial: 'CYL-006-2024' },
  { date: '10.04.2026', engineer: 'Иванов А.', equipment: 'Haier AS09BS4HRA', client: 'ООО Берег', operation: 'replacement', refrigerant: 'R22', amount: 2.2, cylinderSerial: 'CYL-010-2022' },
  { date: '08.04.2026', engineer: 'Сидоров Д.', equipment: 'Mitsubishi MXZ-4E83VA', client: 'ТЦ Мираж', operation: 'charge', refrigerant: 'R410A', amount: 5.2, cylinderSerial: 'CYL-001-2024' },
  { date: '05.04.2026', engineer: 'Петров С.', equipment: 'Daikin RZQSG71L3V1', client: 'БЦ Форум', operation: 'top_up', refrigerant: 'R410A', amount: 1.3, cylinderSerial: 'CYL-003-2024' },
];

const LEAK_RECORDS: LeakRecord[] = [
  { equipment: 'Daikin FTXB35C', client: 'ООО Альфа', fullCharge: 1.8, chargedYear: 0.20, leakPercent: 11.1 },
  { equipment: 'Gree GMV-500', client: 'ТЦ Мираж', fullCharge: 12.5, chargedYear: 4.10, leakPercent: 32.8 },
  { equipment: 'Mitsubishi MSZ-LN25', client: 'ТЦ Мираж', fullCharge: 2.4, chargedYear: 0.60, leakPercent: 25.0 },
  { equipment: 'LG S18EQ', client: 'ИП Смирнов', fullCharge: 1.6, chargedYear: 0.10, leakPercent: 6.3 },
  { equipment: 'Haier AC36CS', client: 'ООО Берег', fullCharge: 2.2, chargedYear: 0.80, leakPercent: 36.4 },
  { equipment: 'Carrier 42QHC009DS', client: 'БЦ Форум', fullCharge: 3.1, chargedYear: 1.10, leakPercent: 35.5 },
  { equipment: 'Panasonic CS-Z25TKEW', client: 'ООО Альфа', fullCharge: 1.4, chargedYear: 0.24, leakPercent: 17.1 },
  { equipment: 'Samsung Wind-Free', client: 'ИП Нилов', fullCharge: 1.3, chargedYear: 0.07, leakPercent: 5.4 },
  { equipment: 'Mitsubishi MXZ-4E83VA', client: 'ТЦ Мираж', fullCharge: 8.0, chargedYear: 2.80, leakPercent: 35.0 },
  { equipment: 'Fujitsu ASYG09', client: 'ЖК Садовый', fullCharge: 0.8, chargedYear: 0.11, leakPercent: 13.8 },
];

const LEAK_TREND = [
  { month: 'Июн', avg: 18.2 },
  { month: 'Июл', avg: 19.5 },
  { month: 'Авг', avg: 22.1 },
  { month: 'Сен', avg: 20.8 },
  { month: 'Окт', avg: 17.4 },
  { month: 'Ноя', avg: 15.9 },
  { month: 'Дек', avg: 14.2 },
  { month: 'Янв', avg: 16.8 },
  { month: 'Фев', avg: 18.5 },
  { month: 'Мар', avg: 21.3 },
  { month: 'Апр', avg: 23.7 },
  { month: 'Май', avg: 22.4 },
];

const MONTHLY_REPORT_DATA = [
  { month: 'Июн', R410A: 38.2, R32: 22.1, R22: 8.4 },
  { month: 'Июл', R410A: 45.1, R32: 28.6, R22: 9.2 },
  { month: 'Авг', R410A: 52.3, R32: 31.4, R22: 7.8 },
  { month: 'Сен', R410A: 41.8, R32: 24.9, R22: 10.1 },
  { month: 'Окт', R410A: 29.7, R32: 18.3, R22: 6.5 },
  { month: 'Ноя', R410A: 22.4, R32: 14.7, R22: 5.9 },
  { month: 'Дек', R410A: 18.9, R32: 11.2, R22: 4.3 },
  { month: 'Янв', R410A: 24.6, R32: 15.8, R22: 6.1 },
  { month: 'Фев', R410A: 31.2, R32: 19.4, R22: 7.2 },
  { month: 'Мар', R410A: 47.5, R32: 27.3, R22: 9.8 },
  { month: 'Апр', R410A: 58.1, R32: 34.2, R22: 11.4 },
  { month: 'Май', R410A: 62.4, R32: 37.8, R22: 12.7 },
];

const PIE_DATA = [
  { name: 'R410A', value: 412, color: '#3b82f6' },
  { name: 'R32', value: 298, color: '#8b5cf6' },
  { name: 'R22', value: 137, color: '#f59e0b' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type Tab = 'cylinders' | 'log' | 'leaks' | 'reports';

const CYLINDER_STATUS_MAP: Record<Cylinder['status'], { label: string; cls: string }> = {
  full: { label: 'Полный', cls: 'bg-green-100 text-green-700' },
  in_use: { label: 'В работе', cls: 'bg-blue-100 text-blue-700' },
  empty: { label: 'Пустой', cls: 'bg-gray-100 text-gray-500' },
};

const OPERATION_MAP: Record<LogEntry['operation'], { label: string; cls: string }> = {
  charge: { label: 'Заправка', cls: 'bg-green-100 text-green-700' },
  top_up: { label: 'Дозаправка', cls: 'bg-blue-100 text-blue-700' },
  recovery: { label: 'Рекуперация', cls: 'bg-orange-100 text-orange-700' },
  replacement: { label: 'Замена', cls: 'bg-purple-100 text-purple-700' },
};

function leakBadge(pct: number) {
  if (pct > 30) return { label: `${pct.toFixed(1)}% — нарушение`, cls: 'bg-red-100 text-red-700' };
  if (pct >= 15) return { label: `${pct.toFixed(1)}% — предупреждение`, cls: 'bg-yellow-100 text-yellow-700' };
  return { label: `${pct.toFixed(1)}% — норма`, cls: 'bg-green-100 text-green-700' };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const RefrigerantComplianceFull = () => {
  const [activeTab, setActiveTab] = useState<Tab>('cylinders');
  const [search, setSearch] = useState('');

  const filteredLog = LOG_ENTRIES.filter(e =>
    search === '' ||
    e.engineer.toLowerCase().includes(search.toLowerCase()) ||
    e.equipment.toLowerCase().includes(search.toLowerCase()) ||
    e.client.toLowerCase().includes(search.toLowerCase())
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: 'cylinders', label: 'Баллоны' },
    { key: 'log', label: 'Журнал операций' },
    { key: 'leaks', label: 'Утечки' },
    { key: 'reports', label: 'Отчётность' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Icon name="Thermometer" size={22} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Учёт хладагентов и экологическая отчётность</h1>
            <p className="text-sm text-gray-500 mt-0.5">Баллоны, журнал операций, контроль утечек, отчёты для Росприроднадзора</p>
          </div>
        </div>
        <Button onClick={() => toast.success('Сформирован отчёт для Росприроднадзора')}>
          <Icon name="FileText" size={16} className="mr-2" />
          Отчёт РПН
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Куплено хладагента</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">847 <span className="text-lg font-normal">кг</span></p>
          <p className="text-xs text-blue-500 mt-1">за текущий год</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Использовано</p>
          <p className="text-3xl font-bold text-indigo-700 mt-1">723 <span className="text-lg font-normal">кг</span></p>
          <p className="text-xs text-indigo-500 mt-1">заправлено и дозаправлено</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Остаток баллонов</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">124 <span className="text-lg font-normal">кг</span></p>
          <p className="text-xs text-emerald-500 mt-1">суммарно по всем баллонам</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Утечка &gt;30%</p>
          <p className="text-3xl font-bold text-red-700 mt-1">5 <span className="text-lg font-normal">ед.</span></p>
          <p className="text-xs text-red-500 mt-1">требуют проверки</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-0" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={[
                'px-5 py-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* TAB: Баллоны */}
      {activeTab === 'cylinders' && (
        <div className="grid grid-cols-3 gap-6">
          {/* Table */}
          <div className="col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Баллоны с хладагентом</h3>
              <Badge className="bg-gray-100 text-gray-700">{CYLINDERS.length} баллонов</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['S/N', 'Тип', 'Текущий, кг', 'Нач., кг', 'Инженер', 'Дата операции', 'Статус'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {CYLINDERS.map(cyl => {
                    const st = CYLINDER_STATUS_MAP[cyl.status];
                    const fillPct = Math.round((cyl.currentWeight / cyl.initialWeight) * 100);
                    return (
                      <tr key={cyl.serial} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">{cyl.serial}</td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-gray-800">{cyl.refrigerant}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{cyl.currentWeight.toFixed(1)}</span>
                            <div className="w-16 h-1.5 rounded-full bg-gray-200">
                              <div
                                className={`h-1.5 rounded-full ${fillPct > 60 ? 'bg-green-500' : fillPct > 25 ? 'bg-yellow-500' : 'bg-red-400'}`}
                                style={{ width: `${fillPct}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400">{fillPct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{cyl.initialWeight.toFixed(1)}</td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{cyl.engineer}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{cyl.lastOperation}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pie chart */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Распределение по типам</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={PIE_DATA} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {PIE_DATA.map(entry => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} кг`, 'Объём']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {PIE_DATA.map(d => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-gray-700 font-medium">{d.name}</span>
                  </div>
                  <span className="text-gray-500">{d.value} кг</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Полных</span>
                <span className="font-medium text-green-700">{CYLINDERS.filter(c => c.status === 'full').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">В работе</span>
                <span className="font-medium text-blue-700">{CYLINDERS.filter(c => c.status === 'in_use').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Пустых</span>
                <span className="font-medium text-gray-500">{CYLINDERS.filter(c => c.status === 'empty').length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Журнал операций */}
      {activeTab === 'log' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200 flex justify-between items-center gap-3">
            <h3 className="font-semibold text-gray-900 shrink-0">Журнал операций с хладагентами</h3>
            <Input
              placeholder="Поиск по инженеру, оборудованию, клиенту..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-xs text-sm"
            />
            <Button size="sm" variant="outline" onClick={() => toast.success('Журнал выгружен в Excel')}>
              <Icon name="Download" size={14} className="mr-1" />
              Excel
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Дата', 'Инженер', 'Оборудование', 'Клиент', 'Операция', 'Хладагент', 'Кол-во, кг', 'Баллон S/N'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLog.map((entry, idx) => {
                  const op = OPERATION_MAP[entry.operation];
                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{entry.date}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{entry.engineer}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium whitespace-nowrap">{entry.equipment}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{entry.client}</td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs font-medium ${op.cls}`}>{op.label}</Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-800">{entry.refrigerant}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{entry.amount.toFixed(2)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{entry.cylinderSerial}</td>
                    </tr>
                  );
                })}
                {filteredLog.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-gray-400">Записей не найдено</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Утечки */}
      {activeTab === 'leaks' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Контроль утечек хладагента</h3>
              <div className="flex items-center gap-2">
                <Badge className="bg-red-100 text-red-700">{LEAK_RECORDS.filter(r => r.leakPercent > 30).length} нарушений</Badge>
                <Badge className="bg-yellow-100 text-yellow-700">{LEAK_RECORDS.filter(r => r.leakPercent >= 15 && r.leakPercent <= 30).length} предупреждений</Badge>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Оборудование', 'Клиент', 'Полный заряд, кг', 'Заправлено за год, кг', '% утечки'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {LEAK_RECORDS.map((rec, idx) => {
                    const badge = leakBadge(rec.leakPercent);
                    return (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{rec.equipment}</td>
                        <td className="px-4 py-3 text-gray-600">{rec.client}</td>
                        <td className="px-4 py-3 text-gray-700">{rec.fullCharge.toFixed(1)}</td>
                        <td className="px-4 py-3 text-gray-700">{rec.chargedYear.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <Badge className={`text-xs font-medium ${badge.cls}`}>{badge.label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Leak trend chart */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Динамика среднего % утечки (12 месяцев)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={LEAK_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, 'Средний % утечки']} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avg"
                  name="Средний % утечки"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#ef4444' }}
                  activeDot={{ r: 5 }}
                />
                {/* Reference line at 30% — drawn as a flat series */}
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
              <span className="inline-block w-6 border-t-2 border-dashed border-red-400" />
              Пороговое значение 30% — при превышении требуется внеплановая проверка
            </div>
          </div>
        </div>
      )}

      {/* TAB: Отчётность */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Report card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Отчёт для Росприроднадзора</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Журнал учёта хладагентов по форме, установленной Приказом Минприроды.<br />
                  Последний отчёт: <span className="font-medium text-gray-700">15 февраля 2026</span>
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" onClick={() => toast.success('Экспорт в Excel запущен')}>
                  <Icon name="FileSpreadsheet" size={15} className="mr-1.5" />
                  Экспорт Excel
                </Button>
                <Button variant="outline" onClick={() => toast.success('Формирование PDF...')}>
                  <Icon name="FileText" size={15} className="mr-1.5" />
                  Экспорт PDF
                </Button>
                <Button onClick={() => toast.success('Отчёт для Росприроднадзора сформирован и готов к скачиванию')}>
                  <Icon name="ClipboardCheck" size={15} className="mr-1.5" />
                  Сформировать
                </Button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">Период отчёта</p>
                <p className="font-medium text-gray-900 mt-0.5">Январь — Май 2026</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">Единиц оборудования</p>
                <p className="font-medium text-gray-900 mt-0.5">10 объектов</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">Объём хладагента</p>
                <p className="font-medium text-gray-900 mt-0.5">723 кг (заправлено)</p>
              </div>
            </div>
          </div>

          {/* BarChart */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Объём по типам хладагентов (кг / месяц)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={MONTHLY_REPORT_DATA} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit=" кг" />
                <Tooltip formatter={(v: number) => [`${v.toFixed(1)} кг`]} />
                <Legend />
                <Bar dataKey="R410A" name="R410A" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="R32" name="R32" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="R22" name="R22" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefrigerantComplianceFull;
