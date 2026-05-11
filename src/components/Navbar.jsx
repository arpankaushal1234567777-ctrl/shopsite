import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import Button from "./Button.jsx";
import { navLinks } from "../data/content.js";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setOpen(false), [location.pathname]);

  const homeAnchors = useMemo(
    () => [
      { label: "Services", hash: "#services" },
      { label: "Pricing", hash: "#pricing" },
      { label: "Gallery", hash: "#gallery" },
      { label: "Testimonials", hash: "#testimonials" },
    ],
    []
  );

  function goHomeAnchor(hash) {
    // Always route to home before applying the hash.
    // The browser will then handle the anchor scroll smoothly.
    navigate(`/${hash}`);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mt-4 glass rounded-2xl">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.png" className="h-9 w-9 rounded-xl object-contain" alt="Logo" />
              <div className="leading-tight">
                <p className="font-display text-beige text-base">
                  Blush and Beauty
                </p>
                <p className="text-xs text-beige/60">Luxury Salon</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "px-3 py-2 rounded-full text-sm transition",
                      isActive
                        ? "text-gold bg-gold/10"
                        : "text-beige/80 hover:text-beige hover:bg-beige/5"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="mx-2 h-6 w-px bg-beige/10" />

              {location.pathname === "/" ? (
                homeAnchors.map((a) => (
                  <button
                    key={a.hash}
                    className="px-3 py-2 rounded-full text-sm text-beige/70 hover:text-beige hover:bg-beige/5 transition"
                    onClick={() => goHomeAnchor(a.hash)}
                    type="button"
                  >
                    {a.label}
                  </button>
                ))
              ) : (
                <Link
                  to="/#services"
                  className="px-3 py-2 rounded-full text-sm text-beige/70 hover:text-beige hover:bg-beige/5 transition"
                >
                  Explore
                </Link>
              )}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Button as="link" to="/book" className="px-4 py-2">
                Book Now
              </Button>
            </div>

            <button
              className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-beige/15 bg-beige/5 hover:bg-beige/10 transition"
              type="button"
              aria-label="Open menu"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="text-beige/90 text-xl leading-none">
                {open ? "×" : "☰"}
              </span>
            </button>
          </div>

          {open ? (
            <div className="md:hidden px-4 pb-4 sm:px-6">
              <div className="grid gap-2">
                {navLinks.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "px-4 py-3 rounded-xl text-sm transition border",
                        isActive
                          ? "text-gold bg-gold/10 border-gold/25"
                          : "text-beige/80 bg-beige/5 border-beige/10 hover:border-gold/25 hover:text-beige"
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                <Button as="link" to="/book" className="w-full">
                  Book Now
                </Button>
                <div className="pt-2 grid grid-cols-2 gap-2">
                  {homeAnchors.map((a) => (
                    <button
                      key={a.hash}
                      className="px-4 py-3 rounded-xl text-sm text-beige/80 bg-beige/5 border border-beige/10 hover:border-gold/25 hover:text-beige transition"
                      onClick={() => goHomeAnchor(a.hash)}
                      type="button"
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

