import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PortalSettings {
  logoUrl: string;
  brandColor: string;
  domain: string;
  features: FeatureSwitch[];
  notifications: NotificationEvent[];
}

interface FeatureSwitch {
  key: string;
  label: string;
  icon: string;
  enabled: boolean;
}

interface NotificationEvent {
  key: string;
  label: string;
  enabled: boolean;
  channel: 'sms' | 'email' | 'telegram' | 'whatsapp';
}

interface WorkOrderPreview {
  id: string;
  num: string;
  date: string;
  description: string;
  status: 'new' | 'assigned' | 'in_progress' | 'completed';
}

interface Equipment {
  id: string;
  name: string;
  location: string;
  model: string;
  status: 'ok' | 'service' | 'repair';
  lastService: string;
}

interface PortalDocument {
  id: string;
  name: string;
  type: 'act' | 'invoice';
  date: string;
  amount: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_FEATURES: FeatureSwitch[] = [
  { key: 'create_orders',   label: 'Подача заявок онлайн',       icon: 'PlusCircle',    enabled: true  },
  { key: 'track_orders',    label: 'Отслеживание статуса нарядов', icon: 'MapPin',       enabled: true  },
  { key: 'service_history', label: 'История обслуживания',        icon: 'History',       enabled: true  },
  { key: 'documents',       label: 'Документы (акты, счета)',     icon: 'FileText',      enabled: true  },
  { key: 'online_payment',  label: 'Онлайн-оплата',              icon: 'CreditCard',    enabled: false },
  { key: 'rating',          label: 'Оценка качества',            icon: 'Star',          enabled: true  },
  { key: 'support_chat',    label: 'Чат поддержки',              icon: 'MessageSquare', enabled: true  },
];

const INITIAL_NOTIFICATIONS: NotificationEvent[] = [
  { key: 'order_created',   label: 'Заявка принята',              enabled: true,  channel: 'sms'      },
  { key: 'order_assigned',  label: 'Назначен инженер',            enabled: true,  channel: 'sms'      },
  { key: 'en_route',        label: 'Инженер выехал',              enabled: true,  channel: 'telegram' },
  { key: 'completed',       label: 'Работы выполнены',            enabled: true,  channel: 'email'    },
  { key: 'parts_ready',     label: 'Запчасть получена',           enabled: false, channel: 'sms'      },
  { key: 'invoice_issued',  label: 'Счёт выставлен',              enabled: true,  channel: 'email'    },
  { key: 'rating_request',  label: 'Запрос оценки',               enabled: true,  channel: 'email'    },
];

const MOCK_ORDERS: WorkOrderPreview[] = [
  { id: 'wo1', num: 'WO-2026-000047', date: '16.05.2026', description: 'Ремонт кондиционера Daikin, 2-й этаж, офис 214', status: 'in_progress' },
  { id: 'wo2', num: 'WO-2026-000041', date: '10.05.2026', description: 'Плановое ТО, холодильная камера склада №3',        status: 'completed'   },
  { id: 'wo3', num: 'WO-2026-000038', date: '05.05.2026', description: 'Замена фильтрующего элемента, торговый зал',        status: 'completed'   },
  { id: 'wo4', num: 'WO-2026-000031', date: '28.04.2026', description: 'Диагностика вентиляции подвального помещения',      status: 'completed'   },
];

const MOCK_EQUIPMENT: Equipment[] = [
  { id: 'eq1', name: 'Кондиционер Daikin VRV',    location: 'Офис 214, 2-й этаж',   model: 'RXYSQ5TV1',  status: 'service', lastService: '16.05.2026' },
  { id: 'eq2', name: 'Холодильная камера',         location: 'Склад №3',             model: 'Liebherr GKv', status: 'ok',    lastService: '10.05.2026' },
  { id: 'eq3', name: 'Приточная вентиляция',       location: 'Торговый зал',         model: 'Systemair',    status: 'ok',    lastService: '05.05.2026' },
  { id: 'eq4', name: 'Вытяжная система',           location: 'Подвальное помещение', model: 'Blauberg',     status: 'repair',lastService: '28.04.2026' },
];

const MOCK_DOCUMENTS: PortalDocument[] = [
  { id: 'd1', name: 'Акт выполненных работ WO-2026-000041', type: 'act',     date: '10.05.2026', amount: '4 200 ₽' },
  { id: 'd2', name: 'Счёт #INV-2026-00234',                 type: 'invoice', date: '10.05.2026', amount: '4 200 ₽' },
  { id: 'd3', name: 'Акт выполненных работ WO-2026-000038', type: 'act',     date: '05.05.2026', amount: '1 850 ₽' },
  { id: 'd4', name: 'Счёт #INV-2026-00218',                 type: 'invoice', date: '05.05.2026', amount: '1 850 ₽' },
  { id: 'd5', name: 'Акт выполненных работ WO-2026-000031', type: 'act',     date: '28.04.2026', amount: '3 100 ₽' },
];

const CHANNEL_OPTIONS: { value: NotificationEvent['channel']; label: string }[] = [
  { value: 'sms',      label: 'SMS'       },
  { value: 'email',    label: 'Email'     },
  { value: 'telegram', label: 'Telegram'  },
  { value: 'whatsapp', label: 'WhatsApp'  },
];

// ─── Helper: status config ────────────────────────────────────────────────────

const ORDER_STATUS_CONFIG: Record<WorkOrderPreview['status'], { label: string; badge: string; step: number }> = {
  new:         { label: 'Принято',   badge: 'bg-gray-100 text-gray-600',   step: 1 },
  assigned:    { label: 'Назначен',  badge: 'bg-blue-100 text-blue-700',   step: 2 },
  in_progress: { label: 'В работе',  badge: 'bg-indigo-100 text-indigo-700', step: 3 },
  completed:   { label: 'Выполнено', badge: 'bg-green-100 text-green-700', step: 4 },
};

const EQUIPMENT_STATUS_CONFIG: Record<Equipment['status'], { label: string; color: string; icon: string }> = {
  ok:      { label: 'Исправно',   color: 'bg-green-100 text-green-700',  icon: 'CheckCircle' },
  service: { label: 'В сервисе',  color: 'bg-blue-100 text-blue-700',    icon: 'Wrench'      },
  repair:  { label: 'На ремонте', color: 'bg-red-100 text-red-700',      icon: 'AlertTriangle' },
};

// ─── Sub-component: OrderProgressSteps ───────────────────────────────────────

const OrderProgressSteps = ({ status }: { status: WorkOrderPreview['status'] }) => {
  const currentStep = ORDER_STATUS_CONFIG[status].step;
  const steps = ['Принято', 'В работе', 'Выполнено'];

  return (
    <div className="flex items-center gap-1 mt-2">
      {steps.map((step, idx) => {
        const stepNum = idx + 1;
        const isActive  = stepNum === currentStep || (stepNum === 2 && currentStep === 3);
        const isDone    = stepNum < currentStep || (status === 'completed' && stepNum <= 3);
        const isCurrent = status === 'in_progress' ? stepNum === 2 : stepNum === currentStep;

        return (
          <div key={step} className="flex items-center gap-1">
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
              isDone    ? 'bg-green-100 text-green-700' :
              isCurrent ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-400'
            }`}>
              {isDone && <Icon name="Check" size={10} />}
              {step}
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-4 h-px ${isDone ? 'bg-green-300' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Sub-component: Portal Preview Tabs ──────────────────────────────────────

type PreviewTab = 'orders' | 'equipment' | 'documents' | 'payment';

interface PreviewPanelProps {
  brandColor: string;
  logoUploaded: boolean;
}

const PreviewOrders = ({ brandColor }: { brandColor: string }) => {
  const [showForm, setShowForm] = useState(false);
  const [newOrder, setNewOrder] = useState({ type: '', address: '', description: '', time: '' });

  const handleSubmit = () => {
    if (!newOrder.description.trim()) { toast.error('Опишите проблему'); return; }
    toast.success('Заявка отправлена! Диспетчер свяжется с вами в ближайшее время.');
    setShowForm(false);
    setNewOrder({ type: '', address: '', description: '', time: '' });
  };

  return (
    <div className="p-3 space-y-3">
      {!showForm ? (
        <>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-700">Активные и завершённые заявки</span>
            <button
              onClick={() => setShowForm(true)}
              className="text-xs font-medium px-2 py-1 rounded-md text-white transition-colors"
              style={{ backgroundColor: brandColor }}
            >
              + Новая заявка
            </button>
          </div>
          <div className="space-y-2">
            {MOCK_ORDERS.map(order => (
              <div key={order.id} className="border border-gray-100 rounded-lg p-2.5 bg-white hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-gray-800">{order.num}</span>
                      <span className="text-xs text-gray-400">{order.date}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 truncate">{order.description}</p>
                    <OrderProgressSteps status={order.status} />
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${ORDER_STATUS_CONFIG[order.status].badge}`}>
                    {ORDER_STATUS_CONFIG[order.status].label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-700">Новая заявка</span>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <Icon name="X" size={14} />
            </button>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-0.5">Тип обращения</label>
            <select
              value={newOrder.type}
              onChange={e => setNewOrder(prev => ({ ...prev, type: e.target.value }))}
              className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="">Выберите тип...</option>
              <option value="repair">Ремонт</option>
              <option value="maintenance">Техническое обслуживание</option>
              <option value="installation">Монтаж</option>
              <option value="diagnostics">Диагностика</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-0.5">Адрес / объект</label>
            <input
              type="text"
              value={newOrder.address}
              onChange={e => setNewOrder(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Офис, этаж, помещение..."
              className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-0.5">Описание проблемы</label>
            <textarea
              rows={2}
              value={newOrder.description}
              onChange={e => setNewOrder(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Опишите неисправность..."
              className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-0.5">Желаемое время</label>
            <input
              type="datetime-local"
              value={newOrder.time}
              onChange={e => setNewOrder(prev => ({ ...prev, time: e.target.value }))}
              className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="w-full text-xs font-semibold py-1.5 rounded-md text-white transition-colors"
            style={{ backgroundColor: brandColor }}
          >
            Отправить заявку
          </button>
        </div>
      )}
    </div>
  );
};

const PreviewEquipment = () => (
  <div className="p-3 space-y-2">
    <span className="text-xs font-semibold text-gray-700 block mb-2">Объекты и оборудование</span>
    {MOCK_EQUIPMENT.map(eq => {
      const cfg = EQUIPMENT_STATUS_CONFIG[eq.status];
      return (
        <div key={eq.id} className="border border-gray-100 rounded-lg p-2.5 bg-white hover:bg-gray-50 transition-colors">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <Icon name="AirVent" size={12} className="text-gray-400 flex-shrink-0" />
                <span className="text-xs font-medium text-gray-800 truncate">{eq.name}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{eq.model} · {eq.location}</p>
              <p className="text-xs text-gray-400 mt-0.5">Последнее ТО: {eq.lastService}</p>
            </div>
            <span className={`text-xs px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 flex items-center gap-1 ${cfg.color}`}>
              <Icon name={cfg.icon} size={10} />
              {cfg.label}
            </span>
          </div>
        </div>
      );
    })}
  </div>
);

const PreviewDocuments = () => (
  <div className="p-3 space-y-2">
    <span className="text-xs font-semibold text-gray-700 block mb-2">Акты и счета</span>
    {MOCK_DOCUMENTS.map(doc => (
      <div key={doc.id} className="border border-gray-100 rounded-lg p-2.5 bg-white flex items-center gap-2 hover:bg-gray-50 transition-colors">
        <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
          doc.type === 'act' ? 'bg-green-100' : 'bg-blue-100'
        }`}>
          <Icon name={doc.type === 'act' ? 'FileCheck' : 'Receipt'} size={14} className={doc.type === 'act' ? 'text-green-600' : 'text-blue-600'} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-800 truncate">{doc.name}</p>
          <p className="text-xs text-gray-500">{doc.date} · {doc.amount}</p>
        </div>
        <button
          onClick={() => toast.success(`Скачивание: ${doc.name}`)}
          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex-shrink-0"
          title="Скачать PDF"
        >
          <Icon name="Download" size={14} />
        </button>
      </div>
    ))}
  </div>
);

const PreviewPayment = ({ brandColor }: { brandColor: string }) => (
  <div className="p-3">
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 text-center mb-3">
      <Icon name="CreditCard" size={28} className="mx-auto mb-2 text-blue-500" />
      <p className="text-xs text-gray-500 mb-1">Итого к оплате</p>
      <p className="text-2xl font-bold text-gray-900">6 050 ₽</p>
      <p className="text-xs text-gray-500 mt-1">2 неоплаченных счёта</p>
    </div>
    <div className="space-y-2 mb-3">
      {[
        { num: 'INV-2026-00234', date: '10.05.2026', amount: '4 200 ₽' },
        { num: 'INV-2026-00218', date: '05.05.2026', amount: '1 850 ₽' },
      ].map(inv => (
        <div key={inv.num} className="flex items-center justify-between border border-gray-100 rounded-lg px-2.5 py-2 bg-white">
          <div>
            <p className="text-xs font-mono font-medium text-gray-800">#{inv.num}</p>
            <p className="text-xs text-gray-500">{inv.date}</p>
          </div>
          <span className="text-xs font-semibold text-gray-900">{inv.amount}</span>
        </div>
      ))}
    </div>
    <button
      onClick={() => toast.success('Переход к оплате… (в реальной системе откроется эквайринг)')}
      className="w-full text-xs font-semibold py-2 rounded-lg text-white transition-opacity hover:opacity-90"
      style={{ backgroundColor: brandColor }}
    >
      <Icon name="CreditCard" size={12} className="inline mr-1" />
      Оплатить 6 050 ₽
    </button>
  </div>
);

// ─── Right panel: Portal Preview ─────────────────────────────────────────────

const PortalPreview = ({ brandColor, logoUploaded }: PreviewPanelProps) => {
  const [activeTab, setActiveTab] = useState<PreviewTab>('orders');

  const tabs: { id: PreviewTab; label: string }[] = [
    { id: 'orders',    label: 'Мои заявки'   },
    { id: 'equipment', label: 'Оборудование' },
    { id: 'documents', label: 'Документы'    },
    { id: 'payment',   label: 'Оплата'       },
  ];

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Icon name="Monitor" size={14} className="text-gray-400" />
          Превью портала — ООО «Торговый центр Меркурий»
        </h3>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={() => toast.info('Портал открывается в браузере: portal.servisklimat.ru')}
        >
          <Icon name="ExternalLink" size={12} className="mr-1" />
          Открыть портал
        </Button>
      </div>

      {/* Browser chrome */}
      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-md flex-1 flex flex-col bg-white">
        {/* Browser toolbar */}
        <div className="bg-gray-100 px-3 py-2 flex items-center gap-2 border-b border-gray-200 flex-shrink-0">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 bg-red-400 rounded-full" />
            <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full" />
            <div className="w-2.5 h-2.5 bg-green-400 rounded-full" />
          </div>
          <div className="flex-1 bg-white rounded-md px-2 py-1 text-xs text-gray-500 font-mono border border-gray-200">
            🔒 portal.servisklimat.ru
          </div>
          <Icon name="RefreshCw" size={12} className="text-gray-400" />
        </div>

        {/* Portal header */}
        <div className="px-4 py-2.5 flex items-center justify-between flex-shrink-0" style={{ backgroundColor: brandColor }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
              {logoUploaded
                ? <Icon name="Building2" size={14} className="text-white" />
                : <span className="text-white font-bold text-xs">СК</span>
              }
            </div>
            <div>
              <p className="text-white font-semibold text-xs leading-tight">Сервис Климат</p>
              <p className="text-white/70 text-[10px]">Личный кабинет</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-white/90 text-[10px] font-medium">ООО «ТЦ Меркурий»</p>
              <p className="text-white/60 text-[10px]">Петрова А.В.</p>
            </div>
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <Icon name="User" size={12} className="text-white" />
            </div>
          </div>
        </div>

        {/* Portal tabs */}
        <div className="flex border-b border-gray-100 bg-white flex-shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 px-1 py-2 text-[10px] font-medium border-b-2 transition-colors whitespace-nowrap"
              style={activeTab === tab.id ? { borderBottomColor: brandColor, color: brandColor } : { borderBottomColor: 'transparent', color: '#6b7280' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {activeTab === 'orders'    && <PreviewOrders    brandColor={brandColor} />}
          {activeTab === 'equipment' && <PreviewEquipment />}
          {activeTab === 'documents' && <PreviewDocuments />}
          {activeTab === 'payment'   && <PreviewPayment   brandColor={brandColor} />}
        </div>
      </div>
    </div>
  );
};

// ─── Left panel: Settings ─────────────────────────────────────────────────────

interface SettingsPanelProps {
  settings: PortalSettings;
  onChange: (updated: PortalSettings) => void;
  onSave: () => void;
}

const SettingsPanel = ({ settings, onChange, onSave }: SettingsPanelProps) => {
  const toggleFeature = (key: string) => {
    onChange({
      ...settings,
      features: settings.features.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f),
    });
  };

  const toggleNotification = (key: string) => {
    onChange({
      ...settings,
      notifications: settings.notifications.map(n => n.key === key ? { ...n, enabled: !n.enabled } : n),
    });
  };

  const changeNotificationChannel = (key: string, channel: NotificationEvent['channel']) => {
    onChange({
      ...settings,
      notifications: settings.notifications.map(n => n.key === key ? { ...n, channel } : n),
    });
  };

  return (
    <div className="w-80 flex-shrink-0 flex flex-col gap-4 h-full overflow-y-auto pr-1">

      {/* Appearance */}
      <Card className="p-4 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Icon name="Palette" size={15} className="text-blue-600" />
          Внешний вид
        </h3>

        {/* Logo upload */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">Логотип компании</label>
          {settings.logoUrl ? (
            <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg bg-gray-50">
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                <Icon name="Building2" size={16} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">logo.png</p>
                <p className="text-xs text-gray-400">240×60 px</p>
              </div>
              <button
                onClick={() => onChange({ ...settings, logoUrl: '' })}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Icon name="Trash2" size={14} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => onChange({ ...settings, logoUrl: 'logo.png' })}
              className="border-2 border-dashed border-gray-200 rounded-lg p-3 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <Icon name="Upload" size={16} className="mx-auto mb-1 text-gray-400" />
              <p className="text-xs text-gray-500">Загрузить логотип</p>
              <p className="text-[10px] text-gray-400">PNG, SVG · до 2 МБ</p>
            </div>
          )}
        </div>

        {/* Brand color */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">Цвет бренда</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={settings.brandColor}
              onChange={e => onChange({ ...settings, brandColor: e.target.value })}
              className="w-9 h-9 rounded-lg cursor-pointer border border-gray-200 p-0.5 flex-shrink-0"
            />
            <Input
              value={settings.brandColor}
              onChange={e => {
                if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) {
                  onChange({ ...settings, brandColor: e.target.value });
                }
              }}
              className="font-mono text-xs h-9"
              placeholder="#2563eb"
            />
            <div className="w-9 h-9 rounded-lg border border-gray-200 flex-shrink-0" style={{ backgroundColor: settings.brandColor }} />
          </div>
          <div className="flex gap-1.5 mt-2">
            {['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#0891b2', '#ea580c'].map(c => (
              <button
                key={c}
                onClick={() => onChange({ ...settings, brandColor: c })}
                className={`w-6 h-6 rounded-full border-2 transition-all ${settings.brandColor === c ? 'border-gray-900 scale-110' : 'border-white shadow-sm'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Domain */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">Доменное имя</label>
          <div className="flex items-center gap-2">
            <Input
              value={settings.domain}
              onChange={e => onChange({ ...settings, domain: e.target.value })}
              className="font-mono text-xs h-9 flex-1"
            />
            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs whitespace-nowrap">Активен</Badge>
          </div>
        </div>
      </Card>

      {/* Features */}
      <Card className="p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Icon name="ToggleRight" size={15} className="text-blue-600" />
          Функции портала
        </h3>
        <div className="space-y-2">
          {settings.features.map(feature => (
            <div key={feature.key} className="flex items-center justify-between gap-2 py-1">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${feature.enabled ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <Icon name={feature.icon} size={14} className={feature.enabled ? 'text-blue-600' : 'text-gray-400'} />
                </div>
                <span className={`text-xs font-medium truncate ${feature.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                  {feature.label}
                </span>
              </div>
              <Switch
                checked={feature.enabled}
                onCheckedChange={() => toggleFeature(feature.key)}
                className="flex-shrink-0"
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Icon name="Bell" size={15} className="text-blue-600" />
          Уведомления клиентам
        </h3>
        <div className="space-y-2.5">
          {settings.notifications.map(notif => (
            <div key={notif.key}>
              <div className="flex items-center gap-2">
                <Switch
                  checked={notif.enabled}
                  onCheckedChange={() => toggleNotification(notif.key)}
                  className="flex-shrink-0"
                />
                <span className={`text-xs font-medium flex-1 min-w-0 truncate ${notif.enabled ? 'text-gray-800' : 'text-gray-400'}`}>
                  {notif.label}
                </span>
                {notif.enabled && (
                  <select
                    value={notif.channel}
                    onChange={e => changeNotificationChannel(notif.key, e.target.value as NotificationEvent['channel'])}
                    className="text-xs border border-gray-200 rounded-md px-1.5 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 flex-shrink-0"
                  >
                    {CHANNEL_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}
              </div>
              <Separator className="mt-2.5" />
            </div>
          ))}
        </div>
      </Card>

      {/* Save button */}
      <Button className="w-full" onClick={onSave}>
        <Icon name="Save" size={14} className="mr-2" />
        Сохранить настройки
      </Button>
    </div>
  );
};

// ─── Root component ───────────────────────────────────────────────────────────

const ClientPortalFull = () => {
  const [settings, setSettings] = useState<PortalSettings>({
    logoUrl: '',
    brandColor: '#2563eb',
    domain: 'portal.servisklimat.ru',
    features: INITIAL_FEATURES,
    notifications: INITIAL_NOTIFICATIONS,
  });

  const handleSave = () => {
    const enabledFeatures = settings.features.filter(f => f.enabled).length;
    const enabledNotifs   = settings.notifications.filter(n => n.enabled).length;
    toast.success(`Настройки сохранены — ${enabledFeatures} функций, ${enabledNotifs} уведомлений активны`);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Page header */}
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Icon name="Globe" size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Клиентский портал</h2>
            <p className="text-gray-500 text-sm">Настройки и превью личного кабинета клиента</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs px-2.5 py-1">
            <Icon name="Globe" size={11} className="mr-1 inline" />
            {settings.domain}
          </Badge>
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-xs text-green-700 font-medium">Активен</span>
        </div>
      </div>

      {/* Main layout: left settings + right preview */}
      <div className="flex gap-5 flex-1 min-h-0">
        <SettingsPanel
          settings={settings}
          onChange={setSettings}
          onSave={handleSave}
        />
        <PortalPreview
          brandColor={settings.brandColor}
          logoUploaded={!!settings.logoUrl}
        />
      </div>
    </div>
  );
};

export default ClientPortalFull;
