import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface LineItem {
  id: string;
  type: 'service' | 'material' | 'zip';
  name: string;
  qty: number;
  unit: string;
  unitPrice: number;
  discount: number;
  taxRate: number;
}

const SERVICE_CATALOG = [
  { name: 'Диагностика кондиционера', price: 1500, unit: 'шт' },
  { name: 'Чистка кондиционера', price: 3500, unit: 'шт' },
  { name: 'Заправка фреоном R-410A (1 кг)', price: 2800, unit: 'кг' },
  { name: 'Замена фильтра', price: 800, unit: 'шт' },
  { name: 'Монтаж сплит-системы', price: 8000, unit: 'шт' },
  { name: 'Демонтаж блока', price: 3000, unit: 'шт' },
  { name: 'Ремонт платы управления', price: 6500, unit: 'шт' },
  { name: 'Замена компрессора', price: 15000, unit: 'шт' },
  { name: 'Плановое ТО (1 блок)', price: 2500, unit: 'шт' },
];

const MATERIAL_CATALOG = [
  { name: 'Медная трубка 1/4" (1 м)', price: 320, unit: 'м' },
  { name: 'Теплоизоляция (1 м)', price: 180, unit: 'м' },
  { name: 'Межблочный кабель (1 м)', price: 150, unit: 'м' },
  { name: 'Хомут монтажный', price: 45, unit: 'шт' },
  { name: 'Жидкость для чистки', price: 650, unit: 'шт' },
];

function genId() { return `L${Date.now().toString(36)}`; }

const INITIAL_ITEMS: LineItem[] = [
  { id: 'L1', type: 'service', name: 'Диагностика кондиционера', qty: 1, unit: 'шт', unitPrice: 1500, discount: 0, taxRate: 20 },
  { id: 'L2', type: 'service', name: 'Чистка кондиционера', qty: 2, unit: 'шт', unitPrice: 3500, discount: 10, taxRate: 20 },
  { id: 'L3', type: 'material', name: 'Жидкость для чистки', qty: 2, unit: 'шт', unitPrice: 650, discount: 0, taxRate: 20 },
];

const TAX_RATES = [0, 10, 20];

