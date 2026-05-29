import { useState } from "react";
import { motion } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { toast } from "sonner";
import { Coins, Lock, TrendingUp, Info, Wallet, ChevronDown } from "lucide-react";
import { STAKING_TIERS, formatOsanv } from "@/lib/mock-data";
import {
  IS_CONTRACT_DEPLOYED,
  STAKING_VAULT_CONTRACT,
  OSANV_TOKEN_ADDRESS,
  explorerTx,
} from "@/lib/contract";
import Layout from "@/components/layout/Layout";
import CinematicPageHeader from "@/components/ui/CinematicPageHeader";

const MOCK_MY_STAKE = {
  tier: 1,
  amount: 150_000,
  rewards: 4_250,
  unlockDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 62),
};

const PLATFORM_STAKING = {
  totalStaked: 42_500_000,
  stakersCount: 3_841,
  osanvPrice: 0.042,
};

function TierCard({
  tier,
  selected,
  onClick,
}: {
  tier: typeof STAKING_TIERS[0];
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      className={`text-left w-full bg-card border rounded-xl p-5 transition-all cursor-pointer ${
        selected
          ? `border-2 ${tier.borderClass} shadow-md`
          : "border-card-border hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-2xl mr-2">{tier.emoji}</span>
          <span className={`text-lg font-bold ${tier.textClass}`}>{tier.name}</span>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tier.bgClass} ${tier.textClass}`}>
          {tier.apr}% APR
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Lock Period</span>
          <span className="font-medium text-foreground">{tier.lockDays} days</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Min Stake</span>
          <span className="font-medium text-foreground">{tier.minStake.toLocaleString()} OSANV</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Annual Yield</span>
          <span className={`font-bold ${tier.textClass}`}>
            {tier.aprBps / 100}% of staked amount
          </span>
        </div>
      </div>
    </motion.button>
  );
}

