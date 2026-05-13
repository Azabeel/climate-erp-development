import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

type SLALevel = 'Стандарт' | 'Приоритет' | 'Критичный';

interface SLAAgreement {
  id: string;
  name: string;
  level: SLALevel;
  responseTimeHours: number;
  resolutionTimeHours: number;
  maintenanceWindowStart: string;
  maintenanceWindowEnd: string;
  penaltyPercent: number;
  clientsCount: number;
  color: string;
  description: string;
}

const mockSLAs: SLAAgreement[] = [
  {
    id: '1',
    name: 'SLA Стандарт',
    level: 'Стандарт',
    responseTimeHours: 24,
    resolutionTimeHours: 72,
    maintenanceWindowStart: '09:00',
    maintenanceWindowEnd: '18:00',
    penaltyPercent: 5,
    clientsCount: 34,
    color: '#3B82F6',
    description: 'Базовый уровень обслуживания для большинства клиентов. Ответ в течение рабочего дня, решение за 3 рабочих дня.',
  },
  {
    id: '2',
    name: 'SLA Бизнес',
    level: 'Приоритет',
    responseTimeHours: 8,
    resolutionTimeHours: 24,
    maintenanceWindowStart: '08:00',
    maintenanceWindowEnd: '20:00',
    penaltyPercent: 10,
    clientsCount: 18,
    color: '#8B5CF6',
    description: 'Расширенное обслуживание для бизнес-клиентов. Ускоренное реагирование и выделенный менеджер.',
  },
  {
    id: '3',
    name: 'SLA Премиум',
    level: 'Приоритет',
    responseTimeHours: 4,
    resolutionTimeHours: 12,
    maintenanceWindowStart: '07:00',
    maintenanceWindowEnd: '22:00',
    penaltyPercent: 15,
    clientsCount: 9,
    color: '#F59E0B',
    description: 'Премиальное обслуживание. Выезд в течение 4 часов, решение за 12 часов в расширенные рабочие окна.',
  },
  {
    id: '4',
    name: 'SLA Критичный 24/7',
    level: 'Критичный',
    responseTimeHours: 1,
    resolutionTimeHours: 4,
    maintenanceWindowStart: '00:00',
    maintenanceWindowEnd: '23:59',
    penaltyPercent: 25,
    clientsCount: 5,
    color: '#EF4444',
    description: 'Критичный уровень для объектов с непрерывным циклом работы. Реагирование в течение 1 часа 24/7.',
  },
  {
    id: '5',
    name: 'SLA Государственный',
    level: 'Стандарт',
    responseTimeHours: 48,
    resolutionTimeHours: 120,
    maintenanceWindowStart: '09:00',
    maintenanceWindowEnd: '17:00',
    penaltyPercent: 3,
    clientsCount: 12,
    color: '#10B981',
    description: 'Специальный уровень для государственных учреждений. Соответствует требованиям 44-ФЗ и 223-ФЗ.',
  },
  {
    id: '6',
    name: 'SLA Холодовая цепь',
    level: 'Критичный',
    responseTimeHours: 2,
    resolutionTimeHours: 6,
    maintenanceWindowStart: '00:00',
    maintenanceWindowEnd: '23:59',
    penaltyPercent: 30,
    clientsCount: 3,
    color: '#06B6D4',
    description: 'Специальный SLA для объектов хранения температурочувствительных продуктов и медикаментов.',
  },
];

const clientsByAgreement: Record<string, string[]> = {
  '1': ['ООО "ТехноСервис"', 'ИП Смирнов А.П.', 'АО "РосТоргСеть"', 'ООО "Офисный мир"', 'ЗАО "Мегастрой"'],
  '2': ['АО "ПромСтрой"', 'ООО "ГлобалЛогистик"', 'ПАО "МосТорг"'],
  '3': ['ООО "АвтоПарк Плюс"', 'АО "ФармаЛаб"'],
  '4': ['ОАО "СтальТрубЗавод"', 'ПАО "Энергосеть"'],
  '5': ['ФГБУ «Клиническая больница»', 'МКУ "Управление ЖКХ"'],
  '6': ['ООО "АрктикФуд"', 'АО "МедФриго"', 'ООО "ХолодСклад"'],
};

