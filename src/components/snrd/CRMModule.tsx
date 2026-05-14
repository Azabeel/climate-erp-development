import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Icon from '@/components/ui/icon';

type LeadSource = 'Telegram' | 'WhatsApp' | 'Avito' | 'Сайт' | 'Звонок';
type LeadStatus = 'Новый' | 'В работе' | 'Квалифицирован' | 'Отказ';
type DealStage = 'Лид' | 'Квалификация' | 'Встреча' | 'КП отправлено' | 'Переговоры' | 'Сделка';
type ProposalVariant = 'Базовый' | 'Оптимальный' | 'Премиум';
type ProposalStatus = 'Черновик' | 'Отправлено' | 'Просмотрено' | 'Принято' | 'Отклонено';

interface Lead { id: string; name: string; phone: string; source: LeadSource; status: LeadStatus; manager: string; date: string; }
interface Deal { id: string; client: string; amount: number; manager: string; deadline: string; stage: DealStage; }
interface Proposal { id: string; number: string; client: string; variant: ProposalVariant; amount: number; status: ProposalStatus; manager: string; date: string; }

const LEADS: Lead[] = [
  { id: '1', name: 'ООО «АрктикХолод»', phone: '+7 (495) 123-45-67', source: 'Сайт', status: 'Квалифицирован', manager: 'Петров А.С.', date: '12.05.2026' },
  { id: '2', name: 'Иванченко Михаил Петрович', phone: '+7 (926) 234-56-78', source: 'Звонок', status: 'В работе', manager: 'Смирнова О.В.', date: '12.05.2026' },
  { id: '3', name: 'ТЦ «Галактика»', phone: '+7 (499) 345-67-89', source: 'Avito', status: 'Новый', manager: 'Козлов Д.Н.', date: '11.05.2026' },
  { id: '4', name: 'ООО «Климат Плюс»', phone: '+7 (495) 456-78-90', source: 'Telegram', status: 'В работе', manager: 'Петров А.С.', date: '11.05.2026' },
  { id: '5', name: 'Соколова Анна Игоревна', phone: '+7 (916) 567-89-01', source: 'WhatsApp', status: 'Новый', manager: 'Смирнова О.В.', date: '10.05.2026' },
  { id: '6', name: 'АО «РосТехСервис»', phone: '+7 (495) 678-90-12', source: 'Сайт', status: 'Квалифицирован', manager: 'Козлов Д.Н.', date: '10.05.2026' },
  { id: '7', name: 'Гостиница «Центральная»', phone: '+7 (499) 789-01-23', source: 'Звонок', status: 'В работе', manager: 'Петров А.С.', date: '09.05.2026' },
  { id: '8', name: 'ИП Федотов В.А.', phone: '+7 (903) 890-12-34', source: 'Avito', status: 'Отказ', manager: 'Смирнова О.В.', date: '09.05.2026' },
  { id: '9', name: 'ООО «МегаСтрой»', phone: '+7 (495) 901-23-45', source: 'Telegram', status: 'Новый', manager: 'Козлов Д.Н.', date: '08.05.2026' },
  { id: '10', name: 'Медицинский центр «Здоровье»', phone: '+7 (499) 012-34-56', source: 'Сайт', status: 'Квалифицирован', manager: 'Петров А.С.', date: '08.05.2026' },
];

