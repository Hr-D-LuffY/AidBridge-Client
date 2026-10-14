import type { ApiResponse } from '@/types/api'
import { redirectToLogin } from './client'
import { ApiError, NETWORK_ERROR_MESSAGE, RATE_LIMIT_MESSAGE } from './errors'

// The one place that uses XMLHttpRequest instead of fetch: fetch cannot report how much of an upload
// has been sent, and the SOS form shows a progress bar. Same BFF path, same envelope, same ApiError.

const BASE_PATH = '/api/backend'
const UPLOAD_TIMEOUT_MS = 5 * 60_000

export function uploadWithProgress<T>(
  path: string,
  body: FormData,
  onProgress: (percent: number) => void,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('PUT', `${BASE_PATH}${path}`)
    request.responseType = 'json'
    request.timeout = UPLOAD_TIMEOUT_MS

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100))
    }
    request.onerror = request.ontimeout = () =>
      reject(new ApiError({ status: 0, message: NETWORK_ERROR_MESSAGE }))

    request.onload = () => {
      const payload = request.response as ApiResponse<T> | null
      if (request.status >= 200 && request.status < 300 && payload?.success) {
        resolve(payload.data)
        return
      }
      if (request.status === 401) redirectToLogin()
      reject(
        new ApiError({
          status: request.status,
          message:
            request.status === 429
              ? RATE_LIMIT_MESSAGE
              : payload && !payload.success && payload.message
                ? payload.message
                : 'Upload failed.',
          errors: payload && !payload.success ? payload.errors : [],
        }),
      )
    }

    request.send(body)
  })
}
