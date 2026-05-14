import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Application, ApplicationStatus, Priority, Client, ServiceObject, ServiceType } from '@/types/snrd';

const SLA_HOURS_BY_PRIORITY: Record<string, number> = {
  'Аварийный': 4,
  'Срочно': 8,
  'Высокий': 24,
  'Средний': 48,
  'Низкий': 72,
};

function getDefaultSlaDeadline(priority?: string): string {
  const hours = SLA_HOURS_BY_PRIORITY[priority || 'Средний'] || 24;
  return new Date(Date.now() + hours * 3600_000).toISOString();
}

interface ApplicationModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (app: Partial<Application>) => void;
  application?: Application | null;
  clients: Client[];
  serviceObjects: ServiceObject[];
  serviceTypes: ServiceType[];
}

const ApplicationModal = ({ 
  open, 
  onClose, 
  onSave, 
  application, 
  clients, 
  serviceObjects, 
  serviceTypes 
}: ApplicationModalProps) => {
  const [formData, setFormData] = useState<Partial<Application>>({
    clientId: '',
    objectId: '',
    serviceTypeId: '',
    status: 'Новая',
    priority: 'Средний',
    description: '',
    isEmergency: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (application) {
      setFormData(application);
    } else {
      setFormData({
        clientId: '',
        objectId: '',
        serviceTypeId: '',
        status: 'Новая',
        priority: 'Средний',
        description: '',
        isEmergency: false,
      });
    }
    setErrors({});
  }, [application, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.clientId) newErrors.clientId = 'Выберите клиента';
    if (!formData.objectId) newErrors.objectId = 'Выберите объект';
    if (!formData.serviceTypeId) newErrors.serviceTypeId = 'Выберите вид работ';
    if (!formData.description?.trim()) newErrors.description = 'Введите описание';
    return newErrors;
  };

  const handleSave = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const dataToSave: Partial<Application> = {
      ...formData,
      createdAt: formData.createdAt || new Date().toISOString(),
      number: formData.number || `APP-${Date.now().toString().slice(-6)}`,
      slaDeadline: formData.slaDeadline || getDefaultSlaDeadline(formData.priority),
    };

    onSave(dataToSave);
    onClose();
  };

  const clientObjects = serviceObjects.filter(obj => obj.clientId === formData.clientId);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{application ? 'Редактировать заявку' : 'Создать заявку'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Клиент *</Label>
              <Select 
                value={formData.clientId} 
                onValueChange={(value) => setFormData({ ...formData, clientId: value, objectId: '' })}
              >
                <SelectTrigger className={errors.clientId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Выберите клиента" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clientId && <p className="text-sm text-red-500">{errors.clientId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="objectId">Объект обслуживания *</Label>
              <Select 
                value={formData.objectId} 
                onValueChange={(value) => setFormData({ ...formData, objectId: value })}
                disabled={!formData.clientId}
              >
                <SelectTrigger className={errors.objectId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Выберите объект" />
                </SelectTrigger>
                <SelectContent>
                  {clientObjects.map(obj => (
                    <SelectItem key={obj.id} value={obj.id}>{obj.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.objectId && <p className="text-sm text-red-500">{errors.objectId}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceTypeId">Вид работ / услуг *</Label>
            <Select 
              value={formData.serviceTypeId} 
              onValueChange={(value) => setFormData({ ...formData, serviceTypeId: value })}
            >
              <SelectTrigger className={errors.serviceTypeId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Выберите вид работ" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.serviceTypeId && <p className="text-sm text-red-500">{errors.serviceTypeId}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание проблемы *</Label>
            <Textarea 
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Опишите проблему или требуемые работы..."
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value as ApplicationStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Новая">Новая</SelectItem>
                  <SelectItem value="В работе">В работе</SelectItem>
                  <SelectItem value="Приостановлена">Приостановлена</SelectItem>
                  <SelectItem value="Выполнена">Выполнена</SelectItem>
                  <SelectItem value="Отменена">Отменена</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Приоритет</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData({ ...formData, priority: value as Priority })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Низкий">Низкий</SelectItem>
                  <SelectItem value="Средний">Средний</SelectItem>
                  <SelectItem value="Высокий">Высокий</SelectItem>
                  <SelectItem value="Срочно">Срочно</SelectItem>
                  <SelectItem value="Аварийный">Аварийный</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                SLA: {SLA_HOURS_BY_PRIORITY[formData.priority || 'Средний']}ч с момента создания
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isEmergency" 
              checked={formData.isEmergency}
              onCheckedChange={(checked) => setFormData({ ...formData, isEmergency: checked as boolean })}
            />
            <Label htmlFor="isEmergency" className="font-normal cursor-pointer">
              Аварийная заявка (требует немедленного реагирования)
            </Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plannedStartDate">Планируемая дата начала</Label>
              <Input 
                id="plannedStartDate"
                type="datetime-local"
                value={formData.plannedStartDate?.slice(0, 16) || ''}
                onChange={(e) => setFormData({ ...formData, plannedStartDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plannedEndDate">Планируемая дата окончания</Label>
              <Input 
                id="plannedEndDate"
                type="datetime-local"
                value={formData.plannedEndDate?.slice(0, 16) || ''}
                onChange={(e) => setFormData({ ...formData, plannedEndDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSave}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationModal;
