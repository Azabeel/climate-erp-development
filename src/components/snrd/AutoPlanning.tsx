import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import Icon from '@/components/ui/icon';

// ─── TYPES ───────────────────────────────────────────────────────────────────────────────

type Priority = 'Аварийный' | 'Срочный' | 'Обычный';
type AppType = 'Ремонт' | 'ТО' | 'Диагностика' | 'Монтаж' | 'Гарантия';
type EngineerStatus = 'На смене' | 'В пути' | 'На объекте' | 'Свободен';

interface UnassignedApp {
  id: string;
  number: string;
  client: string;
  address: string;
  type: AppType;
  priority: Priority;
  created: string;
  equipment: string;
}

interface EngineerCard {
  id: string;
  name: string;
  initials: string;
  status: EngineerStatus;
  district: string;
  ordersToday: number;
  workload: number;
  specs: string[];
  avatarColor: string;
}

interface AssignmentRecord {
  time: string;
  appNumber: string;
  engineer: string;
  method: string;
  score: number;
}

// ─── DATA ───────────────────────────────────────────────────────────────────────────────

const UNASSIGNED_APPS: UnassignedApp[] = [
  { id: '1',  number: 'ЗВ-2026-001847', client: 'ТРЦ «Мега Парк»',        address: 'Ленинский пр., 100',     type: 'Ремонт',      priority: 'Аварийный', created: '08:12', equipment: 'Чиллер York YK' },
  { id: '2',  number: 'ЗВ-2026-001848', client: 'Гостиница «Азимут»',      address: 'Невский пр., 57',        type: 'Диагностика', priority: 'Срочный',   created: '08:45', equipment: 'VRF Daikin' },
  { id: '3',  number: 'ЗВ-2026-001849', client: 'АО «Северсталь»',         address: 'Промзона, стр. 14',      type: 'ТО',          priority: 'Обычный',   created: '09:10', equipment: 'Вентиляционная система' },
  { id: '4',  number: 'ЗВ-2026-001850', client: 'ООО «ТехноМир»',          address: 'ул. Марата, 34',         type: 'Ремонт',      priority: 'Срочный',   created: '09:22', equipment: 'Сплит Mitsubishi' },
  { id: '5',  number: 'ЗВ-2026-001851', client: 'Иванов А.П.',             address: 'ул. Садовая, 15, кв. 4', type: 'Ремонт',      priority: 'Обычный',   created: '09:38', equipment: 'Сплит Samsung' },
  { id: '6',  number: 'ЗВ-2026-001852', client: 'ЖК «Солнечный»',          address: 'пр. Просвещения, 12',    type: 'Монтаж',      priority: 'Обычный',   created: '09:55', equipment: 'Мульти-сплит LG' },
  { id: '7',  number: 'ЗВ-2026-001853', client: 'Петрова С.М.',            address: 'Московский пр., 8, кв.2',type: 'Диагностика', priority: 'Обычный',   created: '10:05', equipment: 'Сплит Haier' },
  { id: '8',  number: 'ЗВ-2026-001854', client: 'ФГУП «Ремонт-Сервис»',   address: 'ул. Профсоюзная, 88',    type: 'Гарантия',    priority: 'Срочный',   created: '10:18', equipment: 'Тепловой насос Bosch' },
];

const ENGINEERS: EngineerCard[] = [
  { id: 'e1', name: 'Иванов А.С.',  initials: 'ИА', status: 'На смене',   district: 'Центральный', ordersToday: 3, workload: 65, specs: ['Чиллеры', 'VRF/VRV'],     avatarColor: 'bg-blue-500'   },
  { id: 'e2', name: 'Петров В.Н.',  initials: 'ПВ', status: 'В пути',     district: 'Невский',     ordersToday: 2, workload: 45, specs: ['Сплит-системы', 'ТО'],    avatarColor: 'bg-green-500'  },
  { id: 'e3', name: 'Сидоров М.П.', initials: 'СМ', status: 'На объекте', district: 'Приморский',  ordersToday: 4, workload: 80, specs: ['Промышленные', 'VRF/VRV'], avatarColor: 'bg-purple-500' },
  { id: 'e4', name: 'Козлов Д.Р.',  initials: 'КД', status: 'Свободен',   district: 'Московский',  ordersToday: 1, workload: 20, specs: ['Сплит-системы'],           avatarColor: 'bg-amber-500'  },
  { id: 'e5', name: 'Новиков О.В.', initials: 'НО', status: 'На смене',   district: 'Выборгский',  ordersToday: 3, workload: 55, specs: ['Вентиляция', 'ТО'],        avatarColor: 'bg-rose-500'   },
  { id: 'e6', name: 'Морозов Е.К.', initials: 'МЕ', status: 'Свободен',   district: 'Кировский',   ordersToday: 0, workload: 10, specs: ['Сплит-системы', 'Монтаж'], avatarColor: 'bg-teal-500'   },
  { id: 'e7', name: 'Волков С.А.',  initials: 'ВС', status: 'В пути',     district: 'Центральный', ordersToday: 3, workload: 60, specs: ['Чиллеры', 'Диагностика'],  avatarColor: 'bg-indigo-500' },
];

