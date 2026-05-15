import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Star,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  LayoutGrid,
  List,
} from 'lucide-react';

type LeadSource = 'Avito' | 'Telegram' | 'Website' | 'Referral' | 'Cold Call' | 'Instagram';
type LeadStage = 'lead' | 'qualification' | 'proposal' | 'negotiation' | 'won' | 'lost';

interface ScoreBreakdown {
  budget: number;
  urgency: number;
  authority: number;
  fit: number;
}

interface Lead {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  source: LeadSource;
  stage: LeadStage;
  score: number;
  budget: number;
  probability: number;
  assignedTo: string;
  createdAt: string;
  nextAction: string;
  nextActionDate: string;
  tags: string[];
  scoreBreakdown: ScoreBreakdown;
}

const LEADS: Lead[] = [
  {
    id: '1',
    name: 'ТЦ Планета',
    contact: 'Сергей Воронов',
    phone: '+7 (495) 123-45-67',
    email: 's.voronov@planeta.ru',
    source: 'Referral',
    stage: 'negotiation',
    score: 88,
    budget: 480000,
    probability: 75,
    assignedTo: 'Анна Козлова',
    createdAt: '2026-04-01',
    nextAction: 'Согласовать договор',
    nextActionDate: '2026-05-20',
    tags: ['VIP', 'Крупный'],
    scoreBreakdown: { budget: 23, urgency: 22, authority: 24, fit: 19 },
  },
  {
    id: '2',
    name: 'Бизнес-центр Орион',
    contact: 'Марина Лебедева',
    phone: '+7 (495) 234-56-78',
    email: 'm.lebedeva@orion-bc.ru',
    source: 'Website',
    stage: 'proposal',
    score: 74,
    budget: 320000,
    probability: 55,
    assignedTo: 'Дмитрий Соколов',
    createdAt: '2026-04-08',
    nextAction: 'Презентация КП',
    nextActionDate: '2026-05-18',
    tags: ['Офис'],
    scoreBreakdown: { budget: 18, urgency: 20, authority: 20, fit: 16 },
  },
  {
    id: '3',
    name: 'Сеть кофеен Бодрость',
    contact: 'Алексей Громов',
    phone: '+7 (926) 345-67-89',
    email: 'a.gromov@bodrost.ru',
    source: 'Telegram',
    stage: 'qualification',
    score: 61,
    budget: 240000,
    probability: 40,
    assignedTo: 'Анна Козлова',
    createdAt: '2026-04-15',
    nextAction: 'Уточнить объём работ',
    nextActionDate: '2026-05-16',
    tags: ['HoReCa', 'Сеть'],
    scoreBreakdown: { budget: 14, urgency: 16, authority: 18, fit: 13 },
  },
  {
    id: '4',
    name: 'Склад Логистик Про',
    contact: 'Павел Орлов',
    phone: '+7 (903) 456-78-90',
    email: 'p.orlov@logpro.ru',
    source: 'Avito',
    stage: 'lead',
    score: 42,
    budget: 180000,
    probability: 20,
    assignedTo: 'Дмитрий Соколов',
    createdAt: '2026-04-22',
    nextAction: 'Первый звонок',
    nextActionDate: '2026-05-15',
    tags: ['Склад'],
    scoreBreakdown: { budget: 10, urgency: 12, authority: 11, fit: 9 },
  },
  {
    id: '5',
    name: 'Ресторан Панорама',
    contact: 'Ольга Семёнова',
    phone: '+7 (916) 567-89-01',
    email: 'o.semenova@panorama.ru',
    source: 'Instagram',
    stage: 'qualification',
    score: 55,
    budget: 160000,
    probability: 35,
    assignedTo: 'Анна Козлова',
    createdAt: '2026-04-18',
    nextAction: 'Выезд на объект',
    nextActionDate: '2026-05-17',
    tags: ['HoReCa'],
    scoreBreakdown: { budget: 12, urgency: 15, authority: 16, fit: 12 },
  },
  {
    id: '6',
    name: 'Завод Техмаш',
    contact: 'Виктор Кузнецов',
    phone: '+7 (495) 678-90-12',
    email: 'v.kuznetsov@techmash.ru',
    source: 'Cold Call',
    stage: 'won',
    score: 91,
    budget: 750000,
    probability: 100,
    assignedTo: 'Дмитрий Соколов',
    createdAt: '2026-03-10',
    nextAction: 'Подписать акт',
    nextActionDate: '2026-05-22',
    tags: ['Промышленность', 'VIP'],
    scoreBreakdown: { budget: 25, urgency: 24, authority: 23, fit: 19 },
  },
  {
    id: '7',
    name: 'Клиника Здоровье',
    contact: 'Наталья Иванова',
    phone: '+7 (495) 789-01-23',
    email: 'n.ivanova@zdravo.ru',
    source: 'Referral',
    stage: 'proposal',
    score: 79,
    budget: 290000,
    probability: 60,
    assignedTo: 'Анна Козлова',
    createdAt: '2026-04-05',
    nextAction: 'Ответить на вопросы по КП',
    nextActionDate: '2026-05-19',
    tags: ['Медицина'],
    scoreBreakdown: { budget: 19, urgency: 21, authority: 22, fit: 17 },
  },
  {
    id: '8',
    name: 'ИП Морозов',
    contact: 'Степан Морозов',
    phone: '+7 (926) 890-12-34',
    email: 's.morozov@mail.ru',
    source: 'Avito',
    stage: 'lost',
    score: 28,
    budget: 45000,
    probability: 0,
    assignedTo: 'Дмитрий Соколов',
    createdAt: '2026-04-12',
    nextAction: 'Закрыт',
    nextActionDate: '2026-05-01',
    tags: ['Частный'],
    scoreBreakdown: { budget: 6, urgency: 8, authority: 7, fit: 7 },
  },
  {
    id: '9',
    name: 'Отель Центральный',
    contact: 'Евгений Петров',
    phone: '+7 (495) 901-23-45',
    email: 'e.petrov@hotel-c.ru',
    source: 'Website',
    stage: 'negotiation',
    score: 83,
    budget: 520000,
    probability: 70,
    assignedTo: 'Анна Козлова',
    createdAt: '2026-03-25',
    nextAction: 'Финальные условия договора',
    nextActionDate: '2026-05-21',
    tags: ['Гостиница', 'VIP'],
    scoreBreakdown: { budget: 22, urgency: 21, authority: 21, fit: 19 },
  },
  {
    id: '10',
    name: 'Фитнес-клуб Атлет',
    contact: 'Юлия Смирнова',
    phone: '+7 (903) 012-34-56',
    email: 'y.smirnova@atlet.ru',
    source: 'Instagram',
    stage: 'lead',
    score: 37,
    budget: 120000,
    probability: 15,
    assignedTo: 'Дмитрий Соколов',
    createdAt: '2026-05-02',
    nextAction: 'Отправить прайс',
    nextActionDate: '2026-05-16',
    tags: ['Спорт'],
    scoreBreakdown: { budget: 9, urgency: 10, authority: 10, fit: 8 },
  },
  {
    id: '11',
    name: 'Управляющая компания ЖКХ',
    contact: 'Борис Николаев',
    phone: '+7 (916) 123-45-67',
    email: 'b.nikolaev@uk-jkh.ru',
    source: 'Cold Call',
    stage: 'qualification',
    score: 66,
    budget: 380000,
    probability: 45,
    assignedTo: 'Анна Козлова',
    createdAt: '2026-04-20',
    nextAction: 'Встреча с руководством',
    nextActionDate: '2026-05-23',
    tags: ['ЖКХ', 'Гос'],
    scoreBreakdown: { budget: 17, urgency: 17, authority: 16, fit: 16 },
  },
  {
    id: '12',
    name: 'Супермаркет Свежесть',
    contact: 'Ирина Волкова',
    phone: '+7 (495) 234-56-78',
    email: 'i.volkova@svejest.ru',
    source: 'Telegram',
    stage: 'proposal',
    score: 71,
    budget: 210000,
    probability: 50,
    assignedTo: 'Дмитрий Соколов',
    createdAt: '2026-04-28',
    nextAction: 'Уточнить сроки',
    nextActionDate: '2026-05-18',
    tags: ['Ритейл'],
    scoreBreakdown: { budget: 16, urgency: 18, authority: 19, fit: 18 },
  },
];

