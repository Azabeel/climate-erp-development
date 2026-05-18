import { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

// ─── Static data ─────────────────────────────────────────────────────────────

const NPS_TREND = [
  { month: 'Июн', nps: 32 },
  { month: 'Июл', nps: 38 },
  { month: 'Авг', nps: 35 },
  { month: 'Сен', nps: 41 },
  { month: 'Окт', nps: 43 },
  { month: 'Ноя', nps: 40 },
  { month: 'Дек', nps: 44 },
  { month: 'Янв', nps: 42 },
  { month: 'Фев', nps: 45 },
  { month: 'Мар', nps: 46 },
  { month: 'Апр', nps: 48 },
  { month: 'Май', nps: 47 },
];

const SCORE_DISTRIBUTION = [
  { score: '1', count: 12 },
  { score: '2', count: 10 },
  { score: '3', count: 25 },
  { score: '4', count: 85 },
  { score: '5', count: 215 },
];

const SEGMENT_DATA = [
  { name: 'Промоутеры', value: 62, color: '#22c55e' },
  { name: 'Нейтральные', value: 23, color: '#f59e0b' },
  { name: 'Критики', value: 15, color: '#ef4444' },
];

const LOW_REASONS = [
  { reason: 'Долгое ожидание инженера', count: 18 },
  { reason: 'Высокая цена', count: 14 },
  { reason: 'Не решена проблема с первого раза', count: 11 },
  { reason: 'Недостаточное объяснение', count: 8 },
  { reason: 'Задержка с запчастями', count: 7 },
];

const HIGH_REASONS = [
  { reason: 'Профессионализм инженера', count: 98 },
  { reason: 'Быстрое реагирование', count: 74 },
  { reason: 'Аккуратность и чистота', count: 61 },
  { reason: 'Понятное объяснение', count: 53 },
  { reason: 'Справедливая цена', count: 42 },
];

const REVIEWS = [
  { id: 'r1', score: 5, client: 'ООО «Альфа Технологии»', engineer: 'Петров А.', date: '14.05.2026', text: 'Отличный сервис! Инженер приехал вовремя, быстро диагностировал проблему и устранил её. Очень доволен.', categories: ['Скорость', 'Качество'] },
  { id: 'r2', score: 5, client: 'Иванова М.А.', engineer: 'Сидоров К.', date: '13.05.2026', text: 'Всё сделали аккуратно, объяснили причины поломки. Рекомендую!', categories: ['Вежливость', 'Качество'] },
  { id: 'r3', score: 4, client: 'ТЦ «Мираж»', engineer: 'Козлов Д.', date: '12.05.2026', text: 'Работу выполнили хорошо, но пришлось немного подождать запчасти. В целом доволен результатом.', categories: ['Качество'] },
  { id: 'r4', score: 2, client: 'Смирнов В.В.', engineer: 'Никитин Р.', date: '11.05.2026', text: 'Мастер опоздал на 2 часа без предупреждения. Проблема решена, но впечатление испорчено.', categories: ['Скорость'] },
  { id: 'r5', score: 5, client: 'ООО «Берег»', engineer: 'Петров А.', date: '10.05.2026', text: 'Приезжают оперативно, цены адекватные. Уже третий раз обращаемся, всегда довольны.', categories: ['Скорость', 'Цена'] },
  { id: 'r6', score: 3, client: 'Кузнецова Е.И.', engineer: 'Сидоров К.', date: '09.05.2026', text: 'Кондиционер починили, но через неделю снова начал шуметь. Пришлось снова вызывать.', categories: ['Качество'] },
  { id: 'r7', score: 5, client: 'ООО «СтройГрупп»', engineer: 'Козлов Д.', date: '08.05.2026', text: 'Установили 4 сплит-системы, всё аккуратно, убрали за собой. Молодцы!', categories: ['Качество', 'Вежливость'] },
  { id: 'r8', score: 1, client: 'Орлов П.С.', engineer: 'Никитин Р.', date: '07.05.2026', text: 'Очень дорого за то, что просто почистили фильтр. Больше не буду обращаться.', categories: ['Цена'] },
  { id: 'r9', score: 4, client: 'ТЦ «Радуга»', engineer: 'Петров А.', date: '06.05.2026', text: 'Хорошее обслуживание, всё по договору. Оперативно реагируют при авариях. Зачли скидку по договору.', categories: ['Скорость', 'Цена'] },
  { id: 'r10', score: 5, client: 'ИП Фёдорова О.Г.', engineer: 'Сидоров К.', date: '05.05.2026', text: 'Всегда вежливые мастера. Объяснили как правильно ухаживать за оборудованием. Спасибо!', categories: ['Вежливость', 'Качество'] },
];

const ENGINEERS_NPS = [
  { name: 'Петров А.', nps: 68, csi: 4.8, orders: 87, responsed: 74, avg: 4.7 },
  { name: 'Сидоров К.', nps: 54, csi: 4.6, orders: 72, responsed: 61, avg: 4.5 },
  { name: 'Козлов Д.', nps: 49, csi: 4.5, orders: 64, responsed: 52, avg: 4.4 },
  { name: 'Никитин Р.', nps: 22, csi: 3.9, orders: 58, responsed: 49, avg: 3.7 },
  { name: 'Морозов Е.', nps: 61, csi: 4.7, orders: 66, responsed: 55, avg: 4.6 },
];

const ENGINEERS_CHART = ENGINEERS_NPS.map(e => ({ name: e.name, NPS: e.nps, CSI: Math.round(e.csi * 20) }));

const ANALYTICS_TREND = [
  { month: 'Июн', nps: 32, orders: 142, csi: 4.1 },
  { month: 'Июл', nps: 38, orders: 158, csi: 4.2 },
  { month: 'Авг', nps: 35, orders: 165, csi: 4.1 },
  { month: 'Сен', nps: 41, orders: 171, csi: 4.3 },
  { month: 'Окт', nps: 43, orders: 189, csi: 4.4 },
  { month: 'Ноя', nps: 40, orders: 175, csi: 4.3 },
  { month: 'Дек', nps: 44, orders: 210, csi: 4.5 },
  { month: 'Янв', nps: 42, orders: 148, csi: 4.4 },
  { month: 'Фев', nps: 45, orders: 155, csi: 4.5 },
  { month: 'Мар', nps: 46, orders: 178, csi: 4.5 },
  { month: 'Апр', nps: 48, orders: 195, csi: 4.6 },
  { month: 'Май', nps: 47, orders: 183, csi: 4.6 },
];

const WORK_TYPE_NPS = [
  { type: 'ТО', nps: 58 },
  { type: 'Монтаж', nps: 52 },
  { type: 'Ремонт', nps: 41 },
  { type: 'Гарантия', nps: 35 },
];

const WEEKDAY_NPS = [
  { day: 'Пн', nps: 44 },
  { day: 'Вт', nps: 49 },
  { day: 'Ср', nps: 48 },
  { day: 'Чт', nps: 46 },
  { day: 'Пт', nps: 42 },
  { day: 'Сб', nps: 38 },
  { day: 'Вс', nps: 31 },
];

const CATEGORY_COLORS: Record<string, string> = {
  Скорость: 'bg-blue-100 text-blue-700',
  Качество: 'bg-green-100 text-green-700',
  Вежливость: 'bg-purple-100 text-purple-700',
  Цена: 'bg-orange-100 text-orange-700',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StarRating({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Icon
          key={s}
          name="Star"
          size={14}
          className={s <= score ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );
}

function TrendIcon({ value }: { value: number }) {
  if (value > 0) return <Icon name="TrendingUp" size={14} className="text-green-500" />;
  if (value < 0) return <Icon name="TrendingDown" size={14} className="text-red-500" />;
  return <Icon name="Minus" size={14} className="text-gray-400" />;
}

function getNPSColor(nps: number) {
  if (nps >= 50) return 'text-green-600';
  if (nps >= 30) return 'text-amber-600';
  return 'text-red-600';
}

function getNPSLabel(nps: number) {
  if (nps >= 50) return { label: 'Отлично', color: 'bg-green-100 text-green-700' };
  if (nps >= 30) return { label: 'Хорошо', color: 'bg-amber-100 text-amber-700' };
  return { label: 'Плохо', color: 'bg-red-100 text-red-700' };
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KPICardProps {
  title: string;
  value: string;
  sub: string;
  trend: number;
  icon: string;
  iconColor: string;
}

function KPICard({ title, value, sub, trend, icon, iconColor }: KPICardProps) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{sub}</p>
          </div>
          <div className={`p-2 rounded-lg ${iconColor}`}>
            <Icon name={icon} size={20} />
          </div>
        </div>
        <div className="flex items-center gap-1 mt-3">
          <TrendIcon value={trend} />
          <span className={`text-xs font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'}`}>
            {trend > 0 ? `+${trend}` : trend} vs прошлый период
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── NPS Gauge ────────────────────────────────────────────────────────────────

function NPSGauge({ nps }: { nps: number }) {
  const pct = ((nps + 100) / 200) * 100;
  const { label, color } = getNPSLabel(nps);
  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <div className="relative w-full h-8 rounded-full overflow-hidden bg-gray-100 flex">
        <div className="h-full bg-red-300" style={{ width: '30%' }} />
        <div className="h-full bg-amber-300" style={{ width: '20%' }} />
        <div className="h-full bg-green-300" style={{ width: '50%' }} />
        <div
          className="absolute top-0 h-full w-1.5 bg-gray-800 rounded-sm shadow"
          style={{ left: `calc(${pct}% - 3px)` }}
        />
      </div>
      <div className="flex justify-between w-full text-xs text-gray-500 px-1">
        <span>−100 Плохо</span>
        <span>0</span>
        <span>30</span>
        <span>50</span>
        <span>+100 Отлично</span>
      </div>
      <div className="flex items-center gap-3 mt-2">
        <span className={`text-4xl font-extrabold ${getNPSColor(nps)}`}>{nps}</span>
        <Badge className={color}>{label}</Badge>
      </div>
      <p className="text-xs text-gray-400">Индекс потребительской лояльности</p>
    </div>
  );
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab() {
  const maxCount = Math.max(...SCORE_DISTRIBUTION.map(d => d.count));
  const maxLow = Math.max(...LOW_REASONS.map(r => r.count));
  const maxHigh = Math.max(...HIGH_REASONS.map(r => r.count));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Распределение оценок</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={SCORE_DISTRIBUTION} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="score" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [v, 'Отзывов']} />
                <Bar dataKey="count" name="Отзывов" radius={[4, 4, 0, 0]}>
                  {SCORE_DISTRIBUTION.map((entry, i) => (
                    <Cell key={i} fill={entry.score === '5' ? '#22c55e' : entry.score === '4' ? '#86efac' : entry.score === '3' ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Сегменты NPS</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={180}>
              <PieChart>
                <Pie data={SEGMENT_DATA} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                  {SEGMENT_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3">
              {SEGMENT_DATA.map(s => (
                <div key={s.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <div>
                    <p className="text-xs font-medium text-gray-700">{s.name}</p>
                    <p className="text-sm font-bold" style={{ color: s.color }}>{s.value}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Icon name="ThumbsDown" size={14} className="text-red-500" /> Топ-5 причин низких оценок
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {LOW_REASONS.map((r, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700">{r.reason}</span>
                  <span className="font-medium text-gray-900">{r.count}</span>
                </div>
                <Progress value={(r.count / maxLow) * 100} className="h-1.5 [&>div]:bg-red-400" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Icon name="ThumbsUp" size={14} className="text-green-500" /> Топ-5 причин высоких оценок
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {HIGH_REASONS.map((r, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700">{r.reason}</span>
                  <span className="font-medium text-gray-900">{r.count}</span>
                </div>
                <Progress value={(r.count / maxHigh) * 100} className="h-1.5 [&>div]:bg-green-400" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Tab: Reviews ─────────────────────────────────────────────────────────────

function ReviewsTab() {
  const [scoreFilter, setScoreFilter] = useState('all');
  const [engineerFilter, setEngineerFilter] = useState('all');

  const engineers = [...new Set(REVIEWS.map(r => r.engineer))];

  const filtered = REVIEWS.filter(r => {
    const matchScore = scoreFilter === 'all' || r.score === Number(scoreFilter);
    const matchEng = engineerFilter === 'all' || r.engineer === engineerFilter;
    return matchScore && matchEng;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <Select value={scoreFilter} onValueChange={setScoreFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Оценка" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все оценки</SelectItem>
            {[5, 4, 3, 2, 1].map(s => (
              <SelectItem key={s} value={String(s)}>{s} ★</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={engineerFilter} onValueChange={setEngineerFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Инженер" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все инженеры</SelectItem>
            {engineers.map(e => (
              <SelectItem key={e} value={e}>{e}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-gray-500 self-center">Найдено: {filtered.length}</span>
      </div>

      <div className="space-y-3">
        {filtered.map(r => (
          <Card key={r.id}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <StarRating score={r.score} />
                    <span className="font-semibold text-sm text-gray-800 truncate">{r.client}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-500">{r.engineer}</span>
                    <span className="text-xs text-gray-400">{r.date}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{r.text}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {r.categories.map(c => (
                      <span key={c} className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[c] || 'bg-gray-100 text-gray-600'}`}>{c}</span>
                    ))}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0"
                  onClick={() => toast.success(`Ответ на отзыв клиента ${r.client} отправлен`)}
                >
                  <Icon name="Reply" size={13} className="mr-1" />
                  Ответить
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Engineers ───────────────────────────────────────────────────────────

function EngineersTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">NPS и CSI по инженерам</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ENGINEERS_CHART} layout="vertical" margin={{ top: 4, right: 16, left: 60, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={60} />
              <Tooltip formatter={(v: number, name: string) => [name === 'CSI' ? `${(v / 20).toFixed(1)}/5.0` : v, name]} />
              <Legend />
              <Bar dataKey="NPS" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              <Bar dataKey="CSI" fill="#22c55e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-gray-500">
                <th className="text-left pb-2 font-medium">Инженер</th>
                <th className="text-right pb-2 font-medium">Нарядов</th>
                <th className="text-right pb-2 font-medium">Ср. оценка</th>
                <th className="text-right pb-2 font-medium">NPS</th>
                <th className="text-right pb-2 font-medium">% ответивших</th>
                <th className="text-right pb-2 font-medium">Тренд</th>
              </tr>
            </thead>
            <tbody>
              {ENGINEERS_NPS.map((e, i) => {
                const responsedPct = Math.round((e.responsed / e.orders) * 100);
                const trend = i % 3 === 0 ? 1 : i % 3 === 1 ? 0 : -1;
                return (
                  <tr key={e.name} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2.5 font-medium text-gray-800">{e.name}</td>
                    <td className="py-2.5 text-right text-gray-600">{e.orders}</td>
                    <td className="py-2.5 text-right">
                      <span className={e.avg >= 4.5 ? 'text-green-600 font-semibold' : e.avg >= 4.0 ? 'text-amber-600' : 'text-red-600'}>{e.avg.toFixed(1)}</span>
                    </td>
                    <td className="py-2.5 text-right">
                      <span className={`font-bold ${getNPSColor(e.nps)}`}>{e.nps}</span>
                    </td>
                    <td className="py-2.5 text-right text-gray-600">{responsedPct}%</td>
                    <td className="py-2.5 text-right"><TrendIcon value={trend} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Tab: Analytics ───────────────────────────────────────────────────────────

function AnalyticsTab() {
  const maxWT = Math.max(...WORK_TYPE_NPS.map(d => d.nps));
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">NPS + Наряды + CSI за 12 месяцев</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={ANALYTICS_TREND} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="right" dataKey="orders" name="Нарядов" fill="#e0e7ff" radius={[3, 3, 0, 0]} />
              <Line yAxisId="left" type="monotone" dataKey="nps" name="NPS" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              <Line yAxisId="left" type="monotone" dataKey="csi" name="CSI×10" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }}
                data={ANALYTICS_TREND.map(d => ({ ...d, csi: Math.round(d.csi * 10) }))} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">NPS по типу работ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {WORK_TYPE_NPS.map(w => (
              <div key={w.type}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700">{w.type}</span>
                  <span className={`font-bold ${getNPSColor(w.nps)}`}>{w.nps}</span>
                </div>
                <Progress value={(w.nps / 100) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">NPS по дням недели</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={WEEKDAY_NPS} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 60]} />
                <Tooltip formatter={(v: number) => [v, 'NPS']} />
                <ReferenceLine y={47} stroke="#6366f1" strokeDasharray="4 4" label={{ value: 'Сред', position: 'right', fontSize: 10 }} />
                <Bar dataKey="nps" name="NPS" radius={[4, 4, 0, 0]}>
                  {WEEKDAY_NPS.map((entry, i) => (
                    <Cell key={i} fill={entry.nps >= 47 ? '#22c55e' : entry.nps >= 35 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => toast.success('Отчёт по удовлетворённости клиентов формируется...')}
        >
          <Icon name="Download" size={14} className="mr-2" />
          Скачать отчёт
        </Button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CustomerSatisfactionFull() {
  const [period, setPeriod] = useState('month');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 rounded-lg">
            <Icon name="SmilePlus" size={22} className="text-violet-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Удовлетворённость клиентов</h1>
            <p className="text-sm text-gray-500">NPS · CSI · Отзывы · Аналитика</p>
          </div>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Этот месяц</SelectItem>
            <SelectItem value="quarter">Квартал</SelectItem>
            <SelectItem value="year">Год</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="NPS" value="47" sub="Пром 62% · Нейтр 23% · Крит 15%" trend={5} icon="TrendingUp" iconColor="bg-violet-100 text-violet-600" />
        <KPICard title="CSI" value="4.6 / 5.0" sub="92% удовлетворены" trend={3} icon="Star" iconColor="bg-amber-100 text-amber-600" />
        <KPICard title="Оценок получено" value="347" sub="Конверсия 68%" trend={28} icon="MessageSquare" iconColor="bg-blue-100 text-blue-600" />
        <KPICard title="Жалоб за месяц" value="8" sub="Обработано: 6 из 8" trend={-3} icon="AlertTriangle" iconColor="bg-red-100 text-red-600" />
      </div>

      {/* NPS Main Widget */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Icon name="Activity" size={14} className="text-violet-500" />
            Текущий NPS и тренд
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <NPSGauge nps={47} />
              <div className="flex justify-around mt-4 text-center">
                {SEGMENT_DATA.map(s => (
                  <div key={s.name}>
                    <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}%</p>
                    <p className="text-xs text-gray-500">{s.name}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">Тренд NPS за 12 месяцев</p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={NPS_TREND} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="npsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis domain={[20, 60]} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => [v, 'NPS']} />
                  <ReferenceLine y={30} stroke="#f59e0b" strokeDasharray="4 3" label={{ value: '30', fontSize: 10, fill: '#f59e0b' }} />
                  <ReferenceLine y={50} stroke="#22c55e" strokeDasharray="4 3" label={{ value: '50', fontSize: 10, fill: '#22c55e' }} />
                  <Area type="monotone" dataKey="nps" stroke="#8b5cf6" strokeWidth={2} fill="url(#npsGrad)" dot={{ r: 3, fill: '#8b5cf6' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="reviews">Отзывы</TabsTrigger>
          <TabsTrigger value="engineers">По инженерам</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><OverviewTab /></TabsContent>
        <TabsContent value="reviews"><ReviewsTab /></TabsContent>
        <TabsContent value="engineers"><EngineersTab /></TabsContent>
        <TabsContent value="analytics"><AnalyticsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
