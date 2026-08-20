import {
  useEffect,
  useRef,
} from 'react'

import CircuitDiagram from './CircuitDiagram.jsx'
import EquipmentPanel from './EquipmentPanel.jsx'

import {
  addAllEndpoints,
  autoConnectIL,
  autoConnectISC,
  autoConnectRN,
  resolveJsPlumb,
  setJsPlumbCircuitLocked,
  validateNortonConnections,
  wireHoverPaintStyles,
  wirePaintStyles,
} from '../utils/jsPlumbWiring.js'

const getJsPlumbZoom = (scale) => (
  Number.isFinite(scale) && scale > 0
    ? scale
    : 1
)

const getNortonCase = (observations = {}) => {
  if (observations.nortonResistance === null) {
    return 'rn'
  }

  if (observations.shortCircuitCurrent === null) {
    return 'isc'
  }

  return 'il'
}

const ConnectionLab = ({
  autoConnectRequest,
  checkRequest,
  onAutoConnectComplete,
  onCheckConnections,

  powerOn,
  connectionsVerified = false,
   connectionsLocked = false,
  observations = {},
  experimentStage,

  multimeterMode = 'resistance',
  setMultimeterMode,

  r1,
  r2,
  r3,
  rl,

  readings = {},

  resetRequest,
  scale = 1,

  onTogglePower,
  setVoltage,
  onVoltageCommit,
  voltage,

  lockedVoltage = false,

  onConnectionChange,
  onConnectionDetached,
  onConnectionAdded,

  sourcesLocked = false,
  activeGuideTerminals = [],

  lockedConnections = {
    ammeter: false,
    multimeter: false,
    voltageSource: false,
    circuit: false,
    all: false,
  },
}) => {
  const containerRef = useRef(null)
  const instanceRef = useRef(null)

  const onCheckConnectionsRef =
    useRef(onCheckConnections)

  const onAutoConnectCompleteRef =
    useRef(onAutoConnectComplete)

  const scaleRef =
    useRef(getJsPlumbZoom(scale))

  const onConnectionAddedRef =
    useRef(onConnectionAdded)

  const onConnectionDetachedRef =
    useRef(onConnectionDetached)

  const onConnectionChangeRef =
    useRef(onConnectionChange)

  //const [isLocked, setIsLocked] = useState(false)

  const currentCase =
  getNortonCase(observations)

const currentCaseRef =
  useRef(currentCase)

useEffect(() => {
  currentCaseRef.current =
    currentCase
}, [currentCase])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined
    }

    document
      .querySelectorAll(
        '.ai-guide-terminal-highlight',
      )
      .forEach((element) => {
        element.classList.remove(
          'ai-guide-terminal-highlight',
        )
      })

    activeGuideTerminals.forEach((terminalId) => {
      document
        .getElementById(terminalId)
        ?.classList.add(
          'ai-guide-terminal-highlight',
        )
    })

    return () => {
      activeGuideTerminals.forEach((terminalId) => {
        document
          .getElementById(terminalId)
          ?.classList.remove(
            'ai-guide-terminal-highlight',
          )
      })
    }
  }, [activeGuideTerminals])

  useEffect(() => {
    onConnectionAddedRef.current =
      onConnectionAdded

    onConnectionDetachedRef.current =
      onConnectionDetached

    onConnectionChangeRef.current =
      onConnectionChange
  }, [
    onConnectionAdded,
    onConnectionDetached,
    onConnectionChange,
  ])

  useEffect(() => {
    onCheckConnectionsRef.current =
      onCheckConnections

    onAutoConnectCompleteRef.current =
      onAutoConnectComplete
  }, [onAutoConnectComplete, onCheckConnections])

  useEffect(() => {
    let cancelled = false

    const initJsPlumb = async () => {
      const jsPlumbModule =
        await import('jsplumb')

      const jsPlumb =
        resolveJsPlumb(jsPlumbModule)

      if (
        cancelled ||
        !containerRef.current ||
        !jsPlumb?.getInstance
      ) {
        return
      }

      instanceRef.current?.reset?.()

      containerRef.current.classList.remove(
        'connection-lab--locked',
        'connection-lab--verified',
        'connection-lab--success',
        'walkthrough-active-target',
      )

      //setIsLocked(false)

      const instance = jsPlumb.getInstance({
        Container: containerRef.current,
        ConnectionsDetachable: true,
        ReattachConnections: true,
        Connector: [
          'Bezier',
          { curviness: 72 },
        ],
        PaintStyle: {
          ...wirePaintStyles.positive,
        },
        HoverPaintStyle: {
          ...wireHoverPaintStyles.positive,
        },
        Endpoint: [
          'Dot',
          { radius: 5 },
        ],
      })

      instanceRef.current = instance

      instance.setZoom?.(
        scaleRef.current,
      )

      instance.registerConnectionTypes({
        positive: {
          paintStyle: {
            ...wirePaintStyles.positive,
          },
          hoverPaintStyle: {
            ...wireHoverPaintStyles.positive,
          },
        },

        negative: {
          paintStyle: {
            ...wirePaintStyles.negative,
          },
          hoverPaintStyle: {
            ...wireHoverPaintStyles.negative,
          },
        },
      })

      instance.setSuspendDrawing(true)

      addAllEndpoints(instance)

      const notifyConnectionChange = () => {
        const connections =
          typeof instance.getAllConnections ===
          'function'
            ? instance.getAllConnections()
            : instance.getConnections?.()

        onConnectionChangeRef.current?.(
          connections?.length ?? 0,
        )
      }

      const handleConnectionAdded = (info) => {
  const connection =
    info?.connection || info

  const sourceId =
    info.sourceId || info.source?.id

  const targetId =
    info.targetId || info.target?.id

  // Get the source terminal's polarity
  const sourceElement =
    connection?.source ||
    document.getElementById(sourceId)

  const polarity =
    sourceElement?.dataset?.polarity

  // Your new terminal colors:
  // PLUS  = RED
  // MINUS = BLACK
  const wireColor =
    polarity === 'plus'
      ? '#d72828'
      : '#151515'

  // Change the actual jsPlumb wire
  if (connection?.setPaintStyle) {
    connection.setPaintStyle({
      stroke: wireColor,
      strokeWidth: 4,
    })
  }

  if (connection?.setHoverPaintStyle) {
    connection.setHoverPaintStyle({
      stroke: wireColor,
      strokeWidth: 5,
    })
  }

  onConnectionAddedRef.current?.(
    sourceId,
    targetId,
  )

  window.setTimeout(
    notifyConnectionChange,
    0,
  )
}

     const handleConnectionDetached = (info) => {
  const connection =
    info?.connection ?? info

  const sourceId =
    connection?.sourceId ||
    connection?.source?.id

  const targetId =
    connection?.targetId ||
    connection?.target?.id

  onConnectionDetachedRef.current?.(
    sourceId,
    targetId,
  )

  notifyConnectionChange()
}
      instance.bind?.(
        'connection',
        handleConnectionAdded,
      )

      instance.bind?.(
        'connectionDetached',
        handleConnectionDetached,
      )

      instance.bind?.(
        'connectionMoved',
        notifyConnectionChange,
      )

      instance.setSuspendDrawing(false, true)

      window.setTimeout(() => {
        instance.revalidate?.(
          containerRef.current,
        )

        instance.repaintEverything?.()
      }, 300)
    }

    initJsPlumb()

    const handleResize = () => {
      window.setTimeout(() => {
        instanceRef.current
          ?.repaintEverything?.()
      }, 100)
    }

    window.addEventListener(
      'resize',
      handleResize,
    )

    return () => {
      cancelled = true

      window.removeEventListener(
        'resize',
        handleResize,
      )

      instanceRef.current
        ?.deleteEveryConnection?.()

      instanceRef.current?.reset?.()
      instanceRef.current = null
    }
  }, [resetRequest])

  useEffect(() => {
    const instance = instanceRef.current
    const zoom = getJsPlumbZoom(scale)

    scaleRef.current = zoom

    if (!instance?.setZoom) {
      return
    }

    instance.setZoom(zoom, true)

    window.setTimeout(() => {
      instance.repaintEverything?.()
    }, 0)
  }, [scale])
