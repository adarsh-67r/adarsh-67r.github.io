import { motion } from "framer-motion";
import TerminalCmd from "./TerminalCmd";

const stack = [
  {
    category: "languages",
    items: ["Python", "C++", "JavaScript", "TypeScript", "Bash"],
  },
  { category: "frontend", items: ["React", "Vite", "Tailwind", "Astro"] },
  { category: "tools", items: ["Linux", "Git", "Docker", "Neovim", "VS Code"] },
  { category: "learning", items: ["Rust"] },
];

export default function TechStack() {
  return (
    <section
      id="stack"
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
        <TerminalCmd cmd="cat stack.json" />
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
          stack
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {stack.map(({ category, items }, ci) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: ci * 0.1 }}
            >
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  marginBottom: "10px",
                }}
              >
                {category}
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {items.map((item) => (
                  <span key={item} className="stack-tag">
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
