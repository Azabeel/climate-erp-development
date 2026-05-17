import { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

// ─── Types ──────────────────────────────────────────────────────────────────────

interface HourlyPoint {
  hour: string;
  temp: number;
  icon: string;
  desc: string;
}

interface DayForecast {
  day: string;
  date: string;
  icon: string;
  desc: string;
  min: number;
  max: number;
  precip: number;
  wind: number;
  risk: 'low' | 'medium' | 'high';
}

interface AIRecommendation {
  id: string;
  icon: string;
  title: string;
  text: string;
  severity: 'info' | 'warning' | 'success';
}

interface MonthlyHistory {
  month: string;
  avg: number;
  lost: number;
}

// ─── Static data ────────────────────────────────────────────────────────────────

const HOURLY_DATA: HourlyPoint[] = [
  { hour: '08:00', temp: 14, icon: 'Cloud', desc: 'Облачно' },
  { hour: '09:00', temp: 15, icon: 'CloudSun', desc: 'Переменная облачность' },
  { hour: '10:00', temp: 16, icon: 'Sun', desc: 'Ясно' },
  { hour: '11:00', temp: 17, icon: 'Sun', desc: 'Ясно' },
  { hour: '12:00', temp: 18, icon: 'Sun', desc: 'Ясно' },
  { hour: '13:00', temp: 19, icon: 'Sun', desc: 'Ясно' },
  { hour: '14:00', temp: 20, icon: 'Sun', desc: 'Ясно' },
  { hour: '15:00', temp: 19, icon: 'CloudSun', desc: 'Переменная облачность' },
  { hour: '16:00', temp: 18, icon: 'Cloud', desc: 'Облачно' },
  { hour: '17:00', temp: 17, icon: 'CloudRain', desc: 'Дождь' },
  { hour: '18:00', temp: 16, icon: 'CloudRain', desc: 'Дождь' },
  { hour: '19:00', temp: 15, icon: 'Cloud', desc: 'Облачно' },
];

const WEEKLY_FORECAST: DayForecast[] = [
  { day: 'Сб', date: '17 мая', icon: 'Sun', desc: 'Ясно', min: 12, max: 20, precip: 0, wind: 3, risk: 'low' },
  { day: 'Вс', date: '18 мая', icon: 'CloudSun', desc: 'Перем. облачность', min: 11, max: 18, precip: 2, wind: 5, risk: 'low' },
  { day: 'Пн', date: '19 мая', icon: 'CloudRain', desc: 'Дождь', min: 10, max: 15, precip: 12, wind: 7, risk: 'high' },
  { day: 'Вт', date: '20 мая', icon: 'CloudRain', desc: 'Ливень', min: 9, max: 13, precip: 18, wind: 9, risk: 'high' },
  { day: 'Ср', date: '21 мая', icon: 'Cloud', desc: 'Облачно', min: 10, max: 16, precip: 4, wind: 6, risk: 'medium' },
  { day: 'Чт', date: '22 мая', icon: 'Sun', desc: 'Ясно', min: 13, max: 21, precip: 0, wind: 3, risk: 'low' },
  { day: 'Пт', date: '23 мая', icon: 'Sun', desc: 'Ясно', min: 14, max: 22, precip: 0, wind: 4, risk: 'low' },
];

const AI_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: '1',
    icon: 'CloudRain',
    title: 'Перенести уличные работы',
    text: 'В понедельник и вторник ожидаются дожди (12–18 мм). Рекомендуется перенести монтажные работы на открытом воздухе на четверг–пятницу.',
    severity: 'warning',
  },
  {
    id: '2',
    icon: 'Wind',
    title: 'Усиление ветра во вторник',
    text: 'Порывы до 9 м/с — высотные и кровельные работы нежелательны. Запланируйте внутренние монтажи и диагностику на этот день.',
    severity: 'warning',
  },
  {
    id: '3',
    icon: 'Sparkles',
    title: 'Благоприятные дни: чт–пт',
    text: 'Четверг и пятница — идеальные условия (+21/+22°C, без осадков). Перенесите все крупные уличные монтажи на эти дни.',
    severity: 'success',
  },
];

