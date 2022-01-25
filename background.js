let data

chrome.runtime.onMessage.addListener(e => {
  console.log('background received:', e)
  if (e.stageData) {
    data = e
  } else if (e.panelShown) {
    chrome.runtime.sendMessage(data)
  }
})

chrome.runtime.onConnect.addListener(function (port) {
  var devToolsListener = function (message, sender, sendResponse) {
    console.log('background onConnect', message)
    port.postMessage({ response: 'ok', msg: message, sender: sender })
    chrome.runtime.sendMessage({ msg: 'ok' })
  }

  port.onMessage.addListener(devToolsListener)
  port.onDisconnect.addListener(() => port.onMessage.removeListener(devToolsListener))
})
