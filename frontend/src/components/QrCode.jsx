// Deterministic pseudo-QR decoration (not a real scannable code — matches the
// original design's mock generator) used on the sign-in/session screens.
export function qr(size, seed) {
  const n = 21, cell = size / n, on = [];
  let s = seed;
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  const finder = (r, c) => {
    for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) {
      if (Math.max(Math.abs(i - 3), Math.abs(j - 3)) !== 1) on.push([r + i, c + j]);
    }
  };
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const inFinder = (r < 8 && c < 8) || (r < 8 && c > 12) || (r > 12 && c < 8);
    if (!inFinder && rnd() > 0.52) on.push([r, c]);
  }
  finder(0, 0); finder(0, 14); finder(14, 0);
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label="Session QR code" style={{ display: "block" }}>
      {on.map((p, i) => (
        <rect key={i} x={p[1] * cell} y={p[0] * cell} width={cell + 0.4} height={cell + 0.4} fill="#123E7C" />
      ))}
    </svg>
  );
}
