'use client';

import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

/**
 * Tour guiado de bienvenida (driver.js). Se dispara una sola vez, justo tras el
 * onboarding: la pagina de creacion de complejo redirige a `/?tour=1` y este
 * componente lo detecta. El parametro se elimina de la URL nada mas arrancar,
 * asi el tour no se repite al recargar.
 *
 * No se persiste ningun flag en localStorage/sessionStorage (regla de seguridad):
 * el disparo vive en el query param efimero, no en storage del navegador.
 */
export function OnboardingTour() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tour') !== '1') {
      return;
    }

    // Limpiar el parametro para que el tour no se repita en recargas posteriores.
    const url = new URL(window.location.href);
    url.searchParams.delete('tour');
    window.history.replaceState({}, '', url.toString());

    const tour = driver({
      showProgress: true,
      nextBtnText: 'Siguiente',
      prevBtnText: 'Atrás',
      doneBtnText: 'Entendido',
      steps: [
        {
          popover: {
            title: '¡Tu complejo está listo! 🎉',
            description:
              'Te mostramos en unos pasos dónde está cada cosa. Puedes saltarlo cuando quieras.',
          },
        },
        {
          element: '[data-tour="sidebar"]',
          popover: {
            title: 'Menú principal',
            description:
              'Desde aquí navegas entre Reservas, Canchas, Clientes, Pagos y Configuración.',
          },
        },
        {
          element: '[data-tour="nav-canchas"]',
          popover: {
            title: 'Empieza por tus Canchas',
            description:
              'Registra tus canchas con su tipo y tarifa. Sin canchas no se pueden crear reservas.',
          },
        },
        {
          element: '[data-tour="nueva-reserva"]',
          popover: {
            title: 'Crea reservas',
            description:
              'Cuando tengas canchas, podrás registrar reservas para tus clientes desde aquí.',
          },
        },
        {
          popover: {
            title: 'Todo listo',
            description:
              'Eso es lo esencial. Tu siguiente paso recomendado: crear tu primera cancha.',
          },
        },
      ],
    });

    tour.drive();

    return () => {
      tour.destroy();
    };
  }, []);

  return null;
}
