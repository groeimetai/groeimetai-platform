const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("CertificateRegistry", function () {
  let certificateRegistry;
  let owner;
  let minter;
  let student1;
  let student2;
  let unauthorized;
  
  // Role constants
  let MINTER_ROLE;
  let ADMIN_ROLE;
  let DEFAULT_ADMIN_ROLE;
  
  // Test data
  const courseId = "GROEI-001";
  const courseName = "AI Automation Basics";
  const ipfsHash = "QmTest123456789";
  const ipfsHash2 = "QmTest987654321";
  
  beforeEach(async function () {
    // Get signers
    [owner, minter, student1, student2, unauthorized] = await ethers.getSigners();
    
    // Deploy contract
    const CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");
    certificateRegistry = await CertificateRegistry.deploy();
    await certificateRegistry.deployed();
    
    // Get role constants
    MINTER_ROLE = await certificateRegistry.MINTER_ROLE();
    ADMIN_ROLE = await certificateRegistry.ADMIN_ROLE();
    DEFAULT_ADMIN_ROLE = await certificateRegistry.DEFAULT_ADMIN_ROLE();
    
    // Grant minter role to minter account
    await certificateRegistry.grantRole(MINTER_ROLE, minter.address);
  });
  
  describe("Deployment", function () {
    it("Should set the correct roles for deployer", async function () {
      expect(await certificateRegistry.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await certificateRegistry.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
      expect(await certificateRegistry.hasRole(MINTER_ROLE, owner.address)).to.be.true;
    });
    
    it("Should start with zero certificates", async function () {
      expect(await certificateRegistry.totalCertificates()).to.equal(0);
    });
  });
  
  describe("Certificate Minting", function () {
    it("Should mint a certificate successfully", async function () {
      const completionDate = await time.latest();
      
      const tx = await certificateRegistry.connect(minter).mintCertificate(
        student1.address,
        courseId,
        courseName,
        completionDate,
        ipfsHash
      );
      
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "CertificateMinted");
      
      expect(event).to.not.be.undefined;
      expect(event.args.certificateId).to.equal(1);
      expect(event.args.student).to.equal(student1.address);
      expect(event.args.courseId).to.equal(courseId);
      expect(event.args.ipfsHash).to.equal(ipfsHash);
      
      expect(await certificateRegistry.totalCertificates()).to.equal(1);
    });
    
    it("Should prevent non-minters from minting", async function () {
      const completionDate = await time.latest();
      
      await expect(
        certificateRegistry.connect(unauthorized).mintCertificate(
          student1.address,
          courseId,
          courseName,
          completionDate,
          ipfsHash
        )
      ).to.be.revertedWith(`AccessControl: account ${unauthorized.address.toLowerCase()} is missing role ${MINTER_ROLE}`);
    });
    
    it("Should prevent minting with invalid data", async function () {
      const completionDate = await time.latest();
      
      // Invalid student address
      await expect(
        certificateRegistry.connect(minter).mintCertificate(
          ethers.constants.AddressZero,
          courseId,
          courseName,
          completionDate,
          ipfsHash
        )
      ).to.be.revertedWith("Invalid student address");
      
      // Empty course ID
      await expect(
        certificateRegistry.connect(minter).mintCertificate(
          student1.address,
          "",
          courseName,
          completionDate,
          ipfsHash
        )
      ).to.be.revertedWith("Course ID required");
      
      // Empty course name
      await expect(
        certificateRegistry.connect(minter).mintCertificate(
          student1.address,
          courseId,
          "",
          completionDate,
          ipfsHash
        )
      ).to.be.revertedWith("Course name required");
      
      // Empty IPFS hash
      await expect(
        certificateRegistry.connect(minter).mintCertificate(
          student1.address,
          courseId,
          courseName,
          completionDate,
          ""
        )
      ).to.be.revertedWith("IPFS hash required");
      
      // Future completion date
      const futureDate = (await time.latest()) + 86400; // Tomorrow
      await expect(
        certificateRegistry.connect(minter).mintCertificate(
          student1.address,
          courseId,
          courseName,
          futureDate,
          ipfsHash
        )
      ).to.be.revertedWith("Invalid completion date");
    });
    
    it("Should prevent duplicate certificates", async function () {
      const completionDate = await time.latest();
      
      // First mint should succeed
      await certificateRegistry.connect(minter).mintCertificate(
        student1.address,
        courseId,
        courseName,
        completionDate,
        ipfsHash
      );
      
      // Second mint with same IPFS hash should fail
      await expect(
        certificateRegistry.connect(minter).mintCertificate(
          student2.address,
          courseId,
          courseName,
          completionDate,
          ipfsHash
        )
      ).to.be.revertedWith("Certificate already exists");
    });
  });
  
  describe("Certificate Verification", function () {
    let certificateId;
    let completionDate;
    
    beforeEach(async function () {
      completionDate = await time.latest();
      const tx = await certificateRegistry.connect(minter).mintCertificate(
        student1.address,
        courseId,
        courseName,
        completionDate,
        ipfsHash
      );
      const receipt = await tx.wait();
      certificateId = receipt.events[0].args.certificateId;
    });
    
    it("Should verify a valid certificate", async function () {
      const result = await certificateRegistry.verifyCertificate(certificateId);
      
      expect(result.isValid).to.be.true;
      expect(result.student).to.equal(student1.address);
      expect(result.courseId).to.equal(courseId);
      expect(result.courseName).to.equal(courseName);
      expect(result.completionDate).to.equal(completionDate);
      expect(result.ipfsHash).to.equal(ipfsHash);
    });
    
    it("Should fail to verify non-existent certificate", async function () {
      await expect(
        certificateRegistry.verifyCertificate(999)
      ).to.be.revertedWith("Certificate does not exist");
    });
    
    it("Should log verification event", async function () {
      const tx = await certificateRegistry.connect(unauthorized).logVerification(certificateId);
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "CertificateVerified");
      
      expect(event).to.not.be.undefined;
      expect(event.args.certificateId).to.equal(certificateId);
      expect(event.args.verifier).to.equal(unauthorized.address);
      expect(event.args.isValid).to.be.true;
    });
  });
  
  describe("Certificate Retrieval", function () {
    beforeEach(async function () {
      const completionDate = await time.latest();
      
      // Mint multiple certificates
      await certificateRegistry.connect(minter).mintCertificate(
        student1.address,
        courseId,
        courseName,
        completionDate,
        ipfsHash
      );
      
      await certificateRegistry.connect(minter).mintCertificate(
        student1.address,
        "GROEI-002",
        "Advanced AI",
        completionDate,
        ipfsHash2
      );
    });
    
    it("Should get student certificates", async function () {
      const certificates = await certificateRegistry.getStudentCertificates(student1.address);
      expect(certificates.length).to.equal(2);
      expect(certificates[0]).to.equal(1);
      expect(certificates[1]).to.equal(2);
    });
    
    it("Should get certificate details", async function () {
      const cert = await certificateRegistry.getCertificate(1);
      expect(cert.id).to.equal(1);
      expect(cert.student).to.equal(student1.address);
      expect(cert.courseId).to.equal(courseId);
      expect(cert.isValid).to.be.true;
    });
    
    it("Should return empty array for student with no certificates", async function () {
      const certificates = await certificateRegistry.getStudentCertificates(student2.address);
      expect(certificates.length).to.equal(0);
    });
  });
  
  describe("Certificate Revocation", function () {
    let certificateId;
    
    beforeEach(async function () {
      const completionDate = await time.latest();
      const tx = await certificateRegistry.connect(minter).mintCertificate(
        student1.address,
        courseId,
        courseName,
        completionDate,
        ipfsHash
      );
      const receipt = await tx.wait();
      certificateId = receipt.events[0].args.certificateId;
    });
    
    it("Should revoke certificate by admin", async function () {
      const tx = await certificateRegistry.connect(owner).revokeCertificate(certificateId);
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "CertificateRevoked");
      
      expect(event).to.not.be.undefined;
      expect(event.args.certificateId).to.equal(certificateId);
      expect(event.args.revokedBy).to.equal(owner.address);
      
      // Verify certificate is now invalid
      const result = await certificateRegistry.verifyCertificate(certificateId);
      expect(result.isValid).to.be.false;
    });
    
    it("Should prevent non-admins from revoking", async function () {
      await expect(
        certificateRegistry.connect(minter).revokeCertificate(certificateId)
      ).to.be.revertedWith(`AccessControl: account ${minter.address.toLowerCase()} is missing role ${ADMIN_ROLE}`);
    });
    
    it("Should prevent revoking already revoked certificate", async function () {
      await certificateRegistry.connect(owner).revokeCertificate(certificateId);
      
      await expect(
        certificateRegistry.connect(owner).revokeCertificate(certificateId)
      ).to.be.revertedWith("Certificate already revoked");
    });
  });
  
  describe("Pausable Functionality", function () {
    it("Should pause and unpause contract", async function () {
      // Pause
      await certificateRegistry.connect(owner).pause();
      
      // Try to mint while paused
      const completionDate = await time.latest();
      await expect(
        certificateRegistry.connect(minter).mintCertificate(
          student1.address,
          courseId,
          courseName,
          completionDate,
          ipfsHash
        )
      ).to.be.revertedWith("Pausable: paused");
      
      // Unpause
      await certificateRegistry.connect(owner).unpause();
      
      // Should work now
      await expect(
        certificateRegistry.connect(minter).mintCertificate(
          student1.address,
          courseId,
          courseName,
          completionDate,
          ipfsHash
        )
      ).to.not.be.reverted;
    });
    
    it("Should prevent non-admins from pausing", async function () {
      await expect(
        certificateRegistry.connect(minter).pause()
      ).to.be.revertedWith(`AccessControl: account ${minter.address.toLowerCase()} is missing role ${ADMIN_ROLE}`);
    });
  });
  
  describe("Gas Optimization Tests", function () {
    it("Should have reasonable gas costs for minting", async function () {
      const completionDate = await time.latest();
      
      const tx = await certificateRegistry.connect(minter).mintCertificate(
        student1.address,
        courseId,
        courseName,
        completionDate,
        ipfsHash
      );
      
      const receipt = await tx.wait();
      console.log(`Gas used for minting: ${receipt.gasUsed.toString()}`);
      
      // Gas should be reasonable for Polygon
      expect(receipt.gasUsed).to.be.lt(300000);
    });
    
    it("Should have low gas costs for verification", async function () {
      const completionDate = await time.latest();
      await certificateRegistry.connect(minter).mintCertificate(
        student1.address,
        courseId,
        courseName,
        completionDate,
        ipfsHash
      );
      
      // Estimate gas for verification (view function)
      const gasEstimate = await certificateRegistry.estimateGas.verifyCertificate(1);
      console.log(`Gas estimate for verification: ${gasEstimate.toString()}`);
      
      // View functions should be very cheap
      expect(gasEstimate).to.be.lt(50000);
    });
  });
});