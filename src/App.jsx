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
import { generateSuperpositionReport } from './utils/reportGenerator.js'
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
  case1Verified:
    '/ai-guide-audio/After 1st case connections, check Connections Verified.wav',

  case2Verified:
    '/ai-guide-audio/After 2nd case connections, check.wav',

  bothSourcesOn:
    '/ai-guide-audio/After both sources are ON, Add button.wav',

  afterCalculate:
    '/ai-guide-audio/After clicking the calculate button.wav',

  afterReadingCase1:
    '/ai-guide-audio/After reading is added for the first case.wav',

  afterReadingCase2:
    '/ai-guide-audio/After reading is added for the second case.wav',

  afterReadingCase3:
    '/ai-guide-audio/After reading is added for the third case.wav',

  afterResistanceSet:
    '/ai-guide-audio/After resistance is set, check button.wav',

  afterAboveStep:
    '/ai-guide-audio/After the above step.wav',

  currentValueSet:
    '/ai-guide-audio/After the current value is set.wav',

  voltageValueSet:
    '/ai-guide-audio/After the voltage value is set.wav',

  autoConnect:
    '/ai-guide-audio/Autoconnect.wav',

  beforeAdd:
    '/ai-guide-audio/Before adding reading, 1st time Add button.wav',

  beforeResistance:
    '/ai-guide-audio/Before resistance set, check & auto connect button.wav',

  voltageSourceWarning:
    '/ai-guide-audio/During the 1st case Voltage source Complete Current Source Case First.wav',

  report:
    '/ai-guide-audio/Generate Report.wav',

  case3Verified:
    '/ai-guide-audio/Now check again for the 3rd case.wav',

  print:
    '/ai-guide-audio/Print.wav',

  reset:
    '/ai-guide-audio/Reset.wav',
    aiGuideClick: '/ai-guide-audio/AI Guide click.wav',
walkthroughComplete: '/ai-guide-audio/The simulation walkthrough is now complete.wav',
chooseAutoOrManual: '/ai-guide-audio/Now, you may either click the Auto Connect button.wav',

connect5To13: '/ai-guide-audio/Connect terminal 5 to terminal 13.wav',
connect6To14: '/ai-guide-audio/Connect terminal 6 to terminal 14..wav',
connect7To15: '/ai-guide-audio/Connect terminal 7 to terminal 15.wav',
connect8To16: '/ai-guide-audio/Last connect terminal 8 to terminal 16..wav',
short17To18: '/ai-guide-audio/now short terminal voltage to 17 to 18.wav',
allConnectionsComplete: '/ai-guide-audio/Guide all complete conn for case 1.wav',
allConnectionsComplete2: '/ai-guide-audio/Guide all complete conn for case 2.wav',
allConnectionsComplete3: '/ai-guide-audio/Guide all complete conn for case 3.wav',
connect17To19:"/ai-guide-audio/After the above steppart1.wav",
connect18To20:"/ai-guide-audio/After the above step part 2.wav",
wrongConnection: '/ai-guide-audio/Wrong connection.wav',
multipleWrongConnections: '/ai-guide-audio/Multiple wrong connections.wav',

verifyCorrect: '/ai-guide-audio/Verify button click, correct calculations.wav',
verifyIncorrect: '/ai-guide-audio/Verify button click, Incorrect calculations.wav',

beforeCase3Check: '/ai-guide-audio/Before clicking the Check button for Case 3 connections.wav',
correctConnection1To9: '/ai-guide-audio/Correct Connections.wav',
connect2To10: "/ai-guide-audio/Connect terminal 2 to terminal 10.wav",
connect3To11: "/ai-guide-audio/Next, connect the ammeter's terminal 3 to terminal 11..wav",

connect4To12: "/ai-guide-audio/Connect terminal 4 to terminal 12..wav",

beforeCheckingCurrentSource: '/ai-guide-audio/Before checking, Current Source.wav',

