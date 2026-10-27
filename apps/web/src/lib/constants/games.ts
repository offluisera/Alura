export interface SteamGame {
  id: string
  name: string
  genre: string
  image: string
  steamAppId?: number
}

// Catálogo com os jogos mais populares e jogados na Steam (referência SteamDB)
// URLs oficiais de capa via CDN de alta definição da Valve/Steam
export const GAMES_DB: SteamGame[] = [
  { 
    id: "cs2", 
    name: "Counter-Strike 2", 
    genre: "FPS Competitivo", 
    steamAppId: 730,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/730/library_600x900.jpg" 
  },
  { 
    id: "dota2", 
    name: "Dota 2", 
    genre: "MOBA / Estratégia", 
    steamAppId: 570,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/570/library_600x900.jpg" 
  },
  { 
    id: "pubg", 
    name: "PUBG: BATTLEGROUNDS", 
    genre: "Battle Royale", 
    steamAppId: 578080,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/578080/library_600x900.jpg" 
  },
  { 
    id: "gta5", 
    name: "Grand Theft Auto V", 
    genre: "Ação / Mundo Aberto", 
    steamAppId: 271590,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/271590/library_600x900.jpg" 
  },
  { 
    id: "wukong", 
    name: "Black Myth: Wukong", 
    genre: "Ação / Soulslike", 
    steamAppId: 2358720,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/2358720/library_600x900.jpg" 
  },
  { 
    id: "elden", 
    name: "Elden Ring", 
    genre: "RPG / Soulslike", 
    steamAppId: 1245620,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/1245620/library_600x900.jpg" 
  },
  { 
    id: "bg3", 
    name: "Baldur's Gate 3", 
    genre: "RPG de Turnos", 
    steamAppId: 1086940,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/1086940/library_600x900.jpg" 
  },
  { 
    id: "helldivers2", 
    name: "HELLDIVERS 2", 
    genre: "Shooter Cooperativo", 
    steamAppId: 553850,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/553850/library_600x900.jpg" 
  },
  { 
    id: "palworld", 
    name: "Palworld", 
    genre: "Sobrevivência / Crafting", 
    steamAppId: 1623730,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/1623730/library_600x900.jpg" 
  },
  { 
    id: "rust", 
    name: "Rust", 
    genre: "Sobrevivência / PvP", 
    steamAppId: 252490,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/252490/library_600x900.jpg" 
  },
  { 
    id: "r6", 
    name: "Rainbow Six Siege", 
    genre: "FPS Tático", 
    steamAppId: 359550,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/359550/library_600x900.jpg" 
  },
  { 
    id: "apex", 
    name: "Apex Legends", 
    genre: "Battle Royale / FPS", 
    steamAppId: 1172470,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/1172470/library_600x900.jpg" 
  },
  { 
    id: "tf2", 
    name: "Team Fortress 2", 
    genre: "Hero Shooter", 
    steamAppId: 440,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/440/library_600x900.jpg" 
  },
  { 
    id: "deadlock", 
    name: "Deadlock", 
    genre: "MOBA / Hero Shooter", 
    steamAppId: 1422450,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/1422450/library_600x900.jpg" 
  },
  { 
    id: "fc25", 
    name: "EA SPORTS FC 25", 
    genre: "Esportes / Futebol", 
    steamAppId: 2669320,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/2669320/library_600x900.jpg" 
  },
  { 
    id: "fc24", 
    name: "EA SPORTS FC 24", 
    genre: "Esportes / Futebol", 
    steamAppId: 2195250,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/2195250/library_600x900.jpg" 
  },
  { 
    id: "spacemarine2", 
    name: "Warhammer 40,000: Space Marine 2", 
    genre: "Ação / Cooperativo", 
    steamAppId: 2183900,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/2183900/library_600x900.jpg" 
  },
  { 
    id: "rdr2", 
    name: "Red Dead Redemption 2", 
    genre: "Aventura / Faroeste", 
    steamAppId: 1174180,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/1174180/library_600x900.jpg" 
  },
  { 
    id: "cyberpunk", 
    name: "Cyberpunk 2077", 
    genre: "RPG / Ação", 
    steamAppId: 1091500,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/1091500/library_600x900.jpg" 
  },
  { 
    id: "witcher3", 
    name: "The Witcher 3: Wild Hunt", 
    genre: "RPG / Fantasia", 
    steamAppId: 292030,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/292030/library_600x900.jpg" 
  },
  { 
    id: "mhw", 
    name: "Monster Hunter: World", 
    genre: "Ação / Caçada", 
    steamAppId: 582010,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/582010/library_600x900.jpg" 
  },
  { 
    id: "mhwilds", 
    name: "Monster Hunter Wilds", 
    genre: "Ação / RPG", 
    steamAppId: 2246340,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/2246340/library_600x900.jpg" 
  },
  { 
    id: "poe", 
    name: "Path of Exile", 
    genre: "ARPG / Hack and Slash", 
    steamAppId: 238960,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/238960/library_600x900.jpg" 
  },
  { 
    id: "poe2", 
    name: "Path of Exile 2", 
    genre: "ARPG / Fantasia Sombria", 
    steamAppId: 2694490,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/2694490/library_600x900.jpg" 
  },
  { 
    id: "warframe", 
    name: "Warframe", 
    genre: "Ação / Sci-Fi", 
    steamAppId: 230410,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/230410/library_600x900.jpg" 
  },
  { 
    id: "dbd", 
    name: "Dead by Daylight", 
    genre: "Terror Assimétrico", 
    steamAppId: 381210,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/381210/library_600x900.jpg" 
  },
  { 
    id: "overwatch2", 
    name: "Overwatch 2", 
    genre: "Hero Shooter", 
    steamAppId: 2356590,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/2356590/library_600x900.jpg" 
  },
  { 
    id: "stardew", 
    name: "Stardew Valley", 
    genre: "Simulação de Fazenda", 
    steamAppId: 413150,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/413150/library_600x900.jpg" 
  },
  { 
    id: "terraria", 
    name: "Terraria", 
    genre: "Sandbox / Aventura", 
    steamAppId: 105600,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/105600/library_600x900.jpg" 
  },
  { 
    id: "hollow", 
    name: "Hollow Knight", 
    genre: "Metroidvania", 
    steamAppId: 367520,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/367520/library_600x900.jpg" 
  },
  { 
    id: "silksong", 
    name: "Hollow Knight: Silksong", 
    genre: "Metroidvania / Ação", 
    steamAppId: 1030300,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/1030300/library_600x900.jpg" 
  },
  { 
    id: "hades", 
    name: "Hades", 
    genre: "Roguelike / Ação", 
    steamAppId: 1145360,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/1145360/library_600x900.jpg" 
  },
  { 
    id: "hades2", 
    name: "Hades II", 
    genre: "Roguelike / Mitologia", 
    steamAppId: 1145350,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/1145350/library_600x900.jpg" 
  },
  { 
    id: "satisfactory", 
    name: "Satisfactory", 
    genre: "Construção / Automação", 
    steamAppId: 526870,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/526870/library_600x900.jpg" 
  },
  { 
    id: "factorio", 
    name: "Factorio", 
    genre: "Automação / Estratégia", 
    steamAppId: 427520,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/427520/library_600x900.jpg" 
  },
  { 
    id: "manorlords", 
    name: "Manor Lords", 
    genre: "Estratégia Medieval", 
    steamAppId: 1363080,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/1363080/library_600x900.jpg" 
  },
  { 
    id: "forza", 
    name: "Forza Horizon 5", 
    genre: "Corrida / Mundo Aberto", 
    steamAppId: 1551360,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/1551360/library_600x900.jpg" 
  },
  { 
    id: "ets2", 
    name: "Euro Truck Simulator 2", 
    genre: "Simulação de Transporte", 
    steamAppId: 227300,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/227300/library_600x900.jpg" 
  },
  { 
    id: "phasmophobia", 
    name: "Phasmophobia", 
    genre: "Terror Investigativo", 
    steamAppId: 739630,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/739630/library_600x900.jpg" 
  },
  { 
    id: "lethalcompany", 
    name: "Lethal Company", 
    genre: "Terror Cooperativo", 
    steamAppId: 1966720,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/1966720/library_600x900.jpg" 
  },
  { 
    id: "valheim", 
    name: "Valheim", 
    genre: "Sobrevivência Viking", 
    steamAppId: 892970,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/892970/library_600x900.jpg" 
  },
  { 
    id: "rimworld", 
    name: "RimWorld", 
    genre: "Simulação de Colônia", 
    steamAppId: 294100,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/294100/library_600x900.jpg" 
  },
  { 
    id: "dayz", 
    name: "DayZ", 
    genre: "Sobrevivência Pós-Apocalipse", 
    steamAppId: 221100,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/221100/library_600x900.jpg" 
  },
  { 
    id: "seaofthieves", 
    name: "Sea of Thieves", 
    genre: "Aventura Pirata", 
    steamAppId: 1172620,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/1172620/library_600x900.jpg" 
  },
  { 
    id: "sonsoftheforest", 
    name: "Sons of the Forest", 
    genre: "Terror e Sobrevivência", 
    steamAppId: 1326470,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/1326470/library_600x900.jpg" 
  },
  { 
    id: "arkascended", 
    name: "ARK: Survival Ascended", 
    genre: "Sobrevivência / Dinossauros", 
    steamAppId: 2399830,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/2399830/library_600x900.jpg" 
  },
  { 
    id: "tlou", 
    name: "The Last of Us Part I", 
    genre: "Ação / Sobrevivência", 
    steamAppId: 1888930,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/1888930/library_600x900.jpg" 
  },
  { 
    id: "godofwar", 
    name: "God of War", 
    genre: "Ação / Mitologia", 
    steamAppId: 1593500,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/1593500/library_600x900.jpg" 
  },
  { 
    id: "gowragnarok", 
    name: "God of War Ragnarök", 
    genre: "Ação / Aventura", 
    steamAppId: 2322010,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/2322010/library_600x900.jpg" 
  },
  { 
    id: "spiderman", 
    name: "Marvel's Spider-Man Remastered", 
    genre: "Ação / Super-Herói", 
    steamAppId: 1817070,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/1817070/library_600x900.jpg" 
  },
  { 
    id: "destiny2", 
    name: "Destiny 2", 
    genre: "MMO / FPS Sci-Fi", 
    steamAppId: 1085660,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/1085660/library_600x900.jpg" 
  },
  { 
    id: "civ6", 
    name: "Civilization VI", 
    genre: "Estratégia 4X", 
    steamAppId: 289070,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/289070/library_600x900.jpg" 
  },
  { 
    id: "slaythespire", 
    name: "Slay the Spire", 
    genre: "Roguelike Deckbuilder", 
    steamAppId: 588650,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/588650/library_600x900.jpg" 
  },
  { 
    id: "projectzomboid", 
    name: "Project Zomboid", 
    genre: "Sobrevivência Zumbi", 
    steamAppId: 108600,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/108600/library_600x900.jpg" 
  },
  { 
    id: "subnautica", 
    name: "Subnautica", 
    genre: "Exploração Submarina", 
    steamAppId: 264710,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/264710/library_600x900.jpg" 
  },
  { 
    id: "fallout4", 
    name: "Fallout 4", 
    genre: "RPG Pós-Apocalíptico", 
    steamAppId: 377160,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/377160/library_600x900.jpg" 
  },
  { 
    id: "skyrim", 
    name: "The Elder Scrolls V: Skyrim", 
    genre: "RPG Mundo Aberto", 
    steamAppId: 489830,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/489830/library_600x900.jpg" 
  },
  { 
    id: "diablo4", 
    name: "Diablo IV", 
    genre: "ARPG Sombrio", 
    steamAppId: 2344520,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/2344520/library_600x900.jpg" 
  },
  { 
    id: "rocketleague", 
    name: "Rocket League", 
    genre: "Futebol Automobilístico", 
    steamAppId: 252950,
    image: "https://steamcdn-a.akamaihd.net/steam/apps/252950/library_600x900.jpg" 
  }
]
