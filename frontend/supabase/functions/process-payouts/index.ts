import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ethers } from 'https://esm.sh/ethers@6.7.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ERC-20 ABI (only the transfer function)
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)'
];

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[process-payouts] Starting payout process...');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get environment variables
    const rpcUrl = Deno.env.get('RPC_URL');
    const treasuryPrivateKey = Deno.env.get('TREASURY_PRIVATE_KEY');
    const vibeTokenAddress = Deno.env.get('VIBE_TOKEN_ADDRESS');

    if (!rpcUrl || !treasuryPrivateKey || !vibeTokenAddress) {
      throw new Error('Missing required environment variables');
    }

    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(treasuryPrivateKey, provider);
    const tokenContract = new ethers.Contract(vibeTokenAddress, ERC20_ABI, wallet);

    console.log(`[process-payouts] Treasury wallet: ${wallet.address}`);

    // Get decimals
    const decimals = await tokenContract.decimals();
    console.log(`[process-payouts] Token decimals: ${decimals}`);

    // Get all pending rewards with wallet addresses
    const { data: pendingRewards, error: fetchError } = await supabaseClient
      .from('vibe_rewards')
      .select('id, user_id, amount_vibe, profiles!inner(wallet_address)')
      .eq('status', 'pending')
      .not('profiles.wallet_address', 'is', null);

    if (fetchError) {
      console.error('[process-payouts] Error fetching pending rewards:', fetchError);
      throw fetchError;
    }

    if (!pendingRewards || pendingRewards.length === 0) {
      console.log('[process-payouts] No pending rewards to process');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No pending payouts',
          processed: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[process-payouts] Found ${pendingRewards.length} pending rewards`);

    const results = [];

    // Process each reward
    for (const reward of pendingRewards) {
      try {
        const walletAddress = (reward.profiles as any).wallet_address;
        const amount = ethers.parseUnits(reward.amount_vibe.toString(), decimals);

        console.log(`[process-payouts] Processing reward ${reward.id} for user ${reward.user_id}`);
        console.log(`[process-payouts] Sending ${reward.amount_vibe} VIBE to ${walletAddress}`);

        // Send tokens
        const tx = await tokenContract.transfer(walletAddress, amount);
        console.log(`[process-payouts] Transaction sent: ${tx.hash}`);
        
        // Wait for confirmation
        const receipt = await tx.wait();
        console.log(`[process-payouts] Transaction confirmed in block ${receipt.blockNumber}`);

        // Update reward status
        const { error: updateError } = await supabaseClient
          .from('vibe_rewards')
          .update({
            status: 'paid',
            tx_hash: tx.hash,
            paid_at: new Date().toISOString(),
          })
          .eq('id', reward.id);

        if (updateError) {
          console.error(`[process-payouts] Error updating reward ${reward.id}:`, updateError);
        }

        results.push({
          rewardId: reward.id,
          success: true,
          txHash: tx.hash,
        });

        console.log(`[process-payouts] Successfully processed reward ${reward.id}`);

      } catch (error) {
        console.error(`[process-payouts] Error processing reward ${reward.id}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        // Mark as failed
        await supabaseClient
          .from('vibe_rewards')
          .update({
            status: 'failed',
          })
          .eq('id', reward.id);

        results.push({
          rewardId: reward.id,
          success: false,
          error: errorMessage,
        });
      }
    }

    console.log('[process-payouts] Payout process completed');
    console.log(`[process-payouts] Results:`, results);

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[process-payouts] Critical error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});