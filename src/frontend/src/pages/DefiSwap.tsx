import type React from "react"
import { useState, useEffect } from "react"
import { useClypr } from "../hooks/useClypr"

// Token data for realistic demo (use symbol as icon to avoid emoji mismatches)
const TOKENS = {
  ICP: { symbol: "ICP", name: "Internet Computer", price: 12.45, icon: "ICP" },
  ETH: { symbol: "ETH", name: "Ethereum", price: 2340.67, icon: "Ξ" },
  BTC: { symbol: "BTC", name: "Bitcoin", price: 43250.89, icon: "₿" },
  USDC: { symbol: "USDC", name: "USD Coin", price: 1.0, icon: "$" },
  SOL: { symbol: "SOL", name: "Solana", price: 98.34, icon: "◎" },
}

// Inline SVG Icons
const TrendingUpIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22,7 13.5,15.5 8.5,10.5 2,17"></polyline>
    <polyline points="16,7 22,7 22,13"></polyline>
  </svg>
)

const WalletIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="1" y="3" width="22" height="18" rx="2" ry="2"></rect>
    <line x1="1" y1="9" x2="23" y2="9"></line>
  </svg>
)

const ArrowUpDownIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m21 16-4 4-4-4"></path>
    <path d="M17 20V4"></path>
    <path d="m3 8 4-4 4 4"></path>
    <path d="M7 4v16"></path>
  </svg>
)

const SettingsIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M12 1v6m0 6v6"></path>
    <path d="m15.5 3.5-3 3-3-3"></path>
    <path d="m15.5 20.5-3-3-3 3"></path>
  </svg>
)

const CheckCircleIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22,4 12,14.01 9,11.01"></polyline>
  </svg>
)

const AlertCircleIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <circle cx="12" cy="16" r="0.01"></circle>
  </svg>
)