beforeCheckingVoltageSource:
'/ai-guide-audio/During the 2nd case, Voltage source.wav',
}
const AI_GUIDE_AUDIO_OWNER = 'ai-guide'
 const AI_GUIDE_CONNECTION_STEPS = {
  case1: [
    {
      key: 'case1-1-9',
      terminals: ['1-endpoint', '9-endpoint'],
      text: "Let's start with case-1 connection",
      audio: AI_GUIDE_AUDIO.correctConnection1To9,
    },
    {
      key: 'case1-2-10',
      terminals: ['2-endpoint', '10-endpoint'],
      //text: 'Connect terminal 2 to terminal 10.',
      audio: AI_GUIDE_AUDIO.connect2To10,
    },
    {
      key: 'case1-17-18',
      terminals: ['17-endpoint', '18-endpoint'],
      //text: 'Short voltage source terminals 17 to 18.',
      audio: AI_GUIDE_AUDIO.short17To18,
    },
    {
      key: 'case1-3-11',
      terminals: ['3-endpoint', '11-endpoint'],
      //text: 'Connect terminal 3 to terminal 11.',
      audio: AI_GUIDE_AUDIO.connect3To11,
    },
    {
      key: 'case1-4-12',
      terminals: ['4-endpoint', '12-endpoint'],
      //text: 'Connect terminal 4 to terminal 12.',
      audio: AI_GUIDE_AUDIO.connect4To12,
    },
    {
      key: 'case1-5-13',
      terminals: ['5-endpoint', '13-endpoint'],
      //text: 'Connect terminal 5 to terminal 13.',
      audio: AI_GUIDE_AUDIO.connect5To13,
    },
    {
      key: 'case1-6-14',
      terminals: ['6-endpoint', '14-endpoint'],
      //text: 'Connect terminal 6 to terminal 14.',
      audio: AI_GUIDE_AUDIO.connect6To14,
    },
    {
      key: 'case1-7-15',
      terminals: ['7-endpoint', '15-endpoint'],
      //text: 'Connect terminal 7 to terminal 15.',
      audio: AI_GUIDE_AUDIO.connect7To15,
    },
    {
      key: 'case1-8-16',
      terminals: ['8-endpoint', '16-endpoint'],
      //text: 'Connect terminal 8 to terminal 16.',
     audio: AI_GUIDE_AUDIO.connect8To16,
    },
  ],

  case2: [
    {
      key: 'case2-17-19',
      terminals: ['17-endpoint', '19-endpoint'],
      text: "Let's start with case-2 connection",
      audio: AI_GUIDE_AUDIO.connect17To19,
    },
    {
      key: 'case2-18-20',
      terminals: ['18-endpoint', '20-endpoint'],
      //text: 'Connect terminal 18 to terminal 20.',
      audio: AI_GUIDE_AUDIO.connect18To20,
    },
  ],

  case3: [
    {
      key: 'case3-1-9',
      terminals: ['1-endpoint', '9-endpoint'],
      text: "Let's start with case-3 connection",
      audio: AI_GUIDE_AUDIO.correctConnection1To9,
    },
    {
      key: 'case3-2-10',
      terminals: ['2-endpoint', '10-endpoint'],
      //text: 'Connect terminal 2 to terminal 10.',
      audio: AI_GUIDE_AUDIO.connect2To10,
    },
    /*{
      key: 'case3-17-19',
      terminals: ['17-endpoint', '19-endpoint'],
      text: 'Keep voltage source connected from terminal 17 to terminal 19.',
      audio: null,
    },
    {
      key: 'case3-18-20',
      terminals: ['18-endpoint', '20-endpoint'],
      text: 'Keep voltage source connected from terminal 18 to terminal 20.',
      audio: null,
    },*/
  ],
}
const BASE_WIDTH = 1440
const BASE_HEIGHT = 960
const GRAPH_SECTION_GAP = 28
const GRAPH_SECTION_HEIGHT = 1100
const CONTENT_HEIGHT = BASE_HEIGHT + GRAPH_SECTION_GAP + GRAPH_SECTION_HEIGHT
const PANEL_MAX_SCALE = 0.78
const PANEL_VIEWPORT_MARGIN = 10
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

