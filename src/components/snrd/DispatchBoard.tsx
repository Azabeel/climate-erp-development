import { useState } from 'react';
import { Calendar, Clock, User, MapPin, ChevronLeft, ChevronRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScheduledEvent {
  id: string;
  employeeName: string;
  employeeColor: string;
  orderNumber: string;
  clientName: string;
  address: string;
  serviceType: string;
  startHour: number;
  startMin: number;
  durationHours: number;
  status: 'Назначен' | 'В пути' | 'На месте' | 'Выполнен';
  priority: 'Высокий' | 'Средний' | 'Низкий';
  phone?: string;
}

const EMPLOYEES = [
  { id: 'e1', name: 'Козлов Михаил', color: '#4f46e5', phone: '+7 900 123-45-67' },
  { id: 'e2', name: 'Петров Сергей', color: '#0891b2', phone: '+7 900 234-56-78' },
  { id: 'e3', name: 'Иванов Алексей', color: '#16a34a', phone: '+7 900 345-67-89' },
  { id: 'e4', name: 'Сидоров Дмитрий', color: '#d97706', phone: '+7 900 456-78-90' },
  { id: 'e5', name: 'Новиков Андрей', color: '#dc2626', phone: '+7 900 567-89-01' },
];

const INITIAL_EVENTS: ScheduledEvent[] = [
  { id: 'ev1', employeeName: 'Козлов Михаил', employeeColor: '#4f46e5', orderNumber: 'WO-2026-000031', clientName: 'ООО Альфа', address: 'ул. Ленина, 12', serviceType: 'Ремонт', startHour: 9, startMin: 0, durationHours: 2, status: 'Выполнен', priority: 'Средний' },
  { id: 'ev2', employeeName: 'Козлов Михаил', employeeColor: '#4f46e5', orderNumber: 'WO-2026-000045', clientName: 'Петров И.И.', address: 'пр. Мира, 88', serviceType: 'ТО', startHour: 12, startMin: 0, durationHours: 1.5, status: 'Назначен', priority: 'Низкий' },
  { id: 'ev3', employeeName: 'Петров Сергей', employeeColor: '#0891b2', orderNumber: 'WO-2026-000033', clientName: 'ТЦ Мираж', address: 'ул. Садовая, 5', serviceType: 'Монтаж', startHour: 8, startMin: 30, durationHours: 4, status: 'В пути', priority: 'Высокий' },
  { id: 'ev4', employeeName: 'Иванов Алексей', employeeColor: '#16a34a', orderNumber: 'WO-2026-000037', clientName: 'ООО Берег', address: 'ул. Речная, 3', serviceType: 'Диагностика', startHour: 10, startMin: 0, durationHours: 1, status: 'На месте', priority: 'Высокий' },
  { id: 'ev5', employeeName: 'Иванов Алексей', employeeColor: '#16a34a', orderNumber: 'WO-2026-000039', clientName: 'ИП Смирнов', address: 'пр. Победы, 44', serviceType: 'Ремонт', startHour: 14, startMin: 0, durationHours: 3, status: 'Назначен', priority: 'Средний' },
  { id: 'ev6', employeeName: 'Сидоров Дмитрий', employeeColor: '#d97706', orderNumber: 'WO-2026-000041', clientName: 'ООО Гранд', address: 'ул. Центральная, 1', serviceType: 'ТО', startHour: 9, startMin: 30, durationHours: 2, status: 'Выполнен', priority: 'Низкий' },
  { id: 'ev7', employeeName: 'Новиков Андрей', employeeColor: '#dc2626', orderNumber: 'WO-2026-000043', clientName: 'Сбербанк', address: 'ул. Банковская, 7', serviceType: 'Аварийный', startHour: 11, startMin: 0, durationHours: 2.5, status: 'В пути', priority: 'Высокий' },
];

const HOURS = Array.from({ length: 12 }, (_, i) => i + 7);
const HOUR_WIDTH = 80;
const ROW_HEIGHT = 64;

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Выполнен': return 'opacity-60';
    case 'В пути': return 'opacity-90 ring-2 ring-yellow-300';
    case 'На месте': return 'opacity-90 ring-2 ring-green-400';
    default: return 'opacity-80';
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Выполнен': return 'bg-green-100 text-green-700';
    case 'В пути': return 'bg-yellow-100 text-yellow-700';
    case 'На месте': return 'bg-blue-100 text-blue-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const DispatchBoard = () => {
  const [currentDate, setCurrentDate] = useState(new Date('2026-05-14'));
  const [selectedEvent, setSelectedEvent] = useState<ScheduledEvent | null>(null);

  const dateStr = currentDate.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const prevDay = () => setCurrentDate(d => { const nd = new Date(d); nd.setDate(nd.getDate() - 1); return nd; });
  const nextDay = () => setCurrentDate(d => { const nd = new Date(d); nd.setDate(nd.getDate() + 1); return nd; });

  const statCounts = {
    total: INITIAL_EVENTS.length,
    inProgress: INITIAL_EVENTS.filter(e => e.status === 'В пути' || e.status === 'На месте').length,
    done: INITIAL_EVENTS.filter(e => e.status === 'Выполнен').length,
    assigned: INITIAL_EVENTS.filter(e => e.status === 'Назначен').length,
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Доска диспетчера</h2>
          <p className="text-gray-600 mt-1">Расписание выездов на день</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={prevDay}><ChevronLeft size={16} /></Button>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg">
            <Calendar size={16} className="text-gray-500" />
            <span className="text-sm font-medium capitalize">{dateStr}</span>
          </div>
          <Button variant="outline" size="sm" onClick={nextDay}><ChevronRight size={16} /></Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Всего нарядов', value: statCounts.total, color: 'text-gray-900', bg: 'bg-gray-50' },
          { label: 'Назначено', value: statCounts.assigned, color: 'text-gray-700', bg: 'bg-gray-50' },
          { label: 'В работе', value: statCounts.inProgress, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Выполнено', value: statCounts.done, color: 'text-green-700', bg: 'bg-green-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-lg p-4 border border-gray-200`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-600">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div style={{ minWidth: HOURS.length * HOUR_WIDTH + 160 }}>
            {/* Header */}
            <div className="flex border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
              <div className="w-40 shrink-0 px-4 py-3 border-r border-gray-200">
                <span className="text-xs font-semibold text-gray-500 uppercase">Сотрудник</span>
              </div>
              {HOURS.map(h => (
                <div key={h} style={{ width: HOUR_WIDTH }} className="shrink-0 px-2 py-3 border-r border-gray-100 text-center">
                  <span className="text-xs font-medium text-gray-500">{String(h).padStart(2, '0')}:00</span>
                </div>
              ))}
            </div>

            {/* Employee rows */}
            {EMPLOYEES.map(emp => {
              const empEvents = INITIAL_EVENTS.filter(e => e.employeeName === emp.name);
              return (
                <div key={emp.id} className="flex border-b border-gray-100" style={{ height: ROW_HEIGHT }}>
                  <div className="w-40 shrink-0 px-4 flex items-center gap-2 border-r border-gray-200">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: emp.color }} />
                    <div>
                      <p className="text-xs font-medium text-gray-900 leading-tight">{emp.name.split(' ')[0]}</p>
                      <p className="text-xs text-gray-500 leading-tight">{emp.name.split(' ')[1]}</p>
                    </div>
                  </div>
                  <div className="flex-1 relative">
                    {/* Hour grid */}
                    {HOURS.map(h => (
                      <div key={h} className="absolute top-0 bottom-0 border-r border-gray-100" style={{ left: (h - HOURS[0]) * HOUR_WIDTH, width: HOUR_WIDTH }} />
                    ))}
                    {/* Events */}
                    {empEvents.map(ev => {
                      const left = ((ev.startHour - HOURS[0]) + ev.startMin / 60) * HOUR_WIDTH;
                      const width = ev.durationHours * HOUR_WIDTH - 4;
                      return (
                        <div
                          key={ev.id}
                          className={`absolute top-2 bottom-2 rounded-md cursor-pointer transition-transform hover:scale-y-105 ${getStatusColor(ev.status)}`}
                          style={{ left: left + 2, width, backgroundColor: emp.color }}
                          onClick={() => setSelectedEvent(ev)}
                        >
                          <div className="px-2 py-1 h-full overflow-hidden">
                            <p className="text-white text-xs font-semibold truncate">{ev.orderNumber}</p>
                            <p className="text-white text-xs opacity-90 truncate">{ev.clientName}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event Detail Panel */}
      {selectedEvent && (
        <div className="fixed right-6 top-24 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-100" style={{ backgroundColor: selectedEvent.employeeColor + '15' }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-gray-900">{selectedEvent.orderNumber}</p>
                <p className="text-sm text-gray-600">{selectedEvent.serviceType}</p>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(selectedEvent.status)}`}>
                {selectedEvent.status}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${selectedEvent.priority === 'Высокий' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                {selectedEvent.priority}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User size={14} className="text-gray-400" />
              <span>{selectedEvent.employeeName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User size={14} className="text-gray-400" />
              <span>{selectedEvent.clientName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={14} className="text-gray-400" />
              <span>{selectedEvent.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock size={14} className="text-gray-400" />
              <span>{String(selectedEvent.startHour).padStart(2,'0')}:{String(selectedEvent.startMin).padStart(2,'0')} — {String(Math.floor(selectedEvent.startHour + selectedEvent.durationHours)).padStart(2,'0')}:{String(Math.round((selectedEvent.durationHours % 1) * 60)).padStart(2,'0')}</span>
              <span className="text-gray-500">({selectedEvent.durationHours}ч)</span>
            </div>
            <div className="pt-3 flex gap-2">
              <Button size="sm" className="flex-1">Открыть наряд</Button>
              <Button size="sm" variant="outline"><Phone size={14} /></Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispatchBoard;
