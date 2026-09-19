import { supabase } from './supabaseclient';

// 1. Exact TypeScript Interface matching your table columns
export interface User {
    id: string;
    username: string;
    email: string;
    created_at: string;
}

// ==========================================
// AUTHENTICATION & ACCOUNT REGISTRATION
// ==========================================

// 2. API: Sign Up a new user
// Creates account in Supabase Auth AND creates a row in your public "user" table!
export async function signUpUser(email: string, password: string, username: string) {
    // 1. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        console.error('Auth sign up error:', authError.message);
        throw authError;
    }

    if (!authData.user) {
        throw new Error('User sign up failed.');
    }

    // 2. Insert into your public "user" table
    const { data: profileUser, error: profileError } = await supabase
        .from('user')
        .insert([
            {
                id: authData.user.id,
                username: username.trim(),
                email: email.trim().toLowerCase(),
            },
        ])
        .select()
        .single();

    if (profileError) {
        console.error('Error inserting into public user table:', profileError.message);
        throw profileError;
    }

    return { authUser: authData.user, user: profileUser as User };
}

// 3. API: Sign In with Email & Password
export async function signInUser(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error('Sign in error:', error.message);
        throw error;
    }

    return data;
}

// 4. API: Sign Out
export async function signOutUser() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Sign out error:', error.message);
        throw error;
    }
}

// ==========================================
// USER PROFILE FETCHING
// ==========================================

// 5. API: Get Current Logged-In User Profile
export async function getCurrentUserProfile(): Promise<User | null> {
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) return null;

    const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq('id', authUser.id)
        .single();

    if (error) {
        console.error('Error fetching current user profile:', error.message);
        return null;
    }

    return data as User;
}

// 6. API: Get User by ID
export async function getUserById(userId: string): Promise<User | null> {
    const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error(`Error fetching user ${userId}:`, error.message);
        return null;
    }

    return data as User;
}

// 7. API: Get User by Username (e.g., viewing /u/username)
export async function getUserByUsername(username: string): Promise<User | null> {
    const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq('username', username.trim())
        .single();

    if (error) {
        console.error(`Error fetching user @${username}:`, error.message);
        return null;
    }

    return data as User;
}

// 8. API: Check if a Username is Available (For registration form)
export async function isUsernameAvailable(username: string): Promise<boolean> {
    const { data } = await supabase
        .from('user')
        .select('id')
        .eq('username', username.trim())
        .maybeSingle();

    return !data; // true = available, false = already taken
}