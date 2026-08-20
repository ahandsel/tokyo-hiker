// https://vitepress.dev/guide/custom-theme
import { defineComponent, h, nextTick, onMounted, watch } from 'vue';
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { useData } from 'vitepress';
import './style.css';
import { createMermaidRenderer } from 'vitepress-mermaid-renderer';
import './vitepress-mermaid-renderer.css'; // Import manually so the local overrides load site-wide.

import ImageViewerP from '@davidingplus/vitepress-image-viewer'; //[!code ++]
import '@davidingplus/vitepress-image-viewer/style.css'; //[!code ++]

// Per-page ceiling for Mermaid diagram containers, set from the optional
// `mermaidHeight` frontmatter key. The value feeds the --mermaid-max-height
// CSS variable read by vitepress-mermaid-renderer.css. It is a maximum:
// a short diagram keeps its natural height and never stretches to fill it.
const MERMAID_HEIGHT_DEFAULT = '70vh';

// Accepts any value that is valid for the CSS max-height property, such as 40rem, 560px, or 60vh.
// A bare number is treated as pixels.
// An invalid value logs a console warning and falls back to the default instead of breaking the page.
const resolveMermaidHeight = (raw: unknown): string => {
  if (raw === undefined || raw === null) return MERMAID_HEIGHT_DEFAULT;
  const value = typeof raw === 'number' ? `${raw}px` : String(raw).trim();
  const candidate = /^\d+(\.\d+)?$/.test(value) ? `${value}px` : value;
  if (typeof CSS !== 'undefined' && CSS.supports('max-height', candidate)) {
    return candidate;
  }
  console.warn(
    `[mermaidHeight] Ignoring invalid frontmatter value ${JSON.stringify(raw)}; using the ${MERMAID_HEIGHT_DEFAULT} default.`,
  );
  return MERMAID_HEIGHT_DEFAULT;
};

// Renderless component that applies the ceiling on the client after mount,
// and re-applies it whenever navigation changes the page frontmatter.
const MermaidHeightController = defineComponent({
  name: 'MermaidHeightController',
  setup() {
    const { frontmatter } = useData();
    onMounted(() => {
      watch(
        () => frontmatter.value.mermaidHeight,
        (raw) => {
          document.documentElement.style.setProperty(
            '--mermaid-max-height',
            resolveMermaidHeight(raw),
          );
        },
        { immediate: true },
      );
    });
    return () => null;
  },
});

export default {
  extends: DefaultTheme,
  Layout: () => {
    const { isDark } = useData();

    // Mermaid initialization lives in Layout so it can react to theme changes.
    const initMermaid = () => {
      createMermaidRenderer({
        // https://mermaid.js.org/config/schema-docs/config.html
        // Theme options are 'default', 'forest', 'dark', and 'neutral'.
        theme: isDark.value ? 'dark' : 'forest',
        // Look options are 'default', 'handDrawn', and 'simple'.
        look: isDark.value ? 'default' : 'handDrawn',
        layout: 'dagre', // 'default', 'dagre', 'elk'
        flowchart: {
          useMaxWidth: false,
        },
        markdownAutoWrap: true,
      });

      // Optional toolbar customization example:
      // mermaidRenderer.setToolbar({ ... });
    };

    if (typeof window !== 'undefined') {
      // Initial Mermaid setup after the first render.
      nextTick(() => initMermaid());

      // Re-run Mermaid after the color mode and DOM have updated.
      watch(
        () => isDark.value,
        () => {
          nextTick(() => initMermaid());
        },
      );
    }

    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      'layout-top': () => h(MermaidHeightController), // Apply the per-page Mermaid height ceiling.
    });
  },
  enhanceApp({ app }) {
    // Initialize the image viewer plugin
    ImageViewerP(app); //[!code ++]
  },
} satisfies Theme;
