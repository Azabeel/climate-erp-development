import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ZAxis,
  ResponsiveContainer,
} from 'recharts';

// ─── Types ──────────────────────────────────────────────────────────────────

type LeadSource = 'Telegram' | 'WhatsApp' | 'Сайт' | 'Avito' | 'Звонок';

interface ScoreFactors {
  budget: number;      // 0-25
  urgency: number;     // 0-20
  companySize: number; // 0-15
  activity: number;    // 0-20
  profileFit: number;  // 0-10
  sourceQuality: number; // 0-10
}

interface HistoryEvent {
  date: string;
  type: 'call' | 'email' | 'message' | 'meeting' | 'note';
  text: string;
}

interface Lead {
  id: string;
  name: string;
  company: string;
  source: LeadSource;
  manager: string;
  score: number;
  factors: ScoreFactors;
  addedAt: string;
  lastContact: string;
  nextAction: string;
  budget: number; // тыс. руб.
  closeProbability: number; // %
  history: HistoryEvent[];
  aiRecommendation: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const LEADS: Lead[] = [
  {
    id: '1',
    name: 'Петров Алексей Сергеевич',
    company: 'ТЦ «Планета»',
    source: 'Звонок',
    manager: 'Сидорова К.',
    score: 91,
    factors: { budget: 24, urgency: 19, companySize: 14, activity: 18, profileFit: 9, sourceQuality: 7 },
    addedAt: '2026-05-01',
    lastContact: '2026-05-14',
    nextAction: 'Выставить КП сегодня',
    budget: 480,
    closeProbability: 82,
    aiRecommendation: 'Высокий приоритет — позвонить сегодня и закрыть КП',
    history: [
      { date: '14.05', type: 'call', text: 'Уточнил объём работ — 12 сплит-систем' },
      { date: '12.05', type: 'email', text: 'Отправлен список оборудования' },
      { date: '10.05', type: 'call', text: 'Первичный звонок, выявлена потребность' },
      { date: '08.05', type: 'note', text: 'Клиент строит новый корпус, срок — июнь' },
      { date: '01.05', type: 'call', text: 'Входящий звонок с сайта' },
    ],
  },
  {
    id: '2',
    name: 'Кузнецова Марина Игоревна',
    company: 'Офис «БизнесПарк»',
    source: 'Сайт',
    manager: 'Иванов Д.',
    score: 84,
    factors: { budget: 22, urgency: 17, companySize: 13, activity: 16, profileFit: 8, sourceQuality: 8 },
    addedAt: '2026-05-03',
    lastContact: '2026-05-13',
    nextAction: 'Согласовать дату выезда',
    budget: 310,
    closeProbability: 74,
    aiRecommendation: 'Назначить встречу — клиент готов к обсуждению',
    history: [
      { date: '13.05', type: 'email', text: 'Ответила на КП, просит встречу' },
      { date: '11.05', type: 'email', text: 'Отправлено КП на 4 канальника' },
      { date: '09.05', type: 'message', text: 'Написала через форму сайта' },
      { date: '07.05', type: 'note', text: 'Реновация офиса, бюджет подтверждён' },
      { date: '03.05', type: 'call', text: 'Первичный контакт' },
    ],
  },
  {
    id: '3',
    name: 'Захаров Николай Петрович',
    company: 'Ресторан «Берег»',
    source: 'Telegram',
    manager: 'Сидорова К.',
    score: 77,
    factors: { budget: 18, urgency: 16, companySize: 10, activity: 17, profileFit: 9, sourceQuality: 7 },
    addedAt: '2026-05-05',
    lastContact: '2026-05-12',
    nextAction: 'Прислать спецпредложение',
    budget: 220,
    closeProbability: 65,
    aiRecommendation: 'Подготовить спецпредложение с рассрочкой',
    history: [
      { date: '12.05', type: 'message', text: 'Просит рассрочку 3 месяца' },
      { date: '10.05', type: 'call', text: 'Обсудили условия, интерес высокий' },
      { date: '08.05', type: 'message', text: 'Написал в Telegram-бот' },
      { date: '06.05', type: 'email', text: 'Отправлен прайс' },
      { date: '05.05', type: 'note', text: 'Открытие ресторана в июле' },
    ],
  },
  {
    id: '4',
    name: 'Орлова Светлана Юрьевна',
    company: 'Медцентр «Здоровье+»',
    source: 'WhatsApp',
    manager: 'Попов А.',
    score: 88,
    factors: { budget: 23, urgency: 18, companySize: 12, activity: 19, profileFit: 9, sourceQuality: 7 },
    addedAt: '2026-05-02',
    lastContact: '2026-05-15',
    nextAction: 'Прислать договор',
    budget: 560,
    closeProbability: 79,
    aiRecommendation: 'Срочно — клиент ждёт договор, конкурент тоже в игре',
    history: [
      { date: '15.05', type: 'message', text: 'Просит договор сегодня' },
      { date: '14.05', type: 'meeting', text: 'Выезд на объект, замер выполнен' },
      { date: '12.05', type: 'call', text: 'Согласованы технические условия' },
      { date: '08.05', type: 'message', text: 'Написала в WhatsApp' },
      { date: '02.05', type: 'note', text: 'Медцентр расширяется, 8 помещений' },
    ],
  },
  {
    id: '5',
    name: 'Федоров Игорь Васильевич',
    company: 'ИП Федоров',
    source: 'Avito',
    manager: 'Иванов Д.',
    score: 42,
    factors: { budget: 10, urgency: 9, companySize: 5, activity: 8, profileFit: 6, sourceQuality: 4 },
    addedAt: '2026-05-07',
    lastContact: '2026-05-09',
    nextAction: 'Повторный звонок через неделю',
    budget: 45,
    closeProbability: 28,
    aiRecommendation: 'Низкий приоритет — поставить в очередь',
    history: [
      { date: '09.05', type: 'call', text: 'Не берёт трубку' },
      { date: '08.05', type: 'message', text: 'Написал с Avito, нужна 1 инсталляция' },
      { date: '07.05', type: 'note', text: 'Частный дом, небольшой бюджет' },
      { date: '07.05', type: 'email', text: 'Автоответ с ценами' },
      { date: '07.05', type: 'call', text: 'Входящий с Avito' },
    ],
  },
  {
    id: '6',
    name: 'Смирнова Татьяна Александровна',
    company: 'Отель «Визит»',
    source: 'Сайт',
    manager: 'Попов А.',
    score: 73,
    factors: { budget: 19, urgency: 14, companySize: 12, activity: 13, profileFit: 8, sourceQuality: 7 },
    addedAt: '2026-05-04',
    lastContact: '2026-05-11',
    nextAction: 'Уточнить сроки проекта',
    budget: 390,
    closeProbability: 57,
    aiRecommendation: 'Средний приоритет — уточнить временные рамки',
    history: [
      { date: '11.05', type: 'email', text: 'Ответила, сроки сдвигаются на август' },
      { date: '09.05', type: 'email', text: 'Отправлено КП на 20 номеров' },
      { date: '07.05', type: 'call', text: 'Обсудили масштаб проекта' },
      { date: '05.05', type: 'meeting', text: 'Встреча на объекте' },
      { date: '04.05', type: 'note', text: 'Подала заявку через сайт' },
    ],
  },
  {
    id: '7',
    name: 'Волков Дмитрий Олегович',
    company: 'Склад «Логистика-Юг»',
    source: 'Звонок',
    manager: 'Сидорова К.',
    score: 55,
    factors: { budget: 14, urgency: 11, companySize: 9, activity: 10, profileFit: 6, sourceQuality: 5 },
    addedAt: '2026-05-06',
    lastContact: '2026-05-10',
    nextAction: 'Выслать технические условия',
    budget: 170,
    closeProbability: 40,
    aiRecommendation: 'Уточнить бюджет — возможно занижен',
    history: [
      { date: '10.05', type: 'email', text: 'Запросил технические условия' },
      { date: '08.05', type: 'call', text: 'Обсудили промышленные системы' },
      { date: '07.05', type: 'note', text: 'Склад 2000 кв.м, нужна вентиляция' },
      { date: '06.05', type: 'call', text: 'Входящий звонок' },
      { date: '06.05', type: 'note', text: 'Бюджет уточняется' },
    ],
  },
  {
    id: '8',
    name: 'Лебедева Ольга Николаевна',
    company: 'Детский сад «Солнышко»',
    source: 'WhatsApp',
    manager: 'Иванов Д.',
    score: 67,
    factors: { budget: 16, urgency: 15, companySize: 8, activity: 14, profileFit: 8, sourceQuality: 6 },
    addedAt: '2026-05-08',
    lastContact: '2026-05-13',
    nextAction: 'Согласовать смету с директором',
    budget: 195,
    closeProbability: 53,
    aiRecommendation: 'Подготовить смету с санитарными нормами для садов',
    history: [
      { date: '13.05', type: 'message', text: 'Директор одобрил концепцию' },
      { date: '11.05', type: 'call', text: 'Обсудили требования СанПиН' },
      { date: '10.05', type: 'email', text: 'Отправлены примеры проектов' },
      { date: '09.05', type: 'message', text: 'Написала в WhatsApp' },
      { date: '08.05', type: 'note', text: 'Плановый ремонт перед учебным годом' },
    ],
  },
  {
    id: '9',
    name: 'Козлов Артём Владимирович',
    company: 'Фитнес-клуб «Форма»',
    source: 'Telegram',
    manager: 'Попов А.',
    score: 82,
    factors: { budget: 21, urgency: 17, companySize: 11, activity: 16, profileFit: 9, sourceQuality: 8 },
    addedAt: '2026-05-03',
    lastContact: '2026-05-14',
    nextAction: 'Выслать договор на подпись',
    budget: 340,
    closeProbability: 71,
    aiRecommendation: 'Высокий приоритет — подготовить договор сегодня',
    history: [
      { date: '14.05', type: 'message', text: 'Готов подписать договор' },
      { date: '12.05', type: 'meeting', text: 'Встреча, согласовали этапы' },
      { date: '10.05', type: 'call', text: 'Обсудили климатизацию тренажёрного зала' },
      { date: '07.05', type: 'message', text: 'Написал через Telegram-бот' },
      { date: '03.05', type: 'note', text: 'Открытие нового зала в июне' },
    ],
  },
  {
    id: '10',
    name: 'Новикова Виктория Сергеевна',
    company: 'Бутик «Элегия»',
    source: 'Avito',
    manager: 'Сидорова К.',
    score: 31,
    factors: { budget: 7, urgency: 6, companySize: 4, activity: 7, profileFit: 4, sourceQuality: 3 },
    addedAt: '2026-05-09',
    lastContact: '2026-05-09',
    nextAction: 'Дождаться решения о бюджете',
    budget: 30,
    closeProbability: 15,
    aiRecommendation: 'Низкий приоритет — оставить в базе',
    history: [
      { date: '09.05', type: 'message', text: 'Написала с Avito, нужна 1 сплит-система' },
      { date: '09.05', type: 'call', text: 'Уточнила цену монтажа' },
      { date: '09.05', type: 'email', text: 'Автоответ с ценами' },
      { date: '09.05', type: 'note', text: 'Небольшой магазин, ограниченный бюджет' },
      { date: '09.05', type: 'note', text: 'Ждёт согласования с партнёром' },
    ],
  },
  {
    id: '11',
    name: 'Морозов Евгений Павлович',
    company: 'Завод «ПромМаш»',
    source: 'Звонок',
    manager: 'Иванов Д.',
    score: 79,
    factors: { budget: 20, urgency: 16, companySize: 14, activity: 14, profileFit: 8, sourceQuality: 7 },
    addedAt: '2026-05-01',
    lastContact: '2026-05-12',
    nextAction: 'Подготовить проект вентиляции цеха',
    budget: 820,
    closeProbability: 62,
    aiRecommendation: 'Перспективный — крупный объект, нужен проект',
    history: [
      { date: '12.05', type: 'call', text: 'Запросил проект для цеха покраски' },
      { date: '10.05', type: 'meeting', text: 'Выезд на завод, обмер цехов' },
      { date: '07.05', type: 'email', text: 'Отправлен запрос на ТУ' },
      { date: '04.05', type: 'call', text: 'Повторный звонок, бюджет подтверждён' },
      { date: '01.05', type: 'call', text: 'Входящий звонок' },
    ],
  },
  {
    id: '12',
    name: 'Соколова Наталья Михайловна',
    company: 'Клиника «МедЭксперт»',
    source: 'Сайт',
    manager: 'Попов А.',
    score: 86,
    factors: { budget: 22, urgency: 18, companySize: 13, activity: 17, profileFit: 9, sourceQuality: 7 },
    addedAt: '2026-05-02',
    lastContact: '2026-05-15',
    nextAction: 'Финальное согласование КП',
    budget: 670,
    closeProbability: 77,
    aiRecommendation: 'Высокий приоритет — осталось финальное согласование',
    history: [
      { date: '15.05', type: 'call', text: 'Финальные правки в КП' },
      { date: '13.05', type: 'email', text: 'Отправлена обновлённая версия КП' },
      { date: '11.05', type: 'meeting', text: 'Встреча с главным врачом' },
      { date: '08.05', type: 'call', text: 'Обсудили требования к чистым помещениям' },
      { date: '02.05', type: 'note', text: 'Расширение клиники, 15 кабинетов' },
    ],
  },
  {
    id: '13',
    name: 'Тихонов Роман Александрович',
    company: 'Магазин «ТехноМир»',
    source: 'WhatsApp',
    manager: 'Сидорова К.',
    score: 48,
    factors: { budget: 12, urgency: 10, companySize: 7, activity: 9, profileFit: 6, sourceQuality: 4 },
    addedAt: '2026-05-10',
    lastContact: '2026-05-12',
    nextAction: 'Выяснить источник финансирования',
    budget: 90,
    closeProbability: 33,
    aiRecommendation: 'Средний риск — уточнить финансирование',
    history: [
      { date: '12.05', type: 'message', text: 'Просит рассрочку 6 месяцев' },
      { date: '11.05', type: 'call', text: 'Обсудили замену старого оборудования' },
      { date: '10.05', type: 'message', text: 'Написал в WhatsApp' },
      { date: '10.05', type: 'note', text: 'Магазин электроники, 300 кв.м' },
      { date: '10.05', type: 'email', text: 'Автоответ с ценами' },
    ],
  },
  {
    id: '14',
    name: 'Яковлева Елена Борисовна',
    company: 'БЦ «Горизонт»',
    source: 'Telegram',
    manager: 'Иванов Д.',
    score: 93,
    factors: { budget: 25, urgency: 19, companySize: 15, activity: 19, profileFit: 10, sourceQuality: 5 },
    addedAt: '2026-05-01',
    lastContact: '2026-05-15',
    nextAction: 'Подписание договора сегодня',
    budget: 1200,
    closeProbability: 89,
    aiRecommendation: 'Максимальный приоритет — крупная сделка, закрыть сегодня',
    history: [
      { date: '15.05', type: 'meeting', text: 'Встреча для подписания договора' },
      { date: '14.05', type: 'call', text: 'Юридический отдел одобрил договор' },
      { date: '12.05', type: 'email', text: 'Отправлен финальный договор' },
      { date: '10.05', type: 'meeting', text: 'Презентация решения для руководства' },
      { date: '01.05', type: 'call', text: 'Первый контакт через Telegram' },
    ],
  },
  {
    id: '15',
    name: 'Белов Константин Игоревич',
    company: 'Ресторан «Пристань»',
    source: 'Avito',
    manager: 'Попов А.',
    score: 36,
    factors: { budget: 9, urgency: 8, companySize: 5, activity: 7, profileFit: 4, sourceQuality: 3 },
    addedAt: '2026-05-11',
    lastContact: '2026-05-11',
    nextAction: 'Ждать обратной связи',
    budget: 55,
    closeProbability: 20,
    aiRecommendation: 'Низкий приоритет — мало данных для оценки',
    history: [
      { date: '11.05', type: 'message', text: 'Написал с Avito, нужен кондиционер' },
      { date: '11.05', type: 'call', text: 'Краткий разговор, обещал перезвонить' },
      { date: '11.05', type: 'email', text: 'Автоответ с ценами' },
      { date: '11.05', type: 'note', text: 'Небольшой ресторан, бюджет уточняется' },
      { date: '11.05', type: 'note', text: 'Ждёт предложений от нескольких компаний' },
    ],
  },
];

// ─── Analytics Data ──────────────────────────────────────────────────────────

const SCORE_DISTRIBUTION = [
  { range: '0-20', count: 1, fill: '#ef4444' },
  { range: '21-40', count: 3, fill: '#f97316' },
  { range: '41-60', count: 4, fill: '#eab308' },
  { range: '61-80', count: 4, fill: '#84cc16' },
  { range: '81-100', count: 3, fill: '#22c55e' },
];

const AVG_SCORE_TREND = [
  { day: '15.04', score: 61.2 },
  { day: '17.04', score: 62.8 },
  { day: '19.04', score: 60.5 },
  { day: '21.04', score: 63.4 },
  { day: '23.04', score: 65.0 },
  { day: '25.04', score: 64.2 },
  { day: '27.04', score: 66.1 },
  { day: '29.04', score: 65.8 },
  { day: '01.05', score: 67.0 },
  { day: '03.05', score: 66.5 },
  { day: '05.05', score: 68.2 },
  { day: '07.05', score: 67.9 },
  { day: '09.05', score: 69.1 },
  { day: '11.05', score: 68.7 },
  { day: '13.05', score: 68.4 },
];

const SCATTER_DATA = LEADS.map((l) => ({
  score: l.score,
  probability: l.closeProbability,
  budget: l.budget,
  name: l.company,
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getScoreColor(score: number) {
  if (score >= 70) return 'bg-green-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getScoreTextColor(score: number) {
  if (score >= 70) return 'text-green-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-600';
}

function getSourceColor(source: LeadSource): string {
  switch (source) {
    case 'Telegram': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'WhatsApp': return 'bg-green-100 text-green-800 border-green-200';
    case 'Сайт': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Avito': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Звонок': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getHistoryIcon(type: HistoryEvent['type']) {
  switch (type) {
    case 'call': return 'Phone';
    case 'email': return 'Mail';
    case 'message': return 'MessageCircle';
    case 'meeting': return 'Users';
    case 'note': return 'FileText';
    default: return 'Circle';
  }
}

function getHistoryColor(type: HistoryEvent['type']) {
  switch (type) {
    case 'call': return 'text-blue-500';
    case 'email': return 'text-purple-500';
    case 'message': return 'text-green-500';
    case 'meeting': return 'text-orange-500';
    case 'note': return 'text-gray-500';
    default: return 'text-gray-400';
  }
}

// ─── Factor Labels ────────────────────────────────────────────────────────────

const FACTOR_META: { key: keyof ScoreFactors; label: string; max: number; icon: string; iconColor: string }[] = [
  { key: 'budget', label: 'Бюджет соответствует', max: 25, icon: 'DollarSign', iconColor: 'text-green-600' },
  { key: 'urgency', label: 'Срочность потребности', max: 20, icon: 'Zap', iconColor: 'text-yellow-600' },
  { key: 'companySize', label: 'Размер компании', max: 15, icon: 'Building2', iconColor: 'text-blue-600' },
  { key: 'activity', label: 'Активность (ответы/открытия)', max: 20, icon: 'Activity', iconColor: 'text-purple-600' },
  { key: 'profileFit', label: 'Совпадение профиля с ЦА', max: 10, icon: 'Target', iconColor: 'text-red-600' },
  { key: 'sourceQuality', label: 'Качество источника', max: 10, icon: 'Star', iconColor: 'text-orange-600' },
];

// ─── Custom Scatter Tooltip ───────────────────────────────────────────────────

interface ScatterTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: typeof SCATTER_DATA[0] }>;
}

function ScatterTooltipContent({ active, payload }: ScatterTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-xs">
      <p className="font-semibold text-gray-800 mb-1">{d.name}</p>
      <p className="text-gray-600">Score: <span className="font-medium">{d.score}</span></p>
      <p className="text-gray-600">Вероятность: <span className="font-medium">{d.probability}%</span></p>
      <p className="text-gray-600">Бюджет: <span className="font-medium">{d.budget} тыс.₽</span></p>
    </div>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconBg: string;
  iconColor: string;
  sub?: string;
}

function MetricCard({ title, value, icon, iconBg, iconColor, sub }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg} flex-shrink-0`}>
        <Icon name={icon} size={22} className={iconColor} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LeadScoringFull() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState<'table' | 'analytics' | 'settings'>('table');
  const [weights, setWeights] = useState({
    budget: 25,
    urgency: 20,
    companySize: 15,
    activity: 20,
    profileFit: 10,
    sourceQuality: 10,
  });

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  function handleRecalculate() {
    if (totalWeight !== 100) {
      toast.error(`Сумма весов должна быть 100. Сейчас: ${totalWeight}`);
      return;
    }
    toast.success('Скоринг пересчитан по новым весам');
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Icon name="TrendingUp" size={18} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Скоринг лидов</h1>
              <p className="text-xs text-gray-500">Интеллектуальная оценка потенциала сделок</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.success('Данные обновлены')}>
              <Icon name="RefreshCw" size={14} className="mr-1.5" />
              Обновить
            </Button>
            <Button size="sm" onClick={() => toast.success('Экспорт запущен')}>
              <Icon name="Download" size={14} className="mr-1.5" />
              Экспорт
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="px-6 pt-5 pb-4 grid grid-cols-4 gap-4">
        <MetricCard
          title="Лидов в работе"
          value={47}
          icon="Users"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          sub="из 53 активных"
        />
        <MetricCard
          title="Средний score"
          value="68.4"
          icon="BarChart2"
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          sub="+2.1 за неделю"
        />
        <MetricCard
          title="Горячих лидов (>80)"
          value={12}
          icon="Flame"
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
          sub="25.5% от всех лидов"
        />
        <MetricCard
          title="Конверсия за месяц"
          value="23.4%"
          icon="Target"
          iconBg="bg-green-50"
          iconColor="text-green-600"
          sub="+1.8% к прошлому месяцу"
        />
      </div>

      {/* Tab Nav */}
      <div className="px-6 mb-4">
        <div className="inline-flex bg-white border border-gray-200 rounded-lg p-1 gap-1 shadow-sm">
          {(['table', 'analytics', 'settings'] as const).map((tab) => {
            const labels = { table: 'Таблица лидов', analytics: 'Аналитика', settings: 'Настройки весов' };
            const icons = { table: 'List', analytics: 'BarChart2', settings: 'SlidersHorizontal' };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon name={icons[tab]} size={14} />
                {labels[tab]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-hidden">

        {/* ── Table Tab ── */}
        {activeTab === 'table' && (
          <div className="flex gap-4 h-full">
            {/* Table */}
            <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="overflow-auto flex-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Лид / Компания</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Источник</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Менеджер</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[160px]">Score</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Факторы</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Добавлен</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Посл. контакт</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Следующее действие</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {LEADS.map((lead) => (
                      <tr
                        key={lead.id}
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedLead?.id === lead.id ? 'bg-indigo-50' : ''}`}
                        onClick={() => setSelectedLead(lead)}
                      >
                        {/* Name */}
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 text-xs">{lead.name}</p>
                          <p className="text-gray-500 text-xs mt-0.5">{lead.company}</p>
                        </td>
                        {/* Source */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getSourceColor(lead.source)}`}>
                            {lead.source}
                          </span>
                        </td>
                        {/* Manager */}
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-700">{lead.manager}</span>
                        </td>
                        {/* Score */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-2 max-w-[80px]">
                              <div
                                className={`h-2 rounded-full transition-all ${getScoreColor(lead.score)}`}
                                style={{ width: `${lead.score}%` }}
                              />
                            </div>
                            <span className={`text-xs font-bold w-7 ${getScoreTextColor(lead.score)}`}>{lead.score}</span>
                          </div>
                        </td>
                        {/* Factor Icons */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {FACTOR_META.map((fm) => {
                              const val = lead.factors[fm.key];
                              const pct = Math.round((val / fm.max) * 100);
                              const color = pct >= 70 ? 'text-green-500' : pct >= 40 ? 'text-yellow-500' : 'text-red-400';
                              return (
                                <div key={fm.key} title={`${fm.label}: ${val}/${fm.max}`}>
                                  <Icon name={fm.icon} size={13} className={color} />
                                </div>
                              );
                            })}
                          </div>
                        </td>
                        {/* Dates */}
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-500">{lead.addedAt}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-500">{lead.lastContact}</span>
                        </td>
                        {/* Next Action */}
                        <td className="px-4 py-3 max-w-[160px]">
                          <span className="text-xs text-gray-700 line-clamp-2">{lead.nextAction}</span>
                        </td>
                        {/* Button */}
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant={selectedLead?.id === lead.id ? 'default' : 'outline'}
                            className="text-xs py-1 h-7"
                            onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); }}
                          >
                            Подробнее
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detail Panel */}
            {selectedLead && (
              <div className="w-80 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden flex-shrink-0">
                {/* Panel Header */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 truncate">{selectedLead.company}</p>
                    <p className="text-xs text-gray-500 truncate">{selectedLead.name}</p>
                  </div>
                  <button
                    className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center"
                    onClick={() => setSelectedLead(null)}
                  >
                    <Icon name="X" size={14} className="text-gray-500" />
                  </button>
                </div>

                <div className="overflow-y-auto flex-1 p-4 space-y-4">
                  {/* Score Summary */}
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold text-white ${
                      selectedLead.score >= 70 ? 'bg-green-500' : selectedLead.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>
                      {selectedLead.score}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Итоговый score</p>
                  </div>

                  {/* Factor Breakdown */}
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                      <Icon name="BarChart2" size={13} className="text-indigo-500" />
                      Разбивка по факторам
                    </p>
                    <div className="space-y-2.5">
                      {FACTOR_META.map((fm) => {
                        const val = selectedLead.factors[fm.key];
                        const pct = (val / fm.max) * 100;
                        return (
                          <div key={fm.key}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1.5">
                                <Icon name={fm.icon} size={11} className={fm.iconColor} />
                                <span className="text-xs text-gray-600">{fm.label}</span>
                              </div>
                              <span className="text-xs font-semibold text-gray-800">{val}/{fm.max}</span>
                            </div>
                            <div className="bg-gray-100 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-all ${
                                  pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-400'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* AI Recommendation */}
                  <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                    <div className="flex items-start gap-2">
                      <Icon name="Sparkles" size={14} className="text-indigo-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-indigo-700 mb-0.5">Рекомендация ИИ</p>
                        <p className="text-xs text-indigo-600">{selectedLead.aiRecommendation}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                      <p className="text-base font-bold text-gray-900">{selectedLead.closeProbability}%</p>
                      <p className="text-xs text-gray-500">Вероятность</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                      <p className="text-base font-bold text-gray-900">{selectedLead.budget} т.₽</p>
                      <p className="text-xs text-gray-500">Бюджет</p>
                    </div>
                  </div>

                  {/* History */}
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                      <Icon name="Clock" size={13} className="text-gray-500" />
                      История взаимодействий
                    </p>
                    <div className="space-y-2">
                      {selectedLead.history.map((ev, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="mt-0.5 flex-shrink-0">
                            <Icon name={getHistoryIcon(ev.type)} size={12} className={getHistoryColor(ev.type)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-700 leading-snug">{ev.text}</p>
                            <p className="text-xs text-gray-400">{ev.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-3 border-t border-gray-100 grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 flex items-center justify-center gap-1"
                    onClick={() => toast.success(`Звонок ${selectedLead.name}`)}
                  >
                    <Icon name="Phone" size={12} />
                    Позвонить
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 flex items-center justify-center gap-1"
                    onClick={() => toast.success(`Сообщение ${selectedLead.name}`)}
                  >
                    <Icon name="MessageCircle" size={12} />
                    Написать
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs h-8 flex items-center justify-center gap-1"
                    onClick={() => toast.success(`КП создано для ${selectedLead.company}`)}
                  >
                    <Icon name="FileText" size={12} />
                    КП
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Analytics Tab ── */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-3 gap-4">
            {/* Distribution Bar */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">Распределение по score</h3>
              <p className="text-xs text-gray-500 mb-4">Количество лидов по диапазонам</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={SCORE_DISTRIBUTION} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: number) => [val, 'Лидов']}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]}>
                    {SCORE_DISTRIBUTION.map((entry, i) => (
                      <rect key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Avg Score Trend */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">Динамика среднего score</h3>
              <p className="text-xs text-gray-500 mb-4">За последние 30 дней</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={AVG_SCORE_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={2} />
                  <YAxis domain={[55, 75]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: number) => [val.toFixed(1), 'Avg Score']}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Scatter: Score vs Probability */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">Score vs Вероятность закрытия</h3>
              <p className="text-xs text-gray-500 mb-4">Размер пузыря = бюджет сделки</p>
              <ResponsiveContainer width="100%" height={220}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="score" name="Score" type="number" domain={[20, 100]} tick={{ fontSize: 10 }} label={{ value: 'Score', position: 'insideBottom', offset: -2, fontSize: 10 }} />
                  <YAxis dataKey="probability" name="Вероятность" domain={[0, 100]} tick={{ fontSize: 10 }} label={{ value: '%', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <ZAxis dataKey="budget" range={[40, 400]} name="Бюджет" />
                  <Tooltip content={<ScatterTooltipContent />} />
                  <Scatter data={SCATTER_DATA} fill="#6366f1" fillOpacity={0.6} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Source breakdown */}
            <div className="col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Score по источникам</h3>
              <div className="grid grid-cols-5 gap-3">
                {(['Telegram', 'WhatsApp', 'Сайт', 'Avito', 'Звонок'] as LeadSource[]).map((src) => {
                  const srcLeads = LEADS.filter((l) => l.source === src);
                  const avg = srcLeads.length ? Math.round(srcLeads.reduce((a, l) => a + l.score, 0) / srcLeads.length) : 0;
                  return (
                    <div key={src} className="text-center bg-gray-50 rounded-lg p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border mb-2 ${getSourceColor(src)}`}>
                        {src}
                      </span>
                      <p className="text-2xl font-bold text-gray-900">{avg}</p>
                      <p className="text-xs text-gray-500 mt-0.5">ср. score</p>
                      <p className="text-xs text-gray-400">{srcLeads.length} лид{srcLeads.length !== 1 ? 'ов' : ''}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Settings Tab ── */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">Веса факторов скоринга</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Настройте вклад каждого фактора в итоговый score. Сумма должна равняться 100.</p>
                </div>
                <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                  totalWeight === 100 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  Сумма: {totalWeight}
                </div>
              </div>

              <div className="space-y-5">
                {FACTOR_META.map((fm) => {
                  const val = weights[fm.key];
                  return (
                    <div key={fm.key}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon name={fm.icon} size={15} className={fm.iconColor} />
                          <span className="text-sm text-gray-700 font-medium">{fm.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900 w-8 text-right">{val}</span>
                          <span className="text-xs text-gray-400">баллов</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-4">0</span>
                        <input
                          type="range"
                          min={0}
                          max={50}
                          step={1}
                          value={val}
                          onChange={(e) =>
                            setWeights((prev) => ({ ...prev, [fm.key]: Number(e.target.value) }))
                          }
                          className="flex-1 h-2 rounded-full appearance-none bg-gray-200 accent-indigo-600 cursor-pointer"
                        />
                        <span className="text-xs text-gray-400 w-6">50</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {totalWeight === 100
                    ? '✓ Веса настроены корректно'
                    : `Нужно ${totalWeight < 100 ? `добавить ${100 - totalWeight}` : `убрать ${totalWeight - 100}`} баллов`}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setWeights({ budget: 25, urgency: 20, companySize: 15, activity: 20, profileFit: 10, sourceQuality: 10 })
                    }
                  >
                    Сбросить
                  </Button>
                  <Button size="sm" onClick={handleRecalculate} disabled={totalWeight !== 100}>
                    <Icon name="RefreshCw" size={14} className="mr-1.5" />
                    Пересчитать
                  </Button>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mt-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Предпросмотр изменений</h4>
              <p className="text-xs text-gray-500 mb-3">Как изменятся топ-5 лидов после пересчёта (примерные значения)</p>
              <div className="space-y-2">
                {LEADS.slice(0, 5).map((lead) => {
                  // Simple recalculation preview
                  const newScore = Math.min(100, Math.round(
                    (lead.factors.budget / 25) * weights.budget +
                    (lead.factors.urgency / 20) * weights.urgency +
                    (lead.factors.companySize / 15) * weights.companySize +
                    (lead.factors.activity / 20) * weights.activity +
                    (lead.factors.profileFit / 10) * weights.profileFit +
                    (lead.factors.sourceQuality / 10) * weights.sourceQuality
                  ));
                  const diff = newScore - lead.score;
                  return (
                    <div key={lead.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                      <span className="text-xs text-gray-700">{lead.company}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">{lead.score} →</span>
                        <span className={`text-xs font-bold ${getScoreTextColor(newScore)}`}>{newScore}</span>
                        {diff !== 0 && (
                          <span className={`text-xs font-medium ${diff > 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {diff > 0 ? '+' : ''}{diff}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
