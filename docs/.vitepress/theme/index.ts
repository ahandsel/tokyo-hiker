// https://vitepress.dev/guide/custom-theme
import { defineComponent, h, nextTick, onMounted, watch } from 'vue';
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { useData } from 'vitepress';
import './style.css';
import { createMermaidRenderer } from 'vitepress-mermaid-renderer';
// import 'vitepress-mermaid-renderer/dist/style.css';
import './vitepress-mermaid-renderer.css';

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

    const initMermaid = () => {
      const mermaidRenderer = createMermaidRenderer({
        // https://mermaid.js.org/config/schema-docs/config.html
        theme: isDark.value ? 'dark' : 'forest', // 'default', 'dark', 'forest', 'neutral'
        // Default to 'handDrawn' but use 'default' in dark mode
        look: isDark.value ? 'default' : 'handDrawn', // 'default', 'handDrawn', 'simple'
        layout: 'dagre', // 'default', 'dagre', 'elk'
        flowchart: {
          useMaxWidth: false,
        },
        markdownAutoWrap: true,
      });

      // Optional toolbar configuration
      // mermaidRenderer.setToolbar({ ... });
    };

    if (typeof window !== 'undefined') {
      // initial mermaid setup
      nextTick(() => initMermaid());

      // re-run when the theme (dark / light) changes
      watch(
        () => isDark.value,
        () => {
          initMermaid();
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
