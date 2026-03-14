/**
 * AgentTip Widget — Wallet Integration
 * Handles Coinbase Smart Wallet connection and USDC transfers
 */

// USDC on Base
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const BASE_CHAIN_ID = 8453;
const BASE_CHAIN_ID_HEX = '0x2105';

// ERC-20 transfer function selector: transfer(address,uint256)
const TRANSFER_SELECTOR = '0xa9059cbb';

interface WindowWithEthereum extends Window {
  ethereum?: any;
}

/**
 * Connect to Coinbase Smart Wallet (or any injected wallet)
 */
export async function connectWallet(): Promise<string | null> {
  const win = window as WindowWithEthereum;

  if (!win.ethereum) {
    // Try to open Coinbase Wallet
    window.open('https://www.coinbase.com/wallet', '_blank');
    throw new Error('No wallet detected. Please install Coinbase Wallet.');
  }

  try {
    // Request accounts
    const accounts = await win.ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts returned from wallet');
    }

    // Switch to Base chain
    try {
      await win.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_CHAIN_ID_HEX }],
      });
    } catch (switchError: any) {
      // If chain not added, add it
      if (switchError.code === 4902) {
        await win.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: BASE_CHAIN_ID_HEX,
            chainName: 'Base',
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://mainnet.base.org'],
            blockExplorerUrls: ['https://basescan.org'],
          }],
        });
      }
    }

    return accounts[0];
  } catch (error: any) {
    console.error('[AgentTip] Wallet connection error:', error);
    throw error;
  }
}

/**
 * Send USDC transfer on Base
 * @param recipientAddress - Creator wallet address
 * @param amountUSD - Amount in USD (USDC has 6 decimals)
 * @returns Transaction hash
 */
export async function sendUSDCTip(
  recipientAddress: string,
  amountUSD: number
): Promise<string> {
  const win = window as WindowWithEthereum;

  if (!win.ethereum) {
    throw new Error('No wallet detected');
  }

  // Convert amount to USDC (6 decimals)
  const amountInSmallestUnit = BigInt(Math.round(amountUSD * 1_000_000));
  const amountHex = '0x' + amountInSmallestUnit.toString(16).padStart(64, '0');

  // Encode transfer(address, uint256) call
  const recipientPadded = recipientAddress.toLowerCase().replace('0x', '').padStart(64, '0');
  const data = TRANSFER_SELECTOR + recipientPadded + amountHex.replace('0x', '');

  const accounts = await win.ethereum.request({ method: 'eth_accounts' });
  if (!accounts || accounts.length === 0) {
    throw new Error('Wallet not connected');
  }

  try {
    const txHash = await win.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: accounts[0],
        to: USDC_ADDRESS,
        data: '0x' + data.replace('0x', ''),
        chainId: BASE_CHAIN_ID_HEX,
      }],
    });

    return txHash;
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('Transaction rejected by user');
    }
    throw error;
  }
}
