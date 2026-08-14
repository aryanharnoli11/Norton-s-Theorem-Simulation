export const POSITIVE_TERMINALS = [
  '1-endpoint',
  '3-endpoint',
  '5-endpoint',
]

export const NEGATIVE_TERMINALS = [
  '2-endpoint',
  '4-endpoint',
  '6-endpoint',
]

export const CIRCUIT_POSITIVE_TERMINALS = [
  '7-endpoint',
  '9-endpoint',
  '10-endpoint',
]

export const CIRCUIT_NEGATIVE_TERMINALS = [
  '8-endpoint',
  '11-endpoint',
  '12-endpoint',
]

export const VALID_CONNECTION_SEQUENCE = [
  '7-endpoint', '8-endpoint',
  '3-endpoint', '9-endpoint',
  '4-endpoint', '11-endpoint',

  '5-endpoint', '7-endpoint',
  '6-endpoint', '8-endpoint',
  '1-endpoint', '9-endpoint',
  '2-endpoint', '11-endpoint',

  '2-endpoint', '10-endpoint',
  '11-endpoint', '12-endpoint',
]
const RN_CONNECTIONS = [
  ['7-endpoint', '8-endpoint'],
  ['3-endpoint', '9-endpoint'],
  ['4-endpoint', '11-endpoint'],
]

const ISC_CONNECTIONS = [
  ['5-endpoint', '7-endpoint'],
  ['6-endpoint', '8-endpoint'],
  ['1-endpoint', '9-endpoint'],
  ['2-endpoint', '11-endpoint'],
]

const IL_CONNECTIONS = [
  ['5-endpoint', '7-endpoint'],
  ['6-endpoint', '8-endpoint'],
  ['1-endpoint', '9-endpoint'],
  ['2-endpoint', '10-endpoint'],
  ['11-endpoint', '12-endpoint'],
]
export const ALL_NORTON_TERMINALS = [
  '1-endpoint',
  '2-endpoint',
  '3-endpoint',
  '4-endpoint',
  '5-endpoint',
  '6-endpoint',
  '7-endpoint',
  '8-endpoint',
  '9-endpoint',
  '10-endpoint',
  '11-endpoint',
  '12-endpoint',
]
export const setJsPlumbCircuitLocked = (
  instance,
  containerElement,
  locked,
) => {
  if (!instance) {
    return
  }

  const shouldEnable = !locked

  const connections =
    typeof instance.getAllConnections ===
    'function'
      ? instance.getAllConnections()
      : instance.getConnections?.() ?? []

  /*
   * Existing wires ko detachable/non-detachable
   * banata hai.
   */
  connections.forEach((connection) => {
    connection.setDetachable?.(
      shouldEnable,
    )

    connection.endpoints?.forEach(
      (endpoint) => {
        endpoint.setEnabled?.(
          shouldEnable,
        )
      },
    )
  })

  /*
   * All jsPlumb endpoints ko enable/disable karo.
   * Ye next case ki new connections ke liye important hai.
   */
  const endpointSelection =
    instance.selectEndpoints?.()

  endpointSelection?.setEnabled?.(
    shouldEnable,
  )

  /*
   * UUID-based fallback.
   */
  ALL_NORTON_TERMINALS.forEach(
    (terminalId) => {
      const endpoint =
        instance.getEndpoint?.(
          terminalId,
        )

      endpoint?.setEnabled?.(
        shouldEnable,
      )
    },
  )

  containerElement?.classList.toggle(
    'connection-lab--locked',
    locked,
  )

  instance.repaintEverything?.()
}
export const resolveJsPlumb = (module) => (
  module?.jsPlumb
  || module?.default?.jsPlumb
  || module?.default
  || window.jsPlumb
)

const getAllConnections = (instance) => {
  if (!instance) return []

  if (typeof instance.getAllConnections === 'function') {
    return instance.getAllConnections()
  }

  if (typeof instance.getConnections === 'function') {
    return instance.getConnections()
  }

  return []
}
const isNegativeTerminal = (terminalId) => (
  NEGATIVE_TERMINALS.includes(terminalId)
  || CIRCUIT_NEGATIVE_TERMINALS.includes(terminalId)
)
export const deleteConnectionsForTerminal = (instance, terminalId) => {
  const matchingConnections = getAllConnections(instance).filter((connection) => {
    const sourceId = connection.sourceId || connection.source?.id
    const targetId = connection.targetId || connection.target?.id

    return sourceId === terminalId || targetId === terminalId
  })

  matchingConnections.forEach((connection) => {
    if (typeof instance.deleteConnection === 'function') {
      instance.deleteConnection(connection)
      return
    }

    connection.detach?.()
  })

  return matchingConnections.length
}
const terminalPaintStyles = {
  positive: {
    fill: '#0969e8',
    outlineStroke: '#f8fbff',
    outlineWidth: 2,
    stroke: '#062b77',
    strokeWidth: 1.4,
  },
  negative: {
    fill: '#e33024',
    outlineStroke: '#fff8f6',
    outlineWidth: 2,
    stroke: '#8f140e',
    strokeWidth: 1.4,
  },
}

