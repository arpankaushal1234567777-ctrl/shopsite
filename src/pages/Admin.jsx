import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import Reveal from "../components/Reveal.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import Card from "../components/Card.jsx";
import { supabase } from "../lib/supabase.js";
import { services as fallbackServices } from "../data/content.js";

function formatBookingDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatBookingTime(value) {
  if (!value) {
    return "-";
  }

  return value;
}

function formatCreatedAt(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getStatusClasses(status) {
  if (status === "completed") {
    return "border border-emerald-500/25 bg-emerald-500/15 text-emerald-200";
  }

  return "border border-yellow-500/25 bg-yellow-500/15 text-yellow-200";
}

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function Admin() {
  const navigate = useNavigate();
  const [services, setServices] = useState(fallbackServices);
  const serviceOptions = useMemo(() => services.map((service) => service.title), [services]);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyAppointmentId, setBusyAppointmentId] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [busyServiceId, setBusyServiceId] = useState("");
  const [busyOfferId, setBusyOfferId] = useState("");
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
  });
  const [offerForm, setOfferForm] = useState({
    title: "",
    description: "",
    type: "discount",
    value: "",
    min_bill: "",
    expiry_date: "",
  });
  const [editingBooking, setEditingBooking] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    service: "",
    date: "",
    time: "",
  });
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(true);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [busyGalleryFileName, setBusyGalleryFileName] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadServices() {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, description, price, image_url, created_at")
        .order("created_at", { ascending: true });

      if (!isActive || error) {
        if (error) {
          console.error("Failed to fetch admin services:", error);
        }
        return;
      }

      setServices(
        (data ?? []).length > 0
          ? data.map((service) => ({
              id: service.id,
              title: service.name,
              desc: service.description,
              price: service.price,
              image_url: service.image_url,
            }))
          : fallbackServices,
      );
    }

    async function loadAppointments() {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("appointments")
        .select("id, name, phone, service, date, time, status, created_at")
        .order("created_at", { ascending: false });

      if (!isActive) {
        return;
      }

      if (error) {
        console.error("Failed to fetch appointments:", error);
        setAppointments([]);
        setIsLoading(false);
        return;
      }

      setAppointments(data ?? []);
      setIsLoading(false);
    }

    async function loadOffers() {
      setOffersLoading(true);

      const { data, error } = await supabase
        .from("offers")
        .select("id, title, description, type, value, min_bill, expiry_date, created_at")
        .order("created_at", { ascending: false });

      if (!isActive) {
        return;
      }

      if (error) {
        console.error("Failed to fetch offers:", error);
        setOffers([]);
        setOffersLoading(false);
        return;
      }

      setOffers(data ?? []);
      setOffersLoading(false);
    }

    loadServices();
    loadAppointments();
    loadOffers();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadGalleryFiles() {
      setIsLoadingGallery(true);

      try {
        console.log("[Admin Gallery] Fetching images from backend API...");

        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const response = await fetch(`${apiUrl}/gallery`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!isActive) return;

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          console.log(`[Admin Gallery] Loaded ${data.data.length} images`);
          setGalleryFiles(data.data);
        } else {
          console.error("[Admin Gallery] Invalid API response:", data);
          setGalleryFiles([]);
        }
      } catch (error) {
        console.error("[Admin Gallery] Failed to fetch files:", error);
        setGalleryFiles([]);
      } finally {
        if (isActive) {
          setIsLoadingGallery(false);
        }
      }
    }

    loadGalleryFiles();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    console.log("Admin gallery state:", galleryFiles);
  }, [galleryFiles]);

  const rows = useMemo(
    () =>
      appointments.map((appointment, index) => ({
        ...appointment,
        id: appointment.id ?? `${appointment.created_at ?? "booking"}-${index}`,
        status: appointment.status ?? "pending",
      })),
    [appointments],
  );

  const analytics = useMemo(() => {
    const today = getTodayDateString();

    return {
      total: rows.length,
      today: rows.filter((appointment) => appointment.date === today).length,
      pending: rows.filter((appointment) => appointment.status === "pending").length,
      completed: rows.filter((appointment) => appointment.status === "completed").length,
    };
  }, [rows]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    if (!normalizedSearch) {
      return rows;
    }

    return rows.filter((appointment) =>
      (appointment.phone ?? "").toLowerCase().includes(normalizedSearch),
    );
  }, [rows, searchValue]);

  async function markAsCompleted(id) {
    setBusyAppointmentId(id);

    const { error } = await supabase
      .from("appointments")
      .update({ status: "completed" })
      .eq("id", id);

    if (error) {
      console.error("Failed to update appointment status:", error);
      alert("Something went wrong");
      setBusyAppointmentId("");
      return;
    }

    setAppointments((prev) =>
      prev.map((appointment) =>
        appointment.id === id
          ? { ...appointment, status: "completed" }
          : appointment,
      ),
    );
    alert("Appointment marked as completed");
    setBusyAppointmentId("");
  }

  async function deleteAppointment(id) {
    const confirmed = window.confirm("Delete this appointment?");
    if (!confirmed) {
      return;
    }

    setBusyAppointmentId(id);

    const { error } = await supabase.from("appointments").delete().eq("id", id);

    if (error) {
      console.error("Failed to delete appointment:", error);
      alert("Something went wrong");
      setBusyAppointmentId("");
      return;
    }

    setAppointments((prev) => prev.filter((appointment) => appointment.id !== id));
    alert("Appointment deleted successfully");
    setBusyAppointmentId("");
  }

  function openEditBooking(appointment) {
    setEditingBooking(appointment);
    setEditForm({
      name: appointment.name ?? "",
      phone: appointment.phone ?? "",
      service: appointment.service ?? serviceOptions[0] ?? "",
      date: appointment.date ?? "",
      time: appointment.time ?? "",
    });
  }

  function closeEditBooking() {
    setEditingBooking(null);
    setEditForm({
      name: "",
      phone: "",
      service: "",
      date: "",
      time: "",
    });
  }

  async function saveBookingEdits(e) {
    e.preventDefault();
    if (!editingBooking) {
      return;
    }

    setBusyAppointmentId(editingBooking.id);

    const { error } = await supabase
      .from("appointments")
      .update({
        name: editForm.name,
        phone: editForm.phone,
        service: editForm.service,
        date: editForm.date,
        time: editForm.time,
      })
      .eq("id", editingBooking.id);

    if (error) {
      console.error("Failed to update booking:", error);
      alert("Something went wrong");
      setBusyAppointmentId("");
      return;
    }

    setAppointments((prev) =>
      prev.map((appointment) =>
        appointment.id === editingBooking.id
          ? {
              ...appointment,
              name: editForm.name,
              phone: editForm.phone,
              service: editForm.service,
              date: editForm.date,
              time: editForm.time,
            }
          : appointment,
      ),
    );
    closeEditBooking();
    alert("Booking updated successfully");
    setBusyAppointmentId("");
  }

  async function uploadGalleryImage(e) {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploadingGallery(true);
    const safeName = file.name.replace(/\s+/g, "-").toLowerCase();
    const fileName = `${Date.now()}-${safeName}`;

    try {
      console.log("[Admin] Uploading gallery image:", fileName);

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage.from("gallery").upload(fileName, file);

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      console.log("[Admin] Image uploaded to storage:", fileName);

      // Get public URL
      const { data: publicUrlData } = supabase.storage.from("gallery").getPublicUrl(fileName);

      if (!publicUrlData?.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      // Record in backend database
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      console.log("[Admin] Recording image in database:", apiUrl);

      const dbResponse = await fetch(`${apiUrl}/gallery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName,
          url: publicUrlData.publicUrl,
          storagePath: fileName,
          size: file.size,
          mimeType: file.type,
        }),
      });

      const dbData = await dbResponse.json();
      console.log("[Admin] Database response:", dbData);

      if (!dbResponse.ok || !dbData.success) {
        throw new Error(dbData.error || "Failed to save image record");
      }

      // Add to admin state
      setGalleryFiles((prev) => [
        { _id: dbData.data._id, fileName, url: publicUrlData.publicUrl },
        ...prev,
      ]);

      // Signal to Gallery page that content has updated
      localStorage.setItem("gallery_updated", Date.now().toString());

      alert("✓ Gallery image uploaded successfully!");
      setIsUploadingGallery(false);
      e.target.value = "";
    } catch (error) {
      console.error("[Admin] Upload failed:", error);
      alert(`❌ Upload failed: ${error.message}`);
      setIsUploadingGallery(false);
      e.target.value = "";
    }
  }

  function resetServiceForm() {
    setServiceForm({
      name: "",
      description: "",
      price: "",
      image_url: "",
    });
    setEditingService(null);
  }

  function resetOfferForm() {
    setOfferForm({
      title: "",
      description: "",
      type: "discount",
      value: "",
      min_bill: "",
      expiry_date: "",
    });
  }

  function formatOfferDate(value) {
    if (!value) {
      return "-";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  async function saveService(e) {
    e.preventDefault();

    if (editingService?.id) {
      setBusyServiceId(editingService.id);
      const { data, error } = await supabase
        .from("services")
        .update({
          name: serviceForm.name,
          description: serviceForm.description,
          price: serviceForm.price,
          image_url: serviceForm.image_url,
        })
        .eq("id", editingService.id)
        .select("id, name, description, price, image_url");

      if (error) {
        console.error("Failed to update service:", error);
        alert("Something went wrong");
        setBusyServiceId("");
        return;
      }

      const updatedService = data?.[0];
      if (updatedService) {
        setServices((prev) =>
          prev.map((service) =>
            service.id === updatedService.id
              ? {
                  ...service,
                  title: updatedService.name,
                  desc: updatedService.description,
                  price: updatedService.price,
                  image_url: updatedService.image_url,
                }
              : service,
          ),
        );
      }

      resetServiceForm();
      setBusyServiceId("");
      return;
    }

    setBusyServiceId("new");
    const { data, error } = await supabase
      .from("services")
      .insert([
        {
          name: serviceForm.name,
          description: serviceForm.description,
          price: serviceForm.price,
          image_url: serviceForm.image_url,
        },
      ])
      .select("id, name, description, price, image_url");

    if (error) {
      console.error("Failed to add service:", error);
      alert("Something went wrong");
      setBusyServiceId("");
      return;
    }

    const createdService = data?.[0];
    if (createdService) {
      setServices((prev) => [
        ...prev,
        {
          id: createdService.id,
          title: createdService.name,
          desc: createdService.description,
          price: createdService.price,
          image_url: createdService.image_url,
        },
      ]);
    }

    resetServiceForm();
    setBusyServiceId("");
  }

  async function saveOffer(e) {
    e.preventDefault();

    setBusyOfferId("new");
    const { data, error } = await supabase
      .from("offers")
      .insert([
        {
          title: offerForm.title,
          description: offerForm.description,
          type: offerForm.type,
          value: offerForm.value,
          min_bill: offerForm.min_bill ? parseFloat(offerForm.min_bill) : null,
          expiry_date: offerForm.expiry_date ? new Date(offerForm.expiry_date).toISOString() : null,
        },
      ])
      .select("id, title, description, type, value, min_bill, expiry_date, created_at");

    if (error) {
      console.error("Failed to add offer:", error);
      alert("Something went wrong");
      setBusyOfferId("");
      return;
    }

    const createdOffer = data?.[0];
    if (createdOffer) {
      setOffers((prev) => [createdOffer, ...prev]);
      setOfferForm({
        title: "",
        description: "",
        type: "discount",
        value: "",
        min_bill: "",
        expiry_date: "",
      });
    }

    setBusyOfferId("");
  }

  async function deleteOffer(id) {
    const confirmed = window.confirm("Delete this offer?");
    if (!confirmed) {
      return;
    }

    setBusyOfferId(id);
    const { error } = await supabase.from("offers").delete().eq("id", id);

    if (error) {
      console.error("Failed to delete offer:", error);
      alert("Something went wrong");
      setBusyOfferId("");
      return;
    }

    setOffers((prev) => prev.filter((offer) => offer.id !== id));
    setBusyOfferId("");
  }

  function openEditService(service) {
    setEditingService(service);
    setServiceForm({
      name: service.title ?? "",
      description: service.desc ?? "",
      price: service.price ?? "",
      image_url: service.image_url ?? "",
    });
  }

  async function deleteService(id) {
    const confirmed = window.confirm("Delete this service?");
    if (!confirmed) {
      return;
    }

    setBusyServiceId(id);
    const { error } = await supabase.from("services").delete().eq("id", id);

    if (error) {
      console.error("Failed to delete service:", error);
      alert("Something went wrong");
      setBusyServiceId("");
      return;
    }

    setServices((prev) => prev.filter((service) => service.id !== id));
    setBusyServiceId("");
  }

  async function deleteGalleryImage(fileName, imageId) {
    const confirmed = window.confirm("Delete this gallery image?");
    if (!confirmed) {
      return;
    }

    setBusyGalleryFileName(fileName);

    try {
      console.log("[Admin] Deleting gallery image:", { fileName, imageId });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/gallery/${imageId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      console.log("[Admin] Delete API response:", data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete image");
      }

      // Remove from admin panel state immediately
      setGalleryFiles((prev) => prev.filter((file) => file._id !== imageId));

      // Signal to Gallery page that content has updated
      localStorage.setItem("gallery_updated", Date.now().toString());

      alert("✓ Gallery image deleted successfully!");
      setBusyGalleryFileName("");
    } catch (error) {
      console.error("[Admin] Failed to delete gallery image:", error);
      alert(`❌ Failed to delete image: ${error.message}`);
      setBusyGalleryFileName("");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/admin-login", { replace: true });
  }

  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <SectionHeading
            eyebrow="Admin"
            title="Admin Dashboard"
            subtitle="View the latest appointment requests in one place."
          />
          <Button type="button" variant="ghost" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <Reveal className="mt-10">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Total Bookings",
                value: analytics.total,
                tone: "text-beige",
              },
              {
                label: "Today’s Bookings",
                value: analytics.today,
                tone: "text-gold",
              },
              {
                label: "Pending Bookings",
                value: analytics.pending,
                tone: "text-yellow-200",
              },
              {
                label: "Completed Bookings",
                value: analytics.completed,
                tone: "text-emerald-200",
              },
            ].map((item) => (
              <Card key={item.label} className="p-6">
                <p className="text-xs uppercase tracking-[0.22em] text-gold/75">
                  {item.label}
                </p>
                <p className={`mt-4 font-display text-4xl ${item.tone}`}>
                  {isLoading ? "..." : item.value}
                </p>
              </Card>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-10">
          <Card className="p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-display text-2xl text-beige">Services</p>
                <p className="mt-1 text-sm text-beige/65">
                  Add, edit, and remove services shown across the site.
                </p>
              </div>
              {editingService ? (
                <Button type="button" variant="ghost" onClick={resetServiceForm}>
                  Cancel Edit
                </Button>
              ) : null}
            </div>

            <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={saveService}>
              <label className="grid gap-2">
                <span className="text-sm text-beige/70">Name</span>
                <input
                  value={serviceForm.name}
                  onChange={(e) =>
                    setServiceForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="h-12 rounded-xl bg-ink border border-beige/15 px-4 text-beige placeholder:text-beige/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
                  required
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-beige/70">Price</span>
                <input
                  value={serviceForm.price}
                  onChange={(e) =>
                    setServiceForm((prev) => ({ ...prev, price: e.target.value }))
                  }
                  className="h-12 rounded-xl bg-ink border border-beige/15 px-4 text-beige placeholder:text-beige/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
                  placeholder="₹500"
                  required
                />
              </label>

              <label className="grid gap-2 sm:col-span-2">
                <span className="text-sm text-beige/70">Description</span>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) =>
                    setServiceForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="min-h-28 rounded-xl bg-ink border border-beige/15 px-4 py-3 text-beige placeholder:text-beige/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
                  required
                />
              </label>

              <label className="grid gap-2 sm:col-span-2">
                <span className="text-sm text-beige/70">Image URL</span>
                <input
                  value={serviceForm.image_url}
                  onChange={(e) =>
                    setServiceForm((prev) => ({ ...prev, image_url: e.target.value }))
                  }
                  className="h-12 rounded-xl bg-ink border border-beige/15 px-4 text-beige placeholder:text-beige/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
                  placeholder="https://..."
                  required
                />
              </label>

              <div className="sm:col-span-2">
                <Button
                  type="submit"
                  disabled={busyServiceId === "new" || busyServiceId === editingService?.id}
                >
                  {editingService
                    ? busyServiceId === editingService.id
                      ? "Saving..."
                      : "Save Service"
                    : busyServiceId === "new"
                      ? "Adding..."
                      : "Add Service"}
                </Button>
              </div>
            </form>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <div
                  key={service.id ?? service.title}
                  className="rounded-2xl border border-beige/10 bg-beige/5 p-5"
                >
                  <p className="font-display text-xl text-beige">{service.title}</p>
                  <p className="mt-2 text-sm text-beige/70 leading-relaxed">
                    {service.desc}
                  </p>
                  <p className="mt-3 text-sm text-gold/80">{service.price ?? "-"}</p>
                  <p className="mt-2 truncate text-xs text-beige/45">
                    {service.image_url ?? "-"}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="px-4 py-2"
                      onClick={() => openEditService(service)}
                    >
                      Edit
                    </Button>
                    <button
                      type="button"
                      onClick={() => deleteService(service.id)}
                      disabled={busyServiceId === service.id}
                      className="inline-flex items-center justify-center rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-200 transition hover:border-red-300/40 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busyServiceId === service.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>

        <Reveal className="mt-10">
          <Card className="p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-display text-2xl text-beige">Offers</p>
                <p className="mt-1 text-sm text-beige/65">
                  Create offers or discounts and set expiry dates for the homepage popup.
                </p>
              </div>
            </div>

            <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={saveOffer}>
              <label className="grid gap-2 sm:col-span-2">
                <span className="text-sm text-beige/70">Title</span>
                <input
                  value={offerForm.title}
                  onChange={(e) =>
                    setOfferForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="h-12 rounded-xl bg-ink border border-beige/15 px-4 text-beige placeholder:text-beige/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
                  required
                />
              </label>

              <label className="grid gap-2 sm:col-span-2">
                <span className="text-sm text-beige/70">Description</span>
                <textarea
                  value={offerForm.description}
                  onChange={(e) =>
                    setOfferForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="min-h-28 rounded-xl bg-ink border border-beige/15 px-4 py-3 text-beige placeholder:text-beige/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
                  required
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-beige/70">Type</span>
                <select
                  value={offerForm.type}
                  onChange={(e) =>
                    setOfferForm((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className="h-12 rounded-xl bg-ink border border-beige/15 px-4 text-beige focus:outline-none focus:ring-2 focus:ring-gold/50"
                >
                  <option value="discount">Discount</option>
                  <option value="free">Free</option>
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-beige/70">Value</span>
                <input
                  value={offerForm.value}
                  onChange={(e) =>
                    setOfferForm((prev) => ({ ...prev, value: e.target.value }))
                  }
                  className="h-12 rounded-xl bg-ink border border-beige/15 px-4 text-beige placeholder:text-beige/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
                  placeholder="20% or Free Facial"
                  required
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-beige/70">Min Bill</span>
                <input
                  value={offerForm.min_bill}
                  onChange={(e) =>
                    setOfferForm((prev) => ({ ...prev, min_bill: e.target.value }))
                  }
                  className="h-12 rounded-xl bg-ink border border-beige/15 px-4 text-beige placeholder:text-beige/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
                  placeholder="Optional"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-beige/70">Expiry Date</span>
                <input
                  type="date"
                  value={offerForm.expiry_date}
                  onChange={(e) =>
                    setOfferForm((prev) => ({ ...prev, expiry_date: e.target.value }))
                  }
                  className="h-12 rounded-xl bg-ink border border-beige/15 px-4 text-beige focus:outline-none focus:ring-2 focus:ring-gold/50"
                  required
                />
              </label>

              <div className="sm:col-span-2">
                <Button type="submit" disabled={busyOfferId === "new"}>
                  {busyOfferId === "new" ? "Adding Offer..." : "Add Offer"}
                </Button>
              </div>
            </form>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {offersLoading ? (
                <p className="text-sm text-beige/65">Loading offers...</p>
              ) : offers.length === 0 ? (
                <p className="text-sm text-beige/65">No offers yet. Add one above.</p>
              ) : (
                offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="rounded-2xl border border-beige/10 bg-beige/5 p-5"
                  >
                    <p className="font-display text-xl text-beige">{offer.title}</p>
                    <p className="mt-2 text-sm text-beige/70 leading-relaxed">
                      {offer.description}
                    </p>
                    <p className="mt-3 text-sm text-gold/80">
                      {offer.type === "discount" ? "Discount:" : "Offer:"} {offer.value}
                    </p>
                    <p className="mt-2 text-xs text-beige/50">
                      Min bill: {offer.min_bill ?? "None"}
                    </p>
                    <p className="mt-1 text-xs text-beige/50">
                      Expires: {formatOfferDate(offer.expiry_date)}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => deleteOffer(offer.id)}
                        disabled={busyOfferId === offer.id}
                        className="inline-flex items-center justify-center rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-200 transition hover:border-red-300/40 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {busyOfferId === offer.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </Reveal>

        <Reveal className="mt-10">
          <Card className="p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-display text-2xl text-beige">Gallery Uploads</p>
                <p className="mt-1 text-sm text-beige/65">
                  Upload images to the `gallery` bucket for the public gallery page.
                </p>
              </div>
              <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-medium text-ink transition hover:brightness-110 active:brightness-95 shadow-glow">
                {isUploadingGallery ? "Uploading..." : "Upload Image"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={uploadGalleryImage}
                  disabled={isUploadingGallery}
                  className="sr-only"
                />
              </label>
            </div>

            {isLoadingGallery ? (
              <div className="mt-6 flex justify-center">
                <div className="inline-flex items-center gap-2 text-sm text-beige/60">
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-beige/30 border-t-beige/90" />
                  Loading gallery images...
                </div>
              </div>
            ) : galleryFiles.length === 0 ? (
              <p className="mt-6 text-sm text-beige/65">
                No uploaded gallery images yet.
              </p>
            ) : (
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {galleryFiles.map((file) => (
                  <div
                    key={file._id}
                    className="group relative overflow-hidden rounded-2xl border border-beige/10 bg-beige/5"
                  >
                    <img
                      src={file.url}
                      alt="Gallery thumbnail"
                      className="h-40 w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.02] group-hover:opacity-100"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-80" />
                    <button
                      type="button"
                      onClick={() => deleteGalleryImage(file.fileName, file._id)}
                      disabled={busyGalleryFileName === file.fileName}
                      className="absolute right-3 top-3 rounded-full border border-red-400/20 bg-red-500/80 px-3 py-1 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-red-600"
                    >
                      {busyGalleryFileName === file.fileName ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Reveal>

        <Reveal className="mt-10">
          <Card className="overflow-hidden">
            <div className="border-b border-beige/10 px-6 py-5">
              <p className="font-display text-2xl text-beige">Appointments</p>
              <p className="mt-1 text-sm text-beige/65">
                Latest bookings appear first.
              </p>
              <div className="mt-4">
                <input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="h-12 w-full max-w-sm rounded-xl bg-ink border border-beige/15 px-4 text-beige placeholder:text-beige/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
                  placeholder="Search by phone number"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="px-6 py-12 text-center text-beige/75">Loading...</div>
            ) : filteredRows.length === 0 ? (
              <div className="px-6 py-12 text-center text-beige/75">
                नो bookings available
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="max-h-[70vh] overflow-y-auto">
                  <table className="min-w-full text-left text-sm text-beige/80">
                    <thead className="sticky top-0 bg-ink/95 backdrop-blur">
                      <tr className="border-b border-beige/10 text-xs uppercase tracking-[0.22em] text-gold/80">
                        <th className="px-6 py-4 font-medium">Name</th>
                        <th className="px-6 py-4 font-medium">Phone</th>
                        <th className="px-6 py-4 font-medium">Service</th>
                        <th className="px-6 py-4 font-medium">Date</th>
                        <th className="px-6 py-4 font-medium">Time</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium">Created At</th>
                        <th className="px-6 py-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((appointment) => (
                        <tr
                          key={appointment.id}
                          className="border-b border-beige/8 transition hover:bg-beige/5"
                        >
                          <td className="px-6 py-4 text-beige">{appointment.name || "-"}</td>
                          <td className="px-6 py-4">{appointment.phone || "-"}</td>
                          <td className="px-6 py-4">{appointment.service || "-"}</td>
                          <td className="px-6 py-4">{formatBookingDate(appointment.date)}</td>
                          <td className="px-6 py-4">{formatBookingTime(appointment.time)}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusClasses(appointment.status)}`}
                            >
                              {appointment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">{formatCreatedAt(appointment.created_at)}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => openEditBooking(appointment)}
                                disabled={busyAppointmentId === appointment.id}
                                className="inline-flex items-center justify-center rounded-full border border-beige/20 bg-beige/5 px-4 py-2 text-xs font-medium text-beige transition hover:border-gold/40 hover:bg-beige/10 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => markAsCompleted(appointment.id)}
                                disabled={
                                  busyAppointmentId === appointment.id ||
                                  appointment.status === "completed"
                                }
                                className="inline-flex items-center justify-center rounded-full border border-beige/20 bg-beige/5 px-4 py-2 text-xs font-medium text-beige transition hover:border-gold/40 hover:bg-beige/10 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {busyAppointmentId === appointment.id &&
                                appointment.status !== "completed"
                                  ? "Updating..."
                                  : appointment.status === "completed"
                                    ? "Completed"
                                    : "Mark as Completed"}
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteAppointment(appointment.id)}
                                disabled={busyAppointmentId === appointment.id}
                                className="inline-flex items-center justify-center rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-200 transition hover:border-red-300/40 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {busyAppointmentId === appointment.id ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>
        </Reveal>

        {editingBooking ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 px-4 py-6 backdrop-blur-sm">
            <Card className="w-full max-w-2xl p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-2xl text-beige">Edit Booking</p>
                  <p className="mt-1 text-sm text-beige/65">
                    Update booking details and save changes instantly.
                  </p>
                </div>
                <Button type="button" variant="ghost" onClick={closeEditBooking}>
                  Close
                </Button>
              </div>

              <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={saveBookingEdits}>
                <label className="grid gap-2">
                  <span className="text-sm text-beige/70">Name</span>
                  <input
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="h-12 rounded-xl bg-ink border border-beige/15 px-4 text-beige placeholder:text-beige/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
                    required
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm text-beige/70">Phone</span>
                  <input
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="h-12 rounded-xl bg-ink border border-beige/15 px-4 text-beige placeholder:text-beige/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
                    required
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm text-beige/70">Service</span>
                  <select
                    value={editForm.service}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, service: e.target.value }))
                    }
                    className="h-12 rounded-xl bg-ink border border-beige/15 px-4 text-beige focus:outline-none focus:ring-2 focus:ring-gold/50"
                    required
                  >
                    {serviceOptions.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm text-beige/70">Date</span>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, date: e.target.value }))
                    }
                    className="h-12 rounded-xl bg-ink border border-beige/15 px-4 text-beige focus:outline-none focus:ring-2 focus:ring-gold/50"
                    required
                  />
                </label>

                <label className="grid gap-2 sm:col-span-2">
                  <span className="text-sm text-beige/70">Time</span>
                  <input
                    value={editForm.time}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, time: e.target.value }))
                    }
                    className="h-12 rounded-xl bg-ink border border-beige/15 px-4 text-beige placeholder:text-beige/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
                    placeholder="10:00 AM"
                    required
                  />
                </label>

                <div className="flex flex-wrap gap-3 sm:col-span-2">
                  <Button type="submit" disabled={busyAppointmentId === editingBooking.id}>
                    {busyAppointmentId === editingBooking.id ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={closeEditBooking}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}
