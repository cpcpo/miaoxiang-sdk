export class MiaoxiangError extends Error {
  code: string;
  details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'MiaoxiangError';
    this.code = code;
    this.details = details;
  }
}

export const ErrorCodes = {
  BAD_REQUEST: 'BAD_REQUEST',
  API_ERROR: 'API_ERROR',
  HTTP_ERROR: 'HTTP_ERROR',
  TIMEOUT: 'TIMEOUT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  EMPTY_RESPONSE: 'EMPTY_RESPONSE',
} as const;