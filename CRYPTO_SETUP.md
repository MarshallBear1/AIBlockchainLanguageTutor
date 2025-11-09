# VIBE Token Crypto Integration Setup Guide

This guide explains how to set up the complete crypto tokenomics system for Toki.

## Overview

The system implements a "learn-to-earn" model where users:
1. Earn **locked VIBE tokens** (50 per lesson) shown in the UI
2. Maintain a **30-day streak** to unlock tokens
3. Receive **real VIBE tokens** (ERC-20) in their MetaMask wallet after completing the cycle

## Architecture

```
User Learns → Locked VIBE (DB) → 30-Day Streak → Real Tokens (Blockchain)
```

### Off-Chain (Supabase Database)
- `profiles`: Tracks `levels_completed_in_cycle`, `wallet_address`, `streak_days`
- `vibe_rewards`: Records completed cycles and payout status
- `daily_checkins`: Ensures accurate streak tracking

### On-Chain (Blockchain)
- **VIBE Token**: ERC-20 contract deployed on your chosen chain
- **Treasury Wallet**: Holds 1,000,000 VIBE for payouts
- **RPC Node**: Connection to the blockchain

## Step 1: Deploy VIBE Token Contract

### Option A: Using Remix IDE (Easiest)

1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create a new file `VIBEToken.sol`:

\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract VIBEToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("VIBE", "VIBE") {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }
}
\`\`\`

3. Compile with Solidity 0.8.0+
4. Deploy with initial supply: `1000000` (1 million tokens)
5. Copy the deployed contract address

### Option B: Using Hardhat (Advanced)

See [Hardhat documentation](https://hardhat.org/getting-started) for detailed setup.

## Step 2: Choose Your Blockchain

Recommended chains for low gas fees:

### Polygon (Recommended)
- **Network**: Polygon PoS
- **RPC URL**: `https://polygon-rpc.com/`
- **Explorer**: https://polygonscan.com/
- **Gas Token**: MATIC
- **Why**: Very low fees (~$0.001 per transaction)

### Base (Alternative)
- **Network**: Base (Coinbase L2)
- **RPC URL**: `https://mainnet.base.org`
- **Explorer**: https://basescan.org/
- **Gas Token**: ETH
- **Why**: Growing ecosystem, good UX

### Testnet for Testing
- **Polygon Mumbai**: `https://rpc-mumbai.maticvigil.com/`
- **Base Sepolia**: `https://sepolia.base.org`

## Step 3: Set Up Treasury Wallet

1. Create a new MetaMask wallet (NEVER use your personal wallet)
2. Save the private key securely
3. Fund the wallet with:
   - **1,000,000 VIBE tokens** (transfer from deployer)
   - **Native gas tokens** (e.g., 10 MATIC or 0.01 ETH for gas)

⚠️ **SECURITY**: Never commit the private key. It's stored in Supabase Secrets.

## Step 4: Configure Supabase Secrets

Already added secrets (you filled these in):
- `TREASURY_PRIVATE_KEY`: Your treasury wallet private key
- `RPC_URL`: Blockchain RPC endpoint
- `VIBE_TOKEN_ADDRESS`: Deployed ERC-20 contract address

