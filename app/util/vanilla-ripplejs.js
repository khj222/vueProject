/* eslint-disable */
window.addEventListener('load', function () {
  function applyStyle (css) {
    var style = document.createElement('style')
    style.type = 'text/css'
    if (style.styleSheet) {
      style.styleSheet.cssText = css
    } else {
      style.appendChild(document.createTextNode(css))
    }
    document.head.insertBefore(style, document.head.firstChild)
  }

  function hasCSS () {
    var test = document.createElement('div')
    test.className = 'rippleJS'
    document.body.appendChild(test)
    var s = window.getComputedStyle(test)
    var result = s.position == 'absolute'
    document.body.removeChild(test)
    return result
  }

  if (!hasCSS()) {
    var css = `
/*rippleJS*/
.rippleJS,.rippleJS.fill::after{position:absolute; top:0; left:0; right:0; bottom:0}
.rippleJS{display:block; overflow:hidden; border-radius:inherit; -webkit-mask-image:-webkit-radial-gradient(circle,#fff,#000)}
.rippleJS.fill::after{content:""}
.rippleJS.fill{border-radius:1000000px}
.rippleJS .ripple{
  position:absolute; 
  border-radius:100%; 
  background:currentColor; 
  opacity:.2; 
  width:0; height:0; 
  -webkit-transition:-webkit-transform .4s ease-out,opacity .4s ease-out; 
  transition:transform .4s ease-out,opacity .4s ease-out; 
  -webkit-transform:scale(0); 
  transform:scale(0); 
  pointer-events:none; 
  -webkit-touch-callout:none; 
  -webkit-user-select:none; 
  -khtml-user-select:none; 
  -moz-user-select:none; 
  -ms-user-select:none; 
  user-select:none
}
.rippleJS .ripple.held{opacity:.4; -webkit-transform:scale(1); transform:scale(1)}
.rippleJS .ripple.done{opacity:0}`
    applyStyle(css)
  }

  function startRipple (type, at) {
    var holder = at.target
    var cl = holder.classList
    if (!cl.contains('rippleJS')) {
      return false  // ignore
    }

    // Store the event use to generate this ripple on the holder: don't allow
    // further events of different types until we're done. Prevents double-
    // ripples from mousedown/touchstart.
    var prev = holder.getAttribute('data-event')
    if (prev && prev != type) {
      return false
    }
    holder.setAttribute('data-event', type)

    // Create and position the ripple.
    var rect = holder.getBoundingClientRect()
    var x = at.offsetX
    var y
    if (x !== undefined) {
      y = at.offsetY
    } else {
      x = at.clientX - rect.left
      y = at.clientY - rect.top
    }
    var ripple = document.createElement('div')
    var max
    if (rect.width == rect.height) {
      max = rect.width * 1.412
    } else {
      max = Math.sqrt(rect.width * rect.width + rect.height * rect.height)
    }
    var dim = max * 2 + 'px'
    ripple.style.width = dim
    ripple.style.height = dim
    ripple.style.marginLeft = -max + x + 'px'
    ripple.style.marginTop = -max + y + 'px'

    // Activate/add the element.
    ripple.className = 'ripple'
    holder.appendChild(ripple)

    var remove = function () {
      if (ripple) {
        holder.removeChild(ripple)
        ripple = null
      }
      if (!holder.children.length) {
        cl.remove('active')
        holder.removeAttribute('data-event')
      }
    }

    var releaseEvent = (type == 'mousedown' ? 'mouseup' : 'touchend')
    var release = function (ev) {
      window.clearTimeout(holdTimeout)
      document.removeEventListener(releaseEvent, release)
      if (!ripple) return
      var rect2 = holder.getBoundingClientRect()
      let moved = Math.abs(rect.left - rect2.left) + Math.abs(rect.top - rect2.top)
      if (moved) remove()
      else { // fire ripple if not moved
        ripple.classList.add('held')
        ripple.classList.add('done')
        window.setTimeout(remove, 650)
      }
    }
    let holdTimeout = window.setTimeout(release, 60)
    document.addEventListener(releaseEvent, release)
  }

  document.addEventListener('mousedown', function (ev) {
    if (ev.button == 0) {
      // trigger on left click only
      startRipple(ev.type, ev)
    }
  })
  document.addEventListener('touchstart', function (ev) {
    for (var i = 0; i < ev.changedTouches.length; ++i) {
      startRipple(ev.type, ev.changedTouches[i])
    }
  })
})
