import "../styles/Pagination.css";

function Pagination({
    currentPage,
    totalPages,
    onPageChange,
}) {
    if (totalPages <= 1) {
        return null;
    }

    const pageNumbers = Array.from(
        { length: totalPages },
        (_, index) => index + 1
    );

    return (
        <nav
            className="pagination"
            aria-label="Email list pages"
        >
            <button type="button"
                className="pagination__button"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                Previous
            </button>

            <div className="pagination__numbers">
                {pageNumbers.map((pageNumber) => (
                    <button
                        key={pageNumber}
                        type="button"
                        className="pagination__button"
                        aria-current={
                            currentPage === pageNumber ? "page" : undefined
                        }
                        onClick={() => onPageChange(pageNumber)}
                    >
                        {pageNumber}
                    </button>
                ))}
            </div>
            <button
                type="button"
                className="pagination__button"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                Next
            </button>
        </nav>
    )
}

export default Pagination;
