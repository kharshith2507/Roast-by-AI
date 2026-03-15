import { useRef, useEffect, forwardRef, useImperativeHandle, useState, useCallback } from "react";

const CameraView = forwardRef(function CameraView({ onCapture, savage }, ref) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [flash, setFlash] = useState(false);
  const [facingMode, setFacingMode] = useState("user"); // "user" = front, "environment" = back
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [flipping, setFlipping] = useState(false);

  // Check if device has multiple cameras
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoDevices = devices.filter((d) => d.kind === "videoinput");
      setHasMultipleCameras(videoDevices.length > 1);
    }).catch(() => {});
  }, []);

  const startStream = useCallback(async (facing) => {
    // Stop existing stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setReady(true);
    } catch {
      setReady(false);
    }
  }, []);

  // Start camera on mount
  useEffect(() => {
    startStream(facingMode);
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Flip camera
  const handleFlip = async () => {
    if (flipping) return;
    setFlipping(true);
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    await startStream(next);
    setTimeout(() => setFlipping(false), 500);
  };

  useImperativeHandle(ref, () => ({
    captureFrame() {
      const video = videoRef.current;
      if (!video || !video.videoWidth) return null;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      // Mirror only for front camera
      if (facingMode === "user") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg");
      const base64 = dataUrl.split(",")[1];
      return { base64, dataUrl };
    },
  }));

  const capture = () => {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    // Mirror only for front camera
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg");
    const base64 = dataUrl.split(",")[1];

    // Flash effect
    setFlash(true);
    setTimeout(() => setFlash(false), 300);

    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    onCapture(base64, dataUrl);
  };

  const accentColor = savage ? "var(--primary)" : "var(--accent)";
  const glowColor = savage ? "rgba(255, 61, 61, 0.35)" : "rgba(255, 205, 60, 0.3)";
  // Mirror video preview only for front camera
  const videoMirror = facingMode === "user" ? "scaleX(-1)" : "scaleX(1)";

  return (
    <div className="camera-wrapper">
      <style>{`
        .camera-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          width: 100%;
        }
        .camera-top-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 28px;
        }
        .camera-hint {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--text-dim);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .camera-hint-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22dd77;
          animation: pulse 1.5s ease-in-out infinite;
        }
        .camera-facing-badge {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 3px 10px;
          border-radius: 100px;
          border: 1px solid var(--border);
          color: var(--text-dim);
          background: var(--surface);
        }
        .camera-frame-outer {
          position: relative;
          width: 240px;
          height: 240px;
        }
        .camera-ring {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 2px solid;
          animation: rotate-ring 6s linear infinite;
        }
        @keyframes rotate-ring {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .camera-ring-inner {
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .camera-circle {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid;
          transition: box-shadow 0.4s;
        }
        .camera-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: opacity 0.25s ease, transform 0.25s ease;
        }
        .camera-video.flipping {
          opacity: 0;
          transform: scaleX(0) !important;
        }
        .camera-scanline {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 40%;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.04), transparent);
          animation: scanline 3s linear infinite;
          pointer-events: none;
        }
        .camera-corner {
          position: absolute;
          width: 20px;
          height: 20px;
          border-color: inherit;
          border-style: solid;
        }
        .camera-corner-tl { top: -1px; left: -1px; border-width: 3px 0 0 3px; border-radius: 6px 0 0 0; }
        .camera-corner-tr { top: -1px; right: -1px; border-width: 3px 3px 0 0; border-radius: 0 6px 0 0; }
        .camera-corner-bl { bottom: -1px; left: -1px; border-width: 0 0 3px 3px; border-radius: 0 0 0 6px; }
        .camera-corner-br { bottom: -1px; right: -1px; border-width: 0 3px 3px 0; border-radius: 0 0 6px 0; }
        .camera-flash {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: white;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.08s ease;
        }
        .camera-flash.active { opacity: 0.85; }

        /* ── Flip button ── */
        .flip-btn {
          position: absolute;
          bottom: 8px;
          right: 8px;
          z-index: 10;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1.5px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          box-shadow: 0 2px 14px rgba(0,0,0,0.5);
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
        }
        .flip-btn:hover {
          background: rgba(255, 255, 255, 0.18);
          border-color: rgba(255, 255, 255, 0.4);
          transform: scale(1.1);
        }
        .flip-btn:active { transform: scale(0.93); }
        .flip-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .flip-btn svg {
          width: 20px;
          height: 20px;
          transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .flip-btn.spinning svg {
          transform: rotate(180deg);
        }

        .capture-btn {
          position: relative;
          background: linear-gradient(135deg, var(--primary), #cc2200);
          color: #fff;
          border: none;
          border-radius: 14px;
          padding: 16px 44px;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          cursor: pointer;
          font-family: var(--font-display);
          box-shadow: 0 4px 20px rgba(255,61,61,0.4);
          transition: all 0.2s;
          overflow: hidden;
        }
        .capture-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transition: left 0.4s ease;
        }
        .capture-btn:hover::before { left: 150%; }
        .capture-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(255,61,61,0.5);
        }
        .capture-btn:active {
          transform: translateY(0);
          box-shadow: 0 2px 12px rgba(255,61,61,0.35);
        }
        .capture-btn-gold {
          background: linear-gradient(135deg, var(--accent), #e68a00) !important;
          color: #111 !important;
          box-shadow: 0 4px 20px rgba(255,205,60,0.35) !important;
        }
        .capture-btn-gold:hover {
          box-shadow: 0 8px 32px rgba(255,205,60,0.5) !important;
        }
      `}</style>

      {ready && (
        <div className="camera-top-row">
          <div className="camera-hint">
            <span className="camera-hint-dot" />
            Point camera at your face
          </div>
          {hasMultipleCameras && (
            <span className="camera-facing-badge">
              {facingMode === "user" ? "📱 Front" : "🔭 Back"}
            </span>
          )}
        </div>
      )}

      <div className="camera-frame-outer">
        {/* Dashed spinning ring */}
        <div
          className="camera-ring"
          style={{ borderColor: accentColor, borderStyle: "dashed", opacity: 0.5 }}
        />
        <div className="camera-ring-inner" />

        {/* Corner brackets */}
        {["tl", "tr", "bl", "br"].map((pos) => (
          <div
            key={pos}
            className={`camera-corner camera-corner-${pos}`}
            style={{ borderColor: accentColor }}
          />
        ))}

        {/* Main circle */}
        <div
          className="camera-circle"
          style={{
            borderColor: accentColor,
            boxShadow: `0 0 0 4px ${glowColor}, 0 0 40px ${glowColor}`,
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`camera-video ${flipping ? "flipping" : ""}`}
            style={{ transform: videoMirror }}
          />
          <div className="camera-scanline" />
          <div className={`camera-flash ${flash ? "active" : ""}`} />
        </div>

        {/* Flip camera button — only shown when multiple cameras exist */}
        {hasMultipleCameras && (
          <button
            className={`flip-btn ${flipping ? "spinning" : ""}`}
            onClick={handleFlip}
            disabled={flipping}
            title={facingMode === "user" ? "Switch to back camera" : "Switch to front camera"}
            aria-label="Switch camera"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        )}
      </div>

      <button
        onClick={capture}
        className={`capture-btn ${savage ? "" : "capture-btn-gold"}`}
      >
        📸 Capture &amp; Roast
      </button>
    </div>
  );
});

export default CameraView;
