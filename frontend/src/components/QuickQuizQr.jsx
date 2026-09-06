import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { css } from "../lib/css";

// Real, scannable QR code (unlike lib/QrCode.jsx's decorative pseudo-random grid) generated
// entirely client-side — encodes a URL straight to /quiz, the fully self-contained demo quiz page
// (QuickQuiz.jsx). No backend call happens anywhere in this component or in what it links to, by
// design: a live demo scanning this with a phone must keep working even if the backend/database
// is down, unreachable, or the phone has no route back to wherever the backend is running.
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export default function QuickQuizQr() {
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [error, setError] = useState(null);

  const isLocal = LOCAL_HOSTS.has(window.location.hostname);
  const quizUrl = `${window.location.origin}/quiz`;

  useEffect(() => {
    QRCode.toDataURL(quizUrl, { margin: 1, width: 260 })
      .then(setQrDataUrl)
      .catch((err) => setError(err.message));
  }, [quizUrl]);

  return (
    <div style={css("background:#fff; border:1px solid #E3E9F2; border-radius:14px; overflow:hidden")}>
      <div style={css("background:#1B5CB8; padding:13px 20px; text-align:center; font-size:15px; font-weight:700; color:#fff")}>
        Scan for a live demo quiz — no login, no backend
      </div>
      <div style={css("padding:22px; text-align:center")}>
        {error && <div style={css("color:#991B1B; font-size:13px")}>Could not generate QR: {error}</div>}
        {qrDataUrl && (
          <div style={css("display:inline-block; border:1px solid #E3E9F2; border-radius:12px; padding:14px; background:#fff")}>
            <img src={qrDataUrl} alt="QR code linking to the built-in demo quiz" width={260} height={260} />
          </div>
        )}
        <div style={css("font-size:12.5px; color:#5A6C86; margin-top:14px; word-break:break-all")}>{quizUrl}</div>
        {isLocal && (
          <div style={css("text-align:left; background:#FFF9F2; border:1px solid #F3CFA6; border-radius:10px; padding:12px 14px; margin-top:14px; font-size:12.5px; color:#7A4A12; line-height:1.6")}>
            <strong>This page is running on {window.location.hostname}</strong> — a phone on a different network can't reach that address. To actually scan this from a phone: either open the deployed URL (Vercel/Hugging Face) instead of localhost, or restart the dev server with <code>npm run dev -- --host</code> and load this page using your computer's LAN IP (e.g. <code>http://192.168.x.x:5173</code>) so the QR encodes an address your phone can actually reach.
          </div>
        )}
        <div style={css("font-size:12px; color:#7A8AA3; margin-top:10px")}>
          Opens the same 10-question Price Statistics diagnostic the real backend serves — answered and scored entirely on the phone.
        </div>
      </div>
    </div>
  );
}
