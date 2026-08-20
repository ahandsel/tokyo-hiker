# Images in the `otama-walking-trail` folder

Trail map assets for [contents/level-1/otama-walking-trail.md](../../level-1/otama-walking-trail.md).


## Source and copyright

`ohtama.pdf` is the official Otama Walking Trail map by the OkuTama Tourist Association, saved from <https://www.okutama.gr.jp/site/map/pdf/ohtama.pdf>.
It is not mine, and I do not own the copyright to it.
It is kept here so the map stays available if the original page changes, and so the site can serve it without hotlinking.


## Contents

| File                        | What it is                                                                |
| --------------------------- | ------------------------------------------------------------------------- |
| `ohtama.pdf`                | The two-sided printed sheet, linked from the page as a download.          |
| `otama-trail-map-west.webp` | Page 1: OkuTama Station to Shiromaru, with the legend and local listings. |
| `otama-trail-map-east.webp` | Page 2: Kori Station to Shiromaru Dam, with the Hatonosu inset.           |

Mobile browsers refuse to render a PDF inside an iframe, so the pages are shown as images and the PDF stays available as a download link.
Each image is named after the stretch of the Tama River it covers rather than its page number, as the content rules require.


## Regenerating the images

`pdf-to-images.mjs` names its output after the source PDF, so the rename is a separate step:

```shell
pnpm pdf-to-images contents/public/otama-walking-trail/ohtama.pdf --width 2200 --quality 88 --force
mv contents/public/otama-walking-trail/ohtama-1.webp contents/public/otama-walking-trail/otama-trail-map-west.webp
mv contents/public/otama-walking-trail/ohtama-2.webp contents/public/otama-walking-trail/otama-trail-map-east.webp
```

Around 2200 px wide at quality 88 keeps the small print on the map readable while holding each page under half a megabyte.
Both commands are reproducible: rerunning them produces byte-identical files.


## Related

The Hatonosu Valley photos cover the same stretch of the Tama River and live in their own folder, [hatonosu-valley/](../hatonosu-valley/README.md).
