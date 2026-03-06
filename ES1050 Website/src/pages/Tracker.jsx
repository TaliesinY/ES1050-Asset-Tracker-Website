import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import RadarView from '../components/RadarView';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Battery, Activity, Info, Clock, CheckCircle2, ShieldAlert, Wifi } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function Tracker() {
  const urlParams = new URLSearchParams(window.location.search);
  const equipmentId = urlParams.get('id');

  const { data: equipment, isLoading } = useQuery({
    queryKey: ['equipment', equipmentId],
    queryFn: () => base44.entities.Equipment.get(equipmentId),
    enabled: !!equipmentId,
    refetchInterval: 1000, // Fast polling for radar UI
  });

  if (!equipmentId) {
    return <div className="p-8 text-center text-slate-500">No equipment ID provided.</div>;
  }

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Locating sensor...</div>;
  }

  if (!equipment) {
    return <div className="p-8 text-center text-red-500">Equipment not found or sensor offline.</div>;
  }

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'available': return { color: 'bg-emerald-500', text: 'Available', icon: CheckCircle2 };
      case 'in_use': return { color: 'bg-blue-500', text: 'In Use', icon: Activity };
      case 'maintenance': return { color: 'bg-amber-500', text: 'Maintenance', icon: ShieldAlert };
      default: return { color: 'bg-slate-500', text: 'Offline', icon: Wifi };
    }
  };

  const statusInfo = getStatusDisplay(equipment.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm border border-slate-200">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            {equipment.name}
            <Badge variant="outline" className="ml-2 font-normal text-xs uppercase tracking-wide bg-white">
              {equipment.type}
            </Badge>
          </h1>
          <p className="text-slate-500 flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${statusInfo.color}`}></div>
              {statusInfo.text}
            </span>
            <span>•</span>
            <span>{equipment.department || 'Unassigned'}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Radar Section */}
        <Card className="lg:col-span-2 border-0 shadow-lg bg-white overflow-hidden rounded-2xl">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wifi className="w-5 h-5 text-blue-500" />
                Live Tracker
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Sensor Active
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 flex flex-col items-center justify-center bg-slate-950 rounded-b-2xl">
            <RadarView distance={equipment.distance} status={equipment.status} />
            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm uppercase tracking-widest mb-1">Estimated Distance</p>
              <p className="text-4xl font-light text-white font-mono">
                {equipment.distance != null ? `${equipment.distance.toFixed(2)}m` : 'Scanning...'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Details Section */}
        <div className="space-y-6">
          <Card className="border-0 shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="w-5 h-5 text-slate-400" />
                Asset Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Current Status</p>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${statusInfo.color} bg-opacity-10`}>
                    <StatusIcon className={`w-5 h-5 text-${statusInfo.color.split('-')[1]}-600`} />
                  </div>
                  <span className="font-semibold text-lg">{statusInfo.text}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Battery</p>
                  <div className="flex items-center gap-2">
                    <Battery className={`w-5 h-5 ${equipment.battery > 20 ? 'text-emerald-500' : 'text-red-500'}`} />
                    <span className="font-semibold text-lg">{equipment.battery}%</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Last Ping</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-slate-400" />
                    <span className="font-medium text-sm">
                      {equipment.last_ping ? format(new Date(equipment.last_ping), 'HH:mm:ss') : 'Just now'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Button className="w-full rounded-xl h-12 bg-blue-600 hover:bg-blue-700">
                  Update Asset Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}