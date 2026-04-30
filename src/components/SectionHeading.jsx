export default function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <p className="text-xs tracking-[0.25em] uppercase text-gold/80">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 font-display text-3xl sm:text-4xl text-beige">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-beige/70 leading-relaxed">{subtitle}</p>
      ) : null}
    </div>
  );
}

