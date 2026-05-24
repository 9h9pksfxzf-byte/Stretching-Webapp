import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type BodyRegion = 
  | 'Hals & Nacken'
  | 'BWS & Thorax (Rotation/Extension)'
  | 'LWS & Core (Rumpfstabilität)'
  | 'Brust & Schultervorderseite'
  | 'Oberer Rücken & Schulterrückseite'
  | 'Arme & Handgelenke'
  | 'Hüftbeuger & Quadrizeps (Anterior)'
  | 'Ischiocrurale Muskulatur (Hamstrings)'
  | 'Hüftstrecker & Gesäß (Posterior)'
  | 'Adduktoren (Medial)'
  | 'Unterschenkel & Fuß (Fundament)';

export interface PerformedExercise {
  name: string;
  duration: number; // in Sekunden
  executionRating: number; // 1-10
  side: 'Links' | 'Rechts' | 'Beide';
  bodyRegion: BodyRegion | 'Allgemein';
}

export interface HistoryEntry {
  id: string;
  programName: string;
  completedExercises: PerformedExercise[];
}

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  bodyRegion: BodyRegion;
  isUnilateral: boolean;
  rating?: number;
  duration?: number;
}

export interface ProgramExercise {
  exerciseId: string;
  duration: number;
  breakDuration?: number;
}

export interface Program {
  id: string;
  name: string;
  exercises: ProgramExercise[];
}

