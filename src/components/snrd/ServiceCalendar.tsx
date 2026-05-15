import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface CalEvent {
  id: string;
  title: string;
  client: string;
  engineer: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  type: 'order' | 'maintenance' | 'warranty' | 'installation';
  status: 'planned' | 'confirmed' | 'in_progress' | 'done' | 'cancelled';
  priority: 'normal' | 'urgent' | 'emergency';
  address: string;
}

const EVENTS: CalEvent[] = [
  { id: 'E01', title: 'Плановое ТО кондиционеров', client: 'ТЦ «Европа»', engineer: 'Петров А.В.', date: '2026-05-15', timeStart: '09:00', timeEnd: '12:00', type: 'maintenance', status: 'confirmed', priority: 'normal', address: 'ул. Ленина, 45' },
  { id: 'E02', title: 'Ремонт VRF системы', client: 'ООО ТехноПарк', engineer: 'Сидоров К.Н.', date: '2026-05-15', timeStart: '10:00', timeEnd: '14:00', type: 'order', status: 'in_progress', priority: 'urgent', address: 'пр. Мира, 22' },
  { id: 'E03', title: 'Установка сплит-системы', client: 'Иванов И.И.', engineer: 'Козлов Д.А.', date: '2026-05-15', timeStart: '13:00', timeEnd: '16:00', type: 'installation', status: 'planned', priority: 'normal', address: 'ул. Садовая, 10' },
  { id: 'E04', title: 'Гарантийное обслуживание', client: 'АО Климат', engineer: 'Новиков Р.И.', date: '2026-05-16', timeStart: '09:00', timeEnd: '11:00', type: 'warranty', status: 'confirmed', priority: 'normal', address: 'ул. Центральная, 5' },
  { id: 'E05', title: 'Аварийный ремонт чиллера', client: 'Гостиница «Заря»', engineer: 'Волков С.П.', date: '2026-05-16', timeStart: '08:00', timeEnd: '13:00', type: 'order', status: 'planned', priority: 'emergency', address: 'пр. Победы, 1' },
  { id: 'E06', title: 'Плановое ТО', client: 'Офис «БизнесЦентр»', engineer: 'Морозов А.К.', date: '2026-05-17', timeStart: '11:00', timeEnd: '14:00', type: 'maintenance', status: 'planned', priority: 'normal', address: 'ул. Рабочая, 34' },
  { id: 'E07', title: 'Замена фильтров', client: 'Ресторан «Уют»', engineer: 'Петров А.В.', date: '2026-05-18', timeStart: '14:00', timeEnd: '16:00', type: 'maintenance', status: 'planned', priority: 'normal', address: 'ул. Пушкина, 8' },
  { id: 'E08', title: 'Диагностика системы', client: 'Склад «Логистик»', engineer: 'Сидоров К.Н.', date: '2026-05-19', timeStart: '09:00', timeEnd: '11:00', type: 'order', status: 'planned', priority: 'normal', address: 'Промышленная зона, 3' },
  { id: 'E09', title: 'Плановое ТО кондиционеров', client: 'Фитнес «Атлет»', engineer: 'Козлов Д.А.', date: '2026-05-20', timeStart: '07:00', timeEnd: '10:00', type: 'maintenance', status: 'confirmed', priority: 'normal', address: 'ул. Спортивная, 15' },
  { id: 'E10', title: 'Монтаж мультизональной системы', client: 'Новый офис LLC', engineer: 'Новиков Р.И.', date: '2026-05-21', timeStart: '08:00', timeEnd: '18:00', type: 'installation', status: 'planned', priority: 'normal', address: 'БЦ «Панорама», 7 эт.' },
];

const typeColors: Record<string, string> = {
  order: 'bg-blue-100 text-blue-700 border-blue-200',
  maintenance: 'bg-green-100 text-green-700 border-green-200',
  warranty: 'bg-purple-100 text-purple-700 border-purple-200',
  installation: 'bg-orange-100 text-orange-700 border-orange-200',
};

const typeLabels: Record<string, string> = {
  order: 'Наряд', maintenance: 'ТО', warranty: 'Гарантия', installation: 'Монтаж',
};

const statusColors: Record<string, string> = {
  planned: 'text-gray-500',
  confirmed: 'text-blue-600',
  in_progress: 'text-green-600',
  done: 'text-purple-600',
  cancelled: 'text-red-500',
};

