import React from 'react';
import { Info, Cpu } from 'lucide-react';

interface HardwareDisclaimerProps {
  featureName?: string;
  requirements?: string;
}

export const HardwareDisclaimer: React.FC<HardwareDisclaimerProps> = ({
  featureName = "Hardware Interface Notice",
  requirements = "Camera / Optical Barcode / OCR dependencies: Running in active client emulation. Native hardware integration requires Android CameraX / MLKit credentials and device optical lens."
}) => {
  return (
    <div className="flex items-start space-x-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs">
      <Cpu className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
      <div className="space-y-0.5">
        <span className="font-semibold">{featureName}</span>
        <p className="text-[11px] text-amber-700/90 dark:text-amber-400/90 leading-relaxed">
          {requirements}
        </p>
      </div>
    </div>
  );
};
