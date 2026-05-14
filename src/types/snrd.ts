export type ApplicationStatus = 'Новая' | 'В работе' | 'Выполнена' | 'Отменена' | 'Приостановлена';
export type WorkOrderStatus = 'Назначен' | 'Принят' | 'В пути' | 'В работе' | 'Выполнен' | 'Отменен';
export type Priority = 'Низкий' | 'Средний' | 'Высокий' | 'Срочно' | 'Аварийный';
export type EmployeeStatus = 'На смене' | 'Перерыв' | 'Обед' | 'Завершил смену' | 'Больничный' | 'Отпуск';
export type ContractStatus = 'Активен' | 'На продлении' | 'Истек' | 'Приостановлен';
export type ClientType = 'Физическое лицо' | 'Юридическое лицо';

export interface Employee {
  id: string;
  fullName: string;
  position: string;
  phone: string;
  email: string;
  status: EmployeeStatus;
  competencies: string[];
  workSchedule: string;
  employmentType: 'Сотрудник компании' | 'Подрядчик';
  territory: string;
  workGroup: string;
  licensed: boolean;
}

export interface Client {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  contract: ContractStatus;
  slaAgreement: string;
  objectsCount: number;
  assetsCount: number;
  inn?: string;
  clientType?: ClientType;
  address?: string;
}

export interface ServiceObject {
  id: string;
  name: string;
  type: 'Локация' | 'Актив';
  clientId: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  parentId?: string;
  assignedEmployees: string[];
  timezone: string;
}

export interface TypedTask {
  id: string;
  name: string;
  duration: number;
  competencies: string[];
  cost: number;
  currency: string;
  surveyTemplateId?: string;
}

export interface ServiceType {
  id: string;
  name: string;
  tasks: string[];
  totalDuration: number;
  totalCost: number;
}

export interface Application {
  id: string;
  number: string;
  clientId: string;
  objectId: string;
  serviceTypeId: string;
  status: ApplicationStatus;
  priority: Priority;
  createdAt: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  slaDeadline: string;
  description: string;
  isEmergency: boolean;
}

export interface WorkOrder {
  id: string;
  number: string;
  applicationId: string;
  employeeId: string;
  status: WorkOrderStatus;
  plannedStartTime: string;
  plannedEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  tasks: TypedTask[];
  photos: string[];
  notes: string;
  revenue?: number;
  costPrice?: number;
  margin?: number;
  marginPercent?: number;
  slaStatus?: 'GREEN' | 'YELLOW' | 'RED';
  slaViolated?: boolean;
  slaDeadline?: string;
}

export type ContractType = 'СЛА' | 'Разовый' | 'Абонентский';

export interface Contract {
  id: string;
  number: string;
  clientId: string;
  clientName?: string;
  type: ContractType;
  status: ContractStatus;
  slaAgreementId?: string;
  slaAgreementName?: string;
  validFrom: string;
  validTo: string;
  monthlyAmount?: number;
  notes?: string;
}

export interface SLA {
  id: string;
  name: string;
  responseTime: number;
  resolutionTime: number;
  priority: Priority;
}

export interface SLAAgreement {
  id: string;
  name: string;
  clientId: string;
  slaLevels: SLA[];
  validFrom: string;
  validTo?: string;
}

export interface ScheduledMaintenance {
  id: string;
  name: string;
  serviceTypeId: string;
  objectIds: string[];
  frequency: 'Ежедневно' | 'Еженедельно' | 'Ежемесячно' | 'Ежеквартально' | 'Ежегодно';
  startDate: string;
  endDate?: string;
  nextExecutionDate: string;
  assignedEmployeeId?: string;
}

export interface Territory {
  id: string;
  name: string;
  parentId?: string;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface WorkGroup {
  id: string;
  name: string;
  employeeIds: string[];
  territoryIds: string[];
}
