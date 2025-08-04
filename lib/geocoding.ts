export async function geocodeAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
  const encodedAddress = encodeURIComponent(address)
  const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "MapaColaborativoDeProblemas/1.0 (your-email@example.com)", // Replace with your actual app name and email
      },
    })
    const data = await response.json()

    if (data && data.length > 0) {
      return {
        latitude: Number.parseFloat(data[0].lat),
        longitude: Number.parseFloat(data[0].lon),
      }
    } else {
      console.warn("No coordinates found for address:", address)
      return null
    }
  } catch (error) {
    console.error("Error during geocoding:", error)
    return null
  }
}
