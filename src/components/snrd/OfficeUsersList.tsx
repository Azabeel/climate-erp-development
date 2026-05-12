import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';

interface OfficeUser {
  id: string;
  fullName: string;
  role: 'Диспетчер' | 'Руководитель' | 'Бухгалтер' | 'Менеджер' | 'Администратор';
  email: string;
  phone: string;
  lastLogin: string;
  isActive: boolean;
  permissions: string[];
}

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
];

const ROLES: OfficeUser['role'][] = [
  'Диспетчер',
  'Руководитель',
  'Бухгалтер',
  'Менеджер',
  'Администратор',
];

const mockUsers: OfficeUser[] = [
  {
    id: 'U001',
    fullName: 'Петрова Анна Сергеевна',
    role: 'Руководитель',
    email: 'petrova@servisklimat.ru',
    phone: '+7 (495) 100-01-01',
    lastLogin: '11.05.2026 09:15',
    isActive: true,
    permissions: ['Просмотр нарядов', 'Редактирование нарядов', 'Удаление нарядов', 'Управление клиентами', 'Финансовые отчёты', 'Управление сотрудниками', 'Настройки системы', 'Экспорт данных'],
  },
  {
    id: 'U002',
    fullName: 'Козлова Мария Ивановна',
    role: 'Диспетчер',
    email: 'kozlova@servisklimat.ru',
    phone: '+7 (495) 100-01-02',
    lastLogin: '11.05.2026 08:47',
    isActive: true,
    permissions: ['Просмотр нарядов', 'Редактирование нарядов', 'Управление клиентами'],
  },
  {
    id: 'U003',
    fullName: 'Фёдоров Дмитрий Александрович',
    role: 'Диспетчер',
    email: 'fedorov@servisklimat.ru',
    phone: '+7 (495) 100-01-03',
    lastLogin: '10.05.2026 18:30',
    isActive: true,
    permissions: ['Просмотр нарядов', 'Редактирование нарядов', 'Управление клиентами'],
  },
  {
    id: 'U004',
    fullName: 'Николаева Светлана Петровна',
    role: 'Бухгалтер',
    email: 'nikolaeva@servisklimat.ru',
    phone: '+7 (495) 100-01-04',
    lastLogin: '11.05.2026 10:02',
    isActive: true,
    permissions: ['Финансовые отчёты', 'Экспорт данных', 'Просмотр нарядов'],
  },
  {
    id: 'U005',
    fullName: 'Смирнов Алексей Николаевич',
    role: 'Менеджер',
    email: 'smirnov@servisklimat.ru',
    phone: '+7 (495) 100-01-05',
    lastLogin: '11.05.2026 11:20',
    isActive: true,
    permissions: ['Просмотр нарядов', 'Управление клиентами', 'Экспорт данных'],
  },
  {
    id: 'U006',
    fullName: 'Морозова Екатерина Владимировна',
    role: 'Менеджер',
    email: 'morozova@servisklimat.ru',
    phone: '+7 (495) 100-01-06',
    lastLogin: '09.05.2026 14:45',
    isActive: true,
    permissions: ['Просмотр нарядов', 'Управление клиентами'],
  },
  {
    id: 'U007',
    fullName: 'Волков Игорь Сергеевич',
    role: 'Администратор',
    email: 'volkov@servisklimat.ru',
    phone: '+7 (495) 100-01-07',
    lastLogin: '11.05.2026 07:30',
    isActive: true,
    permissions: ALL_PERMISSIONS,
  },
  {
    id: 'U008',
    fullName: 'Зайцева Ольга Михайловна',
    role: 'Диспетчер',
    email: 'zaitseva@servisklimat.ru',
    phone: '+7 (495) 100-01-08',
    lastLogin: '08.05.2026 16:00',
    isActive: false,
    permissions: ['Просмотр нарядов', 'Редактирование нарядов'],
  },
  {
    id: 'U009',
    fullName: 'Попов Владимир Андреевич',
    role: 'Бухгалтер',
    email: 'popov@servisklimat.ru',
    phone: '+7 (495) 100-01-09',
    lastLogin: '07.05.2026 09:10',
    isActive: false,
    permissions: ['Финансовые отчёты', 'Экспорт данных'],
  },
  {
    id: 'U010',
    fullName: 'Лебедева Татьяна Юрьевна',
    role: 'Менеджер',
    email: 'lebedeva@servisklimat.ru',
    phone: '+7 (495) 100-01-10',
    lastLogin: '11.05.2026 08:55',
    isActive: true,
    permissions: ['Просмотр нарядов', 'Управление клиентами', 'Планирование ТО'],
  },
];

