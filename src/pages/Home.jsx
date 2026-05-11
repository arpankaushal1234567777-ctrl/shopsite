import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button.jsx";
import Reveal from "../components/Reveal.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import ServiceCard from "../components/ServiceCard.jsx";
import PricingCard from "../components/PricingCard.jsx";
import TestimonialCard from "../components/TestimonialCard.jsx";
import { supabase } from "../lib/supabase.js";
import { galleryImages, pricing, services as fallbackServices, testimonials } from "../data/content.js";

export default function Home() {
  const [services, setServices] = useState(fallbackServices);
  const [activeOffer, setActiveOffer] = useState(null);
  const [showOfferPopup, setShowOfferPopup] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadServices() {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, description")
        .order("created_at", { ascending: true });

      if (!isActive || error) {
        if (error) {
          console.error("Failed to fetch homepage services:", error);
        }
        return;
      }

      setServices(
        (data ?? []).length > 0
          ? data.map((service) => ({
              id: service.id,
              title: service.name,
              desc: service.description,
            }))
          : fallbackServices,
      );
    }

    loadServices();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadOffers() {
      const { data, error } = await supabase
        .from("offers")
        .select("id, title, description, type, value, min_bill, expiry_date")
        .order("expiry_date", { ascending: true });

      if (!isActive) {
        return;
      }

      if (error) {
        console.error("Failed to fetch homepage offers:", error);
        return;
      }

      const now = new Date();
      const activeOffers = (data ?? []).filter((offer) => {
        const expiry = offer.expiry_date ? new Date(offer.expiry_date) : null;
        return expiry && expiry > now;
      });

      const nextOffer = activeOffers[0] ?? null;
      const nextOfferKey = nextOffer ? `${nextOffer.id}:${nextOffer.expiry_date}` : null;
      const dismissedKey = window.localStorage.getItem("activeOfferDismissedId");

      if (nextOffer && dismissedKey !== nextOfferKey) {
        setActiveOffer(nextOffer);
        setShowOfferPopup(true);
      }
    }

    loadOffers();

    return () => {
      isActive = false;
    };
  }, []);

  function closeOfferPopup() {
    if (activeOffer?.id) {
      window.localStorage.setItem(
        "activeOfferDismissedId",
        `${activeOffer.id}:${activeOffer.expiry_date}`,
      );
    }
    setShowOfferPopup(false);
  }

  function handlePopupOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeOfferPopup();
    }
  }

  function formatOfferExpiry(value) {
    if (!value) {
      return "-";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  return (
    <div>
      {showOfferPopup && activeOffer ? (
        <div
          onClick={handlePopupOverlayClick}
          className="fixed inset-0 z-[999] flex items-center justify-center px-4 py-6 bg-black/75 backdrop-blur-sm"
        >
          <div className="w-full max-w-[min(92vw,40rem)] rounded-2xl border border-beige/15 bg-[#111418cc] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl transition-all duration-300 ease-out sm:p-8 animate-popup-fade-scale max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div className="max-w-[75%]">
                <p className="text-xs uppercase tracking-[0.3em] text-gold/80">Exclusive offer</p>
                <h2 className="mt-3 text-3xl font-display font-semibold text-beige sm:text-4xl">
                  {activeOffer.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeOfferPopup}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-beige/15 bg-beige/5 text-beige/80 transition hover:bg-beige/10 hover:text-beige"
                aria-label="Close offer popup"
              >
                ✕
              </button>
            </div>

            <p className="mt-5 text-beige/70 leading-relaxed text-base sm:text-lg">
              {activeOffer.description}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-beige/10 bg-beige/5 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-beige/60">Offer value</p>
                <p className="mt-2 text-2xl font-semibold text-gold sm:text-3xl">
                  {activeOffer.value}
                </p>
              </div>
              <div className="rounded-3xl border border-beige/10 bg-beige/5 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-beige/60">Expires</p>
                <p className="mt-2 text-lg text-beige">
                  {formatOfferExpiry(activeOffer.expiry_date)}
                </p>
              </div>
            </div>

            {activeOffer.min_bill ? (
              <p className="mt-6 text-sm text-beige/60">
                Minimum spend: ₹{activeOffer.min_bill}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <section className="bg-hero">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <Reveal>
                <p className="text-xs uppercase tracking-[0.3em] text-gold/80">
                  Luxury salon experience
                </p>
                <h1 className="mt-3 xs:mt-4 font-display text-3xl xs:text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
                  Blush and Beauty
                </h1>
                <p className="mt-4 xs:mt-5 text-sm xs:text-base sm:text-lg text-beige/75 leading-relaxed max-w-xl">
                  Luxury care for your beauty and confidence. Minimal, premium,
                  and designed for comfort.
                </p>
              </Reveal>

              <Reveal delayMs={120} className="mt-6 xs:mt-8 flex flex-wrap gap-2 xs:gap-3">
                <Button as="link" to="/book">
                  Book Appointment
                </Button>
                <Button
                  as="a"
                  href="https://wa.me/917505519340?text=Hi, I want to book an appointment at Blush and Beauty"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="whatsapp"
                >
                  Book via WhatsApp
                </Button>
                <Button as="link" to="/services" variant="ghost" className="hidden xs:inline-flex">
                  View Services
                </Button>
              </Reveal>

              <Reveal delayMs={220} className="mt-8 xs:mt-10">
                <div className="grid grid-cols-2 xs:grid-cols-3 gap-2 xs:gap-3 max-w-md">
                  {[
                    { k: "10+", v: "Services" },
                    { k: "Premium", v: "Products" },
                    { k: "Calm", v: "Ambience" },
                  ].map((s) => (
                    <div
                      key={s.k}
                      className="rounded-xl xs:rounded-2xl border border-beige/10 bg-beige/5 px-3 xs:px-4 py-3 xs:py-4"
                    >
                      <p className="font-display text-lg xs:text-2xl text-gold">{s.k}</p>
                      <p className="mt-0.5 xs:mt-1 text-xs text-beige/65">{s.v}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-5">
              <Reveal className="glass rounded-3xl p-6 sm:p-8 shadow-glow">
                <div className="rounded-2xl border border-beige/10 bg-gradient-to-br from-gold/15 via-beige/5 to-transparent p-6">
                  <p className="text-xs uppercase tracking-[0.25em] text-gold/80">
                    Today’s highlight
                  </p>
                  <p className="mt-2 xs:mt-3 font-display text-xl xs:text-2xl">
                    Glow Facial + Head Massage
                  </p>
                  <p className="mt-2 xs:mt-3 text-sm xs:text-base text-beige/70 leading-relaxed">
                    A premium combo designed to refresh your skin and calm your
                    senses.
                  </p>
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-beige/70">
                      Price: <span className="text-beige">₹ —</span>
                    </p>
                    <span className="text-xs px-3 py-1 rounded-full border border-gold/25 bg-gold/10 text-gold">
                      Limited slots
                    </span>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <SectionHeading
              eyebrow="Services"
              title="Top services clients love"
              subtitle="A premium, calming experience with expert care and quality products."
            />
            <Button as="link" to="/services" variant="ghost" className="shrink-0">
              View All
            </Button>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((s, idx) => (
              <Reveal key={s.title} delayMs={idx * 60}>
                <ServiceCard index={idx} title={s.title} desc={s.desc} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-16 sm:py-20 border-t border-beige/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <SectionHeading
              eyebrow="Pricing"
              title="Clear pricing, easy to scan"
              subtitle="Transparent categories with realistic starting prices."
            />
            <Button as="link" to="/pricing" variant="ghost" className="shrink-0">
              Full Pricing
            </Button>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {pricing.map((p, idx) => (
              <Reveal key={p.category} delayMs={idx * 70}>
                <PricingCard category={p.category} items={p.items} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="gallery" className="py-16 sm:py-20 border-t border-beige/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <SectionHeading
              eyebrow="Gallery"
              title="A glimpse of the experience"
              subtitle="Premium, minimal visuals to match the luxury salon theme."
            />
            <Button as="link" to="/gallery" variant="ghost" className="shrink-0">
              Open Gallery
            </Button>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {galleryImages.slice(0, 6).map((img, idx) => (
              <Reveal key={img.alt + idx} delayMs={idx * 50}>
                <div className="group relative overflow-hidden rounded-2xl border border-beige/10 bg-beige/5">
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="h-64 w-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-[1.02] transition duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-80" />
                  <p className="absolute bottom-4 left-4 right-4 text-sm text-beige/90">
                    {img.alt}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        id="testimonials"
        className="py-16 sm:py-20 border-t border-beige/10"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Testimonials"
            title="Loved by clients"
            subtitle="A premium experience that keeps people coming back."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {testimonials.map((t, idx) => (
              <Reveal key={t.name} delayMs={idx * 70}>
                <TestimonialCard name={t.name} quote={t.quote} />
              </Reveal>
            ))}
          </div>

          <Reveal delayMs={240} className="mt-12">
            <div className="glass rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-gold/80">
                  Ready when you are
                </p>
                <p className="mt-2 font-display text-2xl">
                  Book your appointment in minutes
                </p>
                <p className="mt-2 text-beige/70">
                  No backend yet - the UI is ready for integration.
                </p>
              </div>
              <div className="flex gap-3">
                <Button as="link" to="/book">
                  Book Now
                </Button>
                <Button as="link" to="/contact" variant="ghost">
                  Contact
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-12 border-t border-beige/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-beige/60 text-sm">
            Prefer browsing first? See{" "}
            <Link className="text-gold hover:brightness-110" to="/services">
              services
            </Link>{" "}
            and{" "}
            <Link className="text-gold hover:brightness-110" to="/pricing">
              pricing
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
