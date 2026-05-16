import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = 'catalog' | 'progress' | 'management';
type CourseCategory =
  | 'all'
  | 'refrigeration'
  | 'electrical'
  | 'safety'
  | 'sales'
  | 'softskills';
type CourseStatus = 'available' | 'in_progress' | 'completed';
type CourseLevel = 'Базовый' | 'Средний' | 'Продвинутый';

interface CourseModule {
  id: string;
  title: string;
  duration: number;
  completed: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: Exclude<CourseCategory, 'all'>;
  level: CourseLevel;
  durationHours: number;
  modulesCount: number;
  ratingsCount: number;
  hasCertificate: boolean;
  gradientFrom: string;
  gradientTo: string;
  icon: string;
  status: CourseStatus;
  progressPercent: number;
  modules: CourseModule[];
}

interface Employee {
  id: string;
  name: string;
  initials: string;
  role: string;
  completedCourses: number;
  inProgressCourses: number;
  completionPercent: number;
  lastActivity: string;
}

interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  issuedAt: string;
  expiresAt: string | null;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Монтаж и настройка VRF-систем',
    description:
      'Полный курс по монтажу, пусконаладке и программированию мультизональных VRF-систем Daikin, Mitsubishi и Haier.',
    category: 'refrigeration',
    level: 'Продвинутый',
    durationHours: 18,
    modulesCount: 9,
    ratingsCount: 42,
    hasCertificate: true,
    gradientFrom: '#1d4ed8',
    gradientTo: '#7c3aed',
    icon: 'Cpu',
    status: 'in_progress',
    progressPercent: 44,
    modules: [
      { id: 'm1', title: 'Введение в VRF-технологии', duration: 90, completed: true },
      { id: 'm2', title: 'Монтаж наружного блока', duration: 120, completed: true },
      { id: 'm3', title: 'Разводка фреонопроводов', duration: 150, completed: true },
      { id: 'm4', title: 'Монтаж внутренних блоков', duration: 120, completed: true },
      { id: 'm5', title: 'Вакуумирование и заправка', duration: 90, completed: false },
      { id: 'm6', title: 'Пусконаладка системы', duration: 120, completed: false },
      { id: 'm7', title: 'Программирование контроллеров', duration: 150, completed: false },
      { id: 'm8', title: 'Диагностика неисправностей VRF', duration: 120, completed: false },
      { id: 'm9', title: 'Итоговый экзамен', duration: 60, completed: false },
    ],
  },
  {
    id: 'c2',
    title: 'Диагностика неисправностей кондиционеров',
    description:
      'Методы диагностики по кодам ошибок, давлению фреона и показаниям датчиков. Практика на реальных кейсах.',
    category: 'refrigeration',
    level: 'Средний',
    durationHours: 12,
    modulesCount: 6,
    ratingsCount: 67,
    hasCertificate: true,
    gradientFrom: '#0891b2',
    gradientTo: '#0d9488',
    icon: 'Stethoscope',
    status: 'completed',
    progressPercent: 100,
    modules: [],
  },
  {
    id: 'c3',
    title: 'Работа с хладагентами (F-газы)',
    description:
      'Классификация хладагентов, правила обращения, учёт и утилизация. Требования Росприроднадзора.',
    category: 'refrigeration',
    level: 'Базовый',
    durationHours: 8,
    modulesCount: 4,
    ratingsCount: 89,
    hasCertificate: true,
    gradientFrom: '#059669',
    gradientTo: '#0891b2',
    icon: 'Droplets',
    status: 'completed',
    progressPercent: 100,
    modules: [],
  },
  {
    id: 'c4',
    title: 'Охрана труда при работе на высоте',
    description:
      'Правила работы на высоте, применение СИЗ, оформление нарядов-допусков. Обязательный курс для монтажников.',
    category: 'safety',
    level: 'Базовый',
    durationHours: 6,
    modulesCount: 3,
    ratingsCount: 134,
    hasCertificate: true,
    gradientFrom: '#dc2626',
    gradientTo: '#ea580c',
    icon: 'ShieldAlert',
    status: 'in_progress',
    progressPercent: 67,
    modules: [
      { id: 'm1', title: 'Нормативная база', duration: 60, completed: true },
      { id: 'm2', title: 'Средства защиты и снаряжение', duration: 90, completed: true },
      { id: 'm3', title: 'Экзамен по охране труда', duration: 60, completed: false },
    ],
  },
  {
    id: 'c5',
    title: 'Клиентский сервис и коммуникации',
    description:
      'Работа с клиентами на объекте: объяснение технических проблем, управление ожиданиями, сбор обратной связи.',
    category: 'softskills',
    level: 'Базовый',
    durationHours: 5,
    modulesCount: 5,
    ratingsCount: 58,
    hasCertificate: false,
    gradientFrom: '#7c3aed',
    gradientTo: '#db2777',
    icon: 'MessageCircle',
    status: 'completed',
    progressPercent: 100,
    modules: [],
  },
  {
    id: 'c6',
    title: 'Основы продаж сервисных контрактов',
    description:
      'Техники допродаж: предложение ТО, расширенной гарантии и сервисных пакетов при выезде на объект.',
    category: 'sales',
    level: 'Средний',
    durationHours: 7,
    modulesCount: 5,
    ratingsCount: 31,
    hasCertificate: false,
    gradientFrom: '#d97706',
    gradientTo: '#65a30d',
    icon: 'TrendingUp',
    status: 'available',
    progressPercent: 0,
    modules: [],
  },
  {
    id: 'c7',
    title: 'Электробезопасность II группа',
    description:
      'Допуск по электробезопасности второй группы. Правила работы с электроустановками до 1000В.',
    category: 'electrical',
    level: 'Базовый',
    durationHours: 10,
    modulesCount: 5,
    ratingsCount: 96,
    hasCertificate: true,
    gradientFrom: '#ca8a04',
    gradientTo: '#dc2626',
    icon: 'Zap',
    status: 'completed',
    progressPercent: 100,
    modules: [],
  },
  {
    id: 'c8',
    title: 'Электросхемы климатических систем',
    description:
      'Чтение принципиальных схем, поиск неисправностей в электрической части кондиционеров и чиллеров.',
    category: 'electrical',
    level: 'Средний',
    durationHours: 14,
    modulesCount: 7,
    ratingsCount: 44,
    hasCertificate: true,
    gradientFrom: '#2563eb',
    gradientTo: '#ca8a04',
    icon: 'Circuit',
    status: 'available',
    progressPercent: 0,
    modules: [],
  },
  {
    id: 'c9',
    title: 'Работа с системой управления (ERP)',
    description:
      'Ведение нарядов, фото-отчётность, списание материалов и оформление документов через мобильное приложение.',
    category: 'softskills',
    level: 'Базовый',
    durationHours: 3,
    modulesCount: 3,
    ratingsCount: 112,
    hasCertificate: false,
    gradientFrom: '#0f766e',
    gradientTo: '#1d4ed8',
    icon: 'Smartphone',
    status: 'completed',
    progressPercent: 100,
    modules: [],
  },
  {
    id: 'c10',
    title: 'Чиллеры и фанкойлы: монтаж и обслуживание',
    description:
      'Устройство, монтаж, пусконаладка и техническое обслуживание чиллеров и фанкойлных систем.',
    category: 'refrigeration',
    level: 'Продвинутый',
    durationHours: 20,
    modulesCount: 10,
    ratingsCount: 27,
    hasCertificate: true,
    gradientFrom: '#0369a1',
    gradientTo: '#059669',
    icon: 'Wind',
    status: 'available',
    progressPercent: 0,
    modules: [],
  },
  {
    id: 'c11',
    title: 'Пожарная безопасность на объекте',
    description:
      'Требования ПБ при монтажных работах, использование огнезащитных составов, действия при возгорании.',
    category: 'safety',
    level: 'Базовый',
    durationHours: 4,
    modulesCount: 3,
    ratingsCount: 78,
    hasCertificate: true,
    gradientFrom: '#b91c1c',
    gradientTo: '#92400e',
    icon: 'Flame',
    status: 'available',
    progressPercent: 0,
    modules: [],
  },
  {
    id: 'c12',
    title: 'Переговоры и работа с возражениями',
    description:
      'Продвинутые техники переговоров для менеджеров по продажам: SPIN, BATNA, работа с трудными клиентами.',
    category: 'sales',
    level: 'Продвинутый',
    durationHours: 9,
    modulesCount: 6,
    ratingsCount: 19,
    hasCertificate: false,
    gradientFrom: '#6d28d9',
    gradientTo: '#be185d',
    icon: 'Handshake',
    status: 'available',
    progressPercent: 0,
    modules: [],
  },
];

