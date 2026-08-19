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

const [nortonInputs, setNortonInputs] = useState({
  in: '',
  rn: '',
  rl: '',
})

  const [verificationMessage, setVerificationMessage] =
    useState('')

  const [verificationStatus, setVerificationStatus] =
    useState('idle')

    const calculationDone =
  Number(autoFillTrigger) > 0

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

const hasNortonInputs =
  nortonInputs.in.trim() !== '' &&
  nortonInputs.rn.trim() !== '' &&
  nortonInputs.rl.trim() !== ''

const enteredIn = Number(nortonInputs.in)
const enteredRn = Number(nortonInputs.rn)
const enteredRl = Number(nortonInputs.rl)

const calculatedLoadCurrent = useMemo(() => {
  const denominator =
    enteredRn + enteredRl

  if (
    !Number.isFinite(enteredIn) ||
    !Number.isFinite(enteredRn) ||
    !Number.isFinite(enteredRl) ||
    enteredIn < 0 ||
    enteredRn < 0 ||
    enteredRl < 0 ||
    denominator <= 0
  ) {
    return null
  }

  // Values are entered in mA and kΩ.
  // Required formula: IL = IN / (RN + RL)
  return enteredIn / denominator
}, [
  enteredIn,
  enteredRn,
  enteredRl,
])

const calculatedLoadCurrentDisplay =
  calculatedLoadCurrent === null
    ? ''
    : calculatedLoadCurrent.toFixed(3)

const isReady =
  calculationDone &&
  nortonResistance !== null &&
  nortonCurrent !== null &&
  observedLoadCurrent !== null

useEffect(() => {
  setNortonInputs({
    in: '',
    rn: '',
    rl: '',
  })

  setVerificationMessage('')
  setVerificationStatus('idle')
}, [calculationResetTrigger])


  const handleNortonInputChange = (
  parameter,
  value,
) => {
  setNortonInputs((current) => ({
    ...current,
    [parameter]: sanitizeNumberInput(value),
  }))

  setVerificationMessage('')
  setVerificationStatus('idle')

  setInstructionStep?.(
    'calculation-enter-value',
  )
}

