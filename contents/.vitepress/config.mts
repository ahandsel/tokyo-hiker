// .vitepress/config.mts
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitepress';
import { withSidebar } from 'vitepress-sidebar';
import { withPwa } from '@vite-pwa/vitepress';

// This file's own folder, contents/.vitepress, used to anchor the PWA asset paths below.
const configDir = dirname(fileURLToPath(import.meta.url));

// The stock 'minimal-2023' preset, minus its `favicons: [[48, 'favicon.ico']]`
// entry. That entry makes the generator emit a single 48x48 favicon.ico into the
// build and overwrite the hand-made multi-resolution one in contents/public/,
// which carries dedicated 16x16 and 32x32 renderings that browsers prefer for
// the tab icon. Everything else matches the stock preset.
const pwaIconPreset = {
  transparent: { sizes: [64, 192, 512] },
  maskable: { sizes: [512] },
  apple: { sizes: [180] },
};

// https://vitepress.dev/reference/site-config
const vitePressOptions = {
  title: 'Tokyo Hiker 🥾',
  description: 'Guide to hiking near Tokyo',
  // The asset generator no longer emits a favicon, see pwaIconPreset above, so the
  // hand-made one is linked here. The base prefix is written out because VitePress
  // does not rewrite hrefs inside head entries.
  head: [
    ['link', { rel: 'icon', href: '/tokyo-hiker/favicon.ico', sizes: 'any' }],
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    footer: {
      message:
        'Found it helpful? <a href="https://ko-fi.com/ahandsel" target="_blank">Consider buying me coffee ☕</a>',
      // showWithSidebar: true, // https://github.com/vuejs/vitepress/pull/4532
    },
    search: {
      provider: 'local',
      options: {
        async _render(src, env, md) {
          // First pass: render to populate env.frontmatter and other metadata
          await md.renderAsync(src, env);

          // Use empty object as fallback if frontmatter is undefined
          const fm = env.frontmatter ?? {};

          // Honor per-page opt out: `search: false` in frontmatter
          if (fm.search === false) {
            return '';
          }

          let rewritten = src;

          // Replace headings like "# {{ $frontmatter.title }}" with a concrete title
          if (typeof fm.title === 'string' && fm.title.trim().length > 0) {
            // Replace H1 that is exactly an interpolation of frontmatter.title
            rewritten = rewritten.replace(
              /^#\s*\{\{\s*\$frontmatter\.title\s*\}\}\s*$/m,
              `# ${fm.title}`,
            );

            // Drop any other heading levels that interpolate frontmatter.title
            rewritten = rewritten.replace(
              /^#{2,6}\s*\{\{\s*\$frontmatter\.title\s*\}\}\s*$/gm,
              '',
            );
          }

          // Strip any remaining $frontmatter interpolations from indexable text
          rewritten = rewritten.replace(/\{\{\s*\$frontmatter\.[^}]*\}\}/g, '');

          // Final render used for indexing
          return await md.renderAsync(rewritten, env);
        },
      },
    }, // end of search options
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Easy', link: '/level-1/' },
      { text: 'Intermediate', link: '/level-2/' },
      { text: 'Challenging', link: '/level-3/' },
      { text: 'Tokyo Geek', link: 'https://ahandsel.github.io/tokyo-geek/' },
      { text: 'About', link: '/about/' },
    ],
    // remove manual sidebar; withSidebar will generate it
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ahandsel/tokyo-hiker' },
      {
        icon: {
          svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-coffee"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/></svg>`,
        },
        link: 'https://ko-fi.com/ahandsel',
      },
    ],
    editLink: {
      pattern:
        'https://github.com/ahandsel/tokyo-hiker/edit/main/contents/:path',
      text: 'Edit this page on GitHub',
    },
  },
  base: '/tokyo-hiker/',
  sitemap: {
    hostname: 'https://ahandsel.github.io',
  },
  ignoreDeadLinks: true,

  // PWA options handled by @vite-pwa/vitepress
  pwa: {
    // Absolute on purpose. vite-plugin-pwa resolves this against the VitePress
    // root while @vite-pwa/vitepress resolves the same string against the
    // current working directory, and `pnpm build` runs from the repository
    // root. An absolute path is the only value both of them read the same way.
    // With a relative value the asset generator writes its icons to
    // .vitepress/contents/public/ at the repository root instead of the build.
    outDir: resolve(configDir, 'dist'),
    strategies: 'generateSW',
    mode: 'development',
    registerType: 'autoUpdate',
    injectRegister: 'script-defer',
    includeAssets: ['favicon.ico', 'pwa-192x192.png'],
    manifest: {
      name: 'Tokyo Hiker',
      short_name: 'tokyo-hiker',
      theme_color: '#ffffff',
      start_url: '/tokyo-hiker/',
      display: 'standalone',
      background_color: '#ffffff',
      // No `icons` key on purpose. vite-plugin-pwa only injects the generated
      // icons when this key is absent, so declaring `icons: []` here silently
      // ships a manifest with no icons at all.
    },
    // Ensure a preset is provided for the assets generator
    pwaAssets: {
      // config: true,
      preset: pwaIconPreset,
      // A named preset implies its own HTML link preset; an inline preset object
      // does not, so '2023' is set explicitly to keep the same head links.
      htmlPreset: '2023',
      image: 'public/favicon.png',
      // Do not set `integration` here. @vite-pwa/vitepress overwrites the whole
      // object, so `pwa.outDir` and `vite.publicDir` drive those paths instead.
    },
    workbox: {
      globPatterns: ['**/*.{css,js,html,svg,png,ico,txt,woff2}'],
    },
    experimental: { includeAllowlist: true },
    devOptions: {
      enabled: false,
      suppressWarnings: true,
      navigateFallback: '/',
    },
  },

  vite: {
    // Absolute, and for the same reason as `pwa.outDir` above: @vite-pwa/vitepress
    // reads this to locate the PWA source image and falls back to resolving
    // 'public' against the current working directory when it is unset.
    publicDir: resolve(configDir, '../public'),
    optimizeDeps: {
      exclude: [
        '@nolebase/vitepress-plugin-enhanced-readabilities/client',
        'vitepress',
        '@nolebase/ui',
      ],
    },
    ssr: {
      noExternal: [
        '@nolebase/vitepress-plugin-enhanced-readabilities',
        '@nolebase/ui',
      ],
    },
  },
};