interface StoreState {
  library: Exercise[];
  programs: Program[];
  history: HistoryEntry[];
  addExercise: (exercise: Omit<Exercise, 'id'>) => void;
  updateExercise: (id: string, exercise: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;
  addProgram: (program: Omit<Program, 'id'>) => void;
  updateProgram: (id: string, program: Partial<Program>) => void;
  deleteProgram: (id: string) => void;
  addHistoryEntry: (entry: HistoryEntry) => void;
  clearHistory: () => void;
}

const defaultLibrary: Exercise[] = [
  // ==========================================
  // 1. HALS & NACKEN (8 Übungen)
  // ==========================================
  {
    id: 'ex-hws-1',
    name: 'Levator Scapulae Isoliert',
    description: 'Kopf um 45° zur Gegenseite drehen, Kinn Richtung Schlüsselbein absenken. Die ipsilaterale Hand fixiert das Schulterblatt aktiv hinter dem Gesäß.',
    bodyRegion: 'Hals & Nacken',
    isUnilateral: true,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-hws-2',
    name: 'Scaleni-Dehnung (Anterior/Medius)',
    description: 'Kopf zur Gegenseite neigen und leicht nach hinten rotieren. Die freie Hand drückt sanft die erste Rippe unterhalb des Schlüsselbeins nach unten.',
    bodyRegion: 'Hals & Nacken',
    isUnilateral: true,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-hws-3',
    name: 'Subokzipitale Traktion',
    description: 'In Rückenlage das Kinn aktiv Richtung Kehlkopf ziehen (Doppelkinn), um die kurze Nackenmuskulatur an der Schädelbasis exzentrisch zu längen.',
    bodyRegion: 'Hals & Nacken',
    isUnilateral: false,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-hws-yoga1',
    name: 'Matsyasana (Fisch-Pose)',
    description: 'Yoga-Asana. In Rückenlage den Brustkorb maximal anheben, die Scheitelkrone sanft auf dem Boden absetzen. Dehnt die vordere Halsmuskulatur.',
    bodyRegion: 'Hals & Nacken',
    isUnilateral: false,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-hws-yoga2',
    name: 'Bhujangasana Nacken-Skan',
    description: 'Yoga-Asana. In der Kobra den Kopf kontrolliert und langsam über eine Schulter drehen, kurz halten, dann zur anderen Seite wechseln. Mobilisiert HWS unter Extension.',
    bodyRegion: 'Hals & Nacken',
    isUnilateral: false,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-hws-yoga3',
    name: 'Balasana Side-Stretch',
    description: 'Yoga-Asana. In der Kindeshaltung den Kopf zur Seite legen und die gegenüberliegende Nackenseite durch Atemlenkung sanft aufdehnen.',
    bodyRegion: 'Hals & Nacken',
    isUnilateral: true,
    rating: 3,
    duration: 30
  },
  {
    id: 'ex-hws-adv1',
    name: 'Sternocleidomastoideus Gleitmobilisation',
    description: 'Advanced. Kopf in Seitneigung und Gegendrehung bringen. Den großen Muskelstrang am Hals mit Daumen und Zeigefinger sanft greifen und in Atemphasen leicht mobilisieren.',
    bodyRegion: 'Hals & Nacken',
    isUnilateral: true,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-hws-adv2',
    name: 'Sternum-Faszien-Zug',
    description: 'Advanced. Die flache Hand unterhalb des Schlüsselbeins auf das Gewebe pressen und nach unten ziehen. Den Kopf gleichzeitig nach hinten-oben strecken.',
    bodyRegion: 'Hals & Nacken',
    isUnilateral: false,
    rating: 5,
    duration: 30
  },

  // ==========================================
  // 2. BWS & THORAX (8 Übungen)
  // ==========================================
  {
    id: 'ex-bws-1',
    name: 'Open Book (BWS-Rotation)',
    description: 'Seitenlage, Hüfte bei 90° Beugung mit Rolle blockiert. Den oberen Arm im weiten Radius nach hinten führen. Fokus auf den thorakalen Übergang.',
    bodyRegion: 'BWS & Thorax (Rotation/Extension)',
    isUnilateral: true,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-bws-2',
    name: 'Bench Thoracic Extension',
    description: 'Ellbogen auf einer Bank, Hände halten einen Stab. Kopf zwischen den Armen absinken lassen. Becken bleibt in posteriorer Kippung (kein LWS-Hohlkreuz).',
    bodyRegion: 'BWS & Thorax (Rotation/Extension)',
    isUnilateral: false,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-bws-3',
    name: 'Thread the Needle',
    description: 'Aus dem Vierfüßlerstand einen Arm unter dem Oberkörper durchschieben, bis die Schulter den Boden berührt. Gegenarm drückt aktiv in den Boden.',
    bodyRegion: 'BWS & Thorax (Rotation/Extension)',
    isUnilateral: true,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-bws-yoga1',
    name: 'Anahatasana (Schmelzendes Herz)',
    description: 'Yoga-Asana. Aus dem Kniestand die Arme weit nach vorne strecken und den Brustkorb zum Boden sinken lassen. Intensive thorakale Extension.',
    bodyRegion: 'BWS & Thorax (Rotation/Extension)',
    isUnilateral: false,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-bws-yoga2',
    name: 'Urdhva Mukha Svanasana (Hund aufwärts)',
    description: 'Yoga-Asana. Hände unter den Schultern, Becken vom Boden abgehoben. Schulterblätter aktiv nach hinten-unten ziehen und das Brustbein nach vorne-oben schieben.',
    bodyRegion: 'BWS & Thorax (Rotation/Extension)',
    isUnilateral: false,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-bws-yoga3',
    name: 'Marjaryasana-Bitilasana (Katze-Kuh)',
    description: 'Yoga-Asana. Dynamischer Wechsel zwischen maximalem Rundrücken (Skapulaprotraktion) und kontrollierter Wirbelsäulenstreckung im Vierfüßlerstand.',
    bodyRegion: 'BWS & Thorax (Rotation/Extension)',
    isUnilateral: false,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-bws-adv1',
    name: 'Interkostal-Dehnung (Atem-Fokus)',
    description: 'Advanced. Im Seitstütz auf dem Ellbogen das Becken ablegen. Den oberen Arm über den Kopf ziehen und forciert in die obere Flanke einatmen, um Zwischenrippenmuskeln zu dehnen.',
    bodyRegion: 'BWS & Thorax (Rotation/Extension)',
    isUnilateral: true,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-bws-adv2',
    name: 'Cross-Body BWS-Korkenzieher',
    description: 'Advanced. Aus dem tiefen Ausfallschritt den ellenbogennahen Arm am Boden fixieren und den freien Arm maximal zur Decke aufdrehen. Augen folgen der Hand.',
    bodyRegion: 'BWS & Thorax (Rotation/Extension)',
    isUnilateral: true,
    rating: 5,
    duration: 30
  },

  // ==========================================
  // 3. LWS & CORE (8 Übungen)
  // ==========================================
  {
    id: 'ex-lws-1',
    name: 'M. Quadratus Lumborum Isoliert',
    description: 'Aus dem Grätschsitz ein Bein anwinkeln. Den Rumpf lateral über das gestreckte Bein neigen, während der obere Arm diagonal nach oben-außen zieht.',
    bodyRegion: 'LWS & Core (Rumpfstabilität)',
    isUnilateral: true,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-lws-2',
    name: 'Scorpion Stretch',
    description: 'Bauchlage, Arme T-förmig fixiert. Ein Bein anheben, Knie beugen und den Fuß diagonal hinter dem Körper Richtung Boden führen. Dehnt anterioren Core.',
    bodyRegion: 'LWS & Core (Rumpfstabilität)',
    isUnilateral: true,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-lws-3',
    name: 'Psoas-Zwerchfell-Integration',
    description: 'Rückenlage, Knie zur Brust gezogen. Ein Bein flach ausstrecken und knapp über dem Boden halten. Forcierte Bauchatmung dehnt den tiefen Core-Komplex.',
    bodyRegion: 'LWS & Core (Rumpfstabilität)',
    isUnilateral: true,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-lws-yoga1',
    name: 'Supta Matsyendrasana (Krokodil)',
    description: 'Yoga-Asana. Rückenlage, ein Knie zur Brust ziehen und diagonal über den Körper zum Boden führen. Der Blick geht zur entgegengesetzten Hand. Entlastet die LWS.',
    bodyRegion: 'LWS & Core (Rumpfstabilität)',
    isUnilateral: true,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-lws-yoga2',
    name: 'Sphinx Pose (Sanfte Extension)',
    description: 'Yoga-Asana. Bauchlage auf den Unterarmen. Die Ellbogen ziehen aktiv nach hinten, um das Brustbein anzuheben. Sanfte Entlastung für lumbalen Druck.',
    bodyRegion: 'LWS & Core (Rumpfstabilität)',
    isUnilateral: false,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-lws-yoga3',
    name: 'Parivrtta Janu Sirsasana',
    description: 'Yoga-Asana. Gedrehter Kopf-zu-Knie-Sitz. Maximale Seitbeuge mit Rotation des Herzens zur Decke. Dehnt fascia thoracolumbalis.',
    bodyRegion: 'LWS & Core (Rumpfstabilität)',
    isUnilateral: true,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-lws-adv1',
    name: 'Multi-Planarer Iliolumbal-Stretch',
    description: 'Advanced. Kniestand, ein Bein 45° seitlich aufgestellt. Das Becken nach vorne-außen schieben und den Rumpf entgegengesetzt neigen. Dehnt das iliolumbale Band.',
    bodyRegion: 'LWS & Core (Rumpfstabilität)',
    isUnilateral: true,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-lws-adv2',
    name: 'Lumbaler Dekompressions-Hang',
    description: 'Advanced. An einer Klimmzugstange komplett passiv aushängen. Die Knie leicht anwinkeln und das Becken bewusst schwer nach unten sinken lassen.',
    bodyRegion: 'LWS & Core (Rumpfstabilität)',
    isUnilateral: false,
    rating: 5,
    duration: 30
  },

  // ==========================================
  // 4. BRUST & SCHULTERVORDERSEITE (8 Übungen)
  // ==========================================
  {
    id: 'ex-brust-1',
    name: 'Doorway Chest Stretch',
    description: 'Unterarme im 90°-Winkel am Türrahmen fixieren. Schritt nach vorne setzen, Brustbein anheben und die Schulterblätter aktiv nach hinten-unten ziehen.',
    bodyRegion: 'Brust & Schultervorderseite',
    isUnilateral: false,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-brust-2',
    name: 'Pectoralis Minor Wall Release',
    description: 'Arm schräg nach oben an einer Wand positionieren (ca. 120°). Den Oberkörper vom Arm wegdrehen, um den tiefen M. pectoralis minor zu isolieren.',
    bodyRegion: 'Brust & Schultervorderseite',
    isUnilateral: true,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-brust-3',
    name: 'Prone Shoulder Anterior Capsule',
    description: 'Bauchlage, Arm im 90°-Winkel zur Seite gestreckt, Ellbogen ebenfalls 90°. Den Oberkörper vorsichtig zur Gegenseite hochdrehen.',
    bodyRegion: 'Brust & Schultervorderseite',
    isUnilateral: true,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-brust-yoga1',
    name: 'Ustrasana (Kamel-Pose)',
    description: 'Yoga-Asana. Kniestand, Hände an die Fersen führen. Das Becken aktiv nach vorne schieben, während die Brust nach oben öffnet. Dehnt Deltoideus anterior.',
    bodyRegion: 'Brust & Schultervorderseite',
    isUnilateral: false,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-brust-yoga2',
    name: 'Purvottanasana (Aktivierte Planke rückwärts)',
    description: 'Yoga-Asana. Rücklings aufstützen, Beine gestreckt, Becken maximal anheben. Füße flach zum Boden schieben. Starke exzentrische Dehnung der Schultervorderseite.',
    bodyRegion: 'Brust & Schultervorderseite',
    isUnilateral: false,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-brust-yoga3',
    name: 'Devaduuta Panna Asana (Engelssturz)',
    description: 'Yoga-Asana. Kniestand, Hände hinter dem Rücken verschränken (Venusgriff). Die Arme lang nach hinten-oben wegstrecken, Oberkörper nach vorne neigen.',
    bodyRegion: 'Brust & Schultervorderseite',
    isUnilateral: false,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-brust-adv1',
    name: 'Dynamic Pec Gapping',
    description: 'Advanced. Mit dem Rücken auf eine Schaumstoffrolle (längs der Wirbelsäule) legen. Arme in U-Halte seitlich kontrolliert Richtung Boden federn lassen.',
    bodyRegion: 'Brust & Schultervorderseite',
    isUnilateral: false,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-brust-adv2',
    name: 'Bilateraler Innenrotatoren-Stretch',
    description: 'Advanced. Im Stand die Hände hinter dem Rücken zusammenführen, Handflächen fest schließen. Schultern nach hinten rollen und Ellbogen strecken.',
    bodyRegion: 'Brust & Schultervorderseite',
    isUnilateral: false,
    rating: 4,
    duration: 30
  },

  // ==========================================
  // 5. OBERER RÜCKEN & SCHULTERRÜCKSEITE (8 Übungen)
  // ==========================================
  {
    id: 'ex-ruecken-1',
    name: 'Prone Latissimus Stretch',
    description: 'Aus dem Fersensitz Arme weit nach vorne-außen schieben. Eine Hand greift über die andere, das Becken schiebt aktiv zur entgegengesetzten Seite.',
    bodyRegion: 'Oberer Rücken & Schulterrückseite',
    isUnilateral: true,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-ruecken-2',
    name: 'Sleeper Stretch (Infraspinatus)',
    description: 'Seitenlage direkt auf der Schulter, Ellbogen 90° vor dem Körper. Mit freier Hand den Unterarm sanft Richtung Boden drücken (Innenrotation).',
    bodyRegion: 'Oberer Rücken & Schulterrückseite',
    isUnilateral: true,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-ruecken-3',
    name: 'Scapula Protraction Stretch',
    description: 'Im Stand einen Pfosten auf Brusthöhe greifen. Gewicht nach hinten fallen lassen, Kinn auf die Brust legen, Schulterblätter auseinanderziehen.',
    bodyRegion: 'Oberer Rücken & Schulterrückseite',
    isUnilateral: false,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-ruecken-yoga1',
    name: 'Garudasana Arme (Adler-Arme)',
    description: 'Yoga-Asana. Ellbogen vor der Brust überkreuzen, Handflächen aneinanderlegen. Die Ellbogen aktiv nach oben und vorne schieben. Dehnt Rhomboiden.',
    bodyRegion: 'Oberer Rücken & Schulterrückseite',
    isUnilateral: true,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-ruecken-yoga2',
    name: 'Sasangasana (Kaninchen-Pose)',
    description: 'Yoga-Asana. Aus dem Fersensitz den Kopf vor den Knien aufsetzen. Fersen greifen und das Gesäß anheben, um den gesamten oberen Rücken rund aufzufächern.',
    bodyRegion: 'Oberer Rücken & Schulterrückseite',
    isUnilateral: false,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-ruecken-yoga3',
    name: 'Halasana (Pflug - Modifiziert)',
    description: 'Yoga-Asana. Rückenlage, Beine über den Kopf führen, bis die Zehen den Boden berühren. Hände stützen den Rücken. Öffnet die komplette obere Posteriorkette.',
    bodyRegion: 'Oberer Rücken & Schulterrückseite',
    isUnilateral: false,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-ruecken-adv1',
    name: 'Posterior Capsule Cross-Body Pin',
    description: 'Bauchlage, einen Arm unter der Brust flach zur Gegenseite durchschieben. Das eigene Körpergewicht kontrolliert auf den Arm sinken lassen.',
    bodyRegion: 'Oberer Rücken & Schulterrückseite',
    isUnilateral: true,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-ruecken-adv2',
    name: 'Dynamic Scapular Gliding',
    description: 'Vierfüßlerstand. Die Schultern aktiv maximal einsinken lassen (Retraktion) und dann maximal nach oben rausschieben (Protraction) ohne Ellbogenbeugung.',
    bodyRegion: 'Oberer Rücken & Schulterrückseite',
    isUnilateral: false,
    rating: 4,
    duration: 30
  },

  // ==========================================
  // 6. ARME & HANDGELENKE (8 Übungen)
  // ==========================================
  {
    id: 'ex-arme-1',
    name: 'Unterarm-Flexoren Stretch',
    description: 'Arm vollkommen im Ellbogen strecken, Finger zeigen nach unten. Mit der Gegenhand alle Finger inklusive Daumen sanft zum Körper ziehen.',
    bodyRegion: 'Arme & Handgelenke',
    isUnilateral: true,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-arme-2',
    name: 'Unterarm-Extensoren Quadrupedal',
    description: 'Im Vierfüßlerstand Handrücken auf den Boden legen, Fingerspitzen zeigen zueinander. Ellbogen voll strecken und Gewicht leicht zurückverlagern.',
    bodyRegion: 'Arme & Handgelenke',
    isUnilateral: false,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-arme-3',
    name: 'Triceps & Fascia Brachii Stretch',
    description: 'Arm hinter den Kopf führen, Ellbogen maximal beugen. Mit freier Hand den Ellbogen nach medial-unten ziehen, Kopf drückt gegen den Oberarm.',
    bodyRegion: 'Arme & Handgelenke',
    isUnilateral: true,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-arme-yoga1',
    name: 'Gomukhasana Arme (Kuhgesicht)',
    description: 'Yoga-Asana. Ein Arm von oben hinter den Rücken, der andere von unten. Finger greifen ineinander. Öffnet Trizeps und Rotatorenmanschette.',
    bodyRegion: 'Arme & Handgelenke',
    isUnilateral: true,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-arme-yoga2',
    name: 'Handgelenk-Asana im Fersensitz',
    description: 'Yoga-Asana. Im Fersensitz Hände vor den Knien aufsetzen, Fingerspitzen zeigen zu den Knien. Handflächen komplett flach auf den Boden pressen.',
    bodyRegion: 'Arme & Handgelenke',
    isUnilateral: false,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-arme-yoga3',
    name: 'Bidalasana Daumen-Fokus',
    description: 'Yoga-Asana. Im Vierfüßlerstand Hände nach außen drehen, bis Daumen nach hinten zeigen. Kontrollierte Gewichtsverlagerungen im Kreis durchführen.',
    bodyRegion: 'Arme & Handgelenke',
    isUnilateral: false,
    rating: 3,
    duration: 30
  },
  {
    id: 'ex-arme-adv1',
    name: 'Nervus Radialis Neuro-Gleitübung',
    description: 'Advanced. Arm seitlich tief halten, Handgelenk maximal beugen und nach außen drehen (Pronation). Kopf zur Gegenseite neigen, um den Nerv zu mobilisieren.',
    bodyRegion: 'Arme & Handgelenke',
    isUnilateral: true,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-arme-adv2',
    name: 'Nervus Ulnaris Neuro-Gleitübung',
    description: 'Advanced. Eine „Brille“ mit Daumen und Zeigefinger bilden, Hand umgedreht an das Auge führen (Ellbogen zeigt nach außen-oben). Mobilisiert den N. ulnaris.',
    bodyRegion: 'Arme & Handgelenke',
    isUnilateral: true,
    rating: 5,
    duration: 30
  },

  // ==========================================
  // 7. HÜFTBEUGER & QUADRIZEPS (ANTERIOR) (8 Übungen)
  // ==========================================
  {
    id: 'ex-ant-1',
    name: 'True Couch Stretch',
    description: 'Hinteres Knie komplett bündig an eine Wand setzen. Becken durch Gluteuskontraktion nach hinten kippen (Posterior Tilt). Erst dann aufrichten.',
    bodyRegion: 'Hüftbeuger & Quadrizeps (Anterior)',
    isUnilateral: true,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-ant-2',
    name: 'M. Rectus Femoris Prone',
    description: 'Bauchlage, eine Schlaufe um den Fuß legen und Ferse zum Gesäß ziehen. Handtuch unterm Knie erhöht den Hüft-Auszug des zweigelenkigen Quads.',
    bodyRegion: 'Hüftbeuger & Quadrizeps (Anterior)',
    isUnilateral: true,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-ant-3',
    name: 'Lunge Tensor Fasciae Latae Focus',
    description: 'Ausfallschritt, hinteres Bein leicht nach innen rotieren. Rumpf zur kontralateralen Seite neigen, um den TFL am Beckenkamm aufzudehnen.',
    bodyRegion: 'Hüftbeuger & Quadrizeps (Anterior)',
    isUnilateral: true,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-ant-yoga1',
    name: 'Anjaneyasana (Tiefer Lunge)',
    description: 'Yoga-Asana. Weiter Ausfallschritt, hinteres Knie erden. Arme weit nach oben-hinten strecken und Becken tief nach vorne-unten sinken lassen.',
    bodyRegion: 'Hüftbeuger & Quadrizeps (Anterior)',
    isUnilateral: true,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-ant-yoga2',
    name: 'Supta Virasana (Heldensitz in Rückenlage)',
    description: 'Yoga-Asana. Zwischen den Fersen sitzen und kontrolliert nach hinten ablegen (Unterarme oder flach). Maximale exzentrische Belastung der Vorderkette.',
    bodyRegion: 'Hüftbeuger & Quadrizeps (Anterior)',
    isUnilateral: false,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-ant-yoga3',
    name: 'Eka Pada Dhanurasana (Halber Bogen)',
    description: 'Yoga-Asana. Bauchlage, einen Fuß von außen greifen. Oberschenkel aktiv durch Kraft der Oberschenkelrückseite und Handzug vom Boden abheben.',
    bodyRegion: 'Hüftbeuger & Quadrizeps (Anterior)',
    isUnilateral: true,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-ant-adv1',
    name: 'Psoas 3D-Ketten-Stretch',
    description: 'Advanced. Aus dem tiefen Kniestand den Arm der passiven Seite maximal nach oben-hinten strecken und den Rumpf rotieren. Nimmt die tiefe Frontallinie mit.',
    bodyRegion: 'Hüftbeuger & Quadrizeps (Anterior)',
    isUnilateral: true,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-ant-adv2',
    name: 'Banded Hip Distraction (Anterior)',
    description: 'Advanced. Ein starkes Widerstandsband zieht den Oberschenkelknochen im Ausfallschritt nach vorne-außen, um die vordere Hüftkapsel mechanisch zu befreien.',
    bodyRegion: 'Hüftbeuger & Quadrizeps (Anterior)',
    isUnilateral: true,
    rating: 5,
    duration: 30
  },

  // ==========================================
  // 8. ISCHIOCRURALE MUSKULATUR (HAMSTRINGS) (8 Übungen)
  // ==========================================
  {
    id: 'ex-ham-1',
    name: 'Jefferson Curl',
    description: 'Gestreckte Knie. Wirbel für Wirbel vom Kopf beginnend exzentrisch unter Last nach unten abrollen. Gleichmäßiger Zug über die gesamte Rückseite.',
    bodyRegion: 'Ischiocrurale Muskulatur (Hamstrings)',
    isUnilateral: false,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-ham-2',
    name: 'PNF Hamstring Stretch',
    description: 'Rückenlage, ein Bein senkrecht in einer Schlaufe. 5 Sek. isometrisch gegen Band drücken, in Entspannungsphase passiv weiter in die Beugung führen.',
    bodyRegion: 'Ischiocrurale Muskulatur (Hamstrings)',
    isUnilateral: true,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-ham-3',
    name: 'Semitendinosus Isolation',
    description: 'Sitz, ein Bein vor. Fuß nach außen rotieren (Eversion). Aus dem Hüftgelenk bei absolut gerader LWS nach vorne kippen. Trifft mediale Hamstrings.',
    bodyRegion: 'Ischiocrurale Muskulatur (Hamstrings)',
    isUnilateral: true,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-ham-yoga1',
    name: 'Paschimottanasana (Vorbeuge)',
    description: 'Yoga-Asana. Langsitz, Beine gestreckt, Füße geflext. Mit langem Rücken aus der Hüfte nach vorne klappen. Zielt auf die Muskelbäuche der Hamstrings.',
    bodyRegion: 'Ischiocrurale Muskulatur (Hamstrings)',
    isUnilateral: false,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-ham-yoga2',
    name: 'Ardha Hanumanasana (Halber Spagat)',
    description: 'Yoga-Asana. Kniestand, ein Bein vorne gestreckt auf der Ferse aufgesetzt. Das Becken schiebt nach hinten, der Oberkörper sinkt mit geradem Rücken ab.',
    bodyRegion: 'Ischiocrurale Muskulatur (Hamstrings)',
    isUnilateral: true,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-ham-yoga3',
    name: 'Supta Padangusthasana A',
    description: 'Yoga-Asana. Rückenlage, ein Bein mit einem Gurt senkrecht nach oben ziehen. Das liegende Bein drückt aktiv flach in den Boden (Beckenstabilisation).',
    bodyRegion: 'Ischiocrurale Muskulatur (Hamstrings)',
    isUnilateral: true,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-ham-adv1',
    name: 'Biceps Femoris Isolation (Lateral)',
    description: 'Advanced. Sitz, ein Bein vor. Den Fuß aktiv nach innen rotieren (Inversion). Mit geradem Rücken nach vorne kippen, um den äußeren Hamstring-Kopf zu treffen.',
    bodyRegion: 'Ischiocrurale Muskulatur (Hamstrings)',
    isUnilateral: true,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-ham-adv2',
    name: 'Nervus Ischiadicus Flossing',
    description: 'Advanced. Auf Stuhl sitzen, Rücken rund. Kopf nach hinten dehnend, gleichzeitig Knie strecken und Zehen anziehen. Kopf vor, Fuß locker lassen (Gleitbewegung).',
    bodyRegion: 'Ischiocrurale Muskulatur (Hamstrings)',
    isUnilateral: true,
    rating: 5,
    duration: 30
  },

  // ==========================================
  // 9. HÜFTSTRECKER & GESÄSS (POSTERIOR) (8 Übungen)
  // ==========================================
  {
    id: 'ex-post-1',
    name: '90/90 Pigeon Stretch',
    description: 'Vorderes und hinteres Gelenk exakt im 90°-Winkel ablegen. Den Rumpf mit stolzer Brust über das vordere Schienbein neigen. Isoliert Piriformis.',
    bodyRegion: 'Hüftstrecker & Gesäß (Posterior)',
    isUnilateral: true,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-post-2',
    name: 'Gluteus Medius Wall Cross',
    description: 'Rückenlage, Beine an der Wand. Ein Fuß über das Knie des anderen Beins legen. Das Gesäß aktiv Richtung Boden drücken.',
    bodyRegion: 'Hüftstrecker & Gesäß (Posterior)',
    isUnilateral: true,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-post-3',
    name: 'Anterior Hüftkapsel Mobilisation',
    description: 'Vierfüßlerstand, ein Knie hinter das andere kreuzen. Das Becken kontrolliert nach hinten-außen schieben, um den tiefen Gelenkraum dorsal zu öffnen.',
    bodyRegion: 'Hüftstrecker & Gesäß (Posterior)',
    isUnilateral: true,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-post-yoga1',
    name: 'Eka Pada Rajakapotasana (Yin Taube)',
    description: 'Yoga-Asana. Vorderes Knie außen hinter dem Handgelenk ablegen, hinteres Bein lang gestreckt. Rumpf komplett nach vorne ablegen. Passiver Gluteal-Stretch.',
    bodyRegion: 'Hüftstrecker & Gesäß (Posterior)',
    isUnilateral: true,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-post-yoga2',
    name: 'Ananda Balasana (Happy Baby)',
    description: 'Yoga-Asana. Rückenlage, Knie seitlich am Rumpf vorbei ziehen, Hände greifen die Fußaußenkanten. Fußsohlen zeigen horizontal zur Decke, Kreuzbein erden.',
    bodyRegion: 'Hüftstrecker & Gesäß (Posterior)',
    isUnilateral: false,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-post-yoga3',
    name: 'Gomukhasana Beine (Kuhgesicht-Sitz)',
    description: 'Yoga-Asana. Im Sitz die Knie exakt übereinander stapeln, Füße liegen seitlich neben dem Gesäß. Mit geradem Rücken leicht nach vorne neigen.',
    bodyRegion: 'Hüftstrecker & Gesäß (Posterior)',
    isUnilateral: false,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-post-adv1',
    name: 'Banded Hip Distraction (Posterior)',
    description: 'Advanced. Im Vierfüßlerstand zieht ein starkes Zugband den Oberschenkelknochen nach hinten-unten aus der Pfanne, während das Gesäß nach hinten schiebt.',
    bodyRegion: 'Hüftstrecker & Gesäß (Posterior)',
    isUnilateral: true,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-post-adv2',
    name: 'Gluteus Maximus Extensoren-Kette',
    description: 'Advanced. Aus dem Stand ein Bein weit hinter dem anderen überkreuzen. Das Becken zur Seite des hinteren Beins herausschieben und den Rumpf neigen.',
    bodyRegion: 'Hüftstrecker & Gesäß (Posterior)',
    isUnilateral: true,
    rating: 4,
    duration: 30
  },

  // ==========================================
  // 10. ADDUKTOREN (8 Übungen)
  // ==========================================
  {
    id: 'ex-add-1',
    name: 'Frog Stretch',
    description: 'Knie maximal grätschen, Innenseiten von Knie und Fuß flach am Boden. LWS neutral halten. Das Gesäß sanft nach hinten schieben (Kurze Adduktoren).',
    bodyRegion: 'Adduktoren (Medial)',
    isUnilateral: false,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-add-2',
    name: 'Half-Kneeling Gracilis Stretch',
    description: 'Ein Knie am Boden, das andere seitlich gestreckt aufgestellt (Fußsohle flach). Becken nach hinten-unten bewegen. Isoliert den zweigelenkigen M. gracilis.',
    bodyRegion: 'Adduktoren (Medial)',
    isUnilateral: true,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-add-3',
    name: 'Butterfly PNF Mobilisation',
    description: 'Fußsohlen im Sitz aneinanderziehen. Knie 5 Sek. aktiv gegen Widerstand nach oben drücken, nach Entspannung passiv tiefer absinken lassen.',
    bodyRegion: 'Adduktoren (Medial)',
    isUnilateral: false,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-add-yoga1',
    name: 'Upavistha Konasana (Sitzende Grätsche)',
    description: 'Yoga-Asana. Im Grätschsitz Beine maximal öffnen. Oberschenkel nach außen rotieren und mit geradem Oberkörper nach vorne krabbeln. Dehnt mediale Kette.',
    bodyRegion: 'Adduktoren (Medial)',
    isUnilateral: false,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-add-yoga2',
    name: 'Baddha Konasana (Schuster-Sitz)',
    description: 'Yoga-Asana. Fersen eng an das Schambein ziehen. Die Fußaußenkanten wie ein Buch öffnen, Ellenbogen drücken die Oberschenkel sanft nach unten.',
    bodyRegion: 'Adduktoren (Medial)',
    isUnilateral: false,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-add-yoga3',
    name: 'Mandukasana (Frosch-Asana)',
    description: 'Yoga-Asana. Wie der mechanische Frog Stretch, aber Unterarme flach abgelegt, Bauchdecke entspannt. Fokus liegt auf 2-3 Minuten passivem Sinkenlassen.',
    bodyRegion: 'Adduktoren (Medial)',
    isUnilateral: false,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-add-adv1',
    name: 'Adductor Magnus Cossack Squat Holster',
    description: 'Advanced. Tiefe Kniebeuge auf einem Bein, das andere Bein seitlich gestreckt, Zehen zeigen zur Decke. Becken tief halten und exzentrisch belasten.',
    bodyRegion: 'Adduktoren (Medial)',
    isUnilateral: true,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-add-adv2',
    name: 'Pectineus Kapsel-Sling',
    description: 'Advanced. Ausfallschritt, das vordere Knie weicht kontrolliert nach außen ab (Fußkante rollt), während das Becken diagonal nach vorne-innen schiebt.',
    bodyRegion: 'Adduktoren (Medial)',
    isUnilateral: true,
    rating: 4,
    duration: 30
  },

  // ==========================================
  // 11. UNTERSCHENKEL & FUSS (8 Übungen)
  // ==========================================
  {
    id: 'ex-wade-1',
    name: 'Gastrocnemius Wall Stretch',
    description: 'Ausfallschritt zur Wand. Hinteres Knie vollkommen gestreckt, Ferse fest am Boden. Fuß exakt gerade ausrichten (keine Außenrotation!).',
    bodyRegion: 'Unterschenkel & Fuß (Fundament)',
    isUnilateral: true,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-wade-2',
    name: 'Soleus Deep Squat',
    description: 'In tiefer Hocke das gesamte Körpergewicht einseitig weit nach vorne über die Zehenspitzen schieben. Längt den tiefen M. soleus unter Kniebeugung.',
    bodyRegion: 'Unterschenkel & Fuß (Fundament)',
    isUnilateral: true,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-fuss-1',
    name: 'Plantarfaszien-Zehensitz',
    description: 'Alle Zehen aktiv umknicken, das Gesäß kontrolliert auf den Fersen absetzen. Dehnt die Sehnenplatte der Fußsohle und mobilisiert die Gelenke.',
    bodyRegion: 'Unterschenkel & Fuß (Fundament)',
    isUnilateral: false,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-fuss-yoga1',
    name: 'Adho Mukha Svanasana (Hund abwärts)',
    description: 'Yoga-Asana. Umgekehrtes V. Die Fersen abwechselnd aktiv in den Boden pressen (Walking the Dog). Dehnt die komplette Wade und Achillessehne.',
    bodyRegion: 'Unterschenkel & Fuß (Fundament)',
    isUnilateral: false,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-fuss-yoga2',
    name: 'Vajrasana (Fußrücken-Stretch)',
    description: 'Yoga-Asana. Flacher Fersensitz, Fußrücken liegen plan auf dem Boden auf. Gesäß komplett absetzen, um den M. tibialis anterior (Schienbein) zu dehnen.',
    bodyRegion: 'Unterschenkel & Fuß (Fundament)',
    isUnilateral: false,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-fuss-yoga3',
    name: 'Malasana (Tiefe Hocke)',
    description: 'Yoga-Asana. Breite Kniebeuge, Fersen am Boden, Hände in Gebetshaltung vor der Brust, Ellbogen drücken Knie nach außen. Maximale Sprunggelenks-Dorsalflexion.',
    bodyRegion: 'Unterschenkel & Fuß (Fundament)',
    isUnilateral: false,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-fuss-adv1',
    name: 'Peroneus Lateralis Schlingen-Dehnung',
    description: 'Advanced. Sitz, ein Bein gestreckt. Den Fuß maximal nach innen drehen (Supination) und die Zehen zum Körper ziehen. Dehnt die Wadenaußenseite.',
    bodyRegion: 'Unterschenkel & Fuß (Fundament)',
    isUnilateral: true,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-fuss-adv2',
    name: 'Talus-Gleit-Mobilisation',
    description: 'Advanced. Fuß auf Stufe stellen, ein starkes Widerstandsband zieht das Sprungbein (Talus) nach hinten, während das Knie weit nach vorne schiebt.',
    bodyRegion: 'Unterschenkel & Fuß (Fundament)',
    isUnilateral: true,
    rating: 5,
    duration: 30
  }
];

const defaultPrograms: Program[] = [
  {
    id: 'p-1',
    name: 'Sportwissenschaftlicher Ganzkörper-Reset',
    exercises: [
      { exerciseId: 'ex-bws-2', duration: 60, breakDuration: 15 },
      { exerciseId: 'ex-ant-1', duration: 45, breakDuration: 15 },
      { exerciseId: 'ex-post-yoga1', duration: 60, breakDuration: 15 },
      { exerciseId: 'ex-ham-1', duration: 60, breakDuration: 10 }
    ]
  },
  {
    id: 'p-yoga',
    name: 'Yogische Asana-Mobilität',
    exercises: [
      { exerciseId: 'ex-bws-yoga1', duration: 60, breakDuration: 15 },
      { exerciseId: 'ex-ant-yoga1', duration: 45, breakDuration: 15 },
      { exerciseId: 'ex-add-yoga1', duration: 60, breakDuration: 15 },
      { exerciseId: 'ex-fuss-yoga1', duration: 60, breakDuration: 10 }
    ]
  }
];

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      library: defaultLibrary,
      programs: defaultPrograms,
      history: [],

