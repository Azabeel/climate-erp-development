import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = 'forecasts' | 'models' | 'metrics' | 'settings';
type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

interface EquipmentRisk {
  id: string;
  name: string;
  client: string;
  location: string;
  probability: number;
  failureType: string;
  forecastDate: string;
  lastMaintenance: string;
  nextMaintenance: string;
  motorHours: number;
  brand: string;
  actions: string[];
}

interface KpiMetric {
  label: string;
  value: number | string;
  unit?: string;
  icon: string;
  color: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const TOP_RISKS: EquipmentRisk[] = [
  {
    id: 'eq-001',
    name: 'Чиллер Daikin EWAD380',
    client: 'ТЦ «Галерея»',
    location: 'Машинный зал, 3 эт.',
    probability: 87,
    failureType: 'Износ компрессора',
    forecastDate: '25.05.2026',
    lastMaintenance: '12.02.2026',
    nextMaintenance: '12.05.2026',
    motorHours: 4820,
    brand: 'Daikin',
    actions: ['Замена масла компрессора', 'Проверка клапанов', 'Вибродиагностика'],
  },
  {
    id: 'eq-002',
    name: 'VRF-система Mitsubishi PUHY-P400',
    client: 'Бизнес-центр «Сити»',
    location: 'Кровля, блок A',
    probability: 74,
    failureType: 'Засорение теплообменника',
    forecastDate: '01.06.2026',
    lastMaintenance: '03.01.2026',
    nextMaintenance: '03.04.2026',
    motorHours: 6210,
    brand: 'Mitsubishi',
    actions: ['Промывка теплообменника', 'Чистка фильтров', 'Проверка хладагента'],
  },
  {
    id: 'eq-003',
    name: 'Прецизионный кондиционер Stulz CyberAir 3',
    client: 'ЦОД «Ростелеком»',
    location: 'Серверная, стойка B-12',
    probability: 68,
    failureType: 'Утечка хладагента R-410A',
    forecastDate: '08.06.2026',
    lastMaintenance: '20.03.2026',
    nextMaintenance: '20.06.2026',
    motorHours: 8930,
    brand: 'Stulz',
    actions: ['Проверка контура хладагента', 'Течеискание', 'Дозаправка при необходимости'],
  },
  {
    id: 'eq-004',
    name: 'Холодильная машина York YCAS0183',
    client: 'Гипермаркет «Лента»',
    location: 'Холодильный цех',
    probability: 55,
    failureType: 'Неисправность вентилятора',
    forecastDate: '15.06.2026',
    lastMaintenance: '10.04.2026',
    nextMaintenance: '10.07.2026',
    motorHours: 3640,
    brand: 'York',
    actions: ['Замена подшипников вентилятора', 'Балансировка крыльчатки'],
  },
  {
    id: 'eq-005',
    name: 'Кондиционер Carrier 30XW-P',
    client: 'Отель «Парк Хаятт»',
    location: 'Технический этаж',
    probability: 42,
    failureType: 'Загрязнение фреонового контура',
    forecastDate: '22.06.2026',
    lastMaintenance: '05.02.2026',
    nextMaintenance: '05.05.2026',
    motorHours: 5100,
    brand: 'Carrier',
    actions: ['Промывка системы', 'Замена осушителя', 'Проверка ТРВ'],
  },
];

const ALL_EQUIPMENT: EquipmentRisk[] = [
  ...TOP_RISKS,
  {
    id: 'eq-006', name: 'Daikin VRV IV RYYQ16T', client: 'Офис «Газпром нефть»',
    location: 'Кровля', probability: 38, failureType: 'Засорение дренажа',
    forecastDate: '28.06.2026', lastMaintenance: '15.03.2026', nextMaintenance: '15.06.2026',
    motorHours: 2890, brand: 'Daikin', actions: ['Прочистка дренажной системы'],
  },
  {
    id: 'eq-007', name: 'Mitsubishi FD-E500', client: 'Завод «Северсталь»',
    location: 'Цех №4', probability: 29, failureType: 'Износ приводного ремня',
    forecastDate: '05.07.2026', lastMaintenance: '01.04.2026', nextMaintenance: '01.07.2026',
    motorHours: 7200, brand: 'Mitsubishi', actions: ['Замена ремня привода'],
  },
  {
    id: 'eq-008', name: 'Lennox MCAC 072', client: 'Клиника «Медси»',
    location: 'Операционный блок', probability: 21, failureType: 'Снижение хладопроизводительности',
    forecastDate: '10.07.2026', lastMaintenance: '20.04.2026', nextMaintenance: '20.07.2026',
    motorHours: 1450, brand: 'Lennox', actions: ['Диагностика системы', 'Проверка заправки'],
  },
  {
    id: 'eq-009', name: 'Trane CGAF 060', client: 'ТРЦ «Мега»',
    location: 'Технический подвал', probability: 14, failureType: 'Шум в компрессоре',
    forecastDate: '20.07.2026', lastMaintenance: '10.05.2026', nextMaintenance: '10.08.2026',
    motorHours: 3300, brand: 'Trane', actions: ['Виброакустическая диагностика'],
  },
];

const MODEL_ACCURACY_DATA = [
  { month: 'Ноя', train: 79, val: 74 },
  { month: 'Дек', train: 82, val: 77 },
  { month: 'Янв', train: 84, val: 80 },
  { month: 'Фев', train: 85, val: 82 },
  { month: 'Мар', train: 87, val: 84 },
  { month: 'Апр', train: 88, val: 87 },
];

const SCATTER_DATA = [
  { hours: 500, prob: 8 }, { hours: 1200, prob: 14 }, { hours: 1800, prob: 19 },
  { hours: 2200, prob: 25 }, { hours: 2890, prob: 29 }, { hours: 3300, prob: 35 },
  { hours: 3640, prob: 42 }, { hours: 4100, prob: 51 }, { hours: 4820, prob: 62 },
  { hours: 5100, prob: 68 }, { hours: 5500, prob: 71 }, { hours: 6210, prob: 76 },
  { hours: 6800, prob: 81 }, { hours: 7200, prob: 85 }, { hours: 7900, prob: 88 },
  { hours: 8930, prob: 91 },
];

const PREVENTED_VS_REAL_DATA = [
  { month: 'Ноя', prevented: 2, real: 3 },
  { month: 'Дек', prevented: 3, real: 2 },
  { month: 'Янв', prevented: 4, real: 2 },
  { month: 'Фев', prevented: 5, real: 1 },
  { month: 'Мар', prevented: 6, real: 1 },
  { month: 'Апр', prevented: 7, real: 1 },
];

const SAVINGS_BY_BRAND = [
  { brand: 'Daikin', savings: 412000 },
  { brand: 'Mitsubishi', savings: 287000 },
  { brand: 'Stulz', savings: 198000 },
  { brand: 'York', savings: 143000 },
  { brand: 'Carrier', savings: 118000 },
  { brand: 'Trane', savings: 76000 },
];

const KPI_MODEL_METRICS = [
  { metric: 'Precision', value: 0.89, description: 'Точность положительных предсказаний' },
  { metric: 'Recall', value: 0.84, description: 'Полнота — доля найденных отказов' },
  { metric: 'F1-Score', value: 0.865, description: 'Гармоническое среднее P и R' },
  { metric: 'AUC-ROC', value: 0.923, description: 'Площадь под ROC-кривой' },
  { metric: 'RMSE', value: 0.112, description: 'Среднеквадратичная ошибка вероятности' },
  { metric: 'MAE', value: 0.087, description: 'Средняя абсолютная ошибка' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRiskLevel(probability: number): RiskLevel {
  if (probability >= 70) return 'critical';
  if (probability >= 50) return 'high';
  if (probability >= 30) return 'medium';
  return 'low';
}

function getRiskBadge(probability: number) {
  const level = getRiskLevel(probability);
  const map: Record<RiskLevel, { label: string; className: string }> = {
    critical: { label: 'Критический', className: 'bg-red-100 text-red-700 border-red-200' },
    high: { label: 'Высокий', className: 'bg-orange-100 text-orange-700 border-orange-200' },
    medium: { label: 'Средний', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    low: { label: 'Низкий', className: 'bg-green-100 text-green-700 border-green-200' },
  };
  return map[level];
}

function getProgressColor(probability: number): string {
  if (probability >= 70) return 'bg-red-500';
  if (probability >= 40) return 'bg-yellow-500';
  return 'bg-green-500';
}

function formatRub(value: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon name={icon as any} size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function RiskCard({ equipment, onSchedule, scheduled }: {
  equipment: EquipmentRisk;
  onSchedule: (id: string) => void;
  scheduled: boolean;
}) {
  const badge = getRiskBadge(equipment.probability);
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{equipment.name}</p>
          <p className="text-sm text-gray-500 truncate">{equipment.client} · {equipment.location}</p>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border shrink-0 ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Вероятность отказа</span>
          <span className="font-bold text-gray-900">{equipment.probability}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${getProgressColor(equipment.probability)}`}
            style={{ width: `${equipment.probability}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
        <div className="flex items-center gap-1.5">
          <Icon name="AlertTriangle" size={13} className="text-orange-400" />
          <span>{equipment.failureType}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Icon name="Calendar" size={13} className="text-blue-400" />
          <span>Прогноз: {equipment.forecastDate}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Icon name="Clock" size={13} className="text-gray-400" />
          <span>{equipment.motorHours.toLocaleString('ru-RU')} мч</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Icon name="Wrench" size={13} className="text-gray-400" />
          <span>ТО: {equipment.lastMaintenance}</span>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-xs font-medium text-gray-700 mb-1.5">Рекомендуемые действия:</p>
        <ul className="space-y-1">
          {equipment.actions.map((action, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
              <Icon name="ChevronRight" size={12} className="text-blue-500 mt-0.5 shrink-0" />
              {action}
            </li>
          ))}
        </ul>
      </div>

      <Button
        size="sm"
        className={`w-full text-xs ${scheduled ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
        onClick={() => !scheduled && onSchedule(equipment.id)}
      >
        <Icon name={scheduled ? 'CheckCircle' : 'CalendarPlus'} size={14} className="mr-1.5" />
        {scheduled ? 'Запланировано' : 'Запланировать ТО'}
      </Button>
    </div>
  );
}

// ─── Tab: Forecasts ───────────────────────────────────────────────────────────

function ForecastsTab() {
  const [scheduledIds, setScheduledIds] = useState<Set<string>>(new Set());
  const [filterBrand, setFilterBrand] = useState('all');

  function handleSchedule(id: string) {
    setScheduledIds(prev => new Set(prev).add(id));
    const eq = ALL_EQUIPMENT.find(e => e.id === id);
    toast.success(`Наряд ТО запланирован для ${eq?.name ?? 'оборудования'}`, {
      description: 'Задача передана диспетчеру',
    });
  }

  const brands = ['all', ...Array.from(new Set(ALL_EQUIPMENT.map(e => e.brand)))];
  const filtered = filterBrand === 'all' ? ALL_EQUIPMENT : ALL_EQUIPMENT.filter(e => e.brand === filterBrand);

  return (
    <div className="space-y-6">
      {/* Top-5 Risk Cards */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          Топ-5 оборудования под риском
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4">
          {TOP_RISKS.map(eq => (
            <RiskCard
              key={eq.id}
              equipment={eq}
              onSchedule={handleSchedule}
              scheduled={scheduledIds.has(eq.id)}
            />
          ))}
        </div>
      </div>

      {/* Full Equipment Table */}
      <div>
        <div className="flex items-center justify-between mb-3 gap-3">
          <h3 className="text-base font-semibold text-gray-900">Всё оборудование</h3>
          <Select value={filterBrand} onValueChange={setFilterBrand}>
            <SelectTrigger className="w-44 h-8 text-sm">
              <SelectValue placeholder="Бренд" />
            </SelectTrigger>
            <SelectContent>
              {brands.map(b => (
                <SelectItem key={b} value={b}>{b === 'all' ? 'Все бренды' : b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Оборудование</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 min-w-[180px]">Вероятность отказа</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Следующее ТО</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Последнее ТО</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Моточасы</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Риск</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(eq => {
                  const badge = getRiskBadge(eq.probability);
                  return (
                    <tr key={eq.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{eq.name}</p>
                        <p className="text-xs text-gray-500">{eq.client}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getProgressColor(eq.probability)}`}
                              style={{ width: `${eq.probability}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-800 w-8 text-right">{eq.probability}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{eq.nextMaintenance}</td>
                      <td className="py-3 px-4 text-gray-700">{eq.lastMaintenance}</td>
                      <td className="py-3 px-4 text-right text-gray-700">{eq.motorHours.toLocaleString('ru-RU')}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Models ──────────────────────────────────────────────────────────────

function ModelsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accuracy over time */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-4">Точность модели за 6 месяцев</h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={MODEL_ACCURACY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis domain={[70, 95]} tickFormatter={v => `${v}%`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => [`${v}%`]} />
              <Legend />
              <Line type="monotone" dataKey="train" name="Обучение" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="val" name="Валидация" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} strokeDasharray="5 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Scatter: motor hours vs probability */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-4">Моточасы vs Вероятность отказа</h4>
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hours" name="Моточасы" tick={{ fontSize: 12 }} label={{ value: 'мч', position: 'insideBottomRight', offset: -5, fontSize: 12 }} />
              <YAxis dataKey="prob" name="Вероятность" tickFormatter={v => `${v}%`} tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(v: number, name: string) => [name === 'prob' ? `${v}%` : v.toLocaleString('ru-RU') + ' мч', name === 'prob' ? 'Вероятность' : 'Моточасы']} />
              <Scatter data={SCATTER_DATA} fill="#6366f1" opacity={0.8} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Info Card */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <h4 className="font-semibold text-gray-900 mb-4">Параметры модели</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Алгоритм', value: 'LightGBM', icon: 'Cpu', color: 'text-purple-600' },
            { label: 'Признаков', value: '14', icon: 'GitBranch', color: 'text-blue-600' },
            { label: 'Accuracy', value: '87%', icon: 'Target', color: 'text-green-600' },
            { label: 'Последнее обучение', value: '01.05.2026', icon: 'RefreshCw', color: 'text-orange-600' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Icon name={item.icon as any} size={20} className={item.color} />
              <div>
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="font-semibold text-gray-900">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Использованные признаки:</p>
          <div className="flex flex-wrap gap-2">
            {[
              'Моточасы', 'Возраст оборудования', 'Температура компрессора', 'Давление хладагента',
              'Ток электродвигателя', 'Вибрация (RMS)', 'Дата последнего ТО', 'Бренд',
              'Тип оборудования', 'Регион', 'Сезон', 'Интенсивность эксплуатации',
              'Количество предыдущих отказов', 'Качество хладагента',
            ].map(feat => (
              <span key={feat} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-0.5">
                {feat}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Metrics ─────────────────────────────────────────────────────────────

function MetricsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prevented vs Real failures */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-4">Предотвращённые vs Реальные отказы</h4>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={PREVENTED_VS_REAL_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="prevented" name="Предотвращено" stroke="#10b981" fill="#d1fae5" strokeWidth={2} />
              <Area type="monotone" dataKey="real" name="Реальных отказов" stroke="#ef4444" fill="#fee2e2" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Savings by brand */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-4">Экономия по брендам, ₽</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={SAVINGS_BY_BRAND} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tickFormatter={v => `${(v / 1000).toFixed(0)}к`} tick={{ fontSize: 11 }} />
              <YAxis dataKey="brand" type="category" tick={{ fontSize: 12 }} width={70} />
              <Tooltip formatter={(v: number) => [formatRub(v), 'Экономия']} />
              <Bar dataKey="savings" name="Экономия" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KPI Model Metrics Table */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <h4 className="font-semibold text-gray-900 mb-4">KPI модели предиктивной аналитики</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Метрика</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Значение</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 min-w-[180px]">Прогресс</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Описание</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {KPI_MODEL_METRICS.map(row => (
                <tr key={row.metric} className="hover:bg-gray-50/50">
                  <td className="py-3 px-4 font-semibold text-gray-900">{row.metric}</td>
                  <td className="py-3 px-4 text-gray-800">{row.value.toFixed(3)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Progress value={row.value * 100} className="h-2 flex-1" />
                      <span className="text-xs text-gray-600 w-12 text-right">{(row.value * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Settings ────────────────────────────────────────────────────────────

function SettingsTab() {
  const [warnThreshold, setWarnThreshold] = useState('60');
  const [autoOrder, setAutoOrder] = useState(true);
  const [retrainSchedule, setRetrainSchedule] = useState('monthly');

  function handleSave() {
    toast.success('Настройки сохранены', { description: 'Изменения вступят в силу через 5 минут' });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-6">
        <h4 className="font-semibold text-gray-900">Параметры предупреждений</h4>

        {/* Warning threshold */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Порог предупреждения (% вероятности отказа)
          </label>
          <div className="flex items-center gap-3">
            <Select value={warnThreshold} onValueChange={setWarnThreshold}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['40', '50', '60', '70', '80'].map(v => (
                  <SelectItem key={v} value={v}>{v}%</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-500">— при достижении порога создаётся уведомление диспетчеру</span>
          </div>
        </div>

        {/* Auto work order */}
        <div className="flex items-center justify-between py-3 border-t border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-700">Автоматическое создание наряда ТО</p>
            <p className="text-xs text-gray-500 mt-0.5">Наряд создаётся автоматически при превышении порога вероятности</p>
          </div>
          <Switch checked={autoOrder} onCheckedChange={setAutoOrder} />
        </div>

        {/* Auto-assign */}
        <div className="flex items-center justify-between py-3 border-t border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-700">Уведомлять клиента о прогнозируемом ТО</p>
            <p className="text-xs text-gray-500 mt-0.5">Отправка SMS/Email за 7 дней до прогнозируемого отказа</p>
          </div>
          <Switch defaultChecked />
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-6">
        <h4 className="font-semibold text-gray-900">Обучение модели</h4>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Расписание переобучения</label>
          <Select value={retrainSchedule} onValueChange={setRetrainSchedule}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Еженедельно</SelectItem>
              <SelectItem value="biweekly">Раз в 2 недели</SelectItem>
              <SelectItem value="monthly">Ежемесячно</SelectItem>
              <SelectItem value="quarterly">Ежеквартально</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 flex items-start gap-2">
          <Icon name="Info" size={16} className="mt-0.5 shrink-0 text-blue-500" />
          <span>Переобучение запускается автоматически. Минимум 200 новых записей. Последнее: <strong>01.05.2026 03:00</strong>, длительность 42 мин.</span>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="border-blue-300 text-blue-700 hover:bg-blue-50"
          onClick={() => toast.info('Переобучение модели запущено вручную', { description: 'Ожидаемое время: ~40 минут' })}
        >
          <Icon name="RefreshCw" size={14} className="mr-1.5" />
          Запустить переобучение вручную
        </Button>
      </div>

      <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave}>
        <Icon name="Save" size={15} className="mr-2" />
        Сохранить настройки
      </Button>
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'forecasts', label: 'Прогнозы', icon: 'TrendingUp' },
  { id: 'models', label: 'Модели', icon: 'BrainCircuit' },
  { id: 'metrics', label: 'Метрики', icon: 'BarChart2' },
  { id: 'settings', label: 'Настройки', icon: 'Settings' },
];

const KPI_CARDS: KpiCard[] = [
  { icon: 'Monitor', label: 'Оборудования под мониторингом', value: 89, color: 'bg-blue-500' },
  { icon: 'AlertOctagon', label: 'Прогнозируемых отказов', value: 12, color: 'bg-orange-500' },
  { icon: 'ShieldCheck', label: 'Предотвращено отказов', value: 7, color: 'bg-green-500' },
  { icon: 'Banknote', label: 'Экономия (с начала года)', value: '₽1 234 000', color: 'bg-purple-500' },
];

interface KpiCard {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}

export default function PredictiveMaintenanceFull() {
  const [activeTab, setActiveTab] = useState<TabId>('forecasts');

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Icon name="BrainCircuit" size={22} className="text-purple-600" />
            Предиктивное ТО / ИИ-прогнозирование отказов
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Модель LightGBM · Точность 87% · Обновлено 01.05.2026</p>
        </div>
        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs font-medium">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 inline-block animate-pulse" />
          Мониторинг активен
        </Badge>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_CARDS.map(kpi => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Tabs */}
      <div>
        <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm w-fit mb-6">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon name={tab.icon as any} size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'forecasts' && <ForecastsTab />}
        {activeTab === 'models' && <ModelsTab />}
        {activeTab === 'metrics' && <MetricsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}
