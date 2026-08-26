import React, { useState, useEffect } from "react";
import { Search, ShieldAlert, ArrowRight } from "lucide-react";

interface Transaction {
  transaction_id: string;
  step: number;
  type: string;
  amount: number;
  nameOrig: string;
  nameDest: string;
  device_id: string;
  ip_address: string;
  isFraud: number;
  isFlaggedFraud: number;
}

interface TransactionExplorerProps {
  onSelectTransaction: (txId: string) => void;
}

export const TransactionExplorer: React.FC<TransactionExplorerProps> = ({ onSelectTransaction }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [typeFilter, setTypeFilter] = useState<string>("");
  const [fraudFilter, setFraudFilter] = useState<string>("");


  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, fraudFilter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let url = `http://127.0.0.1:8000/api/v1/transactions?limit=25&offset=0`;
      if (typeFilter) url += `&tx_type=${typeFilter}`;
      if (fraudFilter !== "") url += `&is_fraud=${fraudFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      setTransactions(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTx = transactions.filter((t) =>
    t.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.nameOrig.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.nameDest.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.device_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glass-card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 600 }}>Transaction Monitoring Stream</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Showing {filteredTx.length} of {total} live records
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
            <input
              type="text"
              placeholder="Search TX ID, User, Device..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border-color)",
                color: "white",
                padding: "0.45rem 0.6rem 0.45rem 2rem",
                borderRadius: "8px",
                fontSize: "0.85rem",
                width: "220px"
              }}
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid var(--border-color)", padding: "0.45rem 0.6rem", borderRadius: "8px", fontSize: "0.85rem" }}
          >
            <option value="">All Types</option>
            <option value="TRANSFER">TRANSFER</option>
            <option value="CASH_OUT">CASH_OUT</option>
            <option value="PAYMENT">PAYMENT</option>
            <option value="CASH_IN">CASH_IN</option>
          </select>

          <select
            value={fraudFilter}
            onChange={(e) => setFraudFilter(e.target.value)}
            style={{ background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid var(--border-color)", padding: "0.45rem 0.6rem", borderRadius: "8px", fontSize: "0.85rem" }}
          >
            <option value="">All Status</option>
            <option value="1">Confirmed Fraud</option>
            <option value="0">Legitimate</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
              <th style={{ padding: "0.75rem" }}>TX ID</th>
              <th style={{ padding: "0.75rem" }}>Step</th>
              <th style={{ padding: "0.75rem" }}>Type</th>
              <th style={{ padding: "0.75rem" }}>Amount</th>
              <th style={{ padding: "0.75rem" }}>Source User</th>
              <th style={{ padding: "0.75rem" }}>Destination</th>
              <th style={{ padding: "0.75rem" }}>Device ID</th>
              <th style={{ padding: "0.75rem" }}>Fraud Target</th>
              <th style={{ padding: "0.75rem", textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
                  Fetching live transaction stream...
                </td>
              </tr>
            )}
            {!loading && filteredTx.map((tx) => (

              <tr key={tx.transaction_id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "0.75rem", fontFamily: "var(--font-mono)", color: "#38bdf8" }}>{tx.transaction_id}</td>
                <td style={{ padding: "0.75rem" }}>{tx.step}h</td>
                <td style={{ padding: "0.75rem" }}>
                  <span className={`badge ${tx.type === "TRANSFER" || tx.type === "CASH_OUT" ? "badge-high" : "badge-low"}`}>
                    {tx.type}
                  </span>
                </td>
                <td style={{ padding: "0.75rem", fontWeight: 600 }}>${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td style={{ padding: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{tx.nameOrig}</td>
                <td style={{ padding: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{tx.nameDest}</td>
                <td style={{ padding: "0.75rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{tx.device_id}</td>
                <td style={{ padding: "0.75rem" }}>
                  {tx.isFraud === 1 ? (
                    <span className="badge badge-critical" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                      <ShieldAlert size={12} /> FRAUD
                    </span>
                  ) : (
                    <span className="badge badge-low">CLEAN</span>
                  )}
                </td>
                <td style={{ padding: "0.75rem", textAlign: "right" }}>
                  <button
                    onClick={() => onSelectTransaction(tx.transaction_id)}
                    style={{
                      background: "rgba(56, 189, 248, 0.15)",
                      color: "#38bdf8",
                      border: "1px solid rgba(56, 189, 248, 0.3)",
                      padding: "0.35rem 0.75rem",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem"
                    }}
                  >
                    Investigate <ArrowRight size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
