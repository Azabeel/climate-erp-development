const BASE_URL = '/api/v1';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('sk_token');
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ─── Work Orders ─────────────────────────────────────────────────────────────
export interface WorkOrderDto {
  id: string;
  number: string;
  type: string;
  status: string;
  priority: string;
  source: string;
  clientId: string;
  clientName: string;
  contractId?: string;
  engineerId?: string;
  engineerName?: string;
  description?: string;
  totalEstimatedDurationMinutes?: number;
  slaStatus: string;
  slaViolated: boolean;
  slaTtfPlanned?: string;
  revenue: number;
  costPrice: number;
  margin: number;
  marginPercent: number;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export const workOrdersApi = {
  list: (page = 0, size = 20) =>
    request<Page<WorkOrderDto>>(`/work-orders?page=${page}&size=${size}`),
  getById: (id: string) => request<WorkOrderDto>(`/work-orders/${id}`),
  create: (data: {
    clientId: string; type: string; priority: string; source: string;
    description?: string; contractId?: string;
  }) => request<WorkOrderDto>('/work-orders', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string, comment?: string) =>
    request<WorkOrderDto>(`/work-orders/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, comment }),
    }),
  assign: (id: string, engineerId: string, secondEngineerId?: string) =>
    request<WorkOrderDto>(`/work-orders/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ engineerId, secondEngineerId }),
    }),
};

// ─── Clients ─────────────────────────────────────────────────────────────────
export interface ClientDto {
  id: string;
  type: string;
  name: string;
  inn?: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

export const clientsApi = {
  list: (page = 0, size = 20) =>
    request<Page<ClientDto>>(`/clients?page=${page}&size=${size}`),
  getById: (id: string) => request<ClientDto>(`/clients/${id}`),
  create: (data: { type: string; name: string; phone?: string; email?: string }) =>
    request<ClientDto>('/clients', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ClientDto>) =>
    request<ClientDto>(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// ─── Engineers ───────────────────────────────────────────────────────────────
export interface EngineerDto {
  id: string;
  fullName: string;
  phone?: string;
  email?: string;
  employmentType: string;
  isActive: boolean;
  useInAutoScheduler: boolean;
}

export const engineersApi = {
  list: (page = 0, size = 50) =>
    request<Page<EngineerDto>>(`/engineers?page=${page}&size=${size}`),
  getById: (id: string) => request<EngineerDto>(`/engineers/${id}`),
};

// ─── Planning ────────────────────────────────────────────────────────────────
export interface EngineerSuggestionDto {
  engineerId: string;
  engineerName: string;
  score: number;
  reason: string;
}

export const planningApi = {
  suggest: (workOrderId: string) =>
    request<EngineerSuggestionDto[]>('/planning/suggest', {
      method: 'POST',
      body: JSON.stringify({ workOrderId }),
    }),
  assign: (workOrderId: string, engineerId: string, secondEngineerId?: string) =>
    request<WorkOrderDto>('/planning/assign', {
      method: 'POST',
      body: JSON.stringify({ workOrderId, engineerId, secondEngineerId }),
    }),
};

// ─── Stock ───────────────────────────────────────────────────────────────────
export interface StockBalanceDto {
  id: string;
  stockItemId: string;
  stockItemName: string;
  locationId: string;
  locationType: string;
  qty: number;
  reservedQty: number;
  availableQty: number;
}

export const stockApi = {
  balance: (page = 0, size = 50) =>
    request<Page<StockBalanceDto>>(`/stock/balance?page=${page}&size=${size}`),
};

// ─── CRM ─────────────────────────────────────────────────────────────────────
export interface LeadDto {
  id: string;
  clientId?: string;
  name: string;
  phone?: string;
  email?: string;
  source: string;
  status: string;
  createdAt: string;
}

export interface DealDto {
  id: string;
  clientId: string;
  title: string;
  stage: string;
  amount: number;
  probability: number;
  createdAt: string;
}

export const crmApi = {
  leads: (page = 0, size = 20) =>
    request<Page<LeadDto>>(`/crm/leads?page=${page}&size=${size}`),
  deals: (page = 0, size = 20) =>
    request<Page<DealDto>>(`/crm/deals?page=${page}&size=${size}`),
  forecast: () => request<{ forecast: number }>('/crm/deals/forecast'),
};

// ─── Finance ─────────────────────────────────────────────────────────────────
export const financeApi = {
  margin: (workOrderId: string) =>
    request<{ workOrderId: string; revenue: number; costPrice: number; margin: number; marginPercent: number }>(
      `/work-orders/${workOrderId}/margin`
    ),
};

// ─── AI ──────────────────────────────────────────────────────────────────────
export const aiApi = {
  chat: (workOrderId: string, message: string) =>
    request<{ response: string; conversationId: string }>('/ai/consultant/chat', {
      method: 'POST',
      body: JSON.stringify({ workOrderId, message }),
    }),
  errorLookup: (code: string) =>
    request<{ id: string; code: string; description: string; solution: string; severity: string }>(
      '/ai/error-lookup', { method: 'POST', body: JSON.stringify({ code }) }
    ),
};
