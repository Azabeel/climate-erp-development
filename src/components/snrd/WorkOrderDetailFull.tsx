import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

// ─────────────────────────────────────────────
// Mock data — WO-2026-001847
// ─────────────────────────────────────────────

const ORDER = {
  id: 'WO-2026-001847',
  type: 'Ремонт',
  priority: 'Срочно',
  status: 'В РАБОТЕ',
  source: 'Telegram',
  client: 'ООО Мегамол',
  address: 'г. Москва, Ленинградский просп., 76А, ТЦ «Мегамол», пав. B-12',
  contact: 'Сидорова Л. В.',
  contactPhone: '+7 (495) 640-22-88',
  description:
    'Внутренние блоки в зале №2 не охлаждают. По словам клиента — резкое снижение производительности с утра. Предварительно: утечка хладагента R-32. Оборудование: Mitsubishi Electric PUHY-P200YNW-A (VRF), 2023 г. в., серийный №',
  equipment: { brand: 'Mitsubishi Electric', model: 'PUHY-P200YNW-A', serial: 'ME2310037741' },
  engineer: { name: 'Климов Д. И.', initials: 'КД', phone: '+7 (916) 777-44-55' },
  scheduledDate: '17 мая 2026',
  scheduledTime: '10:00 — 14:00',
  actualStart: '10:18',
  forecastEnd: '13:45',
  weather: { icon: 'Sun', temp: '+19°C', desc: 'Ясно' },
  sla: {
    elapsed: 62,
    total: 120,
    label: 'TTF — время устранения',
    status: 'yellow' as 'green' | 'yellow' | 'red',
  },
};

const SERVICES = [
  { id: 1, name: 'Диагностика VRF-системы', qty: 1, price: 2500, total: 2500, status: 'Выполнено' },
  { id: 2, name: 'Поиск и устранение утечки хладагента', qty: 1, price: 3800, total: 3800, status: 'В работе' },
  { id: 3, name: 'Дозаправка R-32 (до 1 кг)', qty: 1, price: 1600, total: 1600, status: 'В работе' },
  { id: 4, name: 'Чистка фильтров внутр. блоков', qty: 4, price: 600, total: 2400, status: 'Выполнено' },
  { id: 5, name: 'Профилактическое обслуживание', qty: 1, price: 1800, total: 1800, status: 'В работе' },
];

const MATERIALS = [
  { id: 1, art: 'R32-CYL', name: 'Хладагент R-32 (баллон 10 кг)', qty: 0.8, purchase: 1200, sale: 1600 },
  { id: 2, art: 'FLTR-ME-L', name: 'Фильтр воздушный Mitsubishi (L)', qty: 4, purchase: 280, sale: 420 },
  { id: 3, art: 'SEAL-KIT-A', name: 'Набор уплотнений (медь)', qty: 1, purchase: 90, sale: 150 },
];

const ZIP = {
  requestId: 'PR-2026-004412',
  status: 'В пути',
  supplier: 'ООО ТехКлимат',
  tracking: 'CDEK-100432887',
  eta: '19 мая 2026',
  items: [
    { name: 'Трубка капиллярная 3/8 (1 м)', qty: 2, status: 'В транзите' },
    { name: 'Пресс-фитинг Daikin 3/8 × 90°', qty: 1, status: 'Получен на складе' },
  ],
};

const PHOTOS = [
  { id: 1, label: 'До работ — внешний блок', group: 'before', bg: 'bg-blue-100' },
  { id: 2, label: 'До работ — дефект', group: 'before', bg: 'bg-blue-200' },
  { id: 3, label: 'До работ — подключение', group: 'before', bg: 'bg-blue-100' },
  { id: 4, label: 'После работ — внешний блок', group: 'after', bg: 'bg-green-100' },
  { id: 5, label: 'После работ — стыки', group: 'after', bg: 'bg-green-200' },
  { id: 6, label: 'После работ — пульт', group: 'after', bg: 'bg-green-100' },
];

