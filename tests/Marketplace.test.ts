import { expect } from "chai";
import { ethers } from "hardhat";
import { deployUUPS } from "./helpers/deploy";
import { Signer } from "ethers";

describe("Marketplace", function () {
  let marketplace: any;
  let usdc: any;
  let osanCarbon: any;
  let complianceManager: any;
  let admin: Signer, seller: Signer, buyer: Signer, treasury: Signer;

  const DECIMALS = 6n;
  const FEE_BPS = 250;
  const PRICE_PER_UNIT = ethers.parseUnits("100", DECIMALS);

  beforeEach(async function () {
    [admin, seller, buyer, treasury] = await ethers.getSigners();

    usdc = await ethers.deployContract("MockUSDC", ["MockUSDC", "USDC", DECIMALS]);
    await usdc.waitForDeployment();

    complianceManager = await deployUUPS("ComplianceManager", admin, admin.address);
    marketplace = await deployUUPS(
      "Marketplace", admin,
      admin.address, treasury.address, await complianceManager.getAddress(), FEE_BPS
    );

    osanCarbon = await ethers.deployContract(
      "OsanCarbon",
      [admin.address, admin.address, "https://test.uri/"]
    );
    await osanCarbon.waitForDeployment();

    await osanCarbon.connect(admin).createProject("Test Carbon", "VM0003", "Nigeria", 2024, "uri://project1");
    await osanCarbon.connect(admin).verifyProject(1);
    await osanCarbon.connect(admin).issueCredits(1, 1000, seller.address);

    await osanCarbon.connect(seller).setApprovalForAll(await marketplace.getAddress(), true);

    await usdc.mint(buyer.address, ethers.parseUnits("10000", DECIMALS));
    await usdc.connect(buyer).approve(await marketplace.getAddress(), ethers.parseUnits("10000", DECIMALS));
  });

  describe("initialization", function () {
    it("should set treasury vault", async function () {
      expect(await marketplace.treasuryVault()).to.equal(treasury.address);
    });

    it("should set compliance manager", async function () {
      expect(await marketplace.complianceManager()).to.equal(await complianceManager.getAddress());
    });

    it("should set marketplace fee", async function () {
      expect(await marketplace.marketplaceFee()).to.equal(FEE_BPS);
    });
  });

  describe("createListing", function () {
    it("should create a listing", async function () {
      const tx = await marketplace.connect(seller).createListing(
        await osanCarbon.getAddress(), 1, 100, await usdc.getAddress(), PRICE_PER_UNIT
      );
      await tx.wait();

      const listing = await marketplace.getListing(1);
      expect(listing.listingId).to.equal(1n);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.tokenAddress).to.equal(await osanCarbon.getAddress());
      expect(listing.tokenId).to.equal(1n);
      expect(listing.amount).to.equal(100n);
      expect(listing.currency).to.equal(await usdc.getAddress());
      expect(listing.pricePerUnit).to.equal(PRICE_PER_UNIT);
      expect(listing.totalPrice).to.equal(100n * PRICE_PER_UNIT);
      expect(listing.active).to.be.true;
    });

    it("should emit ListingCreated event", async function () {
      await expect(
        marketplace.connect(seller).createListing(
          await osanCarbon.getAddress(), 1, 100, await usdc.getAddress(), PRICE_PER_UNIT
        )
      ).to.emit(marketplace, "ListingCreated")
        .withArgs(1, seller.address, await osanCarbon.getAddress(), 1, 100, PRICE_PER_UNIT);
    });

    it("should revert with insufficient balance", async function () {
      await expect(
        marketplace.connect(buyer).createListing(
          await osanCarbon.getAddress(), 1, 999999, await usdc.getAddress(), PRICE_PER_UNIT
        )
      ).to.be.revertedWith("insufficient balance");
    });

    it("should revert with zero amount", async function () {
      await expect(
        marketplace.connect(seller).createListing(
          await osanCarbon.getAddress(), 1, 0, await usdc.getAddress(), PRICE_PER_UNIT
        )
      ).to.be.revertedWith("amount zero");
    });

    it("should revert with zero price", async function () {
      await expect(
        marketplace.connect(seller).createListing(
          await osanCarbon.getAddress(), 1, 100, await usdc.getAddress(), 0
        )
      ).to.be.revertedWith("price zero");
    });

    it("should revert with invalid token address", async function () {
      await expect(
        marketplace.connect(seller).createListing(
          ethers.ZeroAddress, 1, 100, await usdc.getAddress(), PRICE_PER_UNIT
        )
      ).to.be.revertedWith("invalid token");
    });

    it("should revert with invalid currency address", async function () {
      await expect(
        marketplace.connect(seller).createListing(
          await osanCarbon.getAddress(), 1, 100, ethers.ZeroAddress, PRICE_PER_UNIT
        )
      ).to.be.revertedWith("invalid currency");
    });
  });

  describe("cancelListing", function () {
    beforeEach(async function () {
      await (await marketplace.connect(seller).createListing(
        await osanCarbon.getAddress(), 1, 100, await usdc.getAddress(), PRICE_PER_UNIT
      )).wait();
    });

    it("should cancel a listing by seller", async function () {
      await (await marketplace.connect(seller).cancelListing(1)).wait();
      const listing = await marketplace.getListing(1);
      expect(listing.active).to.be.false;
    });

    it("should emit ListingCancelled event", async function () {
      await expect(
        marketplace.connect(seller).cancelListing(1)
      ).to.emit(marketplace, "ListingCancelled").withArgs(1);
    });

    it("should revert cancelling another seller's listing", async function () {
      await expect(
        marketplace.connect(buyer).cancelListing(1)
      ).to.be.revertedWith("not authorized");
    });

    it("should allow MARKET_ADMIN_ROLE to cancel any listing", async function () {
      const MARKET_ADMIN_ROLE = await marketplace.MARKET_ADMIN_ROLE();
      await marketplace.connect(admin).grantRole(MARKET_ADMIN_ROLE, buyer.address);
      await (await marketplace.connect(buyer).cancelListing(1)).wait();
      const listing = await marketplace.getListing(1);
      expect(listing.active).to.be.false;
    });
  });

  describe("buyListing", function () {
    let listingAmount = 10n;

    beforeEach(async function () {
      await (await marketplace.connect(seller).createListing(
        await osanCarbon.getAddress(), 1, 100, await usdc.getAddress(), PRICE_PER_UNIT
      )).wait();
    });

    it("should buy tokens from a listing", async function () {
      const totalPrice = listingAmount * PRICE_PER_UNIT;
      const fee = (totalPrice * BigInt(FEE_BPS)) / 10000n;
      const sellerProceeds = totalPrice - fee;

      const sellerUsdcBefore = await usdc.balanceOf(seller.address);
      const treasuryUsdcBefore = await usdc.balanceOf(treasury.address);
      const buyerCarbonBefore = await osanCarbon.balanceOf(buyer.address, 1);
      const sellerCarbonBefore = await osanCarbon.balanceOf(seller.address, 1);

      await (await marketplace.connect(buyer).buyListing(1, listingAmount)).wait();

      expect(await usdc.balanceOf(seller.address)).to.equal(sellerUsdcBefore + sellerProceeds);
      expect(await usdc.balanceOf(treasury.address)).to.equal(treasuryUsdcBefore + fee);
      expect(await osanCarbon.balanceOf(buyer.address, 1)).to.equal(buyerCarbonBefore + listingAmount);
      expect(await osanCarbon.balanceOf(seller.address, 1)).to.equal(sellerCarbonBefore - listingAmount);
    });

    it("should emit ListingSold event", async function () {
      const totalPrice = listingAmount * PRICE_PER_UNIT;
      await expect(
        marketplace.connect(buyer).buyListing(1, listingAmount)
      ).to.emit(marketplace, "ListingSold").withArgs(1, buyer.address, listingAmount, totalPrice);
    });

    it("should partially fill and keep listing active", async function () {
      await (await marketplace.connect(buyer).buyListing(1, listingAmount)).wait();
      const listing = await marketplace.getListing(1);
      expect(listing.amount).to.equal(90n);
      expect(listing.active).to.be.true;
    });

    it("should deactivate listing when fully sold", async function () {
      await (await marketplace.connect(buyer).buyListing(1, 100)).wait();
      const listing = await marketplace.getListing(1);
      expect(listing.amount).to.equal(0n);
      expect(listing.active).to.be.false;
    });

    it("should revert buying inactive listing", async function () {
      await (await marketplace.connect(seller).cancelListing(1)).wait();
      await expect(
        marketplace.connect(buyer).buyListing(1, listingAmount)
      ).to.be.revertedWith("not active");
    });

    it("should revert buying zero amount", async function () {
      await expect(
        marketplace.connect(buyer).buyListing(1, 0)
      ).to.be.revertedWith("invalid amount");
    });

    it("should revert buying more than listed amount", async function () {
      await expect(
        marketplace.connect(buyer).buyListing(1, 101)
      ).to.be.revertedWith("invalid amount");
    });
  });

  describe("admin functions", function () {
    it("should update marketplace fee", async function () {
      await (await marketplace.connect(admin).updateMarketplaceFee(500)).wait();
      expect(await marketplace.marketplaceFee()).to.equal(500n);
    });

    it("should revert fee above 1000 bps", async function () {
      await expect(
        marketplace.connect(admin).updateMarketplaceFee(1001)
      ).to.be.revertedWith("fee too high");
    });

    it("should update treasury vault", async function () {
      await (await marketplace.connect(admin).setTreasuryVault(buyer.address)).wait();
      expect(await marketplace.treasuryVault()).to.equal(buyer.address);
    });

    it("should update compliance manager", async function () {
      await (await marketplace.connect(admin).setComplianceManager(buyer.address)).wait();
      expect(await marketplace.complianceManager()).to.equal(buyer.address);
    });
  });

  describe("pause / unpause", function () {
    it("should pause and prevent listing", async function () {
      await (await marketplace.connect(admin).pause()).wait();
      await expect(
        marketplace.connect(seller).createListing(
          await osanCarbon.getAddress(), 1, 100, await usdc.getAddress(), PRICE_PER_UNIT
        )
      ).to.be.revertedWithCustomError(marketplace, "EnforcedPause");
    });
  });
});
