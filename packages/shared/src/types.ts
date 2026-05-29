export type Property = {
  id: string
  title: string
  location: string
  country: string
  total_value: string
  token_price: string
  total_tokens: number
  tokens_sold: number
  annual_yield: string
  status?: string
}

export type ApiResponse<T> = {
  success: boolean
  data: T
  error?: string
}
