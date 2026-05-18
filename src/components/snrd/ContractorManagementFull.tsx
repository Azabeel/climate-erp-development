import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────
type ContractorStatus = 'Активен' | 'Приостановлен';
type Specialization = 'ВРФ' | 'Монтаж' | 'Электрика' | 'Вентиляция';
type ActStatus = 'Черновик' | 'Подписан' | 'Оплачен';

interface Contractor {
  id: string; initials: string; color: string; name: string;
  specialization: Specialization; status: ContractorStatus;
  rating: number; ordersThisMonth: number; ratePerHour: number;
  inn: string; account: string; phone: string; email: string;
}

// ─── Static data ──────────────────────────────────────────────────────────────
const CONTRACTORS: Contractor[] = [
  { id:'1', initials:'КД', color:'bg-blue-500', name:'ИП Козлов Дмитрий Александрович', specialization:'Электрика', status:'Активен', rating:4.8, ordersThisMonth:11, ratePerHour:2500, inn:'772345678901', account:'40802810****1234', phone:'+7 (903) 123-45-67', email:'kozlov.electro@mail.ru' },
  { id:'2', initials:'ВП', color:'bg-green-500', name:'ООО «ВентПрофи»', specialization:'Вентиляция', status:'Активен', rating:4.5, ordersThisMonth:8, ratePerHour:1800, inn:'7701234567', account:'40702810****5678', phone:'+7 (495) 234-56-78', email:'info@ventprofi.ru' },
  { id:'3', initials:'СА', color:'bg-purple-500', name:'ИП Семёнов Андрей Витальевич', specialization:'ВРФ', status:'Активен', rating:4.2, ordersThisMonth:9, ratePerHour:2200, inn:'500112345678', account:'40802810****9012', phone:'+7 (916) 345-67-89', email:'semenov.vrf@gmail.com' },
  { id:'4', initials:'МС', color:'bg-orange-500', name:'ООО «МонтажСервис»', specialization:'Монтаж', status:'Активен', rating:4.6, ordersThisMonth:12, ratePerHour:1950, inn:'7712987654', account:'40702810****3456', phone:'+7 (499) 456-78-90', email:'info@montazhservis.ru' },
  { id:'5', initials:'НВ', color:'bg-teal-500', name:'ИП Никитин Василий Юрьевич', specialization:'Вентиляция', status:'Приостановлен', rating:3.9, ordersThisMonth:0, ratePerHour:1600, inn:'645098765432', account:'40802810****7890', phone:'+7 (926) 567-89-01', email:'nikitin.vent@mail.ru' },
  { id:'6', initials:'ПЕ', color:'bg-rose-500', name:'ИП Петров Евгений Сергеевич', specialization:'ВРФ', status:'Активен', rating:4.3, ordersThisMonth:7, ratePerHour:2100, inn:'772098765432', account:'40802810****2345', phone:'+7 (903) 678-90-12', email:'petrov.vrf@yandex.ru' },
  { id:'7', initials:'АК', color:'bg-indigo-500', name:'ООО «АрктикКлимат»', specialization:'Монтаж', status:'Активен', rating:4.7, ordersThisMonth:10, ratePerHour:2300, inn:'7709876543', account:'40702810****6789', phone:'+7 (495) 789-01-23', email:'info@arcticklimate.ru' },
  { id:'8', initials:'ФМ', color:'bg-yellow-600', name:'ИП Фёдоров Михаил Олегович', specialization:'Электрика', status:'Приостановлен', rating:3.7, ordersThisMonth:0, ratePerHour:1700, inn:'381211223344', account:'40802810****0123', phone:'+7 (912) 890-12-34', email:'fedorov.electro@mail.ru' },
];

const WORK_ORDERS = [
  { date:'12.05.2026', number:'WO-2026-001823', type:'Монтаж', status:'Выполнен', score:5, amount:18500 },
  { date:'05.05.2026', number:'WO-2026-001756', type:'ТО', status:'Выполнен', score:4, amount:6200 },
  { date:'28.04.2026', number:'WO-2026-001689', type:'Ремонт', status:'Выполнен', score:5, amount:12800 },
  { date:'20.04.2026', number:'WO-2026-001612', type:'Монтаж', status:'Выполнен', score:4, amount:24000 },
  { date:'10.04.2026', number:'WO-2026-001541', type:'ТО', status:'Выполнен', score:5, amount:7400 },
];