const INITIAL_HISTORY: AssignmentRecord[] = [
  { time: '07:48', appNumber: 'ЗВ-2026-001843', engineer: 'Сидоров М.П.', method: 'Авто',   score: 91 },
  { time: '08:03', appNumber: 'ЗВ-2026-001844', engineer: 'Иванов А.С.',  method: 'Ручное', score: 87 },
  { time: '08:27', appNumber: 'ЗВ-2026-001845', engineer: 'Волков С.А.',  method: 'Авто',   score: 83 },
  { time: '08:51', appNumber: 'ЗВ-2026-001846', engineer: 'Новиков О.В.', method: 'Ручное', score: 79 },
  { time: '09:14', appNumber: 'ЗВ-2026-001847', engineer: 'Петров В.Н.',  method: 'Авто',   score: 88 },
];

// ─── HELPERS ────────────────────────────────────────────────────────────────────────────────

const priorityColor = (p: Priority) => {
  if (p === 'Аварийный') return 'bg-red-100 text-red-700 border-red-200';
  if (p === 'Срочный')   return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-gray-100 text-gray-600 border-gray-200';
};

const priorityDot = (p: Priority) => {
  if (p === 'Аварийный') return 'bg-red-500';
  if (p === 'Срочный')   return 'bg-amber-500';
  return 'bg-gray-400';
};

const statusColor = (s: EngineerStatus) => {
  if (s === 'Свободен')   return 'bg-green-100 text-green-700';
  if (s === 'На смене')   return 'bg-blue-100 text-blue-700';
  if (s === 'В пути')     return 'bg-amber-100 text-amber-700';
  if (s === 'На объекте') return 'bg-purple-100 text-purple-700';
  return 'bg-gray-100 text-gray-600';
};

