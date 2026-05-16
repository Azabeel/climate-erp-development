import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Permission = 'view' | 'create' | 'edit' | 'delete' | 'export';

const PERMISSIONS: Permission[] = ['view', 'create', 'edit', 'delete', 'export'];

const PERM_LABELS: Record<Permission, string> = {
  view: 'Просмотр',
  create: 'Создание',
  edit: 'Редактирование',
  delete: 'Удаление',
  export: 'Экспорт',
};

const PERM_ICONS: Record<Permission, string> = {
  view: 'Eye',
  create: 'Plus',
  edit: 'Pencil',
  delete: 'Trash2',
  export: 'Download',
};

const SECTIONS = [
  { id: 'applications', label: 'Заявки', icon: 'FileText' },
  { id: 'work-orders', label: 'Наряды', icon: 'ClipboardList' },
  { id: 'warehouse', label: 'Склад', icon: 'Package' },
  { id: 'finance', label: 'Финансы', icon: 'DollarSign' },
  { id: 'hr', label: 'HR', icon: 'Users' },
  { id: 'clients', label: 'Клиенты', icon: 'UserCheck' },
  { id: 'reports', label: 'Отчёты', icon: 'BarChart2' },
  { id: 'settings', label: 'Настройки', icon: 'Settings' },
  { id: 'integrations', label: 'Интеграции', icon: 'Plug' },
];

type SectionPerms = Record<Permission, boolean>;
type RolePerms = Record<string, SectionPerms>;

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  badgeColor: string;
  users: number;
  lastModified: string;
  perms: RolePerms;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const emptyPerms = (): SectionPerms =>
  Object.fromEntries(PERMISSIONS.map(p => [p, false])) as SectionPerms;

const fullPerms = (): SectionPerms =>
  Object.fromEntries(PERMISSIONS.map(p => [p, true])) as SectionPerms;

const viewOnlyPerms = (): SectionPerms =>
  Object.fromEntries(PERMISSIONS.map(p => [p, p === 'view'])) as SectionPerms;

const buildRolePerms = (overrides: Partial<Record<string, Partial<SectionPerms>>> = {}): RolePerms =>
  Object.fromEntries(
    SECTIONS.map(s => [s.id, { ...emptyPerms(), ...(overrides[s.id] ?? {}) }])
  );

// ---------------------------------------------------------------------------
// Initial data
// ---------------------------------------------------------------------------

const INITIAL_ROLES: Role[] = [
  {
    id: 'admin',
    name: 'Администратор',
    description: 'Полный доступ ко всем модулям системы',
    color: 'border-l-red-500',
    badgeColor: 'bg-red-100 text-red-700',
    users: 2,
    lastModified: '12.05.2026',
    perms: buildRolePerms(Object.fromEntries(SECTIONS.map(s => [s.id, fullPerms()]))),
  },
  {
    id: 'dispatcher',
    name: 'Диспетчер',
    description: 'Управление заявками и нарядами',
    color: 'border-l-blue-500',
    badgeColor: 'bg-blue-100 text-blue-700',
    users: 5,
    lastModified: '10.05.2026',
    perms: buildRolePerms({
      applications: { view: true, create: true, edit: true, delete: false, export: false },
      'work-orders': { view: true, create: true, edit: true, delete: false, export: false },
      clients: { view: true, create: false, edit: false, delete: false, export: false },
      reports: { view: true, create: false, edit: false, delete: false, export: true },
    }),
  },
  {
    id: 'manager',
    name: 'Менеджер',
    description: 'Работа с клиентами и продажами',
    color: 'border-l-purple-500',
    badgeColor: 'bg-purple-100 text-purple-700',
    users: 4,
    lastModified: '09.05.2026',
    perms: buildRolePerms({
      clients: { view: true, create: true, edit: true, delete: false, export: true },
      applications: { view: true, create: true, edit: false, delete: false, export: false },
      reports: { view: true, create: false, edit: false, delete: false, export: true },
      finance: { view: true, create: false, edit: false, delete: false, export: false },
    }),
  },
  {
    id: 'accountant',
    name: 'Бухгалтер',
    description: 'Финансовые операции и отчётность',
    color: 'border-l-yellow-500',
    badgeColor: 'bg-yellow-100 text-yellow-700',
    users: 2,
    lastModified: '08.05.2026',
    perms: buildRolePerms({
      finance: { view: true, create: true, edit: true, delete: false, export: true },
      reports: { view: true, create: false, edit: false, delete: false, export: true },
      hr: { view: true, create: false, edit: false, delete: false, export: false },
    }),
  },
  {
    id: 'hr',
    name: 'HR',
    description: 'Управление персоналом и зарплатой',
    color: 'border-l-green-500',
    badgeColor: 'bg-green-100 text-green-700',
    users: 1,
    lastModified: '07.05.2026',
    perms: buildRolePerms({
      hr: { view: true, create: true, edit: true, delete: false, export: true },
      reports: { view: true, create: false, edit: false, delete: false, export: true },
    }),
  },
  {
    id: 'head',
    name: 'Руководитель отдела',
    description: 'Мониторинг и аналитика по отделу',
    color: 'border-l-orange-500',
    badgeColor: 'bg-orange-100 text-orange-700',
    users: 3,
    lastModified: '06.05.2026',
    perms: buildRolePerms(
      Object.fromEntries(SECTIONS.map(s => [s.id, viewOnlyPerms()]))
    ),
  },
];

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

interface CheckboxCellProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  disabled?: boolean;
}

const CheckboxCell = ({ checked, indeterminate, onChange, disabled }: CheckboxCellProps) => (
  <button
    onClick={onChange}
    disabled={disabled}
    className={`w-5 h-5 rounded border-2 flex items-center justify-center mx-auto transition-colors
      ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      ${checked
        ? 'bg-blue-600 border-blue-600'
        : indeterminate
        ? 'bg-blue-200 border-blue-400'
        : 'border-gray-300 hover:border-blue-400'
      }`}
  >
    {(checked || indeterminate) && (
      <Icon name="Check" size={11} className="text-white" />
    )}
  </button>
);

// ---------------------------------------------------------------------------
// Create Role Modal
// ---------------------------------------------------------------------------

interface CreateRoleModalProps {
  roles: Role[];
  onClose: () => void;
  onCreate: (role: Role) => void;
}

const CreateRoleModal = ({ roles, onClose, onCreate }: CreateRoleModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [copyFromId, setCopyFromId] = useState<string>('');

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Введите название роли');
      return;
    }
    const sourceRole = roles.find(r => r.id === copyFromId);
    const newRole: Role = {
      id: `role_${Date.now()}`,
      name: trimmed,
      description: description.trim(),
      color: 'border-l-gray-500',
      badgeColor: 'bg-gray-100 text-gray-700',
      users: 0,
      lastModified: new Date().toLocaleDateString('ru-RU'),
      perms: sourceRole
        ? JSON.parse(JSON.stringify(sourceRole.perms))
        : buildRolePerms(),
    };
    onCreate(newRole);
    toast.success(`Роль «${trimmed}» создана`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Создать роль</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Например: Логист"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <Input
              placeholder="Краткое описание роли"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Скопировать права из роли
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={copyFromId}
              onChange={e => setCopyFromId(e.target.value)}
            >
              <option value="">— Начать с пустой роли —</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleCreate}>
            <Icon name="Plus" size={16} className="mr-1.5" />
            Создать роль
          </Button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

type ActiveTab = 'matrix' | 'compare';

const RolesConstructorFull = () => {
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [selectedRoleId, setSelectedRoleId] = useState<string>(INITIAL_ROLES[0].id);
  const [perms, setPerms] = useState<RolePerms>(INITIAL_ROLES[0].perms);
  const [activeTab, setActiveTab] = useState<ActiveTab>('matrix');
  const [compareRoleAId, setCompareRoleAId] = useState<string>(INITIAL_ROLES[0].id);
  const [compareRoleBId, setCompareRoleBId] = useState<string>(INITIAL_ROLES[1].id);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedRole = roles.find(r => r.id === selectedRoleId)!;

  // ---- Role selection ----
  const selectRole = (role: Role) => {
    setSelectedRoleId(role.id);
    setPerms(JSON.parse(JSON.stringify(role.perms)));
  };

  // ---- Permission toggle ----
  const togglePerm = (sectionId: string, perm: Permission) => {
    setPerms(prev => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], [perm]: !prev[sectionId]?.[perm] },
    }));
  };

  const toggleAllForSection = (sectionId: string) => {
    const all = PERMISSIONS.every(p => perms[sectionId]?.[p]);
    setPerms(prev => ({
      ...prev,
      [sectionId]: Object.fromEntries(PERMISSIONS.map(p => [p, !all])) as SectionPerms,
    }));
  };

  const toggleAllForPerm = (perm: Permission) => {
    const all = SECTIONS.every(s => perms[s.id]?.[perm]);
    setPerms(prev =>
      Object.fromEntries(
        SECTIONS.map(s => [s.id, { ...prev[s.id], [perm]: !all }])
      )
    );
  };

  // ---- Presets ----
  const applyPreset = (preset: 'full' | 'view' | 'reset') => {
    const builder =
      preset === 'full' ? fullPerms :
      preset === 'view' ? viewOnlyPerms :
      emptyPerms;
    setPerms(
      Object.fromEntries(SECTIONS.map(s => [s.id, builder()]))
    );
    const label =
      preset === 'full' ? 'Полный доступ' :
      preset === 'view' ? 'Только просмотр' : 'Сброс';
    toast.info(`Пресет применён: ${label}`);
  };

  // ---- Save ----
  const savePerms = () => {
    setRoles(prev =>
      prev.map(r =>
        r.id === selectedRoleId
          ? { ...r, perms: JSON.parse(JSON.stringify(perms)), lastModified: new Date().toLocaleDateString('ru-RU') }
          : r
      )
    );
    toast.success(`Права роли «${selectedRole.name}» сохранены`);
  };

  // ---- Create role ----
  const handleCreateRole = (role: Role) => {
    setRoles(prev => [...prev, role]);
    selectRole(role);
  };

  // ---- Compare ----
  const compareRoleA = roles.find(r => r.id === compareRoleAId);
  const compareRoleB = roles.find(r => r.id === compareRoleBId);

  const compareData = useMemo(() => {
    if (!compareRoleA || !compareRoleB) return [];
    return SECTIONS.map(section => {
      const aPerms = compareRoleA.perms[section.id];
      const bPerms = compareRoleB.perms[section.id];
      const permStatus = PERMISSIONS.map(perm => {
        const inA = aPerms?.[perm] ?? false;
        const inB = bPerms?.[perm] ?? false;
        return { perm, inA, inB, status: inA && inB ? 'both' : inA ? 'only-a' : inB ? 'only-b' : 'none' };
      });
      return { section, permStatus };
    });
  }, [compareRoleA, compareRoleB]);

  // ---- Filtered sections ----
  const filteredSections = searchQuery
    ? SECTIONS.filter(s => s.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : SECTIONS;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Icon name="ShieldCheck" size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Конструктор ролей</h1>
            <p className="text-xs text-gray-500">Управление правами доступа</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Icon name="Users" size={12} className="mr-1" />
            {roles.length} ролей
          </Badge>
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Icon name="Plus" size={16} className="mr-1.5" />
            Создать роль
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden gap-0">

        {/* Left panel — roles list */}
        <aside className="w-64 shrink-0 bg-white border-r flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b">
            <Input
              placeholder="Поиск роли…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {roles
              .filter(r => !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(role => (
                <button
                  key={role.id}
                  onClick={() => selectRole(role)}
                  className={`w-full text-left px-3 py-3 rounded-xl border-l-4 transition-all
                    ${selectedRoleId === role.id
                      ? `${role.color} bg-blue-50 border border-blue-200 border-l-4`
                      : `${role.color} bg-white border border-gray-100 hover:bg-gray-50`
                    }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-sm text-gray-900 leading-tight">{role.name}</span>
                    <Badge className={`${role.badgeColor} text-xs shrink-0`}>{role.users}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{role.description}</p>
                  <p className="text-xs text-gray-400 mt-1">Изменено: {role.lastModified}</p>
                </button>
              ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden">

          {/* Tabs */}
          <div className="bg-white border-b px-6 pt-4 flex items-center justify-between shrink-0">
            <div className="flex gap-1">
              {([
                { key: 'matrix', label: 'Матрица разрешений', icon: 'LayoutGrid' },
                { key: 'compare', label: 'Сравнение ролей', icon: 'GitCompare' },
              ] as { key: ActiveTab; label: string; icon: string }[]).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors
                    ${activeTab === tab.key
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <Icon name={tab.icon} size={15} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-6">

            {/* ---- MATRIX TAB ---- */}
            {activeTab === 'matrix' && (
              <div className="space-y-4">

                {/* Role info + actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${selectedRole.color.replace('border-l-', 'bg-')}`} />
                    <div>
                      <h2 className="font-semibold text-gray-900">{selectedRole.name}</h2>
                      <p className="text-sm text-gray-500">{selectedRole.description}</p>
                    </div>
                    <Badge className={selectedRole.badgeColor}>
                      <Icon name="Users" size={12} className="mr-1" />
                      {selectedRole.users} пользователей
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Presets */}
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => applyPreset('full')}
                        className="px-2.5 py-1 text-xs font-medium rounded-md bg-white shadow-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        title="Полный доступ"
                      >
                        <Icon name="ShieldCheck" size={13} className="inline mr-1" />
                        Полный
                      </button>
                      <button
                        onClick={() => applyPreset('view')}
                        className="px-2.5 py-1 text-xs font-medium rounded-md text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        title="Только просмотр"
                      >
                        <Icon name="Eye" size={13} className="inline mr-1" />
                        Просмотр
                      </button>
                      <button
                        onClick={() => applyPreset('reset')}
                        className="px-2.5 py-1 text-xs font-medium rounded-md text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Сбросить всё"
                      >
                        <Icon name="X" size={13} className="inline mr-1" />
                        Сбросить
                      </button>
                    </div>
                    <Button size="sm" onClick={savePerms}>
                      <Icon name="Save" size={15} className="mr-1.5" />
                      Сохранить изменения
                    </Button>
                  </div>
                </div>

                {/* Permission table */}
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="text-left px-4 py-3 font-medium text-gray-600 w-52">Раздел системы</th>
                          <th className="px-3 py-3 font-medium text-gray-500 text-center w-14">
                            <span className="text-xs">Все</span>
                          </th>
                          {PERMISSIONS.map(perm => (
                            <th key={perm} className="px-3 py-3 text-center min-w-[96px]">
                              <button
                                onClick={() => toggleAllForPerm(perm)}
                                className="flex flex-col items-center gap-1 mx-auto hover:opacity-80 transition-opacity group"
                                title={`Переключить «${PERM_LABELS[perm]}» для всех разделов`}
                              >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors
                                  ${SECTIONS.every(s => perms[s.id]?.[perm])
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100'
                                  }`}>
                                  <Icon name={PERM_ICONS[perm]} size={12} />
                                </div>
                                <span className="text-xs font-medium text-gray-600 whitespace-nowrap">{PERM_LABELS[perm]}</span>
                              </button>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredSections.map((section, idx) => {
                          const sp = perms[section.id] ?? emptyPerms();
                          const allOn = PERMISSIONS.every(p => sp[p]);
                          const someOn = PERMISSIONS.some(p => sp[p]);
                          return (
                            <tr key={section.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                    <Icon name={section.icon} size={14} className="text-gray-500" />
                                  </div>
                                  <span className="font-medium text-gray-800">{section.label}</span>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <CheckboxCell
                                  checked={allOn}
                                  indeterminate={!allOn && someOn}
                                  onChange={() => toggleAllForSection(section.id)}
                                />
                              </td>
                              {PERMISSIONS.map(perm => (
                                <td key={perm} className="px-3 py-3 text-center">
                                  <CheckboxCell
                                    checked={sp[perm] ?? false}
                                    onChange={() => togglePerm(section.id, perm)}
                                  />
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Legend */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded border-2 bg-blue-600 border-blue-600 flex items-center justify-center">
                      <Icon name="Check" size={9} className="text-white" />
                    </div>
                    <span>Разрешено</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded border-2 bg-blue-200 border-blue-400 flex items-center justify-center">
                      <Icon name="Check" size={9} className="text-white" />
                    </div>
                    <span>Частично</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded border-2 border-gray-300" />
                    <span>Запрещено</span>
                  </div>
                  <span className="ml-2 text-gray-400">
                    Кликните по заголовку колонки, чтобы переключить разрешение для всех разделов
                  </span>
                </div>
              </div>
            )}

            {/* ---- COMPARE TAB ---- */}
            {activeTab === 'compare' && (
              <div className="space-y-4">

                {/* Role selectors */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Выберите роли для сравнения</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Роль A</label>
                        <select
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          value={compareRoleAId}
                          onChange={e => setCompareRoleAId(e.target.value)}
                        >
                          {roles.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="pt-4">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <Icon name="ArrowLeftRight" size={16} className="text-gray-500" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Роль B</label>
                        <select
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          value={compareRoleBId}
                          onChange={e => setCompareRoleBId(e.target.value)}
                        >
                          {roles.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Legend */}
                <div className="flex items-center gap-6 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-300 flex items-center justify-center">
                      <Icon name="Check" size={9} className="text-emerald-600" />
                    </div>
                    <span className="text-gray-600">У обеих ролей</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300 flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-[9px]">A</span>
                    </div>
                    <span className="text-gray-600">Только у роли A</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-orange-100 border border-orange-300 flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-[9px]">B</span>
                    </div>
                    <span className="text-gray-600">Только у роли B</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200" />
                    <span className="text-gray-600">Нет у обеих</span>
                  </div>
                </div>

                {/* Comparison table */}
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="text-left px-4 py-3 font-medium text-gray-600 w-48">Раздел</th>
                          {PERMISSIONS.map(perm => (
                            <th key={perm} className="px-3 py-3 text-center min-w-[96px]">
                              <div className="flex flex-col items-center gap-0.5">
                                <Icon name={PERM_ICONS[perm]} size={13} className="text-gray-400" />
                                <span className="text-xs font-medium text-gray-600 whitespace-nowrap">{PERM_LABELS[perm]}</span>
                              </div>
                            </th>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="px-4 py-2" />
                          {PERMISSIONS.map(perm => (
                            <td key={perm} className="px-3 py-2">
                              <div className="flex justify-center gap-1">
                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 rounded px-1.5 py-0.5">
                                  {compareRoleA?.name.slice(0, 4) ?? 'A'}
                                </span>
                                <span className="text-xs font-semibold text-orange-600 bg-orange-50 rounded px-1.5 py-0.5">
                                  {compareRoleB?.name.slice(0, 4) ?? 'B'}
                                </span>
                              </div>
                            </td>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {compareData.map(({ section, permStatus }, idx) => (
                          <tr key={section.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                  <Icon name={section.icon} size={14} className="text-gray-500" />
                                </div>
                                <span className="font-medium text-gray-800">{section.label}</span>
                              </div>
                            </td>
                            {permStatus.map(({ perm, inA, inB, status }) => (
                              <td key={perm} className="px-3 py-3 text-center">
                                <div className="flex justify-center gap-1">
                                  {/* Cell A */}
                                  <div className={`w-6 h-6 rounded-md flex items-center justify-center border text-xs font-bold transition-colors
                                    ${status === 'both'
                                      ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                                      : inA
                                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                                      : 'bg-gray-100 border-gray-200 text-gray-300'
                                    }`}
                                    title={`${compareRoleA?.name}: ${inA ? 'есть' : 'нет'}`}
                                  >
                                    {inA ? (status === 'both' ? <Icon name="Check" size={11} /> : 'A') : '—'}
                                  </div>
                                  {/* Cell B */}
                                  <div className={`w-6 h-6 rounded-md flex items-center justify-center border text-xs font-bold transition-colors
                                    ${status === 'both'
                                      ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                                      : inB
                                      ? 'bg-orange-100 border-orange-300 text-orange-700'
                                      : 'bg-gray-100 border-gray-200 text-gray-300'
                                    }`}
                                    title={`${compareRoleB?.name}: ${inB ? 'есть' : 'нет'}`}
                                  >
                                    {inB ? (status === 'both' ? <Icon name="Check" size={11} /> : 'B') : '—'}
                                  </div>
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Summary stats */}
                {compareRoleA && compareRoleB && (() => {
                  let both = 0;
                  let onlyA = 0;
                  let onlyB = 0;
                  let none = 0;
                  compareData.forEach(({ permStatus }) => {
                    permStatus.forEach(({ status }) => {
                      if (status === 'both') both++;
                      else if (status === 'only-a') onlyA++;
                      else if (status === 'only-b') onlyB++;
                      else none++;
                    });
                  });
                  const total = both + onlyA + onlyB;
                  return (
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Общих разрешений', value: both, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                        { label: `Только у «${compareRoleA.name}»`, value: onlyA, color: 'bg-blue-50 border-blue-200 text-blue-700' },
                        { label: `Только у «${compareRoleB.name}»`, value: onlyB, color: 'bg-orange-50 border-orange-200 text-orange-700' },
                      ].map(stat => (
                        <div key={stat.label} className={`rounded-xl border p-4 ${stat.color}`}>
                          <div className="text-2xl font-bold">{stat.value}</div>
                          <div className="text-xs mt-0.5 opacity-80">{stat.label}</div>
                          {total > 0 && (
                            <div className="text-xs mt-1 opacity-60">
                              {Math.round((stat.value / (both + onlyA + onlyB || 1)) * 100)}% от выданных
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Create Role Modal */}
      {showCreateModal && (
        <CreateRoleModal
          roles={roles}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateRole}
        />
      )}
    </div>
  );
};

export default RolesConstructorFull;
