# ScoreResultsAI - Futbol Analiz ve Tahmin Platformu

![Version](https://img.shields.io/badge/version-2.0-blue)
![License](https://img.shields.io/badge/license-Proprietary-orange)
![Build](https://img.shields.io/badge/build-passing-brightgreen)

**Next-gen futbol analiz platformu** - AI destekli maç tahminleri, gerçek zamanlı istatistikler ve derin analizler

[![Live Demo](https://img.shields.io/badge/demo-canli-sistem-green)](https://scoreresultsai.com)
[![API Docs](https://img.shields.io/badge/docs-API%20Dokümantasyon-blue)](https://docs.scoreresultsai.com)

![Platform Ekran Görüntüsü](./public/images/screenshot-main.png)

## 🚀 Öne Çıkan Özellikler

- 🤖 **Çoklu LLM Entegrasyonu** (DeepSeek R1, GPT-4, Claude 3.5)
- 📊 Gerçek Zamanlı Maç Analizleri
- 💳 Abonelik Yönetim Sistemi (Ücretsiz, Basic, Pro, Premium)
- 🌍 8 Büyük Lig Desteği (Süper Lig, Premier League, La Liga vb.)
- 📱 Responsive Tasarım & PWA Desteği
- 🔄 Otomatik Haftalık Tahmin Üretimi

## 🛠️ Teknik Altyapı

![Mimari Diyagram](./public/images/architecture-diagram.png)

```bash
# Geliştirme Ortamı Kurulumu
npm install
cp .env.example .env.local
npm run dev

# Production Build
npm run build
npm run preview
```

## 🔧 Konfigürasyon

`config.toml` örnek yapılandırma:
```toml
[llm]
default_provider = "deepseek"
api_endpoint = "https://api.deepseek.com/v1"

[subscription]
plans = ["free", "basic", "pro", "premium"]
currency = "TRY"
```

## 📂 Proje Yapısı
```bash
.
├── .env.local
├── .gitignore
├── components.json
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
├── supabase_setup.sql
├── tailwind.config.js
├── TODO.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── database/
│   ├── 001_llm_core_schema.sql
│   ├── schema.sql
│   ├── seed.sql
│   └── triggers.sql
├── public/
│   ├── use.txt
│   ├── images/
│   │   ├── background_hexagonal.png
│   │   ├── bundesliga_pro.png
│   │   ├── card_big_data.png
│   │   ├── card_data_analysis_3d.png
│   │   ├── card_deep_learning.png
│   │   ├── card_fan_engagement.png
│   │   ├── card_financial.png
│   │   ├── card_formation.png
│   │   ├── card_injury_prevention.png
│   │   ├── card_live_analysis.png
│   │   ├── card_match_prediction.png
│   │   ├── card_ml_advanced.png
│   │   ├── card_performance_tracking.png
│   │   ├── card_predictive.png
│   │   ├── card_strategy_chess.png
│   │   ├── card_training_optimization.png
│   │   ├── card_transfer_market.png
│   │   ├── card_video_analytics.png
│   │   ├── champions_league_pro.png
│   │   ├── europa_league_pro.png
│   │   ├── header_main_panoramic.png
│   │   ├── header_minimal.png
│   │   ├── icons_set.png
│   │   ├── la_liga_pro.png
│   │   ├── ligue_1_pro.png
│   │   ├── premier_league_pro.png
│   │   ├── scoreresultsai_logo.svg
│   │   ├── serie_a_pro.png
│   │   ├── super_lig_pro.png
│   │   └── world_cup_pro.png
│   └── videos/
│       └── ai_analytics_demo.mp4
├── src/
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── vite-env.d.ts
│   ├── components/
│   │   ├── ErrorBoundary.tsx
│   │   ├── Layout.tsx
│   │   └── ui/
│   │       ├── accordion.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── alert.tsx
│   │       ├── aspect-ratio.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── breadcrumb.tsx
│   │       ├── button.tsx
│   │       ├── calendar.tsx
│   │       ├── card.tsx
│   │       ├── carousel.tsx
│   │       ├── chart.tsx
│   │       ├── checkbox.tsx
│   │       ├── collapsible.tsx
│   │       ├── command.tsx
│   │       ├── context-menu.tsx
│   │       ├── dialog.tsx
│   │       ├── drawer.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── form.tsx
│   │       ├── hover-card.tsx
│   │       ├── input-otp.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── menubar.tsx
│   │       ├── navigation-menu.tsx
│   │       ├── pagination.tsx
│   │       ├── popover.tsx
│   │       ├── progress.tsx
│   │       ├── radio-group.tsx
│   │       ├── resizable.tsx
│   │       ├── scroll-area.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx
│   │       ├── skeleton.tsx
│   │       ├── slider.tsx
│   │       ├── sonner.tsx
│   │       ├── switch.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       ├── toast.tsx
│   │       ├── toaster.tsx
│   │       ├── toggle-group.tsx
│   │       ├── toggle.tsx
│   │       └── tooltip.tsx
│   ├── constants/
│   │   ├── features.ts
│   │   ├── leagues.ts
│   │   └── matches.ts
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   ├── useAdmin.ts
│   │   └── usePrediction.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── About.tsx
│   │   ├── AdminLLM.tsx
│   │   ├── AdminPanel.tsx
│   │   ├── AIAnalytics.css
│   │   ├── AIAnalytics.tsx
│   │   ├── Auth.tsx
│   │   ├── AuthCallback.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Landing.tsx
│   │   ├── LeagueDetail.tsx
│   │   ├── MatchDetail.tsx
│   │   ├── NotFound.tsx
│   │   └── Subscription.tsx
│   ├── services/
│   │   ├── llmService.ts
│   │   └── subscriptionService.ts
│   └── types/
│       └── index.ts
└── supabase/
    ├── config.toml
    └── functions/
        ├── deno.json
        ├── import_map.json
        ├── _shared/
        │   ├── cors.ts
        │   ├── llmService.ts
        │   └── types.d.ts
        ├── admin-stats/
        │   └── index.ts
        ├── batch-run-manager/
        │   └── index.ts
        ├── data-fetcher/
        │   └── index.ts
        ├── get-match-prediction/
        │   └── index.ts
        ├── llm-model-manager/
        │   └── index.ts
        ├── llm-provider-manager/
        │   └── index.ts
        ├── llm-query-processor/
        │   └── index.ts
        ├── sports-data-fetcher/
        │   └── index.ts
        ├── stripe-webhook/
        │   └── index.ts
        ├── user-limit-check/
        │   └── index.ts
        ├── weekly-cache/
        │   └── index.ts
        └── weekly-prediction-generator/
            └── index.ts
```

## 🌐 Deployment

1. **Vercel**:
```bash
vercel deploy --prod
```

2. **Docker**:
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm ci
CMD ["npm", "run", "start"]
```

## 📄 Lisans
Proje özel lisans ile korunmaktadır. Detaylar için [LİSANS.md](LICENSE.md) dosyasına bakınız.

_© 2025 ScoreResultsAI - Tüm hakları saklıdır_.
