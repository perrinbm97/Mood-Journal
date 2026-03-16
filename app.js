let moodEntries = [];
let selectedMood = null;

const moods = {
  1: { emoji: "😭", text: "Terrible", color: "#dc3545" },
  2: { emoji: "☹️", text: "Bad", color: "#fd7e14" },
  3: { emoji: "😐", text: "Okay", color: "#ffc107" },
  4: { emoji: "🙂", text: "Good", color: "#28a745" },
  5: { emoji: "🤩", text: "Great", color: "#17a2b8" },
};

function saveMoodEntries() {
  localStorage.setItem("moodEntries", JSON.stringify(moodEntries));
}

function addMoodEntry(mood, note) {
  const today = new Date().toDateString();
  //Ex: Sun Mar 01 2026

  //Clear previous results for today from array if applicable
  moodEntries = moodEntries.filter((e) => e.date !== today);
  //Add entry to array, setting unique ID and stamping with today's date
  moodEntries.push({ id: Date.now(), mood, note, date: today });
  //Sort array by newest to oldest entry
  moodEntries.sort((a, b) => b.id - a.id);
  saveMoodEntries(); //Save to storage after adding
  updateDisplay();
}

function deleteMoodEntry(id) {
  //Pass entries back into array only if they don't match the ID
  moodEntries = moodEntries.filter((e) => e.id !== id);
  saveMoodEntries(); // Save to storage after deleting
  updateDisplay();
}

function getMoodAverage() {
  if (moodEntries.length === 0) return 0;
  return moodEntries.reduce((sum, e) => sum + e.mood, 0) / moodEntries.length;
}

function updateMoodSummary() {
  const avg = getMoodAverage();
  const rounded = Math.round(avg);

  document.getElementById("moodAverage").textContent =
    avg > 0 ? `${moods[rounded].emoji} ${avg.toFixed(1)}` : "😐 0.0";

  document.getElementById("moodStats").textContent =
    moodEntries.length > 0
      ? `${moodEntries.length} total entries • Average: ${avg.toFixed(1)}/5`
      : "No entries recorded yet";
}

function showMoodEntries() {
  const container = document.getElementById("entries__container");
  if (moodEntries.length === 0) {
    container.innerHTML = `<div class="no__entries">No mood entries found. Add one above!</div>`;
    return;
  }
  //Add HTML elements for the last 10 entries created
  container.innerHTML = moodEntries
    .slice(0, 10)
    .map((entry) => {
      const mood = moods[entry.mood];
      const date = new Date(entry.id).toLocaleDateString();
      //Ex: 03/02/2026
      return `
            <div class="mood__entry">
                <div class="entry__header">
                    <div class="entry__left">
                        <div class="entry__mood">
                            <span style="font-size: 20px;">${mood.emoji}</span>
                            <span style="color: ${mood.color};">${mood.text} (${entry.mood}/5)</span>
                        </div>
                        <div class="entry__date">${date}</div>
                    </div>
                    <button class="delete__entry--btn" onclick="deleteMoodEntry(${entry.id})">X</button>
                </div>
                ${entry.note ? `<div class="entry__note">${entry.note}</div>` : ""}
            </div>`;
    })
    .join("");
}

function updateMoodChart() {
    const barsContainer = document.getElementById("chart__bars");

    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toDateString();
        const entry = moodEntries.find((e) => e.date === dateString);
        days.push({
            label: date.toLocaleDateString("en-US", {weekday: "short"}),
            mood: entry ? entry.mood : 0,
            date: date.toLocaleDateString(),
        });
    }

    barsContainer.innerHTML = days.map((day) => {
        const height = day.mood > 0 ? (day.mood / 5) * 100 : 2;
        const mood = day.mood > 0 ? moods[day.mood] : null;
        const hasData = day.mood > 0;

        return `
            <div class="chart__bar--container">
                <div class="chart__bar" style="height: ${height}%; ${hasData ? `background-color: ${mood.color}80; border-color: ${mood.color};` : ""}">
                    <div class="chart__tooltip">
                    ${hasData ? `${mood.emoji} ${mood.text} (${day.mood}/5)` : "No entry"}
                    </div>
                </div>
                <div class="chart-x__label">${day.label}</div>
            </div>`;
    }).join("");
}

function updateDisplay() {
    updateMoodSummary();
    showMoodEntries();
    updateMoodChart();
}

function showMessage(text) {
    const div = document.createElement("div");
    div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 500;
        background-color: #8a2be2;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);`;
    div.textContent = text;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

function initializeJournal() {
    const saved = localStorage.getItem("moodEntries");
    if (saved) {
        moodEntries = JSON.parse(saved);
    }

    const now = new Date();
    document.getElementById("currentDay").textContent = now.toLocaleDateString(
        "en-US",
        {weekday: "long"}
    );
    document.getElementById("currentDate").textContent = now.toLocaleDateString();

    document.querySelectorAll(".mood__option").forEach((option) => {
        option.addEventListener("click", () => {
            document
                .querySelectorAll(".mood__option")
                .forEach((opt) => opt.classList.remove("selected"));
            option.classList.add("selected");
            selectedMood = parseInt(option.dataset.mood);
        });
    });

    document.getElementById("add-entry__btn").addEventListener("click", () => {
        if (!selectedMood) {
            showMessage("Please select a mood first!");
            return;
        }
        const note = document.getElementById("moodNote").value.trim();
        addMoodEntry(selectedMood, note);
        document.getElementById("moodNote").value = "";
        document
            .querySelectorAll(".mood__option")
            .forEach((opt) => opt.classList.remove("selected"));
        selectedMood = null;
        showMessage("Mood entry added!");
    });
    updateDisplay();
}

document.addEventListener("DOMContentLoaded", initializeJournal);

window.addEventListener("beforeunload", () => {
    saveMoodEntries();
});