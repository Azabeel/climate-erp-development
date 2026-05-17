import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

// ─── Catalogs ────────────────────────────────────────────────────────────────

const SERVICE_CATALOG = [
  { id: 's1', name: 'Диагностика VRF', price: 3500, unit: 'шт' },
  { id: 's2', name: 'Заправка хладагентом R410A', price: 1200, unit: 'кг' },
  { id: 's3', name: 'Замена компрессора', price: 8500, unit: 'шт' },
  { id: 's4', name: 'Чистка кондиционера', price: 2800, unit: 'шт' },
  { id: 's5', name: 'Плановое ТО (1 блок)', price: 2500, unit: 'шт' },
  { id: 's6', name: 'Монтаж сплит-системы', price: 7500, unit: 'шт' },
  { id: 's7', name: 'Ремонт платы управления', price: 6000, unit: 'шт' },
  { id: 's8', name: 'Диагностика мультизональной системы', price: 5000, unit: 'шт' },
  { id: 's9', name: 'Замена фильтра', price: 800, unit: 'шт' },
  { id: 's10', name: 'Демонтаж наружного блока', price: 3200, unit: 'шт' },
];

const MATERIAL_CATALOG = [
  { id: 'm1', name: 'Хладагент R410A', price: 950, unit: 'кг' },
  { id: 'm2', name: 'Медная трубка 1/4" (1 м)', price: 320, unit: 'м' },
  { id: 'm3', name: 'Теплоизоляция (1 м)', price: 180, unit: 'м' },
  { id: 'm4', name: 'Межблочный кабель (1 м)', price: 150, unit: 'м' },
  { id: 'm5', name: 'Жидкость для чистки', price: 650, unit: 'шт' },
  { id: 'm6', name: 'Хомут монтажный', price: 45, unit: 'шт' },
];

