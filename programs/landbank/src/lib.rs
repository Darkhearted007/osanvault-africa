use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("FRsKDe4vdmRczcXSvub2oAgCgs4uo4LttxvXrwfg1NkT");

#[program]
pub mod landbank {
    use super::*;

    pub fn create_land_pool(
        ctx: Context<CreatePool>,
        name: String,
        min_contribution: u64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        require!(!name.is_empty(), LandError::InvalidName);
        require!(
            min_contribution >= 10_000_000,
            LandError::MinContributionTooLow
        ); // Min $10

        pool.name = name;
        pool.owner = ctx.accounts.owner.key();
        pool.treasury = ctx.accounts.treasury.key();
        pool.total_acres = 0;
        pool.acquired_acres = 0;
        pool.min_contribution = min_contribution;
        pool.total_contributors = 0;
        pool.target_price_per_acre = 0;
        pool.status = 1; // Active
        pool.annual_appreciation_bps = 800; // 8%

        msg!("LandBank pool {} created", name);
        Ok(())
    }

    pub fn add_land(ctx: Context<AddLand>, acres: u64, price_per_acre: u64) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        require!(
            pool.owner == ctx.accounts.owner.key(),
            LandError::Unauthorized
        );
        require!(acres > 0, LandError::InvalidAcres);
        require!(price_per_acre > 0, LandError::InvalidPrice);

        pool.total_acres = pool
            .total_acres
            .checked_add(acres)
            .ok_or(LandError::OverflowError)?;

        let land = &mut ctx.accounts.land;
        land.acres = acres;
        land.price_per_acre = price_per_acre;
        land.total_value = acres
            .checked_mul(price_per_acre)
            .ok_or(LandError::OverflowError)?;
        land.status = 1; // Acquired

        msg!("Added {} acres at {} per acre", acres, price_per_acre);
        Ok(())
    }

    pub fn contribute(ctx: Context<Contribute>, amount: u64) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        require!(pool.status == 1, LandError::PoolNotActive);
        require!(amount >= pool.min_contribution, LandError::BelowMinimum);
        require!(pool.target_price_per_acre > 0, LandError::InvalidPrice);

        // Calculate ownership percentage
        let total_value = pool.total_acres * pool.target_price_per_acre;
        let ownership = (amount as u128 * 10000 / total_value as u128) as u64;

        let user_position = &mut ctx.accounts.user_position;
        user_position.contribution = user_position
            .contribution
            .checked_add(amount)
            .ok_or(LandError::OverflowError)?;
        user_position.ownership_bps = user_position
            .ownership_bps
            .checked_add(ownership)
            .ok_or(LandError::OverflowError)?;

        let cpi_accounts = Transfer {
            from: ctx.accounts.contributor_token.to_account_info(),
            to: ctx.accounts.treasury_token.to_account_info(),
            authority: ctx.accounts.contributor.to_account_info(),
        };
        let cpi = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        token::transfer(cpi, amount)?;

        // Increment contributor count if new
        if user_position.contribution == amount {
            pool.total_contributors = pool
                .total_contributors
                .checked_add(1)
                .ok_or(LandError::OverflowError)?;
        }

        let acres_acquired = amount
            .checked_div(pool.target_price_per_acre)
            .ok_or(LandError::OverflowError)?;
        pool.acquired_acres = pool
            .acquired_acres
            .checked_add(acres_acquired)
            .ok_or(LandError::OverflowError)?;

        msg!("Contribution of {} - ownership: {} bps", amount, ownership);
        Ok(())
    }

    pub fn claim_land(ctx: Context<ClaimLand>, acres: u64) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        require!(pool.status == 1, LandError::PoolNotActive);
        require!(pool.total_acres > 0, LandError::InvalidAcres);

        let user_position = &mut ctx.accounts.user_position;

        let required_ownership_bps = acres
            .checked_mul(10_000)
            .ok_or(LandError::OverflowError)?
            .checked_div(pool.total_acres)
            .ok_or(LandError::InvalidAcres)?;

        require!(
            user_position.ownership_bps >= required_ownership_bps,
            LandError::InsufficientOwnership
        );

        user_position.claimed_acres = user_position
            .claimed_acres
            .checked_add(acres)
            .ok_or(LandError::OverflowError)?;

        msg!("Claimed {} acres", acres);
        Ok(())
    }

    pub fn sell_land(ctx: Context<SellLand>, acres: u64, buyer: Pubkey) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        require!(
            pool.owner == ctx.accounts.owner.key(),
            LandError::Unauthorized
        );
        require!(acres <= pool.acquired_acres, LandError::InsufficientLand);

        pool.acquired_acres = pool
            .acquired_acres
            .checked_sub(acres)
            .ok_or(LandError::UnderflowError)?;

        let sale = &mut ctx.accounts.sale;
        sale.pool = pool.key();
        sale.seller = ctx.accounts.seller.key();
        sale.buyer = buyer;
        sale.acres = acres;
        sale.price = acres
            .checked_mul(pool.target_price_per_acre)
            .ok_or(LandError::OverflowError)?;
        sale.status = 1; // Pending

        msg!("Listed {} acres for sale at {}", acres, sale.price);
        Ok(())
    }

    pub fn update_appreciation(ctx: Context<UpdatePool>, new_appreciation_bps: u16) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        require!(
            pool.owner == ctx.accounts.owner.key(),
            LandError::Unauthorized
        );
        require!(new_appreciation_bps <= 2000, LandError::AppreciationTooHigh); // Max 20%

        pool.annual_appreciation_bps = new_appreciation_bps;
        msg!(
            "Annual appreciation updated to {} bps",
            new_appreciation_bps
        );
        Ok(())
    }

    pub fn set_target_price(ctx: Context<UpdatePool>, price_per_acre: u64) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        require!(
            pool.owner == ctx.accounts.owner.key(),
            LandError::Unauthorized
        );

        pool.target_price_per_acre = price_per_acre;
        msg!("Target price set to {} per acre", price_per_acre);
        Ok(())
    }

    pub fn close_pool(ctx: Context<UpdatePool>) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        require!(
            pool.owner == ctx.accounts.owner.key(),
            LandError::Unauthorized
        );

        pool.status = 2; // Closed
        msg!("LandBank pool {} closed", pool.name);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreatePool<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + 64 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 1 + 2 + 32,
        seeds = [b"land-pool", name.as_bytes()],
        bump
    )]
    pub pool: Account<'info, LandPool>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub treasury: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(acres: u64)]