const MY_CERTIFICATES: Certificate[] = [
  {
    id: 'cert1',
    courseId: 'c2',
    courseTitle: 'Диагностика неисправностей кондиционеров',
    issuedAt: '15.01.2026',
    expiresAt: null,
  },
  {
    id: 'cert2',
    courseId: 'c3',
    courseTitle: 'Работа с хладагентами (F-газы)',
    issuedAt: '03.03.2026',
    expiresAt: '03.03.2028',
  },
  {
    id: 'cert3',
    courseId: 'c7',
    courseTitle: 'Электробезопасность II группа',
    issuedAt: '20.11.2025',
    expiresAt: '20.11.2026',
  },
];

const EMPLOYEES: Employee[] = [
  { id: 'e1', name: 'Петров А.В.', initials: 'ПА', role: 'Старший монтажник', completedCourses: 9, inProgressCourses: 1, completionPercent: 75, lastActivity: '2 ч назад' },
  { id: 'e2', name: 'Иванов С.М.', initials: 'ИС', role: 'Монтажник', completedCourses: 5, inProgressCourses: 2, completionPercent: 42, lastActivity: 'Вчера' },
  { id: 'e3', name: 'Козлова Н.Р.', initials: 'КН', role: 'Менеджер по продажам', completedCourses: 7, inProgressCourses: 0, completionPercent: 58, lastActivity: '3 дня назад' },
  { id: 'e4', name: 'Смирнов Д.О.', initials: 'СД', role: 'Монтажник', completedCourses: 3, inProgressCourses: 3, completionPercent: 25, lastActivity: '1 нед. назад' },
  { id: 'e5', name: 'Новикова Е.В.', initials: 'НЕ', role: 'Диспетчер', completedCourses: 6, inProgressCourses: 1, completionPercent: 50, lastActivity: 'Вчера' },
  { id: 'e6', name: 'Фёдоров И.А.', initials: 'ФИ', role: 'Старший инженер', completedCourses: 11, inProgressCourses: 1, completionPercent: 92, lastActivity: '5 ч назад' },
  { id: 'e7', name: 'Морозова О.Б.', initials: 'МО', role: 'Менеджер по продажам', completedCourses: 4, inProgressCourses: 2, completionPercent: 33, lastActivity: '2 дня назад' },
  { id: 'e8', name: 'Лебедев В.С.', initials: 'ЛВ', role: 'Монтажник', completedCourses: 2, inProgressCourses: 1, completionPercent: 17, lastActivity: '4 дня назад' },
];

