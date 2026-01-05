

// --- Initialize Supabase client ---
const supabaseUrl = "https://pdvjaxccdsziyvtznamb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkdmpheGNjZHN6aXl2dHpuYW1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0MzUxNTEsImV4cCI6MjA4MzAxMTE1MX0.Ye8kHuBUVMZLgt6prnRfe9qSdk3KAOM1Fo6ABjR7b_E";
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- Main function ---
function authInit(mode) {
  if (mode === "signup") {
    const btn = document.getElementById("signup-btn");
    btn.addEventListener("click", async () => {
      const full_name = document.getElementById("name").value.trim();
      const username  = document.getElementById("username").value.trim();
      const phone     = document.getElementById("phone").value.trim();
      const email     = document.getElementById("email").value.trim();
      const password  = document.getElementById("password").value;

      if (!full_name || !username || !phone || !email || !password) {
        return alert("All fields are required");
      }

      // 1️⃣ Create auth user
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password
      });
      if (error) return alert(error.message);

      const user = data.user;

      // 2️⃣ Insert profile
      const { error: profileError } = await supabaseClient
        .from("profiles")
        .insert({ id: user.id, full_name, username, phone });

      if (profileError) return alert(profileError.message);

      alert("Account created — now login!");
      window.location.href = "login.html";
    });
  }

  if (mode === "login") {
    const btn = document.getElementById("login-btn");
    btn.addEventListener("click", async () => {
      const email    = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      if (!email || !password) return alert("Please enter email and password");

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });
      if (error) return alert(error.message);

      // ✅ Save session in localStorage
      localStorage.setItem("user_session", JSON.stringify(data.session));

      alert("Logged in!");
      window.location.href = "dashboard.html";
    });
  }
}

// --- Optional: protect pages ---
async function protectPage() {
  const session = await supabaseClient.auth.getSession();
  if (!session.data.session) {
    window.location.href = "login.html";
  }
}