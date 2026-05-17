import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  BarChart, Bar,
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

type EmployeeStatus = 'Активен' | 'Отпуск' | 'Больничный';
type VacancyStatus = 'Открыта' | 'На рассмотрении' | 'Закрыта';
type CourseStatus = 'В процессе' | 'Завершён' | 'Не начат' | 'Обязательный';

interface Employee {
  id: number;
  name: string;
  initials: string;
  position: string;
  phone: string;
  status: EmployeeStatus;
  rating: number;
  color: string;
}

interface EngineerKPI {
  name: string;
  shortName: string;
  orders: number;
  nps: number;
  sla: number;
  margin: number;
  score: number;
}

interface Vacancy {
  id: number;
  title: string;
  requirements: string[];
  salaryFrom: number;
  salaryTo: number;
  responses: number;
  status: VacancyStatus;
}

interface Course {
  id: number;
  title: string;
  engineers: string[];
  progress: number;
  deadline: string;
  status: CourseStatus;
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const EMPLOYEES: Employee[] = [
  { id: 1,  name: 'Петров Алексей',    initials: 'ПА', position: 'Старший инженер',   phone: '+7 900 111-22-33', status: 'Активен',    rating: 5, color: '#6366f1' },
  { id: 2,  name: 'Иванов Кирилл',     initials: 'ИК', position: 'Инженер сервиса',   phone: '+7 900 222-33-44', status: 'Активен',    rating: 5, color: '#10b981' },
  { id: 3,  name: 'Сидоров Михаил',    initials: 'СМ', position: 'Инженер монтажа',   phone: '+7 900 333-44-55', status: 'Активен',    rating: 4, color: '#f59e0b' },
  { id: 4,  name: 'Козлов Роман',      initials: 'КР', position: 'Инженер сервиса',   phone: '+7 900 444-55-66', status: 'Отпуск',     rating: 4, color: '#ec4899' },
  { id: 5,  name: 'Новиков Дмитрий',   initials: 'НД', position: 'Инженер монтажа',   phone: '+7 900 555-66-77', status: 'Активен',    rating: 4, color: '#8b5cf6' },
  { id: 6,  name: 'Морозов Василий',   initials: 'МВ', position: 'Инженер сервиса',   phone: '+7 900 666-77-88', status: 'Активен',    rating: 4, color: '#14b8a6' },
  { id: 7,  name: 'Алексеев Игорь',    initials: 'АИ', position: 'Техник',             phone: '+7 900 777-88-99', status: 'Больничный', rating: 3, color: '#f97316' },
  { id: 8,  name: 'Громов Павел',      initials: 'ГП', position: 'Инженер сервиса',   phone: '+7 900 888-99-00', status: 'Активен',    rating: 4, color: '#06b6d4' },
  { id: 9,  name: 'Фролова Анна',      initials: 'ФА', position: 'Диспетчер',          phone: '+7 900 123-45-67', status: 'Активен',    rating: 5, color: '#e11d48' },
  { id: 10, name: 'Лебедева Мария',    initials: 'ЛМ', position: 'Диспетчер',          phone: '+7 900 234-56-78', status: 'Активен',    rating: 4, color: '#7c3aed' },
  { id: 11, name: 'Орлов Сергей',      initials: 'ОС', position: 'Менеджер продаж',    phone: '+7 900 345-67-89', status: 'Активен',    rating: 5, color: '#059669' },
  { id: 12, name: 'Зайцева Татьяна',   initials: 'ЗТ', position: 'Бухгалтер',          phone: '+7 900 456-78-90', status: 'Отпуск',     rating: 4, color: '#d97706' },
];

const ENGINEER_KPI: EngineerKPI[] = [
  { name: 'Петров А.В.',   shortName: 'Петров',  orders: 52, nps: 96, sla: 98, margin: 37, score: 9.4 },
  { name: 'Иванов К.П.',   shortName: 'Иванов',  orders: 48, nps: 94, sla: 96, margin: 36, score: 9.1 },
  { name: 'Сидоров М.Н.',  shortName: 'Сидоров', orders: 45, nps: 93, sla: 95, margin: 35, score: 8.8 },
  { name: 'Козлов Р.Е.',   shortName: 'Козлов',  orders: 41, nps: 91, sla: 94, margin: 34, score: 8.5 },
  { name: 'Новиков Д.С.',  shortName: 'Новиков', orders: 38, nps: 90, sla: 93, margin: 34, score: 8.2 },
  { name: 'Морозов В.А.',  shortName: 'Морозов', orders: 35, nps: 88, sla: 91, margin: 33, score: 7.9 },
  { name: 'Алексеев И.О.', shortName: 'Алексеев',orders: 32, nps: 87, sla: 90, margin: 32, score: 7.6 },
  { name: 'Громов П.Г.',   shortName: 'Громов',  orders: 28, nps: 84, sla: 88, margin: 31, score: 7.2 },
];

const RADAR_DATA = [
  { criterion: 'Скорость',              Петров: 95, Иванов: 88, Сидоров: 82 },
  { criterion: 'Качество',              Петров: 92, Иванов: 90, Сидоров: 87 },
  { criterion: 'SLA',                   Петров: 98, Иванов: 96, Сидоров: 95 },
  { criterion: 'Клиентоориентир.',      Петров: 96, Иванов: 94, Сидоров: 93 },
  { criterion: 'Доход',                 Петров: 94, Иванов: 89, Сидоров: 84 },
];

const PIE_DATA = [
  { name: 'Инженеры сервиса', value: 10, color: '#6366f1' },
  { name: 'Инженеры монтажа', value: 6,  color: '#10b981' },
  { name: 'Диспетчеры',       value: 3,  color: '#f59e0b' },
  { name: 'Менеджеры продаж', value: 2,  color: '#ec4899' },
  { name: 'Бухгалтерия',      value: 2,  color: '#8b5cf6' },
  { name: 'Руководство',      value: 1,  color: '#14b8a6' },
];

const VACANCIES: Vacancy[] = [
  {
    id: 1,
    title: 'Старший инженер по климатическому оборудованию',
    requirements: ['Опыт 3+ лет', 'Допуск к хладагентам', 'Права кат. B', 'Знание VRF-систем'],
    salaryFrom: 80000,
    salaryTo: 120000,
    responses: 14,
    status: 'Открыта',
  },
  {
    id: 2,
    title: 'Диспетчер сервисного центра',
    requirements: ['Опыт работы в 1С', 'Грамотная речь', 'Стрессоустойчивость', 'Знание CRM'],
    salaryFrom: 45000,
    salaryTo: 60000,
    responses: 28,
    status: 'На рассмотрении',
  },
  {
    id: 3,
    title: 'Менеджер по продажам климатического оборудования',
    requirements: ['Опыт продаж B2B', 'Техническое понимание', 'Навыки переговоров', 'Водительские права'],
    salaryFrom: 55000,
    salaryTo: 90000,
    responses: 19,
    status: 'Открыта',
  },
];

const COURSES: Course[] = [
  { id: 1, title: 'Допуск к работе с хладагентами F-Gas',   engineers: ['Алексеев И.О.', 'Громов П.Г.'],     progress: 65, deadline: '01.06.2026', status: 'В процессе' },
  { id: 2, title: 'VRF-системы Daikin — расширенный курс',  engineers: ['Козлов Р.Е.', 'Новиков Д.С.'],       progress: 40, deadline: '15.06.2026', status: 'В процессе' },
  { id: 3, title: 'Охрана труда и электробезопасность',     engineers: ['Весь персонал'],                      progress: 100, deadline: '01.05.2026', status: 'Завершён' },
  { id: 4, title: 'Mitsubishi Electric — сертификация',     engineers: ['Петров А.В.', 'Иванов К.П.'],         progress: 80, deadline: '20.05.2026', status: 'В процессе' },
  { id: 5, title: 'Диагностика чиллеров и фанкойлов',       engineers: ['Сидоров М.Н.', 'Морозов В.А.'],      progress: 0,  deadline: '01.07.2026', status: 'Не начат' },
  { id: 6, title: 'Техника безопасности при высотных работах', engineers: ['Инженеры монтажа (6 чел.)'],       progress: 100, deadline: '01.04.2026', status: 'Завершён' },
  { id: 7, title: 'CRM-система — продвинутый уровень',      engineers: ['Фролова А.', 'Лебедева М.', 'Орлов С.'], progress: 55, deadline: '10.06.2026', status: 'В процессе' },
  { id: 8, title: 'Пожарная безопасность (обязательный)',   engineers: ['Весь персонал'],                      progress: 30, deadline: '01.06.2026', status: 'Обязательный' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<EmployeeStatus, string> = {
  'Активен':    'bg-green-100 text-green-700',
  'Отпуск':     'bg-blue-100 text-blue-700',
  'Больничный': 'bg-orange-100 text-orange-700',
};

const VACANCY_STATUS_COLORS: Record<VacancyStatus, string> = {
  'Открыта':        'bg-green-100 text-green-700',
  'На рассмотрении': 'bg-yellow-100 text-yellow-700',
  'Закрыта':        'bg-gray-100 text-gray-600',
};

const COURSE_STATUS_COLORS: Record<CourseStatus, string> = {
  'В процессе':  'bg-blue-100 text-blue-700',
  'Завершён':    'bg-green-100 text-green-700',
  'Не начат':    'bg-gray-100 text-gray-600',
  'Обязательный': 'bg-red-100 text-red-700',
};

function scoreColor(score: number): string {
  if (score >= 9) return '#22c55e';
  if (score >= 8) return '#34d399';
  if (score >= 7) return '#facc15';
  return '#fb923c';
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
  ));
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: number | string;
  iconName: string;
  iconColor: string;
  bgColor: string;
  delta?: string;
}

function KpiCard({ label, value, iconName, iconColor, bgColor, delta }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {delta && <p className="text-xs text-gray-400 mt-1">{delta}</p>}
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColor}`}>
            <Icon name={iconName} className={`w-6 h-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HRDashboardFull() {
  const [activeTab, setActiveTab] = useState('employees');

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HR Дашборд / Персонал</h1>
          <p className="text-gray-500 text-sm mt-1">Управление сотрудниками, эффективность и обучение</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info('Экспорт отчёта запущен')}>
            <Icon name="Download" className="w-4 h-4 mr-1" /> Экспорт
          </Button>
          <Button size="sm" onClick={() => toast.success('Форма добавления сотрудника открыта')}>
            <Icon name="UserPlus" className="w-4 h-4 mr-1" /> Добавить сотрудника
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Всего сотрудников" value={24} iconName="Users"       iconColor="text-indigo-600"  bgColor="bg-indigo-50" delta="+2 за месяц" />
        <KpiCard label="Инженеры"          value={16} iconName="Wrench"      iconColor="text-emerald-600" bgColor="bg-emerald-50" delta="12 на выездах" />
        <KpiCard label="Офис"              value={8}  iconName="Building2"   iconColor="text-sky-600"     bgColor="bg-sky-50" delta="все на месте" />
        <KpiCard label="Открытых вакансий" value={3}  iconName="Briefcase"   iconColor="text-orange-600"  bgColor="bg-orange-50" delta="61 отклик" />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border">
          <TabsTrigger value="employees">Сотрудники</TabsTrigger>
          <TabsTrigger value="efficiency">Эффективность</TabsTrigger>
          <TabsTrigger value="vacancies">Вакансии</TabsTrigger>
          <TabsTrigger value="training">Обучение</TabsTrigger>
        </TabsList>

