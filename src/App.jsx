import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import './ConnectionEndpoints.css'
import ConnectionLab from './components/ConnectionLab.jsx'
import ActionButtons from './components/ActionButtons.jsx'
import ControlPanel from './components/ControlPanel.jsx'
//import GraphPanel from './components/GraphPanel.jsx'
import HeaderBoard from './components/HeaderBoard.jsx'
import CalculationPanel from './components/CalculationPanel.jsx'
import ReportControls from './components/ReportControls.jsx'
import WalkthroughStartButton from './walkthrough/components/WalkthroughStartButton.jsx'
import { EXPERIMENT_ALERTS } from './alerts/experimentStepAlerts.js'
import { useLabAlerts } from './alerts/useLabAlerts.js'
// import StatusBar from './components/StatusBar.jsx'
 
import { calculateReadings } from './utils/circuitMath.js'
import { generateNortonReport } from './utils/reportGenerator.js'
import {
  AI_GUIDE_MESSAGES,
  AI_GUIDE_STEP_MESSAGES,
  speakGuideMessage,
} from './utils/aiGuide.js'
import {
 playSharedAudio,
  stopSharedAudio,
} from './utils/audioController.js'
const AI_GUIDE_AUDIO = {
  aiGuideClick: '/simulation-audios/AI Guide click.wav',
  walkthroughComplete:
    '/simulation-audios/The simulation walkthrough is now complete. You are now ready to perform the experiment. First set R1, R2, R3 and RL using the resistance sliders.wav',
  resistanceRequired:
    '/simulation-audios/Before resistance set, check & auto connect button click.wav',
  resistanceReady:
    '/simulation-audios/After resistance is set, check button click.wav',
  nortonResistanceIntro:
    '/simulation-audios/To measure the Norton resistance .wav',
  chooseConnectionMode:
    "/simulation-audios/Now you may either click the Auto Connect button to make the circuit connections automatically or connect the circuit manually by following the highlighted terminals Let's begin with the first connection.wav",
  shortPowerSupply:
    '/simulation-audios/Now, short circuit terminals 7 to 8.wav',
  connectMultimeter:
    '/simulation-audios/Connect the multimeter by click and drag the wire from terminal 3 and drop it on terminal 9..wav',
  connectMultimeterReturn:
    '/simulation-audios/Connect terminal 4 to terminal 11.wav',
  allConnectionsComplete:
    '/simulation-audios/Guide all complete conn.wav',
  firstCaseAutoConnected:
    '/simulation-audios/1st case Autoconnect.wav',
  firstCaseChecked:
    '/simulation-audios/After 1st case connections, check.wav',
  secondCaseChecked:
    '/simulation-audios/After 2nd case connections, check.wav',
  rnReadingAdded:
    '/simulation-audios/After the RN reading was added.wav',
  secondReadingAdded:
    '/simulation-audios/After reading is added for the second case.wav',
  thirdReadingAdded:
    '/simulation-audios/After reading is added for the third case.wav',
  secondCasePowerSupply:
    '/simulation-audios/Power supply terminals, 2nd case.wav',
  connectPowerSupplyPositive:
    '/simulation-audios/Connect terminal 5 to 7.wav',
  connectPowerSupplyNegative:
    '/simulation-audios/Connect terminal 6 to 8..wav',
  connectAmmeter:
    '/simulation-audios/Connect ammeter.wav',
  connectAmmeterReturn:
    '/simulation-audios/Connect terminal 2 to terminal 11.wav',
  thirdCaseAmmeter:
    '/simulation-audios/Connect Ammeter2.wav',
  connectAmmeterToLoad:
    '/simulation-audios/Connect the ammeter terminals 2 to 10.wav',
  connectLoadReturn:
    '/simulation-audios/Connect terminal 11 to 12.wav',
  checkCaseTwoOrThree:
    '/simulation-audios/Before clicking the Check button for Case 2 and Case 3 connections.wav',
  checkThirdCase:
    '/simulation-audios/Now check again for the 3rd case.wav',
  continueWithAutoConnect:
    '/simulation-audios/After 1st and 2nd cases are completed, click autoconnect.wav',
  secondCaseAutoConnected:
    '/simulation-audios/2nd case Autoconnect.wav',
  thirdCaseAutoConnected:
    '/simulation-audios/3rd case Autoconnect.wav',
  voltageReady:
    '/simulation-audios/After the voltage value is set.wav',
  thirdCasePowerOn:
    '/simulation-audios/Power supply turned ON for the 3rd case.wav',
  calculationReady:
    '/simulation-audios/After clicking the calculate button.wav',
  verifyCorrect:
    '/simulation-audios/Verify button click, Correct calculations.wav',
  verifyIncorrect:
    '/simulation-audios/Verify button click, Incorrect calculations.wav',
  verifyOneMissing:
    '/simulation-audios/Verify button click, one value is missing.wav',
  verifyMultipleMissing:
    '/simulation-audios/Verify button click, more than one value is missing.wav',
  report:
    '/simulation-audios/Generate Report2.wav',
  print:
    '/simulation-audios/Print.wav',
  reset:
    '/simulation-audios/Reset.wav',
  wrongConnection:
    '/simulation-audios/Wrong connection.wav',
  multipleWrongConnections:
    '/simulation-audios/Multiple wrong connections.wav',
}

const AI_GUIDE_AUDIO_DURATION_MS = new Map([
  [AI_GUIDE_AUDIO.aiGuideClick, 17470],
  [AI_GUIDE_AUDIO.walkthroughComplete, 10220],
  [AI_GUIDE_AUDIO.resistanceRequired, 5540],
  [AI_GUIDE_AUDIO.resistanceReady, 4200],
  [AI_GUIDE_AUDIO.nortonResistanceIntro, 1960],
  [AI_GUIDE_AUDIO.chooseConnectionMode, 12250],
  [AI_GUIDE_AUDIO.shortPowerSupply, 2460],
  [AI_GUIDE_AUDIO.connectMultimeter, 6220],
  [AI_GUIDE_AUDIO.connectMultimeterReturn, 2120],
  [AI_GUIDE_AUDIO.allConnectionsComplete, 5220],
  [AI_GUIDE_AUDIO.firstCaseAutoConnected, 9850],
  [AI_GUIDE_AUDIO.firstCaseChecked, 11650],
  [AI_GUIDE_AUDIO.secondCaseChecked, 6300],
  [AI_GUIDE_AUDIO.rnReadingAdded, 6940],
  [AI_GUIDE_AUDIO.secondReadingAdded, 6900],
  [AI_GUIDE_AUDIO.thirdReadingAdded, 6300],
  [AI_GUIDE_AUDIO.secondCasePowerSupply, 5540],
  [AI_GUIDE_AUDIO.connectPowerSupplyPositive, 1680],
  [AI_GUIDE_AUDIO.connectPowerSupplyNegative, 1800],
  [AI_GUIDE_AUDIO.connectAmmeter, 2380],
  [AI_GUIDE_AUDIO.connectAmmeterReturn, 2380],
  [AI_GUIDE_AUDIO.thirdCaseAmmeter, 1340],
  [AI_GUIDE_AUDIO.connectAmmeterToLoad, 2300],
  [AI_GUIDE_AUDIO.connectLoadReturn, 2100],
  [AI_GUIDE_AUDIO.checkCaseTwoOrThree, 2720],
  [AI_GUIDE_AUDIO.checkThirdCase, 3680],
  [AI_GUIDE_AUDIO.continueWithAutoConnect, 4460],
  [AI_GUIDE_AUDIO.secondCaseAutoConnected, 5040],
  [AI_GUIDE_AUDIO.thirdCaseAutoConnected, 2720],
  [AI_GUIDE_AUDIO.voltageReady, 6320],
  [AI_GUIDE_AUDIO.thirdCasePowerOn, 6180],
  [AI_GUIDE_AUDIO.calculationReady, 15940],
  [AI_GUIDE_AUDIO.verifyCorrect, 8120],
  [AI_GUIDE_AUDIO.verifyIncorrect, 7000],
  [AI_GUIDE_AUDIO.verifyOneMissing, 4860],
  [AI_GUIDE_AUDIO.verifyMultipleMissing, 5000],
  [AI_GUIDE_AUDIO.report, 5020],
  [AI_GUIDE_AUDIO.print, 1340],
  [AI_GUIDE_AUDIO.reset, 3360],
  [AI_GUIDE_AUDIO.wrongConnection, 1380],
  [AI_GUIDE_AUDIO.multipleWrongConnections, 1640],
])

