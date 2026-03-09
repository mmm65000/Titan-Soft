
export type UserRole = 'super_admin' | 'tenant_admin' | 'manager' | 'cashier' | 'accountant' | 'admin' | 'wholesaler' | 'supplier';

export interface Translation {
  [key: string]: { en: string; ar: string };
}

export interface Tenant {
  id: string;
  name: string;
  taxNumber: string;
  logo: string;
  settings: Record<string, any>;
  address?: {
    buildingNo: string;
    street: string;
    district: string;
    city: string;
    postalCode: string;
    country: string;
  };
  contact?: {
    phone: string;
    email: string;
    website: string;
  };
}

export interface SystemConfig {
  loyalty: {
    enabled: boolean;
    pointsValue: number;
    earnRatio: number;
    minRedeem: number;
  };
  tax: {
    vatNumber: string;
    vatRate: number;
    currency: string;
    companyName: string;
    zatcaPhase: 'phase1' | 'phase2';
  };
  receipt: {
    header: string;
    footer: string;
    showLogo: boolean;
    showQr: boolean;
    paperSize: '80mm' | 'A4';
    autoPrint: boolean;
  };
  integrations: {
    sms: { provider: string; apiKey: string; senderId: string; enabled: boolean };
    payment: { provider: string; merchantId: string; secretKey: string; enabled: boolean };
    whatsapp: { apiKey: string; instanceId: string; enabled: boolean };
  };
  bankAccount: {
    bankName: string;
    iban: string;
    accountName: string;
    swift: string;
  };
}

export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
  avatar?: string;
  businessName?: string;
  storeUrl?: string;
  trialStartDate?: string;
  subscriptionStatus?: string;
  branchId?: string;
}

export interface Product {
  id: string;
  tenantId?: string;
  sku: string;
  barcode: string;
  nameAr: string;
  nameEn: string;
  scientificName?: string;
  category: string;
  categoryId?: string;
  subCategory?: string;
  subCategoryId?: string;
  costPrice: number;
  salePrice: number;
  wholesalePrice?: number;
  vatRate: number;
  stock: number;
  minStock: number;
  stagnantLevel?: number;
  reorderPoint?: number;
  image?: string;
  lastUpdated: string;
  isOnline?: boolean;
  majorUnit?: string;
  minorUnit?: string;
  unitContent?: number;
  majorUnitPrice?: number;
  maxDiscount?: number;
  inventoryDisabled?: boolean;
  expiryTracking?: boolean;
  isReturnable?: boolean;
  description?: string;
  branchStocks?: Record<string, number>;
  isBundle?: boolean;
  bundleItems?: BundleItem[];
  openingBalance?: number;
  taxRate?: number;
  // Aliases for compatibility
  name?: string; 
  price?: number; 
  cost?: number;
  name_ar?: string; // Kept for legacy support in some components
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  unit?: string;
  vatAmount: number;
  taxPercent?: number;
  discountPercent?: number;
  total: number;
}

export interface PaymentBreakdown {
  cash: number;
  card: number;
  credit: number;
  transfer: number;
  bankName: string;
}

export interface Sale {
  id: string;
  tenantId: string;
  userId: string;
  customerId?: string;
  customerName?: string;
  sellerName?: string;
  items: SaleItem[];
  subtotal: number;
  totalVat: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'split' | 'mixed';
  status: 'completed' | 'voided' | 'refunded' | 'offline' | 'returned' | 'preparing' | 'ready';
  createdAt: string;
  date: string;
  discount?: number;
  tax?: number;
  total: number; // redundancy for ease of use
  payments?: PaymentBreakdown;
  branchId?: string;
  cashierId?: string;
  source?: 'pos' | 'online' | 'wholesale';
  fulfillmentStatus?: 'pending' | 'picking' | 'ready' | 'dispatched';
}

export interface ReturnRecord {
  id: string;
  originalSaleId: string;
  date: string;
  items: SaleItem[];
  totalRefund: number;
  reason: string;
  status: 'approved' | 'rejected';
  restockingFee: number;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

export interface SafeBalance {
  cash: number;
  card: number;
}

export interface SafeTransaction {
  id: string;
  type: 'in' | 'out';
  amount: number;
  description: string;
  date: string;
  paymentMethod: 'cash' | 'card' | 'transfer';
}

export interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'debit' | 'credit';
}

export interface TaxRecord {
  id: string;
  invoiceId: string;
  type: 'input' | 'output';
  taxableAmount: number;
  taxAmount: number;
  date: string;
}

