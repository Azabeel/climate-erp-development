import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

// ─── Типы ──────────────────────────────────────────────────────────────────────

type Specialization = 'Ремонт' | 'ТО' | 'Монтаж' | 'Аварийный';

interface Engineer {
  id: string;
  name: string;
  role: string;
  online: boolean;
}

interface ActiveOrder {
  id: string;
  address: string;
  type: string;
  status: 'В работе' | 'Назначен' | 'Завершён';
  engineer: string;
}

interface WeekSchedule {
  engineer: string;
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
}

interface WorkGroup {
  id: string;
  name: string;
  icon: string;
  description: string;
  territory: string;
  specializations: Specialization[];
  engineers: Engineer[];
  load: number;
  activeOrders: ActiveOrder[];
  weekSchedule: WeekSchedule[];
  isContractor?: boolean;
}

// ─── Данные ────────────────────────────────────────────────────────────────────

const MOCK_GROUPS: WorkGroup[] = [
  {
    id: 'GRP-001',
    name: 'Северный округ',
    icon: 'MapPin',
    description: 'Обслуживание объектов северной части города',
    territory: 'САО, СВАО',
    specializations: ['Ремонт', 'ТО'],
    load: 78,
    engineers: [
      { id: 'E1', name: 'Иванов Иван', role: 'Ст. инженер', online: true },
      { id: 'E2', name: 'Петров Сергей', role: 'Инженер', online: true },
      { id: 'E3', name: 'Сидоров Алексей', role: 'Инженер', online: false },
      { id: 'E4', name: 'Козлов Михаил', role: 'Инженер', online: true },
    ],
    activeOrders: [
      { id: 'WO-2026-000101', address: 'ТЦ «Мега Химки»', type: 'ТО', status: 'В работе', engineer: 'Иванов Иван' },
      { id: 'WO-2026-000105', address: 'БЦ «Аэрополис»', type: 'Ремонт', status: 'Назначен', engineer: 'Петров Сергей' },
      { id: 'WO-2026-000112', address: 'Склад ООО «Логист»', type: 'Диагностика', status: 'Назначен', engineer: 'Козлов Михаил' },
    ],
    weekSchedule: [
      { engineer: 'Иванов Иван', mon: 'ТО', tue: 'Ремонт', wed: 'ТО', thu: 'Выезд', fri: 'Ремонт' },
      { engineer: 'Петров Сергей', mon: 'Ремонт', tue: 'ТО', wed: 'Выходной', thu: 'Ремонт', fri: 'ТО' },
      { engineer: 'Сидоров Алексей', mon: 'Выходной', tue: 'Монтаж', wed: 'Монтаж', thu: 'ТО', fri: 'Ремонт' },
      { engineer: 'Козлов Михаил', mon: 'Выезд', tue: 'Выезд', wed: 'Ремонт', thu: 'ТО', fri: 'Выходной' },
    ],
  },
  {
    id: 'GRP-002',
    name: 'Южный округ',
    icon: 'MapPin',
    description: 'Обслуживание объектов южной части города',
    territory: 'ЮАО, ЮЗАО',
    specializations: ['Ремонт', 'Монтаж'],
    load: 65,
    engineers: [
      { id: 'E5', name: 'Волков Николай', role: 'Ст. инженер', online: true },
      { id: 'E6', name: 'Новиков Андрей', role: 'Инженер', online: false },
      { id: 'E7', name: 'Морозов Денис', role: 'Инженер', online: true },
      { id: 'E8', name: 'Попов Виктор', role: 'Инженер', online: true },
      { id: 'E9', name: 'Лебедев Артём', role: 'Монтажник', online: false },
    ],
    activeOrders: [
      { id: 'WO-2026-000098', address: 'Ресторан «Причал»', type: 'Монтаж', status: 'В работе', engineer: 'Волков Николай' },
      { id: 'WO-2026-000103', address: 'Офис «ФинГрупп»', type: 'Ремонт', status: 'Назначен', engineer: 'Морозов Денис' },
      { id: 'WO-2026-000115', address: 'ТЦ «Южный»', type: 'ТО', status: 'Назначен', engineer: 'Попов Виктор' },
    ],
    weekSchedule: [
      { engineer: 'Волков Николай', mon: 'Монтаж', tue: 'Монтаж', wed: 'Ремонт', thu: 'Ремонт', fri: 'ТО' },
      { engineer: 'Новиков Андрей', mon: 'ТО', tue: 'ТО', wed: 'Выходной', thu: 'Монтаж', fri: 'Монтаж' },
      { engineer: 'Морозов Денис', mon: 'Ремонт', tue: 'Ремонт', wed: 'ТО', thu: 'Выездной', fri: 'Ремонт' },
      { engineer: 'Попов Виктор', mon: 'Выходной', tue: 'Монтаж', wed: 'Монтаж', thu: 'ТО', fri: 'Выходной' },
      { engineer: 'Лебедев Артём', mon: 'Монтаж', tue: 'Монтаж', wed: 'Монтаж', thu: 'Монтаж', fri: 'Выходной' },
    ],
  },
  {
    id: 'GRP-003',
    name: 'Центр',
    icon: 'Building2',
    description: 'Обслуживание центральных районов и деловых кварталов',
    territory: 'ЦАО, ЗАО',
    specializations: ['Ремонт', 'ТО'],
    load: 91,
    engineers: [
      { id: 'E10', name: 'Соколов Павел', role: 'Ст. инженер', online: true },
      { id: 'E11', name: 'Белов Кирилл', role: 'Инженер', online: true },
      { id: 'E12', name: 'Орлов Роман', role: 'Инженер', online: true },
    ],
    activeOrders: [
      { id: 'WO-2026-000110', address: 'Бутик «Люкс»', type: 'ТО', status: 'В работе', engineer: 'Соколов Павел' },
      { id: 'WO-2026-000111', address: 'Отель «Метрополь»', type: 'Диагностика', status: 'В работе', engineer: 'Белов Кирилл' },
      { id: 'WO-2026-000118', address: 'БЦ «Москва-Сити»', type: 'Ремонт', status: 'Назначен', engineer: 'Орлов Роман' },
    ],
    weekSchedule: [
      { engineer: 'Соколов Павел', mon: 'ТО', tue: 'ТО', wed: 'ТО', thu: 'Ремонт', fri: 'ТО' },
      { engineer: 'Белов Кирилл', mon: 'Ремонт', tue: 'Диагностика', wed: 'Ремонт', thu: 'ТО', fri: 'Ремонт' },
      { engineer: 'Орлов Роман', mon: 'Монтаж', tue: 'Монтаж', wed: 'Ремонт', thu: 'Ремонт', fri: 'ТО' },
    ],
  },
  {
    id: 'GRP-004',
    name: 'Аварийная служба',
    icon: 'AlertTriangle',
    description: 'Круглосуточная аварийная бригада, реагирование до 2 часов',
    territory: 'Вся Москва',
    specializations: ['Ремонт', 'Аварийный'],
    load: 55,
    engineers: [
      { id: 'E13', name: 'Зайцев Игорь', role: 'Руководитель аварийной службы', online: true },
      { id: 'E14', name: 'Фёдоров Дмитрий', role: 'Аварийный инженер', online: true },
      { id: 'E15', name: 'Кузнецов Антон', role: 'Аварийный инженер', online: false },
      { id: 'E16', name: 'Смирнов Олег', role: 'Аварийный инженер', online: true },
    ],
    activeOrders: [
      { id: 'WO-2026-000120', address: 'Серверная ЦОД «ДатаЛайн»', type: 'Аварийный', status: 'В работе', engineer: 'Зайцев Игорь' },
      { id: 'WO-2026-000122', address: 'Клиника «Медицина»', type: 'Аварийный', status: 'В работе', engineer: 'Фёдоров Дмитрий' },
    ],
    weekSchedule: [
      { engineer: 'Зайцев Игорь', mon: 'Дежурство', tue: 'Выходной', wed: 'Дежурство', thu: 'Выходной', fri: 'Дежурство' },
      { engineer: 'Фёдоров Дмитрий', mon: 'Выходной', tue: 'Дежурство', wed: 'Выходной', thu: 'Дежурство', fri: 'Выходной' },
      { engineer: 'Кузнецов Антон', mon: 'Дежурство', tue: 'Дежурство', wed: 'Выходной', thu: 'Выходной', fri: 'Дежурство' },
      { engineer: 'Смирнов Олег', mon: 'Выходной', tue: 'Выходной', wed: 'Дежурство', thu: 'Дежурство', fri: 'Выходной' },
    ],
  },
  {
    id: 'GRP-005',
    name: 'Плановое ТО',
    icon: 'ClipboardCheck',
    description: 'Специализированная группа планового технического обслуживания',
    territory: 'Москва и МО',
    specializations: ['ТО'],
    load: 82,
    engineers: [
      { id: 'E17', name: 'Титов Евгений', role: 'Ст. специалист ТО', online: true },
      { id: 'E18', name: 'Громов Василий', role: 'Специалист ТО', online: true },
      { id: 'E19', name: 'Ершов Алексей', role: 'Специалист ТО', online: false },
      { id: 'E20', name: 'Тихонов Сергей', role: 'Специалист ТО', online: true },
      { id: 'E21', name: 'Крылов Пётр', role: 'Специалист ТО', online: false },
    ],
    activeOrders: [
      { id: 'WO-2026-000125', address: 'ТЦ «Европейский»', type: 'ТО', status: 'В работе', engineer: 'Титов Евгений' },
      { id: 'WO-2026-000126', address: 'ТЦ «Афимолл»', type: 'ТО', status: 'В работе', engineer: 'Громов Василий' },
      { id: 'WO-2026-000128', address: 'Завод «Прогресс»', type: 'ТО', status: 'Назначен', engineer: 'Тихонов Сергей' },
    ],
    weekSchedule: [
      { engineer: 'Титов Евгений', mon: 'ТО', tue: 'ТО', wed: 'ТО', thu: 'ТО', fri: 'ТО' },
      { engineer: 'Громов Василий', mon: 'ТО', tue: 'ТО', wed: 'ТО', thu: 'ТО', fri: 'ТО' },
      { engineer: 'Ершов Алексей', mon: 'Выходной', tue: 'ТО', wed: 'ТО', thu: 'ТО', fri: 'Выходной' },
      { engineer: 'Тихонов Сергей', mon: 'ТО', tue: 'ТО', wed: 'Выходной', thu: 'ТО', fri: 'ТО' },
      { engineer: 'Крылов Пётр', mon: 'ТО', tue: 'Выходной', wed: 'ТО', thu: 'ТО', fri: 'ТО' },
    ],
  },
  {
    id: 'GRP-006',
    name: 'Монтаж',
    icon: 'Wrench',
    description: 'Монтаж и пусконаладка климатических систем',
    territory: 'Москва и МО',
    specializations: ['Монтаж'],
    load: 70,
    engineers: [
      { id: 'E22', name: 'Власов Максим', role: 'Ст. монтажник', online: true },
      { id: 'E23', name: 'Субботин Игорь', role: 'Монтажник', online: true },
      { id: 'E24', name: 'Жуков Алексей', role: 'Монтажник', online: true },
      { id: 'E25', name: 'Никитин Роман', role: 'Монтажник', online: false },
      { id: 'E26', name: 'Борисов Андрей', role: 'Монтажник', online: true },
      { id: 'E27', name: 'Соловьёв Пётр', role: 'Пусконаладчик', online: false },
    ],
    activeOrders: [
      { id: 'WO-2026-000130', address: 'ЖК «Символ»', type: 'Монтаж', status: 'В работе', engineer: 'Власов Максим' },
      { id: 'WO-2026-000131', address: 'Офис «Техносфера»', type: 'Монтаж', status: 'В работе', engineer: 'Субботин Игорь' },
      { id: 'WO-2026-000132', address: 'Ресторан «Бридж»', type: 'Монтаж', status: 'Назначен', engineer: 'Жуков Алексей' },
      { id: 'WO-2026-000133', address: 'СТО «АвтоМастер»', type: 'Монтаж', status: 'Назначен', engineer: 'Борисов Андрей' },
    ],
    weekSchedule: [
      { engineer: 'Власов Максим', mon: 'Монтаж', tue: 'Монтаж', wed: 'Монтаж', thu: 'Монтаж', fri: 'Наладка' },
      { engineer: 'Субботин Игорь', mon: 'Монтаж', tue: 'Монтаж', wed: 'Монтаж', thu: 'Монтаж', fri: 'Выходной' },
      { engineer: 'Жуков Алексей', mon: 'Выходной', tue: 'Монтаж', wed: 'Монтаж', thu: 'Монтаж', fri: 'Монтаж' },
      { engineer: 'Никитин Роман', mon: 'Монтаж', tue: 'Монтаж', wed: 'Выходной', thu: 'Монтаж', fri: 'Монтаж' },
      { engineer: 'Борисов Андрей', mon: 'Монтаж', tue: 'Монтаж', wed: 'Монтаж', thu: 'Выходной', fri: 'Монтаж' },
      { engineer: 'Соловьёв Пётр', mon: 'Наладка', tue: 'Наладка', wed: 'Наладка', thu: 'Наладка', fri: 'Наладка' },
    ],
  },
  {
    id: 'GRP-007',
    name: 'VIP-клиенты',
    icon: 'Star',
    description: 'Выделенная команда для обслуживания ключевых клиентов',
    territory: 'Москва (весь город)',
    specializations: ['Ремонт', 'ТО', 'Монтаж'],
    load: 60,
    engineers: [
      { id: 'E28', name: 'Громов Александр', role: 'VIP-менеджер', online: true },
      { id: 'E29', name: 'Суворов Владимир', role: 'Ст. инженер VIP', online: true },
      { id: 'E30', name: 'Медведев Константин', role: 'Инженер VIP', online: false },
    ],
    activeOrders: [
      { id: 'WO-2026-000140', address: 'Офис Сбербанк HQ', type: 'ТО', status: 'В работе', engineer: 'Суворов Владимир' },
      { id: 'WO-2026-000141', address: 'Яндекс Аркадия', type: 'Диагностика', status: 'Назначен', engineer: 'Медведев Константин' },
      { id: 'WO-2026-000142', address: 'Газпром Нефть Plaza', type: 'Ремонт', status: 'Назначен', engineer: 'Громов Александр' },
    ],
    weekSchedule: [
      { engineer: 'Громов Александр', mon: 'Контроль', tue: 'Контроль', wed: 'Выезд', thu: 'Контроль', fri: 'Контроль' },
      { engineer: 'Суворов Владимир', mon: 'ТО', tue: 'ТО', wed: 'Ремонт', thu: 'ТО', fri: 'ТО' },
      { engineer: 'Медведев Константин', mon: 'Монтаж', tue: 'Ремонт', wed: 'ТО', thu: 'Ремонт', fri: 'Выходной' },
    ],
  },
  {
    id: 'GRP-008',
    name: 'Подрядчики',
    icon: 'Briefcase',
    description: 'Привлечённые подрядные организации и внештатные специалисты',
    territory: 'МО и регионы',
    specializations: ['Ремонт', 'Монтаж', 'ТО'],
    load: 45,
    isContractor: true,
    engineers: [
      { id: 'C1', name: 'ИП Захаров С.В.', role: 'Подрядчик (монтаж)', online: false },
      { id: 'C2', name: 'ООО «КлиматСервис»', role: 'Подрядчик (ТО)', online: true },
      { id: 'C3', name: 'ИП Миронов А.Г.', role: 'Подрядчик (ремонт)', online: false },
      { id: 'C4', name: 'ООО «АрктикКлимат»', role: 'Подрядчик (монтаж)', online: true },
    ],
    activeOrders: [
      { id: 'WO-2026-000150', address: 'ТЦ «Щёлково»', type: 'Монтаж', status: 'В работе', engineer: 'ООО «КлиматСервис»' },
      { id: 'WO-2026-000152', address: 'Склад ПАО «Розница»', type: 'ТО', status: 'Назначен', engineer: 'ИП Захаров С.В.' },
    ],
    weekSchedule: [
      { engineer: 'ИП Захаров С.В.', mon: 'Монтаж', tue: 'Монтаж', wed: 'Выходной', thu: 'Монтаж', fri: 'Монтаж' },
      { engineer: 'ООО «КлиматСервис»', mon: 'ТО', tue: 'ТО', wed: 'ТО', thu: 'ТО', fri: 'Выходной' },
      { engineer: 'ИП Миронов А.Г.', mon: 'Ремонт', tue: 'Выходной', wed: 'Ремонт', thu: 'Ремонт', fri: 'Ремонт' },
      { engineer: 'ООО «АрктикКлимат»', mon: 'Монтаж', tue: 'Монтаж', wed: 'Монтаж', thu: 'Выходной', fri: 'Монтаж' },
    ],
  },
];

