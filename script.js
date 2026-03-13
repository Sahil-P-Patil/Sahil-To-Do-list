// Load saved tasks from localStorage, or start with an empty array
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Draw all tasks on the screen
function renderTasks() {
  const list = document.getElementById('task-list');

  // Filter tasks based on the active filter button
  let visibleTasks = tasks;
  if (currentFilter === 'active') {
    visibleTasks = tasks.filter(task => !task.completed);
  } else if (currentFilter === 'completed') {
    visibleTasks = tasks.filter(task => task.completed);
  }

  list.innerHTML = '';

  visibleTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.dataset.id = task.id;

    li.innerHTML = `
      <button class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleComplete(${task.id})">
        ${task.completed ? '✓' : ''}
      </button>
      <span class="task-text">${escapeHTML(task.text)}</span>
      <div class="task-actions">
        <button class="icon-btn edit-btn" onclick="startEdit(${task.id})">✏️</button>
        <button class="icon-btn delete-btn" onclick="deleteTask(${task.id})">🗑</button>
      </div>
    `;

    list.appendChild(li);
  });

  updateStats();
  updateEmptyState(visibleTasks.length);
}

// Update the Total / Done / Pending numbers
function updateStats() {
  const total     = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending   = total - completed;

  document.getElementById('total-count').textContent     = total;
  document.getElementById('completed-count').textContent = completed;
  document.getElementById('pending-count').textContent   = pending;
}

// Show or hide the "No tasks yet" message
function updateEmptyState(visibleCount) {
  document.getElementById('empty-state').style.display = visibleCount === 0 ? 'block' : 'none';
}

// Prevent special characters from breaking the HTML
function escapeHTML(text) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

// Add a new task
function addTask() {
  const input = document.getElementById('task-input');
  const text  = input.value.trim();

  if (!text) {
    input.focus();
    input.style.border = '2px solid #dc2626';
    setTimeout(() => { input.style.border = ''; }, 600);
    return;
  }

  tasks.push({ id: Date.now(), text: text, completed: false });
  saveTasks();
  renderTasks();

  input.value = '';
  input.focus();
}

// Press Enter to add a task
document.getElementById('task-input').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') addTask();
});

// Mark a task as done or not done
function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
}

// Delete a task
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

// Switch the task text to an editable input field
function startEdit(id) {
  const li         = document.querySelector(`[data-id="${id}"]`);
  const textSpan   = li.querySelector('.task-text');
  const actionsDiv = li.querySelector('.task-actions');
  const task       = tasks.find(t => t.id === id);

  const editInput     = document.createElement('input');
  editInput.type      = 'text';
  editInput.className = 'edit-input';
  editInput.value     = task.text;
  editInput.maxLength = 120;

  li.replaceChild(editInput, textSpan);
  editInput.focus();
  editInput.select();

  actionsDiv.innerHTML = `
    <button class="icon-btn save-btn" onclick="saveEdit(${id})">💾</button>
    <button class="icon-btn delete-btn" onclick="deleteTask(${id})">🗑</button>
  `;

  editInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter')  saveEdit(id);
    if (event.key === 'Escape') renderTasks();
  });
}

// Save the edited task text
function saveEdit(id) {
  const li        = document.querySelector(`[data-id="${id}"]`);
  const editInput = li && li.querySelector('.edit-input');
  if (!editInput) return;

  const newText = editInput.value.trim();
  if (!newText) {
    editInput.style.borderColor = '#dc2626';
    return;
  }

  const task = tasks.find(t => t.id === id);
  if (task) {
    task.text = newText;
    saveTasks();
    renderTasks();
  }
}

// Switch between All / Active / Completed views
function filterTasks(filter) {
  currentFilter = filter;

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent.trim().toLowerCase() === filter) {
      btn.classList.add('active');
    }
  });

  renderTasks();
}

// Delete all completed tasks
function clearCompleted() {
  const completedCount = tasks.filter(t => t.completed).length;

  if (completedCount === 0) {
    alert('No completed tasks to clear!');
    return;
  }

  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  renderTasks();
}

// Run on page load
renderTasks();