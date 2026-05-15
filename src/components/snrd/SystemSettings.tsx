import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = 'company' | 'orders' | 'notifications' | 'finance' | 'security' | 'backup';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS: Tab[] = [
  { id: 'company',       label: 'Компания',           icon: 'Building2' },
  { id: 'orders',        label: 'Наряды',              icon: 'ClipboardList' },
  { id: 'notifications', label: 'Уведомления',         icon: 'Bell' },
  { id: 'finance',       label: 'Финансы',             icon: 'DollarSign' },
  { id: 'security',      label: 'Безопасность',        icon: 'Shield' },
  { id: 'backup',        label: 'Резервное копирование', icon: 'HardDrive' },
];

const TIMEZONES = [
  { value: 'Europe/Moscow',       label: 'UTC+3 — Москва, Санкт-Петербург' },
  { value: 'Europe/Samara',       label: 'UTC+4 — Самара, Ижевск' },
  { value: 'Asia/Yekaterinburg',  label: 'UTC+5 — Екатеринбург, Тюмень' },
  { value: 'Asia/Omsk',           label: 'UTC+6 — Омск' },
  { value: 'Asia/Krasnoyarsk',    label: 'UTC+7 — Красноярск, Новосибирск' },
  { value: 'Asia/Irkutsk',        label: 'UTC+8 — Иркутск' },
  { value: 'Asia/Yakutsk',        label: 'UTC+9 — Якутск' },
  { value: 'Asia/Vladivostok',    label: 'UTC+10 — Владивосток' },
];

const WEEK_DAYS = [
  { key: 'mon', label: 'Пн' },
  { key: 'tue', label: 'Вт' },
  { key: 'wed', label: 'Ср' },
  { key: 'thu', label: 'Чт' },
  { key: 'fri', label: 'Пт' },
  { key: 'sat', label: 'Сб' },
  { key: 'sun', label: 'Вс' },
];

const NOTIFICATION_CHANNELS = [
  { key: 'telegram',  label: 'Telegram',  icon: 'Send',  senderLabel: 'Bot username', keyLabel: 'Bot token' },
  { key: 'whatsapp',  label: 'WhatsApp',  icon: 'MessageCircle', senderLabel: 'Phone number', keyLabel: 'API key' },
  { key: 'email',     label: 'Email',     icon: 'Mail',  senderLabel: 'From address', keyLabel: 'SMTP password' },
  { key: 'sms',       label: 'SMS',       icon: 'Smartphone', senderLabel: 'Sender name', keyLabel: 'API key' },
] as const;

type ChannelKey = typeof NOTIFICATION_CHANNELS[number]['key'];

const NOTIFICATION_EVENTS = [
  'Заявка принята (ASSIGNED)',
  'Инженер выехал (EN_ROUTE)',
  'Инженер прибыл (ON_SITE)',
  'Ожидание запчасти (AWAITING_PARTS)',
  'Запчасть получена (PARTS_READY)',
  'Работы завершены (COMPLETED)',
];

const NOTIFICATION_TEMPLATES = [
  'Шаблон: Принята',
  'Шаблон: Выезд',
  'Шаблон: Прибытие',
  'Шаблон: Ожидание ЗИП',
  'Шаблон: ЗИП готов',
  'Шаблон: Завершение',
];

const BACKUP_TABLE_DATA = [
  { date: '15.05.2026 03:00', size: '842 МБ', storage: 'S3',     status: 'ok' },
  { date: '14.05.2026 03:00', size: '838 МБ', storage: 'S3',     status: 'ok' },
  { date: '13.05.2026 03:00', size: '834 МБ', storage: 'S3',     status: 'ok' },
  { date: '12.05.2026 03:00', size: '829 МБ', storage: 'S3',     status: 'ok' },
  { date: '11.05.2026 03:00', size: '822 МБ', storage: 'Локально', status: 'warn' },
];

