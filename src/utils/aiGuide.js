export const AI_GUIDE_MESSAGES = {
  guideOn: "AI Guide activated.",
  setResistance: "Please set R1, R2 and R3 using the resistance sliders.",
  makeConnections: "Please make the required connections as per the given instructions.",
  autoConnect: "Autoconnect completed. Click on the check button to verify the connections.",
  case1Verified: "Connections verified successfully. Now switch ON the current source for this case and set the required current value.",
  wrongVoltageCase1: "Complete Current Source Case First. First, perform the current source only before switching ON the voltage source.",
  currentValueSet: "The readings are displayed on the ammeters. Now, click on the add button to add the readings to the observation table.",
  case1ReadingAdded: "Readings added to the observation table. Now turn OFF the current source and remove the connections 9 and 10, and 17 and 18.",
  case2Connections: "Connect the voltage source 17 to 19, 18 to 20 and keep the current source terminals open.",
  case2Verified: "Connections verified successfully. Now switch ON the voltage source for this case and set the required voltage value.",
  voltageValueSet: "The readings are displayed on the ammeters. Now, click on the add button to add the readings to the observation table.",
  case2ReadingAdded: "Readings added to the observation table. Now turn OFF the voltage source and connect the current source 1 to 9 and 2 to 10.",
  case3Verified: "Connections verified successfully. Now turn ON both the sources.",
  bothSourcesOn: "The readings are displayed on the ammeters. Now, click on the add button to add the readings to the observation table.",
  case3ReadingAdded: "Final readings added to the observation table. Now click on the Calculate button to manually verify the theorem.",
  calculateClicked: "The observed branch currents are displayed in the Calculation Panel. Calculate the branch currents manually using the Superposition Theorem, enter the calculated values in the input fields, and click the Verify button to verify the theorem.",
  addBeforeCheck: "Please check the connections or complete the current source case.",
  reset: "The simulation has been reset. You can start again.",
  print: "Opening the print dialog.",
  report: "Your report has been generated successfully. Click OK to view your report.",
  wrongConnection: "This connection is wrong. Connect point 1 to point 9.",
  multipleWrongConnections: "Some connections are wrong.",
}

export const AI_GUIDE_STEP_MESSAGES = {
  resistance: 'First, set the values of R1, R2 and R3 using the resistance sliders.',
  'case1-connections': 'Make the connections for Case 1. Connect point 1 to point 9, point 2 to point 10, short point 17 to point 18, and keep the ammeter connections as shown.',
  'case1-check': 'Now click the CHECK button to verify the Case 1 connections.',
  'case1-turn-on-current': 'Switch ON the current source only and keep the voltage source OFF.',
  'case1-set-current': 'Set the required current value using the current source slider.',
  'case1-add-reading': 'The readings are displayed on the ammeters. Click ADD to save the readings for Current Source Only.',
  'case1-turn-off-current': 'Turn OFF the current source and remove the required connections before moving to Case 2.',
  'case1-remove-connections':
  'Turn OFF the current source and remove connections 1 to 9, 2 to 10 and 17 to 18 before proceeding to Case 2.',
  'case2-connections':
  'Connect the voltage source from 17 to 19 and 18 to 20. Keep the current source terminals open and keep the ammeter connections same.',
  'case2-check': 'Now click the CHECK button to verify the Case 2 connections.',
  'case2-turn-on-voltage': 'Switch ON the voltage source only and keep the current source OFF.',
  'case2-set-voltage': 'Set the required voltage value using the voltage source slider.',
  'case2-add-reading': 'The readings are displayed on the ammeters. Click ADD to save the readings for Voltage Source Only.',
  'case2-turn-off-voltage': 'Turn OFF the voltage source before moving to Case 3.',
  'case3-connections': 'For Case 3, connect the current source from 1 to 9 and 2 to 10. Keep the voltage source and ammeter connections same.',
  'case3-check': 'Now click the CHECK button to verify the Case 3 connections.',
  'case3-turn-on-both': 'Turn ON both the current source and voltage source.',
  'case3-add-reading': 'The readings are displayed on the ammeters. Click ADD to save the readings for Both Sources Connected.',
  'calculate-button': 'Click the CALCULATE button to fill the calculation panel using the observed values.',
  calculation: 'Calculate the branch currents manually using the Superposition Theorem, enter the values, and click VERIFY.',
  verified: 'The theorem is verified. Click RESET if you want to start again.',
}

export const speakGuideMessage = (text) => {
  if (!text || typeof window === 'undefined' || !window.speechSynthesis) {
    return
  }

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.95
  utterance.pitch = 1
  utterance.volume = 1

  window.speechSynthesis.speak(utterance)
}