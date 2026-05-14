import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';

type Category = 'SLA' | 'Финансы' | 'HR' | 'Склад' | 'Безопасность' | 'Бизнес';
type Priority = 'high' | 'medium' | 'low';

interface NotificationItem {
  id: string;
  category: Category;
  type: string;
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  timestamp: string;
  priority: Priority;
  unread: boolean;
  needsAction: boolean;
}

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    category: 'SLA',
    type: 'SLA Warning',
    icon: 'AlertCircle',
    iconColor: 'text-red-600',
    title: 'Наряд WO-2026-1234 будет просрочен через 45 минут',
    description: 'Клиент: ООО «Аркт.Холод», SLA TTR=4ч, осталось 0:45. Назначить помощь?',
    timestamp: '2 минуты назад',
    priority: 'high',
    unread: true,
    needsAction: true,
  },
  {
    id: 'n2',
    category: 'HR',
    type: 'Сертификация',
    icon: 'BadgeAlert',
    iconColor: 'text-amber-600',
    title: 'Технику Иванову нужно продлить сертификат R-32',
    description: 'Срок действия сертификата истекает через 14 дней (28.05.2026). Подать заявку?',
    timestamp: '15 минут назад',
    priority: 'medium',
    unread: true,
    needsAction: true,
  },
  {
    id: 'n3',
    category: 'Финансы',
    type: 'Просрочка платежа',
    icon: 'DollarSign',
    iconColor: 'text-red-600',
    title: 'Не оплачен счёт INV-2026-456',
    description: 'Просрочка 5 дней, сумма 47 000 ₽. Клиент: ТЦ «Мега». Отправить напоминание?',
    timestamp: '1 час назад',
    priority: 'high',
    unread: true,
    needsAction: true,
  },
  {
    id: 'n4',
    category: 'Бизнес',
    type: 'VIP-заявка',
    icon: 'Star',
    iconColor: 'text-amber-500',
    title: 'Заявка APP-2026-789 от VIP-клиента',
    description: 'Торговый дом «Глобус» — приоритет высокий, требует немедленного назначения.',
    timestamp: '1 час назад',
    priority: 'high',
    unread: true,
    needsAction: false,
  },
  {
    id: 'n5',
    category: 'Финансы',
    type: 'Низкая маржа',
    icon: 'TrendingDown',
    iconColor: 'text-orange-600',
    title: 'Маржа наряда WO-2026-1100 опустилась ниже порога',
    description: 'Фактическая маржа: 18% (порог 25%). Превышение себестоимости ЗИП.',
    timestamp: '2 часа назад',
    priority: 'medium',
    unread: true,
    needsAction: false,
  },
  {
    id: 'n6',
    category: 'Склад',
    type: 'Низкий остаток',
    icon: 'PackageX',
    iconColor: 'text-amber-600',
    title: 'Хладагент R-410A на складе ниже минимума',
    description: 'Остаток: 8 кг (минимум 20 кг). Сформировать заявку поставщику?',
    timestamp: '3 часа назад',
    priority: 'medium',
    unread: true,
    needsAction: true,
  },
  {
    id: 'n7',
    category: 'SLA',
    type: 'Новый наряд',
    icon: 'Wrench',
    iconColor: 'text-blue-600',
    title: 'Новый аварийный наряд WO-2026-1342',
    description: 'БЦ «Северная Башня», чиллер York YCSA-150, код F12. ETA — 90 мин.',
    timestamp: '3 часа назад',
    priority: 'high',
    unread: true,
    needsAction: false,
  },
  {
    id: 'n8',
    category: 'Безопасность',
    type: 'Вход в систему',
    icon: 'ShieldAlert',
    iconColor: 'text-red-500',
    title: 'Попытка входа с нового устройства',
    description: 'Пользователь petrov@servisklimat.ru, IP 95.165.x.x, г. Казань. Подтвердить?',
    timestamp: '4 часа назад',
    priority: 'high',
    unread: false,
    needsAction: true,
  },
  {
    id: 'n9',
    category: 'HR',
    type: 'Расчётный листок',
    icon: 'FileText',
    iconColor: 'text-emerald-600',
    title: 'Расчётный листок за апрель 2026 готов',
    description: 'Начислено: 87 450 ₽ (оклад + сдельная + ГСМ). Открыть детализацию.',
    timestamp: '5 часов назад',
    priority: 'low',
    unread: false,
    needsAction: false,
  },
  {
    id: 'n10',
    category: 'Бизнес',
    type: 'КП принято',
    icon: 'CheckCircle2',
    iconColor: 'text-emerald-600',
    title: 'Принято КП №CP-2026-088',
    description: 'Клиент ООО «Климат-Сервис» принял вариант «Оптимальный» на сумму 218 000 ₽.',
    timestamp: 'вчера в 18:24',
    priority: 'medium',
    unread: false,
    needsAction: false,
  },
  {
    id: 'n11',
    category: 'Склад',
    type: 'Утечка хладагента',
    icon: 'AlertTriangle',
    iconColor: 'text-red-600',
    title: 'Показатель утечки R-32 превышает норму',
    description: 'Оборудование EQ-2026-450 (Daikin VRV-IV): 34% (норма 30%). Внеплановое ТО.',
    timestamp: 'вчера в 16:10',
    priority: 'high',
    unread: false,
    needsAction: true,
  },
  {
    id: 'n12',
    category: 'Финансы',
    type: 'Оплата получена',
    icon: 'DollarSign',
    iconColor: 'text-emerald-600',
    title: 'Поступление по счёту INV-2026-440',
    description: 'Сумма 32 500 ₽ от ООО «Громов и Партнёры». Зачислено на расчётный счёт.',
    timestamp: 'вчера в 14:30',
    priority: 'low',
    unread: false,
    needsAction: false,
  },
  {
    id: 'n13',
    category: 'HR',
    type: 'Отпуск',
    icon: 'Calendar',
    iconColor: 'text-blue-600',
    title: 'Заявка на отпуск от инженера Кузнецова',
    description: 'Период: 03.06.2026 — 16.06.2026 (14 дней). Согласовать?',
    timestamp: 'вчера в 11:45',
    priority: 'medium',
    unread: false,
    needsAction: true,
  },
  {
    id: 'n14',
    category: 'SLA',
    type: 'SLA выполнен',
    icon: 'CheckCircle',
    iconColor: 'text-emerald-600',
    title: 'Наряд WO-2026-1120 закрыт в SLA',
    description: 'TTR=2:45 (норма 4:00). Оценка клиента — 5 звёзд. Молодцы!',
    timestamp: '2 дня назад',
    priority: 'low',
    unread: false,
    needsAction: false,
  },
  {
    id: 'n15',
    category: 'Безопасность',
    type: 'Резервная копия',
    icon: 'DatabaseBackup',
    iconColor: 'text-gray-600',
    title: 'Резервное копирование БД выполнено',
    description: 'Размер: 2.4 ГБ. Хранилище: MinIO backup-bucket. Контрольная сумма OK.',
    timestamp: '2 дня назад',
    priority: 'low',
    unread: false,
    needsAction: false,
  },
];

