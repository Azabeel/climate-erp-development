import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

// ─── Types ──────────────────────────────────────────────────────────────────

type TaskStatus = 'new' | 'in_progress' | 'review' | 'done' | 'archive';
type TaskPriority = 'normal' | 'urgent' | 'emergency';
type ViewMode = 'kanban' | 'list' | 'calendar';
type SortField = 'id' | 'title' | 'assignee' | 'status' | 'priority' | 'dueDate' | 'project';
type SortDir = 'asc' | 'desc';

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  assigneeInitials: string;
  dueDate: string;
  tags: string[];
  project: string;
  comments: number;
  attachments: number;
  isMyTask: boolean;
}

// ─── Mock data ───────────────────────────────────────────────────────────────

const MOCK_TASKS: Task[] = [
  {
    id: 'T-001',
    title: 'Оформить акты за прошлую неделю',
    description: 'Подготовить и подписать акты выполненных работ за период 06–12 мая',
    status: 'new',
    priority: 'urgent',
    assignee: 'Белова Н.',
    assigneeInitials: 'БН',
    dueDate: '2026-05-14',
    tags: ['документы', 'финансы'],
    project: 'Документооборот',
    comments: 2,
    attachments: 0,
    isMyTask: true,
  },
  {
    id: 'T-002',
    title: 'Обзвонить клиентов с просроченным SLA',
    description: 'Связаться с клиентами по нарядам WO-2026-000401, WO-2026-000415 и объяснить причину задержки',
    status: 'in_progress',
    priority: 'emergency',
    assignee: 'Козлов Д.',
    assigneeInitials: 'КД',
    dueDate: '2026-05-16',
    tags: ['SLA', 'клиенты'],
    project: 'Сервис',
    comments: 5,
    attachments: 1,
    isMyTask: false,
  },
  {
    id: 'T-003',
    title: 'Обновить прайс-лист (фреоны)',
    description: 'Цены на R-410A и R-32 выросли — обновить все позиции в системе',
    status: 'review',
    priority: 'urgent',
    assignee: 'Сидорова А.',
    assigneeInitials: 'СА',
    dueDate: '2026-05-16',
    tags: ['прайс', 'хладагенты'],
    project: 'Склад',
    comments: 3,
    attachments: 2,
    isMyTask: true,
  },
  {
    id: 'T-004',
    title: 'Заказать компрессоры для склада',
    description: 'Дозаказ компрессоров Daikin JT160 (5 шт.) и Mitsubishi PUHZ-ZRP (3 шт.)',
    status: 'new',
    priority: 'normal',
    assignee: 'Козлов Д.',
    assigneeInitials: 'КД',
    dueDate: '2026-05-20',
    tags: ['ЗИП', 'склад'],
    project: 'Закупки',
    comments: 1,
    attachments: 0,
    isMyTask: false,
  },
  {
    id: 'T-005',
    title: 'Провести собрание команды (среда 14:00)',
    description: 'Квартальное собрание: итоги апреля, планы на май, вопросы сотрудников',
    status: 'new',
    priority: 'normal',
    assignee: 'Петров А.В.',
    assigneeInitials: 'ПА',
    dueDate: '2026-05-20',
    tags: ['HR', 'собрание'],
    project: 'Управление',
    comments: 0,
    attachments: 0,
    isMyTask: true,
  },
  {
    id: 'T-006',
    title: 'Проверить лицензии инженеров',
    description: 'Истекают лицензии у Новикова и Захарова — уточнить даты и инициировать продление',
    status: 'in_progress',
    priority: 'urgent',
    assignee: 'Сидорова А.',
    assigneeInitials: 'СА',
    dueDate: '2026-05-18',
    tags: ['HR', 'лицензии'],
    project: 'Compliance',
    comments: 0,
    attachments: 3,
    isMyTask: false,
  },
  {
    id: 'T-007',
    title: 'Настроить интеграцию с 1С',
    description: 'Подключить выгрузку актов и счетов в 1С:Бухгалтерию через REST API',
    status: 'in_progress',
    priority: 'normal',
    assignee: 'Морозов А.К.',
    assigneeInitials: 'МА',
    dueDate: '2026-05-30',
    tags: ['IT', 'интеграция'],
    project: 'IT',
    comments: 4,
    attachments: 1,
    isMyTask: true,
  },
  {
    id: 'T-008',
    title: 'Сформировать КП для ТРЦ "Галактика"',
    description: 'Подготовить три варианта КП (Good-Better-Best) на обслуживание 22 сплит-систем',
    status: 'review',
    priority: 'urgent',
    assignee: 'Белова Н.',
    assigneeInitials: 'БН',
    dueDate: '2026-05-17',
    tags: ['КП', 'CRM'],
    project: 'Продажи',
    comments: 6,
    attachments: 2,
    isMyTask: true,
  },
  {
    id: 'T-009',
    title: 'Плановое ТО — объект «Сибтехно»',
    description: 'Согласовать дату выезда для планового ТО 8 кондиционеров VRV-системы',
    status: 'new',
    priority: 'normal',
    assignee: 'Козлов Д.',
    assigneeInitials: 'КД',
    dueDate: '2026-05-22',
    tags: ['наряд', 'ТО'],
    project: 'Сервис',
    comments: 2,
    attachments: 0,
    isMyTask: false,
  },
  {
    id: 'T-010',
    title: 'Отчёт по расходу хладагентов',
    description: 'Сформировать отчёт для Росприроднадзора за I квартал 2026 г.',
    status: 'review',
    priority: 'emergency',
    assignee: 'Морозов А.К.',
    assigneeInitials: 'МА',
    dueDate: '2026-05-13',
    tags: ['хладагенты', 'отчёт'],
    project: 'Compliance',
    comments: 1,
    attachments: 4,
    isMyTask: false,
  },
  {
    id: 'T-011',
    title: 'Записать Новикова на курсы Daikin VRV',
    description: 'Найти ближайший курс Level 2, согласовать даты и оплатить участие',
    status: 'new',
    priority: 'normal',
    assignee: 'Сидорова А.',
    assigneeInitials: 'СА',
    dueDate: '2026-06-01',
    tags: ['HR', 'обучение'],
    project: 'HR',
    comments: 0,
    attachments: 0,
    isMyTask: false,
  },
  {
    id: 'T-012',
    title: 'Настроить Telegram-уведомления для диспетчеров',
    description: 'Подключить бота к рабочему чату — алерты по SLA YELLOW/RED',
    status: 'in_progress',
    priority: 'normal',
    assignee: 'Морозов А.К.',
    assigneeInitials: 'МА',
    dueDate: '2026-05-25',
    tags: ['IT', 'уведомления'],
    project: 'IT',
    comments: 3,
    attachments: 0,
    isMyTask: true,
  },
  {
    id: 'T-013',
    title: 'Закрыть наряды за апрель в 1С',
    description: 'Передать в бухгалтерию 34 закрытых наряда — акты и счета апреля',
    status: 'done',
    priority: 'urgent',
    assignee: 'Белова Н.',
    assigneeInitials: 'БН',
    dueDate: '2026-05-05',
    tags: ['наряд', 'финансы'],
    project: 'Документооборот',
    comments: 2,
    attachments: 5,
    isMyTask: true,
  },
  {
    id: 'T-014',
    title: 'Обновить матрицу компетенций инженеров',
    description: 'Внести данные о новых сертификатах Захарова и Кириллова',
    status: 'done',
    priority: 'normal',
    assignee: 'Сидорова А.',
    assigneeInitials: 'СА',
    dueDate: '2026-05-10',
    tags: ['HR', 'компетенции'],
    project: 'HR',
    comments: 0,
    attachments: 1,
    isMyTask: false,
  },
  {
    id: 'T-015',
    title: 'Архивировать заявки 2025 года',
    description: 'Перенести все закрытые наряды 2025 года в архивный раздел системы',
    status: 'archive',
    priority: 'normal',
    assignee: 'Морозов А.К.',
    assigneeInitials: 'МА',
    dueDate: '2026-04-30',
    tags: ['архив', 'наряд'],
    project: 'IT',
    comments: 0,
    attachments: 0,
    isMyTask: false,
  },
];

