/**
 * AgentTip Widget — CSS Styles
 * All styles are scoped inside the shadow DOM to avoid conflicts
 */

export const WIDGET_STYLES = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  :host {
    --at-primary: #6366f1;
    --at-primary-hover: #4f46e5;
    --at-primary-glow: rgba(99, 102, 241, 0.4);
    --at-success: #10b981;
    --at-success-glow: rgba(16, 185, 129, 0.4);
    --at-bg: #0f0f14;
    --at-bg-card: #1a1a24;
    --at-bg-hover: #252535;
    --at-border: rgba(255, 255, 255, 0.08);
    --at-text: #f1f1f4;
    --at-text-muted: #9ca3af;
    --at-radius: 16px;
    --at-radius-sm: 10px;
    --at-font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --at-shadow: 0 24px 48px rgba(0,0,0,0.4);
  }

  .at-fab {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 24px rgba(99, 102, 241, 0.4), 0 2px 8px rgba(0,0,0,0.2);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 999999;
    animation: at-fab-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  .at-fab:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 32px rgba(99, 102, 241, 0.6), 0 4px 12px rgba(0,0,0,0.3);
  }

  .at-fab:active {
    transform: scale(0.95);
  }

  .at-fab svg {
    width: 24px;
    height: 24px;
    fill: white;
    transition: transform 0.3s ease;
  }

  .at-fab:hover svg {
    transform: scale(1.15);
  }

  .at-fab .at-pulse {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    animation: at-pulse 2s ease-in-out infinite;
    z-index: -1;
  }

  @keyframes at-pulse {
    0% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.4); opacity: 0; }
    100% { transform: scale(1); opacity: 0; }
  }

  @keyframes at-fab-enter {
    0% { transform: scale(0) rotate(-180deg); opacity: 0; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }

  /* Overlay */
  .at-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 1000000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .at-overlay.at-visible {
    opacity: 1;
    pointer-events: all;
  }

  /* Modal */
  .at-modal {
    background: var(--at-bg);
    border: 1px solid var(--at-border);
    border-radius: var(--at-radius);
    width: 380px;
    max-width: 90vw;
    box-shadow: var(--at-shadow);
    font-family: var(--at-font);
    color: var(--at-text);
    overflow: hidden;
    transform: translateY(20px) scale(0.95);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .at-overlay.at-visible .at-modal {
    transform: translateY(0) scale(1);
  }

  /* Header */
  .at-header {
    padding: 20px 24px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--at-border);
  }

  .at-header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .at-header-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .at-header-icon svg {
    width: 18px;
    height: 18px;
    fill: white;
  }

  .at-header h3 {
    font-size: 16px;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .at-header p {
    font-size: 12px;
    color: var(--at-text-muted);
    margin-top: 1px;
  }

  .at-close {
    width: 32px;
    height: 32px;
    border: none;
    background: var(--at-bg-card);
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--at-text-muted);
    transition: all 0.2s;
  }

  .at-close:hover {
    background: var(--at-bg-hover);
    color: var(--at-text);
  }

  /* Body */
  .at-body {
    padding: 20px 24px;
  }

  .at-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--at-text-muted);
    margin-bottom: 12px;
    display: block;
  }

  /* Amount buttons */
  .at-amounts {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 16px;
  }

  .at-amount-btn {
    padding: 14px 8px;
    border: 1.5px solid var(--at-border);
    border-radius: var(--at-radius-sm);
    background: var(--at-bg-card);
    color: var(--at-text);
    font-family: var(--at-font);
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
  }

  .at-amount-btn:hover {
    border-color: var(--at-primary);
    background: rgba(99, 102, 241, 0.08);
  }

  .at-amount-btn.at-selected {
    border-color: var(--at-primary);
    background: rgba(99, 102, 241, 0.15);
    box-shadow: 0 0 0 1px var(--at-primary);
  }

  .at-amount-btn span {
    display: block;
    font-size: 11px;
    font-weight: 400;
    color: var(--at-text-muted);
    margin-top: 4px;
  }

  /* Custom amount */
  .at-custom {
    position: relative;
    margin-bottom: 20px;
  }

  .at-custom-prefix {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--at-text-muted);
    font-size: 15px;
    font-weight: 500;
    pointer-events: none;
  }

  .at-custom input {
    width: 100%;
    padding: 12px 14px 12px 28px;
    border: 1.5px solid var(--at-border);
    border-radius: var(--at-radius-sm);
    background: var(--at-bg-card);
    color: var(--at-text);
    font-family: var(--at-font);
    font-size: 15px;
    font-weight: 500;
    outline: none;
    transition: border-color 0.2s;
  }

  .at-custom input::placeholder {
    color: rgba(156, 163, 175, 0.5);
  }

  .at-custom input:focus {
    border-color: var(--at-primary);
  }

  /* Pay button */
  .at-pay-btn {
    width: 100%;
    padding: 14px;
    border: none;
    border-radius: var(--at-radius-sm);
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    font-family: var(--at-font);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .at-pay-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
    transform: translateY(-1px);
  }

  .at-pay-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .at-pay-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .at-pay-btn svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }

  /* Footer */
  .at-footer {
    padding: 12px 24px 16px;
    text-align: center;
    border-top: 1px solid var(--at-border);
  }

  .at-footer span {
    font-size: 11px;
    color: var(--at-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  .at-footer a {
    color: var(--at-primary);
    text-decoration: none;
    font-weight: 500;
  }

  /* Success state */
  .at-success-container {
    padding: 40px 24px;
    text-align: center;
    display: none;
  }

  .at-success-container.at-visible {
    display: block;
  }

  .at-success-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba(16, 185, 129, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    animation: at-success-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .at-success-icon svg {
    width: 32px;
    height: 32px;
    fill: var(--at-success);
  }

  .at-success-container h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .at-success-container p {
    font-size: 13px;
    color: var(--at-text-muted);
    line-height: 1.5;
  }

  @keyframes at-success-pop {
    0% { transform: scale(0); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }

  /* Loading spinner */
  .at-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: at-spin 0.6s linear infinite;
  }

  @keyframes at-spin {
    to { transform: rotate(360deg); }
  }

  /* Error state */
  .at-error {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    color: #fca5a5;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 13px;
    margin-bottom: 16px;
    display: none;
  }

  .at-error.at-visible {
    display: block;
  }

  /* Confetti */
  .at-confetti {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1000001;
    overflow: hidden;
  }

  .at-confetti-piece {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 2px;
    animation: at-confetti-fall 3s ease-in-out forwards;
  }

  @keyframes at-confetti-fall {
    0% {
      transform: translateY(-100vh) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }
`;
