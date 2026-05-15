import { useState, useMemo } from 'react';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type ClientType = 'Юр. лицо' | 'Физ. лицо';
type Trend = 'up' | 'down' | 'stable';
type Segment = 'VIP' | 'Стандарт' | 'Разовые' | 'Потерянные';

interface CustomerRecord {
  id: string;
  name: string;
  type: ClientType;
  manager: string;
  revenueYear: number;
  ordersCount: number;
  nps: number;
  score: number;
  trend: Trend;
  segment: Segment;
  metrics: {
    orderFrequency: number;
    paymentPunctuality: number;
    npsMetric: number;
    orderDuration: number;
    volume: number;
    activity: number;
  };
  aiRecommendations: string[];
}

// ─────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────

const CUSTOMERS: CustomerRecord[] = [
  {
    id: 'c01',
    name: 'ООО «АрктикКлимат»',
    type: 'Юр. лицо',
    manager: 'Петров А.С.',
    revenueYear: 1_240_000,
    ordersCount: 48,
    nps: 9,
    score: 91,
    trend: 'up',
    segment: 'VIP',
    metrics: { orderFrequency: 95, paymentPunctuality: 98, npsMetric: 90, orderDuration: 88, volume: 92, activity: 94 },
    aiRecommendations: [
      'Предложить расширенный договор сервисного обслуживания на 2 года.',
      'Назначить персонального менеджера для корпоративных запросов.',
      'Включить в программу приоритетного реагирования (SLA 2ч).',
    ],
  },
  {
    id: 'c02',
    name: 'ТЦ «Галактика»',
    type: 'Юр. лицо',
    manager: 'Иванова М.О.',
    revenueYear: 876_500,
    ordersCount: 31,
    nps: 8,
    score: 82,
    trend: 'up',
    segment: 'VIP',
    metrics: { orderFrequency: 80, paymentPunctuality: 90, npsMetric: 80, orderDuration: 75, volume: 85, activity: 82 },
    aiRecommendations: [
      'Предложить плановое ТО кондиционеров перед летним сезоном.',
      'Рассмотреть апсейл: мониторинг хладагентов R-410A.',
      'Уточнить удовлетворённость после последнего крупного ремонта.',
    ],
  },
  {
    id: 'c03',
    name: 'ООО «СтройТех Групп»',
    type: 'Юр. лицо',
    manager: 'Петров А.С.',
    revenueYear: 654_200,
    ordersCount: 22,
    nps: 7,
    score: 75,
    trend: 'stable',
    segment: 'Стандарт',
    metrics: { orderFrequency: 70, paymentPunctuality: 82, npsMetric: 70, orderDuration: 78, volume: 72, activity: 76 },
    aiRecommendations: [
      'Провести опрос качества: NPS не растёт третий квартал.',
      'Предложить систему мониторинга IoT для объектов.',
      'Запланировать встречу с ЛПР для обсуждения потребностей.',
    ],
  },
  {
    id: 'c04',
    name: 'Медицинский центр «Здоровье»',
    type: 'Юр. лицо',
    manager: 'Сидорова Е.В.',
    revenueYear: 520_000,
    ordersCount: 41,
    nps: 9,
    score: 88,
    trend: 'up',
    segment: 'VIP',
    metrics: { orderFrequency: 90, paymentPunctuality: 95, npsMetric: 90, orderDuration: 85, volume: 82, activity: 88 },
    aiRecommendations: [
      'Предложить договор с гарантированным SLA 4ч для медучреждения.',
      'Включить в пилот предиктивного обслуживания.',
      'Сформировать КП на обслуживание нового корпуса.',
    ],
  },
  {
    id: 'c05',
    name: 'ИП Морозов Д.В.',
    type: 'Физ. лицо',
    manager: 'Иванова М.О.',
    revenueYear: 98_400,
    ordersCount: 7,
    nps: 8,
    score: 79,
    trend: 'stable',
    segment: 'Стандарт',
    metrics: { orderFrequency: 65, paymentPunctuality: 88, npsMetric: 80, orderDuration: 92, volume: 60, activity: 70 },
    aiRecommendations: [
      'Напомнить о сезонном ТО (июнь).',
      'Предложить абонемент на 2 обслуживания в год.',
      'Запросить отзыв для платформы.',
    ],
  },
  {
    id: 'c06',
    name: 'ООО «Ресторанный Холдинг»',
    type: 'Юр. лицо',
    manager: 'Кузнецов Р.П.',
    revenueYear: 432_800,
    ordersCount: 19,
    nps: 6,
    score: 61,
    trend: 'down',
    segment: 'Стандарт',
    metrics: { orderFrequency: 55, paymentPunctuality: 65, npsMetric: 60, orderDuration: 70, volume: 58, activity: 62 },
    aiRecommendations: [
      'Выяснить причину снижения NPS: провести звонок с менеджером.',
      'Проверить наличие просроченных платежей (>30 дней).',
      'Предложить реструктуризацию долга и новый договор.',
    ],
  },
  {
    id: 'c07',
    name: 'Логистический центр «Восток»',
    type: 'Юр. лицо',
    manager: 'Петров А.С.',
    revenueYear: 387_600,
    ordersCount: 14,
    nps: 5,
    score: 54,
    trend: 'down',
    segment: 'Стандарт',
    metrics: { orderFrequency: 50, paymentPunctuality: 58, npsMetric: 50, orderDuration: 65, volume: 55, activity: 48 },
    aiRecommendations: [
      'Критическая ситуация: назначить встречу с руководством.',
      'Разобрать все открытые претензии по последним нарядам.',
      'Подготовить план восстановления отношений.',
    ],
  },
  {
    id: 'c08',
    name: 'Кузнецова Ирина Игоревна',
    type: 'Физ. лицо',
    manager: 'Иванова М.О.',
    revenueYear: 54_000,
    ordersCount: 4,
    nps: 7,
    score: 68,
    trend: 'stable',
    segment: 'Стандарт',
    metrics: { orderFrequency: 55, paymentPunctuality: 78, npsMetric: 70, orderDuration: 80, volume: 50, activity: 65 },
    aiRecommendations: [
      'Предложить сезонное ТО в мае-июне.',
      'Напомнить о гарантии на установленный блок.',
      'Отправить спецпредложение на чистку фильтров.',
    ],
  },
  {
    id: 'c09',
    name: 'АО «ТехноПарк»',
    type: 'Юр. лицо',
    manager: 'Сидорова Е.В.',
    revenueYear: 1_050_000,
    ordersCount: 55,
    nps: 9,
    score: 94,
    trend: 'up',
    segment: 'VIP',
    metrics: { orderFrequency: 98, paymentPunctuality: 99, npsMetric: 90, orderDuration: 90, volume: 95, activity: 97 },
    aiRecommendations: [
      'Ключевой клиент: рассмотреть персональную программу лояльности.',
      'Предложить расширение договора на дополнительные объекты.',
      'Пригласить на закрытую презентацию новых услуг.',
    ],
  },
  {
    id: 'c10',
    name: 'ООО «Балтийский Берег»',
    type: 'Юр. лицо',
    manager: 'Кузнецов Р.П.',
    revenueYear: 210_000,
    ordersCount: 9,
    nps: 4,
    score: 38,
    trend: 'down',
    segment: 'Потерянные',
    metrics: { orderFrequency: 30, paymentPunctuality: 42, npsMetric: 40, orderDuration: 50, volume: 35, activity: 28 },
    aiRecommendations: [
      'Риск потери: последний наряд 4 месяца назад.',
      'Отправить win-back офер со скидкой 15%.',
      'Срочно связаться с ЛПР — высокий риск оттока.',
    ],
  },
  {
    id: 'c11',
    name: 'Гостиница «Северная»',
    type: 'Юр. лицо',
    manager: 'Иванова М.О.',
    revenueYear: 763_000,
    ordersCount: 37,
    nps: 8,
    score: 83,
    trend: 'up',
    segment: 'VIP',
    metrics: { orderFrequency: 85, paymentPunctuality: 88, npsMetric: 80, orderDuration: 82, volume: 84, activity: 80 },
    aiRecommendations: [
      'Предложить модернизацию системы вентиляции перед сезоном.',
      'Включить в рассылку о новых инструментах диагностики.',
      'Запросить рекомендательное письмо для портфолио.',
    ],
  },
  {
    id: 'c12',
    name: 'Климов Василий Петрович',
    type: 'Физ. лицо',
    manager: 'Петров А.С.',
    revenueYear: 32_500,
    ordersCount: 2,
    nps: 3,
    score: 27,
    trend: 'down',
    segment: 'Потерянные',
    metrics: { orderFrequency: 20, paymentPunctuality: 30, npsMetric: 30, orderDuration: 40, volume: 25, activity: 18 },
    aiRecommendations: [
      'Очень низкий score: выяснить наличие жалоб.',
      'Предложить бесплатную диагностику для возврата.',
      'Передать в работу специалисту по удержанию клиентов.',
    ],
  },
  {
    id: 'c13',
    name: 'ООО «МегаСтрой»',
    type: 'Юр. лицо',
    manager: 'Кузнецов Р.П.',
    revenueYear: 590_000,
    ordersCount: 24,
    nps: 7,
    score: 71,
    trend: 'stable',
    segment: 'Стандарт',
    metrics: { orderFrequency: 68, paymentPunctuality: 75, npsMetric: 70, orderDuration: 73, volume: 70, activity: 72 },
    aiRecommendations: [
      'Стабильный клиент: найти точки роста через расширение услуг.',
      'Предложить внедрение системы мониторинга на объектах.',
      'Провести ревью договора — возможна оптимизация условий.',
    ],
  },
  {
    id: 'c14',
    name: 'Новикова Светлана Юрьевна',
    type: 'Физ. лицо',
    manager: 'Сидорова Е.В.',
    revenueYear: 47_200,
    ordersCount: 3,
    nps: 9,
    score: 76,
    trend: 'up',
    segment: 'Стандарт',
    metrics: { orderFrequency: 60, paymentPunctuality: 92, npsMetric: 90, orderDuration: 85, volume: 55, activity: 72 },
    aiRecommendations: [
      'Высокий NPS: попросить оставить отзыв на площадках.',
      'Предложить программу лояльности для частных клиентов.',
      'Напомнить о плановом сервисе в летний период.',
    ],
  },
  {
    id: 'c15',
    name: 'ПАО «Энергосеть»',
    type: 'Юр. лицо',
    manager: 'Петров А.С.',
    revenueYear: 1_820_000,
    ordersCount: 72,
    nps: 8,
    score: 86,
    trend: 'stable',
    segment: 'VIP',
    metrics: { orderFrequency: 92, paymentPunctuality: 87, npsMetric: 80, orderDuration: 83, volume: 90, activity: 88 },
    aiRecommendations: [
      'Крупнейший клиент: закрепить аккаунт-менеджера.',
      'Подготовить годовой отчёт по всем обслуживаемым объектам.',
      'Предложить долгосрочный контракт на 3 года со скидкой.',
    ],
  },
];

