// Simple countdown + form UI helper for the coming soon page.
// Customize `LAUNCH_DATE` to your planned launch date/time (ISO 8601).
const LAUNCH_DATE = "2026-02-14T09:00:00Z"; // change this!

function updateCountdown() {
  const target = new Date(LAUNCH_DATE).getTime();
  const now = Date.now();
  const diff = Math.max(0, target - now);

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  document.getElementById("days").textContent = String(days).padStart(2, "0");
  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
  document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");

  if (diff === 0) {
    clearInterval(timerInterval);
    document.getElementById("countdown").innerHTML = "<div class='launched'>We're live — welcome!</div>";
  }
}

const timerInterval = setInterval(updateCountdown, 1000);
updateCountdown();

// Form handling: no backend by default. If action is empty, fall back to mailto as a convenience.
const form = document.getElementById("signup-form");
const formMsg = document.getElementById("form-msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formMsg.textContent = "";

  const email = (document.getElementById("email").value || "").trim();
  if (!email || !/.+@.+\..+/.test(email)) {
    formMsg.textContent = "Please enter a valid email.";
    return;
  }

  const action = form.getAttribute("action") || "";
  if (!action) {
    // fallback: open mail client (user will need to send)
    const subject = encodeURIComponent("Subscribe: Indinklabs early access");
    const body = encodeURIComponent(`Please add ${email} to the launch list.`);
    window.location.href = `mailto:hello@indinklabs.com?subject=${subject}&body=${body}`;
    formMsg.textContent = "Opening your email client — send to subscribe, or configure a form endpoint in README.";
    return;
  }

  // If user set an action, try a POST fetch (works with Formspree, Netlify, or custom endpoint).
  try {
    const resp = await fetch(action, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ email })
    });
    if (resp.ok) {
      formMsg.textContent = "Thanks — you'll be the first to know!";
      form.reset();
    } else {
      const text = await resp.text();
      formMsg.textContent = "Submission failed. Try again or configure your form endpoint.";
      console.warn("Form submission error:", resp.status, text);
    }
  } catch (err) {
    console.error(err);
    formMsg.textContent = "Submission error. Check console and your endpoint configuration.";
  }
});