import { useEffect, useState } from "react";
import Button from "../components/Button.jsx";
import Reveal from "../components/Reveal.jsx";
import SectionHeading from "../components/SectionHeading.jsx";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGalleryImages = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);

    try {
      console.log("[Gallery] Fetching images from backend API...");

      const response = await fetch(`${API_BASE_URL}/gallery`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        console.log(`[Gallery] Loaded ${data.data.length} images from API`);
        setImages(data.data);
      } else {
        console.error("[Gallery] Invalid API response:", data);
        setImages([]);
      }
    } catch (error) {
      console.error("[Gallery] Failed to fetch images:", error);
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load on component mount
  useEffect(() => {
    let isActive = true;

    if (isActive) {
      fetchGalleryImages();
    }

    return () => {
      isActive = false;
    };
  }, []);

  // Listen for gallery updates from admin panel
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "gallery_updated" && e.newValue) {
        console.log("[Gallery] Admin action detected - refetching images...");
        fetchGalleryImages(false);
        localStorage.removeItem("gallery_updated");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Periodic refresh every 60 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("[Gallery] Periodic refresh triggered");
      fetchGalleryImages(false);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-8 xs:py-10 sm:py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 xs:gap-6 flex-wrap">
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
          {images.map((img, idx) => (
            <Reveal key={img._id} delayMs={idx * 40}>
              <div className="group relative overflow-hidden rounded-2xl border border-beige/10 bg-beige/5 h-72">
                <img
                  src={img.url}
                  alt="Gallery image"
                  className="h-full w-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.02] transition duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent opacity-80 group-hover:opacity-70 transition duration-500" />
              </div>
            </Reveal>
          ))}
        </div>

        {isLoading ? (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-beige/60">
              <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-beige/30 border-t-beige/90" />
              Loading gallery...
            </div>
          </div>
        ) : null}

        {!isLoading && images.length === 0 ? (
          <p className="mt-6 text-center text-sm text-beige/60">
            No uploaded gallery images yet
          </p>
        ) : null}
      </div>
    </div>
  );
}