const terminalHoverPaintStyles = {
  positive: {
    fill: '#2a7cff',
    outlineStroke: '#ffffff',
    outlineWidth: 2.4,
    stroke: '#082767',
    strokeWidth: 1.6,
  },
  negative: {
    fill: '#ff4a3d',
    outlineStroke: '#ffffff',
    outlineWidth: 2.4,
    stroke: '#81130f',
    strokeWidth: 1.6,
  },
}
export const wirePaintStyles = {
  positive: {
    outlineStroke: '#07306e',
    outlineWidth: 1.15,
    stroke: '#1f73e6',
    strokeWidth: 4.6,
  },
  negative: {
    outlineStroke: '#771914',
    outlineWidth: 1.15,
    stroke: '#dd342d',
    strokeWidth: 4.6,
  },
}

export const wireHoverPaintStyles = {
  positive: {
    outlineStroke: '#052357',
    outlineWidth: 1.35,
    stroke: '#3a8aff',
    strokeWidth: 5,
  },
  negative: {
    outlineStroke: '#5d110d',
    outlineWidth: 1.35,
    stroke: '#f04a42',
    strokeWidth: 5,
  },
}
const getConnectionType = (
  sourceId,
  targetId,
) => {
  const isNegative =
    isNegativeTerminal(sourceId) ||
    isNegativeTerminal(targetId)

  return isNegative
    ? 'negative'
    : 'positive'
}

const connectTerminalPair = (
  instance,
  sourceId,
  targetId,
) => {
  if (
    !instance ||
    !sourceId ||
    !targetId
  ) {
    return null
  }

  return instance.connect({
    uuids: [
      sourceId,
      targetId,
    ],
  })
}

const replaceConnections = (
  instance,
  connectionPairs,
) => {
  if (!instance) {
    return
  }

  /*
   * Previous case ki saari wires remove karo.
   * Isse Auto Connect hamesha exact current-case
   * wiring banayega, extra wires nahi rahengi.
   */
  instance.setSuspendDrawing?.(true)

  instance.deleteEveryConnection?.()

  connectionPairs.forEach(
    ([sourceId, targetId]) => {
      connectTerminalPair(
        instance,
        sourceId,
        targetId,
      )
    },
  )

  instance.setSuspendDrawing?.(
    false,
    true,
  )

  instance.repaintEverything?.()
}
export const autoConnectRN = (
  instance,
) => {
  replaceConnections(
    instance,
    RN_CONNECTIONS,
  )
}

export const autoConnectISC = (
  instance,
) => {
  replaceConnections(
    instance,
    ISC_CONNECTIONS,
  )
}

export const autoConnectIL = (
  instance,
) => {
  replaceConnections(
    instance,
    IL_CONNECTIONS,
  )
}
const normalizeConnectionPair = (
  firstId,
  secondId,
) => (
  [firstId, secondId]
    .sort()
    .join('|')
)

const connectionToPair = (connection) => [
  connection.sourceId ||
    connection.source?.id,

  connection.targetId ||
    connection.target?.id,
]

export const validateNortonConnections = (
  instance,
  caseKey,
) => {
  const requiredConnectionsMap = {
    rn: RN_CONNECTIONS,
    isc: ISC_CONNECTIONS,
    il: IL_CONNECTIONS,
  }

  const requiredConnections =
    requiredConnectionsMap[caseKey] ?? []

  const actualConnections =
    getAllConnections(instance)
      .map(connectionToPair)
      .filter(
        ([firstId, secondId]) =>
          firstId && secondId,
      )

  const requiredKeys = new Set(
    requiredConnections.map(
      ([firstId, secondId]) =>
        normalizeConnectionPair(
          firstId,
          secondId,
        ),
    ),
  )

  const actualKeys = new Set(
    actualConnections.map(
      ([firstId, secondId]) =>
        normalizeConnectionPair(
          firstId,
          secondId,
        ),
    ),
  )

  const missingConnections =
    requiredConnections.filter(
      ([firstId, secondId]) =>
        !actualKeys.has(
          normalizeConnectionPair(
            firstId,
            secondId,
          ),
        ),
    )

  const wrongConnections =
    actualConnections.filter(
      ([firstId, secondId]) =>
        !requiredKeys.has(
          normalizeConnectionPair(
            firstId,
            secondId,
          ),
        ),
    )

  const duplicateConnectionCount =
    actualConnections.length -
    actualKeys.size

  return {
    isCorrect:
      missingConnections.length === 0 &&
      wrongConnections.length === 0 &&
      duplicateConnectionCount === 0,

    caseKey,
    requiredConnections,
    actualConnections,
    missingConnections,
    wrongConnections,
    duplicateConnectionCount,
  }
}







