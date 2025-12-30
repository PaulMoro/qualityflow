import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Loader2 } from 'lucide-react';

const GOOGLE_API_KEY = 'AIzaSyCkR9kgTPHoyP37z3rKpF4HBjT5f1DqPMM';
const GOOGLE_CLIENT_ID = '879882925174-f5o6vd9u3qlkqr6r5k9e7l3d0q5j4n3c.apps.googleusercontent.com';

export default function GoogleDrivePicker({ isOpen, onClose, onSelect }) {
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [pickerInited, setPickerInited] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadGooglePicker();
    }
  }, [isOpen]);

  const loadGooglePicker = async () => {
    setLoading(true);
    try {
      // Obtener access token del usuario
      const token = await base44.connectors.getAccessToken('googledrive');
      setAccessToken(token);
      
      // Cargar Google Picker API
      if (!window.gapi) {
        await loadScript('https://apis.google.com/js/api.js');
      }
      
      if (!window.google?.picker) {
        await loadScript('https://accounts.google.com/gsi/client');
      }
      
      setPickerInited(true);
      openPicker(token);
    } catch (error) {
      console.error('Error loading Google Picker:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  };

  const openPicker = (token) => {
    if (!window.google?.picker) return;
    
    const picker = new window.google.picker.PickerBuilder()
      .addView(window.google.picker.ViewId.DOCS)
      .setOAuthToken(token)
      .setDeveloperKey(GOOGLE_API_KEY)
      .setCallback((data) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const file = data.docs[0];
          onSelect({
            id: file.id,
            name: file.name,
            url: file.url,
            mimeType: file.mimeType,
            thumbnailLink: file.iconUrl
          });
          onClose();
        }
      })
      .build();
    
    picker.setVisible(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#1a1a1a] border-[#2a2a2a] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4285F4] to-[#34A853] flex items-center justify-center shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            Google Drive
          </DialogTitle>
          <p className="text-sm text-gray-400 mt-2">Selecciona un archivo de tu cuenta</p>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-[#4285F4] mb-4" />
            <p className="text-sm text-gray-400">Abriendo Google Drive...</p>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4285F4]/10 to-[#34A853]/10 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-10 w-10 text-[#4285F4]" />
            </div>
            <p className="text-sm text-gray-300">
              Se abrirá una ventana de Google Drive para seleccionar archivos
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}