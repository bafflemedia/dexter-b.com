export interface BatsAsset {
  id: string;
  batId: string | null;
  batsUrl: string | null;
  name: string;
  index: number | null;
  taxYear: number | null;
  status: string | null;
  assetClass: string | null;
  primaryUser: string | null;
  syncStatus: string | null;
  categoryIds: string[];
  locationIds: string[];
  projectIds: string[];
  receiptTransactionIds: string[];
  merchantName: string | null;
  unitPrice: number | null;
  manufacturer: string | null;
  serialNumber: string | null;
  warrantyExpiration: string | null;
  powerDrawWatts: number | null;
  notes: string | null;
  aiFieldNote: string | null;
  photo: string | null;
  lastEdited: string | null;
}

export interface AssetPayload {
  name: string;
  categoryPageId?: string;
  locationPageId?: string;
  projectPageIds?: string[];
  receiptTransactionPageId?: string;
  index?: number;
  assetClass?: string;
  status?: string;
  primaryUser?: string;
  syncStatus?: string;
  manufacturer?: string;
  serialNumber?: string;
  unitPrice?: number;
  warrantyExpiration?: string;
  powerDrawWatts?: number;
  notes?: string;
  aiFieldNote?: string;
  photo?: string;
}
