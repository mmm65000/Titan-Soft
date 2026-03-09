
// This service is built to be a bridge. 
// In an Electron environment, swap LocalStorage with better-sqlite3 calls.

const STORAGE_KEYS = {
  PRODUCTS: 'titan_db_products',
  SALES: 'titan_db_sales',
  TENANT: 'titan_db_config',
  AUDIT: 'titan_db_audit',
  CUSTOMERS: 'titan_db_customers',
  SUPPLIERS: 'titan_db_suppliers',
  PROJECTS: 'titan_db_projects',
  BRANCHES: 'titan_db_branches'
};

export class DatabaseService {
  private static async get<T>(key: string): Promise<T[]> {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private static async save<T>(key: string, data: T[]): Promise<void> {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Generic CRUD
  static async insert<T extends { id: string }>(key: string, item: T): Promise<void> {
    const current = await this.get<T>(key);
    current.push(item);
    await this.save(key, current);
    console.log(`[DB] Inserted into ${key}`, item.id);
  }

  static async findMany<T>(key: string, filter?: (item: T) => boolean): Promise<T[]> {
    const all = await this.get<T>(key);
    return filter ? all.filter(filter) : all;
  }

  static async findOne<T>(key: string, filter: (item: T) => boolean): Promise<T | null> {
    const all = await this.get<T>(key);
    return all.find(filter) || null;
  }

  static async update<T extends { id: string }>(key: string, id: string, updates: Partial<T>): Promise<void> {
    const all = await this.get<T>(key);
    const index = all.findIndex(i => i.id === id);
    if (index !== -1) {
      all[index] = { ...all[index], ...updates };
      await this.save(key, all);
    }
  }

  // Specific Seeds
  static async seedDemoData() {
    // 1. Products
    const products = await this.get(STORAGE_KEYS.PRODUCTS);
    if (products.length === 0) {
      await this.save(STORAGE_KEYS.PRODUCTS, [
        { 
          id: '1', tenantId: 't1', sku: 'IP15-PRO-256', barcode: '123456789', 
          nameAr: 'آيفون 15 برو 256 جيجا', nameEn: 'iPhone 15 Pro 256GB', category: 'Electronics', categoryId: 'cat1', 
          costPrice: 4000, salePrice: 4800, vatRate: 15, stock: 25, minStock: 5, lastUpdated: new Date().toISOString(), 
          image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&fit=crop',
          majorUnit: 'كرتون', minorUnit: 'حبة', unitContent: 10, majorUnitPrice: 47500
        },
        { 
          id: '2', tenantId: 't1', sku: 'MACM3-AIR', barcode: '987654321', 
          nameAr: 'ماك بوك آير M3', nameEn: 'MacBook Air M3', category: 'Electronics', categoryId: 'cat1', 
          costPrice: 4200, salePrice: 5100, vatRate: 15, stock: 12, minStock: 3, lastUpdated: new Date().toISOString(), 
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=400&fit=crop',
          majorUnit: 'صندوق', minorUnit: 'جهاز', unitContent: 5, majorUnitPrice: 25000 
        },
        { 
          id: '3', tenantId: 't1', sku: 'NK-SHOES-RUN', barcode: '11223344', 
          nameAr: 'حذاء ركض رياضي', nameEn: 'Running Shoes', category: 'Fashion', categoryId: 'cat2', 
          costPrice: 150, salePrice: 300, vatRate: 15, stock: 50, minStock: 10, lastUpdated: new Date().toISOString(), 
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&fit=crop',
          majorUnit: 'دزن', minorUnit: 'زوج', unitContent: 12, majorUnitPrice: 3400
        }
      ]);
    }

    // 2. Customers
    const customers = await this.get(STORAGE_KEYS.CUSTOMERS);
    if (customers.length === 0) {
        await this.save(STORAGE_KEYS.CUSTOMERS, [
            { id: 'cust1', name: 'أحمد محمد', phone: '0551234567', email: 'ahmed@mail.com', points: 150, segment: 'VIP', balance: 0, creditLimit: 5000, creditScore: 90 },
            { id: 'cust2', name: 'شركة التقنية المتقدمة', phone: '0112223333', email: 'info@tech.sa', points: 500, segment: 'Corporate', balance: 1200, creditLimit: 20000, creditScore: 85 }
        ]);
    }

    // 3. Projects
    const projects = await this.get(STORAGE_KEYS.PROJECTS);
    if (projects.length === 0) {
        await this.save(STORAGE_KEYS.PROJECTS, [
            { id: 'prj1', name: 'تجهيز الفرع الجديد - جدة', customerId: 'Internal', budget: 150000, spent: 45000, status: 'active', endDate: '2025-06-30' }
        ]);
    }

    // 4. Branches
    const branches = await this.get(STORAGE_KEYS.BRANCHES);
    if (branches.length === 0) {
        await this.save(STORAGE_KEYS.BRANCHES, [
            { id: 'b1', name: 'Riyadh HQ', name_ar: 'الفرع الرئيسي - الرياض', location: 'Olayya Dist', phone: '0114445555', isMain: true }
        ]);
    }
  }
}

export { STORAGE_KEYS };