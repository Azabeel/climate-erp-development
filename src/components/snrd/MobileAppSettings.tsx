import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AppFeature {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  category: string;
}

const FEATURES: AppFeature[] = [
  { id: 'gps_tracking', label: 'GPS-трекинг', description: 'Автоматическая запись маршрутов инженеров', enabled: true, category: 'Геолокация' },
  { id: 'offline_mode', label: 'Офлайн режим', description: 'Работа без интернета с синхронизацией при появлении сети', enabled: true, category: 'Синхронизация' },
  { id: 'auto_sync', label: 'Авто-синхронизация', description: 'Синхронизация каждые 5 минут в фоне', enabled: true, category: 'Синхронизация' },
  { id: 'barcode_scan', label: 'Сканирование QR/штрих-кодов', description: 'Сканирование QR-кодов оборудования для быстрого открытия карточки', enabled: true, category: 'Функции' },
  { id: 'photo_upload', label: 'Фото до/после', description: 'Обязательная загрузка фотографий работ', enabled: true, category: 'Функции' },
  { id: 'signature', label: 'Электронная подпись клиента', description: 'Клиент подписывает акт на экране телефона', enabled: false, category: 'Документы' },
  { id: 'push_orders', label: 'Push-уведомления о нарядах', description: 'Мгновенные уведомления о новых нарядах', enabled: true, category: 'Уведомления' },
  { id: 'voice_notes', label: 'Голосовые заметки', description: 'Запись голосовых комментариев к нарядам', enabled: false, category: 'Функции' },
  { id: 'materials_scan', label: 'Сканирование материалов', description: 'Штрих-код для списания материалов со склада', enabled: true, category: 'Функции' },
  { id: 'salary_view', label: 'Просмотр зарплаты', description: 'Инженер видит свой расчётный листок в приложении', enabled: true, category: 'HR' },
  { id: 'chat', label: 'Чат с диспетчером', description: 'Встроенный чат для связи с офисом', enabled: false, category: 'Коммуникации' },
  { id: 'navigation', label: 'Навигация к объекту', description: 'Интеграция с картами для построения маршрута', enabled: true, category: 'Геолокация' },
];

interface Role {
  id: string;
  name: string;
  features: string[];
  color: string;
}

const ROLES: Role[] = [
  { id: 'engineer', name: 'Инженер', features: ['gps_tracking', 'offline_mode', 'auto_sync', 'barcode_scan', 'photo_upload', 'push_orders', 'materials_scan', 'salary_view', 'navigation'], color: 'bg-blue-100 text-blue-700' },
  { id: 'senior', name: 'Старший инженер', features: ['gps_tracking', 'offline_mode', 'auto_sync', 'barcode_scan', 'photo_upload', 'signature', 'push_orders', 'voice_notes', 'materials_scan', 'salary_view', 'chat', 'navigation'], color: 'bg-purple-100 text-purple-700' },
  { id: 'contractor', name: 'Подрядчик', features: ['offline_mode', 'barcode_scan', 'photo_upload', 'push_orders', 'navigation'], color: 'bg-orange-100 text-orange-700' },
];

const categories = [...new Set(FEATURES.map(f => f.category))];

