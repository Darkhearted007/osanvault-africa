import { useState } from "react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft, MapPin, TrendingUp, Leaf, Shield, Clock, CheckCircle2,
  Building2, ExternalLink, Wallet, AlertCircle,
} from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { formatNgn, fundingPct } from "@/lib/mock-data";
import {
  IS_CONTRACT_DEPLOYED,
  PROPERTY_NFT_CONTRACT,
  LAND_REGISTRY_CONTRACT,
  explorerTx,
} from "@/lib/contract";
import { useGetProperty, useListCarbonProjects } from "@workspace/api-client-react";
import Layout from "@/components/layout/Layout";

const STATUS_COLORS: Record<string, string> = {
  live: "bg-emerald-500/20 text-emerald-400",
  funding: "bg-amber-500/20 text-amber-400",
  closed: "bg-muted text-muted-foreground",
};

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const parsedId = Number(id);
  const safeId = !isNaN(parsedId) && parsedId > 0 ? parsedId : 0;
  const { data: property, isLoading } = useGetProperty(safeId);
  const { data: carbonProjects } = useListCarbonProjects();
  const { isConnected } = useAccount();

  const [tokenAmount, setTokenAmount] = useState("");
  // All hooks must be called unconditionally before any early returns
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  const parsedAmount = parseInt(tokenAmount) || 0;
  const totalCostNgn = parsedAmount * (property?.tokenPrice ?? 0);

  const linkedCarbon = property
    ? (carbonProjects ?? []).find((c) => c.linkedPropertyId === property.id)
    : null;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <h1 className="text-2xl font-bold text-foreground">Property Not Found</h1>
          <Link href="/properties">
            <button className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" /> Back to Properties
            </button>
          </Link>
        </div>
      </Layout>
    );
  }

  const pct = fundingPct(property);

  function handleInvest() {
    if (!isConnected || !property || parsedAmount <= 0) return;
    if (!IS_CONTRACT_DEPLOYED) {
      toast.info("PropertyNFT not yet deployed to Polygon Amoy. Investment will be available at launch.");
      return;
    }
    writeContract({
      ...PROPERTY_NFT_CONTRACT,
      functionName: "mint",
      args: [undefined as unknown as `0x${string}`, BigInt(property.id), BigInt(parsedAmount)],
    });
  }

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-8 text-white mb-8 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${property.gradientFrom}, ${property.gradientTo})` }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{property.flag}</span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_COLORS[property.status]}`}>
                  {property.status === "live" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                  {property.status}
                </span>
                <span className="inline-flex items-center gap-1 bg-white/15 rounded-full px-3 py-1 text-xs font-medium">
                  <Building2 className="h-3 w-3" /> {property.type}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-2">{property.name}</h1>
              <p className="text-white/75 flex items-center gap-1.5 text-sm">
                <MapPin className="h-3.5 w-3.5" /> {property.location}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Token Price", value: `₦${property.tokenPrice.toLocaleString()}`, icon: TrendingUp },
                { label: "Annual Yield", value: `${property.yieldApy}% APY`, icon: TrendingUp },
                { label: "Total Supply", value: `${(property.totalTokens / 1000).toFixed(0)}K tokens`, icon: Building2 },
                { label: "Carbon Offset", value: `${property.carbonOffsetTonnes.toLocaleString()} tCO₂e/yr`, icon: Leaf },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-card border border-card-border rounded-xl p-4">
                  <Icon className="h-4 w-4 text-primary mb-2" />
                  <div className="text-base font-bold text-foreground">{value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* Funding progress */}
            <div className="bg-card border border-card-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Funding Progress</h2>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Raised</span>
                  <span className="font-bold text-foreground">{pct.toFixed(1)}% funded</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>{formatNgn(property.raised)} raised</span>
                  <span>{formatNgn(property.targetRaise)} target</span>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-card border border-card-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-3">About this Property</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{property.description}</p>
            </div>

            {/* Legal & Compliance */}
            <div className="bg-card border border-card-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Legal & Compliance</h2>
              <div className="space-y-3 text-sm">
                {[
                  { label: "Jurisdiction", value: property.jurisdiction },
                  { label: "Indigenous Authority", value: property.indigenousAuthority },
                  { label: "Token Standard", value: "ERC-1155 (PropertyNFT.sol)" },
                  { label: "Network", value: "Polygon Amoy Testnet" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-2">
                    <span className="text-muted-foreground shrink-0">{label}</span>
                    <span className="text-foreground font-medium text-right">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between gap-2 pt-2 border-t border-border">
                  <span className="text-muted-foreground">Legal Doc CID</span>
                  <span className="font-mono text-xs text-primary hover:underline cursor-pointer">
                    {property.legalDocCid.slice(0, 20)}...
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">SEC ARIP Sandbox · Dual Land Verification</span>
              </div>
            </div>

            {/* Carbon Credits */}
            {linkedCarbon && (
              <div className="bg-card border border-card-border rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Linked Carbon Credits
                </h2>
                <p className="text-sm text-muted-foreground mb-3">
                  This property generates verified carbon credits distributed to token holders via OsanCarbon.
                </p>
                <div className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground text-sm">{linkedCarbon.name}</p>
                    <p className="text-xs text-muted-foreground">{linkedCarbon.methodology} · {linkedCarbon.region}</p>
                  </div>
                  <Link href="/carbon">
                    <button className="text-xs text-primary hover:underline flex items-center gap-1">
                      View <ExternalLink className="h-3 w-3" />
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right — Buy fractions */}
          <div className="space-y-5">
            <div className="bg-card border border-card-border rounded-xl p-5 sticky top-20">
              <h3 className="font-semibold text-foreground mb-4">Buy Fractions</h3>

              {isConnected ? (
                <>
                  <div className="mb-4">
                    <label htmlFor="token-amount" className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                      Number of Tokens
                    </label>
                    <input
                      id="token-amount"
                      type="number"
                      min="1"
                      value={tokenAmount}
                      onChange={(e) => setTokenAmount(e.target.value)}
                      placeholder="e.g. 100"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>

                  {parsedAmount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-primary/5 border border-primary/15 rounded-lg p-3 mb-4 text-sm space-y-2"
                    >
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Token Price</span>
                        <span className="text-foreground">₦{property.tokenPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quantity</span>
                        <span className="text-foreground">{parsedAmount.toLocaleString()} tokens</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-primary/10">
                        <span className="font-medium text-foreground">Total Cost</span>
                        <span className="font-bold text-primary">{formatNgn(totalCostNgn)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Est. Annual Yield</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          +{formatNgn(totalCostNgn * property.yieldApy / 100)}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      Contracts not yet deployed. Investment will be live at mainnet launch.
                    </p>
                  </div>

                  <button
                    onClick={handleInvest}
                    disabled={!tokenAmount || parsedAmount <= 0}
                    className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold py-3 rounded-xl text-sm transition-colors"
                  >
                    Invest {parsedAmount > 0 ? formatNgn(totalCostNgn) : ""}
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <Wallet className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-sm text-muted-foreground mb-4">Connect wallet to invest in this property.</p>
                  <div className="flex justify-center">
                    <ConnectButton />
                  </div>
                </div>
              )}
            </div>

            {/* Property summary */}
            <div className="bg-card border border-card-border rounded-xl p-5 text-sm">
              <h3 className="font-semibold text-foreground mb-3">Property Summary</h3>
              <div className="space-y-2">
                {[
                  { label: "Size", value: property.size },
                  { label: "Available", value: `${(property.totalTokens - Math.floor(property.raised / property.tokenPrice)).toLocaleString()} tokens` },
                  { label: "Min Investment", value: `₦${property.tokenPrice.toLocaleString()} (1 token)` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-2">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="text-foreground font-medium text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
