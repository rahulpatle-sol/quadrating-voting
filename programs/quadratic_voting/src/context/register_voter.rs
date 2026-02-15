use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct RegisterVoter<'info> {
    #[account(
        init,
        payer = voter,
        space = Voter::SPACE,
        seeds = [b"voter", poll.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub voter_account: Account<'info, Voter>,
    
    #[account(mut)]
    pub poll: Account<'info, Poll>,
    
    #[account(mut)]
    pub voter: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

impl<'info> RegisterVoter<'info> {
    pub fn register_voter(
        &mut self,
        credits: u64,
        bumps: &RegisterVoterBumps,
    ) -> Result<()> {
        require!(self.poll.is_active, RegisterError::PollNotActive);
        require!(credits > 0, RegisterError::InvalidCredits);

        self.voter_account.set_inner(Voter {
            poll: self.poll.key(),
            voter: self.voter.key(),
            credits_remaining: credits,
            total_credits: credits,
            votes_cast: vec![0; self.poll.option_count as usize],
            bump: bumps.voter_account,
        });

        Ok(())
    }
}

#[error_code]
pub enum RegisterError {
    #[msg("Poll is not active")]
    PollNotActive,
    #[msg("Credits must be greater than 0")]
    InvalidCredits,
}