const AI_GUIDE_AUDIO_OWNER = 'ai-guide'
const AI_GUIDE_CONNECTION_STEPS = {
  rn: [
    {
      key: 'rn-7-8',
      terminals: ['7-endpoint', '8-endpoint'],
      text: 'Short the power-supply terminals 7 and 8.',
      audio: AI_GUIDE_AUDIO.shortPowerSupply,
    },
    {
      key: 'rn-3-9',
      terminals: ['3-endpoint', '9-endpoint'],
      text: 'Connect digital multimeter terminal 3 to terminal 9.',
      audio: AI_GUIDE_AUDIO.connectMultimeter,
    },
    {
      key: 'rn-4-11',
      terminals: ['4-endpoint', '11-endpoint'],
      text: 'Connect digital multimeter terminal 4 to terminal 11.',
      audio: AI_GUIDE_AUDIO.connectMultimeterReturn,
    },
  ],
  isc: [
    {
      key: 'isc-5-7',
      terminals: ['5-endpoint', '7-endpoint'],
      text: 'Connect power-supply terminal 5 to terminal 7.',
      audio: AI_GUIDE_AUDIO.connectPowerSupplyPositive,
    },
    {
      key: 'isc-6-8',
      terminals: ['6-endpoint', '8-endpoint'],
      text: 'Connect power-supply terminal 6 to terminal 8.',
      audio: AI_GUIDE_AUDIO.connectPowerSupplyNegative,
    },
    {
      key: 'isc-1-9',
      terminals: ['1-endpoint', '9-endpoint'],
      text: 'Connect ammeter terminal 1 to terminal 9.',
      audio: AI_GUIDE_AUDIO.connectAmmeter,
    },
    {
      key: 'isc-2-11',
      terminals: ['2-endpoint', '11-endpoint'],
      text: 'Connect ammeter terminal 2 to terminal 11.',
      audio: AI_GUIDE_AUDIO.connectAmmeterReturn,
    },
  ],
  il: [
    {
      key: 'il-2-10',
      terminals: ['2-endpoint', '10-endpoint'],
      text: 'Connect ammeter terminal 2 to terminal 10.',
      audio: AI_GUIDE_AUDIO.connectAmmeterToLoad,
    },
    {
      key: 'il-11-12',
      terminals: ['11-endpoint', '12-endpoint'],
      text: 'Connect terminal 11 to terminal 12.',
      audio: AI_GUIDE_AUDIO.connectLoadReturn,
    },
  ],
}
const BASE_WIDTH = 1440
const BASE_HEIGHT = 960
const MIN_GRAPH_READINGS = 1
const MAX_OBSERVATIONS = 10
const VOLTAGE_SAFETY_LIMIT = 8.5
const VOLTAGE_SAFETY_RESET = 7.5

const NORTON_CONNECTIONS = {
  rn: [
    ['7-endpoint', '8-endpoint'],
    ['3-endpoint', '9-endpoint'],
    ['4-endpoint', '11-endpoint'],
  ],

  isc: [
    ['5-endpoint', '7-endpoint'],
    ['6-endpoint', '8-endpoint'],
    ['1-endpoint', '9-endpoint'],
    ['2-endpoint', '11-endpoint'],
  ],

  il: [
    ['5-endpoint', '7-endpoint'],
    ['6-endpoint', '8-endpoint'],
    ['1-endpoint', '9-endpoint'],
    ['2-endpoint', '10-endpoint'],
    ['11-endpoint', '12-endpoint'],
  ],
}

const NORTON_STAGES = {
  RESISTANCE: 'resistance',

  RN_CONNECTIONS: 'rn-connections',
  RN_CHECKED: 'rn-checked',

  ISC_CONNECTIONS: 'isc-connections',
  ISC_CHECKED: 'isc-checked',
  ISC_POWER: 'isc-power',

  IL_CONNECTIONS: 'il-connections',
  IL_CHECKED: 'il-checked',
  IL_POWER: 'il-power',

  CALCULATION: 'calculation',
  VERIFIED: 'verified',
}

const NORTON_ALERT_MESSAGES = {
  resistanceRequired:
    'Please set R1, R2, R3 and RL using the resistance sliders.',
  connectionsRequired:
    'Please make the required connections as per the given instructions.',
  rnAutoConnected:
    'The digital multimeter is now displaying the Norton resistance value. Now, click on the add button to add the readings to the observation table.',
  rnVerified:
    'Connections Verified successfully. The digital multimeter is now displaying the Norton resistance value. Now, click on the add button to add the readings to the observation table.',
  iscAutoConnected:
    'Now switch ON the power supply and set the required voltage value.',
  iscVerified:
    'Connections Verified successfully. Now switch ON the power supply and set the required voltage value.',
  iscReadingDisplayed:
    'The reading is displayed on the ammeter. Now, click on the add button to add the reading to the observation table.',
  ilAutoConnected:
    'Now turn ON the power supply.',
  ilVerified:
    'Connections verified successfully. Now turn ON the power supply.',
  ilReadingDisplayed:
    'The reading is displayed on an ammeter. Now, click on the add button to add the reading to the observation table.',
  finalReadingAdded:
    'Final reading added to the observation table. Now, click on the Calculate button to manually verify the theorem.',
  calculationReady:
    'The resistance and source values are displayed in the theoretical verification panel. Calculate the load current manually using the rules of the Norton Theorem, enter the calculated values in the input field, and click the Verify button to verify the theorem.',
  reportGenerated:
    'Your report is ready. After the narration finishes, click View Report.',
  simulationReset:
    'The simulation has been reset. You can start again.',
}

const getNortonConnectionCase = (observations = {}) => {
  if (observations.nortonResistance === null) {
    return 'rn'
  }

  if (observations.shortCircuitCurrent === null) {
    return 'isc'
  }

  return 'il'
}

const getObservationSignature = ({ i1, i2, i3, voltage }) => (
  [
    Number(voltage).toFixed(1),
    Number(i1).toFixed(3),
    Number(i2).toFixed(3),
    Number(i3).toFixed(3),
  ].join('|')
)

const formatVoltage = (value) => {
  const number = Number(value)

  if (!Number.isFinite(number)) {
    return ''
  }

  return Number.isInteger(number)
    ? number.toFixed(0)
    : number.toFixed(1)
}

const getScale = () => {
  if (typeof window === 'undefined') {
    return 1
  }

  const availableWidth = document.documentElement.clientWidth

  /*
   * Fit the board by width only. Including the viewport height here makes the
   * entire experiment unnecessarily small (and its raster equipment blurry)
   * on laptop screens. Never enlarge it past its native 1440 px canvas.
   */
  return Math.max(
    Math.min(availableWidth / BASE_WIDTH, 1),
    0.1,
  )
}
const formatNode = (nodeId) => (
  nodeId ? nodeId.toString().replace('-endpoint', '') : ''
)

const isSameConnection = (c1, c2) => (
  (c1[0] === c2[0] && c1[1] === c2[1]) ||
  (c1[0] === c2[1] && c1[1] === c2[0])
)




const toPairKey = (connection) => (
  [connection[0], connection[1]].sort().join('|')
)

const buildConnectionAlertDescription = (rawConnections, requiredConnections) => {
  const requiredKeys = new Set(requiredConnections.map(toPairKey))
  const rawKeys = new Set(rawConnections.map(toPairKey))

  const wrongConnections = rawConnections.filter((connection) => (
    !requiredKeys.has(toPairKey(connection))
  ))

  const missingConnections = requiredConnections.filter((connection) => (
    !rawKeys.has(toPairKey(connection))
  ))

  const wrongText = wrongConnections.length === 0
  ? ''
  : `Wrong Connections:\n${wrongConnections
      .map(
        (connection, index) =>
          `${index + 1}. ${formatNode(connection[0])} → ${formatNode(connection[1])}`
      )
      .join('\n')}`

  const visibleMissing = missingConnections

  const missingText = missingConnections.length === 0
  ? ''
  : `Missing Connections:\n${visibleMissing
      .map(
        (connection, index) =>
          `${index + 1}. ${formatNode(connection[0])} → ${formatNode(connection[1])}`
      )
      .join('\n')}`

  return [wrongText, missingText].filter(Boolean).join('\n\n')
}

