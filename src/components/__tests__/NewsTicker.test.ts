import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NewsTicker from '../NewsTicker.vue'

describe('NewsTicker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders correctly when showTicker is false', () => {
    const wrapper = mount(NewsTicker)
    expect(wrapper.find('.fixed').exists()).toBe(false)
  })

  it('shows ticker when messages are added', async () => {
    const wrapper = mount(NewsTicker)
    
    // @ts-ignore - accessing component methods
    wrapper.vm.addMessage('Test message')
    
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.fixed').exists()).toBe(true)
    expect(wrapper.text()).toContain('Test message')
  })

  it('hides ticker when messages are cleared', async () => {
    const wrapper = mount(NewsTicker)
    
    // @ts-ignore - accessing component methods
    wrapper.vm.addMessage('Test message')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.fixed').exists()).toBe(true)
    
    // @ts-ignore - accessing component methods
    wrapper.vm.clearMessages()
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.fixed').exists()).toBe(false)
  })
})