const ALL_ENGINEERS_LIST = [
  'Иванов Иван', 'Петров Сергей', 'Сидоров Алексей', 'Козлов Михаил',
  'Волков Николай', 'Новиков Андрей', 'Морозов Денис', 'Попов Виктор',
  'Лебедев Артём', 'Соколов Павел', 'Белов Кирилл', 'Орлов Роман',
  'Зайцев Игорь', 'Фёдоров Дмитрий', 'Кузнецов Антон',
];

const TERRITORIES = [
  'САО, СВАО', 'ЮАО, ЮЗАО', 'ЦАО, ЗАО', 'ВАО, ЮВАО',
  'Вся Москва', 'Москва и МО', 'МО и регионы',
];

const SPECIALIZATIONS: Specialization[] = ['Ремонт', 'ТО', 'Монтаж', 'Аварийный'];

// ─── Вспомогательные функции ───────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500',
  'bg-orange-500', 'bg-teal-500', 'bg-pink-500',
  'bg-indigo-500', 'bg-rose-500',
];

const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const getLoadColor = (load: number) => {
  if (load >= 85) return 'text-red-600';
  if (load >= 70) return 'text-yellow-600';
  return 'text-green-600';
};

const getLoadBarColor = (load: number) => {
  if (load >= 85) return 'bg-red-500';
  if (load >= 70) return 'bg-yellow-500';
  return 'bg-green-500';
};

