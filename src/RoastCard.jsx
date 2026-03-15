import { useEffect, useRef, useState } from "react";

export default function RoastCard({ imageDataUrl, roast, savage, isRandom = false, isAiPortrait = false }) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  const drawBase = (ctx, CARD_W, CARD_H, accent) => {
    const bg = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
    if (savage) {
      bg.addColorStop(0, "#1a0000");
      bg.addColorStop(1, "#3d0000");
    } else {
      bg.addColorStop(0, "#0d1b2a");
      bg.addColorStop(1, "#1b2838");
    }
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, CARD_W, 6);
    ctx.fillStyle = accent;
    ctx.font = "bold 22px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🔥 ROAST BY AI 🔥", CARD_W / 2, 44);
  };

  const drawGlowRing = (ctx, cx, cy, radius, accent) => {
    ctx.save();
    ctx.shadowColor = accent;
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 4, 0, Math.PI * 2);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  };

  const drawRoastText = (ctx, CARD_W, CARD_H, accent, roast, photoBottomY) => {
    const divY = photoBottomY + 28;
    ctx.strokeStyle = `${accent}55`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, divY);
    ctx.lineTo(CARD_W - 40, divY);
    ctx.stroke();

    const labelY = divY + 30;
    ctx.fillStyle = `${accent}cc`;
    ctx.font = "bold 13px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";

    let modeLabel = savage ? "💀 SAVAGE ROAST" : "😇 FRIENDLY ROAST";
    if (isAiPortrait) modeLabel += "  •  🤖 AI PORTRAIT";
    ctx.fillText(modeLabel, CARD_W / 2, labelY);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px Georgia, serif";
    ctx.textAlign = "center";
    const maxW = CARD_W - 80;
    const lineH = 34;
    const words = roast.split(" ");
    const lines = [];
    let current = "";
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxW && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);

    const textBlockH = lines.length * lineH;
    const textStartY = labelY + 24 + (CARD_H - labelY - 24 - 70 - textBlockH) / 2;

    ctx.save();
    ctx.shadowColor = "#00000088";
    ctx.shadowBlur = 6;
    lines.forEach((line, i) => {
      ctx.fillText(line, CARD_W / 2, textStartY + i * lineH);
    });
    ctx.restore();

    ctx.fillStyle = `${accent}44`;
    ctx.font = "bold 80px Georgia, serif";
    ctx.textAlign = "left";
    ctx.fillText("\u201C", 16, textStartY + 10);
    ctx.textAlign = "right";
    ctx.fillText("\u201D", CARD_W - 16, textStartY + lineH * lines.length + 10);

    ctx.fillStyle = "#ffffff44";
    ctx.font = "12px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("roastbyai.app  •  Powered by Claude AI", CARD_W / 2, CARD_H - 18);

    ctx.fillStyle = accent;
    ctx.fillRect(0, CARD_H - 6, CARD_W, 6);
  };

  const drawPlaceholderAvatar = (ctx, cx, cy, radius, accent) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    const avatarBg = ctx.createRadialGradient(cx, cy - 20, 10, cx, cy, radius);
    avatarBg.addColorStop(0, "#2a2a2a");
    avatarBg.addColorStop(1, "#111111");
    ctx.fillStyle = avatarBg;
    ctx.fill();
    ctx.restore();

    ctx.font = `${radius * 0.9}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("😉", cx, cy);
    ctx.textBaseline = "alphabetic";

    ctx.fillStyle = `${accent}cc`;
    ctx.font = `bold ${radius * 0.18}px 'Segoe UI', sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("RANDOM ROAST", cx, cy + radius * 0.72);
  };

  useEffect(() => {
    if (!roast) return;
    setReady(false);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const CARD_W = 600;
    const CARD_H = 720;
    canvas.width = CARD_W;
    canvas.height = CARD_H;

    const accent = savage ? "#ff4444" : "#ffd700";
    const photoSize = 280;
    const photoX = (CARD_W - photoSize) / 2;
    const photoY = 65;
    const radius = photoSize / 2;
    const cx = photoX + radius;
    const cy = photoY + radius;

    if (isRandom || !imageDataUrl) {
      drawBase(ctx, CARD_W, CARD_H, accent);
      drawGlowRing(ctx, cx, cy, radius, accent);
      drawPlaceholderAvatar(ctx, cx, cy, radius, accent);
      drawRoastText(ctx, CARD_W, CARD_H, accent, roast, photoY + photoSize);
      setReady(true);
    } else {
      const img = new Image();
      img.onload = () => {
        drawBase(ctx, CARD_W, CARD_H, accent);
        drawGlowRing(ctx, cx, cy, radius, accent);

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.clip();
        const aspect = img.width / img.height;
        let srcW = img.width, srcH = img.height;
        if (aspect > 1) srcW = img.height;
        else srcH = img.width;
        const srcX = (img.width - srcW) / 2;
        const srcY = (img.height - srcH) / 2;

        if (isAiPortrait) {
          ctx.drawImage(img, srcX, srcY, srcW, srcH, photoX, photoY, photoSize, photoSize);
        } else {
          ctx.translate(photoX + photoSize, photoY);
          ctx.scale(-1, 1);
          ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, photoSize, photoSize);
        }
        ctx.restore();

        if (isAiPortrait) {
          ctx.save();
          ctx.fillStyle = "rgba(0,0,0,0.6)";
          ctx.beginPath();
          const badgeX = cx + radius * 0.55;
          const badgeY = cy + radius * 0.55;
          ctx.arc(badgeX, badgeY, 22, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = "22px serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("🤖", badgeX, badgeY);
          ctx.textBaseline = "alphabetic";
          ctx.restore();
        }

        drawRoastText(ctx, CARD_W, CARD_H, accent, roast, photoY + photoSize);
        setReady(true);
      };
      img.src = imageDataUrl;
    }
  }, [imageDataUrl, roast, savage, isRandom, isAiPortrait]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = isRandom
      ? "random-roast-card.png"
      : isAiPortrait
      ? "ai-portrait-roast-card.png"
      : "my-roast-card.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  if (!roast) return null;

  return (
    <div className="rc-wrapper">
      <style>{`
        .rc-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          width: 100%;
          margin-top: 8px;
        }
        .rc-canvas-wrap {
          width: 100%;
          max-width: 360px;
          position: relative;
          min-height: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .rc-canvas {
          width: 100%;
          border-radius: 16px;
          transition: opacity 0.4s ease;
        }
        .rc-spinner {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .rc-spinner span {
          font-size: 32px;
          animation: spin 1s linear infinite;
        }
        .rc-spinner p {
          color: var(--text-muted);
          font-size: 13px;
          margin: 0;
        }
        .rc-download-btn {
          border: none;
          border-radius: 14px;
          padding: 14px 36px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          letter-spacing: 0.5px;
          font-family: var(--font-body);
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .rc-download-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(0,0,0,0.4);
        }
        .rc-download-btn:active { transform: translateY(0); }
      `}</style>

      <div className="rc-canvas-wrap">
        <canvas
          ref={canvasRef}
          className="rc-canvas"
          style={{
            boxShadow: savage
              ? "0 0 32px rgba(255,68,68,0.4), 0 8px 24px rgba(0,0,0,0.5)"
              : "0 0 32px rgba(255,215,0,0.35), 0 8px 24px rgba(0,0,0,0.5)",
            opacity: ready ? 1 : 0,
          }}
        />
        {!ready && (
          <div className="rc-spinner">
            <span>🔥</span>
            <p>Composing roast card…</p>
          </div>
        )}
      </div>

      {ready && (
        <button
          onClick={handleDownload}
          className="rc-download-btn"
          style={{
            background: savage
              ? "linear-gradient(135deg, #ff4444, #cc0000)"
              : "linear-gradient(135deg, #ffd700, #ffaa00)",
            color: savage ? "#fff" : "#111",
          }}
        >
          ⬇️ Download Roast Card
        </button>
      )}
    </div>
  );
}
