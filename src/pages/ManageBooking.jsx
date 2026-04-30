import { useEffect, useMemo, useState } from "react";
import Button from "../components/Button.jsx";
import Reveal from "../components/Reveal.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import Card from "../components/Card.jsx";
import { supabase } from "../lib/supabase.js";

const timeSlots = [
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
];

function normalizeTimeSlot(value) {
  if (!value) {
    return "";
  }

  if (timeSlots.includes(value)) {
    return value;
  }

  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) {
    return value;
  }

  const hours24 = Number(match[1]);
  const minutes = match[2];
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;

  return `${hours12}:${minutes} ${period}`;
}

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

function getStatusClasses(status) {
  if (status === "completed") {
    return "border border-emerald-500/25 bg-emerald-500/15 text-emerald-200";
  }

  return "border border-yellow-500/25 bg-yellow-500/15 text-yellow-200";
}

export default function ManageBooking() {
  const [phone, setPhone] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [busyAppointmentId, setBusyAppointmentId] = useState("");
  const [rescheduleId, setRescheduleId] = useState("");
  const [rescheduleForm, setRescheduleForm] = useState({ date: "", time: "" });
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [availableSlots, setAvailableSlots] = useState(timeSlots);

  const rows = useMemo(
    () =>
      appointments.map((appointment, index) => ({
        ...appointment,
        id: appointment.id ?? `${appointment.created_at ?? "booking"}-${index}`,
        status: appointment.status ?? "pending",
        time: normalizeTimeSlot(appointment.time),
      })),
    [appointments],
  );

  useEffect(() => {
    let isActive = true;

    async function loadAvailableSlots() {
      if (!rescheduleId || !rescheduleForm.date) {
        setAvailableSlots(timeSlots);
        return;
      }

      const selectedAppointment = rows.find((appointment) => appointment.id === rescheduleId);
      if (!selectedAppointment) {
        setAvailableSlots(timeSlots);
        return;
      }

      setIsLoadingSlots(true);

      const { data, error } = await supabase
        .from("appointments")
        .select("id, time")
        .eq("date", rescheduleForm.date);

      if (!isActive) {
        return;
      }

      if (error) {
        console.error("Failed to fetch available slots:", error);
        setAvailableSlots(timeSlots);
        setIsLoadingSlots(false);
        return;
      }

      const bookedSlots = new Set(
        (data ?? [])
          .filter((item) => item.id !== selectedAppointment.id)
          .map((item) => normalizeTimeSlot(item.time)),
      );

      const nextAvailableSlots = timeSlots.filter((slot) => !bookedSlots.has(slot));
      const selectedCurrentSlot = normalizeTimeSlot(selectedAppointment.time);

      if (
        selectedAppointment.date === rescheduleForm.date &&
        selectedCurrentSlot &&
        !nextAvailableSlots.includes(selectedCurrentSlot)
      ) {
        nextAvailableSlots.push(selectedCurrentSlot);
      }

      nextAvailableSlots.sort((left, right) => timeSlots.indexOf(left) - timeSlots.indexOf(right));
      setAvailableSlots(nextAvailableSlots);
      setIsLoadingSlots(false);
    }

    loadAvailableSlots();

    return () => {
      isActive = false;
    };
  }, [rescheduleForm.date, rescheduleId, rows]);

  async function fetchBookings(e) {
    e.preventDefault();
    setIsLoading(true);
    setSearchPhone(phone.trim());

    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("phone", phone.trim())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch bookings:", error);
      alert("Something went wrong");
      setAppointments([]);
      setIsLoading(false);
      return;
    }

    setAppointments(data ?? []);
    setIsLoading(false);
  }

  async function cancelBooking(id) {
    const confirmed = window.confirm("Cancel this booking?");
    if (!confirmed) {
      return;
    }

    setBusyAppointmentId(id);
    const { error } = await supabase.from("appointments").delete().eq("id", id);

    if (error) {
      console.error("Failed to cancel booking:", error);
      alert("Something went wrong");
      setBusyAppointmentId("");
      return;
    }

    setAppointments((prev) => prev.filter((appointment) => appointment.id !== id));
    if (rescheduleId === id) {
      setRescheduleId("");
      setRescheduleForm({ date: "", time: "" });
      setAvailableSlots(timeSlots);
    }
    alert("Booking cancelled successfully");
    setBusyAppointmentId("");
  }

  function startReschedule(appointment) {
    setRescheduleId(appointment.id);
    setRescheduleForm({
      date: appointment.date ?? "",
      time: normalizeTimeSlot(appointment.time),
    });
  }

  function stopReschedule() {
    setRescheduleId("");
    setRescheduleForm({ date: "", time: "" });
    setAvailableSlots(timeSlots);
  }

  async function saveReschedule(id) {
    const normalizedSelectedTime = normalizeTimeSlot(rescheduleForm.time);
    if (!rescheduleForm.date || !normalizedSelectedTime) {
      return;
    }

    setBusyAppointmentId(id);

    const { data: existingAppointments, error: existingAppointmentsError } = await supabase
      .from("appointments")
      .select("id, time")
      .eq("date", rescheduleForm.date)
      .eq("time", normalizedSelectedTime);

    if (existingAppointmentsError) {
      console.error("Failed to check slot availability:", existingAppointmentsError);
      alert("Something went wrong");
      setBusyAppointmentId("");
      return;
    }

    const hasConflict = (existingAppointments ?? []).some((appointment) => appointment.id !== id);
    if (hasConflict) {
      alert("This time slot is already booked. Please choose another.");
      setBusyAppointmentId("");
      return;
    }

    const { error } = await supabase
      .from("appointments")
      .update({
        date: rescheduleForm.date,
        time: normalizedSelectedTime,
      })
      .eq("id", id);

    if (error) {
      console.error("Failed to reschedule booking:", error);
      alert("Something went wrong");
      setBusyAppointmentId("");
      return;
    }

    setAppointments((prev) =>
      prev.map((appointment) =>
        appointment.id === id
          ? { ...appointment, date: rescheduleForm.date, time: normalizedSelectedTime }
          : appointment,
      ),
    );
    alert("Booking rescheduled successfully");
    setBusyAppointmentId("");
    stopReschedule();
  }

  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <SectionHeading
            eyebrow="Manage"
            title="Manage Booking"
            subtitle="View, cancel, or reschedule your appointments using your phone number."
          />
          <Button as="link" to="/book" variant="ghost" className="shrink-0">
            Book New Appointment
          </Button>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-12 lg:items-start">
          <Reveal className="lg:col-span-5">
            <Card className="p-8">
              <p className="font-display text-2xl">Find your bookings</p>
              <form className="mt-6 grid gap-4" onSubmit={fetchBookings}>
                <label className="grid gap-2">
                  <span className="text-sm text-beige/70">Phone number</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-12 rounded-xl bg-ink border border-beige/15 px-4 text-beige placeholder:text-beige/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
                    placeholder="+91..."
                    required
                  />
                </label>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Searching..." : "View Bookings"}
                </Button>
              </form>
            </Card>
          </Reveal>

          <Reveal delayMs={120} className="lg:col-span-7">
            <div className="grid gap-4">
              {!searchPhone && !isLoading ? (
                <Card className="p-8">
                  <p className="font-display text-2xl">Your appointments</p>
                  <p className="mt-3 text-beige/70">
                    Enter your phone number to see upcoming or past bookings.
                  </p>
                </Card>
              ) : null}

              {searchPhone && !isLoading && rows.length === 0 ? (
                <Card className="p-8">
                  <p className="font-display text-2xl">No bookings found</p>
                  <p className="mt-3 text-beige/70">
                    We could not find any appointments for {searchPhone}.
                  </p>
                </Card>
              ) : null}

              {rows.map((appointment) => {
                const isBusy = busyAppointmentId === appointment.id;
                const isEditing = rescheduleId === appointment.id;

                return (
                  <Card key={appointment.id} className="p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="grid gap-3">
                        <div>
                          <p className="font-display text-2xl text-beige">
                            {appointment.name || "Guest"}
                          </p>
                          <p className="mt-1 text-sm text-beige/60">
                            {appointment.phone || "-"}
                          </p>
                        </div>
                        <div className="grid gap-2 text-sm text-beige/75 sm:grid-cols-2">
                          <p>Service: {appointment.service || "-"}</p>
                          <p>Date: {formatBookingDate(appointment.date)}</p>
                          <p>Time: {appointment.time || "-"}</p>
                          <p>
                            Status:{" "}
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusClasses(appointment.status)}`}
                            >
                              {appointment.status}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startReschedule(appointment)}
                          disabled={isBusy}
                          className="inline-flex items-center justify-center rounded-full border border-beige/20 bg-beige/5 px-4 py-2 text-sm font-medium text-beige transition hover:border-gold/40 hover:bg-beige/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Reschedule
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelBooking(appointment.id)}
                          disabled={isBusy}
                          className="inline-flex items-center justify-center rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition hover:border-red-300/40 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isBusy ? "Please wait..." : "Cancel"}
                        </button>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="mt-6 grid gap-4 rounded-2xl border border-beige/10 bg-ink/60 p-5 sm:grid-cols-2">
                        <label className="grid gap-2">
                          <span className="text-sm text-beige/70">New date</span>
                          <input
                            type="date"
                            value={rescheduleForm.date}
                            onChange={(e) =>
                              setRescheduleForm({ date: e.target.value, time: "" })
                            }
                            disabled={isBusy}
                            className="h-12 rounded-xl bg-ink border border-beige/15 px-4 text-beige focus:outline-none focus:ring-2 focus:ring-gold/50"
                          />
                        </label>

                        <label className="grid gap-2">
                          <span className="text-sm text-beige/70">New time</span>
                          <select
                            value={rescheduleForm.time}
                            onChange={(e) =>
                              setRescheduleForm((prev) => ({ ...prev, time: e.target.value }))
                            }
                            disabled={
                              isBusy ||
                              isLoadingSlots ||
                              !rescheduleForm.date ||
                              availableSlots.length === 0
                            }
                            className="h-12 rounded-xl bg-ink border border-beige/15 px-4 text-beige focus:outline-none focus:ring-2 focus:ring-gold/50"
                          >
                            <option value="">
                              {!rescheduleForm.date
                                ? "Select a date first"
                                : isLoadingSlots
                                  ? "Loading available slots..."
                                  : availableSlots.length === 0
                                    ? "No slots available"
                                    : "Select a time slot"}
                            </option>
                            {availableSlots.map((slot) => (
                              <option key={slot} value={slot}>
                                {slot}
                              </option>
                            ))}
                          </select>
                        </label>

                        {rescheduleForm.date && !isLoadingSlots && availableSlots.length === 0 ? (
                          <p className="text-sm text-beige/70 sm:col-span-2">
                            No slots available for this date
                          </p>
                        ) : null}

                        <div className="flex flex-wrap gap-2 sm:col-span-2">
                          <Button
                            type="button"
                            onClick={() => saveReschedule(appointment.id)}
                            disabled={
                              isBusy ||
                              isLoadingSlots ||
                              !rescheduleForm.date ||
                              !rescheduleForm.time ||
                              availableSlots.length === 0
                            }
                          >
                            {isBusy ? "Saving..." : "Save Changes"}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={stopReschedule}
                            disabled={isBusy}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </Card>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
