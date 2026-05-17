import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ─── Types ────────────────────────────────────────────────────────────────────
type StockStatus = "Норма" | "Дефицит" | "Избыток";
type Category = "Все" | "Хладагенты" | "Фильтры" | "Запчасти" | "Расходники" | "Инструменты";
type WarehouseFilter = "Все" | "Центральный" | "Мобильные";
type MovementType = "Приход" | "Расход" | "Перемещение" | "Списание";
type AbcGroup = "A" | "B" | "C";

interface StockItem { id: string; article: string; name: string; category: Exclude<Category, "Все">; warehouse: "Центральный" | "Мобильный"; qty: number; minQty: number; price: number; }
interface StockMovement { id: string; date: string; type: MovementType; name: string; qty: number; unit: string; ref: string; engineer: string; }
interface RefrigerantCylinder { id: string; type: string; serial: string; capacityKg: number; remainKg: number; warehouse: string; }
interface AbcRow { group: AbcGroup; items: number; costPct: number; consumePct: number; }

// ─── Static data ──────────────────────────────────────────────────────────────
const STOCK_ITEMS: StockItem[] = [
  { id:"1",  article:"SKU-001", name:"Фреон R-410A (баллон 10 кг)",          category:"Хладагенты",  warehouse:"Центральный", qty:12,  minQty:5,   price:4500  },
  { id:"2",  article:"SKU-002", name:"Фреон R-32 (баллон 10 кг)",            category:"Хладагенты",  warehouse:"Центральный", qty:8,   minQty:4,   price:4200  },
  { id:"3",  article:"SKU-003", name:"Фреон R-22 (баллон 13.6 кг)",          category:"Хладагенты",  warehouse:"Центральный", qty:2,   minQty:3,   price:3800  },
  { id:"4",  article:"SKU-004", name:"Фреон R-407C (баллон 11.3 кг)",        category:"Хладагенты",  warehouse:"Мобильный",   qty:4,   minQty:2,   price:4100  },
  { id:"5",  article:"SKU-005", name:"Фильтр-осушитель 1/4\" (Alco)",        category:"Фильтры",     warehouse:"Центральный", qty:48,  minQty:20,  price:120   },
  { id:"6",  article:"SKU-006", name:"Фильтр-осушитель 3/8\" (Alco)",        category:"Фильтры",     warehouse:"Центральный", qty:32,  minQty:15,  price:145   },
  { id:"7",  article:"SKU-007", name:"Фильтр сетчатый 1/2\" (нерж.)",        category:"Фильтры",     warehouse:"Центральный", qty:6,   minQty:10,  price:280   },
  { id:"8",  article:"SKU-008", name:"Компрессор Mitsubishi FH-035",          category:"Запчасти",    warehouse:"Центральный", qty:1,   minQty:1,   price:45000 },
  { id:"9",  article:"SKU-009", name:"Компрессор Daikin 2YC45RXAD",           category:"Запчасти",    warehouse:"Центральный", qty:0,   minQty:1,   price:52000 },
  { id:"10", article:"SKU-010", name:"Плата управления Daikin RZQS",          category:"Запчасти",    warehouse:"Центральный", qty:2,   minQty:2,   price:18500 },
  { id:"11", article:"SKU-011", name:"Плата инвертора Mitsubishi PAR-31MAA",  category:"Запчасти",    warehouse:"Центральный", qty:3,   minQty:2,   price:14200 },
  { id:"12", article:"SKU-012", name:"Теплообменник испарителя Haier AS18",   category:"Запчасти",    warehouse:"Мобильный",   qty:1,   minQty:1,   price:9800  },
  { id:"13", article:"SKU-013", name:"Медная трубка 1/4\" (м)",               category:"Расходники",  warehouse:"Центральный", qty:150, minQty:50,  price:180   },
  { id:"14", article:"SKU-014", name:"Медная трубка 3/8\" (м)",               category:"Расходники",  warehouse:"Центральный", qty:120, minQty:50,  price:220   },
  { id:"15", article:"SKU-015", name:"Теплоизоляция K-Flex 13мм (м)",        category:"Расходники",  warehouse:"Мобильный",   qty:200, minQty:100, price:45    },
  { id:"16", article:"SKU-016", name:"Дренажная помпа Aspen Mini Orange",     category:"Расходники",  warehouse:"Центральный", qty:5,   minQty:3,   price:3200  },
  { id:"17", article:"SKU-017", name:"Вентиль шаровый 1/4\" (Refco)",        category:"Расходники",  warehouse:"Мобильный",   qty:35,  minQty:15,  price:280   },
  { id:"18", article:"SKU-018", name:"Манометрический коллектор 4-вент.",     category:"Инструменты", warehouse:"Центральный", qty:4,   minQty:2,   price:12000 },
  { id:"19", article:"SKU-019", name:"Вакуумный насос Value V-i220SV",        category:"Инструменты", warehouse:"Мобильный",   qty:3,   minQty:2,   price:18500 },
  { id:"20", article:"SKU-020", name:"Течеискатель электронный Inficon D-TEK",category:"Инструменты", warehouse:"Мобильный",   qty:2,   minQty:2,   price:24000 },
];

