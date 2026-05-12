import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type District =
  | 'Центральный'
  | 'Северный'
  | 'Южный'
  | 'Западный'
  | 'Восточный'
  | 'Подмосковье';

interface Territory {
  id: string;
  name: string;
  district: District;
  assignedEngineers: string[];
  activeOrders: number;
  clientsCount: number;
  avgResponseTime: number;
  color: string;
}

const allEngineers = [
  'Иванов А.С.',
  'Петров К.В.',
  'Смирнов Д.Н.',
  'Козлов Р.А.',
  'Соколов И.П.',
  'Новиков Е.С.',
  'Морозов А.В.',
  'Волков Н.К.',
  'Захаров П.Д.',
  'Лебедев С.М.',
  'Семёнов В.Г.',
  'Егоров О.Б.',
];

const mockTerritories: Territory[] = [
  {
    id: '1',
    name: 'Центр',
    district: 'Центральный',
    assignedEngineers: ['Иванов А.С.', 'Петров К.В.', 'Смирнов Д.Н.'],
    activeOrders: 18,
    clientsCount: 45,
    avgResponseTime: 1.2,
    color: '#3B82F6',
  },
  {
    id: '2',
    name: 'Север',
    district: 'Северный',
    assignedEngineers: ['Козлов Р.А.', 'Соколов И.П.'],
    activeOrders: 9,
    clientsCount: 28,
    avgResponseTime: 1.8,
    color: '#8B5CF6',
  },
  {
    id: '3',
    name: 'Юг',
    district: 'Южный',
    assignedEngineers: ['Новиков Е.С.', 'Морозов А.В.'],
    activeOrders: 12,
    clientsCount: 32,
    avgResponseTime: 2.1,
    color: '#10B981',
  },
  {
    id: '4',
    name: 'Запад',
    district: 'Западный',
    assignedEngineers: ['Волков Н.К.', 'Захаров П.Д.'],
    activeOrders: 7,
    clientsCount: 21,
    avgResponseTime: 1.5,
    color: '#F59E0B',
  },
  {
    id: '5',
    name: 'Восток',
    district: 'Восточный',
    assignedEngineers: ['Лебедев С.М.'],
    activeOrders: 5,
    clientsCount: 14,
    avgResponseTime: 2.8,
    color: '#EF4444',
  },
  {
    id: '6',
    name: 'Подмосковье',
    district: 'Подмосковье',
    assignedEngineers: ['Семёнов В.Г.', 'Егоров О.Б.'],
    activeOrders: 11,
    clientsCount: 37,
    avgResponseTime: 3.2,
    color: '#06B6D4',
  },
];

const districtPositions: Record<District, { top: string; left: string; width: string; height: string }> = {
  'Центральный': { top: '30%', left: '38%', width: '24%', height: '20%' },
  'Северный':    { top: '5%',  left: '35%', width: '30%', height: '25%' },
  'Южный':       { top: '60%', left: '30%', width: '32%', height: '28%' },
  'Западный':    { top: '25%', left: '5%',  width: '32%', height: '35%' },
  'Восточный':   { top: '20%', left: '63%', width: '32%', height: '38%' },
  'Подмосковье': { top: '58%', left: '62%', width: '33%', height: '35%' },
};

