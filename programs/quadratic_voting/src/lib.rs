use anchor_lang::prelude::*;

pub mod context;  // ✅ Changed from "instruction" to "contexts"
pub mod state;

use context::*;
use state::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod quadratic_voting {
    use super::*;

    /// Create a new poll with specified options
    pub fn create_poll(
        ctx: Context<CreatePoll>,
        title: String,
        description: String,
        option_count: u8,
    ) -> Result<()> {
        ctx.accounts.create_poll(title, description, option_count, &ctx.bumps)
    }

    /// Register a voter for a poll with a credit allocation
    pub fn register_voter(
        ctx: Context<RegisterVoter>,
        credits: u64,
    ) -> Result<()> {
        ctx.accounts.register_voter(credits, &ctx.bumps)
    }

    /// Cast votes on a poll option using quadratic voting
    /// Cost = (current_votes + new_votes)² - current_votes²
    pub fn cast_vote(
        ctx: Context<CastVote>,
        option_index: u8,
        votes: u64,
    ) -> Result<()> {
        ctx.accounts.cast_vote(option_index, votes)
    }

    /// Close the poll (only callable by poll authority)
    pub fn close_poll(ctx: Context<ClosePoll>) -> Result<()> {
        ctx.accounts.close_poll()
    }
}