const CATEGORIES: { key: Category | 'all'; title: string; icon: string }[] = [
  { key: 'all', title: 'Все категории', icon: 'Layers' },
  { key: 'SLA', title: 'SLA', icon: 'Clock' },
  { key: 'Финансы', title: 'Финансы', icon: 'DollarSign' },
  { key: 'HR', title: 'HR', icon: 'Users' },
  { key: 'Склад', title: 'Склад', icon: 'Package' },
  { key: 'Безопасность', title: 'Безопасность', icon: 'Shield' },
  { key: 'Бизнес', title: 'Бизнес', icon: 'Briefcase' },
];

const priorityStyle: Record<Priority, { dot: string; label: string; badge: string }> = {
  high: { dot: 'bg-red-500', label: 'Критично', badge: 'bg-red-100 text-red-700' },
  medium: { dot: 'bg-amber-500', label: 'Средне', badge: 'bg-amber-100 text-amber-700' },
  low: { dot: 'bg-emerald-500', label: 'Низко', badge: 'bg-emerald-100 text-emerald-700' },
};

export default function NotificationsCenter() {
  const [tab, setTab] = useState<'all' | 'unread' | 'archive'>('all');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [prefs, setPrefs] = useState({
    SLA: { email: true, push: true, telegram: true, sound: true },
    Финансы: { email: true, push: true, telegram: false, sound: false },
    HR: { email: true, push: false, telegram: false, sound: false },
    Склад: { email: false, push: true, telegram: true, sound: false },
    Безопасность: { email: true, push: true, telegram: true, sound: true },
    Бизнес: { email: false, push: true, telegram: false, sound: false },
  });

  const togglePref = (cat: Category, channel: 'email' | 'push' | 'telegram' | 'sound') => {
    setPrefs((p) => ({ ...p, [cat]: { ...p[cat], [channel]: !p[cat][channel] } }));
  };

  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;
  const criticalCount = NOTIFICATIONS.filter((n) => n.priority === 'high' && n.unread).length;
  const actionCount = NOTIFICATIONS.filter((n) => n.needsAction && n.unread).length;

  const filtered = NOTIFICATIONS.filter((n) => {
    if (tab === 'unread' && !n.unread) return false;
    if (tab === 'archive' && n.unread) return false;
    if (category !== 'all' && n.category !== category) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <Icon name="Bell" size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Центр уведомлений</h1>
            <p className="text-sm text-gray-500">Все важные события системы в одном месте</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success('Все уведомления отмечены прочитанными')}>
            <Icon name="CheckCheck" size={14} className="mr-1" /> Прочитать всё
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Icon name="Filter" size={14} className="mr-1" /> Фильтр
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>По типу</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast.info('Только критичные')}>
                <span className="mr-2 h-2 w-2 rounded-full bg-red-500" /> Только критичные
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info('Требуют действий')}>
                <Icon name="Zap" size={14} className="mr-2" /> Требуют действий
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info('За сегодня')}>
                <Icon name="Calendar" size={14} className="mr-2" /> За сегодня
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Icon name="Settings" size={14} className="mr-1" /> Настройки
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Настройки уведомлений</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-5 gap-2 border-b pb-2 text-xs font-semibold text-gray-500">
                  <div>Категория</div>
                  <div className="text-center">Email</div>
                  <div className="text-center">Push</div>
                  <div className="text-center">Telegram</div>
                  <div className="text-center">Звук</div>
                </div>
                {(Object.keys(prefs) as Category[]).map((cat) => (
                  <div key={cat} className="grid grid-cols-5 items-center gap-2 py-1">
                    <div className="text-sm font-medium">{cat}</div>
                    <div className="flex justify-center">
                      <Switch checked={prefs[cat].email} onCheckedChange={() => togglePref(cat, 'email')} />
                    </div>
                    <div className="flex justify-center">
                      <Switch checked={prefs[cat].push} onCheckedChange={() => togglePref(cat, 'push')} />
                    </div>
                    <div className="flex justify-center">
                      <Switch checked={prefs[cat].telegram} onCheckedChange={() => togglePref(cat, 'telegram')} />
                    </div>
                    <div className="flex justify-center">
                      <Switch checked={prefs[cat].sound} onCheckedChange={() => togglePref(cat, 'sound')} />
                    </div>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    setSettingsOpen(false);
                    toast.success('Настройки уведомлений сохранены');
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Сохранить
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <div className="text-xs text-gray-500">Непрочитанные</div>
              <div className="text-2xl font-semibold text-gray-900">{unreadCount}</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Icon name="Mail" size={18} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <div className="text-xs text-gray-500">Критичных</div>
              <div className="text-2xl font-semibold text-red-600">{criticalCount}</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <Icon name="AlertCircle" size={18} className="text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <div className="text-xs text-gray-500">Требуют действий</div>
              <div className="text-2xl font-semibold text-amber-600">{actionCount}</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <Icon name="Zap" size={18} className="text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        {/* LEFT: Categories */}
        <Card className="w-[220px] shrink-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Категории</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="space-y-1">
              {CATEGORIES.map((c) => {
                const active = category === c.key;
                const count =
                  c.key === 'all'
                    ? NOTIFICATIONS.length
                    : NOTIFICATIONS.filter((n) => n.category === c.key).length;
                return (
                  <button
                    key={c.key}
                    onClick={() => setCategory(c.key)}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                      active ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon name={c.icon} size={14} />
                      {c.title}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {count}
                    </Badge>
                  </button>
                );
              })}
            </div>
            <Separator className="my-3" />
            <div className="px-2 pb-2 text-xs text-gray-500">
              <div className="mb-2 font-semibold">Приоритеты</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500" /> Критично
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> Средне
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Низко
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: Notifications list */}
        <div className="flex-1">
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mb-3">
            <TabsList>
              <TabsTrigger value="all">Все ({NOTIFICATIONS.length})</TabsTrigger>
              <TabsTrigger value="unread">Непрочитанные ({unreadCount})</TabsTrigger>
              <TabsTrigger value="archive">Архив</TabsTrigger>
            </TabsList>
          </Tabs>

          <ScrollArea className="h-[calc(100vh-340px)]">
            <div className="space-y-2 pr-2">
              {filtered.map((n) => {
                const p = priorityStyle[n.priority];
                return (
                  <Card
                    key={n.id}
                    className={`shadow-sm transition-colors hover:bg-gray-50 ${n.unread ? 'border-l-4' : ''}`}
                    style={n.unread ? { borderLeftColor: 'var(--primary, #2563eb)' } : {}}
                  >
                    <CardContent className="flex gap-3 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                        <Icon name={n.icon} size={18} className={n.iconColor} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="mb-1 flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px]">
                                {n.type}
                              </Badge>
                              <Badge className={`text-[10px] ${p.badge}`} variant="outline">
                                <span className={`mr-1 h-1.5 w-1.5 rounded-full ${p.dot}`} />
                                {p.label}
                              </Badge>
                              {n.needsAction && (
                                <Badge variant="outline" className="bg-blue-50 text-[10px] text-blue-700">
                                  <Icon name="Zap" size={10} className="mr-0.5" /> Действие
                                </Badge>
                              )}
                              {n.unread && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                            </div>
                            <div className="text-sm font-semibold text-gray-900">{n.title}</div>
                            <div className="mt-1 text-xs text-gray-600">{n.description}</div>
                          </div>
                          <div className="shrink-0 text-[11px] text-gray-500">{n.timestamp}</div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            className="h-7 bg-blue-600 text-xs hover:bg-blue-700"
                            onClick={() => toast.success(`Открыто: ${n.title.slice(0, 40)}…`)}
                          >
                            <Icon name="ExternalLink" size={12} className="mr-1" /> Открыть
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => toast.info('Отложено на 1 час')}
                          >
                            <Icon name="Clock" size={12} className="mr-1" /> Отложить
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => toast.success('Отмечено прочитанным')}
                          >
                            <Icon name="Check" size={12} className="mr-1" /> Прочитано
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {filtered.length === 0 && (
                <div className="rounded-lg border border-dashed bg-white p-12 text-center text-sm text-gray-500">
                  <Icon name="BellOff" size={32} className="mx-auto mb-2 text-gray-400" />
                  Уведомлений нет
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
