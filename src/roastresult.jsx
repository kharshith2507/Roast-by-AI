import { useState, useEffect } from "react";

function TypingText({ text }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    if (!text) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 24);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span>
      {displayed}
      {displayed.length < (text?.length || 0) && (
        <span className="typing-cursor">|</span>
      )}
    </span>
  );
}

export default function RoastResult({ imageDataUrl, roast, loading, onRetry, savage }) {
  const accentColor = savage ? "var(--primary)" : "var(--accent)";
  const glowColor = savage ? "rgba(255,61,61,0.3)" : "rgba(255,205,60,0.25)";

  return (
    <div className="rr-wrapper">
      <style>{`
        .rr-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 22px;
          animation: fadeIn 0.4s ease;
          width: 100%;
        }
        .rr-photo-ring {
          position: relative;
          width: 180px;
          height: 180px;
          flex-shrink: 0;
        }
        .rr-photo-circle {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid;
          position: relative;
          z-index: 1;
        }
        .rr-photo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scaleX(-1);
          display: block;
        }
        .rr-loading-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          padding: 28px 20px;
        }
        .rr-flame {
          font-size: 42px;
          animation: pulse 0.7s ease-in-out infinite alternate;
          display: block;
        }
        .rr-loading-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-muted);
          font-style: italic;
          letter-spacing: 0.3px;
        }
        .rr-loading-dots {
          display: flex;
          gap: 6px;
        }
        .rr-loading-dots span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--primary);
          animation: rr-bounce 1s ease-in-out infinite;
        }
        .rr-loading-dots span:nth-child(2) { animation-delay: 0.15s; }
        .rr-loading-dots span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes rr-bounce {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50%       { transform: scale(1.4); opacity: 1; }
        }
        .rr-roast-box {
          background: var(--bg3);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px 26px;
          width: 100%;
          position: relative;
          overflow: hidden;
        }
        .rr-roast-quote-mark {
          position: absolute;
          top: -8px;
          left: 16px;
          font-size: 80px;
          font-family: Georgia, serif;
          line-height: 1;
          opacity: 0.08;
          color: var(--text);
          pointer-events: none;
          user-select: none;
        }
        .rr-roast-text {
          font-family: 'DM Sans', Georgia, serif;
          font-size: 16px;
          font-weight: 400;
          line-height: 1.75;
          color: var(--text);
          position: relative;
          z-index: 1;
          font-style: italic;
        }
        .rr-roast-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px solid var(--border);
        }
        .rr-mode-badge {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 100px;
        }
        .rr-mode-badge-savage {
          background: rgba(255,61,61,0.12);
          color: var(--primary);
          border: 1px solid rgba(255,61,61,0.2);
        }
        .rr-mode-badge-friendly {
          background: rgba(255,205,60,0.1);
          color: var(--accent);
          border: 1px solid rgba(255,205,60,0.2);
        }
        .rr-meter {
          display: flex;
          gap: 3px;
          margin-left: auto;
        }
        .typing-cursor {
          display: inline-block;
          animation: blink 0.6s ease-in-out infinite;
          color: var(--primary);
          font-weight: 300;
          margin-left: 1px;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        .btn-roast-again {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-muted);
          border-radius: var(--radius-md);
          padding: 11px 28px;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .btn-roast-again:hover {
          border-color: var(--primary);
          color: var(--primary);
          background: rgba(255,61,61,0.06);
        }
      `}</style>

      {/* Photo */}
      {imageDataUrl && (
        <div className="rr-photo-ring">
          <div
            className="rr-photo-circle"
            style={{
              borderColor: accentColor,
              boxShadow: `0 0 0 4px ${glowColor}, 0 0 32px ${glowColor}`,
            }}
          >
            <img src={imageDataUrl} alt="You" className="rr-photo-img" />
          </div>
        </div>
      )}

      {/* Loading or Roast */}
      {loading ? (
        <div className="rr-loading-box">
          <span className="rr-flame">🔥</span>
          <p className="rr-loading-label">AI is judging you...</p>
          <div className="rr-loading-dots">
            <span /><span /><span />
          </div>
        </div>
      ) : (
        <div
          className="rr-roast-box"
          style={{ borderColor: `rgba(${savage ? "255,61,61" : "255,205,60"},0.2)` }}
        >
          <div className="rr-roast-quote-mark">"</div>
          <p className="rr-roast-text">
            <TypingText text={roast} />
          </p>
          <div className="rr-roast-footer">
            <span className={`rr-mode-badge ${savage ? "rr-mode-badge-savage" : "rr-mode-badge-friendly"}`}>
              {savage ? "😈 Savage" : "😇 Friendly"}
            </span>
          </div>
        </div>
      )}

      <button onClick={onRetry} className="btn-roast-again">
        🔁 Roast Me Again
      </button>
    </div>
  );
}
