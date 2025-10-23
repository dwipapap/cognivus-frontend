import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLecturerProfile } from '../useLecturerProfile';
import { lecturerAPI } from '../../services/api';
import { authStore } from '../../store/auth';
import { mockLecturers, mockUsers } from '../../tests/mockData';

vi.mock('../../services/api', () => ({
  lecturerAPI: {
    getLecturerById: vi.fn(),
    updateLecturer: vi.fn(),
    getAllLecturers: vi.fn(),
  },
}));

vi.mock('../../store/auth', () => ({
  authStore: {
    user: null,
    role: null,
  },
}));

describe('useLecturerProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStore.user = { id: 2, email: 'lecturer@test.com' };
    authStore.role = 'lecturer';
  });



  it('should update lecturer profile successfully', async () => {
    lecturerAPI.getLecturerById.mockResolvedValue({
      data: { success: true, data: mockLecturers[0] }
    });

    const updatedData = { bio: 'Updated bio text' };
    lecturerAPI.updateLecturer.mockResolvedValue({
      data: { success: true, data: { ...mockLecturers[0], ...updatedData } }
    });

    const { updateLecturerProfile, lecturerProfile } = useLecturerProfile();

    const result = await updateLecturerProfile(updatedData);

    expect(result).toBe(true);
    expect(lecturerProfile.value.bio).toBe('Updated bio text');
  });

  it('should handle update failure with error message', async () => {
    lecturerAPI.getLecturerById.mockResolvedValue({
      data: { success: true, data: mockLecturers[0] }
    });

    lecturerAPI.updateLecturer.mockResolvedValue({
      data: { success: false, message: 'Invalid data provided' }
    });

    const { updateLecturerProfile, errorMessage } = useLecturerProfile();

    const result = await updateLecturerProfile({ bio: '' });

    expect(result).toBe(false);
    expect(errorMessage.value).toBe('Invalid data provided');
  });

  it('should handle rate limiting errors during fetch', async () => {
    lecturerAPI.getLecturerById.mockRejectedValue(
      new Error('Too many requests. Please try again in 15 minutes.')
    );

    const { errorMessage, isLoading } = useLecturerProfile();

    await vi.waitFor(() => expect(isLoading.value).toBe(false));

    expect(errorMessage.value).toContain('Too many requests');
  });

  it('should handle rate limiting errors during update', async () => {
    lecturerAPI.getLecturerById.mockResolvedValue({
      data: { success: true, data: mockLecturers[0] }
    });

    lecturerAPI.updateLecturer.mockRejectedValue(
      new Error('Too many requests. Please try again in 15 minutes.')
    );

    const { updateLecturerProfile, errorMessage } = useLecturerProfile();

    const result = await updateLecturerProfile({ bio: 'New bio' });

    expect(result).toBe(false);
    expect(errorMessage.value).toContain('Too many requests');
  });


  it('should fetch all lecturers for admin view', async () => {
    const allLecturers = [mockLecturers[0], { ...mockLecturers[0], lecturerid: 2 }];
    
    lecturerAPI.getAllLecturers.mockResolvedValue({
      data: { success: true, data: allLecturers }
    });

    const { getAllLecturers } = useLecturerProfile();

    const result = await getAllLecturers();

    expect(result).toEqual(allLecturers);
    expect(lecturerAPI.getAllLecturers).toHaveBeenCalled();
  });

  it('should handle network errors when fetching all lecturers', async () => {
    lecturerAPI.getAllLecturers.mockRejectedValue(new Error('Network error'));

    const { getAllLecturers, errorMessage } = useLecturerProfile();

    const result = await getAllLecturers();

    expect(result).toEqual([]);
    expect(errorMessage.value).toBe('Failed to fetch lecturers. Please try again later.');
  });

  it('should not auto-fetch profile when user is not lecturer role', async () => {
    authStore.role = 'student';

    useLecturerProfile();

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(lecturerAPI.getLecturerById).not.toHaveBeenCalled();
  });
});