const DEALS: Deal[] = [
  { id: '1', client: 'ООО «АрктикХолод»', amount: 285000, manager: 'Петров А.С.', deadline: '20.05.2026', stage: 'КП отправлено' },
  { id: '2', client: 'ТЦ «Галактика»', amount: 480000, manager: 'Козлов Д.Н.', deadline: '25.05.2026', stage: 'Переговоры' },
  { id: '3', client: 'АО «РосТехСервис»', amount: 175000, manager: 'Козлов Д.Н.', deadline: '18.05.2026', stage: 'Встреча' },
  { id: '4', client: 'Гостиница «Центральная»', amount: 320000, manager: 'Петров А.С.', deadline: '30.05.2026', stage: 'Сделка' },
  { id: '5', client: 'ООО «Климат Плюс»', amount: 95000, manager: 'Петров А.С.', deadline: '15.05.2026', stage: 'Квалификация' },
  { id: '6', client: 'Медицинский центр «Здоровье»', amount: 410000, manager: 'Петров А.С.', deadline: '05.06.2026', stage: 'Переговоры' },
  { id: '7', client: 'Соколова А.И.', amount: 65000, manager: 'Смирнова О.В.', deadline: '17.05.2026', stage: 'Лид' },
  { id: '8', client: 'ООО «МегаСтрой»', amount: 195000, manager: 'Козлов Д.Н.', deadline: '22.05.2026', stage: 'Квалификация' },
  { id: '9', client: 'Бизнес-центр «Высота»', amount: 540000, manager: 'Смирнова О.В.', deadline: '10.06.2026', stage: 'КП отправлено' },
  { id: '10', client: 'ООО «ТехноПарк»', amount: 130000, manager: 'Козлов Д.Н.', deadline: '28.05.2026', stage: 'Встреча' },
  { id: '11', client: 'Ресторан «Панорама»', amount: 88000, manager: 'Смирнова О.В.', deadline: '19.05.2026', stage: 'Лид' },
  { id: '12', client: 'Фитнес-клуб «Энергия»', amount: 255000, manager: 'Петров А.С.', deadline: '02.06.2026', stage: 'Сделка' },
];

const PROPOSALS: Proposal[] = [
  { id: '1', number: 'КП-2026-0042', client: 'ООО «АрктикХолод»', variant: 'Оптимальный', amount: 285000, status: 'Просмотрено', manager: 'Петров А.С.', date: '10.05.2026' },
  { id: '2', number: 'КП-2026-0041', client: 'ТЦ «Галактика»', variant: 'Премиум', amount: 480000, status: 'Отправлено', manager: 'Козлов Д.Н.', date: '09.05.2026' },
  { id: '3', number: 'КП-2026-0040', client: 'Гостиница «Центральная»', variant: 'Оптимальный', amount: 320000, status: 'Принято', manager: 'Петров А.С.', date: '07.05.2026' },
  { id: '4', number: 'КП-2026-0039', client: 'Фитнес-клуб «Энергия»', variant: 'Базовый', amount: 220000, status: 'Принято', manager: 'Петров А.С.', date: '05.05.2026' },
  { id: '5', number: 'КП-2026-0038', client: 'АО «РосТехСервис»', variant: 'Оптимальный', amount: 175000, status: 'Черновик', manager: 'Козлов Д.Н.', date: '12.05.2026' },
  { id: '6', number: 'КП-2026-0037', client: 'Бизнес-центр «Высота»', variant: 'Премиум', amount: 540000, status: 'Отправлено', manager: 'Смирнова О.В.', date: '08.05.2026' },
  { id: '7', number: 'КП-2026-0036', client: 'ИП Федотов В.А.', variant: 'Базовый', amount: 58000, status: 'Отклонено', manager: 'Смирнова О.В.', date: '04.05.2026' },
  { id: '8', number: 'КП-2026-0035', client: 'Медицинский центр «Здоровье»', variant: 'Премиум', amount: 410000, status: 'Просмотрено', manager: 'Петров А.С.', date: '06.05.2026' },
];

const DEAL_STAGES: DealStage[] = ['Лид','Квалификация','Встреча','КП отправлено','Переговоры','Сделка'];

const formatAmount = (amount: number) => new Intl.NumberFormat('ru-RU').format(amount) + ' ₽';

const getLeadStatusStyle = (status: LeadStatus): string => {
  switch (status) {
    case 'Новый': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'В работе': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'Квалифицирован': return 'bg-green-100 text-green-700 border-green-200';
    case 'Отказ': return 'bg-red-100 text-red-700 border-red-200';
  }
};