const STAGE_LABELS: Record<LeadStage, string> = {
  lead: 'Лид',
  qualification: 'Квалификация',
  proposal: 'КП',
  negotiation: 'Переговоры',
  won: 'Сделка',
  lost: 'Отказ',
};

const STAGE_COLORS: Record<LeadStage, string> = {
  lead: 'bg-gray-100 border-gray-300',
  qualification: 'bg-blue-50 border-blue-300',
  proposal: 'bg-purple-50 border-purple-300',
  negotiation: 'bg-amber-50 border-amber-300',
  won: 'bg-green-50 border-green-300',
  lost: 'bg-red-50 border-red-300',
};

const STAGE_HEADER_COLORS: Record<LeadStage, string> = {
  lead: 'bg-gray-500',
  qualification: 'bg-blue-500',
  proposal: 'bg-purple-500',
  negotiation: 'bg-amber-500',
  won: 'bg-green-500',
  lost: 'bg-red-500',
};

const SOURCE_COLORS: Record<LeadSource, string> = {
  Avito: 'bg-teal-100 text-teal-700',
  Telegram: 'bg-blue-100 text-blue-700',
  Website: 'bg-indigo-100 text-indigo-700',
  Referral: 'bg-purple-100 text-purple-700',
  'Cold Call': 'bg-orange-100 text-orange-700',
  Instagram: 'bg-pink-100 text-pink-700',
};

