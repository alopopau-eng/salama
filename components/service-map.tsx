"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Phone, MapIcon } from "lucide-react"
// Define the inspection centers data
const inspectionCenters = [
  {
    id: 1,
    name: "مركز الرياض",
    city: "الرياض",
    lat: 24.7136,
    lng: 46.6753,
    address: "شارع الملك فهد، الرياض",
    phone: "+966 55332 333",
  },
  {
    id: 2,
    name: "مركز جدة",
    city: "جدة",
    lat: 21.5433,
    lng: 39.1727,
    address: "شارع البحر، جدة",
    phone: "+966 12 55788 999",
  },
  {
    id: 3,
    name: "مركز الدمام",
    city: "الدمام",
    lat: 26.4153,
    lng: 50.1956,
    address: "الطريق الساحلي، الدمام",
    phone: "+966 13 5532 3334",
  },
  {
    id: 4,
    name: "مركز الخبر",
    city: "الخبر",
    lat: 26.1387,
    lng: 50.2047,
    address: "شارع الملك عبدالله، الخبر",
    phone: "+966 13 55 1111 444",
  },
  {
    id: 5,
    name: "مركز الطائف",
    city: "الطائف",
    lat: 21.2808,
    lng: 40.4158,
    address: "شارع الملك عبدالعزيز، الطائف",
    phone: "+966 12 155555 222",
  },
  {
    id: 6,
    name: "مركز مكة",
    city: "مكة",
    lat: 21.4225,
    lng: 39.8262,
    address: "الطريق الدائري، مكة",
    phone: "+966 12 555 55223",
  },
]

interface ServiceMapProps {
  onCenterSelect?: (center: (typeof inspectionCenters)[0]) => void
  selectedCenter?: string
}

export default function ServiceMap({ onCenterSelect, selectedCenter }: ServiceMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (!mapContainer.current) return

    const L = (window as any).L
    if (!L) {
      // Load Leaflet if not already loaded
      const loadLeaflet = async () => {
        const leafletCss = document.createElement("link")
        leafletCss.rel = "stylesheet"
        leafletCss.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
        document.head.appendChild(leafletCss)

        const leafletScript = document.createElement("script")
        leafletScript.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"
        leafletScript.async = true
        leafletScript.onload = () => initializeMap()
        document.head.appendChild(leafletScript)
      }
      loadLeaflet()
      return
    }

    const initializeMap = () => {
      if (!mapContainer.current) return

      if (mapInstance.current) {
        try {
          mapInstance.current.remove()
        } catch (e) {
          // Silently fail if already removed
        }
        mapInstance.current = null
      }

      // Clear the container
      if (mapContainer.current) {
        mapContainer.current.innerHTML = ""
      }

      try {
        mapInstance.current = L.map(mapContainer.current).setView([23.8859, 45.0792], 5)

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapInstance.current)

        inspectionCenters.forEach((center) => {
          const isSelected = selectedCenter === center.id.toString()
          const icon = L.divIcon({
            className: "custom-marker",
            html: `<div class="w-10 h-10 ${isSelected ? "bg-green-600" : "bg-green-500"} rounded-full flex items-center justify-center text-white font-bold shadow-lg border-3 border-white"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg></div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40],
          })

          const marker = L.marker([center.lat, center.lng], { icon }).addTo(mapInstance.current)
          const popupContent = `<div class="text-right p-2" dir="rtl"><h4 class="font-bold text-green-700 mb-2 text-sm">${center.name}</h4><div class="text-xs text-stone-600 space-y-1"><p><strong>العنوان:</strong> ${center.address}</p><p><strong>الهاتف:</strong> ${center.phone}</p></div></div>`

          marker.bindPopup(popupContent, { maxWidth: 250 })
          if (isSelected) {
            setTimeout(() => marker.openPopup(), 300)
          }
          marker.on("click", () => {
            if (onCenterSelect) {
              onCenterSelect(center)
            }
          })
        })

        setMapReady(true)
      } catch (error) {
        console.error("Map initialization error:", error)
      }
    }

    initializeMap()

    return () => {
      if (mapInstance.current) {
        try {
          mapInstance.current.remove()
        } catch (e) {}
        mapInstance.current = null
      }
    }
  }, [selectedCenter, onCenterSelect])

  return (
    <div className="w-full space-y-6">
      <div className="relative rounded-xl overflow-hidden shadow-lg border border-stone-200">
        <div ref={mapContainer} className="w-full h-96 bg-stone-100" />
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapIcon className="w-6 h-6 text-green-600 animate-pulse" />
              </div>
              <p className="text-sm text-stone-600">جاري تحميل الخريطة...</p>
            </div>
          </div>
        )}
      </div>

      {/* Centers List */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-stone-900 px-1">المراكز المتاحة</h4>
        <div className="grid grid-cols-1 gap-3">
          {inspectionCenters.map((center) => (
            <button
              key={center.id}
              onClick={() => onCenterSelect?.(center)}
              className={`p-4 rounded-lg border-2 text-right transition-all duration-200 ${
                selectedCenter === center.id.toString()
                  ? "bg-green-50 border-green-500 shadow-md"
                  : "bg-white border-stone-200 hover:border-green-400 hover:shadow-sm"
              }`}
              dir="rtl"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    selectedCenter === center.id.toString() ? "bg-green-600 text-white" : "bg-green-100 text-green-600"
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-stone-900 text-sm mb-1">{center.name}</h4>
                  <p className="text-xs text-stone-600 mb-2">{center.address}</p>
                  <p className="text-xs text-stone-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {center.phone}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
