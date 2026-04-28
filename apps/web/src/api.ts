import { API_ROUTES } from "@osanvault/shared"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001"

export async function getProperties() {
  const res = await fetch(BASE_URL + API_ROUTES.properties)
  return res.json()
}

export async function getHealth() {
  const res = await fetch(BASE_URL + API_ROUTES.health)
  return res.json()
}
