import { useState } from 'react';
import { AlertTriangle, Clock, CheckCircle, XCircle, RefreshCw, Bell, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SLAItem {
  id: string;
  orderNumber: string;
  client: string;
  engineer: string;
  type: string;
  slaLevel: 'contract' | 'corporate';
  ttr: { deadline: string; remaining: number; status: 'green' | 'yellow' | 'red' };
  tto: { deadline: string; remaining: number; status: 'green' | 'yellow' | 'red' };
  ttf: { deadline: string; remaining: number; status: 'green' | 'yellow' | 'red' };
  priority: string;
  notified: boolean;
}

const SLA_ITEMS: SLAItem[] = [
  {
    id: 's1', orderNumber: 'WO-2026-000047', client: 'ТЦ Мираж', engineer: 'Козлов М.И.',
    type: 'Аварийный ремонт', slaLevel: 'contract', priority: 'Аварийный', notified: false,
    ttr: { deadline: '15:30', remaining: 23, status: 'red' },
    tto: { deadline: '14:00', remaining: -45, status: 'red' },
    ttf: { deadline: '18:00', remaining: 173, status: 'green' },
  },
  {
    id: 's2', orderNumber: 'WO-2026-000051', client: 'ООО Сбербанк-Сервис', engineer: 'Петров С.А.',
    type: 'ТО плановое', slaLevel: 'contract', priority: 'Срочно', notified: true,
    ttr: { deadline: '16:45', remaining: 98, status: 'yellow' },
    tto: { deadline: '15:15', remaining: 48, status: 'yellow' },
    ttf: { deadline: '20:00', remaining: 293, status: 'green' },
  },
  {
    id: 's3', orderNumber: 'WO-2026-000044', client: 'ИП Сидоров В.П.', engineer: 'Иванов А.К.',
    type: 'Диагностика', slaLevel: 'corporate', priority: 'Высокий', notified: false,
    ttr: { deadline: '17:00', remaining: 113, status: 'green' },
    tto: { deadline: '16:00', remaining: 73, status: 'green' },
    ttf: { deadline: '21:00', remaining: 353, status: 'green' },
  },
  {
    id: 's4', orderNumber: 'WO-2026-000038', client: 'ТК Северный', engineer: 'Сидоров Д.М.',
    type: 'Замена компрессора', slaLevel: 'contract', priority: 'Аварийный', notified: true,
    ttr: { deadline: '13:00', remaining: -127, status: 'red' },
    tto: { deadline: '11:00', remaining: -247, status: 'red' },
    ttf: { deadline: '17:00', remaining: -7, status: 'red' },
  },
  {
    id: 's5', orderNumber: 'WO-2026-000055', client: 'БЦ Олимп', engineer: 'Новиков Р.С.',
    type: 'Профилактика', slaLevel: 'corporate', priority: 'Средний', notified: false,
    ttr: { deadline: '18:30', remaining: 203, status: 'green' },
    tto: { deadline: '18:00', remaining: 173, status: 'green' },
    ttf: { deadline: '22:00', remaining: 413, status: 'green' },
  },
];

const SLA_HISTORY = [
  { time: '08:00', green: 100, yellow: 0, red: 0 },
  { time: '09:00', green: 97, yellow: 2, red: 1 },
  { time: '10:00', green: 95, yellow: 3, red: 2 },
  { time: '11:00', green: 93, yellow: 4, red: 3 },
  { time: '12:00', green: 91, yellow: 5, red: 4 },
  { time: '13:00', green: 89, yellow: 7, red: 4 },
  { time: 'Сейчас', green: 88, yellow: 6, red: 6 },
];

const formatRemaining = (mins: number) => {
  if (mins < 0) return `−${Math.abs(mins)} мин`;
  if (mins < 60) return `${mins} мин`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}ч ${m}м` : `${h} ч`;
};

const StatusBadge = ({ status, remaining }: { status: 'green' | 'yellow' | 'red'; remaining: number }) => {
  const cfg = {
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  }[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${cfg}`}>
      {status === 'red' && remaining < 0 ? <XCircle size={10} /> : status === 'red' ? <AlertTriangle size={10} /> : status === 'yellow' ? <Clock size={10} /> : <CheckCircle size={10} />}
      {formatRemaining(remaining)}
    </span>
  );
};

