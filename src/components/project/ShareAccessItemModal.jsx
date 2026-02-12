import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Mail } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function ShareAccessItemModal({ isOpen, onClose, accessItem, projectId, projectName }) {
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [expirationDays, setExpirationDays] = useState('2');
  const queryClient = useQueryClient();

  const shareMutation = useMutation({
    mutationFn: async (data) => {
      // Generar token único
      const token = `access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = addDays(new Date(), parseInt(data.expirationDays));

      // Crear token en base de datos
      const tokenRecord = await base44.entities.ProjectAccessToken.create({
        project_id: projectId,
        access_item_id: accessItem.id,
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
        access_title: accessItem.title
      });

      return tokenRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-tokens', projectId] });
      toast.success('Acceso compartido y email enviado exitosamente');
      onClose();
      setRecipientName('');
      setRecipientEmail('');
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

    shareMutation.mutate({
      recipientName,
      recipientEmail,
      expirationDays
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[var(--bg-secondary)] border-[var(--border-primary)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[var(--text-primary)]">
            Compartir: {accessItem?.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-[var(--bg-tertiary)] p-3 rounded-lg border border-[var(--border-secondary)]">
            <p className="text-xs text-[var(--text-secondary)]">
              Se generará un enlace temporal seguro y se enviará automáticamente por email al destinatario.
            </p>
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
              disabled={shareMutation.isPending}
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