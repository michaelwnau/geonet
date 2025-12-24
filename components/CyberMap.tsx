import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { City, MapView, SantaState } from '../types';
import { CITIES } from '../constants';

interface CyberMapProps {
  onCitySelect: (city: City) => void;
  selectedCity: City | null;
  viewMode: MapView;
  santaState: SantaState | null;
}

export const CyberMap: React.FC<CyberMapProps> = ({ onCitySelect, selectedCity, viewMode, santaState }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [worldData, setWorldData] = useState<any>(null);
  const rotationRef = useRef<any>(null); // For auto-rotation
  const [trail, setTrail] = useState<{ lat: number, lng: number }[]>([]);

  // Update trail when Santa moves
  useEffect(() => {
    if (santaState?.currentLocation) {
      setTrail(prev => {
        const last = prev[prev.length - 1];
        if (!last || last.lat !== santaState.currentLocation.lat || last.lng !== santaState.currentLocation.lng) {
          return [...prev.slice(-50), santaState.currentLocation]; // Keep last 50 points
        }
        return prev;
      });
    }
  }, [santaState?.currentLocation]);

  useEffect(() => {
    Promise.all([
      fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then(r => r.json()),
      fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(r => r.json())
    ]).then(([us, world]) => {
      setGeoData(us);
      setWorldData(world);
    });
  }, []);

  useEffect(() => {
    if (!geoData || !worldData || !svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create a group for the map content
    const g = svg.append("g");

    // Configure Projection based on View Mode
    let projection: d3.GeoProjection;
    let isGlobe = false;

    switch (viewMode) {
      case 'GLOBE':
        projection = d3.geoOrthographic()
          .scale(height / 2.2)
          .translate([width / 2, height / 2])
          .clipAngle(90);
        isGlobe = true;
        break;
      case 'EUROPE':
        projection = d3.geoMercator()
          .center([15, 50])
          .scale(width / 1.5)
          .translate([width / 2, height / 2]);
        break;
      case 'ASIA':
        projection = d3.geoMercator()
          .center([90, 30])
          .scale(width / 2.5)
          .translate([width / 2, height / 2]);
        break;
      case 'AFRICA':
        projection = d3.geoMercator()
          .center([20, 0])
          .scale(width / 2.5)
          .translate([width / 2, height / 2]);
        break;
      case 'SOUTH_AMERICA':
        projection = d3.geoMercator()
          .center([-60, -20])
          .scale(width / 2.5)
          .translate([width / 2, height / 2]);
        break;
      case 'AUSTRALIA':
        projection = d3.geoMercator()
          .center([135, -25])
          .scale(width / 2)
          .translate([width / 2, height / 2]);
        break;
      case 'US':
      default:
        projection = d3.geoAlbersUsa()
          .scale(width * 1.2)
          .translate([width / 2, height / 2]);
        break;
    }

    const path = d3.geoPath().projection(projection);

    // Render Logic
    if (viewMode === 'US') {
      // US View (States)
      const states = topojson.feature(geoData, geoData.objects.states) as any;
      g.append("path")
        .datum(states)
        .attr("class", "state-border")
        .attr("d", path)
        .attr("fill", "rgba(0, 243, 255, 0.08)")
        .attr("stroke", "#00f3ff")
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 0.6);
    } else {
      // World View (Countries)
      const countries = topojson.feature(worldData, worldData.objects.countries) as any;

      // Globe Background (Ocean)
      if (isGlobe) {
        g.append("circle")
          .attr("cx", width / 2)
          .attr("cy", height / 2)
          .attr("r", projection.scale())
          .attr("fill", "#050a0f")
          .attr("stroke", "#005f63")
          .attr("stroke-width", 1);
      }

      g.append("path")
        .datum(countries)
        .attr("class", "country-border")
        .attr("d", path)
        .attr("fill", "rgba(0, 243, 255, 0.08)")
        .attr("stroke", "#00f3ff")
        .attr("stroke-width", 1)
        .attr("stroke-opacity", 0.5);

      // Graticule for Globe
      if (isGlobe) {
        const graticule = d3.geoGraticule();
        g.append("path")
          .datum(graticule())
          .attr("class", "graticule")
          .attr("d", path)
          .attr("fill", "none")
          .attr("stroke", "#005f63")
          .attr("stroke-width", 0.5)
          .attr("stroke-opacity", 0.3);
      }
    }

    // Render Santa Trail
    if (trail.length > 1) {
      const lineGenerator = d3.line<{ lat: number, lng: number }>()
        .x(d => projection([d.lng, d.lat])?.[0] || 0)
        .y(d => projection([d.lng, d.lat])?.[1] || 0)
        .curve(d3.curveBasis);

      g.append("path")
        .datum(trail)
        .attr("fill", "none")
        .attr("stroke", "#00f3ff")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4 4")
        .attr("opacity", 0.4)
        .attr("d", lineGenerator as any);
    }

    // Draw Cities
    CITIES.forEach(city => {
      const coords = projection([city.lng, city.lat]);
      let isVisible = true;
      if (isGlobe) {
        const center = projection.invert!([width / 2, height / 2]);
        const distance = d3.geoDistance(center!, [city.lng, city.lat]);
        if (distance > Math.PI / 2) isVisible = false;
      }

      if (coords && isVisible) {
        const isSelected = selectedCity?.id === city.id;
        const cityG = g.append("g")
          .datum(city)
          .attr("class", "city-marker-group")
          .attr("transform", `translate(${coords[0]}, ${coords[1]})`)
          .style("cursor", "pointer")
          .on("click", (e) => {
            e.stopPropagation();
            onCitySelect(city);
          });

        cityG.append("circle")
          .attr("r", isSelected ? 12 : 6)
          .attr("fill", "none")
          .attr("stroke", "#00f3ff")
          .attr("stroke-width", 2)
          .attr("opacity", 1)
          .append("animate")
          .attr("attributeName", "r")
          .attr("from", isSelected ? 12 : 6)
          .attr("to", isSelected ? 24 : 14)
          .attr("dur", "1.5s")
          .attr("repeatCount", "indefinite");

        cityG.select("circle").append("animate")
          .attr("attributeName", "opacity")
          .attr("values", "1;0")
          .attr("dur", "1.5s")
          .attr("repeatCount", "indefinite");

        cityG.append("circle")
          .attr("r", 4.5)
          .attr("fill", "#00f3ff")
          .attr("stroke", "#050a0f")
          .attr("stroke-width", 1);

        if (!isGlobe || isSelected) {
          const labelX = 12;
          const labelY = -12;
          cityG.append("line")
            .attr("x1", 4)
            .attr("y1", -4)
            .attr("x2", labelX)
            .attr("y2", labelY)
            .attr("stroke", "#00f3ff")
            .attr("stroke-width", 1.5);
          cityG.append("text")
            .attr("x", labelX + 2)
            .attr("y", labelY)
            .text(`${city.name}`)
            .attr("fill", "#00f3ff")
            .attr("stroke", "#050a0f")
            .attr("stroke-width", "3px")
            .attr("stroke-linejoin", "round")
            .style("paint-order", "stroke")
            .attr("font-size", "12px")
            .attr("font-family", "'Share Tech Mono', monospace")
            .attr("font-weight", "bold")
            .style("text-transform", "uppercase")
            .style("pointer-events", "none");
        }
      }
    });

    // Draw Santa - ALWAYS add to group, handle visibility in render or locally
    if (santaState) {
      const santaG = g.append("g")
        .attr("class", "santa-marker-group");

      const updateSantaPos = () => {
        const coords = projection([santaState.currentLocation.lng, santaState.currentLocation.lat]);
        let isVisible = !!coords;
        if (isGlobe && coords) {
          const center = projection.invert!([width / 2, height / 2]);
          const distance = d3.geoDistance(center!, [santaState.currentLocation.lng, santaState.currentLocation.lat]);
          if (distance > Math.PI / 2) isVisible = false;
        }
        santaG.attr("display", isVisible ? "block" : "none")
          .attr("transform", coords ? `translate(${coords[0]}, ${coords[1]})` : null);
      };

      updateSantaPos();

      // Pulsing Ring (Cyan)
      santaG.append("circle")
        .attr("r", 15)
        .attr("fill", "none")
        .attr("stroke", "#00f3ff")
        .attr("stroke-width", 3)
        .attr("opacity", 1)
        .append("animate")
        .attr("attributeName", "r")
        .attr("from", 15)
        .attr("to", 35)
        .attr("dur", "1s")
        .attr("repeatCount", "indefinite");

      santaG.select("circle").append("animate")
        .attr("attributeName", "opacity")
        .attr("values", "1;0")
        .attr("dur", "1s")
        .attr("repeatCount", "indefinite");

      // Center Dot (Cyan)
      santaG.append("circle")
        .attr("r", 6)
        .attr("fill", "#00f3ff")
        .attr("stroke", "#050a0f")
        .attr("stroke-width", 2);

      // Santa Label
      const labelX = 15;
      const labelY = -15;
      santaG.append("line")
        .attr("x1", 6)
        .attr("y1", -6)
        .attr("x2", labelX)
        .attr("y2", labelY)
        .attr("stroke", "#00f3ff")
        .attr("stroke-width", 2);

      santaG.append("text")
        .attr("x", labelX + 2)
        .attr("y", labelY)
        .text("SANTA-01")
        .attr("fill", "#00f3ff")
        .attr("stroke", "#050a0f")
        .attr("stroke-width", "4px")
        .attr("stroke-linejoin", "round")
        .style("paint-order", "stroke")
        .attr("font-size", "14px")
        .attr("font-family", "'Share Tech Mono', monospace")
        .attr("font-weight", "bold")
        .style("text-transform", "uppercase");
    }

    // Auto-rotation for Globe
    if (isGlobe) {
      if (rotationRef.current) d3.timer(rotationRef.current).stop();
      const initialScale = projection.scale();

      const drag = d3.drag<SVGSVGElement, unknown>()
        .on("start", () => {
          if (rotationRef.current) {
            rotationRef.current.stop();
            rotationRef.current = null;
          }
        })
        .on("drag", (event) => {
          const rotate = projection.rotate();
          const k = 0.25;
          projection.rotate([rotate[0] + event.dx * k, rotate[1] - event.dy * k]);
          render();
        });

      const globeZoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 4])
        .on("zoom", (event) => {
          if (rotationRef.current) {
            rotationRef.current.stop();
            rotationRef.current = null;
          }
          projection.scale(initialScale * event.transform.k);
          render();
        });

      const render = () => {
        g.selectAll("path").attr("d", path as any);
        g.selectAll(".city-marker-group").each(function (d: any) {
          const c = projection([d.lng, d.lat]);
          const center = projection.invert!([width / 2, height / 2]);
          const dist = d3.geoDistance(center!, [d.lng, d.lat]);
          const visible = dist <= Math.PI / 2;
          d3.select(this)
            .attr("display", visible ? "block" : "none")
            .attr("transform", c ? `translate(${c[0]}, ${c[1]})` : null);
        });

        g.selectAll(".santa-marker-group").each(function () {
          if (!santaState) return;
          const c = projection([santaState.currentLocation.lng, santaState.currentLocation.lat]);
          const center = projection.invert!([width / 2, height / 2]);
          const dist = d3.geoDistance(center!, [santaState.currentLocation.lng, santaState.currentLocation.lat]);
          const visible = dist <= Math.PI / 2;
          d3.select(this)
            .attr("display", visible ? "block" : "none")
            .attr("transform", c ? `translate(${c[0]}, ${c[1]})` : null);
        });

        g.select(".graticule").attr("d", path);
        g.select("circle").attr("r", projection.scale());
      };

      svg.call(globeZoom)
        .on("mousedown.zoom", null)
        .on("touchstart.zoom", null)
        .on("touchmove.zoom", null)
        .on("touchend.zoom", null);

      svg.call(drag);

      const timer = d3.timer((elapsed) => {
        if (rotationRef.current === null) return;
        const rotate = projection.rotate();
        const k = 0.05;
        projection.rotate([rotate[0] + k, rotate[1]]);
        render();
      });

      rotationRef.current = timer;

      return () => {
        timer.stop();
        rotationRef.current = null;
        svg.on(".zoom", null);
        svg.on(".drag", null);
      };
    } else {
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([1, 8])
        .translateExtent([[0, 0], [width, height]])
        .on("zoom", (event) => {
          g.attr("transform", event.transform.toString());
          g.selectAll(".state-border, .country-border").attr("stroke-width", 1.5 / Math.sqrt(event.transform.k));
          g.selectAll(".city-marker-group, .santa-marker-group").attr("transform", function (d: any) {
            let lng, lat;
            if (d && d.lng !== undefined) {
              lng = d.lng;
              lat = d.lat;
            } else if (santaState) {
              lng = santaState.currentLocation.lng;
              lat = santaState.currentLocation.lat;
            } else {
              return null;
            }
            const [x, y] = projection([lng, lat]) || [0, 0];
            const scale = 1 / Math.pow(event.transform.k, 0.6);
            return `translate(${x}, ${y}) scale(${scale})`;
          });
        });
      svg.call(zoom);
    }
  }, [geoData, worldData, selectedCity, viewMode, santaState, trail]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden cursor-move">
      <div className="absolute inset-0 bg-grid pointer-events-none"></div>
      <svg ref={svgRef} className="w-full h-full relative z-10"></svg>
      <div className="absolute top-1/2 left-1/2 w-full h-[1px] bg-[#005f63]/30 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"></div>
      <div className="absolute top-1/2 left-1/2 h-full w-[1px] bg-[#005f63]/30 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"></div>
      <div className="absolute bottom-2 right-2 text-[10px] text-[#00f3ff] pointer-events-none z-20">
        {viewMode === 'GLOBE' ? 'AUTO-ROTATION ACTIVE' : 'SCROLL TO ZOOM // DRAG TO PAN'}
      </div>
    </div>
  );
};
