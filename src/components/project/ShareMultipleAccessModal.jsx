import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, AlertCircle } from 'lucide-react';
import { addDays } from 'date-fns';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function ShareMultipleAccessModal({ isOpen, onClose, accessItems, projectId, projectName }) {
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [expirationDays, setExpirationDays] = useState('2');
  const [selectedItems, setSelectedItems] = useState([]);
  const queryClient = useQueryClient();

  const shareMutation = useMutation({
    mutationFn: async (data) => {
      // Generar token único
      const token = `access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = addDays(new Date(), parseInt(data.expirationDays));

      // Crear token en base de datos
      const tokenRecord = await base44.entities.ProjectAccessToken.create({
        project_id: projectId,
        access_item_ids: data.selectedItems,
        token: token,
        recipient_email: data.recipientEmail,
        recipient_name: data.recipientName,
        expires_at: expiresAt.toISOString(),
        is_revoked: false,
        access_count: 0
      });

      // Enviar email automáticamente
      await base44.functions.invoke('sendAccessTokenEmail', {
        token: token,
        recipient_email: data.recipientEmail,
        recipient_name: data.recipientName,
        project_name: projectName,
        access_count: data.selectedItems.length
      });

      return tokenRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-tokens', projectId] });
      toast.success('Accesos compartidos y email enviado exitosamente');
      onClose();
      setRecipientName('');
      setRecipientEmail('');
      setSelectedItems([]);
      setExpirationDays('2');
    },
    onError: (error) => {
      toast.error(`Error al compartir: ${error.message}`);
    }
  });

  const handleShare = () => {
    if (!recipientName || !recipientEmail) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (!recipientEmail.includes('@')) {
      toast.error('Email inválido');
      return;
    }

    if (selectedItems.length === 0) {
      toast.error('Selecciona al menos un acceso para compartir');
      return;
    }

    shareMutation.mutate({
      recipientName,
      recipientEmail,
      expirationDays,
      selectedItems
    });
  };

  const toggleItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleAll = () => {
    if (selectedItems.length === accessItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(accessItems.map(item => item.id));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[var(--bg-secondary)] border-[var(--border-primary)] sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[var(--text-primary)]">
            Compartir Múltiples Accesos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-[var(--bg-tertiary)] p-3 rounded-lg border border-[var(--border-secondary)]">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[var(--text-secondary)]">
                Selecciona los accesos que deseas compartir. Se generará un enlace único y se enviará por email automáticamente.
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs">Seleccionar accesos</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAll}
                className="h-6 text-xs"
              >
                {selectedItems.length === accessItems.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </Button>
            </div>
            <div className="border border-[var(--border-primary)] rounded-lg p-2 max-h-48 overflow-y-auto space-y-2">
              {accessItems.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 hover:bg-[var(--bg-hover)] rounded cursor-pointer"
                  onClick={() => toggleItem(item.id)}
                >
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => toggleItem(item.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {item.title}
                    </p>
                    {item.username && (
                      <p className="text-xs text-[var(--text-secondary)] truncate">
                        {item.username}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {selectedItems.length > 0 && (
              <p className="text-xs text-[var(--text-secondary)] mt-2">
                {selectedItems.length} acceso{selectedItems.length !== 1 ? 's' : ''} seleccionado{selectedItems.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div>
            <Label className="text-xs">Nombre del destinatario *</Label>
            <Input
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Juan Pérez"
              className="bg-[var(--bg-input)]"
            />
          </div>

          <div>
            <Label className="text-xs">Email del destinatario *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
              <Input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="bg-[var(--bg-input)] pl-10"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Expiración</Label>
            <Select value={expirationDays} onValueChange={setExpirationDays}>
              <SelectTrigger className="bg-[var(--bg-input)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">24 horas</SelectItem>
                <SelectItem value="2">48 horas</SelectItem>
                <SelectItem value="7">7 días</SelectItem>
                <SelectItem value="30">30 días</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleShare}
              disabled={shareMutation.isPending || selectedItems.length === 0}
              className="flex-1 bg-[#FF1B7E] hover:bg-[#e6156e]"
            >
              <Mail className="h-4 w-4 mr-2" />
              {shareMutation.isPending ? 'Enviando...' : 'Compartir y Enviar Email'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}