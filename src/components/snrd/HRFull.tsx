import { useState, useMemo } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ─── Типы ─────────────────────────────────────────────────────────────────────

type EmploymentType = 'Штат' | 'Подряд';
type EmployeeStatus = 'Активен' | 'Испытание' | 'Отпуск' | 'Уволен';
type Department = 'Монтаж' | 'Сервис' | 'Диспетчерская' | 'Продажи' | 'Бухгалтерия' | 'Руководство';
type PayrollType = 'Сдельный' | 'Окладный';
type DayStatus = 'Р' | 'В' | 'О' | 'Б';
type VacancyStatus = 'Активна' | 'Закрыта' | 'Приостановлена';
type CandidateStage = 'Новый' | 'Скрининг' | 'Интервью' | 'Оффер';

interface Employee {
  id: number;
  name: string;
  initials: string;
  position: string;
  department: Department;
  hiredAt: string;
  employment: EmploymentType;
  status: EmployeeStatus;
  salary: number;
  color: string;
}

interface PayrollEntry {
  id: number;
  name: string;
  base: number;
  payrollType: PayrollType;
  orders: number;
  revenue: number;
  piecework: number;
  bonuses: number;
  deductions: number;
  total: number;
}

interface ScheduleDay {
  date: string;
  dayOfWeek: string;
}

interface ScheduleEntry {
  engineerId: number;
  engineerName: string;
  days: DayStatus[];
}

interface Candidate {
  id: number;
  name: string;
  stage: CandidateStage;
  appliedAt: string;
  phone: string;
  source: string;
}

interface Vacancy {
  id: number;
  title: string;
  department: Department;
  status: VacancyStatus;
  responses: number;
  currentStage: string;
  salary: string;
  openedAt: string;
  candidates: Candidate[];
}

// ─── Моковые данные ───────────────────────────────────────────────────────────

const EMPLOYEES: Employee[] = [
  { id: 1, name: 'Карпов Дмитрий Алексеевич', initials: 'КД', position: 'Инженер-монтажник', department: 'Монтаж', hiredAt: '2019-03-12', employment: 'Штат', status: 'Активен', salary: 85000, color: '#6366f1' },
  { id: 2, name: 'Петров Андрей Сергеевич', initials: 'ПА', position: 'Инженер по сервису', department: 'Сервис', hiredAt: '2020-07-01', employment: 'Штат', status: 'Активен', salary: 78000, color: '#0ea5e9' },
  { id: 3, name: 'Козлов Игорь Николаевич', initials: 'КИ', position: 'Старший инженер', department: 'Сервис', hiredAt: '2017-11-15', employment: 'Штат', status: 'Активен', salary: 95000, color: '#10b981' },
  { id: 4, name: 'Морозова Светлана Игоревна', initials: 'МС', position: 'Диспетчер', department: 'Диспетчерская', hiredAt: '2021-02-08', employment: 'Штат', status: 'Активен', salary: 52000, color: '#f59e0b' },
  { id: 5, name: 'Лебедев Алексей Викторович', initials: 'ЛА', position: 'Инженер-монтажник', department: 'Монтаж', hiredAt: '2022-05-20', employment: 'Штат', status: 'Испытание', salary: 65000, color: '#8b5cf6' },
  { id: 6, name: 'Никитина Ольга Петровна', initials: 'НО', position: 'Менеджер по продажам', department: 'Продажи', hiredAt: '2021-09-14', employment: 'Штат', status: 'Активен', salary: 60000, color: '#ec4899' },
  { id: 7, name: 'Воронов Павел Михайлович', initials: 'ВП', position: 'Инженер по сервису', department: 'Сервис', hiredAt: '2023-01-10', employment: 'Штат', status: 'Испытание', salary: 70000, color: '#f97316' },
  { id: 8, name: 'Соколова Мария Дмитриевна', initials: 'СМ', position: 'Бухгалтер', department: 'Бухгалтерия', hiredAt: '2018-06-25', employment: 'Штат', status: 'Активен', salary: 68000, color: '#14b8a6' },
  { id: 9, name: 'Тихонов Роман Андреевич', initials: 'ТР', position: 'Инженер по холодильному оборудованию', department: 'Сервис', hiredAt: '2020-03-17', employment: 'Штат', status: 'Активен', salary: 82000, color: '#a78bfa' },
  { id: 10, name: 'Федоров Евгений Олегович', initials: 'ФЕ', position: 'Инженер-монтажник', department: 'Монтаж', hiredAt: '2022-11-07', employment: 'Подряд', status: 'Активен', salary: 0, color: '#fb923c' },
  { id: 11, name: 'Захарова Анна Витальевна', initials: 'ЗА', position: 'Диспетчер', department: 'Диспетчерская', hiredAt: '2023-04-03', employment: 'Штат', status: 'Испытание', salary: 48000, color: '#4ade80' },
  { id: 12, name: 'Орлов Сергей Борисович', initials: 'ОС', position: 'Генеральный директор', department: 'Руководство', hiredAt: '2016-01-01', employment: 'Штат', status: 'Активен', salary: 150000, color: '#60a5fa' },
];

