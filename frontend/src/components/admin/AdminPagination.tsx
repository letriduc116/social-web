type AdminPaginationProps = {
  page: number;
  totalPages?: number;
  totalElements?: number;
  loading?: boolean;
  onChangePage: (page: number) => void;
};

function AdminPagination({ page, totalPages = 0, totalElements = 0, loading = false, onChangePage }: AdminPaginationProps) {
  const currentPage = page + 1;
  const safeTotalPages = Math.max(totalPages || 1, 1);

  return (
    <div className="admin-pagination">
      <span>Trang {currentPage}/{safeTotalPages} · {totalElements || 0} kết quả</span>
      <div>
        <button type="button" className="admin-btn admin-btn--light" disabled={loading || page <= 0} onClick={() => onChangePage(page - 1)}>
          Trước
        </button>
        <button type="button" className="admin-btn admin-btn--light" disabled={loading || page >= safeTotalPages - 1} onClick={() => onChangePage(page + 1)}>
          Sau
        </button>
      </div>
    </div>
  );
}

export default AdminPagination;
