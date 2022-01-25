import query from './query.js'

const makeSelector = node => {
  const {
    className,
    attrs: { name, id },
  } = node
  const nameList = (name || '')
    .trim()
    .split(/\s+/g)
    .filter(n => n)
    .map(name => `.${name}`)
    .join('')

  return [`${className}`, id ? `#${id}` : '', nameList].join('').trim()
}

const renderItem = node => {
  const {
    className: nodeName,
    attrs: { name: className, id },
    children = [],
  } = node
  const hasChildren = children.length > 0
  const selector = makeSelector(node).trim()

  return [
    `<div class="node-item closed" data-selector="${selector}">`,
    '<div class="node-name-row">',
    '<button class="expand-button">',
    hasChildren && '<span class="expand">+</span>',
    hasChildren && '<span class="unexpand">-</span>',
    '</button>',
    '<span class="node-name start">',
    ` &lt;${nodeName}`,
    id && ` <i class="key">id</i>="<i class="value">${id}</i>"`,
    className?.trim() && ` <i class="key">class</i>="<i class="value">${className?.trim()}</i>"`,
    ' /&gt;',
    '</span>',
    '</div>',
    children.map(child => renderItem(child)).join(''),
    '</div>',
  ]
    .filter(v => v)
    .join('')
  return div
}

const _renderAttrs = attrs => {
  const panelBody = document.querySelector('.prop-list')
  panelBody.innerHTML = Object.keys(attrs || {})
    .filter(key => key !== 'children')
    .map(key => {
      return `<li class="attr-row"><span class="key">${key}:</span><span class="value">${JSON.stringify(
        attrs[key],
      )}</span></li>`
    })
    .join('')
}

const renderAttrs = node => {
  const tab = document.querySelector('.tab.selected')
  const isAttrs = tab.classList.contains('attrs-tab')
  const isProps = tab.classList.contains('props-tab')
  if (isAttrs) {
    _renderAttrs(node.attrs)
  } else if (isProps) {
    _renderAttrs(node)
  }
}

const renderPath = selector => {
  const selectors = selector.split(' ')
  document.querySelector('.elements-path').innerHTML = selectors
    .map(s => `<button class="plain-btn">${s}</button>`)
    .join('')
}

const getSelector = (el, selectors = []) => {
  const item = el.closest('.node-item')
  const selector = item.dataset.selector
  const parent = item.parent?.closest('.node-item')

  console.log(selectors)

  selectors.unshift(selector)

  if (parent) {
    return getSelector(parent, selectors)
  }
  return selectors.join('')
}

window.render = stageData => {
  let inspectedNode
  let inspectedType
  const tree = document.querySelector('.elements-tree')
  tree.innerHTML = renderItem(stageData)
  tree.addEventListener('click', e => {
    const { target } = e
    const item = target.closest('.node-item')
    if (target.closest('.expand-button')) {
      item.classList.toggle('closed')
    } else {
      tree.querySelector('.selected')?.classList.remove('selected')
      target.closest('.node-name-row')?.classList.add('selected')
    }

    if (item) {
      const selector = getSelector(item)
      console.log(item, selector)
      const [node] = query({ children: [stageData] }, selector)
      if (node) {
        inspectedNode = node
        renderAttrs(node)
        renderPath(selector)
      }
    }
  })

  const tabs = document.querySelector('.sidebar .tabs')

  tabs.addEventListener('click', e => {
    const tab = e.target.closest('.tab')
    if (tab) {
      tabs.querySelector('.selected')?.classList.remove('selected')
      tab.classList.add('selected')
      renderAttrs(inspectedNode)
    }
  })
}
