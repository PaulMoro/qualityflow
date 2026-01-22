import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@2.5.2';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, sharedWithEmail, permissions, expiresAt } = await req.json();

    if (!projectId || !sharedWithEmail || !permissions) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Obtener datos del proyecto y accesos
    const project = await base44.asServiceRole.entities.Project.filter({ id: projectId });
    const projectAccess = await base44.asServiceRole.entities.ProjectAccess.filter({ project_id: projectId });

    if (!project.length || !projectAccess.length) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    const projectData = project[0];
    const accessData = projectAccess[0];

    // Generar token único y seguro
    const tokenArray = new Uint8Array(32);
    crypto.getRandomValues(tokenArray);
    const token = Array.from(tokenArray, byte => byte.toString(16).padStart(2, '0')).join('');

    // Crear documento PDF con los accesos
    const doc = new jsPDF();
    let yPos = 20;

    // Encabezado
    doc.setFontSize(18);
    doc.text('Accesos Compartidos', 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.text(`Proyecto: ${projectData.name}`, 20, yPos);
    yPos += 7;
    doc.text(`Compartido por: ${user.full_name || user.email}`, 20, yPos);
    yPos += 7;
    doc.text(`Compartido con: ${sharedWithEmail}`, 20, yPos);
    yPos += 7;
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, yPos);
    if (expiresAt) {
      yPos += 7;
      doc.text(`Expira: ${new Date(expiresAt).toLocaleDateString()}`, 20, yPos);
    }
    yPos += 7;
    doc.text(`Token: ${token}`, 20, yPos);
    yPos += 15;

    doc.setFontSize(12);

    // Hosting QA
    if (permissions.qa_hosting && accessData.qa_hosting_url) {
      doc.text('Hosting QA', 20, yPos);
      yPos += 7;
      doc.setFontSize(9);
      doc.text(`URL: ${accessData.qa_hosting_url || 'N/A'}`, 25, yPos);
      yPos += 5;
      doc.text(`Usuario: ${accessData.qa_hosting_user || 'N/A'}`, 25, yPos);
      yPos += 5;
      doc.text(`Contraseña: ${accessData.qa_hosting_password || 'N/A'}`, 25, yPos);
      yPos += 10;
      doc.setFontSize(12);
    }

    // Hosting Producción
    if (permissions.prod_hosting && accessData.prod_hosting_url) {
      doc.text('Hosting Producción', 20, yPos);
      yPos += 7;
      doc.setFontSize(9);
      doc.text(`URL: ${accessData.prod_hosting_url || 'N/A'}`, 25, yPos);
      yPos += 5;
      doc.text(`Usuario: ${accessData.prod_hosting_user || 'N/A'}`, 25, yPos);
      yPos += 5;
      doc.text(`Contraseña: ${accessData.prod_hosting_password || 'N/A'}`, 25, yPos);
      yPos += 10;
      doc.setFontSize(12);
    }

    // CMS QA
    if (permissions.cms_qa && accessData.cms_qa_url) {
      doc.text('CMS QA', 20, yPos);
      yPos += 7;
      doc.setFontSize(9);
      doc.text(`URL: ${accessData.cms_qa_url || 'N/A'}`, 25, yPos);
      yPos += 5;
      doc.text(`Usuario: ${accessData.cms_qa_user || 'N/A'}`, 25, yPos);
      yPos += 5;
      doc.text(`Contraseña: ${accessData.cms_qa_password || 'N/A'}`, 25, yPos);
      yPos += 10;
      doc.setFontSize(12);
    }

    // CMS Producción
    if (permissions.cms_prod && accessData.cms_prod_url) {
      doc.text('CMS Producción', 20, yPos);
      yPos += 7;
      doc.setFontSize(9);
      doc.text(`URL: ${accessData.cms_prod_url || 'N/A'}`, 25, yPos);
      yPos += 5;
      doc.text(`Usuario: ${accessData.cms_prod_user || 'N/A'}`, 25, yPos);
      yPos += 5;
      doc.text(`Contraseña: ${accessData.cms_prod_password || 'N/A'}`, 25, yPos);
      yPos += 10;
      doc.setFontSize(12);
    }

    // APIs
    if (permissions.apis && permissions.apis.length > 0) {
      doc.text('APIs', 20, yPos);
      yPos += 7;
      doc.setFontSize(9);
      
      const apis = accessData.apis || [];
      const filteredApis = apis.filter(api => permissions.apis.includes(api.name));
      
      for (const api of filteredApis) {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`• ${api.name}`, 25, yPos);
        yPos += 5;
        doc.text(`  URL: ${api.url || 'N/A'}`, 27, yPos);
        yPos += 5;
        doc.text(`  Usuario: ${api.user || 'N/A'}`, 27, yPos);
        yPos += 5;
        doc.text(`  Contraseña: ${api.password || 'N/A'}`, 27, yPos);
        yPos += 8;
      }
    }

    // Convertir PDF a blob
    const pdfBlob = doc.output('blob');
    const pdfBuffer = await pdfBlob.arrayBuffer();
    const pdfFile = new File([pdfBuffer], `accesos-${token}.pdf`, { type: 'application/pdf' });

    // Subir PDF
    const { file_url } = await base44.integrations.Core.UploadFile({ file: pdfFile });

    // Crear registro de acceso compartido
    const sharedAccess = await base44.asServiceRole.entities.SharedProjectAccess.create({
      project_id: projectId,
      shared_by: user.email,
      shared_with_email: sharedWithEmail,
      access_token: token,
      permissions,
      expires_at: expiresAt || null,
      is_active: true,
      document_url: file_url
    });

    // Registrar la acción
    await base44.asServiceRole.entities.AccessLog.create({
      project_id: projectId,
      shared_access_id: sharedAccess.id,
      accessed_by: user.email,
      action: 'token_generated',
      section: 'share_access'
    });

    // Enviar email con documento
    const appUrl = req.headers.get('origin') || '';
    await base44.integrations.Core.SendEmail({
      to: sharedWithEmail,
      subject: `Accesos compartidos - ${projectData.name}`,
      body: `${user.full_name || user.email} te ha compartido acceso al proyecto "${projectData.name}".\n\nToken de acceso: ${token}\n\nPuedes descargar el documento con todos los accesos aquí:\n${file_url}\n\nO ver los accesos en la aplicación:\n${appUrl}#/shared-accesses\n\n${expiresAt ? `Este acceso expira el: ${new Date(expiresAt).toLocaleDateString()}` : 'Este acceso no tiene fecha de expiración.'}`
    });

    return Response.json({ 
      success: true, 
      token,
      sharedAccessId: sharedAccess.id,
      documentUrl: file_url
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});