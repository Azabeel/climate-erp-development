import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';

interface Review {
  id: string;
  clientName: string;
  orderId: string;
  engineer: string;
  date: string;
  rating: number;
  comment: string;
  category: 'excellent' | 'good' | 'neutral' | 'bad' | 'critical';
  responded: boolean;
  tags: string[];
}

const REVIEWS: Review[] = [
  { id: 'R001', clientName: 'ООО «ТехноПарк»', orderId: 'WO-2026-000412', engineer: 'Петров А.В.', date: '2026-05-14', rating: 5, comment: 'Отличная работа! Инженер приехал вовремя, всё объяснил, кондиционер работает идеально.', category: 'excellent', responded: false, tags: ['вовремя', 'профессионализм'] },
  { id: 'R002', clientName: 'Иванова М.С.', orderId: 'WO-2026-000410', engineer: 'Сидоров К.Н.', date: '2026-05-14', rating: 4, comment: 'Хорошее обслуживание, но немного задержался. В целом доволен.', category: 'good', responded: true, tags: ['задержка'] },
  { id: 'R003', clientName: 'АО «Климат Сервис»', orderId: 'WO-2026-000408', engineer: 'Козлов Д.А.', date: '2026-05-13', rating: 2, comment: 'Пришлось ждать 3 часа сверх обещанного времени. Никто не предупредил о задержке.', category: 'bad', responded: false, tags: ['задержка', 'связь'] },
  { id: 'R004', clientName: 'ИП Смирнов В.П.', orderId: 'WO-2026-000405', engineer: 'Новиков Р.И.', date: '2026-05-13', rating: 5, comment: 'Превосходно! Уже третий раз заказываю — всегда качественно и в срок.', category: 'excellent', responded: true, tags: ['постоянный клиент', 'качество'] },
  { id: 'R005', clientName: 'ЖК «Северный»', orderId: 'WO-2026-000402', engineer: 'Петров А.В.', date: '2026-05-12', rating: 1, comment: 'Ужасно! Мастер нагрубил, работу не доделал, пришлось вызывать повторно. Требую компенсацию!', category: 'critical', responded: false, tags: ['грубость', 'качество работы', 'повторный визит'] },
  { id: 'R006', clientName: 'Торговый центр «Мега»', orderId: 'WO-2026-000399', engineer: 'Волков С.П.', date: '2026-05-12', rating: 4, comment: 'Всё сделали быстро, документы оформили правильно. Рекомендую.', category: 'good', responded: true, tags: ['документы', 'скорость'] },
  { id: 'R007', clientName: 'Фитнес-центр «Атлет»', orderId: 'WO-2026-000395', engineer: 'Морозов А.К.', date: '2026-05-11', rating: 3, comment: 'Средне. Сделали что нужно, но без энтузиазма.', category: 'neutral', responded: false, tags: [] },
  { id: 'R008', clientName: 'Офис «СтройГрупп»', orderId: 'WO-2026-000390', engineer: 'Сидоров К.Н.', date: '2026-05-11', rating: 5, comment: 'Вышел из строя чиллер в пятницу вечером — приехали в субботу утром, устранили за 2 часа. Спасибо!', category: 'excellent', responded: true, tags: ['срочность', 'выходной день', 'профессионализм'] },
];

const ratingTrend = [
  { month: 'Дек', avg: 4.1 }, { month: 'Янв', avg: 4.3 }, { month: 'Фев', avg: 4.2 },
  { month: 'Мар', avg: 4.5 }, { month: 'Апр', avg: 4.4 }, { month: 'Май', avg: 4.6 },
];

const categoryDist = [
  { name: 'Отлично (5★)', value: 3, color: '#10B981' },
  { name: 'Хорошо (4★)', value: 2, color: '#3B82F6' },
  { name: 'Нейтрально (3★)', value: 1, color: '#F59E0B' },
  { name: 'Плохо (2★)', value: 1, color: '#F97316' },
  { name: 'Критично (1★)', value: 1, color: '#EF4444' },
];

const engineerRatings = [
  { name: 'Новиков Р.И.', avg: 4.9, count: 28, subject: 'Новиков' },
  { name: 'Волков С.П.', avg: 4.7, count: 34, subject: 'Волков' },
  { name: 'Сидоров К.Н.', avg: 4.5, count: 41, subject: 'Сидоров' },
  { name: 'Морозов А.К.', avg: 4.2, count: 29, subject: 'Морозов' },
  { name: 'Козлов Д.А.', avg: 3.8, count: 22, subject: 'Козлов' },
  { name: 'Петров А.В.', avg: 3.5, count: 38, subject: 'Петров' },
];

const radarData = [
  { subject: 'Вежливость', value: 4.6 },
  { subject: 'Пунктуальность', value: 4.1 },
  { subject: 'Качество', value: 4.5 },
  { subject: 'Скорость', value: 4.3 },
  { subject: 'Коммуникация', value: 4.0 },
  { subject: 'Чистота', value: 4.7 },
];