const getTerminalNumber = (terminalId) => terminalId.replace('-endpoint', '')

const getCssValue = (styles, propertyName, fallback) => {
  const value = styles.getPropertyValue(propertyName).trim()

  return value || fallback
}

const getCssNumber = (styles, propertyName, fallback) => {
  const value = Number.parseFloat(styles.getPropertyValue(propertyName))

  return Number.isFinite(value) ? value : fallback
}

const getEndpointPaintStyle = (element, type, state = 'default') => {
  const styles = window.getComputedStyle(element)
  const prefix = state === 'hover' ? '--jtk-endpoint-hover' : '--jtk-endpoint'
  const defaults = state === 'hover'
    ? terminalHoverPaintStyles[type]
    : terminalPaintStyles[type]

  return {
    fill: getCssValue(styles, `${prefix}-fill`, defaults.fill),
    outlineStroke: getCssValue(
      styles,
      `${prefix}-outline-stroke`,
      defaults.outlineStroke,
    ),
    outlineWidth: getCssNumber(
      styles,
      `${prefix}-outline-width`,
      defaults.outlineWidth,
    ),
    stroke: getCssValue(styles, `${prefix}-stroke`, defaults.stroke),
    strokeWidth: getCssNumber(
      styles,
      `${prefix}-stroke-width`,
      defaults.strokeWidth,
    ),
  }
}

const getEndpointRadius = (element) => (
  getCssNumber(window.getComputedStyle(element), '--jtk-endpoint-radius', 5)
)

const getEndpointCssClass = (terminalId, type) => {
  const terminalNumber = getTerminalNumber(terminalId)

  return [
    'jtk-endpoint--terminal',
    `jtk-endpoint--terminal-${terminalNumber}`,
    `jtk-endpoint--${terminalId}`,
    `jtk-endpoint--${type}`,
  ].join(' ')
}



export const getConnectionBetween = (instance, firstId, secondId) => {
  const connections = getAllConnections(instance)

  return connections.find((connection) => {
    const sourceId = connection.sourceId || connection.source?.id
    const targetId = connection.targetId || connection.target?.id

    return (
      (sourceId === firstId && targetId === secondId)
      || (sourceId === secondId && targetId === firstId)
    )
  })
}

export const hasConnectionBetween = (instance, firstId, secondId) => (
  Boolean(getConnectionBetween(instance, firstId, secondId))
)



export const addTerminalEndpoint = (instance, terminalId, type) => {
  const element = document.getElementById(terminalId)

  if (!element) {
    return
  }

  instance.addEndpoint(element, {
    uuid: terminalId,
    endpoint: ['Dot', { radius: getEndpointRadius(element) }],
    cssClass: getEndpointCssClass(terminalId, type),
    anchor: ['Center'],
    isSource: true,
    isTarget: true,
    connectionType: type,
    connectionsDetachable: true,
    connectorStyle: wirePaintStyles[type],
    connectorHoverStyle: wireHoverPaintStyles[type],
    maxConnections: 1,
    paintStyle: getEndpointPaintStyle(element, type),
    hoverPaintStyle: getEndpointPaintStyle(element, type, 'hover'),
  })
}

export const addAllEndpoints = (instance) => {
  POSITIVE_TERMINALS.forEach((terminalId) => {
    addTerminalEndpoint(instance, terminalId, 'positive')
  })

  NEGATIVE_TERMINALS.forEach((terminalId) => {
    addTerminalEndpoint(instance, terminalId, 'negative')
  })

  CIRCUIT_POSITIVE_TERMINALS.forEach((terminalId) => {
    addTerminalEndpoint(instance, terminalId, 'positive')
  })

  CIRCUIT_NEGATIVE_TERMINALS.forEach((terminalId) => {
    addTerminalEndpoint(instance, terminalId, 'negative')
  })
}

const applyAutoConnections = (instance, connections) => {
  instance.deleteEveryConnection?.()

  connections.forEach(([source, target]) => {
    instance.connect({
      uuids: [source, target],
      type: isNegativeTerminal(source) ? 'negative' : 'positive',
    })
  })
}







export const lockJsPlumbCircuit = (instance, containerElement) => {
  getAllConnections(instance).forEach((connection) => {
    connection.setDetachable?.(false)

    connection.endpoints?.forEach((endpoint) => {
      endpoint.setEnabled?.(false)
    })
  })

  containerElement?.classList.add('connection-lab--locked')
}
