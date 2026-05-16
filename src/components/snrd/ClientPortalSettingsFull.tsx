import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PortalFeature {
  key: string;
  label: string;
  description: string;
  icon: string;
  enabled: boolean;
}

interface PortalUser {
  id: string;
  name: string;
  company: string;
  email: string;
  role: 'Владелец' | 'Пользователь';
  status: 'Активен' | 'Ожидает' | 'Заблокирован';
  lastLogin: string;
}

interface PopularFeature {
  name: string;
  usages: number;
  percent: number;
}

interface ActivityEvent {
  id: string;
  user: string;
  company: string;
  action: string;
  time: string;
  icon: string;
  color: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_FEATURES: PortalFeature[] = [
  { key: 'view_orders',    label: 'Просмотр заявок',          description: 'Клиент видит все свои активные и завершённые заявки',         icon: 'ClipboardList', enabled: true  },
  { key: 'create_orders',  label: 'Создание заявок',           description: 'Клиент может самостоятельно оформить новую заявку',           icon: 'PlusCircle',    enabled: false },
  { key: 'pay_invoices',   label: 'Оплата счетов',             description: 'Онлайн-оплата через эквайринг прямо в портале',              icon: 'CreditCard',    enabled: false },
  { key: 'download_acts',  label: 'Скачивание актов',          description: 'Доступ к актам выполненных работ и счетам в PDF',            icon: 'Download',      enabled: true  },
  { key: 'sign_docs',      label: 'Подписание документов',     description: 'Электронная подпись через Диадок',                           icon: 'PenLine',       enabled: false },
  { key: 'support_chat',   label: 'Чат поддержки',             description: 'Переписка с диспетчером в рамках заявки',                   icon: 'MessageSquare', enabled: true  },
  { key: 'equipment_hist', label: 'История оборудования',      description: 'Журнал обслуживания каждой единицы оборудования клиента',    icon: 'History',       enabled: true  },
  { key: 'reviews',        label: 'Рейтинг / Отзывы',          description: 'Оценка работы инженера после завершения',                   icon: 'Star',          enabled: true  },
  { key: 'sms_notif',      label: 'Уведомления SMS',            description: 'Автоматические SMS при изменении статуса заявки',           icon: 'Smartphone',    enabled: true  },
  { key: 'email_notif',    label: 'Уведомления Email',          description: 'Email-рассылка по событиям (назначение, закрытие, ТО)',     icon: 'Mail',          enabled: true  },
];

const PORTAL_USERS: PortalUser[] = [
  { id: 'u1', name: 'Иванова Мария Сергеевна',   company: 'ТК Северный',    email: 'ivanova@tk-sever.ru',    role: 'Владелец',     status: 'Активен',    lastLogin: '16.05.2026 09:42' },
  { id: 'u2', name: 'Петров Алексей Борисович',  company: 'ТК Северный',    email: 'petrov@tk-sever.ru',     role: 'Пользователь', status: 'Активен',    lastLogin: '15.05.2026 17:08' },
  { id: 'u3', name: 'Смирнова Ольга Владимировна', company: 'ТЦ Мираж',    email: 'smirnova@tc-mirazh.ru', role: 'Владелец',     status: 'Активен',    lastLogin: '16.05.2026 11:15' },
  { id: 'u4', name: 'Козлов Дмитрий Иванович',   company: 'АО ТрансСервис', email: 'kozlov@transs.ru',       role: 'Пользователь', status: 'Ожидает',    lastLogin: 'Ещё не входил'    },
  { id: 'u5', name: 'Новикова Елена Андреевна',  company: 'Сеть АЗС Лукойл', email: 'novikova@lukoil.ru',  role: 'Владелец',     status: 'Активен',    lastLogin: '14.05.2026 08:33' },
  { id: 'u6', name: 'Фёдоров Кирилл Павлович',   company: 'БЦ Горизонт',    email: 'fedorov@gorizont.biz',   role: 'Пользователь', status: 'Заблокирован', lastLogin: '02.04.2026 16:01' },
  { id: 'u7', name: 'Морозова Наталья Юрьевна',  company: 'Кулинария №5',   email: 'morozova@kul5.ru',       role: 'Владелец',     status: 'Активен',    lastLogin: '16.05.2026 07:55' },
  { id: 'u8', name: 'Захаров Антон Геннадьевич', company: 'Аптека Здоровье', email: 'zakharov@apteka-z.ru', role: 'Пользователь', status: 'Ожидает',    lastLogin: 'Ещё не входил'    },
];

const POPULAR_FEATURES: PopularFeature[] = [
  { name: 'Просмотр заявок',      usages: 634, percent: 75 },
  { name: 'Скачивание актов',     usages: 298, percent: 35 },
  { name: 'Чат поддержки',        usages: 211, percent: 25 },
  { name: 'История оборудования', usages: 187, percent: 22 },
  { name: 'Рейтинг / Отзывы',     usages: 143, percent: 17 },
  { name: 'Создание заявок',      usages: 89,  percent: 11 },
];

const ACTIVITY_EVENTS: ActivityEvent[] = [
  { id: 'a1', user: 'Иванова М.С.',   company: 'ТК Северный',    action: 'Скачала акт по заявке WO-2026-000041',      time: '10 мин назад',    icon: 'Download',      color: 'text-blue-500'   },
  { id: 'a2', user: 'Смирнова О.В.',  company: 'ТЦ Мираж',       action: 'Оставила оценку 5★ для инженера Сидорова', time: '34 мин назад',    icon: 'Star',          color: 'text-yellow-500' },
  { id: 'a3', user: 'Новикова Е.А.',  company: 'Сеть АЗС Лукойл', action: 'Открыла чат по заявке WO-2026-000038',    time: '1 ч назад',       icon: 'MessageSquare', color: 'text-green-500'  },
  { id: 'a4', user: 'Морозова Н.Ю.',  company: 'Кулинария №5',    action: 'Просмотрела историю оборудования #EQ-007', time: '2 ч назад',       icon: 'History',       color: 'text-purple-500' },
  { id: 'a5', user: 'Петров А.Б.',    company: 'ТК Северный',     action: 'Создал заявку через портал (кондиционер)', time: '3 ч назад',       icon: 'PlusCircle',    color: 'text-indigo-500' },
  { id: 'a6', user: 'Новикова Е.А.',  company: 'Сеть АЗС Лукойл', action: 'Оплатила счёт #INV-2026-00234 (8 400 ₽)', time: '5 ч назад',       icon: 'CreditCard',    color: 'text-emerald-500'},
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
  <button
    onClick={onToggle}
    className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 ${enabled ? 'bg-blue-600' : 'bg-gray-200'}`}
  >
    <span
      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`}
    />
  </button>
);

