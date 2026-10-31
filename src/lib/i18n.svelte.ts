export type Lang = 'es' | 'fr'

const dict = {
  es: {
    subtitle: 'con Baguette y Taquito',
    loading: 'Cargando…',
    tabWishlist: 'Por ver',
    tabPlanning: 'Calendario',
    tabWatched: 'Vistas',
    footer: 'Hecho con ❤️ para nosotros dos',
    signOut: 'Cerrar sesión',
    oops: 'Ups',
    // login
    loginTitle: 'Solo para nosotros dos 💕',
    password: 'Contraseña',
    loginError: 'Contraseña incorrecta 🙈',
    enter: 'Entrar 🎬',
    // wishlist
    addMovie: 'Agregar una película',
    searchPlaceholder: 'Buscar una película…',
    noResults: 'Sin resultados',
    addWithoutInfo: 'Agregar «{title}» sin ficha',
    emptyWishlist: 'La lista está vacía… ¿qué vemos? 🤔',
    proposedBy: 'Propuesta por {who}',
    delete: 'Eliminar',
    confirmDelete: '¿Eliminar «{title}»?',
    schedule: '📅 Programar',
    // planning
    pickMovie: 'Elegir una película…',
    addFirst: 'Primero agrega películas en «Por ver» 🍿',
    noSessionDay: 'Nada planeado este día.',
    toValidate: '¿Y? ¿La vieron?',
    upcoming: 'Próximas noches de cine',
    noUpcoming: 'No hay noches de cine planeadas.',
    seen: '✓ ¡Vista!',
    notSeen: '↩ No la vimos',
    notSeenTitle: 'La película regresa a «Por ver»',
    rating: 'Calificación:',
    cancel: 'Cancelar',
    validate: 'Confirmar',
    deletedMovie: 'Película eliminada',
    today: 'Hoy',
    // watched
    emptyWatched: 'Todavía no han visto ninguna película juntos… ¡a la próxima! 🎞️',
    watchedOne: '1 película vista juntos 💕',
    watchedMany: '{n} películas vistas juntos 💕',
    rewatch: '↻ Volver a ver',
    readMore: 'Leer más',
    readLess: 'Reducir',
  },
  fr: {
    subtitle: 'con Baguette y Taquito',
    loading: 'Chargement…',
    tabWishlist: 'À voir',
    tabPlanning: 'Calendrier',
    tabWatched: 'Vus',
    footer: 'Fait avec ❤️ pour nous deux',
    signOut: 'Se déconnecter',
    oops: 'Oups',
    loginTitle: 'Réservé à nous deux 💕',
    password: 'Mot de passe',
    loginError: 'Mot de passe incorrect 🙈',
    enter: 'Entrer 🎬',
    addMovie: 'Ajouter un film',
    searchPlaceholder: 'Rechercher un film…',
    noResults: 'Aucun résultat',
    addWithoutInfo: 'Ajouter « {title} » sans fiche',
    emptyWishlist: 'La liste est vide… on regarde quoi ? 🤔',
    proposedBy: 'Proposé par {who}',
    delete: 'Supprimer',
    confirmDelete: 'Supprimer « {title} » ?',
    schedule: '📅 Programmer',
    pickMovie: 'Choisir un film…',
    addFirst: "Ajoutez d'abord des films dans « À voir » 🍿",
    noSessionDay: 'Rien de prévu ce jour-là.',
    toValidate: "Alors, vous l'avez vu ?",
    upcoming: 'Prochaines soirées',
    noUpcoming: 'Aucune soirée prévue.',
    seen: '✓ Vu !',
    notSeen: '↩ Pas vu',
    notSeenTitle: 'Le film retourne dans « À voir »',
    rating: 'Note :',
    cancel: 'Annuler',
    validate: 'Valider',
    deletedMovie: 'Film supprimé',
    today: "Aujourd'hui",
    emptyWatched: 'Pas encore de film vu ensemble… à la prochaine ! 🎞️',
    watchedOne: '1 film vu ensemble 💕',
    watchedMany: '{n} films vus ensemble 💕',
    rewatch: '↻ À revoir',
    readMore: 'Lire la suite',
    readLess: 'Réduire',
  },
} satisfies Record<Lang, Record<string, string>>

export type Key = keyof (typeof dict)['es']

const saved = localStorage.getItem('cinecito:lang')

class I18n {
  lang = $state<Lang>(saved === 'fr' ? 'fr' : 'es')

  constructor() {
    $effect.root(() => {
      $effect(() => {
        localStorage.setItem('cinecito:lang', this.lang)
        document.documentElement.lang = this.lang
      })
    })
  }

  /** Locale pour les dates (Intl) et pour TMDB */
  get locale() {
    return this.lang === 'es' ? 'es-MX' : 'fr-FR'
  }

  t = (key: Key, params: Record<string, string | number> = {}) =>
    dict[this.lang][key].replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? ''))
}

export const i18n = new I18n()
export const t = i18n.t
