import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  workOrdersApi, clientsApi, engineersApi, planningApi, stockApi, crmApi,
  WorkOrderDto, ClientDto, EngineerDto,
} from '@/lib/api';
import { Application, WorkOrder, Client, Employee } from '@/types/snrd';

// ─── Mappers ─────────────────────────────────────────────────────────────────

function woStatusToFrontend(s: string): Application['status'] {
  switch (s) {
    case 'NEW': return 'Новая';
    case 'IN_PROGRESS': return 'В работе';
    case 'COMPLETED': case 'CLOSED': return 'Выполнена';
    case 'CANCELLED': return 'Отменена';
    case 'AWAITING_PARTS': case 'READY_TO_RESUME': return 'Приостановлена';
    default: return 'Новая';
  }
}

function priorityToFrontend(p: string): Application['priority'] {
  switch (p) {
    case 'EMERGENCY': return 'Аварийный';
    case 'URGENT': return 'Срочно';
    case 'NORMAL': default: return 'Средний';
  }
}

export function mapWorkOrderToApplication(wo: WorkOrderDto): Application {
  return {
    id: wo.id,
    number: wo.number,
    clientId: wo.clientId,
    objectId: wo.contractId || wo.clientId,
    serviceTypeId: wo.type,
    status: woStatusToFrontend(wo.status),
    priority: priorityToFrontend(wo.priority),
    createdAt: wo.createdAt,
    plannedStartDate: wo.slaTtfPlanned,
    slaDeadline: wo.slaTtfPlanned || new Date(Date.now() + 24 * 3600_000).toISOString(),
    description: wo.description || '',
    isEmergency: wo.priority === 'EMERGENCY',
  };
}

function woStatusToOrderStatus(s: string): WorkOrder['status'] {
  switch (s) {
    case 'ASSIGNED': return 'Назначен';
    case 'EN_ROUTE': return 'В пути';
    case 'ON_SITE': case 'IN_PROGRESS': return 'В работе';
    case 'COMPLETED': case 'CLOSED': return 'Выполнен';
    case 'CANCELLED': return 'Отменен';
    default: return 'Назначен';
  }
}

export function mapWorkOrderToOrder(wo: WorkOrderDto): WorkOrder {
  return {
    id: wo.id,
    number: wo.number,
    applicationId: wo.id,
    employeeId: wo.engineerId || '',
    status: woStatusToOrderStatus(wo.status),
    plannedStartTime: wo.createdAt,
    plannedEndTime: wo.slaTtfPlanned || wo.createdAt,
    tasks: [],
    photos: [],
    notes: wo.description || '',
  };
}

export function mapClientDtoToClient(c: ClientDto): Client {
  return {
    id: c.id,
    name: c.name,
    contactPerson: c.name,
    phone: c.phone || '',
    email: c.email || '',
    contract: c.isActive ? 'Активен' : 'Истек',
    slaAgreement: 'SLA',
    objectsCount: 0,
    assetsCount: 0,
  };
}

export function mapEngineerDtoToEmployee(e: EngineerDto): Employee {
  return {
    id: e.id,
    fullName: e.fullName,
    position: 'Инженер',
    phone: e.phone || '',
    email: e.email || '',
    status: e.isActive ? 'На смене' : 'Завершил смену',
    competencies: [],
    workSchedule: '5/2',
    employmentType: e.employmentType === 'CONTRACTOR' ? 'Подрядчик' : 'Сотрудник компании',
    territory: 'Москва',
    workGroup: '',
    licensed: false,
  };
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useWorkOrders(page = 0, size = 50) {
  return useQuery({
    queryKey: ['work-orders', page, size],
    queryFn: () => workOrdersApi.list(page, size),
    staleTime: 30_000,
    retry: false,
  });
}

export function useApplications(page = 0, size = 50) {
  const q = useWorkOrders(page, size);
  return {
    ...q,
    data: q.data ? q.data.content.map(mapWorkOrderToApplication) : undefined,
  };
}

export function useOrders(page = 0, size = 50) {
  const q = useWorkOrders(page, size);
  return {
    ...q,
    data: q.data ? q.data.content.map(mapWorkOrderToOrder) : undefined,
  };
}

export function useClients(page = 0, size = 50) {
  return useQuery({
    queryKey: ['clients', page, size],
    queryFn: async () => {
      const p = await clientsApi.list(page, size);
      return p.content.map(mapClientDtoToClient);
    },
    staleTime: 60_000,
    retry: false,
  });
}

export function useEngineers(page = 0, size = 100) {
  return useQuery({
    queryKey: ['engineers', page, size],
    queryFn: async () => {
      const p = await engineersApi.list(page, size);
      return p.content.map(mapEngineerDtoToEmployee);
    },
    staleTime: 60_000,
    retry: false,
  });
}

export function useCreateWorkOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: workOrdersApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['work-orders'] }),
  });
}

export function useUpdateWorkOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, comment }: { id: string; status: string; comment?: string }) =>
      workOrdersApi.updateStatus(id, status, comment),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['work-orders'] }),
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clientsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });
}

export function usePlanningAssign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ workOrderId, engineerId }: { workOrderId: string; engineerId: string }) =>
      planningApi.assign(workOrderId, engineerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['work-orders'] }),
  });
}

export function useStockBalance() {
  return useQuery({
    queryKey: ['stock-balance'],
    queryFn: () => stockApi.balance(),
    staleTime: 60_000,
    retry: false,
  });
}

export function useCrmLeads() {
  return useQuery({
    queryKey: ['crm-leads'],
    queryFn: () => crmApi.leads(),
    staleTime: 30_000,
    retry: false,
  });
}

export function useCrmForecast() {
  return useQuery({
    queryKey: ['crm-forecast'],
    queryFn: () => crmApi.forecast(),
    staleTime: 60_000,
    retry: false,
  });
}
