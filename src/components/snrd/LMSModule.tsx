import { useState } from 'react';
import { BookOpen, Play, CheckCircle, Clock, Award, Plus, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Course {
  id: string;
  title: string;
  category: string;
  level: 'Базовый' | 'Продвинутый' | 'Экспертный';
  duration: number;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'locked';
  lessons: number;
  completedLessons: number;
  instructor: string;
  thumbnail: string;
}

const COURSES: Course[] = [
  { id: 'c1', title: 'Основы климатических систем', category: 'Техника', level: 'Базовый', duration: 120, progress: 100, status: 'completed', lessons: 8, completedLessons: 8, instructor: 'Технический директор', thumbnail: '🌡️' },
  { id: 'c2', title: 'Диагностика кондиционеров', category: 'Техника', level: 'Продвинутый', duration: 180, progress: 65, status: 'in_progress', lessons: 12, completedLessons: 8, instructor: 'Козлов М.', thumbnail: '🔧' },
  { id: 'c3', title: 'Работа с хладагентами R-410A, R-32', category: 'Хладагенты', level: 'Продвинутый', duration: 90, progress: 0, status: 'not_started', lessons: 6, completedLessons: 0, instructor: 'Петров С.', thumbnail: '❄️' },
  { id: 'c4', title: 'Монтаж систем VRF/VRV', category: 'Монтаж', level: 'Экспертный', duration: 240, progress: 0, status: 'locked', lessons: 16, completedLessons: 0, instructor: 'Технический директор', thumbnail: '🏗️' },
  { id: 'c5', title: 'Работа в мобильном приложении', category: 'Система', level: 'Базовый', duration: 45, progress: 100, status: 'completed', lessons: 4, completedLessons: 4, instructor: 'ИТ-отдел', thumbnail: '📱' },
  { id: 'c6', title: 'Техника безопасности', category: 'ОТ и ТБ', level: 'Базовый', duration: 60, progress: 100, status: 'completed', lessons: 5, completedLessons: 5, instructor: 'HR', thumbnail: '⛑️' },
];

const CERTIFICATES = [
  { id: 'cert1', title: 'Основы климатических систем', date: '15.03.2026', score: 92 },
  { id: 'cert2', title: 'Работа в мобильном приложении', date: '20.02.2026', score: 100 },
  { id: 'cert3', title: 'Техника безопасности', date: '10.01.2026', score: 88 },
];

const getStatusInfo = (status: Course['status']) => ({
  completed: { label: 'Пройден', cls: 'bg-green-100 text-green-700', icon: <CheckCircle size={14} className="text-green-600" /> },
  in_progress: { label: 'В процессе', cls: 'bg-blue-100 text-blue-700', icon: <Play size={14} className="text-blue-600" /> },
  not_started: { label: 'Не начат', cls: 'bg-gray-100 text-gray-600', icon: <Clock size={14} className="text-gray-400" /> },
  locked: { label: 'Заблокирован', cls: 'bg-gray-100 text-gray-500', icon: <Lock size={14} className="text-gray-400" /> },
}[status]);

const getLevelColor = (level: string) => ({
  'Базовый': 'bg-green-50 text-green-700',
  'Продвинутый': 'bg-blue-50 text-blue-700',
  'Экспертный': 'bg-purple-50 text-purple-700',
}[level] || 'bg-gray-100 text-gray-600');

const LMSModule = () => {
  const [activeTab, setActiveTab] = useState<'courses' | 'certificates' | 'progress'>('courses');
  const [categoryFilter, setCategoryFilter] = useState('Все');

  const categories = ['Все', ...Array.from(new Set(COURSES.map(c => c.category)))];
  const filtered = categoryFilter === 'Все' ? COURSES : COURSES.filter(c => c.category === categoryFilter);

  const completedCount = COURSES.filter(c => c.status === 'completed').length;
  const totalHours = Math.round(COURSES.filter(c => c.status === 'completed').reduce((s, c) => s + c.duration, 0) / 60);
  const overallProgress = Math.round(COURSES.filter(c => c.status !== 'locked').reduce((s, c) => s + c.progress, 0) / COURSES.filter(c => c.status !== 'locked').length);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen size={28} className="text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Учебный центр (LMS)</h2>
            <p className="text-gray-600 mt-0.5">Онлайн-обучение и сертификация сотрудников</p>
          </div>
        </div>
        <Button onClick={() => toast.info('Создание курса')}><Plus size={16} className="mr-2" /> Добавить курс</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <Award size={20} className="text-green-600 mb-1" />
          <p className="text-2xl font-bold text-green-700">{completedCount}/{COURSES.filter(c => c.status !== 'locked').length}</p>
          <p className="text-sm text-green-600">Курсов пройдено</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <Clock size={20} className="text-blue-600 mb-1" />
          <p className="text-2xl font-bold text-blue-700">{totalHours} ч</p>
          <p className="text-sm text-blue-600">Часов обучения</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <CheckCircle size={20} className="text-purple-600 mb-1" />
          <p className="text-2xl font-bold text-purple-700">{CERTIFICATES.length}</p>
          <p className="text-sm text-purple-600">Сертификатов</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <BookOpen size={20} className="text-orange-600 mb-1" />
          <p className="text-2xl font-bold text-orange-700">{overallProgress}%</p>
          <p className="text-sm text-orange-600">Общий прогресс</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Общий прогресс обучения</span>
          <span className="text-sm font-semibold text-blue-600">{overallProgress}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${overallProgress}%` }} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { id: 'courses', label: 'Курсы' },
          { id: 'certificates', label: 'Сертификаты' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'courses' && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${categoryFilter === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {filtered.map(course => {
              const statusInfo = getStatusInfo(course.status);
              return (
                <div key={course.id} className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${course.status === 'locked' ? 'opacity-60' : 'hover:shadow-md transition-shadow'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{course.thumbnail}</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getLevelColor(course.level)}`}>{course.level}</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1 leading-snug">{course.title}</h4>
                  <p className="text-xs text-gray-500 mb-3">{course.category} · {Math.round(course.duration / 60)}ч {course.duration % 60}мин · {course.lessons} уроков</p>

                  {course.status !== 'locked' && course.status !== 'not_started' && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Прогресс</span>
                        <span>{course.completedLessons}/{course.lessons} уроков</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${course.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${course.progress}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {statusInfo?.icon}
                      <span className={`px-2 py-0.5 text-xs rounded-full ${statusInfo?.cls}`}>{statusInfo?.label}</span>
                    </div>
                    {course.status !== 'locked' && (
                      <Button size="sm" variant={course.status === 'completed' ? 'outline' : 'default'} onClick={() => toast.success(`Открыт курс: ${course.title}`)}>
                        {course.status === 'completed' ? 'Повторить' : course.status === 'in_progress' ? 'Продолжить' : 'Начать'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === 'certificates' && (
        <div className="grid grid-cols-3 gap-4">
          {CERTIFICATES.map(cert => (
            <div key={cert.id} className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-5 shadow-sm text-center">
              <Award size={40} className="text-yellow-500 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-1">{cert.title}</h4>
              <p className="text-sm text-gray-500 mb-2">Выдан: {cert.date}</p>
              <div className="text-2xl font-bold text-blue-600 mb-3">{cert.score}%</div>
              <Button size="sm" variant="outline" onClick={() => toast.success('Сертификат скачан')}>Скачать PDF</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LMSModule;
