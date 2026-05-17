import React, { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

type PayStatus = "Начислено" | "Выплачено" | "Ожидание";

interface EngineerRow {
  id: number;
  name: string;
  orders: number;
  piecework: number;
  fuel: number;
  bonuses: number;
  total: number;
  status: PayStatus;
}

interface OfficeRow {
  id: number;
  name: string;
  position: string;
  salary: number;
  bonusPct: number;
  bonusAmt: number;
  total: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (v: number): string =>
  v.toLocaleString("ru-RU", { maximumFractionDigits: 0 }) + " ₽";

const fmtShort = (v: number): string => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}М`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}К`;
  return String(v);
};

const statusColor = (s: PayStatus): "default" | "secondary" | "destructive" | "outline" => {
  if (s === "Выплачено") return "default";
  if (s === "Начислено") return "secondary";
  return "outline";
};

// ─── Static data ─────────────────────────────────────────────────────────────

const PERIODS = [
  { value: "2026-05", label: "Май 2026" },
  { value: "2026-04", label: "Апрель 2026" },
  { value: "2026-03", label: "Март 2026" },
  { value: "2026-02", label: "Февраль 2026" },
  { value: "2026-01", label: "Январь 2026" },
  { value: "2025-12", label: "Декабрь 2025" },
];

const ENGINEERS: EngineerRow[] = [
  { id: 1,  name: "Иванов А.С.",     orders: 28, piecework: 42_800, fuel: 6_240, bonuses: 5_000, total: 54_040, status: "Начислено" },
  { id: 2,  name: "Петров Д.В.",     orders: 24, piecework: 36_600, fuel: 5_100, bonuses: 3_500, total: 45_200, status: "Выплачено" },
  { id: 3,  name: "Смирнов К.Е.",    orders: 31, piecework: 47_200, fuel: 7_020, bonuses: 8_000, total: 62_220, status: "Начислено" },
  { id: 4,  name: "Козлов Р.И.",     orders: 19, piecework: 28_500, fuel: 4_380, bonuses: 2_000, total: 34_880, status: "Ожидание" },
  { id: 5,  name: "Новиков П.А.",    orders: 22, piecework: 33_400, fuel: 5_760, bonuses: 3_000, total: 42_160, status: "Выплачено" },
  { id: 6,  name: "Морозов Е.Н.",    orders: 26, piecework: 39_100, fuel: 6_480, bonuses: 4_500, total: 50_080, status: "Начислено" },
  { id: 7,  name: "Волков С.О.",     orders: 17, piecework: 25_500, fuel: 3_900, bonuses: 1_500, total: 30_900, status: "Ожидание" },
  { id: 8,  name: "Алексеев Г.М.",   orders: 33, piecework: 50_400, fuel: 7_560, bonuses: 9_000, total: 66_960, status: "Начислено" },
  { id: 9,  name: "Лебедев Т.Б.",    orders: 21, piecework: 31_800, fuel: 5_040, bonuses: 2_500, total: 39_340, status: "Выплачено" },
  { id: 10, name: "Семёнов В.К.",    orders: 29, piecework: 43_900, fuel: 6_660, bonuses: 6_000, total: 56_560, status: "Начислено" },
  { id: 11, name: "Егоров Н.Д.",     orders: 15, piecework: 22_500, fuel: 3_420, bonuses: 1_000, total: 26_920, status: "Ожидание" },
  { id: 12, name: "Фёдоров Л.С.",    orders: 25, piecework: 37_800, fuel: 5_820, bonuses: 4_000, total: 47_620, status: "Выплачено" },
];

const OFFICE: OfficeRow[] = [
  { id: 1, name: "Захарова М.В.",    position: "Руководитель",         salary: 85_000, bonusPct: 12, bonusAmt: 10_200, total: 95_200 },
  { id: 2, name: "Орлова Е.Н.",      position: "Старший менеджер",     salary: 55_000, bonusPct: 18, bonusAmt: 9_900,  total: 64_900 },
  { id: 3, name: "Степанов И.А.",    position: "Менеджер по продажам", salary: 45_000, bonusPct: 21, bonusAmt: 9_450,  total: 54_450 },
  { id: 4, name: "Крылова Т.П.",     position: "Менеджер по продажам", salary: 45_000, bonusPct: 15, bonusAmt: 6_750,  total: 51_750 },
  { id: 5, name: "Борисов А.К.",     position: "Диспетчер (ст.)",      salary: 40_000, bonusPct: 8,  bonusAmt: 3_200,  total: 43_200 },
  { id: 6, name: "Никитина Л.С.",    position: "Диспетчер",            salary: 35_000, bonusPct: 7,  bonusAmt: 2_450,  total: 37_450 },
  { id: 7, name: "Макарова О.Д.",    position: "Диспетчер",            salary: 35_000, bonusPct: 6,  bonusAmt: 2_100,  total: 37_100 },
  { id: 8, name: "Тихонов Р.В.",     position: "Бухгалтер",            salary: 50_000, bonusPct: 5,  bonusAmt: 2_500,  total: 52_500 },
];

