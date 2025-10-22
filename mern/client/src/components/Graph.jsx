// ...existing code...
import React, { useEffect, useState, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns"; // adapter

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  zoomPlugin // register zoom plugin
);

export default function Graph() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pairs, setPairs] = useState([]); // available currency pairs
  const [selectedPairKey, setSelectedPairKey] = useState("");
  const chartRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("http://localhost:5050/record/");
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        data.sort((a, b) => new Date(a.time) - new Date(b.time));
        setRecords(data);

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

  if (loading) return <div className="p-4 muted">Loading graph…</div>;
  if (!records.length) return <div className="p-4 muted">No data available</div>;
  if (!pairs.length) return <div className="p-4 muted">No currency pairs found</div>;

  const filtered = records.filter(
    (r) => `${r.from_currency} → ${r.to_currency}` === selectedPairKey
  );

  const sellPoints = filtered
    .filter((r) => r.sell_price != null)
    .map((r) => ({ x: r.time, y: Number(r.sell_price) }));
  const buyPoints = filtered
    .filter((r) => r.buy_price != null)
    .map((r) => ({ x: r.time, y: Number(r.buy_price) }));

  const data = {
    datasets: [
      {
        label: "Sell Price",
        data: sellPoints,
        borderColor: "rgba(248,113,113,0.95)", // red-400
        backgroundColor: "rgba(248,113,113,0.12)",
        tension: 0.2,
        spanGaps: true,
        pointRadius: 0,
      },
      {
        label: "Buy Price",
        data: buyPoints,
        borderColor: "rgba(34,197,94,0.95)", // green-500
        backgroundColor: "rgba(34,197,94,0.10)",
        tension: 0.2,
        spanGaps: true,
        pointRadius: 0,
      },
    ],
  };

  const tickColor = "#cbd5e1"; // slate-300 for dark
  const gridColor = "rgba(148,163,184,0.06)";

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "nearest", intersect: false },
    plugins: {
      legend: { position: "top", labels: { color: tickColor } },
      title: { display: true, text: `Price history — ${selectedPairKey}`, color: tickColor },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(15,23,42,0.95)", // dark tooltip
        titleColor: "#fff",
        bodyColor: "#e6eef8",
      },
      // chartjs-plugin-zoom config
      zoom: {
        pan: {
          enabled: true,
          mode: "x",
          modifierKey: "alt", // hold Alt to pan (reduces accidental pans)
          threshold: 10,
        },
        zoom: {
          wheel: {
            enabled: true, // zoom with mouse wheel
          },
          pinch: {
            enabled: true, // touch pinch to zoom
          },
          drag: {
            enabled: true, // shift + drag to create zoom selection
            modifierKey: "shift",
          },
          mode: "x",
        },
        limits: {
          x: { min: "original", max: "original" },
        },
      },
    },
    scales: {
      x: {
        type: "time",
        time: { unit: "hour", tooltipFormat: "Pp" },
        title: { display: true, text: "Time", color: tickColor },
        ticks: { color: tickColor },
        grid: { color: gridColor },
      },
      y: {
        display: true,
        title: { display: true, text: "Price", color: tickColor },
        ticks: { color: tickColor },
        grid: { color: gridColor },
        beginAtZero: false,
      },
    },
  };

  // control handlers
  function zoomIn() {
    if (!chartRef.current) return;
    // zoom x by 1.25
    chartRef.current.zoom({ x: 1.25 });
  }
  function zoomOut() {
    if (!chartRef.current) return;
    chartRef.current.zoom({ x: 0.8 });
  }
  function resetZoom() {
    if (!chartRef.current) return;
    chartRef.current.resetZoom();
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4 text-slate-100">Price Graph</h3>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <label className="block text-sm font-medium muted">Select pair</label>
            <select
              value={selectedPairKey}
              onChange={(e) => setSelectedPairKey(e.target.value)}
              className="rounded-md border py-1 px-2 bg-transparent text-slate-100"
            >
              {pairs.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.key}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn"
              onClick={zoomIn}
              title="Zoom in (wheel also works)"
            >
              Zoom In
            </button>
            <button type="button" className="btn" onClick={zoomOut} title="Zoom out">
              Zoom Out
            </button>
            <button type="button" className="btn" onClick={resetZoom} title="Reset zoom">
              Reset
            </button>
          </div>
        </div>

        <div style={{ height: 420 }} className="w-full">
          <Line ref={chartRef} data={data} options={options} />
        </div>

        <div className="mt-3 text-sm muted">
          Tips: Use mouse wheel or pinch to zoom. Hold Alt and drag to pan, or Shift + drag to select a zoom region.
        </div>
      </div>
    </div>
  );
}
// ...existing code...