import { ethers } from 'https://esm.sh/ethers@6.7.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ERC-20 ABI for balance check
const ERC20_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)'
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[test-treasury] Testing blockchain connection...');

    // Get environment variables
    const rpcUrl = Deno.env.get('RPC_URL');
    const treasuryPrivateKey = Deno.env.get('TREASURY_PRIVATE_KEY');
    const vibeTokenAddress = Deno.env.get('VIBE_TOKEN_ADDRESS');

    // Check if all required env vars are present
    const missingVars = [];
    if (!rpcUrl) missingVars.push('RPC_URL');
    if (!treasuryPrivateKey) missingVars.push('TREASURY_PRIVATE_KEY');
    if (!vibeTokenAddress) missingVars.push('VIBE_TOKEN_ADDRESS');

    if (missingVars.length > 0) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Missing configuration',
          missingVars,
          message: `Missing required environment variables: ${missingVars.join(', ')}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('[test-treasury] All environment variables present');

    // Connect to blockchain (we know these are not undefined due to check above)
    const provider = new ethers.JsonRpcProvider(rpcUrl!);
    const wallet = new ethers.Wallet(treasuryPrivateKey!, provider);
    const tokenContract = new ethers.Contract(vibeTokenAddress!, ERC20_ABI, wallet);

    console.log(`[test-treasury] Treasury wallet address: ${wallet.address}`);

    // Get network info
    const network = await provider.getNetwork();
    console.log(`[test-treasury] Connected to network: ${network.name} (Chain ID: ${network.chainId})`);

    // Get token info
    const [decimals, symbol, name, balance] = await Promise.all([
      tokenContract.decimals(),
      tokenContract.symbol(),
      tokenContract.name(),
      tokenContract.balanceOf(wallet.address)
    ]);

    const formattedBalance = ethers.formatUnits(balance, decimals);
    console.log(`[test-treasury] Treasury balance: ${formattedBalance} ${symbol}`);

    // Get native token (MATIC) balance for gas
    const nativeBalance = await provider.getBalance(wallet.address);
    const formattedNativeBalance = ethers.formatEther(nativeBalance);
    console.log(`[test-treasury] Native balance (for gas): ${formattedNativeBalance} MATIC`);

    return new Response(
      JSON.stringify({
        success: true,
        connection: {
          network: network.name,
          chainId: network.chainId.toString(),
          treasuryAddress: wallet.address,
        },
        token: {
          name,
          symbol,
          address: vibeTokenAddress,
          decimals: Number(decimals),
        },
        balances: {
          vibe: formattedBalance,
          vibeRaw: balance.toString(),
          native: formattedNativeBalance,
          nativeRaw: nativeBalance.toString(),
        },
        message: `✅ Connection successful! Treasury has ${formattedBalance} ${symbol}`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('[test-treasury] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Connection failed',
        details: errorMessage,
        message: `❌ Failed to connect: ${errorMessage}`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
