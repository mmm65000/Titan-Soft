
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../AppContext';
import { Message, Contact, SocialMessage } from '../types';

const Messaging: React.FC = () => {
  const { messages, addMessage, user, lang, contacts, socialInbox, addSocialMessage } = useApp();
  const [inputText, setInputText] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | { id: string, name: string, isSocial: boolean, platform?: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-select "All Staff" broadcast if available
  useEffect(() => {
      if(!selectedContact) {
          setSelectedContact({ id: 'all', name: 'إعلانات الموظفين (General)', isSocial: false, role: 'Broadcast' });
      }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, selectedContact, socialInbox]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedContact) return;
    if ('isSocial' in selectedContact && selectedContact.isSocial) {
      // Simulate sending to Social Platform
      addSocialMessage({
        platform: selectedContact.platform as any,
        senderName: 'System',
        text: inputText
      });
    } else {
      addMessage(inputText, selectedContact.id);
    }
    setInputText('');
  };

  const getChatMessages = () => {
    if (!selectedContact) return [];
    if ('isSocial' in selectedContact && selectedContact.isSocial) {
      return socialInbox.filter(m => m.senderName === selectedContact.name || m.senderName === 'System');
    }
    // Internal Messages Logic
    if (selectedContact.id === 'all') {
        return messages.filter(m => m.receiverId === 'all');
    }
    return messages.filter(m => 
      (m.senderId === user?.id && m.receiverId === selectedContact?.id) ||
      (m.senderId === selectedContact?.id && m.receiverId === user?.id)
    );
  };

  const chatMessages = getChatMessages();

  return (
    <div className="flex gap-6 h-[calc(100vh-200px)] animate-in fade-in duration-500">
      <div className={`w-80 glass rounded-[50px] p-8 hidden md:flex flex-col shadow-xl border-white/50 ${lang === 'ar' ? 'order-last' : ''}`}>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black flex items-center gap-3 text-slate-800">
             <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
             البريد الوارد
          </h3>
        </div>
        
        <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
          
          {/* Broadcast Channel */}
          <button 
              onClick={() => setSelectedContact({ id: 'all', name: '📢 إعلانات الموظفين', isSocial: false, role: 'Broadcast' })}
              className={`w-full p-4 rounded-3xl transition-all flex items-center gap-4 group border ${
                selectedContact?.id === 'all' ? 'bg-orange-600 text-white shadow-xl translate-x-1 border-orange-500' : 'glass hover:bg-white/60 text-slate-800 border-white/40'
              }`}
            >
              <div className="relative">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm font-black ${selectedContact?.id === 'all' ? 'bg-white/20' : 'bg-orange-50 text-orange-600'}`}>
                  📢
                </div>
              </div>
              <div className="flex-1 overflow-hidden text-left">
                <p className={`font-black text-xs truncate ${selectedContact?.id === 'all' ? 'text-white' : 'text-slate-800'}`}>إعلانات عامة</p>
                <p className={`text-[9px] font-bold uppercase tracking-widest ${selectedContact?.id === 'all' ? 'text-orange-100' : 'text-orange-500'}`}>لكل الموظفين</p>
              </div>
          </button>

          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest px-4 mt-6 mb-2">قنوات التواصل الاجتماعي</p>
          {socialInbox.filter((v, i, a) => a.findIndex(t => t.senderName === v.senderName) === i).map(sm => (
            <button 
              key={sm.id} 
              onClick={() => setSelectedContact({ id: sm.id, name: sm.senderName, isSocial: true, platform: sm.platform })}
              className={`w-full p-4 rounded-3xl transition-all flex items-center gap-4 group border ${
                selectedContact?.name === sm.senderName ? 'bg-indigo-600 text-white shadow-xl translate-x-1 border-indigo-500' : 'glass hover:bg-white/60 text-slate-800 border-white/40'
              }`}
            >
              <div className="relative">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm font-black ${selectedContact?.name === sm.senderName ? 'bg-white/20' : 'bg-slate-50 text-indigo-600'}`}>
                  {sm.platform === 'whatsapp' ? '💬' : 'F'}
                </div>
              </div>
              <div className="flex-1 overflow-hidden text-left">
                <p className={`font-black text-xs truncate ${selectedContact?.name === sm.senderName ? 'text-white' : 'text-slate-800'}`}>{sm.senderName}</p>
                <p className={`text-[9px] font-bold uppercase tracking-widest ${selectedContact?.name === sm.senderName ? 'text-indigo-100' : 'text-indigo-500'}`}>{sm.platform}</p>
              </div>
            </button>
          ))}

          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest px-4 mt-6 mb-2">الفريق الداخلي</p>
          {contacts.map(c => (
            <button 
              key={c.id} 
              onClick={() => setSelectedContact(c)}
              className={`w-full p-4 rounded-3xl transition-all flex items-center gap-4 group border ${
                selectedContact?.id === c.id && !('isSocial' in selectedContact) ? 'bg-blue-600 text-white shadow-xl translate-x-1 border-blue-500' : 'glass hover:bg-white/60 text-slate-800 border-white/40'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm font-black bg-blue-50 text-blue-600">
                {c.name.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden text-left">
                <p className="font-black text-xs truncate">{c.name}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-blue-500">{c.role}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 glass rounded-[50px] p-8 flex flex-col relative overflow-hidden shadow-2xl border-white">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
        
        {selectedContact ? (
          <>
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl">
                    {selectedContact.name.charAt(0)}
                 </div>
                 <div>
                    <h4 className="font-black text-xl text-slate-800 tracking-tight">{selectedContact.name}</h4>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                       {'platform' in selectedContact ? `${selectedContact.platform} Active Stream` : 'تشفير داخلي نشط'}
                    </p>
                 </div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-8 pr-4 custom-scrollbar mb-8 pt-4">
              {chatMessages.map((m: any, i: number) => {
                const isMe = ('senderId' in m ? m.senderId === user?.id : m.senderName === 'System');
                const senderName = 'senderName' in m ? m.senderName : (m.senderId === user?.id ? 'أنا' : 'زميل');
                return (
                  <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2`}>
                     <div className="flex items-center gap-2 mb-2 px-2">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{senderName}</span>
                     </div>
                     <div className={`max-w-[80%] p-6 rounded-[30px] shadow-sm relative group ${
                       isMe 
                       ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-none' 
                       : 'bg-white/80 text-slate-800 rounded-tl-none border border-white'
                     }`}>
                       <p className="text-sm font-medium leading-relaxed">{m.text}</p>
                       <div className={`text-[8px] mt-3 font-black opacity-40 uppercase ${isMe ? 'text-right' : 'text-left'}`}>
                         {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </div>
                     </div>
                  </div>
                );
              })}
              {chatMessages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center opacity-20">
                      <p className="font-black text-sm uppercase">لا توجد رسائل سابقة</p>
                  </div>
              )}
            </div>

            <div className="relative mt-auto pt-4">
              <input 
                type="text" 
                placeholder={lang === 'ar' ? 'اكتب ردك هنا...' : 'Type your reply...'}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                className="w-full glass-dark py-6 px-10 rounded-[2.5rem] outline-none font-bold pr-28 border border-white/40 shadow-inner"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="absolute right-3 top-7 bottom-3 bg-slate-900 text-white px-8 rounded-full font-black shadow-2xl hover:bg-blue-600 transition-all flex items-center gap-2 disabled:opacity-20"
              >
                <span>{lang === 'ar' ? 'إرسال' : 'Send'}</span>
              </button>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-30 grayscale">
             <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center text-4xl mb-6 shadow-inner font-black">@</div>
             <p className="font-black text-xl uppercase tracking-tighter">اختر محادثة للبدء</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messaging;
