import React, { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

type CompStatus = "К выплате" | "Выплачено" | "На проверке";

interface CompRow {
  id: number;
  engineer: string;
  daysField: number;
  kmGps: number;
  kmClaimed: number;
  fuelL: number;
  fuelCost: number;
  status: CompStatus;
}

interface RoutePoint {
  label: string;
  x: number;
  y: number;
  order: number;
}

interface RouteRow {
  id: number;
  engineer: string;
  start: string;
  end: string;
  km: number;
  durationMin: number;
  avgSpeedKmh: number;
  orders: number;
  color: string;
  points: RoutePoint[];
}

interface CarAvgRow {
  make: string;
  avgL100: number;
  count: number;
  totalKm: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (v: number): string =>
  v.toLocaleString("ru-RU", { maximumFractionDigits: 0 });

const kmDiff = (gps: number, claimed: number): number =>
  claimed === 0 ? 0 : Math.abs((claimed - gps) / gps) * 100;

const statusBadge = (status: CompStatus) => {
  if (status === "Выплачено")
    return <Badge className="bg-green-100 text-green-700 border-0">{status}</Badge>;
  if (status === "На проверке")
    return <Badge className="bg-yellow-100 text-yellow-700 border-0">{status}</Badge>;
  return <Badge className="bg-blue-100 text-blue-700 border-0">{status}</Badge>;
};

// ─── Static data ─────────────────────────────────────────────────────────────

const COMP_ROWS: CompRow[] = [
  { id: 1,  engineer: "Петров А.В.",    daysField: 18, kmGps: 1840, kmClaimed: 1900, fuelL: 184, fuelCost: 12972, status: "К выплате" },
  { id: 2,  engineer: "Смирнов Д.Н.",   daysField: 20, kmGps: 2210, kmClaimed: 2600, fuelL: 221, fuelCost: 15584, status: "На проверке" },
  { id: 3,  engineer: "Козлов И.С.",    daysField: 16, kmGps: 1520, kmClaimed: 1540, fuelL: 152, fuelCost: 10716, status: "Выплачено" },
  { id: 4,  engineer: "Новиков Е.Р.",   daysField: 19, kmGps: 2050, kmClaimed: 2080, fuelL: 205, fuelCost: 14452, status: "К выплате" },
  { id: 5,  engineer: "Фёдоров О.П.",   daysField: 15, kmGps: 1380, kmClaimed: 1650, fuelL: 138, fuelCost: 9730, status: "На проверке" },
  { id: 6,  engineer: "Морозов С.Т.",   daysField: 21, kmGps: 2340, kmClaimed: 2360, fuelL: 234, fuelCost: 16497, status: "Выплачено" },
  { id: 7,  engineer: "Волков В.К.",    daysField: 17, kmGps: 1690, kmClaimed: 1710, fuelL: 169, fuelCost: 11913, status: "К выплате" },
  { id: 8,  engineer: "Алексеев М.Ю.", daysField: 18, kmGps: 1950, kmClaimed: 1980, fuelL: 195, fuelCost: 13748, status: "Выплачено" },
  { id: 9,  engineer: "Лебедев Р.И.",   daysField: 14, kmGps: 1280, kmClaimed: 1300, fuelL: 128, fuelCost: 9024, status: "К выплате" },
  { id: 10, engineer: "Семёнов А.Г.",   daysField: 20, kmGps: 2130, kmClaimed: 2150, fuelL: 213, fuelCost: 15017, status: "Выплачено" },
  { id: 11, engineer: "Егоров Н.В.",    daysField: 13, kmGps: 1140, kmClaimed: 1360, fuelL: 114, fuelCost: 8036, status: "На проверке" },
  { id: 12, engineer: "Павлов Б.О.",    daysField: 22, kmGps: 2480, kmClaimed: 2510, fuelL: 248, fuelCost: 17488, status: "Выплачено" },
  { id: 13, engineer: "Степанов К.Е.",  daysField: 16, kmGps: 1600, kmClaimed: 1630, fuelL: 160, fuelCost: 11280, status: "К выплате" },
  { id: 14, engineer: "Орлов Г.Д.",     daysField: 18, kmGps: 1870, kmClaimed: 1890, fuelL: 187, fuelCost: 13183, status: "Выплачено" },
  { id: 15, engineer: "Виноградов Т.Л.",daysField: 19, kmGps: 2000, kmClaimed: 2030, fuelL: 200, fuelCost: 14100, status: "К выплате" },
];

const DAILY_FUEL_DATA = [
  { day: "1",  liters: 58 }, { day: "2",  liters: 62 }, { day: "3",  liters: 55 },
  { day: "4",  liters: 71 }, { day: "5",  liters: 68 }, { day: "6",  liters: 49 },
  { day: "7",  liters: 44 }, { day: "8",  liters: 73 }, { day: "9",  liters: 80 },
  { day: "10", liters: 77 }, { day: "11", liters: 65 }, { day: "12", liters: 60 },
  { day: "13", liters: 55 }, { day: "14", liters: 48 }, { day: "15", liters: 82 },
  { day: "16", liters: 78 }, { day: "17", liters: 69 }, { day: "18", liters: 74 },
  { day: "19", liters: 61 }, { day: "20", liters: 56 }, { day: "21", liters: 50 },
  { day: "22", liters: 86 }, { day: "23", liters: 90 }, { day: "24", liters: 84 },
  { day: "25", liters: 79 }, { day: "26", liters: 70 }, { day: "27", liters: 63 },
  { day: "28", liters: 58 },
];

const ROUTE_ROWS: RouteRow[] = [
  {
    id: 1, engineer: "Петров А.В.", start: "Офис (Ленинский пр.)", end: "ТЦ «Галерея»",
    km: 47, durationMin: 194, avgSpeedKmh: 29, orders: 5, color: "#3b82f6",
    points: [
      { label: "А", x: 40,  y: 250, order: 1 },
      { label: "Б", x: 130, y: 160, order: 2 },
      { label: "В", x: 230, y: 200, order: 3 },
      { label: "Г", x: 310, y: 100, order: 4 },
      { label: "Д", x: 370, y: 60,  order: 5 },
    ],
  },
  {
    id: 2, engineer: "Смирнов Д.Н.", start: "Офис (Ленинский пр.)", end: "Пулково",
    km: 63, durationMin: 242, avgSpeedKmh: 26, orders: 7, color: "#10b981",
    points: [
      { label: "А", x: 40,  y: 240, order: 1 },
      { label: "Б", x: 100, y: 180, order: 2 },
      { label: "В", x: 190, y: 130, order: 3 },
      { label: "Г", x: 280, y: 170, order: 4 },
      { label: "Д", x: 360, y: 80,  order: 5 },
    ],
  },
  {
    id: 3, engineer: "Козлов И.С.", start: "Офис (Ленинский пр.)", end: "Красногвардейский р-н",
    km: 38, durationMin: 156, avgSpeedKmh: 24, orders: 4, color: "#f59e0b",
    points: [
      { label: "А", x: 40,  y: 260, order: 1 },
      { label: "Б", x: 150, y: 200, order: 2 },
      { label: "В", x: 260, y: 140, order: 3 },
      { label: "Г", x: 360, y: 70,  order: 4 },
    ],
  },
  {
    id: 4, engineer: "Новиков Е.Р.", start: "Офис (Ленинский пр.)", end: "Приморский р-н",
    km: 55, durationMin: 210, avgSpeedKmh: 31, orders: 6, color: "#8b5cf6",
    points: [
      { label: "А", x: 40,  y: 255, order: 1 },
      { label: "Б", x: 120, y: 190, order: 2 },
      { label: "В", x: 210, y: 120, order: 3 },
      { label: "Г", x: 295, y: 160, order: 4 },
      { label: "Д", x: 370, y: 65,  order: 5 },
    ],
  },
];

const KM_BY_ENGINEER_DATA = COMP_ROWS.map((r) => ({
  name: r.engineer.split(" ")[0],
  km: r.kmGps,
}));

const MONTHLY_COST_DATA = [
  { month: "Июн'24", cost: 168400 }, { month: "Июл'24", cost: 192300 },
  { month: "Авг'24", cost: 204700 }, { month: "Сен'24", cost: 187600 },
  { month: "Окт'24", cost: 195800 }, { month: "Ноя'24", cost: 178200 },
  { month: "Дек'24", cost: 161400 }, { month: "Янв'25", cost: 155800 },
  { month: "Фев'25", cost: 170300 }, { month: "Мар'25", cost: 183500 },
  { month: "Апр'25", cost: 196400 }, { month: "Май'25", cost: 213540 },
];

const CAR_AVG_DATA: CarAvgRow[] = [
  { make: "Lada Granta",     avgL100: 9.2,  count: 4, totalKm: 7840 },
  { make: "Volkswagen Polo", avgL100: 7.8,  count: 3, totalKm: 6420 },
  { make: "Kia Rio",         avgL100: 7.4,  count: 3, totalKm: 5970 },
  { make: "Hyundai Solaris", avgL100: 7.6,  count: 2, totalKm: 3910 },
  { make: "GAZelle Next",    avgL100: 14.3, count: 2, totalKm: 3240 },
  { make: "Ford Transit",    avgL100: 13.1, count: 1, totalKm: 1890 },
];

// ─── KPI data ─────────────────────────────────────────────────────────────────

const totalFuelCost = COMP_ROWS.reduce((s, r) => s + r.fuelCost, 0);
const totalKmGps    = COMP_ROWS.reduce((s, r) => s + r.kmGps, 0);
const totalFuelL    = COMP_ROWS.reduce((s, r) => s + r.fuelL, 0);
const avgL100       = ((totalFuelL / totalKmGps) * 100).toFixed(1);
const paidRows      = COMP_ROWS.filter((r) => r.status === "Выплачено");
const paidTotal     = paidRows.reduce((s, r) => s + r.fuelCost, 0);
const anomalyRows   = COMP_ROWS.filter((r) => kmDiff(r.kmGps, r.kmClaimed) > 15);

// ─── SVG Route Map ────────────────────────────────────────────────────────────

const RouteMap: React.FC<{ route: RouteRow }> = ({ route }) => {
  const pts = route.points;
  const pathD = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      {/* Grid lines */}
      {[0, 75, 150, 225, 300].map((y) => (
        <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#f0f0f0" strokeWidth="1" />
      ))}
      {[0, 100, 200, 300, 400].map((x) => (
        <line key={x} x1={x} y1="0" x2={x} y2="300" stroke="#f0f0f0" strokeWidth="1" />
      ))}
      {/* Route path */}
      <path d={pathD} fill="none" stroke={route.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* Dashed animated line */}
      <path d={pathD} fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="6 8" strokeLinecap="round" />
      {/* Points */}
      {pts.map((p) => (
        <g key={p.label}>
          <circle cx={p.x} cy={p.y} r="14" fill={route.color} opacity="0.15" />
          <circle cx={p.x} cy={p.y} r="9"  fill={route.color} />
          <text x={p.x} y={p.y + 4} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
            {p.label}
          </text>
          <text x={p.x + 14} y={p.y - 10} fill="#374151" fontSize="9">
            {p.order === 1 ? "Офис" : p.order === pts.length ? "Финиш" : `Объект ${p.order - 1}`}
          </text>
        </g>
      ))}
    </svg>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const FuelManagementFull: React.FC = () => {
  const [search, setSearch] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<RouteRow>(ROUTE_ROWS[0]);
  const [paidIds, setPaidIds] = useState<Set<number>>(new Set(
    COMP_ROWS.filter((r) => r.status === "Выплачено").map((r) => r.id)
  ));

  const filteredComp = COMP_ROWS.filter((r) =>
    r.engineer.toLowerCase().includes(search.toLowerCase())
  );

  const handleApproveAll = () => {
    toast.success("Все компенсации одобрены и отправлены в бухгалтерию");
  };

  const handlePay = (row: CompRow) => {
    setPaidIds((prev) => new Set([...prev, row.id]));
    toast.success(`Компенсация ${row.engineer} — ${fmt(row.fuelCost)} ₽ выплачена`);
  };

  const handleRouteDetail = (route: RouteRow) => {
    toast.info(`Маршрут ${route.engineer}: ${route.km} км, ${route.orders} нарядов`);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Icon name="Fuel" className="text-orange-500" size={28} />
            Управление ГСМ / Топливо
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Май 2025 · 15 инженеров</p>
        </div>
        <Button onClick={handleApproveAll} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
          <Icon name="CheckCheck" size={16} />
          Одобрить все
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Расход за месяц</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(totalFuelCost)} ₽</p>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <Icon name="TrendingUp" size={12} /> +4.2% к апрелю
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Километраж (GPS)</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(totalKmGps)} км</p>
            <p className="text-xs text-gray-400 mt-1">{fmt(Math.round(totalKmGps / 15))} км/инж</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Средний расход</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{avgL100} л/100км</p>
            <p className="text-xs text-gray-400 mt-1">Норма: 9.5 л/100км</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Компенсаций выплачено</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(paidTotal)} ₽</p>
            <p className="text-xs text-gray-400 mt-1">{paidRows.length} из {COMP_ROWS.length} инженеров</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="compensations">
        <TabsList className="bg-white border">
          <TabsTrigger value="compensations">Компенсации</TabsTrigger>
          <TabsTrigger value="routes">Маршруты</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
        </TabsList>

        {/* ── Компенсации ──────────────────────────────────────────────────── */}
        <TabsContent value="compensations" className="space-y-4 mt-4">
          {/* Daily consumption chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">Расход ГСМ по дням (май 2025, литры)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={DAILY_FUEL_DATA} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={3} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => [`${v} л`, "Расход"]} />
                  <Area type="monotone" dataKey="liters" stroke="#f97316" fill="url(#fuelGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по инженеру..."
                className="pl-9 text-sm"
              />
            </div>
            {anomalyRows.length > 0 && (
              <Badge className="bg-red-100 text-red-700 border-0 gap-1">
                <Icon name="AlertTriangle" size={12} />
                {anomalyRows.length} аномалии (расхождение &gt;15%)
              </Badge>
            )}
          </div>

          {/* Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-xs">Инженер</TableHead>
                  <TableHead className="text-xs text-right">Дни в поле</TableHead>
                  <TableHead className="text-xs text-right">км GPS</TableHead>
                  <TableHead className="text-xs text-right">км заявл.</TableHead>
                  <TableHead className="text-xs text-right">Расход, л</TableHead>
                  <TableHead className="text-xs text-right">Стоимость ₽</TableHead>
                  <TableHead className="text-xs text-center">Статус</TableHead>
                  <TableHead className="text-xs" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComp.map((row) => {
                  const diff = kmDiff(row.kmGps, row.kmClaimed);
                  const hasAnomaly = diff > 15;
                  const isPaid = paidIds.has(row.id);
                  const currentStatus: CompStatus = isPaid ? "Выплачено" : row.status;

                  return (
                    <TableRow key={row.id} className={hasAnomaly ? "bg-red-50" : undefined}>
                      <TableCell className="font-medium text-sm">
                        <span className="flex items-center gap-2">
                          {hasAnomaly && <Icon name="AlertTriangle" size={14} className="text-red-500 shrink-0" />}
                          {row.engineer}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm">{row.daysField}</TableCell>
                      <TableCell className="text-right text-sm">{fmt(row.kmGps)}</TableCell>
                      <TableCell className={`text-right text-sm font-medium ${hasAnomaly ? "text-red-600" : ""}`}>
                        {fmt(row.kmClaimed)}
                        {hasAnomaly && (
                          <span className="ml-1 text-xs text-red-500">+{diff.toFixed(0)}%</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm">{row.fuelL}</TableCell>
                      <TableCell className="text-right text-sm font-semibold">{fmt(row.fuelCost)}</TableCell>
                      <TableCell className="text-center">{statusBadge(currentStatus)}</TableCell>
                      <TableCell>
                        {currentStatus !== "Выплачено" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 px-2"
                            onClick={() => handlePay(row)}
                          >
                            Выплатить
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ── Маршруты ─────────────────────────────────────────────────────── */}
        <TabsContent value="routes" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Route list */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
                Маршруты сегодня ({ROUTE_ROWS.length})
              </p>
              {ROUTE_ROWS.map((route) => (
                <Card
                  key={route.id}
                  className={`cursor-pointer transition-all border-2 ${
                    selectedRoute.id === route.id ? "border-orange-400 shadow-md" : "border-transparent hover:border-gray-200"
                  }`}
                  onClick={() => setSelectedRoute(route)}
                >
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm text-gray-900">{route.engineer}</span>
                      <Badge style={{ backgroundColor: route.color + "20", color: route.color, borderColor: "transparent" }}>
                        {route.orders} нарядов
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{route.start}</p>
                    <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                      <Icon name="ArrowDown" size={10} />
                      {route.end}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-600">
                      <span className="flex items-center gap-1"><Icon name="MapPin" size={11} />{route.km} км</span>
                      <span className="flex items-center gap-1"><Icon name="Clock" size={11} />{Math.floor(route.durationMin / 60)}ч {route.durationMin % 60}м</span>
                      <span className="flex items-center gap-1"><Icon name="Gauge" size={11} />{route.avgSpeedKmh} км/ч</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 w-full h-7 text-xs"
                      onClick={(e) => { e.stopPropagation(); handleRouteDetail(route); }}
                    >
                      Детали маршрута
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Map */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: selectedRoute.color }}
                    />
                    Маршрут: {selectedRoute.engineer}
                  </CardTitle>
                  <p className="text-xs text-gray-400">
                    {selectedRoute.start} → {selectedRoute.end} · {selectedRoute.km} км
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg border h-72 p-2">
                    <RouteMap route={selectedRoute} />
                  </div>
                  <div className="flex gap-6 mt-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <Icon name="Navigation" size={14} className="text-orange-500" />
                      <strong>{selectedRoute.km} км</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Icon name="Clock" size={14} className="text-blue-500" />
                      <strong>{Math.floor(selectedRoute.durationMin / 60)}ч {selectedRoute.durationMin % 60}м</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Icon name="Gauge" size={14} className="text-green-500" />
                      <strong>{selectedRoute.avgSpeedKmh} км/ч</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Icon name="Wrench" size={14} className="text-purple-500" />
                      <strong>{selectedRoute.orders} нарядов</strong>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Аналитика ────────────────────────────────────────────────────── */}
        <TabsContent value="analytics" className="space-y-4 mt-4">
          {/* Anomaly alert */}
          {anomalyRows.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-4 pb-3">
                <p className="text-sm font-semibold text-red-700 flex items-center gap-2 mb-1">
                  <Icon name="AlertTriangle" size={16} />
                  Выявлено аномалий: {anomalyRows.length}
                </p>
                <div className="space-y-1">
                  {anomalyRows.map((r) => (
                    <p key={r.id} className="text-xs text-red-600">
                      {r.engineer}: GPS {fmt(r.kmGps)} км vs заявлено {fmt(r.kmClaimed)} км
                      (+{kmDiff(r.kmGps, r.kmClaimed).toFixed(1)}%)
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Bar: km by engineer */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">Километраж по инженерам (GPS, май 2025)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={KM_BY_ENGINEER_DATA} margin={{ top: 4, right: 8, left: -24, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-40} textAnchor="end" />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => [`${fmt(v)} км`, "Километраж"]} />
                    <Bar dataKey="km" fill="#f97316" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Line: monthly cost */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">Стоимость ГСМ по месяцам (12 мес., ₽)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={MONTHLY_COST_DATA} margin={{ top: 4, right: 8, left: -24, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="month" tick={{ fontSize: 9 }} angle={-40} textAnchor="end" />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}К`} />
                    <Tooltip formatter={(v: number) => [`${fmt(v)} ₽`, "Стоимость"]} />
                    <Line type="monotone" dataKey="cost" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3, fill: "#3b82f6" }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Car avg consumption table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">Средний расход по маркам автомобилей</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-xs">Марка / модель</TableHead>
                  <TableHead className="text-xs text-right">Кол-во авто</TableHead>
                  <TableHead className="text-xs text-right">Суммарный пробег, км</TableHead>
                  <TableHead className="text-xs text-right">Средний расход, л/100км</TableHead>
                  <TableHead className="text-xs text-center">Норма</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CAR_AVG_DATA.map((car) => {
                  const norm = car.make.includes("GAZelle") || car.make.includes("Ford") ? 14.0 : 9.5;
                  const ok = car.avgL100 <= norm;
                  return (
                    <TableRow key={car.make}>
                      <TableCell className="font-medium text-sm">{car.make}</TableCell>
                      <TableCell className="text-right text-sm">{car.count}</TableCell>
                      <TableCell className="text-right text-sm">{fmt(car.totalKm)}</TableCell>
                      <TableCell className={`text-right text-sm font-semibold ${ok ? "text-green-600" : "text-red-600"}`}>
                        {car.avgL100}
                      </TableCell>
                      <TableCell className="text-center">
                        {ok
                          ? <Badge className="bg-green-100 text-green-700 border-0 text-xs">В норме</Badge>
                          : <Badge className="bg-red-100 text-red-700 border-0 text-xs">Превышение</Badge>
                        }
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FuelManagementFull;
