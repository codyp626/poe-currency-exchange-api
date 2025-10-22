// ...existing code...
import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale, // add
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns"; // adapter

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale, // register time scale
  Title,
  Tooltip,
  Legend
);
// ...existing code...

export default function Graph() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pairs, setPairs] = useState([]); // available currency pairs
  const [selectedPairKey, setSelectedPairKey] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("http://localhost:5050/record/");
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        // ensure sorted by time ascending
        data.sort((a, b) => new Date(a.time) - new Date(b.time));
        setRecords(data);

        // build unique from->to pairs from data
        const map = new Map();
        data.forEach((r) => {
          if (!r.from_currency || !r.to_currency) return;
          const key = `${r.from_currency} → ${r.to_currency}`;
          if (!map.has(key)) map.set(key, { key, from: r.from_currency, to: r.to_currency });
        });
        const pairList = Array.from(map.values());
        setPairs(pairList);
        if (pairList.length) setSelectedPairKey(pairList[0].key);
      } catch (err) {
        console.error("Failed to load records for graph:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);
// ...existing code...

  // filter records to only the selected pair
  const filtered = records.filter(
    (r) => `${r.from_currency} → ${r.to_currency}` === selectedPairKey
  );

  // convert to x/y points (Chart.js will use the adapter for time scale)
  const sellPoints = filtered
    .filter((r) => r.sell_price != null)
    .map((r) => ({ x: r.time, y: Number(r.sell_price) }));
  const buyPoints = filtered
    .filter((r) => r.buy_price != null)
    .map((r) => ({ x: r.time, y: Number(r.buy_price) }));

  const data = {
    // labels optional when using xy points; leaving empty lets Chart compute time ticks
    datasets: [
      {
        label: "Sell Price",
        data: sellPoints,
        borderColor: "rgba(220,38,38,0.9)",
        backgroundColor: "rgba(220,38,38,0.2)",
        tension: 0.2,
        spanGaps: true,
        pointRadius: 3,
      },
      {
        label: "Buy Price",
        data: buyPoints,
        borderColor: "rgba(16,185,129,0.9)",
        backgroundColor: "rgba(16,185,129,0.2)",
        tension: 0.2,
        spanGaps: true,
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: { mode: "nearest", intersect: false },
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `Price history — ${selectedPairKey}` },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        type: "time", // time scale
        time: {
          // choose unit suitable for your data: 'minute'|'hour'|'day'|'month' etc.
          unit: "hour",
          tooltipFormat: "Pp", // date-fns format token via adapter
        },
        title: { display: true, text: "Time" },
      },
      y: {
        display: true,
        title: { display: true, text: "Price" },
        beginAtZero: false,
      },
    },
  };
// ...existing code...

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Price Graph</h3>
      <div className="border rounded-lg p-4 bg-white">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Select pair</label>
          <select
            value={selectedPairKey}
            onChange={(e) => setSelectedPairKey(e.target.value)}
            className="rounded-md border py-1 px-2"
          >
            {pairs.map((p) => (
              <option key={p.key} value={p.key}>
                {p.key}
              </option>
            ))}
          </select>
        </div>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
// ...existing code...