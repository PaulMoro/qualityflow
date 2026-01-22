import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ExternalLink, Eye, EyeOff, Copy, Check, Lock, AlertCircle, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function SharedAccess() {
  const [token, setToken] = useState('');
  const [access, setAccess] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({});
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setToken(urlToken);
      validateToken(urlToken);
    }
  }, []);

  const handleManualValidation = () => {
    if (!token) {
      toast.error('Ingresa un token válido');
      return;
    }
    validateToken(token);
  };

  const validateToken = async (tokenValue) => {
    setLoading(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('validateAccessToken', { token: tokenValue });
      
      if (response.data.success) {
        setAccess(response.data.access);
      } else {
        setError(response.data.error || 'Token inválido');
      }
    } catch (err) {
      setError('Error al validar el token. Verifica que sea correcto.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copiado al portapapeles');
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF1B7E] mx-auto mb-4" />
          <p className="text-sm text-[var(--text-secondary)]">Validando acceso...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6">
        <Card className="max-w-md w-full bg-[var(--bg-secondary)] border-[var(--border-primary)]">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  Acceso denegado
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">{error}</p>
              </div>
              <div className="pt-4 text-xs text-[var(--text-tertiary)] space-y-1">
                <p>Posibles razones:</p>
                <ul className="list-disc list-inside">
                  <li>El token ha expirado</li>
                  <li>El token fue revocado</li>
                  <li>El enlace es incorrecto</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!access) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6">
        <Card className="max-w-md w-full bg-[var(--bg-secondary)] border-[var(--border-primary)]">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Shield className="h-5 w-5 text-[#FF1B7E]" />
              Acceso Seguro a Proyecto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-[var(--text-secondary)] text-center">
              Ingresa el token que recibiste para ver los accesos compartidos
            </p>
            <div>
              <Label>Token de acceso</Label>
              <Input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="font-mono text-xs"
              />
            </div>
            <Button
              onClick={handleManualValidation}
              disabled={!token || loading}
              className="w-full bg-[#FF1B7E] hover:bg-[#e6156e]"
            >
              {loading ? 'Validando...' : 'Validar Acceso'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderAccessCard = (title, badgeColor, data, fieldPrefix) => {
    if (!data) return null;

    return (
      <Card className="bg-[var(--bg-secondary)] border-[var(--border-primary)]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Badge className={badgeColor}>{badgeColor.includes('blue') ? 'QA' : 'PROD'}</Badge>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.url && (
            <div>
              <Label className="text-xs">URL</Label>
              <div className="flex gap-2">
                <Input
                  value={data.url}
                  readOnly
                  className="bg-[var(--bg-tertiary)] text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(data.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          {data.user && (
            <div>
              <Label className="text-xs">Usuario</Label>
              <div className="relative">
                <Input
                  value={data.user}
                  readOnly
                  className="bg-[var(--bg-tertiary)] pr-10 text-xs"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => copyToClipboard(data.user, `${fieldPrefix}_user`)}
                >
                  {copiedField === `${fieldPrefix}_user` ? 
                    <Check className="h-4 w-4 text-green-500" /> : 
                    <Copy className="h-4 w-4" />
                  }
                </Button>
              </div>
            </div>
          )}
          {data.password && (
            <div>
              <Label className="text-xs">Contraseña</Label>
              <div className="relative">
                <Input
                  value={data.password}
                  type={showPasswords[fieldPrefix] ? 'text' : 'password'}
                  readOnly
                  className="bg-[var(--bg-tertiary)] pr-20 text-xs"
                />
                <div className="absolute top-1/2 -translate-y-1/2 right-1 flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => togglePasswordVisibility(fieldPrefix)}
                  >
                    {showPasswords[fieldPrefix] ? 
                      <EyeOff className="h-4 w-4" /> : 
                      <Eye className="h-4 w-4" />
                    }
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => copyToClipboard(data.password, `${fieldPrefix}_pass`)}
                  >
                    {copiedField === `${fieldPrefix}_pass` ? 
                      <Check className="h-4 w-4 text-green-500" /> : 
                      <Copy className="h-4 w-4" />
                    }
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                {access.project_name || 'Proyecto Compartido'}
              </h1>
              <p className="text-sm text-[var(--text-secondary)]">
                Accesos compartidos con: <span className="font-medium">{access.recipient_name}</span>
              </p>
            </div>
            <Badge className="bg-[#FF1B7E]">
              <Lock className="h-3 w-3 mr-1" />
              Solo lectura
            </Badge>
          </div>

          {/* Token visible */}
          <div className="mt-4">
            <Label className="text-xs text-[var(--text-secondary)]">Token de acceso</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={token}
                readOnly
                className="bg-[var(--bg-tertiary)] font-mono text-xs"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(token, 'token')}
              >
                {copiedField === 'token' ? 
                  <Check className="h-4 w-4 text-green-500" /> : 
                  <Copy className="h-4 w-4" />
                }
              </Button>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              <Shield className="h-3 w-3 inline mr-1" />
              Estos accesos fueron compartidos de forma segura. Solo puedes visualizarlos, no editarlos ni compartirlos.
            </p>
          </div>
        </div>

        {/* Accesos */}
        <div className="space-y-4">
          {access.data.qa_hosting && renderAccessCard(
            'Hosting QA',
            'bg-blue-500',
            access.data.qa_hosting,
            'qa_hosting'
          )}

          {access.data.prod_hosting && renderAccessCard(
            'Hosting Producción',
            'bg-green-500',
            access.data.prod_hosting,
            'prod_hosting'
          )}

          {access.data.cms_qa && renderAccessCard(
            'CMS QA',
            'bg-blue-500',
            access.data.cms_qa,
            'cms_qa'
          )}

          {access.data.cms_prod && renderAccessCard(
            'CMS Producción',
            'bg-green-500',
            access.data.cms_prod,
            'cms_prod'
          )}

          {access.data.apis && access.data.apis.length > 0 && (
            <Card className="bg-[var(--bg-secondary)] border-[var(--border-primary)]">
              <CardHeader>
                <CardTitle className="text-base">APIs Compartidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {access.data.apis.map((api, index) => (
                  <Card key={index} className="bg-[var(--bg-tertiary)] border-[var(--border-secondary)]">
                    <CardContent className="pt-4 space-y-3">
                      <h4 className="font-medium text-sm text-[var(--text-primary)]">
                        {api.name || `API ${index + 1}`}
                      </h4>
                      {renderAccessCard(null, null, api, `api_${index}`).props.children[1]}
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}