const App = () => {
  const { confirmAlert, showStepAlert } = useLabAlerts()
  const [experimentStage, setExperimentStage] = useState(
    NORTON_STAGES.RESISTANCE,
  )
  const [
  multimeterMode,
  setMultimeterMode,
] = useState('resistance')
  const [observations, setObservations] = useState({
    nortonResistance: null,
    shortCircuitCurrent: null,
    loadCurrent: null,
    voltage: null,
    loadResistance: null,
  })

  const currentCase = getNortonConnectionCase(observations)
  const requiredConnections = NORTON_CONNECTIONS[currentCase]
  const [scale, setScale] = useState(getScale)
  const [contentHeight, setContentHeight] = useState(BASE_HEIGHT)
  const appScaleRef = useRef(null)
  const [r1, setR1] = useState(1)
  const [r2, setR2] = useState(1)
  const [r3, setR3] = useState(1)
const [rl, setRl] = useState(1)
  const [resistanceSet, setResistanceSet] = useState(false)
  const [voltage, setVoltage] = useState(0)
  const [powerOn, setPowerOn] = useState(false)
  const [current, setCurrent] = useState(0)
  const [verificationRows, setVerificationRows] = useState([])
  const [calculationVerificationRows, setCalculationVerificationRows] = useState([])
  
  const [autoFillTrigger, setAutoFillTrigger] = useState(0)
const [currentSourceOn, setCurrentSourceOn] = useState(false)
const [lockedCurrent, setLockedCurrent] = useState(null)
const [sourcesLocked, setSourcesLocked] = useState(false)
const [calculationResetTrigger, setCalculationResetTrigger] = useState(0)
const [showFormulaPanel, setShowFormulaPanel] = useState(false)
const [aiGuideEnabled, setAiGuideEnabled] = useState(false)
const aiGuideEnabledRef = useRef(false)
const [activeGuideTerminals, setActiveGuideTerminals] = useState([])
const [manualGuideCase, setManualGuideCase] = useState(null)
const [manualGuideIndex, setManualGuideIndex] = useState(0)
const manualGuideCaseRef = useRef(null)
const manualGuideIndexRef = useRef(0)
const autoConnectFeedbackPlayedRef = useRef(false)
const lastGuideMessageRef = useRef('')
const resistanceGuideTimerRef = useRef(null)
const case1IntroSpokenRef = useRef(false)
const chooseModeAudioPlayedRef = useRef(false)
const [calculationsVerified, setCalculationsVerified] = useState(false)
const [highlightWalkthrough, setHighlightWalkthrough] = useState(false)
const touchedResistorsRef = useRef(new Set())
const lastInstructionAudioRef = useRef('')
const aiGuideJustEnabledRef = useRef(false)
const iscReadingAlertShownRef = useRef(false)

const [lockedVoltage, setLockedVoltage] = useState(null)
  
const [lockedExperimentVoltage, setLockedExperimentVoltage] =
  useState(null)
const observationsRef = useRef(observations)

useEffect(() => {
  observationsRef.current = observations
}, [observations])
/*const aiGuideAudioRef = useRef(null)
const aiGuideAudioTimerRef = useRef(null)*/
const currentAudioPathRef = useRef('')

  /*const [pendingObservation, setPendingObservation] = useState({
  i1Cs: null,
  i1Vs: null,
  i1Total: null,
  voltageVs: null,
  currentCs: null,
})*/
  const [graphGenerated, setGraphGenerated] = useState(false)
  const [reportGenerated, setReportGenerated] = useState(false)
  const [status, setStatus] = useState('Make the connections, click CHECK, then set the resistance values.')

  const [autoConnectRequest, setAutoConnectRequest] = useState({
    id: 0,
    caseKey: null,
  })
  const [checkRequest, setCheckRequest] = useState(0)
  const [resetRequest, setResetRequest] = useState(0)
  const [pendingReportData, setPendingReportData] = useState(null)
  const [connectionsVerified, setConnectionsVerified] = useState(false)
  const [
  connectionsLocked,
  setConnectionsLocked,
] = useState(false)
  const [
  lockedConnections,
  setLockedConnections,
] = useState({
  ammeter: false,
  multimeter: false,
  voltageSource: false,
  circuit: false,
  all: false,
})
  const [instructionStep, setInstructionStep] = useState('resistance')
  const instructionStepRef = useRef('resistance')

useEffect(() => {
  instructionStepRef.current = instructionStep
}, [instructionStep])
  const [sessionStart, setSessionStart] = useState(() => Date.now())
  const removedAfterCase1Ref = useRef(new Set())
  const voltageLimitWarningShownRef = useRef(false)

  useEffect(() => {
    const handleResize = () => setScale(getScale())

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const appScale = appScaleRef.current

    if (!appScale) return undefined

    const measureContent = () => {
      const nextHeight = Math.max(
        BASE_HEIGHT,
        Math.ceil(appScale.scrollHeight),
      )

      setContentHeight((currentHeight) => (
        currentHeight === nextHeight ? currentHeight : nextHeight
      ))
    }

    measureContent()

    const resizeObserver = new ResizeObserver(measureContent)
    resizeObserver.observe(appScale)

    return () => resizeObserver.disconnect()
  }, [])
 const handleResistanceCommit = (key) => {
  touchedResistorsRef.current.add(key)

  if (
    touchedResistorsRef.current.size < 4
  ) {
    setResistanceSet(false)
    setInstructionStep('resistance')

    return
  }

  setResistanceSet(true)
  setInstructionStep(
    'rn-connections',
  )

  setStatus(
    'Resistance values set. Make the Case 1 connections to measure RN.',
  )

  if (
    aiGuideEnabled &&
    !case1IntroSpokenRef.current
  ) {
    case1IntroSpokenRef.current = true
    beginRnConnectionGuide()
  }
}
const normalizePair = (a, b) => [a, b].sort().join('|')

const normalizeTerminalId = (id) => {
  if (!id) return ''
  const value = String(id)
  return value.endsWith('-endpoint') ? value : `${value}-endpoint`
}

const isSamePair = (firstPair, secondPair) => (
  normalizePair(
    normalizeTerminalId(firstPair[0]),
    normalizeTerminalId(firstPair[1]),
  ) === normalizePair(
    normalizeTerminalId(secondPair[0]),
    normalizeTerminalId(secondPair[1]),
  )
)

const clearManualConnectionGuide = () => {
  setActiveGuideTerminals([])
  setManualGuideCase(null)
  setManualGuideIndex(0)
  manualGuideCaseRef.current = null
  manualGuideIndexRef.current = 0
}

const getCurrentManualGuideStep = () => {
  const caseKey = manualGuideCaseRef.current
  const index = manualGuideIndexRef.current

  if (!caseKey) return null

  return AI_GUIDE_CONNECTION_STEPS[caseKey]?.[index] ?? null
}
const startManualConnectionGuide = (
  caseKey,
  introAudio = null,
  force = false,
) => {
  stopAiGuideAudio()
  const firstStep = AI_GUIDE_CONNECTION_STEPS[caseKey]?.[0]

  if (!firstStep) return

  setManualGuideCase(caseKey)
  setManualGuideIndex(0)
  manualGuideCaseRef.current = caseKey
  manualGuideIndexRef.current = 0
  setActiveGuideTerminals(firstStep.terminals)

  const playFirstStep = () => {
    playAiGuideAudio(firstStep.audio, force)
  }

  if (introAudio) {
    playAiGuideAudio(
      introAudio,
      force,
      playFirstStep,
    )
    return
  }

  playFirstStep()
}

const repeatManualConnectionStep = (step) => {
  if (!step) return

  setActiveGuideTerminals(step.terminals)

  playAiGuideAudio(AI_GUIDE_AUDIO.wrongConnection, true, () => {
    playAiGuideAudio(step.audio, true)
  })
}

const advanceManualConnectionStep = () => {
  const caseKey = manualGuideCaseRef.current
  const currentIndex = manualGuideIndexRef.current
  const nextIndex = currentIndex + 1
  const nextStep = AI_GUIDE_CONNECTION_STEPS[caseKey]?.[nextIndex]

  console.log('ADVANCE GUIDE:', {
    caseKey,
    currentIndex,
    nextIndex,
    nextStep,
  })

  if (!nextStep) {
    clearManualConnectionGuide()

    playAiGuideAudio(
      caseKey === 'rn'
        ? AI_GUIDE_AUDIO.allConnectionsComplete
        : caseKey === 'il'
          ? AI_GUIDE_AUDIO.checkThirdCase
          : AI_GUIDE_AUDIO.checkCaseTwoOrThree,
    )
    return
  }

  manualGuideIndexRef.current = nextIndex
  setManualGuideIndex(nextIndex)
  setActiveGuideTerminals([...nextStep.terminals])

  playAiGuideAudio(nextStep.audio)
}

const requiredCase1Removals = new Set([
  normalizePair('1-endpoint', '9-endpoint'),
  normalizePair('2-endpoint', '10-endpoint'),
  normalizePair('17-endpoint', '18-endpoint'),
])
const addedCase2VoltageRef = useRef(new Set())
const requiredCase2VoltageAdds = new Set([
  normalizePair('17-endpoint', '19-endpoint'),
  normalizePair('18-endpoint', '20-endpoint'),
])

  const readings = useMemo(
  () => calculateReadings({
    voltage,
    powerOn,
    r1,
    r2,
    r3,
    rl,
  }),
  [
    voltage,
    powerOn,
    r1,
    r2,
    r3,
    rl,
  ],
)

  const normalizedVoltage = Number(voltage.toFixed(1))
  const currentReadingSignature = getObservationSignature({
    i1: readings.i1,
    i2: readings.i2,
    i3: readings.i3,
    voltage: normalizedVoltage,
  })
  /*const hasDuplicateReading = observations.some((row) => (
    row.voltage === normalizedVoltage
      || getObservationSignature(row) === currentReadingSignature
  ))*/
 const readingCount = [
  observations.nortonResistance,
  observations.shortCircuitCurrent,
  observations.loadCurrent,
].filter(
  (value) =>
    value !== null &&
    value !== undefined,
).length

const stopAiGuideAudio = useCallback(
  (reason = 'manual-stop') => {
    stopSharedAudio(
      `ai-guide:${reason}`,
      AI_GUIDE_AUDIO_OWNER,
    )

    currentAudioPathRef.current = ''
  },
  [],
)

const playAiGuideAudio = useCallback(
  (
    audioPath,
    force = false,
    onEnd = null,
    onCancel = null,
  ) => {
    if ((!aiGuideEnabled && !force) || !audioPath) {
      onCancel?.()
      return null
    }

    currentAudioPathRef.current = audioPath

    return playSharedAudio({
      src: audioPath,
      owner: AI_GUIDE_AUDIO_OWNER,
      enabled: true,

      onStart: () => {
        console.log('AI GUIDE AUDIO STARTED:', audioPath)
      },

      onEnd: () => {
        if (currentAudioPathRef.current === audioPath) {
          currentAudioPathRef.current = ''
        }

        onEnd?.()
      },

      onStop: () => {
        if (currentAudioPathRef.current === audioPath) {
          currentAudioPathRef.current = ''
        }

        onCancel?.()
      },

      onError: (error) => {
        console.error('AI GUIDE AUDIO COULD NOT PLAY:', {
          audioPath,
          error,
        })

        if (currentAudioPathRef.current === audioPath) {
          currentAudioPathRef.current = ''
        }

        onCancel?.()
      },
    })
  },
  [aiGuideEnabled],
)

const playAiGuideAudioThen = (
  audioPath,
  next,
  force = false,
) => {
  playAiGuideAudio(
    audioPath,
    force,
    next,
  )
}

const beginRnConnectionGuide = (force = false) => {
  playAiGuideAudioThen(
    AI_GUIDE_AUDIO.resistanceReady,
    () => {
      playAiGuideAudioThen(
        AI_GUIDE_AUDIO.nortonResistanceIntro,
        () => {
          playAiGuideAudioThen(
            AI_GUIDE_AUDIO.chooseConnectionMode,
            () => {
              startManualConnectionGuide(
                'rn',
                null,
                force,
              )
            },
            force,
          )
        },
        force,
      )
    },
    force,
  )
}

const beginIscConnectionGuide = (force = false) => {
  startManualConnectionGuide(
    'isc',
    AI_GUIDE_AUDIO.secondCasePowerSupply,
    force,
  )
}

const beginIlConnectionGuide = (force = false) => {
  startManualConnectionGuide(
    'il',
    AI_GUIDE_AUDIO.thirdCaseAmmeter,
    force,
  )
}

const beginThirdCaseGuide = (force = false) => {
  playAiGuideAudioThen(
    AI_GUIDE_AUDIO.continueWithAutoConnect,
    () => beginIlConnectionGuide(force),
    force,
  )
}

useEffect(() => {
  const handleComplete = () => {
    setHighlightWalkthrough(false)

    if (!aiGuideEnabled) return

    playAiGuideAudio(
      AI_GUIDE_AUDIO.walkthroughComplete,
      true,
    )
  }

  window.addEventListener(
    'walkthrough-complete',
    handleComplete,
  )

  return () => {
    window.removeEventListener(
      'walkthrough-complete',
      handleComplete,
    )
  }
}, [aiGuideEnabled, playAiGuideAudio])
const showAlertWithOptionalAudio = useCallback(
  (alert, audioPath, options = {}) => {
    // Operation alerts narrate independently of the optional walkthrough.
    // Direct playAiGuideAudio calls remain controlled by the AI Guide toggle.
    const shouldNarrate = Boolean(audioPath)
    let completeNarration
    const narrationCompletion = shouldNarrate
      ? new Promise((resolve) => {
          completeNarration = resolve
        })
      : null
    const audioDuration = shouldNarrate
      ? AI_GUIDE_AUDIO_DURATION_MS.get(audioPath)
      : null

    return showStepAlert({
      ...alert,
      duration:
        audioDuration ?? alert.duration,
      completionPromise: narrationCompletion,
      target: null,
      onShow: (shownAlert) => {
        alert.onShow?.(shownAlert)

        if (shouldNarrate) {
          playAiGuideAudio(
            audioPath,
            true,
            () => {
              options.onAudioEnd?.()
              completeNarration?.()
            },
            () => {
              completeNarration?.()
            },
          )
        }
      },
      onDismissStart: (reason, dismissedAlert) => {
        alert.onDismissStart?.(
          reason,
          dismissedAlert,
        )

        if (
          shouldNarrate &&
          currentAudioPathRef.current === audioPath
        ) {
          stopAiGuideAudio(
            `alert-${reason}`,
          )
        }
      },
      onClose: (reason, dismissedAlert) => {
        alert.onClose?.(reason, dismissedAlert)
        options.onAlertClose?.(
          reason,
          dismissedAlert,
        )
      },
    })
  },
  [
    playAiGuideAudio,
    showStepAlert,
    stopAiGuideAudio,
  ],
)

const speakCurrentInstruction = useCallback(
  (step = instructionStep) => {
    if (!aiGuideEnabled) return

    const message = AI_GUIDE_STEP_MESSAGES[step]
    if (!message) return

    // WAV narration chal rahi ho toh browser TTS mat chalao.
    stopSharedAudio(
      'before-browser-speech',
    )

    lastGuideMessageRef.current = `step-${step}`
    speakGuideMessage(message)
  },
  [aiGuideEnabled, instructionStep],
)

const isCase3InProgress = (
  observations.currentSourceOnly &&
  observations.voltageSourceOnly &&
  !observations.bothSources
)

const canPlotGraph = readingCount >= 3

const canAddReading =
  readingCount < 3 &&
  connectionsVerified &&
  connectionsLocked &&
  (
    currentCase === 'rn'
      ? !powerOn
      : powerOn &&
        Number(voltage) > 0
  )

  const recordObservation = () => {
  if (readingCount >= 3) {
    showAlertWithOptionalAudio({
      title: 'Experiment Already Completed',
      description:
        'All three case readings have already been added. Click CALCULATE to continue.',
      type: 'info',
      target: '#calculate-button',
    })

    return
  }

  if (!connectionsVerified) {
    showAlertWithOptionalAudio({
      title: 'Check Connections First',
      description:
        'Click CHECK and verify the required circuit connections before adding the reading.',
      type: 'warning',
      icon: '⚠️',
      target: '#check-button',
    })

    return
  }

  /*
   * CASE 1
   * Measure Norton resistance RN.
   */
  if (currentCase === 'rn') {
    if (powerOn) {
      showAlertWithOptionalAudio({
        title: 'Power Supply Must Be OFF',
        description:
          'Norton resistance must be measured with the independent voltage source deactivated.',
        type: 'error',
        icon: '❌',
        target: '#power-supply',
      })

      return
    }

    setObservations((currentObservations) => ({
      ...currentObservations,

      nortonResistance:
        readings.nortonResistance,

      loadResistance: Number(rl),
    }))

    setConnectionsVerified(false)
    setConnectionsLocked(false)
    iscReadingAlertShownRef.current = false

    setInstructionStep(
      'rn-remove-connections',
    )

    setStatus(
      'RN reading saved. Remove connections 7–8, 3–9 and 4–11.',
    )

    showAlertWithOptionalAudio(
      {
        title: 'Norton Resistance Added',
        description:
          'RN has been recorded. Remove connections 7–8, 3–9 and 4–11 without resetting the experiment.',
        type: 'success',
        icon: '✅',
        target: '#observation-table-panel',
      },
      AI_GUIDE_AUDIO.rnReadingAdded,
      {
        onAlertClose: (reason) => {
          if (
            reason === 'timeout' &&
            aiGuideEnabledRef.current
          ) {
            beginIscConnectionGuide()
          }
        },
      },
    )

    return
  }

  /*
   * CASE 2
   * Measure short-circuit current Isc.
   */
  if (currentCase === 'isc') {
    if (!powerOn) {
      showAlertWithOptionalAudio({
        title: 'Turn ON the Power Supply',
        description:
          'Turn ON the power supply before recording the short-circuit current.',
        type: 'warning',
        icon: '⚡',
        target: '#power-supply',
      })

      return
    }

    if (Number(voltage) <= 0) {
      showAlertWithOptionalAudio({
        title: 'Set the Supply Voltage',
        description:
          'Increase the voltage above zero before adding the Isc reading.',
        type: 'warning',
        icon: '⚡',
        target: '#voltage-control',
      })

      return
    }

    setObservations((currentObservations) => ({
      ...currentObservations,

      shortCircuitCurrent:
        readings.shortCircuitCurrent,

      voltage: Number(voltage),

      loadResistance: Number(rl),
    }))

    setLockedExperimentVoltage(
      Number(voltage),
    )

    setConnectionsVerified(false)
    setConnectionsLocked(false)
    setPowerOn(false)

    setInstructionStep(
      'isc-remove-connection',
    )

    setStatus(
      'Isc reading saved and the power supply switched OFF. Remove connection 2–11 or use AUTO CONNECT for Case 3.',
    )

    showAlertWithOptionalAudio(
      {
        title: 'Short-Circuit Current Added',
        description:
          'Isc has been recorded and the power supply is OFF. Remove only connection 2–11 or use AUTO CONNECT for the Case 3 load-current wiring.',
        type: 'success',
        icon: '✅',
        target: '#observation-table-panel',
      },
      AI_GUIDE_AUDIO.secondReadingAdded,
      {
        onAlertClose: (reason) => {
          if (
            reason === 'timeout' &&
            aiGuideEnabledRef.current
          ) {
            beginThirdCaseGuide()
          }
        },
      },
    )

    return
  }

  /*
   * CASE 3
   * Measure load current IL.
   */
  if (currentCase === 'il') {
    if (!powerOn) {
      showAlertWithOptionalAudio({
        title: 'Turn ON the Power Supply',
        description:
          'Turn ON the power supply before recording the load current.',
        type: 'warning',
        icon: '⚡',
        target: '#power-supply',
      })

      return
    }

    if (Number(voltage) <= 0) {
      showAlertWithOptionalAudio({
        title: 'Set the Supply Voltage',
        description:
          'Increase the supply voltage above zero before recording IL.',
        type: 'warning',
        icon: '⚡',
        target: '#voltage-control',
      })

      return
    }

    if (
      lockedExperimentVoltage !== null &&
      Math.abs(
        Number(voltage) -
        Number(lockedExperimentVoltage),
      ) > 0.001
    ) {
      showAlertWithOptionalAudio({
        title: 'Use the Same Supply Voltage',
        description:
          `Set the supply to ${formatVoltage(
            lockedExperimentVoltage,
          )} V, the same voltage used while measuring Isc.`,
        type: 'warning',
        icon: '⚠️',
        target: '#voltage-control',
      })

      return
    }

    setObservations((currentObservations) => ({
      ...currentObservations,

      loadCurrent:
        readings.nortonCalculatedLoadCurrent,

      voltage: Number(voltage),

      loadResistance: Number(rl),
    }))

    setConnectionsVerified(true)
    setConnectionsLocked(true)
    setSourcesLocked(true)

    setInstructionStep(
      'calculate-button',
    )

    setStatus(
      'IL reading saved. Click CALCULATE to verify Norton’s theorem.',
    )

    showAlertWithOptionalAudio(
      {
        title: 'Final Reading Added',
        description:
          NORTON_ALERT_MESSAGES.finalReadingAdded,
        type: 'success',
        icon: '✅',
        target: '#calculate-button',
      },
      AI_GUIDE_AUDIO.thirdReadingAdded,
    )
  }
}

  const resetSimulation = useCallback(() => {
  setInstructionStep('reset')

  window.clearTimeout(
    resistanceGuideTimerRef.current,
  )

  stopAiGuideAudio(
    'simulation-reset',
  )

  setAiGuideEnabled(false)
  aiGuideEnabledRef.current = false
  window.speechSynthesis?.cancel()

  aiGuideJustEnabledRef.current = false
  lastGuideMessageRef.current = ''
  case1IntroSpokenRef.current = false
  clearManualConnectionGuide()

  setPowerOn(false)
  setVoltage(0)

  setR1(1)
  setR2(1)
  setR3(1)
  setRl(1)

  setResistanceSet(false)

  setObservations({
    nortonResistance: null,
    shortCircuitCurrent: null,
    loadCurrent: null,
    voltage: null,
    loadResistance: null,
  })

  setLockedVoltage(null)
  setLockedExperimentVoltage(null)
setConnectionsLocked(false)
  setSourcesLocked(false)

  setCalculationResetTrigger(
    (previous) => previous + 1,
  )

  setAutoFillTrigger(0)
  setGraphGenerated(false)
  setReportGenerated(false)
  setCalculationsVerified(false)

  setAutoConnectRequest({
    id: 0,
    caseKey: null,
  })
  setCheckRequest(0)
  setConnectionsVerified(false)

  setResetRequest(
    (current) => current + 1,
  )

  setSessionStart(Date.now())

  touchedResistorsRef.current.clear()
  iscReadingAlertShownRef.current = false

  setLockedConnections({
    ammeter: false,
    multimeter: false,
    voltageSource: false,
    circuit: false,
    all: false,
  })

  setStatus(
    'Simulation reset. Set R1, R2, R3 and RL before making circuit connections.',
  )

  showAlertWithOptionalAudio(
    {
      title: 'Simulation Reset',
      description:
        NORTON_ALERT_MESSAGES.simulationReset,
      type: 'success',
    },
    AI_GUIDE_AUDIO.reset,
  )

  setInstructionStep('resistance')
}, [
  showAlertWithOptionalAudio,
  stopAiGuideAudio,
])

  /*const handleReset = async () => {
    const confirmed = await confirmAlert(EXPERIMENT_ALERTS.resetWarning)

    if (confirmed) {
      resetSimulation()
    }
  }*/
 const handleReset = () => {
  resetSimulation()
}

  const handlePlot = () => {
    if (!canPlotGraph) {
      const remainingReadings = MIN_GRAPH_READINGS - readingCount

      setGraphGenerated(false)
      setReportGenerated(false)
      setStatus(`Add ${remainingReadings} more reading(s) before plotting the graph.`)
      showStepAlert(EXPERIMENT_ALERTS.insufficientGraphReadings, {
        description: `Add ${remainingReadings} more reading(s) before plotting.`,
      })
      return
    }

    setGraphGenerated(true)
    setReportGenerated(false)
    setStatus('Observation graph plotted from the table readings.')
    showStepAlert(EXPERIMENT_ALERTS.graphPlotted)
  }

  const handlePrint = () => {
    setInstructionStep('print')
  if (readingCount < 3) {
    showAlertWithOptionalAudio({
      title: 'No Observation Found',
      description: 'Complete all three cases before generating the report.',
      type: 'warning',
    })
    return
  }

  playAiGuideAudio(
    AI_GUIDE_AUDIO.print,
    true,
    () => window.print(),
  )
}
const handleCalculate = () => {
  if (readingCount < 3) {
    showAlertWithOptionalAudio({
      title: 'Complete All Three Cases',
      description:
        'Add the Case 1, Case 2 and Case 3 readings before calculating.',
      type: 'warning',
      target: '#observation-table-panel',
    })

    return
  }

  stopAiGuideAudio()

  setAutoFillTrigger((prev) => prev + 1)
  setInstructionStep(
  'calculation-enter-value',
)

  window.setTimeout(() => {
    document
      .getElementById('calculation-panel')
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })

    showAlertWithOptionalAudio(
      {
        title: 'Theoretical Verification Panel Updated',
        description:
          NORTON_ALERT_MESSAGES.calculationReady,
        type: 'info',
        icon: 'ℹ️',
        dedupeKey: `calculate-alert-${Date.now()}`,
      },
      AI_GUIDE_AUDIO.calculationReady,
    )
  }, 300)
}
const handleAiGuide = () => {
  if (aiGuideEnabled) {
    stopAiGuideAudio('guide-disabled')
    window.speechSynthesis?.cancel()

    setAiGuideEnabled(false)
    aiGuideEnabledRef.current = false
    setHighlightWalkthrough(false)
    clearManualConnectionGuide()

    lastGuideMessageRef.current = ''
    lastInstructionAudioRef.current = ''
    currentAudioPathRef.current = ''
    aiGuideJustEnabledRef.current = false

    return
  }

  setAiGuideEnabled(true)
  aiGuideEnabledRef.current = true

  lastGuideMessageRef.current = ''
  lastInstructionAudioRef.current = ''
  aiGuideJustEnabledRef.current = true

  // force=true because state update async hai.
  playAiGuideAudio(
    AI_GUIDE_AUDIO.aiGuideClick,
    true,
    () => {
      if (!resistanceSet) return

      if (currentCase === 'rn') {
        case1IntroSpokenRef.current = true
        beginRnConnectionGuide(true)
        return
      }

      if (currentCase === 'isc') {
        beginIscConnectionGuide(true)
        return
      }

      beginThirdCaseGuide(true)
    },
  )

  window.setTimeout(() => {
    aiGuideJustEnabledRef.current = false
  }, 1200)
}
  const handleGenerateReport = () => {
  console.log('GENERATE REPORT CLICKED', {
    aiGuideEnabled,
    readingCount,
    observations,
  })

  if (readingCount < 3) {
    showAlertWithOptionalAudio({
      title: 'Incomplete Observations',
      description: 'Complete all three cases before generating the report.',
      type: 'warning',
    })
    return
  }

  const openReport = () => {
    const generated = generateNortonReport({
      observations,
      resistances: { r1, r2, r3, rl },
      sessionStart,
      verificationRows: calculationVerificationRows,
    })

    if (!generated) {
      setStatus('Unable to open the report window.')
      window.alert('Unable to open the report window. Please allow pop-ups and try again.')
      return
    }

    setReportGenerated(true)
    setStatus('Norton theorem report generated successfully.')
  }

  showAlertWithOptionalAudio(
    {
      title: 'Report Ready',
      description:
        NORTON_ALERT_MESSAGES.reportGenerated,
      type: 'success',
      confirmLabel: 'View Report',
      dedupeKey: 'report-ready',
      onConfirm: openReport,
      requiresConfirmation: true,
      icon: '📄',
    },
    AI_GUIDE_AUDIO.report,
  )
}

  const scaledWidth = Math.ceil(BASE_WIDTH * scale)
  const scaledHeight = Math.ceil(contentHeight * scale)
  const handleConnectionChange = (connectionCount) => {
  setConnectionsVerified(false)

  setStatus(
    connectionCount > 0
      ? `${connectionCount} connection(s) present. Click CHECK to verify.`
      : 'Make the required Norton circuit connections.',
  )
}

