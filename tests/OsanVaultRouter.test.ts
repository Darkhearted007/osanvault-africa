import { expect } from "chai";
import { ethers } from "hardhat";
import { deployUUPS } from "./helpers/deploy";
import { Signer } from "ethers";

describe("OsanVaultRouter", function () {
  let router: any;
  let admin: Signer, configurator: Signer, user: Signer;

  const CONTRACT_NAMES = [
    "AssetRegistry", "SPVRegistry", "ComplianceManager",
    "RevenueDistributionEngine", "PayoutManager", "LandRegistry",
    "CarbonRegistry", "CarbonRetirement", "Marketplace",
    "PPPRegistry", "MineralsModule", "RiskEngine",
    "TreasuryVault", "OsanCarbon",
  ];

  beforeEach(async function () {
    [admin, configurator, user] = await ethers.getSigners();
    router = await deployUUPS("OsanVaultRouter", admin, admin.address);

    const CONFIG_ROLE = await router.CONFIG_ROLE();
    await router.connect(admin).grantRole(CONFIG_ROLE, configurator.address);
  });

  describe("initialization", function () {
    it("should grant DEFAULT_ADMIN_ROLE to admin", async function () {
      expect(await router.hasRole(await router.DEFAULT_ADMIN_ROLE(), admin.address)).to.be.true;
    });

    it("should grant CONFIG_ROLE to admin", async function () {
      expect(await router.hasRole(await router.CONFIG_ROLE(), admin.address)).to.be.true;
    });

    it("should grant UPGRADER_ROLE to admin", async function () {
      expect(await router.hasRole(await router.UPGRADER_ROLE(), admin.address)).to.be.true;
    });
  });

  describe("setContract", function () {
    for (const name of CONTRACT_NAMES) {
      it(`should set ${name} contract address`, async function () {
        const tx = await router.connect(configurator).setContract(name, user.address);
        await tx.wait();
        await expect(tx)
          .to.emit(router, "ContractUpdated")
          .withArgs(name, ethers.ZeroAddress, user.address);
      });
    }

    it("should update an existing contract address", async function () {
      await (await router.connect(configurator).setContract("AssetRegistry", user.address)).wait();
      const tx = await router.connect(configurator).setContract("AssetRegistry", admin.address);
      await expect(tx)
        .to.emit(router, "ContractUpdated")
        .withArgs("AssetRegistry", user.address, admin.address);
    });

    it("should revert for unknown contract name", async function () {
      await expect(
        router.connect(configurator).setContract("NonExistent", user.address)
      ).to.be.revertedWith("unknown contract name");
    });

    it("should revert for zero address", async function () {
      await expect(
        router.connect(configurator).setContract("AssetRegistry", ethers.ZeroAddress)
      ).to.be.revertedWith("invalid address");
    });

    it("should revert without CONFIG_ROLE", async function () {
      await expect(
        router.connect(user).setContract("AssetRegistry", user.address)
      ).to.be.revertedWithCustomError(router, "AccessControlUnauthorizedAccount");
    });
  });

  describe("getAsset", function () {
    it("should revert with guidance message", async function () {
      await (await router.connect(configurator).setContract("AssetRegistry", user.address)).wait();
      await expect(
        router.getAsset(1)
      ).to.be.revertedWith("use AssetRegistry.getAsset() directly");
    });
  });

  describe("getPortfolio", function () {
    it("should revert with guidance message", async function () {
      await expect(
        router.getPortfolio(user.address)
      ).to.be.revertedWith("use individual contract calls for portfolio data");
    });
  });

  describe("buyProperty", function () {
    it("should propagate revert from marketplace call", async function () {
      await expect(
        router.connect(user).buyProperty(
          user.address, 1, 1, ethers.ZeroAddress, 0
        )
      ).to.be.revertedWith("buy failed");
    });
  });

  describe("claimYield", function () {
    it("should revert if RDE not set", async function () {
      const revenueId = ethers.solidityPackedKeccak256(
        ["uint8", "uint256", "uint256"], [0, 1, 1000]
      );
      await expect(
        router.connect(user).claimYield(revenueId)
      ).to.be.revertedWith("RDE not set");
    });
  });

  describe("retireCarbonCredits", function () {
    it("should revert if carbonRetirement not set", async function () {
      await expect(
        router.connect(user).retireCarbonCredits(1, 100, "Ben", "Test")
      ).to.be.revertedWith("CR not set");
    });
  });

  describe("pause / unpause", function () {
    it("should pause and prevent buyProperty", async function () {
      await (await router.connect(admin).pause()).wait();
      await expect(
        router.connect(user).buyProperty(user.address, 1, 1, ethers.ZeroAddress, 0)
      ).to.be.revertedWithCustomError(router, "EnforcedPause");
    });

    it("should unpause and allow calls", async function () {
      await (await router.connect(admin).pause()).wait();
      await (await router.connect(admin).unpause()).wait();
      // buyProperty still reverts but for "buy failed" not "EnforcedPause"
      await expect(
        router.connect(user).buyProperty(user.address, 1, 1, ethers.ZeroAddress, 0)
      ).to.be.revertedWith("buy failed");
    });

    it("should revert pause from non-admin", async function () {
      await expect(
        router.connect(user).pause()
      ).to.be.revertedWithCustomError(router, "AccessControlUnauthorizedAccount");
    });
  });
});
