
export type UserRole = 'admin' | 'manager' | 'cashier' | 'accountant' | 'warehouse_keeper' | 'supplier' | 'wholesaler';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  branchId: string;
  businessName: string;
  storeUrl: string;
  trialStartDate: string;
  subscriptionStatus: 'trial' | 'active' | 'expired';
}

export interface Translation {
  [key: string]: { en: string; ar: string };
}

export interface PaymentBreakdown {
  cash: number;
  card: number;
  bankName?: string;
  transfer: number;
  credit: number;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  unit?: string;
  discountPercent: number;
  taxPercent: number;
}

export interface Sale { 
  id: string; 
  date: string; 
  items: SaleItem[]; 
  total: number; 
  paymentMethod: 'cash' | 'card' | 'online' | 'credit' | 'mixed'; 
  branchId: string; 
  customerId?: string; 
  status: 'completed' | 'pending' | 'offline_synced' | 'suspended' | 'offline' | 'paid';
  subtotal: number;
  tax: number;
  discount: number;
  payments: PaymentBreakdown;
  cashierId?: string;
  sellerName?: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  // Added optional 'source' property to distinguish between sale origins for reporting
  source?: 'pos' | 'wholesale' | 'ecommerce';
}

export interface BundleItem {
  productId: string;
  quantity: number;
}

export interface Product { 
  id: string; 
  name: string; 
  name_ar: string; 
  scientificName?: string; // الاسم العلمي
  price: number; // سعر بيع الوحدة الصغرى
  cost: number; // تكلفة الوحدة الصغرى
  wholesalePrice?: number; // سعر الجملة
  stock: number; 
  minStock: number; 
  image: string; 
  category: string;
  categoryId?: string;
  subCategory?: string;
  subCategoryId?: string;
  isOnline: boolean; 
  sku: string;
  barcode?: string;
  
  // Units Logic
  majorUnit?: string; // وحدة كبرى (كرتون)
  minorUnit?: string; // وحدة صغرى (حبة)
  unitContent?: number; // محتوى الوحدة الكبرى (مثلاً 12 حبة في الكرتون)
  majorUnitPrice?: number; // سعر بيع الوحدة الكبرى
  
  // Settings
  taxRate?: number;
  maxDiscount?: number; // أقصى خصم مسموح %
  inventoryDisabled?: boolean; // تعطيل إدارة المخزون (خدمة)
  expiryTracking?: boolean; // تفعيل تاريخ الصلاحية
  isReturnable?: boolean; // قابل للإرجاع
  description?: string; // المواصفات / الاستعمال
  
  // Advanced Stock
  stagnantLevel?: number; // حد الركود
  reorderPoint?: number;
  openingBalance?: number;
  branchStocks?: Record<string, number>;
  
  // Bundles
  isBundle?: boolean;
  bundleItems?: BundleItem[];
}

export interface Supplier {
  id: string;
  name: string;
  name_ar?: string;
  phone: string;
  email: string;
  balance: number;
  rating?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  points: number;
  lastPurchase?: string;
  segment: 'VIP' | 'Regular' | 'New';
  balance: number;
  totalSpent?: number;
  creditLimit: number;
  creditScore?: number;
  tier?: string;
}

export interface Notification {
  id: string;
  timestamp: string;
  read: boolean;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  note: string;
  date: string;
  type?: string;
  receiptImage?: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  salary: number;
  joinDate: string;
  status: 'active' | 'on_leave' | 'terminated';
  attendance: { date: string; status: 'present' | 'absent' | 'late' }[];
}

export interface Campaign {
  id: string;
  title?: string;
  name?: string;
  platform: 'facebook' | 'instagram' | 'whatsapp' | 'email';
  status: 'draft' | 'active' | 'completed' | 'sent';
  budget?: number;
  reach: number;
  spent?: number;
  roi?: number; 
  content: string;
  targetAudience?: string;
  date: string;
}

