import { scriptItems } from './scriptItems.js'

const booleanAttrs = new Set(['async', 'defer', 'nomodule'])
const skipAttrs = new Set(['async', 'defer'])

function applyAttrs(el, attrs) {
  for (const [key, value] of Object.entries(attrs)) {
    if (skipAttrs.has(key)) {
      // When injecting dynamically, async/defer can break execution order.
      continue
    }
    if (booleanAttrs.has(key)) {
      el.setAttribute(key, '')
      continue
    }
    if (value === true) {
      el.setAttribute(key, '')
    } else if (value != null) {
      el.setAttribute(key, value)
    }
  }
}

function withCacheBust(src) {
  if (!src) return src
  if (src.includes('rs6.min__q_ver_6.7.34.js') || src.includes('rbtools.min__q_ver_6.7.29.js')) {
    return src.includes('?') ? src : `${src}?v=patched`
  }
  return src
}

function shouldSkip(item) {
  const attrs = item.attrs || {}
  const src = attrs.src || ''
  const id = attrs.id || ''
  const content = item.content || ''

  if (src.includes('code.tidio.co')) return true
  if (src.includes('/trx_demo/')) return true
  if (src.includes('woocommerce/assets/js/frontend/cart-fragments')) return true
  if (id.includes('trx_demo')) return true
  if (id.includes('wc-cart-fragments')) return true
  if (content.includes('TRX_DEMO_STORAGE')) return true
  if (content.includes('trx_demo_panels')) return true

  return false
}

export async function loadScriptsSequentially() {
  for (const item of scriptItems) {
    if (shouldSkip(item)) {
      continue
    }
    const script = document.createElement('script')
    const attrs = { ...(item.attrs || {}) }
    if (attrs.src) attrs.src = withCacheBust(attrs.src)
    applyAttrs(script, attrs)

    if (item.content) {
      script.text = item.content
      document.body.appendChild(script)
      continue
    }

    const src = attrs && attrs.src
    if (src) {
      await new Promise((resolve, reject) => {
        script.onload = resolve
        script.onerror = reject
        document.body.appendChild(script)
      })
      continue
    }

    document.body.appendChild(script)
  }

  // Force RevSlider to initialize after all scripts are in place
  try {
    if (window.RS_MODULES && typeof window.RS_MODULES.checkMinimal === 'function') {
      window.RS_MODULES.checkMinimal()
    }
    if (window.RS_MODULES && typeof window.RS_MODULES.callSliders === 'function') {
      window.RS_MODULES.callSliders()
    }
    if (window.jQuery) {
      window.jQuery(window).trigger('resize')
    }
    document.documentElement.classList.add('rs-ready')
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('RevSlider init failed:', e)
  }
}
