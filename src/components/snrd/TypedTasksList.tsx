import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Clock, CheckCircle, AlertCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  type: string;
  assignee: string;
  priority: 'Высокий' | 'Средний' | 'Низкий';
  status: 'Новая' | 'В работе' | 'Выполнена' | 'Отменена';
  dueDate: string;
  description: string;
  relatedTo?: string;
}

const INITIAL_TASKS: Task[] = [
  { id: 'T-001', title: 'Позвонить клиенту Петрову', type: 'Звонок', assignee: 'Иванов А.', priority: 'Высокий', status: 'Новая', dueDate: '2026-05-15', description: 'Уточнить детали заявки', relatedTo: 'Заявка #A-2024-001' },
  { id: 'T-002', title: 'Подготовить КП для ООО "Мираж"', type: 'КП', assignee: 'Сидоров В.', priority: 'Средний', status: 'В работе', dueDate: '2026-05-16', description: 'Коммерческое предложение на обслуживание 5 кондиционеров', relatedTo: 'Клиент #C-012' },
  { id: 'T-003', title: 'Проверить состояние фильтров', type: 'Проверка', assignee: 'Козлов М.', priority: 'Низкий', status: 'Выполнена', dueDate: '2026-05-14', description: 'Проверка фильтров у клиента ООО "Берег"' },
  { id: 'T-004', title: 'Напомнить о плановом ТО', type: 'Уведомление', assignee: 'Иванов А.', priority: 'Средний', status: 'Новая', dueDate: '2026-05-18', description: 'Напомнить клиентам о плановом техобслуживании в июне' },
  { id: 'T-005', title: 'Оформить акт выполненных работ', type: 'Документ', assignee: 'Петрова Е.', priority: 'Высокий', status: 'В работе', dueDate: '2026-05-15', description: 'Акт по наряду WO-2026-000031' },
];

const TASK_TYPES = ['Звонок', 'КП', 'Проверка', 'Уведомление', 'Документ', 'Встреча', 'Email'];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Высокий': return 'bg-red-100 text-red-700';
    case 'Средний': return 'bg-yellow-100 text-yellow-700';
    default: return 'bg-green-100 text-green-700';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Выполнена': return 'bg-green-100 text-green-700';
    case 'В работе': return 'bg-blue-100 text-blue-700';
    case 'Отменена': return 'bg-gray-100 text-gray-600';
    default: return 'bg-orange-100 text-orange-700';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Выполнена': return <CheckCircle size={14} className="text-green-600" />;
    case 'В работе': return <Clock size={14} className="text-blue-600" />;
    case 'Отменена': return <AlertCircle size={14} className="text-gray-500" />;
    default: return <AlertCircle size={14} className="text-orange-500" />;
  }
};

const TypedTasksList = () => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState<Partial<Task>>({});

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignee.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = typeFilter === 'all' || t.type === typeFilter;
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const openNew = () => {
    setEditingTask(null);
    setForm({ priority: 'Средний', status: 'Новая', type: 'Звонок' });
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setForm({ ...task });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.title || !form.assignee || !form.dueDate) {
      toast.error('Заполните обязательные поля');
      return;
    }
    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...form } as Task : t));
      toast.success('Задача обновлена');
    } else {
      const newTask: Task = {
        id: `T-${String(tasks.length + 1).padStart(3, '0')}`,
        title: form.title!,
        type: form.type || 'Звонок',
        assignee: form.assignee!,
        priority: (form.priority as Task['priority']) || 'Средний',
        status: 'Новая',
        dueDate: form.dueDate!,
        description: form.description || '',
        relatedTo: form.relatedTo,
      };
      setTasks([newTask, ...tasks]);
      toast.success('Задача создана');
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить задачу?')) {
      setTasks(tasks.filter(t => t.id !== id));
      toast.success('Задача удалена');
    }
  };

  const stats = {
    total: tasks.length,
    new: tasks.filter(t => t.status === 'Новая').length,
    inProgress: tasks.filter(t => t.status === 'В работе').length,
    done: tasks.filter(t => t.status === 'Выполнена').length,
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Задачи</h2>
          <p className="text-gray-600 mt-1">Управление задачами и поручениями</p>
        </div>
        <Button onClick={openNew}>
          <Plus size={16} className="mr-2" />
          Новая задача
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Всего', value: stats.total, color: 'bg-gray-50' },
          { label: 'Новые', value: stats.new, color: 'bg-orange-50' },
          { label: 'В работе', value: stats.inProgress, color: 'bg-blue-50' },
          { label: 'Выполнено', value: stats.done, color: 'bg-green-50' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-lg p-4 border border-gray-200`}>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-600">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input placeholder="Поиск задач..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
          <option value="all">Все типы</option>
          {TASK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
          <option value="all">Все статусы</option>
          <option value="Новая">Новая</option>
          <option value="В работе">В работе</option>
          <option value="Выполнена">Выполнена</option>
          <option value="Отменена">Отменена</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Задача', 'Тип', 'Исполнитель', 'Срок', 'Приоритет', 'Статус', 'Действия'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map(task => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    {task.relatedTo && <p className="text-xs text-gray-500">{task.relatedTo}</p>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className="text-xs">{task.type}</Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-700">{task.assignee}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-700">{new Date(task.dueDate).toLocaleDateString('ru-RU')}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>{task.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(task)}><Edit2 size={14} /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(task.id)}><Trash2 size={14} className="text-red-500" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">Задачи не найдены</div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Редактировать задачу' : 'Новая задача'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Название *</Label>
              <Input value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} placeholder="Название задачи" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Тип</Label>
                <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TASK_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Приоритет</Label>
                <Select value={form.priority} onValueChange={v => setForm({...form, priority: v as Task['priority']})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Высокий">Высокий</SelectItem>
                    <SelectItem value="Средний">Средний</SelectItem>
                    <SelectItem value="Низкий">Низкий</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Исполнитель *</Label>
                <Input value={form.assignee || ''} onChange={e => setForm({...form, assignee: e.target.value})} placeholder="ФИО" />
              </div>
              <div>
                <Label>Срок *</Label>
                <Input type="date" value={form.dueDate || ''} onChange={e => setForm({...form, dueDate: e.target.value})} />
              </div>
            </div>
            <div>
              <Label>Описание</Label>
              <Textarea value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} rows={3} />
            </div>
            <div>
              <Label>Связано с</Label>
              <Input value={form.relatedTo || ''} onChange={e => setForm({...form, relatedTo: e.target.value})} placeholder="Заявка, клиент, наряд..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Отмена</Button>
            <Button onClick={handleSave}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TypedTasksList;
