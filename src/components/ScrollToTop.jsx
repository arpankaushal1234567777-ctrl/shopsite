import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Hash navigation with a fixed/sticky header: apply an offset.
    const id = location.hash.replace("#", "");
    const el = document.getElementById(id);
    if (!el) return;
    const headerOffset = 96; // matches the fixed navbar + spacing
    const y = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }, [location.pathname, location.hash]);

  return null;
}
