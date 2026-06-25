import { useState } from "react"

function FAQ() {
  const [open, setOpen] = useState(null)

  const faqs = [
    {
      q: "How exactly does this app stop my pharmacy from losing money?",
      a: "Most losses in Nigerian pharmacies happen silently—drugs expiring unnoticed on the shelf, staff selling a sachet but forgetting to write it down, or the record book not matching the physical stock.\n\nTipia updates your stock the exact second a sale happens. Because it tracks expiry dates and batches, you always know which drugs to sell first, completely stopping hidden financial leaks and shortages."
    },

    {
      q: "How is this different from using an exercise book or traditional computer POS?",
      a: "Exercise books get lost, torn, or filled with counting mistakes. Old desktop POS systems are too slow during rush hour, don't track drug expiry dates properly, and stop working the moment light (NEPA) goes out.\n\nOur app is built for mobile and works offline. It actively stops mistakes before they happen—like alerting you before a drug finishes or preventing staff from selling out-of-stock items."
    },

    {
      q: "Can it handle splitting full drug cartons into packets, sachets, or single tablets?",
      a: "Yes! We know pharmacies rarely sell just full packs. The system allows you to break down boxes into packets or individual tablets.\n\nWhether you are selling a whole carton of Paracetamol or just two sachets, the app calculates the exact remaining balance correctly without mixing up your inventory."
    },

    {
      q: "What happens if there is no internet network or power goes out?",
      a: "You don't need to worry about bad network or turning on the generator just to check stock. The app is built 'offline-first.'\n\nYou can keep scanning barcodes, tracking batches, and selling drugs even with zero internet. The moment your phone or tablet catches network again, it automatically syncs all your data safely to the cloud."
    },

    {
      q: "Can my salesgirls or apprentices use it easily without mistakes?",
      a: "Yes, it is extremely simple. If they know how to use WhatsApp, they can use this app. There are no complicated accounting terms.\n\nThe layout is clean and straightforward. Staff can quickly search for a drug or scan its barcode to sell it, making it easy for anyone to use during busy hours without causing errors."
    },

    {
      q: "Can I monitor my shop from home or when I go to the wholesale market?",
      a: "Absolutely. You don't need to be physically inside the pharmacy to know what is happening. \n\nAs the owner, you can log in from your phone anywhere—whether you are at home or resting—to see real-time daily sales, check current cash flow, and know exactly what needs to be restocked before you visit the wholesale market."
    },

    {
      q: "How secure is my pharmacy data? Can staff change sales figures?",
      a: "Your records are safe and fully protected. Staff cannot delete or alter past sales records to hide missing cash.\n\nThe system keeps a strict history of who did what and when. With upcoming user roles, you can give staff permission to only sell drugs while keeping your cost prices, total profits, and supplier details completely private to you."
    }
  ]

  return (
    <section className="section">
      <h2>Frequently Asked Questions</h2>

      <div style={{ maxWidth: "750px", margin: "auto" }}>
        {faqs.map((item, i) => (
          <div
            key={i}
            className="faq-card"
            onClick={() => setOpen(open === i ? null : i)}
            style={{ cursor: "pointer", marginBottom: "12px" }}
          >
            <h3 className="faq-question">
              {item.q}
            </h3>

            {open === i && (
              <p className="faq-answer" style={{ whiteSpace: "pre-line", marginTop: "8px" }}>
                {item.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default FAQ