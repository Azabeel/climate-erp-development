import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

type ViewMode = 'funnel' | 'kanban' | 'table';
type DealStage =
  | 'Лид'
  | 'Квалификация'
  | 'Встреча'
  | 'КП отправлено'
  | 'Переговоры'
  | 'Закрыта/Выиграна';
type LeadSource =
  | 'Сайт'
  | 'Telegram'
  | 'WhatsApp'
  | 'Avito'
  | 'Звонок'
  | 'Email'
  | 'Партнёр';
type Priority = 'high' | 'medium' | 'low';
type SortKey = 'amount' | 'date';
type SortDir = 'asc' | 'desc';

interface Lead {
  id: string;
  company: string;
  contact: string;
  phone: string;
  source: LeadSource;
  stage: DealStage;
  amount: number;
  manager: string;
  managerInitials: string;
  managerColor: string;
  addedDate: string;
  nextAction: string;
  nextActionDate: string;
}

interface Task {
  id: string;
  text: string;
  priority: Priority;
  deadline: string;
  done: boolean;
  lead: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const LEADS: Lead[] = [
  {
    id: '1',
    company: 'ТЦ «Гринвич»',
    contact: 'Романова Светлана Игоревна',
    phone: '+7 (343) 234-56-78',
    source: 'Звонок',
    stage: 'Лид',
    amount: 580000,
    manager: 'Петров А.С.',
    managerInitials: 'АП',
    managerColor: 'bg-blue-500',
    addedDate: '14.05.2026',
    nextAction: 'Первичный звонок',
    nextActionDate: '16.05.2026',
  },
  {
    id: '2',
    company: 'Завод «УралМаш»',
    contact: 'Сидоров Владимир Петрович',
    phone: '+7 (343) 345-67-89',
    source: 'Партнёр',
    stage: 'Лид',
    amount: 1240000,
    manager: 'Козлов Д.Н.',
    managerInitials: 'ДК',
    managerColor: 'bg-green-500',
    addedDate: '13.05.2026',
    nextAction: 'Отправить презентацию',
    nextActionDate: '15.05.2026',
  },
  {
    id: '3',
    company: 'Офисный центр «Башня»',
    contact: 'Новикова Марина Олеговна',
    phone: '+7 (495) 456-78-90',
    source: 'Сайт',
    stage: 'Лид',
    amount: 320000,
    manager: 'Смирнова О.В.',
    managerInitials: 'ОС',
    managerColor: 'bg-purple-500',
    addedDate: '12.05.2026',
    nextAction: 'Уточнить ТЗ',
    nextActionDate: '16.05.2026',
  },
  {
    id: '4',
    company: 'Гипермаркет «Лента»',
    contact: 'Фёдоров Игорь Анатольевич',
    phone: '+7 (812) 567-89-01',
    source: 'Email',
    stage: 'Квалификация',
    amount: 890000,
    manager: 'Петров А.С.',
    managerInitials: 'АП',
    managerColor: 'bg-blue-500',
    addedDate: '10.05.2026',
    nextAction: 'Провести квалификацию',
    nextActionDate: '15.05.2026',
  },
  {
    id: '5',
    company: 'Клиника «МедЭксперт»',
    contact: 'Белова Ольга Сергеевна',
    phone: '+7 (495) 678-90-12',
    source: 'Сайт',
    stage: 'Квалификация',
    amount: 450000,
    manager: 'Козлов Д.Н.',
    managerInitials: 'ДК',
    managerColor: 'bg-green-500',
    addedDate: '09.05.2026',
    nextAction: 'Выслать опросник',
    nextActionDate: '15.05.2026',
  },
  {
    id: '6',
    company: 'Отель «Marriott Екатеринбург»',
    contact: 'Крылов Антон Васильевич',
    phone: '+7 (343) 789-01-23',
    source: 'Партнёр',
    stage: 'Встреча',
    amount: 1680000,
    manager: 'Смирнова О.В.',
    managerInitials: 'ОС',
    managerColor: 'bg-purple-500',
    addedDate: '07.05.2026',
    nextAction: 'Провести обследование',
    nextActionDate: '17.05.2026',
  },
  {
    id: '7',
    company: 'Склад «Логистик-М»',
    contact: 'Зайцев Евгений Дмитриевич',
    phone: '+7 (495) 890-12-34',
    source: 'Avito',
    stage: 'Встреча',
    amount: 560000,
    manager: 'Петров А.С.',
    managerInitials: 'АП',
    managerColor: 'bg-blue-500',
    addedDate: '06.05.2026',
    nextAction: 'Замер помещений',
    nextActionDate: '18.05.2026',
  },
  {
    id: '8',
    company: 'Бизнес-центр «Сенатор»',
    contact: 'Морозова Татьяна Владимировна',
    phone: '+7 (812) 901-23-45',
    source: 'Звонок',
    stage: 'КП отправлено',
    amount: 740000,
    manager: 'Козлов Д.Н.',
    managerInitials: 'ДК',
    managerColor: 'bg-green-500',
    addedDate: '04.05.2026',
    nextAction: 'Follow-up по КП',
    nextActionDate: '16.05.2026',
  },
  {
    id: '9',
    company: 'Завод «ЭкспоМetal»',
    contact: 'Попов Сергей Николаевич',
    phone: '+7 (343) 012-34-56',
    source: 'Email',
    stage: 'КП отправлено',
    amount: 2100000,
    manager: 'Смирнова О.В.',
    managerInitials: 'ОС',
    managerColor: 'bg-purple-500',
    addedDate: '03.05.2026',
    nextAction: 'Ответить на вопросы',
    nextActionDate: '15.05.2026',
  },
  {
    id: '10',
    company: 'Ресторан «Золотой Дракон»',
    contact: 'Ли Александр Вэйович',
    phone: '+7 (495) 123-45-00',
    source: 'WhatsApp',
    stage: 'КП отправлено',
    amount: 280000,
    manager: 'Петров А.С.',
    managerInitials: 'АП',
    managerColor: 'bg-blue-500',
    addedDate: '02.05.2026',
    nextAction: 'Согласовать цену',
    nextActionDate: '17.05.2026',
  },
  {
    id: '11',
    company: 'ТЦ «Мегаполис»',
    contact: 'Соколов Юрий Игоревич',
    phone: '+7 (343) 234-00-11',
    source: 'Партнёр',
    stage: 'Переговоры',
    amount: 3400000,
    manager: 'Козлов Д.Н.',
    managerInitials: 'ДК',
    managerColor: 'bg-green-500',
    addedDate: '28.04.2026',
    nextAction: 'Финальные условия',
    nextActionDate: '15.05.2026',
  },
  {
    id: '12',
    company: 'Фармзавод «Медсинтез»',
    contact: 'Волкова Наталья Борисовна',
    phone: '+7 (343) 345-00-22',
    source: 'Сайт',
    stage: 'Переговоры',
    amount: 1950000,
    manager: 'Смирнова О.В.',
    managerInitials: 'ОС',
    managerColor: 'bg-purple-500',
    addedDate: '25.04.2026',
    nextAction: 'Подписание договора',
    nextActionDate: '20.05.2026',
  },
  {
    id: '13',
    company: 'Аэропорт «Кольцово»',
    contact: 'Алексеев Роман Юрьевич',
    phone: '+7 (343) 228-00-33',
    source: 'Звонок',
    stage: 'Закрыта/Выиграна',
    amount: 4800000,
    manager: 'Петров А.С.',
    managerInitials: 'АП',
    managerColor: 'bg-blue-500',
    addedDate: '15.04.2026',
    nextAction: 'Передать в производство',
    nextActionDate: '14.05.2026',
  },
  {
    id: '14',
    company: 'ООО «АрктикХолод»',
    contact: 'Тихонов Павел Семёнович',
    phone: '+7 (495) 456-00-44',
    source: 'Email',
    stage: 'Закрыта/Выиграна',
    amount: 670000,
    manager: 'Козлов Д.Н.',
    managerInitials: 'ДК',
    managerColor: 'bg-green-500',
    addedDate: '10.04.2026',
    nextAction: 'Подписать акт',
    nextActionDate: '13.05.2026',
  },
  {
    id: '15',
    company: 'Торговый дом «Алмаз»',
    contact: 'Григорьева Ирина Павловна',
    phone: '+7 (812) 567-00-55',
    source: 'Telegram',
    stage: 'Закрыта/Выиграна',
    amount: 1150000,
    manager: 'Смирнова О.В.',
    managerInitials: 'ОС',
    managerColor: 'bg-purple-500',
    addedDate: '05.04.2026',
    nextAction: 'Сервисный договор',
    nextActionDate: '20.05.2026',
  },
];

const INITIAL_TASKS: Task[] = [
  { id: '1', text: 'Позвонить ТЦ «Гринвич», уточнить бюджет', priority: 'high', deadline: '16.05.2026', done: false, lead: 'ТЦ «Гринвич»' },
  { id: '2', text: 'Отправить КП по Заводу «УралМаш»', priority: 'high', deadline: '15.05.2026', done: false, lead: 'Завод «УралМаш»' },
  { id: '3', text: 'Follow-up: ТЦ «Мегаполис» — ждут условий', priority: 'high', deadline: '15.05.2026', done: false, lead: 'ТЦ «Мегаполис»' },
  { id: '4', text: 'Ответить на вопросы по КП «ЭкспоMetal»', priority: 'high', deadline: '15.05.2026', done: false, lead: 'Завод «ЭкспоMetal»' },
  { id: '5', text: 'Записать на обследование отель Marriott', priority: 'medium', deadline: '17.05.2026', done: false, lead: 'Отель «Marriott»' },
  { id: '6', text: 'Согласовать цену с рестораном Золотой Дракон', priority: 'medium', deadline: '17.05.2026', done: false, lead: 'Ресторан «Золотой Дракон»' },
  { id: '7', text: 'Подготовить договор для Фармзавода', priority: 'medium', deadline: '19.05.2026', done: false, lead: 'Фармзавод «Медсинтез»' },
  { id: '8', text: 'Выслать опросник клинике МедЭксперт', priority: 'low', deadline: '18.05.2026', done: false, lead: 'Клиника «МедЭксперт»' },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const STAGES: { stage: DealStage; color: string; bgColor: string; borderColor: string; widthPct: number }[] = [
  { stage: 'Лид', color: 'text-blue-700', bgColor: 'bg-blue-500', borderColor: 'border-blue-500', widthPct: 100 },
  { stage: 'Квалификация', color: 'text-cyan-700', bgColor: 'bg-cyan-500', borderColor: 'border-cyan-500', widthPct: 81 },
  { stage: 'Встреча', color: 'text-violet-700', bgColor: 'bg-violet-500', borderColor: 'border-violet-500', widthPct: 51 },
  { stage: 'КП отправлено', color: 'text-orange-700', bgColor: 'bg-orange-500', borderColor: 'border-orange-500', widthPct: 38 },
  { stage: 'Переговоры', color: 'text-yellow-700', bgColor: 'bg-yellow-500', borderColor: 'border-yellow-500', widthPct: 23 },
  { stage: 'Закрыта/Выиграна', color: 'text-green-700', bgColor: 'bg-green-500', borderColor: 'border-green-500', widthPct: 17 },
];

const SOURCE_COLORS: Record<LeadSource, string> = {
  Сайт: 'bg-blue-100 text-blue-700',
  Telegram: 'bg-sky-100 text-sky-700',
  WhatsApp: 'bg-green-100 text-green-700',
  Avito: 'bg-purple-100 text-purple-700',
  Звонок: 'bg-orange-100 text-orange-700',
  Email: 'bg-yellow-100 text-yellow-700',
  Партнёр: 'bg-pink-100 text-pink-700',
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; dot: string }> = {
  high: { label: 'Высокий', color: 'text-red-600', dot: 'bg-red-500' },
  medium: { label: 'Средний', color: 'text-yellow-600', dot: 'bg-yellow-500' },
  low: { label: 'Низкий', color: 'text-green-600', dot: 'bg-green-500' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAmount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} млн ₽`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)} тыс. ₽`;
  return `${n.toLocaleString('ru-RU')} ₽`;
}

function leadsForStage(stage: DealStage): Lead[] {
  return LEADS.filter((l) => l.stage === stage);
}

function stageAmount(stage: DealStage): number {
  return leadsForStage(stage).reduce((s, l) => s + l.amount, 0);
}

const AVG_DAYS: Record<DealStage, number> = {
  'Лид': 3,
  'Квалификация': 5,
  'Встреча': 7,
  'КП отправлено': 9,
  'Переговоры': 14,
  'Закрыта/Выиграна': 0,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function KPICard({
  label,
  value,
  icon,
  trend,
  alert,
}: {
  label: string;
  value: string;
  icon: string;
  trend?: string;
  alert?: boolean;
}) {
  return (
    <div className={`bg-white rounded-xl border p-4 flex flex-col gap-1 ${alert ? 'border-red-300' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{label}</span>
        <Icon name={icon} size={16} className={alert ? 'text-red-500' : 'text-gray-400'} />
      </div>
      <span className={`text-2xl font-bold ${alert ? 'text-red-600' : 'text-gray-900'}`}>{value}</span>
      {trend && <span className="text-xs text-green-600">{trend}</span>}
    </div>
  );
}

function SourceBadge({ source }: { source: LeadSource }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SOURCE_COLORS[source]}`}>
      {source}
    </span>
  );
}

// ─── Funnel View ──────────────────────────────────────────────────────────────

function FunnelView() {
  const barData = STAGES.map(({ stage }) => ({
    name: stage === 'КП отправлено' ? 'КП' : stage === 'Закрыта/Выиграна' ? 'Выиграна' : stage,
    count: leadsForStage(stage).length,
    amount: Math.round(stageAmount(stage) / 1000),
  }));

  return (
    <div className="flex gap-6">
      {/* Funnel */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Воронка продаж</h3>
        <div className="flex flex-col items-center gap-1">
          {STAGES.map(({ stage, bgColor, widthPct }) => {
            const count = leadsForStage(stage).length;
            const pct = Math.round((count / LEADS.length) * 100);
            return (
              <div key={stage} className="w-full flex flex-col items-center">
                <div
                  className={`${bgColor} rounded-sm flex items-center justify-center text-white text-sm font-medium transition-all`}
                  style={{ width: `${widthPct}%`, minWidth: 120, height: 44 }}
                >
                  <span className="truncate px-3">
                    {stage}: {count} ({pct}%)
                  </span>
                </div>
                {widthPct > 17 && (
                  <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[10px] border-l-transparent border-r-transparent border-t-gray-200 mb-0.5" />
                )}
              </div>
            );
          })}
        </div>

        {/* Bar chart */}
        <div className="mt-6">
          <h4 className="text-xs font-semibold text-gray-500 mb-2">Сумма по этапам (тыс. ₽)</h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(v: number) => [`${v} тыс. ₽`, 'Сумма']}
                contentStyle={{ fontSize: 11 }}
              />
              <Bar dataKey="amount" fill="#6366f1" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats table */}
      <div className="w-72 shrink-0">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Статистика по этапам</h3>
        <div className="flex flex-col gap-2">
          {STAGES.map(({ stage, bgColor, widthPct }) => {
            const count = leadsForStage(stage).length;
            const amount = stageAmount(stage);

            return (
              <div key={stage} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${bgColor}`} />
                  <span className="text-xs font-semibold text-gray-700 truncate">{stage}</span>
                  <span className="ml-auto text-xs text-gray-400">{widthPct}%</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  <div>
                    <div className="text-gray-400">Кол-во</div>
                    <div className="font-bold text-gray-800">{count}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Сумма</div>
                    <div className="font-bold text-gray-800">{formatAmount(amount)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Ср. дней</div>
                    <div className="font-bold text-gray-800">{AVG_DAYS[stage] || '—'}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Kanban View ──────────────────────────────────────────────────────────────

function KanbanCard({ lead }: { lead: Lead }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-sm font-semibold text-gray-900 leading-tight">{lead.company}</span>
        <SourceBadge source={lead.source} />
      </div>
      <div className="text-xs text-gray-500 mb-1">{lead.contact}</div>
      <div className="text-base font-bold text-indigo-700 mb-2">{formatAmount(lead.amount)}</div>

      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-6 h-6 rounded-full ${lead.managerColor} flex items-center justify-center text-white text-xs font-bold`}
        >
          {lead.managerInitials}
        </div>
        <span className="text-xs text-gray-500">{lead.manager}</span>
        <span className="ml-auto text-xs text-gray-400">{lead.addedDate}</span>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded px-2 py-1 mb-2">
        <span className="text-xs text-amber-700">
          ⏰ {lead.nextAction} — {lead.nextActionDate}
        </span>
      </div>

      <div className="flex gap-1">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-7 text-xs"
          onClick={() => toast.success(`Звонок: ${lead.contact} (${lead.phone})`)}
        >
          <Icon name="Phone" size={11} className="mr-1" />
          Позвонить
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-7 text-xs"
          onClick={() => toast.success(`Написать: ${lead.contact}`)}
        >
          <Icon name="MessageCircle" size={11} className="mr-1" />
          Написать
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-7 text-xs"
          onClick={() => toast.success(`Отправить КП: ${lead.company}`)}
        >
          <Icon name="FileText" size={11} className="mr-1" />
          КП
        </Button>
      </div>
    </div>
  );
}

function KanbanView() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {STAGES.map(({ stage, bgColor }) => {
        const leads = leadsForStage(stage);
        return (
          <div key={stage} className="flex-none w-60">
            <div className={`${bgColor} text-white rounded-t-lg px-3 py-2 flex items-center justify-between`}>
              <span className="text-xs font-bold truncate">{stage}</span>
              <span className="bg-white/30 rounded-full text-xs font-bold px-1.5">{leads.length}</span>
            </div>
            <div className="bg-gray-50 rounded-b-lg border border-t-0 border-gray-200 p-2 flex flex-col gap-2 min-h-[200px]">
              {leads.length === 0 && (
                <div className="text-xs text-gray-400 text-center py-4">Нет лидов</div>
              )}
              {leads.map((lead) => (
                <KanbanCard key={lead.id} lead={lead} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Table View ───────────────────────────────────────────────────────────────

function TableView() {
  const [sortKey, setSortKey] = useState<SortKey>('amount');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [search, setSearch] = useState('');

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  const filtered = LEADS.filter(
    (l) =>
      l.company.toLowerCase().includes(search.toLowerCase()) ||
      l.contact.toLowerCase().includes(search.toLowerCase()),
  ).sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'amount') cmp = a.amount - b.amount;
    else cmp = a.addedDate.localeCompare(b.addedDate);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      <Icon name={sortDir === 'asc' ? 'ChevronUp' : 'ChevronDown'} size={13} className="inline ml-1" />
    ) : (
      <Icon name="ChevronsUpDown" size={13} className="inline ml-1 opacity-30" />
    );

  const stageColorMap: Record<DealStage, string> = {
    'Лид': 'bg-blue-100 text-blue-700',
    'Квалификация': 'bg-cyan-100 text-cyan-700',
    'Встреча': 'bg-violet-100 text-violet-700',
    'КП отправлено': 'bg-orange-100 text-orange-700',
    'Переговоры': 'bg-yellow-100 text-yellow-700',
    'Закрыта/Выиграна': 'bg-green-100 text-green-700',
  };

  return (
    <div>
      <div className="mb-3">
        <Input
          placeholder="Поиск по компании или контакту..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs h-8 text-sm"
        />
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 w-40">Компания</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Контакт</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 hidden md:table-cell">Телефон</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Источник</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Этап</th>
              <th
                className="px-3 py-2 text-right text-xs font-semibold text-gray-500 cursor-pointer hover:text-gray-800"
                onClick={() => toggleSort('amount')}
              >
                Сумма <SortIcon col="amount" />
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 hidden lg:table-cell">Менеджер</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 hidden xl:table-cell">Следующее действие</th>
              <th
                className="px-3 py-2 text-left text-xs font-semibold text-gray-500 cursor-pointer hover:text-gray-800"
                onClick={() => toggleSort('date')}
              >
                Дата <SortIcon col="date" />
              </th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead, idx) => (
              <tr
                key={lead.id}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
              >
                <td className="px-3 py-2 font-medium text-gray-900 text-xs">{lead.company}</td>
                <td className="px-3 py-2 text-gray-600 text-xs">{lead.contact}</td>
                <td className="px-3 py-2 text-gray-500 text-xs hidden md:table-cell">{lead.phone}</td>
                <td className="px-3 py-2">
                  <SourceBadge source={lead.source} />
                </td>
                <td className="px-3 py-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageColorMap[lead.stage]}`}>
                    {lead.stage}
                  </span>
                </td>
                <td className="px-3 py-2 text-right font-bold text-indigo-700 text-xs">
                  {formatAmount(lead.amount)}
                </td>
                <td className="px-3 py-2 hidden lg:table-cell">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-5 h-5 rounded-full ${lead.managerColor} flex items-center justify-center text-white text-xs font-bold`}>
                      {lead.managerInitials}
                    </div>
                    <span className="text-xs text-gray-600">{lead.manager}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-xs text-gray-500 hidden xl:table-cell max-w-[160px] truncate">
                  {lead.nextAction}
                </td>
                <td className="px-3 py-2 text-xs text-gray-400">{lead.addedDate}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <button
                      className="p-1 rounded hover:bg-blue-50 text-blue-500"
                      onClick={() => toast.success(`Звонок: ${lead.phone}`)}
                      title="Позвонить"
                    >
                      <Icon name="Phone" size={13} />
                    </button>
                    <button
                      className="p-1 rounded hover:bg-green-50 text-green-500"
                      onClick={() => toast.success(`Написать: ${lead.contact}`)}
                      title="Написать"
                    >
                      <Icon name="MessageCircle" size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-xs text-gray-400">{filtered.length} из {LEADS.length} лидов</div>
    </div>
  );
}

// ─── Tasks Panel ──────────────────────────────────────────────────────────────

function TasksPanel() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  function markDone(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: true } : t)));
    toast.success('Задача выполнена!');
  }

  return (
    <div className="w-72 shrink-0 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800">Задачи менеджера</h3>
        <button
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
          onClick={() => toast.success('Форма добавления задачи откроется в отдельном диалоге')}
        >
          <Icon name="Plus" size={13} />
          Добавить
        </button>
      </div>

      <div className="flex flex-col gap-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
        {tasks.map((task) => {
          const pc = PRIORITY_CONFIG[task.priority];
          return (
            <div
              key={task.id}
              className={`bg-white border rounded-lg p-2.5 transition-opacity ${task.done ? 'opacity-40' : 'border-gray-200'}`}
            >
              <div className="flex items-start gap-2">
                <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${pc.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className={`text-xs leading-tight ${task.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {task.text}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-medium ${pc.color}`}>{pc.label}</span>
                    <span className="text-xs text-gray-400">до {task.deadline}</span>
                  </div>
                  <div className="text-xs text-indigo-500 truncate mt-0.5">{task.lead}</div>
                </div>
              </div>
              {!task.done && (
                <button
                  className="mt-2 w-full text-xs bg-green-50 hover:bg-green-100 text-green-700 rounded px-2 py-1 font-medium transition-colors"
                  onClick={() => markDone(task.id)}
                >
                  ✓ Выполнено
                </button>
              )}
            </div>
          );
        })}
      </div>

      <Button
        size="sm"
        className="w-full"
        onClick={() => toast.success('Форма добавления задачи откроется в отдельном диалоге')}
      >
        <Icon name="Plus" size={14} className="mr-1" />
        Добавить задачу
      </Button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CRMFull() {
  const [view, setView] = useState<ViewMode>('funnel');

  const totalRevenue = LEADS.filter((l) => l.stage === 'Закрыта/Выиграна').reduce(
    (s, l) => s + l.amount,
    0,
  );
  const newThisWeek = 12;
  const totalActive = 47;
  const conversion = 23.4;
  const overdue = 8;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-5 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">CRM — Воронка продаж</h1>
            <p className="text-xs text-gray-500 mt-0.5">HVAC B2B · Сервис Климат</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.success('Экспорт CRM в Excel запущен')}
            >
              <Icon name="Download" size={14} className="mr-1" />
              Экспорт
            </Button>
            <Button
              size="sm"
              onClick={() => toast.success('Форма нового лида открыта')}
            >
              <Icon name="Plus" size={14} className="mr-1" />
              Новый лид
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-5 gap-3">
          <KPICard
            label="Лидов в работе"
            value={String(totalActive)}
            icon="Users"
            trend="↑ 8% за месяц"
          />
          <KPICard
            label="Новых за неделю"
            value={String(newThisWeek)}
            icon="TrendingUp"
            trend="↑ 3 vs прошлая"
          />
          <KPICard
            label="Конверсия"
            value={`${conversion}%`}
            icon="Target"
            trend="↑ 1.2% за месяц"
          />
          <KPICard
            label="Выручка из CRM"
            value={formatAmount(totalRevenue)}
            icon="DollarSign"
            trend="из закрытых сделок"
          />
          <KPICard
            label="Просроченных задач"
            value={String(overdue)}
            icon="AlertCircle"
            alert
          />
        </div>
      </div>

      {/* View switcher */}
      <div className="flex items-center gap-1 px-5 py-2 bg-white border-b border-gray-100">
        {(
          [
            { mode: 'funnel' as ViewMode, label: 'Воронка', icon: 'Filter' },
            { mode: 'kanban' as ViewMode, label: 'Канбан', icon: 'Columns' },
            { mode: 'table' as ViewMode, label: 'Таблица', icon: 'Table' },
          ] as { mode: ViewMode; label: string; icon: string }[]
        ).map(({ mode, label, icon }) => (
          <button
            key={mode}
            onClick={() => setView(mode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              view === mode
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Icon name={icon} size={14} />
            {label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400">Всего сделок: {LEADS.length}</span>
          <span className="text-xs text-gray-400">|</span>
          <span className="text-xs text-gray-400">
            Общая сумма: {formatAmount(LEADS.reduce((s, l) => s + l.amount, 0))}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 overflow-auto p-5">
          {view === 'funnel' && <FunnelView />}
          {view === 'kanban' && <KanbanView />}
          {view === 'table' && <TableView />}
        </div>

        {/* Tasks sidebar */}
        <div className="border-l border-gray-200 bg-white p-4 overflow-y-auto">
          <TasksPanel />
        </div>
      </div>
    </div>
  );
}
