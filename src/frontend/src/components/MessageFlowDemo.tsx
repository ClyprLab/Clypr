import { useEffect, useState } from "react"

const MessageFlowDemo = () => {
  const [animationState, setAnimationState] = useState<
    | "idle"
    | "incoming"
    | "analyzing"
    | "resolving"
    | "loading_prefs"
    | "processing"
    | "checking_sender"
    | "sender_verified"
    | "analyzing_content"
    | "applying_rules"
    | "ai_analyzing"
    | "ai_detected"
    | "pii_redaction"
    | "generating_summary"
    | "preparing_delivery"
    | "routing_email"
    | "routing_telegram"
    | "dispatching"
    | "email_delivered"
    | "telegram_delivered"
    | "updating_receipt"
    | "success"
    | "privacy_preserved"
  >("idle")

  const statusMessages = {
    idle: "Ready to route messages...",
    incoming: "Incoming request from DeFiSwap dApp...",
    analyzing: "Message type: 'transaction_alert'",
    resolving: "Resolving username to principal...",
    loading_prefs: "Loading user preferences and rules...",
    processing: "Your Agent processing message...",
    checking_sender: "Checking sender allowlist...",
    sender_verified: "Sender verified ✓",
    analyzing_content: "Analyzing message content...",
    applying_rules: "Applying user rule: 'Route DeFi alerts to Email + Telegram'",
    ai_analyzing: "AI analyzing message priority...",
    ai_detected: "AI detected high urgency (score: 0.89)",
    pii_redaction: "Applying PII redaction transform...",
    generating_summary: "Generating message summary...",
    preparing_delivery: "Preparing for multi-channel delivery...",
    routing_email: "Routing to Email channel...",
    routing_telegram: "Routing to Telegram channel...",
    dispatching: "Dispatching to channels...",
    email_delivered: "Email delivered ✓",
    telegram_delivered: "Telegram delivered ✓",
    updating_receipt: "Updating message receipt...",
    success: "All channels notified successfully",
    privacy_preserved: "User privacy preserved throughout delivery",
  }

  useEffect(() => {
    const runAnimation = () => {
      const states = [
        "incoming",
        "analyzing",
        "resolving",
        "loading_prefs",
        "processing",
        "checking_sender",
        "sender_verified",
        "analyzing_content",
        "applying_rules",
        "ai_analyzing",
        "ai_detected",
        "pii_redaction",
        "generating_summary",
        "preparing_delivery",
        "routing_email",
        "routing_telegram",
        "dispatching",
        "email_delivered",
        "telegram_delivered",
        "updating_receipt",
        "success",
        "privacy_preserved",
        "idle",
      ]

      let currentIndex = 0
      const stateInterval = setInterval(() => {
        if (currentIndex < states.length) {
          setAnimationState(states[currentIndex] as any)
          currentIndex++
        } else {
          clearInterval(stateInterval)
        }
      }, 1200) // Slower timing - 1.2 seconds per state

      return () => clearInterval(stateInterval)
    }

    // Start first animation after mount
    const initialTimer = setTimeout(runAnimation, 1000)

    // Loop animation every 30 seconds to accommodate all states
    const interval = setInterval(runAnimation, 30000)

    return () => {
      clearTimeout(initialTimer)
      clearInterval(interval)
    }
  }, [])

  const isMessageTraveling = ["incoming", "analyzing", "resolving"].includes(animationState)
  const isProcessing = [
    "loading_prefs",
    "processing",
    "checking_sender",
    "sender_verified",
    "analyzing_content",
    "applying_rules",
    "ai_analyzing",
    "ai_detected",
    "pii_redaction",
    "generating_summary",
    "preparing_delivery",
  ].includes(animationState)
  const isDistributing = [
    "routing_email",
    "routing_telegram",
    "dispatching",
    "email_delivered",
    "telegram_delivered",
    "updating_receipt",
    "success",
  ].includes(animationState)

  return (
    <div className="relative w-full max-w-3xl mx-auto p-3 sm:p-6 bg-gradient-to-br from-white/5 to-white/10 rounded-2xl border border-white/10 overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Main Flow Container */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between items-center space-y-6 md:space-y-0 relative">
          {/* DApp Container */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-xl border border-blue-400/30 flex items-center justify-center transition-all duration-500 ease-out ${
                  isMessageTraveling ? "scale-110 border-blue-400/60 shadow-lg shadow-blue-400/25" : "scale-100"
                }`}
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-400 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-sm" />
                </div>
              </div>

              {/* Message dot that travels */}
              <div
                className={`absolute top-1/2 left-1/2 w-3 h-3 bg-gradient-to-r from-cyan-400 to-fuchsia-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out ${
                  isMessageTraveling
                    ? "md:translate-x-[180px] translate-y-[120px] md:translate-y-0 opacity-100"
                    : isProcessing || isDistributing
                      ? "md:translate-x-[180px] translate-y-[120px] md:translate-y-0 opacity-0"
                      : "opacity-100"
                }`}
              />
            </div>
            <span className="text-white/80 text-xs sm:text-sm font-medium">DeFiSwap</span>
          </div>

          {/* Connection Line 1 */}
          <div className="md:flex-1 md:h-px md:w-auto w-px h-16 bg-gradient-to-b md:bg-gradient-to-r from-white/20 to-white/10 md:mx-6 relative">
            <div
              className={`absolute md:top-0 md:left-0 left-0 top-0 md:h-full w-full md:w-0 h-0 bg-gradient-to-b md:bg-gradient-to-r from-cyan-400 to-fuchsia-400 transition-all duration-1000 ease-in-out ${
                isMessageTraveling ? "md:w-full h-full" : "md:w-0 h-0"
              }`}
            />
          </div>

          {/* Your Agent Container */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20 rounded-2xl border transition-all duration-500 ease-out flex items-center justify-center ${
                  isProcessing
                    ? "border-fuchsia-400/60 shadow-lg shadow-fuchsia-400/20 scale-110"
                    : "border-white/20 scale-100"
                }`}
              >
                <div className="relative">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-fuchsia-400 to-cyan-400 rounded-xl flex items-center justify-center">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white rounded-lg" />
                  </div>

                  {/* Processing animation */}
                  {isProcessing && (
                    <div className="absolute inset-0 rounded-xl border-2 border-fuchsia-400 animate-pulse" />
                  )}
                </div>
              </div>
            </div>
            <span className="text-white/80 text-xs sm:text-sm font-medium">Your Agent</span>
          </div>

          {/* Connection Line 2 */}
          <div className="md:flex-1 md:h-px md:w-auto w-px h-16 bg-gradient-to-b md:bg-gradient-to-r from-white/10 to-white/20 md:mx-6 relative">
            <div
              className={`absolute md:top-0 md:left-0 left-0 top-0 md:h-full w-full md:w-0 h-0 bg-gradient-to-b md:bg-gradient-to-r from-fuchsia-400 to-cyan-400 transition-all duration-800 ease-out ${
                isDistributing ? "md:w-full h-full" : "md:w-0 h-0"
              }`}
            />
          </div>

          {/* Channels Container */}
          <div className="flex flex-col items-center space-y-3">
            <div
              className={`flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2 transition-all duration-500 ease-out ${
                isDistributing ? "scale-110" : "scale-100"
              }`}
            >
              {/* Email Channel */}
              <div
                className={`w-12 h-10 sm:w-16 sm:h-12 bg-gradient-to-br from-red-500/20 to-red-600/30 rounded-lg border border-red-400/30 flex items-center justify-center transition-all duration-300 ${
                  ["email_delivered", "success"].includes(animationState)
                    ? "border-red-400/60 shadow-md shadow-red-400/20"
                    : ""
                }`}
              >
                <div className="w-3 h-2 sm:w-4 sm:h-3 bg-red-400 rounded-sm flex items-center justify-center">
                  <div className="w-1.5 h-0.5 sm:w-2 sm:h-1 bg-white rounded-sm" />
                </div>
              </div>

              {/* Telegram Channel */}
              <div
                className={`w-12 h-10 sm:w-16 sm:h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-lg border border-blue-400/30 flex items-center justify-center transition-all duration-300 ${
                  ["telegram_delivered", "success"].includes(animationState)
                    ? "border-blue-400/60 shadow-md shadow-blue-400/20"
                    : ""
                }`}
              >
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-400 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full" />
                </div>
              </div>
            </div>
            <span className="text-white/80 text-xs sm:text-sm font-medium">Your Channels</span>
          </div>
        </div>

        {/* Status Text */}
        <div className="text-center mt-4 sm:mt-6">
          <p className="text-white/70 text-xs sm:text-sm font-mono px-2">{statusMessages[animationState]}</p>
        </div>
      </div>
    </div>
  )
}

export default MessageFlowDemo
