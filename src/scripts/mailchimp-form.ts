function wireForm(form: HTMLFormElement) {
  const successId = form.dataset.mailchimp;
  if (!successId) return;
  const success = document.getElementById(successId);
  if (!success) return;

  const wrapper = (form.closest(".card") as HTMLElement | null) ?? form;

  form.addEventListener("submit", () => {
    if (!form.checkValidity()) return;
    wrapper.hidden = true;
    success.hidden = false;
    if (!success.hasAttribute("tabindex")) success.tabIndex = -1;
    success.focus({ preventScroll: false });
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

document
  .querySelectorAll<HTMLFormElement>("form[data-mailchimp]")
  .forEach(wireForm);
