import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function BulkAccessUpload({ projectId }) {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (items) => {
      const promises = items.map((item, index) => 
        base44.entities.ProjectAccessItem.create({
          ...item,
          project_id: projectId,
          order: index
        })
      );
      return await Promise.all(promises);
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['access-items', projectId] });
      toast.success(`${results.length} accesos cargados exitosamente`);
    },
    onError: (error) => {
      toast.error(`Error al cargar: ${error.message}`);
    }
  });

  const downloadTemplate = () => {
    const csv = 'titulo,usuario,correo,contraseña,url,notas\n' +
                'Servidor Producción,admin,admin@empresa.com,Pass123!,https://servidor.com,\n' +
                'Google Ads Cliente X,cliente_x,cliente@email.com,Ads#456,,Campaña activa';
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'plantilla_accesos.csv';
    link.click();
    toast.success('Plantilla descargada');
  };

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    
    // Validar headers requeridos
    const requiredHeaders = ['titulo', 'contraseña'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Columnas faltantes: ${missingHeaders.join(', ')}`);
    }

    const items = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim());
      const row = {};
      
      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });

      // Validaciones
      if (!row.titulo) {
        errors.push(`Fila ${i + 1}: Título obligatorio`);
        continue;
      }
      if (!row.contraseña) {
        errors.push(`Fila ${i + 1}: Contraseña obligatoria`);
        continue;
      }
      if (row.correo && !row.correo.includes('@')) {
        errors.push(`Fila ${i + 1}: Email inválido`);
        continue;
      }

      items.push({
        title: row.titulo,
        username: row.usuario || '',
        email: row.correo || '',
        password: row.contraseña,
        url: row.url || '',
        notes: row.notas || ''
      });
    }

    if (errors.length > 0) {
      throw new Error('Errores encontrados:\n' + errors.join('\n'));
    }

    return items;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const text = await file.text();
      const items = parseCSV(text);
      
      if (items.length === 0) {
        throw new Error('No se encontraron datos válidos en el archivo');
      }

      await uploadMutation.mutateAsync(items);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <Card className="bg-[var(--bg-secondary)] border-[var(--border-primary)]">
      <CardHeader>
        <CardTitle className="text-base text-[var(--text-primary)] flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Carga Masiva de Accesos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800">
              <p className="font-medium mb-1">Estructura del archivo CSV:</p>
              <p className="font-mono text-[10px]">titulo,usuario,correo,contraseña,url,notas</p>
              <p className="mt-2">
                • <strong>titulo</strong> y <strong>contraseña</strong> son obligatorios<br />
                • Otros campos son opcionales<br />
                • Descarga la plantilla para ver un ejemplo
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar Plantilla CSV
          </Button>

          <label className="flex-1">
            <Button
              variant="default"
              className="w-full bg-[#FF1B7E] hover:bg-[#e6156e]"
              disabled={uploading}
              asChild
            >
              <span>
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Cargando...' : 'Cargar CSV'}
              </span>
            </Button>
            <Input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>

        <p className="text-xs text-[var(--text-secondary)] text-center">
          También puedes exportar desde Google Sheets como CSV
        </p>
      </CardContent>
    </Card>
  );
}