const LOGIN_LOG = [
  { user: 'admin@servisklimat.ru',   ip: '192.168.1.10',  time: '15.05.2026 09:12', result: 'Успешно' },
  { user: 'dispatcher@sk.ru',        ip: '10.0.0.44',     time: '15.05.2026 08:57', result: 'Успешно' },
  { user: 'engineer1@sk.ru',         ip: '95.173.12.88',  time: '15.05.2026 08:41', result: 'Успешно' },
  { user: 'admin@servisklimat.ru',   ip: '192.168.1.10',  time: '14.05.2026 20:05', result: 'Успешно' },
  { user: 'unknown@mail.ru',         ip: '77.244.56.101', time: '14.05.2026 18:33', result: 'Отказано' },
];

// ─── Primitive helpers ────────────────────────────────────────────────────────

const Toggle = ({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
      value ? 'bg-blue-600' : 'bg-gray-200'
    }`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
        value ? 'translate-x-5' : 'translate-x-0.5'
      }`}
    />
  </button>
);

const SelectField = ({
  value,
  onChange,
  options,
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-blue-400 ${className}`}
  >
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);

const SettingRow = ({
  label,
  desc,
  children,
}: {
  label: string;
  desc?: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0 gap-4">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900">{label}</p>
      {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

// ─── State types ──────────────────────────────────────────────────────────────

interface CompanyState {
  name: string;
  inn: string;
  ogrn: string;
  address: string;
  phone: string;
  email: string;
  timezone: string;
  workStart: string;
  workEnd: string;
  workDays: Record<string, boolean>;
}

interface OrdersState {
  numberTemplate: string;
  autoAssign: boolean;
  defaultPriority: string;
  photoRequiredBefore: boolean;
  photoRequiredAfter: boolean;
  escalationWaitMinutes: string;
  defaultSla: string;
}

interface ChannelConfig {
  enabled: boolean;
  sender: string;
  apiKey: string;
  showKey: boolean;
}

interface NotificationsState {
  channels: Record<ChannelKey, ChannelConfig>;
  eventTemplates: Record<string, string>;
}

interface FinanceState {
  currency: string;
  vatRate: string;
  zipMarkupPercent: string;
  overheadPercent: string;
  fuelRatePerKm: string;
  rounding: string;
}

interface SecurityState {
  passwordMinLength: string;
  requireUppercase: boolean;
  requireNumbers: boolean;
  requireSpecial: boolean;
  sessionMinutes: string;
  twoFactor: boolean;
  ipWhitelist: string;
}

interface BackupState {
  schedule: string;
  storage: string;
}

// ─── Main component ───────────────────────────────────────────────────────────

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState<TabId>('company');

  // ── Company ──
  const [company, setCompany] = useState<CompanyState>({
    name: 'ООО «Сервис Климат»',
    inn: '7701234567',
    ogrn: '1027700123456',
    address: 'г. Москва, ул. Климатическая, д. 12, офис 301',
    phone: '+7 (495) 123-45-67',
    email: 'info@servisklimat.ru',
    timezone: 'Europe/Moscow',
    workStart: '09:00',
    workEnd: '18:00',
    workDays: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false },
  });

  const toggleWorkDay = (day: string) =>
    setCompany((p) => ({ ...p, workDays: { ...p.workDays, [day]: !p.workDays[day] } }));

  // ── Orders ──
  const [orders, setOrders] = useState<OrdersState>({
    numberTemplate: 'WO-{YEAR}-{SEQ:06d}',
    autoAssign: false,
    defaultPriority: 'NORMAL',
    photoRequiredBefore: true,
    photoRequiredAfter: true,
    escalationWaitMinutes: '30',
    defaultSla: 'corporate',
  });

  // ── Notifications ──
  const [notifications, setNotifications] = useState<NotificationsState>({
    channels: {
      telegram: { enabled: true,  sender: '@servisklimat_bot', apiKey: '7123456789:AAE...', showKey: false },
      whatsapp: { enabled: false, sender: '+79001234567',       apiKey: 'EAABwz...', showKey: false },
      email:    { enabled: true,  sender: 'noreply@servisklimat.ru', apiKey: 'smtp_pass', showKey: false },
      sms:      { enabled: false, sender: 'ServKlimat',         apiKey: 'smsru_key', showKey: false },
    },
    eventTemplates: Object.fromEntries(
      NOTIFICATION_EVENTS.map((ev, i) => [ev, NOTIFICATION_TEMPLATES[i]])
    ),
  });

  const setChannelField = (ch: ChannelKey, field: keyof ChannelConfig, value: boolean | string) =>
    setNotifications((p) => ({
      ...p,
      channels: { ...p.channels, [ch]: { ...p.channels[ch], [field]: value } },
    }));

  const setEventTemplate = (event: string, template: string) =>
    setNotifications((p) => ({ ...p, eventTemplates: { ...p.eventTemplates, [event]: template } }));

  // ── Finance ──
  const [finance, setFinance] = useState<FinanceState>({
    currency: 'RUB',
    vatRate: '20',
    zipMarkupPercent: '30',
    overheadPercent: '10',
    fuelRatePerKm: '6.60',
    rounding: 'rub',
  });

  // ── Security ──
  const [security, setSecurity] = useState<SecurityState>({
    passwordMinLength: '8',
    requireUppercase: true,
    requireNumbers: true,
    requireSpecial: false,
    sessionMinutes: '480',
    twoFactor: false,
    ipWhitelist: '',
  });

  // ── Backup ──
  const [backup, setBackup] = useState<BackupState>({
    schedule: 'daily',
    storage: 's3',
  });
  const [backingUp, setBackingUp] = useState(false);

  // ── Handlers ──
  const handleSave = (tab: TabId) => {
    toast.success(`Настройки «${TABS.find((t) => t.id === tab)?.label}» сохранены`);
  };

  const handleBackupNow = () => {
    setBackingUp(true);
    toast.loading('Создание резервной копии…', { id: 'backup' });
    setTimeout(() => {
      setBackingUp(false);
      toast.success('Резервная копия создана успешно', { id: 'backup' });
    }, 3000);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 lg:p-8 min-h-full bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <Icon name="Settings" size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Системные настройки</h1>
          <p className="text-sm text-gray-500">Конфигурация платформы АСУ СЦ «Сервис Климат»</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <nav className="w-56 shrink-0 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-white hover:shadow-sm'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Panel */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* ── Tab: Company ── */}
          {activeTab === 'company' && (
            <div>
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Данные компании</h2>
              </div>
              <div className="px-6 py-2">
                {/* Logo */}
                <div className="py-4 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 mb-3">Логотип</p>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-2xl select-none">
                      СК
                    </div>
                    <div>
                      <Button variant="outline" size="sm" onClick={() => toast.info('Выберите файл изображения')}>
                        <Icon name="Upload" size={14} className="mr-1.5" />
                        Загрузить логотип
                      </Button>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG до 2 МБ. Рек. 200×200 px.</p>
                    </div>
                  </div>
                </div>

                {/* Реквизиты */}
                <SettingRow label="Название компании">
                  <Input
                    value={company.name}
                    onChange={(e) => setCompany((p) => ({ ...p, name: e.target.value }))}
                    className="w-72 text-sm"
                  />
                </SettingRow>
                <SettingRow label="ИНН">
                  <Input
                    value={company.inn}
                    onChange={(e) => setCompany((p) => ({ ...p, inn: e.target.value }))}
                    className="w-44 text-sm"
                  />
                </SettingRow>
                <SettingRow label="ОГРН">
                  <Input
                    value={company.ogrn}
                    onChange={(e) => setCompany((p) => ({ ...p, ogrn: e.target.value }))}
                    className="w-52 text-sm"
                  />
                </SettingRow>
                <SettingRow label="Адрес">
                  <Input
                    value={company.address}
                    onChange={(e) => setCompany((p) => ({ ...p, address: e.target.value }))}
                    className="w-80 text-sm"
                  />
                </SettingRow>
                <SettingRow label="Телефон">
                  <Input
                    value={company.phone}
                    onChange={(e) => setCompany((p) => ({ ...p, phone: e.target.value }))}
                    className="w-52 text-sm"
                  />
                </SettingRow>
                <SettingRow label="Email">
                  <Input
                    value={company.email}
                    onChange={(e) => setCompany((p) => ({ ...p, email: e.target.value }))}
                    className="w-64 text-sm"
                  />
                </SettingRow>
                <SettingRow label="Часовой пояс">
                  <SelectField
                    value={company.timezone}
                    onChange={(v) => setCompany((p) => ({ ...p, timezone: v }))}
                    options={TIMEZONES}
                    className="w-72"
                  />
                </SettingRow>

                {/* Working hours */}
                <SettingRow label="Рабочие часы" desc="Используется для расчёта SLA">
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={company.workStart}
                      onChange={(e) => setCompany((p) => ({ ...p, workStart: e.target.value }))}
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                    />
                    <span className="text-gray-400">—</span>
                    <input
                      type="time"
                      value={company.workEnd}
                      onChange={(e) => setCompany((p) => ({ ...p, workEnd: e.target.value }))}
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </SettingRow>

                {/* Work days */}
                <SettingRow label="Рабочие дни">
                  <div className="flex gap-1.5">
                    {WEEK_DAYS.map((d) => (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => toggleWorkDay(d.key)}
                        className={`w-9 h-9 rounded-lg text-xs font-semibold transition-colors ${
                          company.workDays[d.key]
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </SettingRow>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                <Button onClick={() => handleSave('company')}>
                  <Icon name="Save" size={14} className="mr-1.5" />
                  Сохранить
                </Button>
              </div>
            </div>
          )}

          {/* ── Tab: Orders ── */}
          {activeTab === 'orders' && (
            <div>
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Настройки нарядов</h2>
              </div>
              <div className="px-6 py-2">
                <SettingRow label="Шаблон номера наряда" desc="Переменные: {YEAR}, {SEQ:06d}">
                  <Input
                    value={orders.numberTemplate}
                    onChange={(e) => setOrders((p) => ({ ...p, numberTemplate: e.target.value }))}
                    className="w-56 text-sm font-mono"
                  />
                </SettingRow>
                <SettingRow label="Автоназначение" desc="Автоматически назначать инженера при создании">
                  <Toggle
                    value={orders.autoAssign}
                    onChange={(v) => setOrders((p) => ({ ...p, autoAssign: v }))}
                  />
                </SettingRow>
                <SettingRow label="Приоритет по умолчанию">
                  <SelectField
                    value={orders.defaultPriority}
                    onChange={(v) => setOrders((p) => ({ ...p, defaultPriority: v }))}
                    options={[
                      { value: 'NORMAL',    label: 'Обычный' },
                      { value: 'URGENT',    label: 'Срочный' },
                      { value: 'EMERGENCY', label: 'Аварийный' },
                    ]}
                  />
                </SettingRow>
                <SettingRow label="Обязательное фото ДО работ" desc="Нельзя начать работы без фото объекта">
                  <Toggle
                    value={orders.photoRequiredBefore}
                    onChange={(v) => setOrders((p) => ({ ...p, photoRequiredBefore: v }))}
                  />
                </SettingRow>
                <SettingRow label="Обязательное фото ПОСЛЕ работ" desc="Нельзя закрыть наряд без фото результата">
                  <Toggle
                    value={orders.photoRequiredAfter}
                    onChange={(v) => setOrders((p) => ({ ...p, photoRequiredAfter: v }))}
                  />
                </SettingRow>
                <SettingRow label="Время ожидания перед эскалацией" desc="Минут без смены статуса до уведомления диспетчера">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={orders.escalationWaitMinutes}
                      onChange={(e) => setOrders((p) => ({ ...p, escalationWaitMinutes: e.target.value }))}
                      className="w-24 text-sm text-right"
                    />
                    <span className="text-sm text-gray-500">мин</span>
                  </div>
                </SettingRow>
                <SettingRow label="SLA по умолчанию" desc="Применяется при отсутствии договорного SLA">
                  <SelectField
                    value={orders.defaultSla}
                    onChange={(v) => setOrders((p) => ({ ...p, defaultSla: v }))}
                    options={[
                      { value: 'corporate', label: 'Корпоративный (TTF 24ч)' },
                      { value: 'standard',  label: 'Стандартный (TTF 48ч)' },
                      { value: 'economy',   label: 'Эконом (TTF 72ч)' },
                    ]}
                  />
                </SettingRow>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                <Button onClick={() => handleSave('orders')}>
                  <Icon name="Save" size={14} className="mr-1.5" />
                  Сохранить
                </Button>
              </div>
            </div>
          )}

          {/* ── Tab: Notifications ── */}
          {activeTab === 'notifications' && (
            <div>
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Каналы уведомлений</h2>
              </div>

              {/* Channels */}
              <div className="px-6 pt-4 pb-2 space-y-4">
                {NOTIFICATION_CHANNELS.map((ch) => {
                  const cfg = notifications.channels[ch.key];
                  return (
                    <div
                      key={ch.key}
                      className={`rounded-xl border transition-colors p-4 ${
                        cfg.enabled ? 'border-blue-200 bg-blue-50/40' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Icon name={ch.icon} size={18} className={cfg.enabled ? 'text-blue-600' : 'text-gray-400'} />
                          <span className="font-medium text-sm text-gray-900">{ch.label}</span>
                          {cfg.enabled ? (
                            <Badge className="bg-green-100 text-green-700 border-0 text-xs">Включён</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-500 border-0 text-xs">Отключён</Badge>
                          )}
                        </div>
                        <Toggle
                          value={cfg.enabled}
                          onChange={(v) => setChannelField(ch.key, 'enabled', v)}
                        />
                      </div>
                      {cfg.enabled && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">{ch.senderLabel}</label>
                            <Input
                              value={cfg.sender}
                              onChange={(e) => setChannelField(ch.key, 'sender', e.target.value)}
                              className="text-sm w-full"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">{ch.keyLabel}</label>
                            <div className="flex items-center gap-1">
                              <Input
                                type={cfg.showKey ? 'text' : 'password'}
                                value={cfg.apiKey}
                                onChange={(e) => setChannelField(ch.key, 'apiKey', e.target.value)}
                                className="text-sm flex-1"
                              />
                              <button
                                type="button"
                                onClick={() => setChannelField(ch.key, 'showKey', !cfg.showKey)}
                                className="p-1.5 text-gray-400 hover:text-gray-600"
                              >
                                <Icon name={cfg.showKey ? 'EyeOff' : 'Eye'} size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Event templates */}
              <div className="px-6 pt-2 pb-2">
                <p className="text-sm font-semibold text-gray-900 mb-3">Шаблоны уведомлений по событиям</p>
                <div className="space-y-2">
                  {NOTIFICATION_EVENTS.map((event) => (
                    <div key={event} className="flex items-center gap-3">
                      <span className="text-xs text-gray-600 w-52 shrink-0">{event}</span>
                      <SelectField
                        value={notifications.eventTemplates[event]}
                        onChange={(v) => setEventTemplate(event, v)}
                        options={NOTIFICATION_TEMPLATES.map((t) => ({ value: t, label: t }))}
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                <Button onClick={() => handleSave('notifications')}>
                  <Icon name="Save" size={14} className="mr-1.5" />
                  Сохранить
                </Button>
              </div>
            </div>
          )}

          {/* ── Tab: Finance ── */}
          {activeTab === 'finance' && (
            <div>
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Финансовые настройки</h2>
              </div>
              <div className="px-6 py-2">
                <SettingRow label="Валюта">
                  <SelectField
                    value={finance.currency}
                    onChange={(v) => setFinance((p) => ({ ...p, currency: v }))}
                    options={[
                      { value: 'RUB', label: '₽ Российский рубль' },
                      { value: 'USD', label: '$ Доллар США' },
                      { value: 'EUR', label: '€ Евро' },
                    ]}
                  />
                </SettingRow>
                <SettingRow label="Ставка НДС" desc="Применяется при формировании счетов">
                  <SelectField
                    value={finance.vatRate}
                    onChange={(v) => setFinance((p) => ({ ...p, vatRate: v }))}
                    options={[
                      { value: '0',  label: '0% — Без НДС' },
                      { value: '10', label: '10%' },
                      { value: '20', label: '20% — Стандарт' },
                    ]}
                  />
                </SettingRow>
                <SettingRow label="Наценка на ЗИП по умолчанию" desc="Применяется если не указана индивидуальная наценка">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={finance.zipMarkupPercent}
                      onChange={(e) => setFinance((p) => ({ ...p, zipMarkupPercent: e.target.value }))}
                      className="w-24 text-sm text-right"
                    />
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                </SettingRow>
                <SettingRow label="Накладные расходы (overhead)" desc="% от выручки наряда">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={finance.overheadPercent}
                      onChange={(e) => setFinance((p) => ({ ...p, overheadPercent: e.target.value }))}
                      className="w-24 text-sm text-right"
                    />
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                </SettingRow>
                <SettingRow label="Ставка компенсации ГСМ" desc="Рублей за километр пробега">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={finance.fuelRatePerKm}
                      onChange={(e) => setFinance((p) => ({ ...p, fuelRatePerKm: e.target.value }))}
                      className="w-24 text-sm text-right"
                    />
                    <span className="text-sm text-gray-500">₽/км</span>
                  </div>
                </SettingRow>
                <SettingRow label="Округление сумм" desc="Применяется при формировании документов">
                  <SelectField
                    value={finance.rounding}
                    onChange={(v) => setFinance((p) => ({ ...p, rounding: v }))}
                    options={[
                      { value: 'kopek', label: 'До копейки (0.01)' },
                      { value: 'rub',   label: 'До рубля (1.00)' },
                      { value: 'ten',   label: 'До 10 рублей' },
                    ]}
                  />
                </SettingRow>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                <Button onClick={() => handleSave('finance')}>
                  <Icon name="Save" size={14} className="mr-1.5" />
                  Сохранить
                </Button>
              </div>
            </div>
          )}

          {/* ── Tab: Security ── */}
          {activeTab === 'security' && (
            <div>
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Безопасность и доступ</h2>
              </div>
              <div className="px-6 py-2">
                <SettingRow label="Минимальная длина пароля">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={security.passwordMinLength}
                      onChange={(e) => setSecurity((p) => ({ ...p, passwordMinLength: e.target.value }))}
                      className="w-24 text-sm text-right"
                    />
                    <span className="text-sm text-gray-500">символов</span>
                  </div>
                </SettingRow>

                {/* Password complexity */}
                <div className="py-4 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 mb-2">Требования к сложности пароля</p>
                  <div className="space-y-2">
                    {[
                      { key: 'requireUppercase' as const, label: 'Заглавные буквы (A–Z)' },
                      { key: 'requireNumbers'   as const, label: 'Цифры (0–9)' },
                      { key: 'requireSpecial'   as const, label: 'Спецсимволы (!@#$%…)' },
                    ].map((req) => (
                      <label key={req.key} className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={security[req.key]}
                          onChange={(e) => setSecurity((p) => ({ ...p, [req.key]: e.target.checked }))}
                          className="w-4 h-4 rounded border-gray-300 accent-blue-600"
                        />
                        <span className="text-sm text-gray-700">{req.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <SettingRow label="Время сессии" desc="Автоматический выход после бездействия">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={security.sessionMinutes}
                      onChange={(e) => setSecurity((p) => ({ ...p, sessionMinutes: e.target.value }))}
                      className="w-24 text-sm text-right"
                    />
                    <span className="text-sm text-gray-500">минут</span>
                  </div>
                </SettingRow>
                <SettingRow label="Двухфакторная аутентификация" desc="SMS-код при каждом входе">
                  <Toggle
                    value={security.twoFactor}
                    onChange={(v) => setSecurity((p) => ({ ...p, twoFactor: v }))}
                  />
                </SettingRow>

                {/* IP whitelist */}
                <div className="py-4 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 mb-1">IP-whitelist</p>
                  <p className="text-xs text-gray-500 mb-2">Разрешённые IP-адреса (по одному на строку). Пусто — доступ с любых IP.</p>
                  <textarea
                    value={security.ipWhitelist}
                    onChange={(e) => setSecurity((p) => ({ ...p, ipWhitelist: e.target.value }))}
                    rows={4}
                    placeholder={'192.168.1.0/24\n10.0.0.1\n85.173.44.12'}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:border-blue-400"
                  />
                </div>

                {/* Login log */}
                <div className="py-4">
                  <p className="text-sm font-medium text-gray-900 mb-3">Последние входы в систему</p>
                  <div className="rounded-lg border border-gray-100 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 uppercase tracking-wide">
                          <th className="text-left px-3 py-2 font-medium">Пользователь</th>
                          <th className="text-left px-3 py-2 font-medium">IP</th>
                          <th className="text-left px-3 py-2 font-medium">Время</th>
                          <th className="text-left px-3 py-2 font-medium">Статус</th>
                        </tr>
                      </thead>
                      <tbody>
                        {LOGIN_LOG.map((row, i) => (
                          <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-700 font-mono">{row.user}</td>
                            <td className="px-3 py-2 text-gray-500 font-mono">{row.ip}</td>
                            <td className="px-3 py-2 text-gray-500">{row.time}</td>
                            <td className="px-3 py-2">
                              {row.result === 'Успешно' ? (
                                <Badge className="bg-green-100 text-green-700 border-0 text-xs">{row.result}</Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-600 border-0 text-xs">{row.result}</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                <Button onClick={() => handleSave('security')}>
                  <Icon name="Save" size={14} className="mr-1.5" />
                  Сохранить
                </Button>
              </div>
            </div>
          )}

          {/* ── Tab: Backup ── */}
          {activeTab === 'backup' && (
            <div>
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Резервное копирование</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackupNow}
                  disabled={backingUp}
                  className="gap-1.5"
                >
                  {backingUp ? (
                    <Icon name="Loader2" size={14} className="animate-spin" />
                  ) : (
                    <Icon name="HardDriveDownload" size={14} />
                  )}
                  {backingUp ? 'Создание…' : 'Создать резервную копию сейчас'}
                </Button>
              </div>
              <div className="px-6 py-2">
                <SettingRow label="Расписание бэкапа">
                  <SelectField
                    value={backup.schedule}
                    onChange={(v) => setBackup((p) => ({ ...p, schedule: v }))}
                    options={[
                      { value: 'daily',   label: 'Ежедневно в 03:00' },
                      { value: 'weekly',  label: 'Еженедельно (пн в 03:00)' },
                      { value: 'monthly', label: 'Ежемесячно (1-го в 03:00)' },
                    ]}
                  />
                </SettingRow>
                <SettingRow label="Хранилище">
                  <SelectField
                    value={backup.storage}
                    onChange={(v) => setBackup((p) => ({ ...p, storage: v }))}
                    options={[
                      { value: 'local', label: 'Локально (сервер)' },
                      { value: 's3',    label: 'S3 / MinIO' },
                      { value: 'ftp',   label: 'FTP/SFTP' },
                    ]}
                  />
                </SettingRow>

                {/* Last backup info */}
                <div className="py-4 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 mb-2">Последний бэкап</p>
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-green-50 border border-green-200">
                    <Icon name="CheckCircle2" size={20} className="text-green-600 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">15.05.2026 03:00</p>
                      <p className="text-xs text-gray-500 mt-0.5">Размер: 842 МБ · Хранилище: S3</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-0">Успешно</Badge>
                  </div>
                </div>

                {/* Backup history */}
                <div className="py-4">
                  <p className="text-sm font-medium text-gray-900 mb-3">История резервных копий</p>
                  <div className="rounded-lg border border-gray-100 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 uppercase tracking-wide">
                          <th className="text-left px-3 py-2 font-medium">Дата и время</th>
                          <th className="text-left px-3 py-2 font-medium">Размер</th>
                          <th className="text-left px-3 py-2 font-medium">Хранилище</th>
                          <th className="text-left px-3 py-2 font-medium">Статус</th>
                          <th className="px-3 py-2 font-medium"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {BACKUP_TABLE_DATA.map((row, i) => (
                          <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-700">{row.date}</td>
                            <td className="px-3 py-2 text-gray-500">{row.size}</td>
                            <td className="px-3 py-2 text-gray-500">{row.storage}</td>
                            <td className="px-3 py-2">
                              {row.status === 'ok' ? (
                                <Badge className="bg-green-100 text-green-700 border-0 text-xs">Успешно</Badge>
                              ) : (
                                <Badge className="bg-yellow-100 text-yellow-700 border-0 text-xs">Предупреждение</Badge>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <button
                                type="button"
                                onClick={() => toast.info(`Скачивание бэкапа от ${row.date}`)}
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                Скачать
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                <Button onClick={() => handleSave('backup')}>
                  <Icon name="Save" size={14} className="mr-1.5" />
                  Сохранить расписание
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
