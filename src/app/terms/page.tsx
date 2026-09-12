import Link from 'next/link';
import { Card, CardContent } from '@/components/ui';

export const metadata = {
  title: 'Terms of Play — Guess The Imposter',
  description: 'The simple rules for playing Guess The Imposter: be kind, no cheating, have fun.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-orange-600 hover:underline text-sm font-medium">← Back to home</Link>
        <h1 className="font-display text-4xl font-bold text-gray-900 mt-4 mb-6">Terms of Play</h1>
        <Card className="card-elevated">
          <CardContent className="p-6 sm:p-8 space-y-4 text-gray-700">
            <p><strong>1. Have fun, be kind.</strong> No harassment, hate speech, or abusive nicknames. Hosts may remove disruptive players.</p>
            <p><strong>2. No cheating.</strong> Don&apos;t reveal the secret word outside the game, don&apos;t use extra accounts to peek at roles, and don&apos;t exploit bugs. Cheaters may be removed from rooms.</p>
            <p><strong>3. Your content.</strong> Clues and chat messages you write are your responsibility. Keep them family-friendly.</p>
            <p><strong>4. Availability.</strong> This is an early version — games may occasionally break or rooms may expire. We&apos;re improving it every week.</p>
            <p><strong>5. Fair play changes.</strong> We may update these terms as features (accounts, leaderboards, premium) launch.</p>
            <p className="text-sm text-gray-500">Last updated: September 2026.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
