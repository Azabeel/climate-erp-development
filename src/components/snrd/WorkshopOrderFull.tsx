import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// ─────────────────────────────────────────────
// Static data — WO-2026-000342
// ─────────────────────────────────────────────

const ORDER = {
  id: 'WO-2026-000342',
  status: 'В работе',
  priority: 'Срочный',
  type: 'Ремонт',
  source: 'Телефон',
  createdAt: '18.05.2026 09:15',
  description:
    'Наружный блок Daikin VRV IV не запускается. По словам клиента — пропало охлаждение в серверной комнате. Предварительно: неисправность платы управления или компрессора. Температура в серверной уже +32°C. Требуется срочная диагностика.',
};

const CLIENT = {
  name: 'ООО Ромашка',
  type: 'Юр.лицо',
  phone: '+7 (495) 321-77-44',
  email: 'service@romashka-group.ru',
  sla: 'Бизнес',
  contactPerson: 'Петрова Ирина Сергеевна',
};

const EQUIPMENT = {
  brand: 'Daikin',
  model: 'REYQ16T7Y1B (VRV IV)',
  serial: 'DK240811029A',
  address: 'г. Москва, ул. Академика Королёва, 12, оф. 401',
  installYear: 2024,
  lastMaintenance: '14.02.2026',
};

const SLA = [
  { key: 'TTR', label: 'Время реагирования (TTR)', limitH: 2, elapsedH: 1.2, status: 'yellow' as const },
  { key: 'TTO', label: 'Время прибытия (TTO)', limitH: 4, elapsedH: 1.5, status: 'green' as const },
  { key: 'TTF', label: 'Время устранения (TTF)', limitH: 8, elapsedH: 1.5, status: 'green' as const },
];

const ENGINEER = {
  name: 'Громов Алексей Викторович',
  phone: '+7 (916) 555-22-11',
  status: 'Выехал',
  eta: 25,
};

const SERVICES = [
  { id: 1, name: 'Диагностика VRV-системы', qty: 1, price: 3500, total: 3500 },
  { id: 2, name: 'Замена платы управления', qty: 1, price: 8900, total: 8900 },
  { id: 3, name: 'Дозаправка R-410A (до 1 кг)', qty: 1, price: 1800, total: 1800 },
  { id: 4, name: 'Выездная работа (срочная)', qty: 1, price: 2500, total: 2500 },
];

const MATERIALS = [
  { id: 1, name: 'Хладагент R-410A', qty: 0.6, unit: 'кг', price: 1400, total: 840 },
  { id: 2, name: 'Набор уплотнений', qty: 1, unit: 'компл.', price: 120, total: 120 },
  { id: 3, name: 'Кабельная стяжка 300 мм', qty: 10, unit: 'шт.', price: 8, total: 80 },
];

const ZIP_ITEMS = [
  { id: 1, name: 'Плата управления Daikin REYQ16 (2024+)', status: 'Заказано', eta: '20.05.2026' },
  { id: 2, name: 'Реле пускозащитное 24V', status: 'Получено', eta: '18.05.2026' },
  { id: 3, name: 'Конденсатор пусковой 50мкФ', status: 'Заказано', eta: '21.05.2026' },
];

const HISTORY = [
  { id: 1, icon: 'FilePlus', color: 'bg-blue-100 text-blue-700', action: 'Наряд создан', user: 'Иванова Н. В. (Диспетчер)', dt: '18.05.2026 09:15' },
  { id: 2, icon: 'PhoneCall', color: 'bg-sky-100 text-sky-700', action: 'Входящий звонок от клиента зафиксирован', user: 'Система', dt: '18.05.2026 09:12' },
  { id: 3, icon: 'UserCheck', color: 'bg-indigo-100 text-indigo-700', action: 'Назначен инженер Громов А. В.', user: 'Иванова Н. В.', dt: '18.05.2026 09:20' },
  { id: 4, icon: 'Bell', color: 'bg-purple-100 text-purple-700', action: 'Уведомление клиенту отправлено (SMS + Email)', user: 'Система', dt: '18.05.2026 09:21' },
  { id: 5, icon: 'Navigation', color: 'bg-orange-100 text-orange-700', action: 'Статус → Выехал', user: 'Громов А. В.', dt: '18.05.2026 09:50' },
  { id: 6, icon: 'ShoppingCart', color: 'bg-yellow-100 text-yellow-700', action: 'Создана заявка на ЗИП PR-2026-000901', user: 'Громов А. В.', dt: '18.05.2026 10:05' },
  { id: 7, icon: 'AlertTriangle', color: 'bg-red-100 text-red-700', action: 'SLA предупреждение: TTR — жёлтая зона', user: 'Система', dt: '18.05.2026 10:10' },
  { id: 8, icon: 'MessageSquare', color: 'bg-teal-100 text-teal-700', action: 'Комментарий: «Пробки — опаздываю на 15 мин»', user: 'Громов А. В.', dt: '18.05.2026 10:15' },
  { id: 9, icon: 'MapPin', color: 'bg-green-100 text-green-700', action: 'GPS — инженер в зоне 500 м от объекта', user: 'Система', dt: '18.05.2026 10:28' },
  { id: 10, icon: 'Wrench', color: 'bg-gray-100 text-gray-700', action: 'Начата диагностика оборудования', user: 'Громов А. В.', dt: '18.05.2026 10:35' },
];

