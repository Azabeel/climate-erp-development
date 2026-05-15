import { useState, useMemo } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

type ContractType = 'Сервисный' | 'Гарантийный' | 'Рамочный' | 'Абонентский';
type ContractStatus = 'Активен' | 'Истекает' | 'Истёк' | 'Черновик';

interface ServiceObject {
  id: string;
  name: string;
  address: string;
  equipment: string;
}

interface AttachedFile {
  id: string;
  name: string;
  size: string;
  type: string;
}

interface Contract {
  id: string;
  number: string;
  client: string;
  type: ContractType;
  startDate: string;
  endDate: string;
  amount: number;
  status: ContractStatus;
  objectsCount: number;
  manager: string;
  nextMaintenanceDate: string;
  objects: ServiceObject[];
  files: AttachedFile[];
}

type SortField = keyof Pick<
  Contract,
  'number' | 'client' | 'type' | 'startDate' | 'endDate' | 'amount' | 'status' | 'objectsCount' | 'manager'
>;

type SortDirection = 'asc' | 'desc';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const TODAY = new Date('2026-05-15');

const daysUntil = (dateStr: string) => {
  const d = new Date(dateStr);
  return Math.ceil((d.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));
};

const mockContracts: Contract[] = [
  {
    id: '1',
    number: 'ДОГ-2025-001',
    client: 'ООО «ТехноСервис»',
    type: 'Сервисный',
    startDate: '2025-01-15',
    endDate: '2026-12-31',
    amount: 1_500_000,
    status: 'Активен',
    objectsCount: 12,
    manager: 'Иванова М.С.',
    nextMaintenanceDate: '2026-06-10',
    objects: [
      { id: 'o1', name: 'Офис ТехноСервис — Центр', address: 'Москва, ул. Тверская, 12', equipment: 'VRF Daikin 48 кВт' },
      { id: 'o2', name: 'Склад №1', address: 'Москва, Варшавское ш., 45', equipment: 'Чиллер Mitsubishi 120 кВт' },
      { id: 'o3', name: 'Офис ТехноСервис — Север', address: 'Москва, Дмитровское ш., 9', equipment: 'Мультисплит 5×7 кВт' },
    ],
    files: [
      { id: 'f1', name: 'Договор ДОГ-2025-001.pdf', size: '2.4 МБ', type: 'pdf' },
      { id: 'f2', name: 'Приложение №1 — Перечень оборудования.xlsx', size: '450 КБ', type: 'xlsx' },
      { id: 'f3', name: 'Акт сдачи-приёмки.pdf', size: '1.1 МБ', type: 'pdf' },
    ],
  },
  {
    id: '2',
    number: 'ДОГ-2025-002',
    client: 'АО «ПромСтрой»',
    type: 'Абонентский',
    startDate: '2025-03-01',
    endDate: '2026-05-30',
    amount: 850_000,
    status: 'Истекает',
    objectsCount: 5,
    manager: 'Петров А.В.',
    nextMaintenanceDate: '2026-05-20',
    objects: [
      { id: 'o4', name: 'Производственный цех А', address: 'Подольск, ул. Заводская, 3', equipment: 'Приточная вентиляция 10 000 м³/ч' },
      { id: 'o5', name: 'Административный корпус', address: 'Подольск, ул. Заводская, 3А', equipment: 'Мультизональная VRF 36 кВт' },
    ],
    files: [
      { id: 'f4', name: 'Договор ДОГ-2025-002.pdf', size: '3.1 МБ', type: 'pdf' },
      { id: 'f5', name: 'График ТО.pdf', size: '680 КБ', type: 'pdf' },
    ],
  },
  {
    id: '3',
    number: 'ДОГ-2024-045',
    client: 'ИП Смирнов А.П.',
    type: 'Гарантийный',
    startDate: '2024-06-01',
    endDate: '2026-05-05',
    amount: 320_000,
    status: 'Истёк',
    objectsCount: 2,
    manager: 'Сидорова Е.Н.',
    nextMaintenanceDate: '—',
    objects: [
      { id: 'o6', name: 'Торговая точка ул. Арбат', address: 'Москва, ул. Арбат, 22', equipment: 'Кассетный кондиционер 5 кВт' },
    ],
    files: [
      { id: 'f6', name: 'Гарантийный договор.pdf', size: '1.8 МБ', type: 'pdf' },
    ],
  },
  {
    id: '4',
    number: 'ДОГ-2026-003',
    client: 'ООО «МедЦентр Здоровье»',
    type: 'Сервисный',
    startDate: '2026-01-01',
    endDate: '2027-12-31',
    amount: 2_200_000,
    status: 'Активен',
    objectsCount: 8,
    manager: 'Иванова М.С.',
    nextMaintenanceDate: '2026-07-01',
    objects: [
      { id: 'o7', name: 'Клиника — Главный корпус', address: 'Москва, Ленинский пр., 78', equipment: 'Прецизионный кондиционер 40 кВт' },
      { id: 'o8', name: 'Лаборатория', address: 'Москва, Ленинский пр., 78Б', equipment: 'Фанкойлы 8×3 кВт' },
    ],
    files: [
      { id: 'f7', name: 'Договор ДОГ-2026-003.pdf', size: '4.2 МБ', type: 'pdf' },
      { id: 'f8', name: 'Техническое задание.pdf', size: '2.9 МБ', type: 'pdf' },
      { id: 'f9', name: 'SLA Приложение.docx', size: '310 КБ', type: 'docx' },
    ],
  },
  {
    id: '5',
    number: 'ДОГ-2026-004',
    client: 'ТЦ «Галерея Север»',
    type: 'Рамочный',
    startDate: '2026-02-15',
    endDate: '2028-02-14',
    amount: 4_800_000,
    status: 'Активен',
    objectsCount: 24,
    manager: 'Петров А.В.',
    nextMaintenanceDate: '2026-06-20',
    objects: [
      { id: 'o9', name: 'ТЦ Галерея — Зона А', address: 'Москва, ул. Дмитровская, 5', equipment: 'VRF система 180 кВт' },
      { id: 'o10', name: 'ТЦ Галерея — Зона Б', address: 'Москва, ул. Дмитровская, 5', equipment: 'Центральный чиллер 250 кВт' },
      { id: 'o11', name: 'Паркинг', address: 'Москва, ул. Дмитровская, 5 (подземный)', equipment: 'Вытяжная вентиляция 50 000 м³/ч' },
    ],
    files: [
      { id: 'f10', name: 'Рамочный договор ДОГ-2026-004.pdf', size: '5.7 МБ', type: 'pdf' },
      { id: 'f11', name: 'Список объектов и оборудования.xlsx', size: '820 КБ', type: 'xlsx' },
    ],
  },
  {
    id: '6',
    number: 'ДОГ-2026-005',
    client: 'АО «СберТех»',
    type: 'Абонентский',
    startDate: '2026-03-01',
    endDate: '2027-02-28',
    amount: 3_100_000,
    status: 'Активен',
    objectsCount: 16,
    manager: 'Козлова Т.Р.',
    nextMaintenanceDate: '2026-06-01',
    objects: [
      { id: 'o12', name: 'ЦОД Москва-1', address: 'Москва, Нагатинская ул., 16', equipment: 'Прецизионные кондиционеры 4×30 кВт' },
      { id: 'o13', name: 'Офис СберТех', address: 'Москва, ул. Вавилова, 19', equipment: 'VRF Daikin 72 кВт' },
    ],
    files: [
      { id: 'f12', name: 'Договор абонентского обслуживания.pdf', size: '3.4 МБ', type: 'pdf' },
      { id: 'f13', name: 'Регламент работ.pdf', size: '1.2 МБ', type: 'pdf' },
    ],
  },
  {
    id: '7',
    number: 'ДОГ-2026-006',
    client: 'ООО «АгроКомплекс»',
    type: 'Гарантийный',
    startDate: '2026-04-01',
    endDate: '2028-03-31',
    amount: 560_000,
    status: 'Активен',
    objectsCount: 3,
    manager: 'Сидорова Е.Н.',
    nextMaintenanceDate: '2026-10-01',
    objects: [
      { id: 'o14', name: 'Склад-холодильник №1', address: 'Подмосковье, Домодедово, ул. Промышленная, 7', equipment: 'Холодильная установка 80 кВт' },
    ],
    files: [
      { id: 'f14', name: 'Гарантийный договор ДОГ-2026-006.pdf', size: '2.1 МБ', type: 'pdf' },
      { id: 'f15', name: 'Паспорт оборудования.pdf', size: '890 КБ', type: 'pdf' },
    ],
  },
  {
    id: '8',
    number: 'ДОГ-2026-007',
    client: 'ООО «НовоСтиль»',
    type: 'Сервисный',
    startDate: '2026-05-01',
    endDate: '2027-04-30',
    amount: 0,
    status: 'Черновик',
    objectsCount: 4,
    manager: 'Иванова М.С.',
    nextMaintenanceDate: '—',
    objects: [],
    files: [
      { id: 'f16', name: 'Проект договора v2.docx', size: '540 КБ', type: 'docx' },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ContractStatus, { color: string; bg: string; label: string }> = {
  Активен:  { color: 'text-emerald-700', bg: 'bg-emerald-100', label: 'Активен' },
  Истекает: { color: 'text-red-700',     bg: 'bg-red-100',     label: 'Истекает' },
  Истёк:    { color: 'text-gray-600',    bg: 'bg-gray-100',    label: 'Истёк' },
  Черновик: { color: 'text-blue-700',    bg: 'bg-blue-100',    label: 'Черновик' },
};

const TYPE_COLORS: Record<ContractType, string> = {
  Сервисный:   '#3B82F6',
  Гарантийный: '#10B981',
  Рамочный:    '#8B5CF6',
  Абонентский: '#F59E0B',
};

const fmt = (n: number) =>
  n === 0 ? '—' : new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(n);

const fmtDate = (s: string) => {
  if (s === '—') return '—';
  const [y, m, d] = s.split('-');
  return `${d}.${m}.${y}`;
};

const FILE_ICONS: Record<string, string> = {
  pdf: 'FileText',
  xlsx: 'Table',
  docx: 'FileText',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  iconColor?: string;
  iconBg?: string;
}

const StatCard = ({ icon, label, value, sub, iconColor = 'text-blue-600', iconBg = 'bg-blue-50' }: StatCardProps) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
    <div className={`${iconBg} rounded-lg p-2.5 flex-shrink-0`}>
      <Icon name={icon} size={20} className={iconColor} />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-500 font-medium truncate">{label}</p>
      <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
      {sub && <p className="text-xs text-gray-400 truncate">{sub}</p>}
    </div>
  </div>
);

interface SortIconProps {
  field: SortField;
  active: SortField;
  dir: SortDirection;
}

const SortIcon = ({ field, active, dir }: SortIconProps) => {
  if (active !== field) return <Icon name="ChevronsUpDown" size={12} className="text-gray-300 ml-0.5" />;
  return (
    <Icon
      name={dir === 'asc' ? 'ChevronUp' : 'ChevronDown'}
      size={12}
      className="text-blue-500 ml-0.5"
    />
  );
};

// ─── New Contract Form ────────────────────────────────────────────────────────

interface NewContractFormProps {
  onClose: () => void;
}

const NewContractForm = ({ onClose }: NewContractFormProps) => {
  const [form, setForm] = useState({
    number: '',
    client: '',
    type: 'Сервисный' as ContractType,
    startDate: '',
    endDate: '',
    amount: '',
    manager: '',
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Новый договор</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <Icon name="X" size={20} />
          </button>
        </div>
        <div className="px-6 py-4 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Клиент *</label>
            <input
              value={form.client}
              onChange={set('client')}
              placeholder="Наименование клиента"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Номер договора *</label>
            <input
              value={form.number}
              onChange={set('number')}
              placeholder="ДОГ-2026-XXX"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Тип договора *</label>
            <select
              value={form.type}
              onChange={set('type')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            >
              {(['Сервисный', 'Гарантийный', 'Рамочный', 'Абонентский'] as ContractType[]).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Дата начала *</label>
            <input
              type="date"
              value={form.startDate}
              onChange={set('startDate')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Дата окончания *</label>
            <input
              type="date"
              value={form.endDate}
              onChange={set('endDate')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Сумма, руб.</label>
            <input
              value={form.amount}
              onChange={set('amount')}
              placeholder="0"
              type="number"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Менеджер</label>
            <input
              value={form.manager}
              onChange={set('manager')}
              placeholder="ФИО менеджера"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>Отмена</Button>
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={onClose}>
            Сохранить как черновик
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Detail Panel ─────────────────────────────────────────────────────────────

interface DetailPanelProps {
  contract: Contract;
  onClose: () => void;
}

const DetailPanel = ({ contract, onClose }: DetailPanelProps) => {
  const cfg = STATUS_CONFIG[contract.status];
  const remaining = daysUntil(contract.endDate);

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
        <div>
          <p className="text-xs text-gray-500 font-medium">{contract.number}</p>
          <h3 className="text-base font-bold text-gray-900 mt-0.5 leading-tight">{contract.client}</h3>
          <Badge className={`mt-1.5 text-xs font-medium ${cfg.bg} ${cfg.color} border-0`}>
            {cfg.label}
          </Badge>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5 flex-shrink-0">
          <Icon name="X" size={18} />
        </button>
      </div>

      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="px-5 py-4 space-y-5">
          {/* Key details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-0.5">Тип</p>
              <p className="text-sm font-semibold text-gray-800">{contract.type}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-0.5">Менеджер</p>
              <p className="text-sm font-semibold text-gray-800">{contract.manager}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-0.5">Дата начала</p>
              <p className="text-sm font-semibold text-gray-800">{fmtDate(contract.startDate)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-0.5">Дата окончания</p>
              <p className={`text-sm font-semibold ${contract.status === 'Истекает' ? 'text-red-600' : 'text-gray-800'}`}>
                {fmtDate(contract.endDate)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 col-span-2">
              <p className="text-xs text-gray-500 mb-0.5">Сумма договора</p>
              <p className="text-base font-bold text-gray-900">{fmt(contract.amount)}</p>
            </div>
          </div>

          {/* Days remaining */}
          {contract.status !== 'Истёк' && contract.status !== 'Черновик' && (
            <div className={`rounded-lg p-3 flex items-center gap-2 ${remaining <= 30 ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-100'}`}>
              <Icon name={remaining <= 30 ? 'AlertTriangle' : 'Clock'} size={16} className={remaining <= 30 ? 'text-red-500' : 'text-blue-500'} />
              <span className={`text-sm font-medium ${remaining <= 30 ? 'text-red-700' : 'text-blue-700'}`}>
                {remaining > 0 ? `До окончания: ${remaining} дн.` : 'Договор истёк'}
              </span>
            </div>
          )}

          {/* Next maintenance */}
          {contract.nextMaintenanceDate !== '—' && (
            <div className="rounded-lg border border-gray-200 p-3 flex items-center gap-2">
              <Icon name="Calendar" size={16} className="text-emerald-500" />
              <div>
                <p className="text-xs text-gray-500">Следующее ТО</p>
                <p className="text-sm font-semibold text-gray-800">{fmtDate(contract.nextMaintenanceDate)}</p>
              </div>
            </div>
          )}

          {/* Objects */}
          {contract.objects.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Объекты обслуживания ({contract.objectsCount})
              </p>
              <div className="space-y-2">
                {contract.objects.map(obj => (
                  <div key={obj.id} className="border border-gray-100 rounded-lg p-3">
                    <p className="text-sm font-semibold text-gray-800">{obj.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{obj.address}</p>
                    <p className="text-xs text-blue-600 mt-1 font-medium">{obj.equipment}</p>
                  </div>
                ))}
                {contract.objectsCount > contract.objects.length && (
                  <p className="text-xs text-gray-400 text-center py-1">
                    + ещё {contract.objectsCount - contract.objects.length} объект(а)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Files */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Документы</p>
            <div className="space-y-2">
              {contract.files.map(f => (
                <div key={f.id} className="flex items-center gap-3 border border-gray-100 rounded-lg p-2.5 hover:bg-gray-50 cursor-pointer group transition-colors">
                  <div className="bg-blue-50 rounded-lg p-1.5 flex-shrink-0">
                    <Icon name={FILE_ICONS[f.type] || 'FileText'} size={14} className="text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{f.name}</p>
                    <p className="text-xs text-gray-400">{f.size}</p>
                  </div>
                  <Icon name="Download" size={14} className="text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex-shrink-0 space-y-2">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 gap-1.5">
            <Icon name="Edit" size={14} />
            Редактировать
          </Button>
          <Button variant="outline" size="sm" className="flex-1 gap-1.5">
            <Icon name="RefreshCw" size={14} />
            Продлить
          </Button>
        </div>
        <Button size="sm" className="w-full gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
          <Icon name="Download" size={14} />
          Скачать PDF
        </Button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ContractManager = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'Все'>('Все');
  const [typeFilter, setTypeFilter] = useState<ContractType | 'Все'>('Все');
  const [sortField, setSortField] = useState<SortField>('number');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Compute derived status (Истекает if < 30 days remaining)
  const enriched = useMemo(() =>
    mockContracts.map(c => {
      const days = daysUntil(c.endDate);
      let status: ContractStatus = c.status;
      if (c.status === 'Активен' && days <= 30 && days > 0) status = 'Истекает';
      return { ...c, status };
    }),
  []);

  // Stats
  const stats = useMemo(() => {
    const active = enriched.filter(c => c.status === 'Активен');
    const expiring = enriched.filter(c => c.status === 'Истекает');
    const totalActive = active.reduce((s, c) => s + c.amount, 0);
    return { total: enriched.length, active: active.length, expiring: expiring.length, totalActive };
  }, [enriched]);

  // Pie data
  const pieData = useMemo(() => {
    const counts: Partial<Record<ContractType, number>> = {};
    enriched.forEach(c => { counts[c.type] = (counts[c.type] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [enriched]);

  // Bar data (amounts by type)
  const barData = useMemo(() => {
    const sums: Partial<Record<ContractType, number>> = {};
    enriched.forEach(c => { sums[c.type] = (sums[c.type] || 0) + c.amount; });
    return Object.entries(sums).map(([name, value]) => ({ name, value: Math.round((value as number) / 1000) }));
  }, [enriched]);

  // Filtered + sorted
  const filtered = useMemo(() => {
    let list = enriched.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        c.client.toLowerCase().includes(q) ||
        c.number.toLowerCase().includes(q) ||
        c.manager.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'Все' || c.status === statusFilter;
      const matchType = typeFilter === 'Все' || c.type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });

    list = [...list].sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      const cmp = typeof av === 'number'
        ? av - (bv as number)
        : String(av).localeCompare(String(bv), 'ru');
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [enriched, search, statusFilter, typeFilter, sortField, sortDir]);

  const selected = useMemo(() => enriched.find(c => c.id === selectedId) ?? null, [enriched, selectedId]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const TH = ({ label, field }: { label: string; field: SortField }) => (
    <th
      className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700 whitespace-nowrap"
      onClick={() => handleSort(field)}
    >
      <span className="inline-flex items-center gap-0.5">
        {label}
        <SortIcon field={field} active={sortField} dir={sortDir} />
      </span>
    </th>
  );

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Управление договорами</h1>
            <p className="text-sm text-gray-500 mt-0.5">Контракты с клиентами и условия обслуживания</p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm"
            onClick={() => setShowForm(true)}
          >
            <Icon name="Plus" size={16} />
            Новый договор
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatCard icon="FileText" label="Всего договоров" value={stats.total} iconColor="text-gray-600" iconBg="bg-gray-100" />
          <StatCard icon="Check" label="Активных" value={stats.active} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
          <StatCard icon="AlertTriangle" label="Истекает < 30 дней" value={stats.expiring} iconColor="text-red-500" iconBg="bg-red-50" />
          <StatCard
            icon="DollarSign"
            label="Сумма активных"
            value={`${(stats.totalActive / 1_000_000).toFixed(1)} млн ₽`}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Pie */}
          <div className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">По типам</p>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={110} height={110}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={28} outerRadius={50} paddingAngle={2}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={TYPE_COLORS[entry.name as ContractType] || '#94A3B8'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v} дог.`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 flex-1">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: TYPE_COLORS[d.name as ContractType] }} />
                      <span className="text-xs text-gray-600">{d.name}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-800">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bar */}
          <div className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Сумма по типам (тыс. ₽)</p>
            <ResponsiveContainer width="100%" height={110}>
              <BarChart data={barData} barSize={22}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip formatter={(v: number) => [`${v} тыс. ₽`, 'Сумма']} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {barData.map(entry => (
                    <Cell key={entry.name} fill={TYPE_COLORS[entry.name as ContractType] || '#94A3B8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-48 max-w-72">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по клиенту, номеру, менеджеру..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Icon name="X" size={13} />
              </button>
            )}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
            {(['Все', 'Активен', 'Истекает', 'Истёк', 'Черновик'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as ContractType | 'Все')}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-700"
          >
            <option value="Все">Все типы</option>
            {(['Сервисный', 'Гарантийный', 'Рамочный', 'Абонентский'] as ContractType[]).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 text-gray-400 ml-auto">
            <Icon name="Filter" size={14} />
            <span className="text-xs">{filtered.length} из {enriched.length}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead className="bg-white border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <TH label="Номер" field="number" />
                <TH label="Клиент" field="client" />
                <TH label="Тип" field="type" />
                <TH label="Начало" field="startDate" />
                <TH label="Окончание" field="endDate" />
                <TH label="Сумма" field="amount" />
                <TH label="Статус" field="status" />
                <TH label="Объектов" field="objectsCount" />
                <TH label="Менеджер" field="manager" />
                <th className="px-3 py-3 w-8" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const cfg = STATUS_CONFIG[c.status];
                const isActive = selectedId === c.id;
                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedId(isActive ? null : c.id)}
                    className={`border-b border-gray-100 cursor-pointer transition-colors hover:bg-blue-50 ${isActive ? 'bg-blue-50' : 'bg-white'}`}
                  >
                    <td className="px-3 py-3">
                      <span className="text-sm font-mono font-semibold text-gray-800">{c.number}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{c.client}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: TYPE_COLORS[c.type] }} />
                        <span className="text-sm text-gray-700 whitespace-nowrap">{c.type}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">{fmtDate(c.startDate)}</td>
                    <td className="px-3 py-3">
                      <span className={`text-sm whitespace-nowrap ${c.status === 'Истекает' ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                        {fmtDate(c.endDate)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm font-medium text-gray-800 whitespace-nowrap">{fmt(c.amount)}</td>
                    <td className="px-3 py-3">
                      <Badge className={`text-xs font-medium ${cfg.bg} ${cfg.color} border-0 whitespace-nowrap`}>
                        {c.status === 'Истекает' && <Icon name="AlertTriangle" size={10} className="mr-1 inline" />}
                        {c.status === 'Активен' && <Icon name="Check" size={10} className="mr-1 inline" />}
                        {cfg.label}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Icon name="Users" size={13} className="text-gray-400" />
                        <span className="text-sm text-gray-700">{c.objectsCount}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">{c.manager}</td>
                    <td className="px-3 py-3">
                      <Icon name="ChevronRight" size={14} className={`transition-colors ${isActive ? 'text-blue-500' : 'text-gray-300'}`} />
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-gray-400">
                    <Icon name="FileText" size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Договоры не найдены</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-80 flex-shrink-0 h-full overflow-hidden">
            <DetailPanel contract={selected} onClose={() => setSelectedId(null)} />
          </div>
        )}
      </div>

      {/* New contract form modal */}
      {showForm && <NewContractForm onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default ContractManager;
