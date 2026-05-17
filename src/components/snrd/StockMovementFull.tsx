import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

type MovementType =
  | "Приход"
  | "Расход"
  | "Перемещение"
  | "Списание"
  | "Возврат";

type PeriodOption = "Сегодня" | "Неделя" | "Месяц" | "Квартал";

type WarehouseOption =
  | "Центральный"
  | "Мобильный Иванов"
  | "Мобильный Петров";

interface StockMovementRecord {
  id: string;
  datetime: string;
  type: MovementType;
  article: string;
  name: string;
  qty: number;
  unit: string;
  warehouseFrom: string;
  warehouseTo: string;
  document: string;
  documentType: "order" | "purchase" | "act" | "transfer";
  employee: string;
  balanceBefore: number;
  balanceAfter: number;
  note?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MOVEMENT_TYPES: MovementType[] = [
  "Приход",
  "Расход",
  "Перемещение",
  "Списание",
  "Возврат",
];

const PERIOD_OPTIONS: PeriodOption[] = [
  "Сегодня",
  "Неделя",
  "Месяц",
  "Квартал",
];

const WAREHOUSE_OPTIONS: WarehouseOption[] = [
  "Центральный",
  "Мобильный Иванов",
  "Мобильный Петров",
];

// Badge variant and color mapping per movement type
const MOVEMENT_META: Record<
  MovementType,
  {
    badgeCls: string;
    sign: string;
    qtyColor: string;
    icon: string;
  }
> = {
  Приход: {
    badgeCls:
      "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
    sign: "+",
    qtyColor: "text-emerald-600 font-semibold",
    icon: "ArrowDown",
  },
  Расход: {
    badgeCls: "bg-red-100 text-red-700 border-red-200 hover:bg-red-100",
    sign: "−",
    qtyColor: "text-red-600 font-semibold",
    icon: "ArrowUp",
  },
  Перемещение: {
    badgeCls:
      "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100",
    sign: "",
    qtyColor: "text-blue-600 font-semibold",
    icon: "ArrowLeftRight",
  },
  Списание: {
    badgeCls:
      "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100",
    sign: "−",
    qtyColor: "text-gray-600 font-semibold",
    icon: "Trash2",
  },
  Возврат: {
    badgeCls:
      "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100",
    sign: "+",
    qtyColor: "text-purple-600 font-semibold",
    icon: "RotateCcw",
  },
};

// ─── Mock Data — 25 realistic HVAC movements ──────────────────────────────────

const ALL_MOVEMENTS: StockMovementRecord[] = [
  {
    id: "M-0001",
    datetime: "16.05.2026 08:10",
    type: "Приход",
    article: "R410A-13.6",
    name: "Хладагент R-410A баллон 13.6 кг",
    qty: 6,
    unit: "шт",
    warehouseFrom: "—",
    warehouseTo: "Центральный",
    document: "Накладная №ПН-2026-0218",
    documentType: "purchase",
    employee: "Петров А.В.",
    balanceBefore: 12,
    balanceAfter: 18,
    note: "Поставщик ООО «ХладоПром»",
  },
  {
    id: "M-0002",
    datetime: "16.05.2026 09:45",
    type: "Расход",
    article: "R410A-13.6",
    name: "Хладагент R-410A баллон 13.6 кг",
    qty: 2,
    unit: "шт",
    warehouseFrom: "Мобильный Иванов",
    warehouseTo: "—",
    document: "Наряд WO-2026-004531",
    documentType: "order",
    employee: "Иванов С.П.",
    balanceBefore: 8,
    balanceAfter: 6,
    note: "Заправка VRF-системы Daikin REYQ",
  },
  {
    id: "M-0003",
    datetime: "16.05.2026 10:20",
    type: "Перемещение",
    article: "R32-10",
    name: "Хладагент R-32 баллон 10 кг",
    qty: 3,
    unit: "шт",
    warehouseFrom: "Центральный",
    warehouseTo: "Мобильный Иванов",
    document: "Перемещение №ПМ-2026-0092",
    documentType: "transfer",
    employee: "Козлов Д.И.",
    balanceBefore: 15,
    balanceAfter: 12,
    note: "Пополнение мобильного склада",
  },
  {
    id: "M-0004",
    datetime: "15.05.2026 09:12",
    type: "Приход",
    article: "COMP-DAIKIN-4T",
    name: "Компрессор Daikin 4 тонны JT90BCBY1L",
    qty: 2,
    unit: "шт",
    warehouseFrom: "—",
    warehouseTo: "Центральный",
    document: "Накладная №ПН-2026-0215",
    documentType: "purchase",
    employee: "Петров А.В.",
    balanceBefore: 1,
    balanceAfter: 3,
    note: "Гарантийный запас ЗИП",
  },
  {
    id: "M-0005",
    datetime: "15.05.2026 11:30",
    type: "Расход",
    article: "FILTR-4305-1",
    name: "Фильтр-осушитель Castel 4305/1",
    qty: 4,
    unit: "шт",
    warehouseFrom: "Центральный",
    warehouseTo: "—",
    document: "Наряд WO-2026-004521",
    documentType: "order",
    employee: "Сидоров К.Н.",
    balanceBefore: 22,
    balanceAfter: 18,
  },
  {
    id: "M-0006",
    datetime: "15.05.2026 14:05",
    type: "Перемещение",
    article: "COPPER-3-8",
    name: "Труба медная 3/8\" 9.52×0.8 мм, бухта 15 м",
    qty: 5,
    unit: "бухта",
    warehouseFrom: "Центральный",
    warehouseTo: "Мобильный Петров",
    document: "Перемещение №ПМ-2026-0091",
    documentType: "transfer",
    employee: "Козлов Д.И.",
    balanceBefore: 30,
    balanceAfter: 25,
    note: "Под монтажный объект ЖК «Северный»",
  },
  {
    id: "M-0007",
    datetime: "15.05.2026 16:40",
    type: "Списание",
    article: "TAPE-DUCT",
    name: "Лента армированная серая 48 мм × 50 м",
    qty: 8,
    unit: "шт",
    warehouseFrom: "Мобильный Иванов",
    warehouseTo: "—",
    document: "Акт списания №АС-2026-0044",
    documentType: "act",
    employee: "Орлов Г.С.",
    balanceBefore: 20,
    balanceAfter: 12,
    note: "Использована при монтаже, восстановлению не подлежит",
  },
  {
    id: "M-0008",
    datetime: "14.05.2026 08:55",
    type: "Возврат",
    article: "MANOMETER",
    name: "Манометрический коллектор 4-вентильный",
    qty: 1,
    unit: "шт",
    warehouseFrom: "Мобильный Петров",
    warehouseTo: "Центральный",
    document: "Возврат №ВЗ-2026-0021",
    documentType: "act",
    employee: "Морозов П.Е.",
    balanceBefore: 2,
    balanceAfter: 3,
    note: "Инструмент после завершения объекта",
  },
  {
    id: "M-0009",
    datetime: "14.05.2026 10:15",
    type: "Приход",
    article: "PUMP-COND-05",
    name: "Насос конденсатный Aspen Mini 12 л/ч",
    qty: 10,
    unit: "шт",
    warehouseFrom: "—",
    warehouseTo: "Центральный",
    document: "Накладная №ПН-2026-0213",
    documentType: "purchase",
    employee: "Петров А.В.",
    balanceBefore: 5,
    balanceAfter: 15,
  },
  {
    id: "M-0010",
    datetime: "14.05.2026 13:30",
    type: "Расход",
    article: "INSUL-13-28",
    name: "Утеплитель Armaflex 13 мм трубка Ø28",
    qty: 30,
    unit: "м",
    warehouseFrom: "Мобильный Петров",
    warehouseTo: "—",
    document: "Наряд WO-2026-004510",
    documentType: "order",
    employee: "Петров Р.А.",
    balanceBefore: 180,
    balanceAfter: 150,
    note: "Монтаж трубопровода чиллера",
  },
  {
    id: "M-0011",
    datetime: "14.05.2026 16:00",
    type: "Расход",
    article: "VALVE-PRV",
    name: "Клапан предохранительный 3/8\" Sanhua",
    qty: 2,
    unit: "шт",
    warehouseFrom: "Центральный",
    warehouseTo: "—",
    document: "Наряд WO-2026-004505",
    documentType: "order",
    employee: "Лебедев С.В.",
    balanceBefore: 10,
    balanceAfter: 8,
  },
  {
    id: "M-0012",
    datetime: "13.05.2026 09:00",
    type: "Приход",
    article: "BOARD-DAIKIN-4MXS",
    name: "Плата управления Daikin 4MXS80E",
    qty: 3,
    unit: "шт",
    warehouseFrom: "—",
    warehouseTo: "Центральный",
    document: "Накладная №ПН-2026-0212",
    documentType: "purchase",
    employee: "Петров А.В.",
    balanceBefore: 0,
    balanceAfter: 3,
    note: "Срочный заказ ЗИП по гарантии",
  },
  {
    id: "M-0013",
    datetime: "13.05.2026 11:45",
    type: "Перемещение",
    article: "R410A-13.6",
    name: "Хладагент R-410A баллон 13.6 кг",
    qty: 4,
    unit: "шт",
    warehouseFrom: "Центральный",
    warehouseTo: "Мобильный Иванов",
    document: "Перемещение №ПМ-2026-0090",
    documentType: "transfer",
    employee: "Козлов Д.И.",
    balanceBefore: 18,
    balanceAfter: 14,
  },
  {
    id: "M-0014",
    datetime: "13.05.2026 14:20",
    type: "Расход",
    article: "COMP-DAIKIN-4T",
    name: "Компрессор Daikin 4 тонны JT90BCBY1L",
    qty: 1,
    unit: "шт",
    warehouseFrom: "Центральный",
    warehouseTo: "—",
    document: "Наряд WO-2026-004498",
    documentType: "order",
    employee: "Иванов С.П.",
    balanceBefore: 3,
    balanceAfter: 2,
    note: "Замена по гарантии, объект ТЦ «Меридиан»",
  },
  {
    id: "M-0015",
    datetime: "12.05.2026 09:30",
    type: "Списание",
    article: "GLOVES-L",
    name: "Перчатки защитные L латекс (пара)",
    qty: 20,
    unit: "пара",
    warehouseFrom: "Центральный",
    warehouseTo: "—",
    document: "Акт списания №АС-2026-0043",
    documentType: "act",
    employee: "Орлов Г.С.",
    balanceBefore: 50,
    balanceAfter: 30,
    note: "Ежемесячное списание СИЗ",
  },
  {
    id: "M-0016",
    datetime: "12.05.2026 12:00",
    type: "Приход",
    article: "COPPER-1-2",
    name: "Труба медная 1/2\" 12.7×0.8 мм, бухта 15 м",
    qty: 20,
    unit: "бухта",
    warehouseFrom: "—",
    warehouseTo: "Центральный",
    document: "Накладная №ПН-2026-0210",
    documentType: "purchase",
    employee: "Петров А.В.",
    balanceBefore: 10,
    balanceAfter: 30,
    note: "Поставщик ООО «МеталлТрейд»",
  },
  {
    id: "M-0017",
    datetime: "12.05.2026 15:10",
    type: "Возврат",
    article: "VALVE-PRV",
    name: "Клапан предохранительный 3/8\" Sanhua",
    qty: 1,
    unit: "шт",
    warehouseFrom: "Мобильный Иванов",
    warehouseTo: "Центральный",
    document: "Возврат №ВЗ-2026-0020",
    documentType: "act",
    employee: "Морозов П.Е.",
    balanceBefore: 8,
    balanceAfter: 9,
    note: "Не потребовался при диагностике",
  },
  {
    id: "M-0018",
    datetime: "11.05.2026 09:00",
    type: "Расход",
    article: "R32-10",
    name: "Хладагент R-32 баллон 10 кг",
    qty: 2,
    unit: "шт",
    warehouseFrom: "Мобильный Иванов",
    warehouseTo: "—",
    document: "Наряд WO-2026-004475",
    documentType: "order",
    employee: "Иванов С.П.",
    balanceBefore: 5,
    balanceAfter: 3,
  },
  {
    id: "M-0019",
    datetime: "11.05.2026 11:30",
    type: "Перемещение",
    article: "FILTR-4305-1",
    name: "Фильтр-осушитель Castel 4305/1",
    qty: 10,
    unit: "шт",
    warehouseFrom: "Центральный",
    warehouseTo: "Мобильный Петров",
    document: "Перемещение №ПМ-2026-0089",
    documentType: "transfer",
    employee: "Козлов Д.И.",
    balanceBefore: 28,
    balanceAfter: 18,
    note: "Под плановое ТО объектов Петрова",
  },
  {
    id: "M-0020",
    datetime: "10.05.2026 10:05",
    type: "Приход",
    article: "INSUL-13-28",
    name: "Утеплитель Armaflex 13 мм трубка Ø28",
    qty: 200,
    unit: "м",
    warehouseFrom: "—",
    warehouseTo: "Центральный",
    document: "Накладная №ПН-2026-0209",
    documentType: "purchase",
    employee: "Петров А.В.",
    balanceBefore: 80,
    balanceAfter: 280,
  },
  {
    id: "M-0021",
    datetime: "10.05.2026 13:00",
    type: "Расход",
    article: "BOARD-DAIKIN-4MXS",
    name: "Плата управления Daikin 4MXS80E",
    qty: 1,
    unit: "шт",
    warehouseFrom: "Центральный",
    warehouseTo: "—",
    document: "Наряд WO-2026-004460",
    documentType: "order",
    employee: "Лебедев С.В.",
    balanceBefore: 3,
    balanceAfter: 2,
    note: "Гарантийная замена, клиент ООО «АрктикСтрой»",
  },
  {
    id: "M-0022",
    datetime: "09.05.2026 09:45",
    type: "Приход",
    article: "VALVE-PRV",
    name: "Клапан предохранительный 3/8\" Sanhua",
    qty: 6,
    unit: "шт",
    warehouseFrom: "—",
    warehouseTo: "Центральный",
    document: "Накладная №ПН-2026-0208",
    documentType: "purchase",
    employee: "Петров А.В.",
    balanceBefore: 3,
    balanceAfter: 9,
  },
  {
    id: "M-0023",
    datetime: "09.05.2026 15:20",
    type: "Списание",
    article: "TAPE-DUCT",
    name: "Лента армированная серая 48 мм × 50 м",
    qty: 5,
    unit: "шт",
    warehouseFrom: "Мобильный Петров",
    warehouseTo: "—",
    document: "Акт списания №АС-2026-0042",
    documentType: "act",
    employee: "Орлов Г.С.",
    balanceBefore: 17,
    balanceAfter: 12,
  },
  {
    id: "M-0024",
    datetime: "08.05.2026 11:15",
    type: "Расход",
    article: "PUMP-COND-05",
    name: "Насос конденсатный Aspen Mini 12 л/ч",
    qty: 3,
    unit: "шт",
    warehouseFrom: "Центральный",
    warehouseTo: "—",
    document: "Наряд WO-2026-004440",
    documentType: "order",
    employee: "Сидоров К.Н.",
    balanceBefore: 15,
    balanceAfter: 12,
    note: "Монтаж 3 кассетных кондиционеров",
  },
  {
    id: "M-0025",
    datetime: "07.05.2026 09:00",
    type: "Возврат",
    article: "COMP-DAIKIN-4T",
    name: "Компрессор Daikin 4 тонны JT90BCBY1L",
    qty: 1,
    unit: "шт",
    warehouseFrom: "Мобильный Петров",
    warehouseTo: "Центральный",
    document: "Возврат №ВЗ-2026-0019",
    documentType: "act",
    employee: "Морозов П.Е.",
    balanceBefore: 1,
    balanceAfter: 2,
    note: "Компрессор не подошёл — возврат на склад",
  },
];

// ─── Chart Data — 30 days ─────────────────────────────────────────────────────

const CHART_DATA = (() => {
  const base = new Date(2026, 4, 16); // 16 May 2026
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() - (29 - i));
    const label = `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
    const seed = i + 1;
    return {
      date: label,
      Приходы: ((seed * 7) % 9) + 1,
      Расходы: ((seed * 11) % 12) + 2,
    };
  });
})();

// ─── Helper Components ────────────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  sub,
  iconName,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string | number;
  sub?: string;
  iconName: string;
  iconBg: string;
  iconColor: string;
}) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-start gap-3">
    <div className={`p-2.5 rounded-xl ${iconBg} flex-shrink-0`}>
      <Icon name={iconName as any} size={18} className={iconColor} />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-500 font-medium leading-tight">{label}</p>
      <p className="text-2xl font-bold text-gray-900 leading-tight mt-0.5">
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const MovementBadge = ({ type }: { type: MovementType }) => {
  const meta = MOVEMENT_META[type];
  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium px-2 py-0.5 gap-1 ${meta.badgeCls}`}
    >
      <Icon name={meta.icon as any} size={10} />
      {type}
    </Badge>
  );
};

