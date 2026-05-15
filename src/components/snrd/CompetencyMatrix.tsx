import { useState } from 'react';
import { Award, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

type Level = 0 | 1 | 2 | 3;

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface EngineerRow {
  id: string;
  name: string;
  role: string;
  skills: Record<string, Level>;
  certifications: string[];
  hireDate: string;
}

const SKILLS: Skill[] = [
  { id: 's1', name: 'Сплит-системы', category: 'Оборудование' },
  { id: 's2', name: 'VRF/VRV системы', category: 'Оборудование' },
  { id: 's3', name: 'Чиллеры', category: 'Оборудование' },
  { id: 's4', name: 'Вентиляция', category: 'Оборудование' },
  { id: 's5', name: 'Daikin', category: 'Бренды' },
  { id: 's6', name: 'Mitsubishi', category: 'Бренды' },
  { id: 's7', name: 'Gree/Haier', category: 'Бренды' },
  { id: 's8', name: 'Диагностика', category: 'Навыки' },
  { id: 's9', name: 'Пайка/фреон', category: 'Навыки' },
  { id: 's10', name: 'Электрика', category: 'Навыки' },
  { id: 's11', name: 'Пуско-наладка', category: 'Навыки' },
  { id: 's12', name: 'Высотные работы', category: 'Допуски' },
];

const ENGINEERS: EngineerRow[] = [
  { id: 'e1', name: 'Козлов М.И.', role: 'Старший инженер', hireDate: '2019-03-01', certifications: ['Daikin Expert', 'F-газы'], skills: { s1: 3, s2: 3, s3: 2, s4: 2, s5: 3, s6: 2, s7: 2, s8: 3, s9: 3, s10: 2, s11: 3, s12: 2 } },
  { id: 'e2', name: 'Петров С.А.', role: 'Инженер', hireDate: '2021-06-15', certifications: ['Mitsubishi Certified', 'F-газы'], skills: { s1: 3, s2: 2, s3: 1, s4: 2, s5: 2, s6: 3, s7: 2, s8: 2, s9: 2, s10: 2, s11: 2, s12: 1 } },
  { id: 'e3', name: 'Иванов А.К.', role: 'Инженер', hireDate: '2022-02-10', certifications: ['F-газы'], skills: { s1: 2, s2: 1, s3: 0, s4: 1, s5: 2, s6: 1, s7: 3, s8: 2, s9: 2, s10: 1, s11: 1, s12: 0 } },
  { id: 'e4', name: 'Сидоров Д.М.', role: 'Инженер', hireDate: '2023-05-01', certifications: [], skills: { s1: 2, s2: 1, s3: 0, s4: 1, s5: 1, s6: 1, s7: 2, s8: 2, s9: 1, s10: 1, s11: 1, s12: 0 } },
  { id: 'e5', name: 'Новиков Р.С.', role: 'Стажёр', hireDate: '2025-01-15', certifications: [], skills: { s1: 1, s2: 0, s3: 0, s4: 0, s5: 1, s6: 0, s7: 1, s8: 1, s9: 1, s10: 0, s11: 0, s12: 0 } },
];

const LEVEL_CFG: Record<Level, { label: string; cls: string; short: string }> = {
  0: { label: 'Нет', cls: 'bg-gray-100 text-gray-400', short: '—' },
  1: { label: 'Базовый', cls: 'bg-yellow-100 text-yellow-700', short: 'Б' },
  2: { label: 'Уверенный', cls: 'bg-blue-100 text-blue-700', short: 'У' },
  3: { label: 'Эксперт', cls: 'bg-green-100 text-green-700', short: 'Э' },
};

const CATEGORIES = Array.from(new Set(SKILLS.map(s => s.category)));

const getRadarData = (eng: EngineerRow) => [
  { subject: 'Оборудование', A: Math.round((['s1','s2','s3','s4'].map(id => eng.skills[id] || 0).reduce((a, b) => a + b, 0) / (4 * 3)) * 100) },
  { subject: 'Бренды', A: Math.round((['s5','s6','s7'].map(id => eng.skills[id] || 0).reduce((a, b) => a + b, 0) / (3 * 3)) * 100) },
  { subject: 'Навыки', A: Math.round((['s8','s9','s10','s11'].map(id => eng.skills[id] || 0).reduce((a, b) => a + b, 0) / (4 * 3)) * 100) },
  { subject: 'Допуски', A: Math.round((eng.skills['s12'] || 0) / 3 * 100) },
  { subject: 'Сертификаты', A: Math.min(100, eng.certifications.length * 33) },
];

const CompetencyMatrix = () => {
  const [selected, setSelected] = useState<string | null>('e1');
  const [expandedCat, setExpandedCat] = useState<Record<string, boolean>>({ Оборудование: true });

  const selectedEng = ENGINEERS.find(e => e.id === selected);

  const totalScore = (eng: EngineerRow) => {
    const total = SKILLS.reduce((s, sk) => s + (eng.skills[sk.id] || 0), 0);
    return Math.round((total / (SKILLS.length * 3)) * 100);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Award size={28} className="text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Матрица компетенций</h2>
            <p className="text-gray-500 text-sm">Уровни навыков и сертификации инженеров</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {([0, 1, 2, 3] as Level[]).map(l => (
              <span key={l} className={`px-2 py-0.5 rounded-full font-medium ${LEVEL_CFG[l].cls}`}>
                {LEVEL_CFG[l].short} — {LEVEL_CFG[l].label}
              </span>
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={() => toast.info('Экспорт матрицы')}>Экспорт</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Matrix table */}
        <div className="col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-3 py-2 text-gray-500 font-medium sticky left-0 bg-gray-50 min-w-[140px]">Инженер</th>
                  <th className="px-2 py-2 text-gray-400 font-medium text-center w-10">Балл</th>
                  {SKILLS.map(s => (
                    <th key={s.id} className="px-1 py-2 text-gray-500 font-medium text-center w-12" title={s.name}>
                      <span className="block truncate w-10">{s.name.slice(0, 8)}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ENGINEERS.map(eng => (
                  <tr key={eng.id}
                    onClick={() => setSelected(eng.id)}
                    className={`cursor-pointer ${selected === eng.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                    <td className={`px-3 py-2 sticky left-0 ${selected === eng.id ? 'bg-blue-50' : 'bg-white'}`}>
                      <p className="font-semibold text-gray-900">{eng.name}</p>
                      <p className="text-gray-400">{eng.role}</p>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className={`font-bold ${totalScore(eng) >= 70 ? 'text-green-600' : totalScore(eng) >= 50 ? 'text-blue-600' : 'text-yellow-600'}`}>
                        {totalScore(eng)}%
                      </span>
                    </td>
                    {SKILLS.map(s => {
                      const lvl = (eng.skills[s.id] || 0) as Level;
                      return (
                        <td key={s.id} className="px-1 py-2 text-center">
                          <span className={`inline-block w-8 py-0.5 rounded text-xs font-bold ${LEVEL_CFG[lvl].cls}`}>
                            {LEVEL_CFG[lvl].short}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {selectedEng && (
            <>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-700 font-bold">
                      {selectedEng.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedEng.name}</h4>
                    <p className="text-xs text-gray-500">{selectedEng.role}</p>
                    <p className="text-xs text-gray-400">Стаж с {new Date(selectedEng.hireDate).getFullYear()}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Общий балл</span>
                  <span className={`text-xl font-bold ${totalScore(selectedEng) >= 70 ? 'text-green-600' : totalScore(selectedEng) >= 50 ? 'text-blue-600' : 'text-yellow-600'}`}>
                    {totalScore(selectedEng)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full mb-3">
                  <div className={`h-2 rounded-full ${totalScore(selectedEng) >= 70 ? 'bg-green-500' : totalScore(selectedEng) >= 50 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                    style={{ width: `${totalScore(selectedEng)}%` }} />
                </div>

                <h5 className="text-xs font-medium text-gray-500 mb-2">Сертификаты</h5>
                {selectedEng.certifications.length > 0
                  ? selectedEng.certifications.map(cert => (
                    <span key={cert} className="inline-block mr-1 mb-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">{cert}</span>
                  ))
                  : <span className="text-xs text-gray-400">Нет сертификатов</span>
                }
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">Профиль компетенций</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={getRadarData(selectedEng)}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <Radar name={selectedEng.name} dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <h4 className="font-semibold text-gray-900 p-4 pb-0 text-sm">Детально по категориям</h4>
                {CATEGORIES.map(cat => {
                  const catSkills = SKILLS.filter(s => s.category === cat);
                  const isOpen = expandedCat[cat];
                  return (
                    <div key={cat}>
                      <button
                        onClick={() => setExpandedCat(prev => ({ ...prev, [cat]: !prev[cat] }))}
                        className="w-full flex justify-between items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <span className="font-medium">{cat}</span>
                        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      {isOpen && catSkills.map(s => {
                        const lvl = (selectedEng.skills[s.id] || 0) as Level;
                        return (
                          <div key={s.id} className="flex items-center justify-between px-6 py-1.5 border-t border-gray-50">
                            <span className="text-xs text-gray-700">{s.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_CFG[lvl].cls}`}>
                              {LEVEL_CFG[lvl].label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetencyMatrix;
