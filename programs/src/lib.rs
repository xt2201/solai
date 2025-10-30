use anchor_lang::prelude::*;

const USER_SEED: &[u8] = b"user";
const TREASURY_SEED: &[u8] = b"treasury";

// The program ID is set from Anchor.toml
declare_id!("8pMVJamgnZKWmYJQQ8gvPaT7UFVg5BAr3Rg5HY8epYyh");

#[program]
mod solai_program {
    use super::*;

    pub fn initialize_user(ctx: Context<InitializeUser>) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        user_account.authority = ctx.accounts.authority.key();
        user_account.total_queries = 0;
        user_account.total_fees_paid = 0;
        user_account.last_prompt_hash = [0; 32];
        user_account.last_response_hash = [0; 32];
        user_account.bump = ctx.bumps.user_account;
        Ok(())
    }

    pub fn log_interaction(
        ctx: Context<LogInteraction>,
        prompt_hash: [u8; 32],
        response_hash: [u8; 32],
        fee_lamports: u64,
    ) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        require_keys_eq!(
            user_account.authority,
            ctx.accounts.authority.key(),
            SolAIError::UnauthorizedAuthority
        );

        require!(fee_lamports > 0, SolAIError::InvalidFee);

        // Transfer lamports to the treasury PDA for accounting.
        let transfer_accounts = anchor_lang::system_program::Transfer {
            from: ctx.accounts.authority.to_account_info(),
            to: ctx.accounts.treasury.to_account_info(),
        };
        anchor_lang::system_program::transfer(
            CpiContext::new(ctx.accounts.system_program.to_account_info(), transfer_accounts),
            fee_lamports,
        )?;

        user_account.total_queries = user_account
            .total_queries
            .checked_add(1)
            .ok_or(SolAIError::MathOverflow)?;
        user_account.total_fees_paid = user_account
            .total_fees_paid
            .checked_add(fee_lamports)
            .ok_or(SolAIError::MathOverflow)?;
        user_account.last_prompt_hash = prompt_hash;
        user_account.last_response_hash = response_hash;
        user_account.last_log_slot = Clock::get()?.slot;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = UserAccount::LEN,
        seeds = [USER_SEED, authority.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct LogInteraction<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [USER_SEED, authority.key().as_ref()],
        bump = user_account.bump
    )]
    pub user_account: Account<'info, UserAccount>,
    #[account(
        mut,
        seeds = [TREASURY_SEED],
        bump
    )]
    pub treasury: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct UserAccount {
    pub authority: Pubkey,
    pub total_queries: u64,
    pub total_fees_paid: u64,
    pub last_prompt_hash: [u8; 32],
    pub last_response_hash: [u8; 32],
    pub last_log_slot: u64,
    pub bump: u8,
}

impl UserAccount {
    pub const LEN: usize = 8  // discriminator
        + 32  // authority
        + 8   // total_queries
        + 8   // total_fees_paid
        + 32  // last_prompt_hash
        + 32  // last_response_hash
        + 8   // last_log_slot
        + 1;  // bump
}

#[error_code]
pub enum SolAIError {
    #[msg("The provided authority does not match the user account owner.")]
    UnauthorizedAuthority,
    #[msg("Math overflow detected.")]
    MathOverflow,
    #[msg("The provided fee must be greater than zero.")]
    InvalidFee,
}