const DOCUMENTS = [
  { id: 1, icon: 'FileCheck', name: 'Акт выполненных работ', file: 'act_WO-2026-001847.pdf' },
  { id: 2, icon: 'FileText', name: 'Счёт на оплату', file: 'invoice_WO-2026-001847.pdf' },
  { id: 3, icon: 'ShieldCheck', name: 'Гарантийный лист', file: 'warranty_WO-2026-001847.pdf' },
];

const HISTORY = [
  { id: 1, icon: 'FilePlus', color: 'bg-blue-100 text-blue-700', action: 'Наряд создан', user: 'Диспетчер Иванова Н. В.', dt: '17 мая, 08:04' },
  { id: 2, icon: 'UserCheck', color: 'bg-indigo-100 text-indigo-700', action: 'Назначен инженер Климов Д. И.', user: 'Иванова Н. В.', dt: '17 мая, 08:19' },
  { id: 3, icon: 'Navigation', color: 'bg-orange-100 text-orange-700', action: 'Статус → В пути', user: 'Климов Д. И.', dt: '17 мая, 09:50' },
  { id: 4, icon: 'MapPin', color: 'bg-purple-100 text-purple-700', action: 'Статус → На объекте', user: 'Климов Д. И.', dt: '17 мая, 10:18' },
  { id: 5, icon: 'Wrench', color: 'bg-teal-100 text-teal-700', action: 'Статус → В работе', user: 'Климов Д. И.', dt: '17 мая, 10:32' },
  { id: 6, icon: 'Package', color: 'bg-yellow-100 text-yellow-700', action: 'Добавлен материал: Хладагент R-32 0.8 кг', user: 'Климов Д. И.', dt: '17 мая, 11:05' },
];

