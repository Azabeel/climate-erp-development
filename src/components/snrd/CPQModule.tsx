import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CPQLine {
  id: string;
  name: string;
  qty: number;
  price: number;
}

interface NewLine {
  name: string;
  qty: string;
  price: string;
}

type TierId = 'good' | 'better' | 'best';

interface EditorState {
  tierId: TierId | null;
  open: boolean;
  discount: string;
  newLine: NewLine;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const CLIENTS = [
  'ООО "Торговый центр Мираж"',
  'ИП Смирнов В.А.',
  'ПАО "АэроКлимат"',
  'ЗАО "Ледяной дворец"',
];

const OBJECTS = [
  'ТЦ Мираж — зал 1 (Daikin VRV IV)',
  'Офис 4 эт. (Mitsubishi Heavy SRK35)',
  'Серверная (Haier AD482)',
  'Производственный цех (General Climate)',
];

const MANAGERS = ['Кузнецов А.Д.', 'Петрова Л.В.', 'Захаров И.О.'];

// Good lines
const GOOD_LINES: CPQLine[] = [
  { id: 'g1', name: 'Диагностика системы кондиционирования', qty: 1, price: 4500 },
  { id: 'g2', name: 'Чистка фильтров внутреннего блока', qty: 1, price: 3800 },
  { id: 'g3', name: 'Замена расходников (прокладки, дренаж)', qty: 1, price: 6200 },
  { id: 'g4', name: 'Проверка герметичности фреонового контура', qty: 1, price: 14000 },
];

// Better = Good + extra
const BETTER_EXTRA_LINES: CPQLine[] = [
  { id: 'b5', name: 'Профилактика VRF-системы', qty: 1, price: 8500 },
  { id: 'b6', name: 'Промывка теплообменника', qty: 1, price: 6200 },
  { id: 'b7', name: 'Дозаправка фреона R-410A (0.5 кг)', qty: 1, price: 7000 },
];

// Best = Better + extra
const BEST_EXTRA_LINES: CPQLine[] = [
  { id: 'p8', name: 'Замена фильтров HEPA', qty: 2, price: 4800 },
  { id: 'p9', name: 'Балансировка вентиляционных потоков', qty: 1, price: 9500 },
  { id: 'p10', name: 'Приоритетный SLA (реакция 2 ч)', qty: 1, price: 7200 },
];

const GOOD_TOTAL = 28500;
const BETTER_TOTAL = 52000;
const BEST_TOTAL = 87000;

// Feature comparison rows
interface FeatureRow {
  label: string;
  good: boolean;
  better: boolean;
  best: boolean;
}

const FEATURES: FeatureRow[] = [
  { label: 'Диагностика системы',          good: true,  better: true,  best: true  },
  { label: 'Чистка фильтров',              good: true,  better: true,  best: true  },
  { label: 'Замена расходников',           good: true,  better: true,  best: true  },
  { label: 'Промывка теплообменника',      good: false, better: true,  best: true  },
  { label: 'Дозаправка фреона',            good: false, better: true,  best: true  },
  { label: 'Фильтры HEPA',                 good: false, better: false, best: true  },
  { label: 'Балансировка потоков',         good: false, better: false, best: true  },
  { label: 'Приоритетный SLA',             good: false, better: false, best: true  },
  { label: 'Онлайн мониторинг',            good: false, better: false, best: true  },
  { label: 'Выезд в выходные дни',         good: false, better: true,  best: true  },
  { label: 'Скидка на ЗИП 10%',           good: false, better: false, best: true  },
  { label: 'Персональный менеджер',        good: false, better: false, best: true  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (v: number) => new Intl.NumberFormat('ru-RU').format(Math.round(v)) + ' ₽';

const applyDiscount = (total: number, pct: string) => {
  const n = parseFloat(pct);
  if (!n || n <= 0 || n >= 100) return total;
  return total * (1 - n / 100);
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface TierCardProps {
  id: TierId;
  name: string;
  label: string;
  labelColor: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  iconName: string;
  iconColor: string;
  lines: CPQLine[];
  total: number;
  discountPct: string;
  highlight?: boolean;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  deadline: string;
  warranty: string;
}

const TierCard = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  id: _id,
  name,
  label,
  labelColor,
  iconName,
  iconColor,
  lines,
  total,
  discountPct,
  highlight,
  selected,
  onSelect,
  onEdit,
  deadline,
  warranty,
}: TierCardProps) => {
  const finalTotal = applyDiscount(total, discountPct);
  const hasDiscount = parseFloat(discountPct) > 0 && parseFloat(discountPct) < 100;

  return (
    <div
      className={[
        'flex flex-col rounded-2xl border-2 bg-white transition-all duration-200 overflow-hidden',
        selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200',
        highlight ? 'shadow-xl shadow-blue-100 scale-[1.02]' : 'shadow-sm',
      ].join(' ')}
    >
      {/* Card header */}
      <div className={`px-5 pt-5 pb-4 ${highlight ? 'bg-gradient-to-br from-blue-50 to-indigo-50' : 'bg-gray-50'}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${highlight ? 'bg-blue-600' : 'bg-white border border-gray-200'}`}>
              <Icon name={iconName} size={20} className={highlight ? 'text-white' : iconColor} />
            </div>
            <div>
              <p className="font-bold text-gray-900 leading-tight">{name}</p>
              <Badge
                className={`mt-0.5 text-xs font-semibold px-2 py-0 ${labelColor}`}
                variant="outline"
              >
                {label}
              </Badge>
            </div>
          </div>
          {highlight && (
            <Badge className="bg-blue-600 text-white text-xs font-bold">
              Популярный выбор
            </Badge>
          )}
        </div>

        {/* Price */}
        <div className="mt-2">
          {hasDiscount && (
            <p className="text-sm text-gray-400 line-through">{fmt(total)}</p>
          )}
          <p className="text-3xl font-extrabold text-gray-900">{fmt(finalTotal)}</p>
          {hasDiscount && (
            <p className="text-xs text-green-600 font-medium mt-0.5">Скидка {discountPct}%</p>
          )}
        </div>

        {/* Meta */}
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Icon name="Clock" size={12} /> {deadline}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="ShieldCheck" size={12} /> Гарантия {warranty}
          </span>
        </div>
      </div>

      {/* Lines */}
      <div className="flex-1 px-5 py-4 space-y-1.5">
        {lines.map(line => (
          <div key={line.id} className="flex items-start justify-between gap-2 text-sm">
            <div className="flex items-center gap-1.5 text-gray-700 min-w-0">
              <Icon name="CheckCircle2" size={14} className="text-green-500 shrink-0 mt-0.5" />
              <span className="leading-snug">{line.name}{line.qty > 1 ? ` ×${line.qty}` : ''}</span>
            </div>
            <span className="text-gray-500 whitespace-nowrap shrink-0">{fmt(line.price * line.qty)}</span>
          </div>
        ))}
      </div>

      {/* Footer actions */}
      <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-xs"
          onClick={onEdit}
        >
          <Icon name="Pencil" size={12} className="mr-1" /> Редактировать
        </Button>
        <Button
          size="sm"
          className={`flex-1 text-xs ${selected ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
          variant={selected ? 'default' : 'outline'}
          onClick={onSelect}
        >
          {selected
            ? <><Icon name="CheckCircle2" size={12} className="mr-1" /> Выбран</>
            : 'Выбрать'
          }
        </Button>
      </div>
    </div>
  );
};

// ─── Editor Panel ─────────────────────────────────────────────────────────────

interface EditorPanelProps {
  tierId: TierId;
  tierName: string;
  discount: string;
  newLine: NewLine;
  onDiscountChange: (v: string) => void;
  onNewLineChange: (f: keyof NewLine, v: string) => void;
  onAddLine: () => void;
  onClose: () => void;
}

const EditorPanel = ({
  tierName,
  discount,
  newLine,
  onDiscountChange,
  onNewLineChange,
  onAddLine,
  onClose,
}: EditorPanelProps) => (
  <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 mb-6">
    <div className="flex items-center justify-between mb-5">
      <h3 className="font-bold text-gray-900 flex items-center gap-2">
        <Icon name="Settings2" size={16} className="text-blue-600" />
        Редактор: {tierName}
      </h3>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <Icon name="X" size={16} />
      </button>
    </div>

    {/* Add new line */}
    <div className="mb-5">
      <p className="text-sm font-semibold text-gray-700 mb-2">Добавить позицию</p>
      <div className="grid grid-cols-[1fr_80px_100px_auto] gap-2 items-end">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Название</label>
          <Input
            placeholder="Наименование услуги"
            value={newLine.name}
            onChange={e => onNewLineChange('name', e.target.value)}
            className="text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Кол-во</label>
          <Input
            type="number"
            placeholder="1"
            value={newLine.qty}
            onChange={e => onNewLineChange('qty', e.target.value)}
            className="text-sm"
            min="0.1"
            step="0.1"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Цена, ₽</label>
          <Input
            type="number"
            placeholder="0"
            value={newLine.price}
            onChange={e => onNewLineChange('price', e.target.value)}
            className="text-sm"
            min="0"
          />
        </div>
        <Button size="sm" onClick={onAddLine} className="mb-0.5">
          <Icon name="Plus" size={14} className="mr-1" /> Добавить
        </Button>
      </div>
    </div>

    {/* Discount */}
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-2">Скидка на вариант</p>
      <div className="flex items-center gap-3">
        <div className="w-40">
          <Input
            type="number"
            placeholder="0"
            value={discount}
            onChange={e => onDiscountChange(e.target.value)}
            className="text-sm"
            min="0"
            max="99"
          />
        </div>
        <span className="text-sm text-gray-500">%</span>
        <Button
          size="sm"
          onClick={() => toast.success(`Скидка ${discount}% применена к варианту «${tierName}»`)}
        >
          <Icon name="Check" size={13} className="mr-1" /> Применить
        </Button>
      </div>
    </div>
  </div>
);

// ─── Feature Check Cell ───────────────────────────────────────────────────────

const FeatureCell = ({ value }: { value: boolean }) =>
  value
    ? <Icon name="CheckCircle2" size={18} className="text-green-500 mx-auto" />
    : <Icon name="Minus" size={18} className="text-gray-300 mx-auto" />;

// ─── Main Component ───────────────────────────────────────────────────────────

const CPQModule = () => {
  // Header state
  const [client, setClient] = useState(CLIENTS[0]);
  const [object, setObject] = useState(OBJECTS[0]);
  const [manager, setManager] = useState(MANAGERS[0]);

  // Extra lines added via editor
  const [extraLines, setExtraLines] = useState<Record<TierId, CPQLine[]>>({
    good: [],
    better: [],
    best: [],
  });

  // Discounts per tier
  const [discounts, setDiscounts] = useState<Record<TierId, string>>({
    good: '',
    better: '',
    best: '',
  });

  // Selected tier
  const [selected, setSelected] = useState<TierId | null>('better');

  // Editor panel
  const [editor, setEditor] = useState<EditorState>({
    tierId: null,
    open: false,
    discount: '',
    newLine: { name: '', qty: '1', price: '' },
  });

  // Bottom form
  const [paymentMode, setPaymentMode] = useState<'prepay100' | 'split5050' | 'postpay'>('prepay100');
  const [conditions, setConditions] = useState('');

  // ── Computed lines ──

  const linesFor = (id: TierId): CPQLine[] => {
    const base: CPQLine[] =
      id === 'good'
        ? [...GOOD_LINES]
        : id === 'better'
        ? [...GOOD_LINES, ...BETTER_EXTRA_LINES]
        : [...GOOD_LINES, ...BETTER_EXTRA_LINES, ...BEST_EXTRA_LINES];
    return [...base, ...extraLines[id]];
  };

  const baseTotal = (id: TierId) =>
    id === 'good' ? GOOD_TOTAL : id === 'better' ? BETTER_TOTAL : BEST_TOTAL;

  const totalFor = (id: TierId) => {
    const extra = extraLines[id].reduce((s, l) => s + l.price * l.qty, 0);
    return baseTotal(id) + extra;
  };

  // ── Editor handlers ──

  const openEditor = (tierId: TierId) => {
    setEditor({
      tierId,
      open: true,
      discount: discounts[tierId],
      newLine: { name: '', qty: '1', price: '' },
    });
  };

  const closeEditor = () => setEditor(prev => ({ ...prev, open: false, tierId: null }));

  const handleAddLine = () => {
    if (!editor.tierId) return;
    const name = editor.newLine.name.trim();
    const qty = parseFloat(editor.newLine.qty) || 1;
    const price = parseFloat(editor.newLine.price) || 0;
    if (!name) { toast.error('Введите название позиции'); return; }
    const newLine: CPQLine = {
      id: `extra-${editor.tierId}-${Date.now()}`,
      name,
      qty,
      price,
    };
    setExtraLines(prev => ({ ...prev, [editor.tierId!]: [...prev[editor.tierId!], newLine] }));
    setEditor(prev => ({ ...prev, newLine: { name: '', qty: '1', price: '' } }));
    toast.success(`Позиция «${name}» добавлена`);
  };

  const handleDiscountApply = (tierId: TierId, value: string) => {
    setDiscounts(prev => ({ ...prev, [tierId]: value }));
  };

  // ── Tier meta ──

  const tierMeta: Record<TierId, {
    name: string; label: string; labelColor: string;
    iconName: string; iconColor: string;
    highlight?: boolean; deadline: string; warranty: string;
  }> = {
    good: {
      name: 'Базовый',
      label: 'GOOD',
      labelColor: 'border-green-400 text-green-700',
      iconName: 'Shield',
      iconColor: 'text-green-600',
      deadline: '1 день',
      warranty: '3 месяца',
    },
    better: {
      name: 'Стандарт',
      label: 'BETTER',
      labelColor: 'border-blue-400 text-blue-700',
      iconName: 'Star',
      iconColor: 'text-blue-600',
      highlight: true,
      deadline: '2 дня',
      warranty: '6 месяцев',
    },
    best: {
      name: 'Премиум',
      label: 'BEST',
      labelColor: 'border-amber-400 text-amber-700',
      iconName: 'Crown',
      iconColor: 'text-amber-600',
      deadline: '3 дня',
      warranty: '12 месяцев',
    },
  };

  const TIER_IDS: TierId[] = ['good', 'better', 'best'];

  const handleCreateOrder = () => {
    if (!selected) { toast.error('Выберите вариант КП'); return; }
    const meta = tierMeta[selected];
    toast.success(`Наряд создан по варианту «${meta.name}» на сумму ${fmt(applyDiscount(totalFor(selected), discounts[selected]))}`);
  };

  // ── Render ──

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          {/* Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
              <Icon name="FileText" size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Конструктор коммерческих предложений</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                <span className="font-medium text-gray-700">КП-2026-041</span>
                &nbsp;·&nbsp;Дата: 16.05.2026
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Открывается предварительный просмотр...')}
            >
              <Icon name="Eye" size={14} className="mr-1.5" /> Предварительный просмотр
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Генерация PDF...')}
            >
              <Icon name="Download" size={14} className="mr-1.5" /> Скачать PDF
            </Button>
            <Button
              size="sm"
              onClick={() => toast.success(`КП-2026-041 отправлено клиенту: ${client}`)}
            >
              <Icon name="Send" size={14} className="mr-1.5" /> Отправить клиенту
            </Button>
          </div>
        </div>

        {/* Meta fields */}
        <div className="grid grid-cols-3 gap-4 mt-5">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Клиент</label>
            <select
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={client}
              onChange={e => setClient(e.target.value)}
            >
              {CLIENTS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Объект обслуживания</label>
            <select
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={object}
              onChange={e => setObject(e.target.value)}
            >
              {OBJECTS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Менеджер</label>
            <select
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={manager}
              onChange={e => setManager(e.target.value)}
            >
              {MANAGERS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Tier cards ── */}
      <div className="grid grid-cols-3 gap-5">
        {TIER_IDS.map(id => {
          const meta = tierMeta[id];
          return (
            <TierCard
              key={id}
              id={id}
              name={meta.name}
              label={meta.label}
              labelColor={meta.labelColor}
              iconName={meta.iconName}
              iconColor={meta.iconColor}
              badgeVariant="outline"
              highlight={meta.highlight}
              lines={linesFor(id)}
              total={totalFor(id)}
              discountPct={discounts[id]}
              selected={selected === id}
              deadline={meta.deadline}
              warranty={meta.warranty}
              onSelect={() => setSelected(id === selected ? null : id)}
              onEdit={() => openEditor(id)}
            />
          );
        })}
      </div>

      {/* ── Editor panel ── */}
      {editor.open && editor.tierId && (
        <EditorPanel
          tierId={editor.tierId}
          tierName={tierMeta[editor.tierId].name}
          discount={discounts[editor.tierId]}
          newLine={editor.newLine}
          onDiscountChange={v => {
            setEditor(prev => ({ ...prev, discount: v }));
            handleDiscountApply(editor.tierId!, v);
          }}
          onNewLineChange={(f, v) =>
            setEditor(prev => ({ ...prev, newLine: { ...prev.newLine, [f]: v } }))
          }
          onAddLine={handleAddLine}
          onClose={closeEditor}
        />
      )}

      {/* ── Feature comparison table ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <Icon name="TableProperties" size={16} className="text-blue-600" />
          <h2 className="font-bold text-gray-900">Сравнительная таблица вариантов</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-3 text-left text-gray-500 font-medium w-1/2">Включено в вариант</th>
                <th className="px-6 py-3 text-center text-green-700 font-bold">
                  <div className="flex flex-col items-center gap-1">
                    <Badge variant="outline" className="border-green-400 text-green-700 text-xs">GOOD</Badge>
                    <span className="text-xs font-normal text-gray-500">Базовый</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-blue-700 font-bold">
                  <div className="flex flex-col items-center gap-1">
                    <Badge variant="outline" className="border-blue-400 text-blue-700 text-xs">BETTER</Badge>
                    <span className="text-xs font-normal text-gray-500">Стандарт</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-amber-700 font-bold">
                  <div className="flex flex-col items-center gap-1">
                    <Badge variant="outline" className="border-amber-400 text-amber-700 text-xs">BEST</Badge>
                    <span className="text-xs font-normal text-gray-500">Премиум</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {FEATURES.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 text-gray-700">{row.label}</td>
                  <td className="px-6 py-3 text-center"><FeatureCell value={row.good} /></td>
                  <td className="px-6 py-3 text-center"><FeatureCell value={row.better} /></td>
                  <td className="px-6 py-3 text-center"><FeatureCell value={row.best} /></td>
                </tr>
              ))}
            </tbody>
            {/* Totals row */}
            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
              <tr>
                <td className="px-6 py-4 font-bold text-gray-900">Итоговая стоимость</td>
                {TIER_IDS.map(id => (
                  <td key={id} className="px-6 py-4 text-center">
                    <p className="font-extrabold text-gray-900 text-base">
                      {fmt(applyDiscount(totalFor(id), discounts[id]))}
                    </p>
                    {parseFloat(discounts[id]) > 0 && (
                      <p className="text-xs text-gray-400 line-through">{fmt(totalFor(id))}</p>
                    )}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Bottom block ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
          <Icon name="ClipboardList" size={16} className="text-blue-600" />
          Условия предложения
        </h2>

        <div className="grid grid-cols-2 gap-8">
          {/* Left */}
          <div className="space-y-5">
            {/* Validity */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Срок действия КП</label>
              <div className="flex items-center gap-2">
                <Icon name="CalendarClock" size={16} className="text-gray-400" />
                <span className="text-sm text-gray-700">14 дней с момента выставления (до 30.05.2026)</span>
              </div>
            </div>

            {/* Payment */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Способ оплаты</label>
              <div className="space-y-2">
                {([
                  ['prepay100', '100% предоплата'],
                  ['split5050', '50% предоплата / 50% по факту'],
                  ['postpay',   'Постоплата (30 дней)'],
                ] as [typeof paymentMode, string][]).map(([val, label]) => (
                  <label key={val} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value={val}
                      checked={paymentMode === val}
                      onChange={() => setPaymentMode(val)}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-5">
            {/* Special conditions */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Особые условия</label>
              <textarea
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700 placeholder:text-gray-400"
                rows={5}
                placeholder="Напишите особые условия, примечания к договору или дополнительные требования клиента..."
                value={conditions}
                onChange={e => setConditions(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Selected variant summary + CTA */}
        <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div>
            {selected ? (
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  selected === 'good' ? 'bg-green-100' : selected === 'better' ? 'bg-blue-100' : 'bg-amber-100'
                }`}>
                  <Icon
                    name={tierMeta[selected].iconName}
                    size={18}
                    className={tierMeta[selected].iconColor}
                  />
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    Выбран вариант: {tierMeta[selected].name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Итого: <span className="font-semibold text-gray-900">
                      {fmt(applyDiscount(totalFor(selected), discounts[selected]))}
                    </span>
                    &nbsp;·&nbsp;Гарантия: {tierMeta[selected].warranty}
                    &nbsp;·&nbsp;Срок: {tierMeta[selected].deadline}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Вариант не выбран — нажмите «Выбрать» на карточке</p>
            )}
          </div>

          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8"
            onClick={handleCreateOrder}
          >
            <Icon name="Wrench" size={16} className="mr-2" />
            Создать наряд по выбранному варианту
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CPQModule;
