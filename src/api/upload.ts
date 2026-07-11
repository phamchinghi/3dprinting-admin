import {
  api,
  BASE_URL,
  ApiError,
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  type AuthData,
} from './client';

// Mirrors com.tuni3d.module.upload.dto.UploadResponse
export interface UploadResponse {
  url: string;            // public URL — lưu thẳng vào product.videoUrl / blog
  objectKey: string;      // key trong bucket — dùng để gọi DELETE
  contentType: string;
  size: number;
}

interface ServerResponse<T> {
  status: 'SUCCESS' | 'ERROR';
  message: string;
  data: T;
}

/**
 * Multipart-aware POST: KHÔNG set Content-Type — browser sẽ tự gắn
 * `multipart/form-data; boundary=...` khi body là FormData. Nếu set sẵn
 * Content-Type kiểu json (như `api.post` cũ làm), server sẽ không parse được boundary.
 */
async function multipartUpload(path: string, file: File): Promise<UploadResponse> {
  const tryOnce = async (token: string | null): Promise<UploadResponse> => {
    const form = new FormData();
    form.append('file', file);
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${path}`, { method: 'POST', body: form, headers });
    const json: ServerResponse<UploadResponse> = await res.json();
    if (!res.ok || json.status === 'ERROR') {
      throw new ApiError(json.message ?? 'Upload failed', res.status);
    }
    return json.data;
  };

  try {
    return await tryOnce(getAccessToken());
  } catch (err) {
    // Auto-refresh on 401 (same logic as `fetchProtected` trong client.ts)
    if (!(err instanceof ApiError) || err.status !== 401) throw err;
    const rt = getRefreshToken();
    if (!rt) throw err;
    const refreshed: AuthData = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    }).then(async (r) => {
      const j: ServerResponse<AuthData> = await r.json();
      if (!r.ok || j.status === 'ERROR') throw new ApiError(j.message ?? 'Refresh failed', r.status);
      return j.data;
    });
    setAccessToken(refreshed.accessToken);
    setRefreshToken(refreshed.refreshToken);
    return tryOnce(refreshed.accessToken);
  }
}

export const uploadApi = {
  /** POST /api/admin/upload/image — max 5MB, jpeg/png/gif/webp */
  image: (file: File) => multipartUpload('/api/admin/upload/image', file),

  /** POST /api/admin/upload/video — max 100MB, mp4/webm */
  video: (file: File) => multipartUpload('/api/admin/upload/video', file),

  /** DELETE /api/admin/upload?key=... — idempotent */
  delete: (objectKey: string) =>
    api.delete<null>(`/api/admin/upload?key=${encodeURIComponent(objectKey)}`),
};

// Client-side max sizes — mirror BE config `app.upload.{image,video}.max-bytes`
// để hiển thị error sớm trước khi gửi (UX). Nếu BE đổi limit phải update cả 2 chỗ.
export const UPLOAD_LIMITS = {
  image: { maxBytes: 5 * 1024 * 1024,   maxLabel: '5 MB',   accept: 'image/jpeg,image/png,image/gif,image/webp' },
  video: { maxBytes: 100 * 1024 * 1024, maxLabel: '100 MB', accept: 'video/mp4,video/webm' },
};
