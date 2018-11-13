import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.css'
import l10n from 'flatpickr/dist/l10n/ko'

export default {
  name: 'input-date',
  model: {
    event: 'change',
    prop: 'dt'
  },
  back () {
    if (this.instance && this.instance.isOpen) this.close()
    else return true
  },
  data () { return {value: null} },
  props: ['dt', 'type'],
  computed: {
    isOpen () {
      return this.instance && this.instance.isOpen
    }
  },
  mounted () {
    let emit
    if (this.$attrs.hasOwnProperty('milli')) {
      emit = x => this.$emit('change', +x)
    } else if (this.$attrs.hasOwnProperty('json')) {
      emit = x => this.$emit('change', x.toJSON())
    } else {
      emit = x => this.$emit('change', x)
    }
    this.instance = flatpickr(this.$el, {
      onValueUpdate: (selectedDates, dateStr, instance) => emit(selectedDates[0]),
      disableMobile: 'true',
      defaultDate: this.dt,
      locale: l10n.ko
    })
    this.value = this.$el.value
  },
  methods: {
    open () {
      if (this.instance) this.instance.open()
    },
    close () {
      if (this.instance) this.instance.close()
    }
  },
  beforeDestroy () {
    if (this.instance) this.instance.destroy()
  },
  watch: {
    dt (v) {
      if (this.instance) this.instance.setDate(v, false)
    }
  },
  templateSrc: './inputDate.html'
}
