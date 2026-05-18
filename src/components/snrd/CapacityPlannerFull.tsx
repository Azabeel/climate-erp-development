import React, { useState, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  ComposedChart, Bar, Line, AreaChart, Area, BarChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = "this_week" | "next_week" | "month";
type LoadStatus = "overloaded" | "optimal" | "underloaded";

interface Engineer {
  id: string; name: string; specialization: string;
  ordersToday: number; ordersTomorrow: number; loadPct: number;
  status: LoadStatus; dailyLoad: number[];
}
interface Recommendation { id: string; icon: string; title: string; description: string; impact: string; applied: boolean; }
interface Redistribution { orderId: string; title: string; currentEngineer: string; recommendedEngineer: string; timeSavedMin: number; }

// ─── Static data ──────────────────────────────────────────────────────────────

const LOAD_BY_DAY = [
  { day: "Пн", hours: 38, pct: 79 }, { day: "Вт", hours: 42, pct: 88 },
  { day: "Ср", hours: 35, pct: 73 }, { day: "Чт", hours: 47, pct: 98 },
  { day: "Пт", hours: 44, pct: 92 }, { day: "Сб", hours: 18, pct: 38 },
];

const ENGINEERS: Engineer[] = [
  { id: "e1", name: "Козлов Михаил", specialization: "Монтаж / Пуско-наладка", ordersToday: 4, ordersTomorrow: 5, loadPct: 95, status: "overloaded", dailyLoad: [85, 90, 78, 95, 100, 40] },
  { id: "e2", name: "Петров Сергей", specialization: "Ремонт кондиционеров", ordersToday: 3, ordersTomorrow: 3, loadPct: 72, status: "optimal", dailyLoad: [70, 75, 60, 72, 80, 30] },
  { id: "e3", name: "Иванов Алексей", specialization: "ТО / Диагностика", ordersToday: 3, ordersTomorrow: 4, loadPct: 80, status: "optimal", dailyLoad: [80, 82, 75, 78, 85, 50] },
  { id: "e4", name: "Сидоров Дмитрий", specialization: "Гарантийный ремонт", ordersToday: 2, ordersTomorrow: 2, loadPct: 45, status: "underloaded", dailyLoad: [40, 45, 38, 42, 50, 0] },
  { id: "e5", name: "Новиков Андрей", specialization: "Монтаж / Ремонт", ordersToday: 5, ordersTomorrow: 5, loadPct: 100, status: "overloaded", dailyLoad: [95, 100, 88, 100, 100, 60] },
  { id: "e6", name: "Фёдоров Кирилл", specialization: "Чиллеры / ВРВ", ordersToday: 2, ordersTomorrow: 3, loadPct: 58, status: "optimal", dailyLoad: [55, 60, 50, 58, 65, 20] },
];

const FORECAST_DATA = [
  { date: "Пн 12", historical: 18, forecast: null }, { date: "Вт 13", historical: 22, forecast: null },
  { date: "Ср 14", historical: 19, forecast: null }, { date: "Чт 15", historical: 25, forecast: null },
  { date: "Пт 16", historical: 24, forecast: null }, { date: "Сб 17", historical: 10, forecast: null },
  { date: "Пн 19", historical: 21, forecast: 22 },   { date: "Вт 20", historical: null, forecast: 26 },
  { date: "Ср 21", historical: null, forecast: 23 }, { date: "Чт 22", historical: null, forecast: 28 },
  { date: "Пт 23", historical: null, forecast: 31 }, { date: "Сб 24", historical: null, forecast: 12 },
  { date: "Пн 26", historical: null, forecast: 27 }, { date: "Вт 27", historical: null, forecast: 29 },
];

const WORK_TYPE_FORECAST = [
  { type: "ТО", current: 45, forecast: 52 }, { type: "Ремонт", current: 38, forecast: 44 },
  { type: "Монтаж", current: 22, forecast: 27 }, { type: "Диагностика", current: 18, forecast: 20 },
  { type: "Пуско-наладка", current: 12, forecast: 15 }, { type: "Гарантия", current: 8, forecast: 9 },
];

const INIT_RECS: Recommendation[] = [
  { id: "r1", icon: "Shuffle", title: "Перераспределить 3 наряда с Козлова на Сидорова", description: "Козлов перегружен (95%). Сидоров недогружен (45%). Перенос снизит риск просрочки SLA.", impact: "−18% риск просрочки", applied: false },
  { id: "r2", icon: "UserPlus", title: "Привлечь 2 подрядчика на пятницу", description: "Прогнозируется 31 заявка (+29% к среднему). Собственных мощностей хватит на 24. Дефицит — 7 нарядов.", impact: "Покрытие пиковой нагрузки", applied: false },
  { id: "r3", icon: "Clock", title: "Сдвинуть плановые ТО со среды на субботу", description: "В среду ожидается 8 аварийных заявок. Перенос 4 плановых ТО освободит 6 часов для срочных выездов.", impact: "Приоритет аварийным нарядам", applied: false },
];

const REDISTRIBUTIONS: Redistribution[] = [
  { orderId: "WO-2026-001842", title: "ТО Mitsubishi (ул. Ленина, 12)", currentEngineer: "Козлов Михаил", recommendedEngineer: "Сидоров Дмитрий", timeSavedMin: 35 },
  { orderId: "WO-2026-001856", title: "Диагностика Daikin (пр. Мира, 88)", currentEngineer: "Новиков Андрей", recommendedEngineer: "Фёдоров Кирилл", timeSavedMin: 50 },
  { orderId: "WO-2026-001861", title: "Ремонт Haier (ул. Садовая, 3)", currentEngineer: "Козлов Михаил", recommendedEngineer: "Петров Сергей", timeSavedMin: 20 },
  { orderId: "WO-2026-001879", title: "Монтаж кассетника (БЦ Олимп)", currentEngineer: "Новиков Андрей", recommendedEngineer: "Иванов Алексей", timeSavedMin: 45 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<LoadStatus, string> = { overloaded: "Перегружен", optimal: "Оптимально", underloaded: "Недогружен" };
const STATUS_VARIANT: Record<LoadStatus, "destructive" | "default" | "secondary"> = { overloaded: "destructive", optimal: "default", underloaded: "secondary" };
const loadBarColor = (p: number) => p >= 95 ? "bg-red-500" : p >= 80 ? "bg-yellow-500" : "bg-green-500";
const heatColor = (p: number) => p >= 95 ? "bg-red-500 text-white" : p >= 80 ? "bg-yellow-400 text-yellow-900" : p >= 60 ? "bg-green-400 text-green-900" : "bg-green-100 text-green-700";
const DAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

// ─── KPI Card ─────────────────────────────────────────────────────────────────

const KpiCard: React.FC<{ label: string; value: string; sub: string; icon: string; accent: string }> = ({ label, value, sub, icon, accent }) => (
  <Card>
    <CardContent className="p-4 flex items-start gap-3">
      <div className={`p-2 rounded-lg shrink-0 ${accent}`}><Icon name={icon} size={20} className="text-white" /></div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold leading-tight">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </CardContent>
  </Card>
);

// ─── Main component ───────────────────────────────────────────────────────────

const CapacityPlannerFull: React.FC = () => {
  const [period, setPeriod] = useState<Period>("this_week");
  const [recommendations, setRecommendations] = useState<Recommendation[]>(INIT_RECS);
  const [appliedRedist, setAppliedRedist] = useState<Set<string>>(new Set());

  const applyRec = useCallback((id: string, title: string) => {
    setRecommendations((prev) => prev.map((r) => r.id === id ? { ...r, applied: true } : r));
    toast.success(`Рекомендация применена: «${title}»`);
  }, []);

  const applyRedist = useCallback((orderId: string) => {
    setAppliedRedist((prev) => new Set(prev).add(orderId));
    toast.success(`Наряд ${orderId} переназначен`);
  }, []);

  const applyAllRedist = useCallback(() => {
    setAppliedRedist(new Set(REDISTRIBUTIONS.map((r) => r.orderId)));
    toast.success("Все перераспределения применены");
  }, []);

  const PERIOD_LABEL: Record<Period, string> = { this_week: "Эта неделя", next_week: "Следующая неделя", month: "Месяц" };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Icon name="Users" size={24} /> Планирование мощностей
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Загрузка команды, прогноз и оптимизация расписания</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Период" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="this_week">Эта неделя</SelectItem>
              <SelectItem value="next_week">Следующая неделя</SelectItem>
              <SelectItem value="month">Месяц</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="text-xs">
            <Icon name="Calendar" size={12} className="mr-1" />{PERIOD_LABEL[period]}
          </Badge>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Загрузка команды" value="78%" sub="↑ 4% к прошлой неделе" icon="Activity" accent="bg-blue-500" />
        <KpiCard label="Нарядов в очереди" value="23" sub="3 срочных, 5 аварийных" icon="ClipboardList" accent="bg-orange-500" />
        <KpiCard label="Свободных слотов сегодня" value="8" sub="У 4 инженеров" icon="Clock" accent="bg-green-500" />
        <KpiCard label="Прогноз на завтра" value="92%" sub="Риск перегрузки" icon="TrendingUp" accent="bg-red-500" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="load">
        <TabsList className="mb-2">
          <TabsTrigger value="load"><Icon name="BarChart2" size={14} className="mr-1" />Загрузка</TabsTrigger>
          <TabsTrigger value="forecast"><Icon name="TrendingUp" size={14} className="mr-1" />Прогноз</TabsTrigger>
          <TabsTrigger value="optimize"><Icon name="Wand2" size={14} className="mr-1" />Оптимизация</TabsTrigger>
        </TabsList>

        {/* ── LOAD ── */}
        <TabsContent value="load" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Icon name="BarChart2" size={16} />Нагрузка по дням недели</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={LOAD_BY_DAY} margin={{ top: 8, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="h" orientation="left" tick={{ fontSize: 12 }} label={{ value: "ч", position: "insideTopLeft", fontSize: 11 }} />
                  <YAxis yAxisId="p" orientation="right" domain={[0, 120]} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(v, n) => n === "Загрузка %" ? `${v}%` : `${v} ч`} />
                  <Legend />
                  <Bar yAxisId="h" dataKey="hours" name="Часы нагрузки" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={48} />
                  <Line yAxisId="p" type="monotone" dataKey="pct" name="Загрузка %" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Icon name="Users" size={16} />Инженеры — загрузка</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-xs">
                      <th className="text-left py-2 pr-4 font-medium">Инженер</th>
                      <th className="text-left py-2 pr-4 font-medium hidden md:table-cell">Специализация</th>
                      <th className="text-center py-2 pr-4 font-medium">Сегодня</th>
                      <th className="text-center py-2 pr-4 font-medium">Завтра</th>
                      <th className="text-left py-2 pr-4 font-medium min-w-[120px]">Загрузка</th>
                      <th className="text-center py-2 font-medium">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ENGINEERS.map((eng) => (
                      <tr key={eng.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="py-3 pr-4 font-medium">{eng.name}</td>
                        <td className="py-3 pr-4 text-muted-foreground hidden md:table-cell">{eng.specialization}</td>
                        <td className="py-3 pr-4 text-center">{eng.ordersToday}</td>
                        <td className="py-3 pr-4 text-center">{eng.ordersTomorrow}</td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${loadBarColor(eng.loadPct)}`} style={{ width: `${Math.min(eng.loadPct, 100)}%` }} />
                            </div>
                            <span className="text-xs w-9 text-right tabular-nums">{eng.loadPct}%</span>
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <Badge variant={STATUS_VARIANT[eng.status]} className="text-xs">{STATUS_LABEL[eng.status]}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Icon name="Grid" size={16} />Тепловая карта загрузки</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[520px]">
                  <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: "140px repeat(6, 1fr)" }}>
                    <div />
                    {DAY_LABELS.map((d) => <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>)}
                  </div>
                  {ENGINEERS.map((eng) => (
                    <div key={eng.id} className="grid gap-1 mb-1 items-center" style={{ gridTemplateColumns: "140px repeat(6, 1fr)" }}>
                      <div className="text-xs text-right pr-2 truncate">{eng.name.split(" ")[0]}</div>
                      {eng.dailyLoad.map((pct, i) => (
                        <div key={i} className={`rounded text-center text-xs py-1.5 font-medium ${heatColor(pct)}`} title={`${eng.name} — ${DAY_LABELS[i]}: ${pct}%`}>
                          {pct > 0 ? `${pct}%` : "—"}
                        </div>
                      ))}
                    </div>
                  ))}
                  <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                    {[["bg-green-100", "<60%"], ["bg-green-400", "60–79%"], ["bg-yellow-400", "80–94%"], ["bg-red-500", "≥95%"]].map(([cls, label]) => (
                      <div key={label} className="flex items-center gap-1"><div className={`w-3 h-3 rounded ${cls}`} />{label}</div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── FORECAST ── */}
        <TabsContent value="forecast" className="space-y-6">
          <div className="flex items-start gap-3 p-4 rounded-lg border border-orange-200 bg-orange-50">
            <Icon name="AlertTriangle" size={18} className="text-orange-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800">Пиковая нагрузка ожидается в пятницу</p>
              <p className="text-xs text-orange-700 mt-0.5">Прогноз: 31 заявка (+29% к среднему). Рекомендуем привлечь 2 подрядчиков для покрытия дефицита в 7 нарядов.</p>
            </div>
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white shrink-0" onClick={() => toast.success("Запрос подрядчикам отправлен. Ожидайте подтверждения.")}>
              Запланировать
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Icon name="TrendingUp" size={16} />Прогноз входящих заявок на 2 недели</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={FORECAST_DATA} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gH" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gF" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip /><Legend />
                  <Area type="monotone" dataKey="historical" name="Факт" stroke="#3b82f6" fill="url(#gH)" strokeWidth={2} connectNulls={false} />
                  <Area type="monotone" dataKey="forecast" name="Прогноз" stroke="#f59e0b" fill="url(#gF)" strokeWidth={2} strokeDasharray="5 4" connectNulls={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Icon name="PieChart" size={16} />Прогноз нагрузки по типам работ</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={WORK_TYPE_FORECAST} margin={{ top: 8, right: 16, left: 0, bottom: 0 }} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="type" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} />
                  <Tooltip /><Legend />
                  <Bar dataKey="current" name="Текущая неделя" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={36} />
                  <Bar dataKey="forecast" name="Прогноз" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── OPTIMIZE ── */}
        <TabsContent value="optimize" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Icon name="Wand2" size={16} />Рекомендации ИИ-планировщика</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendations.map((rec) => (
                <div key={rec.id} className={`flex items-start gap-3 p-4 rounded-lg border ${rec.applied ? "bg-green-50 border-green-200" : "bg-muted/30 border-border"}`}>
                  <div className={`p-2 rounded-lg shrink-0 ${rec.applied ? "bg-green-500" : "bg-blue-500"}`}>
                    <Icon name={rec.applied ? "CheckCircle" : rec.icon} size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{rec.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{rec.description}</p>
                    <Badge variant="outline" className="mt-1.5 text-xs text-green-700 border-green-300">{rec.impact}</Badge>
                  </div>
                  <Button size="sm" variant={rec.applied ? "outline" : "default"} disabled={rec.applied} onClick={() => applyRec(rec.id, rec.title)} className="shrink-0">
                    {rec.applied ? <><Icon name="Check" size={13} className="mr-1" />Применено</> : "Применить"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Icon name="ArrowLeftRight" size={16} />Перераспределение нарядов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-xs">
                      <th className="text-left py-2 pr-4 font-medium">Наряд</th>
                      <th className="text-left py-2 pr-4 font-medium hidden sm:table-cell">Текущий инженер</th>
                      <th className="text-left py-2 pr-4 font-medium">Рекомендуемый</th>
                      <th className="text-center py-2 pr-4 font-medium">Экономия</th>
                      <th className="text-center py-2 font-medium">Действие</th>
                    </tr>
                  </thead>
                  <tbody>
                    {REDISTRIBUTIONS.map((row) => {
                      const done = appliedRedist.has(row.orderId);
                      return (
                        <tr key={row.orderId} className={`border-b last:border-0 ${done ? "bg-green-50/50" : "hover:bg-muted/30"}`}>
                          <td className="py-3 pr-4">
                            <div className="text-xs text-muted-foreground">{row.orderId}</div>
                            <div className="text-sm">{row.title}</div>
                          </td>
                          <td className="py-3 pr-4 hidden sm:table-cell">
                            <div className="flex items-center gap-1.5"><Icon name="User" size={13} className="text-red-400" /><span className="text-muted-foreground">{row.currentEngineer}</span></div>
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-1.5"><Icon name="User" size={13} className="text-green-500" /><span className="font-medium">{row.recommendedEngineer}</span></div>
                          </td>
                          <td className="py-3 pr-4 text-center">
                            <Badge variant="outline" className="text-xs text-green-700 border-green-300">−{row.timeSavedMin} мин</Badge>
                          </td>
                          <td className="py-3 text-center">
                            <Button size="sm" variant={done ? "outline" : "default"} disabled={done} onClick={() => applyRedist(row.orderId)}>
                              {done ? <><Icon name="Check" size={13} className="mr-1" />Применено</> : "Применить"}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex justify-between items-center text-xs text-muted-foreground">
                <span>Итого экономия: <span className="font-semibold text-green-700">{REDISTRIBUTIONS.reduce((s, r) => s + r.timeSavedMin, 0)} мин</span></span>
                <Button size="sm" variant="outline" onClick={applyAllRedist}>
                  <Icon name="CheckCheck" size={13} className="mr-1" />Применить все
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CapacityPlannerFull;
