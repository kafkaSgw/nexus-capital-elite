const { createClient } = require('@supabase/supabase-js')

const url = 'https://akbyyjrokdibtpdjmzab.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrYnl5anJva2RpYnRwZGptemFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNjUwMDcsImV4cCI6MjA4ODc0MTAwN30.9ns-D2Q_LBSu05XGSm4qE5JXVjiyiGnyE23cDh9uFs4'

const supabase = createClient(url, key)

async function testAuth() {
    console.log('=== Testing Supabase Auth ===')
    console.log('URL:', url)
    
    // 1. List users via admin? No, let's just try signup + signin
    // First, try to sign up a test user
    const testEmail = 'test_debug_' + Date.now() + '@test.com'
    const testPass = 'Test123456!'
    
    console.log('\n1. Trying to sign up:', testEmail)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPass,
        options: { data: { full_name: 'Debug Test' } }
    })
    
    if (signUpError) {
        console.log('   Sign Up ERROR:', signUpError.message)
        console.log('   Full error:', JSON.stringify(signUpError, null, 2))
    } else {
        console.log('   Sign Up OK!')
        console.log('   User ID:', signUpData.user?.id)
        console.log('   Session exists?', !!signUpData.session)
        console.log('   Email confirmed?', signUpData.user?.email_confirmed_at)
        console.log('   Identities:', signUpData.user?.identities?.length)
    }
    
    // 2. Try to sign in immediately
    console.log('\n2. Trying to sign in with same credentials...')
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPass,
    })
    
    if (signInError) {
        console.log('   Sign In ERROR:', signInError.message)
        console.log('   Error status:', signInError.status)
        console.log('   Full error:', JSON.stringify(signInError, null, 2))
    } else {
        console.log('   Sign In OK!')
        console.log('   Session exists?', !!signInData.session)
        console.log('   User email:', signInData.user?.email)
    }

    // 3. Clean up - sign out
    await supabase.auth.signOut()
    console.log('\n=== Done ===')
}

testAuth().catch(console.error)
