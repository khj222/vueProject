import Vue from 'vue'
import app from '~/app'

describe('app', () => {
  it('app data.test must equal to 1', () => {
    let comp = new Vue(app)
    expect(comp.$data.test).toBe(1)
  })
})
