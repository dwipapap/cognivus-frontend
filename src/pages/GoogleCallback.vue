<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authStore } from '../store/auth'
import { decodeJwt } from '../utils/jwt'
import apiClient from '../services/api'
import ittrLogo from '../assets/ittrlogo.png'

const router = useRouter();
const route = useRoute();
const isDevPreview = import.meta.env.DEV && route.meta.devPreview;
const error = ref(null);
const currentStep = ref(1);
const statusMessage = ref("We're verifying your Google account and preparing your dashboard.");
const steps = [
  'Google account verified',
  'Syncing your profile',
  'Redirecting to your dashboard'
];

onMounted(async () => {
  if (isDevPreview) {
    currentStep.value = Number(route.query.step) || 2;
    statusMessage.value = route.query.message || "We're preparing your learning space.";
    error.value = route.query.state === 'error'
      ? 'Preview only: authentication response failed.'
      : null;
    return;
  }

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const urlRole = urlParams.get('role');
    const id = urlParams.get('id');
    const username = urlParams.get('username');
    const email = urlParams.get('email');
    const avatarUrl = urlParams.get('avatar_url');
    const givenName = urlParams.get('given_name');
    const familyName = urlParams.get('family_name');

    // Do not leave bearer credentials in browser history after reading them.
    window.history.replaceState({}, document.title, window.location.pathname);
    authStore.clearAuth();

    const payload = decodeJwt(token);
    if (!payload || !payload.role) {
      throw new Error('Invalid authentication response');
    }

    const role = payload.role;
    const allowedRoles = ['owner', 'admin', 'moderator', 'lecturer', 'student'];
    if (
      !token ||
      !allowedRoles.includes(role) ||
      role !== urlRole ||
      !id ||
      !username ||
      !email ||
      isNaN(parseInt(id, 10))
    ) {
      throw new Error('Invalid authentication response');
    }

    const user = {
      id: parseInt(id, 10),
      username,
      email,
      user_metadata: {
        avatar_url: avatarUrl ? decodeURIComponent(avatarUrl) : null,
        given_name: givenName ? decodeURIComponent(givenName) : null,
        family_name: familyName ? decodeURIComponent(familyName) : null
      }
    };

    // Check if user needs to complete profile setup
    const authenticatedRequest = {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 15000
    };
    const response = await apiClient.get(`/users/${id}`, authenticatedRequest);

    if (!response.data.success) {
      throw new Error('Unable to verify your account. Please try logging in again.');
    }

    const userData = response.data.data;
    currentStep.value = 2;
    statusMessage.value = 'Google account verified. Syncing your profile...';
    const isGoogleUser = userData.raw_meta_data && userData.raw_meta_data.sub;
    let targetRoute = '/student/dashboard';

    if (isGoogleUser && role === 'student') {
      const studentResponse = await apiClient.get(
        `/students/${id}`,
        authenticatedRequest
      );

      if (!studentResponse.data.success) {
        throw new Error('Unable to verify your student profile.');
      }

      const studentData = Array.isArray(studentResponse.data.data)
        ? studentResponse.data.data[0]
        : studentResponse.data.data;

      if (!studentData || !studentData.phone || !studentData.address) {
        targetRoute = '/new-user';
      }
    } else if (role === 'student' && !userData.password) {
      targetRoute = '/new-user';
    }

    if (targetRoute !== '/new-user') {
      const dashboardRoutes = {
        owner: '/admin/dashboard',
        admin: '/admin/dashboard',
        moderator: '/admin/dashboard',
        lecturer: '/lecturer/dashboard',
        student: '/student/dashboard'
      };
      targetRoute = dashboardRoutes[role] || '/student/dashboard';
    }

    // Persist the session only after all account checks have succeeded.
    currentStep.value = 3;
    statusMessage.value = 'Everything is ready. Redirecting you now...';
    authStore.setAuth(user, token, role);
    await new Promise(resolve => setTimeout(resolve, 500));
    await router.replace(targetRoute);
  } catch (err) {
    console.error('OAuth callback error:', err);
    authStore.clearAuth();
    error.value = err.message || 'Unable to complete login.';
    setTimeout(() => {
      router.replace('/login');
    }, 3000);
  }
});
</script>

