import { useState } from 'react';
import { ShoppingCart, Plus, Package, Truck, CheckCircle, Clock, AlertTriangle, Upload, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type POStatus = 'new' | 'ordered' | 'in_transit' | 'received' | 'transferred';

interface POItem {
  id: string;
  article: string;
  name: string;
  qty: number;
  unit: string;
  purchasePrice: number;
  markupPct: number;
  salePrice: number;
  supplier: string;
  workOrderId: string;
  client: string;
  status: POStatus;
  trackingNum?: string;
  eta?: string;
  invoiceUploaded: boolean;
}

const ITEMS: POItem[] = [
  { id: 'p1', article: 'COMP-DAI-35', name: 'Компрессор Daikin JT160BCBY1E', qty: 1, unit: 'шт.', purchasePrice: 28500, markupPct: 30, salePrice: 37050, supplier: 'КлиматТехно', workOrderId: 'WO-2026-000038', client: 'ТК Северный', status: 'in_transit', trackingNum: 'CDEK-89124567', eta: '17 мая', invoiceUploaded: true },
  { id: 'p2', article: 'CAP-RUN-45UF', name: 'Конденсатор пусковой 45 мкФ', qty: 2, unit: 'шт.', purchasePrice: 580, markupPct: 50, salePrice: 870, supplier: 'ЭлектроСнаб', workOrderId: 'WO-2026-000047', client: 'ТЦ Мираж', status: 'received', trackingNum: undefined, eta: undefined, invoiceUploaded: true },
  { id: 'p3', article: 'BOARD-MIT-35', name: 'Плата управления Mitsubishi MSZ-LN35', qty: 1, unit: 'шт.', purchasePrice: 12800, markupPct: 30, salePrice: 16640, supplier: 'МитсубишиСервис', workOrderId: 'WO-2026-000051', client: 'Сбербанк-офис', status: 'ordered', trackingNum: 'SPSR-44219', eta: '20 мая', invoiceUploaded: false },
  { id: 'p4', article: 'FAN-MTR-15W', name: 'Мотор вентилятора 15W', qty: 3, unit: 'шт.', purchasePrice: 1450, markupPct: 40, salePrice: 2030, supplier: 'КлиматТехно', workOrderId: 'WO-2026-000044', client: 'ИП Сидоров', status: 'new', trackingNum: undefined, eta: undefined, invoiceUploaded: false },
  { id: 'p5', article: 'VALVE-4WAY-05', name: '4-ходовой клапан Daikin', qty: 1, unit: 'шт.', purchasePrice: 4200, markupPct: 35, salePrice: 5670, supplier: 'ДайкинОфициал', workOrderId: 'WO-2026-000050', client: 'БЦ Олимп', status: 'transferred', trackingNum: undefined, eta: undefined, invoiceUploaded: true },
];

const STATUS_CFG: Record<POStatus, { label: string; cls: string; icon: React.ElementType; next?: string }> = {
  new: { label: 'Новая', cls: 'bg-gray-100 text-gray-700', icon: ShoppingCart, next: 'Заказать' },
  ordered: { label: 'Заказано', cls: 'bg-blue-100 text-blue-700', icon: Clock, next: 'Отгружено' },
  in_transit: { label: 'В пути', cls: 'bg-yellow-100 text-yellow-700', icon: Truck, next: 'Получено' },
  received: { label: 'Получено', cls: 'bg-green-100 text-green-700', icon: Package, next: 'Передано' },
  transferred: { label: 'Передано', cls: 'bg-purple-100 text-purple-700', icon: CheckCircle },
};

const SUPPLIERS = ['КлиматТехно', 'ЭлектроСнаб', 'МитсубишиСервис', 'ДайкинОфициал'];

const PurchaseOrders = () => {
  const [items, setItems] = useState(ITEMS);
  const [filter, setFilter] = useState<'all' | POStatus>('all');
  const [showNew, setShowNew] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', article: '', qty: 1, purchasePrice: '', markupPct: 30, supplier: SUPPLIERS[0], workOrderId: '', client: '' });

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter);

  const counts = Object.fromEntries(
    (['new', 'ordered', 'in_transit', 'received', 'transferred'] as POStatus[]).map(s => [s, items.filter(i => i.status === s).length])
  ) as Record<POStatus, number>;

  const advance = (id: string) => {
    const order: POStatus[] = ['new', 'ordered', 'in_transit', 'received', 'transferred'];
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      const idx = order.indexOf(i.status);
      if (idx >= order.length - 1) return i;
      const next = order[idx + 1];
      toast.success(`ЗИП "${i.name.slice(0, 20)}..." → ${STATUS_CFG[next].label}`);
      return { ...i, status: next };
    }));
  };

  const handleAdd = () => {
    if (!newItem.name || !newItem.purchasePrice) { toast.error('Заполните обязательные поля'); return; }
    const pp = parseFloat(newItem.purchasePrice);
    const sp = pp * (1 + newItem.markupPct / 100);
    const item: POItem = {
      id: `p${Date.now()}`,
      article: newItem.article || 'НОВЫЙ',
      name: newItem.name,
      qty: newItem.qty,
      unit: 'шт.',
      purchasePrice: pp,
      markupPct: newItem.markupPct,
      salePrice: sp,
      supplier: newItem.supplier,
      workOrderId: newItem.workOrderId || 'WO-?',
      client: newItem.client || '—',
      status: 'new',
      invoiceUploaded: false,
    };
    setItems(prev => [item, ...prev]);
    setShowNew(false);
    setNewItem({ name: '', article: '', qty: 1, purchasePrice: '', markupPct: 30, supplier: SUPPLIERS[0], workOrderId: '', client: '' });
    toast.success('Заявка на ЗИП создана');
  };

  const totalOrderValue = items.filter(i => i.status !== 'transferred').reduce((s, i) => s + i.purchasePrice * i.qty, 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ShoppingCart size={28} className="text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Закупки и ЗИП</h2>
            <p className="text-gray-500 text-sm">Управление заказами запасных частей</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowNew(prev => !prev)}>
          <Plus size={14} className="mr-2" /> Новая заявка
        </Button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {(['new', 'ordered', 'in_transit', 'received', 'transferred'] as POStatus[]).map(s => {
          const cfg = STATUS_CFG[s];
          const Icon = cfg.icon;
          return (
            <button key={s} onClick={() => setFilter(filter === s ? 'all' : s)}
              className={`border rounded-xl p-3 text-left transition-all ${filter === s ? 'ring-2 ring-blue-400' : ''} ${cfg.cls.includes('gray') ? 'bg-gray-50 border-gray-200' : cfg.cls.includes('blue') ? 'bg-blue-50 border-blue-200' : cfg.cls.includes('yellow') ? 'bg-yellow-50 border-yellow-200' : cfg.cls.includes('green') ? 'bg-green-50 border-green-200' : 'bg-purple-50 border-purple-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} className={cfg.cls.split(' ')[1]} />
                <span className={`text-xs font-medium ${cfg.cls.split(' ')[1]}`}>{cfg.label}</span>
              </div>
              <p className={`text-2xl font-bold ${cfg.cls.split(' ')[1]}`}>{counts[s]}</p>
            </button>
          );
        })}
      </div>

      {/* New item form */}
      {showNew && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Новая заявка на ЗИП</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Наименование *</label>
              <input value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Название детали" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Артикул</label>
              <input value={newItem.article} onChange={e => setNewItem(p => ({ ...p, article: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="SKU-001" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Поставщик</label>
              <select value={newItem.supplier} onChange={e => setNewItem(p => ({ ...p, supplier: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                {SUPPLIERS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Цена закупки, ₽ *</label>
              <input type="number" value={newItem.purchasePrice} onChange={e => setNewItem(p => ({ ...p, purchasePrice: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Наценка %</label>
              <input type="number" value={newItem.markupPct} onChange={e => setNewItem(p => ({ ...p, markupPct: +e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              {newItem.purchasePrice && (
                <p className="text-xs text-gray-500 mt-1">
                  Цена продажи: {(parseFloat(newItem.purchasePrice) * (1 + newItem.markupPct / 100)).toLocaleString('ru-RU')} ₽
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Наряд</label>
              <input value={newItem.workOrderId} onChange={e => setNewItem(p => ({ ...p, workOrderId: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="WO-2026-000..." />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd}>Создать заявку</Button>
            <Button size="sm" variant="outline" onClick={() => setShowNew(false)}>Отмена</Button>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Показано: <strong>{filtered.length}</strong> позиций · В работе: <strong>{(totalOrderValue / 1000).toFixed(1)}k ₽</strong>
        </p>
        <button onClick={() => setFilter('all')} className={`text-sm text-blue-600 ${filter === 'all' ? 'invisible' : ''}`}>
          Сбросить фильтр
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Артикул / Наименование</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Наряд / Клиент</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Поставщик</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">Закупка</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">Продажа</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium">Статус</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium">Трекинг</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">Действие</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(item => {
              const cfg = STATUS_CFG[item.status];
              const Icon = cfg.icon;
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.article} · {item.qty} {item.unit}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-blue-600 text-sm">{item.workOrderId}</p>
                    <p className="text-xs text-gray-500">{item.client}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{item.supplier}</td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {(item.purchasePrice * item.qty).toLocaleString('ru-RU')} ₽
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="font-medium text-gray-900">{(item.salePrice * item.qty).toLocaleString('ru-RU')} ₽</p>
                    <p className="text-xs text-green-600">+{item.markupPct}%</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
                      <Icon size={10} /> {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.trackingNum ? (
                      <button onClick={() => toast.info(`Трекинг: ${item.trackingNum}`)}
                        className="text-xs text-blue-600 flex items-center gap-1 mx-auto hover:underline">
                        <ExternalLink size={11} /> {item.trackingNum.slice(0, 10)}
                      </button>
                    ) : (
                      item.status !== 'transferred' && !item.invoiceUploaded ? (
                        <button onClick={() => toast.info('Загрузка счёта')}
                          className="text-xs text-gray-400 flex items-center gap-1 mx-auto hover:text-blue-600">
                          <Upload size={11} /> Счёт
                        </button>
                      ) : item.invoiceUploaded ? (
                        <span className="text-xs text-green-600 flex items-center gap-1 justify-center">
                          <CheckCircle size={11} /> Оплачен
                        </span>
                      ) : null
                    )}
                    {item.eta && <p className="text-xs text-gray-400 mt-0.5">ETA: {item.eta}</p>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {cfg.next && (
                      <Button size="sm" variant="outline" onClick={() => advance(item.id)}
                        className="text-xs">
                        {cfg.next}
                      </Button>
                    )}
                    {item.status === 'new' && (
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" onClick={() => advance(item.id)} className="text-xs">Заказать</Button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-400">
            <AlertTriangle size={28} className="mx-auto mb-2" />
            <p>Нет позиций</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseOrders;
