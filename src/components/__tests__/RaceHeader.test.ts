import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RaceHeader from '../RaceHeader.vue'
import { CATEGORY_IDS } from '../../stores/races'

describe('RaceHeader', () => {
  it('renders properly with horse category', () => {
    const wrapper = mount(RaceHeader, {
      props: {
        meetingName: 'WARRAGUL',
        raceNumber: 12,
        categoryId: CATEGORY_IDS.HORSE,
        startTime: Date.now() + 120000 // 2 minutes in the future
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('WARRAGUL R12')
    expect(wrapper.text()).toContain('🏇')
  })

  it('renders properly with greyhound category', () => {
    const wrapper = mount(RaceHeader, {
      props: {
        meetingName: 'KOLKATA',
        raceNumber: 1,
        categoryId: CATEGORY_IDS.GREYHOUND,
        startTime: Date.now() + 120000 // 2 minutes in the future
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('KOLKATA R1')
    expect(wrapper.text()).toContain('🐕')
  })

  it('renders properly with harness category', () => {
    const wrapper = mount(RaceHeader, {
      props: {
        meetingName: 'KILMORE',
        raceNumber: 2,
        categoryId: CATEGORY_IDS.HARNESS,
        startTime: Date.now() + 120000 // 2 minutes in the future
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('KILMORE R2')
    expect(wrapper.text()).toContain('🛞')
  })

  it('displays countdown timer', () => {
    const wrapper = mount(RaceHeader, {
      props: {
        meetingName: 'WARRAGUL',
        raceNumber: 12,
        categoryId: CATEGORY_IDS.HORSE,
        startTime: Date.now() + 120000 // 2 minutes in the future
      }
    })

    expect(wrapper.text()).toMatch(/\d+m \d+s/)
  })
})