<template>
  <main class="callback-page">
    <header class="page-header">
      <img :src="ittrLogo" alt="ITTR English" class="brand-logo" />
      <div class="provider-pill">
        <svg class="google-logo google-logo-small" aria-hidden="true" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span>Google Sign-In</span>
      </div>
    </header>

    <section v-if="!error" class="callback-layout" aria-live="polite">
      <div class="intro">
        <h1>Setting up your<br class="desktop-break" /> learning space</h1>
        <p>{{ statusMessage }}</p>
      </div>

      <div class="orbit-scene" aria-hidden="true">
        <div class="orbit orbit-outer"></div>
        <div class="orbit orbit-middle"></div>
        <div class="orbit orbit-inner"></div>
        <div class="orbit-travelers">
          <span class="orbit-dot dot-one"></span>
          <span class="orbit-dot dot-two"></span>
          <span class="orbit-dot dot-three"></span>
          <div class="orbit-badge badge-shield">
            <UIcon name="i-lucide-shield-check" />
          </div>
          <div class="orbit-badge badge-check">
            <UIcon name="i-lucide-check" />
          </div>
        </div>
        <div class="google-core">
          <svg class="google-logo google-logo-large" aria-label="Google" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </div>
      </div>

      <ol class="progress-panel" aria-label="Sign-in progress">
        <li
          v-for="(step, index) in steps"
          :key="step"
          class="progress-step"
          :class="{
            completed: currentStep > index + 1,
            active: currentStep === index + 1
          }"
        >
          <span class="step-icon">
            <UIcon
              :name="currentStep > index + 1
                ? 'i-lucide-check'
                : currentStep === index + 1
                  ? 'i-lucide-loader-circle'
                  : 'i-lucide-circle'"
            />
          </span>
          <span class="step-label"><b>{{ index + 1 }}.</b> {{ step }}</span>
          <span class="step-state">
            {{ currentStep > index + 1 ? 'Completed' : currentStep === index + 1 ? 'In progress' : 'Pending' }}
          </span>
        </li>
      </ol>

      <p class="redirect-note">
        <UIcon name="i-lucide-clock-3" />
        You’ll be redirected automatically in a few seconds.
      </p>

      <div class="trust-strip">
        <span><UIcon name="i-lucide-circle-check" /> Google connected</span>
        <span><UIcon name="i-lucide-shield-check" /> Secure &amp; private</span>
      </div>
    </section>

    <section v-else class="error-panel" aria-live="assertive">
      <img :src="ittrLogo" alt="" class="error-logo" />
      <div class="space-y-6">
        <UAlert
          color="error"
          variant="soft"
          icon="i-lucide-circle-alert"
          title="Login failed"
          :description="error"
        />
        <p class="text-sm text-muted">Redirecting to login page...</p>
      </div>
    </section>
  </main>
</template>

<style scoped>
.callback-page {
  --callback-blue: oklch(58% 0.19 258);
  --callback-blue-soft: oklch(95% 0.025 258);
  --callback-green: oklch(67% 0.17 151);
  min-height: 100svh;
  overflow: hidden;
  color: oklch(25% 0.055 262);
  background:
    radial-gradient(circle at 12% 88%, oklch(91% 0.055 255) 0 11rem, transparent 11.1rem),
    radial-gradient(circle at 88% 15%, oklch(94% 0.03 255) 0 15rem, transparent 15.1rem),
    oklch(98.5% 0.009 255);
  font-family: Figtree, system-ui, sans-serif;
}