const getSourceIcon = (source: LeadSource): string => {
  switch (source) {
    case 'Telegram': return 'Send';
    case 'WhatsApp': return 'MessageCircle';
    case 'Avito': return 'ShoppingBag';
    case 'Сайт': return 'Globe';
    case 'Звонок': return 'Phone';
  }
};

const getSourceStyle = (source: LeadSource): string => {
  switch (source) {
    case 'Telegram': return 'bg-sky-100 text-sky-700';
    case 'WhatsApp': return 'bg-emerald-100 text-emerald-700';
    case 'Avito': return 'bg-violet-100 text-violet-700';
    case 'Сайт': return 'bg-indigo-100 text-indigo-700';
    case 'Звонок': return 'bg-orange-100 text-orange-700';
  }
};

const getStageStyle = (stage: DealStage): string => {
  switch (stage) {
    case 'Лид': return 'bg-slate-50 border-slate-200';
    case 'Квалификация': return 'bg-blue-50 border-blue-200';
    case 'Встреча': return 'bg-violet-50 border-violet-200';
    case 'КП отправлено': return 'bg-yellow-50 border-yellow-200';
    case 'Переговоры': return 'bg-orange-50 border-orange-200';
    case 'Сделка': return 'bg-green-50 border-green-200';
  }
};

const getStageTitleStyle = (stage: DealStage): string => {
  switch (stage) {
    case 'Лид': return 'bg-slate-100 text-slate-700';
    case 'Квалификация': return 'bg-blue-100 text-blue-700';
    case 'Встреча': return 'bg-violet-100 text-violet-700';
    case 'КП отправлено': return 'bg-yellow-100 text-yellow-700';
    case 'Переговоры': return 'bg-orange-100 text-orange-700';
    case 'Сделка': return 'bg-green-100 text-green-700';
  }
};

const getProposalStatusStyle = (status: ProposalStatus): string => {
  switch (status) {
    case 'Черновик': return 'bg-gray-100 text-gray-600';
    case 'Отправлено': return 'bg-blue-100 text-blue-700';
    case 'Просмотрено': return 'bg-purple-100 text-purple-700';
    case 'Принято': return 'bg-green-100 text-green-700';
    case 'Отклонено': return 'bg-red-100 text-red-700';
  }
};

const getVariantStyle = (variant: ProposalVariant): string => {
  switch (variant) {
    case 'Базовый': return 'bg-slate-100 text-slate-700';
    case 'Оптимальный': return 'bg-blue-100 text-blue-700';
    case 'Премиум': return 'bg-amber-100 text-amber-700';
  }
};

