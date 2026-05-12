import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Envelope, GithubLogo, LinkedinLogo } from "@phosphor-icons/react";
import Avatar from "./Avatar";

const FETCH_ROWS = [
  { key: "user",   value: "adarsh" },
  { key: "os",     value: "Arch Linux, Windows 11" },
  { key: "shell",  value: "bash · zsh · fish · powershell" },
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

const ASCII_LOGO = ` █████╗ ██████╗  █████╗ ██████╗ ███████╗██╗  ██╗
██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔════╝██║  ██║
███████║██║  ██║███████║██████╔╝███████╗███████║
██╔══██║██║  ██║██╔══██║██╔══██╗╚════██║██╔══██║
██║  ██║██████╔╝██║  ██║██║  ██║███████║██║  ██║
╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝`;

const RM_CMD = "sudo rm -rf /";
const TERMINAL_HEIGHT = 344;

function InlineCommand({ cmd = "whoami", speed = 120, pause = 1400 }) {
  const [displayed, setDisplayed] = useState("");
  const [erasing, setErasing] = useState(false);

  useEffect(() => {
    let timeout;
    if (!erasing) {
      if (displayed.length < cmd.length) {
        timeout = setTimeout(() => setDisplayed(cmd.slice(0, displayed.length + 1)), speed);
      } else {
        timeout = setTimeout(() => setErasing(true), pause);
      }
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40);
      } else {
        setErasing(false);
      }
    }
    return () => clearTimeout(timeout);
  }, [cmd, displayed, erasing, speed, pause]);

  return (
    <p style={{
      fontFamily: "var(--font-mono)",
      color: "var(--accent)",
      fontSize: "0.8rem",
      marginBottom: "8px",
      letterSpacing: "0.05em",
      display: "flex",
      alignItems: "center",
      gap: "4px",
      userSelect: "none",
    }}>
      <span style={{ opacity: 0.5 }}>$</span>
      <span> {displayed}</span>
      <span
        className="blink"
        style={{
          display: "inline-block",
          width: "7px",
          height: "1em",
          background: "var(--accent)",
          verticalAlign: "text-bottom",
          borderRadius: "1px",
        }}
      />
    </p>
  );
}

