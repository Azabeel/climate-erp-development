import { useState, useMemo } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type Level = 0 | 1 | 2 | 3 | 4;

interface Certification {
  id: string;
  name: string;
  issuer: string;
  issued: string;  // ISO date
  expires: string; // ISO date
}

interface Engineer {
  id: string;
  name: string;
  role: string;
  skills: Record<string, Level>;
  target: Record<string, Level>;
  certifications: Certification[];
}

interface TrainingItem {
  id: string;
  course: string;
  engineerId: string;
  date: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
}

interface EditCell {
  engId: string;
  compId: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COMPETENCIES = [
  { id: 'c1',  name: 'VRF-системы' },
  { id: 'c2',  name: 'Чиллеры' },
  { id: 'c3',  name: 'Кондиционеры' },
  { id: 'c4',  name: 'Вентиляция' },
  { id: 'c5',  name: 'Электрика' },
  { id: 'c6',  name: 'Гидравлика' },
  { id: 'c7',  name: 'Автоматика' },
  { id: 'c8',  name: 'Хладагенты' },
  { id: 'c9',  name: 'Монтаж' },
  { id: 'c10', name: 'Диагностика' },
] as const;

const LEVEL_CFG: Record<Level, { label: string; short: string; bg: string; text: string; dot: string }> = {
  0: { label: 'Нет',      short: '0', bg: 'bg-gray-100',   text: 'text-gray-400',   dot: 'bg-gray-300' },
  1: { label: 'Базовый',  short: '1', bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-400' },
  2: { label: 'Уверенный',short: '2', bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  3: { label: 'Эксперт',  short: '3', bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500' },
  4: { label: 'Наставник',short: '4', bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
};

const TRAINING_STATUS_CFG: Record<TrainingItem['status'], { label: string; cls: string }> = {
  planned:     { label: 'Запланировано', cls: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'Идёт',          cls: 'bg-amber-100 text-amber-700' },
  completed:   { label: 'Завершено',     cls: 'bg-green-100 text-green-700' },
  cancelled:   { label: 'Отменено',      cls: 'bg-red-100 text-red-700' },
};

// ─── Static data ──────────────────────────────────────────────────────────────

const ENGINEERS_INITIAL: Engineer[] = [
  {
    id: 'e1', name: 'Иванов А.П.', role: 'Старший инженер',
    skills:  { c1:4, c2:3, c3:4, c4:2, c5:3, c6:2, c7:3, c8:4, c9:3, c10:4 },
    target:  { c1:4, c2:4, c3:4, c4:3, c5:3, c6:3, c7:3, c8:4, c9:3, c10:4 },
    certifications: [
      { id:'cert-1', name:'Daikin Expert', issuer:'Daikin Russia', issued:'2023-05-10', expires:'2026-05-10' },
      { id:'cert-2', name:'F-газы кат. I', issuer:'Росприроднадзор', issued:'2022-03-15', expires:'2027-03-15' },
      { id:'cert-3', name:'Электробезопасность III гр.', issuer:'Ростехнадзор', issued:'2024-01-20', expires:'2026-01-20' },
      { id:'cert-4', name:'Работа на высоте', issuer:'Учебный центр', issued:'2024-06-01', expires:'2026-06-01' },
    ],
  },
  {
    id: 'e2', name: 'Петров С.В.', role: 'Инженер',
    skills:  { c1:2, c2:1, c3:3, c4:2, c5:2, c6:1, c7:2, c8:3, c9:2, c10:3 },
    target:  { c1:3, c2:3, c3:3, c4:3, c5:3, c6:2, c7:3, c8:3, c9:3, c10:3 },
    certifications: [
      { id:'cert-5', name:'Mitsubishi Certified', issuer:'Mitsubishi Electric', issued:'2024-02-01', expires:'2025-12-01' },
      { id:'cert-6', name:'F-газы кат. II', issuer:'Росприроднадзор', issued:'2023-06-10', expires:'2028-06-10' },
    ],
  },
  {
    id: 'e3', name: 'Сидоров К.И.', role: 'Инженер',
    skills:  { c1:1, c2:0, c3:3, c4:3, c5:3, c6:0, c7:2, c8:2, c9:3, c10:2 },
    target:  { c1:2, c2:2, c3:3, c4:3, c5:3, c6:2, c7:2, c8:3, c9:3, c10:3 },
    certifications: [
      { id:'cert-7', name:'F-газы кат. I', issuer:'Росприроднадзор', issued:'2021-11-05', expires:'2026-11-05' },
      { id:'cert-8', name:'Daikin Basic', issuer:'Daikin Russia', issued:'2021-08-22', expires:'2025-08-22' },
    ],
  },
  {
    id: 'e4', name: 'Козлов М.А.', role: 'Старший инженер',
    skills:  { c1:4, c2:3, c3:3, c4:2, c5:2, c6:3, c7:2, c8:4, c9:4, c10:3 },
    target:  { c1:4, c2:4, c3:4, c4:3, c5:3, c6:4, c7:3, c8:4, c9:4, c10:4 },
    certifications: [
      { id:'cert-9', name:'Gree Certified', issuer:'Gree Electric', issued:'2023-04-18', expires:'2026-04-18' },
      { id:'cert-10', name:'F-газы кат. I', issuer:'Росприроднадзор', issued:'2022-01-30', expires:'2027-01-30' },
      { id:'cert-11', name:'Работа на высоте', issuer:'Учебный центр', issued:'2024-07-12', expires:'2026-07-12' },
    ],
  },
  {
    id: 'e5', name: 'Новиков Д.В.', role: 'Инженер',
    skills:  { c1:2, c2:2, c3:2, c4:1, c5:1, c6:1, c7:2, c8:2, c9:2, c10:2 },
    target:  { c1:3, c2:3, c3:3, c4:2, c5:2, c6:2, c7:2, c8:3, c9:3, c10:3 },
    certifications: [
      { id:'cert-12', name:'F-газы кат. II', issuer:'Росприроднадзор', issued:'2024-09-09', expires:'2029-09-09' },
    ],
  },
  {
    id: 'e6', name: 'Морозова Е.С.', role: 'Инженер',
    skills:  { c1:0, c2:1, c3:2, c4:2, c5:2, c6:0, c7:4, c8:1, c9:2, c10:3 },
    target:  { c1:2, c2:2, c3:3, c4:3, c5:3, c6:2, c7:4, c8:2, c9:3, c10:4 },
    certifications: [
      { id:'cert-13', name:'IoT/BMS Siemens', issuer:'Siemens Learning', issued:'2024-02-14', expires:'2027-02-14' },
      { id:'cert-14', name:'F-газы кат. II', issuer:'Росприроднадзор', issued:'2023-08-01', expires:'2028-08-01' },
    ],
  },
  {
    id: 'e7', name: 'Волков Р.П.', role: 'Стажёр',
    skills:  { c1:0, c2:0, c3:1, c4:1, c5:1, c6:0, c7:1, c8:1, c9:1, c10:1 },
    target:  { c1:2, c2:2, c3:2, c4:2, c5:2, c6:1, c7:2, c8:2, c9:2, c10:2 },
    certifications: [],
  },
  {
    id: 'e8', name: 'Захаров И.Н.', role: 'Инженер',
    skills:  { c1:3, c2:3, c3:3, c4:2, c5:3, c6:2, c7:2, c8:3, c9:2, c10:3 },
    target:  { c1:4, c2:4, c3:3, c4:3, c5:3, c6:3, c7:3, c8:4, c9:3, c10:3 },
    certifications: [
      { id:'cert-15', name:'Mitsubishi Expert', issuer:'Mitsubishi Electric', issued:'2023-05-20', expires:'2026-05-20' },
      { id:'cert-16', name:'F-газы кат. I', issuer:'Росприроднадзор', issued:'2021-12-31', expires:'2026-12-31' },
      { id:'cert-17', name:'Электробезопасность IV гр.', issuer:'Ростехнадзор', issued:'2023-11-15', expires:'2025-11-15' },
    ],
  },
];

const TRAINING_DATA: TrainingItem[] = [
  { id:'t1', course:'VRF Advanced — Daikin VRV IV',    engineerId:'e2', date:'2026-06-10', status:'planned' },
  { id:'t2', course:'Чиллеры York: монтаж и наладка',  engineerId:'e3', date:'2026-06-18', status:'planned' },
  { id:'t3', course:'Электробезопасность III гр.',      engineerId:'e7', date:'2026-05-28', status:'in_progress' },
  { id:'t4', course:'F-газы кат. I — продление',       engineerId:'e5', date:'2026-07-05', status:'planned' },
  { id:'t5', course:'Гидравлика в системах вентиляции', engineerId:'e6', date:'2026-05-20', status:'completed' },
  { id:'t6', course:'Основы диагностики VRF',           engineerId:'e7', date:'2026-08-01', status:'planned' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function certStatus(expires: string): { label: string; cls: string } {
  const days = Math.ceil((new Date(expires).getTime() - Date.now()) / 86_400_000);
  if (days < 0)   return { label: 'Просрочен',  cls: 'bg-red-100 text-red-700' };
  if (days < 90)  return { label: 'Истекает',   cls: 'bg-amber-100 text-amber-700' };
  return { label: 'Активен', cls: 'bg-green-100 text-green-700' };
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day:'2-digit', month:'2-digit', year:'numeric' });
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2);
}

function totalScore(eng: Engineer): number {
  const sum = COMPETENCIES.reduce((s, c) => s + (eng.skills[c.id] ?? 0), 0);
  return Math.round((sum / (COMPETENCIES.length * 4)) * 100);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LevelDot({ level }: { level: Level }) {
  const cfg = LEVEL_CFG[level];
  return (
    <span
      title={cfg.label}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${cfg.bg} ${cfg.text}`}
    >
      {cfg.short}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const CompetencyMatrixFull = () => {
  const [engineers, setEngineers] = useState<Engineer[]>(ENGINEERS_INITIAL);
  const [selectedId, setSelectedId] = useState<string>('all');
  const [editCell, setEditCell] = useState<EditCell | null>(null);
  const [editLevel, setEditLevel] = useState<Level>(0);

  // ── Derived ────────────────────────────────────────────────────────────────

  const selectedEng = useMemo(
    () => engineers.find(e => e.id === selectedId) ?? null,
    [engineers, selectedId],
  );

  const radarData = useMemo(() => {
    if (!selectedEng) return [];
    return COMPETENCIES.map(c => ({
      subject: c.name,
      Текущий: selectedEng.skills[c.id] ?? 0,
      Целевой: selectedEng.target[c.id] ?? 0,
    }));
  }, [selectedEng]);

  const barData = useMemo(() => {
    if (!selectedEng) return [];
    return COMPETENCIES.map(c => ({
      name: c.name,
      Текущий: selectedEng.skills[c.id] ?? 0,
      Целевой: selectedEng.target[c.id] ?? 0,
    }));
  }, [selectedEng]);

  const gapRows = useMemo(() => {
    const rows: { eng: Engineer; compId: string; compName: string; current: Level; target: Level; gap: number }[] = [];
    engineers.forEach(eng => {
      COMPETENCIES.forEach(c => {
        const cur = (eng.skills[c.id] ?? 0) as Level;
        const tgt = (eng.target[c.id] ?? 0) as Level;
        const gap = cur - tgt;
        if (gap < 0) rows.push({ eng, compId: c.id, compName: c.name, current: cur, target: tgt, gap });
      });
    });
    return rows.sort((a, b) => a.gap - b.gap);
  }, [engineers]);

  const top5Gaps = useMemo(() => gapRows.slice(0, 5), [gapRows]);

  const allCerts = useMemo(() =>
    engineers
      .flatMap(eng => eng.certifications.map(cert => ({ ...cert, eng })))
      .sort((a, b) => new Date(a.expires).getTime() - new Date(b.expires).getTime()),
    [engineers],
  );

  // ── Handlers ───────────────────────────────────────────────────────────────

  const openEditDialog = (engId: string, compId: string, current: Level) => {
    setEditCell({ engId, compId });
    setEditLevel(current);
  };

  const saveLevel = () => {
    if (!editCell) return;
    setEngineers(prev =>
      prev.map(eng => {
        if (eng.id !== editCell.engId) return eng;
        const comp = COMPETENCIES.find(c => c.id === editCell.compId);
        toast.success(`${eng.name} — «${comp?.name}»: уровень → ${LEVEL_CFG[editLevel].label}`);
        return { ...eng, skills: { ...eng.skills, [editCell.compId]: editLevel } };
      }),
    );
    setEditCell(null);
  };

  const handleExport = () => toast.success('Матрица компетенций экспортируется в Excel…');
  const handleAddComp = () => toast.info('Форма добавления компетенции откроется в следующей версии');
  const handleAddTraining = () => toast.info('Форма добавления обучения откроется в следующей версии');
  const handleAssignTraining = (eng: Engineer) => toast.info(`Обучение назначено для ${eng.name}`);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-gray-50">

      <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Icon name="Award" className="text-indigo-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Матрица компетенций</h2>
              <p className="text-sm text-gray-500">Уровни навыков, сертификаты и планы обучения инженеров</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="w-52 text-sm">
                <SelectValue placeholder="Выбрать инженера" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все инженеры</SelectItem>
                {engineers.map(e => (
                  <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={handleAddComp}>
              <Icon name="Plus" size={14} className="mr-1.5" />
              Добавить компетенцию
            </Button>
            <Button size="sm" variant="outline" onClick={handleExport}>
              <Icon name="Download" size={14} className="mr-1.5" />
              Экспорт
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="matrix" className="flex flex-col h-full">
          <div className="bg-white border-b border-gray-200 px-6">
            <TabsList className="h-10 bg-transparent p-0 gap-0">
              {[
                { value:'matrix',  label:'Матрица',     icon:'LayoutGrid' },
                { value:'gaps',    label:'Пробелы',      icon:'AlertTriangle' },
                { value:'training',label:'Обучение',     icon:'GraduationCap' },
                { value:'certs',   label:'Сертификаты',  icon:'BadgeCheck' },
              ].map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 data-[state=active]:bg-transparent text-gray-500"
                >
                  <Icon name={tab.icon as any} size={14} />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ── Tab: Matrix ───────────────────────────────────────────────────── */}
          <TabsContent value="matrix" className="flex-1 overflow-hidden m-0 flex">

            {/* Matrix table */}
            <div className="flex-1 overflow-auto">

              <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b border-gray-100 bg-white text-xs">
                <span className="font-medium text-gray-500">Уровни:</span>
                {([0,1,2,3,4] as Level[]).map(l => (
                  <span key={l} className={`px-2 py-0.5 rounded-full font-medium ${LEVEL_CFG[l].bg} ${LEVEL_CFG[l].text}`}>
                    {LEVEL_CFG[l].short} — {LEVEL_CFG[l].label}
                  </span>
                ))}
                <span className="text-gray-400 ml-1">· клик на ячейку для изменения</span>
              </div>

              <table className="w-full text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
                  <tr>
                    <th className="sticky left-0 z-20 bg-gray-50 text-left px-4 py-3 text-gray-500 font-semibold border-b border-r border-gray-200 min-w-[180px]">
                      Инженер
                    </th>
                    {COMPETENCIES.map(c => (
                      <th key={c.id} className="px-2 py-3 text-center border-b border-gray-200 font-medium text-gray-600 min-w-[88px]">
                        {c.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {engineers.map((eng, rowIdx) => (
                    <tr key={eng.id} onClick={() => setSelectedId(eng.id)}
                      className={`cursor-pointer transition-colors ${selectedId === eng.id ? 'bg-indigo-50 ring-inset ring-1 ring-indigo-200' : rowIdx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/60 hover:bg-gray-100/70'}`}
                    >
                      <td className={`sticky left-0 z-10 px-4 py-2.5 border-b border-r border-gray-100 ${selectedId === eng.id ? 'bg-indigo-50' : rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}`}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {initials(eng.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 whitespace-nowrap">{eng.name}</p>
                            <p className="text-gray-400">{eng.role}</p>
                          </div>
                        </div>
                      </td>
                      {COMPETENCIES.map(c => {
                        const lvl = (eng.skills[c.id] ?? 0) as Level;
                        return (
                          <td key={c.id} className="px-2 py-2 text-center border-b border-gray-100">
                            <button onClick={e => { e.stopPropagation(); openEditDialog(eng.id, c.id, lvl); }}
                              className="hover:scale-110 transition-transform active:scale-95">
                              <LevelDot level={lvl} />
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Detail panel (shown when engineer selected) */}
            {selectedEng && (
              <div className="w-96 shrink-0 bg-white border-l border-gray-200 overflow-y-auto">

                {/* Engineer header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-bold text-base shrink-0">
                      {initials(selectedEng.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900">{selectedEng.name}</h3>
                      <p className="text-xs text-gray-500">{selectedEng.role}</p>
                      <Progress value={totalScore(selectedEng)} className="h-1.5 mt-1.5" />
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-bold text-indigo-600">{totalScore(selectedEng)}%</p>
                      <p className="text-xs text-gray-400">балл</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 text-xs" onClick={() => handleAssignTraining(selectedEng)}>
                      <Icon name="GraduationCap" size={13} className="mr-1" />
                      Назначить обучение
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => toast.success(`Профиль ${selectedEng.name} скачивается…`)}>
                      <Icon name="FileDown" size={13} />
                    </Button>
                  </div>
                </div>

                {/* Radar chart */}
                <div className="p-4 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Профиль компетенций</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={radarData} margin={{ top:10, right:20, bottom:10, left:20 }}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#6b7280' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 4]} tick={{ fontSize: 8, fill: '#9ca3af' }} tickCount={5} />
                      <Radar name="Целевой" dataKey="Целевой" stroke="#e5e7eb" fill="#e5e7eb" fillOpacity={0.5} strokeWidth={1} strokeDasharray="4 2" />
                      <Radar name="Текущий" dataKey="Текущий" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-4 text-xs text-gray-500 justify-center mt-1">
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-indigo-500 inline-block"/>Текущий</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-gray-300 inline-block"/>Целевой</span>
                  </div>
                </div>

                {/* Bar chart */}
                <div className="p-4 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Прогресс по компетенциям</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={barData} layout="vertical" margin={{ top:0, right:20, bottom:0, left:10 }}>
                      <XAxis type="number" domain={[0,4]} tickCount={5} tick={{ fontSize:9 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize:9 }} width={80} />
                      <Tooltip
                        contentStyle={{ fontSize:11 }}
                        formatter={(val, name) => [`${val} — ${LEVEL_CFG[val as Level]?.label ?? val}`, name]}
                      />
                      <Bar dataKey="Целевой" fill="#e5e7eb" radius={2} />
                      <Bar dataKey="Текущий" radius={2}>
                        {barData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={entry.Текущий >= entry.Целевой ? '#6366f1' : entry.Текущий === 0 ? '#fca5a5' : '#93c5fd'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Certifications */}
                <div className="p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Сертификаты ({selectedEng.certifications.length})</p>
                  {selectedEng.certifications.length === 0
                    ? <p className="text-xs text-gray-400 flex items-center gap-1.5"><Icon name="AlertCircle" size={13} />Нет сертификатов</p>
                    : <div className="space-y-2">
                      {selectedEng.certifications.map(cert => {
                        const st = certStatus(cert.expires);
                        return (
                          <div key={cert.id} className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-medium text-gray-800 flex items-start gap-1.5 leading-tight">
                                <Icon name="BadgeCheck" size={13} className="text-indigo-400 mt-0.5 shrink-0" />{cert.name}
                              </p>
                              <Badge className={`text-xs shrink-0 ${st.cls} border-0`}>{st.label}</Badge>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 ml-5">{cert.issuer} · до {fmtDate(cert.expires)}</p>
                          </div>
                        );
                      })}
                    </div>
                  }
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── Tab: Gaps ─────────────────────────────────────────────────────── */}
          <TabsContent value="gaps" className="flex-1 overflow-auto m-0 p-6">
            <div className="max-w-5xl mx-auto space-y-6">

              {/* Top 5 critical */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Icon name="AlertTriangle" size={16} className="text-red-500" />
                    Топ-5 критических пробелов
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {top5Gaps.map((row, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">{i+1}</span>
                          <p className="text-sm font-semibold text-gray-900">{row.eng.name} · <span className="font-normal text-gray-500">{row.compName}</span></p>
                        </div>
                        <div className="flex items-center gap-2">
                          <LevelDot level={row.current} />
                          <Icon name="ArrowRight" size={12} className="text-gray-400" />
                          <LevelDot level={row.target} />
                          <Badge className={`text-xs border-0 ${row.gap <= -2 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{row.gap <= -2 ? 'Критично' : 'Внимание'}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Full gap table */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Все пробелы в компетенциях</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-y border-gray-200">
                        <tr>
                          {['Инженер','Компетенция','Текущий уровень','Целевой уровень','GAP'].map(h => (
                            <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {gapRows.map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                  {initials(row.eng.name)}
                                </div>
                                <span className="font-medium text-gray-900">{row.eng.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-gray-700">{row.compName}</td>
                            <td className="px-4 py-2.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${LEVEL_CFG[row.current].bg} ${LEVEL_CFG[row.current].text}`}>
                                {row.current} — {LEVEL_CFG[row.current].label}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${LEVEL_CFG[row.target].bg} ${LEVEL_CFG[row.target].text}`}>
                                {row.target} — {LEVEL_CFG[row.target].label}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className={`font-bold text-sm ${row.gap <= -2 ? 'text-red-600' : 'text-amber-600'}`}>
                                {row.gap}
                              </span>
                              {row.gap <= -2 && (
                                <Badge className="ml-2 text-xs border-0 bg-red-100 text-red-700">Критично</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                        {gapRows.length === 0 && (
                          <tr>
                            <td colSpan={5} className="text-center py-10 text-gray-400 text-sm">
                              <Icon name="CheckCircle2" size={32} className="mx-auto mb-2 text-green-400" />
                              Пробелов не найдено
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Tab: Training ─────────────────────────────────────────────────── */}
          <TabsContent value="training" className="flex-1 overflow-auto m-0 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Планы обучения</h3>
                <Button size="sm" onClick={handleAddTraining}>
                  <Icon name="Plus" size={14} className="mr-1.5" />
                  Добавить обучение
                </Button>
              </div>

              <div className="space-y-3">
                {TRAINING_DATA.map(item => {
                  const eng = engineers.find(e => e.id === item.engineerId);
                  const st = TRAINING_STATUS_CFG[item.status];
                  return (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                              <Icon name="GraduationCap" size={16} className="text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{item.course}</p>
                              {eng && (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                    {initials(eng.name)}
                                  </div>
                                  <span className="text-xs text-gray-500">{eng.name} · {eng.role}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Дата</p>
                              <p className="text-sm font-medium text-gray-800">{fmtDate(item.date)}</p>
                            </div>
                            <Badge className={`text-xs border-0 ${st.cls}`}>{st.label}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* ── Tab: Certificates ─────────────────────────────────────────────── */}
          <TabsContent value="certs" className="flex-1 overflow-auto m-0 p-6">
            <div className="max-w-5xl mx-auto">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Все сертификаты — отсортированы по дате истечения
              </h3>
              <Card>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-y border-gray-200">
                      <tr>
                        {['Инженер','Сертификат','Организация','Выдан','Истекает','Статус'].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {allCerts.map(cert => {
                        const st = certStatus(cert.expires);
                        return (
                          <tr key={cert.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                  {initials(cert.eng.name)}
                                </div>
                                <span className="font-medium text-gray-900">{cert.eng.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-1.5">
                                <Icon name="BadgeCheck" size={13} className="text-indigo-400 shrink-0" />
                                <span className="text-gray-900">{cert.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-gray-500">{cert.issuer}</td>
                            <td className="px-4 py-2.5 text-gray-600">{fmtDate(cert.issued)}</td>
                            <td className={`px-4 py-2.5 font-medium ${st.label === 'Просрочен' ? 'text-red-600' : st.label === 'Истекает' ? 'text-amber-600' : 'text-gray-700'}`}>
                              {fmtDate(cert.expires)}
                            </td>
                            <td className="px-4 py-2.5">
                              <Badge className={`text-xs border-0 ${st.cls}`}>{st.label}</Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={editCell !== null} onOpenChange={open => !open && setEditCell(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">
              Изменить уровень компетенции
            </DialogTitle>
          </DialogHeader>
          {editCell && (() => {
            const eng = engineers.find(e => e.id === editCell.engId);
            const comp = COMPETENCIES.find(c => c.id === editCell.compId);
            return (
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">{eng?.name}</span> · {comp?.name}
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {([0,1,2,3,4] as Level[]).map(l => (
                    <button
                      key={l}
                      onClick={() => setEditLevel(l)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                        editLevel === l ? 'border-indigo-500 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                      } ${LEVEL_CFG[l].bg}`}
                    >
                      <span className={`text-lg font-bold ${LEVEL_CFG[l].text}`}>{LEVEL_CFG[l].short}</span>
                      <span className={`text-xs ${LEVEL_CFG[l].text} text-center leading-tight`}>{LEVEL_CFG[l].label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" size="sm" onClick={() => setEditCell(null)}>Отмена</Button>
                  <Button size="sm" onClick={saveLevel}>Сохранить</Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompetencyMatrixFull;
