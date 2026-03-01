// ===============================
// FocusLock – stable working JS
// ===============================
let totalCredits = 0;
let CREDIT_LIMIT = null;  

// Wait until DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const addTaskBtn = document.getElementById("addTaskBtn");
  const unlockBtn = document.getElementById("unlockBtn");

  addTaskBtn.addEventListener("click", addTask);

  // ---------- DAILY THRESHOLD ----------
  const thresholdInput = document.getElementById("thresholdInput");
  const setThresholdBtn = document.getElementById("setThresholdBtn");
  const thresholdSetter = document.getElementById("thresholdSetter");
  const thresholdLocked = document.getElementById("thresholdLocked");
  const lockedValue = document.getElementById("lockedValue");

  const today = new Date().toDateString();
  const savedDay = localStorage.getItem("thresholdDay");
  const savedThreshold = localStorage.getItem("dailyThreshold");

 if (savedDay === today && savedThreshold) {
  goalSetToday = true;
  CREDIT_LIMIT = Number(savedThreshold);
  lockedValue.textContent = `${CREDIT_LIMIT} credits`;
  thresholdSetter.classList.add("hidden");
  thresholdLocked.classList.remove("hidden");

  // show credit status only after goal exists
  const creditDisplay = document.getElementById("creditDisplay");
  creditDisplay.classList.remove("hidden");

 
}


  setThresholdBtn.addEventListener("click", () => {
  const today = new Date().toDateString();
  const savedDay = localStorage.getItem("thresholdDay");

  // 🚫 HARD STOP: already set today
  if (savedDay === today) {
  showThresholdNotice("Today’s credit goal is already set.");

  return;
}

  const value = Number(thresholdInput.value);
  if (!value || value <= 0) {
    alert("Please enter a valid credit goal");
    return;
  }

  CREDIT_LIMIT = value;
  goalSetToday = true;
  localStorage.setItem("dailyThreshold", value);
  localStorage.setItem("thresholdDay", today);

  lockedValue.textContent = `${value} credits`;
  thresholdSetter.classList.add("hidden");
  thresholdLocked.classList.remove("hidden");
  const creditDisplay = document.getElementById("creditDisplay");
  creditDisplay.classList.remove("hidden");

  updateCredits(0);
});


  // ---------- UNLOCK BUTTON ----------
  unlockBtn.addEventListener("click", () => {
    if (unlockBtn.disabled) return;
    alert("🔓 Box unlocked! (Arduino trigger here)");
  });
});

// -------------------------------
// ADD TASK
// -------------------------------
function addTask() {
  const nameInput = document.getElementById("taskName");
  const hoursInput = document.getElementById("hours");
const minutesInput = document.getElementById("minutes");

  const prioritySelect = document.getElementById("priority");
  const taskList = document.getElementById("taskList");

  const name = nameInput.value.trim();
  const hours = Number(hoursInput.value) || 0;
const minutes = Number(minutesInput.value) || 0;

const totalMinutes = hours * 60 + minutes;

if (totalMinutes <= 0) {
  alert("Please enter an estimated time");
  return;
}

  const priority = Number(prioritySelect.value);


  const li = document.createElement("li");
  li.classList.add("task");
  li.classList.add(priority === 3 ? "high" : priority === 2 ? "medium" : "low");

  const credits = Math.ceil((totalMinutes / 60) * priority);

  li.dataset.priority = priority;

  li.innerHTML = `
    <span class="task-name">${name}</span>
    <div class="task-badges">
      <span class="badge hours">${hours}h ${minutes}m</span>
      <span class="badge credits">+${credits}</span>
    </div>
    <button class="complete-btn">✓</button>
  `;

  taskList.appendChild(li);
  sortTasks();

  li.querySelector(".complete-btn").addEventListener("click", () => {
    completeTask(li, credits);
  });

  nameInput.value = "";
  hoursInput.value = "";
  minutesInput.value = "";

}

// -------------------------------
// COMPLETE TASK
// -------------------------------
function completeTask(taskElement, credits) {
  taskElement.style.pointerEvents = "none";
  taskElement.classList.add("completed");

  setTimeout(() => {
    document.getElementById("completedList").appendChild(taskElement);
    taskElement.classList.remove("completed");
    taskElement.classList.add("done");
    updateCredits(credits);
  }, 400);
}

// -------------------------------
// SORT TASKS
// -------------------------------
function sortTasks() {
  const taskList = document.getElementById("taskList");
  [...taskList.children]
    .sort((a, b) => b.dataset.priority - a.dataset.priority)
    .forEach(task => taskList.appendChild(task));
}

// -------------------------------
// UPDATE CREDITS
// -------------------------------
function updateCredits(amount) {
  const creditDisplay = document.getElementById("creditDisplay");

  totalCredits += amount;
  if (totalCredits > CREDIT_LIMIT) totalCredits = CREDIT_LIMIT;

  if (!goalSetToday) {
    creditDisplay.textContent = "";
    creditDisplay.classList.add("hidden");
    return;
  }

  creditDisplay.classList.remove("hidden");
  creditDisplay.textContent = `${totalCredits} / ${CREDIT_LIMIT} credits`;


  const percent = (totalCredits / CREDIT_LIMIT) * 100;
  document.getElementById("progressBar").style.width = percent + "%";

  const unlockBtn = document.getElementById("unlockBtn");

  if (totalCredits >= CREDIT_LIMIT) {
    unlockBtn.innerText = "🔓 Unlock Available";
    unlockBtn.disabled = false;
    unlockBtn.classList.add("unlocked");
  } else {
    unlockBtn.innerText = "🔒 Locked";
    unlockBtn.disabled = true;
    unlockBtn.classList.remove("unlocked");
  }
}

function showThresholdNotice(message) {
  const notice = document.getElementById("thresholdNotice");
  if (!notice) return;

  notice.textContent = message;
  notice.classList.remove("hidden");
  notice.classList.add("show");

  setTimeout(() => {
    notice.classList.remove("show");
  }, 3000);
}