const AREA_DATA = [
  { day: "17.04", income: 12, expense: 8  },
  { day: "20.04", income: 18, expense: 10 },
  { day: "23.04", income: 7,  expense: 11 },
  { day: "26.04", income: 9,  expense: 13 },
  { day: "29.04", income: 0,  expense: 8  },
  { day: "02.05", income: 16, expense: 7  },
  { day: "05.05", income: 8,  expense: 11 },
  { day: "08.05", income: 19, expense: 8  },
  { day: "11.05", income: 15, expense: 7  },
  { day: "14.05", income: 20, expense: 9  },
  { day: "16.05", income: 12, expense: 8  },
];

const MOVEMENTS: StockMovement[] = [
  { id:"M01", date:"16.05.2026 14:22", type:"Расход",      name:"Фреон R-410A",          qty:2,  unit:"баллон", ref:"WO-2026-001847", engineer:"Петров А.С."  },
  { id:"M02", date:"16.05.2026 11:05", type:"Приход",      name:"Фильтр-осушитель 1/4\"", qty:20, unit:"шт",     ref:"ПО-2026-0412",   engineer:"Склад"        },
  { id:"M03", date:"16.05.2026 09:45", type:"Перемещение", name:"Медная трубка 1/4\"",    qty:30, unit:"м",      ref:"Перемещение",    engineer:"Иванов К.В."  },
  { id:"M04", date:"15.05.2026 16:33", type:"Расход",      name:"Компрессор Daikin",      qty:1,  unit:"шт",     ref:"WO-2026-001832", engineer:"Козлов В.П."  },
  { id:"M05", date:"15.05.2026 13:10", type:"Расход",      name:"Медная трубка 3/8\"",    qty:15, unit:"м",      ref:"WO-2026-001830", engineer:"Петров А.С."  },
  { id:"M06", date:"15.05.2026 10:22", type:"Приход",      name:"Фреон R-32",             qty:4,  unit:"баллон", ref:"ПО-2026-0408",   engineer:"Склад"        },
  { id:"M07", date:"14.05.2026 17:55", type:"Списание",    name:"Фильтр сетчатый 1/2\"",  qty:2,  unit:"шт",     ref:"Акт списания",   engineer:"Склад"        },
  { id:"M08", date:"14.05.2026 14:40", type:"Расход",      name:"Теплоизоляция 13мм",     qty:25, unit:"м",      ref:"WO-2026-001818", engineer:"Иванов К.В."  },
  { id:"M09", date:"14.05.2026 09:12", type:"Расход",      name:"Вентиль шаровый 1/4\"",  qty:6,  unit:"шт",     ref:"WO-2026-001815", engineer:"Козлов В.П."  },
  { id:"M10", date:"13.05.2026 15:30", type:"Приход",      name:"Плата Mitsubishi PAR",   qty:2,  unit:"шт",     ref:"ПО-2026-0401",   engineer:"Склад"        },
  { id:"M11", date:"13.05.2026 12:05", type:"Расход",      name:"Дренажная помпа Aspen",  qty:1,  unit:"шт",     ref:"WO-2026-001800", engineer:"Петров А.С."  },
  { id:"M12", date:"13.05.2026 09:50", type:"Расход",      name:"Фреон R-410A",           qty:3,  unit:"баллон", ref:"WO-2026-001797", engineer:"Иванов К.В."  },
  { id:"M13", date:"12.05.2026 16:20", type:"Перемещение", name:"Фильтр-осушитель 3/8\"", qty:10, unit:"шт",     ref:"Перемещение",    engineer:"Козлов В.П."  },
  { id:"M14", date:"12.05.2026 11:35", type:"Списание",    name:"Медная трубка 1/4\"",    qty:5,  unit:"м",      ref:"Акт списания",   engineer:"Склад"        },
  { id:"M15", date:"11.05.2026 14:50", type:"Расход",      name:"Теплообменник Haier",    qty:1,  unit:"шт",     ref:"WO-2026-001782", engineer:"Петров А.С."  },
];

