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
      .select('streak_days, current_cycle_start, levels_completed_in_cycle, banked_vibe')
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

    console.log(`[check-cycle-completion] Profile data:`, {
      streak_days: profile.streak_days,
      current_cycle_start: profile.current_cycle_start,
      levels_completed_in_cycle: profile.levels_completed_in_cycle,
      banked_vibe: profile.banked_vibe,
    });

    // Add 50 VIBE to banked balance per lesson completed
    const vibeToAdd = 50;

    console.log('[check-cycle-completion] Adding', vibeToAdd, 'VIBE to banked balance');

    // Update banked_vibe and increment levels_completed_in_cycle
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        banked_vibe: (profile.banked_vibe || 0) + vibeToAdd,
        levels_completed_in_cycle: (profile.levels_completed_in_cycle || 0) + 1,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('[check-cycle-completion] Error updating banked VIBE:', updateError);
      throw updateError;
    }

    console.log('[check-cycle-completion] Successfully added VIBE to bank');

    return new Response(
      JSON.stringify({ 
        success: true,
        vibeAdded: vibeToAdd,
        newBankedAmount: (profile.banked_vibe || 0) + vibeToAdd,
        levelsInCycle: (profile.levels_completed_in_cycle || 0) + 1,
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