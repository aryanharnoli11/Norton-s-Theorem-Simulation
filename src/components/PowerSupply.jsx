import supplyOffImage from '../assets/power_supply_off.png'
import supplyOnImage from '../assets/power_supply_on.png'
import supplyKnobImage from '../assets/power_supply_knob.png'

const PowerSupply = ({
  id = 'power-supply',
  positiveTerminal = 5,
  negativeTerminal = 6,
  onTogglePower,
  powerOn = false,
  setVoltage,
  onVoltageCommit,
  voltage = 0,
  locked = false,
  sourcesLocked = false,
}) => {
  const numericVoltage = Number(voltage)

  const safeVoltage = Number.isFinite(numericVoltage)
    ? Math.min(Math.max(numericVoltage, 0), 15)
    : 0

  const formattedVoltage = Number.isInteger(safeVoltage)
    ? safeVoltage.toFixed(0)
    : safeVoltage.toFixed(1)

  const displayedVoltage = powerOn
    ? `${formattedVoltage} V`
    : ''

  const handleVoltageChange = (event) => {
    const nextVoltage = Number(event.target.value)

    if (!Number.isFinite(nextVoltage)) {
      return
    }

    setVoltage?.(
      Number(nextVoltage.toFixed(1)),
    )
  }

  const handleVoltageCommit = (event) => {
    const committedVoltage = Number(event.currentTarget.value)

    if (
      !Number.isFinite(committedVoltage) ||
      committedVoltage <= 0
    ) {
      return
    }

    onVoltageCommit?.(
      Number(committedVoltage.toFixed(1)),
    )
  }

  const handlePowerToggle = () => {
    if (sourcesLocked) {
      return
    }

    onTogglePower?.()
  }

  return (
    <article
      className={`power-supply ${
        powerOn ? 'power-supply--on' : 'power-supply--off'
      }`}
      id={id}
    >
      <img
        className="power-supply__body-image"
        id="power-supply-walkthrough-target"
        src={powerOn ? supplyOnImage : supplyOffImage}
        alt={`DC voltage source ${powerOn ? 'on' : 'off'}`}
      />

      <img
        src={supplyKnobImage}
        alt=""
        aria-hidden="true"
        className="power-supply__knob"
        style={{
          transform: `rotate(${safeVoltage * 18}deg)`,
        }}
      />

      <div className="power-supply__display">
        {displayedVoltage}
      </div>

      <span
        id={`${positiveTerminal}-endpoint`}
        className={[
          'connection-terminal',
          'connection-terminal--power',
          'connection-terminal--power-plus',
          `connection-terminal--endpoint-${positiveTerminal}`,
        ].join(' ')}
        data-polarity="plus"
        aria-label={`Power supply positive terminal ${positiveTerminal}`}
        title="Voltage positive"
      />

      <span
        className={[
          'terminal-number-label',
          'terminal-number-label--power-plus',
          `terminal-number-label--endpoint-${positiveTerminal}`,
        ].join(' ')}
        data-terminal-id={`${positiveTerminal}-endpoint`}
        title="Voltage positive"
      >
        {positiveTerminal}
      </span>

      <span
        id={`${negativeTerminal}-endpoint`}
        className={[
          'connection-terminal',
          'connection-terminal--power',
          'connection-terminal--power-minus',
          `connection-terminal--endpoint-${negativeTerminal}`,
        ].join(' ')}
        data-polarity="minus"
        aria-label={`Power supply negative terminal ${negativeTerminal}`}
        title="Voltage negative"
      />

      <span
        className={[
          'terminal-number-label',
          'terminal-number-label--power-minus',
          `terminal-number-label--endpoint-${negativeTerminal}`,
        ].join(' ')}
        data-terminal-id={`${negativeTerminal}-endpoint`}
        title="Voltage negative"
      >
        {negativeTerminal}
      </span>

      <button
        id="power-toggle-button"
        aria-label={
          powerOn
            ? 'Switch power supply off'
            : 'Switch power supply on'
        }
        aria-pressed={powerOn}
        className="power-supply__button"
        onClick={handlePowerToggle}
        disabled={sourcesLocked}
        type="button"
      />

      <label
        className="power-supply__control"
        id="voltage-control"
      >
        <span className="sr-only">Voltage</span>

        <input
          aria-label="Voltage"
          className="voltage-range"
          disabled={!powerOn || locked || sourcesLocked}
          id="voltage-slider"
          max="15"
          min="0"
          onChange={handleVoltageChange}
          onBlur={handleVoltageCommit}
          onPointerUp={handleVoltageCommit}
          step="0.1"
          type="range"
          value={safeVoltage}
        />
      </label>
    </article>
  )
}

export default PowerSupply
