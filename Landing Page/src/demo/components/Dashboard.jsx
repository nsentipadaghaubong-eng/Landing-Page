import {
  AlertTriangle,
  Boxes,
  PackageCheck,
  TrendingUp
} from "lucide-react"

function Dashboard({ products, salesLog }) {

  const lowStockItems =
    products.filter(item => item.stock < 5)

  const totalStock =
    products.reduce(
      (acc, item) => acc + item.stock,
      0
    )

  const totalSales =
    salesLog.reduce(
      (acc, sale) => acc + sale.quantity,
      0
    )

  return (

    <div className="dashboard-grid">

      {/* LOW STOCK */}
      <div className="panel">

        <div className="panel-title">

          <AlertTriangle size={18} />

          <h3>Low Stock Alerts</h3>

        </div>

        {

          lowStockItems.length === 0

            ?

            <p>
              All products are healthy
            </p>

            :

            lowStockItems.map(item => (

              <div
                key={item.id}
                className="low-item"
              >

                <span>{item.name}</span>

                <span className="danger">
                  {item.stock} left
                </span>

              </div>

            ))

        }

      </div>

      {/* TOTAL PRODUCTS */}
      <div className="panel stat-panel">

        <PackageCheck size={22} />

        <p>Total Products</p>

        <h2>{products.length}</h2>

      </div>

      {/* TOTAL STOCK */}
      <div className="panel stat-panel">

        <Boxes size={22} />

        <p>Total Inventory</p>

        <h2>{totalStock}</h2>

      </div>

      {/* TOTAL SALES */}
      <div className="panel stat-panel">

        <TrendingUp size={22} />

        <p>Total Sales</p>

        <h2>{totalSales}</h2>

      </div>

    </div>

  )

}

export default Dashboard