export interface SocialMessage {
  id: string;
  platform: 'whatsapp' | 'facebook' | 'instagram';
  sender: string;
  content?: string;
  text?: string;
  timestamp?: string;
  isRead?: boolean;
  senderName: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  module: string;
  timestamp: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  details?: string;
  ip?: string;
}

export interface StockTransfer {
  id: string;
  fromBranch: string;
  toBranch: string;
  items: SaleItem[];
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export interface BuyRequest {
  id: string;
  retailerId: string;
  retailerName: string;
  items: { productName: string; quantity: number }[];
  status: 'active' | 'closed';
  date: string;
  description: string;
}

export interface Bid {
  id: string;
  requestId: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  deliveryTime: string;
  status: 'pending' | 'accepted' | 'rejected';
  notes: string;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  type: 'adjustment' | 'damage';
  quantity: number;
  unit?: string;
  cost: number;
  discount: number;
  tax: number;
  total: number;
  date: string;
  barcode?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  senderName?: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  isSocial?: boolean;
  platform?: string;
}

export interface SubCategory {
  id: string;
  name: string;
  name_ar: string;
}

export interface Category {
  id: string;
  name: string;
  name_ar: string;
  subCategories: SubCategory[];
}

export interface PurchaseInvoice {
  id: string;
  supplierId: string;
  date: string;
  items: SaleItem[];
  total: number;
  tax: number;
  discount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'credit';
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  paidAmount: number;
  isSuspended: boolean;
  referenceNumber: string;
  notes: string;
}

export interface Quote {
  id: string;
  date: string;
  customerName: string;
  items: SaleItem[];
  total: number;
  status: 'pending' | 'converted' | 'rejected';
}

export interface InstallmentPlan {
  id: string;
  customerId: string;
  totalAmount: number;
  remainingAmount: number;
  frequency: string;
  installments: {
    id: string;
    amount: number;
    dueDate: string;
    status: 'paid' | 'pending' | 'overdue';
  }[];
}

export interface AutomationRule {
  id: string;
  name: string;
  event: string;
  isActive: boolean;
  actions: { type: string; target: string }[];
  executionCount: number;
}

export interface AutomationLog {
  id: string;
  ruleName: string;
  timestamp: string;
  status: 'success' | 'failed';
  details: string;
}

export interface Branch {
  id: string;
  name: string;
  name_ar: string;
  location: string;
  phone: string;
  isMain?: boolean;
}

export interface RoleConfig {
  role: UserRole;
  permissions: {
    module: string;
    read: boolean;
    write: boolean;
    delete: boolean;
  }[];
}

export interface OnlineOrder {
  id: string;
  customerName: string;
  date: string;
  total: number;
  // Added 'cancelled' to the allowed status values for OnlineOrder
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: SaleItem[];
  shippingAddress?: string;
}

export interface SocialAccount {
  platform: 'whatsapp' | 'facebook' | 'instagram';
  status: 'connected' | 'disconnected';
  lastSync: string;
  settings: { syncCatalog: boolean };
}

export interface FieldAgent {
  id: string;
  name: string;
  phone: string;
  status: 'online' | 'offline' | 'busy';
  currentVault: number;
  deliveriesCompleted: number;
}

export interface TaxRecord {
  id: string;
  invoiceId: string;
  type: 'input' | 'output';
  taxableAmount: number;
  taxAmount: number;
}

export interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  category: string;
  type: 'debit' | 'credit';
  amount: number;
}

export interface SafeTransaction {
  id: string;
  type: 'in' | 'out';
  description: string;
  date: string;
  paymentMethod: 'cash' | 'card';
  amount: number;
}

export interface AdvancedInvoice {
  id: string;
  source: string;
  date: string;
  total: number;
  tax: number;
  paidAmount: number;
  status: 'paid' | 'partial' | 'overdue' | 'void' | 'returned';
}

export interface CreditNote {
  id: string;
  originalInvoiceId: string;
  amount: number;
  reason: string;
  status: 'issued' | 'used';
}

export interface Shift {
  id: string;
  openedAt: string;
  closedAt?: string;
  user: string;
  openingBalance: number;
  closingBalance?: number;
  status: 'open' | 'closed';
}

