import { useState } from 'react';
import SNRDSidebar from '@/components/snrd/SNRDSidebar';
import SNRDHeader from '@/components/snrd/SNRDHeader';
import Dashboard from '@/components/snrd/Dashboard';
import ApplicationsList from '@/components/snrd/ApplicationsList';
import EmployeesList from '@/components/snrd/EmployeesList';
import ClientsList from '@/components/snrd/ClientsList';
import ServiceObjectsList from '@/components/snrd/ServiceObjectsList';
import WorkOrdersList from '@/components/snrd/WorkOrdersList';
import ContractsList from '@/components/snrd/ContractsList';
import ApplicationDraftsList from '@/components/snrd/ApplicationDraftsList';
import WorkDraftsList from '@/components/snrd/WorkDraftsList';
import AssignExecutors from '@/components/snrd/AssignExecutors';
import AutoPlanning from '@/components/snrd/AutoPlanning';
import ScheduledMaintenance from '@/components/snrd/ScheduledMaintenance';
import Reports from '@/components/snrd/Reports';
import ApplicationModal from '@/components/snrd/ApplicationModal';
import EmployeeModal from '@/components/snrd/EmployeeModal';
import ClientModal from '@/components/snrd/ClientModal';
import ServiceObjectModal from '@/components/snrd/ServiceObjectModal';
import CompletionActs from '@/components/snrd/CompletionActs';
import FinanceDashboard from '@/components/snrd/FinanceDashboard';
import ContractorsList from '@/components/snrd/ContractorsList';
import ServiceTypesList from '@/components/snrd/ServiceTypesList';
import SLAAgreementsList from '@/components/snrd/SLAAgreementsList';
import TerritoriesList from '@/components/snrd/TerritoriesList';
import OfficeUsersList from '@/components/snrd/OfficeUsersList';
import WorkGroupsList from '@/components/snrd/WorkGroupsList';
import SurveyTemplatesList from '@/components/snrd/SurveyTemplatesList';
import SurveyJournal from '@/components/snrd/SurveyJournal';
import TypedTasksList from '@/components/snrd/TypedTasksList';
import CRMModule from '@/components/snrd/CRMModule';
import HRModule from '@/components/snrd/HRModule';
import WarehouseModule from '@/components/snrd/WarehouseModule';
import RolesConstructor from '@/components/snrd/RolesConstructor';
import ImportData from '@/components/snrd/ImportData';
import LicensingModule from '@/components/snrd/LicensingModule';
import IntegrationsModule from '@/components/snrd/IntegrationsModule';
import DispatchBoard from '@/components/snrd/DispatchBoard';
import PriceListModule from '@/components/snrd/PriceListModule';
import Client360 from '@/components/snrd/Client360';
import AIChatPanel from '@/components/snrd/AIChatPanel';
import DocumentLibrary from '@/components/snrd/DocumentLibrary';
import InboxModule from '@/components/snrd/InboxModule';
import NotificationsCenter from '@/components/snrd/NotificationsCenter';
import EquipmentModule from '@/components/snrd/EquipmentModule';
import MembershipsModule from '@/components/snrd/MembershipsModule';
import TechnicianScorecard from '@/components/snrd/TechnicianScorecard';
import ReliabilityDashboard from '@/components/snrd/ReliabilityDashboard';
import RefrigerantComplianceReporter from '@/components/snrd/RefrigerantComplianceReporter';
import CashFlowForecast from '@/components/snrd/CashFlowForecast';
import WarrantyTracking from '@/components/snrd/WarrantyTracking';
import WorkflowBuilder from '@/components/snrd/WorkflowBuilder';
import CapacityPlanning from '@/components/snrd/CapacityPlanning';
import CustomerHealthScore from '@/components/snrd/CustomerHealthScore';
import LMSModule from '@/components/snrd/LMSModule';
import EmployeeOnboarding from '@/components/snrd/EmployeeOnboarding';
import KPIDashboard from '@/components/snrd/KPIDashboard';
import SLAMonitor from '@/components/snrd/SLAMonitor';
import ClientPortalSettings from '@/components/snrd/ClientPortalSettings';
import StockAlerts from '@/components/snrd/StockAlerts';
import AuditLog from '@/components/snrd/AuditLog';
import RoleDashboard from '@/components/snrd/RoleDashboard';
import AnalyticsDashboard from '@/components/snrd/AnalyticsDashboard';
import CPQModule from '@/components/snrd/CPQModule';
import AIAssistant from '@/components/snrd/AIAssistant';
import SystemSettings from '@/components/snrd/SystemSettings';
import IoTDashboard from '@/components/snrd/IoTDashboard';
import MaintenancePlanner from '@/components/snrd/MaintenancePlanner';
import FieldMap from '@/components/snrd/FieldMap';
import NotificationTemplates from '@/components/snrd/NotificationTemplates';
import ServiceObjectCard from '@/components/snrd/ServiceObjectCard';
import LeadScoring from '@/components/snrd/LeadScoring';
import WorkOrderDetail from '@/components/snrd/WorkOrderDetail';
import FinancialPlanning from '@/components/snrd/FinancialPlanning';
import RouteOptimizer from '@/components/snrd/RouteOptimizer';
import PayrollModule from '@/components/snrd/PayrollModule';
import PurchaseOrders from '@/components/snrd/PurchaseOrders';
import CompetencyMatrix from '@/components/snrd/CompetencyMatrix';
import OnboardingProgress from '@/components/snrd/OnboardingProgress';
import SmartDispatch from '@/components/snrd/SmartDispatch';
import ReportBuilder from '@/components/snrd/ReportBuilder';
import PerformanceDashboard from '@/components/snrd/PerformanceDashboard';
import MultiChannelInbox from '@/components/snrd/MultiChannelInbox';
import PriceCalculator from '@/components/snrd/PriceCalculator';
import ClientFeedback from '@/components/snrd/ClientFeedback';
import ServiceCalendar from '@/components/snrd/ServiceCalendar';
import CommandPalette from '@/components/ui/CommandPalette';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Application, WorkOrder, Employee, Client, ServiceObject } from '@/types/snrd';
import { mockApplications, mockWorkOrders, mockClients, mockEmployees, mockServiceObjects, mockServiceTypes } from '@/data/snrdTestData';
import { useApplications, useOrders, useClients, useEngineers } from '@/hooks/useApi';

