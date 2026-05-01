import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import { supabase } from "./lib/supabase.js";
import Home from "./pages/Home.jsx";
import Services from "./pages/Services.jsx";
import Pricing from "./pages/Pricing.jsx";
import Gallery from "./pages/Gallery.jsx";
import Contact from "./pages/Contact.jsx";
import BookAppointment from "./pages/BookAppointment.jsx";
import Admin from "./pages/Admin.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import ManageBooking from "./pages/ManageBooking.jsx";
import NotFound from "./pages/NotFound.jsx";

const ADMIN_EMAIL = "your-email@gmail.com";

function ProtectedAdminRoute({ children }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      const sessionEmail = data.session?.user?.email ?? "";

      if (!isActive) {
        return;
      }

      if (data.session && sessionEmail !== ADMIN_EMAIL) {
        await supabase.auth.signOut();
        setIsAllowed(false);
        setIsChecking(false);
        return;
      }

      setIsAllowed(Boolean(data.session) && sessionEmail === ADMIN_EMAIL);
      setIsChecking(false);
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const sessionEmail = session?.user?.email ?? "";

      if (session && sessionEmail !== ADMIN_EMAIL) {
        await supabase.auth.signOut();
        setIsAllowed(false);
        setIsChecking(false);
        return;
      }

      setIsAllowed(Boolean(session) && sessionEmail === ADMIN_EMAIL);
      setIsChecking(false);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isChecking) {
    return <div className="px-4 py-16 text-center text-beige/70">Loading...</div>;
  }

  if (!isAllowed) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <div className="min-h-dvh bg-ink text-beige font-sans">
      <ScrollToTop />
      <Navbar />
      <main className="pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/book" element={<BookAppointment />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <Admin />
              </ProtectedAdminRoute>
            }
          />
          <Route path="/manage-booking" element={<ManageBooking />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