const handleConnectionAdded = (
  sourceId,
  targetId,
) => {
  setConnectionsVerified(false)

  const guideStep = getCurrentManualGuideStep()

  if (aiGuideEnabled && guideStep) {
    if (
      isSamePair(
        [sourceId, targetId],
        guideStep.terminals,
      )
    ) {
      advanceManualConnectionStep()
    } else {
      repeatManualConnectionStep(guideStep)
    }
  }

  if (
    currentCase === 'isc'
  ) {
    setInstructionStep(
      'isc-connections',
    )
  }

  if (
    currentCase === 'il'
  ) {
    setInstructionStep(
      'il-connections',
    )
  }
}

const handleConnectionDetached = (
  sourceId,
  targetId,
) => {
  setConnectionsVerified(false)

  console.log(
    'Connection removed:',
    sourceId,
    targetId,
  )

  if (
    observations.nortonResistance !== null &&
    observations.shortCircuitCurrent === null
  ) {
    setInstructionStep(
      'isc-connections',
    )

    setStatus(
      'Make the Case 2 connections to measure Isc.',
    )

    return
  }

  if (
    observations.shortCircuitCurrent !== null &&
    observations.loadCurrent === null
  ) {
    setInstructionStep(
      'il-connections',
    )

    setStatus(
      'Make the Case 3 connections to measure IL.',
    )

    return
  }

  setStatus(
    'Connection removed. Complete the wiring and click CHECK again.',
  )
}

  const handleCheckConnections = useCallback(
  (result) => {
    console.log(
      'Norton check result:',
      result,
    )

    if (!result?.isCorrect) {
      setConnectionsVerified(false)

      const caseKey =
        getNortonConnectionCase(
          observationsRef.current,
        )

      const requiredConnections =
        NORTON_CONNECTIONS[caseKey]

      const actualConnections =
        result.actualConnections ||
        result.rawConnections ||
        []

      const hasConnections = actualConnections.length > 0

      const requiredKeys = new Set(
        requiredConnections.map(toPairKey),
      )
      const actualKeys = new Set(
        actualConnections.map(toPairKey),
      )
      const issueCount = (
        actualConnections.filter(
          (connection) =>
            !requiredKeys.has(toPairKey(connection)),
        ).length +
        requiredConnections.filter(
          (connection) =>
            !actualKeys.has(toPairKey(connection)),
        ).length
      )
      const connectionErrorAudio = !hasConnections
        ? null
        : issueCount > 1
          ? AI_GUIDE_AUDIO.multipleWrongConnections
          : AI_GUIDE_AUDIO.wrongConnection

      const description =
        buildConnectionAlertDescription(
          actualConnections,
          requiredConnections,
        )

      showAlertWithOptionalAudio(
        {
          title: hasConnections
            ? 'Invalid Connections'
            : 'Connections Required',
          description:
            hasConnections
              ? description || 'One or more connections are incorrect or missing.'
              : NORTON_ALERT_MESSAGES.connectionsRequired,
          type: hasConnections ? 'error' : 'warning',
          icon: '❌',
          target: '#circuit-panel',
        },
        connectionErrorAudio,
      )

      setStatus(
        'Invalid connections. Remove incorrect wires and reconnect the required terminals.',
      )

      return
    }

    setConnectionsVerified(true)
    setConnectionsLocked(true)

    if (result.caseKey === 'rn') {
      setInstructionStep(
        'rn-add-reading',
      )

      setStatus(
        'RN connections verified. Keep the power supply OFF and click ADD.',
      )

      showAlertWithOptionalAudio(
        {
          title: 'Connections Verified',
          description:
            NORTON_ALERT_MESSAGES.rnVerified,
          type: 'success',
          icon: '✅',
          target: '#digital-multimeter',
        },
        AI_GUIDE_AUDIO.firstCaseChecked,
      )

      return
    }

    if (result.caseKey === 'isc') {
      setInstructionStep(
        'isc-power',
      )

      setStatus(
        'Isc connections verified. Turn ON the power supply and set the voltage.',
      )

      showAlertWithOptionalAudio(
        {
          title: 'Connections Verified',
          description:
            NORTON_ALERT_MESSAGES.iscVerified,
          type: 'success',
          icon: '✅',
          target: '#power-supply',
        },
        AI_GUIDE_AUDIO.secondCaseChecked,
      )

      return
    }

    if (result.caseKey === 'il') {
      setInstructionStep(
        powerOn
          ? 'il-add-reading'
          : 'il-power',
      )

      setStatus(
        powerOn
          ? 'IL connections verified. Click ADD to record the load current.'
          : 'IL connections verified. Turn ON the power supply and use the same voltage.',
      )

      showAlertWithOptionalAudio(
        {
          title: 'Connections Verified',
          description:
            powerOn
              ? NORTON_ALERT_MESSAGES.ilReadingDisplayed
              : NORTON_ALERT_MESSAGES.ilVerified,
          type: 'success',
          icon: '✅',
          target: powerOn ? '#ammeter-a' : '#power-supply',
        },
        powerOn
          ? AI_GUIDE_AUDIO.thirdCasePowerOn
          : null,
      )
    }
  },
  [
    powerOn,
    showAlertWithOptionalAudio,
  ],
)

  const handleCheck = () => {
  if (!resistanceSet) {
    showAlertWithOptionalAudio({
      title: 'Set Resistance Values',
      description:
        NORTON_ALERT_MESSAGES.resistanceRequired,
      type: 'warning',
      icon: '⚠️',
      target: '#resistance-controls',
    }, AI_GUIDE_AUDIO.resistanceRequired)

    return
  }

  if (powerOn && currentCase !== 'il') {
    showAlertWithOptionalAudio({
      title: 'Turn OFF the Power Supply',
      description:
        'Switch OFF the power supply before checking circuit connections.',
      type: 'warning',
      icon: '⚠️',
      target: '#power-supply',
    })

    return
  }

  setConnectionsVerified(false)
  setConnectionsLocked(false)

  if (currentCase !== 'rn') {
    playAiGuideAudio(
      currentCase === 'il'
        ? AI_GUIDE_AUDIO.checkThirdCase
        : AI_GUIDE_AUDIO.checkCaseTwoOrThree,
    )
  }

  setCheckRequest(
    (current) => current + 1,
  )

  setStatus(
    'Checking Norton circuit connections...',
  )
}
  const handleToggleCurrentSource = () => {
  if (!currentSourceOn && !connectionsVerified) {
    setStatus('Check the circuit connections before switching on the current source.')
    /*showAlertWithOptionalAudio(
  {
    title: 'Cannot Start Power - Complete Connections First',
    description: 'Run CHECK and correct the circuit wiring before powering the supply.',
    type: 'warning',
    icon: '⚠️',
  },
  'Please check the connections first.'
)*/
    return
  }

  if (!currentSourceOn && powerOn && (!observations.voltageSourceOnly || !observations.currentSourceOnly)) {
    /*showAlertWithOptionalAudio({
      title: 'Wrong Source Combination',
      description: 'Both sources should be switched ON only after completing individual source cases.',
      type: 'warning',
    })*/
    return
  }

  if (currentSourceOn) {
  setCurrentSourceOn(false)
  //setCurrent(0)

  /*if (observations.currentSourceOnly && !observations.voltageSourceOnly) {
    setInstructionStep('case2-connections')
  }*/

  setStatus('Current source switched off.')
  return
}

  setCurrentSourceOn(true)

if (isCase3InProgress) {
  if (lockedCurrent !== null) {
    setCurrent(lockedCurrent)
  }

  setInstructionStep('case3-turn-on-both')

  return
}

setInstructionStep('case1-set-current')

setStatus('Current source switched on. Adjust current and add the reading.')
//showStepAlert(EXPERIMENT_ALERTS.currentSourceOn)
}
   const handleTogglePower = () => {
  if (sourcesLocked) {
    return
  }

  if (currentCase === 'rn') {
    showStepAlert({
      title: 'Power Supply Must Remain OFF',
      description:
        'Norton resistance is measured with the voltage source deactivated.',
      type: 'warning',
      icon: '⚠️',
      target: '#power-supply',
    })

    return
  }

  if (!powerOn && !connectionsVerified) {
    showStepAlert({
      title: 'Check Connections First',
      description:
        'Verify the current case connections before switching ON the power supply.',
      type: 'warning',
      target: '#check-button',
    })

    return
  }

  const nextPowerOn = !powerOn

  setPowerOn(nextPowerOn)

  if (!nextPowerOn) {
    setStatus('Power supply switched OFF.')
    return
  }

  if (currentCase === 'isc') {
    setInstructionStep('isc-add-reading')

    setStatus(
      'Power supply switched ON. Set the voltage and click ADD to record Isc.',
    )
    setInstructionStep(
  'isc-remove-connection',
)

    if (
      Number(voltage) > 0 &&
      !iscReadingAlertShownRef.current
    ) {
      iscReadingAlertShownRef.current = true

      showAlertWithOptionalAudio(
        {
          title: 'Reading Displayed',
          description:
            NORTON_ALERT_MESSAGES.iscReadingDisplayed,
          type: 'success',
          target: '#ammeter-a',
        },
        AI_GUIDE_AUDIO.voltageReady,
      )
    }
  }

  if (currentCase === 'il') {
    setInstructionStep('il-add-reading')

    setStatus(
      'Power supply switched ON. Use the same voltage and click ADD to record IL.',
    )

    showAlertWithOptionalAudio(
      {
        title: 'Reading Displayed',
        description:
          NORTON_ALERT_MESSAGES.ilReadingDisplayed,
        type: 'success',
        target: '#ammeter-a',
      },
      AI_GUIDE_AUDIO.thirdCasePowerOn,
    )
  }
}

