const isShape = node => node.className
const isString = t => typeof t === 'string'

export const isIdSelector = s => s.startsWith('#')
export const isClassSelector = s => s.startsWith('.')
export const isNameSelector = s => /^[\w-_]+/.test(s)
export const match = (node, selector) => {
  const selectors = selector.match(/([#\.]?[\w-_]+)/g)
  const result = selectors.every(selector => {
    const word = selector.slice(1)
    if (isIdSelector(selector)) {
      return word === node.attrs.id
    }
    if (isClassSelector(selector)) {
      return node.attrs.name.indexOf(word) >= 0
    }
    if (isNameSelector(selector)) {
      return selector === node.className
    }
  })
  console.log('match', node, selector, result)
  return result
}

export const treeFind = (node, selector, result = []) => {
  node.children?.forEach(child => {
    const matched = match(child, selector)
    if (matched) {
      result.push(child)
    }
    if (child.children) {
      treeFind(child, selector, result)
    }
  })

  return result
}

const matchAttribute = (node, key, value, op) => {
  const property = node.getAttr(key).toString()
  switch (op) {
    case '=':
      return property === value
    case '!=':
      return property !== value
    case '^=':
      return isString(property) && property.startsWith(value)
    case '$=':
      return isString(property) && property.endsWith(value)
    case '*=':
      return isString(property) && property.indexOf(value) >= 0
    case '~=':
      return isString(property) && property.split(/\s+/g).indexOf(value) >= 0
    default:
      return Object.hasOwnProperty.call(node.attrs, key)
  }
}
const findPseudoNode = (nodes, op, operand) => {
  switch (op) {
    case 'eq': {
      return operand ? [nodes[Number(operand)]] : null
    }
    case 'first-child': {
      return [nodes[0]]
    }
    case 'last-child': {
      return [nodes[nodes.length - 1]]
    }
    case 'has': {
      return isString(operand) ? nodes.filter(node => query(node, operand).length) : null
    }
  }
  return null
}
const coreSelectorPattern = /(^[^:\[\()]+)/
const attrSelectorPattern = /^\[([^^!|~*$=]+)(([\^!|~*$]?=)['"]?([^"'\]]+)['"]?)?\]/
const pseudoSelectorPattern = /^:(eq|first-child|has)(\(([^)]+)\))?/
const find = (container, selector) => {
  const coreSelector = selector.match(coreSelectorPattern)
  let nodes = []
  if (coreSelector) {
    // 拿掉 coreSelector
    selector = selector.replace(coreSelector[0], '')
    nodes = treeFind(container, coreSelector[1])
  }

  if (!selector || !nodes?.length) {
    return nodes
  }
  const attrSelector = selector.match(attrSelectorPattern)
  if (attrSelector) {
    const key = attrSelector[1]
    const op = attrSelector[3]
    const value = attrSelector[4]
    return nodes.filter(node => matchAttribute(node, key, value, op))
  }
  const pseudoSelector = selector.match(pseudoSelectorPattern)
  if (pseudoSelector) {
    const foundNodes = findPseudoNode(nodes, pseudoSelector[1], pseudoSelector[3])
    if (foundNodes) {
      nodes = foundNodes
    }
  }

  return nodes
}
const shadowOprands = ['>', '+', '~']
const isShallowSelector = s => shadowOprands.includes(s[0])
const shallowFind = (node, selector) => {
  const operand = selector[0]
  selector = selector.slice(1)
  const { parent } = node
  if (!parent) {
    return []
  }
  switch (operand) {
    case '>':
      if (node.hasChildren()) {
        const { children = [] } = node
        return parent.find(selector).filter(n => children.includes(n))
      }
      break
    case '+':
      return parent.find(selector).filter(n => n !== node)
    case '~':
      parent.find(selector).filter(n => n.index === node.index + 1)
      break
  }
  return []
}
/**
 * 层级选择器
 * 示例：
 * ```ts
 * query(stage, '.floor-levels-elevation') // class name
 * query(stage, '#id-1') // id
 * query(stage, 'EditableText') // node type
 * query(stage, '.a .b') // => [.b]  级联选择器
 * query(stage, '.a:first-child') // => [.a:first-child]  伪类选择器
 * query(stage, '.a:eq(1)') // => [.a:eq(1)]  带参数的伪类选择器
 * query(stage, '.a:has(Text[text="F1"])') // => [.a] 返回所有包含 Text[text="F1"] 子元素的 [.a]
 * query(stage, '.a:first-child .b') => [.b] // stage -> .a:first-child -> .b 级联与伪类组合
 * query(stage, '.floor-levels-elevation:first-child EditableText') => [EditableText] // stage -> .a:floor-levels-elevation -> EditableText
 * ```
 */
const query = (container, selector) => {
  const selectors = selector
    .trim()
    .replace(/([>+~])\s*/g, '$1')
    .split(/\s+/g)
  let nodes = [container]

  while (selectors.length) {
    const s = selectors.shift()
    if (isShallowSelector(s)) {
      return shallowFind(container, s)
    }
    nodes = nodes.reduce((acc, node) => find(node, s), [])
    if (!nodes?.length) return nodes
  }
  return nodes
}

export default query
export { find, query, shallowFind }
