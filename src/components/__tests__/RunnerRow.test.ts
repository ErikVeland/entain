import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import RunnerRow from '../RunnerRow.vue'

// Mock runner data
const mockRunner = {
  id: 'runner1',
  number: 1,
  name: 'Thunder Bay',
  weight: '58kg',
  jockey: 'J: R Vaibhav',
  odds: '2.40',
  oddsTrend: 'up',
  silkColor: 'bg-blue-500'
}

describe('RunnerRow', () => {
  beforeEach(() => {
    // Create a new pinia instance and make it active
    setActivePinia(createPinia())
  })

  it('renders properly with runner data', () => {
    const wrapper = mount(RunnerRow, {
      props: {
        runner: mockRunner,
        raceId: 'race1',
        raceName: 'Test Race',
        raceNumber: 1
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('1. Thunder Bay')
    expect(wrapper.text()).toContain('J: R Vaibhav 58kg')
    expect(wrapper.text()).toContain('2.40')
    expect(wrapper.text()).toContain('▲')
  })

  it('applies correct styling for odds trend up', () => {
    const wrapper = mount(RunnerRow, {
      props: {
        runner: {
          ...mockRunner,
          oddsTrend: 'up'
        },
        raceId: 'race1',
        raceName: 'Test Race',
        raceNumber: 1
      }
    })

    const oddsButton = wrapper.find('button')
    expect(oddsButton.classes()).toContain('bg-success')
  })

  it('applies correct styling for odds trend down', () => {
    const wrapper = mount(RunnerRow, {
      props: {
        runner: {
          ...mockRunner,
          oddsTrend: 'down'
        },
        raceId: 'race1',
        raceName: 'Test Race',
        raceNumber: 1
      }
    })

    const oddsButton = wrapper.find('button')
    expect(oddsButton.classes()).toContain('bg-danger')
  })

  it('applies neutral styling for no odds trend', () => {
    const wrapper = mount(RunnerRow, {
      props: {
        runner: {
          ...mockRunner,
          oddsTrend: 'none'
        },
        raceId: 'race1',
        raceName: 'Test Race',
        raceNumber: 1
      }
    })

    const oddsButton = wrapper.find('button')
    expect(oddsButton.classes()).not.toContain('bg-success')
    expect(oddsButton.classes()).not.toContain('bg-danger')
  })
})