const PAYROLL_ENTRIES: PayrollEntry[] = [
  { id: 1, name: 'Карпов Д.А.', base: 40000, payrollType: 'Сдельный', orders: 18, revenue: 185000, piecework: 37000, bonuses: 5000, deductions: 9100, total: 72900 },
  { id: 2, name: 'Петров А.С.', base: 35000, payrollType: 'Сдельный', orders: 14, revenue: 142000, piecework: 28400, bonuses: 3000, deductions: 7840, total: 58560 },
  { id: 3, name: 'Козлов И.Н.', base: 50000, payrollType: 'Сдельный', orders: 22, revenue: 230000, piecework: 46000, bonuses: 8000, deductions: 12480, total: 91520 },
  { id: 4, name: 'Воронов П.М.', base: 35000, payrollType: 'Сдельный', orders: 10, revenue: 98000, piecework: 19600, bonuses: 2000, deductions: 5928, total: 50672 },
  { id: 5, name: 'Лебедев А.В.', base: 32000, payrollType: 'Сдельный', orders: 8, revenue: 76000, piecework: 15200, bonuses: 0, deductions: 5096, total: 42104 },
  { id: 6, name: 'Тихонов Р.А.', base: 40000, payrollType: 'Сдельный', orders: 16, revenue: 164000, piecework: 32800, bonuses: 4000, deductions: 9984, total: 66816 },
  { id: 7, name: 'Морозова С.И.', base: 52000, payrollType: 'Окладный', orders: 0, revenue: 0, piecework: 0, bonuses: 3000, deductions: 7150, total: 47850 },
  { id: 8, name: 'Никитина О.П.', base: 30000, payrollType: 'Окладный', orders: 0, revenue: 320000, piecework: 16000, bonuses: 5000, deductions: 6630, total: 44370 },
];

const WEEK_DAYS: ScheduleDay[] = [
  { date: '12.05', dayOfWeek: 'Пн' },
  { date: '13.05', dayOfWeek: 'Вт' },
  { date: '14.05', dayOfWeek: 'Ср' },
  { date: '15.05', dayOfWeek: 'Чт' },
  { date: '16.05', dayOfWeek: 'Пт' },
  { date: '17.05', dayOfWeek: 'Сб' },
  { date: '18.05', dayOfWeek: 'Вс' },
];

