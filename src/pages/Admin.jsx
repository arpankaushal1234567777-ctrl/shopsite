import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import Reveal from "../components/Reveal.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import Card from "../components/Card.jsx";
import { supabase } from "../lib/supabase.js";
import { services } from "../data/content.js";

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
  const serviceOptions = useMemo(() => services.map((service) => service.title), []);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyAppointmentId, setBusyAppointmentId] = useState("");
  const [searchValue, setSearchValue] = useState("");
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

    loadAppointments();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadGalleryFiles() {
      setIsLoadingGallery(true);

      const bucketName = "gallery";
      const folderPath = "";
      const { data, error } = await supabase.storage.from(bucketName).list(folderPath, {
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });

      console.log("Admin gallery list() bucket:", bucketName);
      console.log("Admin gallery list() path:", folderPath);
      console.log("Admin gallery list() raw response:", data);

      if (!isActive) {
        return;
      }

      if (error) {
        console.error("Failed to fetch gallery files:", error);
        setGalleryFiles([]);
        setIsLoadingGallery(false);
        return;
      }

      const nextFiles = (data ?? [])
        .filter((item) => item.name && !item.name.endsWith("/"))
        .map((item) => {
          const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(item.name);

          console.log("Admin gallery public URL:", item.name, publicUrlData.publicUrl);

          return {
            name: item.name,
            url: publicUrlData.publicUrl,
          };
        });

      console.log("Fetched admin gallery images:", nextFiles);
      setGalleryFiles(nextFiles);
      setIsLoadingGallery(false);
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

    const { error } = await supabase.storage.from("gallery").upload(fileName, file);

    if (error) {
      console.error("Failed to upload gallery image:", error);
      alert("Something went wrong");
      setIsUploadingGallery(false);
      e.target.value = "";
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("gallery")
      .getPublicUrl(fileName);

    setGalleryFiles((prev) => [
      { name: fileName, url: publicUrlData.publicUrl },
      ...prev,
    ]);
    alert("Gallery image uploaded successfully");
    setIsUploadingGallery(false);
    e.target.value = "";
  }

  async function deleteGalleryImage(fileName) {
    const confirmed = window.confirm("Delete this gallery image?");
    if (!confirmed) {
      return;
    }

    setBusyGalleryFileName(fileName);

    const { error } = await supabase.storage.from("gallery").remove([fileName]);

    if (error) {
      console.error("Failed to delete gallery image:", error);
      alert("Something went wrong");
      setBusyGalleryFileName("");
      return;
    }

    console.log("Deleted gallery image:", fileName);
    setGalleryFiles((prev) => prev.filter((file) => file.name !== fileName));
    setBusyGalleryFileName("");
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
              <p className="mt-6 text-sm text-beige/65">Loading gallery images...</p>
            ) : galleryFiles.length === 0 ? (
              <p className="mt-6 text-sm text-beige/65">
                No uploaded gallery images yet.
              </p>
            ) : (
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {galleryFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="group relative overflow-hidden rounded-2xl border border-beige/10 bg-beige/5"
                  >
                    <img
                      src={file.url}
                      alt={file.name}
                      className="h-40 w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.02] group-hover:opacity-100"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-80" />
                    <p className="absolute bottom-3 left-3 right-3 truncate text-xs text-beige/90">
                      {file.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => deleteGalleryImage(file.name)}
                      disabled={busyGalleryFileName === file.name}
                      className="absolute right-3 top-3 rounded-full border border-red-400/20 bg-red-500/80 px-3 py-1 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busyGalleryFileName === file.name ? "..." : "Delete"}
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
