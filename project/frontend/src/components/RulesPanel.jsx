export default function RulesPanel({ rules }) {
  if (!rules) return null;

  const items = [
    { label: "Min Yield", value: rules.minYield },
    { label: "Max Pesticide", value: rules.maxPesticide },
    { label: "Min Inventory", value: rules.minInventory },
    { label: "Temperature Range", value: `${rules.minTemperature}°C – ${rules.maxTemperature}°C` },
    { label: "Price Range", value: `₹${rules.minPrice} – ₹${rules.maxPrice}` },
  ];

  return (
    <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-agri-700">
        Crop Compliance Rules
      </h3>
      <dl className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg bg-emerald-50 px-3 py-2">
            <dt className="text-xs text-slate-500">{item.label}</dt>
            <dd className="font-medium text-slate-800">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