export default function DefiSwapDemo() {
  const { service } = useClypr()
  const [recipient, setRecipient] = useState("alice")
  const [aliasVerified, setAliasVerified] = useState<boolean | null>(null)
  const [verifyingAlias, setVerifyingAlias] = useState(false)
  const [fromToken, setFromToken] = useState("ICP")
  const [toToken, setToToken] = useState("ETH")
  const [amount, setAmount] = useState("1.0")
  const [slippage, setSlippage] = useState("0.5")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Calculate estimated output
  const estimatedOutput = () => {
    const inputAmount = Number.parseFloat(amount) || 0
    const fromPrice = TOKENS[fromToken as keyof typeof TOKENS]?.price || 0
    const toPrice = TOKENS[toToken as keyof typeof TOKENS]?.price || 0
    if (fromPrice && toPrice && inputAmount) {
      const usdValue = inputAmount * fromPrice
      const outputAmount = usdValue / toPrice
      const slippageAmount = outputAmount * (1 - Number.parseFloat(slippage) / 100)
      return slippageAmount.toFixed(6)
    }
    return "0.000000"
  }

  // Verify alias when recipient changes
  useEffect(() => {
    const verifyAlias = async () => {
      if (!recipient.trim()) {
        setAliasVerified(null)
        return
      }

      setVerifyingAlias(true)
      try {
        // Use resolveUsername to check if alias maps to a principal
        const resolved = await service.resolveUsername(recipient)
        setAliasVerified(!!resolved)
      } catch (err) {
        setAliasVerified(false)
      } finally {
        setVerifyingAlias(false)
      }
    }

    const timeoutId = setTimeout(verifyAlias, 500) // Debounce
    return () => clearTimeout(timeoutId)
  }, [recipient, service])

  const sendSwapNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!aliasVerified) {
      setError("Please enter a valid Clypr alias")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      if (!service) throw new Error("Service not initialized")

      const fromTokenData = TOKENS[fromToken as keyof typeof TOKENS]
      const toTokenData = TOKENS[toToken as keyof typeof TOKENS]
      const outputAmount = estimatedOutput()

      const title = `🔄 Swap Executed: ${amount} ${fromToken} → ${outputAmount} ${toToken}`
      const body =
        `Your DeFi swap has been completed!\n\n` +
        `• Swapped: ${amount} ${fromTokenData.name}\n` +
        `• Received: ~${outputAmount} ${toTokenData.name}\n` +
        `• Slippage: ${slippage}%\n` +
        `• Total USD Value: $${(Number.parseFloat(amount) * fromTokenData.price).toFixed(2)}`

      // Ensure contentType is provided to the backend via metadata (some backends validate this)
      const metadata: [string, string][] = [
        ["pair", `${fromToken}/${toToken}`],
        ["amount_in", amount],
        ["amount_out", outputAmount],
        ["slippage", slippage],
        ["usd_value", (Number.parseFloat(amount) * fromTokenData.price).toFixed(2)],
        ["source", "defiSwap-v2"],
        ["tx_type", "swap"],
        ["contentType", "text/plain"], // Ensure this key is present and spelled correctly
      ]

      const content = {
        title,
        body,
        priority: 1,
        contentType: "text/plain",
        metadata,
      }

      setResult({ status: "pending", message: "Processing swap..." })

      const receipt = await service.notifyAlias(recipient, "defi_swap", content)

      setResult({
        status: "success",
        receipt,
        swap: {
          from: `${amount} ${fromToken}`,
          to: `${outputAmount} ${toToken}`,
          usdValue: (Number.parseFloat(amount) * fromTokenData.price).toFixed(2),
        },
      })
    } catch (err: any) {
      console.error(err)
      setError(err?.message || String(err))
      setResult({ status: "failed" })
    } finally {
      setLoading(false)
    }
  }

  const swapTokens = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        padding: "2rem 1rem",
      }}
    >
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        {/* Header */}
        <header
          style={{
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <TrendingUpIcon />
            </div>
            <div>
              <h1 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "white", margin: 0 }}>DefiSwap</h1>
              <p style={{ fontSize: "0.875rem", color: "#94a3b8", margin: 0 }}>Powered by Clypr Agent</p>
            </div>
          </div>
          <div
            style={{
              background: "rgba(34, 197, 94, 0.1)",
              color: "#4ade80",
              border: "1px solid rgba(34, 197, 94, 0.2)",
              borderRadius: "6px",
              padding: "4px 8px",
              fontSize: "0.75rem",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <WalletIcon />
            Connected
          </div>
        </header>

        {/* Main Swap Interface */}
        <div
          style={{
            background: "rgba(30, 41, 59, 0.5)",
            border: "1px solid #334155",
            borderRadius: "12px",
            backdropFilter: "blur(8px)",
            padding: "1.5rem",
          }}
        >
          <div style={{ marginBottom: "1.5rem" }}>
            <h2
              style={{
                color: "white",
                fontSize: "1.125rem",
                fontWeight: "600",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <ArrowUpDownIcon />
              Swap Tokens
            </h2>
          </div>

          <form onSubmit={sendSwapNotification} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Clypr Alias Input */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ color: "#cbd5e1", fontSize: "0.875rem", fontWeight: "500" }}>Notify Clypr Alias</label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Enter Clypr alias (e.g., alice)"
                  style={{
                    width: "100%",
                    background: "rgba(51, 65, 85, 0.5)",
                    border: "1px solid #475569",
                    borderRadius: "6px",
                    padding: "12px 40px 12px 12px",
                    color: "white",
                    fontSize: "0.875rem",
                    outline: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  {verifyingAlias ? (
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        border: "2px solid #94a3b8",
                        borderTop: "2px solid transparent",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                  ) : aliasVerified === true ? (
                    <div style={{ color: "#4ade80" }}>
                      <CheckCircleIcon />
                    </div>
                  ) : aliasVerified === false ? (
                    <div style={{ color: "#f87171" }}>
                      <AlertCircleIcon />
                    </div>
                  ) : null}
                </div>
              </div>
              {aliasVerified === false && (
                <p style={{ fontSize: "0.875rem", color: "#f87171", margin: 0 }}>
                  Alias not found. User needs to register with Clypr.
                </p>
              )}
              {aliasVerified === true && (
                <p style={{ fontSize: "0.875rem", color: "#4ade80", margin: 0 }}>
                  ✓ Valid Clypr alias - notifications will be delivered
                </p>
              )}
            </div>

            {/* From Token */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ color: "#cbd5e1", fontSize: "0.875rem", fontWeight: "500" }}>From</label>
              <div style={{ display: "flex", gap: "12px" }}>
                <select
                  value={fromToken}
                  onChange={(e) => setFromToken(e.target.value)}
                  style={{
                    background: "rgba(51, 65, 85, 0.5)",
                    border: "1px solid #475569",
                    borderRadius: "6px",
                    padding: "12px",
                    color: "white",
                    minWidth: "120px",
                    outline: "none",
                  }}
                >
                  {Object.entries(TOKENS).map(([symbol, token]) => (
                    <option key={symbol} value={symbol} style={{ background: "#1e293b" }}>
                      {token.icon} {symbol}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  style={{
                    flex: 1,
                    background: "rgba(51, 65, 85, 0.5)",
                    border: "1px solid #475569",
                    borderRadius: "6px",
                    padding: "12px",
                    color: "white",
                    outline: "none",
                  }}
                />
              </div>
              <p style={{ fontSize: "0.875rem", color: "#94a3b8", margin: 0 }}>
                ≈ ${(Number.parseFloat(amount) * (TOKENS[fromToken as keyof typeof TOKENS]?.price || 0)).toFixed(2)} USD
              </p>
            </div>

            {/* Swap Button */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                type="button"
                onClick={swapTokens}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "#374151",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ArrowUpDownIcon />
              </button>
            </div>

            {/* To Token */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ color: "#cbd5e1", fontSize: "0.875rem", fontWeight: "500" }}>To</label>
              <div style={{ display: "flex", gap: "12px" }}>
                <select
                  value={toToken}
                  onChange={(e) => setToToken(e.target.value)}
                  style={{
                    background: "rgba(51, 65, 85, 0.5)",
                    border: "1px solid #475569",
                    borderRadius: "6px",
                    padding: "12px",
                    color: "white",
                    minWidth: "120px",
                    outline: "none",
                  }}
                >
                  {Object.entries(TOKENS).map(([symbol, token]) => (
                    <option key={symbol} value={symbol} style={{ background: "#1e293b" }}>
                      {token.icon} {symbol}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={estimatedOutput()}
                  readOnly
                  style={{
                    flex: 1,
                    background: "rgba(51, 65, 85, 0.3)",
                    border: "1px solid #475569",
                    borderRadius: "6px",
                    padding: "12px",
                    color: "#cbd5e1",
                  }}
                />
              </div>
              <p style={{ fontSize: "0.875rem", color: "#94a3b8", margin: 0 }}>
                ≈ $
                {(Number.parseFloat(estimatedOutput()) * (TOKENS[toToken as keyof typeof TOKENS]?.price || 0)).toFixed(
                  2,
                )}{" "}
                USD
              </p>
            </div>

            {/* Slippage */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label
                style={{
                  color: "#cbd5e1",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <SettingsIcon />
                Max Slippage (%)
              </label>
              <input
                type="text"
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
                placeholder="0.5"
                style={{
                  background: "rgba(51, 65, 85, 0.5)",
                  border: "1px solid #475569",
                  borderRadius: "6px",
                  padding: "12px",
                  color: "white",
                  outline: "none",
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !aliasVerified}
              style={{
                width: "100%",
                background: loading || !aliasVerified ? "#374151" : "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "16px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: loading || !aliasVerified ? "not-allowed" : "pointer",
                opacity: loading || !aliasVerified ? 0.6 : 1,
              }}
            >
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid white",
                      borderTop: "2px solid transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  Processing Swap...
                </div>
              ) : (
                "Execute Swap & Notify via Clypr"
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {(result || error) && (
          <div
            style={{
              marginTop: "1.5rem",
              background: "rgba(30, 41, 59, 0.5)",
              border: "1px solid #334155",
              borderRadius: "12px",
              padding: "1.5rem",
            }}
          >
            <h3 style={{ color: "white", fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem" }}>
              Transaction Result
            </h3>

            {error && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  borderRadius: "8px",
                  padding: "12px",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div style={{ color: "#f87171" }}>
                  <AlertCircleIcon />
                </div>
                <span style={{ color: "#f87171" }}>{error}</span>
              </div>
            )}

            {result && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {result.status === "success" && (
                  <div
                    style={{
                      background: "rgba(34, 197, 94, 0.1)",
                      border: "1px solid rgba(34, 197, 94, 0.2)",
                      borderRadius: "8px",
                      padding: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div style={{ color: "#4ade80" }}>
                      <CheckCircleIcon />
                    </div>
                    <span style={{ color: "#4ade80" }}>Swap completed and user notified via Clypr!</span>
                  </div>
                )}

                <div
                  style={{
                    background: "rgba(15, 23, 42, 0.5)",
                    borderRadius: "8px",
                    padding: "1rem",
                  }}
                >
                  <pre
                    style={{
                      fontSize: "0.875rem",
                      color: "#cbd5e1",
                      margin: 0,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {JSON.stringify(result, (key, value) =>
                      typeof value === "bigint" ? value.toString() : value,
                    2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Demo Info */}
        <div
          style={{
            marginTop: "1.5rem",
            background: "rgba(30, 41, 59, 0.3)",
            border: "1px solid #334155",
            borderRadius: "12px",
            padding: "1.5rem",
          }}
        >
          <h3 style={{ color: "white", fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem" }}>
            🤖 Clypr Agent Demo
          </h3>

          <div style={{ color: "#cbd5e1" }}>
            <p style={{ fontWeight: "500", marginBottom: "0.5rem" }}>How this demonstrates Clypr Agent:</p>
            <ul style={{ paddingLeft: "1.25rem", fontSize: "0.875rem", color: "#94a3b8", lineHeight: "1.5" }}>
              <li style={{ marginBottom: "0.25rem" }}>
                <strong>dApp Integration:</strong> defiDwap only needs to call{" "}
                <code style={{ background: "#374151", padding: "2px 4px", borderRadius: "4px" }}>notifyAlias()</code> -
                no complex
                <strong>User Control:</strong> Users manage their notification preferences through their Clypr agent
              </li>
              <li style={{ marginBottom: "0.25rem" }}>
                <strong>Alias Verification:</strong> Built-in{" "}
                <code style={{ background: "#374151", padding: "2px 4px", borderRadius: "4px" }}>verifyAlias()</code>{" "}
                ensures notifications reach valid users
              </li>
              <li style={{ marginBottom: "0.25rem" }}>
                <strong>Agent Intelligence:</strong> User's agent decides how/when to deliver notifications based on
                their preferences
              </li>
              <li>
                <strong>Multi-Channel:</strong> Agent can deliver via email, Telegram, webhooks, or any configured
                channel
              </li>
            </ul>
          </div>

          <div
            style={{
              paddingTop: "0.75rem",
              borderTop: "1px solid #334155",
              marginTop: "0.75rem",
            }}
          >
            <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
              💡 <strong>Key Insight:</strong> dApps focus on their core functionality while Clypr agents handle all
              user communication preferences and delivery logic.
            </p>
          </div>
        </div>

        {/* Add CSS animation for spinner */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}