const TOP_CONSUME: { name: string; qty: number }[] = [
  { name:"Фреон R-410A",        qty:28  },
  { name:"Медная тр. 1/4\"",    qty:180 },
  { name:"Теплоизол. 13мм",    qty:145 },
  { name:"Фильтр-осуш. 1/4\"", qty:62  },
  { name:"Медная тр. 3/8\"",   qty:95  },
  { name:"Фреон R-32",          qty:18  },
  { name:"Вентиль 1/4\"",       qty:44  },
  { name:"Фильтр-осуш. 3/8\"", qty:38  },
  { name:"Дренаж. помпа",       qty:7   },
  { name:"Фреон R-407C",        qty:11  },
];

const PIE_DATA = [
  { name:"Хладагенты",  value:70800,  color:"#3b82f6" },
  { name:"Фильтры",     value:11120,  color:"#06b6d4" },
  { name:"Запчасти",    value:213600, color:"#8b5cf6" },
  { name:"Расходники",  value:68150,  color:"#10b981" },
  { name:"Инструменты", value:144500, color:"#f59e0b" },
];

const ABC_DATA: AbcRow[] = [
  { group:"A", items:4,  costPct:66.2, consumePct:78.5 },
  { group:"B", items:7,  costPct:24.8, consumePct:16.3 },
  { group:"C", items:9,  costPct:9.0,  consumePct:5.2  },
];

