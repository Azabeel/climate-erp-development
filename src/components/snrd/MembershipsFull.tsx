import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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

// ─── Types ───────────────────────────────────────────────────────────────────

type TabId = 'subscriptions' | 'templates' | 'analytics';
type SubscriptionStatus = 'active' | 'expiring' | 'overdue' | 'paused';
type PlanName = 'Базовый' | 'Стандарт' | 'Премиум';

interface Subscription {
  id: string;
  client: string;
  plan: PlanName;
  objects: number;
  startDate: string;
  endDate: string;
  paidUntil: string;
  monthlyAmount: number;
  status: SubscriptionStatus;
  daysUntilExpiry: number;
}

interface PlanTemplate {
  id: string;
  name: PlanName;
  visitsPerMonth: number;
  features: string[];
  pricePerMonth: number;
  color: string;
  badgeColor: string;
  iconName: string;
}

interface ChurnEntry {
  id: string;
  client: string;
  plan: PlanName;
  cancelDate: string;
  reason: string;
  lostRevenue: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-01',
    client: 'ТЦ «Галерея»',
    plan: 'Премиум',
    objects: 12,
    startDate: '01.01.2026',
    endDate: '31.12.2026',
    paidUntil: '30.06.2026',
    monthlyAmount: 16500,
    status: 'active',
    daysUntilExpiry: 229,
  },
  {
    id: 'sub-02',
    client: 'Офисный центр «Горизонт»',
    plan: 'Стандарт',
    objects: 8,
    startDate: '15.03.2026',
    endDate: '14.03.2027',
    paidUntil: '14.06.2026',
    monthlyAmount: 9200,
    status: 'active',
    daysUntilExpiry: 302,
  },
  {
    id: 'sub-03',
    client: 'Ресторан «Берег»',
    plan: 'Базовый',
    objects: 3,
    startDate: '01.02.2026',
    endDate: '31.05.2026',
    paidUntil: '31.05.2026',
    monthlyAmount: 4800,
    status: 'expiring',
    daysUntilExpiry: 15,
  },
  {
    id: 'sub-04',
    client: 'Клиника «МедКлимат»',
    plan: 'Премиум',
    objects: 6,
    startDate: '01.04.2026',
    endDate: '31.03.2027',
    paidUntil: '30.09.2026',
    monthlyAmount: 16500,
    status: 'active',
    daysUntilExpiry: 319,
  },
  {
    id: 'sub-05',
    client: 'ООО «ТехПром»',
    plan: 'Стандарт',
    objects: 5,
    startDate: '10.01.2026',
    endDate: '09.01.2027',
    paidUntil: '09.04.2026',
    monthlyAmount: 9200,
    status: 'overdue',
    daysUntilExpiry: 238,
  },
  {
    id: 'sub-06',
    client: 'Фитнес-клуб «Актив»',
    plan: 'Стандарт',
    objects: 4,
    startDate: '01.03.2026',
    endDate: '28.02.2027',
    paidUntil: '28.02.2026',
    monthlyAmount: 9200,
    status: 'overdue',
    daysUntilExpiry: 287,
  },
  {
    id: 'sub-07',
    client: 'Гостиница «Азимут»',
    plan: 'Премиум',
    objects: 24,
    startDate: '01.06.2025',
    endDate: '31.05.2026',
    paidUntil: '31.05.2026',
    monthlyAmount: 16500,
    status: 'expiring',
    daysUntilExpiry: 25,
  },
  {
    id: 'sub-08',
    client: 'Супермаркет «Фреш»',
    plan: 'Базовый',
    objects: 2,
    startDate: '15.04.2026',
    endDate: '14.04.2027',
    paidUntil: '14.07.2026',
    monthlyAmount: 4800,
    status: 'active',
    daysUntilExpiry: 333,
  },
  {
    id: 'sub-09',
    client: 'Банк «РегионИнвест»',
    plan: 'Премиум',
    objects: 10,
    startDate: '01.02.2026',
    endDate: '31.01.2027',
    paidUntil: '31.07.2026',
    monthlyAmount: 16500,
    status: 'active',
    daysUntilExpiry: 260,
  },
  {
    id: 'sub-10',
    client: 'Школа «Олимп»',
    plan: 'Базовый',
    objects: 5,
    startDate: '01.09.2025',
    endDate: '31.05.2026',
    paidUntil: '28.02.2026',
    monthlyAmount: 4800,
    status: 'overdue',
    daysUntilExpiry: 15,
  },
  {
    id: 'sub-11',
    client: 'IT-парк «Технополис»',
    plan: 'Стандарт',
    objects: 7,
    startDate: '01.05.2026',
    endDate: '30.04.2027',
    paidUntil: '31.10.2026',
    monthlyAmount: 9200,
    status: 'active',
    daysUntilExpiry: 349,
  },
  {
    id: 'sub-12',
    client: 'ТЦ «Меридиан»',
    plan: 'Стандарт',
    objects: 9,
    startDate: '15.04.2026',
    endDate: '14.05.2026',
    paidUntil: '14.05.2026',
    monthlyAmount: 9200,
    status: 'paused',
    daysUntilExpiry: 28,
  },
];

