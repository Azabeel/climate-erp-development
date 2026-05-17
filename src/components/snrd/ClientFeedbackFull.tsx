import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

type ReviewCategory = 'Качество работы' | 'Скорость' | 'Коммуникация' | 'Цена' | 'Общее';
type ReviewSource = 'Система' | 'Яндекс' | 'Google' | 'Avito';

interface ClientHistory {
  orderId: string;
  date: string;
  description: string;
  engineer: string;
  rating: number;
}

interface Review {
  id: string;
  clientName: string;
  company: string;
  initials: string;
  avatarColor: string;
  date: string;
  rating: number;
  text: string;
  engineer: string;
  category: ReviewCategory;
  source: ReviewSource;
  responded: boolean;
  replyText?: string;
  history: ClientHistory[];
  phone: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const REVIEWS: Review[] = [
  {
    id: 'R001', clientName: 'Алексей Новиков', company: 'ООО «ТехноПарк»',
    initials: 'АН', avatarColor: 'bg-blue-500', date: '16.05.2026', rating: 5,
    text: 'Отличная работа! Инженер Петров приехал точно в назначенное время, всё объяснил доступно, провёл диагностику, кондиционер работает как новый. Спасибо огромное!',
    engineer: 'Петров А.В.', category: 'Качество работы', source: 'Система', responded: true, phone: '+7 (910) 123-45-67',
    history: [
      { orderId: 'WO-2026-000412', date: '15.05.2026', description: 'Плановое ТО сплит-системы Daikin', engineer: 'Петров А.В.', rating: 5 },
      { orderId: 'WO-2025-000891', date: '10.11.2025', description: 'Устранение утечки хладагента R-410A', engineer: 'Волков С.П.', rating: 4 },
      { orderId: 'WO-2025-000512', date: '03.07.2025', description: 'Установка кондиционера LG', engineer: 'Петров А.В.', rating: 5 },
    ],
  },
  {
    id: 'R002', clientName: 'Мария Иванова', company: 'Частное лицо',
    initials: 'МИ', avatarColor: 'bg-purple-500', date: '16.05.2026', rating: 4,
    text: 'Хорошее обслуживание, инженер вежливый, работу выполнил качественно. Немного задержался, но позвонил и предупредил заранее. В целом осталась довольна.',
    engineer: 'Сидоров К.Н.', category: 'Скорость', source: 'Яндекс', responded: false, phone: '+7 (916) 234-56-78',
    history: [
      { orderId: 'WO-2026-000410', date: '15.05.2026', description: 'Чистка и обслуживание сплит-системы', engineer: 'Сидоров К.Н.', rating: 4 },
      { orderId: 'WO-2025-000722', date: '22.09.2025', description: 'Ремонт блока управления', engineer: 'Козлов Д.А.', rating: 3 },
    ],
  },
  {
    id: 'R003', clientName: 'Дмитрий Кравцов', company: 'АО «Климат Сервис»',
    initials: 'ДК', avatarColor: 'bg-red-500', date: '15.05.2026', rating: 2,
    text: 'Пришлось ждать 3 часа сверх обещанного времени. Никто не предупредил о задержке, пришлось звонить самим. Работу в итоге сделали, но осадок остался неприятный.',
    engineer: 'Козлов Д.А.', category: 'Коммуникация', source: 'Google', responded: false, phone: '+7 (903) 345-67-89',
    history: [
      { orderId: 'WO-2026-000408', date: '14.05.2026', description: 'Ремонт фанкойла Carrier', engineer: 'Козлов Д.А.', rating: 2 },
      { orderId: 'WO-2025-000601', date: '01.08.2025', description: 'Замена компрессора', engineer: 'Волков С.П.', rating: 4 },
    ],
  },
  {
    id: 'R004', clientName: 'Виктор Смирнов', company: 'ИП Смирнов В.П.',
    initials: 'ВС', avatarColor: 'bg-green-500', date: '15.05.2026', rating: 5,
    text: 'Превосходно! Уже третий раз заказываю услуги — всегда качественно и строго в срок. Новиков настоящий профессионал, знает своё дело. Буду обращаться ещё!',
    engineer: 'Новиков Р.И.', category: 'Качество работы', source: 'Система', responded: true, phone: '+7 (926) 456-78-90',
    history: [
      { orderId: 'WO-2026-000405', date: '14.05.2026', description: 'Плановое ТО промышленного кондиционера', engineer: 'Новиков Р.И.', rating: 5 },
      { orderId: 'WO-2025-000944', date: '18.12.2025', description: 'Заправка хладагента', engineer: 'Новиков Р.И.', rating: 5 },
      { orderId: 'WO-2025-000488', date: '15.06.2025', description: 'Установка вентиляции', engineer: 'Петров А.В.', rating: 5 },
    ],
  },
  {
    id: 'R005', clientName: 'Ольга Петрова', company: 'ЖК «Северный», кв. 47',
    initials: 'ОП', avatarColor: 'bg-red-600', date: '14.05.2026', rating: 1,
    text: 'Ужасное обслуживание! Мастер нагрубил, работу не доделал до конца, пришлось вызывать повторно. Потеряли целый рабочий день. Требую объяснений и компенсации!',
    engineer: 'Петров А.В.', category: 'Общее', source: 'Avito', responded: false, phone: '+7 (985) 567-89-01',
    history: [
      { orderId: 'WO-2026-000402', date: '13.05.2026', description: 'Ремонт настенного кондиционера Samsung', engineer: 'Петров А.В.', rating: 1 },
    ],
  },
  {
    id: 'R006', clientName: 'Сергей Волков', company: 'ТЦ «Мега», арендатор',
    initials: 'СВ', avatarColor: 'bg-teal-500', date: '14.05.2026', rating: 4,
    text: 'Всё сделали быстро и аккуратно, документы оформили правильно. Территорию после себя убрали. Рекомендую данную компанию.',
    engineer: 'Волков С.П.', category: 'Скорость', source: 'Система', responded: true, phone: '+7 (915) 678-90-12',
    history: [
      { orderId: 'WO-2026-000399', date: '13.05.2026', description: 'Обслуживание системы вентиляции торгового зала', engineer: 'Волков С.П.', rating: 4 },
      { orderId: 'WO-2025-000833', date: '05.10.2025', description: 'Ремонт приточной установки', engineer: 'Морозов А.К.', rating: 4 },
    ],
  },
  {
    id: 'R007', clientName: 'Андрей Козлов', company: 'Фитнес-центр «Атлет»',
    initials: 'АК', avatarColor: 'bg-orange-500', date: '13.05.2026', rating: 3,
    text: 'Среднее обслуживание. Сделали что нужно, но без особого энтузиазма. Клиентоориентированности явно не хватает — на вопросы отвечали нехотя.',
    engineer: 'Морозов А.К.', category: 'Коммуникация', source: 'Google', responded: false, phone: '+7 (962) 789-01-23',
    history: [
      { orderId: 'WO-2026-000395', date: '12.05.2026', description: 'Техническое обслуживание 4 сплит-систем', engineer: 'Морозов А.К.', rating: 3 },
    ],
  },
  {
    id: 'R008', clientName: 'Елена Сорокина', company: 'Офис «СтройГрупп»',
    initials: 'ЕС', avatarColor: 'bg-indigo-500', date: '13.05.2026', rating: 5,
    text: 'Вышел из строя чиллер в пятницу вечером — приехали в субботу утром, устранили неисправность за 2 часа. Настоящий аварийный выезд. Огромное спасибо команде!',
    engineer: 'Сидоров К.Н.', category: 'Скорость', source: 'Система', responded: true, phone: '+7 (977) 890-12-34',
    history: [
      { orderId: 'WO-2026-000390', date: '11.05.2026', description: 'Аварийный ремонт чиллера Trane', engineer: 'Сидоров К.Н.', rating: 5 },
      { orderId: 'WO-2025-000677', date: '14.08.2025', description: 'Плановое ТО чиллера', engineer: 'Сидоров К.Н.', rating: 5 },
    ],
  },
  {
    id: 'R009', clientName: 'Павел Нечаев', company: 'Ресторан «Уют»',
    initials: 'ПН', avatarColor: 'bg-pink-500', date: '12.05.2026', rating: 5,
    text: 'Великолепно! Работают чётко и профессионально. Объяснили в чём была проблема и как её предотвратить в будущем. Очень доволен соотношением цена/качество.',
    engineer: 'Новиков Р.И.', category: 'Цена', source: 'Яндекс', responded: true, phone: '+7 (903) 901-23-45',
    history: [
      { orderId: 'WO-2026-000385', date: '11.05.2026', description: 'Ремонт мультисплит-системы Mitsubishi', engineer: 'Новиков Р.И.', rating: 5 },
      { orderId: 'WO-2025-000812', date: '28.09.2025', description: 'Заправка и диагностика', engineer: 'Волков С.П.', rating: 4 },
    ],
  },
  {
    id: 'R010', clientName: 'Ирина Белова', company: 'Медицинский центр «Здоровье»',
    initials: 'ИБ', avatarColor: 'bg-cyan-600', date: '12.05.2026', rating: 4,
    text: 'Хорошая работа. Инженер провёл полную диагностику, выявил скрытую проблему. Немного дорого вышло, но качество того стоит.',
    engineer: 'Волков С.П.', category: 'Цена', source: 'Google', responded: false, phone: '+7 (916) 012-34-56',
    history: [
      { orderId: 'WO-2026-000381', date: '11.05.2026', description: 'Диагностика и ремонт прецизионного кондиционера', engineer: 'Волков С.П.', rating: 4 },
      { orderId: 'WO-2025-000745', date: '15.09.2025', description: 'Плановое ТО', engineer: 'Новиков Р.И.', rating: 5 },
    ],
  },
  {
    id: 'R011', clientName: 'Тимур Касимов', company: 'Склад логистической компании',
    initials: 'ТК', avatarColor: 'bg-yellow-600', date: '11.05.2026', rating: 2,
    text: 'Некачественная работа. После ремонта кондиционер работал только 3 дня, затем снова сломался. Пришлось оплачивать повторный выезд. Это неприемлемо.',
    engineer: 'Козлов Д.А.', category: 'Качество работы', source: 'Avito', responded: false, phone: '+7 (925) 123-45-67',
    history: [
      { orderId: 'WO-2026-000377', date: '10.05.2026', description: 'Ремонт промышленного кондиционера Haier', engineer: 'Козлов Д.А.', rating: 2 },
    ],
  },
  {
    id: 'R012', clientName: 'Наталья Громова', company: 'Детский сад «Солнышко»',
    initials: 'НГ', avatarColor: 'bg-lime-600', date: '11.05.2026', rating: 5,
    text: 'Очень благодарна! Инженеры работали аккуратно, не мешали детям. Установили защитные экраны, всё объяснили персоналу. Настоящие профессионалы!',
    engineer: 'Новиков Р.И.', category: 'Качество работы', source: 'Система', responded: true, phone: '+7 (910) 234-56-78',
    history: [
      { orderId: 'WO-2026-000372', date: '10.05.2026', description: 'Установка 3 сплит-систем Daikin с инсталляцией', engineer: 'Новиков Р.И.', rating: 5 },
      { orderId: 'WO-2025-000590', date: '01.07.2025', description: 'Сезонное ТО оборудования', engineer: 'Петров А.В.', rating: 4 },
    ],
  },
  {
    id: 'R013', clientName: 'Геннадий Фролов', company: 'Автосалон «АвтоПрестиж»',
    initials: 'ГФ', avatarColor: 'bg-slate-500', date: '10.05.2026', rating: 4,
    text: 'В целом доволен. Приехали вовремя, сделали быстро. Единственное замечание — немного шумновато работали инструментами в рабочее время салона.',
    engineer: 'Морозов А.К.', category: 'Общее', source: 'Яндекс', responded: false, phone: '+7 (926) 345-67-89',
    history: [
      { orderId: 'WO-2026-000368', date: '09.05.2026', description: 'Техническое обслуживание системы вентиляции', engineer: 'Морозов А.К.', rating: 4 },
    ],
  },
  {
    id: 'R014', clientName: 'Светлана Орлова', company: 'Бизнес-центр «Горизонт»',
    initials: 'СО', avatarColor: 'bg-violet-500', date: '10.05.2026', rating: 5,
    text: 'Долгосрочное сотрудничество — всегда на высоте. Любые вопросы решаются оперативно. Наш любимый подрядчик по климатическому оборудованию!',
    engineer: 'Волков С.П.', category: 'Общее', source: 'Система', responded: true, phone: '+7 (903) 456-78-90',
    history: [
      { orderId: 'WO-2026-000364', date: '09.05.2026', description: 'Квартальное ТО систем кондиционирования', engineer: 'Волков С.П.', rating: 5 },
      { orderId: 'WO-2026-000200', date: '10.02.2026', description: 'Замена фильтров и чистка дренажа', engineer: 'Новиков Р.И.', rating: 5 },
      { orderId: 'WO-2025-000900', date: '15.11.2025', description: 'Ремонт VRF-системы Mitsubishi', engineer: 'Волков С.П.', rating: 5 },
    ],
  },
  {
    id: 'R015', clientName: 'Роман Куликов', company: 'Кафе «Чашка»',
    initials: 'РК', avatarColor: 'bg-emerald-600', date: '09.05.2026', rating: 3,
    text: 'Нормально, без особых восторгов и претензий. Сделали работу, взяли оплату, ушли. Хотелось бы больше внимания к клиенту и его вопросам.',
    engineer: 'Козлов Д.А.', category: 'Коммуникация', source: 'Avito', responded: false, phone: '+7 (985) 567-89-01',
    history: [
      { orderId: 'WO-2026-000360', date: '08.05.2026', description: 'Ремонт и чистка кассетного кондиционера', engineer: 'Козлов Д.А.', rating: 3 },
    ],
  },
  {
    id: 'R016', clientName: 'Анастасия Макарова', company: 'Салон красоты «Элеганс»',
    initials: 'АМ', avatarColor: 'bg-rose-500', date: '09.05.2026', rating: 5,
    text: 'Просто супер! Установили кондиционер быстро и чисто, не нарушив работу салона. Клиенты даже не заметили. Очень профессиональная команда!',
    engineer: 'Сидоров К.Н.', category: 'Скорость', source: 'Google', responded: true, phone: '+7 (915) 678-90-12',
    history: [
      { orderId: 'WO-2026-000356', date: '08.05.2026', description: 'Установка сплит-системы Panasonic', engineer: 'Сидоров К.Н.', rating: 5 },
    ],
  },
  {
    id: 'R017', clientName: 'Максим Зайцев', company: 'IT-компания «КодПро»',
    initials: 'МЗ', avatarColor: 'bg-sky-600', date: '08.05.2026', rating: 4,
    text: 'Хорошая работа, всё в срок. Инженер разобрался в нестандартной ситуации — серверная комната с особыми требованиями. Цена чуть выше рынка, но качество оправдывает.',
    engineer: 'Новиков Р.И.', category: 'Цена', source: 'Система', responded: true, phone: '+7 (962) 789-01-23',
    history: [
      { orderId: 'WO-2026-000351', date: '07.05.2026', description: 'Обслуживание прецизионного кондиционера в серверной', engineer: 'Новиков Р.И.', rating: 4 },
      { orderId: 'WO-2025-000855', date: '12.10.2025', description: 'Установка дополнительного охлаждения', engineer: 'Новиков Р.И.', rating: 5 },
    ],
  },
  {
    id: 'R018', clientName: 'Татьяна Лебедева', company: 'Поликлиника №7',
    initials: 'ТЛ', avatarColor: 'bg-amber-600', date: '08.05.2026', rating: 5,
    text: 'Превосходный сервис! Реагируют быстро, работают профессионально. Особо ценю, что понимают специфику медицинских учреждений. Рекомендуем всем коллегам!',
    engineer: 'Волков С.П.', category: 'Качество работы', source: 'Яндекс', responded: true, phone: '+7 (977) 890-12-34',
    history: [
      { orderId: 'WO-2026-000347', date: '07.05.2026', description: 'ТО и дезинфекция систем вентиляции', engineer: 'Волков С.П.', rating: 5 },
      { orderId: 'WO-2025-000778', date: '25.09.2025', description: 'Замена фильтров высокой очистки', engineer: 'Петров А.В.', rating: 5 },
    ],
  },
  {
    id: 'R019', clientName: 'Илья Соколов', company: 'Частное лицо',
    initials: 'ИС', avatarColor: 'bg-fuchsia-600', date: '07.05.2026', rating: 4,
    text: 'Хорошо. Кондиционер починили, гарантию дали. Мастер объяснил причину поломки и дал советы по уходу. Немного долго пришлось ждать запчасть — 5 дней.',
    engineer: 'Морозов А.К.', category: 'Скорость', source: 'Google', responded: false, phone: '+7 (903) 901-23-45',
    history: [
      { orderId: 'WO-2026-000342', date: '05.05.2026', description: 'Ремонт настенного кондиционера Mitsubishi', engineer: 'Морозов А.К.', rating: 4 },
    ],
  },
  {
    id: 'R020', clientName: 'Валерия Чернова', company: 'Офис «РосТехно»',
    initials: 'ВЧ', avatarColor: 'bg-teal-600', date: '07.05.2026', rating: 5,
    text: 'Отличная компания! Работают с нами уже 2 года, всегда довольны. Вежливые мастера, чёткое время приезда, качественная работа. 5 звёзд без сомнений!',
    engineer: 'Петров А.В.', category: 'Общее', source: 'Система', responded: true, phone: '+7 (916) 012-34-56',
    history: [
      { orderId: 'WO-2026-000338', date: '06.05.2026', description: 'Сезонный осмотр и обслуживание 6 сплит-систем', engineer: 'Петров А.В.', rating: 5 },
      { orderId: 'WO-2025-000920', date: '05.11.2025', description: 'Замена компрессора', engineer: 'Новиков Р.И.', rating: 5 },
      { orderId: 'WO-2025-000540', date: '20.06.2025', description: 'Плановое ТО', engineer: 'Волков С.П.', rating: 4 },
    ],
  },
];

const NPS_DATA = [
  { month: 'Июн', nps: 68 }, { month: 'Июл', nps: 71 }, { month: 'Авг', nps: 69 },
  { month: 'Сен', nps: 73 }, { month: 'Окт', nps: 74 }, { month: 'Ноя', nps: 72 },
  { month: 'Дек', nps: 76 }, { month: 'Янв', nps: 74 }, { month: 'Фев', nps: 77 },
  { month: 'Мар', nps: 79 }, { month: 'Апр', nps: 80 }, { month: 'Май', nps: 78 },
];

const RATING_DIST = [
  { stars: '1★', count: 2, fill: '#EF4444' },
  { stars: '2★', count: 3, fill: '#F97316' },
  { stars: '3★', count: 5, fill: '#F59E0B' },
  { stars: '4★', count: 27, fill: '#3B82F6' },
  { stars: '5★', count: 50, fill: '#10B981' },
];

const ATTENTION_IDS = ['R005', 'R003', 'R011'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} className={`${cls} ${s <= rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

const CATEGORY_COLORS: Record<ReviewCategory, string> = {
  'Качество работы': 'bg-blue-50 text-blue-700 border-blue-200',
  'Скорость': 'bg-green-50 text-green-700 border-green-200',
  'Коммуникация': 'bg-purple-50 text-purple-700 border-purple-200',
  'Цена': 'bg-amber-50 text-amber-700 border-amber-200',
  'Общее': 'bg-gray-100 text-gray-700 border-gray-200',
};

const SOURCE_ICONS: Record<ReviewSource, string> = {
  'Система': 'Monitor', 'Яндекс': 'Globe', 'Google': 'Globe', 'Avito': 'ShoppingBag',
};

// ─── Component ───────────────────────────────────────────────────────────────

const ClientFeedbackFull = () => {
  const [search, setSearch] = useState('');
  const [filterRating, setFilterRating] = useState<'all' | '1-2' | '3' | '4-5'>('all');
  const [filterSource, setFilterSource] = useState<'all' | ReviewSource>('all');
  const [filterResponded, setFilterResponded] = useState<'all' | 'no' | 'yes'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyOpenId, setReplyOpenId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const selectedReview = useMemo(
    () => REVIEWS.find(r => r.id === selectedId) ?? null,
    [selectedId]
  );

  const filtered = useMemo(() => {
    return REVIEWS.filter(r => {
      const matchSearch = search === '' ||
        r.clientName.toLowerCase().includes(search.toLowerCase()) ||
        r.company.toLowerCase().includes(search.toLowerCase()) ||
        r.text.toLowerCase().includes(search.toLowerCase()) ||
        r.engineer.toLowerCase().includes(search.toLowerCase());
      const matchRating =
        filterRating === 'all' ? true :
        filterRating === '1-2' ? r.rating <= 2 :
        filterRating === '3' ? r.rating === 3 :
        r.rating >= 4;
      const matchSource = filterSource === 'all' || r.source === filterSource;
      const matchResponded =
        filterResponded === 'all' ? true :
        filterResponded === 'no' ? !r.responded : r.responded;
      return matchSearch && matchRating && matchSource && matchResponded;
    });
  }, [search, filterRating, filterSource, filterResponded]);

  const attentionReviews = REVIEWS.filter(r => ATTENTION_IDS.includes(r.id));

  const handleReply = (_id: string) => {
    if (!replyText.trim()) return;
    toast.success('Ответ отправлен клиенту');
    setReplyOpenId(null);
    setReplyText('');
  };

  const handleCreateTask = (review: Review) => {
    toast.success(`Задача создана по отзыву от ${review.clientName}`);
  };

  const handleCall = (review: Review) => {
    toast.success(`Звонок клиенту ${review.clientName} (${review.phone})`);
  };

  const handleAddToTraining = (_review: Review) => {
    toast.success('Отзыв добавлен в базу обучения');
  };

  const toggleReply = (id: string) => {
    if (replyOpenId === id) {
      setReplyOpenId(null);
      setReplyText('');
    } else {
      setReplyOpenId(id);
      setReplyText('');
    }
  };

  return (
    <div className="flex h-full bg-gray-50 overflow-hidden">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* ── Метрики ── */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Средняя оценка', value: '4.7 ⭐', sub: 'из 5.0 звёзд', icon: 'Star', bg: 'bg-yellow-50', color: 'text-yellow-600' },
            { label: 'Отзывов за месяц', value: '87', sub: '+12 к прошлому', icon: 'MessageSquare', bg: 'bg-blue-50', color: 'text-blue-600' },
            { label: 'NPS', value: '78', sub: 'промоутеры − детракторы', icon: 'TrendingUp', bg: 'bg-green-50', color: 'text-green-600' },
            { label: 'Ответили на', value: '94%', sub: '3 без ответа', icon: 'CheckCircle', bg: 'bg-purple-50', color: 'text-purple-600' },
          ].map(m => (
            <div key={m.label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl ${m.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon name={m.icon} size={20} className={m.color} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">{m.label}</p>
                <p className="text-xl font-bold text-gray-900 leading-tight">{m.value}</p>
                <p className="text-xs text-gray-400">{m.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Графики ── */}
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3 bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Динамика NPS (12 месяцев)</h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={NPS_DATA} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[60, 85]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [v, 'NPS']} />
                <Line type="monotone" dataKey="nps" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 3, fill: '#6366F1' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Распределение оценок</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={RATING_DIST} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="stars" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [v, 'Отзывов']} />
                {RATING_DIST.map((entry) => (
                  <Bar key={entry.stars} dataKey="count" fill={entry.fill} radius={[3, 3, 0, 0]} />
                ))}
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {RATING_DIST.map((entry, idx) => (
                    <rect key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Требуют внимания ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Icon name="AlertTriangle" size={16} className="text-red-500" />
            <h3 className="text-sm font-semibold text-gray-900">Требуют внимания</h3>
            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">{attentionReviews.length}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {attentionReviews.map(r => (
              <div
                key={r.id}
                className="bg-white border-2 border-red-300 rounded-xl p-4 cursor-pointer hover:border-red-400 transition-colors"
                onClick={() => setSelectedId(r.id)}
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className={`w-9 h-9 rounded-full ${r.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {r.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{r.clientName}</p>
                    <p className="text-xs text-gray-500 truncate">{r.company}</p>
                  </div>
                  <StarRating rating={r.rating} />
                </div>
                <p className="text-xs text-gray-600 line-clamp-2 mb-2">{r.text}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{r.date}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-6 px-2 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={(e) => { e.stopPropagation(); handleCreateTask(r); }}
                  >
                    <Icon name="Plus" size={12} className="mr-1" />
                    Задача
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Фильтры ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-48">
              <Input
                placeholder="Поиск по клиенту, тексту, инженеру..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="flex gap-1.5 items-center">
              <span className="text-xs text-gray-500 mr-1">Оценка:</span>
              {(['all', '1-2', '3', '4-5'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setFilterRating(v)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${filterRating === v ? 'bg-blue-50 text-blue-700 border-blue-300' : 'text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                >
                  {v === 'all' ? 'Все' : v === '1-2' ? '1-2 ★' : v === '3' ? '3 ★' : '4-5 ★'}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5 items-center">
              <span className="text-xs text-gray-500 mr-1">Источник:</span>
              {(['all', 'Система', 'Яндекс', 'Google', 'Avito'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setFilterSource(v)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${filterSource === v ? 'bg-blue-50 text-blue-700 border-blue-300' : 'text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                >
                  {v === 'all' ? 'Все' : v}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5 items-center">
              <span className="text-xs text-gray-500 mr-1">Ответ:</span>
              {([
                { id: 'all', label: 'Все' },
                { id: 'no', label: 'Без ответа' },
                { id: 'yes', label: 'Отвечено' },
              ] as const).map(v => (
                <button
                  key={v.id}
                  onClick={() => setFilterResponded(v.id)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${filterResponded === v.id ? 'bg-blue-50 text-blue-700 border-blue-300' : 'text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Список отзывов ── */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">Отзывы клиентов</h3>
              <span className="text-xs text-gray-400">{filtered.length} из {REVIEWS.length}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => toast.success('Экспорт начат')}>
              <Icon name="Download" size={14} className="mr-1.5" />
              Экспорт
            </Button>
          </div>

          <div className="divide-y divide-gray-50">
            {filtered.map(review => (
              <div key={review.id}>
                <div
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${selectedId === review.id ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelectedId(selectedId === review.id ? null : review.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full ${review.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {review.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-medium text-gray-900">{review.clientName}</span>
                        <span className="text-xs text-gray-500">{review.company}</span>
                        <span className="text-gray-300">·</span>
                        <Icon name={SOURCE_ICONS[review.source]} size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-400">{review.source}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-xs text-gray-400">{review.date}</span>
                      </div>
                      <div className="flex items-center gap-3 mb-1.5">
                        <StarRating rating={review.rating} />
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[review.category]}`}>
                          {review.category}
                        </span>
                        <span className="text-xs text-gray-500">Инженер: {review.engineer}</span>
                        {!review.responded && (
                          <Badge variant="outline" className="text-xs text-orange-600 border-orange-300 bg-orange-50">
                            Без ответа
                          </Badge>
                        )}
                        {review.responded && (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-300 bg-green-50">
                            Отвечено
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">{review.text}</p>
                    </div>
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={(e) => { e.stopPropagation(); toggleReply(review.id); }}
                      >
                        <Icon name="Reply" size={12} className="mr-1" />
                        Ответить
                      </Button>
                      {review.rating <= 3 && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 border-red-200 text-red-600 hover:bg-red-50"
                          onClick={(e) => { e.stopPropagation(); handleCreateTask(review); }}
                        >
                          <Icon name="AlertCircle" size={12} className="mr-1" />
                          Задача
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Форма ответа */}
                {replyOpenId === review.id && (
                  <div className="px-4 pb-4 bg-blue-50 border-t border-blue-100" onClick={e => e.stopPropagation()}>
                    <div className="pt-3">
                      <p className="text-xs text-gray-500 mb-2">Ответ на отзыв от {review.clientName}:</p>
                      <textarea
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Введите ответ клиенту..."
                        className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setReplyOpenId(null); setReplyText(''); }}
                        >
                          Отмена
                        </Button>
                        <Button
                          size="sm"
                          disabled={!replyText.trim()}
                          onClick={() => handleReply(review.id)}
                        >
                          <Icon name="Send" size={13} className="mr-1.5" />
                          Отправить ответ
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="py-12 text-center text-gray-400">
                <Icon name="SearchX" size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">Отзывы не найдены</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Детальная панель ── */}
      {selectedReview && (
        <div className="w-[350px] flex-shrink-0 border-l border-gray-200 bg-white overflow-y-auto">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
            <h3 className="text-sm font-semibold text-gray-900">Детали отзыва</h3>
            <button
              onClick={() => setSelectedId(null)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icon name="X" size={15} className="text-gray-400" />
            </button>
          </div>

          <div className="p-4 space-y-5">
            {/* Клиент */}
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full ${selectedReview.avatarColor} flex items-center justify-center text-white font-bold`}>
                {selectedReview.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{selectedReview.clientName}</p>
                <p className="text-xs text-gray-500">{selectedReview.company}</p>
                <p className="text-xs text-gray-400 mt-0.5">{selectedReview.phone}</p>
              </div>
            </div>

            {/* Оценка */}
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-3 mb-2">
                <StarRating rating={selectedReview.rating} size="md" />
                <span className="text-lg font-bold text-gray-900">{selectedReview.rating}/5</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[selectedReview.category]}`}>
                  {selectedReview.category}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                  {selectedReview.source}
                </span>
                {selectedReview.responded
                  ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">Отвечено</span>
                  : <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">Без ответа</span>
                }
              </div>
            </div>

            {/* Полный текст */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">Отзыв</p>
              <p className="text-sm text-gray-800 leading-relaxed">{selectedReview.text}</p>
              <p className="text-xs text-gray-400 mt-2">
                <Icon name="Calendar" size={11} className="inline mr-1" />
                {selectedReview.date} · Инженер: {selectedReview.engineer}
              </p>
            </div>

            {/* Действия */}
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleCall(selectedReview)}
              >
                <Icon name="Phone" size={14} className="mr-2 text-green-600" />
                Позвонить клиенту
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start"
                onClick={() => toggleReply(selectedReview.id)}
              >
                <Icon name="Reply" size={14} className="mr-2 text-blue-600" />
                Ответить на отзыв
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleAddToTraining(selectedReview)}
              >
                <Icon name="BookOpen" size={14} className="mr-2 text-purple-600" />
                Добавить в базу обучения
              </Button>
              {selectedReview.rating <= 3 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => handleCreateTask(selectedReview)}
                >
                  <Icon name="AlertCircle" size={14} className="mr-2" />
                  Создать задачу по отзыву
                </Button>
              )}
            </div>

            {/* История взаимодействий */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">
                <Icon name="History" size={12} className="inline mr-1" />
                История нарядов
              </p>
              <div className="space-y-2">
                {selectedReview.history.map(h => (
                  <div key={h.orderId} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-blue-700 truncate">{h.orderId}</p>
                        <p className="text-xs text-gray-700 mt-0.5 leading-snug">{h.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {h.date} · {h.engineer}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <StarRating rating={h.rating} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientFeedbackFull;