export interface BOM {
  id: string;
  finalProductId: string;
  components: { productId: string; quantity: number }[];
}

export interface ProductionOrder {
  id: string;
  bomId: string;
  quantity: number;
  status: 'in_progress' | 'completed';
  startDate: string;
}

export interface FixedAsset {
  id: string;
  name: string;
  category: string;
  purchaseValue: number;
  currentValue: number;
  status: 'active' | 'maintenance';
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  orderId: string;
  origin: string;
  destination: string;
  carrier: string;
  weight: number;
  status: 'in_transit' | 'delivered' | 'picked_up' | 'pending';
}

export interface QCRecord {
  id: string;
  orderId: string;
  status: 'passed' | 'failed';
  notes: string;
  date: string;
}

export interface ImportRecord {
  id: string;
  vesselName: string;
  containerNumber: string;
  originPort: string;
  destinationPort: string;
  eta: string;
  totalValue: number;
  customsDuty: number;
}

export interface Project {
  id: string;
  name: string;
  customerId: string;
  budget: number;
  spent: number;
  status: 'active' | 'planning' | 'completed';
  endDate: string;
}

export interface MaintenanceTask {
  id: string;
  assetName: string;
  taskType: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedEngineer: string;
  scheduledDate: string;
}

export interface LegalCase {
  id: string;
  title: string;
  type: string;
  status: 'hearing' | 'closed' | 'open';
  description: string;
  involvedParties: string;
  nextStep: string;
}

export interface AuditRecord {
  id: string;
  title: string;
  score: number;
  date: string;
  auditor: string;
}

export interface TraceRecord {
  id: string;
  productName: string;
  expiryDate: string;
  journey: { step: string; date: string; details: string }[];
}

export interface TrainingCourse {
  id: string;
  title: string;
  category: string;
  duration: string;
  status: 'active' | 'completed';
  attendees: string[];
}

export interface Budget {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  variance: number;
  status: 'within_budget' | 'exceeded';
}

export interface FinancialForecast {
  month: string;
  predictedRevenue: number;
  confidenceScore: number;
  trend: 'up' | 'down';
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  balance: number;
  currency: string;
}

export interface StaffPerformance {
  staffId: string;
  kpiScore: number;
  achievedSales: number;
  salesTarget: number;
  attendanceRate: number;
  tasksCompleted: number;
}

export interface DamagedItem {
  id: string;
  productId: string;
  productName: string;
  reason: string;
  quantity: number;
  cost: number;
  date: string;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
}

export interface StaffDocument {
  id: string;
  staffId: string;
  title: string;
  type: 'contract' | 'id' | 'other';
  expiryDate: string;
}

export interface WorkCenter {
  id: string;
  name: string;
  status: 'operational' | 'maintenance';
  efficiency: number;
  lastMaintenance: string;
}

export interface VendorPerformance {
  vendorId: string;
  deliverySpeed: number;
  qualityScore: number;
  pricingIndex: number;
  totalOrders: number;
}

export interface Vehicle {
  id: string;
  type: 'truck' | 'van';
  model: string;
  plateNumber: string;
  fuelLevel: number;
  status: 'available' | 'maintenance' | 'busy';
  lastService: string;
}

export interface WholesaleOrder {
  id: string;
  customerName: string;
  total: number;
  creditTerm: string;
  status: 'pending_approval' | 'approved' | 'rejected';
  requestedAt: string;
}

export interface Voucher {
  id: string;
  type: 'receipt' | 'payment';
  accountId: string;
  accountName: string;
  amount: number;
  date: string;
  description: string;
  paymentMethod: 'cash' | 'card' | 'transfer';
}

export interface Promotion {
  id: string;
  title: string;
  type: string;
  value: string;
  status: 'active' | 'expired';
  reach: number;
}

export interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'closed';
  date: string;
  priority: string;
  description: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: string;
  value: string;
  uses: number;
  status: 'active' | 'expired';
}