// Risk matrix: rows = work types, cols = conditions
const WORK_TYPES = ['Монтаж на улице', 'Кровельные работы', 'Высотные работы', 'В помещении'];
const CONDITIONS = ['Дождь', 'Мороз', 'Жара', 'Ветер', 'Норма'];

type RiskLevel = 'Высокий' | 'Средний' | 'Низкий' | 'Норма';

const RISK_MATRIX: RiskLevel[][] = [
  ['Высокий', 'Высокий', 'Средний', 'Средний', 'Низкий'],
  ['Высокий', 'Высокий', 'Средний', 'Высокий', 'Низкий'],
  ['Высокий', 'Высокий', 'Высокий', 'Высокий', 'Низкий'],
  ['Низкий',  'Низкий',  'Низкий',  'Низкий',  'Норма'],
];

const MONTHLY_HISTORY: MonthlyHistory[] = [
  { month: 'Янв', avg: -5, lost: 4 },
  { month: 'Фев', avg: -3, lost: 3 },
  { month: 'Мар', avg: 3,  lost: 2 },
  { month: 'Апр', avg: 10, lost: 1 },
  { month: 'Май', avg: 16, lost: 2 },
  { month: 'Июн', avg: 21, lost: 1 },
  { month: 'Июл', avg: 23, lost: 0 },
  { month: 'Авг', avg: 22, lost: 1 },
  { month: 'Сен', avg: 15, lost: 1 },
  { month: 'Окт', avg: 7,  lost: 3 },
  { month: 'Ноя', avg: 0,  lost: 3 },
  { month: 'Дек', avg: -4, lost: 5 },
];

// ─── Helpers ────────────────────────────────────────────────────────────────────

function riskBadgeVariant(risk: 'low' | 'medium' | 'high') {
  if (risk === 'low') return 'secondary';
  if (risk === 'medium') return 'outline';
  return 'destructive';
}

function riskLabel(risk: 'low' | 'medium' | 'high') {
  if (risk === 'low') return 'Низкий';
  if (risk === 'medium') return 'Средний';
  return 'Высокий';
}

function riskMatrixColor(level: RiskLevel): string {
  switch (level) {
    case 'Высокий': return 'bg-red-100 text-red-700';
    case 'Средний': return 'bg-yellow-100 text-yellow-700';
    case 'Низкий':  return 'bg-green-100 text-green-700';
    case 'Норма':   return 'bg-blue-50 text-blue-700';
  }
}

