import { useEffect, useMemo, useState } from 'react'
import { calculateNortonLoadCurrent } from '../utils/circuitMath.js'
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

const NORTON_INPUT_RANGES = {
  in: { min: 0, max: 50 },
  rn: { min: 0, max: 50 },
  rl: { min: 0, max: 3 },
}

const sanitizeNumberInput = (
  value,
  { min, max },
) => {
  let nextValue = String(value).replace(/[^\d.-]/g, '')

  nextValue = nextValue.replace(/(?!^)-/g, '')

  const [integerPart, ...decimalParts] =
    nextValue.split('.')

  const limitedInteger =
    integerPart.slice(0, 5)

  const limitedDecimal =
    decimalParts.join('').slice(0, 4)

  const sanitizedValue = decimalParts.length > 0
    ? `${limitedInteger}.${limitedDecimal}`
    : limitedInteger

  if (sanitizedValue.startsWith('-')) {
    return String(min)
  }

  const numericValue = Number(sanitizedValue)

  if (
    sanitizedValue !== '' &&
    Number.isFinite(numericValue)
  ) {
    if (numericValue > max) {
      return String(max)
    }

    if (numericValue < min) {
      return String(min)
    }
  }

  return sanitizedValue
}

const formatVoltage = (value) => (
  Number.isInteger(value)
    ? value.toFixed(0)
    : value.toFixed(1)
)

const preventWheelValueChange = (event) => {
  event.currentTarget.blur()
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
  onShowAlertWithAudio,
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

  const sourceVoltage =
    toFiniteNumber(voltageValue)

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
  return calculateNortonLoadCurrent({
    nortonCurrent: enteredIn,
    nortonResistance: enteredRn,
    loadResistance: enteredRl,
  })
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
  const inputRange = NORTON_INPUT_RANGES[parameter]

  setNortonInputs((current) => ({
    ...current,
    [parameter]: sanitizeNumberInput(
      value,
      inputRange,
    ),
  }))

  setVerificationMessage('')
  setVerificationStatus('idle')
  onVerificationComplete?.([])

  setInstructionStep?.(
    'calculation-enter-value',
  )
}

const handleVerify = () => {

  if (!isReady) {
    return
  }

  if (!hasNortonInputs) {
    const missingInputCount =
      Object.values(nortonInputs).filter(
        (value) => value.trim() === '',
      ).length
    const oneValueMissing = missingInputCount === 1
    const missingMessage = oneValueMissing
      ? 'Please enter the required value, then click the “Verify” button to verify the theorem.'
      : 'Please enter all the values, then click the “Verify” button to verify the theorem.'

    setVerificationMessage(missingMessage)

    setVerificationStatus('error')
    onVerificationComplete?.([])

    onShowAlertWithAudio?.(
      {
        title: oneValueMissing
          ? 'One Calculation Value Is Missing'
          : 'Multiple Calculation Values Are Missing',
        description: missingMessage,
        type: 'warning',
        target: '#calculation-panel',
      },
      oneValueMissing
        ? aiGuideAudio?.verifyOneMissing
        : aiGuideAudio?.verifyMultipleMissing,
    )

    return
  }

  if (calculatedLoadCurrent === null) {
    setVerificationMessage(
      'Please enter valid Norton current and resistance values.',
    )

    setVerificationStatus('error')
    onVerificationComplete?.([])

    onShowAlertWithAudio?.(
      {
        title: 'Invalid Calculation Values',
        description:
          'Please enter valid Norton current and resistance values.',
        type: 'error',
        target: '#calculation-panel',
      },
      aiGuideAudio?.verifyIncorrect,
    )

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


  /*
   * Compare the values at the precision shown to the user. A difference of
   * one unit in the final displayed decimal (for example 1.332 vs 1.333)
   * is accepted.
   */
  const displayedDifferenceSteps = Math.abs(
    Math.round(calculatedLoadCurrent * 1000) -
      Math.round(observedLoadCurrentMA * 1000),
  )

  const verified = displayedDifferenceSteps <= 1


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

    if (onShowAlertWithAudio) {
      onShowAlertWithAudio(
        {
          title: "Norton's Theorem Verified",
          description:
            'The calculated load current matches the observed value.',
          type: 'success',
          target: '#calculation-panel',
        },
        aiGuideAudio?.verifyCorrect,
      )
    } else {
      onPlayAiGuideAudio?.(
        aiGuideAudio?.verifyCorrect,
      )
    }

  } else {

    setVerificationMessage(
      '✗ Calculated load current does not match the observed value.',
    )

    setVerificationStatus('error')

    setInstructionStep?.(
      'calculation-enter-value',
    )

    if (onShowAlertWithAudio) {
      onShowAlertWithAudio(
        {
          title: 'Calculation Does Not Match',
          description:
            'The calculated load current does not match the observed value. Check the entered values and try again.',
          type: 'error',
          target: '#calculation-panel',
        },
        aiGuideAudio?.verifyIncorrect,
      )
    } else {
      onPlayAiGuideAudio?.(
        aiGuideAudio?.verifyIncorrect,
      )
    }
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

  <div className="source-values-card">

    <h3>Source Values</h3>

    <div className="source-value-row">

      <span className="source-value-label">
        Voltage Source:
      </span>

      <div className="inline-display">
        {calculationDone && sourceVoltage !== null
          ? formatVoltage(sourceVoltage)
          : ''}
      </div>

      <span className="inline-unit">V</span>

    </div>

  </div>

</div>

      {/* OBSERVED LOAD CURRENT */}


<div className="norton-current-card">

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
            max={NORTON_INPUT_RANGES.in.max}
            min={NORTON_INPUT_RANGES.in.min}
            placeholder="Enter Value"
            step="any"
            title="Allowed range: 0 to 50 mA"
            type="number"
            value={nortonInputs.in}
            disabled={!isReady}
            onWheel={preventWheelValueChange}
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
              max={NORTON_INPUT_RANGES.rn.max}
              min={NORTON_INPUT_RANGES.rn.min}
              placeholder="Enter Value"
              step="any"
              title="Allowed range: 0 to 50 kΩ"
              type="number"
              value={nortonInputs.rn}
              disabled={!isReady}
              onWheel={preventWheelValueChange}
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
              max={NORTON_INPUT_RANGES.rl.max}
              min={NORTON_INPUT_RANGES.rl.min}
              placeholder="Enter Value"
              step="any"
              title="Allowed range: 0 to 3 kΩ"
              type="number"
              value={nortonInputs.rl}
              disabled={!isReady}
              onWheel={preventWheelValueChange}
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

</div>

      {/* VERIFY BUTTON */}

      <div className="norton-verification-section">

        <button
          id="norton-verify-button"
          type="button"
          className="norton-verify-btn"
          onClick={handleVerify}
          disabled={!calculationDone}
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
