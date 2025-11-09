import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, ExternalLink, Trophy, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { WalletConnect } from "@/components/WalletConnect";
import TopBar from "@/components/TopBar";
import { toast } from "sonner";

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
  const [stats, setStats] = useState({
    totalEarned: 0,
    totalPaid: 0,
    pendingPayouts: 0,
  });

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
      console.error('Error loading rewards:', error);
      toast.error('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

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
    // Adjust URL based on your blockchain
    // Polygon example:
    window.open(`https://polygonscan.com/tx/${txHash}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Rewards History</h1>
            <p className="text-muted-foreground">Track your VIBE token earnings</p>
          </div>
          <Trophy className="w-8 h-8 text-primary" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Earned</CardDescription>
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

        {/* Wallet Connection */}
        <WalletConnect />

        {/* Rewards List */}
        <Card>
          <CardHeader>
            <CardTitle>Cycle History</CardTitle>
            <CardDescription>
              View all your completed 30-day cycles and payout status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading rewards...
              </div>
            ) : rewards.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No rewards yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Complete a 30-day streak to earn your first reward!
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
                          <h3 className="font-semibold">Cycle #{reward.cycle_number}</h3>
                          <Badge variant="outline" className={getStatusColor(reward.status) + " text-white"}>
                            {getStatusLabel(reward.status)}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(reward.cycle_start_date).toLocaleDateString()} - {new Date(reward.cycle_end_date).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="text-sm">
                          <span className="text-muted-foreground">Lessons completed:</span> {reward.levels_completed}
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
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>Step 1:</strong> Complete lessons to earn locked VIBE (50 VIBE per lesson)
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Step 2:</strong> Maintain a 30-day streak without missing a day
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Step 3:</strong> Connect your MetaMask wallet before completing the cycle
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Step 4:</strong> Tokens are automatically sent to your wallet within 24 hours
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Rewards;