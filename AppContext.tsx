
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, Product, Sale, Supplier, Customer, Notification,
  Expense, Staff, Campaign, SocialMessage, ActivityLog,
  StockAdjustment, OnlineOrder, Quote, InstallmentPlan,
  AutomationRule, Branch, RoleConfig, TaxRecord, LedgerEntry,
  SafeTransaction, AdvancedInvoice, CreditNote, Shift,
  BOM, ProductionOrder, FixedAsset, Shipment, QCRecord,
  ImportRecord, Project, MaintenanceTask, LegalCase, AuditRecord,
  TraceRecord, TrainingCourse, Budget, FinancialForecast,
  BankAccount, StaffPerformance, DamagedItem, StaffDocument,
  WorkCenter, VendorPerformance, Vehicle, WholesaleOrder,
  Contact, FieldAgent, BuyRequest, Bid, AutomationLog, SocialAccount,
  PurchaseInvoice, Voucher, Promotion, Ticket, Coupon, Category
} from './types';
import { GoogleGenAI } from "@google/genai";
import { TRANSLATIONS } from './constants';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface Contract {
  id: string;
  serviceName: string;
  customerName: string;
  value: number;
  paymentCycle: 'yearly' | 'monthly';
  status: 'active' | 'expired' | 'terminated';
  endDate: string;
}

