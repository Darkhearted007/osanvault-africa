use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod osanvault_core {
    use super::*;

    /// Initialize the global platform state and set the super admin
    /// SECURITY: Can only be called once - prevents re-initialization
    pub fn initialize_platform(ctx: Context<InitializePlatform>) -> Result<()> {
        let platform = &mut ctx.accounts.platform;
        
        // SECURITY: Prevent re-initialization
        require!(
            platform.super_admin == Pubkey::default(),
            OsanvaultError::AlreadyInitialized
        );
        
        platform.super_admin = ctx.accounts.admin.key();
        platform.total_properties = 0;
        platform.paused = false;
        platform.pause_authority = ctx.accounts.admin.key();
        
        msg!("ÒsánVault Africa Platform Initialized!");
        Ok(())
    }

    /// Pause the platform in case of emergency
    /// SECURITY: Only pause authority can pause
    pub fn pause_platform(ctx: Context<PausePlatform>) -> Result<()> {
        let platform = &mut ctx.accounts.platform;
        
        require!(
            platform.pause_authority == ctx.accounts.authority.key(),
            OsanvaultError::Unauthorized
        );
        
        platform.paused = true;
        msg!("Platform paused by {}", ctx.accounts.authority.key());
        Ok(())
    }

    /// Unpause the platform after emergency is resolved
    /// SECURITY: Only pause authority can unpause
    pub fn unpause_platform(ctx: Context<PausePlatform>) -> Result<()> {
        let platform = &mut ctx.accounts.platform;
        
        require!(
            platform.pause_authority == ctx.accounts.authority.key(),
            OsanvaultError::Unauthorized
        );
        
        platform.paused = false;
        msg!("Platform unpaused by {}", ctx.accounts.authority.key());
        Ok(())
    }

    /// Transfer platform ownership to a new admin
    /// SECURITY: Only super admin can transfer ownership
    pub fn transfer_ownership(ctx: Context<TransferOwnership>, new_admin: Pubkey) -> Result<()> {
        let platform = &mut ctx.accounts.platform;
        
        require!(
            platform.super_admin == ctx.accounts.admin.key(),
            OsanvaultError::Unauthorized
        );
        
        msg!("Ownership transfer requested to {}", new_admin);
        platform.super_admin = new_admin;
        
        Ok(())
    }

    /// Add a new property to the blockchain (Requires Admin)
    pub fn register_property(
        ctx: Context<RegisterProperty>,
        property_id: String,
        total_value_usd: u64,
        total_tokens: u64,
        apy: u16,
    ) -> Result<()> {
        let platform = &mut ctx.accounts.platform;
        
        // SECURITY: Check platform is not paused
        require!(
            !platform.paused,
            OsanvaultError::PlatformPaused
        );

        // SECURITY: Ensure caller is the super admin
        require!(
            platform.super_admin == ctx.accounts.admin.key(),
            OsanvaultError::Unauthorized
        );

        // SECURITY: Validate inputs
        require!(
            !property_id.is_empty(),
            OsanvaultError::InvalidPropertyId
        );
        require!(
            total_value_usd > 0,
            OsanvaultError::InvalidPropertyValue
        );
        require!(
            total_tokens > 0,
            OsanvaultError::InvalidTokenSupply
        );
        require!(
            apy <= 10000, // Max 100%
            OsanvaultError::ApyTooHigh
        );

        property.id = property_id;
        property.total_value_usd = total_value_usd;
        property.total_tokens = total_tokens;
        property.tokens_sold = 0;
        property.apy = apy;
        property.status = PropertyStatus::Active as u8;
        property.bump = ctx.bumps.property;

        // SECURITY: Use checked_add with proper error handling
        platform.total_properties = platform.total_properties
            .checked_add(1)
            .ok_or(OsanvaultError::OverflowError)?;

        msg!("Property {} registered securely.", property.id);
        Ok(())
    }

    /// Invest in a fractional property using USDC or OSANV
    /// SECURITY: Added amount validation and CEI pattern
    pub fn invest(ctx: Context<Invest>, amount: u64) -> Result<()> {
        let property = &mut ctx.accounts.property;
        
        // SECURITY: Check platform is not paused
        let platform = ctx.accounts.platform.as_ref();
        require!(
            !platform.paused,
            OsanvaultError::PlatformPaused
        );

        // SECURITY: Validate amount > 0
        require!(
            amount > 0,
            OsanvaultError::InvalidAmount
        );

        require!(
            property.status == PropertyStatus::Active as u8,
            OsanvaultError::PropertyNotActive
        );

        // SECURITY: Check not sold out with overflow protection
        let new_tokens_sold = property.tokens_sold
            .checked_add(amount)
            .ok_or(OsanvaultError::OverflowError)?;
            
        require!(
            new_tokens_sold <= property.total_tokens,
            OsanvaultError::SoldOut
        );

        // CEI Pattern: Update state BEFORE external call
        property.tokens_sold = new_tokens_sold;

        // Transfer funds from investor to vault (external call)
        let cpi_accounts = Transfer {
            from: ctx.accounts.investor_token_account.to_account_info(),
            to: ctx.accounts.vault_token_account.to_account_info(),
            authority: ctx.accounts.investor.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        // Register the investment receipt
        let receipt = &mut ctx.accounts.receipt;
        receipt.investor = ctx.accounts.investor.key();
        receipt.property = property.key();
        receipt.amount = amount;

        msg!("Investment of {} successfully processed.", amount);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 8 + 1 + 32, // Added paused + pause_authority
        seeds = [b"platform"],
        bump
    )]
    pub platform: Account<'info, PlatformState>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PausePlatform<'info> {
    #[account(mut)]
    pub platform: Account<'info, PlatformState>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct TransferOwnership<'info> {
    #[account(mut)]
    pub platform: Account<'info, PlatformState>,
    
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(property_id: String)]
pub struct RegisterProperty<'info> {
    #[account(mut)]
    pub platform: Account<'info, PlatformState>,
    
    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 8 + 8 + 8 + 2 + 1 + 1 + 50,
        seeds = [b"property", property_id.as_bytes()],
        bump
    )]
    pub property: Account<'info, PropertyState>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Invest<'info> {
    #[account(mut)]
    pub property: Account<'info, PropertyState>,
    
    #[account(
        mut,
        address = ctx.accounts.platform.key(),
        constraint = ctx.accounts.platform.as_ref().key() == ctx.accounts.platform.key()
    )]
    pub platform: Account<'info, PlatformState>,
    
    #[account(
        init_if_needed,
        payer = investor,
        space = 8 + 32 + 32 + 8,
        seeds = [b"receipt", property.key().as_ref(), investor.key().as_ref()],
        bump
    )]
    pub receipt: Account<'info, InvestmentReceipt>,
    
    #[account(mut)]
    pub investor: Signer<'info>,
    
    #[account(mut)]
    pub investor_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct PlatformState {
    pub super_admin: Pubkey,
    pub total_properties: u64,
    pub paused: bool,
    pub pause_authority: Pubkey,
}

