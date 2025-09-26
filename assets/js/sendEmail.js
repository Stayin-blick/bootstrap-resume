const API_BASE = 'https://portfolio-api.crypto-dev-blick.workers.dev';

(function () {
  const form   = document.getElementById('contact');
  const btn    = document.getElementById('sendBtn');
  const status = document.getElementById('status');

  if (!form) return;

  function setStatus(msg) { status.textContent = msg; }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name    = document.getElementById('fullname').value.trim();
    const email   = document.getElementById('emailaddress').value.trim();
    const message = document.getElementById('projectsummary').value.trim();
    const website = document.getElementById('website').value.trim(); // honeypot

    if (!name || !email || !message) {
      setStatus('❌ Please fill in all required fields.');
      return;
    }

    btn.disabled = true;
    setStatus('Sending…');

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, website })
      });

      if (!res.ok) throw new Error('Server error');
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        setStatus('✅ Message sent! I’ll get back to you soon.');
        form.reset();
      } else {
        setStatus('❌ Could not send right now. Please try again in a moment.');
      }
    } catch (err) {
      setStatus('❌ Network error. Please try again.');
    } finally {
      btn.disabled = false;
    }
  });
})();