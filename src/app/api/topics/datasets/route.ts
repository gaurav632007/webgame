import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

/** Distinct topic categories with live counts + examples for the dataset picker. */
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('topics').select('category, word').limit(2000);
    if (error) throw error;
    const rows = (data ?? []) as Array<{ category: string; word: string }>;
    const map = new Map<string, { count: number; examples: string[] }>();
    for (const r of rows) {
      const cat = (r.category || 'misc').toLowerCase();
      if (!map.has(cat)) map.set(cat, { count: 0, examples: [] });
      const entry = map.get(cat)!;
      entry.count += 1;
      if (entry.examples.length < 5 && !entry.examples.includes(r.word)) entry.examples.push(r.word);
    }
    const datasets = [...map.entries()]
      .map(([category, v]) => ({ category, count: v.count, examples: v.examples }))
      .sort((a, b) => b.count - a.count);
    return NextResponse.json({ datasets });
  } catch (error) {
    console.error('Datasets error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