const SCHEDULE: ScheduleEntry[] = [
  { engineerId: 1, engineerName: 'Карпов Д.А.', days: ['Р', 'Р', 'Р', 'Р', 'Р', 'В', 'В'] },
  { engineerId: 2, engineerName: 'Петров А.С.', days: ['Р', 'Р', 'Р', 'Р', 'Р', 'В', 'В'] },
  { engineerId: 3, engineerName: 'Козлов И.Н.', days: ['Р', 'Р', 'О', 'О', 'О', 'О', 'О'] },
  { engineerId: 4, engineerName: 'Морозова С.И.', days: ['Р', 'Р', 'Р', 'Р', 'Р', 'Р', 'В'] },
  { engineerId: 5, engineerName: 'Лебедев А.В.', days: ['Р', 'Р', 'Р', 'В', 'В', 'Р', 'Р'] },
  { engineerId: 6, engineerName: 'Воронов П.М.', days: ['Б', 'Б', 'Б', 'Р', 'Р', 'В', 'В'] },
  { engineerId: 7, engineerName: 'Тихонов Р.А.', days: ['Р', 'Р', 'Р', 'Р', 'Р', 'В', 'В'] },
  { engineerId: 8, engineerName: 'Федоров Е.О.', days: ['Р', 'Р', 'В', 'Р', 'Р', 'Р', 'В'] },
];

const VACANCIES: Vacancy[] = [
  {
    id: 1,
    title: 'Инженер-холодильщик',
    department: 'Сервис',
    status: 'Активна',
    responses: 12,
    currentStage: 'Интервью',
    salary: '70 000 – 90 000 ₽',
    openedAt: '2026-04-15',
    candidates: [
      { id: 1, name: 'Смирнов Антон', stage: 'Новый', appliedAt: '13.05.2026', phone: '+7 921 111-22-33', source: 'hh.ru' },
      { id: 2, name: 'Быков Денис', stage: 'Скрининг', appliedAt: '11.05.2026', phone: '+7 903 444-55-66', source: 'Авито' },
      { id: 3, name: 'Громов Кирилл', stage: 'Интервью', appliedAt: '08.05.2026', phone: '+7 916 777-88-99', source: 'Реферал' },
      { id: 4, name: 'Суров Иван', stage: 'Оффер', appliedAt: '01.05.2026', phone: '+7 925 123-45-67', source: 'hh.ru' },
    ],
  },
  {
    id: 2,
    title: 'Инженер-монтажник',
    department: 'Монтаж',
    status: 'Активна',
    responses: 8,
    currentStage: 'Скрининг',
    salary: '65 000 – 85 000 ₽',
    openedAt: '2026-05-01',
    candidates: [
      { id: 5, name: 'Орехов Максим', stage: 'Новый', appliedAt: '15.05.2026', phone: '+7 919 222-33-44', source: 'hh.ru' },
      { id: 6, name: 'Зайцев Артём', stage: 'Скрининг', appliedAt: '12.05.2026', phone: '+7 906 555-66-77', source: 'Авито' },
      { id: 7, name: 'Попов Никита', stage: 'Новый', appliedAt: '14.05.2026', phone: '+7 912 888-99-00', source: 'Telegram' },
    ],
  },
  {
    id: 3,
    title: 'Диспетчер',
    department: 'Диспетчерская',
    status: 'Приостановлена',
    responses: 5,
    currentStage: 'Новый',
    salary: '45 000 – 55 000 ₽',
    openedAt: '2026-03-20',
    candidates: [
      { id: 8, name: 'Ковалёва Юлия', stage: 'Скрининг', appliedAt: '10.05.2026', phone: '+7 929 111-00-22', source: 'hh.ru' },
      { id: 9, name: 'Малышева Дарья', stage: 'Новый', appliedAt: '09.05.2026', phone: '+7 900 333-44-55', source: 'Авито' },
    ],
  },
];

const MONTHLY_PAYROLL_DATA = [
  { month: 'Июн', total: 380000 },
  { month: 'Июл', total: 412000 },
  { month: 'Авг', total: 395000 },
  { month: 'Сен', total: 430000 },
  { month: 'Окт', total: 418000 },
  { month: 'Ноя', total: 455000 },
  { month: 'Дек', total: 510000 },
  { month: 'Янв', total: 360000 },
  { month: 'Фев', total: 375000 },
  { month: 'Мар', total: 440000 },
  { month: 'Апр', total: 468000 },
  { month: 'Май', total: 474792 },
];

