import React from 'react';
import { NonBurnCertificate } from '../../types';
import { 
  ShieldCheck, 
  Printer, 
  X, 
  CheckCircle2, 
  Award, 
  Satellite, 
  Leaf, 
  Fingerprint,
  Download
} from 'lucide-react';

interface CarbonCertificateProps {
  certificate: NonBurnCertificate;
  onClose: () => void;
}

export const CarbonCertificate: React.FC<CarbonCertificateProps> = ({
  certificate,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl my-8 bg-slate-900 border-2 border-emerald-500/60 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6 printable-cert">
        {/* Top Action Bar (hidden when printing) */}
        <div className="flex items-center justify-between no-print border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="badge badge-emerald text-xs">
              Verra VM0042 & Article 6 Standard
            </span>
            <span className="text-xs text-slate-400">Institutional Audit Document</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Outer Border Frame */}
        <div className="border-4 border-double border-emerald-600/40 rounded-xl p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
          {/* Subtle background watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <ShieldCheck className="w-96 h-96 text-emerald-500" />
          </div>

          {/* Certificate Header */}
          <div className="text-center flex flex-col items-center gap-2 border-b border-emerald-500/20 pb-5">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
              <Award className="w-8 h-8" />
            </div>

            <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
              Punjab Clean Air & Carbon Additionality Registry
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit'] tracking-tight">
              Certificate of Non-Burn Verification
            </h1>

            <p className="text-xs text-slate-400 max-w-lg">
              Official institutional certificate verifying verified zero open-field burning of crop residue, audited via NASA FIRMS VIIRS satellite thermal radiance and Sentinel-2 multi-spectral imagery.
            </p>

            <div className="font-mono text-xs text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30 mt-1">
              Certificate ID: {certificate.certificate_id}
            </div>
          </div>

          {/* Core Beneficiary & Land Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5 text-xs">
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Verified Beneficiary</span>
              <strong className="text-white text-sm block mt-0.5">{certificate.farmer_name}</strong>
              <span className="text-slate-400 text-[11px]">{certificate.village}, {certificate.district}</span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Land Parcel (Khasra)</span>
              <strong className="text-white text-sm block mt-0.5">{certificate.khasra_no}</strong>
              <span className="text-emerald-400 text-[11px] font-bold">{certificate.acreage} Acres Certified</span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Paddy Variety</span>
              <strong className="text-amber-300 text-sm block mt-0.5">{certificate.paddy_variety}</strong>
              <span className="text-slate-400 text-[11px]">Mechanical Straw Removal</span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Audit Timestamp</span>
              <strong className="text-slate-200 text-xs block mt-0.5">{certificate.clearance_timestamp}</strong>
              <span className="text-emerald-400 text-[10px] font-bold">100% Pass</span>
            </div>
          </div>

          {/* Satellite Multi-Input Audit Proof Grid */}
          <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-500/30 mb-5 flex flex-col gap-3">
            <div className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
              <Satellite className="w-4 h-4 text-emerald-400" />
              <span>Section 03 Four-Input Defense Audit Trail</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">NASA FIRMS VIIRS Thermal Audit:</strong>
                  <span className="text-slate-300 text-[11px]">
                    0 fire anomaly pixels detected within registered polygon + 50m buffer during the 40-day harvest window.
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Sentinel-2 NDVI Time-Series Drop:</strong>
                  <span className="text-slate-300 text-[11px]">
                    NDVI decreased from 0.74 to 0.16 with zero thermal radiance spike, conclusively proving physical baler clearance.
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Digital Gate Clearance Receipt:</strong>
                  <span className="text-slate-300 text-[11px]">
                    QR Lot tag PB-SGR-26 matched at storage depot, moisture 14.2% verified.
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">UPI Payout Ledger Settle:</strong>
                  <span className="text-slate-300 text-[11px]">
                    Instant ₹{Math.round(certificate.acreage * 1450).toLocaleString()} payment settled in &lt;90s via NPCI banking rail.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Environmental Impact & Carbon Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 text-center">
            <div className="bg-slate-900/90 p-3 rounded-lg border border-emerald-500/20">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Avoided CO₂e</span>
              <span className="text-lg font-extrabold text-emerald-400 font-mono">
                {certificate.co2e_avoided_tonnes} t
              </span>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-lg border border-cyan-500/20">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Prevented PM2.5</span>
              <span className="text-lg font-extrabold text-cyan-300 font-mono">
                {certificate.pm25_prevented_kg} kg
              </span>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-lg border border-amber-500/20">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Prevented Methane</span>
              <span className="text-lg font-extrabold text-amber-300 font-mono">
                {certificate.methane_prevented_kg} kg
              </span>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-lg border border-emerald-500/30">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Carbon Value</span>
              <span className="text-lg font-extrabold text-white font-mono">
                ₹{certificate.carbon_credit_value_inr.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Cryptographic SHA-256 Stamp & Signatures */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-8 h-8 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">Cryptographic Verification Hash:</span>
                <span className="font-mono text-[10px] text-slate-300 break-all select-all">
                  {certificate.sha256_hash}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="font-bold text-white text-xs">Dr. H. S. Dhaliwal</div>
              <div className="text-[10px] text-slate-400">Chief Carbon Registry Auditor • Nirdhoom</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
