use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use std::str::FromStr;

mod constants {
    pub const LENDING_POOL_SEED: &[u8] = b"lend-pool";
    pub const COLLATERAL_VAULT_SEED: &[u8] = b"collateral-vault";
    pub const PYTH_ORACLE: &str = "FsJ9A4H3KCcqUPS3axAz9uXN945Z4yXzZ44h6S234G8S";
}

fn get_pool_pda() -> (Pubkey, u8) {
    Pubkey::find_program_address(&[b"lend-pool"], &crate::ID)
}

    pub fn deposit_collateral(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        require!(!pool.paused, LendError::PoolPaused);
        require!(amount > 0, LendError::InvalidAmount);

        let user_position = &mut ctx.accounts.user_position;
        user_position.user = ctx.accounts.user.key();
        user_position.collateral_amount = user_position
            .collateral_amount
            .checked_add(amount)
            .ok_or(LendError::OverflowError)?;

        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi = CpiContext::new(ctx.accounts.token_program.to_account_info().key(), cpi_accounts);
        token::transfer(cpi, amount)?;

        msg!("Deposited {} as collateral for {}", amount, ctx.accounts.user.key());
        Ok(())
    }

    pub fn borrow(ctx: Context<Borrow>, amount: u64) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        require!(!pool.paused, LendError::PoolPaused);
        require!(amount > 0, LendError::InvalidAmount);

        // Get current price from oracle
        let price = ctx.accounts.price_feed.get_value()?;
        let collateral_amount = ctx.accounts.user_position.collateral_amount;

        let collateral_value = (collateral_amount as u128)
            .checked_mul(price as u128)
            .ok_or(LendError::OverflowError)?
            / (10_u128.pow(8)); // Price is 8 decimal

        let max_loan = (collateral_value as u64)
            .checked_mul(pool.max_ltv_bps as u64)
            .ok_or(LendError::OverflowError)?
            / 10000;

        require!(amount <= max_loan, LendError::InsufficientCollateral);

        let fee = (amount as u64)
            .checked_mul(pool.fee_bps as u64)
            .ok_or(LendError::OverflowError)?
            / 10000;

        let user_position = &mut ctx.accounts.user_position;
        user_position.borrowed_amount = user_position
            .borrowed_amount
            .checked_add(amount)
            .ok_or(LendError::OverflowError)?;
        user_position.borrow_fee = user_position
            .borrow_fee
            .checked_add(fee)
            .ok_or(LendError::OverflowError)?;

        let (pool_pda, bump) = get_pool_pda();
        let seeds = &[b"lend-pool".as_ref(), &[bump]];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.user_token.to_account_info(),
            authority: ctx.accounts.pool.to_account_info(),
        };
        let cpi = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info().key(),
            cpi_accounts,
            signer,
        );
        token::transfer(cpi, amount)?;

        msg!("Borrowed {} (fee: {})", amount, fee);
        Ok(())
    }

    pub fn repay(ctx: Context<Repay>, amount: u64) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        require!(amount > 0, LendError::InvalidAmount);

        let user_position = &mut ctx.accounts.user_position;

        require!(
            amount <= user_position.borrowed_amount,
            LendError::InvalidAmount
        );

        user_position.borrowed_amount = user_position
            .borrowed_amount
            .checked_sub(amount)
            .ok_or(LendError::UnderflowError)?;

        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi = CpiContext::new(ctx.accounts.token_program.to_account_info().key(), cpi_accounts);
        token::transfer(cpi, amount)?;

        msg!("Repaid {}", amount);
        Ok(())
    }

    // LIQUIDATION ENGINE
    pub fn liquidate(ctx: Context<Liquidate>) -> Result<()> {
        let pool = &ctx.accounts.pool;
        let position = &mut ctx.accounts.user_position;

        // Get oracle price
        let price = ctx.accounts.price_feed.get_value()?;

        let collateral_value = (position.collateral_amount as u128)
            .checked_mul(price as u128)
            .ok_or(LendError::OverflowError)?
            / (10_u128.pow(8));

        let debt_value = (position.borrowed_amount as u128)
            .checked_mul(price as u128)
            .ok_or(LendError::OverflowError)?
            / (10_u128.pow(8));

        // Calculate health ratio
        let health_bps = if debt_value > 0 {
            ((collateral_value as u64) * 10000)
                .checked_div(debt_value as u64)
                .unwrap_or(0)
        } else {
            10000
        };

        // Check if liquidation required (below threshold)
        require!(
            health_bps < pool.liquidation_threshold_bps as u64,
            LendError::PositionHealthy
        );

        // Calculate liquidation amount (50% of debt)
        let liquidate_amount = (position.borrowed_amount as u64)
            .checked_mul(5000)
            .ok_or(LendError::OverflowError)?
            / 10000;

        // Transfer collateral to liquidator
        let collateral_to_liquidator = (liquidate_amount as u64)
            .checked_mul(11000) // 10% bonus
            .ok_or(LendError::OverflowError)?
            .checked_div(10000)
            .unwrap_or(liquidate_amount);

        require!(
            collateral_to_liquidator <= position.collateral_amount,
            LendError::InsufficientCollateral
        );

        position.collateral_amount = position
            .collateral_amount
            .checked_sub(collateral_to_liquidator)
            .ok_or(LendError::UnderflowError)?;

        position.borrowed_amount = position
            .borrowed_amount
            .checked_sub(liquidate_amount)
            .ok_or(LendError::UnderflowError)?;

        // Transfer collateral to liquidator
        let (pool_pda, bump) = get_pool_pda();
        let seeds = &[b"lend-pool".as_ref(), &[bump]];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.collateral_vault.to_account_info(),
            to: ctx.accounts.liquidator_token.to_account_info(),
            authority: ctx.accounts.pool.to_account_info(),
        };
        let cpi = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info().key(),
            cpi_accounts,
            signer,
        );
        token::transfer(cpi, collateral_to_liquidator)?;

        msg!(
            "Liquidated! Liquidator received {}",
            collateral_to_liquidator
        );
        Ok(())
    }

    pub fn set_liquidation_threshold(ctx: Context<UpdatePool>, threshold_bps: u16) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        require!(
            pool.owner == ctx.accounts.owner.key(),
            LendError::Unauthorized
        );

        require!(threshold_bps <= 5000, LendError::InvalidParameter);

        pool.liquidation_threshold_bps = threshold_bps;
        msg!("Liquidation threshold updated to {} bps", threshold_bps);
        Ok(())
    }

    pub fn pause_pool(ctx: Context<UpdatePool>) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        require!(
            pool.owner == ctx.accounts.owner.key(),
            LendError::Unauthorized
        );

        pool.paused = true;
        msg!("Pool paused");
        Ok(())
    }

    pub fn unpause_pool(ctx: Context<UpdatePool>) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        require!(
            pool.owner == ctx.accounts.owner.key(),
            LendError::Unauthorized
        );

        pool.paused = false;
        msg!("Pool unpaused");
        Ok(())
    }
}

