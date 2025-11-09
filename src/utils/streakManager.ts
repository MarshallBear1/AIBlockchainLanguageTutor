import { supabase } from "@/integrations/supabase/client";

export async function updateStreak(): Promise<{ streak: number; coinsEarned: number }> {
  const defaultResult = { streak: 0, coinsEarned: 0 };

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('Error fetching user in updateStreak:', userError);
      return defaultResult;
    }

    if (!user) {
      console.warn('No user found in updateStreak');
      return defaultResult;
    }

    // Get current profile data
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('streak_days, last_practice_date')
      .eq('id', user.id)
      .single();

    if (fetchError) {
      console.error('Error fetching profile in updateStreak:', fetchError);
      return defaultResult;
    }

    if (!profile) {
      console.warn('No profile data found in updateStreak');
      return defaultResult;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    let newStreak = profile?.streak_days || 0;
    const lastPracticeDate = profile?.last_practice_date;

    if (!lastPracticeDate) {
      // First time practicing
      newStreak = 1;
    } else {
      const lastDate = new Date(lastPracticeDate);
      lastDate.setHours(0, 0, 0, 0);
      const lastDateStr = lastDate.toISOString().split('T')[0];
      
    if (lastDateStr === todayStr) {
      // Already practiced today, no streak change but still award coins
      const coinsEarned = 50 + (newStreak * 10);
      return { streak: newStreak, coinsEarned };
    } else {
        // Calculate days difference
        const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          // Consecutive day, increment streak
          newStreak += 1;
        } else {
          // Streak broken, reset to 1
          newStreak = 1;
        }
      }
    }

    // Update profile with new streak and practice date
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        streak_days: newStreak,
        last_practice_date: today.toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating streak in database:', updateError);
      return { streak: newStreak, coinsEarned: 50 };
    }

    // Award 50 base coins + 10 coins per streak day
    const coinsEarned = 50 + (newStreak * 10);

    return { streak: newStreak, coinsEarned };
  } catch (error) {
    console.error('Unexpected error in updateStreak:', error);
    return defaultResult;
  }
}

export async function getStreak(): Promise<number> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('Error fetching user in getStreak:', userError);
      return 0;
    }

    if (!user) {
      return 0;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('streak_days, last_practice_date')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile in getStreak:', profileError);
      return 0;
    }

    if (!profile) {
      console.warn('No profile found in getStreak');
      return 0;
    }

    // Check if streak is still valid (practiced within last 24 hours)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (profile.last_practice_date) {
      const lastDate = new Date(profile.last_practice_date);
      lastDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      // Streak is broken if more than 1 day has passed
      if (daysDiff > 1) {
        // Reset streak in database
        try {
          const { error: resetError } = await supabase
            .from('profiles')
            .update({ streak_days: 0 })
            .eq('id', user.id);

          if (resetError) {
            console.error('Error resetting streak:', resetError);
          }
        } catch (error) {
          console.error('Unexpected error resetting streak:', error);
        }
        return 0;
      }
    }

    return profile.streak_days || 0;
  } catch (error) {
    console.error('Unexpected error in getStreak:', error);
    return 0;
  }
}
