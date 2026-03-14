import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AgentTip — x402 Tipping Layer for the Internet',
  description: 'Accept tips from humans and micropayments from AI agents. One line of code. USDC on Base.',
  openGraph: {
    title: 'AgentTip — x402 Tipping Layer for the Internet',
    description: 'Accept tips from humans and micropayments from AI agents.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
