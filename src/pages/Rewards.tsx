import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, ExternalLink, Trophy, Clock, Flame, Coins, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { WalletConnect } from "@/components/WalletConnect";
import TopBar from "@/components/TopBar";
import { toast } from "sonner";
import { getStreakMultiplier, getNextTierInfo, formatMultiplier } from "@/utils/streakMultiplier";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";

interface Reward {
  id: string;
  cycle_number: number;
  cycle_start_date: string;
  cycle_end_date: string;
  levels_completed: number;
  amount_vibe: number;
  status: string;
  tx_hash: string | null;
  created_at: string;
  paid_at: string | null;
}

const Rewards = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [bankedVibe, setBankedVibe] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [stats, setStats] = useState({
    totalEarned: 0,
    totalPaid: 0,
    pendingPayouts: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('banked_vibe, streak_days, wallet_address')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      setBankedVibe(profile?.banked_vibe || 0);
      setStreakDays(profile?.streak_days || 0);
      setWalletAddress(profile?.wallet_address || null);

      // Load rewards history
      const { data, error } = await supabase
        .from('vibe_rewards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRewards(data || []);

      // Calculate stats
      const totalEarned = (data || []).reduce((sum, r) => sum + r.amount_vibe, 0);
      const totalPaid = (data || []).filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount_vibe, 0);
      const pendingPayouts = (data || []).filter(r => r.status === 'pending').length;

      setStats({ totalEarned, totalPaid, pendingPayouts });
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load rewards data');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (bankedVibe <= 0) {
      toast.error('No VIBE to withdraw');
      return;
    }

    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsWithdrawing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('withdraw-vibe', {
        body: { userId: user.id }
      });

      if (error) throw error;

      toast.success(`Successfully withdrew ${data.payoutAmount} VIBE! (${data.bankedAmount} × ${formatMultiplier(data.multiplier)})`);
      setShowWithdrawDialog(false);
      
      // Reload data
      await loadData();
    } catch (error: any) {
      console.error('Withdraw error:', error);
      toast.error(error.message || 'Failed to withdraw VIBE');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const multiplier = getStreakMultiplier(streakDays);
  const potentialPayout = Math.floor(bankedVibe * multiplier);
  const nextTier = getNextTierInfo(streakDays);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      case 'no_wallet':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      case 'no_wallet':
        return 'No Wallet';
      default:
        return status;
    }
  };

  const openBlockExplorer = (txHash: string) => {
    window.open(`https://polygonscan.com/tx/${txHash}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">VIBE Banking</h1>
            <p className="text-muted-foreground">Keep your streak to multiply your rewards!</p>
          </div>
          <Trophy className="w-8 h-8 text-primary" />
        </div>

        {/* Banking Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Banked VIBE */}
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Banked VIBE
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{bankedVibe}</div>
              <p className="text-xs text-muted-foreground mt-1">Earn 50 per lesson</p>
            </CardContent>
          </Card>
          
          {/* Streak Multiplier */}
          <Card className="border-2 border-orange-500/20">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                Streak Multiplier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                {formatMultiplier(multiplier)}
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{streakDays} day streak</span>
                  {nextTier.daysNeeded > 0 && (
                    <span className="text-muted-foreground">
                      {nextTier.daysNeeded} to {formatMultiplier(nextTier.nextMultiplier)}
                    </span>
                  )}
                </div>
                {nextTier.daysNeeded > 0 && (
                  <Progress 
                    value={(streakDays / nextTier.nextTier) * 100} 
                    className="h-1"
                  />
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Potential Payout */}
          <Card className="border-2 border-green-500/20 bg-green-50/50 dark:bg-green-950/20">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                Potential Payout
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {potentialPayout}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {bankedVibe} × {formatMultiplier(multiplier)} = {potentialPayout} VIBE
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Withdraw Button */}
        <div className="space-y-4">
          <Button
            onClick={() => setShowWithdrawDialog(true)}
            disabled={bankedVibe === 0 || !walletAddress}
            size="lg"
            className="w-full h-14 text-lg font-bold"
          >
            <Wallet className="w-5 h-5 mr-2" />
            Withdraw VIBE to Wallet
          </Button>
          
          {!walletAddress && (
            <p className="text-sm text-muted-foreground text-center">
              Connect your wallet below to enable withdrawals
            </p>
          )}
        </div>

        {/* Wallet Connection */}
        <WalletConnect onWalletConnected={loadData} />

        {/* Withdrawal History Stats */}
        {rewards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Withdrawn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEarned} VIBE</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Paid</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.totalPaid} VIBE</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Pending Payouts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingPayouts}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Withdrawal History */}
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal History</CardTitle>
            <CardDescription>
              View all your VIBE withdrawals and payout status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading...
              </div>
            ) : rewards.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No withdrawals yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Complete lessons to bank VIBE, then withdraw when ready!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="border rounded-lg p-4 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">Withdrawal #{reward.cycle_number}</h3>
                          <Badge variant="outline" className={getStatusColor(reward.status) + " text-white"}>
                            {getStatusLabel(reward.status)}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(reward.cycle_end_date).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="text-sm">
                          <span className="text-muted-foreground">Lessons in cycle:</span> {reward.levels_completed}
                        </div>
                        
                        {reward.paid_at && (
                          <div className="text-sm text-green-600">
                            Paid on {new Date(reward.paid_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {reward.amount_vibe} VIBE
                        </div>
                        
                        {reward.tx_hash && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                            onClick={() => openBlockExplorer(reward.tx_hash!)}
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View TX
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              <strong className="text-primary">📚 Earn:</strong> Complete lessons to earn 50 VIBE each, added to your bank
            </p>
            <p className="text-sm">
              <strong className="text-orange-500">🔥 Multiply:</strong> Keep your streak to unlock higher multipliers:
              <span className="block ml-4 mt-1 text-muted-foreground">
                7+ days: 1.5x • 14+ days: 2.0x • 30+ days: 2.5x • 60+ days: 3.0x
              </span>
            </p>
            <p className="text-sm">
              <strong className="text-green-600">💰 Withdraw:</strong> Connect MetaMask and withdraw anytime - tokens sent instantly!
            </p>
            <p className="text-sm">
              <strong className="text-blue-600">⚡ Smart Strategy:</strong> The longer you wait and maintain your streak, the more VIBE you earn!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Withdraw Confirmation Dialog */}
      <AlertDialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Withdrawal</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-foreground">Banked VIBE:</span>
                  <span className="font-bold text-foreground">{bankedVibe}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground">Multiplier:</span>
                  <span className="font-bold text-orange-500">{formatMultiplier(multiplier)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-foreground font-semibold">You will receive:</span>
                  <span className="font-bold text-green-600 text-lg">{potentialPayout} VIBE</span>
                </div>
              </div>
              <p className="text-sm">
                Your banked balance will reset to 0, but your <span className="text-orange-500 font-semibold">{streakDays}-day streak</span> continues.
                Tokens will be sent to your wallet instantly!
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isWithdrawing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWithdraw}
              disabled={isWithdrawing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isWithdrawing ? 'Processing...' : 'Confirm Withdrawal'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Rewards;