function FastFetchTerminal() {
  const CMD = "fastfetch";
  const [phase, setPhase] = useState("typing");
  const [cmdDisplayed, setCmdDisplayed] = useState("");
  const [visibleRows, setVisibleRows] = useState(0);
  const [showSwatches, setShowSwatches] = useState(false);
  const [rmDisplayed, setRmDisplayed] = useState("");
  const [glitch, setGlitch] = useState(false);
  const [destroyed, setDestroyed] = useState(false);
  const [termOpacity, setTermOpacity] = useState(1);
  const timers = useRef([]);

  const clearAll = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const delay = (fn, ms) => { const t = setTimeout(fn, ms); timers.current.push(t); };

  useEffect(() => {
    clearAll();

    if (phase === "typing") {
      setCmdDisplayed("");
      setVisibleRows(0);
      setShowSwatches(false);
      setRmDisplayed("");
      setGlitch(false);
      setDestroyed(false);
      setTermOpacity(1);
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
        else delay(() => { setShowSwatches(true); delay(() => setPhase("holding"), 200); }, 180);
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
      flashes.forEach((t, idx) => delay(() => setGlitch(idx % 2 === 0), t));
      delay(() => setTermOpacity(0), 80);
      delay(() => { setGlitch(false); setDestroyed(true); }, 520);
      delay(() => setPhase("typing"), 2000);
    }

    return clearAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const showFetchOutput = ["revealing", "holding", "rm_typing", "destroying"].includes(phase) && !destroyed;
  const showRmPrompt   = ["rm_typing", "destroying"].includes(phase) && !destroyed;
  const fetchCursor    = phase === "typing";
  const rmCursor       = phase === "rm_typing";

  return (
    <div style={{
      height: `${TERMINAL_HEIGHT}px`,
      overflow: "hidden",
      borderRadius: "12px",
      border: `1px solid ${glitch ? "#f38ba8" : "var(--border)"}`,
      transition: "border-color 0.1s",
      position: "relative",
    }}>
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--surface)",
        opacity: destroyed ? 1 : 0,
        transition: "opacity 0.35s",
        pointerEvents: "none",
        zIndex: 2,
      }}>
        <span style={{ color: "#f38ba8", fontSize: "0.72rem", opacity: 0.4, fontFamily: "'Fira Code',monospace" }}>terminal closed</span>
      </div>

      <div style={{
        padding: "18px 22px",
        background: glitch ? "#f38ba8" : "var(--surface)",
        height: "100%",
        fontFamily: "'Fira Code','Cascadia Code','JetBrains Mono','Courier New',monospace",
        fontSize: "0.78rem",
        lineHeight: 1.9,
        overflow: "hidden",
        filter: glitch ? "invert(1)" : "none",
        opacity: termOpacity,
        transition: "background 0.1s, filter 0.1s, opacity 0.18s",
        display: "flex",
        flexDirection: "column",
      }}>
        <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexShrink: 0 }}>
          {["#f38ba8", "#f9e2af", "#a6e3a1"].map((c, i) => (
            <div key={i} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c, opacity: 0.7 }} />
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px", flexShrink: 0 }}>
          <span style={{ color: "var(--accent)", opacity: 0.7 }}>~</span>
          <span style={{ color: "var(--muted)", opacity: 0.5 }}>$</span>
          <span style={{ color: "var(--accent)", marginLeft: "4px" }}>
            {cmdDisplayed}
          </span>
          {fetchCursor && (
            <span className="blink" style={{ display: "inline-block", width: "7px", height: "1em", background: "var(--accent)", verticalAlign: "text-bottom", borderRadius: "1px", marginLeft: "1px" }} />
          )}
        </div>

        <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
          <div style={{ opacity: showFetchOutput && visibleRows > 0 ? 1 : 0, transition: "opacity 0.2s" }}>
            <div style={{ color: "var(--accent)", whiteSpace: "pre", fontSize: "0.58rem", lineHeight: 1.35, opacity: 0.9, marginBottom: "10px", fontFamily: "'Fira Code','Cascadia Code','JetBrains Mono','Courier New',monospace" }}>
              {ASCII_LOGO}
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "8px", display: "flex", flexDirection: "column" }}>
              {FETCH_ROWS.map(({ key, value }, idx) => (
                <div key={key} style={{ display: "flex", alignItems: "baseline", opacity: idx < visibleRows ? 1 : 0, transition: "opacity 0.15s" }}>
                  <span style={{ color: "var(--accent)", fontWeight: 600, minWidth: "68px", fontSize: "0.76rem" }}>{key}</span>
                  <span style={{ color: "var(--border)", margin: "0 6px" }}>~</span>
                  <span style={{ color: "var(--text)", fontSize: "0.76rem" }}>{value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "5px", marginTop: "12px", paddingTop: "8px", borderTop: "1px solid var(--border)", opacity: showSwatches ? 1 : 0, transition: "opacity 0.2s" }}>
              {SWATCHES.map((c, i) => (
                <div key={i} style={{ width: "14px", height: "14px", borderRadius: "3px", background: c, flexShrink: 0 }} />
              ))}
            </div>
          </div>
        </div>

        <div style={{
          height: "28px",
          flexShrink: 0,
          marginTop: "6px",
          opacity: showRmPrompt ? 1 : 0,
          transition: "opacity 0.15s",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}>
          <span style={{ color: "#f38ba8", opacity: 0.7 }}>~</span>
          <span style={{ color: "var(--muted)", opacity: 0.5 }}>$</span>
          <span style={{ color: "#f38ba8", marginLeft: "4px" }}>{rmDisplayed}</span>
          {rmCursor && (
            <span className="blink" style={{ display: "inline-block", width: "7px", height: "1em", background: "#f38ba8", verticalAlign: "text-bottom", borderRadius: "1px", marginLeft: "1px" }} />
          )}
        </div>
      </div>
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
        <InlineCommand cmd="whoami" speed={120} />
        <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 400, fontStyle: "italic", fontFamily: "var(--font-display)", color: "var(--text)", marginBottom: "32px", letterSpacing: "-0.01em" }}>
          about me
        </h2>

        <div style={{ display: "flex", gap: "40px", alignItems: "flex-start", flexWrap: "wrap" }}>
          <Avatar size={120} />
          <div style={{ flex: 1, minWidth: "260px" }}>
            <p style={{ color: "var(--text)", fontSize: "0.95rem", fontFamily: "var(--font-body)", lineHeight: 1.8, marginBottom: "24px" }}>
              I&apos;m Adarsh, an undergraduate student at NIT Rourkela.
              I&apos;m into programming, math, and problem-solving. This site is
              my personal space on the internet. Outside screens I enjoy music,
              anime, and reading manhwa and web novels.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                { href: "https://github.com/adarsh-67r",        icon: <GithubLogo size={17} weight="regular" />,   label: "GitHub" },
                { href: "https://www.linkedin.com/in/adarsh67", icon: <LinkedinLogo size={17} weight="regular" />, label: "LinkedIn" },
                { href: "mailto:adarshanshuman6@gmail.com",      icon: <Envelope size={17} weight="regular" />,         label: "Email" },
              ].map(({ href, icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="icon-btn"
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
