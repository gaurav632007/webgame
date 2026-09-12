export interface ShareCardData {
  winner: 'civilians' | 'imposter' | string;
  secret: string | null;
  imposters: Array<{ nickname: string }>;
  playerCount: number;
  roomCode: string;
}

/** Renders a shareable result card on canvas and returns a PNG blob. */
export async function drawResultCard(data: ShareCardData): Promise<Blob> {
  const W = 1080;
  const H = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#f97316');
  bg.addColorStop(0.5, '#ec4899');
  bg.addColorStop(1, '#9333ea');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.arc(140 + i * 200, 180 + (i % 2) * 720, 90, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 84px system-ui, sans-serif';
  ctx.fillText('GUESS THE IMPOSTER', W / 2, 220);

  const civiliansWon = data.winner === 'civilians';
  ctx.font = 'bold 110px system-ui, sans-serif';
  ctx.fillText(civiliansWon ? 'IMPOSTER CAUGHT!' : 'IMPOSTER ESCAPED!', W / 2, 380);

  ctx.font = '48px system-ui, sans-serif';
  ctx.fillText(`Secret: ${data.secret ?? '???'}`, W / 2, 480);

  ctx.font = 'bold 56px system-ui, sans-serif';
  const names = data.imposters.map((p) => p.nickname).join(' & ') || '???';
  ctx.fillText(`Imposter: ${names}`, W / 2, 580);

  ctx.font = '44px system-ui, sans-serif';
  ctx.fillText(`${data.playerCount} players · Room ${data.roomCode}`, W / 2, 670);

  ctx.font = 'bold 52px system-ui, sans-serif';
  ctx.fillText('Could your friends catch you?', W / 2, 790);
  ctx.font = '44px system-ui, sans-serif';
  ctx.fillText('Play free — no account needed', W / 2, 860);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Could not render share card'));
    }, 'image/png');
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
