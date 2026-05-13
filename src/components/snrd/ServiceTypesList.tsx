import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';

type ServiceCategory = 'Обслуживание' | 'Ремонт' | 'Монтаж' | 'Диагностика';

interface ServiceType {
  id: string;
  name: string;
  category: ServiceCategory;
  estimatedDuration: number; // minutes
  baseCost: number; // ₽
  requiredCertifications: string[];
  popularity: number;
}

const allCertifications = [
  'Допуск к электроустановкам',
  'Монтаж климатических систем',
  'Работа с хладагентами',
  'Монтаж вентиляции',
  'Пожарная безопасность',
  'Работа на высоте',
  'Допуск по газу',
];

const mockServiceTypes: ServiceType[] = [
  {
    id: '1',
    name: 'Плановое техническое обслуживание кондиционера',
    category: 'Обслуживание',
    estimatedDuration: 90,
    baseCost: 3500,
    requiredCertifications: ['Монтаж климатических систем', 'Работа с хладагентами'],
    popularity: 312,
  },
  {
    id: '2',
    name: 'Чистка фильтров и теплообменника',
    category: 'Обслуживание',
    estimatedDuration: 45,
    baseCost: 1800,
    requiredCertifications: ['Монтаж климатических систем'],
    popularity: 285,
  },
  {
    id: '3',
    name: 'Заправка хладагентом',
    category: 'Обслуживание',
    estimatedDuration: 60,
    baseCost: 4200,
    requiredCertifications: ['Работа с хладагентами', 'Монтаж климатических систем'],
    popularity: 198,
  },
  {
    id: '4',
    name: 'Ремонт компрессора',
    category: 'Ремонт',
    estimatedDuration: 240,
    baseCost: 12000,
    requiredCertifications: ['Монтаж климатических систем', 'Работа с хладагентами', 'Допуск к электроустановкам'],
    popularity: 87,
  },
  {
    id: '5',
    name: 'Замена платы управления',
    category: 'Ремонт',
    estimatedDuration: 120,
    baseCost: 6500,
    requiredCertifications: ['Допуск к электроустановкам', 'Монтаж климатических систем'],
    popularity: 104,
  },
  {
    id: '6',
    name: 'Ремонт вентилятора наружного блока',
    category: 'Ремонт',
    estimatedDuration: 150,
    baseCost: 5800,
    requiredCertifications: ['Монтаж климатических систем', 'Допуск к электроустановкам'],
    popularity: 73,
  },
  {
    id: '7',
    name: 'Монтаж настенного кондиционера',
    category: 'Монтаж',
    estimatedDuration: 180,
    baseCost: 8000,
    requiredCertifications: ['Монтаж климатических систем', 'Работа с хладагентами', 'Работа на высоте'],
    popularity: 156,
  },
  {
    id: '8',
    name: 'Монтаж канального кондиционера',
    category: 'Монтаж',
    estimatedDuration: 360,
    baseCost: 22000,
    requiredCertifications: ['Монтаж климатических систем', 'Работа с хладагентами', 'Монтаж вентиляции'],
    popularity: 42,
  },
  {
    id: '9',
    name: 'Монтаж мультисплит-системы',
    category: 'Монтаж',
    estimatedDuration: 480,
    baseCost: 35000,
    requiredCertifications: ['Монтаж климатических систем', 'Работа с хладагентами', 'Работа на высоте', 'Допуск к электроустановкам'],
    popularity: 28,
  },
  {
    id: '10',
    name: 'Диагностика системы кондиционирования',
    category: 'Диагностика',
    estimatedDuration: 60,
    baseCost: 2500,
    requiredCertifications: ['Монтаж климатических систем'],
    popularity: 267,
  },
  {
    id: '11',
    name: 'Диагностика утечки хладагента',
    category: 'Диагностика',
    estimatedDuration: 45,
    baseCost: 2000,
    requiredCertifications: ['Работа с хладагентами'],
    popularity: 143,
  },
  {
    id: '12',
    name: 'Проверка электрооборудования',
    category: 'Диагностика',
    estimatedDuration: 30,
    baseCost: 1500,
    requiredCertifications: ['Допуск к электроустановкам'],
    popularity: 189,
  },
  {
    id: '13',
    name: 'Промывка системы вентиляции',
    category: 'Обслуживание',
    estimatedDuration: 120,
    baseCost: 5500,
    requiredCertifications: ['Монтаж вентиляции'],
    popularity: 61,
  },
  {
    id: '14',
    name: 'Демонтаж кондиционера',
    category: 'Монтаж',
    estimatedDuration: 90,
    baseCost: 4500,
    requiredCertifications: ['Монтаж климатических систем', 'Работа с хладагентами'],
    popularity: 95,
  },
  {
    id: '15',
    name: 'Замена дренажной системы',
    category: 'Ремонт',
    estimatedDuration: 75,
    baseCost: 3200,
    requiredCertifications: ['Монтаж климатических систем'],
    popularity: 112,
  },
];