const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    id: 'plan-basic',
    name: 'Базовый',
    visitsPerMonth: 1,
    features: ['1 визит/мес', 'Замена фильтров', 'Осмотр и диагностика', 'Email-уведомления'],
    pricePerMonth: 4800,
    color: 'bg-gray-50 border-gray-200',
    badgeColor: 'bg-gray-100 text-gray-700',
    iconName: 'Shield',
  },
  {
    id: 'plan-standard',
    name: 'Стандарт',
    visitsPerMonth: 2,
    features: [
      '2 визита/мес',
      'Полная диагностика',
      'Дозаправка фреона',
      'Скидка 10% на ремонт',
      'SMS + Email уведомления',
    ],
    pricePerMonth: 9200,
    color: 'bg-blue-50 border-blue-200',
    badgeColor: 'bg-blue-100 text-blue-700',
    iconName: 'Star',
  },
  {
    id: 'plan-premium',
    name: 'Премиум',
    visitsPerMonth: 4,
    features: [
      '4 визита/мес',
      'Приоритетный SLA (4ч)',
      'Хладагент включён',
      'Скидка 20% на ремонт',
      'Выезд 24/7',
      'Персональный менеджер',
    ],
    pricePerMonth: 16500,
    color: 'bg-purple-50 border-purple-200',
    badgeColor: 'bg-purple-100 text-purple-700',
    iconName: 'Crown',
  },
];

const CHURN_DATA: ChurnEntry[] = [
  {
    id: 'ch-01',
    client: 'ООО «СтройГарант»',
    plan: 'Стандарт',
    cancelDate: '10.04.2026',
    reason: 'Переезд офиса',
    lostRevenue: 9200,
  },
  {
    id: 'ch-02',
    client: 'Кафе «Уют»',
    plan: 'Базовый',
    cancelDate: '22.04.2026',
    reason: 'Сокращение бюджета',
    lostRevenue: 4800,
  },
  {
    id: 'ch-03',
    client: 'ИП Козлов М.В.',
    plan: 'Базовый',
    cancelDate: '30.04.2026',
    reason: 'Переход к конкуренту',
    lostRevenue: 4800,
  },
];

const MRR_TREND = [
  { month: 'Июн 2025', mrr: 196000 },
  { month: 'Июл 2025', mrr: 210000 },
  { month: 'Авг 2025', mrr: 218000 },
  { month: 'Сен 2025', mrr: 225000 },
  { month: 'Окт 2025', mrr: 238000 },
  { month: 'Ноя 2025', mrr: 247000 },
  { month: 'Дек 2025', mrr: 256000 },
  { month: 'Янв 2026', mrr: 261000 },
  { month: 'Фев 2026', mrr: 265000 },
  { month: 'Мар 2026', mrr: 270000 },
  { month: 'Апр 2026', mrr: 278000 },
  { month: 'Май 2026', mrr: 284000 },
];

const MONTHLY_BREAKDOWN = [
  { month: 'Янв', new: 3, renewed: 8, cancelled: 1 },
  { month: 'Фев', new: 2, renewed: 9, cancelled: 0 },
  { month: 'Мар', new: 4, renewed: 7, cancelled: 2 },
  { month: 'Апр', new: 2, renewed: 10, cancelled: 3 },
  { month: 'Май', new: 5, renewed: 8, cancelled: 1 },
  { month: 'Июн', new: 3, renewed: 11, cancelled: 0 },
];

