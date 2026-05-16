import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type IntegrationStatus = 'connected' | 'disconnected' | 'error';
type CategoryKey = 'messengers' | 'business' | 'iot';

interface LogEvent {
  time: string;
  text: string;
  ok: boolean;
}

interface IntegrationConfig {
  apiKey?: string;
  webhookUrl?: string;
  token?: string;
}

interface Integration {
  id: string;
  name: string;
  category: CategoryKey;
  iconName: string;
  iconBg: string;
  iconColor: string;
  status: IntegrationStatus;
  subtitle: string;
  stat: string;
  config: IntegrationConfig;
  log: LogEvent[];
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const INTEGRATIONS: Integration[] = [
  // ── Мессенджеры и каналы ──
  {
    id: 'telegram',
    name: 'Telegram Bot',
    category: 'messengers',
    iconName: 'Send',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    status: 'connected',
    subtitle: '@servisklimat_bot',
    stat: '847 сообщений/мес',
    config: {
      token: '7412345678:AAFdK9s_masked_token_here',
      webhookUrl: 'https://api.servisklimat.ru/webhooks/telegram',
    },
    log: [
      { time: '16:42', text: 'Отправлено уведомление клиенту (WO-2026-000421)', ok: true },
      { time: '16:31', text: 'Входящее сообщение → создана заявка #1047', ok: true },
      { time: '15:58', text: 'Webhook подтверждён (200 OK)', ok: true },
    ],
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    category: 'messengers',
    iconName: 'MessageCircle',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    status: 'connected',
    subtitle: '+7 495 xxx-xx-xx',
    stat: '234 сообщения/мес',
    config: {
      apiKey: 'EAABxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      webhookUrl: 'https://api.servisklimat.ru/webhooks/whatsapp',
    },
    log: [
      { time: '16:40', text: 'Сообщение отправлено (WO-2026-000419)', ok: true },
      { time: '16:22', text: 'Шаблон "статус_наряда" одобрен Meta', ok: true },
      { time: '15:10', text: 'HTTP 429 — rate limit, retry через 60 с', ok: false },
    ],
  },
  {
    id: 'avito',
    name: 'Avito Messenger',
    category: 'messengers',
    iconName: 'ShoppingBag',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-700',
    status: 'connected',
    subtitle: '3 аккаунта',
    stat: '156 сообщений/мес',
    config: {
      apiKey: 'v3.avito.api.key_masked',
      webhookUrl: 'https://api.servisklimat.ru/webhooks/avito',
    },
    log: [
      { time: '16:35', text: 'Новый диалог с аккаунта "Ремонт кондиционеров"', ok: true },
      { time: '16:10', text: 'Синхронизация 3 аккаунтов завершена', ok: true },
      { time: '14:50', text: 'Аккаунт "СК Север" — токен обновлён', ok: true },
    ],
  },
  {
    id: 'email',
    name: 'Email (IMAP)',
    category: 'messengers',
    iconName: 'Mail',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    status: 'connected',
    subtitle: 'support@servisklimat.ru',
    stat: 'Опрос каждые 2 мин',
    config: {
      apiKey: 'smtp.yandex.ru:587',
      webhookUrl: 'imap.yandex.ru:993',
      token: '••••••••••••',
    },
    log: [
      { time: '16:44', text: 'Новое письмо → входящая заявка #1048', ok: true },
      { time: '16:42', text: 'Акт WO-2026-000415 отправлен клиенту', ok: true },
      { time: '16:20', text: 'Soft bounce — mailbox full (retry 1ч)', ok: false },
    ],
  },
  {
    id: 'max',
    name: 'Max (ВКонтакте)',
    category: 'messengers',
    iconName: 'MessageSquare',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    status: 'disconnected',
    subtitle: 'Не подключён',
    stat: '—',
    config: {
      token: '',
      webhookUrl: '',
    },
    log: [],
  },
  {
    id: 'viber',
    name: 'Viber',
    category: 'messengers',
    iconName: 'Phone',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    status: 'disconnected',
    subtitle: 'Не подключён',
    stat: '—',
    config: {
      token: '',
      webhookUrl: '',
    },
    log: [],
  },

  // ── Бизнес-системы ──
  {
    id: 'onec',
    name: '1С:УНФ',
    category: 'business',
    iconName: 'Database',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-700',
    status: 'connected',
    subtitle: 'Синхронизация ежечасно',
    stat: 'Последняя: 15 мин назад',
    config: {
      apiKey: 'https://1c.servisklimat.ru/odata/standard.odata',
      token: '••••••••••••',
    },
    log: [
      { time: '16:30', text: 'Акт ACT-2026-441 передан в 1С (200 OK)', ok: true },
      { time: '16:00', text: 'Справочник контрагентов синхронизирован (47 записей)', ok: true },
      { time: '15:30', text: 'Timeout 5s — сервер 1С недоступен, retry #1', ok: false },
    ],
  },
  {
    id: 'diadoc',
    name: 'Диадок (ЭДО)',
    category: 'business',
    iconName: 'FileText',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-700',
    status: 'connected',
    subtitle: 'Электронный документооборот',
    stat: '24 документа/мес',
    config: {
      apiKey: 'ddauth_api_client_id_masked',
      token: 'ddauth_token_masked',
    },
    log: [
      { time: '16:15', text: 'УПД отправлен контрагенту ООО "АркоМаш"', ok: true },
      { time: '15:40', text: 'Акт подписан получателем (WO-2026-000408)', ok: true },
      { time: '14:20', text: 'Счёт-фактура INV-2026-183 выгружен в Диадок', ok: true },
    ],
  },
  {
    id: 'cdek',
    name: 'СДЭК',
    category: 'business',
    iconName: 'Truck',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-800',
    status: 'connected',
    subtitle: 'Отслеживание доставки',
    stat: 'API ключ настроен',
    config: {
      apiKey: 'EMscd6r9JnFiQ3bLoyjJY6eM_masked',
      webhookUrl: 'https://api.servisklimat.ru/webhooks/cdek',
    },
    log: [
      { time: '16:00', text: 'Статус заказа PO-2026-089: ACCEPTED', ok: true },
      { time: '12:00', text: 'Плановый трекинг: 3 посылки проверены', ok: true },
      { time: '08:00', text: 'Заказ PO-2026-088 создан (uuid: abc-123)', ok: true },
    ],
  },
  {
    id: 'yandex_maps',
    name: 'Яндекс.Карты',
    category: 'business',
    iconName: 'Map',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-700',
    status: 'disconnected',
    subtitle: 'Геокодинг адресов',
    stat: '—',
    config: {
      apiKey: '',
    },
    log: [],
  },

  // ── Оборудование и IoT ──
  {
    id: 'osrm',
    name: 'OSRM (маршрутизация)',
    category: 'iot',
    iconName: 'Navigation',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-700',
    status: 'connected',
    subtitle: 'Self-hosted, Moscow OSM',
    stat: '5 621 запросов/мес',
    config: {
      apiKey: 'http://osrm.servisklimat.ru:5000',
    },
    log: [
      { time: '16:44', text: 'Маршрут рассчитан: 12.3 км, 23 мин (WO-421)', ok: true },
      { time: '16:30', text: 'Оптимизация 8 маршрутов диспетчерской смены', ok: true },
      { time: '09:00', text: 'Обновление OSM-тайлов Московского региона', ok: true },
    ],
  },
  {
    id: 'weather',
    name: 'Метеосервис',
    category: 'iot',
    iconName: 'Cloud',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-700',
    status: 'connected',
    subtitle: '3 источника агрегации',
    stat: 'Яндекс + OWM + Gismeteo',
    config: {
      apiKey: 'owm_api_key_masked + yandex_weather_key_masked',
      webhookUrl: 'https://api.servisklimat.ru/weather/refresh',
    },
    log: [
      { time: '16:30', text: 'Прогноз обновлён: Москва, +21°C, ясно', ok: true },
      { time: '16:00', text: 'Агрегация 3 источников — расхождение <2°C', ok: true },
      { time: '14:00', text: 'Алерт: гроза 18:00–21:00 → рекомендован перенос', ok: true },
    ],
  },
  {
    id: 'iot',
    name: 'IoT-сенсоры',
    category: 'iot',
    iconName: 'Wifi',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-700',
    status: 'connected',
    subtitle: 'MQTT брокер',
    stat: '12 устройств онлайн',
    config: {
      apiKey: 'mqtt://iot.servisklimat.ru:1883',
      token: 'mqtt_token_masked',
    },
    log: [
      { time: '16:45', text: 'Телеметрия: 12/12 сенсоров в сети', ok: true },
      { time: '15:20', text: 'Сенсор #07 (ТЦ Мираж): T=+38°C → алерт', ok: false },
      { time: '14:00', text: 'OTA обновление прошивки 3 устройств', ok: true },
    ],
  },
];

const CATEGORIES: { key: CategoryKey | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: 'Все интеграции', icon: 'Layers' },
  { key: 'messengers', label: 'Мессенджеры и каналы', icon: 'MessageCircle' },
  { key: 'business', label: 'Бизнес-системы', icon: 'Briefcase' },
  { key: 'iot', label: 'Оборудование и IoT', icon: 'Cpu' },
];

