import { useState, useEffect } from 'react';
import { MapPin, Phone, Star, CheckCircle, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const STAGES = [
  { id: 1, label: 'Заявка принята', icon: CheckCircle, done: true },
  { id: 2, label: 'Инженер назначен', icon: CheckCircle, done: true },
  { id: 3, label: 'Инженер выехал', icon: Navigation, done: true },
  { id: 4, label: 'Инженер прибыл', icon: MapPin, done: false },
  { id: 5, label: 'Работы выполнены', icon: CheckCircle, done: false },
];

const CustomerTracking = () => {
  const [eta, setEta] = useState(18);
  const [rating, setRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setEta(prev => Math.max(0, prev - 1));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRating = (r: number) => {
    setRating(r);
    setTimeout(() => {
      setRatingSubmitted(true);
      toast.success('Спасибо за вашу оценку!');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">СК</span>
          </div>
          <span className="font-semibold text-gray-900">Сервис Климат</span>
        </div>
        <span className="text-xs text-gray-500">Заявка №WO-2026-000045</span>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* ETA card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white mb-6 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Navigation size={18} className="opacity-80" />
            <span className="opacity-80 text-sm">Инженер в пути</span>
          </div>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-5xl font-bold">~{eta}</span>
            <span className="text-xl opacity-80 mb-1">мин</span>
          </div>
          <div className="flex items-center gap-2 opacity-80 text-sm">
            <MapPin size={14} />
            <span>Адрес: ул. Ленина, 12, кв. 34</span>
          </div>
        </div>

        {/* Technician card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-700 font-bold text-lg">КМ</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Козлов Михаил Иванович</h3>
              <p className="text-sm text-gray-500">Инженер-монтажник · Стаж 7 лет</p>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={12} className={i <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                ))}
                <span className="text-xs text-gray-500 ml-1">4.9 (127 отзывов)</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => toast.info('Звонок: +7 900 123-45-67')}>
              <Phone size={14} className="mr-2" /> Позвонить
            </Button>
            <Button variant="outline" className="flex-1">
              Написать
            </Button>
          </div>
        </div>

        {/* Progress tracker */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Статус заявки</h3>
          <div className="space-y-3">
            {STAGES.map((stage, index) => (
              <div key={stage.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${stage.done ? 'bg-green-500' : index === STAGES.findIndex(s => !s.done) ? 'bg-blue-500 animate-pulse' : 'bg-gray-100'}`}>
                  <stage.icon size={14} className={stage.done ? 'text-white' : index === STAGES.findIndex(s => !s.done) ? 'text-white' : 'text-gray-400'} />
                </div>
                {index < STAGES.length - 1 && (
                  <div className="absolute left-[27px] mt-8 w-0.5 h-4 bg-gray-200" />
                )}
                <div>
                  <p className={`text-sm font-medium ${stage.done ? 'text-gray-900' : index === STAGES.findIndex(s => !s.done) ? 'text-blue-600' : 'text-gray-400'}`}>
                    {stage.label}
                  </p>
                  {stage.done && <p className="text-xs text-gray-500">
                    {stage.id === 1 ? '09:45' : stage.id === 2 ? '10:12' : '10:30'}
                  </p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order details */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Детали заявки</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Тип услуги</span>
              <span className="font-medium text-gray-900">Техническое обслуживание</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Оборудование</span>
              <span className="font-medium text-gray-900">Daikin FTXB35C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Плановое время</span>
              <span className="font-medium text-gray-900">~1.5 часа</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Стоимость ТО</span>
              <span className="font-medium text-gray-900">8 500 ₽</span>
            </div>
          </div>
        </div>

        {/* Rating (shows after work complete) */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-1">Оцените качество работы</h3>
          <p className="text-sm text-gray-500 mb-4">Ваш отзыв помогает нам стать лучше</p>
          {ratingSubmitted ? (
            <div className="text-center py-4">
              <CheckCircle size={40} className="text-green-500 mx-auto mb-2" />
              <p className="font-medium text-gray-900">Спасибо за оценку!</p>
              <p className="text-sm text-gray-500">Ваш отзыв принят</p>
            </div>
          ) : (
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(r => (
                <button
                  key={r}
                  onClick={() => handleRating(r)}
                  onMouseEnter={() => setHoverRating(r)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={36}
                    className={r <= (hoverRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerTracking;
