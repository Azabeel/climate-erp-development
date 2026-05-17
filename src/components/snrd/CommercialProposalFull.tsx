import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import Icon from '@/components/ui/icon';

// ─── Types ───────────────────────────────────────────────────────────────────

type ProposalStatus =
  | 'Черновик'
  | 'Отправлен'
  | 'На рассмотрении'
  | 'Принят'
  | 'Отклонён';

type TierId = 'good' | 'better' | 'best';

interface ServiceLine {
  id: string;
  name: string;
  price: number;
  qty: number;
  included: boolean;
}

interface Material {
  id: string;
  name: string;
  qty: number;
  unit: string;
  price: number;
}

interface Tier {
  id: TierId;
  label: string;
  tagline: string;
  description: string;
  price: number;
  warranty: string;
  sla: string;
  validity: string;
  services: ServiceLine[];
  materials: Material[];
  paymentTerms: string;
  executionDays: number;
  recommended: boolean;
}

interface ProposalVersion {
  version: string;
  date: string;
  status: ProposalStatus;
  note: string;
  isCurrent: boolean;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const CLIENTS = [
  'ООО «Торговый центр Меркурий»',
  'ПАО «АэроКлимат»',
  'ИП Смирнов В.А.',
  'ЗАО «Ледяной дворец»',
  'ООО «ТЦ Гринвич»',
];

const TEMPLATES = [
  'Техническое обслуживание VRF',
  'Монтаж новой системы',
  'Гарантийный ремонт',
  'Комплексное обслуживание',
];

const STATUS_COLOR: Record<ProposalStatus, string> = {
  Черновик: 'bg-gray-100 text-gray-700',
  Отправлен: 'bg-blue-100 text-blue-700',
  'На рассмотрении': 'bg-yellow-100 text-yellow-700',
  Принят: 'bg-green-100 text-green-700',
  Отклонён: 'bg-red-100 text-red-700',
};

const GOOD_SERVICES: ServiceLine[] = [
  { id: 'g1', name: 'Диагностика системы', price: 4500, qty: 1, included: true },
  { id: 'g2', name: 'Чистка фильтров (внутр. блоки)', price: 3800, qty: 4, included: true },
  { id: 'g3', name: 'Проверка герметичности контура', price: 5200, qty: 1, included: true },
  { id: 'g4', name: 'Замена расходников', price: 2800, qty: 1, included: true },
  { id: 'g5', name: 'Профилактика VRF-системы', price: 8500, qty: 1, included: false },
  { id: 'g6', name: 'Дозаправка хладагентом', price: 4200, qty: 1, included: false },
  { id: 'g7', name: 'Приоритетный выезд (SLA 4ч)', price: 12000, qty: 1, included: false },
];

const BETTER_SERVICES: ServiceLine[] = GOOD_SERVICES.map((s) => ({
  ...s,
  included: s.id !== 'g7',
}));

const BEST_SERVICES: ServiceLine[] = GOOD_SERVICES.map((s) => ({ ...s, included: true }));

const GOOD_MATERIALS: Material[] = [
  { id: 'm1', name: 'Фильтр воздушный G4', qty: 4, unit: 'шт', price: 320 },
  { id: 'm2', name: 'Прокладка дренажного шланга', qty: 2, unit: 'м', price: 85 },
];

const BETTER_MATERIALS: Material[] = [
  ...GOOD_MATERIALS,
  { id: 'm3', name: 'Хладагент R-410A', qty: 1.5, unit: 'кг', price: 1200 },
  { id: 'm4', name: 'Антибактериальный реагент', qty: 2, unit: 'л', price: 650 },
];

const BEST_MATERIALS: Material[] = [
  ...BETTER_MATERIALS,
  { id: 'm5', name: 'Расширительный клапан TXV', qty: 1, unit: 'шт', price: 3400 },
  { id: 'm6', name: 'Датчик давления (запасной)', qty: 2, unit: 'шт', price: 1850 },
];

const TIERS: Tier[] = [
  {
    id: 'good',
    label: 'GOOD',
    tagline: 'Базовое обслуживание',
    description: 'Плановая диагностика и чистка. Оптимально для объектов с низкой нагрузкой.',
    price: 32600,
    warranty: '3 месяца',
    sla: 'Реакция 8 ч',
    validity: '30 дней',
    services: GOOD_SERVICES,
    materials: GOOD_MATERIALS,
    paymentTerms: '100% по факту',
    executionDays: 5,
    recommended: false,
  },
  {
    id: 'better',
    label: 'BETTER',
    tagline: 'Расширенное обслуживание',
    description:
      'Полная профилактика с дозаправкой. Рекомендуем для активно эксплуатируемых объектов.',
    price: 58400,
    warranty: '6 месяцев',
    sla: 'Реакция 4 ч',
    validity: '30 дней',
    services: BETTER_SERVICES,
    materials: BETTER_MATERIALS,
    paymentTerms: '50% предоплата / 50% по факту',
    executionDays: 3,
    recommended: true,
  },
  {
    id: 'best',
    label: 'BEST',
    tagline: 'Премиум-обслуживание',
    description:
      'Максимальный охват + приоритетный SLA. Для критичных объектов с требованиями к доступности.',
    price: 87200,
    warranty: '12 месяцев',
    sla: 'Реакция 2 ч',
    validity: '30 дней',
    services: BEST_SERVICES,
    materials: BEST_MATERIALS,
    paymentTerms: '50% предоплата / 50% по факту',
    executionDays: 2,
    recommended: false,
  },
];

const VERSIONS: ProposalVersion[] = [
  {
    version: 'v1',
    date: '12.05.2026',
    status: 'Отправлен',
    note: 'Первичное КП, отправлено по email',
    isCurrent: false,
  },
  {
    version: 'v2',
    date: '17.05.2026',
    status: 'На рассмотрении',
    note: 'После переговоров — добавлен вариант BEST, скидка 5%',
    isCurrent: true,
  },
];

// ─── Helper components ────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString('ru-RU') + ' ₽';
}

