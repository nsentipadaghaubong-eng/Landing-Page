import {
  AlertTriangle,
  PackageX,
  ClipboardX,
  EyeOff,
  TrendingDown,
  Receipt,
  Clock,
  Users,
  DollarSign,
  Activity
} from "lucide-react"

function ProblemSection() {
  const problems = [
    {
      icon: <PackageX />,
      title: "Missing Drugs & Shortages",
      desc: "What is written in the exercise book doesn't match what is on the shelf. Drugs go missing, and it is hard to trace."
    },
    {
      icon: <AlertTriangle />,
      title: "Expired Drugs & Wastage",
      desc: "Drugs expire on the shelf because there is no system to remind staff to sell the older batches first, wasting your money."
    },
    {
      icon: <ClipboardX />,
      title: "Mistakes from Record Books",
      desc: "Relying on pen, paper, and big notebooks causes counting mistakes that scatter your whole inventory."
    },
    {
      icon: <EyeOff />,
      title: "Blind Spots for the Boss",
      desc: "If you are not physically inside the pharmacy, you have no idea what is being sold or what is running out."
    },
    {
      icon: <TrendingDown />,
      title: "Silent Profit Leaks",
      desc: "Unrecorded sales, missing items, and staff errors slowly eat away your daily profit without you even noticing."
    },
    {
      icon: <Receipt />,
      title: "Unbalanced Daily Sales",
      desc: "Staff sell drugs but forget to write it down, making it a serious headache to balance cash at closing time."
    },
    {
      icon: <Clock />,
      title: "Late Stock Updates",
      desc: "Waiting until the end of the day to update stock means you are always guessing what is available during rush hour."
    },
    {
      icon: <Users />,
      title: "Shift Handover Confusion",
      desc: "Morning and night shift staff get confused. One person sells a drug, and the next person doesn't know it's finished."
    },
    {
      icon: <DollarSign />,
      title: "Trapped Capital",
      desc: "Buying too much of the drugs people rarely ask for, tying down your money while your fast-moving drugs run out."
    },
    {
      icon: <Activity />,
      title: "Guesswork in the Market",
      desc: "Going to the wholesale market to restock based on guesswork instead of knowing exactly what your customers buy the most."
    }
  ]

  return (
    <section className="section">
      <h2>Problems We Solve</h2>

      <div className="cards">
        {problems.map((p, i) => (
          <div className="card serious-card" key={i}>
            <div className="icon">{p.icon}</div>
            <h3>{p.title}</h3>
            <p>{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ProblemSection