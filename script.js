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
  // Dès que la vidéo a assez de données pour démarrer, on l'affiche
  // par-dessus l'image de repli et on retire le badge.
  heroVideo.addEventListener('loadeddata', () => {
    heroVideo.classList.add('is-ready');
    if (heroFallback) heroFallback.style.display = 'none';
    if (heroBadge) heroBadge.remove();
  });

  // Si la vidéo échoue vraiment à charger (fichier absent, format non
  // supporté...), on ne fait rien de spécial : l'image de repli reste
  // affichée par défaut puisque la vidéo n'a jamais display:block tant
  // qu'elle n'a pas chargé. Pas besoin de minuteur qui la masquerait
  // prématurément avant qu'elle ait eu le temps de charger.
  heroVideo.addEventListener('error', () => {
    heroVideo.remove();
  });
}

// Modal vidéo chambre (activé automatiquement si des boutons
// data-room-modal sont présents sur la page — ex. chambres.html)
const roomModal = document.getElementById('roomModal');
if (roomModal) {
  const modalMedia = document.getElementById('roomModalMedia');
  const modalTitle = document.getElementById('roomModalTitle');

  document.querySelectorAll('[data-room-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-room-name') || '';
      const videoSrc = btn.getAttribute('data-room-video') || '';
      const imagesCsv = btn.getAttribute('data-room-images') || '';

      modalTitle.textContent = name;

      if (videoSrc) {
        modalMedia.className = 'room-modal-media is-video';
        modalMedia.innerHTML = `<video src="${videoSrc}" controls autoplay playsinline></video>`;
      } else if (imagesCsv) {
        const imgs = imagesCsv.split(',').map(s => s.trim()).filter(Boolean);
        modalMedia.className = 'room-modal-media';
        modalMedia.innerHTML = '<div class="room-modal-gallery">' +
          imgs.map(src => `<img src="${src}" alt="${name}">`).join('') +
          '</div>';
      } else {
        modalMedia.className = 'room-modal-media';
        modalMedia.innerHTML = '';
      }

      roomModal.classList.add('is-open');
      roomModal.setAttribute('aria-hidden', 'false');
    });
  });

  roomModal.querySelectorAll('[data-modal-close]').forEach(el => {
    el.addEventListener('click', closeRoomModal);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeRoomModal();
  });

  function closeRoomModal() {
    roomModal.classList.remove('is-open');
    roomModal.setAttribute('aria-hidden', 'true');
    modalMedia.innerHTML = ''; // stoppe la vidéo en cours
  }
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
// Aucun appel serveur pour l'instant. Deux boutons : l'un ouvre WhatsApp
// avec un message pré-rempli, l'autre ouvre l'appli mail (Gmail, etc.)
// avec un email pré-rempli — au client de choisir son canal préféré.
//
// -> Remplacer NUMERO_WHATSAPP et EMAIL_CONTACT par les vraies coordonnées
//
// Alternative possible plus tard : brancher sur Formspree ou un
// backend Supabase (comme sur CMD) pour stocker les demandes.
// ---------------------------------------------------------

const NUMERO_WHATSAPP = '221784520000'; // à remplacer par le vrai numéro
const EMAIL_CONTACT = 'contact@lekyzito.sn'; // à remplacer par la vraie adresse

const form = document.getElementById('reservationForm');
const status = document.getElementById('formStatus');

// Ce script est partagé par toutes les pages : le formulaire n'existe
// que sur reservation.html et l'accueil, donc on ne branche l'écouteur
// que s'il est présent.
if (form) {
  form.querySelectorAll('[data-send]').forEach(btn => {
    btn.addEventListener('click', () => {
      // Les boutons sont type="button" : on valide le formulaire nous-mêmes
      // avant de construire le message (comme le ferait un submit natif).
      if (!form.reportValidity()) return;

      const data = Object.fromEntries(new FormData(form).entries());

      if (new Date(data.depart) <= new Date(data.arrivee)) {
        status.textContent = "La date de départ doit être après la date d'arrivée.";
        status.className = 'form-status error';
        return;
      }

      const channel = btn.getAttribute('data-send');

      const lines = [
        `Nom : ${data.nom}`,
        `Téléphone : ${data.telephone}`,
        `Arrivée : ${data.arrivee}`,
        `Départ : ${data.depart}`,
        `Chambre : ${data.chambre}`,
        `Voyageurs : ${data.personnes}`,
      ];
      if (data.message) lines.push(`Message : ${data.message}`);

      if (channel === 'whatsapp') {
        const text = encodeURIComponent(`Demande de réservation — Complexe Le Kyzito\n${lines.join('\n')}`);
        window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${text}`, '_blank');
        status.textContent = 'Votre demande a été préparée sur WhatsApp — il ne reste qu\'à l\'envoyer.';
      } else {
        const subject = encodeURIComponent('Demande de réservation — Complexe Le Kyzito');
        const body = encodeURIComponent(lines.join('\n'));
        window.location.href = `mailto:${EMAIL_CONTACT}?subject=${subject}&body=${body}`;
        status.textContent = 'Votre demande a été préparée dans votre application email — il ne reste qu\'à l\'envoyer.';
      }

      status.className = 'form-status success';
      form.reset();
    });
  });
}
