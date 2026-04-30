import { Link } from "react-router-dom";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink";

export default function Button({
  as = "button",
  href,
  to,
  variant = "gold",
  className = "",
  children,
  ...props
}) {
  const variants = {
    gold: "bg-gold text-ink hover:brightness-110 active:brightness-95 shadow-glow",
    whatsapp: "bg-gold text-ink hover:brightness-110 active:brightness-95 shadow-glow",
    ghost:
      "border border-beige/20 bg-beige/5 text-beige hover:border-gold/40 hover:bg-beige/10",
  };

  const classes = `${base} ${variants[variant] ?? variants.gold} ${className}`;

  if (as === "a") {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  if (as === "link") {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
