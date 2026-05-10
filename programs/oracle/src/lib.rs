use anchor_lang::prelude::*;

declare_id!("9x81xZ2Kqjc5zbVAsX7Kqwv4HSo1HSkWkC3LUorZ8n55");

pub const PYTH_PRICE_FEED_SIZE: usize = 3312;
pub const MAX_PRICE_AGE_SECONDS: i64 = 60;
pub const SWITCHBOARD_MAX_AGE_SECONDS: i64 = 120;
pub const CONFIDENCE_THRESHOLD_BPS: u64 = 500;

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
        
        let confidence_bps = calculate_confidence_bps(price, conf);
        require!(
            confidence_bps <= CONFIDENCE_THRESHOLD_BPS,
            OracleError::LowConfidence
        );
        
        Ok(PriceWithConfidence { price, confidence: conf })
    }

    pub fn get_price_fallback(
        ctx: Context<GetPriceFallback>,
    ) -> Result<OraclePriceResult> {
        let pyth_feed = &ctx.accounts.pyth_price_feed;
        let switchboard_feed = &ctx.accounts.switchboard_feed;
        
        let pyth_price = try_get_pyth_price(pyth_feed);
        let sb_price = try_get_switchboard_price(switchboard_feed);
        
        let (price, source) = select_best_price(pyth_price, sb_price)?;
        
        msg!("Oracle price: {} from {}", price, source);
        
        Ok(OraclePriceResult {
            price,
            source,
            timestamp: Clock::get()?.unix_timestamp,
        })
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

#[derive(Accounts)]
pub struct GetPriceFallback<'info> {
    pub pyth_price_feed: AccountInfo<'info>,
    pub switchboard_feed: AccountInfo<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct PriceWithConfidence {
    pub price: u64,
    pub confidence: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct OraclePriceResult {
    pub price: u64,
    pub source: String,
    pub timestamp: i64,
}

#[account]
pub struct PriceFeed {
    pub data: [u8; PYTH_PRICE_FEED_SIZE],
}

#[account]
pub struct SwitchboardPrice {
    pub feed_id: [u8; 32],
    pub value: i128,
    pub decimal: u32,
    pub timestamp: i64,
    pub slot: u64,
}

impl PriceFeed {
    pub fn get_value(&self) -> Result<(u64, u64)> {
        pyth_decode_price_with_confidence(self)
    }
}

fn try_get_pyth_price(feed: &AccountInfo) -> Option<u64> {
    if feed.data_len() >= PYTH_PRICE_FEED_SIZE {
        let data = feed.try_borrow_data().ok()?;
        let price_data = PriceFeed {
            data: data[..PYTH_PRICE_FEED_SIZE].try_into().ok()?,
        };
        pyth_decode_price(&price_data).ok()
    } else {
        None
    }
}

fn try_get_switchboard_price(feed: &AccountInfo) -> Option<u64> {
    if feed.data_len() >= 64 {
        let data = feed.try_borrow_data().ok()?;
        if data.len() >= 64 {
            let timestamp = i64::from_le_bytes(data[40..48].try_into().ok()?);
            let current_time = Clock::get().ok()?.unix_timestamp;
            
            if current_time - timestamp > SWITCHBOARD_MAX_AGE_SECONDS {
                return None;
            }
            
            let value = i128::from_le_bytes(data[0..16].try_into().ok()?);
            let decimal = u32::from_le_bytes(data[16..20].try_into().ok()?);
            
            let price_u64 = if decimal >= 18 {
                (value as u64).saturating_div(10u64.pow((decimal - 18) as u32))
            } else {
                (value as u64).saturating_mul(10u64.pow((18 - decimal) as u32))
            };
            
            return Some(price_u64);
        }
    }
    None
}

fn select_best_price(pyth: Option<u64>, switchboard: Option<u64>) -> Result<(u64, String)> {
    match (pyth, switchboard) {
        (Some(p), None) => Ok((p, "PYTH".to_string())),
        (None, Some(s)) => Ok((s, "SWITCHBOARD".to_string())),
        (Some(p), Some(s)) => {
            let diff = if p > s { p - s } else { s - p };
            let avg = (p + s) / 2;
            let tolerance = avg / 100;
            
            if tolerance == 0 || diff <= tolerance {
                Ok((p, "PYTH".to_string()))
            } else {
                msg!("Price deviation detected! Pyth: {}, Switchboard: {}", p, s);
                Ok((p, "PYTH".to_string()))
            }
        }
        (None, None) => err!(OracleError::FeedUnavailable),
    }
}

fn calculate_confidence_bps(price: u64, confidence: u64) -> u64 {
    if price == 0 {
        return u64::MAX;
    }
    (confidence.saturating_mul(10000)).saturating_div(price)
}

fn pyth_decode_price(feed: &PriceFeed) -> Result<u64> {
    let data = &feed.data;
    
    let price_offset = 128;
    let price_data = &data[price_offset..price_offset + 40];
    
    let price = i64::from_le_bytes(
        price_data[0..8].try_into().map_err(|_| OracleError::InvalidData)?
    );
    
    let exponent = i32::from_le_bytes(
        price_data[8..12].try_into().map_err(|_| OracleError::InvalidData)?
    );
    
    require!(price > 0, OracleError::InvalidPrice);
    
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
    
    let price = i64::from_le_bytes(
        price_data[0..8].try_into().map_err(|_| OracleError::InvalidData)?
    );
    
    let conf = u64::from_le_bytes(
        price_data[24..32].try_into().map_err(|_| OracleError::InvalidData)?
    );
    
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