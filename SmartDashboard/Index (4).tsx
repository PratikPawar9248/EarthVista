import { motion } from 'framer-motion';
import { useState, useCallback, Suspense, lazy } from 'react';
import {
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Gauge,
  CloudRain,
  Cloud,
  Sun,
  RefreshCw
} from 'lucide-react';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import SatelliteStatusBar from '@/components/dashboard/SatelliteStatusBar';
import MetricCard from '@/components/dashboard/MetricCard';
import AIInsightsPanel from '@/components/dashboard/AIInsightsPanel';
import DataLayersPanel from '@/components/dashboard/DataLayersPanel';
import LiveDataChart from '@/components/dashboard/LiveDataChart';
import WeatherAlerts from '@/components/dashboard/WeatherAlerts';
import CitySearch from '@/components/dashboard/CitySearch';
import ConnectionStatus from '@/components/dashboard/ConnectionStatus';
import ErrorBoundary from '@/components/ErrorBoundary';
import { SkeletonCard } from '@/components/ui/skeleton-card';
import { useWeatherData } from '@/hooks/useWeatherData';
import { useRealtimeConnection } from '@/hooks/useRealtimeConnection';

// Lazy load heavy 3D component
const GlobeMap = lazy(() => import('@/components/dashboard/GlobeMap'));