function recommendationColors(severity: AIRecommendation['severity']) {
  switch (severity) {
    case 'warning': return { border: 'border-yellow-300', bg: 'bg-yellow-50', icon: 'text-yellow-600' };
    case 'success': return { border: 'border-green-300', bg: 'bg-green-50', icon: 'text-green-600' };
    default:        return { border: 'border-blue-300',  bg: 'bg-blue-50',  icon: 'text-blue-600' };
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────────────

function WeatherIcon({ name, size = 24, className = '' }: { name: string; size?: number; className?: string }) {
  return <Icon name={name} size={size} className={className} />;
}

function HourlyCard({ point }: { point: HourlyPoint }) {
  return (
    <div className="flex flex-col items-center gap-1 min-w-[56px] px-2 py-2 rounded-lg bg-white/60 border border-gray-100">
      <span className="text-xs text-gray-500 font-medium">{point.hour}</span>
      <WeatherIcon name={point.icon} size={20} className="text-blue-500" />
      <span className="text-sm font-semibold text-gray-800">{point.temp}°</span>
    </div>
  );
}

function DayRow({ day }: { day: DayForecast }) {
  return (
    <div className="grid grid-cols-7 gap-2 items-center py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="col-span-1">
        <p className="font-semibold text-gray-800 text-sm">{day.day}</p>
        <p className="text-xs text-gray-400">{day.date}</p>
      </div>
      <div className="col-span-1 flex items-center gap-1">
        <WeatherIcon name={day.icon} size={18} className="text-blue-500" />
        <span className="text-xs text-gray-500 hidden lg:inline">{day.desc}</span>
      </div>
      <div className="col-span-1 text-center">
        <span className="text-sm font-medium text-blue-600">{day.min}°</span>
        <span className="text-gray-400 mx-1">/</span>
        <span className="text-sm font-semibold text-orange-500">{day.max}°</span>
      </div>
      <div className="col-span-1 flex items-center gap-1 justify-center">
        <WeatherIcon name="Droplets" size={14} className="text-blue-400" />
        <span className="text-xs text-gray-600">{day.precip} мм</span>
      </div>
      <div className="col-span-1 flex items-center gap-1 justify-center">
        <WeatherIcon name="Wind" size={14} className="text-gray-400" />
        <span className="text-xs text-gray-600">{day.wind} м/с</span>
      </div>
      <div className="col-span-2 flex justify-end">
        <Badge variant={riskBadgeVariant(day.risk)} className="text-xs">
          {riskLabel(day.risk)}
        </Badge>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────────

export default function WeatherWidgetFull() {
  const [updatedMinutes, setUpdatedMinutes] = useState(7);
  const [city, setCity] = useState('moscow');

  const cityLabels: Record<string, string> = {
    moscow: 'Москва',
    spb: 'Санкт-Петербург',
    krasnodar: 'Краснодар',
  };

  function handleRefresh() {
    setUpdatedMinutes(0);
    toast.success('Данные обновлены', {
      description: `Погода для города «${cityLabels[city]}» загружена из Яндекс.Погоды`,
    });
  }

  function handleApplyRecommendations() {
    toast.success('Рекомендации применены', {
      description: 'Наряды на понедельник–вторник перенесены на четверг–пятницу',
    });
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-50 min-h-screen">
      {/* ── Header ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <WeatherIcon name="CloudSun" size={22} className="text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Погода и планирование выездов</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">
                  Источник: Яндекс.Погода · обновлено {updatedMinutes === 0 ? 'только что' : `${updatedMinutes} мин. назад`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="w-44 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moscow">Москва</SelectItem>
                  <SelectItem value="spb">Санкт-Петербург</SelectItem>
                  <SelectItem value="krasnodar">Краснодар</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" onClick={handleRefresh} className="gap-1.5">
                <Icon name="RefreshCw" size={14} />
                Обновить
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="today">
        <TabsList className="mb-2">
          <TabsTrigger value="today">Сегодня</TabsTrigger>
          <TabsTrigger value="week">7 дней</TabsTrigger>
          <TabsTrigger value="impact">Влияние на работы</TabsTrigger>
          <TabsTrigger value="history">История</TabsTrigger>
        </TabsList>

        {/* ── TODAY ── */}
        <TabsContent value="today" className="flex flex-col gap-4">
          {/* Current conditions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-5xl font-bold text-gray-900">+18°C</p>
                    <p className="text-sm text-gray-500 mt-1">Ощущается как +15°C</p>
                    <p className="text-base text-gray-700 mt-2 font-medium">Переменная облачность</p>
                  </div>
                  {/* SVG weather icon */}
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Переменная облачность">
                    <circle cx="34" cy="32" r="16" fill="#FCD34D" />
                    <path d="M34 10V6M34 58V54M56 32h4M6 32h4M50.1 17.9l2.8-2.8M15.1 52.9l2.8-2.8M50.1 46.1l2.8 2.8M15.1 17.1l2.8 2.8" stroke="#FCD34D" strokeWidth="3" strokeLinecap="round" />
                    <rect x="18" y="38" width="44" height="18" rx="9" fill="#93C5FD" />
                    <rect x="26" y="32" width="30" height="16" rx="8" fill="#BFDBFE" />
                  </svg>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-5">
                  <div className="flex flex-col items-center p-2 rounded-lg bg-blue-50 gap-1">
                    <WeatherIcon name="Droplets" size={16} className="text-blue-500" />
                    <span className="text-xs text-gray-500">Влажность</span>
                    <span className="text-sm font-semibold text-gray-800">62%</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50 gap-1">
                    <WeatherIcon name="Wind" size={16} className="text-gray-500" />
                    <span className="text-xs text-gray-500">Ветер</span>
                    <span className="text-sm font-semibold text-gray-800">4 м/с</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-lg bg-purple-50 gap-1">
                    <WeatherIcon name="Gauge" size={16} className="text-purple-500" />
                    <span className="text-xs text-gray-500">Давление</span>
                    <span className="text-sm font-semibold text-gray-800">748 мм</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hourly cards */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Почасовой прогноз</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {HOURLY_DATA.map((p) => (
                    <HourlyCard key={p.hour} point={p} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hourly line chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Температура по часам, °C</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={HOURLY_DATA} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ fontSize: 12 }}
                    formatter={(value: number) => [`${value}°C`, 'Температура']}
                  />
                  <Line
                    type="monotone"
                    dataKey="temp"
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#3B82F6' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── WEEK ── */}
        <TabsContent value="week">
          <Card>
            <CardHeader className="pb-1">
              <div className="grid grid-cols-7 gap-2 px-3 text-xs text-gray-400 font-medium uppercase tracking-wide">
                <span className="col-span-1">День</span>
                <span className="col-span-1">Погода</span>
                <span className="col-span-1 text-center">Мин/Макс</span>
                <span className="col-span-1 text-center">Осадки</span>
                <span className="col-span-1 text-center">Ветер</span>
                <span className="col-span-2 text-right">Риск для работ</span>
              </div>
            </CardHeader>
            <CardContent className="pt-1">
              <div className="flex flex-col divide-y divide-gray-100">
                {WEEKLY_FORECAST.map((day) => (
                  <DayRow key={day.date} day={day} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── IMPACT ── */}
        <TabsContent value="impact" className="flex flex-col gap-4">
          {/* Risk matrix */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Матрица рисков: тип работ × погодные условия</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left p-2 text-gray-500 font-medium">Тип работ</th>
                      {CONDITIONS.map((c) => (
                        <th key={c} className="p-2 text-center text-gray-500 font-medium whitespace-nowrap">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {WORK_TYPES.map((wt, ri) => (
                      <tr key={wt} className="border-t border-gray-100">
                        <td className="p-2 font-medium text-gray-700 whitespace-nowrap">{wt}</td>
                        {CONDITIONS.map((c, ci) => {
                          const level = RISK_MATRIX[ri][ci];
                          return (
                            <td key={c} className="p-2 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold ${riskMatrixColor(level)}`}>
                                {level}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* AI recommendations */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <WeatherIcon name="Sparkles" size={18} className="text-purple-500" />
                  ИИ-рекомендации на ближайшие дни
                </CardTitle>
                <Button size="sm" onClick={handleApplyRecommendations} className="gap-1.5">
                  <Icon name="CheckCheck" size={14} />
                  Применить рекомендации
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {AI_RECOMMENDATIONS.map((rec) => {
                  const colors = recommendationColors(rec.severity);
                  return (
                    <div
                      key={rec.id}
                      className={`rounded-lg border p-4 flex flex-col gap-2 ${colors.border} ${colors.bg}`}
                    >
                      <div className="flex items-center gap-2">
                        <WeatherIcon name={rec.icon} size={18} className={colors.icon} />
                        <p className="font-semibold text-gray-800 text-sm">{rec.title}</p>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{rec.text}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── HISTORY ── */}
        <TabsContent value="history" className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Среднемесячная температура за год, °C</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={MONTHLY_HISTORY} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12 }}
                    formatter={(value: number) => [`${value}°C`, 'Средняя температура']}
                  />
                  <Bar
                    dataKey="avg"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                    name="Средняя температура"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-red-100">
                    <WeatherIcon name="CalendarX" size={20} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">2</p>
                    <p className="text-sm text-gray-500">Рабочих дня потеряно из-за погоды в мае</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-yellow-100">
                    <WeatherIcon name="TriangleAlert" size={20} className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">5</p>
                    <p className="text-sm text-gray-500">Нарядов перенесено из-за плохой погоды</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <WeatherIcon name="TrendingUp" size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">91%</p>
                    <p className="text-sm text-gray-500">Нарядов выполнено в срок (норма: 85%)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
