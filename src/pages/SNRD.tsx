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
import IntegrationsFull from '@/components/snrd/IntegrationsFull';
import StockAlertsFull from '@/components/snrd/StockAlertsFull';
import ClientPortalSettingsFull from '@/components/snrd/ClientPortalSettingsFull';
import OfficeUsersFull from '@/components/snrd/OfficeUsersFull';
import WorkGroupsFull from '@/components/snrd/WorkGroupsFull';
import RolesConstructorFull from '@/components/snrd/RolesConstructorFull';
import AIAnalyticsFull from '@/components/snrd/AIAnalyticsFull';
import SmartDispatchFull from '@/components/snrd/SmartDispatchFull';
import NotificationTemplatesFull from '@/components/snrd/NotificationTemplatesFull';
import LicensingFull from '@/components/snrd/LicensingFull';
import ImportDataFull from '@/components/snrd/ImportDataFull';
import EmployeeOnboardingFull from '@/components/snrd/EmployeeOnboardingFull';
import SurveyModuleFull from '@/components/snrd/SurveyModuleFull';
import IoTDashboardFull from '@/components/snrd/IoTDashboardFull';
import AnalyticsDashboardFull from '@/components/snrd/AnalyticsDashboardFull';
import RoleDashboardFull from '@/components/snrd/RoleDashboardFull';
import DocumentEditorFull from '@/components/snrd/DocumentEditorFull';
import ServiceCalendarFull from '@/components/snrd/ServiceCalendarFull';
import PerformanceDashboardFull from '@/components/snrd/PerformanceDashboardFull';
import MultiChannelInboxFull from '@/components/snrd/MultiChannelInboxFull';
import QuickActionsFull from '@/components/snrd/QuickActionsFull';
import FieldMapFull from '@/components/snrd/FieldMapFull';
import TaskManagerFull from '@/components/snrd/TaskManagerFull';
import CompetencyMatrixFull from '@/components/snrd/CompetencyMatrixFull';
import BudgetPlanningFull from '@/components/snrd/BudgetPlanningFull';
import StockMovementFull from '@/components/snrd/StockMovementFull';
import WarrantyTrackingFull from '@/components/snrd/WarrantyTrackingFull';
import SLAPolicyFull from '@/components/snrd/SLAPolicyFull';
import MobileAppSettingsFull from '@/components/snrd/MobileAppSettingsFull';
import IntegrationLogsFull from '@/components/snrd/IntegrationLogsFull';
import EquipmentQRFull from '@/components/snrd/EquipmentQRFull';
import OnboardingProgressFull from '@/components/snrd/OnboardingProgressFull';
import EquipmentHistoryFull from '@/components/snrd/EquipmentHistoryFull';
import PriceCalculatorFull from '@/components/snrd/PriceCalculatorFull';
import RefrigerantComplianceFull from '@/components/snrd/RefrigerantComplianceFull';
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
import CashFlow from '@/components/snrd/CashFlow';
import WarrantyTracking from '@/components/snrd/WarrantyTracking';
import WorkflowBuilder from '@/components/snrd/WorkflowBuilder';
import CapacityPlanning from '@/components/snrd/CapacityPlanning';
import CustomerHealth from '@/components/snrd/CustomerHealth';
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
import DocumentEditor from '@/components/snrd/DocumentEditor';
import EquipmentQR from '@/components/snrd/EquipmentQR';
import TaskManager from '@/components/snrd/TaskManager';
import SLAPolicy from '@/components/snrd/SLAPolicy';
import StockMovement from '@/components/snrd/StockMovement';
import ContractManager from '@/components/snrd/ContractManager';
import ContractManagerFull from '@/components/snrd/ContractManagerFull';
import ReliabilityDashboardFull from '@/components/snrd/ReliabilityDashboardFull';
import MaintenancePlannerFull from '@/components/snrd/MaintenancePlannerFull';
import ClientFeedbackFull from '@/components/snrd/ClientFeedbackFull';
import SalesAnalyticsFull from '@/components/snrd/SalesAnalyticsFull';
import LeadsFunnelFull from '@/components/snrd/LeadsFunnelFull';
import PayrollDashboardFull from '@/components/snrd/PayrollDashboardFull';
import InventoryAuditFull from '@/components/snrd/InventoryAuditFull';
import GPSTrackingFull from '@/components/snrd/GPSTrackingFull';
import WorkOrderReportFull from '@/components/snrd/WorkOrderReportFull';
import SupplierManagementFull from '@/components/snrd/SupplierManagementFull';
import ClientCard360Full from '@/components/snrd/ClientCard360Full';
import FinanceDashboardFull from '@/components/snrd/FinanceDashboardFull';
import StockReportFull from '@/components/snrd/StockReportFull';
import DispatchCenterFull from '@/components/snrd/DispatchCenterFull';
import EquipmentCatalogFull from '@/components/snrd/EquipmentCatalogFull';
import PurchaseOrderFull from '@/components/snrd/PurchaseOrderFull';
import InvoiceManagerFull from '@/components/snrd/InvoiceManagerFull';
import EngineerScheduleFull from '@/components/snrd/EngineerScheduleFull';
import KnowledgeBaseFull from '@/components/snrd/KnowledgeBaseFull';
import NotificationCenterFull from '@/components/snrd/NotificationCenterFull';
import AIAssistantFull from '@/components/snrd/AIAssistantFull';
import SystemSettingsFull from '@/components/snrd/SystemSettingsFull';
import WorkOrderDetailFull from '@/components/snrd/WorkOrderDetailFull';
import HRDashboardFull from '@/components/snrd/HRDashboardFull';
import ClientsListFull from '@/components/snrd/ClientsListFull';
import CommercialProposalFull from '@/components/snrd/CommercialProposalFull';
import WeatherWidgetFull from '@/components/snrd/WeatherWidgetFull';
import RefrigerantLogFull from '@/components/snrd/RefrigerantLogFull';
import DashboardManagerFull from '@/components/snrd/DashboardManagerFull';
import AuditLogFull from '@/components/snrd/AuditLogFull';
import SLAMonitorFull from '@/components/snrd/SLAMonitorFull';
import MobileEngineerFull from '@/components/snrd/MobileEngineerFull';
import ReportBuilderV2Full from '@/components/snrd/ReportBuilderV2Full';
import TaskBoardFull from '@/components/snrd/TaskBoardFull';
import ClientPortalFull from '@/components/snrd/ClientPortalFull';
import EmailTemplatesFull from '@/components/snrd/EmailTemplatesFull';
import CapacityPlannerFull from '@/components/snrd/CapacityPlannerFull';
import ServiceZonesFull from '@/components/snrd/ServiceZonesFull';
import TelegramBotFull from '@/components/snrd/TelegramBotFull';
import PredictiveMaintenanceFull from '@/components/snrd/PredictiveMaintenanceFull';
import FuelManagementFull from '@/components/snrd/FuelManagementFull';
import OneCIntegrationFull from '@/components/snrd/OneCIntegrationFull';
import QualityControlFull from '@/components/snrd/QualityControlFull';
import SeasonalPlanningFull from '@/components/snrd/SeasonalPlanningFull';
import CostAnalysisFull from '@/components/snrd/CostAnalysisFull';
import DigitalSignatureFull from '@/components/snrd/DigitalSignatureFull';
import IntegrationLogs from '@/components/snrd/IntegrationLogs';
import MobileAppSettings from '@/components/snrd/MobileAppSettings';
import BudgetPlanning from '@/components/snrd/BudgetPlanning';
import QuickActions from '@/components/snrd/QuickActions';
import EquipmentHistory from '@/components/snrd/EquipmentHistory';
import AIAnalytics from '@/components/snrd/AIAnalytics';
import ClientFeedback from '@/components/snrd/ClientFeedback';
import ServiceCalendar from '@/components/snrd/ServiceCalendar';
import ChecklistTemplates from '@/components/snrd/ChecklistTemplates';
import GeofenceZones from '@/components/snrd/GeofenceZones';
import ClientCard from '@/components/snrd/ClientCard';
import DispatchBoardGantt from '@/components/snrd/DispatchBoardGantt';
import TechnicianScorecardFull from '@/components/snrd/TechnicianScorecardFull';
import RouteOptimizerFull from '@/components/snrd/RouteOptimizerFull';
import DispatchBoardFull from '@/components/snrd/DispatchBoardFull';
import CapacityPlanningFull from '@/components/snrd/CapacityPlanningFull';
import KPIDashboardFull from '@/components/snrd/KPIDashboardFull';
import ReportBuilderFull from '@/components/snrd/ReportBuilderFull';
import WarehouseFull from '@/components/snrd/WarehouseFull';
import FinancialSummary from '@/components/snrd/FinancialSummary';
import LeadScoringFull from '@/components/snrd/LeadScoringFull';
import WorkflowBuilderNew from '@/components/snrd/WorkflowBuilderNew';
import CRMFull from '@/components/snrd/CRMFull';
import HRFull from '@/components/snrd/HRFull';
import InboxFull from '@/components/snrd/InboxFull';
import EquipmentFull from '@/components/snrd/EquipmentFull';
import NotificationsFull from '@/components/snrd/NotificationsFull';
import LMSFull from '@/components/snrd/LMSFull';
import MembershipsFull from '@/components/snrd/MembershipsFull';
import WarehouseMapFull from '@/components/snrd/WarehouseMapFull';
import AvitoCRMFull from '@/components/snrd/AvitoCRMFull';
import MarginalityReportFull from '@/components/snrd/MarginalityReportFull';
import DocumentFlowFull from '@/components/snrd/DocumentFlowFull';
import ClientHistoryFull from '@/components/snrd/ClientHistoryFull';
import ServiceRequestFull from '@/components/snrd/ServiceRequestFull';
import EngineerProfileFull from '@/components/snrd/EngineerProfileFull';
import EquipmentPassportFull from '@/components/snrd/EquipmentPassportFull';
import BudgetForecastFull from '@/components/snrd/BudgetForecastFull';
import WorkshopOrderFull from '@/components/snrd/WorkshopOrderFull';
import InstallerDashboardFull from '@/components/snrd/InstallerDashboardFull';
import PriceListFull from '@/components/snrd/PriceListFull';
import DispatchMapFull from '@/components/snrd/DispatchMapFull';
import WarrantyClaimsFull from '@/components/snrd/WarrantyClaimsFull';
import AccountingIntegrationFull from '@/components/snrd/AccountingIntegrationFull';
import CustomerSatisfactionFull from '@/components/snrd/CustomerSatisfactionFull';
import WorkloadAnalysisFull from '@/components/snrd/WorkloadAnalysisFull';
import ContractorManagementFull from '@/components/snrd/ContractorManagementFull';
import ObjectsMapFull from '@/components/snrd/ObjectsMapFull';
import RevenueByClientFull from '@/components/snrd/RevenueByClientFull';
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
        return <FinancialSummary />;

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
        return <OfficeUsersFull />;

      case 'work-groups':
        return <WorkGroupsFull />;

      case 'survey-templates':
        return <SurveyModuleFull />;

      case 'survey-journal':
        return <SurveyJournal />;

      case 'crm':
        return <CRMFull />;

      case 'hr':
        return <HRFull />;

      case 'warehouse':
        return <WarehouseFull />;

      case 'roles':
        return <RolesConstructorFull />;

      case 'import':
        return <ImportDataFull />;

      case 'licensing':
        return <LicensingFull />;

      case 'integrations':
        return <IntegrationsFull />;

      case 'dispatch-board':
        return <DispatchBoardGantt />;

      case 'price-list':
        return <PriceListModule />;

      case 'ai-chat':
        return <AIAssistant />;

      case 'documents':
        return <DocumentLibrary />;

      case 'inbox':
        return <InboxFull />;

      case 'notifications':
        return <NotificationsFull />;

      case 'equipment':
        return <EquipmentFull />;

      case 'memberships':
        return <MembershipsFull />;

      case 'technician-scorecard':
        return <TechnicianScorecardFull />;

      case 'reliability-dashboard':
        return <ReliabilityDashboardFull />;

      case 'refrigerant-compliance':
        return <RefrigerantComplianceFull />;

      case 'cash-flow':
        return <CashFlow />;

      case 'warranty-tracking':
        return <WarrantyTrackingFull />;

      case 'workflow-builder':
        return <WorkflowBuilderNew />;

      case 'capacity-planning':
        return <CapacityPlanningFull />;

      case 'customer-health':
        return <CustomerHealth />;

      case 'lms':
        return <LMSFull />;

      case 'employee-onboarding':
        return <EmployeeOnboardingFull />;

      case 'completion-acts':
        return <CompletionActs />;

      case 'kpi-dashboard':
        return <KPIDashboardFull />;

      case 'sla-monitor':
        return <SLAMonitorFull />;

      case 'client-portal-settings':
        return <ClientPortalSettingsFull />;

      case 'stock-alerts':
        return <StockAlertsFull />;

      case 'audit-log':
        return <AuditLog />;

      case 'role-dashboard':
        return <RoleDashboardFull />;

      case 'analytics-dashboard':
        return <AnalyticsDashboardFull />;

      case 'cpq':
        return <CPQModule />;

      case 'system-settings':
        return <SystemSettings />;

      case 'iot-dashboard':
        return <IoTDashboardFull />;

      case 'maintenance-planner':
        return <MaintenancePlannerFull />;

      case 'field-map':
        return <FieldMapFull />;

      case 'notification-templates':
        return <NotificationTemplatesFull />;

      case 'service-object-card':
        return <ServiceObjectCard />;

      case 'lead-scoring':
        return <LeadScoringFull />;

      case 'work-order-detail':
        return <WorkOrderDetailFull />;

      case 'financial-planning':
        return <FinancialSummary />;

      case 'route-optimizer':
        return <RouteOptimizerFull />;

      case 'payroll':
        return <PayrollModule />;

      case 'purchase-orders':
        return <PurchaseOrders />;

      case 'competency-matrix':
        return <CompetencyMatrixFull />;

      case 'onboarding-progress':
        return <OnboardingProgressFull />;

      case 'smart-dispatch':
        return <SmartDispatchFull />;

      case 'client-feedback':
        return <ClientFeedbackFull />;

      case 'service-calendar':
        return <ServiceCalendarFull />;

      case 'report-builder':
        return <ReportBuilderFull />;

      case 'performance-dashboard':
        return <PerformanceDashboardFull />;

      case 'multi-channel-inbox':
        return <MultiChannelInboxFull />;

      case 'price-calculator':
        return <PriceCalculatorFull />;

      case 'document-editor':
        return <DocumentEditorFull />;

      case 'equipment-qr':
        return <EquipmentQRFull />;

      case 'task-manager':
        return <TaskManagerFull />;

      case 'sla-policy':
        return <SLAPolicyFull />;

      case 'stock-movement':
        return <StockMovementFull />;

      case 'contract-manager':
        return <ContractManagerFull />;

      case 'integration-logs':
        return <IntegrationLogsFull />;

      case 'mobile-app-settings':
        return <MobileAppSettingsFull />;

      case 'budget-planning':
        return <BudgetPlanningFull />;

      case 'quick-actions':
        return <QuickActionsFull />;

      case 'equipment-history':
        return <EquipmentHistoryFull />;

      case 'ai-analytics':
        return <AIAnalyticsFull />;

      case 'checklist-templates':
        return <ChecklistTemplates />;

      case 'geofence-zones':
        return <GeofenceZones />;

      case 'client-card':
        return <ClientCard />;

      case 'dispatch-board-full':
        return <DispatchBoardFull />;

      case 'sales-analytics':
        return <SalesAnalyticsFull />;

      case 'leads-funnel':
        return <LeadsFunnelFull />;

      case 'payroll-dashboard':
        return <PayrollDashboardFull />;

      case 'inventory-audit':
        return <InventoryAuditFull />;

      case 'gps-tracking':
        return <GPSTrackingFull />;

      case 'work-order-report':
        return <WorkOrderReportFull />;

      case 'supplier-management':
        return <SupplierManagementFull />;

      case 'client-card-360':
        return <ClientCard360Full />;

      case 'finance-dashboard':
        return <FinanceDashboardFull />;

      case 'stock-report':
        return <StockReportFull />;

      case 'dispatch-center':
        return <DispatchCenterFull />;

      case 'equipment-catalog':
        return <EquipmentCatalogFull />;

      case 'purchase-orders':
        return <PurchaseOrderFull />;

      case 'invoice-manager':
        return <InvoiceManagerFull />;

      case 'engineer-schedule':
        return <EngineerScheduleFull />;

      case 'knowledge-base':
        return <KnowledgeBaseFull />;

      case 'notification-center':
        return <NotificationCenterFull />;

      case 'ai-assistant':
        return <AIAssistantFull />;

      case 'system-settings':
        return <SystemSettingsFull />;

      case 'hr-dashboard':
        return <HRDashboardFull />;

      case 'clients-list':
        return <ClientsListFull />;

      case 'commercial-proposal':
        return <CommercialProposalFull />;

      case 'weather-widget':
        return <WeatherWidgetFull />;

      case 'refrigerant-log':
        return <RefrigerantLogFull />;

      case 'dashboard-manager':
        return <DashboardManagerFull />;

      case 'audit-log':
        return <AuditLogFull />;

      case 'sla-monitor':
        return <SLAMonitorFull />;

      case 'mobile-engineer':
        return <MobileEngineerFull />;

      case 'report-builder-v2':
        return <ReportBuilderV2Full />;

      case 'task-board':
        return <TaskBoardFull />;

      case 'client-portal':
        return <ClientPortalFull />;

      case 'email-templates':
        return <EmailTemplatesFull />;

      case 'capacity-planner':
        return <CapacityPlannerFull />;

      case 'service-zones':
        return <ServiceZonesFull />;

      case 'telegram-bot':
        return <TelegramBotFull />;

      case 'predictive-maintenance':
        return <PredictiveMaintenanceFull />;

      case 'fuel-management':
        return <FuelManagementFull />;

      case 'onec-integration':
        return <OneCIntegrationFull />;

      case 'quality-control':
        return <QualityControlFull />;

      case 'seasonal-planning':
        return <SeasonalPlanningFull />;

      case 'cost-analysis':
        return <CostAnalysisFull />;

      case 'digital-signature':
        return <DigitalSignatureFull />;

      case 'warehouse-map':
        return <WarehouseMapFull />;

      case 'avito-crm':
        return <AvitoCRMFull />;

      case 'marginality-report':
        return <MarginalityReportFull />;

      case 'document-flow':
        return <DocumentFlowFull />;

      case 'client-history':
        return <ClientHistoryFull />;

      case 'service-request':
        return <ServiceRequestFull />;

      case 'engineer-profile':
        return <EngineerProfileFull />;

      case 'equipment-passport':
        return <EquipmentPassportFull />;

      case 'budget-forecast':
        return <BudgetForecastFull />;

      case 'workshop-order':
        return <WorkshopOrderFull />;

      case 'installer-dashboard':
        return <InstallerDashboardFull />;

      case 'price-list':
        return <PriceListFull />;

      case 'dispatch-map':
        return <DispatchMapFull />;

      case 'warranty-claims':
        return <WarrantyClaimsFull />;

      case 'accounting-integration':
        return <AccountingIntegrationFull />;

      case 'customer-satisfaction':
        return <CustomerSatisfactionFull />;

      case 'workload-analysis':
        return <WorkloadAnalysisFull />;

      case 'contractor-management':
        return <ContractorManagementFull />;

      case 'objects-map':
        return <ObjectsMapFull />;

      case 'revenue-by-client':
        return <RevenueByClientFull />;

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