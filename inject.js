function injectScript(file, node) {
  var s = document.createElement('script')
  s.setAttribute('type', 'text/javascript')
  s.setAttribute('src', file)
  document.body.appendChild(s)
}

window.addEventListener('message', e => {
  const elements = e.data.elements
  if (elements) {
    const stageData = JSON.parse(elements)
    chrome.runtime.sendMessage({ stageData })
    console.log('inject sendMessage')
  }
})

injectScript(chrome.extension.getURL('/detector.js'))