const SECTION_LABELS: Record<CategoryKey, string> = {
  messengers: 'Мессенджеры и каналы',
  business: 'Бизнес-системы',
  iot: 'Оборудование и IoT',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusBadge(status: IntegrationStatus) {
  switch (status) {
    case 'connected':
      return <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">Подключён</Badge>;
    case 'error':
      return <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">Ошибка</Badge>;
    case 'disconnected':
      return <Badge className="bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100">Не подключён</Badge>;
  }
}

function statusDot(status: IntegrationStatus) {
  const cls =
    status === 'connected'
      ? 'bg-green-500'
      : status === 'error'
      ? 'bg-red-500'
      : 'bg-gray-300';
  return <span className={`inline-block w-2 h-2 rounded-full ${cls}`} />;
}

// ─── Settings Panel ───────────────────────────────────────────────────────────

interface SettingsPanelProps {
  integration: Integration;
  onClose: () => void;
}

const SettingsPanel = ({ integration, onClose }: SettingsPanelProps) => {
  const [cfg, setCfg] = useState<IntegrationConfig>({ ...integration.config });

  const handleSave = () => {
    toast.success(`Настройки «${integration.name}» сохранены`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${integration.iconBg}`}>
              <Icon name={integration.iconName} size={18} className={integration.iconColor} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 leading-tight">{integration.name}</p>
              <p className="text-xs text-gray-400">{integration.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Fields */}
        <div className="px-6 py-5 space-y-4">
          {cfg.apiKey !== undefined && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {integration.id === 'onec' ? 'URL API' : 'API ключ / Client ID'}
              </label>
              <Input
                value={cfg.apiKey}
                onChange={(e) => setCfg({ ...cfg, apiKey: e.target.value })}
                placeholder="Введите API ключ..."
                className="font-mono text-sm"
              />
            </div>
          )}
          {cfg.token !== undefined && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Токен</label>
              <Input
                value={cfg.token}
                onChange={(e) => setCfg({ ...cfg, token: e.target.value })}
                type="password"
                placeholder="••••••••••••"
                className="font-mono text-sm"
              />
            </div>
          )}
          {cfg.webhookUrl !== undefined && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Webhook URL</label>
              <Input
                value={cfg.webhookUrl}
                onChange={(e) => setCfg({ ...cfg, webhookUrl: e.target.value })}
                placeholder="https://..."
                className="text-sm"
              />
            </div>
          )}
        </div>

        {/* Log */}
        {integration.log.length > 0 && (
          <div className="px-6 pb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Последние события
            </p>
            <div className="space-y-1.5">
              {integration.log.map((ev, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <Icon
                    name={ev.ok ? 'CheckCircle' : 'XCircle'}
                    size={13}
                    className={ev.ok ? 'text-green-500 mt-0.5 shrink-0' : 'text-red-500 mt-0.5 shrink-0'}
                  />
                  <span className="text-gray-400 shrink-0">{ev.time}</span>
                  <span className="text-gray-600">{ev.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <Button variant="outline" size="sm" onClick={onClose}>
            Отмена
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Icon name="Save" size={14} className="mr-1.5" />
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Integration Card ─────────────────────────────────────────────────────────

interface CardProps {
  integration: Integration;
  onConfigure: (id: string) => void;
}

const IntegrationCard = ({ integration, onConfigure }: CardProps) => {
  const handleTest = () => {
    if (integration.status === 'disconnected') {
      toast.error(`«${integration.name}» не подключён — настройте интеграцию`);
      return;
    }
    toast.success(`${integration.name}: соединение успешно`);
  };

  const handleDisconnect = () => {
    toast.info(`«${integration.name}» отключён`);
  };

  const handleConnect = () => {
    onConfigure(integration.id);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${integration.iconBg}`}>
            <Icon name={integration.iconName} size={18} className={integration.iconColor} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 leading-tight">{integration.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{integration.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {statusDot(integration.status)}
          {statusBadge(integration.status)}
        </div>
      </div>

      {/* Stat */}
      {integration.stat !== '—' && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Icon name="BarChart2" size={13} className="text-gray-400" />
          {integration.stat}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
        {integration.status === 'disconnected' ? (
          <Button size="sm" className="h-7 text-xs" onClick={handleConnect}>
            <Icon name="Plus" size={13} className="mr-1" />
            Подключить
          </Button>
        ) : (
          <>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => onConfigure(integration.id)}
            >
              <Icon name="Settings" size={13} className="mr-1" />
              Настроить
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={handleTest}
            >
              <Icon name="Zap" size={13} className="mr-1" />
              Тест связи
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={handleDisconnect}
            >
              <Icon name="PlugZap" size={13} className="mr-1" />
              Отключить
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Section ──────────────────────────────────────────────────────────────────

interface SectionProps {
  categoryKey: CategoryKey;
  integrations: Integration[];
  onConfigure: (id: string) => void;
}

const Section = ({ categoryKey, integrations, onConfigure }: SectionProps) => {
  const items = integrations.filter((i) => i.category === categoryKey);
  if (items.length === 0) return null;

  const connected = items.filter((i) => i.status === 'connected').length;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-base font-semibold text-gray-800">{SECTION_LABELS[categoryKey]}</h3>
        <span className="text-xs text-gray-400">
          ({connected} из {items.length} подключено)
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((intg) => (
          <IntegrationCard key={intg.id} integration={intg} onConfigure={onConfigure} />
        ))}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const IntegrationsFull = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryKey | 'all'>('all');
  const [configuringId, setConfiguringId] = useState<string | null>(null);

  const configuringIntegration = configuringId
    ? INTEGRATIONS.find((i) => i.id === configuringId) ?? null
    : null;

  const totalConnected = INTEGRATIONS.filter((i) => i.status === 'connected').length;
  const totalErrors = INTEGRATIONS.filter((i) => i.status === 'error').length;

  const visibleCategories: CategoryKey[] =
    activeCategory === 'all'
      ? ['messengers', 'business', 'iot']
      : [activeCategory];

  const filteredIntegrations =
    activeCategory === 'all'
      ? INTEGRATIONS
      : INTEGRATIONS.filter((i) => i.category === activeCategory);

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="px-8 py-6 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Интеграции</h2>
            <p className="text-gray-500 mt-0.5 text-sm">
              Подключение внешних сервисов и систем
            </p>
          </div>
          <Button
            onClick={() => toast.info('Раздел запроса новой интеграции откроется скоро')}
          >
            <Icon name="Plus" size={15} className="mr-1.5" />
            Запросить интеграцию
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-8 py-6">
        {/* ── Category Tabs ── */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon name={cat.icon} size={14} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ── Sections ── */}
        {visibleCategories.map((cat) => (
          <Section
            key={cat}
            categoryKey={cat}
            integrations={filteredIntegrations}
            onConfigure={setConfiguringId}
          />
        ))}

        {/* ── Bottom Stats Bar ── */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <Icon name="CheckCircle" size={16} className="text-green-600" />
              </div>
              <span className="text-xs font-medium text-gray-500">Активных интеграций</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalConnected}</p>
            <p className="text-xs text-gray-400 mt-0.5">из {INTEGRATIONS.length} всего</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Icon name="Activity" size={16} className="text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-500">Запросов / день</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">8 432</p>
            <p className="text-xs text-green-600 mt-0.5">↑ 12% к вчера</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                <Icon name="AlertCircle" size={16} className="text-red-500" />
              </div>
              <span className="text-xs font-medium text-gray-500">Ошибок / день</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalErrors > 0 ? 17 : 3}</p>
            <p className="text-xs text-red-500 mt-0.5">↑ {totalErrors} системы с ошибкой</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <Icon name="Timer" size={16} className="text-purple-600" />
              </div>
              <span className="text-xs font-medium text-gray-500">Среднее время ответа</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">284 мс</p>
            <p className="text-xs text-green-600 mt-0.5">↓ 8% к вчера</p>
          </div>
        </div>
      </div>

      {/* ── Settings Modal ── */}
      {configuringIntegration && (
        <SettingsPanel
          integration={configuringIntegration}
          onClose={() => setConfiguringId(null)}
        />
      )}
    </div>
  );
};

export default IntegrationsFull;
