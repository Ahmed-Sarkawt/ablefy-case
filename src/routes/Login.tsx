/**
 * @license MIT
 * Copyright (c) 2026 Ahmed Sulaiman
 *
 * /login — returning user sign-in.
 * Identical shell to Signup (same card height, same left banner structure).
 * Only the form fields and text differ.
 */
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input } from '../components';
import { setSession } from '../lib/auth';
import { apiPost, ApiRequestError } from '../lib/api';
import { identifyUser, track } from '../lib/analytics';

interface LoginResponse {
  userId: string;
  name: string;
}

interface FieldErrors {
  email?: string;
  password?: string;
  general?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login(): JSX.Element {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const formIsValid = EMAIL_RE.test(email) && password.length >= 1;

  async function onSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    const errs: FieldErrors = {};
    if (!EMAIL_RE.test(email)) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Enter your password';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const res = await apiPost<LoginResponse>('/api/auth/login', { email, password });
      setSession(res.userId, res.name);
      identifyUser(res.userId, res.name);
      track('user_logged_in', { email });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err instanceof ApiRequestError) {
        const field = err.payload.field as keyof FieldErrors | null;
        if (field === 'email' || field === 'password') {
          setErrors({ [field]: err.payload.error });
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
      {/* Same header as Signup */}
      <header className="px-6 sm:px-10 pt-8 pb-6">
        <img src="/ablefy-logo-dark.svg" alt="ablefy" className="h-8 w-auto" />
      </header>

      {/* Same card shell as Signup — fixed h-[770px] so both pages are identical */}
      <div className="px-6 sm:px-10 pb-10">
        <div className="mx-auto flex max-w-6xl h-[770px] overflow-hidden rounded-3xl bg-bg-card shadow-med">

          {/* Left brand block — identical structure to Signup */}
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
                Welcome back
              </p>
              <h2 className="mt-2 font-brand text-3xl font-semibold leading-tight text-soft">
                Your products are waiting for you.
              </h2>
              <p className="mt-3 max-w-sm text-sm text-soft">
                Sign in to manage your courses, track your sales, and keep growing.
              </p>
            </div>
          </aside>

          {/* Right form block — same structure as Signup, fewer fields */}
          <section className="flex flex-1 items-center justify-center px-6 py-10 sm:px-12">
            <div className="w-full max-w-md">
              <header className="mb-8">
                <h1 className="font-brand text-3xl font-semibold leading-tight text-ink">
                  Sign in
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Don&apos;t have an account?{' '}
                  <Link to="/signup" className="font-semibold text-primary-active hover:underline">
                    Sign up free
                  </Link>
                </p>
              </header>

              <button
                type="button"
                disabled
                aria-label="Sign in with Google — demo only"
                className="mb-6 inline-flex w-full h-12 items-center justify-center gap-2 rounded-full bg-bg-surface text-sm font-semibold text-ink hover:bg-border transition-colors duration-fast cursor-not-allowed opacity-70"
              >
                <GoogleGlyph />
                <span>Sign in with Google</span>
              </button>

              <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-wider text-muted">
                <span className="h-px flex-1 bg-border" />
                <span>or</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
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
                <div>
                  <Input
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                  />
                  <div className="mt-1.5 text-right">
                    <button type="button" className="text-xs text-muted hover:text-ink hover:underline">
                      Forgot password?
                    </button>
                  </div>
                </div>

                {errors.general && (
                  <p role="alert" className="text-sm text-error">{errors.general}</p>
                )}

                <Button
                  type="submit"
                  variant="dark"
                  size="lg"
                  loading={submitting}
                  disabled={!formIsValid}
                  fullWidth
                  className="!rounded-2xl"
                >
                  {submitting ? 'Signing in…' : 'Sign in'}
                </Button>

                <p className="text-xs text-muted leading-relaxed">
                  By signing in you agree with ablefy&apos;s{' '}
                  <a href="#terms" className="underline hover:text-ink">Terms and Conditions</a>
                  {' '}and{' '}
                  <a href="#privacy" className="underline hover:text-ink">Privacy Policy</a>.
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
