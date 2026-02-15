use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(
        mut,
        seeds = [b"voter", poll.key().as_ref(), voter.key().as_ref()],
        bump = voter_account.bump,
    )]
    pub voter_account: Account<'info, Voter>,
    
    #[account(mut)]
    pub poll: Account<'info, Poll>,
    
    pub voter: Signer<'info>,
}

impl<'info> CastVote<'info> {
    pub fn cast_vote(
        &mut self,
        option_index: u8,
        votes: u64,
    ) -> Result<()> {
        require!(self.poll.is_active, VoteError::PollNotActive);
        require!(
            option_index < self.poll.option_count,
            VoteError::InvalidOption
        );
        require!(votes > 0, VoteError::InvalidVoteCount);
        require!(
            self.voter_account.voter == self.voter.key(),
            VoteError::UnauthorizedVoter
        );

        // Calculate current votes for this option
        let current_votes = self.voter_account.votes_cast[option_index as usize];
        
        // Calculate the quadratic cost
        let cost = Voter::calculate_vote_cost(current_votes, votes)?;
        
        // Check if voter has enough credits
        require!(
            self.voter_account.credits_remaining >= cost,
            VoteError::InsufficientCredits
        );

        // Deduct credits
        self.voter_account.credits_remaining = self.voter_account.credits_remaining
            .checked_sub(cost)
            .ok_or(VoteError::Overflow)?;

        // Update voter's votes cast
        self.voter_account.votes_cast[option_index as usize] = current_votes
            .checked_add(votes)
            .ok_or(VoteError::Overflow)?;

        // Update poll's total votes
        self.poll.votes[option_index as usize] = self.poll.votes[option_index as usize]
            .checked_add(votes)
            .ok_or(VoteError::Overflow)?;

        msg!(
            "Voter {} cast {} votes on option {} (cost: {} credits, remaining: {})",
            self.voter.key(),
            votes,
            option_index,
            cost,
            self.voter_account.credits_remaining
        );

        Ok(())
    }
}

#[error_code]
pub enum VoteError {
    #[msg("Poll is not active")]
    PollNotActive,
    #[msg("Invalid option index")]
    InvalidOption,
    #[msg("Vote count must be greater than 0")]
    InvalidVoteCount,
    #[msg("Unauthorized voter")]
    UnauthorizedVoter,
    #[msg("Insufficient credits to cast votes")]
    InsufficientCredits,
    #[msg("Arithmetic overflow")]
    Overflow,
}