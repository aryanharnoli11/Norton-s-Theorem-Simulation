import {  useEffect,
  useRef, useState } from 'react'
import SectionCard from './SectionCard.jsx'
import {
  AddIcon,
  AiGuide,
  AutoConnectIcon,
  ButtonIcon,
  CheckIcon,
  CloseIcon,
  
  PrintIcon,
  ResetIcon,
  
  CalculationIcon,
} from './Icons.jsx'

const buttons = [
  {
    id: 'instruction-button',
    label: 'INSTRUCTIONS',
    tone: 'action-button--gold',
    Icon: ButtonIcon,
    opensInstructions: true,
  },
  {
    id: 'ai-guide-button',
    label: 'AI GUIDE',
    tone: 'action-button--cyan',
    Icon: AiGuide,
    handlerName: 'onAiGuide',
  },
  {
    id: 'check-button',
    label: 'CHECK',
    tone: 'action-button--green',
    Icon: CheckIcon,
    handlerName: 'onCheck',
  },
  {
    id: 'auto-connect-button',
    label: 'AUTO CONNECT',
    tone: 'action-button--teal',
    Icon: AutoConnectIcon,
    handlerName: 'onAutoConnect',
  },
  {
    id: 'add-reading-button',
    label: 'ADD',
    tone: 'action-button--blue',
    Icon: AddIcon,
    handlerName: 'onAdd',
  },
  {
  id: 'calculate-button',
  label: 'CALCULATE',
  tone: 'action-button--orange',
  Icon: CalculationIcon,
  handlerName: 'onCalculate',
},
  /*{
    id: 'plot-button',
    label: 'PLOT',
    tone: 'action-button--orange',
    Icon: PlotIcon,
    handlerName: 'onPlot',
  },*/
  {
    id: 'reset-button',
    label: 'RESET',
    tone: 'action-button--red',
    Icon: ResetIcon,
    handlerName: 'onReset',
  },
  {
    id: 'print-button',
    label: 'PRINT',
    tone: 'action-button--purple',
    Icon: PrintIcon,
    handlerName: 'onPrint',
  },
  
 
]

