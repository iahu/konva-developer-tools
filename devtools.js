chrome.devtools.panels.create(
  "Konva Inspector",
  "images/ghost_32.png",
  "panel.html",
  function(panel) {
    console.log(panel);
  }
);

var backgroundPageConnection = chrome.runtime.connect({
  name: "Konva Inspector",
});

backgroundPageConnection.onMessage.addListener(function(message) {
  console.log("onmessage", message);
  // Handle responses from the background page, if any
});

// Relay the tab ID to the background page
backgroundPageConnection.postMessage({
  tabId: chrome.devtools.inspectedWindow.tabId,
  scriptToInject: "content_script.js",
});
