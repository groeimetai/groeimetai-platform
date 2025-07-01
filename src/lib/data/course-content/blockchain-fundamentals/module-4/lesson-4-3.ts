import { Lesson } from '@/lib/types/course';

export const lesson4_3: Lesson = {
  id: 'lesson-4-3',
  title: 'Frontend dApp Development',
  duration: '45 minuten',
  objectives: [
    'React integratie met Web3 bibliotheken',
    'Wallet connection flows implementeren',
    'Transaction management in de frontend',
    'Nederlandse dApp voorbeelden analyseren'
  ],
  content: `
    <h2>Frontend dApp Development</h2>
    
    <p>Moderne dApp development combineert traditionele frontend frameworks met blockchain integratie. We gebruiken React als voorbeeld, maar de concepten zijn toepasbaar op andere frameworks.</p>

    <h3>1. Web3 Setup en Configuratie</h3>
    
    <h4>1.1 Project Setup</h4>
    <pre><code class="language-bash">
# Create React app met TypeScript
npx create-react-app my-dapp --template typescript

# Installeer Web3 dependencies
npm install ethers web3modal @web3-react/core @web3-react/injected-connector

# UI libraries
npm install @chakra-ui/react framer-motion
    </code></pre>

    <h4>1.2 Web3 Provider Setup</h4>
    <pre><code class="language-typescript">
// src/contexts/Web3Context.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';

interface Web3ContextType {
  provider: ethers.providers.Web3Provider | null;
  account: string | null;
  chainId: number | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | null>(null);

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: process.env.REACT_APP_INFURA_ID
    }
  }
};

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [web3Modal, setWeb3Modal] = useState<Web3Modal | null>(null);

  useEffect(() => {
    const modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
      providerOptions
    });
    setWeb3Modal(modal);

    // Auto-connect if previously connected
    if (modal.cachedProvider) {
      connect();
    }
  }, []);

  const connect = async () => {
    if (!web3Modal) return;

    try {
      const instance = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(instance);
      const signer = provider.getSigner();
      const account = await signer.getAddress();
      const network = await provider.getNetwork();

      setProvider(provider);
      setAccount(account);
      setChainId(network.chainId);

      // Setup event listeners
      instance.on("accountsChanged", handleAccountsChanged);
      instance.on("chainChanged", handleChainChanged);
      instance.on("disconnect", handleDisconnect);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const disconnect = () => {
    if (web3Modal) {
      web3Modal.clearCachedProvider();
    }
    setProvider(null);
    setAccount(null);
    setChainId(null);
  };

  const switchNetwork = async (targetChainId: number) => {
    if (!window.ethereum) throw new Error("No ethereum provider");

    const chainIdHex = \`0x\${targetChainId.toString(16)}\`;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
    } catch (error: any) {
      // Chain not added, add it
      if (error.code === 4902) {
        const chainData = getChainData(targetChainId);
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [chainData],
        });
      }
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
    } else {
      disconnect();
    }
  };

  const handleChainChanged = (chainId: string) => {
    setChainId(parseInt(chainId, 16));
    window.location.reload();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <Web3Context.Provider value={{
      provider,
      account,
      chainId,
      connect,
      disconnect,
      switchNetwork
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return context;
};
    </code></pre>

    <h3>2. Wallet Connection UI</h3>
    
    <h4>2.1 Connect Wallet Component</h4>
    <pre><code class="language-typescript">
// src/components/ConnectWallet.tsx
import React from 'react';
import { Button, Text, HStack, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { useWeb3 } from '../contexts/Web3Context';
import { formatAddress } from '../utils/format';

export const ConnectWallet: React.FC = () => {
  const { account, connect, disconnect, chainId } = useWeb3();

  const getNetworkName = (chainId: number): string => {
    const networks: { [key: number]: string } = {
      1: 'Ethereum',
      56: 'BSC',
      137: 'Polygon',
      42161: 'Arbitrum',
      10: 'Optimism',
    };
    return networks[chainId] || 'Unknown';
  };

  if (!account) {
    return (
      <Button 
        colorScheme="blue" 
        onClick={connect}
        size="lg"
      >
        Connect Wallet
      </Button>
    );
  }

  return (
    <Menu>
      <MenuButton as={Button} variant="outline">
        <HStack>
          <Text fontSize="sm">{getNetworkName(chainId!)}</Text>
          <Text>{formatAddress(account)}</Text>
        </HStack>
      </MenuButton>
      <MenuList>
        <MenuItem onClick={() => navigator.clipboard.writeText(account)}>
          Copy Address
        </MenuItem>
        <MenuItem onClick={disconnect}>
          Disconnect
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

// Utils function
export const formatAddress = (address: string): string => {
  return \`\${address.slice(0, 6)}...\${address.slice(-4)}\`;
};
    </code></pre>

    <h4>2.2 Network Switcher</h4>
    <pre><code class="language-typescript">
// src/components/NetworkSwitcher.tsx
import React from 'react';
import { Select, Alert, AlertIcon } from '@chakra-ui/react';
import { useWeb3 } from '../contexts/Web3Context';

const SUPPORTED_NETWORKS = [
  { id: 1, name: 'Ethereum Mainnet' },
  { id: 137, name: 'Polygon' },
  { id: 56, name: 'Binance Smart Chain' },
  { id: 42161, name: 'Arbitrum' },
];

export const NetworkSwitcher: React.FC = () => {
  const { chainId, switchNetwork } = useWeb3();
  
  const isSupported = SUPPORTED_NETWORKS.some(n => n.id === chainId);

  if (!isSupported && chainId) {
    return (
      <Alert status="warning">
        <AlertIcon />
        Unsupported network. Please switch to a supported network.
      </Alert>
    );
  }

  return (
    <Select 
      value={chainId || ''} 
      onChange={(e) => switchNetwork(Number(e.target.value))}
      placeholder="Select Network"
    >
      {SUPPORTED_NETWORKS.map(network => (
        <option key={network.id} value={network.id}>
          {network.name}
        </option>
      ))}
    </Select>
  );
};
    </code></pre>

    <h3>3. Smart Contract Interactie</h3>
    
    <h4>3.1 Contract Hook</h4>
    <pre><code class="language-typescript">
// src/hooks/useContract.ts
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';

export function useContract<T extends ethers.Contract>(
  address: string | undefined,
  abi: any[],
  withSigner = false
): T | null {
  const { provider, account } = useWeb3();
  const [contract, setContract] = useState<T | null>(null);

  useEffect(() => {
    if (!address || !abi || !provider) {
      setContract(null);
      return;
    }

    try {
      const contractInstance = new ethers.Contract(
        address,
        abi,
        withSigner && account ? provider.getSigner() : provider
      ) as T;

      setContract(contractInstance);
    } catch (error) {
      console.error('Error creating contract instance:', error);
      setContract(null);
    }
  }, [address, abi, provider, account, withSigner]);

  return contract;
}

// Gebruik
const MyComponent = () => {
  const tokenContract = useContract<IERC20>(
    TOKEN_ADDRESS,
    ERC20_ABI,
    true // with signer for write operations
  );

  const handleTransfer = async () => {
    if (!tokenContract) return;
    
    try {
      const tx = await tokenContract.transfer(recipient, amount);
      await tx.wait();
      console.log('Transfer successful!');
    } catch (error) {
      console.error('Transfer failed:', error);
    }
  };
};
    </code></pre>

    <h4>3.2 Transaction Management</h4>
    <pre><code class="language-typescript">
// src/hooks/useTransaction.ts
import { useState } from 'react';
import { ethers } from 'ethers';
import { useToast } from '@chakra-ui/react';

interface TransactionState {
  loading: boolean;
  error: Error | null;
  txHash: string | null;
  success: boolean;
}

export const useTransaction = () => {
  const [state, setState] = useState<TransactionState>({
    loading: false,
    error: null,
    txHash: null,
    success: false
  });
  const toast = useToast();

  const execute = async (
    transactionPromise: () => Promise<ethers.ContractTransaction>,
    options?: {
      onSuccess?: (tx: ethers.ContractReceipt) => void;
      onError?: (error: Error) => void;
      successMessage?: string;
      errorMessage?: string;
    }
  ) => {
    setState({ loading: true, error: null, txHash: null, success: false });

    try {
      // Send transaction
      const tx = await transactionPromise();
      setState(prev => ({ ...prev, txHash: tx.hash }));

      toast({
        title: "Transaction Sent",
        description: \`Transaction hash: \${tx.hash.slice(0, 10)}...\`,
        status: "info",
        duration: 5000,
        isClosable: true,
      });

      // Wait for confirmation
      const receipt = await tx.wait();

      setState({
        loading: false,
        error: null,
        txHash: receipt.transactionHash,
        success: true
      });

      toast({
        title: options?.successMessage || "Transaction Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      options?.onSuccess?.(receipt);
    } catch (error: any) {
      const err = error as Error;
      setState({
        loading: false,
        error: err,
        txHash: null,
        success: false
      });

      toast({
        title: options?.errorMessage || "Transaction Failed",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });

      options?.onError?.(err);
    }
  };

  return { ...state, execute };
};

// Gebruik
const TokenTransfer: React.FC = () => {
  const tokenContract = useContract(TOKEN_ADDRESS, TOKEN_ABI, true);
  const { execute, loading, txHash } = useTransaction();

  const handleTransfer = async () => {
    await execute(
      () => tokenContract!.transfer(recipientAddress, amount),
      {
        successMessage: "Tokens successfully transferred!",
        errorMessage: "Failed to transfer tokens"
      }
    );
  };

  return (
    <div>
      <Button onClick={handleTransfer} isLoading={loading}>
        Transfer Tokens
      </Button>
      {txHash && (
        <Link href={\`https://etherscan.io/tx/\${txHash}\`} isExternal>
          View on Etherscan
        </Link>
      )}
    </div>
  );
};
    </code></pre>

    <h3>4. Nederlandse dApp Voorbeelden</h3>
    
    <h4>4.1 LTO Network Identity dApp</h4>
    <pre><code class="language-typescript">
// LTO Network Identity Verification dApp
import { LTO, IdentityBuilder } from '@lto-network/lto';

const IdentityVerificationDApp: React.FC = () => {
  const [verificationStatus, setVerificationStatus] = useState<string>('');
  const { provider, account } = useWeb3();

  const verifyIdentity = async (did: string) => {
    const lto = new LTO();
    
    // Create identity verification transaction
    const tx = new IdentityBuilder(lto)
      .addVerification({
        type: 'DigiD',
        did: did,
        verifier: 'Nederlandse Overheid',
        timestamp: Date.now()
      })
      .build();

    // Sign and broadcast
    const signedTx = await lto.sign(tx, account);
    const result = await lto.broadcast(signedTx);
    
    setVerificationStatus('Identity verified on LTO Network');
  };

  return (
    <Box p={6} borderWidth={1} borderRadius="lg">
      <Heading size="md" mb={4}>Dutch Digital Identity</Heading>
      <Text mb={4}>Verify your identity using DigiD on blockchain</Text>
      <Button onClick={() => verifyIdentity('did:lto:user123')}>
        Verify with DigiD
      </Button>
      {verificationStatus && (
        <Alert status="success" mt={4}>
          <AlertIcon />
          {verificationStatus}
        </Alert>
      )}
    </Box>
  );
};
    </code></pre>

    <h4>4.2 Dutch Energy Trading dApp</h4>
    <pre><code class="language-typescript">
// Nederlandse Energie Trading Platform
const EnergyTradingDApp: React.FC = () => {
  const [energyOffers, setEnergyOffers] = useState<EnergyOffer[]>([]);
  const energyContract = useContract(ENERGY_CONTRACT, ENERGY_ABI, true);

  interface EnergyOffer {
    id: number;
    producer: string;
    pricePerKwh: string;
    availableKwh: number;
    greenCertified: boolean;
    location: string;
  }

  const loadOffers = async () => {
    if (!energyContract) return;

    const offerCount = await energyContract.offerCount();
    const offers = [];

    for (let i = 0; i < offerCount; i++) {
      const offer = await energyContract.offers(i);
      offers.push({
        id: i,
        producer: offer.producer,
        pricePerKwh: ethers.utils.formatEther(offer.pricePerKwh),
        availableKwh: offer.availableKwh.toNumber(),
        greenCertified: offer.greenCertified,
        location: offer.location
      });
    }

    setEnergyOffers(offers);
  };

  const buyEnergy = async (offerId: number, kwhAmount: number) => {
    if (!energyContract) return;

    const offer = energyOffers[offerId];
    const totalPrice = ethers.utils.parseEther(
      (parseFloat(offer.pricePerKwh) * kwhAmount).toString()
    );

    const tx = await energyContract.buyEnergy(offerId, kwhAmount, {
      value: totalPrice
    });

    await tx.wait();
    await loadOffers(); // Refresh
  };

  return (
    <Container maxW="container.xl">
      <Heading mb={6}>Nederlandse Groene Energie Marktplaats</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {energyOffers.map(offer => (
          <Box key={offer.id} p={6} borderWidth={1} borderRadius="lg">
            <Badge colorScheme={offer.greenCertified ? "green" : "gray"}>
              {offer.greenCertified ? "Groene Energie" : "Grijze Energie"}
            </Badge>
            <Text fontSize="lg" fontWeight="bold" mt={2}>
              €{offer.pricePerKwh} per kWh
            </Text>
            <Text>Beschikbaar: {offer.availableKwh} kWh</Text>
            <Text fontSize="sm" color="gray.600">{offer.location}</Text>
            <Button 
              mt={4} 
              colorScheme="blue" 
              onClick={() => buyEnergy(offer.id, 100)}
            >
              Koop 100 kWh
            </Button>
          </Box>
        ))}
      </SimpleGrid>
    </Container>
  );
};
    </code></pre>

    <h3>5. Real-time Data Updates</h3>
    
    <h4>5.1 Event Listening</h4>
    <pre><code class="language-typescript">
// src/hooks/useContractEvents.ts
import { useEffect } from 'react';
import { ethers } from 'ethers';

export const useContractEvents = (
  contract: ethers.Contract | null,
  eventName: string,
  callback: (...args: any[]) => void,
  dependencies: any[] = []
) => {
  useEffect(() => {
    if (!contract) return;

    const filter = contract.filters[eventName]();
    
    contract.on(filter, callback);

    return () => {
      contract.off(filter, callback);
    };
  }, [contract, eventName, ...dependencies]);
};

// Gebruik
const TokenDashboard: React.FC = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const tokenContract = useContract(TOKEN_ADDRESS, TOKEN_ABI);

  useContractEvents(
    tokenContract,
    'Transfer',
    (from: string, to: string, amount: ethers.BigNumber) => {
      setTransfers(prev => [...prev, {
        from,
        to,
        amount: ethers.utils.formatEther(amount),
        timestamp: Date.now()
      }]);
    }
  );

  return (
    <Box>
      <Heading>Recent Transfers</Heading>
      <List>
        {transfers.map((transfer, index) => (
          <ListItem key={index}>
            {transfer.from} → {transfer.to}: {transfer.amount} tokens
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
    </code></pre>

    <h3>6. Error Handling en UX</h3>
    
    <h4>6.1 MetaMask Error Handling</h4>
    <pre><code class="language-typescript">
// src/utils/errorHandling.ts
export const handleWeb3Error = (error: any): string => {
  if (error.code === 4001) {
    return "Transaction rejected by user";
  }
  
  if (error.code === -32002) {
    return "Please unlock MetaMask";
  }
  
  if (error.message?.includes("insufficient funds")) {
    return "Insufficient funds for transaction";
  }
  
  if (error.message?.includes("nonce too low")) {
    return "Transaction nonce error - please refresh";
  }
  
  return error.message || "An unknown error occurred";
};

// Error Boundary Component
export const Web3ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => (
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Web3 Error</AlertTitle>
          <AlertDescription>{handleWeb3Error(error)}</AlertDescription>
        </Alert>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};
    </code></pre>

    <h3>7. Complete dApp Example</h3>
    
    <h4>Dutch Voting dApp</h4>
    <pre><code class="language-typescript">
// Complete Dutch Voting dApp
const DutchVotingDApp: React.FC = () => {
  const { account } = useWeb3();
  const votingContract = useContract(VOTING_CONTRACT, VOTING_ABI, true);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const { execute, loading } = useTransaction();

  interface Proposal {
    id: number;
    description: string;
    voteCount: number;
    deadline: Date;
  }

  useEffect(() => {
    loadProposals();
    checkVotingStatus();
  }, [account, votingContract]);

  const loadProposals = async () => {
    if (!votingContract) return;

    const count = await votingContract.proposalCount();
    const proposals = [];

    for (let i = 0; i < count; i++) {
      const proposal = await votingContract.proposals(i);
      proposals.push({
        id: i,
        description: proposal.description,
        voteCount: proposal.voteCount.toNumber(),
        deadline: new Date(proposal.deadline.toNumber() * 1000)
      });
    }

    setProposals(proposals);
  };

  const checkVotingStatus = async () => {
    if (!votingContract || !account) return;
    const voted = await votingContract.hasVoted(account);
    setHasVoted(voted);
  };

  const vote = async (proposalId: number) => {
    await execute(
      () => votingContract!.vote(proposalId),
      {
        successMessage: "Vote successfully cast!",
        onSuccess: () => {
          loadProposals();
          setHasVoted(true);
        }
      }
    );
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading>Nederlandse Blockchain Stemming</Heading>
          <Text color="gray.600">
            Stem veilig en transparant op blockchain
          </Text>
        </Box>

        {hasVoted && (
          <Alert status="info">
            <AlertIcon />
            U heeft al gestemd in deze ronde
          </Alert>
        )}

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {proposals.map(proposal => (
            <Box
              key={proposal.id}
              p={6}
              borderWidth={1}
              borderRadius="lg"
              position="relative"
            >
              <VStack align="stretch" spacing={4}>
                <Text fontWeight="bold">{proposal.description}</Text>
                <HStack justify="space-between">
                  <Text>Stemmen: {proposal.voteCount}</Text>
                  <Text fontSize="sm" color="gray.600">
                    Deadline: {proposal.deadline.toLocaleDateString('nl-NL')}
                  </Text>
                </HStack>
                <Button
                  colorScheme="blue"
                  onClick={() => vote(proposal.id)}
                  isDisabled={hasVoted || new Date() > proposal.deadline}
                  isLoading={loading}
                >
                  Stem
                </Button>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </VStack>
    </Container>
  );
};

export default DutchVotingDApp;
    </code></pre>

    <h3>Samenvatting</h3>
    <p>Frontend dApp development combineert moderne web development met blockchain technologie. Door gebruik te maken van libraries zoals ethers.js en Web3Modal kunnen we gebruiksvriendelijke interfaces bouwen die naadloos integreren met smart contracts. Nederlandse dApps zoals LTO Network en energie trading platforms tonen de praktische toepassingen in de Nederlandse context.</p>
  `,
  codeExamples: [
    {
      title: 'Complete dApp Setup',
      language: 'typescript',
      code: `// App.tsx - Complete dApp setup
import React from 'react';
import { ChakraProvider, Box, Container } from '@chakra-ui/react';
import { Web3Provider } from './contexts/Web3Context';
import { ConnectWallet } from './components/ConnectWallet';
import { DutchVotingDApp } from './components/VotingDApp';

function App() {
  return (
    <ChakraProvider>
      <Web3Provider>
        <Box minH="100vh" bg="gray.50">
          <Box bg="white" px={4} shadow="sm">
            <Container maxW="container.xl">
              <Box py={4} display="flex" justifyContent="space-between">
                <Box fontSize="xl" fontWeight="bold">
                  Nederlandse dApp
                </Box>
                <ConnectWallet />
              </Box>
            </Container>
          </Box>
          
          <Container maxW="container.xl" py={8}>
            <DutchVotingDApp />
          </Container>
        </Box>
      </Web3Provider>
    </ChakraProvider>
  );
}

export default App;`
    }
  ],
  quiz: {
    questions: [
      {
        id: 'q1',
        text: 'Wat is het belangrijkste verschil tussen een provider en een signer in ethers.js?',
        options: [
          'Een provider kan alleen lezen, een signer kan ook transacties ondertekenen',
          'Een signer is sneller dan een provider',
          'Een provider werkt alleen op mainnet',
          'Er is geen verschil'
        ],
        correctAnswer: 0
      },
      {
        id: 'q2',
        text: 'Waarom is Web3Modal nuttig voor dApp development?',
        options: [
          'Het maakt de app sneller',
          'Het ondersteunt meerdere wallet providers met één interface',
          'Het is verplicht voor alle dApps',
          'Het verlaagt gas kosten'
        ],
        correctAnswer: 1
      },
      {
        id: 'q3',
        text: 'Wat is de beste manier om real-time updates van smart contract events te ontvangen?',
        options: [
          'Polling elke seconde',
          'Event listeners met contract.on()',
          'Manual refresh door gebruiker',
          'WebSockets naar blockchain node'
        ],
        correctAnswer: 1
      }
    ]
  }
};