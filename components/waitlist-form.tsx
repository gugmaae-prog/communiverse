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
    if (!next.subject.trim()) found.subject = "Enter a subject.";
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
      <div className="border border-black/15 bg-paper px-6 py-10" role="status">
        <p className="font-serif text-[22px] font-medium leading-snug">
          You’re on the list. We’ll be in touch.
        </p>
        <p className="mt-3 max-w-md text-sm text-muted">
          This form stays on your device. Nothing was sent.
        </p>
      </div>
    );
  }

  return (
    <form id="contact" onSubmit={onSubmit} noValidate className="waitlist-form">
      {contactPage.fields.map((field, index) => {
        const key = field.name as keyof Values;
        const error = errors[key];
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
                aria-invalid={Boolean(error)}
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
                autoComplete={field.name === "email" ? "email" : field.name === "name" ? "name" : "off"}
                onChange={(event) =>
                  setValues((current) => ({ ...current, [key]: event.target.value }))
                }
              />
            )}
            {error ? <p className="waitlist-error text-sm text-red-700">{error}</p> : null}
          </div>
        );
      })}
      <Button type="submit" className="waitlist-submit h-12 w-full rounded-full text-base font-medium tracking-normal">
        {contactPage.submit}
      </Button>
    </form>
  );
}