      addExercise: (exercise) => set((state) => ({
        library: [...state.library, { ...exercise, id: `ex-${Date.now()}` }]
      })),

      updateExercise: (id, updatedData) => set((state) => ({
        library: state.library.map((ex) => (ex.id === id ? { ...ex, ...updatedData } : ex))
      })),

      deleteExercise: (id) => set((state) => ({
        library: state.library.filter((ex) => ex.id !== id),
        programs: state.programs.map((p) => ({
          ...p,
          exercises: p.exercises.filter((pe) => pe.exerciseId !== id)
        }))
      })),

      addProgram: (program) => set((state) => ({
        programs: [...state.programs, { ...program, id: `p-${Date.now()}` }]
      })),

      updateProgram: (id, updatedData) => set((state) => ({
        programs: state.programs.map((p) => (p.id === id ? { ...p, ...updatedData } : p))
      })),

      deleteProgram: (id) => set((state) => ({
        programs: state.programs.filter((p) => p.id !== id)
      })),

      addHistoryEntry: (entry) => set((state) => {
        const safeHistory = state.history || [];
        if (safeHistory.some(h => h.id === entry.id)) {
          return { history: safeHistory };
        }
        return { history: [...safeHistory, entry] };
      }),

      clearHistory: () => set({ history: [] })
    }),
    {
      name: 'stretching-app-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
