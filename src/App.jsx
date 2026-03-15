import { useState, useRef } from "react";
import CameraView from "./camera";
import RoastResult from "./roastresult";
import RoastCard from "./RoastCard";
import "./App.css";

const FALLBACK_ROASTS = [
  "You look like you Google 'how to be interesting' every morning.",
  "Your face called. It wants its expression back.",
  "You have the energy of someone who replies 'k' to paragraphs.",
  "You look like the NPC that gives side quests no one does.",
  "Your vibe is aggressively mid and somehow proud of it.",
  "Even your Wi-Fi signal has more personality than you.",
  "You have the aura of someone who's always slightly lost.",
  "Your look says 'I peaked at a school project presentation'.",
  "You give off 'terms and conditions not fully read' energy.",
  "The background is doing more work than you are.",
  "You look like you've never been the main character, not even in your own story.",
  "Your face has the same energy as a loading screen that never finishes.",
  "You give off strong 'I put inspirational quotes in my email signature' energy.",
  "You look like you've rehearsed being spontaneous.",
  "Your whole vibe is a group project where you said you'd handle the slides.",
  "You have the charisma of a default profile picture.",
  "You look like you've been buffering since 2019.",
  "You give off 'replied to a 6-month-old email as if nothing happened' energy.",
  "Your expression says 'I laughed at my own joke before finishing it'.",
  "You look like your Spotify Wrapped is just elevator music.",
  "You have the aura of someone who's been on hold for 45 minutes and is okay with it.",
  "You give off 'I have a podcast that nobody asked for' energy.",
  "Your look screams 'I peaked in a group chat'.",
  "You look like you've never sent a voice note under 4 minutes.",
  "You have the face of someone who's still waiting for their villain arc.",
  "You look like you've attended every meeting that could've been an email.",
  "Your energy says 'I ironically use Comic Sans and I'm not joking'.",
  "You have the face of someone who narrates their own life in third person.",
  "You look like you've sent a 'per my last email' at least once this week.",
  "Your vibe is aggressively 'assistant manager at a store nobody visits'.",
  "You look like you've got 47 unread notifications and zero urgency about it.",
  "You give off 'I screenshot conversations for future reference' energy.",
  "Your face says 'I know a guy' but the guy is also you.",
  "You look like you've workshopped your own catchphrase for three years.",
  "You have the energy of someone who brings up their Myers-Briggs type unprompted.",
  "You look like your personality is a vision board that never manifested.",
  "You give off 'I was just about to do that' energy, always.",
  "Your face screams 'I have opinions about coffee that nobody solicited'.",
  "You look like you've explained something nobody asked about with a PowerPoint.",
  "You have the aura of someone who's read the wiki page and considers themselves an expert.",
  "You look like you peaked during a trivia night and never recovered.",
  "Your whole presence says 'I'm built different' but the factory was very standard.",
  "You give off 'I turned down a great opportunity for a reason I can't explain' energy.",
  "You look like the tutorial level of a video game — helpful once, then skippable.",
  "You have the face of someone who still thinks they'll use their gym membership.",
  "You look like you've been the 'chill one' in a group that needed more excitement.",
  "Your energy is giving 'I manage a subreddit about something nobody cares about'.",
  "You look like you've typed 'lol' without actually laughing since 2017.",
  "You have the face of someone who's been voluntold into every team activity.",
  "You give off 'I have a lot of potential' energy — emphasis on have, not using.",
];

const pickRandom = (arr, avoid = null) => {
  const pool = avoid && arr.length > 1 ? arr.filter((x) => x !== avoid) : arr;
  return pool[Math.floor(Math.random() * pool.length)];
};