pub struct AddLand<'info> {
    #[account(mut)]
    pub pool: Account<'info, LandPool>,

    #[account(
        init,
        payer = owner,
        space = 8 + 8 + 8 + 8 + 1,
        seeds = [b"land", pool.key().as_ref(), &pool.total_acres.to_le_bytes()],
        bump
    )]
    pub land: Account<'info, Land>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Contribute<'info> {
    #[account(mut)]
    pub pool: Account<'info, LandPool>,

    #[account(
        init_if_needed,
        payer = contributor,
        space = 8 + 32 + 8 + 8 + 8,
        seeds = [b"position", contributor.key().as_ref()],
        bump
    )]
    pub user_position: Account<'info, UserPosition>,

    #[account(mut)]
    pub contributor: Signer<'info>,
    #[account(mut)]
    pub contributor_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub treasury_token: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimLand<'info> {
    #[account(mut)]
    pub pool: Account<'info, LandPool>,

    #[account(mut)]
    pub user_position: Account<'info, UserPosition>,

    pub claimant: Signer<'info>,
}

#[derive(Accounts)]
pub struct SellLand<'info> {
    #[account(mut)]
    pub pool: Account<'info, LandPool>,

    #[account(
        init,
        payer = seller,
        space = 8 + 32 + 32 + 32 + 8 + 8 + 1,
        seeds = [b"sale", pool.key().as_ref(), seller.key().as_ref()],
        bump
    )]
    pub sale: Account<'info, LandSale>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub seller: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdatePool<'info> {
    #[account(mut)]
    pub pool: Account<'info, LandPool>,

    #[account(mut)]
    pub owner: Signer<'info>,
}

#[account]
pub struct LandPool {
    pub name: String,
    pub owner: Pubkey,
    pub treasury: Pubkey,
    pub total_acres: u64,
    pub acquired_acres: u64,
    pub min_contribution: u64,
    pub total_contributors: u64,
    pub target_price_per_acre: u64,
    pub status: u8,
    pub annual_appreciation_bps: u16,
    pub reserved: [u8; 32],
}

#[account]
pub struct Land {
    pub acres: u64,
    pub price_per_acre: u64,
    pub total_value: u64,
    pub status: u8,
}

#[account]
pub struct UserPosition {
    pub user: Pubkey,
    pub contribution: u64,
    pub ownership_bps: u64,
    pub claimed_acres: u64,
}

#[account]
pub struct LandSale {
    pub pool: Pubkey,
    pub seller: Pubkey,
    pub buyer: Pubkey,
    pub acres: u64,
    pub price: u64,
    pub status: u8,
}

#[error_code]
pub enum LandError {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid name")]
    InvalidName,
    #[msg("Minimum contribution too low")]
    MinContributionTooLow,
    #[msg("Invalid acres")]
    InvalidAcres,
    #[msg("Invalid price")]
    InvalidPrice,
    #[msg("Pool not active")]
    PoolNotActive,
    #[msg("Below minimum contribution")]
    BelowMinimum,
    #[msg("Insufficient ownership")]
    InsufficientOwnership,
    #[msg("Insufficient land")]
    InsufficientLand,
    #[msg("Appreciation too high")]
    AppreciationTooHigh,
    #[msg("Overflow error")]
    OverflowError,
    #[msg("Underflow error")]
    UnderflowError,
}
