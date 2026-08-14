import { useEffect, useState } from 'react'

const toFiniteNumber = (value, fallback) => {
  const number = Number(value)

  return Number.isFinite(number)
    ? number
    : fallback
}

const clampValue = (value, min, max) => (
  Math.min(
    Math.max(value, min),
    max,
  )
)

const getDecimalPlaces = (step) => {
  const stepText = String(step)

  if (!stepText.includes('.')) {
    return 0
  }

  return stepText.split('.')[1].length
}

const normalizeResistance = ({
  value,
  min,
  max,
  step,
}) => {
  const numericValue =
    toFiniteNumber(value, min)

  const boundedValue =
    clampValue(
      numericValue,
      min,
      max,
    )

  const precision =
    getDecimalPlaces(step)

  return Number(
    boundedValue.toFixed(precision),
  )
}

const ResistanceSlider = ({
  disabled = false,
  label = 'R',
  min = 1,
  max = 10,
  step = 0.1,
  onChange,
  value,
}) => {
  const normalizedValue =
    normalizeResistance({
      value,
      min,
      max,
      step,
    })

  const [draftValue, setDraftValue] =
    useState(normalizedValue)

  const [isEditing, setIsEditing] =
    useState(false)

  /*
   * Parent value change hone par local slider state
   * ko synchronize karta hai.
   *
   * Ye reset, auto-fill aur case change ke waqt
   * slider ko stale value par jaane se rokta hai.
   */
  useEffect(() => {
    if (!isEditing) {
      setDraftValue(normalizedValue)
    }
  }, [
    normalizedValue,
    isEditing,
  ])

  const sliderValue = isEditing
    ? normalizeResistance({
        value: draftValue,
        min,
        max,
        step,
      })
    : normalizedValue

  const commitValue = () => {
    const committedValue =
      normalizeResistance({
        value: draftValue,
        min,
        max,
        step,
      })

    setDraftValue(committedValue)
    setIsEditing(false)

    onChange?.(committedValue)
  }

  const handleChange = (event) => {
    const nextValue =
      normalizeResistance({
        value: event.target.value,
        min,
        max,
        step,
      })

    /*
     * Slider drag ke saath parent state bhi update karo.
     * Isse thumb aur displayed label synchronized rahenge.
     */
    setDraftValue(nextValue)
    setIsEditing(true)
    onChange?.(nextValue)
  }

  const handleKeyDown = (event) => {
    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      commitValue()
    }
  }

  const decimalPlaces =
    getDecimalPlaces(step)

  return (
    <div
      className={`resistance-slider ${
        disabled
          ? 'resistance-slider--locked'
          : ''
      }`}
    >
      <label
        className="resistance-slider__label"
        htmlFor={`${label}-slider`}
      >
        {label.slice(0, 1)}
        <sub>{label.slice(1)}</sub>
        {' '}(&Omega;)
      </label>

      <div className="resistance-slider__control">
        <input
          aria-label={`${label} resistance`}
          className="resistance-slider__input"
          disabled={disabled}
          id={`${label}-slider`}
          min={min}
          max={max}
          step={step}
          type="range"
          value={sliderValue}
          onChange={handleChange}
          onBlur={commitValue}
          onKeyDown={handleKeyDown}
          onPointerCancel={commitValue}
          onPointerUp={commitValue}
        />
      </div>

      <span className="resistance-slider__value">
        {sliderValue.toFixed(
          decimalPlaces,
        )}
      </span>
    </div>
  )
}

export default ResistanceSlider