const toFiniteNumber = (
  value,
  fallback = 0,
) => {
  const number = Number(value)

  return Number.isFinite(number)
    ? number
    : fallback
}

const toResistanceOhms = (value) => (
  Math.max(
    toFiniteNumber(value, 1) * 1000,
    0.1,
  )
)

export const calculateReadings = ({
  voltage,
  powerOn,
  r1,
  r2,
  r3,
  rl,
}) => {
  const supplyVoltage =
    powerOn
      ? Math.max(
          toFiniteNumber(voltage),
          0,
        )
      : 0

  const R1 = toResistanceOhms(r1)
const R2 = toResistanceOhms(r2)
const R3 = toResistanceOhms(r3)
const RL = toResistanceOhms(rl)

  /*
   * Norton resistance:
   *
   * RN = R3 + (R1 || R2)
   */
  const parallelR1R2 =
    (R1 * R2) / (R1 + R2)

  const nortonResistance =
    R3 + parallelR1R2

  /*
   * Short-circuit current:
   *
   * Output terminals are shorted.
   * R2 and R3 become parallel.
   */
  const parallelR2R3 =
    (R2 * R3) / (R2 + R3)

  const shortCircuitInputResistance =
    R1 + parallelR2R3

  const shortCircuitSourceCurrent =
    shortCircuitInputResistance > 0
      ? supplyVoltage /
        shortCircuitInputResistance
      : 0

  const shortCircuitNodeVoltage =
    supplyVoltage -
    shortCircuitSourceCurrent * R1

  const shortCircuitCurrent =
    R3 > 0
      ? shortCircuitNodeVoltage / R3
      : 0

  /*
   * Load-current circuit:
   *
   * R3 and RL are series.
   * This series branch is parallel to R2.
   */
  const loadBranchResistance =
    R3 + RL

  const loadedParallelResistance =
    (
      R2 *
      loadBranchResistance
    ) /
    (
      R2 +
      loadBranchResistance
    )

  const loadedInputResistance =
    R1 +
    loadedParallelResistance

  const loadedSourceCurrent =
    loadedInputResistance > 0
      ? supplyVoltage /
        loadedInputResistance
      : 0

  const loadedNodeVoltage =
    supplyVoltage -
    loadedSourceCurrent * R1

  const loadCurrent =
    loadBranchResistance > 0
      ? loadedNodeVoltage /
        loadBranchResistance
      : 0

  /*
   * Norton equivalent verification:
   *
   * IL = Isc × RN / (RN + RL)
   */
  const nortonCalculatedLoadCurrent =
    (
      nortonResistance + RL
    ) > 0
      ? shortCircuitCurrent *
        (
          nortonResistance /
          (
            nortonResistance + RL
          )
        )
      : 0

  return {
    nortonResistance,
    shortCircuitCurrent,
    loadCurrent,
    nortonCalculatedLoadCurrent,

    parallelR1R2,
    parallelR2R3,
    shortCircuitInputResistance,
    loadedInputResistance,
  }
}