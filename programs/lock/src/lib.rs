use anchor_lang::{prelude::*, solana_program::system_program};

declare_id!("2chqYBtFgUQkqzS5WK6Ke155xQV4KQTu2noqBiTT8h4F");

#[program]
pub mod lock {
    use anchor_lang::solana_program::system_instruction::transfer;

    use super::*;
    pub fn initialize(
        ctx: Context<Initialize>,
        authority: Pubkey,
        bump: u8,
        lamports: u64
        ) -> ProgramResult {
        let lock_account = &mut ctx.accounts.lock_account;
        lock_account.authority = authority;
        lock_account.owner = *ctx.accounts.owner.key;
        lock_account.locked = true;
        lock_account.bump = bump;
        lock_account.lamports = lamports;
        transfer(&lock_account.owner, &lock_account.to_account_info().key, lock_account.lamports);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction( bump: u8)]
pub struct Initialize<'info> {
    #[account(init,
    payer=owner,
    space=8 + 8 + 32 + 32 + 1 + 1 ,
    seeds=[owner.to_account_info().key.as_ref()],
    bump=bump)
    ]
    pub lock_account: Account<'info, LockAccount>,
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct LockAccount {
    pub lamports: u64,
    pub owner: Pubkey,
    pub authority: Pubkey,
    pub locked: bool,
    pub bump: u8
}
