async function getDisplayMedia(focusTabs, focusWindows) {
  const controller = new CaptureController();
  const options = {
    selfBrowserSurface: "exclude", // Exclude the current tab from the list of tabs offered to the user.
    controller: controller,
  };

  log("Prompting the user to choose what to share.");
  const stream = await navigator.mediaDevices.getDisplayMedia(options);
  document.querySelector("video").srcObject = stream;
  const [track] = stream.getVideoTracks();
  const surface = track.getSettings().displaySurface;

  let focusBehavior;
  if (surface == "browser") {
    focusBehavior = focusTabs ? "focus-captured-surface" : "no-focus-change";
  } else if (surface == "window") {
    focusBehavior = focusWindows ? "focus-captured-surface" : "no-focus-change";
  }

  if (focusBehavior !== undefined) {
    const decisionAsString =
      focusBehavior == "focus-captured-surface"
        ? "Focusing the captured"
        : "Not focusing the captured";
    const surfaceAsString = surface == "broswer" ? "tab" : "window";
    log(`${decisionAsString} ${surfaceAsString}.`);

    controller.setFocusBehavior(focusBehavior);
  } else {
    log("Screen cannot be focused - no action taken.");
  }
}

captureButton.onclick = async () => {
  const focusTabs = document.getElementById("focusTabsCheckbox").checked;
  const focusWindows = document.getElementById("focusWindowsCheckbox").checked;
  getDisplayMedia(focusTabs, focusWindows);
};

/* Utils */

function log(text) {
  logs.textContent += `${text}\r\n`;
}
