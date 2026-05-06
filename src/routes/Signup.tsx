/**
 * @license MIT
 * Copyright (c) 2026 Ahmed Sulaiman
 *
 * /signup — Create seller account.
 * Split layout: branded left block (seller image + ablefy logo) + right form.
 * Three fields, on-submit validation, visual-only Google button,
 * newsletter opt-in, terms disclaimer. Per docs/FLOW.md step 1.
 */
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Checkbox } from '../components';
import { setSession } from '../lib/auth';
import { apiPost, ApiRequestError } from '../lib/api';
import { identifyUser, track } from '../lib/analytics';

interface SignupResponse {
  userId: string;
  name: string;
}

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  general?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: { name: string; email: string; password: string }): FieldErrors {
  const errors: FieldErrors = {};
  if (values.name.trim().length < 2) errors.name = 'Enter your name';
  if (!EMAIL_RE.test(values.email)) errors.email = 'Enter a valid email';
  if (values.password.length < 8) errors.password = 'At least 8 characters';
  return errors;
}

export default function Signup(): JSX.Element {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const formIsValid =
    name.trim().length >= 2 && EMAIL_RE.test(email) && password.length >= 8;

  async function onSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    const validation = validate({ name, email, password });
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);
    try {
      const res = await apiPost<SignupResponse>('/api/auth/signup', {
        name,
        email,
        password,
        newsletter,
      });
      setSession(res.userId, res.name);
      identifyUser(res.userId, res.name);
      track('user_signed_up', { email, newsletter });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.payload.field === 'email') {
          setErrors({ email: err.payload.error });
        } else {
          setErrors({ general: err.payload.error });
        }
      } else {
        setErrors({ general: 'Something went wrong. Try again.' });
      }
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-bg-canvas text-soft">
      {/* Top header — logo always visible above the container */}
      <header className="px-6 sm:px-10 pt-8 pb-6">
        <img src="/ablefy-logo-dark.svg" alt="ablefy" className="h-8 w-auto" />
      </header>

      {/* Centered container holding banner + form */}
      <div className="px-6 sm:px-10 pb-10">
        <div className="mx-auto flex max-w-6xl h-[770px] overflow-hidden rounded-3xl bg-bg-card shadow-med">
          {/* Left brand block — hidden on small screens */}
          <aside
            className="relative hidden lg:flex lg:w-[42%] xl:w-[45%] flex-col justify-end h-full overflow-hidden bg-bg-surface"
            aria-hidden="true"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: 'url(/seller.png)' }}
            />
            <div className="relative z-10 p-10 text-soft">
              <p className="text-sm uppercase tracking-wider font-semibold text-soft">
                For sellers
              </p>
              <h2 className="mt-2 font-brand text-3xl font-semibold leading-tight text-soft">
                Build, sell, and grow your digital products.
              </h2>
              <p className="mt-3 max-w-sm text-sm text-soft">
                Join thousands of creators who use ablefy to launch courses, ebooks, and
                memberships without the technical headache.
              </p>
            </div>
          </aside>

          {/* Right form block */}
          <section className="flex flex-1 items-center justify-center px-6 py-10 sm:px-12">
            <div className="w-full max-w-md">
              <header className="mb-8">
            <h1 className="font-brand text-3xl font-semibold leading-tight text-ink">
              Create seller account
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              14 days free trial &mdash; no credit card needed.{' '}
              <Link to="/login" className="font-semibold text-primary-active hover:underline">
                Already have an account?
              </Link>
            </p>
          </header>

          <button
            type="button"
            disabled
            aria-label="Sign up with Google — demo only"
            className="mb-6 inline-flex w-full h-12 items-center justify-center gap-2 rounded-full bg-bg-surface text-sm font-semibold text-ink hover:bg-border transition-colors duration-fast cursor-not-allowed opacity-70"
          >
            <GoogleGlyph />
            <span>Sign up with Google</span>
          </button>

          <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-wider text-muted">
            <span className="h-px flex-1 bg-border" />
            <span>or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
            <Input
              label="Name"
              type="text"
              autoComplete="name"
              placeholder="Alex Rivera"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="alex@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              helper="At least 8 characters"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />

            <Checkbox
              label="I want to receive updates, tips, and offers by email that help me grow my business. Unsubscribing is possible at any time."
              checked={newsletter}
              onChange={(e) => setNewsletter(e.target.checked)}
            />

            {errors.general ? (
              <p role="alert" className="text-sm text-error">
                {errors.general}
              </p>
            ) : null}

            <Button
              type="submit"
              variant="dark"
              size="lg"
              loading={submitting}
              disabled={!formIsValid}
              fullWidth
              className="!rounded-2xl"
            >
              {submitting ? 'Creating your account…' : 'Create seller account'}
            </Button>

            <p className="text-xs text-muted leading-relaxed">
              By clicking &ldquo;Create seller account&rdquo; you agree with ablefy&apos;s{' '}
              <a href="#terms" className="underline hover:text-ink">
                Terms and Conditions
              </a>{' '}
              and{' '}
              <a href="#privacy" className="underline hover:text-ink">
                Privacy Policy
              </a>
              .
            </p>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function GoogleGlyph(): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M8 6.7v2.6h3.7c-.15.97-1.13 2.85-3.7 2.85a4.15 4.15 0 110-8.3c1.3 0 2.18.55 2.68 1.03l1.83-1.76C11.4 2.07 9.85 1.4 8 1.4 4.36 1.4 1.4 4.36 1.4 8s2.96 6.6 6.6 6.6c3.81 0 6.34-2.68 6.34-6.45 0-.43-.05-.76-.1-1.08H8z"
        fill="currentColor"
      />
    </svg>
  );
}
