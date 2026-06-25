import {
  Activity,
  ShieldCheck,
  Receipt,
  History,
  BarChart3,
  Package,
  AlertTriangle,
  RefreshCw,
  Eye,
  Users
} from "lucide-react"

function Features() {
  const features = [
    {
      icon: <Activity />,
      title: "Instant Stock Updates",
      desc: "The moment a drug is sold, it is immediately deducted from your total stock. No delays."
    },
    {
      icon: <ShieldCheck />,
      title: "No Ghost Inventory",
      desc: "The system prevents your staff from selling drugs that are completely finished on the shelf."
    },
    {
      icon: <Receipt />,
      title: "Clear Sales Logging",
      desc: "Every single transaction is locked in. You see exactly what went out and the cash that came in."
    },
    {
      icon: <History />,
      title: "Staff Accountability History",
      desc: "Track every single adjustment. See exactly which staff member added stock, changed prices, or made a sale."
    },
    {
      icon: <BarChart3 />,
      title: "Profit & Performance Insights",
      desc: "See your top-selling drugs, know your daily revenue, and understand how your pharmacy is performing."
    },
    {
      icon: <Package />,
      title: "Packs & Tablets Splitting",
      desc: "Easily track single tablets, sachets, or full cartons without your inventory numbers getting scattered."
    },
    {
      icon: <AlertTriangle />,
      title: "Expiry & Low Stock Alerts",
      desc: "Get warned before fast-moving drugs finish or older drug batches expire on the shelves."
    },
    {
      icon: <RefreshCw />,
      title: "Automatic Data Sync",
      desc: "Keeps your records accurate across all screens, preventing mistakes during fast-paced rush hours."
    },
    {
      icon: <Eye />,
      title: "Remote Pharmacy Monitoring",
      desc: "Check your active stock levels, sales, and alerts from anywhere, even if you are not in the shop."
    },
    {
      icon: <Users />,
      title: "Smooth Shift Handovers",
      desc: "Allows different staff members to manage sales and inventory across morning and night shifts without confusion."
    }
  ]

  return (
    <section className="section">
      <h2>Powerful Features Built for Modern Pharmacies</h2>

      <div className="cards">
        {features.map((f, i) => (
          <div className="card feature-card" key={i}>

            <div className="feature-icon">
              {f.icon}
            </div>

            <h3>{f.title}</h3>

            <p>{f.desc}</p>

          </div>
        ))}
      </div>
    </section>
  )
}

export default Features