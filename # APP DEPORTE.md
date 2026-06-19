# APP DEPORTE

## Master Project Context Document

Version: 1.0

---

# 1. VISIÓN DEL PROYECTO

APP DEPORTE es una plataforma deportiva enfocada inicialmente en fútbol amateur que conecta:

* Jugadores
* Peñas deportivas
* Organizadores
* Canchas
* Campos deportivos
* Torneos
* Árbitros

La aplicación busca convertirse en el ecosistema deportivo amateur más completo de Latinoamérica.

---

# 2. PROBLEMA

Actualmente las peñas y grupos deportivos gestionan sus actividades mediante:

* WhatsApp
* Excel
* Cuadernos
* Transferencias manuales
* Coordinación informal

Esto genera:

* Falta de control financiero
* Dificultad para organizar partidos
* Ausencia de estadísticas históricas
* Mala gestión de cuotas
* Baja fidelización de jugadores
* Falta de métricas deportivas

---

# 3. SOLUCIÓN

Crear una plataforma centralizada que permita:

## Para jugadores

* Perfil deportivo
* Historial de partidos
* Estadísticas personales
* Ranking
* Logros
* Reservar canchas
* Participar en torneos

## Para peñas

* Gestión de miembros
* Gestión de cuotas
* Gestión de gastos
* Gestión de ingresos
* Organización de eventos
* Estadísticas grupales

## Para canchas

* Calendario de reservas
* Cobros
* Gestión de clientes
* Dashboard de ocupación
* Integración con agentes IA

---

# 4. OBJETIVO DEL MVP

Construir un MVP funcional que valide:

1. Registro de usuarios
2. Registro de peñas
3. Registro de partidos
4. Rankings básicos
5. Gestión de cuotas
6. Reserva de canchas
7. Panel administrativo

---

# 5. MODELO DE NEGOCIO

## B2C

Jugadores Premium

Beneficios:

* Estadísticas avanzadas
* Historial ilimitado
* Ranking nacional
* Logros especiales

Suscripción mensual.

---

## B2B

Peñas

Planes:

* Básico
* Profesional
* Enterprise

Beneficios:

* Gestión financiera
* Rankings
* IA
* Torneos

---

## B2B2C

Campos deportivos

Planes mensuales.

Beneficios:

* Reservas
* Automatización
* Agentes IA
* Analítica

---

# 6. MÓDULOS PRINCIPALES

## Módulo Usuarios

### Funciones

* Registro
* Login
* Recuperar contraseña
* Perfil
* Foto
* Estadísticas

---

## Módulo Peñas

### Funciones

* Crear peña
* Invitar miembros
* Gestionar miembros
* Registrar pagos
* Registrar gastos
* Ranking interno

---

## Módulo Partidos

### Funciones

* Crear partido
* Confirmar asistencia
* Registrar resultado
* Registrar goles
* Registrar tarjetas

---

## Módulo Rankings

### Métricas

* Goles
* Asistencias
* Victorias
* MVP
* Partidos jugados

---

## Módulo Reservas

### Funciones

* Buscar canchas
* Ver disponibilidad
* Reservar
* Cancelar
* Pagar

---

## Módulo Pagos

### Funciones

* Cuotas
* Reservas
* Torneos

Métodos:

* Yape
* Plin
* Tarjetas
* Stripe

---

# 7. VISIÓN FUTURA CON IA

La IA será el principal diferenciador.

---

## IA 1: Asistente para Peñas

Funciones:

* Cobro automático de cuotas
* Seguimiento de morosos
* Resúmenes financieros
* Estadísticas automáticas

Ejemplo:

"¿Quién debe cuotas este mes?"

Respuesta automática.

---

## IA 2: Asistente para Campos

Funciones:

* Reservas automáticas
* Atención al cliente
* Recordatorios
* Upselling

Ejemplo:

"Quiero una cancha para mañana a las 8 PM"

La IA gestiona la reserva completa.

---

## IA 3: Asistente para Jugadores

Funciones:

* Consultar estadísticas
* Ranking
* Historial
* Próximos partidos

---

# 8. SISTEMA DE VISIÓN ARTIFICIAL

Objetivo:

Automatizar estadísticas mediante cámaras e IA.

---

## Flujo

1. Usuario se registra.
2. Usuario sube fotografía.
3. Se genera embedding facial.
4. Cámaras detectan jugadores.
5. IA identifica participantes.
6. IA registra estadísticas.

---

## Métricas Futuras

* Goles
* Asistencias
* Distancia recorrida
* Velocidad
* Tiempo de posesión

---

# 9. ARQUITECTURA TÉCNICA

## Frontend

Stack:

* Next.js
* React
* TypeScript
* TailwindCSS
* Shadcn UI

---

## Backend

Stack:

* NestJS
* TypeScript

Arquitectura:

* Modular
* Clean Architecture
* DDD

---

## Base de Datos

PostgreSQL

ORM:

* Prisma

---

## Cache

Redis

---

## Almacenamiento

AWS S3

---

## Autenticación

JWT

OAuth

Google Login

Microsoft Login

---

# 10. ENTIDADES PRINCIPALES

## User

* id
* name
* email
* photo
* role
* createdAt

---

## Peña

* id
* name
* description
* ownerId

---

## Member

* id
* userId
* peñaId

---

## Match

* id
* peñaId
* date
* location
* result

---

## Goal

* id
* playerId
* matchId

---

## Reservation

* id
* fieldId
* date
* startTime
* endTime

---

## Payment

* id
* amount
* status
* payerId

---

# 11. ROLES

## Super Admin

Control total.

---

## Field Owner

Administra canchas.

---

## Peña Admin

Administra peñas.

---

## Player

Usuario final.

---

# 12. ROADMAP

## Fase 1

MVP

* Usuarios
* Peñas
* Partidos
* Rankings

---

## Fase 2

Monetización

* Suscripciones
* Reservas
* Pagos

---

## Fase 3

IA Conversacional

* Agentes para peñas
* Agentes para canchas

---

## Fase 4

Computer Vision

* Cámaras
* Reconocimiento facial
* Estadísticas automáticas

---

## Fase 5

Escalamiento LATAM

* Perú
* Chile
* Colombia
* México

---

# 13. REGLAS PARA CODEX

Siempre:

* Utilizar TypeScript.
* Seguir Clean Architecture.
* Aplicar principios SOLID.
* Generar código modular.
* Crear tests unitarios.
* Crear documentación Swagger.
* Utilizar Prisma para acceso a datos.
* Utilizar DTOs.
* Utilizar validaciones robustas.
* Evitar lógica duplicada.
* Mantener escalabilidad SaaS multi-tenant.

Cuando existan varias opciones técnicas:

Elegir siempre la solución más escalable para soportar más de 100,000 usuarios activos.

---

# 14. OBJETIVO FINAL

Convertirse en la principal plataforma deportiva amateur de Latinoamérica combinando:

* Gestión deportiva
* Reservas
* Finanzas
* Rankings
* IA
* Computer Vision
* Automatización empresarial
* Comunidad deportiva
