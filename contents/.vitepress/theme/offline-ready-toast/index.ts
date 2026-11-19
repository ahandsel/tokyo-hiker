import './style.css';

const VISIBLE_MS = 8000;
const FADE_MS = 200;

// Tells the reader that every page is saved on the device, so they can trust the
// guide before they lose signal on a trail. pwa-update.ts calls this once, when the
// service worker finishes its first download of the site.
export function showOfflineReadyToast() {
  if (typeof document === 'undefined') return;
  document.querySelector('.offline-ready-toast')?.remove();

  const toast = document.createElement('div');
  toast.className = 'offline-ready-toast';

  // Only the message is a live region, so screen readers do not read the button.
  const message = document.createElement('p');
  message.className = 'offline-ready-toast-message';
  message.setAttribute('role', 'status');
  const title = document.createElement('strong');
  const detail = document.createElement('span');
  message.append(title, detail);

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'offline-ready-toast-close';
  close.setAttribute('aria-label', 'Dismiss');
  close.textContent = '×';

  toast.append(message, close);
  document.body.appendChild(toast);

  const hide = () => {
    toast.classList.remove('is-visible');
    setTimeout(() => toast.remove(), FADE_MS);
  };
  const timer = setTimeout(hide, VISIBLE_MS);
  close.addEventListener('click', () => {
    clearTimeout(timer);
    hide();
  });

  // Fill the live region after it is in the page, so screen readers announce it.
  requestAnimationFrame(() => {
    title.textContent = 'Ready to use offline';
    detail.textContent =
      'Every page is saved on this device, so the guide works without a signal.';
    toast.classList.add('is-visible');
  });
}
