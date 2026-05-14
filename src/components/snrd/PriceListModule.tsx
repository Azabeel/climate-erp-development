import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type PriceCategory =
  | 'Диагностика'
  | 'Хладагент'
  | 'Обслуживание'
  | 'Монтаж'
  | 'Ремонт'
  | 'Выезд'
  | 'ТО';

interface PriceItem {
  id: string;
  name: string;
  category: PriceCategory;
  unit: string;
  basePrice: number;
  priceLE: number; // Юридическое лицо
  priceInd: number; // Физическое лицо
  vat: number; // НДС %
}

interface ContractPrice {
  id: string;
  client: string;
  service: string;
  contractPrice: number;
  discount: number; // %
  periodFrom: string;
  periodTo: string;
  status: 'Активна' | 'Истекла' | 'Приостановлена';
}

// ─────────────────────────────────────────────
// Static demo data
// ─────────────────────────────────────────────

const initialPriceList: PriceItem[] = [
  {
    id: '1',
    name: 'Диагностика кондиционера',
    category: 'Диагностика',
    unit: 'услуга',
    basePrice: 1500,
    priceLE: 1800,
    priceInd: 1500,
    vat: 20,
  },
  {
    id: '2',
    name: 'Заправка хладагентом R-410A (1 кг)',
    category: 'Хладагент',
    unit: 'кг',
    basePrice: 2500,
    priceLE: 2200,
    priceInd: 2800,
    vat: 20,
  },
  {
    id: '3',
    name: 'Замена фильтра',
    category: 'Обслуживание',
    unit: 'шт',
    basePrice: 800,
    priceLE: 700,
    priceInd: 900,
    vat: 20,
  },
  {
    id: '4',
    name: 'Чистка внутреннего блока',
    category: 'Обслуживание',
    unit: 'услуга',
    basePrice: 2000,
    priceLE: 1800,
    priceInd: 2200,
    vat: 20,
  },
  {
    id: '5',
    name: 'Монтаж кондиционера (до 9000 BTU)',
    category: 'Монтаж',
    unit: 'услуга',
    basePrice: 8000,
    priceLE: 7000,
    priceInd: 9000,
    vat: 20,
  },
  {
    id: '6',
    name: 'Ремонт компрессора',
    category: 'Ремонт',
    unit: 'услуга',
    basePrice: 15000,
    priceLE: 14000,
    priceInd: 16000,
    vat: 20,
  },
  {
    id: '7',
    name: 'Вызов инженера (аварийный)',
    category: 'Выезд',
    unit: 'выезд',
    basePrice: 3000,
    priceLE: 2500,
    priceInd: 3500,
    vat: 20,
  },
  {
    id: '8',
    name: 'Плановое ТО (квартальное)',
    category: 'ТО',
    unit: 'услуга',
    basePrice: 5000,
    priceLE: 4500,
    priceInd: 5500,
    vat: 20,
  },
];

