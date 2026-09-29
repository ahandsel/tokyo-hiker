# Hero image speech bubble

Adapted from the Tokyo Geek theme.
Clicking the home page hero image shows "Let's go hiking!" for 1.8 seconds before it fades away.
The image also supports Enter and Space when focused.


## Files

* `index.ts` registers delegated click and keyboard handlers that work across page navigation.
* `style.css` styles the bubble using the current light or dark theme colors.

The parent theme calls `wireHeroSpeechBubble()` with the message and marks the hero image as a keyboard accessible button.
The image keeps its `no-viewer` class to exclude it from the image viewer.
