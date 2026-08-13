/* =============================================================
   Boost Wellness — chatbot.js
   Asistente de preguntas frecuentes basado en reglas (sin backend).
   Si no reconoce la pregunta, remite a contacto.
   ============================================================= */
(function () {
  "use strict";

  var CONTACT_EMAIL = "boostwellness.info@gmail.com";
  var CONTACT_PHONE = "+34 614 374 306";
  var CONTACT_URL = "contacto.html";

  var FALLBACK =
    "No tengo una respuesta clara para eso. Lo mejor es que os pongáis en contacto con nosotros: " +
    "escribe a <a href=\"mailto:" + CONTACT_EMAIL + "\">" + CONTACT_EMAIL + "</a>, " +
    "llama al <a href=\"tel:" + CONTACT_PHONE.replace(/\s/g, "") + "\">" + CONTACT_PHONE + "</a> " +
    "o rellena el <a href=\"" + CONTACT_URL + "\">formulario de contacto</a> y te respondemos en menos de 48 horas laborables.";

  var KB = [
    {
      id: "saludo",
      keywords: ["hola", "buenas", "hey", "que tal", "buenos dias", "buenas tardes", "buenas noches"],
      answer: "¡Hola! 👋 Soy el asistente de Boost Wellness. Puedo contarte sobre nuestros servicios, cómo funciona el programa, precios, cobertura o cómo contactar con nosotros. ¿Qué quieres saber?"
    },
    {
      id: "servicios",
      keywords: ["servicio", "actividad fisica", "team building", "evento", "charla", "que haceis", "que ofreceis", "disciplinas", "yoga", "pilates", "hiit", "zumba"],
      answer: "Trabajamos en cuatro formatos, siempre con nuestro propio equipo: actividades físicas (yoga, pilates, GAP, HIIT, zumba, funcional), team building, eventos (torneos, jornadas, ferias) y charlas de salud (nutrición, estrés, ergonomía). Más info en <a href=\"servicios.html\">Servicios</a>."
    },
    {
      id: "como_funciona",
      keywords: ["como funciona", "proceso", "como empezamos", "como empezar", "pasos", "primeros pasos"],
      answer: "El proceso tiene 5 pasos: analizamos qué necesita el equipo, diseñamos un programa a medida, lo imparte nuestro propio equipo, empezamos adaptándonos al espacio disponible y ajustamos el programa mes a mes. Detalle completo en <a href=\"como-funciona.html\">Cómo funciona</a>."
    },
    {
      id: "precio",
      keywords: ["precio", "coste", "cuanto cuesta", "tarifa", "presupuesto", "cuanto vale"],
      answer: "El precio depende del tamaño del equipo, la frecuencia y los formatos que combinéis, así que no tenemos una tarifa fija publicada. Cuéntanos vuestras necesidades en el <a href=\"" + CONTACT_URL + "\">formulario de contacto</a> y os preparamos una propuesta en menos de 48 horas laborables."
    },
    {
      id: "minimo_empleados",
      keywords: ["minimo de empleados", "cuantos empleados", "tamano del equipo", "tamano de equipo", "plantilla pequena", "somos pocos"],
      answer: "No hay un mínimo estricto: trabajamos con equipos de 6 personas y con plantillas de más de 200. Adaptamos el formato al tamaño real del grupo."
    },
    {
      id: "combinar",
      keywords: ["combinar", "mezclar formatos", "varios servicios a la vez"],
      answer: "Sí, es lo habitual: por ejemplo actividad física cada semana, una charla al mes y un evento por trimestre. Lo definimos juntos al diseñar el programa."
    },
    {
      id: "profesionales",
      keywords: ["subcontrat", "profesionales propios", "entrenadores", "quien imparte", "quien da las clases", "autonomos"],
      answer: "Los profesionales son nuestro propio equipo: entrenadores, dinamizadores y ponentes con los que trabajamos de forma continua, no autónomos puntuales ni terceros subcontratados."
    },
    {
      id: "cambios",
      keywords: ["cambiar sede", "cambiar horario", "cambio de sede", "cambio de horario", "reprogramar"],
      answer: "Avisadnos con unos días de margen y reorganizamos el programa. No hay penalización ni contrato que renegociar desde cero."
    },
    {
      id: "tiempo_inicio",
      keywords: ["cuanto tiempo", "primera actividad", "cuando empezamos", "plazo de inicio", "cuando podemos empezar"],
      answer: "De media, entre una y dos semanas desde la primera conversación."
    },
    {
      id: "cobertura",
      keywords: ["toda espana", "que ciudades", "donde trabajais", "cobertura", "ubicacion", "zona", "provincia"],
      answer: "Sí, trabajamos con empresas de toda España. Nuestro equipo se desplaza a la sede de cada empresa, ya sea la oficina, un gimnasio cercano o un espacio exterior, en cualquier ciudad."
    },
    {
      id: "espacio",
      keywords: ["donde se hace", "espacio", "necesitamos gimnasio", "en la oficina", "al aire libre", "exterior"],
      answer: "Nos adaptamos al espacio disponible: la propia oficina (una sala, una zona común o el espacio de trabajo despejado), un gimnasio si la empresa ya cuenta con uno, o un espacio exterior como un parque o una azotea cercana. Llevamos nosotros el material que haga falta."
    },
    {
      id: "beneficios",
      keywords: ["beneficio", "ventaja", "para que sirve", "por que hacerlo", "resultados"],
      answer: "Los equipos que participan reducen bajas laborales, refuerzan la marca de empleador, fortalecen el trabajo en equipo, mejoran el clima laboral y ganan confianza y habilidades blandas. Más en <a href=\"beneficios.html\">Beneficios</a>."
    },
    {
      id: "contacto",
      keywords: ["contacto", "email", "correo", "telefono", "llamar", "hablar con alguien", "persona", "whatsapp"],
      answer: "Puedes escribirnos a <a href=\"mailto:" + CONTACT_EMAIL + "\">" + CONTACT_EMAIL + "</a>, llamar al <a href=\"tel:" + CONTACT_PHONE.replace(/\s/g, "") + "\">" + CONTACT_PHONE + "</a>, o rellenar el <a href=\"" + CONTACT_URL + "\">formulario de contacto</a>. Respondemos en menos de 48 horas laborables."
    },
    {
      id: "horario",
      keywords: ["horario", "abierto", "atencion al cliente", "que dias"],
      answer: "Estamos abiertos todo el día para atender consultas por email o teléfono. Escríbenos cuando te venga bien y te respondemos en menos de 48 horas laborables."
    },
    {
      id: "quienes_somos",
      keywords: ["quienes sois", "que es boost wellness", "sobre vosotros", "quien es boost wellness"],
      answer: "Boost Wellness diseña e imparte programas de deporte y fitness para empresas de cualquier tamaño y sector, con nuestro propio equipo de entrenadores, dinamizadores y ponentes, en la oficina, en un gimnasio o al aire libre."
    },
    {
      id: "gracias",
      keywords: ["gracias", "genial gracias", "perfecto gracias"],
      answer: "¡De nada! Si tienes cualquier otra pregunta, aquí estoy."
    }
  ];

  var SUGGESTIONS = ["Servicios", "Cómo funciona", "Precio", "Contacto"];

  function normalize(str) {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function matchAnswer(rawText) {
    var text = normalize(rawText);
    if (!text) return null;
    var best = null;
    var bestScore = 0;
    for (var i = 0; i < KB.length; i++) {
      var entry = KB[i];
      var score = 0;
      for (var j = 0; j < entry.keywords.length; j++) {
        if (text.indexOf(normalize(entry.keywords[j])) !== -1) score++;
      }
      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    }
    return bestScore > 0 ? best.answer : null;
  }

  function buildWidget() {
    var launcher = document.createElement("button");
    launcher.type = "button";
    launcher.className = "bw-chat-launcher";
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-controls", "bw-chat-panel");
    launcher.setAttribute("aria-label", "Abrir el asistente de Boost Wellness");
    launcher.innerHTML =
      '<svg class="bw-chat-icon-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>' +
      '<svg class="bw-chat-icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';

    var panel = document.createElement("div");
    panel.className = "bw-chat-panel";
    panel.id = "bw-chat-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "false");
    panel.setAttribute("aria-label", "Asistente de Boost Wellness");
    panel.innerHTML =
      '<div class="bw-chat-head">' +
        '<div class="bw-chat-head-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></div>' +
        '<div><div class="bw-chat-head-title">Boost Wellness</div><div class="bw-chat-head-sub">Asistente · responde al instante</div></div>' +
      '</div>' +
      '<div class="bw-chat-body" data-bw-chat-body role="log" aria-live="polite"></div>' +
      '<form class="bw-chat-form" data-bw-chat-form>' +
        '<input class="bw-chat-input" type="text" name="message" placeholder="Escribe tu pregunta…" autocomplete="off" aria-label="Escribe tu pregunta">' +
        '<button class="bw-chat-send" type="submit" aria-label="Enviar">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>' +
        '</button>' +
      '</form>';

    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    var body = panel.querySelector("[data-bw-chat-body]");
    var form = panel.querySelector("[data-bw-chat-form]");
    var input = form.querySelector(".bw-chat-input");
    var opened = false;
    var greeted = false;

    function scrollToBottom() {
      body.scrollTop = body.scrollHeight;
    }

    function addMessage(html, from) {
      var msg = document.createElement("div");
      msg.className = "bw-chat-msg " + (from === "user" ? "bw-chat-msg-user" : "bw-chat-msg-bot");
      msg.innerHTML = html;
      body.appendChild(msg);
      scrollToBottom();
    }

    function addSuggestions() {
      var wrap = document.createElement("div");
      wrap.className = "bw-chat-suggestions";
      SUGGESTIONS.forEach(function (label) {
        var chip = document.createElement("button");
        chip.type = "button";
        chip.className = "bw-chat-chip";
        chip.textContent = label;
        chip.addEventListener("click", function () {
          handleUserMessage(label);
        });
        wrap.appendChild(chip);
      });
      body.appendChild(wrap);
      scrollToBottom();
    }

    function handleUserMessage(text) {
      text = text.trim();
      if (!text) return;
      addMessage(escapeHtml(text), "user");
      var answer = matchAnswer(text);
      window.setTimeout(function () {
        addMessage(answer || FALLBACK, "bot");
      }, 250);
    }

    function escapeHtml(str) {
      var div = document.createElement("div");
      div.textContent = str;
      return div.innerHTML;
    }

    function openPanel() {
      opened = true;
      panel.classList.add("is-open");
      launcher.setAttribute("aria-expanded", "true");
      if (!greeted) {
        greeted = true;
        addMessage(
          "¡Hola! 👋 Soy el asistente de Boost Wellness. Pregúntame sobre servicios, precios, cómo funciona el programa o cómo contactar con nosotros.",
          "bot"
        );
        addSuggestions();
      }
      window.setTimeout(function () { input.focus(); }, 200);
    }

    function closePanel() {
      opened = false;
      panel.classList.remove("is-open");
      launcher.setAttribute("aria-expanded", "false");
    }

    launcher.addEventListener("click", function () {
      if (opened) closePanel(); else openPanel();
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = input.value;
      input.value = "";
      handleUserMessage(text);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && opened) closePanel();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildWidget);
  } else {
    buildWidget();
  }
})();
