
const { createClient } = require('@supabase/supabase-js');

try {
    console.log("Testing with empty strings...");
    const supabase = createClient("", "");
    console.log("Success with empty strings");
} catch (e) {
    console.log("Failed with empty strings:", e.message);
}

try {
    console.log("Testing with invalid URL...");
    const supabase = createClient("not-a-url", "key");
    console.log("Success with invalid URL");
} catch (e) {
    console.log("Failed with invalid URL:", e.message);
}
