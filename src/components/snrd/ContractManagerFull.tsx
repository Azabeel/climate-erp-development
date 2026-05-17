import { useState, useMemo } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

type ContractType = 'Обслуживание' | 'Монтаж' | 'Комплексный';
type ContractStatus = 'Активен' | 'Истекает' | 'Истёк' | 'Черновик';

interface HistoryRecord {
  date: string;
  change: string;
  author: string;
}

interface DocumentRecord {
  id: string;
  name: string;
  size: string;
  icon: string;
}

interface ServiceObject {
  id: string;
  name: string;
  address: string;
  equipment: string;
}

interface Contract {
  id: string;
  number: string;
  client: string;
  inn: string;
  kpp: string;
  address: string;
  type: ContractType;
  startDate: string;
  endDate: string;
  amount: number;
  status: ContractStatus;
  objectsCount: number;
  manager: string;
  slaPolicy: string;
  maintenanceFreq: string;
  objects: ServiceObject[];
  history: HistoryRecord[];
  documents: DocumentRecord[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const TODAY = new Date('2026-05-17');

const daysUntil = (dateStr: string): number => {
  const d = new Date(dateStr);
  return Math.ceil((d.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));
};

const CONTRACTS: Contract[] = [
  {
    id: '1',
    number: 'ДОГ-2025-001',
    client: 'ООО «ТехноСервис»',
    inn: '7712345678',
    kpp: '771201001',
    address: 'Москва, ул. Тверская, 12, оф. 401',
    type: 'Обслуживание',
    startDate: '2025-01-15',
    endDate: '2026-12-31',
    amount: 1_500_000,
    status: 'Активен',
    objectsCount: 12,
    manager: 'Иванова М.С.',
    slaPolicy: 'Стандарт SLA-A (реакция 4ч, устранение 24ч)',
    maintenanceFreq: 'Ежеквартально',
    objects: [
      { id: 'o1', name: 'Офис ТехноСервис — Центр', address: 'Москва, ул. Тверская, 12', equipment: 'VRF Daikin 48 кВт' },
      { id: 'o2', name: 'Склад №1', address: 'Москва, Варшавское ш., 45', equipment: 'Чиллер Mitsubishi 120 кВт' },
      { id: 'o3', name: 'Офис ТехноСервис — Север', address: 'Москва, Дмитровское ш., 9', equipment: 'Мультисплит 5×7 кВт' },
    ],
    history: [
      { date: '15.01.2025', change: 'Договор создан', author: 'Иванова М.С.' },
      { date: '01.03.2025', change: 'Добавлен объект «Склад №1»', author: 'Петров А.В.' },
      { date: '10.05.2025', change: 'Изменена SLA-политика на Стандарт SLA-A', author: 'Иванова М.С.' },
      { date: '20.11.2025', change: 'Сумма договора скорректирована (+150 000 ₽)', author: 'Козлова Т.Р.' },
    ],
    documents: [
      { id: 'd1', name: 'Договор ДОГ-2025-001.pdf', size: '2.4 МБ', icon: 'FileText' },
      { id: 'd2', name: 'Приложение №1 — Перечень оборудования.xlsx', size: '450 КБ', icon: 'Table' },
      { id: 'd3', name: 'Акт сдачи-приёмки.pdf', size: '1.1 МБ', icon: 'FileText' },
    ],
  },
  {
    id: '2',
    number: 'ДОГ-2025-002',
    client: 'АО «ПромСтрой»',
    inn: '5027098765',
    kpp: '502701001',
    address: 'Подольск, ул. Заводская, 3, каб. 12',
    type: 'Комплексный',
    startDate: '2025-03-01',
    endDate: '2026-06-01',
    amount: 850_000,
    status: 'Истекает',
    objectsCount: 5,
    manager: 'Петров А.В.',
    slaPolicy: 'Приоритет SLA-B (реакция 2ч, устранение 8ч)',
    maintenanceFreq: 'Ежемесячно',
    objects: [
      { id: 'o4', name: 'Производственный цех А', address: 'Подольск, ул. Заводская, 3', equipment: 'Приточная вентиляция 10 000 м³/ч' },
      { id: 'o5', name: 'Административный корпус', address: 'Подольск, ул. Заводская, 3А', equipment: 'Мультизональная VRF 36 кВт' },
    ],
    history: [
      { date: '01.03.2025', change: 'Договор создан', author: 'Петров А.В.' },
      { date: '15.04.2025', change: 'Добавлено доп. соглашение №1', author: 'Петров А.В.' },
      { date: '02.01.2026', change: 'Направлено уведомление о продлении', author: 'Иванова М.С.' },
    ],
    documents: [
      { id: 'd4', name: 'Договор ДОГ-2025-002.pdf', size: '3.1 МБ', icon: 'FileText' },
      { id: 'd5', name: 'Доп. соглашение №1.pdf', size: '680 КБ', icon: 'FileText' },
      { id: 'd6', name: 'График ТО.pdf', size: '520 КБ', icon: 'Calendar' },
    ],
  },
  {
    id: '3',
    number: 'ДОГ-2024-045',
    client: 'ИП Смирнов А.П.',
    inn: '501801234567',
    kpp: '',
    address: 'Москва, ул. Арбат, 22, кв. 5',
    type: 'Обслуживание',
    startDate: '2024-06-01',
    endDate: '2026-05-05',
    amount: 320_000,
    status: 'Истёк',
    objectsCount: 2,
    manager: 'Сидорова Е.Н.',
    slaPolicy: 'Базовый SLA-C (реакция 8ч, устранение 48ч)',
    maintenanceFreq: 'Раз в полгода',
    objects: [
      { id: 'o6', name: 'Торговая точка ул. Арбат', address: 'Москва, ул. Арбат, 22', equipment: 'Кассетный кондиционер 5 кВт' },
    ],
    history: [
      { date: '01.06.2024', change: 'Договор создан', author: 'Сидорова Е.Н.' },
      { date: '05.05.2026', change: 'Договор истёк', author: 'Система' },
    ],
    documents: [
      { id: 'd7', name: 'Договор ДОГ-2024-045.pdf', size: '1.8 МБ', icon: 'FileText' },
    ],
  },
  {
    id: '4',
    number: 'ДОГ-2026-003',
    client: 'ООО «МедЦентр Здоровье»',
    inn: '7734567890',
    kpp: '773401001',
    address: 'Москва, Ленинский пр., 78, стр. 2',
    type: 'Комплексный',
    startDate: '2026-01-01',
    endDate: '2027-12-31',
    amount: 2_200_000,
    status: 'Активен',
    objectsCount: 8,
    manager: 'Иванова М.С.',
    slaPolicy: 'Медицинский SLA-A+ (реакция 1ч, устранение 4ч)',
    maintenanceFreq: 'Ежемесячно',
    objects: [
      { id: 'o7', name: 'Клиника — Главный корпус', address: 'Москва, Ленинский пр., 78', equipment: 'Прецизионный кондиционер 40 кВт' },
      { id: 'o8', name: 'Лаборатория', address: 'Москва, Ленинский пр., 78Б', equipment: 'Фанкойлы 8×3 кВт' },
    ],
    history: [
      { date: '01.01.2026', change: 'Договор создан', author: 'Иванова М.С.' },
      { date: '15.01.2026', change: 'Назначена SLA-политика Медицинский A+', author: 'Иванова М.С.' },
      { date: '10.02.2026', change: 'Добавлен объект «Лаборатория»', author: 'Козлова Т.Р.' },
    ],
    documents: [
      { id: 'd8', name: 'Договор ДОГ-2026-003.pdf', size: '4.2 МБ', icon: 'FileText' },
      { id: 'd9', name: 'Техническое задание.pdf', size: '2.9 МБ', icon: 'ClipboardList' },
      { id: 'd10', name: 'SLA Приложение.pdf', size: '310 КБ', icon: 'ShieldCheck' },
    ],
  },
  {
    id: '5',
    number: 'ДОГ-2026-004',
    client: 'ТЦ «Галерея Север»',
    inn: '7701234567',
    kpp: '770101001',
    address: 'Москва, ул. Дмитровская, 5, оф. 200',
    type: 'Комплексный',
    startDate: '2026-02-15',
    endDate: '2028-02-14',
    amount: 4_800_000,
    status: 'Активен',
    objectsCount: 24,
    manager: 'Петров А.В.',
    slaPolicy: 'Торговый SLA-B (реакция 2ч, устранение 6ч)',
    maintenanceFreq: 'Еженедельно (летний период)',
    objects: [
      { id: 'o9', name: 'ТЦ Галерея — Зона А', address: 'Москва, ул. Дмитровская, 5', equipment: 'VRF система 180 кВт' },
      { id: 'o10', name: 'ТЦ Галерея — Зона Б', address: 'Москва, ул. Дмитровская, 5', equipment: 'Центральный чиллер 250 кВт' },
      { id: 'o11', name: 'Паркинг', address: 'Москва, ул. Дмитровская, 5 (подземный)', equipment: 'Вытяжная вентиляция 50 000 м³/ч' },
    ],
    history: [
      { date: '15.02.2026', change: 'Договор создан', author: 'Петров А.В.' },
      { date: '01.03.2026', change: 'Согласован план-график ТО', author: 'Петров А.В.' },
      { date: '10.04.2026', change: 'Добавлены объекты Зоны Б и Паркинг', author: 'Иванова М.С.' },
    ],
    documents: [
      { id: 'd11', name: 'Рамочный договор ДОГ-2026-004.pdf', size: '5.7 МБ', icon: 'FileText' },
      { id: 'd12', name: 'Список объектов и оборудования.xlsx', size: '820 КБ', icon: 'Table' },
      { id: 'd13', name: 'Акт о приёмке работ №1.pdf', size: '1.3 МБ', icon: 'FileCheck' },
    ],
  },
  {
    id: '6',
    number: 'ДОГ-2026-005',
    client: 'АО «СберТех»',
    inn: '7736207543',
    kpp: '773601001',
    address: 'Москва, ул. Вавилова, 19, этаж 12',
    type: 'Обслуживание',
    startDate: '2026-03-01',
    endDate: '2027-02-28',
    amount: 3_100_000,
    status: 'Активен',
    objectsCount: 16,
    manager: 'Козлова Т.Р.',
    slaPolicy: 'ЦОД SLA-A++ (реакция 30мин, устранение 2ч)',
    maintenanceFreq: 'Ежемесячно + мониторинг 24/7',
    objects: [
      { id: 'o12', name: 'ЦОД Москва-1', address: 'Москва, Нагатинская ул., 16', equipment: 'Прецизионные кондиционеры 4×30 кВт' },
      { id: 'o13', name: 'Офис СберТех', address: 'Москва, ул. Вавилова, 19', equipment: 'VRF Daikin 72 кВт' },
    ],
    history: [
      { date: '01.03.2026', change: 'Договор создан', author: 'Козлова Т.Р.' },
      { date: '05.03.2026', change: 'Назначена SLA-политика ЦОД A++', author: 'Козлова Т.Р.' },
    ],
    documents: [
      { id: 'd14', name: 'Договор абонентского обслуживания.pdf', size: '3.4 МБ', icon: 'FileText' },
      { id: 'd15', name: 'Регламент работ.pdf', size: '1.2 МБ', icon: 'ClipboardList' },
    ],
  },
  {
    id: '7',
    number: 'ДОГ-2026-006',
    client: 'ООО «АгроКомплекс»',
    inn: '5050012345',
    kpp: '505001001',
    address: 'Домодедово, ул. Промышленная, 7',
    type: 'Обслуживание',
    startDate: '2026-04-01',
    endDate: '2028-03-31',
    amount: 560_000,
    status: 'Активен',
    objectsCount: 3,
    manager: 'Сидорова Е.Н.',
    slaPolicy: 'Промышленный SLA-B (реакция 4ч, устранение 12ч)',
    maintenanceFreq: 'Раз в квартал',
    objects: [
      { id: 'o14', name: 'Склад-холодильник №1', address: 'Домодедово, ул. Промышленная, 7', equipment: 'Холодильная установка 80 кВт' },
    ],
    history: [
      { date: '01.04.2026', change: 'Договор создан', author: 'Сидорова Е.Н.' },
      { date: '20.04.2026', change: 'Акт первичного обследования подписан', author: 'Петров А.В.' },
    ],
    documents: [
      { id: 'd16', name: 'Договор ДОГ-2026-006.pdf', size: '2.1 МБ', icon: 'FileText' },
      { id: 'd17', name: 'Паспорт оборудования.pdf', size: '890 КБ', icon: 'Package' },
    ],
  },
  {
    id: '8',
    number: 'ДОГ-2026-007',
    client: 'ООО «НовоСтиль»',
    inn: '7708901234',
    kpp: '770801001',
    address: 'Москва, Садовническая ул., 11, оф. 3',
    type: 'Монтаж',
    startDate: '2026-05-01',
    endDate: '2027-04-30',
    amount: 0,
    status: 'Черновик',
    objectsCount: 4,
    manager: 'Иванова М.С.',
    slaPolicy: 'Не назначена',
    maintenanceFreq: 'Не назначена',
    objects: [],
    history: [
      { date: '01.05.2026', change: 'Черновик создан', author: 'Иванова М.С.' },
    ],
    documents: [
      { id: 'd18', name: 'Проект договора v2.docx', size: '540 КБ', icon: 'FileEdit' },
    ],
  },
  {
    id: '9',
    number: 'ДОГ-2026-008',
    client: 'ЗАО «ФармГрупп»',
    inn: '7743210987',
    kpp: '774301001',
    address: 'Москва, пр. Мира, 105, стр. 1',
    type: 'Комплексный',
    startDate: '2026-01-10',
    endDate: '2028-01-09',
    amount: 1_800_000,
    status: 'Активен',
    objectsCount: 6,
    manager: 'Козлова Т.Р.',
    slaPolicy: 'Фарма SLA-A (реакция 2ч, устранение 8ч)',
    maintenanceFreq: 'Ежемесячно',
    objects: [
      { id: 'o15', name: 'Производственный корпус', address: 'Москва, пр. Мира, 105', equipment: 'Чистые помещения, вентиляция' },
    ],
    history: [
      { date: '10.01.2026', change: 'Договор создан', author: 'Козлова Т.Р.' },
      { date: '25.01.2026', change: 'Согласован регламент допуска', author: 'Козлова Т.Р.' },
    ],
    documents: [
      { id: 'd19', name: 'Договор ДОГ-2026-008.pdf', size: '3.8 МБ', icon: 'FileText' },
      { id: 'd20', name: 'Регламент допуска на производство.pdf', size: '1.5 МБ', icon: 'ShieldCheck' },
    ],
  },
  {
    id: '10',
    number: 'ДОГ-2026-009',
    client: 'ГБУ «Школа №1547»',
    inn: '7714567890',
    kpp: '771401001',
    address: 'Москва, ул. Привольная, 70',
    type: 'Обслуживание',
    startDate: '2026-02-01',
    endDate: '2027-01-31',
    amount: 480_000,
    status: 'Активен',
    objectsCount: 5,
    manager: 'Сидорова Е.Н.',
    slaPolicy: 'Бюджетный SLA-C (реакция 8ч, устранение 48ч)',
    maintenanceFreq: 'Раз в квартал',
    objects: [
      { id: 'o16', name: 'Учебный корпус А', address: 'Москва, ул. Привольная, 70', equipment: 'Канальные кондиционеры 8×7 кВт' },
    ],
    history: [
      { date: '01.02.2026', change: 'Договор создан', author: 'Сидорова Е.Н.' },
    ],
    documents: [
      { id: 'd21', name: 'Муниципальный договор ДОГ-2026-009.pdf', size: '2.6 МБ', icon: 'FileText' },
      { id: 'd22', name: 'Котировочная документация.pdf', size: '1.1 МБ', icon: 'ClipboardList' },
    ],
  },
  {
    id: '11',
    number: 'ДОГ-2025-031',
    client: 'ООО «АвтоЛюкс»',
    inn: '5024098765',
    kpp: '502401001',
    address: 'Красногорск, МКАД 65 км, стр. 5',
    type: 'Монтаж',
    startDate: '2025-09-01',
    endDate: '2026-05-31',
    amount: 2_400_000,
    status: 'Истекает',
    objectsCount: 2,
    manager: 'Петров А.В.',
    slaPolicy: 'Постгарантийный SLA-B',
    maintenanceFreq: 'По завершении монтажа',
    objects: [
      { id: 'o17', name: 'Автосалон BMW', address: 'Красногорск, МКАД 65 км', equipment: 'VRF система 120 кВт + вентиляция' },
    ],
    history: [
      { date: '01.09.2025', change: 'Договор создан (монтаж)', author: 'Петров А.В.' },
      { date: '15.03.2026', change: 'Монтаж завершён на 80%', author: 'Петров А.В.' },
      { date: '01.04.2026', change: 'Направлено уведомление о подходе срока', author: 'Система' },
    ],
    documents: [
      { id: 'd23', name: 'Договор монтажа ДОГ-2025-031.pdf', size: '4.5 МБ', icon: 'FileText' },
      { id: 'd24', name: 'Проектная документация.pdf', size: '12 МБ', icon: 'Layers' },
    ],
  },
  {
    id: '12',
    number: 'ДОГ-2025-044',
    client: 'ООО «ЭкоМаркет»',
    inn: '7723456789',
    kpp: '772301001',
    address: 'Москва, ул. Большая Дорогомиловская, 8',
    type: 'Обслуживание',
    startDate: '2025-11-01',
    endDate: '2026-06-10',
    amount: 680_000,
    status: 'Истекает',
    objectsCount: 7,
    manager: 'Козлова Т.Р.',
    slaPolicy: 'Ритейл SLA-B (реакция 2ч, устранение 8ч)',
    maintenanceFreq: 'Ежемесячно',
    objects: [
      { id: 'o18', name: 'Супермаркет — главный зал', address: 'Москва, ул. Большая Дорогомиловская, 8', equipment: 'Мультизональная система 90 кВт' },
    ],
    history: [
      { date: '01.11.2025', change: 'Договор создан', author: 'Козлова Т.Р.' },
      { date: '17.05.2026', change: 'Клиент запросил коммерческое предложение на продление', author: 'Козлова Т.Р.' },
    ],
    documents: [
      { id: 'd25', name: 'Договор ДОГ-2025-044.pdf', size: '2.8 МБ', icon: 'FileText' },
    ],
  },
  {
    id: '13',
    number: 'ДОГ-2026-010',
    client: 'ФГАОУ «МФТИ»',
    inn: '5008012345',
    kpp: '500801001',
    address: 'Долгопрудный, Институтский пер., 9',
    type: 'Комплексный',
    startDate: '2026-01-20',
    endDate: '2028-01-19',
    amount: 3_600_000,
    status: 'Активен',
    objectsCount: 11,
    manager: 'Иванова М.С.',
    slaPolicy: 'Образование SLA-A (реакция 4ч, устранение 24ч)',
    maintenanceFreq: 'Ежеквартально + лето',
    objects: [
      { id: 'o19', name: 'Главный учебный корпус', address: 'Долгопрудный, Институтский пер., 9', equipment: 'Центральный кондиционер 200 кВт' },
      { id: 'o20', name: 'Лаборатории физфака', address: 'Долгопрудный, Институтский пер., 11', equipment: 'Прецизионные кондиционеры 6×15 кВт' },
    ],
    history: [
      { date: '20.01.2026', change: 'Договор заключён по итогам тендера', author: 'Иванова М.С.' },
      { date: '01.02.2026', change: 'Первичное обследование объектов', author: 'Сидорова Е.Н.' },
    ],
    documents: [
      { id: 'd26', name: 'Государственный договор ДОГ-2026-010.pdf', size: '6.1 МБ', icon: 'FileText' },
      { id: 'd27', name: 'Техническое задание тендера.pdf', size: '3.2 МБ', icon: 'ClipboardList' },
      { id: 'd28', name: 'Акт обследования.pdf', size: '1.8 МБ', icon: 'FileCheck' },
    ],
  },
  {
    id: '14',
    number: 'ДОГ-2026-011',
    client: 'ООО «РестоГрупп»',
    inn: '7709876543',
    kpp: '770901001',
    address: 'Москва, Страстной бульвар, 4',
    type: 'Монтаж',
    startDate: '2026-04-15',
    endDate: '2026-09-30',
    amount: 1_200_000,
    status: 'Активен',
    objectsCount: 3,
    manager: 'Петров А.В.',
    slaPolicy: 'Монтажный (без SLA)',
    maintenanceFreq: 'Послемонтажный сервис 1 год',
    objects: [
      { id: 'o21', name: 'Ресторан «Центральный»', address: 'Москва, Страстной бульвар, 4', equipment: 'VRF + вентиляция кухни 20 000 м³/ч' },
    ],
    history: [
      { date: '15.04.2026', change: 'Договор создан', author: 'Петров А.В.' },
      { date: '20.04.2026', change: 'Демонтаж старого оборудования', author: 'Петров А.В.' },
    ],
    documents: [
      { id: 'd29', name: 'Договор монтажа ДОГ-2026-011.pdf', size: '3.1 МБ', icon: 'FileText' },
      { id: 'd30', name: 'Смета монтажных работ.xlsx', size: '760 КБ', icon: 'Table' },
    ],
  },
  {
    id: '15',
    number: 'ДОГ-2026-012',
    client: 'ООО «ПитерСнаб»',
    inn: '7805678901',
    kpp: '780501001',
    address: 'Санкт-Петербург, пр. Обуховской обороны, 51',
    type: 'Обслуживание',
    startDate: '2026-03-15',
    endDate: '2027-03-14',
    amount: 920_000,
    status: 'Активен',
    objectsCount: 9,
    manager: 'Козлова Т.Р.',
    slaPolicy: 'Стандарт SLA-A (реакция 4ч, устранение 24ч)',
    maintenanceFreq: 'Ежеквартально',
    objects: [
      { id: 'o22', name: 'Склад готовой продукции', address: 'СПб, пр. Обуховской обороны, 51', equipment: 'Холодильные установки 3×60 кВт' },
      { id: 'o23', name: 'Офис логистики', address: 'СПб, пр. Обуховской обороны, 51А', equipment: 'Мультисплит 4×9 кВт' },
    ],
    history: [
      { date: '15.03.2026', change: 'Договор создан', author: 'Козлова Т.Р.' },
      { date: '01.04.2026', change: 'Первое плановое ТО выполнено', author: 'Сидорова Е.Н.' },
    ],
    documents: [
      { id: 'd31', name: 'Договор ДОГ-2026-012.pdf', size: '2.7 МБ', icon: 'FileText' },
      { id: 'd32', name: 'Акт первичного ТО.pdf', size: '940 КБ', icon: 'FileCheck' },
    ],
  },
];

// ─── Monthly chart data (12 months) ──────────────────────────────────────────

const MONTHLY_DATA = [
  { month: 'Июн 25', new: 3, terminated: 1, active: 28 },
  { month: 'Июл 25', new: 2, terminated: 0, active: 30 },
  { month: 'Авг 25', new: 4, terminated: 1, active: 33 },
  { month: 'Сен 25', new: 5, terminated: 2, active: 36 },
  { month: 'Окт 25', new: 3, terminated: 1, active: 38 },
  { month: 'Ноя 25', new: 6, terminated: 0, active: 44 },
  { month: 'Дек 25', new: 2, terminated: 2, active: 44 },
  { month: 'Янв 26', new: 5, terminated: 1, active: 48 },
  { month: 'Фев 26', new: 4, terminated: 2, active: 50 },
  { month: 'Мар 26', new: 3, terminated: 1, active: 52 },
  { month: 'Апр 26', new: 2, terminated: 3, active: 51 },
  { month: 'Май 26', new: 2, terminated: 1, active: 52 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<ContractStatus, { label: string; bg: string; text: string; dot: string }> = {
  Активен:  { label: 'Активен',  bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  Истекает: { label: 'Истекает', bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
  Истёк:    { label: 'Истёк',    bg: 'bg-gray-100',    text: 'text-gray-600',    dot: 'bg-gray-400'    },
  Черновик: { label: 'Черновик', bg: 'bg-blue-100',    text: 'text-blue-700',    dot: 'bg-blue-400'    },
};

const TYPE_CFG: Record<ContractType, { bg: string; text: string }> = {
  Обслуживание: { bg: 'bg-violet-100', text: 'text-violet-700' },
  Монтаж:       { bg: 'bg-sky-100',    text: 'text-sky-700'    },
  Комплексный:  { bg: 'bg-teal-100',   text: 'text-teal-700'   },
};

const fmtMoney = (n: number): string => {
  if (n === 0) return '—';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(n);
};

const fmtDate = (s: string): string => {
  if (!s || s === '—') return '—';
  const [y, m, d] = s.split('-');
  return `${d}.${m}.${y}`;
};

// ─── MetricCard ───────────────────────────────────────────────────────────────

interface MetricCardProps {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  iconBg: string;
  iconColor: string;
  valueCls?: string;
}

const MetricCard = ({ icon, label, value, sub, iconBg, iconColor, valueCls = 'text-gray-900' }: MetricCardProps) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
    <div className={`${iconBg} rounded-lg p-2.5 flex-shrink-0`}>
      <Icon name={icon} size={20} className={iconColor} />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-500 font-medium truncate">{label}</p>
      <p className={`text-xl font-bold leading-tight ${valueCls}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 truncate mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ─── NewContractModal ─────────────────────────────────────────────────────────

interface NewContractModalProps {
  onClose: () => void;
}

const OBJECTS_LIST = [
  'Главный офис',
  'Склад №1',
  'Производственный цех А',
  'Торговый зал',
  'Серверная комната',
  'Архив',
];

const SLA_POLICIES = [
  'Базовый SLA-C (реакция 8ч, устранение 48ч)',
  'Стандарт SLA-A (реакция 4ч, устранение 24ч)',
  'Приоритет SLA-B (реакция 2ч, устранение 8ч)',
  'Премиум SLA-A+ (реакция 1ч, устранение 4ч)',
  'ЦОД SLA-A++ (реакция 30мин, устранение 2ч)',
  'Монтажный (без SLA)',
];

const NewContractModal = ({ onClose }: NewContractModalProps) => {
  const [form, setForm] = useState({
    client: '',
    type: 'Обслуживание' as ContractType,
    startDate: '',
    endDate: '',
    amount: '',
    slaPolicy: SLA_POLICIES[0],
  });
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);

  const update = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  const toggleObject = (obj: string) =>
    setSelectedObjects(prev =>
      prev.includes(obj) ? prev.filter(o => o !== obj) : [...prev, obj]
    );

  const handleSave = () => {
    if (!form.client.trim()) {
      toast.error('Укажите клиента');
      return;
    }
    if (!form.startDate || !form.endDate) {
      toast.error('Укажите даты договора');
      return;
    }
    toast.success(`Договор для «${form.client}» создан как черновик`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Новый договор</h2>
            <p className="text-xs text-gray-500 mt-0.5">Заполните основные данные</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Клиент *</label>
              <Input
                value={form.client}
                onChange={update('client')}
                placeholder="Наименование клиента или ИП"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Тип договора *</label>
              <select
                value={form.type}
                onChange={update('type')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {(['Обслуживание', 'Монтаж', 'Комплексный'] as ContractType[]).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Дата начала *</label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={update('startDate')}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Дата окончания *</label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={update('endDate')}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Сумма договора, ₽</label>
              <Input
                type="number"
                value={form.amount}
                onChange={update('amount')}
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">SLA-политика</label>
              <select
                value={form.slaPolicy}
                onChange={update('slaPolicy')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {SLA_POLICIES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                Объекты обслуживания
              </label>
              <div className="grid grid-cols-2 gap-2">
                {OBJECTS_LIST.map(obj => (
                  <label
                    key={obj}
                    className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 select-none"
                  >
                    <input
                      type="checkbox"
                      checked={selectedObjects.includes(obj)}
                      onChange={() => toggleObject(obj)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-400"
                    />
                    {obj}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6 pt-4 border-t border-gray-100 flex-shrink-0">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Отмена
          </Button>
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSave}
          >
            Сохранить как черновик
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── DetailPanel ──────────────────────────────────────────────────────────────

interface DetailPanelProps {
  contract: Contract;
  onClose: () => void;
}

const DetailPanel = ({ contract, onClose }: DetailPanelProps) => {
  const cfg = STATUS_CFG[contract.status];
  const typeCfg = TYPE_CFG[contract.type];
  const days = daysUntil(contract.endDate);
  const isExpiring = contract.status === 'Истекает';
  const isExpired = contract.status === 'Истёк';

  return (
    <div className="w-[400px] flex-shrink-0 border-l border-gray-200 bg-white flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-gray-400 font-mono font-semibold">{contract.number}</p>
            <h3 className="text-sm font-bold text-gray-900 mt-0.5 leading-snug">{contract.client}</h3>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge className={`text-xs font-medium border-0 ${cfg.bg} ${cfg.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-1 inline-block ${cfg.dot}`} />
                {cfg.label}
              </Badge>
              <Badge className={`text-xs font-medium border-0 ${typeCfg.bg} ${typeCfg.text}`}>
                {contract.type}
              </Badge>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 mt-0.5"
          >
            <Icon name="X" size={18} />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-4 space-y-5">

          {/* Expiry warning */}
          {isExpiring && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
              <Icon name="AlertTriangle" size={16} className="text-amber-500 flex-shrink-0" />
              <span className="text-sm text-amber-700 font-medium">
                Истекает через {days} дн. — необходимо продление
              </span>
            </div>
          )}
          {isExpired && (
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 flex items-center gap-2">
              <Icon name="AlertCircle" size={16} className="text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-600 font-medium">Договор истёк</span>
            </div>
          )}

          {/* Client requisites */}
          <section>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Реквизиты клиента
            </p>
            <div className="bg-gray-50 rounded-lg divide-y divide-gray-100">
              {[
                { label: 'ИНН', value: contract.inn || '—' },
                { label: 'КПП', value: contract.kpp || '—' },
                { label: 'Адрес', value: contract.address },
              ].map(row => (
                <div key={row.label} className="px-3 py-2 flex items-start justify-between gap-2">
                  <span className="text-xs text-gray-500 flex-shrink-0">{row.label}</span>
                  <span className="text-xs font-medium text-gray-800 text-right">{row.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Contract params */}
          <section>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Параметры договора
            </p>
            <div className="bg-gray-50 rounded-lg divide-y divide-gray-100">
              {[
                { label: 'Дата начала',   value: fmtDate(contract.startDate)   },
                { label: 'Дата окончания', value: fmtDate(contract.endDate), cls: isExpiring ? 'text-amber-700 font-bold' : undefined },
                { label: 'Сумма',          value: fmtMoney(contract.amount)    },
                { label: 'Менеджер',       value: contract.manager             },
                { label: 'SLA-политика',   value: contract.slaPolicy           },
                { label: 'Периодичность ТО', value: contract.maintenanceFreq  },
              ].map(row => (
                <div key={row.label} className="px-3 py-2 flex items-start justify-between gap-2">
                  <span className="text-xs text-gray-500 flex-shrink-0 max-w-[120px]">{row.label}</span>
                  <span className={`text-xs font-medium text-right ${row.cls ?? 'text-gray-800'}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Objects */}
          {contract.objects.length > 0 && (
            <section>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Объекты ({contract.objectsCount})
              </p>
              <div className="space-y-2">
                {contract.objects.map(obj => (
                  <div key={obj.id} className="border border-gray-100 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-800">{obj.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{obj.address}</p>
                    <p className="text-xs text-blue-600 mt-1 font-medium">{obj.equipment}</p>
                  </div>
                ))}
                {contract.objectsCount > contract.objects.length && (
                  <p className="text-xs text-gray-400 text-center py-1 italic">
                    + ещё {contract.objectsCount - contract.objects.length} объект(а)
                  </p>
                )}
              </div>
            </section>
          )}

          {/* History */}
          <section>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              История изменений
            </p>
            <div className="space-y-2">
              {contract.history.map((h, i) => (
                <div key={i} className="flex gap-2.5">
                  <div className="flex-shrink-0 w-5 flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-0.5 flex-shrink-0" />
                    {i < contract.history.length - 1 && (
                      <div className="w-px flex-1 bg-gray-200 mt-1" />
                    )}
                  </div>
                  <div className="pb-2 min-w-0">
                    <p className="text-xs font-medium text-gray-800 leading-snug">{h.change}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {h.date} · {h.author}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Documents */}
          <section>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Документы
            </p>
            <div className="space-y-1.5">
              {contract.documents.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => toast.success(`Загрузка: ${doc.name}`)}
                  className="w-full flex items-center gap-2.5 border border-gray-100 rounded-lg px-3 py-2 hover:bg-blue-50 hover:border-blue-200 transition-colors group text-left"
                >
                  <div className="bg-blue-50 group-hover:bg-blue-100 rounded-md p-1.5 flex-shrink-0 transition-colors">
                    <Icon name={doc.icon} size={13} className="text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-400">{doc.size}</p>
                  </div>
                  <Icon name="Download" size={13} className="text-gray-300 group-hover:text-blue-500 flex-shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex-shrink-0 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => toast.success(`Договор ${contract.number} продлён`)}
          >
            <Icon name="RefreshCw" size={13} />
            Продлить
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => toast.error(`Договор ${contract.number} расторгнут`)}
          >
            <Icon name="XCircle" size={13} />
            Расторгнуть
          </Button>
        </div>
        <Button
          size="sm"
          className="w-full gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => toast.success(`Доп. соглашение к ${contract.number} создано`)}
        >
          <Icon name="FilePlus" size={13} />
          Создать доп. соглашение
        </Button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ContractManagerFull = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ContractType | 'Все'>('Все');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'Все'>('Все');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Enrich status: mark as Истекает if within 30 days
  const enriched = useMemo(() =>
    CONTRACTS.map(c => {
      const days = daysUntil(c.endDate);
      const status: ContractStatus =
        c.status === 'Активен' && days > 0 && days <= 30 ? 'Истекает' : c.status;
      return { ...c, status };
    }),
  []);

  // Filtered list
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return enriched.filter(c => {
      const matchSearch =
        !q ||
        c.client.toLowerCase().includes(q) ||
        c.number.toLowerCase().includes(q) ||
        c.manager.toLowerCase().includes(q);
      const matchType = typeFilter === 'Все' || c.type === typeFilter;
      const matchStatus = statusFilter === 'Все' || c.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [enriched, search, typeFilter, statusFilter]);

  const selected = useMemo(
    () => enriched.find(c => c.id === selectedId) ?? null,
    [enriched, selectedId]
  );

  // Metrics
  const metrics = useMemo(() => {
    const active = enriched.filter(c => c.status === 'Активен').length;
    const expiring = enriched.filter(c => c.status === 'Истекает').length;
    const totalAmount = enriched
      .filter(c => c.status === 'Активен' || c.status === 'Истекает')
      .reduce((sum, c) => sum + c.amount, 0);
    return { active, expiring, totalAmount };
  }, [enriched]);

  const handleRowClick = (id: string) => {
    setSelectedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">

        {/* Title row */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Управление договорами</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Контракты на обслуживание, монтаж и комплексное сопровождение
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm"
            onClick={() => setShowModal(true)}
          >
            <Icon name="Plus" size={16} />
            Новый договор
          </Button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <MetricCard
            icon="FileText"
            label="Активных договоров"
            value={47}
            sub="из 52 в системе"
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <MetricCard
            icon="AlertTriangle"
            label="Истекает в 30 дней"
            value={metrics.expiring}
            sub="требуют внимания"
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
            valueCls={metrics.expiring > 0 ? 'text-amber-600' : 'text-gray-900'}
          />
          <MetricCard
            icon="TrendingUp"
            label="Сумма по договорам"
            value="12.4М ₽"
            sub="активные + истекающие"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <MetricCard
            icon="Plus"
            label="Новых за квартал"
            value={12}
            sub="янв–мар 2026"
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
          />
        </div>

        {/* Alert banner */}
        {metrics.expiring > 0 && (
          <div className="mb-4 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <Icon name="Bell" size={18} className="text-amber-500 flex-shrink-0" />
            <span className="text-sm text-amber-800 font-medium flex-1">
              {metrics.expiring} договор{metrics.expiring > 1 ? 'а' : ''} истекает в ближайшие 30 дней
            </span>
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white text-xs gap-1.5 flex-shrink-0"
              onClick={() =>
                toast.success(`Уведомления направлены ${metrics.expiring} клиентам`)
              }
            >
              <Icon name="Send" size={13} />
              Уведомить клиентов
            </Button>
          </div>
        )}

        {/* Area chart */}
        <div className="bg-gray-50 rounded-xl border border-gray-100 px-4 pt-3 pb-2 mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Договоры по месяцам (июн 2025 — май 2026)
          </p>
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={MONTHLY_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradTerm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: '#94A3B8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94A3B8' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}
                labelStyle={{ fontWeight: 600, color: '#374151' }}
              />
              <Area
                type="monotone"
                dataKey="active"
                name="Активные"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#gradActive)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="new"
                name="Новые"
                stroke="#10B981"
                strokeWidth={1.5}
                fill="url(#gradNew)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="terminated"
                name="Расторгнутые"
                stroke="#F59E0B"
                strokeWidth={1.5}
                fill="url(#gradTerm)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-52 max-w-xs">
            <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              placeholder="Поиск по клиенту, номеру, менеджеру..."
              className="pl-9 pr-8 text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Icon name="X" size={12} />
              </button>
            )}
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
            {(['Все', 'Обслуживание', 'Монтаж', 'Комплексный'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  typeFilter === t
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as ContractStatus | 'Все')}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="Все">Все статусы</option>
            {(['Активен', 'Истекает', 'Истёк', 'Черновик'] as ContractStatus[]).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <span className="text-xs text-gray-400 ml-auto">
            {filtered.length} из {enriched.length}
          </span>
        </div>
      </div>

      {/* ── Table + Detail ───────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full min-w-[860px] border-collapse">
            <thead className="bg-white border-b border-gray-200 sticky top-0 z-10">
              <tr>
                {[
                  'Номер договора',
                  'Клиент',
                  'Тип',
                  'Дата начала',
                  'Дата окончания',
                  'Сумма, ₽',
                  'Статус',
                  'Объектов',
                  'Ответственный',
                ].map(h => (
                  <th
                    key={h}
                    className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const sCfg = STATUS_CFG[c.status];
                const tCfg = TYPE_CFG[c.type];
                const isSelected = selectedId === c.id;
                const rowIsExpiring = c.status === 'Истекает';

                return (
                  <tr
                    key={c.id}
                    onClick={() => handleRowClick(c.id)}
                    className={`border-b border-gray-100 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50'
                        : rowIsExpiring
                        ? 'bg-amber-50 hover:bg-amber-100'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-3 py-3">
                      <span className="text-xs font-mono font-bold text-gray-700">{c.number}</span>
                    </td>
                    <td className="px-3 py-3 max-w-[180px]">
                      <span className="text-sm font-medium text-gray-900 line-clamp-1">{c.client}</span>
                    </td>
                    <td className="px-3 py-3">
                      <Badge className={`text-xs font-medium border-0 ${tCfg.bg} ${tCfg.text} whitespace-nowrap`}>
                        {c.type}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {fmtDate(c.startDate)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`text-xs ${rowIsExpiring ? 'text-amber-700 font-bold' : 'text-gray-500'}`}>
                        {fmtDate(c.endDate)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs font-semibold text-gray-800 whitespace-nowrap">
                      {fmtMoney(c.amount)}
                    </td>
                    <td className="px-3 py-3">
                      <Badge className={`text-xs font-medium border-0 ${sCfg.bg} ${sCfg.text} whitespace-nowrap`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1 inline-block ${sCfg.dot}`} />
                        {sCfg.label}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Icon name="Building2" size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-700 font-semibold">{c.objectsCount}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <Icon name="User" size={10} className="text-gray-500" />
                        </div>
                        <span className="text-xs text-gray-600 whitespace-nowrap">{c.manager}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-20 text-center text-gray-400">
                    <Icon name="FileX" size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Договоры не найдены</p>
                    <p className="text-xs mt-1 opacity-70">Измените фильтры или условия поиска</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        {selected && (
          <DetailPanel
            contract={selected}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>

      {/* ── Modal ───────────────────────────────────────────────────────── */}
      {showModal && <NewContractModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default ContractManagerFull;