// ─────────────────────────────────────────────
// Analytics helpers
// ─────────────────────────────────────────────

const SCORE_HISTORY = [
  { month: 'Июн', score: 68.2 },
  { month: 'Июл', score: 69.8 },
  { month: 'Авг', score: 70.1 },
  { month: 'Сен', score: 71.4 },
  { month: 'Окт', score: 70.9 },
  { month: 'Ноя', score: 71.8 },
  { month: 'Дек', score: 72.3 },
  { month: 'Янв', score: 72.0 },
  { month: 'Фев', score: 72.9 },
  { month: 'Мар', score: 73.1 },
  { month: 'Апр', score: 73.4 },
  { month: 'Май', score: 73.4 },
];

const SCORE_DISTRIBUTION = [
  { range: '0–20', count: 2 },
  { range: '20–40', count: 3 },
  { range: '40–60', count: 5 },
  { range: '60–80', count: 7 },
  { range: '80–100', count: 9 },
];

const SEGMENT_DATA = [
  { name: 'VIP', value: 6 },
  { name: 'Стандарт', value: 7 },
  { name: 'Разовые', value: 0 },
  { name: 'Потерянные', value: 2 },
];

const SEGMENT_COLORS: Record<string, string> = {
  VIP: '#6366f1',
  Стандарт: '#22c55e',
  Разовые: '#f59e0b',
  Потерянные: '#ef4444',
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function scoreColor(score: number): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (score > 70) return 'default';
  if (score >= 40) return 'secondary';
  return 'destructive';
}

