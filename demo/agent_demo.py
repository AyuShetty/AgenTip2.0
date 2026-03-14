#!/usr/bin/env python3
"""
AgentTip — AI Agent Demo Script

This script demonstrates how an AI agent interacts with a website
protected by the x402 protocol:

1. Sends a GET request to a content page
2. Receives HTTP 402 Payment Required with x402 headers
3. Simulates payment (in production, would use Coinbase agent wallet)
4. Re-requests with payment proof
5. Receives and displays the content

Usage:
    python agent_demo.py [--url URL] [--wallet WALLET]

Requirements:
    pip install requests
"""

import argparse
import json
import sys
import time
import uuid
from datetime import datetime

try:
    import requests
except ImportError:
    print("❌ Please install requests: pip install requests")
    sys.exit(1)


# ANSI colors for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    DIM = '\033[2m'
    END = '\033[0m'


def print_banner():
    print(f"""
{Colors.BOLD}{Colors.CYAN}
   ╔══════════════════════════════════════════════╗
   ║     🤖 AgentTip — AI Agent Demo Script      ║
   ║     x402 Protocol Payment Flow               ║
   ╚══════════════════════════════════════════════╝
{Colors.END}""")


def print_step(step_num: int, text: str):
    print(f"\n{Colors.BOLD}{Colors.BLUE}[Step {step_num}]{Colors.END} {text}")


def print_header(key: str, value: str):
    print(f"  {Colors.DIM}{key}:{Colors.END} {Colors.YELLOW}{value}{Colors.END}")


def print_success(text: str):
    print(f"\n  {Colors.GREEN}✅ {text}{Colors.END}")


def print_error(text: str):
    print(f"\n  {Colors.RED}❌ {text}{Colors.END}")


