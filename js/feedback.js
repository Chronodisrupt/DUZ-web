// ---------------------
// Hamburger toggle
// ---------------------
const btn = document.getElementById("menu-btn");
const nav = document.getElementById("nav-links");
btn.addEventListener("click", () => {
  btn.classList.toggle("active");
  nav.classList.toggle("open");
});



document.addEventListener("DOMContentLoaded", async () => {

  console.log("DASHBOARD JS LOADED");

  const supabaseUrl = "https://pdvjaxccdsziyvtznamb.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkdmpheGNjZHN6aXl2dHpuYW1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0MzUxNTEsImV4cCI6MjA4MzAxMTE1MX0.Ye8kHuBUVMZLgt6prnRfe9qSdk3KAOM1Fo6ABjR7b_E";
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);


  // Check session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = "login.html";
    return;
  }

  const userId = session.user.id;

  // Logout button
  document.getElementById("logout-btn").addEventListener("click", async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("user_session");
    window.location.href = "login.html";
  });

  // Submit feedback
  document.getElementById("feedback-submit").addEventListener("click", async () => {
    const content = document.getElementById("feedback-text").value.trim();
    if (!content) return alert("Please write your feedback");

    // Check if feedback in last 7 days
    const { data: recentFeedback, error: checkError } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("task_type", "feedback")
      .gte("created_at", new Date(Date.now() - 7*24*60*60*1000).toISOString());

    if (checkError) return alert("Error checking previous feedback");
    if (recentFeedback && recentFeedback.length > 0) {
      return alert("You can only submit feedback once per week");
    }

    // Insert as a pending task
    const { error } = await supabase
      .from("tasks")
      .insert({
        user_id: userId,
        task_type: "feedback",
        content: content,
        reward: 0.0014,      // reward DUZ
        status: "pending",
        created_at: new Date().toISOString()
      });

    if (error) return alert("Failed to submit feedback: " + error.message);

    alert("Feedback submitted! Awaiting admin approval.");
    document.getElementById("feedback-text").value = "";
  });

});