// ─── Config ──────────────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; badgeClass: string; stripColor: string }> = {
  normal:    { label: 'Обычный',    badgeClass: 'bg-gray-100 text-gray-600 border-gray-200',          stripColor: 'bg-gray-400' },
  urgent:    { label: 'Срочно',     badgeClass: 'bg-orange-100 text-orange-700 border-orange-200',    stripColor: 'bg-orange-500' },
  emergency: { label: 'Аварийный',  badgeClass: 'bg-red-100 text-red-700 border-red-200',             stripColor: 'bg-red-500' },
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; badgeClass: string; colBg: string }> = {
  new:        { label: 'Новые',       badgeClass: 'bg-blue-100 text-blue-700',    colBg: 'bg-slate-50' },
  in_progress:{ label: 'В работе',    badgeClass: 'bg-indigo-100 text-indigo-700', colBg: 'bg-blue-50' },
  review:     { label: 'На проверке', badgeClass: 'bg-yellow-100 text-yellow-700', colBg: 'bg-amber-50' },
  done:       { label: 'Готово',      badgeClass: 'bg-green-100 text-green-700',   colBg: 'bg-green-50' },
  archive:    { label: 'Архив',       badgeClass: 'bg-gray-100 text-gray-500',     colBg: 'bg-gray-50' },
};