const ENGINEER_CHART_DATA = ENGINEERS.map((e) => ({
  name: e.name.split(" ")[0],
  Сдельные: e.piecework,
  ГСМ: e.fuel,
  Надбавки: e.bonuses,
}));

const PIE_DATA = [
  { name: "Инженеры", value: 556_880, color: "#3b82f6" },
  { name: "Офис",     value: 436_550, color: "#8b5cf6" },
  { name: "Подрядчики", value: 124_000, color: "#f59e0b" },
];

const LINE_DATA = [
  { month: "Дек 2025", fot: 1_024_000 },
  { month: "Янв 2026", fot: 1_088_000 },
  { month: "Фев 2026", fot: 1_052_000 },
  { month: "Мар 2026", fot: 1_143_000 },
  { month: "Апр 2026", fot: 1_098_000 },
  { month: "Май 2026", fot: 1_117_430 },
];

// ─── KPI ─────────────────────────────────────────────────────────────────────

const totalFot    = PIE_DATA.reduce((s, d) => s + d.value, 0);
const totalPiece  = ENGINEERS.reduce((s, e) => s + e.piecework, 0);
const totalFuel   = ENGINEERS.reduce((s, e) => s + e.fuel, 0);
const avgSalary   = Math.round(
  [...ENGINEERS.map((e) => e.total), ...OFFICE.map((o) => o.total)].reduce(
    (s, v) => s + v, 0
  ) / (ENGINEERS.length + OFFICE.length)
);

// ─── Component ───────────────────────────────────────────────────────────────

