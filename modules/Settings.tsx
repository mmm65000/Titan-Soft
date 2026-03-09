
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../AppContext';
import { UserRole, Staff, SystemConfig } from '../types';

const Settings: React.FC = () => {
  const { 
    lang, setLang, activeTab, staff, user, customers, suppliers, 
    addStaff, updateStaff, deleteStaff, addLog, resetSystem, 
    addToast, activityLogs, setUser 
  } = useApp();
  
  const getInitialTab = () => {
    if (activeTab === 'settings_users') return 'users';
    if (activeTab === 'settings_backup') return 'backup';
    return 'general';
  };

  const [currentTab, setCurrentTab] = useState<'general' | 'loyalty' | 'notifications' | 'users' | 'backup' | 'tax' | 'receipt' | 'integrations' | 'system' | 'audit'>('general');
  
  // -- Configurations State --
  const [config, setConfig] = useState<SystemConfig>({
      loyalty: { enabled: true, pointsValue: 0.1, earnRatio: 1, minRedeem: 50 },
      tax: { vatNumber: '', vatRate: 15, currency: 'SAR', companyName: '', zatcaPhase: 'phase2' },
      receipt: { header: 'Welcome to Titan', footer: 'Thank you for your visit', showLogo: true, showQr: true, paperSize: '80mm', autoPrint: false },
      integrations: {
          sms: { provider: 'twilio', apiKey: '', senderId: 'Titan', enabled: false },
          payment: { provider: 'stripe', merchantId: '', secretKey: '', enabled: false },
          whatsapp: { apiKey: '', instanceId: '', enabled: false }
      },
      bankAccount: { bankName: '', iban: '', accountName: '', swift: '' }
  });

  const [companyInfo, setCompanyInfo] = useState({
      name: '', phone: '', email: '', website: '', crNumber: '',
      address: { building: '', street: '', district: '', city: '', postal: '', country: 'Saudi Arabia' },
      social: { twitter: '', instagram: '', linkedin: '' },
      branding: { primaryColor: '#3b82f6', theme: 'light', logo: '' }
  });

  const [notificationSettings, setNotificationSettings] = useState({
      lowStock: { email: true, sms: false, system: true },
      newOrder: { email: false, sms: true, system: true },
      endOfDay: { email: true, sms: false, system: false },
      newTicket: { email: true, sms: false, system: true }
  });

  // -- UI States --
  const [systemStats, setSystemStats] = useState({ storage: 0, memory: 0, latency: 0, dbSize: '12.4 MB', lastBackup: '2 hours ago' });
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Staff | null>(null);
  const [userForm, setUserForm] = useState({ name: '', role: 'cashier', salary: '', email: '' });
  const [auditSearch, setAuditSearch] = useState('');
  const [testingConn, setTestingConn] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  // Load initial data
  useEffect(() => {
    if(activeTab.startsWith('settings')) setCurrentTab(getInitialTab());
    
    const savedConfig = localStorage.getItem('titan_system_config');
    if(savedConfig) setConfig(JSON.parse(savedConfig));
    else if(user?.businessName) setConfig(prev => ({...prev, tax: {...prev.tax, companyName: user.businessName || ''}}));

    const savedCompanyInfo = localStorage.getItem('titan_company_info');
    if(savedCompanyInfo) setCompanyInfo(JSON.parse(savedCompanyInfo));

    // Check System Stats (Mock Logic)
    if(currentTab === 'system') {
        const usage = JSON.stringify(localStorage).length / 1024;
        const perf = performance as any;
        setSystemStats(prev => ({
            ...prev,
            storage: Math.round(usage),
            memory: Math.round(perf.memory?.usedJSHeapSize / 1024 / 1024 || 50),
            latency: Math.floor(Math.random() * 50) + 20
        }));
    }
  }, [activeTab, currentTab, user]);

  // -- Action Handlers --

  const saveConfig = () => {
      localStorage.setItem('titan_system_config', JSON.stringify(config));
      localStorage.setItem('titan_company_info', JSON.stringify(companyInfo));
      addLog('System settings updated', 'success', 'Settings');
      addToast('تم حفظ الإعدادات وتطبيق التغييرات بنجاح ✅', 'success');
  };

  const handleMaintenanceAction = (action: string) => {
      addToast(`جاري تنفيذ: ${action}...`, 'info');
      // Simulate Async Task
      setTimeout(() => {
          if (action === 'Clear Cache') {
              // Safe clear
              sessionStorage.clear();
          }
          addToast(`تم تنفيذ ${action} بنجاح`, 'success');
          addLog(`System Maintenance: ${action}`, 'warning', 'System');
      }, 2000);
  };

  // -- User Management --
  const openUserModal = (userToEdit?: Staff) => {
      if (userToEdit) {
          setEditingUser(userToEdit);
          setUserForm({
              name: userToEdit.name,
              role: userToEdit.role,
              salary: userToEdit.salary.toString(),
              email: '' 
          });
      } else {
          setEditingUser(null);
          setUserForm({ name: '', role: 'cashier', salary: '', email: '' });
      }
      setShowUserModal(true);
  };

  const handleSaveUser = () => {
      if(!userForm.name || !userForm.salary) return addToast('يرجى تعبئة كافة الحقول', 'error');
      
      if (editingUser) {
          updateStaff(editingUser.id, {
              name: userForm.name,
              role: userForm.role,
              salary: parseFloat(userForm.salary) || 0
          });
          addLog(`Updated user: ${userForm.name}`, 'info', 'Settings');
      } else {
          const s = {
              id: `USR-${Date.now()}`,
              name: userForm.name,
              role: userForm.role,
              salary: parseFloat(userForm.salary) || 0,
              joinDate: new Date().toISOString().split('T')[0],
              status: 'active' as const,
              attendance: []
          };
          addStaff(s);
          addLog(`New user added: ${userForm.name} (${userForm.role})`, 'success', 'Settings');
      }
      setShowUserModal(false);
      addToast('تم حفظ بيانات المستخدم بنجاح', 'success');
  };

  const handleDeleteUser = (id: string) => {
      if(confirm('هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.')) {
          deleteStaff(id);
          addLog(`User deleted: ${id}`, 'warning', 'Settings');
          addToast('تم حذف المستخدم وإلغاء صلاحياته', 'info');
      }
  };

  // -- Backup & Restore --
  const handleDownloadBackup = () => {
    const data = {
        timestamp: new Date().toISOString(),
        version: "4.5.0",
        system: "Titan ERP",
        staff,
        config,
        customers,
        suppliers,
        // Add other critical data here
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `titan_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog('System backup downloaded', 'success', 'System');
    addToast('تم تحميل النسخة الاحتياطية بنجاح', 'success');
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const data = JSON.parse(event.target?.result as string);
              if (data.system !== "Titan ERP") throw new Error("Invalid Backup File");
              
              if(confirm(`هل أنت متأكد من استعادة النسخة بتاريخ ${new Date(data.timestamp).toLocaleString()}؟ سيتم استبدال الإعدادات الحالية.`)) {
                  // Restore Logic (Simple simulation for settings)
                  setConfig(data.config);
                  addLog('System restored from backup', 'warning', 'System');
                  addToast('تم استعادة النظام بنجاح. يرجى تحديث الصفحة.', 'success');
                  setTimeout(() => window.location.reload(), 2000);
              }
          } catch (err) {
              addToast("ملف النسخ الاحتياطي غير صالح أو تالف.", 'error');
          }
      };
      reader.readAsText(file);
  };

  const handleResetSystem = () => {
      const pin = prompt("للتأكيد، أدخل رقم التعريف الشخصي للأمان (PIN):"); // Mock check
      if (pin === '1234') { // Should match real user PIN
          if(confirm('⚠️ تحذير شديد الخطورة: هل أنت متأكد من حذف كافة البيانات وإعادة ضبط المصنع؟')) {
              resetSystem();
          }
      } else {
          addToast('رمز الأمان غير صحيح', 'error');
      }
  };

  // -- Logo Upload --
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setUploadingLogo(true);
          // Simulate upload delay
          const reader = new FileReader();
          reader.onloadend = () => {
              setCompanyInfo(prev => ({ ...prev, branding: { ...prev.branding, logo: reader.result as string } }));
              setUploadingLogo(false);
              addToast('تم تحديث شعار المؤسسة بنجاح', 'success');
          };
          reader.readAsDataURL(file);
      }
  };

  // -- Integration Testing --
  const handleTestConnection = (provider: string) => {
      setTestingConn(provider);
      setTimeout(() => {
          setTestingConn(null);
          const success = Math.random() > 0.3; // Random success for demo
          if (success) addToast(`الاتصال بـ ${provider} ناجح ✅`, 'success');
          else addToast(`فشل الاتصال بـ ${provider} ❌ تحقق من مفاتيح API`, 'error');
      }, 2000);
  };

  // -- UI Components --
  const tabs = [
    { id: 'general', label: 'عام وتخصيص', icon: '🏢' },
    { id: 'tax', label: 'البيانات المالية', icon: '💵' },
    { id: 'loyalty', label: 'الولاء والمكافآت', icon: '🎁' },
    { id: 'notifications', label: 'التنبيهات', icon: '🔔' },
    { id: 'receipt', label: 'الطباعة', icon: '🖨️' },
    { id: 'integrations', label: 'الربط (API)', icon: '🔌' },
    { id: 'users', label: 'المستخدمين', icon: '👥' },
    { id: 'system', label: 'صيانة النظام', icon: '⚙️' },
    { id: 'audit', label: 'سجل التدقيق', icon: '📝' },
    { id: 'backup', label: 'نسخ احتياطي', icon: '💾' }
  ];

  return (
    <div className="space-y-8 md:space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">إعدادات النظام المركزية</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">System Configuration & Control Panel</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="glass rounded-[2.5rem] p-2 shadow-md border-white/50 overflow-x-auto custom-scrollbar">
        <div className="flex gap-2 min-w-max">
            {tabs.map(tab => (
                <button 
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as any)}
                className={`px-6 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${currentTab === tab.id ? 'bg-slate-900 text-white shadow-lg scale-105' : 'text-slate-500 hover:bg-white/50 hover:text-slate-800'}`}
                >
                <span className="text-sm">{tab.icon}</span>
                {tab.label}
                </button>
            ))}
        </div>
      </div>

      {/* General Settings */}
      {currentTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Basic Info */}
           <div className="lg:col-span-2 bg-white p-8 md:p-12 rounded-[40px] md:rounded-[50px] shadow-2xl border border-gray-100">
              <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                  <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                  بيانات المنشأة والهوية
              </h3>
              <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase block mb-2 px-1">اسم المنشأة (عربي)</label>
                        <input type="text" className="w-full glass-dark p-4 rounded-2xl outline-none font-bold" value={config.tax.companyName} onChange={e=>setConfig({...config, tax: {...config.tax, companyName: e.target.value}})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase block mb-2 px-1">رقم السجل التجاري (CR)</label>
                        <input type="text" className="w-full glass-dark p-4 rounded-2xl outline-none font-bold dir-ltr" value={companyInfo.crNumber} onChange={e=>setCompanyInfo({...companyInfo, crNumber: e.target.value})} />
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase block mb-2 px-1">البريد الإلكتروني</label>
                        <input type="email" className="w-full glass-dark p-4 rounded-2xl outline-none font-bold dir-ltr" value={companyInfo.email} onChange={e=>setCompanyInfo({...companyInfo, email: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase block mb-2 px-1">رقم الهاتف</label>
                        <input type="text" className="w-full glass-dark p-4 rounded-2xl outline-none font-bold dir-ltr" value={companyInfo.phone} onChange={e=>setCompanyInfo({...companyInfo, phone: e.target.value})} />
                    </div>
                 </div>
                 
                 <hr className="border-gray-100 my-4" />
                 <h4 className="text-sm font-black text-slate-600 mb-4">العنوان الوطني (ZATCA Requirement)</h4>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <input type="text" className="glass-dark p-4 rounded-2xl font-bold text-xs" value={companyInfo.address.building} onChange={e=>setCompanyInfo({...companyInfo, address: {...companyInfo.address, building: e.target.value}})} placeholder="رقم المبنى" />
                    <input type="text" className="glass-dark p-4 rounded-2xl font-bold text-xs" value={companyInfo.address.street} onChange={e=>setCompanyInfo({...companyInfo, address: {...companyInfo.address, street: e.target.value}})} placeholder="الشارع" />
                    <input type="text" className="glass-dark p-4 rounded-2xl font-bold text-xs" value={companyInfo.address.district} onChange={e=>setCompanyInfo({...companyInfo, address: {...companyInfo.address, district: e.target.value}})} placeholder="الحي" />
                    <input type="text" className="glass-dark p-4 rounded-2xl font-bold text-xs" value={companyInfo.address.city} onChange={e=>setCompanyInfo({...companyInfo, address: {...companyInfo.address, city: e.target.value}})} placeholder="المدينة" />
                    <input type="text" className="glass-dark p-4 rounded-2xl font-bold text-xs" value={companyInfo.address.postal} onChange={e=>setCompanyInfo({...companyInfo, address: {...companyInfo.address, postal: e.target.value}})} placeholder="الرمز البريدي" />
                    <input type="text" className="glass-dark p-4 rounded-2xl font-bold text-xs" placeholder="الرقم الإضافي" />
                 </div>
              </div>
           </div>

           {/* Branding & Social */}
           <div className="lg:col-span-1 space-y-8">
              <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-white/40">
                 <h4 className="text-sm font-black text-slate-800 mb-6">تخصيص المظهر</h4>
                 <div className="flex justify-center mb-6">
                    <input type="file" accept="image/*" className="hidden" ref={logoInputRef} onChange={handleLogoUpload} />
                    <div 
                        onClick={() => logoInputRef.current?.click()}
                        className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center border-4 border-white shadow-inner cursor-pointer hover:bg-slate-200 transition-colors overflow-hidden group"
                    >
                        {uploadingLogo ? (
                            <div className="animate-spin text-2xl">⚙️</div>
                        ) : companyInfo.branding.logo ? (
                            <img src={companyInfo.branding.logo} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-2xl opacity-50 group-hover:scale-110 transition-transform">📷</span>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-[10px] font-bold uppercase">رفع شعار</span>
                        </div>
                    </div>
                 </div>
                 <div className="space-y-4">
                     <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">لون النظام الأساسي</label>
                        <div className="flex gap-2">
                            {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0f172a'].map(c => (
                                <button 
                                    key={c}
                                    onClick={() => setCompanyInfo({...companyInfo, branding: {...companyInfo.branding, primaryColor: c}})}
                                    className={`w-8 h-8 rounded-full border-2 transition-transform ${companyInfo.branding.primaryColor === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: c }}
                                ></button>
                            ))}
                        </div>
                     </div>
                     <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">لغة الواجهة</label>
                        <div className="flex bg-slate-50 p-1 rounded-2xl">
                            <button onClick={() => setLang('ar')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${lang === 'ar' ? 'bg-white shadow-sm text-slate-900' : 'text-gray-400'}`}>العربية</button>
                            <button onClick={() => setLang('en')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${lang === 'en' ? 'bg-white shadow-sm text-slate-900' : 'text-gray-400'}`}>English</button>
                        </div>
                     </div>
                 </div>
              </div>

              <button onClick={saveConfig} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-emerald-600 transition-all">حفظ وتطبيق</button>
           </div>
        </div>
      )}

      {/* Loyalty Settings */}
      {currentTab === 'loyalty' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-left-4">
              <div className="bg-white p-12 rounded-[50px] shadow-2xl border border-gray-100">
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-black text-slate-800">برنامج الولاء والنقاط</h3>
                      <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={config.loyalty.enabled} onChange={e => setConfig({...config, loyalty: {...config.loyalty, enabled: e.target.checked}})} />
                          <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                  </div>
                  
                  <div className={`space-y-8 ${!config.loyalty.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                      <div className="p-6 bg-purple-50 rounded-[30px] border border-purple-100">
                          <div className="flex justify-between items-center mb-4">
                              <span className="text-xs font-black text-purple-900">معدل الاكتساب (Earning)</span>
                              <span className="text-lg font-black text-purple-600">1 ريال = {config.loyalty.earnRatio} نقطة</span>
                          </div>
                          <input 
                            type="range" min="0.1" max="10" step="0.1" 
                            className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                            value={config.loyalty.earnRatio}
                            onChange={e => setConfig({...config, loyalty: {...config.loyalty, earnRatio: parseFloat(e.target.value)}})}
                          />
                      </div>

                      <div className="p-6 bg-emerald-50 rounded-[30px] border border-emerald-100">
                          <div className="flex justify-between items-center mb-4">
                              <span className="text-xs font-black text-emerald-900">قيمة النقطة (Redemption)</span>
                              <span className="text-lg font-black text-emerald-600">1 نقطة = {config.loyalty.pointsValue} ريال</span>
                          </div>
                          <input 
                            type="number" 
                            className="w-full bg-white p-3 rounded-xl font-black text-center border border-emerald-200 outline-none"
                            value={config.loyalty.pointsValue}
                            onChange={e => setConfig({...config, loyalty: {...config.loyalty, pointsValue: parseFloat(e.target.value)}})}
                          />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                          <span className="text-xs font-bold text-gray-500">الحد الأدنى للاستبدال</span>
                          <input 
                            type="number" 
                            className="w-24 bg-white p-2 rounded-lg font-black text-center outline-none"
                            value={config.loyalty.minRedeem}
                            onChange={e => setConfig({...config, loyalty: {...config.loyalty, minRedeem: parseInt(e.target.value)}})}
                          />
                          <span className="text-xs font-bold text-gray-400">نقطة</span>
                      </div>
                  </div>
              </div>

              <div className="glass p-12 rounded-[50px] shadow-2xl border-white bg-purple-900 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                  <h3 className="text-2xl font-black mb-6 relative z-10">محاكاة العميل</h3>
                  <div className="space-y-6 relative z-10">
                      <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl border border-white/10">
                          <span className="text-xs font-medium opacity-80">عند شراء منتج بقيمة</span>
                          <span className="font-black text-xl">$100.00</span>
                      </div>
                      <div className="flex justify-center text-2xl">⬇</div>
                      <div className="flex justify-between items-center bg-white/20 p-6 rounded-[30px] border border-white/20 backdrop-blur-md">
                          <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-purple-200">النقاط المكتسبة</p>
                              <h4 className="text-4xl font-black">{100 * config.loyalty.earnRatio}</h4>
                          </div>
                          <div className="text-right">
                              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300">القيمة النقدية</p>
                              <h4 className="text-2xl font-black">${(100 * config.loyalty.earnRatio * config.loyalty.pointsValue).toFixed(2)}</h4>
                          </div>
                      </div>
                      <p className="text-center text-[10px] opacity-60 mt-4">Cashback Equivalent: {((config.loyalty.earnRatio * config.loyalty.pointsValue) * 100).toFixed(1)}%</p>
                  </div>
                  <button onClick={saveConfig} className="w-full py-4 bg-white text-purple-900 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl mt-10 hover:bg-purple-100 transition-all">حفظ إعدادات الولاء</button>
              </div>
          </div>
      )}

      {/* Notifications Matrix */}
      {currentTab === 'notifications' && (
          <div className="bg-white p-12 rounded-[50px] shadow-2xl border border-gray-100 animate-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-black text-slate-800">مصفوفة التنبيهات الذكية</h3>
                  <button onClick={saveConfig} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">حفظ التفضيلات</button>
              </div>
              
              <div className="rounded-[30px] border border-gray-100 overflow-hidden">
                  <table className="w-full text-right">
                      <thead className="bg-slate-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          <tr>
                              <th className="p-6">الحدث (Event Trigger)</th>
                              <th className="p-6 text-center">📧 البريد الإلكتروني</th>
                              <th className="p-6 text-center">📱 رسائل نصية (SMS)</th>
                              <th className="p-6 text-center">🔔 تنبيه النظام</th>
                              <th className="p-6 text-center">تجربة</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-sm font-bold text-slate-700">
                          {[
                              { key: 'lowStock', label: 'انخفاض المخزون عن الحد الأدنى' },
                              { key: 'newOrder', label: 'استلام طلب جديد (أونلاين)' },
                              { key: 'endOfDay', label: 'تقرير الإغلاق اليومي (Z-Report)' },
                              { key: 'newTicket', label: 'تذكرة دعم فني جديدة' }
                          ].map(row => (
                              <tr key={row.key} className="hover:bg-blue-50/20 transition-colors">
                                  <td className="p-6">{row.label}</td>
                                  {['email', 'sms', 'system'].map(channel => (
                                      <td key={channel} className="p-6 text-center">
                                          <input 
                                            type="checkbox" 
                                            className="w-5 h-5 accent-blue-600 cursor-pointer"
                                            checked={(notificationSettings as any)[row.key][channel]}
                                            onChange={e => setNotificationSettings({
                                                ...notificationSettings,
                                                [row.key]: { ...(notificationSettings as any)[row.key], [channel]: e.target.checked }
                                            })}
                                          />
                                      </td>
                                  ))}
                                  <td className="p-6 text-center">
                                      <button 
                                        onClick={() => addToast(`Test Notification sent for: ${row.label}`, 'info')}
                                        className="text-[10px] bg-slate-100 px-3 py-1 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                                      >
                                          إرسال تجريبي 🚀
                                      </button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
              <p className="text-[10px] text-gray-400 mt-6 font-bold">* قد تطبق رسوم إضافية على رسائل SMS حسب الباقة المفعلة.</p>
          </div>
      )}

      {/* System Maintenance */}
      {currentTab === 'system' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in zoom-in-95">
              <div className="glass p-10 rounded-[50px] border border-white bg-slate-900 text-white">
                  <h3 className="text-2xl font-black mb-8">حالة النظام (Health Check)</h3>
                  <div className="space-y-6">
                      <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                          <span className="text-xs font-bold text-gray-300">Storage Usage</span>
                          <span className="text-xl font-black">{systemStats.storage} KB / 5MB</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                          <span className="text-xs font-bold text-gray-300">Memory Heap</span>
                          <span className="text-xl font-black">{systemStats.memory} MB</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                          <span className="text-xs font-bold text-gray-300">Network Latency</span>
                          <span className="text-xl font-black text-emerald-400">{systemStats.latency} ms</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-4">
                          <div className="h-full bg-emerald-500" style={{width: '98%'}}></div>
                      </div>
                      <p className="text-center text-[10px] font-black uppercase tracking-widest opacity-60">System Healthy</p>
                  </div>
              </div>
              
              <div className="glass p-10 rounded-[50px] border border-white bg-white/40">
                  <h3 className="text-2xl font-black text-slate-800 mb-8">أدوات الصيانة</h3>
                  <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => handleMaintenanceAction('Clear Cache')} className="p-6 bg-white rounded-[2rem] border border-gray-100 hover:shadow-lg transition-all group">
                          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🧹</div>
                          <span className="text-xs font-black text-slate-700">تنظيف الكاش</span>
                      </button>
                      <button onClick={() => handleMaintenanceAction('Re-index DB')} className="p-6 bg-white rounded-[2rem] border border-gray-100 hover:shadow-lg transition-all group">
                          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🗄️</div>
                          <span className="text-xs font-black text-slate-700">فهرسة البيانات</span>
                      </button>
                      <button onClick={() => handleMaintenanceAction('Optimize Images')} className="p-6 bg-white rounded-[2rem] border border-gray-100 hover:shadow-lg transition-all group">
                          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🖼️</div>
                          <span className="text-xs font-black text-slate-700">ضغط الصور</span>
                      </button>
                      <button onClick={() => handleMaintenanceAction('Check Updates')} className="p-6 bg-white rounded-[2rem] border border-gray-100 hover:shadow-lg transition-all group">
                          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🔄</div>
                          <span className="text-xs font-black text-slate-700">تحديث النظام</span>
                      </button>
                  </div>
                  <div className="mt-8 pt-8 border-t border-white flex justify-center">
                      <button onClick={handleResetSystem} className="text-red-500 font-black text-xs uppercase hover:bg-red-50 px-6 py-2 rounded-xl transition-all border border-transparent hover:border-red-200">⚠️ إعادة ضبط المصنع</button>
                  </div>
              </div>
          </div>
      )}

      {/* Tax Tab */}
      {currentTab === 'tax' && (
          <div className="bg-white p-12 rounded-[50px] shadow-3xl border border-gray-100 animate-in slide-in-from-left-4">
              <h3 className="text-2xl font-black text-slate-800 mb-8">الإعدادات الضريبية (ZATCA)</h3>
              <div className="grid grid-cols-2 gap-8">
                  <div>
                      <label className="text-xs font-bold block mb-2">الرقم الضريبي</label>
                      <input type="text" className="w-full glass-dark p-4 rounded-2xl font-bold" value={config.tax.vatNumber} onChange={e=>setConfig({...config, tax: {...config.tax, vatNumber: e.target.value}})} placeholder="3xxxxxxxxxxxxx" />
                  </div>
                  <div>
                      <label className="text-xs font-bold block mb-2">نسبة الضريبة %</label>
                      <input type="number" className="w-full glass-dark p-4 rounded-2xl font-bold" value={config.tax.vatRate} onChange={e=>setConfig({...config, tax: {...config.tax, vatRate: parseFloat(e.target.value)}})} />
                  </div>
                  <div className="col-span-2 p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-300 text-center cursor-pointer hover:bg-slate-100 transition-all relative">
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => addToast('تم تحميل الشهادة بنجاح', 'success')} />
                      <p className="text-sm font-black text-slate-600">رفع شهادة الفوترة الإلكترونية (CSR / Private Key)</p>
                      <p className="text-[10px] text-gray-400 mt-1">.pem, .key files supported</p>
                  </div>
              </div>
              <div className="mt-8 text-right">
                  <button onClick={saveConfig} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-blue-600 transition-all">حفظ البيانات</button>
              </div>
          </div>
      )}

      {currentTab === 'receipt' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in zoom-in-95">
              <div className="bg-white p-10 rounded-[50px] shadow-xl border border-gray-100">
                  <h3 className="text-xl font-black mb-6">تخصيص الفاتورة</h3>
                  <div className="space-y-4">
                      <textarea className="w-full glass-dark p-4 rounded-2xl font-bold h-24" placeholder="ترويسة الفاتورة..." value={config.receipt.header} onChange={e=>setConfig({...config, receipt: {...config.receipt, header: e.target.value}})} />
                      <textarea className="w-full glass-dark p-4 rounded-2xl font-bold h-24" placeholder="تذييل الفاتورة..." value={config.receipt.footer} onChange={e=>setConfig({...config, receipt: {...config.receipt, footer: e.target.value}})} />
                      <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-3 rounded-xl flex-1">
                              <input type="checkbox" className="accent-blue-600" checked={config.receipt.showQr} onChange={e=>setConfig({...config, receipt: {...config.receipt, showQr: e.target.checked}})} />
                              <span className="text-xs font-bold">QR Code</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-3 rounded-xl flex-1">
                              <input type="checkbox" className="accent-blue-600" checked={config.receipt.autoPrint} onChange={e=>setConfig({...config, receipt: {...config.receipt, autoPrint: e.target.checked}})} />
                              <span className="text-xs font-bold">طباعة تلقائية</span>
                          </label>
                      </div>
                      <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">حجم الورق</label>
                          <select 
                            className="w-full glass-dark p-4 rounded-2xl font-bold outline-none"
                            value={config.receipt.paperSize || '80mm'}
                            onChange={e => setConfig({...config, receipt: {...config.receipt, paperSize: e.target.value as '80mm' | 'A4'}})}
                          >
                              <option value="80mm">Thermal 80mm</option>
                              <option value="A4">Standard A4</option>
                          </select>
                      </div>
                  </div>
              </div>
              <div className="flex justify-center items-center">
                  <div 
                    className={`bg-white shadow-2xl p-6 text-center text-xs font-mono border border-gray-200 relative transition-all duration-300 ${config.receipt.paperSize === 'A4' ? 'w-[210px] min-h-[297px]' : 'w-[300px]'}`}
                  >
                      <div className="absolute top-2 right-2 text-[8px] bg-gray-100 px-2 py-1">PREVIEW</div>
                      {config.receipt.showLogo && <div className="w-16 h-16 bg-black mx-auto mb-4 rounded flex items-center justify-center text-white font-bold">LOGO</div>}
                      <p className="font-bold mb-2">{config.tax.companyName || 'Store Name'}</p>
                      <p className="text-gray-500 mb-4 whitespace-pre-wrap">{config.receipt.header}</p>
                      <div className="border-b border-dashed border-gray-300 mb-2"></div>
                      <div className="flex justify-between font-bold py-1"><span>Item A</span><span>10.00</span></div>
                      <div className="flex justify-between font-bold py-1"><span>Item B</span><span>20.00</span></div>
                      <div className="border-b border-dashed border-gray-300 my-2"></div>
                      <div className="flex justify-between font-black text-sm"><span>TOTAL</span><span>30.00</span></div>
                      <p className="text-gray-500 mt-4 whitespace-pre-wrap">{config.receipt.footer}</p>
                      {config.receipt.showQr && <div className="w-20 h-20 bg-gray-900 mx-auto mt-4"></div>}
                  </div>
              </div>
          </div>
      )}

      {currentTab === 'integrations' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-white/40">
                  <h3 className="text-xl font-black mb-6">بوابة الرسائل (SMS & Email)</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase">مفتاح API (Twilio/Unifonic)</label>
                          <input type="password" className="w-full glass-dark p-4 rounded-2xl font-mono text-xs" value={config.integrations.sms.apiKey} onChange={e=>setConfig({...config, integrations: {...config.integrations, sms: {...config.integrations.sms, apiKey: e.target.value}}})} />
                      </div>
                      <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase">اسم المرسل (Sender ID)</label>
                            <input type="text" className="w-full glass-dark p-4 rounded-2xl font-bold" value={config.integrations.sms.senderId} onChange={e=>setConfig({...config, integrations: {...config.integrations, sms: {...config.integrations.sms, senderId: e.target.value}}})} />
                          </div>
                          <button 
                            onClick={() => handleTestConnection('SMS')} 
                            className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all"
                            title="Test Connection"
                          >
                              {testingConn === 'SMS' ? '⏳' : '⚡'}
                          </button>
                      </div>
                      <div className="p-4 bg-white/50 rounded-2xl border border-white">
                          <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">SMTP Server (Email)</label>
                          <input type="text" placeholder="smtp.gmail.com" className="w-full glass-dark p-3 rounded-xl text-xs mb-2" />
                          <div className="flex gap-2">
                             <input type="text" placeholder="Port: 587" className="w-full glass-dark p-3 rounded-xl text-xs" />
                             <button onClick={() => handleTestConnection('Email')} className="bg-white border px-4 rounded-xl text-xs font-bold hover:bg-slate-50">Test</button>
                          </div>
                      </div>
                  </div>
              </div>
              <div className="glass p-10 rounded-[50px] shadow-xl border-white bg-white/40">
                  <h3 className="text-xl font-black mb-6">الربط السحابي (Cloud Storage)</h3>
                  <div className="flex flex-col gap-4">
                      <button onClick={() => handleTestConnection('GoogleDrive')} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all active:scale-95">
                          <div className="flex items-center gap-3">
                              <span className="text-xl">📂</span>
                              <span className="font-bold text-sm">Google Drive</span>
                          </div>
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full ${testingConn === 'GoogleDrive' ? 'bg-orange-100 text-orange-500' : 'bg-gray-100 text-gray-500'}`}>
                              {testingConn === 'GoogleDrive' ? 'Connecting...' : 'Connect'}
                          </span>
                      </button>
                      <button onClick={() => handleTestConnection('AWS')} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all active:scale-95">
                          <div className="flex items-center gap-3">
                              <span className="text-xl">☁️</span>
                              <span className="font-bold text-sm">AWS S3</span>
                          </div>
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full ${testingConn === 'AWS' ? 'bg-orange-100 text-orange-500' : 'bg-gray-100 text-gray-500'}`}>
                              {testingConn === 'AWS' ? 'Connecting...' : 'Connect'}
                          </span>
                      </button>
                  </div>
                  <div className="mt-8 pt-8 border-t border-white/50">
                      <h4 className="text-sm font-black mb-4">Webhooks</h4>
                      <input type="text" placeholder="https://your-api.com/webhook" className="w-full glass-dark p-4 rounded-2xl font-mono text-xs" />
                  </div>
              </div>
              <div className="col-span-1 lg:col-span-2 text-right">
                  <button onClick={saveConfig} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all">حفظ إعدادات الربط</button>
              </div>
          </div>
      )}

      {/* Users Settings Reuse */}
      {currentTab === 'users' && (
        <div className="bg-white p-8 md:p-12 rounded-[40px] md:rounded-[60px] shadow-3xl border border-gray-100 animate-in zoom-in-95 duration-300">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-slate-800">إدارة فريق العمل</h3>
              <button onClick={() => openUserModal()} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all">إضافة مستخدم +</button>
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
                       <button onClick={() => openUserModal(member)} className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all">تعديل</button>
                       <button onClick={() => handleDeleteUser(member.id)} className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">✕</button>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}

      {/* Audit Logs Reuse */}
      {currentTab === 'audit' && (
          <div className="bg-white p-6 md:p-10 rounded-[40px] md:rounded-[60px] shadow-3xl border border-gray-100 animate-in slide-in-from-left-4">
              <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-slate-800">سجل النشاطات والتدقيق</h3>
                  <input 
                    type="text" 
                    placeholder="بحث في السجل..." 
                    className="bg-gray-50 border border-gray-100 px-6 py-3 rounded-2xl outline-none text-xs font-bold w-64" 
                    value={auditSearch}
                    onChange={e => setAuditSearch(e.target.value)}
                  />
              </div>
              <div className="rounded-[40px] border border-gray-50 overflow-hidden bg-gray-50/20 max-h-[600px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-right text-xs">
                      <thead className="bg-white border-b border-gray-50 text-gray-400 font-black uppercase tracking-widest sticky top-0 z-10 shadow-sm">
                          <tr>
                              <th className="px-10 py-6">الوقت</th>
                              <th className="px-10 py-6">المستخدم</th>
                              <th className="px-10 py-6">الإجراء</th>
                              <th className="px-10 py-6 text-center">الوحدة</th>
                              <th className="px-10 py-6 text-center">النوع</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-bold text-slate-700">
                          {activityLogs
                            .filter(l => 
                                l.action.toLowerCase().includes(auditSearch.toLowerCase()) || 
                                l.user.toLowerCase().includes(auditSearch.toLowerCase()) ||
                                l.module?.toLowerCase().includes(auditSearch.toLowerCase())
                            )
                            .map((log: any, i) => (
                              <tr key={i} className="hover:bg-white transition-all">
                                  <td className="px-10 py-5 text-gray-400 font-mono text-[10px]">{new Date(log.timestamp).toLocaleString()}</td>
                                  <td className="px-10 py-5">{log.user}</td>
                                  <td className="px-10 py-5">{log.action}</td>
                                  <td className="px-10 py-5 text-center"><span className="bg-slate-100 px-3 py-1 rounded-full text-[9px] uppercase">{log.module}</span></td>
                                  <td className="px-10 py-5 text-center">
                                      <span className={`px-3 py-1 rounded-full text-[9px] uppercase ${
                                          log.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 
                                          log.type === 'warning' ? 'bg-orange-50 text-orange-600' : 
                                          log.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                      }`}>{log.type}</span>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* Backup Tab Reuse */}
      {currentTab === 'backup' && (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-right-4">
            <div className="bg-slate-900 p-12 rounded-[50px] text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full -mr-20 -mt-20 blur-3xl"></div>
               <h3 className="text-2xl font-black mb-6 relative z-10">النسخ الاحتياطي السحابي</h3>
               <p className="text-xs font-medium text-slate-400 mb-12 leading-relaxed max-w-sm relative z-10">
                  يتم حفظ بياناتك تلقائياً. يمكنك تحميل نسخة محلية مشفرة بتنسيق JSON.
               </p>
               <button onClick={handleDownloadBackup} className="w-full py-5 bg-blue-600 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg relative z-10">تحميل نسخة كاملة (JSON)</button>
            </div>

            <div className="glass p-12 rounded-[50px] shadow-xl border border-white bg-white/40 flex flex-col justify-center items-center text-center">
               <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">📥</div>
               <h3 className="text-xl font-black text-slate-800 mb-2">استعادة النظام</h3>
               <p className="text-xs text-gray-500 mb-8 max-w-xs">استيراد بيانات من ملف نسخ احتياطي سابق.</p>
               <input type="file" accept=".json" className="hidden" ref={restoreInputRef} onChange={handleRestoreBackup} />
               <button onClick={() => restoreInputRef.current?.click()} className="px-10 py-4 border-2 border-indigo-100 text-indigo-600 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all">رفع ملف استعادة</button>
            </div>
         </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-full max-w-lg p-12 rounded-[60px] shadow-3xl border-white relative">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 text-center">{editingUser ? 'تعديل بيانات الموظف' : 'مستخدم جديد'}</h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">الاسم الكامل</label>
                    <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={userForm.name} onChange={e=>setUserForm({...userForm, name: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">الدور (Role)</label>
                        <select className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={userForm.role} onChange={e=>setUserForm({...userForm, role: e.target.value})}>
                            <option value="cashier">كاشير</option>
                            <option value="manager">مدير</option>
                            <option value="admin">مسؤول نظام</option>
                            <option value="accountant">محاسب</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">الراتب الشهري</label>
                        <input type="number" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={userForm.salary} onChange={e=>setUserForm({...userForm, salary: e.target.value})} />
                    </div>
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setShowUserModal(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">إلغاء</button>
                    <button onClick={handleSaveUser} className="flex-2 py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[10px]">{editingUser ? 'حفظ التعديلات' : 'إضافة المستخدم'}</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
