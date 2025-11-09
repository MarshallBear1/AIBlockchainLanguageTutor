# Quick Fix Guide - Issues & Solutions

## Common Issues After Deployment

### Issue 1: Tokens Not Unlocking After Lesson
**Symptoms:** User completes lesson but no reward appears

**Check:**
```sql
SELECT levels_completed_in_cycle, wallet_address
FROM profiles
WHERE email = 'user@example.com';
```

**Solutions:**
1. Verify `levels_completed_in_cycle` incremented (should be 1+)
2. Check Edge Function logs for check-cycle-completion errors
3. Manually trigger cycle check:
   ```bash
   curl -X POST https://your-project.supabase.co/functions/v1/check-cycle-completion \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -d '{"userId": "user-id-here"}'
   ```

---

### Issue 2: Tokens Not Sent to Wallet
**Symptoms:** Reward shows "pending" but tokens never arrive

**Check:**
```sql
SELECT status, tx_hash, amount_vibe
FROM vibe_rewards
WHERE user_id = 'user-id'
ORDER BY created_at DESC;
```

**Solutions:**
1. If status = 'no_wallet': User needs to connect MetaMask
2. If status = 'pending': Wait for cron job or manually trigger:
   ```bash
   curl -X POST https://your-project.supabase.co/functions/v1/process-payouts \
     -H "Authorization: Bearer YOUR_ANON_KEY"
   ```
3. If status = 'failed': Check Edge Function logs for error
4. Check treasury wallet has enough:
   - Gas tokens (MATIC/ETH)
   - VIBE tokens

---

### Issue 3: Coins Not Awarded After Lesson
**Symptoms:** Lesson completes but TopBar shows 0 coins

**Check:**
```sql
SELECT vibe_coins, xp, streak_days
FROM profiles
WHERE email = 'user@example.com';
```

**Solutions:**
1. Refresh page (TopBar polls every 2 seconds)
2. Check if lesson actually saved:
   ```sql
   SELECT * FROM lesson_progress
   WHERE user_id = 'user-id'
   ORDER BY created_at DESC;
   ```
3. Check browser console for errors
4. Verify completeLesson() was called (check for "Great job today!" in conversation)

---

### Issue 4: Streak Not Updating
**Symptoms:** User practices daily but streak stays at 0

**Check:**
```sql
SELECT
  streak_days,
  last_practice_date,
  streak_start_date
FROM profiles
WHERE email = 'user@example.com';
```

**Solutions:**
1. Check if last_practice_date updated today
2. Verify streak was practiced within 24 hours (if gap > 1 day, streak resets)
3. Check updateStreak() logic in src/utils/streakManager.ts

---

### Issue 5: MetaMask Not Connecting
**Symptoms:** "Connect MetaMask" button does nothing

**Solutions:**
1. Verify MetaMask extension installed
2. Check browser console for errors
3. Try disconnecting and reconnecting in MetaMask
4. Check if popup is blocked by browser
5. Try different browser

---

### Issue 6: User Can't See VIBE Tokens in MetaMask
**Symptoms:** Transaction confirmed but balance shows 0

**Solutions:**
1. User needs to manually add VIBE token to MetaMask:
   - Open MetaMask
   - Click "Import tokens"
   - Enter contract address: `YOUR_VIBE_TOKEN_ADDRESS`
   - Symbol: VIBE
   - Decimals: 18

2. Verify transaction on block explorer:
   - Polygon: https://polygonscan.com/tx/TX_HASH
   - Base: https://basescan.org/tx/TX_HASH

3. Check correct network selected in MetaMask

---

### Issue 7: Edge Functions Failing
**Symptoms:** 500 errors when calling edge functions

**Check Logs:**
1. Go to Supabase Dashboard → Edge Functions → Logs
2. Look for recent errors

**Common Errors:**
- "OPENAI_API_KEY is not set" → Add to Supabase Secrets
- "TREASURY_PRIVATE_KEY is not set" → Add to Supabase Secrets
- "Insufficient funds" → Fund treasury wallet
- "Invalid wallet address" → Check wallet_address format

---

### Issue 8: Duplicate Lesson Completions
**Symptoms:** User earns coins multiple times for same lesson

**Current Status:** ⚠️ No protection implemented yet

**Temporary Fix:**
```sql
-- Check for duplicates
SELECT lesson_id, COUNT(*)
FROM lesson_progress
WHERE user_id = 'user-id'
GROUP BY lesson_id
HAVING COUNT(*) > 1;

-- Manual cleanup (if needed)
DELETE FROM lesson_progress
WHERE id NOT IN (
  SELECT MIN(id)
  FROM lesson_progress
  GROUP BY user_id, lesson_id, language_code
);
```

