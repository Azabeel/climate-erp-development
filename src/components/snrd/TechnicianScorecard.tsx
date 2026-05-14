import { useState } from 'react';
import { Trophy, TrendingUp, Star, Clock, CheckCircle, Target } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface TechnicianScore {
  id: string;
  name: string;
  position: string;
  avatar: string;
  totalScore: number;
  rank: number;
  metrics: {
    completionRate: number;
    slaCompliance: number;
    clientRating: number;
    productivity: number;
    quality: number;
    speed: number;
  };
  stats: {
    ordersMonth: number;
    avgTime: number;
    clientRating: number;
    slaBreaches: number;
    revenue: number;
  };
}

const TECHNICIANS: TechnicianScore[] = [
  {
    id: 't1', name: 'Козлов Михаил', position: 'Инженер-монтажник', avatar: 'КМ', totalScore: 9.2, rank: 1,
    metrics: { completionRate: 97, slaCompliance: 98, clientRating: 95, productivity: 90, quality: 92, speed: 88 },
    stats: { ordersMonth: 24, avgTime: 2.1, clientRating: 4.9, slaBreaches: 0, revenue: 186000 },
  },
  {
    id: 't2', name: 'Петров Сергей', position: 'Инженер по климату', avatar: 'ПС', totalScore: 8.7, rank: 2,
    metrics: { completionRate: 94, slaCompliance: 92, clientRating: 90, productivity: 85, quality: 88, speed: 82 },
    stats: { ordersMonth: 19, avgTime: 2.5, clientRating: 4.7, slaBreaches: 2, revenue: 152000 },
  },
  {
    id: 't3', name: 'Иванов Алексей', position: 'Инженер по климату', avatar: 'ИА', totalScore: 8.1, rank: 3,
    metrics: { completionRate: 90, slaCompliance: 88, clientRating: 85, productivity: 80, quality: 84, speed: 79 },
    stats: { ordersMonth: 16, avgTime: 2.8, clientRating: 4.5, slaBreaches: 3, revenue: 124000 },
  },
  {
    id: 't4', name: 'Сидоров Дмитрий', position: 'Стажёр', avatar: 'СД', totalScore: 6.8, rank: 4,
    metrics: { completionRate: 82, slaCompliance: 75, clientRating: 78, productivity: 65, quality: 72, speed: 68 },
    stats: { ordersMonth: 11, avgTime: 3.5, clientRating: 4.1, slaBreaches: 5, revenue: 74000 },
  },
];

const MONTHLY_ORDERS = [
  { month: 'Янв', КМ: 20, ПС: 15, ИА: 13, СД: 8 },
  { month: 'Фев', КМ: 22, ПС: 17, ИА: 14, СД: 9 },
  { month: 'Мар', КМ: 25, ПС: 19, ИА: 16, СД: 10 },
  { month: 'Апр', КМ: 23, ПС: 18, ИА: 15, СД: 11 },
  { month: 'Май', КМ: 24, ПС: 19, ИА: 16, СД: 11 },
];

const getScoreColor = (score: number) => score >= 9 ? 'text-green-600' : score >= 8 ? 'text-blue-600' : score >= 7 ? 'text-yellow-600' : 'text-red-600';
const getScoreBg = (score: number) => score >= 9 ? 'bg-green-50 border-green-200' : score >= 8 ? 'bg-blue-50 border-blue-200' : score >= 7 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';
const getRankIcon = (rank: number) => rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

const TechnicianScorecard = () => {
  const [selectedTech, setSelectedTech] = useState<TechnicianScore>(TECHNICIANS[0]);

  const radarData = [
    { subject: 'Завершение', value: selectedTech.metrics.completionRate },
    { subject: 'SLA', value: selectedTech.metrics.slaCompliance },
    { subject: 'Клиенты', value: selectedTech.metrics.clientRating },
    { subject: 'Скорость', value: selectedTech.metrics.speed },
    { subject: 'Качество', value: selectedTech.metrics.quality },
    { subject: 'Продуктивность', value: selectedTech.metrics.productivity },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Trophy size={28} className="text-yellow-500" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Скорборд инженеров</h2>
          <p className="text-gray-600 mt-0.5">Рейтинг и показатели эффективности за май 2026</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Рейтинг</h3>
          <div className="space-y-2">
            {TECHNICIANS.map(tech => (
              <div
                key={tech.id}
                onClick={() => setSelectedTech(tech)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedTech.id === tech.id ? 'border-blue-400 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:shadow-sm'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getRankIcon(tech.rank)}</span>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getScoreBg(tech.totalScore)} border`}>
                    {tech.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{tech.name}</p>
                    <p className="text-xs text-gray-500">{tech.position}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${getScoreColor(tech.totalScore)}`}>{tech.totalScore}</p>
                    <p className="text-xs text-gray-400">/ 10</p>
                  </div>
                </div>
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${tech.totalScore >= 9 ? 'bg-green-500' : tech.totalScore >= 8 ? 'bg-blue-500' : tech.totalScore >= 7 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${tech.totalScore * 10}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Radar chart */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Профиль: {selectedTech.name}</h3>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar name="Показатели" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              { label: 'Нарядов/мес', value: selectedTech.stats.ordersMonth, icon: CheckCircle, color: 'text-green-600' },
              { label: 'Среднее время', value: `${selectedTech.stats.avgTime}ч`, icon: Clock, color: 'text-blue-600' },
              { label: 'Оценка клиентов', value: `${selectedTech.stats.clientRating}/5`, icon: Star, color: 'text-yellow-600' },
              { label: 'Выручка', value: `${(selectedTech.stats.revenue / 1000).toFixed(0)}K ₽`, icon: TrendingUp, color: 'text-purple-600' },
            ].map(m => (
              <div key={m.label} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <m.icon size={13} className={m.color} />
                  <span className="text-xs text-gray-500">{m.label}</span>
                </div>
                <p className="font-bold text-gray-900">{m.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly chart */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Нарядов по месяцам</h3>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={MONTHLY_ORDERS}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="КМ" name="Козлов М." fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="ПС" name="Петров С." fill="#10b981" radius={[2, 2, 0, 0]} />
                <Bar dataKey="ИА" name="Иванов А." fill="#f59e0b" radius={[2, 2, 0, 0]} />
                <Bar dataKey="СД" name="Сидоров Д." fill="#ef4444" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target size={14} className="text-amber-600" />
              <span className="text-sm font-semibold text-amber-900">Рекомендация для {selectedTech.name}</span>
            </div>
            <p className="text-xs text-amber-700">
              {selectedTech.totalScore >= 9
                ? 'Отличные показатели! Рассмотрите повышение до старшего инженера.'
                : selectedTech.totalScore >= 8
                ? 'Хорошая работа. Фокус на скорость выполнения нарядов.'
                : 'Необходимо улучшить показатели SLA. Рекомендуется дополнительное обучение.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianScorecard;
