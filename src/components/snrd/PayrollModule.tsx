import { useState } from 'react';
import { DollarSign, Download, ChevronDown, ChevronUp, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PayslipLine {
  label: string;
  amount: number;
  type: 'income' | 'deduction' | 'total';
  note?: string;
}

interface Employee {
  id: string;
  name: string;
  role: string;
  ordersCount: number;
  revenue: number;
  baseRate: number;
  pieceRate: number;
  gsmKm: number;
  bonus: number;
  nightBonus: number;
  emergencyBonus: number;
  grossIncome: number;
  ndfl: number;
  netPay: number;
  trend: number;
}

const EMPLOYEES: Employee[] = [
  { id: 'e1', name: 'Козлов М.И.', role: 'Инженер (авто)', ordersCount: 42, revenue: 612000, baseRate: 0, pieceRate: 47200, gsmKm: 2881, bonus: 5000, nightBonus: 1200, emergencyBonus: 3000, grossIncome: 59281, ndfl: 7706, netPay: 51575, trend: 8 },
  { id: 'e2', name: 'Петров С.А.', role: 'Инженер (авто)', ordersCount: 38, revenue: 541000, baseRate: 0, pieceRate: 41600, gsmKm: 2480, bonus: 3000, nightBonus: 600, emergencyBonus: 1500, grossIncome: 49180, ndfl: 6393, netPay: 42787, trend: 5 },
  { id: 'e3', name: 'Иванов А.К.', role: 'Инженер (ОТ)', ordersCount: 35, revenue: 498000, baseRate: 0, pieceRate: 37800, gsmKm: 0, bonus: 2000, nightBonus: 0, emergencyBonus: 1500, grossIncome: 41300, ndfl: 5369, netPay: 35931, trend: 3 },
  { id: 'e4', name: 'Смирнова Н.В.', role: 'Диспетчер', ordersCount: 218, revenue: 4200000, baseRate: 45000, pieceRate: 12540, gsmKm: 0, bonus: 5000, nightBonus: 0, emergencyBonus: 0, grossIncome: 62540, ndfl: 8130, netPay: 54410, trend: 12 },
  { id: 'e5', name: 'Орлов В.Р.', role: 'Менеджер продаж', ordersCount: 0, revenue: 840000, baseRate: 40000, pieceRate: 8400, gsmKm: 0, bonus: 10000, nightBonus: 0, emergencyBonus: 0, grossIncome: 58400, ndfl: 7592, netPay: 50808, trend: 15 },
];

const PERIOD_TRENDS = [
  { month: 'Янв', payroll: 185000, revenue: 2800000 },
  { month: 'Фев', payroll: 196000, revenue: 3100000 },
  { month: 'Мар', payroll: 208000, revenue: 3400000 },
  { month: 'Апр', payroll: 221000, revenue: 3900000 },
  { month: 'Май', payroll: 236000, revenue: 4200000 },
];

const formatMoney = (n: number) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';

const PayrollModule = () => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [period] = useState('Май 2026');

  const totalPayroll = EMPLOYEES.reduce((s, e) => s + e.netPay, 0);
  const totalGross = EMPLOYEES.reduce((s, e) => s + e.grossIncome, 0);
  const totalNdfl = EMPLOYEES.reduce((s, e) => s + e.ndfl, 0);

  const getPayslipLines = (e: Employee): PayslipLine[] => [
    { label: 'Оклад', amount: e.baseRate, type: 'income', note: e.baseRate > 0 ? undefined : 'Сдельная система' },
    { label: 'Сдельный заработок', amount: e.pieceRate, type: 'income', note: e.ordersCount > 0 ? `${e.ordersCount} нарядов` : undefined },
    { label: 'Компенсация ГСМ', amount: e.gsmKm, type: 'income', note: e.gsmKm > 0 ? `${Math.round(e.gsmKm / 6.6)} км × 6.6 ₽` : undefined },
    { label: 'Премия', amount: e.bonus, type: 'income' },
    { label: 'Ночные надбавки', amount: e.nightBonus, type: 'income' },
    { label: 'Аварийные надбавки', amount: e.emergencyBonus, type: 'income' },
    { label: 'Итого начислено', amount: e.grossIncome, type: 'total' },
    { label: 'НДФЛ 13%', amount: -e.ndfl, type: 'deduction' },
    { label: 'К выплате', amount: e.netPay, type: 'total' },
  ].filter(l => l.amount !== 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <DollarSign size={28} className="text-green-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Расчёт зарплаты</h2>
            <p className="text-gray-500 text-sm">Период: {period}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info('Экспорт в 1С')}>
            <Download size={14} className="mr-2" /> Экспорт в 1С
          </Button>
          <Button size="sm" onClick={() => toast.success('Расчётные листки отправлены сотрудникам')}>
            Отправить листки
          </Button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Начислено (брутто)', value: formatMoney(totalGross), icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
          { label: 'НДФЛ', value: formatMoney(totalNdfl), icon: DollarSign, color: 'text-orange-600 bg-orange-50' },
          { label: 'К выплате (нетто)', value: formatMoney(totalPayroll), icon: DollarSign, color: 'text-green-600 bg-green-50' },
          { label: 'Сотрудников', value: EMPLOYEES.length.toString(), icon: Users, color: 'text-purple-600 bg-purple-50' },
        ].map(k => (
          <div key={k.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${k.color}`}>
              <k.icon size={18} />
            </div>
            <p className="text-xl font-bold text-gray-900">{k.value}</p>
            <p className="text-xs text-gray-500 mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">ФОТ vs Выручка (5 мес.)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={PERIOD_TRENDS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(v: number, name: string) => [formatMoney(v), name === 'payroll' ? 'ФОТ' : 'Выручка']} />
              <Bar yAxisId="left" dataKey="payroll" fill="#10b981" name="ФОТ" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="revenue" fill="#93c5fd" name="Выручка" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Структура ФОТ (май)</h3>
          <div className="space-y-3">
            {[
              { label: 'Инженеры (сдельно)', pct: 64, color: 'bg-blue-500' },
              { label: 'Менеджеры (оклад+%)', pct: 21, color: 'bg-purple-500' },
              { label: 'Диспетчеры', pct: 15, color: 'bg-green-500' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700">{item.label}</span>
                  <span className="font-medium text-gray-900">{item.pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
            <p>ФОТ/Выручка: {((totalPayroll / 4200000) * 100).toFixed(1)}%</p>
            <p className="text-green-600 mt-1">↓ ниже целевого 6.5%</p>
          </div>
        </div>
      </div>

      {/* Employee list with payslips */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 mb-3">Расчётные листки</h3>
        {EMPLOYEES.map(e => {
          const isOpen = expanded === e.id;
          const lines = getPayslipLines(e);
          return (
            <div key={e.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(isOpen ? null : e.id)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-700 font-bold text-sm">
                      {e.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{e.name}</p>
                    <p className="text-xs text-gray-500">{e.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Начислено</p>
                    <p className="font-medium text-gray-900">{formatMoney(e.grossIncome)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">К выплате</p>
                    <p className="font-semibold text-green-700">{formatMoney(e.netPay)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Тренд</p>
                    <p className={`text-sm font-medium ${e.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {e.trend > 0 ? '+' : ''}{e.trend}%
                    </p>
                  </div>
                  {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 p-4">
                  <div className="max-w-md">
                    {lines.map((line, i) => (
                      <div key={i} className={`flex justify-between py-2 text-sm ${line.type === 'total' ? 'font-semibold border-t border-gray-200 mt-1 pt-2' : ''} ${line.type === 'deduction' ? 'text-red-600' : ''}`}>
                        <span className={line.type === 'income' ? 'text-gray-700' : line.type === 'deduction' ? 'text-red-600' : 'text-gray-900'}>
                          {line.label}
                          {line.note && <span className="text-xs text-gray-400 ml-2">({line.note})</span>}
                        </span>
                        <span>{line.amount < 0 ? '− ' : ''}{formatMoney(Math.abs(line.amount))}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={() => toast.info(`PDF: ${e.name}`)}>
                      <Download size={12} className="mr-1" /> Скачать PDF
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toast.success(`Листок отправлен: ${e.name}`)}>
                      Отправить сотруднику
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PayrollModule;
