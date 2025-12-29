import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, FileText, File, Image, Search } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const FILE_ICONS = {
  'application/vnd.google-apps.document': FileText,
  'application/vnd.google-apps.spreadsheet': FileText,
  'application/vnd.google-apps.presentation': FileText,
  'application/pdf': FileText,
  'image/': Image,
};

const getFileIcon = (mimeType) => {
  for (const [type, Icon] of Object.entries(FILE_ICONS)) {
    if (mimeType.startsWith(type)) return Icon;
  }
  return File;
};

export default function GoogleDrivePicker({ isOpen, onClose, onSelect }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('googleDrivePicker', {
        action: 'listFiles'
      });
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error cargando archivos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('googleDrivePicker', {
        action: 'getFileMetadata',
        fileId: selectedFile.id
      });
      
      onSelect({
        id: data.id,
        name: data.name,
        url: data.webViewLink,
        mimeType: data.mimeType,
        thumbnailLink: data.thumbnailLink
      });
      onClose();
    } catch (error) {
      console.error('Error seleccionando archivo:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-[#1a1a1a] border-[#2a2a2a] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Seleccionar archivo de Google Drive
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar archivos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-[#0a0a0a] border-[#2a2a2a] text-white placeholder:text-gray-500"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#FF1B7E]" />
            </div>
          ) : (
            <ScrollArea className="h-[400px] border border-[#2a2a2a] rounded-lg p-2">
              <div className="space-y-2">
                {filteredFiles.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-gray-600" />
                    <p>No se encontraron archivos</p>
                  </div>
                ) : (
                  filteredFiles.map((file) => {
                    const Icon = getFileIcon(file.mimeType);
                    const isSelected = selectedFile?.id === file.id;
                    
                    return (
                      <button
                        key={file.id}
                        onClick={() => setSelectedFile(file)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          isSelected 
                            ? 'bg-[#FF1B7E]/20 border-[#FF1B7E]' 
                            : 'bg-[#0a0a0a] border-[#2a2a2a] hover:bg-[#2a2a2a]/50'
                        }`}
                      >
                        <Icon className="h-5 w-5 text-gray-400" />
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            Modificado: {new Date(file.modifiedTime).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        {isSelected && (
                          <Badge className="bg-[#FF1B7E] text-white">
                            Seleccionado
                          </Badge>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="bg-white hover:bg-gray-100 text-black">
            Cancelar
          </Button>
          <Button 
            onClick={handleSelect} 
            disabled={!selectedFile || loading}
            className="bg-[#FF1B7E] hover:bg-[#e6156e] text-white"
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Seleccionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}