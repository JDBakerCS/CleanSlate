import getCategoryColor from "../utils/getCategoryColor";

function CategoryCard({
    category,
    isAccepting,
    isTrashing,
    actionsDisabled,
    onAccept,
    onReview,
    onTrash,
}) {

    const isCompleted = category.status === "completed";
    const decisionButtonsDisabled = actionsDisabled || isCompleted;

    return (
        <article
            className={`category-card category-theme category-theme--${category.id}`}
            style={{
                "--category-color": getCategoryColor(category.label),
            }}
        >
            <div className="category-card__heading">
                <span className="category-card__label">
                    {category.label}
                </span>

                <span className="category-card__count">
                    <strong>{category.emailCount}</strong> emails
                    {" · "}
                    {category.conversationCount}{" "}
                    {category.conversationCount === 1
                        ? "conversation"
                        : "conversations"}
                </span>
            </div>

            <h3>{category.label}</h3>
            <p>{category.description}</p>

            <div className="category-card__actions">
                <button
                    type="button"
                    className="accept-btn"
                    disabled={decisionButtonsDisabled}
                    onClick={() => onAccept(category.id)}
                >
                    {category.decision === "accepted"
                        ? "Accepted"
                        : isAccepting
                            ? "Accepting..."
                            : "Accept"}
                </button>

                <button
                    type="button"
                    className="review-btn"
                    onClick={() => onReview(category.id)}
                >
                    Review
                </button>

                <button
                    type="button"
                    className="trash-btn"
                    disabled={decisionButtonsDisabled}
                    onClick={() => onTrash(category.id)}
                >
                    {category.decision === "trashed"
                        ? "Trashed"
                        : isTrashing
                            ? "Trashing..."
                            : "Trash all"}
                </button>
            </div>
        </article>
    )
}
export default CategoryCard;
