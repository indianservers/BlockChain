import { Pause, Play, RefreshCw, SkipBack, SkipForward } from "lucide-react";

export default function StepControls({ currentStep, totalSteps, isAutoPlaying, onNext, onPrevious, onAutoPlay, onPause, onReset }) {
  return (
    <div className="flex flex-wrap gap-3">
      <button type="button" onClick={onPrevious} disabled={currentStep === 0} className="btn-secondary disabled:cursor-not-allowed disabled:opacity-45">
        <SkipBack size={18} /> Previous Step
      </button>
      <button type="button" onClick={onNext} disabled={currentStep === totalSteps - 1} className="btn-primary disabled:cursor-not-allowed disabled:opacity-45">
        Next Step <SkipForward size={18} />
      </button>
      {isAutoPlaying ? (
        <button type="button" onClick={onPause} className="btn-secondary">
          <Pause size={18} /> Pause
        </button>
      ) : (
        <button type="button" onClick={onAutoPlay} className="btn-secondary">
          <Play size={18} /> Auto Play
        </button>
      )}
      <button type="button" onClick={onReset} className="btn-secondary">
        <RefreshCw size={18} /> Reset
      </button>
    </div>
  );
}
