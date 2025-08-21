import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Machine, 
  ChecklistItem, 
  ChecklistReport, 
  ChecklistDetail, 
  DashboardStats,
  User 
} from '../types/database';

class DatabaseService {
  private async getStorageData<T>(key: string): Promise<T[]> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return [];
    }
  }

  private async setStorageData<T>(key: string, data: T[]): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
    }
  }

  async initializeMockData(): Promise<void> {
    const machines = await this.getStorageData<Machine>('machines');
    if (machines.length === 0) {
      const mockMachines: Machine[] = [
        {
          id: 1,
          nama_mesin: 'CNC Machine 01',
          kode_barcode: 'CNC001',
          lokasi: 'Workshop A',
        },
        {
          id: 2,
          nama_mesin: 'Lathe Machine 02',
          kode_barcode: 'LAT002',
          lokasi: 'Workshop B',
        },
        {
          id: 3,
          nama_mesin: 'Milling Machine 03',
          kode_barcode: 'MIL003',
          lokasi: 'Workshop A',
        }
      ];
      await this.setStorageData('machines', mockMachines);

      const mockItems: ChecklistItem[] = [
        { id: 1, id_mesin: 1, item_pengecekan: 'Check Oil Level', urutan: 1 },
        { id: 2, id_mesin: 1, item_pengecekan: 'Check Belt Condition', urutan: 2 },
        { id: 3, id_mesin: 1, item_pengecekan: 'Check Temperature', urutan: 3 },
        { id: 4, id_mesin: 2, item_pengecekan: 'Check Chuck Condition', urutan: 1 },
        { id: 5, id_mesin: 2, item_pengecekan: 'Check Coolant Level', urutan: 2 },
        { id: 6, id_mesin: 3, item_pengecekan: 'Check Spindle Alignment', urutan: 1 },
      ];
      await this.setStorageData('checklist_items', mockItems);
    }
  }

  async getMachines(): Promise<Machine[]> {
    return await this.getStorageData<Machine>('machines');
  }

  async getMachineByBarcode(barcode: string): Promise<Machine | null> {
    const machines = await this.getMachines();
    return machines.find(m => m.kode_barcode === barcode) || null;
  }

  async getChecklistItems(machineId: number): Promise<ChecklistItem[]> {
    const items = await this.getStorageData<ChecklistItem>('checklist_items');
    return items.filter(item => item.id_mesin === machineId).sort((a, b) => a.urutan - b.urutan);
  }

  async getReports(userId?: number): Promise<ChecklistReport[]> {
    const reports = await this.getStorageData<ChecklistReport>('checklist_reports');
    if (userId) {
      return reports.filter(r => r.id_operator === userId);
    }
    return reports;
  }

  async createReport(report: Omit<ChecklistReport, 'id'>): Promise<number> {
    const reports = await this.getReports();
    const newId = Math.max(0, ...reports.map(r => r.id)) + 1;
    const newReport: ChecklistReport = { ...report, id: newId };
    reports.push(newReport);
    await this.setStorageData('checklist_reports', reports);
    return newId;
  }

  async saveChecklistDetails(details: Omit<ChecklistDetail, 'id'>[]): Promise<void> {
    const existingDetails = await this.getStorageData<ChecklistDetail>('checklist_details');
    let maxId = Math.max(0, ...existingDetails.map(d => d.id));
    
    const newDetails = details.map(detail => ({
      ...detail,
      id: ++maxId
    }));
    
    existingDetails.push(...newDetails);
    await this.setStorageData('checklist_details', existingDetails);
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const reports = await this.getReports();
    const details = await this.getStorageData<ChecklistDetail>('checklist_details');
    const machines = await this.getMachines();
    
    const today = new Date().toDateString();
    const reportsToday = reports.filter(r => 
      new Date(r.tanggal_pengecekan).toDateString() === today
    ).length;
    
    const notOkItems = details.filter(d => d.status === 'Not OK').length;
    
    // Get unique operators from reports
    const activeOperators = new Set(reports.map(r => r.id_operator)).size;
    
    // Top issues by machine
    const issuesByMachine: { [key: number]: number } = {};
    details.forEach(detail => {
      if (detail.status === 'Not OK') {
        const report = reports.find(r => r.id === detail.id_report);
        if (report) {
          issuesByMachine[report.id_mesin] = (issuesByMachine[report.id_mesin] || 0) + 1;
        }
      }
    });
    
    const topIssues = Object.entries(issuesByMachine)
      .map(([machineId, issues]) => ({
        machine: machines.find(m => m.id === parseInt(machineId))?.nama_mesin || 'Unknown',
        issues
      }))
      .sort((a, b) => b.issues - a.issues)
      .slice(0, 5);

    return {
      totalReports: reports.length,
      reportsToday,
      notOkItems,
      activeOperators,
      topIssues
    };
  }
}

export default new DatabaseService();