const SNRD = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [objectSearchQuery, setObjectSearchQuery] = useState('');
  const [workOrderSearchQuery, setWorkOrderSearchQuery] = useState('');
  const [workOrderStatusFilter, setWorkOrderStatusFilter] = useState('all');

  const { data: apiApplications } = useApplications();
  const { data: apiWorkOrders } = useOrders();
  const { data: apiClients } = useClients();
  const { data: apiEmployees } = useEngineers();

  const [localApplications, setLocalApplications] = useState<Application[]>([]);
  const [localWorkOrders, setLocalWorkOrders] = useState<WorkOrder[]>([]);
  const [localEmployees, setLocalEmployees] = useState<Employee[]>([]);
  const [localClients, setLocalClients] = useState<Client[]>([]);
  const [serviceObjects, setServiceObjects] = useState<ServiceObject[]>(mockServiceObjects);

  const applications = apiApplications ?? (localApplications.length ? localApplications : mockApplications);
  const workOrders = apiWorkOrders ?? (localWorkOrders.length ? localWorkOrders : mockWorkOrders);
  const employees = apiEmployees ?? (localEmployees.length ? localEmployees : mockEmployees);
  const clients = apiClients ?? (localClients.length ? localClients : mockClients);

  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [serviceObjectModalOpen, setServiceObjectModalOpen] = useState(false);
  
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingServiceObject, setEditingServiceObject] = useState<ServiceObject | null>(null);
  const [client360Id, setClient360Id] = useState<{ id: string; name: string } | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Новая':
      case 'Назначен':
        return 'bg-blue-100 text-blue-700';
      case 'В работе':
      case 'Принят':
        return 'bg-green-100 text-green-700';
      case 'В пути':
        return 'bg-yellow-100 text-yellow-700';
      case 'Выполнена':
      case 'Выполнен':
        return 'bg-purple-100 text-purple-700';
      case 'Отменена':
      case 'Отменен':
        return 'bg-gray-100 text-gray-700';
      case 'Приостановлена':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'Аварийный':
        return 'bg-red-100 text-red-700 font-bold';
      case 'Срочно':
        return 'bg-red-100 text-red-700';
      case 'Высокий':
        return 'bg-orange-100 text-orange-700';
      case 'Средний':
        return 'bg-yellow-100 text-yellow-700';
      case 'Низкий':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleCreateNew = () => {
    switch (activeTab) {
      case 'applications':
        setEditingApplication(null);
        setApplicationModalOpen(true);
        break;
      case 'employees':
        setEditingEmployee(null);
        setEmployeeModalOpen(true);
        break;
      case 'clients':
        setEditingClient(null);
        setClientModalOpen(true);
        break;
      case 'service-objects':
        setEditingServiceObject(null);
        setServiceObjectModalOpen(true);
        break;
      case 'price-list':
        toast.info('Используйте кнопку "Добавить позицию" в прайс-листе');
        break;
      default:
        toast.info('Создание элемента для этого раздела в разработке');
    }
  };

  const handleEdit = (app: Application) => {
    setEditingApplication(app);
    setApplicationModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setLocalApplications(applications.filter(a => a.id !== id));
    toast.success('Заявка удалена');
  };

  const handleSaveApplication = (appData: Partial<Application>) => {
    if (editingApplication) {
      setLocalApplications(applications.map(a => a.id === editingApplication.id ? { ...editingApplication, ...appData } : a));
      toast.success('Заявка обновлена');
    } else {
      const newApp: Application = {
        id: `APP-${Date.now()}`,
        number: appData.number || `APP-${Date.now().toString().slice(-6)}`,
        clientId: appData.clientId!,
        objectId: appData.objectId!,
        serviceTypeId: appData.serviceTypeId!,
        status: appData.status || 'Новая',
        priority: appData.priority || 'Средний',
        createdAt: appData.createdAt || new Date().toISOString(),
        slaDeadline: appData.slaDeadline || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        description: appData.description!,
        isEmergency: appData.isEmergency || false,
        plannedStartDate: appData.plannedStartDate,
        plannedEndDate: appData.plannedEndDate,
      };
      setLocalApplications([...applications, newApp]);
      toast.success('Заявка создана');
    }
  };

  const handleSaveEmployee = (empData: Partial<Employee>) => {
    if (editingEmployee) {
      setLocalEmployees(employees.map(e => e.id === editingEmployee.id ? { ...editingEmployee, ...empData } : e));
      toast.success('Данные сотрудника обновлены');
    } else {
      const newEmp: Employee = {
        id: empData.id || `E${Date.now().toString().slice(-3)}`,
        fullName: empData.fullName!,
        position: empData.position!,
        phone: empData.phone!,
        email: empData.email!,
        status: empData.status || 'На смене',
        competencies: empData.competencies || [],
        workSchedule: empData.workSchedule || '5/2',
        employmentType: empData.employmentType || 'Сотрудник компании',
        territory: empData.territory || '',
        workGroup: empData.workGroup || '',
        licensed: empData.licensed || false,
      };
      setLocalEmployees([...employees, newEmp]);
      toast.success('Сотрудник добавлен');
    }
  };

  const handleSaveClient = (clientData: Partial<Client>) => {
    if (editingClient) {
      setLocalClients(clients.map(c => c.id === editingClient.id ? { ...editingClient, ...clientData } : c));
      toast.success('Данные клиента обновлены');
    } else {
      const newClient: Client = {
        id: clientData.id || `C${Date.now().toString().slice(-3)}`,
        name: clientData.name!,
        contactPerson: clientData.contactPerson!,
        phone: clientData.phone!,
        email: clientData.email!,
        contract: clientData.contract || 'Активен',
        slaAgreement: clientData.slaAgreement || `SLA-${Date.now().toString().slice(-3)}`,
        objectsCount: clientData.objectsCount || 0,
        assetsCount: clientData.assetsCount || 0,
      };
      setLocalClients([...clients, newClient]);
      toast.success('Клиент добавлен');
    }
  };

  const handleSaveServiceObject = (objData: Partial<ServiceObject>) => {
    if (editingServiceObject) {
      setServiceObjects(serviceObjects.map(o => o.id === editingServiceObject.id ? { ...editingServiceObject, ...objData } : o));
      toast.success('Объект обслуживания обновлен');
    } else {
      const newObj: ServiceObject = {
        id: objData.id || `OBJ-${Date.now().toString().slice(-4)}`,
        name: objData.name!,
        type: objData.type || 'Локация',
        clientId: objData.clientId!,
        address: objData.address!,
        coordinates: objData.coordinates,
        parentId: objData.parentId,
        assignedEmployees: objData.assignedEmployees || [],
        timezone: objData.timezone || 'Europe/Moscow',
      };
      setServiceObjects([...serviceObjects, newObj]);
      toast.success('Объект обслуживания добавлен');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            applications={applications}
            workOrders={workOrders}
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor}
          />
        );
      
      case 'applications':
        return (
          <ApplicationsList
            applications={applications}
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
          />
        );

      case 'application-drafts':
        return <ApplicationDraftsList />;

      case 'work-orders':
        return (
          <WorkOrdersList
            workOrders={workOrders}
            employees={employees}
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor}
            onEdit={(order) => console.log('Edit order', order)}
            onDelete={(id) => {
              setLocalWorkOrders(workOrders.filter(w => w.id !== id));
              toast.success('Наряд удален');
            }}
            searchQuery={workOrderSearchQuery}
            setSearchQuery={setWorkOrderSearchQuery}
            statusFilter={workOrderStatusFilter}
            setStatusFilter={setWorkOrderStatusFilter}
          />
        );

      case 'contracts':
        return <ContractsList />;

      case 'work-drafts':
        return <WorkDraftsList />;

      case 'assign-executors':
        return (
          <AssignExecutors
            applications={applications}
            employees={employees}
            getPriorityColor={getPriorityColor}
          />
        );

      case 'auto-planning':
        return <AutoPlanning />;

      case 'employees':
        return (
          <EmployeesList
            employees={employees}
            onEdit={(emp) => {
              setEditingEmployee(emp);
              setEmployeeModalOpen(true);
            }}
            onDelete={(id) => {
              setLocalEmployees(employees.filter(e => e.id !== id));
              toast.success('Сотрудник удален');
            }}
            searchQuery={employeeSearchQuery}
            setSearchQuery={setEmployeeSearchQuery}
          />
        );

      case 'clients':
        if (client360Id) {
          return (
            <Client360
              clientId={client360Id.id}
              clientName={client360Id.name}
              onBack={() => setClient360Id(null)}
            />
          );
        }
        return (
          <ClientsList
            clients={clients}
            onEdit={(client) => {
              setEditingClient(client);
              setClientModalOpen(true);
            }}
            onDelete={(id) => {
              setLocalClients(clients.filter(c => c.id !== id));
              toast.success('Клиент удален');
            }}
            onView360={(id, name) => setClient360Id({ id, name })}
            searchQuery={clientSearchQuery}
            setSearchQuery={setClientSearchQuery}
          />
        );

      case 'service-objects':
        return (
          <ServiceObjectsList
            serviceObjects={serviceObjects}
            clients={clients}
            onEdit={(obj) => {
              setEditingServiceObject(obj);
              setServiceObjectModalOpen(true);
            }}
            onDelete={(id) => {
              setServiceObjects(serviceObjects.filter(o => o.id !== id));
              toast.success('Объект удален');
            }}
            searchQuery={objectSearchQuery}
            setSearchQuery={setObjectSearchQuery}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
          />
        );

      case 'scheduled-maintenance':
        return <ScheduledMaintenance />;

      case 'reports':
        return <Reports />;

      case 'finance':
        return <FinanceDashboard />;

      case 'contractors':
        return <ContractorsList />;

      case 'service-types':
        return <ServiceTypesList />;

      case 'typed-tasks':
        return <TypedTasksList />;

      case 'sla':
        return <SLAAgreementsList />;

      case 'territories':
        return <TerritoriesList />;

      case 'office-users':
        return <OfficeUsersList />;

      case 'work-groups':
        return <WorkGroupsList />;

      case 'survey-templates':
        return <SurveyTemplatesList />;

      case 'survey-journal':
        return <SurveyJournal />;

      case 'crm':
        return <CRMModule />;

      case 'hr':
        return <HRModule />;

      case 'warehouse':
        return <WarehouseModule />;

      case 'roles':
        return <RolesConstructor />;

      case 'import':
        return <ImportData />;

      case 'licensing':
        return <LicensingModule />;

      case 'integrations':
        return <IntegrationsModule />;

      case 'dispatch-board':
        return <DispatchBoard />;

      case 'price-list':
        return <PriceListModule />;

      case 'ai-chat':
        return <AIAssistant />;

      case 'documents':
        return <DocumentLibrary />;

      case 'inbox':
        return <InboxModule />;

      case 'notifications':
        return <NotificationsCenter />;

      case 'equipment':
        return <EquipmentModule />;

      case 'memberships':
        return <MembershipsModule />;

      case 'technician-scorecard':
        return <TechnicianScorecard />;

      case 'reliability-dashboard':
        return <ReliabilityDashboard />;

      case 'refrigerant-compliance':
        return <RefrigerantComplianceReporter />;

      case 'cash-flow':
        return <CashFlowForecast />;

      case 'warranty-tracking':
        return <WarrantyTracking />;

      case 'workflow-builder':
        return <WorkflowBuilder />;

      case 'capacity-planning':
        return <CapacityPlanning />;

      case 'customer-health':
        return <CustomerHealthScore />;

      case 'lms':
        return <LMSModule />;

      case 'employee-onboarding':
        return <EmployeeOnboarding />;

      case 'completion-acts':
        return <CompletionActs />;

      case 'kpi-dashboard':
        return <KPIDashboard />;

      case 'sla-monitor':
        return <SLAMonitor />;

      case 'client-portal-settings':
        return <ClientPortalSettings />;

      case 'stock-alerts':
        return <StockAlerts />;

      case 'audit-log':
        return <AuditLog />;

      case 'role-dashboard':
        return <RoleDashboard />;

      case 'analytics-dashboard':
        return <AnalyticsDashboard />;

      case 'cpq':
        return <CPQModule />;

      case 'system-settings':
        return <SystemSettings />;

      case 'iot-dashboard':
        return <IoTDashboard />;

      case 'maintenance-planner':
        return <MaintenancePlanner />;

      case 'field-map':
        return <FieldMap />;

      case 'notification-templates':
        return <NotificationTemplates />;

      case 'service-object-card':
        return <ServiceObjectCard />;

      case 'lead-scoring':
        return <LeadScoring />;

      case 'work-order-detail':
        return <WorkOrderDetail />;

      case 'financial-planning':
        return <FinancialPlanning />;

      case 'route-optimizer':
        return <RouteOptimizer />;

      case 'payroll':
        return <PayrollModule />;

      case 'purchase-orders':
        return <PurchaseOrders />;

      case 'competency-matrix':
        return <CompetencyMatrix />;

      case 'onboarding-progress':
        return <OnboardingProgress />;

      case 'smart-dispatch':
        return <SmartDispatch />;

      case 'client-feedback':
        return <ClientFeedback />;

      case 'service-calendar':
        return <ServiceCalendar />;

      case 'report-builder':
        return <ReportBuilder />;

      case 'performance-dashboard':
        return <PerformanceDashboard />;

      case 'multi-channel-inbox':
        return <MultiChannelInbox />;

      case 'price-calculator':
        return <PriceCalculator />;

      default:
        return (
          <div className="p-8">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Раздел в разработке</h3>
              <p className="text-gray-700">Функционал раздела "{activeTab}" будет добавлен позже</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <SNRDSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 overflow-auto">
        <SNRDHeader
          activeTab={activeTab}
          onCreateNew={handleCreateNew}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />
        {renderContent()}
      </main>

      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={(section) => { setActiveTab(section); setCommandPaletteOpen(false); }}
      />

      <ApplicationModal
        open={applicationModalOpen}
        onClose={() => {
          setApplicationModalOpen(false);
          setEditingApplication(null);
        }}
        onSave={handleSaveApplication}
        application={editingApplication}
        clients={clients}
        serviceObjects={serviceObjects}
        serviceTypes={mockServiceTypes}
      />

      <EmployeeModal
        open={employeeModalOpen}
        onClose={() => {
          setEmployeeModalOpen(false);
          setEditingEmployee(null);
        }}
        onSave={handleSaveEmployee}
        employee={editingEmployee}
      />

      <ClientModal
        open={clientModalOpen}
        onClose={() => {
          setClientModalOpen(false);
          setEditingClient(null);
        }}
        onSave={handleSaveClient}
        client={editingClient}
      />

      <ServiceObjectModal
        open={serviceObjectModalOpen}
        onClose={() => {
          setServiceObjectModalOpen(false);
          setEditingServiceObject(null);
        }}
        onSave={handleSaveServiceObject}
        serviceObject={editingServiceObject}
        clients={clients}
        employees={employees}
        serviceObjects={serviceObjects}
      />
    </div>
  );
};

export default SNRD;