// ─── New Movement Modal ───────────────────────────────────────────────────────

interface NewMovementModalProps {
  onClose: () => void;
}

const NewMovementModal = ({ onClose }: NewMovementModalProps) => {
  const [form, setForm] = useState({
    type: "Приход" as MovementType,
    article: "",
    qty: "",
    warehouse: "Центральный" as WarehouseOption,
    document: "",
  });

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    if (!form.article.trim()) {
      toast.error("Укажите товар или артикул");
      return;
    }
    if (!form.qty || Number(form.qty) <= 0) {
      toast.error("Укажите корректное количество");
      return;
    }
    toast.success(`Операция "${form.type}" сохранена`, {
      description: `${form.article} — ${form.qty} ед. → ${form.warehouse}`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <Icon name="PackagePlus" size={16} className="text-blue-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-800">
              Создать операцию
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
        <div className="px-6 py-5 space-y-4">
          {/* Тип */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Тип операции
            </label>
            <select
              value={form.type}
              onChange={(e) => update("type", e.target.value as MovementType)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MOVEMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Товар */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Товар / Артикул
            </label>
            <Input
              value={form.article}
              onChange={(e) => update("article", e.target.value)}
              placeholder="Введите артикул или наименование..."
            />
          </div>

          {/* Количество */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Количество
            </label>
            <Input
              type="number"
              value={form.qty}
              onChange={(e) => update("qty", e.target.value)}
              placeholder="0"
              min={0}
            />
          </div>

          {/* Склад */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              {form.type === "Приход"
                ? "Склад назначения"
                : form.type === "Перемещение"
                  ? "Склад-источник"
                  : "Склад"}
            </label>
            <select
              value={form.warehouse}
              onChange={(e) =>
                update("warehouse", e.target.value as WarehouseOption)
              }
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {WAREHOUSE_OPTIONS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          {/* Основание */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Документ-основание
            </label>
            <Input
              value={form.document}
              onChange={(e) => update("document", e.target.value)}
              placeholder="Накладная, Наряд, Акт..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <Button variant="outline" size="sm" onClick={onClose}>
            Отмена
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Icon name="Check" size={14} className="mr-1.5" />
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Detail Panel ─────────────────────────────────────────────────────────────

const DetailPanel = ({
  record,
  onClose,
}: {
  record: StockMovementRecord;
  onClose: () => void;
}) => {
  const meta = MOVEMENT_META[record.type];

  const handleDocumentClick = () => {
    const label =
      record.documentType === "order"
        ? `Наряд ${record.document}`
        : record.documentType === "purchase"
          ? `Закупка ${record.document}`
          : record.document;
    toast.info(`Открываем: ${label}`, {
      description: "Переход в связанный документ",
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm mx-6 mb-5 overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <Icon name="Info" size={15} className="text-blue-500" />
          <span className="text-sm font-semibold text-gray-700">
            Детали операции {record.id}
          </span>
          <MovementBadge type={record.type} />
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-200 text-gray-400 transition-colors"
        >
          <Icon name="X" size={14} />
        </button>
      </div>

      <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-400 font-medium">Артикул</p>
            <p className="text-sm font-mono text-gray-800">{record.article}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Наименование</p>
            <p className="text-sm text-gray-800 leading-snug">{record.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">
              Дата / Время
            </p>
            <p className="text-sm text-gray-800">{record.datetime}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Ответственный</p>
            <p className="text-sm text-gray-800">{record.employee}</p>
          </div>
        </div>

        {/* Middle column */}
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-400 font-medium">Количество</p>
            <p className={`text-sm ${meta.qtyColor}`}>
              {meta.sign}
              {record.qty} {record.unit}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Откуда</p>
            <p className="text-sm text-gray-800">{record.warehouseFrom}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Куда</p>
            <p className="text-sm text-gray-800">{record.warehouseTo}</p>
          </div>
          {record.note && (
            <div>
              <p className="text-xs text-gray-400 font-medium">Примечание</p>
              <p className="text-sm text-gray-700 leading-snug">{record.note}</p>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-3">
          {/* Linked document */}
          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">
              Связанный документ
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDocumentClick}
              className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs h-7"
            >
              <Icon
                name={
                  record.documentType === "order"
                    ? "ClipboardList"
                    : record.documentType === "purchase"
                      ? "ShoppingCart"
                      : "FileText"
                }
                size={12}
                className="mr-1.5"
              />
              {record.document}
            </Button>
          </div>

          {/* Balance before / after */}
          <div>
            <p className="text-xs text-gray-400 font-medium mb-2">
              Остаток по складу
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-center border border-gray-100">
                <p className="text-xs text-gray-400">До</p>
                <p className="text-base font-bold text-gray-700">
                  {record.balanceBefore}
                </p>
                <p className="text-xs text-gray-400">{record.unit}</p>
              </div>
              <Icon name="ArrowRight" size={14} className="text-gray-400 flex-shrink-0" />
              <div className="flex-1 bg-blue-50 rounded-lg px-3 py-2 text-center border border-blue-100">
                <p className="text-xs text-blue-400">После</p>
                <p className="text-base font-bold text-blue-700">
                  {record.balanceAfter}
                </p>
                <p className="text-xs text-blue-400">{record.unit}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const StockMovementFull = () => {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<MovementType | "Все">(
    "Все"
  );
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>("Месяц");
  const [selectedWarehouse, setSelectedWarehouse] = useState<
    WarehouseOption | "Все"
  >("Все");
  const [selectedRow, setSelectedRow] = useState<StockMovementRecord | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);

  // Filter movements
  const filtered = useMemo(() => {
    return ALL_MOVEMENTS.filter((m) => {
      const matchType = selectedType === "Все" || m.type === selectedType;
      const matchWarehouse =
        selectedWarehouse === "Все" ||
        m.warehouseFrom === selectedWarehouse ||
        m.warehouseTo === selectedWarehouse;
      const q = search.toLowerCase();
      const matchSearch =
        q === "" ||
        m.article.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q);
      return matchType && matchWarehouse && matchSearch;
    });
  }, [search, selectedType, selectedWarehouse]);

  const handleRowClick = (record: StockMovementRecord) => {
    setSelectedRow((prev) => (prev?.id === record.id ? null : record));
  };

  const handleExport = () => {
    toast.success("Экспорт запущен", {
      description: "Файл будет готов через несколько секунд",
    });
  };

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl">
            <Icon name="ArrowLeftRight" size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Журнал движения склада
            </h1>
            <p className="text-xs text-gray-500">
              HVAC ERP — АСУ СЦ «Сервис Климат»
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="text-gray-600 border-gray-200 gap-1.5"
          >
            <Icon name="Download" size={14} />
            Экспорт
          </Button>
          <Button
            size="sm"
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
          >
            <Icon name="Plus" size={14} />
            Создать операцию
          </Button>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* ── Metrics ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Операций за месяц"
            value={247}
            sub="всего движений"
            iconName="Activity"
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard
            label="Приходов"
            value={89}
            sub="поступлений товара"
            iconName="PackagePlus"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <StatCard
            label="Расходов"
            value={134}
            sub="выдач / списаний"
            iconName="PackageMinus"
            iconBg="bg-red-50"
            iconColor="text-red-500"
          />
          <StatCard
            label="Перемещений"
            value={24}
            sub="между складами"
            iconName="Truck"
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
          />
        </div>

        {/* ── Chart ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Движения по дням (последние 30 дней)
          </h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={CHART_DATA}
                margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                barSize={8}
                barGap={2}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  tickLine={false}
                  interval={4}
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
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,.07)",
                  }}
                  cursor={{ fill: "rgba(0,0,0,.03)" }}
                />
                <Bar
                  dataKey="Приходы"
                  fill="#22c55e"
                  radius={[3, 3, 0, 0]}
                  name="Приходы"
                />
                <Bar
                  dataKey="Расходы"
                  fill="#ef4444"
                  radius={[3, 3, 0, 0]}
                  name="Расходы"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-2 justify-center">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-xs text-gray-500">Приходы</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-xs text-gray-500">Расходы</span>
            </div>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-52">
              <Icon
                name="Search"
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по товару / артикулу..."
                className="pl-9"
              />
            </div>

            {/* Type */}
            <div className="flex items-center gap-1.5">
              <Icon name="Filter" size={13} className="text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) =>
                  setSelectedType(e.target.value as MovementType | "Все")
                }
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Все">Все типы</option>
                {MOVEMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Period */}
            <div className="flex items-center gap-1">
              <Icon name="Calendar" size={13} className="text-gray-400 mr-0.5" />
              {PERIOD_OPTIONS.map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPeriod(p)}
                  className={`px-2.5 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                    selectedPeriod === p
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Warehouse */}
            <select
              value={selectedWarehouse}
              onChange={(e) =>
                setSelectedWarehouse(e.target.value as WarehouseOption | "Все")
              }
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Все">Все склады</option>
              {WAREHOUSE_OPTIONS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>

            <span className="text-xs text-gray-400 ml-auto">
              {filtered.length} из {ALL_MOVEMENTS.length}
            </span>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {[
                    "Дата / Время",
                    "Тип",
                    "Артикул",
                    "Наименование",
                    "Кол-во",
                    "Ед.",
                    "Откуда",
                    "Куда",
                    "Документ",
                    "Ответственный",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="text-center py-14 text-sm text-gray-400"
                    >
                      <Icon
                        name="PackageSearch"
                        size={32}
                        className="mx-auto mb-2 text-gray-300"
                      />
                      Ничего не найдено по заданным фильтрам
                    </td>
                  </tr>
                ) : (
                  filtered.map((m) => {
                    const meta = MOVEMENT_META[m.type];
                    const isSelected = selectedRow?.id === m.id;
                    return (
                      <tr
                        key={m.id}
                        onClick={() => handleRowClick(m)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-50 border-l-2 border-blue-500"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-500">
                          {m.datetime}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <MovementBadge type={m.type} />
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap font-mono text-xs text-gray-700">
                          {m.article}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-800 leading-snug min-w-56 max-w-xs">
                          {m.name}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap text-right">
                          <span className={`text-xs ${meta.qtyColor}`}>
                            {meta.sign}
                            {m.qty}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-500">
                          {m.unit}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-500">
                          {m.warehouseFrom}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-500">
                          {m.warehouseTo}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap text-xs text-blue-600 hover:underline">
                          {m.document}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-600">
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

        {/* ── Detail Panel ── */}
        {selectedRow && (
          <DetailPanel
            record={selectedRow}
            onClose={() => setSelectedRow(null)}
          />
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && <NewMovementModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default StockMovementFull;