// ORACLE INTEGRATION - Pyth Network
pub fn get_pyth_price(price_feed: &Account<PythPrice>) -> Result<u64> {
    let price = price_feed.agg.price;
    let conf = price_feed.agg.conf;

    require!(price > 0, LendError::OracleError);
    require!(conf < (price / 10) as u64, LendError::OracleError); // Max 10% confidence

    Ok(price as u64)
}

#[derive(Accounts)]
pub struct InitPool<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + 32 + 32 + 32 + 2 + 2 + 2 + 1 + 32,
        seeds = [b"lend-pool"],
        bump
    )]
    pub pool: Account<'info, LendingPool>,

    #[account(
        init,
        payer = owner,
        seeds = [b"collateral-vault", pool.key().as_ref()],
        bump,
        token::mint = collateral_mint,
        token::authority = pool
    )]
    pub collateral_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub collateral_mint: Account<'info, Mint>,
    pub debt_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub pool: Account<'info, LendingPool>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 32 + 8 + 8 + 8,
        seeds = [b"position", user.key().as_ref()],
        bump
    )]
    pub user_position: Account<'info, UserPosition>,

    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Borrow<'info> {
    #[account(mut)]
    pub pool: Account<'info, LendingPool>,

    #[account(mut)]
    pub user_position: Account<'info, UserPosition>,

    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = vault.key() == pool.debt_token @ LendError::InvalidVault
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        constraint = price_feed.to_account_info().owner == &Pubkey::from_str("FsJ9A4H3KCcqUPS3axAz9uXN945Z4yXzZ44h6S234G8S").unwrap() @ LendError::OracleError
    )]
    pub price_feed: Account<'info, PythPrice>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Repay<'info> {
    #[account(mut)]
    pub pool: Account<'info, LendingPool>,

    #[account(mut)]
    pub user_position: Account<'info, UserPosition>,

    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Liquidate<'info> {
    #[account(mut)]
    pub pool: Account<'info, LendingPool>,

    #[account(mut)]
    pub user_position: Account<'info, UserPosition>,

    #[account(mut)]
    pub liquidator: Signer<'info>,
    #[account(mut)]
    pub liquidator_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub collateral_vault: Account<'info, TokenAccount>,
    pub price_feed: Account<'info, PythPrice>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdatePool<'info> {
    #[account(mut)]
    pub pool: Account<'info, LendingPool>,

    #[account(mut)]
    pub owner: Signer<'info>,
}

#[account]
pub struct LendingPool {
    pub owner: Pubkey,
    pub collateral_token: Pubkey,
    pub debt_token: Pubkey,
    pub fee_bps: u16,
    pub liquidation_threshold_bps: u16,
    pub max_ltv_bps: u16,
    pub paused: bool,
    pub reserved: [u8; 32],
}

#[account]
pub struct UserPosition {
    pub user: Pubkey,
    pub collateral_amount: u64,
    pub borrowed_amount: u64,
    pub borrow_fee: u64,
}

// Pyth Price Feed Account (simplified)
#[account]
pub struct PythPrice {
    pub magic: u32,
    pub version: u32,
    pub agg: PythAggregate,
    pub _reserved: [u8; 100],
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct PythAggregate {
    pub price: i64,
    pub conf: u64,
    pub _reserved: [u8; 48],
}

impl PythPrice {
    pub fn get_value(&self) -> Result<u64> {
        let price = self.agg.price;
        require!(price > 0, LendError::OracleError);
        Ok(price as u64)
    }
}

#[error_code]
pub enum LendError {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Pool is paused")]
    PoolPaused,
    #[msg("Already initialized")]
    AlreadyInitialized,
    #[msg("Insufficient collateral")]
    InsufficientCollateral,
    #[msg("Overflow error")]
    OverflowError,
    #[msg("Underflow error")]
    UnderflowError,
    #[msg("Invalid parameter")]
    InvalidParameter,
    #[msg("Position is healthy")]
    PositionHealthy,
    #[msg("Oracle error")]
    OracleError,
    #[msg("Invalid vault")]
    InvalidVault,
}
