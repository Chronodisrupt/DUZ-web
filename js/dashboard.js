document.addEventListener("DOMContentLoaded", async () => {

  console.log("DASHBOARD JS LOADED");

  const supabaseUrl = "https://pdvjaxccdsziyvtznamb.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkdmpheGNjZHN6aXl2dHpuYW1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0MzUxNTEsImV4cCI6MjA4MzAxMTE1MX0.Ye8kHuBUVMZLgt6prnRfe9qSdk3KAOM1Fo6ABjR7b_E";
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);


  // Get logged-in user session

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = "login.html";
    return;
  }

  const userId = session.user.id;


  // Get user profile (username & balance)

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username, balance")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    console.error("Failed to load profile:", profileError);
    return;
  }

  document.getElementById("username-display").textContent = profile.username;
  document.getElementById("balance").textContent = (profile.balance || 0).toFixed(4) + " DUZ";


  // Get tasks for this user

  const { data: tasks, error: taskError } = await supabase
    .from("tasks")
    .select("task_type, status, reward")
    .eq("user_id", userId);

  if (taskError) {
    console.error("Failed to load tasks:", taskError);
    return;
  }

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
      const li = document.createElement("li");
      li.textContent = `${task.task_type} : +${task.reward} DUZ`;
      completedList.appendChild(li);
    }
  });

}); 