const ROLE_COLORS: Record<OfficeUser['role'], string> = {
  Руководитель: 'bg-purple-100 text-purple-700',
  Администратор: 'bg-red-100 text-red-700',
  Диспетчер: 'bg-blue-100 text-blue-700',
  Бухгалтер: 'bg-green-100 text-green-700',
  Менеджер: 'bg-orange-100 text-orange-700',
};

const getInitials = (fullName: string) => {
  const parts = fullName.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return fullName.slice(0, 2).toUpperCase();
};

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-red-500',
  'bg-teal-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-yellow-500',
  'bg-cyan-500',
];

const OfficeUsersList = () => {
  const [users, setUsers] = useState<OfficeUser[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<OfficeUser | null>(null);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<OfficeUser['role']>('Диспетчер');
  const [formPermissions, setFormPermissions] = useState<string[]>([]);

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const openAdd = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('Диспетчер');
    setFormPermissions([]);
    setIsModalOpen(true);
  };

  const openEdit = (user: OfficeUser) => {
    setEditingUser(user);
    setFormName(user.fullName);
    setFormEmail(user.email);
    setFormPhone(user.phone);
    setFormRole(user.role);
    setFormPermissions([...user.permissions]);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formName.trim() || !formEmail.trim()) return;
    if (editingUser) {
      setUsers(users.map((u) =>
        u.id === editingUser.id
          ? { ...u, fullName: formName, email: formEmail, phone: formPhone, role: formRole, permissions: formPermissions }
          : u
      ));
    } else {
      const newUser: OfficeUser = {
        id: `U${String(users.length + 1).padStart(3, '0')}`,
        fullName: formName,
        email: formEmail,
        phone: formPhone,
        role: formRole,
        lastLogin: 'Не входил',
        isActive: true,
        permissions: formPermissions,
      };
      setUsers([...users, newUser]);
    }
    setIsModalOpen(false);
  };

  const toggleActive = (id: string) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u)));
  };

  const togglePermission = (perm: string) => {
    setFormPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Офисные пользователи</h2>
          <p className="text-gray-500 mt-1">Управление учётными записями и правами доступа</p>
        </div>
        <Button onClick={openAdd}>
          <Icon name="UserPlus" size={16} className="mr-2" />
          Добавить пользователя
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все роли</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <span className="text-sm text-gray-500 whitespace-nowrap">
              Найдено: {filtered.length}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Список пользователей</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пользователь</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Контакты</TableHead>
                <TableHead>Последний вход</TableHead>
                <TableHead>Права доступа</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user, idx) => (
                <TableRow key={user.id} className={!user.isActive ? 'opacity-50' : ''}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}
                      >
                        {getInitials(user.fullName)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.fullName}</div>
                        <div className="text-xs text-gray-500">{user.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={ROLE_COLORS[user.role]}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-xs text-gray-500">{user.phone}</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-700">{user.lastLogin}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {user.permissions.slice(0, 2).map((p) => (
                        <span key={p} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {p}
                        </span>
                      ))}
                      {user.permissions.length > 2 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                          +{user.permissions.length - 2}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={() => toggleActive(user.id)}
                      />
                      <span className={`text-xs ${user.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                        {user.isActive ? 'Активен' : 'Отключён'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(user)}>
                        <Icon name="Edit" size={15} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(user.id)}
                        title={user.isActive ? 'Деактивировать' : 'Активировать'}
                      >
                        <Icon
                          name={user.isActive ? 'UserX' : 'UserCheck'}
                          size={15}
                          className={user.isActive ? 'text-red-500' : 'text-green-600'}
                        />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Редактировать пользователя' : 'Добавить пользователя'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>ФИО *</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Иванов Иван Иванович"
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="user@servisklimat.ru"
              />
            </div>
            <div>
              <Label>Телефон</Label>
              <Input
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+7 (495) 000-00-00"
              />
            </div>
            <div>
              <Label>Роль</Label>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as OfficeUser['role'])}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="mb-2 block">Права доступа</Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
                {ALL_PERMISSIONS.map((perm) => (
                  <label key={perm} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={formPermissions.includes(perm)}
                      onChange={() => togglePermission(perm)}
                      className="accent-blue-600"
                    />
                    {perm}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={!formName.trim() || !formEmail.trim()}>
              {editingUser ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OfficeUsersList;
