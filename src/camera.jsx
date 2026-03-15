import { useRef, useEffect } from "react";

export default function CameraView({ onCapture }) {
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
            streamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
        });
        return () => {
            if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
        };
    }, []);

    const capture = () => {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
        const base64 = canvas.toDataURL("image/jpeg").split(",")[1];
        if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
        onCapture(base64, canvas.toDataURL("image/jpeg"));
    };

    return (
        <div style={styles.wrapper}>
            <p style={styles.hint}>📷 Point camera at your face</p>
            <div style={styles.circle}>
                <video ref={videoRef} autoPlay playsInline muted style={styles.video} />
            </div>
            <button onClick={capture} style={styles.captureBtn}>
                CAPTURE ROAST 📸
            </button>
        </div>
    );
}

const styles = {
    wrapper: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
    },
    hint: {
        fontSize: "13px",
        color: "#888",
        margin: 0,
        fontFamily: "'Segoe UI', sans-serif",
    },
    circle: {
        width: "220px",
        height: "220px",
        borderRadius: "50%",
        overflow: "hidden",
        border: "3px dashed #e55",
        boxShadow: "0 0 20px rgba(229,85,85,0.3)",
    },
    video: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: "scaleX(-1)",
    },
    captureBtn: {
        background: "linear-gradient(135deg, #ff4444, #ff8c00)",
        color: "#fff",
        border: "none",
        borderRadius: "12px",
        padding: "14px 40px",
        fontSize: "15px",
        fontWeight: "700",
        letterSpacing: "1.5px",
        cursor: "pointer",
        fontFamily: "'Segoe UI', sans-serif",
        boxShadow: "0 4px 15px rgba(255,68,68,0.4)",
        transition: "transform 0.15s, box-shadow 0.15s",
    },
};