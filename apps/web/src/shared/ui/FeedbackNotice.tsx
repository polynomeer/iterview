type FeedbackNoticeProps = {
  message: string;
  tone: "success" | "error" | "info";
  details?: string[];
};

export function FeedbackNotice({ message, tone, details = [] }: FeedbackNoticeProps) {
  return (
    <div className={`feedback-notice feedback-notice--${tone}`}>
      <p className="feedback-notice__message">{message}</p>
      {details.length > 0 ? (
        <ul className="feedback-notice__details">
          {details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
