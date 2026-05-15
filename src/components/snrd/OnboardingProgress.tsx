import { useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

// ─── Types ────────────────────────────────────────────────────────────────────

type TaskStatus = 'completed' | 'in_progress' | 'pending';

interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDay: number;
  responsible: string;
}

interface OnboardingStage {
  id: string;
  title: string;
  tasks: OnboardingTask[];
}

interface Employee {
  id: string;
  name: string;
  position: string;
  startDate: string;
  mentor: string;
  progress: number; // 0-100
  stages: OnboardingStage[];
}

interface RadarMetric {
  subject: string;
  value: number;
  fullMark: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const buildStages = (
  docs: TaskStatus[],
  training: TaskStatus[],
  practice: TaskStatus[],
): OnboardingStage[] => [
  {
    id: 'stage-docs',
    title: 'Этап 1: Документы',
    tasks: [
      {
        id: 'd1',
        title: 'Подписать трудовой договор',
        description: 'Оформить все кадровые документы в HR-отделе',
        status: docs[0],
        dueDay: 1,
        responsible: 'HR-менеджер',
      },
      {
        id: 'd2',
        title: 'Ознакомиться с правилами ТБ',
        description: 'Инструктаж по технике безопасности и охране труда',
        status: docs[1],
        dueDay: 1,
        responsible: 'Инженер ОТиТБ',
      },
      {
        id: 'd3',
        title: 'Ознакомиться с регламентами компании',
        description: 'Корпоративные стандарты, нормативы выезда, дресс-код',
        status: docs[2],
        dueDay: 2,
        responsible: 'HR-менеджер',
      },
    ],
  },
  {
    id: 'stage-training',
    title: 'Этап 2: Обучение',
    tasks: [
      {
        id: 't1',
        title: 'Вводный курс LMS: Основы климатических систем',
        description: 'Теоретический курс по сплит-системам, VRF и вентиляции',
        status: training[0],
        dueDay: 5,
        responsible: 'Сотрудник',
      },
      {
        id: 't2',
        title: 'Инструктаж по мобильному приложению',
        description: 'Работа с приложением инженера: наряды, статусы, материалы',
        status: training[1],
        dueDay: 3,
        responsible: 'Наставник',
      },
      {
        id: 't3',
        title: 'Тренинг по диагностике неисправностей',
        description: 'Разбор типовых кодов ошибок и методов диагностики',
        status: training[2],
        dueDay: 7,
        responsible: 'Наставник',
      },
      {
        id: 't4',
        title: 'Тестирование — допуск к самостоятельной работе',
        description: 'Итоговый тест для подтверждения теоретических знаний',
        status: training[3],
        dueDay: 10,
        responsible: 'Сотрудник',
      },
    ],
  },
  {
    id: 'stage-practice',
    title: 'Этап 3: Практика',
    tasks: [
      {
        id: 'p1',
        title: 'Выезд с наставником (3 наряда)',
        description: 'Совместные выезды: наблюдение и помощь наставнику',
        status: practice[0],
        dueDay: 14,
        responsible: 'Наставник',
      },
      {
        id: 'p2',
        title: 'Первый самостоятельный выезд',
        description: 'Выполнение простого наряда под дистанционным контролем',
        status: practice[1],
        dueDay: 21,
        responsible: 'Сотрудник',
      },
    ],
  },
];

const EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    name: 'Новиков Андрей Сергеевич',
    position: 'Инженер-монтажник',
    startDate: '05.05.2026',
    mentor: 'Козлов М.И.',
    progress: 62,
    stages: buildStages(
      ['completed', 'completed', 'completed'],
      ['completed', 'completed', 'in_progress', 'pending'],
      ['pending', 'pending'],
    ),
  },
  {
    id: 'emp-2',
    name: 'Романова Елена Игоревна',
    position: 'Диспетчер',
    startDate: '12.05.2026',
    mentor: 'Иванов А.К.',
    progress: 37,
    stages: buildStages(
      ['completed', 'completed', 'in_progress'],
      ['completed', 'pending', 'pending', 'pending'],
      ['pending', 'pending'],
    ),
  },
  {
    id: 'emp-3',
    name: 'Захаров Дмитрий Павлович',
    position: 'Инженер-холодильщик',
    startDate: '14.05.2026',
    mentor: 'Петров С.А.',
    progress: 12,
    stages: buildStages(
      ['completed', 'in_progress', 'pending'],
      ['pending', 'pending', 'pending', 'pending'],
      ['pending', 'pending'],
    ),
  },
  {
    id: 'emp-4',
    name: 'Куликова Марина Вячеславовна',
    position: 'Менеджер по работе с клиентами',
    startDate: '15.05.2026',
    mentor: 'Смирнова О.Д.',
    progress: 0,
    stages: buildStages(
      ['pending', 'pending', 'pending'],
      ['pending', 'pending', 'pending', 'pending'],
      ['pending', 'pending'],
    ),
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getRadarData = (employee: Employee): RadarMetric[] => {
  const completedByArea = (tasks: OnboardingTask[]) =>
    tasks.filter((t) => t.status === 'completed').length;

  const docTasks = employee.stages[0]?.tasks ?? [];
  const trainingTasks = employee.stages[1]?.tasks ?? [];
  const practiceTasks = employee.stages[2]?.tasks ?? [];

  // Безопасность = ТБ-инструктаж (d2) + регламенты (d3)
  const safetyTasks = [docTasks[1], docTasks[2]].filter(Boolean);
  // Регламенты = регламенты (d3) + мобильное приложение (t2)
  const regulationTasks = [docTasks[2], trainingTasks[1]].filter(Boolean);

  const pct = (done: number, total: number) =>
    total === 0 ? 0 : Math.round((done / total) * 100);

  return [
    {
      subject: 'Документы',
      value: pct(completedByArea(docTasks), docTasks.length),
      fullMark: 100,
    },
    {
      subject: 'Теория',
      value: pct(completedByArea(trainingTasks), trainingTasks.length),
      fullMark: 100,
    },
    {
      subject: 'Практика',
      value: pct(completedByArea(practiceTasks), practiceTasks.length),
      fullMark: 100,
    },
    {
      subject: 'Безопасность',
      value: pct(completedByArea(safetyTasks), safetyTasks.length),
      fullMark: 100,
    },
    {
      subject: 'Регламенты',
      value: pct(completedByArea(regulationTasks), regulationTasks.length),
      fullMark: 100,
    },
  ];
};

const STATUS_CFG: Record<TaskStatus, { label: string; icon: string; cls: string; badgeCls: string }> = {
  completed: {
    label: 'Выполнено',
    icon: 'CheckCircle',
    cls: 'text-green-500',
    badgeCls: 'bg-green-100 text-green-700 border-green-200',
  },
  in_progress: {
    label: 'В процессе',
    icon: 'Clock',
    cls: 'text-blue-500',
    badgeCls: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  pending: {
    label: 'Ожидает',
    icon: 'Circle',
    cls: 'text-gray-400',
    badgeCls: 'bg-gray-100 text-gray-500 border-gray-200',
  },
};

const getStatusCategory = (progress: number): 'completed' | 'in_progress' | 'not_started' => {
  if (progress === 100) return 'completed';
  if (progress > 0) return 'in_progress';
  return 'not_started';
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface TaskRowProps {
  task: OnboardingTask;
}

const TaskRow = ({ task }: TaskRowProps) => {
  const cfg = STATUS_CFG[task.status];
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
        task.status === 'completed'
          ? 'bg-green-50 border-green-200'
          : task.status === 'in_progress'
          ? 'bg-blue-50 border-blue-200'
          : 'bg-white border-gray-200'
      }`}
    >
      <Icon name={cfg.icon} size={16} className={`mt-0.5 shrink-0 ${cfg.cls}`} />
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium leading-snug ${
            task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'
          }`}
        >
          {task.title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{task.description}</p>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
          <span>
            <Icon name="User" size={11} className="inline mr-1" />
            {task.responsible}
          </span>
          <span>
            <Icon name="Calendar" size={11} className="inline mr-1" />
            День {task.dueDay}
          </span>
        </div>
      </div>
      <span
        className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${cfg.badgeCls}`}
      >
        {cfg.label}
      </span>
    </div>
  );
};

interface StageBlockProps {
  stage: OnboardingStage;
  defaultOpen?: boolean;
}

const StageBlock = ({ stage, defaultOpen = false }: StageBlockProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const done = stage.tasks.filter((t) => t.status === 'completed').length;
  const total = stage.tasks.length;
  const inProgress = stage.tasks.some((t) => t.status === 'in_progress');

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          {done === total ? (
            <Icon name="Award" size={16} className="text-green-500" />
          ) : inProgress ? (
            <Icon name="Play" size={16} className="text-blue-500" />
          ) : (
            <Icon name="BookOpen" size={16} className="text-gray-400" />
          )}
          <span className="font-semibold text-sm text-gray-800">{stage.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            {done}/{total} задач
          </span>
          <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                done === total ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${total === 0 ? 0 : Math.round((done / total) * 100)}%` }}
            />
          </div>
          <Icon
            name={open ? 'ChevronDown' : 'ChevronRight'}
            size={16}
            className="text-gray-400"
          />
        </div>
      </button>
      {open && (
        <div className="p-3 space-y-2">
          {stage.tasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const OnboardingProgress = () => {
  const [selectedId, setSelectedId] = useState<string>(EMPLOYEES[0].id);

  const selected = EMPLOYEES.find((e) => e.id === selectedId) ?? EMPLOYEES[0];
  const radarData = getRadarData(selected);

  // Summary counts
  const totalCount = EMPLOYEES.length;
  const completedCount = EMPLOYEES.filter((e) => getStatusCategory(e.progress) === 'completed').length;
  const inProgressCount = EMPLOYEES.filter((e) => getStatusCategory(e.progress) === 'in_progress').length;
  const notStartedCount = EMPLOYEES.filter((e) => getStatusCategory(e.progress) === 'not_started').length;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Icon name="Award" size={22} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Прогресс онбординга</h2>
            <p className="text-sm text-gray-500">Отслеживание адаптации новых сотрудников</p>
          </div>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-gray-800">{totalCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Всего сотрудников</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-700">{completedCount}</p>
            <p className="text-xs text-green-600 mt-0.5">Завершили онбординг</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">{inProgressCount}</p>
            <p className="text-xs text-blue-600 mt-0.5">В процессе</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-orange-700">{notStartedCount}</p>
            <p className="text-xs text-orange-600 mt-0.5">Не начали</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Employee list */}
        <div className="w-72 shrink-0 border-r border-gray-200 bg-white flex flex-col">
          <div className="px-4 pt-4 pb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Новые сотрудники
            </p>
          </div>
          <ScrollArea className="flex-1 px-3 pb-3">
            <div className="space-y-2">
              {EMPLOYEES.map((emp) => {
                const isActive = emp.id === selectedId;
                const cat = getStatusCategory(emp.progress);
                const barColor =
                  cat === 'completed'
                    ? 'bg-green-500'
                    : cat === 'in_progress'
                    ? 'bg-blue-500'
                    : 'bg-gray-300';
                const statusLabel =
                  cat === 'completed'
                    ? 'Завершён'
                    : cat === 'in_progress'
                    ? 'В процессе'
                    : 'Не начат';
                const badgeCls =
                  cat === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : cat === 'in_progress'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-500';

                return (
                  <button
                    key={emp.id}
                    onClick={() => setSelectedId(emp.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isActive
                        ? 'border-blue-400 bg-blue-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <Icon name="User" size={15} className="text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 leading-snug truncate">
                          {emp.name.split(' ').slice(0, 2).join(' ')}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{emp.position}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${barColor}`}
                              style={{ width: `${emp.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-600 tabular-nums">
                            {emp.progress}%
                          </span>
                        </div>
                        <span
                          className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${badgeCls}`}
                        >
                          {statusLabel}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Detail panel */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="p-5 space-y-5">
              {/* Employee header */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <Icon name="User" size={24} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-gray-900">{selected.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {selected.position}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 flex-wrap">
                    <span>
                      <Icon name="Calendar" size={13} className="inline mr-1" />
                      Выход: {selected.startDate}
                    </span>
                    <span>
                      <Icon name="User" size={13} className="inline mr-1" />
                      Наставник: {selected.mentor}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          selected.progress === 100
                            ? 'bg-green-500'
                            : selected.progress > 0
                            ? 'bg-blue-500'
                            : 'bg-gray-300'
                        }`}
                        style={{ width: `${selected.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-700 tabular-nums w-10 text-right">
                      {selected.progress}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Radar chart */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="FileText" size={16} className="text-purple-500" />
                  <h4 className="font-semibold text-gray-800 text-sm">
                    Показатели готовности
                  </h4>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                    />
                    <Radar
                      name={selected.name}
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div className="grid grid-cols-5 gap-2 mt-1">
                  {radarData.map((m) => (
                    <div key={m.subject} className="text-center">
                      <p className="text-sm font-bold text-blue-600">{m.value}%</p>
                      <p className="text-xs text-gray-500 leading-tight">{m.subject}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stages */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon name="BookOpen" size={15} className="text-gray-500" />
                  <h4 className="font-semibold text-gray-800 text-sm">План онбординга</h4>
                </div>
                {selected.stages.map((stage, idx) => (
                  <StageBlock key={stage.id} stage={stage} defaultOpen={idx === 0} />
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default OnboardingProgress;
