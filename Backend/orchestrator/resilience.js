// Backend/orchestrator/resilience.js
// Timeout, retry with exponential backoff, and circuit breaker for LLM calls.
// No external dependencies — pure Node.js.
//
// Circuit breaker states:
//   CLOSED   — normal operation, calls go through
//   OPEN     — too many failures, calls blocked immediately
//   HALF_OPEN — one trial call allowed to test if the service recovered

const TIMEOUT_MS      = 25000; // 25s — LLM calls on large docs can be slow
const MAX_RETRIES     = 2;     // 3 total attempts (1 original + 2 retries)
const RETRY_BASE_MS   = 500;   // exponential backoff base: 500ms, 1000ms

// Circuit breaker config per model
const CB_FAILURE_THRESHOLD = 3;    // open after 3 consecutive failures
const CB_RESET_MS          = 60000; // try again after 60s

// In-process state — one entry per model name
const circuitState = {};

const getCircuit = (modelName) => {
  if (!circuitState[modelName]) {
    circuitState[modelName] = {
      state: 'CLOSED',      // CLOSED | OPEN | HALF_OPEN
      failures: 0,
      openedAt: null,
    };
  }
  return circuitState[modelName];
};

/**
 * Returns true if the circuit breaker allows a call to proceed.
 * Transitions OPEN → HALF_OPEN after the reset window expires.
 */
const circuitAllows = (modelName) => {
  const cb = getCircuit(modelName);

  if (cb.state === 'CLOSED') return true;

  if (cb.state === 'OPEN') {
    if (Date.now() - cb.openedAt >= CB_RESET_MS) {
      cb.state = 'HALF_OPEN';
      console.log(`[CircuitBreaker] ${modelName}: OPEN → HALF_OPEN (testing recovery)`);
      return true; // allow one trial call
    }
    return false; // still open
  }

  if (cb.state === 'HALF_OPEN') return true; // allow the trial call

  return false;
};

/**
 * Record a successful call — reset the breaker to CLOSED.
 */
const recordSuccess = (modelName) => {
  const cb = getCircuit(modelName);
  if (cb.state !== 'CLOSED') {
    console.log(`[CircuitBreaker] ${modelName}: recovered → CLOSED`);
  }
  cb.state = 'CLOSED';
  cb.failures = 0;
  cb.openedAt = null;
};

/**
 * Record a failed call — increment counter, open breaker if threshold reached.
 */
const recordFailure = (modelName) => {
  const cb = getCircuit(modelName);
  cb.failures += 1;

  if (cb.state === 'HALF_OPEN') {
    // Trial call failed — go back to OPEN
    cb.state = 'OPEN';
    cb.openedAt = Date.now();
    console.warn(`[CircuitBreaker] ${modelName}: HALF_OPEN trial failed → OPEN again`);
    return;
  }

  if (cb.failures >= CB_FAILURE_THRESHOLD) {
    cb.state = 'OPEN';
    cb.openedAt = Date.now();
    console.warn(`[CircuitBreaker] ${modelName}: OPEN after ${cb.failures} failures`);
  }
};

/**
 * Wrap a single LLM call with a timeout.
 * Rejects with a timeout error if the call exceeds TIMEOUT_MS.
 */
const withTimeout = (promise, modelName) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`[Timeout] ${modelName} did not respond within ${TIMEOUT_MS}ms`)),
      TIMEOUT_MS,
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

/**
 * Call fn() with timeout + retry + circuit breaker.
 *
 * @param {string}   modelName  — used for circuit breaker state key and logging
 * @param {Function} fn         — async function that performs the LLM call
 * @returns the result of fn()
 * @throws if circuit is OPEN or all retries are exhausted
 */
const callWithResilience = async (modelName, fn) => {
  if (!circuitAllows(modelName)) {
    const cb = getCircuit(modelName);
    const retryInMs = CB_RESET_MS - (Date.now() - cb.openedAt);
    throw new Error(
      `[CircuitBreaker] ${modelName} is OPEN — service unavailable. Retry in ~${Math.ceil(retryInMs / 1000)}s`,
    );
  }

  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = RETRY_BASE_MS * (2 ** (attempt - 1)); // 500ms, 1000ms
      console.log(`[Resilience] ${modelName}: retry ${attempt}/${MAX_RETRIES} after ${delay}ms`);
      await new Promise((r) => setTimeout(r, delay));
    }

    try {
      const result = await withTimeout(fn(), modelName);
      recordSuccess(modelName);
      return result;
    } catch (err) {
      lastError = err;
      const isTimeout = err.message?.startsWith('[Timeout]');
      const isRateLimit = err.status === 429 || err.message?.includes('rate limit');

      console.warn(
        `[Resilience] ${modelName} attempt ${attempt + 1} failed:`,
        err.message,
      );

      // Do not retry on rate limits — move to next model immediately
      if (isRateLimit) break;

      // Record failure after last attempt or on timeout
      if (attempt === MAX_RETRIES || isTimeout) {
        recordFailure(modelName);
      }
    }
  }

  throw lastError;
};

/**
 * Expose current circuit breaker states — useful for /health/detailed endpoint.
 */
const getCircuitStatus = () =>
  Object.fromEntries(
    Object.entries(circuitState).map(([model, cb]) => [
      model,
      {
        state: cb.state,
        failures: cb.failures,
        openSince: cb.openedAt ? new Date(cb.openedAt).toISOString() : null,
      },
    ]),
  );

module.exports = { callWithResilience, getCircuitStatus };
