import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Settings, Plus, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Integration {
  id: string;
  name: string;
  category: string;
  icon: string;
  status: 'connected' | 'error' | 'disabled';
  description: string;
  lastSync?: string;
  syncCount?: number;
}

const INTEGRATIONS: Integration[] = [
  { id: 'i1', name: '1С:УНФ', category: 'Бухгалтерия', icon: '1С', status: 'connected', description: 'Синхронизация клиентов, документов, оплат', lastSync: '10 минут назад', syncCount: 1247 },
  { id: 'i2', name: 'Telegram Bot', category: 'Мессенджеры', icon: 'TG', status: 'connected', description: 'Прием заявок и уведомления через Telegram', lastSync: '2 минуты назад', syncCount: 845 },
  { id: 'i3', name: 'WhatsApp Business', category: 'Мессенджеры', icon: 'WA', status: 'error', description: 'Сообщения и уведомления через WhatsApp', lastSync: '3 часа назад', syncCount: 412 },
  { id: 'i4', name: 'Avito Messenger', category: 'Площадки', icon: 'AV', status: 'connected', description: 'Заявки с Авито', lastSync: '15 минут назад', syncCount: 233 },
  { id: 'i5', name: 'СДЭК', category: 'Доставка', icon: 'CD', status: 'connected', description: 'Отслеживание доставки запчастей', lastSync: '1 час назад', syncCount: 89 },
  { id: 'i6', name: 'Яндекс.Карты', category: 'Геолокация', icon: 'YM', status: 'connected', description: 'Геокодинг адресов и маршрутизация', lastSync: 'Онлайн', syncCount: 5621 },
  { id: 'i7', name: 'Диадок', category: 'ЭДО', icon: 'DD', status: 'disabled', description: 'Электронный документооборот', lastSync: undefined, syncCount: 0 },
  { id: 'i8', name: 'Email (IMAP/SMTP)', category: 'Email', icon: '@', status: 'connected', description: 'Входящие заявки и отправка документов', lastSync: '5 минут назад', syncCount: 318 },
  { id: 'i9', name: 'Яндекс.Погода', category: 'Внешние данные', icon: 'YW', status: 'connected', description: 'Прогноз погоды для планирования выездов', lastSync: '30 минут назад', syncCount: 144 },
  { id: 'i10', name: 'IP-телефония (Zadarma)', category: 'Телефония', icon: 'IP', status: 'disabled', description: 'Входящие звонки и запись разговоров', lastSync: undefined, syncCount: 0 },
  { id: 'i11', name: 'MAX Мессенджер', category: 'Мессенджеры', icon: 'MX', status: 'disabled', description: 'Заявки через ВКонтакте/MAX', lastSync: undefined, syncCount: 0 },
  { id: 'i12', name: 'СБИС', category: 'ЭДО', icon: 'SB', status: 'error', description: 'Электронный документооборот СБИС', lastSync: '2 дня назад', syncCount: 5 },
];

const CATEGORIES = ['Все', 'Бухгалтерия', 'Мессенджеры', 'Площадки', 'Доставка', 'Геолокация', 'ЭДО', 'Email', 'Телефония', 'Внешние данные'];

const getStatusInfo = (status: Integration['status']) => {
  switch (status) {
    case 'connected': return { icon: <CheckCircle size={16} className="text-green-500" />, label: 'Подключено', cls: 'bg-green-100 text-green-700' };
    case 'error': return { icon: <XCircle size={16} className="text-red-500" />, label: 'Ошибка', cls: 'bg-red-100 text-red-700' };
    case 'disabled': return { icon: <AlertTriangle size={16} className="text-gray-400" />, label: 'Не подключено', cls: 'bg-gray-100 text-gray-500' };
  }
};

const ICON_BG: Record<string, string> = {
  '1С': 'bg-red-100 text-red-700',
  'TG': 'bg-blue-100 text-blue-700',
  'WA': 'bg-green-100 text-green-700',
  'AV': 'bg-yellow-100 text-yellow-700',
  'CD': 'bg-green-100 text-green-800',
  'YM': 'bg-red-100 text-red-700',
  'DD': 'bg-blue-100 text-blue-800',
  '@': 'bg-purple-100 text-purple-700',
  'YW': 'bg-orange-100 text-orange-700',
  'IP': 'bg-gray-100 text-gray-700',
  'MX': 'bg-blue-100 text-blue-600',
  'SB': 'bg-teal-100 text-teal-700',
};

const IntegrationsModule = () => {
  const [activeCategory, setActiveCategory] = useState('Все');

  const filtered = activeCategory === 'Все' ? INTEGRATIONS : INTEGRATIONS.filter(i => i.category === activeCategory);
  const connected = INTEGRATIONS.filter(i => i.status === 'connected').length;
  const errors = INTEGRATIONS.filter(i => i.status === 'error').length;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Интеграции</h2>
          <p className="text-gray-600 mt-1">Подключение внешних сервисов и систем</p>
        </div>
        <Button onClick={() => toast.info('Раздел запроса новой интеграции')}>
          <Plus size={16} className="mr-2" /> Запросить интеграцию
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={20} className="text-green-600" />
            <span className="font-semibold text-green-900">Активных</span>
          </div>
          <p className="text-3xl font-bold text-green-700">{connected}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle size={20} className="text-red-600" />
            <span className="font-semibold text-red-900">Ошибок</span>
          </div>
          <p className="text-3xl font-bold text-red-700">{errors}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={20} className="text-blue-600" />
            <span className="font-semibold text-blue-900">Всего событий</span>
          </div>
          <p className="text-3xl font-bold text-blue-700">
            {INTEGRATIONS.reduce((s, i) => s + (i.syncCount || 0), 0).toLocaleString('ru-RU')}
          </p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filtered.map(intg => {
          const statusInfo = getStatusInfo(intg.status);
          return (
            <div key={intg.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${ICON_BG[intg.icon] || 'bg-gray-100 text-gray-700'}`}>
                  {intg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900">{intg.name}</h4>
                    <div className="flex items-center gap-1">
                      {statusInfo.icon}
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusInfo.cls}`}>{statusInfo.label}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{intg.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {intg.lastSync && <span>Синхр.: {intg.lastSync}</span>}
                      {(intg.syncCount || 0) > 0 && <span>{intg.syncCount?.toLocaleString('ru-RU')} событий</span>}
                    </div>
                    <div className="flex gap-1">
                      {intg.status === 'connected' && (
                        <Button size="sm" variant="ghost" onClick={() => toast.success(`${intg.name}: синхронизация запущена`)}>
                          <RefreshCw size={13} />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => toast.info(`Настройки: ${intg.name}`)}>
                        <Settings size={13} />
                      </Button>
                      {intg.status === 'disabled' && (
                        <Button size="sm" onClick={() => toast.success(`${intg.name}: подключение инициировано`)}>
                          Подключить
                        </Button>
                      )}
                      {intg.status === 'error' && (
                        <Button size="sm" variant="outline" className="border-red-300 text-red-600" onClick={() => toast.success(`${intg.name}: повторное подключение...`)}>
                          Переподключить
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IntegrationsModule;