const StatusBadge = ({ status }: { status: PortalUser['status'] }) => {
  const map: Record<PortalUser['status'], string> = {
    'Активен':     'bg-green-100 text-green-700 border-green-200',
    'Ожидает':     'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Заблокирован':'bg-red-100 text-red-700 border-red-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${map[status]}`}>
      {status}
    </span>
  );
};

// ─── Invite Modal ─────────────────────────────────────────────────────────────

const InviteModal = ({ onClose }: { onClose: () => void }) => {
  const [email, setEmail]   = useState('');
  const [role,  setRole]    = useState<'Владелец' | 'Пользователь'>('Пользователь');
  const [company, setCompany] = useState('');

  const handleSend = () => {
    if (!email.trim()) { toast.error('Укажите email'); return; }
    toast.success(`Приглашение отправлено на ${email}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-[440px] p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900 text-lg">Пригласить пользователя</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
            <Input
              type="email"
              placeholder="user@company.ru"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Компания (необязательно)</label>
            <Input
              placeholder="Название организации"
              value={company}
              onChange={e => setCompany(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Роль</label>
            <div className="grid grid-cols-2 gap-2">
              {(['Пользователь', 'Владелец'] as const).map(r => (
                <label
                  key={r}
                  className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${role === r ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <input
                    type="radio"
                    name="role"
                    checked={role === r}
                    onChange={() => setRole(r)}
                    className="accent-blue-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r}</p>
                    <p className="text-xs text-gray-500">
                      {r === 'Владелец' ? 'Полный доступ' : 'Базовый доступ'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSend}>
            <Icon name="Send" size={14} className="mr-2" />
            Отправить приглашение
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Tab: Branding ────────────────────────────────────────────────────────────

const BrandingTab = () => {
  const [accentColor,  setAccentColor]  = useState('#2563eb');
  const [hexInput,     setHexInput]     = useState('#2563eb');
  const [portalName,   setPortalName]   = useState('Сервис Климат — Личный кабинет');
  const [domain,       setDomain]       = useState('portal.servisklimat.ru');
  const [welcomeMsg,   setWelcomeMsg]   = useState('Добро пожаловать! Здесь вы можете отслеживать ваши заявки, скачивать документы и общаться с нашей службой поддержки.');
  const [logoUploaded, setLogoUploaded] = useState(false);

  const handleColorChange = (value: string) => {
    setAccentColor(value);
    setHexInput(value);
  };

  const handleHexInput = (value: string) => {
    setHexInput(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) setAccentColor(value);
  };

  const handleSave = () => toast.success('Настройки брендинга сохранены');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Left: settings */}
        <div className="space-y-5">
          {/* Logo */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Icon name="Image" size={16} className="text-blue-600" />
              Логотип
            </h3>
            {logoUploaded ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="Building2" size={24} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">logo_servisklimat.png</p>
                  <p className="text-xs text-gray-500">PNG 240×60 px · 18 KB</p>
                </div>
                <button onClick={() => setLogoUploaded(false)} className="text-gray-400 hover:text-red-500">
                  <Icon name="Trash2" size={16} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => setLogoUploaded(true)}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <Icon name="Upload" size={24} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Перетащите файл или <span className="text-blue-600 underline">выберите</span></p>
                <p className="text-xs text-gray-400 mt-1">PNG, SVG, JPG · до 2 МБ · рекомендуется 240×60 px</p>
              </div>
            )}
          </div>

          {/* Accent color */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Icon name="Palette" size={16} className="text-blue-600" />
              Цвет акцента
            </h3>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={accentColor}
                onChange={e => handleColorChange(e.target.value)}
                className="w-12 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5"
              />
              <Input
                value={hexInput}
                onChange={e => handleHexInput(e.target.value)}
                placeholder="#2563eb"
                className="font-mono text-sm"
              />
              <div className="w-10 h-10 rounded-lg border border-gray-200 flex-shrink-0" style={{ backgroundColor: accentColor }} />
            </div>
            <div className="flex gap-2 mt-3">
              {['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#0891b2', '#ea580c'].map(c => (
                <button
                  key={c}
                  onClick={() => handleColorChange(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${accentColor === c ? 'border-gray-900 scale-110' : 'border-white'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Portal name & domain */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Icon name="Globe" size={16} className="text-blue-600" />
              Идентификация портала
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Название портала</label>
                <Input value={portalName} onChange={e => setPortalName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Домен</label>
                <div className="flex items-center gap-2">
                  <Input value={domain} onChange={e => setDomain(e.target.value)} className="font-mono text-sm" />
                  <Badge className="bg-green-100 text-green-700 border-green-200 whitespace-nowrap text-xs">Активен</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Welcome message */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Icon name="MessageCircle" size={16} className="text-blue-600" />
              Приветственное сообщение
            </h3>
            <textarea
              rows={4}
              value={welcomeMsg}
              onChange={e => setWelcomeMsg(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p className="text-xs text-gray-400 mt-1">{welcomeMsg.length} / 300 символов</p>
          </div>
        </div>

        {/* Right: preview */}
        <div className="sticky top-6 self-start">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Icon name="Eye" size={16} className="text-blue-600" />
              Предпросмотр портала
            </h3>

            {/* Browser chrome mock */}
            <div className="border border-gray-300 rounded-xl overflow-hidden shadow-lg">
              {/* Browser toolbar */}
              <div className="bg-gray-100 px-3 py-2 flex items-center gap-2 border-b border-gray-200">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                  <div className="w-3 h-3 bg-green-400 rounded-full" />
                </div>
                <div className="flex-1 bg-white rounded-md px-2 py-1 text-xs text-gray-500 font-mono border border-gray-200">
                  🔒 {domain}
                </div>
              </div>

              {/* Portal header */}
              <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: accentColor }}>
                <div className="flex items-center gap-2">
                  {logoUploaded ? (
                    <div className="w-7 h-7 bg-white/20 rounded flex items-center justify-center">
                      <Icon name="Building2" size={14} className="text-white" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 bg-white/20 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-xs">СК</span>
                    </div>
                  )}
                  <span className="text-white font-semibold text-sm">{portalName.split('—')[0].trim()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white/80 text-xs">Иванова М.С.</span>
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <Icon name="User" size={12} className="text-white" />
                  </div>
                </div>
              </div>

              {/* Portal nav */}
              <div className="flex gap-0 border-b border-gray-200 bg-white">
                {['Заявки', 'Оборудование', 'Документы', 'Чат'].map((tab, i) => (
                  <div
                    key={tab}
                    className={`px-3 py-2 text-xs font-medium border-b-2 ${i === 0 ? 'border-b-2 text-blue-700' : 'border-transparent text-gray-500'}`}
                    style={i === 0 ? { borderBottomColor: accentColor, color: accentColor } : {}}
                  >
                    {tab}
                  </div>
                ))}
              </div>

              {/* Welcome banner */}
              <div className="p-4 bg-blue-50" style={{ backgroundColor: accentColor + '12' }}>
                <p className="text-sm text-gray-700 leading-relaxed">{welcomeMsg}</p>
              </div>

              {/* Mock order cards */}
              <div className="p-4 bg-white space-y-2">
                {[
                  { num: 'WO-2026-000041', status: 'Выполнен',   color: 'bg-green-100 text-green-700' },
                  { num: 'WO-2026-000038', status: 'В работе',   color: 'bg-blue-100 text-blue-700'   },
                  { num: 'WO-2026-000031', status: 'Закрыт',     color: 'bg-gray-100 text-gray-600'   },
                ].map(order => (
                  <div key={order.num} className="flex items-center justify-between p-2.5 border border-gray-100 rounded-lg">
                    <div>
                      <p className="text-xs font-mono font-medium text-gray-800">{order.num}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Ремонт кондиционера</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${order.color}`}>{order.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Icon name="Save" size={14} className="mr-2" />
          Сохранить брендинг
        </Button>
      </div>
    </div>
  );
};

// ─── Tab: Features ────────────────────────────────────────────────────────────

const FeaturesTab = () => {
  const [features, setFeatures] = useState<PortalFeature[]>(INITIAL_FEATURES);

  const toggle = (key: string) => {
    setFeatures(prev => prev.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f));
  };

  const handleSave = () => {
    const enabled = features.filter(f => f.enabled).length;
    toast.success(`Настройки сохранены — ${enabled} из ${features.length} функций активны`);
  };

  const enabledCount = features.filter(f => f.enabled).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <div className="flex items-center gap-3">
          <Icon name="ToggleRight" size={20} className="text-blue-600" />
          <div>
            <p className="text-sm font-semibold text-blue-900">Активных функций: {enabledCount} / {features.length}</p>
            <p className="text-xs text-blue-700">Отключённые функции скрыты для всех пользователей портала</p>
          </div>
        </div>
        <Button onClick={handleSave}>
          <Icon name="Save" size={14} className="mr-2" />
          Сохранить
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {features.map(feature => (
          <div
            key={feature.key}
            className={`flex items-center gap-3 p-4 border rounded-xl transition-colors ${feature.enabled ? 'border-blue-200 bg-blue-50/40' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${feature.enabled ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <Icon name={feature.icon} size={18} className={feature.enabled ? 'text-blue-600' : 'text-gray-400'} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">{feature.label}</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{feature.description}</p>
            </div>
            <Toggle enabled={feature.enabled} onToggle={() => toggle(feature.key)} />
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Tab: Users ───────────────────────────────────────────────────────────────

const UsersTab = () => {
  const [users, setUsers]         = useState<PortalUser[]>(PORTAL_USERS);
  const [showInvite, setShowInvite] = useState(false);

  const blockUser = (id: string) => {
    setUsers(prev => prev.map(u =>
      u.id === id
        ? { ...u, status: u.status === 'Заблокирован' ? 'Активен' : 'Заблокирован' }
        : u
    ));
    const user = users.find(u => u.id === id);
    if (!user) return;
    toast.success(
      user.status === 'Заблокирован'
        ? `${user.name} разблокирован`
        : `${user.name} заблокирован`
    );
  };

  const resetPassword = (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    toast.success(`Ссылка для сброса пароля отправлена на ${user.email}`);
  };

  const activeCount  = users.filter(u => u.status === 'Активен').length;
  const pendingCount = users.filter(u => u.status === 'Ожидает').length;
  const blockedCount = users.filter(u => u.status === 'Заблокирован').length;

  return (
    <div className="space-y-5">
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Активных',     value: activeCount,  color: 'text-green-600', bg: 'bg-green-50', icon: 'UserCheck'  },
          { label: 'Ожидает входа', value: pendingCount, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: 'UserClock' },
          { label: 'Заблокировано', value: blockedCount, color: 'text-red-600',   bg: 'bg-red-50',   icon: 'UserX'     },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} border border-gray-200 rounded-xl p-4 flex items-center gap-3`}>
            <Icon name={stat.icon} size={24} className={stat.color} />
            <div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-600">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Пользователи портала</h3>
        <Button onClick={() => setShowInvite(true)}>
          <Icon name="UserPlus" size={14} className="mr-2" />
          Пригласить пользователя
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Контакт</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Компания</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Роль</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Статус</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Последний вход</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-blue-700">
                        {user.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{user.company}</td>
                <td className="px-4 py-3">
                  <Badge className={`text-xs ${user.role === 'Владелец' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {user.role}
                  </Badge>
                </td>
                <td className="px-4 py-3"><StatusBadge status={user.status} /></td>
                <td className="px-4 py-3 text-xs text-gray-500 font-mono">{user.lastLogin}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={() => resetPassword(user.id)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Сбросить пароль"
                    >
                      <Icon name="KeyRound" size={14} />
                    </button>
                    <button
                      onClick={() => blockUser(user.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        user.status === 'Заблокирован'
                          ? 'text-green-500 hover:text-green-700 hover:bg-green-50'
                          : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                      }`}
                      title={user.status === 'Заблокирован' ? 'Разблокировать' : 'Заблокировать'}
                    >
                      <Icon name={user.status === 'Заблокирован' ? 'UserCheck' : 'UserX'} size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Tab: Analytics ───────────────────────────────────────────────────────────

const AnalyticsTab = () => {
  const kpis = [
    { label: 'Активных пользователей',   value: '23',   sub: '+3 за месяц',  icon: 'Users',       bg: 'bg-blue-50',   color: 'text-blue-600'   },
    { label: 'Визитов / месяц',          value: '847',  sub: '+12% vs пред.',icon: 'BarChart2',   bg: 'bg-purple-50', color: 'text-purple-600' },
    { label: 'Заявок через портал',      value: '34%',  sub: '34 из 100',    icon: 'TrendingUp',  bg: 'bg-green-50',  color: 'text-green-600'  },
    { label: 'NPS клиентского портала',  value: '78',   sub: 'Отлично',      icon: 'ThumbsUp',    bg: 'bg-yellow-50', color: 'text-yellow-600' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className={`${kpi.bg} border border-gray-200 rounded-xl p-4`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center`}>
                <Icon name={kpi.icon} size={18} className={kpi.color} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs font-medium text-gray-700 mt-0.5">{kpi.label}</p>
            <p className="text-xs text-gray-500 mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Popular features table */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Icon name="Star" size={16} className="text-blue-600" />
            Популярные функции
          </h3>
          <div className="space-y-3">
            {POPULAR_FEATURES.map((feat, idx) => (
              <div key={feat.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-400 w-4">{idx + 1}</span>
                    <span className="text-sm text-gray-800">{feat.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">{feat.usages}</span>
                    <span className="text-xs text-gray-500 w-8 text-right">{feat.percent}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${feat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity timeline */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Icon name="Activity" size={16} className="text-blue-600" />
            Последние действия клиентов
          </h3>
          <div className="space-y-0">
            {ACTIVITY_EVENTS.map((event, idx) => (
              <div key={event.id} className="flex gap-3">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full bg-gray-50 border-2 border-gray-200 flex items-center justify-center flex-shrink-0`}>
                    <Icon name={event.icon} size={14} className={event.color} />
                  </div>
                  {idx < ACTIVITY_EVENTS.length - 1 && (
                    <div className="w-px flex-1 bg-gray-100 my-1" style={{ minHeight: 16 }} />
                  )}
                </div>
                {/* Content */}
                <div className="pb-4 flex-1">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-sm font-medium text-gray-900">{event.user}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-500">{event.company}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{event.action}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Engagement note */}
      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
        <Icon name="Lightbulb" size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Рекомендация</p>
          <p className="text-sm text-amber-700 mt-0.5">
            У 2 пользователей статус «Ожидает» дольше 7 дней. Отправьте повторное приглашение или
            свяжитесь с клиентами напрямую, чтобы увеличить вовлечённость.
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Root component ───────────────────────────────────────────────────────────

type TabId = 'branding' | 'features' | 'users' | 'analytics';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'branding',   label: 'Брендинг',           icon: 'Palette'      },
  { id: 'features',   label: 'Функции портала',     icon: 'ToggleRight'  },
  { id: 'users',      label: 'Пользователи',        icon: 'Users'        },
  { id: 'analytics',  label: 'Аналитика',           icon: 'BarChart2'    },
];

const ClientPortalSettingsFull = () => {
  const [activeTab, setActiveTab] = useState<TabId>('branding');

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Icon name="Globe" size={22} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Клиентский портал</h2>
            <p className="text-gray-500 text-sm">Настройка личного кабинета для клиентов</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-700 border-green-200 text-sm px-3 py-1">
            <Icon name="Globe" size={12} className="mr-1 inline" />
            portal.servisklimat.ru
          </Badge>
          <Button
            variant="outline"
            onClick={() => toast.info('Открываем предпросмотр…')}
          >
            <Icon name="ExternalLink" size={14} className="mr-2" />
            Открыть портал
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <Icon name={tab.icon} size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'branding'   && <BrandingTab />}
      {activeTab === 'features'   && <FeaturesTab />}
      {activeTab === 'users'      && <UsersTab />}
      {activeTab === 'analytics'  && <AnalyticsTab />}
    </div>
  );
};

export default ClientPortalSettingsFull;
