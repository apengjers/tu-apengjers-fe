// ProductForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductForm = ({ initialData = {}, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    imageUrl: '',
    description: '',
    ...initialData,
  });

  const isEditing = !!initialData._id;

  useEffect(() => {
    setFormData({ ...formData, ...initialData });
  }, [initialData]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`/api/products/${initialData._id}`, formData);
      } else {
        await axios.post('/api/products', formData);
      }
      onSuccess();
    } catch (err) {
      console.error('Gagal simpan produk:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 border rounded space-y-3 mt-4">
      <input type="text" name="name" placeholder="Nama" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded" />
      <input type="number" name="price" placeholder="Harga" value={formData.price} onChange={handleChange} required className="w-full p-2 border rounded" />
      <input type="text" name="category" placeholder="Kategori" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded" />
      <input type="text" name="imageUrl" placeholder="URL Gambar" value={formData.imageUrl} onChange={handleChange} className="w-full p-2 border rounded" />
      <textarea name="description" placeholder="Deskripsi" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded" />
      <div className="flex space-x-2">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {isEditing ? 'Update' : 'Tambah'}
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-300 px-4 py-2 rounded">Batal</button>
      </div>
    </form>
  );
};

export default ProductForm;
