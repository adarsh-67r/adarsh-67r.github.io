import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowDown } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Avatar from "./Avatar";

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
      <Helmet>
        <title>Adarsh</title>
        <meta name="description" content="Personal site of Adarsh — student, developer, linux enthusiast." />
        <meta property="og:title" content="Adarsh" />
        <meta property="og:description" content="Personal site of Adarsh — student, developer, linux enthusiast." />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: "28px" }}
      >
        <Avatar size={72} />
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
          hi, i&apos;m
        </p>

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

        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "clamp(0.8rem, 1.8vw, 0.95rem)",
            color: "var(--muted)",
            height: "1.5em",
            overflow: "hidden",
            marginBottom: "28px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span>{displayed}</span>
          <span
            className="blink"
            style={{
              display: "inline-block",
              width: "7px",
              height: "1em",
              background: "var(--accent)",
              marginLeft: "3px",
              verticalAlign: "text-bottom",
              borderRadius: "1px",
              flexShrink: 0,
            }}
          />
        </div>

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
          Undergraduate at NIT Rourkela. Into programming, math, and building things.
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link to="/projects" className="btn btn-primary">projects</Link>
          <Link to="/posts"    className="btn btn-ghost">posts</Link>
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
        }}
      >
        <div className="bounce" style={{ color: "var(--muted)" }}>
          <ArrowDown size={15} weight="regular" aria-hidden="true" />
        </div>
      </motion.div>
    </section>
  );
}
