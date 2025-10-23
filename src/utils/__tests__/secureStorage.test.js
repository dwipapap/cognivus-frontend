import { describe, it, expect, beforeEach, vi } from 'vitest';
import secureStorage from '../secureStorage'; 

// Pengujian ini menguji fungsi utama secureStorage yang
// bergantung pada proses enkripsi/dekripsi dan interaksi localStorage.

describe('SecureStorage Utility (Fokus Real-World)', () => {
  const USER_KEY = 'auth-token';
  const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake'; 
  const MOCK_USER_OBJECT = { id: 1, name: 'Admin', role: 'owner' };

  // Membersihkan mock localStorage sebelum setiap tes untuk isolasi.
  beforeEach(() => {
    localStorage.clear();
    // Spy untuk memastikan error dekripsi tertangkap, tetapi tes tetap berjalan
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

// --- Test Case Paling Kritis ---

  it('1. should successfully encrypt, store, and decrypt a complex object (Set & Get)', () => {
    // 1. Simpan objek
    secureStorage.setItem(USER_KEY, MOCK_USER_OBJECT);

    // 2. Verifikasi di localStorage (Wajib Terenkripsi)
    const encryptedValue = localStorage.getItem(USER_KEY);
    expect(encryptedValue).toBeTypeOf('string');
    // Memastikan data mentah tidak terlihat (tidak ada kata 'owner' atau 'Admin')
    expect(encryptedValue).not.toContain('owner'); 

    // 3. Ambil dan Verifikasi Integritas Data
    const retrievedObject = secureStorage.getItem(USER_KEY);
    expect(retrievedObject).toEqual(MOCK_USER_OBJECT); // Memastikan objek kembali utuh
    expect(retrievedObject.role).toBe('owner'); 
  });

  it('2. should store and retrieve primitive values (string and number)', () => {
    // String (untuk menyimpan JWT)
    secureStorage.setItem('jwt', MOCK_TOKEN);
    expect(secureStorage.getItem('jwt')).toBe(MOCK_TOKEN);

    // Angka (untuk menyimpan tokenExpiry)
    const expiryTime = Date.now() + (3 * 60 * 60 * 1000);
    secureStorage.setItem('expiry-time', expiryTime);
    expect(secureStorage.getItem('expiry-time')).toBe(expiryTime);
  });

  it('3. should return null when retrieving a non-existent item (Common Edge Case)', () => {
    const retrievedValue = secureStorage.getItem('data-yang-tidak-ada');
    expect(retrievedValue).toBeNull();
  });

  it('4. should successfully remove an existing item', () => {
    // 1. Simpan item
    secureStorage.setItem(USER_KEY, MOCK_TOKEN);
    expect(localStorage.getItem(USER_KEY)).not.toBeNull();

    // 2. Hapus
    secureStorage.removeItem(USER_KEY);

    // 3. Verifikasi penghapusan
    expect(localStorage.getItem(USER_KEY)).toBeNull();
  });

  it('5. should gracefully handle corrupted or tampered ciphertext by returning null', () => {
    // 1. Simpan item (untuk menghasilkan ciphertext yang valid)
    secureStorage.setItem(USER_KEY, MOCK_TOKEN);

    // 2. SIMULASI TAMPERING: Ganti nilai di localStorage dengan data yang rusak
    const originalCiphertext = localStorage.getItem(USER_KEY);
    // Ubah beberapa karakter terakhir agar dekripsi gagal
    localStorage.setItem(USER_KEY, originalCiphertext.slice(0, -5) + 'X-TAMPERED'); 

    // 3. Ambil (seharusnya gagal dekripsi)
    const retrievedObject = secureStorage.getItem(USER_KEY);
    
    // Verifikasi bahwa:
    expect(retrievedObject).toBeNull(); // Mengembalikan null (gagal dengan aman)
    expect(console.error).toHaveBeenCalled(); // Log error ke console (seperti yang dilakukan secureStorage)
  });
});