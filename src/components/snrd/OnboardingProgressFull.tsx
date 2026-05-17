import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type ItemStatus = 'completed' | 'in_progress' | 'pending';
type PhaseStatus = 'completed' | 'in_progress' | 'waiting';

interface ChecklistItem {
  id: string;
  title: string;
  status: ItemStatus;
  detail?: string; // e.g. "34/50 позиций"
}

interface Phase {
  id: string;
  title: string;
  status: PhaseStatus;
  progress: number; // 0-100
  items: ChecklistItem[];
}

interface Recommendation {
  id: string;
  priority: number;
  title: string;
  description: string;
  icon: string;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const PHASES: Phase[] = [
  {
    id: 'phase-1',
    title: 'Фаза 1 — Базовая настройка',
    status: 'completed',
    progress: 100,
    items: [
      { id: 'p1-1', title: 'Создать аккаунт и выбрать тариф', status: 'completed' },
      { id: 'p1-2', title: 'Заполнить реквизиты компании', status: 'completed' },
      { id: 'p1-3', title: 'Настроить рабочие часы и территории', status: 'completed' },
      { id: 'p1-4', title: 'Добавить первых пользователей', status: 'completed' },
    ],
  },
  {
    id: 'phase-2',
    title: 'Фаза 2 — Справочники',
    status: 'in_progress',
    progress: 60,
    items: [
      { id: 'p2-1', title: 'Импортировать клиентов', status: 'completed' },
      { id: 'p2-2', title: 'Добавить объекты обслуживания', status: 'completed' },
      {
        id: 'p2-3',
        title: 'Настроить виды работ',
        status: 'in_progress',
        detail: '34/50 позиций',
      },
      { id: 'p2-4', title: 'Создать шаблоны договоров', status: 'pending' },
      { id: 'p2-5', title: 'Настроить прайс-лист', status: 'pending' },
    ],
  },
  {
    id: 'phase-3',
    title: 'Фаза 3 — Процессы',
    status: 'waiting',
    progress: 0,
    items: [
      { id: 'p3-1', title: 'Настроить SLA политики', status: 'pending' },
      { id: 'p3-2', title: 'Подключить уведомления', status: 'pending' },
      { id: 'p3-3', title: 'Настроить рабочие группы', status: 'pending' },
      { id: 'p3-4', title: 'Тестовый наряд', status: 'pending' },
    ],
  },
  {
    id: 'phase-4',
    title: 'Фаза 4 — Интеграции',
    status: 'waiting',
    progress: 0,
    items: [
      { id: 'p4-1', title: 'Подключить Telegram', status: 'pending' },
      { id: 'p4-2', title: 'Настроить 1С', status: 'pending' },
      { id: 'p4-3', title: 'Мобильное приложение для инженеров', status: 'pending' },
    ],
  },
];

const RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec-1',
    priority: 1,
    title: 'Завершить настройку видов работ',
    description: 'Добавьте оставшиеся 16 позиций в каталог услуг для корректного ценообразования',
    icon: 'Wrench',
  },
  {
    id: 'rec-2',
    priority: 2,
    title: 'Создать шаблоны договоров',
    description: 'Настройте стандартные договоры для физических и юридических лиц',
    icon: 'FileText',
  },
  {
    id: 'rec-3',
    priority: 3,
    title: 'Настроить прайс-лист',
    description: 'Укажите стоимость услуг и материалов для автоматического расчёта нарядов',
    icon: 'Tag',
  },
  {
    id: 'rec-4',
    priority: 4,
    title: 'Настроить SLA политики',
    description: 'Определите нормативы реагирования для разных категорий клиентов',
    icon: 'Shield',
  },
  {
    id: 'rec-5',
    priority: 5,
    title: 'Подключить Telegram-бота',
    description: 'Автоматические уведомления клиентам повысят NPS и снизят нагрузку на диспетчера',
    icon: 'MessageCircle',
  },
];