export interface Shift {
  id: string;
  user: string;
  openedAt: string;
  closedAt?: string;
  openingBalance: number;
  closingBalance?: number;
  status: 'open' | 'closed';
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
  cost: number;
  discount: number;
  tax: number;
  total: number;
  date: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  note: string;
  date: string;
  type: string;
  receiptImage?: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: string;
  value: string;
  uses: number;
  status: 'active' | 'inactive';
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  isSocial?: boolean;
}

export interface SocialMessage {
  id: string;
  platform: 'whatsapp' | 'facebook';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  salary: number;
  joinDate: string;
  status: 'active' | 'inactive';
  attendance: any[];
}

export interface Category {
  id: string;
  name: string;
  name_ar: string;
  subCategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  name_ar: string;
}

export interface PurchaseInvoice {
  id: string;
  supplierId: string;
  date: string;
  items: SaleItem[];
  total: number;
  tax: number;
  discount: number;
  paymentMethod: string;
  paymentStatus: string;
  paidAmount: number;
  isSuspended: boolean;
  referenceNumber: string;
  notes: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  points: number;
  segment: string;
  balance: number;
  creditLimit: number;
  creditScore: number;
  tier?: string;
  totalSpent?: number;
}

export interface Quote {
  id: string;
  customerName: string;
  date: string;
  items: SaleItem[];
  total: number;
  status: 'pending' | 'converted';
}

export interface InstallmentPlan {
  id: string;
  customerId: string;
  totalAmount: number;
  remainingAmount: number;
  frequency: string;
  installments: Installment[];
}

export interface Installment {
  id: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid';
}

export interface DamagedItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  reason: string;
  cost: number;
  date: string;
}

export interface Campaign {
  id: string;
  title: string;
  platform: 'instagram' | 'snapchat' | 'whatsapp';
  status: 'active' | 'paused' | 'completed';
  budget: number;
  reach: number;
  content: string;
  targetAudience: string;
  date: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  event: string;
  isActive: boolean;
  actions: { type: string; target: string }[];
  executionCount: number;
}

export interface Branch {
  id: string;
  name: string;
  name_ar: string;
  location: string;
  phone: string;
  isMain?: boolean;
}

export interface Promotion {
  id: string;
  title: string;
  type: string;
  value: string;
  reach: number;
  status: 'active' | 'expired';
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

export interface RoleConfig {
  role: UserRole;
  permissions: { module: string; read: boolean; write: boolean; delete: boolean }[];
}

export interface BundleItem {
  productId: string;
  quantity: number;
}

export interface StaffPerformance {
  staffId: string;
  achievedSales: number;
  salesTarget: number;
  attendanceRate: number;
  tasksCompleted: number;
  kpiScore: number;
}

export interface BOM {
  id: string;
  finalProductId: string;
  components: BundleItem[];
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
  status: 'pending' | 'picked_up' | 'in_transit' | 'delivered';
}

export interface Vehicle {
  id: string;
  type: 'van' | 'truck';
  model: string;
  plateNumber: string;
  fuelLevel: number;
  status: 'available' | 'busy' | 'maintenance';
  lastService: string;
  currentRoute?: string;
}

export interface WorkCenter {
  id: string;
  name: string;
  status: 'operational' | 'maintenance';
  efficiency: number;
  lastMaintenance: string;
}

export interface Supplier {
  id: string;
  name: string;
  name_ar: string;
  phone: string;
  email: string;
  balance: number;
  rating: number;
}

export interface StaffDocument {
  id: string;
  staffId: string;
  title: string;
  type: 'contract' | 'id' | 'other';
  expiryDate: string;
}

export interface WholesaleOrder {
  id: string;
  customerName: string;
  total: number;
  creditTerm: string;
  status: 'pending_approval' | 'approved';
  requestedAt: string;
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
  status: 'open' | 'hearing' | 'closed';
  description: string;
  involvedParties: string;
  nextStep: string;
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

export interface AdvancedInvoice {
  id: string;
  source: string;
  date: string;
  total: number;
  tax: number;
  paidAmount: number;
  status: 'paid' | 'overdue' | 'partial' | 'void' | 'returned';
}

export interface Budget {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  variance: number;
  status: 'within_budget' | 'exceeded';
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'closed';
  date: string;
  priority: 'low' | 'medium' | 'high';
}

export interface Contract {
  id: string;
  serviceName: string;
  customerName: string;
  value: number;
  paymentCycle: 'monthly' | 'yearly';
  status: 'active' | 'terminated';
  endDate: string;
}