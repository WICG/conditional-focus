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

## Suggested Solution and Demo
* See [spec-draft](https://eladalon1983.github.io/conditional-focus/index.html) for a suggested solution for this issue.
* This solution is implemented in Chrome starting with m95. It is gated by `--enable-blink-features=ConditionalFocus`. (Or enable `Experimental Web Platform features` on chrome://flags.)
* A [demo](https://eladalon1983.github.io/conditional-focus/demo/) is available. It works with Chrome m95 and up.

## Sample Code
```
const stream = await navigator.mediaDevices.getDisplayMedia();
track.focus(ShouldFocus(stream) ? "focus-captured-surface" : "no-focus-change")

function ShouldFocus(stream) {
  const [track] = stream.getVideoTracks();
  if (sampleUsesCaptureHandle) {
    // Assume logic discriminating focusability by origin,
    // for instance focusing anything except https://collaborator.com.
    const captureHandle = track.getCaptureHandle();
    return ShouldFocusOrigin(captureHandle && captureHandle.origin);
  } else {  // Assume Capture Handle is not a thing.
    // Assume the application is only interested in focusing tabs, not windows.
    return track.getSettings().displaySurface == 'browser';
  }
}
```

## Security Concerns
One noteworthy security concerns is that allowing switching focus at an arbitrary moment could allow clickjacking attacks. The [suggested spec](https://eladalon1983.github.io/conditional-focus/index.html) addresses this concern by limiting the time when focus-switching may be triggered/suppressed - the application may only decide about focus immediately[\*] upon the resolution of the `Promise<MediaStream>`. (See the [spec-draft](https://eladalon1983.github.io/conditional-focus/index.html) for more details about what "immediately" means and how I suggest various edge-cases be handled.)