const now = () => {
  const d = new Date();
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────────────────────

const AutoPlanning = () => {
  const [apps, setApps] = useState<UnassignedApp[]>(UNASSIGNED_APPS);
  const [engineers] = useState<EngineerCard[]>(ENGINEERS);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [selectedEng, setSelectedEng] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [history, setHistory] = useState<AssignmentRecord[]>(INITIAL_HISTORY);
  const [autoRunning, setAutoRunning] = useState(false);
  const { toast } = useToast();

  const filteredApps = apps.filter(a => {
    if (priorityFilter !== 'all' && a.priority !== priorityFilter) return false;
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    return true;
  });

  const handleAssign = () => {
    if (!selectedApp || !selectedEng) return;
    const app = apps.find(a => a.id === selectedApp);
    const eng = engineers.find(e => e.id === selectedEng);
    if (!app || !eng) return;

    setApps(prev => prev.filter(a => a.id !== selectedApp));
    setHistory(prev => [{
      time: now(),
      appNumber: app.number,
      engineer: eng.name,
      method: 'Ручное',
      score: Math.floor(Math.random() * 15) + 75,
    }, ...prev.slice(0, 9)]);
    setSelectedApp(null);
    setSelectedEng(null);

    toast({
      title: 'Заявка назначена',
      description: `${app.number} → ${eng.name}`,
    });
  };

  const handleAutoAssign = () => {
    if (apps.length === 0) {
      toast({ title: 'Нет заявок для распределения', description: 'Все заявки уже назначены.' });
      return;
    }
    setAutoRunning(true);

    const toAssign = [...apps];
    let delay = 0;
    const newHistory: AssignmentRecord[] = [];

    toAssign.forEach((app, i) => {
      delay += 600;
      setTimeout(() => {
        const eng = engineers[i % engineers.length];
        newHistory.push({
          time: now(),
          appNumber: app.number,
          engineer: eng.name,
          method: 'Авто',
          score: Math.floor(Math.random() * 20) + 75,
        });
        toast({
          title: `Авто-назначение: ${app.number}`,
          description: `→ ${eng.name} (приоритет: ${app.priority})`,
        });

        if (i === toAssign.length - 1) {
          setApps([]);
          setHistory(prev => [...newHistory.reverse(), ...prev].slice(0, 10));
          setAutoRunning(false);
          toast({ title: 'Авто-распределение завершено', description: `Назначено ${toAssign.length} заявок` });
        }
      }, delay);
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Авто-планирование</h2>
          <p className="text-sm text-gray-500">Умное распределение заявок по инженерам</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleAutoAssign}
            disabled={autoRunning || apps.length === 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Icon name={autoRunning ? 'Loader2' : 'Zap'} size={16} className={`mr-2 ${autoRunning ? 'animate-spin' : ''}`} />
            {autoRunning ? 'Распределяю...' : 'Авто-распределить'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ── LEFT: Unassigned apps ─────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Icon name="ClipboardList" size={16} className="text-blue-600" />
                Нераспределённые заявки
                <Badge variant="secondary">{apps.length}</Badge>
              </CardTitle>
              <div className="flex gap-2">
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="h-7 w-28 text-xs">
                    <SelectValue placeholder="Приоритет" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    <SelectItem value="Аварийный">Аварийный</SelectItem>
                    <SelectItem value="Срочный">Срочный</SelectItem>
                    <SelectItem value="Обычный">Обычный</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-7 w-28 text-xs">
                    <SelectValue placeholder="Тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все типы</SelectItem>
                    <SelectItem value="Ремонт">Ремонт</SelectItem>
                    <SelectItem value="ТО">ТО</SelectItem>
                    <SelectItem value="Диагностика">Диагностика</SelectItem>
                    <SelectItem value="Монтаж">Монтаж</SelectItem>
                    <SelectItem value="Гарантия">Гарантия</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 max-h-[480px] overflow-y-auto">
            {filteredApps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Icon name="CheckCircle2" size={32} className="mb-2 text-green-400" />
                <p className="text-sm">Все заявки назначены</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredApps.map(app => (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(selectedApp === app.id ? null : app.id)}
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedApp === app.id ? 'bg-blue-50 border-l-2 border-blue-500' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-2 h-2 rounded-full shrink-0 mt-1 ${priorityDot(app.priority)}`} />
                        <div className="min-w-0">
                          <p className="text-xs font-mono text-gray-500">{app.number}</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{app.client}</p>
                          <p className="text-xs text-gray-500 truncate">{app.address}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{app.equipment}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${priorityColor(app.priority)}`}>
                          {app.priority}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{app.type}</span>
                        <span className="text-xs text-gray-400">{app.created}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── RIGHT: Engineers ───────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Icon name="Users" size={16} className="text-green-600" />
              Инженеры на смене
              <Badge variant="secondary">{engineers.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 max-h-[480px] overflow-y-auto">
            <div className="divide-y">
              {engineers.map(eng => (
                <div
                  key={eng.id}
                  onClick={() => setSelectedEng(selectedEng === eng.id ? null : eng.id)}
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedEng === eng.id ? 'bg-green-50 border-l-2 border-green-500' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full ${eng.avatarColor} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                      {eng.initials}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900">{eng.name}</p>
                        <Badge className={`text-xs ${statusColor(eng.status)}`}>{eng.status}</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        <Icon name="MapPin" size={10} className="inline mr-1" />
                        {eng.district} · {eng.ordersToday} нар. сегодня
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {eng.specs.map(s => (
                          <span key={s} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                      {/* Workload bar */}
                      <div className="mt-2 flex items-center gap-2">
                        <Progress
                          value={eng.workload}
                          className="h-1.5 flex-1"
                        />
                        <span className={`text-xs font-medium ${
                          eng.workload >= 75 ? 'text-red-600' :
                          eng.workload >= 50 ? 'text-amber-600' :
                          'text-green-600'
                        }`}>{eng.workload}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── ASSIGN BUTTON ───────────────────────────────────────────────────────────────────── */}
      {selectedApp && selectedEng && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3 flex-wrap text-sm">
                <div className="flex items-center gap-2">
                  <Icon name="ClipboardList" size={16} className="text-blue-600" />
                  <span className="font-medium">{apps.find(a => a.id === selectedApp)?.number}</span>
                </div>
                <Icon name="ArrowRight" size={16} className="text-gray-400" />
                <div className="flex items-center gap-2">
                  <Icon name="User" size={16} className="text-green-600" />
                  <span className="font-medium">{engineers.find(e => e.id === selectedEng)?.name}</span>
                </div>
              </div>
              <Button onClick={handleAssign} className="bg-blue-600 hover:bg-blue-700">
                <Icon name="CheckCircle" size={16} className="mr-2" />
                Назначить
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── ASSIGNMENT HISTORY ───────────────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Icon name="History" size={16} className="text-gray-600" />
            История назначений — сегодня
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Время</TableHead>
                <TableHead>Заявка</TableHead>
                <TableHead>Инженер</TableHead>
                <TableHead>Метод</TableHead>
                <TableHead className="text-right">Балл</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.slice(0, 8).map((h, i) => (
                <TableRow key={i} className="hover:bg-gray-50">
                  <TableCell className="text-sm text-gray-500">{h.time}</TableCell>
                  <TableCell className="text-sm font-mono">{h.appNumber}</TableCell>
                  <TableCell className="text-sm">{h.engineer}</TableCell>
                  <TableCell>
                    <Badge variant={h.method === 'Авто' ? 'default' : 'secondary'} className="text-xs">
                      {h.method === 'Авто' ? (
                        <><Icon name="Zap" size={10} className="mr-1 inline" />Авто</>
                      ) : (
                        <><Icon name="Hand" size={10} className="mr-1 inline" />Ручное</>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`text-sm font-bold ${h.score >= 85 ? 'text-green-600' : h.score >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
                      {h.score}
                    </span>
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

export default AutoPlanning;