function scoreTextColor(score: number): string {
  if (score > 70) return 'text-green-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-600';
}

function scoreBgColor(score: number): string {
  if (score > 70) return 'bg-green-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount);
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

interface MetricBarProps {
  label: string;
  value: number;
}

function MetricBar({ label, value }: MetricBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className={`font-medium ${scoreTextColor(value)}`}>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${scoreBgColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

interface DetailPanelProps {
  customer: CustomerRecord;
  onClose: () => void;
}

function DetailPanel({ customer, onClose }: DetailPanelProps) {
  return (
    <div className="w-80 shrink-0 border-l border-gray-200 bg-white flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-gray-100">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{customer.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{customer.type} · {customer.segment}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
          aria-label="Закрыть"
        >
          <Icon name="X" size={16} />
        </button>
      </div>

      {/* Score badge */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl text-white ${scoreBgColor(customer.score)}`}
        >
          {customer.score}
        </div>
        <div>
          <p className="text-xs text-gray-500">Health Score</p>
          <div className="flex items-center gap-1 mt-0.5">
            {customer.trend === 'up' && <Icon name="TrendingUp" size={14} className="text-green-500" />}
            {customer.trend === 'down' && <Icon name="TrendingDown" size={14} className="text-red-500" />}
            {customer.trend === 'stable' && <Icon name="Minus" size={14} className="text-gray-400" />}
            <span className="text-xs text-gray-500">
              {customer.trend === 'up' ? 'Растёт' : customer.trend === 'down' ? 'Падает' : 'Стабильно'}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="px-4 py-3 border-b border-gray-100 space-y-3">
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Метрики</p>
        <MetricBar label="Частота нарядов" value={customer.metrics.orderFrequency} />
        <MetricBar label="Своевременность оплат" value={customer.metrics.paymentPunctuality} />
        <MetricBar label="NPS" value={customer.metrics.npsMetric} />
        <MetricBar label="Длительность нарядов" value={customer.metrics.orderDuration} />
        <MetricBar label="Объём заказов" value={customer.metrics.volume} />
        <MetricBar label="Активность" value={customer.metrics.activity} />
      </div>

      {/* AI Recommendations */}
      <div className="px-4 py-3 border-b border-gray-100 space-y-2">
        <div className="flex items-center gap-1.5">
          <Icon name="Sparkles" size={14} className="text-indigo-500" />
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Рекомендации ИИ</p>
        </div>
        <ul className="space-y-2">
          {customer.aiRecommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
              <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                {i + 1}
              </span>
              {rec}
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 space-y-2">
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Действия</p>
        <div className="flex flex-col gap-2">
          <Button size="sm" variant="outline" className="justify-start gap-2 text-xs">
            <Icon name="Phone" size={14} />
            Позвонить
          </Button>
          <Button size="sm" variant="outline" className="justify-start gap-2 text-xs">
            <Icon name="CheckSquare" size={14} />
            Создать задачу
          </Button>
          <Button size="sm" variant="default" className="justify-start gap-2 text-xs">
            <Icon name="Wrench" size={14} />
            Предложить ТО
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export default function CustomerHealth() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterSegment, setFilterSegment] = useState<string>('all');
  const [filterManager, setFilterManager] = useState<string>('all');
  const [filterTrend, setFilterTrend] = useState<string>('all');

  const managers = useMemo(() => {
    const set = new Set(CUSTOMERS.map((c) => c.manager));
    return Array.from(set).sort();
  }, []);

  const filtered = useMemo(() => {
    return CUSTOMERS.filter((c) => {
      if (filterSegment !== 'all' && c.segment !== filterSegment) return false;
      if (filterManager !== 'all' && c.manager !== filterManager) return false;
      if (filterTrend !== 'all' && c.trend !== filterTrend) return false;
      return true;
    });
  }, [filterSegment, filterManager, filterTrend]);

  const selectedCustomer = selectedId ? CUSTOMERS.find((c) => c.id === selectedId) ?? null : null;

  const healthy = CUSTOMERS.filter((c) => c.score > 70).length;
  const attention = CUSTOMERS.filter((c) => c.score >= 40 && c.score <= 70).length;
  const risk = CUSTOMERS.filter((c) => c.score < 40).length;
  const avgScore = (CUSTOMERS.reduce((s, c) => s + c.score, 0) / CUSTOMERS.length).toFixed(1);
  const total = CUSTOMERS.length;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Здоровье клиентской базы</h1>
            <p className="text-sm text-gray-500 mt-0.5">Мониторинг и аналитика по {total} клиентам</p>
          </div>
          <Button size="sm" variant="outline" className="gap-2 text-xs">
            <Icon name="Download" size={14} />
            Экспорт
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Icon name="Filter" size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500">Фильтры:</span>
          </div>

          <select
            className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={filterSegment}
            onChange={(e) => setFilterSegment(e.target.value)}
          >
            <option value="all">Все сегменты</option>
            <option value="VIP">VIP</option>
            <option value="Стандарт">Стандарт</option>
            <option value="Разовые">Разовые</option>
            <option value="Потерянные">Потерянные</option>
          </select>

          <select
            className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={filterManager}
            onChange={(e) => setFilterManager(e.target.value)}
          >
            <option value="all">Все менеджеры</option>
            {managers.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={filterTrend}
            onChange={(e) => setFilterTrend(e.target.value)}
          >
            <option value="all">Любой тренд</option>
            <option value="up">Растёт</option>
            <option value="down">Падает</option>
            <option value="stable">Стабильно</option>
          </select>

          {(filterSegment !== 'all' || filterManager !== 'all' || filterTrend !== 'all') && (
            <button
              className="text-xs text-indigo-600 hover:text-indigo-800 underline"
              onClick={() => { setFilterSegment('all'); setFilterManager('all'); setFilterTrend('all'); }}
            >
              Сбросить
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <Icon name="Heart" size={16} className="text-green-600" />
                </div>
                <span className="text-xs text-gray-500">Здоровых</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{healthy}</p>
              <p className="text-xs text-green-600 mt-0.5">{Math.round((healthy / total) * 100)}% базы · score &gt; 70</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Icon name="AlertTriangle" size={16} className="text-yellow-600" />
                </div>
                <span className="text-xs text-gray-500">Внимание</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{attention}</p>
              <p className="text-xs text-yellow-600 mt-0.5">{Math.round((attention / total) * 100)}% базы · score 40–70</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <Icon name="AlertCircle" size={16} className="text-red-600" />
                </div>
                <span className="text-xs text-gray-500">Зона риска</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{risk}</p>
              <p className="text-xs text-red-600 mt-0.5">{Math.round((risk / total) * 100)}% базы · score &lt; 40</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Icon name="Activity" size={16} className="text-indigo-600" />
                </div>
                <span className="text-xs text-gray-500">Среднее здоровье</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{avgScore}</p>
              <p className="text-xs text-indigo-600 mt-0.5">По всей базе клиентов</p>
            </div>
          </div>

          {/* Client table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">Клиенты</h2>
              <span className="text-xs text-gray-400">{filtered.length} из {total}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Клиент</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Тип</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Менеджер</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-500">Выручка</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-500">Нарядов</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-500">NPS</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500 min-w-[140px]">Score</th>
                    <th className="text-center px-4 py-2.5 font-medium text-gray-500">Тренд</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedId(selectedId === c.id ? null : c.id)}
                      className={`border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedId === c.id ? 'bg-indigo-50 hover:bg-indigo-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900 line-clamp-1">{c.name}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {c.type === 'Юр. лицо'
                          ? <Badge variant="outline" className="text-[10px] px-1.5 py-0">Юр</Badge>
                          : <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Физ</Badge>}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.manager}</td>
                      <td className="px-4 py-3 text-right text-gray-700 whitespace-nowrap">{formatMoney(c.revenueYear)}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{c.ordersCount}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{c.nps}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={scoreColor(c.score)}
                            className="text-[10px] px-1.5 py-0 min-w-[32px] justify-center"
                          >
                            {c.score}
                          </Badge>
                          <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden min-w-[60px]">
                            <div
                              className={`h-full rounded-full ${scoreBgColor(c.score)}`}
                              style={{ width: `${c.score}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {c.trend === 'up' && <Icon name="TrendingUp" size={14} className="text-green-500 inline" />}
                        {c.trend === 'down' && <Icon name="TrendingDown" size={14} className="text-red-500 inline" />}
                        {c.trend === 'stable' && <Icon name="Minus" size={14} className="text-gray-400 inline" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Analytics row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Line chart */}
            <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-800 mb-3">Динамика score (12 мес.)</h2>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={SCORE_HISTORY} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis domain={[60, 80]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    formatter={(v: number) => [v.toFixed(1), 'Avg score']}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#6366f1' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Bar chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-800 mb-3">Распределение по score</h2>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={SCORE_DISTRIBUTION} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="range" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    formatter={(v: number) => [v, 'Клиентов']}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {SCORE_DISTRIBUTION.map((_entry, index) => {
                      const colors = ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#6366f1'];
                      return <Cell key={`cell-${index}`} fill={colors[index]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-800 mb-3">Сегменты клиентов</h2>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={SEGMENT_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {SEGMENT_DATA.map((entry) => (
                      <Cell key={entry.name} fill={SEGMENT_COLORS[entry.name] ?? '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    formatter={(v: number, name: string) => [v, name]}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span style={{ fontSize: 11 }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detail panel */}
        {selectedCustomer && (
          <DetailPanel customer={selectedCustomer} onClose={() => setSelectedId(null)} />
        )}
      </div>
    </div>
  );
}
