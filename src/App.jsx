import { useState } from "react";
import CameraView from "./camera";
import RoastResult from "./roastresult";
import RoastCard from "./RoastCard";

const RANDOM_ROASTS = [
  "You look like you Google 'how to be interesting' every morning.",
  "Your face called. It wants its expression back.",
  "You have the energy of someone who replies 'k' to paragraphs.",
  "You look like the NPC that gives side quests no one does.",
  "Your vibe is aggressively mid and somehow proud of it.",
];

export default function App() {
  const [savage, setSavage] = useState(true);
  const [phase, setPhase] = useState("camera");
  const [capturedImage, setCapturedImage] = useState(null);
  const [roast, setRoast] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRandom, setIsRandom] = useState(false);
  const [aiPortrait, setAiPortrait] = useState(null);
  const [portraitLoading, setPortraitLoading] = useState(false);
  const [portraitPrompt, setPortraitPrompt] = useState("");

  const handleCapture = async (base64, dataUrl) => {
    setCapturedImage(dataUrl);
    setPhase("result");
    setLoading(true);
    setRoast("");
    setIsRandom(false);
    setAiPortrait(null);
    setPortraitPrompt("");

    let roastText = "";

    try {
      const response = await fetch("http://localhost:5000/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mode: savage ? "savage" : "friendly" }),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      const roasts = data?.data?.roasts;
      roastText = roasts?.length > 0
        ? roasts[Math.floor(Math.random() * roasts.length)]
        : "AI took one look and became speechless. That's the roast.";
      setRoast(roastText);
    } catch (error) {
      console.error("Roast error:", error);
      roastText = "AI refused to roast you. You're too powerful.";
      setRoast(roastText);
    } finally {
      setLoading(false);
    }

    setPortraitLoading(true);
    try {
      const portraitRes = await fetch("http://localhost:5000/api/portrait", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, roast: roastText, mode: savage ? "savage" : "friendly" }),
      });
      if (!portraitRes.ok) throw new Error(`Portrait error: ${portraitRes.status}`);
      const portraitData = await portraitRes.json();
      if (portraitData.portrait) setAiPortrait(portraitData.portrait);
      if (portraitData.imagePrompt) setPortraitPrompt(portraitData.imagePrompt);
    } catch (err) {
      console.error("Portrait error:", err);
    } finally {
      setPortraitLoading(false);
    }
  };

  const handleRandom = () => {
    setCapturedImage(null);
    setIsRandom(true);
    setPhase("result");
    setLoading(false);
    setAiPortrait(null);
    setPortraitLoading(false);
    setPortraitPrompt("");
    setRoast(RANDOM_ROASTS[Math.floor(Math.random() * RANDOM_ROASTS.length)]);
  };

  const handleRetry = () => {
    setCapturedImage(null);
    setRoast("");
    setIsRandom(false);
    setAiPortrait(null);
    setPortraitLoading(false);
    setPortraitPrompt("");
    setPhase("camera");
  };

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes fadeIn  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse   { from { transform:scale(1); } to { transform:scale(1.2); } }
        @keyframes spin    { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes shimmer { 0% { background-position:-400px 0; } 100% { background-position:400px 0; } }
      `}</style>

      <div style={styles.header}>
        <h1 style={styles.title}>Roast by AI 🔥</h1>
        <div style={styles.underline} />
        <p style={styles.sub}>"Take a selfie and let AI roast you."</p>
        <div style={styles.toggleRow}>
          <span style={styles.label}>🐱 Friendly</span>
          <div onClick={() => setSavage((s) => !s)} style={{ ...styles.toggle, background: savage ? "#ff4444" : "#ccc" }}>
            <div style={{ ...styles.thumb, transform: savage ? "translateX(20px)" : "translateX(0)" }} />
          </div>
          <span style={styles.label}>😈 Savage</span>
        </div>
        {savage && <p style={styles.savageTag}>😤 ALL CAPS energy, no mercy 🔥</p>}
      </div>

      <div style={styles.card}>
        {phase === "camera" ? (
          <>
            <CameraView onCapture={handleCapture} />
            <button onClick={handleRandom} style={styles.randomBtn}>🎲 Random Roast</button>
          </>
        ) : (
          <>
            <RoastResult imageDataUrl={capturedImage} roast={roast} loading={loading} onRetry={handleRetry} />

            {!isRandom && (loading || portraitLoading || aiPortrait || portraitPrompt) && (
              <div style={{ width: "100%", animation: "fadeIn 0.5s ease" }}>
                <p style={styles.sectionLabel}>🤖 Your AI Portrait</p>
                {portraitLoading || loading ? (
                  <div style={styles.portraitSkeleton}>
                    <span style={{ fontSize: "28px", display: "block", marginBottom: "8px", animation: "spin 1.2s linear infinite" }}>🎨</span>
                    <p style={{ color: "#ff8c00", fontSize: "13px", margin: 0, fontStyle: "italic" }}>AI is painting your portrait...</p>
                  </div>
                ) : aiPortrait ? (
                  <div style={styles.portraitWrap}>
                    <img src={aiPortrait} alt="AI-generated portrait" style={{ ...styles.portraitImg, boxShadow: savage ? "0 0 28px #ff444466, 0 6px 20px #00000055" : "0 0 28px #ffd70066, 0 6px 20px #00000055" }} />
                    <p style={styles.portraitCaption}>✨ AI's interpretation of you</p>
                  </div>
                ) : portraitPrompt ? (
                  <div style={styles.promptBox}>
                    <p style={styles.promptLabel}>🎨 AI Portrait Prompt Ready</p>
                    <p style={styles.promptText}>{portraitPrompt}</p>
                    <p style={styles.promptHint}>Wire up fal.ai or Replicate in the backend to auto-generate the image!</p>
                  </div>
                ) : null}
              </div>
            )}

            {!loading && roast && (
              <div style={{ width: "100%", animation: "fadeIn 0.5s ease" }}>
                <p style={styles.sectionLabel}>🎨 Your Roast Card</p>
                <RoastCard imageDataUrl={aiPortrait || capturedImage} roast={roast} savage={savage} isRandom={isRandom} isAiPortrait={!!aiPortrait} />
              </div>
            )}

            {!loading && <button onClick={handleRetry} style={styles.retakeBtn}>🔄 Retake Photo</button>}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#fafaf7", display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 16px", fontFamily: "'Segoe UI', sans-serif" },
  header: { textAlign: "center", marginBottom: "28px" },
  title: { fontSize: "42px", fontFamily: "'Brush Script MT', cursive", margin: "0 0 4px", color: "#111" },
  underline: { height: "3px", width: "200px", background: "linear-gradient(90deg, #ff4444, #ff8c00)", margin: "0 auto 10px", borderRadius: "2px" },
  sub: { fontStyle: "italic", color: "#666", fontSize: "14px", margin: "0 0 14px" },
  toggleRow: { display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" },
  label: { fontSize: "14px", color: "#444" },
  toggle: { width: "44px", height: "24px", borderRadius: "12px", position: "relative", cursor: "pointer", transition: "background 0.3s" },
  thumb: { width: "20px", height: "20px", background: "#fff", borderRadius: "50%", position: "absolute", top: "2px", left: "2px", transition: "transform 0.3s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" },
  savageTag: { color: "#ff4444", fontSize: "13px", fontWeight: "600", marginTop: "8px" },
  card: { background: "#fff8ee", border: "2px solid #222", borderRadius: "20px", padding: "32px 28px", width: "100%", maxWidth: "480px", boxShadow: "4px 4px 0px #222", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" },
  randomBtn: { background: "linear-gradient(135deg, #ffd700, #ffaa00)", color: "#222", border: "none", borderRadius: "12px", padding: "13px 36px", fontSize: "14px", fontWeight: "700", cursor: "pointer", boxShadow: "0 3px 10px rgba(255,170,0,0.35)", transition: "transform 0.15s" },
  sectionLabel: { textAlign: "center", fontWeight: "700", fontSize: "15px", color: "#333", marginBottom: "8px" },
  portraitSkeleton: { width: "100%", maxWidth: "280px", height: "200px", margin: "0 auto", background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)", backgroundSize: "800px 100%", animation: "shimmer 1.5s infinite", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed #ffaa0055" },
  portraitWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" },
  portraitImg: { width: "100%", maxWidth: "280px", borderRadius: "16px", border: "3px solid #222", display: "block" },
  portraitCaption: { fontSize: "12px", color: "#888", margin: 0, fontStyle: "italic" },
  promptBox: { background: "rgba(255,170,0,0.08)", border: "1.5px dashed #ffaa00", borderRadius: "12px", padding: "16px", textAlign: "center" },
  promptLabel: { fontWeight: "700", color: "#ff8c00", fontSize: "13px", margin: "0 0 8px" },
  promptText: { fontSize: "12px", color: "#555", lineHeight: "1.6", margin: "0 0 8px", fontStyle: "italic" },
  promptHint: { fontSize: "11px", color: "#aaa", margin: 0 },
  retakeBtn: { background: "transparent", color: "#555", border: "1.5px solid #bbb", borderRadius: "10px", padding: "10px 28px", fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" },
};
