export interface User {
  id: number;
  nama_lengkap: string;
  username: string;
  password: string;
  role: 'operator' | 'supervisor';
  created_at?: string;
}

export interface Machine {
  id: number;
  nama_mesin: string;
  kode_barcode: string;
  lokasi: string;
  created_at?: string;
}

export interface ChecklistItem {
  id: number;
  id_mesin: number;
  item_pengecekan: string;
  urutan: number;
  created_at?: string;
}

export interface ChecklistReport {
  id: number;
  id_mesin: number;
  id_operator: number;
  tanggal_pengecekan: string;
  status?: 'draft' | 'completed';
  machine?: Machine;
  operator?: User;
}

export interface ChecklistDetail {
  id: number;
  id_report: number;
  id_item: number;
  status: 'OK' | 'Not OK' | 'N/A';
  catatan?: string;
  url_foto?: string;
  item?: ChecklistItem;
}

export interface DashboardStats {
  totalReports: number;
  reportsToday: number;
  notOkItems: number;
  activeOperators: number;
  topIssues: Array<{
    machine: string;
    issues: number;
  }>;
}