const getScale = () => {
  if (typeof window === 'undefined') {
    return 1
  }

  const availableWidth = window.innerWidth - PANEL_VIEWPORT_MARGIN
  const availableHeight = window.innerHeight - PANEL_VIEWPORT_MARGIN

  const widthScale = availableWidth / BASE_WIDTH
  const heightScale = availableHeight / BASE_HEIGHT

  return Math.max(
    Math.min(widthScale, heightScale, PANEL_MAX_SCALE),
    0.1
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
  const [r1, setR1] = useState(1)
  const [r2, setR2] = useState(1)
  const [r3, setR3] = useState(1)
  const [rl, setRl] = useState(10)
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
const [activeGuideTerminals, setActiveGuideTerminals] = useState([])
const [manualGuideCase, setManualGuideCase] = useState(null)
const [manualGuideIndex, setManualGuideIndex] = useState(0)
const manualGuideCaseRef = useRef(null)
const manualGuideIndexRef = useRef(0)
const autoConnectingRef = useRef(false)
const autoConnectReleaseTimerRef = useRef(null)
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

  const [autoConnectRequest, setAutoConnectRequest] = useState(0)
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
  /*useEffect(() => {
  const handleComplete = () => {
    if (!aiGuideEnabled) return

    playAiGuideAudio(AI_GUIDE_AUDIO.walkthroughComplete, true, () => {
      playAiGuideAudio(AI_GUIDE_AUDIO.chooseAutoOrManual, true, () => {
        startManualConnectionGuide('case1')
      })
    })
  }

  window.addEventListener('walkthrough-complete', handleComplete)
  return () => window.removeEventListener('walkthrough-complete', handleComplete)
}, [aiGuideEnabled, playAiGuideAudio])*/

 const handleResistanceChange = (
  key,
  setter,
  value,
) => {
  setter(value)

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
const getCurrentManualGuideStep = () => {
  const caseKey = manualGuideCaseRef.current
  const index = manualGuideIndexRef.current

  if (!caseKey) return null

  return AI_GUIDE_CONNECTION_STEPS[caseKey]?.[index] ?? null
}
const startManualConnectionGuide = (caseKey) => {
  stopAiGuideAudio()
  const firstStep = AI_GUIDE_CONNECTION_STEPS[caseKey]?.[0]

  if (!firstStep) return

  setManualGuideCase(caseKey)
  setManualGuideIndex(0)
  manualGuideCaseRef.current = caseKey
manualGuideIndexRef.current = 0
  setActiveGuideTerminals(firstStep.terminals)

  showAlertWithOptionalAudio(
    {
      title: 'AI Guide Connection Step',
      description: firstStep.text,
      type: 'info',
      icon: '🤖',
    },
    firstStep.audio
  )
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
    setActiveGuideTerminals([])
    setManualGuideCase(null)
    setManualGuideIndex(0)
    manualGuideCaseRef.current = null
    manualGuideIndexRef.current = 0

    /*showAlertWithOptionalAudio({
      title: 'Connections Completed',
      description: 'Required manual connections are completed. Click CHECK to verify the connections.',
      type: 'success',
      icon: '✅',
    }, null)*/
    if (caseKey === 'case1') {
  playAiGuideAudio(AI_GUIDE_AUDIO.allConnectionsComplete)
} else if (caseKey === 'case2') {
  playAiGuideAudio(AI_GUIDE_AUDIO.allConnectionsComplete2)
} else if (caseKey === 'case3') {
  playAiGuideAudio(AI_GUIDE_AUDIO.allConnectionsComplete3)
}
    return
  }

  manualGuideIndexRef.current = nextIndex
  setManualGuideIndex(nextIndex)
  setActiveGuideTerminals([...nextStep.terminals])

  playAiGuideAudio(nextStep.audio)

  /*showAlertWithOptionalAudio({
    title: 'Next Connection',
    description: nextStep.text,
    type: 'info',
    icon: '🤖',
  }, nextStep.audio)*/
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

const playAiGuideAudioAndWait = useCallback(
  (audioPath, force = false) => (
    new Promise((resolve) => {
      let settled = false

      const finish = () => {
        if (settled) return

        settled = true
        resolve()
      }

      playAiGuideAudio(
        audioPath,
        force,
        finish,
        finish,
      )
    })
  ),
  [playAiGuideAudio],
)



const playGuideAudio = useCallback((key, audioPath) => {
  if (!aiGuideEnabled || !audioPath) return

  if (lastGuideMessageRef.current === key) return
  lastGuideMessageRef.current = key

  playAiGuideAudio(audioPath)
}, [aiGuideEnabled, playAiGuideAudio])
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
useEffect(() => {
  return () => {
    window.clearTimeout(
      autoConnectReleaseTimerRef.current,
    )
  }
}, [])
const showGuideAlert = useCallback((key, audioPath) => {
  if (!aiGuideEnabled || !audioPath) return

  if (lastGuideMessageRef.current === key) return
  lastGuideMessageRef.current = key

  playAiGuideAudio(audioPath)
}, [aiGuideEnabled, playAiGuideAudio])
const showAlertWithOptionalAudio = useCallback(
(alert,audioPath)=>{

showStepAlert({
...alert,
target:null,
})

if(audioPath){
playAiGuideAudio(audioPath)
}

},
[showStepAlert,playAiGuideAudio]
)

/*useEffect(() => {
  if (!aiGuideEnabled) return
  if (aiGuideJustEnabledRef.current) return
  if (lastInstructionAudioRef.current === instructionStep) return

  const message = AI_GUIDE_STEP_MESSAGES[instructionStep]
  if (!message) return

// Don't speak automatically if we are already playing
if (aiGuideAudioRef.current && !aiGuideAudioRef.current.paused) {
  return
}

speakGuideMessage(message)
}, [instructionStep, aiGuideEnabled])*/
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
  connectionsVerified &&
  connectionsLocked &&
  (
    currentCase === 'rn'
      ? !powerOn
      : powerOn &&
        Number(voltage) > 0
  )

  const recordObservation = () => {
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

    setInstructionStep(
      'rn-remove-connections',
    )

    setStatus(
      'RN reading saved. Remove connections 7–8, 3–9 and 4–11.',
    )

    showAlertWithOptionalAudio({
      title: 'Norton Resistance Added',
      description:
        'RN has been recorded. Remove connections 7–8, 3–9 and 4–11 without resetting the experiment.',
      type: 'success',
      icon: '✅',
      target: '#observation-table-panel',
    })

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

    setInstructionStep(
      'isc-remove-connection',
    )

    setStatus(
      'Isc reading saved. Remove only connection 2–11.',
    )

    showAlertWithOptionalAudio({
      title: 'Short-Circuit Current Added',
      description:
        'Isc has been recorded. Remove only connection 2–11 before making the load-current connections.',
      type: 'success',
      icon: '✅',
      target: '#observation-table-panel',
    })

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
          `Set the supply to ${Number(
            lockedExperimentVoltage,
          ).toFixed(1)} V, the same voltage used while measuring Isc.`,
        type: 'warning',
        icon: '⚠️',
        target: '#voltage-control',
      })

      return
    }

    setObservations((currentObservations) => ({
      ...currentObservations,

      loadCurrent:
        readings.loadCurrent,

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

    showAlertWithOptionalAudio({
      title: 'Load Current Added',
      description:
        'IL has been recorded successfully. Click CALCULATE to continue.',
      type: 'success',
      icon: '✅',
      target: '#calculate-button',
    })
  }
}

  const resetSimulation = useCallback(() => {
  setInstructionStep('reset')

  autoConnectingRef.current = false

  window.clearTimeout(
    autoConnectReleaseTimerRef.current,
  )

  window.clearTimeout(
    resistanceGuideTimerRef.current,
  )

  stopAiGuideAudio(
    'simulation-reset',
  )

  setAiGuideEnabled(false)
  window.speechSynthesis?.cancel()

  aiGuideJustEnabledRef.current = false
  lastGuideMessageRef.current = ''

  setPowerOn(false)
  setVoltage(0)

  setR1(1)
  setR2(1)
  setR3(1)
  setRl(100)

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

  setAutoConnectRequest(0)
  setCheckRequest(0)
  setConnectionsVerified(false)

  setResetRequest(
    (current) => current + 1,
  )

  setSessionStart(Date.now())

  touchedResistorsRef.current.clear()

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
        'The simulation has been reset. You can start again.',
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
playGuideAudio(
  'print-guide',
  AI_GUIDE_AUDIO.print
)
  window.print()
}
const handleCalculate = () => {
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
        title: 'Calculation Panel Updated',
        description:
          'The observed branch currents are displayed in the Calculation Panel. Calculate the branch currents manually using the Superposition Theorem, enter the calculated values in the input fields, and click the Verify button to verify the theorem.',
        type: 'info',
        icon: 'ℹ️',
        dedupeKey: `calculate-alert-${Date.now()}`,
      },
      AI_GUIDE_AUDIO.afterCalculate
    )
  }, 300)
}
const handleAiGuide = useCallback(() => {
  if (aiGuideEnabled) {
    stopAiGuideAudio('guide-disabled')
    window.speechSynthesis?.cancel()

    setAiGuideEnabled(false)
    setHighlightWalkthrough(false)
    setActiveGuideTerminals([])
    setManualGuideCase(null)
    setManualGuideIndex(0)

    manualGuideCaseRef.current = null
    manualGuideIndexRef.current = 0

    lastGuideMessageRef.current = ''
    lastInstructionAudioRef.current = ''
    currentAudioPathRef.current = ''
    aiGuideJustEnabledRef.current = false

    return
  }

  setAiGuideEnabled(true)

  lastGuideMessageRef.current = ''
  lastInstructionAudioRef.current = ''
  aiGuideJustEnabledRef.current = true

  // force=true because state update async hai.
  playAiGuideAudio(
    AI_GUIDE_AUDIO.aiGuideClick,
    true,
  )

  window.setTimeout(() => {
    aiGuideJustEnabledRef.current = false
  }, 1200)
}, [
  aiGuideEnabled,
  playAiGuideAudio,
  stopAiGuideAudio,
])
const handleWalkthroughComplete = () => {
  if (!aiGuideEnabled) return

  stopAiGuideAudio()

  playAiGuideAudio(
    AI_GUIDE_AUDIO.walkthroughComplete,
    true
  )
}
  const handleGenerateReport = async () => {
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

  const reportObservations = [
    { caseName: 'Current Source Only', ...observations.currentSourceOnly },
    { caseName: 'Voltage Source Only', ...observations.voltageSourceOnly },
    { caseName: 'Both Sources Active', ...observations.bothSources },
  ]

  if (aiGuideEnabled) {
  await playAiGuideAudioAndWait(
    AI_GUIDE_AUDIO.report,
    true,
  )
}
  const confirmed = await confirmAlert({
    title: 'Report Generated Successfully',
    description:
      'Your report has been generated successfully. Click OK to view your report.',
    type: 'success',
    icon: '📄',
  })

  if (confirmed === false) return

  const generated = generateSuperpositionReport({
  observations: reportObservations,
  resistances: { r1, r2, r3 },
  sessionStart,
  verificationRows: calculationVerificationRows,
})

  if (!generated) {
    setStatus('Unable to open the report window.')
    window.alert('Unable to open the report window. Please allow pop-ups and try again.')
    return
  }

  setReportGenerated(true)
  setStatus('Superposition theorem report generated successfully.')
}

  const scaledWidth = Math.ceil(BASE_WIDTH * scale)
  const scaledHeight = Math.ceil(CONTENT_HEIGHT * scale)
  const handleConnectionChange = (connectionCount) => {
  setConnectionsVerified(false)

  if (autoConnectingRef.current) {
    return
  }

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

      const description =
        buildConnectionAlertDescription(
          actualConnections,
          requiredConnections,
        )

      showAlertWithOptionalAudio({
        title: 'Invalid Connections',
        description:
          description ||
          'One or more connections are incorrect or missing.',
        type: 'error',
        icon: '❌',
        target: '#circuit-panel',
      })

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

      showAlertWithOptionalAudio({
        title: 'Right Connections',
        description:
          'The connections for measuring Norton resistance are correct. Keep the power supply OFF and click ADD.',
        type: 'success',
        icon: '✅',
        target: '#check-button',
      })

      return
    }

    if (result.caseKey === 'isc') {
      setInstructionStep(
        'isc-power',
      )

      setStatus(
        'Isc connections verified. Turn ON the power supply and set the voltage.',
      )

      showAlertWithOptionalAudio({
        title: 'Right Connections',
        description:
          'The short-circuit current connections are correct. Turn ON the power supply and set the voltage.',
        type: 'success',
        icon: '✅',
        target: '#check-button',
      })

      return
    }

    if (result.caseKey === 'il') {
      setInstructionStep(
        'il-power',
      )

      setStatus(
        'IL connections verified. Turn ON the power supply and use the same voltage.',
      )

      showAlertWithOptionalAudio({
        title: 'Right Connections',
        description:
          'The load-current connections are correct. Turn ON the power supply and use the same voltage used for Isc.',
        type: 'success',
        icon: '✅',
        target: '#check-button',
      })
    }
  },
  [
    showAlertWithOptionalAudio,
  ],
)

  const handleCheck = () => {
  if (!resistanceSet) {
    showAlertWithOptionalAudio({
      title: 'Set Resistance Values First',
      description:
        'Set R1, R2, R3 and RL before checking the circuit.',
      type: 'warning',
      icon: '⚠️',
      target: '#resistance-controls',
    })

    return
  }

  if (powerOn) {
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
playAiGuideAudio(
AI_GUIDE_AUDIO.beforeCheckingCurrentSource,
true
)
    return
  }

  if (!currentSourceOn && powerOn && (!observations.voltageSourceOnly || !observations.currentSourceOnly)) {
    /*showAlertWithOptionalAudio({
      title: 'Wrong Source Combination',
      description: 'Both sources should be switched ON only after completing individual source cases.',
      type: 'warning',
    })*/
    playAiGuideAudio(
      AI_GUIDE_AUDIO.wrongSourceCombination,
      true
    )
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

  if (powerOn) {
    showGuideAlert(
  'both-sources-on',
  AI_GUIDE_AUDIO.bothSourcesOn
)
  }

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
  }

  if (currentCase === 'il') {
    setInstructionStep('il-add-reading')

    setStatus(
      'Power supply switched ON. Use the same voltage and click ADD to record IL.',
    )
  }
}

  const handleAutoConnect = () => {
  if (!resistanceSet) {
    showAlertWithOptionalAudio({
      title:
        'Set Resistance Values First',

      description:
        'Set R1, R2, R3 and RL before using Auto Connect.',

      type: 'warning',
      icon: '⚠️',
      target: '#resistance-controls',
    })

    return
  }

  if (powerOn) {
    showAlertWithOptionalAudio({
      title:
        'Turn OFF the Power Supply',

      description:
        'Switch OFF the power supply before automatically connecting the circuit.',

      type: 'warning',
      icon: '⚠️',
      target: '#power-supply',
    })

    return
  }

  if (connectionsLocked) {
    showAlertWithOptionalAudio({
      title:
        'Circuit Connections Locked',

      description:
        'Add the current case reading before changing the circuit connections.',

      type: 'warning',
      icon: '🔒',
      target: '#circuit-panel',
    })

    return
  }

  const caseKey =
    getNortonConnectionCase(
      observationsRef.current,
    )

  autoConnectingRef.current = true

  window.clearTimeout(
    autoConnectReleaseTimerRef.current,
  )

  setConnectionsVerified(false)
  setConnectionsLocked(false)

  /*
   * Instruction highlighting according
   * to the current Norton case.
   */
  if (caseKey === 'rn') {
    setInstructionStep(
      'rn-check',
    )

    setStatus(
      'Case 1 connections added automatically. Click CHECK to verify RN wiring.',
    )
    observations.nortonResistance !== null
observations.shortCircuitCurrent === null
  } else if (caseKey === 'isc') {
    setInstructionStep(
      'isc-check',
    )

    setStatus(
      'Case 2 connections added automatically. Click CHECK to verify Isc wiring.',
    )
  } else {
    setInstructionStep(
      'il-check',
    )

    setStatus(
      'Case 3 connections added automatically. Click CHECK to verify IL wiring.',
    )
    observations.nortonResistance !== null
observations.shortCircuitCurrent !== null
observations.loadCurrent === null
  }

  /*
   * This request triggers ConnectionLab's
   * case-wise Auto Connect effect.
   */
  setAutoConnectRequest(
    (current) => current + 1,
  )

  const caseDescription = {
    rn:
      'Case 1 wiring for Norton resistance has been completed automatically.',

    isc:
      'Case 2 wiring for short-circuit current has been completed automatically.',

    il:
      'Case 3 wiring for load current has been completed automatically.',
  }

  showAlertWithOptionalAudio(
    {
      dedupeKey:
        `norton-auto-connect-${caseKey}-${Date.now()}`,

      title:
        'Auto Connections Completed',

      description:
        `${caseDescription[caseKey]} Click CHECK to verify the connections.`,

      type: 'success',
      icon: '✅',
      target: '#circuit-panel',
    },

    AI_GUIDE_AUDIO.autoConnect,
  )

  autoConnectReleaseTimerRef.current =
    window.setTimeout(() => {
      autoConnectingRef.current =
        false
    }, 700)
}

  const handleVoltageChange = useCallback((nextVoltage) => {
    setVoltage(nextVoltage)

    if (!powerOn || nextVoltage <= 0) {
      if (nextVoltage < VOLTAGE_SAFETY_RESET) {
        voltageLimitWarningShownRef.current = false
      }

      return
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
  }, [powerOn, showStepAlert])

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
          style={{
            height: `${CONTENT_HEIGHT}px`,
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
    powerOn ||
    connectionsLocked,

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
  powerOn
  || currentSourceOn
  || (
    observations.currentSourceOnly !== null
    && observations.voltageSourceOnly !== null
    && observations.bothSources === null
  )
}
                  observations={observations}
                  r1={r1}
                  r2={r2}
                  r3={r3}
                  rl={rl}
                  setR1={(value) => handleResistanceChange('r1', setR1, value)}
setR2={(value) => handleResistanceChange('r2', setR2, value)}
setR3={(value) => handleResistanceChange('r3', setR3, value)}
                  setRl={(value) => handleResistanceChange('rl', setRl, value)}
                />
              </aside>

              <section className="right-panel">
                <ConnectionLab
  autoConnectRequest={autoConnectRequest}
  checkRequest={checkRequest}
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
  setVoltage={setVoltage}
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
  <div className="formula-panel">
    <div className="formula-panel__header">
      <h3>Equations Used</h3>

      <button
        className="formula-panel__close"
        type="button"
        onClick={() => setShowFormulaPanel(false)}
      >
        ×
      </button>
    </div>

    <div className="formula-panel__body">
  <h4>Reference Current Directions</h4>

  <p>The following reference directions are used throughout the experiment:</p>

  <ul className="formula-list">
    <li><strong>I₁:</strong> Left to right through R₁</li>
    <li><strong>I₂:</strong> Downward through R₂</li>
    <li><strong>I₃:</strong> Left to right through R₃</li>
  </ul>

  <p className="formula-note">
    A positive value indicates that the current flows in the assumed reference direction.
    A negative value indicates that the current flows opposite to the assumed direction.
  </p>

  <h4>Case 1: Current Source Active</h4>

  <p>
    When only the current source is active, the current divides between the
    R₂ and R₃ branches according to the current division rule.
  </p>

  <div className="formula-box">
    I₁(CS) = Is
  </div>

  <div className="formula-box">
    I₂(CS) = Is × R₃ / (R₂ + R₃)
  </div>

  <div className="formula-box">
    I₃(CS) = Is × R₂ / (R₂ + R₃)
  </div>

  <h4>Case 2: Voltage Source Active</h4>

  <p>
    When only the voltage source is active, the current through the R₂–R₃ path
    is obtained using Ohm's Law.
  </p>

  <div className="formula-box">
    I₁(VS) = 0
  </div>

  <div className="formula-box">
    I₂(VS) = V / (R₂ + R₃)
  </div>

  <div className="formula-box">
    I₃(VS) = − V / (R₂ + R₃)
  </div>

  <h4>Case 3: Both Sources Active</h4>

  <p>
    According to the Superposition Theorem, the total branch current is the
    algebraic sum of the currents produced by each independent source acting alone.
  </p>

  <div className="formula-box">
    I₁ = I₁(CS) + I₁(VS)
  </div>

  <div className="formula-box">
    I₂ = I₂(CS) + I₂(VS)
  </div>

  <div className="formula-box">
    I₃ = I₃(CS) + I₃(VS)
  </div>

  <p className="formula-note">
    If a branch current is opposite to the assumed reference direction,
    it appears as a negative quantity and is automatically subtracted during
    algebraic addition.
  </p>

  <h4>Verification of Superposition Theorem</h4>

  <p>
    The theorem is verified when the branch currents measured with both sources
    active are equal to the algebraic sum of the corresponding currents obtained
    from Case 1 and Case 2.
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
