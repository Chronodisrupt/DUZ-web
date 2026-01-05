document.addEventListener("DOMContentLoaded", async () => {

  console.log("LOGIN JS LOADED");

  const supabaseUrl = "https://pdvjaxccdsziyvtznamb.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkdmpheGNjZHN6aXl2dHpuYW1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0MzUxNTEsImV4cCI6MjA4MzAxMTE1MX0.Ye8kHuBUVMZLgt6prnRfe9qSdk3KAOM1Fo6ABjR7b_E";   // <-- paste anon key ONLY
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
  // ---------------------
  // Get logged-in user session
  // ---------------------
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    // Not logged in → redirect
    window.location.href = "login.html";
    return;
  }

  const userId = session.user.id;

  // ---------------------
  // Get user profile (username)
  // ---------------------
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    console.error("Failed to load profile:", profileError);
    return;
  }

  document.getElementById("username-display").textContent = profile.username;

  // ---------------------
  // Get tasks for this user
  // ---------------------
  const { data: tasks, error: taskError } = await supabase
    .from("tasks")
    .select("task_type, status, reward")
    .eq("user_id", userId);

  if (taskError) {
    console.error("Failed to load tasks:", taskError);
    return;
  }

  let balance = 0;

  const pendingList = document.getElementById("pending-list");
  const completedList = document.getElementById("completed-list");

  pendingList.innerHTML = "";
  completedList.innerHTML = "";

  tasks.forEach(task => {
    if (task.status === "pending") {
      const li = document.createElement("li");
      li.textContent = `${task.task_type} : waiting approval`;
      pendingList.appendChild(li);
    } else if (task.status === "approved") {
      balance += Number(task.reward);

      const li = document.createElement("li");
      li.textContent = `${task.task_type} : +${task.reward} DUZ`;
      completedList.appendChild(li);
    }
  });

  document.getElementById("balance").textContent = balance.toFixed(4);
});
