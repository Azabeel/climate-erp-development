import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type TriggerKey =
  | 'wo_created'
  | 'status_changed'
  | 'schedule'
  | 'sla_breach'
  | 'new_client'
  | 'parts_received';

type ActionKey =
  | 'send_notification'
  | 'assign_engineer'
  | 'create_task'
  | 'update_status'
  | 'send_sms'
  | 'create_wo'
  | 'add_to_crm'
  | 'http_request';

interface LibraryItem {
  key: TriggerKey | ActionKey;
  label: string;
  icon: string;
  color: string;
}

interface ConditionBlock {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface ActionBlock {
  id: string;
  key: ActionKey;
  label: string;
  icon: string;
  params: Record<string, string>;
}

interface Automation {
  id: string;
  name: string;
  enabled: boolean;
  trigger: TriggerKey;
  triggerLabel: string;
  triggerIcon: string;
  conditions: ConditionBlock[];
  actions: ActionBlock[];
  runsThisMonth: number;
  successRate: number;
  errors: number;
}

// ─────────────────────────────────────────────
// Static data
// ─────────────────────────────────────────────

const TRIGGERS: LibraryItem[] = [
  { key: 'wo_created',     label: 'При создании наряда',   icon: 'FilePlus',      color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { key: 'status_changed', label: 'При смене статуса',     icon: 'RefreshCw',     color: 'bg-violet-100 text-violet-700 border-violet-300' },
  { key: 'schedule',       label: 'По расписанию (cron)',  icon: 'Clock',         color: 'bg-sky-100 text-sky-700 border-sky-300' },
  { key: 'sla_breach',     label: 'При нарушении SLA',     icon: 'AlertTriangle', color: 'bg-red-100 text-red-700 border-red-300' },
  { key: 'new_client',     label: 'Новый клиент',          icon: 'UserPlus',      color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { key: 'parts_received', label: 'Поступление ЗИП',       icon: 'Package',       color: 'bg-amber-100 text-amber-700 border-amber-300' },
];

const ACTIONS: LibraryItem[] = [
  { key: 'send_notification', label: 'Отправить уведомление', icon: 'Bell',        color: 'bg-green-100 text-green-700 border-green-300' },
  { key: 'assign_engineer',   label: 'Назначить инженера',    icon: 'UserCheck',   color: 'bg-teal-100 text-teal-700 border-teal-300' },
  { key: 'create_task',       label: 'Создать задачу',         icon: 'CheckSquare', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
  { key: 'update_status',     label: 'Обновить статус',        icon: 'Tag',         color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
  { key: 'send_sms',          label: 'Отправить SMS',          icon: 'MessageSquare', color: 'bg-lime-100 text-lime-700 border-lime-300' },
  { key: 'create_wo',         label: 'Создать наряд',          icon: 'FileText',    color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { key: 'add_to_crm',        label: 'Добавить в CRM',         icon: 'Briefcase',   color: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300' },
  { key: 'http_request',      label: 'HTTP запрос',            icon: 'Globe',       color: 'bg-slate-100 text-slate-700 border-slate-300' },
];

const TRIGGER_MAP = Object.fromEntries(TRIGGERS.map((t) => [t.key, t])) as Record<TriggerKey, LibraryItem>;
const ACTION_MAP  = Object.fromEntries(ACTIONS.map((a) => [a.key, a]))  as Record<ActionKey,  LibraryItem>;

const INITIAL_AUTOMATIONS: Automation[] = [
  {
    id: 'a1',
    name: 'SLA Alert',
    enabled: true,
    trigger: 'sla_breach',
    triggerLabel: 'При нарушении SLA',
    triggerIcon: 'AlertTriangle',
    conditions: [{ id: 'c1', field: 'sla.remaining_pct', operator: '>', value: '80' }],
    actions: [
      { id: 'ac1', key: 'send_notification', label: 'Отправить уведомление', icon: 'Bell',
        params: { recipient: 'Диспетчер', channel: 'Telegram', message: 'TTR > 80% по наряду {wo_number}' } },
    ],
    runsThisMonth: 43,
    successRate: 97,
    errors: 1,
  },
  {
    id: 'a2',
    name: 'New Work Order',
    enabled: true,
    trigger: 'wo_created',
    triggerLabel: 'При создании наряда',
    triggerIcon: 'FilePlus',
    conditions: [],
    actions: [
      { id: 'ac2', key: 'send_sms', label: 'Отправить SMS', icon: 'MessageSquare',
        params: { recipient: '{{client.phone}}', message: 'Заявка #{wo_number} принята. Инженер свяжется в ближайшее время.' } },
    ],
    runsThisMonth: 312,
    successRate: 99,
    errors: 3,
  },
  {
    id: 'a3',
    name: 'Parts Received',
    enabled: true,
    trigger: 'parts_received',
    triggerLabel: 'Поступление ЗИП',
    triggerIcon: 'Package',
    conditions: [{ id: 'c2', field: 'item.linked_wo', operator: '!=', value: 'null' }],
    actions: [
      { id: 'ac3', key: 'create_task', label: 'Создать задачу', icon: 'CheckSquare',
        params: { assignee: '{{wo.engineer}}', title: 'ЗИП получен — запланировать выезд', priority: 'Высокий' } },
    ],
    runsThisMonth: 89,
    successRate: 100,
    errors: 0,
  },
  {
    id: 'a4',
    name: 'Monthly Report',
    enabled: false,
    trigger: 'schedule',
    triggerLabel: 'По расписанию (cron)',
    triggerIcon: 'Clock',
    conditions: [],
    actions: [
      { id: 'ac4', key: 'send_notification', label: 'Отправить уведомление', icon: 'Bell',
        params: { recipient: 'Руководитель', channel: 'Email', message: 'Еженедельный отчёт (пятница 18:00)' } },
    ],
    runsThisMonth: 4,
    successRate: 100,
    errors: 0,
  },
];

// ─────────────────────────────────────────────
// Small helpers
// ─────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// ─────────────────────────────────────────────
// WorkflowCard
// ─────────────────────────────────────────────

interface WorkflowCardProps {
  automation: Automation;
  onToggle: (id: string) => void;
  onEdit: (automation: Automation) => void;
  onDuplicate: (automation: Automation) => void;
  onDelete: (id: string) => void;
}

function WorkflowCard({ automation, onToggle, onEdit, onDuplicate, onDelete }: WorkflowCardProps) {
  const triggerInfo = TRIGGER_MAP[automation.trigger];

  return (
    <div className={`bg-white rounded-xl border-2 p-4 transition-all duration-200 ${automation.enabled ? 'border-gray-200 shadow-sm' : 'border-dashed border-gray-200 opacity-60'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${automation.enabled ? 'bg-blue-50' : 'bg-gray-100'}`}>
            <Icon name={automation.triggerIcon} size={16} className={automation.enabled ? 'text-blue-600' : 'text-gray-400'} />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{automation.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {automation.runsThisMonth} запусков · {automation.successRate}% успешных
            </p>
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={() => onToggle(automation.id)}
          className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${automation.enabled ? 'bg-blue-500' : 'bg-gray-300'}`}
          title={automation.enabled ? 'Выключить' : 'Включить'}
        >
          <span
            className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${automation.enabled ? 'translate-x-5' : 'translate-x-1'}`}
          />
        </button>
      </div>

      {/* Chain: Trigger → [Condition] → Action */}
      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        {/* Trigger */}
        {triggerInfo && (
          <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${triggerInfo.color}`}>
            <Icon name={triggerInfo.icon} size={12} />
            <span>{triggerInfo.label}</span>
          </div>
        )}

        {/* Arrow */}
        <Icon name="ChevronRight" size={14} className="text-gray-300 shrink-0" />

        {/* Conditions */}
        {automation.conditions.length > 0 && (
          <>
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border bg-amber-50 border-amber-200 text-xs font-medium text-amber-700">
              <Icon name="Filter" size={12} />
              <span>
                {automation.conditions.length === 1
                  ? `${automation.conditions[0].field} ${automation.conditions[0].operator} ${automation.conditions[0].value}`
                  : `${automation.conditions.length} условия`}
              </span>
            </div>
            <Icon name="ChevronRight" size={14} className="text-gray-300 shrink-0" />
          </>
        )}

        {/* Actions */}
        {automation.actions.map((act, i) => {
          const info = ACTION_MAP[act.key];
          return (
            <div key={act.id} className="flex items-center gap-1">
              {i > 0 && <Icon name="ChevronRight" size={14} className="text-gray-300 shrink-0" />}
              <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${info?.color ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                <Icon name={act.icon} size={12} />
                <span>{act.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
        {automation.errors > 0 && (
          <span className="flex items-center gap-1 text-red-500">
            <Icon name="XCircle" size={12} />
            {automation.errors} ошибок
          </span>
        )}
        <Badge variant={automation.enabled ? 'default' : 'secondary'} className="text-xs py-0">
          {automation.enabled ? 'Активна' : 'Выключена'}
        </Badge>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onEdit(automation)}>
          <Icon name="Pencil" size={12} />
          Редактировать
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onDuplicate(automation)}>
          <Icon name="Copy" size={12} />
          Дублировать
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-500 hover:text-red-600 hover:border-red-300 ml-auto" onClick={() => onDelete(automation.id)}>
          <Icon name="Trash2" size={12} />
          Удалить
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LibraryPanel
// ─────────────────────────────────────────────

interface LibraryPanelProps {
  onAdd: (item: LibraryItem, type: 'trigger' | 'action') => void;
}

function LibraryPanel({ onAdd }: LibraryPanelProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const renderSection = (title: string, items: LibraryItem[], type: 'trigger' | 'action') => (
    <div className="mb-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2 px-1">{title}</p>
      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <div
            key={item.key}
            className="group relative flex items-center gap-2 px-2.5 py-2 rounded-lg border border-transparent hover:border-gray-200 hover:bg-gray-50 cursor-default transition-all"
            onMouseEnter={() => setHoveredKey(item.key)}
            onMouseLeave={() => setHoveredKey(null)}
          >
            <div className={`w-6 h-6 rounded-md flex items-center justify-center border text-xs ${item.color}`}>
              <Icon name={item.icon} size={12} />
            </div>
            <span className="text-xs text-gray-700 leading-tight flex-1">{item.label}</span>
            {hoveredKey === item.key && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded text-[10px] font-semibold px-1.5 py-0.5 transition-colors"
                onClick={() => onAdd(item, type)}
              >
                + Добавить
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-60 shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-800">Библиотека</h2>
        <p className="text-xs text-gray-400 mt-0.5">Перетащите на холст</p>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {renderSection('Триггеры', TRIGGERS, 'trigger')}
        {renderSection('Действия', ACTIONS, 'action')}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Editor panel
// ─────────────────────────────────────────────

interface EditorPanelProps {
  automation: Automation;
  onChange: (updated: Automation) => void;
  onClose: () => void;
}

function EditorPanel({ automation, onChange, onClose }: EditorPanelProps) {
  const [draft, setDraft] = useState<Automation>({ ...automation });

  const updateField = (key: keyof Automation, value: unknown) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const addCondition = () => {
    setDraft((prev) => ({
      ...prev,
      conditions: [...prev.conditions, { id: uid(), field: 'sla.remaining_pct', operator: '>', value: '80' }],
    }));
  };

  const removeCondition = (id: string) => {
    setDraft((prev) => ({ ...prev, conditions: prev.conditions.filter((c) => c.id !== id) }));
  };

  const updateCondition = (id: string, key: keyof ConditionBlock, value: string) => {
    setDraft((prev) => ({
      ...prev,
      conditions: prev.conditions.map((c) => (c.id === id ? { ...c, [key]: value } : c)),
    }));
  };

  const updateActionParam = (actionId: string, paramKey: string, value: string) => {
    setDraft((prev) => ({
      ...prev,
      actions: prev.actions.map((a) =>
        a.id === actionId ? { ...a, params: { ...a.params, [paramKey]: value } } : a,
      ),
    }));
  };

  const removeAction = (id: string) => {
    setDraft((prev) => ({ ...prev, actions: prev.actions.filter((a) => a.id !== id) }));
  };

  const handleSave = () => {
    onChange(draft);
    toast.success('Автоматизация сохранена', { description: draft.name });
    onClose();
  };

  const handleTest = () => {
    toast.info('Тестовый запуск', { description: `Запущена автоматизация «${draft.name}»` });
  };

  const triggerOptions = TRIGGERS.map((t) => ({ value: t.key, label: t.label }));

  return (
    <div className="w-80 shrink-0 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-800">Редактор</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <Icon name="X" size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Название</label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={draft.name}
            onChange={(e) => updateField('name', e.target.value)}
          />
        </div>

        {/* Trigger */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Триггер</label>
          <select
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
            value={draft.trigger}
            onChange={(e) => {
              const t = TRIGGER_MAP[e.target.value as TriggerKey];
              updateField('trigger', e.target.value as TriggerKey);
              if (t) {
                updateField('triggerLabel', t.label);
                updateField('triggerIcon', t.icon);
              }
            }}
          >
            {triggerOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Conditions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-600">Условия (если)</label>
            <button
              onClick={addCondition}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              <Icon name="Plus" size={12} />
              Добавить
            </button>
          </div>

          {draft.conditions.length === 0 && (
            <p className="text-xs text-gray-400 italic">Нет условий — выполняется всегда</p>
          )}

          <div className="space-y-2">
            {draft.conditions.map((cond) => (
              <div key={cond.id} className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5">
                <input
                  className="flex-1 min-w-0 bg-transparent text-xs border-b border-amber-200 focus:outline-none"
                  placeholder="поле"
                  value={cond.field}
                  onChange={(e) => updateCondition(cond.id, 'field', e.target.value)}
                />
                <select
                  className="bg-transparent text-xs border-b border-amber-200 focus:outline-none"
                  value={cond.operator}
                  onChange={(e) => updateCondition(cond.id, 'operator', e.target.value)}
                >
                  {['>', '<', '>=', '<=', '=', '!='].map((op) => <option key={op}>{op}</option>)}
                </select>
                <input
                  className="w-14 bg-transparent text-xs border-b border-amber-200 focus:outline-none"
                  placeholder="значение"
                  value={cond.value}
                  onChange={(e) => updateCondition(cond.id, 'value', e.target.value)}
                />
                <button onClick={() => removeCondition(cond.id)} className="text-amber-400 hover:text-red-500 ml-1">
                  <Icon name="X" size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Действия</label>

          {draft.actions.length === 0 && (
            <p className="text-xs text-gray-400 italic">Добавьте действие из библиотеки</p>
          )}

          <div className="space-y-3">
            {draft.actions.map((act) => {
              const info = ACTION_MAP[act.key];
              return (
                <div key={act.id} className={`rounded-lg border p-3 ${info?.color ?? 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Icon name={act.icon} size={13} />
                      <span className="text-xs font-medium">{act.label}</span>
                    </div>
                    <button onClick={() => removeAction(act.id)} className="opacity-60 hover:opacity-100">
                      <Icon name="X" size={12} />
                    </button>
                  </div>
                  {Object.entries(act.params).map(([pKey, pVal]) => (
                    <div key={pKey} className="mt-1.5">
                      <label className="block text-[10px] uppercase tracking-wide text-current opacity-60 mb-0.5">{pKey}</label>
                      <input
                        className="w-full bg-white/60 border border-current/20 rounded px-2 py-1 text-xs focus:outline-none"
                        value={pVal}
                        onChange={(e) => updateActionParam(act.id, pKey, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-4 py-3 flex gap-2">
        <Button size="sm" variant="outline" className="flex-1 gap-1 h-8 text-xs" onClick={handleTest}>
          <Icon name="Play" size={12} />
          Тест
        </Button>
        <Button size="sm" className="flex-1 gap-1 h-8 text-xs" onClick={handleSave}>
          <Icon name="Save" size={12} />
          Сохранить
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Stats bar
// ─────────────────────────────────────────────

interface StatsBarProps {
  automations: Automation[];
}

function StatsBar({ automations }: StatsBarProps) {
  const activeCount    = automations.filter((a) => a.enabled).length;
  const totalRuns      = automations.reduce((s, a) => s + a.runsThisMonth, 0);
  const totalErrors    = automations.reduce((s, a) => s + a.errors, 0);
  const avgSuccess     = automations.length
    ? Math.round(automations.reduce((s, a) => s + a.successRate, 0) / automations.length)
    : 0;

  const stats = [
    { label: 'Активных автоматизаций', value: activeCount,  icon: 'Zap',         color: 'text-blue-600',  bg: 'bg-blue-50' },
    { label: 'Выполнений за месяц',    value: totalRuns,    icon: 'BarChart2',    color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Успешных, %',            value: `${avgSuccess}%`, icon: 'CheckCircle', color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Ошибок',                 value: totalErrors,  icon: 'XCircle',      color: 'text-red-500',   bg: 'bg-red-50' },
  ];

  return (
    <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
              <Icon name={s.icon} size={16} className={s.color} />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900 leading-none">{s.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export default function WorkflowBuilderNew() {
  const [automations, setAutomations] = useState<Automation[]>(INITIAL_AUTOMATIONS);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingAutomation = automations.find((a) => a.id === editingId) ?? null;

  // Library add handler — adds trigger or first action stub to a new automation
  const handleLibraryAdd = (item: LibraryItem, type: 'trigger' | 'action') => {
    if (type === 'trigger') {
      const newAuto: Automation = {
        id: uid(),
        name: `Новая автоматизация — ${item.label}`,
        enabled: false,
        trigger: item.key as TriggerKey,
        triggerLabel: item.label,
        triggerIcon: item.icon,
        conditions: [],
        actions: [],
        runsThisMonth: 0,
        successRate: 100,
        errors: 0,
      };
      setAutomations((prev) => [newAuto, ...prev]);
      setEditingId(newAuto.id);
      toast.success('Создана новая автоматизация', { description: `Триггер: ${item.label}` });
    } else {
      // Add action to currently editing automation, or create new one
      if (editingId) {
        setAutomations((prev) =>
          prev.map((a) =>
            a.id === editingId
              ? {
                  ...a,
                  actions: [
                    ...a.actions,
                    { id: uid(), key: item.key as ActionKey, label: item.label, icon: item.icon, params: { recipient: '', message: '' } },
                  ],
                }
              : a,
          ),
        );
        toast.info(`Действие добавлено: ${item.label}`);
      } else {
        toast.info('Сначала откройте автоматизацию для редактирования');
      }
    }
  };

  const handleToggle = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
    );
  };

  const handleEdit = (automation: Automation) => {
    setEditingId(automation.id);
  };

  const handleDuplicate = (automation: Automation) => {
    const copy: Automation = {
      ...automation,
      id: uid(),
      name: `${automation.name} (копия)`,
      enabled: false,
      runsThisMonth: 0,
      errors: 0,
    };
    setAutomations((prev) => {
      const idx = prev.findIndex((a) => a.id === automation.id);
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
    toast.success('Автоматизация дублирована', { description: copy.name });
  };

  const handleDelete = (id: string) => {
    setAutomations((prev) => prev.filter((a) => a.id !== id));
    if (editingId === id) setEditingId(null);
    toast.error('Автоматизация удалена');
  };

  const handleSaveEdit = (updated: Automation) => {
    setAutomations((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const handleNewAutomation = () => {
    const newAuto: Automation = {
      id: uid(),
      name: 'Новая автоматизация',
      enabled: false,
      trigger: 'wo_created',
      triggerLabel: 'При создании наряда',
      triggerIcon: 'FilePlus',
      conditions: [],
      actions: [],
      runsThisMonth: 0,
      successRate: 100,
      errors: 0,
    };
    setAutomations((prev) => [newAuto, ...prev]);
    setEditingId(newAuto.id);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Icon name="Workflow" size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900">Конструктор автоматизаций</h1>
            <p className="text-xs text-gray-400">АСУ СЦ «Сервис Климат» — Workflow Builder</p>
          </div>
        </div>
        <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={handleNewAutomation}>
          <Icon name="Plus" size={13} />
          Новая автоматизация
        </Button>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: library */}
        <LibraryPanel onAdd={handleLibraryAdd} />

        {/* Center: canvas */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {automations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Icon name="Workflow" size={40} className="mb-3 opacity-30" />
              <p className="text-sm">Нет автоматизаций. Создайте первую.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 max-w-4xl">
              {automations.map((auto) => (
                <WorkflowCard
                  key={auto.id}
                  automation={auto}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: editor (conditional) */}
        {editingAutomation && (
          <EditorPanel
            automation={editingAutomation}
            onChange={handleSaveEdit}
            onClose={() => setEditingId(null)}
          />
        )}
      </div>

      {/* Bottom: stats */}
      <StatsBar automations={automations} />
    </div>
  );
}
