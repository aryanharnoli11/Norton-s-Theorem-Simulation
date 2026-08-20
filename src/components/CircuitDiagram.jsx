import { Fragment } from 'react'
import circuitImage from '../assets/circuit_norton.png'

const terminalLabels = [
  {
    id: '7-endpoint',
    label: '7',
    polarity: 'plus',
  },
  {
    id: '8-endpoint',
    label: '8',
    polarity: 'minus',
  },
  {
    id: '9-endpoint',
    label: '9',
    polarity: 'plus',
  },
  {
    id: '10-endpoint',
    label: '10',
    polarity: 'plus',
  },
  {
    id: '11-endpoint',
    label: '11',
    polarity: 'minus',
  },
  {
    id: '12-endpoint',
    label: '12',
    polarity: 'minus',
  },
]

const CircuitDiagram = ({
  className = '',
  r1,
  r2,
  r3,
  rl,
}) => (
  <section
    className={`circuit-panel circuit-panel--norton ${className}`}
    id="circuit-panel"
  >
    <div className="circuit-panel__stage">
      <img
        alt="Norton theorem circuit diagram"
        className="circuit-panel__image circuit-panel__image--norton"
        src={circuitImage}
      />

      {terminalLabels.map(({ id, label, polarity }) => (
        <Fragment key={id}>
          <span
            id={id}
            className={`connection-terminal connection-terminal--circuit connection-terminal--endpoint-${label}`}
            data-polarity={polarity}
            aria-label={`Circuit terminal ${label}`}
            title={`Circuit terminal ${label}`}
          />

          <span
            className={`terminal-number-label terminal-number-label--circuit terminal-number-label--endpoint-${label}`}
            data-terminal-id={id}
            title={`Circuit terminal ${label}`}
          >
            {label}
          </span>
        </Fragment>
      ))}

      <span className="resistor-value resistor-value--norton-r1">
        {r1} kΩ
      </span>

      <span className="resistor-value resistor-value--norton-r2">
        {r2} kΩ
      </span>

      <span className="resistor-value resistor-value--norton-r3">
        {r3} kΩ
      </span>

      <span className="resistor-value resistor-value--norton-rl">
        {rl} kΩ
      </span>
    </div>
  </section>
)

export default CircuitDiagram