const PHOTOS = [
  { id: 1, label: 'До работ', color: '#BFDBFE' },
  { id: 2, label: 'Диагностика', color: '#DDD6FE' },
  { id: 3, label: 'Демонтаж', color: '#FDE68A' },
  { id: 4, label: 'Монтаж платы', color: '#BBF7D0' },
  { id: 5, label: 'После работ', color: '#A7F3D0' },
  { id: 6, label: 'Контроль работы', color: '#BAE6FD' },
  { id: 7, label: 'Внешний блок', color: '#FED7AA' },
  { id: 8, label: 'Пломба', color: '#F9A8D4' },
];

const STATUS_OPTIONS = [
  { value: 'EN_ROUTE', label: 'Выехал' },
  { value: 'ON_SITE', label: 'На объекте' },
  { value: 'IN_PROGRESS', label: 'В работе' },
  { value: 'AWAITING_PARTS', label: 'Ожидание ЗИП' },
  { value: 'COMPLETED', label: 'Выполнен' },
  { value: 'CANCELLED', label: 'Отменён' },
];

const ENGINEERS_LIST = [
  'Громов А. В.',
  'Климов Д. И.',
  'Федоров М. С.',
  'Орлов В. Н.',
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function fmtRub(n: number) {
  return n.toLocaleString('ru-RU') + ' ₽';
}

function slaBarClass(status: 'green' | 'yellow' | 'red') {
  if (status === 'red') return '[&>div]:bg-red-500';
  if (status === 'yellow') return '[&>div]:bg-yellow-400';
  return '[&>div]:bg-green-500';
}

function slaTimeLeft(limitH: number, elapsedH: number) {
  const rem = limitH - elapsedH;
  if (rem <= 0) return 'Просрочено';
  const h = Math.floor(rem);
  const m = Math.round((rem - h) * 60);
  return h > 0 ? `Осталось ${h}ч ${m}мин` : `Осталось ${m}мин`;
}

function slaTextClass(status: 'green' | 'yellow' | 'red') {
  if (status === 'red') return 'text-red-600';
  if (status === 'yellow') return 'text-yellow-600';
  return 'text-green-600';
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{children}</h3>;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-2 py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm text-gray-900 font-medium text-right">{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

interface Props {
  onBack?: () => void;
}

export default function WorkshopOrderFull({ onBack }: Props) {
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedEngineer, setSelectedEngineer] = useState('');
  const [description, setDescription] = useState(ORDER.description);

  const totalServices = SERVICES.reduce((s, x) => s + x.total, 0);
  const totalMaterials = MATERIALS.reduce((s, x) => s + x.total, 0);
  const grandTotal = totalServices + totalMaterials;

  function handleStatusSave() {
    if (!selectedStatus) { toast.error('Выберите новый статус'); return; }
    const label = STATUS_OPTIONS.find(o => o.value === selectedStatus)?.label ?? selectedStatus;
    toast.success(`Статус изменён на «${label}»`);
    setStatusDialogOpen(false);
    setSelectedStatus('');
  }

  function handleAssignSave() {
    if (!selectedEngineer) { toast.error('Выберите инженера'); return; }
    toast.success(`Инженер ${selectedEngineer} назначен на наряд`);
    setAssignDialogOpen(false);
    setSelectedEngineer('');
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
              <Icon name="ArrowLeft" size={16} /> Назад
            </Button>
          )}
          <span className="text-xl font-bold text-gray-900">{ORDER.id}</span>
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 border">{ORDER.status}</Badge>
          <Badge className="bg-red-100 text-red-700 border-red-200 border">
            <Icon name="Zap" size={12} className="mr-1" />{ORDER.priority}
          </Badge>
          <Badge variant="outline" className="text-gray-600">{ORDER.type}</Badge>
          <Badge variant="outline" className="text-gray-500">
            <Icon name="Phone" size={12} className="mr-1" />{ORDER.source}
          </Badge>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-400 mr-1">
            <Icon name="Clock" size={14} className="inline mr-1" />{ORDER.createdAt}
          </span>
          <Button size="sm" variant="outline" onClick={() => setStatusDialogOpen(true)}>
            <Icon name="RefreshCw" size={14} className="mr-1.5" />Изменить статус
          </Button>
          <Button size="sm" variant="outline" onClick={() => setAssignDialogOpen(true)}>
            <Icon name="UserPlus" size={14} className="mr-1.5" />Назначить инженера
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.info('Открыта форма создания ЗИП')}>
            <Icon name="ShoppingCart" size={14} className="mr-1.5" />Создать ЗИП
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => toast.success('Наряд закрыт. Создан акт выполненных работ.')}>
            <Icon name="CheckCircle" size={14} className="mr-1.5" />Закрыть наряд
          </Button>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* ══ LEFT COLUMN ══ */}
        <div className="space-y-4">

          {/* Client card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Icon name="Building2" size={16} className="text-blue-500" />
                Клиент
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">{CLIENT.name}</span>
                <Badge variant="outline" className="text-xs">{CLIENT.type}</Badge>
              </div>
              <InfoRow label="Контактное лицо" value={CLIENT.contactPerson} />
              <InfoRow label="Телефон" value={
                <a href={`tel:${CLIENT.phone}`} className="text-blue-600 hover:underline">{CLIENT.phone}</a>
              } />
              <InfoRow label="Email" value={
                <a href={`mailto:${CLIENT.email}`} className="text-blue-600 hover:underline">{CLIENT.email}</a>
              } />
              <InfoRow label="Уровень SLA" value={
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 border text-xs">{CLIENT.sla}</Badge>
              } />
              <div className="pt-2">
                <Button size="sm" variant="outline" className="w-full" onClick={() => toast.info('Открыта карточка клиента ООО Ромашка')}>
                  <Icon name="ExternalLink" size={14} className="mr-1.5" />Открыть карточку клиента
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Equipment card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Icon name="AirVent" size={16} className="text-teal-500" />
                Оборудование
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label="Бренд" value={EQUIPMENT.brand} />
              <InfoRow label="Модель" value={EQUIPMENT.model} />
              <InfoRow label="Серийный №" value={
                <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{EQUIPMENT.serial}</span>
              } />
              <InfoRow label="Год установки" value={EQUIPMENT.installYear} />
              <InfoRow label="Последнее ТО" value={EQUIPMENT.lastMaintenance} />
              <InfoRow label="Адрес" value={
                <span className="text-right max-w-[200px] block">{EQUIPMENT.address}</span>
              } />
              <div className="pt-2">
                <Button size="sm" variant="outline" className="w-full" onClick={() => toast.info('Открыт паспорт оборудования')}>
                  <Icon name="FileText" size={14} className="mr-1.5" />Паспорт оборудования
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* SLA card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Icon name="Timer" size={16} className="text-orange-500" />
                Контроль SLA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {SLA.map(sla => {
                const pct = Math.min(100, Math.round((sla.elapsedH / sla.limitH) * 100));
                return (
                  <div key={sla.key} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">{sla.label}</span>
                      <span className={`text-xs font-semibold ${slaTextClass(sla.status)}`}>
                        {slaTimeLeft(sla.limitH, sla.elapsedH)}
                      </span>
                    </div>
                    <Progress value={pct} className={`h-2 ${slaBarClass(sla.status)}`} />
                    <div className="flex justify-between text-[11px] text-gray-400">
                      <span>Прошло: {sla.elapsedH}ч</span>
                      <span>Лимит: {sla.limitH}ч</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Engineer card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Icon name="HardHat" size={16} className="text-yellow-500" />
                Инженер
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                  ГА
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{ENGINEER.name}</p>
                  <a href={`tel:${ENGINEER.phone}`} className="text-xs text-blue-600 hover:underline">{ENGINEER.phone}</a>
                </div>
                <Badge className="ml-auto bg-orange-100 text-orange-700 border-orange-200 border text-xs">
                  <Icon name="Navigation" size={11} className="mr-1" />{ENGINEER.status}
                </Badge>
              </div>
              <InfoRow label="ETA (ожидаемое прибытие)" value={
                <span className="text-orange-600 font-semibold">~{ENGINEER.eta} мин</span>
              } />
            </CardContent>
          </Card>
        </div>

        {/* ══ RIGHT COLUMN ══ */}
        <div className="space-y-4">

          {/* Description card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Icon name="ClipboardList" size={16} className="text-gray-500" />
                Описание работ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                className="text-sm resize-none"
              />
              <Button size="sm" variant="outline" onClick={() => toast.success('Описание сохранено')}>
                <Icon name="Save" size={14} className="mr-1.5" />Сохранить
              </Button>
            </CardContent>
          </Card>

          {/* Services table */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Icon name="Wrench" size={16} className="text-blue-500" />
                  Услуги
                </CardTitle>
                <Button size="sm" variant="outline" onClick={() => toast.info('Открыта форма добавления услуги')}>
                  <Icon name="Plus" size={14} className="mr-1" />Добавить услугу
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left px-4 py-2 font-medium text-gray-500 text-xs">Услуга</th>
                      <th className="text-center px-2 py-2 font-medium text-gray-500 text-xs">Кол-во</th>
                      <th className="text-right px-2 py-2 font-medium text-gray-500 text-xs">Цена</th>
                      <th className="text-right px-4 py-2 font-medium text-gray-500 text-xs">Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SERVICES.map(s => (
                      <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-900">{s.name}</td>
                        <td className="px-2 py-2 text-center text-gray-600">{s.qty}</td>
                        <td className="px-2 py-2 text-right text-gray-600">{fmtRub(s.price)}</td>
                        <td className="px-4 py-2 text-right font-semibold text-gray-900">{fmtRub(s.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t bg-blue-50">
                      <td colSpan={3} className="px-4 py-2 text-sm font-semibold text-gray-700">Итого услуги</td>
                      <td className="px-4 py-2 text-right font-bold text-blue-700">{fmtRub(totalServices)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Materials table */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Icon name="Package" size={16} className="text-green-500" />
                  Материалы
                </CardTitle>
                <Button size="sm" variant="outline" onClick={() => toast.info('Открыта форма добавления материала')}>
                  <Icon name="Plus" size={14} className="mr-1" />Добавить
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left px-4 py-2 font-medium text-gray-500 text-xs">Материал</th>
                      <th className="text-center px-2 py-2 font-medium text-gray-500 text-xs">Кол-во</th>
                      <th className="text-center px-2 py-2 font-medium text-gray-500 text-xs">Ед.</th>
                      <th className="text-right px-2 py-2 font-medium text-gray-500 text-xs">Цена</th>
                      <th className="text-right px-4 py-2 font-medium text-gray-500 text-xs">Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MATERIALS.map(m => (
                      <tr key={m.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-900">{m.name}</td>
                        <td className="px-2 py-2 text-center text-gray-600">{m.qty}</td>
                        <td className="px-2 py-2 text-center text-gray-500 text-xs">{m.unit}</td>
                        <td className="px-2 py-2 text-right text-gray-600">{fmtRub(m.price)}</td>
                        <td className="px-4 py-2 text-right font-semibold text-gray-900">{fmtRub(m.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t bg-green-50">
                      <td colSpan={4} className="px-4 py-2 text-sm font-semibold text-gray-700">Итого материалы</td>
                      <td className="px-4 py-2 text-right font-bold text-green-700">{fmtRub(totalMaterials)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* ZIP items */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Icon name="ShoppingBag" size={16} className="text-yellow-500" />
                Запасные части (ЗИП)
                <Badge variant="outline" className="ml-auto text-xs">PR-2026-000901</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {ZIP_ITEMS.map(z => (
                <div key={z.id} className="flex items-center justify-between gap-3 p-2.5 rounded-lg border bg-gray-50 hover:bg-white transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon name="Box" size={14} className="text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-800 truncate">{z.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-400">{z.eta}</span>
                    <Badge className={z.status === 'Получено'
                      ? 'bg-green-100 text-green-700 border-green-200 border text-xs'
                      : 'bg-yellow-100 text-yellow-700 border-yellow-200 border text-xs'}>
                      {z.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Grand total */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Итого по наряду</span>
                <span className="text-xl font-bold text-blue-700">{fmtRub(grandTotal)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Bottom Tabs ── */}
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="mb-2">
          <TabsTrigger value="history">
            <Icon name="ListOrdered" size={14} className="mr-1.5" />Журнал событий
          </TabsTrigger>
          <TabsTrigger value="photos">
            <Icon name="Camera" size={14} className="mr-1.5" />Фотографии
          </TabsTrigger>
          <TabsTrigger value="documents">
            <Icon name="Files" size={14} className="mr-1.5" />Документы
          </TabsTrigger>
        </TabsList>

        {/* History tab */}
        <TabsContent value="history">
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-0">
                {HISTORY.map((ev, idx) => (
                  <div key={ev.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${ev.color}`}>
                        <Icon name={ev.icon} size={14} />
                      </div>
                      {idx < HISTORY.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1" />}
                    </div>
                    <div className="pb-4 min-w-0">
                      <p className="text-sm text-gray-900 font-medium">{ev.action}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-gray-500">{ev.user}</span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-400">{ev.dt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Photos tab */}
        <TabsContent value="photos">
          <Card>
            <CardContent className="pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500">{PHOTOS.length} фотографий</span>
                <Button size="sm" variant="outline" onClick={() => toast.info('Открыт выбор файлов для загрузки')}>
                  <Icon name="Upload" size={14} className="mr-1.5" />Добавить фото
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PHOTOS.map(ph => (
                  <div key={ph.id} className="group cursor-pointer" onClick={() => toast.info(`Просмотр: ${ph.label}`)}>
                    <svg width="100%" viewBox="0 0 160 120" className="rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                      <rect width="160" height="120" fill={ph.color} rx="8" />
                      <rect x="20" y="20" width="120" height="60" fill="white" fillOpacity="0.3" rx="4" />
                      <circle cx="40" cy="40" r="10" fill="white" fillOpacity="0.5" />
                      <line x1="20" y1="90" x2="140" y2="90" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
                    </svg>
                    <p className="text-xs text-gray-600 mt-1.5 text-center truncate">{ph.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents tab */}
        <TabsContent value="documents">
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {[
                  { id: 1, icon: 'FileCheck', name: 'Акт выполненных работ', file: `act_${ORDER.id}.pdf`, statusLabel: 'Черновик', statusClass: 'bg-gray-100 text-gray-600 border-gray-200' },
                  { id: 2, icon: 'FileText', name: 'Счёт на оплату', file: `invoice_${ORDER.id}.pdf`, statusLabel: 'Выставлен', statusClass: 'bg-blue-100 text-blue-700 border-blue-200' },
                ].map(doc => (
                  <div key={doc.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <Icon name={doc.icon} size={18} className="text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-400 truncate">{doc.file}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={`border text-xs ${doc.statusClass}`}>{doc.statusLabel}</Badge>
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => toast.success(`Документ «${doc.name}» скачивается...`)}>
                        <Icon name="Download" size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => toast.success(`Документ «${doc.name}» отправлен клиенту`)}>
                        <Icon name="Send" size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Status change Dialog ── */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Изменить статус наряда</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <p className="text-sm text-gray-500 mb-2">Текущий статус: <span className="font-medium text-blue-600">{ORDER.status}</span></p>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите новый статус" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Комментарий (необязательно)</label>
              <Input placeholder="Добавьте комментарий к смене статуса..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleStatusSave}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Assign engineer Dialog ── */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Назначить инженера</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-500">Текущий инженер: <span className="font-medium text-gray-800">{ENGINEER.name}</span></p>
            <Select value={selectedEngineer} onValueChange={setSelectedEngineer}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите инженера" />
              </SelectTrigger>
              <SelectContent>
                {ENGINEERS_LIST.map(eng => (
                  <SelectItem key={eng} value={eng}>{eng}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Плановое время прибытия</label>
              <Input type="datetime-local" defaultValue="2026-05-18T11:00" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleAssignSave}>Назначить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