const COLUMNS: TaskStatus[] = ['new', 'in_progress', 'review', 'done'];

const ASSIGNEES = ['Все', 'Белова Н.', 'Козлов Д.', 'Сидорова А.', 'Морозов А.К.', 'Петров А.В.'];

const TODAY = '2026-05-16';

function isOverdue(dueDate: string, status: TaskStatus) {
  return dueDate < TODAY && status !== 'done' && status !== 'archive';
}

// ─── Stat badge ──────────────────────────────────────────────────────────────

function StatBadge({ icon, label, count, color }: { icon: string; label: string; count: number; color: string }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${color}`}>
      <Icon name={icon as any} size={14} />
      <span className="text-sm font-semibold">{count}</span>
      <span className="text-xs text-current opacity-70">{label}</span>
    </div>
  );
}

// ─── Task card (Kanban) ───────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  onMenuAction: (action: string, task: Task) => void;
}

function TaskCard({ task, onMenuAction }: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pri = PRIORITY_CONFIG[task.priority];
  const overdue = isOverdue(task.dueDate, task.status);

  const formattedDate = new Date(task.dueDate).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="relative group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Priority left strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${pri.stripColor}`} />

      <div className="pl-3 pr-3 pt-3 pb-3">
        {/* Priority badge + menu */}
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${pri.badgeClass}`}>
            {pri.label}
          </span>
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-opacity"
            >
              <Icon name="MoreHorizontal" size={14} className="text-gray-400" />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-6 z-20 bg-white border border-gray-200 rounded-lg shadow-lg w-40 py-1"
                onMouseLeave={() => setMenuOpen(false)}
              >
                {[
                  { action: 'edit',   icon: 'Pencil',  label: 'Редактировать' },
                  { action: 'move',   icon: 'ArrowRight', label: 'Переместить' },
                  { action: 'delete', icon: 'Trash2',  label: 'Удалить' },
                ].map(({ action, icon, label }) => (
                  <button
                    key={action}
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onMenuAction(action, task); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${action === 'delete' ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'}`}
                  >
                    <Icon name={icon as any} size={13} />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <p className="text-sm font-semibold text-gray-900 leading-snug mb-1">{task.title}</p>

        {/* Description */}
        <p className="text-xs text-gray-500 leading-relaxed truncate mb-2">{task.description}</p>

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-3">
            {task.tags.map(tag => (
              <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between">
          {/* Assignee */}
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-white">{task.assigneeInitials}</span>
            </div>
            <span className="text-xs text-gray-500">{task.assignee.split(' ')[0]}</span>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {task.comments > 0 && (
              <span className="flex items-center gap-0.5">
                <Icon name="MessageSquare" size={11} />
                {task.comments}
              </span>
            )}
            {task.attachments > 0 && (
              <span className="flex items-center gap-0.5">
                <Icon name="Paperclip" size={11} />
                {task.attachments}
              </span>
            )}
            <span className={`flex items-center gap-0.5 ${overdue ? 'text-red-500 font-medium' : ''}`}>
              <Icon name="Calendar" size={11} />
              {formattedDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Inline add-task form ────────────────────────────────────────────────────

interface AddTaskFormProps {
  onAdd: (title: string, priority: TaskPriority) => void;
  onCancel: () => void;
}

function AddTaskForm({ onAdd, onCancel }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('normal');

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), priority);
    setTitle('');
  };

  return (
    <div className="bg-white border border-blue-300 rounded-xl p-3 shadow-sm space-y-2">
      <Input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Название задачи..."
        autoFocus
        onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') onCancel(); }}
        className="text-sm h-8"
      />
      <div className="flex items-center gap-2">
        <select
          value={priority}
          onChange={e => setPriority(e.target.value as TaskPriority)}
          className="flex-1 text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-700"
        >
          {(Object.entries(PRIORITY_CONFIG) as [TaskPriority, typeof PRIORITY_CONFIG[TaskPriority]][]).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <Button size="sm" className="h-7 text-xs px-3" onClick={handleAdd} disabled={!title.trim()}>
          Добавить
        </Button>
        <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded">
          <Icon name="X" size={13} className="text-gray-400" />
        </button>
      </div>
    </div>
  );
}

// ─── Kanban view ─────────────────────────────────────────────────────────────

interface KanbanViewProps {
  tasks: Task[];
  showArchive: boolean;
  onToggleArchive: () => void;
  onMenuAction: (action: string, task: Task) => void;
  onAddTask: (title: string, priority: TaskPriority) => void;
}

function KanbanView({ tasks, showArchive, onToggleArchive, onMenuAction, onAddTask }: KanbanViewProps) {
  const [showForm, setShowForm] = useState(false);

  const archiveTasks = tasks.filter(t => t.status === 'archive');

  const handleAdd = (title: string, priority: TaskPriority) => {
    onAddTask(title, priority);
    setShowForm(false);
  };

  return (
    <div className="flex gap-4 h-full overflow-x-auto px-4 pb-4 pt-2">
      {COLUMNS.map(status => {
        const colTasks = tasks.filter(t => t.status === status);
        const cfg = STATUS_CONFIG[status];
        return (
          <div key={status} className={`flex flex-col rounded-2xl border border-gray-200 ${cfg.colBg} flex-shrink-0 w-72`} style={{ maxHeight: 'calc(100vh - 220px)' }}>
            {/* Column header */}
            <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">{cfg.label}</span>
                <span className="text-xs bg-white border border-gray-200 text-gray-500 rounded-full px-2 py-0.5 font-medium">
                  {colTasks.length}
                </span>
              </div>
              {status === 'new' && (
                <button
                  onClick={() => setShowForm(f => !f)}
                  className="p-1 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                  title="Добавить задачу"
                >
                  <Icon name="Plus" size={15} className="text-gray-500" />
                </button>
              )}
            </div>

            {/* Tasks list */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {status === 'new' && showForm && (
                <AddTaskForm onAdd={handleAdd} onCancel={() => setShowForm(false)} />
              )}
              {colTasks.map(task => (
                <TaskCard key={task.id} task={task} onMenuAction={onMenuAction} />
              ))}
              {colTasks.length === 0 && !showForm && (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                  <Icon name="Inbox" size={24} className="opacity-30" />
                  <span className="text-xs">Нет задач</span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Archive column */}
      <div className="flex flex-col rounded-2xl border border-gray-200 bg-gray-50 flex-shrink-0 w-72" style={{ maxHeight: 'calc(100vh - 220px)' }}>
        <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-500">{STATUS_CONFIG.archive.label}</span>
            <span className="text-xs bg-white border border-gray-200 text-gray-400 rounded-full px-2 py-0.5 font-medium">
              {archiveTasks.length}
            </span>
          </div>
          <button
            onClick={onToggleArchive}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white transition-all"
          >
            <Icon name={showArchive ? 'EyeOff' : 'Eye'} size={12} />
            {showArchive ? 'Скрыть' : 'Показать'}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {showArchive
            ? archiveTasks.map(task => <TaskCard key={task.id} task={task} onMenuAction={onMenuAction} />)
            : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                <Icon name="Archive" size={24} className="opacity-30" />
                <span className="text-xs">Скрыто</span>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}

// ─── List view ───────────────────────────────────────────────────────────────

interface ListViewProps {
  tasks: Task[];
  onMenuAction: (action: string, task: Task) => void;
}

function ListView({ tasks, onMenuAction }: ListViewProps) {
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [search, setSearch] = useState('');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filteredAndSorted = useMemo(() => {
    let list = tasks;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      let av: string = a[sortField as keyof Task] as string;
      let bv: string = b[sortField as keyof Task] as string;
      // Priority ordering
      if (sortField === 'priority') {
        const order: Record<TaskPriority, number> = { normal: 0, urgent: 1, emergency: 2 };
        av = String(order[a.priority]);
        bv = String(order[b.priority]);
      }
      if (sortField === 'status') {
        const order: Record<TaskStatus, number> = { new: 0, in_progress: 1, review: 2, done: 3, archive: 4 };
        av = String(order[a.status]);
        bv = String(order[b.status]);
      }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [tasks, search, sortField, sortDir]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <Icon name="ChevronsUpDown" size={11} className="text-gray-300 ml-1" />;
    return <Icon name={sortDir === 'asc' ? 'ChevronUp' : 'ChevronDown'} size={11} className="text-blue-500 ml-1" />;
  };

  const Col = ({ field, label }: { field: SortField; label: string }) => (
    <th
      className="text-left px-3 py-3 text-xs font-semibold text-gray-500 cursor-pointer hover:text-gray-800 select-none whitespace-nowrap"
      onClick={() => handleSort(field)}
    >
      <span className="flex items-center">
        {label}
        <SortIcon field={field} />
      </span>
    </th>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="relative max-w-xs">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по названию..."
            className="pl-9 h-8 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <Col field="id" label="№" />
              <Col field="title" label="Название" />
              <Col field="assignee" label="Исполнитель" />
              <Col field="status" label="Статус" />
              <Col field="priority" label="Приоритет" />
              <Col field="dueDate" label="Дедлайн" />
              <Col field="project" label="Проект" />
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredAndSorted.map(task => {
              const pri = PRIORITY_CONFIG[task.priority];
              const st = STATUS_CONFIG[task.status];
              const overdue = isOverdue(task.dueDate, task.status);
              return (
                <tr key={task.id} className="hover:bg-blue-50/40 transition-colors group">
                  <td className="px-3 py-3 text-xs text-gray-400 font-mono">{task.id}</td>
                  <td className="px-3 py-3 max-w-xs">
                    <div className="font-medium text-gray-900 truncate">{task.title}</div>
                    {task.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {task.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{tag}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-[9px] font-bold text-white">{task.assigneeInitials}</span>
                      </div>
                      <span className="text-xs text-gray-700 whitespace-nowrap">{task.assignee}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Badge className={`text-xs ${st.badgeClass}`}>{st.label}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${pri.badgeClass}`}>
                      {pri.label}
                    </span>
                  </td>
                  <td className={`px-3 py-3 text-xs whitespace-nowrap ${overdue ? 'text-red-500 font-semibold' : 'text-gray-600'}`}>
                    {overdue && <Icon name="AlertCircle" size={11} className="inline mr-1 text-red-400" />}
                    {new Date(task.dueDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500">{task.project}</td>
                  <td className="px-3 py-3">
                    <div className="relative">
                      <button
                        onClick={() => onMenuAction('menu', task)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all"
                      >
                        <Icon name="MoreHorizontal" size={13} className="text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredAndSorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <Icon name="SearchX" size={32} className="opacity-30" />
            <span className="text-sm">Задачи не найдены</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Calendar view ────────────────────────────────────────────────────────────

interface CalendarViewProps {
  tasks: Task[];
}

function CalendarView({ tasks }: CalendarViewProps) {
  const year = 2026;
  const month = 4; // May (0-indexed)

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun
  // Adjust for Mon-first week
  const startOffset = (firstDayOfWeek + 6) % 7;

  const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const tasksByDay = useMemo(() => {
    const map: Record<number, Task[]> = {};
    tasks.forEach(t => {
      const d = new Date(t.dueDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(t);
      }
    });
    return map;
  }, [tasks]);

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const todayDay = 16; // May 16

  return (
    <div className="flex flex-col h-full px-4 pt-2 pb-4">
      {/* Month title */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-800">Май 2026</h3>
        <div className="flex gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />Аварийный</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" />Срочно</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block" />Обычный</span>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEK_DAYS.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 flex-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="rounded-lg" />;
          const dayTasks = tasksByDay[day] || [];
          const isToday = day === todayDay;
          return (
            <div
              key={day}
              className={`rounded-xl border p-1.5 flex flex-col min-h-[80px] ${
                isToday
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-100 bg-white hover:border-gray-300'
              } transition-colors`}
            >
              <span className={`text-xs font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                {day}
              </span>
              <div className="space-y-0.5 overflow-hidden">
                {dayTasks.slice(0, 3).map(t => {
                  const dot = PRIORITY_CONFIG[t.priority].stripColor;
                  return (
                    <div key={t.id} className="flex items-start gap-1" title={t.title}>
                      <span className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${dot}`} />
                      <span className="text-[10px] text-gray-600 leading-tight truncate">{t.title}</span>
                    </div>
                  );
                })}
                {dayTasks.length > 3 && (
                  <span className="text-[10px] text-gray-400 pl-2">+{dayTasks.length - 3} ещё</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const TaskManagerFull = () => {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [view, setView] = useState<ViewMode>('kanban');
  const [showArchive, setShowArchive] = useState(false);
  const [filterAssignee, setFilterAssignee] = useState('Все');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const [filterDeadline, setFilterDeadline] = useState<'all' | 'overdue' | 'today' | 'week'>('all');

  // ─ Stats ─
  const stats = useMemo(() => ({
    total: tasks.filter(t => t.status !== 'archive').length,
    urgent: tasks.filter(t => t.priority === 'emergency' && t.status !== 'archive').length,
    overdue: tasks.filter(t => isOverdue(t.dueDate, t.status)).length,
    mine: tasks.filter(t => t.isMyTask && t.status !== 'archive').length,
  }), [tasks]);

  // ─ Filter logic ─
  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (filterAssignee !== 'Все' && t.assignee !== filterAssignee) return false;
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      if (filterDeadline === 'overdue' && !isOverdue(t.dueDate, t.status)) return false;
      if (filterDeadline === 'today' && t.dueDate !== TODAY) return false;
      if (filterDeadline === 'week') {
        const d = new Date(t.dueDate);
        const start = new Date(TODAY);
        const end = new Date(TODAY);
        end.setDate(end.getDate() + 7);
        if (d < start || d > end) return false;
      }
      return true;
    });
  }, [tasks, filterAssignee, filterPriority, filterDeadline]);

  // ─ Menu actions ─
  const handleMenuAction = (action: string, task: Task) => {
    if (action === 'delete') {
      setTasks(prev => prev.filter(t => t.id !== task.id));
      toast.success(`Задача «${task.title}» удалена`);
    } else if (action === 'edit') {
      toast.info(`Редактирование: «${task.title}»`);
    } else if (action === 'move') {
      toast.info(`Перемещение: «${task.title}»`);
    } else {
      toast.info(`«${task.title}»`);
    }
  };

  // ─ Add task ─
  const handleAddTask = (title: string, priority: TaskPriority) => {
    const newTask: Task = {
      id: `T-${String(tasks.length + 1).padStart(3, '0')}`,
      title,
      description: '',
      status: 'new',
      priority,
      assignee: 'Белова Н.',
      assigneeInitials: 'БН',
      dueDate: '2026-05-31',
      tags: [],
      project: 'Общее',
      comments: 0,
      attachments: 0,
      isMyTask: true,
    };
    setTasks(prev => [newTask, ...prev]);
    toast.success('Задача добавлена');
  };

  const VIEW_OPTIONS: { id: ViewMode; label: string; icon: string }[] = [
    { id: 'kanban',   label: 'Канбан',    icon: 'LayoutDashboard' },
    { id: 'list',     label: 'Список',    icon: 'List' },
    { id: 'calendar', label: 'Календарь', icon: 'CalendarDays' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* ── Top bar ── */}
      <div className="bg-white border-b border-gray-200 px-4 pt-4 pb-3 flex flex-col gap-3 flex-shrink-0">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Icon name="CheckSquare" size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">Менеджер задач</h2>
              <p className="text-xs text-gray-400">АСУ СЦ «Сервис Климат»</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              {VIEW_OPTIONS.map(v => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id)}
                  title={v.label}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                    view === v.id ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Icon name={v.icon as any} size={13} />
                  <span className="hidden sm:inline">{v.label}</span>
                </button>
              ))}
            </div>

            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => {
                if (view !== 'kanban') setView('kanban');
                toast.info('Переключитесь на Канбан для добавления задачи через форму в колонке «Новые»');
              }}
            >
              <Icon name="Plus" size={14} />
              Добавить задачу
            </Button>
          </div>
        </div>

        {/* Stats + Filters */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Stat badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <StatBadge icon="LayoutList"    label="Всего"       count={stats.total}  color="bg-slate-50 text-slate-600 border-slate-200" />
            <StatBadge icon="AlertCircle"   label="Срочных"     count={stats.urgent}  color="bg-red-50 text-red-600 border-red-200" />
            <StatBadge icon="Clock"         label="Просроченных" count={stats.overdue} color="bg-orange-50 text-orange-600 border-orange-200" />
            <StatBadge icon="User"          label="Мои задачи"  count={stats.mine}    color="bg-blue-50 text-blue-600 border-blue-200" />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filterAssignee}
              onChange={e => setFilterAssignee(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              {ASSIGNEES.map(a => <option key={a}>{a}</option>)}
            </select>

            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value as TaskPriority | 'all')}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="all">Все приоритеты</option>
              {(Object.entries(PRIORITY_CONFIG) as [TaskPriority, typeof PRIORITY_CONFIG[TaskPriority]][]).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>

            <select
              value={filterDeadline}
              onChange={e => setFilterDeadline(e.target.value as typeof filterDeadline)}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="all">Любой срок</option>
              <option value="overdue">Просроченные</option>
              <option value="today">Сегодня</option>
              <option value="week">На этой неделе</option>
            </select>

            {(filterAssignee !== 'Все' || filterPriority !== 'all' || filterDeadline !== 'all') && (
              <button
                onClick={() => { setFilterAssignee('Все'); setFilterPriority('all'); setFilterDeadline('all'); }}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <Icon name="X" size={11} />
                Сбросить
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-hidden">
        {view === 'kanban' && (
          <KanbanView
            tasks={filtered}
            showArchive={showArchive}
            onToggleArchive={() => setShowArchive(s => !s)}
            onMenuAction={handleMenuAction}
            onAddTask={handleAddTask}
          />
        )}
        {view === 'list' && (
          <ListView tasks={filtered} onMenuAction={handleMenuAction} />
        )}
        {view === 'calendar' && (
          <CalendarView tasks={filtered} />
        )}
      </div>
    </div>
  );
};

export default TaskManagerFull;
