import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";

const ROLES = ["student. linux enthusiast.", "open source.", "developer."];

export default function Hero() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const role = ROLES[roleIndex];
    let timeout;
    if (typing) {
      if (displayed.length < role.length) {
        timeout = setTimeout(
          () => setDisplayed(role.slice(0, displayed.length + 1)),
          60,
        );
      } else {
        timeout = setTimeout(() => setTyping(false), 1800);
      }
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 30);
      } else {
        setRoleIndex((i) => (i + 1) % ROLES.length);
        setTyping(true);
      }
    }
    return () => clearTimeout(timeout);
  }, [displayed, typing, roleIndex]);

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
        <p
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--accent)",
            fontSize: "0.8rem",
            marginBottom: "10px",
            letterSpacing: "0.06em",
          }}
        >
          hi, i'm
        </p>

        {/* Display name uses Instrument Serif for elegance */}
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(3rem, 10vw, 6.5rem)",
            fontWeight: 400,
            fontStyle: "italic",
            color: "var(--text)",
            lineHeight: 1.0,
            letterSpacing: "-0.01em",
            marginBottom: "18px",
          }}
        >
          Adarsh
        </h1>

        {/* Typewriter role — mono */}
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "clamp(0.8rem, 1.8vw, 0.95rem)",
            color: "var(--muted)",
            height: "1.5em",
            marginBottom: "28px",
          }}
        >
          <span>{displayed}</span>
          <span
            style={{
              display: "inline-block",
              width: "2px",
              height: "1em",
              background: "var(--accent)",
              marginLeft: "2px",
              verticalAlign: "text-bottom",
              animation: "blink 1s step-end infinite",
            }}
          />
        </div>

        {/* Bio — body font */}
        <p
          style={{
            maxWidth: "480px",
            color: "var(--muted)",
            fontSize: "0.95rem",
            fontFamily: "var(--font-body)",
            lineHeight: 1.8,
            marginBottom: "36px",
          }}
        >
          Student at NIT Rourkela. I write notes, build things, and think out
          loud on this site.
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link
            to="/projects"
            style={{
              padding: "9px 22px",
              background: "var(--accent)",
              color: "var(--bg)",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 600,
              fontFamily: "var(--font-mono)",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.82")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            projects
          </Link>
          <Link
            to="/blog"
            style={{
              padding: "9px 22px",
              background: "transparent",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontFamily: "var(--font-mono)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.color = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text)";
            }}
          >
            blog
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        style={{
          position: "absolute",
          bottom: "40px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          color: "var(--muted)",
          animation: "bounce 2s ease-in-out infinite",
        }}
      >
        <ArrowDown size={15} />
      </motion.div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(7px)} }
      `}</style>
    </section>
  );
}
