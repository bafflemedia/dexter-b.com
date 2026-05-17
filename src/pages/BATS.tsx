import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Archive,
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Cpu,
  Edit3,
  MapPin,
  PackagePlus,
  Search,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import type { BatsAsset } from '../types/bats';

const fallbackAssets: BatsAsset[] = [
  {
    id: 'mock-display',
    batId: 'BM-VIS-002',
    batsUrl: 'https://www.dexter-b.com/bats/BM-VIS-002',
    name: 'Studio Reference Display',
    index: 2,
    taxYear: 2026,
    status: 'Available',
    assetClass: 'Expensed (Section 179)',
    primaryUser: 'DexterB',
    syncStatus: 'AI Ready',
    categoryIds: ['Visuals'],
    locationIds: ['Studio A'],
    projectIds: ['BASE'],
    receiptTransactionIds: [],
    merchantName: 'Micro Center',
    unitPrice: 299.99,
    manufacturer: 'Samsung',
    serialNumber: null,
    warrantyExpiration: '2027-05-16',
    powerDrawWatts: 120,
    notes: 'Mock record shown when live inventory is unavailable.',
    aiFieldNote: null,
    photo: null,
    lastEdited: '2026-05-16T12:00:00.000Z',
  },
  {
    id: 'mock-nas',
    batId: 'BM-CMP-109',
    batsUrl: 'https://www.dexter-b.com/bats/BM-CMP-109',
    name: 'Ugreen NAS Node',
    index: 109,
    taxYear: 2026,
    status: 'In Service',
    assetClass: 'Capitalized',
    primaryUser: 'DexterB',
    syncStatus: 'Manual Uploaded',
    categoryIds: ['Computing'],
    locationIds: ['Server Rack'],
    projectIds: ['NAS Build'],
    receiptTransactionIds: [],
    merchantName: 'Amazon',
    unitPrice: 499,
    manufacturer: 'Ugreen',
    serialNumber: null,
    warrantyExpiration: null,
    powerDrawWatts: 65,
    notes: null,
    aiFieldNote: null,
    photo: null,
    lastEdited: '2026-05-15T18:30:00.000Z',
  },
  {
    id: 'mock-light',
    batId: 'BM-LGT-013',
    batsUrl: 'https://www.dexter-b.com/bats/BM-LGT-013',
    name: 'Key Light Panel',
    index: 13,
    taxYear: 2026,
    status: 'Needs Review',
    assetClass: 'Expensed (Section 179)',
    primaryUser: 'DexterB',
    syncStatus: 'Draft',
    categoryIds: ['Lighting'],
    locationIds: ['Studio A'],
    projectIds: ['Signal Chain'],
    receiptTransactionIds: [],
    merchantName: 'B&H Photo',
    unitPrice: 189,
    manufacturer: 'Amaran',
    serialNumber: null,
    warrantyExpiration: null,
    powerDrawWatts: 100,
    notes: 'Mock review state.',
    aiFieldNote: null,
    photo: null,
    lastEdited: '2026-05-14T09:00:00.000Z',
  },
];

