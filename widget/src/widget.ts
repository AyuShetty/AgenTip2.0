/**
 * AgentTip Widget — Main Entry Point
 * 
 * Usage:
 * <script src="https://agenttip.xyz/widget.js" data-wallet="CREATOR_WALLET"></script>
 */

import { WIDGET_STYLES } from './styles';
import { ICONS } from './icons';
import { connectWallet, sendUSDCTip } from './wallet';

interface AgentTipConfig {
  wallet: string;
  apiUrl: string;
  position?: 'bottom-right' | 'bottom-left';
  theme?: 'dark' | 'light';
}

class AgentTipWidget {
  private config: AgentTipConfig;
  private shadow: ShadowRoot;
  private container: HTMLElement;
  private selectedAmount: number = 1;
  private isOpen: boolean = false;
  private connectedWallet: string | null = null;

  constructor(config: AgentTipConfig) {
    this.config = config;

    // Create shadow DOM container
    this.container = document.createElement('div');
    this.container.id = 'agenttip-widget';
    this.shadow = this.container.attachShadow({ mode: 'closed' });

    document.body.appendChild(this.container);

    this.render();
    this.trackPageView();
  }

  private render(): void {
    // Inject styles
    const styleEl = document.createElement('style');
    styleEl.textContent = WIDGET_STYLES;
    this.shadow.appendChild(styleEl);

    // Create FAB (floating action button)
    const fab = document.createElement('button');
    fab.className = 'at-fab';
    fab.setAttribute('aria-label', 'Tip Creator');
    fab.innerHTML = `
      <span class="at-pulse"></span>
      ${ICONS.heart}
    `;
    fab.addEventListener('click', () => this.open());
    this.shadow.appendChild(fab);

    // Create overlay + modal
    const overlay = document.createElement('div');
    overlay.className = 'at-overlay';
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    overlay.innerHTML = `
      <div class="at-modal">
        <div class="at-header">
          <div class="at-header-left">
            <div class="at-header-icon">${ICONS.heart}</div>
            <div>
              <h3>Tip Creator</h3>
              <p>Powered by AgentTip · USDC on Base</p>
            </div>
          </div>
          <button class="at-close" aria-label="Close">${ICONS.close}</button>
        </div>

        <div class="at-body at-tip-form">
          <div class="at-error" id="at-error"></div>

          <span class="at-label">Choose tip amount</span>
          <div class="at-amounts">
            <button class="at-amount-btn" data-amount="0.50">$0.50<span>Coffee ☕</span></button>
            <button class="at-amount-btn at-selected" data-amount="1">$1<span>Thanks 🙏</span></button>
            <button class="at-amount-btn" data-amount="5">$5<span>Amazing 🌟</span></button>
          </div>

          <div class="at-custom">
            <span class="at-custom-prefix">$</span>
            <input type="number" placeholder="Custom amount" min="0.01" step="0.01" id="at-custom-input" />
          </div>

          <button class="at-pay-btn" id="at-pay-btn">
            ${ICONS.wallet}
            <span>Connect Wallet & Tip</span>
          </button>
        </div>

        <div class="at-success-container" id="at-success">
          <div class="at-success-icon">
            <svg viewBox="0 0 24 24" fill="var(--at-success)"><path d="M20 6L9 17l-5-5" fill="none" stroke="var(--at-success)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <h3>Tip Sent! 🎉</h3>
          <p id="at-success-msg">Your tip has been sent successfully.<br/>Thank you for supporting this creator!</p>
        </div>

        <div class="at-footer">
          <span>🔒 Secured by <a href="https://agenttip.xyz" target="_blank" rel="noopener">AgentTip</a> · x402 Protocol</span>
        </div>
      </div>
    `;

    this.shadow.appendChild(overlay);

    // Wire up event listeners
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Close button
    const closeBtn = this.shadow.querySelector('.at-close');
    closeBtn?.addEventListener('click', () => this.close());

    // Amount buttons
    const amountBtns = this.shadow.querySelectorAll('.at-amount-btn');
    amountBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        amountBtns.forEach(b => b.classList.remove('at-selected'));
        btn.classList.add('at-selected');
        this.selectedAmount = parseFloat(btn.getAttribute('data-amount') || '1');
        
        // Clear custom input
        const customInput = this.shadow.getElementById('at-custom-input') as HTMLInputElement;
        if (customInput) customInput.value = '';
      });
    });

    // Custom input
    const customInput = this.shadow.getElementById('at-custom-input') as HTMLInputElement;
    customInput?.addEventListener('input', () => {
      const val = parseFloat(customInput.value);
      if (val > 0) {
        this.selectedAmount = val;
        amountBtns.forEach(b => b.classList.remove('at-selected'));
      }
    });

    // Pay button
    const payBtn = this.shadow.getElementById('at-pay-btn');
    payBtn?.addEventListener('click', () => this.handlePayment());
  }

  private open(): void {
    this.isOpen = true;
    const overlay = this.shadow.querySelector('.at-overlay');
    overlay?.classList.add('at-visible');

    // Reset state
    this.resetForm();
  }

  private close(): void {
    this.isOpen = false;
    const overlay = this.shadow.querySelector('.at-overlay');
    overlay?.classList.remove('at-visible');
  }

  private resetForm(): void {
    const form = this.shadow.querySelector('.at-tip-form') as HTMLElement;
    const success = this.shadow.getElementById('at-success') as HTMLElement;
    const error = this.shadow.getElementById('at-error') as HTMLElement;

    if (form) form.style.display = 'block';
    if (success) success.classList.remove('at-visible');
    if (error) error.classList.remove('at-visible');

    // Reset pay button
    const payBtn = this.shadow.getElementById('at-pay-btn') as HTMLButtonElement;
    if (payBtn) {
      payBtn.disabled = false;
      payBtn.innerHTML = `${ICONS.wallet}<span>Connect Wallet & Tip</span>`;
    }
  }

  private showError(message: string): void {
    const error = this.shadow.getElementById('at-error') as HTMLElement;
    if (error) {
      error.textContent = message;
      error.classList.add('at-visible');
    }
  }

  private async handlePayment(): Promise<void> {
    const payBtn = this.shadow.getElementById('at-pay-btn') as HTMLButtonElement;

    try {
      // Show loading state
      payBtn.disabled = true;
      payBtn.innerHTML = `<span class="at-spinner"></span><span>Connecting...</span>`;
      
      // Hide any previous error
      const error = this.shadow.getElementById('at-error') as HTMLElement;
      error?.classList.remove('at-visible');

      // Connect wallet if not connected
      if (!this.connectedWallet) {
        this.connectedWallet = await connectWallet();
        if (!this.connectedWallet) {
          throw new Error('Failed to connect wallet');
        }
      }

      // Update button to show sending state
      payBtn.innerHTML = `<span class="at-spinner"></span><span>Sending $${this.selectedAmount} USDC...</span>`;

      // Send USDC transfer
      const txHash = await sendUSDCTip(this.config.wallet, this.selectedAmount);

      // Report tip to backend
      payBtn.innerHTML = `<span class="at-spinner"></span><span>Confirming...</span>`;

      await fetch(`${this.config.apiUrl}/tip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: this.config.wallet,
          amount: this.selectedAmount,
          txHash,
          senderWallet: this.connectedWallet,
        }),
      });

      // Show success
      this.showSuccess();
    } catch (err: any) {
      console.error('[AgentTip] Payment error:', err);
      payBtn.disabled = false;
      payBtn.innerHTML = `${ICONS.wallet}<span>Connect Wallet & Tip</span>`;
      this.showError(err.message || 'Payment failed. Please try again.');
    }
  }

  private showSuccess(): void {
    const form = this.shadow.querySelector('.at-tip-form') as HTMLElement;
    const success = this.shadow.getElementById('at-success') as HTMLElement;
    const msg = this.shadow.getElementById('at-success-msg') as HTMLElement;

    if (form) form.style.display = 'none';
    if (success) success.classList.add('at-visible');
    if (msg) {
      msg.innerHTML = `Your $${this.selectedAmount} USDC tip has been sent!<br/>Thank you for supporting this creator! 💜`;
    }

    // Show confetti
    this.showConfetti();

    // Auto-close after 4 seconds
    setTimeout(() => this.close(), 4000);
  }

  private showConfetti(): void {
    const confettiEl = document.createElement('div');
    confettiEl.className = 'at-confetti';
    this.shadow.appendChild(confettiEl);

    const colors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

    for (let i = 0; i < 50; i++) {
      const piece = document.createElement('div');
      piece.className = 'at-confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = Math.random() * 0.5 + 's';
      piece.style.animationDuration = (2 + Math.random() * 2) + 's';
      piece.style.width = (6 + Math.random() * 8) + 'px';
      piece.style.height = (6 + Math.random() * 8) + 'px';
      confettiEl.appendChild(piece);
    }

    // Clean up after animation
    setTimeout(() => confettiEl.remove(), 4000);
  }

  private async trackPageView(): Promise<void> {
    try {
      // Simple page view tracking — fire and forget
      fetch(`${this.config.apiUrl}/creator/${this.config.wallet}/stats`, {
        method: 'GET',
      }).catch(() => {}); // Ignore errors
    } catch {}
  }
}

// Auto-initialize from script tag
function init(): void {
  const scriptTag = document.currentScript as HTMLScriptElement | null;
  
  if (!scriptTag) {
    // Try to find the script tag by src
    const scripts = document.querySelectorAll('script[data-wallet]');
    if (scripts.length > 0) {
      const tag = scripts[scripts.length - 1] as HTMLScriptElement;
      initFromTag(tag);
    }
    return;
  }

  initFromTag(scriptTag);
}

function initFromTag(tag: HTMLElement): void {
  const wallet = tag.getAttribute('data-wallet');
  if (!wallet) {
    console.error('[AgentTip] Missing data-wallet attribute on script tag');
    return;
  }

  const apiUrl = tag.getAttribute('data-api') || 'https://agenttip.xyz/api';

  new AgentTipWidget({
    wallet,
    apiUrl,
    position: (tag.getAttribute('data-position') as any) || 'bottom-right',
    theme: (tag.getAttribute('data-theme') as any) || 'dark',
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export default AgentTipWidget;
