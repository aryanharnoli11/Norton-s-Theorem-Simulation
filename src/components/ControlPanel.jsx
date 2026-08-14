import ObservationTable from './ObservationTable.jsx'
import ResistanceSlider from './ResistanceSlider.jsx'
import SectionCard from './SectionCard.jsx'

const ControlPanel = ({
  locked = false,
  observations = {},

  r1 = 1,
  r2 = 1,
  r3 = 1,
  rl = 100,

  setR1,
  setR2,
  setR3,
  setRl,
}) => (
  <>
    <SectionCard
      className="h-[250px] resistance-card resistance-card--norton"
      icon="sliders"
      id="resistance-controls"
      title="RESISTANCE SLIDERS"
    >
      <div className="flex flex-col gap-[11px] px-[26px] pt-[26px]">
        <ResistanceSlider
          disabled={locked}
          label="R1"
          min={1}
          max={10}
          step={0.1}
          onChange={setR1}
          value={r1}
        />

        <ResistanceSlider
          disabled={locked}
          label="R2"
          min={1}
          max={10}
          step={0.1}
          onChange={setR2}
          value={r2}
        />

        <ResistanceSlider
          disabled={locked}
          label="R3"
          min={1}
          max={10}
          step={0.1}
          onChange={setR3}
          value={r3}
        />

        <ResistanceSlider
          disabled={locked}
          label="RL"
          min={100}
          max={300}
          step={1}
          onChange={setRl}
          value={rl}
        />
      </div>
    </SectionCard>

    <ObservationTable
      observations={observations}
    />
  </>
)

export default ControlPanel