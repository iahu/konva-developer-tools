chrome.devtools.panels.create('Kad', 'images/ghost_32.png', 'panel.html', function (panel) {
  // var port = chrome.runtime.connect({
  //   name: 'KonvaInspector',
  // })

  // port.postMessage({
  //   tabId: chrome.devtools.inspectedWindow.tabId,
  // })

  // port.onMessage.addListener(function (message) {
  //   console.log('devtools onmessage', message)
  // })

  panel.onShown.addListener(panelWindow => {
    chrome.runtime.sendMessage({ panelShown: true })
    chrome.runtime.onMessage.addListener(e => {
      const { stageData } = e || {}
      if (stageData) {
        panelWindow.render(stageData)
      }
    })
  })
})