const Index = () => {
  const [selectedLocation, setSelectedLocation] = useState({
    lat: 20.5937,
    lng: 78.9629,
    name: 'India',
  });

  const handleLocationChange = useCallback((location: { lat: number; lng: number; name: string }) => {
    setSelectedLocation(location);
  }, []);

  const { current, hourlyForecast, alerts, isLoading, locationName, refetch, dataSource } = useWeatherData(
    selectedLocation.lat,
    selectedLocation.lng
  );

  // Real-time connection status
  const { status: connectionStatus, latency, messagesReceived, reconnect } = useRealtimeConnection();

  // Format last updated time
  const lastUpdatedText = current?.lastUpdated
    ? new Date(current.lastUpdated).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    : '--:--';

  // Determine trend based on hourly forecast
  const getTrend = (metric: 'temperature' | 'humidity' | 'windSpeed' | 'pressure' | 'precipitation'): { trend: 'up' | 'down' | 'stable'; value: string } => {
    if (hourlyForecast.length < 2) return { trend: 'stable', value: '0' };

    const currentVal = hourlyForecast[0]?.[metric] ?? 0;
    const prevVal = hourlyForecast[1]?.[metric] ?? 0;
    const diff = currentVal - prevVal;

    if (Math.abs(diff) < 0.5) return { trend: 'stable', value: Math.abs(diff).toFixed(1) };
    return {
      trend: diff > 0 ? 'up' : 'down',
      value: Math.abs(diff).toFixed(1),
    };
  };

  // Determine status based on values
  const getTemperatureStatus = (temp: number): 'normal' | 'warning' | 'critical' => {
    if (temp > 40 || temp < 0) return 'critical';
    if (temp > 35 || temp < 5) return 'warning';
    return 'normal';
  };

  const getWindStatus = (speed: number): 'normal' | 'warning' | 'critical' => {
    if (speed > 60) return 'critical';
    if (speed > 40) return 'warning';
    return 'normal';
  };

  const getPrecipitationStatus = (precip: number): 'normal' | 'warning' | 'critical' => {
    if (precip > 10) return 'critical';
    if (precip > 5) return 'warning';
    return 'normal';
  };

  const tempTrend = getTrend('temperature');
  const humidityTrend = getTrend('humidity');
  const windTrend = getTrend('windSpeed');
  const pressureTrend = getTrend('pressure');
  const precipTrend = getTrend('precipitation');

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background grid-pattern">
        {/* Background effects */}
        <div className="fixed inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="fixed top-0 left-1/4 w-96 h-96 bg-glow-blue/10 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-glow-purple/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-4 lg:p-6 max-w-[1920px] mx-auto">
          {/* Header with Connection Status */}
          <DashboardHeader />

          {/* Connection Status Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-2 flex justify-end"
          >
            <ConnectionStatus
              status={connectionStatus}
              latency={latency}
              messagesReceived={messagesReceived}
              onReconnect={reconnect}
            />
          </motion.div>

          {/* City Search & Satellite Status Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4 flex flex-col md:flex-row items-start md:items-center gap-4"
          >
            <CitySearch
              onCitySelect={handleLocationChange}
              currentCity={selectedLocation.name}
            />
            <div className="flex-1 w-full">
              <SatelliteStatusBar />
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-12 gap-4">
            {/* Left Sidebar - Data Layers */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="col-span-12 lg:col-span-2 order-2 lg:order-1"
            >
              <div className="h-[400px] lg:h-[500px]">
                <DataLayersPanel />
              </div>
            </motion.div>

            {/* Center - Globe Map */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="col-span-12 lg:col-span-7 order-1 lg:order-2"
            >
              <div className="h-[400px] lg:h-[500px]">
                <Suspense fallback={<SkeletonCard variant="globe" className="h-full" />}>
                  <GlobeMap onLocationChange={handleLocationChange} selectedLocation={selectedLocation} />
                </Suspense>
              </div>

              {/* Location Info */}
              <motion.div
                key={locationName || selectedLocation.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 flex items-center justify-center gap-4"
              >
                <p className="text-sm text-muted-foreground">
                  <span className="text-primary font-mono font-semibold">{locationName || selectedLocation.name}</span>
                  {isLoading && <span className="ml-2 text-xs animate-pulse">(Updating...)</span>}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">Last updated: {lastUpdatedText}</span>
                  <button
                    onClick={refetch}
                    disabled={isLoading}
                    className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors disabled:opacity-50"
                    title="Refresh weather data"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-primary ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Sidebar - AI Insights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="col-span-12 lg:col-span-3 order-3"
            >
              <div className="h-[400px] lg:h-[500px]">
                <AIInsightsPanel
                  current={current}
                  hourlyForecast={hourlyForecast}
                  locationName={locationName || selectedLocation.name}
                />
              </div>
            </motion.div>
          </div>

          {/* Metrics Row - Using Real Data from OpenWeatherMap */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mt-4">
            <MetricCard
              title="Temperature"
              value={current?.temperature ?? 0}
              unit="°C"
              icon={Thermometer}
              trend={tempTrend.trend}
              trendValue={`${tempTrend.value}°`}
              status={current ? getTemperatureStatus(current.temperature) : 'normal'}
              delay={0}
            />
            <MetricCard
              title="Humidity"
              value={current?.humidity ?? 0}
              unit="%"
              icon={Droplets}
              trend={humidityTrend.trend}
              trendValue={`${humidityTrend.value}%`}
              status="normal"
              delay={1}
            />
            <MetricCard
              title="Wind Speed"
              value={current?.windSpeed ?? 0}
              unit="km/h"
              icon={Wind}
              trend={windTrend.trend}
              trendValue={`${windTrend.value} km/h`}
              status={current ? getWindStatus(current.windSpeed) : 'normal'}
              delay={2}
            />
            <MetricCard
              title="Visibility"
              value={current?.visibility ?? 10}
              unit="km"
              icon={Eye}
              trend="stable"
              trendValue="—"
              status={current && current.visibility < 5 ? 'warning' : 'normal'}
              delay={3}
            />
            <MetricCard
              title="Pressure"
              value={current?.pressure ?? 1013}
              unit="hPa"
              icon={Gauge}
              trend={pressureTrend.trend}
              trendValue={pressureTrend.value}
              status="normal"
              delay={4}
            />
            <MetricCard
              title="Precipitation"
              value={current?.precipitation ?? 0}
              unit="mm"
              icon={CloudRain}
              trend={precipTrend.trend}
              trendValue={`${precipTrend.value}mm`}
              status={current ? getPrecipitationStatus(current.precipitation) : 'normal'}
              delay={5}
            />
            <MetricCard
              title="Cloud Cover"
              value={current?.cloudCover ?? 0}
              unit="%"
              icon={Cloud}
              trend="stable"
              trendValue="—"
              status={current && current.cloudCover > 80 ? 'warning' : 'normal'}
              delay={6}
            />
            <MetricCard
              title="UV Index"
              value={current?.uvIndex ?? 0}
              unit=""
              icon={Sun}
              trend="stable"
              trendValue="—"
              status={current ? (current.uvIndex > 8 ? 'critical' : current.uvIndex > 5 ? 'warning' : 'normal') : 'normal'}
              delay={7}
            />
          </div>

          {/* Bottom Row - Charts & Alerts */}
          <div className="grid grid-cols-12 gap-4 mt-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="col-span-12 lg:col-span-8"
            >
              <div className="h-[350px]">
                <LiveDataChart hourlyForecast={hourlyForecast} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="col-span-12 lg:col-span-4"
            >
              <div className="h-[350px]">
                <WeatherAlerts alerts={alerts} locationName={locationName} />
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 py-4 border-t border-border/30"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>© {new Date().getFullYear()}  Smart Dashboard - Earth Observation System</span>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline">Data Source: Open-Meteo API (Real-time)</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="status-dot-live" />
                  <span>Live Data Connected</span>
                </div>
                <span>|</span>
                <span className="font-mono">v3.0.0</span>
              </div>
            </div>
          </motion.footer>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Index;
