import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import { supabase } from "../lib/supabase.js";

const ADMIN_EMAIL = "your-email@gmail.com";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const sessionEmail = data.session?.user?.email ?? "";
      setHasSession(sessionEmail === ADMIN_EMAIL);
      setIsCheckingSession(false);
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    const userEmail = data.user?.email ?? "";
    if (userEmail !== ADMIN_EMAIL) {
      await supabase.auth.signOut();
      setErrorMessage("This account is not allowed to access admin.");
      setIsSubmitting(false);
      return;
    }

    navigate("/admin", { replace: true });
  }

  if (isCheckingSession) {
    return (
      <div className="py-16">
        <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 text-center text-beige/70">
          Loading...
        </div>
      </div>
    );
  }

  if (hasSession) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Admin"
          title="Admin Login"
          subtitle="Sign in to securely access the admin dashboard."
        />

        <Card className="mt-8 p-8">
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2">
              <span className="text-sm text-beige/70">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl bg-ink border border-beige/15 px-4 text-beige placeholder:text-beige/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-beige/70">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl bg-ink border border-beige/15 px-4 text-beige placeholder:text-beige/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
                placeholder="Enter password"
                required
              />
            </label>

            {errorMessage ? (
              <p className="text-sm text-red-300">{errorMessage}</p>
            ) : null}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Login"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
