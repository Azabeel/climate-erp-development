import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

// ─── Types ───────────────────────────────────────────────────────────────────

type ChannelKey = 'sms' | 'email' | 'push' | 'telegram' | 'whatsapp';

interface ChannelConfig {
  active: boolean;
  text: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  trigger: string;
  delayMinutes: number;
  channels: ChannelKey[];
  active: boolean;
  lastModified: string;
  channelConfigs: Record<ChannelKey, ChannelConfig>;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const AVAILABLE_VARIABLES = [
  { key: '{client_name}', label: 'Имя клиента' },
  { key: '{engineer_name}', label: 'Инженер' },
  { key: '{order_number}', label: 'Номер наряда' },
  { key: '{date}', label: 'Дата' },
  { key: '{time}', label: 'Время' },
  { key: '{address}', label: 'Адрес' },
  { key: '{eta}', label: 'ETA (мин)' },
];

const TEST_VALUES: Record<string, string> = {
  '{client_name}': 'Иванов Иван',
  '{engineer_name}': 'Петров А.С.',
  '{order_number}': 'WO-2026-000142',
  '{date}': '16.05.2026',
  '{time}': '14:30',
  '{address}': 'ул. Ленина, 42, кв. 7',
  '{eta}': '25',
};

const TRIGGER_OPTIONS = [
  { value: 'assigned', label: 'Назначен исполнитель' },
  { value: 'en_route', label: 'Инженер выехал' },
  { value: 'completed', label: 'Работы выполнены' },
  { value: 'sla_warning', label: 'SLA истекает (предупреждение)' },
  { value: 'parts_ordered', label: 'Запчасть заказана' },
  { value: 'parts_received', label: 'Запчасть получена' },
  { value: 'rating_request', label: 'Запрос оценки качества' },
  { value: 'cancelled', label: 'Наряд отменён' },
  { value: 'ppr_reminder', label: 'Плановое ТО напоминание' },
  { value: '30min_before', label: 'Напоминание за 30 минут' },
  { value: 'contract_expiry', label: 'Договор истекает' },
  { value: 'new_message', label: 'Новое сообщение' },
];

const CHANNEL_LABELS: Record<ChannelKey, string> = {
  sms: 'SMS',
  email: 'Email',
  push: 'Push',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
};

const CHANNEL_ICONS: Record<ChannelKey, string> = {
  sms: 'MessageSquare',
  email: 'Mail',
  push: 'Bell',
  telegram: 'Send',
  whatsapp: 'Phone',
};

const defaultChannelConfig = (text: string): ChannelConfig => ({
  active: false,
  text,
});

// ─── Initial Data ─────────────────────────────────────────────────────────────

const INITIAL_TEMPLATES: NotificationTemplate[] = [
  {
    id: '1',
    name: 'Назначен исполнитель',
    trigger: 'assigned',
    delayMinutes: 0,
    channels: ['sms', 'push', 'telegram'],
    active: true,
    lastModified: '12.05.2026',
    channelConfigs: {
      sms: { active: true, text: 'Заявка принята. Инженер {engineer_name} приедет {date} в {time}. Наряд {order_number}.' },
      email: defaultChannelConfig('Уважаемый {client_name},\n\nВаша заявка {order_number} принята в работу.\nИнженер {engineer_name} посетит вас {date} в {time}.\nАдрес: {address}'),
      push: { active: true, text: 'Назначен инженер {engineer_name}. Визит {date} в {time}.' },
      telegram: { active: true, text: '✅ Заявка {order_number} принята!\nИнженер {engineer_name} приедет {date} в {time}.\n📍 {address}' },
      whatsapp: defaultChannelConfig('Здравствуйте, {client_name}! Ваша заявка {order_number} принята. Инженер {engineer_name} приедет {date} в {time}.'),
    },
  },
  {
    id: '2',
    name: 'Инженер выехал',
    trigger: 'en_route',
    delayMinutes: 0,
    channels: ['sms', 'push'],
    active: true,
    lastModified: '10.05.2026',
    channelConfigs: {
      sms: { active: true, text: 'Инженер {engineer_name} выехал. Ожидайте ~{eta} минут. Наряд {order_number}.' },
      email: defaultChannelConfig('Инженер {engineer_name} выехал к вам. Ожидаемое время прибытия: ~{eta} минут.'),
      push: { active: true, text: 'Инженер выехал! Ожидайте ~{eta} мин.' },
      telegram: defaultChannelConfig('🚗 Инженер {engineer_name} выехал!\nОжидайте ~{eta} минут.'),
      whatsapp: defaultChannelConfig('Инженер {engineer_name} уже едет к вам! Ожидаемое время: ~{eta} мин.'),
    },
  },
  {
    id: '3',
    name: 'Работы выполнены',
    trigger: 'completed',
    delayMinutes: 5,
    channels: ['sms', 'email', 'push'],
    active: true,
    lastModified: '08.05.2026',
    channelConfigs: {
      sms: { active: true, text: 'Работы по заявке {order_number} выполнены. Оцените качество: {address}' },
      email: { active: true, text: 'Уважаемый {client_name},\n\nРаботы по заявке {order_number} выполнены {date}.\nПожалуйста, оцените качество обслуживания.' },
      push: { active: true, text: 'Заявка {order_number} закрыта. Оцените работу инженера!' },
      telegram: defaultChannelConfig('✅ Работы выполнены!\nЗаявка {order_number} закрыта {date}.\nОцените качество обслуживания.'),
      whatsapp: defaultChannelConfig('Работы завершены! Заявка {order_number} выполнена {date}. Спасибо за обращение!'),
    },
  },
  {
    id: '4',
    name: 'SLA истекает',
    trigger: 'sla_warning',
    delayMinutes: 0,
    channels: ['push', 'telegram'],
    active: true,
    lastModified: '15.05.2026',
    channelConfigs: {
      sms: defaultChannelConfig('ВНИМАНИЕ: SLA по заявке {order_number} истекает {date} в {time}!'),
      email: defaultChannelConfig('Критическое предупреждение: SLA по заявке {order_number} истекает в {time}. Требуется немедленное реагирование.'),
      push: { active: true, text: '⚠️ SLA истекает! Заявка {order_number} — осталось мало времени.' },
      telegram: { active: true, text: '🔴 SLA ИСТЕКАЕТ!\nЗаявка {order_number}\nДедлайн: {date} {time}\nАдрес: {address}' },
      whatsapp: defaultChannelConfig('КРИТИЧНО: SLA по заявке {order_number} истекает {date} в {time}!'),
    },
  },
  {
    id: '5',
    name: 'Запчасть заказана',
    trigger: 'parts_ordered',
    delayMinutes: 0,
    channels: ['sms', 'telegram'],
    active: true,
    lastModified: '07.05.2026',
    channelConfigs: {
      sms: { active: true, text: 'По заявке {order_number} заказана запчасть. Срок доставки: {date}.' },
      email: defaultChannelConfig('По вашей заявке {order_number} заказана необходимая запчасть.\nОжидаемый срок доставки: {date}.'),
      push: defaultChannelConfig('Запчасть заказана. Ожидайте доставки к {date}.'),
      telegram: { active: true, text: '📦 Запчасть заказана!\nЗаявка {order_number}\nОжидаемый срок: {date}' },
      whatsapp: defaultChannelConfig('По заявке {order_number} заказана запчасть. Доставка ожидается {date}.'),
    },
  },
  {
    id: '6',
    name: 'Запчасть получена',
    trigger: 'parts_received',
    delayMinutes: 0,
    channels: ['sms', 'push'],
    active: true,
    lastModified: '05.05.2026',
    channelConfigs: {
      sms: { active: true, text: 'Запчасть для заявки {order_number} получена. Свяжемся для согласования даты.' },
      email: defaultChannelConfig('Запчасть для вашей заявки {order_number} получена на склад. Наш менеджер свяжется с вами для согласования удобного времени визита.'),
      push: { active: true, text: 'Запчасть получена! Позвоним для записи на ремонт.' },
      telegram: defaultChannelConfig('✅ Запчасть получена!\nЗаявка {order_number}\nСвяжемся с вами для записи.'),
      whatsapp: defaultChannelConfig('Запчасть для заявки {order_number} уже на складе! Свяжемся с вами в ближайшее время.'),
    },
  },
  {
    id: '7',
    name: 'Оценка качества',
    trigger: 'rating_request',
    delayMinutes: 60,
    channels: ['sms', 'email'],
    active: true,
    lastModified: '03.05.2026',
    channelConfigs: {
      sms: { active: true, text: 'Оцените качество обслуживания по заявке {order_number}: {address}' },
      email: { active: true, text: 'Уважаемый {client_name},\n\nПросим оценить качество работы инженера {engineer_name} по заявке {order_number}.\n\nВаше мнение важно для нас!' },
      push: defaultChannelConfig('Как прошёл ремонт? Оцените работу инженера!'),
      telegram: defaultChannelConfig('⭐ Оцените качество обслуживания!\nЗаявка {order_number}\nИнженер: {engineer_name}'),
      whatsapp: defaultChannelConfig('Здравствуйте, {client_name}! Как вы оцените работу нашего инженера {engineer_name}?'),
    },
  },
  {
    id: '8',
    name: 'Наряд отменён',
    trigger: 'cancelled',
    delayMinutes: 0,
    channels: ['sms', 'push'],
    active: true,
    lastModified: '01.05.2026',
    channelConfigs: {
      sms: { active: true, text: 'Заявка {order_number} отменена {date}. Для вопросов звоните: +7 (800) 123-45-67.' },
      email: defaultChannelConfig('Уважаемый {client_name},\n\nВаша заявка {order_number} была отменена {date}.\nЕсли у вас остались вопросы, свяжитесь с нами.'),
      push: { active: true, text: 'Заявка {order_number} отменена. Свяжитесь с нами при необходимости.' },
      telegram: defaultChannelConfig('❌ Заявка {order_number} отменена.\nДата: {date}\nЕсли нужна помощь — напишите нам.'),
      whatsapp: defaultChannelConfig('Заявка {order_number} отменена {date}. Если нужна помощь — обращайтесь!'),
    },
  },
  {
    id: '9',
    name: 'Плановое ТО напоминание',
    trigger: 'ppr_reminder',
    delayMinutes: 0,
    channels: ['email', 'telegram'],
    active: false,
    lastModified: '28.04.2026',
    channelConfigs: {
      sms: defaultChannelConfig('Напоминание: плановое ТО вашего оборудования запланировано на {date} в {time}.'),
      email: { active: true, text: 'Уважаемый {client_name},\n\nНапоминаем, что плановое техническое обслуживание вашего оборудования запланировано на {date} в {time}.\nАдрес: {address}\nИнженер: {engineer_name}' },
      push: defaultChannelConfig('Плановое ТО {date} в {time}. Инженер {engineer_name}.'),
      telegram: { active: true, text: '🔧 Напоминание о плановом ТО!\nДата: {date} в {time}\nАдрес: {address}\nИнженер: {engineer_name}' },
      whatsapp: defaultChannelConfig('Напоминаем о плановом ТО {date} в {time}. Инженер {engineer_name} будет у вас по адресу: {address}.'),
    },
  },
  {
    id: '10',
    name: 'Напоминание о визите (30 мин)',
    trigger: '30min_before',
    delayMinutes: 0,
    channels: ['sms', 'push'],
    active: true,
    lastModified: '25.04.2026',
    channelConfigs: {
      sms: { active: true, text: 'Инженер {engineer_name} будет у вас примерно через 30 минут. Наряд {order_number}.' },
      email: defaultChannelConfig('Инженер {engineer_name} прибудет к вам примерно через 30 минут.\nАдрес: {address}'),
      push: { active: true, text: 'Инженер {engineer_name} — через ~30 минут!' },
      telegram: defaultChannelConfig('🚗 Инженер {engineer_name} будет через ~30 минут!\nАдрес: {address}'),
      whatsapp: defaultChannelConfig('Инженер {engineer_name} скоро будет у вас — примерно через 30 минут!'),
    },
  },
  {
    id: '11',
    name: 'Договор истекает',
    trigger: 'contract_expiry',
    delayMinutes: 0,
    channels: ['email'],
    active: false,
    lastModified: '20.04.2026',
    channelConfigs: {
      sms: defaultChannelConfig('Ваш договор обслуживания истекает {date}. Свяжитесь с нами для продления.'),
      email: { active: true, text: 'Уважаемый {client_name},\n\nВаш договор на обслуживание истекает {date}.\nПросим связаться с вашим менеджером для продления.\n\nС уважением, Сервис Климат' },
      push: defaultChannelConfig('Договор истекает {date}. Свяжитесь для продления.'),
      telegram: defaultChannelConfig('📋 Ваш договор обслуживания истекает {date}.\nСвяжитесь с нами для продления!'),
      whatsapp: defaultChannelConfig('Уважаемый {client_name}! Ваш договор на обслуживание истекает {date}. Свяжитесь с нами для продления.'),
    },
  },
  {
    id: '12',
    name: 'Новое сообщение',
    trigger: 'new_message',
    delayMinutes: 0,
    channels: ['push', 'telegram'],
    active: true,
    lastModified: '18.04.2026',
    channelConfigs: {
      sms: defaultChannelConfig('Новое сообщение по заявке {order_number}. Откройте приложение для просмотра.'),
      email: defaultChannelConfig('Вы получили новое сообщение по заявке {order_number}. Войдите в личный кабинет для ответа.'),
      push: { active: true, text: 'Новое сообщение по заявке {order_number}.' },
      telegram: { active: true, text: '💬 Новое сообщение!\nЗаявка {order_number}\nОтветьте в чате.' },
      whatsapp: defaultChannelConfig('Вы получили сообщение по заявке {order_number}. Ответьте в приложении.'),
    },
  },
];

// ─── Metrics ─────────────────────────────────────────────────────────────────

const METRICS = [
  { label: 'Шаблонов', value: '18', icon: 'FileText', color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Активных', value: '15', icon: 'CheckCircle', color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Каналов', value: '5', icon: 'Radio', color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Отправлено за месяц', value: '2 847', icon: 'Send', color: 'text-orange-600', bg: 'bg-orange-50' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fillTemplate(text: string): string {
  return Object.entries(TEST_VALUES).reduce(
    (acc, [key, val]) => acc.replaceAll(key, val),
    text,
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ChannelBadge({ channel }: { channel: ChannelKey }) {
  return (
    <span
      title={CHANNEL_LABELS[channel]}
      className="inline-flex items-center justify-center w-5 h-5 rounded bg-slate-100 text-slate-500"
    >
      <Icon name={CHANNEL_ICONS[channel] as any} size={11} />
    </span>
  );
}

interface TemplateListItemProps {
  template: NotificationTemplate;
  selected: boolean;
  onSelect: () => void;
}

function TemplateListItem({ template, selected, onSelect }: TemplateListItemProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-3 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors ${
        selected ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className={`text-sm font-medium leading-tight ${selected ? 'text-blue-700' : 'text-slate-800'}`}>
          {template.name}
        </span>
        <Badge
          variant={template.active ? 'default' : 'secondary'}
          className={`text-xs shrink-0 ${template.active ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}`}
        >
          {template.active ? 'Активен' : 'Выкл'}
        </Badge>
      </div>
      <div className="flex items-center gap-1 mb-1">
        {template.channels.map((ch) => (
          <ChannelBadge key={ch} channel={ch} />
        ))}
      </div>
      <p className="text-xs text-slate-400">Изменён: {template.lastModified}</p>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function NotificationTemplatesFull() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>(INITIAL_TEMPLATES);
  const [selectedId, setSelectedId] = useState<string>('1');
  const [activeChannel, setActiveChannel] = useState<ChannelKey>('sms');
  const [search, setSearch] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selected = templates.find((t) => t.id === selectedId) ?? templates[0];

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  // ── Updaters ──────────────────────────────────────────────────────────────

  function updateTemplate(patch: Partial<NotificationTemplate>) {
    setTemplates((prev) =>
      prev.map((t) => (t.id === selectedId ? { ...t, ...patch } : t)),
    );
  }

  function updateChannelConfig(channel: ChannelKey, patch: Partial<ChannelConfig>) {
    setTemplates((prev) =>
      prev.map((t) => {
        if (t.id !== selectedId) return t;
        return {
          ...t,
          channelConfigs: {
            ...t.channelConfigs,
            [channel]: { ...t.channelConfigs[channel], ...patch },
          },
        };
      }),
    );
  }

  function insertVariable(variable: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const current = selected.channelConfigs[activeChannel].text;
    const newText = current.slice(0, start) + variable + current.slice(end);
    updateChannelConfig(activeChannel, { text: newText });
    // Restore cursor after state update
    requestAnimationFrame(() => {
      ta.selectionStart = start + variable.length;
      ta.selectionEnd = start + variable.length;
      ta.focus();
    });
  }

  function handleSave() {
    toast.success('Шаблон сохранён', { description: `«${selected.name}» обновлён успешно.` });
  }

  function handleTestSend() {
    toast.success('Тестовое уведомление отправлено', {
      description: `Канал: ${CHANNEL_LABELS[activeChannel]}`,
    });
  }

  const currentChannelConfig = selected.channelConfigs[activeChannel];
  const previewText = fillTemplate(currentChannelConfig.text);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-screen">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <Icon name="Bell" size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Шаблоны уведомлений</h1>
              <p className="text-xs text-slate-500">Управление шаблонами и каналами доставки</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleTestSend}>
              <Icon name="Send" size={14} className="mr-1.5" />
              Тест отправки
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave}>
              <Icon name="Save" size={14} className="mr-1.5" />
              Сохранить
            </Button>
          </div>
        </div>

        {/* ── Metrics ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-3">
          {METRICS.map((m) => (
            <div key={m.label} className={`rounded-lg ${m.bg} px-4 py-3 flex items-center gap-3`}>
              <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm`}>
                <Icon name={m.icon as any} size={16} className={m.color} />
              </div>
              <div>
                <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
                <p className="text-xs text-slate-500">{m.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Template List ───────────────────────────────────────────── */}
        <aside className="w-80 shrink-0 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-3 border-b border-slate-100">
            <Input
              placeholder="Поиск шаблонов..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredTemplates.map((t) => (
              <TemplateListItem
                key={t.id}
                template={t}
                selected={t.id === selectedId}
                onSelect={() => {
                  setSelectedId(t.id);
                  setActiveChannel('sms');
                }}
              />
            ))}
            {filteredTemplates.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">Ничего не найдено</p>
            )}
          </div>
        </aside>

        {/* ── Editor ─────────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* ── Basic settings ────────────────────────────────────── */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Основные настройки</h2>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Название шаблона</label>
                  <Input
                    value={selected.name}
                    onChange={(e) => updateTemplate({ name: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Триггерное событие</label>
                  <select
                    value={selected.trigger}
                    onChange={(e) => updateTemplate({ trigger: e.target.value })}
                    className="w-full h-8 text-sm border border-slate-200 rounded-md px-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TRIGGER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Задержка отправки (мин)</label>
                  <Input
                    type="number"
                    min={0}
                    value={selected.delayMinutes}
                    onChange={(e) =>
                      updateTemplate({ delayMinutes: Math.max(0, parseInt(e.target.value) || 0) })
                    }
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* ── Channel tabs ──────────────────────────────────────── */}
            <div className="bg-white rounded-lg border border-slate-200">
              {/* Tab bar */}
              <div className="flex border-b border-slate-200">
                {(Object.keys(CHANNEL_LABELS) as ChannelKey[]).map((ch) => {
                  const cfg = selected.channelConfigs[ch];
                  const isActive = ch === activeChannel;
                  return (
                    <button
                      key={ch}
                      onClick={() => setActiveChannel(ch)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 transition-colors ${
                        isActive
                          ? 'border-blue-500 text-blue-600 font-medium'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Icon name={CHANNEL_ICONS[ch] as any} size={13} />
                      {CHANNEL_LABELS[ch]}
                      {cfg.active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 ml-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Channel editor */}
              <div className="p-4 space-y-3">
                {/* Toggle active */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 font-medium">
                    Канал {CHANNEL_LABELS[activeChannel]}
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <span className="text-xs text-slate-500">
                      {currentChannelConfig.active ? 'Активен' : 'Отключён'}
                    </span>
                    <button
                      onClick={() =>
                        updateChannelConfig(activeChannel, { active: !currentChannelConfig.active })
                      }
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        currentChannelConfig.active ? 'bg-green-500' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          currentChannelConfig.active ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </label>
                </div>

                {/* Text area */}
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Текст шаблона</label>
                  <textarea
                    ref={textareaRef}
                    value={currentChannelConfig.text}
                    onChange={(e) => updateChannelConfig(activeChannel, { text: e.target.value })}
                    rows={4}
                    className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="Введите текст шаблона..."
                  />
                </div>

                {/* Variables */}
                <div>
                  <label className="text-xs text-slate-500 mb-2 block">
                    Доступные переменные — нажмите для вставки:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_VARIABLES.map((v) => (
                      <button
                        key={v.key}
                        onClick={() => insertVariable(v.key)}
                        title={v.label}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-mono"
                      >
                        {v.key}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Preview ────────────────────────────────────────────── */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="Eye" size={14} className="text-slate-500" />
                <h2 className="text-sm font-semibold text-slate-700">
                  Предпросмотр — {CHANNEL_LABELS[activeChannel]}
                </h2>
                <Badge variant="secondary" className="text-xs">Тестовые данные</Badge>
              </div>

              {activeChannel === 'sms' || activeChannel === 'push' ? (
                /* Phone mockup */
                <div className="flex justify-center">
                  <div className="w-64 bg-slate-800 rounded-3xl p-3 shadow-lg">
                    <div className="bg-slate-700 rounded-2xl p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
                          <Icon name="Building2" size={13} className="text-white" />
                        </div>
                        <div>
                          <p className="text-white text-xs font-medium leading-none">Сервис Климат</p>
                          <p className="text-slate-400 text-xs">
                            {activeChannel === 'sms' ? 'SMS' : 'Push-уведомление'}
                          </p>
                        </div>
                        <span className="ml-auto text-slate-400 text-xs">сейчас</span>
                      </div>
                      <p className="text-slate-200 text-xs leading-relaxed">{previewText}</p>
                    </div>
                  </div>
                </div>
              ) : activeChannel === 'telegram' ? (
                /* Telegram mockup */
                <div className="flex justify-center">
                  <div className="w-72 bg-slate-100 rounded-2xl p-3 shadow-inner">
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center shrink-0">
                        <Icon name="Bot" size={14} className="text-white" />
                      </div>
                      <div className="bg-white rounded-2xl rounded-tl-none px-3 py-2 shadow-sm max-w-[220px]">
                        <p className="text-sky-600 text-xs font-semibold mb-1">Сервис Климат</p>
                        <p className="text-slate-800 text-xs leading-relaxed whitespace-pre-line">{previewText}</p>
                        <p className="text-right text-slate-400 text-xs mt-1">16:42 ✓✓</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Generic text preview */
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{previewText}</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Footer actions ─────────────────────────────────────── */}
          <div className="border-t border-slate-200 bg-white px-5 py-3 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Последнее изменение: {selected.lastModified}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleTestSend}>
                <Icon name="Send" size={13} className="mr-1.5" />
                Тест отправки
              </Button>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSave}
              >
                <Icon name="Save" size={13} className="mr-1.5" />
                Сохранить
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
