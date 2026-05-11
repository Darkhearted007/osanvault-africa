use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("EUJWumAPhQVeTK3CAuBKh9SFf1AvqrmvTty37RKJxmf1");

#[program]
pub mod reits {
    use super::*;

    pub fn create_reit(
        ctx: Context<CreateReit>,
        name: String,
        total_shares: u64,
        nav_per_share: u64,
    ) -> Result<()> {
        let reit = &mut ctx.accounts.reit;

        require!(!name.is_empty(), ReitError::InvalidName);
        require!(total_shares > 0, ReitError::InvalidShares);
        require!(nav_per_share > 0, ReitError::InvalidNav);

        reit.name = name;
        reit.manager = ctx.accounts.manager.key();
        reit.treasury = ctx.accounts.treasury.key();
        reit.total_shares = total_shares;
        reit.shares_issued = 0;
        reit.nav_per_share = nav_per_share;
        reit.total_properties = 0;
        reit.yield_bps = 500; // 5% annual
        reit.paused = false;

        msg!("REIT {} created with {} shares", reit.name, total_shares);
        Ok(())
    }

    pub fn issue_shares(
        ctx: Context<IssueShares>,
        recipient: Pubkey,
        num_shares: u64,
    ) -> Result<()> {
        let reit = &mut ctx.accounts.reit;

        require!(!reit.paused, ReitError::ReitPaused);
        require!(num_shares > 0, ReitError::InvalidShares);

        let new_shares = reit
            .shares_issued
            .checked_add(num_shares)
            .ok_or(ReitError::OverflowError)?;

        require!(new_shares <= reit.total_shares, ReitError::SharesExhausted);

        reit.shares_issued = new_shares;

        let cpi_accounts = anchor_spl::token::MintTo {
            mint: ctx.accounts.reit_mint.to_account_info(),
            to: ctx.accounts.share_token.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        };
        let cpi = CpiContext::new(ctx.accounts.token_program.to_account_info().key(), cpi_accounts);
        anchor_spl::token::mint_to(cpi, num_shares)?;

        msg!("Issued {} shares to {}", num_shares, recipient);
        Ok(())
    }

    pub fn invest(ctx: Context<InvestReit>, amount: u64) -> Result<()> {
        let reit = &mut ctx.accounts.reit;

        require!(!reit.paused, ReitError::ReitPaused);
        require!(amount >= 10_000_000, ReitError::MinInvestment); // Min $10

        let shares_to_issue = (amount as u128)
            .checked_mul(1_000_000_000) // 9 decimals
            .ok_or(ReitError::OverflowError)?
            .checked_div(reit.nav_per_share as u128) as u64;

        let new_shares_issued = reit
            .shares_issued
            .checked_add(shares_to_issue)
            .ok_or(ReitError::OverflowError)?;
        require!(
            new_shares_issued <= reit.total_shares,
            ReitError::SharesExhausted
        );

        let cpi_accounts = Transfer {
            from: ctx.accounts.investor_token.to_account_info(),
            to: ctx.accounts.treasury_token.to_account_info(),
            authority: ctx.accounts.investor.to_account_info(),
        };
        let cpi = CpiContext::new(ctx.accounts.token_program.to_account_info().key(), cpi_accounts);
        token::transfer(cpi, amount)?;

        reit.shares_issued = new_shares_issued;

        msg!("Invested {} for {} shares", amount, shares_to_issue);
        Ok(())
    }

    pub fn distribute_yield(ctx: Context<DistributeYield>, amount: u64) -> Result<()> {
        let reit = &ctx.accounts.reit;

        require!(
            reit.manager == ctx.accounts.manager.key(),
            ReitError::Unauthorized
        );
        require!(amount > 0, ReitError::InvalidAmount);

        let total_yield = amount
            .checked_mul(reit.yield_bps as u64)
            .ok_or(ReitError::OverflowError)?
            / 10000;

        require!(total_yield > 0, ReitError::InvalidAmount);
        require!(
            total_yield <= ctx.accounts.treasury_token.amount,
            ReitError::InvalidAmount
        );

        let cpi_accounts = Transfer {
            from: ctx.accounts.treasury_token.to_account_info(),
            to: ctx.accounts.recipient_token.to_account_info(),
            authority: ctx.accounts.treasury.to_account_info(),
        };
        let cpi = CpiContext::new(ctx.accounts.token_program.to_account_info().key(), cpi_accounts);
        token::transfer(cpi, total_yield)?;

        msg!(
            "Distributed {} yield ({}bps of {})",
            total_yield,
            reit.yield_bps,
            amount
        );
        Ok(())
    }

