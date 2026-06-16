import { isAxiosError } from 'axios';

// Normalizes any thrown error (axios or otherwise) into one shape so screens
// render errors consistently. FastAPI returns `detail` as a string for
// HTTPExceptions and as an array of issues for 422 validation errors.

export type ApiError = {
  status: number | null; // null when the request never reached the server
  message: string; // user-facing, in Spanish
  fieldErrors?: Record<string, string>; // keyed by field name, for form inputs
};

const GENERIC = 'Algo salió mal. Intenta de nuevo.';
const NETWORK = 'No se pudo conectar. Revisa tu conexión e intenta de nuevo.';

type ValidationIssue = { loc: (string | number)[]; msg: string };

export function normalizeError(error: unknown): ApiError {
  if (!isAxiosError(error)) {
    return { status: null, message: GENERIC };
  }

  if (!error.response) {
    return { status: null, message: NETWORK };
  }

  const { status, data } = error.response;
  const detail = (data as { detail?: unknown })?.detail;

  // 422 validation: detail is an array of issues → map to per-field errors.
  if (Array.isArray(detail)) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of detail as ValidationIssue[]) {
      const field = issue.loc?.filter((p) => p !== 'body').at(-1);
      if (field !== undefined) fieldErrors[String(field)] = issue.msg;
    }
    return {
      status,
      message: 'Revisa los datos ingresados.',
      ...(Object.keys(fieldErrors).length > 0 && { fieldErrors }),
    };
  }

  // Standard HTTPException: detail is a string.
  if (typeof detail === 'string' && detail.length > 0) {
    return { status, message: detail };
  }

  return { status, message: GENERIC };
}
