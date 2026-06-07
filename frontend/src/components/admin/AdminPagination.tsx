type AdminPaginationProps = {
  page: number;
  totalPages: number;
  totalElements: number;
  loading?: boolean;
  onChangePage: (page: number) => void;
};

function AdminPagination({ page, totalPages, totalElements, loading = false, onChangePage }: AdminPaginationProps) {
  const safeTotalPages = Math.max(totalPages || 0, 1);

  return (
    <div className="admin-pagination">
      <span>
        Trang {page + 1}/{safeTotalPages} · {totalElements} kết quả
      </span>
      <div>
        <button
          type="button"
          className="admin-btn admin-btn--light"
          disabled={loading || page <= 0}
          onClick={() => onChangePage(page - 1)}
        >
          Trước
        </button>
        <button
          type="button"
          className="admin-btn admin-btn--light"
          disabled={loading || page + 1 >= safeTotalPages}
          onClick={() => onChangePage(page + 1)}
        >
          Sau
        </button>
      </div>
    </div>
  );
}

export default AdminPagination;
