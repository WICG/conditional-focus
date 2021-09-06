# Conditional Focus

When an application captures a display-surface, the user agent faces a decision - should the captured display-surface be brought to the forefront, or should the capturing application retain focus.

The user agent is mostly agnostic of the nature of the capturing and captured applications, and is therefore ill-positioned to make an informed decision.

In contrast, the capturing application is familiar with its own properties, and is therefore better suited to make this decision. Moreover, by reading [displaySurface](https://www.w3.org/TR/screen-capture/#dom-mediatrackconstraintset-displaysurface) and/or using [Capture Handle](https://wicg.github.io/capture-handle/), the capturing application can learn about the captured display-surface, driving an even more informed decision.

For **example**, a video conferencing application **may** wish to:
* Focus a captured application that users typically interact with during the call, like a text editor.
* Retain for itself focus when the captured display-surface is non-interactive content, like a video.

More details:
* Spec draft [here](https://eladalon1983.github.io/conditional-focus/index.html).
* Demo [here](https://eladalon1983.github.io/conditional-focus/demo/).
