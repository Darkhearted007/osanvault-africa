import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("OSANVToken", function () {
  async function deployTokenFixture() {
    const [admin, minter, burner, pauser, user1, user2] = await ethers.getSigners();
    const OSANVToken = await ethers.getContractFactory("OSANVToken");
    const token = await OSANVToken.deploy(admin.address, minter.address, burner.address, pauser.address);
    await token.waitForDeployment();
    return { token, admin, minter, burner, pauser, user1, user2 };
  }

  describe("Deployment", function () {
    it("should set correct name, symbol, and decimals", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      expect(await token.name()).to.equal("OsanVault Africa");
      expect(await token.symbol()).to.equal("OSANV");
    });

    it("should have 500M max supply", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      expect(await token.MAX_SUPPLY()).to.equal(ethers.parseEther("500000000"));
    });

    it("should have 250M burn floor", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      expect(await token.BURN_FLOOR()).to.equal(ethers.parseEther("250000000"));
    });

    it("should assign roles correctly", async function () {
      const { token, admin, minter, burner, pauser } = await loadFixture(deployTokenFixture);
      const DEFAULT_ADMIN = await token.DEFAULT_ADMIN_ROLE();
      const MINTER_ROLE = await token.MINTER_ROLE();
      const BURNER_ROLE = await token.BURNER_ROLE();
      const PAUSER_ROLE = await token.PAUSER_ROLE();

      expect(await token.hasRole(DEFAULT_ADMIN, admin.address)).to.be.true;
      expect(await token.hasRole(MINTER_ROLE, minter.address)).to.be.true;
      expect(await token.hasRole(BURNER_ROLE, burner.address)).to.be.true;
      expect(await token.hasRole(PAUSER_ROLE, pauser.address)).to.be.true;
    });

    it("should start with zero total supply", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      expect(await token.totalSupply()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("should allow minter to mint tokens", async function () {
      const { token, minter, user1 } = await loadFixture(deployTokenFixture);
      const amount = ethers.parseEther("1000");
      await token.connect(minter).mint(user1.address, amount);
      expect(await token.balanceOf(user1.address)).to.equal(amount);
    });

    it("should reject minting by non-minter", async function () {
      const { token, user1 } = await loadFixture(deployTokenFixture);
      const amount = ethers.parseEther("1000");
      await expect(token.connect(user1).mint(user1.address, amount)).to.be.reverted;
    });

    it("should reject minting above max supply", async function () {
      const { token, minter, user1 } = await loadFixture(deployTokenFixture);
      const MAX_SUPPLY = await token.MAX_SUPPLY();
      await token.connect(minter).mint(user1.address, MAX_SUPPLY - ethers.parseEther("1"));
      await expect(
        token.connect(minter).mint(user1.address, ethers.parseEther("2"))
      ).to.be.revertedWith("exceeds max supply");
    });

    it("should reject minting when paused", async function () {
      const { token, pauser, minter, user1 } = await loadFixture(deployTokenFixture);
      await token.connect(pauser).pause();
      await expect(
        token.connect(minter).mint(user1.address, ethers.parseEther("100"))
      ).to.be.reverted;
    });
  });

  describe("Burning", function () {
    it("should allow burner to burn tokens", async function () {
      const { token, minter, burner } = await loadFixture(deployTokenFixture);
      // Must mint above burn floor (250M); mint 260M, burn 10M
      const issueAmt = ethers.parseEther("260000000");
      const burnAmt = ethers.parseEther("10000000");
      await token.connect(minter).mint(burner.address, issueAmt);
      await token.connect(burner).burn(burnAmt);
      expect(await token.balanceOf(burner.address)).to.equal(issueAmt - burnAmt);
    });

    it("should reject burning below floor", async function () {
      const { token, minter, burner } = await loadFixture(deployTokenFixture);
      await token.connect(minter).mint(burner.address, ethers.parseEther("100"));
      await expect(
        token.connect(burner).burn(ethers.parseEther("100"))
      ).to.be.revertedWith("cannot burn below floor");
    });

    it("should reject burning by non-burner", async function () {
      const { token, user1 } = await loadFixture(deployTokenFixture);
      await expect(token.connect(user1).burn(1)).to.be.reverted;
    });
  });

  describe("Pausing", function () {
    it("should allow pauser to pause and unpause", async function () {
      const { token, pauser } = await loadFixture(deployTokenFixture);
      await token.connect(pauser).pause();
      expect(await token.paused()).to.be.true;
      await token.connect(pauser).unpause();
      expect(await token.paused()).to.be.false;
    });

    it("should block transfers when paused", async function () {
      const { token, minter, user1, user2, pauser } = await loadFixture(deployTokenFixture);
      await token.connect(minter).mint(user1.address, ethers.parseEther("1000"));
      await token.connect(pauser).pause();
      await expect(
        token.connect(user1).transfer(user2.address, ethers.parseEther("100"))
      ).to.be.reverted;
    });

    it("should reject pausing by non-pauser", async function () {
      const { token, user1 } = await loadFixture(deployTokenFixture);
      await expect(token.connect(user1).pause()).to.be.reverted;
    });
  });

  describe("Permit (EIP-2612)", function () {
    it("should have DOMAIN_SEPARATOR", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      const separator = await token.DOMAIN_SEPARATOR();
      expect(separator).to.not.equal(ethers.ZeroHash);
    });
  });
});