const PayrollDashboardFull: React.FC = () => {
  const [period, setPeriod] = useState("2026-05");
  const [activeTab, setActiveTab] = useState("engineers");
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [periodClosed, setPeriodClosed] = useState(false);

  const periodLabel = PERIODS.find((p) => p.value === period)?.label ?? period;

  const handleSlip = (name: string) => {
    toast.success(`Листок открыт — ${name}`);
  };

  const handleExport1C = () => {
    toast.success("Данные выгружены в 1С:УНФ");
  };

  const handleClosePeriod = () => {
    setPeriodClosed(true);
    setCloseDialogOpen(false);
    toast.success(`Период «${periodLabel}» закрыт. Данные зафиксированы.`);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Зарплата / Расчётный период
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Начисление, контроль и закрытие расчётного периода
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleExport1C}>
            <Icon name="Upload" className="w-4 h-4 mr-2" />
            Выгрузить в 1С
          </Button>

          <Button
            variant={periodClosed ? "secondary" : "default"}
            disabled={periodClosed}
            onClick={() => setCloseDialogOpen(true)}
          >
            <Icon name="Lock" className="w-4 h-4 mr-2" />
            {periodClosed ? "Период закрыт" : "Закрыть период"}
          </Button>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500 mb-1">ФОТ всего</p>
            <p className="text-2xl font-bold text-gray-900">{fmt(totalFot)}</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
              <Icon name="TrendingUp" className="w-3 h-3" />
              <span>+1.8% к апрелю</span>
            </div>
            <Progress value={68} className="mt-3 h-1.5" />
            <p className="text-[10px] text-gray-400 mt-1">68% от годового плана</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500 mb-1">Сдельные выплаты</p>
            <p className="text-2xl font-bold text-blue-700">{fmt(totalPiece)}</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-blue-500">
              <Icon name="Wrench" className="w-3 h-3" />
              <span>289 нарядов / 12 инженеров</span>
            </div>
            <Progress value={54} className="mt-3 h-1.5" />
            <p className="text-[10px] text-gray-400 mt-1">49.8% от ФОТ</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500 mb-1">Компенсации ГСМ</p>
            <p className="text-2xl font-bold text-amber-700">{fmt(totalFuel)}</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
              <Icon name="Car" className="w-3 h-3" />
              <span>≈ 5 380 км совокупно</span>
            </div>
            <Progress value={32} className="mt-3 h-1.5" />
            <p className="text-[10px] text-gray-400 mt-1">6.1% от ФОТ</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500 mb-1">Средняя зарплата</p>
            <p className="text-2xl font-bold text-purple-700">{fmt(avgSalary)}</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-purple-500">
              <Icon name="Users" className="w-3 h-3" />
              <span>20 сотрудников</span>
            </div>
            <Progress value={74} className="mt-3 h-1.5" />
            <p className="text-[10px] text-gray-400 mt-1">+4.2% за квартал</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Tabs ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="engineers">
            <Icon name="HardHat" className="w-4 h-4 mr-1.5" />
            Инженеры
          </TabsTrigger>
          <TabsTrigger value="office">
            <Icon name="Briefcase" className="w-4 h-4 mr-1.5" />
            Офис
          </TabsTrigger>
          <TabsTrigger value="summary">
            <Icon name="PieChart" className="w-4 h-4 mr-1.5" />
            Сводка
          </TabsTrigger>
        </TabsList>

        {/* ══ Tab: Инженеры ══ */}
        <TabsContent value="engineers" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Начисления инженеров — {periodLabel}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Инженер</TableHead>
                    <TableHead className="text-right">Нарядов</TableHead>
                    <TableHead className="text-right">Сдельные</TableHead>
                    <TableHead className="text-right">ГСМ</TableHead>
                    <TableHead className="text-right">Надбавки</TableHead>
                    <TableHead className="text-right font-semibold">Итого</TableHead>
                    <TableHead className="text-center">Статус</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ENGINEERS.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.name}</TableCell>
                      <TableCell className="text-right">{e.orders}</TableCell>
                      <TableCell className="text-right text-blue-700">{fmt(e.piecework)}</TableCell>
                      <TableCell className="text-right text-amber-700">{fmt(e.fuel)}</TableCell>
                      <TableCell className="text-right text-emerald-700">{fmt(e.bonuses)}</TableCell>
                      <TableCell className="text-right font-semibold">{fmt(e.total)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={statusColor(e.status)} className="text-xs">
                          {e.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => handleSlip(e.name)}
                        >
                          <Icon name="FileText" className="w-3 h-3 mr-1" />
                          Листок
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Stacked bar chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Структура выплат по инженерам</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={ENGINEER_CHART_DATA}
                  margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v: number) => fmt(v)}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Сдельные" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="ГСМ"      stackId="a" fill="#f59e0b" />
                  <Bar dataKey="Надбавки" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══ Tab: Офис ══ */}
        <TabsContent value="office" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Начисления офисных сотрудников — {periodLabel}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Сотрудник</TableHead>
                    <TableHead>Должность</TableHead>
                    <TableHead className="text-right">Оклад</TableHead>
                    <TableHead className="text-right">Бонус %</TableHead>
                    <TableHead className="text-right">Бонус ₽</TableHead>
                    <TableHead className="text-right font-semibold">Итого</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {OFFICE.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.name}</TableCell>
                      <TableCell className="text-gray-600 text-sm">{o.position}</TableCell>
                      <TableCell className="text-right">{fmt(o.salary)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="text-xs">
                          {o.bonusPct}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-emerald-700">{fmt(o.bonusAmt)}</TableCell>
                      <TableCell className="text-right font-semibold">{fmt(o.total)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => handleSlip(o.name)}
                        >
                          <Icon name="FileText" className="w-3 h-3 mr-1" />
                          Листок
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Summary bar for office */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-5 text-center">
                <p className="text-xs text-gray-500">Суммарный оклад</p>
                <p className="text-xl font-bold mt-1">
                  {fmt(OFFICE.reduce((s, o) => s + o.salary, 0))}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 text-center">
                <p className="text-xs text-gray-500">Суммарный бонус</p>
                <p className="text-xl font-bold text-emerald-700 mt-1">
                  {fmt(OFFICE.reduce((s, o) => s + o.bonusAmt, 0))}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 text-center">
                <p className="text-xs text-gray-500">Итого офис</p>
                <p className="text-xl font-bold text-purple-700 mt-1">
                  {fmt(OFFICE.reduce((s, o) => s + o.total, 0))}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ══ Tab: Сводка ══ */}
        <TabsContent value="summary" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Pie chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Структура ФОТ</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={PIE_DATA}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={true}
                    >
                      {PIE_DATA.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  {PIE_DATA.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ background: d.color }}
                      />
                      {d.name}: {fmt(d.value)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Line chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Динамика ФОТ — 6 месяцев</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart
                    data={LINE_DATA}
                    margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ fontSize: 12 }} />
                    <Line
                      type="monotone"
                      dataKey="fot"
                      name="ФОТ"
                      stroke="#8b5cf6"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Действия с периодом</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleExport1C}>
                <Icon name="Upload" className="w-4 h-4 mr-2" />
                Выгрузить в 1С
              </Button>
              <Button variant="outline" onClick={() => toast.success("Сводный отчёт сформирован")}>
                <Icon name="FileDown" className="w-4 h-4 mr-2" />
                Скачать сводный отчёт
              </Button>
              <Button variant="outline" onClick={() => toast.success("Расчётные листки отправлены сотрудникам")}>
                <Icon name="Send" className="w-4 h-4 mr-2" />
                Разослать листки
              </Button>
              <Button
                variant={periodClosed ? "secondary" : "destructive"}
                disabled={periodClosed}
                onClick={() => setCloseDialogOpen(true)}
              >
                <Icon name="Lock" className="w-4 h-4 mr-2" />
                {periodClosed ? "Период закрыт" : "Закрыть период"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Close period dialog ── */}
      <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Закрыть расчётный период?</DialogTitle>
            <DialogDescription>
              Вы собираетесь закрыть период <strong>{periodLabel}</strong>.
              После закрытия данные будут зафиксированы и изменить их можно будет
              только с разрешения руководителя.
              <br /><br />
              Общий ФОТ к выплате: <strong>{fmt(totalFot)}</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCloseDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleClosePeriod}>
              <Icon name="Lock" className="w-4 h-4 mr-2" />
              Закрыть период
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PayrollDashboardFull;
