import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Icon from '@/components/ui/icon';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type SkillLevel = 'Стажёр' | 'Базовый' | 'Эксперт' | '-';
type DayType = 'Р' | 'В' | 'О' | 'Б' | '';

interface WorkOrderDetail {
  id: string;
  type: string;
  client: string;
  amount: number;
  rate: number;
}

interface Employee {
  id: number;
  name: string;
  position: string;
  piecework: number; // сдельная часть
  fuel: number;      // ГСМ
  bonus: number;     // надбавки
  status: 'Начислен' | 'Выплачен';
  fuelKm: number;
  fuelRate: number;  // руб/км
  workOrders: WorkOrderDetail[];
  skills: Record<string, SkillLevel>;
  certs: number;
  schedule: DayType[]; // 31 дней
}

// ─────────────────────────────────────────────
// Demo data
// ─────────────────────────────────────────────

const COMPETENCIES = [
  'Кондиционеры сплит-системы',
  'VRF системы',
  'Чиллеры',
  'Котлы',
  'Вентиляция',
  'Холодильное оборудование',
  'Электрика',
];

const makeSchedule = (pattern: string[]): DayType[] => {
  const result: DayType[] = [];
  for (let i = 0; i < 31; i++) {
    result.push(pattern[i % pattern.length] as DayType);
  }
  return result;
};

// Helpers
const workday: DayType = 'Р';
const dayoff: DayType = 'В';
const vacation: DayType = 'О';
const sick: DayType = 'Б';

