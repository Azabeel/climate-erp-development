import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type AssetStatus = 'В работе' | 'Требует ТО' | 'Аварийный';

interface Component {
  id: string;
  name: string;
}

interface Asset {
  id: string;
  name: string;
  status: AssetStatus;
  manufacturer: string;
  model: string;
  serial: string;
  installDate: string;
  warrantyUntil: string;
  refrigerant: string;
  charge: string;
  energyClass: string;
  photo: string;
  components: Component[];
}

interface SubLocation {
  id: string;
  name: string;
  assets: Asset[];
}

interface Location {
  id: string;
  name: string;
  subLocations: SubLocation[];
}

interface HistoryEvent {
  date: string;
  type: string;
  description: string;
  engineer: string;
  icon: string;
}

interface MaintenancePlan {
  id: string;
  equipment: string;
  type: string;
  frequency: string;
  lastDone: string;
  nextDue: string;
  engineer: string;
  status: 'plan' | 'soon' | 'overdue';
}

// ─────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────

const LOCATIONS: Location[] = [
  {
    id: 'loc-mega',
    name: 'ТЦ Мега',
    subLocations: [
      {
        id: 'mega-1',
        name: '1 этаж, серверная',
        assets: [
          {
            id: 'asset-1',
            name: 'Чиллер Daikin EWAD650',
            status: 'Требует ТО',
            manufacturer: 'Daikin',
            model: 'EWAD650-SLR1',
            serial: 'DK-2022-0451',
            installDate: '12.04.2022',
            warrantyUntil: '12.04.2027',
            refrigerant: 'R-410A',
            charge: '2.5 кг',
            energyClass: 'A+',
            photo: '🏭',
            components: [
              { id: 'c1', name: 'Компрессор #1' },
              { id: 'c2', name: 'Компрессор #2' },
              { id: 'c3', name: 'Конденсатор' },
            ],
          },
        ],
      },
      {
        id: 'mega-2',
        name: '2 этаж, торговый зал',
        assets: [
          {
            id: 'asset-2',
            name: 'Кондиционер VRV Mitsubishi',
            status: 'В работе',
            manufacturer: 'Mitsubishi Electric',
            model: 'PUHY-P450YNW',
            serial: 'ME-2023-1284',
            installDate: '08.07.2023',
            warrantyUntil: '08.07.2028',
            refrigerant: 'R-410A',
            charge: '8.4 кг',
            energyClass: 'A++',
            photo: '❄️',
            components: [
              { id: 'c4', name: 'Внешний блок' },
              { id: 'c5', name: 'Внутренний блок #1' },
              { id: 'c6', name: 'Внутренний блок #2' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'loc-premier',
    name: 'Отель Премьер',
    subLocations: [
      {
        id: 'prem-1',
        name: 'Машинное отделение',
        assets: [
          {
            id: 'asset-3',
            name: 'Чиллер York YVAA0850',
            status: 'В работе',
            manufacturer: 'York',
            model: 'YVAA0850',
            serial: 'YK-2021-0098',
            installDate: '15.09.2021',
            warrantyUntil: '15.09.2026',
            refrigerant: 'R-134a',
            charge: '12.0 кг',
            energyClass: 'A',
            photo: '🏭',
            components: [
              { id: 'c7', name: 'Компрессор' },
              { id: 'c8', name: 'Испаритель' },
            ],
          },
        ],
      },
      {
        id: 'prem-2',
        name: 'Лобби',
        assets: [
          {
            id: 'asset-4',
            name: 'Сплит-система Daikin FTXM35',
            status: 'Аварийный',
            manufacturer: 'Daikin',
            model: 'FTXM35M',
            serial: 'DK-2020-7724',
            installDate: '03.06.2020',
            warrantyUntil: '03.06.2025',
            refrigerant: 'R-32',
            charge: '0.8 кг',
            energyClass: 'A++',
            photo: '❄️',
            components: [
              { id: 'c9', name: 'Внешний блок' },
              { id: 'c10', name: 'Внутренний блок' },
            ],
          },
        ],
      },
    ],
  },
];

const HISTORY_EVENTS: HistoryEvent[] = [
  { date: '12.04.2022', type: 'Установка', description: 'Первичная установка и пусконаладка', engineer: 'Петров А.С.', icon: 'Wrench' },
  { date: '20.07.2022', type: 'ТО', description: 'Плановое ТО-1, чистка теплообменника', engineer: 'Иванов И.И.', icon: 'CheckCircle2' },
  { date: '15.10.2022', type: 'Хладагент', description: 'Дозаправка R-410A, +0.2 кг', engineer: 'Сидоров П.К.', icon: 'Droplets' },
  { date: '12.01.2023', type: 'Ремонт', description: 'Замена датчика давления', engineer: 'Петров А.С.', icon: 'AlertTriangle' },
  { date: '18.04.2023', type: 'ТО', description: 'Годовое ТО, замена фильтров', engineer: 'Иванов И.И.', icon: 'CheckCircle2' },
  { date: '05.09.2023', type: 'Хладагент', description: 'Восстановление, заправка +0.3 кг', engineer: 'Сидоров П.К.', icon: 'Droplets' },
  { date: '22.02.2024', type: 'Ремонт', description: 'Замена компрессора #2', engineer: 'Кузнецов В.А.', icon: 'AlertTriangle' },
  { date: '14.03.2026', type: 'ТО', description: 'Квартальное ТО, рекомендована замена', engineer: 'Иванов И.И.', icon: 'CheckCircle2' },
];

const MAINTENANCE_PLANS: MaintenancePlan[] = [
  { id: 'mp-1', equipment: 'Чиллер Daikin EWAD650', type: 'Квартальное ТО', frequency: 'квартально', lastDone: '14.03.2026', nextDue: '14.06.2026', engineer: 'Иванов И.И.', status: 'plan' },
  { id: 'mp-2', equipment: 'Кондиционер VRV Mitsubishi', type: 'Полугодовое ТО', frequency: 'полугодие', lastDone: '08.01.2026', nextDue: '08.07.2026', engineer: 'Петров А.С.', status: 'plan' },
  { id: 'mp-3', equipment: 'Чиллер York YVAA0850', type: 'Годовое ТО', frequency: 'год', lastDone: '15.09.2025', nextDue: '15.09.2026', engineer: 'Кузнецов В.А.', status: 'plan' },
  { id: 'mp-4', equipment: 'Сплит-система Daikin FTXM35', type: 'Квартальное ТО', frequency: 'квартально', lastDone: '01.02.2026', nextDue: '01.05.2026', engineer: 'Сидоров П.К.', status: 'overdue' },
  { id: 'mp-5', equipment: 'Чиллер Daikin EWAD650', type: 'Проверка хладагента', frequency: 'полугодие', lastDone: '10.12.2025', nextDue: '10.06.2026', engineer: 'Сидоров П.К.', status: 'soon' },
  { id: 'mp-6', equipment: 'Кондиционер VRV Mitsubishi', type: 'Замена фильтров', frequency: 'квартально', lastDone: '05.03.2026', nextDue: '05.06.2026', engineer: 'Петров А.С.', status: 'soon' },
  { id: 'mp-7', equipment: 'Чиллер York YVAA0850', type: 'Проверка хладагента', frequency: 'полугодие', lastDone: '20.01.2026', nextDue: '20.07.2026', engineer: 'Сидоров П.К.', status: 'plan' },
  { id: 'mp-8', equipment: 'Сплит-система Daikin FTXM35', type: 'Годовая диагностика', frequency: 'год', lastDone: '03.06.2025', nextDue: '03.06.2026', engineer: 'Иванов И.И.', status: 'soon' },
  { id: 'mp-9', equipment: 'Чиллер Daikin EWAD650', type: 'Чистка теплообменника', frequency: 'полугодие', lastDone: '14.11.2025', nextDue: '14.05.2026', engineer: 'Иванов И.И.', status: 'overdue' },
  { id: 'mp-10', equipment: 'Кондиционер VRV Mitsubishi', type: 'Годовое ТО', frequency: 'год', lastDone: '08.07.2025', nextDue: '08.07.2026', engineer: 'Петров А.С.', status: 'plan' },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const statusBadge = (status: AssetStatus) => {
  switch (status) {
    case 'В работе':
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">В работе</Badge>;
    case 'Требует ТО':
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Требует ТО</Badge>;
    case 'Аварийный':
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Аварийный</Badge>;
  }
};

const planStatusBadge = (status: MaintenancePlan['status']) => {
  switch (status) {
    case 'plan':
      return <Badge variant="outline">По плану</Badge>;
    case 'soon':
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Скоро</Badge>;
    case 'overdue':
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Просрочено</Badge>;
  }
};

// Simple SVG placeholder QR
const QrPlaceholder = () => (
  <svg width="200" height="200" viewBox="0 0 200 200" className="border bg-white">
    <rect width="200" height="200" fill="#fff" />
    {Array.from({ length: 400 }).map((_, i) => {
      const x = (i % 20) * 10;
      const y = Math.floor(i / 20) * 10;
      const fill = (i * 13 + 7) % 3 === 0 ? '#000' : '#fff';
      return <rect key={i} x={x} y={y} width="10" height="10" fill={fill} />;
    })}
    <rect x="0" y="0" width="60" height="60" fill="#fff" />
    <rect x="0" y="0" width="60" height="60" fill="none" stroke="#000" strokeWidth="10" />
    <rect x="20" y="20" width="20" height="20" fill="#000" />
    <rect x="140" y="0" width="60" height="60" fill="#fff" />
    <rect x="140" y="0" width="60" height="60" fill="none" stroke="#000" strokeWidth="10" />
    <rect x="160" y="20" width="20" height="20" fill="#000" />
    <rect x="0" y="140" width="60" height="60" fill="#fff" />
    <rect x="0" y="140" width="60" height="60" fill="none" stroke="#000" strokeWidth="10" />
    <rect x="20" y="160" width="20" height="20" fill="#000" />
  </svg>
);

// ─────────────────────────────────────────────
// Tree node
// ─────────────────────────────────────────────

interface TreeProps {
  selectedId: string | null;
  onSelect: (asset: Asset) => void;
}

const AssetTree = ({ selectedId, onSelect }: TreeProps) => {
  const [openLocations, setOpenLocations] = useState<Set<string>>(new Set(LOCATIONS.map((l) => l.id)));
  const [openSubs, setOpenSubs] = useState<Set<string>>(
    new Set(LOCATIONS.flatMap((l) => l.subLocations.map((s) => s.id)))
  );
  const [openAssets, setOpenAssets] = useState<Set<string>>(new Set(['asset-1']));

  const toggle = (set: Set<string>, id: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setter(next);
  };

  return (
    <div className="text-sm">
      {LOCATIONS.map((loc) => {
        const isOpen = openLocations.has(loc.id);
        return (
          <div key={loc.id}>
            <button
              className="flex w-full items-center gap-1 rounded px-2 py-1.5 text-left hover:bg-muted"
              onClick={() => toggle(openLocations, loc.id, setOpenLocations)}
            >
              <Icon name={isOpen ? 'ChevronDown' : 'ChevronRight'} size={14} />
              <Icon name="Building2" size={14} className="text-blue-600" />
              <span className="font-medium">{loc.name}</span>
            </button>
            {isOpen &&
              loc.subLocations.map((sub) => {
                const subOpen = openSubs.has(sub.id);
                return (
                  <div key={sub.id} className="ml-4">
                    <button
                      className="flex w-full items-center gap-1 rounded px-2 py-1.5 text-left hover:bg-muted"
                      onClick={() => toggle(openSubs, sub.id, setOpenSubs)}
                    >
                      <Icon name={subOpen ? 'ChevronDown' : 'ChevronRight'} size={14} />
                      <Icon name="MapPin" size={14} className="text-slate-500" />
                      <span>{sub.name}</span>
                    </button>
                    {subOpen &&
                      sub.assets.map((asset) => {
                        const assetOpen = openAssets.has(asset.id);
                        const isSelected = selectedId === asset.id;
                        return (
                          <div key={asset.id} className="ml-4">
                            <button
                              className={`flex w-full items-center gap-1 rounded px-2 py-1.5 text-left hover:bg-muted ${
                                isSelected ? 'bg-blue-50 text-blue-700' : ''
                              }`}
                              onClick={() => {
                                onSelect(asset);
                                toggle(openAssets, asset.id, setOpenAssets);
                              }}
                            >
                              <Icon name={assetOpen ? 'ChevronDown' : 'ChevronRight'} size={14} />
                              <Icon name="Wind" size={14} className="text-cyan-600" />
                              <span className="truncate">{asset.name}</span>
                            </button>
                            {assetOpen &&
                              asset.components.map((c) => (
                                <div
                                  key={c.id}
                                  className="ml-8 flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground"
                                >
                                  <Icon name="Cog" size={12} />
                                  <span>{c.name}</span>
                                </div>
                              ))}
                          </div>
                        );
                      })}
                  </div>
                );
              })}
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

const EquipmentModule = () => {
  const [selectedAsset, setSelectedAsset] = useState<Asset>(LOCATIONS[0].subLocations[0].assets[0]);
  const [innerTab, setInnerTab] = useState('passport');

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Оборудование (EAM)</h1>
          <p className="text-sm text-muted-foreground">
            Управление жизненным циклом активов и техническим обслуживанием
          </p>
        </div>
        <Button onClick={() => toast.success('Открыта форма создания оборудования')}>
          <Icon name="Plus" size={16} />
          <span className="ml-2">Добавить оборудование</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всего оборудования</p>
                <p className="text-2xl font-bold">47</p>
              </div>
              <Icon name="Wind" size={28} className="text-cyan-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Требует ТО в этом месяце</p>
                <p className="text-2xl font-bold text-yellow-600">12</p>
              </div>
              <Icon name="Wrench" size={28} className="text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Просрочено</p>
                <p className="text-2xl font-bold text-red-600">3</p>
              </div>
              <Icon name="AlertTriangle" size={28} className="text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Под гарантией</p>
                <p className="text-2xl font-bold text-green-600">28</p>
              </div>
              <Icon name="ShieldCheck" size={28} className="text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="registry">
        <TabsList>
          <TabsTrigger value="registry">Реестр оборудования</TabsTrigger>
          <TabsTrigger value="schedule">Графики ТО</TabsTrigger>
        </TabsList>

        <TabsContent value="registry" className="mt-4">
          <div className="flex gap-4">
            {/* Tree */}
            <Card className="w-[320px] shrink-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Структура активов</CardTitle>
              </CardHeader>
              <CardContent>
                <AssetTree
                  selectedId={selectedAsset.id}
                  onSelect={(a) => setSelectedAsset(a)}
                />
              </CardContent>
            </Card>

            {/* Passport */}
            <Card className="flex-1">
              <CardContent className="pt-6">
                {/* Top header */}
                <div className="flex items-start gap-4 border-b pb-4">
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-slate-100 text-5xl">
                    {selectedAsset.photo}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold">{selectedAsset.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedAsset.manufacturer} · {selectedAsset.model}
                    </p>
                    <div className="mt-2">{statusBadge(selectedAsset.status)}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Icon name="Edit" size={14} />
                      <span className="ml-1">Изменить</span>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Icon name="Wrench" size={14} />
                      <span className="ml-1">Создать наряд</span>
                    </Button>
                  </div>
                </div>

                <Tabs value={innerTab} onValueChange={setInnerTab} className="mt-4">
                  <TabsList>
                    <TabsTrigger value="passport">Паспорт</TabsTrigger>
                    <TabsTrigger value="history">История</TabsTrigger>
                    <TabsTrigger value="refrigerant">Хладагент</TabsTrigger>
                    <TabsTrigger value="maintenance">Графики ТО</TabsTrigger>
                    <TabsTrigger value="documents">Документы</TabsTrigger>
                    <TabsTrigger value="qr">QR</TabsTrigger>
                  </TabsList>

                  <TabsContent value="passport" className="mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <PassportField label="Серийный номер" value={selectedAsset.serial} />
                      <PassportField label="Производитель" value={selectedAsset.manufacturer} />
                      <PassportField label="Модель" value={selectedAsset.model} />
                      <PassportField label="Дата установки" value={selectedAsset.installDate} />
                      <PassportField label="Гарантия до" value={selectedAsset.warrantyUntil} />
                      <PassportField label="Тип хладагента" value={selectedAsset.refrigerant} />
                      <PassportField label="Заправка" value={selectedAsset.charge} />
                      <PassportField label="Класс энергоэффективности" value={selectedAsset.energyClass} />
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="mt-4">
                    <div className="space-y-3">
                      {HISTORY_EVENTS.map((ev, idx) => (
                        <div key={idx} className="flex items-start gap-3 rounded-lg border p-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <Icon name={ev.icon} size={16} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{ev.type}</span>
                              <span className="text-xs text-muted-foreground">{ev.date}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{ev.description}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              <Icon name="User" size={12} className="inline" /> {ev.engineer}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="refrigerant" className="mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Кумулятивная дозаправка</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex h-40 items-end gap-2">
                            {[0.1, 0.15, 0.25, 0.3, 0.45, 0.55, 0.7].map((v, i) => (
                              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                                <div
                                  className="w-full rounded-t bg-cyan-500"
                                  style={{ height: `${v * 100}%` }}
                                />
                                <span className="text-xs text-muted-foreground">М{i + 1}</span>
                              </div>
                            ))}
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">
                            За год дозаправлено: 0.7 кг R-410A
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Показатель утечки</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col items-center justify-center py-6">
                            <div className="text-5xl font-bold text-yellow-600">28%</div>
                            <Badge className="mt-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                              Внимание — приближается к порогу 30%
                            </Badge>
                            <p className="mt-3 text-center text-xs text-muted-foreground">
                              0.7 кг / 2.5 кг полного заряда
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="maintenance" className="mt-4">
                    <div className="space-y-2">
                      {MAINTENANCE_PLANS.filter((p) =>
                        p.equipment.includes(selectedAsset.name.split(' ')[0])
                      ).map((p) => (
                        <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="font-medium">{p.type}</p>
                            <p className="text-xs text-muted-foreground">
                              {p.frequency} · следующее: {p.nextDue}
                            </p>
                          </div>
                          {planStatusBadge(p.status)}
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="documents" className="mt-4">
                    <div className="space-y-2">
                      {[
                        { name: 'Паспорт оборудования.pdf', size: '2.4 МБ', icon: 'FileText' },
                        { name: 'Руководство по эксплуатации.pdf', size: '8.1 МБ', icon: 'BookOpen' },
                        { name: 'Гарантийный сертификат.pdf', size: '512 КБ', icon: 'ShieldCheck' },
                        { name: 'Акт пусконаладки.pdf', size: '1.1 МБ', icon: 'CheckCircle2' },
                      ].map((doc, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex items-center gap-3">
                            <Icon name={doc.icon} size={20} className="text-blue-600" />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">{doc.size}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Icon name="Download" size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="qr" className="mt-4">
                    <div className="flex flex-col items-center gap-4 py-6">
                      <QrPlaceholder />
                      <p className="text-sm text-muted-foreground">
                        ID актива: <span className="font-mono">{selectedAsset.id}</span>
                      </p>
                      <Button
                        onClick={() => toast.success('Наклейка отправлена в печать')}
                      >
                        <Icon name="Printer" size={16} />
                        <span className="ml-2">Скачать наклейку</span>
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Планы технического обслуживания</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Оборудование</TableHead>
                    <TableHead>Тип ТО</TableHead>
                    <TableHead>Частота</TableHead>
                    <TableHead>Последнее ТО</TableHead>
                    <TableHead>Следующее ТО</TableHead>
                    <TableHead>Исполнитель</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MAINTENANCE_PLANS.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.equipment}</TableCell>
                      <TableCell>{p.type}</TableCell>
                      <TableCell>{p.frequency}</TableCell>
                      <TableCell>{p.lastDone}</TableCell>
                      <TableCell>{p.nextDue}</TableCell>
                      <TableCell>{p.engineer}</TableCell>
                      <TableCell>{planStatusBadge(p.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toast.success(`Создан наряд по ТО для ${p.equipment}`)}
                        >
                          <Icon name="Wrench" size={14} />
                          <span className="ml-1">Создать наряд</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const PassportField = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border p-3">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="mt-1 font-medium">{value}</p>
  </div>
);

export default EquipmentModule;
