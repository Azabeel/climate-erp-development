import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const modules = [
  { id: 'dashboard', label: 'Главная панель' },
  { id: 'applications', label: 'Заявки' },
  { id: 'work-orders', label: 'Наряды' },
  { id: 'contracts', label: 'Подряды' },
  { id: 'completion-acts', label: 'Акты выполненных работ' },
  { id: 'assign-executors', label: 'Назначение исполнителей' },
  { id: 'auto-planning', label: 'Автопланирование' },
  { id: 'scheduled-maintenance', label: 'Плановое ТО' },
  { id: 'finance', label: 'Финансы' },
  { id: 'crm', label: 'CRM' },
  { id: 'warehouse', label: 'Склад' },
  { id: 'hr', label: 'HR / Зарплата' },
  { id: 'reports', label: 'Отчёты' },
  { id: 'employees', label: 'Сотрудники' },
  { id: 'clients', label: 'Клиенты' },
  { id: 'service-objects', label: 'Объекты обслуживания' },
  { id: 'service-types', label: 'Виды работ' },
  { id: 'surveys', label: 'Анкетирование' },
  { id: 'settings', label: 'Настройки' },
];

type Permission = 'view' | 'create' | 'edit' | 'delete';
const permissions: Permission[] = ['view', 'create', 'edit', 'delete'];
const permLabels: Record<Permission, string> = { view: 'Просмотр', create: 'Создание', edit: 'Редактирование', delete: 'Удаление' };

type RolePerms = Record<string, Record<Permission, boolean>>;

const defaultPerms = (full: boolean): RolePerms =>
  Object.fromEntries(modules.map(m => [m.id, Object.fromEntries(permissions.map(p => [p, full])) as Record<Permission, boolean>]));

const initialRoles = [
  {
    id: 'admin',
    name: 'Администратор',
    color: 'bg-red-100 text-red-700',
    users: 2,
    perms: defaultPerms(true),
  },
  {
    id: 'dispatcher',
    name: 'Диспетчер',
    color: 'bg-blue-100 text-blue-700',
    users: 5,
    perms: {
      ...defaultPerms(false),
      dashboard: { view: true, create: false, edit: false, delete: false },
      applications: { view: true, create: true, edit: true, delete: false },
      'work-orders': { view: true, create: true, edit: true, delete: false },
      contracts: { view: true, create: false, edit: false, delete: false },
      'completion-acts': { view: true, create: false, edit: false, delete: false },
      'assign-executors': { view: true, create: true, edit: true, delete: false },
      'auto-planning': { view: true, create: true, edit: true, delete: false },
      'scheduled-maintenance': { view: true, create: false, edit: false, delete: false },
      clients: { view: true, create: false, edit: false, delete: false },
      employees: { view: true, create: false, edit: false, delete: false },
      'service-objects': { view: true, create: false, edit: false, delete: false },
      surveys: { view: true, create: false, edit: false, delete: false },
    },
  },
  {
    id: 'engineer',
    name: 'Выездной инженер',
    color: 'bg-green-100 text-green-700',
    users: 12,
    perms: {
      ...defaultPerms(false),
      dashboard: { view: true, create: false, edit: false, delete: false },
      'work-orders': { view: true, create: false, edit: true, delete: false },
      warehouse: { view: true, create: false, edit: false, delete: false },
      hr: { view: true, create: false, edit: false, delete: false },
    },
  },
  {
    id: 'manager',
    name: 'Менеджер продаж',
    color: 'bg-purple-100 text-purple-700',
    users: 3,
    perms: {
      ...defaultPerms(false),
      dashboard: { view: true, create: false, edit: false, delete: false },
      applications: { view: true, create: true, edit: true, delete: false },
      crm: { view: true, create: true, edit: true, delete: false },
      clients: { view: true, create: true, edit: true, delete: false },
      'service-objects': { view: true, create: true, edit: true, delete: false },
      reports: { view: true, create: false, edit: false, delete: false },
    },
  },
  {
    id: 'accountant',
    name: 'Бухгалтер',
    color: 'bg-yellow-100 text-yellow-700',
    users: 1,
    perms: {
      ...defaultPerms(false),
      finance: { view: true, create: true, edit: true, delete: false },
      'completion-acts': { view: true, create: false, edit: false, delete: false },
      hr: { view: true, create: false, edit: false, delete: false },
      reports: { view: true, create: false, edit: false, delete: false },
    },
  },
];

