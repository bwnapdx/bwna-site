type FormspreeError = { field?: string; message: string };

const successDefaults: Record<string, string> = {
  contact: "Thanks — we got your message and will be in touch soon.",
  volunteer: "Thanks for reaching out! We'll match you with opportunities as they come up.",
};

document.querySelectorAll<HTMLFormElement>("form[data-formspree]").forEach((form) => {
  const key = form.dataset.formspree ?? "";
  const status = form.querySelector<HTMLElement>("[data-form-status]");
  const button = form.querySelector<HTMLButtonElement>("button[type=submit]");
  if (!status || !button) return;

  const setStatus = (text: string, variant: "sending" | "success" | "error") => {
    status.textContent = text;
    status.className = `form-status form-status--${variant}`;
    status.hidden = false;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    button.disabled = true;
    setStatus("Sending…", "sending");

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        form.reset();
        setStatus(successDefaults[key] ?? "Thanks — your message was sent.", "success");
        return;
      }

      const json = (await response.json().catch(() => ({}))) as { errors?: FormspreeError[] };
      const message = json.errors?.map((e) => e.message).join(", ");
      setStatus(message || "Something went wrong. Please try again or email us directly.", "error");
    } catch {
      setStatus("Network error. Please try again or email us directly.", "error");
    } finally {
      button.disabled = false;
    }
  });
});
