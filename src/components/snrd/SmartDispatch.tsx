import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type Priority = 'emergency' | 'urgent' | 'normal';

interface WorkOrder {
  id: string;
  number: string;
  client: string;
  address: string;
  type: string;
  priority: Priority;
  slaDeadline: string;
  slaRemainingMinutes: number;
}

interface EngineerScore {
  engineerId: string;
  name: string;
  initials: string;
  status: string;
  distanceKm: number;
  etaMinutes: number;
  scores: {
    sla: number;        // 0-100, weight 40%
    geo: number;        // 0-100, weight 30%
    workload: number;   // 0-100, weight 20%
    skills: number;     // 0-100, weight 10%
  };
  total: number;        // weighted sum
}

interface AssignedOrder {
  order: WorkOrder;
  engineer: EngineerScore;
  assignedAt: string;
}

interface EngineerLoad {
  name: string;
  orders: number;
  hours: number;
}

// ─────────────────────────────────────────────
// Static data
// ─────────────────────────────────────────────

const INITIAL_QUEUE: WorkOrder[] = [
  {
    id: 'wo-1',
    number: 'WO-2026-000341',
    client: 'ООО «АрктикСтрой»',
    address: 'ул. Ленина, 42, оф. 301',
    type: 'Ремонт VRF-системы',
    priority: 'emergency',
    slaDeadline: '10:30',
    slaRemainingMinutes: 47,
  },
  {
    id: 'wo-2',
    number: 'WO-2026-000342',
    client: 'Иванов Сергей Петрович',
    address: 'пр. Мира, 18, кв. 55',
    type: 'Техническое обслуживание',
    priority: 'urgent',
    slaDeadline: '13:00',
    slaRemainingMinutes: 137,
  },
  {
    id: 'wo-3',
    number: 'WO-2026-000343',
    client: 'ТЦ «Галактика»',
    address: 'Северное шоссе, 7',
    type: 'Установка кондиционера',
    priority: 'normal',
    slaDeadline: '17:00',
    slaRemainingMinutes: 257,
  },
];

const CANDIDATES: Record<string, EngineerScore[]> = {
  'wo-1': [
    {
      engineerId: 'e1',
      name: 'Алексей Громов',
      initials: 'АГ',
      status: 'Свободен',
      distanceKm: 3.2,
      etaMinutes: 14,
      scores: { sla: 95, geo: 88, workload: 80, skills: 100 },
      total: Math.round(95 * 0.4 + 88 * 0.3 + 80 * 0.2 + 100 * 0.1),
    },
    {
      engineerId: 'e2',
      name: 'Дмитрий Соколов',
      initials: 'ДС',
      status: 'Завершает наряд',
      distanceKm: 6.8,
      etaMinutes: 28,
      scores: { sla: 90, geo: 68, workload: 60, skills: 90 },
      total: Math.round(90 * 0.4 + 68 * 0.3 + 60 * 0.2 + 90 * 0.1),
    },
    {
      engineerId: 'e3',
      name: 'Марина Белова',
      initials: 'МБ',
      status: 'Свободна',
      distanceKm: 11.4,
      etaMinutes: 41,
      scores: { sla: 88, geo: 45, workload: 100, skills: 80 },
      total: Math.round(88 * 0.4 + 45 * 0.3 + 100 * 0.2 + 80 * 0.1),
    },
  ],
  'wo-2': [
    {
      engineerId: 'e4',
      name: 'Олег Тарасов',
      initials: 'ОТ',
      status: 'Свободен',
      distanceKm: 4.5,
      etaMinutes: 19,
      scores: { sla: 72, geo: 82, workload: 90, skills: 85 },
      total: Math.round(72 * 0.4 + 82 * 0.3 + 90 * 0.2 + 85 * 0.1),
    },
    {
      engineerId: 'e2',
      name: 'Дмитрий Соколов',
      initials: 'ДС',
      status: 'Завершает наряд',
      distanceKm: 7.1,
      etaMinutes: 31,
      scores: { sla: 70, geo: 65, workload: 60, skills: 90 },
      total: Math.round(70 * 0.4 + 65 * 0.3 + 60 * 0.2 + 90 * 0.1),
    },
    {
      engineerId: 'e5',
      name: 'Наталья Козлова',
      initials: 'НК',
      status: 'В пути',
      distanceKm: 9.3,
      etaMinutes: 38,
      scores: { sla: 68, geo: 55, workload: 75, skills: 70 },
      total: Math.round(68 * 0.4 + 55 * 0.3 + 75 * 0.2 + 70 * 0.1),
    },
  ],
  'wo-3': [
    {
      engineerId: 'e5',
      name: 'Наталья Козлова',
      initials: 'НК',
      status: 'В пути',
      distanceKm: 2.1,
      etaMinutes: 11,
      scores: { sla: 50, geo: 95, workload: 75, skills: 65 },
      total: Math.round(50 * 0.4 + 95 * 0.3 + 75 * 0.2 + 65 * 0.1),
    },
    {
      engineerId: 'e3',
      name: 'Марина Белова',
      initials: 'МБ',
      status: 'Свободна',
      distanceKm: 5.6,
      etaMinutes: 24,
      scores: { sla: 50, geo: 72, workload: 100, skills: 60 },
      total: Math.round(50 * 0.4 + 72 * 0.3 + 100 * 0.2 + 60 * 0.1),
    },
    {
      engineerId: 'e1',
      name: 'Алексей Громов',
      initials: 'АГ',
      status: 'Свободен',
      distanceKm: 8.9,
      etaMinutes: 35,
      scores: { sla: 48, geo: 58, workload: 80, skills: 100 },
      total: Math.round(48 * 0.4 + 58 * 0.3 + 80 * 0.2 + 100 * 0.1),
    },
  ],
};