export default function App() {
  const [savage, setSavage] = useState(true);
  const [phase, setPhase] = useState("camera");
  const [capturedImage, setCapturedImage] = useState(null);
  const [allRoasts, setAllRoasts] = useState([]);
  const [activeRoast, setActiveRoast] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRandom, setIsRandom] = useState(false);
  const [aiPortrait, setAiPortrait] = useState(null);
  const [portraitLoading, setPortraitLoading] = useState(false);
  const [portraitPrompt, setPortraitPrompt] = useState("");
  const [navOpen, setNavOpen] = useState(false);

  const cameraRef = useRef(null);

  const handleReroll = () => {
    if (allRoasts.length < 2) return;
    setActiveRoast(pickRandom(allRoasts, activeRoast));
  };

  const processImage = async (base64, dataUrl) => {
    setCapturedImage(dataUrl);
    setPhase("result");
    setLoading(true);
    setAllRoasts([]);
    setActiveRoast("");
    setIsRandom(false);
    setAiPortrait(null);
    setPortraitPrompt("");

    let lines = [];

    try {
      const response = await fetch("http://localhost:5000/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mode: savage ? "savage" : "friendly" }),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      lines = data?.data?.roasts ?? [];
      if (lines.length === 0) lines = ["AI took one look and became speechless. That's the roast."];
    } catch (err) {
      console.error("Roast error:", err);
      lines = [...FALLBACK_ROASTS].sort(() => Math.random() - 0.5);
    } finally {
      setLoading(false);
    }

    setAllRoasts(lines);
    setActiveRoast(pickRandom(lines));

    setPortraitLoading(true);
    try {
      const portraitRes = await fetch("http://localhost:5000/api/portrait", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, roast: lines[0], mode: savage ? "savage" : "friendly" }),
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

  const handleCapture = (base64, dataUrl) => processImage(base64, dataUrl);

  const handleRandom = () => {
    const frame = cameraRef.current?.captureFrame?.();
    if (frame) {
      processImage(frame.base64, frame.dataUrl);
    } else {
      const lines = [...FALLBACK_ROASTS].sort(() => Math.random() - 0.5);
      setCapturedImage(null);
      setIsRandom(true);
      setPhase("result");
      setLoading(false);
      setAiPortrait(null);
      setPortraitLoading(false);
      setPortraitPrompt("");
      setAllRoasts(lines);
      setActiveRoast(pickRandom(lines));
    }
  };

  const handleRetry = () => {
    setCapturedImage(null);
    setAllRoasts([]);
    setActiveRoast("");
    setIsRandom(false);
    setAiPortrait(null);
    setPortraitLoading(false);
    setPortraitPrompt("");
    setPhase("camera");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-root">

      {/* ── NAVBAR ───────────────────────────────────── */}
      <nav className="navbar">
        <div className="nav-inner">
          <a href="#" className="nav-logo">
            <span className="logo-text">RoastAI</span>
            <span className="logo-flame">🔥</span>
          </a>

          <button
            className={`nav-hamburger ${navOpen ? "open" : ""}`}
            onClick={() => setNavOpen(!navOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>

          <ul className={`nav-links ${navOpen ? "open" : ""}`}>
            <li><a href="#how-it-works" onClick={() => setNavOpen(false)}>How it works</a></li>
            <li><a href="#camera-section" onClick={() => setNavOpen(false)}>Try it</a></li>
            <li>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="nav-github-btn"
                onClick={() => setNavOpen(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-bg-glow" />
        <div className="hero-content">
        <h1 className="hero-title">
            Get <em>Roasted</em><br />by AI
            <span className="title-flame">🔥</span>
          </h1>
          <p className="hero-sub">
            Point your camera, strike a pose, and let AI drag you<br className="br-desktop" />
            like it's open mic night.
          </p>

          {/* ── MODE TOGGLE ── */}
          <div className="mode-toggle-wrap">
            <button
              className={`mode-btn ${!savage ? "active-friendly" : ""}`}
              onClick={() => setSavage(false)}
            >
              <span className="mode-icon">😇</span>
              <span>Friendly</span>
            </button>
            <div
              className={`toggle-pill ${savage ? "savage" : "friendly"}`}
              onClick={() => setSavage((s) => !s)}
              role="switch"
              aria-checked={savage}
              tabIndex={0}
              onKeyDown={(e) => e.key === " " && setSavage((s) => !s)}
            >
              <div className="toggle-thumb" />
            </div>
            <button
              className={`mode-btn ${savage ? "active-savage" : ""}`}
              onClick={() => setSavage(true)}
            >
              <span className="mode-icon">😈</span>
              <span>Savage</span>
            </button>
          </div>
          {savage && (
            <p className="savage-warning">
              ⚠️ All caps energy. No survivors. No mercy.
            </p>
          )}
        </div>
      </section>

      {/* ── CAMERA / RESULT SECTION ───────────────────── */}
      <section id="camera-section" className="main-section">
        <div className={`main-card ${savage ? "savage-card" : "friendly-card"}`}>

          {/* card header stripe */}
          <div className={`card-stripe ${savage ? "stripe-red" : "stripe-gold"}`} />

          {phase === "camera" ? (
            <div className="camera-phase">
              <CameraView ref={cameraRef} onCapture={handleCapture} savage={savage} />
              <button
                onClick={handleRandom}
                className="btn-random"
              >
                🎲 Random Roast
              </button>
            </div>
          ) : (
            <div className="result-phase">
              <RoastResult
                imageDataUrl={capturedImage}
                roast={activeRoast}
                loading={loading}
                onRetry={handleRetry}
                savage={savage}
              />

              {!loading && allRoasts.length > 1 && (
                <div className="reroll-wrap">
                  <button className="btn-reroll" onClick={handleReroll}>
                    🎲 Different Roast
                  </button>
                  <p className="reroll-hint">{allRoasts.length} roasts generated — keep rolling!</p>
                </div>
              )}

              {!isRandom && (loading || portraitLoading || aiPortrait || portraitPrompt) && (
                <div className="portrait-section">
                  <p className="section-label">🤖 Your AI Portrait</p>
                  {portraitLoading || loading ? (
                    <div className="portrait-skeleton">
                      <span className="skeleton-icon">🎨</span>
                      <p>AI is painting your portrait...</p>
                    </div>
                  ) : aiPortrait ? (
                    <div className="portrait-wrap">
                      <img
                        src={aiPortrait}
                        alt="AI-generated portrait"
                        className={`portrait-img ${savage ? "portrait-red" : "portrait-gold"}`}
                      />
                      <p className="portrait-caption">✨ AI's interpretation of you</p>
                    </div>
                  ) : portraitPrompt ? (
                    <div className="prompt-box">
                      <p className="prompt-label">🎨 AI Portrait Prompt Ready</p>
                      <p className="prompt-text">{portraitPrompt}</p>
                      <p className="prompt-hint">Wire up fal.ai or Replicate in the backend to auto-generate the image!</p>
                    </div>
                  ) : null}
                </div>
              )}

              {!loading && activeRoast && (
                <div className="roast-card-section">
                  <p className="section-label">🎨 Your Roast Card</p>
                  <RoastCard
                    imageDataUrl={aiPortrait || capturedImage}
                    roast={activeRoast}
                    savage={savage}
                    isRandom={isRandom}
                    isAiPortrait={!!aiPortrait}
                  />
                </div>
              )}

              {!loading && (
                <button onClick={handleRetry} className="btn-retake">
                  🔄 Retake Photo
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section id="how-it-works" className="how-section">
        <div className="how-inner">
          <div className="section-tag">The Process</div>
          <h2 className="how-title">How it works</h2>
          <p className="how-sub">Three steps to existential crisis</p>

          <div className="steps-grid">
            {[
              { num: "01", icon: "📸", title: "Take a Selfie", desc: "Point your camera at your beautiful face and snap the moment." },
              { num: "02", icon: "🧠", title: "AI Analyzes", desc: "Claude AI studies every pixel, every angle, every questionable life choice visible on your face." },
              { num: "03", icon: "🔥", title: "Get Roasted", desc: "Receive a devastating (or friendly) roast crafted just for you. No survivors." },
            ].map((step, i) => (
              <div key={i} className="step-card" style={{ animationDelay: `${i * 0.12}s` }}>
                <div className="step-num">{step.num}</div>
                <div className="step-icon">{step.icon}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer className="footer">
        <div className="footer-inner">
          <span className="footer-logo">RoastAI 🔥</span>
          <span className="footer-divider">·</span>
          <span className="footer-text">Made with AI & questionable humor</span>
          <span className="footer-divider">·</span>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="footer-link">
            GitHub ↗
          </a>
        </div>
        <p className="footer-copy">© 2025 RoastAI. No feelings were considered in the making of this app.</p>
          <p className="footer-credit">
            Built by <span className="footer-credit-name">k.Harshith</span> ·{" "}
            <a href="mailto:k.harshith2507@gmail.com" className="footer-credit-email">
              k.harshith2507@gmail.com
            </a>
          </p>
      </footer>

    </div>
  );
}
