import React from "react"

export function GovernanceTab() {
  const proposals = [
    { id: 1, title: "Expand to Ghana LandBank SPV", votes: 67, status: "Active" },
    { id: 2, title: "Increase staking rewards by 2%", votes: 82, status: "Passed" },
    { id: 3, title: "Add Minerals SPV to platform", votes: 54, status: "Active" },
  ]
  return (
    <div className="tab-content">
      <p className="section-title">Governance Proposals</p>
      <p className="section-sub">Vote with your staked OSANV</p>
      {proposals.map(p => (
        <div key={p.id} className="gov-card">
          <div className="gov-header">
            <h4 className="gov-title">{p.title}</h4>
            <span className={`gov-status-badge ${p.status === "Passed" ? "passed" : "active"}`}>{p.status}</span>
          </div>
          <div className="gov-progress-bar">
            <div className="gov-progress-fill" style={{ width: `${p.votes}%` }} />
          </div>
          <div className="gov-footer">
            <span className="gov-votes">{p.votes}% in favor</span>
            {p.status === "Active" && (
              <div className="gov-actions">
                <button className="btn-vote-yes">Yes</button>
                <button className="btn-vote-no">No</button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
