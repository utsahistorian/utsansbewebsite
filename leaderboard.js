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
    { rank: 18, name: "Nicole Walker", points: 1870 },
    { rank: 19, name: "Brandon Hall", points: 1830 },
    { rank: 20, name: "Stephanie Young", points: 1790 },
];

let leaderboardData = [];
let filteredData = [];
let loading = true;
let currentTheme = localStorage.getItem('theme') || 'dark';

// DOM elements
const loadingContainer = document.getElementById("loading");
const mainContent = document.getElementById("main-content");
const errorBanner = document.getElementById("error-banner");
const errorMessage = document.getElementById("error-message");
const podiumGrid = document.getElementById("podium-grid");
const rankingsGrid = document.getElementById("rankings-grid");
const refreshBtn = document.getElementById("refresh-btn");
const themeToggle = document.getElementById("theme-toggle");
const exportBtn = document.getElementById("export-btn");
const searchInput = document.getElementById("search-input");

// Event listeners
refreshBtn.addEventListener("click", fetchLeaderboardData);
themeToggle.addEventListener("click", toggleTheme);
exportBtn.addEventListener("click", exportToCSV);
searchInput.addEventListener("input", debounce(filterLeaderboard, 300));

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    document.body.setAttribute('data-theme', currentTheme);
    applyTheme();
    fetchLeaderboardData();
});

// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Theme functions
function applyTheme() {
    const icon = themeToggle.querySelector('i');
    if (currentTheme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);
    document.body.setAttribute('data-theme', currentTheme);
    applyTheme();
}

// Fetch and parse data
async function fetchLeaderboardData() {
    setLoading(true);
    hideError();

    try {
        const response = await fetch(
            "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/leaderboard-PYHs8bdLgt9gK4reHRGS4qSvq9CR9H.csv",
        );

        if (!response.ok) {
            throw new Error("Failed to fetch leaderboard data");
        }

        const csvText = await response.text();
        const parsedData = parseCSV(csvText);

        // Sort by points (descending) and take top 20
        const sortedData = parsedData
            .sort((a, b) => b.points - a.points)
            .slice(0, 20)
            .map((entry, index) => ({ ...entry, rank: index + 1 }));

        leaderboardData = sortedData;
        filteredData = [...sortedData];
    } catch (err) {
        console.error("Error fetching leaderboard:", err);
        showError("Failed to load leaderboard data. Using sample data.");
        leaderboardData = sampleData;
        filteredData = [...sampleData];
    } finally {
        setLoading(false);
        renderLeaderboard();
    }
}

function parseCSV(csvText) {
    const lines = csvText.trim().split("\n");
    const headers = lines[0].split(",");

    return lines.slice(1).map((line) => {
        const values = line.split(",");
        return {
            rank: 0, // Will be set after sorting
            name: values[1]?.replace(/"/g, "") || "Unknown",
            points: Number.parseInt(values[2]) || 0,
        };
    });
}

// Loading and error functions
function setLoading(isLoading) {
    loading = isLoading;
    if (isLoading) {
        loadingContainer.classList.remove("hidden");
        mainContent.classList.add("hidden");
    } else {
        loadingContainer.classList.add("hidden");
        mainContent.classList.remove("hidden");
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorBanner.classList.add("show");
}

function hideError() {
    errorBanner.classList.remove("show");
}

// Filter function
function filterLeaderboard() {
    const query = searchInput.value.toLowerCase().trim();
    if (query === '') {
        filteredData = [...leaderboardData];
    } else {
        filteredData = leaderboardData.filter(entry => 
            entry.name.toLowerCase().includes(query)
        );
        // Re-rank filtered data
        filteredData = filteredData.map((entry, index) => ({ ...entry, rank: index + 1 }));
    }
    renderLeaderboard();
}

// Export function
function exportToCSV() {
    const csvContent = "Rank,Name,Points\n" + 
        filteredData.map(entry => `${entry.rank},"${entry.name}",${entry.points}`).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'leadership-board.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Render helpers
function getRankNumber(rank) {
    let bgColor = '#ff6b35'; // default for rank 1
    let rankClass = 'rank-1';
    if (rank === 2) {
        bgColor = '#a0a0a0';
        rankClass = 'rank-2';
    } else if (rank === 3) {
        bgColor = '#ffd23f';
        rankClass = 'rank-3';
    }
    return `<div class="rank-number ${rankClass}" style="background: ${bgColor};">${rank}</div>`;
}

function renderLeaderboard() {
    renderPodium();
    renderRankings();
}

function renderPodium() {
    const top3 = filteredData.slice(0, 3);
    podiumGrid.innerHTML = top3
        .map((entry, index) => {
            const rank = index + 1;
            const rankClass = `rank-${rank}`;
            return `
                <div class="podium-card ${rankClass}">
                    ${getRankNumber(rank)}
                    <h3 class="podium-name">${entry.name}</h3>
                    <div class="podium-points">${entry.points.toLocaleString()}</div>
                    <div class="podium-label">points</div>
                </div>
            `;
        })
        .join("");
}

function renderRankings() {
    const remaining = filteredData.slice(3);
    rankingsGrid.innerHTML = remaining
        .map((entry) => {
            const maxPoints = Math.max(...leaderboardData.map(d => d.points));
            const progress = ((entry.points / maxPoints) * 100).toFixed(1);
            return `
                <div class="ranking-row">
                    <div class="ranking-rank">${entry.rank}</div>
                    <div class="ranking-name">${entry.name}</div>
                    <div class="ranking-points">
                        <span>${entry.points.toLocaleString()}</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                </div>
            `;
        })
        .join("");
}