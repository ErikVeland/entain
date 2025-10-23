import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RunnerRow from '../RunnerRow.vue'

// Mock runner data
const mockRunner = {
  number: 1,
  name: 'Thunder Bay',
  weight: '58kg',
  jockey: 'J: R Vaibhav',
  odds: '2.40',
  oddsTrend: 'up',
  silkColor: 'bg-blue-500'
}

describe('RunnerRow', () => {
  it('renders properly with runner data', () => {
    const wrapper = mount(RunnerRow, {
      props: {
        runner: mockRunner
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
        }
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
        }
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
        }
      }
    })

    const oddsButton = wrapper.find('button')
    expect(oddsButton.classes()).not.toContain('bg-success')
    expect(oddsButton.classes()).not.toContain('bg-danger')
  })
})