const STATUS_OPTIONS = [
  { value: 'EN_ROUTE', label: 'В пути' },
  { value: 'ON_SITE', label: 'На объекте' },
  { value: 'IN_PROGRESS', label: 'В работе' },
  { value: 'AWAITING_PARTS', label: 'Ожидание ЗИП' },
  { value: 'COMPLETED', label: 'Выполнен' },
  { value: 'CANCELLED', label: 'Отменён' },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function fmtRub(n: number) {
  return n.toLocaleString('ru-RU') + ' ₽';
}

function slaBarColor(status: 'green' | 'yellow' | 'red') {
  if (status === 'red') return 'bg-red-500';
  if (status === 'yellow') return 'bg-yellow-400';
  return 'bg-green-500';
}

function slaTextColor(status: 'green' | 'yellow' | 'red') {
  if (status === 'red') return 'text-red-600';
  if (status === 'yellow') return 'text-yellow-600';
  return 'text-green-600';
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

interface Props {
  onBack?: () => void;
}

export default function WorkOrderDetailFull({ onBack }: Props) {
  const [statusValue, setStatusValue] = useState('');

  const totalServices = SERVICES.reduce((s, x) => s + x.total, 0);
  const totalMaterials = MATERIALS.reduce((s, x) => s + x.sale * x.qty, 0);
  const totalPurchase = MATERIALS.reduce((s, x) => s + x.purchase * x.qty, 0);
  const revenue = totalServices + totalMaterials;
  const costPrice = totalPurchase + Math.round(totalServices * 0.55) + 320;
  const margin = revenue - costPrice;
  const marginPct = Math.round((margin / revenue) * 100);
  const slaPct = Math.round((ORDER.sla.elapsed / ORDER.sla.total) * 100);

  function handleStatusSave() {
    if (!statusValue) { toast.error('Выберите статус'); return; }
    const label = STATUS_OPTIONS.find(o => o.value === statusValue)?.label ?? statusValue;
    toast.success(`Статус изменён на «${label}»`);
    setStatusValue('');
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">

      {/* ── Header ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">

          {/* Left: id + badges */}
          <div className="flex items-start gap-3">
            {onBack && (
              <button onClick={onBack} className="mt-1 flex items-center gap-1 text-sm text-gray-400 hover:text-gray-800 transition-colors">
                <Icon name="ArrowLeft" size={15} />
                Назад
              </button>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-gray-900">{ORDER.id}</h2>
                <Badge variant="outline" className="text-xs">{ORDER.type}</Badge>
                <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100 text-xs">{ORDER.priority}</Badge>
                <Badge className="bg-blue-600 hover:bg-blue-700 text-xs">{ORDER.status}</Badge>
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  <Icon name="Send" size={10} />{ORDER.source}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">{ORDER.client} · {ORDER.address}</p>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <select
                value={statusValue}
                onChange={e => setStatusValue(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Сменить статус</option>
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <Button size="sm" onClick={handleStatusSave}>
                <Icon name="Check" size={13} className="mr-1" />Сохранить
              </Button>
            </div>
            <Button size="sm" variant="outline" onClick={() => toast.info('Назначение инженера')}>
              <Icon name="UserPlus" size={13} className="mr-1" />Назначить
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast.info('Печать наряда')}>
              <Icon name="Printer" size={13} className="mr-1" />Печать
            </Button>
            <Button size="sm" variant="destructive" onClick={() => toast.error('Закрытие наряда требует подтверждения')}>
              <Icon name="XCircle" size={13} className="mr-1" />Закрыть наряд
            </Button>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <Tabs defaultValue="main">
          <TabsList className="w-full justify-start rounded-none border-b border-gray-200 h-auto bg-transparent px-4 gap-0 overflow-x-auto">
            {[
              { value: 'main', label: 'Основное', icon: 'ClipboardList' },
              { value: 'services', label: 'Услуги', icon: 'Wrench' },
              { value: 'materials', label: 'Материалы', icon: 'Package' },
              { value: 'zip', label: 'ЗИП', icon: 'Truck' },
              { value: 'photos', label: 'Фото', icon: 'Camera' },
              { value: 'docs', label: 'Документы', icon: 'FileText' },
              { value: 'history', label: 'История', icon: 'History' },
            ].map(t => (
              <TabsTrigger key={t.value} value={t.value}
                className="flex items-center gap-1.5 px-4 py-3 text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent whitespace-nowrap">
                <Icon name={t.icon} size={13} />{t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── TAB: Основное ── */}
          <TabsContent value="main" className="p-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Left col */}
              <div className="space-y-4">
                <Section title="Клиент и объект">
                  <Row label="Клиент">{ORDER.client}</Row>
                  <Row label="Контакт">{ORDER.contact} · <a className="text-blue-600 hover:underline text-sm" href="#">{ORDER.contactPhone}</a></Row>
                  <Row label="Адрес"><span className="flex items-center gap-1"><Icon name="MapPin" size={12} className="text-gray-400" />{ORDER.address}</span></Row>
                </Section>

                <Section title="Описание проблемы">
                  <p className="text-sm text-gray-700 leading-relaxed">{ORDER.description}</p>
                </Section>

                <Section title="Оборудование">
                  <Row label="Бренд">{ORDER.equipment.brand}</Row>
                  <Row label="Модель">{ORDER.equipment.model}</Row>
                  <Row label="Серийный №">{ORDER.equipment.serial}</Row>
                </Section>
              </div>

              {/* Right col */}
              <div className="space-y-4">
                {/* SLA timer */}
                <Section title="SLA-контроль">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{ORDER.sla.label}</span>
                      <span className={`font-semibold ${slaTextColor(ORDER.sla.status)}`}>
                        {ORDER.sla.elapsed} / {ORDER.sla.total} мин · {slaPct}%
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-3 rounded-full transition-all ${slaBarColor(ORDER.sla.status)}`} style={{ width: `${slaPct}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>0 мин</span>
                      <span className={`font-medium ${slaTextColor(ORDER.sla.status)}`}>
                        {ORDER.sla.status === 'yellow' ? 'Внимание — осталось мало времени' : ORDER.sla.status === 'red' ? 'SLA нарушен' : 'В норме'}
                      </span>
                      <span>{ORDER.sla.total} мин</span>
                    </div>
                  </div>
                </Section>

                {/* Engineer */}
                <Section title="Инженер">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                      {ORDER.engineer.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{ORDER.engineer.name}</p>
                      <button className="text-xs text-blue-600 hover:underline" onClick={() => toast.info(`Звонок: ${ORDER.engineer.phone}`)}>
                        {ORDER.engineer.phone}
                      </button>
                    </div>
                  </div>
                </Section>

                {/* Schedule */}
                <Section title="Время выезда">
                  <Row label="Плановая дата">{ORDER.scheduledDate}</Row>
                  <Row label="Плановое время">{ORDER.scheduledTime}</Row>
                  <Row label="Фактическое начало">{ORDER.actualStart}</Row>
                  <Row label="Прогноз окончания">{ORDER.forecastEnd}</Row>
                </Section>

                {/* Weather */}
                <Section title="Погода на день выезда">
                  <div className="flex items-center gap-3">
                    <Icon name={ORDER.weather.icon} size={28} className="text-yellow-400" />
                    <div>
                      <p className="text-lg font-bold text-gray-900">{ORDER.weather.temp}</p>
                      <p className="text-xs text-gray-500">{ORDER.weather.desc} · {ORDER.scheduledDate}</p>
                    </div>
                  </div>
                </Section>
              </div>
            </div>
          </TabsContent>

          {/* ── TAB: Услуги ── */}
          <TabsContent value="services" className="p-5">
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-sm font-semibold text-gray-800">Услуги по наряду</p>
                <Button size="sm" variant="outline" onClick={() => toast.info('Добавление услуги')}>
                  <Icon name="Plus" size={13} className="mr-1" />Добавить
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500">
                    <tr>
                      <th className="text-left px-4 py-2.5 font-medium">Наименование</th>
                      <th className="text-center px-3 py-2.5 font-medium">Кол-во</th>
                      <th className="text-right px-3 py-2.5 font-medium">Цена</th>
                      <th className="text-right px-3 py-2.5 font-medium">Сумма</th>
                      <th className="text-center px-4 py-2.5 font-medium">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {SERVICES.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">{s.name}</td>
                        <td className="px-3 py-3 text-center text-gray-600">{s.qty}</td>
                        <td className="px-3 py-3 text-right text-gray-600">{fmtRub(s.price)}</td>
                        <td className="px-3 py-3 text-right font-semibold text-gray-900">{fmtRub(s.total)}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={s.status === 'Выполнено' ? 'bg-green-100 text-green-700 hover:bg-green-100 text-xs' : 'bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs'}>
                            {s.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-blue-50 font-semibold">
                      <td colSpan={3} className="px-4 py-3 text-gray-700">Итого услуги</td>
                      <td className="px-3 py-3 text-right text-blue-700">{fmtRub(totalServices)}</td>
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ── TAB: Материалы ── */}
          <TabsContent value="materials" className="p-5">
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-sm font-semibold text-gray-800">Списанные материалы</p>
                <Button size="sm" variant="outline" onClick={() => toast.info('Добавление материала')}>
                  <Icon name="Plus" size={13} className="mr-1" />Добавить
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500">
                    <tr>
                      <th className="text-left px-4 py-2.5 font-medium">Артикул</th>
                      <th className="text-left px-3 py-2.5 font-medium">Наименование</th>
                      <th className="text-center px-3 py-2.5 font-medium">Кол-во</th>
                      <th className="text-right px-3 py-2.5 font-medium">Цена закупки</th>
                      <th className="text-right px-4 py-2.5 font-medium">Цена продажи</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {MATERIALS.map(m => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{m.art}</td>
                        <td className="px-3 py-3 text-gray-900">{m.name}</td>
                        <td className="px-3 py-3 text-center text-gray-600">{m.qty}</td>
                        <td className="px-3 py-3 text-right text-gray-500">{fmtRub(m.purchase)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmtRub(m.sale)}</td>
                      </tr>
                    ))}
                    <tr className="bg-green-50 font-semibold">
                      <td colSpan={4} className="px-4 py-3 text-gray-700">Итого материалы (продажа)</td>
                      <td className="px-4 py-3 text-right text-green-700">{fmtRub(totalMaterials)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ── TAB: ЗИП ── */}
          <TabsContent value="zip" className="p-5">
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="Truck" size={15} className="text-gray-500" />
                  <p className="text-sm font-semibold text-gray-800">Заявка на ЗИП · {ZIP.requestId}</p>
                </div>
                <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 text-xs">{ZIP.status}</Badge>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div><p className="text-xs text-gray-400 mb-0.5">Поставщик</p><p className="font-medium text-gray-900">{ZIP.supplier}</p></div>
                  <div><p className="text-xs text-gray-400 mb-0.5">Трекинг</p><p className="font-medium text-blue-600 font-mono text-xs">{ZIP.tracking}</p></div>
                  <div><p className="text-xs text-gray-400 mb-0.5">Ожидаемая дата</p><p className="font-medium text-gray-900">{ZIP.eta}</p></div>
                  <div>
                    <Button size="sm" variant="outline" className="w-full" onClick={() => toast.info('Открытие трекинга СДЭК')}>
                      <Icon name="ExternalLink" size={12} className="mr-1" />Отследить
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  {ZIP.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">Кол-во: {item.qty} шт</p>
                      </div>
                      <Badge className={`text-xs ${item.status === 'Получен на складе' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-blue-100 text-blue-700 hover:bg-blue-100'}`}>
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── TAB: Фото ── */}
          <TabsContent value="photos" className="p-5">
            <div className="space-y-4">
              {(['before', 'after'] as const).map(group => (
                <div key={group}>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={group === 'before' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' : 'bg-green-100 text-green-700 hover:bg-green-100'}>
                      {group === 'before' ? 'До работ' : 'После работ'}
                    </Badge>
                    <span className="text-xs text-gray-400">{PHOTOS.filter(p => p.group === group).length} фото</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PHOTOS.filter(p => p.group === group).map(photo => (
                      <button
                        key={photo.id}
                        className="group relative rounded-xl overflow-hidden aspect-video border border-gray-200 hover:border-blue-400 transition-colors"
                        onClick={() => toast.info(`Открытие фото: ${photo.label}`)}
                      >
                        <div className={`w-full h-full ${photo.bg} flex flex-col items-center justify-center gap-2`}>
                          <Icon name="Camera" size={24} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                          <span className="text-xs text-gray-500 px-2 text-center">{photo.label}</span>
                        </div>
                      </button>
                    ))}
                    <button
                      className="rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-400 aspect-video flex flex-col items-center justify-center gap-2 transition-colors group"
                      onClick={() => toast.info('Загрузка фото')}
                    >
                      <Icon name="Upload" size={20} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
                      <span className="text-xs text-gray-400">Добавить</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ── TAB: Документы ── */}
          <TabsContent value="docs" className="p-5">
            <div className="space-y-3">
              {DOCUMENTS.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Icon name={doc.icon} size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{doc.file}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => toast.success(`Скачивание: ${doc.file}`)}>
                      <Icon name="Download" size={13} className="mr-1" />Скачать
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toast.success(`Документ отправлен клиенту: ${doc.name}`)}>
                      <Icon name="Send" size={13} className="mr-1" />Отправить
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ── TAB: История ── */}
          <TabsContent value="history" className="p-5">
            <div className="relative pl-6 space-y-0">
              {HISTORY.map((event, i) => (
                <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < HISTORY.length - 1 && (
                    <div className="absolute left-[-12px] top-8 bottom-0 w-0.5 bg-gray-200" />
                  )}
                  <div className={`absolute left-[-20px] w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${event.color}`}>
                    <Icon name={event.icon} size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{event.action}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{event.user} · {event.dt}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Cost & Margin footer ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Себестоимость и маржа</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <CostCell label="Выручка" value={fmtRub(revenue)} color="text-gray-900" />
          <CostCell label="Себестоимость" value={fmtRub(costPrice)} color="text-gray-600" />
          <CostCell label="Маржа" value={fmtRub(margin)} color={margin >= 0 ? 'text-green-600' : 'text-red-600'} />
          <CostCell label="Маржа %" value={`${marginPct}%`} color={marginPct >= 30 ? 'text-green-600' : marginPct >= 15 ? 'text-yellow-600' : 'text-red-600'} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Small reusable sub-components
// ─────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/30 space-y-2.5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{title}</p>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="text-xs text-gray-400 w-28 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-900 flex-1">{children}</span>
    </div>
  );
}

function CostCell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/40">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-base font-bold ${color}`}>{value}</p>
    </div>
  );
}
