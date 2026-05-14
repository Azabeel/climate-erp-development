import { useState } from 'react';
import { Heart, TrendingUp, TrendingDown, Search } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface ClientHealth {
  id: string;
  name: string;
  type: string;
  totalScore: number;
  trend: 'up' | 'down' | 'stable';
  metrics: {
    engagement: number;
    slaCompliance: number;
    paymentScore: number;
    usageScore: number;
    sentimentScore: number;
  };
  lastActivity: string;
  revenue: number;
  risk: 'low' | 'medium' | 'high';
}

const CLIENTS: ClientHealth[] = [
  { id: 'c1', name: 'ООО «Альфа Технологии»', type: 'Юр. лицо', totalScore: 87, trend: 'up', metrics: { engagement: 90, slaCompliance: 95, paymentScore: 92, usageScore: 78, sentimentScore: 82 }, lastActivity: '12.05.2026', revenue: 485000, risk: 'low' },
  { id: 'c2', name: 'ТЦ «Мираж»', type: 'Юр. лицо', totalScore: 72, trend: 'stable', metrics: { engagement: 75, slaCompliance: 80, paymentScore: 70, usageScore: 65, sentimentScore: 72 }, lastActivity: '08.05.2026', revenue: 312000, risk: 'medium' },
  { id: 'c3', name: 'ООО «Берег»', type: 'Юр. лицо', totalScore: 58, trend: 'down', metrics: { engagement: 55, slaCompliance: 65, paymentScore: 45, usageScore: 60, sentimentScore: 58 }, lastActivity: '15.04.2026', revenue: 124000, risk: 'high' },
  { id: 'c4', name: 'ИП Смирнов В.А.', type: 'Физ. лицо', totalScore: 91, trend: 'up', metrics: { engagement: 95, slaCompliance: 98, paymentScore: 100, usageScore: 85, sentimentScore: 90 }, lastActivity: '10.05.2026', revenue: 87000, risk: 'low' },
  { id: 'c5', name: 'Петров И.И.', type: 'Физ. лицо', totalScore: 45, trend: 'down', metrics: { engagement: 40, slaCompliance: 55, paymentScore: 30, usageScore: 50, sentimentScore: 48 }, lastActivity: '22.02.2026', revenue: 18000, risk: 'high' },
];

const getScoreColor = (score: number) => score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
const getScoreBg = (score: number) => score >= 80 ? 'bg-green-50 border-green-200' : score >= 60 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';
const getRiskBadge = (risk: string) => ({ low: 'bg-green-100 text-green-700', medium: 'bg-yellow-100 text-yellow-700', high: 'bg-red-100 text-red-700' }[risk] || 'bg-gray-100 text-gray-600');
const getRiskLabel = (risk: string) => ({ low: 'Низкий риск', medium: 'Средний риск', high: 'Высокий риск' }[risk] || risk);

const CustomerHealthScore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientHealth>(CLIENTS[0]);
  const [riskFilter, setRiskFilter] = useState('all');

  const filtered = CLIENTS.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRisk = riskFilter === 'all' || c.risk === riskFilter;
    return matchSearch && matchRisk;
  });

  const radarData = [
    { subject: 'Активность', value: selectedClient.metrics.engagement },
    { subject: 'SLA', value: selectedClient.metrics.slaCompliance },
    { subject: 'Платёжность', value: selectedClient.metrics.paymentScore },
    { subject: 'Использование', value: selectedClient.metrics.usageScore },
    { subject: 'Лояльность', value: selectedClient.metrics.sentimentScore },
  ];

  const avgScore = Math.round(CLIENTS.reduce((s, c) => s + c.totalScore, 0) / CLIENTS.length);
  const atRisk = CLIENTS.filter(c => c.risk === 'high').length;

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Heart size={28} className="text-red-500" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Здоровье клиентов</h2>
          <p className="text-gray-600 mt-0.5">Customer Health Score — оценка лояльности и рисков оттока</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700 font-medium">Средний Health Score</p>
          <p className={`text-3xl font-bold ${getScoreColor(avgScore)}`}>{avgScore}</p>
          <p className="text-xs text-gray-500 mt-1">из 100 баллов</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700 font-medium">Здоровые клиенты</p>
          <p className="text-3xl font-bold text-green-700">{CLIENTS.filter(c => c.risk === 'low').length}</p>
          <p className="text-xs text-gray-500 mt-1">score ≥ 80</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700 font-medium">Риск оттока</p>
          <p className="text-3xl font-bold text-red-700">{atRisk}</p>
          <p className="text-xs text-gray-500 mt-1">требуют внимания</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-700 font-medium">Отслеживается</p>
          <p className="text-3xl font-bold text-purple-700">{CLIENTS.length}</p>
          <p className="text-xs text-gray-500 mt-1">клиентов</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Client list */}
        <div className="w-80 shrink-0">
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="all">Все</option>
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
            </select>
          </div>

          <div className="space-y-2">
            {filtered.map(client => (
              <div
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedClient.id === client.id ? 'border-blue-400 bg-blue-50 shadow' : 'border-gray-200 bg-white hover:shadow-sm'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{client.name}</p>
                    <p className="text-xs text-gray-500">{client.type}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {client.trend === 'up' ? <TrendingUp size={14} className="text-green-500" /> : client.trend === 'down' ? <TrendingDown size={14} className="text-red-500" /> : null}
                    <span className={`text-lg font-bold ${getScoreColor(client.totalScore)}`}>{client.totalScore}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div className={`h-full rounded-full ${client.totalScore >= 80 ? 'bg-green-500' : client.totalScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${client.totalScore}%` }} />
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRiskBadge(client.risk)}`}>{getRiskLabel(client.risk)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex-1">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 mb-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{selectedClient.name}</h3>
                <p className="text-sm text-gray-500">{selectedClient.type} · Последняя активность: {selectedClient.lastActivity}</p>
              </div>
              <div className={`px-4 py-2 rounded-lg border text-center ${getScoreBg(selectedClient.totalScore)}`}>
                <p className={`text-4xl font-bold ${getScoreColor(selectedClient.totalScore)}`}>{selectedClient.totalScore}</p>
                <p className="text-xs text-gray-500">/ 100</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-3 text-sm">Профиль метрик</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-3 text-sm">Детализация метрик</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Активность', value: selectedClient.metrics.engagement },
                    { label: 'Соблюдение SLA', value: selectedClient.metrics.slaCompliance },
                    { label: 'Платёжность', value: selectedClient.metrics.paymentScore },
                    { label: 'Использование услуг', value: selectedClient.metrics.usageScore },
                    { label: 'Лояльность / NPS', value: selectedClient.metrics.sentimentScore },
                  ].map(m => (
                    <div key={m.label}>
                      <div className="flex justify-between text-sm mb-0.5">
                        <span className="text-gray-600">{m.label}</span>
                        <span className={`font-semibold ${getScoreColor(m.value)}`}>{m.value}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${m.value >= 80 ? 'bg-green-500' : m.value >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${m.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Выручка за год</p>
                  <p className="font-bold text-gray-900">{selectedClient.revenue.toLocaleString('ru-RU')} ₽</p>
                </div>
              </div>
            </div>
          </div>

          {selectedClient.risk === 'high' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">Рекомендации по удержанию клиента</h4>
              <ul className="space-y-1 text-sm text-red-700">
                <li>• Позвонить в течение 24 часов, выяснить причину низкой активности</li>
                <li>• Предложить персональную скидку 15% на следующий ТО</li>
                <li>• Отправить напоминание о плановом обслуживании</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerHealthScore;
