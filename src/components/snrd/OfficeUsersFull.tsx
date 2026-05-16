import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = 'Администратор' | 'Диспетчер' | 'Менеджер' | 'Бухгалтер' | 'HR' | 'Руководитель';
type StatusFilter = 'all' | 'active' | 'blocked';

interface Session {
  device: string;
  ip: string;
  time: string;
}

interface OfficeUser {
  id: string;
  fullName: string;
  role: Role;
  department: string;
  email: string;
  phone: string;
  createdAt: string;
  lastLogin: string;
  isActive: boolean;
  permissions: string[];
  sessions: Session[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_PERMISSIONS = [
  'Просмотр нарядов',
  'Редактирование нарядов',
  'Удаление нарядов',
  'Управление клиентами',
  'Финансовые отчёты',
  'Управление сотрудниками',
  'Настройки системы',
  'Экспорт данных',
  'Управление складом',
  'Планирование ТО',
  'CRM и воронка продаж',
  'HR и зарплата',
];

const ROLES: Role[] = ['Администратор', 'Диспетчер', 'Менеджер', 'Бухгалтер', 'HR', 'Руководитель'];

const DEPARTMENTS = ['Диспетчерская', 'Отдел продаж', 'Бухгалтерия', 'HR', 'IT', 'Руководство'];

const ROLE_COLORS: Record<Role, string> = {
  Администратор: 'bg-red-100 text-red-700 border-red-200',
  Диспетчер:     'bg-blue-100 text-blue-700 border-blue-200',
  Менеджер:      'bg-orange-100 text-orange-700 border-orange-200',
  Бухгалтер:     'bg-green-100 text-green-700 border-green-200',
  HR:            'bg-pink-100 text-pink-700 border-pink-200',
  Руководитель:  'bg-purple-100 text-purple-700 border-purple-200',
};

const ROLE_PERMISSIONS: Record<Role, string[]> = {
  Администратор: ALL_PERMISSIONS,
  Руководитель:  ['Просмотр нарядов', 'Редактирование нарядов', 'Удаление нарядов', 'Управление клиентами', 'Финансовые отчёты', 'Управление сотрудниками', 'Экспорт данных', 'CRM и воронка продаж'],
  Диспетчер:     ['Просмотр нарядов', 'Редактирование нарядов', 'Управление клиентами', 'Планирование ТО'],
  Менеджер:      ['Просмотр нарядов', 'Управление клиентами', 'Экспорт данных', 'CRM и воронка продаж'],
  Бухгалтер:     ['Финансовые отчёты', 'Экспорт данных', 'Просмотр нарядов'],
  HR:            ['Управление сотрудниками', 'HR и зарплата', 'Экспорт данных'],
};

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Администратор: 'Полный доступ ко всем модулям системы, управление пользователями и настройками.',
  Руководитель:  'Доступ к аналитике, отчётам, CRM и управлению персоналом.',
  Диспетчер:     'Управление нарядами, назначение инженеров, планирование ТО.',
  Менеджер:      'Работа с клиентами, CRM, формирование КП и сделок.',
  Бухгалтер:     'Финансовые отчёты, счета, акты, экспорт данных для 1С.',
  HR:            'Управление сотрудниками, расчёт зарплаты, кадровые документы.',
};

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
  'bg-red-500', 'bg-teal-500', 'bg-pink-500', 'bg-indigo-500',
  'bg-yellow-600', 'bg-cyan-600', 'bg-rose-500', 'bg-violet-500',
  'bg-emerald-500', 'bg-amber-500', 'bg-sky-500',
];

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockUsers: OfficeUser[] = [
  {
    id: 'U001', fullName: 'Волков Игорь Сергеевич', role: 'Администратор',
    department: 'IT', email: 'volkov@servisklimat.ru', phone: '+7 (495) 100-01-07',
    createdAt: '12.01.2023', lastLogin: '16.05.2026 07:30', isActive: true,
    permissions: ALL_PERMISSIONS,
    sessions: [
      { device: 'Windows PC / Chrome', ip: '192.168.1.15', time: '16.05.2026 07:30' },
      { device: 'iPhone 14 / Safari', ip: '5.18.204.11', time: '15.05.2026 22:15' },
    ],
  },
  {
    id: 'U002', fullName: 'Петрова Анна Сергеевна', role: 'Руководитель',
    department: 'Руководство', email: 'petrova@servisklimat.ru', phone: '+7 (495) 100-01-01',
    createdAt: '15.02.2023', lastLogin: '16.05.2026 09:15', isActive: true,
    permissions: ROLE_PERMISSIONS['Руководитель'],
    sessions: [
      { device: 'MacBook Pro / Chrome', ip: '192.168.1.5', time: '16.05.2026 09:15' },
      { device: 'iPad Pro / Safari', ip: '95.165.88.3', time: '15.05.2026 20:40' },
      { device: 'Android / Firefox', ip: '46.73.212.9', time: '14.05.2026 18:00' },
    ],
  },
  {
    id: 'U003', fullName: 'Козлова Мария Ивановна', role: 'Диспетчер',
    department: 'Диспетчерская', email: 'kozlova@servisklimat.ru', phone: '+7 (495) 100-01-02',
    createdAt: '03.03.2023', lastLogin: '16.05.2026 08:47', isActive: true,
    permissions: ROLE_PERMISSIONS['Диспетчер'],
    sessions: [{ device: 'Windows PC / Edge', ip: '192.168.1.22', time: '16.05.2026 08:47' }],
  },
  {
    id: 'U004', fullName: 'Фёдоров Дмитрий Александрович', role: 'Диспетчер',
    department: 'Диспетчерская', email: 'fedorov@servisklimat.ru', phone: '+7 (495) 100-01-03',
    createdAt: '10.03.2023', lastLogin: '15.05.2026 18:30', isActive: true,
    permissions: ROLE_PERMISSIONS['Диспетчер'],
    sessions: [{ device: 'Linux / Firefox', ip: '192.168.1.31', time: '15.05.2026 18:30' }],
  },
  {
    id: 'U005', fullName: 'Николаева Светлана Петровна', role: 'Бухгалтер',
    department: 'Бухгалтерия', email: 'nikolaeva@servisklimat.ru', phone: '+7 (495) 100-01-04',
    createdAt: '20.03.2023', lastLogin: '16.05.2026 10:02', isActive: true,
    permissions: ROLE_PERMISSIONS['Бухгалтер'],
    sessions: [{ device: 'Windows PC / Chrome', ip: '192.168.1.18', time: '16.05.2026 10:02' }],
  },
  {
    id: 'U006', fullName: 'Смирнов Алексей Николаевич', role: 'Менеджер',
    department: 'Отдел продаж', email: 'smirnov@servisklimat.ru', phone: '+7 (495) 100-01-05',
    createdAt: '01.04.2023', lastLogin: '16.05.2026 11:20', isActive: true,
    permissions: ROLE_PERMISSIONS['Менеджер'],
    sessions: [
      { device: 'MacBook Air / Safari', ip: '192.168.1.44', time: '16.05.2026 11:20' },
      { device: 'iPhone 13 / Safari', ip: '95.165.44.22', time: '16.05.2026 09:00' },
    ],
  },
  {
    id: 'U007', fullName: 'Морозова Екатерина Владимировна', role: 'Менеджер',
    department: 'Отдел продаж', email: 'morozova@servisklimat.ru', phone: '+7 (495) 100-01-06',
    createdAt: '05.04.2023', lastLogin: '14.05.2026 14:45', isActive: true,
    permissions: ROLE_PERMISSIONS['Менеджер'],
    sessions: [{ device: 'Windows PC / Chrome', ip: '192.168.1.55', time: '14.05.2026 14:45' }],
  },
  {
    id: 'U008', fullName: 'Лебедева Татьяна Юрьевна', role: 'Менеджер',
    department: 'Отдел продаж', email: 'lebedeva@servisklimat.ru', phone: '+7 (495) 100-01-10',
    createdAt: '15.04.2023', lastLogin: '16.05.2026 08:55', isActive: true,
    permissions: ROLE_PERMISSIONS['Менеджер'],
    sessions: [{ device: 'MacBook Pro / Chrome', ip: '192.168.1.60', time: '16.05.2026 08:55' }],
  },
  {
    id: 'U009', fullName: 'Громова Ирина Олеговна', role: 'HR',
    department: 'HR', email: 'gromova@servisklimat.ru', phone: '+7 (495) 100-01-11',
    createdAt: '20.04.2023', lastLogin: '16.05.2026 09:40', isActive: true,
    permissions: ROLE_PERMISSIONS['HR'],
    sessions: [{ device: 'Windows PC / Chrome', ip: '192.168.1.70', time: '16.05.2026 09:40' }],
  },
  {
    id: 'U010', fullName: 'Кузнецов Роман Витальевич', role: 'Диспетчер',
    department: 'Диспетчерская', email: 'kuznetsov@servisklimat.ru', phone: '+7 (495) 100-01-12',
    createdAt: '02.05.2023', lastLogin: '16.05.2026 07:55', isActive: true,
    permissions: ROLE_PERMISSIONS['Диспетчер'],
    sessions: [{ device: 'Linux / Chromium', ip: '192.168.1.80', time: '16.05.2026 07:55' }],
  },
  {
    id: 'U011', fullName: 'Орлова Наталья Борисовна', role: 'Бухгалтер',
    department: 'Бухгалтерия', email: 'orlova@servisklimat.ru', phone: '+7 (495) 100-01-13',
    createdAt: '10.05.2023', lastLogin: '16.05.2026 10:30', isActive: true,
    permissions: ROLE_PERMISSIONS['Бухгалтер'],
    sessions: [{ device: 'Windows PC / Edge', ip: '192.168.1.90', time: '16.05.2026 10:30' }],
  },
  {
    id: 'U012', fullName: 'Захаров Виктор Павлович', role: 'Менеджер',
    department: 'Отдел продаж', email: 'zakharov@servisklimat.ru', phone: '+7 (495) 100-01-14',
    createdAt: '15.05.2023', lastLogin: '15.05.2026 16:20', isActive: true,
    permissions: ROLE_PERMISSIONS['Менеджер'],
    sessions: [{ device: 'MacBook Air / Chrome', ip: '192.168.1.95', time: '15.05.2026 16:20' }],
  },
  {
    id: 'U013', fullName: 'Зайцева Ольга Михайловна', role: 'Диспетчер',
    department: 'Диспетчерская', email: 'zaitseva@servisklimat.ru', phone: '+7 (495) 100-01-08',
    createdAt: '01.06.2023', lastLogin: '08.05.2026 16:00', isActive: false,
    permissions: ROLE_PERMISSIONS['Диспетчер'],
    sessions: [],
  },
  {
    id: 'U014', fullName: 'Попов Владимир Андреевич', role: 'Бухгалтер',
    department: 'Бухгалтерия', email: 'popov@servisklimat.ru', phone: '+7 (495) 100-01-09',
    createdAt: '10.06.2023', lastLogin: '07.05.2026 09:10', isActive: false,
    permissions: ROLE_PERMISSIONS['Бухгалтер'],
    sessions: [],
  },
  {
    id: 'U015', fullName: 'Титова Валерия Степановна', role: 'HR',
    department: 'HR', email: 'titova@servisklimat.ru', phone: '+7 (495) 100-01-15',
    createdAt: '20.06.2023', lastLogin: '05.05.2026 11:00', isActive: false,
    permissions: ROLE_PERMISSIONS['HR'],
    sessions: [],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: number;
  icon: string;
  color: string;
}

const MetricCard = ({ label, value, icon, color }: MetricCardProps) => (
  <Card>
    <CardContent className="pt-5 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon name={icon} size={22} className="text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// ─── Detail Panel ─────────────────────────────────────────────────────────────

interface DetailPanelProps {
  user: OfficeUser;
  avatarColor: string;
  onClose: () => void;
  onEdit: () => void;
  onBlock: () => void;
}

const DetailPanel = ({ user, avatarColor, onClose, onEdit, onBlock }: DetailPanelProps) => (
  <div className="w-80 flex-shrink-0 border-l border-gray-200 bg-white overflow-y-auto">
    {/* Header */}
    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
      <span className="text-sm font-semibold text-gray-700">Карточка пользователя</span>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <Icon name="X" size={16} />
      </button>
    </div>

    {/* Avatar & Name */}
    <div className="p-5 text-center border-b border-gray-100">
      <div className={`w-20 h-20 rounded-full ${avatarColor} flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3`}>
        {getInitials(user.fullName)}
      </div>
      <h3 className="font-semibold text-gray-900 text-base leading-tight">{user.fullName}</h3>
      <div className="mt-2">
        <Badge className={ROLE_COLORS[user.role]}>{user.role}</Badge>
      </div>
      <p className="text-xs text-gray-500 mt-1">{user.department}</p>
      <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
        {user.isActive ? 'Активен' : 'Заблокирован'}
      </div>
    </div>

    {/* Contact info */}
    <div className="p-4 space-y-3 border-b border-gray-100">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Контакты</h4>
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <Icon name="Mail" size={14} className="text-gray-400 shrink-0" />
        <span className="break-all">{user.email}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <Icon name="Phone" size={14} className="text-gray-400 shrink-0" />
        <span>{user.phone}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <Icon name="Calendar" size={14} className="text-gray-400 shrink-0" />
        <span>Создан: {user.createdAt}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <Icon name="Clock" size={14} className="text-gray-400 shrink-0" />
        <span>Последний вход: {user.lastLogin}</span>
      </div>
    </div>

    {/* Permissions */}
    <div className="p-4 space-y-2 border-b border-gray-100">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Разрешения роли</h4>
      <div className="space-y-1.5">
        {ALL_PERMISSIONS.map((perm) => (
          <label key={perm} className="flex items-center gap-2 text-sm text-gray-700 cursor-default">
            <input
              type="checkbox"
              readOnly
              checked={user.permissions.includes(perm)}
              className="accent-blue-600 cursor-default"
            />
            <span className={user.permissions.includes(perm) ? 'text-gray-800' : 'text-gray-400'}>{perm}</span>
          </label>
        ))}
      </div>
    </div>

    {/* Active sessions */}
    <div className="p-4 space-y-2 border-b border-gray-100">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Активные сессии</h4>
      {user.sessions.length === 0 ? (
        <p className="text-xs text-gray-400 italic">Нет активных сессий</p>
      ) : (
        <div className="space-y-2">
          {user.sessions.map((s, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-2.5 text-xs space-y-0.5">
              <div className="font-medium text-gray-800">{s.device}</div>
              <div className="text-gray-500">IP: {s.ip}</div>
              <div className="text-gray-500">{s.time}</div>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Actions */}
    <div className="p-4 space-y-2">
      <Button className="w-full" size="sm" onClick={onEdit}>
        <Icon name="Edit" size={14} className="mr-2" /> Редактировать
      </Button>
      <Button
        className="w-full" size="sm" variant="outline"
        onClick={() => toast.success(`Все сессии пользователя ${user.fullName} завершены`)}
        disabled={user.sessions.length === 0}
      >
        <Icon name="LogOut" size={14} className="mr-2" /> Завершить все сессии
      </Button>
      <Button
        className="w-full" size="sm"
        variant={user.isActive ? 'destructive' : 'outline'}
        onClick={onBlock}
      >
        <Icon name={user.isActive ? 'UserX' : 'UserCheck'} size={14} className="mr-2" />
        {user.isActive ? 'Заблокировать' : 'Разблокировать'}
      </Button>
    </div>
  </div>
);

// ─── Add User Modal ───────────────────────────────────────────────────────────

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (name: string, email: string, role: Role, department: string, sendInvite: boolean) => void;
}

const AddUserModal = ({ open, onOpenChange, onSave }: AddUserModalProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('Диспетчер');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [sendInvite, setSendInvite] = useState(true);

  const reset = () => { setName(''); setEmail(''); setRole('Диспетчер'); setDepartment(DEPARTMENTS[0]); setSendInvite(true); };

  const handleSave = () => {
    if (!name.trim() || !email.trim()) return;
    onSave(name.trim(), email.trim(), role, department, sendInvite);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Добавить пользователя</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div>
            <Label className="mb-1 block">ФИО *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Иванов Иван Иванович" />
          </div>
          <div>
            <Label className="mb-1 block">Email *</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@servisklimat.ru" />
          </div>
          <div>
            <Label className="mb-1 block">Роль</Label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <Label className="mb-1 block">Отдел</Label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-800">Отправить приглашение</p>
              <p className="text-xs text-gray-500 mt-0.5">Ссылка для входа будет отправлена на email</p>
            </div>
            <Switch checked={sendInvite} onCheckedChange={setSendInvite} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>Отмена</Button>
          <Button onClick={handleSave} disabled={!name.trim() || !email.trim()}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Roles Tab ────────────────────────────────────────────────────────────────

interface RolesTabProps {
  users: OfficeUser[];
}

const roleIcons: Record<Role, string> = {
  Администратор: 'ShieldCheck',
  Руководитель:  'Crown',
  Диспетчер:     'Headphones',
  Менеджер:      'Briefcase',
  Бухгалтер:     'Calculator',
  HR:            'Users',
};

const roleBgColors: Record<Role, string> = {
  Администратор: 'bg-red-50 border-red-200',
  Руководитель:  'bg-purple-50 border-purple-200',
  Диспетчер:     'bg-blue-50 border-blue-200',
  Менеджер:      'bg-orange-50 border-orange-200',
  Бухгалтер:     'bg-green-50 border-green-200',
  HR:            'bg-pink-50 border-pink-200',
};

const roleIconBg: Record<Role, string> = {
  Администратор: 'bg-red-100 text-red-600',
  Руководитель:  'bg-purple-100 text-purple-600',
  Диспетчер:     'bg-blue-100 text-blue-600',
  Менеджер:      'bg-orange-100 text-orange-600',
  Бухгалтер:     'bg-green-100 text-green-600',
  HR:            'bg-pink-100 text-pink-600',
};

const RolesTab = ({ users }: RolesTabProps) => {
  const countByRole = (role: Role) => users.filter((u) => u.role === role && u.isActive).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800">Роли системы</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info('Переход к конструктору ролей')}
        >
          <Icon name="Settings" size={14} className="mr-2" />
          Конструктор ролей
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {ROLES.map((role) => (
          <Card key={role} className={`border ${roleBgColors[role]}`}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${roleIconBg[role]}`}>
                  <Icon name={roleIcons[role]} size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-gray-900 text-sm">{role}</span>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {countByRole(role)} польз.
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{ROLE_DESCRIPTIONS[role]}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {ROLE_PERMISSIONS[role].slice(0, 3).map((p) => (
                      <span key={p} className="px-1.5 py-0.5 bg-white/70 border border-gray-200 text-gray-600 text-xs rounded">
                        {p}
                      </span>
                    ))}
                    {ROLE_PERMISSIONS[role].length > 3 && (
                      <span className="px-1.5 py-0.5 bg-white/70 border border-gray-200 text-gray-500 text-xs rounded">
                        +{ROLE_PERMISSIONS[role].length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const OfficeUsersFull = () => {
  const [users, setUsers] = useState<OfficeUser[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedUser, setSelectedUser] = useState<OfficeUser | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

  // ── Computed ──

  const filtered = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && u.isActive) ||
      (statusFilter === 'blocked' && !u.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalActive = users.filter((u) => u.isActive).length;
  const totalBlocked = users.filter((u) => !u.isActive).length;

  // ── Handlers ──

  const handleBlockToggle = (user: OfficeUser) => {
    const next = !user.isActive;
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: next } : u)));
    if (selectedUser?.id === user.id) setSelectedUser((s) => s ? { ...s, isActive: next } : s);
    toast[next ? 'success' : 'warning'](
      next ? `Пользователь ${user.fullName} разблокирован` : `Пользователь ${user.fullName} заблокирован`
    );
  };

  const handleResetPassword = (user: OfficeUser) => {
    toast.success(`Ссылка для сброса пароля отправлена на ${user.email}`);
  };

  const handleAddUser = (name: string, email: string, role: Role, department: string, sendInvite: boolean) => {
    const newUser: OfficeUser = {
      id: `U${String(users.length + 1).padStart(3, '0')}`,
      fullName: name,
      role,
      department,
      email,
      phone: '',
      createdAt: new Date().toLocaleDateString('ru-RU'),
      lastLogin: 'Не входил',
      isActive: true,
      permissions: ROLE_PERMISSIONS[role],
      sessions: [],
    };
    setUsers((prev) => [...prev, newUser]);
    toast.success(
      sendInvite
        ? `Пользователь добавлен. Приглашение отправлено на ${email}`
        : `Пользователь ${name} успешно добавлен`
    );
  };

  const selectedUserIndex = selectedUser ? users.findIndex((u) => u.id === selectedUser.id) : -1;
  const avatarColorForSelected = selectedUserIndex >= 0 ? AVATAR_COLORS[selectedUserIndex % AVATAR_COLORS.length] : AVATAR_COLORS[0];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Page header */}
      <div className="px-6 py-5 bg-white border-b border-gray-200 flex items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Офисные пользователи</h1>
          <p className="text-sm text-gray-500 mt-0.5">Управление учётными записями и правами доступа</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Icon name="UserPlus" size={16} className="mr-2" />
          Добавить пользователя
        </Button>
      </div>

      {/* Metrics */}
      <div className="px-6 pt-5 grid grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
        <MetricCard label="Всего пользователей" value={users.length} icon="Users" color="bg-blue-500" />
        <MetricCard label="Активных" value={totalActive} icon="UserCheck" color="bg-green-500" />
        <MetricCard label="Заблокированных" value={totalBlocked} icon="UserX" color="bg-red-400" />
        <MetricCard label="Ролей" value={ROLES.length} icon="ShieldCheck" color="bg-purple-500" />
      </div>

      {/* Tabs */}
      <div className="px-6 pt-5 flex gap-1 flex-shrink-0">
        {(['users', 'roles'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSelectedUser(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab === 'users' ? 'Пользователи' : 'Роли'}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex flex-1 overflow-hidden px-6 pb-6 pt-4 gap-4">
        {/* Left: main panel */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden min-w-0">

          {activeTab === 'users' && (
            <>
              {/* Filters */}
              <Card className="flex-shrink-0">
                <CardContent className="pt-4 pb-4">
                  <div className="flex gap-3 flex-wrap items-center">
                    <div className="relative flex-1 min-w-48">
                      <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Поиск по имени или email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="all">Все роли</option>
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                      {([['all', 'Все'], ['active', 'Активные'], ['blocked', 'Заблокированные']] as [StatusFilter, string][]).map(([val, label]) => (
                        <button
                          key={val}
                          onClick={() => setStatusFilter(val)}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                            statusFilter === val ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap">Найдено: {filtered.length}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Table */}
              <Card className="flex-1 overflow-hidden flex flex-col">
                <CardHeader className="pb-2 flex-shrink-0">
                  <CardTitle className="text-base">Список пользователей</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto p-0">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Пользователь</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Роль</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Отдел</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Последний вход</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Статус</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filtered.map((user) => {
                        const globalIdx = users.findIndex((u) => u.id === user.id);
                        const isSelected = selectedUser?.id === user.id;
                        return (
                          <tr
                            key={user.id}
                            onClick={() => setSelectedUser(isSelected ? null : user)}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                            } ${!user.isActive ? 'opacity-60' : ''}`}
                          >
                            {/* User */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${AVATAR_COLORS[globalIdx % AVATAR_COLORS.length]}`}>
                                  {getInitials(user.fullName)}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{user.fullName}</div>
                                  <div className="text-xs text-gray-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            {/* Role */}
                            <td className="px-4 py-3">
                              <Badge className={ROLE_COLORS[user.role]}>{user.role}</Badge>
                            </td>
                            {/* Department */}
                            <td className="px-4 py-3 text-gray-600">{user.department}</td>
                            {/* Last login */}
                            <td className="px-4 py-3 text-gray-600">{user.lastLogin}</td>
                            {/* Status */}
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                                {user.isActive ? 'Активен' : 'Заблокирован'}
                              </span>
                            </td>
                            {/* Actions */}
                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-1">
                                <button
                                  title="Редактировать"
                                  onClick={() => { setSelectedUser(user); }}
                                  className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
                                >
                                  <Icon name="Edit" size={14} />
                                </button>
                                <button
                                  title="Сбросить пароль"
                                  onClick={() => handleResetPassword(user)}
                                  className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-orange-600 transition-colors"
                                >
                                  <Icon name="KeyRound" size={14} />
                                </button>
                                <button
                                  title={user.isActive ? 'Заблокировать' : 'Разблокировать'}
                                  onClick={() => handleBlockToggle(user)}
                                  className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${user.isActive ? 'text-gray-500 hover:text-red-600' : 'text-gray-500 hover:text-green-600'}`}
                                >
                                  <Icon name={user.isActive ? 'UserX' : 'UserCheck'} size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">
                            <Icon name="SearchX" size={32} className="mx-auto mb-2 opacity-40" />
                            Пользователи не найдены
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 'roles' && (
            <div className="flex-1 overflow-auto">
              <RolesTab users={users} />
            </div>
          )}
        </div>

        {/* Right: detail panel */}
        {selectedUser && activeTab === 'users' && (
          <DetailPanel
            user={selectedUser}
            avatarColor={avatarColorForSelected}
            onClose={() => setSelectedUser(null)}
            onEdit={() => toast.info(`Открытие формы редактирования: ${selectedUser.fullName}`)}
            onBlock={() => handleBlockToggle(selectedUser)}
          />
        )}
      </div>

      {/* Add User Modal */}
      <AddUserModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSave={handleAddUser}
      />
    </div>
  );
};

export default OfficeUsersFull;
