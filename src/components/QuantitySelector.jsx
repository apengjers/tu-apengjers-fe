import { FiMinus, FiPlus } from "react-icons/fi";

export default function QuantitySelector({ quantity, onChange, max = 99, helperText }) {
  const safeMax = Math.max(1, Number(max) || 99);

  return (
    <div>
      <span className="mb-2 block text-xs font-extrabold text-slate-800">Jumlah pembelian</span>
      <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
          aria-label="Kurangi jumlah"
          className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
        ><FiMinus aria-hidden="true" /></button>
        <output aria-live="polite" className="min-w-12 px-2 text-center text-sm font-extrabold text-slate-900">{quantity}</output>
        <button
          type="button"
          onClick={() => onChange(Math.min(safeMax, quantity + 1))}
          disabled={quantity >= safeMax}
          aria-label="Tambah jumlah"
          className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
        ><FiPlus aria-hidden="true" /></button>
      </div>
      {helperText && <p className="mt-2 text-[10px] leading-4 text-slate-500">{helperText}</p>}
    </div>
  );
}
