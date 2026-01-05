document.addEventListener("DOMContentLoaded", async () => {

  console.log("LOGIN JS LOADED");

  const supabaseUrl = "https://pdvjaxccdsziyvtznamb.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkdmpheGNjZHN6aXl2dHpuYW1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0MzUxNTEsImV4cCI6MjA4MzAxMTE1MX0.Ye8kHuBUVMZLgt6prnRfe9qSdk3KAOM1Fo6ABjR7b_E";   // <-- paste anon key ONLY
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
  const loginBox = document.getElementById("login-box");
  const dashboard = document.getElementById("dashboard");
  const loginError = document.getElementById("login-error");

  const usernameInput = document.getElementById("admin-username");
  const passwordInput = document.getElementById("admin-password");
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");

  const tableBody = document.getElementById("tasks-table");

  // restore admin session
  if(localStorage.getItem("adminUser")) showDashboard();

  // login
  loginBtn.addEventListener("click", async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if(!username || !password){
      loginError.textContent = "Enter username & password";
      return;
    }

    const { data, error } = await supabase
      .from("admins")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single();

    if(error || !data){
      loginError.textContent = "Invalid credentials";
      return;
    }

    localStorage.setItem("adminUser", username);
    showDashboard();
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("adminUser");
    dashboard.classList.add("hidden");
    loginBox.classList.remove("hidden");
  });

  // show dashboard + load tasks
  async function showDashboard() {
    loginBox.classList.add("hidden");
    dashboard.classList.remove("hidden");
    loadTasks();
  }

  // load all tasks
  async function loadTasks() {
    tableBody.innerHTML = "<tr><td colspan='6'>Loading...</td></tr>";

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if(error){
      tableBody.innerHTML = "<tr><td colspan='6'>Error loading tasks</td></tr>";
      return;
    }

    tableBody.innerHTML = "";

    data.forEach(task => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${task.user_id}</td>
        <td>${task.task_type}</td>
        <td>${task.content ?? task.image_url ?? ''}</td>
        <td>${task.status}</td>
        <td><button class="approve-btn">Approve</button></td>
        <td><button class="delete-btn">Delete</button></td>
      `;

      // Approve
      tr.querySelector(".approve-btn").addEventListener("click", () => approveTask(task.id, tr));

      // Delete
      tr.querySelector(".delete-btn").addEventListener("click", () => deleteTask(task.id, tr));

      tableBody.appendChild(tr);
    });
  }

  // Approve task
  async function approveTask(taskId, row) {
    const { error } = await supabase
      .from("tasks")
      .update({ status: "approved" })
      .eq("id", taskId);

    if(error){
      alert("Failed to approve task");
      return;
    }

    alert("Task approved!");
    row.querySelector("td:nth-child(4)").textContent = "approved";
  }

  // Delete task
  async function deleteTask(taskId, row) {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId);

    if(error){
      alert("Failed to delete");
      return;
    }

    alert("Task deleted!");
    row.remove();
  }

});
