import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { 
  Camera, Barcode, UploadCloud, Settings, CheckCircle, Zap, Trash2, Cpu,
  DollarSign, User, MapPin, ExternalLink, RefreshCw, ShoppingBag, FolderKanban,
  ShieldAlert, FileText, UserCheck, Wrench, PackageOpen, Link as LinkIcon,
  FileImage, PlusCircle, Search, Receipt, AlertTriangle, Video, CheckSquare
} from 'lucide-react';

// --- TYPE DEFINITIONS (The Blueprint) ---
interface Config {
  apiKey: string;
  databaseId: string;
  bridgeUrl: string;
  mode: 'mock' | 'live';
}

interface AssetData {
  name: string; 
  categoryId: string; 
  locationId: string; 
  projectIds: string[]; 
  index: string; 
  assetClass: string; 
  status: string; 
  price: string; 
  serialNumber: string; 
  manufacturer: string; 
  warrantyExp: string; 
  powerDraw: string; 
  notes: string; 
  aiFieldNote: string; 
  primaryUser: string; 
  syncStatus: string; 
  isPersonalTransfer: boolean;
  manualLink?: string;
  referenceVideoUrl: string;
  functionalCheck: boolean;
  photoGallery: string[]; 
}

interface ReceiptData {
  id: string; 
  merchantId: string; 
  date: string; 
  totalPrice: string;
  qbTransactionId: string; 
  sourceUrl: string;
}

interface VaultData {
  baffleId: string | null;
  batsUrl: string | null;
}

// --- MOCK DATA TYPES ---
interface MockCategory { id: string; name: string; code: string; lastIndex: number; }
interface MockLocation { id: string; name: string; }
interface MockProject { id: string; name: string; }
interface MockReceipt { id: string; name: string; date: string; merchantName: string; }
interface MockMerchant { id: string; name: string; type: string; }

// ALIGNMENT UPDATE: Pointing directly to the newly established Express protected route
const INITIAL_CONFIG: Config = { apiKey: '', databaseId: '', bridgeUrl: '/api/bats', mode: 'mock' };

// --- MOCK RELATIONS (Target for v1.4 GET request replacement) ---
const mockCategories: MockCategory[] = [
  { id: 'cat1', name: 'Visuals - Displays', code: 'VIS', lastIndex: 1 },
  { id: 'cat2', name: 'Computing', code: 'CMP', lastIndex: 108 },
  { id: 'cat3', name: 'Lighting', code: 'LGT', lastIndex: 12 },
  { id: 'cat4', name: 'Audio', code: 'AUD', lastIndex: 88 },
  { id: 'cat5', name: 'Sim-Rig', code: 'SIM', lastIndex: 5 },
  { id: 'cat6', name: 'Tools & Shop', code: 'TLS', lastIndex: 14 }, 
  { id: 'cat7', name: 'Consumables & Supplies', code: 'CNS', lastIndex: 42 }, 
  { id: 'cat8', name: 'Furniture & Fixtures', code: 'FNR', lastIndex: 8 } 
];

const mockLocations: MockLocation[] = [
  { id: 'loc1', name: 'Studio A' }, { id: 'loc2', name: 'Storage' },
  { id: 'loc3', name: 'Server Rack (Ugreen NAS)' }, { id: 'loc4', name: 'Workshop/Garage' }
];

const mockProjects: MockProject[] = [
  { id: 'prj1', name: 'BASE (Studio Remodel)' }, { id: 'prj2', name: 'NAS Build' }, { id: 'prj3', name: 'Gaming Rig' }
];

const mockReceipts: MockReceipt[] = [
  { id: 'rcpt1', name: 'Amazon Order 114-559...', date: '2026-04-26', merchantName: 'Amazon' },
  { id: 'rcpt2', name: 'Micro Center Run', date: '2026-04-25', merchantName: 'Micro Center' },
  { id: 'rcpt3', name: 'Home Depot Supplies', date: '2026-04-22', merchantName: 'Home Depot' }
];

const mockMerchants: MockMerchant[] = [
  { id: 'merch1', name: 'Amazon', type: 'Online' }, { id: 'merch2', name: 'Micro Center', type: 'Brick & Mortar' },
  { id: 'merch3', name: 'B&H Photo', type: 'Hybrid' }, { id: 'merch4', name: 'Home Depot', type: 'Brick & Mortar' },
  { id: 'merch5', name: 'Fanatec', type: 'Direct/Vendor' }, { id: 'merch_dex', name: 'DexterB (Owner)', type: 'Internal Equity' } 
];

