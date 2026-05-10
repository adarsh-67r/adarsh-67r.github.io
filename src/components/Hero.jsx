import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";

const COMMANDS = [
  { cmd: "whoami", output: "adarsh — student. linux enthusiast. developer." },
  { cmd: "cat interests.txt", output: "open source / linux / building things" },
  { cmd: "echo $STATUS", output: "currently: learning & shipping code" },
];

function useTypewriter(text, speed = 48) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const t = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(t); setDone(true); }
    }, speed);
    return () => clearInterval(t);
  }, [text, speed]);
  return { displayed, done };
}

export default function Hero() {
  const [cmdIdx, setCmdIdx] = useState(0);
  const [phase, setPhase] = useState("typing-cmd"); // typing-cmd | showing-output | erasing | waiting
  const [shownCmd, setShownCmd] = useState("");
  const [showOutput, setShowOutput] = useState(false);

  useEffect(() => {
    const { cmd, output } = COMMANDS[cmdIdx];
    let timeout;

    if (phase === "typing-cmd") {
      setShownCmd("");
      setShowOutput(false);
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setShownCmd(cmd.slice(0, i));
        if (i >= cmd.length) {
          clearInterval(interval);
          timeout = setTimeout(() => setPhase("showing-output"), 300);
        }
      }, 52);
      return () => { clearInterval(interval); clearTimeout(timeout); };
    }

    if (phase === "showing-output") {
      setShowOutput(true);
      timeout = setTimeout(() => setPhase("erasing"), 2200);
      return () => clearTimeout(timeout);
    }

    if (phase === "erasing") {
      setShowOutput(false);
      let i = shownCmd.length;
      const interval = setInterval(() => {
        i--;
        setShownCmd(cmd.slice(0, i));
        if (i <= 0) {
          clearInterval(interval);
          timeout = setTimeout(() => {
            setCmdIdx(c => (c + 1) % COMMANDS.length);
            setPhase("typing-cmd");
          }, 350);
        }
      }, 28);
      return () => { clearInterval(interval); clearTimeout(timeout); };
    }
  }, [phase, cmdIdx]);

  const { output } = COMMANDS[cmdIdx];

  return (
    <section
      id="home"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 max(24px, calc((100vw - 900px) / 2))",
        paddingTop: "80px",
        position: "relative",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: "28px" }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "var(--surface)",
            border: "2px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
          }}
        >
          🧑‍💻
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <p style={{ fontFamily: "var(--font-mono)", color: "var(--accent)", fontSize: "0.8rem", marginBottom: "10px", letterSpacing: "0.06em" }}>
          hi, i'm
        </p>

        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem, 10vw, 6.5rem)", fontWeight: 400, fontStyle: "italic", color: "var(--text)", lineHeight: 1.0, letterSpacing: "-0.01em", marginBottom: "20px" }}>
          Adarsh
        </h1>

        {/* Terminal block — fixed height so no layout shift */}
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(0.75rem, 1.6vw, 0.88rem)",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          padding: "12px 16px",
          marginBottom: "28px",
          maxWidth: "440px",
          /* Fixed height: prompt line + output line + padding */
          height: "72px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "5px",
          overflow: "hidden",
        }}>
          {/* Command line */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "var(--accent)", opacity: 0.55, userSelect: "none" }}>$</span>
            <span style={{ color: "var(--text)" }}>{shownCmd}</span>
            {!showOutput && (
              <span style={{ display: "inline-block", width: "7px", height: "1em", background: "var(--accent)", verticalAlign: "text-bottom", animation: "blink 1s step-end infinite", borderRadius: "1px" }} />
            )}
          </div>
          {/* Output line — same height slot always reserved */}
          <div style={{ height: "1.4em", overflow: "hidden" }}>
            {showOutput && (
              <span style={{ color: "var(--muted)", fontSize: "0.9em" }}>{output}</span>
            )}
          </div>
        </div>

        <p style={{ maxWidth: "480px", color: "var(--muted)", fontSize: "0.95rem", fontFamily: "var(--font-body)", lineHeight: 1.8, marginBottom: "36px" }}>
          Hello World!
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link to="/projects" style={{ padding: "9px 22px", background: "var(--accent)", color: "var(--bg)", borderRadius: "8px", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600, fontFamily: "var(--font-mono)", transition: "opacity 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.82"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            projects
          </Link>
          <Link to="/blog" style={{ padding: "9px 22px", background: "transparent", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "8px", textDecoration: "none", fontSize: "0.85rem", fontFamily: "var(--font-mono)", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text)"; }}>
            blog
          </Link>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
        style={{ position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", color: "var(--muted)", animation: "bounce 2s ease-in-out infinite" }}>
        <ArrowDown size={15} />
      </motion.div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(7px)} }
      `}</style>
    </section>
  );
}
