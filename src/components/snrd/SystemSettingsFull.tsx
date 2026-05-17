import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = 'general' | 'finance' | 'sla' | 'integrations' | 'notifications';
type Channel = 'Email' | 'Telegram' | 'SMS' | 'Push';
type NotificationMatrix = Record<string, Record<Channel, boolean>>;

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'general',       label: 'Общие',        icon: 'Building2' },
  { id: 'finance',       label: 'Финансы',      icon: 'DollarSign' },
  { id: 'sla',           label: 'SLA',          icon: 'Clock' },
  { id: 'integrations',  label: 'Интеграции',   icon: 'Plug' },
  { id: 'notifications', label: 'Уведомления',  icon: 'Bell' },
];

const CHANNELS: Channel[] = ['Email', 'Telegram', 'SMS', 'Push'];

const NOTIFICATION_EVENTS = [
  { key: 'assigned',       label: 'Заявка принята (ASSIGNED)' },
  { key: 'en_route',       label: 'Инженер выехал (EN_ROUTE)' },
  { key: 'on_site',        label: 'Инженер прибыл (ON_SITE)' },
  { key: 'awaiting_parts', label: 'Ожидание запчасти (AWAITING_PARTS)' },
  { key: 'parts_ready',    label: 'Запчасть получена (PARTS_READY)' },
  { key: 'completed',      label: 'Работы завершены (COMPLETED)' },
  { key: 'sla_yellow',     label: 'SLA — предупреждение (YELLOW)' },
  { key: 'sla_red',        label: 'SLA — нарушение (RED)' },
];

// ─── Primitive helpers ────────────────────────────────────────────────────────

const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
      value ? 'bg-blue-600' : 'bg-gray-200'
    }`}
  >
    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
      value ? 'translate-x-5' : 'translate-x-0.5'
    }`} />
  </button>
);

