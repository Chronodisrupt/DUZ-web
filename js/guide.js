
// --- Initialize Supabase client ---
const supabaseUrl = "https://pdvjaxccdsziyvtznamb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkdmpheGNjZHN6aXl2dHpuYW1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0MzUxNTEsImV4cCI6MjA4MzAxMTE1MX0.Ye8kHuBUVMZLgt6prnRfe9qSdk3KAOM1Fo6ABjR7b_E";
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);


// Function to protect pages
async function protectPage() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    // Redirect to login if no session
    window.location.href = "login.html";
  }
}


async function loadUserInfo() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return; // safety check

  const userId = session.user.id;

  const { data: profile, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return alert(error.message);

  // Example: update elements in HTML
  const usernameElem = document.getElementById("username");
  const fullNameElem = document.getElementById("fullName");

  if (usernameElem) usernameElem.textContent = profile.username;
  if (fullNameElem) fullNameElem.textContent = profile.full_name;
}
