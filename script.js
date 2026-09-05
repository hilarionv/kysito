// Année dans le footer
document.getElementById('year').textContent = new Date().getFullYear();

// Le hero utilise maintenant une balise <video> native avec l'attribut
// poster comme repli — plus besoin de JS pour gérer la bascule.

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

// Animations au scroll (fade-up)
// ---------------------------------------------------------
// On ajoute la classe .reveal aux blocs répétés du site (cartes, figures...)
// en JS plutôt que dans chaque page HTML : si le JS ne tourne pas, le
// contenu reste visible par défaut (pas de risque de rester caché).
// Un IntersectionObserver révèle chaque bloc la première fois qu'il
// entre dans l'écran, avec un léger décalage en cascade dans les grilles.
const revealTargets = document.querySelectorAll(
  '.teaser-card, .room-card, .gallery-item, .review-card, .event-card, ' +
  '.menu-block, .space-card, .place-figure, .section-head, .intro-inner'
);

if (revealTargets.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealTargets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(i % 4) * 0.08}s`;
    observer.observe(el);
  });
}