.page-header {
  width: min(1180px, calc(100% - 48px));
  margin: 0 auto;
  padding-top: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-logo { width: 142px; height: auto; }

.provider-pill {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 18px;
  border: 1px solid oklch(91% 0.015 255);
  border-radius: 999px;
  background: oklch(99% 0.004 255);
  color: oklch(31% 0.035 262);
  font-size: 0.82rem;
  font-weight: 600;
}

.google-logo { display: block; }
.google-logo-small { width: 16px; height: 16px; }
.google-logo-large { width: 58%; height: 58%; }

.callback-layout {
  width: min(1080px, calc(100% - 48px));
  min-height: calc(100svh - 92px);
  margin: 0 auto;
  padding: 38px 0 48px;
  display: grid;
  grid-template-columns: minmax(360px, 1fr) minmax(420px, 0.88fr);
  grid-template-areas:
    "visual intro"
    "visual progress"
    "visual note"
    "visual trust";
  column-gap: 88px;
  align-content: center;
}

.intro { grid-area: intro; align-self: end; margin-bottom: 24px; }
.intro h1 {
  margin: 0;
  font-size: 2.75rem;
  line-height: 1.04;
  letter-spacing: -0.035em;
  font-weight: 750;
}
.intro p {
  max-width: 42ch;
  margin: 14px 0 0;
  color: oklch(48% 0.04 260);
  line-height: 1.55;
}

.orbit-scene {
  grid-area: visual;
  position: relative;
  width: min(36vw, 430px);
  aspect-ratio: 1;
  place-self: center;
}

.orbit {
  position: absolute;
  inset: 50%;
  border: 1px solid oklch(79% 0.095 258 / 0.68);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}
.orbit-outer { width: 88%; height: 88%; border-style: dashed; animation: ring-turn 10s linear infinite; }
.orbit-middle { width: 70%; height: 70%; border-color: oklch(68% 0.16 258 / 0.72); animation: ring-turn 6s linear infinite reverse; }
.orbit-inner { width: 50%; height: 50%; border-color: oklch(85% 0.075 258 / 0.75); }

.google-core {
  position: absolute;
  inset: 50%;
  width: 31%;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  transform: translate(-50%, -50%);
  border: 1px solid oklch(92% 0.02 258);
  border-radius: 50%;
  background: oklch(99% 0.004 255);
  box-shadow: 0 24px 46px oklch(65% 0.12 258 / 0.2);
  font-size: 3rem;
}

.orbit-badge {
  position: absolute;
  z-index: 2;
  width: 48px;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: oklch(99% 0.004 255);
  box-shadow: 0 12px 30px oklch(59% 0.12 258 / 0.18);
  font-size: 1.45rem;
}
.orbit-travelers {
  position: absolute;
  inset: 6%;
  animation: orbit-turn 10s linear infinite;
}
.orbit-travelers > * { animation: orbit-counter-turn 10s linear infinite; }
.badge-shield { top: 29%; left: 4%; color: var(--callback-blue); }
.badge-check { top: 31%; right: 3%; color: var(--callback-green); background: oklch(95% 0.04 151); }

.orbit-dot { position: absolute; width: 6px; aspect-ratio: 1; border-radius: 50%; background: oklch(71% 0.14 258); }
.dot-one { top: 18%; left: 20%; }
.dot-two { right: 16%; bottom: 25%; }
.dot-three { left: 12%; bottom: 20%; opacity: 0.55; }

.progress-panel {
  grid-area: progress;
  margin: 0;
  padding: 8px;
  list-style: none;
  border: 1px solid oklch(91% 0.02 258);
  border-radius: 16px;
  background: oklch(99% 0.004 255);
}

.progress-step {
  position: relative;
  min-height: 48px;
  display: grid;
  grid-template-columns: 28px 1fr auto;
  align-items: center;
  gap: 9px;
  padding: 6px 8px;
  border-radius: 10px;
  color: oklch(52% 0.035 260);
  font-size: 0.8rem;
}
.progress-step.active { color: oklch(48% 0.18 258); background: var(--callback-blue-soft); }
.progress-step.completed { color: oklch(42% 0.04 260); }
.progress-step:not(:last-child)::after {
  content: '';
  position: absolute;
  z-index: 0;
  left: 21px;
  top: 35px;
  width: 1px;
  height: 26px;
  background: oklch(83% 0.08 258);
}

.step-icon {
  z-index: 1;
  width: 25px;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border: 2px solid oklch(76% 0.08 258);
  border-radius: 50%;
  background: oklch(99% 0.004 255);
  color: oklch(57% 0.12 258);
  font-size: 0.9rem;
}
.completed .step-icon { border-color: var(--callback-green); background: var(--callback-green); color: oklch(99% 0.004 255); }
.active .step-icon { border-color: oklch(68% 0.16 258); animation: status-pulse 1.35s ease-out infinite; }
.active .step-icon :deep(svg) { animation: spin 1s linear infinite; }
.step-label b { font-weight: 700; }

.step-state {
  padding: 4px 8px;
  border-radius: 999px;
  background: oklch(95% 0.012 258);
  color: oklch(49% 0.04 260);
  font-size: 0.68rem;
  white-space: nowrap;
}
.active .step-state { background: oklch(91% 0.045 258); color: oklch(51% 0.17 258); }
.completed .step-state { background: oklch(94% 0.045 151); color: oklch(51% 0.13 151); }

.redirect-note {
  grid-area: note;
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 14px 2px 18px;
  color: oklch(48% 0.035 260);
  font-size: 0.75rem;
}
.redirect-note svg { flex: none; }

.trust-strip {
  grid-area: trust;
  display: flex;
  justify-content: space-between;
  padding: 13px 15px;
  border: 1px solid oklch(84% 0.07 258);
  border-radius: 12px;
  color: oklch(42% 0.04 260);
  font-size: 0.72rem;
}
.trust-strip span { display: flex; align-items: center; gap: 7px; }
.trust-strip span:first-child svg { color: var(--callback-green); }
.trust-strip span:last-child svg { color: var(--callback-blue); }

.error-panel {
  width: min(430px, calc(100% - 40px));
  margin: 15vh auto 0;
  padding: 24px;
  border: 1px solid oklch(91% 0.02 258);
  border-radius: 16px;
  background: oklch(99% 0.004 255);
}
.error-logo { display: none; }

@keyframes ring-turn { to { transform: translate(-50%, -50%) rotate(360deg); } }
@keyframes orbit-turn { to { transform: rotate(360deg); } }
@keyframes orbit-counter-turn { to { transform: rotate(-360deg); } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes status-pulse { 50% { box-shadow: 0 0 0 6px oklch(75% 0.11 258 / 0.18); } }

@media (max-width: 760px) {
  .callback-page { overflow: auto; }
  .page-header {
    width: calc(100% - 32px);
    padding-top: 18px;
    flex-direction: column;
    gap: 13px;
  }
  .brand-logo { width: 112px; }
  .provider-pill { padding: 7px 14px; font-size: 0.72rem; }
  .callback-layout {
    width: min(100% - 28px, 460px);
    min-height: auto;
    padding: 18px 0 26px;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-areas: "intro" "visual" "progress" "note" "trust";
    gap: 0;
  }
  .intro { margin-bottom: 7px; text-align: center; }
  .intro h1 { font-size: 1.8rem; line-height: 1.08; }
  .intro p { max-width: 34ch; margin: 9px auto 0; font-size: 0.78rem; line-height: 1.4; }
  .desktop-break { display: none; }
  .orbit-scene { width: 210px; margin: 2px auto 10px; }
  .google-logo-large { width: 55%; height: 55%; }
  .orbit-badge { width: 36px; font-size: 1rem; }
  .progress-panel { padding: 6px; border-radius: 14px; }
  .progress-step { min-height: 42px; grid-template-columns: 25px 1fr auto; gap: 7px; padding: 4px 6px; font-size: 0.68rem; }
  .progress-step:not(:last-child)::after { left: 18px; top: 31px; height: 22px; }
  .step-icon { width: 22px; font-size: 0.75rem; }
  .step-state { padding: 3px 6px; font-size: 0.58rem; }
  .redirect-note { justify-content: center; margin: 12px 12px 14px; text-align: center; font-size: 0.68rem; }
  .trust-strip { padding: 11px 12px; font-size: 0.64rem; }
}

@media (prefers-reduced-motion: reduce) {
  .orbit, .orbit-travelers, .orbit-travelers > *, .active .step-icon, .active .step-icon :deep(svg) { animation: none; }
}
</style>
