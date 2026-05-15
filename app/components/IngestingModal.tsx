'use client'

import React, { useState, useEffect } from 'react'

interface IngestingModalProps {
  isOpen: boolean
}

const MESSAGES = [
  "Fetching FEC candidate records...",
  "Cross-referencing campaign filings...",
  "Aggregating corporate PAC contributions...",
  "Calculating integrity index metrics...",
  "Verifying historical data points...",
  "Finalizing candidate profile..."
]

export default function IngestingModal({ isOpen }: IngestingModalProps) {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    if (!isOpen) {
      setMessageIndex(0)
      return
    }

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length)
    }, 2500)

    return () => clearInterval(interval)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-card card animate-fade-in">
        <div className="ingesting-visual">
          <div className="ingesting-glow"></div>
          <div className="ingesting-spinner"></div>
          <div className="ingesting-icon">📊</div>
        </div>
        
        <h2 className="modal-title">Ingesting Candidate Data</h2>
        <p className="modal-description text-secondary">
          We're fetching records from the FEC and aggregating financial data. This process involves cross-referencing multiple databases to ensure accuracy.
        </p>
        
        <div className="loader-container">
          <div className="loader-track">
            <div className="loader-fill"></div>
          </div>
          <div className="loader-status">
            <span className="status-text animate-fade-in" key={messageIndex}>
              {MESSAGES[messageIndex]}
            </span>
          </div>
        </div>

        <p className="modal-footer text-muted">
          This usually takes around 1-3 minutes. Please don't close this window.
        </p>
      </div>
    </div>
  )
}
