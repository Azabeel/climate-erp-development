import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SLAConfig {
  id: string;
  name: string;
  type: 'corporate' | 'contract';
  level: 'premium' | 'standard' | 'basic';
  ttrHours: number;
  ttoHours: number;
  ttfHours: number;
  warningPercent: number;
  serviceHoursStart: number;
  serviceHoursEnd: number;
  workingDays: boolean[];
  clientsCount: number;
  activeContractsCount: number;
  avgPerformance: number;
  color: string;
}

const SLA_CONFIGS: SLAConfig[] = [
  { id: 'SLA01', name: 'Премиум 24/7', type: 'corporate', level: 'premium', ttrHours: 1, ttoHours: 2, ttfHours: 8, warningPercent: 80, serviceHoursStart: 0, serviceHoursEnd: 24, workingDays: [true, true, true, true, true, true, true], clientsCount: 12, activeContractsCount: 12, avgPerformance: 94, color: '#6366F1' },
  { id: 'SLA02', name: 'Стандарт 8/5', type: 'corporate', level: 'standard', ttrHours: 4, ttoHours: 8, ttfHours: 24, warningPercent: 75, serviceHoursStart: 8, serviceHoursEnd: 20, workingDays: [true, true, true, true, true, false, false], clientsCount: 45, activeContractsCount: 38, avgPerformance: 97, color: '#3B82F6' },
  { id: 'SLA03', name: 'Базовый', type: 'corporate', level: 'basic', ttrHours: 24, ttoHours: 48, ttfHours: 72, warningPercent: 70, serviceHoursStart: 9, serviceHoursEnd: 18, workingDays: [true, true, true, true, true, false, false], clientsCount: 89, activeContractsCount: 61, avgPerformance: 99, color: '#10B981' },
  { id: 'SLA04', name: 'ТЦ «Европа» — Индивидуальный', type: 'contract', level: 'premium', ttrHours: 2, ttoHours: 3, ttfHours: 12, warningPercent: 85, serviceHoursStart: 7, serviceHoursEnd: 23, workingDays: [true, true, true, true, true, true, true], clientsCount: 1, activeContractsCount: 1, avgPerformance: 96, color: '#F59E0B' },
  { id: 'SLA05', name: 'Гостиницы — Договорной', type: 'contract', level: 'standard', ttrHours: 3, ttoHours: 6, ttfHours: 24, warningPercent: 75, serviceHoursStart: 0, serviceHoursEnd: 24, workingDays: [true, true, true, true, true, true, true], clientsCount: 4, activeContractsCount: 4, avgPerformance: 92, color: '#EC4899' },
];

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const performanceData = [
  { name: 'Янв', premium: 92, standard: 97, basic: 99 },
  { name: 'Фев', premium: 89, standard: 96, basic: 100 },
  { name: 'Мар', premium: 95, standard: 98, basic: 99 },
  { name: 'Апр', premium: 91, standard: 97, basic: 100 },
  { name: 'Май', premium: 94, standard: 97, basic: 99 },
];

const levelConfig: Record<string, { label: string; bg: string; text: string }> = {
  premium: { label: 'Премиум', bg: 'bg-purple-100', text: 'text-purple-700' },
  standard: { label: 'Стандарт', bg: 'bg-blue-100', text: 'text-blue-700' },
  basic: { label: 'Базовый', bg: 'bg-green-100', text: 'text-green-700' },
};

const typeConfig: Record<string, { label: string; bg: string; text: string }> = {
  corporate: { label: 'Корпоративный', bg: 'bg-gray-100', text: 'text-gray-700' },
  contract: { label: 'Договорной', bg: 'bg-orange-100', text: 'text-orange-700' },
};

function SLABadge({ hours, label }: { hours: number; label: string }) {
  const color = hours <= 4 ? 'text-red-600 bg-red-50 border-red-200' : hours <= 24 ? 'text-yellow-600 bg-yellow-50 border-yellow-200' : 'text-green-600 bg-green-50 border-green-200';
  return (
    <div className={`flex flex-col items-center p-2 rounded-lg border ${color}`}>
      <span className="text-lg font-bold">{hours}ч</span>
      <span className="text-xs opacity-75">{label}</span>
    </div>
  );
}

