import { db } from '../src/db';
import { emails, ticketMessages, ticketEvents, user } from '../src/db/schema';

async function seedTestEmails() {
  console.log('🌱 Seeding test emails...\n');

  try {
    // Get first user or create a test user
    let testUser = await db.select().from(user).limit(1);
    
    if (testUser.length === 0) {
      console.log('Creating test user...');
      testUser = await db.insert(user).values({
        id: 'test-user-1',
        name: 'Test Agent',
        email: 'agent@hawkmail.local',
        emailVerified: true,
        role: 'agent',
      }).returning();
    }

    const userId = testUser[0].id;
    console.log(`✅ Using user: ${testUser[0].email}\n`);

    // Clear existing test data
    console.log('🧹 Cleaning old test data...');
    await db.delete(ticketMessages).execute();
    await db.delete(ticketEvents).execute();
    
    // Also clear test emails to reset IDs
    console.log('🧹 Cleaning old emails...');
    await db.delete(emails).execute();
    
    // Email 1: Billing inquiry (simple)
    console.log('📧 Creating Email 1: Billing Inquiry...');
    const email1 = await db.insert(emails).values({
      userId: userId,
      subject: 'Consulta sobre facturación',
      senderEmail: 'cliente1@empresa.com',
      recipientEmail: 'soporte@hawkmail.local',
      bodyContent: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Hola,</p>
          <p>Tengo una duda sobre mi factura del mes pasado. El cargo aparece duplicado.</p>
          <p>¿Podrían revisar y confirmar?</p>
          <p>Gracias,<br>
          <strong>Juan Pérez</strong><br>
          Cliente Premium</p>
        </div>
      `,
      receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: 'pending',
      priority: 'medium',
      slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isResolved: false,
      threadId: 'thread-001',
      rawHeaders: JSON.stringify({
        messageId: '<msg-001@empresa.com>',
        from: 'Juan Pérez <cliente1@empresa.com>',
        to: 'soporte@hawkmail.local',
        subject: 'Consulta sobre facturación',
      }),
    }).returning();

    // Create initial message for email 1
    await db.insert(ticketMessages).values({
      ticketId: email1[0].id.toString(),
      threadId: 'thread-001',
      isInternal: false,
      senderName: 'Juan Pérez',
      senderEmail: 'cliente1@empresa.com',
      recipientEmail: 'soporte@hawkmail.local',
      subject: 'Consulta sobre facturación',
      htmlContent: email1[0].bodyContent || '',
      textContent: 'Hola, Tengo una duda sobre mi factura del mes pasado. El cargo aparece duplicado.',
      messageId: '<msg-001@empresa.com>',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: false,
    });

    await db.insert(ticketEvents).values({
      ticketId: email1[0].id.toString(),
      eventType: 'created',
      title: 'Ticket creado',
      description: 'Nuevo ticket recibido de cliente1@empresa.com',
      createdBy: 'system',
    });

    // Email 2: Technical support (with thread/replies)
    console.log('📧 Creating Email 2: Technical Support with Thread...');
    const email2 = await db.insert(emails).values({
      userId: userId,
      subject: 'Re: Error al iniciar sesión',
      senderEmail: 'maria.garcia@tech.com',
      recipientEmail: 'soporte@hawkmail.local',
      bodyContent: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Hola equipo de soporte,</p>
          <p>Sigo sin poder acceder a mi cuenta. He intentado restablecer la contraseña pero no recibo el correo.</p>
          <p><strong>Detalles del error:</strong></p>
          <ul>
            <li>Usuario: maria.garcia@tech.com</li>
            <li>Navegador: Chrome 120</li>
            <li>Error: "Invalid credentials"</li>
          </ul>
          <p>Por favor, ¿pueden revisar mi cuenta?</p>
          <p>Saludos,<br>María García</p>
          
          <blockquote style="border-left: 3px solid #e2e8f0; padding-left: 12px; margin: 16px 0; color: #64748b;">
            <p><strong>De:</strong> Soporte Hawkmail<br>
            <strong>Fecha:</strong> Ayer 3:45 PM</p>
            <p>Hola María, hemos recibido tu reporte. ¿Has intentado limpiar las cookies del navegador?</p>
          </blockquote>
        </div>
      `,
      receivedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      status: 'open',
      priority: 'high',
      slaDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000),
      isResolved: false,
      firstReplyAt: new Date(Date.now() - 30 * 60 * 1000),
      threadId: 'thread-002',
      rawHeaders: JSON.stringify({
        messageId: '<msg-002-reply@tech.com>',
        inReplyTo: '<msg-002-initial@hawkmail.local>',
        references: '<msg-002-initial@hawkmail.local>',
        from: 'María García <maria.garcia@tech.com>',
        to: 'soporte@hawkmail.local',
        subject: 'Re: Error al iniciar sesión',
      }),
    }).returning();

    // Initial message from customer
    const msg2_1 = await db.insert(ticketMessages).values({
      ticketId: email2[0].id.toString(),
      threadId: 'thread-002',
      isInternal: false,
      senderName: 'María García',
      senderEmail: 'maria.garcia@tech.com',
      recipientEmail: 'soporte@hawkmail.local',
      subject: 'Error al iniciar sesión',
      htmlContent: '<p>No puedo acceder a mi cuenta. ¿Pueden ayudarme?</p>',
      textContent: 'No puedo acceder a mi cuenta. ¿Pueden ayudarme?',
      messageId: '<msg-002-initial@tech.com>',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isRead: true,
    }).returning();

    // Agent reply
    await db.insert(ticketMessages).values({
      ticketId: email2[0].id.toString(),
      threadId: 'thread-002',
      parentId: msg2_1[0].id,
      isInternal: false,
      senderId: userId,
      senderName: 'Soporte Hawkmail',
      senderEmail: 'soporte@hawkmail.local',
      recipientEmail: 'maria.garcia@tech.com',
      subject: 'Re: Error al iniciar sesión',
      htmlContent: '<p>Hola María, hemos recibido tu reporte. ¿Has intentado limpiar las cookies del navegador?</p>',
      textContent: 'Hola María, hemos recibido tu reporte. ¿Has intentado limpiar las cookies del navegador?',
      messageId: '<msg-002-initial@hawkmail.local>',
      inReplyTo: '<msg-002-initial@tech.com>',
      timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000),
      isRead: true,
    });

    // Customer follow-up (current)
    await db.insert(ticketMessages).values({
      ticketId: email2[0].id.toString(),
      threadId: 'thread-002',
      parentId: msg2_1[0].id,
      isInternal: false,
      senderName: 'María García',
      senderEmail: 'maria.garcia@tech.com',
      recipientEmail: 'soporte@hawkmail.local',
      subject: 'Re: Error al iniciar sesión',
      htmlContent: email2[0].bodyContent || '',
      textContent: 'Sigo sin poder acceder. No recibo el correo de restablecimiento.',
      messageId: '<msg-002-reply@tech.com>',
      inReplyTo: '<msg-002-initial@hawkmail.local>',
      references: '<msg-002-initial@tech.com> <msg-002-initial@hawkmail.local>',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      isRead: false,
    });

    await db.insert(ticketEvents).values([
      {
        ticketId: email2[0].id.toString(),
        eventType: 'created',
        title: 'Ticket creado',
        description: 'Nuevo ticket de soporte técnico',
        createdBy: 'system',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        ticketId: email2[0].id.toString(),
        eventType: 'replied',
        title: 'Respuesta enviada',
        description: 'Soporte Hawkmail respondió al cliente',
        createdBy: userId,
        createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
      },
      {
        ticketId: email2[0].id.toString(),
        eventType: 'status_changed',
        title: 'Estado cambiado',
        description: 'Estado cambiado de "pending" a "open"',
        createdBy: userId,
        createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
      },
    ]);

    // Email 3: Feature request (urgent)
    console.log('📧 Creating Email 3: Feature Request (Urgent)...');
    const email3 = await db.insert(emails).values({
      userId: userId,
      subject: '🔥 URGENTE: Necesitamos integración con Slack',
      senderEmail: 'carlos.mendez@startup.io',
      recipientEmail: 'soporte@hawkmail.local',
      bodyContent: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Estimado equipo,</p>
          <p><strong>Urgente:</strong> Necesitamos integrar notificaciones con Slack lo antes posible.</p>
          <p><strong>Contexto:</strong></p>
          <p>Somos un equipo de 50 personas y necesitamos:</p>
          <ol>
            <li>Notificaciones de nuevos tickets en canal #support</li>
            <li>Alertas de SLA en canal #alerts</li>
            <li>Resumen diario de métricas</li>
          </ol>
          <p style="background: #fef3c7; padding: 12px; border-left: 4px solid #f59e0b;">
            ⚠️ <strong>Nota:</strong> Este es un requisito crítico para renovar el contrato enterprise.
          </p>
          <p>¿Cuándo podrían tenerlo listo?</p>
          <p>Saludos,<br>
          <strong>Carlos Méndez</strong><br>
          CTO @ Startup.io<br>
          📱 +52 55 1234 5678</p>
        </div>
      `,
      receivedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
      status: 'pending',
      priority: 'urgent',
      slaDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000),
      isResolved: false,
      threadId: 'thread-003',
      rawHeaders: JSON.stringify({
        messageId: '<msg-003@startup.io>',
        from: 'Carlos Méndez <carlos.mendez@startup.io>',
        to: 'soporte@hawkmail.local',
        subject: '🔥 URGENTE: Necesitamos integración con Slack',
      }),
    }).returning();

    await db.insert(ticketMessages).values({
      ticketId: email3[0].id.toString(),
      threadId: 'thread-003',
      isInternal: false,
      senderName: 'Carlos Méndez',
      senderEmail: 'carlos.mendez@startup.io',
      recipientEmail: 'soporte@hawkmail.local',
      subject: '🔥 URGENTE: Necesitamos integración con Slack',
      htmlContent: email3[0].bodyContent || '',
      textContent: 'URGENTE: Necesitamos integración con Slack para equipo de 50 personas.',
      messageId: '<msg-003@startup.io>',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isRead: false,
    });

    await db.insert(ticketEvents).values({
      ticketId: email3[0].id.toString(),
      eventType: 'created',
      title: 'Ticket urgente creado',
      description: 'Feature request de cliente enterprise',
      createdBy: 'system',
    });

    // Internal note example
    await db.insert(ticketMessages).values({
      ticketId: email3[0].id.toString(),
      threadId: 'thread-003',
      isInternal: true,
      senderId: userId,
      senderName: 'Test Agent',
      senderEmail: 'agent@hawkmail.local',
      recipientEmail: 'agent@hawkmail.local',
      subject: 'Internal: Review enterprise client request',
      htmlContent: '<p><strong>Nota interna:</strong> Cliente enterprise, prioridad máxima. Coordinar con equipo de producto.</p>',
      textContent: 'Nota interna: Cliente enterprise, prioridad máxima.',
      messageId: `<internal-${Date.now()}@hawkmail.local>`,
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      isRead: true,
    });

    await db.insert(ticketEvents).values({
      ticketId: email3[0].id.toString(),
      eventType: 'note_added',
      title: 'Nota interna agregada',
      description: 'Test Agent agregó una nota sobre el cliente enterprise',
      createdBy: userId,
      createdAt: new Date(Date.now() - 15 * 60 * 1000),
    });

    console.log('\n✅ Test emails created successfully!');
    console.log('\n📊 Summary:');
    console.log('  - Email 1: Simple billing inquiry (pending)');
    console.log('  - Email 2: Technical support with thread (3 messages, open)');
    console.log('  - Email 3: Urgent feature request + internal note (pending)');
    console.log('\n🚀 Navigate to:');
    console.log('  - http://localhost:3001/tickets');
    console.log('  - http://localhost:3001/tickets/' + email1[0].id);
    console.log('  - http://localhost:3001/tickets/' + email2[0].id);
    console.log('  - http://localhost:3001/tickets/' + email3[0].id);

  } catch (error) {
    console.error('❌ Error seeding test emails:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  seedTestEmails()
    .then(() => {
      console.log('\n✅ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to seed:', error);
      process.exit(1);
    });
}

export { seedTestEmails };
