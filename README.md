# Conditional Focus

## Problem
When an application starts capturing a display-surface, the user agent faces a decision - should the captured display-surface be brought to the forefront, or should the capturing application retain focus.

The user agent is mostly agnostic of the nature of the capturing and captured applications, and is therefore ill-positioned to make an informed decision.

In contrast, the capturing application is familiar with its own properties, and is therefore better suited to make this decision. Moreover, by reading [displaySurface](https://www.w3.org/TR/screen-capture/#dom-mediatrackconstraintset-displaysurface) and/or using [Capture Handle](https://wicg.github.io/capture-handle/), the capturing application can learn about the captured display-surface, driving an even more informed decision.

## Sample Use Case
For **example**, a video conferencing application **may** wish to:
* Focus a captured application that users typically interact with during the call, like a text editor.
* Retain for itself focus when the captured display-surface is non-interactive content, like a video.
  * (Using [Capture Handle](https://wicg.github.io/capture-handle/), the capturing application may even allow the user to remotely start/pause the video.)

## Solution
Before calling `getDisplayMedia()`, apps can now produce a `CaptureController` object, and pass it in as an additional dictionary key-value pair.

By calling `setFocusBehavior()` on the controller, apps can now control whether the captured display surface will be focused or not.

It is possible to call `setFocusBehavior()` arbitrarily many times before calling `getDisplayMedia()`. Only the last invocation will have an effect.

```js
// Example #1 - unconditional decision.

const controller = new CaptureController;
controller.setFocusBehavior("focus-captured-surface");
const stream = await navigator.mediaDevices.getDisplayMedia({
  video: true,
  controller: controller
});
```

It is also possible to call `setFocusBehavior()` immediately after `getDisplayMedia()`'s promise resolves. This can be done at most once, immediately, or not at all. Naturally, this last invocation also overrides any previous invocations.

```js
// Example #2 - conditional decision.

const controller = new CaptureController;
const stream = await navigator.mediaDevices.getDisplayMedia({
  video: true,
  controller: controller
});

// Focus tabs; avoid focusing windows.
const [track] = stream.getVideoTracks();
const surfaceType = track.getSettings().displaySurface;
if (surfaceType == "browser") {
  controller.setFocusBehavior("focus-captured-surface");
} else if (surfaceType == "window") {
  controller.setFocusBehavior("no-focus-change");
}
```

It is possible to make interesting decisions based on the captured content's Capture Handle.

```js
// Example #3 - conditional decision using Capture Handle.

const controller = new CaptureController;
const stream = await navigator.mediaDevices.getDisplayMedia({
  video: true,
  controller: controller
});

// Focus anything other than tabs dialed in to some specific URL.
const [track] = stream.getVideoTracks();
if (track.getSettings().displaySurface == "browser" &&
    track.getCaptureHandle().origin == "https://some.specific.url") {
  controller.setFocusBehavior("no-focus-change");
} else {
  controller.setFocusBehavior("focus-captured-surface");
}

## Limitations

If the API were not limited, capturing applications could have used it to focus the captured application at an arbitrary moment. That would have presented severe security problems; for example, a malicious application could have tricked the user into double-clicking at an arbitrary point, then focused the captured tab/window in between the two clicks, and thereby produced a click in the captured app in a point of its choosing.

To prevent such issues, there is a limited window of opportunity to call `setFocusBehavior()` once capture starts. This window closes with the earlier of the following:
1. After a second.
2. One task after the `getDisplayMedia()` promise resolves. (More accurately, a task is queued before resolving the promise, and once it executes, the window closes.)

The following two examples would therefore not work:

```js
// INCORRECT USAGE #1.

const controller = new CaptureController;
const stream = await navigator.mediaDevices.getDisplayMedia({
  video: true,
  controller: controller
});

const start = new Date();
while (new Date() - start <= 1000) {
  ;  // Idle for 1s + epsilon.
}

// Because too much time has elapsed,
// the browser will have already made a decision
// as to whether to focus or not, and the window
// of opportunity is now closed.
controller.setFocusBehavior("focus-captured-surface");
```

```js
// INCORRECT USAGE #2.

const controller = new CaptureController;
const stream = await navigator.mediaDevices.getDisplayMedia({
  video: true,
  controller: controller
});

// This task will be queued behind the the task
// that closes the window of opportunity to
// call setFocusBehavior().
setTimeout(() => {
  controller.setFocusBehavior("focus-captured-surface");
});
```

