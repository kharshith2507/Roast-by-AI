import { useRef, useEffect, forwardRef, useImperativeHandle, useState, useCallback } from "react";

const CameraView = forwardRef(function CameraView({ onCapture, savage }, ref) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [flash, setFlash] = useState(false);
  const [facingMode, setFacingMode] = useState("user");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoDevices = devices.filter((d) => d.kind === "videoinput");
      setHasMultipleCameras(videoDevices.length > 1);
    }).catch(() => { });
  }, []);

  const startStream = useCallback(async (facing) => {
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

  useEffect(() => {
    startStream(facingMode);

    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

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

    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg");
    const base64 = dataUrl.split(",")[1];

    setFlash(true);

    setTimeout(() => setFlash(false), 300);

    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());

    onCapture(base64, dataUrl);
  };

  const accentColor = savage ? "var(--primary)" : "var(--accent)";
  const glowColor = savage ? "rgba(255,61,61,0.35)" : "rgba(255,205,60,0.3)";
  const videoMirror = facingMode === "user" ? "scaleX(-1)" : "scaleX(1)";

  return (
    <div className="camera-wrapper">
      <style>{`

        .camera-wrapper{
          display:flex;
          flex-direction:column;
          align-items:center;
          gap:20px;
          width:100%;
        }

        .camera-frame-outer{
          position:relative;
          width:240px;
          height:240px;
          border-radius:50%;
        }

        .camera-ring{
          position:absolute;
          inset:-6px;
          border-radius:50%;
          border:2px dashed;
          animation:rotate-ring 6s linear infinite;
        }

        @keyframes rotate-ring{
          from{transform:rotate(0deg)}
          to{transform:rotate(360deg)}
        }

        .camera-ring-inner{
          position:absolute;
          inset:-3px;
          border-radius:50%;
          border:1px solid rgba(255,255,255,0.06);
        }

        .camera-circle{
          position:absolute;
          inset:0;
          border-radius:50%;
          overflow:hidden;
          border:3px solid;
          transition:box-shadow .4s;
        }

        .camera-video{
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
          transition:opacity .25s ease, transform .25s ease;
        }

        .camera-video.flipping{
          opacity:0;
          transform:scaleX(0)!important;
        }

        .camera-scanline{
          position:absolute;
          top:0;
          left:0;
          right:0;
          height:40%;
          background:linear-gradient(to bottom,transparent,rgba(255,255,255,0.04),transparent);
          animation:scanline 3s linear infinite;
        }

        .camera-flash{
          position:absolute;
          inset:0;
          border-radius:50%;
          background:white;
          opacity:0;
          pointer-events:none;
          transition:opacity .08s ease;
        }

        .camera-flash.active{
          opacity:.85;
        }

        .flip-btn{
          position:absolute;
          bottom:8px;
          right:8px;
          z-index:10;
          width:42px;
          height:42px;
          border-radius:50%;
          background:rgba(0,0,0,.6);
          backdrop-filter:blur(8px);
          border:1.5px solid rgba(255,255,255,.2);
          display:flex;
          align-items:center;
          justify-content:center;
          cursor:pointer;
          padding:0;
          box-shadow:0 2px 14px rgba(0,0,0,.5);
          transition:.2s;
        }

        .flip-btn:hover{
          transform:scale(1.1);
        }

        .flip-btn svg{
          width:20px;
          height:20px;
        }

        .capture-btn{
          position:relative;
          background:linear-gradient(135deg,var(--primary),#cc2200);
          color:#fff;
          border:none;
          border-radius:14px;
          padding:16px 44px;
          font-size:15px;
          font-weight:800;
          letter-spacing:1.5px;
          text-transform:uppercase;
          cursor:pointer;
          box-shadow:0 4px 20px rgba(255,61,61,0.4);
          transition:.2s;
        }

        .capture-btn:hover{
          transform:translateY(-2px);
          box-shadow:0 8px 32px rgba(255,61,61,0.5);
        }

      `}</style>

      <div className="camera-frame-outer">

        <div
          className="camera-ring"
          style={{ borderColor: accentColor }}
        />

        <div className="camera-ring-inner" />

        <div
          className="camera-circle"
          style={{
            borderColor: accentColor,
            boxShadow: `0 0 0 4px ${glowColor},0 0 40px ${glowColor}`
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

        {hasMultipleCameras && (
          <button
            className="flip-btn"
            onClick={handleFlip}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.5 9a9 9 0 0 1 14.8-3.3L23 10" />
              <path d="M1 14l4.6 4.3A9 9 0 0 0 20.4 15" />
            </svg>
          </button>
        )}

      </div>

      <button
        onClick={capture}
        className="capture-btn"
      >
        📸 Capture & Roast
      </button>

    </div>
  );
});

export default CameraView;