const DEPT_PIE_DATA = [
  { name: 'Сервис', value: 4, color: '#0ea5e9' },
  { name: 'Монтаж', value: 3, color: '#6366f1' },
  { name: 'Диспетчерская', value: 2, color: '#f59e0b' },
  { name: 'Продажи', value: 1, color: '#ec4899' },
  { name: 'Бухгалтерия', value: 1, color: '#14b8a6' },
  { name: 'Руководство', value: 1, color: '#60a5fa' },
];

const TURNOVER_DATA = [
  { month: 'Июн', rate: 2.1 },
  { month: 'Июл', rate: 0 },
  { month: 'Авг', rate: 1.5 },
  { month: 'Сен', rate: 0 },
  { month: 'Окт', rate: 3.2 },
  { month: 'Ноя', rate: 1.8 },
  { month: 'Дек', rate: 0 },
  { month: 'Янв', rate: 4.5 },
  { month: 'Фев', rate: 0 },
  { month: 'Мар', rate: 1.2 },
  { month: 'Апр', rate: 0 },
  { month: 'Май', rate: 0 },
];

const ENGINEER_ORDERS_DATA = [
  { name: 'Карпов', plan: 20, fact: 18 },
  { name: 'Петров', plan: 16, fact: 14 },
  { name: 'Козлов', plan: 20, fact: 22 },
  { name: 'Воронов', plan: 14, fact: 10 },
  { name: 'Лебедев', plan: 12, fact: 8 },
  { name: 'Тихонов', plan: 18, fact: 16 },
];

// ─── Вспомогательные компоненты ───────────────────────────────────────────────

const fmt = (n: number) =>
  n === 0 ? '—' : n.toLocaleString('ru-RU') + ' ₽';

const dayColor = (d: DayStatus): string => {
  switch (d) {
    case 'Р': return 'bg-emerald-100 text-emerald-700';
    case 'В': return 'bg-slate-100 text-slate-500';
    case 'О': return 'bg-blue-100 text-blue-700';
    case 'Б': return 'bg-orange-100 text-orange-700';
    default: return '';
  }
};

const dayLabel = (d: DayStatus): string => {
  switch (d) {
    case 'Р': return 'Рабочий';
    case 'В': return 'Выходной';
    case 'О': return 'Отпуск';
    case 'Б': return 'Больничный';
    default: return '';
  }
};

const statusBadge = (status: EmployeeStatus) => {
  const map: Record<EmployeeStatus, string> = {
    Активен: 'bg-emerald-100 text-emerald-700',
    Испытание: 'bg-amber-100 text-amber-700',
    Отпуск: 'bg-blue-100 text-blue-700',
    Уволен: 'bg-red-100 text-red-700',
  };
  return map[status];
};

const vacancyStatusBadge = (s: VacancyStatus) => {
  const map: Record<VacancyStatus, string> = {
    Активна: 'bg-emerald-100 text-emerald-700',
    Закрыта: 'bg-slate-100 text-slate-500',
    Приостановлена: 'bg-amber-100 text-amber-700',
  };
  return map[s];
};

const stageColor = (s: CandidateStage): string => {
  const map: Record<CandidateStage, string> = {
    Новый: 'bg-slate-50 border-slate-200',
    Скрининг: 'bg-blue-50 border-blue-200',
    Интервью: 'bg-amber-50 border-amber-200',
    Оффер: 'bg-emerald-50 border-emerald-200',
  };
  return map[s];
};

const KANBAN_STAGES: CandidateStage[] = ['Новый', 'Скрининг', 'Интервью', 'Оффер'];

// ─── Вкладка 1: Сотрудники ────────────────────────────────────────────────────

