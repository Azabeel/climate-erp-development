import { useState, useMemo } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

type EquipType = 'Сплит-система' | 'VRV' | 'Чиллер' | 'Приточка';
type EquipStatus = 'Активно' | 'В ремонте' | 'Списано';

interface ServiceEvent {
  date: string;
  type: string;
  engineer: string;
  result: string;
}

interface EquipmentItem {
  id: string;
  brand: string;
  model: string;
  type: EquipType;
  serial: string;
  address: string;
  installYear: number;
  status: EquipStatus;
  refrigerant: string;
  powerKw: number;
  areaM2: number;
  inverter: boolean;
  history: ServiceEvent[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_EQUIPMENT: EquipmentItem[] = [
  { id: 'EQ-001', brand: 'Daikin', model: 'FTXB35C', type: 'Сплит-система', serial: 'DK2021-0014', address: 'БЦ «Горизонт», ул. Ленина, 15', installYear: 2021, status: 'Активно', refrigerant: 'R-410A', powerKw: 3.5, areaM2: 35, inverter: true, history: [{ date: '2026-04-10', type: 'ТО', engineer: 'Петров А.', result: 'Выполнено' }, { date: '2025-10-05', type: 'ТО', engineer: 'Козлов В.', result: 'Выполнено' }, { date: '2025-04-12', type: 'Ремонт', engineer: 'Петров А.', result: 'Выполнено' }] },
  { id: 'EQ-002', brand: 'Mitsubishi', model: 'MSZ-AP35VG', type: 'Сплит-система', serial: 'ME2022-0087', address: 'ТЦ «Плаза», пр. Мира, 42', installYear: 2022, status: 'Активно', refrigerant: 'R-32', powerKw: 3.5, areaM2: 30, inverter: true, history: [{ date: '2026-03-18', type: 'ТО', engineer: 'Иванов С.', result: 'Выполнено' }, { date: '2025-09-22', type: 'ТО', engineer: 'Сидоров Р.', result: 'Выполнено' }, { date: '2025-03-11', type: 'Диагностика', engineer: 'Иванов С.', result: 'Выполнено' }] },
  { id: 'EQ-003', brand: 'LG', model: 'ARUNM096GSS4', type: 'VRV', serial: 'LG2020-0033', address: 'ОЦ «Олимп», ул. Советская, 8', installYear: 2020, status: 'В ремонте', refrigerant: 'R-410A', powerKw: 28, areaM2: 450, inverter: true, history: [{ date: '2026-05-01', type: 'Ремонт', engineer: 'Петров А.', result: 'В работе' }, { date: '2025-11-14', type: 'ТО', engineer: 'Козлов В.', result: 'Выполнено' }, { date: '2025-05-20', type: 'ТО', engineer: 'Петров А.', result: 'Выполнено' }] },
  { id: 'EQ-004', brand: 'Daikin', model: 'RYYQ14T', type: 'VRV', serial: 'DK2019-0002', address: 'Завод «МеталлПром», ул. Заводская, 1', installYear: 2019, status: 'Активно', refrigerant: 'R-410A', powerKw: 40, areaM2: 800, inverter: true, history: [{ date: '2026-02-28', type: 'ТО', engineer: 'Иванов С.', result: 'Выполнено' }, { date: '2025-08-30', type: 'ТО', engineer: 'Сидоров Р.', result: 'Выполнено' }, { date: '2024-12-10', type: 'Ремонт', engineer: 'Козлов В.', result: 'Выполнено' }] },
  { id: 'EQ-005', brand: 'Carrier', model: '30XA-0602', type: 'Чиллер', serial: 'CR2018-0005', address: 'Гипермаркет «Семья», пр. Победы, 100', installYear: 2018, status: 'Активно', refrigerant: 'R-134a', powerKw: 600, areaM2: 5000, inverter: false, history: [{ date: '2026-04-22', type: 'ТО', engineer: 'Петров А.', result: 'Выполнено' }, { date: '2025-10-18', type: 'ТО', engineer: 'Иванов С.', result: 'Выполнено' }, { date: '2025-01-07', type: 'Ремонт', engineer: 'Козлов В.', result: 'Выполнено' }] },
  { id: 'EQ-006', brand: 'Trane', model: 'CGAM-200', type: 'Чиллер', serial: 'TR2021-0011', address: 'БЦ «Сити-Центр», ул. Центральная, 3', installYear: 2021, status: 'Активно', refrigerant: 'R-407C', powerKw: 200, areaM2: 2000, inverter: false, history: [{ date: '2026-03-05', type: 'ТО', engineer: 'Сидоров Р.', result: 'Выполнено' }, { date: '2025-09-01', type: 'ТО', engineer: 'Козлов В.', result: 'Выполнено' }, { date: '2024-11-20', type: 'Диагностика', engineer: 'Иванов С.', result: 'Выполнено' }] },
  { id: 'EQ-007', brand: 'Systemair', model: 'SAVE VSR 400', type: 'Приточка', serial: 'SY2022-0044', address: 'Школа №12, ул. Школьная, 5', installYear: 2022, status: 'Активно', refrigerant: '-', powerKw: 1.8, areaM2: 200, inverter: false, history: [{ date: '2026-04-15', type: 'ТО', engineer: 'Иванов С.', result: 'Выполнено' }, { date: '2025-10-10', type: 'ТО', engineer: 'Петров А.', result: 'Выполнено' }, { date: '2025-04-02', type: 'Замена фильтров', engineer: 'Иванов С.', result: 'Выполнено' }] },
  { id: 'EQ-008', brand: 'Mitsubishi', model: 'PUHZ-ZRP100VKA', type: 'VRV', serial: 'ME2023-0018', address: 'Отель «Парус», ул. Набережная, 22', installYear: 2023, status: 'Активно', refrigerant: 'R-32', powerKw: 10, areaM2: 120, inverter: true, history: [{ date: '2026-01-20', type: 'ТО', engineer: 'Козлов В.', result: 'Выполнено' }, { date: '2025-07-14', type: 'Диагностика', engineer: 'Сидоров Р.', result: 'Выполнено' }, { date: '2024-12-01', type: 'ТО', engineer: 'Козлов В.', result: 'Выполнено' }] },
  { id: 'EQ-009', brand: 'Samsung', model: 'AR18AXHQASINUA', type: 'Сплит-система', serial: 'SM2020-0099', address: 'Офис ООО «Ромашка», пр. Ленина, 78', installYear: 2020, status: 'Списано', refrigerant: 'R-32', powerKw: 5, areaM2: 50, inverter: true, history: [{ date: '2024-11-10', type: 'Ремонт', engineer: 'Петров А.', result: 'Списание' }, { date: '2024-06-15', type: 'ТО', engineer: 'Иванов С.', result: 'Выполнено' }, { date: '2023-12-20', type: 'Ремонт', engineer: 'Козлов В.', result: 'Выполнено' }] },
  { id: 'EQ-010', brand: 'Haier', model: 'AS18NS4ERA', type: 'Сплит-система', serial: 'HA2023-0061', address: 'Поликлиника №3, ул. Медицинская, 9', installYear: 2023, status: 'Активно', refrigerant: 'R-32', powerKw: 5.5, areaM2: 55, inverter: true, history: [{ date: '2026-05-02', type: 'ТО', engineer: 'Сидоров Р.', result: 'Выполнено' }, { date: '2025-11-08', type: 'ТО', engineer: 'Иванов С.', result: 'Выполнено' }, { date: '2025-05-16', type: 'Диагностика', engineer: 'Сидоров Р.', result: 'Выполнено' }] },
  { id: 'EQ-011', brand: 'Carrier', model: '40QAG024DS', type: 'Сплит-система', serial: 'CR2022-0031', address: 'ТЦ «Радуга», ул. Садовая, 14', installYear: 2022, status: 'Активно', refrigerant: 'R-410A', powerKw: 7, areaM2: 70, inverter: false, history: [{ date: '2026-04-08', type: 'ТО', engineer: 'Козлов В.', result: 'Выполнено' }, { date: '2025-10-03', type: 'ТО', engineer: 'Петров А.', result: 'Выполнено' }, { date: '2025-04-25', type: 'Замена фильтров', engineer: 'Козлов В.', result: 'Выполнено' }] },
  { id: 'EQ-012', brand: 'Daikin', model: 'FBQ100D8', type: 'VRV', serial: 'DK2023-0077', address: 'Университет ТГУ, корп. Б, ул. Университетская, 2', installYear: 2023, status: 'Активно', refrigerant: 'R-410A', powerKw: 11.2, areaM2: 130, inverter: true, history: [{ date: '2026-03-12', type: 'ТО', engineer: 'Иванов С.', result: 'Выполнено' }, { date: '2025-09-17', type: 'ТО', engineer: 'Сидоров Р.', result: 'Выполнено' }, { date: '2024-10-05', type: 'Диагностика', engineer: 'Иванов С.', result: 'Выполнено' }] },
  { id: 'EQ-013', brand: 'Vents', model: 'ВУТ 300 ВГ ЕС', type: 'Приточка', serial: 'VN2021-0022', address: 'Банк «Сибирь», ул. Финансовая, 6', installYear: 2021, status: 'Активно', refrigerant: '-', powerKw: 0.7, areaM2: 100, inverter: false, history: [{ date: '2026-04-30', type: 'Замена фильтров', engineer: 'Петров А.', result: 'Выполнено' }, { date: '2025-10-28', type: 'ТО', engineer: 'Козлов В.', result: 'Выполнено' }, { date: '2025-04-14', type: 'Замена фильтров', engineer: 'Петров А.', result: 'Выполнено' }] },
  { id: 'EQ-014', brand: 'LG', model: 'AС096UE4', type: 'Сплит-система', serial: 'LG2019-0055', address: 'Жилой дом, кв. 45, ул. Тихая, 11', installYear: 2019, status: 'В ремонте', refrigerant: 'R-410A', powerKw: 8.8, areaM2: 80, inverter: false, history: [{ date: '2026-05-10', type: 'Ремонт', engineer: 'Сидоров Р.', result: 'В работе' }, { date: '2025-12-03', type: 'ТО', engineer: 'Иванов С.', result: 'Выполнено' }, { date: '2025-06-19', type: 'Ремонт', engineer: 'Козлов В.', result: 'Выполнено' }] },
  { id: 'EQ-015', brand: 'Trane', model: 'XR15', type: 'Чиллер', serial: 'TR2020-0009', address: 'Завод «ПластТех», пр. Промышленный, 55', installYear: 2020, status: 'Активно', refrigerant: 'R-22', powerKw: 45, areaM2: 500, inverter: false, history: [{ date: '2026-03-25', type: 'ТО', engineer: 'Козлов В.', result: 'Выполнено' }, { date: '2025-09-12', type: 'Ремонт', engineer: 'Петров А.', result: 'Выполнено' }, { date: '2025-03-07', type: 'ТО', engineer: 'Сидоров Р.', result: 'Выполнено' }] },
  { id: 'EQ-016', brand: 'Systemair', model: 'SAVE 1200', type: 'Приточка', serial: 'SY2023-0091', address: 'БЦ «Горизонт», ул. Ленина, 15', installYear: 2023, status: 'Активно', refrigerant: '-', powerKw: 4.2, areaM2: 600, inverter: false, history: [{ date: '2026-04-18', type: 'ТО', engineer: 'Иванов С.', result: 'Выполнено' }, { date: '2025-10-15', type: 'Замена фильтров', engineer: 'Петров А.', result: 'Выполнено' }, { date: '2025-04-09', type: 'ТО', engineer: 'Иванов С.', result: 'Выполнено' }] },
  { id: 'EQ-017', brand: 'Samsung', model: 'MH052FNEA', type: 'VRV', serial: 'SM2022-0046', address: 'Апарт-отель «Меридиан», пр. Центральный, 19', installYear: 2022, status: 'Активно', refrigerant: 'R-32', powerKw: 16, areaM2: 200, inverter: true, history: [{ date: '2026-02-14', type: 'ТО', engineer: 'Козлов В.', result: 'Выполнено' }, { date: '2025-08-10', type: 'ТО', engineer: 'Сидоров Р.', result: 'Выполнено' }, { date: '2024-11-01', type: 'Диагностика', engineer: 'Козлов В.', result: 'Выполнено' }] },
  { id: 'EQ-018', brand: 'Haier', model: 'AV14IMSEAA', type: 'VRV', serial: 'HA2021-0038', address: 'Торговый центр «Квадрат», ул. Торговая, 33', installYear: 2021, status: 'Активно', refrigerant: 'R-32', powerKw: 14, areaM2: 180, inverter: true, history: [{ date: '2026-03-28', type: 'ТО', engineer: 'Петров А.', result: 'Выполнено' }, { date: '2025-09-24', type: 'ТО', engineer: 'Иванов С.', result: 'Выполнено' }, { date: '2025-02-17', type: 'Ремонт', engineer: 'Петров А.', result: 'Выполнено' }] },
  { id: 'EQ-019', brand: 'Mitsubishi', model: 'PEAD-M100JAA', type: 'Сплит-система', serial: 'ME2020-0066', address: 'Кафе «Уют», ул. Пушкина, 7', installYear: 2020, status: 'Списано', refrigerant: 'R-410A', powerKw: 10, areaM2: 90, inverter: false, history: [{ date: '2025-09-05', type: 'Ремонт', engineer: 'Сидоров Р.', result: 'Списание' }, { date: '2025-03-20', type: 'ТО', engineer: 'Козлов В.', result: 'Выполнено' }, { date: '2024-09-11', type: 'Ремонт', engineer: 'Иванов С.', result: 'Выполнено' }] },
  { id: 'EQ-020', brand: 'Carrier', model: '38CKS060', type: 'Сплит-система', serial: 'CR2023-0074', address: 'Аптека «Здоровье», ул. Медицинская, 3', installYear: 2023, status: 'Активно', refrigerant: 'R-410A', powerKw: 6, areaM2: 60, inverter: true, history: [{ date: '2026-05-08', type: 'ТО', engineer: 'Петров А.', result: 'Выполнено' }, { date: '2025-11-02', type: 'ТО', engineer: 'Козлов В.', result: 'Выполнено' }, { date: '2025-05-27', type: 'Диагностика', engineer: 'Петров А.', result: 'Выполнено' }] },
];

// ─── Chart data ────────────────────────────────────────────────────────────────

const BRAND_DATA = [
  { brand: 'Daikin', count: 78 },
  { brand: 'Mitsubishi', count: 64 },
  { brand: 'LG', count: 52 },
  { brand: 'Carrier', count: 48 },
  { brand: 'Trane', count: 39 },
  { brand: 'Samsung', count: 33 },
  { brand: 'Haier', count: 21 },
  { brand: 'Systemair', count: 12 },
];

const TYPE_DATA = [
  { name: 'Сплит-система', value: 168, color: '#3b82f6' },
  { name: 'VRV', value: 94, color: '#8b5cf6' },
  { name: 'Чиллер', value: 57, color: '#06b6d4' },
  { name: 'Приточка', value: 28, color: '#10b981' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<EquipStatus, 'default' | 'destructive' | 'secondary'> = {
  'Активно': 'default',
  'В ремонте': 'destructive',
  'Списано': 'secondary',
};

const TYPE_BADGE_COLOR: Record<EquipType, string> = {
  'Сплит-система': 'bg-blue-100 text-blue-800',
  'VRV': 'bg-purple-100 text-purple-800',
  'Чиллер': 'bg-cyan-100 text-cyan-800',
  'Приточка': 'bg-emerald-100 text-emerald-800',
};

// ─── QR Placeholder ────────────────────────────────────────────────────────────

function QRPlaceholder({ id }: { id: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="80" height="80" viewBox="0 0 80 80" className="border rounded">
        <rect width="80" height="80" fill="white" />
        {/* Finder patterns */}
        <rect x="4" y="4" width="24" height="24" rx="2" fill="black" />
        <rect x="8" y="8" width="16" height="16" rx="1" fill="white" />
        <rect x="11" y="11" width="10" height="10" fill="black" />
        <rect x="52" y="4" width="24" height="24" rx="2" fill="black" />
        <rect x="56" y="8" width="16" height="16" rx="1" fill="white" />
        <rect x="59" y="11" width="10" height="10" fill="black" />
        <rect x="4" y="52" width="24" height="24" rx="2" fill="black" />
        <rect x="8" y="56" width="16" height="16" rx="1" fill="white" />
        <rect x="11" y="59" width="10" height="10" fill="black" />
        {/* Data modules */}
        {[36, 40, 44, 48, 52, 36, 44, 52].map((x, i) => (
          <rect key={i} x={x} y={36 + (i % 3) * 8} width="4" height="4" fill="black" />
        ))}
        {[4, 12, 20, 28, 36, 44, 52].map((y, i) => (
          <rect key={i} x={32} y={y} width="4" height="4" fill={i % 2 === 0 ? 'black' : 'white'} />
        ))}
      </svg>
      <span className="text-xs text-gray-500">{id}</span>
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DetailPanel({ item, onClose }: { item: EquipmentItem; onClose: () => void }) {
  const docs = [
    { name: 'Паспорт оборудования', icon: 'FileText' },
    { name: 'Принципиальная схема', icon: 'FileCode' },
    { name: 'Руководство по эксплуатации', icon: 'BookOpen' },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="font-semibold text-gray-900">{item.brand} {item.model}</h3>
          <p className="text-sm text-gray-500">{item.id} · {item.serial}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <Icon name="X" size={16} />
        </Button>
      </div>

      <Tabs defaultValue="info" className="flex-1">
        <TabsList className="w-full rounded-none border-b">
          <TabsTrigger value="info" className="flex-1">Характеристики</TabsTrigger>
          <TabsTrigger value="history" className="flex-1">История</TabsTrigger>
          <TabsTrigger value="docs" className="flex-1">Документы</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Тип', value: item.type },
              { label: 'Бренд', value: item.brand },
              { label: 'Модель', value: item.model },
              { label: 'Год установки', value: String(item.installYear) },
              { label: 'Хладагент', value: item.refrigerant },
              { label: 'Мощность', value: `${item.powerKw} кВт` },
              { label: 'Площадь', value: `${item.areaM2} м²` },
              { label: 'Инвертор', value: item.inverter ? 'Да' : 'Нет' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm font-medium text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">Объект / Адрес</p>
            <p className="text-sm font-medium text-gray-900">{item.address}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">Статус</p>
            <Badge variant={STATUS_COLOR[item.status]}>{item.status}</Badge>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500 mb-2">QR-метка</p>
            <QRPlaceholder id={item.id} />
          </div>
        </TabsContent>

        <TabsContent value="history" className="p-4 space-y-3">
          {item.history.map((ev, idx) => (
            <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="Wrench" size={14} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{ev.type}</span>
                  <span className="text-xs text-gray-500">{ev.date}</span>
                </div>
                <p className="text-xs text-gray-500">{ev.engineer} · {ev.result}</p>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="docs" className="p-4 space-y-2">
          {docs.map((doc) => (
            <div
              key={doc.name}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Icon name={doc.icon as any} size={16} className="text-gray-500" />
                <span className="text-sm text-gray-700">{doc.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toast.success(`Скачивание: ${doc.name}`)}
              >
                <Icon name="Download" size={14} />
              </Button>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      <div className="p-4 border-t flex gap-2">
        <Button
          className="flex-1"
          size="sm"
          onClick={() => toast.success(`Наряд создан для ${item.id}`)}
        >
          <Icon name="Plus" size={14} className="mr-1" />
          Создать наряд
        </Button>
      </div>
    </div>
  );
}

// ─── Add Equipment Dialog ─────────────────────────────────────────────────────

function AddEquipmentDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({
    brand: '', model: '', type: '', serial: '', address: '', installYear: '', refrigerant: '', powerKw: '', areaM2: '',
  });

  const handleSave = () => {
    if (!form.brand || !form.model || !form.serial) {
      toast.error('Заполните обязательные поля: бренд, модель, серийный номер');
      return;
    }
    toast.success(`Оборудование ${form.brand} ${form.model} добавлено в каталог`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Добавить оборудование</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-2">
          {[
            { key: 'brand', label: 'Бренд *' },
            { key: 'model', label: 'Модель *' },
            { key: 'serial', label: 'Серийный номер *' },
            { key: 'installYear', label: 'Год установки' },
            { key: 'refrigerant', label: 'Хладагент' },
            { key: 'powerKw', label: 'Мощность (кВт)' },
            { key: 'areaM2', label: 'Площадь (м²)' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs text-gray-500 mb-1 block">{label}</label>
              <Input
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={label.replace(' *', '')}
              />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Тип</label>
            <Select onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
              <SelectTrigger><SelectValue placeholder="Выберите тип" /></SelectTrigger>
              <SelectContent>
                {(['Сплит-система', 'VRV', 'Чиллер', 'Приточка'] as EquipType[]).map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">Адрес объекта</label>
            <Input
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="Введите адрес"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSave}>Добавить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EquipmentCatalogFull() {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const brands = useMemo(() => [...new Set(MOCK_EQUIPMENT.map((e) => e.brand))].sort(), []);

  const filtered = useMemo(() => {
    return MOCK_EQUIPMENT.filter((e) => {
      const matchSearch =
        !search ||
        e.serial.toLowerCase().includes(search.toLowerCase()) ||
        e.address.toLowerCase().includes(search.toLowerCase()) ||
        e.model.toLowerCase().includes(search.toLowerCase());
      const matchBrand = filterBrand === 'all' || e.brand === filterBrand;
      const matchType = filterType === 'all' || e.type === filterType;
      const matchStatus = filterStatus === 'all' || e.status === filterStatus;
      return matchSearch && matchBrand && matchType && matchStatus;
    });
  }, [search, filterBrand, filterType, filterStatus]);

  const selectedItem = useMemo(
    () => (selectedId ? MOCK_EQUIPMENT.find((e) => e.id === selectedId) : null),
    [selectedId]
  );

  const kpis = [
    { label: 'Единиц оборудования', value: '347', icon: 'Server', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Активных', value: '312', icon: 'CheckCircle', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'На обслуживании', value: '35', icon: 'Wrench', color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Брендов', value: '12', icon: 'Tag', color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Каталог оборудования</h1>
            <p className="text-sm text-gray-500">Управление климатическим оборудованием объектов</p>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить оборудование
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          {kpis.map((k) => (
            <div key={k.label} className={`flex items-center gap-3 p-3 rounded-lg ${k.bg}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center bg-white`}>
                <Icon name={k.icon as any} size={18} className={k.color} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{k.value}</p>
                <p className="text-xs text-gray-500">{k.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Поиск по серийному номеру или адресу..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filterBrand} onValueChange={setFilterBrand}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Бренд" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все бренды</SelectItem>
              {brands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Тип" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все типы</SelectItem>
              {(['Сплит-система', 'VRV', 'Чиллер', 'Приточка'] as EquipType[]).map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              {(['Активно', 'В ремонте', 'Списано'] as EquipStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex border rounded-lg overflow-hidden">
            <button
              className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setViewMode('list')}
            >
              <Icon name="List" size={15} />
              Список
            </button>
            <button
              className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setViewMode('grid')}
            >
              <Icon name="LayoutGrid" size={15} />
              Карточки
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        <div className={`flex-1 overflow-y-auto p-4 ${selectedItem ? 'mr-0' : ''}`}>
          {viewMode === 'list' ? (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      {['ID', 'Бренд', 'Модель', 'Тип', 'Серийный №', 'Объект / Адрес', 'Год', 'Статус', 'Действия'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((item) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-blue-50 cursor-pointer transition-colors ${selectedId === item.id ? 'bg-blue-50' : ''}`}
                        onClick={() => setSelectedId(selectedId === item.id ? null : item.id)}
                      >
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.id}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{item.brand}</td>
                        <td className="px-4 py-3 text-gray-700">{item.model}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${TYPE_BADGE_COLOR[item.type]}`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.serial}</td>
                        <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate" title={item.address}>{item.address}</td>
                        <td className="px-4 py-3 text-gray-600">{item.installYear}</td>
                        <td className="px-4 py-3">
                          <Badge variant={STATUS_COLOR[item.status]}>{item.status}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => setSelectedId(selectedId === item.id ? null : item.id)}
                            >
                              <Icon name="Eye" size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => toast.success(`Наряд создан для ${item.id}`)}
                            >
                              <Icon name="Plus" size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="py-12 text-center text-gray-400">
                    <Icon name="SearchX" size={32} className="mx-auto mb-2" />
                    <p>Оборудование не найдено</p>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filtered.map((item) => (
                <Card
                  key={item.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${selectedId === item.id ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setSelectedId(selectedId === item.id ? null : item.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{item.brand}</CardTitle>
                        <p className="text-sm text-gray-500">{item.model}</p>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${TYPE_BADGE_COLOR[item.type]}`}>
                        {item.type}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <Icon name="MapPin" size={14} className="mt-0.5 flex-shrink-0 text-gray-400" />
                      <span className="line-clamp-2">{item.address}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Icon name="Calendar" size={12} />
                        {item.installYear}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Zap" size={12} />
                        {item.powerKw} кВт
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <Badge variant={STATUS_COLOR[item.status]}>{item.status}</Badge>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => setSelectedId(selectedId === item.id ? null : item.id)}
                        >
                          <Icon name="History" size={12} className="mr-1" />
                          История
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => toast.success(`Наряд создан для ${item.id}`)}
                        >
                          <Icon name="Plus" size={12} className="mr-1" />
                          Наряд
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-3 py-12 text-center text-gray-400">
                  <Icon name="SearchX" size={32} className="mx-auto mb-2" />
                  <p>Оборудование не найдено</p>
                </div>
              )}
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">По брендам</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={BRAND_DATA} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="brand" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Единиц" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">По типам</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={TYPE_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {TYPE_DATA.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v} ед.`]} />
                    <Legend
                      formatter={(value) => <span className="text-xs">{value}</span>}
                      iconSize={10}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detail panel */}
        {selectedItem && (
          <div className="w-80 bg-white border-l flex-shrink-0 flex flex-col overflow-hidden">
            <DetailPanel item={selectedItem} onClose={() => setSelectedId(null)} />
          </div>
        )}
      </div>

      <AddEquipmentDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