const ENGINEER_LOAD: EngineerLoad[] = [
  { name: 'А. Громов', orders: 3, hours: 5.5 },
  { name: 'Д. Соколов', orders: 4, hours: 6.0 },
  { name: 'М. Белова', orders: 2, hours: 3.5 },
  { name: 'О. Тарасов', orders: 3, hours: 5.0 },
  { name: 'Н. Козлова', orders: 5, hours: 7.5 },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const priorityMeta: Record<Priority, { label: string; color: string; dot: string; border: string }> = {
  emergency: {
    label: 'Аварийный',
    color: 'text-red-700',
    dot: 'bg-red-500',
    border: 'border-red-200 bg-red-50',
  },
  urgent: {
    label: 'Срочный',
    color: 'text-orange-700',
    dot: 'bg-orange-500',
    border: 'border-orange-200 bg-orange-50',
  },
  normal: {
    label: 'Плановый',
    color: 'text-blue-700',
    dot: 'bg-blue-500',
    border: 'border-blue-200 bg-blue-50',
  },
};

const criteriaConfig = [
  { key: 'sla' as const, label: 'SLA', weight: '40%', color: 'bg-red-500' },
  { key: 'geo' as const, label: 'Геолокация', weight: '30%', color: 'bg-amber-500' },
  { key: 'workload' as const, label: 'Загрузка', weight: '20%', color: 'bg-blue-500' },
  { key: 'skills' as const, label: 'Компетенции', weight: '10%', color: 'bg-purple-500' },
];

function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
}

