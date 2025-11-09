import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { ethers } from 'https://esm.sh/ethers@6.7.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ERC-20 ABI (only the transfer function)
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)'
];

interface WithdrawRequest {
  userId: string;
}

// Calculate streak multiplier based on streak days
function getStreakMultiplier(streakDays: number): number {
  if (streakDays >= 60) return 3.0;
  if (streakDays >= 30) return 2.5;
  if (streakDays >= 14) return 2.0;
  if (streakDays >= 7) return 1.5;
  return 1.0;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId } = await req.json() as WithdrawRequest;

    console.log('[withdraw-vibe] Processing withdrawal for user:', userId);

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('banked_vibe, streak_days, wallet_address, current_cycle_start, levels_completed_in_cycle')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('[withdraw-vibe] Error fetching profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user profile' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!profile) {
      console.error('[withdraw-vibe] Profile not found');
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    console.log('[withdraw-vibe] Profile data:', {
      banked_vibe: profile.banked_vibe,
      streak_days: profile.streak_days,
      wallet_address: profile.wallet_address,
    });

    // Validate banked_vibe amount
    if (profile.banked_vibe <= 0) {
      return new Response(
        JSON.stringify({ error: 'No VIBE tokens to withdraw' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Calculate multiplier and payout
    const multiplier = getStreakMultiplier(profile.streak_days);
    const payoutAmount = Math.floor(profile.banked_vibe * multiplier);

    console.log('[withdraw-vibe] Calculated payout:', {
      banked: profile.banked_vibe,
      multiplier,
      payout: payoutAmount,
    });

    // Get next cycle number
    const { data: existingRewards } = await supabase
      .from('vibe_rewards')
      .select('cycle_number')
      .eq('user_id', userId)
      .order('cycle_number', { ascending: false })
      .limit(1);

    const nextCycleNumber = existingRewards && existingRewards.length > 0 
      ? existingRewards[0].cycle_number + 1 
      : 1;

    // Initialize blockchain variables
    let txHash: string | null = null;
    let finalStatus = 'no_wallet';

    // If wallet is connected, send tokens immediately
    if (profile.wallet_address) {
      try {
        const rpcUrl = Deno.env.get('RPC_URL');
        const treasuryPrivateKey = Deno.env.get('TREASURY_PRIVATE_KEY');
        const vibeTokenAddress = Deno.env.get('VIBE_TOKEN_ADDRESS');

        if (rpcUrl && treasuryPrivateKey && vibeTokenAddress) {
          console.log('[withdraw-vibe] Initiating instant blockchain transfer...');
          
          const provider = new ethers.JsonRpcProvider(rpcUrl);
          const wallet = new ethers.Wallet(treasuryPrivateKey, provider);
          const tokenContract = new ethers.Contract(vibeTokenAddress, ERC20_ABI, wallet);
          
          const decimals = await tokenContract.decimals();
          const amount = ethers.parseUnits(payoutAmount.toString(), decimals);
          
          console.log(`[withdraw-vibe] Sending ${payoutAmount} VIBE to ${profile.wallet_address}`);
          
          const tx = await tokenContract.transfer(profile.wallet_address, amount);
          txHash = tx.hash;
          finalStatus = 'paid';
          
          console.log(`[withdraw-vibe] Transaction sent instantly: ${txHash}`);
          
          // Transaction confirmation happens in background
          tx.wait().then((receipt: any) => {
            console.log(`[withdraw-vibe] Transaction confirmed in block ${receipt.blockNumber}`);
          }).catch((error: any) => {
            console.error('[withdraw-vibe] Transaction confirmation failed:', error);
          });
        } else {
          console.warn('[withdraw-vibe] Missing blockchain env vars, falling back to pending');
          finalStatus = 'pending';
        }
      } catch (error) {
        console.error('[withdraw-vibe] Blockchain transfer failed:', error);
        finalStatus = 'failed';
      }
    }

    // Create reward entry with transaction info
    const { data: reward, error: rewardError } = await supabase
      .from('vibe_rewards')
      .insert({
        user_id: userId,
        cycle_number: nextCycleNumber,
        cycle_start_date: profile.current_cycle_start,
        cycle_end_date: new Date().toISOString(),
        levels_completed: profile.levels_completed_in_cycle,
        amount_vibe: payoutAmount,
        status: finalStatus,
        tx_hash: txHash,
        paid_at: finalStatus === 'paid' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (rewardError) {
      console.error('[withdraw-vibe] Error creating reward:', rewardError);
      return new Response(
        JSON.stringify({ error: 'Failed to create reward entry' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('[withdraw-vibe] Reward created:', reward);

    // Reset banked_vibe and cycle progress
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        banked_vibe: 0,
        levels_completed_in_cycle: 0,
        current_cycle_start: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('[withdraw-vibe] Error updating profile:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to reset banked balance' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('[withdraw-vibe] Withdrawal successful');

    return new Response(
      JSON.stringify({
        success: true,
        reward,
        multiplier,
        bankedAmount: profile.banked_vibe,
        payoutAmount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('[withdraw-vibe] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
