import { useRef, useEffect, forwardRef, useImperativeHandle, useState } from "react";

const CameraView = forwardRef(function CameraView({ onCapture, savage }, ref) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setReady(true);
      })
      .catch(() => setReady(false));
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useImperativeHandle(ref, () => ({
    captureFrame() {
      const video = videoRef.current;
      if (!video || !video.videoWidth) return null;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg");
      const base64 = dataUrl.split(",")[1];
      return { base64, dataUrl };
    },
  }));

  const capture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg");
    const base64 = dataUrl.split(",")[1];

    // Flash effect
    setFlash(true);
    setTimeout(() => setFlash(false), 300);

    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    onCapture(base64, dataUrl);
  };

  const accentColor = savage ? "var(--primary)" : "var(--accent)";
  const glowColor = savage
    ? "rgba(255, 61, 61, 0.35)"
    : "rgba(255, 205, 60, 0.3)";

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
          transform: scaleX(-1);
          display: block;
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
        <div className="camera-hint">
          <span className="camera-hint-dot" />
          Point camera at your face
        </div>
      )}

      <div className="camera-frame-outer">
        {/* Dashed spinning ring */}
        <div
          className="camera-ring"
          style={{
            borderColor: accentColor,
            borderStyle: "dashed",
            opacity: 0.5,
          }}
        />
        <div className="camera-ring-inner" />

        {/* Corner brackets */}
        {["tl","tr","bl","br"].map(pos => (
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
          <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
          {/* Scanline effect */}
          <div className="camera-scanline" />
          {/* Flash */}
          <div className={`camera-flash ${flash ? "active" : ""}`} />
        </div>
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
