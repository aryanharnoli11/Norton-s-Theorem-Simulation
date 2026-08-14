import multimeterImg from '../assets/DigitalMultimeter.png'

const formatDisplayValue = (value, mode) => {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return ''
  }

  const numericValue = Number(value)

  if (!Number.isFinite(numericValue)) {
    return ''
  }

  if (mode === 'resistance') {
    return `${numericValue.toFixed(2)} Ω`
  }

  return numericValue.toFixed(3)
}

const DigitalMultimeter = ({
  mode = 'resistance',
  value = null,
  positiveTerminal = 3,
  negativeTerminal = 4,
  active = false,
  disabled = false,
}) => {
 const displayedValue =
  active
    ? formatDisplayValue(value, mode)
    : ''

  return (
    <article
      className={[
        'digital-multimeter',
        active
          ? 'digital-multimeter--active'
          : '',
        disabled
          ? 'digital-multimeter--disabled'
          : '',
      ]
        .filter(Boolean)
        .join(' ')}
      id="digital-multimeter"
      aria-label="Digital multimeter"
    >
      <img
        src={multimeterImg}
        alt="Digital multimeter set to resistance mode"
        className="digital-multimeter__image"
      />

      <div
        className="digital-multimeter__display"
        aria-live="polite"
      >
        {displayedValue}
      </div>

      <span
        className="digital-multimeter__fixed-mode"
        aria-hidden="true"
      >
        Ω
      </span>

      <span
        id={`${positiveTerminal}-endpoint`}
        className={[
          'connection-terminal',
          'connection-terminal--equipment',
          'connection-terminal--multimeter',
          'connection-terminal--multimeter-positive',
          `connection-terminal--endpoint-${positiveTerminal}`,
        ].join(' ')}
        data-polarity="plus"
        aria-label={`Digital multimeter positive terminal ${positiveTerminal}`}
        title={`Digital multimeter terminal ${positiveTerminal}`}
      />

      <span
        className={[
          'terminal-number-label',
          'terminal-number-label--equipment',
          'terminal-number-label--multimeter',
          `terminal-number-label--endpoint-${positiveTerminal}`,
        ].join(' ')}
        data-terminal-id={`${positiveTerminal}-endpoint`}
        title={`Digital multimeter terminal ${positiveTerminal}`}
      >
        {positiveTerminal}
      </span>

      <span
        id={`${negativeTerminal}-endpoint`}
        className={[
          'connection-terminal',
          'connection-terminal--equipment',
          'connection-terminal--multimeter',
          'connection-terminal--multimeter-negative',
          `connection-terminal--endpoint-${negativeTerminal}`,
        ].join(' ')}
        data-polarity="minus"
        aria-label={`Digital multimeter common terminal ${negativeTerminal}`}
        title={`Digital multimeter terminal ${negativeTerminal}`}
      />

      <span
        className={[
          'terminal-number-label',
          'terminal-number-label--equipment',
          'terminal-number-label--multimeter',
          `terminal-number-label--endpoint-${negativeTerminal}`,
        ].join(' ')}
        data-terminal-id={`${negativeTerminal}-endpoint`}
        title={`Digital multimeter terminal ${negativeTerminal}`}
      >
        {negativeTerminal}
      </span>
    </article>
  )
}

export default DigitalMultimeter