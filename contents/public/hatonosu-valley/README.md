# Images in the `hatonosu-valley` folder


## Otama Walking Trail map

`ohtama.pdf` is the official Otama Walking Trail map by the OkuTama Tourist Association, saved from <https://www.okutama.gr.jp/site/map/pdf/ohtama.pdf>.
It is not mine, and I do not own the copyright to it.
It is kept here so the map stays available if the original page changes, and so the site can serve it without hotlinking.

`otama-trail-map-west.webp` and `otama-trail-map-east.webp` are page 1 and page 2 of that PDF, converted for display on the site.
Mobile browsers refuse to render a PDF inside an iframe, so the pages are shown as images instead and the PDF stays available as a download link.
Each file is named after the stretch of the Tama River it covers rather than its page number.

Regenerate them with:

```shell
pnpm pdf-to-images contents/public/hatonosu-valley/ohtama.pdf --pages 1 --prefix otama-trail-map-west --width 2200 --quality 88 --force
pnpm pdf-to-images contents/public/hatonosu-valley/ohtama.pdf --pages 2 --prefix otama-trail-map-east --width 2200 --quality 88 --force
```


## Subfolders

* `tachikawa-hatonosu/` - photos from Tachikawa Online's Hatonosu walk page. See the README in that folder.
