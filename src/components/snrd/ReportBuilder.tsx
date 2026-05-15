import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

// ─── Types ───────────────────────────────────────────────────────────────────

type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'table';
type Period = '7d' | '30d' | '90d' | 'year';
type Grouping = 'day' | 'week' | 'month';

interface Metric {
  id: string;
  label: string;
  group: string;
  unit?: string;
}

interface ReportWidget {
  id: string;
  metricId: string;
  metricLabel: string;
  chartType: ChartType;
  period: Period;
  grouping: Grouping;
  filterEngineer: string;
  filterClient: string;
}

// ─── Mock data generators ─────────────────────────────────────────────────────

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function mockBarData(label: string) {
  const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'];
  return months.map((m) => ({
    name: m,
    [label]: Math.floor(Math.random() * 80) + 20,
  }));
}

function mockLineData(label: string) {
  const days = ['01', '05', '10', '15', '20', '25', '30'];
  return days.map((d) => ({
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

function mockAreaData(label: string) {
  const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];
  return weeks.map((w) => ({
    name: w,
    [label]: Math.floor(Math.random() * 120) + 30,
  }));
}

function mockTableData() {
  return [
    { name: 'Иванов И.И.', value: 127, change: '+8%' },
    { name: 'Петров П.П.', value: 115, change: '+3%' },
    { name: 'Сидоров С.С.', value: 98, change: '-2%' },
    { name: 'Козлов А.В.', value: 87, change: '+12%' },
    { name: 'Новиков Д.М.', value: 76, change: '+5%' },
  ];
}

// ─── Metric Library ───────────────────────────────────────────────────────────

const METRIC_GROUPS: { group: string; metrics: Metric[] }[] = [
  {
    group: 'Наряды',
    metrics: [
      { id: 'wo_count', label: 'Количество нарядов', group: 'Наряды' },
      { id: 'wo_statuses', label: 'Статусы нарядов', group: 'Наряды' },
      { id: 'wo_time', label: 'Среднее время выполнения', group: 'Наряды', unit: 'ч' },
    ],
  },
  {
    group: 'Финансы',
    metrics: [
      { id: 'fin_revenue', label: 'Выручка', group: 'Финансы', unit: '₽' },
      { id: 'fin_cost', label: 'Себестоимость', group: 'Финансы', unit: '₽' },
      { id: 'fin_margin', label: 'Маржа', group: 'Финансы', unit: '%' },
    ],
  },
  {
    group: 'Клиенты',
    metrics: [
      { id: 'cl_new', label: 'Новые клиенты', group: 'Клиенты' },
      { id: 'cl_active', label: 'Активные клиенты', group: 'Клиенты' },
      { id: 'cl_nps', label: 'NPS', group: 'Клиенты', unit: 'балл' },
    ],
  },
  {
    group: 'Инженеры',
    metrics: [
      { id: 'eng_load', label: 'Загрузка инженеров', group: 'Инженеры', unit: '%' },
      { id: 'eng_eff', label: 'Эффективность', group: 'Инженеры', unit: '%' },
    ],
  },
];

// ─── Preset Templates ─────────────────────────────────────────────────────────

const TEMPLATES: { id: string; label: string; widgets: Omit<ReportWidget, 'id'>[] }[] = [
  {
    id: 'monthly_manager',
    label: 'Ежемесячный отчёт руководителя',
    widgets: [
      {
        metricId: 'wo_count',
        metricLabel: 'Количество нарядов',
        chartType: 'bar',
        period: '30d',
        grouping: 'week',
        filterEngineer: '',
        filterClient: '',
      },
      {
        metricId: 'fin_revenue',
        metricLabel: 'Выручка',
        chartType: 'area',
        period: '30d',
        grouping: 'week',
        filterEngineer: '',
        filterClient: '',
      },
      {
        metricId: 'wo_statuses',
        metricLabel: 'Статусы нарядов',
        chartType: 'pie',
        period: '30d',
        grouping: 'month',
        filterEngineer: '',
        filterClient: '',
      },
    ],
  },
  {
    id: 'engineer_eff',
    label: 'Анализ эффективности инженеров',
    widgets: [
      {
        metricId: 'eng_eff',
        metricLabel: 'Эффективность',
        chartType: 'bar',
        period: '90d',
        grouping: 'month',
        filterEngineer: '',
        filterClient: '',
      },
      {
        metricId: 'eng_load',
        metricLabel: 'Загрузка инженеров',
        chartType: 'line',
        period: '90d',
        grouping: 'week',
        filterEngineer: '',
        filterClient: '',
      },
      {
        metricId: 'wo_time',
        metricLabel: 'Среднее время выполнения',
        chartType: 'table',
        period: '30d',
        grouping: 'month',
        filterEngineer: '',
        filterClient: '',
      },
    ],
  },
  {
    id: 'finance_summary',
    label: 'Финансовая сводка',
    widgets: [
      {
        metricId: 'fin_revenue',
        metricLabel: 'Выручка',
        chartType: 'area',
        period: 'year',
        grouping: 'month',
        filterEngineer: '',
        filterClient: '',
      },
      {
        metricId: 'fin_cost',
        metricLabel: 'Себестоимость',
        chartType: 'line',
        period: 'year',
        grouping: 'month',
        filterEngineer: '',
        filterClient: '',
      },
      {
        metricId: 'fin_margin',
        metricLabel: 'Маржа',
        chartType: 'bar',
        period: 'year',
        grouping: 'month',
        filterEngineer: '',
        filterClient: '',
      },
    ],
  },
];

let widgetCounter = 0;
function generateId() {
  widgetCounter += 1;
  return `widget_${Date.now()}_${widgetCounter}`;
}

// ─── Chart type icon name helper ──────────────────────────────────────────────

function chartIconName(type: ChartType): string {
  switch (type) {
    case 'bar':
      return 'BarChart3';
    case 'line':
      return 'TrendingUp';
    case 'pie':
      return 'PieChart';
    case 'area':
      return 'TrendingUp';
    case 'table':
      return 'Table';
  }
}

// ─── Chart renderer ───────────────────────────────────────────────────────────

function ChartRenderer({ widget }: { widget: ReportWidget }) {
  const key = widget.metricLabel;

  if (widget.chartType === 'bar') {
    const data = mockBarData(key);
    return (
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey={key} fill="#3b82f6" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (widget.chartType === 'line') {
    const data = mockLineData(key);
    return (
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line type="monotone" dataKey={key} stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (widget.chartType === 'pie') {
    const data = mockPieData();
    return (
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={70}
            dataKey="value"
            label={({ name, value }: { name: string; value: number }) => `${name}: ${value}%`}
            labelLine={false}
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (widget.chartType === 'area') {
    const data = mockAreaData(key);
    return (
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Area type="monotone" dataKey={key} stroke="#8b5cf6" fill="#ede9fe" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // table
  const rows = mockTableData();
  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 pr-4 text-gray-500 font-medium">Имя</th>
            <th className="text-right py-2 pr-4 text-gray-500 font-medium">Значение</th>
            <th className="text-right py-2 text-gray-500 font-medium">Изменение</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-100 last:border-0">
              <td className="py-2 pr-4 text-gray-800">{row.name}</td>
              <td className="py-2 pr-4 text-right font-semibold text-gray-900">{row.value}</td>
              <td
                className={`py-2 text-right font-medium ${
                  row.change.startsWith('+') ? 'text-green-600' : 'text-red-500'
                }`}
              >
                {row.change}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

const CHART_TYPES: { type: ChartType; label: string }[] = [
  { type: 'bar', label: 'Столбч.' },
  { type: 'line', label: 'Линейн.' },
  { type: 'pie', label: 'Круговая' },
  { type: 'area', label: 'Площадь' },
  { type: 'table', label: 'Таблица' },
];

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: '7d', label: '7 дней' },
  { value: '30d', label: '30 дней' },
  { value: '90d', label: '90 дней' },
  { value: 'year', label: 'Год' },
];

const GROUPING_OPTIONS: { value: Grouping; label: string }[] = [
  { value: 'day', label: 'День' },
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
];

const ENGINEERS = ['', 'Иванов И.И.', 'Петров П.П.', 'Сидоров С.С.', 'Козлов А.В.'];
const CLIENTS = ['', 'ООО «АрктикМаш»', 'ИП Смирнов', 'ТРЦ «Галактика»', 'ООО «ТехноСтрой»'];

const ReportBuilder = () => {
  const [widgets, setWidgets] = useState<ReportWidget[]>([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    METRIC_GROUPS.map((g) => g.group),
  );
  const [savedMessage, setSavedMessage] = useState('');

  const selectedWidget = widgets.find((w) => w.id === selectedWidgetId) ?? null;

  // ── Metric library helpers ──────────────────────────────────────────────────

  function toggleGroup(group: string) {
    setExpandedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group],
    );
  }

  function addMetric(metric: Metric) {
    const widget: ReportWidget = {
      id: generateId(),
      metricId: metric.id,
      metricLabel: metric.label,
      chartType: 'bar',
      period: '30d',
      grouping: 'month',
      filterEngineer: '',
      filterClient: '',
    };
    setWidgets((prev) => [...prev, widget]);
    setSelectedWidgetId(widget.id);
    setPreviewMode(false);
  }

  // ── Widget canvas helpers ───────────────────────────────────────────────────

  function removeWidget(id: string) {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
    if (selectedWidgetId === id) setSelectedWidgetId(null);
  }

  function updateWidgetChartType(id: string, chartType: ChartType) {
    setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, chartType } : w)));
  }

  function updateSelectedWidget(patch: Partial<ReportWidget>) {
    if (!selectedWidgetId) return;
    setWidgets((prev) => prev.map((w) => (w.id === selectedWidgetId ? { ...w, ...patch } : w)));
  }

  // ── Template loading ────────────────────────────────────────────────────────

  function loadTemplate(templateId: string) {
    const tpl = TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    const newWidgets: ReportWidget[] = tpl.widgets.map((w) => ({ ...w, id: generateId() }));
    setWidgets(newWidgets);
    setSelectedWidgetId(null);
    setPreviewMode(false);
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  function handleExport() {
    setSavedMessage('PDF сформирован (имитация экспорта)');
    setTimeout(() => setSavedMessage(''), 3000);
  }

  function handleSaveTemplate() {
    setSavedMessage('Шаблон сохранён');
    setTimeout(() => setSavedMessage(''), 3000);
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* ── Top toolbar ── */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <Icon name="BarChart3" size={20} className="text-blue-600" />
          <span className="font-semibold text-gray-900 text-lg">Конструктор отчётов</span>
        </div>

        {/* Template quick-start */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 mr-1">Шаблоны:</span>
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => loadTemplate(tpl.id)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition-colors"
            >
              {tpl.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {savedMessage && (
            <span className="text-sm text-green-600 font-medium">{savedMessage}</span>
          )}
          <Button
            variant={previewMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode((v) => !v)}
          >
            <Icon name="Eye" size={15} className="mr-1.5" />
            Предпросмотр
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Icon name="Download" size={15} className="mr-1.5" />
            Экспорт PDF
          </Button>
          <Button size="sm" onClick={handleSaveTemplate}>
            <Icon name="FileText" size={15} className="mr-1.5" />
            Сохранить шаблон
          </Button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left panel: metric library ── */}
        {!previewMode && (
          <div className="w-64 shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Библиотека метрик
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Нажмите для добавления</p>
            </div>

            <div className="p-2">
              {METRIC_GROUPS.map((group) => {
                const isExpanded = expandedGroups.includes(group.group);
                return (
                  <div key={group.group} className="mb-1">
                    <button
                      onClick={() => toggleGroup(group.group)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
                    >
                      <span>{group.group}</span>
                      <Icon
                        name={isExpanded ? 'ChevronDown' : 'ChevronRight'}
                        size={14}
                        className="text-gray-400"
                      />
                    </button>
                    {isExpanded && (
                      <div className="ml-2 mb-1">
                        {group.metrics.map((metric) => (
                          <button
                            key={metric.id}
                            onClick={() => addMetric(metric)}
                            className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-700 text-sm text-gray-600 transition-colors group"
                          >
                            <Icon
                              name="Plus"
                              size={13}
                              className="text-gray-300 group-hover:text-blue-500 shrink-0"
                            />
                            <span className="truncate">{metric.label}</span>
                            {metric.unit && (
                              <span className="ml-auto text-xs text-gray-400 shrink-0">
                                {metric.unit}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Centre: canvas ── */}
        <div
          className={`flex-1 overflow-y-auto p-6 ${previewMode ? 'bg-white' : 'bg-gray-50'}`}
          onClick={() => {
            if (!previewMode) setSelectedWidgetId(null);
          }}
        >
          {previewMode ? (
            // Preview mode
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Предпросмотр отчёта</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {widgets.length === 0
                    ? 'Отчёт пуст. Добавьте метрики через библиотеку или загрузите шаблон.'
                    : `${widgets.length} виджет(ов)`}
                </p>
              </div>
              {widgets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <Icon name="BarChart3" size={48} className="mb-4 opacity-30" />
                  <p className="text-sm">Нет виджетов для отображения</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {widgets.map((widget) => (
                    <div
                      key={widget.id}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Icon
                          name={chartIconName(widget.chartType)}
                          size={16}
                          className="text-blue-500"
                        />
                        <h3 className="font-semibold text-gray-800 text-sm">{widget.metricLabel}</h3>
                        <span className="ml-auto text-xs text-gray-400">
                          {PERIOD_OPTIONS.find((p) => p.value === widget.period)?.label} •{' '}
                          {GROUPING_OPTIONS.find((g) => g.value === widget.grouping)?.label}
                        </span>
                      </div>
                      <ChartRenderer widget={widget} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Edit mode
            <div>
              {widgets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <Icon name="BarChart3" size={48} className="mb-4 opacity-30" />
                  <p className="text-sm font-medium">Холст пуст</p>
                  <p className="text-xs mt-1">
                    Выберите метрику слева или загрузите готовый шаблон
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {widgets.map((widget) => {
                    const isSelected = widget.id === selectedWidgetId;
                    return (
                      <div
                        key={widget.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWidgetId(widget.id);
                        }}
                        className={`bg-white rounded-xl border-2 shadow-sm p-4 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 shadow-blue-100'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {/* Widget header */}
                        <div className="flex items-center gap-2 mb-3">
                          <Icon
                            name={chartIconName(widget.chartType)}
                            size={15}
                            className="text-blue-500 shrink-0"
                          />
                          <span className="text-sm font-semibold text-gray-800 truncate flex-1">
                            {widget.metricLabel}
                          </span>

                          {/* Chart type switcher */}
                          <div className="flex gap-1">
                            {CHART_TYPES.map((ct) => (
                              <button
                                key={ct.type}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateWidgetChartType(widget.id, ct.type);
                                }}
                                title={ct.label}
                                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                                  widget.chartType === ct.type
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {ct.label}
                              </button>
                            ))}
                          </div>

                          {/* Delete */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeWidget(widget.id);
                            }}
                            className="ml-1 p-1 rounded-lg hover:bg-red-50 hover:text-red-500 text-gray-400 transition-colors"
                          >
                            <Icon name="X" size={14} />
                          </button>
                        </div>

                        {/* Chart */}
                        <ChartRenderer widget={widget} />

                        {/* Meta */}
                        <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                          <span>
                            <Icon name="Calendar" size={11} className="inline mr-0.5" />
                            {PERIOD_OPTIONS.find((p) => p.value === widget.period)?.label}
                          </span>
                          <span>
                            {GROUPING_OPTIONS.find((g) => g.value === widget.grouping)?.label}
                          </span>
                          {widget.filterEngineer && <span>👤 {widget.filterEngineer}</span>}
                          {widget.filterClient && <span>🏢 {widget.filterClient}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right panel: widget settings ── */}
        {!previewMode && selectedWidget && (
          <div
            className="w-64 shrink-0 bg-white border-l border-gray-200 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Настройки виджета
              </p>
              <button
                onClick={() => setSelectedWidgetId(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon name="X" size={14} />
              </button>
            </div>

            <div className="p-4 space-y-5">
              {/* Period */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  <Icon name="Calendar" size={12} className="inline mr-1" />
                  Период
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {PERIOD_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateSelectedWidget({ period: opt.value })}
                      className={`py-1.5 text-xs rounded-lg font-medium transition-colors ${
                        selectedWidget.period === opt.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grouping */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  <Icon name="Settings" size={12} className="inline mr-1" />
                  Группировка
                </label>
                <div className="flex gap-1">
                  {GROUPING_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateSelectedWidget({ grouping: opt.value })}
                      className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                        selectedWidget.grouping === opt.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  <Icon name="Filter" size={12} className="inline mr-1" />
                  Фильтры
                </label>

                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">По инженеру</label>
                    <select
                      value={selectedWidget.filterEngineer}
                      onChange={(e) => updateSelectedWidget({ filterEngineer: e.target.value })}
                      className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Все инженеры</option>
                      {ENGINEERS.filter(Boolean).map((eng) => (
                        <option key={eng} value={eng}>
                          {eng}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">По клиенту</label>
                    <select
                      value={selectedWidget.filterClient}
                      onChange={(e) => updateSelectedWidget({ filterClient: e.target.value })}
                      className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Все клиенты</option>
                      {CLIENTS.filter(Boolean).map((cl) => (
                        <option key={cl} value={cl}>
                          {cl}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Active chart type display */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  <Icon name="BarChart3" size={12} className="inline mr-1" />
                  Тип диаграммы
                </label>
                <div className="grid grid-cols-1 gap-1">
                  {CHART_TYPES.map((ct) => (
                    <button
                      key={ct.type}
                      onClick={() => updateSelectedWidget({ chartType: ct.type })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        selectedWidget.chartType === ct.type
                          ? 'bg-blue-50 text-blue-700 border border-blue-300'
                          : 'bg-gray-50 text-gray-600 border border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <Icon name={chartIconName(ct.type)} size={13} />
                      {ct.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick run */}
              <Button size="sm" className="w-full" onClick={() => setPreviewMode(true)}>
                <Icon name="Play" size={14} className="mr-1.5" />
                Предпросмотр
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportBuilder;
