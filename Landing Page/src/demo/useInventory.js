import { useState } from "react";

export default function useInventory() {
  const [products, setProducts] = useState([]);

  function addProduct(name, price, stock) {
    const newProduct = {
      id: Date.now(),
      name,
      price: Number(price),
      stock: Number(stock),
    };

    setProducts((prev) => [...prev, newProduct]);
  }

  function sellProduct(id) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id && p.stock > 0
          ? { ...p, stock: p.stock - 1 }
          : p
      )
    );
  }

  function deleteProduct(id) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  return {
    products,
    addProduct,
    sellProduct,
    deleteProduct,
  };
}