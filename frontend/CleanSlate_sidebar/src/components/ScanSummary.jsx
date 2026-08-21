import '../styles/ScanSummary.css';
import CategoryCard from './CategoryCard';

function ScanSummary({
  summary,
  pendingCategoryId,
  pendingCategoryAction,
  onBack,
  onAcceptCategory,
  onReviewCategory,
  onTrashCategory,
}) {
  return (
    <section
      className='scan-summary'
      aria-labelledby='scan-summary-title'
    >
      <div className='scan-summary__header'>
        <span className='scan-summary__status'>
          Scan complete
        </span>

        <h2 id='scan-summary-title'>
          <strong>{summary.emailCount}</strong> emails scanned
        </h2>

        <p className='scan-summary__conversation-count'>
          Across {summary.conversationCount}{' '}
          {summary.conversationCount === 1
            ? 'conversation'
            : 'conversations'}
        </p>

        <p>
          Sorted into {summary.categories.length} categories.
          Review each category before deciding what happens next.
        </p>

        {summary.protectedCount > 0 && (
          <p className='protected-count'>
            {summary.protectedCount} emails from protected senders
            were safely skipped.
          </p>
        )}
      </div>

      <div className='category-list'>
        {summary.categories.map((category) => (
          <CategoryCard
            key={category.id}
            isAccepting={
              pendingCategoryId === category.id &&
              pendingCategoryAction === 'accept'
            }
            isTrashing={
              pendingCategoryId === category.id &&
              pendingCategoryAction === 'trash'
            }
            actionsDisabled={pendingCategoryId !== null}
            category={category}
            onAccept={onAcceptCategory}
            onReview={onReviewCategory}
            onTrash={onTrashCategory}
          />
        ))}
      </div>

      <button
        type='button'
        className='back-btn'
        onClick={onBack}
      >
        Back
      </button>
    </section>
  );
}

export default ScanSummary;
