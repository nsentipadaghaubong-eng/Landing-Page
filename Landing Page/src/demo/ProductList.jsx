export default function ProductList({
  products,
  sellProduct,
  deleteProduct,
}) {
  return (
    <div>
      {products.length === 0 && <p>No products yet</p>}

      {products.map((p) => (
        <div
          key={p.id}
          style={{
            border: "1px solid #ccc",
            padding: 10,
            marginBottom: 10,
          }}
        >
          <h3>{p.name}</h3>
          <p>Price: ₦{p.price}</p>
          <p>Stock: {p.stock}</p>

          <button onClick={() => sellProduct(p.id)}>
            Sell
          </button>

          <button onClick={() => deleteProduct(p.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}