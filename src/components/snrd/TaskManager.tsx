import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
type TaskPriority = 'low' | 'normal' | 'high' | 'critical';

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate: string;
  tags: string[];
  linkedOrderId?: string;
  comments: number;
  checklist: { text: string; done: boolean }[];
  createdAt: string;
}

const INITIAL_TASKS: Task[] = [
  { id: 'T01', title: 'Подготовить КП для ТЦ «Европа»', description: 'Составить коммерческое предложение на обслуживание 15 кондиционеров', status: 'in_progress', priority: 'high', assignee: 'Белова Н.', dueDate: '2026-05-17', tags: ['КП', 'CRM'], linkedOrderId: undefined, comments: 3, checklist: [{ text: 'Подсчитать объём работ', done: true }, { text: 'Запросить прайс у поставщика', done: true }, { text: 'Согласовать с руководством', done: false }], createdAt: '2026-05-13' },
  { id: 'T02', title: 'Проверить наличие запчастей для наряда WO-412', description: 'Нужен компрессор Daikin для VRV-системы', status: 'todo', priority: 'critical', assignee: 'Козлов Д.', dueDate: '2026-05-15', tags: ['склад', 'ЗИП'], linkedOrderId: 'WO-2026-000412', comments: 1, checklist: [{ text: 'Проверить наличие на центральном складе', done: false }, { text: 'Запросить у поставщика если нет', done: false }], createdAt: '2026-05-14' },
  { id: 'T03', title: 'Обучение нового инженера Захарова', description: 'Провести вводный инструктаж по безопасности и оборудованию', status: 'todo', priority: 'normal', assignee: 'Петров А.В.', dueDate: '2026-05-20', tags: ['HR', 'онбординг'], linkedOrderId: undefined, comments: 0, checklist: [{ text: 'Инструктаж по ТБ', done: false }, { text: 'Знакомство с оборудованием', done: false }, { text: 'Первый выезд под контролем', done: false }], createdAt: '2026-05-12' },
  { id: 'T04', title: 'Обновить прайс-лист', description: 'Цены на фреон выросли — обновить все позиции с хладагентами', status: 'review', priority: 'high', assignee: 'Сидорова А.', dueDate: '2026-05-16', tags: ['финансы', 'прайс'], linkedOrderId: undefined, comments: 5, checklist: [{ text: 'Получить новые цены от поставщиков', done: true }, { text: 'Обновить в системе', done: true }, { text: 'Согласовать с директором', done: false }], createdAt: '2026-05-11' },
  { id: 'T05', title: 'Интеграция с 1С', description: 'Настроить выгрузку актов выполненных работ в 1С:Бухгалтерию', status: 'todo', priority: 'normal', assignee: 'Морозов А.К.', dueDate: '2026-05-30', tags: ['IT', 'интеграция'], linkedOrderId: undefined, comments: 2, checklist: [{ text: 'Получить реквизиты API 1С', done: true }, { text: 'Написать интеграцию', done: false }, { text: 'Тестирование', done: false }], createdAt: '2026-05-10' },
  { id: 'T06', title: 'Отчёт за апрель для директора', description: 'Подготовить ежемесячный отчёт: выручка, наряды, SLA', status: 'done', priority: 'high', assignee: 'Белова Н.', dueDate: '2026-05-05', tags: ['отчёт', 'аналитика'], linkedOrderId: undefined, comments: 4, checklist: [{ text: 'Собрать данные', done: true }, { text: 'Визуализировать', done: true }, { text: 'Отправить директору', done: true }], createdAt: '2026-05-01' },
  { id: 'T07', title: 'Проверка SLA по договорам', description: 'Проверить все активные договоры на соответствие SLA за последний месяц', status: 'in_progress', priority: 'normal', assignee: 'Козлов Д.', dueDate: '2026-05-18', tags: ['SLA', 'договоры'], linkedOrderId: undefined, comments: 0, checklist: [{ text: 'Выгрузить список нарядов', done: true }, { text: 'Сопоставить с SLA', done: false }], createdAt: '2026-05-14' },
  { id: 'T08', title: 'Сертификация Новикова', description: 'Записать инженера Новикова на курсы Daikin VRV Level 2', status: 'todo', priority: 'low', assignee: 'Сидорова А.', dueDate: '2026-06-01', tags: ['HR', 'обучение'], linkedOrderId: undefined, comments: 1, checklist: [{ text: 'Найти ближайший курс', done: false }, { text: 'Записать и оплатить', done: false }], createdAt: '2026-05-12' },
];

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'todo', label: 'К выполнению', color: 'bg-gray-100' },
  { id: 'in_progress', label: 'В работе', color: 'bg-blue-50' },
  { id: 'review', label: 'На проверке', color: 'bg-yellow-50' },
  { id: 'done', label: 'Выполнено', color: 'bg-green-50' },
];

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; dot: string }> = {
  low: { label: 'Низкий', color: 'text-gray-500', dot: 'bg-gray-400' },
  normal: { label: 'Обычный', color: 'text-blue-600', dot: 'bg-blue-500' },
  high: { label: 'Высокий', color: 'text-orange-600', dot: 'bg-orange-500' },
  critical: { label: 'Критичный', color: 'text-red-600', dot: 'bg-red-500' },
};

