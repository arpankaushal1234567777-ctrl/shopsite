import { useEffect, useMemo, useState } from "react";
import Button from "../components/Button.jsx";
import Reveal from "../components/Reveal.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import Card from "../components/Card.jsx";
import { services as fallbackServices } from "../data/content.js";
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

const initialForm = (defaultService) => ({
  name: "",
  phone: "",
  service: defaultService,
  date: "",
  time: "",
});

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

export default function BookAppointment() {
  const [services, setServices] = useState(fallbackServices);
  const serviceOptions = useMemo(() => services.map((s) => s.title), [services]);
  const defaultService = serviceOptions[0] ?? "Haircut";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [availableSlots, setAvailableSlots] = useState(timeSlots);
  const [form, setForm] = useState(initialForm(defaultService));
  const [whatsappLink, setWhatsappLink] = useState(null);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    let isActive = true;

    async function loadServices() {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, description")
        .order("created_at", { ascending: true });

      if (!isActive || error) {
        if (error) {
          console.error("Failed to fetch booking services:", error);
        }
        return;
      }

      const nextServices =
        (data ?? []).length > 0
          ? data.map((service) => ({
              id: service.id,
              title: service.name,
              desc: service.description,
            }))
          : fallbackServices;

      setServices(nextServices);
      setForm((prev) => ({
        ...prev,
        service:
          prev.service && nextServices.some((service) => service.title === prev.service)
            ? prev.service
            : nextServices[0]?.title ?? "Haircut",
      }));
    }

    loadServices();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadAvailableSlots() {
      if (!form.date) {
        setAvailableSlots(timeSlots);
        return;
      }

      setIsLoadingSlots(true);
      setForm((prev) => ({ ...prev, time: "" }));

      const { data, error } = await supabase
        .from("appointments")
        .select("time")
        .eq("date", form.date);

      if (!isActive) {
        return;
      }

      if (error) {
        console.error("Failed to fetch appointment slots:", error);
        setAvailableSlots(timeSlots);
        setIsLoadingSlots(false);
        return;
      }

      const bookedSlots = new Set((data ?? []).map((item) => normalizeTimeSlot(item.time)));
      const nextAvailableSlots = timeSlots.filter((slot) => !bookedSlots.has(slot));

      setAvailableSlots(nextAvailableSlots);
      setIsLoadingSlots(false);
    }

    loadAvailableSlots();

    return () => {
      isActive = false;
    };
  }, [form.date]);

  async function onSubmit(e) {
    e.preventDefault();

    const normalizedSelectedTime = normalizeTimeSlot(form.time);
    if (!normalizedSelectedTime) {
      return;
    }

    setIsSubmitting(true);
    setWhatsappLink(null);

    const { data: existingAppointments, error: existingAppointmentsError } = await supabase
      .from("appointments")
      .select("time")
      .eq("date", form.date)
      .eq("time", normalizedSelectedTime);

    if (existingAppointmentsError) {
      console.error("Supabase availability check failed:", existingAppointmentsError);
      alert("Something went wrong");
      setIsSubmitting(false);
      return;
    }

    if ((existingAppointments ?? []).length > 0) {
      alert("This time slot is already booked. Please choose another.");
      setIsSubmitting(false);
      return;
    }

    const { data, error } = await supabase.from("appointments").insert([
      {
        name: form.name,
        phone: form.phone,
        service: form.service,
        date: form.date,
        time: normalizedSelectedTime,
      },
    ]);

    if (error) {
      console.error("Supabase insert failed:", error);
      alert("Something went wrong");
      setIsSubmitting(false);
      return;
    }

    console.log("Appointment booked:", data);
    alert("Appointment booked successfully!");
    const message = `New Appointment Request:
Name: ${form.name}
Phone: ${form.phone}
Service: ${form.service}
Date: ${form.date}
Time: ${normalizedSelectedTime}`;
    const whatsappUrl = `https://wa.me/917505519340?text=${encodeURIComponent(message)}`;
    setWhatsappLink(whatsappUrl);

    setTimeout(() => {
      window.open(whatsappUrl, "_blank");
    }, 500);
    setForm(initialForm(defaultService));
    setAvailableSlots(timeSlots);
    setIsSubmitting(false);
  }

  return (
    <div className="py-8 xs:py-10 sm:py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 xs:gap-6 flex-wrap">
          <SectionHeading
            eyebrow="Book"
            title="Book an appointment"
            subtitle="Reserve your preferred service and time in a few taps."
          />
          <Button as="link" to="/services" variant="ghost" className="shrink-0">
            Browse Services
          </Button>
        </div>

        <div className="mt-8 xs:mt-10 grid gap-4 xs:gap-6 lg:grid-cols-12 lg:items-start">
          <Reveal className="lg:col-span-7">
            <Card className="p-4 xs:p-6 sm:p-8">
              <form className="grid gap-4 xs:gap-5" onSubmit={onSubmit}>
                <label className="grid gap-1.5 xs:gap-2">
                  <span className="text-xs xs:text-sm text-beige/70">Name</span>
                  <input
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    disabled={isSubmitting}
                    className="h-11 xs:h-12 rounded-lg xs:rounded-xl bg-ink border border-beige/15 px-3 xs:px-4 text-beige placeholder:text-beige/40 focus:outline-none focus:ring-2 focus:ring-gold/50 text-sm"
                    placeholder="Your name"
                    required
                  />
                </label>

                <label className="grid gap-1.5 xs:gap-2">
                  <span className="text-xs xs:text-sm text-beige/70">Phone number</span>
                  <input
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    disabled={isSubmitting}
                    className="h-11 xs:h-12 rounded-lg xs:rounded-xl bg-ink border border-beige/15 px-3 xs:px-4 text-beige placeholder:text-beige/40 focus:outline-none focus:ring-2 focus:ring-gold/50 text-sm"
                    placeholder="+91..."
                    required
                  />
                </label>

                <div className="grid gap-3 xs:gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5 xs:gap-2">
                    <span className="text-xs xs:text-sm text-beige/70">
                      Service
                    </span>
                    <select
                      value={form.service}
                      onChange={(e) => update("service", e.target.value)}
                      disabled={isSubmitting}
                      className="h-11 xs:h-12 rounded-lg xs:rounded-xl bg-ink border border-beige/15 px-3 xs:px-4 text-beige focus:outline-none focus:ring-2 focus:ring-gold/50 text-sm"
                    >
                      {serviceOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1.5 xs:gap-2">
                    <span className="text-xs xs:text-sm text-beige/70">Date</span>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => update("date", e.target.value)}
                      disabled={isSubmitting}
                      className="h-11 xs:h-12 rounded-lg xs:rounded-xl bg-ink border border-beige/15 px-3 xs:px-4 text-beige focus:outline-none focus:ring-2 focus:ring-gold/50 text-sm"
                      required
                    />
                  </label>
                </div>

                <label className="grid gap-1.5 xs:gap-2">
                  <span className="text-xs xs:text-sm text-beige/70">Time</span>
                  <select
                    value={form.time}
                    onChange={(e) => update("time", e.target.value)}
                    disabled={isSubmitting || isLoadingSlots || !form.date || availableSlots.length === 0}
                    className="h-11 xs:h-12 rounded-lg xs:rounded-xl bg-ink border border-beige/15 px-3 xs:px-4 text-beige focus:outline-none focus:ring-2 focus:ring-gold/50 text-sm"
                    required
                  >
                    <option value="">
                      {!form.date
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

                {form.date && !isLoadingSlots && availableSlots.length === 0 ? (
                  <p className="text-sm text-beige/70">
                    No slots available for this date
                  </p>
                ) : null}

                <div className="pt-2 flex items-center justify-between gap-4 flex-wrap">
                  <p className="text-xs text-beige/55">
                    By submitting, you agree to be contacted about your booking.
                  </p>
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      isLoadingSlots ||
                      !form.date ||
                      !form.time ||
                      availableSlots.length === 0
                    }
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>

                {whatsappLink ? (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-medium text-ink transition hover:brightness-110 active:brightness-95 shadow-glow sm:w-auto"
                  >
                    Continue on WhatsApp
                  </a>
                ) : null}
              </form>
            </Card>
          </Reveal>

          <Reveal delayMs={120} className="lg:col-span-5">
            <div className="glass rounded-3xl p-8">
              <p className="text-xs uppercase tracking-[0.25em] text-gold/80">
                Tips
              </p>
              <p className="mt-3 font-display text-2xl">
                A smoother appointment
              </p>
              <div className="mt-5 grid gap-3 text-beige/70">
                <p>Choose a service and preferred slot.</p>
                <p>We’ll confirm availability via phone or WhatsApp.</p>
                <p>Your request is saved instantly after submission.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
