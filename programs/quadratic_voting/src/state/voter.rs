use anchor_lang::prelude::*;

#[account]
pub struct Voter {
    pub poll: Pubkey,           // Poll this voter is registered for
    pub voter: Pubkey,          // Voter's public key
    pub credits_remaining: u64, // Remaining vote credits
    pub total_credits: u64,     // Total credits allocated
    pub votes_cast: Vec<u64>,   // Votes cast for each option
    pub bump: u8,               // PDA bump
}

impl Voter {
    pub const SPACE: usize = 
        8 +  // discriminator
        32 + // poll
        32 + // voter
        8 +  // credits_remaining
        8 +  // total_credits
        4 + (8 * 10) + // votes_cast vector (max 10 options)
        1;   // bump
    
    /// Calculate quadratic cost for voting
    /// Cost = (current_votes + new_votes)² - current_votes²
    pub fn calculate_vote_cost(current_votes: u64, new_votes: u64) -> Result<u64> {
        let new_total = current_votes
            .checked_add(new_votes)
            .ok_or(error!(ErrorCode::Overflow))?;
        
        let new_cost = new_total
            .checked_mul(new_total)
            .ok_or(error!(ErrorCode::Overflow))?;
        
        let old_cost = current_votes
            .checked_mul(current_votes)
            .ok_or(error!(ErrorCode::Overflow))?;
        
        new_cost
            .checked_sub(old_cost)
            .ok_or(error!(ErrorCode::Overflow))
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("Arithmetic overflow occurred")]
    Overflow,
}