use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("Carb7X8qNpFxS1wXaKjKqLvXqHpFZ9YmN8QhBvK5ZxP");

#[program]
pub mod carbon {
    use super::*;

    pub fn register_project(
        ctx: Context<RegisterProject>,
        name: String,
        project_type: String,
        total_carbon_credits: u64,
        location: String,
    ) -> Result<()> {
        let project = &mut ctx.accounts.project;
        
        require!(!name.is_empty(), CarbonError::InvalidName);
        require!(total_carbon_credits > 0, CarbonError::InvalidCredits);
        
        project.name = name;
        project.project_type = project_type;
        project.owner = ctx.accounts.owner.key();
        project.total_credits = total_carbon_credits;
        project.credits_issued = 0;
        project.credits_retired = 0;
        project.location = location;
        project.status = 1; // Active
        project.verifier = ctx.accounts.verifier.key();
        
        msg!("Carbon project {} registered - {} credits", name, total_carbon_credits);
        Ok(())
    }

    pub fn issue_carbon_credits(ctx: Context<IssueCredits>, amount: u64) -> Result<()> {
        let project = &mut ctx.accounts.project;
        
        require!(project.status == 1, CarbonError::ProjectNotActive);
        require!(project.verifier == ctx.accounts.verifier.key(), CarbonError::Unauthorized);
        
        let new_issued = project.credits_issued
            .checked_add(amount)
            .ok_or(CarbonError::OverflowError)?;
            
        require!(new_issued <= project.total_credits, CarbonError::ExceedsTotal);
        
        project.credits_issued = new_issued;
        
        let cpi_accounts = anchor_spl::token::MintTo {
            mint: ctx.accounts.carbon_mint.to_account_info(),
            to: ctx.accounts.recipient_token.to_account_info(),
            authority: ctx.accounts.verifier.to_account_info(),
        };
        let cpi = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        anchor_spl::token::mint_to(cpi, amount)?;
        
        msg!("Issued {} carbon credits", amount);
        Ok(())
    }

    pub fn retire_carbon_credits(ctx: Context<RetireCredits>, amount: u64) -> Result<()> {
        let project = &mut ctx.accounts.project;
        
        require!(amount > 0, CarbonError::InvalidAmount);
        
        // Burn tokens
        let cpi_accounts = anchor_spl::token::Burn {
            mint: ctx.accounts.carbon_mint.to_account_info(),
            from: ctx.accounts.holder_token.to_account_info(),
            authority: ctx.accounts.holder.to_account_info(),
        };
        let cpi = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        anchor_spl::token::burn(cpi, amount)?;
        
        project.credits_retired = project.credits_retired
            .checked_add(amount)
            .ok_or(CarbonError::OverflowError)?;
        
        msg!("Retired {} carbon credits (offset)", amount);
        Ok(())
    }

    pub fn transfer_credits(ctx: Context<TransferCredits>, amount: u64) -> Result<()> {
        require!(amount > 0, CarbonError::InvalidAmount);
        
        let cpi_accounts = Transfer {
            from: ctx.accounts.from_token.to_account_info(),
            to: ctx.accounts.to_token.to_account_info(),
            authority: ctx.accounts.from.to_account_info(),
        };
        let cpi = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        token::transfer(cpi, amount)?;
        
        msg!("Transferred {} carbon credits", amount);
        Ok(())
    }

    pub fn verify_project(ctx: Context<VerifyProject>, new_verifier: Pubkey) -> Result<()> {
        let project = &mut ctx.accounts.project;
        
        require!(project.owner == ctx.accounts.owner.key(), CarbonError::Unauthorized);
        
        project.verifier = new_verifier;
        msg!("Verifier updated to {}", new_verifier);
        Ok(())
    }

    pub fn pause_project(ctx: Context<UpdateProject>) -> Result<()> {
        let project = &mut ctx.accounts.project;
        
        require!(project.owner == ctx.accounts.owner.key(), CarbonError::Unauthorized);
        
        project.status = 0; // Paused
        msg!("Project paused");
        Ok(())
    }

    pub fn update_credits(ctx: Context<UpdateProject>, new_total: u64) -> Result<()> {
        let project = &mut ctx.accounts.project;
        
        require!(project.owner == ctx.accounts.owner.key(), CarbonError::Unauthorized);
        
        require!(new_total >= project.credits_issued, CarbonError::InvalidAmount);
        
        project.total_credits = new_total;
        msg!("Total credits updated to {}", new_total);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String, project_type: String)]
pub struct RegisterProject<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + 64 + 32 + 32 + 8 + 8 + 8 + 64 + 1 + 32 + 32,
        seeds = [b"carbon-project", name.as_bytes()],
        bump
    )]
    pub project: Account<'info, CarbonProject>,
    
    #[account(
        init,
        payer = owner,
        mint::authority = verifier,
        mint::decimals = 0,
        space = 82,
        seeds = [b"carbon-mint", name.as_bytes()],
        bump
    )]
    pub carbon_mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    pub verifier: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct IssueCredits<'info> {
    #[account(mut)]
    pub project: Account<'info, CarbonProject>,
    
    pub verifier: Signer<'info>,
    #[account(mut)]
    pub carbon_mint: Account<'info, Mint>,
    #[account(mut)]
    pub recipient_token: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RetireCredits<'info> {
    #[account(mut)]
    pub project: Account<'info, CarbonProject>,
    
    #[account(mut)]
    pub holder: Signer<'info>,
    #[account(mut)]
    pub holder_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub carbon_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct TransferCredits<'info> {
    #[account(mut)]
    pub from: Signer<'info>,
    #[account(mut)]
    pub from_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub to_token: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(new_verifier: Pubkey)]
pub struct VerifyProject<'info> {
    #[account(mut)]
    pub project: Account<'info, CarbonProject>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateProject<'info> {
    #[account(mut)]
    pub project: Account<'info, CarbonProject>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
}

#[account]
pub struct CarbonProject {
    pub name: String,
    pub project_type: String,
    pub owner: Pubkey,
    pub total_credits: u64,
    pub credits_issued: u64,
    pub credits_retired: u64,
    pub location: String,
    pub status: u8,
    pub verifier: Pubkey,
    pub reserved: [u8; 32],
}

#[error_code]
pub enum CarbonError {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid name")]
    InvalidName,
    #[msg("Invalid credits")]
    InvalidCredits,
    #[msg("Project not active")]
    ProjectNotActive,
    #[msg("Exceeds total credits")]
    ExceedsTotal,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Overflow error")]
    OverflowError,
}