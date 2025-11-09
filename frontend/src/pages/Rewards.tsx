import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, ExternalLink, Clock, Flame, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import vibeconMascot from "@/assets/vibecon-mascot.png";
import { useMetaMask } from "@/hooks/useMetaMask";

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
  const [historyOpen, setHistoryOpen] = useState(false);
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
      
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6 pb-20">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Wallet</h1>
          <p className="text-muted-foreground">Keep your streak to multiply your rewards!</p>
        </div>

        {/* Top Row Stats - Three columns */}
        <div className="grid grid-cols-3 gap-6 py-4">
          {/* Vibe Earned */}
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-2">Vibe Earned</div>
            <div className="text-4xl font-bold text-primary">{bankedVibe}</div>
          </div>

          {/* Streak Multiplier */}
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-2">Streak Multiplier</div>
            <div className="text-4xl font-bold text-orange-500">
              {formatMultiplier(multiplier)}
            </div>
          </div>

          {/* Potential Payout */}
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-2">Potential Payout</div>
            <div className="text-4xl font-bold text-green-600 dark:text-green-400">
              {potentialPayout}
            </div>
          </div>
        </div>

        {/* Mascot Image */}
        <div className="flex justify-center py-4">
          <img 
            src={vibeconMascot} 
            alt="VibeCon Mascot" 
            className="w-48 h-48 object-contain"
          />
        </div>

        {/* Detailed Stats Section */}
        <div className="space-y-3">
          {/* Streak Progress Details */}
          <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-2 border-orange-500/20 rounded-xl p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-medium">Streak Progress</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{streakDays} day streak 🔥</span>
                {nextTier.daysNeeded > 0 && (
                  <span className="text-muted-foreground font-medium">
                    {nextTier.daysNeeded} more days to {formatMultiplier(nextTier.nextMultiplier)}
                  </span>
                )}
              </div>
              {nextTier.daysNeeded > 0 && (
                <Progress 
                  value={(streakDays / nextTier.nextTier) * 100} 
                  className="h-2"
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              +50 VIBE per lesson completed
            </p>
          </div>
        </div>

        {/* Withdraw Button */}
        <Button
          onClick={() => setShowWithdrawDialog(true)}
          disabled={bankedVibe === 0 || !walletAddress}
          size="lg"
          className="w-full h-14 text-lg font-bold"
        >
          <Wallet className="w-5 h-5 mr-2" />
          Withdraw VIBE
        </Button>

        {/* Wallet Connection - Simplified */}
        <WalletConnectionSimplified 
          walletAddress={walletAddress} 
          onWalletConnected={loadData}
        />

        {/* Withdrawal History - Collapsible */}
        {rewards.length > 0 && (
          <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <CardTitle className="text-lg">Withdrawal History</CardTitle>
                      <CardDescription>{rewards.length} withdrawal{rewards.length !== 1 ? 's' : ''}</CardDescription>
                    </div>
                    {historyOpen ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-3">
                  {rewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">#{reward.cycle_number}</h3>
                          <Badge variant="outline" className={getStatusColor(reward.status) + " text-white text-xs"}>
                            {getStatusLabel(reward.status)}
                          </Badge>
                        </div>
                        <div className="text-xl font-bold text-primary">
                          {reward.amount_vibe}
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(reward.cycle_end_date).toLocaleDateString()}
                      </div>
                      
                      {reward.tx_hash && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => openBlockExplorer(reward.tx_hash!)}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View on PolygonScan
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="text-2xl">📚</div>
              <div>
                <p className="font-semibold">Earn VIBE</p>
                <p className="text-sm text-muted-foreground">Complete lessons to earn 50 VIBE each, added to your bank</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-2xl">🔥</div>
              <div>
                <p className="font-semibold">Build Your Streak</p>
                <p className="text-sm text-muted-foreground">
                  Practice daily to unlock higher multipliers:<br/>
                  7 days: 1.5x • 14 days: 2.0x • 30 days: 2.5x • 60 days: 3.0x
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-2xl">💰</div>
              <div>
                <p className="font-semibold">Withdraw Anytime</p>
                <p className="text-sm text-muted-foreground">Connect your wallet and withdraw your rewards instantly to Polygon network</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-2xl">⚡</div>
              <div>
                <p className="font-semibold">Smart Strategy</p>
                <p className="text-sm text-muted-foreground">The longer you maintain your streak, the more VIBE you earn!</p>
              </div>
            </div>
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleWithdraw} disabled={isWithdrawing}>
              {isWithdrawing ? 'Processing...' : 'Confirm Withdrawal'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Rewards;