const CONTRACTS_PROFILE = [
  { number:'ДПД-2025-014', endDate:'31.12.2026', amount:480000 },
  { number:'ДПД-2026-003', endDate:'30.06.2026', amount:120000 },
];

const AREA_DATA = [
  { month:'Дек', orders:6, revenue:52000 }, { month:'Янв', orders:8, revenue:71000 },
  { month:'Фев', orders:7, revenue:63000 }, { month:'Мар', orders:10, revenue:89000 },
  { month:'Апр', orders:9, revenue:82000 }, { month:'Май', orders:11, revenue:95000 },
];

const ACTS: { id:string; number:string; date:string; contractor:string; amount:number; status:ActStatus }[] = [
  { id:'1', number:'АКТ-2026-041', date:'15.05.2026', contractor:'ИП Козлов Д.А.', amount:23400, status:'Подписан' },
  { id:'2', number:'АКТ-2026-040', date:'14.05.2026', contractor:'ООО «МонтажСервис»', amount:31200, status:'Оплачен' },
  { id:'3', number:'АКТ-2026-039', date:'10.05.2026', contractor:'ИП Семёнов А.В.', amount:18600, status:'Подписан' },
  { id:'4', number:'АКТ-2026-038', date:'07.05.2026', contractor:'ООО «АрктикКлимат»', amount:14200, status:'Черновик' },
];

const BAR_ORDERS = [
  { name:'Козлов', orders:11 }, { name:'МонтажСервис', orders:12 }, { name:'Семёнов', orders:9 },
  { name:'ВентПрофи', orders:8 }, { name:'АрктикКлимат', orders:10 }, { name:'Петров', orders:7 },
];

const BAR_RATINGS = [
  { name:'Козлов', rating:4.8 }, { name:'АрктикКлимат', rating:4.7 }, { name:'МонтажСервис', rating:4.6 },
  { name:'ВентПрофи', rating:4.5 }, { name:'Петров', rating:4.3 }, { name:'Семёнов', rating:4.2 },
  { name:'Никитин', rating:3.9 }, { name:'Фёдоров', rating:3.7 },
];

const COMPETENCIES = [
  { label:'Монтаж и демонтаж', value:90 }, { label:'Пусконаладка', value:75 },
  { label:'Диагностика неисправностей', value:85 }, { label:'Работа с хладагентами', value:70 },
  { label:'Электромонтаж', value:95 },
];

// ─── Style maps ───────────────────────────────────────────────────────────────
const SPEC_COLORS: Record<Specialization, string> = {
  ВРФ:'bg-blue-100 text-blue-700', Монтаж:'bg-green-100 text-green-700',
  Электрика:'bg-yellow-100 text-yellow-700', Вентиляция:'bg-purple-100 text-purple-700',
};
const ACT_COLORS: Record<ActStatus, string> = {
  Черновик:'bg-gray-100 text-gray-600', Подписан:'bg-blue-100 text-blue-700', Оплачен:'bg-green-100 text-green-700',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <Icon key={s} name="Star" size={13} className={s <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
      ))}
      <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
    </span>
  );
}