const SLAMonitor = () => {
  const [filter, setFilter] = useState<'all' | 'red' | 'yellow'>('all');
  const [items, setItems] = useState<SLAItem[]>(SLA_ITEMS);

  const filtered = filter === 'all' ? items : items.filter(i =>
    filter === 'red'
      ? i.ttr.status === 'red' || i.tto.status === 'red' || i.ttf.status === 'red'
      : i.ttr.status === 'yellow' || i.tto.status === 'yellow' || i.ttf.status === 'yellow'
  );

  const redCount = items.filter(i => i.ttr.status === 'red' || i.tto.status === 'red' || i.ttf.status === 'red').length;
  const yellowCount = items.filter(i => i.ttr.status === 'yellow' || i.tto.status === 'yellow' || i.ttf.status === 'yellow').length;
  const greenCount = items.filter(i => i.ttr.status === 'green' && i.tto.status === 'green' && i.ttf.status === 'green').length;

  const handleNotify = (id: string, orderNum: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, notified: true } : i));
    toast.success(`Уведомление отправлено по ${orderNum}`);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AlertTriangle size={28} className="text-orange-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">SLA Монитор</h2>
            <p className="text-gray-500 text-sm">Контроль выполнения соглашений об уровне обслуживания</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.info('SLA пересчитан')}>
          <RefreshCw size={14} className="mr-2" /> Обновить
        </Button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={18} className="text-green-600" />
            <span className="font-semibold text-green-900">В норме</span>
          </div>
          <p className="text-3xl font-bold text-green-700">{greenCount}</p>
          <p className="text-xs text-green-600 mt-1">нарядов</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={18} className="text-yellow-600" />
            <span className="font-semibold text-yellow-900">Предупреждение</span>
          </div>
          <p className="text-3xl font-bold text-yellow-700">{yellowCount}</p>
          <p className="text-xs text-yellow-600 mt-1">нарядов</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle size={18} className="text-red-600" />
            <span className="font-semibold text-red-900">Нарушение</span>
          </div>
          <p className="text-3xl font-bold text-red-700">{redCount}</p>
          <p className="text-xs text-red-600 mt-1">нарядов</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">История SLA за сегодня (%)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={SLA_HISTORY}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="green" stroke="#22c55e" strokeWidth={2} name="В норме %" dot={false} />
              <Line type="monotone" dataKey="yellow" stroke="#f59e0b" strokeWidth={2} name="Предупреж. %" dot={false} />
              <Line type="monotone" dataKey="red" stroke="#ef4444" strokeWidth={2} name="Нарушение %" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Легенда метрик</h3>
          <div className="space-y-3 text-sm">
            {[
              { label: 'TTR', full: 'Time to Respond', desc: 'Время до первого ответа инженера' },
              { label: 'TTO', full: 'Time to On-site', desc: 'Время до прибытия на объект' },
              { label: 'TTF', full: 'Time to Fix', desc: 'Время до полного устранения' },
            ].map(m => (
              <div key={m.label} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-blue-600">{m.label}</span>
                  <span className="text-gray-500 text-xs">{m.full}</span>
                </div>
                <p className="text-gray-600 text-xs">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4">
        <Filter size={16} className="text-gray-400" />
        {(['all', 'red', 'yellow'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f === 'all' ? 'Все' : f === 'red' ? '🔴 Нарушения' : '🟡 Предупреждения'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Наряд / Клиент</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Тип / Инженер</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium">TTR</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium">TTO</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium">TTF</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium">SLA</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">Действие</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(item => {
              const worst = item.ttr.status === 'red' || item.tto.status === 'red' || item.ttf.status === 'red' ? 'red'
                : item.ttr.status === 'yellow' || item.tto.status === 'yellow' || item.ttf.status === 'yellow' ? 'yellow' : 'green';
              return (
                <tr key={item.id} className={`hover:bg-gray-50 ${worst === 'red' ? 'bg-red-50/30' : worst === 'yellow' ? 'bg-yellow-50/20' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{item.orderNumber}</p>
                    <p className="text-xs text-gray-500">{item.client}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700">{item.type}</p>
                    <p className="text-xs text-gray-500">{item.engineer}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={item.ttr.status} remaining={item.ttr.remaining} />
                    <p className="text-xs text-gray-400 mt-1">до {item.ttr.deadline}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={item.tto.status} remaining={item.tto.remaining} />
                    <p className="text-xs text-gray-400 mt-1">до {item.tto.deadline}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={item.ttf.status} remaining={item.ttf.remaining} />
                    <p className="text-xs text-gray-400 mt-1">до {item.ttf.deadline}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.slaLevel === 'contract' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                      {item.slaLevel === 'contract' ? 'Договорной' : 'Корпоративный'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!item.notified && worst !== 'green' ? (
                      <Button size="sm" variant="outline" onClick={() => handleNotify(item.id, item.orderNumber)}
                        className="text-xs">
                        <Bell size={12} className="mr-1" /> Уведомить
                      </Button>
                    ) : item.notified ? (
                      <span className="text-xs text-gray-400 flex items-center justify-end gap-1">
                        <CheckCircle size={12} className="text-green-500" /> Уведомлен
                      </span>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            <CheckCircle size={32} className="mx-auto mb-2 text-green-400" />
            <p>Нарушений SLA нет</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SLAMonitor;
