// Single source of truth for the five health disciplines the feed covers.
// Shared by the Europe PMC ingestion job, the API routes and the UI.

export const CATEGORIES = {
  ENFERMERIA: {
    key: "ENFERMERIA",
    label: "Enfermería",
    icon: "syringe",
    colors: { base: "#3a0f1f", mid: "#7a1f3d", accent: "#ff6b8b" },
  },
  MEDICINA: {
    key: "MEDICINA",
    label: "Medicina",
    icon: "stethoscope",
    colors: { base: "#0b1c33", mid: "#1c3f73", accent: "#5b9bff" },
  },
  FARMACIA: {
    key: "FARMACIA",
    label: "Farmacia",
    icon: "pill",
    colors: { base: "#08241a", mid: "#0f5c3f", accent: "#3ee08a" },
  },
  FARMACOLOGIA: {
    key: "FARMACOLOGIA",
    label: "Farmacología",
    icon: "molecule",
    colors: { base: "#2b0620", mid: "#6b1050", accent: "#e0479a" },
  },
  NUTRICION: {
    key: "NUTRICION",
    label: "Nutrición",
    icon: "leaf",
    colors: { base: "#2e1704", mid: "#7a4308", accent: "#ffab3d" },
  },
  REHABILITACION: {
    key: "REHABILITACION",
    label: "Rehabilitación",
    icon: "activity",
    colors: { base: "#062226", mid: "#0f5560", accent: "#2fd4e8" },
  },
  ODONTOLOGIA: {
    key: "ODONTOLOGIA",
    label: "Odontología",
    icon: "tooth",
    colors: { base: "#241a33", mid: "#4a3470", accent: "#c9a6ff" },
  },
  LABORATORIO_CLINICO: {
    key: "LABORATORIO_CLINICO",
    label: "Laboratorio Clínico",
    icon: "flask",
    colors: { base: "#141033", mid: "#332a73", accent: "#8b7cf6" },
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

// Europe PMC query used by the refresh job to pull recent, real literature
// for each discipline. Tuned to stay inside health/clinical practice and to
// avoid the other four categories bleeding into "medicina".
export const CATEGORY_QUERIES = {
  ENFERMERIA:
    '("nursing care" OR "nursing practice" OR "patient care" OR "nurse-led") AND (SRC:MED)',
  MEDICINA:
    '("clinical medicine" OR "clinical trial" OR "internal medicine") NOT nursing NOT pharmacy NOT dietary NOT rehabilitation AND (SRC:MED)',
  // Farmacia: práctica farmacéutica — el rol del farmacéutico, la terapia
  // farmacológica en el paciente, no la ciencia básica del medicamento.
  FARMACIA:
    '("pharmaceutical care" OR "pharmacy practice" OR "clinical pharmacy" OR "medication therapy management" OR "community pharmacy") AND (SRC:MED)',
  // Farmacología: la ciencia del medicamento en sí — mecanismo de acción,
  // farmacocinética/farmacodinamia, interacciones, toxicología. Antes
  // "Farmacia" incluía "pharmacology" y mezclaba ambos temas.
  FARMACOLOGIA:
    '("pharmacology" OR "pharmacokinetics" OR "pharmacodynamics" OR "drug interactions" OR "mechanism of action" OR "toxicology") AND (SRC:MED)',
  NUTRICION:
    '("clinical nutrition" OR "dietary intervention" OR "nutrition therapy" OR "diet and health") AND (SRC:MED)',
  REHABILITACION:
    '("rehabilitation" OR "physical therapy" OR "physiotherapy" OR "occupational therapy") AND (SRC:MED)',
  ODONTOLOGIA:
    '("dentistry" OR "oral health" OR "dental caries" OR "periodontal" OR "dental implant") AND (SRC:MED)',
  LABORATORIO_CLINICO:
    '("clinical laboratory" OR "laboratory medicine" OR "biomarker" OR "point-of-care testing" OR "diagnostic assay") AND (SRC:MED)',
};
