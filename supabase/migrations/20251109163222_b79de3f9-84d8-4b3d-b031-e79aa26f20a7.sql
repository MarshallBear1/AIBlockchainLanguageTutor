-- Transfer existing vibe_coins balance to banked_vibe
UPDATE profiles 
SET banked_vibe = banked_vibe + vibe_coins 
WHERE vibe_coins > 0;

-- Reset vibe_coins to 0 after migration
UPDATE profiles 
SET vibe_coins = 0 
WHERE vibe_coins > 0;