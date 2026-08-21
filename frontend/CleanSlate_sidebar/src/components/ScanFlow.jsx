import { useEffect, useState } from "react";
import HeroIntro from "./HeroIntro";
import ScanCard from "./ScanCard";
import ScanSummary from "./ScanSummary";
import scanInbox from "../services/scanInbox";
import CategoryDetails from "./CategoryDetails";
import {
    acceptCategory,
    trashCategory,
    acceptSelectedConversations,
    keepSelectedConversations,
    trashSelectedConversations,
} from "../services/categoryActions";


const scanStages = [
    "Preparing your inbox...",
    "Skipping protected senders...",
    "Applying cleanup filters...",
    "Classifying emails...",
    "Building your summary...",
    "Still working - larger inboxes may take a moment...",
    "Patience is a virtue..."
];
function ScanFlow() {
    const [scanStatus, setScanStatus] = useState("idle");
    const [currentView, setCurrentView] = useState("scanner")
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [scanStageIndex, setScanStageIndex] = useState(0);
    const [scanResults, setScanResults] = useState(null);
    const [scanError, setScanError] = useState("");
    const [pendingCategoryId, setPendingCategoryId] = useState(null);
    const [pendingCategoryAction, setPendingCategoryAction] = useState(null);

    async function handleScan() {
        setCurrentView("scanner");
        setSelectedCategoryId(null);
        setScanStageIndex(0);
        setScanResults(null);
        setScanError("");
        setScanStatus("scanning");

        try {
            const nextScanResults = await scanInbox();

            setScanResults(nextScanResults);
            setScanStatus("completed");
        } catch (error) {
            console.error("Could not scan inbox:", error);
            setScanError(
                error instanceof Error
                    ? error.message
                    : "Could not scan the inbox."
            );
            setScanStatus("error");
        }
    }
    function handleShowSummary() {
        setCurrentView("summary");
    }
    function handleBackToScanner() {
        setCurrentView("scanner");
    }
    function handleReviewCategory(categoryId) {
        setSelectedCategoryId(categoryId);
        setCurrentView("details");
    }
    function handleBackToSummary() {
        setCurrentView("summary");
    }

    //finds the matching id in categories with the matching categoryId
    async function handleAcceptCategory(categoryId) {
        const category = scanResults?.categories.find(
            (item) => item.id === categoryId
        );
        //sanity check
        if (!category || scanResults?.runId == null) {
            console.error("Missing category or scan run ID.");
            return;
        }
        setPendingCategoryId(categoryId);
        setPendingCategoryAction("accept");

        try {
            const result = await acceptCategory(
                scanResults.runId,
                category.label
            );
            setScanResults((currentResults) => {
                if (!currentResults) {
                    return currentResults;
                }

                return {
                    ...currentResults,
                    categories: currentResults.categories.map(
                        (currentCategory) =>
                            currentCategory.id === categoryId
                                ? {
                                    ...currentCategory,
                                    status: result.status,
                                    existingLabelId:
                                        result.existingLabelId,
                                    decision: "accepted",
                                }
                                : currentCategory
                    ),
                };
            });
            console.log("Category accepted:", result);
        } catch (error) {
            console.error("Could not accept category:", error);
        } finally {
            setPendingCategoryId(null);
            setPendingCategoryAction(null);
        }
    }

    async function handleTrashCategory(categoryId) {
        const category = scanResults?.categories.find(
            (item) => item.id === categoryId
        );

        if (!category || scanResults?.runId == null) {
            console.error("Missing category or scan run ID.");
            return;
        }

        setPendingCategoryId(categoryId);
        setPendingCategoryAction("trash");

        try {
            await trashCategory(
                scanResults.runId,
                category.label
            );

            setScanResults((currentResults) => {
                if (!currentResults) {
                    return currentResults;
                }

                return {
                    ...currentResults,
                    categories: currentResults.categories.map(
                        (currentCategory) =>
                            currentCategory.id === categoryId
                                ? {
                                    ...currentCategory,
                                    status: "completed",
                                    decision: "trashed",
                                }
                                : currentCategory
                    ),
                };
            });

            console.log("Category moved to trash.");
        } catch (error) {
            console.error("Could not trash category:", error);
        } finally {
            setPendingCategoryId(null);
            setPendingCategoryAction(null);
        }
    }

    async function handleSelectedConversations(action, conversationIds) {
        const category = scanResults?.categories.find(
            (item) => item.id === selectedCategoryId
        );

        if (
            !category ||
            scanResults?.runId == null ||
            conversationIds.length === 0
        ) {
            throw new Error("Missing selected conversations or scan information.");
        }

        const actionRequests = {
            accept: acceptSelectedConversations,
            keep: keepSelectedConversations,
            trash: trashSelectedConversations,
        };
        const actionRequest = actionRequests[action];

        if (!actionRequest) {
            throw new Error("Unknown selected-conversation action.");
        }

        const result = await actionRequest(
            scanResults.runId,
            category.label,
            conversationIds
        );
        const selectedIds = new Set(conversationIds);
        const removesEntireCategory = category.conversations.every(
            (conversation) => selectedIds.has(conversation.id)
        );

        setScanResults((currentResults) => {
            if (!currentResults) {
                return currentResults;
            }

            const updatedCategories = currentResults.categories.flatMap(
                (currentCategory) => {
                    if (currentCategory.id !== category.id) {
                        return [currentCategory];
                    }

                    const remainingConversations =
                        currentCategory.conversations.filter(
                            (conversation) =>
                                !selectedIds.has(conversation.id)
                        );

                    if (remainingConversations.length === 0) {
                        return [];
                    }

                    const remainingEmailCount =
                        remainingConversations.reduce(
                            (total, conversation) =>
                                total + conversation.messageCount,
                            0
                        );

                    return [{
                        ...currentCategory,
                        conversations: remainingConversations,
                        conversationCount: remainingConversations.length,
                        emailCount: remainingEmailCount,
                        existingLabelId:
                            result.existingLabelId ??
                            currentCategory.existingLabelId,
                    }];
                }
            );

            return {
                ...currentResults,
                categories: updatedCategories,
            };
        });

        if (removesEntireCategory) {
            setSelectedCategoryId(null);
            setCurrentView("summary");
        }
    }


    useEffect(() => {
        if (
            scanStatus !== "scanning" ||
            scanStageIndex === scanStages.length - 1
        ) {
            return;
        }

        const scanTimer = setTimeout(() => {
            setScanStageIndex(
                (currentIndex) => currentIndex + 1
            );
        }, 5000);

        return () => clearTimeout(scanTimer);
    }, [scanStatus, scanStageIndex]);

    const selectedCategory = scanResults?.categories.find(
        (category) => category.id === selectedCategoryId
    );

    const selectedConversations =
        selectedCategory?.conversations ?? [];

    return (
        <>
            {currentView === "scanner" && (
                <>
                    <HeroIntro scanStatus={scanStatus} />

                    <ScanCard
                        scanStatus={scanStatus}
                        scanStages={scanStages}
                        scanStageIndex={scanStageIndex}
                        totalScanned={scanResults?.emailCount ?? 0}
                        totalConversations={scanResults?.conversationCount ?? 0}
                        scanError={scanError}
                        onScan={handleScan}
                        onShowSummary={handleShowSummary}
                    />
                </>
            )}

            {currentView === "summary" && (
                <ScanSummary
                    summary={scanResults}
                    pendingCategoryId={pendingCategoryId}
                    pendingCategoryAction={pendingCategoryAction}
                    onBack={handleBackToScanner}
                    onAcceptCategory={handleAcceptCategory}
                    onReviewCategory={handleReviewCategory}
                    onTrashCategory={handleTrashCategory}
                />
            )}

            {currentView === "details" && (
                <CategoryDetails
                    category={selectedCategory}
                    conversations={selectedConversations}
                    onBack={handleBackToSummary}
                    onSelectedAction={handleSelectedConversations}
                />
            )}
        </>
    );
}

export default ScanFlow;
