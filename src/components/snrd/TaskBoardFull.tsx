import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type TaskStatus = 'new' | 'in_progress' | 'review' | 'done';
type TaskPriority = 'normal' | 'urgent' | 'critical';
type TaskTag = 'Наряд' | 'Клиент' | 'Внутренняя' | 'Закупка';
type ViewMode = 'kanban' | 'list';

interface SubTask {
  id: string;
  title: string;
  done: boolean;
}

interface Comment {
  id: string;
  author: string;
  authorInitials: string;
  text: string;
  time: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  status: TaskStatus;
  priority: TaskPriority;
  tag: TaskTag;
  assignee: string;
  assigneeInitials: string;
  assigneeColor: string;
  watchers: { name: string; initials: string; color: string }[];
  dueDate: string;
  isOverdue: boolean;
  linkedObject?: string;
  subTasks: SubTask[];
  comments: Comment[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const TASKS: Task[] = [
  {
    id: 'T-001',
    title: 'Замена компрессора — ТЦ Мегаполис',
    description: 'Выехать на объект, демонтировать старый компрессор Daikin, установить новый',
    fullDescription: 'Необходимо выехать в ТЦ Мегаполис (Ленинский пр., 98). Демонтировать неисправный компрессор Daikin RSXYP112, установить новый из склада (серийный №DK-2024-0411). После монтажа провести вакуумирование, дозаправить R-410A (2.3 кг), проверить давление и температурные режимы. Клиент требует завершить до 18:00.',
    status: 'new',
    priority: 'critical',
    tag: 'Наряд',
    assignee: 'Новиков И.',
    assigneeInitials: 'НИ',
    assigneeColor: 'bg-blue-500',
    watchers: [
      { name: 'Петров А.', initials: 'ПА', color: 'bg-purple-500' },
      { name: 'Козлов Д.', initials: 'КД', color: 'bg-green-500' },
    ],
    dueDate: '2026-05-17',
    isOverdue: false,
    linkedObject: 'Наряд WO-2026-000487',
    subTasks: [
      { id: 'st-1', title: 'Забрать компрессор со склада', done: false },
      { id: 'st-2', title: 'Демонтаж старого блока', done: false },
      { id: 'st-3', title: 'Монтаж нового компрессора', done: false },
      { id: 'st-4', title: 'Вакуумирование и заправка', done: false },
      { id: 'st-5', title: 'Проверка работы, закрыть наряд', done: false },
    ],
    comments: [
      { id: 'c1', author: 'Козлов Д.', authorInitials: 'КД', text: 'Клиент просил успеть до обеда — торговый зал не работает пока идёт ремонт.', time: '09:15' },
      { id: 'c2', author: 'Новиков И.', authorInitials: 'НИ', text: 'Выезжаю в 09:30, буду на месте к 10:00.', time: '09:28' },
    ],
  },
  {
    id: 'T-002',
    title: 'Обзвонить клиентов с просроченным SLA',
    description: 'Связаться с клиентами по нарядам WO-000401 и WO-000415, объяснить причину задержки',
    fullDescription: 'Необходимо позвонить клиентам по нарядам с нарушенным SLA: ООО «АльфаТехнологии» (WO-2026-000401, просрочка 6 ч) и ИП Смирнов (WO-2026-000415, просрочка 2 ч). Объяснить причину задержки (поставка ЗИП), согласовать новую дату визита, зафиксировать результат в наряде.',
    status: 'new',
    priority: 'critical',
    tag: 'Клиент',
    assignee: 'Козлов Д.',
    assigneeInitials: 'КД',
    assigneeColor: 'bg-green-500',
    watchers: [{ name: 'Петров А.', initials: 'ПА', color: 'bg-purple-500' }],
    dueDate: '2026-05-16',
    isOverdue: true,
    linkedObject: 'Клиент ООО «АльфаТехнологии»',
    subTasks: [
      { id: 'st-1', title: 'Позвонить ООО «АльфаТехнологии»', done: false },
      { id: 'st-2', title: 'Позвонить ИП Смирнов', done: false },
      { id: 'st-3', title: 'Зафиксировать новые даты в нарядах', done: false },
    ],
    comments: [
      { id: 'c1', author: 'Петров А.', authorInitials: 'ПА', text: 'Срочно! Клиент из АльфаТехнологии уже звонил сам — недоволен.', time: '08:45' },
      { id: 'c2', author: 'Козлов Д.', authorInitials: 'КД', text: 'Понял, берусь за задачу.', time: '08:52' },
    ],
  },
  {
    id: 'T-003',
    title: 'Заказать запчасти для ТО июня',
    description: 'Сформировать заявку на фильтры, ремни, контактные группы — по плану ТО на июнь',
    fullDescription: 'По плану ТО на июнь запланировано 18 выездов на обслуживание сплит-систем. Необходимо сформировать заявку на расходные материалы: фильтры HEPA (30 шт), приводные ремни (12 шт), контактные группы (20 шт), сервисный R-32 (15 кг). Направить заявку поставщику ООО «КлиматСнаб» до конца недели.',
    status: 'new',
    priority: 'normal',
    tag: 'Закупка',
    assignee: 'Белова Н.',
    assigneeInitials: 'БН',
    assigneeColor: 'bg-orange-500',
    watchers: [{ name: 'Козлов Д.', initials: 'КД', color: 'bg-green-500' }],
    dueDate: '2026-05-19',
    isOverdue: false,
    linkedObject: undefined,
    subTasks: [
      { id: 'st-1', title: 'Выгрузить план ТО из системы', done: true },
      { id: 'st-2', title: 'Рассчитать потребность в материалах', done: false },
      { id: 'st-3', title: 'Согласовать заявку с руководителем', done: false },
      { id: 'st-4', title: 'Отправить поставщику', done: false },
    ],
    comments: [
      { id: 'c1', author: 'Белова Н.', authorInitials: 'БН', text: 'Выгрузила план, считаю потребность.', time: '10:30' },
    ],
  },
  {
    id: 'T-004',
    title: 'Обновить прайс-лист (хладагенты)',
    description: 'Цены на R-410A и R-32 выросли — обновить позиции в системе и на сайте',
    fullDescription: 'Получена информация от поставщиков о росте цен: R-410A +18%, R-32 +12%, R-22 +9%. Необходимо обновить прайс-лист в ERP, пересчитать стоимость работ по нарядам в статусе «Новый» и «В работе», обновить PDF-прайс на сайте. Уведомить менеджеров по продажам о новых ценах.',
    status: 'new',
    priority: 'urgent',
    tag: 'Внутренняя',
    assignee: 'Сидорова А.',
    assigneeInitials: 'СА',
    assigneeColor: 'bg-pink-500',
    watchers: [
      { name: 'Белова Н.', initials: 'БН', color: 'bg-orange-500' },
      { name: 'Петров А.', initials: 'ПА', color: 'bg-purple-500' },
    ],
    dueDate: '2026-05-18',
    isOverdue: false,
    linkedObject: undefined,
    subTasks: [
      { id: 'st-1', title: 'Получить актуальный прайс от поставщика', done: true },
      { id: 'st-2', title: 'Внести изменения в ERP', done: false },
      { id: 'st-3', title: 'Обновить PDF на сайте', done: false },
    ],
    comments: [],
  },
  {
    id: 'T-005',
    title: 'Диагностика чиллера — завод «Стройформат»',
    description: 'Выехать, диагностировать чиллер YORK, определить причину аварийного останова',
    fullDescription: 'Завод «Стройформат» сообщил об аварийном отключении чиллера YORK YK-2 (серийный №YK-2018-9921). Система выдаёт ошибку E-07 (высокое давление нагнетания). Необходимо провести диагностику, проверить давление хладагента, состояние конденсатора и датчиков. По результатам диагностики составить дефектную ведомость.',
    status: 'in_progress',
    priority: 'critical',
    tag: 'Наряд',
    assignee: 'Захаров П.',
    assigneeInitials: 'ЗП',
    assigneeColor: 'bg-cyan-500',
    watchers: [{ name: 'Новиков И.', initials: 'НИ', color: 'bg-blue-500' }],
    dueDate: '2026-05-17',
    isOverdue: false,
    linkedObject: 'Наряд WO-2026-000491',
    subTasks: [
      { id: 'st-1', title: 'Выезд на объект', done: true },
      { id: 'st-2', title: 'Визуальный осмотр', done: true },
      { id: 'st-3', title: 'Диагностика системы', done: false },
      { id: 'st-4', title: 'Составить дефектную ведомость', done: false },
    ],
    comments: [
      { id: 'c1', author: 'Захаров П.', authorInitials: 'ЗП', text: 'На месте. Конденсатор сильно загрязнён, начинаю промывку.', time: '11:15' },
      { id: 'c2', author: 'Новиков И.', authorInitials: 'НИ', text: 'Если нужен второй человек — могу подъехать после 14:00.', time: '11:20' },
      { id: 'c3', author: 'Захаров П.', authorInitials: 'ЗП', text: 'Справлюсь сам, спасибо. Возможно понадобятся запчасти.', time: '11:22' },
    ],
  },
  {
    id: 'T-006',
    title: 'Провести ТО — ресторан «Парус»',
    description: 'Плановое техническое обслуживание 4 кассетных блоков Mitsubishi Electric',
    fullDescription: 'Ежеквартальное ТО кассетных блоков Mitsubishi Electric серии MLZ-KP в ресторане «Парус» (пр. Победы, 12). 4 блока по 5 кВт. Работы: замена фильтров, промывка теплообменников, проверка дренажных систем, проверка уровня хладагента, смазка подшипников вентилятора.',
    status: 'in_progress',
    priority: 'normal',
    tag: 'Наряд',
    assignee: 'Новиков И.',
    assigneeInitials: 'НИ',
    assigneeColor: 'bg-blue-500',
    watchers: [],
    dueDate: '2026-05-17',
    isOverdue: false,
    linkedObject: 'Наряд WO-2026-000488',
    subTasks: [
      { id: 'st-1', title: 'Блок №1 — выполнено', done: true },
      { id: 'st-2', title: 'Блок №2 — выполнено', done: true },
      { id: 'st-3', title: 'Блок №3', done: false },
      { id: 'st-4', title: 'Блок №4', done: false },
    ],
    comments: [
      { id: 'c1', author: 'Новиков И.', authorInitials: 'НИ', text: 'Два блока обслужил, перерыв на обед, продолжаю в 13:00.', time: '12:05' },
    ],
  },
  {
    id: 'T-007',
    title: 'Согласовать договор с ООО «БетаГрупп»',
    description: 'Подготовить договор на сервисное обслуживание, согласовать с клиентом и юристом',
    fullDescription: 'ООО «БетаГрупп» готовы заключить договор на годовое обслуживание 12 объектов (офисы в 3 зданиях). Стоимость: 480 000 руб/год. Необходимо подготовить договор по шаблону, согласовать с юристом ООО «СервисКлимат», направить клиенту, дождаться подписания.',
    status: 'in_progress',
    priority: 'urgent',
    tag: 'Клиент',
    assignee: 'Козлов Д.',
    assigneeInitials: 'КД',
    assigneeColor: 'bg-green-500',
    watchers: [{ name: 'Петров А.', initials: 'ПА', color: 'bg-purple-500' }],
    dueDate: '2026-05-19',
    isOverdue: false,
    linkedObject: 'Клиент ООО «БетаГрупп»',
    subTasks: [
      { id: 'st-1', title: 'Заполнить шаблон договора', done: true },
      { id: 'st-2', title: 'Согласовать с юристом', done: false },
      { id: 'st-3', title: 'Направить клиенту', done: false },
      { id: 'st-4', title: 'Получить подписанный экземпляр', done: false },
    ],
    comments: [
      { id: 'c1', author: 'Козлов Д.', authorInitials: 'КД', text: 'Шаблон заполнен, отправил юристу на проверку.', time: '14:00' },
      { id: 'c2', author: 'Петров А.', authorInitials: 'ПА', text: 'Юрист говорит: 2-3 часа на проверку. Успеем сегодня.', time: '14:15' },
    ],
  },
  {
    id: 'T-008',
    title: 'Настроить интеграцию 1С — ERP',
    description: 'Проверить выгрузку актов и счетов в 1С:Бухгалтерию через REST API',
    fullDescription: 'Завершить настройку интеграции с 1С:Бухгалтерия 8.3. Текущая проблема: выгрузка счетов работает, но акты не передаются (ошибка 422 при POST /odata/Document_ActOfWork). Необходимо проверить маппинг полей, исправить ошибку, протестировать на 5 нарядах.',
    status: 'review',
    priority: 'urgent',
    tag: 'Внутренняя',
    assignee: 'Белова Н.',
    assigneeInitials: 'БН',
    assigneeColor: 'bg-orange-500',
    watchers: [
      { name: 'Козлов Д.', initials: 'КД', color: 'bg-green-500' },
      { name: 'Петров А.', initials: 'ПА', color: 'bg-purple-500' },
    ],
    dueDate: '2026-05-18',
    isOverdue: false,
    linkedObject: undefined,
    subTasks: [
      { id: 'st-1', title: 'Исправить маппинг полей актов', done: true },
      { id: 'st-2', title: 'Протестировать выгрузку (5 нарядов)', done: true },
      { id: 'st-3', title: 'Проверка в тестовой 1С', done: true },
      { id: 'st-4', title: 'Финальная проверка в боевой 1С', done: false },
    ],
    comments: [
      { id: 'c1', author: 'Белова Н.', authorInitials: 'БН', text: 'Ошибка была в формате даты — исправила. Тесты прошли.', time: '16:00' },
      { id: 'c2', author: 'Козлов Д.', authorInitials: 'КД', text: 'Отлично! Прошу подтвердить что в боевой базе тоже всё ок.', time: '16:20' },
    ],
  },
  {
    id: 'T-009',
    title: 'Проверить лицензии инженеров',
    description: 'У Новикова и Захарова истекают допуски в июне — инициировать продление',
    fullDescription: 'По данным системы: у Новикова И.А. истекает допуск к работе с хладагентами 15.06.2026, у Захарова П.В. — 22.06.2026. Необходимо направить инженеров на переаттестацию в Учебный центр «ТехноПрофи». Стоимость: 8 500 руб/чел. Согласовать даты с инженерами, чтобы не пересекались с выездами.',
    status: 'review',
    priority: 'urgent',
    tag: 'Внутренняя',
    assignee: 'Сидорова А.',
    assigneeInitials: 'СА',
    assigneeColor: 'bg-pink-500',
    watchers: [{ name: 'Петров А.', initials: 'ПА', color: 'bg-purple-500' }],
    dueDate: '2026-05-22',
    isOverdue: false,
    linkedObject: undefined,
    subTasks: [
      { id: 'st-1', title: 'Согласовать даты с Новиковым', done: true },
      { id: 'st-2', title: 'Согласовать даты с Захаровым', done: true },
      { id: 'st-3', title: 'Подать заявки в учебный центр', done: true },
      { id: 'st-4', title: 'Оплата и получение направлений', done: false },
    ],
    comments: [
      { id: 'c1', author: 'Сидорова А.', authorInitials: 'СА', text: 'Оба инженера согласны на 3-4 июня. Подаю заявки.', time: '15:00' },
    ],
  },
  {
    id: 'T-010',
    title: 'Провести инвентаризацию склада',
    description: 'Пересчитать остатки хладагентов и ЗИП на центральном складе, сверить с системой',
    fullDescription: 'Ежеквартальная инвентаризация центрального склада. Позиции: хладагенты (12 видов, 45 баллонов), запчасти (380 позиций), расходные материалы (120 позиций). Срок: 2 дня. По итогам — акт инвентаризации, ведомость расхождений, корректировка остатков в ERP.',
    status: 'done',
    priority: 'normal',
    tag: 'Внутренняя',
    assignee: 'Белова Н.',
    assigneeInitials: 'БН',
    assigneeColor: 'bg-orange-500',
    watchers: [{ name: 'Козлов Д.', initials: 'КД', color: 'bg-green-500' }],
    dueDate: '2026-05-15',
    isOverdue: false,
    linkedObject: undefined,
    subTasks: [
      { id: 'st-1', title: 'Хладагенты — пересчёт', done: true },
      { id: 'st-2', title: 'ЗИП — пересчёт', done: true },
      { id: 'st-3', title: 'Расходники — пересчёт', done: true },
      { id: 'st-4', title: 'Составить акт и ведомость', done: true },
      { id: 'st-5', title: 'Внести корректировки в ERP', done: true },
    ],
    comments: [
      { id: 'c1', author: 'Белова Н.', authorInitials: 'БН', text: 'Инвентаризация завершена. Расхождений по хладагентам нет, по ЗИП — недостача 3 позиций, акт готов.', time: '17:30' },
      { id: 'c2', author: 'Козлов Д.', authorInitials: 'КД', text: 'Хорошая работа! Акт утверждаю.', time: '17:45' },
    ],
  },
  {
    id: 'T-011',
    title: 'Закрыть наряды за прошлую неделю',
    description: 'Проверить и закрыть 8 нарядов в статусе «Выполнен», сформировать счета',
    fullDescription: 'Нужно закрыть наряды WO-480 — WO-487. По каждому: проверить заполнение акта, наличие фото до/после, подпись клиента (или электронное подтверждение), сформировать счёт и направить клиенту. Наряды по договорам — в 1С автоматически.',
    status: 'done',
    priority: 'urgent',
    tag: 'Наряд',
    assignee: 'Козлов Д.',
    assigneeInitials: 'КД',
    assigneeColor: 'bg-green-500',
    watchers: [{ name: 'Петров А.', initials: 'ПА', color: 'bg-purple-500' }],
    dueDate: '2026-05-16',
    isOverdue: false,
    linkedObject: undefined,
    subTasks: [
      { id: 'st-1', title: 'Закрыть WO-480 — WO-483', done: true },
      { id: 'st-2', title: 'Закрыть WO-484 — WO-487', done: true },
      { id: 'st-3', title: 'Сформировать счета (8 шт)', done: true },
    ],
    comments: [
      { id: 'c1', author: 'Козлов Д.', authorInitials: 'КД', text: 'Все 8 нарядов закрыты, счета направлены клиентам.', time: '11:00' },
    ],
  },
  {
    id: 'T-012',
    title: 'Обновить регламент выезда инженеров',
    description: 'Актуализировать внутренний регламент: добавить пункты по GPS, фото и безопасности',
    fullDescription: 'Действующий регламент от 2024 года устарел. Необходимо добавить: требования по GPS-трекингу (включать фоновую службу на время выезда), обязательные фото до и после работ, требования по охране труда на объектах с высоким напряжением. Согласовать с руководством, опубликовать в базе знаний.',
    status: 'done',
    priority: 'normal',
    tag: 'Внутренняя',
    assignee: 'Сидорова А.',
    assigneeInitials: 'СА',
    assigneeColor: 'bg-pink-500',
    watchers: [
      { name: 'Петров А.', initials: 'ПА', color: 'bg-purple-500' },
      { name: 'Новиков И.', initials: 'НИ', color: 'bg-blue-500' },
    ],
    dueDate: '2026-05-14',
    isOverdue: false,
    linkedObject: undefined,
    subTasks: [
      { id: 'st-1', title: 'Написать новый раздел по GPS', done: true },
      { id: 'st-2', title: 'Написать раздел по фото', done: true },
      { id: 'st-3', title: 'Написать раздел по ОТ', done: true },
      { id: 'st-4', title: 'Согласовать с руководством', done: true },
      { id: 'st-5', title: 'Опубликовать в базе знаний', done: true },
    ],
    comments: [
      { id: 'c1', author: 'Сидорова А.', authorInitials: 'СА', text: 'Регламент обновлён и опубликован.', time: '16:45' },
      { id: 'c2', author: 'Петров А.', authorInitials: 'ПА', text: 'Отлично, ознакомить всех инженеров под подпись.', time: '17:00' },
    ],
  },
];

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'new', label: 'Новые', color: 'bg-slate-100 text-slate-700' },
  { id: 'in_progress', label: 'В работе', color: 'bg-blue-100 text-blue-700' },
  { id: 'review', label: 'На проверке', color: 'bg-amber-100 text-amber-700' },
  { id: 'done', label: 'Готово', color: 'bg-green-100 text-green-700' },
];

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bar: string }> = {
  critical: { label: 'Критический', color: 'text-red-600', bar: 'bg-red-500' },
  urgent:   { label: 'Срочный',     color: 'text-orange-500', bar: 'bg-orange-400' },
  normal:   { label: 'Обычный',     color: 'text-slate-400', bar: 'bg-slate-300' },
};

