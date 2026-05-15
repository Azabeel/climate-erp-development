import { useState } from 'react';
import { MapPin, Thermometer, Wrench, Calendar, FileText, AlertTriangle, CheckCircle, Clock, QrCode, Camera, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  objectId?: string;
  objectName?: string;
  onBack?: () => void;
}

const EQUIPMENT = [
  { id: 'eq1', name: 'Daikin FTXB35C', serial: 'DK-2022-481', type: 'Сплит-система', capacity: '3.5 кВт', refrigerant: 'R-410A', installDate: '2022-03-15', lastService: '2025-11-10', nextService: '2026-05-10', status: 'ok', uptime: 99.1, failureCount: 1 },
  { id: 'eq2', name: 'Daikin FTXB50C', serial: 'DK-2022-482', type: 'Сплит-система', capacity: '5.0 кВт', refrigerant: 'R-410A', installDate: '2022-03-15', lastService: '2025-11-10', nextService: '2026-05-10', status: 'warning', uptime: 96.3, failureCount: 3 },
  { id: 'eq3', name: 'Mitsubishi MSZ-LN25', serial: 'MT-2023-194', type: 'Инверторная', capacity: '2.5 кВт', refrigerant: 'R-32', installDate: '2023-07-20', lastService: '2025-07-20', nextService: '2026-07-20', status: 'ok', uptime: 98.7, failureCount: 0 },
];

const HISTORY = [
  { date: '2026-05-14', type: 'ТО', engineer: 'Козлов М.И.', desc: 'Плановое ТО, замена фильтров', cost: 4500, status: 'completed' },
  { date: '2025-11-10', type: 'Ремонт', engineer: 'Петров С.А.', desc: 'Замена конденсатора пускового FTXB50C', cost: 7800, status: 'completed' },
  { date: '2025-07-20', type: 'ТО', engineer: 'Козлов М.И.', desc: 'Плановое ТО', cost: 9000, status: 'completed' },
  { date: '2025-03-12', type: 'Диагностика', engineer: 'Иванов А.К.', desc: 'Диагностика шума в наружном блоке', cost: 2000, status: 'completed' },
];

const UPTIME_DATA = [
  { month: 'Дек', uptime: 98.2 },
  { month: 'Янв', uptime: 97.8 },
  { month: 'Фев', uptime: 98.5 },
  { month: 'Мар', uptime: 99.1 },
  { month: 'Апр', uptime: 98.7 },
  { month: 'Май', uptime: 98.9 },
];

