import { useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
type DocType = 'Акт' | 'Счёт' | 'Договор' | 'КП' | 'Наряд';
type DocStatus = 'Черновик' | 'На согласовании' | 'Подписан' | 'Отклонён';

interface Document {
  id: string;
  name: string;
  type: DocType;
  status: DocStatus;
  counterparty: string;
  amount: number;
  date: string;
}

interface ApprovalDoc {
  id: string;
  name: string;
  type: DocType;
  counterparty: string;
  amount: number;
  deadline: string;
  overdue: boolean;
  step: number; // 0=Менеджер, 1=Бухгалтер, 2=Директор
}

interface Template {
  id: string;
  name: string;
  icon: string;
  category: string;
  usageCount: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString('ru-RU');

const TYPE_COLORS: Record<DocType, string> = {
  'Акт':     'bg-blue-100 text-blue-700',
  'Счёт':    'bg-green-100 text-green-700',
  'Договор': 'bg-purple-100 text-purple-700',
  'КП':      'bg-orange-100 text-orange-700',
  'Наряд':   'bg-cyan-100 text-cyan-700',
};

const STATUS_COLORS: Record<DocStatus, string> = {
  'Черновик':         'bg-gray-100 text-gray-600',
  'На согласовании':  'bg-yellow-100 text-yellow-700',
  'Подписан':         'bg-green-100 text-green-700',
  'Отклонён':         'bg-red-100 text-red-700',
};

// ─── Static Data ──────────────────────────────────────────────────────────────
const DOCUMENTS: Document[] = [
  { id: 'АКТ-2026-047', name: 'Акт выполненных работ по наряду WO-000312',    type: 'Акт',     status: 'Подписан',         counterparty: 'ООО «АркадияТорг»',     amount: 48500,  date: '2026-05-01' },
  { id: 'СФ-2026-031',  name: 'Счёт на оплату ТО объектов за апрель',          type: 'Счёт',    status: 'На согласовании',  counterparty: 'ГУП «Горэлектротранс»', amount: 187000, date: '2026-05-02' },
  { id: 'ДОГ-2026-012', name: 'Договор комплексного обслуживания на 2026 г.',   type: 'Договор', status: 'Подписан',         counterparty: 'ЗАО «СевМаш»',          amount: 540000, date: '2026-04-15' },
  { id: 'КП-2026-018',  name: 'КП на монтаж VRF-системы Daikin VRV IV',        type: 'КП',      status: 'На согласовании',  counterparty: 'АО «ТехноСтрой»',       amount: 312000, date: '2026-05-03' },
  { id: 'НАР-2026-400', name: 'Наряд на аварийный ремонт компрессора',          type: 'Наряд',   status: 'Черновик',         counterparty: 'ИП Сидоров А.В.',       amount: 12300,  date: '2026-05-04' },
  { id: 'АКТ-2026-048', name: 'Акт на монтаж приточной вентиляции',             type: 'Акт',     status: 'На согласовании',  counterparty: 'ООО «НордМаркет»',      amount: 156000, date: '2026-05-04' },
  { id: 'СФ-2026-032',  name: 'Счёт на поставку ЗИП Mitsubishi',               type: 'Счёт',    status: 'Отклонён',         counterparty: 'ООО «БетаРитейл»',      amount: 34200,  date: '2026-04-28' },
  { id: 'ДОГ-2026-013', name: 'Договор гарантийного обслуживания оборудования', type: 'Договор', status: 'На согласовании',  counterparty: 'ООО «АркадияТорг»',     amount: 120000, date: '2026-05-05' },
  { id: 'КП-2026-019',  name: 'КП на установку чиллера Carrier 30RB-060',       type: 'КП',      status: 'Черновик',         counterparty: 'ИП Лукьянов Д.С.',      amount: 485000, date: '2026-05-06' },
  { id: 'НАР-2026-401', name: 'Наряд-допуск на работы в электрощитовой',        type: 'Наряд',   status: 'Подписан',         counterparty: 'АО «ТехноСтрой»',       amount: 0,      date: '2026-05-06' },
  { id: 'АКТ-2026-049', name: 'Акт обследования системы холодоснабжения',       type: 'Акт',     status: 'Черновик',         counterparty: 'ЗАО «СевМаш»',          amount: 29900,  date: '2026-05-07' },
  { id: 'СФ-2026-033',  name: 'Счёт на плановое ТО за май (5 объектов)',        type: 'Счёт',    status: 'Подписан',         counterparty: 'ООО «БетаРитейл»',      amount: 92400,  date: '2026-05-08' },
];

const APPROVAL_DOCS: ApprovalDoc[] = [
  { id: 'СФ-2026-031',  name: 'Счёт на оплату ТО объектов за апрель',        type: 'Счёт',    counterparty: 'ГУП «Горэлектротранс»', amount: 187000, deadline: '2026-05-10', overdue: false, step: 1 },
  { id: 'КП-2026-018',  name: 'КП на монтаж VRF-системы Daikin VRV IV',      type: 'КП',      counterparty: 'АО «ТехноСтрой»',       amount: 312000, deadline: '2026-05-12', overdue: false, step: 0 },
  { id: 'АКТ-2026-048', name: 'Акт на монтаж приточной вентиляции',           type: 'Акт',     counterparty: 'ООО «НордМаркет»',      amount: 156000, deadline: '2026-05-08', overdue: true,  step: 1 },
  { id: 'ДОГ-2026-013', name: 'Договор гарантийного обслуживания',            type: 'Договор', counterparty: 'ООО «АркадияТорг»',     amount: 120000, deadline: '2026-05-07', overdue: true,  step: 2 },
  { id: 'КП-2026-020',  name: 'КП на сервисное обслуживание на 2026/2027',    type: 'КП',      counterparty: 'ИП Сидоров А.В.',       amount: 48000,  deadline: '2026-05-14', overdue: false, step: 0 },
];

const ARCHIVE_BAR_DATA = [
  { month: 'Дек 25', count: 142 },
  { month: 'Янв 26', count: 158 },
  { month: 'Фев 26', count: 171 },
  { month: 'Мар 26', count: 195 },
  { month: 'Апр 26', count: 208 },
  { month: 'Май 26', count: 189 },
];

const ARCHIVE_PIE_DATA = [
  { name: 'Акт',     value: 312, color: '#3b82f6' },
  { name: 'Счёт',    value: 287, color: '#22c55e' },
  { name: 'Договор', value: 198, color: '#a855f7' },
  { name: 'КП',      value: 261, color: '#f97316' },
  { name: 'Наряд',   value: 189, color: '#06b6d4' },
];

const TEMPLATES: Template[] = [
  { id: 't1', name: 'Акт выполненных работ',   icon: 'FileCheck',     category: 'Акт',     usageCount: 312 },
  { id: 't2', name: 'Счёт на оплату',           icon: 'FileText',      category: 'Счёт',    usageCount: 287 },
  { id: 't3', name: 'Коммерческое предложение', icon: 'FileBarChart',  category: 'КП',      usageCount: 261 },
  { id: 't4', name: 'Договор обслуживания',     icon: 'FileBadge',     category: 'Договор', usageCount: 198 },
  { id: 't5', name: 'Наряд на работы',          icon: 'ClipboardList', category: 'Наряд',   usageCount: 189 },
  { id: 't6', name: 'Гарантийный талон',        icon: 'ShieldCheck',   category: 'Акт',     usageCount: 143 },
];

const APPROVAL_STEPS = ['Менеджер', 'Бухгалтер', 'Директор'];

// ─── KPI Card ─────────────────────────────────────────────────────────────────
interface KpiCardProps {
  title: string;
  value: string;
  icon: string;
  iconColor: string;
  sub?: string;
  subColor?: string;
}

function KpiCard({ title, value, icon, iconColor, sub, subColor }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sub && <p className={`text-xs mt-1 ${subColor ?? 'text-gray-400'}`}>{sub}</p>}
          </div>
          <div className={`p-2 rounded-lg ${iconColor}`}>
            <Icon name={icon} size={20} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Approval Steps ───────────────────────────────────────────────────────────
function ApprovalProgress({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-1 mt-2">
      {APPROVAL_STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-1">
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium
            ${i < step ? 'bg-green-100 text-green-700' :
              i === step ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-400'}`}>
            {i < step && <Icon name="Check" size={10} />}
            {label}
          </div>
          {i < APPROVAL_STEPS.length - 1 && (
            <Icon name="ChevronRight" size={12} className="text-gray-300" />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DocumentFlowFull() {
  // filters
  const [typeFilter, setTypeFilter]     = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch]             = useState('');

  // selected doc detail
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  // create dialog
  const [createOpen, setCreateOpen]       = useState(false);
  const [newDocType, setNewDocType]       = useState('');
  const [newDocName, setNewDocName]       = useState('');
  const [newDocCounterparty, setNewDocCounterparty] = useState('');
  const [newDocAmount, setNewDocAmount]   = useState('');
  const [newDocTemplate, setNewDocTemplate] = useState('');

  // approval dialog
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction]           = useState<'approve' | 'reject'>('approve');
  const [approvalComment, setApprovalComment]         = useState('');
  const [approvalTarget, setApprovalTarget]           = useState<ApprovalDoc | null>(null);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  function handleCreate() {
    if (!newDocType || !newDocName) {
      toast.error('Заполните тип и название документа');
      return;
    }
    toast.success(`Документ «${newDocName}» создан`);
    setCreateOpen(false);
    setNewDocType(''); setNewDocName(''); setNewDocCounterparty('');
    setNewDocAmount(''); setNewDocTemplate('');
  }

  function openApprovalDialog(doc: ApprovalDoc, action: 'approve' | 'reject') {
    setApprovalTarget(doc);
    setApprovalAction(action);
    setApprovalComment('');
    setApprovalDialogOpen(true);
  }

  function handleApprovalSubmit() {
    if (!approvalTarget) return;
    const msg = approvalAction === 'approve'
      ? `Документ «${approvalTarget.id}» согласован`
      : `Документ «${approvalTarget.id}» отклонён`;
    toast[approvalAction === 'approve' ? 'success' : 'error'](msg);
    setApprovalDialogOpen(false);
  }

  // ─── Filtered docs ─────────────────────────────────────────────────────────
  const filtered = DOCUMENTS.filter(d => {
    const matchType   = typeFilter === 'all'   || d.type === typeFilter;
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase())
      || d.counterparty.toLowerCase().includes(search.toLowerCase())
      || d.id.toLowerCase().includes(search.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Документооборот</h1>
          <p className="text-sm text-gray-500 mt-0.5">Управление документами и согласованиями</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info('Импорт документов')}>
            <Icon name="Upload" size={16} className="mr-2" />
            Импорт
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Icon name="Plus" size={16} className="mr-2" />
            Создать документ
          </Button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Всего документов"  value="1 247" icon="Files"        iconColor="bg-blue-50 text-blue-600"   sub="+34 за май"        subColor="text-blue-500" />
        <KpiCard title="На подписи"         value="23"    icon="PenLine"      iconColor="bg-yellow-50 text-yellow-600" sub="Ожидают действия" subColor="text-yellow-600" />
        <KpiCard title="Просрочено"         value="5"     icon="AlertCircle"  iconColor="bg-red-50 text-red-600"    sub="Требуют внимания"  subColor="text-red-500" />
        <KpiCard title="Выполнено за месяц" value="189"   icon="CheckCircle2" iconColor="bg-green-50 text-green-600" sub="+12% к апрелю"    subColor="text-green-500" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Все документы</TabsTrigger>
          <TabsTrigger value="approval">На согласовании</TabsTrigger>
          <TabsTrigger value="archive">Архив</TabsTrigger>
          <TabsTrigger value="templates">Шаблоны</TabsTrigger>
        </TabsList>

        {/* ── Tab: All Documents ── */}
        <TabsContent value="all" className="space-y-4 mt-4">
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Поиск по названию, контрагенту, №..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-64"
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="Акт">Акт</SelectItem>
                <SelectItem value="Счёт">Счёт</SelectItem>
                <SelectItem value="Договор">Договор</SelectItem>
                <SelectItem value="КП">КП</SelectItem>
                <SelectItem value="Наряд">Наряд</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="Черновик">Черновик</SelectItem>
                <SelectItem value="На согласовании">На согласовании</SelectItem>
                <SelectItem value="Подписан">Подписан</SelectItem>
                <SelectItem value="Отклонён">Отклонён</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-400 self-center">
              Найдено: {filtered.length}
            </span>
          </div>

          <div className="flex gap-4">
            {/* Table */}
            <div className="flex-1 overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-36">№</TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead className="w-28">Тип</TableHead>
                    <TableHead className="w-36">Статус</TableHead>
                    <TableHead>Контрагент</TableHead>
                    <TableHead className="w-28 text-right">Сумма ₽</TableHead>
                    <TableHead className="w-24">Дата</TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(doc => (
                    <TableRow
                      key={doc.id}
                      className={`cursor-pointer hover:bg-gray-50 ${selectedDoc?.id === doc.id ? 'bg-blue-50' : ''}`}
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <TableCell className="font-mono text-xs text-gray-600">{doc.id}</TableCell>
                      <TableCell className="text-sm max-w-xs truncate" title={doc.name}>{doc.name}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${TYPE_COLORS[doc.type]}`}>{doc.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${STATUS_COLORS[doc.status]}`}>{doc.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 max-w-[160px] truncate">{doc.counterparty}</TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {doc.amount > 0 ? fmt(doc.amount) : '—'}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">{doc.date.slice(5)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); toast.info(`Скачать ${doc.id}`); }}>
                          <Icon name="Download" size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Side panel */}
            {selectedDoc && (
              <div className="w-72 shrink-0 border rounded-lg p-4 space-y-4 bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-xs text-gray-400">{selectedDoc.id}</p>
                    <p className="font-semibold text-sm mt-1 leading-snug">{selectedDoc.name}</p>
                  </div>
                  <button onClick={() => setSelectedDoc(null)} className="text-gray-400 hover:text-gray-600">
                    <Icon name="X" size={16} />
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Тип</span>
                    <Badge className={`text-xs ${TYPE_COLORS[selectedDoc.type]}`}>{selectedDoc.type}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Статус</span>
                    <Badge className={`text-xs ${STATUS_COLORS[selectedDoc.status]}`}>{selectedDoc.status}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Дата</span>
                    <span className="font-medium">{selectedDoc.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Сумма</span>
                    <span className="font-medium">{selectedDoc.amount > 0 ? `${fmt(selectedDoc.amount)} ₽` : '—'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Контрагент</span>
                    <p className="font-medium mt-0.5">{selectedDoc.counterparty}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline" onClick={() => toast.info(`Открыть ${selectedDoc.id}`)}>
                    <Icon name="Eye" size={14} className="mr-2" />Просмотр
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.info(`Скачать ${selectedDoc.id}`)}>
                    <Icon name="Download" size={14} className="mr-2" />Скачать PDF
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.info(`Отправить ${selectedDoc.id}`)}>
                    <Icon name="Send" size={14} className="mr-2" />Отправить
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Tab: Approval ── */}
        <TabsContent value="approval" className="space-y-3 mt-4">
          {APPROVAL_DOCS.map(doc => (
            <Card key={doc.id} className={doc.overdue ? 'border-red-200 bg-red-50/30' : ''}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-gray-400">{doc.id}</span>
                      <Badge className={`text-xs ${TYPE_COLORS[doc.type]}`}>{doc.type}</Badge>
                      {doc.overdue && (
                        <Badge className="text-xs bg-red-100 text-red-700">
                          <Icon name="Clock" size={10} className="mr-1" />Просрочен
                        </Badge>
                      )}
                    </div>
                    <p className="font-semibold text-sm mt-1 truncate" title={doc.name}>{doc.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{doc.counterparty}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm font-medium">{fmt(doc.amount)} ₽</span>
                      <span className={`text-xs ${doc.overdue ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                        Срок: {doc.deadline}
                      </span>
                    </div>
                    <ApprovalProgress step={doc.step} />
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => openApprovalDialog(doc, 'approve')}
                    >
                      <Icon name="Check" size={14} className="mr-1" />Согласовать
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => openApprovalDialog(doc, 'reject')}
                    >
                      <Icon name="X" size={14} className="mr-1" />Отклонить
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── Tab: Archive ── */}
        <TabsContent value="archive" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Документы по месяцам</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={ARCHIVE_BAR_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Документов" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Структура по типам</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={ARCHIVE_PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                      {ARCHIVE_PIE_DATA.map(entry => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v} шт.`, '']} />
                    <Legend iconSize={10} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>№ документа</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Контрагент</TableHead>
                  <TableHead className="text-right">Сумма ₽</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {DOCUMENTS.filter(d => d.status === 'Подписан').map(doc => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-mono text-xs text-gray-500">{doc.id}</TableCell>
                    <TableCell className="text-sm max-w-xs truncate">{doc.name}</TableCell>
                    <TableCell><Badge className={`text-xs ${TYPE_COLORS[doc.type]}`}>{doc.type}</Badge></TableCell>
                    <TableCell className="text-sm text-gray-600">{doc.counterparty}</TableCell>
                    <TableCell className="text-right text-sm">{doc.amount > 0 ? fmt(doc.amount) : '—'}</TableCell>
                    <TableCell className="text-xs text-gray-500">{doc.date}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => toast.info(`Скачать ${doc.id}`)}>
                        <Icon name="Download" size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── Tab: Templates ── */}
        <TabsContent value="templates" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEMPLATES.map(tpl => (
              <Card key={tpl.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600 shrink-0">
                      <Icon name={tpl.icon} size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{tpl.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-xs ${TYPE_COLORS[tpl.category as DocType]}`}>{tpl.category}</Badge>
                        <span className="text-xs text-gray-400">Использований: {tpl.usageCount}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => toast.success(`Шаблон «${tpl.name}» применён`)}
                    >
                      <Icon name="FilePlus" size={14} className="mr-1" />Использовать
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.info(`Редактор шаблонов: ${tpl.name}`)}
                    >
                      <Icon name="Pencil" size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Dialog: Create Document ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Создать документ</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Тип документа *</label>
              <Select value={newDocType} onValueChange={setNewDocType}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Акт">Акт</SelectItem>
                  <SelectItem value="Счёт">Счёт</SelectItem>
                  <SelectItem value="Договор">Договор</SelectItem>
                  <SelectItem value="КП">КП</SelectItem>
                  <SelectItem value="Наряд">Наряд</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Название *</label>
              <Input
                placeholder="Введите название документа"
                value={newDocName}
                onChange={e => setNewDocName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Контрагент</label>
              <Input
                placeholder="Наименование контрагента"
                value={newDocCounterparty}
                onChange={e => setNewDocCounterparty(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Сумма ₽</label>
              <Input
                type="number"
                placeholder="0"
                value={newDocAmount}
                onChange={e => setNewDocAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Шаблон</label>
              <Select value={newDocTemplate} onValueChange={setNewDocTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите шаблон (опционально)" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATES.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Отмена</Button>
            <Button onClick={handleCreate}>
              <Icon name="FilePlus" size={15} className="mr-2" />Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Approval Comment ── */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'Согласование документа' : 'Отклонение документа'}
            </DialogTitle>
          </DialogHeader>
          {approvalTarget && (
            <div className="py-2 space-y-3">
              <p className="text-sm text-gray-600">
                <span className="font-mono text-xs bg-gray-100 px-1 rounded">{approvalTarget.id}</span>
                {' '}{approvalTarget.name}
              </p>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Комментарий {approvalAction === 'reject' ? '*' : '(опционально)'}
                </label>
                <Input
                  placeholder="Введите комментарий..."
                  value={approvalComment}
                  onChange={e => setApprovalComment(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>Отмена</Button>
            <Button
              onClick={handleApprovalSubmit}
              className={approvalAction === 'approve'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'}
            >
              <Icon name={approvalAction === 'approve' ? 'Check' : 'X'} size={15} className="mr-2" />
              {approvalAction === 'approve' ? 'Согласовать' : 'Отклонить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
