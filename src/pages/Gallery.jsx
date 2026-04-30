import Button from "../components/Button.jsx";
import Reveal from "../components/Reveal.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import { galleryImages } from "../data/content.js";

export default function Gallery() {
  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <SectionHeading
            eyebrow="Gallery"
            title="Premium look, minimal feel"
            subtitle="A clean grid layout with subtle hover and fade-in effects."
          />
          <Button as="link" to="/book" className="shrink-0">
            Book Now
          </Button>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {galleryImages.map((img, idx) => (
            <Reveal key={img.alt + idx} delayMs={idx * 40}>
              <div className="group relative overflow-hidden rounded-2xl border border-beige/10 bg-beige/5">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="h-72 w-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.02] transition duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent opacity-80" />
                <p className="absolute bottom-4 left-4 right-4 text-sm text-beige/90">
                  {img.alt}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

