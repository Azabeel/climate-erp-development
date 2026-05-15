import { useState } from 'react';
import { Package, AlertTriangle, TrendingDown, RefreshCw, ShoppingCart, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StockItem {
  id: string;
  article: string;
  name: string;
  category: string;
  current: number;
  min: number;
  unit: string;
  location: string;
  lastMovement: string;
  status: 'critical' | 'low' | 'ok';
  pendingOrder: boolean;
}

const ITEMS: StockItem[] = [
  { id: 'p1', article: 'R410A-13', name: 'Хладагент R-410A (13.6 кг)', category: 'Хладагенты', current: 1, min: 3, unit: 'бал.', location: 'Центральный склад', lastMovement: '2 дня', status: 'critical', pendingOrder: true },
  { id: 'p2', article: 'COMP-DAI-35', name: 'Компрессор Daikin JT160BCBY', category: 'Запчасти', current: 0, min: 1, unit: 'шт.', location: 'Центральный склад', lastMovement: '7 дней', status: 'critical', pendingOrder: false },
  { id: 'p3', article: 'FILTR-G4-500', name: 'Фильтр G4 500×500×20', category: 'Расходники', current: 8, min: 20, unit: 'шт.', location: 'Центральный склад', lastMovement: '1 день', status: 'low', pendingOrder: false },
  { id: 'p4', article: 'BELT-B48', name: 'Ремень приводной B48', category: 'Расходники', current: 3, min: 10, unit: 'шт.', location: 'Мобильный (Козлов)', lastMovement: '3 дня', status: 'low', pendingOrder: false },
  { id: 'p5', article: 'SENSOR-TEMP-10K', name: 'Датчик температуры 10k', category: 'Запчасти', current: 5, min: 15, unit: 'шт.', location: 'Центральный склад', lastMovement: '4 дня', status: 'low', pendingOrder: true },
  { id: 'p6', article: 'OIL-FV50S-1L', name: 'Масло компрессорное FV50S', category: 'Расходники', current: 12, min: 10, unit: 'фл.', location: 'Центральный склад', lastMovement: '1 день', status: 'ok', pendingOrder: false },
  { id: 'p7', article: 'CAP-RUN-30UF', name: 'Конденсатор пусковой 30 мкФ', category: 'Электрика', current: 4, min: 5, unit: 'шт.', location: 'Мобильный (Петров)', lastMovement: '6 часов', status: 'low', pendingOrder: false },
  { id: 'p8', article: 'R32-12', name: 'Хладагент R-32 (12 кг)', category: 'Хладагенты', current: 5, min: 4, unit: 'бал.', location: 'Центральный склад', lastMovement: '3 часа', status: 'ok', pendingOrder: false },
];

const CONSUMPTION_DATA = [
  { month: 'Янв', filters: 45, refrigerant: 8, parts: 23 },
  { month: 'Фев', filters: 38, refrigerant: 6, parts: 19 },
  { month: 'Мар', filters: 52, refrigerant: 11, parts: 28 },
  { month: 'Апр', filters: 61, refrigerant: 14, parts: 31 },
  { month: 'Май', filters: 58, refrigerant: 13, parts: 29 },
];

const StockAlerts = () => {
  const [items, setItems] = useState(ITEMS);
  const [filter, setFilter] = useState<'all' | 'critical' | 'low'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter);
  const criticalCount = items.filter(i => i.status === 'critical').length;
  const lowCount = items.filter(i => i.status === 'low').length;

  const handleOrder = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, pendingOrder: true } : i));
    toast.success('Заявка на закупку создана');
  };

  const handleBulkOrder = () => {
    setItems(prev => prev.map(i => selected.has(i.id) ? { ...i, pendingOrder: true } : i));
    toast.success(`Созданы заявки на закупку: ${selected.size} позиций`);
    setSelected(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package size={28} className="text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Алерты склада</h2>
            <p className="text-gray-500 text-sm">Контроль минимальных остатков и автозаказ</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.info('Остатки пересчитаны')}>
          <RefreshCw size={14} className="mr-2" /> Обновить
        </Button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <X size={18} className="text-red-600" />
            <span className="font-semibold text-red-900">Критично (≤0)</span>
          </div>
          <p className="text-3xl font-bold text-red-700">{criticalCount}</p>
          <p className="text-xs text-red-600 mt-1">позиций</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={18} className="text-yellow-600" />
            <span className="font-semibold text-yellow-900">Ниже нормы</span>
          </div>
          <p className="text-3xl font-bold text-yellow-700">{lowCount}</p>
          <p className="text-xs text-yellow-600 mt-1">позиций</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={18} className="text-green-600" />
            <span className="font-semibold text-green-900">В норме</span>
          </div>
          <p className="text-3xl font-bold text-green-700">{items.filter(i => i.status === 'ok').length}</p>
          <p className="text-xs text-green-600 mt-1">позиций</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Расход по категориям (5 мес.)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={CONSUMPTION_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="filters" fill="#3b82f6" name="Расходники" radius={[2, 2, 0, 0]} />
              <Bar dataKey="refrigerant" fill="#22c55e" name="Хладагенты" radius={[2, 2, 0, 0]} />
              <Bar dataKey="parts" fill="#f97316" name="Запчасти" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Ожидают заказа</h3>
          <div className="space-y-2">
            {items.filter(i => i.pendingOrder).map(i => (
              <div key={i.id} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                <ShoppingCart size={14} className="text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{i.name}</p>
                  <p className="text-xs text-gray-500">{i.article}</p>
                </div>
              </div>
            ))}
            {items.filter(i => i.pendingOrder).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Нет позиций</p>
            )}
          </div>
        </div>
      </div>

      {/* Filter + bulk actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {(['all', 'critical', 'low'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f === 'all' ? 'Все' : f === 'critical' ? '🔴 Критично' : '🟡 Ниже нормы'}
            </button>
          ))}
        </div>
        {selected.size > 0 && (
          <Button size="sm" onClick={handleBulkOrder}>
            <ShoppingCart size={14} className="mr-2" /> Заказать выбранные ({selected.size})
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 w-8">
                <input type="checkbox" onChange={e => setSelected(e.target.checked ? new Set(filtered.map(i => i.id)) : new Set())}
                  checked={selected.size === filtered.length && filtered.length > 0} className="rounded" />
              </th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Артикул / Наименование</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Категория</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium">Остаток</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium">Минимум</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Склад</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Посл. движение</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">Действие</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(item => (
              <tr key={item.id} className={`hover:bg-gray-50 ${item.status === 'critical' ? 'bg-red-50/30' : item.status === 'low' ? 'bg-yellow-50/20' : ''}`}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)} className="rounded" />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.article}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{item.category}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-bold text-lg ${item.status === 'critical' ? 'text-red-600' : item.status === 'low' ? 'text-yellow-600' : 'text-green-600'}`}>
                    {item.current}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">{item.unit}</span>
                </td>
                <td className="px-4 py-3 text-center text-gray-500">{item.min} {item.unit}</td>
                <td className="px-4 py-3 text-gray-600">{item.location}</td>
                <td className="px-4 py-3 text-gray-500">{item.lastMovement} назад</td>
                <td className="px-4 py-3 text-right">
                  {item.pendingOrder ? (
                    <span className="text-xs text-blue-600 flex items-center justify-end gap-1">
                      <ShoppingCart size={12} /> Заказан
                    </span>
                  ) : (
                    <Button size="sm" variant={item.status === 'critical' ? 'default' : 'outline'}
                      onClick={() => handleOrder(item.id)}>
                      <ShoppingCart size={12} className="mr-1" /> Заказать
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            <CheckCircle size={32} className="mx-auto mb-2 text-green-400" />
            <p>Все позиции в норме</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockAlerts;