const initialContractPrices: ContractPrice[] = [
  {
    id: 'c1',
    client: 'ООО "Торговый Дом Глобус"',
    service: 'Плановое ТО (квартальное)',
    contractPrice: 4000,
    discount: 20,
    periodFrom: '01.01.2026',
    periodTo: '31.12.2026',
    status: 'Активна',
  },
  {
    id: 'c2',
    client: 'ТЦ "Мега"',
    service: 'Диагностика кондиционера',
    contractPrice: 1200,
    discount: 20,
    periodFrom: '01.01.2026',
    periodTo: '31.12.2026',
    status: 'Активна',
  },
  {
    id: 'c3',
    client: 'Отель "Премьер"',
    service: 'Заправка хладагентом R-410A (1 кг)',
    contractPrice: 2000,
    discount: 20,
    periodFrom: '01.03.2026',
    periodTo: '28.02.2027',
    status: 'Активна',
  },
  {
    id: 'c4',
    client: 'БЦ "Сити Плаза"',
    service: 'Монтаж кондиционера (до 9000 BTU)',
    contractPrice: 6500,
    discount: 19,
    periodFrom: '01.06.2026',
    periodTo: '31.05.2027',
    status: 'Активна',
  },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const ALL_CATEGORIES: PriceCategory[] = [
  'Диагностика',
  'Хладагент',
  'Обслуживание',
  'Монтаж',
  'Ремонт',
  'Выезд',
  'ТО',
];

const categoryColor: Record<PriceCategory, string> = {
  Диагностика: 'bg-amber-100 text-amber-700',
  Хладагент: 'bg-cyan-100 text-cyan-700',
  Обслуживание: 'bg-blue-100 text-blue-700',
  Монтаж: 'bg-purple-100 text-purple-700',
  Ремонт: 'bg-red-100 text-red-700',
  Выезд: 'bg-orange-100 text-orange-700',
  ТО: 'bg-green-100 text-green-700',
};

const contractStatusColor: Record<ContractPrice['status'], string> = {
  Активна: 'bg-green-100 text-green-700',
  Истекла: 'bg-gray-100 text-gray-600',
  Приостановлена: 'bg-yellow-100 text-yellow-700',
};

const fmt = (n: number) => n.toLocaleString('ru-RU');

// ─────────────────────────────────────────────
// Empty form state
// ─────────────────────────────────────────────

const emptyForm = {
  name: '',
  category: 'Обслуживание' as PriceCategory,
  unit: '',
  basePrice: '',
  priceLE: '',
  priceInd: '',
  vat: '20',
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

const PriceListModule = () => {
  const [priceList, setPriceList] = useState<PriceItem[]>(initialPriceList);
  const [contractPrices] = useState<ContractPrice[]>(initialContractPrices);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Add dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  // ── derived ──────────────────────────────────
  const filtered = priceList.filter((item) => {
    const matchSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchCat =
      categoryFilter === 'all' || item.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const uniqueCategories = Array.from(
    new Set(priceList.map((i) => i.category))
  );

  // ── handlers ─────────────────────────────────
  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: PriceItem) => {
    setEditId(item.id);
    setForm({
      name: item.name,
      category: item.category,
      unit: item.unit,
      basePrice: String(item.basePrice),
      priceLE: String(item.priceLE),
      priceInd: String(item.priceInd),
      vat: String(item.vat),
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setPriceList((prev) => prev.filter((i) => i.id !== id));
    toast.success('Позиция удалена из прайс-листа');
  };

  const handleSave = () => {
    const base = parseInt(form.basePrice, 10);
    const le = parseInt(form.priceLE, 10);
    const ind = parseInt(form.priceInd, 10);
    const vat = parseInt(form.vat, 10);

    if (!form.name.trim() || !form.unit.trim() || isNaN(base) || isNaN(le) || isNaN(ind)) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    if (editId) {
      setPriceList((prev) =>
        prev.map((item) =>
          item.id === editId
            ? {
                ...item,
                name: form.name,
                category: form.category,
                unit: form.unit,
                basePrice: base,
                priceLE: le,
                priceInd: ind,
                vat: isNaN(vat) ? 20 : vat,
              }
            : item
        )
      );
      toast.success('Позиция обновлена');
    } else {
      const newItem: PriceItem = {
        id: String(Date.now()),
        name: form.name,
        category: form.category,
        unit: form.unit,
        basePrice: base,
        priceLE: le,
        priceInd: ind,
        vat: isNaN(vat) ? 20 : vat,
      };
      setPriceList((prev) => [...prev, newItem]);
      toast.success('Позиция добавлена в прайс-лист');
    }

    setDialogOpen(false);
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Прайс-лист</h2>
          <p className="text-gray-500 mt-1">
            Управление ценами на услуги сервисного центра
          </p>
        </div>
      </div>

      <Tabs defaultValue="pricelist">
        <TabsList className="mb-2">
          <TabsTrigger value="pricelist">
            <Icon name="List" size={15} className="mr-1.5" />
            Прайс-лист
          </TabsTrigger>
          <TabsTrigger value="contract">
            <Icon name="FileText" size={15} className="mr-1.5" />
            Договорные цены
          </TabsTrigger>
        </TabsList>

        {/* ══════════════════════════════════════
            TAB 1 — Main price list
        ══════════════════════════════════════ */}
        <TabsContent value="pricelist" className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="pt-5 pb-5">
                <p className="text-xs text-gray-500 mb-1">Всего позиций</p>
                <p className="text-2xl font-bold text-gray-900">
                  {priceList.length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-5">
                <p className="text-xs text-gray-500 mb-1">Категорий</p>
                <p className="text-2xl font-bold text-gray-900">
                  {uniqueCategories.length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-5">
                <p className="text-xs text-gray-500 mb-1">Мин. цена</p>
                <p className="text-2xl font-bold text-gray-900">
                  {fmt(Math.min(...priceList.map((i) => i.basePrice)))} ₽
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-5">
                <p className="text-xs text-gray-500 mb-1">Макс. цена</p>
                <p className="text-2xl font-bold text-gray-900">
                  {fmt(Math.max(...priceList.map((i) => i.basePrice)))} ₽
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters row */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[220px]">
                  <Icon
                    name="Search"
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    placeholder="Поиск по наименованию..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select
                  value={categoryFilter}
                  onValueChange={(v) => setCategoryFilter(v)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Все категории" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все категории</SelectItem>
                    {ALL_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white ml-auto"
                  onClick={openAdd}
                >
                  <Icon name="Plus" size={15} className="mr-1.5" />
                  Добавить позицию
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Price table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Наименование</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Ед. изм.</TableHead>
                    <TableHead className="text-right">Базовая цена (₽)</TableHead>
                    <TableHead className="text-right">Для ЮЛ (₽)</TableHead>
                    <TableHead className="text-right">Для ФЛ (₽)</TableHead>
                    <TableHead className="text-center">НДС (%)</TableHead>
                    <TableHead className="text-center">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-10 text-gray-400"
                      >
                        Позиции не найдены
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((item) => (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell className="pl-4 font-medium max-w-[260px]">
                          {item.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${categoryColor[item.category]} border-0 text-xs`}
                          >
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm">
                          {item.unit}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {fmt(item.basePrice)}
                        </TableCell>
                        <TableCell className="text-right text-blue-700">
                          {fmt(item.priceLE)}
                        </TableCell>
                        <TableCell className="text-right text-green-700">
                          {fmt(item.priceInd)}
                        </TableCell>
                        <TableCell className="text-center text-gray-600 text-sm">
                          {item.vat}%
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-gray-500 hover:text-blue-600"
                              onClick={() => openEdit(item)}
                            >
                              <Icon name="Pencil" size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Icon name="Trash2" size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══════════════════════════════════════
            TAB 2 — Contract prices
        ══════════════════════════════════════ */}
        <TabsContent value="contract" className="space-y-4">
          {/* Info card */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <Icon
                  name="Info"
                  size={18}
                  className="text-blue-600 mt-0.5 shrink-0"
                />
                <p className="text-sm text-blue-800">
                  Договорные цены позволяют установить индивидуальные тарифы
                  для конкретных клиентов. Договорная цена имеет приоритет над
                  стандартным прайс-листом в рамках указанного периода
                  действия.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() =>
                toast.info('Функция добавления договорной цены в разработке')
              }
            >
              <Icon name="Plus" size={15} className="mr-1.5" />
              Добавить договорную цену
            </Button>
          </div>

          {/* Contract prices table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Индивидуальные тарифы по договорам
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Клиент</TableHead>
                    <TableHead>Услуга</TableHead>
                    <TableHead className="text-right">
                      Договорная цена (₽)
                    </TableHead>
                    <TableHead className="text-center">Скидка (%)</TableHead>
                    <TableHead>Период действия</TableHead>
                    <TableHead className="text-center">Статус</TableHead>
                    <TableHead className="text-center">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contractPrices.map((cp) => (
                    <TableRow key={cp.id} className="hover:bg-gray-50">
                      <TableCell className="pl-4 font-medium">
                        {cp.client}
                      </TableCell>
                      <TableCell className="text-gray-700 text-sm max-w-[200px]">
                        {cp.service}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-blue-700">
                        {fmt(cp.contractPrice)}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-red-600 font-medium text-sm">
                          -{cp.discount}%
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 whitespace-nowrap">
                        {cp.periodFrom} — {cp.periodTo}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={`${contractStatusColor[cp.status]} border-0 text-xs`}
                        >
                          {cp.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-gray-500 hover:text-blue-600"
                            onClick={() =>
                              toast.info('Редактирование договорной цены в разработке')
                            }
                          >
                            <Icon name="Pencil" size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
                            onClick={() =>
                              toast.info('Удаление договорной цены в разработке')
                            }
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ════════════════════════════════════════
          Add / Edit dialog
      ════════════════════════════════════════ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editId ? 'Редактировать позицию' : 'Добавить позицию'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="pl-name">Наименование *</Label>
              <Input
                id="pl-name"
                placeholder="Введите наименование услуги..."
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>

            {/* Category + Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Категория *</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, category: v as PriceCategory }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pl-unit">Ед. изм. *</Label>
                <Input
                  id="pl-unit"
                  placeholder="услуга, кг, шт..."
                  value={form.unit}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, unit: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pl-base">Базовая цена (₽) *</Label>
                <Input
                  id="pl-base"
                  type="number"
                  placeholder="1500"
                  value={form.basePrice}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, basePrice: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pl-le">Цена ЮЛ (₽) *</Label>
                <Input
                  id="pl-le"
                  type="number"
                  placeholder="1800"
                  value={form.priceLE}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, priceLE: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pl-ind">Цена ФЛ (₽) *</Label>
                <Input
                  id="pl-ind"
                  type="number"
                  placeholder="1500"
                  value={form.priceInd}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, priceInd: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* VAT */}
            <div className="space-y-1.5">
              <Label htmlFor="pl-vat">НДС (%)</Label>
              <Input
                id="pl-vat"
                type="number"
                placeholder="20"
                value={form.vat}
                onChange={(e) =>
                  setForm((p) => ({ ...p, vat: e.target.value }))
                }
                className="w-32"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Отмена
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSave}
                disabled={
                  !form.name.trim() ||
                  !form.unit.trim() ||
                  !form.basePrice ||
                  !form.priceLE ||
                  !form.priceInd
                }
              >
                {editId ? 'Сохранить' : 'Добавить'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PriceListModule;
