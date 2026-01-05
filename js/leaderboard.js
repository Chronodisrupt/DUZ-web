// ---------------------
// Hamburger toggle
// ---------------------
const btn = document.getElementById("menu-btn");
const nav = document.getElementById("nav-links");
btn.addEventListener("click", () => {
  btn.classList.toggle("active");
  nav.classList.toggle("open");
});


document.addEventListener("DOMContentLoaded", () => {

  const supabaseUrl = "https://pdvjaxccdsziyvtznamb.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkdmpheGNjZHN6aXl2dHpuYW1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0MzUxNTEsImV4cCI6MjA4MzAxMTE1MX0.Ye8kHuBUVMZLgt6prnRfe9qSdk3KAOM1Fo6ABjR7b_E";
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);



// ---------------------
// Leaderboard rendering
// ---------------------
const leaderboardList = document.getElementById("leaderboard-list");

async function renderLeaderboard() {
  leaderboardList.innerHTML = "<li>Loading...</li>";

  // Fetch top 10 users by balance
  const { data: users, error } = await supabase
    .from("users")
    .select("username, balance")
    .order("balance", { ascending: false })
    .limit(10);

  if (error) return leaderboardList.innerHTML = `<li>Error: ${error.message}</li>`;
  if (!users || users.length === 0) return leaderboardList.innerHTML = "<li>No users yet</li>";

  leaderboardList.innerHTML = "";

  users.forEach((user, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${user.username} — ${user.balance.toFixed(6)} DUZ`;
    li.style.opacity = 0;
    leaderboardList.appendChild(li);

    setTimeout(() => {
      li.style.transition = "opacity 0.5s ease, transform 0.5s ease";
      li.style.opacity = 1;
      li.style.transform = "translateY(0)";
    }, 50);
  });
}

// ---------------------
// Live refresh every 2 seconds
// ---------------------
renderLeaderboard();
setInterval(renderLeaderboard, 20000);




});
