'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Copy, ShieldCheck, CheckCircle2, RotateCcw, Video, Compass, Key, Layers, ClipboardCopy, Image as ImageIcon, Trash2, Eye, EyeOff, Lock, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================================
// KONEKSI UTAMA SUPABASE LIVE DATABASE (AUTOPILOT LICENSE)
// ==========================================================
// Kunci URL sudah otomatis mengarah ke Project ID Supabase milik lo bray!
const SUPABASE_URL = "https://ckmhdeuhzsuzdgumgyim.supabase.co";
// Tinggal tempel public anon key lo di bawah ini pas di VS Code ya:
const SUPABASE_ANON_KEY = "sb_publishable_RNj6VVsnoOiKghqyp-U-ew_HzlOg9ke";

const STYLES_DATA = {
  Vector: [
    "Flat Design / Flat Vector",
    "Isometric Vector Style",
    "Line Art / Clean Monoline",
    "Corporate Memphis / Alegria Style",
    "Paper Cutout / Layered Paper Art",
    "Cute Kawaii Vector Asset",
    "Vintage / Retro Emblem & Badge",
    "Gradient Mesh / Liquid Gradient",
    "Silhouette / Black Silhouette",
    "Pop Art / Comic Book Style",
    "Abstract Geometric Pattern",
    "Doodle / Hand-drawn Sketch",
    "Watercolor Vector Illustration",
    "Low Poly Geometrical Vector",
    "Infographic / Data Visualization Element",
    "Vintage Botanical / Engraving Style",
    "Tribal / Tattoo Graphic Art",
    "Vaporwave / Synthwave Retro Art",
    "Minimalist Boho Aesthetic Vector",
    "Chalkboard Typography & Vector Style"
  ],
  PNG: [
    "Blank Commercial Product Mockup (Polosan)",
    "Cute 3D Claymation / Smooth Clay Asset",
    "Isolated Character Asset (Rapih/Safety Shoes/Sabuk)",
    "Die-Cut Sticker Graphic (White Border Edge)",
    "Clean Graphic Design Element / Frame / Splash",
    "Glossy 3D Icon / Vibrant Matte Rendering",
    "Glassmorphism 3D Asset / Frosted Translucent",
    "Isometric 3D Style / Tech Infographic Object",
    "Low Poly 3D Model Style / Minimalist Geometric",
    "Candy Style 3D / Glossy Sweet Toy Aesthetic",
    "Chibi 3D Cartoon Character Asset",
    "Futuristic Cyberpunk 3D Gadget Element",
    "Minimalist Matte 3D UI Element Set",
    "Luxury Gold & Chrome 3D Ornate Graphic"
  ],
  Video: [
    "Cinematic Stock B-Roll (Shallow Depth of Field)",
    "Minimalist 3D Seamless Loop Animation",
    "Studio Macro Slow Motion (High Frame Rate View)",
    "Commercial Studio Lighting Product B-roll"
  ]
};

const TRENDS_LIST = [
  { value: "Fantastic Frontiers", label: "Fantastic Frontiers: Dunia magis, surealis, dan imajinatif." },
  { value: "Playfulness & Humor", label: "Playfulness & Humor: Suasana santai, jenaka, dan penuh tawa." },
  { value: "Time Travel", label: "Time Travel: Nostalgia retro berpadu dengan masa depan." },
  { value: "Immersive Allure", label: "Immersive Allure: Fokus pada tekstur kaya dan kedalaman ruang." },
  { value: "Minimalist Zen", label: "Minimalist Zen: Kesederhanaan, ruang kosong, dan ketenangan." },
  { value: "Eco-Conscious", label: "Eco-Conscious: Fokus pada keberlanjutan dan lingkungan hidup." },
  { value: "Cyber Tech", label: "Cyber Tech: Dunia teknologi modern, digital, dan canggih." },
  { value: "Authentic Human", label: "Authentic Human: Momen nyata, ekspresi jujur, tanpa pose kaku." },
  { value: "Vibrant Diversity", label: "Vibrant Diversity: Perayaan keragaman etnis dan kemampuan." },
  { value: "Urban Dynamic", label: "Urban Dynamic: Energi kehidupan kota yang sibuk dan dinamis." }
];

const LIGHTING_LIST = [
  "Soft Natural Studio Light (Crisp Reflections)",
  "Clean Volumetric Commercial Branding Spotlight",
  "Dramatic High-Contrast Chiaroscuro Lighting",
  "Neon Cyberpunk Ambient Glow (Dual Tone)",
  "Bright Clean Cinematic Symmetrical Overcast"
];

