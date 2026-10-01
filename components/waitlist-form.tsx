"use client";

import { FormEvent, useState } from "react";
import { contactPage } from "@/data/pages";
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

const empty: Values = { name: "", email: "", subject: "", message: "" };

export function WaitlistForm() {
  const [values, setValues] = useState<Values>(empty);
  const [errors, setErrors] = useState<Partial<Values>>({});
  const [done, setDone] = useState(false);

  function validate(next: Values) {
    const found: Partial<Values> = {};
    if (!next.name.trim()) found.name = "Enter your name.";
    if (!next.email.trim()) found.email = "Enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email)) found.email = "Enter a valid email.";
    if (!next.message.trim()) found.message = "Tell us a little about you.";
    else if (next.message.trim().length < 8) found.message = "Add a few more words so we know who you are.";
    return found;
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    // TODO: POST the waitlist payload to the Communiverse backend.
    // Do not send this anywhere until that endpoint exists.
    setDone(true);
  }

  if (done) {
    return (
      <div className="border border-white/15 px-6 py-10" role="status">
        <p className="font-serif text-[22px] font-medium leading-snug text-[#f5f4f1]">
          You’re on the list. We’ll be in touch.
        </p>
        <p className="mt-3 max-w-md text-sm text-[#f5f4f1]/70">
          This form stays on your device. Nothing was sent.
        </p>
      </div>
    );
  }

  return (
    <form id="contact" onSubmit={onSubmit} noValidate className="grid gap-6">
      {contactPage.fields.map((field) => {
        const key = field.name as keyof Values;
        const error = errors[key];
        return (
          <div key={field.name} className="grid gap-2">
            <Label htmlFor={field.name} className="text-xs uppercase tracking-[0.14em] text-[#f5f4f1]/60">
              {field.label}
            </Label>
            {field.type === "textarea" ? (
              <Textarea
                id={field.name}
                name={field.name}
                required={field.required}
                placeholder={field.placeholder}
                value={values[key]}
                aria-invalid={Boolean(error)}
                className="border-b border-white/20 text-[#f5f4f1] placeholder:text-[#f5f4f1]/35"
                onChange={(event) =>
                  setValues((current) => ({ ...current, [key]: event.target.value }))
                }
              />
            ) : (
              <Input
                id={field.name}
                name={field.name}
                type={field.type}
                required={field.required}
                placeholder={field.placeholder}
                value={values[key]}
                aria-invalid={Boolean(error)}
                className="border-b border-white/20 text-[#f5f4f1] placeholder:text-[#f5f4f1]/35"
                autoComplete={field.name === "email" ? "email" : field.name === "name" ? "name" : "off"}
                onChange={(event) =>
                  setValues((current) => ({ ...current, [key]: event.target.value }))
                }
              />
            )}
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
          </div>
        );
      })}
      <p className="text-sm leading-6 text-[#f5f4f1]/60">
        We’ll use your details to respond to your request. To ask for their removal, email hello@communiverseclubs.com.
      </p>
      <Button type="submit" className="h-12 w-full rounded-full bg-[#f5f4f1] text-[#121814] hover:bg-white">
        {contactPage.submit} <span aria-hidden>↗</span>
      </Button>
    </form>
  );
}
