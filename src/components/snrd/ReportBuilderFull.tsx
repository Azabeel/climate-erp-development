import { useState, useCallback } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type ChartType = 'bar' | 'line' | 'pie' | 'kpi' | 'table';
type SortDir = 'asc' | 'desc';

interface Metric {
  id: string;
  label: string;
  group: string;
  unit?: string;
  icon: string;
}

interface ReportWidget {
  id: string;
  metricId: string;
  metricLabel: string;
  chartType: ChartType;
  color: string;
  filterEngineer: string;
  filterClient: string;
  filterWorkType: string;
  sortDir: SortDir;
  kpiValue?: string;
  kpiChange?: string;
  kpiTrend?: 'up' | 'down' | 'flat';
}

interface ReportTemplate {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  widgets: Omit<ReportWidget, 'id'>[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PALETTE = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
];

const ENGINEERS = ['Все', 'Иванов И.И.', 'Петров П.П.', 'Сидоров С.С.', 'Козлов А.В.'];
const CLIENTS = ['Все', 'ООО «Климат»', 'ИП Петров', 'АО «Сервис»', 'ООО «Холод»'];
const WORK_TYPES = ['Все', 'Ремонт', 'ТО', 'Монтаж', 'Гарантия', 'Авария'];

// ─── Metric Library ───────────────────────────────────────────────────────────

const METRIC_GROUPS: { group: string; icon: string; metrics: Metric[] }[] = [
  {
    group: 'Наряды',
    icon: 'ClipboardList',
    metrics: [
      { id: 'wo_count', label: 'Кол-во нарядов', group: 'Наряды', unit: 'шт', icon: 'FileText' },
      { id: 'wo_time', label: 'Время выполнения', group: 'Наряды', unit: 'ч', icon: 'Clock' },
      { id: 'wo_sla', label: '% вовремя', group: 'Наряды', unit: '%', icon: 'CheckCircle' },
      { id: 'wo_revenue', label: 'Сумма выручки', group: 'Наряды', unit: '₽', icon: 'DollarSign' },
    ],
  },
  {
    group: 'Клиенты',
    icon: 'Users',
    metrics: [
      { id: 'cl_nps', label: 'NPS', group: 'Клиенты', unit: 'балл', icon: 'Star' },
      { id: 'cl_count', label: 'Кол-во клиентов', group: 'Клиенты', unit: 'шт', icon: 'UserPlus' },
      { id: 'cl_arpu', label: 'Выручка на клиента', group: 'Клиенты', unit: '₽', icon: 'TrendingUp' },
      { id: 'cl_churn', label: 'Churn rate', group: 'Клиенты', unit: '%', icon: 'TrendingDown' },
    ],
  },
  {
    group: 'Инженеры',
    icon: 'Wrench',
    metrics: [
      { id: 'eng_score', label: 'Балл эффективности', group: 'Инженеры', unit: '/10', icon: 'Award' },
      { id: 'eng_wo', label: 'Нарядов на инженера', group: 'Инженеры', unit: 'шт', icon: 'BarChart2' },
      { id: 'eng_margin', label: 'Маржа инженера', group: 'Инженеры', unit: '₽', icon: 'Percent' },
    ],
  },
  {
    group: 'Финансы',
    icon: 'DollarSign',
    metrics: [
      { id: 'fin_revenue', label: 'Выручка', group: 'Финансы', unit: '₽', icon: 'TrendingUp' },
      { id: 'fin_margin', label: 'Маржа%', group: 'Финансы', unit: '%', icon: 'Percent' },
      { id: 'fin_ebitda', label: 'EBITDA', group: 'Финансы', unit: '₽', icon: 'BarChart' },
      { id: 'fin_cost', label: 'Себестоимость', group: 'Финансы', unit: '₽', icon: 'Package' },
    ],
  },
];

// ─── Templates ────────────────────────────────────────────────────────────────

const TEMPLATES: ReportTemplate[] = [
  {
    id: 'monthly',
    label: 'Ежемесячный обзор',
    description: 'Выручка + маржа + NPS',
    icon: 'Calendar',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    widgets: [
      { metricId: 'fin_revenue', metricLabel: 'Выручка', chartType: 'line', color: '#3b82f6', filterEngineer: '', filterClient: '', filterWorkType: '', sortDir: 'desc', kpiValue: '2 840 000 ₽', kpiChange: '+12%', kpiTrend: 'up' },
      { metricId: 'fin_margin', metricLabel: 'Маржа%', chartType: 'kpi', color: '#10b981', filterEngineer: '', filterClient: '', filterWorkType: '', sortDir: 'desc', kpiValue: '34.2%', kpiChange: '+2.1%', kpiTrend: 'up' },
      { metricId: 'cl_nps', metricLabel: 'NPS', chartType: 'kpi', color: '#f59e0b', filterEngineer: '', filterClient: '', filterWorkType: '', sortDir: 'desc', kpiValue: '72', kpiChange: '+4', kpiTrend: 'up' },
    ],
  },
  {
    id: 'team',
    label: 'Эффективность команды',
    description: 'Инженеры + SLA',
    icon: 'Users',
    color: 'bg-green-50 border-green-200 text-green-700',
    widgets: [
      { metricId: 'eng_score', metricLabel: 'Балл эффективности', chartType: 'bar', color: '#10b981', filterEngineer: '', filterClient: '', filterWorkType: '', sortDir: 'desc', kpiValue: '8.4', kpiChange: '+0.3', kpiTrend: 'up' },
      { metricId: 'wo_sla', metricLabel: '% вовремя', chartType: 'kpi', color: '#3b82f6', filterEngineer: '', filterClient: '', filterWorkType: '', sortDir: 'desc', kpiValue: '91.5%', kpiChange: '+3.2%', kpiTrend: 'up' },
      { metricId: 'eng_wo', metricLabel: 'Нарядов на инженера', chartType: 'table', color: '#6366f1', filterEngineer: '', filterClient: '', filterWorkType: '', sortDir: 'desc' },
    ],
  },
  {
    id: 'clients',
    label: 'Отчёт по клиентам',
    description: 'Выручка + NPS + наряды',
    icon: 'UserCheck',
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    widgets: [
      { metricId: 'cl_arpu', metricLabel: 'Выручка на клиента', chartType: 'bar', color: '#8b5cf6', filterEngineer: '', filterClient: '', filterWorkType: '', sortDir: 'desc', kpiValue: '18 500 ₽', kpiChange: '+5%', kpiTrend: 'up' },
      { metricId: 'cl_count', metricLabel: 'Кол-во клиентов', chartType: 'kpi', color: '#06b6d4', filterEngineer: '', filterClient: '', filterWorkType: '', sortDir: 'desc', kpiValue: '153', kpiChange: '+7', kpiTrend: 'up' },
      { metricId: 'cl_churn', metricLabel: 'Churn rate', chartType: 'kpi', color: '#ef4444', filterEngineer: '', filterClient: '', filterWorkType: '', sortDir: 'asc', kpiValue: '3.8%', kpiChange: '-0.4%', kpiTrend: 'down' },
    ],
  },
  {
    id: 'financial',
    label: 'Финансовый отчёт',
    description: 'P&L + маржинальность',
    icon: 'TrendingUp',
    color: 'bg-amber-50 border-amber-200 text-amber-700',
    widgets: [
      { metricId: 'fin_revenue', metricLabel: 'Выручка', chartType: 'line', color: '#3b82f6', filterEngineer: '', filterClient: '', filterWorkType: '', sortDir: 'desc', kpiValue: '2 840 000 ₽', kpiChange: '+12%', kpiTrend: 'up' },
      { metricId: 'fin_cost', metricLabel: 'Себестоимость', chartType: 'bar', color: '#ef4444', filterEngineer: '', filterClient: '', filterWorkType: '', sortDir: 'desc', kpiValue: '1 870 000 ₽', kpiChange: '+8%', kpiTrend: 'up' },
      { metricId: 'fin_ebitda', metricLabel: 'EBITDA', chartType: 'kpi', color: '#10b981', filterEngineer: '', filterClient: '', filterWorkType: '', sortDir: 'desc', kpiValue: '970 000 ₽', kpiChange: '+18%', kpiTrend: 'up' },
      { metricId: 'fin_margin', metricLabel: 'Маржа%', chartType: 'kpi', color: '#f59e0b', filterEngineer: '', filterClient: '', filterWorkType: '', sortDir: 'desc', kpiValue: '34.2%', kpiChange: '+2.1%', kpiTrend: 'up' },
    ],
  },
  {
    id: 'ops',
    label: 'Операционный',
    description: 'Наряды + SLA + склад',
    icon: 'Settings',
    color: 'bg-slate-50 border-slate-200 text-slate-700',
    widgets: [
      { metricId: 'wo_count', metricLabel: 'Кол-во нарядов', chartType: 'bar', color: '#3b82f6', filterEngineer: '', filterClient: '', filterWorkType: '', sortDir: 'desc', kpiValue: '284', kpiChange: '+22', kpiTrend: 'up' },
      { metricId: 'wo_sla', metricLabel: '% вовремя', chartType: 'kpi', color: '#10b981', filterEngineer: '', filterClient: '', filterWorkType: '', sortDir: 'desc', kpiValue: '91.5%', kpiChange: '+3.2%', kpiTrend: 'up' },
      { metricId: 'wo_time', metricLabel: 'Время выполнения', chartType: 'line', color: '#f59e0b', filterEngineer: '', filterClient: '', filterWorkType: '', sortDir: 'asc' },
    ],
  },
];

// ─── Mock data ────────────────────────────────────────────────────────────────

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'];

function mockBarData(label: string) {
  return MONTHS.map((m) => ({ name: m, [label]: Math.floor(Math.random() * 80) + 20 }));
}

function mockLineData(label: string) {
  return ['01', '05', '10', '15', '20', '25', '30'].map((d) => ({
    name: d,
    [label]: Math.floor(Math.random() * 100) + 10,
  }));
}

function mockPieData() {
  return [
    { name: 'Выполнено', value: 62 },
    { name: 'В работе', value: 21 },
    { name: 'Новые', value: 11 },
    { name: 'Отменено', value: 6 },
  ];
}

function mockTableRows() {
  return [
    { name: 'Иванов И.И.', value: 127, change: '+8%', trend: 'up' },
    { name: 'Петров П.П.', value: 115, change: '+3%', trend: 'up' },
    { name: 'Сидоров С.С.', value: 98, change: '-2%', trend: 'down' },
    { name: 'Козлов А.В.', value: 87, change: '+12%', trend: 'up' },
    { name: 'Новиков Д.М.', value: 76, change: '+5%', trend: 'up' },
  ];
}

// ─── Widget Preview ───────────────────────────────────────────────────────────

function WidgetPreview({ widget }: { widget: ReportWidget }) {
  const label = widget.metricLabel;
  const color = widget.color;

  if (widget.chartType === 'kpi') {
    const trend = widget.kpiTrend ?? 'flat';
    const trendIcon = trend === 'up' ? 'TrendingUp' : trend === 'down' ? 'TrendingDown' : 'Minus';
    const trendColor = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-slate-400';
    return (
      <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
          <Icon name="BarChart2" size={18} style={{ color }} />
        </div>
        <div className="flex-1">
          <div className="text-xs text-slate-500 mb-0.5">{label}</div>
          <div className="text-xl font-bold text-slate-800">{widget.kpiValue ?? '—'}</div>
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
          <Icon name={trendIcon} size={14} />
          <span>{widget.kpiChange ?? ''}</span>
        </div>
      </div>
    );
  }

  if (widget.chartType === 'table') {
    const rows = mockTableRows();
    return (
      <div className="overflow-hidden rounded-lg border border-slate-100">
        <table className="w-full text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-3 py-1.5 text-slate-500 font-medium">Сотрудник</th>
              <th className="text-right px-3 py-1.5 text-slate-500 font-medium">Значение</th>
              <th className="text-right px-3 py-1.5 text-slate-500 font-medium">Δ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                <td className="px-3 py-1.5 text-slate-700">{r.name}</td>
                <td className="px-3 py-1.5 text-right font-medium text-slate-800">{r.value}</td>
                <td className={`px-3 py-1.5 text-right font-medium ${r.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>{r.change}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (widget.chartType === 'pie') {
    const data = mockPieData();
    return (
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={60} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
            {data.map((_, idx) => (
              <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (widget.chartType === 'line') {
    const data = mockLineData(label);
    return (
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Line type="monotone" dataKey={label} stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // bar (default)
  const data = mockBarData(label);
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 10 }} />
        <Bar dataKey={label} fill={color} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReportBuilderFull() {
  const [reportTitle, setReportTitle] = useState('Новый отчёт');
  const [dateFrom, setDateFrom] = useState('2026-04-01');
  const [dateTo, setDateTo] = useState('2026-04-30');
  const [widgets, setWidgets] = useState<ReportWidget[]>([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [nextColor, setNextColor] = useState(0);

  const selectedWidget = widgets.find((w) => w.id === selectedWidgetId) ?? null;

  // ── Helpers ────────────────────────────────────────────────────────────────

  const genId = () => `w_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const addMetric = useCallback(
    (metric: Metric) => {
      const color = PALETTE[nextColor % PALETTE.length];
      setNextColor((c) => c + 1);
      const widget: ReportWidget = {
        id: genId(),
        metricId: metric.id,
        metricLabel: metric.label,
        chartType: 'bar',
        color,
        filterEngineer: '',
        filterClient: '',
        filterWorkType: '',
        sortDir: 'desc',
        kpiValue: '—',
        kpiChange: '—',
        kpiTrend: 'flat',
      };
      setWidgets((prev) => [...prev, widget]);
      setSelectedWidgetId(widget.id);
      toast.success(`Метрика «${metric.label}» добавлена`);
    },
    [nextColor]
  );

  const removeWidget = (id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
    if (selectedWidgetId === id) setSelectedWidgetId(null);
  };

  const moveWidget = (id: string, dir: 'up' | 'down') => {
    setWidgets((prev) => {
      const idx = prev.findIndex((w) => w.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      if (dir === 'up' && idx > 0) [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      if (dir === 'down' && idx < prev.length - 1) [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };

  const updateWidget = (id: string, patch: Partial<ReportWidget>) => {
    setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  };

  const loadTemplate = (tpl: ReportTemplate) => {
    setActiveTemplate(tpl.id);
    setReportTitle(tpl.label);
    const loaded = tpl.widgets.map((w) => ({ ...w, id: genId() }));
    setWidgets(loaded);
    setSelectedWidgetId(loaded[0]?.id ?? null);
    toast.success(`Шаблон «${tpl.label}» загружен`);
  };

  const addBlankWidget = () => {
    const color = PALETTE[nextColor % PALETTE.length];
    setNextColor((c) => c + 1);
    const w: ReportWidget = {
      id: genId(),
      metricId: 'wo_count',
      metricLabel: 'Кол-во нарядов',
      chartType: 'bar',
      color,
      filterEngineer: '',
      filterClient: '',
      filterWorkType: '',
      sortDir: 'desc',
      kpiValue: '—',
      kpiChange: '—',
      kpiTrend: 'flat',
    };
    setWidgets((prev) => [...prev, w]);
    setSelectedWidgetId(w.id);
  };

  const chartTypeLabel = (t: ChartType) =>
    ({ bar: 'Столбцы', line: 'Линия', pie: 'Круговой', kpi: 'KPI-карточка', table: 'Таблица' }[t]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen bg-slate-100 font-sans text-sm select-none overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Icon name="BarChart2" size={16} className="text-white" />
          </div>
          <div>
            <div className="font-semibold text-slate-800">Конструктор отчётов</div>
            <div className="text-xs text-slate-400">АСУ СЦ «Сервис Климат»</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs text-slate-500">
            <Icon name="Layers" size={11} className="mr-1" />
            {widgets.length} виджет{widgets.length === 1 ? '' : widgets.length < 5 ? 'а' : 'ов'}
          </Badge>
          <div className="w-px h-5 bg-slate-200" />
          <Button size="sm" variant="ghost" onClick={() => toast.info('Предпросмотр отчёта')} className="text-slate-600">
            <Icon name="Eye" size={14} className="mr-1.5" />
            Предпросмотр
          </Button>
          <Button size="sm" variant="ghost" onClick={() => toast.success('Шаблон сохранён')} className="text-slate-600">
            <Icon name="Bookmark" size={14} className="mr-1.5" />
            Сохранить шаблон
          </Button>
          <Button size="sm" variant="ghost" onClick={() => toast.info('Экспорт в Excel...')} className="text-slate-600">
            <Icon name="FileSpreadsheet" size={14} className="mr-1.5" />
            Excel
          </Button>
          <Button size="sm" variant="ghost" onClick={() => toast.info('Экспорт в PDF...')} className="text-slate-600">
            <Icon name="FileDown" size={14} className="mr-1.5" />
            PDF
          </Button>
          <Button
            size="sm"
            onClick={() => toast.success('Запланирована отправка отчёта')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Icon name="Send" size={14} className="mr-1.5" />
            Запланировать отправку
          </Button>
        </div>
      </div>

      {/* ── Templates Bar ───────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-5 py-2.5 flex items-center gap-3 overflow-x-auto">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
          Шаблоны:
        </span>
        {TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => loadTemplate(tpl)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap transition-all ${
              activeTemplate === tpl.id
                ? tpl.color + ' ring-2 ring-offset-1 ring-blue-400'
                : tpl.color + ' hover:opacity-80'
            }`}
          >
            <Icon name={tpl.icon as any} size={13} />
            {tpl.label}
          </button>
        ))}
      </div>

      {/* ── 3-panel body ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT PANEL — Metric Library ─────────────────────────────────── */}
        <aside className="w-60 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Icon name="Database" size={14} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Библиотека метрик
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {METRIC_GROUPS.map((group) => (
              <div key={group.group}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon name={group.icon as any} size={13} className="text-slate-400" />
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {group.group}
                  </span>
                </div>
                <div className="space-y-1">
                  {group.metrics.map((metric) => (
                    <div
                      key={metric.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-50 group transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon name={metric.icon as any} size={12} className="text-slate-400 flex-shrink-0" />
                        <span className="text-xs text-slate-700 truncate">{metric.label}</span>
                        {metric.unit && (
                          <span className="text-[10px] text-slate-400 flex-shrink-0">{metric.unit}</span>
                        )}
                      </div>
                      <button
                        onClick={() => addMetric(metric)}
                        className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-all"
                        title="Добавить"
                      >
                        <Icon name="Plus" size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── CENTER PANEL — Report Canvas ─────────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
          {/* Canvas header */}
          <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center gap-4">
            <Icon name="FileBarChart" size={16} className="text-slate-400 flex-shrink-0" />
            <Input
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="font-semibold text-slate-800 text-base border-0 shadow-none p-0 h-auto bg-transparent focus-visible:ring-0 w-64"
              placeholder="Название отчёта..."
            />
            <div className="flex items-center gap-2 ml-auto">
              <Icon name="CalendarRange" size={14} className="text-slate-400" />
              <span className="text-xs text-slate-500">Период:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="text-xs border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <span className="text-slate-400">—</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="text-xs border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Widget list */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {widgets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <Icon name="LayoutDashboard" size={28} className="text-slate-300" />
                </div>
                <div className="text-slate-500 font-medium mb-1">Холст пустой</div>
                <div className="text-xs text-slate-400 mb-4">
                  Выберите шаблон или добавьте метрики из левой панели
                </div>
                <Button size="sm" onClick={addBlankWidget} variant="outline">
                  <Icon name="Plus" size={14} className="mr-1.5" />
                  Добавить виджет
                </Button>
              </div>
            ) : (
              <>
                {widgets.map((widget, idx) => (
                  <div
                    key={widget.id}
                    onClick={() => setSelectedWidgetId(widget.id)}
                    className={`bg-white rounded-xl border-2 transition-all cursor-pointer ${
                      selectedWidgetId === widget.id
                        ? 'border-blue-400 shadow-md shadow-blue-100'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Widget header */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: widget.color }}
                        />
                        <span className="text-sm font-medium text-slate-700">{widget.metricLabel}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-slate-400">
                          {chartTypeLabel(widget.chartType)}
                        </Badge>
                        {widget.filterEngineer && widget.filterEngineer !== 'Все' && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-blue-500 border-blue-200">
                            <Icon name="User" size={9} className="mr-0.5" />
                            {widget.filterEngineer}
                          </Badge>
                        )}
                        {widget.filterClient && widget.filterClient !== 'Все' && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-purple-500 border-purple-200">
                            <Icon name="Building2" size={9} className="mr-0.5" />
                            {widget.filterClient}
                          </Badge>
                        )}
                        {widget.filterWorkType && widget.filterWorkType !== 'Все' && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-amber-500 border-amber-200">
                            <Icon name="Wrench" size={9} className="mr-0.5" />
                            {widget.filterWorkType}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); moveWidget(widget.id, 'up'); }}
                          disabled={idx === 0}
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Icon name="ChevronUp" size={13} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveWidget(widget.id, 'down'); }}
                          disabled={idx === widgets.length - 1}
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Icon name="ChevronDown" size={13} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeWidget(widget.id); }}
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Icon name="X" size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Widget preview */}
                    <div className="p-4">
                      <WidgetPreview widget={widget} />
                    </div>
                  </div>
                ))}

                <button
                  onClick={addBlankWidget}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Icon name="Plus" size={15} />
                  Добавить виджет
                </button>
              </>
            )}
          </div>
        </main>

        {/* ── RIGHT PANEL — Widget Settings ────────────────────────────────── */}
        <aside className="w-70 bg-white border-l border-slate-200 flex flex-col overflow-hidden" style={{ width: 280 }}>
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Icon name="SlidersHorizontal" size={14} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Настройки виджета
              </span>
            </div>
          </div>

          {selectedWidget ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Chart type */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Тип визуализации
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {(['bar', 'line', 'pie', 'kpi', 'table'] as ChartType[]).map((t) => {
                    const icons: Record<ChartType, string> = {
                      bar: 'BarChart2',
                      line: 'TrendingUp',
                      pie: 'PieChart',
                      kpi: 'Gauge',
                      table: 'Table',
                    };
                    const labels: Record<ChartType, string> = {
                      bar: 'Бар',
                      line: 'Линия',
                      pie: 'Круг',
                      kpi: 'KPI',
                      table: 'Таблица',
                    };
                    return (
                      <button
                        key={t}
                        onClick={() => updateWidget(selectedWidget.id, { chartType: t })}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-[10px] font-medium transition-all ${
                          selectedWidget.chartType === t
                            ? 'border-blue-400 bg-blue-50 text-blue-600'
                            : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                        title={labels[t]}
                      >
                        <Icon name={icons[t] as any} size={14} />
                        <span>{labels[t]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Metric */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Метрика
                </label>
                <select
                  value={selectedWidget.metricId}
                  onChange={(e) => {
                    const metric = METRIC_GROUPS.flatMap((g) => g.metrics).find((m) => m.id === e.target.value);
                    if (metric) updateWidget(selectedWidget.id, { metricId: metric.id, metricLabel: metric.label });
                  }}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                >
                  {METRIC_GROUPS.map((g) => (
                    <optgroup key={g.group} label={g.group}>
                      {g.metrics.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                          {m.unit ? ` (${m.unit})` : ''}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Color */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Цвет
                </label>
                <div className="flex gap-2 flex-wrap">
                  {PALETTE.map((c) => (
                    <button
                      key={c}
                      onClick={() => updateWidget(selectedWidget.id, { color: c })}
                      className={`w-7 h-7 rounded-full transition-all ${
                        selectedWidget.color === c ? 'ring-2 ring-offset-2 ring-blue-400 scale-110' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* KPI fields (only for kpi type) */}
              {selectedWidget.chartType === 'kpi' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    KPI данные
                  </label>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-slate-500 block mb-1">Значение</span>
                      <Input
                        value={selectedWidget.kpiValue ?? ''}
                        onChange={(e) => updateWidget(selectedWidget.id, { kpiValue: e.target.value })}
                        className="h-8 text-xs"
                        placeholder="напр. 2 840 000 ₽"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block mb-1">Изменение</span>
                      <Input
                        value={selectedWidget.kpiChange ?? ''}
                        onChange={(e) => updateWidget(selectedWidget.id, { kpiChange: e.target.value })}
                        className="h-8 text-xs"
                        placeholder="напр. +12%"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block mb-1">Тренд</span>
                      <div className="flex gap-2">
                        {(['up', 'flat', 'down'] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => updateWidget(selectedWidget.id, { kpiTrend: t })}
                            className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                              selectedWidget.kpiTrend === t
                                ? t === 'up'
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                                  : t === 'down'
                                  ? 'bg-red-50 border-red-300 text-red-600'
                                  : 'bg-slate-100 border-slate-300 text-slate-600'
                                : 'border-slate-200 text-slate-400 hover:bg-slate-50'
                            }`}
                          >
                            {t === 'up' ? '↑' : t === 'down' ? '↓' : '→'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* Filters */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Фильтры
                </label>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">По инженеру</span>
                    <select
                      value={selectedWidget.filterEngineer}
                      onChange={(e) => updateWidget(selectedWidget.id, { filterEngineer: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    >
                      {ENGINEERS.map((e) => (
                        <option key={e} value={e === 'Все' ? '' : e}>
                          {e}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">По клиенту</span>
                    <select
                      value={selectedWidget.filterClient}
                      onChange={(e) => updateWidget(selectedWidget.id, { filterClient: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    >
                      {CLIENTS.map((c) => (
                        <option key={c} value={c === 'Все' ? '' : c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">По типу работ</span>
                    <select
                      value={selectedWidget.filterWorkType}
                      onChange={(e) => updateWidget(selectedWidget.id, { filterWorkType: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    >
                      {WORK_TYPES.map((t) => (
                        <option key={t} value={t === 'Все' ? '' : t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Сортировка
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateWidget(selectedWidget.id, { sortDir: 'asc' })}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-medium transition-all ${
                      selectedWidget.sortDir === 'asc'
                        ? 'border-blue-400 bg-blue-50 text-blue-600'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Icon name="ArrowUp" size={12} />
                    По возр.
                  </button>
                  <button
                    onClick={() => updateWidget(selectedWidget.id, { sortDir: 'desc' })}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-medium transition-all ${
                      selectedWidget.sortDir === 'desc'
                        ? 'border-blue-400 bg-blue-50 text-blue-600'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Icon name="ArrowDown" size={12} />
                    По убыв.
                  </button>
                </div>
              </div>

              {/* Delete */}
              <div className="pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeWidget(selectedWidget.id)}
                  className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 border border-dashed border-red-200"
                >
                  <Icon name="Trash2" size={13} className="mr-1.5" />
                  Удалить виджет
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                <Icon name="MousePointerClick" size={20} className="text-slate-300" />
              </div>
              <div className="text-sm text-slate-500 font-medium mb-1">Выберите виджет</div>
              <div className="text-xs text-slate-400">
                Кликните на виджет в холсте, чтобы настроить его параметры
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* ── Bottom Panel ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-t border-slate-200 px-5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Icon name="Info" size={13} />
          <span>
            Период: <span className="text-slate-600 font-medium">{dateFrom}</span>
            {' — '}
            <span className="text-slate-600 font-medium">{dateTo}</span>
          </span>
          <span className="text-slate-200">|</span>
          <span>
            Виджетов: <span className="text-slate-600 font-medium">{widgets.length}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.info('Открываем предпросмотр...')}
            className="text-slate-600"
          >
            <Icon name="Eye" size={13} className="mr-1.5" />
            Предпросмотр
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.success('Шаблон сохранён в библиотеке')}
            className="text-slate-600"
          >
            <Icon name="Bookmark" size={13} className="mr-1.5" />
            Сохранить шаблон
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.info('Экспорт в PDF запущен...')}
            className="text-slate-600"
          >
            <Icon name="FileDown" size={13} className="mr-1.5" />
            Экспорт PDF
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.info('Экспорт в Excel запущен...')}
            className="text-slate-600"
          >
            <Icon name="FileSpreadsheet" size={13} className="mr-1.5" />
            Экспорт Excel
          </Button>
          <Button
            size="sm"
            onClick={() => toast.success('Отправка отчёта запланирована')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Icon name="CalendarClock" size={13} className="mr-1.5" />
            Запланировать отправку
          </Button>
        </div>
      </div>
    </div>
  );
}
