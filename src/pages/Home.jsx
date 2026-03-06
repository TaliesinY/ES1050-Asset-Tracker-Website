import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import EquipmentCard from '../components/EquipmentCard';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Radio, MapPin, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: equipmentList = [], isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list(),
    refetchInterval: 3000,
  });

  const { data: recentPings = [] } = useQuery({
    queryKey: ['sensor-pings'],
    queryFn: () => base44.entities.SensorPing.list('-created_date', 5),
    refetchInterval: 3000,
  });

  const filteredEquipment = useMemo(() => {
    return equipmentList
      .filter(item => {
        const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.type?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => (a.distance || 999) - (b.distance || 999)); // Sort by closest first
  }, [equipmentList, searchQuery, filterStatus]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* Live Sensor Feed Banner */}
      {recentPings.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-slate-700">Live Sensor Feed</span>
            <Badge variant="outline" className="text-xs ml-auto text-slate-500">Last {recentPings.length} pings</Badge>
          </div>
          <div className="space-y-2">
            {recentPings.map(ping => (
              <div key={ping.id} className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-xl">
                <Radio className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="font-mono text-xs text-slate-400 shrink-0">{ping.device_id}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ping.room || ping.bssid}</span>
                <span className="flex items-center gap-1 text-emerald-600 font-medium ml-auto shrink-0">
                  <Wifi className="w-3 h-3" />{ping.dist != null ? `${parseFloat(ping.dist).toFixed(1)}m` : '—'}
                </span>
                <span className="text-xs text-slate-400 shrink-0">
                  {ping.created_date ? formatDistanceToNow(new Date(ping.created_date), { addSuffix: true }) : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input 
            placeholder="Search equipment by name or type..." 
            className="pl-10 h-12 bg-white border-slate-200 shadow-sm rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="all" value={filterStatus} onValueChange={setFilterStatus} className="w-full sm:w-auto">
          <TabsList className="bg-white border border-slate-200 h-12 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="all" className="rounded-lg px-4 data-[state=active]:bg-slate-100">All</TabsTrigger>
            <TabsTrigger value="available" className="rounded-lg px-4 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">Available</TabsTrigger>
            <TabsTrigger value="in_use" className="rounded-lg px-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">In Use</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-600" />
          <p className="font-medium">Scanning for sensors...</p>
        </div>
      ) : filteredEquipment.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">No equipment found</h3>
          <p className="text-slate-500 mt-1 max-w-sm mx-auto">
            We couldn't find any medical equipment matching your current filters within range.
          </p>
          <Button 
            variant="outline" 
            className="mt-6 rounded-xl"
            onClick={() => { setSearchQuery(''); setFilterStatus('all'); }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEquipment.map((item) => (
            <EquipmentCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}