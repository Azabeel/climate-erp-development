import { useState } from 'react';
import { UserPlus, CheckCircle, AlertCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  category: string;
  assignedTo: string;
  dueDay: number;
  completed: boolean;
}

interface NewEmployee {
  id: string;
  name: string;
  position: string;
  startDate: string;
  mentor: string;
  progress: number;
  status: 'onboarding' | 'completed' | 'delayed';
}

const TEMPLATE_TASKS: OnboardingTask[] = [
  { id: 't1', title: 'Оформить трудовой договор', description: 'Подписать все необходимые документы', category: 'HR', assignedTo: 'HR-менеджер', dueDay: 1, completed: true },
  { id: 't2', title: 'Выдать форму и оборудование', description: 'Рабочая одежда, инструменты, телефон', category: 'Склад', assignedTo: 'Кладовщик', dueDay: 1, completed: true },
  { id: 't3', title: 'Зарегистрировать в системе', description: 'Создать учётную запись, настроить права', category: 'ИТ', assignedTo: 'ИТ-администратор', dueDay: 1, completed: true },
  { id: 't4', title: 'Пройти инструктаж по ТБ', description: 'Обязательный инструктаж по технике безопасности', category: 'ОТ и ТБ', assignedTo: 'HR-менеджер', dueDay: 1, completed: true },
  { id: 't5', title: 'Установить мобильное приложение', description: 'Настроить приложение инженера', category: 'ИТ', assignedTo: 'Наставник', dueDay: 2, completed: true },
  { id: 't6', title: 'Базовый курс LMS: Основы систем', description: 'Пройти вводный курс в учебном центре', category: 'Обучение', assignedTo: 'Сотрудник', dueDay: 5, completed: false },
  { id: 't7', title: 'Выезд с наставником (3 наряда)', description: 'Совместные выезды для ознакомления с работой', category: 'Практика', assignedTo: 'Наставник', dueDay: 10, completed: false },
  { id: 't8', title: 'Пройти тест на допуск', description: 'Тестирование знаний для получения доступа к самостоятельным нарядам', category: 'Обучение', assignedTo: 'Сотрудник', dueDay: 14, completed: false },
  { id: 't9', title: 'Подписать соглашение о конфиденциальности', description: 'NDA и правила работы с клиентскими данными', category: 'HR', assignedTo: 'HR-менеджер', dueDay: 3, completed: false },
  { id: 't10', title: 'Оценка испытательного срока', description: 'Финальная оценка после 30 дней', category: 'HR', assignedTo: 'Руководитель', dueDay: 30, completed: false },
];

const NEW_EMPLOYEES: NewEmployee[] = [
  { id: 'ne1', name: 'Новиков Андрей Сергеевич', position: 'Инженер-монтажник', startDate: '04.05.2026', mentor: 'Козлов М.', progress: 50, status: 'onboarding' },
  { id: 'ne2', name: 'Романова Елена Игоревна', position: 'Диспетчер', startDate: '11.05.2026', mentor: 'Иванов А.', progress: 30, status: 'onboarding' },
];

const CATEGORY_COLORS: Record<string, string> = {
  HR: 'bg-purple-100 text-purple-700',
  Склад: 'bg-yellow-100 text-yellow-700',
  ИТ: 'bg-blue-100 text-blue-700',
  'ОТ и ТБ': 'bg-red-100 text-red-700',
  Обучение: 'bg-green-100 text-green-700',
  Практика: 'bg-orange-100 text-orange-700',
};

const EmployeeOnboarding = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<NewEmployee>(NEW_EMPLOYEES[0]);
  const [tasks, setTasks] = useState<OnboardingTask[]>(TEMPLATE_TASKS);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    toast.success('Статус задачи обновлён');
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedTasks / tasks.length) * 100);

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <UserPlus size={28} className="text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Онбординг сотрудников</h2>
          <p className="text-gray-600 mt-0.5">Чек-листы и задачи для новых сотрудников</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-2xl font-bold text-blue-700">{NEW_EMPLOYEES.length}</p>
          <p className="text-sm text-blue-600">Сотрудников на онбординге</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-2xl font-bold text-green-700">{completedTasks}/{tasks.length}</p>
          <p className="text-sm text-green-600">Задач выполнено</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-2xl font-bold text-purple-700">{progressPercent}%</p>
          <p className="text-sm text-purple-600">Прогресс ({selectedEmployee.name.split(' ')[0]})</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Employee selector */}
        <div className="w-72 shrink-0">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">Новые сотрудники</h3>
          <div className="space-y-2 mb-4">
            {NEW_EMPLOYEES.map(emp => (
              <div
                key={emp.id}
                onClick={() => setSelectedEmployee(emp)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedEmployee.id === emp.id ? 'border-blue-400 bg-blue-50 shadow' : 'border-gray-200 bg-white hover:shadow-sm'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                    <User size={16} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{emp.name}</p>
                    <p className="text-xs text-gray-500">{emp.position}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-2">С {emp.startDate} · Наставник: {emp.mentor}</p>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${emp.progress}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">{emp.progress}% завершено</p>
              </div>
            ))}
          </div>
          <Button className="w-full" variant="outline" onClick={() => toast.info('Форма нового онбординга')}>
            <UserPlus size={14} className="mr-2" /> Начать онбординг
          </Button>
        </div>

        {/* Checklist */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Чек-лист: {selectedEmployee.name}</h3>
            <div className="flex items-center gap-2">
              <div className="w-40 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progressPercent}%` }} />
              </div>
              <span className="text-sm font-semibold text-gray-700">{progressPercent}%</span>
            </div>
          </div>

          <div className="space-y-2">
            {tasks.map(task => (
              <div
                key={task.id}
                className={`bg-white border rounded-lg p-4 transition-all ${task.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${task.completed ? 'border-green-500 bg-green-500' : 'border-gray-300 hover:border-blue-500'}`}
                  >
                    {task.completed && <CheckCircle size={12} className="text-white" />}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</p>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${CATEGORY_COLORS[task.category] || 'bg-gray-100 text-gray-600'}`}>{task.category}</span>
                    </div>
                    <p className="text-xs text-gray-500">{task.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>Ответственный: {task.assignedTo}</span>
                      <span>День {task.dueDay}</span>
                    </div>
                  </div>
                  {!task.completed && task.dueDay <= 3 && (
                    <AlertCircle size={16} className="text-orange-500 shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeOnboarding;
