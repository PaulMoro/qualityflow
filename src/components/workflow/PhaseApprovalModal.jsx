import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from 'lucide-react';

export default function PhaseApprovalModal({ phase, phaseKey, isOpen, onClose, onApprove }) {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset loading state when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setIsLoading(false);
      setNotes('');
    }
  }, [isOpen]);

  const handleApprove = async () => {
    if (!phaseKey || isLoading) return;
    
    setIsLoading(true);
    try {
      await onApprove(phaseKey, notes);
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Error in modal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!phase) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[var(--bg-secondary)] border-[var(--border-primary)] text-[var(--text-primary)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[var(--text-primary)]">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Aprobar Fase
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">
              Estás aprobando la fase:
            </p>
            <p className="font-semibold text-[var(--text-primary)] mt-1">
              {phase.name}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-[var(--text-secondary)]">Notas de Aprobación (Opcional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agrega comentarios sobre esta aprobación..."
              className="h-24 bg-[var(--bg-input)] border-[var(--border-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[#FF1B7E]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose} 
            disabled={isLoading} 
            className="border-[var(--border-primary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)]"
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            onClick={handleApprove} 
            disabled={isLoading} 
            className="bg-[#FF1B7E] hover:bg-[#e6156e] text-white"
          >
            {isLoading ? 'Aprobando...' : 'Aprobar Fase'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}