import { AnimatePresence, motion } from 'framer-motion'

import { useWalkthrough } from '../useWalkthrough.js'
import Spotlight from './Spotlight.jsx'
import WalkthroughPopup from './WalkthroughPopup.jsx'

const WalkthroughOverlay = () => {
  const {
  activeStep,
  canGoNext,
  canGoPrevious,
  close,
  currentStep,
  isOpen,
  isPositioningTarget,
  next,
  previous,
  targetRect,
  totalSteps,
  isAudioPlaying,
  skip,
  toggleStepAudio,
} = useWalkthrough()
  return (
    <AnimatePresence>
      {isOpen && activeStep ? (
        <motion.div
          aria-live="polite"
          className="walkthrough-layer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div aria-hidden="true" className="walkthrough-interaction-shield" />
          <Spotlight rect={isPositioningTarget ? null : targetRect} />
          <AnimatePresence mode="wait">
            {!isPositioningTarget ? (
              <WalkthroughPopup
                activeStep={activeStep}
                canGoNext={canGoNext}
                canGoPrevious={canGoPrevious}
                currentStep={currentStep}
                key={activeStep.id}
                onClose={close}
                onNext={next}
                onPrevious={previous}
                targetRect={targetRect}
                totalSteps={totalSteps}
                isAudioPlaying={isAudioPlaying}
  onSkip={skip}
  onToggleAudio={toggleStepAudio}
              />
            ) : null}
          </AnimatePresence>
          <span className="sr-only">
            Step {currentStep} of {totalSteps}: {activeStep.title}
          </span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export default WalkthroughOverlay
