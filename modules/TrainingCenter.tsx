
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { TrainingCourse } from '../types';

const TrainingCenter: React.FC = () => {
  const { trainingCourses, staff, lang, addTrainingCourse, updateTrainingCourse, addLog } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', category: '', duration: '' });

  const handleAdd = () => {
    if(!newCourse.title || !newCourse.duration) return;
    const c: TrainingCourse = {
        id: `TRN-${Date.now()}`,
        title: newCourse.title,
        category: newCourse.category || 'General',
        duration: newCourse.duration,
        status: 'active',
        attendees: []
    };
    addTrainingCourse(c);
    setShowModal(false);
    setNewCourse({ title: '', category: '', duration: '' });
  };

  const handleRegisterAttendee = (courseId: string) => {
      const staffName = prompt("أدخل اسم الموظف أو رقمه للتسجيل:");
      if(staffName) {
          // In a real app we'd pick from a list, here we simulate adding the first staff if match or random
          const employee = staff.find(s => s.name.includes(staffName)) || staff[0];
          if(employee) {
              const course = trainingCourses.find(c => c.id === courseId);
              if(course && !course.attendees.includes(employee.id)) {
                  updateTrainingCourse(courseId, { attendees: [...course.attendees, employee.id] });
                  addLog(`تم تسجيل ${employee.name} في دورة ${course.title}`, 'success', 'HR');
              }
          }
      }
  };

  const handleCompleteCourse = (courseId: string) => {
      if(confirm('هل أنت متأكد من إتمام الدورة وإصدار الشهادات؟')) {
          updateTrainingCourse(courseId, { status: 'completed' });
          addLog(`تم إتمام دورة تدريبية`, 'success', 'Training');
          alert('تم إصدار الشهادات الرقمية للمتدربين ✅');
      }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">مركز التدريب والنمو المهني</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Employee Upskilling, Certifications & Training Pipelines</p>
        </div>
        <button 
            onClick={() => setShowModal(true)}
            className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-indigo-700 transition-all"
        >
            جدولة دورة تدريبية +
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {trainingCourses.map(course => (
          <div key={course.id} className="glass p-10 rounded-[50px] border border-white shadow-xl bg-white/40 hover:bg-white transition-all group overflow-hidden relative">
             <div className="flex justify-between items-start mb-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
                   course.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                }`}>
                   🎓
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{course.category}</span>
             </div>

             <h3 className="text-xl font-black text-slate-800 mb-2">{course.title}</h3>
             <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-8">Duration: {course.duration}</p>

             <div className="space-y-4 mb-8">
                <p className="text-[8px] font-black text-gray-400 uppercase">المتدربين المسجلين</p>
                <div className="flex -space-x-4 space-x-reverse items-center">
                   {course.attendees.map(aid => {
                      const emp = staff.find(s => s.id === aid);
                      return (
                         <div key={aid} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center font-black text-[10px] shadow-sm overflow-hidden" title={emp?.name}>
                            {emp?.name.charAt(0)}
                         </div>
                      );
                   })}
                   <button 
                    onClick={() => handleRegisterAttendee(course.id)}
                    className="w-10 h-10 rounded-full border-4 border-white bg-white text-blue-500 flex items-center justify-center font-black text-lg shadow-sm hover:bg-blue-50 transition-all"
                   >
                    +
                   </button>
                </div>
             </div>

             <div className="flex justify-between items-center pt-8 border-t border-slate-100">
                {course.status === 'completed' ? (
                    <span className="text-[9px] font-black uppercase text-emerald-600">تم الانتهاء</span>
                ) : (
                    <button onClick={() => handleCompleteCourse(course.id)} className="text-[9px] font-black uppercase text-blue-600 animate-pulse hover:underline">إتمام الدورة</button>
                )}
                <button className="text-[9px] font-black text-slate-900 hover:underline">عرض الشهادات ←</button>
             </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in zoom-in duration-300">
           <div className="glass w-full max-w-lg p-12 rounded-[60px] shadow-3xl border-white relative">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-8 text-center">دورة تدريبية جديدة</h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">عنوان الدورة</label>
                    <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newCourse.title} onChange={e=>setNewCourse({...newCourse, title: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">التصنيف</label>
                    <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newCourse.category} onChange={e=>setNewCourse({...newCourse, category: e.target.value})} placeholder="Sales, Management..." />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">المدة (أيام/أسابيع)</label>
                    <input type="text" className="w-full glass-dark p-4 rounded-3xl outline-none font-bold" value={newCourse.duration} onChange={e=>setNewCourse({...newCourse, duration: e.target.value})} />
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">إلغاء</button>
                    <button onClick={handleAdd} className="flex-2 py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[10px]">إطلاق التدريب</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TrainingCenter;
