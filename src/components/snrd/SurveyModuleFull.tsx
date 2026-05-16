import { useState } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────────────────────────────

type QuestionType = 'text' | 'rating' | 'single' | 'multi' | 'photo';
type TemplateType = 'client' | 'technical';
type SurveyStatus = 'active' | 'draft';
type JournalStatus = 'filled' | 'pending' | 'overdue';

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
}

interface SurveyTemplate {
  id: string;
  name: string;
  type: TemplateType;
  questionCount: number;
  status: SurveyStatus;
  filledCount: number;
  description: string;
  questions: Question[];
}

interface JournalEntry {
  id: string;
  client: string;
  object: string;
  engineer: string;
  date: string;
  template: string;
  status: JournalStatus;
  avgScore: number | null;
  answers: { question: string; answer: string }[];
}

// ─── Static data ─────────────────────────────────────────────────────────────

const TEMPLATES: SurveyTemplate[] = [
  {
    id: 't1',
    name: 'Оценка качества обслуживания',
    type: 'client',
    questionCount: 8,
    status: 'active',
    filledCount: 142,
    description: 'Клиентская анкета после завершения выезда инженера',
    questions: [
      { id: 'q1', text: 'Оцените вежливость инженера', type: 'rating', required: true },
      { id: 'q2', text: 'Насколько быстро была решена проблема?', type: 'rating', required: true },
      { id: 'q3', text: 'Остались ли следы работы (мусор, загрязнения)?', type: 'single', required: true, options: ['Нет, всё чисто', 'Немного', 'Да, много'] },
      { id: 'q4', text: 'Порекомендуете нас знакомым?', type: 'single', required: true, options: ['Да, однозначно', 'Скорее да', 'Скорее нет', 'Нет'] },
      { id: 'q5', text: 'Что понравилось больше всего?', type: 'text', required: false },
      { id: 'q6', text: 'Что улучшить?', type: 'text', required: false },
      { id: 'q7', text: 'Общая оценка обслуживания', type: 'rating', required: true },
      { id: 'q8', text: 'Фото выполненных работ (по желанию)', type: 'photo', required: false },
    ],
  },
  {
    id: 't2',
    name: 'Проверка оборудования (ТО)',
    type: 'technical',
    questionCount: 12,
    status: 'active',
    filledCount: 87,
    description: 'Технический чек-лист при проведении планового технического обслуживания',
    questions: [
      { id: 'q1', text: 'Состояние фильтров внутреннего блока', type: 'single', required: true, options: ['Чистые', 'Загрязнены', 'Требуют замены'] },
      { id: 'q2', text: 'Давление хладагента (МПа)', type: 'text', required: true },
      { id: 'q3', text: 'Температура всасывания (°C)', type: 'text', required: true },
      { id: 'q4', text: 'Ток компрессора (А)', type: 'text', required: true },
      { id: 'q5', text: 'Состояние теплообменника', type: 'rating', required: true },
      { id: 'q6', text: 'Фото оборудования до обслуживания', type: 'photo', required: true },
      { id: 'q7', text: 'Фото оборудования после обслуживания', type: 'photo', required: true },
      { id: 'q8', text: 'Обнаруженные неисправности', type: 'multi', required: false, options: ['Засорение фильтров', 'Утечка хладагента', 'Шум подшипников', 'Загрязнение теплообменника', 'Нет неисправностей'] },
      { id: 'q9', text: 'Рекомендации клиенту', type: 'text', required: false },
      { id: 'q10', text: 'Состояние дренажной системы', type: 'rating', required: true },
      { id: 'q11', text: 'Электрические соединения', type: 'single', required: true, options: ['В норме', 'Требуют протяжки', 'Обнаружены повреждения'] },
      { id: 'q12', text: 'Итоговая оценка состояния системы', type: 'rating', required: true },
    ],
  },
  {
    id: 't3',
    name: 'Обследование объекта',
    type: 'technical',
    questionCount: 10,
    status: 'active',
    filledCount: 34,
    description: 'Первичное обследование объекта перед монтажом или составлением КП',
    questions: [
      { id: 'q1', text: 'Тип помещения', type: 'single', required: true, options: ['Офис', 'Торговое помещение', 'Склад', 'Жилое', 'Промышленное'] },
      { id: 'q2', text: 'Площадь (кв. м)', type: 'text', required: true },
      { id: 'q3', text: 'Высота потолков (м)', type: 'text', required: true },
      { id: 'q4', text: 'Количество окон', type: 'text', required: true },
      { id: 'q5', text: 'Наличие существующей вентиляции', type: 'single', required: true, options: ['Есть', 'Нет', 'Требует замены'] },
      { id: 'q6', text: 'Пожелания клиента', type: 'multi', required: false, options: ['Тихая работа', 'Инверторное оборудование', 'Wi-Fi управление', 'Мульти-сплит', 'Канальная система'] },
      { id: 'q7', text: 'Фото объекта', type: 'photo', required: true },
      { id: 'q8', text: 'Планировка помещения (схема)', type: 'photo', required: false },
      { id: 'q9', text: 'Трудоёмкость монтажа', type: 'single', required: true, options: ['Простой', 'Средний', 'Сложный'] },
      { id: 'q10', text: 'Дополнительные замечания', type: 'text', required: false },
    ],
  },
  {
    id: 't4',
    name: 'Анкета удовлетворённости',
    type: 'client',
    questionCount: 6,
    status: 'active',
    filledCount: 211,
    description: 'Ежеквартальный опрос клиентов по договорам обслуживания',
    questions: [
      { id: 'q1', text: 'Насколько вы довольны нашим сервисом в целом?', type: 'rating', required: true },
      { id: 'q2', text: 'Скорость реакции на заявки', type: 'rating', required: true },
      { id: 'q3', text: 'Качество ремонтных работ', type: 'rating', required: true },
      { id: 'q4', text: 'Вежливость и профессионализм инженеров', type: 'rating', required: true },
      { id: 'q5', text: 'Что улучшить в нашей работе?', type: 'multi', required: false, options: ['Скорость реакции', 'Качество работ', 'Общение', 'Стоимость', 'Документооборот'] },
      { id: 'q6', text: 'Ваш комментарий', type: 'text', required: false },
    ],
  },
  {
    id: 't5',
    name: 'Чек-лист монтажа',
    type: 'technical',
    questionCount: 15,
    status: 'active',
    filledCount: 56,
    description: 'Пошаговый контроль качества при монтаже климатического оборудования',
    questions: [
      { id: 'q1', text: 'Место установки внутреннего блока согласовано с клиентом', type: 'single', required: true, options: ['Да', 'Нет'] },
      { id: 'q2', text: 'Расстояния до препятствий соблюдены', type: 'single', required: true, options: ['Да', 'Нет', 'Частично'] },
      { id: 'q3', text: 'Уклон дренажа корректный', type: 'single', required: true, options: ['Да', 'Нет'] },
      { id: 'q4', text: 'Вакуумирование системы выполнено', type: 'single', required: true, options: ['Да', 'Нет'] },
      { id: 'q5', text: 'Время вакуумирования (мин)', type: 'text', required: true },
      { id: 'q6', text: 'Давление после вакуумирования (Па)', type: 'text', required: true },
      { id: 'q7', text: 'Дозаправка хладагента', type: 'single', required: true, options: ['Не требовалась', 'Дозаправлено', 'Полная заправка'] },
      { id: 'q8', text: 'Количество добавленного хладагента (г)', type: 'text', required: false },
      { id: 'q9', text: 'Проверка работы во всех режимах', type: 'single', required: true, options: ['Пройдена', 'Частично', 'Не пройдена'] },
      { id: 'q10', text: 'Фото до монтажа', type: 'photo', required: true },
      { id: 'q11', text: 'Фото после монтажа (внутренний блок)', type: 'photo', required: true },
      { id: 'q12', text: 'Фото после монтажа (внешний блок)', type: 'photo', required: true },
      { id: 'q13', text: 'Инструктаж клиента проведён', type: 'single', required: true, options: ['Да', 'Нет'] },
      { id: 'q14', text: 'Клиент подписал акт', type: 'single', required: true, options: ['Да', 'Нет'] },
      { id: 'q15', text: 'Замечания при монтаже', type: 'text', required: false },
    ],
  },
  {
    id: 't6',
    name: 'Диагностика кондиционера',
    type: 'technical',
    questionCount: 11,
    status: 'draft',
    filledCount: 0,
    description: 'Детальная диагностика неисправностей кондиционера перед ремонтом',
    questions: [
      { id: 'q1', text: 'Код ошибки на дисплее', type: 'text', required: false },
      { id: 'q2', text: 'Описание симптомов со слов клиента', type: 'text', required: true },
      { id: 'q3', text: 'Режим работы при возникновении проблемы', type: 'single', required: true, options: ['Охлаждение', 'Обогрев', 'Вентиляция', 'Осушение', 'Не работает'] },
      { id: 'q4', text: 'Давление высокого давления (МПа)', type: 'text', required: true },
      { id: 'q5', text: 'Давление низкого давления (МПа)', type: 'text', required: true },
      { id: 'q6', text: 'Ток компрессора (А)', type: 'text', required: true },
      { id: 'q7', text: 'Температура нагнетания (°C)', type: 'text', required: true },
      { id: 'q8', text: 'Признаки утечки хладагента', type: 'single', required: true, options: ['Обнаружены', 'Не обнаружены', 'Требуется тест давлением'] },
      { id: 'q9', text: 'Предварительный диагноз', type: 'multi', required: true, options: ['Утечка хладагента', 'Неисправность компрессора', 'Загрязнение теплообменника', 'Неисправность платы управления', 'Засорение дренажа', 'Другое'] },
      { id: 'q10', text: 'Фото неисправности', type: 'photo', required: true },
      { id: 'q11', text: 'Рекомендуемые работы', type: 'text', required: true },
    ],
  },
];

const JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'j1',
    client: 'ООО «АркадияТех»',
    object: 'Офис, ул. Ленина, 45',
    engineer: 'Петров А.В.',
    date: '16.05.2026',
    template: 'Оценка качества обслуживания',
    status: 'filled',
    avgScore: 4.8,
    answers: [
      { question: 'Оцените вежливость инженера', answer: '5/5' },
      { question: 'Насколько быстро была решена проблема?', answer: '5/5' },
      { question: 'Остались ли следы работы?', answer: 'Нет, всё чисто' },
      { question: 'Порекомендуете нас знакомым?', answer: 'Да, однозначно' },
      { question: 'Что понравилось больше всего?', answer: 'Профессионализм и скорость' },
      { question: 'Общая оценка обслуживания', answer: '5/5' },
    ],
  },
  {
    id: 'j2',
    client: 'ТЦ «Галактика»',
    object: 'Машинное отделение, 3 этаж',
    engineer: 'Иванов К.С.',
    date: '15.05.2026',
    template: 'Проверка оборудования (ТО)',
    status: 'filled',
    avgScore: 4.2,
    answers: [
      { question: 'Состояние фильтров', answer: 'Загрязнены — заменены' },
      { question: 'Давление хладагента', answer: '1.8 МПа' },
      { question: 'Итоговая оценка состояния', answer: '4/5' },
    ],
  },
  {
    id: 'j3',
    client: 'ИП Сидорова М.Н.',
    object: 'Салон красоты, пр. Мира, 12',
    engineer: 'Козлов Д.Р.',
    date: '14.05.2026',
    template: 'Анкета удовлетворённости',
    status: 'filled',
    avgScore: 3.6,
    answers: [
      { question: 'Насколько вы довольны сервисом?', answer: '4/5' },
      { question: 'Скорость реакции на заявки', answer: '3/5' },
      { question: 'Что улучшить?', answer: 'Скорость реакции' },
    ],
  },
  {
    id: 'j4',
    client: 'ЖК «Северный берег»',
    object: 'Кв. 47, кор. 2',
    engineer: 'Смирнов Е.А.',
    date: '14.05.2026',
    template: 'Чек-лист монтажа',
    status: 'filled',
    avgScore: 5.0,
    answers: [
      { question: 'Место установки согласовано', answer: 'Да' },
      { question: 'Вакуумирование выполнено', answer: 'Да, 45 минут' },
      { question: 'Проверка работы', answer: 'Пройдена' },
      { question: 'Клиент подписал акт', answer: 'Да' },
    ],
  },
  {
    id: 'j5',
    client: 'Школа №34',
    object: 'Спортивный зал',
    engineer: 'Петров А.В.',
    date: '13.05.2026',
    template: 'Оценка качества обслуживания',
    status: 'pending',
    avgScore: null,
    answers: [],
  },
  {
    id: 'j6',
    client: 'ООО «СтройГрупп»',
    object: 'Офис, ул. Садовая, 78',
    engineer: 'Иванов К.С.',
    date: '12.05.2026',
    template: 'Обследование объекта',
    status: 'filled',
    avgScore: 4.5,
    answers: [
      { question: 'Тип помещения', answer: 'Офис' },
      { question: 'Площадь', answer: '320 кв. м' },
      { question: 'Трудоёмкость монтажа', answer: 'Сложный' },
    ],
  },
  {
    id: 'j7',
    client: 'Клиника «МедЦентр»',
    object: 'Операционный блок',
    engineer: 'Козлов Д.Р.',
    date: '10.05.2026',
    template: 'Анкета удовлетворённости',
    status: 'overdue',
    avgScore: null,
    answers: [],
  },
  {
    id: 'j8',
    client: 'Ресторан «Арагви»',
    object: 'Кухня и зал',
    engineer: 'Смирнов Е.А.',
    date: '09.05.2026',
    template: 'Проверка оборудования (ТО)',
    status: 'filled',
    avgScore: 4.6,
    answers: [
      { question: 'Состояние фильтров', answer: 'Загрязнены — промыты' },
      { question: 'Давление хладагента', answer: '1.9 МПа' },
      { question: 'Итоговая оценка', answer: '5/5' },
    ],
  },
  {
    id: 'j9',
    client: 'ТЦ «Меркурий»',
    object: 'Серверная комната',
    engineer: 'Петров А.В.',
    date: '08.05.2026',
    template: 'Диагностика кондиционера',
    status: 'filled',
    avgScore: null,
    answers: [
      { question: 'Код ошибки', answer: 'E3' },
      { question: 'Предварительный диагноз', answer: 'Утечка хладагента' },
      { question: 'Рекомендуемые работы', answer: 'Поиск и устранение утечки, дозаправка R-410A' },
    ],
  },
  {
    id: 'j10',
    client: 'Банк «Региональный»',
    object: 'Дополнительный офис, ул. Пушкина 5',
    engineer: 'Иванов К.С.',
    date: '07.05.2026',
    template: 'Оценка качества обслуживания',
    status: 'filled',
    avgScore: 4.9,
    answers: [
      { question: 'Оцените вежливость инженера', answer: '5/5' },
      { question: 'Скорость решения проблемы', answer: '5/5' },
      { question: 'Общая оценка', answer: '5/5' },
      { question: 'Комментарий', answer: 'Отличный специалист!' },
    ],
  },
];

