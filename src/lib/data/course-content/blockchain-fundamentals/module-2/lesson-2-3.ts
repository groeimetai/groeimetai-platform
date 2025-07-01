// Module 2 - Lesson 3: Smart contract security

export default {
  id: 'lesson-2-3',
  title: 'Smart contract security',
  duration: '3 uur',
  objectives: [
    'Identificeer common smart contract vulnerabilities',
    'Leer security best practices en patterns',
    'Begrijp audit processen en tools',
    'Implementeer veilige smart contracts'
  ],
  content: `
# Smart Contract Security

## Waarom Security Cruciaal is

Smart contracts beheren vaak **miljoenen dollars** aan waarde en zijn **immutable** na deployment. Een enkele bug kan leiden tot:
- **Permanente** loss of funds
- **Reputatieschade** voor het project
- **Legal** en regulatory problemen
- **Gebruikersvertrouwen** verlies

## Common Vulnerabilities

### 1. Reentrancy Attacks

De meest beruchte vulnerability, verantwoordelijk voor de DAO hack ($60M verlies).

\`\`\`solidity
// VULNERABLE CONTRACT
contract VulnerableBank {
    mapping(address => uint256) public balances;
    
    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }
    
    // VULNERABLE: State update na external call
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        // External call VOOR state update - GEVAARLIJK!
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        // State update NA external call
        balances[msg.sender] -= amount;
    }
}

// ATTACKER CONTRACT
contract Attacker {
    VulnerableBank public bank;
    uint256 public constant AMOUNT = 1 ether;
    
    constructor(address _bank) {
        bank = VulnerableBank(_bank);
    }
    
    function attack() public payable {
        require(msg.value >= AMOUNT, "Need 1 ether");
        bank.deposit{value: AMOUNT}();
        bank.withdraw(AMOUNT);
    }
    
    // Fallback triggered tijdens withdraw
    receive() external payable {
        if (address(bank).balance >= AMOUNT) {
            // Re-enter withdraw function
            bank.withdraw(AMOUNT);
        }
    }
}

// SECURE VERSION
contract SecureBank {
    mapping(address => uint256) public balances;
    
    // Reentrancy guard
    uint256 private constant UNLOCKED = 1;
    uint256 private constant LOCKED = 2;
    uint256 private lockStatus = UNLOCKED;
    
    modifier nonReentrant() {
        require(lockStatus == UNLOCKED, "Reentrant call");
        lockStatus = LOCKED;
        _;
        lockStatus = UNLOCKED;
    }
    
    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }
    
    // SECURE: Checks-Effects-Interactions pattern
    function withdraw(uint256 amount) public nonReentrant {
        // Checks
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        // Effects (state update VOOR external call)
        balances[msg.sender] -= amount;
        
        // Interactions (external call als laatste)
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }
}
\`\`\`

### 2. Integer Overflow/Underflow

Voor Solidity 0.8.0 waren arithmetic operations niet safe by default.

\`\`\`solidity
// VULNERABLE (Solidity < 0.8.0)
contract VulnerableToken {
    mapping(address => uint256) public balances;
    
    function transfer(address to, uint256 amount) public {
        // Underflow mogelijk: 0 - 1 = 2^256 - 1
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }
    
    function mint(uint256 amount) public {
        // Overflow mogelijk
        balances[msg.sender] += amount;
    }
}

// SECURE VERSION (Pre-0.8.0)
import "@openzeppelin/contracts/math/SafeMath.sol";

contract SecureTokenOld {
    using SafeMath for uint256;
    mapping(address => uint256) public balances;
    
    function transfer(address to, uint256 amount) public {
        balances[msg.sender] = balances[msg.sender].sub(amount);
        balances[to] = balances[to].add(amount);
    }
}

// SECURE VERSION (Solidity >= 0.8.0)
contract SecureToken {
    mapping(address => uint256) public balances;
    
    function transfer(address to, uint256 amount) public {
        // Automatic overflow/underflow protection
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }
    
    // Voor unchecked operations (gas optimization)
    function unsafeAdd(uint256 a, uint256 b) public pure returns (uint256) {
        unchecked {
            return a + b; // Geen overflow check
        }
    }
}
\`\`\`

### 3. Access Control Vulnerabilities

\`\`\`solidity
// VULNERABLE: Geen access control
contract VulnerableContract {
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    // Iedereen kan owner worden!
    function setOwner(address newOwner) public {
        owner = newOwner;
    }
    
    // Typo in modifier naam
    modifier onlyowner() { // Kleine letter 'o'
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    // Gebruikt verkeerde modifier
    function withdraw() public onlyOwner { // Grote letter 'O' bestaat niet!
        payable(owner).transfer(address(this).balance);
    }
}

// SECURE VERSION
contract SecureContract {
    address private immutable owner;
    mapping(address => bool) private admins;
    
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == owner, "Not admin");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        admins[msg.sender] = true;
    }
    
    function addAdmin(address admin) public onlyOwner {
        require(admin != address(0), "Invalid address");
        require(!admins[admin], "Already admin");
        
        admins[admin] = true;
        emit AdminAdded(admin);
    }
    
    function removeAdmin(address admin) public onlyOwner {
        require(admins[admin], "Not an admin");
        
        admins[admin] = false;
        emit AdminRemoved(admin);
    }
}
\`\`\`

### 4. Front-Running (MEV)

\`\`\`solidity
// VULNERABLE: Front-running mogelijk
contract VulnerableAuction {
    address public highestBidder;
    uint256 public highestBid;
    
    function bid() public payable {
        require(msg.value > highestBid, "Bid too low");
        
        // Refund previous bidder
        if (highestBidder != address(0)) {
            payable(highestBidder).transfer(highestBid);
        }
        
        highestBidder = msg.sender;
        highestBid = msg.value;
    }
}

// SECURE: Commit-reveal pattern
contract SecureAuction {
    struct Bid {
        bytes32 blindedBid;
        uint256 deposit;
    }
    
    mapping(address => Bid[]) public bids;
    
    address public highestBidder;
    uint256 public highestBid;
    
    uint256 public biddingEnd;
    uint256 public revealEnd;
    
    modifier onlyBefore(uint256 time) {
        require(block.timestamp < time, "Too late");
        _;
    }
    
    modifier onlyAfter(uint256 time) {
        require(block.timestamp >= time, "Too early");
        _;
    }
    
    constructor(uint256 biddingTime, uint256 revealTime) {
        biddingEnd = block.timestamp + biddingTime;
        revealEnd = biddingEnd + revealTime;
    }
    
    // Phase 1: Submit blinded bid
    function bid(bytes32 blindedBid) public payable onlyBefore(biddingEnd) {
        bids[msg.sender].push(Bid({
            blindedBid: blindedBid,
            deposit: msg.value
        }));
    }
    
    // Phase 2: Reveal bids
    function reveal(
        uint256[] memory values,
        bool[] memory fake,
        bytes32[] memory secret
    ) public onlyAfter(biddingEnd) onlyBefore(revealEnd) {
        uint256 length = bids[msg.sender].length;
        require(values.length == length, "Invalid length");
        require(fake.length == length, "Invalid length");
        require(secret.length == length, "Invalid length");
        
        for (uint256 i = 0; i < length; i++) {
            Bid storage bidToCheck = bids[msg.sender][i];
            (uint256 value, bool fake_, bytes32 secret_) = (values[i], fake[i], secret[i]);
            
            if (bidToCheck.blindedBid != keccak256(abi.encodePacked(value, fake_, secret_))) {
                continue;
            }
            
            if (!fake_ && bidToCheck.deposit >= value) {
                if (placeBid(msg.sender, value)) {
                    bidToCheck.deposit -= value;
                }
            }
        }
    }
    
    function placeBid(address bidder, uint256 value) internal returns (bool) {
        if (value <= highestBid) {
            return false;
        }
        
        if (highestBidder != address(0)) {
            // Refund previous highest bidder
            payable(highestBidder).transfer(highestBid);
        }
        
        highestBid = value;
        highestBidder = bidder;
        return true;
    }
}
\`\`\`

### 5. Timestamp Dependence

\`\`\`solidity
// VULNERABLE: Miner kan timestamp manipuleren
contract VulnerableLottery {
    uint256 public constant TICKET_PRICE = 1 ether;
    address[] public players;
    
    function buyTicket() public payable {
        require(msg.value == TICKET_PRICE, "Wrong ticket price");
        players.push(msg.sender);
    }
    
    // VULNERABLE: Timestamp voor randomness
    function drawWinner() public {
        require(players.length > 0, "No players");
        
        // Miner kan timestamp binnen ~15 seconden manipuleren
        uint256 winnerIndex = uint256(
            keccak256(abi.encodePacked(block.timestamp, block.difficulty))
        ) % players.length;
        
        address winner = players[winnerIndex];
        payable(winner).transfer(address(this).balance);
        
        delete players;
    }
}

// SECURE: Chainlink VRF voor randomness
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract SecureLottery is VRFConsumerBase {
    bytes32 internal keyHash;
    uint256 internal fee;
    uint256 public randomResult;
    
    address[] public players;
    
    constructor() 
        VRFConsumerBase(
            0x... // VRF Coordinator
            0x... // LINK Token
        )
    {
        keyHash = 0x...;
        fee = 0.1 * 10 ** 18; // 0.1 LINK
    }
    
    function requestRandomWinner() public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK");
        return requestRandomness(keyHash, fee);
    }
    
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        randomResult = randomness;
        
        uint256 winnerIndex = randomResult % players.length;
        address winner = players[winnerIndex];
        
        payable(winner).transfer(address(this).balance);
        delete players;
    }
}
\`\`\`

### 6. Denial of Service (DoS)

\`\`\`solidity
// VULNERABLE: DoS via gaslimit
contract VulnerableRefund {
    address[] public refundAddresses;
    mapping(address => uint256) public refunds;
    
    function refundAll() public {
        // Als array te groot wordt, kan dit falen door gas limit
        for (uint256 i = 0; i < refundAddresses.length; i++) {
            address payable recipient = payable(refundAddresses[i]);
            uint256 amount = refunds[recipient];
            
            recipient.transfer(amount); // Kan falen en hele transactie reverten
            refunds[recipient] = 0;
        }
    }
}

// SECURE: Pull over Push pattern
contract SecureRefund {
    mapping(address => uint256) public refunds;
    
    event RefundAvailable(address indexed user, uint256 amount);
    
    function addRefund(address user, uint256 amount) internal {
        refunds[user] += amount;
        emit RefundAvailable(user, amount);
    }
    
    // Users pullen hun eigen refund
    function withdrawRefund() public {
        uint256 amount = refunds[msg.sender];
        require(amount > 0, "No refund available");
        
        refunds[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }
}

// VULNERABLE: DoS via revert
contract VulnerableKingOfEther {
    address public king;
    uint256 public balance;
    
    function claimThrone() public payable {
        require(msg.value > balance, "Need to pay more");
        
        // Refund previous king - kan falen!
        payable(king).transfer(balance);
        
        king = msg.sender;
        balance = msg.value;
    }
}

// ATTACKER: Block nieuwe kings
contract MaliciousKing {
    function attack(address game) public payable {
        VulnerableKingOfEther(game).claimThrone{value: msg.value}();
    }
    
    // Refuse refunds, blocking new kings
    receive() external payable {
        revert("No refunds accepted!");
    }
}
\`\`\`

## Security Patterns

### Checks-Effects-Interactions Pattern

\`\`\`solidity
contract CEIPattern {
    mapping(address => uint256) private balances;
    
    function withdraw(uint256 amount) public {
        // 1. CHECKS - Valideer inputs en state
        require(amount > 0, "Amount must be positive");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        // 2. EFFECTS - Update state
        balances[msg.sender] -= amount;
        
        // 3. INTERACTIONS - External calls als laatste
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }
}
\`\`\`

### Pull over Push Pattern

\`\`\`solidity
contract PullPattern {
    mapping(address => uint256) private earnings;
    
    // Don't push payments
    function badDistribute(address[] memory recipients, uint256[] memory amounts) public {
        for (uint i = 0; i < recipients.length; i++) {
            payable(recipients[i]).transfer(amounts[i]); // Can fail!
        }
    }
    
    // Let users pull their payments
    function addEarnings(address user, uint256 amount) internal {
        earnings[user] += amount;
    }
    
    function withdrawEarnings() public {
        uint256 amount = earnings[msg.sender];
        require(amount > 0, "No earnings");
        
        earnings[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }
}
\`\`\`

### Emergency Stop Pattern

\`\`\`solidity
contract EmergencyStop {
    address private owner;
    bool private stopped = false;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier stopInEmergency() {
        require(!stopped, "Contract is stopped");
        _;
    }
    
    modifier onlyInEmergency() {
        require(stopped, "Not in emergency");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function toggleEmergency() public onlyOwner {
        stopped = !stopped;
    }
    
    function deposit() public payable stopInEmergency {
        // Normal operation
    }
    
    function emergencyWithdraw() public onlyOwner onlyInEmergency {
        payable(owner).transfer(address(this).balance);
    }
}
\`\`\`

## Security Tools

### Static Analysis Tools

\`\`\`bash
# Slither - Static analyzer
pip3 install slither-analyzer
slither contracts/

# Mythril - Security analysis tool
pip3 install mythril
myth analyze contracts/MyContract.sol

# Echidna - Fuzzing tool
# Installation varies by OS
echidna-test contracts/MyContract.sol
\`\`\`

### Example Slither Output
\`\`\`python
# Custom Slither detector
from slither.detectors.abstract_detector import AbstractDetector
from slither.core.declarations import Function

class UncheckedTransfer(AbstractDetector):
    """
    Detect unchecked transfer calls
    """
    
    ARGUMENT = 'unchecked-transfer'
    HELP = 'Unchecked transfer'
    IMPACT = DetectorClassification.HIGH
    CONFIDENCE = DetectorClassification.HIGH
    
    def _detect(self):
        results = []
        
        for contract in self.contracts:
            for function in contract.functions:
                for node in function.nodes:
                    for ir in node.irs:
                        if isinstance(ir, LowLevelCall):
                            if not self._is_checked(node):
                                results.append({
                                    'function': function,
                                    'node': node
                                })
        
        return results
\`\`\`

### Testing Security

\`\`\`javascript
// Hardhat security testing
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Security Tests", function () {
    let contract;
    let attacker;
    
    beforeEach(async function () {
        const Contract = await ethers.getContractFactory("VulnerableBank");
        contract = await Contract.deploy();
        
        const Attacker = await ethers.getContractFactory("ReentrancyAttacker");
        attacker = await Attacker.deploy(contract.address);
    });
    
    it("Should prevent reentrancy attack", async function () {
        // Deposit funds
        await contract.deposit({ value: ethers.utils.parseEther("10") });
        
        // Attempt attack
        await expect(
            attacker.attack({ value: ethers.utils.parseEther("1") })
        ).to.be.revertedWith("Reentrant call");
    });
    
    it("Should handle integer overflow", async function () {
        const maxUint256 = ethers.constants.MaxUint256;
        
        await expect(
            contract.add(maxUint256, 1)
        ).to.be.reverted; // Solidity 0.8+ auto-reverts
    });
    
    it("Should enforce access control", async function () {
        const [owner, user] = await ethers.getSigners();
        
        await expect(
            contract.connect(user).ownerFunction()
        ).to.be.revertedWith("Not owner");
    });
});
\`\`\`

## Audit Checklist

### Pre-deployment Checklist

\`\`\`solidity
contract AuditChecklist {
    // ✅ Access Control
    // - All admin functions have proper modifiers
    // - No public functions that should be private
    // - Ownership transfer has two-step process
    
    // ✅ Reentrancy Protection  
    // - State changes before external calls
    // - ReentrancyGuard on all public functions with external calls
    
    // ✅ Integer Operations
    // - Using Solidity 0.8+ or SafeMath
    // - Checked arithmetic where needed
    // - Unchecked only where proven safe
    
    // ✅ External Calls
    // - Check return values
    // - Set gas limits where appropriate
    // - Handle call failures gracefully
    
    // ✅ DoS Protection
    // - No unbounded loops
    // - Pull over push for payments
    // - Gas limits considered
    
    // ✅ Randomness
    // - No block.timestamp for randomness
    // - Using Chainlink VRF or commit-reveal
    
    // ✅ Upgradability
    // - If upgradable, proper proxy pattern
    // - Storage layout consistency
    // - Initialization protected
}
\`\`\`

## Best Practices

### General Guidelines

\`\`\`solidity
contract BestPractices {
    // 1. Use latest Solidity version
    // pragma solidity ^0.8.19;
    
    // 2. Explicit function visibility
    function publicFunction() public { }
    function _internalFunction() internal { }
    function _privateFunction() private { }
    
    // 3. Emit events for all state changes
    event StateChanged(address indexed user, uint256 newValue);
    
    // 4. Use custom errors (gas efficient)
    error InvalidInput(uint256 provided, uint256 required);
    
    // 5. Validate all inputs
    function setvalue(uint256 newValue) public {
        if (newValue == 0) revert InvalidInput(newValue, 1);
        // ...
    }
    
    // 6. Use immutable for constants set at deployment
    address public immutable OWNER;
    uint256 public constant FEE = 100;
    
    // 7. Lock compiler version for production
    // pragma solidity 0.8.19; // No ^
    
    // 8. Document with NatSpec
    /// @notice Transfers tokens to recipient
    /// @param to The recipient address
    /// @param amount The amount to transfer
    /// @return success Whether the transfer succeeded
    function transfer(address to, uint256 amount) public returns (bool success) {
        // ...
    }
}
\`\`\`

### Gas Optimization vs Security

\`\`\`solidity
contract GasVsSecurity {
    // Sometimes security costs more gas
    
    // Less gas, less secure
    function unsafeTransfer(address to, uint256 amount) public {
        balances[msg.sender] -= amount;
        balances[to] += amount;
        // No zero address check, no event
    }
    
    // More gas, more secure
    function safeTransfer(address to, uint256 amount) public returns (bool) {
        require(to != address(0), "Invalid recipient");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        uint256 senderBalanceBefore = balances[msg.sender];
        uint256 recipientBalanceBefore = balances[to];
        
        balances[msg.sender] -= amount;
        balances[to] += amount;
        
        assert(balances[msg.sender] == senderBalanceBefore - amount);
        assert(balances[to] == recipientBalanceBefore + amount);
        
        emit Transfer(msg.sender, to, amount);
        
        return true;
    }
}
\`\`\`
`,
  assignments: [
    {
      id: 'assignment-2-3-1',
      title: 'Security Audit Simulatie',
      description: 'Vind en fix security vulnerabilities in een contract',
      difficulty: 'hard',
      type: 'project',
      tasks: [
        'Analyseer de gegeven vulnerable contract',
        'Identificeer minstens 5 security issues',
        'Schrijf een secure versie van het contract',
        'Creëer tests die de vulnerabilities demonstreren'
      ],
      hints: [
        'Check voor reentrancy vulnerabilities',
        'Zoek naar unchecked external calls',
        'Controleer access control'
      ]
    },
    {
      id: 'assignment-2-3-2',
      title: 'Implementeer Security Patterns',
      description: 'Bouw een contract met multiple security patterns',
      difficulty: 'hard',
      type: 'project',
      tasks: [
        'Implementeer CEI pattern',
        'Voeg emergency stop functionaliteit toe',
        'Implementeer pull payment pattern',
        'Voeg reentrancy guards toe'
      ]
    }
  ],
  quiz: [
    {
      question: 'Wat is de veiligste volgorde voor contract operaties?',
      options: [
        'Interactions -> Effects -> Checks',
        'Effects -> Checks -> Interactions',
        'Checks -> Effects -> Interactions',
        'Checks -> Interactions -> Effects'
      ],
      correctAnswer: 2,
      explanation: 'Het Checks-Effects-Interactions pattern voorkomt reentrancy door eerst te valideren, dan state te updaten, en pas als laatste external calls te maken.'
    },
    {
      question: 'Waarom is block.timestamp onveilig voor randomness?',
      options: [
        'Het is te complex om te gebruiken',
        'Miners kunnen het binnen bepaalde grenzen manipuleren',
        'Het gebruikt teveel gas',
        'Het is niet beschikbaar in smart contracts'
      ],
      correctAnswer: 1,
      explanation: 'Miners kunnen block.timestamp binnen ongeveer 15 seconden manipuleren, wat het ongeschikt maakt voor randomness in high-stakes situaties.'
    },
    {
      question: 'Wat is het doel van een reentrancy guard?',
      options: [
        'Om gas kosten te verlagen',
        'Om meerdere transacties tegelijk te verwerken',
        'Om te voorkomen dat een functie zichzelf aanroept voordat de eerste call klaar is',
        'Om de contract owner te beschermen'
      ],
      correctAnswer: 2,
      explanation: 'Een reentrancy guard voorkomt dat een functie opnieuw wordt aangeroepen terwijl de eerste uitvoering nog bezig is, wat reentrancy attacks voorkomt.'
    }
  ],
  resources: [
    {
      title: 'Smart Contract Security Best Practices',
      url: 'https://consensys.github.io/smart-contract-best-practices/',
      type: 'guide',
      description: 'Uitgebreide security guide van ConsenSys'
    },
    {
      title: 'Ethernaut Security Challenges',
      url: 'https://ethernaut.openzeppelin.com/',
      type: 'interactive',
      description: 'Hands-on security challenges'
    },
    {
      title: 'SWC Registry',
      url: 'https://swcregistry.io/',
      type: 'reference',
      description: 'Smart Contract Weakness Classification Registry'
    }
  ],
  projectIdeas: [
    'Bouw een secure multi-sig wallet met time locks',
    'Creëer een audit tool die common vulnerabilities detecteert',
    'Implementeer een secure token swap contract',
    'Ontwikkel een bug bounty platform smart contract'
  ]
};