import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useMetaMask = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<string | null>(null);

  // Get MetaMask provider specifically (not Coinbase or other wallets)
  const getMetaMaskProvider = () => {
    if (typeof window === 'undefined') return null;
    
    // If window.ethereum exists and is MetaMask, use it
    if (window.ethereum?.isMetaMask && !window.ethereum?.isCoinbaseWallet) {
      return window.ethereum;
    }
    
    // If multiple providers exist, find MetaMask specifically
    if (window.ethereum?.providers) {
      return window.ethereum.providers.find((p: any) => p.isMetaMask && !p.isCoinbaseWallet);
    }
    
    return null;
  };

  // Check if MetaMask is installed
  const isMetaMaskInstalled = getMetaMaskProvider() !== null;

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
    const provider = getMetaMaskProvider();
    if (!provider) return;

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

    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);

    return () => {
      if (provider.removeListener) {
        provider.removeListener('accountsChanged', handleAccountsChanged);
        provider.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [isMetaMaskInstalled]);

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
    const provider = getMetaMaskProvider();
    
    if (!provider) {
      toast.error('MetaMask is not installed. Please install MetaMask to continue.');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);

    try {
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

        toast.success('MetaMask wallet connected successfully!');
      }
    } catch (error: any) {
      console.error('Error connecting to MetaMask:', error);
      
      if (error.code === 4001) {
        toast.error('Connection request rejected');
      } else {
        toast.error('Failed to connect to MetaMask. Make sure MetaMask is installed and enabled.');
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
    isMetaMaskInstalled,
    connectWallet,
    disconnectWallet,
  };
};