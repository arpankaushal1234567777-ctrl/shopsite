import Button from "../components/Button.jsx";

export default function NotFound() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="glass rounded-3xl p-10 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-gold/80">
            404
          </p>
          <p className="mt-3 font-display text-3xl">Page not found</p>
          <p className="mt-3 text-beige/70">
            The page you’re looking for doesn’t exist.
          </p>
          <div className="mt-8 flex justify-center">
            <Button as="link" to="/">
              Go Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