useEffect(() => {
  const instance =
    instanceRef.current

  if (!instance) {
    return
  }

  setJsPlumbCircuitLocked(
    instance,
    containerRef.current,
    Boolean(connectionsLocked),
  )
}, [connectionsLocked])

useEffect(() => {
  const requestId =
    autoConnectRequest?.id ?? 0

  const caseToConnect =
    autoConnectRequest?.caseKey

  if (
    requestId === 0 ||
    !caseToConnect ||
    !instanceRef.current
  ) {
    return undefined
  }

  let completionTimer = null

  const timer = window.setTimeout(() => {
    const instance = instanceRef.current

    if (!instance) {
      return
    }

    let didConnect = true

    switch (caseToConnect) {
      case 'rn':
        autoConnectRN(instance)
        break

      case 'isc':
        autoConnectISC(instance)
        break

      case 'il':
        autoConnectIL(instance)
        break

      default:
        didConnect = false
        console.warn(
          'Unknown Norton auto-connect case:',
          caseToConnect,
        )
    }

    if (!didConnect) {
      return
    }

    /* Run after jsPlumb's connection-count notifications have settled. */
    completionTimer = window.setTimeout(() => {
      const result = validateNortonConnections(
        instance,
        caseToConnect,
      )

      onAutoConnectCompleteRef.current?.({
        ...result,
        caseKey: caseToConnect,
      })
    }, 0)
  }, 150)

  return () => {
    window.clearTimeout(timer)
    window.clearTimeout(completionTimer)
  }
}, [autoConnectRequest])

