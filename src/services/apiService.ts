import { CafeteriaMealLog } from '../types/modules';
import { StorageService } from './storage';

const DEFAULT_PORT = 4000;

function getDefaultBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('admin_ai_api_base_url');
    if (saved && saved.trim()) {
      return saved.trim().replace(/\/+$/, '');
    }
    // Auto-detect hostname: works on localhost, 127.0.0.1, or LAN IP (192.168.x.x)
    const hostname = window.location.hostname || 'localhost';
    return `http://${hostname}:${DEFAULT_PORT}/api`;
  }
  return `http://localhost:${DEFAULT_PORT}/api`;
}

export interface BackendHealth {
  status: string;
  database: string;
  timestamp?: string;
  engine?: string;
}

export class ApiService {
  private static cachedBaseUrl: string = getDefaultBaseUrl();
  private static lastKnownOnline: boolean | null = null;

  public static getBaseUrl(): string {
    return this.cachedBaseUrl;
  }

  public static setBaseUrl(newUrl: string): void {
    const clean = newUrl.trim().replace(/\/+$/, '');
    this.cachedBaseUrl = clean;
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_ai_api_base_url', clean);
    }
  }

  public static async checkHealth(timeoutMs = 2500): Promise<BackendHealth | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const rootUrl = this.cachedBaseUrl.replace(/\/api$/, '');
      const response = await fetch(`${rootUrl}/health`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        this.lastKnownOnline = true;
        return data;
      }
      this.lastKnownOnline = false;
      return null;
    } catch (err) {
      clearTimeout(timeoutId);
      this.lastKnownOnline = false;
      return null;
    }
  }

  public static isOnline(): boolean {
    return this.lastKnownOnline === true;
  }

  // ==========================================
  // PILOT MODULE: Cafeteria AI CRUD Operations
  // ==========================================

  public static async getCafeteriaLogs(): Promise<{ logs: CafeteriaMealLog[]; source: 'backend' | 'local' }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${this.cachedBaseUrl}/cafeteria`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data: CafeteriaMealLog[] = await response.json();
        this.lastKnownOnline = true;
        // Keep local storage in sync as offline cache
        try {
          if (Array.isArray(data) && data.length > 0) {
            localStorage.setItem('admin_ai_cafeteria', JSON.stringify(data));
          }
        } catch (e) {}
        return { logs: data, source: 'backend' };
      }
    } catch (err) {
      // Backend not reachable, silently fallback to local-first storage
      this.lastKnownOnline = false;
    }

    // Fallback to local storage
    return { logs: StorageService.getCafeteriaLogs(), source: 'local' };
  }

  public static async createCafeteriaLog(
    log: Omit<CafeteriaMealLog, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ log: CafeteriaMealLog; source: 'backend' | 'local' }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${this.cachedBaseUrl}/cafeteria`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(log)
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const created: CafeteriaMealLog = await response.json();
        this.lastKnownOnline = true;
        // Also save to local storage for offline continuity
        StorageService.saveCafeteriaLog(created);
        return { log: created, source: 'backend' };
      }
    } catch (err) {
      this.lastKnownOnline = false;
    }

    // Fallback to local
    const local = StorageService.saveCafeteriaLog(log);
    return { log: local, source: 'local' };
  }

  public static async updateCafeteriaLog(
    id: string,
    updates: Partial<CafeteriaMealLog>
  ): Promise<{ log: CafeteriaMealLog | null; source: 'backend' | 'local' }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${this.cachedBaseUrl}/cafeteria/${id}`, {
        method: 'PUT',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const updated: CafeteriaMealLog = await response.json();
        this.lastKnownOnline = true;
        // Keep local in sync
        const current = StorageService.getCafeteriaLogs();
        const idx = current.findIndex(c => c.id === id);
        if (idx !== -1) {
          current[idx] = updated;
          localStorage.setItem('admin_ai_cafeteria', JSON.stringify(current));
        }
        return { log: updated, source: 'backend' };
      }
    } catch (err) {
      this.lastKnownOnline = false;
    }

    // Fallback update in local storage
    const current = StorageService.getCafeteriaLogs();
    const idx = current.findIndex(c => c.id === id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem('admin_ai_cafeteria', JSON.stringify(current));
      return { log: current[idx], source: 'local' };
    }
    return { log: null, source: 'local' };
  }

  public static async deleteCafeteriaLog(id: string): Promise<{ success: boolean; source: 'backend' | 'local' }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${this.cachedBaseUrl}/cafeteria/${id}`, {
        method: 'DELETE',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        this.lastKnownOnline = true;
        // Remove from local storage
        const current = StorageService.getCafeteriaLogs().filter(c => c.id !== id);
        localStorage.setItem('admin_ai_cafeteria', JSON.stringify(current));
        return { success: true, source: 'backend' };
      }
    } catch (err) {
      this.lastKnownOnline = false;
    }

    // Fallback delete in local storage
    const current = StorageService.getCafeteriaLogs().filter(c => c.id !== id);
    localStorage.setItem('admin_ai_cafeteria', JSON.stringify(current));
    return { success: true, source: 'local' };
  }

  // ==========================================
  // Secure Server-Side Gemini AI Chat Gateway
  // ==========================================

  public static async chatWithGemini(
    prompt: string,
    context?: any
  ): Promise<{ mode: string; response?: string; message?: string; status?: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(`${this.cachedBaseUrl}/ai/chat`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ prompt, context })
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      // Backend unavailable or network failure
    }

    return {
      mode: 'local',
      message: 'Gemini not configured (or backend offline)',
      response: 'Backend server is currently offline or Gemini is not configured. Local administrative intelligence is operating.'
    };
  }
}
