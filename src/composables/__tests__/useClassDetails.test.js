import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ref } from 'vue';
import { useClassDetails } from '../useClassDetails';
import { classAPI, levelAPI, lecturerAPI } from '../../services/api';
import { mockClasses, mockLevels, mockLecturers, mockApiResponses } from '../../tests/mockData';

vi.mock('../../services/api', () => ({
  classAPI: {
    getClassById: vi.fn(),
  },
  levelAPI: {
    getLevelById: vi.fn(),
  },
  lecturerAPI: {
    getAllLecturers: vi.fn(),
  },
}));

describe('useClassDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });


  it('should handle class not found error', async () => {
    classAPI.getClassById.mockResolvedValue({
      data: { success: false, message: 'Class not found' }
    });

    const { classInfo, error, isLoading } = useClassDetails(999);

    await vi.waitFor(() => expect(isLoading.value).toBe(false));

    expect(classInfo.value).toBeNull();
    expect(error.value).toBe('Class not found');
  });


  it('should display fallback dash when level not found', async () => {
    classAPI.getClassById.mockResolvedValue({
      data: { success: true, data: { ...mockClasses[0], levelid: null } }
    });
    levelAPI.getLevelById.mockResolvedValue({
      data: { success: false }
    });
    lecturerAPI.getAllLecturers.mockResolvedValue({
      data: { success: true, data: mockLecturers }
    });

    const { levelName, isLoading } = useClassDetails(1);

    await vi.waitFor(() => expect(isLoading.value).toBe(false));
    expect(levelName.value).toBe('');
  });

  it('should display fallback dash when lecturer not found', async () => {
    classAPI.getClassById.mockResolvedValue({
      data: { success: true, data: { ...mockClasses[0], lecturerid: 999 } }
    });
    levelAPI.getLevelById.mockResolvedValue({
      data: { success: true, data: mockLevels[0] }
    });
    lecturerAPI.getAllLecturers.mockResolvedValue({
      data: { success: true, data: mockLecturers }
    });

    const { lecturerName, isLoading } = useClassDetails(1);

    await vi.waitFor(() => expect(isLoading.value).toBe(false));
    expect(lecturerName.value).toBe('-');
  });

  it('should handle network timeout errors gracefully', async () => {
    classAPI.getClassById.mockRejectedValue(new Error('Network timeout'));

    const { error, isLoading } = useClassDetails(1);

    await vi.waitFor(() => expect(isLoading.value).toBe(false));
    expect(error.value).toBe('Network timeout');
  });

  it('should skip fetch when classId is null', async () => {
    const { classInfo, isLoading } = useClassDetails(null);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(classAPI.getClassById).not.toHaveBeenCalled();
    expect(classInfo.value).toBeNull();
    expect(isLoading.value).toBe(false);
  });

  it('should retry fetching class details on demand', async () => {
    classAPI.getClassById
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        data: { success: true, data: mockClasses[0] }
      });
    levelAPI.getLevelById.mockResolvedValue({
      data: { success: true, data: mockLevels[0] }
    });
    lecturerAPI.getAllLecturers.mockResolvedValue({
      data: { success: true, data: mockLecturers }
    });

    const { error, retry, classInfo, isLoading } = useClassDetails(1);

    await vi.waitFor(() => expect(isLoading.value).toBe(false));
    expect(error.value).toBe('Network error');
    expect(classInfo.value).toBeNull();

    await retry();
    await vi.waitFor(() => expect(isLoading.value).toBe(false));

    expect(classInfo.value).toEqual(mockClasses[0]);
    expect(error.value).toBeNull();
  });


  it('should handle empty lecturer list gracefully', async () => {
    classAPI.getClassById.mockResolvedValue({
      data: { success: true, data: mockClasses[0] }
    });
    levelAPI.getLevelById.mockResolvedValue({
      data: { success: true, data: mockLevels[0] }
    });
    lecturerAPI.getAllLecturers.mockResolvedValue({
      data: { success: true, data: [] }
    });

    const { lecturerName, isLoading } = useClassDetails(1);

    await vi.waitFor(() => expect(isLoading.value).toBe(false));
    expect(lecturerName.value).toBe('-');
  });
});
