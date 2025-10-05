// src/components/Admin/ProductTable.jsx
import React from "react";

const ProductTable = ({ products, onEdit, onDelete }) => {
  return (
    <table className="w-full border mt-6 text-sm">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2 border">#</th>
          <th className="p-2 border">Nama</th>
          <th className="p-2 border">Harga</th>
          <th className="p-2 border">Kategori</th>
          <th className="p-2 border">Gambar</th>
          <th className="p-2 border">Aksi</th>
        </tr>
      </thead>
      <tbody>
        {products.map((p, i) => (
          <tr key={p._id}>
            <td className="p-2 border">{i + 1}</td>
            <td className="p-2 border">{p.name}</td>
            <td className="p-2 border">Rp{p.price.toLocaleString()}</td>
            <td className="p-2 border">{p.category}</td>
            <td className="p-2 border">
              <img src={p.imageUrl} alt={p.name} className="w-12 h-12 object-cover" />
            </td>
            <td className="p-2 border space-x-2">
              <button onClick={() => onEdit(p)} className="bg-yellow-400 text-white px-2 py-1 rounded">Edit</button>
              <button onClick={() => onDelete(p._id)} className="bg-red-500 text-white px-2 py-1 rounded">Hapus</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ProductTable;
