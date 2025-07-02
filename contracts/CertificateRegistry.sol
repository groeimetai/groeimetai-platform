// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CertificateRegistry
 * @dev Smart contract for managing GroeiMetAI course certificates on Polygon
 * @notice Gas-optimized for Polygon deployment with security features
 */
contract CertificateRegistry is AccessControl, Pausable, ReentrancyGuard {
    // State variables
    uint256 private _certificateIdCounter;
    
    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // Certificate structure
    struct Certificate {
        uint256 id;
        address student;
        string courseId;
        string courseName;
        uint256 completionDate;
        string ipfsHash; // IPFS hash for certificate metadata
        bool isValid;
        uint256 mintedAt;
    }
    
    // Mappings
    mapping(uint256 => Certificate) public certificates;
    mapping(address => uint256[]) public studentCertificates;
    mapping(string => bool) public usedHashes; // Prevent duplicate certificates
    
    // Events
    event CertificateMinted(
        uint256 indexed certificateId,
        address indexed student,
        string courseId,
        string ipfsHash,
        uint256 timestamp
    );
    
    event CertificateVerified(
        uint256 indexed certificateId,
        address indexed verifier,
        bool isValid,
        uint256 timestamp
    );
    
    event CertificateRevoked(
        uint256 indexed certificateId,
        address indexed revokedBy,
        uint256 timestamp
    );
    
    /**
     * @dev Constructor sets up roles
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }
    
    /**
     * @dev Mint a new certificate
     * @param _student Address of the certificate recipient
     * @param _courseId Unique identifier for the course
     * @param _courseName Name of the completed course
     * @param _completionDate Unix timestamp of course completion
     * @param _ipfsHash IPFS hash containing certificate metadata
     */
    function mintCertificate(
        address _student,
        string memory _courseId,
        string memory _courseName,
        uint256 _completionDate,
        string memory _ipfsHash
    ) external onlyRole(MINTER_ROLE) whenNotPaused nonReentrant returns (uint256) {
        require(_student != address(0), "Invalid student address");
        require(bytes(_courseId).length > 0, "Course ID required");
        require(bytes(_courseName).length > 0, "Course name required");
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");
        require(_completionDate <= block.timestamp, "Invalid completion date");
        require(!usedHashes[_ipfsHash], "Certificate already exists");
        
        // Increment counter and get new ID
        _certificateIdCounter++;
        uint256 newCertificateId = _certificateIdCounter;
        
        // Create certificate
        Certificate memory newCertificate = Certificate({
            id: newCertificateId,
            student: _student,
            courseId: _courseId,
            courseName: _courseName,
            completionDate: _completionDate,
            ipfsHash: _ipfsHash,
            isValid: true,
            mintedAt: block.timestamp
        });
        
        // Store certificate
        certificates[newCertificateId] = newCertificate;
        studentCertificates[_student].push(newCertificateId);
        usedHashes[_ipfsHash] = true;
        
        // Emit event
        emit CertificateMinted(
            newCertificateId,
            _student,
            _courseId,
            _ipfsHash,
            block.timestamp
        );
        
        return newCertificateId;
    }
    
    /**
     * @dev Verify a certificate by ID
     * @param _certificateId The ID of the certificate to verify
     */
    function verifyCertificate(uint256 _certificateId) external view returns (
        bool isValid,
        address student,
        string memory courseId,
        string memory courseName,
        uint256 completionDate,
        string memory ipfsHash
    ) {
        Certificate memory cert = certificates[_certificateId];
        require(cert.id != 0, "Certificate does not exist");
        
        return (
            cert.isValid,
            cert.student,
            cert.courseId,
            cert.courseName,
            cert.completionDate,
            cert.ipfsHash
        );
    }
    
    /**
     * @dev Emit verification event for tracking
     * @param _certificateId The ID of the certificate being verified
     */
    function logVerification(uint256 _certificateId) external {
        Certificate memory cert = certificates[_certificateId];
        require(cert.id != 0, "Certificate does not exist");
        
        emit CertificateVerified(
            _certificateId,
            msg.sender,
            cert.isValid,
            block.timestamp
        );
    }
    
    /**
     * @dev Get all certificates for a student
     * @param _student Address of the student
     */
    function getStudentCertificates(address _student) external view returns (uint256[] memory) {
        return studentCertificates[_student];
    }
    
    /**
     * @dev Get certificate details by ID
     * @param _certificateId The ID of the certificate
     */
    function getCertificate(uint256 _certificateId) external view returns (Certificate memory) {
        require(certificates[_certificateId].id != 0, "Certificate does not exist");
        return certificates[_certificateId];
    }
    
    /**
     * @dev Revoke a certificate (admin only)
     * @param _certificateId The ID of the certificate to revoke
     */
    function revokeCertificate(uint256 _certificateId) external onlyRole(ADMIN_ROLE) {
        Certificate storage cert = certificates[_certificateId];
        require(cert.id != 0, "Certificate does not exist");
        require(cert.isValid, "Certificate already revoked");
        
        cert.isValid = false;
        
        emit CertificateRevoked(
            _certificateId,
            msg.sender,
            block.timestamp
        );
    }
    
    /**
     * @dev Check if an address has a specific role
     * @param _account Address to check
     * @param _role Role to check for
     */
    function hasRole(address _account, bytes32 _role) public view returns (bool) {
        return hasRole(_role, _account);
    }
    
    /**
     * @dev Get total number of certificates issued
     */
    function totalCertificates() external view returns (uint256) {
        return _certificateIdCounter;
    }
    
    /**
     * @dev Pause contract (emergency only)
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Required override for AccessControl
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}