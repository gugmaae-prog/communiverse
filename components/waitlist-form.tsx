"use client";

import { FormEvent, useState } from "react";
import { contactPage } from "@/data/pages";
import { publicUrl } from "@/lib/public-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Values = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type FieldName = keyof Values;

const empty: Values = { name: "", email: "", subject: "", message: "" };
const limits: Record<FieldName, { min: number; max: number }> = {
  name: { min: 1, max: 120 },
  email: { min: 3, max: 254 },
  subject: { min: 0, max: 160 },
  message: { min: 8, max: 4000 },
};

function lengthError(key: FieldName, value: string) {
  const { min, max } = limits[key];
  const trimmed = value.trim();
  if (trimmed.includes("\u0000")) return "Remove the invalid character and try again.";
  const count = [...trimmed].length;
  if (count < min || trimmed.length > max) {
    if (key === "name") return "Enter your name.";
    if (key === "message" && count === 0) return "Tell us a little about you.";
    if (key === "message") return "Add a few more words so we know who you are.";
    return `Please enter ${min}–${max} characters.`;
  }
  return "";
}

export function WaitlistForm() {
  const [values, setValues] = useState<Values>(empty);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Partial<Values>>({});
  const [formError, setFormError] = useState("");
  const [reference, setReference] = useState("");
  const [sending, setSending] = useState(false);

  function validate(next: Values) {
    const found: Partial<Values> = {};
    (Object.keys(limits) as FieldName[]).forEach((key) => {
      if (key === "subject") return;
      const message = lengthError(key, next[key]);
      if (message) found[key] = message;
    });
    const subject = next.subject.trim();
    if (subject.includes("\u0000")) found.subject = "Remove the invalid character and try again.";
    else if (subject.length > limits.subject.max) found.subject = `Keep the subject under ${limits.subject.max} characters.`;
    if (!next.email.trim()) found.email = "Enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email.trim())) found.email = "Enter a valid email.";
    return found;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setFormError(Object.values(found)[0] || "Check the highlighted fields.");
      return;
    }
    setFormError("");
    if (website.trim()) {
      setFormError("Check the form and try again.");
      return;
    }

    setSending(true);
    try {
      const response = await fetch(publicUrl("/api/waitlist"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          subject: values.subject.trim(),
          message: values.message.trim(),
          website: "",
          requestId: crypto.randomUUID(),
        }),
      });
      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        reference?: string;
        error?: string;
        errors?: Partial<Values>;
      } | null;
      if (response.ok && payload?.ok && payload.reference) {
        setReference(payload.reference);
        return;
      }
      if (payload?.errors) setErrors(payload.errors);
      setFormError(payload?.error || "We could not save your request. Please try again.");
    } catch {
      setFormError("We could not reach the waitlist. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  if (reference) {
    return (
      <div className="border border-black/15 bg-paper px-6 py-10" role="status">
        <p className="font-serif text-[22px] font-medium leading-snug">You’re on the list. We’ll be in touch.</p>
        <p className="mt-3 max-w-md text-sm text-muted">
          Your request was saved. Keep this reference if you need to write to us: {reference}
        </p>
      </div>
    );
  }

  return (
    <form id="contact" onSubmit={onSubmit} noValidate className="waitlist-form">
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>
      {contactPage.fields.map((field, index) => {
        const key = field.name as FieldName;
        const error = errors[key];
        const limit = limits[key];
        return (
          <div key={field.name} className={`waitlist-row waitlist-row-${index + 1}`}>
            <Label htmlFor={field.name} className="sr-only">
              {field.label}
            </Label>
            {field.type === "textarea" ? (
              <Textarea
                id={field.name}
                name={field.name}
                required={field.required}
                placeholder={field.placeholder}
                value={values[key]}
                maxLength={limit.max}
                aria-invalid={Boolean(error)}
                onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
              />
            ) : (
              <Input
                id={field.name}
                name={field.name}
                type={field.type}
                required={field.required}
                placeholder={field.placeholder}
                value={values[key]}
                maxLength={limit.max}
                aria-invalid={Boolean(error)}
                autoComplete={field.name === "email" ? "email" : field.name === "name" ? "name" : "off"}
                onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
              />
            )}
            {error ? <p className="waitlist-error text-sm text-red-700">{error}</p> : null}
          </div>
        );
      })}
      {formError ? (
        <p className="waitlist-status text-sm text-red-700" role="alert">
          {formError}
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={sending}
        className="waitlist-submit h-12 w-full rounded-full text-base font-medium tracking-normal"
      >
        {sending ? "Sending…" : contactPage.submit}
      </Button>
    </form>
  );
}