export default function BaffleAssetPro() {
  // --- STATE MANAGEMENT ---
  const [config, setConfig] = useState<Config>(INITIAL_CONFIG);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false); 
  const [vaultData, setVaultData] = useState<VaultData>({ baffleId: null, batsUrl: null });

  const [asset, setAsset] = useState<AssetData>({
    name: '', categoryId: '', locationId: '', projectIds: [], index: '', 
    assetClass: 'Expensed (Section 179)', status: 'Available', price: '', 
    serialNumber: '', manufacturer: '', warrantyExp: '', powerDraw: '', 
    notes: '', aiFieldNote: '', primaryUser: 'DexterB', syncStatus: 'Draft', 
    isPersonalTransfer: false, referenceVideoUrl: '', functionalCheck: false, photoGallery: []
  });

  const [receiptMode, setReceiptMode] = useState<'existing' | 'new'>('existing'); 
  const [receipt, setReceipt] = useState<ReceiptData>({
    id: '', merchantId: '', date: new Date().toISOString().split('T')[0],
    totalPrice: '', qbTransactionId: '', sourceUrl: ''
  });

  // --- REFS & PREVIEWS ---
  const photoRef = useRef<HTMLInputElement>(null);
  const receiptFileRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [receiptFilePreview, setReceiptFilePreview] = useState<string | null>(null);

  // --- HANDLERS (The Logic Scrub) ---
  const handleAssetChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setAsset(prev => ({ ...prev, [name]: checked }));
    } else {
      setAsset(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleReceiptChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setReceipt(prev => ({ ...prev, [name]: value }));
  };

  const toggleProject = (id: string) => {
    setAsset(prev => {
      const exists = prev.projectIds.includes(id);
      return { ...prev, projectIds: exists ? prev.projectIds.filter(p => p !== id) : [...prev.projectIds, id] };
    });
  };

  const togglePersonalTransfer = () => {
    setAsset(prev => {
      const isTransferring = !prev.isPersonalTransfer;
      if (isTransferring) setReceiptMode('new'); 
      return {
        ...prev,
        isPersonalTransfer: isTransferring,
        notes: isTransferring 
          ? 'Personal asset transferred to business inventory at Fair Market Value. Owner Equity Contribution.' 
          : prev.notes
      };
    });
    setReceipt(prev => ({
      ...prev,
      merchantId: !asset.isPersonalTransfer ? 'merch_dex' : '', 
      qbTransactionId: !asset.isPersonalTransfer ? 'OWNER-EQUITY' : '',
    }));
  };

  useEffect(() => {
    if (asset.categoryId) {
      const cat = mockCategories.find(c => c.id === asset.categoryId);
      if (cat) setAsset(prev => ({ ...prev, index: (cat.lastIndex + 1).toString() }));
    }
  }, [asset.categoryId]);

  const handleImageCapture = (e: ChangeEvent<HTMLInputElement>, type: 'photo' | 'receipt') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultUrl = reader.result as string;
        if (type === 'photo') {
          setPhotoPreview(resultUrl);
          setAsset(prev => ({ ...prev, photoGallery: [...prev.photoGallery, resultUrl] }));
        }
        if (type === 'receipt') setReceiptFilePreview(resultUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const executeReset = () => {
    setAsset({
      ...asset, name: '', serialNumber: '', price: '', powerDraw: '', notes: '', aiFieldNote: '', 
      warrantyExp: '', syncStatus: 'Draft', projectIds: [], isPersonalTransfer: false, 
      referenceVideoUrl: '', functionalCheck: false, photoGallery: []
    });
    setReceipt({
      id: '', merchantId: '', date: new Date().toISOString().split('T')[0], 
      totalPrice: '', qbTransactionId: '', sourceUrl: ''
    });
    setVaultData({ baffleId: null, batsUrl: null });
    setPhotoPreview(null); setReceiptFilePreview(null);
    setShowResetModal(false);
  };

  const submitToNotion = async () => {
    setLoading(true);
    try {
      if (config.mode === 'mock') {
        await new Promise(r => setTimeout(r, 1200));
        const catCode = mockCategories.find(c => c.id === asset.categoryId)?.code || "UNK";
        const paddedIndex = asset.index.padStart(3, '0');
        setVaultData({
          baffleId: `BM-${catCode}-${paddedIndex}`,
          batsUrl: `https://baffle.link/BM-${catCode}-${paddedIndex}`
        });
      } else {
        // ALIGNMENT: Packaging exactly what the Express POST route intercepts
        const payload = { assetData: asset, receiptData: receipt };
        console.log("[Baffle Ops] Transmitting payload to bridge:", payload);
        
        const response = await fetch(config.bridgeUrl, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // CRITICAL: This allows the JWT cookie through the perimeter
          body: JSON.stringify(payload) 
        });

        const data = await response.json();
        
        if (response.ok) {
          // CCC Loop Closed. Using the raw Notion page_id as a temporary anchor until Formulas resolve.
          setVaultData({ 
            baffleId: `NODE-${data.page_id.slice(-4).toUpperCase()}`, 
            batsUrl: `https://notion.so/${data.page_id.replace(/-/g, '')}` 
          });
          console.log("[Baffle Ops] Notion Vault Sync Complete. Internal ID:", data.page_id);
        } else {
          console.error("[Baffle Ops] Sync Error:", data.error);
          alert(`Signal Failure: ${data.error}`);
        }
      }
    } catch (error) {
       console.error("[Baffle Ops] Network/Bridge Error:", error);
       alert("Network failure. Verify the Express bridge is active and reachable.");
    } finally {
      setLoading(false);
    }
  };

  const isConsumable = asset.assetClass === 'Consumable';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 pb-44 selection:bg-amber-500/30">
      
      {/* ARE YOU SURE MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl shadow-red-900/20">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <AlertTriangle size={24} />
              <h2 className="text-lg font-black tracking-tight uppercase">Purge Intake?</h2>
            </div>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              This will clear all captured images, notes, and relational data. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetModal(false)} className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors">
                Cancel
              </button>
              <button onClick={executeReset} className="flex-1 py-3 px-4 rounded-xl font-black text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/50 transition-colors">
                Yes, Purge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="text-amber-500 fill-amber-500" size={18} />
            <h1 className="text-xl font-black tracking-tighter italic uppercase text-slate-100">BATS Node</h1>
          </div>
          <p className="text-[9px] text-slate-500 uppercase font-bold tracking-[0.2em] mt-1">
            Optical Intake • {config.mode === 'live' ? 'Live Relay' : 'Offline'}
          </p>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-xl border transition-all ${showSettings ? 'bg-amber-500 border-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
          <Settings size={20} />
        </button>
      </header>

      {/* RELAY CONFIG */}
      {showSettings && (
        <div className="mb-8 p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 shadow-2xl animate-in slide-in-from-top-4">
          <h2 className="text-xs font-bold uppercase text-amber-500 flex items-center gap-2">
            <Cpu size={14} /> Relay Config
          </h2>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-lg">
            <button onClick={() => setConfig({...config, mode: 'mock'})} className={`py-2 text-[10px] font-bold rounded ${config.mode === 'mock' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>MOCK</button>
            <button onClick={() => setConfig({...config, mode: 'live'})} className={`py-2 text-[10px] font-bold rounded ${config.mode === 'live' ? 'bg-amber-600 text-black' : 'text-slate-600'}`}>LIVE</button>
          </div>
        </div>
      )}

      {/* SUCCESS VAULT DATA */}
      {vaultData.baffleId && (
        <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-900/50 rounded-2xl animate-in zoom-in-95 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <div className="flex justify-between items-start">
            <div>
              <label className="text-[10px] font-black uppercase text-emerald-500/70 tracking-widest">Baffle ID Assigned</label>
              <p className="text-2xl font-black text-emerald-400 font-mono tracking-tighter">{vaultData.baffleId}</p>
              {vaultData.batsUrl && (
                <a href={vaultData.batsUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-emerald-500 hover:text-emerald-300 underline mt-1 block">
                  Verify in Vault Database
                </a>
              )}
            </div>
            <CheckCircle className="text-emerald-500" size={24} />
          </div>
        </div>
      )}

      <main className="space-y-5">
        
        {/* PHASE 3: PHYSICAL INDEXING (OPTICAL INTAKE) */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => photoRef.current?.click()} className="group relative aspect-[2/1] bg-slate-900 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-amber-500/50 overflow-hidden transition-all active:scale-95">
            {photoPreview ? <img src={photoPreview} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="Asset" /> : <Camera size={26} className="text-slate-500 group-hover:text-amber-500" />}
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 relative z-10 text-center leading-tight">
              Trinity Shot<br/>({asset.photoGallery.length}/3)
            </span>
            <input type="file" ref={photoRef} className="hidden" accept="image/*" capture="environment" onChange={(e) => handleImageCapture(e, 'photo')} />
          </button>
          
          <button onClick={() => receiptFileRef.current?.click()} className="group relative aspect-[2/1] bg-slate-900 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-amber-500/50 overflow-hidden transition-all active:scale-95">
            {receiptFilePreview ? <img src={receiptFilePreview} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="Receipt" /> : <Receipt size={26} className="text-slate-500 group-hover:text-amber-500" />}
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 relative z-10 text-center leading-tight">Receipt<br/>Doc</span>
            <input type="file" ref={receiptFileRef} className="hidden" accept="image/*" capture="environment" onChange={(e) => handleImageCapture(e, 'receipt')} />
          </button>
        </div>
        
        {/* CORE IDENTITY & CLASSIFICATION */}
        <section className="bg-slate-900/40 p-5 rounded-[2rem] border border-slate-800/50 space-y-4 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Asset Name / Supply Batch</label>
            <input name="name" value={asset.name} onChange={handleAssetChange} placeholder="e.g. Samsung 55 UHD" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-sm focus:border-amber-500 outline-none font-bold placeholder:text-slate-700 transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Asset Class</label>
              <select name="assetClass" value={asset.assetClass} onChange={handleAssetChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs font-bold outline-none text-amber-500">
                <option value="Expensed (Section 179)">Expensed</option>
                <option value="Capitalized">Capitalized</option>
                <option value="Consumable">Consumable</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Category</label>
              <select name="categoryId" value={asset.categoryId} onChange={handleAssetChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs font-bold outline-none text-slate-300">
                <option value="">Select...</option>
                {mockCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* LOGISTICS & ALIGNMENT */}
        <section className="bg-slate-900/20 p-5 rounded-[2rem] border border-slate-800/30 space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest flex items-center gap-1 mb-2">
              <FolderKanban size={12}/> Project Alignment
            </label>
            <div className="flex flex-wrap gap-2">
              {mockProjects.map(p => (
                <button 
                  key={p.id} onClick={() => toggleProject(p.id)}
                  className={`px-3 py-2 rounded-lg text-[10px] font-bold border transition-all active:scale-95 ${
                    asset.projectIds.includes(p.id) ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest flex items-center gap-1"><MapPin size={10}/> Location</label>
            <select name="locationId" value={asset.locationId} onChange={handleAssetChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs font-bold outline-none">
              <option value="">Select...</option>
              {mockLocations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
        </section>

        {/* PHASE 2: FINANCIAL SCRUB (TRANSACTION BINDING) */}
        <section className={`p-5 rounded-[2rem] border space-y-4 transition-colors ${asset.isPersonalTransfer ? 'bg-amber-950/10 border-amber-900/30' : 'bg-slate-900/20 border-slate-800/30'}`}>
          <div className="flex justify-between items-center -mt-1 mb-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest flex items-center gap-1"><Receipt size={12}/> Transaction Binding</label>
            <button onClick={togglePersonalTransfer} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${asset.isPersonalTransfer ? 'bg-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-amber-500'}`}>
              <UserCheck size={12} /> Personal Transfer
            </button>
          </div>

          {!asset.isPersonalTransfer && (
            <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button onClick={() => setReceiptMode('existing')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${receiptMode === 'existing' ? 'bg-slate-800 text-amber-500' : 'text-slate-500'}`}>
                <Search size={12}/> Link Existing
              </button>
              <button onClick={() => setReceiptMode('new')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${receiptMode === 'new' ? 'bg-slate-800 text-amber-500' : 'text-slate-500'}`}>
                <PlusCircle size={12}/> New Entry
              </button>
            </div>
          )}

          {receiptMode === 'existing' && !asset.isPersonalTransfer ? (
            <div className="animate-in fade-in zoom-in-95 duration-200">
               <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Select DB Receipt</label>
               <select name="id" value={receipt.id} onChange={handleReceiptChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs font-bold outline-none focus:border-amber-500 mt-1">
                  <option value="">-- Choose Transaction --</option>
                  {mockReceipts.map(r => <option key={r.id} value={r.id}>{r.merchantName} | {r.date}</option>)}
               </select>
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="relative">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1 mb-1 ml-1"><ShoppingBag size={10}/> Merchant (DB)</label>
                  {asset.isPersonalTransfer ? (
                    <div className="w-full bg-amber-950/20 border border-amber-900/50 rounded-xl px-3 py-3 text-xs font-bold text-amber-500">DexterB (Owner)</div>
                  ) : (
                    <select name="merchantId" value={receipt.merchantId} onChange={handleReceiptChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs font-bold outline-none focus:border-amber-500">
                      <option value="">-- Select Merchant --</option>
                      {mockMerchants.filter(m => m.id !== 'merch_dex').map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.type})</option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Transaction Date</label>
                  <input name="date" type="date" value={receipt.date} onChange={handleReceiptChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-[10px] font-mono outline-none text-slate-300 focus:border-amber-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-[10px] font-black uppercase ml-1 tracking-widest flex items-center gap-1 ${asset.isPersonalTransfer ? 'text-amber-500' : 'text-slate-500'}`}>
                    <DollarSign size={10}/> Receipt Total ($)
                  </label>
                  <input name="totalPrice" disabled={asset.isPersonalTransfer} type="number" value={receipt.totalPrice} onChange={handleReceiptChange} placeholder={asset.isPersonalTransfer ? "N/A" : "0.00"} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs font-mono outline-none focus:border-amber-500 disabled:opacity-30" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest flex items-center gap-1"><FileText size={10}/> QB Trans ID</label>
                  <input name="qbTransactionId" value={receipt.qbTransactionId} onChange={handleReceiptChange} placeholder="e.g. TXN-992" className={`w-full bg-slate-950 border rounded-xl px-3 py-3 text-[10px] font-mono outline-none ${asset.isPersonalTransfer ? 'border-amber-900/50 text-amber-500/70' : 'border-slate-800 text-slate-400 focus:border-amber-500'}`} />
                </div>
              </div>

              {!asset.isPersonalTransfer && (
                <div className="grid grid-cols-1 gap-3 pt-2">
                  <div className="flex gap-2">
                    <div className="flex-1">
                       <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest flex items-center gap-1"><LinkIcon size={10}/> Digital Link / Email</label>
                       <input name="sourceUrl" value={receipt.sourceUrl} onChange={handleReceiptChange} placeholder="Amazon Order URL..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-[10px] outline-none focus:border-amber-500 text-slate-300" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* PHASE 4: AI CONTEXTUALIZATION (TECHNICAL SPECS) */}
        <section className={`p-5 rounded-[2rem] border transition-all duration-300 space-y-4 ${isConsumable ? 'bg-slate-950/50 border-slate-900 opacity-60' : 'bg-slate-900/20 border-slate-800/30'}`}>
           <div className="flex items-center justify-between mb-2">
             <div className="flex items-center gap-2">
               {isConsumable ? <PackageOpen size={14} className="text-slate-600"/> : <Wrench size={14} className="text-slate-500"/>}
               <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                 {isConsumable ? 'Consumable Details' : 'Asset Specs & Financials'}
               </label>
             </div>
           </div>
           
           <div className="grid grid-cols-2 gap-3">
             <div className="col-span-2">
                <label className={`text-[10px] font-black uppercase ml-1 tracking-widest flex items-center gap-1 ${asset.isPersonalTransfer ? 'text-amber-500' : 'text-slate-500'}`}>
                  <DollarSign size={10}/> {asset.isPersonalTransfer ? 'Fair Market Value (FMV)' : 'Unit Price (Cost Basis)'}
                </label>
                <input name="price" type="number" value={asset.price} onChange={handleAssetChange} placeholder={isConsumable ? "Optional (Receipt Total Used)" : "0.00"} className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs font-mono outline-none focus:border-amber-500 ${isConsumable ? 'text-slate-500' : 'text-slate-100'}`} />
                {!asset.isPersonalTransfer && !isConsumable && (
                  <p className="text-[8px] text-slate-600 uppercase font-black ml-1 mt-1 tracking-widest">Used for Depreciation vs Receipt Total</p>
                )}
             </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Manufacturer</label>
              <input name="manufacturer" value={asset.manufacturer} onChange={handleAssetChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-[10px] outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Serial Number</label>
              <input name="serialNumber" disabled={isConsumable} value={asset.serialNumber} onChange={handleAssetChange} placeholder={isConsumable ? "N/A" : ""} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-[10px] font-mono outline-none text-slate-300 focus:border-amber-500 disabled:opacity-50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div>
              <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest flex items-center gap-1"><ShieldAlert size={10}/> Warranty Exp</label>
              <input name="warrantyExp" disabled={isConsumable} type="date" value={asset.warrantyExp} onChange={handleAssetChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-[10px] font-mono outline-none text-slate-400 disabled:opacity-50" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest flex items-center gap-1"><Zap size={10}/> Power (W)</label>
              <input name="powerDraw" disabled={isConsumable} type="number" value={asset.powerDraw} onChange={handleAssetChange} placeholder={isConsumable ? "N/A" : ""} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs font-mono outline-none disabled:opacity-50" />
            </div>
          </div>

          {!isConsumable && (
            <div className="grid grid-cols-1 gap-3 border-t border-slate-800/50 pt-3">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest flex items-center gap-1"><Video size={10}/> Reference Video URL</label>
                <input name="referenceVideoUrl" value={asset.referenceVideoUrl} onChange={handleAssetChange} placeholder="YouTube/Drive manual..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-[10px] outline-none focus:border-amber-500" />
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">General Notes</label>
            <textarea name="notes" value={asset.notes} onChange={handleAssetChange} rows={1} placeholder="Admin/Condition notes..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-[11px] outline-none resize-none focus:border-amber-500" />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-amber-500/80 ml-1 tracking-widest flex items-center gap-1"><Cpu size={10}/> AI Field Note</label>
            <textarea name="aiFieldNote" value={asset.aiFieldNote} onChange={handleAssetChange} rows={2} placeholder="NotebookLM context..." className="w-full bg-slate-950 border border-amber-900/40 rounded-xl px-3 py-3 text-[11px] outline-none resize-none focus:border-amber-500" />
          </div>
        </section>

        {/* PHASE 5: VERIFICATION (PRE-FLIGHT SCRUB) */}
        <div className="flex justify-between items-center px-5 py-4 bg-slate-900/60 rounded-[1.5rem] border border-slate-800/50 mb-6">
          <div className="flex flex-col gap-3 w-full">
            <div className="flex justify-between items-center border-b border-slate-800/50 pb-3">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1">
                <CheckSquare size={12} className={asset.functionalCheck ? "text-emerald-500" : "text-slate-600"}/> 
                Power/Functional Check Pass
              </label>
              <input 
                type="checkbox" 
                name="functionalCheck" 
                checked={asset.functionalCheck} 
                onChange={handleAssetChange}
                className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-amber-500/50"
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-0.5">Sync Status</label>
                <select name="syncStatus" value={asset.syncStatus} onChange={handleAssetChange} className="bg-transparent text-[10px] font-bold outline-none text-amber-500 border-b border-dashed border-amber-900/50 pb-0.5 cursor-pointer">
                  <option value="Draft">Draft</option>
                  <option value="Manual Uploaded">Manual Upload</option>
                  <option value="AI Ready">AI Ready</option>
                </select>
              </div>
              <div className="flex flex-col items-end">
                 <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-0.5">User</label>
                 <p className="text-[10px] font-bold text-slate-300 flex items-center gap-1"><User size={10}/> {asset.primaryUser}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER ACTION BAR */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent flex gap-3 max-w-lg mx-auto backdrop-blur-md">
        <button onClick={() => setShowResetModal(true)} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 hover:text-red-500 hover:border-red-900/50 active:scale-90 transition-all shadow-lg">
          <Trash2 size={24} />
        </button>
        <button 
          onClick={submitToNotion}
          disabled={loading || !asset.name || !asset.categoryId}
          className={`flex-1 flex items-center justify-center gap-3 font-black text-sm tracking-wide uppercase rounded-2xl transition-all shadow-2xl active:scale-[0.98] border-t border-white/10 ${
            loading || !asset.name || !asset.categoryId
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
              : 'bg-amber-600 text-black hover:bg-amber-500 shadow-amber-900/40'
          }`}
        >
          {loading ? (
            <div className="h-6 w-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <UploadCloud size={20} />
              SYNC BATS
            </>
          )}
        </button>
      </footer>
    </div>
  );
}