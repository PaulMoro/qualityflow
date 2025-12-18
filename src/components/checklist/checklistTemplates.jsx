// Plantillas de checklist por fase con configuración dinámica

export const PHASES = {
  documentation: { name: 'Documentación de Proyecto', icon: 'FileText', order: 1 },
  planning: { name: 'Planeación', icon: 'GitBranch', order: 2 },
  ux_ui: { name: 'UX / UI', icon: 'Palette', order: 3 },
  content: { name: 'Producto y Contenido', icon: 'FileText', order: 4 },
  technical: { name: 'Requerimientos Técnicos', icon: 'Code', order: 5 },
  development: { name: 'Desarrollo', icon: 'Code', order: 6 },
  performance: { name: 'Performance', icon: 'Zap', order: 7 },
  seo_accessibility: { name: 'SEO y Accesibilidad', icon: 'Search', order: 8 },
  responsive: { name: 'Responsive', icon: 'Smartphone', order: 9 },
  qa: { name: 'QA', icon: 'CheckSquare', order: 10 },
  security: { name: 'Seguridad', icon: 'Shield', order: 11 },
  delivery: { name: 'Entrega', icon: 'Rocket', order: 12 }
};

export const WEIGHT_CONFIG = {
  low: { label: 'Bajo', color: 'bg-slate-100 text-slate-700', priority: 1 },
  medium: { label: 'Medio', color: 'bg-blue-100 text-blue-700', priority: 2 },
  high: { label: 'Alto', color: 'bg-amber-100 text-amber-700', priority: 3 },
  critical: { label: 'Crítico', color: 'bg-red-100 text-red-700', priority: 4 }
};

export const SITE_TYPE_CONFIG = {
  landing: { name: 'Landing Page', criticalPhases: ['documentation', 'planning', 'ux_ui', 'content', 'responsive', 'performance'] },
  ecommerce: { name: 'E-commerce', criticalPhases: ['documentation', 'planning', 'ux_ui', 'technical', 'performance', 'qa', 'security'] },
  corporate: { name: 'Corporativo', criticalPhases: ['documentation', 'planning', 'ux_ui', 'content', 'seo_accessibility', 'responsive'] },
  blog: { name: 'Blog', criticalPhases: ['documentation', 'planning', 'content', 'seo_accessibility', 'performance', 'responsive'] },
  forms: { name: 'Formularios', criticalPhases: ['documentation', 'planning', 'technical', 'qa', 'security', 'development'] },
  webapp: { name: 'Web App', criticalPhases: ['documentation', 'planning', 'technical', 'security', 'qa', 'performance'] }
};

export const TECHNOLOGY_CONFIG = {
  wordpress: { name: 'WordPress', color: 'bg-blue-500' },
  webflow: { name: 'Webflow', color: 'bg-indigo-500' },
  custom: { name: 'Custom', color: 'bg-purple-500' },
  shopify: { name: 'Shopify', color: 'bg-green-500' }
};

export const ROLE_CONFIG = {
  developer: { name: 'Desarrollador', color: 'bg-purple-500', canComplete: ['development', 'technical', 'performance', 'security'] },
  qa: { name: 'QA', color: 'bg-green-500', canComplete: ['qa', 'responsive', 'seo_accessibility', 'ux_ui'] },
  web_leader: { name: 'Líder Web', color: 'bg-blue-500', canComplete: ['all'] },
  product_owner: { name: 'Product Owner', color: 'bg-amber-500', canComplete: ['documentation', 'planning', 'content', 'delivery'] },
  ux_ui: { name: 'UX/UI', color: 'bg-pink-500', canComplete: ['ux_ui', 'content'] }
};

