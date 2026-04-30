import Card from "./Card.jsx";

export default function PricingCard({ category, items }) {
  return (
    <Card className="p-6">
      <p className="text-xs uppercase tracking-[0.25em] text-gold/80">
        {category}
      </p>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-4 border-b border-beige/10 pb-3 last:border-b-0 last:pb-0"
          >
            <p className="text-beige/85">{item.name}</p>
            <p className="font-medium text-beige/70">{item.price}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

