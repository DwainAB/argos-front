"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";
import type { GlobeConfig, Position } from "@/components/ui/globe";

const World = dynamic(() => import("@/components/ui/globe").then((m) => m.World), {
  ssr: false,
});

const globeConfig: GlobeConfig = {
  pointSize: 4,
  globeColor: "#062056",
  showAtmosphere: true,
  atmosphereColor: "#FFFFFF",
  atmosphereAltitude: 0.15,
  emissive: "#062056",
  emissiveIntensity: 0.15,
  shininess: 0.9,
  polygonColor: "rgba(255,255,255,0.5)",
  ambientLight: "#60A5FA",
  directionalLeftLight: "#ffffff",
  directionalTopLight: "#ffffff",
  pointLight: "#ffffff",
  arcTime: 1400,
  arcLength: 0.9,
  rings: 1,
  maxRings: 3,
  initialPosition: { lat: 48.8566, lng: 2.3522 },
  autoRotate: true,
  autoRotateSpeed: 0.6,
};

const arcColors = ["#3B82F6", "#60A5FA", "#93C5FD"];

function randomArcColor() {
  return arcColors[Math.floor(Math.random() * arcColors.length)];
}

// Grandes villes réparties sur tous les continents, pour que les arcs couvrent
// vraiment le globe entier plutôt qu'un seul axe Europe/Amérique/Asie.
const cities = {
  paris: { lat: 48.8566, lng: 2.3522 },
  london: { lat: 51.5072, lng: -0.1276 },
  berlin: { lat: 52.52, lng: 13.405 },
  madrid: { lat: 40.4168, lng: -3.7038 },
  moscow: { lat: 55.7558, lng: 37.6173 },
  newYork: { lat: 40.7128, lng: -74.006 },
  sanFrancisco: { lat: 37.7749, lng: -122.4194 },
  toronto: { lat: 43.6532, lng: -79.3832 },
  mexicoCity: { lat: 19.4326, lng: -99.1332 },
  saoPaulo: { lat: -23.5505, lng: -46.6333 },
  buenosAires: { lat: -34.6037, lng: -58.3816 },
  lima: { lat: -12.0464, lng: -77.0428 },
  lagos: { lat: 6.5244, lng: 3.3792 },
  cairo: { lat: 30.0444, lng: 31.2357 },
  nairobi: { lat: -1.2921, lng: 36.8219 },
  capeTown: { lat: -33.9249, lng: 18.4241 },
  dubai: { lat: 25.2048, lng: 55.2708 },
  istanbul: { lat: 41.0082, lng: 28.9784 },
  telAviv: { lat: 32.0853, lng: 34.7818 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  singapore: { lat: 1.3521, lng: 103.8198 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  seoul: { lat: 37.5665, lng: 126.978 },
  hongKong: { lat: 22.3193, lng: 114.1694 },
  jakarta: { lat: -6.2088, lng: 106.8456 },
  sydney: { lat: -33.8688, lng: 151.2093 },
  auckland: { lat: -36.8485, lng: 174.7633 },
};

type City = { lat: number; lng: number };

function arc(order: number, from: City, to: City, arcAlt: number): Position {
  return {
    order,
    startLat: from.lat,
    startLng: from.lng,
    endLat: to.lat,
    endLng: to.lng,
    arcAlt,
    color: randomArcColor(),
  };
}

const monitoredServers: Position[] = [
  arc(1, cities.paris, cities.newYork, 0.3),
  arc(1, cities.newYork, cities.sanFrancisco, 0.3),
  arc(1, cities.london, cities.toronto, 0.4),
  arc(2, cities.paris, cities.london, 0.1),
  arc(2, cities.london, cities.berlin, 0.15),
  arc(2, cities.madrid, cities.paris, 0.15),
  arc(3, cities.paris, cities.tokyo, 0.5),
  arc(3, cities.tokyo, cities.singapore, 0.3),
  arc(3, cities.tokyo, cities.seoul, 0.15),
  arc(4, cities.paris, cities.sydney, 0.6),
  arc(4, cities.sanFrancisco, cities.saoPaulo, 0.4),
  arc(4, cities.sydney, cities.auckland, 0.15),
  arc(5, cities.berlin, cities.moscow, 0.2),
  arc(5, cities.singapore, cities.hongKong, 0.15),
  arc(5, cities.singapore, cities.jakarta, 0.15),
  arc(6, cities.saoPaulo, cities.newYork, 0.3),
  arc(6, cities.saoPaulo, cities.buenosAires, 0.15),
  arc(6, cities.mexicoCity, cities.lima, 0.2),
  arc(7, cities.mumbai, cities.singapore, 0.2),
  arc(7, cities.dubai, cities.mumbai, 0.15),
  arc(7, cities.istanbul, cities.dubai, 0.15),
  arc(8, cities.telAviv, cities.istanbul, 0.1),
  arc(8, cities.cairo, cities.telAviv, 0.1),
  arc(8, cities.lagos, cities.cairo, 0.25),
  arc(9, cities.nairobi, cities.dubai, 0.25),
  arc(9, cities.capeTown, cities.nairobi, 0.2),
  arc(9, cities.lagos, cities.capeTown, 0.25),
  arc(10, cities.mumbai, cities.mexicoCity, 0.6),
  arc(10, cities.auckland, cities.sanFrancisco, 0.6),
  arc(10, cities.jakarta, cities.sydney, 0.3),
];

export function WorldGlobeSection() {
  return (
    <section className="relative mx-auto w-full max-w-6xl overflow-hidden px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mx-auto mb-4 max-w-2xl text-center"
      >
        <h2 className="text-2xl font-semibold text-ink-primary sm:text-3xl">
          Où que soient vos serveurs, Argos les surveille
        </h2>
        <p className="mt-3 text-sm text-ink-secondary sm:text-base">
          Peu importe le continent où votre infrastructure est hébergée, Argos AI voyage à
          travers le monde pour garder un œil sur vos logs, en continu.
        </p>
      </motion.div>

      <div
        className="relative h-[28rem] w-full sm:h-[36rem]"
        style={{ maskImage: "linear-gradient(to bottom, black, transparent 90%)" }}
      >
        <World data={monitoredServers} globeConfig={globeConfig} />
      </div>
    </section>
  );
}
