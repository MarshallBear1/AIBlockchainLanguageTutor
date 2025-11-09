import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ExternalLink, CheckCircle2 } from "lucide-react";
import { useMetaMask } from "@/hooks/useMetaMask";

export const WalletConnect = () => {
  const { account, isConnecting, connectWallet, disconnectWallet, isMetaMaskInstalled } = useMetaMask();

  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Wallet Connection
        </CardTitle>
        <CardDescription>
          Connect your MetaMask wallet to receive VIBE tokens after completing lessons
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!account ? (
          <>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                You need to connect a wallet to receive your earned VIBE tokens. Install MetaMask if you haven't already.
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={connectWallet}
                disabled={isConnecting || !isMetaMaskInstalled}
                className="flex-1"
              >
                {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
              </Button>
              
              {!isMetaMaskInstalled && (
                <Button
                  variant="outline"
                  onClick={() => window.open('https://metamask.io/download/', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Install
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Connected</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {shortenAddress(account)}
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={disconnectWallet}
              className="w-full"
            >
              Disconnect Wallet
            </Button>

            <p className="text-xs text-muted-foreground">
              Your VIBE tokens will be sent to this address when you complete lessons.
            </p>
          </div>
        )}

        <div className="pt-3 border-t space-y-2">
          <h4 className="text-sm font-semibold">How it works:</h4>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Complete lessons to earn locked VIBE (50 VIBE per lesson)</li>
            <li>Connect your MetaMask wallet</li>
            <li>After completing 1 lesson, your tokens unlock</li>
            <li>Tokens are automatically sent to your wallet</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};