const levelColors: Record<SLALevel, string> = {
  'Стандарт': 'bg-blue-100 text-blue-700',
  'Приоритет': 'bg-purple-100 text-purple-700',
  'Критичный': 'bg-red-100 text-red-700',
};

const levelIcons: Record<SLALevel, string> = {
  'Стандарт': 'Shield',
  'Приоритет': 'ShieldCheck',
  'Критичный': 'ShieldAlert',
};

const SLAAgreementsList = () => {
  const [selectedSLA, setSelectedSLA] = useState<SLAAgreement | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSLA, setNewSLA] = useState({
    name: '',
    level: 'Стандарт' as SLALevel,
    responseTimeHours: '',
    resolutionTimeHours: '',
    maintenanceWindowStart: '09:00',
    maintenanceWindowEnd: '18:00',
    penaltyPercent: '',
  });

  const maxResponseTime = 48;
  const maxResolutionTime = 120;

  const formatTime = (hours: number) => {
    if (hours < 1) return `${hours * 60} мин`;
    if (hours === 24) return '24 ч (1 день)';
    if (hours >= 24) return `${hours} ч (${Math.round(hours / 24)} дн.)`;
    return `${hours} ч`;
  };

  const calculatePenaltyExample = (sla: SLAAgreement) => {
    const contractValue = 100000;
    const penalty = (contractValue * sla.penaltyPercent) / 100;
    return penalty;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Соглашения SLA</h2>
          <p className="text-gray-500 mt-1">Уровни обслуживания и параметры SLA</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowCreateModal(true)}>
          <Icon name="Plus" size={16} className="mr-2" />
          Создать SLA
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Icon name="Shield" size={18} className="text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{mockSLAs.length}</div>
                <div className="text-xs text-gray-500">Всего соглашений</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Icon name="Users" size={18} className="text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{mockSLAs.reduce((s, a) => s + a.clientsCount, 0)}</div>
                <div className="text-xs text-gray-500">Клиентов охвачено</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <Icon name="ShieldAlert" size={18} className="text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{mockSLAs.filter(s => s.level === 'Критичный').length}</div>
                <div className="text-xs text-gray-500">Критичных уровней</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Icon name="Percent" size={18} className="text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(mockSLAs.reduce((s, a) => s + a.penaltyPercent, 0) / mockSLAs.length)}%
                </div>
                <div className="text-xs text-gray-500">Средний штраф</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {mockSLAs.map(sla => (
          <Card
            key={sla.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedSLA(sla)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${sla.color}20` }}
                  >
                    <Icon name={levelIcons[sla.level]} size={20} style={{ color: sla.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{sla.name}</h3>
                    <Badge className={`text-xs mt-0.5 ${levelColors[sla.level]}`}>{sla.level}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{sla.clientsCount}</div>
                  <div className="text-xs text-gray-500">клиентов</div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Icon name="Clock" size={12} />
                      Время реакции
                    </span>
                    <span className="text-xs font-semibold" style={{ color: sla.color }}>
                      {formatTime(sla.responseTimeHours)}
                    </span>
                  </div>
                  <Progress
                    value={Math.max(5, 100 - (sla.responseTimeHours / maxResponseTime) * 100)}
                    className="h-1.5"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Icon name="CheckCircle" size={12} />
                      Время решения
                    </span>
                    <span className="text-xs font-semibold" style={{ color: sla.color }}>
                      {formatTime(sla.resolutionTimeHours)}
                    </span>
                  </div>
                  <Progress
                    value={Math.max(5, 100 - (sla.resolutionTimeHours / maxResolutionTime) * 100)}
                    className="h-1.5"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  <Icon name="Clock" size={12} className="inline mr-1" />
                  {sla.maintenanceWindowStart}–{sla.maintenanceWindowEnd}
                </div>
                <div className="text-xs">
                  <span className="text-red-600 font-semibold">Штраф: {sla.penaltyPercent}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedSLA} onOpenChange={() => setSelectedSLA(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedSLA && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${selectedSLA.color}20` }}
                  >
                    <Icon name={levelIcons[selectedSLA.level]} size={20} style={{ color: selectedSLA.color }} />
                  </div>
                  {selectedSLA.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5">
                <div className="flex gap-2">
                  <Badge className={levelColors[selectedSLA.level]}>{selectedSLA.level}</Badge>
                  <Badge variant="outline">{selectedSLA.clientsCount} клиентов</Badge>
                </div>

                <p className="text-sm text-gray-600">{selectedSLA.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">Время реакции</div>
                    <div className="text-2xl font-bold" style={{ color: selectedSLA.color }}>
                      {formatTime(selectedSLA.responseTimeHours)}
                    </div>
                    <Progress
                      value={Math.max(5, 100 - (selectedSLA.responseTimeHours / maxResponseTime) * 100)}
                      className="h-2 mt-2"
                    />
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">Время устранения</div>
                    <div className="text-2xl font-bold" style={{ color: selectedSLA.color }}>
                      {formatTime(selectedSLA.resolutionTimeHours)}
                    </div>
                    <Progress
                      value={Math.max(5, 100 - (selectedSLA.resolutionTimeHours / maxResolutionTime) * 100)}
                      className="h-2 mt-2"
                    />
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">Окно обслуживания</div>
                    <div className="text-lg font-bold text-gray-900">
                      {selectedSLA.maintenanceWindowStart}–{selectedSLA.maintenanceWindowEnd}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {selectedSLA.maintenanceWindowStart === '00:00' && selectedSLA.maintenanceWindowEnd === '23:59'
                        ? '24/7 без выходных'
                        : 'Рабочие часы'}
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">Штраф за нарушение</div>
                    <div className="text-2xl font-bold text-red-600">{selectedSLA.penaltyPercent}%</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Пример: {calculatePenaltyExample(selectedSLA).toLocaleString('ru-RU')} ₽ от 100 000 ₽
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Icon name="Users" size={16} />
                    Клиенты с данным SLA ({clientsByAgreement[selectedSLA.id]?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {(clientsByAgreement[selectedSLA.id] || []).map((client, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">
                          {client.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-800">{client}</span>
                      </div>
                    ))}
                    {selectedSLA.clientsCount > (clientsByAgreement[selectedSLA.id]?.length || 0) && (
                      <div className="text-sm text-gray-500 text-center py-2">
                        + ещё {selectedSLA.clientsCount - (clientsByAgreement[selectedSLA.id]?.length || 0)} клиентов
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline">
                    <Icon name="Edit" size={16} className="mr-2" />
                    Редактировать
                  </Button>
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                    <Icon name="Trash2" size={16} className="mr-2" />
                    Удалить
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create SLA Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Создать соглашение SLA</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Название *</label>
              <Input
                placeholder="Например: SLA Корпоративный"
                value={newSLA.name}
                onChange={e => setNewSLA(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Уровень *</label>
              <select
                value={newSLA.level}
                onChange={e => setNewSLA(p => ({ ...p, level: e.target.value as SLALevel }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Стандарт">Стандарт</option>
                <option value="Приоритет">Приоритет</option>
                <option value="Критичный">Критичный</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Время реакции (ч) *</label>
                <Input
                  type="number"
                  placeholder="24"
                  value={newSLA.responseTimeHours}
                  onChange={e => setNewSLA(p => ({ ...p, responseTimeHours: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Время решения (ч) *</label>
                <Input
                  type="number"
                  placeholder="72"
                  value={newSLA.resolutionTimeHours}
                  onChange={e => setNewSLA(p => ({ ...p, resolutionTimeHours: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Начало окна</label>
                <Input
                  type="time"
                  value={newSLA.maintenanceWindowStart}
                  onChange={e => setNewSLA(p => ({ ...p, maintenanceWindowStart: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Конец окна</label>
                <Input
                  type="time"
                  value={newSLA.maintenanceWindowEnd}
                  onChange={e => setNewSLA(p => ({ ...p, maintenanceWindowEnd: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Штраф за нарушение (%) *</label>
              <Input
                type="number"
                placeholder="10"
                value={newSLA.penaltyPercent}
                onChange={e => setNewSLA(p => ({ ...p, penaltyPercent: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Отмена</Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!newSLA.name || !newSLA.responseTimeHours || !newSLA.resolutionTimeHours || !newSLA.penaltyPercent}
                onClick={() => setShowCreateModal(false)}
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

export default SLAAgreementsList;
