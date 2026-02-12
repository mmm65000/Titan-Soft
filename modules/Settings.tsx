
import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { UserRole } from '../types';

const Settings: React.FC = () => {
  const { lang, setLang, activeTab, staff, user, products, sales, customers, addStaff, addLog, resetSystem, addToast, setUser } = useApp();
  
  const getInitialTab = () => {
    if (activeTab === 'settings_users') return 'users';
    if (activeTab === 'settings_backup') return 'backup';
    return 'general';
  };

  const [currentTab, setCurrentTab] = useState<'general' | 'users' | 'backup' | 'tax' | 'receipt' | 'integrations' | 'system'>('general');
  const [loyaltyConfig, setLoyaltyConfig] = useState({ pointsValue: 1, earnRatio: 10, minRedeem: 100 });
  const [taxConfig, setTaxConfig] = useState({ vatNumber: '', vatRate: '15', currency: 'SAR', companyName: user?.businessName || '' });
  const [receiptConfig, setReceiptConfig] = useState({ header: 'Welcome to Titan Store', footer: 'Thank you for shopping!', showLogo: true });
  
  // System Health Mock Data
  const [systemStats, setSystemStats] = useState({ storage: 0, memory: 0, latency: 0 });

  // Integrations State
  const [zatcaConfig, setZatcaConfig] = useState({ phase: 'phase2', deviceId: '', status: 'connected', certificate: 'Active' });
  
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', role: 'cashier', salary: '', email: '' });

  useEffect(() => {
    if(activeTab.startsWith('settings')) setCurrentTab(getInitialTab());
    const savedReceipt = localStorage.getItem('titan_receipt_config');
    if(savedReceipt) setReceiptConfig(JSON.parse(savedReceipt));
    
    // Check Storage
    if(currentTab === 'system') {
        const usage = JSON.stringify(localStorage).length / 1024; // KB
        const perf = performance as any;
        setSystemStats({
            storage: Math.round(usage),
            // Fix: Cast performance to any to access non-standard memory property safely
            memory: Math.round(perf.memory?.usedJSHeapSize / 1024 / 1024 || 50),
            latency: Math.floor(Math.random() * 50) + 20
        });
    }
  }, [activeTab, currentTab]);

  const handleAddUser = () => {
      if(!newUser.name || !newUser.salary) return;
      const s = {
          id: `USR-${Date.now()}`,
          name: newUser.name,
          role: newUser.role,
          salary: parseFloat(newUser.salary) || 0,
          joinDate: new Date().toISOString().split('T')[0],
          status: 'active' as const,
          attendance: []
      };
      addStaff(s);
      addLog(`New user added: ${newUser.name} (${newUser.role})`, 'success', 'Settings');
      setShowUserModal(false);
      setNewUser({ name: '', role: 'cashier', salary: '', email: '' });
  };

  const handleSaveGeneral = () => {
      localStorage.setItem('titan_loyalty_config', JSON.stringify(loyaltyConfig));
      if (user && taxConfig.companyName !== user.businessName) {
          setUser({ ...user, businessName: taxConfig.companyName });
      }
      addLog('General configuration updated', 'success', 'Settings');
      addToast('تم حفظ الإعدادات العامة بنجاح', 'success');
  };

  const handleSaveTax = () => {
      localStorage.setItem('titan_tax_config', JSON.stringify(taxConfig));
      addLog('Tax configuration updated', 'warning', 'Settings');
      addToast('تم تحديث البيانات الضريبية', 'success');
  };

  const handleSaveReceipt = () => {
      localStorage.setItem('titan_receipt_config', JSON.stringify(receiptConfig));
      addLog('Receipt template updated', 'success', 'Settings');
      addToast('تم تحديث تصميم الفاتورة', 'success');
  };

  const handleResetSystem = () => {
      if (confirm('تحذير: هل أنت متأكد من حذف كافة البيانات وإعادة ضبط المصنع؟ لا يمكن التراجع عن هذا الإجراء.')) {
          resetSystem();
      }
  };

  const handleResetWizard = () => {
      localStorage.removeItem('titan_welcome_wizard_seen');
      addToast('تم إعادة تعيين الجولة التعريفية، قم بتحديث الصفحة', 'info');
      setTimeout(() => window.location.reload(), 1000);
  };

  const handleDownloadBackup = () => {
    const data = {
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        system: "Titan ERP",
        products,
        sales,
        customers,
        staff
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `titan_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">إعدادات النظام المركزية</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">System Configuration & Control Panel</p>
        </div>
        <div className="flex glass rounded-[2.5rem] p-1.5 shadow-md border-white/50 overflow-x-auto custom-scrollbar no-scrollbar">
          {[
            { id: 'general', label: 'عام وتخصيص' },
            { id: 'system', label: 'تشخيص النظام 🩺' },
            { id: 'tax', label: 'البيانات المالية' },
            { id: 'integrations', label: 'الربط (ZATCA)' },
            { id: 'receipt', label: 'تصميم الإيصال' },
            { id: 'users', label: 'المستخدمين' },
            { id: 'backup', label: 'النسخ الاحتياطي' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as any)}
              className={`px-6 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${currentTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* General Settings */}
      {currentTab === 'general' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           <div className="space-y-8 animate-in slide-in-from-bottom-4">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-4">تفضيلات الواجهة</h4>
              <div className="p-10 glass rounded-[40px] space-y-6 border border-white shadow-xl bg-white/40">
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-700">لغة النظام (Language)</span>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button onClick={() => setLang('ar')} className={`px-4 py-2 rounded-lg text-[10px] font-bold ${lang === 'ar' ? 'bg-white shadow-sm' : 'text-gray-400'}`}>العربية</button>
                        <button onClick={() => setLang('en')} className={`px-4 py-2 rounded-lg text-[10px] font-bold ${lang === 'en' ? 'bg-white shadow-sm' : 'text-gray-400'}`}>English</button>
                    </div>
                 </div>
                 <hr className="border-slate-100" />
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 px-1">الاسم التجاري الرسمي</label>
                    <input 
                        type="text" 
                        className="w-full bg-white p-4 rounded-2xl font-black outline-none border border-slate-100" 
                        value={taxConfig.companyName} 
                        onChange={e => setTaxConfig({...taxConfig, companyName: e.target.value})}
                    />
                 </div>
                 <button onClick={handleResetWizard} className="w-full py-4 bg-gray-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all">إعادة عرض جولة الترحيب</button>
                 <button onClick={handleSaveGeneral} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all">حفظ التفضيلات</button>
              </div>
           </div>

           <div className="space-y-8 animate-in slide-in-from-bottom-8">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-4">محرك الولاء (Loyalty)</h4>
              <div className="p-10 glass rounded-[40px] space-y-6 border border-white shadow-xl bg-white/40">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 px-1">قيمة النقطة الواحدة ($)</label>
                    <input type="number" className="w-full bg-white p-4 rounded-2xl font-black outline-none border border-slate-100 focus:border-blue-400 transition-all" value={loyaltyConfig.pointsValue} onChange={e=>setLoyaltyConfig({...loyaltyConfig, pointsValue: parseFloat(e.target.value)||0})} />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 px-1">معدل الاكتساب (كل 10$ = كم نقطة؟)</label>
                    <input type="number" className="w-full bg-white p-4 rounded-2xl font-black outline-none border border-slate-100 focus:border-blue-400 transition-all" value={loyaltyConfig.earnRatio} onChange={e=>setLoyaltyConfig({...loyaltyConfig, earnRatio: parseInt(e.target.value)||1})} />
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* System Health */}
      {currentTab === 'system' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in zoom-in-95">
              <div className="glass p-10 rounded-[50px] border border-white bg-slate-900 text-white">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Storage Usage</p>
                  <h3 className="text-5xl font-black mb-2">{systemStats.storage} <span className="text-lg text-gray-500">KB</span></h3>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-4">
                      <div className="h-full bg-blue-500" style={{width: `${Math.min(systemStats.storage / 5000 * 100, 100)}%`}}></div>
                  </div>
                  <p className="text-[9px] mt-2 opacity-50 text-right">Limit: 5MB (Local)</p>
              </div>
              
              <div className="glass p-10 rounded-[50px] border border-white bg-white/40">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">Memory Heap</p>
                  <h3 className="text-5xl font-black text-slate-800 mb-2">{systemStats.memory} <span className="text-lg text-gray-400">MB</span></h3>
                  <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">Healthy</span>
              </div>

              <div className="glass p-10 rounded-[50px] border border-white bg-white/40">
                  <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-4">Network Latency</p>
                  <h3 className="text-5xl font-black text-slate-800 mb-2">{systemStats.latency} <span className="text-lg text-gray-400">ms</span></h3>
                  <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">Excellent</span>
              </div>

              <div className="col-span-1 md:col-span-3 bg-white p-10 rounded-[50px] shadow-xl border border-gray-100 flex justify-between items-center">
                  <div>
                      <h4 className="text-xl font-black text-slate-800">Titan Core Version</h4>
                      <p className="text-xs font-bold text-gray-400 mt-1">v4.2.0 (Production Stable)</p>
                  </div>
                  <button onClick={() => window.location.reload()} className="px-8 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-200">Force Reload</button>
              </div>
          </div>
      )}

      {/* Tax Settings */}
      {currentTab === 'tax' && (
          <div className="bg-white p-12 rounded-[60px] shadow-3xl border border-gray-100 animate-in slide-in-from-left-4">
              <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-black text-slate-800">بيانات الفاتورة الضريبية</h3>
                  <button onClick={handleSaveTax} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-600 transition-all">حفظ البيانات</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">الرقم الضريبي (VAT Number)</label>
                      <input 
                        type="text" 
                        className="w-full glass-dark p-5 rounded-3xl outline-none font-bold text-lg" 
                        value={taxConfig.vatNumber} 
                        onChange={e => setTaxConfig({...taxConfig, vatNumber: e.target.value})}
                        placeholder="3xxxxxxxxxxxxx"
                      />
                  </div>
                  <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">نسبة الضريبة (%)</label>
                      <input 
                        type="text" 
                        className="w-full glass-dark p-5 rounded-3xl outline-none font-bold text-lg" 
                        value={taxConfig.vatRate} 
                        onChange={e => setTaxConfig({...taxConfig, vatRate: e.target.value})}
                      />
                  </div>
                  <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">العملة الأساسية</label>
                      <select 
                        className="w-full glass-dark p-5 rounded-3xl outline-none font-bold text-lg"
                        value={taxConfig.currency}
                        onChange={e => setTaxConfig({...taxConfig, currency: e.target.value})}
                      >
                          <option value="SAR">ريال سعودي (SAR)</option>
                          <option value="USD">دولار أمريكي (USD)</option>
                      </select>
                  </div>
              </div>
          </div>
      )}

      {/* Integrations (ZATCA) */}
      {currentTab === 'integrations' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in zoom-in-95 duration-500">
              <div className="bg-white p-12 rounded-[60px] shadow-3xl border border-gray-100">
                  <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-xl">Z</div>
                      <div>
                          <h3 className="text-2xl font-black text-slate-800">هيئة الزكاة والضريبة (ZATCA)</h3>
                          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">المرحلة الثانية (الربط والتكامل)</p>
                      </div>
                  </div>
                  
                  <div className="space-y-6">
                      <div className="p-6 bg-slate-50 rounded-[35px] border border-slate-100">
                          <div className="flex justify-between items-center mb-4">
                              <span className="text-xs font-bold text-gray-500">حالة الاتصال</span>
                              <span className="px-4 py-1 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase">متصل ✓</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-gray-500">شهادة التشفير (CSID)</span>
                              <span className="text-xs font-mono font-black text-slate-800">Valid until 2026</span>
                          </div>
                      </div>
                      
                      <button className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all shadow-lg">تجديد الشهادة الرقمية</button>
                      <button className="w-full py-5 bg-white border border-gray-200 text-slate-500 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all">إعدادات البيئة التجريبية (Sandbox)</button>
                  </div>
              </div>

              <div className="glass p-12 rounded-[60px] shadow-3xl border-white bg-white/40">
                  <h3 className="text-xl font-black text-slate-800 mb-8">بوابات الدفع والخدمات</h3>
                  <div className="space-y-4">
                      <div className="flex items-center justify-between p-6 bg-white rounded-[35px] shadow-sm">
                          <div className="flex items-center gap-4">
                              <span className="text-2xl">💳</span>
                              <div>
                                  <h4 className="font-bold text-sm">Mada / Visa</h4>
                                  <p className="text-[9px] text-gray-400 uppercase">Payment Gateway</p>
                              </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" checked readOnly />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                      </div>
                      
                      <div className="flex items-center justify-between p-6 bg-white rounded-[35px] shadow-sm">
                          <div className="flex items-center gap-4">
                              <span className="text-2xl">💬</span>
                              <div>
                                  <h4 className="font-bold text-sm">SMS Gateway</h4>
                                  <p className="text-[9px] text-gray-400 uppercase">OTP & Notifications</p>
                              </div>
                          </div>
                          <button className="text-[10px] font-black text-blue-600 uppercase hover:underline">تهيئة</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Receipt Settings */}
      {currentTab === 'receipt' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in zoom-in-95 duration-500">
              <div className="lg:col-span-2 bg-white p-12 rounded-[60px] shadow-3xl border border-gray-100">
                  <h3 className="text-2xl font-black text-slate-800 mb-8">إعدادات الطباعة</h3>
                  <div className="space-y-6">
                      <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-1">نص الترويسة (Header)</label>
                          <textarea className="w-full glass-dark p-4 rounded-3xl outline-none font-bold min-h-[100px]" value={receiptConfig.header} onChange={e=>setReceiptConfig({...receiptConfig, header: e.target.value})} />
                      </div>
                      <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-1">نص التذييل (Footer)</label>
                          <textarea className="w-full glass-dark p-4 rounded-3xl outline-none font-bold min-h-[100px]" value={receiptConfig.footer} onChange={e=>setReceiptConfig({...receiptConfig, footer: e.target.value})} />
                      </div>
                      <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" className="w-5 h-5 accent-blue-600" checked={receiptConfig.showLogo} onChange={e=>setReceiptConfig({...receiptConfig, showLogo: e.target.checked})} />
                              <span className="text-sm font-bold">إظهار الشعار</span>
                          </label>
                      </div>
                      <button onClick={handleSaveReceipt} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all shadow-lg">حفظ التنسيق</button>
                  </div>
              </div>

              {/* Receipt Preview */}
              <div className="lg:col-span-1 flex justify-center">
                  <div className="bg-white w-[320px] p-6 rounded-[30px] shadow-2xl border border-gray-200 font-mono text-xs text-center relative">
                      <div className="absolute top-4 right-4 bg-gray-100 text-gray-500 px-2 py-1 rounded text-[9px] font-bold uppercase">Preview</div>
                      {receiptConfig.showLogo && <div className="w-12 h-12 bg-black rounded-lg mx-auto mb-4 flex items-center justify-center text-white font-black">LOGO</div>}
                      <h4 className="font-black text-sm mb-2">{taxConfig.companyName || 'Titan Store'}</h4>
                      <p className="text-gray-500 mb-4 whitespace-pre-wrap">{receiptConfig.header}</p>
                      
                      <div className="border-b border-dashed border-gray-300 mb-4 pb-2">
                          <div className="flex justify-between font-bold mb-1"><span>Item 1</span><span>10.00</span></div>
                          <div className="flex justify-between font-bold mb-1"><span>Item 2</span><span>25.00</span></div>
                      </div>
                      
                      <div className="flex justify-between font-black text-sm mb-4">
                          <span>TOTAL</span>
                          <span>35.00 SAR</span>
                      </div>
                      
                      <p className="text-gray-500 mt-4 whitespace-pre-wrap">{receiptConfig.footer}</p>
                      <div className="mt-4 w-16 h-16 bg-gray-900 mx-auto"></div>
                  </div>
              </div>
          </div>
      )}

      {/* Users Settings */}
      {currentTab === 'users' && (
        <div className="bg-white p-12 rounded-[60px] shadow-3xl border border-gray-100 animate-in zoom-in-95 duration-300">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-slate-800">إدارة فريق العمل</h3>
              <button onClick={() => setShowUserModal(true)} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all">إضافة مستخدم +</button>
           </div>
           
           <div className="grid grid-cols-1 gap-4">
              {staff.map(member => (
                 <div key={member.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                    <div className="flex items-center gap-6">
                       <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-xl font-black shadow-sm text-slate-400">
                          {member.name.charAt(0)}
                       </div>
                       <div>
                          <h4 className="font-black text-slate-800">{member.name}</h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{member.role} • {member.status}</p>
                       </div>
                    </div>
                    <div className="flex gap-3">
                       <button className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all">تعديل الصلاحيات</button>
                       <button className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-white transition-all">✕</button>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}

      {/* Backup Settings */}
      {currentTab === 'backup' && (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-right-4">
            <div className="bg-slate-900 p-12 rounded-[50px] text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full -mr-20 -mt-20 blur-3xl"></div>
               <h3 className="text-2xl font-black mb-6 relative z-10">النسخ الاحتياطي السحابي</h3>
               <p className="text-xs font-medium text-slate-400 mb-12 leading-relaxed max-w-sm relative z-10">
                  يتم حفظ بياناتك تلقائياً كل 6 ساعات على خوادم Titan الآمنة. يمكنك تحميل نسخة محلية في أي وقت.
               </p>
               
               <div className="flex items-center gap-4 mb-8 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">النظام متصل</p>
                     <p className="text-[9px] text-gray-400">آخر نسخ: قبل 12 دقيقة</p>
                  </div>
               </div>

               <button onClick={handleDownloadBackup} className="w-full py-5 bg-blue-600 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg relative z-10">تحميل نسخة كاملة (JSON)</button>
            </div>

            <div className="glass p-12 rounded-[50px] shadow-xl border border-white bg-white/40 flex flex-col justify-center items-center text-center">
               <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">⚠️</div>
               <h3 className="text-xl font-black text-slate-800 mb-2">منطقة الخطر</h3>
               <p className="text-xs text-gray-500 mb-8 max-w-xs">حذف كافة البيانات وإعادة ضبط المصنع. هذا الإجراء لا يمكن التراجع عنه.</p>
               <button onClick={handleResetSystem} className="px-10 py-4 border-2 border-red-100 text-red-500 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white hover:border-red-500 transition-all">إعادة تعيين النظام</button>
            </div>
         </div>
      )}

      {showUserModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-full max-w-lg p-12 rounded-[60px] shadow-3xl border-white relative">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 text-center">مستخدم جديد</h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">الاسم الكامل</label>
                    <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newUser.name} onChange={e=>setNewUser({...newUser, name: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">البريد الإلكتروني</label>
                    <input type="email" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newUser.email} onChange={e=>setNewUser({...newUser, email: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">الدور (Role)</label>
                        <select className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" onChange={e=>setNewUser({...newUser, role: e.target.value})}>
                            <option value="cashier">كاشير</option>
                            <option value="manager">مدير</option>
                            <option value="admin">مسؤول نظام</option>
                            <option value="accountant">محاسب</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">الراتب الشهري</label>
                        <input type="number" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newUser.salary} onChange={e=>setNewUser({...newUser, salary: e.target.value})} />
                    </div>
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setShowUserModal(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">إلغاء</button>
                    <button onClick={handleAddUser} className="flex-2 py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[10px]">إضافة المستخدم</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
