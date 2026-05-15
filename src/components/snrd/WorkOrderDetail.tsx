import { useState } from 'react';
import { Wrench, MapPin, User, Clock, DollarSign, Camera, FileText, MessageSquare, AlertTriangle, CheckCircle, ArrowLeft, Phone, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Props {
  orderId?: string;
  onBack?: () => void;
}

const MOCK_ORDER = {
  id: 'WO-2026-000047',
  type: 'Аварийный ремонт',
  status: 'В работе',
  priority: 'Аварийный',
  client: 'ООО «Торговый центр Мираж»',
  contactName: 'Смирнова Е.А.',
  contactPhone: '+7 (495) 123-45-67',
  address: 'Москва, ул. Ленина, 1 (вход с торца)',
  equipment: 'Daikin FTXB50C (инв. комната, 2 эт.)',
  description: 'Кондиционер не охлаждает. Компрессор включается на 5 секунд и выключается. Код ошибки E4 на пульте.',
  engineer: 'Козлов Михаил Иванович',
  engineerPhone: '+7 (900) 123-45-67',
  createdAt: '2026-05-15T09:45:00',
  assignedAt: '2026-05-15T10:12:00',
  arrivedAt: null as string | null,
  completedAt: null as string | null,
  slaDeadline: '2026-05-15T15:30:00',
  slaStatus: 'red' as 'green' | 'yellow' | 'red',
  slaRemaining: 23,
  estimatedHours: 2,
  materials: [
    { id: 'm1', name: 'Конденсатор пусковой 45 мкФ', qty: 1, price: 1200, total: 1200 },
    { id: 'm2', name: 'Хладагент R-410A', qty: 0.5, price: 2200, total: 1100 },
  ],
  laborCost: 4000,
  totalRevenue: 8700,
  costPrice: 5200,
  margin: 3500,
  marginPct: 40.2,
  photos: ['до_ремонта_1.jpg', 'до_ремонта_2.jpg'],
  comments: [
    { author: 'Диспетчер Н.В.', time: '10:15', text: 'Назначен Козлов М.И. — ближайший свободный' },
    { author: 'Козлов М.И.', time: '10:31', text: 'Выехал, буду через 15 мин' },
  ],
};

const STATUS_FLOW = ['Новая', 'Назначен', 'В пути', 'Прибыл', 'В работе', 'Выполнен'] as const;

const WorkOrderDetail = ({ onBack }: Props) => {
  const [order] = useState(MOCK_ORDER);
  const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'finance' | 'photos' | 'comments'>('overview');
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(order.comments);

  const currentStatusIdx = STATUS_FLOW.indexOf(order.status as typeof STATUS_FLOW[number]);

  const addComment = () => {
    if (!comment.trim()) return;
    setComments(prev => [...prev, { author: 'Диспетчер', time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }), text: comment }]);
    setComment('');
    toast.success('Комментарий добавлен');
  };

  const totalMaterials = order.materials.reduce((s, m) => s + m.total, 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
              <ArrowLeft size={16} /> Назад
            </button>
          )}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-gray-900">{order.id}</h2>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">{order.status}</span>
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">{order.priority}</span>
            </div>
            <p className="text-gray-500 text-sm">{order.type} · {order.client}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info('Звонок клиенту')}>
            <Phone size={14} className="mr-2" /> Позвонить
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info('Маршрут на карте')}>
            <Navigation size={14} className="mr-2" /> Маршрут
          </Button>
          <Button size="sm" onClick={() => toast.success('Статус обновлён')}>
            <CheckCircle size={14} className="mr-2" /> Обновить статус
          </Button>
        </div>
      </div>

      {/* SLA alert */}
      {order.slaStatus === 'red' && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-900">SLA под угрозой — TTR истекает через {order.slaRemaining} мин</p>
            <p className="text-xs text-red-700">Дедлайн: {new Date(order.slaDeadline).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      )}

      {/* Status progress */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
        <div className="flex items-center justify-between">
          {STATUS_FLOW.map((stage, i) => (
            <div key={stage} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                  ${i < currentStatusIdx ? 'bg-green-500 text-white' : i === currentStatusIdx ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-gray-200 text-gray-500'}`}>
                  {i < currentStatusIdx ? <CheckCircle size={14} /> : i + 1}
                </div>
                <p className={`text-xs mt-1 ${i === currentStatusIdx ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>{stage}</p>
              </div>
              {i < STATUS_FLOW.length - 1 && (
                <div className={`h-0.5 w-16 mx-1 mb-5 ${i < currentStatusIdx ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Engineer card */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Инженер</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-700 font-bold">КМ</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{order.engineer}</p>
              <p className="text-xs text-gray-500">{order.engineerPhone}</p>
            </div>
          </div>
        </div>

        {/* Client card */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Клиент / Объект</h3>
          <p className="text-sm font-medium text-gray-900 mb-1">{order.client}</p>
          <p className="text-xs text-gray-600">{order.contactName}</p>
          <p className="text-xs text-gray-500">{order.contactPhone}</p>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
            <MapPin size={11} /> {order.address}
          </div>
        </div>

        {/* Time card */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Время</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Создана:</span>
              <span className="font-medium">{new Date(order.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Назначена:</span>
              <span className="font-medium">{new Date(order.assignedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Прибытие:</span>
              <span className="text-gray-400">—</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 flex items-center gap-1"><Clock size={10} /> Оценка:</span>
              <span className="font-medium">{order.estimatedHours} ч</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {[
          { id: 'overview', label: 'Описание' },
          { id: 'materials', label: `Материалы (${order.materials.length})` },
          { id: 'finance', label: 'Финансы' },
          { id: 'photos', label: `Фото (${order.photos.length})` },
          { id: 'comments', label: `Комментарии (${comments.length})` },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Оборудование</h4>
              <p className="text-sm text-gray-900">{order.equipment}</p>
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Описание неисправности</h4>
              <p className="text-sm text-gray-700">{order.description}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'materials' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Наименование</th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">Кол-во</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Цена</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Сумма</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.materials.map(m => (
                <tr key={m.id}>
                  <td className="px-4 py-3 text-gray-900">{m.name}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{m.qty}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{m.price.toLocaleString('ru-RU')} ₽</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{m.total.toLocaleString('ru-RU')} ₽</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-semibold">
                <td colSpan={3} className="px-4 py-3 text-gray-700">Итого материалов</td>
                <td className="px-4 py-3 text-right text-gray-900">{totalMaterials.toLocaleString('ru-RU')} ₽</td>
              </tr>
            </tbody>
          </table>
          <div className="p-4 border-t border-gray-100">
            <Button size="sm" variant="outline" onClick={() => toast.info('Добавление материала')}>
              + Добавить материал
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'finance' && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Доходы</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Работы</span>
                  <span className="font-medium">{order.laborCost.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Материалы</span>
                  <span className="font-medium">{totalMaterials.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-3 font-semibold">
                  <span>Итого выручка</span>
                  <span className="text-gray-900">{order.totalRevenue.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Себестоимость и маржа</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Себестоимость</span>
                  <span className="font-medium">{order.costPrice.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between text-green-700 font-semibold border-t border-gray-100 pt-3">
                  <span className="flex items-center gap-1"><DollarSign size={14} /> Маржа</span>
                  <span>{order.margin.toLocaleString('ru-RU')} ₽ ({order.marginPct}%)</span>
                </div>
              </div>
              <div className="mt-4 h-2 bg-gray-100 rounded-full">
                <div className="h-2 bg-green-500 rounded-full" style={{ width: `${order.marginPct}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'photos' && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="grid grid-cols-4 gap-3 mb-4">
            {order.photos.map((photo, i) => (
              <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 cursor-pointer hover:border-gray-400"
                onClick={() => toast.info(`Открыть: ${photo}`)}>
                <Camera size={24} className="text-gray-400" />
                <span className="sr-only">{photo}</span>
              </div>
            ))}
            <button className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500"
              onClick={() => toast.info('Загрузка фото')}>
              <Camera size={24} />
              <span className="text-xs mt-1">Добавить</span>
            </button>
          </div>
          <p className="text-xs text-gray-500">Загружено {order.photos.length} из 2 обязательных фото</p>
        </div>
      )}

      {activeTab === 'comments' && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="space-y-3 mb-4">
            {comments.map((c, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                  <User size={14} className="text-gray-600" />
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-900">{c.author}</span>
                    <span className="text-xs text-gray-400">{c.time}</span>
                  </div>
                  <p className="text-sm text-gray-700">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={comment} onChange={e => setComment(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addComment()}
              placeholder="Написать комментарий..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            <Button size="sm" onClick={addComment}>
              <MessageSquare size={14} className="mr-1" /> Отправить
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrderDetail;
