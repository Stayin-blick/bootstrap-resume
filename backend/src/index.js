export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		// CORS (Access-Control-Allow-Origin)
		const ORIGIN = env.ALLOW_ORIGIN || "*"; // use "*" for now, lock down later
		const corsHeaders = {
			"Access-Control-Allow-Origin": ORIGIN,
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type"
		};

		// Handle preflight request
		if (request.method === "OPTIONS") {
			return new Response(null, { headers: corsHeaders });
		}

		// Handle contact form POST
		if (url.pathname === "/api/contact" && request.method === "POST") {
			try {
				const { name, email, message, website = "" } = await request.json();

				// Validate required fields
				if (!name || !email || !message) {
					return new Response(
						JSON.stringify({ error: "Missing required fields" }),
						{ status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
					);
				}

				// Honeypot check (bots fill hidden "website" field)
				if (website) {
					return new Response(JSON.stringify({ ok: true }), {
						headers: { ...corsHeaders, "Content-Type": "application/json" }
					});
				}

				// Email payload for Brevo
				const payload = {
					sender: { email: env.FROM_EMAIL, name: "Portfolio" },
					to: [{ email: env.TO_EMAIL, name: "Azeez Bello" }],
					replyTo: { email, name }, // 👈 makes reply go to the visitor
					subject: `New portfolio message from ${name}`,
					htmlContent: `
					<p><b>Name:</b> ${name}</p>
					<p><b>Email:</b> ${email}</p>
					<p><b>Message:</b></p>
					<p>${String(message).replace(/\n/g, "<br>")}</p>
					`
				};

				// Send request to Brevo API
				const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"accept": "application/json",
						"api-key": env.BREVO_API_KEY
					},
					body: JSON.stringify(payload)
				});

				if (!resp.ok) {
					const txt = await resp.text().catch(() => "");
					return new Response(
						JSON.stringify({ error: "Email send failed", details: txt }),
						{ status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
					);
				}

				return new Response(JSON.stringify({ ok: true }), {
					headers: { ...corsHeaders, "Content-Type": "application/json" }
				});
			} catch (err) {
				return new Response(
					JSON.stringify({ error: "Bad request", details: err.message }),
					{ status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
				);
			}
		}

		// Default response (for health check etc.)
		return new Response("Worker is running 🚀", { headers: corsHeaders });
	}
};