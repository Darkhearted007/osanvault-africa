import { useEffect, useRef } from "react";
import { X, Printer, ExternalLink } from "lucide-react";

export interface CertificateData {
  certId: string;
  projectName: string;
  projectFlag: string;
  methodology: string;
  region: string;
  vintage: string;
  amount: string;
  reason: string;
  date: string;
  txHash?: string;
}

function generateCertId(): string {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `OSAN-CERT-${year}-${rand}`;
}

export { generateCertId };

interface Props {
  data: CertificateData;
  onClose: () => void;
}

export default function RetirementCertificate({ data, onClose }: Props) {
  const certRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    const style = document.createElement("style");
    style.id = "__cert_print__";
    style.innerHTML = `
      @media print {
        body > *:not(#cert-print-root) { display: none !important; }
        #cert-print-root { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: white; }
        #cert-print-root .no-print { display: none !important; }
        @page { size: A4 portrait; margin: 0.5cm; }
      }
    `;
    document.head.appendChild(style);

    const root = document.createElement("div");
    root.id = "cert-print-root";
    root.innerHTML = certRef.current?.outerHTML ?? "";
    document.body.appendChild(root);

    window.print();

    document.head.removeChild(style);
    document.body.removeChild(root);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const dateObj = new Date(data.date);
  const formattedDate = dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl max-h-[95vh] flex flex-col">
        {/* Toolbar */}
        <div className="no-print flex items-center justify-between mb-3 shrink-0">
          <span className="text-white/70 text-sm font-medium">Retirement Certificate · {data.certId}</span>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-[#D4A017] hover:bg-[#c49015] text-black font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
            >
              <Printer className="h-4 w-4" /> Save as PDF
            </button>
            <button onClick={onClose} className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded-lg transition-colors">
              <X className="h-4 w-4" /> Close
            </button>
          </div>
        </div>

        {/* Certificate scroll area */}
        <div className="overflow-y-auto rounded-2xl">
          <div ref={certRef} style={{ fontFamily: "'Georgia', 'Times New Roman', serif", background: "white", color: "#1a1a1a" }}>
            {/* Outer gold border */}
            <div style={{ margin: 0, padding: "3px", background: "linear-gradient(135deg, #D4A017, #a07810, #D4A017, #a07810)", borderRadius: "12px" }}>
              <div style={{ background: "white", borderRadius: "10px", padding: "40px 48px 36px" }}>

                {/* Inner decorative border */}
                <div style={{ border: "1px solid #D4A01744", borderRadius: "8px", padding: "32px 40px 28px", position: "relative" }}>

                  {/* Corner ornaments */}
                  {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map((pos, i) => (
                    <div key={i} style={{
                      position: "absolute",
                      [pos.includes("top") ? "top" : "bottom"]: "-1px",
                      [pos.includes("left") ? "left" : "right"]: "-1px",
                      width: "20px", height: "20px",
                      borderColor: "#D4A017",
                      borderStyle: "solid",
                      borderWidth: pos.includes("top") && pos.includes("left") ? "2px 0 0 2px" : pos.includes("top") ? "2px 2px 0 0" : pos.includes("left") ? "0 0 2px 2px" : "0 2px 2px 0",
                      borderRadius: pos.includes("top") && pos.includes("left") ? "4px 0 0 0" : pos.includes("top") ? "0 4px 0 0" : pos.includes("left") ? "0 0 0 4px" : "0 0 4px 0",
                    }} />
                  ))}

                  {/* Header */}
                  <div style={{ textAlign: "center", marginBottom: "28px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "6px" }}>
                      <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, #0d3320, #3a8042)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "#D4A017", fontSize: "18px" }}>✦</span>
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontSize: "18px", fontWeight: "bold", color: "#0d3320", letterSpacing: "2px", fontFamily: "sans-serif" }}>OSANVAULT AFRICA</div>
                        <div style={{ fontSize: "9px", color: "#666", letterSpacing: "3px", fontFamily: "sans-serif", textTransform: "uppercase" }}>Fractional Real Estate &amp; Carbon Credits</div>
                      </div>
                    </div>
                  </div>

                  {/* Decorative rule */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                    <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, transparent, #D4A017)" }} />
                    <span style={{ color: "#D4A017", fontSize: "14px" }}>✦</span>
                    <div style={{ flex: 1, height: "1px", background: "linear-gradient(to left, transparent, #D4A017)" }} />
                  </div>

                  {/* Certificate title */}
                  <div style={{ textAlign: "center", marginBottom: "28px" }}>
                    <div style={{ fontSize: "11px", letterSpacing: "4px", color: "#888", fontFamily: "sans-serif", textTransform: "uppercase", marginBottom: "8px" }}>Official Document of</div>
                    <h1 style={{ fontSize: "26px", fontWeight: "bold", color: "#0d3320", lineHeight: 1.2, margin: 0 }}>
                      Certificate of Carbon Credit Retirement
                    </h1>
                  </div>

                  {/* Body text */}
                  <div style={{ textAlign: "center", marginBottom: "24px" }}>
                    <p style={{ fontSize: "13px", color: "#555", marginBottom: "20px", lineHeight: 1.6 }}>
                      This is to certify that the following verified carbon credits have been<br />
                      <strong>permanently and irrevocably retired</strong> from circulation:
                    </p>

                    {/* Amount highlight */}
                    <div style={{ display: "inline-block", background: "#f0f9f0", border: "2px solid #3a8042", borderRadius: "12px", padding: "16px 40px", marginBottom: "20px" }}>
                      <div style={{ fontSize: "42px", fontWeight: "bold", color: "#0d3320", lineHeight: 1 }}>{data.amount}</div>
                      <div style={{ fontSize: "14px", color: "#3a8042", fontFamily: "sans-serif", marginTop: "4px", letterSpacing: "1px" }}>TONNES CO₂ EQUIVALENT (tCO₂e)</div>
                    </div>

                    <p style={{ fontSize: "13px", color: "#555", marginBottom: "12px" }}>from the verified climate project:</p>

                    <div style={{ background: "#fafaf8", border: "1px solid #e8e0cc", borderRadius: "8px", padding: "14px 24px", marginBottom: "24px", display: "inline-block", minWidth: "320px" }}>
                      <div style={{ fontSize: "22px", marginBottom: "4px" }}>{data.projectFlag}</div>
                      <div style={{ fontSize: "16px", fontWeight: "bold", color: "#1a1a1a", marginBottom: "4px" }}>{data.projectName}</div>
                      <div style={{ fontSize: "11px", color: "#888", fontFamily: "sans-serif", letterSpacing: "1px" }}>
                        {data.region} · {data.methodology} Standard · Vintage {data.vintage}
                      </div>
                    </div>
                  </div>

                  {/* Decorative rule */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                    <div style={{ flex: 1, height: "1px", background: "#e8e0cc" }} />
                    <span style={{ color: "#D4A017", fontSize: "10px" }}>◆</span>
                    <div style={{ flex: 1, height: "1px", background: "#e8e0cc" }} />
                  </div>

                  {/* Details grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "28px", fontFamily: "sans-serif" }}>
                    {[
                      { label: "Certificate ID", value: data.certId },
                      { label: "Date of Retirement", value: formattedDate },
                      { label: "Retirement Reason", value: data.reason },
                      { label: "Verification Standard", value: `${data.methodology} Protocol` },
                      { label: "Blockchain Network", value: "Polygon Amoy Testnet" },
                      { label: "Token Standard", value: "ERC-1155 (OsanCarbon)" },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ background: "#fafaf8", border: "1px solid #f0ece0", borderRadius: "6px", padding: "10px 14px" }}>
                        <div style={{ fontSize: "9px", color: "#999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "3px" }}>{label}</div>
                        <div style={{ fontSize: "12px", color: "#1a1a1a", fontWeight: "600" }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* TX Hash */}
                  {data.txHash && (
                    <div style={{ background: "#f5f5f5", borderRadius: "6px", padding: "10px 14px", marginBottom: "24px", fontFamily: "monospace" }}>
                      <div style={{ fontSize: "9px", color: "#999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "4px", fontFamily: "sans-serif" }}>Blockchain Transaction</div>
                      <div style={{ fontSize: "11px", color: "#1a1a1a", wordBreak: "break-all" }}>{data.txHash}</div>
                    </div>
                  )}

                  {!data.txHash && (
                    <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "6px", padding: "10px 14px", marginBottom: "24px", fontFamily: "sans-serif" }}>
                      <div style={{ fontSize: "11px", color: "#92400e" }}>
                        ⚠ Testnet Simulation — Blockchain transaction will be recorded on Polygon mainnet upon contract deployment.
                      </div>
                    </div>
                  )}

                  {/* Decorative rule */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
                    <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, transparent, #D4A017)" }} />
                    <span style={{ color: "#D4A017", fontSize: "14px" }}>✦</span>
                    <div style={{ flex: 1, height: "1px", background: "linear-gradient(to left, transparent, #D4A017)" }} />
                  </div>

                  {/* Signatures */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "24px", alignItems: "end", marginBottom: "28px", fontFamily: "sans-serif" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ borderBottom: "1px solid #1a1a1a", marginBottom: "6px", height: "32px", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                        <span style={{ fontSize: "18px", color: "#0d3320", fontStyle: "italic" }}>O. Ajayi</span>
                      </div>
                      <div style={{ fontSize: "10px", color: "#555", letterSpacing: "0.5px" }}>OLUGBENGA AJAYI</div>
                      <div style={{ fontSize: "9px", color: "#888" }}>Chief Executive Officer</div>
                      <div style={{ fontSize: "9px", color: "#888" }}>OsanVault Africa Ltd.</div>
                    </div>

                    {/* Seal */}
                    <div style={{ textAlign: "center", padding: "0 8px" }}>
                      <div style={{
                        width: "90px", height: "90px", borderRadius: "50%",
                        border: "3px solid #D4A017",
                        background: "radial-gradient(circle at 30% 30%, #1a4a25, #0d3320)",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        margin: "0 auto", position: "relative"
                      }}>
                        <div style={{ position: "absolute", inset: "4px", borderRadius: "50%", border: "1px dashed #D4A01777" }} />
                        <span style={{ color: "#D4A017", fontSize: "20px" }}>✦</span>
                        <div style={{ color: "#D4A017", fontSize: "6px", letterSpacing: "1px", textAlign: "center", fontFamily: "sans-serif", fontWeight: "bold", lineHeight: 1.3, marginTop: "2px" }}>
                          OSANVAULT<br />AFRICA<br />VERIFIED
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <div style={{ borderBottom: "1px solid #1a1a1a", marginBottom: "6px", height: "32px" }} />
                      <div style={{ fontSize: "10px", color: "#555", letterSpacing: "0.5px" }}>CARBON REGISTRY AUTHORITY</div>
                      <div style={{ fontSize: "9px", color: "#888" }}>Authorized Verifier</div>
                      <div style={{ fontSize: "9px", color: "#888" }}>VCS / Gold Standard Body</div>
                    </div>
                  </div>

                  {/* Footer note */}
                  <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <p style={{ fontSize: "10px", color: "#999", fontFamily: "sans-serif", lineHeight: 1.6, maxWidth: "480px", margin: "0 auto" }}>
                      This certificate serves as proof of retirement in accordance with applicable carbon market standards.
                      Credits cannot be reused, resold, or re-issued.
                    </p>
                  </div>

                  {/* Trust badges */}
                  <div style={{ display: "flex", justifyContent: "center", gap: "16px", fontFamily: "sans-serif" }}>
                    {["SEC ARIP Sandbox", "Polygon Network", "Dual Land Verification"].map((badge) => (
                      <div key={badge} style={{
                        fontSize: "8px", color: "#888", letterSpacing: "1px",
                        paddingBottom: "2px", borderBottom: "1px solid #e0e0e0",
                        textTransform: "uppercase"
                      }}>{badge}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom toolbar */}
        <div className="no-print mt-3 text-center">
          <p className="text-white/50 text-xs">
            Use "Save as PDF" to download · Certificate ID: <span className="text-white/70 font-mono">{data.certId}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
