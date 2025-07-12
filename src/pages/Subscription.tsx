import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Loader2, Crown, Check, Star, Zap, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  recommended?: boolean;
}

const Subscription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  
  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Başlangıç',
      price: 0,
      interval: 'aylık',
      features: [
        'Günlük 5 tahmin hakkı',
        'Temel AI analizleri',
        'Premier League + Süper Lig',
        '7 günlük tahmin geçmişi',
        'Mobil uygulama desteği'
      ]
    },
    {
      id: 'basic',
      name: 'Temel',
      price: 29,
      interval: 'aylık',
      features: [
        'Günlük 50 tahmin hakkı',
        'Tüm ligler (20+ lig)',
        'Gelişmiş AI analizleri',
        '30 günlük tahmin geçmişi',
        'Email bildirimleri',
        'Performans raporları'
      ],
      recommended: true
    },
    {
      id: 'pro',
      name: 'Profesyonel',
      price: 79,
      interval: 'aylık',
      features: [
        'Günlük 200 tahmin hakkı',
        'Tüm premium özellikler',
        'API erişimi',
        'Sınırsız geçmiş',
        'Özel destek kanali',
        'Canlı maç bildirimleri',
        'Özel raporlar ve analizler'
      ]
    }
  ];

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      // Mock subscription process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user plan in mock data
      const updatedUser = {
        ...user,
        plan: planId
      };
      
      toast.success('Abonelik başarıyla güncellendi!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Abonelik hatası:', error);
      toast.error('Abonelik işlemi başarısız oldu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center glass-medium rounded-2xl p-8">
          <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-muted-foreground">Abonelik işlemi gerçekleştiriliyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4">
        {/* Enhanced Header */}
        <div className="py-16 text-center">
          <div className="inline-flex items-center gap-3 glass-medium rounded-2xl p-4 mb-6">
            <div className="glass-strong rounded-xl p-3">
              <Crown className="h-8 w-8 text-yellow-400" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                Abonelik Planları
              </h1>
              <p className="text-muted-foreground text-sm">En uygun planı seçin</p>
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            İhtiyaçlarınıza uygun planı seçin ve AI destekli futbol tahminlerinin keyfini çıkarın
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
            const isRecommended = plan.recommended;
            const icons = [Sparkles, Star, Zap];
            const Icon = icons[index] || Star;
            
            return (
              <Card 
                key={plan.id}
                className={`relative glass-card border-white/20 hover:glass-card-hover transition-all duration-300 group ${
                  isRecommended ? 'lg:scale-110 lg:border-blue-400/50' : ''
                }`}
              >
                {isRecommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="glass-medium rounded-full px-4 py-1 border border-blue-400/50">
                      <span className="text-blue-400 text-sm font-medium flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        En Popüler
                      </span>
                    </div>
                  </div>
                )}
                
                <CardHeader className="text-center pt-8">
                  <div className="glass-medium rounded-2xl p-4 w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-8 w-8 text-blue-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-foreground mb-2">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-center">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-foreground">
                        {plan.price === 0 ? 'Ücretsiz' : `${plan.price} TL`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-foreground/60">/{plan.interval}</span>
                      )}
                    </div>
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="px-6 pb-8">
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-foreground/90">
                        <div className="glass-medium rounded-full p-1 mt-0.5">
                          <Check className="h-3 w-3 text-green-400" />
                        </div>
                        <span className="text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => handleSubscribe(plan.id)}
                    className={`w-full transition-all duration-300 ${
                      isRecommended 
                        ? 'glass-medium border-blue-400/50 text-foreground hover:border-blue-400 hover:scale-105' 
                        : 'glass-button border-white/30 text-foreground/90 hover:text-foreground hover:scale-105'
                    }`}
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : plan.price === 0 ? (
                      'Ücretsiz Başla'
                    ) : (
                      'Hemen Başla'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Enhanced Footer Section */}
        <div className="text-center space-y-8">
          <div className="glass-card border-white/20 rounded-2xl p-8">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="glass-medium rounded-xl p-3 w-12 h-12 mx-auto">
                  <Shield className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="font-semibold text-foreground">Güvenli Ödeme</h3>
                <p className="text-sm text-muted-foreground">256-bit SSL şifreleme ile korumalı</p>
              </div>
              <div className="space-y-2">
                <div className="glass-medium rounded-xl p-3 w-12 h-12 mx-auto">
                  <Loader2 className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="font-semibold text-foreground">Anlık Aktivasyon</h3>
                <p className="text-sm text-muted-foreground">Ödeme sonrası hemen kullanıma başlayın</p>
              </div>
              <div className="space-y-2">
                <div className="glass-medium rounded-xl p-3 w-12 h-12 mx-auto">
                  <Crown className="h-6 w-6 text-yellow-400" />
                </div>
                <h3 className="font-semibold text-foreground">7/24 Destek</h3>
                <p className="text-sm text-muted-foreground">Her zaman yanınızdayız</p>
              </div>
            </div>
          </div>
          
          <div className="text-center text-muted-foreground">
            <p className="mb-2">İptal etmek isterseniz istediğiniz zaman 7/24 destek ekibimizle iletişime geçebilirsiniz.</p>
            <p className="text-sm">Tüm planlar 30 gün para iade garantisi ile korunmaktadır.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;