    pub fn add_property(ctx: Context<AddProperty>, property_value: u64) -> Result<()> {
        let reit = &mut ctx.accounts.reit;

        require!(
            reit.manager == ctx.accounts.manager.key(),
            ReitError::Unauthorized
        );

        reit.total_properties = reit
            .total_properties
            .checked_add(1)
            .ok_or(ReitError::OverflowError)?;

        let property = &mut ctx.accounts.property;
        property.value = property_value;
        property.status = 1; // Active

        msg!("Added property worth {} to REIT", property_value);
        Ok(())
    }

    pub fn update_nav(ctx: Context<UpdateNav>, new_nav: u64) -> Result<()> {
        let reit = &mut ctx.accounts.reit;

        require!(
            reit.manager == ctx.accounts.manager.key(),
            ReitError::Unauthorized
        );

        reit.nav_per_share = new_nav;
        msg!("NAV updated to {}", new_nav);
        Ok(())
    }

    pub fn pause_reit(ctx: Context<UpdateReit>) -> Result<()> {
        let reit = &mut ctx.accounts.reit;
        require!(
            reit.manager == ctx.accounts.manager.key(),
            ReitError::Unauthorized
        );
        reit.paused = true;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateReit<'info> {
    #[account(
        init,
        payer = manager,
        space = 8 + 64 + 32 + 32 + 8 + 8 + 8 + 8 + 2 + 1 + 32,
        seeds = [b"reit", name.as_bytes()],
        bump
    )]
    pub reit: Account<'info, Reit>,

    #[account(
        init,
        payer = manager,
        mint::authority = manager,
        mint::decimals = 9,
        seeds = [b"reit-mint", name.as_bytes()],
        bump
    )]
    pub reit_mint: Account<'info, Mint>,

    #[account(mut)]
    pub manager: Signer<'info>,
    pub treasury: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct IssueShares<'info> {
    #[account(mut)]
    pub reit: Account<'info, Reit>,

    #[account(mut)]
    pub share_token: Account<'info, TokenAccount>,

    #[account(mut)]
    pub reit_mint: Account<'info, Mint>,

    pub mint_authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InvestReit<'info> {
    #[account(mut)]
    pub reit: Account<'info, Reit>,

    #[account(mut)]
    pub investor: Signer<'info>,
    #[account(mut)]
    pub investor_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub treasury_token: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct DistributeYield<'info> {
    #[account(mut)]
    pub reit: Account<'info, Reit>,

    #[account(mut)]
    pub manager: Signer<'info>,
    #[account(mut)]
    pub treasury: Account<'info, TokenAccount>,
    #[account(mut)]
    pub recipient_token: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(property_value: u64)]
pub struct AddProperty<'info> {
    #[account(mut)]
    pub reit: Account<'info, Reit>,

    #[account(
        init,
        payer = manager,
        space = 8 + 8 + 1,
        seeds = [b"property", reit.key().as_ref(), &reit.total_properties.to_le_bytes()],
        bump
    )]
    pub property: Account<'info, Property>,

    #[account(mut)]
    pub manager: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateNav<'info> {
    #[account(mut)]
    pub reit: Account<'info, Reit>,

    #[account(mut)]
    pub manager: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateReit<'info> {
    #[account(mut)]
    pub reit: Account<'info, Reit>,

    #[account(mut)]
    pub manager: Signer<'info>,
}

#[account]
pub struct Reit {
    pub name: String,
    pub manager: Pubkey,
    pub treasury: Pubkey,
    pub total_shares: u64,
    pub shares_issued: u64,
    pub nav_per_share: u64,
    pub total_properties: u64,
    pub yield_bps: u16,
    pub paused: bool,
    pub reserved: [u8; 32],
}

#[account]
pub struct Property {
    pub value: u64,
    pub status: u8,
}

#[error_code]
pub enum ReitError {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid name")]
    InvalidName,
    #[msg("Invalid share count")]
    InvalidShares,
    #[msg("Invalid NAV")]
    InvalidNav,
    #[msg("REIT is paused")]
    ReitPaused,
    #[msg("Shares exhausted")]
    SharesExhausted,
    #[msg("Minimum investment not met")]
    MinInvestment,
    #[msg("Overflow error")]
    OverflowError,
}