        {/* ── Tab: Employees ─────────────────────────────────────────────────── */}
        <TabsContent value="employees" className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {EMPLOYEES.map((emp) => (
              <Card key={emp.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <Avatar className="w-14 h-14">
                      <AvatarFallback
                        style={{ backgroundColor: emp.color }}
                        className="text-white font-semibold text-sm"
                      >
                        {emp.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm leading-tight">{emp.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{emp.position}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Icon name="Phone" className="w-3 h-3" />
                      <span>{emp.phone}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">{renderStars(emp.rating)}</div>
                    <Badge className={`text-xs px-2 py-0.5 rounded-full border-0 ${STATUS_COLORS[emp.status]}`}>
                      {emp.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-7 mt-1"
                      onClick={() => toast.info(`Профиль: ${emp.name}`)}
                    >
                      Профиль
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Tab: Efficiency ────────────────────────────────────────────────── */}
        <TabsContent value="efficiency" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Radar Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Сравнение топ-3 инженеров</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={RADAR_DATA}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="criterion" tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <PolarRadiusAxis angle={90} domain={[70, 100]} tick={{ fontSize: 9, fill: '#9ca3af' }} />
                    <Radar name="Петров А.В."   dataKey="Петров"  stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
                    <Radar name="Иванов К.П."   dataKey="Иванов"  stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
                    <Radar name="Сидоров М.Н."  dataKey="Сидоров" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={2} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar Chart — orders per month */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">КПЭ — нарядов за месяц</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={ENGINEER_KPI} layout="vertical" margin={{ left: 16, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                    <XAxis type="number" domain={[0, 60]} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="shortName" tick={{ fontSize: 11 }} width={58} />
                    <Tooltip />
                    <Bar dataKey="orders" name="Нарядов" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Score Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Балл эффективности инженеров</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-gray-500 text-xs uppercase">
                      <th className="text-left py-2 pr-4 font-medium">Инженер</th>
                      <th className="text-center py-2 px-3 font-medium">Нарядов</th>
                      <th className="text-center py-2 px-3 font-medium">NPS</th>
                      <th className="text-center py-2 px-3 font-medium">SLA%</th>
                      <th className="text-center py-2 px-3 font-medium">Маржа%</th>
                      <th className="text-left py-2 pl-3 font-medium w-40">Балл / 10</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ENGINEER_KPI.map((eng) => (
                      <tr key={eng.name} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-2.5 pr-4 font-medium text-gray-900">{eng.name}</td>
                        <td className="py-2.5 px-3 text-center text-gray-700">{eng.orders}</td>
                        <td className="py-2.5 px-3 text-center text-gray-700">{eng.nps}</td>
                        <td className="py-2.5 px-3 text-center text-gray-700">{eng.sla}%</td>
                        <td className="py-2.5 px-3 text-center text-gray-700">{eng.margin}%</td>
                        <td className="py-2.5 pl-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${eng.score * 10}%`, backgroundColor: scoreColor(eng.score) }}
                              />
                            </div>
                            <span className="text-xs font-bold text-gray-800 w-8 text-right">
                              {eng.score.toFixed(1)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Pie — staff structure */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Структура персонала по должностям</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <ResponsiveContainer width={240} height={200}>
                <PieChart>
                  <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                    {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v} чел.`]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {PIE_DATA.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-700">{item.name}</span>
                    <span className="font-semibold text-gray-900 ml-auto pl-4">{item.value} чел.</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab: Vacancies ─────────────────────────────────────────────────── */}
        <TabsContent value="vacancies" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">3 открытые вакансии · 61 отклик всего</p>
            <Button size="sm" onClick={() => toast.success('Форма новой вакансии открыта')}>
              <Icon name="Plus" className="w-4 h-4 mr-1" /> Добавить вакансию
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {VACANCIES.map((vac) => (
              <Card key={vac.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{vac.title}</h3>
                        <Badge className={`text-xs px-2 py-0.5 rounded-full border-0 ${VACANCY_STATUS_COLORS[vac.status]}`}>
                          {vac.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {vac.requirements.map((req) => (
                          <span key={req} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{req}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-5 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Icon name="Banknote" className="w-4 h-4 text-green-500" />
                          {vac.salaryFrom.toLocaleString('ru')} – {vac.salaryTo.toLocaleString('ru')} ₽
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="Users" className="w-4 h-4 text-indigo-500" />
                          {vac.responses} откликов
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" onClick={() => toast.info(`Отклики по вакансии: ${vac.title}`)}>
                        <Icon name="Eye" className="w-4 h-4 mr-1" /> Отклики
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => toast.info(`Редактирование: ${vac.title}`)}>
                        <Icon name="Pencil" className="w-4 h-4 mr-1" /> Изменить
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Tab: Training ──────────────────────────────────────────────────── */}
        <TabsContent value="training" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">8 программ обучения и сертификации</p>
            <Button size="sm" onClick={() => toast.success('Форма назначения обучения открыта')}>
              <Icon name="GraduationCap" className="w-4 h-4 mr-1" /> Назначить обучение
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {COURSES.map((course) => (
              <Card key={course.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <Icon name="BookOpen" className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-gray-900 text-sm">{course.title}</span>
                        <Badge className={`text-xs px-2 py-0.5 rounded-full border-0 ${COURSE_STATUS_COLORS[course.status]}`}>
                          {course.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                        <Icon name="Users" className="w-3 h-3" />
                        <span>{course.engineers.join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Progress
                            value={course.progress}
                            className="h-2"
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-700 w-10 text-right">{course.progress}%</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Icon name="Calendar" className="w-3 h-3" />
                        <span>до {course.deadline}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => toast.info(`Подробнее: ${course.title}`)}
                      >
                        Подробнее
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
