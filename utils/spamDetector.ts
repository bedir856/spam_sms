import { SpamKeyword } from '@/types/message';

// Görünmez Unicode karakterlerini ve Türkçe karakterleri normalize eder
function cleanText(text: string): string {
  const cleaned = text.replace(/[\u200B\u200C\u200D\uFEFF\u00AD\u2060]/g, '');
  return cleaned.replace(/\s+/g, ' ').trim();
}

function foldTurkish(text: string): string {
  return text
    .replace(/[çÇ]/g, 'c')
    .replace(/[şŞ]/g, 's')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u')
    .replace(/[öÖ]/g, 'o')
    .replace(/[ıİiI]/g, 'i');
}

function normalizeForMatch(text: string): string {
  return foldTurkish(cleanText(text)).toLowerCase();
}

const SPAM_PATTERNS = [
  // Bahis / Betting
  { pattern: /\b(bahis|bet|betting|bets|iddaa)\b/i, weight: 30, reason: 'Bahis terimi tespit edildi' },
  { pattern: /\b(canl[iı]\s*bahis|kacak\s*bahis|yuksek\s*oran|yüksek\s*oran)\b/i, weight: 30, reason: 'Bahis reklamı tespit edildi' },

  // Casino / Kumar
  { pattern: /\b(casino|kumarhane|slot|jackpot|rulet|blackjack|poker)\b/i, weight: 30, reason: 'Casino/kumar içeriği tespit edildi' },
  { pattern: /\b(cark|çark|aviator|sweet\s*bonanza|gates\s*of\s*olympus)\b/i, weight: 30, reason: 'Kumar oyunu adı tespit edildi' },
  { pattern: /\brtp\b/i, weight: 25, reason: 'RTP spam parametresi tespit edildi' },

  // Bonus / Promosyon
  { pattern: /\b(bonus|freebet|free\s?bet|freespin|free\s?spin)\b/i, weight: 25, reason: 'Bonus teklifi tespit edildi' },
  { pattern: /\b(deneme\s*bonusu|hosgeldin\s*bonusu|hoşgeldin\s*bonusu)\b/i, weight: 35, reason: 'Promosyon spam tespit edildi' },
  { pattern: /\b(cevrimsiz|çevrimsiz|sartsiz|şartsız)\b/i, weight: 25, reason: 'Çevrimsiz bonus vaadi tespit edildi' },
  { pattern: /\b(bedava|bedava\s*donus|bedava\s*dönüş)\b/i, weight: 20, reason: 'Bedava teklifler tespit edildi' },

  // Para/Miktar vaatleri
  { pattern: /(\d[\d.]*\s*TL\s*(bonus|freebet|bedava|ödül|odul|kazan))/i, weight: 25, reason: 'Parasal spam teklifi tespit edildi' },
  { pattern: /(%\d+\s*(bonus|oran|artış|artis|indirim|discount))/i, weight: 20, reason: 'Abartılı yüzde teklifi tespit edildi' },

  // Çekiliş / Piyango
  { pattern: /\b(cekilis|çekiliş|piyango|lottowin|odul\s*kazan|ödül\s*kazandınız)\b/i, weight: 35, reason: 'Sahte çekiliş tespit edildi' },

  // Phishing / Hesap
  { pattern: /\b(hesabınız\s*askıya|hesap\s*kapatıl|dogrulama\s*yap|doğrulama\s*yap)\b/i, weight: 40, reason: 'Phishing girişimi tespit edildi' },
  { pattern: /\b(hemen\s*tikla|hemen\s*tıkla|hemen\s*giris|giris\s*yap|giriş\s*yap|uye\s*ol|üye\s*ol)\b/i, weight: 20, reason: 'Acil yönlendirme tespit edildi' },

  // Site / Domain
  { pattern: /\.(xyz|bet|co|info)\b/i, weight: 20, reason: 'Şüpheli domain tespit edildi' },
  { pattern: /\b(betgaranti|vaycasino|holiganbet|jojobet|betturkey|casinomega|maxwin|meritroyal|tempobet|bets10|casinoroys|kazan365|sheratonbet)\b/i, weight: 40, reason: 'Bilinen bahis sitesi tespit edildi' },

  // Genel
  { pattern: /\bVIP\b/i, weight: 15, reason: 'VIP spam teklifi tespit edildi' },
  { pattern: /\b(kayit\s*ol|kayıt\s*ol|hemen\s*uye)\b/i, weight: 10, reason: 'Kayıt yönlendirmesi tespit edildi' },
  { pattern: /\b(discount|indirim)\b/i, weight: 15, reason: 'İndirim spam teklifi tespit edildi' },
];

export interface SpamAnalysis {
  isSpam: boolean;
  score: number;
  reasons: string[];
  category: 'betting' | 'casino' | 'lottery' | 'phishing' | 'safe';
}

export function analyzeMessage(content: string, keywords: SpamKeyword[]): SpamAnalysis {
  let score = 0;
  const reasons: string[] = [];

  const normalized = normalizeForMatch(content);
  for (const { pattern, weight, reason } of SPAM_PATTERNS) {
    if (pattern.test(content) || pattern.test(normalized)) {
      score += weight;
      reasons.push(reason);
    }
  }

  for (const kw of keywords) {
    if (kw.isActive) {
      const normalizedKw = normalizeForMatch(kw.keyword);
      if (normalized.indexOf(normalizedKw) !== -1) {
        score += 15;
        if (reasons.indexOf(`Anahtar kelime: "${kw.keyword}"`) === -1) {
          reasons.push(`Anahtar kelime: "${kw.keyword}"`);
        }
      }
    }
  }

  score = Math.min(score, 100);

  let category: SpamAnalysis['category'] = 'safe';
  if (score >= 30) {
    if (/casino|slot|rulet|blackjack|poker|jackpot|cark|çark/i.test(content)) {
      category = 'casino';
    } else if (/cekilis|çekiliş|odul|ödül|piyango/i.test(content)) {
      category = 'lottery';
    } else if (/hesabınız\s*askıya|dogrulama|phish/i.test(content)) {
      category = 'phishing';
    } else {
      category = 'betting';
    }
  }

  return {
    isSpam: score >= 30,
    score,
    reasons,
    category,
  };
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    betting: 'Bahis',
    casino: 'Casino',
    lottery: 'Piyango',
    phishing: 'Oltalama',
    safe: 'Güvenli',
  };
  return labels[category] ?? category;
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    betting: 'trophy',
    casino: 'dice',
    lottery: 'ticket',
    phishing: 'fish',
    safe: 'check-circle',
  };
  return icons[category] ?? 'help-circle';
}
