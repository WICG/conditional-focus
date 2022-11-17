async function getDisplayMedia(shouldFocus) {
  const controller = new CaptureController();
  const options = {
    selfBrowserSurface: "exclude", // Exclude the current tab from the list of tabs offered to the user.
    controller: controller,
  };
  log("Prompt user to share contents of the screen...");
  const stream = await navigator.mediaDevices.getDisplayMedia(options);
  document.querySelector("video").srcObject = stream;
  const [track] = stream.getVideoTracks();
  if (shouldFocus(track)) {
    log("> Success! The captured surface was focused.");
    controller.setFocusBehavior("focus-captured-surface");
  } else {
    log("> Success! The captured surface was NOT focused.");
    controller.setFocusBehavior("no-focus-change");
  }
}

button1.onclick = async () => {
  const shouldNeverFocus = () => false;
  getDisplayMedia(shouldNeverFocus);
};

button2.onclick = async () => {
  const shouldFocusIfTab = (track) => {
    return track.getSettings().displaySurface == "browser";
  };
  getDisplayMedia(shouldFocusIfTab);
};

button3.onclick = async () => {
  const shouldFocusIfWindow = (track) => {
    return track.getSettings().displaySurface == "window";
  };
  getDisplayMedia(shouldFocusIfWindow);
};

/* Utils */

function log(text) {
  logs.textContent += `${text}\r\n`;
}
