import { useState } from "react";
import { motion } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import {
  CheckCircle2, XCircle, Clock, Zap, Users,
  Wallet, ThumbsUp, ThumbsDown,
} from "lucide-react";
import type { GovernanceProposal } from "@workspace/api-client-react";
import { useListGovernanceProposals } from "@workspace/api-client-react";

import { shortenAddress } from "@/lib/contract";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  active: { label: "Active", icon: Clock, className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  succeeded: { label: "Succeeded", icon: CheckCircle2, className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  defeated: { label: "Defeated", icon: XCircle, className: "bg-red-500/10 text-red-500" },
  pending: { label: "Pending", icon: Clock, className: "bg-muted text-muted-foreground" },
  executed: { label: "Executed", icon: Zap, className: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
};

const CATEGORY_COLORS: Record<string, string> = {
  property: "bg-primary/10 text-primary",
  token: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  fees: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  protocol: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

const MOCK_VOTING_POWER = 500_000;
const PROPOSAL_THRESHOLD = 100_000;
const QUORUM = 5_000_000;

function ProposalCard({
  proposal,
  isConnected,
}: {
  proposal: GovernanceProposal;
  isConnected: boolean;
}) {
  const [voted, setVoted] = useState<"for" | "against" | null>(null);
  const { label, icon: StatusIcon, className } = STATUS_CONFIG[proposal.status];
  const totalVotes = proposal.votesFor + proposal.votesAgainst;
  const forPct = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
  const quorumPct = Math.min(100, (totalVotes / proposal.quorum) * 100);
  const quorumReached = totalVotes >= proposal.quorum;
  const isActive = proposal.status === "active";

  const daysLeft = isActive
    ? Math.ceil((new Date(proposal.endTime).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  function handleVote(side: "for" | "against") {
    if (!isConnected) return;
    setVoted(side);
    toast.success(`Vote cast: ${side === "for" ? "For" : "Against"} — ${(MOCK_VOTING_POWER / 1000).toFixed(0)}K OSANV`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-card-border rounded-xl p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${className}`}>
              <StatusIcon className="h-3 w-3" />
              {label}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${CATEGORY_COLORS[proposal.category]}`}>
              {proposal.category}
            </span>
            {daysLeft !== null && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {daysLeft}d remaining
              </span>
            )}
          </div>
          <h3 className="font-semibold text-foreground leading-snug">{proposal.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Proposed by {shortenAddress(proposal.proposer)}
          </p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-3">
        {proposal.description}
      </p>

      {/* Vote bars */}
      <div className="space-y-3 mb-5">
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <ThumbsUp className="h-3 w-3" /> For
            </span>
            <span>{(proposal.votesFor / 1_000_000).toFixed(2)}M OSANV ({forPct.toFixed(1)}%)</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${forPct}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span className="flex items-center gap-1 text-red-500 font-medium">
              <ThumbsDown className="h-3 w-3" /> Against
            </span>
            <span>{(proposal.votesAgainst / 1_000_000).toFixed(2)}M OSANV ({(100 - forPct).toFixed(1)}%)</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-red-400 transition-all"
              style={{ width: `${100 - forPct}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            Quorum: {quorumPct.toFixed(0)}% {quorumReached ? "✓" : "needed"}
          </span>
          <span>{(totalVotes / 1_000_000).toFixed(2)}M / {(QUORUM / 1_000_000).toFixed(0)}M</span>
        </div>
      </div>

      {/* Vote buttons */}
      {isActive && (
        <div className="flex gap-3">
          {isConnected ? (
            voted ? (
              <div className="flex-1 text-center text-sm text-muted-foreground py-2 bg-muted rounded-lg">
                You voted: <span className={`font-semibold ${voted === "for" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                  {voted === "for" ? "For" : "Against"}
                </span>
              </div>
            ) : (
              <>
                <button
                  onClick={() => handleVote("for")}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                >
                  <ThumbsUp className="h-4 w-4" /> Vote For
                </button>
                <button
                  onClick={() => handleVote("against")}
                  className="flex-1 inline-flex items-center justify-center gap-2 border border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 font-semibold py-2.5 rounded-xl text-sm transition-colors"
                >
                  <ThumbsDown className="h-4 w-4" /> Vote Against
                </button>
              </>
            )
          ) : (
            <div className="flex-1 text-center text-xs text-muted-foreground py-2">
              Connect wallet to vote
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function GovernancePage() {
  const { isConnected } = useAccount();
  const [filter, setFilter] = useState<"all" | GovernanceProposal["status"]>("all");

  const { data: proposalsData } = useListGovernanceProposals();
  const proposals = proposalsData ?? [];
  const filtered = proposals.filter((p) => filter === "all" || p.status === filter);

  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-foreground">Governance</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Vote on proposals using your OSANV balance. 100K OSANV to propose · 5M quorum.
            </p>
          </motion.div>
          {isConnected ? (
            <div className="bg-card border border-card-border rounded-xl px-5 py-3 text-center shrink-0">
              <div className="text-xl font-bold text-foreground">{(MOCK_VOTING_POWER / 1000).toFixed(0)}K</div>
              <div className="text-xs text-muted-foreground">Voting Power (OSANV)</div>
            </div>
          ) : (
            <div className="flex justify-end">
              <ConnectButton />
            </div>
          )}
        </div>

        {!isConnected && (
          <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
            <Wallet className="h-5 w-5 text-primary shrink-0" />
            <p className="text-sm text-muted-foreground">
              Connect your wallet to see your voting power and cast votes on active proposals.
            </p>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["all", "active", "succeeded", "executed", "defeated"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Proposals */}
        <div className="space-y-5">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No proposals found.</div>
          ) : (
            filtered.map((p) => (
              <ProposalCard key={p.id} proposal={p} isConnected={isConnected} />
            ))
          )}
        </div>

        {/* Governance parameters */}
        <div className="mt-8 bg-card border border-card-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Protocol Parameters</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            {[
              { label: "Proposal Threshold", value: "100K OSANV" },
              { label: "Quorum", value: "5M OSANV" },
              { label: "Voting Period", value: "7 days" },
              { label: "Timelock", value: "2 days" },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
                <div className="font-semibold text-foreground">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
