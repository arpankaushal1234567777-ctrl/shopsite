import Card from "./Card.jsx";

const icons = [
  "✦",
  "✧",
  "❖",
  "✺",
  "✹",
  "✶",
  "✷",
  "✸",
  "✵",
  "✻",
];

export default function ServiceCard({ index = 0, title, desc }) {
  const icon = icons[index % icons.length];
  return (
    <Card className="p-6 group">
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 rounded-xl border border-gold/25 bg-gold/10 grid place-items-center text-gold">
          <span className="text-lg">{icon}</span>
        </div>
        <div>
          <p className="font-display text-xl text-beige group-hover:text-gold transition">
            {title}
          </p>
          <p className="mt-2 text-sm text-beige/70 leading-relaxed">{desc}</p>
        </div>
      </div>
    </Card>
  );
}