const MONTHLY_SCORES = [
  { month: 'Дек', avg: 4.3, count: 18 },
  { month: 'Янв', avg: 4.5, count: 22 },
  { month: 'Фев', avg: 4.4, count: 19 },
  { month: 'Мар', avg: 4.6, count: 31 },
  { month: 'Апр', avg: 4.7, count: 28 },
  { month: 'Май', avg: 4.8, count: 24 },
];

const REQUEST_TYPES = [
  { name: 'ТО (плановое)', value: 38, color: '#3b82f6' },
  { name: 'Ремонт', value: 27, color: '#f59e0b' },
  { name: 'Монтаж', value: 18, color: '#10b981' },
  { name: 'Диагностика', value: 11, color: '#8b5cf6' },
  { name: 'Гарантия', value: 6, color: '#ef4444' },
];

const TOP_COMPLAINTS = [
  { text: 'Долгое ожидание инженера', count: 14 },
  { text: 'Высокая стоимость работ', count: 9 },
  { text: 'Повторное обращение по той же проблеме', count: 6 },
];

// ─── Helper components ────────────────────────────────────────────────────────

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  text: 'Текст',
  rating: 'Оценка 1–5',
  single: 'Один ответ',
  multi: 'Несколько ответов',
  photo: 'Фото',
};

