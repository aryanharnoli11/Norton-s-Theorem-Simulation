import currentSourceOff from '../assets/CurrentSource_OFF.png'
import currentSourceOn from '../assets/CurrentSource_ON.png'
import readingMeter from '../assets/readingmeter.png'
import sliderBar from '../assets/slidebar.png'
import sliderKnob from '../assets/sliderbar-knob.png'

const CurrentSource = ({
  label = 'Current Source',
  positiveTerminal = 1,
  negativeTerminal = 2,
  current = 0,
  setCurrent,
  powerOn = false,
  onTogglePower,
  locked = false,
  sourcesLocked = false,
}) => {
  const displayedCurrent = powerOn ? `${current.toFixed(1)} A` : ''

  const handleCurrentChange = (event) => {
    setCurrent(Number(Number(event.target.value).toFixed(1)))
  }

  return (
    <article className="current-source" id="current-source">
      <img
  alt={powerOn ? `${label} switched on` : `${label} switched off`}
  className={`current-source__image ${
    powerOn
      ? 'current-source__image--on'
      : 'current-source__image--off'
  }`}
  src={powerOn ? currentSourceOn : currentSourceOff}
/>

      <div className="current-source__display">
  <img
    src={readingMeter}
    alt="Current Display"
    className="current-source__display-image"
  />

  <span className="current-source__display-value">
    {displayedCurrent}
  </span>
</div>

      <span
        id={`${positiveTerminal}-endpoint`}
        className={`connection-terminal connection-terminal--meter connection-terminal--meter-plus connection-terminal--endpoint-${positiveTerminal}`}
        data-polarity="plus"
        data-terminal-number={positiveTerminal}
      />
      <span
        className={`terminal-number-label terminal-number-label--meter-plus terminal-number-label--endpoint-${positiveTerminal}`}
        data-terminal-id={`${positiveTerminal}-endpoint`}
        title={`Current Source Positive ${positiveTerminal}`}
      >
        {positiveTerminal}
      </span>

      <span
        id={`${negativeTerminal}-endpoint`}
        className={`connection-terminal connection-terminal--meter connection-terminal--meter-minus connection-terminal--endpoint-${negativeTerminal}`}
        data-polarity="minus"
        data-terminal-number={negativeTerminal}
      />
      <span
        className={`terminal-number-label terminal-number-label--meter-minus terminal-number-label--endpoint-${negativeTerminal}`}
        data-terminal-id={`${negativeTerminal}-endpoint`}
        title={`Current Source Negative ${negativeTerminal}`}
      >
        {negativeTerminal}
      </span>

      <button
  className="current-source__button"
  onClick={sourcesLocked ? undefined : onTogglePower}
  disabled={sourcesLocked}
  type="button"
/>

      <label className="current-source__control">
        <input
  className="current-range"
  disabled={!powerOn || locked}
  max="10"
  min="0"
  onChange={handleCurrentChange}
  step="0.1"
  type="range"
  value={current}
/>
      </label>
    </article>
  )
}

export default CurrentSource