const statusLabels: Record<string, string> = {
  planned: 'Запланировано', confirmed: 'Подтверждено',
  in_progress: 'В работе', done: 'Выполнено', cancelled: 'Отменено',
};

const priorityBadge: Record<string, string> = {
  normal: '', urgent: '🔴', emergency: '🚨',
};

const engineers = ['Все', 'Петров А.В.', 'Сидоров К.Н.', 'Козлов Д.А.', 'Новиков Р.И.', 'Волков С.П.', 'Морозов А.К.'];

const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const HOURS = Array.from({ length: 12 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`);

function getDayDate(dayOffset: number): string {
  const d = new Date('2026-05-13');
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().slice(0, 10);
}

const ServiceCalendar = () => {
  const [view, setView] = useState<'week' | 'list'>('week');
  const [engineerFilter, setEngineerFilter] = useState('Все');
  const [selected, setSelected] = useState<CalEvent | null>(null);
  const [weekOffset, setWeekOffset] = useState(1);

  const dates = Array.from({ length: 7 }, (_, i) => getDayDate(weekOffset * 7 - 7 + i));

  const filtered = EVENTS.filter(e =>
    (engineerFilter === 'Все' || e.engineer === engineerFilter)
  );

  const getEventsForDay = (date: string) => filtered.filter(e => e.date === date);

  const timeToY = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return ((h - 7) * 60 + m) / (12 * 60) * 100;
  };

  const durationPct = (start: string, end: string) => {
    const [hs, ms] = start.split(':').map(Number);
    const [he, me] = end.split(':').map(Number);
    return ((he * 60 + me) - (hs * 60 + ms)) / (12 * 60) * 100;
  };

  const typeColorMap: Record<string, string> = {
    order: '#3B82F6', maintenance: '#10B981', warranty: '#8B5CF6', installation: '#F97316',
  };

  const priorityBorder: Record<string, string> = {
    normal: '', urgent: 'border-l-4 border-l-red-500', emergency: 'border-l-4 border-l-red-700',
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Шапка */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setWeekOffset(o => o - 1)} className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Icon name="ChevronLeft" size={16} className="text-gray-500" />
          </button>
          <span className="text-sm font-medium text-gray-700">
            {new Date(dates[0]).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} —{' '}
            {new Date(dates[6]).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => setWeekOffset(o => o + 1)} className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Icon name="ChevronRight" size={16} className="text-gray-500" />
          </button>
          <button onClick={() => setWeekOffset(1)} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
            Эта неделя
          </button>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={engineerFilter}
            onChange={e => setEngineerFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 bg-white"
          >
            {engineers.map(eng => <option key={eng}>{eng}</option>)}
          </select>
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            {(['week', 'list'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === v ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {v === 'week' ? 'Неделя' : 'Список'}
              </button>
            ))}
          </div>
          <Button size="sm">
            <Icon name="Plus" size={14} className="mr-1.5" />
            Добавить
          </Button>
        </div>
      </div>

      {/* Легенда */}
      <div className="flex gap-4 mb-3">
        {Object.entries(typeLabels).map(([type, label]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: typeColorMap[type] }} />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      {view === 'week' ? (
        <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
          {/* Дни недели */}
          <div className="grid border-b border-gray-200" style={{ gridTemplateColumns: '48px repeat(7, 1fr)' }}>
            <div className="p-2 border-r border-gray-100" />
            {dates.map((date, idx) => {
              const d = new Date(date);
              const isToday = date === '2026-05-15';
              return (
                <div key={date} className={`p-2 text-center border-r border-gray-100 last:border-r-0 ${isToday ? 'bg-blue-50' : ''}`}>
                  <div className="text-xs text-gray-400">{WEEK_DAYS[idx]}</div>
                  <div className={`text-sm font-semibold ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                    {d.getDate()}
                  </div>
                  <div className="text-xs text-gray-400">{getEventsForDay(date).length > 0 ? `${getEventsForDay(date).length} событ.` : ''}</div>
                </div>
              );
            })}
          </div>

          {/* Временная сетка */}
          <div className="flex-1 overflow-auto">
            <div className="grid relative" style={{ gridTemplateColumns: '48px repeat(7, 1fr)', height: '600px' }}>
              {/* Часы */}
              <div className="border-r border-gray-100">
                {HOURS.map(h => (
                  <div key={h} className="border-b border-gray-50 flex items-start justify-end pr-2 pt-1" style={{ height: '50px' }}>
                    <span className="text-xs text-gray-300">{h}</span>
                  </div>
                ))}
              </div>

              {/* Колонки дней */}
              {dates.map((date, dIdx) => {
                const dayEvents = getEventsForDay(date);
                const isToday = date === '2026-05-15';
                return (
                  <div key={date} className={`relative border-r border-gray-100 last:border-r-0 ${isToday ? 'bg-blue-50/30' : ''}`}>
                    {HOURS.map(h => (
                      <div key={h} className="border-b border-gray-50" style={{ height: '50px' }} />
                    ))}
                    {dayEvents.map(ev => {
                      const top = timeToY(ev.timeStart);
                      const height = durationPct(ev.timeStart, ev.timeEnd);
                      return (
                        <div
                          key={ev.id}
                          onClick={() => setSelected(ev)}
                          className={`absolute left-1 right-1 rounded text-xs cursor-pointer overflow-hidden shadow-sm hover:shadow-md transition-shadow ${priorityBorder[ev.priority]}`}
                          style={{
                            top: `${top}%`,
                            height: `${Math.max(height, 4)}%`,
                            backgroundColor: typeColorMap[ev.type] + '22',
                            borderTop: `3px solid ${typeColorMap[ev.type]}`,
                          }}
                        >
                          <div className="px-1.5 py-0.5 font-medium truncate" style={{ color: typeColorMap[ev.type] }}>
                            {priorityBadge[ev.priority]} {ev.timeStart} {ev.title}
                          </div>
                          <div className="px-1.5 text-gray-500 truncate">{ev.engineer.split(' ')[0]}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-auto">
          <div className="divide-y divide-gray-50">
            {filtered.sort((a, b) => a.date.localeCompare(b.date) || a.timeStart.localeCompare(b.timeStart)).map(ev => (
              <div
                key={ev.id}
                onClick={() => setSelected(ev)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-4"
              >
                <div className="text-center w-12">
                  <div className="text-xs text-gray-400">{new Date(ev.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</div>
                  <div className="text-sm font-medium text-gray-700">{ev.timeStart}</div>
                </div>
                <div className="w-1 h-10 rounded-full" style={{ backgroundColor: typeColorMap[ev.type] }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-gray-900">{priorityBadge[ev.priority]} {ev.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColors[ev.type]}`}>{typeLabels[ev.type]}</span>
                  </div>
                  <div className="text-xs text-gray-500">{ev.client} · {ev.engineer} · {ev.address}</div>
                </div>
                <div className={`text-xs font-medium ${statusColors[ev.status]}`}>
                  {statusLabels[ev.status]}
                </div>
                <div className="text-xs text-gray-400">{ev.timeStart}–{ev.timeEnd}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Боковая панель события */}
      {selected && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl border-l border-gray-200 p-5 z-50 overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Событие</h3>
            <button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 rounded">
              <Icon name="X" size={16} className="text-gray-400" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-lg font-semibold text-gray-900">{selected.title}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColors[selected.type]}`}>{typeLabels[selected.type]}</span>
            </div>
            {[
              { icon: 'User', label: 'Клиент', value: selected.client },
              { icon: 'Wrench', label: 'Инженер', value: selected.engineer },
              { icon: 'Calendar', label: 'Дата', value: new Date(selected.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) },
              { icon: 'Clock', label: 'Время', value: `${selected.timeStart} – ${selected.timeEnd}` },
              { icon: 'MapPin', label: 'Адрес', value: selected.address },
            ].map(f => (
              <div key={f.label} className="flex gap-3">
                <Icon name={f.icon} size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">{f.label}</p>
                  <p className="text-sm text-gray-900">{f.value}</p>
                </div>
              </div>
            ))}
            <div className={`text-sm font-medium ${statusColors[selected.status]}`}>
              Статус: {statusLabels[selected.status]}
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Button className="w-full" size="sm">
              <Icon name="ExternalLink" size={14} className="mr-1.5" />
              Открыть наряд
            </Button>
            <Button variant="outline" className="w-full" size="sm">
              <Icon name="Edit" size={14} className="mr-1.5" />
              Редактировать
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceCalendar;
