import { useState, useMemo } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

type Level = 0 | 1 | 2 | 3;

interface Certification {
  name: string;
  expires: string; // ISO date
}

interface Engineer {
  id: string;
  name: string;
  role: string;
  skills: Record<string, Level>;
  certifications: Certification[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COMPETENCIES = [
  { id: 'c1',  name: 'Ремонт VRF' },
  { id: 'c2',  name: 'ТО сплит-систем' },
  { id: 'c3',  name: 'Монтаж чиллеров' },
  { id: 'c4',  name: 'Работа с R-410A' },
  { id: 'c5',  name: 'Электрика (до 380В)' },
  { id: 'c6',  name: 'Диагностика ошибок' },
  { id: 'c7',  name: 'Пайка медных труб' },
  { id: 'c8',  name: 'Пусконаладка' },
  { id: 'c9',  name: 'Работа с IoT' },
  { id: 'c10', name: 'Клиентский сервис' },
] as const;

const ENGINEERS_INITIAL: Engineer[] = [
  {
    id: 'e1', name: 'Иванов А.П.', role: 'Старший инженер',
    certifications: [
      { name: 'Daikin Expert', expires: '2026-09-01' },
      { name: 'F-газы (кат. I)', expires: '2027-03-15' },
      { name: 'Электробезопасность III гр.', expires: '2026-01-20' },
    ],
    skills: { c1: 3, c2: 3, c3: 2, c4: 3, c5: 2, c6: 3, c7: 3, c8: 2, c9: 1, c10: 2 },
  },
  {
    id: 'e2', name: 'Петров С.В.', role: 'Инженер',
    certifications: [
      { name: 'Mitsubishi Certified', expires: '2025-12-01' },
      { name: 'F-газы (кат. II)', expires: '2026-06-10' },
    ],
    skills: { c1: 2, c2: 3, c3: 1, c4: 2, c5: 2, c6: 2, c7: 2, c8: 3, c9: 0, c10: 3 },
  },
  {
    id: 'e3', name: 'Сидоров К.И.', role: 'Инженер',
    certifications: [
      { name: 'F-газы (кат. I)', expires: '2026-11-05' },
      { name: 'Daikin Basic', expires: '2025-08-22' },
    ],
    skills: { c1: 1, c2: 3, c3: 0, c4: 2, c5: 3, c6: 2, c7: 1, c8: 2, c9: 1, c10: 2 },
  },
  {
    id: 'e4', name: 'Козлов М.А.', role: 'Старший инженер',
    certifications: [
      { name: 'Gree Certified', expires: '2026-04-18' },
      { name: 'F-газы (кат. I)', expires: '2027-01-30' },
      { name: 'Работа на высоте', expires: '2026-07-12' },
    ],
    skills: { c1: 3, c2: 2, c3: 3, c4: 3, c5: 2, c6: 3, c7: 3, c8: 3, c9: 0, c10: 1 },
  },
  {
    id: 'e5', name: 'Новиков Д.В.', role: 'Инженер',
    certifications: [
      { name: 'F-газы (кат. II)', expires: '2026-09-09' },
    ],
    skills: { c1: 2, c2: 2, c3: 1, c4: 2, c5: 1, c6: 2, c7: 2, c8: 1, c9: 2, c10: 2 },
  },
  {
    id: 'e6', name: 'Морозова Е.С.', role: 'Инженер',
    certifications: [
      { name: 'IoT/BMS Siemens', expires: '2027-02-14' },
      { name: 'F-газы (кат. II)', expires: '2026-08-01' },
    ],
    skills: { c1: 0, c2: 2, c3: 0, c4: 1, c5: 2, c6: 3, c7: 1, c8: 2, c9: 3, c10: 3 },
  },
  {
    id: 'e7', name: 'Волков Р.П.', role: 'Стажёр',
    certifications: [],
    skills: { c1: 0, c2: 1, c3: 0, c4: 1, c5: 1, c6: 1, c7: 1, c8: 0, c9: 1, c10: 1 },
  },
  {
    id: 'e8', name: 'Захаров И.Н.', role: 'Инженер',
    certifications: [
      { name: 'Mitsubishi Expert', expires: '2026-05-20' },
      { name: 'F-газы (кат. I)', expires: '2026-12-31' },
      { name: 'Электробезопасность IV гр.', expires: '2025-11-15' },
      { name: 'Работа на высоте', expires: '2026-03-08' },
    ],
    skills: { c1: 3, c2: 3, c3: 1, c4: 3, c5: 3, c6: 3, c7: 2, c8: 2, c9: 1, c10: 2 },
  },
  {
    id: 'e9', name: 'Лебедева Т.О.', role: 'Инженер',
    certifications: [
      { name: 'F-газы (кат. II)', expires: '2026-07-07' },
    ],
    skills: { c1: 1, c2: 2, c3: 0, c4: 2, c5: 1, c6: 2, c7: 1, c8: 2, c9: 2, c10: 3 },
  },
  {
    id: 'e10', name: 'Орлов А.К.', role: 'Стажёр',
    certifications: [],
    skills: { c1: 0, c2: 1, c3: 0, c4: 0, c5: 1, c6: 1, c7: 0, c8: 0, c9: 0, c10: 1 },
  },
];

// Level config: icon character, bg/text colours
const LEVEL_CFG: Record<Level, { emoji: string; label: string; bg: string; text: string; border: string }> = {
  0: { emoji: '❌', label: 'Нет',      bg: 'bg-gray-100',   text: 'text-gray-400',   border: 'border-gray-200' },
  1: { emoji: '🟡', label: 'Базовый', bg: 'bg-yellow-50',  text: 'text-yellow-700', border: 'border-yellow-200' },
  2: { emoji: '🟢', label: 'Эксперт', bg: 'bg-green-50',   text: 'text-green-700',  border: 'border-green-200' },
  3: { emoji: '🏆', label: 'Наставник', bg: 'bg-blue-50',  text: 'text-blue-700',   border: 'border-blue-200' },
};

const RADAR_AXES = [
  { label: 'VRF / Чиллеры',    ids: ['c1', 'c3'] },
  { label: 'ТО и Монтаж',       ids: ['c2', 'c8'] },
  { label: 'Хладагенты',        ids: ['c4', 'c7'] },
  { label: 'Электрика',         ids: ['c5'] },
  { label: 'Диагностика / IoT', ids: ['c6', 'c9'] },
  { label: 'Сервис',            ids: ['c10'] },
];

// ─── Helper fns ───────────────────────────────────────────────────────────────

const axisValue = (eng: Engineer, ids: string[]): number => {
  const sum = ids.reduce((acc, id) => acc + (eng.skills[id] ?? 0), 0);
  return Math.round((sum / (ids.length * 3)) * 3 * 10) / 10;
};

const getRadarData = (eng: Engineer) =>
  RADAR_AXES.map(ax => ({
    subject: ax.label,
    value: axisValue(eng, ax.ids),
  }));

const certExpiresBadge = (expires: string) => {
  const ms = new Date(expires).getTime() - Date.now();
  const days = Math.ceil(ms / 86_400_000);
  if (days < 0) return { label: 'Истёк', cls: 'bg-red-100 text-red-700' };
  if (days < 60) return { label: `${days} дн.`, cls: 'bg-yellow-100 text-yellow-700' };
  return { label: new Date(expires).toLocaleDateString('ru-RU'), cls: 'bg-green-100 text-green-700' };
};

// ─── Component ────────────────────────────────────────────────────────────────

const CompetencyMatrixFull = () => {
  const [engineers, setEngineers] = useState<Engineer[]>(ENGINEERS_INITIAL);
  const [selectedId, setSelectedId] = useState<string | null>('e1');
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'missing' | 'basic'>('all');
  const [filterCompetency, setFilterCompetency] = useState<string>('');
  const [gapHighlight, setGapHighlight] = useState<Set<string>>(new Set());

  // ── Derived data ──────────────────────────────────────────────────────────

  const selectedEng = engineers.find(e => e.id === selectedId) ?? null;

  const totalCertified = useMemo(
    () => engineers.filter(e => e.certifications.length > 0).length,
    [engineers],
  );
  const needsTraining = useMemo(
    () =>
      engineers.filter(e =>
        COMPETENCIES.some(c => (e.skills[c.id] ?? 0) === 0),
      ).length,
    [engineers],
  );

  const filteredEngineers = useMemo(() => {
    let list = engineers;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(q));
    }
    if (filterCompetency && filterMode !== 'all') {
      list = list.filter(e => {
        const lvl = e.skills[filterCompetency] ?? 0;
        if (filterMode === 'missing') return lvl === 0;
        if (filterMode === 'basic') return lvl === 1;
        return true;
      });
    }
    return list;
  }, [engineers, search, filterCompetency, filterMode]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const cycleLevel = (engId: string, compId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEngineers(prev =>
      prev.map(eng => {
        if (eng.id !== engId) return eng;
        const cur = (eng.skills[compId] ?? 0) as Level;
        const next = ((cur + 1) % 4) as Level;
        toast.success(
          `${eng.name} — «${COMPETENCIES.find(c => c.id === compId)?.name}»: ${LEVEL_CFG[next].emoji} ${LEVEL_CFG[next].label}`,
        );
        return { ...eng, skills: { ...eng.skills, [compId]: next } };
      }),
    );
  };

  const findGaps = () => {
    // Columns where NO engineer has level >= 2 (expert)
    const gaps = new Set<string>();
    COMPETENCIES.forEach(c => {
      const hasExpert = engineers.some(e => (e.skills[c.id] ?? 0) >= 2);
      if (!hasExpert) gaps.add(c.id);
    });
    setGapHighlight(gaps);
    if (gaps.size === 0) {
      toast.success('Пробелов не найдено — по каждой компетенции есть эксперт');
    } else {
      toast.warning(`Найдено ${gaps.size} компетенций без экспертов: ${[...gaps].map(id => COMPETENCIES.find(c => c.id === id)?.name).join(', ')}`);
    }
  };

  const exportMatrix = () => {
    toast.success('Матрица компетенций экспортируется в Excel…');
  };

  const assignTraining = (eng: Engineer) => {
    toast.info(`Обучение назначено для ${eng.name}`);
  };

  const downloadProfile = (eng: Engineer) => {
    toast.success(`Профиль ${eng.name} скачивается…`);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Icon name="Award" className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Матрица компетенций</h2>
              <p className="text-sm text-gray-500">Уровни навыков и сертификации инженеров</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={findGaps}>
              <Icon name="Search" size={14} className="mr-1.5" />
              Найти пробелы
            </Button>
            <Button size="sm" variant="outline" onClick={exportMatrix}>
              <Icon name="Download" size={14} className="mr-1.5" />
              Экспорт матрицы
            </Button>
          </div>
        </div>

        {/* ── Metrics ── */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          {[
            { label: 'Инженеров',       value: engineers.length,  icon: 'Users',      color: 'text-blue-600',   bg: 'bg-blue-50' },
            { label: 'Компетенций',     value: COMPETENCIES.length + 8, icon: 'LayoutGrid', color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Сертифицированных', value: totalCertified,  icon: 'BadgeCheck', color: 'text-green-600',  bg: 'bg-green-50' },
            { label: 'Требует обучения', value: needsTraining,    icon: 'AlertTriangle', color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map(m => (
            <div key={m.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 ${m.bg} rounded-lg flex items-center justify-center`}>
                  <Icon name={m.icon as any} size={18} className={m.color} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{m.value}</p>
                  <p className="text-xs text-gray-500">{m.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по инженеру…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterCompetency}
            onChange={e => setFilterCompetency(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Все компетенции</option>
            {COMPETENCIES.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            {([
              { key: 'all',     label: 'Все' },
              { key: 'missing', label: 'Нет навыка' },
              { key: 'basic',   label: 'Базовый' },
            ] as const).map(opt => (
              <button
                key={opt.key}
                onClick={() => setFilterMode(opt.key)}
                className={`px-3 py-1.5 ${filterMode === opt.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {gapHighlight.size > 0 && (
            <button
              onClick={() => setGapHighlight(new Set())}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              <Icon name="X" size={12} />
              Сбросить подсветку
            </button>
          )}
        </div>

        {/* ── Legend ── */}
        <div className="flex items-center gap-4 mt-3">
          <span className="text-xs text-gray-400">Уровень:</span>
          {([0, 1, 2, 3] as Level[]).map(l => (
            <span key={l} className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${LEVEL_CFG[l].bg} ${LEVEL_CFG[l].text} ${LEVEL_CFG[l].border}`}>
              {LEVEL_CFG[l].emoji} {LEVEL_CFG[l].label}
            </span>
          ))}
          <span className="text-xs text-gray-400 ml-2">Клик на ячейку — изменить уровень</span>
        </div>
      </div>

      {/* ── Body: table + detail panel ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Matrix table ── */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-gray-100 shadow-sm">
              <tr>
                <th className="sticky left-0 z-20 bg-gray-100 text-left px-4 py-3 text-gray-500 font-semibold border-b border-r border-gray-200 min-w-[180px]">
                  Инженер
                </th>
                {COMPETENCIES.map(c => (
                  <th
                    key={c.id}
                    title={c.name}
                    className={`px-2 py-3 text-center border-b border-gray-200 font-medium min-w-[82px] transition-colors ${
                      gapHighlight.has(c.id) ? 'bg-red-50 text-red-700' : 'text-gray-500'
                    }`}
                  >
                    <span className="block leading-tight">{c.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEngineers.map((eng, rowIdx) => (
                <tr
                  key={eng.id}
                  onClick={() => setSelectedId(eng.id)}
                  className={`cursor-pointer transition-colors ${
                    selectedId === eng.id
                      ? 'bg-blue-50 ring-inset ring-1 ring-blue-300'
                      : rowIdx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/50 hover:bg-gray-100/60'
                  }`}
                >
                  {/* Engineer name cell */}
                  <td
                    className={`sticky left-0 z-10 px-4 py-2.5 border-b border-r border-gray-100 ${
                      selectedId === eng.id ? 'bg-blue-50' : rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {eng.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 whitespace-nowrap">{eng.name}</p>
                        <p className="text-gray-400">{eng.role}</p>
                      </div>
                    </div>
                  </td>

                  {/* Competency cells */}
                  {COMPETENCIES.map(c => {
                    const lvl = (eng.skills[c.id] ?? 0) as Level;
                    const cfg = LEVEL_CFG[lvl];
                    const isGap = gapHighlight.has(c.id) && lvl < 2;
                    return (
                      <td
                        key={c.id}
                        className={`px-1.5 py-2 text-center border-b border-gray-100 ${isGap ? 'bg-red-50/40' : ''}`}
                      >
                        <button
                          onClick={e => cycleLevel(eng.id, c.id, e)}
                          title={`${cfg.label} — кликнуть для изменения`}
                          className={`inline-flex items-center justify-center w-full py-1 px-1 rounded border text-xs font-medium transition-all hover:scale-105 active:scale-95 ${cfg.bg} ${cfg.text} ${cfg.border} ${isGap ? 'ring-1 ring-red-300' : ''}`}
                        >
                          {cfg.emoji}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}

              {filteredEngineers.length === 0 && (
                <tr>
                  <td colSpan={COMPETENCIES.length + 1} className="text-center py-12 text-gray-400 text-sm">
                    <Icon name="SearchX" size={32} className="mx-auto mb-2 opacity-30" />
                    Инженеры не найдены
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Detail panel ── */}
        {selectedEng && (
          <div className="w-80 shrink-0 bg-white border-l border-gray-200 overflow-y-auto">

            {/* Engineer header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-base">
                  {selectedEng.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{selectedEng.name}</h3>
                  <p className="text-xs text-gray-500">{selectedEng.role}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 text-xs" onClick={() => assignTraining(selectedEng)}>
                  <Icon name="GraduationCap" size={13} className="mr-1" />
                  Назначить обучение
                </Button>
                <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => downloadProfile(selectedEng)}>
                  <Icon name="FileDown" size={13} className="mr-1" />
                  Скачать профиль
                </Button>
              </div>
            </div>

            {/* Radar chart */}
            <div className="p-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Профиль компетенций</p>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={getRadarData(selectedEng)} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 9, fill: '#6b7280' }}
                  />
                  <Radar
                    name={selectedEng.name}
                    dataKey="value"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* All competencies */}
            <div className="p-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Компетенции</p>
              <div className="space-y-1.5">
                {COMPETENCIES.map(c => {
                  const lvl = (selectedEng.skills[c.id] ?? 0) as Level;
                  const cfg = LEVEL_CFG[lvl];
                  return (
                    <div key={c.id} className="flex items-center justify-between">
                      <span className="text-xs text-gray-700 truncate mr-2">{c.name}</span>
                      <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        {cfg.emoji} {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Certifications */}
            <div className="p-4">
              <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Сертификаты</p>
              {selectedEng.certifications.length === 0 ? (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Icon name="AlertCircle" size={13} />
                  Нет сертификатов
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedEng.certifications.map(cert => {
                    const badge = certExpiresBadge(cert.expires);
                    return (
                      <div key={cert.name} className="flex items-start justify-between gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                        <div className="flex items-start gap-1.5">
                          <Icon name="BadgeCheck" size={13} className="text-blue-500 mt-0.5 shrink-0" />
                          <span className="text-xs text-gray-800 leading-tight">{cert.name}</span>
                        </div>
                        <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded-full font-medium ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetencyMatrixFull;
