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

    // Label: show "AI PORTRAIT" badge if applicable
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

        // For AI portrait: draw normally (not mirrored); for selfie: mirror
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
          // Draw AI portrait without mirroring
          ctx.drawImage(img, srcX, srcY, srcW, srcH, photoX, photoY, photoSize, photoSize);
        } else {
          // Mirror selfie
          ctx.translate(photoX + photoSize, photoY);
          ctx.scale(-1, 1);
          ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, photoSize, photoSize);
        }
        ctx.restore();

        // AI Portrait badge overlay
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
    link.download = isRandom ? "random-roast-card.png" : isAiPortrait ? "ai-portrait-roast-card.png" : "my-roast-card.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  if (!roast) return null;

  return (
    <div style={styles.wrapper}>
      <div style={styles.canvasWrap}>
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            borderRadius: "16px",
            boxShadow: savage
              ? "0 0 32px #ff444466, 0 8px 24px #00000088"
              : "0 0 32px #ffd70066, 0 8px 24px #00000088",
            opacity: ready ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        />
        {!ready && (
          <div style={styles.spinner}>
            <span style={{ fontSize: "32px", animation: "spin 1s linear infinite" }}>🔥</span>
            <p style={{ color: "#ffffff88", marginTop: "8px", fontSize: "13px" }}>Composing roast card…</p>
          </div>
        )}
      </div>

      {ready && (
        <button
          onClick={handleDownload}
          style={{
            ...styles.downloadBtn,
            background: savage
              ? "linear-gradient(135deg, #ff4444, #cc0000)"
              : "linear-gradient(135deg, #ffd700, #ffaa00)",
            color: savage ? "#fff" : "#222",
          }}
        >
          ⬇️ Download Roast Card
        </button>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: "14px", width: "100%", marginTop: "8px",
  },
  canvasWrap: {
    width: "100%", maxWidth: "360px", position: "relative",
    minHeight: "80px", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
  },
  spinner: {
    position: "absolute", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
  },
  downloadBtn: {
    border: "none", borderRadius: "14px", padding: "14px 36px",
    fontSize: "15px", fontWeight: "800", cursor: "pointer",
    letterSpacing: "0.5px", boxShadow: "0 4px 16px #00000044",
    transition: "transform 0.15s, box-shadow 0.15s",
  },
};
