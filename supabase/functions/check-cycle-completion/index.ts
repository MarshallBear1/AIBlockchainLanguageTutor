import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CycleCompletionRequest {
  userId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId } = await req.json() as CycleCompletionRequest;

    console.log(`[check-cycle-completion] Checking cycle for user: ${userId}`);

    // Get user's current profile data
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('streak_days, current_cycle_start, levels_completed_in_cycle, wallet_address')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('[check-cycle-completion] Error fetching profile:', profileError);
      throw profileError;
    }

    if (!profile) {
      console.log('[check-cycle-completion] Profile not found');
      return new Response(
        JSON.stringify({ success: false, message: 'Profile not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    console.log(`[check-cycle-completion] Profile data:`, profile);

    // Check if user has completed a 30-day cycle
    if (profile.streak_days < 30) {
      console.log(`[check-cycle-completion] Streak not complete yet: ${profile.streak_days}/30 days`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Cycle not complete',
          streakDays: profile.streak_days
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate cycle number
    const { data: previousRewards, error: rewardsError } = await supabaseClient
      .from('vibe_rewards')
      .select('cycle_number')
      .eq('user_id', userId)
      .order('cycle_number', { ascending: false })
      .limit(1);

    if (rewardsError) {
      console.error('[check-cycle-completion] Error fetching previous rewards:', rewardsError);
    }

    const nextCycleNumber = (previousRewards && previousRewards.length > 0) 
      ? previousRewards[0].cycle_number + 1 
      : 1;

    const cycleStartDate = new Date(profile.current_cycle_start);
    const cycleEndDate = new Date();
    const amountVibe = profile.levels_completed_in_cycle * 50;

    console.log(`[check-cycle-completion] Creating reward for cycle ${nextCycleNumber}: ${amountVibe} VIBE`);

    // Check if reward already exists for this cycle
    const { data: existingReward } = await supabaseClient
      .from('vibe_rewards')
      .select('id')
      .eq('user_id', userId)
      .eq('cycle_number', nextCycleNumber)
      .single();

    if (existingReward) {
      console.log('[check-cycle-completion] Reward already exists for this cycle');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Reward already created for this cycle' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create reward entry
    const { data: reward, error: rewardError } = await supabaseClient
      .from('vibe_rewards')
      .insert({
        user_id: userId,
        cycle_number: nextCycleNumber,
        cycle_start_date: cycleStartDate.toISOString(),
        cycle_end_date: cycleEndDate.toISOString(),
        levels_completed: profile.levels_completed_in_cycle,
        amount_vibe: amountVibe,
        status: profile.wallet_address ? 'pending' : 'no_wallet',
      })
      .select()
      .single();

    if (rewardError) {
      console.error('[check-cycle-completion] Error creating reward:', rewardError);
      throw rewardError;
    }

    console.log(`[check-cycle-completion] Reward created successfully:`, reward);

    // Reset cycle counters
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        current_cycle_start: new Date().toISOString(),
        levels_completed_in_cycle: 0,
        streak_days: 0, // Reset streak after completing cycle
        streak_start_date: null,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('[check-cycle-completion] Error resetting cycle:', updateError);
      throw updateError;
    }

    console.log('[check-cycle-completion] Cycle reset successfully');

    return new Response(
      JSON.stringify({
        success: true,
        reward,
        message: profile.wallet_address 
          ? 'Cycle completed! Tokens will be sent shortly.'
          : 'Cycle completed! Connect a wallet to receive your tokens.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[check-cycle-completion] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});