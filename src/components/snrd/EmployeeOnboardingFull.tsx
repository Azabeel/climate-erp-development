import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

type TaskGroup = 'Документы' | 'Доступы' | 'Обучение' | 'Оборудование' | 'Знакомство';

interface OnboardingTask {
  id: string;
  group: TaskGroup;
  title: string;
  deadline: string;
  completed: boolean;
}

interface Employee {
  id: string;
  name: string;
  position: string;
  dayNumber: number;
  progress: number;
  mentor: string;
  startDate: string;
  avatarColor: string;
  initials: string;
}

interface TimelineEvent {
  day: number;
  label: string;
  icon: string;
  done: boolean;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const EMPLOYEES: Employee[] = [
  {
    id: 'e1',
    name: 'Алексей Новиков',
    position: 'Инженер',
    dayNumber: 3,
    progress: 18,
    mentor: 'Смирнов В.',
    startDate: '14.05.2026',
    avatarColor: 'bg-blue-500',
    initials: 'АН',
  },
  {
    id: 'e2',
    name: 'Мария Козлова',
    position: 'Диспетчер',
    dayNumber: 12,
    progress: 62,
    mentor: 'Иванова Т.',
    startDate: '05.05.2026',
    avatarColor: 'bg-violet-500',
    initials: 'МК',
  },
  {
    id: 'e3',
    name: 'Дмитрий Орлов',
    position: 'Монтажник',
    dayNumber: 7,
    progress: 35,
    mentor: 'Петров А.',
    startDate: '10.05.2026',
    avatarColor: 'bg-emerald-500',
    initials: 'ДО',
  },
  {
    id: 'e4',
    name: 'Иван Степанов',
    position: 'Инженер',
    dayNumber: 18,
    progress: 87,
    mentor: 'Смирнов В.',
    startDate: '29.04.2026',
    avatarColor: 'bg-orange-500',
    initials: 'ИС',
  },
];

const INITIAL_TASKS: OnboardingTask[] = [
  // Документы
  { id: 'd1', group: 'Документы', title: 'Оформить трудовой договор', deadline: 'День 1', completed: true },
  { id: 'd2', group: 'Документы', title: 'Предоставить копию ИНН', deadline: 'День 1', completed: true },
  { id: 'd3', group: 'Документы', title: 'Получить пропуск на объекты', deadline: 'День 2', completed: false },
  // Доступы
  { id: 'a1', group: 'Доступы', title: 'Создать аккаунт в ERP-системе', deadline: 'День 1', completed: true },
  { id: 'a2', group: 'Доступы', title: 'Подключить к корпоративному Telegram', deadline: 'День 1', completed: true },
  { id: 'a3', group: 'Доступы', title: 'Создать корпоративную почту', deadline: 'День 2', completed: false },
  // Обучение
  { id: 'l1', group: 'Обучение', title: 'Пройти курс «Основы климатических систем»', deadline: 'День 5', completed: false },
  { id: 'l2', group: 'Обучение', title: 'Пройти курс «Техника безопасности»', deadline: 'День 5', completed: false },
  { id: 'l3', group: 'Обучение', title: 'Пройти курс «Работа с ERP»', deadline: 'День 7', completed: false },
  // Оборудование
  { id: 'eq1', group: 'Оборудование', title: 'Получить набор инструментов', deadline: 'День 1', completed: true },
  { id: 'eq2', group: 'Оборудование', title: 'Получить корпоративный телефон', deadline: 'День 2', completed: false },
  { id: 'eq3', group: 'Оборудование', title: 'Получить ноутбук или планшет', deadline: 'День 3', completed: false },
  // Знакомство
  { id: 'k1', group: 'Знакомство', title: 'Встреча с командой и руководителем', deadline: 'День 1', completed: true },
  { id: 'k2', group: 'Знакомство', title: 'Первый выезд с ментором', deadline: 'День 10', completed: false },
  { id: 'k3', group: 'Знакомство', title: 'Экзамен для самостоятельной работы', deadline: 'День 18', completed: false },
];

const TIMELINE_EVENTS: TimelineEvent[] = [
  { day: 1,  label: 'Выход на работу',             icon: 'Briefcase',   done: true },
  { day: 3,  label: 'Получение оборудования',       icon: 'Wrench',      done: true },
  { day: 5,  label: 'Начало обучения в LMS',        icon: 'BookOpen',    done: false },
  { day: 10, label: 'Первый выезд с ментором',      icon: 'Car',         done: false },
  { day: 18, label: 'Сдача экзамена',               icon: 'ClipboardCheck', done: false },
  { day: 21, label: 'Самостоятельная работа',       icon: 'Star',        done: false },
];

const CHART_DATA = [
  { name: 'А. Новиков',  progress: 18 },
  { name: 'М. Козлова',  progress: 62 },
  { name: 'Д. Орлов',   progress: 35 },
  { name: 'И. Степанов', progress: 87 },
];

const GROUP_COLORS: Record<TaskGroup, string> = {
  Документы:   'bg-purple-100 text-purple-700',
  Доступы:     'bg-blue-100 text-blue-700',
  Обучение:    'bg-green-100 text-green-700',
  Оборудование:'bg-yellow-100 text-yellow-700',
  Знакомство:  'bg-orange-100 text-orange-700',
};

const TASK_GROUPS: TaskGroup[] = ['Документы', 'Доступы', 'Обучение', 'Оборудование', 'Знакомство'];

// ─── Component ────────────────────────────────────────────────────────────────

const EmployeeOnboardingFull = () => {
  const [selectedId, setSelectedId] = useState<string>('e1');
  const [tasks, setTasks] = useState<OnboardingTask[]>(INITIAL_TASKS);
  const [search, setSearch] = useState('');

  const selected = EMPLOYEES.find(e => e.id === selectedId) ?? EMPLOYEES[0];

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
    toast.success('Задача выполнена');
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  const filteredEmployees = EMPLOYEES.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.position.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-gray-50 min-h-0">
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <Icon name="UserPlus" size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Онбординг сотрудников</h1>
            <p className="text-sm text-gray-500">Адаптация и ввод в должность</p>
          </div>
        </div>
        <Button
          onClick={() => toast.success('Форма добавления нового сотрудника открыта')}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Icon name="UserPlus" size={16} className="mr-2" />
          Добавить в онбординг
        </Button>
      </div>

      {/* ── Metrics ── */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4 shrink-0">
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon name="Users" size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">4</p>
            <p className="text-xs text-gray-500">В онбординге</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Icon name="CheckCircle" size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">2</p>
            <p className="text-xs text-gray-500">Завершили (этот месяц)</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
            <Icon name="Clock" size={20} className="text-violet-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">18 дн</p>
            <p className="text-xs text-gray-500">Средний срок</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Icon name="BarChart2" size={20} className="text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">87%</p>
            <p className="text-xs text-gray-500">Задач выполнено</p>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex gap-4 px-6 pb-6 flex-1 min-h-0 overflow-hidden">

        {/* ── Left panel: employee list (340px) ── */}
        <div className="w-[340px] shrink-0 flex flex-col gap-3">
          <Input
            placeholder="Поиск сотрудника..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-white"
          />
          <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1">
            {filteredEmployees.map(emp => (
              <button
                key={emp.id}
                onClick={() => setSelectedId(emp.id)}
                className={`w-full text-left bg-white border rounded-xl p-4 transition-all hover:shadow-md ${
                  selectedId === emp.id
                    ? 'border-blue-400 ring-1 ring-blue-300 shadow-sm'
                    : 'border-gray-200'
                }`}
              >
                {/* Avatar row */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${emp.avatarColor}`}>
                    {emp.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{emp.name}</p>
                    <p className="text-xs text-gray-500">{emp.position}</p>
                  </div>
                  <Badge className="ml-auto shrink-0 bg-blue-50 text-blue-700 border-blue-200 text-xs">
                    {emp.dayNumber}-й день
                  </Badge>
                </div>
                {/* Progress bar */}
                <div className="mb-1.5">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Прогресс</span>
                    <span className="font-medium text-gray-700">{emp.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${emp.progress}%`,
                        backgroundColor:
                          emp.progress >= 75
                            ? '#22c55e'
                            : emp.progress >= 40
                            ? '#f59e0b'
                            : '#3b82f6',
                      }}
                    />
                  </div>
                </div>
                {/* Mentor */}
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Icon name="UserCheck" size={12} />
                  <span>Ментор: {emp.mentor}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Center: checklist + timeline ── */}
        <div className="flex flex-col gap-4 flex-1 min-w-0 overflow-y-auto pr-1">

          {/* Employee header card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shrink-0">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0 ${selected.avatarColor}`}>
                {selected.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-gray-900">{selected.name}</h2>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                    {selected.position}
                  </Badge>
                  <Badge className="bg-gray-50 text-gray-600 border-gray-200">
                    {selected.dayNumber}-й день
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Icon name="Calendar" size={13} />
                    Начало: {selected.startDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="UserCheck" size={13} />
                    Ментор: {selected.mentor}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-3xl font-bold text-gray-900">{selected.progress}%</p>
                <p className="text-xs text-gray-500">выполнено</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${selected.progress}%`,
                    backgroundColor:
                      selected.progress >= 75
                        ? '#22c55e'
                        : selected.progress >= 40
                        ? '#f59e0b'
                        : '#3b82f6',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Icon name="ClipboardList" size={16} className="text-blue-600" />
                Задачи онбординга
              </h3>
              <span className="text-sm text-gray-500">
                {completedCount}/{totalCount} выполнено
              </span>
            </div>

            <div className="space-y-4">
              {TASK_GROUPS.map(group => {
                const groupTasks = tasks.filter(t => t.group === group);
                return (
                  <div key={group}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${GROUP_COLORS[group]}`}>
                        {group}
                      </span>
                      <span className="text-xs text-gray-400">
                        {groupTasks.filter(t => t.completed).length}/{groupTasks.length}
                      </span>
                    </div>
                    <div className="space-y-1.5 pl-1">
                      {groupTasks.map(task => (
                        <div
                          key={task.id}
                          className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                            task.completed
                              ? 'bg-gray-50 border-gray-100'
                              : 'bg-white border-gray-200 hover:border-blue-200'
                          }`}
                        >
                          <button
                            onClick={() => toggleTask(task.id)}
                            className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-colors ${
                              task.completed
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-300 hover:border-blue-500'
                            }`}
                          >
                            {task.completed && (
                              <Icon name="Check" size={12} className="text-white" />
                            )}
                          </button>
                          <span
                            className={`flex-1 text-sm ${
                              task.completed
                                ? 'line-through text-gray-400'
                                : 'text-gray-800'
                            }`}
                          >
                            {task.title}
                          </span>
                          <span className="text-xs text-gray-400 shrink-0">
                            {task.deadline}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shrink-0">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-5">
              <Icon name="GitBranch" size={16} className="text-violet-600" />
              Timeline онбординга
            </h3>
            <div className="relative pl-8">
              {/* Vertical line */}
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200" />
              <div className="space-y-5">
                {TIMELINE_EVENTS.map((event, idx) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    {/* Dot */}
                    <div
                      className={`absolute -left-8 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        event.done
                          ? 'bg-green-500 border-green-500'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      {event.done ? (
                        <Icon name="Check" size={12} className="text-white" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-300" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          День {event.day}
                        </span>
                        {event.done && (
                          <Badge className="bg-green-50 text-green-700 border-green-200 text-xs py-0">
                            Выполнено
                          </Badge>
                        )}
                      </div>
                      <p className={`text-sm font-medium mt-0.5 ${event.done ? 'text-gray-500' : 'text-gray-900'}`}>
                        {event.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right panel: chart ── */}
        <div className="w-64 shrink-0 flex flex-col gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex-1">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2 mb-4">
              <Icon name="BarChart2" size={15} className="text-blue-600" />
              Прогресс команды
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={CHART_DATA}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={(v: number) => `${v}%`}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  width={80}
                />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, 'Прогресс']}
                />
                <Bar dataKey="progress" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="mt-4 space-y-2">
              {CHART_DATA.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 truncate">{item.name}</span>
                  <span
                    className={`font-semibold ${
                      item.progress >= 75
                        ? 'text-green-600'
                        : item.progress >= 40
                        ? 'text-yellow-600'
                        : 'text-blue-600'
                    }`}
                  >
                    {item.progress}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shrink-0">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Статистика задач</h3>
            <div className="space-y-2">
              {TASK_GROUPS.map(group => {
                const groupTasks = tasks.filter(t => t.group === group);
                const done = groupTasks.filter(t => t.completed).length;
                const pct = Math.round((done / groupTasks.length) * 100);
                return (
                  <div key={group}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-gray-600">{group}</span>
                      <span className="text-gray-500">{done}/{groupTasks.length}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EmployeeOnboardingFull;
