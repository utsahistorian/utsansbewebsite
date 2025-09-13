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
let currentTheme = localStorage.getItem('theme') || 'dark';

// DOM elements
const loadingContainer = document.getElementById("loading-container");
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
document.addEventListener("DOMContentLoaded", async () => {
    document.body.setAttribute('data-theme', currentTheme);
    applyTheme();
    await simulateLoading();   // run loading animation
    fetchLeaderboardData();    // then load CSV
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
        const response = await fetch("leaderboard.csv");

        if (!response.ok) {
            throw new Error("Failed to fetch leaderboard data");
        }

        const csvText = await response.text();
        const parsedData = parseCSV(csvText);

        // Sort by points (descending), then by name (ascending) for ties
        const sortedData = parsedData
            .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name))
            .map((entry, index) => ({ ...entry, rank: index + 1 }));

        fullLeaderboard = sortedData;
        filteredData = [...fullLeaderboard];
    } catch (err) {
        console.error("Error fetching leaderboard:", err);
        showError("Failed to load leaderboard data. Using sample data.");
        fullLeaderboard = sampleData;
        filteredData = [...sampleData];
    } finally {
        setLoading(false);
        renderLeaderboard();
    }
}

function parseCSV(csvText) {
    const lines = csvText.trim().split("\n");
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
        loadingContainer.classList.remove("fade-out");
        mainContent.classList.add("hidden");
    } else {
        hideLoadingScreen();
    }
}

function hideLoadingScreen() {
    loadingContainer.classList.add("fade-out");
    setTimeout(() => {
        loadingContainer.style.display = "none";
        mainContent.classList.remove("hidden");
    }, 800);
}

function simulateLoading() {
    return new Promise((resolve) => {
        let progress = 0;
        const progressFill = document.getElementById("progress-fill");
        const progressPercentage = document.getElementById("progress-percentage");

        const interval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    hideLoadingScreen();
                    resolve();
                }, 500);
            }
            progressFill.style.width = `${progress}%`;
            progressPercentage.textContent = `${Math.round(progress)}%`;
        }, 200 + Math.random() * 300);
    });
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
        filteredData = [...fullLeaderboard];
    } else {
        filteredData = fullLeaderboard.filter(entry =>
            entry.name.toLowerCase().includes(query)
        );
        filteredData.sort((a, b) => a.rank - b.rank);
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
        link.setAttribute('download', 'leaderboard.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Render helpers
function getRankNumber(rank) {
    let rankClass = 'rank-1';
    if (rank === 2) {
        rankClass = 'rank-2';
    } else if (rank === 3) {
        rankClass = 'rank-3';
    }
    return `<div class="rank-number ${rankClass}">${rank}</div>`;
}

function renderLeaderboard() {
    podiumGrid.innerHTML = '';
    rankingsGrid.innerHTML = '';

    if (filteredData.length === 0) {
        rankingsGrid.innerHTML = '<div class="no-results">No results found.</div>';
        return;
    }

    const isSearching = searchInput.value.trim() !== '';

    if (!isSearching) {
        renderPodium();
    }

    renderRankings(isSearching);
}

function renderPodium() {
    const top3 = filteredData.slice(0, 3);
    podiumGrid.innerHTML = top3
        .map((entry, index) => {
            const rank = entry.rank;
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

function renderRankings(isSearching) {
    const maxPoints = Math.max(...fullLeaderboard.map(d => d.points));
    const startIndex = isSearching ? 0 : 3;
    const remaining = filteredData.slice(startIndex);
    rankingsGrid.innerHTML = remaining
        .map((entry) => {
            const progress = ((entry.points / maxPoints) * 100).toFixed(1);
            return `
                <div class="ranking-row">
                    <div class="ranking-rank">${entry.rank}</div>
                    <div class="ranking-name">${entry.name}</div>
                    <div class="ranking-points">
                        <span>${entry.points.toLocaleString()}</span>
                        <div class="progress-bar-mini">
                            <div class="progress-fill-mini" style="width: ${progress}%"></div>
                        </div>
                    </div>
                </div>
            `;
        })
        .join("");
}
