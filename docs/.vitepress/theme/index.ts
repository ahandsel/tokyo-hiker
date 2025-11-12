// https://vitepress.dev/guide/custom-theme
import { h, nextTick, watch } from 'vue';
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { useData } from 'vitepress';
import './style.css';
import { createMermaidRenderer } from 'vitepress-mermaid-renderer';
// import 'vitepress-mermaid-renderer/dist/style.css';
import './vitepress-mermaid-renderer.css';

import ImageViewerP from '@davidingplus/vitepress-image-viewer'; //[!code ++]
import '@davidingplus/vitepress-image-viewer/style.css'; //[!code ++]

export default {
  extends: DefaultTheme,
  Layout: () => {
    const { isDark } = useData();

    const initMermaid = () => {
      const mermaidRenderer = createMermaidRenderer({
        // https://mermaid.js.org/config/schema-docs/config.html
        theme: isDark.value ? 'dark' : 'forest', // 'default', 'dark', 'forest', 'neutral'
        look: 'handDrawn', // 'default', 'handDrawn', 'simple'
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
    });
  },
  enhanceApp({ app }) {
    // Initialize the image viewer plugin
    ImageViewerP(app); //[!code ++]
  },
} satisfies Theme;
