import { supabase } from './supabase';

// Helper to get or create a persistent device ID to act as our "user_id" for the MVP
export function getDeviceId(): string {
    if (typeof window === 'undefined') return '';
    let deviceId = localStorage.getItem('nexus_device_id');
    if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem('nexus_device_id', deviceId);
    }
    return deviceId;
}

export async function fetchAcademyData(userId: string) {
    // 1. Profile
    const { data: profile } = await supabase
        .from('academy_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

    // 2. Paper Trading
    const { data: paperTrading } = await supabase
        .from('academy_paper_trading')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

    // 3. SRS Data
    const { data: srsRows } = await supabase
        .from('academy_srs')
        .select('*')
        .eq('user_id', userId);

    // 4. Wrong Answers
    const { data: wrongAnswers } = await supabase
        .from('academy_wrong_answers')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(100);

    return { profile, paperTrading, srsRows: srsRows || [], wrongAnswers: wrongAnswers || [] };
}

export async function updateAcademyProfile(userId: string, updates: any) {
    const { error } = await supabase
        .from('academy_profiles')
        .upsert({ user_id: userId, ...updates, updated_at: new Date().toISOString() });
    if (error) console.error('Error updating profile:', error);
}

export async function updatePaperTradingData(userId: string, balance: number, positions: any[]) {
    const { error } = await supabase
        .from('academy_paper_trading')
        .upsert({ user_id: userId, balance, positions: JSON.stringify(positions), updated_at: new Date().toISOString() });
    if (error) console.error('Error updating paper trading:', error);
}

export async function upsertSrsCardDb(userId: string, cardId: string, srsData: any) {
    const { error } = await supabase
        .from('academy_srs')
        .upsert({
            user_id: userId,
            card_id: cardId,
            interval: srsData.interval,
            ease_factor: srsData.easeFactor,
            next_review: srsData.nextReview,
            repetitions: srsData.repetitions,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,card_id' });
    if (error) console.error('Error upserting SRS:', error);
}

export async function insertWrongAnswerDb(userId: string, data: any) {
    const { error } = await supabase
        .from('academy_wrong_answers')
        .insert({
            user_id: userId,
            question: data.question,
            user_answer: data.userAnswer,
            correct_answer: data.correctAnswer,
            subject: data.subject,
            date: data.date
        });
    if (error) console.error('Error inserting wrong answer:', error);
}
