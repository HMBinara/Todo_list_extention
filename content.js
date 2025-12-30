// Create and inject the Launcher with SVG Ring
const launcher = document.createElement('div');
launcher.id = 'binara-task-launcher';
launcher.innerHTML = `
    <svg class="task-ring" viewBox="0 0 36 36">
        <path class="ring-segment seg-0" id="seg-0" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" stroke-dasharray="20, 100" stroke-dashoffset="0" />
        <path class="ring-segment seg-1" id="seg-1" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" stroke-dasharray="20, 100" stroke-dashoffset="-25" />
        <path class="ring-segment seg-2" id="seg-2" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" stroke-dasharray="20, 100" stroke-dashoffset="-50" />
        <path class="ring-segment seg-3" id="seg-3" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" stroke-dasharray="20, 100" stroke-dashoffset="-75" />
    </svg>
    <span style="font-size: 18px; z-index: 2;">📋</span>
`;
document.body.appendChild(launcher);

// Create and inject the Dashboard
const dashboard = document.createElement('div');
dashboard.id = 'binara-dashboard';
dashboard.innerHTML = `
    <div style="position:absolute; top:25px; right:25px; cursor:pointer; font-size:24px;" id="dash-close">×</div>
    <div style="font-size:20px; font-weight:bold; margin-bottom:20px; color:#3d5afe;">Priority Tasks</div>
    <input type="text" id="task-input" placeholder="+ Add high priority task...">
    <div id="dash-list"></div>
    <button id="clear-all">Clear All Tasks</button>
`;
document.body.appendChild(dashboard);

// Update the visual status of the ring segments
function updateRing(tasks) {
    for (let i = 0; i < 4; i++) {
        const seg = document.getElementById(`seg-${i}`);
        if (seg) {
            // Activate segment if task exists and is not completed
            if (tasks[i] && !tasks[i].completed) {
                seg.classList.add('active');
            } else {
                seg.classList.remove('active');
            }
        }
    }
}

// Render the task list in the dashboard
function renderTasks() {
    chrome.storage.local.get(['tasks'], (res) => {
        const tasks = res.tasks || [];
        updateRing(tasks);

        const list = document.getElementById('dash-list');
        list.innerHTML = "";

        // Defined priority colors for the list borders
        const priorityColors = ['#ff5252', '#ffa726', '#29b6f6', '#66bb6a'];

        tasks.forEach((task, index) => {
            const div = document.createElement('div');
            div.className = `task-item border-${index}`;

            // Apply priority border color programmatically
            div.style.borderLeft = `5px solid ${priorityColors[index]}`;

            div.innerHTML = `
                <span class="task-text ${task.completed ? 'completed' : ''}" id="task-${index}">${task.text}</span>
                <span class="delete-btn" id="del-${index}">×</span>
            `;
            list.appendChild(div);

            // Task event listeners
            document.getElementById(`task-${index}`).onclick = () => toggleTask(index);
            document.getElementById(`del-${index}`).onclick = () => deleteTask(index);
        });
    });
}

// Add new task when Enter key is pressed
document.getElementById('task-input').onkeypress = (e) => {
    if (e.key === 'Enter' && e.target.value.trim() !== "") {
        chrome.storage.local.get(['tasks'], (res) => {
            const tasks = res.tasks || [];
            // Limit to maximum 4 tasks
            if (tasks.length >= 4) return;
            tasks.push({ text: e.target.value, completed: false });
            chrome.storage.local.set({ tasks: tasks }, () => {
                e.target.value = "";
                renderTasks();
            });
        });
    }
};

// Toggle task completion status
function toggleTask(index) {
    chrome.storage.local.get(['tasks'], (res) => {
        const tasks = res.tasks;
        tasks[index].completed = !tasks[index].completed;
        chrome.storage.local.set({ tasks: tasks }, renderTasks);
    });
}

// Delete a single task
function deleteTask(index) {
    chrome.storage.local.get(['tasks'], (res) => {
        let tasks = res.tasks;
        tasks.splice(index, 1);
        chrome.storage.local.set({ tasks: tasks }, renderTasks);
    });
}

// Clear all tasks from storage
document.getElementById('clear-all').onclick = () => {
    chrome.storage.local.set({ tasks: [] }, renderTasks);
};

// Open and Close Dashboard events
launcher.onclick = () => {
    dashboard.classList.add('open');
    renderTasks();
};

document.getElementById('dash-close').onclick = () => dashboard.classList.remove('open');

// Initialize the display on load
renderTasks();