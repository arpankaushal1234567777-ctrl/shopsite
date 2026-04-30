import Card from "./Card.jsx";

export default function TestimonialCard({ name, quote }) {
  return (
    <Card className="p-6">
      <p className="text-beige/70 leading-relaxed">“{quote}”</p>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-gold/10 border border-gold/25 grid place-items-center text-gold font-display">
          {name.slice(0, 1).toUpperCase()}
        </div>
        <p className="text-beige">{name}</p>
      </div>
    </Card>
  );
}

