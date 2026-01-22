import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Share2, Calendar, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareAccessModal({ isOpen, onClose, projectId, projectAccess }) {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [generatedToken, setGeneratedToken] = useState(null);
  
  const [formData, setFormData] = useState({
    recipient_name: '',
    recipient_email: '',
    expires_in_days: 30,
    permissions: {
      qa_hosting: false,
      prod_hosting: false,
      cms_qa: false,
      cms_prod: false,
      apis: []
    }
  });

  const generateTokenMutation = useMutation({
    mutationFn: async (data) => {
      const token = crypto.randomUUID();
      const expiresAt = data.expires_in_days 
        ? new Date(Date.now() + data.expires_in_days * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const tokenData = {
        project_id: projectId,
        token,
        recipient_name: data.recipient_name,
        recipient_email: data.recipient_email || null,
        permissions: data.permissions,
        expires_at: expiresAt,
        is_revoked: false,
        access_count: 0
      };

      return await base44.entities.ProjectAccessToken.create(tokenData);
    },
    onSuccess: (data) => {
      setGeneratedToken(data);
      queryClient.invalidateQueries({ queryKey: ['access-tokens', projectId] });
      toast.success('Token de acceso generado');
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const handleGenerate = () => {
    if (!formData.recipient_name) {
      toast.error('Ingresa el nombre del destinatario');
      return;
    }

    const hasPermissions = Object.values(formData.permissions).some(v => 
      Array.isArray(v) ? v.length > 0 : v === true
    );

    if (!hasPermissions) {
      toast.error('Selecciona al menos un acceso para compartir');
      return;
    }

    generateTokenMutation.mutate(formData);
  };

  const handleApiToggle = (index) => {
    const apis = formData.permissions.apis.includes(index)
      ? formData.permissions.apis.filter(i => i !== index)
      : [...formData.permissions.apis, index];
    
    setFormData({
      ...formData,
      permissions: { ...formData.permissions, apis }
    });
  };

  const shareUrl = generatedToken 
    ? `${window.location.origin}/SharedAccess?token=${generatedToken.token}`
    : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('URL copiada al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setFormData({
      recipient_name: '',
      recipient_email: '',
      expires_in_days: 30,
      permissions: {
        qa_hosting: false,
        prod_hosting: false,
        cms_qa: false,
        cms_prod: false,
        apis: []
      }
    });
    setGeneratedToken(null);
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-[#FF1B7E]" />
            Compartir Accesos
          </DialogTitle>
          <DialogDescription>
            Genera un enlace seguro para compartir accesos específicos de este proyecto
          </DialogDescription>
        </DialogHeader>

        {!generatedToken ? (
          <div className="space-y-5 py-4">
            {/* Información del destinatario */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[var(--text-primary)]">Destinatario</h3>
              <div>
                <Label className="text-xs">Nombre *</Label>
                <Input
                  value={formData.recipient_name}
                  onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                  placeholder="Nombre completo"
                  className="bg-[var(--bg-input)]"
                />
              </div>
              <div>
                <Label className="text-xs">Email (opcional)</Label>
                <Input
                  type="email"
                  value={formData.recipient_email}
                  onChange={(e) => setFormData({ ...formData, recipient_email: e.target.value })}
                  placeholder="email@ejemplo.com"
                  className="bg-[var(--bg-input)]"
                />
              </div>
            </div>

            {/* Duración */}
            <div>
              <Label className="text-xs flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                Expira en (días)
              </Label>
              <Input
                type="number"
                value={formData.expires_in_days}
                onChange={(e) => setFormData({ ...formData, expires_in_days: parseInt(e.target.value) || 30 })}
                min="1"
                max="365"
                className="bg-[var(--bg-input)]"
              />
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                El acceso expirará automáticamente después de este período
              </p>
            </div>

            {/* Permisos */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[var(--text-primary)]">Selecciona qué accesos compartir</h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.permissions.qa_hosting}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, qa_hosting: checked }
                    })}
                  />
                  <Label className="text-sm cursor-pointer">
                    Hosting QA
                    {projectAccess?.qa_hosting_url && (
                      <span className="text-xs text-[var(--text-tertiary)] ml-2">
                        ({projectAccess.qa_hosting_url})
                      </span>
                    )}
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.permissions.prod_hosting}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, prod_hosting: checked }
                    })}
                  />
                  <Label className="text-sm cursor-pointer">
                    Hosting Producción
                    {projectAccess?.prod_hosting_url && (
                      <span className="text-xs text-[var(--text-tertiary)] ml-2">
                        ({projectAccess.prod_hosting_url})
                      </span>
                    )}
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.permissions.cms_qa}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, cms_qa: checked }
                    })}
                  />
                  <Label className="text-sm cursor-pointer">
                    CMS QA
                    {projectAccess?.cms_qa_url && (
                      <span className="text-xs text-[var(--text-tertiary)] ml-2">
                        ({projectAccess.cms_qa_url})
                      </span>
                    )}
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.permissions.cms_prod}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, cms_prod: checked }
                    })}
                  />
                  <Label className="text-sm cursor-pointer">
                    CMS Producción
                    {projectAccess?.cms_prod_url && (
                      <span className="text-xs text-[var(--text-tertiary)] ml-2">
                        ({projectAccess.cms_prod_url})
                      </span>
                    )}
                  </Label>
                </div>
              </div>

              {/* APIs */}
              {projectAccess?.apis && projectAccess.apis.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[var(--border-primary)]">
                  <Label className="text-sm font-medium">APIs</Label>
                  {projectAccess.apis.map((api, index) => (
                    <div key={index} className="flex items-center gap-2 ml-4">
                      <Checkbox
                        checked={formData.permissions.apis.includes(index)}
                        onCheckedChange={() => handleApiToggle(index)}
                      />
                      <Label className="text-sm cursor-pointer">
                        {api.name || `API ${index + 1}`}
                        {api.url && (
                          <span className="text-xs text-[var(--text-tertiary)] ml-2">
                            ({api.url})
                          </span>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm text-green-800 dark:text-green-200 font-medium mb-2">
                ✓ Token generado exitosamente
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                Comparte este enlace con {generatedToken.recipient_name}
              </p>
            </div>

            <div>
              <Label className="text-xs mb-2 block">URL de acceso compartido</Label>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="bg-[var(--bg-tertiary)] font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2 text-xs text-[var(--text-secondary)]">
              <p>• El enlace expira el {new Date(generatedToken.expires_at).toLocaleDateString()}</p>
              <p>• Solo podrá ver los accesos que seleccionaste</p>
              <p>• No podrá editar ni compartir estos accesos</p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-primary)]">
          <Button variant="outline" onClick={handleClose}>
            {generatedToken ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!generatedToken && (
            <Button
              onClick={handleGenerate}
              disabled={generateTokenMutation.isPending}
              className="bg-[#FF1B7E] hover:bg-[#e6156e]"
            >
              {generateTokenMutation.isPending ? 'Generando...' : 'Generar Token'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}