use anchor_lang::{prelude::*, solana_program::system_program};

declare_id!("E41ZWCPjxsHmAv6DhUdfduj8W2bt7VCnq4RiypAL1RYc");

#[program]
pub mod lock {
    use anchor_lang::solana_program::system_instruction::transfer;

    use super::*;
    pub fn initialize(
        ctx: Context<Initialize>,
        bump: u8,
        authority: Pubkey,
        lamports: u64
        ) -> ProgramResult {
        let lock_account = &mut ctx.accounts.lock_account;
        lock_account.authority = authority;
        lock_account.owner = *ctx.accounts.owner.key;
        lock_account.locked = true;
        lock_account.lamports = lamports;
        transfer(&lock_account.owner, &lock_account.to_account_info().key, lock_account.lamports);
        Ok(())
    }
    pub fn unlock(
        ctx: Context<Initialize>
        ) -> ProgramResult {
        let lock_account = &mut ctx.accounts.lock_account;
        lock_account.locked = false;
        Ok(())
    }
    pub fn withdraw(
        ctx: Context<Initialize>
        ) -> ProgramResult {
        let lock_account = &mut ctx.accounts.lock_account;
        transfer(&lock_account.to_account_info().key, &lock_account.owner, lock_account.lamports);
        Ok(())
    }



    
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct Initialize<'info> {
    #[account(init,
    payer=owner,
    space=8 + 8 + 32 + 32 + 1 + 1 ,
    seeds=[owner.key().as_ref()],
    bump=bump)
    ]
    pub lock_account: Account<'info, LockAccount>,
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct Unlock<'info> {
    #[account(has_one = authority)]
    pub lock_account: Account<'info, LockAccount>,
    #[account(signer)]
    pub authority: AccountInfo<'info>

}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(constraint = !lock_account.locked)]
    pub lock_account: Account<'info, LockAccount>,
    #[account(signer)]
    pub owner: AccountInfo<'info>

}

#[account]
pub struct LockAccount {
    pub lamports: u64,
    pub owner: Pubkey,
    pub authority: Pubkey,
    pub locked: bool
}
