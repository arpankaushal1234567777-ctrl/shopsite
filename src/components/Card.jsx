export default function Card({ className = "", children }) {
  return (
    <div
      className={[
        "rounded-2xl border border-beige/10 bg-beige/5 hover:border-gold/25 transition will-change-transform hover:-translate-y-0.5 hover:shadow-glow",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
