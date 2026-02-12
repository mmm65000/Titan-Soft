
import React from 'react';
import { Translation } from './types';

export const TRANSLATIONS: Translation = {
  appName: { en: 'Titan Platform', ar: 'منصة تايتان' },
  dashboard: { en: 'Dashboard', ar: 'لوحة التحكم' },
  inventory: { en: 'Inventory', ar: 'المخزون' },
  purchases: { en: 'Purchases', ar: 'المشتريات' },
  balances: { en: 'Balances', ar: 'الأرصدة' },
  transfer: { en: 'Transfer', ar: 'التحويل' },
  stocktaking: { en: 'Stocktaking', ar: 'الجرد' },
  items: { en: 'Items', ar: 'الأصناف' },
  uploadItems: { en: 'Upload Items', ar: 'رفع الأصناف' },
  units: { en: 'Units', ar: 'الوحدات' },
  groups: { en: 'Groups', ar: 'المجموعات' },
  suppliers: { en: 'Suppliers', ar: 'الموردين' },
  promotions: { en: 'Promotions', ar: 'عروض ترويجية' },
  branches: { en: 'Branches', ar: 'الفروع' },
  employees: { en: 'Employees', ar: 'الموظفين' },
  sales: { en: 'Sales', ar: 'المبيعات' },
  customers: { en: 'Customers', ar: 'العملاء' },
  orders: { en: 'Orders', ar: 'الطلبيات' },
  myOrders: { en: 'My Orders', ar: 'طلبياتي' },
  branchOrders: { en: 'Branch Orders', ar: 'طلبيات الفروع' },
  customerOrders: { en: 'Customer Orders', ar: 'طلبيات العملاء' },
  storeOrders: { en: 'Store Orders', ar: 'طلبيات المتجر' },
  reports: { en: 'Reports', ar: 'التقارير' },
  financials: { en: 'Financials', ar: 'المالية' },
  expenses: { en: 'Expenses', ar: 'المصروفات' },
  statements: { en: 'Financial Statements', ar: 'البيان المالي' },
  support: { en: 'Support', ar: 'الدعم' },
  logout: { en: 'Logout', ar: 'خروج' },
  offerQuote: { en: 'Offer Quotation', ar: 'تقديم عرض أسعار' },
  vouchers: { en: 'Vouchers', ar: 'السندات' },
  shifts: { en: 'Shifts', ar: 'الورديات' },
  alerts: { en: 'Alerts', ar: 'التنبيهات' },
  ledger: { en: 'Ledger', ar: 'حسابات' },
  invoices: { en: 'Invoices', ar: 'الفواتير' },
  accounting: { en: 'Accounting', ar: 'المحاسبة' },
  marketplace: { en: 'Marketplace', ar: 'سوق الموردين' },
  ecommerce: { en: 'Store', ar: 'المتجر' }
};

export const Icons = {
  Dashboard: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Inventory: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Orders: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  ),
  Sales: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Reports: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  People: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Financial: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Support: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Store: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  Settings: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};
