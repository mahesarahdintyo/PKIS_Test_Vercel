"use client";

import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

interface SQCPMProps {
  safety: {
    hariTanpaAccident: number;
    accident: number;
  };
  ngRatePct: number;
  totalNG: number;
  oee: number;
  gsph: number;
  targetGsph: number;
  ngValueRp: number;
  scrapValueRp: number;
  attendance: {
    pctExclCuti: number;
    total_orang: number;
    hadir: number;
    cuti: number;
    absen: number;
    overtime_jam: number;
  };
  periodMode?: "harian" | "bulanan" | "tahunan";
  miniTrend?: {
    labels: string[];
    safety: number[];
    quality: number[];
    productivity: number[];
    cost: number[];
    moral: number[];
  };
}

function fmtNum(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(Number(n))) return "0";
  return Number(n).toLocaleString("en-US", { maximumFractionDigits: 1 });
}

function fmtRupiahShort(rp: number): string {
  if (!rp) return "Rp 0";
  if (rp >= 1_000_000_000) return `Rp ${(rp / 1_000_000_000).toFixed(1)}M`;
  if (rp >= 1_000_000) return `Rp ${(rp / 1_000_000).toFixed(1)}Jt`;
  if (rp >= 1_000) return `Rp ${(rp / 1_000).toFixed(0)}K`;
  return `Rp ${rp}`;
}

