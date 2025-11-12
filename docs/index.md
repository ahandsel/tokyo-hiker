---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'Tokyo Hiker 🥾'
  text: 'Hiking options near Tokyo'
  tagline: Believe it or not but there are a lot of hiking options in Tokyo!
  image:
    src: /hiker.png
    alt: ahandsel Cat, white cat coding on a laptop
    width: 250px
    height: 250px
  # actions:
  #   - theme: brand
  #     text: Markdown Examples
  #     link: /markdown-examples
  #   - theme: alt
  #     text: API Examples
  #     link: /api-examples

features:
  # add emojis for each feature
  - title: Easy hikes
    details: Great for first-time hikers or those looking for a relaxing stroll.
    link: /level-1/
    icon: 👟
  - title: Intermediate hikes
    details: Well maintained trails with some steep sections.
    link: /level-2/
    icon: 🥾
  - title: Challenging hikes
    details: Work up a sweat on trails with steep sections.
    link: /level-3/
    icon: 💪
  - title: Hiking maps
    details: Highly recommend using YAMAP for hiking in Japan.
    link: /maps/
    icon:
      dark: /yamap-icon/yamap-icon-white.svg
      light: /yamap-icon/yamap-icon-color.svg
      src: /yamap-icon/yamap-icon-color.svg
      alt: YAMAP logo
      width: 32px
      height: 32px
---

<!-- markdownlint-disable MD041 -->

<!--@include: ./snippets/trail-difficulty.md-->

---

<!--@include: ./about.md-->
