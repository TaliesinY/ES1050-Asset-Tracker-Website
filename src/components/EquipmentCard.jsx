import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Wifi, Battery, MapPin, Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EquipmentCard({ item }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'available':
        return { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: <CheckCircle2 className="w-3 h-3 mr-1" />, label: 'Available' };
      case 'in_use':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <Activity className="w-3 h-3 mr-1" />, label: 'In Use' };
      case 'maintenance':
        return { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: <ShieldAlert className="w-3 h-3 mr-1" />, label: 'Maintenance' };
      case 'offline':
        return { color: 'bg-slate-100 text-slate-800 border-slate-200', icon: <Wifi className="w-3 h-3 mr-1" />, label: 'Offline' };
      default:
        return { color: 'bg-slate-100 text-slate-800', icon: null, label: status };
    }
  };

  const statusConfig = getStatusConfig(item.status);
  
  // Calculate distance styling
  const distanceColor = item.distance < 5 ? 'text-emerald-600' : item.distance < 15 ? 'text-amber-600' : 'text-slate-400';
  const signalStrength = item.distance < 5 ? 3 : item.distance < 15 ? 2 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Link to={createPageUrl(`Tracker?id=${item.id}`)}>
        <Card className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white cursor-pointer group">
          <CardContent className="p-0">
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">{item.name}</h3>
                  <p className="text-sm text-slate-500 font-medium">{item.type}</p>
                </div>
                <Badge variant="outline" className={`${statusConfig.color} flex items-center font-medium px-2 py-1`}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-full bg-slate-50 ${distanceColor}`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">DISTANCE</p>
                    <p className={`font-semibold ${distanceColor}`}>
                      {item.distance != null ? `${item.distance.toFixed(1)}m` : 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-slate-50 text-slate-400">
                    <Battery className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">BATTERY</p>
                    <p className="font-semibold text-slate-700">
                      {item.battery != null ? `${item.battery}%` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-3 px-5 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5" />
                ESP32-C5 Sensor
              </span>
              <span>{item.department || 'Unassigned'}</span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}