const TerritoriesList = () => {
  const [territories, setTerritories] = useState<Territory[]>(mockTerritories);
  const [assignModal, setAssignModal] = useState<Territory | null>(null);
  const [hoveredTerritory, setHoveredTerritory] = useState<string | null>(null);
  const [dragEngineer, setDragEngineer] = useState<string | null>(null);
  const [dragSource, setDragSource] = useState<string | null>(null);
  const [tempEngineers, setTempEngineers] = useState<Record<string, string[]>>({});

  const chartData = territories.map(t => ({
    name: t.name,
    activeOrders: t.activeOrders,
    clients: t.clientsCount,
    fill: t.color,
  }));

  const openAssignModal = (territory: Territory) => {
    const te: Record<string, string[]> = {};
    territories.forEach(t => { te[t.id] = [...t.assignedEngineers]; });
    setTempEngineers(te);
    setAssignModal(territory);
  };

  const getUnassignedEngineers = () => {
    const assigned = new Set(Object.values(tempEngineers).flat());
    return allEngineers.filter(e => !assigned.has(e));
  };

  const handleDragStart = (engineer: string, sourceId: string) => {
    setDragEngineer(engineer);
    setDragSource(sourceId);
  };

  const handleDropOnTerritory = (targetId: string) => {
    if (!dragEngineer || !dragSource) return;
    setTempEngineers(prev => {
      const next = { ...prev };
      if (dragSource !== 'pool') {
        next[dragSource] = prev[dragSource].filter(e => e !== dragEngineer);
      }
      if (!next[targetId].includes(dragEngineer)) {
        next[targetId] = [...next[targetId], dragEngineer];
      }
      return next;
    });
    setDragEngineer(null);
    setDragSource(null);
  };

  const handleDropOnPool = () => {
    if (!dragEngineer || !dragSource || dragSource === 'pool') return;
    setTempEngineers(prev => ({
      ...prev,
      [dragSource]: prev[dragSource].filter(e => e !== dragEngineer),
    }));
    setDragEngineer(null);
    setDragSource(null);
  };

  const saveAssignments = () => {
    setTerritories(prev =>
      prev.map(t => ({ ...t, assignedEngineers: tempEngineers[t.id] || t.assignedEngineers }))
    );
    setAssignModal(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Территории обслуживания</h2>
          <p className="text-gray-500 mt-1">Зоны ответственности и распределение инженеров</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить территорию
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{territories.length}</div>
            <div className="text-xs text-gray-500 mt-1">Территорий</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {territories.reduce((s, t) => s + t.assignedEngineers.length, 0)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Инженеров назначено</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {territories.reduce((s, t) => s + t.activeOrders, 0)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Активных нарядов</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-800">
              {(territories.reduce((s, t) => s + t.avgResponseTime, 0) / territories.length).toFixed(1)} ч
            </div>
            <div className="text-xs text-gray-500 mt-1">Среднее время реакции</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Схема территорий</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative bg-gray-100 rounded-lg" style={{ height: '320px' }}>
              <div className="absolute inset-0 rounded-lg overflow-hidden opacity-10">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={`h${i}`}
                    className="absolute border-t border-gray-600"
                    style={{ top: `${(i + 1) * 12.5}%`, left: 0, right: 0 }}
                  />
                ))}
                {[...Array(8)].map((_, i) => (
                  <div
                    key={`v${i}`}
                    className="absolute border-l border-gray-600"
                    style={{ left: `${(i + 1) * 12.5}%`, top: 0, bottom: 0 }}
                  />
                ))}
              </div>

              {territories.map(t => {
                const pos = districtPositions[t.district];
                const isHovered = hoveredTerritory === t.id;
                return (
                  <div
                    key={t.id}
                    className="absolute rounded-xl transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-white text-center border-2"
                    style={{
                      top: pos.top,
                      left: pos.left,
                      width: pos.width,
                      height: pos.height,
                      backgroundColor: `${t.color}${isHovered ? 'dd' : '99'}`,
                      borderColor: t.color,
                      transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                      zIndex: isHovered ? 10 : 1,
                    }}
                    onMouseEnter={() => setHoveredTerritory(t.id)}
                    onMouseLeave={() => setHoveredTerritory(null)}
                    onClick={() => openAssignModal(t)}
                  >
                    <div className="font-bold text-sm drop-shadow">{t.name}</div>
                    <div className="text-xs opacity-90 drop-shadow">{t.assignedEngineers.length} инж.</div>
                    {isHovered && (
                      <div className="text-xs mt-0.5 drop-shadow">
                        {t.activeOrders} нарядов
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="absolute bottom-2 right-2 bg-white bg-opacity-80 rounded px-2 py-1 text-xs text-gray-500">
                Нажмите для назначения
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Заявки по территориям</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    value,
                    name === 'activeOrders' ? 'Активных нарядов' : 'Клиентов',
                  ]}
                  contentStyle={{ fontSize: '12px' }}
                />
                <Bar dataKey="activeOrders" name="activeOrders" fill="#6366F1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="clients" name="clients" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-indigo-400 inline-block" />
                Активные наряды
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-slate-300 inline-block" />
                Клиентов
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Детальная таблица</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Территория</TableHead>
                <TableHead>Район</TableHead>
                <TableHead>Инженеры</TableHead>
                <TableHead>Активных нарядов</TableHead>
                <TableHead>Клиентов</TableHead>
                <TableHead>Среднее время реакции</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {territories.map(t => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                      <span className="font-medium">{t.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{t.district}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {t.assignedEngineers.slice(0, 2).map(eng => (
                        <Badge key={eng} variant="secondary" className="text-xs">{eng}</Badge>
                      ))}
                      {t.assignedEngineers.length > 2 && (
                        <Badge variant="secondary" className="text-xs">+{t.assignedEngineers.length - 2}</Badge>
                      )}
                      {t.assignedEngineers.length === 0 && (
                        <span className="text-xs text-red-500">Не назначены</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-orange-600">{t.activeOrders}</span>
                      <div className="w-16 bg-gray-100 rounded-full h-1.5">
                        <div
                          className="rounded-full h-1.5 bg-orange-400"
                          style={{ width: `${Math.min(100, (t.activeOrders / 20) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><span className="font-medium">{t.clientsCount}</span></TableCell>
                  <TableCell>
                    <span className={`font-medium ${t.avgResponseTime <= 1.5 ? 'text-green-600' : t.avgResponseTime <= 2.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {t.avgResponseTime} ч
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => openAssignModal(t)} className="text-blue-600 hover:text-blue-700">
                      <Icon name="Users" size={14} className="mr-1" />
                      Назначить
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!assignModal} onOpenChange={() => setAssignModal(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {assignModal && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: assignModal.color }} />
                  Назначение инженеров — {assignModal.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Перетащите инженеров между территориями или пулом доступных сотрудников
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-3 min-h-[180px]"
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleDropOnPool}
                  >
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Доступные инженеры ({getUnassignedEngineers().length})
                    </div>
                    <div className="space-y-1">
                      {getUnassignedEngineers().map(eng => (
                        <div
                          key={eng}
                          draggable
                          onDragStart={() => handleDragStart(eng, 'pool')}
                          className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-md cursor-grab hover:border-blue-300 hover:bg-blue-50 select-none"
                        >
                          <Icon name="GripVertical" size={14} className="text-gray-400" />
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                            {eng.charAt(0)}
                          </div>
                          <span className="text-sm">{eng}</span>
                        </div>
                      ))}
                      {getUnassignedEngineers().length === 0 && (
                        <div className="text-xs text-gray-400 text-center py-4">
                          Все инженеры назначены
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {territories.map(t => (
                      <div
                        key={t.id}
                        className="border rounded-lg p-3"
                        style={{ borderColor: `${t.color}60`, backgroundColor: `${t.color}08` }}
                        onDragOver={e => e.preventDefault()}
                        onDrop={() => handleDropOnTerritory(t.id)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                          <span className="text-xs font-semibold text-gray-700">{t.name}</span>
                          <span className="text-xs text-gray-400">({(tempEngineers[t.id] || t.assignedEngineers).length} инж.)</span>
                        </div>
                        <div className="flex flex-wrap gap-1 min-h-[28px]">
                          {(tempEngineers[t.id] || t.assignedEngineers).map(eng => (
                            <div
                              key={eng}
                              draggable
                              onDragStart={() => handleDragStart(eng, t.id)}
                              className="flex items-center gap-1 px-2 py-1 bg-white border rounded-md text-xs cursor-grab hover:border-blue-300 select-none"
                              style={{ borderColor: `${t.color}60` }}
                            >
                              <Icon name="GripVertical" size={10} className="text-gray-400" />
                              {eng}
                            </div>
                          ))}
                          {(tempEngineers[t.id] || t.assignedEngineers).length === 0 && (
                            <div className="text-xs text-gray-400 py-1">Перетащите сюда</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setAssignModal(null)}>Отмена</Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={saveAssignments}>
                    <Icon name="Save" size={16} className="mr-2" />
                    Сохранить
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TerritoriesList;
