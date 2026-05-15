import React, { Component, ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          backgroundColor: "#0a0a0a",
          color: "#f5f5f5",
          fontFamily: "system-ui, sans-serif"
        }}>
          <div style={{
            maxWidth: "400px",
            textAlign: "center",
            padding: "2rem",
            backgroundColor: "#1a1a1a",
            borderRadius: "12px",
            border: "1px solid #333"
          }}>
            <h2 style={{ color: "#ef4444", marginBottom: "1rem" }}>
              Something went wrong
            </h2>
            <p style={{ color: "#9ca3af", marginBottom: "1.5rem" }}>
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={this.handleRetry}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}