use anchor_lang::prelude::*;

#[account]
pub struct Poll {
    pub authority: Pubkey,      // Poll creator
    pub title: String,          // Poll title (max 100 chars)
    pub description: String,    // Poll description (max 500 chars)
    pub option_count: u8,       // Number of voting options
    pub votes: Vec<u64>,        // Vote counts for each option
    pub is_active: bool,        // Whether poll is still open
    pub bump: u8,               // PDA bump
}

impl Poll {
    pub const MAX_TITLE_LEN: usize = 100;
    pub const MAX_DESC_LEN: usize = 500;
    pub const MAX_OPTIONS: usize = 10;
    
    pub fn space(option_count: u8) -> usize {
        8 +  // discriminator
        32 + // authority
        4 + Self::MAX_TITLE_LEN + // title
        4 + Self::MAX_DESC_LEN +  // description
        1 +  // option_count
        4 + (8 * option_count as usize) + // votes vector
        1 +  // is_active
        1    // bump
    }
}