use anchor_lang::prelude::*;

pub mod contexts;   
pub mod state;

use contexts::*;    
use state::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod quadratic_voting {
    use super::*;

    pub fn create_poll(
        ctx: Context<CreatePoll>,
        title: String,
        description: String,
        option_count: u8,
    ) -> Result<()> {
        ctx.accounts.create_poll(title, description, option_count, &ctx.bumps)
    }

    pub fn register_voter(
        ctx: Context<RegisterVoter>,
        credits: u64,
    ) -> Result<()> {
        ctx.accounts.register_voter(credits, &ctx.bumps)
    }

    pub fn cast_vote(
        ctx: Context<CastVote>,
        option_index: u8,
        votes: u64,
    ) -> Result<()> {
        ctx.accounts.cast_vote(option_index, votes)
    }

    pub fn close_poll(ctx: Context<ClosePoll>) -> Result<()> {
        ctx.accounts.close_poll()
    }
}