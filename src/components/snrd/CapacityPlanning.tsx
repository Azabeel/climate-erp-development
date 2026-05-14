import { useState } from 'react';
import { Users, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const WEEKS = ['Нед. 20 (13-19 мая)', 'Нед. 21 (20-26 мая)', 'Нед. 22 (27 мая - 2 июн)', 'Нед. 23 (3-9 июня)'];

const CAPACITY_DATA = [
  { week: 'Нед.20', capacity: 200, booked: 168, available: 32 },
  { week: 'Нед.21', capacity: 200, booked: 185, available: 15 },
  { week: 'Нед.22', capacity: 200, booked: 212, available: -12 },
  { week: 'Нед.23', capacity: 200, booked: 145, available: 55 },
];

const ENGINEERS = [
  { id: 'e1', name: 'Козлов Михаил', position: 'Эксперт', weeklyHours: 40, bookedHours: [38, 40, 40, 35], skills: ['Монтаж', 'Ремонт', 'ТО', 'Пуско-наладка'] },
  { id: 'e2', name: 'Петров Сергей', position: 'Специалист', weeklyHours: 40, bookedHours: [32, 38, 42, 28], skills: ['Ремонт', 'ТО', 'Диагностика'] },
  { id: 'e3', name: 'Иванов Алексей', position: 'Специалист', weeklyHours: 40, bookedHours: [36, 40, 44, 30], skills: ['ТО', 'Монтаж', 'Ремонт'] },
  { id: 'e4', name: 'Сидоров Дмитрий', position: 'Стажёр', weeklyHours: 40, bookedHours: [26, 34, 40, 28], skills: ['ТО', 'Диагностика'] },
  { id: 'e5', name: 'Новиков Андрей', position: 'Специалист', weeklyHours: 40, bookedHours: [36, 33, 46, 24], skills: ['Монтаж', 'Ремонт'] },
];

const SERVICE_DEMAND = [
  { type: 'ТО', demand: 45, capacity: 50, color: '#10b981' },
  { type: 'Ремонт', demand: 38, capacity: 35, color: '#ef4444' },
  { type: 'Монтаж', demand: 22, capacity: 25, color: '#3b82f6' },
  { type: 'Диагностика', demand: 18, capacity: 20, color: '#8b5cf6' },
  { type: 'Пуско-наладка', demand: 12, capacity: 10, color: '#f59e0b' },
];

const getLoadColor = (load: number) => load > 100 ? 'bg-red-500' : load > 90 ? 'bg-yellow-500' : load > 70 ? 'bg-blue-500' : 'bg-green-500';
const getLoadText = (load: number) => load > 100 ? 'text-red-600' : load > 90 ? 'text-yellow-600' : 'text-green-600';

const CapacityPlanning = () => {
  const [selectedWeek, setSelectedWeek] = useState(0);

  const weekData = CAPACITY_DATA[selectedWeek];
  const totalLoad = Math.round((weekData.booked / weekData.capacity) * 100);

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Users size={28} className="text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Планирование мощностей</h2>
          <p className="text-gray-600 mt-0.5">Загрузка инженеров и прогноз доступности</p>
        </div>
      </div>

      {/* Week selector */}
      <div className="flex gap-2 mb-6">
        {WEEKS.map((week, i) => (
          <button
            key={i}
            onClick={() => setSelectedWeek(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedWeek === i ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {week}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className={`rounded-lg p-4 border ${totalLoad > 100 ? 'bg-red-50 border-red-200' : totalLoad > 90 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
          <p className="text-sm text-gray-600 font-medium">Загрузка</p>
          <p className={`text-3xl font-bold ${getLoadText(totalLoad)}`}>{totalLoad}%</p>
          {totalLoad > 100 && <p className="text-xs text-red-600 mt-1">⚠ Перегрузка!</p>}
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700 font-medium">Доступно часов</p>
          <p className="text-3xl font-bold text-blue-700">{weekData.capacity} ч</p>
          <p className="text-xs text-blue-600 mt-1">{ENGINEERS.length} инженеров × 40ч</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-700 font-medium">Забронировано</p>
          <p className="text-3xl font-bold text-purple-700">{weekData.booked} ч</p>
        </div>
        <div className={`rounded-lg p-4 border ${weekData.available < 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
          <p className="text-sm text-gray-600 font-medium">Свободно</p>
          <p className={`text-3xl font-bold ${weekData.available < 0 ? 'text-red-600' : 'text-gray-700'}`}>{weekData.available} ч</p>
        </div>
      </div>

      {weekData.available < 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle size={20} className="text-red-600 shrink-0" />
          <div>
            <p className="font-semibold text-red-900">Перегрузка на {Math.abs(weekData.available)} часов</p>
            <p className="text-sm text-red-700">Рекомендуется перенести часть нарядов на следующую неделю или привлечь подрядчиков.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Capacity chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Загрузка по неделям</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CAPACITY_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="capacity" name="Мощность" fill="#e5e7eb" radius={[3, 3, 0, 0]} />
              <Bar dataKey="booked" name="Загружено" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Demand by service type */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Спрос по типам услуг</h3>
          <div className="space-y-3">
            {SERVICE_DEMAND.map(s => (
              <div key={s.type}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{s.type}</span>
                  <span className={s.demand > s.capacity ? 'text-red-600 font-semibold' : 'text-green-600'}>
                    {s.demand}/{s.capacity} ч
                    {s.demand > s.capacity && <span className="text-xs ml-1">(+{s.demand - s.capacity})</span>}
                  </span>
                </div>
                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, (s.demand / s.capacity) * 100)}%`, backgroundColor: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Engineer breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Загрузка инженеров — {WEEKS[selectedWeek]}</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Инженер', 'Должность', 'Навыки', 'Загружено', 'Загрузка %', 'Свободно'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {ENGINEERS.map(eng => {
              const booked = eng.bookedHours[selectedWeek];
              const loadPct = Math.round((booked / eng.weeklyHours) * 100);
              const free = eng.weeklyHours - booked;
              return (
                <tr key={eng.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 text-sm">{eng.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{eng.position}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {eng.skills.map(s => (
                        <span key={s} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{booked} ч / {eng.weeklyHours} ч</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${getLoadColor(loadPct)}`} style={{ width: `${Math.min(100, loadPct)}%` }} />
                      </div>
                      <span className={`text-sm font-semibold ${getLoadText(loadPct)}`}>{loadPct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${free < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {free < 0 ? `+${Math.abs(free)} сверхурочно` : `${free} ч`}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CapacityPlanning;