interface AppContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  lang: 'en' | 'ar';
  setLang: (l: 'en' | 'ar') => void;
  isOnline: boolean;
  t: (key: string) => string;
  
  // UI States
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  toasts: ToastMessage[];
  addToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  
  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Products & Inventory
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  addProduct: (p: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  stockAdjustments: StockAdjustment[];
  addStockAdjustment: (adj: StockAdjustment) => void;
  transferStock: (productId: string, fromBranch: string, toBranch: string, qty: number) => void; 
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  
  // Sales & CRM
  sales: Sale[];
  addSale: (s: Sale) => void;
  suspendedSales: Sale[];
  setSuspendedSales: (s: Sale[]) => void;
  offlineSales: Sale[];
  setOfflineSales: (s: Sale[]) => void;
  customers: Customer[];
  addCustomer: (c: Customer) => void;
  onlineOrders: OnlineOrder[];
  updateOnlineOrderStatus: (id: string, status: string) => void;
  quotes: Quote[];
  convertQuoteToSale: (id: string) => void;
  installmentPlans: InstallmentPlan[];
  payInstallment: (planId: string, instId: string) => void;
  
  // Suppliers & Purchases
  suppliers: Supplier[];
  addSupplier: (s: Supplier) => void;
  purchases: PurchaseInvoice[];
  addPurchase: (p: PurchaseInvoice) => void;
  buyRequests: BuyRequest[];
  setBuyRequests: (r: BuyRequest[]) => void;
  bids: Bid[];
  setBids: (b: Bid[]) => void;
  acceptBid: (id: string) => void;
  wholesaleOrders: WholesaleOrder[];
  addWholesaleOrder: (o: WholesaleOrder) => void;
  approveWholesale: (id: string) => void;
  
  // Finance
  expenses: Expense[];
  addExpense: (e: any) => void;
  taxRecords: TaxRecord[];
  ledger: LedgerEntry[];
  safeBalance: { cash: number; card: number };
  safeTransactions: SafeTransaction[];
  advancedInvoices: AdvancedInvoice[];
  addAdvancedInvoice: (inv: AdvancedInvoice) => void;
  creditNotes: CreditNote[];
  issueCreditNote: (id: string, amount: number, reason: string) => void;
  budgets: Budget[];
  addBudget: (b: Budget) => void;
  financialForecasts: FinancialForecast[];
  bankAccounts: BankAccount[];
  vouchers: Voucher[];
  addVoucher: (v: Voucher) => void;
  calculateProjectedPnL: () => any;
  
  // Operations & HR
  staff: Staff[];
  addStaff: (s: Staff) => void;
  shifts: Shift[];
  openShift: (amount: number) => void;
  closeShift: (id: string, amount: number, note: string) => void;
  staffPerformance: StaffPerformance[];
  updateStaffPerformance: (perf: StaffPerformance) => void;
  staffDocuments: StaffDocument[];
  addStaffDocument: (d: StaffDocument) => void;
  trainingCourses: TrainingCourse[];
  addTrainingCourse: (c: TrainingCourse) => void;
  updateTrainingCourse: (id: string, updates: Partial<TrainingCourse>) => void;
  
  // Logistics & Assets
  branches: Branch[];
  addBranch: (b: any) => void;
  activeBranchId: string;
  setActiveBranchId: (id: string) => void;
  fleet: Vehicle[];
  addVehicle: (v: Vehicle) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  fieldAgents: FieldAgent[];
  shipments: Shipment[];
  addShipment: (s: Shipment) => void;
  updateShipmentStatus: (id: string, status: string) => void;
  fixedAssets: FixedAsset[];
  addAsset: (a: FixedAsset) => void;
  updateAsset: (id: string, updates: Partial<FixedAsset>) => void;
  
  // Manufacturing & Projects
  boms: BOM[];
  addBOM: (b: BOM) => void;
  productionOrders: ProductionOrder[];
  startProduction: (bomId: string, qty: number) => void;
  completeProduction: (orderId: string) => void;
  workCenters: WorkCenter[];
  addWorkCenter: (w: WorkCenter) => void;
  updateWorkCenter: (id: string, updates: Partial<WorkCenter>) => void;
  projects: Project[];
  addProject: (p: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  maintenanceTasks: MaintenanceTask[];
  addMaintenanceTask: (t: MaintenanceTask) => void;
  qcRecords: QCRecord[];
  addQCRecord: (r: QCRecord) => void;
  
  // Compliance & Import
  legalCases: LegalCase[];
  addLegalCase: (l: LegalCase) => void;
  updateLegalCase: (id: string, updates: Partial<LegalCase>) => void;
  audits: AuditRecord[];
  imports: ImportRecord[];
  addImportRecord: (i: ImportRecord) => void;
  updateImportRecord: (id: string, updates: Partial<ImportRecord>) => void;
  clearImport: (id: string, items: {productId: string, quantity: number}[]) => void;
  traces: TraceRecord[];
  addTraceRecord: (t: TraceRecord) => void;
  
  // Marketing & Social
  campaigns: Campaign[];
  addCampaign: (c: Campaign) => void;
  promotions: Promotion[];
  addPromotion: (p: Promotion) => void;
  socialAccounts: SocialAccount[];
  updateSocialAccount: (acc: SocialAccount) => void;
  socialInbox: SocialMessage[];
  addSocialMessage: (m: any) => void;
  messages: any[];
  addMessage: (text: string, receiverId: string) => void;
  contacts: Contact[];
  generateMarketingMedia: (prompt: string) => Promise<{text: string, image?: string}>;
  syncCatalog: (platform: string) => Promise<void>;
  
  // Automation & System
  automationRules: AutomationRule[];
  setAutomationRules: React.Dispatch<React.SetStateAction<AutomationRule[]>>;
  automationLogs: AutomationLog[];
  activityLogs: ActivityLog[];
  addLog: (action: string, type?: string, module?: string) => void;
  notifications: Notification[];
  roleConfigs: RoleConfig[];
  updateRoleConfig: (config: RoleConfig) => void;
  canUser: (module: string, action: string) => boolean;
  askOracle: (query: string) => Promise<string>;
  generateAIContent: (prompt: string, type: 'text' | 'analysis') => Promise<string>;
  syncOfflineData: () => void;
  resetSystem: () => void;
  
  // Support & Ecommerce
  tickets: Ticket[];
  addTicket: (t: Ticket) => void;
  coupons: Coupon[];
  addCoupon: (c: Coupon) => void;

  // Misc
  damages: DamagedItem[];
  addDamage: (d: DamagedItem) => void;
  vendorPerformance: VendorPerformance[];
  updateVendorPerformance: (vp: VendorPerformance) => void;
  contracts: Contract[];
  addContract: (c: Contract) => void; 
  updateContract: (id: string, updates: Partial<Contract>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Persistence Helper
const usePersistedState = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(error);
    }
  }, [key, state]);

  return [state, setState];
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = usePersistedState<User | null>('titan_user', null);
  const [lang, setLang] = useState<'en' | 'ar'>('ar');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeBranchId, setActiveBranchId] = useState('B-MAIN');
  const [showNotifications, setShowNotifications] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Initial Data Configs
  const initialProducts: Product[] = [
    { 
        id: '1', 
        name: 'iPhone 15 Pro', 
        name_ar: 'آيفون 15 برو', 
        price: 4500, 
        cost: 4000, 
        stock: 12, 
        minStock: 5, 
        category: 'Electronics', 
        categoryId: 'cat-1', 
        subCategory: 'Smartphones', 
        subCategoryId: 'sub-1-1',
        sku: 'IPH-15', 
        isOnline: true, 
        barcode: '123456', 
        image: 'https://placehold.co/150', 
        branchStocks: { 'B-MAIN': 10, 'B-2': 2 },
        majorUnit: 'كرتون',
        minorUnit: 'حبة',
        unitContent: 10,
        majorUnitPrice: 44000,
        wholesalePrice: 43000,
        isReturnable: true,
        expiryTracking: false
    },
    { 
        id: '2', 
        name: 'MacBook Air', 
        name_ar: 'ماك بوك اير', 
        price: 5200, 
        cost: 4800, 
        stock: 3, 
        minStock: 5, 
        category: 'Electronics', 
        categoryId: 'cat-1', 
        subCategory: 'Laptops',
        subCategoryId: 'sub-1-2',
        sku: 'MAC-AIR', 
        isOnline: true, 
        barcode: '789012', 
        image: 'https://placehold.co/150', 
        branchStocks: { 'B-MAIN': 3 },
        majorUnit: 'كرتون',
        minorUnit: 'حبة',
        unitContent: 5,
        majorUnitPrice: 25500,
        wholesalePrice: 5000,
        isReturnable: true,
        expiryTracking: false
    },
  ];
  
  // Core Data States (Persisted)
  const [products, setProducts] = usePersistedState<Product[]>('titan_products', initialProducts);
  const [sales, setSales] = usePersistedState<Sale[]>('titan_sales', []);
  const [offlineSales, setOfflineSales] = usePersistedState<Sale[]>('titan_offline_sales', []);
  const [customers, setCustomers] = usePersistedState<Customer[]>('titan_customers', [{ id: '1', name: 'أحمد محمد', phone: '0501234567', email: 'ahmed@test.com', points: 150, segment: 'VIP', balance: 0, creditLimit: 5000, creditScore: 85 }]);
  const [suppliers, setSuppliers] = usePersistedState<Supplier[]>('titan_suppliers', [{ id: 'sup-1', name: 'Tech Distributor', name_ar: 'الموزع التقني', phone: '05000000', email: 'sup@test.com', balance: -5000, rating: 4.8 }]);
  const [branches, setBranches] = usePersistedState<Branch[]>('titan_branches', [{ id: 'B-MAIN', name: 'Main Branch', name_ar: 'الفرع الرئيسي', location: 'Riyadh', phone: '0112223333', isMain: true }, { id: 'B-2', name: 'Jeddah Branch', name_ar: 'فرع جدة', location: 'Jeddah', phone: '0122223333' }]);
  const [purchases, setPurchases] = usePersistedState<PurchaseInvoice[]>('titan_purchases', []);
  const [expenses, setExpenses] = usePersistedState<Expense[]>('titan_expenses', []);
  const [messages, setMessages] = usePersistedState<any[]>('titan_messages', []);
  const [categories, setCategories] = usePersistedState<Category[]>('titan_categories', [
      { 
          id: 'cat-1', 
          name: 'Electronics', 
          name_ar: 'إلكترونيات', 
          subCategories: [
              { id: 'sub-1-1', name: 'Smartphones', name_ar: 'هواتف ذكية' },
              { id: 'sub-1-2', name: 'Laptops', name_ar: 'لابتوبات' },
              { id: 'sub-1-3', name: 'Accessories', name_ar: 'اكسسوارات' }
          ] 
      },
      { 
          id: 'cat-2', 
          name: 'Clothing', 
          name_ar: 'ملابس', 
          subCategories: [
              { id: 'sub-2-1', name: 'Men', name_ar: 'رجالي' },
              { id: 'sub-2-2', name: 'Women', name_ar: 'نسائي' }
          ] 
      }
  ]);

  // Finance States Persisted
  const [safeBalance, setSafeBalance] = usePersistedState<{ cash: number; card: number }>('titan_safe', { cash: 15400, card: 42000 });
  const [safeTransactions, setSafeTransactions] = usePersistedState<SafeTransaction[]>('titan_safe_trx', []);
  const [ledger, setLedger] = usePersistedState<LedgerEntry[]>('titan_ledger', [{ id: 'L-1', date: new Date().toISOString(), description: 'Opening Balance', category: 'Capital', type: 'credit', amount: 100000 }]);
  const [vouchers, setVouchers] = usePersistedState<Voucher[]>('titan_vouchers', []);
  
  // Advanced Modules Persistence
  const [staff, setStaff] = usePersistedState<Staff[]>('titan_staff', [{ id: '1', name: 'سارة خالد', role: 'Sales Manager', salary: 5000, joinDate: '2023-01-01', status: 'active', attendance: [] }]);
  const [boms, setBoms] = usePersistedState<BOM[]>('titan_boms', [{ id: 'BOM-1', finalProductId: '1', components: [{ productId: '2', quantity: 1 }] }]);
  const [productionOrders, setProductionOrders] = usePersistedState<ProductionOrder[]>('titan_production', [{ id: 'PO-1', bomId: 'BOM-1', quantity: 10, status: 'in_progress', startDate: new Date().toISOString() }]);
  const [projects, setProjects] = usePersistedState<Project[]>('titan_projects', [{ id: 'PRJ-1', name: 'New Branch Opening', customerId: 'Internal', budget: 200000, spent: 45000, status: 'active', endDate: '2025-06-30' }]);
  const [fleet, setFleet] = usePersistedState<Vehicle[]>('titan_fleet', [{ id: 'V-1', type: 'van', model: 'Toyota Hiace', plateNumber: 'ABC-1234', fuelLevel: 85, status: 'available', lastService: '2025-01-15' }]);
  const [fixedAssets, setFixedAssets] = usePersistedState<FixedAsset[]>('titan_assets', [{ id: 'AST-1', name: 'Delivery Van', category: 'Vehicles', purchaseValue: 80000, currentValue: 72000, status: 'active' }]);
  const [maintenanceTasks, setMaintenanceTasks] = usePersistedState<MaintenanceTask[]>('titan_maintenance', [{ id: 'MT-1', assetName: 'AC Unit 4', taskType: 'Repair', priority: 'medium', assignedEngineer: 'Ali', scheduledDate: '2025-02-20' }]);
  const [legalCases, setLegalCases] = usePersistedState<LegalCase[]>('titan_legal', [{ id: 'LC-1', title: 'Supplier Dispute', type: 'Civil', status: 'hearing', description: 'Late delivery penalty dispute', involvedParties: 'Tech Distributor', nextStep: 'Hearing on 15th' }]);
  const [trainingCourses, setTrainingCourses] = usePersistedState<TrainingCourse[]>('titan_training', [{ id: 'TRN-1', title: 'Advanced Sales', category: 'Sales', duration: '2 Weeks', status: 'active', attendees: ['1'] }]);
  const [imports, setImports] = usePersistedState<ImportRecord[]>('titan_imports', [{ id: 'IMP-1', vesselName: 'Titan Star', containerNumber: 'CN-9922', originPort: 'Shanghai', destinationPort: 'Dammam', eta: '2025-03-15', totalValue: 50000, customsDuty: 2500 }]);
  const [qcRecords, setQcRecords] = usePersistedState<QCRecord[]>('titan_qc', [{ id: 'QC-1', orderId: 'PO-1', status: 'passed', notes: 'All good', date: new Date().toISOString() }]);
  const [wholesaleOrders, setWholesaleOrders] = usePersistedState<WholesaleOrder[]>('titan_wholesale', [{ id: 'WS-1', customerName: 'Mega Store', total: 150000, creditTerm: 'Net 30', status: 'pending_approval', requestedAt: new Date().toISOString() }]);
  const [workCenters, setWorkCenters] = usePersistedState<WorkCenter[]>('titan_workcenters', [{ id: 'WC-1', name: 'Assembly Line A', status: 'operational', efficiency: 94, lastMaintenance: '2025-02-01' }]);
  const [budgets, setBudgets] = usePersistedState<Budget[]>('titan_budgets', [{ id: 'BDG-1', name: 'Marketing Q1', allocated: 50000, spent: 12000, variance: 0, status: 'within_budget' }]);
  const [shipments, setShipments] = usePersistedState<Shipment[]>('titan_shipments', [{ id: 'SHP-1', trackingNumber: 'TRK-9988', orderId: 'ORD-101', origin: 'Riyadh', destination: 'Jeddah', carrier: 'Titan Logistics', weight: 5, status: 'in_transit' }]);
  const [promotions, setPromotions] = usePersistedState<Promotion[]>('titan_promotions', [
    { id: 'PR-1', title: 'Summer Sale 2025', type: 'Percentage', value: '20%', reach: 1200, status: 'active' },
    { id: 'PR-2', title: 'Buy 1 Get 1', type: 'BOGO', value: '1+1', reach: 450, status: 'active' }
  ]);
  const [installmentPlans, setInstallmentPlans] = usePersistedState<InstallmentPlan[]>('titan_installments', []);
  const [contracts, setContracts] = usePersistedState<Contract[]>('titan_contracts', [{ id: 'CNT-1', serviceName: 'Annual Maintenance', customerName: 'Gov Client', value: 120000, paymentCycle: 'yearly', status: 'active', endDate: '2026-01-01' }]);
  const [staffDocuments, setStaffDocuments] = usePersistedState<StaffDocument[]>('titan_staff_docs', [{ id: 'DOC-1', staffId: '1', title: 'Employment Contract', type: 'contract', expiryDate: '2026-01-01' }]);
  const [traces, setTraces] = usePersistedState<TraceRecord[]>('titan_traces', [{ id: 'TRC-1', productName: 'iPhone 15 Pro', expiryDate: 'N/A', journey: [{ step: 'Manufactured', date: '2024-12-01', details: 'Foxconn' }, { step: 'Shipped', date: '2025-01-10', details: 'Shanghai Port' }] }]);
  const [damages, setDamages] = usePersistedState<DamagedItem[]>('titan_damages', []);
  const [vendorPerformance, setVendorPerformance] = usePersistedState<VendorPerformance[]>('titan_vendor_perf', [{ vendorId: 'sup-1', deliverySpeed: 95, qualityScore: 98, pricingIndex: 90, totalOrders: 50 }]);
  const [staffPerformance, setStaffPerformance] = usePersistedState<StaffPerformance[]>('titan_staff_perf', [{ staffId: '1', kpiScore: 95, achievedSales: 45000, salesTarget: 40000, attendanceRate: 98, tasksCompleted: 42 }]);

  const [tickets, setTickets] = usePersistedState<Ticket[]>('titan_tickets', [
    { id: 'T-1024', subject: 'مشكلة في طباعة الفاتورة', status: 'open', date: '2025-02-10', priority: 'high', description: 'الطابعة لا تستجيب' },
    { id: 'T-1023', subject: 'استفسار عن الربط مع ZATCA', status: 'closed', date: '2025-02-08', priority: 'medium', description: 'كيف افعل الفوترة؟' }
  ]);
  const [coupons, setCoupons] = usePersistedState<Coupon[]>('titan_coupons', [
    { id: '1', code: 'TITAN-BLACK', type: 'نسبة مئوية', value: '25%', uses: 1245, status: 'active' }
  ]);
  const [roleConfigs, setRoleConfigs] = usePersistedState<RoleConfig[]>('titan_roles', [
      { role: 'cashier', permissions: [{ module: 'pos', read: true, write: true, delete: false }] },
      { role: 'manager', permissions: [{ module: 'pos', read: true, write: true, delete: true }, { module: 'inventory', read: true, write: true, delete: true }] }
  ]);

  const [suspendedSales, setSuspendedSales] = useState<Sale[]>([]);
  const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>([
      { 
          id: 'ORD-101', 
          customerName: 'Khalid', 
          date: new Date().toISOString(), 
          total: 4500, 
          status: 'pending', 
          shippingAddress: 'Riyadh, Olaya Dist.',
          items: [
              { productId: '1', name: 'iPhone 15 Pro', quantity: 1, price: 4500, total: 4500, discountPercent: 0, taxPercent: 0 }
          ]
      }
  ]);
  
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>([]);
  const [buyRequests, setBuyRequests] = useState<BuyRequest[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>([
    { id: 'TAX-1', invoiceId: 'INV-1001', type: 'output', taxableAmount: 4000, taxAmount: 600 }
  ]);
  const [advancedInvoices, setAdvancedInvoices] = useState<AdvancedInvoice[]>([{ id: 'INV-A1', source: 'Service', date: new Date().toISOString(), total: 1200, tax: 180, paidAmount: 1200, status: 'paid' }]);
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [financialForecasts] = useState<FinancialForecast[]>([{ month: 'Next Month', predictedRevenue: 180000, confidenceScore: 92, trend: 'up' }]);
  const [bankAccounts] = useState<BankAccount[]>([{ id: 'BNK-1', bankName: 'AlRajhi Bank', accountNumber: 'SA290000...', balance: 250000, currency: 'SAR' }]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [fieldAgents, setFieldAgents] = useState<FieldAgent[]>([{ id: 'AG-1', name: 'Omar', phone: '0551234567', status: 'online', currentVault: 1500, deliveriesCompleted: 12 }]);
  const [audits] = useState<AuditRecord[]>([{ id: 'AUD-1', title: 'Q1 Financial Audit', score: 98, date: '2025-01-10', auditor: 'Internal' }]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([{ platform: 'whatsapp', status: 'connected', lastSync: 'Today', settings: { syncCatalog: true } }]);
  const [socialInbox, setSocialInbox] = useState<SocialMessage[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([{ id: '1', name: 'Support', role: 'System' }]);
  const [automationRules, setAutomationRules] = usePersistedState<AutomationRule[]>('titan_automation', [{ id: 'R-1', name: 'Low Stock Alert', event: 'low_stock', isActive: true, actions: [{ type: 'notify', target: 'manager' }], executionCount: 15 }]);
  const [automationLogs] = useState<AutomationLog[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([{id: 'log-0', user: 'System', action: 'System Initialized', module: 'Core', type: 'info', timestamp: new Date().toISOString()}]);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 'n1', title: 'System Backup', message: 'Daily backup completed successfully', type: 'success', timestamp: new Date().toISOString(), read: true }
  ]);

  useEffect(() => {
    const handleOnline = () => {
        setIsOnline(true);
        addToast('اتصال الإنترنت عاد. يمكنك المزامنة الآن.', 'success');
    };
    const handleOffline = () => {
        setIsOnline(false);
        addToast('أنت الآن في وضع عدم الاتصال (Offline Mode).', 'warning');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addLog = (action: string, type: string = 'info', module: string = 'System') => {
    const log: ActivityLog = { id: Date.now().toString(), user: user?.name || 'System', action, module, type: type as any, timestamp: new Date().toISOString() };
    setActivityLogs(prev => [log, ...prev].slice(0, 50));
    if (type === 'success' || type === 'error') {
       addToast(action, type as any);
    }
  };

  const addSale = (s: Sale) => { 
    setSales([s, ...sales]); 
    
    // Deduct Inventory Logic & Check Low Stock
    const newProducts = [...products];
    const lowStockAlerts: string[] = [];

    s.items.forEach(item => {
      const prodIndex = newProducts.findIndex(p => p.id === item.productId);
      if (prodIndex > -1) {
        const prod = newProducts[prodIndex];
        const deduction = item.unit === prod.majorUnit ? (prod.unitContent || 1) * item.quantity : item.quantity;
        
        prod.stock -= deduction;
        if (prod.branchStocks && prod.branchStocks[activeBranchId]) {
            prod.branchStocks[activeBranchId] -= deduction;
        }

        // Reactive Check: Low Stock
        if (prod.stock <= prod.minStock) {
            lowStockAlerts.push(prod.name_ar);
        }
      }
    });
    setProducts(newProducts);

    // Update Financials
    const tx: SafeTransaction = { 
        id: `TX-${Date.now()}`, 
        type: 'in', 
        description: `Sale ${s.id.slice(-6)}`, 
        date: new Date().toISOString(), 
        paymentMethod: s.paymentMethod === 'card' ? 'card' : 'cash', 
        amount: s.total 
    };
    setSafeTransactions([tx, ...safeTransactions]);
    setSafeBalance(prev => ({
        cash: s.paymentMethod === 'cash' ? prev.cash + s.total : prev.cash,
        card: s.paymentMethod === 'card' ? prev.card + s.total : prev.card
    }));

    // Reactive Notifications
    if (lowStockAlerts.length > 0) {
        const notif: Notification = {
            id: `NTF-STOCK-${Date.now()}`,
            title: 'تنبيه مخزون حرج 📉',
            message: `وصلت الأصناف التالية لحد الطلب: ${lowStockAlerts.join(', ')}`,
            type: 'warning',
            timestamp: new Date().toISOString(),
            read: false
        };
        setNotifications(prev => [notif, ...prev]);
        addToast(`تنبيه: مخزون ${lowStockAlerts.length} أصناف منخفض!`, 'warning');
    }

    if (s.total > 5000) {
        const notif: Notification = {
            id: `NTF-HIGH-${Date.now()}`,
            title: 'صفقة كبيرة 🌟',
            message: `تم تسجيل مبيعات بقيمة $${s.total.toLocaleString()}!`,
            type: 'success',
            timestamp: new Date().toISOString(),
            read: false
        };
        setNotifications(prev => [notif, ...prev]);
    }

    // Update Customer (if exists)
    if (s.customerId) {
        setCustomers(prev => prev.map(c => {
            if (c.id === s.customerId) {
                return {
                    ...c,
                    balance: s.paymentMethod === 'credit' ? c.balance + s.total : c.balance,
                    points: c.points + Math.floor(s.total),
                    totalSpent: (c.totalSpent || 0) + s.total,
                    lastPurchase: new Date().toISOString()
                };
            }
            return c;
        }));
        if(s.paymentMethod === 'credit') {
            setInstallmentPlans([...installmentPlans, {
                id: `PLN-${Date.now()}`,
                customerId: s.customerId,
                totalAmount: s.total,
                remainingAmount: s.total,
                frequency: 'Monthly',
                installments: [{ id: `INS-${Date.now()}`, amount: s.total, dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString(), status: 'pending' }]
            }]);
        }
    }

    addLog(`New sale completed: $${s.total}`, 'success', 'POS'); 
  };

  const resetSystem = () => {
    window.localStorage.clear();
    setProducts(initialProducts);
    setSales([]);
    setCustomers([{ id: '1', name: 'أحمد محمد', phone: '0501234567', email: 'ahmed@test.com', points: 150, segment: 'VIP', balance: 0, creditLimit: 5000, creditScore: 85 }]);
    setSuppliers([{ id: 'sup-1', name: 'Tech Distributor', name_ar: 'الموزع التقني', phone: '05000000', email: 'sup@test.com', balance: -5000, rating: 4.8 }]);
    setPurchases([]);
    setExpenses([]);
    setSafeBalance({ cash: 15400, card: 42000 });
    setSafeTransactions([]);
    setLedger([]);
    addToast('تم إعادة تعيين النظام بنجاح', 'success');
    window.location.reload();
  };

  const updateProduct = (id: string, updates: Partial<Product>) => 
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    addLog(`Product deleted: ${id}`, 'warning', 'Inventory');
  };

  const transferStock = (productId: string, fromBranch: string, toBranch: string, qty: number) => {
    setProducts(prev => prev.map(p => {
        if (p.id === productId) {
            const currentStocks = p.branchStocks || {};
            if(fromBranch === 'B-MAIN' && !currentStocks['B-MAIN']) currentStocks['B-MAIN'] = p.stock;
            
            const source = currentStocks[fromBranch] || 0;
            if (source >= qty) {
                const newStocks = { ...currentStocks };
                newStocks[fromBranch] = source - qty;
                newStocks[toBranch] = (newStocks[toBranch] || 0) + qty;
                return { ...p, branchStocks: newStocks };
            } else {
                addToast(`Insufficient stock in ${fromBranch}`, 'error');
            }
        }
        return p;
    }));
    addLog(`Stock Transferred: ${qty} units of ${productId} from ${fromBranch} to ${toBranch}`, 'info', 'Inventory');
  };

  const issueCreditNote = (id: string, amount: number, reason: string) => { 
      setCreditNotes([...creditNotes, { id: `CN-${Date.now()}`, originalInvoiceId: id, amount, reason, status: 'issued' }]); 
      setSafeBalance(prev => ({ ...prev, cash: prev.cash - amount }));
      setSafeTransactions(prev => [{ id: `REF-${Date.now()}`, type: 'out', description: `Refund: ${reason}`, date: new Date().toISOString(), paymentMethod: 'cash', amount: amount }, ...prev]);
      addLog(`Credit note issued: $${amount}`, 'warning', 'Finance'); 
  };

  const addPurchase = (p: PurchaseInvoice) => { 
    setPurchases([p, ...purchases]); 
    const newProducts = [...products];
    p.items.forEach(item => {
      const prodIndex = newProducts.findIndex(pr => pr.id === item.productId);
      if (prodIndex > -1) {
        const prod = newProducts[prodIndex];
        const addition = item.unit === prod.majorUnit ? (prod.unitContent || 1) * item.quantity : item.quantity;
        prod.stock += addition;
        
        if(item.unit === prod.minorUnit || !item.unit) {
            prod.cost = item.price; 
        } else if (item.unit === prod.majorUnit && prod.unitContent) {
            prod.cost = item.price / prod.unitContent;
        }
      }
    });
    setProducts(newProducts);

    if (p.paymentMethod === 'credit') {
        setSuppliers(prev => prev.map(s => s.id === p.supplierId ? { ...s, balance: s.balance + p.total } : s));
    } else {
        setSafeBalance(prev => ({ ...prev, cash: prev.cash - p.paidAmount }));
        setSafeTransactions(prev => [{ id: `TX-OUT-${Date.now()}`, type: 'out', description: `Purchase ${p.id}`, date: new Date().toISOString(), paymentMethod: 'cash', amount: p.paidAmount }, ...prev]);
    }
    addLog(`Purchase invoice recorded: ${p.total}`, 'info', 'Purchasing'); 
  };

  const addExpense = (e: any) => { 
    setExpenses([...expenses, { ...e, id: Date.now().toString(), date: new Date().toISOString() }]); 
    if (e.type !== 'credit') {
      setSafeBalance(prev => ({ ...prev, cash: prev.cash - e.amount }));
      setSafeTransactions(prev => [{ id: `EXP-${Date.now()}`, type: 'out', description: `Expense: ${e.category}`, date: new Date().toISOString(), paymentMethod: 'cash', amount: e.amount }, ...prev]);
    }
    addLog(`Expense recorded: ${e.amount}`, 'warning', 'Finance'); 
  };

  const payInstallment = (planId: string, instId: string) => {
    setInstallmentPlans(prev => prev.map(plan => {
        if(plan.id === planId) {
            const inst = plan.installments.find(i => i.id === instId);
            if(inst && inst.status !== 'paid') {
                setCustomers(currCust => currCust.map(c => c.id === plan.customerId ? { ...c, balance: c.balance - inst.amount } : c));
                setSafeBalance(sb => ({ ...sb, cash: sb.cash + inst.amount }));
                setSafeTransactions(st => [{ id: `PAY-${instId}`, type: 'in', description: `Installment Pay`, date: new Date().toISOString(), paymentMethod: 'cash', amount: inst.amount }, ...st]);
                
                return {
                    ...plan,
                    remainingAmount: plan.remainingAmount - inst.amount,
                    installments: plan.installments.map(i => i.id === instId ? { ...i, status: 'paid' as const } : i)
                };
            }
        }
        return plan;
    }));
    addLog('Installment payment collected', 'success', 'Finance');
  };

  const startProduction = (bomId: string, q: number) => {
    const bom = boms.find(b => b.id === bomId);
    if(bom) {
        const newProducts = [...products];
        let possible = true;
        bom.components.forEach(comp => {
            const pIndex = newProducts.findIndex(p => p.id === comp.productId);
            if(pIndex === -1 || newProducts[pIndex].stock < (comp.quantity * q)) possible = false;
        });

        if(possible) {
            bom.components.forEach(comp => {
                const pIndex = newProducts.findIndex(p => p.id === comp.productId);
                if(pIndex > -1) newProducts[pIndex].stock -= (comp.quantity * q);
            });
            setProducts(newProducts);
            setProductionOrders([...productionOrders, { id: `PO-${Date.now()}`, bomId: bomId, quantity: q, status: 'in_progress', startDate: new Date().toISOString() }]);
            addLog(`Production started for ${q} units`, 'info', 'Manufacturing');
        } else {
            addToast("Insufficient raw materials!", 'error');
        }
    }
  };

  const completeProduction = (id: string) => {
    setProductionOrders(prev => prev.map(o => {
        if(o.id === id && o.status !== 'completed') {
            const bom = boms.find(b => b.id === o.bomId);
            if(bom) {
                setProducts(currProds => currProds.map(p => p.id === bom.finalProductId ? { ...p, stock: p.stock + o.quantity } : p));
            }
            return { ...o, status: 'completed' as const };
        }
        return o;
    }));
    addLog('Production order completed', 'success', 'Manufacturing');
  };

  const convertQuoteToSale = (id: string) => { 
      const quote = quotes.find(q => q.id === id);
      if(quote) {
          const sale: Sale = {
              id: `INV-Q-${Date.now()}`,
              date: new Date().toISOString(),
              items: quote.items,
              total: quote.total,
              subtotal: quote.total,
              tax: 0, 
              discount: 0,
              paymentMethod: 'cash',
              payments: { cash: quote.total, card: 0, transfer: 0, credit: 0 },
              branchId: activeBranchId,
              status: 'completed',
              customerName: quote.customerName,
              source: 'pos'
          };
          addSale(sale);
          setQuotes(prev => prev.map(q => q.id === id ? { ...q, status: 'converted' } : q));
      }
  };

  const addStockAdjustment = (adj: StockAdjustment) => { setStockAdjustments([adj, ...stockAdjustments]); addLog('Stock adjustment'); };
  const addSupplier = (s: Supplier) => { setSuppliers([...suppliers, s]); addLog(`Supplier registered: ${s.name}`, 'success', 'VendorIntel'); };
  const addCustomer = (c: Customer) => { setCustomers([...customers, c]); addLog(`Customer registered: ${c.name}`, 'success', 'CRM'); };
  const addBranch = (b: any) => { setBranches([...branches, { ...b, id: Date.now().toString() }]); addLog('New branch'); };
  
  const updateOnlineOrderStatus = (id: string, status: string) => {
      setOnlineOrders(prev => {
          const order = prev.find(o => o.id === id);
          if (!order) return prev;

          if (status === 'processing' && order.status !== 'processing' && order.status !== 'shipped') {
              let sufficientStock = true;
              const newProducts = [...products];

              for (const item of order.items) {
                  const prod = newProducts.find(p => p.id === item.productId);
                  if (!prod || prod.stock < item.quantity) {
                      sufficientStock = false;
                      addToast(`Insufficient stock for ${item.name}! Cannot process order.`, 'error');
                      break;
                  }
              }

              if (sufficientStock) {
                  order.items.forEach(item => {
                      const prodIndex = newProducts.findIndex(p => p.id === item.productId);
                      if (prodIndex > -1) {
                          newProducts[prodIndex].stock -= item.quantity;
                          if (newProducts[prodIndex].branchStocks && newProducts[prodIndex].branchStocks![activeBranchId]) {
                              newProducts[prodIndex].branchStocks![activeBranchId] -= item.quantity;
                          }
                      }
                  });
                  setProducts(newProducts);
                  addLog(`Stock deducted for Online Order #${id}`, 'success', 'Ecommerce');
              } else {
                  return prev; 
              }
          }
          
          if (status === 'shipped' && order.status !== 'shipped') {
              const shipment: Shipment = {
                  id: `SHP-AUTO-${Date.now()}`,
                  trackingNumber: `TRK-${Math.floor(Math.random() * 90000) + 10000}`,
                  orderId: order.id,
                  origin: 'Central Warehouse',
                  destination: order.shippingAddress || 'Customer Address',
                  carrier: 'Titan Express',
                  weight: 2.5,
                  status: 'in_transit'
              };
              addShipment(shipment);
              addLog(`Shipment generated automatically for Order #${id}`, 'success', 'Logistics');
          }

          if (status === 'delivered' && order.status !== 'delivered') {
              setSafeBalance(curr => ({ ...curr, card: curr.card + order.total }));
              addLog(`Revenue recognized for Order #${id}: $${order.total}`, 'success', 'Finance');
          }

          return prev.map(o => o.id === id ? { ...o, status: status as any } : o);
      });
  };

  const acceptBid = (id: string) => { setBids(prev => prev.map(b => b.id === id ? { ...b, status: 'accepted' } : b)); addLog('Bid accepted'); };
  
  const approveWholesale = (id: string) => { 
      setWholesaleOrders(prev => prev.map(o => {
          if (o.id === id && o.status === 'pending_approval') {
              const sale: Sale = {
                  id: `INV-WS-${Date.now()}`,
                  date: new Date().toISOString(),
                  items: [], 
                  total: o.total,
                  subtotal: o.total,
                  tax: 0, 
                  discount: 0,
                  paymentMethod: 'credit', 
                  payments: { cash: 0, card: 0, transfer: 0, credit: o.total },
                  branchId: activeBranchId,
                  status: 'pending',
                  customerName: o.customerName,
                  source: 'wholesale'
              };
              addSale(sale);
              return { ...o, status: 'approved' as const };
          }
          return o;
      })); 
      addLog('Wholesale approved & Invoiced', 'success', 'Wholesale'); 
  };

  const openShift = (amount: number) => { setShifts([...shifts, { id: `SH-${Date.now()}`, openedAt: new Date().toISOString(), user: user?.name || '', openingBalance: amount, status: 'open' }]); addLog('Shift opened'); };
  const closeShift = (id: string, amount: number, note: string) => { setShifts(prev => prev.map(s => s.id === id ? { ...s, status: 'closed', closedAt: new Date().toISOString(), closingBalance: amount } : s)); addLog('Shift closed'); };
  const addMessage = (text: string, receiverId: string) => { setMessages([...messages, { id: Date.now().toString(), text, receiverId, senderId: user?.id, timestamp: new Date().toISOString() }]); };
  const addSocialMessage = (m: any) => { setSocialInbox([...socialInbox, { ...m, id: Date.now().toString(), timestamp: new Date().toISOString() }]); };
  const addCampaign = (c: Campaign) => { setCampaigns([...campaigns, c]); addLog(`Marketing Campaign Launched: ${c.title || 'New Campaign'}`, 'success', 'Marketing'); };
  const updateSocialAccount = (acc: SocialAccount) => setSocialAccounts(prev => prev.map(a => a.platform === acc.platform ? acc : a));
  const canUser = () => true; 
  
  const addProduct = (p: Product) => { setProducts([...products, p]); addLog(`Added product: ${p.name_ar}`, 'success', 'Inventory'); };
  const addStaff = (s: Staff) => { setStaff([...staff, s]); addLog('Staff recruited', 'success', 'HR'); };
  const addBOM = (b: BOM) => { setBoms([...boms, b]); addLog('New BOM created', 'info', 'Manufacturing'); };
  const addProject = (p: Project) => { setProjects([...projects, p]); addLog('New project initiated', 'success', 'Projects'); };
  const addVehicle = (v: Vehicle) => { setFleet([...fleet, v]); addLog('Vehicle registered', 'success', 'Logistics'); };
  const addAsset = (a: FixedAsset) => { setFixedAssets([...fixedAssets, a]); addLog('Asset registered', 'success', 'Assets'); };
  const addMaintenanceTask = (t: MaintenanceTask) => { setMaintenanceTasks([...maintenanceTasks, t]); addLog('Maintenance scheduled', 'info', 'Maintenance'); };
  const addLegalCase = (l: LegalCase) => { setLegalCases([...legalCases, l]); addLog('Legal case filed', 'warning', 'Legal'); };
  const addTrainingCourse = (c: TrainingCourse) => { setTrainingCourses([...trainingCourses, c]); addLog('Training course created', 'info', 'Training'); };
  const updateTrainingCourse = (id: string, updates: Partial<TrainingCourse>) => setTrainingCourses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  const addImportRecord = (i: ImportRecord) => { setImports([...imports, i]); addLog('Import file opened', 'info', 'Import'); };
  const updateImportRecord = (id: string, updates: Partial<ImportRecord>) => setImports(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  
  const clearImport = (id: string, items: {productId: string, quantity: number}[]) => {
      setImports(prev => prev.map(i => i.id === id ? { ...i, eta: `CLEARED - ${new Date().toLocaleDateString()}` } : i));
      const newProducts = [...products];
      items.forEach(item => {
          const prodIndex = newProducts.findIndex(p => p.id === item.productId);
          if (prodIndex > -1) {
              newProducts[prodIndex].stock += item.quantity;
          }
      });
      setProducts(newProducts);
      addLog(`Import cleared: Stock levels updated for ${items.length} SKUs`, 'success', 'GlobalImport');
  };

  const addQCRecord = (r: QCRecord) => { setQcRecords([...qcRecords, r]); addLog('QC inspection recorded', 'info', 'Quality'); };
  const addWholesaleOrder = (o: WholesaleOrder) => { setWholesaleOrders([...wholesaleOrders, o]); addLog('Wholesale order created', 'success', 'Wholesale'); };
  const addWorkCenter = (w: WorkCenter) => { setWorkCenters([...workCenters, w]); addLog('Work center activated', 'info', 'Manufacturing'); };
  const updateWorkCenter = (id: string, updates: Partial<WorkCenter>) => setWorkCenters(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  
  const addVoucher = (v: Voucher) => { 
      setVouchers([...vouchers, v]); 
      if(v.type === 'receipt') {
          setSafeBalance(prev => ({...prev, cash: prev.cash + v.amount}));
      } else {
          setSafeBalance(prev => ({...prev, cash: prev.cash - v.amount}));
      }
      addLog(`${v.type} voucher created`, 'info', 'Finance'); 
  };
  const addBudget = (b: Budget) => { setBudgets([...budgets, b]); addLog('New budget allocated', 'success', 'Finance'); };
  const addShipment = (s: Shipment) => { setShipments([...shipments, s]); addLog('Shipment created', 'info', 'Logistics'); };
  const addPromotion = (p: Promotion) => { setPromotions([...promotions, p]); addLog('Promotion campaign active', 'success', 'Marketing'); };
  
  const addTicket = (t: Ticket) => { setTickets([...tickets, t]); addLog(`Support Ticket created: ${t.id}`, 'warning', 'Support'); };
  const addCoupon = (c: Coupon) => { setCoupons([...coupons, c]); addLog(`New Coupon: ${c.code}`, 'success', 'Ecommerce'); };
  const addContract = (c: Contract) => { setContracts([...contracts, c]); addLog(`Contract created: ${c.serviceName}`, 'info', 'Projects'); };
  const updateContract = (id: string, updates: Partial<Contract>) => setContracts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  const addStaffDocument = (d: StaffDocument) => { setStaffDocuments([...staffDocuments, d]); addLog(`Document uploaded: ${d.title}`, 'info', 'HR'); };
  const updateVehicle = (id: string, updates: Partial<Vehicle>) => setFleet(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  const updateRoleConfig = (config: RoleConfig) => setRoleConfigs(prev => prev.map(r => r.role === config.role ? config : r));
  const addDamage = (d: DamagedItem) => {
      setDamages([...damages, d]);
      setProducts(prev => prev.map(p => {
          if(p.id === d.productId) return { ...p, stock: p.stock - d.quantity };
          return p;
      }));
      addLog(`Damage recorded: ${d.productName}`, 'warning', 'Inventory');
  };
  const addTraceRecord = (t: TraceRecord) => { setTraces([...traces, t]); addLog(`New batch trace: ${t.id}`, 'info', 'Traceability'); };
  const updateVendorPerformance = (vp: VendorPerformance) => {
      setVendorPerformance(prev => {
          const idx = prev.findIndex(p => p.vendorId === vp.vendorId);
          if (idx > -1) {
              const newArr = [...prev];
              newArr[idx] = vp;
              return newArr;
          }
          return [...prev, vp];
      });
      addLog(`Vendor performance updated for: ${vp.vendorId}`, 'info', 'VendorIntel');
  };
  const updateAsset = (id: string, updates: Partial<FixedAsset>) => setFixedAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  const updateProject = (id: string, updates: Partial<Project>) => setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  const updateLegalCase = (id: string, updates: Partial<LegalCase>) => setLegalCases(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  const addAdvancedInvoice = (inv: AdvancedInvoice) => {
      setAdvancedInvoices(prev => [inv, ...prev]);
      addLog(`Advanced invoice created: ${inv.id}`, 'info', 'Invoicing');
  };
  const updateStaffPerformance = (perf: StaffPerformance) => {
      setStaffPerformance(prev => {
          const idx = prev.findIndex(s => s.staffId === perf.staffId);
          if (idx > -1) {
              const newArr = [...prev];
              newArr[idx] = perf;
              return newArr;
          }
          return [...prev, perf];
      });
      addLog(`HR KPI Updated for Staff ID: ${perf.staffId}`, 'info', 'HR');
  };

  const calculateProjectedPnL = () => {
    const revenue = sales.reduce((acc, s) => acc + s.total, 0);
    const cogs = revenue * 0.6; 
    const opex = expenses.reduce((acc, e) => acc + e.amount, 0);
    const tax = revenue * 0.15;
    const netProfit = revenue - cogs - opex - tax;
    
    return {
      revenue, cogs, opex, tax, netProfit,
      margin: revenue ? (netProfit / revenue) * 100 : 0,
      ar_balance: customers.reduce((a,c) => a + c.balance, 0),
      ap_balance: Math.abs(suppliers.reduce((a,s) => a + s.balance, 0))
    };
  };

  const askOracle = async (query: string): Promise<string> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: query,
        config: {
            tools: [{ googleSearch: {} }]
        }
      });
      
      let text = response.text || "لم يتم العثور على إجابة.";
      
      // Extract grounding sources if available
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (groundingChunks) {
          const sources = groundingChunks
            .filter((c: any) => c.web?.uri && c.web?.title)
            .map((c: any) => `[${c.web.title}](${c.web.uri})`)
            .join('\n');
          
          if(sources) {
              text += `\n\n**المصادر:**\n${sources}`;
          }
      }
      
      return text;
    } catch (e: any) { 
        console.error("Oracle Error:", e);
        if (e.message?.includes('429') || e.status === 429 || JSON.stringify(e).includes('429')) {
             return "⚠️ تم تجاوز حد الاستخدام (Quota Exceeded). يرجى الانتظار قليلاً.";
        }
        return "نظام أوراكل غير متصل حالياً (API Error)."; 
    }
  };

  const generateAIContent = async (prompt: string, type: 'text' | 'analysis'): Promise<string> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Force flash model for both types to avoid resource exhaustion on free tier
      const modelName = 'gemini-3-flash-preview'; 
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });
      return response.text || "";
    } catch (e: any) { 
        console.error("AI Gen Error:", e);
        if (e.message?.includes('429') || e.status === 429 || JSON.stringify(e).includes('429')) return "Error: Quota Exceeded";
        return "AI Generation Failed"; 
    }
  };

  const generateMarketingMedia = async (prompt: string) => {
    const text = await generateAIContent(prompt, 'text');
    return { text, image: 'https://via.placeholder.com/300' };
  };

  const syncCatalog = async () => { await new Promise(r => setTimeout(r, 1000)); addLog('Catalog Synced'); };
  
  const syncOfflineData = () => { 
      if (offlineSales.length > 0) {
          setSales([...offlineSales, ...sales]);
          setOfflineSales([]);
          addLog(`${offlineSales.length} Offline sales synced successfully.`, 'success', 'Sync');
          addToast(`تمت مزامنة ${offlineSales.length} عملية بيع بنجاح`, 'success');
      } else {
          addToast('لا توجد بيانات للمزامنة', 'info');
      }
  };
  
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const updateShipmentStatus = (id: string, s: string) => setShipments(prev => prev.map(sh => sh.id === id ? { ...sh, status: s as any } : sh));

  return (
    <AppContext.Provider value={{
      user, setUser, lang, setLang, isOnline, t, activeTab, setActiveTab,
      showNotifications, setShowNotifications, toasts, addToast, removeToast,
      products, setProducts, addProduct, updateProduct, deleteProduct, stockAdjustments, addStockAdjustment, transferStock, categories, setCategories,
      sales, addSale, suspendedSales, setSuspendedSales, offlineSales, setOfflineSales, customers, addCustomer, onlineOrders, updateOnlineOrderStatus, quotes, convertQuoteToSale, installmentPlans, payInstallment,
      suppliers, addSupplier, purchases, addPurchase, buyRequests, setBuyRequests, bids, setBids, acceptBid, wholesaleOrders, addWholesaleOrder, approveWholesale,
      expenses, addExpense, taxRecords, ledger, safeBalance, safeTransactions, advancedInvoices, addAdvancedInvoice, creditNotes, issueCreditNote, budgets, addBudget, financialForecasts, bankAccounts, vouchers, addVoucher, calculateProjectedPnL,
      staff, addStaff, shifts, openShift, closeShift, staffPerformance, updateStaffPerformance, staffDocuments, addStaffDocument, trainingCourses, addTrainingCourse, updateTrainingCourse,
      branches, addBranch, activeBranchId, setActiveBranchId, fleet, addVehicle, updateVehicle, fieldAgents, shipments, addShipment, updateShipmentStatus, fixedAssets, addAsset, updateAsset,
      boms, addBOM, productionOrders, startProduction, completeProduction, workCenters, addWorkCenter, updateWorkCenter, projects, addProject, updateProject, maintenanceTasks, addMaintenanceTask, qcRecords, addQCRecord,
      legalCases, addLegalCase, updateLegalCase, audits, imports, addImportRecord, updateImportRecord, clearImport, traces, addTraceRecord,
      campaigns, addCampaign, promotions, addPromotion, socialAccounts, updateSocialAccount, socialInbox, addSocialMessage, messages, addMessage, contacts, generateMarketingMedia, syncCatalog,
      automationRules, setAutomationRules, automationLogs, activityLogs, addLog, notifications, roleConfigs, updateRoleConfig, canUser, askOracle, generateAIContent, syncOfflineData, resetSystem,
      tickets, addTicket, coupons, addCoupon,
      damages, addDamage, vendorPerformance, updateVendorPerformance, contracts, addContract, updateContract
    }}>
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={lang === 'ar' ? 'font-tajawal' : 'font-inter'}>
        {children}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
