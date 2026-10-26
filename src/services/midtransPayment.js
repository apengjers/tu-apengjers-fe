// src/services/midtransPayment.js
// Both new orders and tracking continue to the same custom checkout.
export async function payOrder(orderCode) {
  window.location.assign(`/pembayaran/${encodeURIComponent(orderCode)}`);
}
