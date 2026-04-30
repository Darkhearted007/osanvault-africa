type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

interface CircuitBreakerOptions {
  failureThreshold?: number
  successThreshold?: number
  timeout?: number
  name?: string
}

interface CircuitMetrics {
  failures: number
  successes: number
  lastFailure: number
  state: CircuitState
  nextAttempt: number
}

const circuits = new Map<string, CircuitMetrics>()

function getCircuit(name: string): CircuitMetrics {
  if (!circuits.has(name)) {
    circuits.set(name, {
      failures: 0,
      successes: 0,
      lastFailure: 0,
      state: 'CLOSED',
      nextAttempt: 0,
    })
  }
  return circuits.get(name)!
}

export function circuitBreaker(
  name: string,
  options: CircuitBreakerOptions = {}
) {
  const {
    failureThreshold = 5,
    successThreshold = 2,
    timeout = 30000,
    name: circuitName = name,
  } = options

  return async function <T>(fn: () => Promise<T>): Promise<T> {
    const circuit = getCircuit(circuitName)
    const now = Date.now()

    if (circuit.state === 'OPEN') {
      if (now < circuit.nextAttempt) {
        throw new Error(`Circuit breaker [${circuitName}]: OPEN — retry after ${Math.ceil((circuit.nextAttempt - now) / 1000)}s`)
      }
      circuit.state = 'HALF_OPEN'
    }

    try {
      const result = await fn()

      if (circuit.state === 'HALF_OPEN') {
        circuit.successes++
        if (circuit.successes >= successThreshold) {
          circuit.state = 'CLOSED'
          circuit.failures = 0
          circuit.successes = 0
        }
      } else {
        circuit.failures = 0
      }

      return result
    } catch (err) {
      circuit.lastFailure = now
      circuit.failures++

      if (circuit.state === 'HALF_OPEN') {
        circuit.state = 'OPEN'
        circuit.nextAttempt = now + timeout
        circuit.successes = 0
      } else if (circuit.failures >= failureThreshold) {
        circuit.state = 'OPEN'
        circuit.nextAttempt = now + timeout
      }

      throw err
    }
  }
}

export function getCircuitStatus(name: string) {
  const c = getCircuit(name)
  return {
    name,
    state: c.state,
    failures: c.failures,
    successes: c.successes,
    lastFailure: c.lastFailure ? new Date(c.lastFailure).toISOString() : null,
    nextAttempt: c.nextAttempt ? new Date(c.nextAttempt).toISOString() : null,
  }
}

export function listCircuits() {
  return Array.from(circuits.keys()).map(name => getCircuitStatus(name))
}

export const pythBreaker = circuitBreaker('pyth-oracle', {
  failureThreshold: 3,
  timeout: 60000,
})

export const solanaRpcBreaker = circuitBreaker('solana-rpc', {
  failureThreshold: 5,
  timeout: 30000,
})

export const redisBreaker = circuitBreaker('redis', {
  failureThreshold: 3,
  timeout: 30000,
})