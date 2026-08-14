import { useEffect, useMemo, useState } from 'react'
import SectionCard from './SectionCard.jsx'

const toFiniteNumber = (
  value,
  fallback = null,
) => {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return fallback
  }

  const number = Number(value)

  return Number.isFinite(number)
    ? number
    : fallback
}

const formatValue = (
  value,
  decimals,
  unit,
) => {
  const number =
    toFiniteNumber(value)

  if (number === null) {
    return `- ${unit}`
  }

  return `${number.toFixed(decimals)} ${unit}`
}

const sanitizeNumberInput = (value) => {
  let nextValue = String(value).replace(/[^\d.-]/g, '')

  nextValue = nextValue.replace(/(?!^)-/g, '')

  const [integerPart, ...decimalParts] =
    nextValue.split('.')

  const limitedInteger =
    integerPart.slice(0, 5)

  const limitedDecimal =
    decimalParts.join('').slice(0, 4)

  return decimalParts.length > 0
    ? `${limitedInteger}.${limitedDecimal}`
    : limitedInteger
}

const CalculationPanel = ({
  observations = {},
  resistanceValues = {},
  voltageValue = 0,
  autoFillTrigger,
  onVerificationComplete,
  calculationResetTrigger,
  setInstructionStep,
  onPlayAiGuideAudio,
  aiGuideAudio,
}) => {
  const [values, setValues] = useState({
    r1: '',
    r2: '',
    r3: '',
    rl: '',
    voltage: '',
    nortonCurrent: '',
    nortonResistance: '',
    observedLoadCurrent: '',
  })
  const [displayValues, setDisplayValues] =
  useState({
    r1: null,
    r2: null,
    r3: null,
    rl: null,

    voltage: null,
    nortonResistance: null,
    shortCircuitCurrent: null,
    observedLoadCurrent: null,
  })
  const [enteredLoadCurrent, setEnteredLoadCurrent] =
    useState('')

  const [verificationMessage, setVerificationMessage] =
    useState('')

  const [verificationStatus, setVerificationStatus] =
    useState('idle')

  const nortonCurrent =
    toFiniteNumber(
      observations.shortCircuitCurrent,
    )

  const nortonResistance =
    toFiniteNumber(
      observations.nortonResistance,
    )

  const loadResistance =
    toFiniteNumber(
      observations.loadResistance ??
      resistanceValues.rl,
    )

  const observedLoadCurrent =
    toFiniteNumber(
      observations.loadCurrent,
    )

  const calculatedLoadCurrent = useMemo(() => {
    const denominator =
      nortonResistance + loadResistance

    if (denominator <= 0) {
      return 0
    }

    return (
      nortonCurrent *
      (
        nortonResistance /
        denominator
      )
    )
  }, [
    nortonCurrent,
    nortonResistance,
    loadResistance,
  ])

  const isReady = (
    observations.nortonResistance !== null &&
    observations.shortCircuitCurrent !== null &&
    observations.loadCurrent !== null
  )

  useEffect(() => {
    setValues({
      r1: '',
      r2: '',
      r3: '',
      rl: '',
      voltage: '',
      nortonCurrent: '',
      nortonResistance: '',
      observedLoadCurrent: '',
    })

    setEnteredLoadCurrent('')
    setVerificationMessage('')
    setVerificationStatus('idle')
  }, [calculationResetTrigger])

  useEffect(() => {
  if (!autoFillTrigger) {
    return
  }

  setDisplayValues({
    r1: toFiniteNumber(
      resistanceValues?.r1,
    ),

    r2: toFiniteNumber(
      resistanceValues?.r2,
    ),

    r3: toFiniteNumber(
      resistanceValues?.r3,
    ),

    rl: toFiniteNumber(
      resistanceValues?.rl ??
        observations?.loadResistance,
    ),

    voltage: toFiniteNumber(
      observations?.voltage ??
        voltageValue,
    ),

    nortonResistance:
      toFiniteNumber(
        observations?.nortonResistance,
      ),

    shortCircuitCurrent:
      toFiniteNumber(
        observations?.shortCircuitCurrent,
      ),

    observedLoadCurrent:
      toFiniteNumber(
        observations?.loadCurrent,
      ),
  })

  setVerificationMessage('')
  setIsVerified(false)

  setInstructionStep?.(
    'calculation-manual',
  )
}, [
  autoFillTrigger,

  resistanceValues?.r1,
  resistanceValues?.r2,
  resistanceValues?.r3,
  resistanceValues?.rl,

  observations?.voltage,
  observations?.nortonResistance,
  observations?.shortCircuitCurrent,
  observations?.loadCurrent,
  observations?.loadResistance,

  voltageValue,
  setInstructionStep,
])
  const handleEnteredValueChange = (event) => {
    setEnteredLoadCurrent(
      sanitizeNumberInput(
        event.target.value,
      ),
    )

    setVerificationMessage('')
    setVerificationStatus('idle')

    setInstructionStep?.(
      'calculation-enter-value',
    )
  }

  const handleVerify = () => {
    const enteredValue =
      Number(enteredLoadCurrent)

    if (!Number.isFinite(enteredValue)) {
      setVerificationMessage(
        'Enter a valid calculated load-current value.',
      )

      setVerificationStatus('error')
      return
    }

    const measuredDifference =
      Math.abs(
        enteredValue -
        observedLoadCurrent,
      )

    const formulaDifference =
      Math.abs(
        enteredValue -
        calculatedLoadCurrent,
      )

    const tolerance = Math.max(
      0.02,
      Math.abs(observedLoadCurrent) * 0.05,
    )

    const verified =
      measuredDifference <= tolerance &&
      formulaDifference <= tolerance

    const verificationRows = [
      {
        label: 'I<sub>L</sub>',
        studentValue: enteredValue,
        measuredValue:
          observedLoadCurrent,
        calculatedValue:
          calculatedLoadCurrent,
        difference:
          measuredDifference,
        verified,
      },
    ]

    if (verified) {
      setVerificationMessage(
        "✓ Norton's Theorem verified successfully.",
      )

      setVerificationStatus('success')
      setInstructionStep?.('verified')

      onPlayAiGuideAudio?.(
        aiGuideAudio?.verifyCorrect,
      )
    } else {
      setVerificationMessage(
        '✗ Calculated load current does not match the observed value.',
      )

      setVerificationStatus('error')
      setInstructionStep?.(
        'calculation-enter-value',
      )

      onPlayAiGuideAudio?.(
        aiGuideAudio?.verifyIncorrect,
      )
    }

    onVerificationComplete?.(
      verificationRows,
    )
  }

  return (
  <SectionCard
    className="calculation-panel calculation-panel-card calculation-panel--norton"
    icon="calculation"
    id="calculation-panel"
    title="THEORETICAL CALCULATIONS"
  >
    <div className="norton-calculation">

      {/* RESISTANCE VALUES */}
      <div className="calc-top-row">
        <div className="values-card">
          <h3>Resistance Values</h3>

          <div className="values-inline-group">

            <div className="inline-input-item">
              <span className="inline-label">
                R<sub>1</sub>:
              </span>

              <div className="inline-display">
                {values.r1 || ''}
              </div>

              <span className="inline-unit">Ω</span>
            </div>

            <div className="inline-input-item">
              <span className="inline-label">
                R<sub>2</sub>:
              </span>

              <div className="inline-display">
                {values.r2 || ''}
              </div>

              <span className="inline-unit">Ω</span>
            </div>

            <div className="inline-input-item">
              <span className="inline-label">
                R<sub>3</sub>:
              </span>

              <div className="inline-display">
                {values.r3 || ''}
              </div>

              <span className="inline-unit">Ω</span>
            </div>

            <div className="inline-input-item">
              <span className="inline-label">
                R<sub>L</sub>:
              </span>

              <div className="inline-display">
                {values.rl || ''}
              </div>

              <span className="inline-unit">Ω</span>
            </div>

          </div>
        </div>
      </div>

      {/* VERIFICATION */}
      <section className="norton-verification-card">

        <div className="norton-verification-field">
          <label>
            Observed I<sub>L</sub>
          </label>

          <output>
            {formatValue(
              observedLoadCurrent,
              3,
            )}{' '}
            A
          </output>
        </div>

        <div className="norton-verification-field">
          <label htmlFor="calculated-load-current">
            Enter calculated I<sub>L</sub>
          </label>

          <div className="norton-calculation-input-wrap">
            <input
              id="calculated-load-current"
              className="norton-calculation-input"
              inputMode="decimal"
              value={enteredLoadCurrent}
              onChange={handleEnteredValueChange}
              disabled={!isReady}
            />

            <span>A</span>
          </div>
        </div>

        <button
          className="verify-button norton-verify-button"
          type="button"
          onClick={handleVerify}
          disabled={
            !isReady ||
            enteredLoadCurrent === ''
          }
        >
          Verify
        </button>

        {verificationMessage ? (
          <p
            className={`norton-verification-message norton-verification-message--${verificationStatus}`}
          >
            {verificationMessage}
          </p>
        ) : null}

      </section>

    </div>

    <div className="copyright-footer">
      © 2026 Virtual Lab | IIT Roorkee
    </div>
  </SectionCard>
)
}

export default CalculationPanel