function ServiceRow({ line }: { line: ServiceLine }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <div className="flex items-center gap-2 min-w-0">
        {line.included ? (
          <Icon name="Check" className="w-4 h-4 text-green-500 flex-shrink-0" />
        ) : (
          <Icon name="X" className="w-4 h-4 text-gray-300 flex-shrink-0" />
        )}
        <span className={line.included ? 'text-gray-800' : 'text-gray-400 line-through truncate'}>
          {line.name}
        </span>
      </div>
      {line.included && (
        <span className="text-gray-500 flex-shrink-0 ml-2">
          {line.qty > 1 ? `${line.qty} × ` : ''}
          {fmt(line.price)}
        </span>
      )}
    </div>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

function TierDetail({ tier }: { tier: Tier }) {
  const servicesTotal = tier.services
    .filter((s) => s.included)
    .reduce((sum, s) => sum + s.price * s.qty, 0);
  const materialsTotal = tier.materials.reduce((sum, m) => sum + m.price * m.qty, 0);

  return (
    <div className="mt-4 border-t pt-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Services table */}
        <div>
          <p className="font-semibold text-sm text-gray-700 mb-2">Услуги</p>
          <div className="space-y-1">
            {tier.services
              .filter((s) => s.included)
              .map((s) => (
                <div key={s.id} className="flex justify-between text-sm border-b pb-1">
                  <span className="text-gray-700 truncate pr-2">{s.name}</span>
                  <span className="text-gray-500 flex-shrink-0">
                    {s.qty > 1 ? `${s.qty} × ` : ''}
                    {fmt(s.price)}
                  </span>
                </div>
              ))}
            <div className="flex justify-between text-sm font-semibold pt-1">
              <span>Итого услуги</span>
              <span>{fmt(servicesTotal)}</span>
            </div>
          </div>
        </div>

        {/* Materials table */}
        <div>
          <p className="font-semibold text-sm text-gray-700 mb-2">Материалы</p>
          <div className="space-y-1">
            {tier.materials.map((m) => (
              <div key={m.id} className="flex justify-between text-sm border-b pb-1">
                <span className="text-gray-700 truncate pr-2">
                  {m.name} ({m.qty} {m.unit})
                </span>
                <span className="text-gray-500 flex-shrink-0">{fmt(m.price * m.qty)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-semibold pt-1">
              <span>Итого материалы</span>
              <span>{fmt(materialsTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500 mb-0.5">Условия оплаты</p>
          <p className="text-sm font-medium text-gray-800">{tier.paymentTerms}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500 mb-0.5">Срок выполнения</p>
          <p className="text-sm font-medium text-gray-800">{tier.executionDays} рабочих дня</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500 mb-0.5">Гарантия</p>
          <p className="text-sm font-medium text-gray-800">{tier.warranty}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Tier card ────────────────────────────────────────────────────────────────

function TierCard({
  tier,
  selected,
  onSelect,
}: {
  tier: Tier;
  selected: boolean;
  onSelect: () => void;
}) {
  const borderClass = tier.recommended
    ? 'border-blue-500 shadow-blue-100 shadow-lg'
    : selected
      ? 'border-gray-400 shadow-md'
      : 'border-gray-200';

  return (
    <Card className={`relative border-2 transition-all ${borderClass}`}>
      {tier.recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
            Рекомендуем
          </span>
        </div>
      )}

      <CardHeader className="pb-2 pt-5">
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded ${
              tier.id === 'good'
                ? 'bg-gray-100 text-gray-600'
                : tier.id === 'better'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-purple-100 text-purple-700'
            }`}
          >
            {tier.label}
          </span>
        </div>
        <p className="text-sm font-semibold text-gray-700 mt-1">{tier.tagline}</p>
        <p className="text-xs text-gray-500">{tier.description}</p>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Price */}
        <div className="text-center py-3 border rounded-lg bg-gray-50">
          <p className="text-3xl font-bold text-gray-900">{fmt(tier.price)}</p>
          <p className="text-xs text-gray-400 mt-0.5">включая материалы и НДС</p>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-3 gap-1 text-center">
          <div className="text-xs">
            <p className="text-gray-400">Гарантия</p>
            <p className="font-medium text-gray-700">{tier.warranty}</p>
          </div>
          <div className="text-xs">
            <p className="text-gray-400">SLA</p>
            <p className="font-medium text-gray-700">{tier.sla}</p>
          </div>
          <div className="text-xs">
            <p className="text-gray-400">КП действует</p>
            <p className="font-medium text-gray-700">{tier.validity}</p>
          </div>
        </div>

        <Separator />

        {/* Services */}
        <div className="space-y-0.5">
          {tier.services.map((s) => (
            <ServiceRow key={s.id} line={s} />
          ))}
        </div>

        <Button
          className={`w-full mt-2 ${
            selected
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'variant-outline'
          }`}
          variant={selected ? 'default' : 'outline'}
          onClick={onSelect}
        >
          {selected ? (
            <>
              <Icon name="Check" className="w-4 h-4 mr-1" />
              Выбрано
            </>
          ) : (
            'Выбрать'
          )}
        </Button>

        {/* Expandable detail */}
        {selected && <TierDetail tier={tier} />}
      </CardContent>
    </Card>
  );
}

// ─── New CP Dialog ─────────────────────────────────────────────────────────────

function NewCPDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [client, setClient] = useState('');
  const [template, setTemplate] = useState('');

  const handleCreate = () => {
    if (!client || !template) {
      toast.error('Выберите клиента и шаблон');
      return;
    }
    toast.success(`КП создано для ${client} по шаблону «${template}»`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Новое коммерческое предложение</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Клиент</label>
            <Select onValueChange={setClient}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите клиента..." />
              </SelectTrigger>
              <SelectContent>
                {CLIENTS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Шаблон</label>
            <Select onValueChange={setTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите шаблон..." />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Объект</label>
            <Input placeholder="Адрес / описание объекта" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleCreate}>Создать КП</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function CommercialProposalFull() {
  const [status, setStatus] = useState<ProposalStatus>('На рассмотрении');
  const [selectedTier, setSelectedTier] = useState<TierId>('better');
  const [greeting, setGreeting] = useState(
    'Уважаемый Александр Петрович,\n\nПредставляем Вам коммерческое предложение на комплексное обслуживание системы кондиционирования Вашего объекта. Мы подготовили три варианта, каждый из которых учитывает различные потребности и бюджет.\n\nБудем рады ответить на любые вопросы.'
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('proposal');

  const handleSend = () => {
    setStatus('Отправлен');
    toast.success('КП-2026-0089 отправлено клиенту на email и Telegram');
  };

  const handleDownloadPDF = () => {
    toast.info('Генерация PDF... Файл будет готов через несколько секунд');
  };

  const handleDuplicate = () => {
    toast.success('КП-2026-0090 создано как копия текущего');
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">КП-2026-0089</h1>
            <Badge className={`text-xs font-medium ${STATUS_COLOR[status]}`}>{status}</Badge>
          </div>
          <div className="mt-1.5 text-sm text-gray-500 space-y-0.5">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <Icon name="Building2" className="w-3.5 h-3.5" />
                ООО «Торговый центр Меркурий»
              </span>
              <span className="flex items-center gap-1">
                <Icon name="Calendar" className="w-3.5 h-3.5" />
                17.05.2026
              </span>
              <span className="flex items-center gap-1">
                <Icon name="User" className="w-3.5 h-3.5" />
                Кузнецов А.Д.
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleDuplicate}>
            <Icon name="Copy" className="w-4 h-4 mr-1.5" />
            Дублировать
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <Icon name="Download" className="w-4 h-4 mr-1.5" />
            Скачать PDF
          </Button>
          <Button size="sm" onClick={handleSend} className="bg-blue-600 hover:bg-blue-700">
            <Icon name="Send" className="w-4 h-4 mr-1.5" />
            Отправить клиенту
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
            <Icon name="Plus" className="w-4 h-4 mr-1.5" />
            Новое КП
          </Button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-2">
          <TabsTrigger value="proposal">Предложение</TabsTrigger>
          <TabsTrigger value="personalization">Персонализация</TabsTrigger>
          <TabsTrigger value="history">История версий</TabsTrigger>
        </TabsList>

        {/* ── Tab: Proposal ── */}
        <TabsContent value="proposal">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TIERS.map((tier) => (
              <TierCard
                key={tier.id}
                tier={tier}
                selected={selectedTier === tier.id}
                onSelect={() => setSelectedTier(tier.id)}
              />
            ))}
          </div>

          {/* Summary row */}
          <div className="mt-4 rounded-xl bg-gray-50 border p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Icon name="Info" className="w-4 h-4 text-blue-500" />
              Выбранный вариант:{' '}
              <span className="font-semibold text-gray-900">
                {TIERS.find((t) => t.id === selectedTier)?.label} —{' '}
                {TIERS.find((t) => t.id === selectedTier)?.tagline}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Итоговая сумма:</span>
              <span className="text-xl font-bold text-gray-900">
                {fmt(TIERS.find((t) => t.id === selectedTier)?.price ?? 0)}
              </span>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab: Personalization ── */}
        <TabsContent value="personalization">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Greeting */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Обращение к клиенту</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full h-40 text-sm border rounded-md p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Текст будет включён в PDF-версию КП
                </p>
              </CardContent>
            </Card>

            {/* Photo + signature */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Фото объекта</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg h-36 flex flex-col items-center justify-center gap-2 text-gray-400 cursor-pointer hover:border-blue-400 hover:text-blue-400 transition-colors">
                    <Icon name="Image" className="w-8 h-8" />
                    <p className="text-sm">Нажмите для загрузки фото</p>
                    <p className="text-xs">PNG, JPG до 5 МБ</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Подпись менеджера</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      КА
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Кузнецов Антон Дмитриевич</p>
                      <p className="text-xs text-gray-500">Менеджер по продажам</p>
                      <p className="text-xs text-gray-400">+7 (343) 900-11-22 · a.kuznetsov@sk.ru</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="border rounded-md p-2 text-center text-gray-300 text-xs">
                    <Icon name="PenLine" className="w-6 h-6 mx-auto mb-1" />
                    Область для электронной подписи
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab: History ── */}
        <TabsContent value="history">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Версии КП-2026-0089</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {VERSIONS.map((v) => (
                  <div
                    key={v.version}
                    className={`flex items-start justify-between gap-3 p-3 rounded-lg border ${
                      v.isCurrent ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          v.isCurrent
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        {v.version}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-gray-800">
                            КП-2026-0089 {v.version}
                          </span>
                          <Badge className={`text-xs ${STATUS_COLOR[v.status]}`}>
                            {v.status}
                          </Badge>
                          {v.isCurrent && (
                            <Badge className="text-xs bg-blue-100 text-blue-700">Текущая</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{v.note}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 flex-shrink-0">{v.date}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t flex gap-2">
                <Button variant="outline" size="sm">
                  <Icon name="GitBranch" className="w-4 h-4 mr-1.5" />
                  Создать версию v3
                </Button>
                <Button variant="outline" size="sm">
                  <Icon name="RotateCcw" className="w-4 h-4 mr-1.5" />
                  Восстановить v1
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Dialog ── */}
      <NewCPDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