const ASSIGNEES = ['Все', 'Белова Н.', 'Козлов Д.', 'Сидорова А.', 'Морозов А.К.', 'Петров А.В.'];

function TaskCard({ task, onClick, selected }: { task: Task; onClick: () => void; selected: boolean }) {
  const pri = PRIORITY_CONFIG[task.priority];
  const isOverdue = new Date(task.dueDate) < new Date('2026-05-15') && task.status !== 'done';
  const doneChecks = task.checklist.filter(c => c.done).length;

  return (
    <div
      onClick={onClick}
      className={`p-3 bg-white border rounded-lg cursor-pointer transition-all hover:shadow-sm ${selected ? 'border-blue-400 shadow-sm' : 'border-gray-200'}`}
    >
      <div className="flex items-start gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${pri.dot}`} />
        <span className="text-sm font-medium text-gray-900 leading-tight">{task.title}</span>
      </div>
      <p className="text-xs text-gray-500 mb-2 ml-4 line-clamp-2">{task.description}</p>
      <div className="flex items-center gap-2 ml-4 flex-wrap">
        {task.tags.map(tag => (
          <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{tag}</span>
        ))}
      </div>
      <div className="flex items-center justify-between mt-2 ml-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xs text-blue-700 font-medium">{task.assignee.split(' ')[0][0]}</span>
          </div>
          <span className="text-xs text-gray-500">{task.assignee.split(' ')[0]}</span>
        </div>
        <div className="flex items-center gap-2">
          {task.checklist.length > 0 && (
            <span className="text-xs text-gray-400">{doneChecks}/{task.checklist.length}</span>
          )}
          {task.comments > 0 && (
            <span className="text-xs text-gray-400 flex items-center gap-0.5">
              <Icon name="MessageSquare" size={10} />{task.comments}
            </span>
          )}
          <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
            {new Date(task.dueDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>
    </div>
  );
}

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [selected, setSelected] = useState<Task | null>(null);
  const [assigneeFilter, setAssigneeFilter] = useState('Все');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAssignee, setNewAssignee] = useState('Белова Н.');
  const [newPriority, setNewPriority] = useState<TaskPriority>('normal');

  const filtered = tasks.filter(t => {
    if (assigneeFilter !== 'Все' && t.assignee !== assigneeFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const toggleCheck = (taskId: string, checkIdx: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const checklist = t.checklist.map((c, i) => i === checkIdx ? { ...c, done: !c.done } : c);
      return { ...t, checklist };
    }));
    if (selected?.id === taskId) {
      setSelected(prev => {
        if (!prev) return null;
        const checklist = prev.checklist.map((c, i) => i === checkIdx ? { ...c, done: !c.done } : c);
        return { ...prev, checklist };
      });
    }
  };

  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    if (selected?.id === taskId) setSelected(prev => prev ? { ...prev, status: newStatus } : null);
  };

  const createTask = () => {
    if (!newTitle.trim()) return;
    const t: Task = {
      id: `T${Date.now()}`, title: newTitle, description: '', status: 'todo',
      priority: newPriority, assignee: newAssignee, dueDate: '2026-05-31',
      tags: [], comments: 0, checklist: [], createdAt: '2026-05-15',
    };
    setTasks(prev => [...prev, t]);
    setNewTitle('');
    setShowNewTask(false);
  };

  return (
    <div className="flex h-full">
      {/* Основная область */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Шапка */}
        <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Поиск задач..." className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <select value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 bg-white">
              {ASSIGNEES.map(a => <option key={a}>{a}</option>)}
            </select>
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value as TaskPriority | 'all')} className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 bg-white">
              <option value="all">Все приоритеты</option>
              {(Object.entries(PRIORITY_CONFIG) as [TaskPriority, typeof PRIORITY_CONFIG[TaskPriority]][]).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              {(['kanban', 'list'] as const).map(v => (
                <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === v ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}>
                  {v === 'kanban' ? 'Канбан' : 'Список'}
                </button>
              ))}
            </div>
            <Button size="sm" onClick={() => setShowNewTask(true)}>
              <Icon name="Plus" size={14} className="mr-1.5" />
              Задача
            </Button>
          </div>
        </div>

        {/* Канбан */}
        {view === 'kanban' ? (
          <div className="flex-1 overflow-x-auto p-4">
            <div className="flex gap-4 h-full min-w-max">
              {COLUMNS.map(col => {
                const colTasks = filtered.filter(t => t.status === col.id);
                return (
                  <div key={col.id} className={`w-72 flex flex-col rounded-xl ${col.color} border border-gray-200`}>
                    <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">{col.label}</span>
                      <span className="text-xs text-gray-400 bg-white border border-gray-200 rounded-full px-2 py-0.5">{colTasks.length}</span>
                    </div>
                    <ScrollArea className="flex-1 p-2">
                      <div className="space-y-2">
                        {colTasks.map(task => (
                          <TaskCard key={task.id} task={task} onClick={() => setSelected(task)} selected={selected?.id === task.id} />
                        ))}
                        {colTasks.length === 0 && (
                          <div className="text-center py-8 text-sm text-gray-400">Нет задач</div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left p-3 text-xs font-medium text-gray-500">Задача</th>
                  <th className="text-left p-3 text-xs font-medium text-gray-500">Приоритет</th>
                  <th className="text-left p-3 text-xs font-medium text-gray-500">Статус</th>
                  <th className="text-left p-3 text-xs font-medium text-gray-500">Исполнитель</th>
                  <th className="text-left p-3 text-xs font-medium text-gray-500">Срок</th>
                  <th className="text-left p-3 text-xs font-medium text-gray-500">Прогресс</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(task => {
                  const pri = PRIORITY_CONFIG[task.priority];
                  const col = COLUMNS.find(c => c.id === task.status)!;
                  const done = task.checklist.filter(c => c.done).length;
                  const isOverdue = new Date(task.dueDate) < new Date('2026-05-15') && task.status !== 'done';
                  return (
                    <tr key={task.id} onClick={() => setSelected(task)} className={`hover:bg-gray-50 cursor-pointer ${selected?.id === task.id ? 'bg-blue-50' : ''}`}>
                      <td className="p-3">
                        <div className="font-medium text-gray-900">{task.title}</div>
                        <div className="text-xs text-gray-500 flex gap-1 mt-0.5">
                          {task.tags.map(t => <span key={t} className="bg-gray-100 px-1.5 py-0.5 rounded-full">{t}</span>)}
                        </div>
                      </td>
                      <td className="p-3"><span className={`text-xs font-medium ${pri.color}`}>{pri.label}</span></td>
                      <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${col.color} text-gray-700`}>{col.label}</span></td>
                      <td className="p-3 text-xs text-gray-700">{task.assignee}</td>
                      <td className={`p-3 text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-600'}`}>
                        {new Date(task.dueDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="p-3">
                        {task.checklist.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5 w-16">
                              <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${(done / task.checklist.length) * 100}%` }} />
                            </div>
                            <span className="text-xs text-gray-400">{done}/{task.checklist.length}</span>
                          </div>
                        ) : <span className="text-xs text-gray-300">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ScrollArea>
        )}
      </div>

      {/* Детали задачи */}
      {selected && (
        <div className="w-80 border-l border-gray-200 bg-white flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <span className="font-semibold text-gray-900 text-sm truncate">{selected.title}</span>
            <button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 rounded">
              <Icon name="X" size={15} className="text-gray-400" />
            </button>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {/* Статус */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">Статус</label>
                <div className="flex gap-1 flex-wrap">
                  {COLUMNS.map(col => (
                    <button
                      key={col.id}
                      onClick={() => moveTask(selected.id, col.id)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${selected.status === col.id ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                    >
                      {col.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Инфо */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Исполнитель</span>
                  <span className="text-gray-900 font-medium">{selected.assignee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Приоритет</span>
                  <span className={`font-medium ${PRIORITY_CONFIG[selected.priority].color}`}>{PRIORITY_CONFIG[selected.priority].label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Срок</span>
                  <span className="text-gray-900">{new Date(selected.dueDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</span>
                </div>
                {selected.linkedOrderId && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Наряд</span>
                    <span className="text-blue-600 text-xs">{selected.linkedOrderId}</span>
                  </div>
                )}
              </div>

              {/* Описание */}
              {selected.description && (
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Описание</label>
                  <p className="text-sm text-gray-700">{selected.description}</p>
                </div>
              )}

              {/* Чеклист */}
              {selected.checklist.length > 0 && (
                <div>
                  <label className="text-xs text-gray-400 block mb-2">
                    Чеклист ({selected.checklist.filter(c => c.done).length}/{selected.checklist.length})
                  </label>
                  <div className="space-y-1.5">
                    {selected.checklist.map((item, idx) => (
                      <label key={idx} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={() => toggleCheck(selected.id, idx)}
                          className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600"
                        />
                        <span className={`text-sm ${item.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Теги */}
              {selected.tags.length > 0 && (
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Теги</label>
                  <div className="flex gap-1 flex-wrap">
                    {selected.tags.map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="p-3 border-t border-gray-100 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Icon name="Edit" size={13} className="mr-1.5" />
              Редактировать
            </Button>
            <Button size="sm" className="flex-1">
              <Icon name="MessageSquare" size={13} className="mr-1.5" />
              Комментарий
            </Button>
          </div>
        </div>
      )}

      {/* Модальное окно новой задачи */}
      {showNewTask && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-96 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Новая задача</h3>
            <div className="space-y-3">
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Название задачи..." autoFocus className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Исполнитель</label>
                  <select value={newAssignee} onChange={e => setNewAssignee(e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm">
                    {ASSIGNEES.slice(1).map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Приоритет</label>
                  <select value={newPriority} onChange={e => setNewPriority(e.target.value as TaskPriority)} className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm">
                    {(Object.entries(PRIORITY_CONFIG) as [TaskPriority, typeof PRIORITY_CONFIG[TaskPriority]][]).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => setShowNewTask(false)}>Отмена</Button>
              <Button size="sm" onClick={createTask} disabled={!newTitle.trim()}>Создать</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;