const HISTORY_ITEMS = [
  { date: '12 мая 2026', text: 'Отправлено коммерческое предложение', type: 'proposal' },
  { date: '08 мая 2026', text: 'Проведена встреча на объекте', type: 'meeting' },
  { date: '03 мая 2026', text: 'Первичный контакт установлен', type: 'call' },
];

function scoreColor(score: number): string {
  if (score >= 70) return 'bg-green-100 text-green-700';
  if (score >= 50) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}

function scoreBg(score: number): string {
  if (score >= 70) return 'bg-green-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function formatBudget(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}М ₽`;
  if (n >= 1000) return `${Math.round(n / 1000)}к ₽`;
  return `${n} ₽`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

const ALL_STAGES: LeadStage[] = ['lead', 'qualification', 'proposal', 'negotiation', 'won', 'lost'];

export default function LeadScoring() {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  const selected = LEADS.find((l) => l.id === selectedLead) ?? null;

  const totalPipeline = LEADS.filter((l) => l.stage !== 'lost').reduce(
    (s, l) => s + l.budget,
    0
  );
  const avgScore = Math.round(LEADS.reduce((s, l) => s + l.score, 0) / LEADS.length);
  const wonRate = Math.round(
    (LEADS.filter((l) => l.stage === 'won').length / LEADS.length) * 100
  );

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Лиды и скоринг</h1>
            <p className="text-sm text-gray-500">
              Управление воронкой продаж · (перетащите для изменения этапа)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setView('kanban')}
              className={`px-3 py-2 flex items-center gap-1.5 text-sm transition-colors ${
                view === 'kanban' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Канбан
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-2 flex items-center gap-1.5 text-sm transition-colors ${
                view === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List className="w-4 h-4" />
              Список
            </button>
          </div>
        </div>
      </div>

      {/* KPI Bar */}
      <div className="bg-white border-b px-6 py-3 grid grid-cols-4 divide-x">
        <div className="px-4 first:pl-0 flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">{LEADS.length}</div>
            <div className="text-xs text-gray-500">Всего лидов</div>
          </div>
        </div>
        <div className="px-4 flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <DollarSign className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">
              {totalPipeline.toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-xs text-gray-500">Объём воронки</div>
          </div>
        </div>
        <div className="px-4 flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg">
            <Star className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">{avgScore}</div>
            <div className="text-xs text-gray-500">Средний скор</div>
          </div>
        </div>
        <div className="px-4 flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Target className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">{wonRate}%</div>
            <div className="text-xs text-gray-500">Конверсия в сделки</div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Kanban / List */}
        <div className="flex-1 overflow-auto p-4">
          {view === 'kanban' ? (
            <div className="flex gap-3 h-full min-w-max">
              {ALL_STAGES.map((stage) => {
                const stageLeads = LEADS.filter((l) => l.stage === stage);
                return (
                  <div key={stage} className="flex flex-col w-64 shrink-0">
                    <div
                      className={`${STAGE_HEADER_COLORS[stage]} text-white px-3 py-2 rounded-t-lg flex items-center justify-between`}
                    >
                      <span className="font-medium text-sm">{STAGE_LABELS[stage]}</span>
                      <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                        {stageLeads.length}
                      </span>
                    </div>
                    <div
                      className={`flex-1 overflow-y-auto border-l border-r border-b ${STAGE_COLORS[stage]} rounded-b-lg space-y-2 p-2`}
                    >
                      {stageLeads.map((lead) => (
                        <div
                          key={lead.id}
                          onClick={() => setSelectedLead(lead.id === selectedLead ? null : lead.id)}
                          className={`bg-white rounded-lg p-3 shadow-sm border cursor-pointer hover:shadow-md transition-shadow ${
                            selectedLead === lead.id ? 'ring-2 ring-blue-400' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="font-medium text-sm text-gray-900 leading-tight">
                              {lead.name}
                            </div>
                            <span
                              className={`text-xs font-bold px-1.5 py-0.5 rounded ${scoreColor(lead.score)}`}
                            >
                              {lead.score}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mb-2">{lead.contact}</div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-800">
                              {formatBudget(lead.budget)}
                            </span>
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded-full ${SOURCE_COLORS[lead.source]}`}
                            >
                              {lead.source}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(lead.nextActionDate)}
                            </span>
                            <span className="text-green-600 font-medium">{lead.probability}%</span>
                          </div>
                          <div className="mt-2 pt-2 border-t flex items-center gap-1">
                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                              {initials(lead.assignedTo)}
                            </div>
                            <span className="text-xs text-gray-500 truncate">{lead.assignedTo}</span>
                          </div>
                        </div>
                      ))}
                      {stageLeads.length === 0 && (
                        <div className="text-xs text-gray-400 text-center py-6">Нет лидов</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Компания</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Контакт</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Источник</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Этап</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Скор</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Бюджет</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Вероятность</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Менеджер</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">След. действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {LEADS.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead.id === selectedLead ? null : lead.id)}
                      className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedLead === lead.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{lead.name}</td>
                      <td className="px-4 py-3">
                        <div className="text-gray-800">{lead.contact}</div>
                        <div className="text-xs text-gray-400">{lead.phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${SOURCE_COLORS[lead.source]}`}
                        >
                          {lead.source}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-gray-700">
                          {STAGE_LABELS[lead.stage]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full w-16">
                            <div
                              className={`h-1.5 rounded-full ${scoreBg(lead.score)}`}
                              style={{ width: `${lead.score}%` }}
                            />
                          </div>
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${scoreColor(lead.score)}`}>
                            {lead.score}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-800">
                        {formatBudget(lead.budget)}
                      </td>
                      <td className="px-4 py-3 text-right text-green-600 font-medium">
                        {lead.probability}%
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {initials(lead.assignedTo)}
                          </div>
                          <span className="text-xs text-gray-600 truncate max-w-[80px]">
                            {lead.assignedTo}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-600">{lead.nextAction}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {formatDate(lead.nextActionDate)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-80 bg-white border-l flex flex-col overflow-y-auto shrink-0">
            <div className="px-4 py-4 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">{selected.name}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{selected.contact}</p>
                </div>
                <span
                  className={`text-lg font-bold px-2 py-1 rounded-lg ${scoreColor(selected.score)}`}
                >
                  {selected.score}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <a
                  href={`tel:${selected.phone}`}
                  className="flex-1 flex items-center justify-center gap-1.5 text-sm border rounded-lg py-1.5 hover:bg-gray-50 text-gray-600"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Позвонить
                </a>
                <a
                  href={`mailto:${selected.email}`}
                  className="flex-1 flex items-center justify-center gap-1.5 text-sm border rounded-lg py-1.5 hover:bg-gray-50 text-gray-600"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Написать
                </a>
              </div>
            </div>

            {/* Score Breakdown (BANT) */}
            <div className="px-4 py-4 border-b">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Скоринг BANT</h3>
              {[
                { label: 'Бюджет (Budget)', value: selected.scoreBreakdown.budget, max: 25, color: 'bg-blue-500' },
                { label: 'Полномочия (Authority)', value: selected.scoreBreakdown.authority, max: 25, color: 'bg-purple-500' },
                { label: 'Потребность (Need)', value: selected.scoreBreakdown.urgency, max: 25, color: 'bg-green-500' },
                { label: 'Сроки (Timeline)', value: selected.scoreBreakdown.fit, max: 25, color: 'bg-amber-500' },
              ].map(({ label, value, max, color }) => (
                <div key={label} className="mb-2.5">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{label}</span>
                    <span className="font-medium">{value}/{max}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div
                      className={`h-2 rounded-full ${color}`}
                      style={{ width: `${(value / max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="mt-3 pt-3 border-t flex justify-between text-sm">
                <span className="font-medium text-gray-700">Итого</span>
                <span className={`font-bold ${scoreColor(selected.score)} px-2 py-0.5 rounded`}>
                  {selected.score}/100
                </span>
              </div>
            </div>

            {/* Next Action */}
            <div className="px-4 py-4 border-b">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Следующее действие</h3>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="text-sm text-amber-900 font-medium">{selected.nextAction}</div>
                <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(selected.nextActionDate)}
                </div>
              </div>
            </div>

            {/* History */}
            <div className="px-4 py-4 border-b flex-1">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">История</h3>
              <div className="space-y-3">
                {HISTORY_ITEMS.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                      {i < HISTORY_ITEMS.length - 1 && (
                        <div className="w-0.5 bg-gray-200 flex-1 mt-1" />
                      )}
                    </div>
                    <div className="pb-3">
                      <div className="text-xs font-medium text-gray-800">{item.text}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{item.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 py-4 space-y-2">
              <Button
                className="w-full"
                onClick={() => toast.success(`Лид "${selected.name}" конвертирован в клиента`)}
              >
                <ChevronRight className="w-4 h-4 mr-1" />
                Конвертировать в клиента
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => toast.success(`КП для "${selected.name}" создано`)}
              >
                <Target className="w-4 h-4 mr-1" />
                Создать КП
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