useEffect(() => {
  if (
    checkRequest === 0 ||
    !instanceRef.current
  ) {
    return
  }

  containerRef.current?.classList.remove(
    'connection-lab--verified',
    'connection-lab--success',
    'walkthrough-active-target',
  )

  const checkedCase =
    currentCaseRef.current

  const result =
    validateNortonConnections(
      instanceRef.current,
      checkedCase,
    )

  onCheckConnectionsRef.current?.({
    ...result,
    caseKey: checkedCase,
  })
}, [checkRequest])
  const isLockedTerminal = (terminalId) => {
    const terminal = Number(
      String(terminalId)
        .replace('-endpoint', ''),
    )

    if (lockedConnections.all) {
      return true
    }

    if (
      lockedConnections.ammeter &&
      [1, 2].includes(terminal)
    ) {
      return true
    }

    if (
      lockedConnections.multimeter &&
      [3, 4].includes(terminal)
    ) {
      return true
    }

    if (
      lockedConnections.voltageSource &&
      [5, 6].includes(terminal)
    ) {
      return true
    }

    if (
      lockedConnections.circuit &&
      [7, 8, 9, 10, 11, 12]
        .includes(terminal)
    ) {
      return true
    }

    return false
  }
const removeConnectionsForTerminal = (terminalId) => {
  const instance = instanceRef.current

  if (!instance || !terminalId) {
    return 0
  }

  const allConnections =
    typeof instance.getAllConnections === 'function'
      ? instance.getAllConnections()
      : instance.getConnections?.() ?? []

  const matchingConnections =
    Array.from(allConnections).filter((connection) => {
      const sourceId =
        connection.sourceId ||
        connection.source?.id

      const targetId =
        connection.targetId ||
        connection.target?.id

      return (
        sourceId === terminalId ||
        targetId === terminalId
      )
    })

  matchingConnections.forEach((connection) => {
    if (
      typeof instance.deleteConnection === 'function'
    ) {
      instance.deleteConnection(connection)
    } else if (
      typeof instance.detach === 'function'
    ) {
      instance.detach(connection)
    }
  })

  instance.repaintEverything?.()

  return matchingConnections.length
}
  const handleLabelClick = (event) => {
  const label = event.target.closest(
    '.terminal-number-label',
  )

  if (
    !label ||
    !containerRef.current?.contains(label)
  ) {
    return
  }

  event.preventDefault()
  event.stopPropagation()

  const terminalId =
    label.dataset.terminalId

  console.log('LABEL CLICKED:', {
    label: label.textContent?.trim(),
    terminalId,
    connectionsLocked,
    lockedConnections,
  })

  /*
   * CHECK success ke baad locked.
   * Reading ADD hone ke baad Case 1/2
   * mein connectionsLocked false hoga.
   */
  if (connectionsLocked) {
    console.log(
      'CONNECTION REMOVAL BLOCKED: circuit locked',
    )

    return
  }

  if (!terminalId) {
    console.warn(
      'Terminal label has no data-terminal-id.',
      label,
    )

    return
  }

  if (isLockedTerminal(terminalId)) {
    console.log(
      'TERMINAL LOCKED BY lockedConnections:',
      terminalId,
      lockedConnections,
    )

    return
  }

  const removedCount =
    removeConnectionsForTerminal(
      terminalId,
    )

  console.log(
    'REMOVED CONNECTION COUNT:',
    removedCount,
    terminalId,
  )

  if (removedCount > 0) {
    instanceRef.current
      ?.repaintEverything?.()
  }
}

  const recordedNortonCurrent = Number(
    observations.shortCircuitCurrent,
  )

  const hasRecordedNortonCurrent =
    observations.shortCircuitCurrent !== null &&
    observations.shortCircuitCurrent !== undefined &&
    Number.isFinite(recordedNortonCurrent)

  const ammeterReading = (() => {
    /*
     * The ammeter dial is a 0–10 mA scale. Once IN has been added to the
     * observation table, keep using that recorded value so unrelated state
     * changes (power-off and the next case) cannot move the needle.
     */
    if (hasRecordedNortonCurrent) {
      return Number(
        Math.abs(
          recordedNortonCurrent * 1000,
        ).toFixed(3),
      )
    }

    if (!powerOn || currentCase !== 'isc') {
      return 0
    }

    return Math.abs(
      (Number(readings.shortCircuitCurrent) || 0) *
        1000,
    )
  })()

  const multimeterReading =
  currentCase === 'rn' &&
  connectionsVerified
    ? Number(
        readings.nortonResistance,
      ) || 0
    : 0

  return (
    <div
      className="connection-lab"
      onClick={handleLabelClick}
      ref={containerRef}
      data-experiment-stage={experimentStage}
      data-case={currentCase}
    >
      <EquipmentPanel
        ammeterReading={ammeterReading}
        multimeterReading={
          multimeterReading
        }
        multimeterMode={
          multimeterMode
        }
        multimeterActive={
  currentCase === 'rn' && connectionsVerified
}
        multimeterDisabled={
          currentCase !== 'rn'
        }
        onMultimeterModeChange={
          setMultimeterMode
        }
        onTogglePower={onTogglePower}
        powerOn={powerOn}
        setVoltage={setVoltage}
        onVoltageCommit={onVoltageCommit}
        voltage={voltage}
        lockedVoltage={lockedVoltage}
        sourcesLocked={sourcesLocked}
      />

      <CircuitDiagram
        r1={r1}
        r2={r2}
        r3={r3}
        rl={rl}
      />
    </div>
  )
}

export default ConnectionLab
