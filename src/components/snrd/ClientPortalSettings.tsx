import { useState } from 'react';
import { Globe, Bell, Shield, Palette, MessageSquare, Star, ToggleLeft, Save, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Setting {
  key: string;
  label: string;
  description: string;
  value: boolean;
}

const ClientPortalSettings = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'branding' | 'security'>('general');

  const [generalSettings, setGeneralSettings] = useState<Setting[]>([
    { key: 'tracking', label: 'Отслеживание заявок', description: 'Клиенты могут отслеживать статус заявки в реальном времени', value: true },
    { key: 'rating', label: 'Оценка качества', description: 'Форма оценки работы инженера после завершения', value: true },
    { key: 'history', label: 'История обращений', description: 'Клиент видит все свои прошлые заявки', value: true },
    { key: 'new_request', label: 'Создание заявок', description: 'Клиент может создать новую заявку через портал', value: false },
    { key: 'documents', label: 'Доступ к документам', description: 'Акты выполненных работ, счета, гарантийные талоны', value: true },
    { key: 'chat', label: 'Чат с инженером', description: 'Обмен сообщениями в рамках заявки', value: false },
    { key: 'equipment_list', label: 'Список оборудования', description: 'Перечень обслуживаемого оборудования клиента', value: true },
    { key: 'invoice_pay', label: 'Онлайн-оплата', description: 'Оплата счетов через портал (интеграция с эквайрингом)', value: false },
  ]);

  const [notifSettings, setNotifSettings] = useState<Setting[]>([
    { key: 'n_created', label: 'Заявка принята', description: 'SMS/Email при регистрации заявки', value: true },
    { key: 'n_assigned', label: 'Инженер назначен', description: 'Уведомление с именем и фото инженера', value: true },
    { key: 'n_enroute', label: 'Инженер выехал', description: 'ETA и ссылка на трекинг', value: true },
    { key: 'n_30min', label: 'За 30 минут', description: 'Предупреждение о скором прибытии', value: true },
    { key: 'n_parts', label: 'Ожидание запчасти', description: 'Уведомление о заказе ЗИП', value: false },
    { key: 'n_parts_ready', label: 'Запчасть получена', description: 'Предложение записаться на повторный выезд', value: false },
    { key: 'n_completed', label: 'Работа выполнена', description: 'С ссылкой на оценку и документы', value: true },
    { key: 'n_reminder', label: 'Напоминание о ТО', description: 'За 30 дней до планового обслуживания', value: true },
  ]);

  const [brandSettings] = useState({
    primaryColor: '#2563eb',
    companyName: 'Сервис Климат',
    logoUrl: '',
    welcomeText: 'Добро пожаловать в личный кабинет',
    supportPhone: '+7 (800) 100-20-30',
    supportEmail: 'support@servisklimat.ru',
  });

  const [securitySettings] = useState({
    authMethod: 'phone' as 'phone' | 'email' | 'both',
    sessionHours: 24,
    otpLength: 4,
    ipWhitelist: false,
    twoFactor: false,
  });

  const toggleSetting = (list: Setting[], setList: (v: Setting[]) => void, key: string) => {
    setList(list.map(s => s.key === key ? { ...s, value: !s.value } : s));
  };

  const ToggleRow = ({ setting, onToggle }: { setting: Setting; onToggle: () => void }) => (
    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
      <div>
        <p className="font-medium text-gray-900 text-sm">{setting.label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{setting.description}</p>
      </div>
      <button onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${setting.value ? 'bg-blue-600' : 'bg-gray-200'}`}>
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${setting.value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Globe size={28} className="text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Клиентский портал</h2>
            <p className="text-gray-500 text-sm">Настройка личного кабинета и уведомлений</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open('/portal', '_blank')}>
            <Eye size={14} className="mr-2" /> Предпросмотр
          </Button>
          <Button onClick={() => toast.success('Настройки сохранены')}>
            <Save size={14} className="mr-2" /> Сохранить
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {([
          { id: 'general', label: 'Функции', icon: ToggleLeft },
          { id: 'notifications', label: 'Уведомления', icon: Bell },
          { id: 'branding', label: 'Брендинг', icon: Palette },
          { id: 'security', label: 'Безопасность', icon: Shield },
        ] as const).map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div>
          <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Клиентский портал</strong> — это веб-страница, доступная по уникальной ссылке для каждого клиента.
              Позволяет отслеживать заявки, общаться с инженером и получать документы без звонков в офис.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {generalSettings.map(s => (
              <ToggleRow key={s.key} setting={s} onToggle={() => toggleSetting(generalSettings, setGeneralSettings, s.key)} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div>
          <div className="mb-4 p-4 bg-amber-50 border border-amber-100 rounded-lg">
            <p className="text-sm text-amber-800">
              Настройте, какие автоматические уведомления получают клиенты. Каждое уведомление отправляется по SMS и/или Email в зависимости от предпочтений клиента.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {notifSettings.map(s => (
              <ToggleRow key={s.key} setting={s} onToggle={() => toggleSetting(notifSettings, setNotifSettings, s.key)} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'branding' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Идентификация</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Название компании</label>
                  <input defaultValue={brandSettings.companyName}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Приветственный текст</label>
                  <input defaultValue={brandSettings.welcomeText}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Основной цвет</label>
                  <div className="flex gap-2">
                    <input type="color" defaultValue={brandSettings.primaryColor} className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
                    <input defaultValue={brandSettings.primaryColor}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Контакты поддержки</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Телефон</label>
                  <input defaultValue={brandSettings.supportPhone}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                  <input defaultValue={brandSettings.supportEmail}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Логотип (URL)</label>
                  <input placeholder="https://..." defaultValue={brandSettings.logoUrl}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Eye size={16} /> Предпросмотр шапки портала
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: brandSettings.primaryColor }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-white/20 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">СК</span>
                  </div>
                  <span className="text-white font-semibold text-sm">{brandSettings.companyName}</span>
                </div>
                <span className="text-white/70 text-xs">Заявка №WO-2026-000045</span>
              </div>
              <div className="p-4 bg-gray-50 text-center">
                <p className="text-gray-700 text-sm">{brandSettings.welcomeText}</p>
                <p className="text-xs text-gray-400 mt-1">{brandSettings.supportPhone} · {brandSettings.supportEmail}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare size={16} /> Метод аутентификации клиента
            </h3>
            <div className="space-y-2">
              {[
                { id: 'phone', label: 'По номеру телефона (OTP-код в SMS)', desc: 'Рекомендуется для физических лиц' },
                { id: 'email', label: 'По Email (магическая ссылка)', desc: 'Удобно для корпоративных клиентов' },
                { id: 'both', label: 'Оба варианта (клиент выбирает)', desc: 'Максимальная гибкость' },
              ].map(opt => (
                <label key={opt.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="authMethod" value={opt.id} defaultChecked={securitySettings.authMethod === opt.id}
                    className="mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{opt.label}</p>
                    <p className="text-xs text-gray-500">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Star size={16} /> Параметры сессии
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Время жизни сессии (часы)</label>
                <input type="number" defaultValue={securitySettings.sessionHours}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Длина OTP-кода (цифр)</label>
                <select defaultValue={securitySettings.otpLength}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option value={4}>4 цифры</option>
                  <option value={6}>6 цифр</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPortalSettings;
