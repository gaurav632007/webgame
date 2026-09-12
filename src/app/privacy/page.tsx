import Link from 'next/link';
import { Card, CardContent } from '@/components/ui';

export const metadata = {
  title: 'Privacy Policy — Guess The Imposter',
  description: 'How Guess The Imposter handles your data: nicknames, rooms, and analytics.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-orange-600 hover:underline text-sm font-medium">← Back to home</Link>
        <h1 className="font-display text-4xl font-bold text-gray-900 mt-4 mb-6">Privacy Policy</h1>
        <Card className="card-elevated">
          <CardContent className="p-6 sm:p-8 space-y-4 text-gray-700">
            <p><strong>No account needed.</strong> You can play with just a nickname — we don&apos;t ask for your email, phone number, or real name.</p>
            <p><strong>What we store:</strong> your nickname, avatar choice, room codes, game actions (clues, votes, messages), and anonymous analytics events (rooms created, games completed). Game chat messages exist to run the current game.</p>
            <p><strong>What we never store:</strong> no passwords (there are no accounts yet), no payment details, no precise location.</p>
            <p><strong>Sharing:</strong> room codes and share links you send to friends are how others join your game. Don&apos;t share rooms with strangers if you want to keep the game private.</p>
            <p><strong>Children:</strong> the game is a party game for general audiences. Children should play with a parent or guardian&apos;s permission.</p>
            <p><strong>Contact:</strong> questions about your data? Open an issue on our GitHub repository and we&apos;ll respond.</p>
            <p className="text-sm text-gray-500">Last updated: September 2026. This is an early version and will be expanded before public launch.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
