import { Link } from "react-router-dom";
import Button from "./Button.jsx";

export default function Footer() {
  return (
    <footer className="border-t border-beige/10 bg-ink">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 xs:py-10 sm:py-12">
        <div className="grid gap-6 xs:gap-8 sm:gap-10 md:grid-cols-3">
          <div>
            <p className="font-display text-lg xs:text-xl sm:text-2xl">Blush and Beauty</p>
            <p className="mt-2 xs:mt-3 text-xs xs:text-sm text-beige/70 leading-relaxed max-w-sm">
              Luxury care for your beauty and confidence. Premium services,
              clean ambience, and a minimal, elegant experience.
            </p>
            <div className="mt-4 xs:mt-6">
              <Button as="link" to="/book" className="text-xs xs:text-sm">
                Book Appointment
              </Button>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold/80">
              Contact
            </p>
            <div className="mt-3 xs:mt-4 grid gap-2 xs:gap-3 text-xs xs:text-sm text-beige/70">
              <p>
                Phone:{" "}
                <a className="hover:text-beige" href="tel:+917505519340">
                  +91 7505519340
                </a>
              </p>
              <p>
                Phone:{" "}
                <a className="hover:text-beige" href="tel:+918439015769">
                  +91 8439015769
                </a>
              </p>
              <p className="leading-relaxed">
                Shop No. 4, Upper Ground Floor, Dayal Plaza, Near Dayal
                Apartment, 100ft Road, Dayal Bagh, Agra
              </p>
              <div className="pt-1 xs:pt-2">
                <Button
                  as="a"
                  href="https://www.google.com/maps?q=27.22980609100443,78.00375982841598"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="ghost"
                  className="px-3 xs:px-4 py-1.5 xs:py-2 text-xs xs:text-sm"
                >
                  Open Location
                </Button>
              </div>
              <p className="text-xs">Timing: 10:00 AM – 8:00 PM (All Days)</p>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold/80">
              Social
            </p>
            <div className="mt-3 xs:mt-4 flex flex-wrap gap-2 xs:gap-3">
              <a
                className="px-3 xs:px-4 py-1.5 xs:py-2 text-xs rounded-full border border-beige/15 bg-beige/5 text-beige/80 hover:text-beige hover:border-gold/25 transition"
                href="https://www.instagram.com/blushandbeautyagra/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
              <a
                className="px-3 xs:px-4 py-1.5 xs:py-2 text-xs rounded-full border border-beige/15 bg-beige/5 text-beige/80 hover:text-beige hover:border-gold/25 transition"
                href="#"
              >
                Facebook
              </a>
              <a
                className="px-3 xs:px-4 py-1.5 xs:py-2 text-xs rounded-full border border-beige/15 bg-beige/5 text-beige/80 hover:text-beige hover:border-gold/25 transition"
                href="#"
              >
                WhatsApp
              </a>
            </div>
            <p className="mt-4 xs:mt-6 text-xs text-beige/50">
              © {new Date().getFullYear()} Blush and Beauty. All rights reserved.
            </p>
            <p className="mt-1 xs:mt-2 text-xs text-beige/50">
              <Link className="hover:text-beige" to="/contact">
                Contact
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
