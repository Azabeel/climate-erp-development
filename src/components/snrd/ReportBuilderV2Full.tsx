import { useState, useMemo } from 'react';
import {
  BarChart, Bar, AreaChart, Area, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type ReportType = 'orders' | 'finance' | 'engineers' | 'clients' | 'stock';
type PeriodPreset = 'month' | 'quarter' | 'year' | 'custom';
type GroupBy = 'days' | 'weeks' | 'months' | 'engineers' | 'clients';
type VizType = 'table' | 'bar' | 'line' | 'pie' | 'mixed';

interface MetricDef {
  id: string;
  label: string;
  unit: string;
}

interface SavedTemplate {
  id: string;
  name: string;
  type: ReportType;
  lastRun: string;
  config: ReportConfig;
}

interface ReportConfig {
  name: string;
  type: ReportType;
  periodPreset: PeriodPreset;
  dateFrom: string;
  dateTo: string;
  groupBy: GroupBy;
  metrics: string[];
  vizType: VizType;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const METRICS_BY_TYPE: Record<ReportType, MetricDef[]> = {
  orders: [
    { id: 'count', label: 'Кол-во нарядов', unit: 'шт' },
    { id: 'completed', label: 'Выполнено', unit: 'шт' },
    { id: 'avg_duration', label: 'Среднее время', unit: 'ч' },
    { id: 'sla_breach', label: 'Нарушения SLA', unit: 'шт' },
    { id: 'warranty', label: 'Гарантийные', unit: 'шт' },
    { id: 'emergency', label: 'Аварийные', unit: 'шт' },
    { id: 'cancelled', label: 'Отменённые', unit: 'шт' },
    { id: 'avg_rating', label: 'Средняя оценка', unit: 'балл' },
    { id: 'repeat_visits', label: 'Повторные выезды', unit: 'шт' },
    { id: 'first_fix_rate', label: 'First Fix Rate', unit: '%' },
  ],
  finance: [
    { id: 'revenue', label: 'Выручка', unit: '₽' },
    { id: 'cost', label: 'Себестоимость', unit: '₽' },
    { id: 'margin', label: 'Маржа', unit: '₽' },
    { id: 'margin_pct', label: 'Маржинальность', unit: '%' },
    { id: 'avg_check', label: 'Средний чек', unit: '₽' },
    { id: 'materials_cost', label: 'Стоимость материалов', unit: '₽' },
    { id: 'labor_cost', label: 'ФОТ', unit: '₽' },
    { id: 'overdue_invoices', label: 'Просроченные счета', unit: 'шт' },
    { id: 'paid_invoices', label: 'Оплаченные счета', unit: '₽' },
    { id: 'zip_cost', label: 'Затраты на ЗИП', unit: '₽' },
  ],
  engineers: [
    { id: 'orders_done', label: 'Выполнено нарядов', unit: 'шт' },
    { id: 'avg_rating', label: 'Средняя оценка', unit: 'балл' },
    { id: 'travel_km', label: 'Пробег', unit: 'км' },
    { id: 'efficiency', label: 'КПД', unit: '%' },
    { id: 'on_time_pct', label: 'Приезд вовремя', unit: '%' },
    { id: 'revenue_generated', label: 'Выручка', unit: '₽' },
    { id: 'salary', label: 'ЗП начислено', unit: '₽' },
    { id: 'sick_days', label: 'Больничные дни', unit: 'дн' },
    { id: 'overtime', label: 'Переработки', unit: 'ч' },
    { id: 'certifications', label: 'Сертификаты', unit: 'шт' },
  ],
  clients: [
    { id: 'active_clients', label: 'Активные клиенты', unit: 'шт' },
    { id: 'new_clients', label: 'Новые клиенты', unit: 'шт' },
    { id: 'churn', label: 'Отток', unit: 'шт' },
    { id: 'health_score', label: 'Health Score', unit: 'балл' },
    { id: 'nps', label: 'NPS', unit: 'балл' },
    { id: 'contract_value', label: 'Стоимость договоров', unit: '₽' },
    { id: 'orders_per_client', label: 'Нарядов на клиента', unit: 'шт' },
    { id: 'avg_lifetime', label: 'Срок жизни клиента', unit: 'мес' },
    { id: 'leads', label: 'Лиды', unit: 'шт' },
    { id: 'conversion', label: 'Конверсия лидов', unit: '%' },
  ],
  stock: [
    { id: 'total_items', label: 'Позиций на складе', unit: 'шт' },
    { id: 'stock_value', label: 'Стоимость остатков', unit: '₽' },
    { id: 'turnover', label: 'Оборачиваемость', unit: 'дн' },
    { id: 'low_stock', label: 'Критические остатки', unit: 'шт' },
    { id: 'write_offs', label: 'Списания', unit: '₽' },
    { id: 'refrigerant_used', label: 'Хладагент израсходован', unit: 'кг' },
    { id: 'purchases', label: 'Закупки', unit: '₽' },
    { id: 'returns', label: 'Возвраты', unit: '₽' },
    { id: 'avg_delivery_days', label: 'Среднее время поставки', unit: 'дн' },
    { id: 'zip_ordered', label: 'ЗИП заказано', unit: 'шт' },
  ],
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const SAVED_TEMPLATES: SavedTemplate[] = [
  {
    id: '1', name: 'Еженедельный отчёт', type: 'orders', lastRun: '12.05.2026',
    config: { name: 'Еженедельный отчёт', type: 'orders', periodPreset: 'month', dateFrom: '2026-05-01', dateTo: '2026-05-31', groupBy: 'weeks', metrics: ['count', 'completed', 'sla_breach'], vizType: 'bar' },
  },
  {
    id: '2', name: 'Финансы за квартал', type: 'finance', lastRun: '10.05.2026',
    config: { name: 'Финансы за квартал', type: 'finance', periodPreset: 'quarter', dateFrom: '2026-04-01', dateTo: '2026-06-30', groupBy: 'months', metrics: ['revenue', 'cost', 'margin'], vizType: 'mixed' },
  },
  {
    id: '3', name: 'Рейтинг инженеров', type: 'engineers', lastRun: '08.05.2026',
    config: { name: 'Рейтинг инженеров', type: 'engineers', periodPreset: 'month', dateFrom: '2026-05-01', dateTo: '2026-05-31', groupBy: 'engineers', metrics: ['orders_done', 'avg_rating', 'efficiency'], vizType: 'bar' },
  },
  {
    id: '4', name: 'Здоровье клиентов', type: 'clients', lastRun: '07.05.2026',
    config: { name: 'Здоровье клиентов', type: 'clients', periodPreset: 'quarter', dateFrom: '2026-04-01', dateTo: '2026-06-30', groupBy: 'clients', metrics: ['health_score', 'nps', 'churn'], vizType: 'line' },
  },
  {
    id: '5', name: 'Складские остатки', type: 'stock', lastRun: '05.05.2026',
    config: { name: 'Складские остатки', type: 'stock', periodPreset: 'month', dateFrom: '2026-05-01', dateTo: '2026-05-31', groupBy: 'months', metrics: ['stock_value', 'low_stock', 'turnover'], vizType: 'table' },
  },
  {
    id: '6', name: 'Маржинальность по клиентам', type: 'finance', lastRun: '01.05.2026',
    config: { name: 'Маржинальность по клиентам', type: 'finance', periodPreset: 'year', dateFrom: '2026-01-01', dateTo: '2026-12-31', groupBy: 'clients', metrics: ['revenue', 'margin', 'margin_pct'], vizType: 'pie' },
  },
];

// ─── Mock data generator ──────────────────────────────────────────────────────

function generateMockData(config: ReportConfig): Record<string, unknown>[] {
  const labels: Record<GroupBy, string[]> = {
    days: ['1', '5', '10', '15', '20', '25', '30'].map(d => `${d}.05`),
    weeks: ['Неделя 1', 'Неделя 2', 'Неделя 3', 'Неделя 4'],
    months: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
    engineers: ['Иванов', 'Петров', 'Сидоров', 'Козлов', 'Новиков'],
    clients: ['ООО Ромашка', 'ИП Смирнов', 'ЗАО Техком', 'ООО Климат+', 'ИП Козлов'],
  };
  const keys = labels[config.groupBy];
  return keys.map(name => {
    const row: Record<string, unknown> = { name };
    config.metrics.forEach(m => {
      row[m] = Math.round(Math.random() * 900 + 100);
    });
    return row;
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricLabel({ m, selected, onToggle }: { m: MetricDef; selected: boolean; onToggle: () => void }) {
  return (
    <label className="flex items-center gap-2 py-1 cursor-pointer group">
      <Checkbox checked={selected} onCheckedChange={onToggle} />
      <span className="text-xs text-gray-700 group-hover:text-gray-900 leading-tight">
        {m.label}
        <span className="text-gray-400 ml-1">({m.unit})</span>
      </span>
    </label>
  );
}

function VizRadio({ value, current, label, icon, onChange }: {
  value: VizType; current: VizType; label: string; icon: string;
  onChange: (v: VizType) => void;
}) {
  const active = value === current;
  return (
    <button
      onClick={() => onChange(value)}
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs border transition-all ${active ? 'bg-blue-50 border-blue-400 text-blue-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
    >
      <Icon name={icon} size={12} />
      {label}
    </button>
  );
}

function ChartPreview({ config, data }: { config: ReportConfig; data: Record<string, unknown>[] }) {
  if (!data.length || !config.metrics.length) return null;

  if (config.vizType === 'pie') {
    const firstMetric = config.metrics[0];
    const pieData = data.map(r => ({ name: r.name as string, value: r[firstMetric] as number }));
    return (
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (config.vizType === 'line') {
    return (
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          {config.metrics.map((m, i) => (
            <Line key={m} type="monotone" dataKey={m} stroke={COLORS[i % COLORS.length]} dot={false} strokeWidth={2} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (config.vizType === 'mixed') {
    return (
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          {config.metrics.map((m, i) => (
            <Area key={m} type="monotone" dataKey={m} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length] + '22'} strokeWidth={2} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // bar (default)
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        {config.metrics.map((m, i) => (
          <Bar key={m} dataKey={m} fill={COLORS[i % COLORS.length]} radius={[3, 3, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

function DataTable({ config, data }: { config: ReportConfig; data: Record<string, unknown>[] }) {
  const allMetrics = METRICS_BY_TYPE[config.type];
  const selectedDefs = allMetrics.filter(m => config.metrics.includes(m.id));
  const rows = data.slice(0, 10);
  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left px-3 py-2 font-medium text-gray-600">Группировка</th>
            {selectedDefs.map(m => (
              <th key={m.id} className="text-right px-3 py-2 font-medium text-gray-600">{m.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b hover:bg-gray-50">
              <td className="px-3 py-2 font-medium text-gray-800">{row.name as string}</td>
              {selectedDefs.map(m => (
                <td key={m.id} className="px-3 py-2 text-right text-gray-700">
                  {(row[m.id] as number)?.toLocaleString()} <span className="text-gray-400">{m.unit}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Schedule Tab ─────────────────────────────────────────────────────────────

function ScheduleTab() {
  const [freq, setFreq] = useState('weekly');
  const [email, setEmail] = useState('');
  return (
    <div className="space-y-5 p-4">
      <p className="text-sm text-gray-500">Настройте автоматическую отправку отчёта по расписанию.</p>
      <div className="space-y-3 max-w-md">
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">Частота отправки</label>
          <Select value={freq} onValueChange={setFreq}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Ежедневно</SelectItem>
              <SelectItem value="weekly">Еженедельно (пн, 09:00)</SelectItem>
              <SelectItem value="monthly">Ежемесячно (1-е число)</SelectItem>
              <SelectItem value="quarterly">Ежеквартально</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">Email получателей</label>
          <Input
            className="h-8 text-xs"
            placeholder="director@company.ru, analyst@company.ru"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">Формат вложения</label>
          <Select defaultValue="pdf">
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          size="sm"
          className="h-8 text-xs"
          onClick={() => toast.success('Расписание сохранено', { description: `Отчёт будет отправлен на ${email || 'указанный email'}` })}
        >
          <Icon name="Clock" size={13} className="mr-1.5" />
          Сохранить расписание
        </Button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const TYPE_LABELS: Record<ReportType, string> = {
  orders: 'Наряды', finance: 'Финансы', engineers: 'Инженеры', clients: 'Клиенты', stock: 'Склад',
};

const TYPE_ICONS: Record<ReportType, string> = {
  orders: 'ClipboardList', finance: 'TrendingUp', engineers: 'HardHat', clients: 'Users', stock: 'Package',
};

export default function ReportBuilderV2Full() {
  const [config, setConfig] = useState<ReportConfig>({
    name: 'Новый отчёт',
    type: 'orders',
    periodPreset: 'month',
    dateFrom: '2026-05-01',
    dateTo: '2026-05-31',
    groupBy: 'weeks',
    metrics: ['count', 'completed'],
    vizType: 'bar',
  });

  const [generated, setGenerated] = useState(false);
  const [previewConfig, setPreviewConfig] = useState<ReportConfig>(config);

  const availableMetrics = METRICS_BY_TYPE[config.type];

  const data = useMemo(
    () => (generated ? generateMockData(previewConfig) : []),
    [generated, previewConfig],
  );

  const patch = (partial: Partial<ReportConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...partial };
      if (partial.type && partial.type !== prev.type) {
        next.metrics = [];
      }
      return next;
    });
    setGenerated(false);
  };

  const toggleMetric = (id: string) => {
    setConfig(prev => ({
      ...prev,
      metrics: prev.metrics.includes(id)
        ? prev.metrics.filter(m => m !== id)
        : [...prev.metrics, id],
    }));
    setGenerated(false);
  };

  const generate = () => {
    if (!config.metrics.length) {
      toast.error('Выберите хотя бы одну метрику');
      return;
    }
    setPreviewConfig({ ...config });
    setGenerated(true);
    toast.success('Отчёт сгенерирован');
  };

  const loadTemplate = (tpl: SavedTemplate) => {
    setConfig({ ...tpl.config });
    setGenerated(false);
    toast.info(`Шаблон «${tpl.name}» загружен`);
  };

  const saveTemplate = () => toast.success('Шаблон сохранён', { description: `«${config.name}» добавлен в список` });

  const exportReport = (fmt: string) => {
    if (!generated) { toast.error('Сначала сгенерируйте отчёт'); return; }
    toast.success(`Экспорт в ${fmt}`, { description: `${config.name}.${fmt.toLowerCase()} загружается` });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b shrink-0">
        <div className="flex items-center gap-2">
          <Icon name="BarChart2" size={18} className="text-blue-600" />
          <span className="font-semibold text-gray-800">Конструктор отчётов v2</span>
          {generated && (
            <Badge variant="secondary" className="text-xs ml-1">
              {new Date().toLocaleDateString('ru-RU')}
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="builder" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-5 pt-2 bg-white border-b shrink-0">
          <TabsList className="h-8">
            <TabsTrigger value="builder" className="text-xs h-7 px-3">
              <Icon name="Settings2" size={12} className="mr-1" />Конструктор
            </TabsTrigger>
            <TabsTrigger value="schedule" className="text-xs h-7 px-3">
              <Icon name="CalendarClock" size={12} className="mr-1" />Расписание
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── Builder Tab ── */}
        <TabsContent value="builder" className="flex-1 overflow-hidden m-0">
          <div className="flex h-full overflow-hidden">

            {/* Left panel — settings */}
            <div className="w-64 shrink-0 bg-white border-r flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-3 space-y-4">

                {/* Report name */}
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Название отчёта</label>
                  <Input
                    className="h-8 text-xs"
                    value={config.name}
                    onChange={e => patch({ name: e.target.value })}
                  />
                </div>

                {/* Report type */}
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Тип отчёта</label>
                  <Select value={config.type} onValueChange={v => patch({ type: v as ReportType })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(TYPE_LABELS) as ReportType[]).map(t => (
                        <SelectItem key={t} value={t}>
                          <span className="flex items-center gap-1.5">
                            <Icon name={TYPE_ICONS[t]} size={12} />
                            {TYPE_LABELS[t]}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Period */}
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Период</label>
                  <Select value={config.periodPreset} onValueChange={v => patch({ periodPreset: v as PeriodPreset })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Текущий месяц</SelectItem>
                      <SelectItem value="quarter">Текущий квартал</SelectItem>
                      <SelectItem value="year">Текущий год</SelectItem>
                      <SelectItem value="custom">Произвольный</SelectItem>
                    </SelectContent>
                  </Select>
                  {config.periodPreset === 'custom' && (
                    <div className="mt-2 space-y-1">
                      <Input type="date" className="h-7 text-xs" value={config.dateFrom} onChange={e => patch({ dateFrom: e.target.value })} />
                      <Input type="date" className="h-7 text-xs" value={config.dateTo} onChange={e => patch({ dateTo: e.target.value })} />
                    </div>
                  )}
                </div>

                {/* Group by */}
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Группировка</label>
                  <Select value={config.groupBy} onValueChange={v => patch({ groupBy: v as GroupBy })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">По дням</SelectItem>
                      <SelectItem value="weeks">По неделям</SelectItem>
                      <SelectItem value="months">По месяцам</SelectItem>
                      <SelectItem value="engineers">По инженерам</SelectItem>
                      <SelectItem value="clients">По клиентам</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Metrics */}
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">
                    Метрики
                    {config.metrics.length > 0 && (
                      <span className="ml-1 text-blue-600">({config.metrics.length})</span>
                    )}
                  </label>
                  <div className="space-y-0.5 max-h-52 overflow-y-auto pr-1">
                    {availableMetrics.map(m => (
                      <MetricLabel
                        key={m.id}
                        m={m}
                        selected={config.metrics.includes(m.id)}
                        onToggle={() => toggleMetric(m.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* Visualization */}
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-2">Тип визуализации</label>
                  <div className="grid grid-cols-2 gap-1">
                    <VizRadio value="table" current={config.vizType} label="Таблица" icon="Table" onChange={v => patch({ vizType: v })} />
                    <VizRadio value="bar" current={config.vizType} label="Бары" icon="BarChart2" onChange={v => patch({ vizType: v })} />
                    <VizRadio value="line" current={config.vizType} label="Линия" icon="TrendingUp" onChange={v => patch({ vizType: v })} />
                    <VizRadio value="pie" current={config.vizType} label="Пирог" icon="PieChart" onChange={v => patch({ vizType: v })} />
                    <VizRadio value="mixed" current={config.vizType} label="Смешанный" icon="AreaChart" onChange={v => patch({ vizType: v })} />
                  </div>
                </div>
              </div>

              {/* Generate button */}
              <div className="p-3 border-t shrink-0">
                <Button className="w-full h-8 text-xs" onClick={generate}>
                  <Icon name="Play" size={13} className="mr-1.5" />
                  Сгенерировать
                </Button>
              </div>
            </div>

            {/* Center — preview */}
            <div className="flex-1 overflow-y-auto p-4">
              {!generated ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Icon name="BarChart2" size={40} className="mb-3 opacity-30" />
                  <p className="text-sm">Настройте параметры и нажмите «Сгенерировать»</p>
                </div>
              ) : (
                <Card>
                  <CardHeader className="pb-2 pt-4 px-5">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Icon name={TYPE_ICONS[previewConfig.type]} size={16} className="text-blue-600" />
                      {previewConfig.name}
                      <Badge variant="outline" className="text-xs ml-auto font-normal">
                        {TYPE_LABELS[previewConfig.type]}
                      </Badge>
                    </CardTitle>
                    <p className="text-xs text-gray-500">
                      {previewConfig.dateFrom} — {previewConfig.dateTo} · сгенерировано {new Date().toLocaleString('ru-RU')}
                    </p>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    {previewConfig.vizType !== 'table' && (
                      <ChartPreview config={previewConfig} data={data} />
                    )}
                    <DataTable config={previewConfig} data={data} />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right panel — saved templates + export */}
            <div className="w-56 shrink-0 bg-white border-l flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <div className="px-3 py-2 border-b">
                  <span className="text-xs font-semibold text-gray-700">Сохранённые шаблоны</span>
                </div>
                <div className="divide-y">
                  {SAVED_TEMPLATES.map(tpl => (
                    <button
                      key={tpl.id}
                      onClick={() => loadTemplate(tpl)}
                      className="w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-start gap-2">
                        <Icon name={TYPE_ICONS[tpl.type]} size={13} className="text-gray-400 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate group-hover:text-blue-600">{tpl.name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{TYPE_LABELS[tpl.type]} · {tpl.lastRun}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="p-3 border-t space-y-2 shrink-0">
                <Button variant="outline" size="sm" className="w-full h-7 text-xs" onClick={saveTemplate}>
                  <Icon name="Bookmark" size={12} className="mr-1.5" />
                  Сохранить шаблон
                </Button>
                <div className="grid grid-cols-3 gap-1">
                  <Button variant="ghost" size="sm" className="h-7 text-xs px-0 flex-col gap-0.5" onClick={() => exportReport('Excel')}>
                    <Icon name="FileSpreadsheet" size={13} className="text-green-600" />
                    <span className="text-[10px]">Excel</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs px-0 flex-col gap-0.5" onClick={() => exportReport('PDF')}>
                    <Icon name="FileText" size={13} className="text-red-500" />
                    <span className="text-[10px]">PDF</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs px-0 flex-col gap-0.5" onClick={() => exportReport('CSV')}>
                    <Icon name="FileCode" size={13} className="text-blue-500" />
                    <span className="text-[10px]">CSV</span>
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </TabsContent>

        {/* ── Schedule Tab ── */}
        <TabsContent value="schedule" className="flex-1 overflow-y-auto m-0">
          <ScheduleTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
