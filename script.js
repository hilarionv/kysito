// Année dans le footer
document.getElementById('year').textContent = new Date().getFullYear();

// Hero : bascule vidéo desktop/mobile <-> image de repli
// ---------------------------------------------------------
// Le <video> a deux <source> (desktop paysage / mobile portrait).
// Tant qu'aucun des deux fichiers n'existe (ou ne charge pas), on
// garde l'image de repli affichée. Dès qu'une vidéo est prête à
// jouer, on la montre et on masque l'image + le badge "Vidéo à venir".
// -> Il suffit de déposer hero-desktop.mp4 et hero-mobile.mp4 dans
//    le dossier /videos pour que ça s'active automatiquement.
const heroVideo = document.getElementById('heroVideo');
const heroFallback = document.getElementById('heroFallbackImg');
const heroBadge = document.getElementById('heroBadge');

if (heroVideo) {
  let videoReady = false;

  heroVideo.addEventListener('loadeddata', () => {
    videoReady = true;
    heroVideo.classList.add('is-ready');
    if (heroFallback) heroFallback.style.display = 'none';
    if (heroBadge) heroBadge.remove();
  });

  // Si rien n'a chargé après un court délai (fichiers absents/erreur),
  // on masque simplement le <video> et l'image de repli reste visible.
  setTimeout(() => {
    if (!videoReady) heroVideo.style.display = 'none';
  }, 1500);
}

// Menu mobile
const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');

navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});

mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Formulaire de réservation
// ---------------------------------------------------------
// Aucun appel serveur pour l'instant. Le formulaire ouvre WhatsApp
// avec un message pré-rempli contenant les infos de la demande.
//
// -> Remplacer NUMERO_WHATSAPP par le vrai numéro (format 221XXXXXXXXX)
//
// Alternative possible plus tard : brancher sur Formspree ou un
// backend Supabase (comme sur CMD) pour stocker les demandes et
// envoyer un email automatique.
// ---------------------------------------------------------

const NUMERO_WHATSAPP = '221784520000'; // à remplacer par le vrai numéro

const form = document.getElementById('reservationForm');
const status = document.getElementById('formStatus');

// Ce script est partagé par toutes les pages : le formulaire n'existe
// que sur reservation.html, donc on ne branche l'écouteur que s'il est présent.
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());

    if (new Date(data.depart) <= new Date(data.arrivee)) {
      status.textContent = "La date de départ doit être après la date d'arrivée.";
      status.className = 'form-status error';
      return;
    }

    const message =
      `Demande de réservation — Complexe Le Kyzito%0A` +
      `Nom : ${data.nom}%0A` +
      `Téléphone : ${data.telephone}%0A` +
      `Arrivée : ${data.arrivee}%0A` +
      `Départ : ${data.depart}%0A` +
      `Chambre : ${data.chambre}%0A` +
      `Voyageurs : ${data.personnes}%0A` +
      (data.message ? `Message : ${data.message}` : '');

    window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${message}`, '_blank');

    status.textContent = 'Votre demande a été préparée sur WhatsApp — il ne reste qu\'à l\'envoyer.';
    status.className = 'form-status success';
    form.reset();
  });
}
