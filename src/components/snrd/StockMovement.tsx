import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

type MovementType =
  | "Приход"
  | "Расход"
  | "Перемещение"
  | "Списание"
  | "Возврат";

type WarehouseType =
  | "Центральный"
  | "Мобильный склад А"
  | "Мобильный склад Б";

interface StockMovementRecord {
  id: string;
  datetime: string;
  type: MovementType;
  article: string;
  name: string;
  qty: number;
  unit: string;
  price: number;
  total: number;
  warehouseFrom: string;
  warehouseTo: string;
  document: string;
  employee: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MOVEMENT_TYPES: MovementType[] = [
  "Приход",
  "Расход",
  "Перемещение",
  "Списание",
  "Возврат",
];

const WAREHOUSES: WarehouseType[] = [
  "Центральный",
  "Мобильный склад А",
  "Мобильный склад Б",
];

const PERIODS = [
  { label: "7д", value: 7 },
  { label: "30д", value: 30 },
  { label: "90д", value: 90 },
];

// Цвет и иконка по типу движения
const MOVEMENT_META: Record<
  MovementType,
  { color: string; rowBg: string; icon: string }
> = {
  Приход: {
    color: "text-emerald-600",
    rowBg: "bg-emerald-50",
    icon: "ArrowDown",
  },
  Расход: {
    color: "text-red-500",
    rowBg: "bg-red-50",
    icon: "ArrowUp",
  },
  Перемещение: {
    color: "text-blue-500",
    rowBg: "bg-blue-50",
    icon: "ArrowLeftRight",
  },
  Списание: {
    color: "text-orange-500",
    rowBg: "bg-orange-50",
    icon: "Trash2",
  },
  Возврат: {
    color: "text-purple-500",
    rowBg: "bg-purple-50",
    icon: "RotateCcw",
  },
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const generateMovements = (): StockMovementRecord[] => [
  {
    id: "M-0001",
    datetime: "15.05.2026 09:12",
    type: "Приход",
    article: "R410A-13.6",
    name: "Хладагент R-410A баллон 13.6 кг",
    qty: 5,
    unit: "шт",
    price: 4800,
    total: 24000,
    warehouseFrom: "—",
    warehouseTo: "Центральный",
    document: "Накладная №ПН-2026-0215",
    employee: "Петров А.В.",
  },
  {
    id: "M-0002",
    datetime: "15.05.2026 10:34",
    type: "Расход",
    article: "FILTR-001",
    name: "Фильтр-осушитель Castel 4305/1",
    qty: 3,
    unit: "шт",
    price: 650,
    total: 1950,
    warehouseFrom: "Центральный",
    warehouseTo: "—",
    document: "Наряд WO-2026-004521",
    employee: "Сидоров К.Н.",
  },
  {
    id: "M-0003",
    datetime: "15.05.2026 11:05",
    type: "Перемещение",
    article: "CABLE-14",
    name: "Кабель ПВС 3×2.5 мм², 100 м бухта",
    qty: 2,
    unit: "бухта",
    price: 3200,
    total: 6400,
    warehouseFrom: "Центральный",
    warehouseTo: "Мобильный склад А",
    document: "Перемещение №ПМ-2026-0088",
    employee: "Козлов Д.И.",
  },
  {
    id: "M-0004",
    datetime: "14.05.2026 14:22",
    type: "Списание",
    article: "TAPE-DUCT",
    name: "Лента армированная серая 48мм×50м",
    qty: 10,
    unit: "шт",
    price: 180,
    total: 1800,
    warehouseFrom: "Мобильный склад Б",
    warehouseTo: "—",
    document: "Акт списания №АС-2026-0041",
    employee: "Орлов Г.С.",
  },
  {
    id: "M-0005",
    datetime: "14.05.2026 16:48",
    type: "Возврат",
    article: "VALVE-PRV",
    name: "Клапан предохранительный 3/8\" Sanhua",
    qty: 1,
    unit: "шт",
    price: 1250,
    total: 1250,
    warehouseFrom: "Мобильный склад А",
    warehouseTo: "Центральный",
    document: "Возврат №ВЗ-2026-0019",
    employee: "Морозов П.Е.",
  },
  {
    id: "M-0006",
    datetime: "14.05.2026 17:30",
    type: "Приход",
    article: "COMP-DAIKIN-4T",
    name: "Компрессор Daikin 4 тонны JT90BCBY1L",
    qty: 2,
    unit: "шт",
    price: 87500,
    total: 175000,
    warehouseFrom: "—",
    warehouseTo: "Центральный",
    document: "Накладная №ПН-2026-0214",
    employee: "Петров А.В.",
  },
  {
    id: "M-0007",
    datetime: "13.05.2026 08:55",
    type: "Расход",
    article: "R32-10",
    name: "Хладагент R-32 баллон 10 кг",
    qty: 2,
    unit: "шт",
    price: 5100,
    total: 10200,
    warehouseFrom: "Центральный",
    warehouseTo: "—",
    document: "Наряд WO-2026-004498",
    employee: "Лебедев С.В.",
  },
  {
    id: "M-0008",
    datetime: "13.05.2026 12:10",
    type: "Перемещение",
    article: "INSUL-13-28",
    name: "Утеплитель Armaflex 13 мм трубка Ø28",
    qty: 50,
    unit: "м",
    price: 95,
    total: 4750,
    warehouseFrom: "Центральный",
    warehouseTo: "Мобильный склад Б",
    document: "Перемещение №ПМ-2026-0087",
    employee: "Козлов Д.И.",
  },
  {
    id: "M-0009",
    datetime: "13.05.2026 15:44",
    type: "Приход",
    article: "PUMP-COND-05",
    name: "Насос конденсатный Aspen Mini 12 л/ч",
    qty: 10,
    unit: "шт",
    price: 2300,
    total: 23000,
    warehouseFrom: "—",
    warehouseTo: "Центральный",
    document: "Накладная №ПН-2026-0213",
    employee: "Петров А.В.",
  },
  {
    id: "M-0010",
    datetime: "12.05.2026 09:00",
    type: "Расход",
    article: "FILTR-001",
    name: "Фильтр-осушитель Castel 4305/1",
    qty: 5,
    unit: "шт",
    price: 650,
    total: 3250,
    warehouseFrom: "Мобильный склад А",
    warehouseTo: "—",
    document: "Наряд WO-2026-004475",
    employee: "Сидоров К.Н.",
  },
  {
    id: "M-0011",
    datetime: "12.05.2026 11:30",
    type: "Списание",
    article: "GLOVES-L",
    name: "Перчатки защитные L латекс (пара)",
    qty: 20,
    unit: "пара",
    price: 45,
    total: 900,
    warehouseFrom: "Центральный",
    warehouseTo: "—",
    document: "Акт списания №АС-2026-0040",
    employee: "Орлов Г.С.",
  },
  {
    id: "M-0012",
    datetime: "12.05.2026 14:15",
    type: "Возврат",
    article: "MANOMETER",
    name: "Манометрический коллектор 4-вентильный",
    qty: 1,
    unit: "шт",
    price: 8900,
    total: 8900,
    warehouseFrom: "Мобильный склад Б",
    warehouseTo: "Центральный",
    document: "Возврат №ВЗ-2026-0018",
    employee: "Морозов П.Е.",
  },
  {
    id: "M-0013",
    datetime: "11.05.2026 09:20",
    type: "Приход",
    article: "BOARD-DAIKIN-4MXS",
    name: "Плата управления Daikin 4MXS80E",
    qty: 3,
    unit: "шт",
    price: 21500,
    total: 64500,
    warehouseFrom: "—",
    warehouseTo: "Центральный",
    document: "Накладная №ПН-2026-0212",
    employee: "Петров А.В.",
  },
  {
    id: "M-0014",
    datetime: "11.05.2026 13:00",
    type: "Расход",
    article: "CABLE-14",
    name: "Кабель ПВС 3×2.5 мм², 100 м бухта",
    qty: 1,
    unit: "бухта",
    price: 3200,
    total: 3200,
    warehouseFrom: "Мобильный склад А",
    warehouseTo: "—",
    document: "Наряд WO-2026-004450",
    employee: "Лебедев С.В.",
  },
  {
    id: "M-0015",
    datetime: "10.05.2026 10:05",
    type: "Перемещение",
    article: "R410A-13.6",
    name: "Хладагент R-410A баллон 13.6 кг",
    qty: 3,
    unit: "шт",
    price: 4800,
    total: 14400,
    warehouseFrom: "Центральный",
    warehouseTo: "Мобильный склад А",
    document: "Перемещение №ПМ-2026-0086",
    employee: "Козлов Д.И.",
  },
  {
    id: "M-0016",
    datetime: "10.05.2026 16:00",
    type: "Расход",
    article: "PUMP-COND-05",
    name: "Насос конденсатный Aspen Mini 12 л/ч",
    qty: 2,
    unit: "шт",
    price: 2300,
    total: 4600,
    warehouseFrom: "Центральный",
    warehouseTo: "—",
    document: "Наряд WO-2026-004430",
    employee: "Сидоров К.Н.",
  },
  {
    id: "M-0017",
    datetime: "09.05.2026 09:45",
    type: "Приход",
    article: "VALVE-PRV",
    name: "Клапан предохранительный 3/8\" Sanhua",
    qty: 6,
    unit: "шт",
    price: 1250,
    total: 7500,
    warehouseFrom: "—",
    warehouseTo: "Центральный",
    document: "Накладная №ПН-2026-0211",
    employee: "Петров А.В.",
  },
  {
    id: "M-0018",
    datetime: "09.05.2026 14:30",
    type: "Списание",
    article: "TAPE-DUCT",
    name: "Лента армированная серая 48мм×50м",
    qty: 5,
    unit: "шт",
    price: 180,
    total: 900,
    warehouseFrom: "Мобильный склад А",
    warehouseTo: "—",
    document: "Акт списания №АС-2026-0039",
    employee: "Орлов Г.С.",
  },
  {
    id: "M-0019",
    datetime: "08.05.2026 11:15",
    type: "Расход",
    article: "BOARD-DAIKIN-4MXS",
    name: "Плата управления Daikin 4MXS80E",
    qty: 1,
    unit: "шт",
    price: 21500,
    total: 21500,
    warehouseFrom: "Центральный",
    warehouseTo: "—",
    document: "Наряд WO-2026-004410",
    employee: "Лебедев С.В.",
  },
  {
    id: "M-0020",
    datetime: "07.05.2026 09:00",
    type: "Возврат",
    article: "COMP-DAIKIN-4T",
    name: "Компрессор Daikin 4 тонны JT90BCBY1L",
    qty: 1,
    unit: "шт",
    price: 87500,
    total: 87500,
    warehouseFrom: "Мобильный склад Б",
    warehouseTo: "Центральный",
    document: "Возврат №ВЗ-2026-0017",
    employee: "Морозов П.Е.",
  },
  {
    id: "M-0021",
    datetime: "07.05.2026 13:40",
    type: "Приход",
    article: "INSUL-13-28",
    name: "Утеплитель Armaflex 13 мм трубка Ø28",
    qty: 200,
    unit: "м",
    price: 95,
    total: 19000,
    warehouseFrom: "—",
    warehouseTo: "Центральный",
    document: "Накладная №ПН-2026-0210",
    employee: "Петров А.В.",
  },
  {
    id: "M-0022",
    datetime: "06.05.2026 10:50",
    type: "Расход",
    article: "R32-10",
    name: "Хладагент R-32 баллон 10 кг",
    qty: 1,
    unit: "шт",
    price: 5100,
    total: 5100,
    warehouseFrom: "Мобильный склад Б",
    warehouseTo: "—",
    document: "Наряд WO-2026-004385",
    employee: "Орлов Г.С.",
  },
];

// 30-day chart data
const generateChartData = () => {
  const data = [];
  const today = new Date(2026, 4, 15); // 15 May 2026
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const label = `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
    data.push({
      date: label,
      Приходы: Math.floor(Math.random() * 8) + 1,
      Расходы: Math.floor(Math.random() * 10) + 2,
    });
  }
  return data;
};

const chartData = generateChartData();
const allMovements = generateMovements();

// ─── Helper Components ────────────────────────────────────────────────────────

const StatCard = ({
  title,
  value,
  sub,
  iconName,
  color,
}: {
  title: string;
  value: string;
  sub?: string;
  iconName: string;
  color: string;
}) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3 shadow-sm">
    <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
      <Icon name={iconName as any} size={20} className={color} />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-500 font-medium">{title}</p>
      <p className="text-xl font-bold text-gray-800 leading-tight">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const TypeBadge = ({ type }: { type: MovementType }) => {
  const meta = MOVEMENT_META[type];
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${meta.rowBg} ${meta.color}`}
    >
      <Icon name={meta.icon as any} size={11} />
      {type}
    </span>
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────

interface NewMovementModalProps {
  onClose: () => void;
}

const NewMovementModal = ({ onClose }: NewMovementModalProps) => {
  const [form, setForm] = useState({
    type: "Приход" as MovementType,
    article: "",
    qty: "",
    warehouse: "Центральный" as WarehouseType,
    document: "",
  });

  const update = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    // In a real app, dispatch the new movement
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Icon name="Package" size={18} className="text-blue-600" />
            <h2 className="text-base font-semibold text-gray-800">
              Новое движение товара
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon name="X" size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* Тип */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Тип движения
            </label>
            <select
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MOVEMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Артикул */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Артикул / Наименование
            </label>
            <div className="relative">
              <Icon
                name="Search"
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={form.article}
                onChange={(e) => update("article", e.target.value)}
                placeholder="Введите артикул или название..."
                className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Количество */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Количество
            </label>
            <input
              type="number"
              value={form.qty}
              onChange={(e) => update("qty", e.target.value)}
              placeholder="0"
              min={0}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Склад */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {form.type === "Приход"
                ? "Склад назначения"
                : form.type === "Перемещение"
                  ? "Склад источника"
                  : "Склад"}
            </label>
            <select
              value={form.warehouse}
              onChange={(e) => update("warehouse", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {WAREHOUSES.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          {/* Документ-основание */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Документ-основание
            </label>
            <input
              type="text"
              value={form.document}
              onChange={(e) => update("document", e.target.value)}
              placeholder="Накладная, Наряд, Акт..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <Button variant="outline" size="sm" onClick={onClose}>
            <Icon name="X" size={14} className="mr-1" />
            Отмена
          </Button>
          <Button size="sm" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Icon name="Check" size={14} className="mr-1" />
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const StockMovement = () => {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<MovementType | "Все">("Все");
  const [selectedWarehouse, setSelectedWarehouse] = useState<
    WarehouseType | "Все"
  >("Все");
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [showModal, setShowModal] = useState(false);

  // Derived / filtered movements
  const filtered = useMemo(() => {
    return allMovements.filter((m) => {
      const matchType =
        selectedType === "Все" || m.type === selectedType;
      const matchWarehouse =
        selectedWarehouse === "Все" ||
        m.warehouseFrom === selectedWarehouse ||
        m.warehouseTo === selectedWarehouse;
      const matchSearch =
        search === "" ||
        m.article.toLowerCase().includes(search.toLowerCase()) ||
        m.name.toLowerCase().includes(search.toLowerCase());
      return matchType && matchWarehouse && matchSearch;
    });
  }, [search, selectedType, selectedWarehouse]);

  // Stats
  const totalPositions = 248;
  const receiptsThisMonth = allMovements.filter(
    (m) => m.type === "Приход"
  ).length;
  const expendituresThisMonth = allMovements.filter(
    (m) => m.type === "Расход"
  ).length;
  const stockValue = "4 827 650 ₽";

  // Slice chart data by period
  const visibleChartData = chartData.slice(
    Math.max(0, chartData.length - selectedPeriod),
    chartData.length
  );

  const formatRub = (val: number) =>
    new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="flex flex-col h-full bg-gray-50 min-h-screen">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl">
            <Icon name="Package" size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Журнал движения товаров
            </h1>
            <p className="text-xs text-gray-500">
              Склад HVAC — АСУ СЦ «Сервис Климат»
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-gray-600 border-gray-200"
          >
            <Icon name="Download" size={14} className="mr-1.5" />
            Экспорт
          </Button>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setShowModal(true)}
          >
            <Icon name="Plus" size={14} className="mr-1.5" />
            Новое движение
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-6 py-5 space-y-5">
          {/* ── Stats ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Позиций на складе"
              value={String(totalPositions)}
              sub="номенклатурных единиц"
              iconName="Package"
              color="text-blue-600"
            />
            <StatCard
              title="Приходов за месяц"
              value={String(receiptsThisMonth)}
              sub="поступлений товара"
              iconName="ArrowDown"
              color="text-emerald-600"
            />
            <StatCard
              title="Расходов за месяц"
              value={String(expendituresThisMonth)}
              sub="списаний / выдач"
              iconName="ArrowUp"
              color="text-red-500"
            />
            <StatCard
              title="Стоимость остатков"
              value={stockValue}
              sub="по ценам закупки"
              iconName="Package"
              color="text-purple-600"
            />
          </div>

          {/* ── Chart ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">
                Динамика движений за период
              </h2>
              <div className="flex items-center gap-1">
                {PERIODS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setSelectedPeriod(p.value)}
                    className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                      selectedPeriod === p.value
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={visibleChartData}
                  margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    tickLine={false}
                    interval={
                      selectedPeriod === 90
                        ? 6
                        : selectedPeriod === 30
                          ? 3
                          : 0
                    }
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Приходы"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Расходы"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Filters ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-52">
                <Icon
                  name="Search"
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск по артикулу или наименованию..."
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Type filter */}
              <div className="flex items-center gap-1">
                <Icon name="Filter" size={13} className="text-gray-400" />
                <select
                  value={selectedType}
                  onChange={(e) =>
                    setSelectedType(e.target.value as MovementType | "Все")
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Все">Все типы</option>
                  {MOVEMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Warehouse filter */}
              <select
                value={selectedWarehouse}
                onChange={(e) =>
                  setSelectedWarehouse(e.target.value as WarehouseType | "Все")
                }
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Все">Все склады</option>
                {WAREHOUSES.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>

              {/* Period chips */}
              <div className="flex items-center gap-1">
                <Icon name="Calendar" size={13} className="text-gray-400" />
                {PERIODS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setSelectedPeriod(p.value)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                      selectedPeriod === p.value
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <span className="text-xs text-gray-400 ml-auto">
                {filtered.length} записей
              </span>
            </div>
          </div>

          {/* ── Journal Table ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                      Дата / Время
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                      Тип
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                      Артикул
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 min-w-56">
                      Наименование
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                      Кол-во
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">
                      Ед.
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                      Цена
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                      Сумма
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                      Источник
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                      Назначение
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap min-w-44">
                      Документ
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                      Сотрудник
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={12}
                        className="text-center py-12 text-sm text-gray-400"
                      >
                        <Icon
                          name="Package"
                          size={32}
                          className="mx-auto mb-2 text-gray-300"
                        />
                        Ничего не найдено по заданным фильтрам
                      </td>
                    </tr>
                  ) : (
                    filtered.map((m) => {
                      const meta = MOVEMENT_META[m.type];
                      return (
                        <tr
                          key={m.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-500">
                            {m.datetime}
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <TypeBadge type={m.type} />
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap font-mono text-xs text-gray-700">
                            {m.article}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-gray-800 leading-snug">
                            {m.name}
                          </td>
                          <td className="px-4 py-2.5 text-right text-xs font-semibold text-gray-800 whitespace-nowrap">
                            <span className={meta.color}>
                              {m.type === "Расход" || m.type === "Списание"
                                ? "−"
                                : "+"}
                              {m.qty}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-xs text-gray-500">
                            {m.unit}
                          </td>
                          <td className="px-4 py-2.5 text-right text-xs text-gray-700 whitespace-nowrap">
                            {formatRub(m.price)}
                          </td>
                          <td className="px-4 py-2.5 text-right text-xs font-medium text-gray-800 whitespace-nowrap">
                            {formatRub(m.total)}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">
                            {m.warehouseFrom}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">
                            {m.warehouseTo}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-blue-600 whitespace-nowrap hover:underline cursor-pointer">
                            {m.document}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-gray-600 whitespace-nowrap">
                            {m.employee}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* ── Modal ── */}
      {showModal && (
        <NewMovementModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default StockMovement;
