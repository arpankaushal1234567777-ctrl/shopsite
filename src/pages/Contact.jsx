import Button from "../components/Button.jsx";
import Reveal from "../components/Reveal.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import Card from "../components/Card.jsx";

export default function Contact() {
  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <SectionHeading
            eyebrow="Contact"
            title="Let’s get you booked"
            subtitle="Reach out for packages, custom requests, or questions."
          />
          <Button as="link" to="/book" className="shrink-0">
            Book Now
          </Button>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <Reveal>
            <Card className="p-8">
              <p className="font-display text-2xl">Contact details</p>
              <div className="mt-5 grid gap-5">
                <div className="grid gap-2">
                  <p className="text-sm uppercase tracking-[0.22em] text-gold/80">
                    Phone
                  </p>
                  <div className="grid gap-2 text-beige/80">
                    <a className="hover:text-beige" href="tel:+917505519340">
                      +91 7505519340
                    </a>
                    <a className="hover:text-beige" href="tel:+918439015769">
                      +91 8439015769
                    </a>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3">
                    <Button
                      as="a"
                      href="tel:+917505519340"
                      className="px-4 py-2"
                    >
                      Call Now
                    </Button>
                    <Button
                      as="a"
                      href="tel:+918439015769"
                      variant="ghost"
                      className="px-4 py-2"
                    >
                      Call Alternate
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <p className="text-sm uppercase tracking-[0.22em] text-gold/80">
                    Address
                  </p>
                  <div className="rounded-2xl border border-beige/10 bg-beige/5 p-5 text-beige/75 leading-relaxed">
                    <p>Shop No. 4, Upper Ground Floor,</p>
                    <p>Dayal Plaza, Near Dayal Apartment,</p>
                    <p>100ft Road, Dayal Bagh, Agra</p>
                  </div>
                </div>

                <div className="grid gap-2">
                  <p className="text-sm uppercase tracking-[0.22em] text-gold/80">
                    Timing
                  </p>
                  <p className="text-beige/75">
                    10:00 AM – 8:00 PM (All Days)
                  </p>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  className="px-4 py-2 rounded-full border border-beige/15 bg-beige/5 text-beige/80 hover:text-beige hover:border-gold/25 transition"
                  href="#"
                >
                  WhatsApp
                </a>
                <a
                  className="px-4 py-2 rounded-full border border-beige/15 bg-beige/5 text-beige/80 hover:text-beige hover:border-gold/25 transition"
                  href="#"
                >
                  Instagram
                </a>
              </div>
            </Card>
          </Reveal>

          <Reveal delayMs={120}>
            <Card className="p-8">
              <p className="font-display text-2xl">Send a message</p>
              <form
                className="mt-6 grid gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Thanks! We will reach out shortly. (UI only)");
                }}
              >
                <label className="grid gap-2">
                  <span className="text-sm text-beige/70">Name</span>
                  <input
                    className="h-12 rounded-xl bg-ink border border-beige/15 px-4 text-beige placeholder:text-beige/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
                    placeholder="Your name"
                    required
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm text-beige/70">Phone</span>
                  <input
                    className="h-12 rounded-xl bg-ink border border-beige/15 px-4 text-beige placeholder:text-beige/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
                    placeholder="+91..."
                    required
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm text-beige/70">Message</span>
                  <textarea
                    className="min-h-28 rounded-xl bg-ink border border-beige/15 px-4 py-3 text-beige placeholder:text-beige/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
                    placeholder="How can we help?"
                    required
                  />
                </label>
                <Button type="submit">Send</Button>
              </form>
            </Card>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