const categoryColors: Record<string, string> = {
  excellent: 'bg-green-100 text-green-700 border-green-200',
  good: 'bg-blue-100 text-blue-700 border-blue-200',
  neutral: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  bad: 'bg-orange-100 text-orange-700 border-orange-200',
  critical: 'bg-red-100 text-red-700 border-red-200',
};

const categoryLabels: Record<string, string> = {
  excellent: 'Отлично', good: 'Хорошо', neutral: 'Нейтрально', bad: 'Плохо', critical: 'Критично',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} className={`w-4 h-4 ${s <= rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

const ClientFeedback = () => {
  const [filter, setFilter] = useState<'all' | 'unresponded' | 'critical'>('all');
  const [selected, setSelected] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');

  const filtered = REVIEWS.filter(r => {
    if (filter === 'unresponded') return !r.responded;
    if (filter === 'critical') return r.category === 'critical' || r.category === 'bad';
    return true;
  });

  const avgRating = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1);
  const unrespondedCount = REVIEWS.filter(r => !r.responded).length;
  const criticalCount = REVIEWS.filter(r => r.category === 'critical').length;
  const nps = Math.round(((REVIEWS.filter(r => r.rating >= 4).length - REVIEWS.filter(r => r.rating <= 2).length) / REVIEWS.length) * 100);

  return (
    <div className="p-6 space-y-6">
      {/* Метрики */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Средний рейтинг', value: avgRating, icon: 'Star', color: 'text-yellow-500', bg: 'bg-yellow-50', sub: 'из 5.0' },
          { label: 'NPS индекс', value: `+${nps}`, icon: 'TrendingUp', color: 'text-green-600', bg: 'bg-green-50', sub: 'рекомендуют' },
          { label: 'Без ответа', value: unrespondedCount, icon: 'MessageSquare', color: 'text-orange-600', bg: 'bg-orange-50', sub: 'требуют ответа' },
          { label: 'Критичных', value: criticalCount, icon: 'AlertTriangle', color: 'text-red-600', bg: 'bg-red-50', sub: 'нужна реакция' },
        ].map(m => (
          <div key={m.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${m.bg} flex items-center justify-center`}>
                <Icon name={m.icon} size={20} className={m.color} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{m.label}</p>
                <p className="text-2xl font-bold text-gray-900">{m.value}</p>
                <p className="text-xs text-gray-400">{m.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Тренд рейтинга */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Динамика рейтинга</h3>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={ratingTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis domain={[3, 5]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [v.toFixed(1), 'Рейтинг']} />
              <Line type="monotone" dataKey="avg" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Распределение */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Распределение оценок</h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={categoryDist} dataKey="value" cx="50%" cy="50%" outerRadius={55} label={({ name, value }) => `${value}`}>
                {categoryDist.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip formatter={(v, name) => [v, name]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Радар качества */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Профиль качества</h3>
          <ResponsiveContainer width="100%" height={140}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <Radar dataKey="value" stroke="#6366F1" fill="#6366F1" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Рейтинг инженеров */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Рейтинг инженеров</h3>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={engineerRatings} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="subject" tick={{ fontSize: 11 }} width={70} />
            <Tooltip formatter={(v: number) => [v.toFixed(1), 'Рейтинг']} />
            <Bar dataKey="avg" fill="#3B82F6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Список отзывов */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Отзывы клиентов</h3>
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'Все' },
              { id: 'unresponded', label: `Без ответа (${unrespondedCount})` },
              { id: 'critical', label: `Критичные (${criticalCount})` },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as typeof filter)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${filter === f.id ? 'bg-blue-50 text-blue-700 border-blue-200' : 'text-gray-500 border-gray-200 hover:bg-gray-50'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {filtered.map(review => (
            <div
              key={review.id}
              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${selected?.id === review.id ? 'bg-blue-50' : ''}`}
              onClick={() => { setSelected(review); setReplyText(''); }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-medium text-gray-900">{review.clientName}</span>
                    <span className="text-xs text-gray-400">#{review.orderId}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-500">{review.engineer}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryColors[review.category]}`}>
                      {categoryLabels[review.category]}
                    </span>
                    {!review.responded && (
                      <span className="text-xs px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-full">
                        Без ответа
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-gray-400">{review.date}</span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{review.comment}</p>
                  {review.tags.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {review.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <Icon name="ChevronRight" size={16} className="text-gray-300 flex-shrink-0 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Панель ответа */}
      {selected && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Ответить на отзыв — {selected.clientName}</h3>
            <button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 rounded">
              <Icon name="X" size={16} className="text-gray-400" />
            </button>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3 text-sm text-gray-700 italic">
            «{selected.comment}»
          </div>
          <textarea
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder="Введите ответ клиенту..."
            className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={() => setSelected(null)}>Отмена</Button>
            <Button size="sm" disabled={!replyText.trim()}>
              <Icon name="Send" size={14} className="mr-1.5" />
              Отправить ответ
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientFeedback;