const ServiceObjectCard = ({ objectName = 'ТЦ Мираж — Зал 2', onBack }: Props) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'equipment' | 'history' | 'docs'>('overview');
  const [selectedEquip, setSelectedEquip] = useState<string | null>(null);

  const totalCost = HISTORY.reduce((s, h) => s + h.cost, 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
              ← Назад
            </button>
          )}
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <MapPin size={24} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{objectName}</h2>
            <p className="text-gray-500 flex items-center gap-1 text-sm mt-0.5">
              <MapPin size={12} /> ул. Ленина, 1, г. Москва · Клиент: ООО «Торговый центр Мираж»
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info('QR-код объекта')}>
            <QrCode size={14} className="mr-2" /> QR-код
          </Button>
          <Button size="sm" onClick={() => toast.success('Заявка создана')}>
            <Wrench size={14} className="mr-2" /> Создать заявку
          </Button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Единиц оборудования', value: EQUIPMENT.length.toString(), icon: Thermometer, color: 'text-blue-600 bg-blue-50' },
          { label: 'Посл. обслуживание', value: '14 мая 2026', icon: Calendar, color: 'text-green-600 bg-green-50' },
          { label: 'Затрат за год', value: `${totalCost.toLocaleString('ru-RU')} ₽`, icon: FileText, color: 'text-purple-600 bg-purple-50' },
          { label: 'Требует внимания', value: '1 ед.', icon: AlertTriangle, color: 'text-orange-600 bg-orange-50' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${kpi.color}`}>
              <kpi.icon size={18} />
            </div>
            <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
            <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {[
          { id: 'overview', label: 'Обзор' },
          { id: 'equipment', label: `Оборудование (${EQUIPMENT.length})` },
          { id: 'history', label: 'История работ' },
          { id: 'docs', label: 'Документы' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Uptime оборудования</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={UPTIME_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[95, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`${v}%`, 'Uptime']} />
                <Line type="monotone" dataKey="uptime" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Статус единиц</h3>
            {EQUIPMENT.map(eq => (
              <div key={eq.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{eq.name}</p>
                  <p className="text-xs text-gray-500">{eq.serial}</p>
                </div>
                <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${eq.status === 'ok' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {eq.status === 'ok' ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
                  {eq.status === 'ok' ? 'OK' : 'Внимание'}
                </span>
              </div>
            ))}
          </div>

          <div className="col-span-3 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Ближайшие работы</h3>
            <div className="space-y-3">
              {[
                { date: '2026-05-21', type: 'ТО плановое', equip: 'Daikin FTXB35C + FTXB50C', engineer: 'Козлов М.И.', status: 'planned' },
                { date: '2026-06-15', type: 'Заправка хладагентом', equip: 'Daikin FTXB50C (R-410A, 0.5 кг)', engineer: 'Петров С.А.', status: 'planned' },
              ].map((work, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <Clock size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{work.type}</p>
                    <p className="text-xs text-gray-500">{work.equip}</p>
                    <p className="text-xs text-gray-400">{new Date(work.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} · {work.engineer}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Equipment */}
      {activeTab === 'equipment' && (
        <div className="space-y-4">
          {EQUIPMENT.map(eq => (
            <div key={eq.id}
              className={`bg-white border rounded-xl p-5 shadow-sm cursor-pointer transition-all ${selectedEquip === eq.id ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'}`}
              onClick={() => setSelectedEquip(selectedEquip === eq.id ? null : eq.id)}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${eq.status === 'ok' ? 'bg-green-50' : 'bg-yellow-50'}`}>
                    <Thermometer size={20} className={eq.status === 'ok' ? 'text-green-600' : 'text-yellow-600'} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{eq.name}</h4>
                    <p className="text-xs text-gray-500">{eq.serial} · {eq.type} · {eq.capacity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Uptime: {eq.uptime}%</p>
                  <p className="text-xs text-gray-500">{eq.failureCount} отказов за год</p>
                </div>
              </div>
              {selectedEquip === eq.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-sm">
                  <div><span className="text-gray-500">Хладагент:</span> <span className="font-medium">{eq.refrigerant}</span></div>
                  <div><span className="text-gray-500">Установлен:</span> <span className="font-medium">{new Date(eq.installDate).toLocaleDateString('ru-RU')}</span></div>
                  <div><span className="text-gray-500">Посл. ТО:</span> <span className="font-medium">{new Date(eq.lastService).toLocaleDateString('ru-RU')}</span></div>
                  <div><span className="text-gray-500">Следующее ТО:</span> <span className="font-medium text-blue-600">{new Date(eq.nextService).toLocaleDateString('ru-RU')}</span></div>
                  <div className="col-span-2 flex gap-2 mt-2">
                    <Button size="sm" variant="outline" onClick={() => toast.info(`Фото: ${eq.name}`)}>
                      <Camera size={12} className="mr-1" /> Фото
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toast.info(`QR: ${eq.serial}`)}>
                      <QrCode size={12} className="mr-1" /> QR
                    </Button>
                    <Button size="sm" onClick={() => toast.success(`Наряд на ${eq.name} создан`)}>
                      <Wrench size={12} className="mr-1" /> Заявка
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* History */}
      {activeTab === 'history' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Дата</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Тип</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Описание</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Инженер</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Стоимость</th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {HISTORY.map((h, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{new Date(h.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{h.type}</span></td>
                  <td className="px-4 py-3 text-gray-700">{h.desc}</td>
                  <td className="px-4 py-3 text-gray-700">{h.engineer}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{h.cost.toLocaleString('ru-RU')} ₽</td>
                  <td className="px-4 py-3 text-center">
                    <span className="flex items-center justify-center gap-1 text-xs text-green-700">
                      <CheckCircle size={12} /> Выполнено
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Docs */}
      {activeTab === 'docs' && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { name: 'Паспорт объекта.pdf', type: 'pdf', size: '1.2 МБ', date: '2022-03-15' },
            { name: 'Акт ТО 2026-05-14.pdf', type: 'pdf', size: '0.8 МБ', date: '2026-05-14' },
            { name: 'Договор №ДО-2022-014.docx', type: 'docx', size: '0.5 МБ', date: '2022-01-10' },
            { name: 'Схема системы кондиционирования.pdf', type: 'pdf', size: '3.1 МБ', date: '2022-03-15' },
            { name: 'Акт ТО 2025-11-10.pdf', type: 'pdf', size: '0.7 МБ', date: '2025-11-10' },
            { name: 'Гарантийный талон Daikin.pdf', type: 'pdf', size: '0.3 МБ', date: '2022-03-15' },
          ].map((doc, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-3 hover:border-gray-300 cursor-pointer"
              onClick={() => toast.info(`Открыть: ${doc.name}`)}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${doc.type === 'pdf' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                {doc.type.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                <p className="text-xs text-gray-400">{doc.size} · {new Date(doc.date).toLocaleDateString('ru-RU')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceObjectCard;