const categoryColors: Record<ServiceCategory, string> = {
  'Обслуживание': 'bg-blue-100 text-blue-700',
  'Ремонт': 'bg-red-100 text-red-700',
  'Монтаж': 'bg-purple-100 text-purple-700',
  'Диагностика': 'bg-amber-100 text-amber-700',
};

const categoryIcons: Record<ServiceCategory, string> = {
  'Обслуживание': 'Settings',
  'Ремонт': 'Wrench',
  'Монтаж': 'HardHat',
  'Диагностика': 'Stethoscope',
};

const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} мин`;
  if (m === 0) return `${h} ч`;
  return `${h} ч ${m} мин`;
};

interface EditState {
  id: string;
  field: 'baseCost' | 'estimatedDuration';
  value: string;
}

const ServiceTypesList = () => {
  const [services, setServices] = useState<ServiceType[]>(mockServiceTypes);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [editState, setEditState] = useState<EditState | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    category: 'Обслуживание' as ServiceCategory,
    estimatedDuration: '',
    baseCost: '',
    certifications: [] as string[],
  });

  const categories: ServiceCategory[] = ['Обслуживание', 'Ремонт', 'Монтаж', 'Диагностика'];

  const filtered = services.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === 'all' || s.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const startEdit = (id: string, field: 'baseCost' | 'estimatedDuration', value: number) => {
    setEditState({ id, field, value: String(value) });
  };

  const commitEdit = () => {
    if (!editState) return;
    const numVal = parseInt(editState.value, 10);
    if (!isNaN(numVal) && numVal > 0) {
      setServices(prev =>
        prev.map(s =>
          s.id === editState.id ? { ...s, [editState.field]: numVal } : s
        )
      );
    }
    setEditState(null);
  };

  const toggleCert = (cert: string) => {
    setNewService(prev => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert],
    }));
  };

  const handleCreate = () => {
    const dur = parseInt(newService.estimatedDuration, 10);
    const cost = parseInt(newService.baseCost, 10);
    if (!newService.name || isNaN(dur) || isNaN(cost)) return;
    const created: ServiceType = {
      id: String(Date.now()),
      name: newService.name,
      category: newService.category,
      estimatedDuration: dur,
      baseCost: cost,
      requiredCertifications: newService.certifications,
      popularity: 0,
    };
    setServices(prev => [...prev, created]);
    setNewService({ name: '', category: 'Обслуживание', estimatedDuration: '', baseCost: '', certifications: [] });
    setShowCreateModal(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Виды работ</h2>
          <p className="text-gray-500 mt-1">Каталог услуг и видов работ</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowCreateModal(true)}>
          <Icon name="Plus" size={16} className="mr-2" />
          Создать вид работ
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[240px]">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Поиск по названию..."
                className="pl-9"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${categoryFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Все ({services.length})
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${categoryFilter === cat ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {cat} ({services.filter(s => s.category === cat).length})
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grouped table */}
      <div className="space-y-4">
        {categories
          .filter(cat => categoryFilter === 'all' || categoryFilter === cat)
          .map(cat => {
            const catServices = filtered.filter(s => s.category === cat);
            if (catServices.length === 0) return null;
            const isCollapsed = collapsedCategories.has(cat);
            return (
              <Card key={cat}>
                <CardHeader className="py-3 px-4">
                  <button
                    className="flex items-center justify-between w-full"
                    onClick={() => toggleCategory(cat)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${categoryColors[cat]}`}>
                        <Icon name={categoryIcons[cat]} size={16} />
                      </div>
                      <CardTitle className="text-base">{cat}</CardTitle>
                      <Badge variant="secondary">{catServices.length} позиций</Badge>
                    </div>
                    <Icon name={isCollapsed ? 'ChevronRight' : 'ChevronDown'} size={18} className="text-gray-400" />
                  </button>
                </CardHeader>
                {!isCollapsed && (
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Наименование</TableHead>
                          <TableHead>Длительность</TableHead>
                          <TableHead>Базовая стоимость</TableHead>
                          <TableHead>Необходимые допуски</TableHead>
                          <TableHead>Популярность</TableHead>
                          <TableHead>Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {catServices.map(s => (
                          <TableRow key={s.id}>
                            <TableCell className="font-medium max-w-[280px]">{s.name}</TableCell>
                            <TableCell>
                              {editState?.id === s.id && editState.field === 'estimatedDuration' ? (
                                <div className="flex items-center gap-1">
                                  <Input
                                    type="number"
                                    className="w-20 h-7 text-sm"
                                    value={editState.value}
                                    onChange={e => setEditState({ ...editState, value: e.target.value })}
                                    onBlur={commitEdit}
                                    onKeyDown={e => e.key === 'Enter' && commitEdit()}
                                    autoFocus
                                  />
                                  <span className="text-xs text-gray-500">мин</span>
                                </div>
                              ) : (
                                <span
                                  className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded text-sm"
                                  onClick={() => startEdit(s.id, 'estimatedDuration', s.estimatedDuration)}
                                >
                                  {formatDuration(s.estimatedDuration)}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {editState?.id === s.id && editState.field === 'baseCost' ? (
                                <div className="flex items-center gap-1">
                                  <Input
                                    type="number"
                                    className="w-24 h-7 text-sm"
                                    value={editState.value}
                                    onChange={e => setEditState({ ...editState, value: e.target.value })}
                                    onBlur={commitEdit}
                                    onKeyDown={e => e.key === 'Enter' && commitEdit()}
                                    autoFocus
                                  />
                                  <span className="text-xs text-gray-500">₽</span>
                                </div>
                              ) : (
                                <span
                                  className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded font-medium"
                                  onClick={() => startEdit(s.id, 'baseCost', s.baseCost)}
                                >
                                  {s.baseCost.toLocaleString('ru-RU')} ₽
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {s.requiredCertifications.slice(0, 2).map(cert => (
                                  <Badge key={cert} variant="outline" className="text-xs">{cert}</Badge>
                                ))}
                                {s.requiredCertifications.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">+{s.requiredCertifications.length - 2}</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-100 rounded-full h-1.5">
                                  <div
                                    className="bg-blue-500 rounded-full h-1.5"
                                    style={{ width: `${Math.min(100, (s.popularity / 320) * 100)}%` }}
                                  />
                                </div>
                                <span className="text-sm text-gray-600">{s.popularity}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                  <Icon name="Edit" size={14} />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-600">
                                  <Icon name="Trash2" size={14} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                )}
              </Card>
            );
          })}
      </div>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Создать вид работ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Наименование *</label>
              <Input
                placeholder="Введите название вида работ..."
                value={newService.name}
                onChange={e => setNewService(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Категория *</label>
              <select
                value={newService.category}
                onChange={e => setNewService(p => ({ ...p, category: e.target.value as ServiceCategory }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Длительность (мин) *</label>
                <Input
                  type="number"
                  placeholder="60"
                  value={newService.estimatedDuration}
                  onChange={e => setNewService(p => ({ ...p, estimatedDuration: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Базовая стоимость (₽) *</label>
                <Input
                  type="number"
                  placeholder="3500"
                  value={newService.baseCost}
                  onChange={e => setNewService(p => ({ ...p, baseCost: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Необходимые допуски</label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
                {allCertifications.map(cert => (
                  <label key={cert} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={newService.certifications.includes(cert)}
                      onCheckedChange={() => toggleCert(cert)}
                    />
                    <span className="text-sm text-gray-700">{cert}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Отмена</Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleCreate}
                disabled={!newService.name || !newService.estimatedDuration || !newService.baseCost}
              >
                Создать
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceTypesList;
