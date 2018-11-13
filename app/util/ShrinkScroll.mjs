export function ShrinkScroll (vm, path, ref, {top = 0, bottom = 0, shrunkItems = 15} = {}) {
  ref = ref.replace(/\[(\d+)]/g, '.$1').split('.')
  Object.assign(this, {vm, ref, top, bottom, shrunkItems, path})
  this.init()
}

ShrinkScroll.prototype.getList = function () {
  if (this.prop) return this.data[this.prop]
  if (this.vm.$data === undefined) return
  let paths = this.path.replace(/\[(\d+)]/g, '.$1').split('.')
  this.prop = paths.pop()
  let data = this.vm
  for (let prop of paths) {
    if (data[prop] === undefined) {
      throw new Error('Can not find path from vm. declare it upfront in the data option.')
    } else data = data[prop]
  }
  this.data = data
  return this.data[this.prop]
}
ShrinkScroll.prototype.getScroll = function () {
  let ref = this.vm.$refs[this.ref[0]]
  return !ref || (this.ref.length === 1) ? ref : ref[this.ref[1]]
}

ShrinkScroll.prototype.init = function () {
  this.list = this._list = this.getList()
  this.idx = 0
  this._scrollTop = 0
  this.shrunk = false
}
ShrinkScroll.prototype.shrink = function () {
  if (!this.list) this.list = this._list = this.getList()
  if (this.list !== this.getList()) return // 원본 리스트가 변했을경우 restore 호출 전까지 동작하지 않음
  if (this.list.length <= this.shrunkItems) return
  let scroll = this.getScroll()
  if (scroll) {
    let itemHeight = (scroll.scrollHeight - this.bottom - this.top) / this.list.length
    let scrollTop = scroll.scrollTop - this.top
    this.idx = Math.max(Math.floor(scrollTop / itemHeight), 0)
    this._scrollTop = scroll.scrollTop
    if (scrollTop > 0) scroll.scrollTop = this.top + (scroll.scrollTop - this.top) % itemHeight
  } else this.idx = 0
  this.list = this.list.slice(this.idx, this.idx + this.shrunkItems)
  this.vm.$set(this.data, this.prop, this.list)
  this.shrunk = true
  return this.vm.$nextTick()
}

ShrinkScroll.prototype.restore = function () {
  if (!this.list) this.list = this._list = this.getList()
  if (this.list !== this.getList()) this._list = this.getList() // 바뀐 경우
  if (this.list === this._list) return
  let scroll = this.getScroll()
  this.list = this._list
  this.vm.$set(this.data, this.prop, this.list)
  this.shrunk = false
  if (this.idx === 0 || !scroll) return Promise.resolve()
  else return this.vm.$nextTick().then(() => (scroll.scrollTop = this._scrollTop))
}