const handleAutoConnectComplete = useCallback((result) => {
  if (!result?.isCorrect) {
    setConnectionsVerified(false)
    setConnectionsLocked(false)

    showAlertWithOptionalAudio({
      title: 'Auto Connect Failed',
      description:
        'The required connections could not be completed. Please try Auto Connect again.',
      type: 'error',
      target: '#circuit-panel',
    })

    return
  }

  setConnectionsVerified(true)
  setConnectionsLocked(true)

  if (result.caseKey === 'rn') {
    setInstructionStep('rn-add-reading')
    setStatus(
      'Case 1 auto-connect completed. The Norton resistance is displayed; click ADD.',
    )

    showAlertWithOptionalAudio(
      {
        title: 'Autoconnect completed',
        description: NORTON_ALERT_MESSAGES.rnAutoConnected,
        type: 'success',
        target: '#digital-multimeter',
      },
      AI_GUIDE_AUDIO.firstCaseAutoConnected,
    )

    return
  }

  if (result.caseKey === 'isc') {
    iscReadingAlertShownRef.current = false
    setInstructionStep('isc-power')
    setStatus(
      'Case 2 auto-connect completed. Turn ON the power supply and set the voltage.',
    )

    showAlertWithOptionalAudio(
      {
        title: 'Autoconnect completed',
        description: NORTON_ALERT_MESSAGES.iscAutoConnected,
        type: 'success',
        target: '#power-supply',
      },
      AI_GUIDE_AUDIO.secondCaseAutoConnected,
    )

    return
  }

  if (result.caseKey === 'il') {
    setInstructionStep('il-power')
    setStatus(
      'Case 3 auto-connect completed. Turn ON the power supply.',
    )

    showAlertWithOptionalAudio(
      {
        title: 'Autoconnect completed',
        description: NORTON_ALERT_MESSAGES.ilAutoConnected,
        type: 'success',
        target: '#power-supply',
      },
      AI_GUIDE_AUDIO.thirdCaseAutoConnected,
    )
  }
}, [showAlertWithOptionalAudio])

  const handleAutoConnect = () => {
  if (!resistanceSet) {
    showAlertWithOptionalAudio({
      title: 'Set Resistance Values',
      description:
        NORTON_ALERT_MESSAGES.resistanceRequired,
      type: 'warning',
      target: '#resistance-controls',
    }, AI_GUIDE_AUDIO.resistanceRequired)

    return
  }

  if (powerOn) {
    showAlertWithOptionalAudio({
      title: 'Turn OFF the Power Supply',
      description:
        'Switch OFF the power supply before automatically connecting the circuit.',
      type: 'warning',
      target: '#power-supply',
    })

    return
  }

  if (connectionsLocked) {
    showAlertWithOptionalAudio({
      title: 'Circuit Connections Locked',
      description:
        'Add the current case reading before changing the circuit connections.',
      type: 'warning',
      target: '#circuit-panel',
    })

    return
  }

  const instructionByCase = {
    rn: 'rn-check',
    isc: 'isc-check',
    il: 'il-check',
  }

  const descriptionByCase = {
    rn: 'Case 1 wiring for Norton resistance',
    isc: 'Case 2 wiring for short-circuit current',
    il: 'Case 3 wiring for load current',
  }

  setConnectionsVerified(false)
  setConnectionsLocked(false)
  clearManualConnectionGuide()
  stopAiGuideAudio('auto-connect-started')
  setInstructionStep(
    instructionByCase[currentCase],
  )
  setStatus(
    `${descriptionByCase[currentCase]} is being connected. Click CHECK when it is ready.`,
  )

  setAutoConnectRequest((request) => ({
    id: request.id + 1,
    caseKey: currentCase,
  }))

}

  const handleVoltageChange = useCallback((nextVoltage) => {
    setVoltage(nextVoltage)

    if (!powerOn || nextVoltage <= 0) {
      if (nextVoltage < VOLTAGE_SAFETY_RESET) {
        voltageLimitWarningShownRef.current = false
      }

      return
    }

    if (
      currentCase === 'isc' &&
      connectionsVerified &&
      !iscReadingAlertShownRef.current
    ) {
      iscReadingAlertShownRef.current = true

      showAlertWithOptionalAudio(
        {
          title: 'Reading Displayed',
          description:
            NORTON_ALERT_MESSAGES.iscReadingDisplayed,
          type: 'success',
          target: '#ammeter-a',
        },
        AI_GUIDE_AUDIO.voltageReady,
      )
    }

    /*if (nextVoltage >= VOLTAGE_SAFETY_LIMIT && !voltageLimitWarningShownRef.current) {
      voltageLimitWarningShownRef.current = true
      showStepAlert(EXPERIMENT_ALERTS.voltageSafetyLimit, {
        description: `${nextVoltage.toFixed(1)} V is close to the 10 V supply limit.`,
      })
      return
    }*/

    if (nextVoltage < VOLTAGE_SAFETY_RESET) {
      voltageLimitWarningShownRef.current = false
    }
  }, [
    connectionsVerified,
    currentCase,
    powerOn,
    showAlertWithOptionalAudio,
  ])

  const handleVoltageCommit = useCallback((nextVoltage) => {
    const numericVoltage = Number(nextVoltage)

    if (
      !powerOn ||
      lockedVoltage !== null ||
      !Number.isFinite(numericVoltage) ||
      numericVoltage <= 0
    ) {
      return
    }

    setLockedVoltage(
      Number(numericVoltage.toFixed(1)),
    )
  }, [
    lockedVoltage,
    powerOn,
  ])

  return (
    <div id="app-wrapper">
      <div
        id="app-viewport"
        style={{
          height: `${scaledHeight}px`,
          width: `${scaledWidth}px`,
        }}
      >
        <div
          id="app-scale"
          ref={appScaleRef}
          style={{
            transform: `scale(${scale})`,
          }}
        >
          <main className="simulation-shell" id="walkthrough-demo-experiment">
            <HeaderBoard />
            <div>
  <WalkthroughStartButton
  variant="side-tab"
  onStart={() => {
    stopAiGuideAudio('walkthrough-start-click')
  }}
/>
</div>
            {/* <StatusBar status={status} /> */}
            <span className="sr-only" role="status" aria-live="polite">{status}</span>

            <section className="workspace-grid">
              <aside className="left-panel">
  <ActionButtons
  instructionStep={instructionStep}
  disabledButtons={{
  onAutoConnect:
    powerOn ||
    connectionsLocked ||
    readingCount >= 3,
  
  onCheck:
    powerOn && currentCase !== 'il',

  onAdd:
    !canAddReading,

  onCalculate:
    readingCount < 3,

  onPrint:
    !calculationsVerified,

  onReset: false,
}}
                  onAdd={recordObservation}
                  onCheck={handleCheck}
                  onCalculate={handleCalculate}
                  onPlot={handlePlot}
                  onPrint={handlePrint}
                  onReset={handleReset}
                  onAutoConnect={handleAutoConnect}
                  onAiGuide={handleAiGuide}
                />

                <ControlPanel
                  locked={
  resistanceSet || powerOn || currentSourceOn
}
                  observations={observations}
                  r1={r1}
                  r2={r2}
                  r3={r3}
                  rl={rl}
                  setR1={setR1}
                  setR2={setR2}
                  setR3={setR3}
                  setRl={setRl}
                  onResistanceCommit={handleResistanceCommit}
                />
              </aside>

              <section className="right-panel">
<ConnectionLab
  autoConnectRequest={autoConnectRequest}
  checkRequest={checkRequest}
  onAutoConnectComplete={handleAutoConnectComplete}
  onCheckConnections={handleCheckConnections}

  powerOn={powerOn}
  connectionsVerified={connectionsVerified}
  connectionsLocked={
    connectionsLocked
  }
  observations={observations}
  experimentStage={experimentStage}

  multimeterMode={multimeterMode}
  setMultimeterMode={setMultimeterMode}

  r1={r1}
  r2={r2}
  r3={r3}
  rl={rl}

  readings={readings}

  resetRequest={resetRequest}
  scale={scale}

  onTogglePower={handleTogglePower}
  setVoltage={handleVoltageChange}
  onVoltageCommit={handleVoltageCommit}
  voltage={voltage}

  lockedVoltage={Boolean(lockedVoltage)}

  onConnectionChange={
    handleConnectionChange
  }
  onConnectionAdded={
    handleConnectionAdded
  }
  onConnectionDetached={
    handleConnectionDetached
  }

  sourcesLocked={sourcesLocked}
  activeGuideTerminals={
    activeGuideTerminals
  }
  lockedConnections={
    lockedConnections
  }
/>
              </section>
            </section>
            <ReportControls
  onGenerateReport={handleGenerateReport}
  readingCount={readingCount}
  reportGenerated={reportGenerated}
  calculationsVerified={calculationsVerified}
/>
<button
  id="equations-button"
  className="formula-button"
  type="button"
  onClick={() => setShowFormulaPanel(true)}
>
  Equations
</button>
{showFormulaPanel && (
  <div
    aria-labelledby="equations-panel-title"
    aria-modal="true"
    className="formula-panel"
    role="dialog"
  >
    <div className="formula-panel__header">
      <h3 id="equations-panel-title">Norton Theorem Equations</h3>

      <button
        aria-label="Close equations panel"
        className="formula-panel__close"
        type="button"
        onClick={() => setShowFormulaPanel(false)}
      >
        &times;
      </button>
    </div>

    <div className="formula-panel__body">
      <h4>Norton Resistance (R<sub>N</sub>)</h4>

      <p>
        <strong>Norton resistance (R<sub>N</sub>)</strong> is the equivalent
        resistance of a linear electrical network as seen from the load
        terminals after removing the load resistance and deactivating all
        independent sources. It represents the internal resistance of the
        circuit in its Norton equivalent.
      </p>

      <h4>Steps to Calculate R<sub>N</sub></h4>

      <ol className="formula-list">
        <li>Remove the load resistance (R<sub>L</sub>).</li>
        <li>
          Replace all independent voltage sources with short circuits and all
          independent current sources with open circuits.
        </li>
        <li>
          Calculate the equivalent resistance seen from the load terminals.
          This equivalent resistance is the Norton resistance (R<sub>N</sub>).
        </li>
      </ol>

      <div className="formula-box">
        R<sub>N</sub> = R<sub>3</sub> + (R<sub>1</sub> || R<sub>2</sub>)
        {' = '}
        R<sub>3</sub> + (R<sub>1</sub> &times; R<sub>2</sub>) /
        (R<sub>1</sub> + R<sub>2</sub>)
      </div>

      <h4>Norton Current (I<sub>N</sub>)</h4>

      <p>
        <strong>Norton current (I<sub>N</sub>)</strong> is the short-circuit
        current flowing between the load terminals when the load resistance
        (R<sub>L</sub>) is removed.
      </p>

      <h4>Steps to Calculate I<sub>N</sub></h4>

      <ol className="formula-list">
        <li>Remove the load resistance (R<sub>L</sub>).</li>
        <li>Short-circuit the load terminals.</li>
        <li>Keep all independent sources active.</li>
        <li>
          Calculate the current flowing through the short-circuit. This current
          is the Norton current (I<sub>N</sub>).
        </li>
      </ol>

      <div className="formula-box">
        I<sub>N</sub> = (V &times; R<sub>2</sub>) /
        (R<sub>1</sub> &times; R<sub>2</sub> + R<sub>1</sub> &times;
        R<sub>3</sub> + R<sub>2</sub> &times; R<sub>3</sub>)
      </div>

      <h4>Load Current (I<sub>L</sub>)</h4>

      <p>
        <strong>Load current (I<sub>L</sub>)</strong> is the current flowing
        through the load resistor when it is connected to the Norton equivalent
        circuit.
      </p>

      <div className="formula-box">
        I<sub>L</sub> = I<sub>N</sub> &times; R<sub>N</sub> /
        (R<sub>N</sub> + R<sub>L</sub>)
      </div>

      <p className="formula-note">
        Here, V is the independent voltage source used in this experiment, and
        || denotes a parallel combination.
      </p>
    </div>
  </div>
)}

          </main>
          <CalculationPanel
  observations={observations}
  resistanceValues={{
    r1,
    r2,
    r3,
    rl,
  }}
  voltageValue={
    observations.voltage ??
    lockedExperimentVoltage ??
    voltage
  }
  autoFillTrigger={autoFillTrigger}
  calculationResetTrigger={
    calculationResetTrigger
  }
  setInstructionStep={
    setInstructionStep
  }
  onPlayAiGuideAudio={
    playAiGuideAudio
  }
  onShowAlertWithAudio={
    showAlertWithOptionalAudio
  }
  aiGuideAudio={AI_GUIDE_AUDIO}
  onVerificationComplete={(rows) => {
    setCalculationVerificationRows(rows)

    setCalculationsVerified(
      rows.every(
        (row) => row.verified,
      ),
    )
  }}
/>

          {/* <GraphPanel
            className="graph-panel--separate"
            id="graph-panel"
            observations={observations}
            plotted={graphGenerated}
          /> */}
        </div>
      </div>
    </div>
  )
}

export default App
