import { InfrastructureService } from './infrastructureService';

export class AndroidBridgeService {
  private static isInitialized = false;

  static init(onHardwareBack?: () => boolean): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // 1. Android Hardware Back Button Hook
    window.addEventListener('popstate', (e) => {
      if (onHardwareBack) {
        const handled = onHardwareBack();
        if (handled) {
          e.preventDefault();
        }
      }
    });

    // 2. Connectivity Listeners (Online / Offline detection)
    window.addEventListener('online', () => {
      InfrastructureService.addLog({
        category: 'Android Runtime',
        level: 'INFO',
        message: 'Network connection restored. Device online; triggering background queue sync.'
      });
      InfrastructureService.syncOfflineQueue();
    });

    window.addEventListener('offline', () => {
      InfrastructureService.addLog({
        category: 'Android Runtime',
        level: 'WARN',
        message: 'Network connection lost. Device operating in Offline Local-First mode.'
      });
    });

    InfrastructureService.addLog({
      category: 'Android Runtime',
      level: 'INFO',
      message: 'Android Bridge Service initialized (Back navigation, Network listeners & Storage Sandbox active)'
    });
  }

  // Camera QR Scanning helper with permission handling
  static async requestCameraStream(): Promise<{ success: boolean; stream?: MediaStream; error?: string }> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return {
          success: false,
          error: 'Camera device API not supported in this browser/device container.'
        };
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      InfrastructureService.addLog({
        category: 'Android Runtime',
        level: 'INFO',
        message: 'Hardware Camera permission granted for QR Code verification.'
      });

      return { success: true, stream };
    } catch (err: any) {
      InfrastructureService.addLog({
        category: 'Android Runtime',
        level: 'WARN',
        message: `Camera permission denied or camera device unavailable: ${err.message || err}`
      });

      return {
        success: false,
        error: 'Camera permission denied or camera hardware not detected.'
      };
    }
  }

  // Safe file upload validation
  static validateUploadFile(file: File, maxMb: number = 10): { valid: boolean; error?: string } {
    const allowedExtensions = ['pdf', 'docx', 'xlsx', 'png', 'jpg', 'jpeg', 'csv', 'txt'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (!allowedExtensions.includes(ext)) {
      return {
        valid: false,
        error: `File type '.${ext}' is not permitted. Allowed types: ${allowedExtensions.join(', ')}`
      };
    }

    if (file.size > maxMb * 1024 * 1024) {
      return {
        valid: false,
        error: `File size exceeds ${maxMb}MB limit (File size: ${(file.size / (1024 * 1024)).toFixed(1)}MB)`
      };
    }

    return { valid: true };
  }

  // Safe file export download
  static downloadFile(filename: string, content: string, mimeType: string = 'text/plain'): void {
    // Sanitize filename
    const safeName = filename.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = safeName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    InfrastructureService.addLog({
      category: 'Uploads/Files',
      level: 'INFO',
      message: `File downloaded securely: ${safeName} (${(content.length / 1024).toFixed(1)} KB)`
    });
  }
}
