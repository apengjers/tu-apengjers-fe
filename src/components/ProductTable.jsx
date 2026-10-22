import { FiEdit2, FiPackage, FiTrash2 } from "react-icons/fi";

const formatRupiah = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value) || 0);

export default function ProductTable({ products, onEdit, onDelete }) {
  if (!products.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-12 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500"><FiPackage className="h-5 w-5" aria-hidden="true" /></span>
        <h3 className="mt-4 text-sm font-extrabold text-slate-800">Katalog masih kosong</h3>
        <p className="mt-1 text-xs text-slate-500">Tambahkan produk pertama untuk mulai mengisi katalog.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="bg-slate-50 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
          <tr><th className="px-4 py-3">Produk</th><th className="px-4 py-3">Jenis</th><th className="px-4 py-3">Kategori</th><th className="px-4 py-3">Harga</th><th className="px-4 py-3">Stok</th><th className="px-4 py-3 text-right">Aksi</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {products.map((product) => (
            <tr key={product._id} className="hover:bg-slate-50/70">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {product.gambar ? <img src={product.gambar} alt="" className="h-11 w-11 rounded-xl bg-slate-100 object-cover" /> : <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700"><FiPackage aria-hidden="true" /></span>}
                  <div className="min-w-0"><p className="truncate font-bold text-slate-900">{product.nama || "Produk tanpa nama"}</p><p className="mt-0.5 max-w-xs truncate text-xs text-slate-500">{product.deskripsi || "Tanpa deskripsi"}</p></div>
                </div>
              </td>
              <td className="px-4 py-3 text-xs font-semibold text-slate-600">{product.jenis === "gift" ? "Gift Item" : "Produk lain"}</td>
              <td className="px-4 py-3 text-xs text-slate-600">{product.kategori || "—"}</td>
              <td className="px-4 py-3 text-xs font-bold text-slate-800">{formatRupiah(product.harga)}</td>
              <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${Number(product.stok) > 0 ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{Number(product.stok) || 0} tersedia</span></td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => onEdit(product)} aria-label={`Edit ${product.nama}`} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"><FiEdit2 aria-hidden="true" /></button>
                  <button type="button" onClick={() => onDelete(product)} aria-label={`Hapus ${product.nama}`} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"><FiTrash2 aria-hidden="true" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
