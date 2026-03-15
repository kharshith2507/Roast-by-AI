export default function RoastResult({ imageDataUrl, roast, loading, onRetry }) {
    return (
        <div style={styles.wrapper}>
            <div style={styles.circle}>
                <img src={imageDataUrl} alt="You" style={styles.img} />
            </div>

            {loading ? (
                <div style={styles.loadingBox}>
                    <span style={styles.flame}>🔥</span>
                    <p style={styles.loadingText}>AI is judging you...</p>
                </div>
            ) : (
                <div style={styles.roastBox}>
                    <p style={styles.roastText}>{roast}</p>
                </div>
            )}

            <button onClick={onRetry} style={styles.retryBtn}>
                🔁 Roast Me Again
            </button>
        </div>
    );
}

const styles = {
    wrapper: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
        animation: "fadeIn 0.4s ease",
    },
    circle: {
        width: "180px",
        height: "180px",
        borderRadius: "50%",
        overflow: "hidden",
        border: "3px solid #ff4444",
        boxShadow: "0 0 25px rgba(255,68,68,0.45)",
    },
    img: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: "scaleX(-1)",
    },
    loadingBox: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
    },
    flame: {
        fontSize: "36px",
        animation: "pulse 0.8s infinite alternate",
    },
    loadingText: {
        color: "#ff8c00",
        fontFamily: "'Segoe UI', sans-serif",
        fontStyle: "italic",
        margin: 0,
    },
    roastBox: {
        background: "rgba(255,68,68,0.08)",
        border: "1.5px solid rgba(255,68,68,0.3)",
        borderRadius: "14px",
        padding: "18px 22px",
        maxWidth: "380px",
        textAlign: "center",
    },
    roastText: {
        color: "#222",
        fontFamily: "'Georgia', serif",
        fontSize: "15px",
        lineHeight: "1.7",
        margin: 0,
    },
    retryBtn: {
        background: "#fff",
        color: "#ff4444",
        border: "2px solid #ff4444",
        borderRadius: "12px",
        padding: "11px 32px",
        fontSize: "14px",
        fontWeight: "700",
        cursor: "pointer",
        fontFamily: "'Segoe UI', sans-serif",
        transition: "all 0.2s",
    },
};