function EmployeesTab() {
  const [deptFilter, setDeptFilter] = useState<string>('Все');
  const [statusFilter, setStatusFilter] = useState<string>('Все');
  const [search, setSearch] = useState('');

  const departments = ['Все', 'Монтаж', 'Сервис', 'Диспетчерская', 'Продажи', 'Бухгалтерия', 'Руководство'];
  const statuses = ['Все', 'Активен', 'Испытание', 'Отпуск', 'Уволен'];

  const filtered = useMemo(() => {
    return EMPLOYEES.filter((e) => {
      const matchDept = deptFilter === 'Все' || e.department === deptFilter;
      const matchStatus = statusFilter === 'Все' || e.status === statusFilter;
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.position.toLowerCase().includes(search.toLowerCase());
      return matchDept && matchStatus && matchSearch;
    });
  }, [deptFilter, statusFilter, search]);

  const total = EMPLOYEES.length;
  const active = EMPLOYEES.filter((e) => e.status === 'Активен').length;
  const trial = EMPLOYEES.filter((e) => e.status === 'Испытание').length;
  const vacancies = 2;

  return (
    <div className="space-y-5">
      {/* Метрики */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Всего сотрудников', value: total, icon: 'Users', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Активных', value: active, icon: 'UserCheck', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'На испытании', value: trial, icon: 'UserCog', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Открытых вакансий', value: vacancies, icon: 'Briefcase', color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
            <div className={`w-10 h-10 rounded-lg ${m.bg} flex items-center justify-center flex-shrink-0`}>
              <Icon name={m.icon} size={20} className={m.color} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{m.value}</div>
              <div className="text-xs text-slate-500">{m.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Фильтры и кнопка */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Icon name="Search" size={15} className="absolute left-2.5 top-2.5 text-slate-400" />
          <Input
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="h-9 rounded-lg border border-slate-200 px-3 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg border border-slate-200 px-3 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <div className="ml-auto">
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
            onClick={() => toast.success('Открыта форма добавления сотрудника')}
          >
            <Icon name="UserPlus" size={15} />
            Добавить сотрудника
          </Button>
        </div>
      </div>

      {/* Таблица */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-medium text-slate-600">Сотрудник</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Должность</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Отдел</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Дата найма</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Тип</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Статус</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Оклад</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                        style={{ backgroundColor: emp.color }}
                      >
                        {emp.initials}
                      </div>
                      <span className="font-medium text-slate-800 whitespace-nowrap">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{emp.position}</td>
                  <td className="px-4 py-3 text-slate-600">{emp.department}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {new Date(emp.hiredAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs">
                      {emp.employment}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(emp.status)}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-800 whitespace-nowrap">
                    {emp.employment === 'Подряд' ? 'Сдельно' : fmt(emp.salary)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="text-slate-400 hover:text-indigo-600 transition-colors"
                      onClick={() => toast.info(`Карточка: ${emp.name}`)}
                    >
                      <Icon name="ChevronRight" size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
          Показано {filtered.length} из {total} сотрудников
        </div>
      </div>
    </div>
  );
}

// ─── Вкладка 2: Расчёт зарплаты ──────────────────────────────────────────────

function PayrollTab() {
  const [period, setPeriod] = useState('2026-05');

  const totals = useMemo(() => ({
    orders: PAYROLL_ENTRIES.reduce((s, e) => s + e.orders, 0),
    revenue: PAYROLL_ENTRIES.reduce((s, e) => s + e.revenue, 0),
    piecework: PAYROLL_ENTRIES.reduce((s, e) => s + e.piecework, 0),
    bonuses: PAYROLL_ENTRIES.reduce((s, e) => s + e.bonuses, 0),
    deductions: PAYROLL_ENTRIES.reduce((s, e) => s + e.deductions, 0),
    total: PAYROLL_ENTRIES.reduce((s, e) => s + e.total, 0),
  }), []);

  const MONTHS = [
    { value: '2026-05', label: 'Май 2026' },
    { value: '2026-04', label: 'Апрель 2026' },
    { value: '2026-03', label: 'Март 2026' },
    { value: '2026-02', label: 'Февраль 2026' },
    { value: '2026-01', label: 'Январь 2026' },
  ];

  return (
    <div className="space-y-5">
      {/* Шапка */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Icon name="CalendarDays" size={16} className="text-slate-500" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 px-3 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-sm"
            onClick={() => toast.info('Экспорт расчётных листков в PDF')}
          >
            <Icon name="Download" size={14} />
            Экспорт
          </Button>
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
            onClick={() => toast.success('Начисление зарплаты проведено за период ' + period)}
          >
            <Icon name="CheckCircle" size={14} />
            Провести начисление
          </Button>
        </div>
      </div>

      {/* Таблица зарплаты */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-medium text-slate-600">Сотрудник</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Тип</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Нарядов</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Выручка</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Сдельная</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Надбавки</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Удержания</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600 font-bold">К выплате</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PAYROLL_ENTRIES.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{e.name}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={`text-xs ${e.payrollType === 'Сдельный' ? 'border-indigo-300 text-indigo-700' : 'border-slate-300 text-slate-600'}`}
                    >
                      {e.payrollType}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700">{e.orders || '—'}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{e.revenue ? e.revenue.toLocaleString('ru-RU') : '—'}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{e.piecework ? fmt(e.piecework) : '—'}</td>
                  <td className="px-4 py-3 text-right text-emerald-600">{e.bonuses ? fmt(e.bonuses) : '—'}</td>
                  <td className="px-4 py-3 text-right text-red-500">−{e.deductions.toLocaleString('ru-RU')}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">{fmt(e.total)}</td>
                  <td className="px-4 py-3">
                    <button
                      className="text-slate-400 hover:text-indigo-600 transition-colors"
                      onClick={() => toast.info(`Расчётный листок: ${e.name}`)}
                    >
                      <Icon name="FileText" size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-200 font-semibold">
                <td className="px-4 py-3 text-slate-800">Итого</td>
                <td></td>
                <td className="px-4 py-3 text-right text-slate-800">{totals.orders}</td>
                <td className="px-4 py-3 text-right text-slate-800">{totals.revenue.toLocaleString('ru-RU')}</td>
                <td className="px-4 py-3 text-right text-slate-800">{fmt(totals.piecework)}</td>
                <td className="px-4 py-3 text-right text-emerald-700">{fmt(totals.bonuses)}</td>
                <td className="px-4 py-3 text-right text-red-600">−{totals.deductions.toLocaleString('ru-RU')}</td>
                <td className="px-4 py-3 text-right text-indigo-700 font-bold text-base">{fmt(totals.total)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* График выплат по месяцам */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="text-sm font-semibold text-slate-700 mb-4">Выплаты по месяцам (12 мес.)</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={MONTHLY_PAYROLL_DATA} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => (v / 1000) + 'к'} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v: number) => [v.toLocaleString('ru-RU') + ' ₽', 'ФОТ']} />
            <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} name="ФОТ" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Вкладка 3: Расписание ────────────────────────────────────────────────────

function ScheduleTab() {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  const legend = [
    { code: 'Р' as DayStatus, label: 'Рабочий', cls: 'bg-emerald-100 text-emerald-700' },
    { code: 'В' as DayStatus, label: 'Выходной', cls: 'bg-slate-100 text-slate-500' },
    { code: 'О' as DayStatus, label: 'Отпуск', cls: 'bg-blue-100 text-blue-700' },
    { code: 'Б' as DayStatus, label: 'Больничный', cls: 'bg-orange-100 text-orange-700' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600 font-medium">Вид:</span>
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          {(['week', 'month'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={`px-4 py-1.5 text-sm transition-colors ${viewMode === m ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              {m === 'week' ? 'Неделя' : 'Месяц'}
            </button>
          ))}
        </div>

        <div className="ml-auto flex gap-2">
          <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500">
            <Icon name="ChevronLeft" size={16} />
          </button>
          <span className="self-center text-sm font-medium text-slate-700">12 – 18 мая 2026</span>
          <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500">
            <Icon name="ChevronRight" size={16} />
          </button>
        </div>
      </div>

      {/* Легенда */}
      <div className="flex flex-wrap gap-3">
        {legend.map((l) => (
          <span key={l.code} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${l.cls}`}>
            <span className="font-bold">{l.code}</span>
            {l.label}
          </span>
        ))}
      </div>

      {/* Сетка расписания */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-medium text-slate-600 min-w-[160px]">Инженер</th>
                {WEEK_DAYS.map((d) => (
                  <th key={d.date} className="text-center px-3 py-3 font-medium text-slate-600 min-w-[80px]">
                    <div className="text-xs text-slate-400">{d.dayOfWeek}</div>
                    <div>{d.date}</div>
                  </th>
                ))}
                <th className="text-center px-3 py-3 font-medium text-slate-600">Раб.дней</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SCHEDULE.map((row) => {
                const workDays = row.days.filter((d) => d === 'Р').length;
                return (
                  <tr key={row.engineerId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{row.engineerName}</td>
                    {row.days.map((d, i) => (
                      <td key={i} className="px-3 py-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-semibold cursor-help ${dayColor(d)}`}
                          title={dayLabel(d)}
                        >
                          {d}
                        </span>
                      </td>
                    ))}
                    <td className="px-3 py-3 text-center text-slate-700 font-medium">{workDays}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-sm"
          onClick={() => toast.success('Расписание экспортировано')}
        >
          <Icon name="Download" size={14} />
          Экспорт расписания
        </Button>
      </div>
    </div>
  );
}

// ─── Вкладка 4: Рекрутинг ────────────────────────────────────────────────────

function RecruitingTab() {
  const [activeVacancy, setActiveVacancy] = useState<number>(1);

  const vacancy = VACANCIES.find((v) => v.id === activeVacancy) ?? VACANCIES[0];

  const stageCount = (stage: CandidateStage) =>
    vacancy.candidates.filter((c) => c.stage === stage).length;

  return (
    <div className="space-y-5">
      {/* Список вакансий */}
      <div className="grid gap-3 sm:grid-cols-3">
        {VACANCIES.map((v) => (
          <button
            key={v.id}
            onClick={() => setActiveVacancy(v.id)}
            className={`text-left rounded-xl border p-4 transition-all shadow-sm ${activeVacancy === v.id ? 'border-indigo-400 bg-indigo-50 ring-1 ring-indigo-300' : 'border-slate-200 bg-white hover:border-slate-300'}`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="font-semibold text-slate-800 text-sm leading-snug">{v.title}</span>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${vacancyStatusBadge(v.status)}`}>
                {v.status}
              </span>
            </div>
            <div className="text-xs text-slate-500 mb-3">{v.department} · {v.salary}</div>
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <Icon name="Users" size={12} className="text-slate-400" />
                {v.responses} откликов
              </span>
              <span className="flex items-center gap-1">
                <Icon name="Layers" size={12} className="text-slate-400" />
                {v.currentStage}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Icon name="LayoutKanban" size={16} className="text-indigo-500" />
          Воронка подбора — {vacancy.title}
        </div>
        <Button
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
          onClick={() => toast.success('Вакансия опубликована на hh.ru, Авито')}
        >
          <Icon name="Send" size={13} />
          Опубликовать
        </Button>
      </div>

      {/* Kanban доска */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {KANBAN_STAGES.map((stage) => {
          const candidates = vacancy.candidates.filter((c) => c.stage === stage);
          return (
            <div key={stage} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{stage}</span>
                <span className="text-xs bg-slate-200 text-slate-600 rounded-full px-1.5 py-0.5">{stageCount(stage)}</span>
              </div>
              <div className={`min-h-[120px] rounded-xl border p-2 space-y-2 ${stageColor(stage)}`}>
                {candidates.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => toast.info(`${c.name} · ${c.phone}`)}
                  >
                    <div className="font-medium text-slate-800 text-sm mb-1">{c.name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                      <Icon name="Calendar" size={11} />
                      {c.appliedAt}
                    </div>
                    <Badge variant="outline" className="text-xs py-0">{c.source}</Badge>
                  </div>
                ))}
                {candidates.length === 0 && (
                  <div className="text-center text-xs text-slate-400 py-6">Нет кандидатов</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Вкладка 5: Аналитика ────────────────────────────────────────────────────

function AnalyticsTab() {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        {/* PieChart: отделы */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Icon name="PieChart" size={15} className="text-indigo-500" />
            Распределение по отделам
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={DEPT_PIE_DATA}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {DEPT_PIE_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [v + ' чел.', '']} />
              <Legend
                formatter={(v) => <span className="text-xs text-slate-600">{v}</span>}
                iconType="circle"
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* LineChart: текучесть */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Icon name="TrendingDown" size={15} className="text-red-400" />
            Текучесть кадров (% в месяц)
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={TURNOVER_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis unit="%" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 6]} />
              <Tooltip formatter={(v: number) => [v + '%', 'Текучесть']} />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#f43f5e"
                strokeWidth={2}
                dot={{ fill: '#f43f5e', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BarChart: план/факт нарядов */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Icon name="BarChart2" size={15} className="text-indigo-500" />
          План / Факт нарядов по инженерам (май 2026)
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={ENGINEER_ORDERS_DATA} barSize={20} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-slate-600">{v}</span>} />
            <Bar dataKey="plan" name="План" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="fact" name="Факт" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* KPI карточки */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Средний стаж', value: '3.8 лет', icon: 'Award', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Текучесть (год)', value: '8.4%', icon: 'TrendingDown', color: 'text-red-500', bg: 'bg-red-50' },
          { label: 'Ср. зарплата инженера', value: '75 360 ₽', icon: 'Wallet', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'ФОТ (месяц)', value: '474 792 ₽', icon: 'Banknote', color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
            <div className={`w-9 h-9 rounded-lg ${m.bg} flex items-center justify-center flex-shrink-0`}>
              <Icon name={m.icon} size={18} className={m.color} />
            </div>
            <div>
              <div className="font-bold text-slate-800 text-base">{m.value}</div>
              <div className="text-xs text-slate-500">{m.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Главный компонент ────────────────────────────────────────────────────────

type TabId = 'employees' | 'payroll' | 'schedule' | 'recruiting' | 'analytics';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: 'employees', label: 'Сотрудники', icon: 'Users' },
  { id: 'payroll', label: 'Зарплата', icon: 'Wallet' },
  { id: 'schedule', label: 'Расписание', icon: 'CalendarDays' },
  { id: 'recruiting', label: 'Рекрутинг', icon: 'UserPlus' },
  { id: 'analytics', label: 'Аналитика', icon: 'BarChart2' },
];

function HRFull() {
  const [activeTab, setActiveTab] = useState<TabId>('employees');

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      {/* Заголовок */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Icon name="Users" size={22} className="text-indigo-600" />
            HR-модуль
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Управление персоналом · АСУ СЦ «Сервис Климат»</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-sm"
            onClick={() => toast.info('Формирование HR-отчёта...')}
          >
            <Icon name="FileBarChart" size={14} />
            Отчёт
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-sm"
            onClick={() => toast.info('Синхронизация с 1С:ЗУП')}
          >
            <Icon name="RefreshCw" size={14} />
            Синхронизация
          </Button>
        </div>
      </div>

      {/* Навигация по вкладкам */}
      <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1 shadow-sm mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Icon name={tab.icon} size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Содержимое вкладок */}
      {activeTab === 'employees' && <EmployeesTab />}
      {activeTab === 'payroll' && <PayrollTab />}
      {activeTab === 'schedule' && <ScheduleTab />}
      {activeTab === 'recruiting' && <RecruitingTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}
    </div>
  );
}

export default HRFull;
