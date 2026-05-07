use anchor_lang::prelude::*;

declare_id!("PyTHoR2c11111111111111111111111111111111");

pub const PYTH_PRICE_FEED_SIZE: usize = 3312;
pub const MAX_PRICE_AGE_SECONDS: i64 = 60;

#[program]
pub mod oracle {
    use super::*;

    pub fn get_price(ctx: Context<GetPrice>) -> Result<u64> {
        let price_data = &ctx.accounts.price_feed;
        let price = pyth_decode_price(price_data)?;
        check_price_freshness(price_data)?;
        Ok(price)
    }

    pub fn get_price_with_confidence(ctx: Context<GetPriceWithConfidence>) -> Result<PriceWithConfidence> {
        let price_data = &ctx.accounts.price_feed;
        let (price, conf) = pyth_decode_price_with_confidence(price_data)?;
        check_price_freshness(price_data)?;
        Ok(PriceWithConfidence { price, confidence: conf })
    }
}

#[derive(Accounts)]
pub struct GetPrice<'info> {
    pub price_feed: Account<'info, PriceFeed>,
}

#[derive(Accounts)]
pub struct GetPriceWithConfidence<'info> {
    pub price_feed: Account<'info, PriceFeed>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct PriceWithConfidence {
    pub price: u64,
    pub confidence: u64,
}

#[account]
pub struct PriceFeed {
    pub data: [u8; PYTH_PRICE_FEED_SIZE],
}

impl PriceFeed {
    pub fn get_value(&self) -> Result<(u64, u64)> {
        pyth_decode_price_with_confidence(self)
    }
}

fn pyth_decode_price(feed: &PriceFeed) -> Result<u64> {
    let data = &feed.data;
    
    // Pyth V2 price format - offset to price data
    let price_offset = 128;
    let price_data = &data[price_offset..price_offset + 40];
    
    // Read price as i64 (little endian)
    let price = i64::from_le_bytes(
        price_data[0..8].try_into().map_err(|_| OracleError::InvalidData)?
    );
    
    // Read exponent as i32
    let exponent = i32::from_le_bytes(
        price_data[8..12].try_into().map_err(|_| OracleError::InvalidData)?
    );
    
    require!(price > 0, OracleError::InvalidPrice);
    
    // Convert to u64 with exponent adjustment
    let price_u64 = if exponent >= 0 {
        (price as u64).saturating_mul(10u64.pow(exponent as u32))
    } else {
        (price as u64).saturating_div(10u64.pow((-exponent) as u32))
    };
    
    Ok(price_u64)
}

fn pyth_decode_price_with_confidence(feed: &PriceFeed) -> Result<(u64, u64)> {
    let data = &feed.data;
    
    let price_offset = 128;
    let price_data = &data[price_offset..price_offset + 64];
    
    // Price
    let price = i64::from_le_bytes(
        price_data[0..8].try_into().map_err(|_| OracleError::InvalidData)?
    );
    
    // Confidence interval
    let conf = u64::from_le_bytes(
        price_data[24..32].try_into().map_err(|_| OracleError::InvalidData)?
    );
    
    // Exponent
    let exponent = i32::from_le_bytes(
        price_data[8..12].try_into().map_err(|_| OracleError::InvalidData)?
    );
    
    require!(price > 0, OracleError::InvalidPrice);
    
    let price_u64 = if exponent >= 0 {
        (price as u64).saturating_mul(10u64.pow(exponent as u32))
    } else {
        (price as u64).saturating_div(10u64.pow((-exponent) as u32))
    };
    
    Ok((price_u64, conf))
}

fn check_price_freshness(feed: &PriceFeed) -> Result<()> {
    let data = &feed.data;
    let publish_time_offset = 64;
    let publish_time_bytes = &data[publish_time_offset..publish_time_offset + 8];
    let publish_time = i64::from_le_bytes(
        publish_time_bytes.try_into().map_err(|_| OracleError::InvalidData)?
    );
    
    let clock = Clock::get()?;
    let current_time = clock.unix_timestamp;
    
    require!(
        current_time - publish_time <= MAX_PRICE_AGE_SECONDS,
        OracleError::FeedUnavailable
    );
    
    Ok(())
}

// Switchboard Oracle fallback
pub fn switchboard_get_price(_feed: &Account<SwitchboardPrice>) -> Result<u64> {
    // TODO: Implement Switchboard integration
    // For now, return placeholder
    msg!("Switchboard fallback not yet implemented");
    Ok(0)
}

#[account]
pub struct SwitchboardPrice {
    pub value: i128,
    pub decimal: u32,
    pub timestamp: i64,
}

#[error_code]
pub enum OracleError {
    #[msg("Invalid price data")]
    InvalidData,
    #[msg("Invalid price value")]
    InvalidPrice,
    #[msg("Oracle feed unavailable")]
    FeedUnavailable,
    #[msg("Price confidence too high")]
    LowConfidence,
}