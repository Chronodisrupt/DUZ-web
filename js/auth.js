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
    const referralCode = document.getElementById("referral")?.value.trim(); // optional

    if (!full_name || !username || !phone || !email || !password) {
      return alert("All fields are required");
    }

    // Create auth user
    const { data, error } = await supabaseClient.auth.signUp({ email, password });
    if (error) return alert(error.message);
    const user = data.user;

    // Determine referral
    let referredBy = null;
    let referrerId = null;
    if (referralCode) {
      const { data: refUser, error: refError } = await supabaseClient
        .from("profiles")
        .select("id, username, balance")
        .eq("referral_code", referralCode)
        .single();

      if (refError || !refUser) return alert("Invalid referral code");
      referredBy = refUser.username; // store username
      referrerId = refUser.id;
    }

    // Insert new user profile
    const { error: profileError } = await supabaseClient
      .from("profiles")
      .insert({
        id: user.id,
        full_name,
        username,
        phone,
        referral_code: username, // unique code = username
        referred_by: referredBy,
        balance: 0
      });

    if (profileError) return alert(profileError.message);

    //  Update referrer balance if applicable
    if (referrerId) {
      if (referrerId) {
  // Get current balance
  const { data: refData, error: getError } = await supabaseClient
    .from("profiles")
    .select("balance")
    .eq("id", referrerId)
    .single();

  if (getError) console.error(getError);

  // Update balance
  const newBalance = (refData?.balance || 0) + 0.01;
  const { error: bonusError } = await supabaseClient
    .from("profiles")
    .update({ balance: newBalance })
    .eq("id", referrerId);

  if (bonusError) console.error(bonusError.message);
} 
    }

    alert("Account created! Referral bonus applied if any.");
    window.location.href = "login.html";
  });
} 

  if (mode === "login") {
    const btn = document.getElementById("login-btn");
    btn.addEventListener("click", async () => {
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      if (!email || !password) return alert("Please enter email and password");

      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) return alert(error.message);

      //  Save session in localStorage
      localStorage.setItem("user_session", JSON.stringify(data.session));

      alert("Logged in!");
      window.location.href = "dashboard.html";
    });
  }
}

// --- Optional: protect pages ---
async function protectPage() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) window.location.href = "login.html";
} 
