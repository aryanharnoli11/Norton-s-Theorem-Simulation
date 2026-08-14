import Ammeter from './Ammeter.jsx'
import DigitalMultimeter from './DigitalMultimeter.jsx'
import PowerSupply from './PowerSupply.jsx'

const EquipmentPanel = ({
  ammeterReading = 0,
  multimeterReading = 0,
  multimeterMode = 'resistance',
  multimeterActive = false,
  multimeterDisabled = false,
  onMultimeterModeChange,

  onTogglePower,
  powerOn = false,
  setVoltage,
  voltage = 0,

  lockedVoltage = false,
  sourcesLocked = false,
}) => (
  <section
    className="equipment-panel equipment-panel--norton"
    id="equipment-panel"
  >
    <div className="ammeter-slot ammeter-slot--norton">
      <Ammeter
        label="A"
        value={ammeterReading}
        positiveTerminal={1}
        negativeTerminal={2}
      />
    </div>

    <DigitalMultimeter
      positiveTerminal={3}
      negativeTerminal={4}
      mode={multimeterMode}
      value={multimeterReading}
      active={multimeterActive}
      disabled={multimeterDisabled}
  
    />

    <PowerSupply
  id="power-supply"
  positiveTerminal={5}
  negativeTerminal={6}
  onTogglePower={onTogglePower}
  powerOn={powerOn}
  setVoltage={setVoltage}
  voltage={voltage}
  locked={lockedVoltage}
  sourcesLocked={sourcesLocked}
/>
  </section>
)

export default EquipmentPanel