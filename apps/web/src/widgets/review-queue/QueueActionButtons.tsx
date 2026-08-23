type QueueActionButtonsProps = {
  onSkip: () => void;
  onDone: () => void;
  disabled?: boolean;
  pendingAction?: "skip" | "done" | null;
};

export function QueueActionButtons({
  onSkip,
  onDone,
  disabled = false,
  pendingAction = null,
}: QueueActionButtonsProps) {
  return (
    <div className="page-card__actions review-queue-action-buttons">
      <button
        className="secondary-button"
        disabled={disabled}
        onClick={onSkip}
        type="button"
      >
        {pendingAction === "skip" ? "Skipping..." : "Skip"}
      </button>
      <button
        className="primary-button"
        disabled={disabled}
        onClick={onDone}
        type="button"
      >
        {pendingAction === "done" ? "Saving..." : "Done"}
      </button>
    </div>
  );
}
