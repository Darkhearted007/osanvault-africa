"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const anchor = __importStar(require("@coral-xyz/anchor"));
const chai_1 = require("chai");
describe("ÒsánVault Core", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.osanvault_core;
    const wallet = provider.wallet;
    let platformPda;
    let admin;
    before(async () => {
        ;
        [platformPda] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("platform")], program.programId);
        admin = anchor.web3.Keypair.generate();
    });
    describe("initialize_platform", () => {
        it("should initialize platform with admin as super_admin", async () => {
            const tx = await program.methods
                .initializePlatform()
                .accounts({
                platform: platformPda,
                admin: wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
                .rpc();
            const platform = await program.account.platformState.fetch(platformPda);
            (0, chai_1.expect)(platform.superAdmin.toBase58()).to.equal(wallet.publicKey.toBase58());
            (0, chai_1.expect)(platform.paused).to.equal(false);
        });
        it("should reject re-initialization", async () => {
            try {
                await program.methods
                    .initializePlatform()
                    .accounts({
                    platform: platformPda,
                    admin: wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                    .rpc();
                chai_1.expect.fail("Should have thrown");
            }
            catch (err) {
                (0, chai_1.expect)(err.toString()).to.include("AlreadyInitialized");
            }
        });
    });
    describe("pause_platform / unpause_platform", () => {
        it("should pause and unpause the platform", async () => {
            const pauseAuth = wallet.publicKey;
            await program.methods
                .pausePlatform()
                .accounts({ platform: platformPda, authority: pauseAuth })
                .rpc();
            let platform = await program.account.platformState.fetch(platformPda);
            (0, chai_1.expect)(platform.paused).to.equal(true);
            await program.methods
                .unpausePlatform()
                .accounts({ platform: platformPda, authority: pauseAuth })
                .rpc();
            platform = await program.account.platformState.fetch(platformPda);
            (0, chai_1.expect)(platform.paused).to.equal(false);
        });
    });
    describe("register_property", () => {
        it("should register a new property", async () => {
            const propertyId = "PROP-LAGOS-001";
            const [propertyPda] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("property"), Buffer.from(propertyId)], program.programId);
            const tx = await program.methods
                .registerProperty(propertyId, 1250000, 125000, 1450)
                .accounts({
                platform: platformPda,
                property: propertyPda,
                admin: wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
                .rpc();
            const property = await program.account.propertyState.fetch(propertyPda);
            (0, chai_1.expect)(property.id).to.equal(propertyId);
            (0, chai_1.expect)(property.totalValueUsd.toString()).to.equal("1250000");
            (0, chai_1.expect)(property.totalTokens.toString()).to.equal("125000");
            (0, chai_1.expect)(property.tokensSold.toString()).to.equal("0");
        });
        it("should reject empty property_id", async () => {
            try {
                await program.methods
                    .registerProperty("", 1000000, 100000, 1200)
                    .accounts({
                    platform: platformPda,
                    property: anchor.web3.Keypair.generate().publicKey,
                    admin: wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                    .rpc();
                chai_1.expect.fail();
            }
            catch (err) {
                (0, chai_1.expect)(err.toString()).to.include("InvalidPropertyId");
            }
        });
        it("should reject zero value", async () => {
            try {
                await program.methods
                    .registerProperty("PROP-INVALID", 0, 100000, 1200)
                    .accounts({
                    platform: platformPda,
                    property: anchor.web3.Keypair.generate().publicKey,
                    admin: wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                    .rpc();
                chai_1.expect.fail();
            }
            catch (err) {
                (0, chai_1.expect)(err.toString()).to.include("InvalidPropertyValue");
            }
        });
    });
});