const TAG_CONFIG: Record<TaskTag, string> = {
  Наряд:      'bg-blue-100 text-blue-700 border-blue-200',
  Клиент:     'bg-purple-100 text-purple-700 border-purple-200',
  Внутренняя: 'bg-slate-100 text-slate-600 border-slate-200',
  Закупка:    'bg-amber-100 text-amber-700 border-amber-200',
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  new:        'Новая',
  in_progress:'В работе',
  review:     'На проверке',
  done:       'Готово',
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, icon, accent }: { label: string; value: number; icon: string; accent: string }) {
  return (
    <Card className="flex-1 min-w-0">
      <CardContent className="flex items-center gap-3 py-4 px-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon name={icon as any} size={18} className="text-white" />
        </div>
        <div>
          <div className="text-2xl font-bold leading-tight">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ subTasks }: { subTasks: SubTask[] }) {
  if (subTasks.length === 0) return null;
  const done = subTasks.filter(s => s.done).length;
  const pct = Math.round((done / subTasks.length) * 100);
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>Подзадачи</span>
        <span>{done}/{subTasks.length}</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Task Card (Kanban) ───────────────────────────────────────────────────────

function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const pri = PRIORITY_CONFIG[task.priority];
  return (
    <div
      onClick={onClick}
      className="bg-white border border-slate-200 rounded-lg p-3 cursor-pointer hover:shadow-md hover:border-slate-300 transition-all group relative overflow-hidden"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${pri.bar}`} />
      <div className="pl-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className="text-xs text-muted-foreground font-mono">{task.id}</span>
          <Badge variant="outline" className={`text-xs px-1.5 py-0 ${TAG_CONFIG[task.tag]}`}>{task.tag}</Badge>
        </div>
        <p className="text-sm font-medium leading-snug mb-1 group-hover:text-blue-600 transition-colors">{task.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
        <ProgressBar subTasks={task.subTasks} />
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold ${task.assigneeColor}`}>
              {task.assigneeInitials}
            </div>
            <span className="text-xs text-muted-foreground">{task.assignee}</span>
          </div>
          <div className={`flex items-center gap-1 text-xs ${task.isOverdue ? 'text-red-500 font-semibold' : 'text-muted-foreground'}`}>
            <Icon name="Calendar" size={11} />
            {task.dueDate}
            {task.isOverdue && <Icon name="AlertCircle" size={11} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DetailPanel({ task, onClose, onStatusChange }: {
  task: Task;
  onClose: () => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}) {
  const pri = PRIORITY_CONFIG[task.priority];
  const [subTasks, setSubTasks] = useState(task.subTasks);

  const toggleSub = (subId: string) => {
    setSubTasks(prev => prev.map(s => s.id === subId ? { ...s, done: !s.done } : s));
  };

  const doneSubs = subTasks.filter(s => s.done).length;

  return (
    <div className="w-96 min-w-96 border-l border-slate-200 flex flex-col h-full bg-white overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">{task.id}</span>
          <Badge variant="outline" className={`text-xs ${TAG_CONFIG[task.tag]}`}>{task.tag}</Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <Icon name="X" size={14} />
        </Button>
      </div>

      <div className="px-4 py-3 border-b border-slate-100">
        <h2 className="text-base font-semibold leading-snug mb-1">{task.title}</h2>
        <p className="text-sm text-muted-foreground">{task.fullDescription}</p>
      </div>

      <div className="px-4 py-3 border-b border-slate-100 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground w-28 shrink-0">Статус</span>
          <Badge className={`text-xs ${task.status === 'done' ? 'bg-green-100 text-green-700' : task.status === 'review' ? 'bg-amber-100 text-amber-700' : task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
            {STATUS_LABELS[task.status]}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground w-28 shrink-0">Приоритет</span>
          <span className={`text-sm font-medium ${pri.color}`}>{pri.label}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground w-28 shrink-0">Срок</span>
          <span className={`text-sm ${task.isOverdue ? 'text-red-500 font-semibold' : ''}`}>
            {task.dueDate} {task.isOverdue && '— Просрочена!'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground w-28 shrink-0">Исполнитель</span>
          <div className="flex items-center gap-1.5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold ${task.assigneeColor}`}>{task.assigneeInitials}</div>
            <span>{task.assignee}</span>
          </div>
        </div>
        {task.watchers.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground w-28 shrink-0">Наблюдатели</span>
            <div className="flex items-center gap-1">
              {task.watchers.map(w => (
                <div key={w.initials} title={w.name} className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold ${w.color}`}>{w.initials}</div>
              ))}
            </div>
          </div>
        )}
        {task.linkedObject && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground w-28 shrink-0">Привязан к</span>
            <span className="text-blue-600 hover:underline cursor-pointer text-sm">{task.linkedObject}</span>
          </div>
        )}
      </div>

      {subTasks.length > 0 && (
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Подзадачи</span>
            <span className="text-xs text-muted-foreground">{doneSubs}/{subTasks.length}</span>
          </div>
          <div className="space-y-1.5">
            {subTasks.map(s => (
              <label key={s.id} className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" checked={s.done} onChange={() => toggleSub(s.id)} className="accent-blue-600 w-3.5 h-3.5" />
                <span className={`text-sm ${s.done ? 'line-through text-muted-foreground' : ''}`}>{s.title}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 py-3 border-b border-slate-100">
        <span className="text-sm font-medium">Комментарии</span>
        {task.comments.length === 0 ? (
          <p className="text-xs text-muted-foreground mt-2">Комментариев пока нет</p>
        ) : (
          <div className="mt-2 space-y-3">
            {task.comments.map(c => (
              <div key={c.id} className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-300 flex items-center justify-center text-xs font-semibold text-slate-700 shrink-0">{c.authorInitials}</div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium">{c.author}</span>
                    <span className="text-xs text-muted-foreground">{c.time}</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-3 flex flex-col gap-2 mt-auto">
        <div className="flex gap-2">
          <Select value={task.status} onValueChange={(v) => { onStatusChange(task.id, v as TaskStatus); toast.success('Статус обновлён'); }}>
            <SelectTrigger className="h-8 text-xs flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COLUMNS.map(c => <SelectItem key={c.id} value={c.id} className="text-xs">{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => toast.info('Назначение исполнителя')}>
            <Icon name="UserPlus" size={12} className="mr-1" />Назначить
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={onClose}>
          Закрыть панель
        </Button>
      </div>
    </div>
  );
}

// ─── New Task Dialog ──────────────────────────────────────────────────────────

function NewTaskDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Новая задача</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Заголовок</label>
            <Input placeholder="Введите название задачи..." className="h-9 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Описание</label>
            <textarea className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Описание задачи..." />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Приоритет</label>
              <Select>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Выбрать..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Обычный</SelectItem>
                  <SelectItem value="urgent">Срочный</SelectItem>
                  <SelectItem value="critical">Критический</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Тег</label>
              <Select>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Выбрать..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Наряд">Наряд</SelectItem>
                  <SelectItem value="Клиент">Клиент</SelectItem>
                  <SelectItem value="Внутренняя">Внутренняя</SelectItem>
                  <SelectItem value="Закупка">Закупка</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Исполнитель</label>
              <Select>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Выбрать..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ni">Новиков И.</SelectItem>
                  <SelectItem value="zp">Захаров П.</SelectItem>
                  <SelectItem value="kd">Козлов Д.</SelectItem>
                  <SelectItem value="bn">Белова Н.</SelectItem>
                  <SelectItem value="sa">Сидорова А.</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Срок</label>
              <Input type="date" className="h-9 text-sm" defaultValue="2026-05-20" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Отмена</Button>
          <Button size="sm" onClick={() => { toast.success('Задача создана'); onClose(); }}>
            <Icon name="Plus" size={14} className="mr-1" />Создать задачу
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TaskBoardFull() {
  const [view, setView] = useState<ViewMode>('kanban');
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterTag, setFilterTag] = useState('all');
  const [newTaskOpen, setNewTaskOpen] = useState(false);

  const assignees = Array.from(new Set(tasks.map(t => t.assignee)));

  const filtered = tasks.filter(t => {
    if (filterAssignee !== 'all' && t.assignee !== filterAssignee) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (filterTag !== 'all' && t.tag !== filterTag) return false;
    return true;
  });

  const handleStatusChange = (id: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    if (selectedTask?.id === id) setSelectedTask(prev => prev ? { ...prev, status } : null);
  };

  const total = tasks.length;
  const overdue = tasks.filter(t => t.isOverdue).length;
  const today = tasks.filter(t => t.dueDate === '2026-05-17').length;
  const doneWeek = tasks.filter(t => t.status === 'done').length;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Доска задач</h1>
            <p className="text-sm text-muted-foreground">Управление задачами команды</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-slate-200 rounded-lg overflow-hidden">
              <button onClick={() => setView('kanban')} className={`px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors ${view === 'kanban' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                <Icon name="LayoutDashboard" size={14} />Kanban
              </button>
              <button onClick={() => setView('list')} className={`px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                <Icon name="List" size={14} />Список
              </button>
            </div>
            <Button size="sm" onClick={() => setNewTaskOpen(true)}>
              <Icon name="Plus" size={14} className="mr-1" />Новая задача
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="flex gap-3">
          <KpiCard label="Всего задач" value={total} icon="ClipboardList" accent="bg-blue-500" />
          <KpiCard label="Просроченных" value={overdue} icon="AlertCircle" accent="bg-red-500" />
          <KpiCard label="На сегодня" value={today} icon="CalendarClock" accent="bg-amber-500" />
          <KpiCard label="Выполнено за неделю" value={doneWeek} icon="CheckCircle2" accent="bg-green-500" />
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 bg-white border-b border-slate-200 flex items-center gap-3">
        <Icon name="Filter" size={14} className="text-muted-foreground" />
        <Select value={filterAssignee} onValueChange={setFilterAssignee}>
          <SelectTrigger className="h-8 text-xs w-44">
            <SelectValue placeholder="Исполнитель" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все исполнители</SelectItem>
            {assignees.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="h-8 text-xs w-36">
            <SelectValue placeholder="Приоритет" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все приоритеты</SelectItem>
            <SelectItem value="critical">Критический</SelectItem>
            <SelectItem value="urgent">Срочный</SelectItem>
            <SelectItem value="normal">Обычный</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterTag} onValueChange={setFilterTag}>
          <SelectTrigger className="h-8 text-xs w-36">
            <SelectValue placeholder="Тег" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все теги</SelectItem>
            <SelectItem value="Наряд">Наряд</SelectItem>
            <SelectItem value="Клиент">Клиент</SelectItem>
            <SelectItem value="Внутренняя">Внутренняя</SelectItem>
            <SelectItem value="Закупка">Закупка</SelectItem>
          </SelectContent>
        </Select>
        {(filterAssignee !== 'all' || filterPriority !== 'all' || filterTag !== 'all') && (
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setFilterAssignee('all'); setFilterPriority('all'); setFilterTag('all'); }}>
            <Icon name="X" size={12} className="mr-1" />Сбросить
          </Button>
        )}
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} задач</span>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {view === 'kanban' ? (
          <div className="flex flex-1 gap-4 p-4 overflow-x-auto">
            {COLUMNS.map(col => {
              const colTasks = filtered.filter(t => t.status === col.id);
              return (
                <div key={col.id} className="flex flex-col w-72 min-w-72">
                  <div className={`flex items-center justify-between px-3 py-2 rounded-lg mb-3 ${col.color}`}>
                    <span className="text-sm font-semibold">{col.label}</span>
                    <span className="text-xs font-semibold bg-white/60 rounded-full px-2 py-0.5">{colTasks.length}</span>
                  </div>
                  <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-0.5">
                    {colTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onClick={() => setSelectedTask(task)}
                      />
                    ))}
                    {colTasks.length === 0 && (
                      <div className="text-center text-xs text-muted-foreground py-8 border-2 border-dashed border-slate-200 rounded-lg">
                        Нет задач
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 overflow-auto p-4">
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground w-8">–</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Задача</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Исполнитель</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Тег</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Срок</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Статус</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground w-20">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(task => {
                    const pri = PRIORITY_CONFIG[task.priority];
                    return (
                      <tr key={task.id} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedTask(task)}>
                        <td className="px-4 py-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${pri.bar}`} title={pri.label} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-sm">{task.title}</div>
                          <div className="text-xs text-muted-foreground font-mono">{task.id}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold ${task.assigneeColor}`}>{task.assigneeInitials}</div>
                            <span className="text-sm">{task.assignee}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`text-xs ${TAG_CONFIG[task.tag]}`}>{task.tag}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm ${task.isOverdue ? 'text-red-500 font-semibold' : 'text-muted-foreground'}`}>
                            {task.dueDate}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`text-xs ${task.status === 'done' ? 'bg-green-100 text-green-700' : task.status === 'review' ? 'bg-amber-100 text-amber-700' : task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                            {STATUS_LABELS[task.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedTask(task)}>
                              <Icon name="Eye" size={13} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast.info(`Редактирование ${task.id}`)}>
                              <Icon name="Pencil" size={13} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedTask && (
          <DetailPanel
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>

      <NewTaskDialog open={newTaskOpen} onClose={() => setNewTaskOpen(false)} />
    </div>
  );
}
