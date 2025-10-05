// src/pages/AdminProduct.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductForm from '../components/ProductForm';
import ProductTable from '../components/ProductTable';

const fetchProducts = async () => {
  try {
    const res = await axios.get('/api/products');
    console.log('Data API:', res.data);
    const data = Array.isArray(res.data) ? res.data : res.data.products;
    setProducts(data || []);
  } catch (err) {
    console.error('Gagal ambil produk:', err);
    setProducts([]); // fallback aman
  }
};

const AdminProduct = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data.products);
    } catch (err) {
      console.error('Gagal ambil produk:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddClick = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin hapus produk ini?')) {
      try {
        await axios.delete(`/api/products/${id}`);
        fetchProducts();
      } catch (err) {
        console.error('Gagal hapus produk:', err);
      }
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchProducts();
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Admin Produk</h1>
        <button onClick={handleAddClick} className="bg-blue-600 text-white px-4 py-2 rounded">+ Tambah Produk</button>
      </div>

      <ProductTable products={products} onEdit={handleEdit} onDelete={handleDelete} />

      {isFormOpen && (
        <ProductForm
          initialData={selectedProduct}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminProduct;
