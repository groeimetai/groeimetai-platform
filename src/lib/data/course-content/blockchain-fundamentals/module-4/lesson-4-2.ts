import { Lesson } from '@/lib/types/course';

export const lesson4_2: Lesson = {
  id: 'lesson-4-2',
  title: 'Smart Contract Security',
  duration: '45 minuten',
  objectives: [
    'Begrijpen van veelvoorkomende smart contract kwetsbaarheden',
    'Implementeren van reentrancy bescherming',
    'Toepassen van access control patronen',
    'Kennis van Nederlandse blockchain audit bedrijven'
  ],
  content: `
    <h2>Smart Contract Security</h2>
    
    <p>Smart contract beveiliging is cruciaal voor het ontwikkelen van betrouwbare blockchain applicaties. Een enkele kwetsbaarheid kan leiden tot het verlies van miljoenen euro's aan digitale assets.</p>

    <h3>1. Veelvoorkomende Kwetsbaarheden</h3>
    
    <h4>1.1 Reentrancy Attacks</h4>
    <p>Een reentrancy aanval gebeurt wanneer een externe contract call terugkomt naar het aanroepende contract voordat de eerste uitvoering is voltooid.</p>

    <pre><code class="language-solidity">
// KWETSBAAR CONTRACT
contract VulnerableBank {
    mapping(address => uint256) private balances;
    
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Onvoldoende saldo");
        
        // Kwetsbaar: externe call voor state update
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer mislukt");
        
        // State update na externe call
        balances[msg.sender] -= amount;
    }
}

// AANVALLER CONTRACT
contract Attacker {
    VulnerableBank public bank;
    uint256 public constant AMOUNT = 1 ether;
    
    receive() external payable {
        if (address(bank).balance >= AMOUNT) {
            bank.withdraw(AMOUNT);
        }
    }
    
    function attack() public {
        bank.withdraw(AMOUNT);
    }
}
    </code></pre>

    <h4>1.2 Integer Overflow/Underflow</h4>
    <pre><code class="language-solidity">
// KWETSBAAR (Solidity < 0.8.0)
contract OverflowExample {
    uint8 public counter = 255;
    
    function increment() public {
        counter += 1; // Overflow: 255 + 1 = 0
    }
}

// VEILIG (Solidity >= 0.8.0 of met SafeMath)
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract SafeCounter {
    using SafeMath for uint256;
    uint256 public counter;
    
    function increment() public {
        counter = counter.add(1); // Throws bij overflow
    }
}
    </code></pre>

    <h4>1.3 Front-Running</h4>
    <p>Transacties in de mempool zijn publiek zichtbaar voordat ze worden gemined. Aanvallers kunnen hiervan profiteren.</p>

    <pre><code class="language-solidity">
// Commit-Reveal patroon tegen front-running
contract SecureAuction {
    mapping(address => bytes32) private commits;
    mapping(address => uint256) public bids;
    
    uint256 public revealDeadline;
    
    function commitBid(bytes32 commitment) public {
        commits[msg.sender] = commitment;
    }
    
    function revealBid(uint256 value, uint256 nonce) public {
        require(block.timestamp > revealDeadline, "Reveal periode niet gestart");
        require(
            keccak256(abi.encodePacked(value, nonce)) == commits[msg.sender],
            "Ongeldige reveal"
        );
        bids[msg.sender] = value;
    }
}
    </code></pre>

    <h3>2. Reentrancy Bescherming</h3>
    
    <h4>2.1 Checks-Effects-Interactions Patroon</h4>
    <pre><code class="language-solidity">
contract SecureBank {
    mapping(address => uint256) private balances;
    
    function withdraw(uint256 amount) public {
        // 1. Checks
        require(balances[msg.sender] >= amount, "Onvoldoende saldo");
        
        // 2. Effects
        balances[msg.sender] -= amount;
        
        // 3. Interactions
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer mislukt");
    }
}
    </code></pre>

    <h4>2.2 ReentrancyGuard</h4>
    <pre><code class="language-solidity">
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract BetterBank is ReentrancyGuard {
    mapping(address => uint256) private balances;
    
    function withdraw(uint256 amount) public nonReentrant {
        require(balances[msg.sender] >= amount, "Onvoldoende saldo");
        balances[msg.sender] -= amount;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer mislukt");
    }
}
    </code></pre>

    <h3>3. Access Control Patronen</h3>
    
    <h4>3.1 Ownership Patroon</h4>
    <pre><code class="language-solidity">
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenContract is Ownable {
    mapping(address => uint256) public balances;
    uint256 public totalSupply;
    
    // Alleen eigenaar kan tokens minten
    function mint(address to, uint256 amount) public onlyOwner {
        balances[to] += amount;
        totalSupply += amount;
    }
    
    // Eigenaarschap overdragen
    function transferOwnership(address newOwner) public override onlyOwner {
        require(newOwner != address(0), "Ongeldig adres");
        _transferOwnership(newOwner);
    }
}
    </code></pre>

    <h4>3.2 Role-Based Access Control</h4>
    <pre><code class="language-solidity">
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Platform is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 public constant USER_ROLE = keccak256("USER_ROLE");
    
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(MODERATOR_ROLE, ADMIN_ROLE);
        _setRoleAdmin(USER_ROLE, MODERATOR_ROLE);
    }
    
    function addModerator(address account) public onlyRole(ADMIN_ROLE) {
        grantRole(MODERATOR_ROLE, account);
    }
    
    function removeContent(uint256 contentId) public onlyRole(MODERATOR_ROLE) {
        // Verwijder content
    }
}
    </code></pre>

    <h3>4. Veilige Ontwikkelpraktijken</h3>
    
    <h4>4.1 Input Validatie</h4>
    <pre><code class="language-solidity">
contract SecureMarketplace {
    struct Product {
        string name;
        uint256 price;
        address seller;
        bool active;
    }
    
    mapping(uint256 => Product) public products;
    
    function createProduct(
        string memory name,
        uint256 price
    ) public {
        // Input validatie
        require(bytes(name).length > 0, "Naam is verplicht");
        require(bytes(name).length <= 100, "Naam te lang");
        require(price > 0, "Prijs moet groter dan 0 zijn");
        require(price <= 1000000 ether, "Prijs te hoog");
        
        // Product aanmaken
        products[nextId] = Product({
            name: name,
            price: price,
            seller: msg.sender,
            active: true
        });
    }
}
    </code></pre>

    <h4>4.2 Pull over Push Payments</h4>
    <pre><code class="language-solidity">
contract PullPayment {
    mapping(address => uint256) private payments;
    
    // Sla betalingen op in plaats van direct versturen
    function asyncTransfer(address to, uint256 amount) internal {
        payments[to] += amount;
    }
    
    // Gebruikers halen zelf hun betaling op
    function withdrawPayments() public {
        uint256 payment = payments[msg.sender];
        require(payment > 0, "Geen betaling beschikbaar");
        
        payments[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: payment}("");
        require(success, "Transfer mislukt");
    }
}
    </code></pre>

    <h3>5. Nederlandse Blockchain Audit Bedrijven</h3>
    
    <div class="bg-blue-50 p-4 rounded-lg mb-4">
      <h4>CertiK Nederland</h4>
      <p>Internationaal audit bedrijf met Nederlandse vestiging. Gespecialiseerd in smart contract audits en blockchain security.</p>
      <ul>
        <li>Formele verificatie methoden</li>
        <li>Penetration testing</li>
        <li>Security monitoring tools</li>
      </ul>
    </div>

    <div class="bg-blue-50 p-4 rounded-lg mb-4">
      <h4>Solidified</h4>
      <p>Blockchain security firma met expertise in Ethereum smart contracts.</p>
      <ul>
        <li>Smart contract audits</li>
        <li>Bug bounty programma's</li>
        <li>Security training</li>
      </ul>
    </div>

    <div class="bg-blue-50 p-4 rounded-lg mb-4">
      <h4>ChainSecurity</h4>
      <p>Spin-off van ETH Zürich met sterke Europese aanwezigheid.</p>
      <ul>
        <li>Automated security tools</li>
        <li>Manual code review</li>
        <li>Security consulting</li>
      </ul>
    </div>

    <h3>6. Security Checklist</h3>
    
    <div class="bg-yellow-50 p-4 rounded-lg">
      <h4>Voor Deployment:</h4>
      <ul class="list-disc list-inside">
        <li>✓ Alle functies getest met edge cases</li>
        <li>✓ Reentrancy guards geïmplementeerd</li>
        <li>✓ Access control gevalideerd</li>
        <li>✓ Integer overflow/underflow checks</li>
        <li>✓ External calls geminimaliseerd</li>
        <li>✓ Gas limits overwogen</li>
        <li>✓ Audit uitgevoerd door externe partij</li>
        <li>✓ Bug bounty programma opgezet</li>
        <li>✓ Emergency pause mechanisme</li>
        <li>✓ Upgrade strategie bepaald</li>
      </ul>
    </div>

    <h3>Samenvatting</h3>
    <p>Smart contract security vereist een diepgaand begrip van mogelijke aanvalsvectoren en defensieve programmeerpatronen. Nederlandse bedrijven spelen een belangrijke rol in het blockchain security ecosysteem, met expertise in auditing en security tools.</p>
  `,
  codeExamples: [
    {
      title: 'Veilig Staking Contract',
      language: 'solidity',
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SecureStaking is ReentrancyGuard, Pausable, Ownable {
    IERC20 public stakingToken;
    
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 rewardDebt;
    }
    
    mapping(address => Stake) public stakes;
    uint256 public totalStaked;
    uint256 public rewardRate = 100; // 1% per dag
    
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 reward);
    
    constructor(address _stakingToken) {
        stakingToken = IERC20(_stakingToken);
    }
    
    function stake(uint256 _amount) external nonReentrant whenNotPaused {
        require(_amount > 0, "Bedrag moet groter dan 0 zijn");
        require(
            stakingToken.transferFrom(msg.sender, address(this), _amount),
            "Token transfer mislukt"
        );
        
        // Claim pending rewards
        if (stakes[msg.sender].amount > 0) {
            _claimRewards();
        }
        
        stakes[msg.sender].amount += _amount;
        stakes[msg.sender].timestamp = block.timestamp;
        totalStaked += _amount;
        
        emit Staked(msg.sender, _amount);
    }
    
    function withdraw(uint256 _amount) external nonReentrant {
        Stake storage userStake = stakes[msg.sender];
        require(userStake.amount >= _amount, "Onvoldoende gestaked");
        
        // Claim rewards first
        _claimRewards();
        
        userStake.amount -= _amount;
        totalStaked -= _amount;
        
        require(
            stakingToken.transfer(msg.sender, _amount),
            "Token transfer mislukt"
        );
        
        emit Withdrawn(msg.sender, _amount);
    }
    
    function _claimRewards() private {
        uint256 reward = calculateReward(msg.sender);
        if (reward > 0) {
            stakes[msg.sender].rewardDebt += reward;
            stakes[msg.sender].timestamp = block.timestamp;
            
            // Mint of transfer rewards
            require(
                stakingToken.transfer(msg.sender, reward),
                "Reward transfer mislukt"
            );
            
            emit RewardsClaimed(msg.sender, reward);
        }
    }
    
    function calculateReward(address _user) public view returns (uint256) {
        Stake memory userStake = stakes[_user];
        if (userStake.amount == 0) return 0;
        
        uint256 stakingDuration = block.timestamp - userStake.timestamp;
        uint256 reward = (userStake.amount * rewardRate * stakingDuration) / 
                        (100 * 365 days);
        
        return reward;
    }
    
    // Admin functies
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function updateRewardRate(uint256 _newRate) external onlyOwner {
        require(_newRate <= 1000, "Rate te hoog"); // Max 10%
        rewardRate = _newRate;
    }
    
    // Emergency withdrawal
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = stakingToken.balanceOf(address(this));
        require(
            stakingToken.transfer(owner(), balance),
            "Emergency withdrawal mislukt"
        );
    }
}`
    }
  ],
  quiz: {
    questions: [
      {
        id: 'q1',
        text: 'Wat is een reentrancy aanval?',
        options: [
          'Een aanval waarbij gas limits worden overschreden',
          'Een aanval waarbij een externe functie het contract opnieuw aanroept voordat de eerste uitvoering is voltooid',
          'Een aanval waarbij integer overflow wordt gebruikt',
          'Een aanval waarbij front-running wordt toegepast'
        ],
        correctAnswer: 1
      },
      {
        id: 'q2',
        text: 'Welk patroon voorkomt reentrancy aanvallen?',
        options: [
          'Push-Effects-Pull',
          'Checks-Effects-Interactions',
          'Input-Process-Output',
          'Create-Read-Update-Delete'
        ],
        correctAnswer: 1
      },
      {
        id: 'q3',
        text: 'Waarom is het Pull Payment patroon veiliger dan Push Payment?',
        options: [
          'Het is goedkoper in gas kosten',
          'Het voorkomt dat ontvangers de transactie kunnen blokkeren',
          'Het is sneller in uitvoering',
          'Het vereist minder code'
        ],
        correctAnswer: 1
      }
    ]
  }
};