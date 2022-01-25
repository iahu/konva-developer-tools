setTimeout(() => {
  const kadStage = window.__KAD_STAGE__
  const elements = kadStage.toJSON()

  if (kadStage) {
    window.postMessage({ elements }, '*')
  }
}, 100)
