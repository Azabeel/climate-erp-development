import { useState } from 'react';
import { Plus, Play, Pause, ChevronRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface WorkflowStep {
  id: string;
  type: 'trigger' | 'condition' | 'action';
  label: string;
  icon: string;
  config: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft';
  runsCount: number;
  lastRun?: string;
  steps: WorkflowStep[];
}

const WORKFLOWS: Workflow[] = [
  {
    id: 'wf1', name: 'Уведомление клиента о выезде', status: 'active', runsCount: 847, lastRun: '10 мин назад',
    description: 'Автоматическое SMS/Telegram при смене статуса наряда на "В пути"',
    steps: [
      { id: 's1', type: 'trigger', label: 'Смена статуса', icon: 'Zap', config: 'Статус: Назначен → В пути' },
      { id: 's2', type: 'action', label: 'Отправить SMS', icon: 'MessageSquare', config: '«Инженер {name} выехал, ~{eta} мин»' },
      { id: 's3', type: 'action', label: 'Отправить Telegram', icon: 'MessageSquare', config: 'Дублирование в Telegram' },
    ],
  },
  {
    id: 'wf2', name: 'Напоминание о ТО', status: 'active', runsCount: 234, lastRun: '1 день назад',
    description: 'Напоминание клиентам за 30 дней до планового ТО',
    steps: [
      { id: 's1', type: 'trigger', label: 'Расписание', icon: 'Zap', config: 'Ежедневно в 09:00' },
      { id: 's2', type: 'condition', label: 'Проверить дату', icon: 'GitBranch', config: 'Дней до ТО ≤ 30' },
      { id: 's3', type: 'action', label: 'Email клиенту', icon: 'Mail', config: 'Шаблон: напоминание_то' },
    ],
  },
  {
    id: 'wf3', name: 'Эскалация нарушения SLA', status: 'active', runsCount: 12, lastRun: '3 дня назад',
    description: 'Уведомление руководителя при критическом нарушении SLA',
    steps: [
      { id: 's1', type: 'trigger', label: 'SLA нарушен', icon: 'Zap', config: 'Статус SLA: RED' },
      { id: 's2', type: 'action', label: 'Уведомить руководителя', icon: 'Bell', config: 'Push + Telegram руководителю' },
      { id: 's3', type: 'action', label: 'Создать задачу', icon: 'Zap', config: 'Задача: срочное реагирование' },
    ],
  },
  {
    id: 'wf4', name: 'Win-back кампания', status: 'paused', runsCount: 45, lastRun: '2 недели назад',
    description: 'Предложение скидки клиентам без заявок >90 дней',
    steps: [
      { id: 's1', type: 'trigger', label: 'Расписание', icon: 'Zap', config: 'Еженедельно в пн' },
      { id: 's2', type: 'condition', label: 'Последняя заявка', icon: 'GitBranch', config: 'Дней без заявок ≥ 90' },
      { id: 's3', type: 'action', label: 'Email со скидкой', icon: 'Mail', config: 'Скидка 10% на следующий ТО' },
    ],
  },
];

const STEP_COLORS: Record<string, string> = {
  trigger: 'bg-blue-100 border-blue-300 text-blue-800',
  condition: 'bg-amber-100 border-amber-300 text-amber-800',
  action: 'bg-green-100 border-green-300 text-green-800',
};

const STEP_LABELS: Record<string, string> = {
  trigger: 'Триггер',
  condition: 'Условие',
  action: 'Действие',
};

const WorkflowBuilder = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>(WORKFLOWS);
  const [selected, setSelected] = useState<Workflow | null>(WORKFLOWS[0]);

  const toggleStatus = (id: string) => {
    setWorkflows(wfs => wfs.map(wf => wf.id === id
      ? { ...wf, status: wf.status === 'active' ? 'paused' : 'active' }
      : wf));
    if (selected?.id === id) {
      setSelected(wf => wf ? { ...wf, status: wf.status === 'active' ? 'paused' : 'active' } : null);
    }
    toast.success('Статус автоматизации изменён');
  };

  const getStatusBadge = (status: Workflow['status']) => ({
    active: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    draft: 'bg-gray-100 text-gray-600',
  }[status]);

  const getStatusLabel = (status: Workflow['status']) => ({
    active: 'Активна',
    paused: 'Приостановлена',
    draft: 'Черновик',
  }[status]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Zap size={28} className="text-yellow-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Автоматизации</h2>
            <p className="text-gray-600 mt-0.5">Конструктор бизнес-процессов и триггеров</p>
          </div>
        </div>
        <Button onClick={() => toast.info('Создание новой автоматизации')}>
          <Plus size={16} className="mr-2" /> Новая автоматизация
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-2xl font-bold text-green-700">{workflows.filter(w => w.status === 'active').length}</p>
          <p className="text-sm text-green-600">Активных автоматизаций</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-2xl font-bold text-blue-700">{workflows.reduce((s, w) => s + w.runsCount, 0).toLocaleString('ru-RU')}</p>
          <p className="text-sm text-blue-600">Всего запусков</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-2xl font-bold text-purple-700">~12 ч</p>
          <p className="text-sm text-purple-600">Сэкономлено времени/неделю</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Workflow list */}
        <div className="w-80 shrink-0">
          <div className="space-y-2">
            {workflows.map(wf => (
              <div
                key={wf.id}
                onClick={() => setSelected(wf)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${selected?.id === wf.id ? 'border-blue-400 bg-blue-50 shadow' : 'border-gray-200 bg-white hover:shadow-sm'}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 text-sm leading-tight flex-1 mr-2">{wf.name}</h4>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full shrink-0 ${getStatusBadge(wf.status)}`}>{getStatusLabel(wf.status)}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{wf.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{wf.runsCount} запусков</span>
                  {wf.lastRun && <span>{wf.lastRun}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow detail */}
        {selected && (
          <div className="flex-1">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-5 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{selected.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{selected.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => toggleStatus(selected.id)}>
                    {selected.status === 'active' ? <><Pause size={14} className="mr-1" /> Пауза</> : <><Play size={14} className="mr-1" /> Запустить</>}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toast.info('Редактирование автоматизации')}>
                    Редактировать
                  </Button>
                </div>
              </div>

              <div className="p-5">
                <h4 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">Шаги автоматизации</h4>
                <div className="flex items-start gap-2">
                  {selected.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <div className={`rounded-lg border p-4 w-48 ${STEP_COLORS[step.type]}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold uppercase">{STEP_LABELS[step.type]}</span>
                        </div>
                        <p className="font-semibold text-sm">{step.label}</p>
                        <p className="text-xs mt-1 opacity-75">{step.config}</p>
                      </div>
                      {index < selected.steps.length - 1 && (
                        <ChevronRight size={20} className="text-gray-400 mx-2 shrink-0" />
                      )}
                    </div>
                  ))}
                  <div className="flex items-center">
                    <ChevronRight size={20} className="text-gray-300 mx-2 shrink-0" />
                    <button
                      className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                      onClick={() => toast.info('Добавить шаг')}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-gray-100">
                  <h4 className="font-semibold text-gray-700 mb-3 text-sm">Статистика</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-gray-900">{selected.runsCount}</p>
                      <p className="text-xs text-gray-500">Запусков</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-green-700">99.2%</p>
                      <p className="text-xs text-gray-500">Успешных</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-blue-700">{selected.lastRun || '—'}</p>
                      <p className="text-xs text-gray-500">Последний запуск</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowBuilder;
