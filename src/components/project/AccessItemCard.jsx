import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff, Copy, Check, ExternalLink, Trash2, Share2, Save, Edit2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AccessItemCard({ item, onUpdate, onDelete, onShare, isEditing, onEditToggle }) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [formData, setFormData] = useState(item || {
    title: '',
    username: '',
    email: '',
    password: '',
    url: '',
    notes: ''
  });

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copiado al portapapeles');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSave = () => {
    if (!formData.title || !formData.password) {
      toast.error('El título y la contraseña son obligatorios');
      return;
    }
    onUpdate(formData);
  };

  if (isEditing) {
    return (
      <Card className="bg-[var(--bg-secondary)] border-[var(--border-primary)]">
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              {item ? 'Editar Acceso' : 'Nuevo Acceso'}
            </h3>
            <Button variant="ghost" size="icon" onClick={onEditToggle}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <Label className="text-xs">Título del acceso *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: Servidor Producción, Google Ads..."
              className="bg-[var(--bg-input)]"
            />
          </div>

          <div>
            <Label className="text-xs">Usuario</Label>
            <Input
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Nombre de usuario"
              className="bg-[var(--bg-input)]"
            />
          </div>

          <div>
            <Label className="text-xs">Correo electrónico</Label>
            <Input
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="correo@ejemplo.com"
              type="email"
              className="bg-[var(--bg-input)]"
            />
          </div>

          <div>
            <Label className="text-xs">Contraseña *</Label>
            <div className="relative">
              <Input
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
                className="bg-[var(--bg-input)] pr-10"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-xs">URL (opcional)</Label>
            <Input
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://..."
              className="bg-[var(--bg-input)]"
            />
          </div>

          <div>
            <Label className="text-xs">Notas</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionales..."
              className="bg-[var(--bg-input)] resize-none"
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="flex-1 bg-[#FF1B7E] hover:bg-[#e6156e]">
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
            {item && (
              <Button variant="outline" onClick={onEditToggle}>
                Cancelar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[var(--bg-secondary)] border-[var(--border-primary)] hover:border-[#FF1B7E]/30 transition-colors">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-[var(--text-primary)] mb-1">{item.title}</h3>
            {item.url && (
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-[#FF1B7E] hover:underline flex items-center gap-1"
              >
                {item.url}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onEditToggle}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-[#FF1B7E] hover:text-[#e6156e]"
              onClick={() => onShare(item)}
            >
              <Share2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-500 hover:text-red-700"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {item.username && (
            <div className="flex items-center justify-between py-1.5 px-2 bg-[var(--bg-tertiary)] rounded">
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Usuario</p>
                <p className="text-sm text-[var(--text-primary)]">{item.username}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => copyToClipboard(item.username, `username_${item.id}`)}
              >
                {copiedField === `username_${item.id}` ? 
                  <Check className="h-3 w-3 text-green-500" /> : 
                  <Copy className="h-3 w-3" />
                }
              </Button>
            </div>
          )}

          {item.email && (
            <div className="flex items-center justify-between py-1.5 px-2 bg-[var(--bg-tertiary)] rounded">
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Email</p>
                <p className="text-sm text-[var(--text-primary)]">{item.email}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => copyToClipboard(item.email, `email_${item.id}`)}
              >
                {copiedField === `email_${item.id}` ? 
                  <Check className="h-3 w-3 text-green-500" /> : 
                  <Copy className="h-3 w-3" />
                }
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between py-1.5 px-2 bg-[var(--bg-tertiary)] rounded">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[var(--text-secondary)]">Contraseña</p>
              <p className="text-sm text-[var(--text-primary)] font-mono truncate">
                {showPassword ? item.password : '••••••••'}
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => copyToClipboard(item.password, `password_${item.id}`)}
              >
                {copiedField === `password_${item.id}` ? 
                  <Check className="h-3 w-3 text-green-500" /> : 
                  <Copy className="h-3 w-3" />
                }
              </Button>
            </div>
          </div>

          {item.notes && (
            <div className="py-1.5 px-2 bg-[var(--bg-tertiary)] rounded">
              <p className="text-xs text-[var(--text-secondary)] mb-1">Notas</p>
              <p className="text-xs text-[var(--text-primary)]">{item.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}