const RolesConstructor = () => {
  const [roles] = useState(initialRoles);
  const [selectedRole, setSelectedRole] = useState(initialRoles[0]);
  const [perms, setPerms] = useState<RolePerms>(initialRoles[0].perms);
  const [saved, setSaved] = useState(false);

  const selectRole = (role: typeof initialRoles[0]) => {
    setSelectedRole(role);
    setPerms(role.perms);
    setSaved(false);
  };

  const toggle = (moduleId: string, perm: Permission) => {
    setPerms(prev => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], [perm]: !prev[moduleId]?.[perm] },
    }));
    setSaved(false);
  };

  const toggleAll = (moduleId: string) => {
    const allOn = permissions.every(p => perms[moduleId]?.[p]);
    setPerms(prev => ({
      ...prev,
      [moduleId]: Object.fromEntries(permissions.map(p => [p, !allOn])) as Record<Permission, boolean>,
    }));
    setSaved(false);
  };

  return (
    <div className="p-6">
      <div className="flex gap-6">
        {/* Roles list */}
        <div className="w-64 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Роли</h3>
            <Button size="sm" variant="outline">
              <Icon name="Plus" size={14} className="mr-1" />
              Новая
            </Button>
          </div>
          <div className="space-y-2">
            {roles.map(role => (
              <button
                key={role.id}
                onClick={() => selectRole(role)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedRole.id === role.id
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-gray-900">{role.name}</span>
                  <Badge className={role.color + ' text-xs'}>{role.users}</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">{role.users} пользователей</p>
              </button>
            ))}
          </div>
        </div>

        {/* Permissions matrix */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle>Права доступа: {selectedRole.name}</CardTitle>
                  <Badge className={selectedRole.color}>{selectedRole.users} польз.</Badge>
                </div>
                <div className="flex gap-2">
                  {saved && (
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <Icon name="CheckCircle" size={16} />
                      Сохранено
                    </div>
                  )}
                  <Button size="sm" onClick={() => setSaved(true)}>
                    <Icon name="Save" size={16} className="mr-1" />
                    Сохранить
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-medium text-gray-500 w-56">Модуль</th>
                      <th className="pb-3 font-medium text-gray-500 text-center">Все</th>
                      {permissions.map(p => (
                        <th key={p} className="pb-3 font-medium text-gray-500 text-center">{permLabels[p]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {modules.map(mod => {
                      const modPerms = perms[mod.id] || {};
                      const allOn = permissions.every(p => modPerms[p]);
                      const someOn = permissions.some(p => modPerms[p]);
                      return (
                        <tr key={mod.id} className="hover:bg-gray-50">
                          <td className="py-2.5 font-medium text-gray-800">{mod.label}</td>
                          <td className="py-2.5 text-center">
                            <button
                              onClick={() => toggleAll(mod.id)}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center mx-auto transition-colors ${
                                allOn ? 'bg-blue-600 border-blue-600' : someOn ? 'bg-blue-200 border-blue-400' : 'border-gray-300'
                              }`}
                            >
                              {(allOn || someOn) && <Icon name="Check" size={12} className="text-white" />}
                            </button>
                          </td>
                          {permissions.map(perm => (
                            <td key={perm} className="py-2.5 text-center">
                              <button
                                onClick={() => toggle(mod.id, perm)}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center mx-auto transition-colors ${
                                  modPerms[perm] ? 'bg-blue-600 border-blue-600' : 'border-gray-300 hover:border-blue-400'
                                }`}
                              >
                                {modPerms[perm] && <Icon name="Check" size={12} className="text-white" />}
                              </button>
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RolesConstructor;
