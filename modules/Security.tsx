
import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { UserRole, RoleConfig } from '../types';

const Security: React.FC = () => {
  const { roleConfigs, lang, updateRoleConfig, addLog } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>('cashier');
  const [tempConfig, setTempConfig] = useState<RoleConfig | null>(null);

  useEffect(() => {
      const config = roleConfigs.find(r => r.role === selectedRole);
      if (config) setTempConfig(JSON.parse(JSON.stringify(config))); // Deep copy
  }, [selectedRole, roleConfigs]);

  const togglePermission = (module: string, action: 'read' | 'write' | 'delete') => {
      if (!tempConfig) return;
      setTempConfig(prev => {
          if (!prev) return null;
          const newPerms = [...prev.permissions];
          const permIndex = newPerms.findIndex(p => p.module === module);
          if (permIndex > -1) {
              newPerms[permIndex] = { ...newPerms[permIndex], [action]: !newPerms[permIndex][action] };
          } else {
              // Add if not exists
              newPerms.push({ module, read: false, write: false, delete: false, [action]: true });
          }
          return { ...prev, permissions: newPerms };
      });
  };

  const handleSave = () => {
      if (tempConfig) {
          updateRoleConfig(tempConfig);
          addLog(`تم تحديث صلاحيات الدور: ${selectedRole}`, 'warning', 'Security');
          alert('تم تحديث مصفوفة الصلاحيات وحفظها في النظام بنجاح ✅');
      }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end" dir="rtl">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">إدارة الصلاحيات والأمان</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Role-Based Access Control (RBAC) Architecture</p>
        </div>
        <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl shadow-2xl">🛡️</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8" dir="rtl">
         {/* Roles List */}
         <div className="lg:col-span-1 space-y-4">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">الأدوار المتاحة</h4>
            {roleConfigs.map(config => (
               <button 
                key={config.role} 
                onClick={() => setSelectedRole(config.role)}
                className={`w-full p-6 rounded-[2.5rem] text-right font-black transition-all border ${
                   selectedRole === config.role ? 'bg-blue-600 text-white shadow-xl border-blue-500' : 'bg-white text-slate-400 border-gray-100 hover:bg-blue-50'
                }`}
               >
                  <span className="block text-xs capitalize">{config.role}</span>
                  <span className="text-[9px] opacity-60 font-bold">{config.permissions.length} Module Rules</span>
               </button>
            ))}
         </div>

         {/* Permissions Matrix */}
         <div className="lg:col-span-3 glass p-10 rounded-[60px] shadow-3xl border-white bg-white/40">
            {selectedRole && tempConfig ? (
               <div className="space-y-8">
                  <div className="flex justify-between items-center border-b pb-8">
                     <h3 className="text-2xl font-black text-slate-800 tracking-tighter capitalize">إعدادات صلاحيات: {selectedRole}</h3>
                     <button onClick={handleSave} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg hover:bg-emerald-600 transition-all">حفظ التغييرات</button>
                  </div>
                  
                  <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-4">
                     {['pos', 'inventory', 'accounting', 'reports', 'settings', 'hr', 'manufacturing'].map(mod => {
                        const perm = tempConfig.permissions.find(p => p.module === mod);
                        return (
                           <div key={mod} className="p-6 bg-white rounded-[2.5rem] border border-gray-50 flex justify-between items-center group hover:shadow-md transition-all">
                              <div>
                                 <h4 className="font-black text-slate-800 uppercase text-xs">{mod} Module</h4>
                                 <p className="text-[9px] text-gray-400 font-bold">Control access levels for this domain</p>
                              </div>
                              <div className="flex gap-6">
                                 {['read', 'write', 'delete'].map(action => (
                                    <label key={action} className="flex items-center gap-3 cursor-pointer group/toggle">
                                       <span className="text-[10px] font-black text-slate-400 group-hover/toggle:text-blue-600 transition-colors uppercase">{action}</span>
                                       <div 
                                          onClick={() => togglePermission(mod, action as any)}
                                          className={`w-12 h-6 rounded-full p-1 transition-all cursor-pointer ${perm?.[action as keyof typeof perm] ? 'bg-emerald-500' : 'bg-gray-200'}`}
                                       >
                                          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${perm?.[action as keyof typeof perm] ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                       </div>
                                    </label>
                                 ))}
                              </div>
                           </div>
                        )
                     })}
                  </div>
               </div>
            ) : (
               <div className="h-full flex flex-col items-center justify-center opacity-30 grayscale">
                  <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center text-4xl mb-6 shadow-inner font-black">🔐</div>
                  <p className="font-black text-xl uppercase tracking-tighter">اختر دوراً لتعديل صلاحياته</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default Security;