const MobileAppSettings = () => {
  const [features, setFeatures] = useState<AppFeature[]>(FEATURES);
  const [selectedRole, setSelectedRole] = useState<Role>(ROLES[0]);
  const [tab, setTab] = useState<'features' | 'roles' | 'sync' | 'version'>('features');
  const [syncInterval, setSyncInterval] = useState(5);
  const [photoRequired, setPhotoRequired] = useState(true);
  const [gpsInterval, setGpsInterval] = useState(30);
  const [saved, setSaved] = useState(false);

  const toggleFeature = (id: string) => {
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
    return (
      <button
        onClick={onChange}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${value ? 'bg-blue-500' : 'bg-gray-200'}`}
      >
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow ${value ? 'translate-x-4.5' : 'translate-x-0.5'}`} style={{ transform: value ? 'translateX(18px)' : 'translateX(2px)' }} />
      </button>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Настройки мобильного приложения</h2>
          <p className="text-sm text-gray-500 mt-0.5">Android-приложение для выездных сотрудников</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs text-green-700 font-medium">v2.4.1 — актуальная</span>
          </div>
          <Button size="sm" onClick={handleSave}>
            <Icon name={saved ? 'Check' : 'Save'} size={14} className="mr-1.5" />
            {saved ? 'Сохранено' : 'Сохранить'}
          </Button>
        </div>
      </div>

      {/* Вкладки */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {([
          { id: 'features', label: 'Функции', icon: 'Settings' },
          { id: 'roles', label: 'Роли', icon: 'UserCheck' },
          { id: 'sync', label: 'Синхронизация', icon: 'RefreshCw' },
          { id: 'version', label: 'Версии', icon: 'Smartphone' },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-blue-500 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Icon name={t.icon} size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'features' && (
        <div className="space-y-6">
          {categories.map(cat => (
            <div key={cat} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700">{cat}</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {features.filter(f => f.category === cat).map(feature => (
                  <div key={feature.id} className="flex items-center justify-between p-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{feature.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{feature.description}</p>
                    </div>
                    <Toggle value={feature.enabled} onChange={() => toggleFeature(feature.id)} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'roles' && (
        <div className="grid grid-cols-3 gap-4">
          {ROLES.map(role => (
            <div
              key={role.id}
              onClick={() => setSelectedRole(role)}
              className={`bg-white border rounded-xl p-4 cursor-pointer transition-all ${selectedRole.id === role.id ? 'border-blue-400 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm font-semibold px-2.5 py-1 rounded-full ${role.color}`}>{role.name}</span>
                {selectedRole.id === role.id && <Icon name="Check" size={15} className="text-blue-600" />}
              </div>
              <p className="text-xs text-gray-500 mb-3">Доступных функций: {role.features.length}/{features.length}</p>
              <div className="space-y-1.5">
                {features.map(f => (
                  <div key={f.id} className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${role.features.includes(f.id) ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}`}>
                      {role.features.includes(f.id) && <Icon name="Check" size={9} className="text-white" />}
                    </div>
                    <span className={`text-xs ${role.features.includes(f.id) ? 'text-gray-700' : 'text-gray-300'}`}>{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'sync' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Параметры синхронизации</h3>
            <div className="space-y-4">
              {[
                { label: 'Интервал синхронизации (мин)', value: syncInterval, onChange: setSyncInterval, min: 1, max: 60 },
                { label: 'Интервал GPS (сек)', value: gpsInterval, onChange: setGpsInterval, min: 10, max: 300 },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-900">{s.label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => s.onChange(Math.max(s.min, s.value - 1))} className="w-7 h-7 border border-gray-200 rounded flex items-center justify-center hover:bg-gray-50">
                      <Icon name="Minus" size={13} className="text-gray-500" />
                    </button>
                    <span className="w-10 text-center text-sm font-medium text-gray-900">{s.value}</span>
                    <button onClick={() => s.onChange(Math.min(s.max, s.value + 1))} className="w-7 h-7 border border-gray-200 rounded flex items-center justify-center hover:bg-gray-50">
                      <Icon name="Plus" size={13} className="text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-900">Обязательное фото до/после</p>
                  <p className="text-xs text-gray-400">Запрещать закрытие наряда без фото</p>
                </div>
                <Toggle value={photoRequired} onChange={() => setPhotoRequired(r => !r)} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Статус устройств</h3>
            <div className="space-y-2">
              {[
                { name: 'Петров А.В.', device: 'Samsung Galaxy A54', version: 'v2.4.1', lastSync: '2 мин назад', status: 'online' },
                { name: 'Сидоров К.Н.', device: 'Xiaomi Redmi Note 12', version: 'v2.4.1', lastSync: '5 мин назад', status: 'online' },
                { name: 'Козлов Д.А.', device: 'POCO X5 Pro', version: 'v2.3.8', lastSync: '1 час назад', status: 'outdated' },
                { name: 'Новиков Р.И.', device: 'Samsung Galaxy A34', version: 'v2.4.1', lastSync: '12 мин назад', status: 'online' },
              ].map(d => (
                <div key={d.name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${d.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{d.name}</p>
                      <p className="text-xs text-gray-400">{d.device}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-medium ${d.status === 'outdated' ? 'text-orange-600' : 'text-gray-500'}`}>{d.version}</p>
                    <p className="text-xs text-gray-400">{d.lastSync}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'version' && (
        <div className="space-y-3">
          {[
            { version: 'v2.4.1', date: '2026-05-10', status: 'current', changes: ['Улучшена GPS-точность', 'Исправлена ошибка сканирования QR', 'Ускорена синхронизация в 2 раза'] },
            { version: 'v2.3.8', date: '2026-04-22', status: 'outdated', changes: ['Добавлено сканирование материалов', 'Новый интерфейс создания заявки'] },
            { version: 'v2.3.5', date: '2026-04-01', status: 'outdated', changes: ['Фото до/после теперь обязательны', 'Электронная подпись клиента (beta)'] },
          ].map(v => (
            <div key={v.version} className={`bg-white border rounded-xl p-4 ${v.status === 'current' ? 'border-green-300' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{v.version}</span>
                  {v.status === 'current' && (
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">Текущая</span>
                  )}
                </div>
                <span className="text-xs text-gray-400">{v.date}</span>
              </div>
              <ul className="space-y-1">
                {v.changes.map(c => (
                  <li key={c} className="flex items-start gap-2 text-sm text-gray-600">
                    <Icon name="Check" size={13} className="text-green-500 mt-0.5 flex-shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
              {v.status !== 'current' && (
                <Button variant="outline" size="sm" className="mt-3">
                  <Icon name="Download" size={13} className="mr-1.5" />
                  Принудительно обновить
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileAppSettings;
