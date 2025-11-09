import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

declare global {
  interface Window {
    ethereum?: any;
    coinbaseWalletExtension?: any;
  }
}

export const useCoinbaseWallet = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<string | null>(null);

  // Check if Coinbase Wallet is installed
  const isCoinbaseWalletInstalled = typeof window !== 'undefined' && 
    (typeof window.coinbaseWalletExtension !== 'undefined' || 
     (typeof window.ethereum !== 'undefined' && window.ethereum.isCoinbaseWallet));

  // Load saved wallet address from profile
  useEffect(() => {
    const loadWalletAddress = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('wallet_address')
          .eq('id', user.id)
          .single();

        if (profile?.wallet_address) {
          setAccount(profile.wallet_address);
        }
      } catch (error) {
        console.error('Error loading wallet address:', error);
      }
    };

    loadWalletAddress();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!isCoinbaseWalletInstalled) return;

    const provider = window.coinbaseWalletExtension || window.ethereum;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setAccount(null);
      } else {
        setAccount(accounts[0]);
        saveWalletAddress(accounts[0]);
      }
    };

    const handleChainChanged = (chainId: string) => {
      setChainId(chainId);
    };

    if (provider) {
      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('chainChanged', handleChainChanged);

      return () => {
        if (provider.removeListener) {
          provider.removeListener('accountsChanged', handleAccountsChanged);
          provider.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [isCoinbaseWalletInstalled]);

  const saveWalletAddress = async (address: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ wallet_address: address })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving wallet address:', error);
      }
    } catch (error) {
      console.error('Error in saveWalletAddress:', error);
    }
  };

  const connectWallet = async () => {
    if (!isCoinbaseWalletInstalled) {
      toast.error('Coinbase Wallet is not installed. Please install Coinbase Wallet to continue.');
      window.open('https://www.coinbase.com/wallet/downloads', '_blank');
      return;
    }

    setIsConnecting(true);

    try {
      const provider = window.coinbaseWalletExtension || window.ethereum;
      
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const address = accounts[0];
        setAccount(address);
        await saveWalletAddress(address);
        
        // Get chain ID
        const chainId = await provider.request({
          method: 'eth_chainId',
        });
        setChainId(chainId);

        toast.success('Wallet connected successfully!');
      }
    } catch (error: any) {
      console.error('Error connecting to Coinbase Wallet:', error);
      
      if (error.code === 4001) {
        toast.error('Connection request rejected');
      } else {
        toast.error('Failed to connect wallet');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    setAccount(null);
    setChainId(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('profiles')
        .update({ wallet_address: null })
        .eq('id', user.id);

      toast.success('Wallet disconnected');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  return {
    account,
    isConnecting,
    chainId,
    isCoinbaseWalletInstalled,
    connectWallet,
    disconnectWallet,
  };
};