Example values:
\`\`\`
TREASURY_PRIVATE_KEY=0x1234...abcd
RPC_URL=https://polygon-rpc.com/
VIBE_TOKEN_ADDRESS=0xABCD...1234
\`\`\`

## Step 5: Test the System

### Manual Testing

1. **Connect Wallet**: Click the VibeCoin in top bar → Connect MetaMask
2. **Complete Lessons**: Each lesson increments `levels_completed_in_cycle`
3. **Maintain Streak**: Practice daily to reach 30 days
4. **Auto Payout**: System creates reward and sends tokens automatically

### Testing with Fake Data (Development)

Update a user's profile directly:
\`\`\`sql
UPDATE profiles 
SET 
  streak_days = 30,
  levels_completed_in_cycle = 10,
  wallet_address = '0xYourTestWallet'
WHERE id = 'user-uuid';
\`\`\`

Then call the cycle completion function to trigger reward creation.

## Step 6: Automated Payouts

The `process-payouts` edge function should run periodically. Set up a cron job:

### Using Supabase Cron (Recommended)

Run this SQL in Supabase SQL Editor:

\`\`\`sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule payout processing every hour
SELECT cron.schedule(
  'process-vibe-payouts',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://fgqhmzbmvbssebhksupc.supabase.co/functions/v1/process-payouts',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZncWhtemJtdmJzc2ViaGtzdXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NjU0NzAsImV4cCI6MjA3ODI0MTQ3MH0.ljMx-LjhWyVdGzKzBiqHfUD4xszNH9vUpbXqIUGegvg"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
\`\`\`

### Alternative: External Cron (e.g., GitHub Actions)

Create `.github/workflows/process-payouts.yml`:
\`\`\`yaml
name: Process VIBE Payouts
on:
  schedule:
    - cron: '0 * * * *' # Every hour
  workflow_dispatch:

jobs:
  payout:
    runs-on: ubuntu-latest
    steps:
      - name: Call Payout Function
        run: |
          curl -X POST \
            https://fgqhmzbmvbssebhksupc.supabase.co/functions/v1/process-payouts \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
\`\`\`

## Step 7: Monitor & Maintain

### Check Payout Status

\`\`\`sql
SELECT 
  v.*,
  p.email
FROM vibe_rewards v
JOIN profiles p ON p.id = v.user_id
ORDER BY v.created_at DESC
LIMIT 20;
\`\`\`

### Check Treasury Balance

Use a blockchain explorer or:
\`\`\`javascript
// In browser console with ethers.js
const balance = await contract.balanceOf(treasuryWallet);
console.log('Treasury Balance:', ethers.formatEther(balance), 'VIBE');
\`\`\`

### Failed Transactions

Check edge function logs for failures:
- Insufficient gas
- Invalid wallet addresses
- Token contract issues

## User Flow

1. **User signs up** → Profile created with initial values
2. **Completes lessons** → `levels_completed_in_cycle` increments, earns 50 VIBE each
3. **Maintains daily streak** → `streak_days` increases
4. **Connects MetaMask** → `wallet_address` saved to profile
5. **Reaches 30 days** → `check-cycle-completion` creates reward entry
6. **Hourly cron runs** → `process-payouts` sends real tokens
7. **User receives tokens** → VIBE appears in MetaMask
8. **Cycle resets** → New 30-day cycle begins

## Security Considerations

### ✅ Best Practices
- Treasury private key stored in Supabase Secrets (encrypted)
- Edge functions run on Supabase servers (not exposed to frontend)
- RLS policies prevent users from modifying their own reward records
- Transaction hashes recorded for audit trail

### ⚠️ Potential Risks
- **Treasury wallet compromise**: Use multi-sig for production
- **Smart contract bugs**: Audit your ERC-20 contract
- **Gas price spikes**: Monitor gas costs, implement limits
- **Fake streaks**: Implement additional anti-cheat measures

### 🔒 Production Hardening
1. Use a multi-sig wallet (e.g., Gnosis Safe) for treasury
2. Implement rate limiting on payouts
3. Add manual approval for large payouts
4. Monitor for suspicious activity (multiple wallets, same user)
5. Consider requiring identity verification for high earners

## Troubleshooting

### "Insufficient funds" error
- Check treasury wallet has enough gas tokens (MATIC/ETH)
- Verify treasury has VIBE tokens

### "Transaction failed" error
- Check RPC URL is correct and responsive
- Verify token contract address
- Ensure wallet address format is valid

### Tokens not appearing
- Check transaction on block explorer using `tx_hash`
- Verify user added VIBE token to MetaMask (custom token)
- Confirm transaction was mined (not pending)

### Users can't see locked VIBE
- Check `levels_completed_in_cycle` is updating on lesson completion
- Verify TopBar is fetching profile data correctly

## Adding VIBE to MetaMask

Users need to manually add VIBE token:
1. Open MetaMask
2. Click "Import Tokens"
3. Enter contract address: `[YOUR_CONTRACT_ADDRESS]`
4. Symbol: `VIBE`
5. Decimals: `18`

## Future Enhancements

- **Token staking**: Users stake VIBE for premium features
- **Governance**: Token holders vote on new features
- **Marketplace**: Spend VIBE on premium lessons or avatars
- **Leaderboards**: Top earners displayed publicly
- **Referral bonuses**: Earn VIBE for inviting friends
- **NFT rewards**: Special NFTs for milestone achievements

## Support

For issues or questions:
1. Check edge function logs in Supabase
2. Verify blockchain explorer for transaction status
3. Review database state with SQL queries
4. Test on testnet first before production changes