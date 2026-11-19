# Offline ready toast

Shows "Ready to use offline" at the bottom of the screen when the service worker finishes saving the site for offline use.
The message fades away after 8 seconds, or when the reader closes it.

It appears once per browser, the first time the site is saved.
On iPhone, an app added to the Home Screen keeps its own storage, so it shows the message again on its first launch.
A later deploy updates the saved copy without a message.


## Files

* `index.ts` exports `showOfflineReadyToast()`, which builds the message and removes it again.
* `style.css` styles the message using the current light or dark theme colors.

[../pwa-update.ts][pwa-update] calls `showOfflineReadyToast()` from the `onOfflineReady` callback of `registerSW`.

<!-- Internal links -->

[pwa-update]: ../pwa-update.ts
