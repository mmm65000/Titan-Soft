
import React, { useState } from 'react';
import { useApp } from '../AppContext';

const Profile: React.FC = () => {
  const { user, activityLogs, setUser, addLog, branches, lang } = useApp();
  const [formData, setFormData] = useState({ 
      name: user?.name || '', 
      email: user?.email || '', 
      password: '',
      avatar: user?.avatar || ''
  });

  const handleUpdate = () => {
      if(user) {
          setUser({ ...user, name: formData.name, email: formData.email, avatar: formData.avatar });
          addLog('User profile updated', 'success', 'System');
          alert('تم تحديث البيانات الشخصية بنجاح ✅');
      }
  };

  const userBranch = branches.find(b => b.id === user?.branchId)?.name_ar || 'الفرع الرئيسي';

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="bg-slate-900 p-16 rounded-[70px] shadow-3xl text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
         <div className="relative z-10 flex items-center gap-10">
            <div className="relative group cursor-pointer">
                <img src={formData.avatar || "https://i.pravatar.cc/150"} className="w-32 h-32 rounded-[2.5rem] border-4 border-white/20 shadow-2xl object-cover" />
                <div className="absolute inset-0 bg-black/50 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-bold uppercase tracking-widest">تغيير</span>
                </div>
            </div>
            <div>
               <h1 className="text-5xl font-black tracking-tighter mb-2">{user?.name}</h1>
               <div className="flex gap-4">
                   <span className="bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">{user?.role}</span>
                   <span className="bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">{userBranch}</span>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 bg-white p-12 rounded-[60px] shadow-2xl border border-gray-100">
            <h3 className="text-2xl font-black text-slate-800 mb-10">إعدادات الحساب</h3>
            <div className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">الاسم الكامل</label>
                        <input type="text" className="w-full glass-dark p-5 rounded-3xl outline-none font-bold text-slate-800" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">البريد الإلكتروني</label>
                        <input type="email" className="w-full glass-dark p-5 rounded-3xl outline-none font-bold text-slate-800" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} />
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">رابط الصورة الرمزية</label>
                    <input type="text" className="w-full glass-dark p-5 rounded-3xl outline-none font-bold text-slate-800 text-left dir-ltr" value={formData.avatar} onChange={e=>setFormData({...formData, avatar: e.target.value})} />
                </div>
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">كلمة المرور الجديدة</label>
                    <input type="password" className="w-full glass-dark p-5 rounded-3xl outline-none font-black text-slate-800" placeholder="••••••••" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} />
                </div>
                <div className="pt-6">
                    <button onClick={handleUpdate} className="px-12 py-5 bg-blue-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all">حفظ التغييرات</button>
                </div>
            </div>
         </div>

         <div className="lg:col-span-1 glass p-10 rounded-[60px] shadow-3xl border-white bg-white/40">
            <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                <div className="w-2.5 h-8 bg-orange-500 rounded-full"></div>
                سجل نشاطي
            </h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                {activityLogs.filter(l => l.user === user?.name).slice(0, 10).map((log, i) => (
                    <div key={i} className="p-4 bg-white/60 rounded-[20px] border border-white flex gap-4 items-start">
                        <span className="text-lg">{log.type === 'success' ? '✅' : log.type === 'error' ? '❌' : 'ℹ️'}</span>
                        <div>
                            <p className="text-xs font-bold text-slate-800 leading-snug">{log.action}</p>
                            <p className="text-[9px] font-black text-gray-400 uppercase mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                    </div>
                ))}
                {activityLogs.filter(l => l.user === user?.name).length === 0 && (
                    <p className="text-center py-10 opacity-30 font-black uppercase">لا يوجد نشاط مسجل</p>
                )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Profile;
