import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail } from "lucide-react";

const FETCH_ROWS = [
  { key: "user", value: "adarsh" },
  { key: "os", value: "Arch Linux, Windows 11" },
  { key: "shell", value: "bash · zsh · fish · powershell" },
  { key: "editor", value: "vscode" },
  { key: "uptime", value: "still going" },
];

const SWATCHES = [
  "var(--accent)",
  "#cba6f7",
  "#89b4fa",
  "#a6e3a1",
  "#f9e2af",
  "#fab387",
  "#f38ba8",
  "var(--muted)",
];

// ANSI Shadow font — patorjk.com/software/taag
const ASCII_LOGO = ` █████╗ ██████╗  █████╗ ██████╗ ███████╗██╗  ██╗
██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔════╝██║  ██║
███████║██║  ██║███████║██████╔╝███████╗███████║
██╔══██║██║  ██║██╔══██║██╔══██╗╚════██║██╔══██║
██║  ██║██████╔╝██║  ██║██║  ██║███████║██║  ██║
╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝`;

const RM_CMD = "sudo rm -rf /";

function FastFetchTerminal() {
  const CMD = "fastfetch";
  const [phase, setPhase] = useState("typing");
  const [cmdDisplayed, setCmdDisplayed] = useState("");
  const [visibleRows, setVisibleRows] = useState(0);
  const [showSwatches, setShowSwatches] = useState(false);
  const [rmDisplayed, setRmDisplayed] = useState("");
  const [glitch, setGlitch] = useState(false);
  const [destroyed, setDestroyed] = useState(false);
  const timers = useRef([]);
  const clearAll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const delay = (fn, ms) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  };

  useEffect(() => {
    clearAll();

    if (phase === "typing") {
      setCmdDisplayed("");
      setVisibleRows(0);
      setShowSwatches(false);
      setRmDisplayed("");
      setGlitch(false);
      setDestroyed(false);
      let i = 0;
      const typeNext = () => {
        i++;
        setCmdDisplayed(CMD.slice(0, i));
        if (i < CMD.length) delay(typeNext, 72);
        else delay(() => setPhase("revealing"), 400);
      };
      delay(typeNext, 72);
    }

    if (phase === "revealing") {
      let row = 0;
      const revealNext = () => {
        row++;
        setVisibleRows(row);
        if (row < FETCH_ROWS.length) delay(revealNext, 110);
        else
          delay(() => {
            setShowSwatches(true);
            delay(() => setPhase("holding"), 200);
          }, 180);
      };
      delay(revealNext, 110);
    }

    if (phase === "holding") {
      delay(() => setPhase("rm_typing"), 2800);
    }

    if (phase === "rm_typing") {
      let i = 0;
      const typeNext = () => {
        i++;
        setRmDisplayed(RM_CMD.slice(0, i));
        if (i < RM_CMD.length) delay(typeNext, 60);
        else delay(() => setPhase("destroying"), 400);
      };
      delay(typeNext, 60);
    }

    if (phase === "destroying") {
      const flashes = [0, 80, 160, 240, 320, 400];
      flashes.forEach((t, i) => delay(() => setGlitch(i % 2 === 0), t));
      delay(() => {
        setGlitch(false);
        setDestroyed(true);
      }, 500);
      delay(() => setPhase("typing"), 1800);
    }

    return clearAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const showFetchOutput =
    ["revealing", "holding", "rm_typing", "destroying"].includes(phase) &&
    !destroyed;
  const showRmPrompt =
    ["rm_typing", "destroying"].includes(phase) && !destroyed;
  const fetchCursor = phase === "typing";
  const rmCursor = phase === "rm_typing";

  if (destroyed) {
    return (
      <div
        style={{
          padding: "18px 22px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          fontFamily:
            "'Fira Code','Cascadia Code','JetBrains Mono','Courier New',monospace",
          minHeight: "260px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color: "#f38ba8", fontSize: "0.72rem", opacity: 0.4 }}>
          terminal closed
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "18px 22px",
        background: glitch ? "#f38ba8" : "var(--surface)",
        border: `1px solid ${glitch ? "#f38ba8" : "var(--border)"}`,
        borderRadius: "12px",
        fontFamily:
          "'Fira Code','Cascadia Code','JetBrains Mono','Courier New',monospace",
        fontSize: "0.78rem",
        lineHeight: 1.9,
        minHeight: "260px",
        overflow: "hidden",
        filter: glitch ? "invert(1)" : "none",
      }}
    >
      {/* macOS dots */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
        {["#f38ba8", "#f9e2af", "#a6e3a1"].map((c, i) => (
          <div
            key={i}
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: c,
              opacity: 0.7,
            }}
          />
        ))}
      </div>

      {/* fastfetch prompt */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          marginBottom: "4px",
        }}
      >
        <span style={{ color: "var(--accent)", opacity: 0.7 }}>~</span>
        <span style={{ color: "var(--muted)", opacity: 0.5 }}>$</span>
        <span style={{ color: "var(--accent)", marginLeft: "4px" }}>
          {cmdDisplayed}
        </span>
        {fetchCursor && (
          <span
            style={{
              display: "inline-block",
              width: "7px",
              height: "1em",
              background: "var(--accent)",
              verticalAlign: "text-bottom",
              borderRadius: "1px",
              marginLeft: "1px",
              animation: "ffBlink 1s step-end infinite",
            }}
          />
        )}
      </div>

      {/* fastfetch output */}
      {showFetchOutput && visibleRows > 0 && (
        <div style={{ marginTop: "6px" }}>
          <div
            style={{
              color: "var(--accent)",
              whiteSpace: "pre",
              fontSize: "0.58rem",
              lineHeight: 1.35,
              opacity: 0.9,
              marginBottom: "10px",
              fontFamily:
                "'Fira Code','Cascadia Code','JetBrains Mono','Courier New',monospace",
            }}
          >
            {ASCII_LOGO}
          </div>
          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: "8px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {FETCH_ROWS.slice(0, visibleRows).map(({ key, value }) => (
              <div
                key={key}
                style={{ display: "flex", alignItems: "baseline" }}
              >
                <span
                  style={{
                    color: "var(--accent)",
                    fontWeight: 600,
                    minWidth: "68px",
                    fontSize: "0.76rem",
                  }}
                >
                  {key}
                </span>
                <span style={{ color: "var(--border)", margin: "0 6px" }}>
                  ~
                </span>
                <span style={{ color: "var(--text)", fontSize: "0.76rem" }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
          {showSwatches && (
            <div
              style={{
                display: "flex",
                gap: "5px",
                marginTop: "12px",
                paddingTop: "8px",
                borderTop: "1px solid var(--border)",
              }}
            >
              {SWATCHES.map((c, i) => (
                <div
                  key={i}
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "3px",
                    background: c,
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* sudo rm -rf / */}
      {showRmPrompt && (
        <div style={{ marginTop: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ color: "#f38ba8", opacity: 0.8 }}>~</span>
            <span style={{ color: "var(--muted)", opacity: 0.5 }}>#</span>
            <span style={{ color: "#f38ba8", marginLeft: "4px" }}>
              {rmDisplayed}
            </span>
            {rmCursor && (
              <span
                style={{
                  display: "inline-block",
                  width: "7px",
                  height: "1em",
                  background: "#f38ba8",
                  verticalAlign: "text-bottom",
                  borderRadius: "1px",
                  marginLeft: "1px",
                  animation: "ffBlink 1s step-end infinite",
                }}
              />
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes ffBlink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}

export default function About() {
  return (
    <section
      id="about"
      style={{
        padding: "100px max(24px, calc((100vw - 900px) / 2))",
        borderTop: "1px solid var(--border)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--accent)",
            fontSize: "0.8rem",
            marginBottom: "8px",
            letterSpacing: "0.05em",
            opacity: 0.6,
          }}
        >
          $ whoami
        </div>
        <h2
          style={{
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 400,
            fontStyle: "italic",
            fontFamily: "var(--font-display)",
            color: "var(--text)",
            marginBottom: "32px",
            letterSpacing: "-0.01em",
          }}
        >
          about me
        </h2>

        <div
          style={{
            display: "flex",
            gap: "40px",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "var(--surface)",
              border: "2px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "3rem",
              flexShrink: 0,
            }}
          >
            🧑‍💻
          </div>
          <div style={{ flex: 1, minWidth: "260px" }}>
            <p
              style={{
                color: "var(--text)",
                fontSize: "0.95rem",
                fontFamily: "var(--font-body)",
                lineHeight: 1.8,
                marginBottom: "24px",
              }}
            >
              I&apos;m Adarsh, an undergraduate student at NIT Rourkela.
              I&apos;m into programming, math, and problem-solving. This site is
              my personal space on the internet. Outside screens I enjoy music,
              anime, and reading manhwa and web novels.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                {
                  href: "https://github.com/adarsh-67r",
                  icon: <Github size={17} />,
                  label: "GitHub",
                },
                {
                  href: "https://www.linkedin.com/in/adarsh67",
                  icon: <Linkedin size={17} />,
                  label: "LinkedIn",
                },
                {
                  href: "mailto:adarshanshuman6@gmail.com",
                  icon: <Mail size={17} />,
                  label: "Email",
                },
              ].map(({ href, icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{
                    width: "38px",
                    height: "38px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "9px",
                    color: "var(--muted)",
                    transition: "all 0.2s",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.color = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.color = "var(--muted)";
                  }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "48px" }}>
          <FastFetchTerminal />
        </div>
      </motion.div>
    </section>
  );
}
