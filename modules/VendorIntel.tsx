
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Supplier } from '../types';

const VendorIntel: React.FC = () => {
  const { vendorPerformance, suppliers, lang, addSupplier, updateVendorPerformance, addLog } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [newRating, setNewRating] = useState({ speed: 50, quality: 50 });
  
  // Form State
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation Logic
  const validateField = (name: string, value: string) => {
    let error = '';
    if (name === 'phone') {
      const phoneRegex = /^05\d{8}$/;
      if (!value) error = lang === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone is required';
      else if (!phoneRegex.test(value)) error = lang === 'ar' ? 'صيغة خاطئة، يجب أن يبدأ بـ 05 ويتكون من 10 أرقام' : 'Invalid format, must start with 05 and be 10 digits';
    }
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) error = lang === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required';
      else if (!emailRegex.test(value)) error = lang === 'ar' ? 'بريد إلكتروني غير صالح' : 'Invalid email address';
    }
    if (name === 'name') {
      if (!value) error = lang === 'ar' ? 'اسم المورد مطلوب' : 'Supplier Name is required';
      else if (suppliers.some(s => s.name.toLowerCase() === value.toLowerCase())) error = lang === 'ar' ? 'هذا المورد موجود بالفعل' : 'Supplier already exists';
    }
    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = () => {
    const nameError = validateField('name', form.name);
    const phoneError = validateField('phone', form.phone);
    const emailError = validateField('email', form.email);

    if (nameError || phoneError || emailError) {
      setErrors({ name: nameError, phone: phoneError, email: emailError });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newSupplier: Supplier = {
        id: `sup-${Date.now()}`,
        name: form.name,
        name_ar: form.name,
        phone: form.phone,
        email: form.email,
        balance: 0,
        rating: 5.0
      };
      addSupplier(newSupplier);
      setIsSubmitting(false);
      setShowModal(false);
      setForm({ name: '', phone: '', email: '' });
      alert(lang === 'ar' ? 'تم تسجيل المورد بنجاح' : 'Supplier registered successfully');
    }, 1000);
  };

  const handleRateSubmit = () => {
      if (!selectedVendorId) return;
      const currentPerf = vendorPerformance.find(p => p.vendorId === selectedVendorId);
      const orders = currentPerf ? currentPerf.totalOrders + 1 : 1;
      
      updateVendorPerformance({
          vendorId: selectedVendorId,
          deliverySpeed: newRating.speed,
          qualityScore: newRating.quality,
          pricingIndex: currentPerf ? currentPerf.pricingIndex : 80, // keep existing or default
          totalOrders: orders
      });
      setShowRateModal(false);
      addLog(`Vendor Rating Updated`, 'success', 'VendorIntel');
  };

  const data = vendorPerformance.map(vp => {
    const supplier = suppliers.find(s => s.id === vp.vendorId);
    return {
      name: supplier?.name_ar || supplier?.name,
      speed: vp.deliverySpeed,
      quality: vp.qualityScore,
      pricing: vp.pricingIndex,
      orders: vp.totalOrders
    };
  });

  const radarData = [
    { subject: 'Speed', A: data[0]?.speed || 0, fullMark: 100 },
    { subject: 'Quality', A: data[0]?.quality || 0, fullMark: 100 },
    { subject: 'Pricing', A: data[0]?.pricing || 0, fullMark: 100 },
    { subject: 'Reliability', A: 90, fullMark: 100 },
    { subject: 'Service', A: 85, fullMark: 100 },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">رادار ذكاء الموردين</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Supply Chain Matrix & Partner Reliability Analytics</p>
        </div>
        <div className="flex gap-4">
            <button 
            onClick={() => setShowRateModal(true)}
            className="px-8 py-5 bg-white border border-gray-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:border-blue-400 transition-all"
            >
            تقييم أداء مورد ⭐
            </button>
            <button 
            onClick={() => setShowModal(true)}
            className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-indigo-700 transition-all"
            >
            تسجيل مورد جديد +
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-1 glass p-12 rounded-[60px] border border-white shadow-2xl bg-white/40 h-fit">
            <h3 className="text-xl font-black text-slate-800 mb-10 flex items-center gap-4">
               <div className="w-2.5 h-7 bg-blue-600 rounded-full"></div>
               تحليل الأداء الرباعي
            </h3>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                     <PolarGrid stroke="#e2e8f0" />
                     <PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fontWeight: 'bold'}} />
                     <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                     <Radar name="Vendor" dataKey="A" stroke="#2563eb" fill="#2563eb" fillOpacity={0.5} />
                  </RadarChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="lg:col-span-2 glass p-12 rounded-[60px] border border-white shadow-2xl bg-white/40">
            <h3 className="text-xl font-black text-slate-800 mb-10">مقارنة كفاءة التوريد (Benchmarking)</h3>
            <div className="h-[400px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                     <Tooltip contentStyle={{borderRadius: '20px', border: 'none'}} />
                     <Bar dataKey="speed" fill="#2563eb" radius={[10, 10, 0, 0]} barSize={40} name="سرعة التوريد" />
                     <Bar dataKey="quality" fill="#10b981" radius={[10, 10, 0, 0]} barSize={40} name="درجة الجودة" />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      {showRateModal && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-full max-w-lg p-12 rounded-[60px] shadow-3xl border-white relative">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 text-center">تقييم شحنة مورد</h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">اختر المورد</label>
                    <select className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" onChange={e=>setSelectedVendorId(e.target.value)}>
                       <option value="">...</option>
                       {suppliers.map(s => <option key={s.id} value={s.id}>{s.name_ar || s.name}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">سرعة التوصيل (0-100)</label>
                    <input type="range" min="0" max="100" className="w-full" value={newRating.speed} onChange={e=>setNewRating({...newRating, speed: parseInt(e.target.value)})} />
                    <p className="text-center font-black">{newRating.speed}%</p>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">جودة البضاعة (0-100)</label>
                    <input type="range" min="0" max="100" className="w-full" value={newRating.quality} onChange={e=>setNewRating({...newRating, quality: parseInt(e.target.value)})} />
                    <p className="text-center font-black">{newRating.quality}%</p>
                 </div>
                 <button onClick={handleRateSubmit} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black shadow-xl mt-4">حفظ التقييم</button>
                 <button onClick={() => setShowRateModal(false)} className="w-full py-3 text-gray-400 font-bold uppercase text-[10px]">إلغاء</button>
              </div>
           </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-full max-w-lg p-12 rounded-[60px] shadow-3xl border-white relative">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-8">تسجيل شريك توريد</h3>
              
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-1">اسم المؤسسة / المورد</label>
                    <input 
                      type="text" 
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className={`w-full glass-dark p-4 rounded-2xl outline-none font-bold border transition-all ${errors.name ? 'border-red-400 bg-red-50/50' : 'border-white focus:border-blue-400'}`}
                      placeholder="اسم الشركة الموردة..."
                    />
                    {errors.name && <p className="text-[10px] font-bold text-red-500 mt-2 px-1 animate-pulse">{errors.name}</p>}
                 </div>

                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-1">رقم التواصل المعتمد</label>
                    <input 
                      type="text" 
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className={`w-full glass-dark p-4 rounded-2xl outline-none font-bold border transition-all dir-ltr ${errors.phone ? 'border-red-400 bg-red-50/50' : form.phone.length > 0 && !errors.phone ? 'border-emerald-400 bg-emerald-50/30' : 'border-white focus:border-blue-400'}`}
                      placeholder="05xxxxxxxx"
                      maxLength={10}
                    />
                    {errors.phone ? (
                       <p className="text-[10px] font-bold text-red-500 mt-2 px-1">{errors.phone}</p>
                    ) : form.phone.length > 0 && (
                       <p className="text-[10px] font-bold text-emerald-600 mt-2 px-1">✓ صيغة صحيحة (SA Standard)</p>
                    )}
                 </div>

                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-1">البريد الإلكتروني الرسمي</label>
                    <input 
                      type="email" 
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className={`w-full glass-dark p-4 rounded-2xl outline-none font-bold border transition-all ${errors.email ? 'border-red-400 bg-red-50/50' : 'border-white focus:border-blue-400'}`}
                      placeholder="supplier@company.com"
                    />
                    {errors.email && <p className="text-[10px] font-bold text-red-500 mt-2 px-1">{errors.email}</p>}
                    {!errors.email && form.email.length > 5 && (
                       <p className="text-[9px] font-bold text-gray-400 mt-2 px-1">سيتم إرسال دعوة الانضمام لهذا البريد.</p>
                    )}
                 </div>

                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-gray-400 font-black uppercase tracking-widest text-[10px]">إلغاء</button>
                    <button 
                      onClick={handleSubmit} 
                      disabled={isSubmitting || !!errors.name || !!errors.phone || !!errors.email || !form.name || !form.phone || !form.email}
                      className="flex-2 py-5 bg-slate-900 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       {isSubmitting ? 'جاري المعالجة...' : 'اعتماد التسجيل'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default VendorIntel;
