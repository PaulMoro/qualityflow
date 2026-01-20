import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { taskId, projectId } = await req.json();

    // Obtener información de la tarea
    const tasks = await base44.entities.Task.filter({ id: taskId, project_id: projectId });
    const task = tasks[0];
    
    if (!task) {
      return Response.json({ error: 'Tarea no encontrada' }, { status: 404 });
    }

    // Obtener proyecto
    const projects = await base44.entities.Project.filter({ id: projectId });
    const project = projects[0];

    // Obtener token de Google Calendar
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');

    // Crear evento en Google Calendar
    const eventStartDate = task.due_date || new Date().toISOString().split('T')[0];
    const eventEndDate = task.due_date || new Date().toISOString().split('T')[0];

    const calendarEvent = {
      summary: task.title,
      description: `Proyecto: ${project?.name}\n\n${task.description || ''}`,
      start: {
        date: eventStartDate
      },
      end: {
        date: eventEndDate
      }
    };

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(calendarEvent)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error creando evento en Google Calendar: ${error}`);
    }

    const eventData = await response.json();

    return Response.json({ 
      success: true, 
      eventLink: eventData.htmlLink,
      message: 'Tarea agregada al calendario de Google' 
    });
  } catch (error) {
    console.error('Error en addTaskToGoogleCalendar:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});