// https://vitepress.dev/guide/custom-theme
import { h, nextTick } from 'vue';
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import './style.css';
import { createMermaidRenderer } from 'vitepress-mermaid-renderer';
// import 'vitepress-mermaid-renderer/dist/style.css';
import './vitepress-mermaid-renderer.css';

import ImageViewerP from '@davidingplus/vitepress-image-viewer'; //[!code ++]
import '@davidingplus/vitepress-image-viewer/style.css'; //[!code ++]

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    });
  },
  enhanceApp({ app, router, siteData }) {
    // Use the client-safe wrapper for SSR compatibility

    // Initialize the image viewer plugin
    ImageViewerP(app); //[!code ++]

    // Optional: Pass custom Mermaid configuration
    const mermaidRenderer = createMermaidRenderer({
      // https://mermaid.js.org/config/schema-docs/config.html
      theme: 'forest', // 'default', 'dark', 'forest', 'neutral'
      look: 'handDrawn', // 'default', 'handDrawn', 'simple'
      layout: 'dagre', // 'default', 'dagre', 'elk'
      // theme: 'dark',
      // startOnLoad: false,
      flowchart: {
        useMaxWidth: false,
      },
      markdownAutoWrap: true,
    });
    mermaidRenderer.initialize();

    if (router) {
      router.onAfterRouteChange = () => {
        nextTick(() => mermaidRenderer.renderMermaidDiagrams());
      };
    }
  },
} satisfies Theme;
