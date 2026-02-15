use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct ClosePoll<'info> {
    #[account(
        mut,
        has_one = authority,
    )]
    pub poll: Account<'info, Poll>,
    
    pub authority: Signer<'info>,
}

impl<'info> ClosePoll<'info> {
    pub fn close_poll(&mut self) -> Result<()> {
        require!(self.poll.is_active, CloseError::PollAlreadyClosed);
        
        self.poll.is_active = false;
        
        msg!("Poll '{}' has been closed", self.poll.title);
        msg!("Final results:");
        for (i, votes) in self.poll.votes.iter().enumerate() {
            msg!("Option {}: {} votes", i, votes);
        }

        Ok(())
    }
}

#[error_code]
pub enum CloseError {
    #[msg("Poll is already closed")]
    PollAlreadyClosed,
}