const QUESTION_TYPE_ICONS: Record<QuestionType, string> = {
  text: 'AlignLeft',
  rating: 'Star',
  single: 'CircleDot',
  multi: 'CheckSquare',
  photo: 'Camera',
};

function StatusBadge({ status }: { status: SurveyStatus | JournalStatus }) {
  const map: Record<string, { label: string; class: string }> = {
    active: { label: 'Активный', class: 'bg-green-100 text-green-700' },
    draft: { label: 'Черновик', class: 'bg-gray-100 text-gray-600' },
    filled: { label: 'Заполнена', class: 'bg-blue-100 text-blue-700' },
    pending: { label: 'Ожидает', class: 'bg-yellow-100 text-yellow-700' },
    overdue: { label: 'Просрочена', class: 'bg-red-100 text-red-700' },
  };
  const cfg = map[status] ?? { label: status, class: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cfg.class}`}>
      {cfg.label}
    </span>
  );
}

function TypeBadge({ type }: { type: TemplateType }) {
  return type === 'client' ? (
    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-xs">Клиентская</Badge>
  ) : (
    <Badge className="bg-cyan-100 text-cyan-700 hover:bg-cyan-100 text-xs">Техническая</Badge>
  );
}

function StarScore({ score }: { score: number }) {
  return (
    <span className="flex items-center gap-1 text-sm font-semibold text-amber-500">
      <Icon name="Star" size={14} className="fill-amber-400 text-amber-400" />
      {score.toFixed(1)}
    </span>
  );
}

// ─── Mobile preview ───────────────────────────────────────────────────────────

function MobilePreview({ template }: { template: SurveyTemplate }) {
  return (
    <div className="flex flex-col items-center">
      <p className="mb-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Предпросмотр</p>
      <div
        className="relative bg-gray-900 rounded-[2rem] p-2 shadow-2xl"
        style={{ width: 220, minHeight: 420 }}
      >
        {/* notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-gray-800 rounded-full z-10" />
        <div className="bg-white rounded-[1.5rem] overflow-hidden" style={{ minHeight: 400 }}>
          {/* header */}
          <div className="bg-blue-600 px-3 py-4 pt-6">
            <p className="text-white text-xs font-semibold leading-tight">{template.name}</p>
            <p className="text-blue-200 text-[10px] mt-0.5">{template.questionCount} вопросов</p>
          </div>
          {/* questions preview */}
          <div className="p-3 space-y-3 overflow-y-auto" style={{ maxHeight: 300 }}>
            {template.questions.slice(0, 4).map((q, i) => (
              <div key={q.id} className="border border-gray-100 rounded-lg p-2">
                <p className="text-[9px] text-gray-500 mb-1">Вопрос {i + 1}</p>
                <p className="text-[10px] font-medium text-gray-800 leading-tight">{q.text}</p>
                <div className="mt-1.5">
                  {q.type === 'rating' && (
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <div key={n} className="w-4 h-4 rounded-full border border-amber-300 bg-amber-50 flex items-center justify-center">
                          <span className="text-[7px] text-amber-600">{n}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {q.type === 'text' && (
                    <div className="h-5 bg-gray-100 rounded border border-gray-200" />
                  )}
                  {(q.type === 'single' || q.type === 'multi') && (
                    <div className="space-y-0.5">
                      {(q.options ?? []).slice(0, 2).map((opt) => (
                        <div key={opt} className="flex items-center gap-1">
                          <div className={`w-2.5 h-2.5 border border-gray-300 ${q.type === 'single' ? 'rounded-full' : 'rounded'}`} />
                          <span className="text-[8px] text-gray-600">{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {q.type === 'photo' && (
                    <div className="flex items-center gap-1 text-[8px] text-blue-500">
                      <Icon name="Camera" size={8} />
                      Добавить фото
                    </div>
                  )}
                </div>
              </div>
            ))}
            {template.questions.length > 4 && (
              <p className="text-center text-[9px] text-gray-400">+ ещё {template.questions.length - 4} вопроса</p>
            )}
            <button className="w-full bg-blue-600 text-white text-[10px] py-1.5 rounded-lg font-medium">
              Отправить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Question editor row ──────────────────────────────────────────────────────

interface QuestionRowProps {
  question: Question;
  index: number;
  onTypeChange: (id: string, type: QuestionType) => void;
  onTextChange: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

function QuestionRow({ question, index, onTypeChange, onTextChange, onDelete }: QuestionRowProps) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3 group">
      {/* drag handle */}
      <div className="mt-1 cursor-grab text-gray-300 group-hover:text-gray-400">
        <Icon name="GripVertical" size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-400 w-4 shrink-0">{index + 1}.</span>
          <input
            className="flex-1 text-sm text-gray-800 bg-transparent border-b border-dashed border-gray-300 focus:border-blue-400 outline-none pb-0.5"
            value={question.text}
            onChange={(e) => onTextChange(question.id, e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((t) => (
            <button
              key={t}
              onClick={() => onTypeChange(question.id, t)}
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                question.type === t
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Icon name={QUESTION_TYPE_ICONS[t] as never} size={10} />
              {QUESTION_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={() => onDelete(question.id)}
        className="mt-1 text-gray-300 hover:text-red-400 transition-colors"
      >
        <Icon name="X" size={14} />
      </button>
    </div>
  );
}

// ─── Template Card ─────────────────────────────────────────────────────────────

interface TemplateCardProps {
  template: SurveyTemplate;
  selected: boolean;
  onEdit: () => void;
  onSend: () => void;
  onDuplicate: () => void;
}

function TemplateCard({ template, selected, onEdit, onSend, onDuplicate }: TemplateCardProps) {
  return (
    <div
      className={`rounded-2xl border p-4 cursor-pointer transition-all ${
        selected
          ? 'border-blue-400 bg-blue-50/40 shadow-md'
          : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
      }`}
      onClick={onEdit}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm leading-tight">{template.name}</p>
          <p className="text-xs text-gray-400 mt-0.5 leading-tight">{template.description}</p>
        </div>
        <StatusBadge status={template.status} />
      </div>

      <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Icon name="HelpCircle" size={12} />
          {template.questionCount} вопросов
        </span>
        <span className="flex items-center gap-1">
          <Icon name="ClipboardCheck" size={12} />
          {template.filledCount} заполнений
        </span>
        <TypeBadge type={template.type} />
      </div>

      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs px-2 gap-1"
          onClick={onEdit}
        >
          <Icon name="Pencil" size={11} />
          Редактировать
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs px-2 gap-1"
          onClick={onSend}
        >
          <Icon name="Send" size={11} />
          Отправить
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs px-2 gap-1 text-gray-500"
          onClick={onDuplicate}
        >
          <Icon name="Copy" size={11} />
          Дублировать
        </Button>
      </div>
    </div>
  );
}

// ─── Survey Editor Panel ───────────────────────────────────────────────────────

interface EditorPanelProps {
  template: SurveyTemplate;
  onClose: () => void;
  onSave: (updated: SurveyTemplate) => void;
}

function EditorPanel({ template, onClose, onSave }: EditorPanelProps) {
  const [name, setName] = useState(template.name);
  const [questions, setQuestions] = useState<Question[]>(template.questions);
  const [showPreview, setShowPreview] = useState(false);

  const handleTypeChange = (id: string, type: QuestionType) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, type } : q)));
  };

  const handleTextChange = (id: string, text: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, text } : q)));
  };

  const handleDelete = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleAddQuestion = () => {
    const newQ: Question = {
      id: `q${Date.now()}`,
      text: 'Новый вопрос',
      type: 'text',
      required: false,
    };
    setQuestions((prev) => [...prev, newQ]);
  };

  const handleSave = () => {
    onSave({ ...template, name, questions, questionCount: questions.length });
    toast.success('Шаблон сохранён');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Icon name="ChevronLeft" size={18} />
          </button>
          <h3 className="font-semibold text-gray-800">Конструктор анкеты</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Icon name="Smartphone" size={12} />
            {showPreview ? 'Скрыть' : 'Предпросмотр'}
          </Button>
          <Button size="sm" className="h-7 text-xs gap-1 bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
            <Icon name="Save" size={12} />
            Сохранить
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Editor */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Template name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Название анкеты</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-sm"
              placeholder="Введите название анкеты..."
            />
          </div>

          {/* Questions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-600">
                Вопросы ({questions.length})
              </label>
            </div>
            <div className="space-y-2">
              {questions.map((q, i) => (
                <QuestionRow
                  key={q.id}
                  question={q}
                  index={i}
                  onTypeChange={handleTypeChange}
                  onTextChange={handleTextChange}
                  onDelete={handleDelete}
                />
              ))}
            </div>
            <button
              onClick={handleAddQuestion}
              className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-2.5 text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
            >
              <Icon name="Plus" size={15} />
              Добавить вопрос
            </button>
          </div>
        </div>

        {/* Preview pane */}
        {showPreview && (
          <div className="w-56 shrink-0 border-l border-gray-100 overflow-y-auto py-5 px-3 bg-gray-50/50">
            <MobilePreview template={{ ...template, name, questions, questionCount: questions.length }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Journal Entry Row ────────────────────────────────────────────────────────

function JournalRow({ entry }: { entry: JournalEntry }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <Icon
              name={expanded ? 'ChevronDown' : 'ChevronRight'}
              size={14}
              className="text-gray-400 shrink-0"
            />
            <div>
              <p className="text-sm font-medium text-gray-800">{entry.client}</p>
              <p className="text-xs text-gray-400">{entry.object}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">{entry.engineer}</td>
        <td className="px-4 py-3 text-sm text-gray-500">{entry.date}</td>
        <td className="px-4 py-3 text-xs text-gray-500">{entry.template}</td>
        <td className="px-4 py-3">
          <StatusBadge status={entry.status} />
        </td>
        <td className="px-4 py-3">
          {entry.avgScore !== null ? (
            <StarScore score={entry.avgScore} />
          ) : (
            <span className="text-xs text-gray-400">—</span>
          )}
        </td>
      </tr>
      {expanded && entry.answers.length > 0 && (
        <tr>
          <td colSpan={6} className="px-4 pb-3">
            <div className="ml-6 bg-blue-50/50 border border-blue-100 rounded-xl p-3 space-y-2">
              <p className="text-xs font-semibold text-gray-600 mb-2">Ответы</p>
              {entry.answers.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-xs text-gray-400 shrink-0 mt-0.5">{i + 1}.</span>
                  <div>
                    <p className="text-xs text-gray-500">{a.question}</p>
                    <p className="text-xs font-medium text-gray-800">{a.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Charts ───────────────────────────────────────────────────────────────────

function ScoreBarChart() {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={MONTHLY_SCORES} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis domain={[3.5, 5]} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          formatter={(v: number) => [v.toFixed(1), 'Средняя оценка']}
        />
        <Bar dataKey="avg" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function TypePieChart() {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <PieChart>
        <Pie
          data={REQUEST_TYPES}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={68}
          paddingAngle={2}
        >
          {REQUEST_TYPES.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
          formatter={(v: number) => [`${v}%`, '']}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── Stats Footer ─────────────────────────────────────────────────────────────

function StatsFooter() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Итоговая статистика</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* NPS */}
        <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-100 p-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
            <Icon name="TrendingUp" size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-700">78</p>
            <p className="text-xs text-green-600">Средний NPS клиентов</p>
          </div>
        </div>

        {/* Response rate */}
        <div className="flex items-center gap-3 rounded-xl bg-blue-50 border border-blue-100 p-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <Icon name="BarChart2" size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-700">67%</p>
            <p className="text-xs text-blue-600">Процент ответивших</p>
          </div>
        </div>

        {/* Top complaints */}
        <div className="rounded-xl bg-orange-50 border border-orange-100 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
              <Icon name="MessageCircleWarning" size={14} className="text-orange-600" />
            </div>
            <p className="text-xs font-semibold text-orange-700">Частые жалобы</p>
          </div>
          <ol className="space-y-1">
            {TOP_COMPLAINTS.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-orange-800">
                <span className="font-bold text-orange-500 shrink-0">{i + 1}.</span>
                <span>{c.text}</span>
                <span className="ml-auto shrink-0 font-semibold">{c.count}x</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SurveyModuleFull() {
  const [activeTab, setActiveTab] = useState<'templates' | 'journal'>('templates');
  const [templates, setTemplates] = useState<SurveyTemplate[]>(TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) ?? null;

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSend = (template: SurveyTemplate) => {
    toast.success(`Анкета «${template.name}» отправлена клиенту`);
  };

  const handleDuplicate = (template: SurveyTemplate) => {
    const copy: SurveyTemplate = {
      ...template,
      id: `t${Date.now()}`,
      name: `${template.name} (копия)`,
      status: 'draft',
      filledCount: 0,
    };
    setTemplates((prev) => [...prev, copy]);
    toast.success('Шаблон продублирован');
  };

  const handleSaveTemplate = (updated: SurveyTemplate) => {
    setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTemplateId(null);
  };

  const filledCount = JOURNAL_ENTRIES.filter((e) => e.status === 'filled').length;
  const pendingCount = JOURNAL_ENTRIES.filter((e) => e.status === 'pending').length;
  const overdueCount = JOURNAL_ENTRIES.filter((e) => e.status === 'overdue').length;
  const avgNps = (
    JOURNAL_ENTRIES.filter((e) => e.avgScore !== null).reduce((s, e) => s + (e.avgScore ?? 0), 0) /
    JOURNAL_ENTRIES.filter((e) => e.avgScore !== null).length
  ).toFixed(1);

  return (
    <div className="flex flex-col gap-5 p-5 bg-gray-50/50 min-h-screen">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Анкетирование</h1>
          <p className="text-sm text-gray-500">Шаблоны опросов и журнал заполненных анкет</p>
        </div>

        {/* NPS badge */}
        <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2">
          <Icon name="Star" size={18} className="text-amber-500 fill-amber-400" />
          <div>
            <p className="text-xs text-amber-600 font-medium">Средний рейтинг NPS</p>
            <p className="text-xl font-bold text-amber-700 leading-none">{avgNps} / 5.0</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'templates' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Icon name="LayoutTemplate" size={15} />
          Шаблоны
          <span className="rounded-full bg-blue-100 text-blue-600 text-xs px-1.5 py-0.5">
            {templates.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('journal')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'journal' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Icon name="ClipboardList" size={15} />
          Журнал анкет
          {overdueCount > 0 && (
            <span className="rounded-full bg-red-100 text-red-600 text-xs px-1.5 py-0.5">
              {overdueCount}
            </span>
          )}
        </button>
      </div>

      {/* ── TEMPLATES TAB ── */}
      {activeTab === 'templates' && (
        <div className="flex gap-5 min-h-0">
          {/* Left: template list */}
          <div className="flex flex-col gap-4 flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-9 h-8 text-sm"
                  placeholder="Поиск шаблонов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                size="sm"
                className="h-8 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  const newT: SurveyTemplate = {
                    id: `t${Date.now()}`,
                    name: 'Новая анкета',
                    type: 'client',
                    questionCount: 0,
                    status: 'draft',
                    filledCount: 0,
                    description: 'Описание анкеты',
                    questions: [],
                  };
                  setTemplates((prev) => [...prev, newT]);
                  setSelectedTemplateId(newT.id);
                  toast.success('Новый шаблон создан');
                }}
              >
                <Icon name="Plus" size={13} />
                Новая анкета
              </Button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filteredTemplates.map((tpl) => (
                <TemplateCard
                  key={tpl.id}
                  template={tpl}
                  selected={selectedTemplateId === tpl.id}
                  onEdit={() => setSelectedTemplateId(tpl.id)}
                  onSend={() => handleSend(tpl)}
                  onDuplicate={() => handleDuplicate(tpl)}
                />
              ))}
              {filteredTemplates.length === 0 && (
                <div className="col-span-2 py-12 text-center text-gray-400 text-sm">
                  <Icon name="FileSearch" size={32} className="mx-auto mb-2 opacity-30" />
                  Шаблоны не найдены
                </div>
              )}
            </div>
          </div>

          {/* Right: editor panel */}
          {selectedTemplate && (
            <div className="w-[480px] shrink-0 rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col overflow-hidden">
              <EditorPanel
                template={selectedTemplate}
                onClose={() => setSelectedTemplateId(null)}
                onSave={handleSaveTemplate}
              />
            </div>
          )}
        </div>
      )}

      {/* ── JOURNAL TAB ── */}
      {activeTab === 'journal' && (
        <div className="flex flex-col gap-5">
          {/* KPI summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Всего анкет', value: JOURNAL_ENTRIES.length, icon: 'ClipboardList', color: 'blue' },
              { label: 'Заполнены', value: filledCount, icon: 'CheckCircle2', color: 'green' },
              { label: 'Ожидают', value: pendingCount, icon: 'Clock', color: 'yellow' },
              { label: 'Просрочены', value: overdueCount, icon: 'AlertCircle', color: 'red' },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`rounded-2xl border p-4 bg-${stat.color}-50 border-${stat.color}-100 flex items-center gap-3`}
              >
                <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 flex items-center justify-center shrink-0`}>
                  <Icon name={stat.icon as never} size={18} className={`text-${stat.color}-600`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold text-${stat.color}-700`}>{stat.value}</p>
                  <p className={`text-xs text-${stat.color}-600`}>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Оценки по месяцам</h3>
              <ScoreBarChart />
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Типы обращений</h3>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <TypePieChart />
                </div>
                <div className="space-y-1.5">
                  {REQUEST_TYPES.map((t) => (
                    <div key={t.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: t.color }}
                      />
                      {t.name}
                      <span className="ml-auto font-medium text-gray-700">{t.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Journal table */}
          <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Заполненные анкеты</h3>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                <Icon name="Download" size={12} />
                Экспорт
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/60">
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Клиент / Объект</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Инженер</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Дата</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Шаблон</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Статус</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Оценка</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {JOURNAL_ENTRIES.map((entry) => (
                    <JournalRow key={entry.id} entry={entry} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stats footer */}
          <StatsFooter />
        </div>
      )}
    </div>
  );
}