const ActionButtons = ({
  disabledButtons = {},
  instructionStep,
  onAdd,
  onCheck,
  onCalculate,
  onPlot,
  onPrint,
  onReset,
  onAutoConnect,
  onAiGuide,
}) => {
  const [instructionsOpen, setInstructionsOpen] =
    useState(false)

  const instructionBodyRef = useRef(null)
  
  const handlers = {
    onAdd,
    onCheck,
    onCalculate,
    onPlot,
    onPrint,
    onReset,
    onAutoConnect,
    onAiGuide,
  }
useEffect(() => {
  if (!instructionsOpen) {
    return
  }

  const activeElement =
    instructionBodyRef.current?.querySelector(
      '.instruction-substep--active, .instruction-step--active',
    )

  activeElement?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  })
}, [
  instructionStep,
  instructionsOpen,
])
  return (
    <SectionCard className="action-buttons-card h-[214px]" icon="buttons" id="action-buttons-panel" title="ACTION BUTTONS">
      <div className="action-buttons__grid">
        {buttons.map(({ id, label, tone, Icon, handlerName, opensInstructions }) => {
          const handler = handlers[handlerName]
          const isDisabled = !opensInstructions && (!handler || disabledButtons[handlerName])
          const buttonProps = opensInstructions
            ? {
                'aria-controls': 'experiment-instructions-panel',
                'aria-expanded': instructionsOpen,
                onClick: () => setInstructionsOpen((current) => !current),
              }
            : {
                onClick: handler,
              }

          return (
            <button
              id={id}
              key={label}
              type="button"
              className={`action-button ${tone}`}
              disabled={isDisabled}
              {...buttonProps}
            >
              <Icon />
              <span>{label}</span>
            </button>
          )
        })}
      </div>

      {instructionsOpen ? (
        <div
          className="action-instructions-panel"
          id="experiment-instructions-panel"
          role="region"
          aria-labelledby="experiment-instructions-title"
        >
          <div className="action-instructions-panel__header">
            <h3 id="experiment-instructions-title">Instructions</h3>
            <button
              type="button"
              className="action-instructions-panel__close"
              aria-label="Close instructions"
              onClick={() => setInstructionsOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>

          
            <div
  className="action-instructions-panel__body"
  ref={instructionBodyRef}
>
  <ol className="action-instructions-panel__steps">
    <li
      data-instruction-step="resistance"
      className={
        instructionStep === 'resistance'
          ? 'instruction-step--active'
          : ''
      }
    >
      <strong>STEP 1:</strong>{' '}
      Set the values of resistances
      R<sub>1</sub>, R<sub>2</sub>,
      R<sub>3</sub> and R<sub>L</sub> by
      adjusting the sliders.
    </li>

    <li
      className={
        instructionStep?.startsWith('rn-') ||
        instructionStep?.startsWith('isc-') ||
        instructionStep?.startsWith('il-')
          ? 'instruction-step--active'
          : ''
      }
    >
      <strong>STEP 2:</strong>{' '}
      Make connections as per the instructions
      given below:

      <ol className="action-instructions-panel__substeps instruction-case-list">
        <li
          className={
            instructionStep?.startsWith('rn-')
              ? 'instruction-case--active'
              : ''
          }
        >
          <strong>
            CASE 1 — Measure R<sub>N</sub>
          </strong>

          <ol type="a">
            <li
              data-instruction-step="rn-connections"
              className={
                instructionStep ===
                'rn-connections'
                  ? 'instruction-substep--active'
                  : ''
              }
            >
              Short the power-supply circuit
              terminals by connecting
              <strong> 7–8</strong>.
            </li>

            <li
              className={
                instructionStep ===
                'rn-connections'
                  ? 'instruction-substep--active'
                  : ''
              }
            >
              Connect the digital multimeter:
              <strong> 3–9</strong> and
              <strong> 4–11</strong>.
            </li>

            <li
              data-instruction-step="rn-check"
              className={
                instructionStep === 'rn-check'
                  ? 'instruction-substep--active'
                  : ''
              }
            >
              Click <strong>CHECK</strong> to
              verify the connections.
            </li>

            <li
              data-instruction-step="rn-add-reading"
              className={
                instructionStep ===
                'rn-add-reading'
                  ? 'instruction-substep--active'
                  : ''
              }
            >
              Keep the power supply OFF and click
              <strong> ADD</strong> to record
              R<sub>N</sub>.
            </li>

            <li
              data-instruction-step="rn-remove-connections"
              className={
                instructionStep ===
                'rn-remove-connections'
                  ? 'instruction-substep--active'
                  : ''
              }
            >
              Do not reset. Remove
              <strong> 7–8</strong>,
              <strong> 3–9</strong> and
              <strong> 4–11</strong>.
            </li>
          </ol>
        </li>

        <li
          className={
            instructionStep?.startsWith('isc-')
              ? 'instruction-case--active'
              : ''
          }
        >
          <strong>
            CASE 2 — Measure I<sub>SC</sub>
          </strong>

          <ol type="a">
            <li
              data-instruction-step="isc-connections"
              className={
                instructionStep ===
                'isc-connections'
                  ? 'instruction-substep--active'
                  : ''
              }
            >
              Connect the power supply:
              <strong> 5–7</strong> and
              <strong> 6–8</strong>.
            </li>

            <li
              className={
                instructionStep ===
                'isc-connections'
                  ? 'instruction-substep--active'
                  : ''
              }
            >
              Connect the ammeter:
              <strong> 1–9</strong> and
              <strong> 2–11</strong>.
            </li>

            <li
              data-instruction-step="isc-check"
              className={
                instructionStep === 'isc-check'
                  ? 'instruction-substep--active'
                  : ''
              }
            >
              Click <strong>CHECK</strong>.
            </li>

            <li
              data-instruction-step="isc-power"
              className={
                instructionStep === 'isc-power'
                  ? 'instruction-substep--active'
                  : ''
              }
            >
              Turn ON the power supply and set
              the required voltage.
            </li>

            <li
              data-instruction-step="isc-add-reading"
              className={
                instructionStep ===
                'isc-add-reading'
                  ? 'instruction-substep--active'
                  : ''
              }
            >
              Click <strong>ADD</strong> to
              record I<sub>SC</sub>.
            </li>

            <li
              data-instruction-step="isc-remove-connection"
              className={
                instructionStep ===
                'isc-remove-connection'
                  ? 'instruction-substep--active'
                  : ''
              }
            >
              Do not reset. Remove only the
              connection <strong>2–11</strong>.
            </li>
          </ol>
        </li>

        <li
          className={
            instructionStep?.startsWith('il-')
              ? 'instruction-case--active'
              : ''
          }
        >
          <strong>
            CASE 3 — Measure I<sub>L</sub>
          </strong>

          <ol type="a">
            <li
              data-instruction-step="il-connections"
              className={
                instructionStep ===
                'il-connections'
                  ? 'instruction-substep--active'
                  : ''
              }
            >
              Keep power-supply connections
              <strong> 5–7</strong> and
              <strong> 6–8</strong>.
            </li>

            <li
              className={
                instructionStep ===
                'il-connections'
                  ? 'instruction-substep--active'
                  : ''
              }
            >
              Keep ammeter connection
              <strong> 1–9</strong>.
            </li>

            <li
              className={
                instructionStep ===
                'il-connections'
                  ? 'instruction-substep--active'
                  : ''
              }
            >
              Connect
              <strong> 2–10</strong> and
              <strong> 11–12</strong>.
            </li>

            <li
              data-instruction-step="il-check"
              className={
                instructionStep === 'il-check'
                  ? 'instruction-substep--active'
                  : ''
              }
            >
              Click <strong>CHECK</strong>.
            </li>

            <li
              data-instruction-step="il-power"
              className={
                instructionStep === 'il-power'
                  ? 'instruction-substep--active'
                  : ''
              }
            >
              Turn ON the power supply and use
              the same voltage used for
              I<sub>SC</sub>.
            </li>

            <li
              data-instruction-step="il-add-reading"
              className={
                instructionStep ===
                'il-add-reading'
                  ? 'instruction-substep--active'
                  : ''
              }
            >
              Click <strong>ADD</strong> to
              record I<sub>L</sub>.
            </li>
          </ol>
        </li>
      </ol>
    </li>

    <li
      data-instruction-step="calculate-button"
      className={
        instructionStep ===
        'calculate-button'
          ? 'instruction-step--active'
          : ''
      }
    >
      <strong>STEP 3:</strong>{' '}
      Click <strong>CALCULATE</strong> to open
      the Norton load-current calculation panel.
    </li>

    <li
      data-instruction-step="calculation-enter-value"
      className={
        instructionStep?.startsWith(
          'calculation',
        )
          ? 'instruction-step--active'
          : ''
      }
    >
      <strong>STEP 4:</strong>{' '}
      Manually calculate:

      <div className="instruction-formula">
        I<sub>L</sub> =
        I<sub>N</sub> /
        (
        R<sub>N</sub> +
        R<sub>L</sub>
        )
      </div>

      Enter the calculated load current and click
      <strong> VERIFY</strong>.
    </li>

    <li
      data-instruction-step="print"
      className={
        instructionStep === 'print'
          ? 'instruction-step--active'
          : ''
      }
    >
      <strong>STEP 5:</strong>{' '}
      Click <strong>PRINT</strong> to print the
      webpage.
    </li>

    <li
      data-instruction-step="reset"
      className={
        instructionStep === 'reset' ||
        instructionStep === 'verified'
          ? 'instruction-step--active'
          : ''
      }
    >
      <strong>STEP 6:</strong>{' '}
      Click <strong>RESET</strong> to reload the
      experiment.
    </li>
  </ol>
</div>
        </div>
      ) : null}
    </SectionCard>
  )
}

export default ActionButtons