function KpiCard({ icon, label, value, sub }: { icon: string; label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-blue-50"><Icon name={icon} size={20} className="text-blue-600" /></div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Contractor Card ──────────────────────────────────────────────────────────
function ContractorCard({ contractor, onSelect }: { contractor: Contractor; onSelect: (c: Contractor) => void }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${contractor.color}`}>
            {contractor.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">{contractor.name}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge className={`text-xs px-2 py-0 ${SPEC_COLORS[contractor.specialization]}`}>{contractor.specialization}</Badge>
              <Badge className={`text-xs px-2 py-0 ${contractor.status === 'Активен' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {contractor.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="mb-3"><StarRating rating={contractor.rating} /></div>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Icon name="ClipboardList" size={13} className="text-gray-400" />
            <span>{contractor.ordersThisMonth} нарядов/мес</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon name="Banknote" size={13} className="text-gray-400" />
            <span>{contractor.ratePerHour.toLocaleString('ru-RU')} ₽/ч</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => onSelect(contractor)}>
            <Icon name="User" size={13} className="mr-1" />Профиль
          </Button>
          <Button size="sm" className="flex-1 text-xs" onClick={() => toast.success(`Наряд назначен: ${contractor.name}`)}>
            <Icon name="PlusCircle" size={13} className="mr-1" />Назначить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab({ c }: { c: Contractor }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Реквизиты</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          {[['Наименование', c.name], ['ИНН', c.inn], ['Р/счёт', c.account], ['Телефон', c.phone], ['Email', c.email], ['Ставка', `${c.ratePerHour.toLocaleString('ru-RU')} ₽/ч`]].map(([label, val]) => (
            <div key={label}>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="font-medium text-xs break-all">{val}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Активные договоры</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {CONTRACTS_PROFILE.map((ct) => (
            <div key={ct.number} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
              <div><p className="font-medium">{ct.number}</p><p className="text-xs text-gray-400">до {ct.endDate}</p></div>
              <p className="font-semibold text-blue-700">{ct.amount.toLocaleString('ru-RU')} ₽</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">История нарядов</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {['Дата','Номер','Тип','Статус','Оценка','Сумма'].map((h) => (
                  <TableHead key={h} className="text-xs">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {WORK_ORDERS.map((wo) => (
                <TableRow key={wo.number}>
                  <TableCell className="text-xs py-2">{wo.date}</TableCell>
                  <TableCell className="text-xs py-2 font-mono">{wo.number}</TableCell>
                  <TableCell className="text-xs py-2">{wo.type}</TableCell>
                  <TableCell className="text-xs py-2">
                    <Badge className="bg-green-100 text-green-700 text-xs px-2 py-0">{wo.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs py-2 text-yellow-500">{'★'.repeat(wo.score)}</TableCell>
                  <TableCell className="text-xs py-2 text-right">{wo.amount.toLocaleString('ru-RU')} ₽</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Компетенции</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {COMPETENCIES.map((comp) => (
            <div key={comp.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600">{comp.label}</span>
                <span className="font-medium">{comp.value}%</span>
              </div>
              <Progress value={comp.value} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Динамика (6 месяцев)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={AREA_DATA}>
              <defs>
                <linearGradient id="gOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize:11 }} />
              <YAxis yAxisId="l" tick={{ fontSize:11 }} />
              <YAxis yAxisId="r" orientation="right" tick={{ fontSize:11 }} />
              <Tooltip />
              <Area yAxisId="l" type="monotone" dataKey="orders" name="Нарядов" stroke="#3b82f6" fill="url(#gOrders)" strokeWidth={2} />
              <Area yAxisId="r" type="monotone" dataKey="revenue" name="Выручка ₽" stroke="#10b981" fill="url(#gRevenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Acts Tab ─────────────────────────────────────────────────────────────────
function ActsTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Актов: {ACTS.length}</p>
        <Button size="sm" onClick={() => toast.success('Акт создан')}>
          <Icon name="FilePlus" size={14} className="mr-1" />Создать акт
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {['Номер','Дата','Подрядчик','Сумма','Статус',''].map((h,i) => (
                  <TableHead key={i} className="text-xs">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {ACTS.map((act) => (
                <TableRow key={act.id}>
                  <TableCell className="text-xs py-2 font-mono">{act.number}</TableCell>
                  <TableCell className="text-xs py-2">{act.date}</TableCell>
                  <TableCell className="text-xs py-2">{act.contractor}</TableCell>
                  <TableCell className="text-xs py-2 text-right font-medium">{act.amount.toLocaleString('ru-RU')} ₽</TableCell>
                  <TableCell className="text-xs py-2">
                    <Badge className={`text-xs px-2 py-0 ${ACT_COLORS[act.status]}`}>{act.status}</Badge>
                  </TableCell>
                  <TableCell className="py-2">
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => toast.success(`Акт ${act.number} скачан`)}>
                      <Icon name="Download" size={13} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
        <span className="text-sm font-medium text-blue-800">Итого к оплате</span>
        <span className="text-lg font-bold text-blue-900">87 400 ₽</span>
      </div>
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────
function AnalyticsTab() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-gray-400 mb-1">Средняя ставка</p><p className="text-2xl font-bold">1 850 ₽/ч</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-400 mb-1">Средний NPS от клиентов</p><p className="text-2xl font-bold">4.1 ★</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Нарядов по подрядчикам (май 2026)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={BAR_ORDERS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize:11 }} />
              <YAxis tick={{ fontSize:11 }} />
              <Tooltip />
              <Bar dataKey="orders" name="Нарядов" fill="#3b82f6" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Рейтинг подрядчиков</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={BAR_RATINGS} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" domain={[0,5]} tick={{ fontSize:11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize:11 }} width={90} />
              <Tooltip />
              <ReferenceLine x={4} stroke="#f59e0b" strokeDasharray="4 4" label={{ value:'норма', fontSize:10 }} />
              <Bar dataKey="rating" name="Рейтинг" fill="#10b981" radius={[0,3,3,0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Add Dialog ───────────────────────────────────────────────────────────────
function AddContractorDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ name:'', specialization:'', phone:'', rate:'', inn:'' });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCreate = () => {
    if (!form.name || !form.specialization) { toast.error('Заполните ФИО и специализацию'); return; }
    toast.success(`Подрядчик «${form.name}» добавлен`);
    setForm({ name:'', specialization:'', phone:'', rate:'', inn:'' });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Добавить подрядчика</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          {([['name','ФИО / Наименование *','ИП Иванов Иван Иванович'],['phone','Телефон','+7 (900) 000-00-00'],['rate','Ставка ₽/ч','2000'],['inn','ИНН','770000000000']] as const).map(([key, label, placeholder]) => (
            <div key={key}>
              <label className="text-xs text-gray-500 mb-1 block">{label}</label>
              <Input placeholder={placeholder} value={form[key as keyof typeof form]} onChange={set(key)} />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Специализация *</label>
            <Select value={form.specialization} onValueChange={(v) => setForm((f) => ({ ...f, specialization: v }))}>
              <SelectTrigger><SelectValue placeholder="Выберите специализацию" /></SelectTrigger>
              <SelectContent>
                {(['ВРФ','Монтаж','Электрика','Вентиляция'] as const).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleCreate}>Создать</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ContractorManagementFull() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<Contractor | null>(null);
  const [activeTab, setActiveTab] = useState('list');

  const filtered = CONTRACTORS.filter((c) =>
    statusFilter === 'active' ? c.status === 'Активен' :
    statusFilter === 'paused' ? c.status === 'Приостановлен' : true
  );

  const handleSelectProfile = (c: Contractor) => { setSelected(c); setActiveTab('profile'); };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Icon name="Users" size={22} className="text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Подрядчики</h1>
        </div>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="active">Активные</SelectItem>
              <SelectItem value="paused">Приостановленные</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setAddOpen(true)}>
            <Icon name="UserPlus" size={15} className="mr-2" />Добавить подрядчика
          </Button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon="Users" label="Всего подрядчиков" value="14" />
        <KpiCard icon="UserCheck" label="Активных" value="9" />
        <KpiCard icon="ClipboardList" label="Нарядов в этом месяце" value="67" />
        <KpiCard icon="Star" label="Средний рейтинг" value="4.3 ★" sub="по всем подрядчикам" />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Список</TabsTrigger>
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          <TabsTrigger value="acts">Акты</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((c) => <ContractorCard key={c.id} contractor={c} onSelect={handleSelectProfile} />)}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Icon name="UserX" size={40} className="mx-auto mb-2 opacity-40" />
              <p>Подрядчики не найдены</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="profile" className="mt-4">
          {selected ? <ProfileTab c={selected} /> : (
            <div className="text-center py-16 text-gray-400">
              <Icon name="User" size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Выберите подрядчика в списке, чтобы увидеть профиль</p>
              <Button variant="link" className="mt-2" onClick={() => setActiveTab('list')}>Перейти к списку</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="acts" className="mt-4"><ActsTab /></TabsContent>
        <TabsContent value="analytics" className="mt-4"><AnalyticsTab /></TabsContent>
      </Tabs>

      <AddContractorDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
