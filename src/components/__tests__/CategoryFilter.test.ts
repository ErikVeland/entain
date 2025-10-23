import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CategoryFilter from '../CategoryFilter.vue'

describe('CategoryFilter', () => {
  const mockCategories = [
    {
      id: '1',
      name: 'Horse',
      active: true
    },
    {
      id: '2',
      name: 'Greyhound',
      active: false
    },
    {
      id: '3',
      name: 'Harness',
      active: true
    }
  ]

  it('renders all category buttons', () => {
    const wrapper = mount(CategoryFilter, {
      props: {
        categories: mockCategories
      }
    })

    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBe(3)
    
    expect(buttons[0].text()).toContain('Horse')
    expect(buttons[1].text()).toContain('Greyhound')
    expect(buttons[2].text()).toContain('Harness')
  })

  it('applies active class to active categories', () => {
    const wrapper = mount(CategoryFilter, {
      props: {
        categories: mockCategories
      }
    })

    const buttons = wrapper.findAll('button')
    expect(buttons[0].classes()).toContain('bg-brand-primary')
    expect(buttons[1].classes()).not.toContain('bg-brand-primary')
    expect(buttons[2].classes()).toContain('bg-brand-primary')
  })

  it('emits toggle-category event when button is clicked', async () => {
    const wrapper = mount(CategoryFilter, {
      props: {
        categories: mockCategories
      }
    })

    const buttons = wrapper.findAll('button')
    await buttons[1].trigger('click')
    
    expect(wrapper.emitted('toggle-category')).toBeTruthy()
    expect(wrapper.emitted('toggle-category')![0]).toEqual(['2'])
  })

  it('sets aria-pressed attribute correctly', () => {
    const wrapper = mount(CategoryFilter, {
      props: {
        categories: mockCategories
      }
    })

    const buttons = wrapper.findAll('button')
    expect(buttons[0].attributes('aria-pressed')).toBe('true')
    expect(buttons[1].attributes('aria-pressed')).toBe('false')
    expect(buttons[2].attributes('aria-pressed')).toBe('true')
  })
})