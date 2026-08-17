import a1Img from '../assets/A1.png'
import a2Img from '../assets/A2.png'
import a3Img from '../assets/A3.png'
import needleImg from '../assets/needle.png'

const ammeterImages = {
  A: a1Img,
  A1: a1Img,
  A2: a2Img,
  A3: a3Img,
}

const defaultTerminalNumbers = {
  A: { positive: 1, negative: 2 },
  A1: { positive: 3, negative: 4 },
  A2: { positive: 5, negative: 6 },
  A3: { positive: 7, negative: 8 },
}

const clamp = (value, min, max) => (
  Math.min(Math.max(value, min), max)
)

const needleCalibration = [
  { value: 0, angle: 270 },
  { value: 1, angle: 286 },
  { value: 2, angle: 302 },
  { value: 3, angle: 320 },
  { value: 4, angle: 338 },
  { value: 5, angle: 360 },
  { value: 6, angle: 381 },
  { value: 7, angle: 399 },
  { value: 8, angle: 417 },
  { value: 9, angle: 434 },
  { value: 10, angle: 450 },
]

const getNeedleAngle = (value) => {
  const currentValue = clamp(value, 0, 10)

  for (let index = 0; index < needleCalibration.length - 1; index += 1) {
    const startPoint = needleCalibration[index]
    const endPoint = needleCalibration[index + 1]

    if (
      currentValue >= startPoint.value &&
      currentValue <= endPoint.value
    ) {
      const localRatio =
        (currentValue - startPoint.value) /
        (endPoint.value - startPoint.value)

      return (
        startPoint.angle +
        localRatio * (endPoint.angle - startPoint.angle)
      )
    }
  }

  return needleCalibration.at(-1)?.angle ?? 360
}

const Ammeter = ({
  label = 'A',
  value = 0,
  positiveTerminal,
  negativeTerminal,
}) => {
  const defaults =
    defaultTerminalNumbers[label] ??
    defaultTerminalNumbers.A

  const resolvedPositiveTerminal =
    positiveTerminal ?? defaults.positive

  const resolvedNegativeTerminal =
    negativeTerminal ?? defaults.negative

  const numericValue = Number(value)

  const current = Number.isFinite(numericValue)
    ? Math.abs(numericValue)
    : 0

  const angle = getNeedleAngle(current)

  const image =
    ammeterImages[label] ??
    ammeterImages.A

  return (
    <article
      className={`ammeter ammeter--${label.toLowerCase()}`}
      id={`ammeter-${label.toLowerCase()}`}
      aria-label={`${label} ammeter`}
    >
      <img
        src={image}
        alt={`${label} ammeter`}
        className="ammeter__image"
      />

      <span
        id={`${resolvedPositiveTerminal}-endpoint`}
        className={[
          'connection-terminal',
          'connection-terminal--meter',
          'connection-terminal--meter-plus',
          `connection-terminal--endpoint-${resolvedPositiveTerminal}`,
        ].join(' ')}
        data-polarity="plus"
        aria-label={`${label} positive terminal ${resolvedPositiveTerminal}`}
        title={`${label} positive`}
      />

      <span
        className={[
          'terminal-number-label',
          'terminal-number-label--meter-plus',
          `terminal-number-label--endpoint-${resolvedPositiveTerminal}`,
        ].join(' ')}
        data-terminal-id={`${resolvedPositiveTerminal}-endpoint`}
        title={`${label} positive`}
      >
        {resolvedPositiveTerminal}
      </span>

      <span
        id={`${resolvedNegativeTerminal}-endpoint`}
        className={[
          'connection-terminal',
          'connection-terminal--meter',
          'connection-terminal--meter-minus',
          `connection-terminal--endpoint-${resolvedNegativeTerminal}`,
        ].join(' ')}
        data-polarity="minus"
        aria-label={`${label} negative terminal ${resolvedNegativeTerminal}`}
        title={`${label} negative`}
      />

      <span
        className={[
          'terminal-number-label',
          'terminal-number-label--meter-minus',
          `terminal-number-label--endpoint-${resolvedNegativeTerminal}`,
        ].join(' ')}
        data-terminal-id={`${resolvedNegativeTerminal}-endpoint`}
        title={`${label} negative`}
      >
        {resolvedNegativeTerminal}
      </span>

      <div
        className="ammeter__needle"
        style={{
          transform: `rotate(${angle}deg)`,
        }}
      >
        <img
          src={needleImg}
          alt=""
          aria-hidden="true"
          className="ammeter__needle-image"
        />
      </div>
    </article>
  )
}

export default Ammeter