const vitePressSidebarOptions = {
  // VitePress Sidebar's options here...
  // https://vitepress-sidebar.cdget.com/guide/options
  // basePath: null,
  capitalizeEachWords: false,
  capitalizeFirst: false,
  collapsed: false,
  // collapseDepth: 1,
  debugPrint: false,
  documentRootPath: 'contents',
  excludeByFolderDepth: null,
  excludeByGlobPattern: ['README.md', 'temp.md', 'temp-.*'],
  excludeFilesByFrontmatterFieldName: 'excludeFromSidebar',
  folderLinkNotIncludesFileName: false,
  followSymLinks: false,
  frontmatterOrderDefaultValue: 10,
  frontmatterTitleFieldName: 'title',
  hyphenToSpace: false,
  includeDotFiles: false,
  includeEmptyFolder: false,
  includeFolderIndexFile: false,
  includeRootIndexFile: false,
  keepMarkdownSyntaxFromTitle: false,
  manualSortFileNameByPriority: [],
  prefixSeparator: '.',
  removePrefixAfterOrdering: false,
  resolvePath: '/',
  rootGroupCollapsed: null,
  rootGroupLink: null,
  // rootGroupText: "Table of Contents",
  // scanStartPath: "/",
  sortFolderTo: 'top',
  sortMenusByFileDatePrefix: false,
  sortMenusByFrontmatterDate: false,
  sortMenusByFrontmatterOrder: true,
  sortMenusByName: false,
  sortMenusOrderByDescending: false,
  sortMenusOrderNumericallyFromLink: false,
  sortMenusOrderNumericallyFromTitle: false,
  underscoreToSpace: false,
  useFolderLinkFromIndexFile: true,
  useFolderLinkFromSameNameSubFile: false,
  useFolderTitleFromIndexFile: true,
  useTitleFromFileHeading: false,
  useTitleFromFrontmatter: true,
};

// export default defineConfig(withSidebar(vitePressOptions, vitePressSidebarOptions));
// export default defineConfig(
//   withPwa(withSidebar(vitePressOptions, vitePressSidebarOptions))
export default withPwa(
  defineConfig(withSidebar(vitePressOptions, vitePressSidebarOptions)),
);