const handleVerify = () => {

  if (!isReady) {
    return
  }

  if (!hasNortonInputs) {
    setVerificationMessage(
      'Please enter IN, RN and RL.',
    )

    setVerificationStatus('error')

    return
  }

  if (calculatedLoadCurrent === null) {
    setVerificationMessage(
      'Please enter valid Norton current and resistance values.',
    )

    setVerificationStatus('error')

    return
  }


  // Observed current from experiment is in A.
  // Convert it to mA for comparison.

  const observedLoadCurrentMA =
    observedLoadCurrent * 1000


  const difference =
    Math.abs(
      calculatedLoadCurrent -
      observedLoadCurrentMA,
    )


  const tolerance = Math.max(
    0.02,
    Math.abs(observedLoadCurrentMA) * 0.05,
  )


  const verified =
    difference <= tolerance


  const verificationRows = [
    {
      label: 'I<sub>L</sub>',

      studentValue:
        calculatedLoadCurrent,

      measuredValue:
        observedLoadCurrentMA,

      calculatedValue:
        calculatedLoadCurrent,

      difference,

      verified,
    },
  ]


  if (verified) {

    setVerificationMessage(
      "✓ Norton's Theorem verified successfully.",
    )

    setVerificationStatus('success')

    setInstructionStep?.(
      'verified',
    )

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
    className="calculation-panel calculation-panel-card calculation-panel--norton norton-calculation-panel"
    icon="calculation"
    id="calculation-panel"
    title="THEORETICAL CALCULATIONS"
  >

    <div className="norton-load-current-calculation">

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
          {calculationDone &&
          resistanceValues?.r1 !== undefined &&
          resistanceValues?.r1 !== null &&
          resistanceValues?.r1 !== ''
            ? resistanceValues.r1
            : ''}
        </div>

        <span className="inline-unit">
          kΩ
        </span>

      </div>


      <div className="inline-input-item">

        <span className="inline-label">
          R<sub>2</sub>:
        </span>

        <div className="inline-display">
          {calculationDone &&
          resistanceValues?.r2 !== undefined &&
          resistanceValues?.r2 !== null &&
          resistanceValues?.r2 !== ''
            ? resistanceValues.r2
            : ''}
        </div>

        <span className="inline-unit">
          kΩ
        </span>

      </div>


      <div className="inline-input-item">

        <span className="inline-label">
          R<sub>3</sub>:
        </span>

        <div className="inline-display">
          {calculationDone &&
          resistanceValues?.r3 !== undefined &&
          resistanceValues?.r3 !== null &&
          resistanceValues?.r3 !== ''
            ? resistanceValues.r3
            : ''}
        </div>

        <span className="inline-unit">
          kΩ
        </span>

      </div>


      <div className="inline-input-item">

        <span className="inline-label">
          R<sub>L</sub>:
        </span>

        <div className="inline-display">
          {calculationDone &&
          resistanceValues?.rl !== undefined &&
          resistanceValues?.rl !== null &&
          resistanceValues?.rl !== ''
            ? resistanceValues.rl
            : ''}
        </div>

        <span className="inline-unit">
          kΩ
        </span>

      </div>

    </div>

  </div>

</div>

      {/* OBSERVED LOAD CURRENT */}


{/* OBSERVED LOAD CURRENT */}

<div className="norton-observed-card">

  <div className="norton-observed-current-row">

    <span className="norton-load-current-heading">
      Observed Load Current (I<sub>L</sub>) =
    </span>

    <output
      className="norton-observed-current-value"
      aria-label="Observed load current in milliamperes"
    >
      {isReady && observedLoadCurrent !== null
        ? `${(
            observedLoadCurrent * 1000
          ).toFixed(3)} mA`
        : ''}
      
    </output>

  </div>

</div>


{/* CALCULATED LOAD CURRENT */}

<div className="norton-calculated-card">

  <div className="norton-calculated-current-section">

    <h3 className="norton-load-current-heading">
      Calculated Load Current (I<sub>L</sub>):
    </h3>


    <div
      className="norton-load-current-equation"
      aria-label="Norton load current equation"
    >

      {/* IL = */}

      <span className="norton-equation-lead">
        I<sub>L</sub> =
      </span>


      {/* FRACTION */}

      <div className="norton-equation-fraction">

        {/* NUMERATOR */}

        <label className="norton-equation-term norton-equation-numerator">

          
          <span>
            I<sub>N</sub>
          </span>

          <input
            className="norton-formula-input"
            aria-label="Enter Norton current"
            inputMode="decimal"
            placeholder="Enter Value"
            value={nortonInputs.in}
            disabled={!isReady}
            onChange={(event) =>
              handleNortonInputChange(
                'in',
                event.target.value,
              )
            }
          />

          <span className="norton-equation-input-unit">
            mA
          </span>

        </label>


        {/* DENOMINATOR */}

        <div className="norton-equation-denominator">

          <label className="norton-equation-term">

            <span>
              R<sub>N</sub>
            </span>

            <input
              className="norton-formula-input"
              aria-label="Enter Norton resistance"
              inputMode="decimal"
              placeholder="Enter Value"
              value={nortonInputs.rn}
              disabled={!isReady}
              onChange={(event) =>
                handleNortonInputChange(
                  'rn',
                  event.target.value,
                )
              }
            />

            <span className="norton-equation-input-unit">
              kΩ
            </span>

          </label>


          <span
            className="norton-equation-operator"
            aria-hidden="true"
          >
            +
          </span>


          <label className="norton-equation-term">

            <span>
              R<sub>L</sub>
            </span>

            <input
              className="norton-formula-input"
              aria-label="Enter load resistance"
              inputMode="decimal"
              placeholder="Enter Value"
              value={nortonInputs.rl}
              disabled={!isReady}
              onChange={(event) =>
                handleNortonInputChange(
                  'rl',
                  event.target.value,
                )
              }
            />

            <span className="norton-equation-input-unit">
              kΩ
            </span>

          </label>

        </div>

      </div>


      {/* ANSWER */}

      <div className="norton-equation-result">

        <span className="norton-equation-equals">
          =
        </span>

        <input
          className="norton-formula-input norton-formula-result-input"
          aria-label="Calculated Norton load current"
          placeholder="Answer"
          value={calculatedLoadCurrentDisplay}
          disabled={!isReady}
          readOnly
        />

        <span className="norton-equation-unit">
          mA
        </span>

      </div>

    </div>

  </div>

</div>

      {/* VERIFY BUTTON */}

      <div className="norton-verification-section">

        <button
          id="norton-verify-button"
          type="button"
          className="norton-verify-btn"
          onClick={handleVerify}
          disabled={
            !isReady ||
            calculatedLoadCurrent === null
          }
        >
          Verify
        </button>


        {verificationMessage && (
          <div
            className={`norton-verification-message norton-verification-message--${verificationStatus}`}
          >
            {verificationMessage}
          </div>
        )}
        <div className="copyright-footer">
  © 2026 Virtual Lab | IIT Roorkee
</div>

      </div>

    </div>

  </SectionCard>
)
}
export default CalculationPanel
