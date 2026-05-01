import { useEffect, useState } from "react";
import Button from "../components/Button.jsx";
import Reveal from "../components/Reveal.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import { supabase } from "../lib/supabase.js";

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadGalleryImages() {
      setIsLoading(true);

      const bucketName = "gallery";
      const folderPath = "";
      const { data, error } = await supabase.storage.from(bucketName).list(folderPath, {
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });

      console.log("Gallery list() bucket:", bucketName);
      console.log("Gallery list() path:", folderPath);
      console.log("Gallery list() raw response:", data);

      if (!isActive) {
        return;
      }

      if (error) {
        console.error("Failed to fetch gallery images:", error);
        setImages([]);
        setIsLoading(false);
        return;
      }

      const storageImages = (data ?? [])
        .filter((item) => item.name && !item.name.endsWith("/"))
        .map((item) => {
          const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(item.name);

          console.log("Gallery public URL:", item.name, publicUrlData.publicUrl);

          return {
            name: item.name,
            url: publicUrlData.publicUrl,
          };
        });

      console.log("Fetched gallery images:", storageImages);
      setImages(storageImages);
      setIsLoading(false);
    }

    loadGalleryImages();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    console.log("Gallery render state:", images);
  }, [images]);

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
          {images.map((img, idx) => (
            <Reveal key={img.name + idx} delayMs={idx * 40}>
              <div className="group relative overflow-hidden rounded-2xl border border-beige/10 bg-beige/5">
                <img
                  src={img.url}
                  alt={img.name}
                  className="h-72 w-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.02] transition duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent opacity-80" />
                <p className="absolute bottom-4 left-4 right-4 text-sm text-beige/90">
                  {img.name}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {isLoading ? (
          <p className="mt-6 text-center text-sm text-beige/60">
            Loading gallery...
          </p>
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
