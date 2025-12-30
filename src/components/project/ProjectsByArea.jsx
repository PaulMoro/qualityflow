import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Code, Search, TrendingUp, DollarSign, Share2, FolderKanban } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const AREAS = [
  { key: 'creativity', name: 'Creatividad', icon: Palette, color: 'bg-purple-500', textColor: 'text-purple-500' },
  { key: 'software', name: 'Software', icon: Code, color: 'bg-blue-500', textColor: 'text-blue-500' },
  { key: 'seo', name: 'SEO', icon: Search, color: 'bg-green-500', textColor: 'text-green-500' },
  { key: 'marketing', name: 'Marketing', icon: TrendingUp, color: 'bg-orange-500', textColor: 'text-orange-500' },
  { key: 'paid', name: 'Paid Media', icon: DollarSign, color: 'bg-yellow-500', textColor: 'text-yellow-500' },
  { key: 'social', name: 'Social Media', icon: Share2, color: 'bg-pink-500', textColor: 'text-pink-500' }
];

export default function ProjectsByArea() {
  const [selectedArea, setSelectedArea] = useState(null);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date')
  });

  const getProjectsByArea = (areaKey) => {
    return projects.filter(p => p.applicable_areas?.includes(areaKey));
  };

  const filteredProjects = selectedArea ? getProjectsByArea(selectedArea) : projects;

  return (
    <div className="space-y-6">
      {/* Filtros por área */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <motion.button
          onClick={() => setSelectedArea(null)}
          className={`p-6 rounded-xl border-2 transition-all ${
            selectedArea === null
              ? 'bg-[#FF1B7E]/10 border-[#FF1B7E]'
              : 'bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#FF1B7E]/30'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="flex flex-col items-center gap-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              selectedArea === null ? 'bg-[#FF1B7E]' : 'bg-[#2a2a2a]'
            }`}>
              <FolderKanban className={`h-6 w-6 ${selectedArea === null ? 'text-white' : 'text-gray-400'}`} />
            </div>
            <div className="text-center">
              <p className={`font-semibold text-sm ${selectedArea === null ? 'text-[#FF1B7E]' : 'text-white'}`}>
                Todos
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {projects.length} proyectos
              </p>
            </div>
          </div>
        </motion.button>

        {AREAS.map((area) => {
          const Icon = area.icon;
          const count = getProjectsByArea(area.key).length;
          const isSelected = selectedArea === area.key;

          return (
            <motion.button
              key={area.key}
              onClick={() => setSelectedArea(area.key)}
              className={`p-6 rounded-xl border-2 transition-all ${
                isSelected
                  ? `${area.color}/10 border-current ${area.textColor}`
                  : 'bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#2a2a2a]'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isSelected ? area.color : 'bg-[#2a2a2a]'
                }`}>
                  <Icon className={`h-6 w-6 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                </div>
                <div className="text-center">
                  <p className={`font-semibold text-sm ${isSelected ? area.textColor : 'text-white'}`}>
                    {area.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {count} {count === 1 ? 'proyecto' : 'proyectos'}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Lista de proyectos */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl h-32 animate-pulse" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
          <CardContent className="py-12 text-center">
            <FolderKanban className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              No hay proyectos en {selectedArea ? AREAS.find(a => a.key === selectedArea)?.name : 'esta área'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredProjects.map((project, index) => {
              const projectAreas = project.applicable_areas || [];
              
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={createPageUrl(`ProjectChecklist?id=${project.id}`)}>
                    <Card className="bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#FF1B7E]/50 transition-all cursor-pointer group">
                      <CardHeader>
                        <CardTitle className="text-base text-white group-hover:text-[#FF1B7E] transition-colors">
                          {project.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {project.description && (
                          <p className="text-sm text-gray-400 line-clamp-2">{project.description}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                          {projectAreas.map(areaKey => {
                            const area = AREAS.find(a => a.key === areaKey);
                            if (!area) return null;
                            const Icon = area.icon;
                            
                            return (
                              <Badge key={areaKey} className={`${area.color} text-white border-0 text-xs`}>
                                <Icon className="h-3 w-3 mr-1" />
                                {area.name}
                              </Badge>
                            );
                          })}
                        </div>
                        
                        <div className="flex items-center justify-between pt-2">
                          <Badge variant="outline" className="text-xs">
                            {Math.round(project.completion_percentage || 0)}% completado
                          </Badge>
                          <p className="text-xs text-gray-500">
                            {project.team_members?.length || 0} miembros
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}