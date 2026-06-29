import { useState } from "react"
import { ChevronDown, HelpCircle, ArrowRight } from "lucide-react"

function FAQ() {
  const [open, setOpen] = useState(null)

  const faqs = [
    {
      q: "Is Tipia officially launched yet? How can I get it?",
      a: "The full version of Tipia is not officially out yet, as we are currently carrying out deep ground research directly with pharmacy owners to ensure we build a perfectly suitable system for local retail realities. \n\nHowever, you do not have to wait! We have launched a completely Free Live Demo right here on the website so you can test our offline first core layout, record trial sales, and see how the dashboard functions while we refine the product based on real pharmacy feedback."
    },
    {
      q: "How exactly does this app stop my pharmacy from losing money?",
      a: "Most losses in Nigerian pharmacies happen silently, such as drugs expiring unnoticed on the shelf, staff selling a sachet but forgetting to write it down, or the manual record book not matching the physical stock.\n\nTipia updates your stock the exact second a sale happens. Because it tracks expiry dates and batches, you always know which drugs to sell first, completely stopping hidden financial leaks and stock shortages."
    },
    {
      q: "How is this different from using an exercise book or traditional desktop POS?",
      a: "Exercise books get lost, torn, or filled with counting mistakes. Old desktop POS systems are too slow during rush hour, do not track drug expiry dates properly, and stop working completely the moment the power goes out.\n\nTipia is built mobile friendly and operates offline first. It actively prevents human errors, like warning you before a drug finishes or stopping staff from accidentally selling an item that is out of stock."
    },
    {
      q: "Can it handle splitting full drug cartons into packets, cards, or single tablets?",
      a: "Yes, absolutely! We know pharmacies rarely sell just full packs. The system allows you to break down boxes into packets or individual tablets.\n\nWhether you are selling a whole carton of Paracetamol or just two individual sachets, the app calculates the exact remaining balance correctly without mixing up your main inventory counts."
    },
    {
      q: "What happens if there is zero internet network or the power goes out?",
      a: "You do not need to worry about bad network or turning on the generator just to check stock. The app is built completely offline first.\n\nYou can keep scanning barcodes, tracking batches, and selling drugs even with zero internet. The moment your phone or tablet catches a network connection again, it automatically syncs all your transaction data safely to the cloud."
    },
    {
      q: "Can my salesgirls or apprentices use it easily without making mistakes?",
      a: "Yes, it is extremely simple. If they know how to send messages on WhatsApp, they can use Tipia. There are no complicated accounting terms.\n\nThe layout is clean and straightforward. Staff can quickly search for a drug or scan its barcode to sell it, making it effortless for anyone to use during busy rush hours without causing inventory errors."
    },
    {
      q: "Can I monitor my shop from home or when I go to the wholesale market?",
      a: "Absolutely. You do not need to be physically inside the pharmacy to know exactly what is happening. \n\nAs the owner, you can log in securely from your phone anywhere, whether you are at home or resting, to see real time daily sales, check current cash flow, and know exactly what needs to be restocked before you visit the wholesale market."
    },
    {
      q: "How secure is my data? Can staff change past sales figures?",
      a: "Your records are safe and fully protected. Staff cannot delete or alter past sales records to hide missing cash or cover up discrepancies.\n\nThe system keeps a strict, unchangeable audit history of who did what and when. With advanced user roles, you can give staff permission to only sell drugs while keeping your cost prices, total profits, and supplier details completely private to you."
    }
  ]

  return (
    <section className="faq-section" style={{ padding: "60px 20px", background: "transparent" }}>
      
      {/* SECTION HEADER */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#2563eb", fontSize: "14px", fontWeight: "600", textTransform: "uppercase", tracking: "0.05em", marginBottom: "12px" }}>
          <HelpCircle size={16} /> Got Questions?
        </div>
        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#f8fafc", marginBottom: "12px" }}>
          Frequently Asked Questions
        </h2>
        <p style={{ color: "#64748b", maxWidth: "550px", margin: "auto", fontSize: "15px", lineHeight: "1.5" }}>
          Everything you need to know about how Tipia handles offline tracking, drug splitting, and business safety.
        </p>
      </div>

      {/* ACCORDION CONTENT PANEL */}
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        {faqs.map((item, i) => {
          const isOpened = open === i
          return (
            <div
              key={i}
              className="faq-card"
              onClick={() => setOpen(isOpened ? null : i)}
              style={{ 
                cursor: "pointer", 
                marginBottom: "12px",
                background: "#0f172a",
                border: isOpened ? "1px solid #2563eb" : "1px solid #1e293b",
                borderRadius: "8px",
                padding: "16px 20px",
                transition: "all 0.2s ease"
              }}
            >
              {/* ACCORDION TRIGGER */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "600", color: isOpened ? "#addfff" : "#f1f5f9", margin: 0, lineHeight: "1.4" }}>
                  {item.q}
                </h3>
                <ChevronDown 
                  size={18} 
                  style={{ 
                    color: isOpened ? "#2563eb" : "#475569", 
                    transform: isOpened ? "rotate(180deg)" : "rotate(0deg)", 
                    transition: "transform 0.2s ease",
                    flexShrink: 0
                  }} 
                />
              </div>

              {/* ACCORDION ANSWER WINDOW */}
              {isOpened && (
                <div style={{ marginTop: "12px", borderTop: "1px solid #1e293b", paddingTop: "12px" }}>
                  <p className="faq-answer" style={{ whiteSpace: "pre-line", fontSize: "14px", color: "#94a3b8", lineHeight: "1.6", margin: 0 }}>
                    {item.a}
                  </p>
                  
                  {/* CONTEXTUAL ACTION BUTTON ON THE INITIAL QUESTION */}
                  {i === 0 && (
                    <a 
                      href="/demo" 
                      onClick={(e) => e.stopPropagation()} 
                      style={{ 
                        display: "inline-flex", 
                        alignItems: "center", 
                        gap: "6px", 
                        marginTop: "14px", 
                        background: "rgba(37, 99, 235, 0.1)", 
                        color: "#addfff", 
                        padding: "6px 12px", 
                        borderRadius: "6px", 
                        fontSize: "13px", 
                        fontWeight: "500", 
                        textDecoration: "none",
                        border: "1px solid rgba(37, 99, 235, 0.2)"
                      }}
                    >
                      Launch the Free Demo <ArrowRight size={14} />
                    </a>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

    </section>
  )
}

export default FAQ