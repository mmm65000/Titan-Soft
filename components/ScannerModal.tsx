
import React, { useRef, useEffect, useState } from 'react';

interface ScannerModalProps {
  onScan: (sku: string) => void;
  onClose: () => void;
  lang: 'en' | 'ar';
}

const ScannerModal: React.FC<ScannerModalProps> = ({ onScan, onClose, lang }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setLoading(false);
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError(lang === 'ar' ? 'فشل الوصول إلى الكاميرا' : 'Camera access failed');
        setLoading(false);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [lang]);

  // Simulate a scan after 3 seconds for demonstration
  useEffect(() => {
    if (!loading && !error) {
      const timer = setTimeout(() => {
        // Randomly pick an existing SKU or mock one
        onScan('IPH-15P-256');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [loading, error, onScan]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass w-full max-w-lg p-10 rounded-[60px] shadow-3xl border-white relative overflow-hidden">
        <div className="flex justify-between items-center mb-8">
           <h3 className="text-2xl font-black text-white tracking-tighter">
             {lang === 'ar' ? 'ماسح الباركود' : 'Barcode Scanner'}
           </h3>
           <button onClick={onClose} className="p-3 glass rounded-2xl text-white hover:text-red-400 transition-all">✕</button>
        </div>

        <div className="relative aspect-square w-full bg-black rounded-[40px] overflow-hidden border-4 border-white/20 shadow-inner">
           {loading && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-widest">Initializing Lens...</p>
             </div>
           )}
           {error && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 p-10 text-center">
                <p className="font-black uppercase tracking-widest">{error}</p>
             </div>
           )}
           <video 
             ref={videoRef} 
             autoPlay 
             playsInline 
             className="w-full h-full object-cover"
           />
           
           {/* Scanner Overlay UI */}
           <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
              <div className="w-full h-full border-2 border-blue-500/50 rounded-2xl relative">
                 <div className="absolute top-1/2 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-pulse"></div>
              </div>
           </div>
        </div>

        <div className="mt-8 text-center">
           <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest animate-pulse">
              {lang === 'ar' ? 'وجه الكاميرا نحو الباركود...' : 'Point camera at barcode...'}
           </p>
        </div>
      </div>
    </div>
  );
};

export default ScannerModal;