const SLAPolicy = () => {
  const [selected, setSelected] = useState<SLAConfig | null>(SLA_CONFIGS[0]);
  const [editMode, setEditMode] = useState(false);
  const [editedSLA, setEditedSLA] = useState<SLAConfig | null>(null);

  const startEdit = () => {
    setEditedSLA(selected ? { ...selected } : null);
    setEditMode(true);
  };

  const saveEdit = () => {
    setEditMode(false);
    setEditedSLA(null);
  };

  const current = editMode && editedSLA ? editedSLA : selected;

  return (
    <div className="p-6 flex gap-6 h-full">
      {/* Список конфигураций */}
      <div className="w-72 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Конфигурации SLA</h3>
          <Button size="sm" variant="outline">
            <Icon name="Plus" size={13} className="mr-1" />
            Новый
          </Button>
        </div>

        {/* Сводка */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-gray-900">{SLA_CONFIGS.length}</p>
            <p className="text-xs text-gray-500">конфигураций</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-green-600">
              {Math.round(SLA_CONFIGS.reduce((s, c) => s + c.avgPerformance, 0) / SLA_CONFIGS.length)}%
            </p>
            <p className="text-xs text-gray-500">ср. выполнение</p>
          </div>
        </div>

        <div className="space-y-2">
          {SLA_CONFIGS.map(config => (
            <button
              key={config.id}
              onClick={() => { setSelected(config); setEditMode(false); }}
              className={`w-full text-left p-3 rounded-xl border transition-all ${selected?.id === config.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{config.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${levelConfig[config.level].bg} ${levelConfig[config.level].text}`}>
                      {levelConfig[config.level].label}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${typeConfig[config.type].bg} ${typeConfig[config.type].text}`}>
                      {typeConfig[config.type].label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                    <span>TTR: {config.ttrHours}ч</span>
                    <span>TTF: {config.ttfHours}ч</span>
                    <span className={config.avgPerformance >= 95 ? 'text-green-600' : 'text-orange-600'}>
                      {config.avgPerformance}%
                    </span>
                  </div>
                </div>
                <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: config.color }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Детали конфигурации */}
      {current ? (
        <div className="flex-1 space-y-4 overflow-auto">
          {/* Шапка */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: current.color }} />
                  {editMode && editedSLA ? (
                    <input
                      value={editedSLA.name}
                      onChange={e => setEditedSLA({ ...editedSLA, name: e.target.value })}
                      className="text-xl font-bold text-gray-900 border-b border-blue-400 focus:outline-none bg-transparent"
                    />
                  ) : (
                    <h2 className="text-xl font-bold text-gray-900">{current.name}</h2>
                  )}
                </div>
                <div className="flex gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${levelConfig[current.level].bg} ${levelConfig[current.level].text}`}>{levelConfig[current.level].label}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${typeConfig[current.type].bg} ${typeConfig[current.type].text}`}>{typeConfig[current.type].label}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {editMode ? (
                  <>
                    <Button size="sm" variant="outline" onClick={() => setEditMode(false)}>Отмена</Button>
                    <Button size="sm" onClick={saveEdit}>
                      <Icon name="Check" size={14} className="mr-1.5" />
                      Сохранить
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" onClick={startEdit}>
                    <Icon name="Edit" size={14} className="mr-1.5" />
                    Редактировать
                  </Button>
                )}
              </div>
            </div>

            {/* Метрики TTR/TTO/TTF */}
            <div>
              <p className="text-xs text-gray-400 mb-2">Нормативы времени реакции</p>
              <div className="grid grid-cols-3 gap-3">
                {editMode && editedSLA ? (
                  [
                    { key: 'ttrHours' as const, label: 'TTR (Реакция)' },
                    { key: 'ttoHours' as const, label: 'TTO (Прибытие)' },
                    { key: 'ttfHours' as const, label: 'TTF (Устранение)' },
                  ].map(({ key, label }) => (
                    <div key={key} className="border border-gray-200 rounded-lg p-2 text-center">
                      <input
                        type="number"
                        value={editedSLA[key]}
                        min={1}
                        onChange={e => setEditedSLA({ ...editedSLA, [key]: parseInt(e.target.value) || 1 })}
                        className="text-2xl font-bold text-center w-full border-b border-blue-400 focus:outline-none bg-transparent"
                      />
                      <span className="text-xs text-gray-400">{label}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <SLABadge hours={current.ttrHours} label="TTR (Реакция)" />
                    <SLABadge hours={current.ttoHours} label="TTO (Прибытие)" />
                    <SLABadge hours={current.ttfHours} label="TTF (Устранение)" />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Часы работы и дни */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Часы и дни обслуживания</h3>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-2">
                <Icon name="Clock" size={15} className="text-gray-400" />
                <span className="text-sm text-gray-700">
                  {String(current.serviceHoursStart).padStart(2, '0')}:00 — {String(current.serviceHoursEnd).padStart(2, '0')}:00
                  {current.serviceHoursStart === 0 && current.serviceHoursEnd === 24 && (
                    <span className="ml-2 text-xs text-purple-600 font-medium">24/7</span>
                  )}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {DAYS.map((day, idx) => (
                <div
                  key={day}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-medium ${current.workingDays[idx] ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Icon name="AlertCircle" size={14} className="text-orange-500" />
              <span className="text-xs text-gray-600">
                Предупреждение при {current.warningPercent}% использования норматива
              </span>
            </div>
          </div>

          {/* Использование */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Использование</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{current.clientsCount}</p>
                <p className="text-xs text-gray-500">клиентов</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{current.activeContractsCount}</p>
                <p className="text-xs text-gray-500">активных договоров</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${current.avgPerformance >= 95 ? 'text-green-600' : 'text-orange-600'}`}>
                  {current.avgPerformance}%
                </p>
                <p className="text-xs text-gray-500">выполнение</p>
              </div>
            </div>
          </div>

          {/* График выполнения */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Выполнение SLA по уровням (последние 5 месяцев)</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[85, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`${v}%`, '']} />
                <Bar dataKey="premium" name="Премиум" fill="#6366F1" radius={[3, 3, 0, 0]} />
                <Bar dataKey="standard" name="Стандарт" fill="#3B82F6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="basic" name="Базовый" fill="#10B981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 justify-center mt-2">
              {[{ color: '#6366F1', label: 'Премиум' }, { color: '#3B82F6', label: 'Стандарт' }, { color: '#10B981', label: 'Базовый' }].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.color }} />
                  <span className="text-xs text-gray-500">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <Icon name="Shield" size={48} className="mx-auto mb-3 text-gray-200" />
            <p className="text-sm">Выберите конфигурацию SLA</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SLAPolicy;
