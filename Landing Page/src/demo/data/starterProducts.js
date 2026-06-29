// src/data/starterProducts.js

const starterProducts = [
  {
    id: 1,
    name: "Emzor Paracetamol (500mg)",
    genericName: "Paracetamol",
    brandName: "Emzor Pharmaceuticals",
    category: "Analgesics",
    targetAgeGroup: "Both",
    bulkPackagingType: "Box",
    unitDispensingType: "Tablet",
    packsReceived: 10,
    unitsPerPack: 96, // e.g., 24 blister strips of 4 tablets per box
    stock: 960,       // Total single tablet units (10 packs * 96 units)
    costPrice: 4200,   // Cost per bulk Box
    price: 50,         // Retail price per single tablet unit (₦50)
    bulkSellingPrice: 4800, // Optional: full box selling price
    batchNo: "EMZ-2026-04A",
    expiryDate: "2028-11-30",
    nafdacNo: "01-0012",
    barcode: "6151100123456",
    variants: [],
    customFields: {},
    notes: "Fast-moving baseline analgesic. Keep stored below 30°C."
  },
  {
    id: 2,
    name: "Lonart DS (Artemether 80mg / Lumefantrine 480mg)",
    genericName: "Artemether + Lumefantrine",
    brandName: "Bliss GVS Pharma",
    category: "Antimalarials",
    targetAgeGroup: "Adult",
    bulkPackagingType: "Pack",
    unitDispensingType: "Tablet",
    packsReceived: 15,
    unitsPerPack: 6,   // 6 tablets per treatment blister pack
    stock: 90,         // Total single units (15 packs * 6 units)
    costPrice: 2800,   // Cost per bulk pack
    price: 3200,       // Retail price per treatment block pack (₦3,200)
    bulkSellingPrice: null,
    batchNo: "LON-9923-B",
    expiryDate: "2027-08-15",
    nafdacNo: "A4-0321",
    barcode: "8906012345678",
    variants: [],
    customFields: {},
    notes: "High demand anti-malarial therapy. Check for presidential malaria control initiative stamps."
  },
  {
    id: 3,
    name: "Amoxil Capsules (500mg)",
    genericName: "Amoxicillin",
    brandName: "GlaxoSmithKline (GSK)",
    category: "Antibiotics",
    targetAgeGroup: "Adult",
    bulkPackagingType: "Box",
    unitDispensingType: "Capsule",
    packsReceived: 5,
    unitsPerPack: 100, // 10 blister strips of 10 capsules
    stock: 500,        // Total single units (5 packs * 100 units)
    costPrice: 8500,   // Cost per bulk Box
    price: 120,        // Retail price per single capsule unit (₦120)
    bulkSellingPrice: 10500,
    batchNo: "GSK-AMX-01",
    expiryDate: "2026-12-20", // Close to expiry timeline to check your app's soon-to-expire warnings!
    nafdacNo: "A4-4122",
    barcode: "5012345678901",
    variants: [],
    customFields: {},
    notes: "Prescription-only antibiotic matrix. Monitor strict dispensing compliance logs."
  }
];

export default starterProducts;