const CLIENT_SUGGESTIONS = [
  'ООО «АрктикТех»',
  'ИП Петров А.В.',
  'ЗАО «КлиматСтрой»',
  'ООО «МегаОфис»',
  'АО «Торговый дом Север»',
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface ServiceLine {
  id: string;
  catalogId: string;
  name: string;
  qty: number;
  unit: string;
  unitPrice: number;
}

interface MaterialLine {
  id: string;
  catalogId: string;
  name: string;
  qty: number;
  unit: string;
  unitPrice: number;
}

type WorkType = 'repair' | 'maintenance' | 'installation' | 'diagnostics';
type Priority = 'normal' | 'urgent' | 'emergency';

const PRIORITY_MULTIPLIER: Record<Priority, number> = {
  normal: 0,
  urgent: 0.3,
  emergency: 1.0,
};

const PRIORITY_LABEL: Record<Priority, string> = {
  normal: 'Обычный',
  urgent: 'Срочно',
  emergency: 'Аварийный',
};

const WORK_TYPE_LABEL: Record<WorkType, string> = {
  repair: 'Ремонт',
  maintenance: 'ТО',
  installation: 'Монтаж',
  diagnostics: 'Диагностика',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

let _seq = 0;
function genId(): string {
  _seq += 1;
  return `row_${Date.now()}_${_seq}`;
}

function fmt(n: number): string {
  return n.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtFull(n: number): string {
  return n.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ServiceTableProps {
  rows: ServiceLine[];
  onUpdate: (id: string, field: keyof ServiceLine, value: string | number) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}

const ServiceTable = ({ rows, onUpdate, onRemove, onAdd }: ServiceTableProps) => (
  <div className="space-y-2">
    {rows.map((row) => {
      const sum = row.qty * row.unitPrice;
      return (
        <div key={row.id} className="grid grid-cols-[1fr_60px_100px_80px_28px] gap-2 items-center">
          <div className="relative">
            <select
              value={row.catalogId}
              onChange={e => {
                const found = SERVICE_CATALOG.find(c => c.id === e.target.value);
                if (found) {
                  onUpdate(row.id, 'catalogId', found.id);
                  onUpdate(row.id, 'name', found.name);
                  onUpdate(row.id, 'unitPrice', found.price);
                  onUpdate(row.id, 'unit', found.unit);
                }
              }}
              className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
            >
              <option value="">— выбрать услугу —</option>
              {SERVICE_CATALOG.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({fmt(c.price)} ₽/{c.unit})</option>
              ))}
            </select>
          </div>
          <Input
            type="number"
            value={row.qty}
            min={0.1}
            step={0.1}
            onChange={e => onUpdate(row.id, 'qty', parseFloat(e.target.value) || 0)}
            className="text-right text-xs h-8 px-2"
          />
          <Input
            type="number"
            value={row.unitPrice}
            min={0}
            onChange={e => onUpdate(row.id, 'unitPrice', parseFloat(e.target.value) || 0)}
            className="text-right text-xs h-8 px-2"
          />
          <div className="text-right text-xs font-semibold text-gray-800 pr-1">{fmt(sum)} ₽</div>
          <button
            onClick={() => onRemove(row.id)}
            className="flex items-center justify-center w-6 h-6 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
            title="Удалить"
          >
            <Icon name="X" size={12} />
          </button>
        </div>
      );
    })}
    <div className="grid grid-cols-[1fr_60px_100px_80px_28px] gap-2 text-xs text-gray-400 pt-0.5">
      <span>Услуга</span>
      <span className="text-right">Кол-во</span>
      <span className="text-right">Цена, ₽</span>
      <span className="text-right">Сумма, ₽</span>
      <span />
    </div>
    <button
      onClick={onAdd}
      className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium mt-1 transition-colors"
    >
      <Icon name="Plus" size={13} />
      Добавить услугу
    </button>
  </div>
);

interface MaterialTableProps {
  rows: MaterialLine[];
  onUpdate: (id: string, field: keyof MaterialLine, value: string | number) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}

const MaterialTable = ({ rows, onUpdate, onRemove, onAdd }: MaterialTableProps) => (
  <div className="space-y-2">
    {rows.map((row) => {
      const sum = row.qty * row.unitPrice;
      return (
        <div key={row.id} className="grid grid-cols-[1fr_60px_100px_80px_28px] gap-2 items-center">
          <select
            value={row.catalogId}
            onChange={e => {
              const found = MATERIAL_CATALOG.find(c => c.id === e.target.value);
              if (found) {
                onUpdate(row.id, 'catalogId', found.id);
                onUpdate(row.id, 'name', found.name);
                onUpdate(row.id, 'unitPrice', found.price);
                onUpdate(row.id, 'unit', found.unit);
              }
            }}
            className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
          >
            <option value="">— выбрать материал —</option>
            {MATERIAL_CATALOG.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({fmt(c.price)} ₽/{c.unit})</option>
            ))}
          </select>
          <Input
            type="number"
            value={row.qty}
            min={0.1}
            step={0.1}
            onChange={e => onUpdate(row.id, 'qty', parseFloat(e.target.value) || 0)}
            className="text-right text-xs h-8 px-2"
          />
          <Input
            type="number"
            value={row.unitPrice}
            min={0}
            onChange={e => onUpdate(row.id, 'unitPrice', parseFloat(e.target.value) || 0)}
            className="text-right text-xs h-8 px-2"
          />
          <div className="text-right text-xs font-semibold text-gray-800 pr-1">{fmt(sum)} ₽</div>
          <button
            onClick={() => onRemove(row.id)}
            className="flex items-center justify-center w-6 h-6 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
            title="Удалить"
          >
            <Icon name="X" size={12} />
          </button>
        </div>
      );
    })}
    <div className="grid grid-cols-[1fr_60px_100px_80px_28px] gap-2 text-xs text-gray-400 pt-0.5">
      <span>Материал / ЗИП</span>
      <span className="text-right">Кол-во</span>
      <span className="text-right">Цена, ₽</span>
      <span className="text-right">Сумма, ₽</span>
      <span />
    </div>
    <button
      onClick={onAdd}
      className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium mt-1 transition-colors"
    >
      <Icon name="Plus" size={13} />
      Добавить материал
    </button>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const PriceCalculatorFull = () => {
  // ── Left panel state ──────────────────────────────────────────────────────
  const [client, setClient] = useState('');
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [workType, setWorkType] = useState<WorkType>('repair');
  const [priority, setPriority] = useState<Priority>('normal');

  const [services, setServices] = useState<ServiceLine[]>([
    { id: genId(), catalogId: 's1', name: 'Диагностика VRF', qty: 1, unit: 'шт', unitPrice: 3500 },
    { id: genId(), catalogId: 's2', name: 'Заправка хладагентом R410A', qty: 2, unit: 'кг', unitPrice: 1200 },
  ]);

  const [materials, setMaterials] = useState<MaterialLine[]>([
    { id: genId(), catalogId: 'm1', name: 'Хладагент R410A', qty: 2, unit: 'кг', unitPrice: 950 },
    { id: genId(), catalogId: 'm2', name: 'Медная трубка 1/4" (1 м)', qty: 3, unit: 'м', unitPrice: 320 },
  ]);

  // Coefficients
  const [beyondMkad, setBeyondMkad] = useState(false);
  const [weekend, setWeekend] = useState(false);
  const [nightWork, setNightWork] = useState(false);
  const [discountPct, setDiscountPct] = useState(0);

  // Right panel state
  const [includeVat, setIncludeVat] = useState(true);

  // ── Derived calculations ──────────────────────────────────────────────────
  const totals = useMemo(() => {
    const servicesSum = services.reduce((acc, s) => acc + s.qty * s.unitPrice, 0);
    const materialsSum = materials.reduce((acc, m) => acc + m.qty * m.unitPrice, 0);
    const baseSum = servicesSum + materialsSum;

    // Priority surcharge applies to services only
    const priorityMultiplier = PRIORITY_MULTIPLIER[priority];
    const prioritySurcharge = servicesSum * priorityMultiplier;

    // Coefficient surcharges apply to the base sum
    const beyondMkadAmt = beyondMkad ? baseSum * 0.15 : 0;
    const weekendAmt = weekend ? baseSum * 0.5 : 0;
    const nightAmt = nightWork ? baseSum * 0.75 : 0;

    const subtotalAfterCoeff = baseSum + prioritySurcharge + beyondMkadAmt + weekendAmt + nightAmt;
    const discountAmt = subtotalAfterCoeff * (Math.min(30, Math.max(0, discountPct)) / 100);
    const subtotalAfterDiscount = subtotalAfterCoeff - discountAmt;

    const vatAmt = includeVat ? subtotalAfterDiscount * 0.2 : 0;
    const totalWithVat = subtotalAfterDiscount + vatAmt;

    // Margin: cost price = 60% of services sum (materials are cost-pass-through)
    const costPrice = servicesSum * 0.6 + materialsSum;
    const profit = subtotalAfterDiscount - costPrice;
    const marginPct = subtotalAfterDiscount > 0 ? (profit / subtotalAfterDiscount) * 100 : 0;

    return {
      servicesSum,
      materialsSum,
      baseSum,
      prioritySurcharge,
      beyondMkadAmt,
      weekendAmt,
      nightAmt,
      subtotalAfterCoeff,
      discountAmt,
      subtotalAfterDiscount,
      vatAmt,
      totalWithVat,
      costPrice,
      profit,
      marginPct,
    };
  }, [services, materials, priority, beyondMkad, weekend, nightWork, discountPct, includeVat]);

  // ── Service row handlers ──────────────────────────────────────────────────
  const updateService = (id: string, field: keyof ServiceLine, value: string | number) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const addService = () => {
    setServices(prev => [...prev, { id: genId(), catalogId: '', name: '', qty: 1, unit: 'шт', unitPrice: 0 }]);
  };

  // ── Material row handlers ─────────────────────────────────────────────────
  const updateMaterial = (id: string, field: keyof MaterialLine, value: string | number) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  const addMaterial = () => {
    setMaterials(prev => [...prev, { id: genId(), catalogId: '', name: '', qty: 1, unit: 'шт', unitPrice: 0 }]);
  };

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleCreateKP = () => {
    if (!client.trim()) {
      toast.error('Укажите клиента перед созданием КП');
      return;
    }
    toast.success(`КП для ${client} создано`, { description: `Итого: ${fmt(totals.subtotalAfterDiscount)} ₽` });
  };

  const handleCreateOrder = () => {
    if (!client.trim()) {
      toast.error('Укажите клиента перед созданием заявки');
      return;
    }
    toast.success('Заявка создана', { description: `${WORK_TYPE_LABEL[workType]} · ${client}` });
  };

  const handleSaveTemplate = () => {
    toast.success('Шаблон сохранён', { description: 'Доступен в разделе «Шаблоны расчётов»' });
  };

  const handleCopyLink = () => {
    toast.success('Ссылка скопирована в буфер обмена');
  };

  // ── Filtered client suggestions ───────────────────────────────────────────
  const clientSuggestions = client.length > 0
    ? CLIENT_SUGGESTIONS.filter(c => c.toLowerCase().includes(client.toLowerCase()))
    : [];

  // ── Toggle helper ─────────────────────────────────────────────────────────
  const Toggle = ({
    value,
    onChange,
    label,
    badge,
  }: {
    value: boolean;
    onChange: (v: boolean) => void;
    label: string;
    badge: string;
  }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(!value)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
            value ? 'bg-blue-500' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
              value ? 'translate-x-[18px]' : 'translate-x-[3px]'
            }`}
          />
        </button>
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <Badge
        variant={value ? 'default' : 'secondary'}
        className={`text-xs ${value ? 'bg-blue-100 text-blue-700 border-blue-200' : 'text-gray-400'}`}
      >
        {badge}
      </Badge>
    </div>
  );

  // ── Section wrapper ───────────────────────────────────────────────────────
  const Section = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <Icon name={icon as any} size={14} className="text-gray-500" />
        <span className="text-sm font-semibold text-gray-700">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full bg-gray-50 overflow-hidden">
      {/* ─── Left Panel ────────────────────────────────────────────────────── */}
      <div
        className="flex flex-col gap-4 overflow-y-auto p-4 border-r border-gray-200 bg-gray-50"
        style={{ width: 380, minWidth: 380 }}
      >
        <div className="flex items-center gap-2 pb-1">
          <Icon name="Calculator" size={18} className="text-blue-600" />
          <h2 className="text-base font-bold text-gray-900">Калькулятор стоимости работ</h2>
        </div>

        {/* Клиент и объект */}
        <Section title="Клиент и объект" icon="User">
          <div className="space-y-3">
            {/* Client search */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Клиент</label>
              <div className="relative">
                <Icon name="Search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <Input
                  value={client}
                  onChange={e => {
                    setClient(e.target.value);
                    setShowClientSuggestions(true);
                  }}
                  onFocus={() => setShowClientSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowClientSuggestions(false), 150)}
                  placeholder="Поиск клиента..."
                  className="pl-8 h-9 text-sm"
                />
                {showClientSuggestions && clientSuggestions.length > 0 && (
                  <div className="absolute z-10 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {clientSuggestions.map(s => (
                      <button
                        key={s}
                        onMouseDown={() => {
                          setClient(s);
                          setShowClientSuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-blue-50 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Work type */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Тип работ</label>
              <select
                value={workType}
                onChange={e => setWorkType(e.target.value as WorkType)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 h-9"
              >
                <option value="repair">Ремонт</option>
                <option value="maintenance">ТО (техническое обслуживание)</option>
                <option value="installation">Монтаж</option>
                <option value="diagnostics">Диагностика</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Приоритет</label>
              <div className="flex gap-2">
                {(['normal', 'urgent', 'emergency'] as Priority[]).map(p => {
                  const colors: Record<Priority, string> = {
                    normal: 'bg-gray-100 text-gray-600 border-gray-200',
                    urgent: 'bg-amber-50 text-amber-700 border-amber-200',
                    emergency: 'bg-red-50 text-red-700 border-red-200',
                  };
                  const active: Record<Priority, string> = {
                    normal: 'bg-gray-700 text-white border-gray-700',
                    urgent: 'bg-amber-500 text-white border-amber-500',
                    emergency: 'bg-red-600 text-white border-red-600',
                  };
                  const isActive = priority === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`flex-1 text-xs font-medium py-1.5 rounded-lg border transition-all ${
                        isActive ? active[p] : colors[p]
                      }`}
                    >
                      {PRIORITY_LABEL[p]}
                      {p !== 'normal' && (
                        <span className="block text-[10px] font-normal opacity-75">
                          +{p === 'urgent' ? '30' : '100'}%
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Section>

        {/* Услуги */}
        <Section title="Услуги" icon="Wrench">
          <ServiceTable
            rows={services}
            onUpdate={updateService}
            onRemove={removeService}
            onAdd={addService}
          />
        </Section>

        {/* Материалы и ЗИП */}
        <Section title="Материалы и ЗИП" icon="Package">
          <MaterialTable
            rows={materials}
            onUpdate={updateMaterial}
            onRemove={removeMaterial}
            onAdd={addMaterial}
          />
        </Section>

        {/* Коэффициенты */}
        <Section title="Коэффициенты" icon="Percent">
          <div className="divide-y divide-gray-50">
            <Toggle
              value={beyondMkad}
              onChange={setBeyondMkad}
              label="Выезд за МКАД"
              badge="+15%"
            />
            <Toggle
              value={weekend}
              onChange={setWeekend}
              label="Работа в выходной день"
              badge="+50%"
            />
            <Toggle
              value={nightWork}
              onChange={setNightWork}
              label="Ночные работы (после 22:00)"
              badge="+75%"
            />
            <div className="flex items-center justify-between py-2 gap-4">
              <span className="text-sm text-gray-700 whitespace-nowrap">Скидка клиенту</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={discountPct}
                  min={0}
                  max={30}
                  onChange={e => setDiscountPct(Math.min(30, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="w-20 text-right h-8 text-sm"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* ─── Right Panel ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Итоговый расчёт</h3>
            {client && (
              <p className="text-sm text-gray-500 mt-0.5">
                {client} · {WORK_TYPE_LABEL[workType]} · <span className="font-medium">{PRIORITY_LABEL[priority]}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs text-gray-500">
              {services.length + materials.length} позиц.
            </Badge>
          </div>
        </div>

        {/* Сводка заказа */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
            <Icon name="FileText" size={14} className="text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">Сводка заказа</span>
          </div>

          <div className="p-4">
            {/* Positions table */}
            {(services.length > 0 || materials.length > 0) && (
              <div className="mb-4 border border-gray-100 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-2.5 font-medium text-gray-500">Позиция</th>
                      <th className="text-right p-2.5 font-medium text-gray-500 w-14">Кол-во</th>
                      <th className="text-right p-2.5 font-medium text-gray-500 w-20">Цена</th>
                      <th className="text-right p-2.5 font-medium text-gray-500 w-20">Сумма</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {services.filter(s => s.name).map(s => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="p-2.5 text-gray-800">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                            {s.name}
                          </div>
                        </td>
                        <td className="p-2.5 text-right text-gray-600">{s.qty} {s.unit}</td>
                        <td className="p-2.5 text-right text-gray-600">{fmt(s.unitPrice)} ₽</td>
                        <td className="p-2.5 text-right font-medium text-gray-800">{fmt(s.qty * s.unitPrice)} ₽</td>
                      </tr>
                    ))}
                    {materials.filter(m => m.name).map(m => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="p-2.5 text-gray-800">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                            {m.name}
                          </div>
                        </td>
                        <td className="p-2.5 text-right text-gray-600">{m.qty} {m.unit}</td>
                        <td className="p-2.5 text-right text-gray-600">{fmt(m.unitPrice)} ₽</td>
                        <td className="p-2.5 text-right font-medium text-gray-800">{fmt(m.qty * m.unitPrice)} ₽</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Summary rows */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                  <span>Сумма услуг:</span>
                </div>
                <span className="font-medium">{fmt(totals.servicesSum)} ₽</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span>Сумма материалов:</span>
                </div>
                <span className="font-medium">{fmt(totals.materialsSum)} ₽</span>
              </div>

              {/* Applied coefficients */}
              {(totals.prioritySurcharge > 0 || totals.beyondMkadAmt > 0 || totals.weekendAmt > 0 || totals.nightAmt > 0) && (
                <div className="border-t border-gray-100 pt-2 space-y-1.5">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Применённые коэффициенты</p>
                  {totals.prioritySurcharge > 0 && (
                    <div className="flex justify-between text-amber-700">
                      <span>Надбавка за приоритет ({priority === 'urgent' ? '+30%' : '+100%'}):</span>
                      <span>+{fmt(totals.prioritySurcharge)} ₽</span>
                    </div>
                  )}
                  {totals.beyondMkadAmt > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span>Выезд за МКАД (+15%):</span>
                      <span>+{fmt(totals.beyondMkadAmt)} ₽</span>
                    </div>
                  )}
                  {totals.weekendAmt > 0 && (
                    <div className="flex justify-between text-purple-600">
                      <span>Работа в выходной (+50%):</span>
                      <span>+{fmt(totals.weekendAmt)} ₽</span>
                    </div>
                  )}
                  {totals.nightAmt > 0 && (
                    <div className="flex justify-between text-indigo-600">
                      <span>Ночные работы (+75%):</span>
                      <span>+{fmt(totals.nightAmt)} ₽</span>
                    </div>
                  )}
                </div>
              )}

              {discountPct > 0 && (
                <div className="flex justify-between text-green-600 border-t border-gray-100 pt-2">
                  <span>Скидка ({discountPct}%):</span>
                  <span>−{fmt(totals.discountAmt)} ₽</span>
                </div>
              )}

              {/* ИТОГО */}
              <div className="border-t-2 border-gray-200 pt-3 mt-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-base">ИТОГО:</span>
                  <span className="font-bold text-gray-900 text-2xl">{fmt(totals.subtotalAfterDiscount)} ₽</span>
                </div>
              </div>

              {/* VAT toggle */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIncludeVat(v => !v)}
                    className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none ${
                      includeVat ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                        includeVat ? 'translate-x-[13px]' : 'translate-x-[2px]'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-gray-600">НДС 20%:</span>
                </div>
                <span className={`text-sm ${includeVat ? 'text-gray-700 font-medium' : 'text-gray-400 line-through'}`}>
                  {fmt(totals.vatAmt)} ₽
                </span>
              </div>

              {includeVat && (
                <div className="flex justify-between items-center bg-blue-50 rounded-lg px-3 py-2 mt-1">
                  <span className="font-semibold text-blue-900 text-sm">Итого с НДС:</span>
                  <span className="font-bold text-blue-900 text-lg">{fmtFull(totals.totalWithVat)} ₽</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-4 pb-4 grid grid-cols-2 gap-2">
            <Button
              size="sm"
              onClick={handleCreateKP}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Icon name="FileText" size={14} className="mr-1.5" />
              Создать КП
            </Button>
            <Button
              size="sm"
              onClick={handleCreateOrder}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Icon name="ClipboardList" size={14} className="mr-1.5" />
              Создать заявку
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveTemplate}
              className="w-full"
            >
              <Icon name="Bookmark" size={14} className="mr-1.5" />
              Сохранить шаблон
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="w-full"
            >
              <Icon name="Link" size={14} className="mr-1.5" />
              Скопировать ссылку
            </Button>
          </div>
        </div>

        {/* Маржинальность */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
            <Icon name="TrendingUp" size={14} className="text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">Маржинальность</span>
            <Badge
              className={`ml-auto text-xs ${
                totals.marginPct >= 30
                  ? 'bg-emerald-100 text-emerald-700'
                  : totals.marginPct >= 15
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {totals.marginPct.toFixed(1)}%
            </Badge>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Себестоимость:</span>
              <span className="font-medium text-gray-800">{fmt(totals.costPrice)} ₽</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Прибыль:</span>
              <span className={`font-semibold ${totals.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {totals.profit >= 0 ? '+' : ''}{fmt(totals.profit)} ₽
              </span>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Себестоимость</span>
                <span>Прибыль</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-gray-300 transition-all duration-300"
                  style={{ width: `${Math.min(100, totals.subtotalAfterDiscount > 0 ? (totals.costPrice / totals.subtotalAfterDiscount) * 100 : 0)}%` }}
                />
                <div
                  className={`h-full transition-all duration-300 ${
                    totals.marginPct >= 30
                      ? 'bg-emerald-400'
                      : totals.marginPct >= 15
                      ? 'bg-amber-400'
                      : 'bg-red-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, totals.subtotalAfterDiscount > 0 ? (totals.profit / totals.subtotalAfterDiscount) * 100 : 0))}%` }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1.5">
                <span className="text-gray-500">{fmt(totals.costPrice)} ₽</span>
                <span className={`font-medium ${
                  totals.marginPct >= 30 ? 'text-emerald-600' : totals.marginPct >= 15 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  Маржа: {totals.marginPct.toFixed(1)}%
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-400 pt-1">
              * Себестоимость: 60% от суммы услуг + материалы по закупочной цене
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceCalculatorFull;