const RADAR_DATA = [
  { subject: 'Холодильное дело', value: 72 },
  { subject: 'Электрика', value: 85 },
  { subject: 'Безопасность', value: 90 },
  { subject: 'Клиентский сервис', value: 68 },
  { subject: 'Продажи', value: 45 },
];

const PROGRESS_HISTORY = [
  { month: 'Дек', courses: 1, hours: 6 },
  { month: 'Янв', courses: 2, hours: 18 },
  { month: 'Фев', courses: 1, hours: 10 },
  { month: 'Мар', courses: 2, hours: 20 },
  { month: 'Апр', courses: 1, hours: 8 },
  { month: 'Май', courses: 0, hours: 5 },
];

const TEAM_BAR_DATA = [
  { name: 'Петров А.В.', completed: 9, inProgress: 1 },
  { name: 'Иванов С.М.', completed: 5, inProgress: 2 },
  { name: 'Козлова Н.Р.', completed: 7, inProgress: 0 },
  { name: 'Смирнов Д.О.', completed: 3, inProgress: 3 },
  { name: 'Новикова Е.В.', completed: 6, inProgress: 1 },
  { name: 'Фёдоров И.А.', completed: 11, inProgress: 1 },
  { name: 'Морозова О.Б.', completed: 4, inProgress: 2 },
  { name: 'Лебедев В.С.', completed: 2, inProgress: 1 },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<CourseCategory, string> = {
  all: 'Все',
  refrigeration: 'Холодильное дело',
  electrical: 'Электрика',
  safety: 'Безопасность',
  sales: 'Продажи',
  softskills: 'Soft Skills',
};

const LEVEL_COLORS: Record<CourseLevel, string> = {
  Базовый: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Средний: 'bg-blue-100 text-blue-700 border-blue-200',
  Продвинутый: 'bg-purple-100 text-purple-700 border-purple-200',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon name={icon as any} size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function CourseCard({
  course,
  onAction,
}: {
  course: Course;
  onAction: (course: Course) => void;
}) {
  const actionLabel =
    course.status === 'completed'
      ? 'Пройдено'
      : course.status === 'in_progress'
      ? 'Продолжить'
      : 'Начать';

  const actionClass =
    course.status === 'completed'
      ? 'bg-slate-100 text-slate-500 cursor-default'
      : course.status === 'in_progress'
      ? 'bg-blue-600 text-white hover:bg-blue-700'
      : 'bg-emerald-600 text-white hover:bg-emerald-700';

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Cover */}
      <div
        className="h-28 flex items-center justify-center relative"
        style={{
          background: `linear-gradient(135deg, ${course.gradientFrom}, ${course.gradientTo})`,
        }}
      >
        <Icon name={course.icon as any} size={40} className="text-white opacity-90" />
        {course.hasCertificate && (
          <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
            <Icon name="Award" size={12} className="text-white" />
            <span className="text-white text-xs">Сертификат</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-slate-800 text-sm leading-snug">{course.title}</h3>
        </div>

        <Badge className={`self-start text-xs mb-2 ${LEVEL_COLORS[course.level]}`}>
          {course.level}
        </Badge>

        <p className="text-xs text-slate-500 leading-relaxed mb-3 flex-1 line-clamp-2">
          {course.description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
          <span className="flex items-center gap-1">
            <Icon name="Clock" size={12} />
            {course.durationHours} ч
          </span>
          <span className="flex items-center gap-1">
            <Icon name="BookOpen" size={12} />
            {course.modulesCount} модулей
          </span>
          <span className="flex items-center gap-1">
            <Icon name="Star" size={12} />
            {course.ratingsCount}
          </span>
        </div>

        {/* Progress bar */}
        {course.status !== 'available' && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500">Прогресс</span>
              <span className="font-medium text-slate-700">{course.progressPercent}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  course.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'
                }`}
                style={{ width: `${course.progressPercent}%` }}
              />
            </div>
          </div>
        )}

        <button
          onClick={() => onAction(course)}
          disabled={course.status === 'completed'}
          className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${actionClass}`}
        >
          {course.status === 'completed' && (
            <span className="inline-flex items-center gap-1.5">
              <Icon name="CheckCircle" size={14} />
              {actionLabel}
            </span>
          )}
          {course.status !== 'completed' && actionLabel}
        </button>
      </div>
    </div>
  );
}

// ─── Views ────────────────────────────────────────────────────────────────────

function CatalogView() {
  const [activeCategory, setActiveCategory] = useState<CourseCategory>('all');

  const categories = Object.keys(CATEGORY_LABELS) as CourseCategory[];

  const filtered =
    activeCategory === 'all'
      ? COURSES
      : COURSES.filter((c) => c.category === activeCategory);

  const completedCount = COURSES.filter((c) => c.status === 'completed').length;
  const inProgressCount = COURSES.filter((c) => c.status === 'in_progress').length;
  const availableCount = COURSES.filter((c) => c.status === 'available').length;

  function handleAction(course: Course) {
    if (course.status === 'available') {
      toast.success(`Курс «${course.title}» начат`, {
        description: 'Прогресс сохраняется автоматически',
      });
    } else if (course.status === 'in_progress') {
      toast.info(`Продолжаем курс «${course.title}»`, {
        description: `Пройдено ${course.progressPercent}% — так держать!`,
      });
    }
  }

  return (
    <div className="space-y-5">
      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Курсов всего" value={COURSES.length} icon="Library" color="bg-slate-500" />
        <MetricCard label="Завершено мной" value={completedCount} icon="CheckCircle" color="bg-emerald-500" />
        <MetricCard label="В процессе" value={inProgressCount} icon="PlayCircle" color="bg-blue-500" />
        <MetricCard label="Доступно" value={availableCount} icon="Unlock" color="bg-violet-500" />
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              activeCategory === cat
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
        <span className="ml-auto text-sm text-slate-400">{filtered.length} курсов</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filtered.map((course) => (
          <CourseCard key={course.id} course={course} onAction={handleAction} />
        ))}
      </div>
    </div>
  );
}

function ProgressView() {
  const activeCourses = COURSES.filter(
    (c) => c.status === 'in_progress' || c.status === 'completed'
  );

  return (
    <div className="space-y-5">
      {/* Top row: Radar + Line */}
      <div className="grid grid-cols-2 gap-4">
        {/* Radar */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-1">Профиль компетенций</h3>
          <p className="text-xs text-slate-400 mb-4">Уровень знаний по направлениям, %</p>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <Radar
                name="Компетенции"
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Tooltip
                formatter={(v: number) => [`${v}%`, 'Уровень']}
                contentStyle={{ fontSize: 12 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Line */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-1">Динамика обучения</h3>
          <p className="text-xs text-slate-400 mb-4">Пройденные курсы и часы за 6 месяцев</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={PROGRESS_HISTORY}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="courses"
                name="Курсов"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="hours"
                name="Часов"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active courses */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Мои курсы</h3>
        <div className="space-y-3">
          {activeCourses.map((course) => (
            <div key={course.id} className="flex items-center gap-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${course.gradientFrom}, ${course.gradientTo})`,
                }}
              >
                <Icon name={course.icon as any} size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700 truncate">{course.title}</span>
                  <span className="text-xs font-semibold text-slate-600 ml-2 flex-shrink-0">
                    {course.progressPercent}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      course.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${course.progressPercent}%` }}
                  />
                </div>
              </div>
              <Badge
                className={`flex-shrink-0 text-xs ${
                  course.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    : 'bg-blue-100 text-blue-700 border-blue-200'
                }`}
              >
                {course.status === 'completed' ? 'Завершён' : 'В процессе'}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Certificates */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Icon name="Award" size={18} className="text-amber-500" />
          Полученные сертификаты
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {MY_CERTIFICATES.map((cert) => (
            <div
              key={cert.id}
              className="border border-amber-200 rounded-xl p-4 bg-amber-50 flex flex-col items-center text-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Icon name="Award" size={24} className="text-amber-600" />
              </div>
              <p className="text-sm font-medium text-slate-800 leading-snug">{cert.courseTitle}</p>
              <div className="text-xs text-slate-500 space-y-0.5">
                <p>Выдан: {cert.issuedAt}</p>
                {cert.expiresAt && <p className="text-amber-600">Действует до: {cert.expiresAt}</p>}
                {!cert.expiresAt && <p className="text-emerald-600">Бессрочный</p>}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-xs mt-1 border-amber-300 text-amber-700 hover:bg-amber-100"
                onClick={() => toast.info('Сертификат скачан')}
              >
                <Icon name="Download" size={12} className="mr-1" />
                Скачать PDF
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ManagementView() {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  function handleAssign() {
    if (!selectedEmployee || !selectedCourse) {
      toast.error('Выберите сотрудника и курс');
      return;
    }
    const emp = EMPLOYEES.find((e) => e.id === selectedEmployee);
    const course = COURSES.find((c) => c.id === selectedCourse);
    toast.success(`Курс назначен`, {
      description: `«${course?.title}» → ${emp?.name}`,
    });
    setSelectedEmployee('');
    setSelectedCourse('');
  }

  function getCompletionBadge(percent: number) {
    if (percent >= 75) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (percent >= 40) return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-amber-100 text-amber-700 border-amber-200';
  }

  return (
    <div className="space-y-5">
      {/* Assign course */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Icon name="UserPlus" size={18} className="text-blue-600" />
          Назначить курс сотруднику
        </h3>
        <div className="flex items-center gap-3">
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Выберите сотрудника…</option>
            {EMPLOYEES.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} — {emp.role}
              </option>
            ))}
          </select>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Выберите курс…</option>
            {COURSES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <Button
            onClick={handleAssign}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 flex-shrink-0"
          >
            <Icon name="Send" size={14} className="mr-2" />
            Назначить
          </Button>
        </div>
      </div>

      {/* Team table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Icon name="Users" size={18} className="text-slate-500" />
            Прогресс команды
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Сотрудник</th>
                <th className="text-center px-4 py-3 text-slate-500 font-medium">Пройдено</th>
                <th className="text-center px-4 py-3 text-slate-500 font-medium">В процессе</th>
                <th className="text-center px-4 py-3 text-slate-500 font-medium">% завершения</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Последняя активность</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {EMPLOYEES.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                        {emp.initials}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{emp.name}</p>
                        <p className="text-xs text-slate-400">{emp.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="font-semibold text-emerald-600">{emp.completedCourses}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="font-semibold text-blue-600">{emp.inProgressCourses}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            emp.completionPercent >= 75
                              ? 'bg-emerald-500'
                              : emp.completionPercent >= 40
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${emp.completionPercent}%` }}
                        />
                      </div>
                      <Badge className={`text-xs ${getCompletionBadge(emp.completionPercent)}`}>
                        {emp.completionPercent}%
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 text-xs">{emp.lastActivity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team bar chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-1">Прогресс команды по курсам</h3>
        <p className="text-xs text-slate-400 mb-4">Количество пройденных и активных курсов</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={TEAM_BAR_DATA} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11 }}
              width={110}
            />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="completed" name="Пройдено" fill="#10b981" radius={[0, 4, 4, 0]} stackId="a" />
            <Bar dataKey="inProgress" name="В процессе" fill="#3b82f6" radius={[0, 4, 4, 0]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LMSFull() {
  const [activeTab, setActiveTab] = useState<Tab>('catalog');

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'catalog', label: 'Каталог курсов', icon: 'Library' },
    { key: 'progress', label: 'Мой прогресс', icon: 'TrendingUp' },
    { key: 'management', label: 'Управление', icon: 'Users' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Учебный центр</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Обучение и развитие персонала — Сервис Климат
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="text-sm"
            onClick={() => toast.info('Открываем расписание обучений')}
          >
            <Icon name="Calendar" size={14} className="mr-2" />
            Расписание
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
            onClick={() => toast.success('Заявка на новый курс отправлена')}
          >
            <Icon name="Plus" size={14} className="mr-2" />
            Предложить курс
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Icon name={tab.icon as any} size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Views */}
      {activeTab === 'catalog' && <CatalogView />}
      {activeTab === 'progress' && <ProgressView />}
      {activeTab === 'management' && <ManagementView />}
    </div>
  );
}