const Sel = ({
  value, onChange, options, className = '',
}: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; className?: string }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-blue-400 ${className}`}
  >
    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const Row = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
  <div className="flex items-start justify-between py-3.5 border-b border-gray-100 last:border-0 gap-4">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900">{label}</p>
      {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const SectionTitle = ({ title, desc }: { title: string; desc?: string }) => (
  <div className="pt-5 pb-1">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
    {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
  </div>
);

const NumInput = ({ value, onChange, unit, step }: { value: string; onChange: (v: string) => void; unit?: string; step?: number }) => (
  <div className="flex items-center gap-2">
    <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} step={step} className="w-24 text-sm text-right" />
    {unit && <span className="text-sm text-gray-500 shrink-0">{unit}</span>}
  </div>
);

const TimeRange = ({ start, end, onStart, onEnd }: { start: string; end: string; onStart: (v: string) => void; onEnd: (v: string) => void }) => (
  <div className="flex items-center gap-2">
    <input type="time" value={start} onChange={(e) => onStart(e.target.value)}
      className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400" />
    <span className="text-gray-400 text-sm">—</span>
    <input type="time" value={end} onChange={(e) => onEnd(e.target.value)}
      className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400" />
  </div>
);

const PwdInput = ({ value, onChange, show, onToggle }: { value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void }) => (
  <div className="flex items-center gap-1">
    <Input type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} className="text-sm flex-1" />
    <button type="button" onClick={onToggle} className="p-1.5 text-gray-400 hover:text-gray-600">
      <Icon name={show ? 'EyeOff' : 'Eye'} size={15} />
    </button>
  </div>
);

const SaveBar = ({ onSave }: { onSave: () => void }) => (
  <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
    <Button onClick={onSave}><Icon name="Save" size={14} className="mr-1.5" />Сохранить</Button>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const SystemSettingsFull = () => {
  const [tab, setTab] = useState<TabId>('general');

  // General
  const [g, setG] = useState({
    name: 'ООО «Сервис Климат»', inn: '7701234567', kpp: '770101001',
    phone: '+7 (495) 123-45-67', email: 'info@servisklimat.ru',
    address: 'г. Москва, ул. Климатическая, д. 12, офис 301',
    timezone: 'Europe/Moscow', dateFormat: 'dd.MM.yyyy', currency: 'RUB',
    workStart: '09:00', workEnd: '18:00',
    satOn: false, satStart: '10:00', satEnd: '15:00',
    sunOn: false, sunStart: '10:00', sunEnd: '14:00',
  });
  const pg = (p: Partial<typeof g>) => setG((prev) => ({ ...prev, ...p }));

  // Finance
  const [f, setF] = useState({
    vatRate: '20', zipMarkup: '30', overhead: '10',
    fuelRate: '6.60', fuelL100: '12', invoiceCurrency: 'RUB',
    invoiceTemplate: 'СЧ-{YYYY}-{N:06d}',
  });
  const pf = (p: Partial<typeof f>) => setF((prev) => ({ ...prev, ...p }));

  // SLA
  const [s, setS] = useState({
    ttr: '4', tto: '8', ttf: '24', warnPct: '20',
    slaStart: '09:00', slaEnd: '18:00', bizHours: true,
  });
  const ps = (p: Partial<typeof s>) => setS((prev) => ({ ...prev, ...p }));

  // Integrations
  const [oneC, setOneC] = useState({
    url: 'https://1c.servisklimat.ru/unf/odata/standard.odata/',
    login: 'integration_user', password: 'P@ssw0rd_1C!', showPwd: false, enabled: true,
  });
  const [tg, setTg] = useState({
    token: '7123456789:AAE_xJvKqP8dR2mF4wL6nT1oY3sZ5aB0cD', showToken: false,
    webhookUrl: 'https://api.servisklimat.ru/integrations/telegram/webhook',
  });
  const [smtp, setSmtp] = useState({
    host: 'smtp.yandex.ru', port: '465',
    login: 'noreply@servisklimat.ru', password: 'smtp_secret_pass', showPwd: false, tls: true,
  });
  const [testingOneC, setTestingOneC] = useState(false);

  // Notifications matrix
  const [matrix, setMatrix] = useState<NotificationMatrix>(() =>
    Object.fromEntries(NOTIFICATION_EVENTS.map(({ key }) => [key, {
      Email:    ['assigned', 'completed', 'sla_red'].includes(key),
      Telegram: !['sla_yellow', 'sla_red'].includes(key),
      SMS:      ['assigned', 'en_route'].includes(key),
      Push:     key !== 'sla_yellow',
    } as Record<Channel, boolean>]))
  );

  const save = (t: TabId) => toast.success(`Настройки «${TABS.find((x) => x.id === t)?.label}» сохранены`);

  const testOneC = () => {
    setTestingOneC(true);
    toast.loading('Проверка соединения с 1С…', { id: 'onec' });
    setTimeout(() => {
      setTestingOneC(false);
      toast.success('Соединение с 1С:УНФ установлено успешно', { id: 'onec' });
    }, 2200);
  };

  return (
    <div className="p-6 lg:p-8 min-h-full bg-gray-50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <Icon name="Settings2" size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Системные настройки</h1>
          <p className="text-sm text-gray-500">Конфигурация платформы АСУ СЦ «Сервис Климат»</p>
        </div>
      </div>

      <div className="flex gap-6">
        <nav className="w-48 shrink-0 space-y-1">
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                tab === t.id ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-white hover:shadow-sm'
              }`}
            >
              <Icon name={t.icon} size={16} />{t.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

          {/* ── General ── */}
          {tab === 'general' && (
            <div>
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Общие настройки</h2>
                <p className="text-xs text-gray-500 mt-0.5">Реквизиты, локализация, рабочие часы</p>
              </div>
              <div className="px-6 py-2">
                {/* Logo */}
                <div className="py-4 border-b border-gray-100 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xl select-none shadow">СК</div>
                  <div>
                    <Button variant="outline" size="sm" onClick={() => toast.info('Выберите PNG/JPG до 2 МБ')}>
                      <Icon name="Upload" size={14} className="mr-1.5" />Загрузить логотип
                    </Button>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG · до 2 МБ · рек. 200×200 px</p>
                  </div>
                </div>

                <SectionTitle title="Реквизиты" />
                <Row label="Название компании"><Input value={g.name} onChange={(e) => pg({ name: e.target.value })} className="w-72 text-sm" /></Row>
                <Row label="ИНН"><Input value={g.inn} onChange={(e) => pg({ inn: e.target.value })} className="w-40 text-sm" /></Row>
                <Row label="КПП"><Input value={g.kpp} onChange={(e) => pg({ kpp: e.target.value })} className="w-40 text-sm" /></Row>
                <Row label="Телефон"><Input value={g.phone} onChange={(e) => pg({ phone: e.target.value })} className="w-52 text-sm" /></Row>
                <Row label="Email"><Input value={g.email} onChange={(e) => pg({ email: e.target.value })} className="w-64 text-sm" /></Row>
                <Row label="Адрес"><Input value={g.address} onChange={(e) => pg({ address: e.target.value })} className="w-80 text-sm" /></Row>

                <SectionTitle title="Локализация" />
                <Row label="Часовой пояс">
                  <Sel value={g.timezone} onChange={(v) => pg({ timezone: v })} className="w-72" options={[
                    { value: 'Europe/Moscow', label: 'UTC+3 — Москва' },
                    { value: 'Europe/Samara', label: 'UTC+4 — Самара' },
                    { value: 'Asia/Yekaterinburg', label: 'UTC+5 — Екатеринбург' },
                    { value: 'Asia/Omsk', label: 'UTC+6 — Омск' },
                    { value: 'Asia/Krasnoyarsk', label: 'UTC+7 — Красноярск' },
                    { value: 'Asia/Vladivostok', label: 'UTC+10 — Владивосток' },
                  ]} />
                </Row>
                <Row label="Формат даты">
                  <Sel value={g.dateFormat} onChange={(v) => pg({ dateFormat: v })} className="w-60" options={[
                    { value: 'dd.MM.yyyy', label: 'дд.мм.гггг (31.05.2026)' },
                    { value: 'MM/dd/yyyy', label: 'мм/дд/гггг (05/31/2026)' },
                    { value: 'yyyy-MM-dd', label: 'гггг-мм-дд (2026-05-31)' },
                  ]} />
                </Row>
                <Row label="Валюта">
                  <Sel value={g.currency} onChange={(v) => pg({ currency: v })} className="w-48" options={[
                    { value: 'RUB', label: '₽ Российский рубль' },
                    { value: 'USD', label: '$ Доллар США' },
                    { value: 'EUR', label: '€ Евро' },
                  ]} />
                </Row>

                <SectionTitle title="Рабочие часы" desc="Для расчёта SLA и планирования" />
                <Row label="Пн–Пт">
                  <TimeRange start={g.workStart} end={g.workEnd} onStart={(v) => pg({ workStart: v })} onEnd={(v) => pg({ workEnd: v })} />
                </Row>

                {/* Sat / Sun toggles */}
                {[
                  { label: 'Суббота', shortKey: 'sat' as const },
                  { label: 'Воскресенье', shortKey: 'sun' as const },
                ].map(({ label, shortKey }) => {
                  const on = shortKey === 'sat' ? g.satOn : g.sunOn;
                  const start = shortKey === 'sat' ? g.satStart : g.sunStart;
                  const end = shortKey === 'sat' ? g.satEnd : g.sunEnd;
                  return (
                    <div key={shortKey} className="flex items-center justify-between py-3 border-b border-gray-100 gap-4">
                      <span className="text-sm font-medium text-gray-900">{label}</span>
                      <div className="flex items-center gap-3">
                        {on && (
                          <TimeRange
                            start={start} end={end}
                            onStart={(v) => pg(shortKey === 'sat' ? { satStart: v } : { sunStart: v })}
                            onEnd={(v) => pg(shortKey === 'sat' ? { satEnd: v } : { sunEnd: v })}
                          />
                        )}
                        <Toggle value={on} onChange={(v) => pg(shortKey === 'sat' ? { satOn: v } : { sunOn: v })} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <SaveBar onSave={() => save('general')} />
            </div>
          )}

          {/* ── Finance ── */}
          {tab === 'finance' && (
            <div>
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Финансовые настройки</h2>
                <p className="text-xs text-gray-500 mt-0.5">НДС, наценки, расходы, нумерация счетов</p>
              </div>
              <div className="px-6 py-2">
                <SectionTitle title="Налоги и ставки" />
                <Row label="НДС %" desc="Применяется при формировании счетов и актов">
                  <Sel value={f.vatRate} onChange={(v) => pf({ vatRate: v })} className="w-44" options={[
                    { value: '0', label: '0% — Без НДС' },
                    { value: '10', label: '10%' },
                    { value: '20', label: '20% — Стандарт' },
                  ]} />
                </Row>
                <Row label="Наценка на ЗИП по умолчанию" desc="Применяется если не задана индивидуальная наценка">
                  <NumInput value={f.zipMarkup} onChange={(v) => pf({ zipMarkup: v })} unit="%" />
                </Row>
                <Row label="Накладные расходы (overhead)" desc="% от выручки наряда — включается в себестоимость">
                  <NumInput value={f.overhead} onChange={(v) => pf({ overhead: v })} unit="%" />
                </Row>

                <SectionTitle title="ГСМ" desc="Параметры расчёта компенсации топлива" />
                <Row label="Стоимость компенсации ГСМ" desc="Рублей за 1 км пробега по GPS-треку">
                  <NumInput value={f.fuelRate} onChange={(v) => pf({ fuelRate: v })} unit="₽/км" step={0.01} />
                </Row>
                <Row label="Расход топлива" desc="Базовый расход для расчёта стоимости поездки">
                  <NumInput value={f.fuelL100} onChange={(v) => pf({ fuelL100: v })} unit="л/100 км" step={0.1} />
                </Row>

                <SectionTitle title="Счета" />
                <Row label="Валюта счетов">
                  <Sel value={f.invoiceCurrency} onChange={(v) => pf({ invoiceCurrency: v })} className="w-48" options={[
                    { value: 'RUB', label: '₽ Российский рубль' },
                    { value: 'USD', label: '$ Доллар США' },
                    { value: 'EUR', label: '€ Евро' },
                  ]} />
                </Row>
                <Row label="Формат номера счёта" desc="Переменные: {YYYY} — год, {N:06d} — порядковый номер">
                  <Input value={f.invoiceTemplate} onChange={(e) => pf({ invoiceTemplate: e.target.value })} className="w-52 text-sm font-mono" />
                </Row>
                <div className="py-3">
                  <p className="text-xs text-gray-500">
                    Пример: <span className="font-mono text-blue-700 font-semibold">
                      {f.invoiceTemplate.replace('{YYYY}', '2026').replace('{N:06d}', '000042')}
                    </span>
                  </p>
                </div>
              </div>
              <SaveBar onSave={() => save('finance')} />
            </div>
          )}

          {/* ── SLA ── */}
          {tab === 'sla' && (
            <div>
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Корпоративные SLA</h2>
                <p className="text-xs text-gray-500 mt-0.5">Применяются если у клиента нет индивидуального договорного SLA</p>
              </div>
              <div className="px-6 py-2">
                <SectionTitle title="Нормативы по умолчанию" />
                <Row label="TTR — Time To Respond" desc="Макс. время до первого контакта с клиентом">
                  <NumInput value={s.ttr} onChange={(v) => ps({ ttr: v })} unit="часов" />
                </Row>
                <Row label="TTO — Time To On-site" desc="Макс. время до прибытия инженера на объект">
                  <NumInput value={s.tto} onChange={(v) => ps({ tto: v })} unit="часов" />
                </Row>
                <Row label="TTF — Time To Fix" desc="Макс. время до полного устранения неисправности">
                  <NumInput value={s.ttf} onChange={(v) => ps({ ttf: v })} unit="часов" />
                </Row>

                {/* Visual bar */}
                <div className="py-4 border-b border-gray-100">
                  <p className="text-xs text-gray-500 mb-3">Визуализация нормативов</p>
                  <div className="space-y-2.5">
                    {[
                      { label: 'TTR', hours: Number(s.ttr), color: 'bg-blue-500',  max: 24 },
                      { label: 'TTO', hours: Number(s.tto), color: 'bg-amber-500', max: 24 },
                      { label: 'TTF', hours: Number(s.ttf), color: 'bg-green-500', max: 72 },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3">
                        <span className="text-xs font-mono font-semibold text-gray-600 w-8">{item.label}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full transition-all`}
                            style={{ width: `${Math.min(100, (item.hours / item.max) * 100)}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-12 text-right">{item.hours} ч</span>
                      </div>
                    ))}
                  </div>
                </div>

                <SectionTitle title="Пороги оповещений" />
                <Row label="Порог предупреждения (YELLOW)" desc="% оставшегося времени → уведомить диспетчера">
                  <NumInput value={s.warnPct} onChange={(v) => ps({ warnPct: v })} unit="%" />
                </Row>

                <SectionTitle title="Рабочее время SLA" />
                <Row label="Рабочие часы для SLA" desc="Нормативное время рассчитывается только в эти часы">
                  <TimeRange start={s.slaStart} end={s.slaEnd} onStart={(v) => ps({ slaStart: v })} onEnd={(v) => ps({ slaEnd: v })} />
                </Row>
                <Row label="Учитывать только рабочие часы" desc="Выкл — SLA считается в астрономических часах 24/7">
                  <Toggle value={s.bizHours} onChange={(v) => ps({ bizHours: v })} />
                </Row>
              </div>
              <SaveBar onSave={() => save('sla')} />
            </div>
          )}

          {/* ── Integrations ── */}
          {tab === 'integrations' && (
            <div>
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Интеграции</h2>
                <p className="text-xs text-gray-500 mt-0.5">Подключение внешних систем и сервисов</p>
              </div>
              <div className="px-6 py-4 space-y-5">

                {/* 1С */}
                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Icon name="Database" size={16} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">1С:УНФ</p>
                        <p className="text-xs text-gray-500">Синхронизация справочников и документов</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`border-0 text-xs ${oneC.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {oneC.enabled ? 'Включено' : 'Отключено'}
                      </Badge>
                      <Toggle value={oneC.enabled} onChange={(v) => setOneC((p) => ({ ...p, enabled: v }))} />
                    </div>
                  </div>
                  <div className="px-4 py-4 space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">URL базы (Odata endpoint)</label>
                      <Input value={oneC.url} onChange={(e) => setOneC((p) => ({ ...p, url: e.target.value }))} className="text-sm font-mono w-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Логин</label>
                        <Input value={oneC.login} onChange={(e) => setOneC((p) => ({ ...p, login: e.target.value }))} className="text-sm w-full" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Пароль</label>
                        <PwdInput value={oneC.password} onChange={(v) => setOneC((p) => ({ ...p, password: v }))}
                          show={oneC.showPwd} onToggle={() => setOneC((p) => ({ ...p, showPwd: !p.showPwd }))} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <Button variant="outline" size="sm" onClick={testOneC} disabled={testingOneC} className="gap-1.5">
                        <Icon name={testingOneC ? 'Loader2' : 'Zap'} size={14} className={testingOneC ? 'animate-spin' : ''} />
                        {testingOneC ? 'Проверяется…' : 'Проверить соединение'}
                      </Button>
                      <Button size="sm" onClick={() => save('integrations')}>
                        <Icon name="Save" size={14} className="mr-1.5" />Сохранить
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Telegram */}
                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-2.5 px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Icon name="Send" size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Telegram Bot</p>
                      <p className="text-xs text-gray-500">Входящие заявки и уведомления клиентам</p>
                    </div>
                  </div>
                  <div className="px-4 py-4 space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Bot Token</label>
                      <PwdInput value={tg.token} onChange={(v) => setTg((p) => ({ ...p, token: v }))}
                        show={tg.showToken} onToggle={() => setTg((p) => ({ ...p, showToken: !p.showToken }))} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Webhook URL</label>
                      <Input value={tg.webhookUrl} onChange={(e) => setTg((p) => ({ ...p, webhookUrl: e.target.value }))} className="text-sm w-full font-mono" />
                    </div>
                    <div className="flex justify-end pt-1">
                      <Button size="sm" onClick={() => save('integrations')}>
                        <Icon name="Save" size={14} className="mr-1.5" />Сохранить
                      </Button>
                    </div>
                  </div>
                </div>

                {/* SMTP */}
                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Icon name="Mail" size={16} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Email (SMTP)</p>
                        <p className="text-xs text-gray-500">Исходящие уведомления клиентам и сотрудникам</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">TLS</span>
                      <Toggle value={smtp.tls} onChange={(v) => setSmtp((p) => ({ ...p, tls: v }))} />
                    </div>
                  </div>
                  <div className="px-4 py-4 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="text-xs text-gray-500 mb-1 block">SMTP хост</label>
                        <Input value={smtp.host} onChange={(e) => setSmtp((p) => ({ ...p, host: e.target.value }))} className="text-sm w-full" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Порт</label>
                        <Input type="number" value={smtp.port} onChange={(e) => setSmtp((p) => ({ ...p, port: e.target.value }))} className="text-sm w-full" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Логин</label>
                        <Input value={smtp.login} onChange={(e) => setSmtp((p) => ({ ...p, login: e.target.value }))} className="text-sm w-full" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Пароль</label>
                        <PwdInput value={smtp.password} onChange={(v) => setSmtp((p) => ({ ...p, password: v }))}
                          show={smtp.showPwd} onToggle={() => setSmtp((p) => ({ ...p, showPwd: !p.showPwd }))} />
                      </div>
                    </div>
                    <div className="flex justify-end pt-1">
                      <Button size="sm" onClick={() => save('integrations')}>
                        <Icon name="Save" size={14} className="mr-1.5" />Сохранить
                      </Button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ── Notifications ── */}
          {tab === 'notifications' && (
            <div>
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Матрица уведомлений</h2>
                <p className="text-xs text-gray-500 mt-0.5">Настройте каналы доставки для каждого события</p>
              </div>
              <div className="px-6 py-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3 pr-6 w-72">Событие</th>
                      {CHANNELS.map((ch) => (
                        <th key={ch} className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3 px-4 min-w-[80px]">{ch}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {NOTIFICATION_EVENTS.map(({ key, label }, i) => (
                      <tr key={key} className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="py-3 pr-6">
                          <p className="text-sm text-gray-800">{label}</p>
                        </td>
                        {CHANNELS.map((ch) => (
                          <td key={ch} className="py-3 px-4 text-center">
                            <div className="flex justify-center">
                              <Toggle
                                value={matrix[key]?.[ch] ?? false}
                                onChange={() => setMatrix((prev) => ({
                                  ...prev,
                                  [key]: { ...prev[key], [ch]: !prev[key][ch] },
                                }))}
                              />
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Channel summary */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {[
                    { ch: 'Email' as Channel,    icon: 'Mail',       color: 'text-purple-600', bg: 'bg-purple-50' },
                    { ch: 'Telegram' as Channel, icon: 'Send',       color: 'text-blue-600',   bg: 'bg-blue-50' },
                    { ch: 'SMS' as Channel,      icon: 'Smartphone', color: 'text-green-600',  bg: 'bg-green-50' },
                    { ch: 'Push' as Channel,     icon: 'Bell',       color: 'text-orange-600', bg: 'bg-orange-50' },
                  ].map(({ ch, icon, color, bg }) => {
                    const count = NOTIFICATION_EVENTS.filter(({ key }) => matrix[key]?.[ch]).length;
                    return (
                      <div key={ch} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${bg}`}>
                        <Icon name={icon} size={14} className={color} />
                        <span className="text-xs font-medium text-gray-700">{ch}</span>
                        <Badge className="bg-white/80 text-gray-600 border-0 text-xs px-1.5">
                          {count}/{NOTIFICATION_EVENTS.length}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
              <SaveBar onSave={() => save('notifications')} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SystemSettingsFull;
