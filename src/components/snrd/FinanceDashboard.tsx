import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Icon from '@/components/ui/icon';

const fmtFull = (n: number) => n.toLocaleString('ru-RU');

const monthlyData = [
  { month: 'Май', revenue: 2140000, cost: 1480000, margin: 30.8 },
  { month: 'Июн', revenue: 2380000, cost: 1620000, margin: 31.9 },
  { month: 'Июл', revenue: 2650000, cost: 1790000, margin: 32.5 },
  { month: 'Авг', revenue: 2510000, cost: 1710000, margin: 31.9 },
  { month: 'Сен', revenue: 2720000, cost: 1850000, margin: 32.0 },
  { month: 'Окт', revenue: 2847000, cost: 1923000, margin: 32.4 },
];

const costBreakdown = [
  { name: 'Зарплата', value: 40, color: '#6366F1' },
  { name: 'Материалы', value: 35, color: '#10B981' },
  { name: 'Накладные', value: 17, color: '#F59E0B' },
  { name: 'ГСМ', value: 8, color: '#EF4444' },
];

interface TopOrder {
  id: string;
  workOrder: string;
  client: string;
  revenue: number;
  cost: number;
  margin: number;
  marginPct: number;
}

const topOrders: TopOrder[] = [
  { id: '1', workOrder: 'WO-2024-000041', client: 'ООО "МегаМолл"', revenue: 189000, cost: 98000, margin: 91000, marginPct: 48.1 },
  { id: '2', workOrder: 'WO-2024-000055', client: 'ООО "Альфа-Центр"', revenue: 145000, cost: 78000, margin: 67000, marginPct: 46.2 },
  { id: '3', workOrder: 'WO-2024-000043', client: 'АО "ПромСтрой"', revenue: 122000, cost: 67000, margin: 55000, marginPct: 45.1 },
  { id: '4', workOrder: 'WO-2024-000064', client: 'ИП Смирнов А.П.', revenue: 38000, cost: 21000, margin: 17000, marginPct: 44.7 },
  { id: '5', workOrder: 'WO-2024-000047', client: 'ООО "ТехноСервис"', revenue: 87000, cost: 49000, margin: 38000, marginPct: 43.7 },
  { id: '6', workOrder: 'WO-2024-000052', client: 'ООО "НоваФарм"', revenue: 115000, cost: 65000, margin: 50000, marginPct: 43.5 },
  { id: '7', workOrder: 'WO-2024-000049', client: 'ЗАО "РосТех"', revenue: 78000, cost: 45000, margin: 33000, marginPct: 42.3 },
  { id: '8', workOrder: 'WO-2024-000058', client: 'ООО "МегаМолл"', revenue: 156000, cost: 92000, margin: 64000, marginPct: 41.0 },
  { id: '9', workOrder: 'WO-2024-000061', client: 'ПАО "СтройИнвест"', revenue: 198000, cost: 119000, margin: 79000, marginPct: 39.9 },
  { id: '10', workOrder: 'WO-2024-000067', client: 'ООО "ТехноСервис"', revenue: 72000, cost: 44000, margin: 28000, marginPct: 38.9 },
];

interface KpiCardProps {
  title: string;
  value: string;
  sub?: string;
  change: string;
  positive: boolean;
  icon: string;
  iconBg: string;
  iconColor: string;
}

const KpiCard = ({ title, value, sub, change, positive, icon, iconBg, iconColor }: KpiCardProps) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {sub && <p className="text-sm text-gray-500 mt-0.5">{sub}</p>}
          <p className={`text-sm mt-2 flex items-center gap-1 ${positive ? 'text-green-600' : 'text-red-600'}`}>
            <Icon name={positive ? 'TrendingUp' : 'TrendingDown'} size={14} />
            {change} к прошлому месяцу
          </p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon name={icon} size={22} className={iconColor} />
        </div>
      </div>
    </CardContent>
  </Card>
);

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-semibold text-gray-900">
            {typeof p.value === 'number' && p.name.includes('%') ? `${p.value}%` : `${fmtFull(p.value)} ₽`}
          </span>
        </div>
      ))}
    </div>
  );
};

const MarginTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <span className="font-bold text-gray-900">{payload[0].value}%</span>
    </div>
  );
};

const PieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-700">{payload[0].name}: {payload[0].value}%</p>
    </div>
  );
};

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
  cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number;
}) => {
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const FinanceDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Финансы и маржинальность</h2>
        <p className="text-gray-500 mt-1">Аналитика за октябрь 2024</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Выручка за месяц"
          value="₽ 2 847 000"
          change="+4.7%"
          positive={true}
          icon="TrendingUp"
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <KpiCard
          title="Себестоимость"
          value="₽ 1 923 000"
          change="+3.9%"
          positive={false}
          icon="Layers"
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
        <KpiCard
          title="Маржа"
          value="₽ 924 000"
          sub="32,4% от выручки"
          change="+0.5%"
          positive={true}
          icon="BarChart3"
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <KpiCard
          title="Дебиторская задолженность"
          value="₽ 456 000"
          change="-8.2%"
          positive={true}
          icon="CreditCard"
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-800">
              Выручка и себестоимость по месяцам
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickFormatter={v => `${(v / 1000000).toFixed(1)}М`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="revenue" name="Выручка" fill="#6366F1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cost" name="Себестоимость" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-800">
              Маржинальность %
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis
                  domain={[28, 36]}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickFormatter={v => `${v}%`}
                />
                <Tooltip content={<MarginTooltip />} />
                <Line
                  type="monotone"
                  dataKey="margin"
                  name="Маржа %"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ fill: '#10B981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-800">
              Структура затрат
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={costBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {costBreakdown.map(item => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-gray-600">{item.name}</span>
                  <span className="font-semibold text-gray-800 ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-800">
              Топ-10 нарядов по маржинальности
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-5 py-2.5 text-gray-600 font-medium">#</th>
                    <th className="text-left px-3 py-2.5 text-gray-600 font-medium">Наряд</th>
                    <th className="text-left px-3 py-2.5 text-gray-600 font-medium">Клиент</th>
                    <th className="text-right px-3 py-2.5 text-gray-600 font-medium">Выручка</th>
                    <th className="text-right px-3 py-2.5 text-gray-600 font-medium">Маржа</th>
                    <th className="text-right px-5 py-2.5 text-gray-600 font-medium">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topOrders.map((order, i) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-5 py-2 text-gray-400 font-medium">{i + 1}</td>
                      <td className="px-3 py-2 text-blue-600 font-medium">{order.workOrder}</td>
                      <td className="px-3 py-2 text-gray-700">{order.client}</td>
                      <td className="px-3 py-2 text-right text-gray-800">{fmtFull(order.revenue)} ₽</td>
                      <td className="px-3 py-2 text-right text-green-700 font-semibold">{fmtFull(order.margin)} ₽</td>
                      <td className="px-5 py-2 text-right">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                          order.marginPct >= 45 ? 'bg-green-100 text-green-700' :
                          order.marginPct >= 40 ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {order.marginPct.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td colSpan={3} className="px-5 py-2.5 text-sm font-semibold text-gray-700">Итого по топ-10</td>
                    <td className="px-3 py-2.5 text-right font-bold text-gray-900">
                      {fmtFull(topOrders.reduce((s, o) => s + o.revenue, 0))} ₽
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-green-700">
                      {fmtFull(topOrders.reduce((s, o) => s + o.margin, 0))} ₽
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <span className="text-sm font-bold text-gray-700">
                        {(topOrders.reduce((s, o) => s + o.marginPct, 0) / topOrders.length).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinanceDashboard;
