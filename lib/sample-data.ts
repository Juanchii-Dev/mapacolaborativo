import type { Report } from "@/app/page"

export const sampleReports: Report[] = [
  {
    id: "sample-1",
    type: "bache",
    address: "Av. Corrientes 1234, CABA",
    description: "Bache grande en el carril derecho, peligroso para vehículos.",
    latitude: -34.6037,
    longitude: -58.3816,
    votes: 15,
    status: "pending",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    reporter_name: "Juan Pérez",
  },
  {
    id: "sample-2",
    type: "luminaria",
    address: "Calle Falsa 123, CABA",
    description: "Luminaria pública quemada, la calle está muy oscura por la noche.",
    latitude: -34.595,
    longitude: -58.405,
    votes: 8,
    status: "in_progress",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    reporter_name: "María García",
  },
  {
    id: "sample-3",
    type: "seguridad",
    address: "Plaza San Martín, CABA",
    description: "Robos frecuentes en la plaza, se necesita más presencia policial.",
    latitude: -34.5997,
    longitude: -58.3762,
    votes: 22,
    status: "resolved",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    reporter_name: "Pedro López",
  },
  {
    id: "sample-4",
    type: "limpieza",
    address: "Rivadavia 5000, CABA",
    description: "Acumulación de basura en la vereda, los contenedores están desbordados.",
    latitude: -34.615,
    longitude: -58.435,
    votes: 10,
    status: "pending",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    reporter_name: "Ana Fernández",
  },
  {
    id: "sample-5",
    type: "otro",
    address: "Diagonal Norte 800, CABA",
    description: "Árbol caído bloqueando parcialmente la vereda.",
    latitude: -34.601,
    longitude: -58.377,
    votes: 5,
    status: "pending",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    reporter_name: "Carlos Ruiz",
  },
  {
    id: "sample-6",
    type: "inundación",
    address: "Defensa 200, CABA",
    description: "Calles inundadas después de lluvias leves, problemas de drenaje.",
    latitude: -34.608,
    longitude: -58.372,
    votes: 18,
    status: "in_progress",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    reporter_name: "Laura Giménez",
  },
  {
    id: "sample-7",
    type: "ruido",
    address: "Santa Fe 2500, CABA",
    description: "Ruido excesivo de un bar por las noches, afecta el descanso de los vecinos.",
    latitude: -34.589,
    longitude: -58.409,
    votes: 9,
    status: "pending",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    reporter_name: "Roberto Castro",
  },
  {
    id: "sample-8",
    type: "transporte",
    address: "Estación Retiro, CABA",
    description: "Problemas con la frecuencia de los colectivos en hora pico.",
    latitude: -34.591,
    longitude: -58.373,
    votes: 12,
    status: "pending",
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
    reporter_name: "Sofía Torres",
  },
  {
    id: "sample-9",
    type: "salud",
    address: "Hospital Durand, CABA",
    description: "Falta de insumos básicos en el hospital público.",
    latitude: -34.609,
    longitude: -58.423,
    votes: 25,
    status: "in_progress",
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
    reporter_name: "Diego Morales",
  },
  {
    id: "sample-10",
    type: "educación",
    address: "Escuela N° 1, CABA",
    description: "Problemas de infraestructura en la escuela, aulas sin calefacción.",
    latitude: -34.62,
    longitude: -58.39,
    votes: 7,
    status: "pending",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    reporter_name: "Elena Gómez",
  },
]