const PLAN_DISTRIBUTION = [
  { name: 'Базовый', value: 14, color: '#6b7280' },
  { name: 'Стандарт', value: 21, color: '#3b82f6' },
  { name: 'Премиум', value: 12, color: '#8b5cf6' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  SubscriptionStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  active: {
    label: 'Активен',
    badgeClass: 'bg-green-100 text-green-700 border-green-200',
    dotClass: 'bg-green-500',
  },
  expiring: {
    label: 'Истекает',
    badgeClass: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    dotClass: 'bg-yellow-500',
  },
  overdue: {
    label: 'Просрочен',
    badgeClass: 'bg-red-100 text-red-700 border-red-200',
    dotClass: 'bg-red-500',
  },
  paused: {
    label: 'Приостановлен',
    badgeClass: 'bg-gray-100 text-gray-600 border-gray-200',
    dotClass: 'bg-gray-400',
  },
};

const formatRub = (v: number) => v.toLocaleString('ru-RU') + ' ₽';

function isEndDateNear(sub: Subscription): boolean {
  return sub.daysUntilExpiry < 30;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  variant = 'default',
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  variant?: 'default' | 'yellow' | 'red' | 'green';
  icon: string;
}) {
  const colorMap = {
    default: 'bg-blue-50 border-blue-100 text-blue-700',
    yellow: 'bg-yellow-50 border-yellow-100 text-yellow-700',
    red: 'bg-red-50 border-red-100 text-red-700',
    green: 'bg-green-50 border-green-100 text-green-700',
  };
  const textMap = {
    default: 'text-blue-900',
    yellow: 'text-yellow-900',
    red: 'text-red-900',
    green: 'text-green-900',
  };

  return (
    <div className={`rounded-xl border p-4 ${colorMap[variant]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon name={icon} size={16} className={textMap[variant]} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${textMap[variant]}`}>{value}</p>
      {sub && <p className="text-xs mt-1 opacity-70">{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.badgeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
      {cfg.label}
    </span>
  );
}

// ─── Tab: Subscriptions ──────────────────────────────────────────────────────

function SubscriptionsTab() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<SubscriptionStatus | 'all'>('all');

  const filtered = SUBSCRIPTIONS.filter((s) => {
    const matchSearch = s.client.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleRenew = (sub: Subscription) => {
    toast.success(`Абонемент «${sub.client}» отправлен на продление`);
  };

  const handlePause = (sub: Subscription) => {
    toast.info(`Абонемент «${sub.client}» приостановлен`);
  };

  const handleHistory = (sub: Subscription) => {
    toast.info(`История нарядов: ${sub.client}`);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Icon
            name="Search"
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="Поиск по клиенту..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'expiring', 'overdue', 'paused'] as const).map((s) => {
            const labels: Record<typeof s, string> = {
              all: 'Все',
              active: 'Активные',
              expiring: 'Истекают',
              overdue: 'Просрочены',
              paused: 'Приостановлены',
            };
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterStatus === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {labels[s]}
              </button>
            );
          })}
        </div>
        <Button
          size="sm"
          onClick={() => toast.success('Открыта форма нового абонемента')}
        >
          <Icon name="Plus" size={14} className="mr-1" />
          Новый абонемент
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Клиент</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Тариф</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Объектов</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Начало</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Окончание</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Оплачено до</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">₽/мес</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Статус</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{sub.client}</td>
                <td className="px-4 py-3">
                  <PlanBadge plan={sub.plan} />
                </td>
                <td className="px-4 py-3 text-center text-gray-600">{sub.objects}</td>
                <td className="px-4 py-3 text-gray-600">{sub.startDate}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      isEndDateNear(sub)
                        ? 'text-red-600 font-semibold'
                        : 'text-gray-600'
                    }
                  >
                    {sub.endDate}
                    {isEndDateNear(sub) && (
                      <span className="ml-1 text-xs">({sub.daysUntilExpiry}д)</span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{sub.paidUntil}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800">
                  {formatRub(sub.monthlyAmount)}
                </td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge status={sub.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      title="Продлить"
                      onClick={() => handleRenew(sub)}
                      className="p-1.5 rounded-md text-green-600 hover:bg-green-50 transition-colors"
                    >
                      <Icon name="RefreshCw" size={14} />
                    </button>
                    <button
                      title="Приостановить"
                      onClick={() => handlePause(sub)}
                      className="p-1.5 rounded-md text-yellow-600 hover:bg-yellow-50 transition-colors"
                    >
                      <Icon name="PauseCircle" size={14} />
                    </button>
                    <button
                      title="История нарядов"
                      onClick={() => handleHistory(sub)}
                      className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Icon name="ClipboardList" size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Icon name="SearchX" size={32} className="mx-auto mb-2 opacity-40" />
            <p>Абонементы не найдены</p>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 text-right">
        Показано {filtered.length} из {SUBSCRIPTIONS.length} абонементов
      </p>
    </div>
  );
}

function PlanBadge({ plan }: { plan: PlanName }) {
  const cfg: Record<PlanName, { cls: string; icon: string }> = {
    Базовый: { cls: 'bg-gray-100 text-gray-700', icon: 'Shield' },
    Стандарт: { cls: 'bg-blue-100 text-blue-700', icon: 'Star' },
    Премиум: { cls: 'bg-purple-100 text-purple-700', icon: 'Crown' },
  };
  const { cls, icon } = cfg[plan];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${cls}`}
    >
      <Icon name={icon} size={11} />
      {plan}
    </span>
  );
}

// ─── Tab: Templates ──────────────────────────────────────────────────────────

function TemplatesTab() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrices, setEditPrices] = useState<Record<string, number>>(
    Object.fromEntries(PLAN_TEMPLATES.map((p) => [p.id, p.pricePerMonth]))
  );

  const handleSave = (plan: PlanTemplate) => {
    toast.success(`Тариф «${plan.name}» сохранён — ${formatRub(editPrices[plan.id])}/мес`);
    setEditingId(null);
  };

  const handleAssign = (plan: PlanTemplate) => {
    toast.success(`Выберите клиента для тарифа «${plan.name}»`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {PLAN_TEMPLATES.map((plan) => {
        const isEditing = editingId === plan.id;
        return (
          <div
            key={plan.id}
            className={`rounded-xl border-2 p-6 flex flex-col gap-4 ${plan.color}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name={plan.iconName} size={20} className="text-gray-700" />
                <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${plan.badgeColor}`}
              >
                {plan.visitsPerMonth} визит/мес
              </span>
            </div>

            {/* Price */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Стоимость в месяц</p>
              {isEditing ? (
                <Input
                  type="number"
                  value={editPrices[plan.id]}
                  onChange={(e) =>
                    setEditPrices((prev) => ({
                      ...prev,
                      [plan.id]: Number(e.target.value),
                    }))
                  }
                  className="text-lg font-bold"
                />
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {formatRub(editPrices[plan.id])}
                </p>
              )}
            </div>

            {/* Features */}
            <ul className="space-y-2 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                  <Icon name="Check" size={14} className="text-green-600 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-gray-200/60">
              {isEditing ? (
                <>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSave(plan)}
                  >
                    <Icon name="Save" size={13} className="mr-1" />
                    Сохранить
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingId(null)}
                  >
                    Отмена
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setEditingId(plan.id)}
                  >
                    <Icon name="Pencil" size={13} className="mr-1" />
                    Редактировать
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleAssign(plan)}
                  >
                    <Icon name="UserPlus" size={13} className="mr-1" />
                    Назначить
                  </Button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Tab: Analytics ──────────────────────────────────────────────────────────

function AnalyticsTab() {
  return (
    <div className="space-y-6">
      {/* Row 1: MRR trend + Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MRR Area Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Icon name="TrendingUp" size={16} className="text-blue-600" />
            MRR за 12 месяцев
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MRR_TREND} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                interval={2}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(v: number) => [formatRub(v), 'MRR']}
                labelStyle={{ fontSize: 11 }}
              />
              <Area
                type="monotone"
                dataKey="mrr"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#mrrGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly new/renewed/cancelled */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Icon name="BarChart2" size={16} className="text-purple-600" />
            Динамика абонементов
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={MONTHLY_BREAKDOWN}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip labelStyle={{ fontSize: 11 }} />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                formatter={(value) =>
                  value === 'new'
                    ? 'Новые'
                    : value === 'renewed'
                    ? 'Продлённые'
                    : 'Отменённые'
                }
              />
              <Bar dataKey="new" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
              <Bar dataKey="renewed" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
              <Bar
                dataKey="cancelled"
                stackId="a"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Pie + Churn table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Distribution Pie */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Icon name="PieChart" size={16} className="text-indigo-600" />
            Распределение по тарифам
          </h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="60%" height={200}>
              <PieChart>
                <Pie
                  data={PLAN_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {PLAN_DISTRIBUTION.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => [`${v} абон.`, '']}
                  labelStyle={{ fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3 flex-1">
              {PLAN_DISTRIBUTION.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{entry.name}</p>
                    <p className="text-xs text-gray-500">
                      {entry.value} абон. (
                      {Math.round(
                        (entry.value /
                          PLAN_DISTRIBUTION.reduce((s, e) => s + e.value, 0)) *
                          100
                      )}
                      %)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Churn table */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Icon name="UserMinus" size={16} className="text-red-500" />
            Отменённые абонементы (Churn)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 font-semibold text-gray-500 text-xs">Клиент</th>
                  <th className="text-left py-2 font-semibold text-gray-500 text-xs">Тариф</th>
                  <th className="text-left py-2 font-semibold text-gray-500 text-xs">Дата</th>
                  <th className="text-left py-2 font-semibold text-gray-500 text-xs">Причина</th>
                  <th className="text-right py-2 font-semibold text-gray-500 text-xs">Потеря</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {CHURN_DATA.map((entry) => (
                  <tr key={entry.id} className="hover:bg-red-50/30 transition-colors">
                    <td className="py-2.5 font-medium text-gray-800 text-xs">
                      {entry.client}
                    </td>
                    <td className="py-2.5">
                      <PlanBadge plan={entry.plan} />
                    </td>
                    <td className="py-2.5 text-gray-500 text-xs">{entry.cancelDate}</td>
                    <td className="py-2.5 text-gray-600 text-xs">{entry.reason}</td>
                    <td className="py-2.5 text-right text-red-600 font-semibold text-xs">
                      −{formatRub(entry.lostRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200">
                  <td colSpan={4} className="py-2.5 text-xs font-semibold text-gray-600">
                    Итого потерь
                  </td>
                  <td className="py-2.5 text-right text-red-700 font-bold text-sm">
                    −{formatRub(CHURN_DATA.reduce((s, e) => s + e.lostRevenue, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
            <p className="text-xs text-red-700 font-medium flex items-center gap-1">
              <Icon name="AlertCircle" size={12} />
              Churn rate этого месяца: 6,0% — выше нормы (≤3%). Рекомендуется win-back кампания.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'subscriptions', label: 'Абонементы', icon: 'FileText' },
  { id: 'templates', label: 'Шаблоны тарифов', icon: 'LayoutTemplate' },
  { id: 'analytics', label: 'Аналитика', icon: 'BarChart2' },
];

function MembershipsFull() {
  const [activeTab, setActiveTab] = useState<TabId>('subscriptions');

  const activeCount = SUBSCRIPTIONS.filter((s) => s.status === 'active').length;
  const expiringCount = SUBSCRIPTIONS.filter((s) => s.status === 'expiring').length;
  const overdueCount = SUBSCRIPTIONS.filter((s) => s.status === 'overdue').length;
  const mrr = 284000;
  const avgCheck = Math.round(mrr / activeCount);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Абонементы</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Управление подписками на сервисное обслуживание
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Экспорт в Excel...')}
          >
            <Icon name="Download" size={14} className="mr-1" />
            Экспорт
          </Button>
          <Button size="sm" onClick={() => toast.success('Открыта форма нового абонемента')}>
            <Icon name="Plus" size={14} className="mr-1" />
            Новый абонемент
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard
          label="Активных абонементов"
          value={String(activeCount)}
          sub="из 47 итого"
          variant="default"
          icon="Users"
        />
        <MetricCard
          label="Выручка MRR"
          value={formatRub(mrr)}
          sub="+8% к прошлому месяцу"
          variant="green"
          icon="TrendingUp"
        />
        <MetricCard
          label="Истекает в этом месяце"
          value={String(expiringCount)}
          sub="требуют продления"
          variant="yellow"
          icon="Clock"
        />
        <MetricCard
          label="Просрочено"
          value={String(overdueCount)}
          sub="требуют оплаты"
          variant="red"
          icon="AlertCircle"
        />
        <MetricCard
          label="Средний чек"
          value={formatRub(avgCheck)}
          sub="в месяц на абонемент"
          variant="default"
          icon="CreditCard"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-gray-200 bg-gray-50/50">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
              }`}
            >
              <Icon name={tab.icon} size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-5">
          {activeTab === 'subscriptions' && <SubscriptionsTab />}
          {activeTab === 'templates' && <TemplatesTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
        </div>
      </div>
    </div>
  );
}

export default MembershipsFull;