function formatRemaining(minutes: number): string {
  if (minutes < 60) return `${minutes} мин`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} ч ${m} мин` : `${h} ч`;
}

function now(): string {
  return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

interface CandidateCardProps {
  candidate: EngineerScore;
  onAssign: (candidate: EngineerScore) => void;
}

const CandidateCard = ({ candidate, onAssign }: CandidateCardProps) => (
  <div className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">{candidate.initials}</span>
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{candidate.name}</p>
          <p className="text-xs text-gray-500">{candidate.status}</p>
        </div>
      </div>
      {/* Total score badge */}
      <div className="text-right">
        <span className={`text-xl font-bold ${scoreColor(candidate.total)}`}>
          {candidate.total}
        </span>
        <p className="text-xs text-gray-400">/ 100</p>
      </div>
    </div>

    {/* Distance & ETA */}
    <div className="flex gap-4 mb-3 text-xs text-gray-600">
      <span className="flex items-center gap-1">
        <Icon name="MapPin" size={12} className="text-gray-400" />
        {candidate.distanceKm} км
      </span>
      <span className="flex items-center gap-1">
        <Icon name="Clock" size={12} className="text-gray-400" />
        ~{candidate.etaMinutes} мин в пути
      </span>
    </div>

    {/* Criteria progress bars */}
    <div className="space-y-1.5 mb-4">
      {criteriaConfig.map(({ key, label, weight, color }) => (
        <div key={key}>
          <div className="flex justify-between text-xs text-gray-500 mb-0.5">
            <span>{label} <span className="text-gray-400">({weight})</span></span>
            <span className="font-medium text-gray-700">{candidate.scores[key]}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className={`${color} h-1.5 rounded-full transition-all duration-500`}
              style={{ width: `${candidate.scores[key]}%` }}
            />
          </div>
        </div>
      ))}
    </div>

    <Button
      size="sm"
      className="w-full"
      onClick={() => onAssign(candidate)}
    >
      <Icon name="UserCheck" size={14} className="mr-1.5" />
      Назначить
    </Button>
  </div>
);

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

const SmartDispatch = () => {
  const [queue, setQueue] = useState<WorkOrder[]>(INITIAL_QUEUE);
  const [assigned, setAssigned] = useState<AssignedOrder[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [autoMode, setAutoMode] = useState(false);
  const [distributing, setDistributing] = useState(false);

  // ── Handlers ──────────────────────────────

  const handleToggleCandidates = (orderId: string) => {
    setExpandedOrderId(prev => (prev === orderId ? null : orderId));
  };

  const handleAssign = (order: WorkOrder, candidate: EngineerScore) => {
    setQueue(prev => prev.filter(o => o.id !== order.id));
    setAssigned(prev => [
      { order, engineer: candidate, assignedAt: now() },
      ...prev,
    ]);
    if (expandedOrderId === order.id) setExpandedOrderId(null);
    toast.success(`Наряд #${order.number} назначен инженеру ${candidate.name}`);
  };

  const handleDistributeAll = () => {
    if (queue.length === 0) return;
    setDistributing(true);

    // Simulate a short "AI thinking" delay then assign optimally
    setTimeout(() => {
      const toAssign = [...queue];
      toAssign.forEach(order => {
        const candidates = CANDIDATES[order.id];
        if (!candidates?.length) return;
        const best = [...candidates].sort((a, b) => b.total - a.total)[0];
        setAssigned(prev => [
          { order, engineer: best, assignedAt: now() },
          ...prev,
        ]);
        toast.success(`Наряд #${order.number} назначен инженеру ${best.name}`);
      });
      setQueue([]);
      setExpandedOrderId(null);
      setDistributing(false);
    }, 1200);
  };

  // ── Render ────────────────────────────────

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Умный диспетчер</h2>
          <p className="text-gray-600 mt-1">
            AI-планирование нарядов — скоринг инженеров по SLA, геолокации, загрузке и компетенциям
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setAutoMode(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !autoMode
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon name="Hand" size={14} className="inline mr-1.5" />
            Ручной
          </button>
          <button
            onClick={() => setAutoMode(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              autoMode
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon name="Zap" size={14} className="inline mr-1.5" />
            Авто
          </button>
        </div>
      </div>

      {/* Auto mode banner */}
      {autoMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="Zap" size={16} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-blue-900">Автоматический режим активен</p>
              <p className="text-sm text-blue-700">
                AI выберет оптимальных исполнителей для {queue.length} нарядов на основе взвешенного скоринга
              </p>
            </div>
          </div>
          <Button
            onClick={handleDistributeAll}
            disabled={queue.length === 0 || distributing}
            className="flex-shrink-0"
          >
            {distributing ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Распределяю...
              </>
            ) : (
              <>
                <Icon name="PlayCircle" size={16} className="mr-2" />
                Распределить всё ({queue.length})
              </>
            )}
          </Button>
        </div>
      )}

      {/* Queue + Assigned layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* Queue — 2/3 width */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Icon name="ListOrdered" size={18} className="text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Очередь назначения
            </h3>
            <span className="ml-auto bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {queue.length} нарядов
            </span>
          </div>

          {queue.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Icon name="CheckCircle2" size={40} className="mx-auto text-green-500 mb-3" />
              <p className="text-gray-600 font-medium">Все наряды назначены!</p>
              <p className="text-sm text-gray-400 mt-1">Очередь пуста</p>
            </div>
          ) : (
            queue.map(order => {
              const meta = priorityMeta[order.priority];
              const isExpanded = expandedOrderId === order.id;
              const candidates = CANDIDATES[order.id] ?? [];

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-lg border shadow-sm overflow-hidden ${meta.border}`}
                >
                  {/* Order header */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${meta.dot}`} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm font-semibold text-gray-900">
                              #{order.number}
                            </span>
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.color} bg-white border`}
                            >
                              {meta.label}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-800 mt-0.5">{order.client}</p>
                          <p className="text-xs text-gray-500 truncate">{order.address}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{order.type}</p>
                        </div>
                      </div>

                      {/* SLA info */}
                      <div className="flex-shrink-0 text-right">
                        <p className="text-xs text-gray-500">Дедлайн SLA</p>
                        <p className="text-sm font-bold text-gray-900">{order.slaDeadline}</p>
                        <p
                          className={`text-xs font-medium ${
                            order.slaRemainingMinutes < 60
                              ? 'text-red-600'
                              : order.slaRemainingMinutes < 120
                              ? 'text-orange-600'
                              : 'text-green-600'
                          }`}
                        >
                          осталось {formatRemaining(order.slaRemainingMinutes)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleCandidates(order.id)}
                      >
                        <Icon name="Users" size={14} className="mr-1.5" />
                        {isExpanded ? 'Скрыть исполнителей' : 'Подобрать исполнителей'}
                        <Icon
                          name={isExpanded ? 'ChevronUp' : 'ChevronDown'}
                          size={14}
                          className="ml-1.5"
                        />
                      </Button>
                    </div>
                  </div>

                  {/* Candidates panel */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Топ-3 кандидата · Взвешенный скоринг
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {candidates.map(candidate => (
                          <CandidateCard
                            key={candidate.engineerId}
                            candidate={candidate}
                            onAssign={c => handleAssign(order, c)}
                          />
                        ))}
                      </div>

                      {/* Scoring legend */}
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                        {criteriaConfig.map(({ key, label, weight, color }) => (
                          <span key={key} className="flex items-center gap-1 text-xs text-gray-500">
                            <span className={`w-2 h-2 rounded-full ${color} inline-block`} />
                            {label} {weight}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Assigned log — 1/3 width */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Icon name="ClipboardCheck" size={18} className="text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Назначены</h3>
            <span className="ml-auto bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {assigned.length}
            </span>
          </div>

          {assigned.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-400">
              <Icon name="Inbox" size={32} className="mx-auto mb-2" />
              <p className="text-sm">Пока нет назначений</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {assigned.map(({ order, engineer, assignedAt }) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg border border-green-200 p-3 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-semibold text-gray-700">
                      #{order.number}
                    </span>
                    <span className="text-xs text-gray-400">{assignedAt}</span>
                  </div>
                  <p className="text-xs text-gray-600 truncate">{order.client}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{engineer.initials}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-800">{engineer.name}</span>
                    <span className={`ml-auto text-xs font-bold ${scoreColor(engineer.total)}`}>
                      {engineer.total}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Engineer workload table + chart */}
      <div className="grid grid-cols-2 gap-6">
        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="Users" size={18} className="text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Загрузка инженеров сегодня</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-2">
                  Инженер
                </th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide pb-2">
                  Нарядов
                </th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide pb-2">
                  Часов
                </th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide pb-2">
                  Загрузка
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ENGINEER_LOAD.map(eng => {
                const pct = Math.min(Math.round((eng.hours / 8) * 100), 100);
                const barColor =
                  pct >= 90
                    ? 'bg-red-500'
                    : pct >= 70
                    ? 'bg-amber-500'
                    : 'bg-green-500';
                return (
                  <tr key={eng.name} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 text-sm text-gray-800 font-medium">{eng.name}</td>
                    <td className="py-2.5 text-sm text-right text-gray-700">{eng.orders}</td>
                    <td className="py-2.5 text-sm text-right text-gray-700">{eng.hours} ч</td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-2">
                          <div
                            className={`${barColor} h-2 rounded-full`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold w-8 text-right ${
                          pct >= 90 ? 'text-red-600' : pct >= 70 ? 'text-amber-600' : 'text-green-600'
                        }`}>
                          {pct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bar chart */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="BarChart2" size={18} className="text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Нарядов на инженера</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={ENGINEER_LOAD}
              layout="vertical"
              margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11, fill: '#374151' }}
                tickLine={false}
                axisLine={false}
                width={72}
              />
              <Tooltip
                cursor={{ fill: '#f3f4f6' }}
                formatter={(value: number, name: string) =>
                  name === 'orders'
                    ? [`${value} нарядов`, 'Нарядов']
                    : [`${value} ч`, 'Часов']
                }
                contentStyle={{
                  fontSize: 12,
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                }}
              />
              <Bar dataKey="orders" name="orders" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={14} />
              <Bar dataKey="hours" name="hours" fill="#a78bfa" radius={[0, 4, 4, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 justify-center">
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
              Нарядов
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-3 h-3 rounded-sm bg-violet-400 inline-block" />
              Часов
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartDispatch;