const CHART_DATA = PHASES.map((p) => ({
  name: p.title.replace('Фаза ', 'Ф').split(' — ')[0],
  fullName: p.title,
  percent: p.progress,
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ITEM_CFG: Record<
  ItemStatus,
  { icon: string; iconCls: string; textCls: string; rowCls: string }
> = {
  completed: {
    icon: 'CheckCircle2',
    iconCls: 'text-green-500',
    textCls: 'line-through text-gray-400',
    rowCls: 'bg-green-50 border-green-200',
  },
  in_progress: {
    icon: 'Loader2',
    iconCls: 'text-blue-500',
    textCls: 'text-gray-900',
    rowCls: 'bg-blue-50 border-blue-200',
  },
  pending: {
    icon: 'Circle',
    iconCls: 'text-gray-300',
    textCls: 'text-gray-700',
    rowCls: 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50',
  },
};

const PHASE_STATUS_CFG: Record<
  PhaseStatus,
  { label: string; badgeCls: string; headerCls: string; icon: string; iconCls: string }
> = {
  completed: {
    label: '✅ Завершена',
    badgeCls: 'bg-green-100 text-green-700 border-green-200',
    headerCls: 'bg-green-50 border-green-200',
    icon: 'CheckCircle2',
    iconCls: 'text-green-500',
  },
  in_progress: {
    label: '🔄 В процессе',
    badgeCls: 'bg-blue-100 text-blue-700 border-blue-200',
    headerCls: 'bg-blue-50 border-blue-200',
    icon: 'Loader2',
    iconCls: 'text-blue-500',
  },
  waiting: {
    label: '⏳ Ожидает',
    badgeCls: 'bg-gray-100 text-gray-500 border-gray-200',
    headerCls: 'bg-gray-50 border-gray-200',
    icon: 'Clock',
    iconCls: 'text-gray-400',
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ChecklistItemRowProps {
  item: ChecklistItem;
}

const ChecklistItemRow = ({ item }: ChecklistItemRowProps) => {
  const cfg = ITEM_CFG[item.status];

  const handleClick = () => {
    if (item.status === 'completed') {
      toast.success('Уже выполнено', { description: item.title });
    } else {
      toast.info('Перейти к настройке', { description: item.title });
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors cursor-pointer ${cfg.rowCls}`}
    >
      <Icon name={cfg.icon} size={16} className={`shrink-0 ${cfg.iconCls}`} />
      <span className={`flex-1 text-sm leading-snug ${cfg.textCls}`}>{item.title}</span>
      {item.detail && (
        <span className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-0.5 rounded-full shrink-0">
          {item.detail}
        </span>
      )}
    </button>
  );
};

interface PhaseBlockProps {
  phase: Phase;
  defaultOpen?: boolean;
}

const PhaseBlock = ({ phase, defaultOpen = false }: PhaseBlockProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const cfg = PHASE_STATUS_CFG[phase.status];

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 border-b transition-colors ${cfg.headerCls}`}
      >
        <div className="flex items-center gap-2.5">
          <Icon name={cfg.icon} size={16} className={cfg.iconCls} />
          <span className="font-semibold text-sm text-gray-800">{phase.title}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.badgeCls}`}
          >
            {cfg.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-24 h-1.5 bg-white/70 rounded-full overflow-hidden border border-gray-200">
            <div
              className={`h-full rounded-full transition-all ${
                phase.status === 'completed'
                  ? 'bg-green-500'
                  : phase.status === 'in_progress'
                  ? 'bg-blue-500'
                  : 'bg-gray-300'
              }`}
              style={{ width: `${phase.progress}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-600 w-8 text-right">
            {phase.progress}%
          </span>
          <Icon
            name={open ? 'ChevronDown' : 'ChevronRight'}
            size={16}
            className="text-gray-400"
          />
        </div>
      </button>
      {open && (
        <div className="p-3 space-y-2 bg-white">
          {phase.items.map((item) => (
            <ChecklistItemRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Circular Progress ────────────────────────────────────────────────────────

interface CircularProgressProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
}

const CircularProgress = ({ percent, size = 140, strokeWidth = 12 }: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#progressGradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-700"
      />
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface ChartTooltipProps {
  active?: boolean;
  payload?: { payload: { fullName: string; percent: number } }[];
}

const ChartTooltip = ({ active, payload }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-gray-800 mb-0.5">{d.fullName}</p>
      <p className="text-blue-600 font-bold text-sm">{d.percent}%</p>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const OnboardingProgressFull = () => {
  const overallPercent = 73;
  const stepsCompleted = 22;
  const stepsTotal = 30;
  const activeUsers = 18;
  const modulesConfigured = 12;
  const modulesTotal = 15;
  const daysToLaunch = 14;

  const handleInviteConsultant = () => {
    toast.success('Запрос отправлен', {
      description: 'Консультант свяжется с вами в течение рабочего дня',
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* ── Top Panel ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-5 shrink-0">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Icon name="Rocket" size={22} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Прогресс онбординга системы</h2>
              <p className="text-sm text-gray-500">АСУ СЦ «Сервис Климат» — подготовка к запуску</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleInviteConsultant}
          >
            <Icon name="HeadphonesIcon" size={14} />
            Пригласить консультанта
          </Button>
        </div>

        {/* Circular progress + metrics */}
        <div className="flex items-center gap-8">
          {/* Circle */}
          <div className="relative shrink-0">
            <CircularProgress percent={overallPercent} size={140} strokeWidth={12} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">{overallPercent}%</span>
              <span className="text-xs text-gray-500 text-center leading-tight mt-0.5">
                завершён
              </span>
            </div>
          </div>

          {/* Label under circle */}
          <div className="flex flex-col gap-1 mr-4">
            <p className="text-sm font-semibold text-gray-700">Онбординг системы</p>
            <p className="text-xs text-gray-500">Общий прогресс</p>
          </div>

          {/* Separator */}
          <div className="w-px h-20 bg-gray-200 shrink-0" />

          {/* Metrics grid */}
          <div className="grid grid-cols-4 gap-4 flex-1">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-blue-700">
                {stepsCompleted}
                <span className="text-sm font-medium text-blue-400">/{stepsTotal}</span>
              </p>
              <p className="text-xs text-blue-600 mt-1 leading-tight">Пройдено шагов</p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-700">{activeUsers}</p>
              <p className="text-xs text-green-600 mt-1 leading-tight">Активных пользователей</p>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-purple-700">
                {modulesConfigured}
                <span className="text-sm font-medium text-purple-400">/{modulesTotal}</span>
              </p>
              <p className="text-xs text-purple-600 mt-1 leading-tight">Модулей настроено</p>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-orange-700">{daysToLaunch}</p>
              <p className="text-xs text-orange-600 mt-1 leading-tight">Дней до запуска</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ── Center: Checklist + Chart ── */}
        <div className="flex-1 min-w-0 overflow-y-auto p-5 space-y-5">
          {/* Checklist */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Icon name="ClipboardList" size={16} className="text-gray-500" />
              <h3 className="font-semibold text-gray-800 text-sm">
                Чеклист онбординга организации
              </h3>
              <Badge variant="secondary" className="text-xs ml-auto">
                {stepsCompleted}/{stepsTotal} шагов
              </Badge>
            </div>
            <div className="space-y-3">
              {PHASES.map((phase, idx) => (
                <PhaseBlock key={phase.id} phase={phase} defaultOpen={idx === 1} />
              ))}
            </div>
          </div>

          {/* Bar chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="BarChart2" size={16} className="text-indigo-500" />
              <h3 className="font-semibold text-gray-800 text-sm">Прогресс по фазам</h3>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={CHART_DATA}
                margin={{ top: 4, right: 8, bottom: 4, left: -16 }}
                barSize={40}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f9fafb' }} />
                <Bar
                  dataKey="percent"
                  radius={[6, 6, 0, 0]}
                  fill="url(#barGradient)"
                  label={{ position: 'top', fontSize: 11, fill: '#6b7280', formatter: (v: number) => `${v}%` }}
                >
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Right Panel: Recommendations ── */}
        <div className="w-80 shrink-0 border-l border-gray-200 bg-white overflow-y-auto p-4">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="Lightbulb" size={16} className="text-amber-500" />
            <h3 className="font-semibold text-gray-800 text-sm">Рекомендации</h3>
            <span className="ml-auto text-xs text-gray-400">по приоритету</span>
          </div>

          <div className="space-y-3">
            {RECOMMENDATIONS.map((rec) => (
              <div
                key={rec.id}
                className="border border-gray-200 rounded-xl p-3 hover:border-indigo-200 hover:shadow-sm transition-all bg-white"
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Icon name={rec.icon} size={15} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-bold text-indigo-500">#{rec.priority}</span>
                      <p className="text-sm font-semibold text-gray-800 leading-snug">
                        {rec.title}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{rec.description}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-7 text-xs gap-1.5"
                  onClick={() => {
                    toast.info('Переход к настройке', { description: rec.title });
                  }}
                >
                  <Icon name="ArrowRight" size={12} />
                  Начать
                </Button>
              </div>
            ))}
          </div>

          {/* Invite consultant button at bottom */}
          <div className="mt-5 pt-4 border-t border-gray-200">
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Headphones" size={16} className="text-indigo-600" />
                <p className="text-sm font-semibold text-indigo-800">Нужна помощь?</p>
              </div>
              <p className="text-xs text-indigo-600 mb-3 leading-relaxed">
                Наш консультант поможет настроить систему и ускорит запуск
              </p>
              <Button
                className="w-full h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                onClick={handleInviteConsultant}
              >
                <Icon name="Send" size={12} />
                Пригласить консультанта
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingProgressFull;