// Plantilla base de checklist items
export const CHECKLIST_TEMPLATE = [
  // 1️⃣ DOCUMENTACIÓN DE PROYECTO
  { phase: 'documentation', title: 'Brief - Objetivo del sitio claramente definido', weight: 'critical', order: 1, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'documentation', title: 'Brief de Descubrimiento Tecnológico completo', weight: 'critical', order: 2, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'documentation', title: 'Alcance aprobado - Qué incluye / qué no incluye', weight: 'critical', order: 3, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'documentation', title: 'KPIs esperados definidos', weight: 'high', order: 4, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'documentation', title: 'URL de propuesta cargada', weight: 'high', order: 5, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'documentation', title: 'Propuesta coincide con el brief', weight: 'high', order: 6, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'documentation', title: 'Cronograma del Proyecto cargado (URL)', weight: 'critical', order: 7, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  
  // 2️⃣ PLANEACIÓN
  { phase: 'planning', title: 'Canal único de comunicación definido', weight: 'critical', order: 1, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'planning', title: 'Repositorio centralizado de insumos (URL carpeta)', weight: 'critical', order: 2, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'planning', title: 'Equipo completo asignado - UX', weight: 'high', order: 3, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'planning', title: 'Equipo completo asignado - UI', weight: 'high', order: 4, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'planning', title: 'Equipo completo asignado - DEV', weight: 'high', order: 5, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'planning', title: 'Equipo completo asignado - QA', weight: 'high', order: 6, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'planning', title: 'Equipo completo asignado - Líder Web', weight: 'high', order: 7, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'planning', title: 'Kickoff formal realizado', weight: 'critical', order: 8, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'planning', title: 'Acta de reunión kickoff cargada', weight: 'high', order: 9, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  
  // 3️⃣ UX / UI
  { phase: 'ux_ui', title: 'Wireframes aprobados', weight: 'critical', order: 1, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'ux_ui', title: 'Diseño final aprobado', weight: 'critical', order: 2, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'ux_ui', title: 'Diseño responsive (mobile, tablet, desktop)', weight: 'critical', order: 3, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'ux_ui', title: 'Estados especiales diseñados (error, hover, success)', weight: 'high', order: 4, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'ux_ui', title: 'Favicon incluido', weight: 'medium', order: 5, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'ux_ui', title: 'Referentes visuales / animaciones aprobadas', weight: 'medium', order: 6, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'ux_ui', title: 'Observaciones QA de diseño resueltas', weight: 'high', order: 7, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'ux_ui', title: 'Validación de accesibilidad realizada (si aplica)', weight: 'medium', order: 8, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'ux_ui', title: 'Acta de entrega a desarrollo firmada', weight: 'critical', order: 9, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'ux_ui', title: 'Reunión de handoff a desarrollo realizada', weight: 'high', order: 10, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'ux_ui', title: 'Pendientes y dudas de diseño documentados', weight: 'high', order: 11, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  
  // 4️⃣ PRODUCTO Y CONTENIDO
  { phase: 'content', title: 'Textos finales aprobados por cliente (no borradores)', weight: 'critical', order: 1, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'content', title: 'Textos revisados por Copy', weight: 'high', order: 2, technologies: ['all'], siteTypes: ['landing', 'corporate', 'blog'] },
  { phase: 'content', title: 'Textos revisados por SEO', weight: 'high', order: 3, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'content', title: 'Idioma(s) del sitio definidos', weight: 'high', order: 4, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'content', title: 'Material para traducción disponible (si aplica)', weight: 'medium', order: 5, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'content', title: 'Assets multimedia cargados en carpeta compartida', weight: 'critical', order: 6, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'content', title: 'Imágenes optimizadas y con nombres descriptivos', weight: 'high', order: 7, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  
  // 5️⃣ REQUERIMIENTOS TÉCNICOS
  { phase: 'technical', title: 'Dominio definido', weight: 'critical', order: 1, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'technical', title: 'Hosting / servidor confirmado', weight: 'critical', order: 2, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'technical', title: 'Accesos necesarios disponibles', weight: 'critical', order: 3, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'technical', title: 'Requerimientos de formularios documentados', weight: 'high', order: 4, technologies: ['all'], siteTypes: ['landing', 'corporate', 'forms'] },
  { phase: 'technical', title: 'Integraciones necesarias identificadas', weight: 'high', order: 5, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'technical', title: 'Requerimientos de CMS definidos', weight: 'high', order: 6, technologies: ['wordpress', 'webflow'], siteTypes: ['corporate', 'blog', 'ecommerce'] },
  { phase: 'technical', title: 'APIs y credenciales de terceros disponibles', weight: 'medium', order: 7, technologies: ['all'], siteTypes: ['ecommerce', 'webapp'] },
  
  // 6️⃣ DESARROLLO
  { phase: 'development', title: 'Código limpio y comentado', weight: 'medium', order: 1, technologies: ['custom'], siteTypes: ['all'] },
  { phase: 'development', title: 'Plugins/extensiones actualizados', weight: 'high', order: 2, technologies: ['wordpress', 'shopify'], siteTypes: ['all'] },
  { phase: 'development', title: 'Componentes reutilizables', weight: 'medium', order: 3, technologies: ['webflow', 'custom'], siteTypes: ['all'] },
  { phase: 'development', title: 'Validaciones de formularios', weight: 'critical', order: 4, technologies: ['all'], siteTypes: ['forms', 'ecommerce', 'webapp', 'landing', 'corporate'] },
  { phase: 'development', title: 'Manejo de errores implementado', weight: 'high', order: 5, technologies: ['all'], siteTypes: ['forms', 'ecommerce', 'webapp'] },
  { phase: 'development', title: 'Funcionalidades testeadas', weight: 'high', order: 6, technologies: ['all'], siteTypes: ['all'] },
  
  // 7️⃣ PERFORMANCE
  { phase: 'performance', title: 'Imágenes optimizadas', weight: 'critical', order: 1, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'performance', title: 'Lazy loading implementado', weight: 'high', order: 2, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'performance', title: 'Core Web Vitals > 90', weight: 'critical', order: 3, technologies: ['all'], siteTypes: ['landing', 'ecommerce'] },
  { phase: 'performance', title: 'CSS/JS minificado', weight: 'medium', order: 4, technologies: ['custom', 'wordpress'], siteTypes: ['all'] },
  { phase: 'performance', title: 'Caché configurado', weight: 'high', order: 5, technologies: ['wordpress', 'custom'], siteTypes: ['all'] },
  { phase: 'performance', title: 'CDN implementado', weight: 'medium', order: 6, technologies: ['all'], siteTypes: ['ecommerce', 'corporate'] },
  
  // 8️⃣ SEO Y ACCESIBILIDAD
  { phase: 'seo_accessibility', title: 'Meta tags configurados', weight: 'high', order: 1, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'seo_accessibility', title: 'Schema markup implementado', weight: 'medium', order: 2, technologies: ['all'], siteTypes: ['ecommerce', 'corporate', 'blog'] },
  { phase: 'seo_accessibility', title: 'Alt text en imágenes', weight: 'high', order: 3, technologies: ['all'], siteTypes: ['all'] },
  { phase: 'seo_accessibility', title: 'Estructura de headings correcta', weight: 'high', order: 4, technologies: ['all'], siteTypes: ['all'] },
  { phase: 'seo_accessibility', title: 'Contraste de colores WCAG', weight: 'high', order: 5, technologies: ['all'], siteTypes: ['all'] },
  { phase: 'seo_accessibility', title: 'Navegación por teclado', weight: 'medium', order: 6, technologies: ['all'], siteTypes: ['all'] },
  { phase: 'seo_accessibility', title: 'Sitemap XML generado', weight: 'medium', order: 7, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  
  // 9️⃣ RESPONSIVE
  { phase: 'responsive', title: 'Mobile first implementado', weight: 'high', order: 1, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'responsive', title: 'Breakpoints testeados', weight: 'critical', order: 2, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'responsive', title: 'Touch targets adecuados', weight: 'high', order: 3, technologies: ['all'], siteTypes: ['all'] },
  { phase: 'responsive', title: 'Imágenes responsive', weight: 'high', order: 4, technologies: ['all'], siteTypes: ['all'] },
  { phase: 'responsive', title: 'Menú mobile funcional', weight: 'critical', order: 5, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  
  // 🔟 QA
  { phase: 'qa', title: 'Cross-browser testing', weight: 'high', order: 1, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'qa', title: 'Links verificados (no rotos)', weight: 'high', order: 2, technologies: ['all'], siteTypes: ['all'] },
  { phase: 'qa', title: 'Formularios testeados end-to-end', weight: 'critical', order: 3, technologies: ['all'], siteTypes: ['forms', 'ecommerce', 'webapp', 'landing', 'corporate'] },
  { phase: 'qa', title: 'Flujo de compra verificado', weight: 'critical', order: 4, technologies: ['all'], siteTypes: ['ecommerce'] },
  { phase: 'qa', title: 'Contenido revisado (ortografía)', weight: 'medium', order: 5, technologies: ['all'], siteTypes: ['all'] },
  { phase: 'qa', title: 'Analytics configurado', weight: 'high', order: 6, technologies: ['all'], siteTypes: ['landing', 'ecommerce', 'corporate', 'blog'] },
  { phase: 'qa', title: 'Conversiones trackeadas', weight: 'high', order: 7, technologies: ['all'], siteTypes: ['landing', 'ecommerce'] },
  
  // 1️⃣1️⃣ SEGURIDAD
  { phase: 'security', title: 'SSL/HTTPS activo', weight: 'critical', order: 1, technologies: ['all'], siteTypes: ['all'] },
  { phase: 'security', title: 'Protección contra spam', weight: 'high', order: 2, technologies: ['all'], siteTypes: ['forms', 'blog', 'landing', 'corporate'] },
  { phase: 'security', title: 'Backups configurados', weight: 'high', order: 3, technologies: ['wordpress', 'custom'], siteTypes: ['all'] },
  { phase: 'security', title: 'Datos sensibles protegidos', weight: 'critical', order: 4, technologies: ['all'], siteTypes: ['ecommerce', 'forms', 'webapp'] },
  { phase: 'security', title: 'Actualizaciones de seguridad', weight: 'high', order: 5, technologies: ['wordpress'], siteTypes: ['all'] },
  { phase: 'security', title: 'Pasarela de pago segura', weight: 'critical', order: 6, technologies: ['all'], siteTypes: ['ecommerce'] },
  
  // 1️⃣2️⃣ ENTREGA
  { phase: 'delivery', title: 'Documentación técnica entregada', weight: 'high', order: 1, technologies: ['all'], siteTypes: ['all'] },
  { phase: 'delivery', title: 'Capacitación al cliente realizada', weight: 'medium', order: 2, technologies: ['wordpress', 'webflow'], siteTypes: ['all'] },
  { phase: 'delivery', title: 'Credenciales entregadas de forma segura', weight: 'high', order: 3, technologies: ['all'], siteTypes: ['all'] },
  { phase: 'delivery', title: 'Plan de mantenimiento acordado', weight: 'medium', order: 4, technologies: ['all'], siteTypes: ['all'] },
  { phase: 'delivery', title: 'Aprobación final del cliente', weight: 'critical', order: 5, technologies: ['all'], siteTypes: ['all'] },
  { phase: 'delivery', title: 'Reporte de QA final entregado', weight: 'high', order: 6, technologies: ['all'], siteTypes: ['all'] }
];

// Función para generar checklist filtrado
export function generateFilteredChecklist(siteType, technology) {
  const criticalPhases = SITE_TYPE_CONFIG[siteType]?.criticalPhases || [];
  
  return CHECKLIST_TEMPLATE.filter(item => {
    const techMatch = item.technologies.includes('all') || item.technologies.includes(technology);
    const siteMatch = item.siteTypes.includes('all') || item.siteTypes.includes(siteType);
    return techMatch && siteMatch;
  }).map(item => {
    // Aumentar peso si la fase es crítica para este tipo de sitio
    let adjustedWeight = item.weight;
    if (criticalPhases.includes(item.phase)) {
      if (item.weight === 'medium') adjustedWeight = 'high';
      if (item.weight === 'high') adjustedWeight = 'critical';
    }
    return { ...item, weight: adjustedWeight };
  });
}

// Función para calcular riesgo del proyecto
export function calculateProjectRisk(items, project) {
  const total = items.length;
  const completed = items.filter(i => i.status === 'completed').length;
  const criticalPending = items.filter(i => i.weight === 'critical' && i.status !== 'completed').length;
  const highPending = items.filter(i => i.weight === 'high' && i.status !== 'completed').length;
  const conflicts = items.filter(i => i.status === 'conflict').length;
  
  const completionRate = total > 0 ? (completed / total) * 100 : 0;
  
  let riskLevel = 'low';
  let reasons = [];
  let recommendations = [];
  
  if (criticalPending > 0) {
    riskLevel = 'high';
    reasons.push(`${criticalPending} ítem(s) crítico(s) pendiente(s)`);
    recommendations.push('Completar todos los ítems críticos antes de entregar');
  }
  
  if (conflicts > 0) {
    riskLevel = riskLevel === 'low' ? 'medium' : 'high';
    reasons.push(`${conflicts} conflicto(s) sin resolver`);
    recommendations.push('Resolver conflictos con el líder web');
  }
  
  if (highPending > 3) {
    riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
    reasons.push(`${highPending} ítems de alta prioridad pendientes`);
    recommendations.push('Priorizar ítems de alta importancia');
  }
  
  if (completionRate < 50) {
    riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
    reasons.push(`Solo ${completionRate.toFixed(0)}% completado`);
    recommendations.push('Acelerar progreso del proyecto');
  }
  
  // Verificar fecha de entrega
  if (project?.target_date) {
    const daysRemaining = Math.ceil((new Date(project.target_date) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysRemaining < 0) {
      riskLevel = 'high';
      reasons.push('Fecha de entrega vencida');
      recommendations.push('Renegociar fecha de entrega');
    } else if (daysRemaining < 3 && completionRate < 80) {
      riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
      reasons.push(`Solo ${daysRemaining} días restantes`);
      recommendations.push('Enfocar esfuerzos en ítems críticos');
    }
  }
  
  if (reasons.length === 0) {
    reasons.push('Proyecto en buen estado');
    recommendations.push('Continuar con el plan actual');
  }
  
  return {
    level: riskLevel,
    completionRate,
    criticalPending,
    highPending,
    conflicts,
    reasons,
    recommendations,
    canDeliver: criticalPending === 0 && conflicts === 0
  };
}