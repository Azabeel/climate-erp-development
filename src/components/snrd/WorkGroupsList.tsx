import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface WorkGroupOrder {
  id: string;
  address: string;
  type: string;
  status: string;
  scheduledDate: string;
}

interface WorkGroup {
  id: string;
  name: string;
  leadEngineer: string;
  members: string[];
  territory: string;
  specializations: string[];
  activeOrders: number;
  efficiency: number;
  currentOrders: WorkGroupOrder[];
}

const ALL_ENGINEERS = [
  'Иванов Иван',
  'Петров Сергей',
  'Сидоров Алексей',
  'Козлов Михаил',
  'Волков Николай',
  'Новиков Андрей',
  'Морозов Денис',
  'Попов Виктор',
  'Лебедев Артём',
  'Соколов Павел',
];

const mockGroups: WorkGroup[] = [
  {
    id: 'GRP-001',
    name: 'Бригада «Север»',
    leadEngineer: 'Иванов Иван',
    members: ['Иванов Иван', 'Петров Сергей', 'Сидоров Алексей'],
    territory: 'САО, СВАО',
    specializations: ['Кондиционирование', 'Вентиляция', 'ТО'],
    activeOrders: 7,
    efficiency: 94,
    currentOrders: [
      { id: 'WO-2026-000101', address: 'ТЦ «Мега Химки»', type: 'ТО', status: 'В работе', scheduledDate: '11.05.2026' },
      { id: 'WO-2026-000105', address: 'БЦ «Аэрополис»', type: 'Ремонт', status: 'Назначен', scheduledDate: '12.05.2026' },
      { id: 'WO-2026-000112', address: 'Склад ООО «Логист»', type: 'Диагностика', status: 'Назначен', scheduledDate: '13.05.2026' },
    ],
  },
  {
    id: 'GRP-002',
    name: 'Бригада «Юг»',
    leadEngineer: 'Козлов Михаил',
    members: ['Козлов Михаил', 'Волков Николай', 'Новиков Андрей', 'Морозов Денис'],
    territory: 'ЮАО, ЮЗАО',
    specializations: ['Холодоснабжение', 'Кондиционирование', 'Монтаж'],
    activeOrders: 5,
    efficiency: 88,
    currentOrders: [
      { id: 'WO-2026-000098', address: 'Ресторан «Причал»', type: 'Монтаж', status: 'В работе', scheduledDate: '11.05.2026' },
      { id: 'WO-2026-000103', address: 'Офис «ФинГрупп»', type: 'Ремонт', status: 'Назначен', scheduledDate: '12.05.2026' },
    ],
  },
  {
    id: 'GRP-003',
    name: 'Бригада «Центр»',
    leadEngineer: 'Лебедев Артём',
    members: ['Лебедев Артём', 'Соколов Павел'],
    territory: 'ЦАО, ЗАО',
    specializations: ['Кондиционирование', 'Вентиляция'],
    activeOrders: 4,
    efficiency: 97,
    currentOrders: [
      { id: 'WO-2026-000110', address: 'Бутик «Люкс»', type: 'ТО', status: 'В работе', scheduledDate: '11.05.2026' },
      { id: 'WO-2026-000111', address: 'Отель «Метрополь»', type: 'Диагностика', status: 'В работе', scheduledDate: '11.05.2026' },
    ],
  },
  {
    id: 'GRP-004',
    name: 'Бригада «Восток»',
    leadEngineer: 'Попов Виктор',
    members: ['Попов Виктор', 'Петров Сергей', 'Сидоров Алексей'],
    territory: 'ВАО, ЮВАО',
    specializations: ['Холодоснабжение', 'ТО', 'Монтаж'],
    activeOrders: 6,
    efficiency: 82,
    currentOrders: [
      { id: 'WO-2026-000099', address: 'Завод «МашПром»', type: 'ТО', status: 'В работе', scheduledDate: '11.05.2026' },
      { id: 'WO-2026-000104', address: 'Торговый центр «Акварель»', type: 'Ремонт', status: 'Назначен', scheduledDate: '12.05.2026' },
    ],
  },
  {
    id: 'GRP-005',
    name: 'Бригада «Запад»',
    leadEngineer: 'Новиков Андрей',
    members: ['Новиков Андрей', 'Морозов Денис', 'Иванов Иван'],
    territory: 'ЗАО, СЗАО',
    specializations: ['Вентиляция', 'Кондиционирование', 'Рекламации'],
    activeOrders: 3,
    efficiency: 91,
    currentOrders: [
      { id: 'WO-2026-000107', address: 'СК «Крылатское»', type: 'Рекламация', status: 'В работе', scheduledDate: '11.05.2026' },
    ],
  },
];

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500',
  'bg-orange-500', 'bg-teal-500', 'bg-pink-500',
];

const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const STATUS_COLORS: Record<string, string> = {
  'В работе': 'bg-blue-100 text-blue-700',
  'Назначен': 'bg-yellow-100 text-yellow-700',
  'Завершён': 'bg-green-100 text-green-700',
};