const PriceCalculator = () => {
  const [items, setItems] = useState<LineItem[]>(INITIAL_ITEMS);
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [showCatalog, setShowCatalog] = useState(false);
  const [catalogType, setCatalogType] = useState<'service' | 'material'>('service');
  const [clientType, setClientType] = useState<'individual' | 'legal'>('legal');
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const addFromCatalog = (name: string, price: number, unit: string, type: 'service' | 'material') => {
    setItems(prev => [...prev, { id: genId(), type, name, qty: 1, unit, unitPrice: price, discount: 0, taxRate: 20 }]);
    setShowCatalog(false);
  };

  const addManual = () => {
    setItems(prev => [...prev, { id: genId(), type: 'service', name: '', qty: 1, unit: 'шт', unitPrice: 0, discount: 0, taxRate: 20 }]);
  };

  const totals = useMemo(() => {
    const lines = items.map(item => {
      const subtotal = item.qty * item.unitPrice;
      const discountAmt = subtotal * (item.discount / 100);
      const net = subtotal - discountAmt;
      const tax = net * (item.taxRate / 100);
      return { subtotal, discountAmt, net, tax, total: net + tax };
    });
    const subtotal = lines.reduce((s, l) => s + l.subtotal, 0);
    const discounts = lines.reduce((s, l) => s + l.discountAmt, 0);
    const globalDiscAmt = (subtotal - discounts) * (globalDiscount / 100);
    const net = subtotal - discounts - globalDiscAmt;
    const taxes = lines.reduce((s, l) => s + l.tax, 0);
    const total = net + taxes;
    return { subtotal, discounts, globalDiscAmt, net, taxes, total, lines };
  }, [items, globalDiscount]);

  const fmt = (n: number) => n.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const typeColors: Record<string, string> = {
    service: 'bg-blue-50 text-blue-700',
    material: 'bg-green-50 text-green-700',
    zip: 'bg-orange-50 text-orange-700',
  };

  const typeLabels: Record<string, string> = { service: 'Услуга', material: 'Материал', zip: 'ЗИП' };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Калькулятор стоимости</h2>
          <p className="text-sm text-gray-500 mt-0.5">Расчёт КП / Счёта / Сметы</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            {(['legal', 'individual'] as const).map(t => (
              <button
                key={t}
                onClick={() => setClientType(t)}
                className={`px-4 py-2 text-sm transition-colors ${clientType === t ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {t === 'legal' ? 'Юр. лицо' : 'Физ. лицо'}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm">
            <Icon name="Download" size={14} className="mr-1.5" />
            Экспорт PDF
          </Button>
          <Button size="sm" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}>
            <Icon name={saved ? 'Check' : 'Save'} size={14} className="mr-1.5" />
            {saved ? 'Сохранено' : 'Сохранить'}
          </Button>
        </div>
      </div>

      {/* Таблица позиций */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left p-3 text-xs font-medium text-gray-500 w-8">#</th>
                <th className="text-left p-3 text-xs font-medium text-gray-500">Наименование</th>
                <th className="text-left p-3 text-xs font-medium text-gray-500 w-20">Тип</th>
                <th className="text-right p-3 text-xs font-medium text-gray-500 w-16">Кол-во</th>
                <th className="text-left p-3 text-xs font-medium text-gray-500 w-16">Ед.</th>
                <th className="text-right p-3 text-xs font-medium text-gray-500 w-28">Цена, ₽</th>
                <th className="text-right p-3 text-xs font-medium text-gray-500 w-20">Скидка %</th>
                <th className="text-right p-3 text-xs font-medium text-gray-500 w-20">НДС %</th>
                <th className="text-right p-3 text-xs font-medium text-gray-500 w-28">Сумма, ₽</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item, idx) => {
                const line = totals.lines[idx];
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-gray-400 text-xs">{idx + 1}</td>
                    <td className="p-3">
                      <input
                        value={item.name}
                        onChange={e => updateItem(item.id, 'name', e.target.value)}
                        className="w-full text-sm text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none py-0.5"
                        placeholder="Введите наименование..."
                      />
                    </td>
                    <td className="p-3">
                      <select
                        value={item.type}
                        onChange={e => updateItem(item.id, 'type', e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full border-0 font-medium ${typeColors[item.type]} bg-transparent`}
                      >
                        <option value="service">Услуга</option>
                        <option value="material">Материал</option>
                        <option value="zip">ЗИП</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={item.qty}
                        min={0.1}
                        step={0.1}
                        onChange={e => updateItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
                        className="w-full text-right text-sm bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        value={item.unit}
                        onChange={e => updateItem(item.id, 'unit', e.target.value)}
                        className="w-full text-sm text-gray-600 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={item.unitPrice}
                        min={0}
                        onChange={e => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full text-right text-sm bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={item.discount}
                        min={0}
                        max={100}
                        onChange={e => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                        className="w-full text-right text-sm bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-3">
                      <select
                        value={item.taxRate}
                        onChange={e => updateItem(item.id, 'taxRate', parseInt(e.target.value))}
                        className="w-full text-right text-sm bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                      >
                        {TAX_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                      </select>
                    </td>
                    <td className="p-3 text-right font-medium text-gray-900">{fmt(line.total)}</td>
                    <td className="p-3">
                      <button onClick={() => removeItem(item.id)} className="p-1 hover:bg-red-50 rounded text-gray-300 hover:text-red-500">
                        <Icon name="X" size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Добавить позицию */}
        <div className="p-3 border-t border-gray-100 flex gap-2">
          <button
            onClick={() => { setCatalogType('service'); setShowCatalog(true); }}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Icon name="Plus" size={14} />
            Услуга из каталога
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => { setCatalogType('material'); setShowCatalog(true); }}
            className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
          >
            <Icon name="Plus" size={14} />
            Материал
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={addManual}
            className="text-sm text-gray-600 hover:text-gray-700 flex items-center gap-1"
          >
            <Icon name="Edit" size={14} />
            Произвольная позиция
          </button>
        </div>
      </div>

      {/* Итого */}
      <div className="grid grid-cols-2 gap-6">
        {/* Примечание */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <label className="text-sm font-medium text-gray-700 block mb-2">Примечание к счёту</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Условия оплаты, сроки выполнения, особые условия..."
            className="w-full text-sm border border-gray-200 rounded-lg p-3 resize-none h-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="mt-3 flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-500">Общая скидка %</label>
              <input
                type="number"
                value={globalDiscount}
                min={0}
                max={100}
                onChange={e => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Итоговые суммы */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Итоговый расчёт</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Сумма без скидок:</span>
              <span className="font-medium">{fmt(totals.subtotal)} ₽</span>
            </div>
            {totals.discounts > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Скидки по позициям:</span>
                <span>−{fmt(totals.discounts)} ₽</span>
              </div>
            )}
            {totals.globalDiscAmt > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Общая скидка ({globalDiscount}%):</span>
                <span>−{fmt(totals.globalDiscAmt)} ₽</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Итого без НДС:</span>
              <span className="font-medium">{fmt(totals.net)} ₽</span>
            </div>
            {clientType === 'legal' && (
              <div className="flex justify-between text-gray-500">
                <span>НДС:</span>
                <span>{fmt(totals.taxes)} ₽</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-2 flex justify-between">
              <span className="font-bold text-gray-900 text-base">ИТОГО:</span>
              <span className="font-bold text-gray-900 text-xl">
                {fmt(clientType === 'legal' ? totals.total : totals.net)} ₽
              </span>
            </div>
            {clientType === 'individual' && (
              <p className="text-xs text-gray-400">Физ. лицо — цены без НДС</p>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="w-full">
              <Icon name="FileText" size={14} className="mr-1.5" />
              В счёт
            </Button>
            <Button size="sm" className="w-full">
              <Icon name="Send" size={14} className="mr-1.5" />
              В КП
            </Button>
          </div>
        </div>
      </div>

      {/* Каталог */}
      {showCatalog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-96 max-h-[70vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                {catalogType === 'service' ? 'Каталог услуг' : 'Каталог материалов'}
              </h3>
              <button onClick={() => setShowCatalog(false)} className="p-1 hover:bg-gray-100 rounded">
                <Icon name="X" size={16} className="text-gray-400" />
              </button>
            </div>
            <div className="overflow-auto">
              {(catalogType === 'service' ? SERVICE_CATALOG : MATERIAL_CATALOG).map(item => (
                <button
                  key={item.name}
                  onClick={() => addFromCatalog(item.name, item.price, item.unit, catalogType)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 text-left transition-colors border-b border-gray-50"
                >
                  <span className="text-sm text-gray-900">{item.name}</span>
                  <span className="text-sm font-medium text-gray-700">{item.price.toLocaleString('ru-RU')} ₽/{item.unit}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceCalculator;