const employees: Employee[] = [
  {
    id: 1,
    name: 'Карпов Дмитрий Алексеевич',
    position: 'Инженер-монтажник',
    piecework: 72400,
    fuel: 8640,
    bonus: 6000,
    status: 'Выплачен',
    fuelKm: 720,
    fuelRate: 12,
    workOrders: [
      { id: 'WO-2026-000112', type: 'Ремонт сплит-системы', client: 'ООО "МегаМолл"', amount: 14800, rate: 2500 },
      { id: 'WO-2026-000123', type: 'Монтаж VRF', client: 'АО "ПромСтрой"', amount: 32000, rate: 6000 },
      { id: 'WO-2026-000134', type: 'ТО кондиционеров', client: 'ИП Соколов', amount: 9600, rate: 1800 },
      { id: 'WO-2026-000141', type: 'Ремонт вентиляции', client: 'ООО "НоваФарм"', amount: 16000, rate: 3200 },
    ],
    skills: {
      'Кондиционеры сплит-системы': 'Эксперт',
      'VRF системы': 'Эксперт',
      'Чиллеры': 'Базовый',
      'Котлы': '-',
      'Вентиляция': 'Базовый',
      'Холодильное оборудование': '-',
      'Электрика': 'Базовый',
    },
    certs: 4,
    schedule: makeSchedule([workday, workday, workday, workday, workday, dayoff, dayoff]),
  },
  {
    id: 2,
    name: 'Новикова Елена Сергеевна',
    position: 'Инженер по VRF',
    piecework: 95200,
    fuel: 11040,
    bonus: 12000,
    status: 'Выплачен',
    fuelKm: 920,
    fuelRate: 12,
    workOrders: [
      { id: 'WO-2026-000108', type: 'Монтаж VRF системы', client: 'ПАО "СтройИнвест"', amount: 48000, rate: 9000 },
      { id: 'WO-2026-000119', type: 'Диагностика VRF', client: 'ООО "Альфа-Центр"', amount: 28000, rate: 5500 },
      { id: 'WO-2026-000127', type: 'Ремонт чиллера', client: 'ООО "МегаМолл"', amount: 19200, rate: 4200 },
    ],
    skills: {
      'Кондиционеры сплит-системы': 'Базовый',
      'VRF системы': 'Эксперт',
      'Чиллеры': 'Эксперт',
      'Котлы': '-',
      'Вентиляция': 'Базовый',
      'Холодильное оборудование': 'Базовый',
      'Электрика': 'Эксперт',
    },
    certs: 6,
    schedule: makeSchedule([workday, workday, workday, workday, dayoff, dayoff, workday]),
  },
  {
    id: 3,
    name: 'Миронов Андрей Викторович',
    position: 'Техник по обслуживанию',
    piecework: 54600,
    fuel: 6960,
    bonus: 2000,
    status: 'Начислен',
    fuelKm: 580,
    fuelRate: 12,
    workOrders: [
      { id: 'WO-2026-000115', type: 'ТО сплит-систем', client: 'ИП Новиков', amount: 16800, rate: 1800 },
      { id: 'WO-2026-000128', type: 'Заправка хладагентом', client: 'ООО "ТехноСервис"', amount: 14400, rate: 2200 },
      { id: 'WO-2026-000135', type: 'Чистка фанкойлов', client: 'АО "РосТех"', amount: 23400, rate: 2100 },
    ],
    skills: {
      'Кондиционеры сплит-системы': 'Базовый',
      'VRF системы': 'Стажёр',
      'Чиллеры': '-',
      'Котлы': '-',
      'Вентиляция': 'Базовый',
      'Холодильное оборудование': '-',
      'Электрика': 'Базовый',
    },
    certs: 2,
    schedule: (() => {
      const s = makeSchedule([workday, workday, workday, workday, workday, dayoff, dayoff]);
      s[7] = sick; s[8] = sick; s[9] = sick;
      return s;
    })(),
  },
  {
    id: 4,
    name: 'Захарова Ирина Павловна',
    position: 'Инженер по холоду',
    piecework: 68800,
    fuel: 7320,
    bonus: 4500,
    status: 'Выплачен',
    fuelKm: 610,
    fuelRate: 12,
    workOrders: [
      { id: 'WO-2026-000118', type: 'Ремонт чиллера', client: 'ООО "МегаМолл"', amount: 31200, rate: 6500 },
      { id: 'WO-2026-000130', type: 'Монтаж холодильного оборудования', client: 'ПАО "СтройИнвест"', amount: 37600, rate: 7200 },
    ],
    skills: {
      'Кондиционеры сплит-системы': 'Базовый',
      'VRF системы': '-',
      'Чиллеры': 'Эксперт',
      'Котлы': '-',
      'Вентиляция': '-',
      'Холодильное оборудование': 'Эксперт',
      'Электрика': 'Базовый',
    },
    certs: 3,
    schedule: makeSchedule([workday, workday, workday, dayoff, workday, workday, dayoff]),
  },
  {
    id: 5,
    name: 'Семёнов Владислав Николаевич',
    position: 'Монтажник систем вентиляции',
    piecework: 61200,
    fuel: 9240,
    bonus: 3000,
    status: 'Начислен',
    fuelKm: 770,
    fuelRate: 12,
    workOrders: [
      { id: 'WO-2026-000121', type: 'Монтаж приточной вентиляции', client: 'ООО "НоваФарм"', amount: 26400, rate: 5000 },
      { id: 'WO-2026-000138', type: 'Балансировка вентсистемы', client: 'ООО "Альфа-Центр"', amount: 18000, rate: 3600 },
      { id: 'WO-2026-000143', type: 'ТО вентиляции', client: 'ИП Соколов', amount: 16800, rate: 2400 },
    ],
    skills: {
      'Кондиционеры сплит-системы': 'Базовый',
      'VRF системы': '-',
      'Чиллеры': '-',
      'Котлы': 'Стажёр',
      'Вентиляция': 'Эксперт',
      'Холодильное оборудование': '-',
      'Электрика': 'Базовый',
    },
    certs: 2,
    schedule: (() => {
      const s = makeSchedule([workday, workday, workday, workday, workday, dayoff, dayoff]);
      for (let i = 13; i <= 19; i++) s[i] = vacation;
      return s;
    })(),
  },
  {
    id: 6,
    name: 'Павлова Наталья Юрьевна',
    position: 'Инженер по котельному оборудованию',
    piecework: 78600,
    fuel: 8160,
    bonus: 7500,
    status: 'Выплачен',
    fuelKm: 680,
    fuelRate: 12,
    workOrders: [
      { id: 'WO-2026-000116', type: 'Диагностика котла', client: 'АО "ПромСтрой"', amount: 22400, rate: 4500 },
      { id: 'WO-2026-000126', type: 'Ремонт котельной', client: 'ООО "МегаМолл"', amount: 41600, rate: 8000 },
      { id: 'WO-2026-000139', type: 'Пусконаладка котла', client: 'ПАО "СтройИнвест"', amount: 14600, rate: 3200 },
    ],
    skills: {
      'Кондиционеры сплит-системы': '-',
      'VRF системы': '-',
      'Чиллеры': '-',
      'Котлы': 'Эксперт',
      'Вентиляция': 'Базовый',
      'Холодильное оборудование': '-',
      'Электрика': 'Эксперт',
    },
    certs: 5,
    schedule: makeSchedule([workday, workday, workday, workday, workday, dayoff, dayoff]),
  },
  {
    id: 7,
    name: 'Тихонов Роман Игоревич',
    position: 'Стажёр-монтажник',
    piecework: 38400,
    fuel: 4320,
    bonus: 0,
    status: 'Начислен',
    fuelKm: 360,
    fuelRate: 12,
    workOrders: [
      { id: 'WO-2026-000124', type: 'Монтаж сплит-системы', client: 'ИП Новиков', amount: 12000, rate: 1500 },
      { id: 'WO-2026-000133', type: 'ТО кондиционеров', client: 'ООО "ТехноСервис"', amount: 14400, rate: 1500 },
      { id: 'WO-2026-000144', type: 'Заправка хладагентом', client: 'ИП Соколов', amount: 12000, rate: 1500 },
    ],
    skills: {
      'Кондиционеры сплит-системы': 'Стажёр',
      'VRF системы': '-',
      'Чиллеры': '-',
      'Котлы': '-',
      'Вентиляция': 'Стажёр',
      'Холодильное оборудование': '-',
      'Электрика': 'Стажёр',
    },
    certs: 0,
    schedule: makeSchedule([workday, workday, workday, workday, workday, dayoff, dayoff]),
  },
  {
    id: 8,
    name: 'Горбунова Светлана Михайловна',
    position: 'Ведущий инженер-проектировщик',
    piecework: 108000,
    fuel: 13200,
    bonus: 15000,
    status: 'Выплачен',
    fuelKm: 1100,
    fuelRate: 12,
    workOrders: [
      { id: 'WO-2026-000107', type: 'Проектирование VRF', client: 'ПАО "СтройИнвест"', amount: 56000, rate: 10000 },
      { id: 'WO-2026-000114', type: 'Монтаж чиллера', client: 'АО "ПромСтрой"', amount: 38000, rate: 8000 },
      { id: 'WO-2026-000125', type: 'Монтаж приточно-вытяжной установки', client: 'ООО "МегаМолл"', amount: 14000, rate: 4000 },
    ],
    skills: {
      'Кондиционеры сплит-системы': 'Эксперт',
      'VRF системы': 'Эксперт',
      'Чиллеры': 'Эксперт',
      'Котлы': 'Базовый',
      'Вентиляция': 'Эксперт',
      'Холодильное оборудование': 'Базовый',
      'Электрика': 'Эксперт',
    },
    certs: 8,
    schedule: makeSchedule([workday, workday, workday, workday, workday, dayoff, dayoff]),
  },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString('ru-RU') + ' ₽';

const skillBadge = (level: SkillLevel) => {
  if (level === '-') return <span className="text-gray-400 text-xs">—</span>;
  const variants: Record<string, string> = {
    'Стажёр': 'bg-gray-100 text-gray-600 border border-gray-300',
    'Базовый': 'bg-blue-100 text-blue-700 border border-blue-300',
    'Эксперт': 'bg-green-100 text-green-700 border border-green-300',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${variants[level]}`}>
      {level}
    </span>
  );
};

const dayCell = (type: DayType) => {
  if (!type) return null;
  const styles: Record<DayType, string> = {
    'Р': 'bg-green-100 text-green-800 font-bold',
    'В': 'bg-gray-100 text-gray-500',
    'О': 'bg-blue-100 text-blue-700 font-semibold',
    'Б': 'bg-yellow-100 text-yellow-700 font-semibold',
    '': '',
  };
  return (
    <div className={`w-6 h-6 rounded text-xs flex items-center justify-center ${styles[type]}`}>
      {type}
    </div>
  );
};

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function PayslipsTab() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const totalPayroll = employees.reduce(
    (acc, e) => acc + e.piecework + e.fuel + e.bonus,
    0,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          Расчётные листки — Апрель 2026
        </h2>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Icon name="Download" size={15} />
          Экспорт в Excel
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[220px]">Сотрудник</TableHead>
                <TableHead>Период</TableHead>
                <TableHead className="text-right">Сдельная часть</TableHead>
                <TableHead className="text-right">ГСМ</TableHead>
                <TableHead className="text-right">Надбавки</TableHead>
                <TableHead className="text-right font-semibold">Итого начислено</TableHead>
                <TableHead className="text-center">Статус</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => {
                const total = emp.piecework + emp.fuel + emp.bonus;
                const isExpanded = expandedId === emp.id;
                return (
                  <>
                    <TableRow
                      key={emp.id}
                      className="cursor-pointer hover:bg-blue-50 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : emp.id)}
                    >
                      <TableCell>
                        <div className="font-medium text-gray-800 text-sm">{emp.name}</div>
                        <div className="text-xs text-gray-500">{emp.position}</div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">Апрель 2026</TableCell>
                      <TableCell className="text-right text-sm">{fmt(emp.piecework)}</TableCell>
                      <TableCell className="text-right text-sm">{fmt(emp.fuel)}</TableCell>
                      <TableCell className="text-right text-sm">
                        {emp.bonus > 0 ? fmt(emp.bonus) : <span className="text-gray-400">—</span>}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-gray-900">
                        {fmt(total)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={
                            emp.status === 'Выплачен'
                              ? 'bg-green-100 text-green-700 border-green-300 border'
                              : 'bg-yellow-100 text-yellow-700 border-yellow-300 border'
                          }
                        >
                          {emp.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Icon
                          name={isExpanded ? 'ChevronUp' : 'ChevronDown'}
                          size={16}
                          className="text-gray-400"
                        />
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow key={`${emp.id}-detail`} className="bg-blue-50/40">
                        <TableCell colSpan={8} className="p-0">
                          <div className="p-4 space-y-4">
                            <div>
                              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                                Выполненные наряды
                              </p>
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-xs text-gray-500 border-b border-gray-200">
                                    <th className="text-left py-1 pr-4">Наряд</th>
                                    <th className="text-left py-1 pr-4">Вид работы</th>
                                    <th className="text-left py-1 pr-4">Клиент</th>
                                    <th className="text-right py-1 pr-4">Ставка</th>
                                    <th className="text-right py-1">Начислено</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {emp.workOrders.map((wo) => (
                                    <tr key={wo.id} className="border-b border-gray-100">
                                      <td className="py-1.5 pr-4 font-mono text-blue-700">{wo.id}</td>
                                      <td className="py-1.5 pr-4 text-gray-700">{wo.type}</td>
                                      <td className="py-1.5 pr-4 text-gray-600">{wo.client}</td>
                                      <td className="py-1.5 pr-4 text-right text-gray-700">{fmt(wo.rate)}</td>
                                      <td className="py-1.5 text-right font-medium">{fmt(wo.amount)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <div className="bg-white rounded-lg border border-gray-200 p-3">
                                <p className="text-xs text-gray-500 mb-1">Компенсация ГСМ</p>
                                <p className="text-sm font-medium">
                                  {emp.fuelKm} км × {emp.fuelRate} ₽/км ={' '}
                                  <span className="font-semibold text-gray-900">{fmt(emp.fuel)}</span>
                                </p>
                              </div>
                              {emp.bonus > 0 && (
                                <div className="bg-white rounded-lg border border-gray-200 p-3">
                                  <p className="text-xs text-gray-500 mb-1">Надбавки</p>
                                  <p className="text-sm font-semibold text-gray-900">{fmt(emp.bonus)}</p>
                                  <p className="text-xs text-gray-400">(ночные / праздничные / аварийные)</p>
                                </div>
                              )}
                              <div className="bg-green-50 rounded-lg border border-green-200 p-3">
                                <p className="text-xs text-gray-500 mb-1">Итого к выплате</p>
                                <p className="text-lg font-bold text-green-700">
                                  {fmt(emp.piecework + emp.fuel + emp.bonus)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-8 text-sm">
              <span className="text-gray-500">
                Сотрудников: <span className="font-semibold text-gray-800">{employees.length}</span>
              </span>
              <span className="text-gray-500">
                Сдельная часть итого:{' '}
                <span className="font-semibold text-gray-800">
                  {fmt(employees.reduce((a, e) => a + e.piecework, 0))}
                </span>
              </span>
              <span className="text-gray-500">
                ГСМ итого:{' '}
                <span className="font-semibold text-gray-800">
                  {fmt(employees.reduce((a, e) => a + e.fuel, 0))}
                </span>
              </span>
            </div>
            <div className="text-base font-bold text-gray-900">
              Фонд оплаты труда: {fmt(totalPayroll)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CompetencyMatrixTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Матрица компетенций</h2>
        <div className="flex gap-3 text-xs text-gray-500 items-center">
          {(['Стажёр', 'Базовый', 'Эксперт'] as SkillLevel[]).map((lvl) => (
            <span key={lvl} className="flex items-center gap-1">
              {skillBadge(lvl)} {lvl}
            </span>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="min-w-[200px] sticky left-0 bg-gray-50 z-10">Сотрудник</TableHead>
                {COMPETENCIES.map((comp) => (
                  <TableHead key={comp} className="text-center min-w-[130px] text-xs leading-tight">
                    {comp}
                  </TableHead>
                ))}
                <TableHead className="text-center min-w-[80px]">
                  <div className="flex items-center justify-center gap-1">
                    <Icon name="Award" size={14} />
                    Серт.
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp.id} className="hover:bg-gray-50">
                  <TableCell className="sticky left-0 bg-white z-10 border-r border-gray-100">
                    <div className="font-medium text-sm text-gray-800">{emp.name}</div>
                    <div className="text-xs text-gray-500">{emp.position}</div>
                  </TableCell>
                  {COMPETENCIES.map((comp) => (
                    <TableCell key={comp} className="text-center py-3">
                      {skillBadge(emp.skills[comp] as SkillLevel)}
                    </TableCell>
                  ))}
                  <TableCell className="text-center">
                    {emp.certs > 0 ? (
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-700">
                        <Icon name="Award" size={14} className="text-indigo-400" />
                        {emp.certs}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        {(['Стажёр', 'Базовый', 'Эксперт'] as SkillLevel[]).map((level) => {
          const colors: Record<string, string> = {
            'Стажёр': 'border-gray-200 bg-gray-50',
            'Базовый': 'border-blue-200 bg-blue-50',
            'Эксперт': 'border-green-200 bg-green-50',
          };
          const textColors: Record<string, string> = {
            'Стажёр': 'text-gray-700',
            'Базовый': 'text-blue-700',
            'Эксперт': 'text-green-700',
          };
          const count = employees.reduce(
            (acc, emp) =>
              acc + Object.values(emp.skills).filter((v) => v === level).length,
            0,
          );
          return (
            <Card key={level} className={`border ${colors[level]}`}>
              <CardContent className="py-3 px-4 flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${textColors[level]}`}>{level}</p>
                  <p className="text-xs text-gray-500">навыков в матрице</p>
                </div>
                <span className={`text-2xl font-bold ${textColors[level]}`}>{count}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function TimesheetTab() {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const totals = employees.map((emp) => {
    const working = emp.schedule.filter((d) => d === 'Р').length;
    const vacation = emp.schedule.filter((d) => d === 'О').length;
    const sick = emp.schedule.filter((d) => d === 'Б').length;
    return { working, vacation, sick };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Табель учёта рабочего времени — Апрель 2026</h2>
        <div className="flex gap-4 text-xs text-gray-500 items-center">
          {[
            { label: 'Р — рабочий', cls: 'bg-green-100 text-green-800 font-bold' },
            { label: 'В — выходной', cls: 'bg-gray-100 text-gray-500' },
            { label: 'О — отпуск', cls: 'bg-blue-100 text-blue-700' },
            { label: 'Б — больничный', cls: 'bg-yellow-100 text-yellow-700' },
          ].map(({ label, cls }) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className={`w-5 h-5 rounded text-xs flex items-center justify-center ${cls}`}>
                {label[0]}
              </span>
              {label}
            </span>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2 font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10 min-w-[180px] border-r border-gray-200">
                  Сотрудник
                </th>
                {days.map((d) => (
                  <th
                    key={d}
                    className="text-center w-7 py-2 font-medium text-gray-600 border-l border-gray-100"
                  >
                    {d}
                  </th>
                ))}
                <th className="text-center px-2 py-2 font-semibold text-green-700 border-l border-gray-200 min-w-[40px]">Р</th>
                <th className="text-center px-2 py-2 font-semibold text-blue-700 border-l border-gray-100 min-w-[40px]">О</th>
                <th className="text-center px-2 py-2 font-semibold text-yellow-700 border-l border-gray-100 min-w-[40px]">Б</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, idx) => (
                <tr
                  key={emp.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/40' : ''}`}
                >
                  <td className="sticky left-0 bg-inherit z-10 px-3 py-1.5 border-r border-gray-200">
                    <div className="font-medium text-gray-800 whitespace-nowrap">{emp.name.split(' ')[0]} {emp.name.split(' ')[1]}</div>
                    <div className="text-gray-400 text-[10px]">{emp.position}</div>
                  </td>
                  {days.map((d) => (
                    <td key={d} className="text-center px-0.5 py-1 border-l border-gray-100">
                      <div className="flex justify-center">
                        {dayCell(emp.schedule[d - 1] ?? '')}
                      </div>
                    </td>
                  ))}
                  <td className="text-center px-2 py-1 font-bold text-green-700 border-l border-gray-200">
                    {totals[idx].working}
                  </td>
                  <td className="text-center px-2 py-1 font-semibold text-blue-600 border-l border-gray-100">
                    {totals[idx].vacation > 0 ? totals[idx].vacation : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="text-center px-2 py-1 font-semibold text-yellow-600 border-l border-gray-100">
                    {totals[idx].sick > 0 ? totals[idx].sick : <span className="text-gray-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        {[
          {
            icon: 'Users',
            label: 'Сотрудников в списке',
            value: employees.length.toString(),
            color: 'text-gray-700',
            bg: 'bg-gray-50 border-gray-200',
          },
          {
            icon: 'CheckCircle',
            label: 'Всего рабочих дней',
            value: totals.reduce((a, t) => a + t.working, 0).toString(),
            color: 'text-green-700',
            bg: 'bg-green-50 border-green-200',
          },
          {
            icon: 'Umbrella',
            label: 'Дней в отпуске',
            value: totals.reduce((a, t) => a + t.vacation, 0).toString(),
            color: 'text-blue-700',
            bg: 'bg-blue-50 border-blue-200',
          },
          {
            icon: 'Thermometer',
            label: 'Дней на больничном',
            value: totals.reduce((a, t) => a + t.sick, 0).toString(),
            color: 'text-yellow-700',
            bg: 'bg-yellow-50 border-yellow-200',
          },
        ].map(({ icon, label, value, color, bg }) => (
          <Card key={label} className={`border ${bg}`}>
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <Icon name={icon as never} size={22} className={color} />
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export default function HRModule() {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Icon name="Users" size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">HR и Зарплата</h1>
            <p className="text-sm text-gray-500">Апрель 2026 · 8 сотрудников</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-sm">
            <Icon name="Calendar" size={15} />
            Апрель 2026
          </Button>
          <Button size="sm" className="gap-1.5 text-sm bg-indigo-600 hover:bg-indigo-700">
            <Icon name="Calculator" size={15} />
            Рассчитать зарплату
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          {
            icon: 'Banknote',
            label: 'ФОТ за апрель',
            value: fmt(employees.reduce((a, e) => a + e.piecework + e.fuel + e.bonus, 0)),
            sub: 'начислено',
            color: 'text-indigo-600',
          },
          {
            icon: 'TrendingUp',
            label: 'Ср. зарплата',
            value: fmt(
              Math.round(
                employees.reduce((a, e) => a + e.piecework + e.fuel + e.bonus, 0) / employees.length,
              ),
            ),
            sub: 'на сотрудника',
            color: 'text-green-600',
          },
          {
            icon: 'Award',
            label: 'Сертификатов',
            value: employees.reduce((a, e) => a + e.certs, 0).toString(),
            sub: 'всего в команде',
            color: 'text-amber-600',
          },
          {
            icon: 'CheckCircle',
            label: 'Выплачено',
            value: employees.filter((e) => e.status === 'Выплачен').length.toString(),
            sub: `из ${employees.length} листков`,
            color: 'text-teal-600',
          },
        ].map(({ icon, label, value, sub, color }) => (
          <Card key={label} className="bg-white border-gray-200 shadow-sm">
            <CardContent className="py-4 px-5 flex items-start gap-3">
              <div className={`mt-0.5 ${color}`}>
                <Icon name={icon as never} size={22} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className={`text-lg font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="payslips">
        <TabsList className="bg-white border border-gray-200 shadow-sm">
          <TabsTrigger value="payslips" className="gap-1.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <Icon name="FileText" size={15} />
            Расчётные листки
          </TabsTrigger>
          <TabsTrigger value="competency" className="gap-1.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <Icon name="Grid3X3" size={15} />
            Матрица компетенций
          </TabsTrigger>
          <TabsTrigger value="timesheet" className="gap-1.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <Icon name="CalendarDays" size={15} />
            Табель учёта
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payslips" className="mt-4">
          <PayslipsTab />
        </TabsContent>

        <TabsContent value="competency" className="mt-4">
          <CompetencyMatrixTab />
        </TabsContent>

        <TabsContent value="timesheet" className="mt-4">
          <TimesheetTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