const CYLINDERS: RefrigerantCylinder[] = [
  { id:"C01", type:"R-410A", serial:"SN-4101-A", capacityKg:10.0, remainKg:8.2,  warehouse:"Центральный"    },
  { id:"C02", type:"R-410A", serial:"SN-4101-B", capacityKg:10.0, remainKg:10.0, warehouse:"Центральный"    },
  { id:"C03", type:"R-410A", serial:"SN-4101-C", capacityKg:10.0, remainKg:3.5,  warehouse:"Мобильный Иванов"},
  { id:"C04", type:"R-32",   serial:"SN-3201-A", capacityKg:10.0, remainKg:9.1,  warehouse:"Центральный"    },
  { id:"C05", type:"R-32",   serial:"SN-3201-B", capacityKg:10.0, remainKg:5.8,  warehouse:"Центральный"    },
  { id:"C06", type:"R-32",   serial:"SN-3201-C", capacityKg:10.0, remainKg:7.2,  warehouse:"Мобильный Козлов"},
  { id:"C07", type:"R-22",   serial:"SN-2201-A", capacityKg:13.6, remainKg:2.4,  warehouse:"Центральный"    },
  { id:"C08", type:"R-22",   serial:"SN-2201-B", capacityKg:13.6, remainKg:0.8,  warehouse:"Центральный"    },
  { id:"C09", type:"R-407C", serial:"SN-407C-A", capacityKg:11.3, remainKg:9.0,  warehouse:"Центральный"    },
  { id:"C10", type:"R-407C", serial:"SN-407C-B", capacityKg:11.3, remainKg:4.3,  warehouse:"Мобильный Петров"},
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getStockStatus(item: StockItem): StockStatus {
  if (item.qty < item.minQty) return "Дефицит";
  if (item.qty > item.minQty * 3) return "Избыток";
  return "Норма";
}
function formatRub(v: number): string {
  return v.toLocaleString("ru-RU") + " ₽";
}
const STATUS_BADGE: Record<StockStatus, string> = {
  Норма:   "bg-emerald-100 text-emerald-700 border-emerald-200",
  Дефицит: "bg-red-100 text-red-700 border-red-200",
  Избыток: "bg-amber-100 text-amber-700 border-amber-200",
};
const MOVEMENT_BADGE: Record<MovementType, string> = {
  Приход:      "bg-emerald-100 text-emerald-700",
  Расход:      "bg-blue-100 text-blue-700",
  Перемещение: "bg-violet-100 text-violet-700",
  Списание:    "bg-red-100 text-red-700",
};
const ABC_BADGE: Record<AbcGroup, string> = {
  A: "bg-red-100 text-red-700",
  B: "bg-amber-100 text-amber-700",
  C: "bg-emerald-100 text-emerald-700",
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
interface KpiCardProps { icon: string; label: string; value: string; sub: string; color: string; }

function KpiCard({ icon, label, value, sub, color }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="p-4 flex items-start gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon name={icon} size={20} className="text-white" />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StockReportFull() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("Все");
  const [warehouseFilter, setWarehouseFilter] = useState<WarehouseFilter>("Все");

  // ── Filtered stock items ──────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    return STOCK_ITEMS.filter((item) => {
      const matchesSearch =
        search === "" ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.article.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        category === "Все" || item.category === category;
      const matchesWarehouse =
        warehouseFilter === "Все" ||
        (warehouseFilter === "Центральный" && item.warehouse === "Центральный") ||
        (warehouseFilter === "Мобильные" && item.warehouse === "Мобильный");
      return matchesSearch && matchesCategory && matchesWarehouse;
    });
  }, [search, category, warehouseFilter]);

  // ── KPI values ────────────────────────────────────────────────────────────
  const totalPositions = STOCK_ITEMS.length;
  const deficitCount = STOCK_ITEMS.filter((i) => getStockStatus(i) === "Дефицит").length;
  const totalValue = STOCK_ITEMS.reduce((sum, i) => sum + i.qty * i.price, 0);
  const turnoverDays = 38;

  // ── Refrigerant totals ────────────────────────────────────────────────────
  const refrigerantTotals = useMemo(() => {
    const map: Record<string, { capacity: number; remain: number }> = {};
    for (const c of CYLINDERS) {
      if (!map[c.type]) map[c.type] = { capacity: 0, remain: 0 };
      map[c.type].capacity += c.capacityKg;
      map[c.type].remain += c.remainKg;
    }
    return Object.entries(map).map(([type, v]) => ({ type, ...v }));
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Отчёт по складу</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Актуально на 17.05.2026 · Обновлено в 08:45
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => toast.success("Отчёт экспортирован в Excel")}
        >
          <Icon name="Download" size={16} className="mr-2" />
          Экспорт
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          icon="Package"
          label="Позиций на складе"
          value={String(totalPositions)}
          sub="+2 за месяц"
          color="bg-blue-500"
        />
        <KpiCard
          icon="RotateCcw"
          label="Оборачиваемость"
          value={`${turnoverDays} дн.`}
          sub="Норма ≤ 45 дней"
          color="bg-violet-500"
        />
        <KpiCard
          icon="Banknote"
          label="Стоимость остатков"
          value={formatRub(totalValue)}
          sub="По закупочным ценам"
          color="bg-emerald-500"
        />
        <KpiCard
          icon="AlertTriangle"
          label="Дефицит позиций"
          value={String(deficitCount)}
          sub="Требуют пополнения"
          color="bg-red-500"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="balance">
        <TabsList className="bg-white border">
          <TabsTrigger value="balance">Остатки</TabsTrigger>
          <TabsTrigger value="movement">Движение</TabsTrigger>
          <TabsTrigger value="analysis">Анализ</TabsTrigger>
          <TabsTrigger value="refrigerants">Хладагенты</TabsTrigger>
        </TabsList>

        {/* ── TAB: Остатки ─────────────────────────────────────────────────── */}
        <TabsContent value="balance">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap gap-2 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Icon
                    name="Search"
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    placeholder="Поиск по артикулу или названию..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as Category)}
                >
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Категория" />
                  </SelectTrigger>
                  <SelectContent>
                    {(["Все","Хладагенты","Фильтры","Запчасти","Расходники","Инструменты"] as Category[]).map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={warehouseFilter}
                  onValueChange={(v) => setWarehouseFilter(v as WarehouseFilter)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Склад" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Все">Все склады</SelectItem>
                    <SelectItem value="Центральный">Центральный</SelectItem>
                    <SelectItem value="Мобильные">Мобильные</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success("Остатки экспортированы")}
                >
                  <Icon name="FileDown" size={14} className="mr-1" />
                  Экспорт
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-2.5 font-medium text-gray-600">Артикул</th>
                      <th className="text-left px-4 py-2.5 font-medium text-gray-600">Наименование</th>
                      <th className="text-left px-4 py-2.5 font-medium text-gray-600">Категория</th>
                      <th className="text-left px-4 py-2.5 font-medium text-gray-600">Склад</th>
                      <th className="text-right px-4 py-2.5 font-medium text-gray-600">Кол-во</th>
                      <th className="text-right px-4 py-2.5 font-medium text-gray-600">Мин. остаток</th>
                      <th className="text-center px-4 py-2.5 font-medium text-gray-600">Статус</th>
                      <th className="text-right px-4 py-2.5 font-medium text-gray-600">Цена</th>
                      <th className="text-right px-4 py-2.5 font-medium text-gray-600">Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => {
                      const status = getStockStatus(item);
                      const isDeficit = status === "Дефицит";
                      return (
                        <tr
                          key={item.id}
                          className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                            isDeficit ? "bg-red-50" : ""
                          }`}
                        >
                          <td className="px-4 py-2.5 font-mono text-xs text-gray-500">
                            {item.article}
                          </td>
                          <td className="px-4 py-2.5 font-medium text-gray-900 max-w-[200px] truncate">
                            {item.name}
                          </td>
                          <td className="px-4 py-2.5 text-gray-600">{item.category}</td>
                          <td className="px-4 py-2.5 text-gray-600">{item.warehouse}</td>
                          <td className={`px-4 py-2.5 text-right font-medium ${isDeficit ? "text-red-700" : "text-gray-900"}`}>
                            {item.qty}
                          </td>
                          <td className="px-4 py-2.5 text-right text-gray-500">{item.minQty}</td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_BADGE[status]}`}>
                              {status}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right text-gray-700">
                            {formatRub(item.price)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-medium text-gray-900">
                            {formatRub(item.qty * item.price)}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredItems.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                          Позиции не найдены
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t-2 border-gray-200">
                      <td colSpan={7} className="px-4 py-2.5 font-medium text-gray-700">
                        Итого: {filteredItems.length} позиций
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-gray-900" colSpan={2}>
                        {formatRub(filteredItems.reduce((s, i) => s + i.qty * i.price, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB: Движение ────────────────────────────────────────────────── */}
        <TabsContent value="movement">
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Приход vs Расход за 30 дней (позиций)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={AREA_DATA} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={4} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="income"
                      name="Приход"
                      stroke="#10b981"
                      fill="url(#incomeGrad)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      name="Расход"
                      stroke="#f59e0b"
                      fill="url(#expenseGrad)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Последние движения</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success("Движения экспортированы")}
                >
                  <Icon name="FileDown" size={14} className="mr-1" />
                  Экспорт
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-2.5 font-medium text-gray-600">Дата</th>
                        <th className="text-left px-4 py-2.5 font-medium text-gray-600">Тип</th>
                        <th className="text-left px-4 py-2.5 font-medium text-gray-600">Наименование</th>
                        <th className="text-right px-4 py-2.5 font-medium text-gray-600">Кол-во</th>
                        <th className="text-left px-4 py-2.5 font-medium text-gray-600">Наряд / Поставщик</th>
                        <th className="text-left px-4 py-2.5 font-medium text-gray-600">Инженер / Склад</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOVEMENTS.map((m) => (
                        <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{m.date}</td>
                          <td className="px-4 py-2.5">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${MOVEMENT_BADGE[m.type]}`}>
                              {m.type}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-medium text-gray-900 max-w-[180px] truncate">{m.name}</td>
                          <td className="px-4 py-2.5 text-right text-gray-900 font-medium">
                            {m.qty} {m.unit}
                          </td>
                          <td className="px-4 py-2.5 text-blue-600 text-xs">{m.ref}</td>
                          <td className="px-4 py-2.5 text-gray-600">{m.engineer}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── TAB: Анализ ──────────────────────────────────────────────────── */}
        <TabsContent value="analysis">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Bar: top-10 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Топ-10 по расходу за месяц</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart
                      data={TOP_CONSUME}
                      layout="vertical"
                      margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
                      <Tooltip />
                      <Bar dataKey="qty" name="Расход" fill="#6366f1" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Pie: category breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Структура остатков по категориям</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={PIE_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {PIE_DATA.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatRub(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 mt-2 justify-center">
                    {PIE_DATA.map((d) => (
                      <span key={d.name} className="flex items-center gap-1 text-xs text-gray-600">
                        <span
                          className="inline-block w-3 h-3 rounded-sm"
                          style={{ background: d.color }}
                        />
                        {d.name}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ABC analysis */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">ABC-анализ</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success("ABC-анализ экспортирован")}
                >
                  <Icon name="FileDown" size={14} className="mr-1" />
                  Экспорт
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-2.5 font-medium text-gray-600">Группа</th>
                      <th className="text-right px-4 py-2.5 font-medium text-gray-600">Позиций</th>
                      <th className="text-right px-4 py-2.5 font-medium text-gray-600">Доля в стоимости</th>
                      <th className="text-right px-4 py-2.5 font-medium text-gray-600">Доля в расходе</th>
                      <th className="text-left px-4 py-2.5 font-medium text-gray-600">Рекомендация</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ABC_DATA.map((row) => {
                      const tips: Record<AbcGroup, string> = {
                        A: "Жёсткий контроль, страховой запас, частые заказы",
                        B: "Умеренный контроль, квартальные инвентаризации",
                        C: "Минимальный контроль, редкие закупки партиями",
                      };
                      return (
                        <tr key={row.group} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-sm font-bold ${ABC_BADGE[row.group]}`}>
                              {row.group}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-gray-900">{row.items}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Progress value={row.costPct} className="w-20 h-2" />
                              <span className="font-medium text-gray-900 w-10 text-right">{row.costPct}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Progress value={row.consumePct} className="w-20 h-2" />
                              <span className="font-medium text-gray-900 w-10 text-right">{row.consumePct}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-xs">{tips[row.group]}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── TAB: Хладагенты ──────────────────────────────────────────────── */}
        <TabsContent value="refrigerants">
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Учёт баллонов хладагентов</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success("Данные по хладагентам экспортированы")}
                >
                  <Icon name="FileDown" size={14} className="mr-1" />
                  Экспорт
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-2.5 font-medium text-gray-600">Тип</th>
                        <th className="text-left px-4 py-2.5 font-medium text-gray-600">Серийный номер</th>
                        <th className="text-right px-4 py-2.5 font-medium text-gray-600">Ёмкость, кг</th>
                        <th className="text-right px-4 py-2.5 font-medium text-gray-600">Остаток, кг</th>
                        <th className="text-left px-4 py-2.5 font-medium text-gray-600 w-48">% заполнения</th>
                        <th className="text-left px-4 py-2.5 font-medium text-gray-600">Склад</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CYLINDERS.map((c) => {
                        const pct = Math.round((c.remainKg / c.capacityKg) * 100);
                        const progressColor =
                          pct <= 20
                            ? "text-red-600"
                            : pct <= 50
                            ? "text-amber-600"
                            : "text-emerald-600";
                        return (
                          <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-2.5">
                              <Badge variant="outline" className="font-mono text-xs">
                                {c.type}
                              </Badge>
                            </td>
                            <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{c.serial}</td>
                            <td className="px-4 py-2.5 text-right text-gray-700">{c.capacityKg.toFixed(1)}</td>
                            <td className={`px-4 py-2.5 text-right font-medium ${progressColor}`}>
                              {c.remainKg.toFixed(1)}
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <Progress value={pct} className="h-2 flex-1" />
                                <span className={`text-xs font-medium w-9 text-right ${progressColor}`}>
                                  {pct}%
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-gray-600">{c.warehouse}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Refrigerant totals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Итоги по типам хладагентов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {refrigerantTotals.map((r) => {
                    const pct = Math.round((r.remain / r.capacity) * 100);
                    return (
                      <div key={r.type} className="bg-gray-50 rounded-lg p-3 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm font-bold text-gray-900">{r.type}</span>
                          <span className="text-xs text-gray-500">{pct}%</span>
                        </div>
                        <Progress value={pct} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{r.remain.toFixed(1)} кг</span>
                          <span>из {r.capacity.toFixed(1)} кг</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
