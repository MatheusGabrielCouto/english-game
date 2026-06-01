type DebugLogPayload = {
  location: string;
  message: string;
  data?: Record<string, unknown>;
  hypothesisId?: string;
  runId?: string;
};

export const debugLog = ({
  location,
  message,
  data,
  hypothesisId,
  runId,
}: DebugLogPayload): void => {
  fetch('http://127.0.0.1:7845/ingest/f9b2965c-1590-4fa3-a91d-91020dd4aafc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': 'c3fd08',
    },
    body: JSON.stringify({
      sessionId: 'c3fd08',
      location,
      message,
      data,
      hypothesisId,
      runId,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
};
