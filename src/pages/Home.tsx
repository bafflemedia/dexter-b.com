import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Monitor, MapPin, ChevronRight, ChevronLeft, Cpu, 
  Gamepad2, Layers, Disc, Film, Mic2, Zap, Home as HomeIcon, Cat, 
  ShoppingCart, Link as LinkIcon
} from 'lucide-react';

// --- SYSTEM CONTRACTS ---

interface ManifestItem {
  id: string;
  name: string;
  spotlight?: boolean;
  image?: string;
  copy?: string;
  amazon?: string;
  direct?: string;
}

interface NavCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  to: string;
  opacity?: string;
}

interface CategoryTileProps {
  icon: React.ReactNode;
  name: string;
  desc: string;
}

const Home: React.FC = () => {
  const [manifestData, setManifestData] = useState<ManifestItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeGearIndex, setActiveGearIndex] = useState<number>(0);

  // The Telemetry Handshake: Fetch Notion data via our local/prod Node Bridge
  useEffect(() => {
    const fetchManifest = async () => {
      try {
        const response = await fetch('/api/manifest'); 
        
        if (!response.ok) throw new Error('Signal lost during Notion handshake.');
        
        const data: ManifestItem[] = await response.json();
        setManifestData(data);
      } catch (error) {
        console.error('[SYSTEM FAILURE]', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchManifest();
  }, []);

  const spotlightGear = manifestData.filter(gear => gear.spotlight);

  const nextGear = () => {
    if (spotlightGear.length > 0) {
      setActiveGearIndex((prev) => (prev + 1) % spotlightGear.length);
    }
  };

  const prevGear = () => {
    if (spotlightGear.length > 0) {
      setActiveGearIndex((prev) => (prev - 1 + spotlightGear.length) % spotlightGear.length);
    }
  };

  const manifestCategories = [
    { id: 'compute', name: 'Compute Node', icon: <Cpu size={32} />, desc: 'Hardware & Core Systems' },
    { id: 'input', name: 'Tactical Input', icon: <Gamepad2 size={32} />, desc: 'Peripherals & Controls' },
    { id: 'vr', name: 'Spatial VR', icon: <Layers size={32} />, desc: 'Immersive Gear' },
    { id: 'games', name: 'Gaming Archives', icon: <Disc size={32} />, desc: 'Owned & Reviewed' },
    { id: 'media', name: 'Media Archives', icon: <Film size={32} />, desc: 'Cinema & Broadcast' },
    { id: 'signal', name: 'Signal Chain', icon: <Mic2 size={32} />, desc: 'Studio & Lighting' },
    { id: 'mesh', name: 'Nexus Mesh', icon: <Zap size={32} />, desc: 'Automation & Smart Tech' },
    { id: 'domestic', name: 'Domestic Logistics', icon: <HomeIcon size={32} />, desc: 'Home, Decor & Sustainment' },
    { id: 'nelly', name: 'Feline Logistics', icon: <Cat size={32} />, desc: 'Biometric Assets (Nelly)' },
  ];

  return (
    <>
      {/* Header / Hero Section */}
      <header className="pt-24 pb-16 px-4 max-w-7xl mx-auto text-center relative z-20">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-[#e2001a] to-transparent shadow-[0_0_15px_#e2001a]"></div>
        
        <div className="relative inline-block px-16 py-10 group"> 
            <h1 className="absolute inset-0 px-16 py-10 text-6xl sm:text-8xl md:text-[10.5rem] font-black uppercase tracking-[0.05em] leading-none text-black translate-x-2 translate-y-2 select-none blur-[1px]">
              Dexter B
            </h1>
            
            <h1 className="absolute inset-0 px-16 py-10 text-6xl sm:text-8xl md:text-[10.5rem] font-black uppercase tracking-[0.05em] leading-none text-transparent select-none z-10"
                style={{ 
                  WebkitTextStroke: '2px #334155',
                  textShadow: '1px 1px 0px #1e293b, 2px 2px 0px #1e293b, 3px 3px 0px #0f172a, 4px 4px 0px #0f172a, 5px 5px 0px #020617, 6px 6px 0px #020617, 12px 12px 25px rgba(0,0,0,0.8)'
                }}>
              Dexter B
            </h1>

            <h1 className="text-6xl sm:text-8xl md:text-[10.5rem] font-black uppercase tracking-[0.05em] leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#f1f5f9] via-[#cbd5e1] to-[#94a3b8] z-20 transition-all duration-700">
              Dexter B
            </h1>
            
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
        </div>
        
        <p className="text-[#8a8e91] text-[10px] md:text-xs max-w-5xl mx-auto uppercase tracking-[0.4em] font-black leading-relaxed mt-4 drop-shadow-[2px_2px_1px_rgba(0,0,0,0.8)]"
           style={{ textShadow: '1px 1px 0px rgba(255,255,255,0.05)' }}>
          Polymath • <span className="text-[#f97316] drop-shadow-none">Signal Processing</span> • Gaming Veteran • Nerd Culture Heritage • Retired Software Engineer
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-12 space-y-32 relative z-10">
        
        {/* Navigation Matrix */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <NavCard icon={<Monitor />} title="Signal Flow" desc="Primary broadcasts & Twitch archives." to="/" />
          <NavCard icon={<FileText />} title="The Blueprint" desc="Technical schematics & SE Logic Scrubs." to="/bats" />
          <NavCard icon={<MapPin />} title="Field Recon" desc="Location scouting & perimeter checks." to="/" />
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
            
            <div className="relative bg-[#434b53]/40 backdrop-blur-md rounded-xl border border-white/10 shadow-[30px_30px_60px_-15px_rgba(0,0,0,0.8)] min-h-[450px] flex overflow-hidden group">
                {isLoading ? (
                    <div className="w-full h-[450px] flex flex-col items-center justify-center text-[#8a8e91] font-mono tracking-widest uppercase animate-pulse">
                        <Cpu className="mb-4 text-[#f97316] animate-spin-slow" size={48} />
                        Establishing Node Connection...
                    </div>
                ) : spotlightGear.length > 0 ? (
                    <div className="flex flex-col md:flex-row w-full relative z-10">
                        <div className="w-full md:w-1/2 relative bg-[#1a2632] overflow-hidden">
                            <img 
                                key={activeGearIndex} 
                                src={spotlightGear[activeGearIndex].image || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'} 
                                alt={spotlightGear[activeGearIndex].name}
                                className="w-full h-64 md:h-full object-cover opacity-60 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700 animate-in fade-in zoom-in-110"
                            />
                        </div>

                        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center md:items-start text-center md:text-left">
                            <h3 className="text-3xl md:text-5xl font-black text-[#f8fafc] uppercase tracking-tighter mb-4 italic leading-none drop-shadow-[4px_4px_0px_#1a2632]">
                                {spotlightGear[activeGearIndex].name}
                            </h3>
                            <p className="text-[#8a8e91] font-mono text-xs md:text-sm uppercase tracking-[0.1em] max-w-lg leading-relaxed italic">
                                {spotlightGear[activeGearIndex].copy || "Awaiting intelligence payload for this sector."}
                            </p>
                            
                            <div className="flex items-center gap-4 mt-10">
                                <button onClick={prevGear} className="p-3 hover:text-[#f97316] transition-all bg-[#2b3d4f]/95 rounded-full border border-white/5 shadow-xl"><ChevronLeft size={24}/></button>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {spotlightGear[activeGearIndex].amazon && (
                                        <a href={spotlightGear[activeGearIndex].amazon} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-[#f97316] text-[#2b3d4f] font-black uppercase text-[10px] tracking-[0.2em] shadow-[6px_6px_0px_#000]">
                                            <ShoppingCart size={16} /> Amazon
                                        </a>
                                    )}
                                    {spotlightGear[activeGearIndex].direct && (
                                        <a href={spotlightGear[activeGearIndex].direct} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-[#434b53] border border-white/10 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-[6px_6px_0px_#000]">
                                            <LinkIcon size={16} /> Direct
                                        </a>
                                    )}
                                </div>
                                <button onClick={nextGear} className="p-3 hover:text-[#f97316] transition-all bg-[#2b3d4f]/95 rounded-full border border-white/5 shadow-xl"><ChevronRight size={24}/></button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-[450px] flex flex-col items-center justify-center text-[#8a8e91] font-mono tracking-widest uppercase">
                        <Monitor className="mb-4 text-[#8a8e91] opacity-50" size={48} />
                        No active Spotlight gear detected.
                    </div>
                )}
            </div>
        </section>

        {/* THE MANIFEST */}
        <section className="space-y-12 pb-20">
          <div className="text-center space-y-4">
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-[#f97316] uppercase italic"
                style={{ textShadow: '4px 4px 4px rgba(0,0,0,0.6), -1px -1px 0px rgba(255,255,255,0.05)' }}>
              Manifest
            </h2>
            <p className="text-[#8a8e91] font-mono text-[10px] uppercase tracking-[0.4em]">
              Cross-Referenced Resource Categorization
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {manifestCategories.map((cat) => (
              <CategoryTile key={cat.id} icon={cat.icon} name={cat.name} desc={cat.desc} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
};

// --- SUB-COMPONENTS ---

const NavCard: React.FC<NavCardProps> = ({ icon, title, desc, to, opacity = "opacity-100" }) => (
  <Link to={to} className={`group relative block p-8 rounded-lg bg-[#434b53]/60 border border-white/10 transition-all duration-500 hover:-translate-y-2 hover:border-[#f97316]/50 shadow-[15px_15px_40px_-10px_rgba(0,0,0,0.6)] overflow-hidden backdrop-blur-md ${opacity}`}>
    <div className="text-[#8a8e91] mb-8 group-hover:text-[#e2001a] transition-all transform group-hover:scale-110">
      {icon}
    </div>
    <h3 className="text-2xl font-black mb-3 text-[#f97316] uppercase tracking-tighter italic group-hover:text-white transition-colors">
      {title}
    </h3>
    <p className="text-[10px] text-[#e2e8f0]/60 font-mono leading-relaxed uppercase tracking-widest">
      {desc}
    </p>
    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#e2001a] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-500"></div>
  </Link>
);

const CategoryTile: React.FC<CategoryTileProps> = ({ icon, name, desc }) => (
  <button className="group relative aspect-square md:aspect-video bg-[#434b53]/30 border border-white/5 rounded-lg flex flex-col items-center justify-center p-6 hover:border-[#f97316]/60 transition-all hover:bg-[#2b3d4f]/95 shadow-[20px_20px_45px_-15px_rgba(0,0,0,0.7)] overflow-hidden active:scale-95">
    <div className="text-[#8a8e91] group-hover:text-[#f97316] transition-all group-hover:scale-125 mb-4 duration-500">
      {icon}
    </div>
    <h4 className="text-sm md:text-xl font-black uppercase tracking-tighter text-[#e2e8f0] group-hover:text-white mb-1">
      {name}
    </h4>
    <span className="hidden md:block text-[9px] font-mono text-[#8a8e91] uppercase tracking-widest opacity-60 italic">
      {desc}
    </span>
  </button>
);

export default Home;