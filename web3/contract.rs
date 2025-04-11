use anchor_lang::prelude::*;

declare_id!("YourProgramID");

#[program]
pub mod api_registry {
    use super::*;

    pub fn register_api(ctx: Context<RegisterApi>, name: String, endpoint: String, description: String) -> Result<()> {
        let api = &mut ctx.accounts.api;
        api.name = name;
        api.endpoint = endpoint;
        api.description = description;
        api.owner = *ctx.accounts.user.key;
        Ok(())
    }

    pub fn request_api_access(ctx: Context<RequestApiAccess>, api_name: String) -> Result<()> {
        let api_key = &mut ctx.accounts.api_key;
        api_key.api_name = api_name.clone();
        api_key.user = *ctx.accounts.user.key;
        api_key.used = false;
        emit!(ApiAccessRequested {
            api_name,
            user: *ctx.accounts.user.key,
            api_key: api_key.key(),
        });
        Ok(())
    }

    pub fn mark_api_key_used(ctx: Context<MarkApiKeyUsed>) -> Result<()> {
        let api_key = &mut ctx.accounts.api_key;
        require!(!api_key.used, CustomError::ApiKeyAlreadyUsed);
        api_key.used = true;
        // Transfer SOL from user to API owner
        // Implementation of SOL transfer goes here
        Ok(())
    }
}

#[derive(Accounts)]
pub struct RegisterApi<'info> {
    #[account(init, payer = user, space = 8 + 64 + 256 + 256 + 32)]
    pub api: Account<'info, Api>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RequestApiAccess<'info> {
    #[account(init, payer = user, space = 8 + 64 + 32 + 1)]
    pub api_key: Account<'info, ApiKey>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MarkApiKeyUsed<'info> {
    #[account(mut)]
    pub api_key: Account<'info, ApiKey>,
    pub user: Signer<'info>,
}

#[account]
pub struct Api {
    pub name: String,
    pub endpoint: String,
    pub description: String,
    pub owner: Pubkey,
}

#[account]
pub struct ApiKey {
    pub api_name: String,
    pub user: Pubkey,
    pub used: bool,
}

#[event]
pub struct ApiAccessRequested {
    pub api_name: String,
    pub user: Pubkey,
    pub api_key: Pubkey,
}

#[error_code]
pub enum CustomError {
    #[msg("API key has already been used.")]
    ApiKeyAlreadyUsed,
}
