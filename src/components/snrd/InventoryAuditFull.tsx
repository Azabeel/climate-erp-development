import React, { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

type AuditStatus = "in_progress" | "completed";
type RowStatus = "match" | "surplus" | "shortage";
type WarehouseId = "central" | "mobile_ivanov" | "mobile_petrov";

interface AuditItem {
  id: string;
  article: string;
  name: string;
  category: string;
  accountQty: number;
  actualQty: number;
  price: number;
}

// ─── Static data ─────────────────────────────────────────────────────────────

const INITIAL_ITEMS: AuditItem[] = [
  { id: "1",  article: "FLT-001", name: "Фильтр осушитель R-410A",       category: "ЗИП",         accountQty: 15, actualQty: 15, price: 320  },
  { id: "2",  article: "FLT-002", name: "Фильтр сетчатый 1/2\"",         category: "ЗИП",         accountQty: 30, actualQty: 27, price: 180  },
  { id: "3",  article: "CAP-101", name: "Конденсатор 35мкФ",              category: "ЗИП",         accountQty: 12, actualQty: 14, price: 450  },
  { id: "4",  article: "CAP-102", name: "Конденсатор 50мкФ",              category: "ЗИП",         accountQty: 8,  actualQty: 8,  price: 520  },
  { id: "5",  article: "REF-410", name: "Хладагент R-410A, 11.3 кг",     category: "Хладагенты",  accountQty: 6,  actualQty: 5,  price: 4800 },
  { id: "6",  article: "REF-22",  name: "Хладагент R-22, 13.6 кг",       category: "Хладагенты",  accountQty: 3,  actualQty: 3,  price: 5200 },
  { id: "7",  article: "REF-32",  name: "Хладагент R-32, 10 кг",         category: "Хладагенты",  accountQty: 4,  actualQty: 5,  price: 4200 },
  { id: "8",  article: "TLS-001", name: "Манометрический коллектор",      category: "Инструменты", accountQty: 3,  actualQty: 3,  price: 3500 },
  { id: "9",  article: "TLS-002", name: "Детектор утечки газа",           category: "Инструменты", accountQty: 2,  actualQty: 1,  price: 8900 },
  { id: "10", article: "TLS-003", name: "Термометр инфракрасный",         category: "Инструменты", accountQty: 4,  actualQty: 4,  price: 1200 },
  { id: "11", article: "CNS-001", name: "Медная трубка 1/4\", 15м",       category: "Расходники",  accountQty: 10, actualQty: 12, price: 1800 },
  { id: "12", article: "CNS-002", name: "Теплоизоляция 13мм, 2м",        category: "Расходники",  accountQty: 50, actualQty: 48, price: 95   },
  { id: "13", article: "CNS-003", name: "Монтажная лента 50мм",           category: "Расходники",  accountQty: 20, actualQty: 20, price: 220  },
  { id: "14", article: "CNS-004", name: "Дренажная трубка 16мм, 25м",     category: "Расходники",  accountQty: 8,  actualQty: 8,  price: 480  },
  { id: "15", article: "FLT-003", name: "Плата управления Daikin",        category: "ЗИП",         accountQty: 2,  actualQty: 2,  price: 7200 },
  { id: "16", article: "FLT-004", name: "Термистор наружного блока",      category: "ЗИП",         accountQty: 10, actualQty: 8,  price: 650  },
  { id: "17", article: "TLS-004", name: "Вакуумный насос 2-ступенч.",     category: "Инструменты", accountQty: 2,  actualQty: 2,  price: 12500},
  { id: "18", article: "CNS-005", name: "Межблочный кабель 4x2.5, 10м",  category: "Расходники",  accountQty: 15, actualQty: 16, price: 340  },
  { id: "19", article: "FLT-005", name: "Пусковое реле компрессора",      category: "ЗИП",         accountQty: 6,  actualQty: 6,  price: 890  },
  { id: "20", article: "REF-407", name: "Хладагент R-407C, 11.3 кг",     category: "Хладагенты",  accountQty: 2,  actualQty: 2,  price: 4600 },
];

const WAREHOUSE_LABELS: Record<WarehouseId, string> = {
  central:       "Центральный склад",
  mobile_ivanov: "Мобильный (Иванов А.В.)",
  mobile_petrov: "Мобильный (Петров С.И.)",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (v: number): string =>
  v.toLocaleString("ru-RU", { minimumFractionDigits: 0 });

const fmtCur = (v: number): string =>
  v.toLocaleString("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 });

const rowStatus = (account: number, actual: number): RowStatus => {
  if (actual > account) return "surplus";
  if (actual < account) return "shortage";
  return "match";
};

const diffAmount = (item: AuditItem): number =>
  (item.actualQty - item.accountQty) * item.price;

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: string;
  icon: string;
  iconColor: string;
  bgColor: string;
  sub?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, iconColor, bgColor, sub }) => (
  <Card>
    <CardContent className="pt-5 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon name={icon} size={22} className={iconColor} />
        </div>
      </div>
    </CardContent>
  </Card>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const InventoryAuditFull: React.FC = () => {
  const [warehouse, setWarehouse] = useState<WarehouseId>("central");
  const [auditDate] = useState("17.05.2026");
  const [status, setStatus] = useState<AuditStatus>("in_progress");
  const [items, setItems] = useState<AuditItem[]>(INITIAL_ITEMS);
  const [confirmDialog, setConfirmDialog] = useState<"start" | "finish" | null>(null);

  // ── Computed ────────────────────────────────────────────────────────────────

  const totalItems = items.length;

  const discrepancies = items.filter((i) => rowStatus(i.accountQty, i.actualQty) !== "match");

  const surplusTotal = items
    .filter((i) => rowStatus(i.accountQty, i.actualQty) === "surplus")
    .reduce((acc, i) => acc + diffAmount(i), 0);

  const shortageTotal = items
    .filter((i) => rowStatus(i.accountQty, i.actualQty) === "shortage")
    .reduce((acc, i) => acc + Math.abs(diffAmount(i)), 0);

  const progressPct = Math.round(
    (items.filter((i) => i.actualQty !== null).length / totalItems) * 100
  );

  // ── Chart data ──────────────────────────────────────────────────────────────

  const categories = ["ЗИП", "Хладагенты", "Инструменты", "Расходники"];

  const chartData = categories.map((cat) => {
    const catItems = items.filter((i) => i.category === cat);
    const surplus = catItems
      .filter((i) => rowStatus(i.accountQty, i.actualQty) === "surplus")
      .reduce((acc, i) => acc + diffAmount(i), 0);
    const shortage = catItems
      .filter((i) => rowStatus(i.accountQty, i.actualQty) === "shortage")
      .reduce((acc, i) => acc + diffAmount(i), 0);
    return { cat, surplus, shortage };
  });

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleActualQtyChange = (id: string, value: string) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 0) return;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, actualQty: parsed } : item))
    );
  };

  const handleStartAudit = () => {
    setConfirmDialog(null);
    setStatus("in_progress");
    toast.success("Инвентаризация начата", {
      description: `${WAREHOUSE_LABELS[warehouse]} — ${auditDate}`,
    });
  };

  const handleFinishAudit = () => {
    setConfirmDialog(null);
    setStatus("completed");
    toast.success("Инвентаризация завершена", {
      description: `Расхождений: ${discrepancies.length} позиций`,
    });
  };

  const handleExportAct = () => {
    toast.info("Акт инвентаризации формируется...", {
      description: "Файл будет готов через несколько секунд",
    });
  };

  const handleWriteOffAct = () => {
    const shortage = items.filter(
      (i) => rowStatus(i.accountQty, i.actualQty) === "shortage"
    );
    toast.success(`Акт списания создан`, {
      description: `${shortage.length} позиций на сумму ${fmtCur(shortageTotal)}`,
    });
  };

  // ── Row helpers ─────────────────────────────────────────────────────────────

  const rowBg = (status: RowStatus): string => {
    if (status === "surplus")  return "bg-green-50";
    if (status === "shortage") return "bg-red-50";
    return "";
  };

  const diffColor = (status: RowStatus): string => {
    if (status === "surplus")  return "text-green-600 font-semibold";
    if (status === "shortage") return "text-red-600 font-semibold";
    return "text-gray-400";
  };

  const statusBadge = (s: RowStatus) => {
    if (s === "surplus")  return <Badge className="bg-green-100 text-green-700 border-0 text-xs">Излишек</Badge>;
    if (s === "shortage") return <Badge className="bg-red-100 text-red-700 border-0 text-xs">Недостача</Badge>;
    return <Badge className="bg-gray-100 text-gray-500 border-0 text-xs">Совпадает</Badge>;
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Icon name="ClipboardList" size={24} className="text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Инвентаризация склада</h1>
          <Badge
            className={
              status === "completed"
                ? "bg-green-100 text-green-700 border-0 ml-2"
                : "bg-amber-100 text-amber-700 border-0 ml-2"
            }
          >
            {status === "completed" ? "Завершена" : "В процессе"}
          </Badge>
        </div>
        <p className="text-sm text-gray-500 ml-8">Сверка фактических остатков с учётными данными</p>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Icon name="Warehouse" size={16} className="text-gray-400" />
              <span className="text-sm text-gray-600 whitespace-nowrap">Склад:</span>
              <Select value={warehouse} onValueChange={(v) => setWarehouse(v as WarehouseId)}>
                <SelectTrigger className="w-52 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="central">Центральный склад</SelectItem>
                  <SelectItem value="mobile_ivanov">Мобильный (Иванов А.В.)</SelectItem>
                  <SelectItem value="mobile_petrov">Мобильный (Петров С.И.)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Icon name="Calendar" size={16} className="text-gray-400" />
              <span className="text-sm text-gray-600 whitespace-nowrap">Дата:</span>
              <span className="text-sm font-medium text-gray-800">{auditDate}</span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <div className="flex items-center gap-2 mr-2">
                <span className="text-xs text-gray-500">Прогресс:</span>
                <Progress value={progressPct} className="w-24 h-2" />
                <span className="text-xs font-medium text-gray-600">{progressPct}%</span>
              </div>

              {status === "in_progress" ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmDialog("start")}
                  className="gap-1"
                >
                  <Icon name="Play" size={14} />
                  Начать инвентаризацию
                </Button>
              ) : null}

              <Button
                size="sm"
                onClick={() => setConfirmDialog("finish")}
                className="gap-1 bg-blue-600 hover:bg-blue-700"
                disabled={status === "completed"}
              >
                <Icon name="CheckCircle" size={14} />
                Завершить инвентаризацию
              </Button>

              <Button size="sm" variant="outline" onClick={handleExportAct} className="gap-1">
                <Icon name="Download" size={14} />
                Экспорт акта
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleWriteOffAct}
                className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
              >
                <Icon name="FileX" size={14} />
                Акт списания
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          title="Позиций всего"
          value={String(totalItems)}
          icon="Package"
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
          sub="номенклатурных позиций"
        />
        <KpiCard
          title="Расхождений найдено"
          value={String(discrepancies.length)}
          icon="AlertTriangle"
          iconColor="text-amber-600"
          bgColor="bg-amber-50"
          sub={`${Math.round((discrepancies.length / totalItems) * 100)}% от общего числа`}
        />
        <KpiCard
          title="Излишек"
          value={fmtCur(surplusTotal)}
          icon="TrendingUp"
          iconColor="text-green-600"
          bgColor="bg-green-50"
          sub="фактически больше учётного"
        />
        <KpiCard
          title="Недостача"
          value={fmtCur(shortageTotal)}
          icon="TrendingDown"
          iconColor="text-red-600"
          bgColor="bg-red-50"
          sub="фактически меньше учётного"
        />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="BarChart3" size={18} className="text-blue-600" />
            Расхождения по категориям
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="cat" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}К`} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  fmtCur(Math.abs(value)),
                  name === "surplus" ? "Излишек" : "Недостача",
                ]}
              />
              <Bar dataKey="surplus" name="surplus" radius={[3, 3, 0, 0]}>
                {chartData.map((_, idx) => (
                  <Cell key={idx} fill="#22c55e" />
                ))}
              </Bar>
              <Bar dataKey="shortage" name="shortage" radius={[3, 3, 0, 0]}>
                {chartData.map((_, idx) => (
                  <Cell key={idx} fill="#ef4444" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="flex items-center gap-6 mt-2 justify-center">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-green-500 inline-block" />
              <span className="text-xs text-gray-500">Излишек</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" />
              <span className="text-xs text-gray-500">Недостача</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="Table" size={18} className="text-blue-600" />
            Позиции инвентаризации
            <Badge className="bg-gray-100 text-gray-600 border-0 font-normal ml-1">
              {totalItems} позиций
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Артикул</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Наименование</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Категория</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Учётное</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Фактическое</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">Расхожд.</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Цена</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Сумма расх.</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => {
                  const rs = rowStatus(item.accountQty, item.actualQty);
                  const diff = item.actualQty - item.accountQty;
                  const amount = diffAmount(item);

                  return (
                    <tr key={item.id} className={`${rowBg(rs)} hover:brightness-95 transition-all`}>
                      <td className="px-4 py-2.5 text-gray-500 font-mono text-xs">{item.article}</td>
                      <td className="px-4 py-2.5 text-gray-800 font-medium">{item.name}</td>
                      <td className="px-4 py-2.5">
                        <Badge className="bg-white border border-gray-200 text-gray-600 text-xs font-normal">
                          {item.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-700">{fmt(item.accountQty)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <Input
                          type="number"
                          min={0}
                          value={item.actualQty}
                          onChange={(e) => handleActualQtyChange(item.id, e.target.value)}
                          className="w-20 h-7 text-right text-sm ml-auto"
                          disabled={status === "completed"}
                        />
                      </td>
                      <td className={`px-4 py-2.5 text-right ${diffColor(rs)}`}>
                        {diff === 0 ? "—" : diff > 0 ? `+${diff}` : diff}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-600">{fmtCur(item.price)}</td>
                      <td className={`px-4 py-2.5 text-right ${diffColor(rs)}`}>
                        {amount === 0 ? "—" : amount > 0 ? `+${fmtCur(amount)}` : fmtCur(amount)}
                      </td>
                      <td className="px-4 py-2.5 text-center">{statusBadge(rs)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-300 font-semibold">
                  <td colSpan={7} className="px-4 py-3 text-gray-700">Итого расхождений:</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-green-600">+{fmtCur(surplusTotal)}</span>
                    {" / "}
                    <span className="text-red-600">-{fmtCur(shortageTotal)}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs">
                    {discrepancies.length} расхожд.
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Confirm: Start */}
      <Dialog open={confirmDialog === "start"} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Play" size={18} className="text-blue-600" />
              Начать инвентаризацию
            </DialogTitle>
            <DialogDescription>
              Будет создана новая инвентаризация для склада{" "}
              <strong>{WAREHOUSE_LABELS[warehouse]}</strong> на дату {auditDate}.
              Все фактические значения будут доступны для редактирования.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmDialog(null)}>
              Отмена
            </Button>
            <Button size="sm" onClick={handleStartAudit} className="bg-blue-600 hover:bg-blue-700">
              Начать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm: Finish */}
      <Dialog open={confirmDialog === "finish"} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="CheckCircle" size={18} className="text-green-600" />
              Завершить инвентаризацию
            </DialogTitle>
            <DialogDescription>
              После завершения редактирование фактических остатков будет недоступно.
              Обнаружено расхождений: <strong>{discrepancies.length}</strong> позиций.
              Сумма недостачи: <strong>{fmtCur(shortageTotal)}</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmDialog(null)}>
              Отмена
            </Button>
            <Button
              size="sm"
              onClick={handleFinishAudit}
              className="bg-green-600 hover:bg-green-700"
            >
              Завершить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryAuditFull;
