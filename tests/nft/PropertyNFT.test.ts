import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("PropertyNFT", function () {
  async function deployPropertyFixture() {
    const [admin, minter, manager, pauser, user1, user2] = await ethers.getSigners();
    const baseURI = "https://api.osanvault.africa/metadata/property/";

    const PropertyNFT = await ethers.getContractFactory("PropertyNFT");
    const nft = await PropertyNFT.deploy(admin.address, minter.address, manager.address, pauser.address, baseURI);
    await nft.waitForDeployment();

    return { nft, admin, minter, manager, pauser, user1, user2 };
  }

  describe("Deployment", function () {
    it("should set roles correctly", async function () {
      const { nft, admin, minter, manager, pauser } = await loadFixture(deployPropertyFixture);
      const DEFAULT_ADMIN = await nft.DEFAULT_ADMIN_ROLE();
      const MINTER_ROLE = await nft.MINTER_ROLE();
      const MANAGER_ROLE = await nft.MANAGER_ROLE();
      const PAUSER_ROLE = await nft.PAUSER_ROLE();

      expect(await nft.hasRole(DEFAULT_ADMIN, admin.address)).to.be.true;
      expect(await nft.hasRole(MINTER_ROLE, minter.address)).to.be.true;
      expect(await nft.hasRole(MANAGER_ROLE, manager.address)).to.be.true;
      expect(await nft.hasRole(PAUSER_ROLE, pauser.address)).to.be.true;
    });
  });

  describe("Property Creation", function () {
    it("should allow manager to create a property", async function () {
      const { nft, manager } = await loadFixture(deployPropertyFixture);
      const totalShares = ethers.parseEther("1000000");
      await nft.connect(manager).createProperty(
        "Lagos Prime Estate",
        "Lagos, Nigeria",
        "Nigeria",
        totalShares,
        "ipfs://metadata/1"
      );
      expect(await nft.getPropertyCount()).to.equal(1);
    });

    it("should reject creation by non-manager", async function () {
      const { nft, user1 } = await loadFixture(deployPropertyFixture);
      await expect(
        nft.connect(user1).createProperty("Test", "Loc", "NG", ethers.parseEther("1000"), "")
      ).to.be.reverted;
    });

    it("should store property details correctly", async function () {
      const { nft, manager } = await loadFixture(deployPropertyFixture);
      const totalShares = ethers.parseEther("1000000");
      await nft.connect(manager).createProperty(
        "Lagos Prime Estate",
        "Lagos, Nigeria",
        "Nigeria",
        totalShares,
        "ipfs://metadata/1"
      );

      const prop = await nft.getProperty(1);
      expect(prop.name).to.equal("Lagos Prime Estate");
      expect(prop.location).to.equal("Lagos, Nigeria");
      expect(prop.jurisdiction).to.equal("Nigeria");
      expect(prop.totalShares).to.equal(totalShares);
      expect(prop.availableShares).to.equal(totalShares);
      expect(prop.verified).to.be.false;
      expect(prop.active).to.be.true;
    });
  });

  describe("Share Minting", function () {
    it("should allow minter to mint shares", async function () {
      const { nft, manager, minter, user1 } = await loadFixture(deployPropertyFixture);
      await nft.connect(manager).createProperty("Test", "Loc", "NG", ethers.parseEther("1000"), "");
      await nft.connect(minter).mintShares(1, ethers.parseEther("500"), user1.address);
      expect(await nft.balanceOf(user1.address, 1)).to.equal(ethers.parseEther("500"));
    });

    it("should reject minting more than available shares", async function () {
      const { nft, manager, minter, user1 } = await loadFixture(deployPropertyFixture);
      await nft.connect(manager).createProperty("Test", "Loc", "NG", ethers.parseEther("1000"), "");
      await expect(
        nft.connect(minter).mintShares(1, ethers.parseEther("2000"), user1.address)
      ).to.be.revertedWith("insufficient shares");
    });

    it("should reject minting for inactive property", async function () {
      const { nft, manager, minter, user1 } = await loadFixture(deployPropertyFixture);
      await nft.connect(manager).createProperty("Test", "Loc", "NG", ethers.parseEther("1000"), "");
      await nft.connect(manager).setPropertyStatus(1, false);
      await expect(
        nft.connect(minter).mintShares(1, ethers.parseEther("100"), user1.address)
      ).to.be.revertedWith("property inactive");
    });
  });

  describe("Property Verification", function () {
    it("should allow manager to verify property", async function () {
      const { nft, manager } = await loadFixture(deployPropertyFixture);
      await nft.connect(manager).createProperty("Test", "Loc", "NG", ethers.parseEther("1000"), "");
      await nft.connect(manager).verifyProperty(1);
      const prop = await nft.getProperty(1);
      expect(prop.verified).to.be.true;
    });
  });

  describe("Pausing", function () {
    it("should allow pauser to pause transfers", async function () {
      const { nft, pauser, manager, minter, user1, user2 } = await loadFixture(deployPropertyFixture);
      await nft.connect(manager).createProperty("Test", "Loc", "NG", ethers.parseEther("1000"), "");
      await nft.connect(minter).mintShares(1, ethers.parseEther("500"), user1.address);
      await nft.connect(pauser).pause();
      await expect(
        nft.connect(user1).safeTransferFrom(user1.address, user2.address, 1, ethers.parseEther("100"), "0x")
      ).to.be.reverted;
    });
  });
});