const WorkGroupsList = () => {
  const [groups, setGroups] = useState<WorkGroup[]>(mockGroups);
  const [selectedGroup, setSelectedGroup] = useState<WorkGroup | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [formName, setFormName] = useState('');
  const [formTerritory, setFormTerritory] = useState('');
  const [formLead, setFormLead] = useState(ALL_ENGINEERS[0]);
  const [formMembers, setFormMembers] = useState<string[]>([]);
  const [formSpecs, setFormSpecs] = useState('');

  const openAdd = () => {
    setFormName('');
    setFormTerritory('');
    setFormLead(ALL_ENGINEERS[0]);
    setFormMembers([]);
    setFormSpecs('');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formName.trim()) return;
    const newGroup: WorkGroup = {
      id: `GRP-${String(groups.length + 1).padStart(3, '0')}`,
      name: formName,
      leadEngineer: formLead,
      members: Array.from(new Set([formLead, ...formMembers])),
      territory: formTerritory,
      specializations: formSpecs.split(',').map((s) => s.trim()).filter(Boolean),
      activeOrders: 0,
      efficiency: 100,
      currentOrders: [],
    };
    setGroups([...groups, newGroup]);
    setIsModalOpen(false);
  };

  const toggleMember = (name: string) => {
    setFormMembers((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
    );
  };

  const openDetail = (group: WorkGroup) => {
    setSelectedGroup(group);
    setIsDetailOpen(true);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Рабочие группы</h2>
          <p className="text-gray-500 mt-1">Бригады выездных инженеров</p>
        </div>
        <Button onClick={openAdd}>
          <Icon name="Plus" size={16} className="mr-2" />
          Создать группу
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="Users" size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{groups.length}</div>
              <div className="text-sm text-gray-500">Всего групп</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="Wrench" size={20} className="text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{groups.reduce((s, g) => s + g.activeOrders, 0)}</div>
              <div className="text-sm text-gray-500">Активных нарядов</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon name="TrendingUp" size={20} className="text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {Math.round(groups.reduce((s, g) => s + g.efficiency, 0) / groups.length)}%
              </div>
              <div className="text-sm text-gray-500">Средняя эффективность</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {groups.map((group) => (
          <Card
            key={group.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => openDetail(group)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">{group.name}</CardTitle>
                <Badge variant="outline" className="text-xs">{group.id}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <Icon name="MapPin" size={14} />
                {group.territory}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Lead */}
              <div>
                <div className="text-xs text-gray-400 mb-1">Бригадир</div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                    {getInitials(group.leadEngineer)}
                  </div>
                  <span className="text-sm font-medium">{group.leadEngineer}</span>
                </div>
              </div>

              {/* Members */}
              <div>
                <div className="text-xs text-gray-400 mb-2">Состав ({group.members.length})</div>
                <div className="flex flex-wrap gap-1">
                  {group.members.map((m, i) => (
                    <div
                      key={m}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                      title={m}
                    >
                      {getInitials(m)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Specs */}
              <div className="flex flex-wrap gap-1">
                {group.specializations.map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                    {s}
                  </span>
                ))}
              </div>

              {/* Efficiency */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Эффективность</span>
                  <span className={`font-semibold ${group.efficiency >= 90 ? 'text-green-600' : group.efficiency >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {group.efficiency}%
                  </span>
                </div>
                <Progress value={group.efficiency} className="h-2" />
              </div>

              {/* Orders */}
              <div className="flex justify-between items-center text-sm border-t pt-3">
                <span className="text-gray-500">Активных нарядов</span>
                <Badge className="bg-blue-100 text-blue-700">{group.activeOrders}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        {selectedGroup && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedGroup.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Бригадир</div>
                  <div className="font-medium">{selectedGroup.leadEngineer}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Территория</div>
                  <div className="font-medium">{selectedGroup.territory}</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400 mb-2">Состав бригады</div>
                <div className="space-y-2">
                  {selectedGroup.members.map((m, i) => (
                    <div key={m} className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                      >
                        {getInitials(m)}
                      </div>
                      <span className="text-sm">{m}</span>
                      {m === selectedGroup.leadEngineer && (
                        <Badge className="bg-purple-100 text-purple-700 text-xs">Бригадир</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400 mb-2">Текущие наряды</div>
                {selectedGroup.currentOrders.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">Нет активных нарядов</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Наряд</TableHead>
                        <TableHead>Объект</TableHead>
                        <TableHead>Тип</TableHead>
                        <TableHead>Дата</TableHead>
                        <TableHead>Статус</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedGroup.currentOrders.map((o) => (
                        <TableRow key={o.id}>
                          <TableCell className="text-xs font-mono">{o.id}</TableCell>
                          <TableCell className="text-sm">{o.address}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{o.type}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">{o.scheduledDate}</TableCell>
                          <TableCell>
                            <Badge className={STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-600'}>
                              {o.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Закрыть</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Create Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Создать рабочую группу</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Название группы *</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Бригада «Название»"
              />
            </div>
            <div>
              <Label>Территория</Label>
              <Input
                value={formTerritory}
                onChange={(e) => setFormTerritory(e.target.value)}
                placeholder="Например: ЦАО, ЗАО"
              />
            </div>
            <div>
              <Label>Бригадир</Label>
              <select
                value={formLead}
                onChange={(e) => setFormLead(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ALL_ENGINEERS.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="mb-2 block">Состав (выберите инженеров)</Label>
              <div className="grid grid-cols-2 gap-1 max-h-36 overflow-y-auto border border-gray-200 rounded-md p-3">
                {ALL_ENGINEERS.map((eng) => (
                  <label key={eng} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={formMembers.includes(eng)}
                      onChange={() => toggleMember(eng)}
                      className="accent-blue-600"
                    />
                    {eng}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label>Специализации (через запятую)</Label>
              <Input
                value={formSpecs}
                onChange={(e) => setFormSpecs(e.target.value)}
                placeholder="Кондиционирование, Вентиляция, ТО"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={!formName.trim()}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkGroupsList;
