use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
#[instruction(title: String, description: String, option_count: u8)]
pub struct CreatePoll<'info> {
    #[account(
        init,
        payer = authority,
        space = Poll::space(option_count),
        seeds = [b"poll", authority.key().as_ref(), title.as_bytes()],
        bump
    )]
    pub poll: Account<'info, Poll>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

impl<'info> CreatePoll<'info> {
    pub fn create_poll(
        &mut self,
        title: String,
        description: String,
        option_count: u8,
        bumps: &CreatePollBumps,
    ) -> Result<()> {
        require!(
            title.len() <= Poll::MAX_TITLE_LEN,
            QuadraticVotingError::TitleTooLong
        );
        require!(
            description.len() <= Poll::MAX_DESC_LEN,
            QuadraticVotingError::DescriptionTooLong
        );
        require!(
            option_count > 0 && option_count <= Poll::MAX_OPTIONS as u8,
            QuadraticVotingError::InvalidOptionCount
        );

        self.poll.set_inner(Poll {
            authority: self.authority.key(),
            title,
            description,
            option_count,
            votes: vec![0; option_count as usize],
            is_active: true,
            bump: bumps.poll,
        });

        Ok(())
    }
}

#[error_code]
pub enum QuadraticVotingError {
    #[msg("Title exceeds maximum length")]
    TitleTooLong,
    #[msg("Description exceeds maximum length")]
    DescriptionTooLong,
    #[msg("Invalid option count (must be 1-10)")]
    InvalidOptionCount,
}