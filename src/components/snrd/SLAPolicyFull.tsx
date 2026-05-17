import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

type PolicyLevel = 'Базовый' | 'Срочный' | 'Аварийный' | 'VIP' | 'Договорной';

interface SLAPolicy {
  id: string;
  name: string;
  description: string;
  level: PolicyLevel;
  clientsCount: number;
  performance: number; // %
  ttr: { value: number; unit: 'h' | 'm'; workingHoursOnly: boolean };
  tto: { value: number; unit: 'h' | 'm'; workingHoursOnly: boolean };
  ttf: { value: number; unit: 'h' | 'm'; workingHoursOnly: boolean } | null;
  workingHours: { from: string; to: string };
  warningThreshold: number; // %
  notificationRecipients: string[];
}

interface SLAViolation {
  id: string;
  orderNum: string;
  client: string;
  policy: string;
  metric: 'TTR' | 'TTO' | 'TTF';
  overdueHours: number;
  engineer: string;
  reason: string;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const POLICIES: SLAPolicy[] = [
  {
    id: 'p1',
    name: 'Корпоративный Базовый',
    description: 'Стандартная политика для большинства клиентов без договора SLA',
    level: 'Базовый',
    clientsCount: 18,
    performance: 97,
    ttr: { value: 48, unit: 'h', workingHoursOnly: true },
    tto: { value: 4,  unit: 'h', workingHoursOnly: true },
    ttf: { value: 72, unit: 'h', workingHoursOnly: true },
    workingHours: { from: '09:00', to: '18:00' },
    warningThreshold: 80,
    notificationRecipients: ['dispatcher@servisklimat.ru'],
  },
  {
    id: 'p2',
    name: 'Корпоративный Срочный',
    description: 'Ускоренная реакция для клиентов с повышенным приоритетом',
    level: 'Срочный',
    clientsCount: 11,
    performance: 93,
    ttr: { value: 24, unit: 'h', workingHoursOnly: true },
    tto: { value: 2,  unit: 'h', workingHoursOnly: false },
    ttf: { value: 48, unit: 'h', workingHoursOnly: true },
    workingHours: { from: '08:00', to: '20:00' },
    warningThreshold: 75,
    notificationRecipients: ['dispatcher@servisklimat.ru', 'manager@servisklimat.ru'],
  },
  {
    id: 'p3',
    name: 'Аварийный',
    description: 'Для критических ситуаций с остановкой производства',
    level: 'Аварийный',
    clientsCount: 5,
    performance: 88,
    ttr: { value: 4,  unit: 'h', workingHoursOnly: false },
    tto: { value: 1,  unit: 'h', workingHoursOnly: false },
    ttf: { value: 8,  unit: 'h', workingHoursOnly: false },
    workingHours: { from: '00:00', to: '24:00' },
    warningThreshold: 70,
    notificationRecipients: ['dispatcher@servisklimat.ru', 'manager@servisklimat.ru', 'director@servisklimat.ru'],
  },
  {
    id: 'p4',
    name: 'Договорной Стандарт',
    description: 'Параметры SLA по типовому сервисному договору',
    level: 'Договорной',
    clientsCount: 8,
    performance: 95,
    ttr: { value: 36, unit: 'h', workingHoursOnly: true },
    tto: { value: 3,  unit: 'h', workingHoursOnly: true },
    ttf: null,
    workingHours: { from: '09:00', to: '18:00' },
    warningThreshold: 80,
    notificationRecipients: ['dispatcher@servisklimat.ru', 'client-manager@servisklimat.ru'],
  },
  {
    id: 'p5',
    name: 'VIP Обслуживание',
    description: 'Максимальный приоритет для ключевых партнёров',
    level: 'VIP',
    clientsCount: 4,
    performance: 96,
    ttr: { value: 8,  unit: 'h', workingHoursOnly: false },
    tto: { value: 1,  unit: 'h', workingHoursOnly: false },
    ttf: { value: 24, unit: 'h', workingHoursOnly: false },
    workingHours: { from: '00:00', to: '24:00' },
    warningThreshold: 85,
    notificationRecipients: ['dispatcher@servisklimat.ru', 'manager@servisklimat.ru', 'director@servisklimat.ru'],
  },
  {
    id: 'p6',
    name: 'ПАО Сбербанк',
    description: 'Кастомная политика по договору с ПАО Сбербанк (индивидуальные условия)',
    level: 'Договорной',
    clientsCount: 1,
    performance: 98,
    ttr: { value: 12, unit: 'h', workingHoursOnly: false },
    tto: { value: 2,  unit: 'h', workingHoursOnly: false },
    ttf: null,
    workingHours: { from: '08:00', to: '22:00' },
    warningThreshold: 85,
    notificationRecipients: ['dispatcher@servisklimat.ru', 'sberbank-account@servisklimat.ru'],
  },
];

const VIOLATIONS: SLAViolation[] = [
  { id: 'v1', orderNum: 'WO-2026-000381', client: 'ТК Северный',        policy: 'Аварийный',           metric: 'TTR', overdueHours: 2.4, engineer: 'Сидоров Д.М.',   reason: 'Нет свободных инженеров' },
  { id: 'v2', orderNum: 'WO-2026-000374', client: 'ООО МегаСтрой',      policy: 'Корпоративный Срочный', metric: 'TTO', overdueHours: 1.1, engineer: 'Козлов М.И.',    reason: 'Пробки на трассе М4' },
  { id: 'v3', orderNum: 'WO-2026-000362', client: 'ПАО Сбербанк',       policy: 'ПАО Сбербанк',         metric: 'TTR', overdueHours: 0.8, engineer: 'Петров С.А.',    reason: 'Инженер на другом выезде' },
  { id: 'v4', orderNum: 'WO-2026-000359', client: 'АО ТрансСервис',     policy: 'VIP Обслуживание',     metric: 'TTF', overdueHours: 3.2, engineer: 'Михайлов В.О.', reason: 'Ожидание запчасти' },
  { id: 'v5', orderNum: 'WO-2026-000347', client: 'ТЦ Мираж',           policy: 'Аварийный',           metric: 'TTO', overdueHours: 0.5, engineer: 'Лебедев К.Р.',   reason: 'Поздняя диспетчеризация' },
  { id: 'v6', orderNum: 'WO-2026-000338', client: 'ООО СтройГрупп',     policy: 'Договорной Стандарт',  metric: 'TTR', overdueHours: 4.7, engineer: 'Новиков А.П.',   reason: 'Ресурс не назначен' },
  { id: 'v7', orderNum: 'WO-2026-000321', client: 'ГК Ромашка',         policy: 'Корпоративный Базовый', metric: 'TTF', overdueHours: 6.0, engineer: 'Волков Р.С.',    reason: 'Сложный ремонт VRF системы' },
  { id: 'v8', orderNum: 'WO-2026-000318', client: 'ФГУП ЭкоСервис',     policy: 'Корпоративный Срочный', metric: 'TTR', overdueHours: 1.9, engineer: 'Зайцев И.К.',    reason: 'Ошибка в классификации заявки' },
];

const PERFORMANCE_CHART_DATA = POLICIES.map(p => ({
  name: p.name.length > 18 ? p.name.slice(0, 18) + '…' : p.name,
  fullName: p.name,
  value: p.performance,
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LEVEL_STYLES: Record<PolicyLevel, { badge: string; dot: string }> = {
  'Базовый':    { badge: 'bg-gray-100 text-gray-700 border-gray-200',     dot: 'bg-gray-400' },
  'Срочный':    { badge: 'bg-blue-100 text-blue-700 border-blue-200',      dot: 'bg-blue-500' },
  'Аварийный':  { badge: 'bg-red-100 text-red-700 border-red-200',         dot: 'bg-red-500' },
  'VIP':        { badge: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  'Договорной': { badge: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
};

const METRIC_COLORS: Record<'TTR' | 'TTO' | 'TTF', string> = {
  TTR: 'bg-yellow-100 text-yellow-700',
  TTO: 'bg-blue-100 text-blue-700',
  TTF: 'bg-red-100 text-red-700',
};

function formatSLAValue(v: { value: number; unit: 'h' | 'm' }) {
  return `${v.value}${v.unit === 'h' ? 'ч' : 'мин'}`;
}

function PerformancePct({ value }: { value: number }) {
  const color = value >= 96 ? 'text-green-600' : value >= 90 ? 'text-yellow-600' : 'text-red-600';
  return <span className={`font-semibold ${color}`}>{value}%</span>;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({
  label,
  icon,
  value,
  sub,
  accent,
}: {
  label: string;
  icon: string;
  value: string | number;
  sub: string;
  accent?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${accent ?? 'bg-blue-50'}`}>
        <Icon name={icon as any} size={18} className="text-current" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function PolicyListItem({
  policy,
  selected,
  onClick,
}: {
  policy: SLAPolicy;
  selected: boolean;
  onClick: () => void;
}) {
  const styles = LEVEL_STYLES[policy.level];
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border transition-all ${
        selected ? 'border-blue-400 bg-blue-50 shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start gap-2">
        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${styles.dot}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{policy.name}</p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className={`text-xs px-1.5 py-0.5 rounded-full border ${styles.badge}`}>{policy.level}</span>
            <span className="text-xs text-gray-400">{policy.clientsCount} кл.</span>
            <PerformancePct value={policy.performance} />
          </div>
          <div className="flex gap-2 mt-1.5 text-xs text-gray-500">
            <span>TTR {formatSLAValue(policy.ttr)}</span>
            <span>TTO {formatSLAValue(policy.tto)}</span>
            {policy.ttf && <span>TTF {formatSLAValue(policy.ttf)}</span>}
          </div>
        </div>
      </div>
    </button>
  );
}

interface SLAFieldEditorProps {
  label: string;
  fieldKey: 'ttr' | 'tto' | 'ttf';
  value: SLAPolicy['ttr'] | null;
  onChange: (key: 'ttr' | 'tto' | 'ttf', val: SLAPolicy['ttr'] | null) => void;
  optional?: boolean;
}

function SLAFieldEditor({ label, fieldKey, value, onChange, optional }: SLAFieldEditorProps) {
  const enabled = value !== null;
  return (
    <div className="border border-gray-200 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {optional && (
          <button
            type="button"
            onClick={() =>
              onChange(
                fieldKey,
                enabled ? null : { value: 24, unit: 'h', workingHoursOnly: true },
              )
            }
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              enabled ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                enabled ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        )}
      </div>
      {enabled && value ? (
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            min={1}
            value={value.value}
            onChange={e =>
              onChange(fieldKey, { ...value, value: parseInt(e.target.value) || 1 })
            }
            className="w-20 h-8 text-sm"
          />
          <select
            value={value.unit}
            onChange={e =>
              onChange(fieldKey, { ...value, unit: e.target.value as 'h' | 'm' })
            }
            className="h-8 text-sm border border-gray-200 rounded-md px-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="h">часов</option>
            <option value="m">минут</option>
          </select>
          <button
            type="button"
            onClick={() => onChange(fieldKey, { ...value, workingHoursOnly: !value.workingHoursOnly })}
            className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border transition-colors ${
              value.workingHoursOnly
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}
          >
            <Icon name={value.workingHoursOnly ? 'Clock' : 'Clock' as any} size={11} />
            Раб. часы
          </button>
        </div>
      ) : optional ? (
        <p className="text-xs text-gray-400">Не применяется</p>
      ) : null}
    </div>
  );
}

// ─── Custom chart tooltip ─────────────────────────────────────────────────────

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-medium text-gray-900 mb-0.5">{d.payload.fullName}</p>
      <p className={d.value >= 96 ? 'text-green-600' : d.value >= 90 ? 'text-yellow-600' : 'text-red-600'}>
        Выполнение: <span className="font-bold">{d.value}%</span>
      </p>
    </div>
  );
}

function ChartBar(props: any) {
  const { x, y, width, height, value } = props;
  const fill = value >= 96 ? '#10B981' : value >= 90 ? '#F59E0B' : '#EF4444';
  return <rect x={x} y={y} width={width} height={height} rx={4} ry={4} fill={fill} />;
}

// ─── Main component ───────────────────────────────────────────────────────────

const SLAPolicyFull = () => {
  const [policies, setPolicies] = useState<SLAPolicy[]>(POLICIES);
  const [selectedId, setSelectedId] = useState<string>(POLICIES[0].id);
  const [draft, setDraft] = useState<SLAPolicy>(POLICIES[0]);
  const [newRecipient, setNewRecipient] = useState('');

  const selected = policies.find(p => p.id === selectedId) ?? policies[0];

  const handleSelect = (p: SLAPolicy) => {
    setSelectedId(p.id);
    setDraft({ ...p });
    setNewRecipient('');
  };

  const handleDraftChange = <K extends keyof SLAPolicy>(key: K, val: SLAPolicy[K]) => {
    setDraft(prev => ({ ...prev, [key]: val }));
  };

  const handleMetricChange = (
    key: 'ttr' | 'tto' | 'ttf',
    val: SLAPolicy['ttr'] | null,
  ) => {
    setDraft(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = () => {
    setPolicies(prev => prev.map(p => (p.id === draft.id ? draft : p)));
    toast.success(`Политика «${draft.name}» сохранена`);
  };

  const handleCreate = () => {
    const newId = `p${Date.now()}`;
    const newPolicy: SLAPolicy = {
      id: newId,
      name: 'Новая политика SLA',
      description: '',
      level: 'Базовый',
      clientsCount: 0,
      performance: 100,
      ttr: { value: 48, unit: 'h', workingHoursOnly: true },
      tto: { value: 4,  unit: 'h', workingHoursOnly: true },
      ttf: { value: 72, unit: 'h', workingHoursOnly: true },
      workingHours: { from: '09:00', to: '18:00' },
      warningThreshold: 80,
      notificationRecipients: ['dispatcher@servisklimat.ru'],
    };
    setPolicies(prev => [...prev, newPolicy]);
    setSelectedId(newId);
    setDraft(newPolicy);
    toast.info('Создана новая политика — заполните параметры и сохраните');
  };

  const handleApply = () => {
    toast.success(`Политика «${selected.name}» применена к ${selected.clientsCount} клиентам`);
  };

  const addRecipient = () => {
    const val = newRecipient.trim();
    if (!val) return;
    if (draft.notificationRecipients.includes(val)) {
      toast.error('Получатель уже добавлен');
      return;
    }
    handleDraftChange('notificationRecipients', [...draft.notificationRecipients, val]);
    setNewRecipient('');
  };

  const removeRecipient = (email: string) => {
    handleDraftChange(
      'notificationRecipients',
      draft.notificationRecipients.filter(r => r !== email),
    );
  };

  // Summary metrics
  const totalActive  = 47;
  const avgPerf      = 94.3;
  const totalViolations = VIOLATIONS.length;

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">

      {/* ── Top metrics ──────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 p-5 pb-0">
        <div className="grid grid-cols-4 gap-4 mb-5">
          <MetricCard
            label="Политик SLA"
            icon="Shield"
            value={policies.length}
            sub="всего настроено"
            accent="bg-blue-50 text-blue-600"
          />
          <MetricCard
            label="Договоров с SLA"
            icon="FileCheck"
            value={totalActive}
            sub="активных"
            accent="bg-green-50 text-green-600"
          />
          <MetricCard
            label="Среднее выполнение"
            icon="TrendingUp"
            value={`${avgPerf}%`}
            sub="за текущий месяц"
            accent="bg-purple-50 text-purple-600"
          />
          <MetricCard
            label="Нарушений за месяц"
            icon="AlertTriangle"
            value={totalViolations}
            sub="требуют анализа"
            accent="bg-red-50 text-red-600"
          />
        </div>
      </div>

      {/* ── Main body ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex gap-4 px-5 min-h-0 overflow-hidden">

        {/* ── Left: policy list ──────────────────────────────────────────────── */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-3 overflow-y-auto pr-0.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Политики SLA</h3>
            <Button size="sm" variant="outline" onClick={handleCreate} className="h-7 text-xs">
              <Icon name="Plus" size={13} className="mr-1" />
              Создать
            </Button>
          </div>
          <div className="space-y-2">
            {policies.map(p => (
              <PolicyListItem
                key={p.id}
                policy={p}
                selected={p.id === selectedId}
                onClick={() => handleSelect(p)}
              />
            ))}
          </div>
        </div>

        {/* ── Right: editor ──────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-w-0">

          {/* Header */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex-shrink-0">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${LEVEL_STYLES[draft.level].dot}`} />
                  <Input
                    value={draft.name}
                    onChange={e => handleDraftChange('name', e.target.value)}
                    className="h-8 text-base font-semibold border-0 border-b border-gray-300 rounded-none px-0 focus-visible:ring-0 focus-visible:border-blue-400"
                  />
                </div>
                <Input
                  value={draft.description}
                  onChange={e => handleDraftChange('description', e.target.value)}
                  placeholder="Описание политики..."
                  className="h-7 text-xs text-gray-500 border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-blue-400"
                />
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <select
                  value={draft.level}
                  onChange={e => handleDraftChange('level', e.target.value as PolicyLevel)}
                  className="h-8 text-xs border border-gray-200 rounded-lg px-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  {(['Базовый', 'Срочный', 'Аварийный', 'VIP', 'Договорной'] as PolicyLevel[]).map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
                <Button size="sm" onClick={handleSave} className="h-8 text-xs">
                  <Icon name="Save" size={13} className="mr-1" />
                  Сохранить
                </Button>
                <Button size="sm" variant="outline" onClick={handleApply} className="h-8 text-xs">
                  <Icon name="Users" size={13} className="mr-1" />
                  Применить
                </Button>
              </div>
            </div>

            {/* Level badge + stats */}
            <div className="flex items-center gap-3">
              <Badge className={`text-xs border ${LEVEL_STYLES[draft.level].badge}`}>{draft.level}</Badge>
              <span className="text-xs text-gray-500">{selected.clientsCount} клиентов</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">Выполнение: </span>
              <PerformancePct value={selected.performance} />
            </div>
          </div>

          {/* SLA metrics editor */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex-shrink-0">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Нормативы времени</h4>
            <div className="grid grid-cols-3 gap-3">
              <SLAFieldEditor
                label="Время реагирования (TTR)"
                fieldKey="ttr"
                value={draft.ttr}
                onChange={handleMetricChange}
              />
              <SLAFieldEditor
                label="Время прибытия (TTO)"
                fieldKey="tto"
                value={draft.tto}
                onChange={handleMetricChange}
              />
              <SLAFieldEditor
                label="Время устранения (TTF)"
                fieldKey="ttf"
                value={draft.ttf}
                onChange={handleMetricChange}
                optional
              />
            </div>
          </div>

          {/* Working hours + warning */}
          <div className="grid grid-cols-2 gap-4 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Icon name="Clock" size={14} className="text-gray-400" />
                Рабочие часы
              </h4>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">С</label>
                  <Input
                    type="time"
                    value={draft.workingHours.from}
                    onChange={e =>
                      handleDraftChange('workingHours', { ...draft.workingHours, from: e.target.value })
                    }
                    className="h-8 text-sm"
                  />
                </div>
                <span className="text-gray-400 mt-4">—</span>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">До</label>
                  <Input
                    type="time"
                    value={draft.workingHours.to}
                    onChange={e =>
                      handleDraftChange('workingHours', { ...draft.workingHours, to: e.target.value })
                    }
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">пн — пт, по умолчанию 09:00–18:00</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Icon name="AlertCircle" size={14} className="text-orange-400" />
                Порог предупреждения
              </h4>
              <div className="flex items-center gap-2 mb-2">
                <Input
                  type="number"
                  min={1}
                  max={99}
                  value={draft.warningThreshold}
                  onChange={e =>
                    handleDraftChange('warningThreshold', parseInt(e.target.value) || 80)
                  }
                  className="w-20 h-8 text-sm"
                />
                <span className="text-sm text-gray-600">%</span>
              </div>
              <p className="text-xs text-gray-400">
                При достижении {draft.warningThreshold}% норматива — YELLOW alert
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-gray-100">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500"
                  style={{ width: `${draft.warningThreshold}%` }}
                />
              </div>
            </div>
          </div>

          {/* Notification recipients */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex-shrink-0">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Icon name="Bell" size={14} className="text-gray-400" />
              Получатели уведомлений SLA
            </h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {draft.notificationRecipients.map(r => (
                <div
                  key={r}
                  className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1 text-xs text-blue-700"
                >
                  <Icon name="Mail" size={11} />
                  <span>{r}</span>
                  <button
                    onClick={() => removeRecipient(r)}
                    className="text-blue-400 hover:text-red-500 transition-colors ml-0.5"
                  >
                    <Icon name="X" size={11} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="email@servisklimat.ru"
                value={newRecipient}
                onChange={e => setNewRecipient(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addRecipient()}
                className="h-8 text-sm flex-1"
              />
              <Button size="sm" variant="outline" onClick={addRecipient} className="h-8 text-xs">
                <Icon name="Plus" size={13} className="mr-1" />
                Добавить
              </Button>
            </div>
          </div>

          {/* Performance chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex-shrink-0">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Выполнение SLA по политикам</h4>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={PERFORMANCE_CHART_DATA} margin={{ top: 8, right: 8, left: -16, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  interval={0}
                  angle={-12}
                  dy={6}
                />
                <YAxis
                  domain={[80, 100]}
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  tickFormatter={v => `${v}%`}
                />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine
                  y={90}
                  stroke="#EF4444"
                  strokeDasharray="4 3"
                  label={{ value: '90%', position: 'right', fontSize: 10, fill: '#EF4444' }}
                />
                <Bar dataKey="value" shape={<ChartBar />} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-3 justify-end mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> ≥ 96%</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> 90–95%</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> &lt; 90%</span>
              <span className="flex items-center gap-1 text-red-400"><span className="border-t-2 border-red-400 border-dashed w-4 inline-block" /> норматив 90%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Violations table ──────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-5 pb-5 pt-4">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={15} className="text-red-500" />
              <h4 className="text-sm font-semibold text-gray-900">Нарушения SLA за месяц</h4>
              <Badge className="bg-red-100 text-red-700 border-red-200 text-xs ml-1">{VIOLATIONS.length}</Badge>
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs">
              <Icon name="Download" size={12} className="mr-1" />
              Экспорт
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Наряд', 'Клиент', 'Политика', 'Метрика', 'Просрочка', 'Инженер', 'Причина'].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {VIOLATIONS.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 font-medium text-blue-600 whitespace-nowrap">{v.orderNum}</td>
                    <td className="px-3 py-2 text-gray-700 whitespace-nowrap">{v.client}</td>
                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap max-w-[140px] truncate" title={v.policy}>{v.policy}</td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${METRIC_COLORS[v.metric]}`}>{v.metric}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-red-600 font-medium">+{v.overdueHours.toFixed(1)}ч</span>
                    </td>
                    <td className="px-3 py-2 text-gray-700 whitespace-nowrap">{v.engineer}</td>
                    <td className="px-3 py-2 text-gray-500 max-w-[180px] truncate" title={v.reason}>{v.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SLAPolicyFull;
