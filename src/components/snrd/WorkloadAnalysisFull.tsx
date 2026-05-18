import { useState } from 'react';
import {
  BarChart, Bar, AreaChart, Area, ComposedChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
type Period = 'week' | 'month' | 'quarter';

// ─── Static Data ──────────────────────────────────────────────────────────────
const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const ENGINEERS = [
  'Петров А.В.',
  'Иванов К.П.',
  'Сидоров М.Н.',
  'Козлов Р.Е.',
  'Новиков Д.С.',
  'Морозов В.А.',
  'Алексеев И.О.',
];

// Heatmap: строки = инженеры (7), столбцы = дни (7). Значения — % загрузки.
const heatmapData: number[][] = [
  [95, 88, 102, 91, 89, 40, 0],
  [82, 79, 85, 88, 94, 30, 0],
  [70, 75, 68, 72, 80, 25, 0],
  [55, 60, 58, 63, 67, 20, 0],
  [42, 38, 45, 40, 50, 15, 0],
  [35, 40, 38, 42, 45, 10, 0],
  [88, 85, 91, 87, 96, 38, 0],
];

function heatCellStyle(value: number): { bg: string; text: string } {
  if (value === 0) return { bg: '#f8fafc', text: '#94a3b8' };
  if (value <= 40) return { bg: '#dbeafe', text: '#1e40af' };
  if (value <= 60) return { bg: '#bfdbfe', text: '#1d4ed8' };
  if (value <= 75) return { bg: '#93c5fd', text: '#1e3a8a' };
  if (value <= 90) return { bg: '#3b82f6', text: '#ffffff' };
  return { bg: '#1d4ed8', text: '#ffffff' };
}

// По инженерам: BarChart + таблица
const engineerWorkloadData = [
  { name: 'Петров А.В.',   load: 93, orders: 18, hours: 37.2, overtime: 5.2 },
  { name: 'Иванов К.П.',   load: 86, orders: 16, hours: 34.4, overtime: 2.4 },
  { name: 'Сидоров М.Н.',  load: 73, orders: 14, hours: 29.2, overtime: 0   },
  { name: 'Козлов Р.Е.',   load: 61, orders: 12, hours: 24.4, overtime: 0   },
  { name: 'Новиков Д.С.',  load: 44, orders:  8, hours: 17.6, overtime: 0   },
  { name: 'Морозов В.А.',  load: 38, orders:  7, hours: 15.2, overtime: 0   },
  { name: 'Алексеев И.О.', load: 90, orders: 17, hours: 36.0, overtime: 4.0 },
];

function engineerStatus(load: number): { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' } {
  if (load >= 90) return { label: 'Перегрузка',   variant: 'destructive' };
  if (load >= 70) return { label: 'Оптимально',   variant: 'default'     };
  return               { label: 'Недогрузка',   variant: 'secondary'   };
}

// По дням: ComposedChart
const dayWorkloadData = [
  { day: 'Пн', orders: 24, load: 76 },
  { day: 'Вт', orders: 22, load: 72 },
  { day: 'Ср', orders: 27, load: 83 },
  { day: 'Чт', orders: 25, load: 79 },
  { day: 'Пт', orders: 28, load: 89 },
  { day: 'Сб', orders:  9, load: 31 },
  { day: 'Вс', orders:  0, load:  0 },
];

// Тренд за 8 недель: AreaChart
const weekTrendData = [
  { week: 'Нед 1', load: 68, orders: 98  },
  { week: 'Нед 2', load: 71, orders: 104 },
  { week: 'Нед 3', load: 74, orders: 108 },
  { week: 'Нед 4', load: 76, orders: 111 },
  { week: 'Нед 5', load: 73, orders: 107 },
  { week: 'Нед 6', load: 79, orders: 115 },
  { week: 'Нед 7', load: 82, orders: 120 },
  { week: 'Нед 8', load: 78, orders: 114 },
];

// По типам работ: stacked BarChart + RadarChart
const workTypeData = [
  { name: 'Петров А.В.',   ТО: 6, Ремонт: 8, Монтаж: 2, Диагностика: 2 },
  { name: 'Иванов К.П.',   ТО: 3, Ремонт: 9, Монтаж: 2, Диагностика: 2 },
  { name: 'Сидоров М.Н.',  ТО: 5, Ремонт: 5, Монтаж: 3, Диагностика: 1 },
  { name: 'Козлов Р.Е.',   ТО: 4, Ремонт: 4, Монтаж: 3, Диагностика: 1 },
  { name: 'Новиков Д.С.',  ТО: 2, Ремонт: 3, Монтаж: 2, Диагностика: 1 },
  { name: 'Морозов В.А.',  ТО: 2, Ремонт: 2, Монтаж: 2, Диагностика: 1 },
  { name: 'Алексеев И.О.', ТО: 4, Ремонт: 7, Монтаж: 4, Диагностика: 2 },
];

const radarData = [
  { subject: 'ТО',         А: 90, Б: 55 },
  { subject: 'Ремонт',     А: 95, Б: 70 },
  { subject: 'Монтаж',     А: 60, Б: 80 },
  { subject: 'Диагностика',А: 75, Б: 65 },
  { subject: 'Загрузка',   А: 93, Б: 61 },
  { subject: 'NPS',        А: 96, Б: 91 },
];

const top3ByType: { type: string; engineers: string[] }[] = [
  { type: 'ТО',          engineers: ['Петров А.В.', 'Сидоров М.Н.', 'Алексеев И.О.'] },
  { type: 'Ремонт',      engineers: ['Иванов К.П.', 'Петров А.В.', 'Алексеев И.О.'] },
  { type: 'Монтаж',      engineers: ['Алексеев И.О.', 'Козлов Р.Е.', 'Сидоров М.Н.'] },
  { type: 'Диагностика', engineers: ['Петров А.В.', 'Иванов К.П.', 'Алексеев И.О.'] },
];

// Прогноз: AreaChart (2 недели вперёд)
const forecastData = [
  { week: 'Нед 8 (факт)',     load: 78,  low: 78,  high: 78  },
  { week: 'Нед 9',            load: 81,  low: 75,  high: 87  },
  { week: 'Нед 10',           load: 85,  low: 78,  high: 92  },
  { week: 'Нед 11',           load: 89,  low: 81,  high: 97  },
  { week: 'Нед 12',           load: 92,  low: 84,  high: 100 },
];

// Сезонный паттерн
const seasonalData = [
  { month: 'Янв', load: 55 },
  { month: 'Фев', load: 52 },
  { month: 'Мар', load: 60 },
  { month: 'Апр', load: 68 },
  { month: 'Май', load: 78 },
  { month: 'Июн', load: 95 },
  { month: 'Июл', load: 98 },
  { month: 'Авг', load: 96 },
  { month: 'Сен', load: 85 },
  { month: 'Окт', load: 72 },
  { month: 'Ноя', load: 62 },
  { month: 'Дек', load: 58 },
];

// ─── KPI Cards ────────────────────────────────────────────────────────────────
const kpiCards = [
  {
    title: 'Средняя загрузка',
    value: '78%',
    icon: 'Activity',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    sub: '+4% к прошлой неделе',
    trend: 'up',
  },
  {
    title: 'Перегруженных',
    value: '2',
    icon: 'AlertTriangle',
    color: 'text-red-600',
    bg: 'bg-red-50',
    sub: 'Петров, Алексеев',
    trend: 'up',
  },
  {
    title: 'Недогруженных',
    value: '3',
    icon: 'TrendingDown',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    sub: 'Новиков, Морозов, Козлов',
    trend: 'down',
  },
  {
    title: 'Нарядов в очереди',
    value: '12',
    icon: 'ClipboardList',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    sub: '3 срочных, 9 обычных',
    trend: 'neutral',
  },
];

// ─── Bar color by load ───────────────────────────────────────────────────────
function barColor(load: number): string {
  if (load > 90) return '#ef4444';
  if (load > 80) return '#f59e0b';
  return '#3b82f6';
}

// Custom bar shape that colors by value
function CustomBar(props: Record<string, unknown>) {
  const { x, y, width, height, value } = props as {
    x: number; y: number; width: number; height: number; value: number;
  };
  return <rect x={x} y={y} width={width} height={height} fill={barColor(value)} rx={3} />;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function WorkloadAnalysisFull() {
  const [period, setPeriod] = useState<Period>('week');

  function handleOptimize() {
    toast.success('Запущена оптимизация расписания', {
      description: 'Алгоритм перераспределит 4 наряда от перегруженных к недогруженным инженерам',
    });
  }

  function handleRedistribute() {
    toast.success('Нагрузка перераспределена', {
      description: '3 наряда перенесены с Петрова А.В. на Новикова Д.С. и Морозова В.А.',
    });
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Icon name="BarChart2" className="text-blue-600" size={26} />
            Анализ загрузки инженеров
          </h1>
          <p className="text-sm text-gray-500 mt-1">Мониторинг и балансировка рабочей нагрузки</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Эта неделя</SelectItem>
              <SelectItem value="month">Этот месяц</SelectItem>
              <SelectItem value="quarter">Квартал</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleOptimize} className="gap-2">
            <Icon name="Shuffle" size={16} />
            Оптимизировать расписание
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">{kpi.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
                </div>
                <div className={`p-2 rounded-lg ${kpi.bg}`}>
                  <Icon name={kpi.icon as Parameters<typeof Icon>[0]['name']} className={kpi.color} size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Heatmap ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="Grid" size={16} className="text-blue-600" />
            Тепловая карта загрузки по инженерам и дням
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-1">
              <thead>
                <tr>
                  <th className="text-left text-gray-500 font-medium pr-3 pb-2 w-36">Инженер</th>
                  {DAYS.map((d) => (
                    <th key={d} className="text-center text-gray-500 font-medium pb-2 w-16">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ENGINEERS.map((eng, ri) => (
                  <tr key={eng}>
                    <td className="text-gray-700 text-xs font-medium pr-3 py-1 whitespace-nowrap">{eng}</td>
                    {DAYS.map((d, ci) => {
                      const val = heatmapData[ri][ci];
                      const style = heatCellStyle(val);
                      return (
                        <td key={d} className="text-center">
                          <div
                            className="mx-auto rounded flex items-center justify-center text-xs font-semibold"
                            style={{
                              backgroundColor: style.bg,
                              color: style.text,
                              width: 56,
                              height: 36,
                            }}
                          >
                            {val === 0 ? '—' : `${val}%`}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <span className="text-xs text-gray-500 font-medium">Загрузка:</span>
            {[
              { bg: '#f8fafc', label: '0%'     },
              { bg: '#dbeafe', label: '≤40%'   },
              { bg: '#bfdbfe', label: '≤60%'   },
              { bg: '#93c5fd', label: '≤75%'   },
              { bg: '#3b82f6', label: '≤90%'   },
              { bg: '#1d4ed8', label: '>90%'   },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                <div className="w-5 h-4 rounded" style={{ backgroundColor: item.bg, border: '1px solid #e2e8f0' }} />
                <span className="text-xs text-gray-500">{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Tabs ── */}
      <Tabs defaultValue="engineers">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="engineers">По инженерам</TabsTrigger>
          <TabsTrigger value="days">По дням</TabsTrigger>
          <TabsTrigger value="types">По типам</TabsTrigger>
          <TabsTrigger value="forecast">Прогноз</TabsTrigger>
        </TabsList>

        {/* ── Tab: По инженерам ── */}
        <TabsContent value="engineers" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Загрузка по инженерам, %</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={engineerWorkloadData} layout="vertical" margin={{ left: 100, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 110]} unit="%" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={96} />
                  <Tooltip formatter={(v: number) => [`${v}%`, 'Загрузка']} />
                  <ReferenceLine x={80} stroke="#10b981" strokeDasharray="4 2" label={{ value: 'норма 80%', position: 'top', fontSize: 10, fill: '#10b981' }} />
                  <Bar dataKey="load" shape={<CustomBar />} radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-gray-600">Детализация по инженерам</CardTitle>
                <Button variant="outline" size="sm" onClick={handleRedistribute} className="gap-1 text-xs">
                  <Icon name="ArrowLeftRight" size={13} />
                  Перераспределить нагрузку
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Инженер</TableHead>
                    <TableHead className="text-right">Нарядов</TableHead>
                    <TableHead className="text-right">Часов</TableHead>
                    <TableHead className="text-right">Загрузка</TableHead>
                    <TableHead className="text-right">Переработка</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {engineerWorkloadData.map((row) => {
                    const st = engineerStatus(row.load);
                    return (
                      <TableRow key={row.name}>
                        <TableCell className="font-medium text-sm">{row.name}</TableCell>
                        <TableCell className="text-right text-sm">{row.orders}</TableCell>
                        <TableCell className="text-right text-sm">{row.hours} ч</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Progress value={row.load} className="w-16 h-2" />
                            <span className="text-sm font-medium w-10 text-right">{row.load}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {row.overtime > 0 ? (
                            <span className="text-red-600">+{row.overtime} ч</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={st.variant}>{st.label}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab: По дням ── */}
        <TabsContent value="days" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Наряды (столбцы) и загрузка % (линия) по дням недели</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={dayWorkloadData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" unit="%" domain={[0, 110]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="orders" name="Нарядов" fill="#93c5fd" radius={[3, 3, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="load" name="Загрузка %" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
                  <ReferenceLine yAxisId="right" y={80} stroke="#10b981" strokeDasharray="4 2" />
                </ComposedChart>
              </ResponsiveContainer>
              <div className="mt-3 flex items-center gap-2 text-sm bg-amber-50 border border-amber-200 rounded-lg p-3">
                <Icon name="AlertCircle" size={15} className="text-amber-600 shrink-0" />
                <span className="text-amber-800">
                  <strong>Пятница</strong> — наиболее загруженный день недели (<strong>89%</strong>).
                  Рекомендуется переносить плановые работы на вторник–среду.
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Тренд загрузки — последние 8 недель</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={weekTrendData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis unit="%" domain={[50, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v}%`, 'Загрузка']} />
                  <Area type="monotone" dataKey="load" name="Загрузка %" stroke="#3b82f6" fill="url(#loadGrad)" strokeWidth={2} dot={{ r: 3 }} />
                  <ReferenceLine y={80} stroke="#10b981" strokeDasharray="4 2" label={{ value: '80% норма', fontSize: 10, fill: '#10b981' }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab: По типам работ ── */}
        <TabsContent value="types" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Распределение типов работ по инженерам</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={workTypeData} layout="vertical" margin={{ left: 100, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={96} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ТО"          stackId="a" fill="#3b82f6" />
                  <Bar dataKey="Ремонт"      stackId="a" fill="#ef4444" />
                  <Bar dataKey="Монтаж"      stackId="a" fill="#10b981" />
                  <Bar dataKey="Диагностика" stackId="a" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Профиль специализации (Петров А.В. vs Козлов Р.Е.)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar name="Петров А.В." dataKey="А" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    <Radar name="Козлов Р.Е." dataKey="Б" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Топ-3 инженера по типу работ</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Тип</TableHead>
                      <TableHead>#1</TableHead>
                      <TableHead>#2</TableHead>
                      <TableHead>#3</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {top3ByType.map((row) => (
                      <TableRow key={row.type}>
                        <TableCell>
                          <Badge variant="outline">{row.type}</Badge>
                        </TableCell>
                        {row.engineers.map((e) => (
                          <TableCell key={e} className="text-xs text-gray-700">{e}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab: Прогноз ── */}
        <TabsContent value="forecast" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Прогноз загрузки на 2 недели вперёд (с доверительным интервалом)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={forecastData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ciGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis unit="%" domain={[60, 110]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v}%`]} />
                  <Legend />
                  <Area type="monotone" dataKey="high" name="Верхняя граница" stroke="transparent" fill="url(#ciGrad)" strokeWidth={0} />
                  <Area type="monotone" dataKey="low"  name="Нижняя граница" stroke="transparent" fill="#ffffff" strokeWidth={0} />
                  <Area type="monotone" dataKey="load" name="Прогноз загрузки %" stroke="#6366f1" fill="transparent" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 4 }} />
                  <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="4 2" label={{ value: 'критич. 90%', fontSize: 10, fill: '#ef4444' }} />
                  <ReferenceLine y={80} stroke="#10b981" strokeDasharray="4 2" label={{ value: 'норма 80%', fontSize: 10, fill: '#10b981' }} />
                </AreaChart>
              </ResponsiveContainer>

              <div className="mt-4 space-y-2">
                {[
                  { icon: 'Users', color: 'text-red-600', bg: 'bg-red-50 border-red-200', text: 'Принять ещё 2 инженера на пик сезона (июнь–август) — прогнозируемая загрузка превысит 95%.' },
                  { icon: 'Calendar', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', text: 'Перенести 30% плановых ТО с Нед 11–12 на Нед 9–10 для выравнивания нагрузки.' },
                  { icon: 'Award', color: 'text-green-600', bg: 'bg-green-50 border-green-200', text: 'Новиков Д.С. и Морозов В.А. имеют резерв ~40% и готовы принять дополнительные заявки.' },
                ].map((rec, i) => (
                  <div key={i} className={`flex items-start gap-2 text-sm border rounded-lg p-3 ${rec.bg}`}>
                    <Icon name={rec.icon as Parameters<typeof Icon>[0]['name']} size={15} className={`${rec.color} shrink-0 mt-0.5`} />
                    <span className="text-gray-800">{rec.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Сезонный паттерн загрузки по месяцам</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={seasonalData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="seasonGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis unit="%" domain={[40, 110]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v}%`, 'Загрузка']} />
                  <Area type="monotone" dataKey="load" name="Загрузка %" stroke="#f59e0b" fill="url(#seasonGrad)" strokeWidth={2} dot={{ r: 3 }} />
                  <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="4 2" label={{ value: 'пик', fontSize: 10, fill: '#ef4444' }} />
                  <ReferenceLine y={80} stroke="#10b981" strokeDasharray="4 2" />
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Летний пик (июнь–август): загрузка достигает 95–98%. Зимнее затишье (январь–февраль): 52–55%.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