#[account]
pub struct PropertyState {
    pub id: String,
    pub total_value_usd: u64,
    pub total_tokens: u64,
    pub tokens_sold: u64,
    pub apy: u16,
    pub status: u8,
    pub bump: u8,
}

#[account]
pub struct InvestmentReceipt {
    pub investor: Pubkey,
    pub property: Pubkey,
    pub amount: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum PropertyStatus {
    Pending = 0,
    Active = 1,
    Closed = 2,
}

#[error_code]
pub enum OsanvaultError {
    #[msg("You are not authorized to perform this action.")]
    Unauthorized,
    
    #[msg("This property is not active.")]
    PropertyNotActive,
    
    #[msg("This property is completely sold out.")]
    SoldOut,
    
    #[msg("Platform is currently paused.")]
    PlatformPaused,
    
    #[msg("Platform is already initialized.")]
    AlreadyInitialized,
    
    #[msg("Invalid amount - must be greater than 0.")]
    InvalidAmount,
    
    #[msg("Invalid property ID.")]
    InvalidPropertyId,
    
    #[msg("Invalid property value.")]
    InvalidPropertyValue,
    
    #[msg("Invalid token supply.")]
    InvalidTokenSupply,
    
    #[msg("APY too high - maximum is 100%.")]
    ApyTooHigh,
    
    #[msg("Overflow error - arithmetic operation failed.")]
    OverflowError,
}