const formatCurrency = (value: number | null) => {
  if (value == null) return 'Unpriced';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (value: string | null) => {
  if (!value) return 'No edits tracked';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
};

const getStatusTone = (status: string | null) => {
  const normalized = status?.toLowerCase() || '';
  if (normalized.includes('available') || normalized.includes('service')) return 'text-emerald-300 border-emerald-400/30 bg-emerald-500/10';
  if (normalized.includes('review') || normalized.includes('repair')) return 'text-amber-300 border-amber-400/30 bg-amber-500/10';
  return 'text-slate-300 border-slate-400/20 bg-slate-400/10';
};

const BATS: React.FC = () => {
  const [assets, setAssets] = useState<BatsAsset[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const response = await fetch('/api/bats', { credentials: 'include' });
        if (!response.ok) throw new Error(`Inventory request failed with ${response.status}`);
        const data = await response.json();
        setAssets(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('[BATS] Asset overview fallback engaged:', err);
        setAssets(fallbackAssets);
        setError('Live inventory unavailable. Showing local review data.');
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, []);

  const visibleAssets = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return assets;

    return assets.filter((asset) => {
      const haystack = [
        asset.name,
        asset.batId,
        asset.status,
        asset.assetClass,
        asset.primaryUser,
        asset.syncStatus,
        asset.manufacturer,
        asset.merchantName,
        ...asset.categoryIds,
        ...asset.locationIds,
        ...asset.projectIds,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(needle);
    });
  }, [assets, query]);

  const totalValue = assets.reduce((sum, asset) => sum + (asset.unitPrice || 0), 0);
  const needsReviewCount = assets.filter((asset) => {
    const status = `${asset.status || ''} ${asset.syncStatus || ''}`.toLowerCase();
    return status.includes('review') || status.includes('draft');
  }).length;

  return (
    <main className="relative z-10 min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="border-b border-white/10 pb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex items-center gap-3 text-[#f97316]">
                <Boxes size={28} />
                <span className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-[#8a8e91]">
                  Baffle Asset Tag System
                </span>
              </div>
              <h1 className="text-5xl font-black uppercase italic tracking-tight text-[#f8fafc] drop-shadow-[5px_5px_0px_#1a2632] md:text-7xl">
                BATS
              </h1>
              <p className="mt-4 max-w-2xl font-mono text-xs uppercase leading-7 tracking-[0.18em] text-[#e2e8f0]/65">
                Physical gear registry, assignment state, and intake control for Baffle Media assets.
              </p>
            </div>

            <Link
              to="/bats/new"
              className="inline-flex items-center justify-center gap-3 rounded-lg bg-[#f97316] px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-[#1a2632] shadow-[8px_8px_0px_#000] transition hover:-translate-y-1 hover:bg-[#fb923c] active:translate-y-0"
            >
              <PackagePlus size={20} />
              Add BATS Asset
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <Metric icon={<Archive size={20} />} label="Tracked Assets" value={assets.length.toString()} />
          <Metric icon={<CircleDollarSign size={20} />} label="Known Cost Basis" value={formatCurrency(totalValue)} />
          <Metric icon={<AlertTriangle size={20} />} label="Needs Review" value={needsReviewCount.toString()} />
        </section>

        <section className="flex flex-col gap-4 rounded-lg border border-white/10 bg-[#434b53]/40 p-4 shadow-[20px_20px_55px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-[#f97316]" size={22} />
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-[#f8fafc]">Asset Register</h2>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8a8e91]">
                {loading ? 'Loading inventory relay' : `${visibleAssets.length} visible records`}
              </p>
            </div>
          </div>

          <label className="relative block w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8a8e91]" size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search assets"
              className="w-full rounded-lg border border-white/10 bg-[#1a2632] py-3 pl-11 pr-4 font-mono text-xs uppercase tracking-[0.12em] text-[#e2e8f0] outline-none transition placeholder:text-[#8a8e91]/60 focus:border-[#f97316]"
            />
          </label>
        </section>

        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-3 font-mono text-xs uppercase tracking-[0.16em] text-amber-200">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-lg border border-white/10 bg-[#2b3d4f]/80 shadow-[24px_24px_70px_-25px_rgba(0,0,0,0.9)]">
          <div className="hidden grid-cols-[1.4fr_0.8fr_0.8fr_0.7fr_0.5fr] gap-4 border-b border-white/10 bg-[#1a2632] px-5 py-3 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#8a8e91] lg:grid">
            <span>Asset</span>
            <span>Status</span>
            <span>Location</span>
            <span>Value</span>
            <span className="text-right">Action</span>
          </div>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-[#8a8e91]">
              <Cpu className="animate-spin text-[#f97316]" size={24} />
              Loading assets
            </div>
          ) : visibleAssets.length > 0 ? (
            <div className="divide-y divide-white/10">
              {visibleAssets.map((asset) => (
                <AssetRow key={asset.id} asset={asset} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4 px-6 text-center">
              <Wrench className="text-[#8a8e91]" size={36} />
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#8a8e91]">
                No assets match this scan.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

const Metric = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="rounded-lg border border-white/10 bg-[#434b53]/35 p-5 shadow-[15px_15px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md">
    <div className="mb-4 flex items-center justify-between text-[#f97316]">
      {icon}
      <span className="font-mono text-[9px] font-black uppercase tracking-[0.24em] text-[#8a8e91]">{label}</span>
    </div>
    <p className="text-3xl font-black uppercase tracking-tight text-[#f8fafc]">{value}</p>
  </div>
);

const AssetRow = ({ asset }: { asset: BatsAsset }) => (
  <article className="grid gap-4 px-5 py-5 transition hover:bg-[#434b53]/50 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.7fr_0.5fr] lg:items-center">
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-black uppercase tracking-tight text-[#f8fafc]">{asset.name}</h3>
        {asset.batId && (
          <span className="rounded border border-[#f97316]/30 bg-[#f97316]/10 px-2 py-1 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-[#f97316]">
            {asset.batId}
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#8a8e91]">
        <span>{asset.manufacturer || 'Unknown maker'}</span>
        <span className="hidden sm:inline">/</span>
        <span>{asset.assetClass || 'Unclassified'}</span>
        <span className="hidden sm:inline">/</span>
        <span className="inline-flex items-center gap-1">
          <Clock3 size={12} />
          {formatDate(asset.lastEdited)}
        </span>
      </div>
    </div>

    <div>
      <span className={`inline-flex rounded border px-3 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] ${getStatusTone(asset.status)}`}>
        {asset.status || 'Unknown'}
      </span>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#8a8e91]">{asset.syncStatus || 'No sync state'}</p>
    </div>

    <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-[#e2e8f0]/75">
      <MapPin size={15} className="text-[#f97316]" />
      {asset.locationIds[0] || 'Unassigned'}
    </div>

    <div className="font-mono text-xs font-black uppercase tracking-[0.12em] text-[#f8fafc]">
      {formatCurrency(asset.unitPrice)}
    </div>

    <div className="flex lg:justify-end">
      <Link
        to={`/bats/${asset.id}/edit`}
        state={{ asset }}
        className="inline-flex items-center gap-2 rounded border border-white/10 bg-[#1a2632] px-4 py-3 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#e2e8f0] transition hover:border-[#f97316] hover:text-[#f97316]"
      >
        <Edit3 size={14} />
        Edit
      </Link>
    </div>
  </article>
);

export default BATS;