export default function Home() {
  // --- STATE OTENTIKASI DATABASE LIVE ---
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false); 
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [localDeviceUuid, setLocalDeviceUuid] = useState("");

  // --- SISA STATE ASLI BAWAAN APLIKASI LO ---
  const [rawPrompt, setRawPrompt] = useState('');
  const [category, setCategory] = useState<'Vector' | 'PNG' | 'Video'>('Vector');
  const [styleType, setStyleType] = useState(STYLES_DATA.Vector[0]);
  const [layoutType, setLayoutType] = useState('Single Icon');
  const [backgroundType, setBackgroundType] = useState('white');
  const [customColor, setCustomColor] = useState('Soft Pastel Blue');
  const [trend, setTrend] = useState(TRENDS_LIST[0].value);
  const [lighting, setLighting] = useState(LIGHTING_LIST[0]);
  const [composition, setComposition] = useState('Medium shot, centered composition, clear visualization');
  
  const [imageRef, setImageRef] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userApiKey, setUserApiKey] = useState('');
  const [outputPrompts, setOutputPrompts] = useState<string[] | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  
  // LOGIKA DEVICE FINGERPRINT LOCK + AUTO-FILL CACHE ON REFRESH
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    
    // Hapus sisa gembok lama biar browser lo gak bingung bray
    localStorage.removeItem('agunkdesain_unlocked');
    
    // 1. Ambil atau buat ID Unik untuk PC/Laptop ini (Device Fingerprinting)
    let deviceUuid = localStorage.getItem('agunkdesain_hardware_id');
    if (!deviceUuid) {
      deviceUuid = 'device_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('agunkdesain_hardware_id', deviceUuid);
    }
    setLocalDeviceUuid(deviceUuid);
    
    // 2. Ambil cache input email password pas refresh biar nempel terus bray
    const savedEmail = localStorage.getItem('agunkdesain_saved_email');
    const savedPassword = localStorage.getItem('agunkdesain_saved_password');
    
    if (savedEmail) setInputEmail(savedEmail);
    if (savedPassword) setInputPassword(savedPassword);
  }, []);

  // AUTOMATIC TIMEOUT TIMELINE UNTUK SEQUENCE MELUNCUR BRAY
  useEffect(() => {
    if (isLaunching) {
      const timer = setTimeout(() => {
        setIsUnlocked(true);
        setIsLaunching(false);
      }, 3800); 
      return () => clearTimeout(timer);
    }
  }, [isLaunching]);

  // ENGINE TYPEWRITER BERURUTAN (Anti-Patung)
  const [typedTitle, setTypedTitle] = useState('');
  const [typedText, setTypedText] = useState('');
  const fullTitleText = "LETS GO BRO!";
  const fullMotivationText = "Tenang bro, tools ini udah gw rancang dan riset mendalam tentang apa yg ga lo pernah tau sebelumnya. Sistem bakal otomatis nyaring ranjau spambot kurator agensi microstock global, mastiin amunisi prompt lo steril, anti-reject, dan siap nge-bom pasar asset digital dunia!";

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // FX AIR AURORA DYNAMIC PAS KURSOR BERGERAK
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let particles: any[] = [];
    const handleMouseMove = (e: MouseEvent) => {
      for (let i = 0; i < 4; i++) {
        particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 2.5,
          vy: (Math.random() - 0.5) * 2.5,
          radius: Math.random() * 15 + 8,
          alpha: 1,
          color: Math.random() > 0.6 
            ? 'rgba(99, 102, 241, '   
            : Math.random() > 0.3 
              ? 'rgba(168, 85, 247, ' 
              : 'rgba(236, 72, 153, '  
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;
    const renderAurora = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'screen';

      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.015;
        p.radius += 0.8;

        if (p.alpha <= 0) {
          particles.splice(idx, 1);
          return;
        }

        ctx.beginPath();
        let gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        gradient.addColorStop(0, p.color + p.alpha + ')');
        gradient.addColorStop(0.3, p.color + p.alpha * 0.4 + ')');
        gradient.addColorStop(1, p.color + '0)');
        
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(renderAurora);
    };
    renderAurora();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // ROBOT TYPEWRITER PADA MOTIVASI KANVAS
  useEffect(() => {
    if (outputPrompts || loading || !isUnlocked) return;
    setTypedTitle('');
    setTypedText('');
    
    let currentTick = 0;
    const totalTitleLen = fullTitleText.length;
    
    const interval = setInterval(() => {
      if (currentTick < totalTitleLen) {
        setTypedTitle(fullTitleText.slice(0, currentTick + 1));
        currentTick++;
      } else if (currentTick < totalTitleLen + fullMotivationText.length) {
        const textCharIndex = currentTick - totalTitleLen;
        setTypedText(fullMotivationText.slice(0, textCharIndex + 1));
        currentTick++;
      } else {
        clearInterval(interval);
      }
    }, 14);
    
    return () => clearInterval(interval);
  }, [outputPrompts, loading, isUnlocked]);

  useEffect(() => {
    setStyleType(STYLES_DATA[category][0]);
    if (category === 'PNG') setBackgroundType('white');
    if (category === 'Video') setBackgroundType('natural');
  }, [category]);

  useEffect(() => {
    const savedKey = localStorage.getItem('adobe_stock_user_openai_key');
    if (savedKey) setUserApiKey(savedKey);
  }, []);

  const handleApiKeyChange = (val: string) => {
    setUserApiKey(val);
    localStorage.setItem('adobe_stock_user_openai_key', val);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageRef(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImageRef(null);
  };

  const handleCopySingle = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleCopyAll = () => {
    if (!outputPrompts) return;
    const allText = outputPrompts.join('\n\n');
    navigator.clipboard.writeText(allText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleResetCanvas = () => {
    setOutputPrompts(null);
  };

  const handleGenerate = async () => {
    if (!userApiKey.trim()) return;
    if (!imageRef && !rawPrompt.trim()) return;
    
    setOutputPrompts(null);
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rawPrompt: imageRef ? "" : rawPrompt, 
          category, 
          styleType, 
          layoutType,
          backgroundType, 
          customColor, 
          lighting, 
          composition, 
          trend, 
          userApiKey,
          imageRef
        })
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setOutputPrompts(data.prompts);
      } else {
        setErrorMsg(data.error || 'Terjadi gangguan komunikasi dengan server AI.');
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung ke server backend.');
    } finally {
      setLoading(false);
    }
  };

  // ======================================================================
  // LOGIKA VALIDASI LIVE DATABASE VIA NATIVE REST SUPABASE API (DEVICE LOCK)
  // ======================================================================
  const handleVerifyLicense = async () => {
    if (!inputEmail.trim() || !inputPassword.trim()) {
      setLoginError("Email ama Password-nya diisi lengkap dulu bray!");
      return;
    }
    
    setLoginError(null);
    setLoading(true);

    try {
      // 1. Ambil data dari tabel Supabase berdasarkan Kunci yang diketik bray
      const targetUrl = `${SUPABASE_URL}/rest/v1/licenses?email=eq.${encodeURIComponent(inputEmail.trim())}&password=eq.${encodeURIComponent(inputPassword)}`;
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data || data.length === 0) {
        setLoginError("Gerbang Dimensi Menolak! Kombinasi Email atau Password lo salah bray.");
        setLoading(false);
        return;
      }

      const dbUser = data[0];

      // 2. DETEKTIF SENSOR: Proteksi 1 PC 1 Lisensi
      if (!dbUser.device_id) {
        // JIKA KOSONG (FIRST LOGIN): Kunci ID PC laptop ini secara permanen ke Supabase
        const updateUrl = `${SUPABASE_URL}/rest/v1/licenses?email=eq.${encodeURIComponent(dbUser.email)}`;
        const lockResponse = await fetch(updateUrl, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ device_id: localDeviceUuid })
        });

        if (!lockResponse.ok) {
          setLoginError("Gagal mengunci hardware lisensi lo bray, coba hubungi admin.");
          setLoading(false);
          return;
        }
        
        localStorage.setItem('agunkdesain_saved_email', inputEmail.trim());
        localStorage.setItem('agunkdesain_saved_password', inputPassword);
        setIsLaunching(true);

      } else {
        // JIKA SUDAH BERISI: Validasi kecocokan ID hardware PC saat ini
        if (dbUser.device_id === localDeviceUuid) {
          localStorage.setItem('agunkdesain_saved_email', inputEmail.trim());
          localStorage.setItem('agunkdesain_saved_password', inputPassword);
          setIsLaunching(true);
        } else {
          // GAGAL: Berarti akun ini dicoba di-share ke PC lain! Blokir bray!
          setLoginError("🚫 Akses Ditolak! Lisensi ini udah kekunci di PC lain bray. Hubungi Agunk Desain buat reset!");
        }
      }

    } catch (err) {
      setLoginError("Gagal terhubung ke server database gembok online bray.");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDERING INTERFACE 1: POPUP GERBANG DIMENSI (BELUM UNLOCKED & BELUM MELUNCUR) ---
  if (isMounted && !isUnlocked && !isLaunching) {
    return (
      <main className="relative min-h-screen flex items-center justify-center bg-[#0B0F19] text-slate-100 p-4 overflow-hidden">
        <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-70" />
        
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="dark-glass p-8 rounded-3xl border border-white/10 w-full max-w-md text-center backdrop-blur-2xl z-10 shadow-2xl flex flex-col items-center justify-center"
        >
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent leading-tight select-none">
            Selamat datang di dunia Microstock
          </h1>
          
          <p className="text-xs text-slate-400 mt-3 leading-relaxed max-w-sm select-none font-medium">
            sebelum lo kebanjiran dollar di dunia microstock, kenalan dulu dan biar kita sukses bareng
          </p>

          <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20 text-indigo-400 my-5">
            <Lock className="w-5 h-5" />
          </div>

          <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-3 select-none">
            buka kunci gerbang dimensi microstock lo disini :
          </p>

          <div className="flex flex-col gap-3 w-full max-w-xs text-left mb-2">
            <input 
              type="email" 
              placeholder="Masukkan Email Akses..." 
              value={inputEmail}
              disabled={loading}
              onChange={(e) => setInputEmail(e.target.value)}
              className="w-full bg-slate-950/80 p-3 rounded-xl border border-white/5 focus:border-indigo-500 focus:outline-none text-xs text-slate-200 transition-all font-mono"
            />
            <input 
              type="password" 
              placeholder="Masukkan Password..." 
              value={inputPassword}
              disabled={loading}
              onChange={(e) => setInputPassword(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter') handleVerifyLicense(); }}
              className="w-full bg-slate-950/80 p-3 rounded-xl border border-white/5 focus:border-indigo-500 focus:outline-none text-xs text-slate-200 transition-all font-mono"
            />
          </div>

          {loginError && (
            <div className="w-full max-w-xs mt-2 p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] rounded-xl font-medium">
              ⚠️ {loginError}
            </div>
          )}

          <motion.button 
            whileHover={{ scale: 1.02, boxShadow: "0px 0px 25px rgba(99, 102, 241, 0.4)" }}
            whileTap={{ scale: 0.98 }}
            onClick={handleVerifyLicense}
            disabled={loading}
            className="w-full max-w-xs mt-4 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-xs font-extrabold rounded-xl uppercase tracking-wider shadow-lg transition-all cursor-pointer disabled:opacity-40"
          >
            {loading ? "Menghubungi Database..." : "Buka Gerbang Dimensi"}
          </motion.button>

          <div className="mt-8 pt-4 border-t border-white/5 text-[10px] text-slate-500 flex flex-col gap-0.5 font-mono select-none w-full">
            <p>Copyright @agunkdesain 2026</p>
            <p className="text-indigo-400/70 italic">Temen lo sukses bareng ..</p>
          </div>
        </motion.div>
      </main>
    );
  }

  // --- STATE INTERFACE 2: THE GERBANG DRAMATISASI BIOSKOP (ROKET KUCING ASTRONOT LAUNCHING) ---
  if (isMounted && isLaunching) {
    return (
      <main className="relative min-h-screen flex flex-col items-center justify-center bg-[#070A13] text-slate-100 p-4 overflow-hidden z-50">
        <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-40" />

        <motion.h1 
          animate={{ 
            scale: [1, 1.08, 1, 1.1, 1],
            x: [0, -1, 1, -2, 2, 0],
            filter: ["drop-shadow(0 0 8px rgba(245,158,11,0.3))", "drop-shadow(0 0 25px rgba(236,72,153,0.8))", "drop-shadow(0 0 8px rgba(245,158,11,0.3))"]
          }} 
          transition={{ duration: 0.12, repeat: Infinity }} 
          className="text-4xl md:text-6xl font-black uppercase tracking-widest bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-400 bg-clip-text text-transparent mb-16 font-mono select-none"
        >
          Meluncur Bro .... !!!
        </motion.h1>

        <motion.div
          animate={{
            y: [260, 256, 262, 250, 140, 40, -1200],
            x: [0, -3, 3, -4, 4, -2, 2, -1, 1, 0, 0],
            rotate: [0, -1, 1, -2, 2, -1, 0, 0, 0],
            scale: [1, 1.02, 1.01, 1.06, 1.15, 1.25, 2.0]
          }}
          transition={{
            duration: 3.8,
            times: [0, 0.05, 0.1, 0.18, 0.35, 0.55, 0.85, 1],
            ease: "easeInOut"
          }}
          className="relative flex flex-col items-center"
        >
          <div className="absolute top-[-20px] z-20 bg-slate-900/90 rounded-full p-2 border-2 border-slate-400 shadow-[0_0_20px_rgba(255,255,255,0.5)] flex items-center justify-center w-14 h-14 backdrop-blur-md animate-pulse">
            <span className="text-3xl select-none">🐱‍🚀</span>
          </div>

          <Rocket className="w-32 h-32 text-indigo-400 drop-shadow-[0_0_40px_rgba(99,102,241,0.7)] transform -rotate-45 relative z-10" />

          <motion.div 
            animate={{ scaleY: [1, 1.4, 1.1, 1.6, 1.2], opacity: [0.8, 1, 0.9, 1, 0.8] }}
            transition={{ duration: 0.1, repeat: Infinity, repeatType: "reverse" }}
            className="w-8 h-28 bg-gradient-to-b from-orange-500 via-yellow-400 to-transparent rounded-b-full origin-top blur-[1px] mt-[-15px] z-0 shadow-[0_10px_30px_rgba(249,115,22,0.5)]"
          />
          
          <div className="flex gap-1.5 justify-center mt-[-10px] opacity-80">
            <div className="w-5 h-5 bg-red-600/70 rounded-full blur-md animate-ping" />
            <div className="w-7 h-7 bg-orange-500/60 rounded-full blur-lg animate-pulse delay-75" />
            <div className="w-5 h-5 bg-yellow-300/80 rounded-full blur-md animate-ping delay-100" />
          </div>
        </motion.div>
      </main>
    );
  }

  // --- STATE INTERFACE 3: UTAMA APLIKASI ASLI (AKAN TERBUKA JIKA ROKET KELAR MELUNCUR) ---
  return (
    <main className="relative min-h-screen p-4 md:p-6 flex flex-col items-center justify-start z-10 overflow-x-hidden bg-[#0B0F19] text-slate-100 selection:bg-indigo-500/30">
      
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-80" />

      <motion.div 
        animate={{ x: [0, 80, -80, 0], y: [0, -60, 60, 0] }}
        transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        className="mesh-glow top-10 left-[-100px] pointer-events-none" 
      />
      <motion.div 
        animate={{ x: [0, -60, 80, 0], y: [0, 60, -60, 0] }}
        transition={{ duration: 18, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        className="mesh-glow bottom-10 right-[-100px] bg-purple-500/10 pointer-events-none" 
      />

      {/* Header Bar - Presisi, Padat, Rapat Atas Bawah */}
      <div className="w-full max-w-6xl mb-4 flex flex-row justify-between items-center gap-4 z-10 border-b border-slate-800/20 pb-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent uppercase">
            MASTER PROMPT ANTI-REJECT
          </h1>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Dirancang super steril dari spam, isu hak cipta, dan pelanggaran submission guidelines.<br />
            Amunisi wajib biar portofolio lo kebal dari drama Banned massal di agensi microstock global!
          </p>
        </div>
        
        <motion.img 
          whileHover={{ scale: 1.08, rotate: 3 }}
          whileTap={{ scale: 0.95 }}
          src="/logo-brand.svg" 
          alt="Agunk Desain Logo" 
          className="w-24 h-24 object-contain cursor-pointer select-none"
        />
      </div>

      {/* Grid Utama Antarmuka */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-6 z-10 items-start">
        
        {/* PANEL KONTROL KIRI */}
        <div className="md:col-span-5 flex flex-col gap-5">
          <div className="dark-glass p-6 rounded-2xl flex flex-col gap-4 relative backdrop-blur-xl">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400" /> Parameter Konseptor Aset
            </h2>

            {/* Input API Key - Multi Provider Model BARIS ENTER + SENSOR LINTAS BROWSER FIX */}
            <div className="flex flex-col gap-1.5 p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 w-full">
              <div className="flex justify-between items-center w-full">
                <label className="text-[11px] text-indigo-300 font-bold flex items-center gap-1">
                  <Key className="w-3.5 h-3.5" /> Kumpulan API Key Autopilot (Satu Key Per Baris / Enter)
                </label>
                
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="text-slate-400 hover:text-indigo-400 transition-colors p-1 rounded-md hover:bg-slate-800/60 flex items-center gap-1 text-[10px] font-semibold"
                >
                  {showApiKey ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> Sembunyikan
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" /> Intip Key
                    </>
                  )}
                </button>
              </div>
              
              {showApiKey ? (
                <textarea
                  value={userApiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  rows={5}
                  placeholder="Tempel semua API Key lo di sini bray...&#10;sk-or-xxxxxx (OpenRouter)&#10;AIzaSyxxxxxx (Gemini)&#10;gsk_xxxxxx (Groq)"
                  className="w-full bg-slate-950/70 rounded-lg p-2 text-xs text-slate-200 border border-white/5 focus:border-indigo-500 focus:outline-none font-mono resize-y min-h-[120px]"
                  autoFocus
                />
              ) : (
                <div
                  onClick={() => setShowApiKey(true)}
                  className="w-full bg-slate-950/70 rounded-lg p-2 text-xs font-mono min-h-[120px] whitespace-pre-wrap cursor-pointer border border-white/5 opacity-80 hover:border-indigo-500/30 transition-all select-none"
                >
                  {userApiKey && userApiKey.trim() ? (
                    userApiKey.split('\n').map(line => line.trim() ? '••••••••••••••••••••••••••••••••••••••••' : '').join('\n')
                  ) : (
                    <span className="text-slate-600 block leading-relaxed">
                      Tempel semua API Key lo di sini bray...<br />
                      <span className="text-[10px] text-slate-500">(Klik "Intip Key" atau klik kotak ini untuk mulai mengisi)</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* SLOT UPLOAD SCREENSHOT REFERENSI */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Upload Screenshot Gambar Referensi (Optional):</label>
              {!imageRef ? (
                <label className="w-full h-16 border-2 border-dashed border-white/10 hover:border-indigo-500/40 rounded-xl flex items-center justify-center gap-2 text-xs text-slate-400 cursor-pointer bg-slate-950/20 transition-all">
                  <ImageIcon className="w-4 h-4 text-indigo-400" />
                  <span>Klik buat Upload / Tarik Gambar Dimari</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              ) : (
                <div className="relative w-full h-20 bg-slate-950/60 rounded-xl border border-indigo-500/20 p-2 flex items-center gap-3">
                  <img src={imageRef} alt="Reference Preview" className="w-16 h-16 object-cover rounded-lg border border-white/10" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-emerald-400 font-bold">Gambar Terdeteksi!</p>
                    <p className="text-[9px] text-slate-500 truncate">Mode analisa visual diaktifkan otomatis.</p>
                  </div>
                  <button onClick={handleClearImage} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* PILIH FORMAT MASTER ASET */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Pilih Format Master Aset:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Vector', 'PNG', 'Video'] as const).map((cat) => (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-2 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                      category === cat 
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 shadow-lg shadow-indigo-500/10' 
                        : 'bg-slate-950/20 border-white/5 text-slate-400 hover:bg-slate-950/40'
                    }`}
                  >
                    {cat === 'Vector' && '🎨 Vector'}
                    {cat === 'PNG' && '📦 PNG Asset'}
                    {cat === 'Video' && '🎬 Video'}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* FITUR JUMLAH / KOMPOSISI ASSET */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Konfigurasi Komposisi / Susunan Asset:</label>
              <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                {['Single Icon', 'Double Icon', '4 Icons Grid', '8 Icons Grid', 'Pattern Graphic', 'Seamless Grid'].map((lay) => (
                  <motion.button
                    whileHover={{ scale: 1.04, filter: "brightness(1.15)" }}
                    whileTap={{ scale: 0.96 }}
                    key={lay}
                    type="button"
                    onClick={() => setLayoutType(lay)}
                    className={`py-1.5 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                      layoutType === lay
                        ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow-md shadow-purple-500/5'
                        : 'bg-slate-950/20 border-white/5 text-slate-400 hover:bg-slate-950/40'
                    }`}
                  >
                    {lay}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* PILIH STYLE BERDASARKAN KATEGORI */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Pilih Gaya Visual Komersial:</label>
              <select
                value={imageRef ? "Auto-Detect Style via AI Vision" : styleType}
                disabled={!!imageRef}
                onChange={(e) => setStyleType(e.target.value)}
                className={`w-full bg-slate-950/60 rounded-xl p-2.5 text-xs border focus:outline-none ${
                  imageRef ? 'text-indigo-400 border-indigo-500/20 bg-slate-950/80 cursor-not-allowed font-bold' : 'text-slate-300 border-white/5 focus:border-indigo-500'
                }`}
              >
                {imageRef ? (
                  <option>🤖 Ditentukan otomatis oleh AI berdasarkan gambar</option>
                ) : (
                  STYLES_DATA[category].map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))
                )}
              </select>
            </div>

            {/* PENGATURAN BACKGROUND DINAMIS */}
            <div className="flex flex-col gap-1.5 p-3 bg-white/5 rounded-xl border border-white/5">
              <label className="text-xs font-semibold text-indigo-300">Konfigurasi Latar Belakang (Background):</label>
              {category === 'Vector' && (
                <div className="flex flex-col gap-2 mt-1">
                  <select
                    value={backgroundType}
                    onChange={(e) => setBackgroundType(e.target.value)}
                    className="w-full bg-slate-950/60 rounded-lg p-2 text-xs text-slate-300 border border-white/5 focus:outline-none"
                  >
                    <option value="white">Putih Solid Murni</option>
                    <option value="chroma">Chroma Green Screen (#00FF00)</option>
                    <option value="custom">Custom Warna (Ketik Sendiri)</option>
                  </select>
                  {backgroundType === 'custom' && (
                    <input
                      type="text"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      placeholder="Misal: Pastel Soft Blue"
                      className="w-full bg-slate-950/80 rounded-lg p-2 text-xs text-slate-200 border border-indigo-500/40 focus:outline-none"
                    />
                  )}
                </div>
              )}
              {category === 'PNG' && (
                <p className="text-[11px] text-amber-400/90 mt-1 leading-relaxed">
                  📌 <strong>Ketetapan PNG:</strong> Latar belakang otomatis dikunci ke <strong>Isolated Pure White</strong> agar clipart bersih & gampang di-trace kurator.
                </p>
              )}
              {category === 'Video' && (
                <select
                  value={backgroundType}
                  onChange={(e) => setBackgroundType(e.target.value)}
                  className="w-full bg-slate-950/60 rounded-lg p-2 text-xs text-slate-300 border border-white/5 focus:outline-none mt-1"
                >
                  <option value="natural">Natural Sesuai Objek Latar</option>
                  <option value="chroma">Isolated Chroma Green Screen Studio</option>
                  <option value="black">Solid Deep Black (Hitam Pekat Studio)</option>
                </select>
              )}
            </div>

            {/* INPUT DESKRIPSI IDE DASAR */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">Tulis 1 Kata Kunci / Konsep Ide:</label>
              <textarea
                value={imageRef ? "Biarin gw yang analisa gambarnya, lo tinggal duduk manis aja..." : rawPrompt}
                disabled={!!imageRef}
                onChange={(e) => setRawPrompt(e.target.value)}
                placeholder="Misal: Kucing astronot imut, botol serum kosmetik..."
                className={`w-full h-20 rounded-xl p-3 text-xs border focus:outline-none resize-none font-medium ${
                  imageRef ? 'bg-slate-950/80 border-indigo-500/20 text-indigo-300 italic font-bold cursor-not-allowed opacity-75' : 'bg-slate-950/50 border-white/5 text-slate-200 focus:border-indigo-500'
                }`}
              />
            </div>

            {/* PARAMETER EKSTRA */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase">Suntikan Tren:</label>
                <select value={trend} onChange={(e) => setTrend(e.target.value)} className="bg-slate-950/50 rounded-lg p-1.5 text-[10px] text-slate-300 border border-white/5 focus:outline-none truncate w-full">
                  {TRENDS_LIST.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase">Pencahayaan:</label>
                <select value={lighting} onChange={(e) => setLighting(e.target.value)} className="bg-slate-950/50 rounded-lg p-1.5 text-[10px] text-slate-300 border border-white/5 focus:outline-none truncate w-full">
                  {LIGHTING_LIST.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-medium">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* MICRO-INTERACTION TOMBOL (Gradient Bergeser Kilau + Expand) */}
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0px 0px 30px rgba(139, 92, 246, 0.6)" }}
              whileTap={{ scale: 0.97 }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ backgroundPosition: { duration: 4, repeat: Infinity, ease: "linear" } }}
              onClick={handleGenerate}
              disabled={isMounted ? (loading || (!imageRef && !rawPrompt.trim()) || !userApiKey.trim()) : false}
              
              className="w-full mt-1 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-[length:200%_auto] disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-wider shadow-lg shadow-purple-500/20"
            >
              {loading ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" /> Membedah Struktur Visual...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> Ledakkan 50 Variasi Prompt
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* PANEL OUTPUT KANVAS KANAN */}
        <div className="md:col-span-7">
          <AnimatePresence mode="wait">
            {/* STATE LOADING KANVAS DENGAN PESAN KHUSUS */}
            {loading ? (
              <motion.div
                key="loading-canvas"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="dark-glass h-[620px] rounded-2xl flex flex-col items-center justify-center p-8 text-center border-dashed border-white/10 relative overflow-hidden backdrop-blur-md"
              >
                <div className="mesh-glow top-0 left-0 bg-indigo-500/10 pointer-events-none w-full h-full opacity-50" />
                <RotateCcw className="w-12 h-12 text-indigo-400 animate-spin mb-6 relative z-10" />
                <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 uppercase tracking-tighter mb-2 relative z-10 font-mono animate-pulse">
                  Mohon bersabar
                </h3>
                <p className="text-xs text-slate-300 max-w-sm leading-relaxed relative z-10 font-medium">
                  Prompt lo lagi diracik biar tajam, steril, and anti-reject.<br />
                  Lagi gw bom pake data riset terdalam bray!
                </p>
              </motion.div>
            ) : outputPrompts ? (
              <motion.div
                key="output"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="dark-glass p-6 rounded-2xl flex flex-col gap-4 max-h-[85vh] overflow-hidden backdrop-blur-xl"
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2 pr-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Hasil Penggandaan {outputPrompts.length} Prompt Selesai
                  </h2>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleCopyAll}
                      className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 rounded-xl text-[10px] text-emerald-400 font-extrabold tracking-wide flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <ClipboardCopy className="w-3.5 h-3.5" /> {copiedAll ? 'Disalin!' : 'Salin Semua'}
                    </motion.button>
                    {/* TOMBOL RESET KANVAS KOSONG MELOMPONG */}
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleResetCanvas}
                      className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 rounded-xl text-[10px] text-red-400 font-extrabold tracking-wide flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Bersihkan
                    </motion.button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 overflow-y-auto pr-1 select-text custom-scrollbar">
                  {outputPrompts.map((promptText, idx) => (
                    <div key={idx} className="group relative p-3.5 bg-slate-950/70 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all flex flex-col gap-2">
                      <div className="flex justify-between items-center z-10 relative">
                        <span className="text-[10px] text-indigo-400 font-black font-mono">#VARIASI {idx + 1}</span>
                        <button
                          onClick={() => handleCopySingle(promptText, idx)}
                          className="text-[10px] text-slate-400 group-hover:text-indigo-300 flex items-center gap-1 transition-all cursor-pointer font-bold opacity-80 group-hover:opacity-100"
                        >
                          {copiedIndex === idx ? 'Disalin!' : <><Copy className="w-3" /> Salin</>}
                        </button>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-mono select-all relative z-10 pr-2">
                        {promptText}
                      </p>
                      <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-slate-950/80 to-transparent pointer-events-none group-hover:opacity-0 transition-opacity" />
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              /* KANVAS MOTIVASI KANAN DENGAN SEMUA KONSEP AKTIF SAKTI */
              <motion.div 
                initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="dark-glass h-[620px] rounded-2xl flex flex-col items-center justify-center p-8 text-center border-dashed border-white/10 relative overflow-hidden backdrop-blur-md"
              >
                <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full text-indigo-400 mb-4 animate-bounce">
                  <Sparkles className="w-6 h-6" />
                </div>
                
                {/* JUDUL SEKARANG IKUT NGETIK BERJALAN BRAY (Anti-Patung) */}
                <motion.h3 
                  className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 uppercase tracking-tighter mb-4 select-none filter drop-shadow-[0_15px_15px_rgba(168,85,247,0.25)] min-h-[50px] font-mono"
                >
                  {typedTitle}
                  {typedTitle.length < fullTitleText.length && (
                    <span className="animate-ping text-pink-500 font-extrabold ml-1">|</span>
                  )}
                </motion.h3>
                
                {/* Teks Deskripsi Estafet Ngetik Otomatis */}
                <div className="text-xs text-slate-300 max-w-md leading-relaxed font-medium min-h-[80px] select-none font-mono tracking-wide px-4">
                  {typedText}
                  {typedTitle.length === fullTitleText.length && typedText.length < fullMotivationText.length && (
                    <span className="animate-pulse text-indigo-400 font-extrabold ml-1 text-sm">|</span>
                  )}
                </div>
                
                <p className="text-[10px] text-slate-500 mt-5 italic select-none">
                  Ketik konsep ide lo di panel kiri atau upload image bocoran trend, lalu klik tombol ledakkan!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* FOOTER PREMIUM PERSONAL BRAND */}
      <footer className="w-full max-w-6xl mt-12 pt-6 border-t border-slate-900/60 text-center flex flex-col gap-1 z-10 select-none">
        <p className="text-xs font-bold text-slate-500 font-mono tracking-wider">
          Copyright © agunkdesain 2026
        </p>
        <p className="text-[10px] font-medium text-indigo-400/80 italic tracking-wide">
          Temen lo sukses bareng ..
        </p>
      </footer>
    </main>
  );
}