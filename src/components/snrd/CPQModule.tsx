import { useState } from 'react';
import { FileText, Plus, Send, Download, Check, ChevronDown, ChevronUp, Star, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CPQLine {
  id: string;
  name: string;
  qty: number;
  unit: string;
  price: number;
  included: boolean;
}

interface CPQTier {
  id: 'good' | 'better' | 'best';
  name: string;
  tagline: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  lines: CPQLine[];
  recommended?: boolean;
}

const INITIAL_TIERS: CPQTier[] = [
  {
    id: 'good',
    name: 'Базовый',
    tagline: 'Устранение неисправности',
    icon: Check,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    lines: [
      { id: 'g1', name: 'Диагностика кондиционера', qty: 1, unit: 'шт.', price: 1500, included: true },
      { id: 'g2', name: 'Замена конденсатора пускового', qty: 1, unit: 'шт.', price: 1800, included: true },
      { id: 'g3', name: 'Работа инженера (1 ч)', qty: 1, unit: 'ч', price: 2000, included: true },
      { id: 'g4', name: 'Дозаправка хладагентом R-410A', qty: 0.5, unit: 'кг', price: 2200, included: false },
    ]
  },
  {
    id: 'better',
    name: 'Стандарт',
    tagline: 'Ремонт + профилактика',
    icon: Star,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    recommended: true,
    lines: [
      { id: 'b1', name: 'Диагностика кондиционера', qty: 1, unit: 'шт.', price: 1500, included: true },
      { id: 'b2', name: 'Замена конденсатора пускового', qty: 1, unit: 'шт.', price: 1800, included: true },
      { id: 'b3', name: 'Работа инженера (1.5 ч)', qty: 1.5, unit: 'ч', price: 2000, included: true },
      { id: 'b4', name: 'Дозаправка хладагентом R-410A', qty: 0.5, unit: 'кг', price: 2200, included: true },
      { id: 'b5', name: 'Чистка теплообменника', qty: 1, unit: 'шт.', price: 1200, included: true },
      { id: 'b6', name: 'Замена фильтра', qty: 2, unit: 'шт.', price: 350, included: true },
    ]
  },
  {
    id: 'best',
    name: 'Премиум',
    tagline: 'Полное ТО + гарантия 1 год',
    icon: Crown,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200',
    lines: [
      { id: 'p1', name: 'Диагностика кондиционера', qty: 1, unit: 'шт.', price: 1500, included: true },
      { id: 'p2', name: 'Замена конденсатора пускового', qty: 1, unit: 'шт.', price: 1800, included: true },
      { id: 'p3', name: 'Работа инженера (2 ч)', qty: 2, unit: 'ч', price: 2000, included: true },
      { id: 'p4', name: 'Заправка хладагентом R-410A', qty: 1, unit: 'кг', price: 2200, included: true },
      { id: 'p5', name: 'Полное ТО внутреннего блока', qty: 1, unit: 'шт.', price: 2500, included: true },
      { id: 'p6', name: 'Дезинфекция и дезодорация', qty: 1, unit: 'шт.', price: 800, included: true },
      { id: 'p7', name: 'Замена комплекта фильтров', qty: 1, unit: 'компл.', price: 1200, included: true },
      { id: 'p8', name: 'Гарантия на работу 12 мес.', qty: 1, unit: 'шт.', price: 0, included: true },
    ]
  }
];

const calcTotal = (tier: CPQTier) =>
  tier.lines.filter(l => l.included).reduce((s, l) => s + l.price * l.qty, 0);

const formatMoney = (v: number) => new Intl.NumberFormat('ru-RU').format(Math.round(v)) + ' ₽';

const TIER_ICONS = { good: Check, better: Star, best: Crown };

const CPQModule = () => {
  const [tiers, setTiers] = useState<CPQTier[]>(INITIAL_TIERS);
  const [selected, setSelected] = useState<'good' | 'better' | 'best' | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ better: true });
  const [clientName] = useState('ООО "Торговый центр Мираж"');
  const [sent, setSent] = useState(false);

  const toggleLine = (tierId: string, lineId: string) => {
    setTiers(prev => prev.map(t => t.id === tierId
      ? { ...t, lines: t.lines.map(l => l.id === lineId ? { ...l, included: !l.included } : l) }
      : t
    ));
  };

  const handleSend = () => {
    setSent(true);
    toast.success(`КП отправлено клиенту: ${clientName}`);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText size={28} className="text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Коммерческое предложение</h2>
            <p className="text-gray-500 text-sm">Клиент: {clientName} · Оборудование: Daikin FTXB35C</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info('PDF генерируется...')}>
            <Download size={14} className="mr-2" /> Скачать PDF
          </Button>
          <Button onClick={handleSend} disabled={sent}>
            <Send size={14} className="mr-2" /> {sent ? 'Отправлено ✓' : 'Отправить клиенту'}
          </Button>
        </div>
      </div>

      {/* Summary comparison row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {tiers.map(tier => {
          const total = calcTotal(tier);
          const Icon = TIER_ICONS[tier.id];
          return (
            <div key={tier.id}
              onClick={() => setSelected(selected === tier.id ? null : tier.id)}
              className={`cursor-pointer border-2 rounded-xl p-5 transition-all ${selected === tier.id ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'} ${tier.recommended ? 'ring-2 ring-purple-200' : ''}`}>
              {tier.recommended && (
                <div className="text-center mb-2">
                  <span className="inline-block px-3 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">★ Рекомендуем</span>
                </div>
              )}
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tier.bgColor}`}>
                  <Icon size={18} className={tier.color} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{tier.name}</h3>
                  <p className="text-xs text-gray-500">{tier.tagline}</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatMoney(total)}</p>
              <p className="text-xs text-gray-400 mt-1">{tier.lines.filter(l => l.included).length} позиций</p>
              {selected === tier.id && (
                <div className="mt-3 flex items-center gap-1 text-xs text-blue-600 font-medium">
                  <Check size={12} /> Выбрано
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detailed editor per tier */}
      <div className="space-y-4">
        {tiers.map(tier => {
          const isOpen = expanded[tier.id];
          const total = calcTotal(tier);
          return (
            <div key={tier.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(prev => ({ ...prev, [tier.id]: !prev[tier.id] }))}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tier.bgColor}`}>
                    {(() => { const Icon = TIER_ICONS[tier.id]; return <Icon size={16} className={tier.color} />; })()}
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-gray-900">{tier.name}</span>
                    <span className="ml-2 text-sm text-gray-500">— {tier.tagline}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-gray-900">{formatMoney(total)}</span>
                  {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-gray-100">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-gray-500 font-medium w-8"></th>
                        <th className="px-4 py-2 text-left text-gray-500 font-medium">Наименование</th>
                        <th className="px-4 py-2 text-center text-gray-500 font-medium">Кол-во</th>
                        <th className="px-4 py-2 text-center text-gray-500 font-medium">Ед.</th>
                        <th className="px-4 py-2 text-right text-gray-500 font-medium">Цена</th>
                        <th className="px-4 py-2 text-right text-gray-500 font-medium">Сумма</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {tier.lines.map(line => (
                        <tr key={line.id} className={`hover:bg-gray-50 ${!line.included ? 'opacity-40' : ''}`}>
                          <td className="px-4 py-2.5 text-center">
                            <input type="checkbox" checked={line.included}
                              onChange={() => toggleLine(tier.id, line.id)}
                              className="rounded w-4 h-4" />
                          </td>
                          <td className="px-4 py-2.5 text-gray-900">{line.name}</td>
                          <td className="px-4 py-2.5 text-center text-gray-600">{line.qty}</td>
                          <td className="px-4 py-2.5 text-center text-gray-500">{line.unit}</td>
                          <td className="px-4 py-2.5 text-right text-gray-600">{line.price > 0 ? formatMoney(line.price) : 'Включено'}</td>
                          <td className="px-4 py-2.5 text-right font-medium text-gray-900">
                            {line.price > 0 ? formatMoney(line.price * line.qty) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-200">
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-sm font-medium text-gray-700">Итого</td>
                        <td colSpan={2} className="px-4 py-3 text-right text-lg font-bold text-gray-900">
                          {formatMoney(total)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  <div className="p-4 border-t border-gray-100 flex justify-between items-center">
                    <button className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800">
                      <Plus size={14} /> Добавить позицию
                    </button>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => toast.info(`КП "${tier.name}" скопировано`)}>
                        Копировать
                      </Button>
                      {!sent && (
                        <Button size="sm" onClick={() => {
                          setSelected(tier.id);
                          toast.success(`Вариант "${tier.name}" выбран`);
                        }}>
                          <Zap size={12} className="mr-1" /> Выбрать вариант
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
          <div>
            <p className="font-semibold text-blue-900">
              Выбран вариант: {tiers.find(t => t.id === selected)?.name}
            </p>
            <p className="text-sm text-blue-700">
              Итого: {formatMoney(calcTotal(tiers.find(t => t.id === selected)!))}
            </p>
          </div>
          <Button onClick={() => toast.success('Наряд создан на основе КП')}>
            Создать наряд
          </Button>
        </div>
      )}
    </div>
  );
};

export default CPQModule;
