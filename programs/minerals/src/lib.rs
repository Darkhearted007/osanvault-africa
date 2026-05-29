#![allow(unexpected_cfgs)]
#![allow(clippy::diverging_sub_expression)]

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("Bw6nZmM1hNJuUzRPnBFXQwTq7XxdG3Di1aiqsbTNwkRh");

#[program]
pub mod minerals {
    use super::*;

    pub fn register_mineral_site(
        ctx: Context<RegisterSite>,
        name: String,
        mineral_type: String,
        estimated_reserve: u64,
        location: String,
    ) -> Result<()> {
        let site = &mut ctx.accounts.site;

        require!(!name.is_empty(), MineralError::InvalidName);
        require!(estimated_reserve > 0, MineralError::InvalidReserve);

        site.name = name;
        site.mineral_type = mineral_type;
        site.owner = ctx.accounts.owner.key();
        site.estimated_reserve = estimated_reserve;
        site.extracted_amount = 0;
        site.location = location;
        site.status = 1; // Active
        site.royalty_bps = 500; // 5%
        site.royalty_recipient = ctx.accounts.owner.key();

        msg!("Mineral site {} registered - type: {}", site.name, site.mineral_type);
        Ok(())
    }

    pub fn mint_mineral_tokens(ctx: Context<MintMineral>, amount: u64) -> Result<()> {
        let site = &mut ctx.accounts.site;

        require!(site.status == 1, MineralError::SiteNotActive);
        require!(
            site.owner == ctx.accounts.minter.key(),
            MineralError::Unauthorized
        );

        let new_extracted = site
            .extracted_amount
            .checked_add(amount)
            .ok_or(MineralError::OverflowError)?;

        require!(
            new_extracted <= site.estimated_reserve,
            MineralError::ExceedsReserve
        );

        site.extracted_amount = new_extracted;

        let cpi_accounts = anchor_spl::token::MintTo {
            mint: ctx.accounts.mineral_mint.to_account_info(),
            to: ctx.accounts.recipient_token.to_account_info(),
            authority: ctx.accounts.minter.to_account_info(),
        };
        let cpi = CpiContext::new(ctx.accounts.token_program.to_account_info().key(), cpi_accounts);
        anchor_spl::token::mint_to(cpi, amount)?;

        msg!("Minted {} mineral tokens", amount);
        Ok(())
    }

    pub fn transfer_mineral(ctx: Context<TransferMineral>, amount: u64) -> Result<()> {
        let site = &ctx.accounts.site;

        let royalty = amount
            .checked_mul(site.royalty_bps as u64)
            .ok_or(MineralError::OverflowError)?
            / 10000;

        let transfer_amount = amount
            .checked_sub(royalty)
            .ok_or(MineralError::UnderflowError)?;

        let cpi_accounts = Transfer {
            from: ctx.accounts.from_token.to_account_info(),
            to: ctx.accounts.to_token.to_account_info(),
            authority: ctx.accounts.from.to_account_info(),
        };
        let cpi = CpiContext::new(ctx.accounts.token_program.to_account_info().key(), cpi_accounts);
        token::transfer(cpi, transfer_amount)?;

        if royalty > 0 {
            let royalty_cpi = Transfer {
                from: ctx.accounts.from_token.to_account_info(),
                to: ctx.accounts.royalty_token.to_account_info(),
                authority: ctx.accounts.from.to_account_info(),
            };
            let royalty_ctx =
                CpiContext::new(ctx.accounts.token_program.to_account_info().key(), royalty_cpi);
            token::transfer(royalty_ctx, royalty)?;
        }

        msg!("Transferred {} (royalty: {})", transfer_amount, royalty);
        Ok(())
    }

    pub fn verify_extraction(ctx: Context<VerifyExtraction>, amount: u64) -> Result<()> {
        let site = &mut ctx.accounts.site;

        require!(
            site.owner == ctx.accounts.verifier.key(),
            MineralError::Unauthorized
        );

        site.extracted_amount = site
            .extracted_amount
            .checked_add(amount)
            .ok_or(MineralError::OverflowError)?;

        msg!("Verified extraction of {}", amount);
        Ok(())
    }

    pub fn update_royalty(ctx: Context<UpdateSite>, new_royalty_bps: u16) -> Result<()> {
        let site = &mut ctx.accounts.site;

        require!(
            site.owner == ctx.accounts.owner.key(),
            MineralError::Unauthorized
        );
        require!(new_royalty_bps <= 1000, MineralError::RoyaltyTooHigh); // Max 10%

        site.royalty_bps = new_royalty_bps;
        msg!("Royalty updated to {} bps", new_royalty_bps);
        Ok(())
    }

    pub fn close_site(ctx: Context<UpdateSite>) -> Result<()> {
        let site = &mut ctx.accounts.site;

        require!(
            site.owner == ctx.accounts.owner.key(),
            MineralError::Unauthorized
        );

        site.status = 2; // Closed
        msg!("Site {} closed", site.name);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String, mineral_type: String)]
pub struct RegisterSite<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + 64 + 32 + 32 + 8 + 8 + 64 + 1 + 2 + 32,
        seeds = [b"mineral-site", name.as_bytes()],
        bump
    )]
    pub site: Account<'info, MineralSite>,

    #[account(
        init,
        payer = owner,
        mint::authority = owner,
        mint::decimals = 0,
        seeds = [b"mineral-mint", name.as_bytes()],
        bump
    )]
    pub mineral_mint: Account<'info, Mint>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct MintMineral<'info> {
    #[account(mut)]
    pub site: Account<'info, MineralSite>,

    #[account(mut)]
    pub minter: Signer<'info>,
    #[account(mut)]
    pub mineral_mint: Account<'info, Mint>,
    #[account(mut)]
    pub recipient_token: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct TransferMineral<'info> {
    pub site: Account<'info, MineralSite>,

    #[account(mut)]
    pub from: Signer<'info>,
    #[account(mut)]
    pub from_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub to_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub royalty_token: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct VerifyExtraction<'info> {
    #[account(mut)]
    pub site: Account<'info, MineralSite>,

    pub verifier: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateSite<'info> {
    #[account(mut)]
    pub site: Account<'info, MineralSite>,

    #[account(mut)]
    pub owner: Signer<'info>,
}

#[account]
pub struct MineralSite {
    pub name: String,
    pub mineral_type: String,
    pub owner: Pubkey,
    pub estimated_reserve: u64,
    pub extracted_amount: u64,
    pub location: String,
    pub status: u8,
    pub royalty_bps: u16,
    pub royalty_recipient: Pubkey,
}

#[error_code]
pub enum MineralError {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid name")]
    InvalidName,
    #[msg("Invalid reserve")]
    InvalidReserve,
    #[msg("Site not active")]
    SiteNotActive,
    #[msg("Exceeds reserve")]
    ExceedsReserve,
    #[msg("Royalty too high")]
    RoyaltyTooHigh,
    #[msg("Overflow error")]
    OverflowError,
    #[msg("Underflow error")]
    UnderflowError,
}