export default function SQCDMPPanel({
  safety,
  ngRatePct,
  totalNG,
  oee,
  gsph,
  targetGsph,
  ngValueRp,
  scrapValueRp,
  attendance,
  periodMode = "harian",
  miniTrend,
}: SQCPMProps) {
  const chartRefs = {
    miniSafety: useRef<HTMLCanvasElement | null>(null),
    miniQuality: useRef<HTMLCanvasElement | null>(null),
    miniProductivity: useRef<HTMLCanvasElement | null>(null),
    miniCost: useRef<HTMLCanvasElement | null>(null),
    miniMoral: useRef<HTMLCanvasElement | null>(null),
  };

  const chartInstances = useRef<Record<string, Chart>>({});

  const defaultLabels = ["18 Jul", "19 Jul", "20 Jul", "21 Jul", "22 Jul", "23 Jul"];

  useEffect(() => {
    const t = miniTrend || {
      labels: defaultLabels,
      safety: [0, 0, 0, 0, 0, safety.hariTanpaAccident || 0],
      quality: [0, 0, 0, 0, 0, ngRatePct || 0],
      productivity: [0, 0, 0, 0, 0, oee || 0],
      cost: [0, 0, 0, 0, 0, (ngValueRp + scrapValueRp) || 0],
      moral: [0, 0, 0, 0, 0, attendance.pctExclCuti || 0],
    };

    const renderSparkline = (
      canvas: HTMLCanvasElement | null,
      id: string,
      labels: string[],
      data: number[],
      color: string,
      type: "line" | "bar" = "line"
    ) => {
      if (!canvas) return;
      if (chartInstances.current[id]) {
        chartInstances.current[id].destroy();
      }

      const isBar = type === "bar";
      chartInstances.current[id] = new Chart(canvas, {
        type: isBar ? "bar" : "line",
        data: {
          labels,
          datasets: [
            {
              data,
              borderColor: color,
              backgroundColor: isBar ? color : "transparent",
              borderWidth: 2,
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 3,
              borderRadius: isBar ? 3 : 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
          },
          scales: {
            x: {
              ticks: { color: "#64748b", font: { size: 9 } },
              grid: { display: false },
              border: { display: false },
            },
            y: {
              ticks: { color: "#64748b", font: { size: 9 }, maxTicksLimit: 3 },
              grid: { color: "rgba(255,255,255,0.05)", drawTicks: false },
              border: { display: false },
              beginAtZero: true,
            },
          },
        },
      });
    };

    renderSparkline(chartRefs.miniSafety.current, "miniSafety", t.labels, t.safety, "#3b82f6", "line");
    renderSparkline(chartRefs.miniQuality.current, "miniQuality", t.labels, t.quality, "#3b82f6", "line");
    renderSparkline(chartRefs.miniProductivity.current, "miniProductivity", t.labels, t.productivity, "#3b82f6", "line");
    renderSparkline(chartRefs.miniCost.current, "miniCost", t.labels, t.cost, "#3b82f6", "line");
    renderSparkline(chartRefs.miniMoral.current, "miniMoral", t.labels, t.moral, "#3b82f6", "line");

    return () => {
      Object.values(chartInstances.current).forEach((c) => c.destroy());
    };
  }, [miniTrend, safety.hariTanpaAccident, ngRatePct, oee, ngValueRp, scrapValueRp, attendance.pctExclCuti]);

  return (
    <div className="sqcpm-columns">
      {/* ═══ SAFETY ═══ */}
      <div className="sqcpm-col col-good">
        <div className="sqcpm-col-head">
          <span className="sqcpm-col-icon">⛑️</span>
          <div>
            <div className="sqcpm-col-title">KESELAMATAN</div>
            <div className="sqcpm-col-sub">SAFETY</div>
          </div>
        </div>
        <div className="sqcpm-metric-label">Hari Tanpa Kecelakaan</div>
        <div className="sqcpm-metric-value">{fmtNum(safety.hariTanpaAccident)}</div>
        <div className="sqcpm-bar">
          <div className="sqcpm-bar-fill" style={{ width: `${safety.accident === 0 ? 100 : 20}%` }} />
        </div>
        <div className="sqcpm-mini-label">{fmtNum(safety.accident)} insiden tercatat</div>
        <div className="sqcpm-chart">
          <canvas ref={chartRefs.miniSafety} />
        </div>
      </div>

      {/* ═══ QUALITY ═══ */}
      <div className="sqcpm-col col-good">
        <div className="sqcpm-col-head">
          <span className="sqcpm-col-icon">🎯</span>
          <div>
            <div className="sqcpm-col-title">KUALITAS</div>
            <div className="sqcpm-col-sub">QUALITY</div>
          </div>
        </div>
        <div className="sqcpm-metric-label">NG Rate (Target ≤ 0,5%)</div>
        <div className="sqcpm-metric-value">{fmtNum(ngRatePct)}%</div>
        <div className="sqcpm-bar">
          <div className="sqcpm-bar-fill" style={{ width: `${Math.max(0, Math.min(100, 100 - ngRatePct * 20))}%` }} />
        </div>
        <div className="sqcpm-mini-label">{fmtNum(totalNG)} pcs NG</div>
        <div className="sqcpm-chart">
          <canvas ref={chartRefs.miniQuality} />
        </div>
      </div>

      {/* ═══ PRODUCTIVITY ═══ */}
      <div className="sqcpm-col col-good">
        <div className="sqcpm-col-head">
          <span className="sqcpm-col-icon">⚙️</span>
          <div>
            <div className="sqcpm-col-title">PRODUKTIVITAS</div>
            <div className="sqcpm-col-sub">PRODUCTIVITY</div>
          </div>
        </div>
        <div className="sqcpm-metric-label">OEE Keseluruhan</div>
        <div className="sqcpm-metric-value">{fmtNum(oee)}%</div>
        <div className="sqcpm-bar">
          <div className="sqcpm-bar-fill" style={{ width: `${Math.max(0, Math.min(100, oee))}%` }} />
        </div>
        <div className="sqcpm-mini-label">
          GSPH <b>{fmtNum(gsph)}</b> / target <b>{fmtNum(targetGsph)}</b>
        </div>
        <div className="sqcpm-chart">
          <canvas ref={chartRefs.miniProductivity} />
        </div>
      </div>

      {/* ═══ COST ═══ */}
      <div className="sqcpm-col col-good">
        <div className="sqcpm-col-head">
          <span className="sqcpm-col-icon">💰</span>
          <div>
            <div className="sqcpm-col-title">BIAYA</div>
            <div className="sqcpm-col-sub">COST</div>
          </div>
        </div>
        <div className="sqcpm-metric-label">Total Biaya</div>
        <div className="sqcpm-metric-value" style={{ fontSize: "22px" }}>
          {fmtRupiahShort(ngValueRp + scrapValueRp)}
        </div>
        <div className="cost-split">
          <div className="cost-split-row">
            <span className="cost-split-label">NG Inline</span>
            <span className="cost-split-value">{fmtRupiahShort(ngValueRp)}</span>
          </div>
          <div className="cost-split-bar">
            <div className="cost-split-fill cost-fill-ng"
              style={{ width: `${ngValueRp + scrapValueRp > 0 ? (ngValueRp / (ngValueRp + scrapValueRp)) * 100 : 0}%` }} />
          </div>
          <div className="cost-split-row" style={{ marginTop: "4px" }}>
            <span className="cost-split-label">Scrap Top End</span>
            <span className="cost-split-value">{fmtRupiahShort(scrapValueRp)}</span>
          </div>
          <div className="cost-split-bar">
            <div className="cost-split-fill cost-fill-scrap"
              style={{ width: `${ngValueRp + scrapValueRp > 0 ? (scrapValueRp / (ngValueRp + scrapValueRp)) * 100 : 0}%` }} />
          </div>
        </div>
        <div className="sqcpm-chart">
          <canvas ref={chartRefs.miniCost} />
        </div>
      </div>

      {/* ═══ MORAL / ATTENDANCE ═══ */}
      <div className="sqcpm-col col-bad">
        <div className="sqcpm-col-head">
          <span className="sqcpm-col-icon">👥</span>
          <div>
            <div className="sqcpm-col-title">MORAL</div>
            <div className="sqcpm-col-sub">ATTENDANCE</div>
          </div>
        </div>
        <div className="sqcpm-metric-label">
          Tingkat Kehadiran
          {periodMode !== "harian" && <span className="avg-tag">rata-rata</span>}
        </div>
        <div className="sqcpm-metric-value">{fmtNum(attendance.pctExclCuti)}%</div>
        <div className="sqcpm-bar">
          <div className="sqcpm-bar-fill" style={{ width: `${attendance.pctExclCuti}%`, background: "var(--red)" }} />
        </div>
        <div className="manpower-grid manpower-grid-5">
          <div className="manpower-box">
            <span className="manpower-icon">👥</span>
            <span className="manpower-label">Total</span>
            <span className="manpower-value">{fmtNum(attendance.total_orang)}</span>
            <span className="manpower-unit">Orang</span>
          </div>
          <div className="manpower-box manpower-hadir">
            <span className="manpower-icon">🧍</span>
            <span className="manpower-label">Hadir</span>
            <span className="manpower-value">{fmtNum(attendance.hadir)}</span>
            <span className="manpower-unit">Orang</span>
          </div>
          <div className="manpower-box">
            <span className="manpower-icon">🌴</span>
            <span className="manpower-label">Cuti</span>
            <span className="manpower-value">{fmtNum(attendance.cuti)}</span>
            <span className="manpower-unit">Orang</span>
          </div>
          <div className="manpower-box">
            <span className="manpower-icon">🚫</span>
            <span className="manpower-label">Absen</span>
            <span className="manpower-value">{fmtNum(attendance.absen)}</span>
            <span className="manpower-unit">Orang</span>
          </div>
          <div className="manpower-box">
            <span className="manpower-icon">⏰</span>
            <span className="manpower-label">O.T</span>
            <span className="manpower-value">{fmtNum(attendance.overtime_jam)}</span>
            <span className="manpower-unit">Jam</span>
          </div>
        </div>
        <div className="sqcpm-chart">
          <canvas ref={chartRefs.miniMoral} />
        </div>
      </div>
    </div>
  );
}
