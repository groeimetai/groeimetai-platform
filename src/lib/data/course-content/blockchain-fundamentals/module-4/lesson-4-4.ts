// Module 4 - Lesson 4: Scaling solutions (Layer 2)

export default {
  id: 'lesson-4-4',
  title: 'Scaling solutions (Layer 2)',
  duration: '3 uur',
  objectives: [
    'Begrijp verschillende Layer 2 scaling oplossingen',
    'Implementeer state channels en sidechains',
    'Werk met Optimistic en ZK Rollups',
    'Integreer L2 solutions in DApps'
  ],
  content: `
# Layer 2 Scaling Solutions

## Waarom Layer 2?

Blockchain trilemma: **Decentralization**, **Security**, **Scalability** - pick two.
Layer 2 solutions proberen scalability te verbeteren zonder decentralization of security op te offeren.

### Layer 1 vs Layer 2
- **Layer 1**: Base blockchain (Ethereum mainnet)
  - ~15 TPS
  - High security
  - High cost (~$5-100 per transaction)
  
- **Layer 2**: Built on top of Layer 1
  - 1,000-100,000 TPS
  - Inherits L1 security
  - Low cost (~$0.01-1 per transaction)

### Types of L2 Solutions
1. **State Channels**: Off-chain transactions between parties
2. **Plasma**: Child chains with fraud proofs
3. **Sidechains**: Independent chains with bridges
4. **Rollups**: Computation off-chain, data on-chain
   - Optimistic Rollups
   - ZK Rollups

## State Channels

### Payment Channel Implementation

\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PaymentChannel is ReentrancyGuard {
    using ECDSA for bytes32;
    
    struct Channel {
        address participant1;
        address participant2;
        uint256 deposit1;
        uint256 deposit2;
        uint256 nonce;
        uint256 challengePeriod;
        uint256 closingTime;
        bool isOpen;
    }
    
    struct State {
        uint256 balance1;
        uint256 balance2;
        uint256 nonce;
    }
    
    mapping(bytes32 => Channel) public channels;
    mapping(bytes32 => State) public lastStates;
    mapping(bytes32 => mapping(address => bool)) public hasWithdrawn;
    
    uint256 public constant DEFAULT_CHALLENGE_PERIOD = 1 days;
    
    event ChannelOpened(bytes32 indexed channelId, address participant1, address participant2);
    event ChannelChallenged(bytes32 indexed channelId, uint256 nonce);
    event ChannelClosed(bytes32 indexed channelId);
    event Withdrawn(bytes32 indexed channelId, address participant, uint256 amount);
    
    // Open a new payment channel
    function openChannel(address _participant2, uint256 _challengePeriod) 
        external 
        payable 
        returns (bytes32 channelId) 
    {
        require(_participant2 != address(0) && _participant2 != msg.sender, "Invalid participant");
        require(msg.value > 0, "Deposit required");
        
        channelId = keccak256(abi.encodePacked(msg.sender, _participant2, block.timestamp));
        
        channels[channelId] = Channel({
            participant1: msg.sender,
            participant2: _participant2,
            deposit1: msg.value,
            deposit2: 0,
            nonce: 0,
            challengePeriod: _challengePeriod > 0 ? _challengePeriod : DEFAULT_CHALLENGE_PERIOD,
            closingTime: 0,
            isOpen: true
        });
        
        emit ChannelOpened(channelId, msg.sender, _participant2);
    }
    
    // Join an existing channel
    function joinChannel(bytes32 _channelId) external payable {
        Channel storage channel = channels[_channelId];
        require(channel.isOpen, "Channel not open");
        require(msg.sender == channel.participant2, "Not participant");
        require(channel.deposit2 == 0, "Already joined");
        require(msg.value > 0, "Deposit required");
        
        channel.deposit2 = msg.value;
    }
    
    // Submit a state update (cooperative close)
    function closeChannel(
        bytes32 _channelId,
        uint256 _balance1,
        uint256 _balance2,
        uint256 _nonce,
        bytes memory _signature1,
        bytes memory _signature2
    ) external {
        Channel storage channel = channels[_channelId];
        require(channel.isOpen, "Channel not open");
        require(_balance1 + _balance2 == channel.deposit1 + channel.deposit2, "Invalid balances");
        require(_nonce > channel.nonce, "Invalid nonce");
        
        // Verify signatures
        bytes32 stateHash = keccak256(abi.encodePacked(_channelId, _balance1, _balance2, _nonce));
        bytes32 ethSignedHash = stateHash.toEthSignedMessageHash();
        
        require(ethSignedHash.recover(_signature1) == channel.participant1, "Invalid signature 1");
        require(ethSignedHash.recover(_signature2) == channel.participant2, "Invalid signature 2");
        
        // Update state
        lastStates[_channelId] = State({
            balance1: _balance1,
            balance2: _balance2,
            nonce: _nonce
        });
        
        channel.nonce = _nonce;
        channel.isOpen = false;
        channel.closingTime = block.timestamp;
        
        emit ChannelClosed(_channelId);
    }
    
    // Challenge a close with newer state
    function challengeClose(
        bytes32 _channelId,
        uint256 _balance1,
        uint256 _balance2,
        uint256 _nonce,
        bytes memory _signature1,
        bytes memory _signature2
    ) external {
        Channel storage channel = channels[_channelId];
        require(!channel.isOpen, "Channel still open");
        require(block.timestamp < channel.closingTime + channel.challengePeriod, "Challenge period ended");
        require(_nonce > lastStates[_channelId].nonce, "Invalid nonce");
        require(_balance1 + _balance2 == channel.deposit1 + channel.deposit2, "Invalid balances");
        
        // Verify signatures
        bytes32 stateHash = keccak256(abi.encodePacked(_channelId, _balance1, _balance2, _nonce));
        bytes32 ethSignedHash = stateHash.toEthSignedMessageHash();
        
        require(ethSignedHash.recover(_signature1) == channel.participant1, "Invalid signature 1");
        require(ethSignedHash.recover(_signature2) == channel.participant2, "Invalid signature 2");
        
        // Update to newer state
        lastStates[_channelId] = State({
            balance1: _balance1,
            balance2: _balance2,
            nonce: _nonce
        });
        
        emit ChannelChallenged(_channelId, _nonce);
    }
    
    // Withdraw funds after challenge period
    function withdraw(bytes32 _channelId) external nonReentrant {
        Channel storage channel = channels[_channelId];
        require(!channel.isOpen, "Channel still open");
        require(block.timestamp >= channel.closingTime + channel.challengePeriod, "Challenge period not ended");
        require(!hasWithdrawn[_channelId][msg.sender], "Already withdrawn");
        
        State memory finalState = lastStates[_channelId];
        uint256 amount;
        
        if (msg.sender == channel.participant1) {
            amount = finalState.balance1;
        } else if (msg.sender == channel.participant2) {
            amount = finalState.balance2;
        } else {
            revert("Not a participant");
        }
        
        require(amount > 0, "Nothing to withdraw");
        
        hasWithdrawn[_channelId][msg.sender] = true;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdrawn(_channelId, msg.sender, amount);
    }
    
    // Force close channel (unilateral)
    function forceClose(
        bytes32 _channelId,
        uint256 _balance1,
        uint256 _balance2,
        uint256 _nonce,
        bytes memory _signature
    ) external {
        Channel storage channel = channels[_channelId];
        require(channel.isOpen, "Channel not open");
        require(msg.sender == channel.participant1 || msg.sender == channel.participant2, "Not participant");
        
        // Verify signature from other party
        bytes32 stateHash = keccak256(abi.encodePacked(_channelId, _balance1, _balance2, _nonce));
        bytes32 ethSignedHash = stateHash.toEthSignedMessageHash();
        
        address otherParty = msg.sender == channel.participant1 ? channel.participant2 : channel.participant1;
        require(ethSignedHash.recover(_signature) == otherParty, "Invalid signature");
        
        // Set state and start challenge period
        lastStates[_channelId] = State({
            balance1: _balance1,
            balance2: _balance2,
            nonce: _nonce
        });
        
        channel.isOpen = false;
        channel.closingTime = block.timestamp;
        channel.nonce = _nonce;
        
        emit ChannelClosed(_channelId);
    }
}
\`\`\`

## Optimistic Rollups

### Optimistic Rollup Implementation

\`\`\`solidity
// Simplified Optimistic Rollup contract
contract OptimisticRollup {
    struct StateRoot {
        bytes32 root;
        uint256 blockNumber;
        uint256 timestamp;
        address proposer;
        bool finalized;
    }
    
    struct Transaction {
        address from;
        address to;
        uint256 value;
        bytes data;
        uint256 nonce;
    }
    
    // State management
    mapping(uint256 => StateRoot) public stateRoots;
    mapping(address => uint256) public bonds;
    uint256 public currentStateRoot;
    uint256 public lastFinalizedRoot;
    
    // Configuration
    uint256 public constant BOND_AMOUNT = 1 ether;
    uint256 public constant CHALLENGE_PERIOD = 7 days;
    uint256 public constant DISPUTE_PERIOD = 1 days;
    
    // Fraud proof
    mapping(uint256 => bool) public fraudProofSubmitted;
    mapping(uint256 => address) public fraudProver;
    
    event StateRootProposed(uint256 indexed rootIndex, bytes32 root, address proposer);
    event StateRootFinalized(uint256 indexed rootIndex);
    event FraudProofSubmitted(uint256 indexed rootIndex, address prover);
    event BondSlashed(address indexed proposer, address indexed prover);
    
    modifier onlyBonded() {
        require(bonds[msg.sender] >= BOND_AMOUNT, "Insufficient bond");
        _;
    }
    
    // Propose new state root
    function proposeStateRoot(
        bytes32 _newRoot,
        bytes calldata _transactions,
        bytes calldata _proof
    ) external onlyBonded {
        uint256 newIndex = currentStateRoot + 1;
        
        // Verify the state transition (simplified)
        require(verifyStateTransition(stateRoots[currentStateRoot].root, _newRoot, _transactions, _proof), "Invalid state transition");
        
        stateRoots[newIndex] = StateRoot({
            root: _newRoot,
            blockNumber: block.number,
            timestamp: block.timestamp,
            proposer: msg.sender,
            finalized: false
        });
        
        currentStateRoot = newIndex;
        
        emit StateRootProposed(newIndex, _newRoot, msg.sender);
    }
    
    // Submit fraud proof
    function submitFraudProof(
        uint256 _rootIndex,
        bytes calldata _fraudProof
    ) external {
        StateRoot storage stateRoot = stateRoots[_rootIndex];
        require(!stateRoot.finalized, "Already finalized");
        require(block.timestamp < stateRoot.timestamp + CHALLENGE_PERIOD, "Challenge period ended");
        require(!fraudProofSubmitted[_rootIndex], "Fraud proof already submitted");
        
        // Verify fraud proof (simplified)
        require(verifyFraudProof(_rootIndex, _fraudProof), "Invalid fraud proof");
        
        fraudProofSubmitted[_rootIndex] = true;
        fraudProver[_rootIndex] = msg.sender;
        
        // Slash proposer's bond
        uint256 slashedAmount = bonds[stateRoot.proposer];
        bonds[stateRoot.proposer] = 0;
        
        // Reward fraud prover
        bonds[msg.sender] += slashedAmount / 2;
        
        emit FraudProofSubmitted(_rootIndex, msg.sender);
        emit BondSlashed(stateRoot.proposer, msg.sender);
        
        // Revert to last finalized state
        currentStateRoot = lastFinalizedRoot;
    }
    
    // Finalize state root after challenge period
    function finalizeStateRoot(uint256 _rootIndex) external {
        StateRoot storage stateRoot = stateRoots[_rootIndex];
        require(!stateRoot.finalized, "Already finalized");
        require(!fraudProofSubmitted[_rootIndex], "Fraud proof submitted");
        require(block.timestamp >= stateRoot.timestamp + CHALLENGE_PERIOD, "Challenge period not ended");
        
        stateRoot.finalized = true;
        lastFinalizedRoot = _rootIndex;
        
        emit StateRootFinalized(_rootIndex);
    }
    
    // Deposit bond
    function depositBond() external payable {
        bonds[msg.sender] += msg.value;
    }
    
    // Withdraw bond
    function withdrawBond(uint256 _amount) external {
        require(bonds[msg.sender] >= _amount, "Insufficient bond");
        
        bonds[msg.sender] -= _amount;
        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "Transfer failed");
    }
    
    // Simplified verification functions
    function verifyStateTransition(
        bytes32 _oldRoot,
        bytes32 _newRoot,
        bytes calldata _transactions,
        bytes calldata _proof
    ) internal pure returns (bool) {
        // In reality, this would verify a SNARK/STARK proof
        // or execute the transactions to verify the state transition
        return _oldRoot != _newRoot && _transactions.length > 0 && _proof.length > 0;
    }
    
    function verifyFraudProof(
        uint256 _rootIndex,
        bytes calldata _fraudProof
    ) internal view returns (bool) {
        // In reality, this would verify that the state transition was invalid
        return _fraudProof.length > 0 && stateRoots[_rootIndex].root != bytes32(0);
    }
}
\`\`\`

## ZK Rollups

### ZK Rollup Implementation

\`\`\`solidity
// ZK Rollup with PLONK proof system
contract ZKRollup {
    using Pairing for *;
    
    struct Block {
        bytes32 stateRoot;
        bytes32 txRoot;
        uint256 blockNumber;
        uint256 timestamp;
        bytes proof;
    }
    
    struct VerifyingKey {
        Pairing.G1Point alpha;
        Pairing.G2Point beta;
        Pairing.G2Point gamma;
        Pairing.G2Point delta;
        Pairing.G1Point[] ic;
    }
    
    // State
    mapping(uint256 => Block) public blocks;
    bytes32 public currentStateRoot;
    uint256 public currentBlockNumber;
    VerifyingKey verifyingKey;
    
    // Deposit/Withdrawal
    mapping(address => mapping(address => uint256)) public pendingDeposits;
    mapping(uint256 => bool) public processedWithdrawals;
    
    event BlockSubmitted(uint256 indexed blockNumber, bytes32 stateRoot);
    event DepositQueued(address indexed token, address indexed user, uint256 amount);
    event WithdrawalProcessed(uint256 indexed withdrawalId, address indexed user, uint256 amount);
    
    constructor(VerifyingKey memory _vk) {
        verifyingKey = _vk;
        currentStateRoot = bytes32(0);
    }
    
    // Queue deposit for inclusion in next block
    function deposit(address _token, uint256 _amount) external payable {
        if (_token == address(0)) {
            require(msg.value == _amount, "Invalid ETH amount");
        } else {
            IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        }
        
        pendingDeposits[_token][msg.sender] += _amount;
        emit DepositQueued(_token, msg.sender, _amount);
    }
    
    // Submit new block with ZK proof
    function submitBlock(
        bytes32 _newStateRoot,
        bytes32 _txRoot,
        uint256[] memory _publicInputs,
        bytes memory _proof
    ) external {
        // Verify the ZK proof
        require(verifyProof(_publicInputs, _proof), "Invalid proof");
        
        // Verify public inputs match
        require(_publicInputs[0] == uint256(currentStateRoot), "Invalid old state root");
        require(_publicInputs[1] == uint256(_newStateRoot), "Invalid new state root");
        require(_publicInputs[2] == uint256(_txRoot), "Invalid tx root");
        
        // Update state
        currentBlockNumber++;
        blocks[currentBlockNumber] = Block({
            stateRoot: _newStateRoot,
            txRoot: _txRoot,
            blockNumber: currentBlockNumber,
            timestamp: block.timestamp,
            proof: _proof
        });
        
        currentStateRoot = _newStateRoot;
        
        emit BlockSubmitted(currentBlockNumber, _newStateRoot);
    }
    
    // Process withdrawal with Merkle proof
    function withdraw(
        uint256 _withdrawalId,
        address _token,
        uint256 _amount,
        bytes32[] memory _merkleProof
    ) external {
        require(!processedWithdrawals[_withdrawalId], "Already processed");
        
        // Verify Merkle proof against current state root
        bytes32 leaf = keccak256(abi.encodePacked(_withdrawalId, msg.sender, _token, _amount));
        require(verifyMerkleProof(_merkleProof, currentStateRoot, leaf), "Invalid Merkle proof");
        
        processedWithdrawals[_withdrawalId] = true;
        
        // Transfer funds
        if (_token == address(0)) {
            (bool success, ) = msg.sender.call{value: _amount}("");
            require(success, "ETH transfer failed");
        } else {
            IERC20(_token).transfer(msg.sender, _amount);
        }
        
        emit WithdrawalProcessed(_withdrawalId, msg.sender, _amount);
    }
    
    // Verify PLONK proof
    function verifyProof(
        uint256[] memory _publicInputs,
        bytes memory _proof
    ) internal view returns (bool) {
        // Parse proof
        Proof memory proof = parseProof(_proof);
        
        // Verify the proof using PLONK verification algorithm
        // This is a simplified version - real implementation is more complex
        
        require(_publicInputs.length + 1 == verifyingKey.ic.length, "Invalid public inputs");
        
        // Compute the linear combination vk_x
        Pairing.G1Point memory vk_x = Pairing.G1Point(0, 0);
        for (uint i = 0; i < _publicInputs.length; i++) {
            require(_publicInputs[i] < snark_scalar_field, "Invalid field element");
            vk_x = Pairing.addition(vk_x, Pairing.scalar_mul(verifyingKey.ic[i + 1], _publicInputs[i]));
        }
        vk_x = Pairing.addition(vk_x, verifyingKey.ic[0]);
        
        // Pairing check
        return Pairing.pairing(
            Pairing.negate(proof.a),
            proof.b,
            verifyingKey.alpha,
            verifyingKey.beta,
            vk_x,
            verifyingKey.gamma,
            proof.c,
            verifyingKey.delta
        );
    }
    
    function parseProof(bytes memory _proof) internal pure returns (Proof memory) {
        // Parse the proof bytes into proof components
        // Implementation depends on proof encoding
    }
    
    function verifyMerkleProof(
        bytes32[] memory _proof,
        bytes32 _root,
        bytes32 _leaf
    ) internal pure returns (bool) {
        bytes32 computedHash = _leaf;
        
        for (uint256 i = 0; i < _proof.length; i++) {
            bytes32 proofElement = _proof[i];
            
            if (computedHash <= proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }
        
        return computedHash == _root;
    }
}
\`\`\`

## L2 Integration for DApps

### Multi-Chain DApp Architecture

\`\`\`typescript
// L2 Bridge and Multi-chain Management
import { ethers } from 'ethers';

class L2BridgeManager {
  private bridges: Map<string, Bridge>;
  private providers: Map<string, ethers.providers.Provider>;
  
  constructor() {
    this.bridges = new Map();
    this.providers = new Map();
    this.initializeBridges();
  }
  
  private initializeBridges() {
    // Optimism Bridge
    this.bridges.set('optimism', {
      l1Bridge: '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1',
      l2Bridge: '0x4200000000000000000000000000000000000010',
      depositGas: 200000,
      withdrawalTime: 7 * 24 * 60 * 60 // 7 days
    });
    
    // Arbitrum Bridge
    this.bridges.set('arbitrum', {
      l1Bridge: '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a',
      l2Bridge: '0x0000000000000000000000000000000000000064',
      depositGas: 300000,
      withdrawalTime: 7 * 24 * 60 * 60
    });
    
    // Polygon Bridge
    this.bridges.set('polygon', {
      l1Bridge: '0xA0c68C638235ee32657e8f720a23ceC1bFc77C77',
      l2Bridge: '0x0000000000000000000000000000000000001001',
      depositGas: 150000,
      withdrawalTime: 3 * 60 * 60 // 3 hours
    });
    
    // zkSync Bridge
    this.bridges.set('zksync', {
      l1Bridge: '0x32400084C286CF3E17e7B677ea9583e60a000324',
      l2Bridge: '0x0000000000000000000000000000000000008006',
      depositGas: 250000,
      withdrawalTime: 60 * 60 // 1 hour
    });
  }
  
  // Bridge tokens from L1 to L2
  async bridgeToL2(
    l2Network: string,
    token: string,
    amount: ethers.BigNumber,
    recipient: string,
    signer: ethers.Signer
  ): Promise<ethers.ContractTransaction> {
    const bridge = this.bridges.get(l2Network);
    if (!bridge) throw new Error('Unsupported L2 network');
    
    const bridgeContract = new ethers.Contract(
      bridge.l1Bridge,
      L1_BRIDGE_ABI,
      signer
    );
    
    if (token === ethers.constants.AddressZero) {
      // Bridge ETH
      return await bridgeContract.depositETH(
        recipient,
        bridge.depositGas,
        '0x',
        { value: amount }
      );
    } else {
      // Approve token
      const tokenContract = new ethers.Contract(token, ERC20_ABI, signer);
      const approveTx = await tokenContract.approve(bridge.l1Bridge, amount);
      await approveTx.wait();
      
      // Bridge ERC20
      return await bridgeContract.depositERC20(
        token,
        recipient,
        amount,
        bridge.depositGas,
        '0x'
      );
    }
  }
  
  // Initiate withdrawal from L2 to L1
  async initiateWithdrawal(
    l2Network: string,
    token: string,
    amount: ethers.BigNumber,
    signer: ethers.Signer
  ): Promise<WithdrawalInfo> {
    const bridge = this.bridges.get(l2Network);
    if (!bridge) throw new Error('Unsupported L2 network');
    
    const l2BridgeContract = new ethers.Contract(
      bridge.l2Bridge,
      L2_BRIDGE_ABI,
      signer
    );
    
    let tx: ethers.ContractTransaction;
    
    if (token === ethers.constants.AddressZero) {
      // Withdraw ETH
      tx = await l2BridgeContract.withdraw(
        ethers.constants.AddressZero,
        amount,
        0,
        '0x'
      );
    } else {
      // Withdraw ERC20
      tx = await l2BridgeContract.withdraw(
        token,
        amount,
        0,
        '0x'
      );
    }
    
    const receipt = await tx.wait();
    
    return {
      transactionHash: receipt.transactionHash,
      l2BlockNumber: receipt.blockNumber,
      estimatedWithdrawalTime: Date.now() + bridge.withdrawalTime * 1000,
      status: 'initiated'
    };
  }
  
  // Complete withdrawal on L1 (after challenge period)
  async completeWithdrawal(
    l2Network: string,
    withdrawalInfo: WithdrawalInfo,
    proof: string,
    signer: ethers.Signer
  ): Promise<ethers.ContractTransaction> {
    const bridge = this.bridges.get(l2Network);
    if (!bridge) throw new Error('Unsupported L2 network');
    
    const l1BridgeContract = new ethers.Contract(
      bridge.l1Bridge,
      L1_BRIDGE_ABI,
      signer
    );
    
    // Different L2s have different finalization methods
    switch (l2Network) {
      case 'optimism':
        return await l1BridgeContract.finalizeWithdrawal(
          withdrawalInfo.transactionHash,
          proof
        );
        
      case 'arbitrum':
        return await l1BridgeContract.executeTransaction(
          withdrawalInfo.transactionHash,
          proof
        );
        
      case 'zksync':
        return await l1BridgeContract.finalizeWithdrawal(
          withdrawalInfo.l2BlockNumber,
          withdrawalInfo.transactionHash,
          proof
        );
        
      default:
        throw new Error('Unsupported finalization method');
    }
  }
  
  // Get optimal L2 for transaction
  async getOptimalL2(
    transactionType: 'transfer' | 'swap' | 'nft' | 'defi',
    urgency: 'low' | 'medium' | 'high'
  ): Promise<L2Recommendation> {
    const gasPrice = await this.getGasPrices();
    const throughput = await this.getThroughput();
    
    let recommendations: L2Recommendation[] = [];
    
    for (const [network, metrics] of throughput) {
      const score = this.calculateScore(
        transactionType,
        urgency,
        gasPrice.get(network)!,
        metrics
      );
      
      recommendations.push({
        network,
        score,
        gasPrice: gasPrice.get(network)!,
        estimatedTime: metrics.avgBlockTime,
        securityLevel: metrics.securityLevel
      });
    }
    
    // Sort by score
    recommendations.sort((a, b) => b.score - a.score);
    
    return recommendations[0];
  }
  
  private calculateScore(
    txType: string,
    urgency: string,
    gasPrice: number,
    metrics: any
  ): number {
    let score = 100;
    
    // Price weight
    const priceWeight = urgency === 'low' ? 0.7 : 0.3;
    score -= gasPrice * priceWeight;
    
    // Speed weight
    const speedWeight = urgency === 'high' ? 0.7 : 0.3;
    score += (1000 / metrics.avgBlockTime) * speedWeight;
    
    // Security weight
    score += metrics.securityLevel * 10;
    
    // Type-specific adjustments
    if (txType === 'defi' && metrics.defiTVL > 1000000000) {
      score += 20; // Bonus for high TVL
    }
    
    return score;
  }
  
  // Monitor cross-chain transactions
  async monitorTransaction(
    txHash: string,
    sourceChain: string,
    targetChain: string
  ): Promise<CrossChainStatus> {
    const sourceProvider = this.providers.get(sourceChain);
    const targetProvider = this.providers.get(targetChain);
    
    // Get source transaction
    const sourceTx = await sourceProvider!.getTransactionReceipt(txHash);
    
    // Parse bridge events
    const bridgeInterface = new ethers.utils.Interface(BRIDGE_ABI);
    const depositEvent = sourceTx.logs
      .map(log => {
        try {
          return bridgeInterface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find(event => event?.name === 'DepositInitiated');
    
    if (!depositEvent) {
      return { status: 'not_found' };
    }
    
    // Check target chain for completion
    const filter = {
      address: this.bridges.get(targetChain)!.l2Bridge,
      topics: [
        ethers.utils.id('DepositFinalized(address,address,uint256,bytes)'),
        depositEvent.args.l1Token,
        depositEvent.args.from
      ]
    };
    
    const targetEvents = await targetProvider!.getLogs(filter);
    
    if (targetEvents.length > 0) {
      return {
        status: 'completed',
        sourceTx: txHash,
        targetTx: targetEvents[0].transactionHash,
        completedAt: targetEvents[0].blockNumber
      };
    }
    
    return {
      status: 'pending',
      sourceTx: txHash,
      estimatedCompletion: Date.now() + 600000 // 10 minutes
    };
  }
}

// React Hook for L2 Management
function useL2Bridge() {
  const [bridgeManager] = useState(() => new L2BridgeManager());
  const [selectedL2, setSelectedL2] = useState<string>('optimism');
  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatus>('idle');
  const { library, account } = useWeb3React();
  
  const bridgeToL2 = useCallback(async (
    token: string,
    amount: string
  ) => {
    if (!library || !account) return;
    
    setBridgeStatus('bridging');
    
    try {
      const signer = library.getSigner();
      const amountBN = ethers.utils.parseEther(amount);
      
      const tx = await bridgeManager.bridgeToL2(
        selectedL2,
        token,
        amountBN,
        account,
        signer
      );
      
      setBridgeStatus('confirming');
      await tx.wait();
      
      setBridgeStatus('success');
    } catch (error) {
      console.error('Bridge error:', error);
      setBridgeStatus('error');
    }
  }, [library, account, selectedL2, bridgeManager]);
  
  const getOptimalL2 = useCallback(async (
    txType: 'transfer' | 'swap' | 'nft' | 'defi',
    urgency: 'low' | 'medium' | 'high'
  ) => {
    return await bridgeManager.getOptimalL2(txType, urgency);
  }, [bridgeManager]);
  
  return {
    selectedL2,
    setSelectedL2,
    bridgeToL2,
    bridgeStatus,
    getOptimalL2
  };
}
\`\`\`

## Performance Optimization

### Batch Transaction Processing

\`\`\`solidity
// Batch transaction processor for L2
contract BatchProcessor {
    using ECDSA for bytes32;
    
    struct BatchTransaction {
        address from;
        address to;
        uint256 value;
        bytes data;
        uint256 nonce;
        uint256 gasLimit;
        uint256 gasPrice;
        bytes signature;
    }
    
    struct Batch {
        BatchTransaction[] transactions;
        bytes32 merkleRoot;
        uint256 totalGasUsed;
        uint256 blockNumber;
    }
    
    mapping(uint256 => Batch) public batches;
    mapping(address => uint256) public nonces;
    uint256 public currentBatch;
    
    event BatchProcessed(uint256 indexed batchId, bytes32 merkleRoot, uint256 transactionCount);
    event TransactionExecuted(uint256 indexed batchId, uint256 indexed txIndex, bool success);
    
    function submitBatch(BatchTransaction[] calldata _transactions) external {
        require(_transactions.length > 0 && _transactions.length <= 1000, "Invalid batch size");
        
        uint256 batchId = currentBatch++;
        Batch storage batch = batches[batchId];
        
        bytes32[] memory leaves = new bytes32[](_transactions.length);
        uint256 totalGas = 0;
        
        for (uint i = 0; i < _transactions.length; i++) {
            BatchTransaction memory tx = _transactions[i];
            
            // Verify signature
            bytes32 txHash = keccak256(abi.encodePacked(
                tx.from,
                tx.to,
                tx.value,
                tx.data,
                tx.nonce,
                tx.gasLimit,
                tx.gasPrice
            ));
            
            address signer = txHash.toEthSignedMessageHash().recover(tx.signature);
            require(signer == tx.from, "Invalid signature");
            require(tx.nonce == nonces[tx.from]++, "Invalid nonce");
            
            // Store transaction
            batch.transactions.push(tx);
            leaves[i] = txHash;
            
            // Execute transaction
            (bool success, uint256 gasUsed) = _executeTransaction(tx);
            totalGas += gasUsed;
            
            emit TransactionExecuted(batchId, i, success);
        }
        
        // Calculate Merkle root
        batch.merkleRoot = _calculateMerkleRoot(leaves);
        batch.totalGasUsed = totalGas;
        batch.blockNumber = block.number;
        
        emit BatchProcessed(batchId, batch.merkleRoot, _transactions.length);
    }
    
    function _executeTransaction(BatchTransaction memory _tx) 
        private 
        returns (bool success, uint256 gasUsed) 
    {
        uint256 gasStart = gasleft();
        
        (success, ) = _tx.to.call{value: _tx.value, gas: _tx.gasLimit}(_tx.data);
        
        gasUsed = gasStart - gasleft();
    }
    
    function _calculateMerkleRoot(bytes32[] memory _leaves) 
        private 
        pure 
        returns (bytes32) 
    {
        require(_leaves.length > 0, "No leaves");
        
        if (_leaves.length == 1) {
            return _leaves[0];
        }
        
        // Build tree
        uint256 levelLength = _leaves.length;
        bytes32[] memory currentLevel = _leaves;
        
        while (levelLength > 1) {
            bytes32[] memory nextLevel = new bytes32[]((levelLength + 1) / 2);
            
            for (uint i = 0; i < levelLength; i += 2) {
                bytes32 left = currentLevel[i];
                bytes32 right = (i + 1 < levelLength) ? currentLevel[i + 1] : left;
                nextLevel[i / 2] = keccak256(abi.encodePacked(left, right));
            }
            
            currentLevel = nextLevel;
            levelLength = nextLevel.length;
        }
        
        return currentLevel[0];
    }
    
    // Compression for calldata optimization
    function submitCompressedBatch(bytes calldata _compressedData) external {
        bytes memory decompressed = _decompress(_compressedData);
        BatchTransaction[] memory transactions = abi.decode(decompressed, (BatchTransaction[]));
        this.submitBatch(transactions);
    }
    
    function _decompress(bytes calldata _data) private pure returns (bytes memory) {
        // Implement decompression algorithm (e.g., zlib)
        // Simplified for example
        return _data;
    }
}
\`\`\`

## Best Practices

### L2 Selection Criteria

\`\`\`typescript
// L2 selection framework
class L2SelectionFramework {
  static evaluateL2Options(requirements: DAppRequirements): L2Recommendation[] {
    const l2Options = [
      {
        name: 'Optimism',
        type: 'Optimistic Rollup',
        finality: '1 week',
        throughput: 2000,
        gasReduction: 10,
        evmCompatible: true,
        securityModel: 'fraud-proofs',
        ecosystem: 'large'
      },
      {
        name: 'Arbitrum',
        type: 'Optimistic Rollup',
        finality: '1 week',
        throughput: 40000,
        gasReduction: 50,
        evmCompatible: true,
        securityModel: 'fraud-proofs',
        ecosystem: 'largest'
      },
      {
        name: 'zkSync',
        type: 'ZK Rollup',
        finality: '10 minutes',
        throughput: 2000,
        gasReduction: 100,
        evmCompatible: true,
        securityModel: 'validity-proofs',
        ecosystem: 'growing'
      },
      {
        name: 'StarkNet',
        type: 'ZK Rollup',
        finality: '10 minutes',
        throughput: 10000,
        gasReduction: 100,
        evmCompatible: false,
        securityModel: 'validity-proofs',
        ecosystem: 'emerging'
      },
      {
        name: 'Polygon',
        type: 'Sidechain',
        finality: '2 seconds',
        throughput: 7000,
        gasReduction: 1000,
        evmCompatible: true,
        securityModel: 'pos-consensus',
        ecosystem: 'large'
      }
    ];
    
    return l2Options
      .map(l2 => ({
        ...l2,
        score: this.calculateScore(l2, requirements)
      }))
      .sort((a, b) => b.score - a.score);
  }
  
  private static calculateScore(l2: any, req: DAppRequirements): number {
    let score = 0;
    
    // Throughput requirement
    if (l2.throughput >= req.minThroughput) score += 20;
    
    // Finality requirement
    const finalityMinutes = this.parseFinality(l2.finality);
    if (finalityMinutes <= req.maxFinalityMinutes) score += 20;
    
    // Gas savings
    score += Math.min(20, l2.gasReduction / 5);
    
    // EVM compatibility
    if (req.requiresEVM && l2.evmCompatible) score += 20;
    
    // Security preference
    if (req.securityPreference === l2.securityModel) score += 10;
    
    // Ecosystem size
    const ecosystemScore = {
      'largest': 10,
      'large': 8,
      'growing': 5,
      'emerging': 3
    };
    score += ecosystemScore[l2.ecosystem] || 0;
    
    return score;
  }
  
  private static parseFinality(finality: string): number {
    const match = finality.match(/(\d+)\s*(second|minute|hour|day|week)/);
    if (!match) return Infinity;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    const multipliers = {
      'second': 1 / 60,
      'minute': 1,
      'hour': 60,
      'day': 1440,
      'week': 10080
    };
    
    return value * multipliers[unit];
  }
}

interface DAppRequirements {
  minThroughput: number;
  maxFinalityMinutes: number;
  requiresEVM: boolean;
  securityPreference: 'fraud-proofs' | 'validity-proofs' | 'pos-consensus';
  budgetPerTransaction: number;
}

interface L2Recommendation {
  name: string;
  type: string;
  score: number;
  pros: string[];
  cons: string[];
}

// Migration checklist
const L2MigrationChecklist = {
  preparation: [
    'Audit existing smart contracts',
    'Identify L2-specific changes needed',
    'Test on L2 testnet',
    'Plan data migration strategy'
  ],
  
  implementation: [
    'Deploy contracts to L2',
    'Setup bridge contracts',
    'Implement L2 provider in frontend',
    'Add network switching UI'
  ],
  
  testing: [
    'Test deposit/withdrawal flows',
    'Verify gas cost reductions',
    'Check transaction finality',
    'Load test on testnet'
  ],
  
  deployment: [
    'Gradual rollout strategy',
    'Monitor bridge liquidity',
    'User education materials',
    'Support documentation'
  ],
  
  monitoring: [
    'Track L2 uptime',
    'Monitor gas prices',
    'Watch for security updates',
    'User feedback collection'
  ]
};
\`\`\`
`,
  assignments: [
    {
      id: 'assignment-4-4-1',
      title: 'Implement Payment Channel System',
      difficulty: 'hard',
      type: 'project',
      description: 'Bouw een complete payment channel implementatie',
      tasks: [
        'Creëer bi-directional payment channels',
        'Implementeer state updates en signatures',
        'Voeg dispute resolution toe',
        'Bouw frontend voor channel management'
      ],
      hints: [
        'Begin met uni-directional channels',
        'Test signature verification thoroughly',
        'Implementeer proper timeout mechanisms'
      ]
    },
    {
      id: 'assignment-4-4-2',
      title: 'Build L2 Bridge Interface',
      difficulty: 'hard',
      type: 'project',
      hints: [
        'Leer werken met verschillende L2 bridge protocols',
        'Implementeer cross-chain transaction tracking',
        'Begrijp deposit en withdrawal mechanismen',
        'Optimaliseer gas kosten voor gebruikers'
      ],
      description: 'Ontwikkel een multi-chain bridge UI',
      tasks: [
        'Integreer meerdere L2 bridges',
        'Implementeer deposit/withdrawal flows',
        'Voeg transaction tracking toe',
        'Creëer gas optimization features'
      ]
    }
  ],
  quiz: [
    {
      question: 'Wat is het belangrijkste verschil tussen Optimistic en ZK Rollups?',
      options: [
        'ZK Rollups zijn langzamer',
        'Optimistic Rollups hebben een challenge period, ZK Rollups hebben instant finality',
        'ZK Rollups zijn goedkoper',
        'Er is geen verschil'
      ],
      correctAnswer: 1,
      explanation: 'Optimistic Rollups assumeren transacties zijn geldig tenzij challenged (7 dagen wachttijd), terwijl ZK Rollups mathematical proofs gebruiken voor instant finality.'
    },
    {
      question: 'Waarom zijn state channels geschikt voor gaming applicaties?',
      options: [
        'Ze zijn goedkoper dan on-chain',
        'Ze bieden instant finality en unlimited transactions tussen partijen',
        'Ze zijn veiliger',
        'Ze werken niet voor gaming'
      ],
      correctAnswer: 1,
      explanation: 'State channels zijn perfect voor gaming omdat ze instant, gratis transacties mogelijk maken tussen spelers, met alleen opening en closing on-chain.'
    },
    {
      question: 'Wat is data availability in de context van rollups?',
      options: [
        'Of de blockchain online is',
        'Of transaction data beschikbaar is voor verificatie en withdrawal',
        'Database uptime',
        'API availability'
      ],
      correctAnswer: 1,
      explanation: 'Data availability garandeert dat alle transaction data beschikbaar blijft zodat gebruikers kunnen withdrawen en de chain state kunnen reconstrueren.'
    }
  ],
  resources: [
    {
      title: 'L2Beat',
      url: 'https://l2beat.com/',
      type: 'dashboard',
      description: 'Real-time L2 analytics en vergelijkingen'
    },
    {
      title: 'Optimism Documentation',
      url: 'https://community.optimism.io/',
      type: 'documentation',
      description: 'Complete Optimistic Rollup documentatie'
    },
    {
      title: 'zkSync Era Docs',
      url: 'https://era.zksync.io/docs/',
      type: 'documentation',
      description: 'zkEVM rollup development guide'
    }
  ],
  projectIdeas: [
    'Bouw een cross-L2 DEX aggregator',
    'Creëer een gaming platform met state channels',
    'Ontwikkel een L2 gas station network',
    'Maak een rollup-as-a-service platform'
  ]
};