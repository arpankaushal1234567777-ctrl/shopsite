import Button from "../components/Button.jsx";
import Reveal from "../components/Reveal.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import ServiceCard from "../components/ServiceCard.jsx";
import Card from "../components/Card.jsx";
import { extras, services } from "../data/content.js";

export default function Services() {
  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <SectionHeading
            eyebrow="Services"
            title="Everything you need, beautifully done"
            subtitle="Luxury salon essentials with premium products and expert care."
          />
          <Button as="link" to="/book" className="shrink-0">
            Book Now
          </Button>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, idx) => (
            <Reveal key={s.title} delayMs={idx * 40}>
              <ServiceCard index={idx} title={s.title} desc={s.desc} />
            </Reveal>
          ))}
        </div>

        <div className="mt-14 border-t border-beige/10 pt-12">
          <SectionHeading
            eyebrow="More"
            title="Cosmetics & Boutique"
            subtitle="Discover curated beauty essentials and boutique picks that match your style."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {extras.map((x, idx) => (
              <Reveal key={x.title} delayMs={idx * 80}>
                <Card className="p-8">
                  <p className="font-display text-2xl">{x.title}</p>
                  <p className="mt-3 text-beige/70 leading-relaxed">{x.desc}</p>
                  <div className="mt-6">
                    <Button as="link" to="/contact" variant="ghost">
                      Ask for details
                    </Button>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