def simulate_agent_flow(api_url: str, content_url: str, creator_wallet: str):
    """Simulate the full x402 payment flow."""
    
    print_banner()
    print(f"  {Colors.DIM}API URL:    {api_url}{Colors.END}")
    print(f"  {Colors.DIM}Content:    {content_url}{Colors.END}")
    print(f"  {Colors.DIM}Wallet:     {creator_wallet}{Colors.END}")
    print(f"  {Colors.DIM}Timestamp:  {datetime.now().isoformat()}{Colors.END}")
    
    # ── Step 1: Request content as an AI agent ──
    print_step(1, "Requesting content as AI agent...")
    
    headers = {
        'User-Agent': 'AI-Agent/1.0 (AgentTip Demo; Python)',
        'X-Agent-Type': 'autonomous',
        'Accept': 'application/json',
    }
    
    try:
        response = requests.get(content_url, headers=headers, timeout=10)
    except requests.ConnectionError:
        # If the content URL doesn't work, try the API directly
        print(f"  {Colors.DIM}Content URL not reachable, demonstrating API flow directly...{Colors.END}")
        response = None
    
    if response and response.status_code == 402:
        print(f"  {Colors.YELLOW}← HTTP 402 Payment Required{Colors.END}")
        print(f"\n  {Colors.BOLD}Payment Headers Received:{Colors.END}")
        
        # Parse x402 payment details from response
        payment_data = response.json()
        payment_info = payment_data.get('payment', {})
        
        for key, val in payment_info.items():
            print_header(key, str(val))
            
    else:
        # Simulate 402 response for demo purposes
        print(f"  {Colors.DIM}(Simulating 402 response for demo){Colors.END}")
        print(f"  {Colors.YELLOW}← HTTP 402 Payment Required{Colors.END}")
        print(f"\n  {Colors.BOLD}Payment Headers:{Colors.END}")
        print_header("X-Payment-Amount", "0.001")
        print_header("X-Payment-Asset", "USDC")
        print_header("X-Payment-Network", "base")
        print_header("X-Payment-Recipient", creator_wallet)
        print_header("X-Payment-Protocol", "x402")
    
    time.sleep(1)  # Dramatic pause
    
    # ── Step 2: Parse payment requirements ──
    print_step(2, "Parsing x402 payment requirements...")
    
    payment_amount = 0.001
    payment_asset = "USDC"
    payment_network = "base"
    
    print(f"  Amount:  {Colors.GREEN}${payment_amount} {payment_asset}{Colors.END}")
    print(f"  Network: {Colors.CYAN}{payment_network}{Colors.END}")
    print(f"  To:      {Colors.CYAN}{creator_wallet[:10]}...{creator_wallet[-6:]}{Colors.END}")
    
    time.sleep(0.5)
    
    # ── Step 3: Simulate micropayment ──
    print_step(3, "Sending micropayment via Coinbase Agent Wallet...")
    
    # In production: use ethers/viem to send actual USDC transfer
    simulated_tx_hash = f"0xdemo{uuid.uuid4().hex[:56]}"
    
    print(f"  {Colors.DIM}Connecting to Base RPC...{Colors.END}")
    time.sleep(0.5)
    print(f"  {Colors.DIM}Signing USDC transfer...{Colors.END}")
    time.sleep(0.5)
    print(f"  {Colors.DIM}Broadcasting transaction...{Colors.END}")
    time.sleep(0.5)
    
    print(f"\n  {Colors.GREEN}Transaction sent!{Colors.END}")
    print(f"  TxHash: {Colors.CYAN}{simulated_tx_hash[:20]}...{simulated_tx_hash[-8:]}{Colors.END}")
    
    # ── Step 4: Submit payment proof to backend ──
    print_step(4, "Submitting payment proof to AgentTip backend...")
    
    verify_payload = {
        'wallet': creator_wallet,
        'txHash': simulated_tx_hash,
        'amount': payment_amount,
    }
    
    try:
        verify_response = requests.post(
            f"{api_url}/verify-payment",
            json=verify_payload,
            headers={'Content-Type': 'application/json'},
            timeout=10,
        )
        
        if verify_response.status_code == 200:
            result = verify_response.json()
            print_success("Payment verified by backend!")
            print(f"  Access: {Colors.GREEN}{result.get('access', 'granted')}{Colors.END}")
            if result.get('transaction'):
                print(f"  Transaction ID: {Colors.CYAN}{result['transaction'].get('id', 'N/A')}{Colors.END}")
        else:
            print(f"  {Colors.YELLOW}Backend response: {verify_response.status_code}{Colors.END}")
            try:
                print(f"  {Colors.DIM}{verify_response.json()}{Colors.END}")
            except:
                pass
    except requests.ConnectionError:
        print(f"  {Colors.DIM}(Backend not running — simulating success){Colors.END}")
        print_success("Payment verified! (simulated)")
    
    time.sleep(0.5)
    
    # ── Step 5: Access content ──
    print_step(5, "Accessing content with payment proof...")
    
    content_headers = {
        **headers,
        'X-Payment-Proof': simulated_tx_hash,
        'X-Payment-TxHash': simulated_tx_hash,
    }
    
    print(f"  {Colors.DIM}→ GET {content_url}{Colors.END}")
    print(f"  {Colors.DIM}  X-Payment-Proof: {simulated_tx_hash[:20]}...{Colors.END}")
    
    time.sleep(0.5)
    print(f"  {Colors.GREEN}← HTTP 200 OK{Colors.END}")
    
    # ── Summary ──
    print(f"""
{Colors.BOLD}{Colors.GREEN}
   ╔══════════════════════════════════════════════╗
   ║       ✅ x402 Payment Flow Complete!         ║
   ╠══════════════════════════════════════════════╣
   ║  Payment:  $0.001 USDC on Base              ║
   ║  Status:   Verified                          ║
   ║  Content:  Access Granted                    ║
   ╚══════════════════════════════════════════════╝
{Colors.END}""")
    
    print(f"  {Colors.DIM}This demonstrates how AI agents can autonomously pay for")
    print(f"  content using the x402 protocol. In production, the agent would")
    print(f"  use a real Coinbase Agent Wallet to send USDC on Base.{Colors.END}")
    print()


def main():
    parser = argparse.ArgumentParser(
        description='AgentTip AI Agent Demo — x402 Payment Flow'
    )
    parser.add_argument(
        '--api-url',
        default='http://localhost:3001',
        help='AgentTip backend API URL (default: http://localhost:3001)'
    )
    parser.add_argument(
        '--content-url',
        default='http://localhost:3001/health',
        help='Content URL to request (default: http://localhost:3001/health)'
    )
    parser.add_argument(
        '--wallet',
        default='0x742d35Cc6634C0532925a3b844Bc9e7595f2bD78',
        help='Creator wallet address'
    )
    
    args = parser.parse_args()
    simulate_agent_flow(args.api_url, args.content_url, args.wallet)


if __name__ == '__main__':
    main()
