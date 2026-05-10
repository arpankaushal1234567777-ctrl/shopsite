import { Link } from "react-router-dom";
import Button from "./Button.jsx";

export default function Footer() {
  return (
    <footer className="border-t border-beige/10 bg-ink">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-display text-2xl">Blush and Beauty</p>
            <p className="mt-3 text-beige/70 leading-relaxed max-w-sm">
              Luxury care for your beauty and confidence. Premium services,
              clean ambience, and a minimal, elegant experience.
            </p>
            <div className="mt-6">
              <Button as="link" to="/book">
                Book Appointment
              </Button>
            </div>
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-gold/80">
              Contact
            </p>
            <div className="mt-4 grid gap-2 text-beige/70">
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
              <div className="pt-2">
                <Button
                  as="a"
                  href="https://www.google.com/maps?q=27.22980609100443,78.00375982841598"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="ghost"
                  className="px-4 py-2"
                >
                  Open Location
                </Button>
              </div>
              <p>Timing: 10:00 AM – 8:00 PM (All Days)</p>
            </div>
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-gold/80">
              Social
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                className="px-4 py-2 rounded-full border border-beige/15 bg-beige/5 text-beige/80 hover:text-beige hover:border-gold/25 transition"
                  href="https://www.instagram.com/blushandbeautyagra/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              <a
                className="px-4 py-2 rounded-full border border-beige/15 bg-beige/5 text-beige/80 hover:text-beige hover:border-gold/25 transition"
                href="#"
              >
                Facebook
              </a>
              <a
                className="px-4 py-2 rounded-full border border-beige/15 bg-beige/5 text-beige/80 hover:text-beige hover:border-gold/25 transition"
                href="#"
              >
                WhatsApp
              </a>
            </div>
            <p className="mt-6 text-xs text-beige/50">
              © {new Date().getFullYear()} Blush and Beauty. All rights reserved.
            </p>
            <p className="mt-2 text-xs text-beige/50">
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
