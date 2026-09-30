import './style.css';

// Delegated events keep working after VitePress navigates between pages.
export function wireHeroSpeechBubble(text: string) {
  if (typeof window === 'undefined') return;

  const popBubble = (event: Event) => {
    if (!(event.target instanceof Element)) return;
    const image = event.target.closest('.VPHero .image-src');
    const container = image?.closest('.image-container');
    if (!container) return;
    event.preventDefault();
    container.querySelector('.hero-speech-bubble')?.remove();

    const bubble = document.createElement('div');
    bubble.className = 'hero-speech-bubble';
    bubble.setAttribute('role', 'status');
    container.appendChild(bubble);

    requestAnimationFrame(() => {
      bubble.textContent = text;
      bubble.classList.add('is-visible');
    });

    setTimeout(() => {
      bubble.classList.remove('is-visible');
      setTimeout(() => bubble.remove(), 200);
    }, 1800);
  };

  document.addEventListener('click', popBubble);
  document.addEventListener('keydown', (event) => {
    if (!event.repeat && (event.key === 'Enter' || event.key === ' ')) {
      popBubble(event);
    }
  });
}
