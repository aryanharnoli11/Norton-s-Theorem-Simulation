import SectionCard from './SectionCard.jsx'

const formatValue = (
  value,
  digits,
  scale = 1,
) => {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return '-'
  }

  const number = Number(value)

  if (!Number.isFinite(number)) {
    return '-'
  }

  return (number * scale).toFixed(digits)
}

const ObservationTable = ({
  observations = {},
}) => {
  const hasAnyReading = [
    observations.nortonResistance,
    observations.shortCircuitCurrent,
    observations.loadCurrent,
  ].some(
    (value) => value !== null,
  )

  return (
    <SectionCard
      className="observation-card-compact observation-card--norton"
      icon="table"
      id="observation-table-panel"
      title="OBSERVATION TABLE"
    >
      <div className="observation-table-wrap">
        <table className="observation-table observation-table--norton">
          <thead>
            <tr>
              <th>S.No.</th>

              <th>
                Power Supply
                <br />
                (V)
              </th>

              <th>
                I<sub>N</sub>
                <br />
                (mA)
              </th>

              <th>
                R<sub>N</sub>
                <br />
                (k&Omega;)
              </th>

              <th>
                I<sub>L</sub>
                <br />
                (mA)
              </th>

              <th>
                R<sub>L</sub>
                <br />
                (k&Omega;)
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>
                {hasAnyReading ? 1 : '-'}
              </td>

              <td>
                {formatValue(
                  observations.voltage,
                  1,
                )}
              </td>

              <td>
                {formatValue(
                  observations
                    .shortCircuitCurrent,
                  3,
                  1000,
                )}
              </td>

              <td>
                {formatValue(
                  observations
                    .nortonResistance,
                  3,
                  0.001,
                )}
              </td>

              <td>
                {formatValue(
                  observations.loadCurrent,
                  3,
                  1000,
                )}
              </td>

              <td>
                {formatValue(
                  observations
                    .loadResistance,
                  1,
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </SectionCard>
  )
}

export default ObservationTable
