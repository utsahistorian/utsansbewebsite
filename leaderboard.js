/* ============================
   leaderboard.js
   - Hard-coded Diamond Sponsors
   - Reads: leaderboard.csv, gold.csv
   - No UI / style changes
============================ */

/* ---------- Diamond Sponsors (hard-coded) ---------- */
const diamondNames = [
    "Aisha Karage",
    "Cody Camacho",
    "Jordan Turner",
    "Ebubechi Dickson",
    "Yoma Abobo",
    "Nahom Sweet",
    "Isi Ataghauman",
    "Immanuel Fadairo",
    "Chinaemerem Nwachukwu",
    "John Rex"
  ];
  
  /* ---------- Fallback leaderboard data ---------- */
  const sampleData = [
    { rank: 1, name: "Alex Johnson", points: 21000 },
    { rank: 2, name: "Sarah Chen", points: 2720 },
    { rank: 3, name: "Mike Rodriguez", points: 2650 },
    { rank: 4, name: "Emma Wilson", points: 2580 },
    { rank: 5, name: "David Kim", points: 2490 },
    { rank: 6, name: "Lisa Thompson", points: 2420 },
    { rank: 7, name: "James Brown", points: 2380 },
    { rank: 8, name: "Anna Garcia", points: 2340 },
    { rank: 9, name: "Tom Anderson", points: 2290 },
    { rank: 10, name: "Rachel Davis", points: 2250 },
    { rank: 11, name: "Chris Miller", points: 2180 },
    { rank: 12, name: "Jessica Lee", points: 2120 },
    { rank: 13, name: "Ryan Taylor", points: 2080 },
    { rank: 14, name: "Michelle White", points: 2040 },
    { rank: 15, name: "Kevin Martinez", points: 1990 },
    { rank: 16, name: "Amanda Clark", points: 1950 },
    { rank: 17, name: "Daniel Lewis", points: 1910 },
  ];
  
  let fullLeaderboard = [];
  let filteredData = [];
  let loading = true;
  
  /* ---------- DOM ---------- */
  const diamondGrid = document.getElementById("diamond-grid");
  const goldScroll = document.getElementById("gold-scroll");
  const podiumGrid = document.getElementById("podium-grid");
  const rankingsGrid = document.getElementById("rankings-grid");
  const loadingContainer = document.getElementById("loading");
  const mainContent = document.getElementById("main-content");
  const errorBanner = document.getElementById("error-banner");
  const errorMessage = document.getElementById("error-message");
  const searchInput = document.getElementById("search-input");
  
  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    renderDiamondNames();
    fetchLeaderboardAndGold();
  });
  
  /* ============================
     Fetch helpers
  ============================ */
  async function fetchText(path) {
    const res = await fetch(path, { cache: "no-cache" });
    if (!res.ok) throw new Error(path);
    return res.text();
  }
  
  /* ============================
     CSV parsing (robust)
  ============================ */
  function parseCSV(text) {
    const rows = [];
    let row = [];
    let cur = "";
    let inQuotes = false;
  
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const n = text[i + 1];
  
      if (c === '"' && inQuotes && n === '"') {
        cur += '"'; i++;
      } else if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === "," && !inQuotes) {
        row.push(cur); cur = "";
      } else if ((c === "\n" || c === "\r") && !inQuotes) {
        if (c === "\r" && n === "\n") i++;
        row.push(cur);
        if (row.some(v => v.trim())) rows.push(row);
        row = []; cur = "";
      } else {
        cur += c;
      }
    }
    row.push(cur);
    if (row.some(v => v.trim())) rows.push(row);
    return rows;
  }
  
  function csvToObjects(text) {
    const rows = parseCSV(text.trim());
    if (!rows.length) return [];
    const headers = rows[0];
    return rows.slice(1).map(r => {
      const obj = {};
      headers.forEach((h, i) => obj[h.trim()] = (r[i] || "").trim());
      return obj;
    });
  }
  
  /* ============================
     Fetch leaderboard + gold
  ============================ */
  async function fetchLeaderboardAndGold() {
    setLoading(true);
    hideError();
  
    // Leaderboard
    try {
      const csv = await fetchText("leaderboard.csv");
      const data = csvToObjects(csv)
        .map(r => ({
          rank: 0,
          name: r.Name || r.name || "",
          points: parseFloat(r.Points || r.points || 0)
        }))
        .filter(r => r.name);
  
      fullLeaderboard = data
        .sort((a, b) => b.points - a.points)
        .map((r, i) => ({ ...r, rank: i + 1 }));
  
      filteredData = fullLeaderboard.slice(0, 17);
    } catch {
      showError("Failed to load leaderboard.csv. Using fallback data.");
      fullLeaderboard = sampleData;
      filteredData = [...sampleData];
    }
  
    // Gold race
    try {
      const csv = await fetchText("gold.csv");
      const rows = csvToObjects(csv);
      renderGold(rows);
    } catch {
      renderGold([]);
    }
  
    setLoading(false);
    renderLeaderboard();
  }
  
  /* ============================
     Render: Diamond Sponsors
  ============================ */
  function renderDiamondNames() {
    if (!diamondGrid) return;
    diamondGrid.innerHTML = "";
  
    diamondNames.forEach(name => {
      const div = document.createElement("div");
      div.className = "diamond-card";
      div.innerHTML = `
        <div class="diamond-info">
          <div class="diamond-name">${name}</div>
        </div>
      `;
      diamondGrid.appendChild(div);
    });
  }
  
  /* ============================
     Render: Gold race
  ============================ */
  function renderGold(rows) {
    if (!goldScroll) return;
    goldScroll.innerHTML = "";
  
    if (!rows.length) {
      goldScroll.innerHTML = '<div class="no-results">No Gold Sponsorship entries found.</div>';
      return;
    }
  
    rows.forEach(r => {
      const div = document.createElement("div");
      div.className = "gold-row";
      div.innerHTML = `
        <div class="gold-rank">${r.Rank || ""}</div>
        <div class="gold-name">${r.Name || ""}</div>
        <div class="gold-points">${r.Points || "0"}</div>
      `;
      goldScroll.appendChild(div);
    });
  }
  
  /* ============================
     Render: Leaderboard
  ============================ */
  function renderLeaderboard() {
    if (!podiumGrid || !rankingsGrid) return;
    podiumGrid.innerHTML = "";
    rankingsGrid.innerHTML = "";
  
    if (!filteredData.length) return;
  
    renderPodium();
    renderRankings();
  }
  
  function renderPodium() {
    podiumGrid.innerHTML = filteredData.slice(0, 3).map(r => `
      <div class="podium-card rank-${r.rank}">
        <div class="rank-number">${r.rank}</div>
        <h3 class="podium-name">${r.name}</h3>
        <div class="podium-points">${r.points.toLocaleString()}</div>
        <div class="podium-label">points</div>
      </div>
    `).join("");
  }
  
  function renderRankings() {
    const max = Math.max(...fullLeaderboard.map(r => r.points), 1);
    rankingsGrid.innerHTML = filteredData.slice(3).map(r => `
      <div class="ranking-row">
        <div class="ranking-rank">${r.rank}</div>
        <div class="ranking-name">${r.name}</div>
        <div class="ranking-points">
          <span>${r.points.toLocaleString()}</span>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${(r.points / max) * 100}%"></div>
          </div>
        </div>
      </div>
    `).join("");
  }
  
  /* ============================
     UI helpers
  ============================ */
  function setLoading(v) {
    loading = v;
    if (!loadingContainer || !mainContent) return;
    loadingContainer.classList.toggle("hidden", !v);
    mainContent.classList.toggle("hidden", v);
  }
  
  function showError(msg) {
    if (!errorBanner || !errorMessage) return;
    errorMessage.textContent = msg;
    errorBanner.classList.add("show");
  }
  
  function hideError() {
    if (!errorBanner) return;
    errorBanner.classList.remove("show");
  }  