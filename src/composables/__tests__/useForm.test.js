/**
 * Tests for useForm Composable
 * Tests validation logic, form state management, and error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useForm } from '../useForm'

describe('useForm', () => {
  let form

  beforeEach(() => {
    form = useForm(
      { email: '', password: '', fullname: '' },
      { 
        email: ['required', 'email'],
        password: ['required', { type: 'minLength', min: 6 }],
        fullname: ['required']
      }
    )
  })

  describe('Initialization', () => {
    it('should initialize with provided data', () => {
      expect(form.formData.email).toBe('')
      expect(form.formData.password).toBe('')
      expect(form.formData.fullname).toBe('')
    })

    it('should have no errors initially', () => {
      expect(Object.keys(form.errors.value)).toHaveLength(0)
      expect(form.isValid.value).toBe(true)
    })

    it('should not be dirty initially', () => {
      expect(form.isDirty.value).toBe(false)
    })

    it('should not be submitting initially', () => {
      expect(form.isSubmitting.value).toBe(false)
    })
  })

  describe('Required Validation', () => {
    it('should fail validation when required fields are empty', () => {
      const isValid = form.validate()
      
      expect(isValid).toBe(false)
      expect(form.errors.value.email).toBe('This field is required')
      expect(form.errors.value.password).toBe('This field is required')
      expect(form.errors.value.fullname).toBe('This field is required')
    })

    it('should pass validation when all required fields are filled', () => {
      form.formData.email = 'test@example.com'
      form.formData.password = 'password123'
      form.formData.fullname = 'Test User'
      
      const isValid = form.validate()
      
      expect(isValid).toBe(true)
      expect(Object.keys(form.errors.value)).toHaveLength(0)
    })
  })

  describe('Email Validation', () => {
    it('should fail with invalid email format', () => {
      form.formData.email = 'invalid-email'
      form.validateSingleField('email')
      
      expect(form.errors.value.email).toBe('Please enter a valid email address')
    })

    it('should pass with valid email format', () => {
      form.formData.email = 'test@example.com'
      form.validateSingleField('email')
      
      expect(form.errors.value.email).toBeUndefined()
    })

    it('should handle various email formats', () => {
      const validEmails = [
        'test@test.com',
        'test.name@example.co.id',
        'test+tag@example.com',
        'test_name@test-domain.com'
      ]

      validEmails.forEach(email => {
        form.formData.email = email
        form.validateSingleField('email')
        expect(form.errors.value.email).toBeUndefined()
      })
    })

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'test@',
        'test @example.com',
        'test@.com'
      ]

      invalidEmails.forEach(email => {
        form.formData.email = email
        form.validateSingleField('email')
        expect(form.errors.value.email).toBe('Please enter a valid email address')
      })
    })
  })

  describe('MinLength Validation', () => {
    it('should fail when password is too short', () => {
      form.formData.password = '123'
      form.validateSingleField('password')
      
      expect(form.errors.value.password).toBe('Minimum 6 characters required')
    })

    it('should pass when password meets minimum length', () => {
      form.formData.password = '123456'
      form.validateSingleField('password')
      
      expect(form.errors.value.password).toBeUndefined()
    })

    it('should pass when password exceeds minimum length', () => {
      form.formData.password = 'verylongpassword123'
      form.validateSingleField('password')
      
      expect(form.errors.value.password).toBeUndefined()
    })
  })

  describe('Phone Validation', () => {
    it('should validate Indonesian phone numbers', () => {
      const formWithPhone = useForm(
        { phone: '' },
        { phone: ['phone'] }
      )

      const validPhones = [
        '081234567890',
        '+6281234567890',
        '021-1234567',
        '(021) 1234567'
      ]

      validPhones.forEach(phone => {
        formWithPhone.formData.phone = phone
        formWithPhone.validateSingleField('phone')
        expect(formWithPhone.errors.value.phone).toBeUndefined()
      })
    })

    it('should reject invalid phone formats', () => {
      const formWithPhone = useForm(
        { phone: '' },
        { phone: ['phone'] }
      )

      formWithPhone.formData.phone = 'invalid-phone'
      formWithPhone.validateSingleField('phone')
      
      expect(formWithPhone.errors.value.phone).toBe('Please enter a valid phone number')
    })
  })

  describe('Form State Management', () => {
    it('should mark form as dirty when field is updated', () => {
      expect(form.isDirty.value).toBe(false)
      
      form.updateField('email', 'test@example.com')
      
      expect(form.isDirty.value).toBe(true)
      expect(form.formData.email).toBe('test@example.com')
    })

    it('should clear errors when field is updated', () => {
      form.validate() // Generate errors
      expect(form.errors.value.email).toBeDefined()
      
      form.updateField('email', 'test@example.com')
      
      expect(form.errors.value.email).toBeUndefined()
    })

    it('should reset form to initial values', () => {
      form.formData.email = 'test@example.com'
      form.formData.password = 'password123'
      form.markDirty()
      form.validate()
      
      form.reset()
      
      expect(form.formData.email).toBe('')
      expect(form.formData.password).toBe('')
      expect(form.isDirty.value).toBe(false)
      expect(Object.keys(form.errors.value)).toHaveLength(0)
    })
  })

  describe('Error Management', () => {
    it('should clear all errors', () => {
      form.validate()
      expect(Object.keys(form.errors.value).length).toBeGreaterThan(0)
      
      form.clearErrors()
      
      expect(Object.keys(form.errors.value)).toHaveLength(0)
    })

    it('should clear specific field error', () => {
      form.validate()
      expect(form.errors.value.email).toBeDefined()
      expect(form.errors.value.password).toBeDefined()
      
      form.clearError('email')
      
      expect(form.errors.value.email).toBeUndefined()
      expect(form.errors.value.password).toBeDefined()
    })

    it('should set custom error message', () => {
      form.setError('email', 'Custom error message')
      
      expect(form.errors.value.email).toBe('Custom error message')
    })

    it('should set multiple errors at once', () => {
      form.setErrors({
        email: 'Email error',
        password: 'Password error'
      })
      
      expect(form.errors.value.email).toBe('Email error')
      expect(form.errors.value.password).toBe('Password error')
    })
  })

  describe('Form Submission', () => {
    it('should submit valid form', async () => {
      form.formData.email = 'test@example.com'
      form.formData.password = 'password123'
      form.formData.fullname = 'Test User'
      
      const mockHandler = vi.fn().mockResolvedValue({ success: true })
      
      const result = await form.submit(mockHandler)
      
      expect(mockHandler).toHaveBeenCalledWith(form.formData)
      expect(result.success).toBe(true)
    })

    it('should not submit invalid form', async () => {
      const mockHandler = vi.fn()
      
      try {
        await form.submit(mockHandler)
      } catch (error) {
        expect(error.message).toBe('Form validation failed')
      }
      
      expect(mockHandler).not.toHaveBeenCalled()
    })

    it('should set isSubmitting during submission', async () => {
      form.formData.email = 'test@example.com'
      form.formData.password = 'password123'
      form.formData.fullname = 'Test User'
      
      const mockHandler = vi.fn().mockImplementation(() => {
        expect(form.isSubmitting.value).toBe(true)
        return Promise.resolve({ success: true })
      })
      
      await form.submit(mockHandler)
      
      expect(form.isSubmitting.value).toBe(false)
    })

    it('should handle submission errors', async () => {
      form.formData.email = 'test@example.com'
      form.formData.password = 'password123'
      form.formData.fullname = 'Test User'
      
      const mockError = new Error('Submission failed')
      const mockHandler = vi.fn().mockRejectedValue(mockError)
      
      await expect(form.submit(mockHandler)).rejects.toThrow('Submission failed')
      expect(form.isSubmitting.value).toBe(false)
    })

    it('should prevent double submission', async () => {
      form.formData.email = 'test@example.com'
      form.formData.password = 'password123'
      form.formData.fullname = 'Test User'
      
      let resolveHandler
      const mockHandler = vi.fn().mockImplementation(() => {
        return new Promise(resolve => {
          resolveHandler = resolve
        })
      })
      
      // First submission starts
      const promise1 = form.submit(mockHandler)
      expect(form.isSubmitting.value).toBe(true)
      
      // Second submission should be blocked (returns Promise<undefined>)
      const promise2 = form.submit(mockHandler)
      
      // Async functions always return a Promise, so we need to check the resolved value
      await expect(promise2).resolves.toBeUndefined()
      
      // Only first handler should be called
      expect(mockHandler).toHaveBeenCalledTimes(1)
      
      // Complete first submission
      resolveHandler({ success: true })
      await promise1
      
      expect(form.isSubmitting.value).toBe(false)
    })
  })

  describe('getFieldProps', () => {
    it('should return correct props for binding', () => {
      const props = form.getFieldProps('email')
      
      expect(props).toHaveProperty('modelValue')
      expect(props).toHaveProperty('error')
      expect(props).toHaveProperty('onUpdate:modelValue')
      expect(props).toHaveProperty('onBlur')
    })

    it('should update field value through props', () => {
      const props = form.getFieldProps('email')
      
      props['onUpdate:modelValue']('test@example.com')
      
      expect(form.formData.email).toBe('test@example.com')
      expect(form.isDirty.value).toBe(true)
    })

    it('should validate on blur through props', () => {
      form.validate() // Generate initial errors
      const props = form.getFieldProps('email')
      
      props.onBlur()
      
      expect(form.errors.value.email).toBe('This field is required')
    })
  })

  describe('Computed Properties', () => {
    it('should calculate isValid correctly', () => {
      expect(form.isValid.value).toBe(true)
      
      form.validate()
      expect(form.isValid.value).toBe(false)
      
      form.formData.email = 'test@example.com'
      form.formData.password = 'password123'
      form.formData.fullname = 'Test User'
      form.validate()
      expect(form.isValid.value).toBe(true)
    })

    it('should calculate hasErrors correctly', () => {
      expect(form.hasErrors.value).toBe(false)
      
      form.setError('email', 'Error message')
      expect(form.hasErrors.value).toBe(true)
      
      form.clearErrors()
      expect(form.hasErrors.value).toBe(false)
    })
  })
})