**Permanent Fix (TODO):**
Add check in completeLesson():
```typescript
// Check if already completed
const { data: existing } = await supabase
  .from('lesson_progress')
  .select('id')
  .eq('user_id', user.id)
  .eq('lesson_id', lessonId)
  .eq('language_code', language)
  .single();

if (existing) {
  return { success: false, coinsEarned: 0 };
}
```

---

## Emergency Procedures

### If Treasury Wallet Compromised
1. Immediately pause process-payouts cron job
2. Create new wallet
3. Transfer remaining tokens to new wallet
4. Update TREASURY_PRIVATE_KEY secret
5. Resume payouts
6. Investigate how compromise occurred

### If Users Report Missing Tokens
1. Check reward status in database
2. If tx_hash exists, verify on block explorer
3. If transaction pending, wait or speedup with higher gas
4. If transaction failed, check error and retry
5. Update reward status manually if needed

### If Too Many Failed Payouts
1. Check treasury wallet balance (gas + tokens)
2. Check RPC_URL is working (try different RPC)
3. Check gas prices (may need to increase)
4. Manually process rewards with higher gas limit

---

## Useful SQL Queries

### Get All Pending Rewards
```sql
SELECT
  v.id,
  v.user_id,
  p.email,
  v.amount_vibe,
  p.wallet_address,
  v.created_at
FROM vibe_rewards v
JOIN profiles p ON p.id = v.user_id
WHERE v.status = 'pending'
  AND p.wallet_address IS NOT NULL
ORDER BY v.created_at ASC;
```

### Get User Stats
```sql
SELECT
  email,
  vibe_coins,
  streak_days,
  levels_completed_in_cycle,
  wallet_address,
  last_practice_date
FROM profiles
WHERE email = 'user@example.com';
```

### Get Reward History
```sql
SELECT
  v.cycle_number,
  v.amount_vibe,
  v.status,
  v.tx_hash,
  v.created_at,
  v.paid_at
FROM vibe_rewards v
WHERE v.user_id = 'user-id'
ORDER BY v.cycle_number DESC;
```

### Get Failed Transactions
```sql
SELECT
  v.id,
  v.user_id,
  p.email,
  v.amount_vibe,
  v.created_at
FROM vibe_rewards v
JOIN profiles p ON p.id = v.user_id
WHERE v.status = 'failed'
ORDER BY v.created_at DESC;
```

### Reset User Cycle (Testing Only)
```sql
UPDATE profiles
SET
  levels_completed_in_cycle = 0,
  current_cycle_start = NOW()
WHERE id = 'user-id';
```

---

## Testing Commands

### Test Edge Functions Locally
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Test function
supabase functions serve

# Call function
curl -X POST http://localhost:54321/functions/v1/check-cycle-completion \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"userId": "test-user-id"}'
```

### Test Lesson Completion Flow
1. Create test user
2. Complete a lesson (trigger "Great job today!")
3. Check logs:
   ```bash
   # Browser console
   # Look for: "Cycle check result:"
   ```
4. Verify database:
   ```sql
   SELECT * FROM vibe_rewards WHERE user_id = 'test-user-id';
   ```

---

## Environment Variables Checklist

Make sure these are set in Supabase Secrets:

- [ ] `OPENAI_API_KEY` - For AI chat
- [ ] `ELEVEN_LABS_API_KEY` - For voice generation
- [ ] `ELEVEN_LABS_VOICE_ID` - Voice ID to use
- [ ] `TREASURY_PRIVATE_KEY` - Wallet private key (NEVER commit!)
- [ ] `RPC_URL` - Blockchain RPC endpoint
- [ ] `VIBE_TOKEN_ADDRESS` - Deployed ERC-20 address

---

## Monitoring Setup

### What to Monitor:
1. Edge function error rates
2. Failed payout count
3. Treasury wallet balance
4. Unusual user activity (too many completions)
5. Database query performance

### Set Up Alerts:
- Email when treasury balance < 1000 VIBE
- Email when > 10 failed payouts in 1 hour
- Slack notification for Edge Function errors

---

## Contact & Support

- **Supabase Issues:** https://supabase.com/dashboard/support
- **OpenAI Issues:** https://platform.openai.com/account/support
- **ElevenLabs Issues:** https://elevenlabs.io/support
- **Blockchain Explorer:** https://polygonscan.com or https://basescan.org

---

**Remember:** Always test on testnet before deploying to production!