const LeadsTab = () => {
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [leads, setLeads] = useState<Lead[]>(LEADS);

  const handleConvert = (lead: Lead) => {
    setLeads((prev) =>
      prev.map((l) => l.id === lead.id ? { ...l, status: 'В работе' } : l),
    );
    toast.success(`Лид "${lead.name}" конвертирован в клиента`);
  };

  const filtered = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone.includes(search);
    const matchesSource =
      sourceFilter === 'all' || lead.source === sourceFilter;
    return matchesSearch && matchesSource;
  });
  const statusCounts = {
    'Новый': leads.filter((l) => l.status === 'Новый').length,
    'В работе': leads.filter((l) => l.status === 'В работе').length,
    'Квалифицирован': leads.filter((l) => l.status === 'Квалифицирован').length,
    'Отказ': leads.filter((l) => l.status === 'Отказ').length,
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {(Object.entries(statusCounts) as [LeadStatus, number][]).map(([status, count]) => (
          <Card key={status} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${status === 'Новый' ? 'bg-blue-500' : status === 'В работе' ? 'bg-yellow-500' : status === 'Квалифицирован' ? 'bg-green-500' : 'bg-red-400'}`} />
              <div><p className="text-2xl font-bold text-gray-800">{count}</p><p className="text-xs text-gray-500">{status}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">Список лидов ({filtered.length})</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Icon name="Search" className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input placeholder="Поиск..." className="pl-8 w-64 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-44 h-9"><SelectValue placeholder="Источник" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все источники</SelectItem>
                  <SelectItem value="Telegram">Telegram</SelectItem>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  <SelectItem value="Avito">Avito</SelectItem>
                  <SelectItem value="Сайт">Сайт</SelectItem>
                  <SelectItem value="Звонок">Звонок</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" className="h-9 bg-blue-600 hover:bg-blue-700"><Icon name="Plus" className="h-4 w-4 mr-1" />Создать лид</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-16 text-xs font-semibold text-gray-500 uppercase">ID</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase">Имя / Организация</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase">Телефон</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase">Источник</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase">Статус</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase">Менеджер</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase">Дата</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase">Действия</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((lead) => (
                <TableRow key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="text-xs text-gray-400 font-mono">#{lead.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">{lead.name.charAt(0)}</div>
                      <span className="font-medium text-sm text-gray-800">{lead.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 font-mono">{lead.phone}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getSourceStyle(lead.source)}`}>
                      <Icon name={getSourceIcon(lead.source)} className="h-3 w-3" />{lead.source}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getLeadStatusStyle(lead.status)}`}>{lead.status}</span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{lead.manager}</TableCell>
                  <TableCell className="text-sm text-gray-500">{lead.date}</TableCell>
                  <TableCell>
                    {lead.status === 'Квалифицирован' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConvert(lead)}
                      >
                        → Клиент
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-gray-600">
                      <Icon name="MoreHorizontal" className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const PipelineTab = () => {
  const stageDeals = (stage: DealStage) => DEALS.filter((d) => d.stage === stage);
  const stageTotal = (stage: DealStage) => stageDeals(stage).reduce((sum, d) => sum + d.amount, 0);
  const totalPipeline = DEALS.reduce((sum, d) => sum + d.amount, 0);
  const wonDeals = DEALS.filter((d) => d.stage === 'Сделка');
  const wonTotal = wonDeals.reduce((sum, d) => sum + d.amount, 0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Всего в воронке</p><p className="text-xl font-bold text-gray-800">{formatAmount(totalPipeline)}</p><p className="text-xs text-gray-400 mt-0.5">{DEALS.length} сделок</p></CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Закрыто сделок</p><p className="text-xl font-bold text-green-600">{formatAmount(wonTotal)}</p><p className="text-xs text-gray-400 mt-0.5">{wonDeals.length} сделки</p></CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Конверсия</p><p className="text-xl font-bold text-blue-600">{Math.round((wonDeals.length / DEALS.length) * 100)}%</p><p className="text-xs text-gray-400 mt-0.5">лид → сделка</p></CardContent></Card>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-3 min-w-max">
          {DEAL_STAGES.map((stage) => {
            const deals = stageDeals(stage);
            const total = stageTotal(stage);
            return (
              <div key={stage} className="w-52 flex flex-col">
                <div className={`rounded-t-lg px-3 py-2 flex items-center justify-between ${getStageTitleStyle(stage)}`}>
                  <span className="text-xs font-semibold">{stage}</span>
                  <span className="text-xs font-bold bg-white bg-opacity-60 rounded-full w-5 h-5 flex items-center justify-center">{deals.length}</span>
                </div>
                <div className={`flex-1 rounded-b-lg border p-2 space-y-2 min-h-64 ${getStageStyle(stage)}`}>
                  {deals.map((deal) => (
                    <Card key={deal.id} className="shadow-sm border-white bg-white hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-3">
                        <p className="text-xs font-semibold text-gray-800 leading-tight mb-2 line-clamp-2">{deal.client}</p>
                        <p className="text-sm font-bold text-blue-600 mb-2">{formatAmount(deal.amount)}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-gray-400"><Icon name="User" className="h-3 w-3" /><span className="truncate max-w-20">{deal.manager.split(' ')[0]}</span></div>
                          <div className="flex items-center gap-1 text-xs text-gray-400"><Icon name="Calendar" className="h-3 w-3" /><span>{deal.deadline.slice(0, 5)}</span></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {deals.length === 0 && <div className="flex flex-col items-center justify-center h-24 text-gray-300"><Icon name="Inbox" className="h-6 w-6 mb-1" /><span className="text-xs">Нет сделок</span></div>}
                </div>
                <div className="mt-1 px-2 py-1.5 rounded-md bg-white border text-center"><span className="text-xs font-semibold text-gray-600">{total > 0 ? formatAmount(total) : '—'}</span></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ProposalsTab = () => {
  const [search, setSearch] = useState('');
  const filtered = PROPOSALS.filter((p) => p.client.toLowerCase().includes(search.toLowerCase()) || p.number.toLowerCase().includes(search.toLowerCase()));
  const totalAmount = PROPOSALS.reduce((s, p) => s + p.amount, 0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-gray-500">Всего КП</p><p className="text-2xl font-bold text-gray-800">{PROPOSALS.length}</p></CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-gray-500">Принято</p><p className="text-2xl font-bold text-green-600">{PROPOSALS.filter((p) => p.status === 'Принято').length}</p></CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-gray-500">На рассмотрении</p><p className="text-2xl font-bold text-blue-600">{PROPOSALS.filter((p) => p.status === 'Отправлено' || p.status === 'Просмотрено').length}</p></CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-xs text-gray-500">Сумма КП</p><p className="text-xl font-bold text-gray-800">{formatAmount(totalAmount)}</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">Коммерческие предложения</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative"><Icon name="Search" className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" /><Input placeholder="Поиск..." className="pl-8 w-64 h-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
              <Button size="sm" className="h-9 bg-blue-600 hover:bg-blue-700"><Icon name="Plus" className="h-4 w-4 mr-1" />Создать КП</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-xs font-semibold text-gray-500 uppercase">Номер</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase">Клиент</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase">Вариант</TableHead>
                <TableHead className="text-right text-xs font-semibold text-gray-500 uppercase">Сумма</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase">Статус</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase">Менеджер</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase">Дата</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell><span className="font-mono text-xs text-blue-600 font-semibold">{p.number}</span></TableCell>
                  <TableCell><span className="text-sm font-medium text-gray-800">{p.client}</span></TableCell>
                  <TableCell><span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getVariantStyle(p.variant)}`}>{p.variant}</span></TableCell>
                  <TableCell className="text-right"><span className="text-sm font-bold text-gray-800">{formatAmount(p.amount)}</span></TableCell>
                  <TableCell><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getProposalStatusStyle(p.status)}`}>{p.status}</span></TableCell>
                  <TableCell className="text-sm text-gray-600">{p.manager}</TableCell>
                  <TableCell className="text-sm text-gray-500">{p.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const CRMModule = () => (
  <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Icon name="TrendingUp" className="h-6 w-6 text-blue-600" />CRM — Воронка продаж</h1>
        <p className="text-sm text-gray-500 mt-0.5">Управление лидами, сделками и коммерческими предложениями</p>
      </div>
    </div>
    <Tabs defaultValue="leads">
      <TabsList className="bg-white border shadow-sm h-10">
        <TabsTrigger value="leads" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white gap-2 text-sm"><Icon name="Users" className="h-4 w-4" />Лиды</TabsTrigger>
        <TabsTrigger value="pipeline" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white gap-2 text-sm"><Icon name="Kanban" className="h-4 w-4" />Воронка продаж</TabsTrigger>
        <TabsTrigger value="proposals" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white gap-2 text-sm"><Icon name="FileText" className="h-4 w-4" />Коммерческие предложения</TabsTrigger>
      </TabsList>
      <TabsContent value="leads" className="mt-4"><LeadsTab /></TabsContent>
      <TabsContent value="pipeline" className="mt-4"><PipelineTab /></TabsContent>
      <TabsContent value="proposals" className="mt-4"><ProposalsTab /></TabsContent>
    </Tabs>
  </div>
);

export default CRMModule;
