<wizard-report>
# PostHog post-wizard report

The wizard has completed a server-side PostHog integration for the ablefy case-study prototype. A `posthog-node` singleton was created at `server/lib/posthog.ts` and wired into the two critical server-side route files. Four business events now fire on every key user action in the signup → product-created onboarding flow. User identity is established server-side at signup (via `posthog.identify`) and the same `userId` UUID is used as `distinctId` on every subsequent event, matching the `posthog-js` client-side identity set in `src/routes/Signup.tsx` — so frontend and backend events are fully correlated in PostHog.

| Event | Description | File |
|-------|-------------|------|
| `user_signed_up` | Fires when a new account is created via `POST /api/auth/signup`. Properties: `email`, `newsletter`. Also calls `posthog.identify` to set `name` and `email` on the person profile. | `server/routes/auth.ts` |
| `user_logged_in` | Fires when a user successfully authenticates via `POST /api/auth/login`. Properties: `email`. | `server/routes/auth.ts` |
| `product_created` | Fires when a seller creates a new product draft via `POST /api/products`. Properties: `product_id`, `product_type`, `payment_model`, `currency`, `price_cents`, `time_since_signup_ms`. | `server/routes/products.ts` |
| `product_published` | Fires when a seller publishes a product via `PATCH /api/products/:id/status`. Properties: `product_id`. | `server/routes/products.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics:** https://us.posthog.com/project/411351/dashboard/1549954
- **New signups over time** (daily line): https://us.posthog.com/project/411351/insights/auUIeyz3
- **Signup → Product created conversion funnel:** https://us.posthog.com/project/411351/insights/DKgSEzQz
- **Product created by payment model** (bar breakdown): https://us.posthog.com/project/411351/insights/VxcNytd8
- **Product published rate** (draft → live funnel): https://us.posthog.com/project/411351/insights/aaibrEAn
- **Returning users — logins over time** (daily unique area): https://us.posthog.com/project/411351/insights/dwPTluxa

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
