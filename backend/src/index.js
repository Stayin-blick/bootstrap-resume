export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		// Email endpoint
		if (url.pathname === "/api/contact" && request.method === "POST") {
			try {
				const { name, email, message, website } = await request.json();

				// Honeypot anti-spam field
				if (website) {
					return new Response("Spam detected", { status: 400 });
				}

				// Send email via Brevo API
				const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
					method: "POST",
					headers: {
						"accept": "application/json",
						"content-type": "application/json",
						"api-key": env.BREVO_API_KEY,
					},
					body: JSON.stringify({
						sender: { email: env.FROM_EMAIL },
						to: [{ email: env.TO_EMAIL }],
						subject: `New message from ${name}`,
						htmlContent: `<p><b>From:</b> ${name} (${email})</p><p>${message}</p>`,
					}),
				});

				if (!brevoRes.ok) {
					return new Response("Failed to send email", { status: 500 });
				}

				return new Response("Message sent ✅", { status: 200 });
			} catch (err) {
				return new Response("Error handling request", { status: 400 });
			}
		}

		// Default response
		return new Response("Backend is running ✅", { status: 200 });
	},
};