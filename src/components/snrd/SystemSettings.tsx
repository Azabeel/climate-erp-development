import { useState } from 'react';
import { Settings, Bell, Clock, DollarSign, Truck, Globe, Save, Shield, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type TabId = 'general' | 'sla' | 'finance' | 'notifications' | 'field' | 'security';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'general', label: 'Общие', icon: Settings },
  { id: 'sla', label: 'SLA / Нормативы', icon: Clock },
  { id: 'finance', label: 'Финансы', icon: DollarSign },
  { id: 'notifications', label: 'Уведомления', icon: Bell },
  { id: 'field', label: 'Выездная служба', icon: Truck },
  { id: 'security', label: 'Безопасность', icon: Shield },
];

const Field = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
  <div className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0">
    <div className="flex-1 mr-6">
      <p className="text-sm font-medium text-gray-900">{label}</p>
      {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <button onClick={() => onChange(!value)}
    className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-200'}`}>
    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
  </button>
);

const Input = ({ value, onChange, suffix, type = 'text' }: { value: string | number; onChange: (v: string) => void; suffix?: string; type?: string }) => (
  <div className="flex items-center gap-2">
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      className="w-32 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-right focus:outline-none focus:border-blue-400" />
    {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
  </div>
);

const SelectInput = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState<TabId>('general');

  const [general, setGeneral] = useState({
    companyName: 'Сервис Климат',
    timezone: 'Europe/Moscow',
    currency: 'RUB',
    language: 'ru',
    workDayStart: '09:00',
    workDayEnd: '18:00',
    workDays: '1,2,3,4,5',
    autoNumberOrders: true,
    orderPrefix: 'WO',
    orderYear: true,
  });

  const [sla, setSla] = useState({
    corporateTtr: 4,
    corporateTto: 8,
    corporateTtf: 24,
    warningPercent: 20,
    slaMonitorInterval: 5,
    overdueEscalation: true,
    slaNotifyDispatcher: true,
    slaNotifyManager: true,
  });

  const [finance, setFinance] = useState({
    zipDefaultMarkup: 30,
    vatRate: 20,
    fuelRatePerKm: '6.60',
    overheadPercent: 10,
    laborCostPerHour: 2000,
    invoiceDueDays: 5,
    autoInvoiceOnClose: true,
    autoActOnClose: true,
    paymentReminder1: 3,
    paymentReminder2: 1,
  });

  const [notifications, setNotifications] = useState({
    smsProvider: 'sms_ru',
    emailProvider: 'smtp_yandex',
    telegramBotToken: '****',
    whatsappApiKey: '****',
    notifyClientOnAssign: true,
    notifyClientEnRoute: true,
    notifyClient30min: true,
    notifyClientComplete: true,
    digestTime: '08:00',
    weeklyReportDay: 'monday',
  });

  const [field, setField] = useState({
    gpsTrackingInterval: 60,
    gpsRequireOnShift: true,
    photoRequiredBefore: true,
    photoRequiredAfter: true,
    minPhotosPerOrder: 2,
    allowMobileCreateOrder: false,
    allowMobileCloseOrder: true,
    requireClientSignature: false,
    offlineSyncInterval: 15,
    maxOrdersPerDay: 8,
  });

  const [security, setSecurity] = useState({
    sessionTimeoutHours: 8,
    twoFactor: false,
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    loginAttempts: 5,
    ipWhitelist: false,
    auditLogRetentionDays: 365,
    dataExportRequireApproval: true,
  });

  const handleSave = () => {
    toast.success('Настройки сохранены');
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings size={28} className="text-gray-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Системные настройки</h2>
            <p className="text-gray-500 text-sm">Конфигурация платформы</p>
          </div>
        </div>
        <Button onClick={handleSave}>
          <Save size={14} className="mr-2" /> Сохранить изменения
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Tab list */}
        <div className="w-52 shrink-0">
          <nav className="space-y-1">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${activeTab === tab.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings panel */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          {activeTab === 'general' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Общие настройки</h3>
              <Field label="Название компании">
                <input defaultValue={general.companyName} onChange={e => setGeneral(p => ({ ...p, companyName: e.target.value }))}
                  className="w-64 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400" />
              </Field>
              <Field label="Часовой пояс">
                <SelectInput value={general.timezone} onChange={v => setGeneral(p => ({ ...p, timezone: v }))}
                  options={[
                    { value: 'Europe/Moscow', label: 'Москва (UTC+3)' },
                    { value: 'Europe/Samara', label: 'Самара (UTC+4)' },
                    { value: 'Asia/Yekaterinburg', label: 'Екатеринбург (UTC+5)' },
                  ]} />
              </Field>
              <Field label="Язык интерфейса">
                <SelectInput value={general.language} onChange={v => setGeneral(p => ({ ...p, language: v }))}
                  options={[{ value: 'ru', label: 'Русский' }, { value: 'en', label: 'English' }]} />
              </Field>
              <Field label="Рабочий день" desc="Часы приёма заявок и расчёта SLA">
                <div className="flex items-center gap-2">
                  <input type="time" defaultValue={general.workDayStart} className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
                  <span className="text-gray-400">—</span>
                  <input type="time" defaultValue={general.workDayEnd} className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
                </div>
              </Field>
              <Field label="Автонумерация нарядов" desc="WO-{ГОД}-{ПОРЯДКОВЫЙ НОМЕР}">
                <Toggle value={general.autoNumberOrders} onChange={v => setGeneral(p => ({ ...p, autoNumberOrders: v }))} />
              </Field>
              <Field label="Включать год в номер наряда">
                <Toggle value={general.orderYear} onChange={v => setGeneral(p => ({ ...p, orderYear: v }))} />
              </Field>
            </div>
          )}

          {activeTab === 'sla' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Корпоративные нормативы SLA</h3>
              <Field label="TTR — Время до ответа" desc="Time to Respond — первый контакт с клиентом">
                <Input value={sla.corporateTtr} onChange={v => setSla(p => ({ ...p, corporateTtr: +v }))} suffix="ч" type="number" />
              </Field>
              <Field label="TTO — Время до выезда" desc="Time to On-site — инженер прибывает на объект">
                <Input value={sla.corporateTto} onChange={v => setSla(p => ({ ...p, corporateTto: +v }))} suffix="ч" type="number" />
              </Field>
              <Field label="TTF — Время до устранения" desc="Time to Fix — проблема полностью устранена">
                <Input value={sla.corporateTtf} onChange={v => setSla(p => ({ ...p, corporateTtf: +v }))} suffix="ч" type="number" />
              </Field>
              <Field label="Порог предупреждения" desc="За сколько % до дедлайна включается ЖЁЛТЫЙ статус">
                <Input value={sla.warningPercent} onChange={v => setSla(p => ({ ...p, warningPercent: +v }))} suffix="%" type="number" />
              </Field>
              <Field label="Интервал проверки SLA">
                <Input value={sla.slaMonitorInterval} onChange={v => setSla(p => ({ ...p, slaMonitorInterval: +v }))} suffix="мин" type="number" />
              </Field>
              <Field label="Эскалация при нарушении" desc="Уведомить руководителя при RED">
                <Toggle value={sla.overdueEscalation} onChange={v => setSla(p => ({ ...p, overdueEscalation: v }))} />
              </Field>
            </div>
          )}

          {activeTab === 'finance' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Финансовые настройки</h3>
              <Field label="Наценка на ЗИП по умолчанию">
                <Input value={finance.zipDefaultMarkup} onChange={v => setFinance(p => ({ ...p, zipDefaultMarkup: +v }))} suffix="%" type="number" />
              </Field>
              <Field label="НДС">
                <Input value={finance.vatRate} onChange={v => setFinance(p => ({ ...p, vatRate: +v }))} suffix="%" type="number" />
              </Field>
              <Field label="Компенсация ГСМ" desc="Руб. за км пробега">
                <Input value={finance.fuelRatePerKm} onChange={v => setFinance(p => ({ ...p, fuelRatePerKm: v }))} suffix="₽/км" />
              </Field>
              <Field label="Накладные расходы" desc="% от выручки наряда">
                <Input value={finance.overheadPercent} onChange={v => setFinance(p => ({ ...p, overheadPercent: +v }))} suffix="%" type="number" />
              </Field>
              <Field label="Норма-часа инженера">
                <Input value={finance.laborCostPerHour} onChange={v => setFinance(p => ({ ...p, laborCostPerHour: +v }))} suffix="₽/ч" type="number" />
              </Field>
              <Field label="Срок оплаты счёта" desc="Дней с момента выставления">
                <Input value={finance.invoiceDueDays} onChange={v => setFinance(p => ({ ...p, invoiceDueDays: +v }))} suffix="дн." type="number" />
              </Field>
              <Field label="Авто-выставление счёта при закрытии">
                <Toggle value={finance.autoInvoiceOnClose} onChange={v => setFinance(p => ({ ...p, autoInvoiceOnClose: v }))} />
              </Field>
              <Field label="Авто-формирование акта при закрытии">
                <Toggle value={finance.autoActOnClose} onChange={v => setFinance(p => ({ ...p, autoActOnClose: v }))} />
              </Field>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Каналы уведомлений</h3>
              <Field label="SMS провайдер">
                <SelectInput value={notifications.smsProvider} onChange={v => setNotifications(p => ({ ...p, smsProvider: v }))}
                  options={[{ value: 'sms_ru', label: 'SMS.ru' }, { value: 'smsc', label: 'SMSC.ru' }, { value: 'megafon', label: 'МегаФон' }]} />
              </Field>
              <Field label="Email провайдер">
                <SelectInput value={notifications.emailProvider} onChange={v => setNotifications(p => ({ ...p, emailProvider: v }))}
                  options={[{ value: 'smtp_yandex', label: 'Яндекс SMTP' }, { value: 'smtp_mail', label: 'Mail.ru SMTP' }, { value: 'sendgrid', label: 'SendGrid' }]} />
              </Field>
              <Field label="Уведомление при назначении инженера">
                <Toggle value={notifications.notifyClientOnAssign} onChange={v => setNotifications(p => ({ ...p, notifyClientOnAssign: v }))} />
              </Field>
              <Field label="Уведомление «Инженер выехал»">
                <Toggle value={notifications.notifyClientEnRoute} onChange={v => setNotifications(p => ({ ...p, notifyClientEnRoute: v }))} />
              </Field>
              <Field label="Уведомление за 30 минут">
                <Toggle value={notifications.notifyClient30min} onChange={v => setNotifications(p => ({ ...p, notifyClient30min: v }))} />
              </Field>
              <Field label="Уведомление об окончании работ">
                <Toggle value={notifications.notifyClientComplete} onChange={v => setNotifications(p => ({ ...p, notifyClientComplete: v }))} />
              </Field>
              <Field label="Время утреннего дайджеста" desc="Ежедневный отчёт руководству">
                <input type="time" defaultValue={notifications.digestTime}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
              </Field>
            </div>
          )}

          {activeTab === 'field' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Настройки выездной службы</h3>
              <Field label="GPS трекинг" desc="Требовать включения при начале смены">
                <Toggle value={field.gpsRequireOnShift} onChange={v => setField(p => ({ ...p, gpsRequireOnShift: v }))} />
              </Field>
              <Field label="Интервал GPS точки">
                <Input value={field.gpsTrackingInterval} onChange={v => setField(p => ({ ...p, gpsTrackingInterval: +v }))} suffix="сек" type="number" />
              </Field>
              <Field label="Фото ДО начала работ" desc="Обязательно для создания наряда в работе">
                <Toggle value={field.photoRequiredBefore} onChange={v => setField(p => ({ ...p, photoRequiredBefore: v }))} />
              </Field>
              <Field label="Фото ПОСЛЕ завершения работ" desc="Обязательно для закрытия наряда">
                <Toggle value={field.photoRequiredAfter} onChange={v => setField(p => ({ ...p, photoRequiredAfter: v }))} />
              </Field>
              <Field label="Минимум фото на наряд">
                <Input value={field.minPhotosPerOrder} onChange={v => setField(p => ({ ...p, minPhotosPerOrder: +v }))} suffix="шт." type="number" />
              </Field>
              <Field label="Закрытие наряда с мобильного">
                <Toggle value={field.allowMobileCloseOrder} onChange={v => setField(p => ({ ...p, allowMobileCloseOrder: v }))} />
              </Field>
              <Field label="Макс. нарядов в день на инженера">
                <Input value={field.maxOrdersPerDay} onChange={v => setField(p => ({ ...p, maxOrdersPerDay: +v }))} suffix="шт." type="number" />
              </Field>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Безопасность и доступ</h3>
              <Field label="Время жизни сессии">
                <Input value={security.sessionTimeoutHours} onChange={v => setSecurity(p => ({ ...p, sessionTimeoutHours: +v }))} suffix="ч" type="number" />
              </Field>
              <Field label="Двухфакторная аутентификация" desc="SMS-код для всех пользователей">
                <Toggle value={security.twoFactor} onChange={v => setSecurity(p => ({ ...p, twoFactor: v }))} />
              </Field>
              <Field label="Минимальная длина пароля">
                <Input value={security.passwordMinLength} onChange={v => setSecurity(p => ({ ...p, passwordMinLength: +v }))} suffix="симв." type="number" />
              </Field>
              <Field label="Требовать спецсимволы в пароле">
                <Toggle value={security.passwordRequireSpecial} onChange={v => setSecurity(p => ({ ...p, passwordRequireSpecial: v }))} />
              </Field>
              <Field label="Блокировка после N неудачных входов">
                <Input value={security.loginAttempts} onChange={v => setSecurity(p => ({ ...p, loginAttempts: +v }))} suffix="попыток" type="number" />
              </Field>
              <Field label="Хранение журнала аудита">
                <Input value={security.auditLogRetentionDays} onChange={v => setSecurity(p => ({ ...p, auditLogRetentionDays: +v }))} suffix="дней" type="number" />
              </Field>
              <Field label="Требовать подтверждения для экспорта данных">
                <Toggle value={security.dataExportRequireApproval} onChange={v => setSecurity(p => ({ ...p, dataExportRequireApproval: v }))} />
              </Field>
              <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
                <Button variant="outline" size="sm" onClick={() => toast.info('Сеансы сброшены')}>
                  <Shield size={14} className="mr-2" /> Завершить все сеансы
                </Button>
                <Button variant="outline" size="sm" onClick={() => toast.info('Ключи API перегенерированы')}>
                  <Globe size={14} className="mr-2" /> Перегенерировать API ключи
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