const getSpecColor = (spec: Specialization) => {
  const map: Record<Specialization, string> = {
    'Ремонт': 'bg-blue-100 text-blue-700',
    'ТО': 'bg-green-100 text-green-700',
    'Монтаж': 'bg-purple-100 text-purple-700',
    'Аварийный': 'bg-red-100 text-red-700',
  };
  return map[spec];
};

const getOrderStatusColor = (status: ActiveOrder['status']) => {
  const map: Record<ActiveOrder['status'], string> = {
    'В работе': 'bg-blue-100 text-blue-700',
    'Назначен': 'bg-yellow-100 text-yellow-700',
    'Завершён': 'bg-green-100 text-green-700',
  };
  return map[status];
};

const getScheduleColor = (cell: string) => {
  if (cell === 'Выходной') return 'bg-gray-100 text-gray-400';
  if (cell === 'ТО') return 'bg-green-100 text-green-700';
  if (cell === 'Ремонт') return 'bg-blue-100 text-blue-700';
  if (cell === 'Монтаж' || cell === 'Наладка') return 'bg-purple-100 text-purple-700';
  if (cell === 'Аварийный' || cell === 'Дежурство') return 'bg-red-100 text-red-700';
  return 'bg-orange-100 text-orange-700';
};

// ─── Компоненты ────────────────────────────────────────────────────────────────

