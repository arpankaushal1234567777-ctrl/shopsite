import { useEffect, useMemo, useState } from "react";
import Reveal from "../components/Reveal.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import Card from "../components/Card.jsx";
import { supabase } from "../lib/supabase.js";

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
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyAppointmentId, setBusyAppointmentId] = useState("");

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

  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Admin"
          title="Admin Dashboard"
          subtitle="View the latest appointment requests in one place."
        />

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
          <Card className="overflow-hidden">
            <div className="border-b border-beige/10 px-6 py-5">
              <p className="font-display text-2xl text-beige">Appointments</p>
              <p className="mt-1 text-sm text-beige/65">
                Latest bookings appear first.
              </p>
            </div>

            {isLoading ? (
              <div className="px-6 py-12 text-center text-beige/75">Loading...</div>
            ) : rows.length === 0 ? (
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
                      {rows.map((appointment) => (
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
      </div>
    </div>
  );
}
