/**
 * Tests for BaseInput Component
 * Tests rendering, user interactions, validation states, and accessibility
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseInput from '../BaseInput.vue'

describe('BaseInput', () => {
  describe('Rendering', () => {
    it('should render input element', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          label: 'Email'
        }
      })
      
      expect(wrapper.find('input').exists()).toBe(true)
      expect(wrapper.find('label').text()).toContain('Email')
    })

    it('should render without label when not provided', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: ''
        }
      })
      
      expect(wrapper.find('label').exists()).toBe(false)
      expect(wrapper.find('input').exists()).toBe(true)
    })

    it('should display required asterisk when required is true', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          label: 'Email',
          required: true
        }
      })
      
      const label = wrapper.find('label')
      expect(label.html()).toContain('*')
    })

    it('should render placeholder text', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          placeholder: 'Enter your email'
        }
      })
      
      const input = wrapper.find('input')
      expect(input.attributes('placeholder')).toBe('Enter your email')
    })

    it('should display error message when error prop is provided', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          label: 'Email',
          error: 'Email is required'
        }
      })
      
      expect(wrapper.text()).toContain('Email is required')
      const errorElement = wrapper.find('.text-red-600')
      expect(errorElement.exists()).toBe(true)
    })
  })

  describe('Input Types', () => {
    it('should support text type', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          type: 'text'
        }
      })
      
      expect(wrapper.find('input').attributes('type')).toBe('text')
    })

    it('should support email type', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          type: 'email'
        }
      })
      
      expect(wrapper.find('input').attributes('type')).toBe('email')
    })

    it('should support password type', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          type: 'password'
        }
      })
      
      expect(wrapper.find('input').attributes('type')).toBe('password')
    })

    it('should support date type', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          type: 'date'
        }
      })
      
      expect(wrapper.find('input').attributes('type')).toBe('date')
    })
  })

  describe('User Interactions', () => {
    it('should emit update:modelValue when input changes', async () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          label: 'Email'
        }
      })
      
      const input = wrapper.find('input')
      await input.setValue('test@example.com')
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual(['test@example.com'])
    })

    it('should emit input event on typing', async () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: ''
        }
      })
      
      const input = wrapper.find('input')
      await input.setValue('test')
      
      expect(wrapper.emitted('input')).toBeTruthy()
    })

    it('should emit focus event when input is focused', async () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: ''
        }
      })
      
      const input = wrapper.find('input')
      await input.trigger('focus')
      
      expect(wrapper.emitted('focus')).toBeTruthy()
    })

    it('should emit blur event when input loses focus', async () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: ''
        }
      })
      
      const input = wrapper.find('input')
      await input.trigger('blur')
      
      expect(wrapper.emitted('blur')).toBeTruthy()
    })
  })

  describe('States', () => {
    it('should disable input when disabled prop is true', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          label: 'Email',
          disabled: true
        }
      })
      
      const input = wrapper.find('input')
      expect(input.attributes('disabled')).toBeDefined()
      expect(input.classes()).toContain('opacity-50')
    })

    it('should make input readonly when readonly prop is true', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: 'readonly value',
          readonly: true
        }
      })
      
      const input = wrapper.find('input')
      expect(input.attributes('readonly')).toBeDefined()
    })

    it('should apply error styles when error prop is provided', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          error: 'Error message'
        }
      })
      
      const input = wrapper.find('input')
      const classes = input.classes().join(' ')
      
      expect(classes).toContain('red')
      expect(wrapper.find('.text-red-600').exists()).toBe(true)
    })

    it('should apply normal styles when no error', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: ''
        }
      })
      
      const input = wrapper.find('input')
      const classes = input.classes().join(' ')
      
      expect(classes).not.toContain('red')
    })
  })

  describe('Sizes', () => {
    it('should apply small size classes', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          size: 'sm'
        }
      })
      
      const input = wrapper.find('input')
      expect(input.classes()).toContain('text-sm')
      expect(input.classes()).toContain('p-2')
    })

    it('should apply medium size classes (default)', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          size: 'md'
        }
      })
      
      const input = wrapper.find('input')
      expect(input.classes()).toContain('text-sm')
      expect(input.classes()).toContain('p-2.5')
    })

    it('should apply large size classes', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          size: 'lg'
        }
      })
      
      const input = wrapper.find('input')
      expect(input.classes()).toContain('text-base')
      expect(input.classes()).toContain('p-3')
    })
  })

  describe('Variants', () => {
    it('should apply default variant classes', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          variant: 'default'
        }
      })
      
      const input = wrapper.find('input')
      expect(input.classes()).toContain('bg-gray-50')
    })

    it('should apply filled variant classes', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          variant: 'filled'
        }
      })
      
      const input = wrapper.find('input')
      expect(input.classes()).toContain('bg-blue-50')
    })

    it('should apply outline variant classes', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          variant: 'outline'
        }
      })
      
      const input = wrapper.find('input')
      expect(input.classes()).toContain('bg-transparent')
    })
  })

  describe('v-model Integration', () => {
    it('should work with v-model pattern', async () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: 'initial',
          'onUpdate:modelValue': (value) => wrapper.setProps({ modelValue: value })
        }
      })
      
      expect(wrapper.find('input').element.value).toBe('initial')
      
      await wrapper.find('input').setValue('updated')
      await wrapper.vm.$nextTick()
      
      expect(wrapper.emitted('update:modelValue')[0]).toEqual(['updated'])
    })
  })

  describe('Exposed Methods', () => {
    it('should expose focus method', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: ''
        }
      })
      
      expect(wrapper.vm.focus).toBeDefined()
      expect(typeof wrapper.vm.focus).toBe('function')
    })

    it('should expose blur method', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: ''
        }
      })
      
      expect(wrapper.vm.blur).toBeDefined()
      expect(typeof wrapper.vm.blur).toBe('function')
    })

    it('should expose select method', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: ''
        }
      })
      
      expect(wrapper.vm.select).toBeDefined()
      expect(typeof wrapper.vm.select).toBe('function')
    })
  })

  describe('Accessibility', () => {
    it('should associate label with input via id', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          label: 'Email'
        }
      })
      
      const label = wrapper.find('label')
      const input = wrapper.find('input')
      
      expect(label.attributes('for')).toBe(input.attributes('id'))
    })

    it('should have unique id for each instance', () => {
      const wrapper1 = mount(BaseInput, { props: { modelValue: '' } })
      const wrapper2 = mount(BaseInput, { props: { modelValue: '' } })
      
      const id1 = wrapper1.find('input').attributes('id')
      const id2 = wrapper2.find('input').attributes('id')
      
      expect(id1).not.toBe(id2)
    })

    it('should mark input as required when required prop is true', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          required: true
        }
      })
      
      const input = wrapper.find('input')
      expect(input.attributes('required')).toBeDefined()
    })
  })

  describe('Slots', () => {
    it('should render help text slot', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: ''
        },
        slots: {
          help: 'This is help text'
        }
      })
      
      expect(wrapper.text()).toContain('This is help text')
    })

    it('should render custom icon slot', () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: '',
          icon: 'custom'
        },
        slots: {
          icon: '<span class="custom-icon">🔍</span>'
        }
      })
      
      expect(wrapper.html()).toContain('custom-icon')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string value', async () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: ''
        }
      })
      
      await wrapper.find('input').setValue('')
      
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([''])
    })

    it('should handle numeric values', async () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: 0,
          type: 'number'
        }
      })
      
      const input = wrapper.find('input')
      expect(input.element.value).toBe('0')
    })

    it('should handle space key in input', async () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: ''
        }
      })
      
      const input = wrapper.find('input')
      const event = new KeyboardEvent('keydown', { key: ' ' })
      const stopPropagation = vi.spyOn(event, 'stopPropagation')
      
      input.element.dispatchEvent(event)
      
      expect(stopPropagation).toHaveBeenCalled()
    })

    it('should handle rapid input changes', async () => {
      const wrapper = mount(BaseInput, {
        props: {
          modelValue: ''
        }
      })
      
      const input = wrapper.find('input')
      
      await input.setValue('a')
      await input.setValue('ab')
      await input.setValue('abc')
      
      expect(wrapper.emitted('update:modelValue')).toHaveLength(3)
      expect(wrapper.emitted('update:modelValue')[2]).toEqual(['abc'])
    })
  })
})
