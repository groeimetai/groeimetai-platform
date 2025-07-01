// Module 2 - Lesson 2: Solidity programmeren basics

export default {
  id: 'lesson-2-2',
  title: 'Solidity programmeren basics',
  duration: '4 uur',
  objectives: [
    'Leer de Solidity syntax en structuur',
    'Begrijp data types en control structures',
    'Werk met functions, modifiers en events',
    'Implementeer je eerste smart contracts'
  ],
  content: `
# Solidity Programmeren Basics

## Introductie tot Solidity

Solidity is een **object-georiënteerde, high-level programmeertaal** voor het implementeren van smart contracts. Het is statisch getypeerd, ondersteunt inheritance, libraries en complexe user-defined types.

### Waarom Solidity?
- **Ethereum-native**: Speciaal ontworpen voor de EVM
- **Familiar syntax**: Geïnspireerd door C++, Python en JavaScript
- **Rich ecosystem**: Uitgebreide tools en libraries
- **Active development**: Continue verbeteringen

## Basis Structuur

### Contract Anatomy

\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Import statements
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Contract definitie
contract MyFirstContract {
    // State variables
    uint256 public count;
    address public owner;
    mapping(address => uint256) public balances;
    
    // Events
    event CountIncremented(uint256 newCount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    // Constructor
    constructor() {
        owner = msg.sender;
        count = 0;
    }
    
    // Functions
    function increment() public {
        count += 1;
        emit CountIncremented(count);
    }
    
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
    
    // View functions
    function getCount() public view returns (uint256) {
        return count;
    }
    
    // Pure functions
    function add(uint256 a, uint256 b) public pure returns (uint256) {
        return a + b;
    }
}
\`\`\`

## Data Types

### Value Types

\`\`\`solidity
contract DataTypes {
    // Booleans
    bool public isActive = true;
    
    // Integers
    uint256 public unsignedInt = 42;
    int256 public signedInt = -42;
    uint8 public smallUint = 255; // 0-255
    
    // Address
    address public userAddress = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;
    address payable public payableAddress; // Can receive ETH
    
    // Fixed-size byte arrays
    bytes32 public hash = 0x7465737400000000000000000000000000000000000000000000000000000000;
    bytes1 public singleByte = 0xFF;
    
    // Enums
    enum Status { Pending, Active, Completed, Cancelled }
    Status public currentStatus = Status.Pending;
    
    // Function demonstrating type conversions
    function typeConversions() public pure {
        // Implicit conversions (smaller to larger)
        uint8 small = 10;
        uint256 large = small; // OK
        
        // Explicit conversions required for:
        // - larger to smaller
        // - signed to unsigned
        uint256 bigNumber = 1000;
        uint8 smallNumber = uint8(bigNumber); // Explicit cast
        
        // Address conversions
        address addr = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;
        address payable pAddr = payable(addr);
        
        // Bytes conversions
        bytes32 b32 = "Hello";
        bytes memory dynamicBytes = abi.encodePacked(b32);
    }
}
\`\`\`

### Reference Types

\`\`\`solidity
contract ReferenceTypes {
    // Arrays
    uint256[] public dynamicArray;
    uint256[10] public fixedArray;
    
    // Strings
    string public name = "Ethereum";
    
    // Bytes (dynamic)
    bytes public data;
    
    // Structs
    struct User {
        string name;
        uint256 age;
        address wallet;
        bool isActive;
    }
    
    User[] public users;
    
    // Mappings
    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowances; // Nested mapping
    mapping(uint256 => User) public userById;
    
    // Array operations
    function arrayOperations() public {
        // Push
        dynamicArray.push(42);
        
        // Access
        uint256 firstElement = dynamicArray[0];
        
        // Length
        uint256 arrayLength = dynamicArray.length;
        
        // Pop (removes last element)
        dynamicArray.pop();
        
        // Delete (sets to default value)
        delete dynamicArray[0];
        
        // Memory arrays
        uint256[] memory tempArray = new uint256[](5);
        tempArray[0] = 100;
    }
    
    // Struct operations
    function structOperations() public {
        // Create struct - Method 1
        User memory newUser1 = User("Alice", 25, msg.sender, true);
        
        // Method 2 - Named parameters
        User memory newUser2 = User({
            name: "Bob",
            age: 30,
            wallet: msg.sender,
            isActive: true
        });
        
        // Method 3 - Initialize empty and set fields
        User memory newUser3;
        newUser3.name = "Charlie";
        newUser3.age = 35;
        newUser3.wallet = msg.sender;
        newUser3.isActive = false;
        
        // Add to storage
        users.push(newUser1);
        
        // Update storage struct
        users[0].age = 26;
    }
    
    // Mapping operations
    function mappingOperations() public {
        // Set value
        balances[msg.sender] = 100;
        
        // Get value (returns 0 if not set)
        uint256 balance = balances[msg.sender];
        
        // Delete (sets to default value)
        delete balances[msg.sender];
        
        // Check existence (compare with default)
        bool hasBalance = balances[msg.sender] != 0;
    }
}
\`\`\`

## Functions

### Function Types en Visibility

\`\`\`solidity
contract Functions {
    uint256 private data;
    
    // Function visibility:
    // - public: callable from anywhere
    // - private: only within this contract
    // - internal: this contract and derived contracts
    // - external: only from outside the contract
    
    // State mutability:
    // - (default): can read and modify state
    // - view: can only read state
    // - pure: cannot read or modify state
    // - payable: can receive ETH
    
    // Public function (generates getter automatically for public state vars)
    function publicFunction() public returns (uint256) {
        data = 42;
        return data;
    }
    
    // Private function
    function _privateFunction() private view returns (uint256) {
        return data * 2;
    }
    
    // Internal function
    function _internalFunction() internal view returns (uint256) {
        return data + 10;
    }
    
    // External function (gas efficient for external calls)
    function externalFunction(uint256 _value) external {
        data = _value;
    }
    
    // View function (reads state)
    function getDataView() public view returns (uint256) {
        return data;
    }
    
    // Pure function (no state access)
    function calculate(uint256 a, uint256 b) public pure returns (uint256) {
        return a * b + 10;
    }
    
    // Payable function (can receive ETH)
    function deposit() public payable {
        require(msg.value > 0, "Must send ETH");
        // ETH is automatically added to contract balance
    }
    
    // Function with multiple returns
    function multipleReturns() public pure returns (uint256, bool, string memory) {
        return (42, true, "Hello");
    }
    
    // Named returns
    function namedReturns() public pure returns (
        uint256 number,
        bool flag,
        string memory text
    ) {
        number = 42;
        flag = true;
        text = "Hello";
        // No explicit return needed
    }
    
    // Function overloading
    function getValue() public view returns (uint256) {
        return data;
    }
    
    function getValue(uint256 multiplier) public view returns (uint256) {
        return data * multiplier;
    }
}
\`\`\`

### Modifiers

\`\`\`solidity
contract Modifiers {
    address public owner;
    bool public paused;
    uint256 public count;
    
    mapping(address => bool) public whitelist;
    
    constructor() {
        owner = msg.sender;
    }
    
    // Basic modifier
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _; // Function body is inserted here
    }
    
    // Modifier with parameters
    modifier costs(uint256 amount) {
        require(msg.value >= amount, "Insufficient payment");
        _;
    }
    
    // Multiple statement modifier
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    // Modifier with code after function
    modifier noReentrancy() {
        require(count == 0, "No reentrancy");
        count = 1;
        _;
        count = 0;
    }
    
    // Combining modifiers
    function criticalFunction() 
        public 
        onlyOwner 
        whenNotPaused 
        noReentrancy 
    {
        // Function logic
    }
    
    // Modifier using modifier
    modifier onlyWhitelisted() {
        require(whitelist[msg.sender] || msg.sender == owner, "Not whitelisted");
        _;
    }
    
    // Function using multiple modifiers
    function buy() 
        public 
        payable 
        costs(1 ether) 
        whenNotPaused 
        onlyWhitelisted 
    {
        // Purchase logic
    }
}
\`\`\`

## Events en Logging

\`\`\`solidity
contract Events {
    // Event declarations
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event DebugLog(string message, uint256 value);
    
    // Indexed parameters (up to 3) can be filtered
    event ComplexEvent(
        address indexed user,
        uint256 indexed tokenId,
        uint256 indexed timestamp,
        string data,
        bytes extraData
    );
    
    mapping(address => uint256) public balances;
    
    function transfer(address to, uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount;
        balances[to] += amount;
        
        // Emit event
        emit Transfer(msg.sender, to, amount);
    }
    
    function debugFunction(uint256 input) public {
        // Events can be used for debugging
        emit DebugLog("Input received", input);
        
        uint256 result = input * 2;
        emit DebugLog("Calculation done", result);
        
        // Complex event with multiple data types
        emit ComplexEvent(
            msg.sender,
            input,
            block.timestamp,
            "Processing complete",
            abi.encodePacked(result)
        );
    }
    
    // Anonymous events (cheaper but can't filter by event signature)
    event AnonymousEvent(uint256 data) anonymous;
    
    function triggerAnonymous() public {
        emit AnonymousEvent(42);
    }
}

// Frontend event listening example (JavaScript)
/*
contract.on("Transfer", (from, to, value, event) => {
    console.log(\`Transfer: \${from} -> \${to}: \${value}\`);
});

// Filter events
const filter = contract.filters.Transfer(myAddress, null);
const events = await contract.queryFilter(filter);
*/
\`\`\`

## Control Structures

\`\`\`solidity
contract ControlStructures {
    uint256[] public numbers;
    mapping(address => bool) public hasVoted;
    
    // If-else statements
    function checkValue(uint256 value) public pure returns (string memory) {
        if (value < 10) {
            return "Small";
        } else if (value < 100) {
            return "Medium";
        } else {
            return "Large";
        }
    }
    
    // Ternary operator
    function getMax(uint256 a, uint256 b) public pure returns (uint256) {
        return a > b ? a : b;
    }
    
    // For loops
    function sumArray() public view returns (uint256) {
        uint256 sum = 0;
        
        for (uint256 i = 0; i < numbers.length; i++) {
            sum += numbers[i];
        }
        
        return sum;
    }
    
    // While loops
    function factorial(uint256 n) public pure returns (uint256) {
        uint256 result = 1;
        uint256 i = 2;
        
        while (i <= n) {
            result *= i;
            i++;
        }
        
        return result;
    }
    
    // Do-while loops
    function countDown(uint256 start) public pure returns (uint256) {
        uint256 count = 0;
        
        do {
            count++;
            start--;
        } while (start > 0);
        
        return count;
    }
    
    // Break and continue
    function findFirst(uint256 target) public view returns (int256) {
        for (uint256 i = 0; i < numbers.length; i++) {
            if (numbers[i] == target) {
                return int256(i); // Found at index i
            }
            
            if (numbers[i] > target * 2) {
                break; // Stop searching
            }
        }
        
        return -1; // Not found
    }
    
    // Try-catch (for external calls)
    interface IExternalContract {
        function riskyFunction() external returns (bool);
    }
    
    function safeCall(address target) public returns (bool success) {
        IExternalContract external = IExternalContract(target);
        
        try external.riskyFunction() returns (bool result) {
            // Success
            return result;
        } catch Error(string memory reason) {
            // Revert with reason string
            emit ErrorLog(reason);
            return false;
        } catch (bytes memory lowLevelData) {
            // Low level error
            emit LowLevelError(lowLevelData);
            return false;
        }
    }
    
    event ErrorLog(string reason);
    event LowLevelError(bytes data);
}
\`\`\`

## Error Handling

\`\`\`solidity
contract ErrorHandling {
    uint256 public value;
    address public owner;
    
    // Custom errors (gas efficient)
    error NotOwner(address caller, address owner);
    error InsufficientBalance(uint256 requested, uint256 available);
    error InvalidInput(string reason);
    
    constructor() {
        owner = msg.sender;
    }
    
    // Require statements
    function requireExample(uint256 input) public {
        require(input > 0, "Input must be positive");
        require(input <= 100, "Input too large");
        require(msg.sender == owner, "Not authorized");
        
        value = input;
    }
    
    // Revert statements
    function revertExample(uint256 input) public {
        if (input == 0) {
            revert("Cannot be zero");
        }
        
        if (input > 1000) {
            revert InvalidInput("Value exceeds maximum");
        }
        
        value = input;
    }
    
    // Assert statements (for invariants)
    function assertExample(uint256 a, uint256 b) public pure returns (uint256) {
        uint256 result = a + b;
        
        // This should never happen with uint256
        assert(result >= a && result >= b);
        
        return result;
    }
    
    // Custom error usage
    function customErrorExample() public view {
        if (msg.sender != owner) {
            revert NotOwner(msg.sender, owner);
        }
    }
    
    // Try-catch for error handling
    function handleErrors(address target) public {
        (bool success, bytes memory data) = target.call("");
        
        if (!success) {
            // Decode revert reason
            if (data.length > 0) {
                assembly {
                    let returndata_size := mload(data)
                    revert(add(32, data), returndata_size)
                }
            } else {
                revert("Low level call failed");
            }
        }
    }
}
\`\`\`

## Inheritance en Interfaces

\`\`\`solidity
// Interface definition
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

// Abstract contract
abstract contract Ownable {
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    // Abstract function (must be implemented)
    function _authorizeUpgrade() internal virtual;
}

// Base contract
contract ERC20 is IERC20 {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;
    
    string public name;
    string public symbol;
    uint8 public decimals;
    
    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
        decimals = 18;
    }
    
    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }
    
    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }
    
    function transfer(address to, uint256 amount) public override returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }
    
    function _transfer(address from, address to, uint256 amount) internal virtual {
        require(from != address(0), "Transfer from zero address");
        require(to != address(0), "Transfer to zero address");
        require(_balances[from] >= amount, "Insufficient balance");
        
        _balances[from] -= amount;
        _balances[to] += amount;
    }
    
    // Other functions...
}

// Multiple inheritance
contract MyToken is ERC20, Ownable {
    uint256 public maxSupply;
    
    constructor(uint256 _maxSupply) ERC20("MyToken", "MTK") {
        maxSupply = _maxSupply;
    }
    
    // Override parent function
    function _authorizeUpgrade() internal override onlyOwner {
        // Authorization logic
    }
    
    // New functionality
    function mint(address to, uint256 amount) public onlyOwner {
        require(_totalSupply + amount <= maxSupply, "Exceeds max supply");
        _balances[to] += amount;
        _totalSupply += amount;
    }
    
    // Override with super
    function _transfer(address from, address to, uint256 amount) internal override {
        require(!paused, "Transfers paused");
        super._transfer(from, to, amount);
    }
    
    bool public paused;
}
\`\`\`

## Libraries

\`\`\`solidity
// Library definition
library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");
        return c;
    }
    
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "SafeMath: subtraction overflow");
        return a - b;
    }
    
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) return 0;
        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");
        return c;
    }
    
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b > 0, "SafeMath: division by zero");
        return a / b;
    }
}

// Using library
contract Calculator {
    using SafeMath for uint256;
    
    function calculate(uint256 a, uint256 b) public pure returns (uint256) {
        uint256 sum = a.add(b);
        uint256 product = sum.mul(2);
        uint256 result = product.div(4);
        
        return result;
    }
}

// Library for custom types
library AddressUtils {
    function isContract(address account) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }
    
    function sendValue(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "Insufficient balance");
        
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Transfer failed");
    }
}

contract PaymentContract {
    using AddressUtils for address;
    using AddressUtils for address payable;
    
    function pay(address payable recipient) public payable {
        require(!recipient.isContract(), "Cannot pay contracts");
        recipient.sendValue(msg.value);
    }
}
\`\`\`

## Memory vs Storage vs Calldata

\`\`\`solidity
contract DataLocation {
    struct User {
        string name;
        uint256 age;
    }
    
    User[] public users;
    
    // Storage: persistent state variables
    // Memory: temporary variables
    // Calldata: read-only function parameters
    
    // Storage reference
    function updateUser(uint256 index, string memory newName) public {
        User storage user = users[index]; // Reference to storage
        user.name = newName; // Modifies storage directly
    }
    
    // Memory copy
    function getUser(uint256 index) public view returns (User memory) {
        return users[index]; // Returns memory copy
    }
    
    // Calldata for external functions (gas efficient)
    function processData(string calldata data) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(data));
    }
    
    // Memory vs storage costs
    function compareGasCosts() public {
        // Storage write (expensive ~20,000 gas)
        users.push(User("Alice", 25));
        
        // Memory operations (cheap)
        User memory tempUser = User("Bob", 30);
        tempUser.age = 31; // Only in memory
        
        // Storage pointer (cheap read, expensive write)
        User storage userRef = users[0];
        userRef.age = 26; // Storage write
    }
    
    // Function parameter rules
    function parameterRules(
        uint256 value, // Value type: always copied
        string memory text, // Reference type: must specify location
        uint256[] calldata array // External function: can use calldata
    ) public pure {
        // value can be modified (it's a copy)
        value = 100;
        
        // text can be modified (it's in memory)
        bytes(text)[0] = "H";
        
        // array cannot be modified (it's calldata)
        // array[0] = 5; // Error!
    }
}
\`\`\`

## Praktisch Voorbeeld: Simple Bank

\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleBank {
    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowances;
    
    address public owner;
    uint256 public totalDeposits;
    bool public paused;
    
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 amount);
    
    error InsufficientBalance(uint256 requested, uint256 available);
    error TransferToZeroAddress();
    error ContractPaused();
    
    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function deposit() public payable whenNotPaused {
        require(msg.value > 0, "Deposit amount must be positive");
        
        balances[msg.sender] += msg.value;
        totalDeposits += msg.value;
        
        emit Deposit(msg.sender, msg.value);
    }
    
    function withdraw(uint256 amount) public whenNotPaused {
        if (amount > balances[msg.sender]) {
            revert InsufficientBalance(amount, balances[msg.sender]);
        }
        
        balances[msg.sender] -= amount;
        totalDeposits -= amount;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdrawal(msg.sender, amount);
    }
    
    function transfer(address to, uint256 amount) public whenNotPaused {
        if (to == address(0)) revert TransferToZeroAddress();
        if (amount > balances[msg.sender]) {
            revert InsufficientBalance(amount, balances[msg.sender]);
        }
        
        balances[msg.sender] -= amount;
        balances[to] += amount;
        
        emit Transfer(msg.sender, to, amount);
    }
    
    function approve(address spender, uint256 amount) public returns (bool) {
        allowances[msg.sender][spender] = amount;
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) public whenNotPaused {
        require(allowances[from][msg.sender] >= amount, "Allowance exceeded");
        require(balances[from] >= amount, "Insufficient balance");
        
        allowances[from][msg.sender] -= amount;
        balances[from] -= amount;
        balances[to] += amount;
        
        emit Transfer(from, to, amount);
    }
    
    function getBalance(address account) public view returns (uint256) {
        return balances[account];
    }
    
    function pause() public onlyOwner {
        paused = true;
    }
    
    function unpause() public onlyOwner {
        paused = false;
    }
    
    receive() external payable {
        deposit();
    }
}
\`\`\`
`,
  assignments: [
    {
      id: 'assignment-2-2-1',
      title: 'Bouw een ERC20 Token',
      description: 'Implementeer een volledig functionele ERC20 token',
      difficulty: 'hard',
      type: 'project',
      tasks: [
        'Implementeer alle ERC20 functies',
        'Voeg mint en burn functionaliteit toe',
        'Implementeer een max supply limiet',
        'Voeg pausable functionaliteit toe'
      ],
      hints: [
        'Gebruik OpenZeppelin als referentie',
        'Test alle edge cases',
        'Implementeer proper access control'
      ]
    },
    {
      id: 'assignment-2-2-2',
      title: 'Creëer een Voting Contract',
      description: 'Bouw een on-chain stemming systeem',
      difficulty: 'hard',
      type: 'project',
      tasks: [
        'Implementeer proposal creation',
        'Voeg time-based voting periods toe',
        'Implementeer vote delegation',
        'Creëer een execute functie voor approved proposals'
      ]
    }
  ],
  quiz: [
    {
      question: 'Wat is het verschil tussen memory en storage in Solidity?',
      options: [
        'Memory is permanent, storage is tijdelijk',
        'Storage is permanent, memory is tijdelijk',
        'Er is geen verschil',
        'Memory is voor strings, storage voor numbers'
      ],
      correctAnswer: 1,
      explanation: 'Storage bevat persistent state die op de blockchain wordt opgeslagen, terwijl memory tijdelijke data bevat tijdens functie executie.'
    },
    {
      question: 'Wanneer gebruik je een view function?',
      options: [
        'Als de functie state wijzigt',
        'Als de functie alleen state leest',
        'Als de functie ETH ontvangt',
        'Als de functie external is'
      ],
      correctAnswer: 1,
      explanation: 'View functions kunnen state lezen maar niet wijzigen, en kosten geen gas wanneer extern aangeroepen.'
    },
    {
      question: 'Wat doet de payable modifier?',
      options: [
        'Zorgt dat de functie gas betaalt',
        'Laat de functie ETH ontvangen',
        'Maakt de functie gratis om aan te roepen',
        'Verhoogt de gas limiet'
      ],
      correctAnswer: 1,
      explanation: 'De payable modifier laat een functie ETH ontvangen samen met de functie call.'
    }
  ],
  resources: [
    {
      title: 'Solidity Documentation',
      url: 'https://docs.soliditylang.org/',
      type: 'documentation',
      description: 'Officiële Solidity documentatie'
    },
    {
      title: 'Solidity by Example',
      url: 'https://solidity-by-example.org/',
      type: 'tutorial',
      description: 'Leer Solidity met praktische voorbeelden'
    },
    {
      title: 'OpenZeppelin Contracts',
      url: 'https://github.com/OpenZeppelin/openzeppelin-contracts',
      type: 'library',
      description: 'Battle-tested smart contract library'
    }
  ],
  projectIdeas: [
    'Bouw een multi-sig wallet contract',
    'Creëer een decentralized lottery',
    'Implementeer een time-locked vault',
    'Ontwikkel een NFT minting contract'
  ]
};