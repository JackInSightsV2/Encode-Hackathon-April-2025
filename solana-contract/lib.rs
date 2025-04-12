use anchor_lang::prelude::*;
use anchor_lang::system_program::{self, Transfer};

declare_id!("JA9FE7qcuSHQTgeGBzQHWP8ZaeLGBHag8gU6D4ZaCnRa");

#[program]
pub mod aiagentmarket {
    use super::*;
    
    // Register a new AI agent with metadata, including the price (in lamports)
    pub fn register_agent(ctx: Context<RegisterAgent>, name: String, description: String, endpoint: String, price: u64) -> Result<()> {
        let agent = &mut ctx.accounts.agent;
        agent.name = name;
        agent.description = description;
        agent.endpoint = endpoint;
        agent.price = price;
        // Set the agent owner to be the user who pays for account creation
        agent.owner = *ctx.accounts.user.key;
        Ok(())
    }
    
    // Invoke an agent: this transfers payment and logs the invocation.
    // Every call deducts `agent.price` lamports from the user's account,
    // sending it to the agent owner's account.
    pub fn invoke_agent(ctx: Context<InvokeAgent>) -> Result<()> {
        let agent = &ctx.accounts.agent;
        
        // Validate that the agent_owner provided in the context matches the stored owner in the agent record.
        if *ctx.accounts.agent_owner.key != agent.owner {
            return Err(ErrorCode::InvalidAgentOwner.into());
        }
        
        // Transfer lamports from the user to the agent owner.
        let cpi_accounts = Transfer {
            from: ctx.accounts.user.to_account_info(),
            to: ctx.accounts.agent_owner.to_account_info(),
        };
        let cpi_context = CpiContext::new(ctx.accounts.system_program.to_account_info(), cpi_accounts);
        system_program::transfer(cpi_context, agent.price)?;
        
        // Log the invocation in the transaction logs.
        msg!("Agent invoked by: {}", ctx.accounts.user.key);
        Ok(())
    }
}

//
// Data structure stored on-chain for each AI agent.
//
#[account]
pub struct Agent {
    pub name: String,
    pub description: String,
    pub endpoint: String,
    pub price: u64,
    pub owner: Pubkey,
}

//
// Context for the register_agent instruction.
//
#[derive(Accounts)]
pub struct RegisterAgent<'info> {
    #[account(
        init, 
        payer = user, 
        space = 8 + (4 + 100) + (4 + 256) + (4 + 256) + 8 + 32
    )]
    pub agent: Account<'info, Agent>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}


//
// Context for the invoke_agent instruction.
//
// Note: We add an extra account, agent_owner, to receive the payment. 
// Its only purpose is to match the stored owner in Agent and to be the destination
// for the lamport transfer.
#[derive(Accounts)]
pub struct InvokeAgent<'info> {
    #[account(mut)]
    pub agent: Account<'info, Agent>,
    #[account(mut)]
    pub user: Signer<'info>,
    /// CHECK: We only check that this account's key matches the stored owner. No data deserialization is needed.
    #[account(mut)]
    pub agent_owner: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

//
// Custom error code for mismatched agent owner.
//
#[error_code]
pub enum ErrorCode {
    #[msg("The provided agent owner does not match the stored owner.")]
    InvalidAgentOwner,
}
