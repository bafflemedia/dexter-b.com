import React, { useState } from 'react';
import { 
  Search, Calendar, Link as LinkIcon, ShoppingCart, FileText, Monitor, 
  ChevronRight, Star, MapPin, ChevronLeft, Cpu, Gamepad2, Layers, 
  Disc, Film, Mic2, Zap, Home, Cat, Mail, MessageSquare, ShieldCheck
} from 'lucide-react';

// Baffle Media Standard Architecture
// Material Science: Brushed Stainless Steel, SW Cyberspace, Anchor's Aweigh
// Brand: DexterB (Polymath / Retired Software Engineer)

const App = () => {
  const [activeGearIndex, setActiveGearIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const featuredGear = [
    { 
      id: 1, 
      name: 'Fanatec DD2 Wheel Base', 
      desc: 'The direct-drive backbone of the Sim Rig build.', 
      link: '#',
      img: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=800' 
    },
    { 
      id: 2, 
      name: 'Shure SM7B Microphone', 
      desc: 'Signal clarity for high-fidelity broadcasts.', 
      link: '#',
      img: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=800' 
    },
    { 
      id: 3, 
      name: 'LG 49" UltraWide', 
      desc: 'Maximum screen real-estate for SE workflows.', 
      link: '#',
      img: 'https://images.unsplash.com/photo-1547119957-630f9c47b79f?auto=format&fit=crop&q=80&w=800' 
    },
  ];

  const manifestCategories = [
    { id: 'compute', name: 'Compute Node', icon: <Cpu size={32} />, desc: 'Hardware & Core Systems' },
    { id: 'input', name: 'Tactical Input', icon: <Gamepad2 size={32} />, desc: 'Peripherals & Controls' },
    { id: 'vr', name: 'Spatial VR', icon: <Layers size={32} />, desc: 'Immersive Gear' },
    { id: 'games', name: 'Gaming Archives', icon: <Disc size={32} />, desc: 'Owned & Reviewed' },
    { id: 'media', name: 'Media Archives', icon: <Film size={32} />, desc: 'Cinema & Broadcast' },
    { id: 'signal', name: 'Signal Chain', icon: <Mic2 size={32} />, desc: 'Studio & Lighting' },
    { id: 'mesh', name: 'Nexus Mesh', icon: <Zap size={32} />, desc: 'Automation & Smart Tech' },
    { id: 'domestic', name: 'Domestic Logistics', icon: <Home size={32} />, desc: 'Home, Decor & Sustainment' },
    { id: 'nelly', name: 'Feline Logistics', icon: <Cat size={32} />, desc: 'Biometric Assets (Nelly)' },
  ];

  const nextGear = () => setActiveGearIndex((prev) => (prev + 1) % featuredGear.length);
  const prevGear = () => setActiveGearIndex((prev) => (prev - 1 + featuredGear.length) % featuredGear.length);

  return (
    <div className="min-h-screen bg-[#2b3d4f] text-[#e2e8f0] font-sans selection:bg-[#e2001a] selection:text-white relative overflow-x-hidden">
      {/* Background Engineering Grid */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: `linear-gradient(#8a8e91 1px, transparent 1px), linear-gradient(90deg, #8a8e91 1px, transparent 1px)`, backgroundSize: '50px 50px' }}>
      </div>

      {/* Header / Hero Section */}
      <header className="pt-24 pb-16 px-4 max-w-7xl mx-auto text-center relative z-20">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-[#e2001a] to-transparent shadow-[0_0_15px_#e2001a]"></div>
        
        {/* REFACTORED BRUSHED STAINLESS STEEL 3D LOGO */}
        <div className="relative inline-block px-16 py-10 group"> 
            <h1 className="absolute inset-0 px-16 py-10 text-6xl sm:text-8xl md:text-[10.5rem] font-black uppercase tracking-[0.05em] leading-none
                           text-black translate-x-2 translate-y-2 select-none blur-[1px]">
              Dexter B
            </h1>
            
            <h1 className="absolute inset-0 px-16 py-10 text-6xl sm:text-8xl md:text-[10.5rem] font-black uppercase tracking-[0.05em] leading-none
                           text-transparent select-none z-10"
                style={{ 
                  WebkitTextStroke: '2px #334155',
                  textShadow: `
                    1px 1px 0px #1e293b,
                    2px 2px 0px #1e293b,
                    3px 3px 0px #0f172a,
                    4px 4px 0px #0f172a,
                    5px 5px 0px #020617,
                    6px 6px 0px #020617,
                    12px 12px 25px rgba(0,0,0,0.8)
                  `
                }}>
              Dexter B
            </h1>

            <h1 className="relative text-6xl sm:text-8xl md:text-[10.5rem] font-black uppercase tracking-[0.05em] leading-none
                           text-transparent bg-clip-text bg-gradient-to-b from-[#f1f5f9] via-[#cbd5e1] to-[#94a3b8]
                           relative z-20 transition-all duration-700">
              Dexter B
            </h1>
            
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
        </div>
        
        {/* Embossed Subtitle Depth */}
        <p className="text-[#8a8e91] text-[10px] md:text-xs max-w-5xl mx-auto uppercase tracking-[0.4em] font-black leading-relaxed mt-4
                      drop-shadow-[2px_2px_1px_rgba(0,0,0,0.8)]"
           style={{ textShadow: '1px 1px 0px rgba(255,255,255,0.05)' }}>
          Polymath • <span className="text-[#f97316] drop-shadow-none">Signal Processing</span> • Gaming Veteran • Nerd Culture Heritage • Retired Software Engineer
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-12 space-y-32 relative z-10">
        
        {/* Navigation Matrix */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <NavCard icon={<Monitor />} title="Signal Flow" desc="Primary broadcasts & Twitch archives." />
          <NavCard icon={<FileText />} title="The Blueprint" desc="Technical schematics & SE Logic Scrubs." />
          <NavCard icon={<MapPin />} title="Field Recon" desc="Location scouting & perimeter checks." />
        </section>

        {/* SPOTLIGHT GEAR */}
        <section className="space-y-8">
            <div className="flex items-center gap-4">
                 <h2 className="text-2xl font-black uppercase tracking-widest text-[#f97316]"
                     style={{ textShadow: '2px 2px 2px rgba(0,0,0,0.8), -1px -1px 0px rgba(255,255,255,0.05)' }}>
                   Spotlight Gear
                 </h2>
                 <div className="h-px flex-1 bg-gradient-to-r from-[#f97316]/50 to-transparent"></div>
            </div>
            
            <div className="relative bg-[#434b53]/40 backdrop-blur-md rounded-xl border-t border-l border-white/10 border-b border-r border-black/60 shadow-[30px_30px_60px_-15px_rgba(0,0,0,0.8)] min-h-[450px] flex overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none opacity-40"></div>
                <div className="absolute top-0 right-0 p-6 font-mono text-[10px] text-[#8a8e91] tracking-widest uppercase opacity-40 z-20">Node_ID_00{activeGearIndex + 1}</div>
                
                <div className="flex flex-col md:flex-row w-full relative z-10">
                    {/* Visual Asset Section */}
                    <div className="w-full md:w-1/2 relative bg-[#1a2632] overflow-hidden">
                        <img 
                            key={activeGearIndex} 
                            src={featuredGear[activeGearIndex].img} 
                            alt={featuredGear[activeGearIndex].name}
                            className="w-full h-64 md:h-full object-cover opacity-60 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700 animate-in fade-in zoom-in-110"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800';
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#434b53]/40 hidden md:block"></div>
                    </div>

                    {/* Description Section */}
                    <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center md:items-start text-center md:text-left bg-gradient-to-br from-transparent to-black/20">
                        <h3 className="text-3xl md:text-5xl font-black text-[#f8fafc] uppercase tracking-tighter mb-4 italic leading-none drop-shadow-[4px_4px_0px_#1a2632]">
                            {featuredGear[activeGearIndex].name}
                        </h3>
                        <p className="text-[#8a8e91] font-mono text-xs md:text-sm uppercase tracking-[0.2em] max-w-lg leading-relaxed italic drop-shadow-md">
                            {featuredGear[activeGearIndex].desc}
                        </p>
                        
                        <div className="flex items-center gap-4 mt-10">
                            <button onClick={prevGear} className="p-3 hover:text-[#f97316] transition-all bg-[#2b3d4f]/95 rounded-full border border-white/5 shadow-xl active:scale-90"><ChevronLeft size={24}/></button>
                            <a href={featuredGear[activeGearIndex].link} className="px-10 py-4 bg-[#f97316] text-[#2b3d4f] font-black uppercase text-xs tracking-[0.2em] hover:bg-white transition-all transform hover:-translate-y-1 active:scale-95 skew-x-[-12deg] shadow-[8px_8px_0px_#000]">
                                Access Specs
                            </a>
                            <button onClick={nextGear} className="p-3 hover:text-[#f97316] transition-all bg-[#2b3d4f]/95 rounded-full border border-white/5 shadow-xl active:scale-90"><ChevronRight size={24}/></button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* THE MANIFEST */}
        <section className="space-y-12 pb-20">
          <div className="text-center space-y-4">
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-[#f97316] uppercase italic"
                style={{ textShadow: '4px 4px 4px rgba(0,0,0,0.6), -1px -1px 0px rgba(255,255,255,0.05)' }}>
              Manifest
            </h2>
            <p className="text-[#8a8e91] font-mono text-[10px] uppercase tracking-[0.4em]"
               style={{ textShadow: '2px 2px 2px rgba(0,0,0,0.8), -1px -1px 0px rgba(255,255,255,0.05)' }}>
              Cross-Referenced Resource Categorization
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {manifestCategories.map((cat) => (
              <CategoryTile 
                key={cat.id} 
                icon={cat.icon} 
                name={cat.name} 
                desc={cat.desc}
              />
            ))}
          </div>
        </section>

      </main>

      {/* REFACTORED FOOTER */}
      <footer className="border-t border-[#434b53] py-20 px-6 bg-[#1a2632] relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-[#8a8e91] text-[10px] font-mono uppercase tracking-[0.4em]">
          <div className="text-center md:text-left space-y-2">
            <p className="font-black text-[#f97316] tracking-[0.6em] mb-3"
               style={{ textShadow: '2px 2px 2px rgba(0,0,0,0.5), -1px -1px 0px rgba(255,255,255,0.02)' }}>
                BAFFLE MEDIA, L.L.C.
            </p>
            <p style={{ textShadow: '2px 2px 2px rgba(0,0,0,0.8)' }}>© 2026 DEXTER B / BAFFLE MEDIA, L.L.C.</p>
            <p className="opacity-40 text-[8px]" style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.5)' }}>TRANSMISSION SECURED // END OF LINE</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-12">
            <a href="mailto:contact@dexter-b.com" 
               className="flex items-center gap-2 hover:text-[#f97316] transition-colors group"
               style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.8), -1px -1px 0px rgba(255,255,255,0.05)' }}>
                <Mail size={14} className="group-hover:scale-110 transition-transform" /> Contact Me
            </a>
            <a href="#" 
               className="flex items-center gap-2 hover:text-[#f97316] transition-colors group"
               style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.8), -1px -1px 0px rgba(255,255,255,0.05)' }}>
                <MessageSquare size={14} className="group-hover:scale-110 transition-transform" /> Support
            </a>
            <a href="#" 
               className="flex items-center gap-2 hover:text-[#f97316] transition-colors group"
               style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.8), -1px -1px 0px rgba(255,255,255,0.05)' }}>
                <ShieldCheck size={14} className="group-hover:scale-110 transition-transform" /> Privacy & Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const NavCard = ({ icon, title, desc, opacity = "opacity-100" }) => (
  <a href="#" className={`group relative block p-8 rounded-lg bg-[#434b53]/60 border-t border-l border-white/10 border-b border-r border-black/60 transition-all duration-500 hover:-translate-y-2 hover:border-[#f97316]/50 shadow-[15px_15px_40px_-10px_rgba(0,0,0,0.6)] overflow-hidden backdrop-blur-md ${opacity}`}>
    <div className="absolute inset-0 border border-white/5 rounded-lg pointer-events-none opacity-20"></div>
    <div className="text-[#8a8e91] mb-8 group-hover:text-[#e2001a] transition-all transform group-hover:scale-110 drop-shadow-[8px_8px_12px_rgba(0,0,0,0.7)]">
      {icon}
    </div>
    <h3 className="text-2xl font-black mb-3 text-[#f97316] uppercase tracking-tighter italic group-hover:text-white transition-colors drop-shadow-[3px_3px_5px_rgba(0,0,0,0.6)]">
      {title}
    </h3>
    <p className="text-[10px] text-[#e2e8f0]/60 font-mono leading-relaxed uppercase tracking-widest drop-shadow-[2px_2px_4px_rgba(0,0,0,0.5)]">
      {desc}
    </p>
    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#e2001a] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-500"></div>
  </a>
);

const CategoryTile = ({ icon, name, desc }) => (
  <button className="group relative aspect-square md:aspect-video bg-[#434b53]/30 border-t border-l border-white/5 border-b border-r border-black/60 rounded-lg flex flex-col items-center justify-center p-6 hover:border-[#f97316]/60 transition-all hover:bg-[#2b3d4f]/95 shadow-[20px_20px_45px_-15px_rgba(0,0,0,0.7)] overflow-hidden active:scale-95 active:shadow-inner">
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-40 pointer-events-none"></div>
    <div className="text-[#8a8e91] group-hover:text-[#f97316] transition-all group-hover:scale-125 mb-4 duration-500 drop-shadow-[10px_10px_15px_rgba(0,0,0,0.8)]">
      {icon}
    </div>
    <h4 className="text-sm md:text-xl font-black uppercase tracking-tighter text-[#e2e8f0] group-hover:text-white mb-1 drop-shadow-[4px_4px_6px_rgba(0,0,0,0.6)]">
      {name}
    </h4>
    <span className="hidden md:block text-[9px] font-mono text-[#8a8e91] uppercase tracking-widest opacity-60 group-hover:opacity-100 italic drop-shadow-md">
      {desc}
    </span>
    <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity duration-700 rotate-12 pointer-events-none">
      {icon}
    </div>
  </button>
);

export default App;