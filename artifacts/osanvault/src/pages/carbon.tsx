import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import {
  Leaf, CheckCircle2, Clock, ExternalLink, TrendingUp,
  ChevronRight, AlertCircle, Wallet, Copy, BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import {
  PLATFORM_STATS,
  formatCredits, timeAgo,
} from "@/lib/mock-data";
import type { CarbonProject } from "@workspace/api-client-react";
import { useListCarbonProjects, useGetPlatformStats } from "@workspace/api-client-react";
import { OSANCARBON_ADDRESS, OsanCarbonAbi, IS_CONTRACT_DEPLOYED, explorerTx } from "@/lib/contract";
import Layout from "@/components/layout/Layout";

const REASON_PRESETS = [
  { emoji: "🌍", label: "Corporate ESG offset" },
  { emoji: "✈️", label: "Travel offset" },
  { emoji: "🌱", label: "Personal carbon footprint" },
  { emoji: "🏢", label: "Compliance obligation" },
];

type RetireStep = 1 | 2 | 3 | "success";

function ProjectCard({ project }: { project: CarbonProject }) {
  const issuedBig = BigInt(project.totalIssued);
  const retiredBig = BigInt(project.totalRetired);
  const retiredPct = issuedBig > 0n
    ? Math.round(Number((retiredBig * 100n) / issuedBig))
    : 0;
  return (
    <div className="bg-card border border-card-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{project.flag}</span>
          <div>
            <h3 className="font-semibold text-foreground text-sm leading-tight">{project.name}</h3>
            <p className="text-xs text-muted-foreground">{project.region} · Vintage {project.vintage}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            project.verified
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
          }`}>
            {project.verified ? "Verified" : "Pending"}
          </span>
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{project.methodology}</span>
        </div>
      </div>

      {project.linkedPropertyId && (
        <Link href={`/properties/${project.linkedPropertyId}`}>
          <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/5 border border-primary/15 rounded-lg px-2.5 py-1.5 mb-3 cursor-pointer hover:bg-primary/10 transition-colors w-fit">
            <BarChart3 className="h-3 w-3" /> Linked to Property #{project.linkedPropertyId}
          </div>
        </Link>
      )}

      <div className="grid grid-cols-3 gap-3 text-center mb-3">
        {[
          { label: "Issued", value: `${formatCredits(issuedBig)} tCO₂e` },
          { label: "Retired", value: `${formatCredits(retiredBig)} tCO₂e` },
          { label: "Rate", value: `${retiredPct}%` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-muted/50 rounded-lg py-2">
            <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
            <div className="text-sm font-semibold text-foreground">{value}</div>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Retirement rate</span>
          <span>{retiredPct}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${retiredPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function RetireWizard({ projects }: { projects: CarbonProject[] }) {
  const { isConnected } = useAccount();
  const [step, setStep] = useState<RetireStep>(1);
  const [selectedId, setSelectedId] = useState(projects[0]?.id ?? 1);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => { if (isConfirmed) { setStep("success"); toast.success("Credits retired!"); } }, [isConfirmed]);
  useEffect(() => { if (writeError) toast.error(writeError.message.slice(0, 80)); }, [writeError]);

  const selected = projects.find((p) => p.id === selectedId);
  const mockBalance = BigInt("15000000000000000000000");

  function handleRetire() {
    if (!IS_CONTRACT_DEPLOYED) {
      toast.info("Simulating retirement (contract not deployed)...");
      setTimeout(() => { setStep("success"); toast.success("Retirement simulated!"); }, 1500);
      return;
    }
    writeContract({
      address: OSANCARBON_ADDRESS,
      abi: OsanCarbonAbi,
      functionName: "retireCredits",
      args: [BigInt(selectedId), BigInt(Math.floor(parseFloat(amount) * 1e18)), reason + (note ? ` — ${note}` : "")],
    });
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  }

  if (!isConnected) {
    return (
      <div className="bg-card border border-card-border rounded-2xl p-8 text-center">
        <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
        <h3 className="font-semibold text-foreground mb-2">Connect to Retire Credits</h3>
        <p className="text-sm text-muted-foreground mb-5">Connect your wallet to permanently retire carbon credits from any project.</p>
        <div className="flex justify-center"><ConnectButton /></div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-card-border rounded-2xl p-8 text-center"
      >
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4 mx-auto">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-1">Credits Retired!</h3>
        <p className="text-muted-foreground text-sm mb-5">
          <span className="font-bold text-foreground">{amount} tCO₂e</span> permanently retired from <span className="font-bold text-foreground">{selected?.name}</span>.
        </p>
        {txHash && (
          <div className="bg-muted rounded-lg p-3 mb-5 text-left">
            <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-foreground truncate">{txHash}</span>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => copyToClipboard(txHash)} className="p-1 hover:bg-background rounded transition-colors">
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                <a href={explorerTx(txHash)} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-background rounded transition-colors">
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </a>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => window.print()} className="flex-1 border border-border text-foreground font-medium py-2.5 rounded-xl text-sm hover:bg-muted transition-colors">
            Download Certificate
          </button>
          <button onClick={() => { setStep(1); setAmount(""); setReason(""); setNote(""); }} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-xl text-sm transition-colors">
            Retire More
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-card border border-card-border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((n) => {
          const done = step > n;
          const active = step === n;
          return (
            <div key={n} className="flex items-center gap-2">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                done ? "bg-primary text-primary-foreground" :
                active ? "bg-primary/20 text-primary ring-2 ring-primary" :
                "bg-muted text-muted-foreground"
              }`}>
                {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : n}
              </div>
              <span className={`text-xs font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>
                {["Select", "Reason", "Confirm"][n - 1]}
              </span>
              {n < 3 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
            <h3 className="font-semibold text-foreground mb-4">Select Project & Amount</h3>
            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wider">Project</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.flag} {p.name} ({p.methodology})</option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wider">Amount (tCO₂e)</label>
              <div className="relative">
                <input
                  type="number" min="0.001" step="0.001" value={amount}
                  onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 100"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground pr-16 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  onClick={() => setAmount(String(Number(mockBalance) / 1e18))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded transition-colors"
                >MAX</button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Balance: {formatCredits(mockBalance)} tCO₂e</p>
            </div>
            <button
              disabled={!amount || parseFloat(amount) <= 0}
              onClick={() => setStep(2)}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
            <h3 className="font-semibold text-foreground mb-4">Retirement Reason</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {REASON_PRESETS.map(({ emoji, label }) => (
                <button
                  key={label} onClick={() => setReason(label)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                    reason === label ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/40 hover:bg-muted"
                  }`}
                >
                  <span>{emoji}</span><span>{label}</span>
                </button>
              ))}
            </div>
            <input
              type="text" value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="Or enter custom reason..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground mb-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <textarea
              value={note} onChange={(e) => setNote(e.target.value)} rows={2}
              placeholder="Additional note (optional)..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground mb-5 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 border border-border text-foreground font-medium py-2.5 rounded-xl text-sm hover:bg-muted transition-colors">Back</button>
              <button disabled={!reason.trim()} onClick={() => setStep(3)} className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
            <h3 className="font-semibold text-foreground mb-4">Confirm Retirement</h3>
            <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 mb-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Project</span>
                <span className="font-semibold text-foreground">{selected?.flag} {selected?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-primary">{amount} tCO₂e</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reason</span>
                <span className="font-medium text-foreground text-right max-w-[55%]">{reason}</span>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Retirement is <strong>permanent and irreversible</strong>. These credits will be burned forever.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 border border-border text-foreground font-medium py-2.5 rounded-xl text-sm hover:bg-muted transition-colors">Back</button>
              <button
                onClick={handleRetire} disabled={isPending || isConfirming}
                className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-70 text-primary-foreground font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                {isPending || isConfirming ? (
                  <><span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />{isPending ? "Confirm..." : "Confirming..."}</>
                ) : (
                  <><Leaf className="h-4 w-4" /> Confirm Retirement</>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CarbonPage() {
  const { data: carbonData } = useListCarbonProjects();
  const { data: statsData } = useGetPlatformStats();
  const projects = carbonData ?? [];
  const stats = statsData ?? PLATFORM_STATS;

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Carbon Credits</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Verified tCO₂e from African climate projects — many linked to our tokenized properties.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Carbon Projects", value: String(projects.length), icon: BarChart3, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
            { label: "Total Offset Capacity", value: `${(stats.totalCarbonTonnes / 1000).toFixed(1)}K tCO₂e`, icon: Leaf, color: "bg-primary/10 text-primary" },
            { label: "Avg Retirement Rate", value: "32.4%", icon: TrendingUp, color: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-card-border rounded-xl p-5 shadow-sm">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg mb-3 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold text-foreground">{value}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects grid */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-foreground mb-4">Climate Projects</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>

          {/* Retire form */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Leaf className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Retire Credits
            </h2>
            <RetireWizard projects={projects} />

            <div className="mt-5 flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded-xl p-4">
              <Clock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>Carbon credits are Layer 5 of the OsanVault stack. Many are automatically generated by tokenized properties and distributed to property token holders quarterly.</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