export default function StakingPage() {
  const { isConnected } = useAccount();
  const [selectedTier, setSelectedTier] = useState(0);
  const [stakeAmount, setStakeAmount] = useState("");
  const [tab, setTab] = useState<"stake" | "unstake">("stake");

  const tier = STAKING_TIERS[selectedTier];
  const parsedAmount = parseFloat(stakeAmount) || 0;
  const estimatedYearlyReward = parsedAmount * (tier.apr / 100);
  const estimatedMonthlyReward = estimatedYearlyReward / 12;

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  function handleStake() {
    if (!isConnected || !stakeAmount) return;
    if (!IS_CONTRACT_DEPLOYED) {
      toast.info("StakingVault not yet deployed to Polygon Amoy. Staking will be available at launch.");
      return;
    }
    writeContract({
      ...STAKING_VAULT_CONTRACT,
      functionName: "stake",
      args: [BigInt(selectedTier), parseEther(stakeAmount)],
    });
  }

  function handleUnstake() {
    if (!isConnected || !stakeAmount) return;
    if (!IS_CONTRACT_DEPLOYED) {
      toast.info("StakingVault not yet deployed to Polygon Amoy. Unstaking will be available at launch.");
      return;
    }
    writeContract({
      ...STAKING_VAULT_CONTRACT,
      functionName: "withdraw",
      args: [parseEther(stakeAmount)],
    });
  }

  return (
    <Layout>
      <CinematicPageHeader
        icon={Coins}
        eyebrow="Layer 3 · Staking"
        title="OSANV Staking"
        subtitle="Lock OSANV tokens across four commitment tiers — earn 8–22% APR and governance weight"
        imageUrl="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1920&q=80"
        kbVariant={4}
        imagePosition="center 45%"
        stats={[
          { label: "Total Staked", value: "42.5M OSANV", color: "text-amber-400" },
          { label: "Stakers", value: "3,841" },
          { label: "Max APR", value: "22%", color: "text-emerald-400" },
        ]}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">OSANV Staking</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Lock OSANV tokens to earn rewards and unlock governance voting weight.
          </p>
        </motion.div>

        {/* Platform stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total OSANV Staked", value: formatOsanv(PLATFORM_STAKING.totalStaked), icon: Coins, color: "bg-primary/10 text-primary" },
            { label: "Active Stakers", value: PLATFORM_STAKING.stakersCount.toLocaleString(), icon: TrendingUp, color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
            { label: "OSANV Price", value: `$${PLATFORM_STAKING.osanvPrice.toFixed(3)}`, icon: TrendingUp, color: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
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
          {/* Tier selector */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-foreground mb-4">Choose Your Tier</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {STAKING_TIERS.map((t) => (
                <TierCard
                  key={t.tier}
                  tier={t}
                  selected={selectedTier === t.tier}
                  onClick={() => setSelectedTier(t.tier)}
                />
              ))}
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4">
              <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Rewards are calculated on-chain via <span className="font-mono text-foreground">StakingVault.sol</span> using basis points.
                APR is fixed per tier. Early unstaking forfeits accumulated rewards. Governance voting
                power = staked OSANV × tier multiplier.
              </p>
            </div>
          </div>

          {/* Stake form */}
          <div className="space-y-5">
            {isConnected ? (
              <>
                {/* My Stake */}
                <div className="bg-card border border-card-border rounded-xl p-5">
                  <h3 className="font-semibold text-foreground mb-4">My Stake</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Tier</span>
                      <span className="font-medium text-foreground">
                        {STAKING_TIERS[MOCK_MY_STAKE.tier].emoji} {STAKING_TIERS[MOCK_MY_STAKE.tier].name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount Staked</span>
                      <span className="font-bold text-foreground">{MOCK_MY_STAKE.amount.toLocaleString()} OSANV</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pending Rewards</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        +{MOCK_MY_STAKE.rewards.toLocaleString()} OSANV
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Unlock Date
                      </span>
                      <span className="font-medium text-foreground text-xs">
                        {MOCK_MY_STAKE.unlockDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stake / Unstake form */}
                <div className="bg-card border border-card-border rounded-xl p-5">
                  <div className="flex gap-2 mb-4">
                    {(["stake", "unstake"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                          tab === t
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="mb-4">
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wider">
                      {tab === "stake" ? "Tier" : "Amount"}
                    </label>
                    {tab === "stake" ? (
                      <div className="relative">
                        <select
                          value={selectedTier}
                          onChange={(e) => setSelectedTier(Number(e.target.value))}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                          {STAKING_TIERS.map((t) => (
                            <option key={t.tier} value={t.tier}>
                              {t.emoji} {t.name} — {t.apr}% APR · {t.lockDays}d lock
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    ) : null}
                  </div>

                  <div className="mb-4">
                    <label htmlFor={`stake-amount-${tier.name}`} className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wider">
                      Amount (OSANV)
                    </label>
                    <input
                      id={`stake-amount-${tier.name}`}
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder={`Min ${tier.minStake.toLocaleString()}`}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>

                  {tab === "stake" && parsedAmount >= tier.minStake && (
                    <div className="bg-primary/5 border border-primary/15 rounded-lg p-3 mb-4 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estimated monthly</span>
                        <span className="font-semibold text-foreground">+{estimatedMonthlyReward.toFixed(0)} OSANV</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estimated yearly</span>
                        <span className="font-bold text-primary">+{estimatedYearlyReward.toFixed(0)} OSANV</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Lock period</span>
                        <span className="font-medium text-foreground">{tier.lockDays} days</span>
                      </div>
                    </div>
                  )}

                  <button
                    disabled={!stakeAmount || parsedAmount < tier.minStake || isPending || isConfirming}
                    onClick={tab === "stake" ? handleStake : handleUnstake}
                    className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold py-3 rounded-xl text-sm transition-colors"
                  >
                    {isPending || isConfirming
                      ? "Confirming…"
                      : tab === "stake" ? `Stake ${tier.name} Tier` : "Unstake Tokens"}
                  </button>
                  {tab === "stake" && parsedAmount > 0 && parsedAmount < tier.minStake && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 text-center">
                      Minimum {tier.minStake.toLocaleString()} OSANV for {tier.name} tier
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-card border border-card-border rounded-2xl p-8 text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 mx-auto">
                  <Wallet className="h-7 w-7" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Connect to Stake</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  Connect your wallet to stake OSANV and start earning rewards.
                </p>
                <div className="flex justify-center">
                  <ConnectButton />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
