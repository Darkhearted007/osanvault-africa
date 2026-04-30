import * as anchor from "@coral-xyz/anchor"
import { Program } from "@coral-xyz/anchor"
import { osanvault_core } from "../target/types/osanvault_core"
import { expect } from "chai"

describe("ÒsánVault Core", () => {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const program = anchor.workspace.osanvault_core as Program<osanvault_core>
  const wallet = provider.wallet

  let platformPda: anchor.web3.PublicKey
  let admin: anchor.web3.Keypair

  before(async () => {
    ;[platformPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("platform")],
      program.programId
    )

    admin = anchor.web3.Keypair.generate()
  })

  describe("initialize_platform", () => {
    it("should initialize platform with admin as super_admin", async () => {
      const tx = await program.methods
        .initializePlatform()
        .accounts({
          platform: platformPda,
          admin: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc()

      const platform = await program.account.platformState.fetch(platformPda)
      expect(platform.superAdmin.toBase58()).to.equal(wallet.publicKey.toBase58())
      expect(platform.paused).to.equal(false)
    })

    it("should reject re-initialization", async () => {
      try {
        await program.methods
          .initializePlatform()
          .accounts({
            platform: platformPda,
            admin: wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc()
        expect.fail("Should have thrown")
      } catch (err) {
        expect(err.toString()).to.include("AlreadyInitialized")
      }
    })
  })

  describe("pause_platform / unpause_platform", () => {
    it("should pause and unpause the platform", async () => {
      const pauseAuth = wallet.publicKey

      await program.methods
        .pausePlatform()
        .accounts({ platform: platformPda, authority: pauseAuth })
        .rpc()

      let platform = await program.account.platformState.fetch(platformPda)
      expect(platform.paused).to.equal(true)

      await program.methods
        .unpausePlatform()
        .accounts({ platform: platformPda, authority: pauseAuth })
        .rpc()

      platform = await program.account.platformState.fetch(platformPda)
      expect(platform.paused).to.equal(false)
    })
  })

  describe("register_property", () => {
    it("should register a new property", async () => {
      const propertyId = "PROP-LAGOS-001"
      const [propertyPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("property"), Buffer.from(propertyId)],
        program.programId
      )

      const tx = await program.methods
        .registerProperty(propertyId, 1_250_000, 125_000, 1450)
        .accounts({
          platform: platformPda,
          property: propertyPda,
          admin: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc()

      const property = await program.account.propertyState.fetch(propertyPda)
      expect(property.id).to.equal(propertyId)
      expect(property.totalValueUsd.toString()).to.equal("1250000")
      expect(property.totalTokens.toString()).to.equal("125000")
      expect(property.tokensSold.toString()).to.equal("0")
    })

    it("should reject empty property_id", async () => {
      try {
        await program.methods
          .registerProperty("", 1_000_000, 100_000, 1200)
          .accounts({
            platform: platformPda,
            property: anchor.web3.Keypair.generate().publicKey,
            admin: wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc()
        expect.fail()
      } catch (err) {
        expect(err.toString()).to.include("InvalidPropertyId")
      }
    })

    it("should reject zero value", async () => {
      try {
        await program.methods
          .registerProperty("PROP-INVALID", 0, 100_000, 1200)
          .accounts({
            platform: platformPda,
            property: anchor.web3.Keypair.generate().publicKey,
            admin: wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc()
        expect.fail()
      } catch (err) {
        expect(err.toString()).to.include("InvalidPropertyValue")
      }
    })
  })
})