interface MetricCardProps {
  icon: string;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
}

const MetricCard = ({ icon, iconBg, iconColor, value, label }: MetricCardProps) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
    <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
      <Icon name={icon as Parameters<typeof Icon>[0]['name']} size={22} className={iconColor} />
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
    </div>
  </div>
);

interface GroupCardProps {
  group: WorkGroup;
  isSelected: boolean;
  onClick: () => void;
  onAddMember: (groupId: string) => void;
  onEdit: (groupId: string) => void;
}

const GroupCard = ({ group, isSelected, onClick, onAddMember, onEdit }: GroupCardProps) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-xl border transition-all cursor-pointer ${
      isSelected
        ? 'border-blue-500 shadow-md ring-1 ring-blue-200'
        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
    }`}
  >
    <div className="p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            group.isContractor ? 'bg-orange-100' : 'bg-blue-100'
          }`}>
            <Icon name={group.icon as Parameters<typeof Icon>[0]['name']} size={20} className={group.isContractor ? 'text-orange-600' : 'text-blue-600'} />
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm leading-tight">{group.name}</div>
            {group.isContractor && (
              <Badge className="mt-0.5 text-xs bg-orange-100 text-orange-700 px-1.5 py-0">Подрядчики</Badge>
            )}
          </div>
        </div>
        <Badge variant="outline" className="text-xs text-gray-400 flex-shrink-0">{group.id}</Badge>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 mb-3 leading-relaxed">{group.description}</p>

      {/* Territory */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
        <Icon name="MapPin" size={12} className="text-gray-400" />
        {group.territory}
      </div>

      {/* Specializations */}
      <div className="flex flex-wrap gap-1 mb-4">
        {group.specializations.map((spec) => (
          <span key={spec} className={`text-xs px-2 py-0.5 rounded-full font-medium ${getSpecColor(spec)}`}>
            {spec}
          </span>
        ))}
      </div>

      {/* Engineers avatars */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-2">
          {group.isContractor ? 'Подрядчики' : 'Инженеры'} ({group.engineers.length})
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {group.engineers.slice(0, 5).map((eng, i) => (
            <div
              key={eng.id}
              title={eng.name}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold relative ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
            >
              {getInitials(eng.name)}
              {eng.online && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
          ))}
          {group.engineers.length > 5 && (
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium">
              +{group.engineers.length - 5}
            </div>
          )}
        </div>
      </div>

      {/* Load bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">Загрузка</span>
          <span className={`text-xs font-semibold ${getLoadColor(group.load)}`}>{group.load}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${getLoadBarColor(group.load)}`}
            style={{ width: `${group.load}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-gray-100">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs h-8"
          onClick={(e) => { e.stopPropagation(); onEdit(group.id); }}
        >
          <Icon name="Pencil" size={12} className="mr-1" />
          Редактировать
        </Button>
        <Button
          size="sm"
          className="flex-1 text-xs h-8 bg-blue-600 hover:bg-blue-700"
          onClick={(e) => { e.stopPropagation(); onAddMember(group.id); }}
        >
          <Icon name="UserPlus" size={12} className="mr-1" />
          Участника
        </Button>
      </div>
    </div>
  </div>
);

interface DetailPanelProps {
  group: WorkGroup;
  onClose: () => void;
  onAddMember: () => void;
  onDeleteGroup: (groupId: string) => void;
}

const DetailPanel = ({ group, onClose, onAddMember, onDeleteGroup }: DetailPanelProps) => (
  <div className="w-[380px] flex-shrink-0 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden">
    {/* Panel header */}
    <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-2">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
          group.isContractor ? 'bg-orange-100' : 'bg-blue-100'
        }`}>
          <Icon name={group.icon as Parameters<typeof Icon>[0]['name']} size={20} className={group.isContractor ? 'text-orange-600' : 'text-blue-600'} />
        </div>
        <div>
          <div className="font-semibold text-gray-900">{group.name}</div>
          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <Icon name="MapPin" size={11} className="text-gray-400" />
            {group.territory}
          </div>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Icon name="X" size={18} />
      </button>
    </div>

    <div className="flex-1 overflow-y-auto">
      {/* Members */}
      <div className="p-5 border-b border-gray-100">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Участники ({group.engineers.length})
        </div>
        <div className="space-y-2.5">
          {group.engineers.map((eng, i) => (
            <div key={eng.id} className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 relative ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                {getInitials(eng.name)}
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-white rounded-full ${eng.online ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{eng.name}</div>
                <div className="text-xs text-gray-500 truncate">{eng.role}</div>
              </div>
              <Badge className={`text-xs px-1.5 py-0 flex-shrink-0 ${eng.online ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {eng.online ? 'Онлайн' : 'Офлайн'}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Active orders */}
      <div className="p-5 border-b border-gray-100">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Активные наряды ({group.activeOrders.length})
        </div>
        <div className="space-y-2">
          {group.activeOrders.map((order) => (
            <div key={order.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-mono text-gray-500">{order.id}</span>
                <Badge className={`text-xs px-1.5 py-0 ${getOrderStatusColor(order.status)}`}>
                  {order.status}
                </Badge>
              </div>
              <div className="text-sm font-medium text-gray-800 truncate">{order.address}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500">{order.type}</span>
                <span className="text-xs text-gray-500 truncate max-w-[140px] text-right">{order.engineer}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly schedule */}
      <div className="p-5">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Расписание на неделю
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left text-gray-400 pb-2 pr-2 font-medium whitespace-nowrap">Сотрудник</th>
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт'].map((d) => (
                  <th key={d} className="text-center text-gray-400 pb-2 px-0.5 font-medium w-10">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {group.weekSchedule.map((row) => (
                <tr key={row.engineer} className="border-t border-gray-50">
                  <td className="py-1.5 pr-2 text-gray-700 font-medium whitespace-nowrap">
                    {row.engineer.length > 12 ? row.engineer.slice(0, 12) + '…' : row.engineer}
                  </td>
                  {[row.mon, row.tue, row.wed, row.thu, row.fri].map((cell, ci) => (
                    <td key={ci} className="py-1.5 px-0.5 text-center">
                      <span className={`inline-block rounded px-1 py-0.5 text-[10px] font-medium ${getScheduleColor(cell)}`}>
                        {cell.length > 4 ? cell.slice(0, 4) : cell}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* Panel footer */}
    <div className="p-4 border-t border-gray-100 flex gap-2">
      <Button
        className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm h-9"
        onClick={onAddMember}
      >
        <Icon name="UserPlus" size={14} className="mr-1.5" />
        Добавить участника
      </Button>
      <Button
        variant="outline"
        className="h-9 px-3 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
        onClick={() => onDeleteGroup(group.id)}
      >
        <Icon name="Trash2" size={14} />
      </Button>
    </div>
  </div>
);

// ─── Форма создания группы ──────────────────────────────────────────────────────

interface CreateGroupForm {
  name: string;
  description: string;
  territory: string;
  specializations: Specialization[];
  leader: string;
}

const EMPTY_FORM: CreateGroupForm = {
  name: '',
  description: '',
  territory: '',
  specializations: [],
  leader: ALL_ENGINEERS_LIST[0],
};

// ─── Основной компонент ────────────────────────────────────────────────────────

const WorkGroupsFull = () => {
  const [groups, setGroups] = useState<WorkGroup[]>(MOCK_GROUPS);
  const [selectedGroup, setSelectedGroup] = useState<WorkGroup | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpec, setFilterSpec] = useState<Specialization | 'Все'>('Все');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateGroupForm>(EMPTY_FORM);

  // Metrics
  const totalGroups = groups.length;
  const totalEngineers = groups.filter((g) => !g.isContractor).reduce((s, g) => s + g.engineers.length, 0);
  const totalContractors = groups.find((g) => g.isContractor)?.engineers.length ?? 0;
  const avgLoad = Math.round(groups.reduce((s, g) => s + g.load, 0) / groups.length);

  // Filter
  const filteredGroups = groups.filter((g) => {
    const matchSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.territory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSpec = filterSpec === 'Все' || g.specializations.includes(filterSpec);
    return matchSearch && matchSpec;
  });

  const handleGroupClick = (group: WorkGroup) => {
    setSelectedGroup((prev) => (prev?.id === group.id ? null : group));
  };

  const handleAddMember = (groupId: string) => {
    toast.success(`Добавление участника в группу ${groups.find((g) => g.id === groupId)?.name}`);
  };

  const handleEdit = (groupId: string) => {
    toast.info(`Редактирование группы ${groups.find((g) => g.id === groupId)?.name}`);
  };

  const handleDeleteGroup = (groupId: string) => {
    const name = groups.find((g) => g.id === groupId)?.name;
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    if (selectedGroup?.id === groupId) setSelectedGroup(null);
    toast.success(`Группа «${name}» удалена`);
  };

  const toggleSpec = (spec: Specialization) => {
    setForm((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }));
  };

  const handleCreate = () => {
    if (!form.name.trim()) {
      toast.error('Введите название группы');
      return;
    }
    if (!form.territory) {
      toast.error('Выберите территорию');
      return;
    }
    if (form.specializations.length === 0) {
      toast.error('Выберите хотя бы одну специализацию');
      return;
    }

    const newGroup: WorkGroup = {
      id: `GRP-${String(groups.length + 1).padStart(3, '0')}`,
      name: form.name.trim(),
      icon: 'Users',
      description: form.description.trim() || 'Новая рабочая группа',
      territory: form.territory,
      specializations: form.specializations,
      load: 0,
      engineers: [
        {
          id: `E-new-${Date.now()}`,
          name: form.leader,
          role: 'Руководитель группы',
          online: false,
        },
      ],
      activeOrders: [],
      weekSchedule: [
        {
          engineer: form.leader,
          mon: 'Выходной', tue: 'Выходной', wed: 'Выходной', thu: 'Выходной', fri: 'Выходной',
        },
      ],
    };

    setGroups((prev) => [...prev, newGroup]);
    setIsCreateOpen(false);
    setForm(EMPTY_FORM);
    toast.success(`Группа «${newGroup.name}» создана`);
  };

  return (
    <div className="flex h-full bg-gray-50 overflow-hidden">
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Рабочие группы</h1>
              <p className="text-sm text-gray-500 mt-0.5">Управление бригадами и командами инженеров</p>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 h-9 text-sm"
              onClick={() => { setIsCreateOpen(true); setForm(EMPTY_FORM); }}
            >
              <Icon name="Plus" size={16} className="mr-1.5" />
              Создать группу
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard icon="Users" iconBg="bg-blue-100" iconColor="text-blue-600" value={String(totalGroups)} label="Рабочих групп" />
            <MetricCard icon="HardHat" iconBg="bg-green-100" iconColor="text-green-600" value={String(totalEngineers)} label="Инженеров в группах" />
            <MetricCard icon="Briefcase" iconBg="bg-orange-100" iconColor="text-orange-600" value={String(totalContractors)} label="Подрядчиков" />
            <MetricCard icon="Activity" iconBg="bg-purple-100" iconColor="text-purple-600" value={`${avgLoad}%`} label="Средняя загрузка" />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по группам..."
                className="pl-9 h-9 text-sm"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['Все', ...SPECIALIZATIONS] as const).map((spec) => (
                <button
                  key={spec}
                  onClick={() => setFilterSpec(spec)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterSpec === spec
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* Groups grid */}
          {filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Icon name="Search" size={40} className="mb-3 opacity-40" />
              <div className="text-sm">Группы не найдены</div>
            </div>
          ) : (
            <div className={`grid gap-5 ${selectedGroup ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'}`}>
              {filteredGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  isSelected={selectedGroup?.id === group.id}
                  onClick={() => handleGroupClick(group)}
                  onAddMember={handleAddMember}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selectedGroup && (
        <DetailPanel
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
          onAddMember={() => {
            toast.success(`Добавление участника в группу «${selectedGroup.name}»`);
          }}
          onDeleteGroup={handleDeleteGroup}
        />
      )}

      {/* Create modal overlay */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Создать группу</h2>
                <p className="text-xs text-gray-500 mt-0.5">Новая рабочая группа или бригада</p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <Icon name="X" size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4">
              {/* Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Название группы <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Например: Восточный округ"
                  className="h-9 text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Описание</label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Кратко о задачах группы"
                  className="h-9 text-sm"
                />
              </div>

              {/* Territory */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Территория обслуживания <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.territory}
                  onChange={(e) => setForm((p) => ({ ...p, territory: e.target.value }))}
                  className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Выберите территорию</option>
                  {TERRITORIES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Specializations */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Специализация <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALIZATIONS.map((spec) => {
                    const active = form.specializations.includes(spec);
                    return (
                      <button
                        key={spec}
                        onClick={() => toggleSpec(spec)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          active
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {active && <Icon name="Check" size={12} />}
                        {spec}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Leader */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Руководитель группы</label>
                <select
                  value={form.leader}
                  onChange={(e) => setForm((p) => ({ ...p, leader: e.target.value }))}
                  className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {ALL_ENGINEERS_LIST.map((eng) => (
                    <option key={eng} value={eng}>{eng}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <Button
                variant="outline"
                className="flex-1 h-9 text-sm"
                onClick={() => setIsCreateOpen(false)}
              >
                Отмена
              </Button>
              <Button
                className="flex-1 h-9 text-sm bg-blue-600 hover:bg-blue-700"
                onClick={handleCreate}
              >
                <Icon name="Plus" size={14} className="mr-1.5" />
                Создать группу
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkGroupsFull;
