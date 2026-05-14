import { useState } from 'react';
import { Thermometer, AlertTriangle, CheckCircle, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

interface RefrigerantRecord {
  id: string;
  equipment: string;
  client: string;
  refrigerantType: string;
  fullCharge: number;
  chargedYear: number;
  recoveredYear: number;
  leakPercent: number;
  cylinderSerial: string;
  lastOperation: string;
  engineer: string;
  status: 'ok' | 'warning' | 'critical';
}

const RECORDS: RefrigerantRecord[] = [
  { id: 'r1', equipment: 'Daikin FTXB35C (ООО Альфа)', client: 'ООО Альфа', refrigerantType: 'R-410A', fullCharge: 1.8, chargedYear: 0.2, recoveredYear: 0.0, leakPercent: 11.1, cylinderSerial: 'CYL-001-2024', lastOperation: '12.05.2026', engineer: 'Козлов М.', status: 'ok' },
  { id: 'r2', equipment: 'Gree GMV-500 (ТЦ Мираж)', client: 'ТЦ Мираж', refrigerantType: 'R-32', fullCharge: 12.5, chargedYear: 4.1, recoveredYear: 1.2, leakPercent: 32.8, cylinderSerial: 'CYL-003-2024', lastOperation: '08.05.2026', engineer: 'Петров С.', status: 'critical' },
  { id: 'r3', equipment: 'Mitsubishi MSZ-LN (ТЦ Мираж)', client: 'ТЦ Мираж', refrigerantType: 'R-410A', fullCharge: 2.4, chargedYear: 0.6, recoveredYear: 0.0, leakPercent: 25.0, cylinderSerial: 'CYL-002-2024', lastOperation: '28.04.2026', engineer: 'Козлов М.', status: 'warning' },
  { id: 'r4', equipment: 'LG S18EQ (ИП Смирнов)', client: 'ИП Смирнов', refrigerantType: 'R-410A', fullCharge: 1.6, chargedYear: 0.1, recoveredYear: 0.0, leakPercent: 6.3, cylinderSerial: 'CYL-001-2024', lastOperation: '15.04.2026', engineer: 'Иванов А.', status: 'ok' },
  { id: 'r5', equipment: 'Haier AC36CS (Склад ООО Берег)', client: 'ООО Берег', refrigerantType: 'R-22', fullCharge: 2.2, chargedYear: 0.8, recoveredYear: 0.4, leakPercent: 36.4, cylinderSerial: 'CYL-004-2022', lastOperation: '01.03.2026', engineer: 'Сидоров Д.', status: 'critical' },
];

const MONTHLY_USAGE = [
  { month: 'Янв', charged: 1.2, recovered: 0.4 },
  { month: 'Фев', charged: 0.9, recovered: 0.2 },
  { month: 'Мар', charged: 2.1, recovered: 0.8 },
  { month: 'Апр', charged: 1.8, recovered: 0.6 },
  { month: 'Май', charged: 2.8, recovered: 1.0 },
];

const getStatusInfo = (status: string) => ({
  ok: { label: 'Норма', cls: 'bg-green-100 text-green-700', icon: <CheckCircle size={14} className="text-green-600" /> },
  warning: { label: 'Превышение (>20%)', cls: 'bg-yellow-100 text-yellow-700', icon: <AlertTriangle size={14} className="text-yellow-600" /> },
  critical: { label: 'Критично (>30%)', cls: 'bg-red-100 text-red-700', icon: <AlertTriangle size={14} className="text-red-600" /> },
}[status] || { label: status, cls: 'bg-gray-100 text-gray-600', icon: null });

const RefrigerantComplianceReporter = () => {
  const [period, setPeriod] = useState('2026');

  const criticalCount = RECORDS.filter(r => r.status === 'critical').length;
  const warningCount = RECORDS.filter(r => r.status === 'warning').length;
  const totalCharged = RECORDS.reduce((s, r) => s + r.chargedYear, 0);
  const totalRecovered = RECORDS.reduce((s, r) => s + r.recoveredYear, 0);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Thermometer size={28} className="text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Учёт хладагентов</h2>
            <p className="text-gray-600 mt-0.5">Журнал операций и отчётность для Росприроднадзора</p>
          </div>
        </div>
        <div className="flex gap-2">
          <select value={period} onChange={e => setPeriod(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="2026">2026 год</option>
            <option value="2025">2025 год</option>
          </select>
          <Button onClick={() => toast.success('Отчёт Росприроднадзор сформирован')}>
            <Download size={16} className="mr-2" /> Отчёт РПН
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700 font-medium">Критичных утечек</p>
          <p className="text-3xl font-bold text-red-700">{criticalCount}</p>
          <p className="text-xs text-red-600 mt-1">порог &gt;30%</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-700 font-medium">Предупреждений</p>
          <p className="text-3xl font-bold text-yellow-700">{warningCount}</p>
          <p className="text-xs text-yellow-600 mt-1">порог 20-30%</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700 font-medium">Заправлено</p>
          <p className="text-3xl font-bold text-blue-700">{totalCharged.toFixed(1)} кг</p>
          <p className="text-xs text-blue-600 mt-1">за {period} год</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700 font-medium">Утилизировано</p>
          <p className="text-3xl font-bold text-green-700">{totalRecovered.toFixed(1)} кг</p>
          <p className="text-xs text-green-600 mt-1">рекуперация</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Динамика использования хладагентов (кг)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MONTHLY_USAGE}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="charged" name="Заправлено" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="recovered" name="Рекуперировано" fill="#10b981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">По типам хладагента</h3>
          <div className="space-y-3">
            {[
              { type: 'R-410A', kg: 2.9, count: 3 },
              { type: 'R-32', kg: 4.1, count: 1 },
              { type: 'R-22', kg: 0.8, count: 1 },
            ].map(item => (
              <div key={item.type} className="flex items-center justify-between py-2 border-b border-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{item.type}</p>
                  <p className="text-xs text-gray-500">{item.count} ед. оборудования</p>
                </div>
                <p className="font-semibold text-gray-700">{item.kg} кг</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100">
            <Button size="sm" variant="outline" className="w-full" onClick={() => toast.success('Паспорт баллонов выгружен')}>
              <FileText size={14} className="mr-1" /> Паспорта баллонов
            </Button>
          </div>
        </div>
      </div>

      {/* Records table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">Журнал учёта хладагентов</h3>
          <Button size="sm" variant="outline" onClick={() => toast.success('Журнал выгружен в Excel')}>
            <Download size={14} className="mr-1" /> Excel
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Оборудование', 'Тип', 'Заряд полн.', 'Заправл.', 'Рекупер.', 'Утечка %', 'Инженер', 'Дата', 'Статус'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {RECORDS.map(r => {
                const statusInfo = getStatusInfo(r.status);
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 max-w-xs truncate">{r.equipment}</p>
                      <p className="text-xs text-gray-500">{r.cylinderSerial}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-mono">{r.refrigerantType}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.fullCharge} кг</td>
                    <td className="px-4 py-3 text-sm text-blue-700 font-medium">{r.chargedYear} кг</td>
                    <td className="px-4 py-3 text-sm text-green-700">{r.recoveredYear} кг</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${r.status === 'critical' ? 'text-red-600' : r.status === 'warning' ? 'text-yellow-600' : 'text-green-600'}`}>
                        {r.leakPercent.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.engineer}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{r.lastOperation}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {statusInfo.icon}
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusInfo.cls}`}>{statusInfo.label}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RefrigerantComplianceReporter;
