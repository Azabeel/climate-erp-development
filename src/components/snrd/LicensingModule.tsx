import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const modules = [
  { id: 'orders', label: 'Заявки', icon: 'ClipboardList', description: 'Приём и обработка заявок от клиентов' },
  { id: 'workorders', label: 'Наряды', icon: 'FileText', description: 'Управление нарядами и выездными работами' },
  { id: 'crm', label: 'CRM', icon: 'Users', description: 'Управление клиентами и воронкой продаж' },
  { id: 'stock', label: 'Склад', icon: 'Package', description: 'Учёт материалов и запасных частей' },
  { id: 'hr', label: 'HR и зарплата', icon: 'UserCheck', description: 'Учёт сотрудников, графики, расчёт зарплаты' },
  { id: 'finance', label: 'Финансы', icon: 'DollarSign', description: 'Счета, акты, маржинальность' },
  { id: 'sla', label: 'SLA мониторинг', icon: 'Clock', description: 'Контроль уровней обслуживания' },
  { id: 'planning', label: 'Планирование', icon: 'Calendar', description: 'Умное расписание выездов инженеров' },
  { id: 'eam', label: 'EAM (оборудование)', icon: 'Wind', description: 'Учёт и обслуживание оборудования клиентов' },
  { id: 'refrigerant', label: 'Хладагенты', icon: 'Thermometer', description: 'Журнал операций с хладагентами' },
  { id: 'purchases', label: 'Закупки / ЗИП', icon: 'ShoppingCart', description: 'Заказ запасных частей у поставщиков' },
  { id: 'analytics', label: 'Аналитика', icon: 'BarChart2', description: 'Отчёты, дашборды, KPI' },
  { id: 'ai', label: 'ИИ-агенты', icon: 'Bot', description: 'Технический консультант и бизнес-аналитик' },
  { id: 'integrations', label: 'Интеграции', icon: 'Plug', description: 'Мессенджеры, 1С, доставка, телефония' },
  { id: 'mobile', label: 'Мобильное приложение', icon: 'Smartphone', description: 'Android-приложение для инженеров' },
  { id: 'notifications', label: 'Уведомления', icon: 'Bell', description: 'Автоматические оповещения клиентов и сотрудников' },
  { id: 'documents', label: 'Документооборот', icon: 'FolderOpen', description: 'Счета, акты, КП в формате PDF' },
  { id: 'portal', label: 'Клиентский портал', icon: 'Globe', description: 'Личный кабинет клиента на сайте' },
  { id: 'settings', label: 'Настройки', icon: 'Settings', description: 'Системные параметры и конфигурация' },
];

const activeUsers = [
  { name: 'Иванова Елена Сергеевна', role: 'Диспетчер', lastLogin: '14.05.2026 09:12', status: 'Онлайн' },
  { name: 'Петров Дмитрий Алексеевич', role: 'Инженер', lastLogin: '14.05.2026 08:47', status: 'Онлайн' },
  { name: 'Сидорова Анна Владимировна', role: 'Менеджер', lastLogin: '13.05.2026 18:30', status: 'Офлайн' },
  { name: 'Козлов Андрей Николаевич', role: 'Руководитель', lastLogin: '14.05.2026 10:05', status: 'Онлайн' },
  { name: 'Морозова Ирина Петровна', role: 'Бухгалтер', lastLogin: '13.05.2026 17:00', status: 'Офлайн' },
  { name: 'Новиков Сергей Иванович', role: 'Инженер', lastLogin: '14.05.2026 07:55', status: 'Онлайн' },
];

const LicensingModule = () => {
  const [moduleStates, setModuleStates] = useState<Record<string, boolean>>(
    Object.fromEntries(modules.map(m => [m.id, true]))
  );
  const [keyVisible, setKeyVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const licenseKey = 'SK4-ENTR-2026-XQPZ-7R2M-49WK';
  const maskedKey = 'SK4-ENTR-****-****-****-****';

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleModule = (id: string) => {
    setModuleStates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* License Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="ShieldCheck" size={20} className="text-blue-600" />
            Информация о лицензии
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-500">Продукт</span>
                <span className="text-sm font-semibold text-gray-900">HVAC ERP v4.0</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-500">Тип лицензии</span>
                <Badge className="bg-purple-100 text-purple-700">Enterprise</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-500">Лицензиат</span>
                <span className="text-sm font-medium text-gray-900">ООО Сервис Климат</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-500">Действует до</span>
                <span className="text-sm font-medium text-gray-900">31.12.2026</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-500">Максимум пользователей</span>
                <span className="text-sm font-medium text-gray-900">50</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-500">Активных пользователей</span>
                <span className="text-sm font-semibold text-blue-600">23</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">Статус</span>
                <Badge className="bg-green-100 text-green-700">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-1"></span>
                  Активна
                </Badge>
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Лицензионный ключ</p>
                <div className="flex items-center gap-2 bg-gray-50 border rounded-lg px-3 py-2">
                  <Icon name="Key" size={16} className="text-gray-400" />
                  <span className="flex-1 text-sm font-mono text-gray-700">
                    {keyVisible ? licenseKey : maskedKey}
                  </span>
                  <button
                    onClick={() => setKeyVisible(v => !v)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Icon name={keyVisible ? 'EyeOff' : 'Eye'} size={14} />
                  </button>
                </div>
                <div className="mt-2">
                  <Button size="sm" variant="outline" onClick={handleCopy}>
                    <Icon name={copied ? 'Check' : 'Copy'} size={14} className="mr-1" />
                    {copied ? 'Скопировано' : 'Скопировать ключ'}
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="Info" size={16} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Использование мест</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-2 mb-1">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '46%' }}></div>
                </div>
                <p className="text-xs text-blue-700">23 из 50 пользователей (46%)</p>
              </div>

              <div className="flex gap-3 mt-4">
                <Button className="flex-1">
                  <Icon name="RefreshCw" size={14} className="mr-2" />
                  Обновить лицензию
                </Button>
                <Button variant="outline" className="flex-1">
                  <Icon name="Headphones" size={14} className="mr-2" />
                  Техподдержка
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Activation Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="LayoutGrid" size={20} className="text-blue-600" />
            Активация модулей
            <Badge className="ml-auto bg-gray-100 text-gray-700">
              {Object.values(moduleStates).filter(Boolean).length} из {modules.length} включено
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {modules.map(mod => (
              <div
                key={mod.id}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                  moduleStates[mod.id]
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  moduleStates[mod.id] ? 'bg-blue-100' : 'bg-gray-200'
                }`}>
                  <Icon name={mod.icon as never} size={18} className={moduleStates[mod.id] ? 'text-blue-600' : 'text-gray-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-sm font-medium truncate ${
                      moduleStates[mod.id] ? 'text-gray-900' : 'text-gray-400'
                    }`}>{mod.label}</span>
                    <Switch
                      checked={moduleStates[mod.id]}
                      onCheckedChange={() => toggleModule(mod.id)}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{mod.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Users" size={20} className="text-blue-600" />
            Активные пользователи
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пользователь</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Последний вход</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeUsers.map((user, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>
                    <Badge className="bg-gray-100 text-gray-700">{user.role}</Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">{user.lastLogin}</TableCell>
                  <TableCell>
                    <Badge className={user.status === 'Онлайн' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                      <span className={`w-1.5 h-1.5 rounded-full inline-block mr-1 ${
                        user.status === 'Онлайн' ? 'bg-green-500' : 'bg-gray-400'
                      }`}></span>
                      {user.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default LicensingModule;
