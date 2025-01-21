import React, { useRef, useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { geoMercator } from "d3-geo";

const AnimatedDot = React.memo(({ cityPositions, cityStyle, journey }) => {
  return (
    <div
      className="pointer-events-none absolute left-0 top-0 h-full w-full"
      style={{
        "--sydney-x": `${cityPositions.sydney.x}px`,
        "--sydney-y": `${cityPositions.sydney.y}px`,
        "--hcm-x": `${cityPositions.hcmcity.x}px`,
        "--hcm-y": `${cityPositions.hcmcity.y}px`,
        "--tokyo-x": `${cityPositions.manila.x}px`,
        "--tokyo-y": `${cityPositions.manila.y}px`,
        "--ulan-x": `${cityPositions.ulaanbaatar.x}px`,
        "--ulan-y": `${cityPositions.ulaanbaatar.y}px`,
        willChange: "transform",
      }}
    >
      <div
        className={`absolute h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full ${journey}`}
        style={{
          backgroundColor: "white",
          ...cityStyle,
          willChange: "transform",
        }}
      />
    </div>
  );
});

const PreloadedMarker = React.memo(
  ({ coordinates, name, cityRef, style, opacity }) => (
    <Marker coordinates={coordinates}>
      <circle
        ref={cityRef}
        r="2"
        style={{
          ...style,
          opacity,
          transform: "translate3d(0,0,0)",
        }}
      />
      <text
        textAnchor="middle"
        y={-10}
        style={{
          fill: "#FFF",
          fontSize: "14px",
          filter: style.filter,
          opacity,
          transition: "opacity 0.2s ease-in-out",
          transform: "translate3d(0,0,0)",
        }}
      >
        {name}
      </text>
    </Marker>
  ),
);

const PreloadedGeography = React.memo(({ geo, style, opacity }) => (
  <Geography
    key={geo.rsmKey}
    geography={geo}
    style={{
      ...style,
      default: {
        ...style.default,
        opacity,
        transform: "translate3d(0,0,0)",
      },
      hover: {
        ...style.hover,
        opacity,
        transform: "translate3d(0,0,0)",
      },
    }}
  />
));

export default function MapPage() {
  const sydneyRef = useRef(null);
  const hcmcityRef = useRef(null);
  const manilaRef = useRef(null);
  const ulaanbaatarRef = useRef(null);

  const [cityPositions, setCityPositions] = useState({
    sydney: { x: 0, y: 0 },
    hcmcity: { x: 0, y: 0 },
    manila: { x: 0, y: 0 },
    ulaanbaatar: { x: 0, y: 0 },
  });
  const [journey, setJourney] = useState("sydney-to-hcm");
  const [activeLocations, setActiveLocations] = useState({
    sydney: true,
    vietnam: false,
    japan: false,
    mongolia: false,
  });

  function calculateDistance(coord1, coord2) {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;

    // Convert to radians
    const lat1Rad = (lat1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const lon1Rad = (lon1 * Math.PI) / 180;
    const lon2Rad = (lon2 * Math.PI) / 180;

    // Haversine formula
    const dLat = lat2Rad - lat1Rad;
    const dLon = lon2Rad - lon1Rad;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1Rad) *
        Math.cos(lat2Rad) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Earth's radius in kilometers
    const R = 6371;
    return R * c;
  }

  useEffect(() => {
    const baseSpeed = 2000; // adjust for speed

    const distances = {
      "sydney-to-hcm": calculateDistance(
        cities.sydney.coordinates,
        cities.hcmcity.coordinates,
      ),
      "hcm-to-tokyo": calculateDistance(
        cities.hcmcity.coordinates,
        cities.manila.coordinates,
      ),
      "tokyo-to-ulan": calculateDistance(
        cities.manila.coordinates,
        cities.ulaanbaatar.coordinates,
      ),
      "ulan-to-sydney": calculateDistance(
        cities.ulaanbaatar.coordinates,
        cities.sydney.coordinates,
      ),
    };

    // Set the CSS variables
    const root = document.documentElement;
    Object.entries(distances).forEach(([key, distance]) => {
      const duration = distance / baseSpeed;
      root.style.setProperty(`--${key}-duration`, `${duration}s`);
    });
  }, []);

  useEffect(() => {
    const preloadPositions = () => {
      if (
        sydneyRef.current &&
        hcmcityRef.current &&
        manilaRef.current &&
        ulaanbaatarRef.current
      ) {
        const sydneyRect = sydneyRef.current.getBoundingClientRect();
        const hcmcityRect = hcmcityRef.current.getBoundingClientRect();
        const manilaRect = manilaRef.current.getBoundingClientRect();
        const ulaanbaatarRect = ulaanbaatarRef.current.getBoundingClientRect();

        setCityPositions({
          sydney: { x: sydneyRect.x, y: sydneyRect.y },
          hcmcity: { x: hcmcityRect.x, y: hcmcityRect.y },
          manila: { x: manilaRect.x, y: manilaRect.y },
          ulaanbaatar: { x: ulaanbaatarRect.x, y: ulaanbaatarRect.y },
        });
      }
    };

    // Initial load
    preloadPositions();

    // Add a small delay to ensure accurate positions
    const timer = setTimeout(preloadPositions, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Update active locations based on journey
    switch (journey) {
      case "sydney-to-hcm":
        setActiveLocations({
          sydney: true,
          vietnam: true,
          japan: false,
          mongolia: false,
        });
        break;
      case "hcm-to-tokyo":
        setActiveLocations({
          sydney: false,
          vietnam: true,
          japan: true,
          mongolia: false,
        });
        break;
      case "tokyo-to-ulan":
        setActiveLocations({
          sydney: false,
          vietnam: false,
          japan: true,
          mongolia: true,
        });
        break;
      case "ulan-to-sydney":
        setActiveLocations({
          sydney: true,
          vietnam: false,
          japan: false,
          mongolia: true,
        });
        break;
    }
  }, [journey]);

  useEffect(() => {
    const handleAnimationEnd = () => {
      if (journey === "sydney-to-hcm") {
        setJourney("hcm-to-tokyo");
      } else if (journey === "hcm-to-tokyo") {
        setJourney("tokyo-to-ulan");
      } else if (journey === "tokyo-to-ulan") {
        setJourney("ulan-to-sydney");
      } else {
        setJourney("sydney-to-hcm");
      }
    };

    const dot = document.querySelector(".rounded-full");
    dot?.addEventListener("animationend", handleAnimationEnd);

    return () => {
      dot?.removeEventListener("animationend", handleAnimationEnd);
    };
  }, [journey]);

  const cities = {
    hcmcity: {
      coordinates: [105.8342, 21.0278],
      name: "Hanoi",
      country: "Vietnam",
    },
    sydney: {
      coordinates: [151.2099, -33.865143],
      name: "Sydney",
      country: "Australia",
    },
    manila: {
      coordinates: [139.65, 35.6764],
      name: "Tokyo",
      country: "Japan",
    },
    ulaanbaatar: {
      coordinates: [106.9057, 47.8864],
      name: "Ulaanbaatar",
      country: "Mongolia",
    },
  };

  const getJourneyText = () => {
    switch (journey) {
      case "sydney-to-hcm":
        return `${cities.sydney.name} (${cities.sydney.country}) - ${cities.hcmcity.name} (${cities.hcmcity.country})`;
      case "hcm-to-tokyo":
        return `${cities.hcmcity.name} (${cities.hcmcity.country}) - ${cities.manila.name} (${cities.manila.country})`;
      case "tokyo-to-ulan":
        return `${cities.manila.name} (${cities.manila.country}) - ${cities.ulaanbaatar.name} (${cities.ulaanbaatar.country})`;
      case "ulan-to-sydney":
        return `${cities.ulaanbaatar.name} (${cities.ulaanbaatar.country}) - ${cities.sydney.name} (${cities.sydney.country})`;
      default:
        return "";
    }
  };

  const mapStyles = {
    default: {
      fill: "transparent",
      stroke: "#FFF",
      strokeWidth: 1,
      filter:
        "drop-shadow(0 0 10px rgba(255, 255, 255, 0.7)) drop-shadow(0 0 20px rgba(180, 200, 255, 0.5)) drop-shadow(0 0 30px rgba(150, 170, 255, 0.3))",
      outline: "none",
      transition: "opacity 0.2s ease-in-out",
    },
    hover: {
      fill: "transparent",
      stroke: "#FFF",
      strokeWidth: 1,
      filter:
        "drop-shadow(0 0 10px rgba(255, 255, 255, 0.7)) drop-shadow(0 0 20px rgba(180, 200, 255, 0.5)) drop-shadow(0 0 30px rgba(150, 170, 255, 0.3))",
      outline: "none",
    },
    pressed: {
      fill: "transparent",
      stroke: "#FFF",
      strokeWidth: 1,
      outline: "none",
    },
  };

  const cityStyle = {
    fill: "#FFF",
    stroke: "#FFF",
    strokeWidth: 1,
    filter:
      "drop-shadow(0 0 10px rgba(255, 255, 255, 0.7)) drop-shadow(0 0 20px rgba(180, 200, 255, 0.5)) drop-shadow(0 0 30px rgba(150, 170, 255, 0.3))",
    transition: "opacity 0.2s ease-in-out",
  };

  const projection = geoMercator().center([145, 10]).scale(250);

  const getLocationOpacity = (country) => {
    switch (country) {
      case "Australia":
        return activeLocations.sydney ? 1 : 0;
      case "Vietnam":
        return activeLocations.vietnam ? 1 : 0;
      case "Japan":
        return activeLocations.japan ? 1 : 0;
      case "Mongolia":
        return activeLocations.mongolia ? 1 : 0;
      default:
        return 1;
    }
  };

  const getCityOpacity = (cityKey) => {
    switch (cityKey) {
      case "sydney":
        return activeLocations.sydney ? 1 : 0;
      case "hcmcity":
        return activeLocations.vietnam ? 1 : 0;
      case "manila":
        return activeLocations.japan ? 1 : 0;
      case "ulaanbaatar":
        return activeLocations.mongolia ? 1 : 0;
      default:
        return 1;
    }
  };

  return (
    <div className="h-screen bg-black">
      <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-black">
        <div className="mt-8 w-[800px]">
          <ComposableMap projection={projection}>
            <ZoomableGroup>
              <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json">
                {({ geographies }) =>
                  geographies
                    .filter((geo) =>
                      ["Vietnam", "Australia", "Japan", "Mongolia"].includes(
                        geo.properties.name,
                      ),
                    )
                    .map((geo) => (
                      <PreloadedGeography
                        key={geo.rsmKey}
                        geo={geo}
                        style={mapStyles}
                        opacity={getLocationOpacity(geo.properties.name)}
                      />
                    ))
                }
              </Geographies>

              {Object.entries(cities).map(([key, city]) => (
                <PreloadedMarker
                  key={key}
                  coordinates={city.coordinates}
                  name={city.name}
                  cityRef={
                    key === "sydney"
                      ? sydneyRef
                      : key === "hcmcity"
                        ? hcmcityRef
                        : key === "manila"
                          ? manilaRef
                          : ulaanbaatarRef
                  }
                  style={cityStyle}
                  opacity={getCityOpacity(key)}
                />
              ))}
            </ZoomableGroup>
          </ComposableMap>

          <AnimatedDot
            cityPositions={cityPositions}
            cityStyle={cityStyle}
            journey={journey}
          />
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 text-lg text-white">
        <span>{getJourneyText()}</span>
      </div>
    </div>
  );
}
