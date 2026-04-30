import Button from "../components/Button.jsx";
import PricingCard from "../components/PricingCard.jsx";
import Reveal from "../components/Reveal.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import { pricing } from "../data/content.js";

export default function Pricing() {
  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <SectionHeading
            eyebrow="Pricing"
            title="Simple pricing that’s easy to scan"
            subtitle="Transparent categories with realistic starting prices."
          />
          <Button as="link" to="/book" className="shrink-0">
            Book Now
          </Button>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {pricing.map((p, idx) => (
            <Reveal key={p.category} delayMs={idx * 70}>
              <PricingCard category={p.category} items={p.items} />
            </Reveal>
          ))}
        </div>

        <div className="mt-12 glass rounded-3xl p-6 sm:p-8">
          <p className="text-sm text-beige/70">
            Note: Services with a “+” indicate starting prices (final cost can
            vary by length/coverage).
          </p>
        </div>
      </div>
    </div>
  );
}
