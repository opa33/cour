// Debug script to check leaderboard data in Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("🔍 Supabase Configuration:");
console.log("URL:", supabaseUrl);
console.log("Key:", supabaseKey ? "✅ Set" : "❌ Not set");

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Supabase not configured!");
  process.exit(1);
}

// Import Supabase dynamically
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
  try {
    // Check shifts table
    console.log("\n📊 Fetching shifts...");
    const { data: shifts, error: shiftsError } = await supabase
      .from("shifts")
      .select("*")
      .limit(5);

    if (shiftsError) {
      console.error("❌ Error fetching shifts:", shiftsError);
    } else {
      console.log(`✅ Found ${shifts?.length || 0} shifts:`);
      console.log(JSON.stringify(shifts, null, 2));
    }

    // Check users table
    console.log("\n👥 Fetching users...");
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .limit(5);

    if (usersError) {
      console.error("❌ Error fetching users:", usersError);
    } else {
      console.log(`✅ Found ${users?.length || 0} users:`);
      console.log(JSON.stringify(users, null, 2));
    }

    // Check leaderboard_cache table
    console.log("\n🏆 Fetching leaderboard_cache...");
    const { data: cache, error: cacheError } = await supabase
      .from("leaderboard_cache")
      .select("*")
      .limit(5);

    if (cacheError) {
      console.error("❌ Error fetching leaderboard_cache:", cacheError);
    } else {
      console.log(`✅ Found ${cache?.length || 0} cache entries:`);
      console.log(JSON.stringify(cache, null, 2));
    }
  } catch (error) {
    console.error("❌ Script error:", error);
  }

  process.exit(0);
}

debug();
