import { describe, it, expect, beforeEach, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { useUserProfile } from '../useUserProfile';
import { userAPI } from '../../services/api';
import { authStore } from '../../store/auth';
import { mockUsers } from '../../tests/mockData';

vi.mock('../../services/api', () => ({
  userAPI: {
    getUserById: vi.fn(),
    updateUser: vi.fn(),
    createUser: vi.fn(),
  },
}));

vi.mock('../../store/auth', () => ({
  authStore: {
    user: null,
    role: null,
  },
}));

describe('useUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStore.user = { id: 1, email: 'student@test.com' };
    authStore.role = 'student';
  });



  it('should update user profile successfully', async () => {
    userAPI.getUserById.mockResolvedValue({
      data: { success: true, data: mockUsers.student }
    });

    const updateData = { fullname: 'Updated Name', phone: '081234567899' };
    userAPI.updateUser.mockResolvedValue({
      data: { success: true, data: { ...mockUsers.student, ...updateData } }
    });

    const { updateUserProfile, userProfile } = useUserProfile();

    // Wait for onMounted hook to complete
    await flushPromises();

    const result = await updateUserProfile(updateData);

    expect(result).toBe(true);
    expect(userProfile.value.fullname).toBe('Updated Name');
    expect(userProfile.value.phone).toBe('081234567899');
  });

  it('should handle update failure with error message', async () => {
    userAPI.getUserById.mockResolvedValue({
      data: { success: true, data: mockUsers.student }
    });

    userAPI.updateUser.mockResolvedValue({
      data: { success: false, message: 'Validation error' }
    });

    const { updateUserProfile, errorMessage } = useUserProfile();

    // Wait for onMounted hook to complete
    await flushPromises();

    const result = await updateUserProfile({ phone: 'invalid' });

    expect(result).toBe(false);
    expect(errorMessage.value).toBe('Validation error');
  });

  it('should handle rate limiting during update', async () => {
    userAPI.getUserById.mockResolvedValue({
      data: { success: true, data: mockUsers.student }
    });

    userAPI.updateUser.mockRejectedValue(
      new Error('Too many requests. Please try again in 15 minutes.')
    );

    const { updateUserProfile, errorMessage } = useUserProfile();

    // Wait for onMounted hook to complete
    await flushPromises();

    const result = await updateUserProfile({ fullname: 'New Name' });

    expect(result).toBe(false);
    expect(errorMessage.value).toContain('Too many requests');
  });

  it('should create new user profile successfully', async () => {
    const newUserData = {
      email: 'newuser@test.com',
      username: 'newuser',
      fullname: 'New User',
      roleid: 1,
    };

    userAPI.createUser.mockResolvedValue({
      data: { success: true, data: { userid: 5, ...newUserData } }
    });

    const { createUserProfile, userProfile } = useUserProfile();

    // Wait for onMounted hook to complete
    await flushPromises();

    const result = await createUserProfile(newUserData);

    expect(result).toBe(true);
    expect(userProfile.value.userid).toBe(5);
    expect(userProfile.value.email).toBe('newuser@test.com');
  });

  it('should handle user creation failure', async () => {
    userAPI.createUser.mockResolvedValue({
      data: { success: false, message: 'Email already exists' }
    });

    const { createUserProfile, errorMessage } = useUserProfile();

    // Wait for onMounted hook to complete
    await flushPromises();

    const result = await createUserProfile({
      email: 'existing@test.com',
      username: 'existing',
    });

    expect(result).toBe(false);
    expect(errorMessage.value).toBe('Email already exists');
  });


  it('should set isUpdating flag during updates', async () => {
    userAPI.getUserById.mockResolvedValue({
      data: { success: true, data: mockUsers.student }
    });

    let isUpdatingDuringCall = false;
    userAPI.updateUser.mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return { data: { success: true, data: mockUsers.student } };
    });

    const { updateUserProfile, isUpdating } = useUserProfile();

    // Wait for onMounted hook to complete
    await flushPromises();

    const updatePromise = updateUserProfile({ fullname: 'New Name' });
    
    await vi.waitFor(() => {
      if (isUpdating.value) {
        isUpdatingDuringCall = true;
      }
    });

    await updatePromise;

    expect(isUpdatingDuringCall).toBe(true);
    expect(isUpdating.value).toBe(false);
  });
});
