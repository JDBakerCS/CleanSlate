import { useState } from "react";
import Pagination from "./Pagination";
import EmailListItem from "./EmailListItem";
import "../styles/CategoryDetails.css";
import getCategoryColor from "../utils/getCategoryColor";


const conversationsPerPage = 20;



function CategoryDetails({
    category,
    conversations,
    onBack,
    onSelectedAction,
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedConversationIds, setSelectedConversationIds] = useState(new Set());
    const [pendingAction, setPendingAction] = useState(null);
    const [actionError, setActionError] = useState("");

    if (!category) {
        return null;
    }

    const totalPages = Math.ceil(
        conversations.length / conversationsPerPage
    );

    const firstConversationIndex =
        (currentPage - 1) * conversationsPerPage;

    const lastConversationIndex =
        firstConversationIndex + conversationsPerPage;

    const visibleConversations = conversations.slice(
        firstConversationIndex,
        lastConversationIndex
    );

    const firstDisplayedConversation =
        conversations.length === 0
            ? 0
            : firstConversationIndex + 1;

    const lastDisplayedConversation = Math.min(
        lastConversationIndex,
        conversations.length
    );


    function handleToggleConversation(conversationId) {
        setSelectedConversationIds((currentIds) => {
            const updatedIds = new Set(currentIds);

            if (updatedIds.has(conversationId)) {
                updatedIds.delete(conversationId);
            } else {
                updatedIds.add(conversationId);
            }

            return updatedIds;
        });
    }
    const allConversationsSelected =
        conversations.length > 0 &&
        conversations.every((conversation) =>
            selectedConversationIds.has(conversation.id)
        );

    function handleSelectAll() {
        if (allConversationsSelected) {
            setSelectedConversationIds(new Set());
        } else {
            setSelectedConversationIds(
                new Set(
                    conversations.map(
                        (conversation) => conversation.id
                    )
                )
            );
        }
    }
    async function handleSelectedAction(action) {
        const selectedIds = Array.from(selectedConversationIds);

        setPendingAction(action);
        setActionError("");

        try {
            await onSelectedAction(action, selectedIds);
            setSelectedConversationIds(new Set());
            setCurrentPage(1);
        } catch (error) {
            console.error(`Could not ${action} selected conversations:`, error);
            setActionError(
                error instanceof Error
                    ? error.message
                    : "Could not update the selected conversations."
            );
        } finally {
            setPendingAction(null);
        }
    }


    return (
        <section
            className={`category-details category-theme category-theme--${category.id}`}
            style={{
                "--category-color": getCategoryColor(category.label),
            }}
            aria-labelledby="category-details-title"
        >
            <div className="category-details__actions">

                <button
                    type="button"
                    className="back-btn"
                    onClick={onBack}
                >
                    Back to summary
                </button>

                <div className="selected-actions">
                    <button
                        type="button"
                        className="accept-selected-btn"
                        disabled={
                            selectedConversationIds.size === 0 ||
                            pendingAction !== null
                        }
                        onClick={() => handleSelectedAction("accept")}
                    >
                        {pendingAction === "accept" ? "Accepting..." : "Accept"}
                    </button>
                    <button
                        type="button"
                        className="keep-selected-btn"
                        disabled={
                            selectedConversationIds.size === 0 ||
                            pendingAction !== null
                        }
                        onClick={() => handleSelectedAction("keep")}
                    >
                        {pendingAction === "keep" ? "Keeping..." : "Keep in inbox"}
                    </button>
                    <button
                        type="button"
                        className="trash-selected-btn"
                        disabled={
                            selectedConversationIds.size === 0 ||
                            pendingAction !== null
                        }
                        onClick={() => handleSelectedAction("trash")}
                    >
                        {pendingAction === "trash" ? "Moving..." : "Trash"}
                    </button>
                </div>
            </div>

            {actionError && (
                <p className="action-error" role="alert">
                    {actionError}
                </p>
            )}

            <header className="category-details__header">
                <h2 id="category-details-title">
                    {category.label}
                </h2>

                <strong>
                    Showing {firstDisplayedConversation}-
                    {lastDisplayedConversation} of{" "}
                    {conversations.length}{" "}
                    {conversations.length === 1
                        ? "conversation"
                        : "conversations"}
                </strong>

                <p className="category-details__email-total">
                    {category.emailCount}{" "}
                    {category.emailCount === 1 ? "email" : "emails"}
                    {" "}in this category
                </p>
            </header>


            <div className="selection-toolbar">
                <label>
                    <input
                        type="checkbox"
                        checked={allConversationsSelected}
                        onChange={handleSelectAll}
                    />
                    Select all conversations
                </label>

                <span>
                    {selectedConversationIds.size}{" "}
                    {selectedConversationIds.size === 1
                        ? "conversation"
                        : "conversations"}{" "}
                    selected
                </span>
            </div>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
            <ul className="email-list">
                {visibleConversations.map((conversation) => (
                    <EmailListItem
                        key={conversation.id}
                        conversation={conversation}
                        isSelected={selectedConversationIds.has(
                            conversation.id
                        )}
                        onToggleSelected={handleToggleConversation}
                    />
                ))}
            </ul>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </section>
    );
}

export default CategoryDetails;
